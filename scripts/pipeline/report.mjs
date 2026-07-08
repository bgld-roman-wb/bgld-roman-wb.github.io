import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

export async function writeReport(outputDir, validator, entryCount, corrections) {
	await mkdir(outputDir, { recursive: true });
	const correctionSummary = corrections?.summary?.() ?? null;
	const warningsPath = path.join(outputDir, 'warnings.json');
	await writeFile(
		warningsPath,
		JSON.stringify(
			{ generatedAt: new Date().toISOString(), entryCount, corrections: correctionSummary, issues: validator.issues },
			null,
			2,
		),
	);

	const { errorCount, warningCount } = validator;
	console.log(`\nParsed ${entryCount} entries.`);

	if (correctionSummary) {
		const applied = [
			...correctionSummary.gramAdditions.map((g) => `gram "${g.code}" (${g.uses} entries)`),
			...correctionSummary.gramAliases.map((a) => `gram ${a.from}→${a.to} (${a.uses} entries)`),
			...correctionSummary.paradigmKeyAliases.map((a) => `paradigm ${a.from}→${a.to} (${a.uses} entries)`),
			...correctionSummary.cellOverrides.map((o) => `cell row ${o.row}.${o.field}="${o.value}" (${o.uses} entries)`),
		];
		if (applied.length > 0) {
			console.log(`Corrections applied (source xlsx untouched): ${applied.join(', ')}.`);
		}
	}

	console.log(`Validation: ${errorCount} error(s), ${warningCount} warning(s).`);

	if (validator.issues.length > 0) {
		console.log('\nIssues:');
		for (const issue of validator.issues) {
			const prefix = issue.severity === 'error' ? '  [ERROR]' : '  [warn] ';
			console.log(`${prefix} ${issue.code}: ${issue.message}`);
		}
	}
	console.log(`\nFull report written to ${warningsPath}`);
}
