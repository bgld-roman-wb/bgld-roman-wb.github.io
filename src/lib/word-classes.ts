import type { CollectionEntry } from 'astro:content';

export function collectWordClasses(entries: CollectionEntry<'entries'>[]) {
	const map = new Map<string, string>();
	for (const e of entries) {
		const { code, en } = e.data.wordClass.class1;
		if (code && !map.has(code)) map.set(code, en ?? code);
	}
	return [...map.entries()]
		.map(([code, label]) => ({ code, label }))
		.sort((a, b) => a.label.localeCompare(b.label));
}
