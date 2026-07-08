import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

export async function writeReport(outputDir, validator, entryCount) {
	await mkdir(outputDir, { recursive: true });
	const warningsPath = path.join(outputDir, 'warnings.json');
	await writeFile(
		warningsPath,
		JSON.stringify({ generatedAt: new Date().toISOString(), entryCount, issues: validator.issues }, null, 2),
	);

	const { errorCount, warningCount } = validator;
	console.log(`\nParsed ${entryCount} entries.`);
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
