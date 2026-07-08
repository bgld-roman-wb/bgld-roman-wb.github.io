import type { CollectionEntry } from 'astro:content';
import { labelFor, type Locale } from '../i18n/ui';

// Distinct Word class 1 codes present in the data, each with its resolved German + English labels.
export function collectWordClasses(entries: CollectionEntry<'entries'>[]) {
	const map = new Map<string, { en: string | null; de: string | null }>();
	for (const e of entries) {
		const { code, en, de } = e.data.wordClass.class1;
		if (code && !map.has(code)) map.set(code, { en, de });
	}
	return [...map.entries()].map(([code, label]) => ({ code, en: label.en, de: label.de }));
}

// Localizes + sorts the word-class list for a given app language.
export function localizedWordClasses(
	classes: { code: string; en: string | null; de: string | null }[],
	lang: Locale,
) {
	return classes
		.map((c) => ({ code: c.code, label: labelFor(c, lang) ?? c.code }))
		.sort((a, b) => a.label.localeCompare(b.label));
}
