> Teil des Spielkatalogs (`docs/spielkatalog.md`). **Die Entscheidungen im Hauptdokument gehen vor**: Sie beantworten die
> offenen Fragen am Ende dieser Datei (u. a. alle Spiele bleiben getrennt, Kontrollkarte, Stimmen, Sachwelt je Spiel).
> Heimatwelt und Geschichte je Spiel (Zeilen „Heimatwelt“ bis „Abenteuer“) sind am 2026-11-14 aus
> [`welten.md`](welten.md) übernommen und gelten. Jedes Spiel hat alle drei Stufen; Stellen in den Überblicken, die noch
> „ruhig fest“ nennen, sind überholt. Beispiele für Szenen in den Zeilen Handlung, Figuren und Mach mit, die nicht zur
> Heimatwelt passen, sind ebenfalls überholt (Hauptdokument 8a).

# Spielkatalog Geometrie (Kl. 1–4)

Stand 2026-11-14 · Entwurf von Claude · Eingabe `themen-geometrie.md` (64 Themen) · Kürzel R (Raum)

## 1. Überblick

- **20 Spiele** (R01–R20). Jedes hat einen **Mach-mit-Moment** (Punkt 13): Ein Kind der Runde tut es mit
  echtem Material vor, der Erzähler lädt ein, am Rundenende oder in der Pause, nie Bedingung, kein Beleg.
  Die beiden Handwerks-Themen zeichnen-mit-lineal und kreise-zirkel haben ihr Hauptspiel in R11 mit dem
  Teil, den die App prüfen kann (Lineal durch zwei Punkte legen, Zirkel auf den Radius einstellen und in den
  Mittelpunkt setzen); das ruhige Festhalten ist Mach-mit. „Gekonnt“ heißt dort: der prüfbare Teil sitzt.
- **Grundgedanke des Schnitts:** Geometrie hat viele echte Einzelhandlungen mit je eigenem Material
  (Montessori trennt Formenkommode, Körper, Stäbe, Konstruktionsdreiecke, Würfel). Geschnitten wurde nach
  der Handlung: hinlegen nach Ortsangabe, Weg lesen, Weg legen, sortieren, benennen, lückenlos durchzählen,
  Umriss füllen, mit Einheiten auslegen, Rand abzäunen, spannen, Werkzeug anlegen, nachbauen, von oben
  eintragen, Ansicht finden, falten, ins Gitter übertragen, Planquadrat, Muster, Netz falten, rollen lassen.
  Dieselbe Handlung trägt die Themen über die Klassen (z. B. R16: abzeichnen Kl. 1 → spiegeln Kl. 2 →
  vergrößern Kl. 4).
- **Größe:** 20 statt der genannten 10–14. Begründung: Wo zwei Handlungen sich nur ähneln (Weg lesen und
  Weg legen, Fläche auslegen und Rand abzäunen), wurden sie nach der Leitregel getrennt. Wer weniger will:
  Abschnitt 4, Frage 1 nennt fünf vertretbare Zusammenlegungen (→ 15).
- **Was der Nachtrag geändert hat:** (1) Nur Tippen und Ziehen (`bedienung.md` §5): Drehen von Teilen und
  Drehen eines Körpers brauchen neue Bedienteile (Drehgriff am Teil, Drehpfeile am Körper). Das ist in R06,
  R07, R10, R11, R12, R14, R19 markiert. Freies Zeichnen wurde überall durch „Punkt antippen, dann Punkt
  antippen“ ersetzt (R11, R15, R16). (2) `grundsaetze-bilder.md` §4 hat **keine Geometrie-Lernzeichen**.
  Alle Spiele brauchen einen neuen, kleinen Satz (Formplättchen, Kästchengitter, Stäbe und Kugeln,
  Holzwürfel, Punktgitter, Pfeilkarten, Werkzeuge); das ist eine offene Frage (4). (3) Das Regal kennt nur
  Perlenstab, Wortart, Kärtchen: für Geometrie schlage ich einen Baustein `form` vor (die Form oder der
  Körper selbst, flach). (4) Stimme aus festen Aufnahmen: R01 und R02 brauchen viele Satzvarianten und
  wurden deshalb auf feste Satzbausteine zugeschnitten. (5) Die Fehlerbilder `form-nach-lage`,
  `flaeche-umfang-verwechselt`, `lineal-ab-eins` haben ein Zuhause (R04, R09, R11); weitere typische
  Geometrie-Fehler habe ich als **Vorschlag** benannt (nicht im Lernplan). (6) Wegen „Nichts ist
  Selbstzweck“ hat jedes Spiel einen Zweck in der Welt (Bestellung, Zaun, Post, Bauplan für Ela …).
  (7) Keine Spracheingabe, keine Kamera nötig. (8) Punkt 13: Alle Elternansicht-Vorschläge sind durch
  `Mach mit:`-Zeilen ersetzt, die Sammelstelle R-E ist aufgelöst (beide Themen → R11). Der Mach-mit-Satz
  des Erzählers ist eine feste Aufnahme je Spiel (wenig Aufwand).
- **Unsicher:** (a) R19 nimmt Würfel kippen mit ins Netz-Spiel (Abrollen ergibt ein Netz), das ist die
  knappste Passung. (b) R01 und das Sprechen-Thema SZ1-09 „Wohin damit?“ sind dieselbe Handlung. (c) Ob 3D
  am Tablet (R12, R14) für Kl. 2 trägt oder echte Würfel klar besser sind.
- **Prüfung:** Skript (python, siehe Ende) gegen `themen-geometrie.md`: 64 von 64 IDs genau einmal als
  Hauptthema, keine fremde ID, alle IDs unter „weitere“ gehören zur Eingabe. Ergebnis: **OK**.

Allgemein für alle Spiele (nicht je Eintrag wiederholt): Fachrahmen Geometrie (Flieder) nur in der
Kopfleiste, nie als Fläche im Lernfeld; Lernfeld auf Papier, Vorrat auf dem Ahorn-Tablett; Hilfe-Leiter
Probe → Lösung zum Selbstausführen; Fehler setzen nichts zurück; Rückmelde-Bewegung bei Unpassendem
schlicht und kürzer als die Folge einer passenden Antwort (N7, B5). Stimmung: Die Stufen ruhig / sanft /
abenteuer passen das Spiel an und filtern keine Spiele; jedes Spiel ist auf jeder Stufe spielbar. „ruhig fest“
heißt: das Spiel sieht auf allen Stufen gleich aus. Bei „anpassbar“ ändern sich nur Bogen und Szene, nie die
Lernhandlung (15 von 20 Spielen sind ruhig fest, 5 anpassbar: R01, R02, R03, R07, R17, weil Ordnen, Falten und Messen keinen Bogen tragen, ohne
dass er aufgesetzt wirkt). Mach mit: am Rundenende oder in der Pause, nach `<ls-pause>`
nichts Neues, kein Haken, kein Nachfragen; wo Schere, Zirkel oder Einkauf nötig sind: „Frag jemanden, ob ihr
zusammen …“. Kl. 3–4-Themen haben im Lernplan keine
Stufen; die Stufen in den Einträgen gelten für die Kl.-1–2-Themen.

---------------------------------------------------------------------------------------------------
## 2. Die Spiele

### R01 Hinlegen, wo es hingehört (Lagewörter)
- Name fürs Kind: „Oben und unten“ · Symbol: Regal mit einem Ball oben und einem Schuh unten, flach
- Handlung: Das Kind legt ein Ding dorthin, wo der Erzähler sagt („Die Mütze liegt oben im Schrank.“), oder
  tippt das Ding an, das an dem genannten Ort ist · Wirkung: Ein Kind der Runde findet die Sache und kann
  losziehen (Mütze auf, Schlüssel in der Hand, Stiefel an).
- Material und Stufen: Szene als Lernfeld mit wenigen Bezugsdingen (Schrank, Tisch, Haus, Baum).
  material: Ding ziehen und hinlegen, alles sichtbar · vorstellung: Szene wird kurz gezeigt, dann deckt ein
  Tuch sie zu; das Kind tippt den Ort auf dem Tuch-Umriss an („Wo lag die Mütze?“) · kopf: das Kind wählt
  selbst die Lagewort-Karte, damit Ela das Versteckte findet (Karten: oben, unten, vor, hinter, neben,
  zwischen, über, unter, auf, links, rechts).
- Fehlerkontrolle: Das Kind der Runde schaut genau dort nach, wo das Ding liegt. Liegt es woanders, greift
  es ins Leere und sieht sich um; der Erzähler benennt den tatsächlichen Ort („Die Mütze liegt unter dem
  Schrank.“).
- Hauptthemen: oben-unten-vorne-hinten, links-und-rechts, neben-zwischen-ueber-unter-auf (Kl. 1)
- Weitere Zugänge: keine aus Geometrie (siehe Fachübergreifend)
- Warum perfekt: Der Zweck der Themen („etwas finden, wenn jemand sagt …“) ist wörtlich die Spielhandlung.
  Reihenfolge nach Voraussetzungen: oben/unten/vorne/hinten → links/rechts und neben/zwischen.
- Bewusst nicht drin: planquadrate → R17 (Ortsangabe im Gitter ist anderes Material); „Heb die rechte
  Hand“ → Mach mit (Körper, nicht Bildschirm).
- Heimatwelt: Ich habe mich verlaufen – wen frage ich? (`verlaufen`)
  - Sachgrund: Wer sagen kann, wo etwas ist (neben, hinter, vor), findet sich und andere wieder. Vor einem Ausflug macht man einen Treffpunkt aus; wer jemanden nicht findet, bleibt stehen und fragt an der Kasse oder Eltern mit Kindern.
  - Rahmen: Reise · Spannung aus: Rätsel
  - Ruhig: Vor dem Ausflug in den Zoo macht die Runde einen Treffpunkt aus: „neben dem Brunnen, vor dem Kiosk“. Das Kind legt die Dinge im Plan dorthin, wo der Erzähler sagt; dann wissen alle, wo man sich trifft. (Auf keiner Stufe geht ein Kind verloren.)
  - Sanft: Lenas Mütze ist weg. Sie beschreibt der Frau an der Kasse, wo sie zuletzt saß („auf der Bank hinter dem Karussell“). Dort liegt sie.
  - Abenteuer: Zoo-Rallye über mehrere Runden, immer zu zweit und mit Treffpunkt: Die Hinweise sind Lagewörter („unter der Brücke, zwischen den Bambusstäben“). Am Ziel hängt etwas hinter der Scheibe und rührt sich nicht: ein Faultier.
- Gesten: Ziehen (Ding hinlegen) mit Tipp-Alternative, Tippen (Ort, Lagewort-Karte). Nichts Neues.
- Lernzeichen: keine Mathe-Zeichen; neu: **Lagewort-Karten** (Papier, Wort in Andika, kleines Lagebild aus
  Würfel und Strich). Bezugsdinge sind Wortbilder (stilisiert).
- Stimme: **viel Varianten** (Ding × Lagewort × Bezugsding). Deshalb fester Baukasten in Daten: etwa 8
  Dinge, 6 Bezugsdinge, 11 Lagewörter, Satzschablone „Die … liegt … dem …“ mit allen Belegungen vorab
  erzeugt (Fälle beachten: auf dem / auf den). Aufwand Aufnahmen hoch.
- Fehlerbilder: keins im Lernplan. Vorschlag: `links-rechts-gegenueber` (bei einer Figur, die das Kind
  ansieht, wird links und rechts aus eigener Sicht genommen). Das Spiel kann es gezielt zeigen: Kofi steht
  mit dem Gesicht zum Kind, seine rechte Hand ist auf der linken Bildseite.
- Figuren: Ein Kind sucht, eines zeigt beim ersten Mal vor (L5: legt langsam, zögert bei „zwischen“).
  Bei unpassendem Ort wundert sich das suchende Kind, nie traurig. Fähigkeit: keine nötig; im Abenteuer
  optional **schrumpfen** (Lupenmütze), um unter den Schrank zu schauen.
- Regal-Material: Lagewort-Karte („unter“ mit Lagebild) statt Buchstabenkärtchen.
- Fachübergreifend: Sprechen/Zuhören **SZ1-09 auftrag-mit-lagewort „Wohin damit?“** ist dieselbe Handlung
  (Stufe kopf). Empfehlung: ein Spiel, Lesen-Sprechen nimmt R01 als Haupt- oder Nebenzugang. Grammatik
  später: Präpositionen mit Fall (Kl. 3–4).
- Mach mit: Am Rundenende versteckt Lena ihre Mütze im echten Zimmer der Szene und sagt mit Händen, wo (zeigt
  unter den Tisch). Erzähler: „Versteck etwas bei dir zu Hause. Frag jemanden, ob ihr zusammen sucht: Es liegt
  unter … oder neben …“ Für links und rechts: „Welcher Schuh kommt zuerst? Der rechte.“

### R02 Dem Weg folgen
- Name fürs Kind: „Pfeilweg“ · Symbol: drei Pfeile hintereinander, der letzte zeigt auf ein Haus
- Handlung: Das Kind liest eine Pfeilkette (später eine Wegbeschreibung im Ortsplan) und tippt vorher das
  Feld an, auf dem der Weg endet · Wirkung: Danach geht ein Kind der Runde den Weg wirklich und bringt
  etwas ans Ziel (Brief zur Freundin, Futter zum Gehege).
- Material und Stufen: Kästchengitter mit Start und Pfeilkarten. material: das Kind zieht eine Spielfigur
  Feld für Feld den Pfeilen nach (jeder benutzte Pfeil wird blass) · vorstellung: Pfeile stehen da, das
  Kind tippt nur das Zielfeld an (L2: erst festlegen), dann geht die Figur · kopf: Pfeile als Zahl und
  Richtung („3 nach rechts, 1 nach oben“), Gitter ohne Zwischenmarken. Kl. 3: Ortsplan mit Straßen, Weg
  in Worten aus Sicht des Gehenden („an der zweiten Kreuzung rechts“).
- Fehlerkontrolle: Die Figur geht den Weg genau und bleibt auf dem echten Endfeld stehen; das getippte Feld
  ist sichtbar daneben. Der Erzähler: „Der Weg endet hier, beim Brunnen.“
- Hauptthemen: wege-nach-pfeilen (Kl. 1), ortsplan-orientieren (Kl. 3)
- Weitere Zugänge: weg-beschreiben (R03 als Umkehrung), planquadrate (R17)
- Warum perfekt: Einer Beschreibung folgen und vorher wissen, wo man ankommt, ist die Schatzkarten-Handlung
  selbst. Im Ortsplan kommt das Drehen der Sicht dazu, die eigentliche Schwierigkeit von Kl. 3.
- Bewusst nicht drin: weg-beschreiben → R03 (selbst legen ist eine andere Handlung); nachzeichnen-im-gitter
  → R16.
- Heimatwelt: Sicher über die Straße, Helm beim Rad (`sicher-ueber-die-strasse`)
  - Sachgrund: Der sichere Weg führt über Ampel und Zebrastreifen; Pfeilwegen folgen.
  - Sache wächst mit: Kl. 1: der sichere Weg über Ampel und Zebrastreifen. Kl. 3: Wege im Ortsplan beschreiben, Radwege und Regeln für das Rad.
  - Rahmen: Reise · Spannung aus: Durcheinander
  - Ruhig: Ein Brief für die Nachbarin. Das Kind liest die Pfeilkette und tippt vorher, wo der Weg endet; dann geht Ela ihn über Ampel und Zebrastreifen.
  - Sanft: Eine Baustelle versperrt den Gehweg. Die neue Pfeilkette führt über die Ampel. Wo kommt sie an?
  - Abenteuer: Schulweg-Karte über mehrere Runden: Die Runde probiert Wege für die neuen Erstklässler aus und markiert den sichersten. An einer Ecke steht jeden Morgen jemand in Gelb: der Schülerlotse. Am Ende steht er mit auf dem Plan.
- Gesten: Ziehen (Figur) mit Tipp-Alternative, Tippen (Zielfeld). Nichts Neues.
- Lernzeichen: neu: **Kästchengitter** (Papier, Linie `#E4DEF0`) und **Pfeilkarten** (Tinte auf Papier);
  Ortsplan als schlichter Plan, Straßennamen gesetzt, nicht im Bild.
- Stimme: mittel. Feste Bausteine „… nach rechts / links / oben / unten“ mit Zahlen 1–5; Ortsplan-Sätze je
  Plan vorab. Zahlen dürfen in Aufnahmen stehen.
- Fehlerbilder: Vorschlag `pfeil-ausgelassen` (Endfeld liegt genau einen Pfeil daneben) und
  `drehung-vergessen` (im Ortsplan links/rechts aus Bildsicht statt aus Sicht des Gehenden).
- Figuren: Ein Kind geht den Weg (abwechselnd, auch Timo im Rollstuhl, der Weg ist befahrbar), ein anderes
  zeigt beim ersten Mal vor und zählt halblaut als Geräusch mit Fingern. Endet der Weg woanders, staunt das
  Kind und schaut sich um. Fähigkeit: Kl. 3 optional **fliegen** (Schirm), um den Ortsplan von oben zu
  sehen, bevor man geht.
- Regal-Material: Pfeilkarte.
- Fachübergreifend: Mathe Kl. 4 algorithmus-befolgen [WZ4-01] ist verwandt (Vorschrift befolgen), nicht
  gleich.
- Mach mit: Kofi legt Pfeile aus Papier durch einen Flur und geht sie ab. Erzähler: „Leg Pfeile aus Papier.
  Frag jemanden, ob ihr zusammen geht: Sag vorher, wo ihr ankommt.“

### R03 Den Weg legen
- Name fürs Kind: „Weg legen“ · Symbol: Murmel vor einer Reihe leerer Pfeilfelder
- Handlung: Das Kind legt Pfeilkarten in eine Leiste, damit eine Murmel (oder ein Kind der Runde) vom Start
  zum Ziel kommt; später findet es in einer fertigen Beschreibung den Schritt, der nicht stimmt, und
  tauscht ihn · Wirkung: Die Murmel rollt nach den Pfeilen los und kommt an; ein Freund findet das Haus.
- Material und Stufen: Kästchengitter, Pfeilkarten, Leiste mit Plätzen. material: Pfeile einzeln legen,
  nach jedem Pfeil darf die Murmel einen Schritt probieren · vorstellung: ganze Kette legen, dann erst
  „Los“ · kopf: Kette als Zahl und Richtung, weniger Plätze („2 nach rechts, _, dann bist du da“).
  Kl. 3: Eine Beschreibung hat Lena falsch verstanden; das Kind sieht ihren Weg und die Beschreibung und
  tauscht die Karte, an der es auseinanderlief.
- Fehlerkontrolle: Die Murmel führt genau die gelegten Pfeile aus und stößt an die Hecke oder rollt am Ziel
  vorbei. Sichtbar bleibt, ab welchem Pfeil sie vom Weg abkam.
- Hauptthemen: weg-beschreiben (Kl. 1), missverstaendnis-aufklaeren (Kl. 3)
- Weitere Zugänge: wege-nach-pfeilen (R02 Hauptspiel), bauplan-diktieren (R13 Hauptspiel)
- Warum perfekt: „So genau beschreiben, dass ein anderer es findet“ prüft sich nur, indem der andere es
  ausführt. Die Murmel ist der andere. Missverständnis aufklären ist dieselbe Handlung rückwärts.
- Bewusst nicht drin: ortsplan-orientieren → R02.
- Heimatwelt: Was rollt? Murmelbahn und Fahrzeuge (`was-rollt`)
  - Sachgrund: Kugeln und Zylinder rollen; eine Murmelbahn braucht einen gelegten Weg.
  - Sache wächst mit: Kl. 1: Was rollt, kommt an. Kl. 3: Gefälle, Schwung und Kurven; Wegbeschreibungen mit Fehler finden.
  - Rahmen: Bauen · Spannung aus: Vorhersage
  - Ruhig: Eine Murmelbahn: Die Pfeilkarten legen den Weg. Erst wenn alle liegen, rollt die Murmel los. Kommt sie ins Ziel?
  - Sanft: Ein Bauklotz liegt im Weg. Der Weg muss außen herum; welche Karte wird getauscht?
  - Abenteuer: Die längste Bahn der Schule über mehrere Runden: vom Fensterbrett durchs Klassenzimmer bis in den Flur, mit Trichter, Wippe und Glocke. Jede Runde ein Abschnitt. In der letzten rollt die Murmel durch alle und läutet die Glocke.
- Gesten: Ziehen (Karte in Leiste) mit Tipp-Alternative, Tippen „Los“. **Neu:** ein Knopf „Los“ im Lernfeld
  (Hauptaktion, Name gesprochen); er gehört zum Spiel, nicht auf einen festen Platz. Annahme: zulässig wie
  „Fertig“.
- Lernzeichen: Kästchengitter, Pfeilkarten (wie R02); Murmel als schlichte Kugel.
- Stimme: wenig Varianten (Richtungsbausteine wie R02).
- Fehlerbilder: Vorschlag `pfeil-ausgelassen`, `richtung-vertauscht`.
- Figuren: Ein Kind der Runde wartet am Ziel und freut sich, wenn der Weg ankommt (verschieden stark).
  Im Missverständnis-Teil hat Lena den falschen Weg genommen; sie wundert sich gelassen, es ist niemandes
  Schuld. Keine Fähigkeit nötig.
- Regal-Material: Pfeilkarte mit Murmel.
- Fachübergreifend: Sprechen „ding-beschreiben“ [SZ2-13] (so beschreiben, dass es ein anderer findet) ist
  verwandt; KO-Themen der Mathe (Erklären) ebenfalls.
- Mach mit: Ela und Timo sitzen Rücken an Rücken; Ela legt einen Weg, Timo legt ihn nach. Erzähler: „Frag
  jemanden, ob ihr das zusammen probiert: Einer beschreibt den Weg, der andere legt ihn nach.“ (N10)

### R04 Formen nach einem Merkmal einsortieren
- Name fürs Kind: „Formenkiste“ · Symbol: Kiste mit einem Dreieck auf dem Deckel
- Handlung: Das Kind legt Formplättchen in die Kiste, deren Schild das Merkmal trägt (Dreieck; 4 Ecken;
  groß; Rechteck), und lässt die anderen liegen · Wirkung: Die Kiste ist gefüllt, und Ela kann daraus
  bauen; was fehlt, findet sie jetzt schnell (Zweck: Bausteine wiederfinden).
- Material und Stufen: Formplättchen in vielen Größen, Lagen und Farben; Kisten mit Schild (Form-Umriss
  und Wort). material: wenige Plättchen, ein Merkmal, Plättchen lassen sich drehen und an die Probe legen ·
  vorstellung: Plättchen nur ansehen, nicht drehen; auch auf der Spitze stehende Dreiecke und gedrehte
  Quadrate · kopf: Schild nur mit Wort („Rechteck“), dazu „Welche gehört nicht dazu?“.
- Fehlerkontrolle: Beim Hineinlegen zeigt das Plättchen sein Merkmal: die Ecken leuchten der Reihe nach
  auf und werden gezählt, beim Rechteck legen sich vier Winkelmarken in die Ecken. Passt es nicht zum
  Schild, gleitet es zurück aufs Tablett; der Erzähler: „Fünf Ecken. Die Kiste nimmt Formen mit vier
  Ecken.“ Beim Quadrat in der Rechteck-Kiste: es passt, die Winkelmarken sitzen.
- Hauptthemen: kreis-dreieck-viereck, formen-sortieren (Kl. 1), quadrat-besonderes-rechteck (Kl. 2)
- Weitere Zugänge: quadrat-und-rechteck (R10 Hauptspiel), ecken-und-seiten-zaehlen (R06 Hauptspiel)
- Warum perfekt: Sortieren nach einem Merkmal und andere außer Acht lassen ist die Sache selbst. „Jedes
  Quadrat ist ein Rechteck“ wird nicht erklärt, sondern erlebt: die Rechteck-Kiste nimmt das Quadrat.
- Bewusst nicht drin: koerper-benennen → R05 (Körper, anderes Material), quadrat-und-rechteck → R10
  (Seitenlängen zeigt das Nagelbrett besser).
- Heimatwelt: Ampel, Zebrastreifen, Verkehrszeichen (`verkehrszeichen`)
  - Sachgrund: Verkehrszeichen haben feste Formen (Dreieck warnt, Kreis gebietet, Viereck weist hin).
  - Rahmen: Spur · Spannung aus: Rätsel
  - Ruhig: Schilder für den Verkehrsgarten: runde, dreieckige, viereckige. Jedes kommt in die Kiste mit seinem Merkmal und dann an seinen Pfahl.
  - Sanft: Ein Schild ist eingeschneit, man sieht nur die Form: acht Ecken. Davon gibt es nur eines, das Stoppschild.
  - Abenteuer: Schilder-Suche über mehrere Runden durch die Stadt, mit der Polizistin: Welche Formen gibt es, und was sagen sie? Die Runde sammelt Fotos nach Merkmalen. Eines hat keine der Formen: das Andreaskreuz am Bahnübergang.
- Gesten: Ziehen mit Tipp-Alternative. **Drehen** eines Plättchens (material-Stufe) braucht einen neuen
  **Drehgriff** am angehobenen Teil (Tippen dreht um 45°). Siehe Frage 4.
- Lernzeichen: neu: **Formplättchen** (flach, Tinte-Kontur). Wenn Farbe ein Sortiermerkmal ist, eine
  kleine feste Merkmalspalette; nie Perlen- oder Stellenwertfarben, die Formen nie neben Perlen (C2).
  Winkelmarke (kleines Quadrat in der Ecke) als neues Zeichen, auch in R10, R11.
- Stimme: wenig (Formnamen, Zahlen 0–8, feste Sätze je Schild).
- Fehlerbilder: **form-nach-lage** (gedrehtes Quadrat nicht als Quadrat erkannt). Das Spiel bietet gezielt
  gedrehte Formen an, sobald das Fehlerbild erkannt ist; die Winkelmarken zeigen, dass die Lage nichts
  ändert. Vorschlag: `quadrat-kein-rechteck` (Quadrat aus der Rechteck-Kiste gelassen).
- Figuren: Ela baut mit dem, was sortiert wurde (ihre Vorliebe, beiläufig). Ein Kind zeigt beim ersten Mal
  vor und zögert beim Dreieck auf der Spitze. Lena wundert sich, wenn das Quadrat in die Rechteck-Kiste
  passt. Keine Fähigkeit.
- Regal-Material: **form** (das Formplättchen selbst, z. B. Dreieck).
- Fachübergreifend: Mathe AR1-04 passt-nicht-ins-muster („Welches passt nicht?“) nutzt dieselbe Denkform;
  bleibt in Mathe.
- Mach mit: Lena sortiert Knöpfe aus einer Dose nach einem Merkmal. Erzähler: „Schau draußen: Welche Schilder
  sind Dreiecke? Oder sortier Knöpfe, nur nach einem Merkmal.“

### R05 Den Körper geben, der bestellt ist
- Name fürs Kind: „Baukiste“ · Symbol: Zylinder, Würfel und Kugel nebeneinander
- Handlung: Ein Kind der Runde baut und braucht ein Teil; das Kind gibt ihm den genannten Körper aus der
  Kiste („Den Zylinder bitte.“) oder ordnet einem Alltagsding den passenden Körper zu · Wirkung: Der Turm,
  die Brücke, das Regal wird fertig; die Dose steht bei den Zylindern im Laden.
- Material und Stufen: Holzkörper (Würfel, Quader, Kugel, Zylinder, Kegel, Pyramide, Prisma) und
  Alltagsdinge als Wortbild oder Sachbild. material: im Bau ist der Umriss des fehlenden Teils sichtbar,
  der Name wird dazu gesagt (zweite Stufe Drei-Stufen-Lektion: „Gib mir …“) · vorstellung: kein Umriss, nur
  der Name · kopf: das Kind wählt selbst das Namensschild für einen Körper (dritte Stufe: „Was ist das?“).
  Kl. 3: Fachbegriffe als Schilder an Teile hängen (Ecke, Kante, Fläche, Symmetrieachse, rechter Winkel).
- Fehlerkontrolle: Das gegebene Teil wird in den Bau gesetzt und passt nicht in die Lücke (die Kugel rollt
  vom Pfeiler, der Würfel ist zu breit fürs Rohr); der Erzähler benennt, was es ist: „Das ist ein Kegel.“
  Ein falsches Schild fällt vom Teil.
- Hauptthemen: koerper-benennen, koerper-in-der-umwelt (Kl. 2), fachbegriffe-geometrie (Kl. 3)
- Weitere Zugänge: rollt-oder-kippt (R20 Hauptspiel), wuerfel-quader-vergleichen (R06)
- Warum perfekt: Der Zweck „Gib mir mal den Zylinder“ ist die Handlung. Die Drei-Stufen-Lektion ist
  Montessoris eigener Weg zum Fachbegriff und trägt die drei Stufen.
- Bewusst nicht drin: ecken-kanten-flaechen → R06 (Zählen ist eine andere Handlung).
- Heimatwelt: Berufe in Hof, Werkstatt, Laden und Pflege (`berufe`)
  - Sachgrund: Im Laden räumt die Verkäuferin Dosen (Zylinder), Kartons (Quader) und Bälle (Kugeln) ein.
  - Rahmen: Werkstatt · Spannung aus: Rätsel
  - Ruhig: Im Laden wird eingeräumt: Dosen zu den Zylindern, Kartons zu den Quadern. Das Kind gibt den bestellten Körper; ist das Regal voll, öffnet der Laden.
  - Sanft: Ein Ding passt in keine Reihe: die Eistüte. Welcher Körper ist das? Ein Kegel.
  - Abenteuer: Ein Tag in vier Berufen über mehrere Runden: Bäckerin, Maurer, Töpferin, Eisverkäufer. Überall wird ein Körper bestellt. Am Abend baut die Runde aus leeren Verpackungen eine Stadt.
- Gesten: Tippen oder Ziehen (Teil in den Bau). Nichts Neues.
- Lernzeichen: neu: **Holzkörper** (Ahorn, Kanten in Tinte, keine Schattierung außer einer flachen
  dunkleren Seitenfläche). Alltagsdinge als Sachbild mit Echt-Zeichen, wo es um die echte Welt geht.
- Stimme: wenig (7 Körpernamen, rund 20 Alltagsdinge, Fachbegriffe Kl. 3 nach `grundsaetze.md` 5.1).
- Fehlerbilder: Vorschlag `wuerfel-als-viereck` (Würfel „Viereck“, Kugel „Kreis“ genannt, verboten nach
  5.1). Das Spiel zeigt es nicht als Fehler, es bietet nur den Fachbegriff an.
- Figuren: Ein Kind baut und braucht das Teil (Bedürfnis der Figur, nicht „hilf mir“). Freut sich, wenn der
  Turm steht. Keine Fähigkeit.
- Regal-Material: **form** (der Körper, z. B. Zylinder).
- Fachübergreifend: Deutsch Wortschatz (Nomen mit Artikel: der Zylinder, die Kugel) könnte die Schilder als
  Übungswörter nutzen (K10).
- Mach mit: Timo legt eine Dose, einen Ball und einen Karton auf seinen Schoß und stellt sie zu den
  Holzkörpern. Erzähler: „Such bei dir eine Dose. Welcher Körper ist sie? Frag jemanden, ob ihr beim Einkaufen
  zusammen Zylinder sucht.“

### R06 Lückenlos belegen und zählen
- Name fürs Kind: „Stab und Kugel“ · Symbol: Quadrat aus vier Stäben mit vier Kugeln in den Ecken
- Handlung: Das Kind legt auf jede Seite (Kante) einen Stab, auf jede Ecke eine Knetkugel, auf jede Fläche
  ein Bild, bis nichts mehr frei ist, und sagt dann, wie viele es gebraucht hat · Wirkung: Die Form steht
  als Stabmodell auf dem Tisch; die Geschenkschachtel ist auf allen Seiten beklebt und kann verschenkt
  werden.
- Material und Stufen: Formen bzw. Körper, Stäbe, Kugeln, Bildkärtchen. material: legen, jedes belegte
  Teil bleibt sichtbar belegt, Zahl steht erst nach dem Festlegen · vorstellung: belegen nur mit dem Blick,
  das Kind tippt die Teile an (sie bekommen einen Punkt), dann tippt es die Zahl · kopf: Zahl ohne Belegen,
  beim Körper auch die nicht sichtbaren Teile. Kl. 3: Würfel und Quader nebeneinander, beim Quader passen
  nicht alle Bildkärtchen auf jede Fläche. Kl. 4: Kantenmodell aus Stäben und Kugeln bauen.
- Fehlerkontrolle: Eine freie Seite bleibt ohne Stab und die Form hat eine Lücke (beim Modell kippt die
  Kante); ein zweiter Stab auf dieselbe Seite rutscht herunter. Beim Körper zeigen die Drehpfeile die
  Rückseite, und dort ist eine Fläche noch leer.
- Hauptthemen: ecken-und-seiten-zaehlen (Kl. 1), ecken-kanten-flaechen (Kl. 2), wuerfel-quader-vergleichen
  (Kl. 3), kantenmodelle (Kl. 4)
- Weitere Zugänge: quadrat-und-rechteck (R10; gleich lange Stäbe beim Quadrat), formen-sortieren (R04)
- Warum perfekt: Die Schwierigkeit aller vier Themen ist „vollständig, ohne Auslassen und Doppeln“. Belegen
  macht beides sichtbar. Der Zweck aus dem Lernplan (Streichhölzer zum Nachlegen, Schachtel bekleben) ist
  die Handlung.
- Bewusst nicht drin: wuerfelnetze → R19.
- Heimatwelt: Werkzeuge und wofür man sie nimmt (`werkzeuge`)
  - Sachgrund: Modelle baut man in der Werkstatt aus Stäben und Kugeln; jedes Werkzeug hat seinen Zweck.
  - Sache wächst mit: Kl. 1–2: Ecken und Seiten an Formen legen. Kl. 3–4: Kantenmodelle wie im Gerüstbau, Bauwerke aus Dreiecken.
  - Rahmen: Bauen · Spannung aus: Vorhersage
  - Ruhig: In Elas Werkstatt entstehen Kantenmodelle: auf jede Kante ein Stab, an jede Ecke eine Kugel. Ist nichts mehr frei, steht das Modell; dann wird gezählt.
  - Sanft: Für den Würfel liegen nur elf Stäbe da. Reicht das? Erst vorhersagen, dann bauen: Eine Kante bleibt offen.
  - Abenteuer: Kuppelbau über mehrere Runden: Aus Stäben und Kugeln entsteht erst ein Würfel, dann eine Pyramide, zuletzt eine Kuppel aus Dreiecken, groß genug zum Hineinsetzen. Vor jedem Schritt: Wie viele Stäbe? Am Ende sitzt die Runde darin.
- Gesten: Ziehen und Tippen. **Neu:** Drehpfeile am Körper (Tippen dreht den Körper um 90° nach links,
  rechts, oben), weil Wischen verboten ist. Gilt auch für R12, R14, R19.
- Lernzeichen: neu: **Stäbe** (schlicht, Tinte-Kontur; Länge zeigt Länge, in einer Farbe), **Kugeln**,
  Bildkärtchen als schlichte Fläche. Kein Bezug zu Perlenfarben.
- Stimme: wenig (Zahlen, „Ecke, Kante, Fläche, Seite“, feste Sätze).
- Fehlerbilder: Vorschlag `verdeckte-teile-vergessen` (Würfel: 3 statt 6 Flächen, 7 statt 8 Ecken) und
  `doppelt-gezaehlt`. Das Spiel kann die Rückseite dann zuerst zeigen lassen (Probe).
- Figuren: Kofi (malt, beiläufig) klebt die Bilder, ein anderes Kind hält die Schachtel. Beim ersten Mal
  zählt ein Kind vor und verliert den Anfang, legt dann einen Merkpunkt (Bewältigung, F6). Keine
  Fähigkeit nötig; optional **schrumpfen**, um um den Körper herumzugehen (statt Drehpfeilen, in Kl. 2).
- Regal-Material: **form** (Stabmodell des Würfels).
- Fachübergreifend: Mathe Zählen (abzaehlen) ist Voraussetzung, keine Dopplung.
- Mach mit: Ela baut ein Kantenmodell aus Zahnstochern und Knete. Erzähler: „Das kannst du auch bauen, mit
  Zahnstochern und Knete. Frag jemanden, ob ihr zusammen eine Schachtel beklebt und die Flächen zählt.“

### R07 Den Umriss füllen
- Name fürs Kind: „Legebild“ · Symbol: Haus-Umriss, halb mit Dreieck und Quadrat gefüllt
- Handlung: Das Kind füllt einen Umriss vollständig mit gegebenen Formteilen und dreht sie dafür passend ·
  Wirkung: Das gelegte Bild wird zum Ding in der Szene (das Boot schwimmt los, das Fenster ist eingesetzt,
  der Boden der Halle ist gefliest).
- Material und Stufen: Umriss auf Papier, Formteile (Dreiecke, Quadrate, Rauten, später Pentominos).
  material: Teile ziehen und mit dem Drehgriff drehen, Umriss mit Innenlinien als Hilfe · vorstellung:
  Umriss ohne Innenlinien · kopf: das Kind legt die Drehung fest, bevor es das Teil ablegt (L2), und darf
  danach nicht mehr drehen. Kl. 3: Parkett, das Muster aus einer Kachel lückenlos weiterlegen. Kl. 4: alle
  12 Pentominos finden und Rechtecke damit füllen; Drehen im Kopf: welches Teil passt, ohne es zu drehen.
- Fehlerkontrolle: Ein Teil, das nicht passt, ragt über den Umriss oder lässt eine Lücke, die sichtbar
  bleibt; das Bild wird erst lebendig, wenn nichts übersteht und nichts frei ist.
- Hauptthemen: formen-legen-zusammensetzen (Kl. 1), parkettierungen (Kl. 3), pentominos, drehen-im-kopf
  (Kl. 4)
- Weitere Zugänge: falten-zerlegen-drehen (R15; der Drehen-Teil), flaecheninhalt-kaestchen (R08; jedes
  Pentomino hat 5 Kästchen)
- Warum perfekt: Puzzle legen und dabei drehen ist die Handlung des Kl.-1-Themas und bleibt bis Kl. 4 die
  gleiche, nur mit mehr Teilen und am Ende im Kopf.
- Bewusst nicht drin: flaechen-vergleichen → R08 (gleiche Einheiten zählen ist Messen, nicht Puzzeln);
  bandornamente → R18.
- Heimatwelt: Schwimmen nur mit Aufsicht (`schwimmen-aufsicht`)
  - Sachgrund: Im Schwimmbad geht es erst ins Wasser, wenn die Aufsicht da ist. Bis dahin wird am Beckenrand aufgebaut: Matten und Bretter füllen ihren Platz lückenlos, und Mosaike am Becken bestehen aus Formen ohne Lücke.
  - Sache wächst mit: Kl. 1: Baderegeln (nur mit Aufsicht, nicht rennen). Kl. 3–4: Schwimmabzeichen und was man dafür können muss; Mosaike und Parkette als Muster.
  - Rahmen: Bauen · Spannung aus: Lücke
  - Ruhig: Vor dem Schwimmen: Bretter und Matten gehören lückenlos in ihren Rahmen am Beckenrand. Ist das Bild gelegt und die Bademeisterin an ihrem Platz, geht es ins Wasser.
  - Sanft: Ein Teil passt nur gedreht. Das Kind dreht es, und die Lücke schließt sich.
  - Abenteuer: Über mehrere Runden legt die Runde mit der Bademeisterin ein neues Mosaik für die Schwimmhalle: Welle, Fisch, Boot. Das letzte Bild ist ein Rätsel aus Umrissen. Gelegt, zeigt es die Bademeisterin auf ihrem Hochsitz.
- Gesten: Ziehen mit Tipp-Alternative; **Drehgriff** (neu, wie R04). In der kopf-Stufe Tippen auf
  Drehung 0/90/180/270 vor dem Ablegen.
- Lernzeichen: Formplättchen (R04), für Pentominos 5 Kästchen mit sichtbaren Fugen.
- Stimme: wenig.
- Fehlerbilder: Vorschlag `spiegeln-statt-drehen` (Pentomino gespiegelt statt gedreht gesucht).
- Figuren: Ein Kind probiert vor, ein Teil passt erst nach dem Drehen (F6). Ela setzt das fertige Fenster
  ein. Keine Fähigkeit nötig.
- Regal-Material: **form** (Haus aus Quadrat und Dreieck).
- Fachübergreifend: keine.
- Mach mit: Kofi legt ein Haus aus Pappteilen auf den Tisch. Erzähler: „Frag jemanden, ob ihr zusammen ein
  Tangram aus Pappe schneidet. Dann legst du Bilder daraus.“ (Schere: mit Erwachsenen)

### R08 Mit gleichen Plättchen auslegen (Fläche)
- Name fürs Kind: „Beet auslegen“ · Symbol: Rechteck aus sechs Kästchen
- Handlung: Das Kind legt zwei (oder mehr) Flächen mit gleich großen Plättchen ganz aus und entscheidet
  nach dem Zählen, welche größer ist; in Kl. 4 füllt es eine Kiste mit Würfeln · Wirkung: Auf die größere
  Fläche kommt, wofür sie gebraucht wird (das größere Beet bekommt die Kürbisse, die Decke reicht für den
  Tisch).
- Material und Stufen: Flächen auf Papier, Einheitsquadrate. material: auslegen und zählen · vorstellung:
  nur Teilreihen auslegen, Rest ansehen (Reihen und Spalten) · kopf: Fläche im Kästchengitter, Zahl ohne
  Auslegen. Kl. 3: krumme Flächen und halbe Plättchen. Kl. 4: Flächeninhalt in Kästchen, dann Rauminhalt
  mit Würfeln (Kiste füllen).
- Fehlerkontrolle: Es passen genau so viele Plättchen, wie die Fläche hat; eine Lücke bleibt sichtbar, ein
  überzähliges Plättchen ragt hinaus. Erst festlegen „Welche ist größer?“, dann zeigt das Auslegen.
- Hauptthemen: flaechen-vergleichen (Kl. 2), flaechen-auslegen (Kl. 3), flaecheninhalt-kaestchen,
  rauminhalt-wuerfel (Kl. 4)
- Weitere Zugänge: flaeche-oder-umfang (R09 Hauptspiel), pentominos (R07)
- Warum perfekt: Fläche heißt „wie viele gleiche Stücke passen hinein“; das ist die Handlung. Das lange
  schmale gegen das fast quadratische Beet widerlegt die Täuschung durch Länge.
- Bewusst nicht drin: rand-vergleichen → R09.
- Heimatwelt: Was Pflanzen brauchen (`was-pflanzen-brauchen`)
  - Sachgrund: Pflanzen brauchen Platz, Licht und Wasser; jedes Beet bekommt so viele Plätze, wie es Fläche hat.
  - Sache wächst mit: Kl. 2: Pflanzen brauchen Platz, Licht und Wasser. Kl. 3–4: Beetplanung im Schulgarten (wer braucht wie viel Platz, Fruchtfolge), Flächen in Quadratzentimetern und Quadratmetern.
  - Rahmen: Versorgen · Spannung aus: Vorhersage
  - Ruhig: Zwei Beete: Welches ist größer? Mit gleichen Platten ausgelegt und gezählt, zeigt es sich; aufs größere kommen die Kürbisse, die viel Platz brauchen.
  - Sanft: Ein Beet ist lang und schmal, eines kurz und breit. Kofi tippt auf das lange. Ausgelegt sind beide gleich groß.
  - Abenteuer: Der Schulgarten wird über mehrere Runden neu geplant: Radieschen brauchen wenig Platz, Kürbisse viel. Die Runde legt aus und sät. Im Sommer zeigt sich, ob der Kürbis im Beet geblieben ist: Er ist über den Weg gewachsen.
- Gesten: Ziehen (Plättchen, auch reihenweise als Streifen) mit Tipp-Alternative. Kiste mit Würfeln: von
  schräg oben gesehen, Würfel lagenweise; Drehpfeile wie R06.
- Lernzeichen: Einheitsquadrate (neu, schlicht, eine Farbe), Kästchengitter, Holzwürfel (R05).
- Stimme: wenig (Zahlen, feste Sätze).
- Fehlerbilder: **flaeche-umfang-verwechselt** (Übung: flaechen-vergleichen, flaechen-auslegen). Vorschlag
  `laenge-statt-flaeche` (das längere Beet gilt als größer).
- Figuren: Lena (sammelt, beiläufig) pflanzt; ein Kind zeigt das Auslegen in Reihen vor. Bei der Täuschung
  staunt ein Kind: das schmale Beet ist kleiner. Fähigkeit: **wachsen lassen** (verzaubern) lässt das Beet
  aufblühen, wenn die Fläche ganz ausgelegt ist; Folge der Lösung, nicht Belohnung.
- Regal-Material: **form** (Rechteck in Kästchen).
- Fachübergreifend: Mathe Kl. 4 Größen (Flächeneinheiten cm²) und Kl. 2 Malaufgaben als Reihen und
  Spalten (punktefeld-reihen-spalten): dieselben Reihen im Auslegen. Hinweis an Mathe.
- Mach mit: Lena legt zwei Tische mit Bierdeckeln aus und zählt. Erzähler: „Leg zwei Bücher mit gleichen
  Zetteln aus. Auf welches passen mehr?“

### R09 Den Rand abzäunen (Umfang)
- Name fürs Kind: „Zaunbau“ · Symbol: Kästchenfläche mit Zaun rundherum
- Handlung: Das Kind setzt Zaunlatten auf jede Kästchenseite des Randes und vergleicht, welches Gehege mehr
  Zaun braucht; in Kl. 4 entscheidet es vor einer Aufgabe, ob Plättchen oder Zaun gebraucht werden ·
  Wirkung: Das Gehege ist zu, die Ziegen können hinein; das Band reicht genau um die Karte.
- Material und Stufen: Kästchenflächen, Zaunlatten (eine Kästchenseite lang). material: Latten setzen und
  zählen · vorstellung: den Rand mit dem Finger abfahren (antippen Seite für Seite), dann Zahl · kopf: Zahl
  ohne Latten; Kl. 4 Umfang mit Längen (cm) und die gemischte Frage „Fläche oder Umfang?“ mit beiden
  Vorräten auf dem Tablett.
- Fehlerkontrolle: Eine fehlende Latte lässt eine Lücke, durch die eine Ziege schaut; eine Latte im Inneren
  hat keinen Halt und fällt um. Zwei Figuren mit gleich vielen Kästchen bekommen verschieden lange Zäune,
  sichtbar nebeneinander.
- Hauptthemen: rand-vergleichen (Kl. 2), umfang-bestimmen, flaeche-oder-umfang (Kl. 4)
- Weitere Zugänge: flaecheninhalt-kaestchen (R08)
- Warum perfekt: Umfang ist „wie viel Zaun“, und das Zaunsetzen trennt den Rand handgreiflich von der
  Fläche. flaeche-oder-umfang mischt die Verwechslungspartner (L6), deshalb hier mit beiden Vorräten.
- Bewusst nicht drin: flaechen-vergleichen → R08.
- Heimatwelt: Was Pflanzen brauchen (`was-pflanzen-brauchen`)
  - Sachgrund: Ein Beet braucht einen Zaun, damit nichts hineintritt; der Rand ist der Umfang (gleiche Welt wie R08 zum Mischen).
  - Sache wächst mit: Kl. 2: Ein Zaun schützt das Beet. Kl. 4: Wer frisst am Salat und was hilft; gleiche Fläche, verschiedener Umfang.
  - Rahmen: Forschen · Spannung aus: Vorhersage
  - Ruhig: Die Beete bekommen einen niedrigen Zaun, damit niemand hineintritt. Latte für Latte um den Rand: Welches Beet braucht mehr?
  - Sanft: Zwei Beete sind gleich groß, aber eines braucht mehr Zaun. Wie kann das sein? Nachgelegt sieht man es.
  - Abenteuer: Schneckenforscher über mehrere Runden: Etwas knabbert am Salat. Die Runde baut einen Schneckenzaun und will mit denselben Latten möglichst viel Beet schützen. Welche Form nimmt man? Am Morgen sitzt die Schnecke außen am Zaun.
- Gesten: Tippen (Kästchenseite bekommt Latte) oder Ziehen der Latte. Nichts Neues.
- Lernzeichen: Kästchengitter, Zaunlatte als neues schlichtes Zeichen (dünner Stab in der Stabfarbe aus R06).
- Stimme: wenig.
- Fehlerbilder: **flaeche-umfang-verwechselt** (Hauptort). Das Spiel bietet Rechtecke mit verschiedenen
  Werten (3 × 5: 15 und 16) an; bei der falschen Wahl stehen 15 Plättchen da, das Gehege hat aber 16
  Lücken. Vorschlag `ecke-doppelt` (an Ecken zwei Seiten als eine gezählt).
- Figuren: Timo fährt am Zaun entlang und zählt mit (Geräusch, Finger), ein anderes Kind hält die Ziege.
  Keine Fähigkeit nötig.
- Regal-Material: **form** (Rechteck mit Rand).
- Fachübergreifend: Mathe Kl. 4 Größen (Längen addieren).
- Mach mit: Timo legt eine Schnur einmal um den Tisch. Erzähler: „Leg eine Schnur um ein Buch. Dann leg das
  Buch mit Zetteln aus. Was ist der Rand, was die Fläche?“

### R10 Formen spannen (Nagelbrett)
- Name fürs Kind: „Nagelbrett“ · Symbol: Punktgitter mit einem gespannten Quadrat
- Handlung: Das Kind spannt ein Gummi um Nägel, bis eine verlangte Form in verlangter Größe entsteht
  („Quadrat mit Seiten von 2 Abständen“, „Rechteck, das kein Quadrat ist“) · Wirkung: Das gespannte Gummi
  wird zur Schnur im Garten: Das Beet oder Gehege ist so abgesteckt, wie die Gärtnerin es braucht.
- Material und Stufen: Punktgitter 5 × 5, Gummi. material: Nägel der Reihe nach antippen, das Gummi folgt;
  Abstände zwischen den Nägeln an jeder Seite sichtbar als kleine Zahl nach dem Festlegen · vorstellung:
  ohne Abstandszahlen · kopf: nur beschreiben, welche Nägel (das Kind tippt alle Ecken, dann erst spannt
  sich das Gummi).
- Fehlerkontrolle: Die Seiten zeigen ihre Abstände (2, 2, 2, 3); beim Quadrat liegt die Probe-Schnur auf
  jede Seite gleich lang. Die Gärtnerin steckt das Beet ab, und es ist sichtbar schief oder ungleich.
- Hauptthemen: quadrat-und-rechteck (Kl. 1), geobrett-formen-spannen (Kl. 2)
- Weitere Zugänge: rechter-winkel (R11 Hauptspiel), kreis-dreieck-viereck (R04)
- Warum perfekt: Quadrat und Rechteck unterscheiden sich an den Seiten, und hier ist die Seitenlänge
  abzählbar und selbst gemacht (L1 konstruieren statt wählen). Der Zweck des Geobretts im Lernplan
  (Gehege abstecken) wird wörtlich gespielt.
- Bewusst nicht drin: formen-sortieren → R04.
- Heimatwelt: Auf dem Bauernhof (`bauernhof`)
  - Sachgrund: Auf dem Hof steckt man Gehege und Weiden mit Schnur und Pflöcken ab.
  - Rahmen: Versorgen · Spannung aus: Durcheinander
  - Ruhig: Neue Weiden für die Ziegen: Mit Schnur und Pflöcken spannt das Kind die Form, die die Bäuerin braucht. Steht das Gehege, kommen die Ziegen.
  - Sanft: „Ein Rechteck, das kein Quadrat ist.“ Die erste Schnur ergibt ein Quadrat; ein Pflock wird umgesteckt.
  - Abenteuer: Weidewechsel über mehrere Runden: Jede Woche brauchen die Ziegen frisches Gras, also eine neue Form um Baum, Teich und Stall herum. Eine Ziege steht jedes Mal schon auf dem Stalldach und schaut zu.
- Gesten: Tippen (Nägel nacheinander), Tippen auf den ersten Nagel schließt die Form; ein „Zurück“-Knopf
  im Lernfeld nimmt den letzten Nagel. **Neu:** dieser Zurück-Knopf (im Spiel, nicht auf festem Platz).
- Lernzeichen: neu: **Punktgitter** und Gummi in Tinte. Winkelmarke aus R04.
- Stimme: wenig.
- Fehlerbilder: form-nach-lage (schräg gespanntes Quadrat). Vorschlag `quadrat-kein-rechteck` wie R04.
- Figuren: Die Gärtnerin (Gast, z. B. die Bäuerin) steckt ab; ein Kind der Runde zeigt das Spannen vor und
  zählt die Abstände halblaut. Keine Fähigkeit.
- Regal-Material: **form** (Quadrat auf Punktgitter).
- Fachübergreifend: keine.
- Mach mit: Ela steckt im Garten mit vier Stöcken und einer Schnur ein Quadrat ab. Erzähler: „Frag jemanden, ob
  ihr zusammen mit Stöcken und Schnur ein Beet absteckt. Sind alle Seiten gleich lang?“

### R11 Das Werkzeug richtig anlegen
- Name fürs Kind: „Werkbank“ · Symbol: Lineal mit sichtbarer Null und einem Stift
- Handlung: Das Kind legt ein Werkzeug richtig an (Lineal mit der Null an den Anfang, Faltwinkel in die
  Ecke, Geodreieck mit der Mittellinie auf die Linie, Maßstabsleiste an den Weg) und liest ab oder setzt
  den Endpunkt; das Werkzeug zeichnet dann die Linie oder den Kreis · Wirkung: Das Brett wird auf die richtige Länge gesägt, das Regal steht gerade, der
  Wanderweg ist so lang, wie der Wegweiser schreibt.
- Material und Stufen: Werkstück auf Papier, Werkzeuge. material: Lineal ziehen und drehen, Probe: der
  Strich auf dem Lineal leuchtet, wo die Null ist · vorstellung: ein schon angelegtes Lineal prüfen („Liegt
  die Null am Anfang?“) und die Länge ablesen · kopf: Länge ohne Verschieben ablesen, wenn das Lineal bei
  3 beginnt (Endmarke minus Anfang). Kl. 3: Faltwinkel prüft, ob eine Ecke ein rechter Winkel ist.
  Kl. 2: gerade Linie zwischen zwei Gitterpunkten: das Kind legt die Linealkante durch beide Punkte, dann
  zieht der Stift (Linie verbindet nur, wenn die Kante beide Punkte trifft). Kl. 4: Geodreieck senkrecht und
  parallel anlegen; Zirkel: Öffnung am Lineal auf den Radius stellen, Spitze in den Mittelpunkt setzen, dann
  dreht der Zirkel (der Kreis trifft die verlangte Marke oder nicht); Maßstab im Plan mit der Maßstabsleiste.
- Fehlerkontrolle: Das gesägte Brett ist sichtbar zu kurz oder zu lang neben dem Platz, an den es soll; der
  Faltwinkel liegt in einer Ecke mit Spalt oder ragt über; die Wanderin kommt früher an als gesagt.
- Hauptthemen: lineal-bei-null-anlegen, zeichnen-mit-lineal (Kl. 2), rechter-winkel (Kl. 3),
  zeichnen-geodreieck, kreise-zirkel, massstab-im-plan (Kl. 4)
- Weitere Zugänge: geobrett-formen-spannen (R10)
- Warum perfekt: Alle sechs Themen haben dieselbe Schwierigkeit: wo setzt das Werkzeug an. Diese Frage ist
  kognitiv und am Bildschirm prüfbar. Das ruhige Festhalten (Lineal verrutscht nicht, Zirkelspitze bleibt)
  kann die App nicht sehen; es ist der Mach-mit-Moment und zählt nicht für „gekonnt“. Ehrlich: bei
  zeichnen-mit-lineal und kreise-zirkel prüft das Spiel nur die Hälfte des Lernplan-Ziels.
- Bewusst nicht drin: umfang-bestimmen → R09.
- Heimatwelt: Himmelsrichtungen und Karten (`karten`)
  - Sachgrund: Auf Karten misst man mit dem Lineal ab Null; der Maßstab macht aus Zentimetern Kilometer.
  - Sache wächst mit: Kl. 2: mit dem Lineal messen und zeichnen. Kl. 3–4: Karte, Himmelsrichtungen, Maßstab, rechter Winkel beim Planen.
  - Rahmen: Reise · Spannung aus: Vorhersage
  - Ruhig: Eine Wanderung wird geplant: Lineal mit der Null an den Start, Maßstabsleiste an den Weg. Jede Messung zeichnet ein Wegstück.
  - Sanft: Zwei Wege führen zur Hütte. Welcher ist kürzer? Erst schätzen, dann messen.
  - Abenteuer: Schatzkarte der Klasse über mehrere Runden: Die Runde versteckt etwas im Stadtpark und zeichnet die Karte dazu, mit Himmelsrichtung, Winkel und Maß. Eine andere Klasse sucht danach und findet es beim ersten Versuch.
- Gesten: Ziehen (Werkzeug verschieben) mit Tipp-Alternative, **Drehgriff** am Werkzeug (neu, wie R04;
  Geodreieck und Lineal brauchen feinere Schritte: 15° oder Einrasten an Linien, Annahme). Ablesen per
  **Bildschirm-Tastatur** mit Ziffern 0–9.
- Lernzeichen: neu: **Lineal** (cm-Striche, Null deutlich, ohne Rand vor der Null nur in der kopf-Stufe),
  Faltwinkel, Geodreieck, Maßstabsleiste. Länge in cm als Ziffer nach dem Festlegen (M7 sinngemäß).
- Stimme: wenig (Zahlen, feste Sätze).
- Fehlerbilder: **lineal-ab-eins** (Lineal bei 1 statt 0; Antwort Endmarke oder ± 1). Hauptort für die
  Übung; Mathe nennt messen-mit-lineal als Thema.
- Figuren: Ela sägt und schraubt (beiläufig), ein anderes Kind hält das Brett. Beim ersten Mal legt ein
  Kind das Lineal am Rand an, merkt es selbst und schiebt nach (F6, Bewältigung vorzeigen). Keine
  Fähigkeit nötig.
- Regal-Material: Lineal-Kärtchen mit Null.
- Fachübergreifend: **Mathe messen-mit-lineal [M2-71]** ist dieselbe Handlung wie lineal-bei-null-anlegen.
  Empfehlung: eines der beiden Spiele für beide; Mathe Kl. 3 kilometer-millimeter für den Maßstab.
- Mach mit: Kofi hält ein echtes Lineal mit der ganzen Hand flach und zieht den Stift an der Kante entlang;
  Lena prüft eine Ecke mit einem zweimal gefalteten Blatt. Erzähler: „Probier es mit einem echten Lineal: erst
  messen, dann zwei Punkte verbinden. Halt es mit der ganzen Hand fest.“ Kl. 4: Timo zieht einen Kreis mit dem
  Zirkel, hält ihn oben am Griff. Erzähler: „Frag jemanden, ob ihr zusammen einen Kreis mit dem Zirkel zieht.
  Erst auf Karton.“

### R12 Würfelbau nachbauen
- Name fürs Kind: „Würfelbau“ · Symbol: kleine Treppe aus vier Würfeln
- Handlung: Das Kind baut aus Holzwürfeln nach, was ein Bild, ein Bauplan (Draufsicht mit Zahlen) oder
  zwei Ansichten vorgeben · Wirkung: Ela hat das Bauwerk ihrer Freundin abgegeben bekommen, und das Kind
  baut es für sie nach; das Gebäude steht in der Spielstadt.
- Material und Stufen: Baufläche mit Kästchen, Würfelvorrat. material: Kl. 2 Vorbild als Bild, das sich mit
  den Drehpfeilen drehen lässt, auch der verdeckte Würfel wird beim Drehen sichtbar · vorstellung: Vorbild
  nur von einer Seite, verdeckte Würfel mitdenken · kopf: Kl. 3 nur Bauplan; Kl. 4 Rätsel: nur Vorder- und
  Seitenansicht, das Kind baut ein passendes Gebäude, mit wenigsten oder meisten Würfeln.
- Fehlerkontrolle: Nach „Fertig“ steht das Vorbild als Geist über dem Bau: fehlende Würfel sind leere
  Umrisse, überzählige ragen hinaus. Beim Rätsel werfen Lampen die Schatten (Ansichten) des Baus an die
  Wand neben die verlangten.
- Hauptthemen: wuerfelbauten-nachbauen (Kl. 2), wuerfelgebaeude-nach-bauplan (Kl. 3),
  wuerfelgebaeude-raetsel (Kl. 4)
- Weitere Zugänge: rauminhalt-wuerfel (R08), ansicht-und-gebaeude (R14)
- Warum perfekt: Aus einer Darstellung das Ding machen ist die Handlung aller drei; Fehlerkontrolle durch
  Überlagern ist eindeutig.
- Bewusst nicht drin: bauplan-zeichnen → R13 (Gebäude → Plan ist die Umkehrung).
- Heimatwelt: Türme, die fest stehen (`tuerme-bauen`)
  - Sachgrund: Türme stehen fest, wenn Würfel richtig aufeinander lasten.
  - Sache wächst mit: Kl. 2: Türme, die stehen bleiben. Kl. 3–4: Bauplan und Ansichten, wie Architektinnen ein Haus von allen Seiten zeichnen.
  - Rahmen: Bauen · Spannung aus: Rätsel · Fähigkeit: schrumpfen
  - Ruhig: Türme nach Foto: Das Kind baut nach, was das Bild zeigt. Steht der Turm wie auf dem Foto, wird er fotografiert.
  - Sanft: Auf dem Foto ist ein Würfel nicht zu sehen. Er muss aber da sein, sonst würde der obere schweben.
  - Abenteuer: Die Würfelstadt über mehrere Runden: jede Runde ein Gebäude nach Plan. Dann schrumpft die Runde und geht durch ihre Straßen. Von unten sieht ein Turm anders aus als auf dem Plan. Von oben stimmt er.
- Gesten: Tippen auf ein Kästchen der Baufläche setzt einen Würfel oben auf den Stapel; ein Zurück-Knopf
  nimmt den obersten. Damit ist 3D ohne neue Geste baubar. **Neu:** Drehpfeile (R06), Zurück-Knopf (R10).
- Lernzeichen: Holzwürfel (R05), Bauplan als Kästchen mit Ziffern (neu, Ziffern in Tinte).
- Stimme: wenig.
- Fehlerbilder: Vorschlag `verdeckte-teile-vergessen` (wie R06).
- Figuren: Eine Gast-Figur (z. B. die Maurerin) bringt den Plan; zwei Kinder der Runde tragen Würfel, Timo
  auf dem Schoß. Ein Kind zeigt beim ersten Mal vor und vergisst den verdeckten Würfel, sieht ihn beim
  Drehen und setzt ihn (F6). Fähigkeit: optional **riesig werden** (Riesenstiefel), um von oben auf die
  Stadt zu schauen.
- Regal-Material: **form** (Treppe aus Würfeln).
- Fachübergreifend: keine.
- Mach mit: Lena baut hinter einem Buch eine Treppe aus echten Würfeln, Kofi baut sie nach dem Bild nach.
  Erzähler: „Mit echten Würfeln oder Bausteinen geht das auch. Frag jemanden, ob ihr zusammen baut: einer baut,
  einer baut nach.“

### R13 Von oben eintragen (Bauplan, Lageplan)
- Name fürs Kind: „Bauplan“ · Symbol: Kästchen mit den Ziffern 2, 1, 3 von oben
- Handlung: Das Kind trägt in eine Draufsicht ein, was in der Szene steht: bei einem Würfelgebäude die
  Zahl der Würfel je Feld, bei einem Zimmer die Möbel-Zeichen an ihrem Ort · Wirkung: Ein Kind der Runde
  baut oder richtet nur nach diesem Plan ein, in einem anderen Raum, und es sieht genauso aus.
- Material und Stufen: Gebäude bzw. Zimmer neben einem leeren Plan. Kl. 3: Bauplan für Würfelgebäude
  (Ziffern über die Bildschirm-Tastatur). Kl. 4: Lageplan eines Zimmers oder Schulhofs (Möbel-Zeichen
  ziehen) und Bauplan beschreiben: das Kind gibt Ela den Plan Schritt für Schritt (Feld und Zahl), Ela baut
  hinter einer Wand mit.
- Fehlerkontrolle: Der Bau oder das Zimmer nach dem Plan steht neben dem Original; was nicht stimmt, ist
  sichtbar anders (ein Turm zu niedrig, das Bett am Fenster statt an der Tür).
- Hauptthemen: bauplan-zeichnen (Kl. 3), lageplan-zeichnen, bauplan-diktieren (Kl. 4)
- Weitere Zugänge: weg-beschreiben (R03), ansichten-wuerfelgebaeude (R14)
- Warum perfekt: Ein Plan ist gut, wenn ein anderer danach dasselbe baut; genau das prüft das Spiel.
  bauplan-diktieren ist dieselbe Handlung in Schritten.
- Bewusst nicht drin: ansichten-zuordnen → R14; planquadrate → R17.
- Heimatwelt: Himmelsrichtungen und Karten (`karten`)
  - Sachgrund: Lagepläne zeigen Orte von oben; Karten haben Himmelsrichtungen.
  - Rahmen: Entdecken · Spannung aus: Vorhersage · Fähigkeit: schweben
  - Ruhig: Ein Lageplan des Schulgeländes für neue Kinder: Jedes Gebäude wird von oben eingetragen. Hängt der Plan am Eingang, findet ein Gast die Turnhalle.
  - Sanft: Ein Gast steht mit dem Plan vor der falschen Tür. Was ist falsch eingetragen?
  - Abenteuer: Mit dem Ballon schwebt die Runde über mehrere Runden über Schule, Dorf und Tal und zeichnet, was sie von oben sieht. Zurück am Boden geht sie einen Weg nach dem eigenen Plan. Stimmt er, kommt sie am Badesee an.
- Gesten: Tippen auf ein Feld, dann Ziffer auf der Bildschirm-Tastatur (nur 0–4); Ziehen der Möbel-Zeichen.
- Lernzeichen: Bauplan (R12), neu: **Planzeichen** für Möbel (schlichte Draufsicht-Umrisse in Tinte).
- Stimme: wenig.
- Fehlerbilder: Vorschlag `bauplan-ansicht-statt-draufsicht` (Kind trägt die Vorderansicht ein).
- Figuren: Ela baut nach dem Plan des Kindes (vorzeigen entfällt beim Diktieren, dort folgt die Figur).
  Stimmt etwas nicht, wundert sich Ela gelassen. Fähigkeit: **fliegen** (Ballon) über das Zimmer, um es von
  oben zu sehen; nur in der Einführung, als Weg zur Draufsicht.
- Regal-Material: Bauplan-Kärtchen mit Ziffern.
- Fachübergreifend: Sprechen Kl. 3–4 (genau beschreiben) für bauplan-diktieren.
- Mach mit: Ela beschreibt ihr Würfelhaus, Timo baut hinter einer Wand mit. Erzähler: „Frag jemanden, ob ihr
  Rücken an Rücken baut. Du sagst, wie viele Würfel auf jedes Feld kommen.“ Kl. 4: „Mal dein Zimmer von oben.“
  (N10)

### R14 Wer sieht was? (Ansichten)
- Name fürs Kind: „Von wo?“ · Symbol: Tasse, daneben ein Kreis (die Tasse von oben)
- Handlung: Das Kind ordnet einem Ding oder Würfelgebäude die Ansicht zu, die ein Kind der Runde von seinem
  Platz aus sieht, oder setzt die Fotografin an die Stelle, von der aus das Foto gemacht wurde · Wirkung:
  Das Foto kommt ins Album an die richtige Stelle; Kofi kann das Ding von seinem Platz aus richtig malen.
- Material und Stufen: Ding in der Mitte, Kinder der Runde an vier Seiten und eines oben. material: Ding mit
  Drehpfeilen drehbar, das Kind darf nachsehen, nachdem es festgelegt hat · vorstellung: nicht drehbar,
  Ansicht wählen aus 3 · kopf: Kl. 3 die Ansicht eines Würfelgebäudes selbst ins Gitter tippen; Ansicht
  und Gebäude: zu drei Ansichten das passende Gebäude finden.
- Fehlerkontrolle: Nach dem Festlegen fliegt die Kamera an den Platz des Kindes, und das echte Bild von dort
  legt sich neben die gewählte Ansicht.
- Hauptthemen: ansichten-zuordnen (Kl. 2), ansichten-wuerfelgebaeude, ansicht-und-gebaeude (Kl. 3)
- Weitere Zugänge: wuerfelgebaeude-raetsel (R12), lageplan-zeichnen (R13)
- Warum perfekt: Der Zweck „andere sehen etwas anders als ich“ ist die Handlung: sich an einen anderen Platz
  denken, dann nachsehen.
- Bewusst nicht drin: bauplan-zeichnen → R13 (Draufsicht mit Zahlen ist ein Plan, keine Ansicht).
- Heimatwelt: Der Mond und seine Gestalten (`mond`)
  - Sachgrund: Die Mondgestalten entstehen, weil wir die beleuchtete Hälfte von verschiedenen Seiten sehen (Ansichten).
  - Rahmen: Forschen · Spannung aus: Vorhersage · Fähigkeit: schweben
  - Ruhig: Ball und Lampe im Guckkasten: Durch welches Loch sieht man den Ball halb hell? Jede richtige Ansicht zeigt eine Mondgestalt.
  - Sanft: Kofi und Lena sehen denselben Ball verschieden. Wer sitzt wo? Die Ansicht verrät den Platz.
  - Abenteuer: Ein Monat mit dem Mond über mehrere Runden: Jeden Abend schaut die Runde aus dem Fenster und sagt vorher, wie er morgen aussieht. Am Ende schwebt sie im Ballon so weit hinaus, dass Sonne, Erde und Mond zugleich zu sehen sind (Sachbild).
- Gesten: Tippen (Ansicht, Platz), Drehpfeile (neu, R06), in Kl. 3 Tippen von Gitterfeldern.
- Lernzeichen: Holzwürfel, Kästchengitter; Alltagsdinge als Wortbilder.
- Stimme: wenig.
- Fehlerbilder: Vorschlag `eigene-sicht` (Kind wählt immer die eigene Vorderansicht; egozentrischer Fehler).
- Figuren: Die vier Kinder sitzen um das Ding, eines steht auf einer Leiter. Jedes zeigt einmal auf das,
  was es sieht. Fähigkeit: **schweben** (Schirm) für die Ansicht von oben.
- Regal-Material: **form** (Zylinder mit Kreis daneben).
- Fachübergreifend: Sachunterricht von-oben (Klassenzimmer von oben).
- Mach mit: Die vier stellen eine Tasse auf den Tisch, jedes malt, was es sieht. Erzähler: „Stell eine Tasse
  auf den Tisch. Frag jemanden, ob ihr von zwei Seiten malt, was ihr seht.“

### R15 Falten und vorhersagen
- Name fürs Kind: „Falten“ · Symbol: Blatt mit gestrichelter Faltlinie und halbem Herz
- Handlung: Das Kind legt fest, was beim Falten (und Schneiden) geschieht: ob die Hälften aufeinanderpassen,
  wo die Faltlinie liegen muss, welche Form beim Aufklappen entsteht, welche Teile nach einem Schnitt
  daliegen; dann faltet das Blatt · Wirkung: Das Gefaltete wird gebraucht: die Maske passt aufs Gesicht,
  das Fensterbild hängt am Fenster, der Pfannkuchen ist geteilt.
- Material und Stufen: Papierblatt mit Figur. material: Kind tippt zwei Punkte für die Faltlinie, das Blatt
  faltet sich, Überstand bleibt sichtbar · vorstellung: erst vorhersagen (passt / passt nicht; welche von
  drei Formen beim Aufklappen), dann falten · kopf: alle Symmetrieachsen tippen, bevor gefaltet wird;
  Faltschnitt: das Aufgeklappte selbst ins Gitter tippen.
- Fehlerkontrolle: Beim Falten deckt sich alles oder ein Stück ragt über (sichtbar in Tinte gegen Papier);
  beim Aufklappen entsteht das echte Ergebnis neben der Vorhersage.
- Hauptthemen: symmetrie-erkennen, falten-zerlegen-drehen (Kl. 2), symmetrieachsen-einzeichnen,
  faltschnitte-spiegelbilder (Kl. 3)
- Weitere Zugänge: symmetrie-ergaenzen (R16; Falten ist dort die Probe)
- Warum perfekt: Symmetrie ist im Lernplan über Falten definiert; Falten ist auch die Fehlerkontrolle. Vorher
  festlegen, dann falten ist L2 in reiner Form.
- Bewusst nicht drin: Drehen aus falten-zerlegen-drehen → R07 (Nebenzugang); spiegeln-im-gitter → R16.
- Heimatwelt: Raupe und Schmetterling, Kaulquappe und Frosch (`vom-ei-zum-tier`)
  - Sachgrund: Schmetterlingsflügel sind symmetrisch; vom Ei über Raupe und Puppe zum Falter.
  - Rahmen: Forschen · Spannung aus: Vorhersage
  - Ruhig: Schmetterlinge fürs Fenster: Ein halber Flügel ist gemalt. Wie sieht er aufgeklappt aus? Erst vorhersagen, dann aufklappen.
  - Sanft: Ein Fleck sitzt nah an der Faltlinie. Wo landet er auf der anderen Seite?
  - Abenteuer: Im Schmetterlingshaus über mehrere Runden: Die Runde sucht Falter nach halben Bildern. Ein Flügel hat einen Fleck, der wie ein Auge aussieht: das Tagpfauenauge (Sachbild). Am Ende schlüpft im Kasten ein Falter und klappt die Flügel auf.
- Gesten: Tippen (zwei Punkte der Faltlinie, Vorhersage). Falten als Animation (B2), anhaltbar.
- Lernzeichen: Papierblatt, Faltlinie gestrichelt in Tinte weich; Kästchengitter für Faltschnitt kopf.
- Stimme: wenig.
- Fehlerbilder: Vorschlag `achse-nur-senkrecht` (Kind findet nur senkrechte Achsen, keine waagrechten oder
  schrägen). Fachübergreifend: Spiegelbuchstaben (`spiegelschrift`, `b-d-lesen`) nicht hier üben, nur
  Hinweis an Schreiben.
- Figuren: Kofi malt die Hälfte (beiläufig); ein Kind zeigt Falten vor, faltet einmal schief, öffnet und
  faltet neu. Lena zeigt auf das Sachbild eines echten Schmetterlings (Echt-Zeichen; Erzähler sagt den
  Fakt). Fähigkeit: keine, Falten ist echt.
- Regal-Material: **form** (Herz mit Faltlinie).
- Fachübergreifend: Schreiben spiegelbuchstaben-b-d-p-q: verwandt, aber eigene Schwierigkeit, nicht
  zusammenlegen.
- Mach mit: Lena faltet ein Blatt, schneidet ein halbes Herz, klappt es auf. Erzähler: „Das kannst du auch mit
  Papier probieren. Frag jemanden, ob ihr zusammen schneidet. Rate vorher, wie es aufgeklappt aussieht.“

### R16 Ins Gitter übertragen (abzeichnen, spiegeln, vergrößern)
- Name fürs Kind: „Kästchenbild“ · Symbol: zwei Gitter, im rechten halb fertiges Haus
- Handlung: Das Kind überträgt eine Figur Kästchen für Kästchen in ein zweites Gitter: gleich, an der Achse
  gespiegelt oder in einem Gitter mit größeren Kästchen · Wirkung: Das Bild ist fertig und wird gebraucht
  (das Fensterbild ist beidseitig gleich, die Karte für die Freundin, das Muster für den Teppich, der Plan
  für den großen Wandbild-Rahmen).
- Material und Stufen: zwei Kästchengitter, Linien von Gitterpunkt zu Gitterpunkt (Tippen auf zwei Punkte).
  material: Vorlage daneben, Startpunkt markiert, Zählhilfe vom Rand · vorstellung: Startpunkt selbst
  finden; beim Spiegeln Abstand zur Achse zählen · kopf: Vorlage verschwindet nach dem Ansehen (nur bei
  einfachen Figuren). Kl. 4: Spiegeln an schrägen Achsen; vergrößern mit doppelt so großen Kästchen.
- Fehlerkontrolle: Gleich: Die Vorlage legt sich durchscheinend über die Zeichnung. Gespiegelt: Das Blatt
  faltet sich an der Achse (wie R15), Linien decken sich oder nicht. Vergrößert: Die Zeichnung schrumpft zur
  Probe auf die Vorlagengröße und legt sich darüber.
- Hauptthemen: nachzeichnen-im-gitter (Kl. 1), symmetrie-ergaenzen (Kl. 2), vergroessern-verkleinern,
  spiegeln-im-gitter (Kl. 4)
- Weitere Zugänge: symmetrie-erkennen (R15)
- Warum perfekt: Alle vier Themen sind „Kästchen zählen und übertragen“, nur die Regel der Übertragung
  wechselt. Die Fehlerkontrolle (überlegen, falten, zurückschrumpfen) liegt in der Sache.
- Bewusst nicht drin: drehen-im-kopf → R07; zeichnen-mit-lineal → R11.
- Heimatwelt: Insel und See, Halbinsel und Bucht (`land-und-wasser`)
  - Sachgrund: Inseln spiegeln sich im See; Land- und Wasserformen im Gitter abzeichnen und vergrößern.
  - Sache wächst mit: Kl. 1–2: Insel, See, Bucht abzeichnen. Kl. 4: Karten vergrößern und verkleinern (Maßstab), Küstenformen mit Namen.
  - Rahmen: Bauen · Spannung aus: Verwandlung
  - Ruhig: Eine Seenkarte wird ins Gitter abgezeichnet, Kästchen für Kästchen. Fertig, wird sie gerahmt.
  - Sanft: Die Karte soll doppelt so groß an die Wand. Aus einem Kästchen werden vier. Stimmt die Insel noch?
  - Abenteuer: Die Insel der Runde über mehrere Runden: Sie erfindet eine Insel, zeichnet sie ab, spiegelt sie zur Zwillingsinsel und vergrößert sie zur Wandkarte. Am Ende fährt ein Papierschiff im Sandkasten um die gebaute Insel.
- Gesten: Tippen (Gitterpunkt, Gitterpunkt = Linie; Linie antippen löscht sie). Nichts Neues; kein freies
  Zeichnen (Waldorf-Bericht: Nachspuren bringt nichts, eigener Stoff zählt).
- Lernzeichen: Kästchengitter, Symmetrieachse als kräftige Linie in Tinte.
- Stimme: wenig.
- Fehlerbilder: Vorschlag `verschieben-statt-spiegeln` (Hälfte verschoben statt gespiegelt), `abstand-achse`
  (Spiegelpunkt mit falschem Abstand).
- Figuren: Kofi zeichnet die erste Hälfte, das Kind ergänzt; ein Kind zeigt Zählen vom Rand vor. Wenn die
  Faltprobe nicht deckt, wundert sich ein Kind und zählt mit. Fähigkeit: Kl. 4 optional **groß zaubern**
  (verzaubern: groß machen) für das Vergrößern, wirkt nur auf die Szene, das Gitter bleibt echt.
- Regal-Material: **form** (halbes Haus mit Achse).
- Fachübergreifend: Waldorf-Idee 12 „Spiegelsee“ fällt hier hinein.
- Mach mit: Kofi malt eine Hälfte auf Kästchenpapier und hält einen kleinen Spiegel an die Achse. Erzähler:
  „Mal auf Kästchenpapier eine Hälfte und ergänz die andere. Mit einem Spiegel kannst du prüfen.“

### R17 Post nach Planquadrat
- Name fürs Kind: „Post auf dem Plan“ · Symbol: Brief mit „B3“ auf einem kleinen Gitter
- Handlung: Das Kind bringt Briefe in das Planquadrat, das auf dem Umschlag steht, und schreibt für neue
  Briefe selbst das Planquadrat eines Hauses auf · Wirkung: Der Brief landet im richtigen Briefkasten; die
  Bewohnerin bekommt ihre Post.
- Material und Stufen: Ortsplan mit Gitter A–F und 1–6. (Kl. 3, ohne Lernplan-Stufen; Ablauf: erst
  Planquadrat → Ort finden, dann Ort → Planquadrat schreiben, dann zwei Dinge im selben Quadrat
  unterscheiden.)
- Fehlerkontrolle: Der Postbote fährt in das angegebene Quadrat; dort steht ein anderes Haus, und der Name
  auf dem Briefkasten passt nicht.
- Hauptthemen: planquadrate (Kl. 3)
- Weitere Zugänge: ortsplan-orientieren (R02)
- Warum perfekt: Planquadrate sind eine Adresse; Post zustellen ist ihr Zweck.
- Bewusst nicht drin: lageplan-zeichnen → R13.
- Heimatwelt: Nah und fern, Stadt und Land (`stadt-und-land`)
  - Sachgrund: Stadt und Land haben Pläne mit Planquadraten; die Post findet so jedes Haus.
  - Rahmen: Reise · Spannung aus: Rätsel
  - Ruhig: Post austragen im Dorf: Auf jedem Brief steht ein Planquadrat. Richtig gefunden, kommt der Brief an.
  - Sanft: Auf einem Brief ist das Quadrat verwischt: B und eine Zahl. Im Brief steht „neben der Kirche“.
  - Abenteuer: Vertretung für die Briefträgerin über mehrere Runden: erst das Dorf, dann die Kleinstadt, dann ein Viertel der Großstadt. Ein Brief hat ein Quadrat, in dem nur Wasser ist. Er geht an das Hausboot.
- Gesten: Ziehen (Brief) mit Tipp-Alternative; Bildschirm-Tastatur mit nur A–F und 1–6.
- Lernzeichen: Ortsplan mit Gitter, Buchstaben und Ziffern in Tinte am Rand.
- Stimme: wenig (36 Planquadrate als Aufnahmen „B 3“).
- Fehlerbilder: Vorschlag `zeile-spalte-vertauscht` (3B statt B3, Feld gespiegelt an der Diagonale).
- Figuren: Der Briefträger (Gast; Beruf gegen Klischee möglich: die Briefträgerin auf dem Lastenrad);
  ein Kind der Runde fährt mit. Keine Fähigkeit.
- Regal-Material: Kärtchen „B3“.
- Fachübergreifend: Sachunterricht karten (Himmelsrichtungen und Karten).
- Mach mit: Timo sucht auf einem gedruckten Stadtplan seine Straße. Erzähler: „Frag jemanden, ob ihr zusammen
  auf einem Stadtplan sucht: In welchem Planquadrat wohnst du?“

### R18 Muster weiterlegen
- Name fürs Kind: „Musterband“ · Symbol: Band mit Dreieck, Quadrat, Dreieck, Quadrat, Lücke
- Handlung: Das Kind setzt ein Muster aus Formen, Körpern oder Plättchen fort, das um einen Rahmen oder eine
  Kette läuft · Wirkung: Die Kette schließt sich, der Rahmen ist rundherum gleich, das Band läuft um die
  Vase.
- Material und Stufen: Muster auf einem Band mit Plätzen. material: das sich wiederholende Stück kann man
  mit einer Klammer markieren und darunterlegen · vorstellung: ohne Klammer · kopf: Lücke in der Mitte
  („Was fehlt?“) und zwei Merkmale zugleich (Form und Lage). Kl. 3: Bandornamente, die durch Verschieben
  und Spiegeln entstehen.
- Fehlerkontrolle: Das Band ist ein Ring: schließt man es, trifft das Ende auf den Anfang; stimmt das Muster
  nicht, stoßen zwei gleiche Teile aneinander oder die Wiederholung bricht sichtbar an der Naht.
- Hauptthemen: formen-muster-fortsetzen (Kl. 1), muster-koerper-plaettchen (Kl. 2), bandornamente (Kl. 3)
- Weitere Zugänge: keine
- Warum perfekt: Der Zweck „damit es ringsum passt“ ist die Fehlerkontrolle: das Band schließt sich.
- Bewusst nicht drin: parkettierungen → R07 (Fläche lückenlos füllen, nicht eine Reihe fortsetzen).
- Heimatwelt: Feste im Kalender (`feste-im-kalender`)
  - Sachgrund: Feste haben Schmuck mit Mustern (Girlanden, Bänder), als Brauch gleichwertig.
  - Sache wächst mit: Kl. 1: Girlanden und Bänder. Kl. 3: Muster in Bräuchen vieler Feste (Laternen, Rangoli, Ostereier, Sterne), immer als Brauch und gleichwertig.
  - Rahmen: Fest · Spannung aus: Durcheinander
  - Ruhig: Der Raum wird für ein Fest geschmückt. Jedes fortgesetzte Muster verlängert die Girlande; reicht sie durch den Raum, wird gefeiert.
  - Sanft: In der Girlande ist ein Stück falsch aufgefädelt. Wo bricht das Muster?
  - Abenteuer: Feste des Jahres über mehrere Runden: Laternen, Girlanden, Muster aus Farbpulver am Boden, bemalte Eier. Jede Runde ein Fest mit seinem Muster. Das letzte Muster erfindet die Runde selbst, für das Klassenfest.
- Gesten: Ziehen mit Tipp-Alternative; Klammer per Tippen auf Anfang und Ende. Drehgriff für „Lage“ als
  Merkmal (neu, wie R04).
- Lernzeichen: Formplättchen, Holzkörper; Farbe als Merkmal braucht die Merkmalspalette (Frage 3).
- Stimme: wenig.
- Fehlerbilder: Vorschlag `muster-nur-ein-merkmal` (Form fortgesetzt, Lage oder Farbe nicht).
- Figuren: Kofi legt Muster (beiläufig) und zeigt vor; das Band schließt ein anderes Kind und freut sich,
  wenn es passt. Keine Fähigkeit.
- Regal-Material: **form** (kurzes Musterband).
- Fachübergreifend: **Mathe** formen-nahe Musteraufgaben: muster-regel-finden [PL1-08], passt-nicht-ins-muster
  [AR1-04], zahlenfolgen-bis-20 [M1-76]. Mit Formen ist R18 die Heimat; Zahlenmuster bleiben in Mathe.
  Hinweis zum Zusammenführen.
- Mach mit: Kofi fädelt eine Nudelkette nach Muster. Erzähler: „Fädel eine Kette nach einem Muster. Passt es,
  wenn du sie zumachst?“

### R19 Netz falten
- Name fürs Kind: „Würfelnetz“ · Symbol: Kreuz aus sechs Quadraten, eine Seite hochgeklappt
- Handlung: Das Kind entscheidet, ob ein Netz zum Würfel (Quader) wird und welche Flächen sich
  gegenüberliegen, dann faltet sich das Netz; in Kl. 4 kippt es einen Würfel über einen Weg und sagt
  vorher, welches Bild oben liegt · Wirkung: Die Schachtel ist zu und kann gefüllt werden; der Spielwürfel
  für das Fest hat gegenüber immer zusammen sieben Augen.
- Material und Stufen: Netze aus Quadraten (Rechtecken), Würfel mit Bildern auf den Flächen.
  (Kl. 3–4, ohne Lernplan-Stufen; Ablauf: Kl. 3 Würfelnetze erkennen und begründen, welche Flächen
  zusammenstoßen; Kl. 4 Quadernetze, Gegenflächen im Kopf, Würfel kippen.)
- Fehlerkontrolle: Beim Falten stoßen zwei Flächen aufeinander und eine Seite bleibt offen (beides sichtbar
  markiert, das ist zugleich die Begründung für netz-begruenden); beim Kippen rollt der Würfel wirklich, und
  die Fläche, die oben liegt, legt sich neben die Vorhersage.
- Hauptthemen: wuerfelnetze, netz-begruenden (Kl. 3), quadernetze, netz-im-kopf-falten, wuerfelnetz-im-kopf,
  wuerfel-kippen (Kl. 4)
- Weitere Zugänge: ecken-kanten-flaechen (R06)
- Warum perfekt: Alle sechs Themen fragen, wohin eine Fläche beim Falten oder Rollen kommt; Falten zeigt es
  unmittelbar. Würfel kippen gehört dazu, weil ein abrollender Würfel sein Netz auf den Boden druckt
  (unsicherste Passung, siehe Überblick).
- Bewusst nicht drin: kantenmodelle → R06.
- Heimatwelt: Wer an meinem Brot mitgearbeitet hat (`wer-macht-mein-brot`)
  - Sachgrund: Brot und Brezen werden in gefalteten Schachteln geliefert; Netze falten.
  - Sache wächst mit: Die Welt gehört zu Kl. 2, das Spiel zu Kl. 3–4. Hier geht es deshalb um Verpackung und Lieferung: wie Brot und Kuchen heil ankommen, wie man Karton spart.
  - Rahmen: Werkstatt · Spannung aus: Vorhersage
  - Ruhig: Schachteln für die Bäckerei: Welches Netz ergibt eine Schachtel? Erst vorhersagen, dann falten.
  - Sanft: Ein Netz sieht richtig aus und bleibt an einer Seite offen. Welche Fläche muss umziehen?
  - Abenteuer: Über mehrere Runden entwirft die Runde eigene Verpackungen: für eine Breze, ein Brot, eine Torte. Wenig Karton, nichts darf wackeln. Am Markttag trägt die Bäckerin die Torte darin über den Platz. Sie kommt heil an.
- Gesten: Tippen (Netz passt / passt nicht; zwei Flächen als Gegenflächen; Bild für „oben“). Drehpfeile
  (neu, R06). Falten als anhaltbare Animation.
- Lernzeichen: Netze aus Papierquadraten, Würfel mit schlichten Bildzeichen (keine Perlen; Augen auf dem
  Spielwürfel als Punktbild sind Szene, nicht Lernzeichen, Annahme).
- Stimme: wenig.
- Fehlerbilder: Vorschlag `gegenflaeche-nachbar` (Nachbarfläche als Gegenfläche gewählt).
- Figuren: Ein Kind faltet vor und erlebt, dass ein Netz nicht schließt, wundert sich, probiert ein anderes.
  Keine Fähigkeit.
- Regal-Material: **form** (Würfelnetz).
- Fachübergreifend: keine.
- Mach mit: Ela zeichnet ein Netz auf Karopapier, schneidet es aus und faltet eine Schachtel. Erzähler: „Frag
  jemanden, ob ihr zusammen ein Netz ausschneidet und faltet. Rate vorher, ob es zugeht.“

### R20 Rollt es oder kippt es?
- Name fürs Kind: „Rollt es?“ · Symbol: Rampe mit einer Kugel
- Handlung: Das Kind legt vor dem Loslassen fest, ob ein Körper die Rampe hinunterrollt, kippt oder beides
  kann, und setzt ihn dann auf die Rampe · Wirkung: Die Murmelbahn läuft mit den Teilen, die rollen; der
  Turm daneben wird aus denen gebaut, die stehen bleiben.
- Material und Stufen: Rampe, Holzkörper. material: Körper aufsetzen und zusehen, dann sortieren ·
  vorstellung: erst die Kiste wählen (rollt / rollt nicht / beides), dann loslassen · kopf: auf welcher
  Fläche liegt der Zylinder, wenn er rollen soll (gewölbte oder ebene Fläche antippen).
- Fehlerkontrolle: Die Rampe zeigt es; der Erzähler benennt die Fläche: „Der Würfel hat nur ebene Flächen.
  Er rutscht und kippt.“
- Hauptthemen: rollt-oder-kippt (Kl. 2)
- Weitere Zugänge: koerper-in-der-umwelt, koerper-benennen (R05)
- Warum perfekt: Die Frage wird mit dem Versuch selbst beantwortet; L2 vorhersagen, dann sehen.
- Bewusst nicht drin: koerper-benennen → R05.
- Heimatwelt: Was rollt? Murmelbahn und Fahrzeuge (`was-rollt`)
  - Sachgrund: Was rollt und was kippt: Kugeln rollen in alle Richtungen, Zylinder geradeaus.
  - Rahmen: Forschen · Spannung aus: Vorhersage
  - Ruhig: Dinge auf der Rampe: Rollt es oder kippt es? Erst vorhersagen, dann loslassen. Jede Vorhersage kommt ins Testheft.
  - Sanft: Die Dose rollt, aber nur auf der Seite. Hingestellt bleibt sie stehen. Wie muss sie liegen?
  - Abenteuer: Seifenkisten über mehrere Runden: Die Runde baut ein Fahrzeug und probiert Räder aus (Scheiben, Kugeln, eine Walze, zum Spaß auch eckige). Vor jedem Start wird vorhergesagt. Die Kiste mit den eckigen Rädern hoppelt einen Meter und bleibt stehen.
- Gesten: Tippen (Vorhersage), Ziehen (Körper auf die Rampe). Nichts Neues.
- Lernzeichen: Holzkörper (R05), Rampe als Szene.
- Stimme: wenig.
- Fehlerbilder: Vorschlag `zylinder-nur-rollt` (Zylinder kann auch stehen, wird nur als rollend gesehen).
- Figuren: Timo fährt neben der Murmelbahn mit; ein Kind setzt beim ersten Mal den Zylinder auf die flache
  Seite, wundert sich, dreht ihn. Keine Fähigkeit.
- Regal-Material: **form** (Zylinder auf Rampe).
- Fachübergreifend: Sachunterricht was-rollt (Welt passt genau).
- Mach mit: Lena legt Dinge aus der Küche auf ein schräges Brett. Erzähler: „Leg ein Brett schräg. Rate erst:
  Was rollt? Dann probier es aus.“

---------------------------------------------------------------------------------------------------
## 3. Zuordnungstabelle

| id | Hauptspiel | weitere |
|---|---|---|
| oben-unten-vorne-hinten | R01 | |
| links-und-rechts | R01 | |
| neben-zwischen-ueber-unter-auf | R01 | |
| wege-nach-pfeilen | R02 | R03 |
| kreis-dreieck-viereck | R04 | R10 |
| quadrat-und-rechteck | R10 | R04, R06 |
| ecken-und-seiten-zaehlen | R06 | R04 |
| formen-sortieren | R04 | R06 |
| formen-muster-fortsetzen | R18 | |
| formen-legen-zusammensetzen | R07 | |
| nachzeichnen-im-gitter | R16 | |
| weg-beschreiben | R03 | R13 |
| koerper-benennen | R05 | R20 |
| rollt-oder-kippt | R20 | R05 |
| ecken-kanten-flaechen | R06 | R19 |
| quadrat-besonderes-rechteck | R04 | |
| koerper-in-der-umwelt | R05 | R20 |
| ansichten-zuordnen | R14 | |
| wuerfelbauten-nachbauen | R12 | |
| symmetrie-erkennen | R15 | R16 |
| symmetrie-ergaenzen | R16 | R15 |
| zeichnen-mit-lineal | R11 | |
| falten-zerlegen-drehen | R15 | R07 |
| geobrett-formen-spannen | R10 | R11 |
| flaechen-vergleichen | R08 | |
| rand-vergleichen | R09 | |
| muster-koerper-plaettchen | R18 | |
| lineal-bei-null-anlegen | R11 | |
| wuerfel-quader-vergleichen | R06 | R05 |
| wuerfelnetze | R19 | |
| wuerfelgebaeude-nach-bauplan | R12 | |
| bauplan-zeichnen | R13 | |
| ansichten-wuerfelgebaeude | R14 | R13 |
| symmetrieachsen-einzeichnen | R15 | |
| faltschnitte-spiegelbilder | R15 | |
| bandornamente | R18 | |
| parkettierungen | R07 | |
| planquadrate | R17 | R02 |
| ortsplan-orientieren | R02 | R17 |
| flaechen-auslegen | R08 | |
| rechter-winkel | R11 | R10 |
| netz-begruenden | R19 | |
| missverstaendnis-aufklaeren | R03 | |
| ansicht-und-gebaeude | R14 | R12 |
| fachbegriffe-geometrie | R05 | |
| quadernetze | R19 | |
| netz-im-kopf-falten | R19 | |
| wuerfel-kippen | R19 | |
| kantenmodelle | R06 | |
| zeichnen-geodreieck | R11 | |
| kreise-zirkel | R11 | |
| vergroessern-verkleinern | R16 | |
| massstab-im-plan | R11 | |
| lageplan-zeichnen | R13 | R14 |
| flaecheninhalt-kaestchen | R08 | R07, R09 |
| pentominos | R07 | R08 |
| umfang-bestimmen | R09 | |
| flaeche-oder-umfang | R09 | R08 |
| rauminhalt-wuerfel | R08 | R12 |
| spiegeln-im-gitter | R16 | |
| drehen-im-kopf | R07 | |
| wuerfelgebaeude-raetsel | R12 | R14 |
| wuerfelnetz-im-kopf | R19 | |
| bauplan-diktieren | R13 | R03 |

Folge der Voraussetzungen je Spiel geprüft: In jedem Spiel stehen die Themen in Lernplan-Reihenfolge
(z. B. R16 nachzeichnen → symmetrie-ergaenzen → spiegeln-im-gitter; R19 wuerfelnetze → quadernetze →
netz-im-kopf-falten → wuerfel-kippen). Zwei Voraussetzungen liegen außerhalb: lineal-bei-null-anlegen
braucht messen-mit-lineal (Mathe), massstab-im-plan braucht kilometer-millimeter (Mathe).

---------------------------------------------------------------------------------------------------
## 4. Offene Fragen an den Auftraggeber

1. **Zahl der Spiele:** 20 nach der Leitregel. Vertretbare Zusammenlegungen, falls weniger gewünscht
   (→ 15): R02+R03 (Weg lesen und legen als zwei Richtungen), R08+R09 (Beet auslegen und einzäunen in einer
   Welt), R13+R14 (Pläne und Ansichten), R17 in R02 (Planquadrat als Ziel im Ortsplan), R20 nur als
   Mach-mit-Moment in R05. Empfehlung: höchstens R08+R09 und R02+R03.
2. **Handwerk und „gekonnt“:** Bei zeichnen-mit-lineal und kreise-zirkel sieht die App nur, wo das
   Werkzeug ansetzt, nicht das ruhige Festhalten. Darf das Thema trotzdem „gekonnt“ werden, wenn der
   prüfbare Teil sitzt? Empfehlung: ja, und der Themenname im Regal bleibt ehrlich („Lineal anlegen“).
3. **Lernzeichen Geometrie:** `grundsaetze-bilder.md` hat keine. Gebraucht werden Formplättchen,
   Kästchengitter, Punktgitter, Stäbe und Kugeln, Holzwürfel, Pfeil- und Lagewort-Karten, Werkzeuge. Welche
   Farbe tragen Plättchen (Vorschlag: eine neutrale Füllung, z. B. Ahorn oder Papier mit Tinte), und gibt es
   für „Farbe als Sortiermerkmal“ (formen-sortieren, Muster) eine eigene kleine Merkmalspalette außerhalb der
   Perlenfarben? Dazu ein Regal-Baustein `form`.
4. **Bedienung:** Drehen geht mit Tippen und Ziehen nur über neue Bedienteile: **Drehgriff** am angehobenen
   Teil (R04, R07, R11, R18), **Drehpfeile** an einem Körper (R06, R12, R14, R19) und ein **Zurück-Knopf**
   im Lernfeld (R10, R12). Als neue Bausteine in `spiele/rahmen/` aufnehmen?
5. **Fachgrenzen:** R01 = Sprechen SZ1-09 „Wohin damit?“ und R11 = Mathe messen-mit-lineal sind dieselbe
   Handlung. Wer führt das gemeinsame Spiel (Empfehlung: Geometrie für R01, R11 für beide Lineal-Themen)?

---------------------------------------------------------------------------------------------------
Prüfskript (python, im Ordner ausgeführt):

```python
import re
ein = re.findall(r'^- ([a-z0-9-]+) \[', open('themen-geometrie.md').read(), re.M)
tab = [l for l in open('katalog-geometrie.md') if re.match(r'^\| [a-z0-9-]+ \| R', l)]
haupt = [l.split('|')[1].strip() for l in tab]
weitere = [w.strip() for l in tab for w in l.split('|')[3].split(',') if w.strip()]
assert len(ein) == 64 and sorted(haupt) == sorted(ein) and len(set(haupt)) == len(haupt)
```
