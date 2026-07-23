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
		'nav.about': 'Über',
		'search.placeholder': 'Suchen',
		'home.intro.suffix': 'Einträge, mit vollständigen Flexionsparadigmen, Wortfamilien und Etymologie.',
		'home.browseAlpha': 'Alphabetisch durchsuchen',
		'home.about': 'Über dieses Projekt',
		'home.langLine': 'die Sprache der Burgenland-Roma',
		'home.blurb': 'Roman ist der Romani-Dialekt der Burgenland-Roma, seit den 1990er-Jahren verschriftlicht. Dieses Wörterbuch macht den dokumentierten Wortschatz frei zugänglich.',
		'home.wordOfDay': 'Wort des Tages',
		'home.entriesLabel': 'Einträge',
		'home.familiesLabel': 'Wortfamilien',
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
		'entry.origin': 'Herkunft',
		'entry.composition': 'Zusammensetzung',
		'entry.variation': 'Varianten',
		'entry.variationHint': 'Ebenfalls belegte Nebenformen desselben Wortes.',
		'entry.reconstruction': 'ursprüngliche Form',
		'entry.reconstructionHint': 'Ältere, erschlossene Form, aus der das heutige Wort durch Lautwandel entstanden ist. Das Sternchen (*) kennzeichnet Formen, die nicht (mehr) in Gebrauch sind.',
		'entry.intSpelling': 'internationale Schreibung',
		'entry.intSpellingHint': 'Dasselbe Wort in der internationalen Romanes-Schreibung. Die Hauptform folgt der deutschen Schreibung.',
		'entry.inflectionUnavailable': 'Flexionsdaten nicht verfügbar.',
		'table.form': 'Form',
		'table.meaning': 'Bedeutung',
		'table.masc': 'm.',
		'table.fem': 'f.',
		'table.sameAsGerman': 'wie deutsche Schreibung',
		'grammar.endingsHint': 'Flexionsendungen: Marker der Beugungsklasse (z. B. Obliquus- und Pluralendung). Die vollständigen Formen stehen im Flexionsparadigma.',
		'notFound.title': 'Seite nicht gefunden',
		'notFound.body': 'Durchsuchen Sie das Wörterbuch alphabetisch oder nutzen Sie die Suche oben.',
		'footer.minorityPromotion': 'Volksgruppenförderung',
		'footer.imprint': 'Impressum',
		'impressum.title': 'Impressum',
		'impressum.placeholder': 'todo: add impressum',
		'about.title': 'Über dieses Projekt',
		'about.download': 'Manuskript als PDF herunterladen',
		'lang.switchLabel': 'Sprache',
		'theme.toggle': 'Farbschema wechseln',
	},
	en: {
		'site.title': 'Burgenland Roman Dictionary',
		'site.tagline': 'An online dictionary for Burgenland Roman.',
		'nav.browse': 'Browse',
		'nav.about': 'About',
		'search.placeholder': 'Search',
		'home.intro.suffix': 'entries, with full inflection paradigms, word families, and etymology.',
		'home.browseAlpha': 'Browse alphabetically',
		'home.about': 'About this project',
		'home.langLine': 'the language of the Burgenland Roma',
		'home.blurb': 'Roman is the Romani dialect of the Burgenland Roma, written down since the 1990s. This dictionary makes the documented vocabulary freely accessible.',
		'home.wordOfDay': 'Word of the day',
		'home.entriesLabel': 'entries',
		'home.familiesLabel': 'word families',
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
		'entry.origin': 'Origin',
		'entry.derivedFrom': 'derived from',
		'entry.derivedFromBase': 'base word',
		'entry.sourceFrom': 'From',
		'entry.composition': 'Composition',
		'entry.variation': 'Variants',
		'entry.variationHint': 'Attested alternative forms of the same word.',
		'entry.reconstruction': 'original form',
		'entry.reconstructionHint': 'Older, reconstructed form from which today’s word developed through sound change. The asterisk (*) marks forms that are not (or no longer) in use.',
		'entry.intSpelling': 'international spelling',
		'entry.intSpellingHint': 'The same word in the international Romani orthography. The main form follows the German-based spelling.',
		'entry.inflectionUnavailable': 'Inflection data unavailable.',
		'table.form': 'Form',
		'table.meaning': 'Meaning',
		'table.masc': 'm.',
		'table.fem': 'f.',
		'table.sameAsGerman': 'same as German spelling',
		'grammar.endingsHint': 'Inflection endings: markers of the declension/conjugation class (e.g. oblique and plural endings). The full forms are in the inflection paradigm.',
		'notFound.title': 'Page not found',
		'notFound.body': 'Try browsing the dictionary alphabetically or use the search above.',
		'footer.minorityPromotion': 'Minority Promotion',
		'footer.imprint': 'Imprint',
		'impressum.title': 'Imprint',
		'impressum.placeholder': 'todo: add impressum',
		'about.title': 'About this project',
		'about.download': 'Download the manuscript as PDF',
		'lang.switchLabel': 'Language',
		'theme.toggle': 'Toggle color theme',
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
	// inline display we keep only the primary term.
	return chosen ? chosen.split(' = ')[0].trim() : chosen;
}
