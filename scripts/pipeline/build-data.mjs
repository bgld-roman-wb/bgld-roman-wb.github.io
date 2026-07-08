import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { loadWorkbook, readGlossaryRows } from './parse-workbook.mjs';
import { resolveAbbreviations } from './resolve-abbreviations.mjs';
import { buildParadigmIndex } from './parse-paradigms.mjs';
import { expandParadigm, splitStem } from './expand-entry.mjs';
import { buildWordFamilies } from './build-word-families.mjs';
import { createSlugAssigner } from './slugify.mjs';
import { createValidator } from './validate.mjs';
import { writeReport } from './report.mjs';
import { ARROW_MARKERS, DATA_XLSX_PATH, OUTPUT_DIR } from './constants.mjs';

function optionalPair(int, deu) {
	return int || deu ? { int, deu } : null;
}

function buildGlossSlots(row) {
	const slots = [];
	for (let i = 1; i <= 10; i++) {
		const n = String(i).padStart(2, '0');
		const de = row[`deutsch${n}`];
		const en = row[`english${n}`];
		if (de || en) slots.push({ de, en });
	}
	return slots;
}

function resolveGramCode(gram, code, validator, context) {
	if (!code) return { code: null, en: null, de: null };
	const entry = gram.get(code);
	if (!entry) {
		validator.error('unresolved-gram-code', `${context}: grammatical abbreviation "${code}" not found in abbrs-gram`, { rowNumber: context });
		return { code, en: null, de: null };
	}
	return { code, en: entry.en, de: entry.de };
}

async function main() {
	const validator = createValidator();
	const workbook = await loadWorkbook(DATA_XLSX_PATH);

	const rows = readGlossaryRows(workbook, validator);
	const abbreviations = resolveAbbreviations(workbook, validator);
	const paradigmIndex = buildParadigmIndex(workbook, validator);
	const assignSlug = createSlugAssigner();

	const entries = rows.map((row) => {
		const displayInt = splitStem(row.lemmaInt).display;
		const displayDeu = splitStem(row.lemmaDeu).display;
		const isDerivation = ARROW_MARKERS.includes(row.source1);

		let sourceLabel = null;
		if (row.source1 && !isDerivation) {
			const langInfo = abbreviations.lang.get(row.source1);
			if (!langInfo) {
				validator.error('unresolved-lang-code', `Row ${row.rowNumber} (${displayInt}): Source-1 code "${row.source1}" not found in abbrs-lang`, { rowNumber: row.rowNumber });
			} else {
				sourceLabel = { en: langInfo.en, de: langInfo.de };
			}
		}

		const slug = assignSlug(displayInt);
		const entry = {
			id: slug, // Astro Content Layer file() loader needs a unique `id` per item
			slug,
			lemma: { int: displayInt, deu: displayDeu },
			composition: optionalPair(row.compositionInt, row.compositionDeu),
			variation: optionalPair(row.variationInt, row.variationDeu),
			reconstruction: optionalPair(row.reconstructionInt, row.reconstructionDeu),
			source: {
				code: row.source1,
				isDerivation,
				label: sourceLabel,
				foreignForm: !isDerivation ? optionalPair(row.source2Int, row.source2Deu) : null,
				derivationSlug: null, // resolved in buildWordFamilies
			},
			base: null, // resolved in buildWordFamilies
			wordClass: {
				class1: resolveGramCode(abbreviations.gram, row.wordClass1, validator, row.rowNumber),
				class2: resolveGramCode(abbreviations.gram, row.wordClass2, validator, row.rowNumber),
			},
			flexion: {
				flexion1: row.flexion1,
				flexion2: optionalPair(row.flexion2Int, row.flexion2Deu),
				flexion3: optionalPair(row.flexion3Int, row.flexion3Deu),
			},
			paradigm: expandParadigm(row, paradigmIndex, validator),
			glosses: buildGlossSlots(row),
			domain: row.domain,
			wordFamily: [], // resolved in buildWordFamilies
			raw: row,
		};
		return entry;
	});

	buildWordFamilies(entries, validator);

	const publicEntries = entries.map(({ raw, ...entry }) => entry);

	await mkdir(OUTPUT_DIR, { recursive: true });
	await writeFile(path.join(OUTPUT_DIR, 'entries.json'), JSON.stringify(publicEntries));

	await writeReport(OUTPUT_DIR, validator, publicEntries.length);

	if (validator.errorCount > 0) {
		console.error(`\nBuild data pipeline found ${validator.errorCount} error(s) — failing.`);
		process.exit(1);
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
