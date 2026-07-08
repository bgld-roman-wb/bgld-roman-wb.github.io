import { SHEETS } from './constants.mjs';

const CONCRETE_CASE_CODES = new Set(['ABL', 'ACC', 'DAT', 'GEN', 'INS/SOC', 'LOC', 'NOM']);
const STRUCTURAL_CASE_CODES = new Set(['OBL', 'RECT']);
const NUMBER_CODES = new Set(['SG', 'PL']);
const TECHNICAL_ONLY_GERMAN_CODES = new Set(['FUT', 'PRS']);
const GERMAN_NUMBER_LABELS = new Map([
	['SG', 'Sg.'],
	['PL', 'Pl.'],
]);
const ENGLISH_NUMBER_LABELS = new Map([
	['SG', 'sg.'],
	['PL', 'pl.'],
]);
const GERMAN_PERSON_LABELS = new Map([
	['1', '1. Pers.'],
	['2', '2. Pers.'],
	['3', '3. Pers.'],
]);
const ENGLISH_PERSON_LABELS = new Map([
	['1', '1st person'],
	['2', '2nd person'],
	['3', '3rd person'],
]);

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

function combineSingleRows(stemInt, stemDeu, rows, gram, labelKind) {
	return rows.map((r) => ({
		label: r.label,
		labelDisplay: buildLabelDisplay(r.label, gram, labelKind),
		int: combine(stemInt, r.int),
		deu: combine(stemDeu, r.deu),
	}));
}

function combineGenderedRows(stemInt, stemDeu, rows, mField, fField, gram, labelKind) {
	return rows.map((r) => ({
		label: r.label,
		labelDisplay: buildLabelDisplay(r.label, gram, labelKind),
		intM: combine(stemInt, r[`int${mField}`] ?? r[mField]),
		intF: combine(stemInt, r[`int${fField}`] ?? r[fField]),
		deuM: combine(stemDeu, r[`deu${mField}`] ?? r[mField]),
		deuF: combine(stemDeu, r[`deu${fField}`] ?? r[fField]),
	}));
}

function displayCodes(label, kind) {
	const codes = label.filter(Boolean);
	const hasConcreteCase = codes.some((code) => CONCRETE_CASE_CODES.has(code));
	return codes.filter((code) => {
		if (hasConcreteCase && STRUCTURAL_CASE_CODES.has(code)) return false;
		if ((kind === 'verb' || kind === 'exist') && code === 'NPFV') return false;
		if (kind === 'exist' && code === 'POS') return false;
		return true;
	});
}

function englishLabel(entry, code) {
	const personNumber = personNumberParts(code);
	if (personNumber) {
		return `${ENGLISH_PERSON_LABELS.get(personNumber.person)} ${ENGLISH_NUMBER_LABELS.get(personNumber.number)}`;
	}
	if (ENGLISH_NUMBER_LABELS.has(code)) return ENGLISH_NUMBER_LABELS.get(code);
	const label = stripCategoryHint(entry?.en ?? code);
	return label.replace(/^./, (first) => first.toLocaleLowerCase('en'));
}

function personNumberParts(code) {
	const match = code.match(/^([123])(SG|PL)$/);
	if (!match) return null;
	return { person: match[1], number: match[2] };
}

function stripCategoryHint(label) {
	return label.replace(/\s+\(([A-Z/]+)\)$/, '');
}

function germanLabel(entry, code) {
	if (!entry) return code;
	const technical = entry.de ? stripCategoryHint(entry.de) : null;
	const personNumber = personNumberParts(code);
	if (personNumber) {
		return `${GERMAN_PERSON_LABELS.get(personNumber.person)} ${GERMAN_NUMBER_LABELS.get(personNumber.number)}`;
	}
	if (NUMBER_CODES.has(code)) return GERMAN_NUMBER_LABELS.get(code);
	if (TECHNICAL_ONLY_GERMAN_CODES.has(code)) {
		return technical ?? entry.deLay ?? code;
	}
	return technical ?? entry.deLay ?? code;
}

function buildLabelDisplay(label, gram, kind) {
	const code = label.filter(Boolean).join(' ');
	const codes = displayCodes(label, kind);
	return {
		code,
		de: codes.map((c) => germanLabel(gram.get(c), c)).join(', '),
		en: codes.map((c) => englishLabel(gram.get(c), c)).join(', '),
	};
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
