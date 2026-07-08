import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { loadWorkbook, readGlossaryRows } from './parse-workbook.mjs';
import { publicAbbreviations, resolveAbbreviations } from './resolve-abbreviations.mjs';
import { buildParadigmIndex } from './parse-paradigms.mjs';
import { expandParadigm, splitStem } from './expand-entry.mjs';
import { buildWordFamilies } from './build-word-families.mjs';
import { createSlugAssigner } from './slugify.mjs';
import { createValidator } from './validate.mjs';
import { writeReport } from './report.mjs';
import { loadCorrections } from './load-corrections.mjs';
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

function resolveGramCode(gram, code, validator, corrections, context) {
	if (!code) return { code: null, en: null, de: null, deLay: null, roman: null };
	const entry = gram.get(code);
	if (entry) return { code, en: entry.en, de: entry.de, deLay: entry.deLay, roman: entry.roman };

	// Corrections are consulted only when the source sheet genuinely lacks the code — they never
	// override the professor's own labels. First a typo-alias to an existing code (reusing the
	// professor's label), then a brand-new addition (e.g. INTR). See data/corrections.json.
	const aliasTarget = corrections.gramAliasFor(code);
	if (aliasTarget) {
		const target = gram.get(aliasTarget);
		if (target) return { code, en: target.en, de: target.de, deLay: target.deLay, roman: target.roman };
	}

	const corrected = corrections.gramAdditionFor(code);
	if (corrected) return { code, en: corrected.en, de: corrected.de, deLay: null, roman: null };

	validator.error('unresolved-gram-code', `${context}: grammatical abbreviation "${code}" not found in abbrs-gram`, { rowNumber: context });
	return { code, en: null, de: null, deLay: null, roman: null };
}

// Flexion 1 is the nominal gender/number marker (e.g. "M", "F", "M/F", "PL"). Resolve each token
// through abbrs-gram so the site can spell it out ("maskulin", "maskulin/feminin") and show the
// everyday + Roman terms on hover, mirroring how word classes are resolved. Unlike a word class,
// an unresolved token here is not an error (it's a class marker, not a POS) — fall back to raw.
function resolveFlexion1(gram, code) {
	if (!code) return null;
	const tokens = code.split('/').map((tok) => tok.trim()).filter(Boolean);
	if (tokens.length === 0) return null;
	// The Roman gender words themselves contain "/" (e.g. "muršálo/i"), so join those with " · " to
	// keep the compound legible; the short de/en labels read fine joined with "/".
	const perRegister = (key, sep = '/') => tokens.map((tok) => gram.get(tok)?.[key] || tok).join(sep);
	return { code, en: perRegister('en'), de: perRegister('de'), deLay: perRegister('deLay'), roman: perRegister('roman', ' · ') };
}

async function main() {
	const validator = createValidator();
	const corrections = await loadCorrections();
	const workbook = await loadWorkbook(DATA_XLSX_PATH);

	const rows = readGlossaryRows(workbook, validator);
	corrections.applyCellOverrides(rows);
	// A cell override that matched nothing is stale (the professor likely fixed it at the source
	// or rows shifted) — surface it so it gets pruned from corrections.json rather than lingering.
	for (const o of corrections.summary().cellOverrides) {
		if (o.uses === 0) {
			validator.warn('stale-cell-override', `corrections.json cell override for GLOSSARY row ${o.row} field "${o.field}" matched no row — remove it if the source is fixed`);
		}
	}
	const abbreviations = resolveAbbreviations(workbook, validator);
	const paradigmIndex = buildParadigmIndex(workbook, validator);
	const assignSlug = createSlugAssigner();

	const entries = rows.map((row) => {
		const displayInt = splitStem(row.lemmaInt).display;
		let displayDeu = splitStem(row.lemmaDeu).display;
		// DEU is the site's primary displayed orthography — a missing Roman DEU cell is a data gap
		// worth surfacing, but the entry should still render; fall back to the INT spelling.
		if (!displayDeu) {
			validator.warn('missing-deu-lemma', `Row ${row.rowNumber} (${displayInt}): Roman DEU is empty — falling back to INT spelling for display`, { rowNumber: row.rowNumber });
			displayDeu = displayInt;
		}
		const isDerivation = ARROW_MARKERS.includes(row.source1);

		let sourceLabel = null;
			if (row.source1 && !isDerivation) {
				const langInfo = abbreviations.lang.byCode.get(row.source1);
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
					derivationBase: isDerivation ? optionalPair(row.source2Int, row.source2Deu) : null,
					derivationSlug: null, // resolved in buildWordFamilies
				},
			base: null, // resolved in buildWordFamilies
			wordClass: {
					class1: resolveGramCode(abbreviations.gram.byCode, row.wordClass1, validator, corrections, row.rowNumber),
					class2: resolveGramCode(abbreviations.gram.byCode, row.wordClass2, validator, corrections, row.rowNumber),
			},
			flexion: {
				flexion1: row.flexion1,
				flexion1Label: resolveFlexion1(abbreviations.gram.byCode, row.flexion1),
				flexion2: optionalPair(row.flexion2Int, row.flexion2Deu),
				flexion3: optionalPair(row.flexion3Int, row.flexion3Deu),
			},
				paradigm: expandParadigm(row, paradigmIndex, validator, corrections, abbreviations.gram.byCode),
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
	await writeFile(path.join(OUTPUT_DIR, 'abbreviations.json'), JSON.stringify(publicAbbreviations(abbreviations)));

	await writeReport(OUTPUT_DIR, validator, publicEntries.length, corrections);

	// Severity-aware deploy gate: a small long-tail of genuine one-off data issues (pending the
	// professor) is tolerated so the site can ship, but a bad regression (e.g. a shifted column
	// producing hundreds of errors) trips the budget and fails loudly. See data/corrections.json.
	const budget = corrections.acceptedErrorBudget;
	if (validator.errorCount > budget) {
		console.error(`\nBuild data pipeline found ${validator.errorCount} error(s), over the accepted budget of ${budget} — failing.`);
		process.exit(1);
	}
	if (validator.errorCount > 0) {
		console.log(`\n${validator.errorCount} unresolved error(s), within the accepted budget of ${budget}. Listed in warnings.json for the professor's review.`);
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
