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
	const letters = getAvailableLetters(entries.map((e) => e.data.lemma.deu));
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
	const letters = getAvailableLetters(entries.map((e) => e.data.lemma.deu));
	const matching = sortByLemma(entries.map((e) => e.data).filter((d) => letterFor(d.lemma.deu) === letter));
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
	return getAvailableLetters(entries.map((e) => e.data.lemma.deu));
}

export async function entryCount() {
	const entries = await getCollection('entries');
	return entries.length;
}

// Data for the landing page: counts plus a curated word-of-the-day pool. The pool favours
// core vocabulary (a word that is its own word-family base), single words with both glosses and
// a real paradigm, sampled evenly across the alphabet so consecutive days don't cluster.
export async function homeData() {
	const entries = await getCollection('entries');
	const familyCount = new Set(entries.map((e) => e.data.base?.slug).filter(Boolean)).size;

	const candidates = entries
		.map((e) => e.data)
		.filter(
			(d) =>
				d.base?.isSelf &&
				!d.lemma.deu.includes(' ') &&
				d.lemma.deu.length <= 11 &&
				d.glosses[0]?.de &&
				d.glosses[0]?.en &&
				d.paradigm.kind !== 'none' &&
				d.paradigm.kind !== 'error',
		)
		.sort((a, b) => a.slug.localeCompare(b.slug));
	const step = Math.max(1, Math.floor(candidates.length / 120));
	const pool = candidates.filter((_, i) => i % step === 0);

	return { count: entries.length, familyCount, pool };
}
