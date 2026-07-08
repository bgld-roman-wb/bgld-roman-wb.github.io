import { SHEETS } from './constants.mjs';

// A lemma like "acél-o" marks, with a plain hyphen (U+002D), where inflectional endings
// attach to the stem. The hyphen itself is never shown — "acél-o" displays as "acélo" (see
// structure.pdf's worked example, which this pipeline reproduces exactly: stem "acél" +
// paradigm suffix "-e(s)" -> "acéle(s)").
export function splitStem(rawLemma) {
	if (!rawLemma) return { stem: '', display: '' };
	const hyphenIndex = rawLemma.indexOf('-');
	if (hyphenIndex === -1) return { stem: rawLemma, display: rawLemma };
	return { stem: rawLemma.slice(0, hyphenIndex), display: rawLemma.replace(/-/g, '') };
}

// The single rule that covers both regular and irregular paradigms, verified against real
// data: a paradigm cell value starting with "-" is a suffix to append to the stem; anything
// else is a complete word form used verbatim (this is how NM-IRR-*/V-IRR-* columns work —
// no need to special-case them by key name).
function combine(stem, value) {
	if (value == null) return null;
	if (value.startsWith('-')) return stem + value.slice(1);
	return value;
}

function combineSingleRows(stemInt, stemDeu, rows) {
	return rows.map((r) => ({ label: r.label, int: combine(stemInt, r.int), deu: combine(stemDeu, r.deu) }));
}

function combineGenderedRows(stemInt, stemDeu, rows, mField, fField) {
	return rows.map((r) => ({
		label: r.label,
		intM: combine(stemInt, r[`int${mField}`] ?? r[mField]),
		intF: combine(stemInt, r[`int${fField}`] ?? r[fField]),
		deuM: combine(stemDeu, r[`deu${mField}`] ?? r[mField]),
		deuF: combine(stemDeu, r[`deu${fField}`] ?? r[fField]),
	}));
}

// Resolves a GLOSSARY row's Paradigm value into a fully expanded inflection table. Routing is
// by the Paradigm key itself (see buildKeyToSheetIndex in parse-paradigms.mjs) — Word class
// 1/2 are NOT used here, only for display labeling elsewhere.
export function expandParadigm(row, paradigmIndex, validator, corrections) {
	const { lemmaInt, lemmaDeu } = row;
	// Route the key through any proposed alias (e.g. the NME-i -> NM-E-i typo fix) before
	// lookup. Corrections never touch the source xlsx; see data/corrections.json.
	const paradigm = corrections.resolveParadigmKey(row.paradigm);

	if (!paradigm) {
		return { kind: 'none', key: null, sheetName: null, forms: [] };
	}

	if (paradigm === 'EXIST') {
		const forms = paradigmIndex.exist.rows.map((r) => ({
			label: [r.tense, r.person, r.polarity],
			int: r.roman,
			deu: r.roman,
			german: r.german,
			english: r.english,
		}));
		return { kind: 'exist', key: 'EXIST', sheetName: SHEETS.V_EXIST, forms };
	}

	const { stem: stemInt } = splitStem(lemmaInt);
	const { stem: stemDeu } = splitStem(lemmaDeu);

	if (paradigm === 'ADJ-DECL') {
		const forms = combineGenderedRows(stemInt, stemDeu, paradigmIndex.adj.rows, 'm', 'f');
		return { kind: 'gendered', key: 'ADJ-DECL', sheetName: SHEETS.ADJ_DECL, forms };
	}

	const sheetName = paradigmIndex.keyToSheet.get(paradigm);
	if (!sheetName) {
		validator.error('paradigm-key-not-found', `Row ${row.rowNumber} (${lemmaInt}): Paradigm key "${paradigm}" not found in any paradigm sheet`, { rowNumber: row.rowNumber });
		return { kind: 'error', key: paradigm, sheetName: null, forms: [] };
	}

	if (sheetName === SHEETS.MF_DECL) {
		const rows = paradigmIndex[SHEETS.MF_DECL].get(paradigm);
		const forms = combineGenderedRows(stemInt, stemDeu, rows, 'M', 'F');
		return { kind: 'gendered', key: paradigm, sheetName, forms };
	}

	const rows = paradigmIndex[sheetName].get(paradigm);
	const forms = combineSingleRows(stemInt, stemDeu, rows);
	return { kind: sheetName === SHEETS.V_CONJG ? 'verb' : 'noun', key: paradigm, sheetName, forms };
}
