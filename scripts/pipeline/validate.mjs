// Collects structured issues while the pipeline runs. Rows with issues still get processed —
// the professor's spreadsheet is human-maintained and not guaranteed internally consistent, so
// a bad row should degrade gracefully (rendered with a "data unavailable" note) rather than
// crash the whole build or vanish silently. `error`-level issues fail the CI build (see
// build-data.mjs); `warning`-level issues are logged but don't block a deploy.
export function createValidator() {
	const issues = [];

	return {
		warn(code, message, context = {}) {
			issues.push({ severity: 'warning', code, message, context });
		},
		error(code, message, context = {}) {
			issues.push({ severity: 'error', code, message, context });
		},
		get issues() {
			return issues;
		},
		get errorCount() {
			return issues.filter((i) => i.severity === 'error').length;
		},
		get warningCount() {
			return issues.filter((i) => i.severity === 'warning').length;
		},
	};
}
