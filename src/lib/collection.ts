import { getCollection } from 'astro:content';
import { getAvailableLetters, letterFor, sortByLemma } from './alphabet';
import { collectWordClasses } from './word-classes';

// Shared getStaticPaths bodies, used by both the German (root) and English (/en) page trees.
// The enumerated params (slugs, letters, word-class codes) are locale-independent — only the URL
// prefix differs, and that comes from where the page file lives, not from these params.

export async function entryStaticPaths() {
	const entries = await getCollection('entries');
	return entries.map((entry) => ({ params: { slug: entry.data.slug }, props: { entry } }));
}

export async function letterStaticPaths() {
	const entries = await getCollection('entries');
	const letters = getAvailableLetters(entries.map((e) => e.data.lemma.int));
	return letters.map((letter) => ({ params: { letter }, props: { letter } }));
}

export async function wordClassStaticPaths() {
	const entries = await getCollection('entries');
	const classes = collectWordClasses(entries);
	return classes.map(({ code }) => ({ params: { wordClass: code }, props: { wordClass: code } }));
}

// Data helpers used by page-body components (which render per-locale but read the same data).
export async function entriesForLetter(letter: string) {
	const entries = await getCollection('entries');
	const letters = getAvailableLetters(entries.map((e) => e.data.lemma.int));
	const matching = sortByLemma(entries.map((e) => e.data).filter((d) => letterFor(d.lemma.int) === letter));
	return { letters, matching };
}

export async function entriesForWordClass(wordClass: string) {
	const entries = await getCollection('entries');
	const classes = collectWordClasses(entries);
	const matching = sortByLemma(entries.map((e) => e.data).filter((d) => d.wordClass.class1.code === wordClass));
	return { classes, matching };
}

export async function allLetters() {
	const entries = await getCollection('entries');
	return getAvailableLetters(entries.map((e) => e.data.lemma.int));
}

export async function entryCount() {
	const entries = await getCollection('entries');
	return entries.length;
}
