// @ts-check
import { defineConfig } from 'astro/config';

// User/org GitHub Pages site (bgld-roman-wb.github.io) — serves at domain root, no `base` needed.
// The dictionary content is Burgenland Roman; the interface (UI text, grammar labels, and which
// meaning-gloss is shown) is localized into two app languages. German is the default and serves
// at the root; English serves under /en/. The Roman headword spelling is dictionary content and
// is NOT switched by app language (always international/INT orthography as primary).
export default defineConfig({
	site: 'https://bgld-roman-wb.github.io',
	i18n: {
		defaultLocale: 'de',
		locales: ['de', 'en'],
		routing: { prefixDefaultLocale: false },
	},
});
