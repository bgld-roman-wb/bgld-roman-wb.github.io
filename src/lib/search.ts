// Client-side dictionary search. Runs entirely in the browser against /search-index.json (see
// scripts/pipeline/build-search-index.mjs) — no server, no build-time index. Deliberately
// hand-rolled rather than a general-purpose search library: the data is short strings (words and
// short glosses, not documents), so a small purpose-built matcher stays fast, dependency-free,
// and lets "direction" and "exact vs fuzzy" be real structural choices — see the brainstorm in
// conversation for why Pagefind (a whole-page full-text index) couldn't express either of those.
//
// Modeled on how romani.uni-graz.at/romlex/ splits "pattern matching" (their Prefix/Infix/
// Suffix/Fuzzy) from "character matching" (their Ignore Case / Ignore Marks, on by default in
// both modes). We collapse pattern matching to two modes — exact (infix, Romlex's own default)
// and fuzzy (infix, or edit-distance-tolerant when no infix hit exists) — and fold case/diacritics
// away unconditionally in both, so nobody has to type "á" correctly to find "Sabára".

export interface SearchRecord {
	/** slug */
	s: string;
	/** display headword (DEU spelling) */
	d: string;
	/** INT spelling, only present when it differs from d */
	i?: string;
	/** all searchable Roman word forms (lemma + variation, both spellings) */
	r: string[];
	/** German glosses */
	gd: string[];
	/** English glosses */
	ge: string[];
}

export type Direction = 'roman-to-gloss' | 'gloss-to-roman';
export type MatchMode = 'exact' | 'fuzzy';

export interface SearchResult {
	slug: string;
	headword: string;
	subheadword?: string;
	gloss?: string;
}

// Diacritic-fold + casefold, matching Romlex's "Ignore Marks"/"Ignore Case" — always on, in both
// match modes. NFD splits base letters from their combining accents so the accents can be
// stripped via an explicit \u-escaped range (U+0300-U+036F, "Combining Diacritical Marks") rather
// than literal combining characters in the source, which render invisibly/confusingly in editors.
const COMBINING_MARKS = new RegExp('[\\u0300-\\u036f]', 'g');

export function fold(s: string): string {
	return s.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase();
}

// Cheap edit distance with an early-exit ceiling — fuzzy mode only needs to know "is this within
// `max` edits", never the exact distance, and results here are short words/glosses, so a full
// unbounded Levenshtein would be wasted work at index-wide scale.
function withinEditDistance(a: string, b: string, max: number): boolean {
	if (Math.abs(a.length - b.length) > max) return false;
	const prev = new Array(b.length + 1);
	for (let j = 0; j <= b.length; j++) prev[j] = j;
	for (let i = 1; i <= a.length; i++) {
		const cur = [i];
		let rowMin = i;
		for (let j = 1; j <= b.length; j++) {
			const cost = a[i - 1] === b[j - 1] ? 0 : 1;
			cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
			rowMin = Math.min(rowMin, cur[j]);
		}
		if (rowMin > max) return false; // whole row exceeds ceiling — no cell can recover
		prev.splice(0, prev.length, ...cur);
	}
	return prev[b.length] <= max;
}

// Match tiers, best first — used both to decide a hit and to rank it. "field" is one candidate
// string (a word form or a gloss), already fold()ed; so is "query".
function matchScore(field: string, query: string, mode: MatchMode): number | null {
	if (field === query) return 0; // exact whole-field match
	if (field.startsWith(query)) return 1; // prefix
	if (field.includes(query)) return 2; // infix (Romlex's own default behaviour)
	if (mode === 'fuzzy') {
		// Typo tolerance scales with query length so short queries ("kér") don't dissolve into
		// noise — allow 1 edit up to 5 chars, 2 beyond that.
		const maxEdits = query.length <= 5 ? 1 : 2;
		for (const word of field.split(/\s+/)) {
			if (withinEditDistance(word, query, maxEdits)) return 3;
		}
	}
	return null;
}

function bestFieldScore(fields: string[], query: string, mode: MatchMode): number | null {
	let best: number | null = null;
	for (const f of fields) {
		const score = matchScore(fold(f), query, mode);
		if (score !== null && (best === null || score < best)) best = score;
	}
	return best;
}

export interface SearchOptions {
	direction: Direction;
	mode: MatchMode;
	/** which gloss language to search/display when direction is gloss-to-roman */
	glossLang: 'de' | 'en';
	limit?: number;
}

export function search(index: SearchRecord[], rawQuery: string, opts: SearchOptions): SearchResult[] {
	const query = fold(rawQuery.trim());
	if (!query) return [];

	const scored: { record: SearchRecord; score: number }[] = [];
	for (const record of index) {
		const fields = opts.direction === 'roman-to-gloss' ? record.r : opts.glossLang === 'de' ? record.gd : record.ge;
		const score = bestFieldScore(fields, query, opts.mode);
		if (score !== null) scored.push({ record, score });
	}

	scored.sort((a, b) => a.score - b.score || a.record.d.length - b.record.d.length);

	const limit = opts.limit ?? 20;
	return scored.slice(0, limit).map(({ record }) => ({
		slug: record.s,
		headword: record.d,
		subheadword: record.i,
		gloss: (opts.glossLang === 'de' ? record.gd : record.ge)[0],
	}));
}
