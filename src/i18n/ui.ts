// Interface localization. The dictionary content (Roman headwords and their inflection) is the
// same in every app language; what localizes is UI text, grammatical labels, and which
// meaning-gloss (German vs. English) is shown for each entry. German is the default locale.

export const locales = ['de', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLang: Locale = 'de';
export const languageNames: Record<Locale, string> = { de: 'Deutsch', en: 'English' };

export const ui = {
	de: {
		'site.title': 'Burgenland-Roman-Wörterbuch',
		'site.tagline': 'Ein Online-Wörterbuch für das Burgenland-Roman.',
		'nav.browse': 'Durchsuchen',
		'nav.abbreviations': 'Abkürzungen',
		'nav.about': 'Über',
		'search.placeholder': 'Suchen',
		'home.intro.suffix': 'Einträge, mit vollständigen Flexionsparadigmen, Wortfamilien und Etymologie.',
		'home.browseAlpha': 'Alphabetisch durchsuchen',
		'home.browseAll': 'Alle Durchsuchoptionen',
		'home.about': 'Über dieses Projekt',
		'browse.title': 'Wörterbuch durchsuchen',
		'browse.alphabetical': 'Alphabetisch',
		'browse.byWordClass': 'Nach Wortart',
		'browse.byWordClassNote': 'Substantive, Verben, Adjektive und mehr — wählen Sie oben einen Buchstaben; jeder Eintrag verweist auch auf seine Wortart.',
		'browse.backToEntries': '← Einträge durchsuchen',
		'browse.entries': 'Einträge',
		'browse.letterHeading': 'Alphabetisch durchsuchen',
		'browse.wordClassHeading': 'Nach Wortart durchsuchen',
		'entry.paradigm': 'Flexionsparadigma',
		'entry.wordFamily': 'Wortfamilie',
		'entry.baseWord': 'Grundwort',
		'entry.derivedFrom': 'abgeleitet von',
		'entry.derivedFromBase': 'Grundwort',
		'entry.sourceFrom': 'Aus dem',
		'entry.composition': 'Zusammensetzung',
		'entry.variation': 'Varianten',
		'entry.reconstruction': 'ursprüngliche Form',
		'entry.intSpelling': 'internationale Schreibung',
		'entry.inflectionUnavailable': 'Flexionsdaten nicht verfügbar.',
		'table.form': 'Form',
		'table.meaning': 'Bedeutung',
		'table.masc': 'm.',
		'table.fem': 'f.',
		'table.sameAsGerman': 'wie deutsche Schreibung',
		'grammar.endingsHint': 'Flexionsendungen: Marker der Beugungsklasse (z. B. Obliquus- und Pluralendung). Die vollständigen Formen stehen im Flexionsparadigma.',
		'notFound.title': 'Seite nicht gefunden',
		'notFound.body': 'Durchsuchen Sie das Wörterbuch alphabetisch oder nutzen Sie die Suche oben.',
		'footer.text': 'Burgenland-Roman-Wörterbuch — erstellt aus Materialien des Kodifizierungsprojekts der Universität Graz und des Vereins Roma-Service.',
		'about.title': 'Über dieses Projekt',
		'about.body1': 'Roman ist einer der Romanes-Dialekte des ehemaligen Königreichs Ungarn, gesprochen von den Burgenland-Roma entlang der österreichischen Westgrenze zu Ungarn. Dieses Wörterbuch geht auf ein Kodifizierungsprojekt mit Linguisten der Universität Graz zurück, das vom Verein Roma-Service fortgeführt und hier von einem Sprachwissenschaftler gemeinsam mit dem Betreuer des Wörterbuchs aufbereitet wurde.',
		'about.body2': 'Die Wörterbuchdaten — Lemmata, Flexionsparadigmen, Etymologie und Wortfamilien — werden in einer Quelltabelle gepflegt und bei jeder Aktualisierung automatisch in diese Website übernommen.',
		'about.orthographyHint': 'Hinweis zur Schreibung: Der Akzent markiert den betonten Vokal; die DEU-Schreibung orientiert sich an deutscher Aussprache.',
		'abbr.title': 'Abkürzungen',
		'abbr.intro': 'Diese Listen werden direkt aus den Abkürzungstabellen der Wörterbuchdatei erzeugt.',
		'abbr.grammar': 'Grammatik',
		'abbr.languages': 'Herkunftssprachen',
		'abbr.lexicographic': 'Lexikografische Abkürzungen',
		'abbr.code': 'Abkürzung',
		'abbr.english': 'Englisch',
		'abbr.germanTechnical': 'Deutsch (Fachbegriff)',
		'abbr.germanPlain': 'Deutsch (allgemein)',
		'abbr.roman': 'Roman',
		'abbr.iso': 'ISO',
		'abbr.meaning': 'Bedeutung',
		'lang.switchLabel': 'Sprache',
	},
	en: {
		'site.title': 'Burgenland Roman Dictionary',
		'site.tagline': 'An online dictionary for Burgenland Roman.',
		'nav.browse': 'Browse',
		'nav.abbreviations': 'Abbreviations',
		'nav.about': 'About',
		'search.placeholder': 'Search',
		'home.intro.suffix': 'entries, with full inflection paradigms, word families, and etymology.',
		'home.browseAlpha': 'Browse alphabetically',
		'home.browseAll': 'All browse options',
		'home.about': 'About this project',
		'browse.title': 'Browse the dictionary',
		'browse.alphabetical': 'Alphabetically',
		'browse.byWordClass': 'By word class',
		'browse.byWordClassNote': 'Nouns, verbs, adjectives, and more — pick a letter above to start; each entry links to its word class too.',
		'browse.backToEntries': '← Browse entries',
		'browse.entries': 'entries',
		'browse.letterHeading': 'Browse alphabetically',
		'browse.wordClassHeading': 'Browse by word class',
		'entry.paradigm': 'Inflection paradigm',
		'entry.wordFamily': 'Word family',
		'entry.baseWord': 'base word',
		'entry.derivedFrom': 'derived from',
		'entry.derivedFromBase': 'base word',
		'entry.sourceFrom': 'From',
		'entry.composition': 'Composition',
		'entry.variation': 'Variants',
		'entry.reconstruction': 'original form',
		'entry.intSpelling': 'international spelling',
		'entry.inflectionUnavailable': 'Inflection data unavailable.',
		'table.form': 'Form',
		'table.meaning': 'Meaning',
		'table.masc': 'm.',
		'table.fem': 'f.',
		'table.sameAsGerman': 'same as German spelling',
		'grammar.endingsHint': 'Inflection endings: markers of the declension/conjugation class (e.g. oblique and plural endings). The full forms are in the inflection paradigm.',
		'notFound.title': 'Page not found',
		'notFound.body': 'Try browsing the dictionary alphabetically or use the search above.',
		'footer.text': 'Burgenland Roman Dictionary — built from material compiled by the University of Graz codification project and the Roma-Service association.',
		'about.title': 'About this project',
		'about.body1': 'Roman is one of the Romani dialects of the former Kingdom of Hungary, spoken by the Burgenland Roma along Austria’s western border with Hungary. This dictionary grows out of a codification project undertaken with linguists at the University of Graz, continued by the Roma-Service association, and compiled here by a linguist working with the dictionary’s maintainer.',
		'about.body2': 'The dictionary data — lemmas, inflection paradigms, etymology, and word families — is maintained in a source spreadsheet and rebuilt into this site automatically whenever it is updated.',
		'about.orthographyHint': 'Orthography note: the acute accent marks the stressed vowel; the DEU spelling is intended to read like German.',
		'abbr.title': 'Abbreviations',
		'abbr.intro': 'These lists are generated directly from the abbreviation sheets in the dictionary workbook.',
		'abbr.grammar': 'Grammar',
		'abbr.languages': 'Source languages',
		'abbr.lexicographic': 'Lexicographic abbreviations',
		'abbr.code': 'Code',
		'abbr.english': 'English',
		'abbr.germanTechnical': 'German (technical)',
		'abbr.germanPlain': 'German (plain language)',
		'abbr.roman': 'Roman',
		'abbr.iso': 'ISO',
		'abbr.meaning': 'Meaning',
		'lang.switchLabel': 'Language',
	},
} as const;

export type UIKey = keyof (typeof ui)['de'];

export function useTranslations(lang: Locale) {
	return function t(key: UIKey): string {
		return ui[lang][key] ?? ui[defaultLang][key];
	};
}

// Prefixes an app-root-relative path (starting with '/') for the given locale. German (default)
// stays at the root; English gets an /en prefix. e.g. localizePath('/entry/foo', 'en') -> '/en/entry/foo'
export function localizePath(path: string, lang: Locale): string {
	if (lang === defaultLang) return path;
	return path === '/' ? `/${lang}` : `/${lang}${path}`;
}

// The locale implied by a pathname (first segment === 'en' -> English, else German default).
export function localeFromPath(pathname: string): Locale {
	const first = pathname.split('/').filter(Boolean)[0];
	return first === 'en' ? 'en' : 'de';
}

// The equivalent path in the other locale, for the language switcher.
export function pathInLocale(pathname: string, target: Locale): string {
	const current = localeFromPath(pathname);
	if (current === target) return pathname;
	// strip an existing /en prefix down to the app-root-relative path, then re-localize
	const stripped = current === 'de' ? pathname : pathname.replace(/^\/en/, '') || '/';
	return localizePath(stripped, target);
}

// Picks the gloss text for the active locale from a {de, en} gloss slot.
export function glossFor(gloss: { de: string | null; en: string | null }, lang: Locale): string | null {
	return lang === 'de' ? gloss.de : gloss.en;
}

// Picks a {en, de} label (grammatical / language labels resolved by the pipeline) for the locale.
export function labelFor(label: { en: string | null; de: string | null } | null, lang: Locale): string | null {
	if (!label) return null;
	const chosen = (lang === 'de' ? label.de : label.en) ?? label.en ?? label.de;
	// Some abbreviation labels give two synonyms with "=" (e.g. "Nomen = Substantiv"). For a clean
	// inline display we keep only the primary term; the full form stays in the abbreviations page.
	return chosen ? chosen.split(' = ')[0].trim() : chosen;
}
