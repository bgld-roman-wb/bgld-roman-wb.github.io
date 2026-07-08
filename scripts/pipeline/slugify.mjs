// URL-safe slug derived from the lemma's display form (diacritics transliterated away for
// clean URLs — the actual diacritics are preserved in the entry's displayed text, this is
// only the identifier). No stable ID exists in the source data, so slugs can shift if the
// professor edits a lemma's spelling in a later snapshot — see CLAUDE.md open question.
function toAsciiSlug(text) {
	const ascii = text
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '') // combining diacritical marks
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
	return ascii || 'entry';
}

// Homograph disambiguation: first occurrence of a spelling gets the bare slug, later ones
// get -2, -3, ... in the order they're processed (GLOSSARY row order).
export function createSlugAssigner() {
	const counts = new Map();
	return function assignSlug(displayLemma) {
		const base = toAsciiSlug(displayLemma);
		const count = (counts.get(base) ?? 0) + 1;
		counts.set(base, count);
		return count === 1 ? base : `${base}-${count}`;
	};
}
