import type { CollectionEntry } from 'astro:content';

type Entry = CollectionEntry<'entries'>;

// Buckets the number of "filled" glosses (either the German or English slot set) into a coarse
// readability bucket, per the QA spec.
function glossBucket(entry: Entry): '1' | '2-3' | '4+' {
	const count = entry.data.glosses.filter((g) => g.de || g.en).length;
	if (count <= 1) return '1';
	if (count <= 3) return '2-3';
	return '4+';
}

// A stable string key capturing exactly the structural dimensions called out in the QA spec: word
// class, paradigm kind, presence of the various optional fields, and a gloss-count bucket. Two
// entries with the same signature are considered the same "shape" for rendering QA purposes.
export function shapeSignature(entry: Entry): string {
	const d = entry.data;
	const parts = [
		`class1=${d.wordClass.class1.code ?? '∅'}`,
		// The exact code, not just presence — word class 2 (e.g. adverb subtype: TEMP/LOC/MOD/...)
		// is a small fixed category, and different codes are genuinely different grammatical
		// "mutations" the QA tool exists to surface, not interchangeable within one shape.
		`class2=${d.wordClass.class2.code ?? '∅'}`,
		// Same reasoning for gender (M/F/M-F/PL, etc.) — otherwise e.g. masculine and feminine nouns
		// with identical field presence collapse into one shape and only one gender ever gets shown.
		`gender=${d.flexion.flexion1 ?? '∅'}`,
		`paradigm=${d.paradigm.kind}`,
		`composition=${d.composition !== null}`,
		`variation=${d.variation !== null}`,
		`reconstruction=${d.reconstruction !== null}`,
		`sourceCode=${d.source.code !== null}`,
		`isDerivation=${d.source.isDerivation}`,
		`base=${d.base !== null}`,
		`flexion2=${d.flexion.flexion2 !== null}`,
		`flexion3=${d.flexion.flexion3 !== null}`,
		`wordFamily=${d.wordFamily.length > 0}`,
		`glosses=${glossBucket(entry)}`,
	];
	return parts.join('|');
}

// A short, human-legible label for a shape, built from the same dimensions as the signature —
// good enough to tell groups apart while scrolling a long QA page, not meant to be exhaustive.
export function shapeLabel(entry: Entry): string {
	const d = entry.data;
	const bits: string[] = [];

	const class1 = d.wordClass.class1.code ?? 'no word class';
	bits.push(d.wordClass.class2.code !== null ? `${class1}+${d.wordClass.class2.code}` : class1);

	const gender = d.flexion.flexion1Label?.de ?? d.flexion.flexion1;
	if (gender) bits.push(gender);

	const paradigmNames: Record<string, string> = {
		none: 'no paradigm',
		exist: 'exist-paradigm',
		gendered: 'gendered paradigm',
		noun: 'noun paradigm',
		verb: 'verb paradigm',
		error: 'paradigm ERROR',
	};
	bits.push(paradigmNames[d.paradigm.kind] ?? d.paradigm.kind);

	const flags: string[] = [];
	if (d.composition !== null) flags.push('+composition');
	if (d.variation !== null) flags.push('+variation');
	if (d.reconstruction !== null) flags.push('+reconstruction');
	if (d.source.code !== null) flags.push('+source');
	if (d.source.isDerivation) flags.push('+derivation');
	if (d.base !== null) flags.push('+base');
	if (d.flexion.flexion2 !== null) flags.push('+flexion2');
	if (d.flexion.flexion3 !== null) flags.push('+flexion3');
	if (d.wordFamily.length > 0) flags.push('+wordFamily');
	if (flags.length) bits.push(flags.join(' '));

	bits.push(`${glossBucket(entry)} glosses`);

	return bits.join(' · ');
}

export interface ShapeGroup {
	signature: string;
	label: string;
	representative: Entry;
	count: number;
}

// Groups entries by shape signature and picks one representative per group — the shortest lemma
// (by DEU spelling) encountered, for readability and determinism.
export function groupEntriesByShape(entries: Entry[]): ShapeGroup[] {
	const groups = new Map<string, ShapeGroup>();

	for (const entry of entries) {
		const signature = shapeSignature(entry);
		const existing = groups.get(signature);
		if (!existing) {
			groups.set(signature, {
				signature,
				label: shapeLabel(entry),
				representative: entry,
				count: 1,
			});
			continue;
		}
		existing.count += 1;
		if (entry.data.lemma.deu.length < existing.representative.data.lemma.deu.length) {
			existing.representative = entry;
		}
	}

	return Array.from(groups.values()).sort((a, b) => b.count - a.count);
}
