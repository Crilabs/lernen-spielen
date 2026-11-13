# Rund 940 kleine Schritte ordnen den Grundschulstoff

Der Grundschulstoff Deutsch und Mathe der Klassen 1 bis 4 lässt sich nach bayerischem LehrplanPLUS und den KMK-Bildungsstandards 2022 in **rund 940 Lernschritte** zerlegen, die jeweils genau eine Schwierigkeit isolieren. 376 Schritte gehören in den Strang `mathe` (davon 103 prozessbezogene wie Problemlösen und Begründen), 64 in `geometrie`, 121 in `lesen`, 242 in `schreiben` (Rechtschreibung, 82 Schritte Schrifterwerb in Druck- und Schreibschrift, 58 Schritte Texte verfassen), 69 in `grammatik` und 72 in Sprechen und Zuhören, für die ein eigener Strang `sprechen` zu entscheiden ist. Knapp 590 davon gehören zu Klasse 1 und 2. Allein für die Inhaltsthemen liegt diese Körnung etwas feiner als ANTON (rund 300 Einheiten Mathe, 330 Deutsch ohne Schreibschrift) und entspricht dem Vorbild „Hallo 1. Klasse“ dort, wo es am feinsten schneidet: Jede Zahl bis 10 bekommt ein eigenes Thema, Minus bis 20 läuft über mehrere Stufen. Montessori-Konzept und Lernforschung stützen dieses Raster aus zwei Richtungen. Beide verlangen eine isolierte Schwierigkeit je Thema, einen ausdrücklichen Übergang vom Material über das Bild zum Kopf, Selbstkontrolle statt Bewertung, verteiltes Abrufen über Tage und den Verzicht auf erwartbare Belohnungen. Für die `lernplan.json` folgt daraus zweierlei. Die Karte am Ende dieses Berichts lässt sich fast eins zu eins in Themen mit Voraussetzungen übersetzen. Vorher muss Christian aber einige Grundsatzfragen entscheiden: wie weit über Klasse 2 hinaus der Plan jetzt reichen soll, ob die bayerischen Sonderwege gelten (schriftliche Division, Abziehverfahren), welche Wortartensymbole die App verwendet und wann ein Thema als beherrscht gilt. Etwa ein Drittel der Schritte ist eigene Feinteilung der Rechercheure (**[E]**), und die Zuordnung zu Klasse 3 oder 4 ist durchweg Inferenz. Viele Montessori-Details beruhen auf ungeprüftem Fachwissen (**[FW]**), und mehrere Studien aus der Lernforschung wurden nur aus der Literaturkenntnis zitiert, nicht neu abgerufen (**[L]**). Diese Kennzeichnungen bleiben im ganzen Bericht stehen.

## Bayern verlangt mehr als die KMK, vor allem bei Division und Rechtschreibung

Die KMK-Standards 2022 beschreiben nur den Stand am Ende von Klasse 4, ohne Zuordnung zu einzelnen Jahrgängen. Für Mathematik verlangen sie den Zahlenraum bis zur Million, automatisierte Grundaufgaben (Zerlegungen, Einspluseins, Einmaleins mit Umkehrungen) und halbschriftliche Strategien für alle vier Rechenarten. Schriftliche Verfahren fordern sie nur für **Addition, Subtraktion und Multiplikation**. Dazu kommen Größen samt Flächen- und Rauminhalt und einfachen Brüchen bei Größen (½ m, ¼ l), Raum und Form (Pläne, Netze, Bauplan, Achsensymmetrie), Muster und funktionale Zusammenhänge sowie Daten, Kombinatorik und Wahrscheinlichkeit ([KMK 2022 Mathe](https://www.kmk.org/fileadmin/Dateien/veroeffentlichungen_beschluesse/2022/2022_06_23-Bista-Primarbereich-Mathe.pdf)). Bayern geht an zwei Stellen darüber hinaus. Die **schriftliche Division durch Divisoren bis einschließlich 10, auch mit Rest**, soll automatisiert werden, und die schriftliche Subtraktion läuft verbindlich im **Abziehverfahren mit Entbündeln** ([LehrplanPLUS M3/4](https://www.lehrplanplus.bayern.de/fachlehrplan/grundschule/3/mathematik); [Klett, bayerisches Abziehverfahren](https://static.klett-lerntraining.de/grundschule/docs/949293_Erklaerung_bayerisches_Abziehverfahren.pdf)). NRW lässt die Division nur erläutern ([Lehrplan Mathematik NRW](https://lehrplannavigator.nrw.de/system/files/media/document/file/ps_lp_m_einzeldatei_2025_03_18.pdf)), Baden-Württemberg erlaubt Abzieh- oder Ergänzungsverfahren ([Westermann-Stoffverteilungsplan Kl. 3 BW](https://c.wgr.de/d/695deb4db789cd807bf75432cae8af98e266e825eb43cc9459242cf11b8336fe.pdf/191403_stoffverteilungsplan3_bw.pdf)). Auch die Division mit Rest setzt Bayern früh an: Sie steht schon in Jahrgangsstufe 1/2, auf der Handlungsebene. Beim Einmaleins verlangt Bayern in 1/2 dagegen nur die Kernreihen 1, 2, 5 und 10, die Quadrataufgaben, die Malaufgaben mit 0 und das Ableiten weiterer Aufgaben. Alle Einmaleinssätze automatisiert sind erst ein Ziel für 3/4 ([LehrplanPLUS M1/2](https://www.lehrplanplus.bayern.de/fachlehrplan/grundschule/1/mathematik)).

Eine Folge der aktuellen Fassung trifft jede Klassenzuordnung: Bayern fasst **3 und 4 zu einer Doppeljahrgangsstufe** zusammen. „Bis 1000 in Klasse 3, Million in Klasse 4“ steht dort nicht mehr. Diese Aufteilung stammt aus Lehrwerksplänen wie dem BW-Plan von Westermann und ist in der Karte als Inferenz zu lesen. Einen Stoffverteilungsplan eines bayerischen Lehrwerks fanden die Rechercheure nicht.

In Deutsch bringt die KMK-Fassung 2022 drei Neuerungen, die für eine App zählen. Leseflüssigkeit steht ausdrücklich als Ziel („automatisiert, genau, sinngestaltend und zügig“). Kernwörter, deren Schreibung man herleiten kann, sind von Merkwörtern getrennt, die man auswendig lernen muss. Und ein verbindlicher Anhang legt die Fachbegriffe fest. Darin stehen als Zeitformen nur **Präsens, Präteritum und Futur**, das Perfekt fehlt ([KMK Deutsch 2022, Kopie Schulportal Sachsen](https://www.schulportal.sachsen.de/lplandb/material/67/X2wP6FHMVPxXWUYMuMjO); die PDF auf kmk.org selbst wurde nicht abgerufen). Bayern führt die Rechtschreibphänomene früher und konkreter ein als NRW. Schon in 1/2 stehen Doppelkonsonanten in der Wortmitte, `<ie>`, r nach Vokal, Umlautung und Auslautverhärtung („Haus – Häuser“, „legen – legt“, „rot – rote“). In 3/4 folgen Routine, Silbentrennung am Silbengelenk, Stammvokalwechsel, die Endungen -ung, -ig und -lich, die Großschreibung des Nominalkerns, Fugenelemente, die Fälle, Satzglieder und die wörtliche Rede ([LehrplanPLUS D1/2](https://www.lehrplanplus.bayern.de/fachlehrplan/grundschule/1/deutsch); [LehrplanPLUS D3/4](https://www.lehrplanplus.bayern.de/fachlehrplan/grundschule/4/deutsch)). Kommaregeln im Satzgefüge und das/dass nennt der bayerische Text nicht. Sie gehören deshalb als „Bonus“ frühestens in Klasse 4. Der verbindliche bayerische Grundwortschatz von 623 Modellwörtern ist nur über eine Landtagsantwort belegt ([Bayerischer Landtag, Drucksache](https://www.bayern.landtag.de/www/ElanTextAblage_WP19/Drucksachen/Basisdrucksachen/0000005500/0000005519_023.pdf)). Die Listen selbst haben die Rechercheure absichtlich nicht gesichtet und nicht kopiert.

## Ein Thema, eine Schwierigkeit: So fein schneiden die Vorbilder

Die öffentlich einsehbaren Angebote zerfallen in zwei Typen. Übungsplattformen zerlegen nach Inhalt mal Schwierigkeitsstufe. ANTON kommt so auf **54, 88, 85 und 69 Mathe-Einheiten** in den Klassen 1 bis 4 und auf rund 91, 75, 100 und 67 Deutsch-Einheiten ohne Schreibschrift, mit je 5 bis 12 Einzelübungen ([ANTON Mathe 1](https://anton.app/de/lernen/mathematik-1-klasse/); [ANTON Mathe 2](https://anton.app/de/lernen/mathematik-2-klasse/); [ANTON Deutsch 1](https://anton.app/de/lernen/deutsch-1-klasse/); [ANTON Deutsch 2](https://anton.app/de/lernen/deutsch-2-klasse/)). Förderlehrgänge zerlegen dagegen nach Basiskompetenzen, die über Wochen geübt werden. Blitzrechnen hat **10 Übungen je Schuljahr** ([Blitzrechenoffensive, TU Dortmund](https://wwwold.mathematik.tu-dortmund.de/ieem/mathe2000/pdf/Blitzrechenoffensive.pdf)), „Mathe sicher können“ 15 Bausteine ([MSK-Handreichung](https://mathe-sicher-koennen.dzlm.de/mskfiles/uploads/docs/HRU_NZ_Hintergrund%20des%20Diagnose_Foerderkonzepts.pdf)), der Kieler Leseaufbau 14 Stufen ([LEVUMI-Lehrerhandbuch](https://eldorado.tu-dortmund.de/bitstream/2003/36024/1/F%c3%b6rderans%c3%a4tze_Lehrerhandbuch%20LEVUMI.PDF)). Hallo 1. Klasse liegt mit 52 Wochen zu je zwei Lektionen dazwischen ([Hallo 1. Klasse](https://www.hallolernen.de/hallo-1-klasse-erfolgskurs/)). Einen Kurs „Hallo 2. Klasse“ gibt es nicht. Lektionstitel nennt die öffentliche Seite nicht. Die Feinheitsbeispiele aus Hallo 1. Klasse stammen aus Christians eigener Analyse und wurden nicht neu geprüft.

Aufschlussreich ist, wo die Angebote auseinandergehen. ANTON ist im Erstlesen feiner als jedes andere Angebot: Jeder Buchstabe und jede Lautverbindung ist eine eigene Einheit, dazwischen liegen kumulative Mischeinheiten („L, O, A“, „L, O, A, M“). Bei Zerlegung und Zehnerübergang ist ANTON dagegen grob, mit je einer Einheit für „Plus mit Zehnerübergang“ und „Minus mit Zehnerübergang“. Hallo behandelt hier jede Zahl von 6 bis 10 einzeln und das Minus bis 20 in fünf Stufen. Größen und Geometrie bleiben überall grob, mit 2 bis 4 Einheiten je Größe und Jahr. Die Kernlinien „Zerlegen → Zehnerübergang“, „Einmaleins“ und „Buchstaben → Silben → Strategien“ zerlegen dagegen alle fachlich ernsthaften Angebote fein. Daraus ergibt sich eine einfache Regel für den eigenen Plan: Fein schneiden lohnt sich dort, wo die Fachdidaktik Stolpersteine belegt.

Die Fachdidaktik liefert dafür klare Ketten. Für das Einspluseins lautet sie: strukturierte Anzahlerfassung (Kraft der 5, Zehnerfeld) → Zerlegungen, vor allem der 10 → einfache Kernaufgaben (±0/1, mit 5, mit 10, Verdoppeln, Summe 10) → Analogieaufgaben bis 20 → Zehnerübergang als Kombination dieser Strategien ([PIKAS-Standortbestimmung Kl. 1](https://pikas.dzlm.de/pikasfiles/uploads/handreichung_sob_jg1_schnelles_kopfrechnen_1-1.pdf); [DZLM, Einspluseins](https://maco.dzlm.de/sites/maco/files/dzlm_maco_prim_addsubt_211007.pdf)). Nührenbörger und Kollegen nennen es einen **„mathematischen Kunstfehler“, einen festen Weg für den Zehnerübergang vorzuschreiben**. Die Karte führt den Übergang deshalb als Folge von Teilschritten (M1-58 bis M1-64), mit Fast-Verdoppeln und Fünfertrick als gleichwertigen Wegen. Beim Einmaleins sichern Kernaufgaben (1·, 2·, 5·, 10·) mehr als das Durcharbeiten einzelner Reihen. Ein automatisiertes Einmaleins ist Voraussetzung für die schriftliche Multiplikation, weil sonst das Arbeitsgedächtnis überläuft ([PIKAS, 1·1 richtig üben](https://pikas.dzlm.de/pikasfiles/uploads/upload/Material/Haus_3_-_Umgang_mit_Rechenschwierigkeiten/UM/1x1_richtig_ueben/Basisinfos/basisinfos_1x1_ueben.pdf)). Eine feste Reihenfolge der Reihen gibt keine geprüfte Quelle vor. Die Folge 2, 10, 5 → 4, 8 → 3, 6, 9 → 7 in der Karte ist mit den Quellen vereinbar, aber eigene Wahl.

Im Erstlesen beginnen fast alle Fibeln mit M und einem Vokal und bringen Dauerlaute (L, S, R, N) vor den Verschlusslauten. T kommt in 9 von 14 Fibeln unter den ersten acht Buchstaben ([LUNA-Fibelliste](http://www.lesikus.com/wp/wp-content/uploads/2016/09/LUNA_Fibelliste.pdf)). Der Kieler Leseaufbau begründet die Regel: Dehnbare Laute lassen sich zusammenziehen, Plosive nicht. Er arbeitet nur mit Wörtern, in denen jedem Laut genau ein Buchstabe entspricht, und klammert Doppelung und Dehnung zunächst aus ([LEVUMI, Förderansätze Deutsch](https://www.levumi.de/files/Foerderansaetze_Deutsch.pdf)). Die Buchstabenfolge der Karte (M, A, I, O, L, S, R, U, E, N, F, T …) ist ein **Kompromiss aus Fibelliste und KLA** und eigene Synthese. In der Rechtschreibung schneiden ANTON und FRESCH nach Werkzeugen. Verlängern wird nach d/t, g/k und b/p getrennt geübt, Ableiten nach ä und äu, Merkwörter nach Typ. Das Verlängern führt man laut einer Verlagsleseprobe Mitte oder Ende Klasse 2 ein ([FRESCH, Studyflix](https://studyflix.de/allgemeinwissen/fresch-methode-9364); [ANTON Deutsch 3](https://anton.app/de/lernen/deutsch-3-klasse/)). Bayern koppelt jede Strategie an Wortartwissen: Verlängern setzt Mehrzahl, Personalform oder Adjektivbeugung voraus. Deshalb laufen in der Karte viele Voraussetzungen von `schreiben` nach `grammatik`.

## Montessori und Lernforschung ziehen am selben Strang, mit dünnen Stellen

Montessori-Mathematik folgt einem wiederkehrenden Muster, das der Würzburger Materialkatalog belegt ([Lernwerkstatt Uni Würzburg 2012](https://www.sonderpaedagogik.uni-wuerzburg.de/fileadmin/06040060/Infoblaetter_und_Uebersichtslisten/Montessorimaterial_LWS_01_2012.pdf)): **erst Menge, dann Symbol, dann Zuordnung, dann Operation, dann Notation**. Die Numerischen Stangen zeigen die Menge ohne Ziffer, die Sandpapierziffern die Ziffer ohne Menge ([Anleitung Sandpapierziffern](https://montessori-material.de/tpl/download/anleitung-sandpapierziffern.pdf)), erst danach kommt beides zusammen. Beim Stellenwert verläuft die Abstraktion in drei Stufen. Zuerst zeigt die **Größe** den Wert (Goldenes Perlenmaterial), dann die **Farbe** (Markenspiel), schließlich die **Position** (Rechenrahmen, Papier). Das Markenspiel gilt als die eigentliche Brücke vom handelnden zum abstrakten Rechnen ([Uni Regensburg, Lernwerkstatt](https://www.uni-regensburg.de/mathematik/studieren/didaktik/lernwerkstatt/montessori-material)). Streifenbretter und Tabellen für das Einspluseins kommen bewusst erst *nach* dem Operationsverständnis. Sie sind reine Merkarbeit, genau wie die deutsche Folge „Verständnis vor Automatisierung“. Die Sprache trennt vier Schwierigkeiten: Hören (Lautspiel), Hand (Metalleinsätze), Laut und Zeichen (Sandpapierbuchstaben) und Wortaufbau (Bewegliches Alphabet). Dabei steht **Schreiben vor Lesen** ([Leseprobe „Montessori einfach klar“ Bd. 3](https://www.montessori-material.de/tpl/download/leseprobe-montessori-einfach-klar-band-3.pdf)). Das Bewegliche Alphabet nimmt die Handschrift ausdrücklich heraus und lässt sich deshalb gut digital übertragen. Die Altersangaben, die genaue „isolierte Schwierigkeit“ je Material, die Liste der deutschen Phonogramme und der Wortlaut der Dreistufenlektion sind **[FW]** und vor Übernahme gegen ein Ausbildungsalbum zu prüfen.

Für die Wortarten sind im deutschen Material nur wenige Symbole belegt. Das **Nomen ist ein großes schwarzes Dreieck**, der Artikel ein kleines hellblaues Dreieck, das Pronomen ein lila Dreieck, das **Verb ein roter Kreis**, das Adverb ein kleiner oranger Kreis. Das Adjektiv ist ein Dreieck, „etwas dünner/heller“, nach AMI-Standard mittelgroß und dunkelblau [FW] ([Anleitung Wortartensymbole](https://cdn02.plentyone.com/ihry4r7lok1l/frontend/anleitungen/Anleitung_Wortartensymbole.pdf); [meinUnterricht, Roter Kreis, schwarzes Dreieck](https://www.meinunterricht.de/arbeitsblaetter/dokument/roter-kreis-schwarzes-dreieck-mit-montessori-symbolen-wortarten-unterscheid-a-5bd1b562504f7e0016d6b532/)). Bei Präposition, Konjunktion und Interjektion schwanken Hersteller und Schulen. Eine Schule hat das Nomen sogar auf Blau umgestellt ([lehrerforen.de](https://www.lehrerforen.de/thread-pdf-export/55294)). Montessori formuliert das Prinzip selbst: „Die Darstellung verändert sich, die Bedeutung der Symbole bleibt immer gleich.“ Die App muss sich also auf *eine* Belegung festlegen. Die Fehlerkontrolle liegt im Material oder auf Kontrollkarten, nicht beim Erwachsenen. Der Erwachsene beobachtet und bietet das Material später erneut dar, statt zu korrigieren ([AMI, Soholt: Control of Error](https://montessori-ami.org/sites/default/files/downloads/voices/ControlofError.pdf)). Das entspricht fast wörtlich der geplanten Wiedervorlage.

Die Wirksamkeit von Montessori ist real, aber klein. Die Campbell-Review mit 32 Studien findet **g = 0,22 für Mathematik und g = 0,17 für Sprache**, mit größeren Effekten im Vorschul- und Grundschulalter. Nur 10 der 32 Studien setzten Montessori vollständig um ([Randolph et al. 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10406168/)). Klassische Programme mit hoher Umsetzungstreue übertrafen solche, die konventionelles Zusatzmaterial beimischten ([Lillard 2012, ERIC](https://eric.ed.gov/?id=EJ969249); [Lillard & Heise 2016](https://journals.ku.edu/jmr/article/download/5678/5243)). Fast alle Studien stammen aus dem Umfeld von Angeline Lillard und betreffen vor allem 3- bis 6-Jährige. Zu digitalem Montessori gibt es **keine Wirksamkeitsstudie**, nur eine Masterarbeit zu Gestaltung und Engagement ([Chapman University](https://digitalcommons.chapman.edu/eecs_theses/1)). Die App sollte sich deshalb nicht auf diese Effektstärken berufen. Was sie übernehmen kann, ist die Konsequenz: wenige, sauber gestufte „Materialien“ ohne Gamification-Schicht.

Die Lernforschung bestätigt die meisten Grundsätze aus dem Leitbild. Belegt sind sie aber unterschiedlich gut, und gerade für Grundschulkinder ist die Lage oft dünn:

| Grundsatz | Befund | Stärke für 6–10-Jährige |
|---|---|---|
| Verteiltes Abrufen (Wiedervorlage) | Verteiltes Abrufen schlägt geballtes (g = 0,74). Wachsende Abstände bringen gegenüber gleichen **keinen Vorteil** (g = 0,034) ([Latimier et al. 2021](https://doi.org/10.1007/s10648-020-09572-8)). Kinder profitieren vom Abrufüben wie Erwachsene [L] ([Fazio & Marsh 2019](https://doi.org/10.1177/0963721418806673)). | gut für Abrufen; Leitner-Intervalle für 6–8-Jährige nicht untersucht |
| Erst blocken, dann mischen | Viertklässler, gemischt statt geblockt geübt: **doppeltes Testergebnis nach einem Tag** ([Taylor & Rohrer 2010](https://doi.org/10.1002/acp.1598)). Mischen nützt vor allem bei ähnlichen, verwechselbaren Typen [L] ([Brunmair & Richter 2019](https://doi.org/10.1037/bul0000209)). | dünn; eine Studie zur Grundschule |
| Material → Vorstellung → Kopf | Schrittweise Abstraktion („Concreteness fading“) wirkt besser als nur konkret oder nur abstrakt, wenn der Übergang ausdrücklich gezeigt wird [L] ([Fyfe et al. 2014](https://doi.org/10.1007/s10648-014-9249-3)). Material wirkt nur, wenn Kinder die Verbindung zur mathematischen Idee verstehen ([EEF-Leitfaden EY/KS1](https://dera.ioe.ac.uk//35027/1/EEF_Maths_EY_KS1_Guidance_Report.pdf)). | mittel |
| Beherrschungskriterium | **3 richtige in Folge** genügen als Übungsmenge ([Kelly et al. 2015, ASSISTments](https://www.educationaldatamining.org/EDM2015/proceedings/poster630-631.pdf)). Strengere Kriterien bringen größere Effekte [L] ([Kulik et al. 1990](https://doi.org/10.3102/00346543060002265)). | gemessen an Klasse 6–8, nicht an Grundschulkindern |
| Tempo still messen | Die 3-Sekunden-Grenze filtert gezählte Antworten heraus, lässt aber abgeleitete Antworten durch ([Bajwa, Erstklässler](https://www.ideals.illinois.edu/items/45535)). Zeitdruck hilft erst bei hoher Genauigkeit und kann Angst auslösen ([APS-Review](https://www.newswise.com/articles/science-explains-how-children-best-learn-math-and-yes-timed-practice-helps)). | mittel; Touch-Motorik verzerrt die Zeiten |
| Keine Belohnungen | Erwartbare Belohnungen senken die intrinsische Motivation, **bei Kindern stärker** als bei Studierenden; informatives Lob kann sie heben [L] ([Deci, Koestner & Ryan 1999](https://doi.org/10.1037/0033-2909.125.6.627)). Gegenposition: [Cameron & Pierce 1994](https://doi.org/10.3102/00346543064003363). | gut, aber umstritten |
| Rückmeldung mit richtigem Weg | Rückmeldung zur Aufgabe wirkt, Lob und Belohnung am schwächsten [L] ([Wisniewski et al. 2020](https://doi.org/10.3389/fpsyg.2019.03087)). Mathe-Apps für die ersten Schuljahre wirken besser mit gestuftem Lernweg und Erklärungen ([Outhwaite et al. 2023](https://pure.qub.ac.uk/en/publications/understanding-how-educational-maths-apps-can-enhance-learning-a-c/)). | mittel |
| Spielmechanik | Digitale Förderung wirkt mittel (0,55). **Videospiel-Elemente bringen keinen Zusatznutzen** gegenüber digitalem Üben ([Benavides-Varela et al. 2020](https://research.unipd.it/handle/11577/3345422)). | gut (RCTs, Kinder mit Rechenschwierigkeiten) |
| Eltern als Begleiter | GraphoGame wirkt im Mittel nicht (g = −0,02). Einziger signifikanter Moderator ist **hohe Beteiligung Erwachsener (g ≈ 0,48)** ([Ahmed et al. 2020](https://www.frontiersin.org/articles/10.3389/feduc.2020.00132)). | mittel (Lesen) |

Zwei fachspezifische Befunde prägen die Reihenfolge. In Mathe fasst Krajewskis Modell drei Ebenen: Zahlwortfolge und Mengen, dann Zahl und genaue Menge, dann Teil-Ganzes und Zahlbeziehungen ([Dissertation Skillen, KU Eichstätt](https://edoc.ku.de/id/eprint/29849/1/DissertationJohannaSkillen.pdf)). Gaidoschiks Längsschnitt mit 139 Kindern zeigt, dass im Unterricht überwiegend zählendes Rechnen geübt wurde, Ableiten kaum ([ForMaD Bamberg](https://www.uni-bamberg.de/matheinfdidaktik/wissenstransfer/formad/berichte-formad/bericht-formad-090611/)). Zählendes Rechnen sei „weder notwendig noch förderlich“ ([Gaidoschik & Fellmann 2015](https://core.ac.uk/download/46916729.pdf)); das beruht allerdings auf kleinen, qualitativen Stichproben. Daraus folgt: Kein Thema „schnell rechnen“ kommt vor gesicherten Zerlegungen und mindestens einer Ableitungsstrategie. Im Lesen gelingt Kindern im transparenten Deutsch das Erlesen bis Ende Klasse 1 fast fehlerfrei [L] ([Seymour et al. 2003](https://doi.org/10.1348/000712603321661859)). Der Engpass verschiebt sich auf Leseflüssigkeit und Rechtschreibung. Im IQB-Bildungstrend 2021 lagen in Klasse 4 **rund 30 % in Orthografie unter dem Mindeststandard**, beim Lesen 18 bis 19 % ([KMK, IQB-Bildungstrend](https://www.kmk.org/aktuelles-1/artikelansicht/iqb-bildungstrends.html)). Die Lese-Themen dürfen also zügig vorangehen. Langzeit-Wiederholung gehört vor allem zu Rechtschreibmustern und Merkwörtern. Der Streit um „Lesen durch Schreiben“ ist empirisch nicht entschieden. Ende Klasse 1 liegen LdS-Klassen hinten, danach ist kein Unterschied mehr erkennbar ([Brügelmann 2019 zu Funke](https://www.pedocs.de/volltexte/2019/17472/pdf/Bruegelmann_2019_Empirische_Studien_zur_Auswirkung.pdf)). Die Bonner Studie ist methodisch umstritten ([Uni Bonn 2018](https://www.uni-bonn.de/de/universitaet/presse-kommunikation/presseservice/archiv-pressemitteilungen/2018/237-2018); [news4teachers zur Kritik](https://www.news4teachers.de/?p=73884)). Für die Silbenmethode fanden die Rechercheure keine kontrollierte Wirksamkeitsstudie.

## Schrifterwerb: Druckschrift und Schreibschrift

Bayern lehrt die Schrift in zwei Phasen. Zuerst kommt eine unverbundene Schrift nach den „Richtformen der Druckschrift“, dann eine verbundene Schrift nach **Vereinfachter Ausgangsschrift (VA) oder Schulausgangsschrift (SAS)**. Die Lateinische Ausgangsschrift und die Grundschrift sieht der Lehrplan nicht vor ([LehrplanPLUS D1/2, 3.1](https://www.lehrplanplus.bayern.de/fachlehrplan/grundschule/1/deutsch)). Einen Zeitpunkt nennt der Lehrplan nicht. In der Praxis endet der Schreiblehrgang in Jahrgangsstufe 2 ([ISB, Materialien zur VA](https://www.isb.bayern.de/fileadmin/user_upload/Grundschule/Handreichung_Ausgangsschrift/ausgangsschrift-teil-1.pdf), S. 31). Die Verlage verlangen, dass vorher die Druckschrift gefestigt ist ([Westermann SAS](https://c.wgr.de/d/3259960131031ce479e6acec06d24c9dba22dc2c18c41be867803e49d46af0d9.pdf/WestermannSchreiblehrgang_Konzeptpapier_SAS.pdf)). Bremen beginnt mit der Schreibschrift erst, wenn ein Kind die meisten Buchstaben kennt, Druckschrift sicher liest und feinmotorisch so weit ist ([Bremen, Vorlage L 50/19](https://www.bildung.bremen.de/sixcms/media.php/13/L50_19%20Schreibschrifterwerb.pdf)). Daraus ergibt sich als Freigabe für die App: Ende Klasse 1 oder Anfang Klasse 2. Unsicher ist die Zukunft der Regel. Seit 2024/25 erprobt Bayern im Modellversuch **FlowBY** an 43 Schulen den einphasigen Weg von der Druckschrift direkt zu einer teilverbundenen eigenen Handschrift ([Uni Regensburg, FlowBY](https://www.uni-regensburg.de/humanwissenschaften/fakultaet/professuren/bildungswissenschaft/astrid-rank-grundschulpaedagogik/forschung/flowby)). Eine Grundsatzentscheidung könnte laut Presse 2026/27 fallen ([news4teachers 09/2025](https://www.news4teachers.de/2025/09/mit-welcher-schrift-lernen-erstklaessler-am-besten-handschreiben-modellversuch-solls-klaeren/)). Die Notizen empfehlen deshalb drei wählbare Pfade: VA, SAS und teilverbunden.

Die Schrittliste umfasst **82 Schritte in fünf Blöcken**: Vorstufen (Stifthaltung, Grundbewegungen, Zeilenraum), Druckschrift klein und groß, Ziffern, verbundene Schrift (Buchstabengruppen, Verbindungen, Großbuchstaben, Wort und Satz) und Handschrift in Klasse 3/4. Sie ersetzt die zehn groben Schrift-Schritte aus `deutsch_themen.md` (S1-01 bis S1-07, S2-32 bis S2-34). In der VA ist die Lerneinheit der Buchstabe, weil alle Kleinbuchstaben am oberen Mittelband beginnen und enden und ihre Form im Wort behalten, plus wenige Verbindungsregeln (Luftsprung vor dem Oval). In der SAS wird zusätzlich die Verbindung je Buchstabenpaar zur Lerneinheit, weil sich Formen nach dem Folgebuchstaben ändern („on“, „an“) ([ISB-VA](https://www.isb.bayern.de/fileadmin/user_upload/Grundschule/Handreichung_Ausgangsschrift/ausgangsschrift-teil-1.pdf), S. 9–12; [Westermann SAS](https://c.wgr.de/d/3259960131031ce479e6acec06d24c9dba22dc2c18c41be867803e49d46af0d9.pdf/WestermannSchreiblehrgang_Konzeptpapier_SAS.pdf)). Die bekannten Problemstellen der VA nennt eine bayerische Lehrerbefragung: s-Verbindungen, das Köpfchen-e, das z sowie die Ähnlichkeit von u/v, r/v, b/l und k/h. Die ISB-Übungskartei mit 30 Fehlerstellen eignet sich als fertige Liste von Wiedervorlage-Themen für Klasse 2 und 3. Die Gruppierung der Druckbuchstaben nach Bewegung (Zauber-c-Buchstaben, Brückenbuchstaben, schwierige wie f und q zuletzt) stammt aus dem US-Lehrgang Handwriting Without Tears und ist auf Deutsch übertragen **[E]**. Eine deutsche Quelle mit bewegungsbasierter Druckschrift-Reihenfolge fanden die Rechercheure nicht. Im Strang `lesen` bleibt die Lautfolge der Fibel, im Strang `schreiben` gilt die Bewegungsfolge. Ein Buchstabe wird im Schreibstrang frei, sobald er im Lesestrang bekannt ist.

Die Evidenz ordnet die drei App-Stufen klar. Fünfjährige aktivierten ein Lesenetzwerk im Gehirn nur nach freiem Handschreiben, **nicht nach Tippen oder Nachspuren** ([James & Engelhardt 2012](https://can.lab.indiana.edu/research/research-files/2012-kje_teofheofbdiplc.pdf)). Bei Erstklässlern mit Schreibproblemen war die Kombination aus nummerierten Pfeilen und Schreiben aus dem Gedächtnis allen anderen Varianten überlegen ([Berninger et al. 1997, Pressemitteilung UW](https://www.washington.edu/news/1998/01/30/in-spite-of-computers-handwriting-instruction-is-important-because-of-carry-over-to-composition/); Original nicht gelesen). Nachspuren, Hohlschriften und Schablonen fördern flüssige Bewegungen nicht nachweislich (ISB, S. 21–22). Daraus folgt: `material` = Nachspuren mit Startpunkt und nummerierten Pfeilen, groß und ohne Lineatur; `vorstellung` = nur Startpunkt und blasse Form; `kopf` = die Bewegung einmal zeigen, ausblenden, dann aus dem Gedächtnis schreiben. Nur `kopf` darf ein Schrift-Thema abschließen. Eine Meta-Analyse findet für technologiegestützten Handschriftunterricht große Effekte auf die Leserlichkeit (ES 0,85), meist allerdings im Vergleich mit gar keinem Unterricht ([Santangelo & Graham 2016](https://acuresearchbank.acu.edu.au/item/85wx5/a-comprehensive-meta-analysis-of-handwriting-instruction)). Die Automatisierung braucht lange. Ende Klasse 2 sind die meisten Kinder „noch weit von automatisierten und routinierten Schreibbewegungen entfernt“, und die Kreisbewegung ist erst bei gut 80 % flüssig (LufT-Studie, ISB, S. 24–25). Teilverbundene Schrift war in einem Presse-Experiment schneller als vollverbundene, um 4 s bei 22 s für einen Satz ([news4teachers 09/2025](https://www.news4teachers.de/2025/09/mit-welcher-schrift-lernen-erstklaessler-am-besten-handschreiben-modellversuch-solls-klaeren/)).

Die Notizen schlagen vor, Flüssigkeit über die Geschwindigkeitswechsel je Strich zu messen, wie es die LufT-Studie tat, und als „Flüssig-Stern“ anzuzeigen. **Ein Stern widerspricht dem Leitbild ohne Belohnungen.** Flüssigkeit sollte wie das Tempo im Rechnen *still* gemessen werden. Sie steuert die Stufenwahl und die Wiedervorlage und erscheint höchstens neutral im Elternbereich. Auch die Bewertung mit „Sternen unter den Besten“ (H-04) sollte in eine Selbstwahl ohne Sterne umgedeutet werden: „Welches deiner drei u gefällt dir am besten?“ Bewertet wird nach dem Strich und mit Toleranz für die Form, nicht während des Strichs. Geprüft werden Startpunkt, Richtung und Strichfolge. Sofortiges Tablet-Feedback half Vorschulkindern in einer Studie nicht ([Patchan & Puranik 2016](https://dblp.uni-trier.de/rec/journals/ce/PatchanP16.html); Befund aus einer Sekundärquelle). Die Stifthaltung kann die App nicht prüfen; dazu gehört ein Elternhinweis. Ebenfalls offen ist eine Lizenzfrage: Startpunkte und Strichfolgen der amtlichen Richtformen fehlen noch. Wer Schriftdateien oder Vorlagen übernehmen will, muss die Rechte klären.

## Sprechen, Texte und mathematische Prozesse lassen sich weitgehend ohne Freitext spielen

Drei weitere Bereiche gehören zum Pflichtstoff, sind aber keine Rechen- oder Rechtschreibfakten. **Sprechen und Zuhören** führt die KMK 2022 als eigenen Kompetenzbereich mit vier Kernbereichen, Bayern als Lernbereich 1 mit fünf Teilbereichen: verstehend zuhören, zu anderen sprechen, Gespräche führen, über Lernen sprechen, szenisch spielen ([KMK Deutsch 2022](https://www.schulportal.sachsen.de/lplandb/material/67/X2wP6FHMVPxXWUYMuMjO); [LehrplanPLUS D1/2](https://www.lehrplanplus.bayern.de/fachlehrplan/grundschule/1/deutsch)). Für das Zuhören gibt es eine fertige Schwierigkeitsleiter aus dem Kompetenzmodell von VERA 3, Stufen I bis V: von einer prominenten Einzelinformation bei einer Stimme bis zum eigenständigen Beurteilen langer Texte mit mehreren Sprechern und Störgeräuschen. Der Bedarf ist groß: In Baden-Württemberg kamen 2024 **28 % der Drittklässler nicht über Stufe I hinaus**, bei Kindern mit nicht-deutscher Alltagssprache 63 % ([ZSL/Imhof, Starke BASIS Zuhören](https://www.blogs.uni-mainz.de/fb02-psych-bildung-news/files/2025/11/Starke-BASIS_Zuhoeren_250812.pdf)). Wirksamkeitsstudien zur Zuhörförderung in der Grundschule sind dagegen dünn, zu App-Trainings gibt es keine. Die Notizen schneiden **72 Schritte** (55 spielbar, 17 teilweise). Sie brauchen keine Lesefähigkeit und funktionieren deshalb vom ersten Schultag an. Wie man sie in der `lernplan.json` einordnet, ist offen; die Notizen empfehlen einen eigenen Strang `sprechen` (siehe Entscheidung 3). Produktives Sprechen lässt sich ohne Spracherkennung nur über Aufnahme, Vorbild und Selbsteinschätzung abbilden. Die KMK nennt das Aufzeichnen und mehrmalige Hören selbst als Standard. Nacherzählen gelingt Kindern deutlich besser als freies Erzählen: Bei Neunjährigen liegt die freie Erzählung **3 bis 4 Jahre hinter der Nacherzählung** zurück. Gefühle der Figur und Spannung erscheinen erst um neun Jahre ([Neitzel & Meier 2023](https://eldorado.tu-dortmund.de/bitstream/2003/42576/1/meier-neitzel-2023-erhebungsmethoden-zur-erfassung-der-erz%c3%a4hlf%c3%a4higkeit-von-kindern-im-vor-und-grundschulalter.pdf)). Nacherzählen gehört also vor freies Erzählen, Spannung in Klasse 3 und 4.

**Texte verfassen** (58 Schritte, 48 spielbar) gehört in den Strang `schreiben`. Hier ist die Evidenz stark. Die Meta-Analyse von Graham und Kollegen über Schreibunterricht in der Grundschule findet für **Strategieunterricht ES 1,02**, für das SRSD-Modell 1,17, für Peer-Unterstützung 0,89, für Produktziele 0,76 und für Textstrukturwissen 0,59. **Isolierter Grammatikunterricht verbessert die Textqualität nicht** ([Graham et al. 2012](https://asu.elsevierpure.com/en/publications/a-meta-analysis-of-writing-instruction-for-students-in-the-elemen/)). Eine deutsche Replikation mit 113 Viertklässlern bestätigt den Nutzen von Strategietraining mit Selbstregulation, auch fünf Wochen später ([Glaser & Brunstein 2007](https://forschung.uni-giessen.de/converis/portal/detail/Publication/1130288618?lang=de_DE)). Für die Karte heißt das: Wortfelder, Pronomen und Satzverbinden im Textzusammenhang üben, nicht nur als Grammatik-Themen. Planen, Teile ordnen, Einfügen und Umstellen sind als Touch-Spiele prüfbar. Ob solche Legespiele auf freie Texte übertragen, hat niemand untersucht. Freies Schreiben bleibt ein optionaler Werkstattmodus ohne Bewertung.

Die **prozessbezogenen Kompetenzen Mathematik** sind laut KMK 2022 sechs, mit „Mit mathematischen Objekten und Werkzeugen arbeiten“ als neuer Kompetenz. Für das Problemlösen nennt die KMK als Heurismen systematisches Probieren, Analogien, Rückwärtsarbeiten, Skizzen und Tabellen ([KMK 2022 Mathe](https://www.kmk.org/fileadmin/Dateien/veroeffentlichungen_beschluesse/2022/2022_06_23-Bista-Primarbereich-Mathe.pdf)). Bayern webt sie in die Lernbereiche ein, statt sie getrennt aufzulisten ([LehrplanPLUS Fachprofil Mathematik](https://www.lehrplanplus.bayern.de/fachprofil/grundschule/mathematik)). Die Notizen schneiden **112 Schritte** (95 spielbar, 17 teilweise). Jedes substanzielle Format wird dabei in eine Kette zerlegt: rechnen → Muster sehen → vorhersagen → Veränderung prüfen → Begründung wählen → Ziel erreichen oder umkehren → selbst erfinden ([PIKAS, Entdeckerpäckchen](https://pikas.dzlm.de/pikasfiles/uploads/upload/Material/Haus_1_-_Entdecken_Beschreiben_Begruenden/UM/Entdeckerpaeckchen/Basisinfos/H1_UM_EP_Lehrer_Basisinfo_Reihe.pdf)). Das gilt für Entdeckerpäckchen, Zahlenmauern, Rechendreiecke und ähnliche Formate. Am besten belegt sind visuelle Darstellungen und das Überwachen des eigenen Lösungswegs, beide mit „strong“ bewertet ([IES Practice Guide Problemlösen, Kl. 4–8](https://ies.ed.gov/ncee/wwc/PracticeGuide/16)). Dazu kommt das Erkennen von Sachaufgaben-Typen mit sehr großen Effekten bei Grundschulkindern, g = 1,57, Transfer 1,09, überwiegend aus US-Studien ([Peltier & Vannest 2017](https://eld.bl.uk/catalog/100072653733_0x000001)). Wenn die Kinder ihr Vorgehen selbst erklären, hilft das klein bis mittel, besser in strukturierter Form als offen ([Rittle-Johnson et al. 2017](https://link.springer.com/article/10.1007/s11858-017-0834-z)). Eine App, die Begründungen zur Auswahl stellt, statt Freitext zu verlangen, ist also kein Notbehelf. Ein Befund betrifft die Reihenfolge direkt: Der Kapitänseffekt, bei dem Kinder unsinnige Aufgaben einfach ausrechnen, **wächst mit der Schulzeit**, von etwa 10 % in Klasse 1 auf 54 bis 71 % in Klasse 3/4 ([KIRA, Kapitänsaufgaben](https://kira.dzlm.de/kirafiles/uploads/doc/Kapitaensplakat.pdf)). Unlösbare Aufgaben gehören deshalb schon ab Klasse 2 und wiederkehrend in den Plan, gemischt mit lösbaren. Reines Signalwort-Training verstärkt den Effekt vermutlich. Im Plan schließt jeder Prozessschritt an seinen Inhaltsschritt an und bildet keinen eigenen Block am Ende. Die Zahlenmauer etwa läuft als Kette M1-43 → PL1-05 → PL2-03 → PL2-04 → AR3-01 → PL3-01 → PL4-01 → PL4-06. Drei Doppelungen mit der Inhaltskarte sind zusammenzuführen: M2-85 mit MO2-02, M4-36 mit MO3-04 und M3-58 mit PL3-05.

## Was daraus für die lernplan.json folgt

**Themengröße.** Ein Thema umfasst eine neue Idee, eine Strategie oder einen klar abgegrenzten Aufgabentyp. Prüfregel: Kann ein Thema an zwei verschiedenen Ursachen scheitern, wird es geteilt. Die Schritte der Karte erfüllen diese Regel weitgehend. Gröber dürfen nur Größen und Geometrie sein, wenn ein Spiel sie ohnehin nicht feiner bedient. Ein Konflikt mit dem Entwurf ist zu klären: Der Entwurf schneidet ab der 6 nach Ergebnis („Rechnen mit der 7“, Familie aus Plus und Minus). Die Fachdidaktik und die Karte schneiden nach Aufgabentyp und Strategie (M1-26 „Plus 0 und plus 1“, M1-29 „Verdoppeln“, M1-30 „Ergebnis 10“, M1-35 „Minus von 10“). Beides lässt sich verbinden: „Rechnen mit der n“ bleibt das Thema für die Zahlenzauber-Schlüssel, die Strategie-Themen kommen als eigene Themen mit eigenen Aufgabenschlüsseln dazu. Die Frage steht unten als Entscheidung.

**Voraussetzungen.** Die Karte unterscheidet zwei Arten von Abhängigkeit, und der Plan sollte sie auch unterscheiden. Ein *Einführungs*-Nachfolger darf beginnen, sobald der Vorgänger „kann ich“ erreicht hat. Ein *Abruf*-Nachfolger wie „Blitzrechnen 1+1“ (M1-72) oder „Einmaleins gemischt“ (M2-57) sollte erst kommen, wenn der Vorgänger eine verzögerte Wiedervorlage bestanden hat. Nur dann ist er wirklich gesichert. Voraussetzungen über Stränge hinweg sind die Regel, nicht die Ausnahme: Verlängern setzt Mehrzahl und Personalform voraus, Maßstab setzt Längeneinheiten voraus, Pronomenbezug im Lesen setzt Pronomen voraus. Beim Zusammenführen sind zwei Fehler in den Rohnotizen aufgefallen. Erstens benutzen `geometrie` und `grammatik` beide das Präfix „G“. Die Karte benennt sie deshalb in **Geo…** und **Gr…** um. Zweitens verweisen zwölf Deutsch-Schritte auf offensichtlich verschobene Grammatik-IDs: „Verlängern: Verb“ zeigte auf „Mehrzahl mit -s“ statt auf „Verb passt zur Person“. Die Karte korrigiert diese Verweise und markiert sie mit **‡**.

**Stufen.** material → vorstellung → kopf ist Concreteness Fading. Die Studien zeigen: Wirksam ist der *ausdrückliche* Übergang am selben Bild, nicht das Material an sich. Dasselbe Zehnerfeld ist erst zum Anfassen da, dann nur kurz zu sehen oder verdeckt, dann fehlt es ganz. Montessoris Folge Größe → Farbe → Position gibt dafür ein Muster für Stellenwert-Themen. Eine Warnung betrifft die vorhandenen Perlenspiele unmittelbar. Das DZLM rät, **zählende Rechenhilfen wie einzelne Perlen zu vermeiden**, und empfiehlt strukturierte Darstellungen ([DZLM, Einspluseins](https://maco.dzlm.de/sites/maco/files/dzlm_maco_prim_addsubt_211007.pdf)). Auf der Stufe `material` sollten Perlen deshalb in Fünfer- und Zehnergruppen farbig gegliedert sein, wie bei Montessoris Perlenstangen. Langes Zählen auf Stufe `kopf` ist ein Signal: Die Steuerung stuft dann auf die Strategie- oder Vorstellungsebene zurück, statt mehr Drill anzusetzen.

**Wiedervorlage und Mischen.** Der in den Notizen genannte Leitner-Plan [0, 1, 3, 7, 21] passt zur Evidenz. Dass seine Abstände wachsen, wirkt laut Latimier nicht von selbst, schadet aber auch nicht. Für das Behalten über ein Schuljahr kann eine Stufe um 60 Tage dazukommen [L] ([Cepeda et al. 2008](https://doi.org/10.1111/j.1467-9280.2008.02209.x)). Neue Themen werden geblockt eingeführt und erst in der Wiederholung gemischt, und zwar gezielt mit ihren Verwechslungspartnern. Diese Partner sollte der Plan ausdrücklich angeben, etwa als zweites Feld neben `familie`: Plus/Minus, Verdoppeln/Halbieren, d/t, i/ie, ä/e, ck/k nach l, n, r. Bei ihnen ist der Nutzen des Mischens am größten. Rosenshine empfiehlt beim Üben eine Erfolgsquote um 80 % [L] ([Rosenshine 2012](https://www.aft.org/sites/default/files/Rosenshine.pdf)). Fällt sie in einer Runde darunter, tritt Neues zurück.

**Probe.** Die Probe des Entwurfs (bis zu 5 Kopf-Aufgaben, alle richtig, ohne Hilfe, nicht mühsam) ist strenger als die Forschungsempfehlung, die „mindestens 3 Aufgaben aus verschiedenen Untertypen“ vorschlägt. Damit liegt sie auf der sicheren Seite. Die Forschung rät aber, eine bestandene Probe erst durch eine verzögerte Wiedervorlage zu bestätigen, nicht durch sofortige Einstufung als „sitzt“. Genau das tut der Entwurf, indem er die Aufgaben in Fach 1 legt. Ob Fach 1 oder ein höheres Fach besser ist, hat niemand untersucht. Bei Krajewski-artigen Ketten kann die Probe von oben nach unten laufen: Wer „Plus mit Übergang gemischt“ (M1-64) besteht, braucht die Probe für „Plus mit 9“ nicht.

**Regel vor Merkwort und Namen ohne Zahl.** Die Deutsch-Schritte tragen schon einen Typ: **R** für Regel (154 Schritte), **M** für Merkwort (25), **M/R** für gemischt (6) und **F** für Fertigkeit (117). Dieser Typ gehört als Feld in die `lernplan.json`. Dann lässt sich prüfen, dass jedes M-Thema hinter seinem R-Gegenstück steht, zum Beispiel „Merkwörter: langes i ohne ie“ (S3-29) hinter „ie bei langem i“ (S2-12). Weil Zahlen nie gesprochen werden, reicht ein Themenname wie „Die 7 zerlegen“ nicht. Jedes Thema mit Ziffer im Namen braucht ein zweites, vorlesbares Namensfeld ohne Zahl, etwa „Zerlegen“, während die Ziffer groß im Bild steht. Das Beispiel-Thema im Entwurf hat dieses Feld noch nicht. Viele Schrittnamen der Karte enthalten Ziffern und brauchen beim Übertragen ein solches Feld.

**Neue Bereiche.** Schrift-Themen brauchen ein Feld für den Schriftpfad. Die Blöcke V, DK, DG und Z gelten für alle Kinder, danach verzweigt der Plan nach VA, SAS oder teilverbunden; SV-02 gilt nur für die VA, SV-03 und SB-11 nur für die SAS. Schritte mit der Spielbarkeit „teilweise“ (eigene Geschichte, freies Begründen, Vortrag) zählen nur mit ihrem prüfbaren Teil für „kann ich“. Den Rest sollte der Plan als Elternanregung führen, nicht als Bewertung. Prozessschritte werden nie mit Tempo gekoppelt. Ihre Beherrschung zeigt sich eher an einer richtigen Begründung in zwei verschiedenen Formaten. Begründungsoptionen und Sachaufgaben sollten in Klasse 1 und 2 antippbar vorgelesen werden, damit das Lesen sie nicht blockiert. Für die Ziffern gilt: Z-01 bis Z-04 im Schrift-Block und M1-05 im Mathe-Strang sind dieselbe Fertigkeit. Sie sollten als *ein* Thema mit Voraussetzungen in beide Richtungen geführt werden.

**Keine Belohnungen, auch keine versteckten.** Freischaltungen können wie Belohnungen wirken. Fortschritt sollte deshalb neutral als „jetzt kannst du …“ erscheinen. Die Eltern-Hinweise je Thema sind gut begründet, weil die Begleitung durch Erwachsene bei Lese-Apps der stärkste bekannte Moderator ist. Sie gehören vor allem an die Lese-Themen, an die Sprech-Themen und an die Stifthaltung, die keine App prüfen kann.

## Fazit

Die eigentliche Arbeit beim Befüllen der `lernplan.json` liegt nicht mehr im Finden der Themen. Die Karte unten liefert sie in Planreihenfolge, mit Voraussetzungen und Beleg. Zu tun bleibt zweierlei. Christian muss **den Umfang begrenzen**: Mit den vorhandenen Spielen sind realistisch nur die Mathe-Schritte der Klassen 1 und 2 und ein kleiner Teil der Deutsch-Schritte bedienbar. Schrift, Zuhören und die Prozessschritte brauchen jeweils eigene Spielmechaniken (Nachspuren, Audio mit Aufnahme, Auswahl von Begründungen). Und die Schritte brauchen **Meta-Felder, die der Entwurf noch nicht hat**: Typ R/M/F, Art der Abhängigkeit (Einführung oder Abruf), Verwechslungspartner fürs Mischen, die Bayern-Kennung für Sonderwege, den Schriftpfad (VA, SAS, teilverbunden) und die Spielbarkeit (spielbar oder teilweise). Der wichtigste Befund: Die schwächsten Stellen des Plans liegen nicht im Stoff, sondern in den Parametern: ab wann ein Thema als beherrscht gilt, welche Antwortzeit noch als flüssig zählt, wie viel pro Runde gemischt wird. Für keinen dieser Werte gibt es Belege an Grundschulkindern. Die App sollte sie deshalb als einstellbare Parameter führen und anonymisiert auswerten, wie oft Kinder aus späten Wiedervorlage-Fächern zurückfallen. Nicht der Lehrplan wird das Kriterium für „sitzt“ zuverlässig festlegen, sondern diese Daten.

## Themenkarte je Strang und Klasse

**Lesart.** Die Reihenfolge innerhalb eines Strangs ist die vorgeschlagene Planreihenfolge. **Vor.** nennt die Voraussetzungen; „–“ bedeutet: keine. IDs: `M` = mathe, `Geo` = geometrie (in den Rohnotizen „G“), `PL/AR/KO/MO/DA/WZ` = prozessbezogene Schritte (Problemlösen, Argumentieren, Kommunizieren, Modellieren, Darstellen, Werkzeuge; Strang mathe oder geometrie laut Spalte), `L` = lesen, `S` = schreiben, `V/DK/DG/Z/SB/SV/SG/SW/H` = Schrifterwerb (Strang schreiben), `TV` = Texte verfassen (Strang schreiben), `Gr` = grammatik (in den Rohnotizen ebenfalls „G“), `SZ` = Sprechen und Zuhören (Strang offen, Entscheidung 3). **Beleg:** Q = so oder fast so aus einer Quelle (LehrplanPLUS, KMK, PIKAS/DZLM, NRW, Westermann-BW, KLA, FRESCH u. a.); E = eigene Unterteilung, bei der die Quelle nur das Oberthema nennt; Q+E = beides. **Typ** (nur Deutsch): R = Regel, M = Merkwort/Merkstelle, F = Fertigkeit/Verstehen. ★ = in den Notizen ausdrücklich als Stolperstein markiert (meist [E], ohne Primärquelle). (!) = wenig spielgeeignet. **Spiel** (neue Bereiche): spielbar = ohne Freitext automatisch prüfbar; teilweise = nur ein Teil prüfbar (Auswahl, Selbsteinschätzung), der Rest ist Elternanregung. **Schrift**: beide = für alle Pfade; VA/SAS = nur dieser Pfad. ‡ = Voraussetzung gegenüber den Rohnotizen korrigiert (verschobene Grammatik-ID). Klassenzuordnung: Bayern fasst 1/2 und 3/4 zusammen. Die Zuordnung zu einer einzelnen Klasse folgt Lehrwerkspraxis und ist für 3 und 4 durchweg Inferenz. Alle Beispielwörter und -aufgaben haben die Rechercheure selbst formuliert, nicht aus Fibeln oder Grundwortschatzlisten übernommen. Silbengrenzen, Wortarten und bayerische Aussprache (z. B. „Kino“) sind vor der Übernahme fachlich gegenzuprüfen.


### Strang mathe (273 Schritte)

#### Klasse 1 – Zahlbegriff bis 10 (mathe)

| ID | Schritt | Beispiel | Vor. | Beleg |
|---|---|---|---|---|
| M1-01 | Mehr, weniger, gleich viele | Reichen die Teller für die Kinder? | – | E |
| M1-02 | Zahlenreihe vorwärts | Zähle ab 4 weiter | – | E |
| M1-03 | Rückwärts zählen | 10, 9, 8 … Start! | M1-02 | Q |
| M1-04 | Abzählen | Wie viele Äpfel? | M1-02 | E |
| M1-05 | Ziffern 0–10 lesen und schreiben | Schreibe die 3 | – | Q |
| M1-06 | Menge, Bild, Ziffer | Welches Würfelbild passt zur 5? | M1-04, M1-05 | E |
| M1-07 | Auf einen Blick bis 5 | Blitzblick: 4 Punkte | M1-06 | Q |
| M1-08 | Zehnerfeld: 5 und noch | 7 = 5 + 2 am Feld | M1-07 | Q |
| M1-09 | Die Null ★ | Im Nest sind 0 Eier | M1-04 | E |
| M1-10 | Wofür Zahlen stehen | Ist die 3 auf dem Trikot eine Anzahl? | M1-04 | Q |
| M1-11 | Der Erste bis der Zehnte | Das wievielte Tier ist die Ente? | M1-02 | E |
| M1-12 | Nachbarzahlen bis 10 | _ 6 _ | M1-02, M1-03 | Q |
| M1-13 | Zahlen ordnen | 3, _, 5, _, 7 | M1-12 | Q |
| M1-14 | Größer, kleiner, gleich (Zeichen) | 4 _ 7 | M1-01, M1-13 | Q |
| M1-15 | Zahlenstrahl bis 10 | Wo wohnt die 8? | M1-13 | Q |

#### Klasse 1 – Zahlzerlegung (mathe)

| ID | Schritt | Beispiel | Vor. | Beleg |
|---|---|---|---|---|
| M1-16 | Zerlegen 2, 3, 4 | 4 = 1 + 3 = 2 + 2 | M1-08 | E |
| M1-17 | Zerlegen der 5 | 5 = 2 + _ | M1-16 | E |
| M1-18 | Zerlegen der 6 | 6 = 4 + _ | M1-17 | E |
| M1-19 | Zerlegen der 7 | 7 = 5 + _ | M1-18 | E |
| M1-20 | Zerlegen der 8 | 8 = 3 + _ | M1-19 | E |
| M1-21 | Zerlegen der 9 | 9 = 6 + _ | M1-20 | E |
| M1-22 | Zerlegen der 10 | 10 = 7 + _ | M1-21 | Q |
| M1-23 | Zerlegungen ordnen | 0+8, 1+7, 2+6 … weiter | M1-18–M1-22 | E |
| M1-24 | Ergänzen bis 10 | 6 + _ = 10 | M1-22 | Q |

#### Klasse 1 – Plus und Minus bis 10 (mathe)

| ID | Schritt | Beispiel | Vor. | Beleg |
|---|---|---|---|---|
| M1-25 | Plus verstehen | 3 Vögel, 2 fliegen dazu | M1-16 | Q |
| M1-26 | Plus 0 und plus 1 | 6 + 0, 6 + 1 | M1-12, M1-25 | Q |
| M1-27 | Plus 2 und plus 3 | 5 + 2, 4 + 3 | M1-26 | E |
| M1-28 | Plus mit 5 | 5 + 3 | M1-17 | Q |
| M1-29 | Verdoppeln bis 5 + 5 | 4 + 4 | M1-25 | Q |
| M1-30 | Ergebnis 10 | 3 + 7 | M1-22 | Q |
| M1-31 | Tauschaufgaben | 1 + 8 → 8 + 1 | M1-26 | Q |
| M1-32 | Plus bis 10 gemischt | Alle Plusaufgaben bis 10 sicher | M1-26–M1-31 | E |
| M1-33 | Minus verstehen | 7 Kekse, 3 gegessen | M1-25 | Q |
| M1-34 | Minus 0, minus 1, alles weg | 8 − 0, 8 − 1, 8 − 8 | M1-33, M1-09 | E |
| M1-35 | Minus von 10 | 10 − 4 | M1-22 | Q |
| M1-36 | Halbieren bis 10 | Hälfte von 8; 8 − 4 | M1-29 | Q |
| M1-37 | Minus bis 10 gemischt |  | M1-34–M1-36 | E |
| M1-38 | Umkehraufgaben | 3 + 4 = 7 → 7 − 4 = 3 | M1-32, M1-37 | Q |
| M1-39 | Aufgabenfamilie | 2, 5, 7 | M1-31, M1-38 | E |
| M1-40 | Lückenaufgaben | 4 + _ = 9; 8 − _ = 5 | M1-38 | E |
| M1-41 | Unterschied finden | Tom hat 7, Lea 4 – wie viele mehr? | M1-40 | Q |
| M1-42 | Rechenkette bis 10 | 3 → +4 → −2 → +5 | M1-32, M1-37 | E |
| M1-43 | Zahlenmauer bis 10 | Zwei Nachbarsteine ergeben den Stein darüber;… | M1-40 | E |
| M1-44 | Rechendreieck bis 10 | Außenzahl = Summe der zwei Innenfelder | M1-43 | E |

#### Klasse 1 – Zahlen und Rechnen bis 20 (mathe)

| ID | Schritt | Beispiel | Vor. | Beleg |
|---|---|---|---|---|
| M1-45 | Zehner und Einer bis 20 | 13 = 1 Zehner und 3 Einer (Stange und Würfel) | M1-22 | Q |
| M1-46 | Zahlen 11–20 schreiben ★ | Diktat: siebzehn | M1-45 | E |
| M1-47 | Zwanzigerfeld | Zahlen bis 20 als „10 und noch“ erkennen | M1-45 | Q |
| M1-48 | Nachbarzahlen und Zahlenstrahl bis 20 | Ordnen, vergleichen, Nachbarn bis 20 | M1-47, M1-14 | Q |
| M1-49 | Gerade und ungerade | Paare bilden: bleibt einer übrig? | M1-29 | Q |
| M1-50 | Zehn plus | 10 + 6 | M1-47 | Q |
| M1-51 | Plus ohne Übergang (Analogie) | 3 + 4 → 13 + 4 | M1-50, M1-32 | Q |
| M1-52 | Ganze Zehner wegnehmen | 13 − 10, 17 − 7 | M1-47 | E |
| M1-53 | Von der 20 weg | 20 − 3 | M1-35, M1-52 | E |
| M1-54 | Minus ohne Übergang (Analogie) | 6 − 2 → 16 − 2 | M1-37, M1-52 | Q |
| M1-55 | Verdoppeln bis 10 + 10 | 6 + 6 … 10 + 10 auswendig | M1-29 | Q |
| M1-56 | Halbieren bis 20 | Hälfte von 14, 18 | M1-55 | Q |
| M1-57 | Fast-Verdoppeln | Nachbar einer Verdopplung: 6 + 7 = 6 + 6 + 1;… | M1-55 | Q |

#### Klasse 1 – Zehnerübergang Plus (mathe)

| ID | Schritt | Beispiel | Vor. | Beleg |
|---|---|---|---|---|
| M1-58 | Erst zur 10, dann weiter | 8 + 5 = 8 + 2 + 3 | M1-22, M1-24, M1-50 | Q |
| M1-59 | Plus mit 9 | 9 + 6 | M1-58 | Q |
| M1-60 | Plus mit 8 | 8 + 4 | M1-59 | E |
| M1-61 | Plus mit 7 | 7 + 5 | M1-60 | E |
| M1-62 | Plus mit 6 und 5 (Fünfertrick) | 6 + 7 = 5 + 5 + 1 + 2 | M1-61, M1-28 | Q |
| M1-63 | Kleine Zahl zuerst? Tauschen! | 3 + 9 als 9 + 3 rechnen | M1-31, M1-59 | E |
| M1-64 | Plus mit Übergang gemischt | Alle Aufgaben, eigene Strategie wählen | M1-57–M1-63 | E |

#### Klasse 1 – Zehnerübergang Minus (mathe)

| ID | Schritt | Beispiel | Vor. | Beleg |
|---|---|---|---|---|
| M1-65 | Minus bis zur 10 | 13 − 3, 17 − 7 | M1-52 | E |
| M1-66 | Übergang, kleiner Abzug (bis 5) | 13 − 5 = 13 − 3 − 2 | M1-65, M1-22 | Q |
| M1-67 | Übergang, großer Abzug (ab 6) | 15 − 8 = 15 − 5 − 3 | M1-66 | Q |
| M1-68 | Minus 9 über minus 10 | 16 − 9 = 16 − 10 + 1 | M1-52, M1-67 | Q |
| M1-69 | Ergänzen statt Abziehen | Bei nahen Zahlen hochzählen: 13 − 9 → von 9 b… | M1-40 | Q |
| M1-70 | Minus mit Übergang gemischt |  | M1-66–M1-69 | E |
| M1-71 | Umkehraufgaben bis 20 | 14 − 6 ← 6 + 8 = 14 | M1-64, M1-38 | Q |
| M1-72 | Blitzrechnen 1+1 | Alle Aufgaben bis 20 schnell abrufen (Automat… | M1-64, M1-70 | Q |
| M1-73 | Zahlenmauer, Rechendreieck, Rechenkette bis 20 |  | M1-43, M1-44, M1-72 | E |
| M1-74 | Was ist mehr? | Terme vergleichen: 8 + 5 _ 12; 9 + 4 _ 10 + 3 | M1-14, M1-64 | E |
| M1-75 | Päckchen mit Muster | 5+3, 5+4, 5+5 … | M1-32 | Q |
| M1-76 | Zahlenfolgen fortsetzen | 2, 4, 6, _; 20, 18, 16, _ | M1-48 | Q |

#### Klasse 1 – Sachrechnen, Größen, Daten (mathe)

| ID | Schritt | Beispiel | Vor. | Beleg |
|---|---|---|---|---|
| M1-77 | Rechengeschichte zum Bild | Passende Aufgabe zu einer Bildsituation finden | M1-25, M1-33 | Q |
| M1-78 | Frage finden | Zu einem Bild eine Rechenfrage stellen | M1-77 | Q |
| M1-79 | Münzen kennen | 1, 2, 5, 10, 20, 50 ct und 1, 2 € unterscheid… | M1-05 | E |
| M1-80 | Geld legen bis 20 | 8 ct = 5 + 2 + 1 | M1-79, M1-23 | E |
| M1-81 | Länger, kürzer | Wie viele Handspannen ist der Tisch breit? | M1-01 | Q |
| M1-82 | Wochentage und Tageszeiten | Reihenfolge der Wochentage, gestern/heute/mor… | M1-11 | E |
| M1-83 | Volle Stunde | Uhr bei vollen Stunden lesen und stellen | M1-48 | E |
| M1-84 | Strichliste | Mit Fünferbündel zählen und ablesen | M1-07 | Q |

#### Klasse 2 – Zahlen bis 100 (mathe)

| ID | Schritt | Beispiel | Vor. | Beleg |
|---|---|---|---|---|
| M2-01 | Zehnerzahlen | 10, 20 … 100 lesen und zählen | M1-45 | Q |
| M2-02 | Bündeln: Zehner und Einer | Gegenstände zu Zehnern bündeln, Stellenwertta… | M2-01 | Q |
| M2-03 | Zahlwort und Ziffern bis 100 ★ | „dreiundvierzig“ → 43 (Zahlwort nennt erst di… | M2-02 | E |
| M2-04 | Darstellungen wechseln | Stangen/Würfel, Stufenschrift (4Z 3E), Zahlwo… | M2-03 | Q |
| M2-05 | Zahlen mit Null | 40 vs. 4; 4Z 0E | M2-04, M1-09 | E |
| M2-06 | Hunderterfeld und Hundertertafel | Zahlen finden, Nachbarn oben/unten (±10) | M2-04 | Q |
| M2-07 | Zahlenstrahl bis 100 | Zahlen eintragen und ablesen, auch ohne alle… | M2-06 | Q |
| M2-08 | Nachbarzahlen und Nachbarzehner | 47: Nachbarn 46/48, Nachbarzehner 40/50 | M2-07 | E |
| M2-09 | Vergleichen und ordnen bis 100 | 59 _ 61 | M2-04 | Q |
| M2-10 | Zerlegen in Zehner und Einer | 32 = 30 + 2 | M2-02 | Q |
| M2-11 | Anzahlen schätzen | Ungefähr wie viele? Mit Zehnerbündeln prüfen | M2-02 | Q |
| M2-12 | In Schritten zählen | In 2er, 5er, 10er Schritten vor und zurück, a… | M2-07 | Q |
| M2-13 | Gerade/ungerade bis 100 |  | M1-49, M2-12 | Q |

#### Klasse 2 – Plus und Minus bis 100 (mathe)

| ID | Schritt | Beispiel | Vor. | Beleg |
|---|---|---|---|---|
| M2-14 | Zehnerzahlen plus und minus | 30 + 40 analog zu 3 + 4 | M2-01, M1-72 | Q |
| M2-15 | Ergänzen zum nächsten Zehner | 47 + _ = 50 | M2-08, M1-24 | Q |
| M2-16 | Ergänzen bis 100 | 63 + _ = 100 | M2-15 | Q |
| M2-17 | ZE plus E ohne Übergang | 34 + 5 | M2-10 | E |
| M2-18 | ZE minus E ohne Übergang | 38 − 5 | M2-17 | E |
| M2-19 | ZE plus Z | 34 + 20 (nur Zehner ändern sich) | M2-14 | E |
| M2-20 | ZE minus Z | 56 − 30 | M2-19 | E |
| M2-21 | ZE plus E mit Übergang | 38 + 5 = 38 + 2 + 3 | M2-15, M1-58 | E |
| M2-22 | Zehnerzahl minus E | 40 − 3 analog zu 10 − 3 | M1-35 | E |
| M2-23 | ZE minus E mit Übergang | 42 − 5 = 42 − 2 − 3 | M2-22, M1-66 | E |
| M2-24 | ZE plus ZE ohne Übergang | 34 + 25 | M2-17, M2-19 | E |
| M2-25 | ZE minus ZE ohne Übergang | 68 − 25 | M2-18, M2-20 | E |
| M2-26 | ZE plus ZE mit Übergang | 37 + 48 | M2-21, M2-24 | E |
| M2-27 | ZE minus ZE mit Übergang | 63 − 28 (schwierigster Typ) | M2-23, M2-25 | E |
| M2-28 | Schrittweise am Rechenstrich | 46 + 27 = 46 + 20 + 7 | M2-19, M2-21 | Q |
| M2-29 | Stellenweise | Zehner und Einer getrennt rechnen; Falle bei… | M2-10 | Q |
| M2-30 | Hilfsaufgabe | 46 + 29 = 46 + 30 − 1; 46 − 29 = 46 − 30 + 1 | M2-19, M2-20 | Q |
| M2-31 | Vereinfachen | 47 + 19 = 46 + 20; 63 − 28 = 65 − 30 | M2-30 | Q |
| M2-32 | Ergänzen bei Minus | 71 − 68 | M2-15 | Q |
| M2-33 | Rechenweg wählen | Passende Strategie zur Aufgabe aussuchen | M2-28–M2-32 | Q |
| M2-34 | Verdoppeln und Halbieren bis 100 | Zehner und Einer getrennt verdoppeln/halbiere… | M1-55, M2-10 | Q |
| M2-35 | Probe mit der Umkehraufgabe |  | M2-27, M1-71 | Q |
| M2-36 | Zahlenmauern, Rechendreiecke, Rechenketten bis 100 |  | M1-73, M2-26 | E |
| M2-37 | Muster in Päckchen | 34+10, 34+20, 34+30 … | M2-19 | Q |
| M2-38 | Fehler finden | Falsch gerechnete Aufgabe erkennen und erklär… | M2-27 | Q |

#### Klasse 2 – Malnehmen und Teilen (mathe)

| ID | Schritt | Beispiel | Vor. | Beleg |
|---|---|---|---|---|
| M2-39 | Gleich große Gruppen | 3 + 3 + 3 + 3 = 4 · 3 | M2-12 | Q |
| M2-40 | Punktefelder: Reihen mal Spalten | Mal als Anordnung | M2-39 | Q |
| M2-41 | Malaufgabe zum Bild | Malzeichen, Aufgabe notieren | M2-40 | E |
| M2-42 | Tauschaufgaben beim Mal | 3 · 5 = 5 · 3 (Feld drehen) | M2-40 | Q |
| M2-43 | Mal 1 und mal 0 | Sonderfälle; 0 · 7 = 0 | M2-39 | Q |
| M2-44 | Zweierreihe | Verdoppeln | M2-39, M1-55 | Q |
| M2-45 | Zehnerreihe |  | M2-39, M2-01 | Q |
| M2-46 | Fünferreihe | Hälfte der Zehnerreihe | M2-45, M2-34 | Q |
| M2-47 | Kernaufgaben jeder Reihe | 5 · 7, 10 · 7 | M2-44–M2-46 | Q |
| M2-48 | Quadrataufgaben | 3 · 3 … 10 · 10 | M2-40 | Q |
| M2-49 | Nachbaraufgabe beim Mal | Eins mehr/eins weniger: 6 · 7 = 5 · 7 + 7; 9… | M2-47 | Q |
| M2-50 | Verdoppeln beim Mal | 4 · 8 = 2 · 8 + 2 · 8 | M2-47 | Q |
| M2-51 | Viererreihe | Doppelte Zweierreihe | M2-50 | E |
| M2-52 | Achterreihe | Doppelte Viererreihe | M2-51 | E |
| M2-53 | Dreierreihe | 3 · x = 2 · x + x | M2-49 | E |
| M2-54 | Sechserreihe | Doppelte Dreierreihe bzw. 5 · x + x | M2-53 | E |
| M2-55 | Neunerreihe | 10 · x − x | M2-49 | E |
| M2-56 | Siebenerreihe | Aus 5 · 7 und 2 · 7 | M2-47, M2-49 | E |
| M2-57 | Einmaleins gemischt | Einmaleinstafel, schwere Aufgaben (6·7, 7·8,… | M2-51–M2-56 | Q |
| M2-58 | Verteilen | Gerecht verteilen: 12 Äpfel an 3 Kinder | M2-39 | Q |
| M2-59 | Aufteilen | 12 Äpfel, je 3 in eine Tüte: wie viele Tüten? | M2-58 | Q |
| M2-60 | Geteilt als Umkehrung von Mal | 4 · 3 = 12 → 12 : 3 = 4 | M2-59, M2-47 | Q |
| M2-61 | Geteilt durch 2, 5, 10 |  | M2-60 | E |
| M2-62 | Geteilt in allen Reihen |  | M2-57, M2-61 | E |
| M2-63 | Sonderfälle beim Teilen | x : 1, x : x, 0 : x; durch 0 geht nicht | M2-60 | E |
| M2-64 | Teilen mit Rest | 17 : 5 = 3 Rest 2 | M2-62 | Q |
| M2-65 | Mal oder Geteilt? | Passende Punktrechnung zur Sachsituation | M2-64 | Q |

#### Klasse 2 – Größen und Sachrechnen (mathe)

| ID | Schritt | Beispiel | Vor. | Beleg |
|---|---|---|---|---|
| M2-66 | Euro-Scheine | 5, 10, 20, 50, 100 € kennen und ordnen | M1-79 | Q |
| M2-67 | Geldbeträge legen bis 100 € | Mit möglichst wenig Scheinen/Münzen | M2-66, M2-10 | Q |
| M2-68 | Euro und Cent gemischt | 9 € 30 ct; 1 € = 100 ct | M2-67 | Q |
| M2-69 | Geld wechseln |  | M2-67 | Q |
| M2-70 | Rückgeld | Zahlt mit 20 €, kostet 13 € | M2-15, M2-68 | E |
| M2-71 | Messen mit dem Lineal ★ | Bei 0 anlegen, cm ablesen | M1-81 | Q+E |
| M2-72 | Meter und Zentimeter | 1 m = 100 cm; 2 m 15 cm | M2-71 | Q |
| M2-73 | Längen schätzen | Mit Bezugsgrößen (Tafelhöhe ≈ 1 m) | M2-72 | Q |
| M2-74 | Halbe Stunde |  | M1-83 | Q |
| M2-75 | Viertel und Dreiviertel |  | M2-74 | Q |
| M2-76 | Minuten in Fünferschritten | Großer Zeiger auf der 4 = 20 Minuten | M2-75, M2-12 | E |
| M2-77 | Minutengenau |  | M2-76 | E |
| M2-78 | Digital und 24 Stunden | 14:00 = 2 Uhr nachmittags | M2-77 | E |
| M2-79 | Stunde und Minute | 1 h = 60 min; Abkürzungen | M2-76 | Q |
| M2-80 | Zeitspannen | Von 8:00 bis 9:30; Anfang/Ende bestimmen | M2-79 | Q |
| M2-81 | Kalender | Monate, Tage je Monat, Datum, Woche = 7 Tage,… | M1-82 | Q |
| M2-82 | Frage – Rechnung – Antwort | Informationen aus Bild/Text entnehmen, rechne… | M1-78 | Q |
| M2-83 | Skizze hilft | Sachaufgabe mit Skizze/Tabelle lösen | M2-82 | Q |
| M2-84 | Nicht jedes Wort verrät die Rechnung ★ | „mehr“ kann Minus bedeuten (Vergleich) | M1-41, M2-82 | E |
| M2-85 | Kapitänsaufgabe | 12 Schafe, 5 Ziegen – wie alt ist der Hirte? | M2-82 | E |
| M2-86 | Systematisch kombinieren | 2 T-Shirts, 3 Hosen | M2-39 | Q |
| M2-87 | Tabellen und Schaubilder lesen |  | M1-84 | Q |
| M2-88 | Sicher, möglich, unmöglich |  | – | Q |
| M2-89 | Wahrscheinlich oder unwahrscheinlich | Kugeln aus dem Säckchen | M2-88 | Q |

#### Klasse 3 – Zahlen bis 1000 (mathe)

| ID | Schritt | Beispiel | Vor. | Beleg |
|---|---|---|---|---|
| M3-01 | Hunderter bündeln | 10 Z = 1 H; Stellenwerttafel H/Z/E; 1000 = 10… | M2-02 | Q |
| M3-02 | Dreistellige Zahlen lesen und schreiben | Zahlwort ↔ Ziffern (dreihundertvierundfünfzig) | M3-01, M2-03 | E |
| M3-03 | Null als Platzhalter ★ | 305, 350, 35 unterscheiden | M3-02 | E |
| M3-04 | Darstellungen bis 1000 | Platten, Stangen, Würfel; Stufenschrift | M3-01 | Q |
| M3-05 | Tausenderstreifen und Zahlenstrahl | Zahlen in grob skalierten Ausschnitten finden | M3-04, M2-07 | Q |
| M3-06 | Nachbarzehner, Nachbarhunderter |  | M3-05 | E |
| M3-07 | Vergleichen und ordnen bis 1000 |  | M3-02 | Q |
| M3-08 | Runden | Auf Zehner und Hunderter runden | M3-06 | Q |
| M3-09 | Große Anzahlen schätzen |  | M3-01 | Q |
| M3-10 | Zerlegen bis 1000 | 1000 = 100 + 900; 456 = 400 + 50 + 6 | M3-01 | Q |
| M3-11 | Zählen in großen Schritten | 10er, 50er, 100er, rückwärts | M3-05 | Q |

#### Klasse 3 – Rechnen bis 1000 (mathe)

| ID | Schritt | Beispiel | Vor. | Beleg |
|---|---|---|---|---|
| M3-12 | Hunderterzahlen plus und minus | 300 + 400 analog | M3-01, M2-14 | Q |
| M3-13 | Ergänzen zum Hunderter und zu 1000 | 470 + _ = 500; 640 + _ = 1000 | M3-12, M2-16 | E |
| M3-14 | Analog ohne Übergang | 456 + 3, 456 + 30, 456 + 300 (und minus) | M3-10 | E |
| M3-15 | Über Zehner oder Hunderter hinweg | 398 + 5; 405 − 8; 470 + 50 | M3-14, M2-21 | E |
| M3-16 | Halbschriftlich plus und minus bis 1000 | Schrittweise, stellenweise, Hilfsaufgabe, Erg… | M3-15, M2-33 | Q |
| M3-17 | Verdoppeln und Halbieren bis 1000 |  | M2-34 | E |
| M3-18 | Zahlenmauern und Zauberdreiecke bis 1000 |  | M3-16 | Q |
| M3-19 | Einmaleins sicher (Wiederholung) | Kernaufgaben und alle Sätze automatisiert, mi… | M2-57, M2-62 | Q |
| M3-20 | Quadratzahlen |  | M2-48 | Q |
| M3-21 | Teilen mit Rest sicher |  | M2-64 | Q |
| M3-22 | Rechenarten verbinden | 3 + 4 · 5 | M3-19 | Q+E |
| M3-23 | Ungleichungen | 4 · _ < 30 | M3-19 | Q |
| M3-24 | Zehner-Einmaleins | 6 · 4 → 6 · 40 = 240; 240 : 6 | M3-19, M3-12 | Q |
| M3-25 | Halbschriftlich mal | 7 · 34 = 7 · 30 + 7 · 4 (Zerlegen) | M3-24 | Q |
| M3-26 | Halbschriftlich geteilt | 84 : 4 = 80 : 4 + 4 : 4 | M3-24 | Q |
| M3-27 | Halbschriftlich geteilt mit Rest | 87 : 4 | M3-26, M3-21 | Q |

#### Klasse 3 – Schriftliche Addition und Subtraktion (mathe)

| ID | Schritt | Beispiel | Vor. | Beleg |
|---|---|---|---|---|
| M3-28 | Stellengerecht untereinander | Einer unter Einer, auch bei verschieden lange… | M3-01 | E |
| M3-29 | Überschlag zuerst | Ungefähres Ergebnis mit gerundeten Zahlen | M3-08 | Q |
| M3-30 | Schriftlich plus ohne Übertrag | Von rechts nach links | M3-28 | E |
| M3-31 | Schriftlich plus mit einem Übertrag |  | M3-30 | E |
| M3-32 | Mehrere Überträge, Übertrag in die Null | 478 + 356; 395 + 607 | M3-31 | E |
| M3-33 | Drei Summanden | Übertrag kann 2 sein | M3-32 | E |
| M3-34 | Schriftlich minus ohne Entbündeln |  | M3-28 | E |
| M3-35 | Entbündeln eines Zehners | 352 − 127 | M3-34 | E |
| M3-36 | Entbündeln eines Hunderters | 528 − 254 | M3-35 | E |
| M3-37 | Zweifach entbündeln | 523 − 287 | M3-36 | E |
| M3-38 | Entbündeln über die Null ★ | 503 − 178; 1000 − 1 | M3-37, M3-03 | E |
| M3-39 | Probe bei Minus | Ergebnis + Subtrahend = Minuend | M3-34, M3-30 | Q |
| M3-40 | Im Kopf oder schriftlich? | 500 − 499 nicht schriftlich | M3-38, M3-16 | Q |

#### Klasse 3 – Größen, Sachrechnen, Daten (mathe)

| ID | Schritt | Beispiel | Vor. | Beleg |
|---|---|---|---|---|
| M3-41 | Kilometer und Millimeter | km, m, cm, mm und ihre Beziehungen | M2-72 | Q |
| M3-42 | Kommaschreibweise | 3,45 € = 3 € 45 ct; 1,20 m | M2-68, M3-41 | Q |
| M3-43 | Geldbeträge mit Komma rechnen |  | M3-42, M3-30 | Q |
| M3-44 | Gramm und Kilogramm | 1 kg = 1000 g; Waage ablesen | M3-01 | Q |
| M3-45 | Gewichte schätzen und vergleichen | Bezugsgrößen (Tafel Schokolade 100 g) | M3-44 | Q |
| M3-46 | Tonne | 1 t = 1000 kg | M3-44 | Q |
| M3-47 | Sekunden | 1 min = 60 s | M2-79 | Q |
| M3-48 | Zeitpunkt oder Zeitdauer? |  | M2-80 | Q |
| M3-49 | Zeitspannen berechnen | In h und min, gemischt (1 h 25 min); über die… | M3-48 | Q |
| M3-50 | Liter und Milliliter | 1 l = 1000 ml; Messbecher | M3-01 | Q |
| M3-51 | Halb, Viertel, Dreiviertel bei Größen | ½ l = 500 ml, ¼ h = 15 min, ¾ h = 45 min | M3-50, M2-75 | Q |
| M3-52 | Informationen aus Tabellen und Preislisten |  | M2-87 | Q |
| M3-53 | Fragen selbst stellen |  | M2-82 | Q |
| M3-54 | Zwei Rechenschritte | Mehrschrittige Sachaufgabe mit Lösungsskizze | M2-83 | Q |
| M3-55 | Überflüssige und fehlende Angaben |  | M2-85 | E |
| M3-56 | Balkendiagramm | Lesen und selbst zeichnen | M2-87 | Q |
| M3-57 | Daten sammeln und darstellen | Befragung → Strichliste → Tabelle → Diagramm | M3-56 | Q |
| M3-58 | Baumdiagramm | Kombinationen systematisch mit Baum oder Tabe… | M2-86 | Q |
| M3-59 | Gewinnchancen | Glücksrad, Würfel: was ist wahrscheinlicher? | M2-89 | Q |
| M3-60 | Zahlenfolgen und Zahleigenschaften | Folgen fortsetzen, Zahlen klassifizieren | M3-11 | Q |
| M3-61 | Je mehr, desto … | Mehr Hefte, höherer Preis; mehr Helfer, wenig… | M3-19 | Q |

#### Klasse 4 – Zahlen bis zur Million (mathe)

| ID | Schritt | Beispiel | Vor. | Beleg |
|---|---|---|---|---|
| M4-01 | Tausender bündeln | T, ZT, HT, M; Stellenwerttafel | M3-01 | Q |
| M4-02 | Große Zahlen lesen und schreiben | In Dreiergruppen gliedern | M4-01 | E |
| M4-03 | Null in großen Zahlen | 40 007 vs. 4 007 | M4-02, M3-03 | E |
| M4-04 | Zahlenstrahl mit großen Schritten | Ausschnitte, Skalierung 1000/10 000 | M4-01, M3-05 | Q |
| M4-05 | Vergleichen, ordnen, Nachbarzahlen bis zur Million |  | M4-02 | Q |
| M4-06 | Große Zahlen runden | Auf T, ZT, HT | M3-08, M4-04 | Q |
| M4-07 | Schätzen und Fermi-Aufgaben | Wie viele Reiskörner? | M3-09 | Q |
| M4-08 | Zerlegen großer Zahlen | 100 000 = 10 · 10 000 | M4-01 | Q |
| M4-09 | Teiler und Vielfache |  | M3-19 | Q |

#### Klasse 4 – Rechnen bis zur Million (mathe)

| ID | Schritt | Beispiel | Vor. | Beleg |
|---|---|---|---|---|
| M4-10 | Analog im Kopf | 6 · 4 → 60 · 4 → 600 · 4; 3000 + 5000 | M3-24, M4-01 | Q |
| M4-11 | Ergänzen zu Stufenzahlen | bis 10 000, bis 1 000 000 | M3-13 | E |
| M4-12 | Mal und geteilt durch 10, 100, 1000 | Stellenwert verschieben (Ziffern rücken, Null… | M4-01 | E |
| M4-13 | Schriftlich plus und minus mit großen Zahlen | auch 100 000 − 1 | M3-33, M3-38 | Q |
| M4-14 | Halbschriftlich mal und geteilt mit großen Zahlen |  | M3-25, M3-26 | Q |
| M4-15 | Schriftlich mal einstellig ohne Übertrag | 213 · 3 | M3-19, M3-28 | E |
| M4-16 | Schriftlich mal mit Übertrag | 468 · 7 | M4-15 | E |
| M4-17 | Null im Faktor | 406 · 5 | M4-16 | E |
| M4-18 | Mal Zehnerzahl | 34 · 20 = 34 · 2 · 10 | M4-12, M4-16 | E |
| M4-19 | Zweistelliger Multiplikator | 243 · 36, Teilprodukte stellengerecht | M4-18 | Q |
| M4-20 | Überschlag beim Mal |  | M4-06, M4-10 | Q |
| M4-21 | Schriftlich geteilt ohne Rest | 848 : 4 | M3-26, M3-19 | E |
| M4-22 | Erste Stelle zu klein | 256 : 4 (zuerst 25 nehmen) | M4-21 | E |
| M4-23 | Null im Ergebnis ★ | 624 : 6 = 104 | M4-22 | E |
| M4-24 | Schriftlich geteilt mit Rest |  | M4-22, M3-21 | Q |
| M4-25 | Geteilt durch 10 (schriftlich) | Bayern: Divisoren bis einschließlich 10 | M4-24, M4-12 | E |
| M4-26 | Probe beim Teilen | Ergebnis · Divisor + Rest | M4-24, M4-16 | Q |
| M4-27 | Terme vergleichen | Gleiche Zahl, verschiedene Terme | M3-22 | Q |
| M4-28 | ANNA-Zahlen und Zahlenmuster |  | M3-38 | Q |
| M4-29 | Geheimschrift | Muster in Verschlüsselungen nutzen | M4-28 | Q |

#### Klasse 4 – Größen, Sachrechnen, Daten (mathe)

| ID | Schritt | Beispiel | Vor. | Beleg |
|---|---|---|---|---|
| M4-30 | Schreibweisen wechseln | 2,5 km = 2500 m = 2 km 500 m (auch kg/g, l/ml) | M3-41, M3-44, M3-50 | Q |
| M4-31 | Größen vergleichen und ordnen (gemischte Einheiten) |  | M4-30 | Q |
| M4-32 | Zeitspannen über Tage | Über Mitternacht, Tage und Stunden; Kalender… | M3-49, M2-81 | E |
| M4-33 | Fahrpläne | Nicht direkt ablesbare Fahrtzeiten berechnen | M3-49 | Q |
| M4-34 | Menge und Preis (Proportionalität) | Tabelle: 1 kg → 3 €, 4 kg → ? | M3-61, M4-10 | Q |
| M4-35 | Rückwärts rechnen | Vom Ergebnis zum Start | M3-54 | Q |
| M4-36 | Genau oder ungefähr? | Reicht ein Überschlag? | M4-20 | Q |
| M4-37 | Diagramme kritisch lesen | Achsen und Skalen prüfen; Darstellung wechseln | M3-56 | Q |
| M4-38 | Kombinatorik mit Reihenfolge | Wie viele Reihenfolgen für 3 Kinder? | M3-58 | E |
| M4-39 | Chancen gezielt verändern | Mehr rote Kugeln → wahrscheinlicher | M3-59 | Q |

### Strang geometrie (55 Schritte)

#### Klasse 1 – Geometrie (geometrie)

| ID | Schritt | Beispiel | Vor. | Beleg |
|---|---|---|---|---|
| Geo1-01 | Oben, unten, vorne, hinten | Lagebegriffe am eigenen Körper und im Bild | – | Q |
| Geo1-02 | Links und rechts ★ | Seiten am eigenen Körper, dann im Bild | Geo1-01 | Q+E |
| Geo1-03 | Neben, zwischen, über, unter, auf |  | Geo1-01 | Q |
| Geo1-04 | Wege folgen | Pfeilweg oder Anweisung (2 nach rechts, 1 nac… | Geo1-02 | Q |
| Geo1-05 | Kreis, Dreieck, Viereck | Grundformen erkennen | – | Q |
| Geo1-06 | Quadrat und Rechteck | Beide unterscheiden | Geo1-05 | Q |
| Geo1-07 | Ecken und Seiten zählen |  | Geo1-05 | Q |
| Geo1-08 | Formen sortieren | Nach Form, Farbe, Größe, Eckenzahl | Geo1-07 | Q |
| Geo1-09 | Formen-Muster fortsetzen | ●▲●▲_ | Geo1-05 | Q |
| Geo1-10 | Legen und Zusammensetzen | Figur aus Teilen legen (Legeplättchen, Tangra… | Geo1-05 | E |
| Geo1-11 | Nachzeichnen im Gitter | Figur auf Kästchen/Punkten abzeichnen | Geo1-04 | Q |

#### Klasse 2 – Geometrie (geometrie)

| ID | Schritt | Beispiel | Vor. | Beleg |
|---|---|---|---|---|
| Geo2-01 | Körper benennen | Würfel, Quader, Kugel, Zylinder, Kegel, Pyram… | Geo1-05 | Q |
| Geo2-02 | Rollt oder kippt? | Körper nach Eigenschaften sortieren | Geo2-01 | Q |
| Geo2-03 | Ecken, Kanten, Flächen | An Körpern zählen | Geo2-01, Geo1-07 | Q |
| Geo2-04 | Besondere Formen | Quadrat ist ein besonderes Rechteck, Würfel e… | Geo1-06, Geo2-03 | Q |
| Geo2-05 | Körper in der Umwelt |  | Geo2-01 | Q |
| Geo2-06 | Von vorne, oben, der Seite | Ansichten zuordnen | Geo1-03 | Q |
| Geo2-07 | Einfache Würfelbauten | Nach Bild nachbauen | Geo2-06 | Q |
| Geo2-08 | Spiegelbild entdecken | Ist die Figur symmetrisch? (Falten, Spiegel) | Geo1-08 | Q |
| Geo2-09 | Symmetrische Hälfte ergänzen | Am Gitter | Geo2-08, Geo1-11 | Q |
| Geo2-10 | Zeichnen mit dem Lineal | Gerade Linien im Gitternetz | Geo1-11 | Q |
| Geo2-11 | Falten, zerlegen, drehen | Was entsteht beim Falten/Zerschneiden? | Geo1-10 | Q |
| Geo2-12 | Geobrett | Formen spannen | Geo1-06 | Q |
| Geo2-13 | Welche Fläche ist größer? | Durch Auslegen mit Einheitsflächen | Geo1-10 | Q |
| Geo2-14 | Welcher Rand ist länger? | Umfang durch Nachlegen/Nachzeichnen am Gitter | Geo2-13 | Q |
| Geo2-15 | Muster aus Körpern und Plättchen |  | Geo1-09 | Q |

#### Klasse 3 – Geometrie (geometrie)

| ID | Schritt | Beispiel | Vor. | Beleg |
|---|---|---|---|---|
| Geo3-01 | Würfel und Quader vergleichen | Flächen, Kanten, Ecken; Kanten- und Flächenmo… | Geo2-03 | Q |
| Geo3-02 | Würfelnetze | Welche Netze falten sich zu einem Würfel? Dec… | Geo3-01 | Q |
| Geo3-03 | Würfelgebäude nach Bauplan | Grundriss mit Zahlen = Turmhöhen | Geo2-07 | Q |
| Geo3-04 | Bauplan zeichnen | Vom Gebäude zum Bauplan | Geo3-03 | Q |
| Geo3-05 | Ansichten von Würfelgebäuden |  | Geo3-03, Geo2-06 | Q |
| Geo3-06 | Symmetrieachsen einzeichnen | Auch mehrere Achsen | Geo2-09 | Q |
| Geo3-07 | Faltschnitte und Spiegelbilder |  | Geo3-06 | Q |
| Geo3-08 | Bandornamente | Regel finden, fortsetzen | Geo2-15, Geo3-06 | Q |
| Geo3-09 | Parkettierungen |  | Geo3-08 | Q |
| Geo3-10 | Planquadrate (Gitternetz) | Feld B3 finden und benennen | Geo1-04 | Q |
| Geo3-11 | Orientieren im Ortsplan | Wege beschreiben | Geo3-10 | Q |
| Geo3-12 | Flächen auslegen und vergleichen | Mit Einheitsquadraten zählen | Geo2-13 | Q |
| Geo3-13 | Rechter Winkel | Faltwinkel; Rechteck, Quader | Geo2-04 | Q |

#### Klasse 4 – Geometrie (geometrie)

| ID | Schritt | Beispiel | Vor. | Beleg |
|---|---|---|---|---|
| Geo4-01 | Quadernetze |  | Geo3-02 | Q |
| Geo4-02 | Netz im Kopf falten | Welche Fläche liegt gegenüber? | Geo4-01 | Q |
| Geo4-03 | Würfel kippen | Welche Fläche liegt nach dem Kippen oben? | Geo4-02 | Q |
| Geo4-04 | Kantenmodelle |  | Geo3-01 | Q |
| Geo4-05 | Zeichnen mit Geodreieck | Rechte Winkel, Rechtecke zeichnen | Geo3-13, Geo2-10 | Q |
| Geo4-06 | Kreise mit dem Zirkel |  | Geo4-05 | Q |
| Geo4-07 | Vergrößern und verkleinern | Im Gitternetz 2 : 1 bzw. 1 : 2 | Geo3-10 | Q |
| Geo4-08 | Maßstab im Plan | 1 cm im Plan ≙ 1 m in echt | Geo4-07, M3-41 | Q |
| Geo4-09 | Lageplan zeichnen |  | Geo3-11 | Q |
| Geo4-10 | Flächeninhalt in Kästchen | Einheitsquadrate zählen, auch halbe Kästchen | Geo3-12 | Q |
| Geo4-11 | Pentominos | Alle Fünflinge finden, gleiche Fläche | Geo4-10 | Q |
| Geo4-12 | Umfang bestimmen | Randlänge in Kästchen oder cm | Geo2-14, M2-71 | Q |
| Geo4-13 | Fläche oder Umfang? ★ | Gleiche Fläche, anderer Umfang | Geo4-10, Geo4-12 | E |
| Geo4-14 | Rauminhalt mit Würfeln | Einheitswürfel zählen | Geo3-03, Geo4-10 | Q |
| Geo4-15 | Spiegeln im Gitter | Figur an Achse spiegeln (auch schräge Lage) | Geo3-07 | Q |
| Geo4-16 | Drehen im Kopf | Gedreht oder gespiegelt? | Geo4-15 | Q |


### Prozessbezogene Schritte (mathe, räumliche Schritte geometrie; 112 Schritte)

Jeder Prozessschritt wird nach seinem Inhaltsschritt frei (Spalte Vor.). Doppelungen mit der Inhaltskarte: M2-85 ↔ MO2-02, M4-36 ↔ MO3-04, M3-58 ↔ PL3-05.

#### Prozess A. Probleme lösen (PL)

| ID | Schritt | Kl. | Strang | Bsp. | Vor. | Spiel | Beleg |
|---|---|---|---|---|---|---|---|
| PL1-01 | Mehr als eine Lösung | 1 | mathe | Lege 6 Kugeln auf zwei Teller – finde 3… | M1-21 (Zerlegen bis 10) | spielbar | E |
| PL1-02 | Alle finden | 1 | mathe | Alle Zerlegungen der 5 in zwei Häuser | PL1-01 | spielbar | E |
| PL1-03 | Ordnung beim Probieren | 1 | mathe | Ordne die gefundenen Zerlegungen der 7… | PL1-02 | spielbar | E |
| PL1-04 | Probieren und prüfen | 1 | mathe | Welche Zahl gehört in den leeren Mittel… | M1-43 (Zahlenmauer bis 10) | spielbar | E |
| PL1-05 | Zahlenmauer von oben | 1 | mathe | Deckstein 8, links unten 3 – was fehlt… | M1-43, M1-38 | spielbar | E |
| PL1-06 | Rechendreieck mit Lücken | 1 | mathe | Außen 7, Innen 3 und ? | M1-44 | spielbar | E |
| PL1-07 | Kleidung kombinieren | 1 | mathe | 2 Mützen, 2 Schals – wie viele verschie… | M1-04 | spielbar | Q |
| PL1-08 | Muster-Rätsel weiter | 1 | mathe | 2, 4, 6, _ ; ●●○●●○_ | Geo1-09, M1-13 | spielbar | E |
| PL2-01 | Systematische Tabelle | 2 | mathe | Mit 10-ct- und 20-ct-Münzen 60 ct legen… | PL1-03, M1-80 (Geld legen) | spielbar | E |
| PL2-02 | Kombinatorik 3 × 2 | 2 | mathe | 3 Eissorten, 2 Waffeln | PL1-07 | spielbar | Q |
| PL2-03 | Zahlenmauer: Ziel erreichen | 2 | mathe | Dreistöckige Mauer, unten 3 Steine, obe… | M2-36, PL1-04 | spielbar | E |
| PL2-04 | Mittelstein zählt doppelt | 2 | mathe | Erhöhe nacheinander linken, mittleren,… | PL2-03 | spielbar | Q |
| PL2-05 | Größter / kleinster Deckstein | 2 | mathe | Steine 2, 5, 9 – wohin die 9? | PL2-04 | spielbar | E |
| PL2-06 | Rückwärts: Zahlenkette | 2 | mathe | ? → +5 → −3 → =12 | M1-71, M2-35 | spielbar | E |
| PL2-07 | Rückwärts: Geschichte | 2 | mathe | Mia bekommt 4 Sticker und verschenkt 2,… | PL2-06 | spielbar | E |
| PL2-08 | Skizze statt Kopfchaos | 2 | mathe | 5 Kinder stehen in einer Reihe, zwische… | M2-83 (Skizze hilft) | teilweise | E |
| PL2-09 | Zaunpfahl-Falle | 2 | mathe | Ein Zaun mit 4 Feldern braucht wie viel… | PL2-08 | spielbar | E |
| PL2-10 | Analoge Aufgabe nutzen | 2 | mathe | 3 + 4 = 7 hilft bei 30 + 40 und 13 + 4.… | M2-19 (Analogieaufgaben) | spielbar | Q |
| PL2-11 | Zahlenrätsel mit zwei Bedingungen | 2 | mathe | Ich bin gerade, zwischen 20 und 30, mei… | M2-01ff. (Zahlen bis 100) | spielbar | E |
| PL2-12 | Waage-Rätsel | 2 | mathe | 2 Äpfel = 1 Melone; 1 Melone + 1 Apfel… | M1-14 (=) | spielbar | E |
| PL2-13 | Strategie wählen | 2 | mathe | Drei Rätselkarten, für jede die passend… | PL2-01, PL2-06, PL2-08 | teilweise | E |
| PL3-01 | Zahlenmauer vierstöckig, Lücken verteilt | 3 | mathe | Nur 4 von 10 Steinen gegeben | M3-18, PL2-03 | spielbar | E |
| PL3-02 | Rechendreieck rückwärts | 3 | mathe | Außen 30, 50, 40 | PL1-06, M3-16 | spielbar | E |
| PL3-03 | Magisches Quadrat ergänzen | 3 | mathe | 3×3-Quadrat mit Zauberzahl 15, vier Fel… | M1-73-Niveau Plus bis 20, M3-16 | spielbar | E |
| PL3-04 | Magisches Quadrat verändern | 3 | mathe | Vorhersage: Was wird die neue Zauberzah… | PL3-03 | spielbar | E |
| PL3-05 | Kombinatorik 3 × 3 mit Baum | 3 | mathe | 3 Brote, 3 Beläge | M3-58, PL2-02 | spielbar | Q |
| PL3-06 | Handshake-Problem | 3 | mathe | 4 Kinder geben sich je einmal die Hand | PL3-05 | spielbar | E |
| PL3-07 | Vorwärts und rückwärts kombinieren | 3 | mathe | Tom hat doppelt so viele Murmeln wie Le… | PL2-07, M2-47 (Verdoppeln) | spielbar | Q |
| PL3-08 | Gewinnstrategie | 3 | mathe | 10 Hölzchen, nimm 1 oder 2, wer das let… | PL2-06 | spielbar | E |
| PL3-09 | Unmöglich? | 3 | mathe | Rechendreieck mit Außenzahlen 5, 6, 8 n… | PL3-02 | teilweise | E |
| PL3-10 | Vorgehen ändern | 3 | mathe | Nach drei Fehlversuchen bietet das Spie… | PL2-13 | teilweise | E |
| PL4-01 | Zahlenmauer mit Variable-Idee | 4 | mathe | Unten 10, ?, 30; oben 100 | PL2-04, PL3-01 | spielbar | E |
| PL4-02 | Kombinatorik mit Reihenfolge | 4 | mathe | Siegerpodest für 4 Tiere vs. 2 Tiere fü… | M4-38, PL3-06 | spielbar | E |
| PL4-03 | Würfelgebäude-Rätsel | 4 | geometrie | Vorderansicht 3 hoch, Seitenansicht 2 h… | G-Inhaltsschritte Baupläne Kl. 3/4 | spielbar | E |
| PL4-04 | Würfelnetz im Kopf | 4 | geometrie | Welche Netze ergeben einen Würfel? Welc… | G-Netze | spielbar | Q |
| PL4-05 | Mehrschrittiges Rätsel mit Tabelle | 4 | mathe | Drei Kinder, drei Haustiere, drei Hinwe… | PL2-01, PL2-11 | spielbar | E |
| PL4-06 | Eigene Knobelaufgabe erfinden | 4 | mathe | Baue eine Zahlenmauer mit 3 Lücken, die… | PL3-01 | teilweise | E |

#### Prozess B. Argumentieren und Begründen (AR)

| ID | Schritt | Kl. | Strang | Bsp. | Vor. | Spiel | Beleg |
|---|---|---|---|---|---|---|---|
| AR1-01 | Stimmt das? | 1 | mathe | Einhorn sagt: „5 + 3 ist mehr als 9.“ S… | M1-25ff. (Plus bis 10) | spielbar | Q |
| AR1-02 | Zeig es! | 1 | mathe | Zeige mit Plättchen, dass 4 + 2 = 2 + 4 | M1-31 (Tauschaufgaben) | teilweise | E |
| AR1-03 | Gerade oder ungerade – warum? | 1 | mathe | Ist 7 gerade? Bilde Paare | M1-29 (Verdoppeln) | spielbar | Q |
| AR1-04 | Welches passt nicht? | 1 | mathe | 2+5, 3+5, 4+5, 9+1, 5+5 | M1-75 (Päckchen mit Muster) | spielbar | Q |
| AR1-05 | Ich weiß, weil … | 1 | mathe | „6 + 4 = 10, weil …“ a) 6 und 4 sind Ze… | M1-22 (Zerlegen der 10), AR1-01 | spielbar | E |
| AR2-01 | Vermutung aufstellen | 2 | mathe | 2+3=5, 4+5=9, 6+7=13 – „Zwei Nachbarzah… | AR1-03, M1-12 | spielbar | Q |
| AR2-02 | Vermutung testen | 2 | mathe | Teste „Nachbarzahlen ergeben ungerade“… | AR2-01 | spielbar | Q |
| AR2-03 | Ein Gegenbeispiel reicht | 2 | mathe | „Alle Zahlen mit 5 hinten sind ungerade… | AR2-02 | spielbar | Q |
| AR2-04 | Gleichsinnig verändern | 2 | mathe | 20+5, 21+6, 22+7 – Wie wächst das Ergeb… | M2-37 | spielbar | Q |
| AR2-05 | Gegensinnig: Summe bleibt | 2 | mathe | 30+20, 31+19, 32+18 – warum immer 50? P… | AR2-04 | spielbar | Q |
| AR2-06 | Differenz bleibt | 2 | mathe | 45−20, 46−21, 47−22 | AR2-05, M2-27ff | spielbar | Q |
| AR2-07 | Fehlerdetektiv: Rechnen | 2 | mathe | Pfiffikus rechnet 46 + 7 = 43 – wo ist… | M2-27ff. (Plus bis 100) | spielbar | Q |
| AR2-08 | Fehlerdetektiv: Was hat er falsch gedacht? | 2 | mathe | 52 − 7 = 55: a) hat plus gerechnet b) h… | AR2-07 | spielbar | E |
| AR2-09 | Immer, manchmal, nie | 2 | mathe | „Plus macht größer“ (manchmal: +0!), „T… | AR2-03 | spielbar | E |
| AR2-10 | Mal-Tauschaufgabe begründen | 2 | mathe | Welches Bild zeigt, dass beide gleich s… | M2-42 | spielbar | E |
| AR3-01 | Mittelstein-Begründung | 3 | mathe | Begründungs-Puzzle aus Satzteilen ordnen | PL2-04 | spielbar | E |
| AR3-02 | Rechenwege vergleichen | 3 | mathe | 199 + 245: Ella rechnet stellenweise, B… | M3-16 | teilweise | Q |
| AR3-03 | Passt die Begründung? | 3 | mathe | „Die Summe von drei ungeraden Zahlen is… | AR2-03 | spielbar | E |
| AR3-04 | Teiler begründen | 3 | mathe | Ist 24 durch 3 teilbar? Lege Dreiergrup… | M3-19, M3-21 | spielbar | Q |
| AR3-05 | Schätzung begründen | 3 | mathe | „Der Bus ist etwa 12 m lang, weil ein A… | M-Größen Kl. 3 | teilweise | Q |
| AR3-06 | Netz passt – warum? | 3 | geometrie | Welche Begründung passt zu Netz B? | G-Netze Kl. 3 | spielbar | Q |
| AR4-01 | Allgemein statt Beispiel | 4 | mathe | „Gerade + gerade = gerade“: a) 2+4=6, 8… | AR2-03, AR3-03 | spielbar | Q |
| AR4-02 | ANNA-Zahlen erklären | 4 | mathe | 7337 − 7373; Begründungsbausteine ordnen | M4-28 | teilweise | Q |
| AR4-03 | Überschlag als Beweis | 4 | mathe | 398 · 5 = 1 090? Überschlag 400 · 5 = 2… | M4-20 | spielbar | Q |
| AR4-04 | Gewinnchance begründen | 4 | mathe | Rad A: 2 von 8 rot, Rad B: 3 von 6 rot… | M-Daten/Zufall Kl. 4 | spielbar | Q |

#### Prozess C. Kommunizieren (KO)

| ID | Schritt | Kl. | Strang | Bsp. | Vor. | Spiel | Beleg |
|---|---|---|---|---|---|---|---|
| KO1-01 | Sag, was du siehst | 1 | mathe | „Bei jeder Aufgabe kommt … dazu.“ Lücke… | M1-75 | teilweise | Q |
| KO1-02 | Weg beschreiben | 1 | geometrie | Einhorn folgt deinen Pfeil-/Wortkarten… | G1-Lagebegriffe | spielbar | Q |
| KO1-03 | Rechenweg nachspielen | 1 | mathe | Lina sagt: „Ich habe erst bis 10 gerech… | M1-60ff. (Zehnerübergang) | spielbar | E |
| KO2-01 | Wer hat wie gerechnet? | 2 | mathe | 34 + 28: schrittweise, stellenweise, Hi… | M2-27ff., M2-33 | spielbar | E |
| KO2-02 | Beschreibung ordnen | 2 | mathe | „Zuerst rechne ich die Zehner …, dann …… | KO2-01 | spielbar | E |
| KO2-03 | Fachwort-Memory | 2 | mathe |  | M1-31, M1-38 | spielbar | Q |
| KO2-04 | Forscherbericht ergänzen | 2 | mathe | „Der erste Summand wird immer um 1 ___,… | AR2-05, KO2-03 | teilweise | Q |
| KO3-01 | Erklärung für jemand Jüngeren | 3 | mathe | Welche Erklärung versteht ein Erstkläss… | KO2-02 | teilweise | E |
| KO3-02 | Lösungsweg weiterentwickeln | 3 | mathe | Max rechnet 25+25+25+25 – welcher kürze… | M2-40ff. (Mal) | spielbar | E |
| KO3-03 | Missverständnis aufklären | 3 | geometrie | „Male das Kästchen neben dem Stern rot“… | KO1-02 | spielbar | E |
| KO4-01 | Bauplan diktieren | 4 | geometrie | Partnermodus: Kind A wählt Beschreibung… | PL4-03 | teilweise | E |
| KO4-02 | Mathe-Konferenz light | 4 | mathe | Zwei Spielfiguren haben verschiedene Er… | AR3-03 | teilweise | Q |

#### Prozess D. Modellieren (MO) – Ergänzung zu den Sachaufgaben-Schritten in [MT]

| ID | Schritt | Kl. | Strang | Bsp. | Vor. | Spiel | Beleg |
|---|---|---|---|---|---|---|---|
| MO1-01 | Bild → Rechnung | 1 | mathe | 3 Vögel sitzen, 2 fliegen dazu. Welche… | M1-77 | spielbar | Q |
| MO1-02 | Rechnung → Bild | 1 | mathe | 7 − 3: welches Bild? | MO1-01 | spielbar | E |
| MO1-03 | Welche Frage passt? | 1 | mathe | Im Bild: 4 rote, 3 blaue Ballons. Frage… | M1-78 | spielbar | Q |
| MO1-04 | Ergebnis passt zur Geschichte? | 1 | mathe | 5 Kinder, 2 gehen heim – „7 Kinder blei… | MO1-01 | spielbar | E |
| MO2-01 | Wichtig oder unwichtig? | 2 | mathe | „Paul ist 8 Jahre alt, er hat 12 Murmel… | M2-82 | spielbar | Q |
| MO2-02 | Kapitänsaufgabe entlarven | 2 | mathe | „Auf dem Boot sind 14 Ziegen und 6 Hühn… | MO2-01, M2-85 | spielbar | Q |
| MO2-03 | Es fehlt eine Angabe | 2 | mathe | „Ein Heft kostet … Lea kauft 3 Hefte. W… | MO2-02 | spielbar | E |
| MO2-04 | Rechengeschichte zur Aufgabe | 2 | mathe | a) 4 Kinder, je 3 Äpfel b) 4 Kinder, 3… | M2-40ff | spielbar | Q |
| MO2-05 | Fermi klein: Wie viele passen? | 2 | mathe | Wie viele Kinder passen auf die Bank (B… | M2-Größen (Bezugsgrößen) | spielbar | Q |
| MO3-01 | Modellkreislauf: Rückweg | 3 | mathe | 26 Kinder, Boote für 4: 26 : 4 = 6 Rest… | M3-27, M2-Division mit Rest | spielbar | Q |
| MO3-02 | Zwei Schritte planen | 3 | mathe | Eintritt 4 € je Kind, 3 Kinder zahlen m… | M3-54 | spielbar | Q |
| MO3-03 | Situation verändern | 3 | mathe | Was passiert mit dem Rückgeld, wenn noc… | MO3-02 | spielbar | Q |
| MO3-04 | Genau oder ungefähr? | 3 | mathe | Reichen 50 € für Einkäufe zu 9,90 €, 14… | M3-29 | spielbar | Q |
| MO3-05 | Rechnung → Sachaufgabe zuordnen | 3 | mathe | 20 − 3 · 4 passt zu welcher Geschichte? | MO3-02 | spielbar | E |
| MO4-01 | Fermi-Aufgabe in Teilfragen zerlegen | 4 | mathe | „Wie viele Brötchen isst unsere Schule… | M4-07, MO2-05 | teilweise | Q |
| MO4-02 | Annahme prüfen | 4 | mathe | „Jedes Kind isst 15 Brötchen am Tag“ –… | MO4-01 | spielbar | Q |
| MO4-03 | Mit ungenauen Zahlen rechnen | 4 | mathe | ≈ 300 Kinder · 5 Tage = ≈ 1 500 Brötchen | MO4-01, M4-06 (Runden) | spielbar | E |
| MO4-04 | Je mehr – desto … | 4 | mathe | Mehr Kinder teilen eine Pizza → jedes b… | M4-Größen | spielbar | Q |

#### Prozess E. Darstellen (DA)

| ID | Schritt | Kl. | Strang | Bsp. | Vor. | Spiel | Beleg |
|---|---|---|---|---|---|---|---|
| DA1-01 | Vier Gesichter einer Zahl | 1 | mathe | 6 Plättchen = Würfelbild = „sechs“ = 6 | M1-06 | spielbar | Q |
| DA1-02 | Aufgabe ↔ Zwanzigerfeld | 1 | mathe | Welches Feld zeigt 8 + 5 über die 10? | M1-60ff | spielbar | E |
| DA1-03 | Strichliste ↔ Bilddiagramm | 1 | mathe |  | M1-84 | spielbar | E |
| DA2-01 | Rechenstrich lesen | 2 | mathe | Welche Aufgabe zeigt der Strich: 47 → 5… | M2-27ff | spielbar | E |
| DA2-02 | Malaufgabe als Punktefeld | 2 | mathe |  | M2-40 | spielbar | Q |
| DA2-03 | Tabelle aus Text | 2 | mathe | Lieblingstiere der Klasse | M2-Daten | spielbar | Q |
| DA2-04 | Forschermittel: Pfeile und Farben | 2 | mathe | Ziehe die passenden Pfeile zwischen den… | M2-37 | spielbar | Q |
| DA3-01 | Begriffstripel / Wertetabelle | 3 | mathe | 1 Kugel 1,20 €, 2 Kugeln …, 5 Kugeln? | M3-Größen, M2-57 | spielbar | Q |
| DA3-02 | Welche Darstellung hilft hier? | 3 | mathe | Kombinatorik → Baum; Weg mit Abständen… | PL3-05, DA3-01 | teilweise | Q |
| DA3-03 | Säulendiagramm ↔ Tabelle | 3 | mathe |  | M3-Daten | spielbar | Q |
| DA3-04 | Ansicht ↔ Gebäude | 3 | geometrie |  | G-Baupläne | spielbar | Q |
| DA4-01 | Darstellungen bewerten | 4 | mathe | Zwei Säulendiagramme gleicher Daten – w… | DA3-03 | spielbar | Q |
| DA4-02 | Rechenweg-Notiz | 4 | mathe | Welche Notiz zu 6 · 48 kann ein anderes… | M4-14 | teilweise | Q |

#### Prozess F. Mit mathematischen Objekten und Werkzeugen arbeiten (WZ) – KMK 2022, in Bayern nicht eigener Ringsektor

| ID | Schritt | Kl. | Strang | Bsp. | Vor. | Spiel | Beleg |
|---|---|---|---|---|---|---|---|
| WZ1-01 | Zeichen lesen | 1 | mathe | „4 < 7“ heißt: 4 ist kleiner als 7 | M1-14 | spielbar | Q |
| WZ1-02 | Das Gleichheitszeichen heißt „gleich viel“ | 1 | mathe | 7 = 3 + _; 5 + 2 = _ + 4 | WZ1-01, M1-38 | spielbar | E |
| WZ2-01 | Sprache → Term | 2 | mathe | „Das Doppelte von 7, dann 3 weniger.“ | WZ1-01, M2-47 | spielbar | Q |
| WZ2-02 | Lineal richtig anlegen | 2 | geometrie | Strecke im Spiel messen, Lineal verschi… | M2-Längen | spielbar | E |
| WZ3-01 | Fachbegriffe Geometrie | 3 | geometrie |  | G-Kl. 3 | spielbar | Q |
| WZ3-02 | Taschenrechner – wann sinnvoll? | 3 | mathe | 500 + 300 / 487 + 296 / 4 873 · 29 | M3-Schriftlich | spielbar | Q |
| WZ4-01 | Algorithmus befolgen und prüfen | 4 | mathe | „Nimm die Zahl, verdopple, ziehe 1 ab“… | PL2-06 | spielbar | Q |

### Strang lesen (121 Schritte)

#### Lesen – Klasse 1

| ID | Schritt | Beispiel | Vor. | Typ | Beleg |
|---|---|---|---|---|---|
| | **Phonologische Bewusstheit (vor/neben Buchstaben)** | | | | |
| L1-01 | Reimt sich das? | Maus/Haus, Mond/Hund? | – | F | E |
| L1-02 | Reimwort finden | Kanne → Tanne; Bein → Stein | L1-01 | F | E |
| L1-03 | Silben klatschen | Ba-na-ne (3), Hund (1) | – | F | Q |
| L1-04 | Silben zusammensetzen (hören) | To-ma-te → Tomate | L1-03 | F | E |
| L1-05 | Wörter im Satz zählen | „Der Hund bellt.“ (3) | – | F | E |
| L1-06 | Anlaut: Vokal | Igel, Ofen, Esel | – | F | E |
| L1-07 | Anlaut: Dauerlaut | Mmmaus, Sssonne | L1-06 | F | Q |
| L1-08 | Anlaut: Stopp-Laut | Topf, Kamm, Dose | L1-07 | F | Q |
| L1-09 | Endlaut hören | Bus (s), Uhu (u) | L1-07 | F | E |
| L1-10 | Laut in der Mitte | Wo ist das L in Wolke? | L1-09 | F | E |
| L1-11 | Laute sprechen, nicht Namen | M, S, F | – | F | Q |
| L1-12 | Laute zusammenziehen (hören) | O-m-a → Oma | L1-11 | F | E |
| L1-13 | Laute zählen | Sofa (4), Mond (4) | L1-12 | F | E |
| L1-14 | Laut tauschen/weglassen | Maus → Laus; Mast ohne M → Ast | L1-13 | F | E |
| | **Laut-Buchstaben-Zuordnung (Reihenfolge nach FIB/KLA-Synthese)** | | | | |
| L1-15 | M m | Mama, Mond | L1-07 | R | Q |
| L1-16 | A a | Ast, Ameise | L1-06 | R | Q |
| L1-17 | I i | Igel, Insel | L1-06 | R | Q |
| L1-18 | O o | Ofen, Opa | L1-06 | R | Q |
| L1-19 | Erste Silbe lesen | ma, mi, mo, am, im | L1-15–18 | F | Q |
| L1-20 | L l | Lama, Lola | L1-19 | R | Q |
| L1-21 | S s | Sofa, Salami, Mais | L1-19 | R | Q |
| L1-22 | R r | Rose, Rasen | L1-19 | R | Q |
| L1-23 | U u | Uhu, Uli | L1-06 | R | Q |
| L1-24 | E e | Esel, Rose | L1-06 | R | Q |
| L1-25 | N n | Nase, Nina | L1-19 | R | Q |
| L1-26 | F f | Fisch(später), Sofa, Feder | L1-19 | R | Q |
| L1-27 | Zweisilbige Wörter aus offenen Silben | Ma-ma, Na-se, ro-sa, Lo-mo | L1-19 | F | Q |
| L1-28 | T t | Tomate, Tante | L1-27 | R | Q |
| L1-29 | W w | Wal, Wolle | L1-27 | R | Q |
| L1-30 | H h am Silbenanfang | Hose, Hut | L1-27 | R | Q |
| L1-31 | Endungen -en / -er lesen | malen, Leiter, Ofen | L1-27 | R | Q |
| L1-32 | D d | Dose, Dino | L1-28 | R | Q |
| L1-33 | K k | Kino, Kamel | L1-28 | R | Q |
| L1-34 | P p | Pinsel, Papa | L1-28 | R | Q |
| L1-35 | B b | Banane, Besen | L1-28 | R | Q |
| L1-36 | G g | Gabel, Gold | L1-28 | R | Q |
| L1-37 | b, d, p, q unterscheiden ★ | Dach/Bach, Puppe/Buppe (Quatschwort), Qualle | L1-32,34,35 | F | E |
| L1-38 | ei | Eis, Seife, mein | L1-24 | R | Q |
| L1-39 | au | Auto, Baum | L1-16,23 | R | Q |
| L1-40 | sch | Schaf, Fisch | L1-21 | R | Q |
| L1-41 | ch (Ich-Laut) | ich, Licht, Milch | L1-24 | R | Q+E |
| L1-42 | ch (Ach-Laut) | Dach, Buch, Bauch | L1-41 | R | E |
| L1-43 | Z z | Zelt, Zahn | L1-28 | R | Q |
| L1-44 | Ä ä | Bär, Käse | L1-16 | R | Q |
| L1-45 | Ö ö | Löwe, böse | L1-18 | R | Q |
| L1-46 | Ü ü | Tür, müde | L1-23 | R | Q |
| L1-47 | eu | Eule, neu | L1-38 | R | Q |
| L1-48 | äu | Mäuse, Bäume | L1-47 | R | E |
| L1-49 | ie | Biene, Wiese | L1-17 | R | E |
| L1-50 | St st am Wortanfang | Stern, Stuhl, Stift | L1-40 | R | Q |
| L1-51 | Sp sp am Wortanfang | Spinne, Spiel | L1-50 | R | Q |
| L1-52 | tz | Katze, Mütze | L1-43 | R | E |
| L1-53 | ck | Decke, Rock | L1-33 | R | E |
| L1-54 | ng | Ring, singen | L1-36 | R | E |
| L1-55 | nk | Bank, trinken | L1-54 | R | E |
| L1-56 | Pf pf | Pferd, Apfel, Topf | L1-34,26 | R | Q |
| L1-57 | J j | Jacke, ja, Juli | L1-27 | R | Q |
| L1-58 | V v | Vogel, Vase | L1-26 | M | Q |
| L1-59 | ß | Fuß, Straße | L1-21 | R | Q |
| L1-60 | Qu qu | Qualle, quaken | L1-33 | R | Q |
| L1-61 | X x | Hexe, Taxi | L1-33 | R | Q |
| L1-62 | Y y | Pony, Baby | – | M | Q |
| L1-63 | C c (Kl. 1–2) | Clown, Comic | – | M | E |
| L1-64 | ai (Kl. 1–2) | Mai, Hai | L1-38 | M | E |
| L1-65 | ph (Kl. 1–2) | Strophe, Alphabet | – | M | E |
| L1-66 | Groß- und Kleinbuchstabe zuordnen | Memory | L1-15ff | F | Q |
| | **Wort- und Satzlesen** | | | | |
| L1-67 | Wort mit Anfangsdoppelkonsonanz lesen | Fra-ge, Bro-te, Kle-e | L1-27 | F | Q |
| L1-68 | Kurzer Vokal in geschlossener Silbe | Wol-ke, Bal-ken, Kan-ne | L1-27 | F | Q |
| L1-69 | Lang oder kurz? (Lesen) | Kno-ten/Kon-to, Bro-te/Bor-te | L1-68 | F | Q |
| L1-70 | Konsonantenhäufung | Strumpf, Kind, Schnecke | L1-67 | F | Q |
| L1-71 | Lange Wörter in Silben (Kl. 1–2) | Scho-ko-la-de, Ba-de-wan-ne | L1-27 | F | Q |
| L1-72 | Blitzwörter (Sichtwörter) | und, ist, der, die, das, ich, ein | – | M | Q |
| L1-73 | Wort zum Bild | Maus / Mais / Mus | L1-27 | F | E |
| L1-74 | Quatschwörter lesen | Lomi, Furat | L1-27 | F | Q |
| L1-75 | Satz zum Bild | „Mia malt.“ | L1-72 | F | E |
| L1-76 | Stimmt das? | „Ein Fisch kann fliegen.“ | L1-75 | F | E |
| L1-77 | Lies und tu | „Male den Ball rot.“ | L1-75 | F | E |
| L1-78 | Punkt heißt Pause | Zwei-Satz-Texte | L1-75 | F | Q |
| L1-79 | Frage zum Text | „Wer hat den Hut?“ | L1-75 | F | Q |

#### Lesen – Klasse 2

| ID | Schritt | Beispiel | Vor. | Typ | Beleg |
|---|---|---|---|---|---|
| L2-01 | Wortbausteine sehen | ver-, vor-, -en, -er, -el | L1-71 | F | Q |
| L2-02 | Wortstamm sehen | fahren, Fahrrad, Fahrt | L2-01 | F | Q |
| L2-03 | Blitzwörter 2 | nicht, auch, sind, haben, wir | L1-72 | M | Q |
| L2-04 | Genau hinsehen | Hose/Rose, Bach/Buch, Kanne/Kante | L1-69 | F | Q+E |
| L2-05 | Über die Zeile lesen | Satz mit Umbruch | L1-78 | F | Q |
| L2-06 | Schnell-Lesen (wiederholt) | Satz 3× lesen, Zeit messen | L1-78 | F | Q |
| L2-07 | Fragen klingen anders | „Kommst du?“ / „Hilfe!“ | L1-78 | F | Q |
| L2-08 | Falsches Wort finden | „Der Hund miaut.“ | L1-76 | F | E |
| L2-09 | Wer, wo, wann? | Kurzgeschichte | L1-79 | F | Q |
| L2-10 | Was passiert zuerst? | 3–4 Bilder | L2-09 | F | Q |
| L2-11 | Überschrift verrät | „Der verlorene Schlüssel“ | L2-09 | F | Q |
| L2-12 | Unbekanntes Wort klären | Wort antippen → Bild | L2-09 | F | Q |
| L2-13 | Wie geht es weiter? | 3 Enden zur Auswahl | L2-10 | F | Q |
| L2-14 | Tabellen lesen | Stundenplan | L2-09 | F | Q |
| L2-15 | Textsorte erkennen | Textausschnitte | L2-09 | F | Q |
| L2-16 | Reim im Gedicht | Kurzvers | L1-02 | F | Q |
| L2-17 | Figur beschreiben | „Wie ist die Hexe?“ | L2-09 | F | Q |
| L2-18 | Wo steht es? | „Lies Zeile 3“ | L2-05 | F | Q |
| L2-19 | Fettgedrucktes nutzen | Sachtext mit Fettdruck | L2-09 | F | Q |
| L2-20 | Lesetagebuch/Leseerfahrung austauschen (!) | – | – | F | Q |

#### Lesen – Klasse 3

| ID | Schritt | Beispiel | Vor. | Typ | Beleg |
|---|---|---|---|---|---|
| L3-01 | Morpheme lesen | Fuß-ball-platz, Ver-kehrs-am-pel | L2-01 | F | Q |
| L3-02 | Lesen mit Betonung | Dialog mit Sprechern | L2-07 | F | Q |
| L3-03 | Wort aus dem Zusammenhang | „Der Kater döste in der Sonne.“ → döste = ? | L2-12 | F | Q |
| L3-04 | Wichtiges markieren | Sachtext Igel | L2-19 | F | Q |
| L3-05 | Auf wen bezieht sich „er“? | „Tom ruft Ben. Er kommt.“ | Gr3-09 ‡ | F | Q+E |
| L3-06 | Zwischen den Zeilen | „Lea nimmt den Schirm.“ → Wetter? | L2-09 | F | Q |
| L3-07 | Märchen erkennen | Textausschnitte | L2-15 | F | Q |
| L3-08 | Fabel erkennen | Tiere handeln wie Menschen, Lehre | L3-07 | F | Q |
| L3-09 | Sachtext + Bild | Kreislauf des Wassers | L2-14 | F | Q |
| L3-10 | Inhaltsverzeichnis nutzen | Kinderlexikon | L2-18 | F | Q |
| L3-11 | Was bedeutet die Redewendung? | „Tomaten auf den Augen haben“ | L3-03 | F | Q |
| L3-12 | In eigenen Worten wiedergeben (!) | Inhalt zusammenfassen | – | F | Q |

#### Lesen – Klasse 4

| ID | Schritt | Beispiel | Vor. | Typ | Beleg |
|---|---|---|---|---|---|
| L4-01 | Info verknüpfen | „Welche zwei Gründe…?“ | L3-04 | F | Q |
| L4-02 | Beste Überschrift | 3 Überschriften | L4-01 | F | Q |
| L4-03 | Warum tut sie das? | Gefühle/Motive von Figuren erschließen | L2-17 | F | Q |
| L4-04 | Sprachbilder | „stark wie ein Bär“ | L3-11 | F | Q |
| L4-05 | Gedicht-Bausteine | Paarreim/Kreuzreim | L2-16 | F | Q+E |
| L4-06 | Sage erkennen | Merkmale Sage (realer Ort, wahrer Kern) | L3-07 | F | Q |
| L4-07 | Klicken und finden | Mini-Website | L3-10 | F | Q |
| L4-08 | Passt nicht zusammen! | Widerspruch im Text bemerken (Verstehensüberw… | L4-01 | F | Q |
| L4-09 | Tempo, Lautstärke, Betonung variieren | Gedichtvortrag | L3-02 | F | Q |
| L4-10 | Wertung begründen (!) | Meinung zum Text äußern | – | F | Q |

### Strang schreiben (242 Schritte: Rechtschreibung und Zeichensetzung, Schrifterwerb, Texte verfassen)

Die Schrift-Tabellen „Schreiben (Schrift)“ aus deutsch_themen.md bleiben zur Nachvollziehbarkeit stehen, werden aber durch den Block Schrifterwerb weiter unten ersetzt.

#### Schreiben (Schrift) – Klasse 1

| ID | Schritt | Beispiel | Vor. | Typ | Beleg |
|---|---|---|---|---|---|
| S1-01 | Schwungübungen | Girlanden | – | F | E |
| S1-02 | Stift richtig halten (!) | Stifthaltung/Druck | – | F | Q |
| S1-03 | Das Schreibhaus | Dach/Haus/Keller | S1-01 | F | E |
| S1-04 | Großbuchstaben aus Strich/Kreis/Bogen | M, A, O, L | S1-03 | F | Q |
| S1-05 | Kleinbuchstaben mit Ober-/Unterlänge | b, d, g, p, f, t | S1-04 | F | E |
| S1-06 | Spiegelbuchstaben schreiben | Nachspuren | S1-05 | F | E |
| S1-07 | Wortabstand | Fingerabstand | S1-05 | F | Q |

#### Schreiben (Rechtschreibung) – Klasse 1

| ID | Schritt | Beispiel | Vor. | Typ | Beleg |
|---|---|---|---|---|---|
| S1-08 | Schreiben mit der Anlauttabelle | Sofa, Nase, Limo | L1-13 | R | Q |
| S1-09 | Silben schwingen beim Schreiben | Ra-ke-te | L1-03 | R | Q |
| S1-10 | Jede Silbe hat einen Selbstlaut | Ta-fel, Lö-we | S1-09 | R | Q |
| S1-11 | Endung -e | Rose, Hase, Nase | S1-09 | R | Q |
| S1-12 | Endung -en | laufen, Garten, Besen | S1-11 | R | Q |
| S1-13 | Endung -er | Vater, Leiter, Tiger | S1-11 | R | Q |
| S1-14 | Endung -el | Esel, Nebel, Gabel | S1-11 | R | Q |
| S1-15 | Alle Laute am Anfang | Frosch, Blume, Krone | S1-09 | R | E |
| S1-16 | Alle Laute am Ende/in der Mitte | Hemd, Wurst, Kerze | S1-15 | R | E |
| S1-17 | ei schreiben (klingt „ai“) | Eimer, Zeit | L1-38 | R | Q |
| S1-18 | au schreiben | Haus, Frau | L1-39 | R | E |
| S1-19 | eu schreiben (Kl. 1–2) | heute, Feuer | L1-47 | R | E |
| S1-20 | sch schreiben | Schule, waschen | L1-40 | R | E |
| S1-21 | st am Anfang (hört „scht“) (Kl. 1–2) | Stein, Stück | L1-50 | R | Q |
| S1-22 | sp am Anfang (hört „schp“) (Kl. 1–2) | Spaß, spielen | L1-51 | R | E |
| S1-23 | ch schreiben (Ich/Ach) | Licht, Nacht | L1-41,42 | R | E |
| S1-24 | qu schreiben (hört „kw“) (Kl. 1–2) | Quark, Quelle | L1-60 | M | E |
| S1-25 | pf schreiben (Kl. 1–2) | Pflaume, Kopf | L1-56 | R | E |
| S1-26 | ng/nk schreiben (Kl. 1–2) | lang, Zange, Schrank | L1-54,55 | R | E |
| S1-27 | Großer Satzanfang | „Heute regnet es.“ | L1-78 | R | Q |
| S1-28 | Punkt am Ende | Satzschlusszeichen setzen | S1-27 | R | Q |
| S1-29 | Namen groß | Lea, Tom | – | R | Q |
| S1-30 | Abschreiben wie ein Profi | Lernwort 3 Schritte | S1-08 | F | Q |
| S1-31 | Lernwörter: kleine Wörter | und, ist, ich, nicht, mit | L1-72 | M | Q |
| S1-32 | ABC-Reihe | Lücken füllen | L1-66 | F | Q |

#### Schreiben (Rechtschreibung) – Klasse 2

| ID | Schritt | Beispiel | Vor. | Typ | Beleg |
|---|---|---|---|---|---|
| S2-01 | Lang oder kurz? (hören) | Ofen–offen, Esel–Ente, Hüte–Hütte | L1-69 | F | Q |
| S2-02 | Offene und geschlossene Silbe | Ho-se, Ro-se vs. Hun-de, Kan-ne | S2-01 | R | Q |
| S2-03 | Doppelt bei ll/mm/nn | Wolle, Himmel, Sonne | S2-02 | R | Q+E |
| S2-04 | Doppelt bei tt/pp | Mutter, Suppe, Mappe | S2-03 | R | Q+E |
| S2-05 | Doppelt bei ss/ff | Tasse, Koffer, Affe | S2-03 | R | E |
| S2-06 | Doppelt bei rr | Karren, irren | S2-03 | R | E |
| S2-07 | Kontrastpaare einfach/doppelt | Hüte/Hütte, Miete/Mitte, Schal/Schall | S2-03–06 | R | Q+E |
| S2-08 | ck statt kk | Decke, backen, Socke | S2-03 | R | Q |
| S2-09 | tz statt zz | Katze, Pfütze, sitzen | S2-08 | R | Q |
| S2-10 | Kein ck/tz nach Mitlaut ★ | Wolke, Kerze, Pilz | S2-08,09 | R | E |
| S2-11 | r nach Selbstlaut | packen–parken, Pate–Partner, Garten | S2-01 | R | Q |
| S2-12 | ie bei langem i | Biene, Wiese, liegen | S2-02 | R | Q |
| S2-13 | i oder ie? | Mitte–Miete, Kiste–Liebe, Lippe–Liebe | S2-12 | R | E |
| S2-14 | Silbentrennendes h | ge-hen, se-hen, Schu-he | S1-09 | R | Q+E |
| S2-15 | Verlängern: Nomen → Mehrzahl (d/t) | Hund–Hunde, Bild–Bilder | Gr2-01 ‡ | R | Q |
| S2-16 | Verlängern: Nomen (g/k) | Zwerg–Zwerge, Berg, Weg | S2-15 | R | Q |
| S2-17 | Verlängern: Nomen (b/p) | Korb–Körbe, Dieb–Diebe | S2-15 | R | E |
| S2-18 | Verlängern: Verb → wir-Form / Grundform | er legt → wir legen; sie lebt → leben | Gr2-09 ‡ | R | Q |
| S2-19 | Verlängern: Adjektiv → Endung/steigern | rot–rote, wild–wilder, lieb–lieber | Gr2-12 ‡ | R | Q |
| S2-20 | Verlängern hilft auch bei Doppelt (Kl. 2–3) | Ball–Bälle, Bett–Betten, dünn–dünner | S2-07, S2-15 | R | Q |
| S2-21 | Ableiten ä von a | Ball–Bälle, Hand–Hände | S2-15 | R | Q |
| S2-22 | Ableiten äu von au | Haus–Häuser, Baum–Bäume | S2-21 | R | Q |
| S2-23 | Vorsilben ver-, vor- | verlieren, vorlesen | L2-01 | M | Q |
| S2-24 | Nomen groß (Artikelprobe) | der Baum, die Katze | Gr2-06 ‡ | R | Q |
| S2-25 | Fragezeichen und Ausrufezeichen | „Wo bist du?“ | Gr2-14 | R | Q |
| S2-26 | Merkwörter mit V | Vogel, Vater, viel, von, vier | L1-58 | M | Q |
| S2-27 | Merkwörter mit Dehnungs-h | fahren, Uhr, Zahl, ohne | S2-02 | M | Q |
| S2-28 | ABC: 2. Buchstabe | Ast, Affe, Arm | S1-32 | F | E |
| S2-29 | Nachschlagen in der Wörterliste | Wörterliste | S2-28 | F | Q |
| S2-30 | Fehler finden durch Vergleich | Abschrift mit Vorlage vergleichen | S1-30 | F | Q |
| S2-31 | Fehlerdetektiv | „Hunt“ → Hund | S2-15 | F | Q |

#### Schreiben (Schrift) – Klasse 2

| ID | Schritt | Beispiel | Vor. | Typ | Beleg |
|---|---|---|---|---|---|
| S2-32 | Schreibschrift-Buchstaben | a, e, l, s | S1-05 | F | Q |
| S2-33 | Buchstaben verbinden | ei, en, ch | S2-32 | F | Q |
| S2-34 | Flüssig schreiben (Kl. 2–4) (!) | Satz in Zeit | S2-33 | F | Q |

#### Schreiben – Klasse 3

| ID | Schritt | Beispiel | Vor. | Typ | Beleg |
|---|---|---|---|---|---|
| S3-01 | Doppelt bei Einsilbern (Routine) | Fell, Kamm, schnell, satt | S2-20 | R | Q |
| S3-02 | ck/tz bei Einsilbern | Stock–Stöcke, Blitz–Blitze, Netz | S3-01 | R | Q |
| S3-03 | Doppelt in gebeugten Formen | er kommt (kommen), sie rennt | S2-18 | R | Q |
| S3-04 | s summt, ß zischt | Rose vs. Soße, lesen vs. heißen | L1-59 | R | E |
| S3-05 | ß nach langem Vokal | Straße, groß–größer, grüßen | S3-04 | R | E |
| S3-06 | ss nach kurzem Vokal | Wasser, Kissen, essen | S3-05, S2-05 | R | E |
| S3-07 | ß nach ei/au/eu | heiß, draußen, weiß | S3-05 | R | E |
| S3-08 | ß oder ss im Einsilber | S3-05,06 | – | R | E |
| S3-09 | Ableiten e/ä: Mehrzahl | Gast–Gäste, Apfel–Äpfel | S2-21 | R | Q+E |
| S3-10 | Ableiten e/ä: Steigerung | kalt–kälter, lang–länger | Gr2-21 ‡ | R | E |
| S3-11 | Ableiten e/ä: Verkleinerung | Hand–Händchen, Glas–Gläschen | S3-09 | R | E |
| S3-12 | Ableiten e/ä: Verbform | fallen–fällt, tragen–trägt | Gr2-09 ‡ | R | E |
| S3-13 | Ableiten e/ä: Wortfamilie | Glanz–glänzen, Kamm–kämmen, Wahl–wählen | S3-09 | R | Q |
| S3-14 | Ableiten eu/äu (fünf Wege) | Bäume (Mz.), Häuschen (Verkl.), läuft (Verb),… | S2-22 | R | E |
| S3-15 | Merkwörter mit ä/äu ohne a-Verwandten | Bär, Käse, Mädchen, sägen | S3-13 | M | Q |
| S3-16 | Wortfamilie: Stamm bleibt | fahren, Fahrt, Fahrer; Kuss/küssen | Gr2-16 ‡ | R | Q |
| S3-17 | Vorsilben ent-, zer-, un-, ver- | entdecken, zerreißen, unklar | S2-23 | R | E |
| S3-18 | Nachsilben -ung, -heit, -keit, -nis → groß | Zeitung, Freiheit, Heiterkeit, Zeugnis | Gr3-12 | R | Q |
| S3-19 | -ig am Ende (klingt „ich“) | lustig–lustige, König–Könige | S2-19 | R | Q |
| S3-20 | -ig oder -lich? | freundlich, fröhlich vs. eilig | S3-19 | R | Q |
| S3-21 | Abstrakte Nomen groß | die Angst, das Glück, die Freude | S2-24 | R | Q |
| S3-22 | Zusammengesetzte Nomen schreiben | Handtuch (Hand!), Waldweg | Gr2-15 ‡ | R | Q |
| S3-23 | Fugen-s | Geburtstag, Arbeitsblatt | S3-22 | R | Q |
| S3-24 | Trennen am Zeilenende | Ta-fel, Fens-ter, Kis-te | S1-09 | R | Q |
| S3-25 | Trennen bei Doppelt und ck | Son-ne, Mut-ter, di-cke | S3-24 | R | Q |
| S3-26 | Wörtliche Rede: Begleitsatz vorne | Mia sagt: „Komm her!“ | Gr3-20 ‡ | R | Q |
| S3-27 | Merkwörter: aa, ee, oo | Haar, Meer, Boot, Zoo | S2-02 | M | Q+E |
| S3-28 | Merkwörter: chs und x | Fuchs, Dachs, sechs; Hexe, Text | L1-61 | M | E |
| S3-29 | Merkwörter: langes i ohne ie | mir, dir, wir, Tiger, Kino; ihr, ihm | S2-12 | M | Q+E |
| S3-30 | Merkwörter: Dehnungs-h (Tendenz l/m/n/r) | Zahl, nehmen, Lehrer vs. Schal, Name | S2-27 | M | E |
| S3-31 | Merkwörter: ai | Mai, Kaiser, Saite | L1-64 | M | E |
| S3-32 | Wörterbuch: Grundform suchen | lief → laufen; Bäume → Baum | Gr3-03 | F | Q |
| S3-33 | Fremdwörter mit Mustern (Kl. 3–4) | Melone (kein h), Maschine (i statt ie), Vulka… | S3-29 | M/R | Q |

#### Schreiben – Klasse 4

| ID | Schritt | Beispiel | Vor. | Typ | Beleg |
|---|---|---|---|---|---|
| S4-01 | Wörtliche Rede: Begleitsatz hinten | „Komm her!“, ruft Mia. „Ja“, sagt Tom | S3-26 | R | Q |
| S4-02 | Wörtliche Rede: Begleitsatz in der Mitte | „Morgen“, sagt Oma, „backen wir.“ | S4-01 | R | E |
| S4-03 | Komma bei Aufzählung | Äpfel, Birnen und Pflaumen | Gr2-14 | R | Q |
| S4-04 | Komma vor aber/weil/dass | …, weil es regnet | Gr4-15 ‡ | R | E |
| S4-05 | das oder dass? (Kl. 4 (eher 5)) | Ich weiß, dass… / das Haus, das… | Gr4-15 ‡ | R | E |
| S4-06 | Adjektiv in Nominalgruppe klein | der rote neue Ball | S3-21 | R | Q |
| S4-07 | Verben als Nomen (Signalwörter) | das Lesen, beim Spielen | S4-06 | R | E |
| S4-08 | Strategien kombinieren | Schreibblock (schreiben + Block), Waldweg | S3-22 | R | Q |
| S4-09 | Stammvokalwechsel erkennen | schieben–Schubkarre, fliegen–Flug | S3-16 | R | Q |
| S4-10 | end- oder ent-? | endlich vs. entdecken | S3-17 | R | E |
| S4-11 | Zweifelsfall nachschlagen | Rhythmus, Portemonnaie | S3-32 | F | Q |
| S4-12 | Gleich klingt, anders geschrieben | Wal/Wahl, Lid/Lied, Meer/mehr | S3-27 | M | Q |
| S4-13 | Text auf Fehler prüfen (!) | Checkliste | S2-31 | F | Q |

#### Schrifterwerb (82 Schritte, ersetzt S1-01 bis S1-07 und S2-32 bis S2-34)

Pfad: Blöcke V, DK, DG, Z für alle; danach VA, SAS oder teilverbunden (bei teilverbunden entfallen SB, SV, SG). Abschluss eines Schrift-Themas nur auf Stufe `kopf` (aus dem Gedächtnis schreiben).

#### Schrift, Block V – Vorstufen (Vorschule/Kl. 1, Schrift: beide)

| ID | Schritt | Kl. | Schrift | Schwierigkeit | Bsp. | Vor. | Beleg |
|---|---|---|---|---|---|---|---|
| V-01 | So hält der Stift | 1 | beide | Dreipunktgriff, Blattlage (Hinweis, nicht… | Bildanleitung rechts/links | – | Q |
| V-02 | Regen fällt | 1 | beide | Senkrechter Strich von oben nach unten | ǀ ǀ ǀ | V-01 | Q+E |
| V-03 | Die Straße | 1 | beide | Waagerechter Strich von links nach rechts | — | V-01 | E |
| V-04 | Berg und Tal | 1 | beide | Schrägstriche, Spitze/Zickzack | /\/\ | V-02, V-03 | E |
| V-05 | Die Schnecke rollt | 1 | beide | Kreis linksherum (Kombination Finger+Hand… | ○ gegen Uhrzeigersinn | V-02 | Q |
| V-06 | Schaukel | 1 | beide | Girlande (unten rund) | ∪∪∪ | V-05 | Q |
| V-07 | Brücken | 1 | beide | Arkade (oben rund) | ∩∩∩ | V-05 | Q |
| V-08 | Wellen | 1 | beide | Wechsel Girlande/Arkade (Drehrichtungswec… | ∿ | V-06, V-07 | E |
| V-09 | Luftballon-Schlaufe | 1–2 | beide | Schleife nach oben | ℓℓℓ | V-06 | Q |
| V-10 | Anker-Schlaufe | 1–2 | beide | Schleife nach unten | Unterlängenschleife | V-09 | E |
| V-11 | Das Buchstabenhaus | 1 | beide | Zeilenraum: Keller/Erdgeschoss/Dach (Unte… | Punkte in Bänder setzen | V-02 | Q+E |
| V-12 | Von links nach rechts | 1 | beide | Schreibrichtung in der Zeile, Zeilenwechs… | Formenreihe | V-11 | Q |

#### Schrift, Block DK – Druckschrift Kleinbuchstaben (Kl. 1, Schrift: Druck)

| ID | Schritt | Kl. | Schrift | Schwierigkeit | Bsp. | Vor. | Beleg |
|---|---|---|---|---|---|---|---|
| DK-01 | Stäbchen | 1 | Druck | nur Abstrich (+ Punkt) | l, i | V-02, V-11 | E |
| DK-02 | Stäbchen mit Kreuz | 1 | Druck | Abstrich + Querstrich | t | DK-01, V-03 | E |
| DK-03 | Angelhaken | 1 | Druck | Abstrich in den Keller mit Haken | j | DK-01 | E |
| DK-04 | Zauber-c | 1 | Druck | offener Linksbogen | c | V-05 | Q |
| DK-05 | Ganz rund | 1 | Druck | geschlossener Linksbogen | o | DK-04 | E |
| DK-06 | Bogen + Stab | 1 | Druck | c-Bogen, dann Stab rechts (Mittelband bzw… | a, d | DK-04, DK-01 | Q |
| DK-07 | Bogen + Kellerstab | 1 | Druck | c-Bogen + Unterlänge mit Haken | g | DK-06, DK-03 | Q |
| DK-08 | Querstrich zuerst | 1 | Druck | erst waagerecht, dann c-Bogen | e | DK-04 | E |
| DK-09 | Schlangenbuchstabe | 1 | Druck | Doppelbogen mit Richtungswechsel | s | V-08 | E |
| DK-10 | Brückenbuchstaben | 1 | Druck | Stab, zurück hoch, Brücke | n, m, h, r | V-07, DK-01 | Q |
| DK-11 | Schaukel + Stab | 1 | Druck | Girlande, dann Stab | u | V-06 | E |
| DK-12 | Stab + Bauch | 1 | Druck | Stab zuerst, dann Rechtsbogen | b, p | DK-10 | Q |
| DK-13 | Spitze unten | 1 | Druck | Schrägstriche, Spitze im Tal | v, w | V-04 | E |
| DK-14 | Schräg und gekreuzt | 1 | Druck | Kreuzen/Knicken von Schrägstrichen | x, k, y, z | DK-13 | Q |
| DK-15 | Krückstock | 1 | Druck | Bogen oben, dann Stab und Querstrich | f | DK-02 | Q |
| DK-16 | Gerader Kellerstab | 1 | Druck | c-Bogen + gerader Stab nach unten (Kontra… | q | DK-07 | Q |
| DK-17 | Pünktchen und Striche | 1 | Druck | Umlautpunkte, ß | ä, ö, ü, ß | DK-06, DK-05, DK-11, DK-12 | E |
| DK-18 | Spiegel-Detektiv | 1–2 | Druck | b/d/p/q unterscheiden (Startbewegung) | bad, dop, Puppe | DK-06, DK-12, DK-16 | Q+E |

#### Schrift, Block DG – Druckschrift Großbuchstaben (Kl. 1, Schrift: Druck)

| ID | Schritt | Kl. | Schrift | Schwierigkeit | Bsp. | Vor. | Beleg |
|---|---|---|---|---|---|---|---|
| DG-01 | Gerade Großbuchstaben | 1 | Druck | nur senkrecht + waagerecht, Startpunkt ob… | L, T, I, E, F, H | V-02, V-03 | Q |
| DG-02 | Runde Großbuchstaben | 1 | Druck | Linksbogen groß | C, O, G, Q, S | DK-04 | Q |
| DG-03 | Becher und Haken | 1 | Druck | Girlande/Haken groß | U, J | DK-11, DK-03 | Q |
| DG-04 | Stab mit Bauch | 1 | Druck | Stab + Rechtsbogen(en) | D, P, B, R | DK-12 | Q |
| DG-05 | Schräge Großbuchstaben | 1 | Druck | Schrägstriche, Spitzen | A, V, W, M, N, K, X, Y, Z | DK-13 | Q |
| DG-06 | Groß oder klein? | 1 | Druck | gleiche Form, nur Größe verschieden | Cc, Oo, Ss, Vv, Ww, Xx, Z… | DG-01–05 | E |
| DG-07 | Abstand halten | 1 | Druck | Lücke zwischen Wörtern | „Ich mag Eis.“ | DG-06 | Q |
| DG-08 | Mein Name | 1 | Druck | eigener Name, Großbuchstabe am Anfang | Vorname | DG-06 | Q |

#### Schrift, Block Z – Ziffern (Kl. 1, Schnittstelle Mathe, Schrift: Druck)

| ID | Schritt | Kl. | Schrift | Schwierigkeit | Bsp. | Vor. | Beleg |
|---|---|---|---|---|---|---|---|
| Z-01 | Strich-Ziffern | 1 | Druck | nur Geraden/Ecken | 1, 4, 7 | V-04 | E |
| Z-02 | Runde Ziffern | 1 | Druck | Linksbogen + Stab | 0, 6, 9 | V-05 | E |
| Z-03 | Bogen-Ziffern | 1 | Druck | Rechtsbogen, Richtungswechsel | 2, 3, 5, 8 | V-08 | E |
| Z-04 | Spiegel-Ziffern | 1 | Druck | Spiegelfehler und 6/9 unterscheiden | 2, 3, 5, 7, 9, 6 | Z-01–03 | E |

#### Schrift, Block SB/SV – verbundene Schrift Kleinbuchstaben und Verbindungen (Kl. 2, ab Ende Kl. 1; Schrift: VA oder SAS, Pfad wählbar)

| ID | Schritt | Kl. | Schrift | Schwierigkeit | Bsp. | Vor. | Beleg |
|---|---|---|---|---|---|---|---|
| SB-01 | Zwei Schriften vergleichen | 2 | beide | Druck- und Schreibschriftform zuordnen | i/i, u/u … | DK-18, DG-06 | Q |
| SB-02 | Schaukel-Buchstaben | 2 | beide | Girlandenbuchstaben mit Verbindungsstrich… | i, u, ü (VA auch t) | V-06, SB-01 | Q |
| SV-01 | In einem Zug | 2 | beide | zwei Buchstaben ohne Absetzen verbinden | ui, iu, im | SB-02 | Q |
| SB-03 | Brücken-Buchstaben | 2 | beide | Arkadenbuchstaben | n, m | V-07, SV-01 | Q |
| SB-04 | Kleines r | 2 | beide | Sonderform mit Deckstrich/Haken | r; ar, or | SB-03 | Q |
| SB-05 | t und f im Wort | 2 | VA/SAS | Halbe Oberlänge, Querstrich nach dem Abst… | t (f später) | SB-02 | Q |
| SB-06 | Ovale | 2 | beide | Linksoval im Mittelband (Startpunkt oben… | c, a, o | V-05, SB-02 | Q |
| SV-02 | Luftsprung zum Oval | 2 | VA | vor Linksoval absetzen und neu ansetzen s… | na, ia, mo | SB-06 | Q |
| SV-03 | Hinauf zum Oval | 2 | SAS | Verbindung zum Oval mit Deckstrich/Formän… | an, on, ma | SB-06 | Q |
| SB-07 | Oval mit Stab | 2 | beide | Oval + Oberlänge bzw. Unterlänge | d, g, q | SB-06 | Q |
| SV-04 | Oben weiter | 2 | beide | Verbindung aus dem oberen Bogen (Buchstab… | oh, on, va, ve, we | SB-06 | Q |
| SB-08 | Spitze oben | 2 | beide | v, w mit Endhaken oben; u/v unterscheiden | v, w; viel, Wurm | SV-04 | Q |
| SB-09 | Das e | 2 | VA: Köpfchen-e / SAS: S… | Drehrichtungswechsel im e und Verbindungen | e; ie, ei, re, el, te | SB-02 | Q |
| SB-10 | Oberlängen-Schleifen | 2 | beide | Schleife ins Dach | l, h, k, b | V-09, SB-09 | Q |
| SV-05 | Nicht verwechseln: b/l, k/h | 2 | beide | ähnliche Schleifenbuchstaben unterscheiden | be, le; Bank, hell | SB-10 | Q |
| SB-11 | Der Knoten | 2 | SAS | kleine Schleife beim Richtungswechsel | b, (v, w, o je nach Lehrg… | SB-10 | Q |
| SB-12 | Unterlängen-Schleifen | 2 | beide | Schleife in den Keller | j, y, g | V-10 | Q |
| SV-06 | Schlaufe unten weiter | 2 | beide | Verbindung aus der Unterlängenschleife | ja, ge, ju | SB-12 | Q |
| SB-13 | Ober- und Unterlänge | 2 | beide | f über drei Bänder; p ohne Schleife | f, p | SB-10, SB-12 | Q |
| SB-14 | Das s | 2 | VA (pos.-abh.) / SAS | s am Wortanfang, in der Mitte, am Ende | das, Dose, Maus | SB-09 | Q |
| SV-07 | s-Verbindungen | 2 | beide | st, sp, sch, ss mit oder ohne Verbindung | Stern, Spiel, schön, essen | SB-14 | Q |
| SB-15 | ß | 2 | beide | ß Anfang/Ende, Schleife bei Folgebuchstabe | Straße, heiß | SB-14 | Q |
| SB-16 | Das Schreibschrift-z und x | 2 | beide | z ohne Druck-Entsprechung (VA) lesen und… | Zebra, Hexe | SB-12 | Q |
| SV-08 | ck, ch, tz | 2 | beide | häufige Konsonantenverbindungen | Zucker, Buch, Katze | SB-10, SB-16 | Q |

#### Schrift, Block SG – Großbuchstaben verbundene Schrift (Kl. 2, eingestreut ab SB-03)

| ID | Schritt | Kl. | Schrift | Schwierigkeit | Bsp. | Vor. | Beleg |
|---|---|---|---|---|---|---|---|
| SG-01 | Großbuchstaben ohne Verbindung | 2 | VA (bzw. SAS angesetzt) | Großbuchstabe steht, nächster setzt neu a… | S, T, O, D, P, B | DG-06, SB-03 | Q |
| SG-02 | Großbuchstaben mit Bogen-Anschluss | 2 | beide | Verbindung im flachen Bogen bzw. „aus der… | A, F, H; Au, Nu | SG-01 | Q |
| SG-03 | Knifflige Großbuchstaben | 2 | beide | Spitze mit kurzer Pause, Sonderformen; A… | L, Z, K, E, I, J | SG-02 | Q+E |

#### Schrift, Block SW – Wort und Satz in verbundener Schrift (Kl. 2)

| ID | Schritt | Kl. | Schrift | Schwierigkeit | Bsp. | Vor. | Beleg |
|---|---|---|---|---|---|---|---|
| SW-01 | Wort abschreiben | 2 | beide | ganzes Wort aus Schreibschrift-Vorlage | Wörter aus bekannten Grup… | SV-01–08 | Q |
| SW-02 | Druck wird Schreibschrift | 2 | beide | Wort aus Druckschrift selbst übertragen | Druckvorlage → Schreibsch… | SW-01 | Q |
| SW-03 | Satz übertragen | 2 | beide | Satz mit Großbuchstaben, Wortabständen, P… | kurze Sätze | SW-02, SG-03 | Q |
| SW-04 | Ober- und Unterlängen im Wort | 2 | beide | Proportionen im Wort einhalten | Glück, jung, fallen | SW-01 | Q |
| SW-05 | Schönes Wortende | 2 | beide | Endstrich, i-Punkte und Umlautzeichen nac… | Kühe, Spiel | SW-01 | Q+E |

#### Schrift, Block H – Handschrift Kl. 3/4 (Schrift: VA/SAS bzw. eigene; auch Druck nach Zweck)

| ID | Schritt | Kl. | Schrift | Schwierigkeit | Bsp. | Vor. | Beleg |
|---|---|---|---|---|---|---|---|
| H-01 | Nur noch Mittelband | 3 | beide | Lineatur ohne Ober-/Unterlinien | Satz in Einfachlineatur | SW-04 | Q |
| H-02 | Flott und flüssig | 3 | beide | Tempo steigern ohne Leserlichkeitsverlust | Satz auf Zeit | SW-03 | Q |
| H-03 | Schriftlage und Größe | 3 | beide | gleichmäßige Neigung und Größe | Reim abschreiben | H-01 | Q |
| H-04 | Sterne unter den Besten | 3 | beide | Leserlichkeitskriterien an fremder, dann… | Mittelband, Größe, Verbin… | SW-03 | Q |
| H-05 | Meine Abkürzung | 3–4 | beide | alternative Form/Absetzstelle wählen und… | z. B. Schleifen-e statt K… | H-04 | Q |
| H-06 | Fehler sauber korrigieren | 3 | beide | durchstreichen, einfügen, überschreiben | Wort einfügen | SW-03 | Q |
| H-07 | Die richtige Schrift wählen | 4 | Druck/Schreibschrift | Schrift nach Zweck (Plakat, Formular, Hef… | Plakat in Druck, Brief in… | H-05 | Q |
| H-08 | Blatt gestalten | 4 | beide | Rand, Überschrift, Absatz, Schriftgröße | Steckbrief | H-07 | Q |

#### Texte verfassen (58 Schritte)

#### Texte verfassen – Klasse 1

| ID | Schritt | Strang | Schwierigkeit | Vor. | Spiel | Beleg |
|---|---|---|---|---|---|---|
| TV1-01 | Wozu ist der Zettel? | schreiben | Schreibzweck eines Alltagstexts erkennen | – | spielbar | Q |
| TV1-02 | Für wen schreibe ich? | schreiben | Adressaten zuordnen | TV1-01 | spielbar | Q |
| TV1-03 | Satz zum Bild | schreiben | aus Wortkärtchen einen Satz zum Bild legen | Lesen einfacher Wörter | spielbar | Q+E |
| TV1-04 | Was passt dazu? | schreiben | passenden zweiten Satz wählen (Zusammenhang) | TV1-03 | spielbar | E |
| TV1-05 | Bildergeschichte ordnen (3) | schreiben | drei Bilder in Handlungsreihenfolge | SZ1-05 | spielbar | E |
| TV1-06 | Es war einmal | schreiben | typischen Geschichtenanfang erkennen | TV1-01 | spielbar | Q |
| TV1-07 | Ich-mag-Gedicht | schreiben | Reihengedicht nach Muster mit eigenem Wort er… | TV1-03 | spielbar | Q |
| TV1-08 | Das ist schön! | schreiben | Gelungenes in einem Kindertext benennen (Ster… | – | teilweise | Q |
| TV1-09 | Fertig zum Aufhängen | schreiben | Text für Veröffentlichung gestalten (Bild, Ra… | TV1-07 | spielbar | Q |

#### Texte verfassen – Klasse 2

| ID | Schritt | Strang | Schwierigkeit | Vor. | Spiel | Beleg |
|---|---|---|---|---|---|---|
| TV2-01 | Ideenkiste | schreiben | zum Thema passende Ideen sammeln | TV1-03 | spielbar | Q |
| TV2-02 | Passt nicht! | schreiben | themenfremde Idee aussortieren | TV2-01 | spielbar | E |
| TV2-03 | Bildergeschichte ordnen (4–6) | schreiben | längere Bildfolge mit Problem und Lösung ordn… | TV1-05 | spielbar | E |
| TV2-04 | Ein Satz pro Bild | schreiben | zu jedem Bild den passenden Satzbaustein wähl… | TV2-03, TV1-03 | spielbar | E |
| TV2-05 | Nicht immer „dann“! | schreiben | abwechselnde Satzanfänge wählen | TV2-04, SZ2-11 | spielbar | E |
| TV2-06 | Anfang, Mitte, Ende | schreiben | Einleitung, Hauptteil, Schluss einer Geschich… | TV1-06 | spielbar | Q |
| TV2-07 | Ein guter Schluss | schreiben | passenden Schlusssatz wählen | TV2-06 | spielbar | Q |
| TV2-08 | Überschrift finden | schreiben | passende Überschrift wählen | TV2-06 | spielbar | E |
| TV2-09 | Von oben nach unten | schreiben | Merkmale für eine Beschreibung in sinnvolle R… | TV2-01 | spielbar | Q |
| TV2-10 | Tier-Steckbrief | schreiben | Infos den Steckbrief-Feldern zuordnen | TV2-01 | spielbar | E |
| TV2-11 | Einladung komplett? | schreiben | fehlende Info (wer, was, wann, wo) in Einladu… | TV1-01 | spielbar | E |
| TV2-12 | Liebe Oma … | schreiben | Anrede und Gruß einer Karte/eines Briefs rich… | TV1-02 | spielbar | E |
| TV2-13 | Gedicht umbauen | schreiben | Wörter in einem Mustergedicht austauschen, Re… | TV1-07 | spielbar | Q |
| TV2-14 | Hilfreicher Tipp | schreiben | konkreten Überarbeitungshinweis von vagem unt… | SZ2-16 | spielbar | Q |
| TV2-15 | Hier fehlt was | schreiben | Lücke im Handlungsablauf erkennen und fehlend… | TV2-04 | spielbar | Q |
| TV2-16 | Mein Lernsatz | schreiben | kurzen Eintrag zu einer Lernerfahrung machen… | SZ1-23 | teilweise | Q |

#### Texte verfassen – Klasse 3

| ID | Schritt | Strang | Schwierigkeit | Vor. | Spiel | Beleg |
|---|---|---|---|---|---|---|
| TV3-01 | Ideen-Baum | schreiben | Stichwörter einer Mindmap den richtigen Ästen… | TV2-01 | spielbar | Q |
| TV3-02 | Was ist erzählenswert? | schreiben | Geschichte mit besonderem Ereignis von bloßer… | TV2-06 | spielbar | Q |
| TV3-03 | Ausgangslage – Ereignis – Ausgang | schreiben | die drei Erzählteile einer neuen Geschichte z… | TV2-06 | spielbar | Q |
| TV3-04 | Wortfeld gehen | schreiben | treffendes Bewegungsverb einsetzen | Wortfeld (Grammatik Gr2-13) | spielbar | E |
| TV3-05 | Wortfeld sagen | schreiben | treffendes Redeverb einsetzen | TV3-04 | spielbar | E |
| TV3-06 | Mal es mit Wörtern | schreiben | anschauliches Adjektiv wählen | Adjektiv (Grammatik) | spielbar | E |
| TV3-07 | Wie fühlt sich Mia? | schreiben | Gefühlssatz an passender Stelle einfügen | TV3-03 | spielbar | Q |
| TV3-08 | Lass die Figur sprechen | schreiben | Sprechblase in wörtliche Rede im Text umwande… | TV3-05, Zeichensetzung wörtl. Red… | spielbar | E |
| TV3-09 | Reizwort-Geschichte | schreiben | aus drei Reizwörtern die passende Handlungsid… | TV3-03 | teilweise | E |
| TV3-10 | Was wäre, wenn …? | schreiben | Fantasie-Idee aus Figur + Ort + Problem kombi… | TV3-03 | teilweise | Q |
| TV3-11 | Elfchen | schreiben | Gedicht nach festem Wortzahlmuster (1-2-3-4-1… | TV2-13 | spielbar | E |
| TV3-12 | Sätze verbinden | schreiben | zwei Sätze mit passendem Bindewort verbinden | TV2-05 | spielbar | Q |
| TV3-13 | Bastelanleitung | schreiben | Anleitungsschritte ordnen und Material zuerst… | TV2-09 | spielbar | Q |
| TV3-14 | Tierbeschreibung | schreiben | von Gesamteindruck zu Einzelheiten ordnen | TV2-09 | spielbar | Q |
| TV3-15 | Textlupe | schreiben | Text nach einem einzigen Kriterium prüfen | TV2-05 | spielbar | Q |
| TV3-16 | Nicht schon wieder „Ben“! | schreiben | Wortwiederholung durch Pronomen/Ersatzwort er… | Pronomen (Grammatik) | spielbar | Q |
| TV3-17 | Umstellen | schreiben | Satz an die logisch richtige Stelle verschieb… | TV2-15 | spielbar | Q |
| TV3-18 | Schreibkonferenz | schreiben | zu einem Kindertext Lob + Tipp aus Vorschläge… | TV2-14 | teilweise | Q |

#### Texte verfassen – Klasse 4

| ID | Schritt | Strang | Schwierigkeit | Vor. | Spiel | Beleg |
|---|---|---|---|---|---|---|
| TV4-01 | Spannung bauen | schreiben | Höhepunkt erkennen und Tempo verlangsamen (De… | TV3-07 | spielbar | Q+E |
| TV4-02 | Plötzlich! | schreiben | Spannungswörter gezielt und sparsam setzen | TV4-01 | spielbar | Q |
| TV4-03 | Mit anderen Augen | schreiben | Ereignis aus Sicht einer anderen Figur auswäh… | TV3-08 | teilweise | Q |
| TV4-04 | Reporter-Bericht | schreiben | W-Fragen vollständig und zeitlich geordnet | TV2-11 | spielbar | Q |
| TV4-05 | Sachlich oder ausgeschmückt? | schreiben | Bericht- von Erzählsätzen unterscheiden | TV4-04, TV3-07 | spielbar | E |
| TV4-06 | Zeitreise-Regel | schreiben | Erzählzeit (Präteritum) im Text durchhalten,… | Präteritum (Grammatik) | spielbar | E |
| TV4-07 | Standpunkt, Grund, Beispiel | schreiben | Bausteine eines Meinungstexts ordnen | SZ4-06 | spielbar | Q |
| TV4-08 | Buchtipp | schreiben | Tipp mit Inhalt (ohne Ende zu verraten) und b… | TV4-07 | teilweise | Q |
| TV4-09 | Brief und E-Mail | schreiben | Teile (Betreff, Anrede, Text, Gruß) und Höfli… | TV2-12, SZ4-08 | spielbar | Q+E |
| TV4-10 | Das Wichtigste | schreiben | die wichtigsten Sätze für eine Zusammenfassun… | SZ4-05 | spielbar | Q |
| TV4-11 | Neuer Absatz! | schreiben | erkennen, wo ein neuer Abschnitt beginnt | TV3-03 | spielbar | Q |
| TV4-12 | Checkliste | schreiben | textsortenspezifische Kriterien an einem Text… | TV3-15 | spielbar | Q |
| TV4-13 | Hör dir deinen Text an | schreiben | eigenen (getippten) Entwurf vorlesen lassen u… | TV3-15, Tippen | teilweise | Q |
| TV4-14 | Mein Schreibziel | schreiben | aus Rückmeldung ein Ziel für den nächsten Tex… | TV3-18 | teilweise | Q |
| TV4-15 | Planen – Schreiben – Prüfen | schreiben | eine Schreibstrategie (Merkhilfe) selbstständ… | TV3-01, TV3-03 | teilweise | Q |

### Strang grammatik (69 Schritte)

#### Grammatik – Klasse 1

| ID | Schritt | Beispiel | Vor. | Typ | Beleg |
|---|---|---|---|---|---|
| Gr1-01 | Buchstabe, Silbe, Wort, Satz | „Ist das ein Wort oder ein Satz?“ | – | F | Q |
| Gr1-02 | Selbstlaut oder Mitlaut? | a, m, o, t | L1-24 | F | Q |
| Gr1-03 | Satz oder kein Satz? | „Der Hund schläft.“ vs. „Hund der schläft“ | Gr1-01 | F | Q |
| Gr1-04 | Namenwörter | Oma, Katze, Ball | – | F | E |
| Gr1-05 | der, die, das | der Hund, die Maus, das Auto | Gr1-04 | M | Q |
| Gr1-06 | Eins oder viele? | Ball/Bälle | Gr1-04 | F | Q |
| Gr1-07 | Tunwörter | laufen, malen | – | F | E |

#### Grammatik – Klasse 2

| ID | Schritt | Beispiel | Vor. | Typ | Beleg |
|---|---|---|---|---|---|
| Gr2-01 | Mehrzahl mit -e | Hund–Hunde, Tisch–Tische | Gr1-06 | M/R | E |
| Gr2-02 | Mehrzahl mit -(e)n | Blume–Blumen, Frau–Frauen | Gr2-01 | M/R | E |
| Gr2-03 | Mehrzahl mit -er | Kind–Kinder, Buch–Bücher | Gr2-01 | M | E |
| Gr2-04 | Mehrzahl mit -s | Auto–Autos, Oma–Omas | Gr2-01 | R | E |
| Gr2-05 | Mehrzahl mit Umlaut / ohne Endung | Apfel–Äpfel, Lehrer–Lehrer | Gr2-01 | M | E |
| Gr2-06 | Nomen-Proben | laufen? kein Artikel → kein Nomen | Gr1-05 | R | Q |
| Gr2-07 | ein, eine | ein Hund / der Hund | Gr1-05 | F | Q |
| Gr2-08 | Grundform des Verbs | er spielt → spielen | Gr1-07 | R | Q |
| Gr2-09 | Verb passt zur Person | ich male, du malst, er malt | Gr2-08 | R | Q |
| Gr2-10 | ich, du, er, sie, es … | wir spielen, ihr spielt | Gr2-09 | F | Q |
| Gr2-11 | Wiewörter | groß, rot, laut | – | F | Q |
| Gr2-12 | Nomen genauer machen | das blaue Haus, das neue blaue Haus | Gr2-11 | R | Q |
| Gr2-13 | Gegenteile | hell–dunkel, laut–leise | Gr2-11 | F | E |
| Gr2-14 | Satzarten | „Hilf mir!“ | Gr1-03 | F | Q |
| Gr2-15 | Wörter zusammensetzen | die Haustür (die Tür) | Gr1-05 | R | Q |
| Gr2-16 | Wortfamilien | fahren, Fahrrad, fahrbar | Gr2-15 | F | Q |
| Gr2-17 | Wortbausteine un-, ver-, vor- | freundlich–unfreundlich; lesen–vorlesen | Gr2-16 | F | Q |
| Gr2-18 | Wortfelder gehen/sagen | schleichen, rennen; flüstern, rufen | – | F | Q |
| Gr2-19 | Oberbegriffe | Obst: Apfel, Birne | – | F | E |
| Gr2-20 | Gestern, heute, morgen | „Gestern war ich…“ | – | F | Q |
| Gr2-21 | Adjektive steigern (regelmäßig) (Kl. 2–3) | klein–kleiner–am kleinsten | Gr2-11 | R | Q |
| Gr2-22 | Alltags- vs. Bildungssprache, Dialekt (!) | „Grüß Gott“ / „Servus“ | – | F | Q |

#### Grammatik – Klasse 3

| ID | Schritt | Beispiel | Vor. | Typ | Beleg |
|---|---|---|---|---|---|
| Gr3-01 | Gegenwart (Präsens) | ich lache | Gr2-09 | R | Q |
| Gr3-02 | Präteritum regelmäßig | spielte, lachte | Gr3-01 | R | Q |
| Gr3-03 | Präteritum unregelmäßig | ging, lief, sah, trank | Gr3-02 | M | Q |
| Gr3-04 | Perfekt mit „haben“ | hat gespielt, hat gesungen | Gr3-02 | R | E |
| Gr3-05 | Perfekt mit „sein“ | ist gelaufen, ist gewachsen | Gr3-04 | M/R | E |
| Gr3-06 | Partizip bilden | gemalt, geschrieben | Gr3-04 | M/R | E |
| Gr3-07 | Zukunft (Futur) | ich werde fliegen | Gr2-08 | R | Q |
| Gr3-08 | Zeitform erkennen | „Wir sind gerannt.“ → Perfekt | Gr3-01–07 | F | Q |
| Gr3-09 | Pronomen statt Nomen | Lea → sie | Gr2-10 | R | Q |
| Gr3-10 | Besitzanzeigende Fürwörter | mein Ball | Gr3-09 | F | E |
| Gr3-11 | Geschlecht des Nomens | der Löffel, die Gabel, das Messer | Gr1-05 | M | Q |
| Gr3-12 | Nachsilben bilden Wörter | wandern→Wanderung; Sonne→sonnig | Gr2-17 | R | Q+E |
| Gr3-13 | Vorsilben bei Verben | verlernen–erlernen, abfahren–anfahren | Gr2-17 | F | Q |
| Gr3-14 | Zusammensetzen mit Verb/Adjektiv | Schreibtisch, Rotkohl | Gr2-15 | R | Q |
| Gr3-15 | Wortfelder sehen/essen | starren, blinzeln; knabbern, schlürfen | Gr2-18 | F | Q |
| Gr3-16 | Umstellprobe | „Am Morgen / liest / Tim / ein Buch.“ | Gr1-03 | R | Q |
| Gr3-17 | Prädikat (Satzkern) | „Tim liest.“ | Gr3-16 | R | Q |
| Gr3-18 | Subjekt | „Die Katze schläft.“ | Gr3-17 | R | Q |
| Gr3-19 | Zweiteiliges Prädikat | „Sie ruft ihn an.“ „Er hat gelacht.“ | Gr3-17, Gr3-04 | R | E |
| Gr3-20 | Wörtliche Rede erkennen | Wer spricht? | L2-07 | F | Q |
| Gr3-21 | Sätze verbinden | „…, weil es regnet.“ | Gr2-14 | F | Q |
| Gr3-22 | Ersatz-, Weglass-, Erweiterungsprobe | „Der kleine Hund bellt.“ → „Er bellt.“ | Gr3-16 | R | Q |
| Gr3-23 | Verhältniswörter (Präpositionen) | auf, unter, neben, hinter | – | F | E |

#### Grammatik – Klasse 4

| ID | Schritt | Beispiel | Vor. | Typ | Beleg |
|---|---|---|---|---|---|
| Gr4-01 | Die vier Fälle | Wer? Wessen? Wem? Wen? | Gr3-18 | R | Q |
| Gr4-02 | Artikel im Fall | dem Hund, den Hund | Gr4-01 | R | Q |
| Gr4-03 | Wem-Ergänzung (Dativobjekt) | „Ich gebe dem Hund…“ | Gr4-01 | R | Q |
| Gr4-04 | Wen/Was-Ergänzung (Akkusativobjekt) | „…einen Knochen.“ | Gr4-03 | R | Q |
| Gr4-05 | Ortsangabe | im Garten, nach Hause | Gr3-16 | R | Q |
| Gr4-06 | Zeitangabe | am Montag, seit gestern | Gr3-16 | R | Q |
| Gr4-07 | Was braucht das Verb? | schlafen (wer) vs. geben (wer, wem, was) | Gr4-04 | R | Q |
| Gr4-08 | Mehrteilige Satzglieder | „Der kleine braune Hund“ | Gr3-16 | R | Q |
| Gr4-09 | Fall nach Verhältniswort | mit dem Rad, für den Opa | Gr3-23, Gr4-02 | M/R | E |
| Gr4-10 | Adjektiv im Fall | dem kleinen Hund | Gr4-02 | R | Q |
| Gr4-11 | Steigerung unregelmäßig | gut–besser–am besten, viel–mehr | Gr2-21 | M | E |
| Gr4-12 | Mehrfach zusammengesetzt | unaufmerksam, Haustürschlüssel | Gr3-12, Gr3-14 | R | Q |
| Gr4-13 | Wortart wechseln | klug→Klugheit, Freund→freundlich | Gr3-12 | R | Q |
| Gr4-14 | Stammvokalwechsel in Familien | singen–Gesang, trinken–Getränk | Gr2-16 | R | Q |
| Gr4-15 | Hauptsatz + Nebensatz | „…, weil er müde ist.“ | Gr3-21 | R | E |
| Gr4-16 | Einheitliche Zeitform im Text | Zeitform-Fehler finden | Gr3-08 | F | E |
| Gr4-17 | Woher kommt das Wort? | Pizza, Computer, Kakao | S3-33 | F | Q |

### Sprechen und Zuhören (72 Schritte; Strang `sprechen` oder Alternative, siehe Entscheidung 3)

Keine Lesefähigkeit nötig. Schwierigkeit über die VERA-Parameter steuern (Stimmen, Störgeräusch, Länge, Prominenz, Abstand der Informationen). „teilweise“ = Aufnahme, Vorbild, Selbsteinschätzung, ohne Bewertung der Aufnahme.

#### Sprechen und Zuhören – Klasse 1

| ID | Schritt | Strang | Schwierigkeit | Vor. | Spiel | Beleg |
|---|---|---|---|---|---|---|
| SZ1-01 | Psst – hörst du die Stille? | sprechen | Beginn/Ende eines Geräuschs bemerken | – | spielbar | E |
| SZ1-02 | Was klingt da? | sprechen | Alltagsgeräusch einem Bild zuordnen | SZ1-01 | spielbar | E |
| SZ1-03 | Laut oder leise? | sprechen | Lautstärke zweier Töne vergleichen | SZ1-02 | spielbar | E |
| SZ1-04 | Von wo kommt es? | sprechen | Richtung links/rechts erkennen (Kopfhörer) | SZ1-02 | spielbar | E |
| SZ1-05 | Geräuschkette (2) | sprechen | Reihenfolge von zwei Geräuschen merken | SZ1-02 | spielbar | E |
| SZ1-06 | Geräuschkette (3–4) | sprechen | drei bis vier Geräusche in Reihenfolge | SZ1-05 | spielbar | E |
| SZ1-07 | Mach, was ich sage (1 Schritt) | sprechen | eine gesprochene Anweisung ausführen | – | spielbar | Q |
| SZ1-08 | Mach, was ich sage (2 Schritte) | sprechen | zwei Anweisungen in Reihenfolge behalten | SZ1-07 | spielbar | Q+E |
| SZ1-09 | Wohin damit? | sprechen | Anweisung mit Lagewort ausführen | SZ1-07, Lagewörter (Wortschatz) | spielbar | E |
| SZ1-10 | Wer kommt vor? | sprechen | Hauptfigur einer kurzen Hörgeschichte wiedere… | SZ1-07 | spielbar | Q |
| SZ1-11 | Wo spielt es? | sprechen | Schauplatz wiedererkennen | SZ1-10 | spielbar | Q |
| SZ1-12 | Spitz die Ohren für … | sprechen | nach angesagtem Hörauftrag gezielt eine Info… | SZ1-10 | spielbar | Q |
| SZ1-13 | Wie klingt die Stimme? | sprechen | Gefühl an der Stimme erkennen (froh/traurig/w… | – | spielbar | Q |
| SZ1-14 | Noch mal, bitte! | sprechen | bei Nichtverstehen höflich nachfragen statt r… | SZ1-07 | spielbar | Q |
| SZ1-15 | Ausreden lassen | sprechen | Gesprächsregel „ausreden lassen“ in einer Sze… | – | spielbar | Q |
| SZ1-16 | Ich bin dran, du bist dran | sprechen | Regel „melden/warten, bis man dran ist“ erken… | SZ1-15 | spielbar | Q |
| SZ1-17 | Hallo, bitte, danke | sprechen | passende Höflichkeitsformel zur Situation wäh… | – | spielbar | Q |
| SZ1-18 | Tut mir leid | sprechen | passende Entschuldigung wählen | SZ1-17 | spielbar | Q |
| SZ1-19 | Erzähl mir von deinem Tag | sprechen | zu 2–3 Bildern zusammenhängend erzählen und a… | SZ1-10 | teilweise | Q |
| SZ1-20 | Hör dich selbst | sprechen | eigene Aufnahme anhören und einschätzen: vers… | SZ1-19 | teilweise | Q |
| SZ1-21 | Reim-Echo | sprechen | kurzen Reim nach Vorbild nachsprechen (Aufnah… | SZ1-20 | teilweise | Q |
| SZ1-22 | Wie fühlt sich die Figur? | sprechen | Gefühl einer Figur in einer Szene erkennen un… | SZ1-13 | spielbar | Q |
| SZ1-23 | Wie war's für mich? | sprechen | Lernerlebnis mit Smiley einschätzen | – | teilweise | Q |

#### Sprechen und Zuhören – Klasse 2

| ID | Schritt | Strang | Schwierigkeit | Vor. | Spiel | Beleg |
|---|---|---|---|---|---|---|
| SZ2-01 | Mach, was ich sage (3 Schritte) | sprechen | drei Anweisungen behalten | SZ1-08 | spielbar | E |
| SZ2-02 | Was passiert zuerst? | sprechen | Ablauf einer Hörgeschichte in Bildreihenfolge… | SZ1-06, SZ1-10 | spielbar | Q+E |
| SZ2-03 | Kleines Detail | sprechen | nur einmal nebenbei genannte Info wiedergeben | SZ1-12 | spielbar | Q |
| SZ2-04 | Warum eigentlich? | sprechen | zwei aufeinanderfolgende Infos zu einem einfa… | SZ2-03 | spielbar | Q |
| SZ2-05 | Wer hat das gesagt? | sprechen | zwei Sprecher auseinanderhalten | SZ1-10 | spielbar | Q |
| SZ2-06 | Stimmt das? | sprechen | Aussage zum Gehörten als richtig/falsch einor… | SZ2-03 | spielbar | E |
| SZ2-07 | Wort-Detektiv | sprechen | unbekanntes Wort im Hörtext bemerken und erfr… | SZ1-14 | spielbar | Q |
| SZ2-08 | Passt die Antwort? | sprechen | auf den Vorredner bezogene Antwort wählen | SZ1-15 | spielbar | Q |
| SZ2-09 | Regel-Wächter | sprechen | in einem Hördialog die gebrochene Gesprächsre… | SZ1-16 | spielbar | Q |
| SZ2-10 | Ich fühle mich … | sprechen | Ich-Botschaft statt Vorwurf wählen | SZ1-22 | spielbar | E |
| SZ2-11 | Erst, dann, zum Schluss | sprechen | beim mündlichen Erzählen Reihenfolgewörter st… | SZ1-19 | spielbar | E |
| SZ2-12 | Nacherzählen | sprechen | kurze Hörgeschichte mit Bildstütze nacherzähl… | SZ2-02 | teilweise | Q |
| SZ2-13 | Ich beschreib's dir | sprechen | nach mündlicher Beschreibung das richtige Din… | SZ1-12 | spielbar | Q |
| SZ2-14 | Betonen und Pause machen | sprechen | erkennen, welche von zwei Aufnahmen mit Pause… | SZ1-20 | spielbar | Q |
| SZ2-15 | Gedicht-Bühne | sprechen | kurzes Gedicht auswendig vortragen und aufneh… | SZ1-21 | teilweise | Q |
| SZ2-16 | Stern und Tipp | sprechen | wertschätzendes und konkretes Feedback von un… | SZ2-08 | spielbar | Q |
| SZ2-17 | Riesenstimme, Mäusestimme | sprechen | Stimme passend zur Figur verstellen und aufne… | SZ1-22 | teilweise | Q |
| SZ2-18 | Ich glaube, dass … | sprechen | Vermutung mit Satzmuster äußern | – | teilweise | Q |

#### Sprechen und Zuhören – Klasse 3

| ID | Schritt | Strang | Schwierigkeit | Vor. | Spiel | Beleg |
|---|---|---|---|---|---|---|
| SZ3-01 | Meine Hörfrage | sprechen | vor dem Hören selbst eine passende Frage ausw… | SZ1-12 | spielbar | Q |
| SZ3-02 | Schlüsselwort fangen | sprechen | während des Hörens wichtige Wörter antippen (… | SZ3-01, Lesen einfacher Wörter | spielbar | Q |
| SZ3-03 | Puzzle im Ohr | sprechen | weit auseinanderliegende Infos verknüpfen | SZ2-04 | spielbar | Q |
| SZ3-04 | Trotz Lärm verstehen | sprechen | Hörtext mit Hintergrundgeräusch (Pausenhof) v… | SZ2-03 | spielbar | Q |
| SZ3-05 | Warum tut sie das? | sprechen | Motiv/Gefühl einer Figur aus dem Gehörten deu… | SZ3-03 | spielbar | Q |
| SZ3-06 | Worum geht's? | sprechen | Kerngedanke eines Sachhörtexts wählen | SZ3-02 | spielbar | Q |
| SZ3-07 | Warum versteh ich nichts? | sprechen | Grund für Nichtverstehen benennen | SZ2-07 | spielbar | Q |
| SZ3-08 | Anfang, Mitte, Schluss | sprechen | Teile eines kurzen Vortrags in sinnvolle Reih… | SZ2-11 | spielbar | Q |
| SZ3-09 | Mein Stichwortzettel | sprechen | mit drei Bildstichwörtern einen Kurzvortrag h… | SZ3-08 | teilweise | Q |
| SZ3-10 | Tempo und Lautstärke | sprechen | eigene Aufnahme mit Vorbild vergleichen und T… | SZ2-14 | teilweise | Q |
| SZ3-11 | Trösten und gratulieren | sprechen | passende Worte für Alltagssituation wählen | SZ1-18 | spielbar | Q |
| SZ3-12 | Daran knüpf ich an | sprechen | Beitrag wählen, der an Vorredner anknüpft | SZ2-08 | spielbar | Q |
| SZ3-13 | Reporter-Fragen | sprechen | passende W-Fragen für ein Interview auswählen | SZ3-01 | spielbar | Q |
| SZ3-14 | Hörspiel-Werkstatt | sprechen | passende Geräusche/Musik für eine Szene auswä… | SZ1-02 | spielbar | Q |
| SZ3-15 | Ich bin nicht der Wolf | sprechen | Rolle und eigene Person unterscheiden (Figur… | SZ2-17 | teilweise | Q |
| SZ3-16 | So hab ich's gelernt | sprechen | Lernweg mit Satzmuster beschreiben | SZ2-18 | teilweise | Q |

#### Sprechen und Zuhören – Klasse 4

| ID | Schritt | Strang | Schwierigkeit | Vor. | Spiel | Beleg |
|---|---|---|---|---|---|---|
| SZ4-01 | Viele Stimmen | sprechen | längeren Hörtext mit 3+ Sprechern verstehen,… | SZ3-03, SZ2-05 | spielbar | Q |
| SZ4-02 | Stimmt die Aussage – und warum? | sprechen | Aussage über Hörtext beurteilen und passende… | SZ4-01 | spielbar | Q |
| SZ4-03 | Zwei Geschichten, ein Vergleich | sprechen | Gemeinsamkeit/Unterschied zweier Hörgeschicht… | SZ4-01 | spielbar | Q |
| SZ4-04 | Ratekrimi | sprechen | Widerspruch in Aussagen entdecken | SZ3-03 | spielbar | Q |
| SZ4-05 | Kurz gesagt | sprechen | beste Zusammenfassung eines Hörtexts wählen | SZ3-06 | spielbar | Q |
| SZ4-06 | Ich finde …, weil … | sprechen | Meinung mit Grund und Beispiel äußern | SZ3-12 | teilweise | Q |
| SZ4-07 | Bitte überzeugend | sprechen | die überzeugendste Bitte wählen (Grund + höfl… | SZ4-06 | spielbar | Q |
| SZ4-08 | Mit wem rede ich? | sprechen | Sprachregister je Adressat wählen | SZ1-17 | spielbar | Q |
| SZ4-09 | Mein Kurzreferat | sprechen | 1–2-Minuten-Vortrag mit Gliederung, aufnehmen… | SZ3-09 | teilweise | Q |
| SZ4-10 | Jury-Ohr | sprechen | einen Beispielvortrag mit Kriterien bewerten… | SZ2-16 | spielbar | Q |
| SZ4-11 | Gesprächsrollen | sprechen | Aufgaben von Gesprächsleitung/Zeitwächter erk… | SZ2-09 | spielbar | Q |
| SZ4-12 | Videoanruf-Regeln | sprechen | Regeln für digitales Sprechen erkennen | SZ2-09 | spielbar | Q |
| SZ4-13 | Szenische Lesung | sprechen | eine Rolle im Dialog passend sprechen, App sp… | SZ3-15 | teilweise | Q |
| SZ4-14 | Mein Ziel | sprechen | Lernziel setzen und nach einer Woche prüfen | SZ3-16 | teilweise | Q |
| SZ4-15 | Was hat mir beim Zuhören geholfen? | sprechen | eigene Zuhörstrategie reflektieren | SZ3-01, SZ3-02 | teilweise | Q |

## Offene Entscheidungen vor dem Befüllen der lernplan.json

Diese Fragen kann nur Christian entscheiden. Die Empfehlung ist jeweils die Option, die am besten zu Leitbild und Evidenz passt.

| # | Frage | Optionen | Empfehlung und Grund |
|---|---|---|---|
| 1 | **Wie weit über Klasse 2 hinaus soll der Plan jetzt reichen?** | (a) nur Kl. 1–2 (≈ 590 Schritte); (b) Kl. 1–2 voll, Kl. 3–4 nur als unsichtbare Stub-Themen ohne Einführung; (c) Kl. 1–4 voll | **(b).** Spiele gibt es bisher fast nur für Kl. 1–2 Mathe. Unsichtbare Stubs halten aber IDs und Voraussetzungen stabil, wenn später Spiele für Kl. 3–4 dazukommen. Nach der Entwurfsregel gilt eine Voraussetzung ohne Spiel als erfüllt; die Stubs blockieren also nichts. |
| 2 | **Bayern oder KMK als Umfang?** Betrifft schriftliche Division (BY Pflicht, KMK nicht), Abzieh- statt Ergänzungsverfahren, Division mit Rest schon in Kl. 2 | (a) Bayern verbindlich; (b) KMK-Kern, Bayern-Schritte als Zusatz markiert; (c) Verfahren je Kind wählbar | **(b) mit Bayern als Voreinstellung.** Ein Feld `land: "BY"` an M4-21 bis M4-26 und M3-34 bis M3-38 hält den Plan für andere Länder offen. Abzieh- und Ergänzungsverfahren widersprechen sich in der Notation; deshalb nur eines je Kind. |
| 3 | **Eigener Strang `sprechen` für Sprechen und Zuhören?** | (a) neuer Strang `sprechen` (Zuhören, Erzählen, Gespräche, Vortragen, Spielen); (b) nur die Hörverstehens-Schritte unter `lesen` als „Hörverstehen“, Sprech- und Gesprächsschritte weglassen; (c) vorerst ganz weglassen | **(a) empfehlen die Notizen.** KMK und Bayern führen den Bereich eigenständig, VERA hat ein eigenes Stufenmodell, die Schritte brauchen keine Lesefähigkeit und eine andere Interaktion (Audio, Aufnahme). Bei (b) entstünden künstliche Abhängigkeiten zu Lese-Schritten. Diese Entscheidung ist noch nicht getroffen; der Entwurf kennt bisher nur fünf Stränge. |
| 4 | **Schnitt Kl. 1 Plus/Minus: nach Ergebnis oder nach Aufgabentyp?** | (a) nur „Rechnen mit der n“ wie im Entwurf; (b) nur Aufgabentypen nach DZLM (M1-26 bis M1-44); (c) beides: Zahl-Familien für die Zahlenzauber-Schlüssel plus Strategie-Themen (Verdoppeln, Ergebnis 10, Minus von 10, Tausch, Umkehr) | **(c).** Die Strategie-Themen sind die Brücke vom Zählen zum Ableiten, die die Forschung als entscheidend sieht. Die Zahl-Familien sichern die verlustfreie Übernahme der vorhandenen Fakten. Zu klären ist nur, dass eine Aufgabe wie `plus:4+4` zu beiden Themen gehören kann. Der Entwurf verbietet „zählt auch für“ bisher nur zwischen Aufgaben*arten*. |
| 5 | **Zehnerübergang: ein Weg oder mehrere?** | (a) fester Weg „erst zur 10“ nach erster Zahl 9, 8, 7 …; (b) Teilschritt-Folge als Angebot, Fast-Verdoppeln und Fünfertrick gleichwertig (M1-57 bis M1-64) | **(b).** Die DZLM-Autoren nennen den festen Weg einen „Kunstfehler“. Die Sortierung nach erster Zahl aus Hallo bleibt als Planreihenfolge erhalten. |
| 6 | **Beherrschungskriterium** | (a) wie im Entwurf: jede Aufgabe einmal auf `kopf` ohne Hilfe richtig = „kann ich“; (b) zusätzlich ein Zustand „sitzt“ nach bestandener Wiedervorlage ab Fach 3 (≥ 7 Tage), der Abruf-Nachfolger freigibt; (c) N richtige in Folge (3 oder 5) | **(b).** „Kann ich“ öffnet Einführungs-Nachfolger, „sitzt“ öffnet Abruf-Themen (Blitzrechnen, Einmaleins gemischt). Die Schwellen (4 von 5 für den Aufstieg, 3 in Folge, Fach 3) als Parameter führen und anonymisiert auswerten, weil keine dieser Zahlen an Grundschulkindern validiert ist. |
| 7 | **Wortartensymbole und -farben** | (a) Montessori-Kern: Nomen schwarzes Dreieck, Artikel kleines hellblaues Dreieck, Adjektiv dunkelblaues Dreieck [FW], Verb roter Kreis, Pronomen lila Dreieck; (b) Farben, die in bayerischen Sprachbüchern üblich sind (nicht recherchiert); (c) eigene Einhorn-Symbole | **(a) für die vier Wortarten aus Kl. 1–2.** Sie sind belegt und mit Schulmaterial am ehesten verträglich. Präposition, Konjunktion und Interjektion offen lassen, bis ein Spiel sie braucht. Einen Elternhinweis vorsehen, weil Schulen abweichen. |
| 8 | **Buchstabenreihenfolge im Erstlesen** | (a) Kompromiss der Karte (M, A, I, O, L, S, R, U, E, N, F, T …); (b) Fibel der Schule des Kindes übernehmen (Eltern wählen); (c) ANTON-artig (L, O, A, M, I …) | **(a) als Standard, (b) später als Elternoption.** Kinder lernen parallel mit ihrer Schulfibel. Wird ein Buchstabe in der App vor der Schule eingeführt, schadet das nicht; die Probe überspringt dann Bekanntes. |
| 9 | **Wie streng gilt „Regel vor Merkwort“?** Betrifft ß (Regel lang + stimmlos oder Merkstelle), Dehnungs-h, v, i ohne ie | (a) Merkwort-Themen immer erst nach dem Regel-Thema; (b) häufige Merkwörter (und, ist, ich, vom) schon in Kl. 1 als Blitzwörter | **(a) für Rechtschreibung, (b) für Lesen.** Blitzwörter (L1-72, S1-31) sind Sichtwortschatz, keine Rechtschreibregel. Bei ß beide Typen anbieten, wie die Notizen vorschlagen; die Schulen unterrichten es unterschiedlich. |
| 10 | **Perfekt, das/dass, Komma im Satzgefüge, Nominalisierung** | (a) weglassen, weil nicht KMK- bzw. LP34-verbindlich; (b) als markierter „Bonus“ in Kl. 4 | **(b), niedrige Priorität.** Perfekt ist mündlich allgegenwärtig und in Sprachbüchern ab Kl. 3 üblich (nicht verifiziert). Die übrigen Themen sind eher Stoff der Klasse 5. |
| 11 | **Nicht prüfbare Teile** (freies Erzählen, eigene Texte, frei begründen, Vortrag, Stifthaltung, Lesetagebuch) | (a) als unsichtbare Themen aufnehmen; (b) nur als Elternanregung am prüfbaren Nachbarthema; (c) ganz weglassen | **(b).** Das entspricht der Grenze, die die Montessori-Notizen selbst ziehen: Die App ersetzt Gegenüber, Papier und Hand nicht und sollte das offen sagen. Aufnahme und Wiederhören bleiben als Werkzeug, ohne Bewertung. |
| 12 | **Schriftpfad für die verbundene Schrift** | (a) nur VA; (b) VA und SAS wählbar; (c) VA, SAS und „teilverbunden“ (FlowBY-Weg) wählbar | **(c), Voreinstellung offen bis zur Elternwahl.** Bayern erlaubt VA und SAS, die Schule entscheidet. FlowBY könnte 2026/27 den teilverbundenen Weg zulassen. Bei „teilverbunden“ entfallen die Blöcke SB, SV und SG. |
| 13 | **Wo beginnt die Schrift im Plan?** | (a) Druckschrift-Block parallel zu den Buchstaben im Lesestrang; (b) erst nach dem Lesestrang | **(a).** Buchstabe im Schreibstrang frei, sobald er im Lesestrang bekannt ist; Reihenfolge der Übungen nach Bewegungsgruppe [E]. Verbundene Schrift erst, wenn alle Druck-Kleinbuchstaben und die meisten Großbuchstaben sitzen. |
| 14 | **Stift oder Finger?** | (a) Finger; (b) Stift ab Klasse 1, Finger in den ersten Runden; (c) nur Stift | **(b).** Die Notizen empfehlen Stift für Haltung und Übertrag aufs Papier; eine Vorschulstudie fand mit dem Finger bessere Ergebnisse. Die Befunde widersprechen sich, Papier-Üben als Elternhinweis ergänzen. |

**Bewusst nicht aufgenommen** (von Christian bestätigt): Vorschul-Grundlagen über das hinaus, was schon in den Notizen steht; römische Zahlen; Teilbarkeitsregeln; Rechnen mit Kommazahlen (die Kommaschreibweise bei Geld und Längen, M3-42 und M3-43, bleibt als Größen-Thema drin); Zahlen über die Million.

**Was vor der Übernahme noch zu prüfen ist.** Die mit [FW] markierten Montessori-Angaben (Alter, Phonogrammliste, Wortlaut der Dreistufenlektion, Farben über Nomen und Verb hinaus) gegen ein deutsches Ausbildungsalbum. Die [L]-Studien kurz am Original, bevor sie in Produkt- oder Elterntexten zitiert werden. Die mit ★ markierten Stolpersteine (Null, Zahlendreher, Entbündeln über Null, Signalwörter, b/d/p/q) gegen eine Primärquelle wie Schipper oder Padberg/Benz. Die Klassenzuordnung 3 und 4 gegen einen bayerischen Stoffverteilungsplan (Zahlenbuch Bayern, Denken und Rechnen Bayern). Für den Schrifterwerb die amtlichen Richtformen (Startpunkte, Strichfolgen) samt Lizenzfrage und die ersten FlowBY-Ergebnisse. Und alle Beispielwörter fachlich auf Silbengrenzen und Wortart.
