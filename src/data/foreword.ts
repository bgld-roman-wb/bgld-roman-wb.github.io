// Foreword text, reproduced verbatim from the opening pages of the accompanying manuscript
// (data/background/manuscript-de.pdf / manuscript-en.pdf), shown on the About page. Kept as
// structured data rather than i18n/ui.ts strings since it's long-form, page-specific content
// rather than reusable interface text.

export interface ForewordFootnote {
	id: string;
	text: string;
}

export interface ForewordContent {
	heading: string;
	paragraphs: { text: string; footnoteRefs?: string[] }[];
	footnotes: ForewordFootnote[];
	staffHeading: string;
	staffNote: string;
	staff: { name: string; mentor?: boolean }[];
	dateLine: string;
	signatures: string[];
	notesHeading: string;
}

export const foreword: Record<'de' | 'en', ForewordContent> = {
	de: {
		heading: 'Vorwort',
		paragraphs: [
			{
				text: 'Roman ist einer der Romanesdialekte des ehemaligen ungarischen Großraums, der vornehmlich an dessen zusätzlich immer schon vom Deutschen, aber auch vom Kroatischen geprägten Westrand angesiedelt ist. Heute Teil des multiethnischen östlichsten Bundeslands Österreichs, dem Burgenland, prägt Roman als wesentlicher Bestandteil der regionalen Vielfalt die Identität der Burgenlandroma.',
			},
			{
				text: 'Als höchstwahrscheinlich die vom Holocaust am stärksten betroffene Gruppe der österreichischen Romasozietät – nur um die 10 % haben den Massenmord in den Konzentrationslagern überlebt – waren die Überlebenden und sind deren Nachkommen auch heute noch mit Vorurteilen und Diskriminierung konfrontiert. Der daraus resultierende Versuch in den Nachkriegsjahrzehnten die „Zigeuneridentität“ abzulegen, um ohne ethnisches Stigma als vollwertige österreichische Bürger zu leben, führt u. a. auch zu einer Verstärkung im Rückgang der Sprachverwendung.',
				footnoteRefs: ['1'],
			},
			{
				text: 'In den 1980er Jahre wird Roman kaum noch gebraucht, erfährt wenig Wertschätzung innerhalb der Volksgruppe und wird von der Mehrheitsbevölkerung, wenn überhaupt wahrgenommen, stigmatisiert. Erst mit der beginnenden Selbstorganisation Ende der 1980er Jahre ändert sich die Spracheinstellung. Der Rückgang in der Verwendung des Roman wird vor allem von jüngeren, aktiven Volksgruppenmitgliedern als Verlust empfunden und es werden Überlegungen angestellt, die eigene Sprache zu unterrichten und schriftlich zu gebrauchen. Daraus resultiert das Projekt zur Kodifizierung und Didaktisierung des Roman in Zusammenarbeit mit Linguisten der Universität Graz. Nachdem Anfang der 2000er Jahre die Projektziele mit der Publikation der Kodifizierungsergebnisse und der Verwendung des Roman in Unterricht und Medien erreicht sind, übernimmt der Verein Roma-Service die Folgeaktivitäten in Eigenverantwortung.',
			},
			{
				text: 'Parallel der Zunahme der Verwendung in formal-öffentlichen, sowohl mündlichen als auch schriftlichen Domänen und trotz der identifikatorischen Funktion für die Volksgruppe geht der Gebrauch des Roman im Alltag der Burgenlandroma jedoch weiterhin zurück. Um dieser Entwicklung Rechnung zu tragen und künftigen Generationen die Möglichkeit zu geben, ihre Herkunftssprache weiterhin zu pflegen, ist es notwendig, die Materialien des Kodifizierungsprojekts und der darauf folgenden Aktivitäten zusammenfassend aufzubereiten. Ergebnis dieser Bemühungen sind ein umfassendes Onlinewörterbuch und die vorliegende Publikation.',
			},
			{
				text: 'Die sechs Kapitel des Buchs gliedern sich in einen dreiteiligen einleitenden und einen ebenfalls dreiteiligen sprachlich-deskriptiven Teil. Auf einen soziohistorischen Abriss zur Situation der Burgenlandroma bis zur Volksgruppenanerkennung 1993, folgt eine kurze Darstellung ihrer soziolinguistischen Situation. Diese beiden Kapitel – „Geschichte“ und „Situation“ – skizzieren die Rahmenbedingungen für die unter der Überschrift „Projekt“ folgende Beschreibung des Projekts zur Kodifizierung und Didaktisierung des Roman.',
				footnoteRefs: ['2'],
			},
			{
				text: 'Kern der Publikation sind die drei Inhaltskapitel „Struktur“, „Lexik“ und „Schreibung“; d. s. eine Referenzgrammatik, die Beschreibung des Vokabulars und des Onlinewörterbuchs sowie die Darstellung der Verschriftlichung und der daraus resultierenden Regeln.',
			},
			{
				text: 'Ermöglicht wurden die hier zusammengefassten Ergebnisse durch Unterstützungen seitens der Volksgruppenförderung des Bundeskanzleramts, des Österreichischen Bildungsministeriums, der Burgenländischen Landesregierung, des Fonds zur Förderung der wissenschaftlichen Forschung (FWF), der Bildungs- und Wissenschaftsförderschienen der Europäischen Union, aber auch von Privatpersonen. Diesen wollen wir an dieser Stelle ebenso danken wie allen im Folgenden aufgelisteten Freund*innen, Kolleg*innen und Betreuern, ohne die das Roman nie zu dem geworden wäre, was es heute ist; die anerkannte und umfassend dokumentierte Sprache der Burgenlandroma und seit 2011 immaterielles Kulturerbe im nationalen Verzeichnis der Österreichischen UNESCO-Kommission.',
			},
		],
		footnotes: [
			{
				id: '1',
				text: 'Die Bezeichnung „Zigeuner“ ist grundsätzlich als diskriminierend abzulehnen. In beschreibenden oder wissenschaftlichen Texten kann seine Verwendung dennoch begründet sein, um Quellen korrekt wiederzugeben, sprachliche Mechanismen von Ausgrenzung aufzuzeigen, und Diskriminierung zu verdeutlichen. Gerade durch die bewusste, eingeordnete Verwendung lässt sich zeigen, welche abwertenden Vorstellungen mit dem Wort transportiert werden. Voraussetzung ist stets eine klare Distanzierung und Kontextualisierung; im allgemeinen Sprachgebrauch ist die Bezeichnung keineswegs angemessen und konsequent „Roma“ zu verwenden!',
			},
			{
				id: '2',
				text: 'Diese drei Kapitel basieren im Wesentlichen auf dem 2013 online veröffentlichten Beitrag The Burgenland Romani Experience (Halwachs 2013). Zu Quellen und Vorarbeiten zu den anderen drei Kapiteln siehe die einschlägigen Titel im Literaturverzeichnis.',
			},
		],
		staffHeading: 'Mitarbeiter*innen und wissenschaftliche Betreuer',
		staffNote: 'kursiv: wissenschaftliche Betreuer',
		staff: [
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
		],
		dateLine: 'Erba / Graz, im Juni 2026',
		signatures: ['Emmerich Gärtner-Horvath', 'Dieter W. Halwachs'],
		notesHeading: 'Anmerkungen',
	},
	en: {
		heading: 'Foreword',
		paragraphs: [
			{
				text: 'Roman, as the Burgenland Roma call their language, is one of the Romani dialects of the former Kingdom of Hungary, spoken primarily along its western edge, where it has long been influenced by both German and Croatian. Now located in Burgenland, Austria’s easternmost and multi-ethnic province, it plays a key role in shaping the identity of the Burgenland Roma as an integral part of the county’s diversity.',
			},
			{
				text: 'As the group within the Austrian Roma community most severely affected by the Holocaust — only around 10% survived the mass murder in the concentration camps — the survivors and their descendants continue to face prejudice and discrimination to this day. In the post-war decades, the resulting effort to shed their „Gypsy identity“ to live as full Austrian citizens without ethnic stigma led to a sharp decline in the use of the language.',
				footnoteRefs: ['1'],
			},
			{
				text: 'In the 1980s, Roman was rarely used and held in low esteem within the ethnic group; if noticed at all by the majority population, it remained stigmatised. It was only with the emergence of self-organisation in the late 1980s that attitudes towards the language began to change. The decline in the use of Romani came to be perceived as a loss, particularly by younger, active members of the community, and consideration was given to teaching and writing in their own language. This led to a project to codify Roman and develop teaching materials in collaboration with linguists from the University of Graz. After the project’s objectives had been achieved in the early 2000s through the publication of the codification results and the use of Roman in teaching and the media, the Roma-Service association assumed responsibility for follow-up activities.',
			},
			{
				text: 'However, while the use of Romani is increasing in formal public contexts — both spoken and written — and serving as a marker of identity for the community, its use in the everyday lives of the Burgenland Roma continues to decline. To address this trend and allow future generations to continue cultivating their language of origin, it is necessary to compile the materials from the codification project and subsequent activities. The results of these efforts are a comprehensive online dictionary and this publication.',
			},
			{
				text: 'The book’s six chapters are divided into a three-part introductory section and a three-part linguistic-descriptive section. A socio-historical overview of the situation of the Burgenland Roma up to their recognition as an ethnic group in 1993 is followed by a brief description of the sociolinguistic situation. These two chapters — „History“ and „Situation“ — outline the context for the project to codify and develop teaching materials for the Romani language, which follows under the heading „Project“.',
				footnoteRefs: ['2'],
			},
			{
				text: 'The core of the publication consists of three sections: „Structure“, „Lexicon“, and „Spelling“; that is, a reference grammar, a description of the vocabulary and the online dictionary, and an explanation of orthography and the resulting rules.',
			},
			{
				text: 'The findings summarised here were made possible through support from the Federal Chancellery’s Ethnic Minority Support Programme, the Ministry of Education, the Burgenland Provincial Government, the Austrian Science Fund (FWF), the European Union’s education and research funding programmes, and private individuals. We want to take this opportunity to thank them, as well as all the friends, colleagues, and mentors listed below, without whom Roman would never have become what it is today: the recognised and comprehensively documented language of the Burgenland Roma and, since 2011, an item of intangible cultural heritage listed in the national register of the Austrian UNESCO Commission.',
			},
		],
		footnotes: [
			{
				id: '1',
				text: 'The term „Gypsy“ should generally be rejected as discriminatory. In descriptive or academic texts, however, its use may be justified in order to quote sources accurately, highlight linguistic mechanisms of exclusion, and illustrate discrimination. It is precisely through its deliberate, contextualised use that one can demonstrate the derogatory connotations conveyed by the word. Clear distancing and contextualisation are always essential; in general usage, the term is inappropriate, and „Roma“ should consistently be used instead.',
			},
			{
				id: '2',
				text: 'These three chapters are largely based on the article „The Burgenland Romani Experience“ (Halwachs 2013), which was published online in 2013. For sources and preparatory work related to the other three chapters, see the relevant entries in the bibliography.',
			},
		],
		staffHeading: 'Staff and mentors',
		staffNote: 'italic: mentors',
		staff: [
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
		],
		dateLine: 'Erba / Graz, June 2026',
		signatures: ['Emmerich Gärtner-Horvath', 'Dieter W. Halwachs'],
		notesHeading: 'Notes',
	},
};
