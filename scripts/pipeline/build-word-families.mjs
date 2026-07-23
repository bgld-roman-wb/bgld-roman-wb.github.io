import { ARROW_MARKERS } from './constants.mjs';

// Base/derivation links store a normalized citation form, not the exact lemma spelling —
// e.g. lemma "acél-o" (hyphen + stress accent) is pointed to as base "acelo" (no hyphen, no
// accent). Confirmed from real data: stress accents (á é í ó ú) are stripped, but consonant
// diacritics (č š ž ď ť ľ ...) are phonemic and must be preserved — they are NOT stress marks.
// Grave-accented variants included: at least one lemma uses them (e.g. "àngle dikav").
const STRESS_MARKS = {
	á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', Á: 'A', É: 'E', Í: 'I', Ó: 'O', Ú: 'U',
	à: 'a', è: 'e', ì: 'i', ò: 'o', ù: 'u', À: 'A', È: 'E', Ì: 'I', Ò: 'O', Ù: 'U',
};

// Adjectives are cited with both gender endings compactly ("ačál-o/-i" = masc "ačálo" / fem
// "ačáli"), but Base/Source-2 links always reference the plain masculine form ("ačálo") — so
// matching must truncate at the first "/", not just strip hyphens. Some Base values also carry
// a bracketed disambiguation note, written inconsistently with either brackets or parens in real
// data ("anav [1]", "bar (f.)", "adi(ves)") — strip either.
function normalizeForMatching(text) {
	if (!text) return '';
	return text
		.replace(/\s*[[(][^\])]*[\])]\s*/g, '')
		.split('/')[0]
		.replace(/-/g, '')
		.split('')
		.map((ch) => STRESS_MARKS[ch] ?? ch)
		.join('')
		.toLowerCase();
}

// Base/Source-2 sometimes cite a verb in the "-el" citation form standard in Romani linguistics
// (e.g. "duginel"), while this dictionary's own headwords are cited in "-av" (1SG present, e.g.
// "dugínav") — confirmed from real data as a systematic convention difference, not a typo: an
// -el -> -av swap alone resolves the large majority of otherwise-unmatched "-el" references.
function withVerbCitationFallback(normalized) {
	if (!normalized.endsWith('el')) return [normalized];
	return [normalized, normalized.slice(0, -2) + 'av'];
}

// Foreign-language etyma cited via the derivation arrow (e.g. "→ Zentner", "→ Kamille (dial)")
// are not supposed to resolve against the Romani GLOSSARY at all — they're the loan source, not
// a cross-reference. Detected the same way the source data itself signals it: German nouns are
// capitalized, dialect forms are tagged "(dial)", and a few etyma use non-Romani script (e.g.
// Sanskrit ā/ḫ). Heuristic, but low-risk: at worst it just leaves a genuinely bad reference
// unresolved-but-unwarned rather than warned, and the entry still renders either way.
function looksForeign(raw) {
	return /dial\.?/i.test(raw) || /^[A-ZÄÖÜ]/.test(raw) || /[āḫṛśūïĭ]/i.test(raw);
}

// Resolves Base and (when Source-1 is a derivation arrow) Source-2 links against other
// GLOSSARY rows, and builds the reverse word-family index. Two distinct relations — confirmed
// from real data they diverge for foreign-etymology entries (e.g. "áč-av": Source-1=INC,
// Source-2=the Sanskrit-ish etymon "ākṣeti", but Base=the Romani word-family root "ačav").
export function buildWordFamilies(entries, validator) {
	// Base/Source-2 are entered as an INT/DEU pair, but the two spellings of the same reference
	// aren't always equally clean in the source data — confirmed from real data that ~35 rows only
	// resolve via the DEU column even though DEU is the site's primary spelling (see CLAUDE.md).
	// Index both orthographies and try INT first (existing behavior), then DEU as a fallback.
	const byNormalizedLemmaInt = new Map();
	const byNormalizedLemmaDeu = new Map();
	for (const entry of entries) {
		byNormalizedLemmaInt.set(normalizeForMatching(entry.lemma.int), entry);
		byNormalizedLemmaDeu.set(normalizeForMatching(entry.lemma.deu), entry);
	}

	function resolveEntry(rawInt, rawDeu) {
		for (const [raw, byNormalizedLemma] of [[rawInt, byNormalizedLemmaInt], [rawDeu, byNormalizedLemmaDeu]]) {
			if (!raw) continue;
			for (const candidate of withVerbCitationFallback(normalizeForMatching(raw))) {
				const target = byNormalizedLemma.get(candidate);
				if (target) return target;
			}
		}
		return null;
	}

	const familyMembers = new Map(); // base entry slug -> [{slug, lemma, glosses}]

	for (const entry of entries) {
		const isDerivation = ARROW_MARKERS.includes(entry.raw.source1);

		if (entry.raw.baseInt) {
			const target = resolveEntry(entry.raw.baseInt, entry.raw.baseDeu);
			const targetSlug = target?.slug ?? null;
			const isSelf = targetSlug === entry.slug;
			if (!targetSlug && !looksForeign(entry.raw.baseInt)) {
				// Warning, not error: Base often documents a shared etymological root that isn't
				// independently lexicalized in this dictionary (e.g. a loanword root like
				// "arxitekto" underlying several derived entries but not itself a headword). That's
				// expected sparseness in a cross-reference field, not broken data — the entry still
				// renders fine, it just won't show a word-family link. See warnings.json.
				validator.warn('base-link-unresolved', `Row ${entry.raw.rowNumber} (${entry.lemma.int}): Base "${entry.raw.baseInt}" does not match any GLOSSARY lemma`, { rowNumber: entry.raw.rowNumber });
			}
			entry.base = { int: entry.raw.baseInt, deu: entry.raw.baseDeu, slug: targetSlug, isSelf, glosses: target?.glosses ?? [] };
			if (targetSlug && !isSelf) {
				if (!familyMembers.has(targetSlug)) familyMembers.set(targetSlug, []);
				familyMembers.get(targetSlug).push({ slug: entry.slug, lemma: entry.lemma, glosses: entry.glosses });
			}
		} else {
			entry.base = null;
		}

		if (isDerivation && entry.raw.source2Int) {
			const target = resolveEntry(entry.raw.source2Int, entry.raw.source2Deu);
			if (!target && !looksForeign(entry.raw.source2Int)) {
				validator.warn('derivation-link-unresolved', `Row ${entry.raw.rowNumber} (${entry.lemma.int}): Source-2 derivation "${entry.raw.source2Int}" does not match any GLOSSARY lemma`, { rowNumber: entry.raw.rowNumber });
			}
			entry.source.derivationSlug = target?.slug ?? null;
		}
	}

	for (const entry of entries) {
		entry.wordFamily = familyMembers.get(entry.slug) ?? [];
	}

	return entries;
}
