import { readFile } from 'node:fs/promises';

const CORRECTIONS_PATH = 'data/corrections.json';

// Loads the build-time corrections overlay. Corrections are applied on top of the parsed
// source data — the professor's dictionary.xlsx is never modified. Each correction tracks a
// usage count so the build report can show its real impact (a fix touching 175 entries is
// worth keeping; one touching zero is stale and should be removed). See data/corrections.json.
export async function loadCorrections(path = CORRECTIONS_PATH) {
	let raw;
	try {
		raw = JSON.parse(await readFile(path, 'utf-8'));
	} catch (err) {
		if (err.code === 'ENOENT') raw = {};
		else throw err;
	}

	const gramAdditions = new Map();
	for (const add of raw.gramAbbreviationAdditions ?? []) {
		gramAdditions.set(add.code, { code: add.code, en: add.en, de: add.de, rationale: add.rationale, uses: 0 });
	}

	const gramAliases = new Map();
	for (const alias of raw.gramAbbreviationAliases ?? []) {
		gramAliases.set(alias.from, { to: alias.to, rationale: alias.rationale, uses: 0 });
	}

	const paradigmKeyAliases = new Map();
	for (const alias of raw.paradigmKeyAliases ?? []) {
		paradigmKeyAliases.set(alias.from, { to: alias.to, rationale: alias.rationale, uses: 0 });
	}

	// Overrides for individual corrupted GLOSSARY cells (row + field -> corrected value), for
	// cases too specific to express as a code alias — e.g. a single cell holding a leaked
	// spreadsheet formula fragment. Keyed by GLOSSARY row number.
	const cellOverrides = (raw.glossaryCellOverrides ?? []).map((o) => ({ ...o, uses: 0 }));

	return {
		acceptedErrorBudget: raw.acceptedErrorBudget ?? 0,
		gramAdditions,
		gramAliases,
		paradigmKeyAliases,
		cellOverrides,

		// A brand-new gram code missing from the sheet (e.g. INTR) — returns its label, counts uses.
		gramAdditionFor(code) {
			const entry = gramAdditions.get(code);
			if (entry) entry.uses++;
			return entry ? { code: entry.code, en: entry.en, de: entry.de } : null;
		},

		// A gram code that's a typo of an existing one (e.g. INDECLold -> INDECL-old) — returns the
		// target code so the caller can reuse the professor's own label. Counts uses.
		gramAliasFor(code) {
			const alias = gramAliases.get(code);
			if (!alias) return null;
			alias.uses++;
			return alias.to;
		},

		// Resolves a paradigm key through any alias, counting uses.
		resolveParadigmKey(key) {
			const alias = paradigmKeyAliases.get(key);
			if (!alias) return key;
			alias.uses++;
			return alias.to;
		},

		// Applies any per-cell overrides to the parsed GLOSSARY rows in place, counting uses.
		// A miss (override targets a row/field that no longer exists in the snapshot) is left for
		// the caller to warn about, since it means the correction has gone stale.
		applyCellOverrides(rows) {
			const byRow = new Map(rows.map((r) => [r.rowNumber, r]));
			for (const override of cellOverrides) {
				const row = byRow.get(override.row);
				if (row && override.field in row) {
					row[override.field] = override.value;
					override.uses++;
				}
			}
		},

		// For the build report.
		summary() {
			return {
				gramAdditions: [...gramAdditions.values()].map((g) => ({ code: g.code, uses: g.uses })),
				gramAliases: [...gramAliases.entries()].map(([from, a]) => ({ from, to: a.to, uses: a.uses })),
				paradigmKeyAliases: [...paradigmKeyAliases.entries()].map(([from, a]) => ({ from, to: a.to, uses: a.uses })),
				cellOverrides: cellOverrides.map((o) => ({ row: o.row, field: o.field, value: o.value, uses: o.uses })),
			};
		},
	};
}
