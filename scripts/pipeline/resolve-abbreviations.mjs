import { cellText, getSheet } from './parse-workbook.mjs';
import { SHEETS } from './constants.mjs';

// abbrs-gram: one row per grammatical abbreviation code (word classes, cases, persons, ...).
// A=code, B=English label, C=German label (D holds a shorter German variant on some rows).
// Confirmed against real data: a handful of codes are reused for two distinct grammatical
// categories (e.g. "LOC" = both "local (ADV)" and "Locative" case; "MOD" = both "Mood" and
// "modal (ADV)") — a plain code->label map would silently let the later row win. Flag it so
// the ambiguity is visible rather than silently resolved one way.
function readGramAbbreviations(workbook, validator) {
	const sheet = getSheet(workbook, SHEETS.ABBRS_GRAM);
	const map = new Map();
	sheet.eachRow((row, rowNumber) => {
		if (rowNumber === 1) return;
		const code = cellText(row, 'A');
		if (!code) return;
		const en = cellText(row, 'B');
		const de = cellText(row, 'C') ?? cellText(row, 'D');
		if (!en && !de) {
			validator.warn('gram-abbr-no-label', `abbrs-gram code "${code}" has no English or German label`, { rowNumber });
		}
		if (map.has(code)) {
			validator.warn(
				'gram-abbr-duplicate-code',
				`abbrs-gram code "${code}" is defined more than once (e.g. "${map.get(code).en}" vs "${en}") — later definition wins`,
				{ rowNumber },
			);
		}
		map.set(code, { code, en, de });
	});
	return map;
}

// abbrs-lang: one row per etymology language code. A=code, C=English name, D=German name.
function readLangAbbreviations(workbook, validator) {
	const sheet = getSheet(workbook, SHEETS.ABBRS_LANG);
	const map = new Map();
	sheet.eachRow((row, rowNumber) => {
		if (rowNumber === 1) return;
		const code = cellText(row, 'A');
		if (!code) return;
		const en = cellText(row, 'C');
		const de = cellText(row, 'D');
		if (!en && !de) {
			validator.warn('lang-abbr-no-label', `abbrs-lang code "${code}" has no English or German label`, { rowNumber });
		}
		map.set(code, { code, en, de });
	});
	return map;
}

// abbrs-lex: two INDEPENDENT lexicographic-abbreviation lists sharing the sheet, not a
// parallel table — row N's German entry (A/B) has no relation to row N's English entry (D/E).
// Confirmed against real data: row 1 is "jmd."/"jemand" (German, "someone") next to
// "os."/"oneself" (English, "oneself") — unrelated abbreviations that happen to share a row.
function readLexAbbreviations(workbook) {
	const sheet = getSheet(workbook, SHEETS.ABBRS_LEX);
	const de = new Map();
	const en = new Map();
	sheet.eachRow((row) => {
		const deCode = cellText(row, 'A');
		const deExpansion = cellText(row, 'B');
		if (deCode && deExpansion) de.set(deCode, deExpansion);
		const enCode = cellText(row, 'D');
		const enExpansion = cellText(row, 'E');
		if (enCode && enExpansion) en.set(enCode, enExpansion);
	});
	return { de, en };
}

export function resolveAbbreviations(workbook, validator) {
	return {
		gram: readGramAbbreviations(workbook, validator),
		lang: readLangAbbreviations(workbook, validator),
		lex: readLexAbbreviations(workbook),
	};
}
