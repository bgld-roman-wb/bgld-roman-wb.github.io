// About-page text, supplied by the professor as a Word document (see
// data/2026-08-17_about.docx — dated by delivery date, not authorship date). Reproduced
// verbatim, including the original inline formatting (language-name italics, the Romlex
// hyperlink, small-caps ISO-639 codes), which is why paragraphs are stored as trusted HTML
// fragments rather than plain strings — there is no user input involved, so this carries none of
// the risk that would come with un-sanitized external HTML.
//
// Supersedes the previous About page content, which was the opening pages of the accompanying
// manuscript (data/background/manuscript-de.pdf / manuscript-en.pdf); that manuscript is now
// linked from this page instead of quoted on it (see the download link in AboutPage.astro).

export interface AboutContent {
	/** Trusted HTML fragments, one per paragraph — see file header. */
	paragraphs: string[];
	/** The plain (non-italicized) lead-in of the staff heading, e.g. "Mitarbeiter*innen und ". */
	staffHeadingPlain: string;
	/** The italicized tail of the staff heading, which doubles as the mentor-legend, e.g.
	 * "wissenschaftliche Betreuer" — mentors below are rendered the same way (italic), so this
	 * phrase in the heading itself explains what the italics mean. */
	staffHeadingLegend: string;
}

// Shared between locales: names aren't translated, and the mentor set is the same document.
const staff: { name: string; mentor?: boolean }[] = [
	{ name: 'Gerd Ambrosch' },
	{ name: 'Zuzana Bodnarova' },
	{ name: 'Katharina Deman (Martens)' },
	{ name: 'Norman Denison', mentor: true },
	{ name: 'Valentin Edelsbrunner' },
	{ name: 'Christiane Fennesz-Juhasz' },
	{ name: 'Martin Frippertinger' },
	{ name: 'Ursula Gläser' },
	{ name: 'Andreas Gstettner' },
	{ name: 'Alexander Gusak' },
	{ name: 'Dieter Halwachs' },
	{ name: 'Mozes Heinschink', mentor: true },
	{ name: 'Anton Horvath' },
	{ name: 'Emmerich Gärtner-Horvath' },
	{ name: 'Erika Horvath' },
	{ name: 'Erika Horvath' },
	{ name: 'Josef Horvath' },
	{ name: 'Marton Horvath' },
	{ name: 'Ludwig Horvath' },
	{ name: 'Susanne Horvath' },
	{ name: 'Josef Horwat' },
	{ name: 'Annemarie Huber' },
	{ name: 'Carl-Heinz Huber' },
	{ name: 'Claus-Jürgen (Miklos) Hutterer', mentor: true },
	{ name: 'Franz Landl' },
	{ name: 'Hermann Mittelberger', mentor: true },
	{ name: 'Ulrike Pawlata' },
	{ name: 'Luzia Plansky' },
	{ name: 'Cornelia Purr' },
	{ name: 'Astrid Sabaini (Rader)' },
	{ name: 'Rene Sarközy' },
	{ name: 'Bernhard Scheucher' },
	{ name: 'Dieter Schicker' },
	{ name: 'Josef Schmidt' },
	{ name: 'Linda Schneider' },
	{ name: 'Barbara Schrammel-Leber' },
	{ name: 'Tobias Schrank' },
	{ name: 'Karl Sornig', mentor: true },
	{ name: 'Erich Stamberger' },
	{ name: 'Petra Steinkellner' },
	{ name: 'Lev Tcherenkov', mentor: true },
	{ name: 'Michael Teichmann' },
	{ name: 'Alfred Walz' },
	{ name: 'Nadja Wallaszkovits' },
	{ name: 'Christine Wassermann' },
	{ name: 'Cornelia Wiedenhofer' },
	{ name: 'Jakob Wiedner' },
	{ name: 'Marcus Wiesner' },
	{ name: 'Anna Windisch' },
	{ name: 'Michael Wogg' },
];

const romlexLink = (label: string) =>
	`<a href="http://romani.uni-graz.at/romlex/" target="_blank" rel="noopener">${label}</a>`;

export const about: Record<'de' | 'en', AboutContent> = {
	de: {
		paragraphs: [
			'<i>Roman</i> ist ein Romanesdialekt am Westrand des ehemaligen ungarischen Großraums und wird heute im Burgenland, dem östlichsten und multiethnisch geprägten Bundesland Österreichs, gesprochen. Als wesentlicher Bestandteil der regionalen sprachlichen Vielfalt prägt Roman die Identität der Burgenlandroma.',
			'In den 1980er Jahren wurde <i>Roman</i> kaum noch gebraucht, erfuhr wenig Wertschätzung innerhalb der Volksgruppe und wurde von der Mehrheitsbevölkerung, wenn überhaupt wahrgenommen, stigmatisiert. Erst mit der beginnenden Selbstorganisation Ende der 1980er Jahre änderte sich die Spracheinstellung. Der Rückgang in der Verwendung des <i>Roman</i> wurde als Verlust empfunden und es wurden Überlegungen angestellt, die eigene Sprache zu unterrichten und schriftlich zu gebrauchen. Daraus resultierte das <i>Projekt zur Kodifizierung und Didaktisierung des Roman</i>.',
			`Die Dokumentation des Vokabulars des <i>Roman</i> begann mit dem Kodifizierungsprozess und ergab einen Basiswortschatz von um die 1.500 Wörtern, der ausreicht, um sich in Alltagssituationen zu verständigen. Der nächste Schritt war die Vervollständigung einer Wortschatzliste mit 3.000 Einträgen. Die dafür ausgewählten Bezeichnungen entsprechen in etwa dem für flüssige Alltagskommunikation, Medienkonsum und die Produktion einfacher Texte notwendigen Vokabular, was dem Niveau B2 fortgeschrittener Sprachverwendung des Gemeinsamen Europäischen Referenzrahmens für Sprachen entspricht. Im Rahmen des ${romlexLink('Romlexprojekts')} wurde dieses Glossar auf mehr als 7.000 Einträge erweitert.`,
			'Die weiteren Einträge des Onlinewörterbuchs sind einerseits Resultat der Analyse dokumentierter Übersetzungen und neu erstellter Texte, andererseits aber auch gezielter lexikalischer Expansion. Diese erfolgt unter Anwendung der Wortbildungsmöglichkeiten—Derivationsmorphologie und Kompositabildung—und der produktiven Integrationsmorphologie bzw. der Übernahmemuster für Entlehnungen.',
			'Die mehr als 12.500 Einträge bzw. Lemmata setzen sich aus 27% Basislexemen und 73% Wortbildungen zusammen; 50% Derivationen, knapp über 8% Komposita und 15% Phrasen. Von den dokumentierten 522 voreuropäischen Basislexemen sind 52 aus dem Byzantinisch-Griechischen <span class="lang-code">(grc)</span>, 15 aus dem Armenischen <span class="lang-code">(arm)</span>, 29 aus dem Iranischen <span class="lang-code">(ira)</span> und 425 aus dem Indoarischen <span class="lang-code">(inc)</span>. Der Großteil, knapp 85 % der dokumentierten Basislexeme, ist europäischer Herkunft. Neben Entlehnungen aus südslawischen Sprachen und dem Ungarischen stammt insgesamt fast die Hälfte aus der primären Kontaktsprache, dem Deutschen, und zunehmend auch aus dem Englischen.',
			'Was die Wortartenverteilung anbelangt, folgt <i>Roman</i> der allgemeinen Tendenz indoeuropäischer Sprachen. Diese haben einen hohen Nominalanteil; die Anzahl der Verben ist demgegenüber ebenso geringer wie die der Partikeln.',
			'Ermöglicht wurden die hier zusammengefassten Ergebnisse vor allem durch Unterstützungen seitens der Volksgruppenförderung des Bundeskanzleramts, aber auch des Österreichischen Bildungsministeriums, der Burgenländischen Landesregierung, des Fonds zur Förderung der wissenschaftlichen Forschung (FWF), der Bildungs- und Wissenschaftsförderungen der Europäischen Union sowie von Privatpersonen. Diesen wollen wir an dieser Stelle ebenso danken wie allen im Folgenden aufgelisteten Freund*innen, Kolleg*innen und Betreuern, ohne die das <i>Roman</i> nie zu dem geworden wäre, was es heute ist; die anerkannte und umfassend dokumentierte Sprache der Burgenlandroma und seit 2011 immaterielles Kulturerbe im nationalen Verzeichnis der Österreichischen UNESCO-Kommission.',
		],
		staffHeadingPlain: 'Mitarbeiter*innen und ',
		staffHeadingLegend: 'wissenschaftliche Betreuer',
	},
	en: {
		paragraphs: [
			'<i>Roman</i> is a Romani dialect spoken on the western edge of the former Kingdom of Hungary. Now part of Austria’s easternmost multi-ethnic federal state, Burgenland, <i>Roman</i> shapes the identity of the Burgenland Roma as an essential component of the region’s diversity.',
			'In the 1980s, <i>Roman</i> was scarcely used, received little recognition within the ethnic group and, if noticed at all by the majority population, was stigmatised. It was not until the beginning of self-organisation in the late 1980s that language attitudes began to change. The decline in the use of <i>Roman</i> was perceived as a loss, and consideration was given to teaching the language and using it in writing. This led to the <i>Project for the Codification and Didactisation of Roman</i>.',
			`The documentation of the <i>Roman</i> vocabulary began with the codification process and yielded a basic vocabulary of around 1,500 entries, sufficient for basic communication. The next step was completing a vocabulary list of 3,000 entries. The terms selected for this purpose broadly correspond to the vocabulary required for fluent everyday communication, media consumption, and the production of simple texts, which is roughly equivalent to level B2 (advanced language use) of the Common European Framework of Reference for Languages. As part of the ${romlexLink('Romlex')} project, this glossary was expanded to more than 7,000 entries.`,
			'The additional entries in the online dictionary resulted, on the one hand, from the analysis of documented translations and newly created texts, and, on the other hand, from targeted lexical expansion. This was carried out by applying word-formation possibilities—derivational morphology and compound formation—as well as productive integration morphology, i.e. the patterns of adoption for loanwords.',
			'The more than 12,500 entries or lemmas consist of 27% base lexemes and 73% word formations, with 50% derivations, just over 8% compounds, and 15% phrases. Of the 522 pre-European base lexemes documented, 52 are from Byzantine Greek <span class="lang-code">(grc)</span>, 15 from Armenian <span class="lang-code">(arm)</span>, 29 from Iranian <span class="lang-code">(ira)</span> and 425 from Indo-Aryan <span class="lang-code">(inc)</span>. The vast majority—almost 85 %—of the documented base lexemes are of European origin. In addition to borrowings from South Slavic languages and Hungarian, almost half originate from the primary contact language, German, and, increasingly, from English.',
			'As far as the distribution of parts of speech is concerned, <i>Roman</i> follows the general pattern of Indo-European languages. These have a high proportion of nouns, whilst the number of verbs is correspondingly lower, as is that of particles.',
			'The results summarised here were made possible primarily through funding from the Federal Chancellery’s Ethnic Minority Support Program, but also from the Austrian Ministry of Education, the Burgenland Provincial Government, the Austrian Science Fund (FWF), the European Union’s education and science funding programs, and private individuals. We want to take this opportunity to thank them, as well as all the friends, colleagues and academic supervisors listed below, without whom <i>Roman</i> would never have become what it is today: the recognised and comprehensively documented language of the Burgenland Roma, which is listed as intangible cultural heritage in the national register of the Austrian UNESCO Commission since 2011.',
		],
		staffHeadingPlain: 'Co-workers and ',
		staffHeadingLegend: 'academic supervisors',
	},
};

export { staff as aboutStaff };
