// En dash: the sheet-wide sentinel for "empty / not applicable" — distinct from the plain
// hyphen U+002D, which marks a morpheme boundary inside a lemma (e.g. "acél-o").
export const EMPTY_MARKER = '–'; // –

// Source-1 uses an arrow to mean "derived within the language, see Source-2 for the base".
// The structure.pdf documents "←"; the real workbook uses "→". Accept either.
export const ARROW_MARKERS = ['→', '←']; // → ←

export const DATA_XLSX_PATH = 'data/current/dictionary.xlsx';
export const OUTPUT_DIR = 'src/data/generated';

export const SHEETS = {
	GLOSSARY: 'GLOSSARY',
	ADJ_DECL: 'ADJ-DECL',
	F_DECL: 'F-DECL',
	M_DECL: 'M-DECL',
	MF_DECL: 'MF-DECL',
	V_CONJG: 'V-CONJG',
	V_EXIST: 'V-EXIST',
	ABBRS_GRAM: 'abbrs-gram',
	ABBRS_LANG: 'abbrs-lang',
	ABBRS_LEX: 'abbrs-lex',
};

// GLOSSARY column letters -> field names, in the order documented by structure.pdf.
// The pipeline verifies the sheet's actual row-1 header text against this list before
// trusting these positions (see parse-workbook.mjs) — a mismatch is a hard error.
export const GLOSSARY_COLUMNS = [
	['A', 'ROMAN INT', 'lemmaInt'],
	['B', 'ROMAN DEU', 'lemmaDeu'],
	['C', 'Composition INT', 'compositionInt'],
	['D', 'Composition DEU', 'compositionDeu'],
	['E', 'Variation INT', 'variationInt'],
	['F', 'Variation DEU', 'variationDeu'],
	['G', 'Reconstruction INT', 'reconstructionInt'],
	['H', 'Reconstruction DEU', 'reconstructionDeu'],
	['I', 'Source-1', 'source1'],
	['J', 'Source-2 INT', 'source2Int'],
	['K', 'Source-2 DEU', 'source2Deu'],
	['L', 'Base INT', 'baseInt'],
	['M', 'Base DEU', 'baseDeu'],
	['N', 'Word class 1', 'wordClass1'],
	['O', 'Word class 2', 'wordClass2'],
	['P', 'Flexion 1', 'flexion1'],
	['Q', 'Flexion 2 INT', 'flexion2Int'],
	['R', 'Flexion 2 DEU', 'flexion2Deu'],
	['S', 'Flexion 3 INT', 'flexion3Int'],
	['T', 'Flexion 3 DEU', 'flexion3Deu'],
	['U', 'Paradigm', 'paradigm'],
	['V', 'Domain', 'domain'],
	['W', 'DEUTSCH 01', 'deutsch01'],
	['X', 'DEUTSCH 02', 'deutsch02'],
	['Y', 'DEUTSCH 03', 'deutsch03'],
	['Z', 'DEUTSCH 04', 'deutsch04'],
	['AA', 'DEUTSCH 05', 'deutsch05'],
	['AB', 'DEUTSCH 06', 'deutsch06'],
	['AC', 'DEUTSCH 07', 'deutsch07'],
	['AD', 'DEUTSCH 08', 'deutsch08'],
	['AE', 'DEUTSCH 09', 'deutsch09'],
	['AF', 'DEUTSCH 10', 'deutsch10'],
	['AG', 'ENGLISH 01', 'english01'],
	['AH', 'ENGLISH 02', 'english02'],
	['AI', 'ENGLISH 03', 'english03'],
	['AJ', 'ENGLISH 04', 'english04'],
	['AK', 'ENGLISH 05', 'english05'],
	['AL', 'ENGLISH 06', 'english06'],
	['AM', 'ENGLISH 07', 'english07'],
	['AN', 'ENGLISH 08', 'english08'],
	['AO', 'ENGLISH 09', 'english09'],
	['AP', 'ENGLISH 10', 'english10'],
];
