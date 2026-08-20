// @ts-check
import { defineConfig } from 'astro/config';

// User/org GitHub Pages site (bgld-roman-wb.github.io) — serves at domain root, no `base` needed.
// The dictionary content is Burgenland Roman; the interface (UI text, grammar labels, and which
// meaning-gloss is shown) is localized into two app languages. German is the default and serves
// at the root; English serves under /en/. The Roman headword spelling is dictionary content and
// is NOT switched by app language (DEU is primary, INT is secondary).
export default defineConfig({
	site: 'https://bgld-roman-wb.github.io',
	i18n: {
		defaultLocale: 'de',
		locales: ['de', 'en'],
		routing: { prefixDefaultLocale: false },
	},
	// Looking up a word is a burst activity: people follow a search hit, bounce back, try the next
	// candidate. Every one of those is a separate document over the network, so warm the HTML on
	// hover/focus — by the time the click lands the page is already in the browser cache. Entry
	// pages are 13-22KB of static HTML, so prefetching liberally costs almost nothing, and Astro
	// skips it on save-data/slow connections anyway.
	prefetch: {
		prefetchAll: true,
		defaultStrategy: 'hover',
	},
});
