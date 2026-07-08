// Grouping key for the alphabetical browse view, applied to the primary displayed orthography
// (DEU). Stress accents (á é í ó ú) are stripped (matching the pipeline's own normalization in
// build-word-families.mjs) so "á" groups under "a"; any phonemic consonant letters (č/š/ž etc.,
// mostly relevant if this is ever fed INT spellings) keep their own letter group.
// NOTE: the professor is the authority on correct Romani collation order (e.g. whether
// digraphs like "ph"/"th"/"kh" should sort as single units) — this is a reasonable default,
// not a linguistic judgment call we're qualified to make. See CLAUDE.md.
// Includes grave-accented variants — at least one DEU lemma in the data uses à ("àngle dikav").
const STRESS_MARKS: Record<string, string> = {
	á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u',
	à: 'a', è: 'e', ì: 'i', ò: 'o', ù: 'u',
};

const collator = new Intl.Collator('en', { sensitivity: 'base' });

export function letterFor(lemma: string): string {
	const first = lemma.trim().charAt(0).toLowerCase();
	return STRESS_MARKS[first] ?? first;
}

export function getAvailableLetters(lemmas: string[]): string[] {
	const letters = new Set(lemmas.map(letterFor));
	return [...letters].sort(collator.compare);
}

// Sorts by the primary displayed orthography (DEU) so list order matches what users read.
export function sortByLemma<T extends { lemma: { int: string; deu: string } }>(items: T[]): T[] {
	return [...items].sort((a, b) => collator.compare(a.lemma.deu, b.lemma.deu));
}
