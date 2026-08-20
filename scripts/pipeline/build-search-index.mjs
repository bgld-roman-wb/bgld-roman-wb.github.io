// A slim, search-only projection of the entry data, shipped to the browser as a static asset
// (public/search-index.json) and queried entirely client-side — see src/lib/search.ts for the
// matching logic and src/components/site/SearchBox.astro for the UI. Kept separate from
// entries.json (which carries full paradigms/word-family data and is far too heavy to ship
// wholesale) so the client only downloads what search actually needs.
//
// Field names are single letters to keep the shipped JSON small across ~9,900 entries.
function dedupe(values) {
	return [...new Set(values.filter(Boolean))];
}

export function buildSearchIndex(entries) {
	return entries.map((entry) => {
		const roman = dedupe([
			entry.lemma.deu,
			entry.lemma.int,
			entry.variation?.deu,
			entry.variation?.int,
		]);
		const glossesDe = dedupe(entry.glosses.map((g) => g.de));
		const glossesEn = dedupe(entry.glosses.map((g) => g.en));
		return {
			s: entry.slug,
			d: entry.lemma.deu,
			i: entry.lemma.int !== entry.lemma.deu ? entry.lemma.int : undefined,
			r: roman,
			gd: glossesDe,
			ge: glossesEn,
			// Word class 1 code (e.g. "N", "V", "ADJ") — powers the power-user word-class filter
			// in SearchBox.astro. The filter's own option list comes from lib/word-classes.ts
			// (site-wide, resolved+localized), not from this file.
			wc: entry.wordClass.class1.code || undefined,
		};
	});
}
