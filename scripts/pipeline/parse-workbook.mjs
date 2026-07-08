import ExcelJS from 'exceljs';
import { DATA_XLSX_PATH, EMPTY_MARKER, GLOSSARY_COLUMNS, SHEETS } from './constants.mjs';

export async function loadWorkbook(path = DATA_XLSX_PATH) {
	const workbook = new ExcelJS.Workbook();
	await workbook.xlsx.readFile(path);
	return workbook;
}

export function getSheet(workbook, name) {
	const sheet = workbook.getWorksheet(name);
	if (!sheet) throw new Error(`Expected sheet "${name}" not found in workbook`);
	return sheet;
}

// Reads a cell's display text, normalizing the empty-marker sentinel to null.
// Trims whitespace; returns null for genuinely blank cells too.
export function cellText(row, col) {
	const cell = row.getCell(col);
	const value = cell.value;
	if (value == null) return null;
	// exceljs can hand back rich-text objects for formatted cells; flatten to plain text.
	const text = typeof value === 'object' && 'richText' in value
		? value.richText.map((r) => r.text).join('')
		: String(value);
	const trimmed = text.trim();
	if (trimmed === '' || trimmed === EMPTY_MARKER) return null;
	return trimmed;
}

// Reads GLOSSARY into plain objects keyed by the field names in GLOSSARY_COLUMNS.
// Validates the header row text first — column *positions* are load-bearing for the entire
// pipeline, so a header mismatch is a hard error, not a silent best-effort column guess.
export function readGlossaryRows(workbook, validator) {
	const sheet = getSheet(workbook, SHEETS.GLOSSARY);
	const headerRow = sheet.getRow(1);

	for (const [col, expectedHeader] of GLOSSARY_COLUMNS) {
		const actual = cellText(headerRow, col);
		if (actual !== expectedHeader) {
			throw new Error(
				`GLOSSARY header mismatch at column ${col}: expected "${expectedHeader}", found "${actual}". ` +
				`The column layout may have changed in this snapshot — re-check against structure.pdf before proceeding.`,
			);
		}
	}

	const rows = [];
	sheet.eachRow((row, rowNumber) => {
		if (rowNumber === 1) return; // header
		const lemmaInt = cellText(row, 'A');
		if (!lemmaInt) return; // skip fully blank rows
		const record = { rowNumber };
		for (const [col, , field] of GLOSSARY_COLUMNS) {
			record[field] = cellText(row, col);
		}
		rows.push(record);
	});

	return rows;
}
