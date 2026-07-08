import { ARROW_MARKERS } from './constants.mjs';

// Base/derivation links store a normalized citation form, not the exact lemma spelling —
// e.g. lemma "acél-o" (hyphen + stress accent) is pointed to as base "acelo" (no hyphen, no
// accent). Confirmed from real data: stress accents (á é í ó ú) are stripped, but consonant
// diacritics (č š ž ď ť ľ ...) are phonemic and must be preserved — they are NOT stress marks.
const STRESS_MARKS = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', Á: 'A', É: 'E', Í: 'I', Ó: 'O', Ú: 'U' };

// Adjectives are cited with both gender endings compactly ("ačál-o/-i" = masc "ačálo" / fem
// "ačáli"), but Base/Source-2 links always reference the plain masculine form ("ačálo") — so
// matching must truncate at the first "/", not just strip hyphens. Some Base values also carry
// a bracketed disambiguation note ("anav [1]", "bar [f.]") that isn't part of the lemma itself.
function normalizeForMatching(text) {
	if (!text) return '';
	return text
		.replace(/\s*\[[^\]]*\]\s*/g, '')
		.split('/')[0]
		.replace(/-/g, '')
		.split('')
		.map((ch) => STRESS_MARKS[ch] ?? ch)
		.join('')
		.toLowerCase();
}

// Resolves Base and (when Source-1 is a derivation arrow) Source-2 links against other
// GLOSSARY rows, and builds the reverse word-family index. Two distinct relations — confirmed
// from real data they diverge for foreign-etymology entries (e.g. "áč-av": Source-1=INC,
// Source-2=the Sanskrit-ish etymon "ākṣeti", but Base=the Romani word-family root "ačav").
export function buildWordFamilies(entries, validator) {
	const byNormalizedLemma = new Map(); // normalized lemma -> entry
	for (const entry of entries) {
		byNormalizedLemma.set(normalizeForMatching(entry.lemma.int), entry);
	}

	function resolveLink(rawInt) {
		if (!rawInt) return null;
		const target = byNormalizedLemma.get(normalizeForMatching(rawInt));
		return target ? target.slug : null;
	}

	const familyMembers = new Map(); // base entry slug -> [{slug, lemma}]

	for (const entry of entries) {
		const isDerivation = ARROW_MARKERS.includes(entry.raw.source1);

		if (entry.raw.baseInt) {
			const targetSlug = resolveLink(entry.raw.baseInt);
			const isSelf = targetSlug === entry.slug;
			if (!targetSlug) {
				// Warning, not error: Base often documents a shared etymological root that isn't
				// independently lexicalized in this dictionary (e.g. a verb cited in the "-el"
				// convention standard in Romani linguistics, or a loanword root like "arxitekto"
				// underlying several derived entries but not itself a headword). That's expected
				// sparseness in a cross-reference field, not broken data — the entry still renders
				// fine, it just won't show a word-family link. See warnings.json for the full list.
				validator.warn('base-link-unresolved', `Row ${entry.raw.rowNumber} (${entry.lemma.int}): Base "${entry.raw.baseInt}" does not match any GLOSSARY lemma`, { rowNumber: entry.raw.rowNumber });
			}
			entry.base = { int: entry.raw.baseInt, deu: entry.raw.baseDeu, slug: targetSlug, isSelf };
			if (targetSlug && !isSelf) {
				if (!familyMembers.has(targetSlug)) familyMembers.set(targetSlug, []);
				familyMembers.get(targetSlug).push({ slug: entry.slug, lemma: entry.lemma });
			}
		} else {
			entry.base = null;
		}

		if (isDerivation && entry.raw.source2Int) {
			const derivationSlug = resolveLink(entry.raw.source2Int);
			if (!derivationSlug) {
				validator.warn('derivation-link-unresolved', `Row ${entry.raw.rowNumber} (${entry.lemma.int}): Source-2 derivation "${entry.raw.source2Int}" does not match any GLOSSARY lemma`, { rowNumber: entry.raw.rowNumber });
			}
			entry.source.derivationSlug = derivationSlug;
		}
	}

	for (const entry of entries) {
		entry.wordFamily = familyMembers.get(entry.slug) ?? [];
	}

	return entries;
}
