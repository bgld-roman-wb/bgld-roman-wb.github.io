import { cellText, getSheet } from './parse-workbook.mjs';
import { SHEETS } from './constants.mjs';

// abbrs-gram: one row per grammatical abbreviation code (word classes, cases, persons, ...).
// A=code, B=English label, C=German technical label, D=reader-friendly German label,
// E=Roman label. Column D is deliberately kept separate: it is useful for public UI copy, but
// should not replace the professor's technical term everywhere.
// Confirmed against real data: a handful of codes are reused for two distinct grammatical
// categories (e.g. "LOC" = both "local (ADV)" and "Locative" case; "MOD" = both "Mood" and
// "modal (ADV)") — a plain code->label map would silently let the later row win. Flag it so
// the ambiguity is visible rather than silently resolved one way.
function readGramAbbreviations(workbook, validator) {
	const sheet = getSheet(workbook, SHEETS.ABBRS_GRAM);
	const byCode = new Map();
	const rows = [];
	sheet.eachRow((row, rowNumber) => {
		if (rowNumber === 1) return;
		const code = cellText(row, 'A');
		if (!code) return;
		const en = cellText(row, 'B');
		const de = cellText(row, 'C') ?? cellText(row, 'D');
		const deLay = cellText(row, 'D');
		const roman = cellText(row, 'E');
		if (!en && !de) {
			validator.warn('gram-abbr-no-label', `abbrs-gram code "${code}" has no English or German label`, { rowNumber });
		}
		if (byCode.has(code)) {
			validator.warn(
				'gram-abbr-duplicate-code',
				`abbrs-gram code "${code}" is defined more than once (e.g. "${byCode.get(code).en}" vs "${en}") — later definition wins`,
				{ rowNumber },
			);
		}
		const entry = { code, en, de, deLay, roman };
		rows.push(entry);
		byCode.set(code, entry);
	});
	return { byCode, rows };
}

// abbrs-lang: one row per etymology language code. A=code, B=ISO source, C=English name,
// D=German name, E=Roman name.
function readLangAbbreviations(workbook, validator) {
	const sheet = getSheet(workbook, SHEETS.ABBRS_LANG);
	const byCode = new Map();
	const rows = [];
	sheet.eachRow((row, rowNumber) => {
		if (rowNumber === 1) return;
		const code = cellText(row, 'A');
		if (!code) return;
		const iso = cellText(row, 'B');
		const en = cellText(row, 'C');
		const de = cellText(row, 'D');
		const roman = cellText(row, 'E');
		if (!en && !de) {
			validator.warn('lang-abbr-no-label', `abbrs-lang code "${code}" has no English or German label`, { rowNumber });
		}
		const entry = { code, iso, en, de, roman };
		rows.push(entry);
		byCode.set(code, entry);
	});
	return { byCode, rows };
}

// abbrs-lex: two INDEPENDENT lexicographic-abbreviation lists sharing the sheet, not a
// parallel table — row N's German entry (A/B) has no relation to row N's English entry (D/E).
// Confirmed against real data: row 1 is "jmd."/"jemand" (German, "someone") next to
// "os."/"oneself" (English, "oneself") — unrelated abbreviations that happen to share a row.
function readLexAbbreviations(workbook) {
	const sheet = getSheet(workbook, SHEETS.ABBRS_LEX);
	const de = new Map();
	const en = new Map();
	const deRows = [];
	const enRows = [];
	sheet.eachRow((row) => {
		const deCode = cellText(row, 'A');
		const deExpansion = cellText(row, 'B');
		if (deCode && deExpansion) {
			de.set(deCode, deExpansion);
			deRows.push({ code: deCode, expansion: deExpansion });
		}
		const enCode = cellText(row, 'D');
		const enExpansion = cellText(row, 'E');
		if (enCode && enExpansion) {
			en.set(enCode, enExpansion);
			enRows.push({ code: enCode, expansion: enExpansion });
		}
	});
	return { de, en, deRows, enRows };
}

export function resolveAbbreviations(workbook, validator) {
	return {
		gram: readGramAbbreviations(workbook, validator),
		lang: readLangAbbreviations(workbook, validator),
		lex: readLexAbbreviations(workbook),
	};
}

export function publicAbbreviations(abbreviations) {
	return {
		gram: abbreviations.gram.rows,
		lang: abbreviations.lang.rows,
		lex: {
			de: abbreviations.lex.deRows,
			en: abbreviations.lex.enRows,
		},
	};
}
