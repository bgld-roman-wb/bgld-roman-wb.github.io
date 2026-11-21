import { SHEETS } from './constants.mjs';

// Paradigm-table terminology, exactly as specified by the professor (2026-11-18_korrekturen.pdf):
// each table row has a GROUP (number for nouns/adjectives, tense for verbs) shown once as a
// row-spanning header, and a ROW label (case, or person code like "1SG" kept verbatim).
const TERMS = {
	SG: { de: 'Singular', en: 'Singular' },
	PL: { de: 'Plural', en: 'Plural' },
	NOM: { de: 'Nominativ', en: 'Nominative' },
	ACC: { de: 'Akkusativ', en: 'Accusative' },
	DAT: { de: 'Dativ', en: 'Dative' },
	ABL: { de: 'Ablativ', en: 'Ablative' },
	LOC: { de: 'Lokativ', en: 'Locative' },
	'INS/SOC': { de: 'Instrumental/Soziativ', en: 'Instrumental/Sociative' },
	GEN: { de: 'Genitiv', en: 'Genitive' },
	OBL: { de: 'Obliquus', en: 'Oblique' },
	PRS: { de: 'Präsens', en: 'Present' },
	FUT: { de: 'Futur', en: 'Future' },
	IPFV: { de: 'Imperfekt', en: 'Imperfect' },
	PFV: { de: 'Perfekt', en: 'Perfect' },
	IRR: { de: 'Irrealis', en: 'Irrealis' },
	// V-EXIST ("to be") only. Not in the PDF; its past forms (somahi …) carry the same -ahi
	// remoteness suffix as the verb Imperfekt, so they share that term.
	PRT: { de: 'Imperfekt', en: 'Imperfect' },
};
const NUMBER_CODES = new Set(['SG', 'PL']);
const STRUCTURAL_CASE_CODES = new Set(['RECT']);

function term(code) {
	return TERMS[code] ?? { de: code, en: code };
}

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

function hasStressMark(value) {
	return /[\u0300\u0301]/u.test(value.normalize('NFD'));
}

function stripStressMarks(value) {
	return value.normalize('NFD').replace(/[\u0300\u0301]/gu, '').normalize('NFC');
}

// Only the final word receives the paradigm suffix. Earlier words in a phrase retain their
// own stress, while the inflected word loses its stem stress when the suffix supplies a new
// one ("Sabár" + "-áke" -> "Sabaráke"). NFD handles stress combined with another diacritic,
// such as ö + acute, without removing the umlaut.
function stripInflectedWordStress(stem) {
	return stem.replace(/\S+$/u, (word) => stripStressMarks(word));
}

// A blank paradigm cell at RECT/NOM/SG marks a zero-ending noun (the spreadsheet's "∅"
// paradigms — NMPE-∅, NME-∅-*, NFPE-∅-*, NFE-∅, NMF-03 — carry no suffix at all, since the
// lemma itself already *is* the nominative singular, e.g. "daj", "paj"). Everywhere else in
// the grid a blank cell means missing data, not zero, so the fallback is scoped to this one slot.
function isNomSgLabel(label) {
	return label[0] === 'RECT' && label[1] === 'NOM' && label[2] === 'SG';
}

// A paradigm cell value starting with "-" is a suffix to append to the stem; anything else
// is a complete word form used verbatim (this is how NM-IRR-*/V-IRR-* columns work). When a
// suffix carries stress, it replaces the stress marked in the stem; an unstressed suffix
// leaves the stem stress in place (structure.pdf: "acél-o" -> "aceléske" vs. "acéle(s)").
function combine(stem, value, allowZeroSuffix) {
	if (value == null) {
		if (!allowZeroSuffix) return null;
		value = '-'; // zero morpheme: stem + '' = stem
	}
	if (value.startsWith('-')) {
		const suffix = value.slice(1);
		const adjustedStem = hasStressMark(suffix) ? stripInflectedWordStress(stem) : stem;
		return adjustedStem + suffix;
	}
	return value;
}

function combineSingleRows(stemInt, stemDeu, rows, gram, labelKind) {
	return rows.map((r) => {
		const zero = isNomSgLabel(r.label);
		return {
			label: r.label,
			labelDisplay: buildLabelDisplay(r.label, gram, labelKind),
			int: combine(stemInt, r.int, zero),
			deu: combine(stemDeu, r.deu, zero),
		};
	});
}

function combineGenderedRows(stemInt, stemDeu, rows, mField, fField, gram, labelKind) {
	return rows.map((r) => {
		const zero = isNomSgLabel(r.label);
		return {
			label: r.label,
			labelDisplay: buildLabelDisplay(r.label, gram, labelKind),
			intM: combine(stemInt, r[`int${mField}`] ?? r[mField], zero),
			intF: combine(stemInt, r[`int${fField}`] ?? r[fField], zero),
			deuM: combine(stemDeu, r[`deu${mField}`] ?? r[mField], zero),
			deuF: combine(stemDeu, r[`deu${fField}`] ?? r[fField], zero),
		};
	});
}

// Splits a paradigm label into its group and row parts (see TERMS above).
//   nouns:      [RECT|OBL, CASE, SG|PL] -> group SG|PL, row CASE
//   adjectives: [NOM|OBL, SG|PL]        -> group SG|PL, row NOM|OBL
//   verbs:      [TENSE, PERSON]         -> group TENSE, row PERSON (e.g. "1SG", verbatim)
//   to be:      [TENSE, PERSON, POS|NEG] -> as verbs, negated rows marked "3SG neg."
function buildLabelDisplay(label, _gram, kind) {
	const codes = label.filter(Boolean);
	const code = codes.join(' ');
	if (kind === 'verb' || kind === 'exist') {
		const [tense, person, polarity] = codes;
		const neg = polarity === 'NEG';
		return {
			code,
			group: term(tense),
			row: { de: neg ? `${person} verneint` : person, en: neg ? `${person} negated` : person },
		};
	}
	const number = codes.find((c) => NUMBER_CODES.has(c));
	const rest = codes.filter((c) => !NUMBER_CODES.has(c) && !STRUCTURAL_CASE_CODES.has(c));
	// Nouns carry OBL plus a concrete case; the concrete case is the row label.
	const rowCode = rest.length > 1 ? rest.filter((c) => c !== 'OBL').join(' ') : rest[0];
	return { code, group: term(number), row: term(rowCode) };
}

// Resolves a GLOSSARY row's Paradigm value into a fully expanded inflection table. Routing is
// by the Paradigm key itself (see buildKeyToSheetIndex in parse-paradigms.mjs) — Word class
// 1/2 are NOT used here, only for display labeling elsewhere.
export function expandParadigm(row, paradigmIndex, validator, corrections, gram) {
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
			labelDisplay: buildLabelDisplay([r.tense, r.person, r.polarity], gram, 'exist'),
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
		const forms = combineGenderedRows(stemInt, stemDeu, paradigmIndex.adj.rows, 'm', 'f', gram, 'gendered');
		return { kind: 'gendered', key: 'ADJ-DECL', sheetName: SHEETS.ADJ_DECL, forms };
	}

	const sheetName = paradigmIndex.keyToSheet.get(paradigm);
	if (!sheetName) {
		validator.error('paradigm-key-not-found', `Row ${row.rowNumber} (${lemmaInt}): Paradigm key "${paradigm}" not found in any paradigm sheet`, { rowNumber: row.rowNumber });
		return { kind: 'error', key: paradigm, sheetName: null, forms: [] };
	}

	if (sheetName === SHEETS.MF_DECL) {
		const rows = paradigmIndex[SHEETS.MF_DECL].get(paradigm);
		const forms = combineGenderedRows(stemInt, stemDeu, rows, 'M', 'F', gram, 'noun');
		return { kind: 'gendered', key: paradigm, sheetName, forms };
	}

	const rows = paradigmIndex[sheetName].get(paradigm);
	const kind = sheetName === SHEETS.V_CONJG ? 'verb' : 'noun';
	const forms = combineSingleRows(stemInt, stemDeu, rows, gram, kind);
	return { kind, key: paradigm, sheetName, forms };
}
