import { cellText, getSheet } from './parse-workbook.mjs';
import { SHEETS } from './constants.mjs';

const GRID_ROW_SCAN_LIMIT = 200; // far beyond any real grid (largest observed: V-CONJG at 32 rows)

// Row 1's INT/DEU marker cells are merged across their whole column range, and exceljs
// propagates the merged value to every column in that range — so this must take the FIRST
// matching column (where the block starts), not the last one it sees.
function findLanguageBlockColumns(row1) {
	let intCol = null;
	let deuCol = null;
	row1.eachCell({ includeEmpty: false }, (cell, colNumber) => {
		const text = String(cell.value ?? '').trim();
		if (text === 'INT' && intCol == null) intCol = colNumber;
		if (text === 'DEU' && deuCol == null) deuCol = colNumber;
	});
	return { intCol, deuCol };
}

// Reads a "one column per paradigm key" grid: M-DECL, F-DECL, V-CONJG all share this shape.
// Row 1 marks where the INT and DEU column blocks start; row 2 holds the paradigm key for
// each column within both blocks; rows from `dataStartRow` hold the grid body (read via
// `labelCols`, e.g. ['A','B','C']) until the first row whose label columns are entirely
// empty — the real end of the table (see the F-DECL stray-cell case noted in constants.mjs;
// scanning to the sheet's technical dimensions would pick up disconnected leftover cells).
function readKeyedGrid(sheet, labelCols, dataStartRow, validator, sheetName) {
	const row1 = sheet.getRow(1);
	const { intCol, deuCol } = findLanguageBlockColumns(row1);
	if (!intCol || !deuCol) {
		validator.error('paradigm-sheet-missing-block-markers', `${sheetName}: could not find INT/DEU column markers in row 1`);
		return new Map();
	}

	const row2 = sheet.getRow(2);
	const keyColumns = new Map(); // key -> { intCol, deuCol }
	for (let col = intCol; col < deuCol; col++) {
		const key = cellText(row2, col);
		if (key) keyColumns.set(key, { ...keyColumns.get(key), intCol: col });
	}
	for (let col = deuCol; col < deuCol + GRID_ROW_SCAN_LIMIT; col++) {
		const key = cellText(row2, col);
		if (!key) continue;
		if (!keyColumns.has(key)) {
			validator.warn('paradigm-key-deu-only', `${sheetName}: paradigm key "${key}" found in DEU block but not INT block`);
		}
		keyColumns.set(key, { ...keyColumns.get(key), deuCol: col });
	}

	const grid = new Map();
	for (const key of keyColumns.keys()) grid.set(key, []);

	let reachedEnd = false;
	for (let rowNumber = dataStartRow; rowNumber < dataStartRow + GRID_ROW_SCAN_LIMIT; rowNumber++) {
		const row = sheet.getRow(rowNumber);
		const label = labelCols.map((c) => cellText(row, c));
		if (label.every((v) => v == null)) {
			reachedEnd = true;
			break;
		}
		for (const [key, cols] of keyColumns) {
			grid.get(key).push({
				label,
				int: cols.intCol ? cellText(row, cols.intCol) : null,
				deu: cols.deuCol ? cellText(row, cols.deuCol) : null,
			});
		}
	}
	if (!reachedEnd) {
		validator.warn('paradigm-grid-scan-limit', `${sheetName}: grid did not end within ${GRID_ROW_SCAN_LIMIT} rows — table may be truncated`);
	}

	return grid;
}

// MF-DECL pairs two columns (M, F) per paradigm key instead of one, and has an extra M/F
// sub-header row (row 3) before the data grid begins (row 4).
function readMfDeclGrid(workbook, validator) {
	const sheet = getSheet(workbook, SHEETS.MF_DECL);
	const row1 = sheet.getRow(1);
	const { intCol, deuCol } = findLanguageBlockColumns(row1);
	if (!intCol || !deuCol) {
		validator.error('paradigm-sheet-missing-block-markers', `${SHEETS.MF_DECL}: could not find INT/DEU column markers in row 1`);
		return new Map();
	}
	const row2 = sheet.getRow(2);
	const row3 = sheet.getRow(3);

	// Header cells in row 2 can be merged across the M/F column pair, which makes exceljs
	// report the same key text on BOTH columns of the pair — so row 2 text alone can't tell
	// us where a pair starts. Row 3's M/F sub-header is unmerged and alternates reliably, so
	// use "row 3 says M here" as the authoritative signal for a pair-start column; row 2 only
	// supplies the key name at that column.
	function collectPairs(startCol, endColExclusive) {
		const pairs = new Map(); // key -> { mCol, fCol }
		for (let col = startCol; col < endColExclusive; col++) {
			if (cellText(row3, col) !== 'M') continue;
			const key = cellText(row2, col);
			if (!key) continue;
			const genderNext = cellText(row3, col + 1);
			if (genderNext !== 'F') {
				validator.warn(
					'mf-decl-unexpected-gender-columns',
					`MF-DECL: expected an F column right after M at column ${col} for key "${key}", found "${genderNext}"`,
				);
			}
			pairs.set(key, { mCol: col, fCol: col + 1 });
		}
		return pairs;
	}

	const intPairs = collectPairs(intCol, deuCol);
	const deuPairs = collectPairs(deuCol, deuCol + GRID_ROW_SCAN_LIMIT);
	const allKeys = new Set([...intPairs.keys(), ...deuPairs.keys()]);

	const grid = new Map();
	for (const key of allKeys) grid.set(key, []);

	for (let rowNumber = 4; rowNumber < 4 + GRID_ROW_SCAN_LIMIT; rowNumber++) {
		const row = sheet.getRow(rowNumber);
		const label = ['A', 'B', 'C'].map((c) => cellText(row, c));
		if (label.every((v) => v == null)) break;
		for (const key of allKeys) {
			const ip = intPairs.get(key);
			const dp = deuPairs.get(key);
			grid.get(key).push({
				label,
				intM: ip ? cellText(row, ip.mCol) : null,
				intF: ip ? cellText(row, ip.fCol) : null,
				deuM: dp ? cellText(row, dp.mCol) : null,
				deuF: dp ? cellText(row, dp.fCol) : null,
			});
		}
	}
	return grid;
}

// ADJ-DECL: a single universal paradigm (row 1 literally says "INT = DEU" — adjective endings
// don't differ by orthography), just four case/number rows with M and F columns. No per-key
// lookup: every adjective uses this same table, which is why GLOSSARY's Paradigm column for
// adjectives just contains the literal sheet name "ADJ-DECL", not a specific key.
function readAdjDeclGrid(workbook, validator) {
	const sheet = getSheet(workbook, SHEETS.ADJ_DECL);
	const rows = [];
	for (let rowNumber = 3; rowNumber < 3 + GRID_ROW_SCAN_LIMIT; rowNumber++) {
		const row = sheet.getRow(rowNumber);
		const label = ['A', 'B'].map((c) => cellText(row, c));
		if (label.every((v) => v == null)) break;
		rows.push({ label, m: cellText(row, 'C'), f: cellText(row, 'D') });
	}
	if (rows.length === 0) validator.error('adj-decl-empty', 'ADJ-DECL: no data rows found');
	return { rows };
}

// V-EXIST: a flat, already-complete conjugation of "to be" — not column-keyed like the other
// paradigm sheets. Routed to directly whenever a GLOSSARY row's Paradigm value is "EXIST".
function readVExistTable(workbook, validator) {
	const sheet = getSheet(workbook, SHEETS.V_EXIST);
	const rows = [];
	sheet.eachRow((row, rowNumber) => {
		if (rowNumber === 1) return;
		const roman = cellText(row, 'D');
		if (!roman) return;
		rows.push({
			tense: cellText(row, 'A'),
			person: cellText(row, 'B'),
			polarity: cellText(row, 'C') ?? 'POS',
			roman,
			german: cellText(row, 'E'),
			english: cellText(row, 'F'),
		});
	});
	if (rows.length === 0) validator.error('v-exist-empty', 'V-EXIST: no data rows found');
	return { rows };
}

// Paradigm keys are self-describing about which sheet they belong to (M-DECL keys look like
// NME-*/NMPE-*/NM-IRR-*, F-DECL like NFE-*/NFPE-*/NF-IRR-*, MF-DECL like NMF-*, V-CONJG like
// V-*/V-IRR-*) — confirmed against real data that GLOSSARY's Word class 1/2 columns are NOT
// a reliable signal for paradigm routing (e.g. many common-noun rows have Word class 2 empty
// even though their Paradigm key clearly targets M-DECL or F-DECL; some non-adjective rows
// point straight at "ADJ-DECL"). So routing is done purely by matching the Paradigm value
// against the union of every sheet's known keys, independent of word class.
function buildKeyToSheetIndex(grids, validator) {
	const keyToSheet = new Map();
	function register(key, sheetName) {
		if (keyToSheet.has(key) && keyToSheet.get(key) !== sheetName) {
			validator.warn('paradigm-key-collision', `Paradigm key "${key}" exists in both ${keyToSheet.get(key)} and ${sheetName}`);
		}
		keyToSheet.set(key, sheetName);
	}
	for (const [sheetName, grid] of Object.entries(grids)) {
		for (const key of grid.keys()) register(key, sheetName);
	}
	register('ADJ-DECL', SHEETS.ADJ_DECL);
	register('EXIST', SHEETS.V_EXIST);
	return keyToSheet;
}

export function buildParadigmIndex(workbook, validator) {
	const keyedGrids = {
		[SHEETS.M_DECL]: readKeyedGrid(getSheet(workbook, SHEETS.M_DECL), ['A', 'B', 'C'], 3, validator, SHEETS.M_DECL),
		[SHEETS.F_DECL]: readKeyedGrid(getSheet(workbook, SHEETS.F_DECL), ['A', 'B', 'C'], 3, validator, SHEETS.F_DECL),
		[SHEETS.V_CONJG]: readKeyedGrid(getSheet(workbook, SHEETS.V_CONJG), ['A', 'B', 'C'], 3, validator, SHEETS.V_CONJG),
		[SHEETS.MF_DECL]: readMfDeclGrid(workbook, validator),
	};
	return {
		...keyedGrids,
		adj: readAdjDeclGrid(workbook, validator),
		exist: readVExistTable(workbook, validator),
		keyToSheet: buildKeyToSheetIndex(keyedGrids, validator),
	};
}
