// Grouping key for the alphabetical browse view. Stress accents (á é í ó ú) are stripped
// (matching the pipeline's own normalization in build-word-families.mjs) so "á" groups under
// "a", but consonant digraphs like č/š/ž are phonemic and get their own letter group.
// NOTE: the professor is the authority on correct Romani collation order (e.g. whether
// digraphs like "ph"/"th"/"kh" should sort as single units) — this is a reasonable default,
// not a linguistic judgment call we're qualified to make. See CLAUDE.md.
const STRESS_MARKS: Record<string, string> = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u' };

const collator = new Intl.Collator('en', { sensitivity: 'base' });

export function letterFor(lemma: string): string {
	const first = lemma.trim().charAt(0).toLowerCase();
	return STRESS_MARKS[first] ?? first;
}

export function getAvailableLetters(lemmas: string[]): string[] {
	const letters = new Set(lemmas.map(letterFor));
	return [...letters].sort(collator.compare);
}

export function sortByLemma<T extends { lemma: { int: string } }>(items: T[]): T[] {
	return [...items].sort((a, b) => collator.compare(a.lemma.int, b.lemma.int));
}
