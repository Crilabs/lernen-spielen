> Teil des Spielkatalogs (`docs/spielkatalog.md`). Heimatwelt je Spiel mit Sachgrund und Geschichte auf drei Stufen.
> Die Entscheidungen im Hauptdokument gehen vor.

# Heimatwelten und Geschichten der 138 Spiele

Stand: 2026-11-14 · Entwurf · überarbeitet nach der Prüfung vom 2026-11-14 (Hauptdokument, Abschnitt 1a).
Grundlage: `docs/grundsaetze.md` §9 und §10 (K1–K15), `docs/figuren.md`, Welten und Themenklassen aus `spiele/lernplan.json`.

## 1. Überblick

**Zahlen**
- 138 Spiele, jedes hat genau eine Heimatwelt. Die Zuordnung ist gegenüber der ersten Fassung unverändert.
- 113 Welten in `lernplan.json`. **106 Welten** sind Heimat, davon 74 mit einem und **32 mit zwei Spielen**. Keine Welt hat mehr als zwei.
- **7 Welten** haben kein Spiel (Abschnitt 4): vulkanausbruch, dinosaurier-aussterben, dinosaurier, nicht-schuld, familien, beruehrungen, hilfe-holen.
- **Jedes Spiel hat alle drei Stufen** (ruhig, sanft, abenteuer). Die frühere Einteilung in 80 „ruhig feste“ und 58 „anpassbare“ Spiele ist aufgehoben (Hauptdokument 4.2).
- Rahmen der Geschichten: Forschen 24, Versorgen 17, Fest 17, Reise 15, Bauen 14, Werkstatt 13, Miteinander 11, Spur 11, Entdecken 9, Zeitreise 7.
- Spannungsquellen: Rätsel 40, Vorhersage 27, Lücke 24, Durcheinander 18, Verwandlung 14, Hilfe 8, Wissensvorsprung 7.
- Fähigkeiten aus `figuren.md` §5 kommen in 31 Spielen vor, immer nur in der Szene.

**Was die Überarbeitung geändert hat**
- Jede Geschichte hat jetzt eine Frage, die das Kind beantworten will, auch auf „ruhig“. Vorher endeten 53 von 138 Geschichten mit „ist … fertig, ist Schluss“, und viele hatten nur Ordnen, Einräumen oder Beschriften als Anlass.
- Jedes Spiel hat eine eigene Auflösung auf „abenteuer“. Vorher kam „Dämmerung, es ist eine Eule“ fünfmal vor, und in zwölf Spielen hieß Abenteuer nur „länger“ oder „größer“.
- **R01** (verlaufen): Die Geschichte „Lena findet ihren Papa nicht“ ist ersetzt. Verlassenwerden ist auf keiner Stufe Spannungsquelle (`grundsaetze.md` 9.2 Nr. 8). Jetzt: Treffpunkt ausmachen, eine Sache wiederfinden, Rallye zu zweit.
- **M15**: „Gewitterwolken ziehen auf, rechtzeitig fertig“ ist ersetzt (kein Zeitdruck, N6). **M48**: Gewitter am Abend ist ersetzt durch Sekundenzählen am Fenster.
- Sachgrund neu gefasst, weil der alte sachlich nicht trug (K3) oder nicht zur neuen Geschichte passt: M02, M19, M24, M29, M48, S03, S05, G05, L08, R01, R07.
- Zeile **„Sache wächst mit“** bei 65 Spielen: Der Sachstoff richtet sich nach der Klasse des Themas der Runde, nicht nach der Klasse der Welt (Hauptdokument 4.1).
- Alle Sachangaben in dieser Datei sind Vorschläge aus dem Gedächtnis. Vor dem Bau eines Spiels werden sie mit Quelle in den Faktensatz der Welt übernommen oder gestrichen (K4).

**Wie die Zuordnung entstand** (unverändert)
1. Für jedes Spiel die Welt-Kandidaten aus dem Katalog gegen die Anbindung der Welt geprüft; fehlende Kandidaten ergänzt (z. B. zaehne für M21, wenn-etwas-schiefgeht für S15, verkehrszeichen für R04).
2. Jede Paarung bewertet: Sachgrund, Klassenabstand, Stufe.
3. Eine Rechnung hat alle Welten mindestens einmal und höchstens zweimal belegt; danach von Hand nachgebessert.
- Geändert wurden dabei unter anderem: S15 zu wenn-etwas-schiefgeht; gewitter zu M48 statt Z01 (Donner wäre ein plötzliches lautes Geräusch); G06 zu mensch-und-natur; M04 zu koerperteile; M06 zu feuer-notruf; M12 zu samen-reisen; M32 zu jahrhunderte; R13 zu karten.

**Alter**
- Bei 74 Spielen liegen Themen zwei oder mehr Klassen von der Klasse ihrer Welt entfernt (194 von 956 Themen). Das liegt am Zuschnitt: Viele Spiele laufen über mehrere Klassen, 62 der 113 Welten gehören zu Kl. 1.
- Die erste Fassung nannte nur drei Paarungen (M10, M31, M52), weil sie den Abstand zur nächstgelegenen Klasse des Spiels maß.
- Antwort darauf ist die Zeile „Sache wächst mit“ (65 Spiele; bei den übrigen 9 ist nur je ein Thema betroffen). Ein Tausch von Welten hätte das Problem nur verschoben.

**Weiter schwach im Sachgrund** (die Welt ist vor allem Ort und Wortstoff)
- S18 Selbst schreiben → schulweg, L02 Abzählen → tiere-der-erdteile, Z04 Hörbühne → fuer-andere-einstehen, Z02 Wäscheleine → haende-sonne, S14 Die Karte → gute-schlechte-geheimnisse (trägt nur die gute Hälfte der Regel; die andere steht in der Pause), M14 Zwei Tonnen → muell-trennen (die Sorten bestimmen die Zerlegung, das Kind wählt sie nicht).

**Doppel im selben Fach** (bewusst stehen gelassen)
- was-pflanzen-brauchen: R08 Fläche und R09 Umfang (zum Mischen gewollt). jahreskreis: M27 und M49. wiese-und-hecke: M35 und M37. karten: R11 und R13. tuerme-bauen: M28 und R12.

**Stufen der Welten** (`stufe_ab` sanft)
- gebirge-vulkane (M09): auf „ruhig“ nur Berge und Höhen, das Erdinnere ab „sanft“ in der Pause, Ausbruch nur in der Pause auf „abenteuer“.
- wer-frisst-was (G04): auf „ruhig“ nur Pflanzenfutter, ab „sanft“ Pfeil im Schaubild ohne Jagd und ohne Opfer.
- dinosaurier: nicht tragbar, siehe Abschnitt 4.

## 2. Spiele, Heimatwelten und Geschichten

So ist jeder Eintrag zu lesen:
- **Sachgrund:** was die Welt der Lernhandlung gibt (K2, in Deutsch K10).
- **Sache wächst mit:** welcher Sachstoff zu welcher Klasse gehört, wenn das Spiel über mehrere Klassen läuft.
- **Rahmen** und **Spannung aus:** aus den festen Listen im Hauptdokument 4.7. **Fähigkeit:** aus `figuren.md` §5, nur in der Szene.
- **Ruhig, Sanft, Abenteuer:** was sich an Bogen und Szene ändert. Die Lernhandlung, das Material und der Moment der Aufgabe sind auf allen Stufen gleich und still. Jede Runde endet in Ruhe und im Hellen; ein Bogen über mehrere Runden wartet ohne Verlust, wenn das Kind aufhört.
- Klassen: „Spiel Einstieg–Ende (Schwerpunkt) / Welt“.

### Mathe

**M01 Paare bilden** · Sehen, hören, riechen, schmecken, tasten (`sinne`) · Kl. 1–2 (Schw. 1) / 1
- Sachgrund: Montessori-Hördosen und Tastsäckchen gibt es paarweise; wer Paare bildet, merkt, ob eine Dose übrig bleibt (ungerade).
- Rahmen: Forschen · Spannung aus: Rätsel
- Ruhig: Was klingt gleich? Ela schüttelt die Hördosen der Sinneskiste. Jedes gefundene Paar geht auf und zeigt, was darin klingt (Reis, Sand, Glöckchen). Am Ende sieht man, ob eine Dose allein bleibt.
- Sanft: Eine Dose bleibt ohne Partner. Ihr Gegenstück ist unter das Regal gerollt; Lena sieht es schon.
- Abenteuer: Klangpfad im Garten über mehrere Runden: Mit der Hand am Seil geht die Runde von Station zu Station, an jeder liegen Paare zum Hören und Tasten. Die Kiste am Ende geht erst mit dem letzten Paar auf. Darin liegt eine Spieluhr.

**M02 Zählweg** · Wenn die Wut kommt (`wenn-die-wut-kommt`) · Kl. 1 / 1
- Sachgrund: Bis zehn zählen und dabei gehen oder atmen ist eine Pause, die hilft, wenn die Wut kommt; vorwärts und rückwärts zählen ist hier die Handlung selbst.
- Rahmen: Bauen · Spannung aus: Lücke
- Ruhig: Die Runde legt im Garten einen Ruheweg aus Trittsteinen: ein Weg für alle, die wütend oder aufgeregt sind. Jede Zahl legt einen Stein; reicht der Weg bis zur Bank, geht ihn ein Kind langsam ab. Wie die Wut kommt, zeigt nur die Einführung einmal kurz.
- Sanft: Kofis Turm ist umgefallen, er stapft los. Mit jedem gezählten Stein werden seine Schritte ruhiger. An der Bank atmet er aus und baut neu.
- Abenteuer: Der Weg wächst über mehrere Runden durch den Garten bis zum Baumhaus, rückwärts gezählt geht es wieder hinunter. Ein Stein wackelt: Darunter wohnt eine Kröte (Sachbild), der Stein bekommt einen anderen Platz.

**M03 Alle da?** · Wie die Zahlen entstanden sind (`geschichte-der-zahlen`) · Kl. 1 / 1
- Sachgrund: Hirten zählten früher Schafe mit Steinchen oder Kerben und prüften abends, ob alle wieder da sind; das leere Gehege zeigt die Null.
- Rahmen: Zeitreise · Spannung aus: Rätsel · Fähigkeit: in die Zeit reisen
- Ruhig: Mit der Zeituhr bei einer Hirtin vor langer Zeit: Für jedes Schaf legt sie ein Steinchen in den Beutel. Abends zählt das Kind nach: Sind alle wieder da? Das leere Gehege bekommt kein Steinchen (die Null).
- Sanft: Ein Steinchen bleibt übrig, ein Schaf fehlt. Es steht hinter dem Stall und kaut; Timo sieht es schon.
- Abenteuer: Über mehrere Runden zieht die Runde mit der Herde auf die Sommerweide. Jeden Abend wird gezählt. Einmal ist ein Schaf zu viel: In der Nacht ist ein Lamm geboren.

**M04 Blitzblick** · Mein Körper von Kopf bis Fuß (`koerperteile`) · Kl. 1 / 1
- Sachgrund: Eine Hand hat fünf Finger, zwei Hände zehn, mit Zehen zwanzig: Zehnerfeld und Zwanzigerfeld sind Hände und Füße.
- Rahmen: Miteinander · Spannung aus: Wissensvorsprung
- Ruhig: Fingerblitz im Sandkasten: Kofi zeigt kurz Finger, das Kind legt die Zahl. Jede Zahl wird ein Handabdruck im Sand; zehn Abdrücke ergeben eine Reihe. (Das Bild blitzt nur auf, wenn das Kind tippt, nie als Wettlauf.)
- Sanft: Jemand ist über die Reihe gelaufen, ein Abdruck ist verwischt. Welche Zahl fehlt? Sie wird neu gedrückt.
- Abenteuer: Geheimzeichen über mehrere Runden: Die Runde denkt sich eine Fingersprache aus und schickt sich Zahlen über den Hof zu. Die letzte Zahlenfolge öffnet das Zahlenschloss am Schuppen, darin liegen die Strandsachen.

**M05 Was sagt die Zahl?** · Sonne, Sterne, Planeten (`am-himmel`) · Kl. 1 / 2
- Sachgrund: Die Planeten haben eine feste Reihenfolge ab der Sonne; „der dritte Planet“ ist ein Platz, keine Anzahl.
- Rahmen: Entdecken · Spannung aus: Lücke · Fähigkeit: schweben
- Ruhig: Ein Planetenmodell im Schulflur: Jeder Planet bekommt sein Nummernschild, gezählt ab der Sonne. Mit dem achten Schild ist die Reihe fertig.
- Sanft: Ein Schild ist heruntergefallen. An welchen Platz gehört es? Das Kind zählt ab der Sonne.
- Abenteuer: Mit dem Ballon schwebt die Runde über mehrere Runden von Planet zu Planet (Fantasiereise, die Sachbilder sind echt). An jedem Platz ein Blick durchs Fernrohr. Die letzte Station ist der dritte Planet: Landung auf dem Schulhof.

**M06 Zahlenpost** · Feuer und Kerzen: Erwachsene holen (`feuer-notruf`) · Kl. 1–4 (Schw. 1) / 1
- Sachgrund: Die Notrufnummer 112 ist ein Name, keine Anzahl; Ziffern lesen und schreiben ist der Lernkern.
- Sache wächst mit: Kl. 1–2: Nummern an Fahrzeugen und Fächern, die 112. Kl. 3–4: große Zahlen der Feuerwehr (Liter im Tank, Meter Schlauch, Einsätze im Jahr).
- Rahmen: Werkstatt · Spannung aus: Durcheinander
- Ruhig: Tag der offenen Tür in der Feuerwache: Fahrzeuge, Spinde und Schläuche bekommen ihre Nummern. Jede geschriebene Zahl bringt ein Ding an seinen Platz, zuletzt kommt die 112 ans Telefon.
- Sanft: Die Feuerwehrfrau sucht den Schlauch aus Fach 47, aber zwei Schilder sind vertauscht (47 und 74). Das Kind hängt sie richtig.
- Abenteuer: Übungstag über mehrere Runden: Die Leitstelle funkt Nummern durch, die Runde stellt das richtige Fahrzeug bereit. Zum Schluss fährt die Drehleiter hoch. Oben sitzt eine Katze und spaziert von selbst herunter. (Kein Brand, kein Notfall.)

**M07 Bündeln** · Die ersten Menschen: Werkzeug, Feuer, Ackerbau (`erste-menschen`) · Kl. 2–4 (Schw. 2) / 3
- Sachgrund: Die ersten Menschen ritzten Kerben in Knochen; Kerben in Zehnergruppen bündeln macht große Mengen lesbar.
- Rahmen: Zeitreise · Spannung aus: Durcheinander · Fähigkeit: in die Zeit reisen
- Ruhig: Zeitreise in ein Dorf der Steinzeit: Die Ernte wird gezählt. Je zehn Kerben werden ein Bündel auf dem Zählstab; am Abend weiß das Dorf, wie viel es hat.
- Sanft: Zwei Familien haben dieselben Körbe gezählt und kommen auf Verschiedenes. Erst gebündelt sieht man, wo sich jemand verzählt hat.
- Abenteuer: Tauschmarkt über mehrere Runden: Ein Nachbardorf kommt mit Fellen und Feuersteinen. Nur wer gebündelt hat, kann vergleichen und tauschen. Am Ende sitzen alle am Feuer (Erwachsene hüten es).

**M08 Stellentafel** · Wünsche, Kaufen, Taschengeld (`wuensche-taschengeld`) · Kl. 1–4 (Schw. 2) / 2
- Sachgrund: Geld ist ein Stellenwertsystem: 1-Euro-Münze, 10-Euro-Schein, 100-Euro-Schein.
- Sache wächst mit: Kl. 1–2: Taschengeld und Preise bis 100 Euro. Kl. 3–4: Klassenkasse und große Anschaffungen der Gemeinde (ein Spielgerät, ein Bus) bis zur Million; Kommaschreibweise bei Euro und Cent.
- Rahmen: Werkstatt · Spannung aus: Vorhersage
- Ruhig: Timo spart auf einen Wunsch. Jeder gelegte Betrag wandert in die Spardose; am Rundenende steht auf dem Zettel, wie viel schon da ist.
- Sanft: Die Kasse am Flohmarkt hat keine Zehner mehr. Das Kind tauscht um, dann geht der Betrag auf.
- Abenteuer: Die Klasse sammelt über mehrere Runden für ein Baumhaus: Flohmarkt, Kuchenstand, Pfandflaschen. Vor jeder Runde wird geschätzt, ob es jetzt reicht. Am Ende wird das Holz bestellt.

**M09 Aufdecken** · Gebirge und das Innere der Erde (`gebirge-vulkane`) · Kl. 2–4 (Schw. 2) / 3
- Sachgrund: Berghöhen vergleichen (Zugspitze, Watzmann, Wendelstein) braucht das Vergleichen großer Zahlen von vorn.
- Rahmen: Reise · Spannung aus: Vorhersage · Fähigkeit: schweben
- Ruhig: Die Runde baut ein Relief der Alpen. Welcher Gipfel ist höher? Stelle für Stelle aufgedeckt, kommt der höhere nach hinten; am Ende steht die Bergkette. (Auf „ruhig“ nur Berge und Höhen.)
- Sanft: Zwei Höhenschilder sind von den Modellen gefallen. Welches gehört zu welchem Berg? Der Vergleich zeigt es. Ab „sanft“ in der Pause: was unter den Bergen liegt.
- Abenteuer: Mit dem Schirm schwebt die Runde über mehrere Runden von Gipfel zu Gipfel, immer zum höheren. Oben ertönt ein Pfiff: ein Murmeltier (Sachbild). In der Pause: wenn ein Vulkan ausbricht, als ruhiger Sachmoment.

**M10 Waage** · Wippe, Hebel, Balkenwaage (`hebel-waage`) · Kl. 1–4 (Schw. 1) / 3 (Abstand 2)
- Sachgrund: Die Balkenwaage ist eine Gleichung: Gleichgewicht heißt gleich viel; Lernkern laut Welt.
- Sache wächst mit: Kl. 1–2: Wippe und Balkenwaage, Gleichgewicht heißt gleich viel. Kl. 3–4: Hebel: Wer weiter außen sitzt, drückt stärker; Waagen im Handel früher und heute.
- Rahmen: Werkstatt · Spannung aus: Vorhersage
- Ruhig: Im Hofladen wird auf der Balkenwaage abgewogen. Steht die Waage im Gleichgewicht, ist die Tüte fertig; am Ende ist die Bestellung gepackt.
- Sanft: Die Wippe auf dem Spielplatz steht schief. Wer muss wohin, damit sie gerade steht? (Sie bewegt sich erst, wenn es passt; niemand fällt.)
- Abenteuer: Über mehrere Runden baut und belädt die Runde ein Floß für den Teich: Nur wenn beide Seiten gleich schwer sind, liegt es gerade. Zum Schluss zieht es am Seil den Picknickkorb ans andere Ufer.

**M11 Flug zur Zahl** · Die lange Zeitleiste des Lebens (`zeitleiste-des-lebens`) · Kl. 1–4 (Schw. 3) / 2
- Sachgrund: Die lange Zeitleiste des Lebens ist ein Zahlenstrahl: große Zahlen werden Längen, Orte auf der Linie werden Zeiten.
- Sache wächst mit: Kl. 1–2: wenige große Bilder auf der Schnur (Fische, Blumen, Menschen ganz am Ende). Kl. 3–4: Millionen Jahre als Längen, Erdzeitalter mit Namen.
- Rahmen: Entdecken · Spannung aus: Lücke · Fähigkeit: schweben
- Ruhig: Die lange Schnur des Lebens liegt über der Wiese. Der Ballon schwebt zu jeder genannten Stelle und hängt dort ein Bild auf (erste Fische, erste Blumen, ganz am Ende die Menschen).
- Sanft: Der Wind hat drei Bilder von der Schnur geweht. An welche Stelle gehören sie zurück?
- Abenteuer: Zeitflug über mehrere Runden: Wo der Ballon landet, schaut die Runde kurz in die Zeit hinein (Urmeer, Farnwald, Mammutsteppe als Sachbilder). Die letzte Landung ist heute, auf der Wiese. In der Pause: warum es keine Dinosaurier mehr gibt.

**M12 Hundertertafel** · Samen gehen auf Reisen (`samen-reisen`) · Kl. 2 / 2
- Sachgrund: Ein Samenbeet in zehn Reihen zu zehn: +10 ist eine Reihe weiter, Samen verschiedener Pflanzen reisen verschieden (Flieger, Kletten).
- Rahmen: Versorgen · Spannung aus: Lücke · Fähigkeit: schrumpfen
- Ruhig: Ein Beet mit hundert Plätzen. Jede richtige Zahl setzt einen Samen; ist eine Reihe voll, keimt sie.
- Sanft: Der Wind hat Flugsamen ins Beet geweht. Auf welchem Platz ist der Löwenzahn gelandet? Das Kind benennt ihn, Lena steckt ein Schild.
- Abenteuer: Die Runde schrumpft mit der Lupenmütze und reist über mehrere Runden mit den Samen: am Schirmchen durch die Luft, als Klette im Fell eines Hundes, im Bach. Jede Landung ist ein Platz auf der Tafel. Am Ende blüht das Beet.

**M13 Schätzen** · Erdteile und Ozeane (`erdteile-ozeane`) · Kl. 2–4 (Schw. 4) / 2
- Sachgrund: Erdteile und Ozeane sind riesig verschieden groß; Schätzen mit Teilfragen ist die einzige Möglichkeit, solche Mengen zu fassen.
- Sache wächst mit: Kl. 2: Mengen bis 100 (Plättchen auf dem Globus, Tiere im Bild). Kl. 3–4: sehr große Zahlen (Einwohner, Kilometer, Vogelschwärme) mit Teilfragen.
- Rahmen: Forschen · Spannung aus: Vorhersage · Fähigkeit: schweben
- Ruhig: Die Runde belegt einen Globus mit Plättchen: Wie viele braucht das Meer, wie viele das Land? Erst schätzen, dann eine Reihe zählen, hochrechnen und legen.
- Sanft: Die Schachtel reicht vielleicht nicht mehr für Afrika. Erst schätzen: Reicht es? Dann zeigt es sich.
- Abenteuer: Reise um die Erde über mehrere Runden, mit dem Schirm von oben gesehen: Pinguine auf dem Eis, Zebras in der Steppe, Fische im Schwarm. Geschätzt wird alles, gezählt nur ein Ausschnitt. Am Ende ist das Reisebuch voll.

**M14 Zwei Tonnen** · Müll trennen (`muell-trennen`) · Kl. 1 / 1
- Sachgrund: Müll kommt in verschiedene Tonnen; sieben Teile auf zwei Tonnen verteilen ist Zerlegen.
- Rahmen: Versorgen · Spannung aus: Lücke
- Ruhig: Nach dem Picknick kommen die Dinge von der Decke in zwei Tonnen. Jede Zerlegung leert die Decke in die zwei Tonnen und steht danach in der Liste; am Ende ist die Wiese sauber.
- Sanft: Ein Sack ist zugeknotet: Sieben Teile waren es, vier liegen in der Papiertonne. Wie viele sind im Sack? Aufgeknotet zeigt es sich.
- Abenteuer: Über mehrere Runden baut die Runde aus dem Gesammelten (Dosen, Kartons, Korken) eine Figur fürs Schulfest; jede Zerlegung liefert zwei Sorten Teile. Im Bauch der fertigen Figur scheppert noch etwas: eine vergessene Fahrradklingel.

**M15 Mach voll** · Obst und Gemüse und wann es reif ist (`obst-gemuese-reif`) · Kl. 1–4 (Schw. 1) / 2
- Sachgrund: Äpfel werden im Herbst reif und in Kisten zu 10 und 100 gepackt; Ergänzen heißt Kiste voll machen.
- Rahmen: Versorgen · Spannung aus: Lücke
- Ruhig: Apfelernte auf der Streuobstwiese. Jede Ergänzung füllt eine Kiste; volle Kisten kommen auf den Wagen.
- Sanft: Eine Kiste ist auf dem Weg aufgegangen. Wie viele Äpfel fehlen, bis sie wieder voll ist? Sie liegen im Gras daneben.
- Abenteuer: Mostfest über mehrere Runden: von der Wiese zur Presse zum Fass. Jede Füllung der Presse braucht genau hundert. In der letzten Runde fließt der Saft. Im Fass gluckert es: nur eine Luftblase.

**M16 Aufgabenfamilie** · Haustiere und was sie brauchen (`haustiere`) · Kl. 1–2 (Schw. 1) / 1
- Sachgrund: Meerschweinchen leben in Gruppen und brauchen ein Häuschen; wer im Häuschen und wer draußen ist, gibt die Aufgabenfamilie.
- Rahmen: Versorgen · Spannung aus: Wissensvorsprung
- Ruhig: Das Meerschweinchen-Gehege: Einige sitzen im Häuschen, einige draußen. Das Kind baut die vier Aufgaben der Familie; dann hebt Lena das Häuschen an und man sieht, dass es stimmt. Danach gibt es Heu.
- Sanft: Eines fehlt in der Zählung. Aus der Aufgabe weiß das Kind schon, wie viele im Häuschen sein müssen: Es sitzt im Heutunnel.
- Abenteuer: Über mehrere Runden baut die Runde ein Außengehege mit Röhren und Verstecken. In jeder Runde sitzen die Tiere woanders, und die Aufgabenfamilie verrät, wie viele wo sind. Aus einem Karton quiekt es: Eines hat sich ein Nest aus Heu gebaut.

**M17 Was passiert?** · Tiere im Winter, Frühblüher, Herbstfrüchte (`jahreszeiten-natur`) · Kl. 1–3 (Schw. 1) / 1
- Sachgrund: Im Winter kommen Vögel ans Futterhaus und fliegen wieder weg; Dazu und Weg sind Plus und Minus.
- Rahmen: Forschen · Spannung aus: Verwandlung
- Ruhig: Am Futterhaus im Winter: Vögel kommen und fliegen weg. Das Kind baut die Rechnung zur Szene; sie läuft noch einmal ab und kommt ins Beobachtungsheft.
- Sanft: Auf einmal fliegen alle auf. Wie viele waren es eben? Ein Eichhörnchen holt sich eine Nuss, dann kommen sie wieder.
- Abenteuer: Ein Jahr am selben Baum, über mehrere Runden: Zugvögel kommen zurück, Blüten gehen auf, Äpfel fallen, Blätter fallen. Im Herbst raschelt es im Laubhaufen: Ein Igel sucht sein Winterquartier.

**M18 Wie viel mehr?** · Vom Baby bis heute (`lebenskette`) · Kl. 1–2 (Schw. 2) / 1
- Sachgrund: Altersunterschiede bleiben gleich, auch wenn alle älter werden; die Lebenskette zeigt Jahre als Länge.
- Rahmen: Zeitreise · Spannung aus: Rätsel · Fähigkeit: in die Zeit reisen
- Ruhig: Die Runde legt Lebensketten, eine Perle je Jahr: für sich, die Schwester, den Opa. Der Unterschied zwischen zwei Ketten wird ein Band zwischen zwei Fotos.
- Sanft: Ein Foto im Album hat keine Jahreszahl. Wie alt war Opa, als Mama geboren wurde? Der Unterschied verrät, wohin es gehört.
- Abenteuer: Mit der Zeituhr besucht die Runde über mehrere Runden Kofis Opa als Kind, als Lehrling, als Papa. Der Altersunterschied zu seiner Schwester bleibt immer gleich. Am Ende sitzen beide heute auf der Bank.

**M19 Spiegel** · Insel und See, Halbinsel und Bucht (`land-und-wasser`) · Kl. 1–3 (Schw. 1) / 2
- Sachgrund: Im stillen Wasser spiegelt sich das Ufer: Alles ist doppelt da. Insel und See sind Gegenstücke (Land im Wasser, Wasser im Land); die Bucht nimmt auf, was die Halbinsel gibt.
- Rahmen: Entdecken · Spannung aus: Verwandlung
- Ruhig: Am stillen See: Was am Ufer steht, steht noch einmal im Wasser. Das Kind sagt, wie viele es mit Spiegelbild sind; dann wird das Wasser glatt und zeigt es.
- Sanft: Ein Windstoß kräuselt den See, das Spiegelbild ist weg. Wie viele waren es zusammen? Der Wind legt sich.
- Abenteuer: Mit dem Ruderboot (flaches Wasser, Schwimmwesten, Lenas Mama rudert) über mehrere Runden von Insel zu Insel: Jede hat eine Bucht, die genau die Hälfte fasst. Auf der letzten blinkt etwas im Sand: ein Taschenspiegel, mit dem jemand Leuchtturm gespielt hat.

**M20 Streifenbrett** · Mein Schulweg (`schulweg`) · Kl. 1 / 1
- Sachgrund: Der Schulweg besteht aus Wegstücken (bis zur Ampel, bis zum Tor); Streifen aneinanderlegen ist Plus.
- Rahmen: Reise · Spannung aus: Durcheinander
- Ruhig: Die Runde legt den Schulweg als Streifen nach: von der Tür zur Ampel, von der Ampel zum Tor. Jedes Ergebnis legt ein Wegstück; am Schultor klingelt es.
- Sanft: Eine Baustelle sperrt ein Wegstück. Welche zwei Streifen ergeben den Weg außen herum?
- Abenteuer: Wege-Forscher über mehrere Runden: Jedes Kind der Runde kommt anders zur Schule (zu Fuß, mit dem Rad, mit dem Bus, Timo über die Rampe). Alle Wege werden in Streifen gelegt. Am Ende hängt der Plan im Flur und zeigt, wo sich die Wege treffen.

**M21 Über die Zehn** · Zähne und wie man sie pflegt (`zaehne`) · Kl. 1 / 1
- Sachgrund: Ein Milchgebiss hat zwanzig Zähne, zehn oben und zehn unten: das Zwanzigerfeld ist das Gebiss.
- Rahmen: Entdecken · Spannung aus: Verwandlung · Fähigkeit: schrumpfen
- Ruhig: Beim Zahnarzt am großen Gebissmodell: oben zehn, unten zehn. Erst wird die obere Reihe voll geputzt, dann geht es unten weiter.
- Sanft: Lena hat einen Wackelzahn. Wie viele Zähne sind es, wenn er draußen ist? Und wenn der neue da ist?
- Abenteuer: Zahnforscher über mehrere Runden: Die Runde schrumpft und geht durch das Gebissmodell wie durch eine Halle mit weißen Felsen. Hinter dem letzten Backenzahn drückt schon ein neuer von unten.

**M22 Eine Perle leihen** · Um Hilfe bitten, helfen, Danke sagen (`hilfe-und-danke`) · Kl. 1–2 (Schw. 2) / 1
- Sachgrund: Wer sich etwas leiht, bittet, dankt und gibt es zurück; die geliehene Perle wird zurückgegeben.
- Rahmen: Miteinander · Spannung aus: Hilfe
- Ruhig: Timo fädelt eine Kette, eine Perle fehlt zur vollen Zehn. Ela leiht ihm eine; er rechnet, gibt sie zurück und lächelt.
- Sanft: Die geliehene Perle ist vom Tisch gerollt. Ohne Zurückgeben stimmt das Ergebnis nicht. Sie liegt unterm Stuhl.
- Abenteuer: Die Leihkiste der Straße, über mehrere Runden: Die Runde richtet einen Schrank ein, aus dem sich Nachbarn Dinge leihen (Leiter, Waffeleisen, Luftpumpe). Jede Rechnung ist ein Ausleihen und Zurückbringen. Am Ende klebt ein Dankeszettel ohne Namen an der Tür; er ist von der Hausmeisterin.

**M23 Klein und groß** · Burg, Kloster, Schloss (`burg-kloster-schloss`) · Kl. 1–4 (Schw. 2) / 2
- Sachgrund: Burgen wurden mit Modellen und Plänen geplant; das Modell aus Klötzen (3 + 4) entspricht dem echten Bau (30 + 40 Steine).
- Sache wächst mit: Kl. 1–2: Modell und echter Bau, Tor, Turm, Mauer. Kl. 3–4: wie viele Menschen und Jahre ein Burgbau brauchte, Maße und Mengen in Tausendern.
- Rahmen: Bauen · Spannung aus: Verwandlung · Fähigkeit: schrumpfen
- Ruhig: Im Burgmuseum steht ein Modell aus Klötzen. Die kleine Aufgabe baut das Modell, die große das echte Mauerstück daneben.
- Sanft: Am Modell fehlt ein Turm. Erst wird er klein gebaut, dann zeigt die große Rechnung, wie viele Steine der echte braucht.
- Abenteuer: Die Runde schrumpft und geht über mehrere Runden durch das Modell: Tor, Hof, Brunnen, Turm. Aus dem Keller kommt ein Klappern: Der Museumswärter sortiert Schlüssel. Am Ende sind alle wieder groß und stehen vor der echten Burg.

**M24 Rechenstrich** · Wald und Teich (`wald-und-teich`) · Kl. 2–3 (Schw. 2) / 3
- Sachgrund: Erdkröten und Frösche wandern im Frühjahr in vielen Etappen vom Wald zu dem Teich, in dem sie geschlüpft sind; Menschen helfen ihnen an Straßen mit Zäunen und Eimern. Etappen mit Rast sind der Rechenstrich.
- Rahmen: Reise · Spannung aus: Hilfe
- Ruhig: Am Teich springt ein Frosch von Blatt zu Blatt ans andere Ufer. Jede Etappe auf dem Rechenstrich ist ein Sprung.
- Sanft: Ein Sprung ist zu weit. Der Frosch braucht einen Halt am Zehnerblatt; mit zwei Sprüngen kommt er an.
- Abenteuer: Krötenwanderung über mehrere Runden, am Abend mit Warnweste, Lampe und der Naturschützerin: Die Runde trägt Kröten im Eimer vom Zaun über die Straße zum Teich. Jede Etappe ist ein Stück Weg. Am Ende plumpst es im Wasser.

**M25 Welcher Weg?** · Zu Fuß, mit Rad, Bus und Bahn (`unterwegs`) · Kl. 2–3 (Schw. 3) / 1
- Sachgrund: Unterwegs gibt es mehrere Wege (zu Fuß, Rad, Bus, Fähre); den passenden wählen ist wie den Rechenweg wählen.
- Sache wächst mit: Kl. 2: Wege im Ort. Kl. 3: Fahrpläne, Umsteigen, Wege mit Fähre und Bahn durchs Land.
- Rahmen: Reise · Spannung aus: Durcheinander
- Ruhig: Ausflug zum See: zu Fuß, mit dem Rad oder mit dem Bus? Das Kind wählt einen Rechenweg und geht ihn; danach liegen alle Wege nebeneinander auf der Karte.
- Sanft: Die Brücke ist gesperrt. Es gibt einen anderen Weg. Welcher hat weniger Schritte?
- Abenteuer: Über mehrere Runden quer durchs Land zu Timos Tante: Bahn, Fähre, Seilbahn. An jeder Station wählt das Kind neu. Die Fähre legt im Nebel ab, das Horn tutet, drüben scheint die Sonne.

**M26 Markenspiel** · Wie Kleidung hergestellt wird (`kleidung`) · Kl. 2–4 (Schw. 3) / 4
- Sachgrund: In der Kleiderfabrik liegen Knöpfe einzeln, auf Karten zu 10 und in Schachteln zu 100; schriftliches Rechnen ist Lagerarbeit.
- Rahmen: Werkstatt · Spannung aus: Lücke
- Ruhig: Im Lager der Schneiderei: Knöpfe einzeln, auf Karten zu zehn, in Schachteln zu hundert. Jede Rechnung packt einen Auftrag.
- Sanft: Für einen Auftrag reichen die einzelnen Knöpfe nicht. Eine Karte muss aufgemacht werden.
- Abenteuer: Kostüme fürs Stadttheater über mehrere Runden: Vom Stoffballen bis zur Premiere rechnet die Runde Knöpfe, Borten und Meter. Am Premierenabend fehlt ein Kostüm. Die Schauspielerin hat es schon an.

**M27 Gleiche Sprünge** · Woche, Monat, Jahr (`jahreskreis`) · Kl. 1–3 (Schw. 1) / 1
- Sachgrund: Eine Woche hat sieben Tage; jeder Montag liegt sieben weiter (1, 8, 15, 22): Siebenersprünge im Kalender.
- Sache wächst mit: Kl. 1: Wochentage und Siebenersprünge im Monat. Kl. 3: Sprünge über das Jahr, Schaltjahr, wie oft etwas im Jahr vorkommt.
- Rahmen: Versorgen · Spannung aus: Lücke
- Ruhig: Der Gießdienst kommt jeden Montag. Das Kind setzt die Sprünge im Kalender fort; jeder Sprung markiert den nächsten Montag.
- Sanft: Ein Kalenderblatt ist herausgefallen. Welcher Montag fehlt? Die Folge verrät es.
- Abenteuer: Die Runde plant über mehrere Runden ein ganzes Gartenjahr: alle sieben Tage gießen, alle vierzehn mähen, alle dreißig umgraben. Fallen zwei Sprünge auf denselben Tag, läutet die Gartenglocke. Am Ende des Jahres ist Erntefest.

**M28 Muster-Päckchen** · Türme, die fest stehen (`tuerme-bauen`) · Kl. 1–4 (Schw. 2) / 1
- Sachgrund: Treppen wachsen regelmäßig: jede Stufe ein Würfel mehr; Päckchen mit Muster sind solche Treppen.
- Rahmen: Bauen · Spannung aus: Durcheinander
- Ruhig: Eine Treppe am Turm: Jede Zeile des Päckchens setzt eine Stufe, immer ein Würfel mehr.
- Sanft: Die Treppe hat einen Knick. Welche Aufgabe stört das Muster? Herausgenommen, findet sie ihren Platz.
- Abenteuer: Ein Aussichtsturm über mehrere Runden: Mit jedem Päckchen wächst die Treppe ein Stockwerk. Ganz oben fehlen drei Würfel. Kofi hat sie schon als Geländer verbaut. Von dort sieht man bis zum Fluss.

**M29 Zahlenmaschine** · Der Weg des Wassers (`wasserkreislauf`) · Kl. 1–4 (Schw. 2) / 3
- Sachgrund: Ein Bach wird auf seinem Weg zum Meer größer: Jeder Zufluss bringt Wasser dazu, jede Ableitung nimmt etwas weg. Die Stationen hintereinander sind die Maschinenkette; rückwärts geht es zur Quelle.
- Sache wächst mit: Kl. 1–2: Bach, Zufluss, See. Kl. 3–4: der ganze Weg des Wassers (verdunsten, Wolke, Regen, Quelle, Fluss, Meer).
- Rahmen: Forschen · Spannung aus: Rätsel
- Ruhig: Die Runde baut am Sandtisch einen Bachlauf mit Zuflüssen. Jede Station verändert die Wassermenge; kommt unten die richtige Menge im See an, läuft das Wasser.
- Sanft: Unten kommt weniger an als gedacht. Welche Station ist anders eingestellt? Rückwärts gerechnet findet man sie.
- Abenteuer: Von der Mündung zur Quelle, über mehrere Runden bachaufwärts: An jedem Zufluss rechnet die Runde rückwärts. Ganz oben gluckst es unter einem Stein. Dort kommt das Wasser aus dem Berg.

**M30 Zahlenmauer** · Burg, Kloster, Schloss (`burg-kloster-schloss`) · Kl. 1–4 (Schw. 1) / 2
- Sachgrund: Burgmauern stehen fest, weil Steine versetzt aufeinander lasten; die Zahlenmauer ist eine solche Mauer.
- Sache wächst mit: Kl. 1–2: Mauer, Turm, Tor. Kl. 3–4: wie Burgen geplant und über Jahrzehnte gebaut wurden, Mauerstärken und Höhen als große Zahlen.
- Rahmen: Bauen · Spannung aus: Rätsel
- Ruhig: Die Burgmauer wird ausgebessert. Jeder Stein trägt die zwei darunter; passt er, lässt er sich verfugen.
- Sanft: Für die Lücke oben gibt es nur einen bestimmten Deckstein. Welche Grundsteine braucht es darunter?
- Abenteuer: Über mehrere Runden vom Tor bis zum Turm: Hinter einer Mauer klingt es hohl. Stein für Stein kommt eine Nische frei. Darin steht ein Krug mit Murmeln, die Kinder vor langer Zeit versteckt haben.

**M31 Rechendreieck** · Brücken, die tragen (`bruecken`) · Kl. 1–3 (Schw. 1) / 3 (Abstand 2)
- Sachgrund: Dreiecke machen Brücken fest (Fachwerk); im Rechendreieck tragen die Ecken zusammen die Seite.
- Sache wächst mit: Kl. 1: Ein Viereck aus Stäben wackelt, ein Dreieck nicht. Kl. 3: Last, Stützen und Brückenarten.
- Rahmen: Bauen · Spannung aus: Vorhersage
- Ruhig: Eine Fachwerkbrücke über den Bach: Jedes gelöste Dreieck wird ein Feld der Brücke. Ist sie fertig, rollt der Bollerwagen hinüber.
- Sanft: Die Brücke liegt noch am Boden und hängt in der Mitte durch. Ein Dreieck fehlt; eingesetzt, steht sie gerade.
- Abenteuer: Brückenbau über mehrere Runden: erst ein Steg, dann eine Brücke für den Bollerwagen, zuletzt eine für das Lastenrad. Vor jeder Probe wird vorhergesagt: Hält sie? Getestet wird mit Sandsäcken, nie mit Kindern.

**M32 Zauberquadrat** · Jahr, Jahrzehnt, Jahrhundert (`jahrhunderte`) · Kl. 3 / 4
- Sachgrund: Zauberquadrate sind alt: Albrecht Dürer stach 1514 eines, die Jahreszahl steht darin; Jahrhunderte zählen.
- Rahmen: Zeitreise · Spannung aus: Rätsel · Fähigkeit: in die Zeit reisen
- Ruhig: Zeitreise in eine Werkstatt im Jahr 1514: Auf einem Bild von Albrecht Dürer steht ein Zahlenquadrat. Jedes ergänzte Feld macht das Bild schärfer; unten in der Mitte steht die Jahreszahl.
- Sanft: Ein Fleck auf dem Blatt verdeckt zwei Zahlen. Die Summen der Reihen verraten sie.
- Abenteuer: Über mehrere Runden durch die Jahrhunderte: ein Quadrat aus China, eines aus Indien, eines von Dürer. Jedes öffnet eine Schublade im Zeitschrank. In der letzten liegt ein leeres Quadrat für das eigene.

**M33 Stimmt das?** · Was Magnete anziehen (`magnete`) · Kl. 1–4 (Schw. 2) / 3
- Sachgrund: Magnete ziehen Eisen an, aber nicht jedes Metall (Alu, Kupfer): Vermutungen prüfen und Gegenbeispiele finden.
- Sache wächst mit: Kl. 1–2: Was hält der Magnet, was nicht? Kl. 3–4: Pole, Anziehen und Abstoßen, der Kompass.
- Rahmen: Forschen · Spannung aus: Rätsel
- Ruhig: Lenas Forscherheft: „Alle Metalle hängen am Magneten.“ Jede Behauptung wird mit Material geprüft und kommt in das Fach immer, manchmal oder nie.
- Sanft: Im Briefkasten liegt ein Zettel mit einer seltsamen Behauptung, ohne Namen. Stimmt sie? Geprüft, zeigt sich auch, wer sie geschrieben hat: Timo, zum Testen.
- Abenteuer: Rätsel auf dem Dachboden über mehrere Runden: eine Kiste voller Zettel, jeder behauptet etwas. Was stimmt, führt zur nächsten Kiste. Die letzte geht nicht auf: Ein Magnet hält den Deckel von innen.

**M34 So geht es** · Wie Erfindungen sich verändern (`erfindungen`) · Kl. 1–4 (Schw. 2) / 3
- Sachgrund: Erfindungen werden nach Anleitungen gebaut und verbessert (Rad, Laufrad, Fahrrad); Fachwörter und Reihenfolge der Anleitung sind der Lernkern.
- Sache wächst mit: Kl. 1–2: Rad, Laufrad, Fahrrad. Kl. 3–4: wie eine Erfindung die nächste möglich macht (Rad, Zahnrad, Uhr, Motor).
- Rahmen: Werkstatt · Spannung aus: Durcheinander · Fähigkeit: in die Zeit reisen
- Ruhig: Im Erfinderzimmer wird ein Laufrad nach Anleitung gebaut. Jeder richtig geordnete Schritt baut ein Teil an; am Ende rollt es.
- Sanft: Die Anleitung ist zerrissen, zwei Schritte sind vertauscht. Ela baut genau, was dasteht: Das Rad sitzt am Lenker. Neu geordnet, passt es.
- Abenteuer: Mit der Zeituhr über mehrere Runden: Rad, Laufrad, Hochrad, Fahrrad. Jede Erfindung braucht ihre Anleitung in der richtigen Reihenfolge. Am Ende fährt die Runde auf dem Hof (Helm auf).

**M35 Tüten packen** · Tiere auf Wiese und Hecke (`wiese-und-hecke`) · Kl. 2–3 (Schw. 2) / 1
- Sachgrund: Käfer haben sechs Beine, Spinnen acht: gleich große Gruppen beim Zählen in der Hecke.
- Sache wächst mit: Kl. 2: Beine zählen in Gruppen. Kl. 3: Wer lebt wovon in der Hecke, Bestände über das Jahr.
- Rahmen: Forschen · Spannung aus: Lücke · Fähigkeit: schrumpfen
- Ruhig: Hecken-Zählung: Käfer haben sechs Beine, Spinnen acht. Die Bildkärtchen kommen in Tütchen zu gleich vielen Beinen, jedes Tütchen ins Zählheft.
- Sanft: Ein Kärtchen bleibt übrig: ein Tier mit vierzehn Beinen. Die Assel braucht eine eigene Tüte.
- Abenteuer: Die Runde schrumpft und wandert über mehrere Runden durch die Hecke: an der Ameisenstraße entlang, unter einem Spinnennetz hindurch, an einem Schneckenhaus vorbei. Gezählt wird in Gruppen. Am Ende werden alle wieder groß und hängen das Zählblatt auf.

**M36 Punktefeld** · Das Klassenzimmer von oben (`von-oben`) · Kl. 2–4 (Schw. 2) / 1
- Sachgrund: Von oben sieht man die Tische im Klassenzimmer in Reihen und Spalten: das Punktefeld.
- Sache wächst mit: Kl. 2: Reihen und Spalten im Klassenzimmer. Kl. 3–4: Draufsichten von Schule, Parkplatz und Feld, Felder mit Hunderten von Plätzen.
- Rahmen: Entdecken · Spannung aus: Verwandlung · Fähigkeit: riesig werden
- Ruhig: Das Klassenzimmer von oben: Tische in Reihen. Jede Malaufgabe stellt eine Tischgruppe; ist der Raum fertig, kommen die anderen Kinder herein.
- Sanft: Vier Kinder kommen dazu. Eine Reihe mehr oder eine Spalte mehr? Die Nachbaraufgabe zeigt es.
- Abenteuer: Mit den Riesenstiefeln schaut die Runde über mehrere Runden von oben auf Schule, Parkplatz, Obstwiese und Stadion: überall Reihen. Am Ende liegt da ein Feld, das von oben ein Bild ergibt. Bäuerin Aylin hat ein Muster gesät.

**M37 Kettenhüpfer** · Tiere auf Wiese und Hecke (`wiese-und-hecke`) · Kl. 2–4 (Schw. 2) / 1
- Sachgrund: Tiere in Wiese und Hecke haben gleich viele Beine je Art (Vogel 2, Hase 4, Käfer 6, Spinne 8): Einmaleinsreihen.
- Sache wächst mit: Kl. 2: Beine je Tier als Einmaleinsreihen. Kl. 3–4: Zählungen wie bei echten Naturschutz-Zählungen, Teiler und Vielfache in den Listen.
- Rahmen: Forschen · Spannung aus: Rätsel
- Ruhig: Hecken-Beobachtung: Vögel haben zwei Beine, Hasen vier, Käfer sechs, Spinnen acht. Jeder Hüpfer auf der Kette zählt ein Tier weiter; die Gruppe kommt ins Heft.
- Sanft: Im Heft steht „48 Beine“, aber nicht, von wem. Auf welchen Ketten hat die 48 ein Pfeilchen? Es waren Käfer.
- Abenteuer: Abendzählung über mehrere Runden mit der Naturschützerin: In der Dämmerung kommen andere Tiere. Es knackt im Gebüsch. Ein Reh schaut heraus und geht weiter. Am Ende steht die Jahresliste der Hecke.

**M38 Gerecht verteilen** · Gerecht teilen und abwechseln (`gerecht-teilen`) · Kl. 2–4 (Schw. 4) / 2
- Sachgrund: Gerecht teilen ist Lernkern der Welt: gleich viel für jeden, der Rest wird abgewechselt.
- Sache wächst mit: Kl. 2: reihum verteilen am Tisch. Kl. 3–4: große Mengen für Klasse und Schule; was „gerecht“ heißt, wenn es nicht aufgeht (Rest teilen, abwechseln, losen).
- Rahmen: Miteinander · Spannung aus: Hilfe
- Ruhig: Picknick: Kekse und Trauben reihum auf alle Teller. Hat jeder gleich viel, wird gegessen; der Rest bleibt in der Mitte.
- Sanft: Zwei Gäste kommen später dazu. Neu verteilt: Wie viel bekommt jetzt jeder, was bleibt?
- Abenteuer: Das Schulfest über mehrere Runden: erst Kekse für die Runde, dann Brezen für die Klasse, dann Lose für die ganze Schule. Was nicht aufgeht, wird getauscht. Am Ende bleibt eine Breze übrig; sie wird in vier Teile geschnitten.

**M39 Mal-Marken** · Wie Kleidung hergestellt wird (`kleidung`) · Kl. 4 / 4
- Sachgrund: Kleidung wird in großen Mengen hergestellt (Knöpfe je Hemd, Hemden je Karton); schriftlich malnehmen.
- Rahmen: Werkstatt · Spannung aus: Hilfe
- Ruhig: Eine Großbestellung in der Schneiderei: Hemden für einen Chor, jedes mit sieben Knöpfen. Jede Rechnung packt einen Karton.
- Sanft: Der Chor hat Verstärkung bekommen: zwölf Hemden mehr. Wie viele Knöpfe sind es jetzt?
- Abenteuer: Vom Schaf zum Pullover über mehrere Runden: Schur, Spinnerei, Strickerei, Laden. An jeder Station wird im Großen gerechnet. Am Ende trägt die Runde Mützen aus der Wolle, die sie begleitet hat.

**M40 Die Rechenfrage** · Wer an meinem Brot mitgearbeitet hat (`wer-macht-mein-brot`) · Kl. 1–3 (Schw. 2) / 2
- Sachgrund: Vom Korn zum Brot arbeiten viele mit (Bäuerin, Müller, Bäckerin); jede Station stellt Rechenfragen.
- Rahmen: Werkstatt · Spannung aus: Lücke
- Ruhig: Ein Morgen in der Bäckerei: Die Bäckerin braucht Antworten (wie viele Brezen, wie viel Mehl). Das Kind findet die Frage und nimmt nur die Zahlen, die es braucht; dann wird gebacken.
- Sanft: Eine Angabe fehlt: Niemand weiß, wie viele Kinder zum Fest kommen. Das Kind tippt „geht nicht“, und Kofi fragt nach.
- Abenteuer: Dem Brot hinterher, über mehrere Runden rückwärts: Bäckerei, Mühle, Feld. An jeder Station gibt es eine Frage mit zu vielen Zahlen. In der Mühle rumpelt es: Das Mühlrad läuft an, und die Müllerin macht Licht.

**M41 Skizze** · Ackerbau, Hausbau, Handwerk (`ackerbau-hausbau`) · Kl. 2–3 (Schw. 3) / 3
- Sachgrund: Ein Acker oder Haus wird mit Maßen geplant; die Skizze verhindert Fehler wie die Zaunpfahl-Falle.
- Rahmen: Bauen · Spannung aus: Vorhersage · Fähigkeit: in die Zeit reisen
- Ruhig: Ein Zaun für den Gemüseacker. Die Skizze zeigt, wie viele Pfähle es braucht; dann wird gebaut, und man sieht, ob sie reichen.
- Sanft: Am Ende fehlt ein Pfahl. Die Skizze wird verbessert (ein Pfahl mehr als Felder), der Zaun geht zu.
- Abenteuer: Mit der Zeituhr hilft die Runde über mehrere Runden beim Hausbau wie früher: Balken, Gefache, Dach. Jede Skizze wird gebaut. Beim Richtfest hängt ein Kranz am Giebel.

**M42 Ungefähr** · Werbung und was sie will (`werbung`) · Kl. 3–4 (Schw. 4) / 3
- Sachgrund: Werbung zeigt Preise so, dass sie klein wirken; überschlagen zeigt, ob das Geld reicht (sachlich, ohne Haltung).
- Rahmen: Werkstatt · Spannung aus: Vorhersage
- Ruhig: Einkauf fürs Klassenfest mit festem Geld: Prospekt lesen, überschlagen, dann rechnen. Liegt das Ergebnis im Bereich, kommt die Ware in den Korb.
- Sanft: Im Prospekt steht „nur 1,99“. Sechs Stück: Reicht das Geld? Der Überschlag zeigt: knapp.
- Abenteuer: Ein eigener Marktstand über mehrere Runden: Die Klasse verkauft selbst und schreibt Preisschilder. Wie wirken 2 Euro und 1,99 Euro? Am Ende wird die Kasse erst überschlagen, dann gezählt. Es reicht für den Ausflug. (Sachlich, ohne Haltung zum Kaufen.)

**M43 Der Laden** · Was in Lebensmitteln steckt (`was-im-essen-steckt`) · Kl. 1–3 (Schw. 2) / 2
- Sachgrund: Lebensmittel haben Preise und Etiketten mit Inhaltsstoffen; einkaufen heißt Geld legen.
- Rahmen: Werkstatt · Spannung aus: Hilfe
- Ruhig: Frühstückseinkauf am Kiosk. Jeder gelegte Betrag bringt die Ware in den Korb; das Etikett zeigt, was darin steckt.
- Sanft: Eine Kundin zahlt mit einem großen Schein. Das Kind gibt Rückgeld, indem es vom Preis aus hochlegt.
- Abenteuer: Wochenmarkt über mehrere Runden: Für ein Rezept braucht die Runde Zutaten von fünf Ständen und hat nur einen Schein. An einem Stand gibt es etwas Unbekanntes zum Probieren. Es ist Kohlrabi.

**M44 Messen** · Wachsen und sich verändern (`wachsen`) · Kl. 1–3 (Schw. 2) / 3
- Sachgrund: Kinder wachsen; man misst die Körpergröße in Zentimetern an der Messlatte.
- Sache wächst mit: Kl. 1–2: sich an der Messlatte messen, wer ist gewachsen. Kl. 3: wie Körper wachsen (Knochen, Zähne), Wachstum in Tabellen.
- Rahmen: Forschen · Spannung aus: Vorhersage
- Ruhig: Die Messlatte am Türrahmen: Jedes Kind wird gemessen und mit dem Strich vom letzten Jahr verglichen.
- Sanft: Ein Strich ist verwischt, und Timo wird im Sitzen gemessen. Wie misst man so, dass es stimmt? Bei der Null anlegen.
- Abenteuer: Was wächst wie schnell? Über mehrere Runden misst die Runde Bohnenranke, Fingernagel, Welpe und Sonnenblume und sagt vorher, wer vorn liegt. Am Ende ist die Sonnenblume größer als alle Kinder.

**M45 Wiegen** · Steine, Sand und Boden (`steine-boden`) · Kl. 3 / 2
- Sachgrund: Steine, Sand und Erde sind verschieden schwer; Gramm und Kilogramm sind ihre Maße.
- Rahmen: Forschen · Spannung aus: Vorhersage
- Ruhig: Lenas Steinsammlung wird gewogen: erst schätzen, dann ausgleichen. Jeder gewogene Stein kommt mit Schild in sein Fach.
- Sanft: Zwei Steine sind gleich groß, aber einer ist viel leichter. Die Waage zeigt es: Bimsstein ist voller Löcher.
- Abenteuer: Im Steinbruch über mehrere Runden, mit Helm und Führung: vom Kiesel bis zum Block, der so viel wiegt wie ein Auto. In einem aufgeschlagenen Stein glitzert es: Kristalle (Sachbild).

**M46 Umfüllen** · Wasser sparen und sauber halten (`wasser-sauber`) · Kl. 3 / 3
- Sachgrund: Wasser wird in Litern gemessen; wer weiß, wie viel ein Eimer und eine Gießkanne fasst, kann sparen.
- Rahmen: Versorgen · Spannung aus: Vorhersage
- Ruhig: Regenwasser aus der Tonne in die Gießkannen: Jedes Beet braucht seine Menge. Stimmt sie, wird gegossen.
- Sanft: Die Tonne ist fast leer. Reicht es für alle Beete? Erst schätzen, dann umfüllen.
- Abenteuer: Wassermeister über mehrere Runden: Die Runde misst, wie viel Wasser ein Tag braucht (Hände waschen, Blumen, Trinken), und baut eine Regenrinne zur Tonne. Nach dem Regen wird gemessen, wie viel zusammengekommen ist. (Sachlich, ohne Haltung.)

**M47 Die Uhr** · Tag und Nacht, Sonne und Erde (`tag-und-nacht`) · Kl. 1–2 (Schw. 2) / 1
- Sachgrund: Die Sonne steht morgens tief und mittags hoch; die Uhr teilt Tag und Nacht in Stunden.
- Rahmen: Forschen · Spannung aus: Rätsel · Fähigkeit: schweben
- Ruhig: Ein Tag mit der Sonne: Jede gestellte Uhrzeit lässt die Sonne an ihren Platz wandern, vom Morgen bis zum Abend.
- Sanft: Die Uhr im Flur ist stehen geblieben. Der Schatten am Stab im Hof zeigt, wie spät es ist; das Kind stellt sie.
- Abenteuer: Eine Sonnenuhr über mehrere Runden: Die Runde baut sie im Hof und markiert jede volle Stunde. Dann schwebt sie mit dem Ballon so hoch, dass man sieht, wo auf der Erde gerade Nacht ist (Sachbild).

**M48 Wie lange?** · Was man bei Gewitter tut (`gewitter`) · Kl. 2–3 (Schw. 3) / 1
- Sachgrund: Nach dem letzten Donner wartet man eine halbe Stunde, bevor man wieder hinausgeht. Wer die Sekunden zwischen Blitz und Donner zählt, merkt, ob das Gewitter näher kommt oder wegzieht. Zeitspannen messen ist hier die Handlung.
- Sache wächst mit: Kl. 2: warten und Zeitspannen in Minuten. Kl. 3: Sekunden zählen, warum man den Donner später hört als man den Blitz sieht.
- Rahmen: Forschen · Spannung aus: Vorhersage
- Ruhig: Es regnet, die Runde ist drinnen und backt. Wie lange noch, bis der Kuchen fertig ist? Jede Zeitspanne rückt den Zeiger; am Ende wird gegessen.
- Sanft: In der Ferne grummelt es. Die Runde wartet drinnen die halbe Stunde nach dem letzten Donner ab; das Kind rechnet, wann es wieder hinausgeht.
- Abenteuer: Gewitterforscher am Fenster über mehrere Runden, mit Timos Mama: Sekunden zählen zwischen Blitz und Donner. Werden es mehr, zieht das Gewitter weg. Am Ende steht ein Regenbogen über dem Hof. (Donner leise und angekündigt, kein Schreck.)

**M49 Kalender** · Woche, Monat, Jahr (`jahreskreis`) · Kl. 1–4 (Schw. 1) / 1
- Sachgrund: Woche, Monat und Jahr bilden den Jahreskreis; der Kalender zeigt, wie viele Tage bis wann.
- Sache wächst mit: Kl. 1–2: Tage, Wochen, Geburtstage im Monat. Kl. 4: Jahresplanung, Schaltjahr, Tage zwischen zwei Daten.
- Rahmen: Fest · Spannung aus: Rätsel
- Ruhig: Der Klassenkalender: Geburtstage, Ausflug, Ferien. Jeder gefundene Tag bekommt sein Bild; ist der Monat voll, wird umgeblättert.
- Sanft: Ein Zettel ist vom Kalender gefallen: „in drei Tagen ist Wandertag“. An welchen Tag gehört er?
- Abenteuer: Geheimer Freund über mehrere Runden: Jedes Kind der Klasse bereitet für ein anderes eine kleine Überraschung vor, im Kalender stehen nur Hinweise („zwei Wochen nach dem Ausflug“). Am letzten Tag wird aufgelöst.

**M50 Säulen bauen** · Mehrheit entscheidet: Klassensprecherin oder Klassensprecher (`mehrheit`) · Kl. 1–3 (Schw. 3) / 3
- Sachgrund: Bei einer Wahl zählt man Stimmen mit Strichliste und zeigt sie im Bilddiagramm; die Mehrheit entscheidet.
- Sache wächst mit: Kl. 1–2: Abstimmen in der Runde (Lieblingsobst, welches Spiel). Kl. 3: Wahl der Klassensprecherin oder des Klassensprechers, Mehrheit und Stichwahl.
- Rahmen: Miteinander · Spannung aus: Vorhersage
- Ruhig: Wohin geht der Ausflug? Die Klasse stimmt ab, das Kind führt die Strichliste und baut die Säulen. Die höchste entscheidet.
- Sanft: Zwei Säulen sind gleich hoch. Was nun? Es gibt eine Stichwahl, das Kind zählt neu.
- Abenteuer: Reporter für die Schülerzeitung über mehrere Runden: Lieblingsessen, Schulwege, Haustiere. Jede Umfrage wird ein Schaubild. Bei einer stimmt die Summe nicht: Jemand hat zweimal die Hand gehoben, es wird neu gezählt.

**M51 Ablesen** · Wetter beobachten und messen (`wetter-messen`) · Kl. 2–4 (Schw. 4) / 2
- Sachgrund: Wetter misst man und schreibt es in Tabellen; Ablesen zeigt, wann es regnete oder warm war.
- Sache wächst mit: Kl. 2: Thermometer und Regenmesser ablesen. Kl. 3–4: Wetterkarten, Diagramme über Wochen, Schaubilder, die täuschen können.
- Rahmen: Forschen · Spannung aus: Vorhersage
- Ruhig: Die Wetterstation der Schule: Thermometer, Regenmesser, Windfahne. Jeder abgelesene Wert kommt ins Schaubild der Woche.
- Sanft: Der Regenmesser ist umgekippt. Aus der Tabelle der Nachbarschule lässt sich ablesen, wie viel es geregnet hat.
- Abenteuer: Wetterfrösche über mehrere Runden: Die Runde liest jeden Tag ab und macht aus ihren Werten die Vorhersage fürs Sportfest. Am Morgen des Festes zeigt sich, ob sie stimmt.

**M52 Je mehr …** · Haustiere und was sie brauchen (`haustiere`) · Kl. 3–4 (Schw. 3) / 1 (Abstand 2)
- Sachgrund: Haustiere brauchen jeden Tag Futter; Futtermengen über die Woche sind eine Wertetabelle (Lernkern laut Welt).
- Sache wächst mit: Die Welt gehört zu Kl. 1, das Spiel zu Kl. 3–4. Hier geht es deshalb um Verantwortung in Zahlen: Futterplan, Kosten im Monat, Tierheim und Pflegestelle.
- Rahmen: Versorgen · Spannung aus: Vorhersage
- Ruhig: Ferienpflege für ein Kaninchen: Wie viel Heu für einen Tag, für zwei, für die Woche? Jede Zeile der Tabelle füllt die Futterdose.
- Sanft: Ein zweites Kaninchen kommt dazu. Reicht der Heusack jetzt länger oder kürzer? Erst vorhersagen, dann die Tabelle.
- Abenteuer: Praktikum im Tierheim über mehrere Runden: Hunde, Katzen, Schildkröten, jedes Tier mit seinem Plan. Je mehr Helfer, desto schneller ist ausgeführt. Am Ende zieht ein Hund zu einer Familie, sein Futterplan geht mit.

**M53 Wie viele Arten?** · Was alle Menschen brauchen (`was-menschen-brauchen`) · Kl. 1–4 (Schw. 2) / 1
- Sachgrund: Alle Menschen brauchen Essen, Wohnen und Kleidung; aus wenigen Teilen entstehen viele Möglichkeiten.
- Sache wächst mit: Kl. 1–2: Kleidung und Frühstück kombinieren. Kl. 3–4: Was brauchen Menschen überall (Essen, Wohnen, Kleidung, Geborgenheit), Pläne für viele.
- Rahmen: Versorgen · Spannung aus: Rätsel
- Ruhig: Packen für die Übernachtung: zwei Hosen, drei Pullis. Jede neue Kombination wird ein Bild im Plan; sind alle gefunden, geht der Koffer zu.
- Sanft: Kofi ist sicher, dass es noch eine gibt. Der Baum zeigt: Alle Äste sind besetzt.
- Abenteuer: Hüttenwoche über mehrere Runden: Wer schläft wo, wer kocht mit wem, was gibt es zum Frühstück? Jeden Tag soll es anders sein. Am letzten Abend steht ein Topf vor der Tür, den niemand gekocht hat: Die Wirtin hat Kaiserschmarrn gebracht.

**M54 Säckchen** · Was Luft kann (`was-luft-kann`) · Kl. 2–4 (Schw. 2) / 1
- Sachgrund: Was Luft kann (Ballon, Fallschirm, Wind), wird erst vorhergesagt und dann ausprobiert; sicher, möglich, unmöglich.
- Sache wächst mit: Kl. 2: Was fliegt, was fällt? Kl. 3–4: Luft bremst und trägt (Fallschirm, Flügel), faire und unfaire Versuche.
- Rahmen: Forschen · Spannung aus: Vorhersage · Fähigkeit: schweben
- Ruhig: Flugtest im Hof: Papierflieger, Fallschirm, Feder. Erst vorhersagen (sicher, möglich, unmöglich), dann viele Male werfen; die Treffer wachsen als Säulen. (Ohne Gewinn und ohne Wettbewerb.)
- Sanft: Ein Windstoß trägt einen Flieger aufs Vordach. Was ist jetzt wahrscheinlicher? Der Hausmeister holt ihn mit dem Besen.
- Abenteuer: Flugtag über mehrere Runden: Die Runde baut Flieger um (Büroklammer vorn, Flügel breiter) und sagt vorher, was sich ändert. Zum Schluss schwebt sie am Schirm über den Hof und sieht von oben, wo die meisten gelandet sind.

**M55 Zahlenrätsel** · Wie die Zahlen entstanden sind (`geschichte-der-zahlen`) · Kl. 2–4 (Schw. 2) / 1
- Sachgrund: Zahlen hatten früher andere Zeichen (römische Zahlen, Kerben); Geheimschriften mit alten Zahlen entschlüsseln.
- Sache wächst mit: Kl. 2: Kerben, Strichlisten, römische Zahlen bis XII. Kl. 4: Zahlzeichen anderer Kulturen, Stellenwert und die Erfindung der Null.
- Rahmen: Spur · Spannung aus: Rätsel
- Ruhig: Im Heimatmuseum steht eine Kiste mit Zahlenschloss, beschriftet mit alten Zahlzeichen. Jeder Hinweis schließt Zahlen aus; bleibt eine übrig, dreht sich ein Rad.
- Sanft: Die Hinweiszettel sind durcheinander, einer widerspricht den anderen. Er gehört zu einer anderen Kiste.
- Abenteuer: Schatzsuche im Museum über mehrere Runden, mit Laterne und Museumsleiterin: römische Zahlen am Torbogen, Kerben im Balken, ein Abakus. In der letzten Kiste liegen ein Rechenstein und ein Zettel der Kinder, die das Rätsel vor fünfzig Jahren gebaut haben.

**M56 Wer sagt 20?** · Wozu Regeln? Gemeinsam abstimmen (`regeln`) · Kl. 3 / 2
- Sachgrund: Spiele brauchen Regeln, die man zusammen festlegt; wer die Regel durchschaut, findet die Strategie.
- Rahmen: Miteinander · Spannung aus: Rätsel
- Ruhig: Die Runde erfindet ein Zählspiel. Das Kind spielt gegen einen Erwachsenen oder ein Kind der Runde und findet rückwärts die Zahlen, die sicher ans Ziel führen; sie leuchten als Spur. (Kein Rang, kein Sieger-Bild.)
- Sanft: Lena schlägt eine neue Regel vor: bis 21. Stimmen die sicheren Zahlen noch? Alle stimmen ab, dann wird geprüft.
- Abenteuer: Spielemacher über mehrere Runden: Die Runde ändert Ziel und Schrittweite und baut daraus ein eigenes Brettspiel für das Schulfest. Wer die Regel durchschaut hat, erklärt sie den anderen. Am Fest spielen es die Eltern.


### Schreiben

**S01 Wörter legen** · Wurzel, Stängel, Blatt, Blüte (`teile-der-pflanze`) · Kl. 1 / 1
- Sachgrund: Pflanzenteile werden beschriftet (Montessori-Nomenklaturkarten): Wurzel, Stängel, Blatt, Blüte.
- Rahmen: Versorgen · Spannung aus: Lücke · Fähigkeit: schrumpfen
- Ruhig: Im Schulgarten bekommen die Pflanzen Schilder. Jedes gelegte Wort wird ein Schild; mit Schild findet die Gärtnerin, was sie sucht.
- Sanft: Der Regen hat ein Schild abgewaschen, nur der erste Buchstabe ist noch da. Welches Wort war es?
- Abenteuer: Die Runde schrumpft und klettert über mehrere Runden an einer Sonnenblume hoch: Wurzel, Stängel, Blatt, Blüte. An jeder Station legt das Kind das Wort. Oben brummt es: Eine Hummel landet nebenan (Sachbild).

**S02 Silbenbogen** · Raupe und Schmetterling, Kaulquappe und Frosch (`vom-ei-zum-tier`) · Kl. 1 / 2
- Sachgrund: Eine Raupe hat viele gleiche Abschnitte und wird zum Schmetterling; lange Wörter haben gleiche Silben.
- Rahmen: Versorgen · Spannung aus: Verwandlung
- Ruhig: Im Raupenkasten: Jede volle Silbe wird ein Glied der Raupe. Ist das Wort fertig, frisst sie ein Blatt. (Während das Kind hört und schwingt, ist es still.)
- Sanft: Die Raupe ist weg. Am Zweig hängt etwas Neues: eine Puppe. Jedes Wort bringt einen Tag weiter.
- Abenteuer: Vom Ei zum Falter über mehrere Runden: Ei, Raupe, Puppe. Mit jedem Wort vergeht Zeit. In der letzten Runde wackelt die Puppe und reißt auf. Ein Schmetterling trocknet seine Flügel.

**S03 Das Silbenhaus** · Ackerbau, Hausbau, Handwerk (`ackerbau-hausbau`) · Kl. 2–3 (Schw. 2) / 3
- Sachgrund: Die Wörter vom Bauen sind die Übungswörter (K10): Ho-bel und Ham-mer, Sä-ge und Lat-te, Na-gel und Bal-ken. Wie man früher ein Haus aus Holz und Lehm baute, zeigt die Szene.
- Rahmen: Bauen · Spannung aus: Durcheinander · Fähigkeit: in die Zeit reisen
- Ruhig: Ein Haus wie früher wird gebaut. Jedes Wort aus der Zimmerei (Hobel, Hammer) bekommt sein Silbenhaus mit offener oder geschlossener Tür; stimmt es, kommt das Werkzeug an die Wand.
- Sanft: Zwei Schilder klingen fast gleich (Hüte, Hütte). Welches gehört an die Tür? Das Silbenhaus zeigt es.
- Abenteuer: Mit der Zeituhr über mehrere Runden auf einer Baustelle von früher: Schwelle, Ständer, Riegel, Dach. Jedes Wort setzt ein Teil. Beim Richtfest hängt die Runde den Kranz auf.

**S04 Das lange Wort** · Auf dem Bauernhof (`bauernhof`) · Kl. 2–3 (Schw. 2) / 1
- Sachgrund: Auf dem Hof gibt es Pferde, Rinder, Kälber: die Mehrzahl zeigt beim Verlängern, wie man schreibt.
- Sache wächst mit: Kl. 2: Tiere und Dinge auf dem Hof in Einzahl und Mehrzahl. Kl. 3: Arbeit auf dem Hof durchs Jahr (melken, mähen, ernten), Wörter mit wir-Form und Adjektiv.
- Rahmen: Spur · Spannung aus: Rätsel
- Ruhig: Die Bestandsliste für den Hof: ein Kalb, viele Kälber. Das lange Wort lässt den Laut hören; richtig geschrieben, kommt das Tier in die Liste.
- Sanft: Die Liste ist nass geworden, die letzten Buchstaben sind verlaufen: Hun_, Pfer_. Verlängern bringt sie zurück.
- Abenteuer: Spuren im Schnee über mehrere Runden: eine Spur, viele Spuren. Wer war am Futtertrog? Jedes verlängerte Wort deckt eine Spur auf (Hund, Hunde). Die letzte führt in die Scheune: Dort liegt die Katze mit ihren Jungen im Stroh.

**S05 Der Wortbaum** · Tierbaum und Pflanzenbaum (`tierbaum-pflanzenbaum`) · Kl. 2–4 (Schw. 3) / 3
- Sachgrund: Tiere und Pflanzen ordnet man nach Verwandtschaft, nicht nach Aussehen (der Wal ist kein Fisch). Bei Wörtern ist es genauso: Verwandt ist, was denselben Stamm hat (backen, Bäcker).
- Rahmen: Forschen · Spannung aus: Rätsel
- Ruhig: Neben dem Tierbaum im Klassenzimmer wächst ein Wortbaum. Jedes abgeleitete Wort treibt ein Blatt am Ast seiner Familie.
- Sanft: Ein Blatt hängt am falschen Ast: Es sieht nach Verwandtschaft aus, ist aber keine (wie Wal und Fisch). Der Stamm zeigt, wohin es gehört.
- Abenteuer: Verwandte suchen über mehrere Runden: Die Runde bekommt Karten mit Tieren und Wörtern, die sich ähnlich sehen. Wer ist wirklich verwandt? Am Ende ist klar: Die Fledermaus gehört zu den Säugetieren und „Bäcker“ zu „backen“.

**S06 Groß oder klein** · Mein Körper von Kopf bis Fuß (`koerperteile`) · Kl. 1–4 (Schw. 3) / 1
- Sachgrund: Alle Körperteile haben richtige Namen (auch Penis, Vulva, Po, Brust); Nomen erkennt man an der Probe.
- Sache wächst mit: Kl. 1–2: Körperteile von Kopf bis Fuß, alle mit richtigem Namen. Kl. 3–4: Organe und was sie tun (Herz, Lunge, Magen), abstrakte Nomen (das Laufen, der Hunger).
- Rahmen: Entdecken · Spannung aus: Lücke · Fähigkeit: schrumpfen
- Ruhig: Ein Körperplakat für die Klasse: Besteht ein Wort die Artikelprobe, zaubert ein Kind der Runde den Anfang groß, und das Schild klebt an seiner Stelle.
- Sanft: Ein Wort macht Mühe: „das Laufen“. Groß oder klein? Die Probe entscheidet.
- Abenteuer: Über mehrere Runden schrumpft die Runde und geht durch ein begehbares Körpermodell im Museum: Ohr, Lunge, Herz. Jedes Schild muss stimmen, dann geht die Tür zum nächsten Raum auf. Im Herzraum pocht es: ein Lautsprecher.

**S07 Merken** · Tarnen und Verstecken (`tarnen-verstecken`) · Kl. 1–4 (Schw. 3) / 1
- Sachgrund: Getarnte Tiere sieht man nur kurz und muss sie sich merken; das Wort verschwindet auch.
- Sache wächst mit: Kl. 1–2: getarnte Tiere bei uns (Frosch, Reh, Falter). Kl. 3–4: Tarnen als Anpassung, Tiere im Meer und in anderen Ländern.
- Rahmen: Spur · Spannung aus: Rätsel · Fähigkeit: unter Wasser atmen
- Ruhig: Im Bild verstecken sich Tiere. Der Name wird gezeigt, vom Kind selbst abgedeckt und aus dem Kopf geschrieben; stimmt er, wird das Tier sichtbar (Sachbild).
- Sanft: Etwas hat sich bewegt, aber wo? Das nächste Wort deckt es auf: eine Stabheuschrecke am Zweig.
- Abenteuer: Mit dem Taucherhelm über mehrere Runden durchs Riff: Scholle im Sand, Seepferdchen im Seegras, Krake am Fels. Jedes Merkwort lässt eines auftauchen. Der letzte Stein wechselt die Farbe: ein Tintenfisch.

**S08 Proben-Kiste** · Werkzeuge und wofür man sie nimmt (`werkzeuge`) · Kl. 2–4 (Schw. 4) / 1
- Sachgrund: In der Werkstatt hängen Schilder an der Werkzeugwand (Hammer, Säge, Zange); falsche Schilder mit der passenden Probe richtig machen.
- Sache wächst mit: Kl. 2: Hammer, Säge, Zange. Kl. 4: Fachwörter und Berufe der Werkstatt (Schraubzwinge, Wasserwaage, Schreinerin), Nachschlagen im Wörterbuch.
- Rahmen: Werkstatt · Spannung aus: Rätsel
- Ruhig: In der Werkstatt hängen Schilder an der Werkzeugwand, bei manchen ist die Schreibung unsicher. Das Kind wählt die Probe; das geprüfte Schild kommt zurück an die Wand.
- Sanft: Ein Bestellzettel soll heute noch zum Baumarkt, zwei Wörter sind unsicher. Geprüft, geht er ab.
- Abenteuer: Die Werkstatt zieht um, über mehrere Runden: Kisten beschriften, Regale, Türschilder. In einer alten Kiste liegt ein Werkzeug, das niemand kennt. Nachgeschlagen: ein Schusterhammer.

**S09 Schere** · Wie die Schrift entstanden ist (`geschichte-der-schrift`) · Kl. 1–3 (Schw. 1) / 1
- Sachgrund: Früher schrieb man ohne Wortabstände; Wörter und Sätze richtig trennen macht Schrift lesbar.
- Sache wächst mit: Kl. 1: Wörter trennen macht lesbar. Kl. 3: Schreiben früher (Stein, Ton, Feder), Trennen am Zeilenende beim Abschreiben von Hand.
- Rahmen: Zeitreise · Spannung aus: Rätsel · Fähigkeit: in die Zeit reisen
- Ruhig: Eine alte Schriftrolle ohne Abstände. Jeder richtige Schnitt trennt ein Wort; ist die Zeile lesbar, wird sie vorgelesen.
- Sanft: Eine Stelle lässt sich auf zwei Arten schneiden. Nur eine ergibt Sinn; vorgelesen hört man es.
- Abenteuer: Mit der Zeituhr über mehrere Runden in eine Schreibstube von früher: Die Runde hilft, eine Nachricht zu entziffern, die jemand in Stein geritzt hat. Am Ende heißt sie: „Hier gibt es gutes Brot.“

**S10 Bücherei** · Wie die Schrift entstanden ist (`geschichte-der-schrift`) · Kl. 1–4 (Schw. 2) / 1
- Sachgrund: Das Alphabet ist eine alte Erfindung und ordnet Bücher, Lexika und Wörterbücher.
- Sache wächst mit: Kl. 1–2: das ABC ordnet. Kl. 3–4: woher das Alphabet kommt, Wörterbuch und Lexikon mit Leitwörtern.
- Rahmen: Spur · Spannung aus: Rätsel
- Ruhig: Die Schulbücherei wird nach dem ABC geordnet. Steht jedes Buch an seinem Platz, findet der Bibliothekar sofort, was ein Kind sucht.
- Sanft: Ein Kind sucht ein Buch über Wale. Es steht falsch, bei M. Wohin gehört es, und wer steht davor und dahinter?
- Abenteuer: Bücher-Schnitzeljagd über mehrere Runden: In jedem gefundenen Buch steckt ein Zettel mit dem nächsten Stichwort. Das letzte führt ins Wörterbuch zum Wort „Alphabet“ und zu den ersten beiden Buchstaben der Griechen.

**S11 Zeichen setzen** · Ich darf Nein sagen (`nein-sagen`) · Kl. 1–4 (Schw. 3) / 1
- Sachgrund: Ein deutliches Nein hat ein Ausrufezeichen; jeder darf Nein sagen, und andere dürfen es auch.
- Sache wächst mit: Kl. 1–2: Stopp sagen und gehört werden, Punkt, Fragezeichen, Ausrufezeichen. Kl. 3–4: Nein sagen auch zu Freunden und in Gruppen, das Nein der anderen achten; wörtliche Rede und Komma.
- Rahmen: Fest · Spannung aus: Verwandlung
- Ruhig: Die Runde macht ein Bilderbuch, in dem jedes Zeichen etwas bewirkt: Nach dem Fragezeichen antwortet ein Kind, nach dem Ausrufezeichen hört das andere auf. „Stopp!“, und das Kitzeln hört auf.
- Sanft: Ein Satz klingt beim Vorlesen noch wie eine Frage. Mit dem richtigen Zeichen wird er ein deutliches Nein.
- Abenteuer: Puppentheater über mehrere Runden: Die Runde schreibt ein Stück mit wörtlicher Rede und probt es. Bei der Aufführung sagt eine Puppe Nein, und das Stück geht gut weiter. (Die Spannung kommt aus der Aufführung, nie aus einer Bedrängnis.)

**S12 Post** · Ich sage Bescheid, wo ich bin (`bescheid-sagen`) · Kl. 1–4 (Schw. 1) / 1
- Sachgrund: Wer Bescheid sagt, wo er ist, schreibt einen Zettel für den Richtigen; wozu und für wen ist der Text.
- Sache wächst mit: Kl. 1–2: Zettel schreiben, wo ich bin. Kl. 4: Absprachen für längere Wege und Ausflüge, Nachricht, Plan und Einladung unterscheiden.
- Rahmen: Reise · Spannung aus: Durcheinander
- Ruhig: Zettel, Karten und Briefe kommen an den Ort, an dem sie gebraucht werden. Lenas Zettel „Bin bei Kofi“ kommt an die Tür; dann geht sie los.
- Sanft: Zwei Zettel sind vertauscht: Das Rezept hängt an der Tür, der Zettel für Mama am Herd. Wohin gehört welcher?
- Abenteuer: Zettel-Rallye durchs Dorf über mehrere Runden: An jeder Station hängt ein Text für die nächste (Einladung, Rezept, Plan). Vor dem Losgehen schreibt die Runde auf, wo sie ist. Die letzte Station ist zu Hause, wo der erste Zettel noch hängt.

**S13 Was fehlt?** · Erste Hilfe und Notruf (`erste-hilfe`) · Kl. 2–4 (Schw. 4) / 3
- Sachgrund: Ein Notruf braucht die richtigen Angaben (wo, was, wer); was fehlt, fragt die Leitstelle.
- Rahmen: Miteinander · Spannung aus: Lücke
- Ruhig: Erste-Hilfe-Kurs der Klasse: Am Übungstelefon wird der Notruf geübt. Jede ergänzte Angabe (wo, was, wer) macht die Meldung vollständig; dann weiß die Leitstelle, wohin.
- Sanft: Die Sanitäterin am Übungstelefon fragt nach: „Wo genau?“ Welche Angabe fehlt?
- Abenteuer: Übungstag in der Rettungswache über mehrere Runden: Meldungen kommen per Funk, die Runde schreibt Berichte fürs Wachbuch. Bei der Abschlussübung liegt eine Puppe im Hof, und alles läuft nach Plan. (Nur Übung, keine Unfallszene.)

**S14 Die Karte** · Gute und schlechte Geheimnisse (`gute-schlechte-geheimnisse`) · Kl. 1–4 (Schw. 4) / 1
- Sachgrund: Eine Überraschungskarte ist ein gutes Geheimnis: Es macht Freude und kommt bald heraus; schlechte Geheimnisse darf man immer erzählen.
- Sache wächst mit: Kl. 1–2: Überraschung als gutes Geheimnis. Kl. 4: Geheimnisse unter Freunden und in Gruppen; was Bauchweh macht, darf man immer erzählen. Dazu Brief, Einladung und Plakat einrichten.
- Rahmen: Fest · Spannung aus: Wissensvorsprung
- Ruhig: Eine Überraschungskarte für Opas Geburtstag: Anrede, Text und Gruß kommen an ihren Platz. Fertig, wird sie überreicht. Ein gutes Geheimnis kommt bald heraus und macht Freude.
- Sanft: Opa kommt herein, während die Karte auf dem Tisch liegt. Ela legt ein Heft darüber; er schmunzelt und fragt nicht.
- Abenteuer: Die geheime Feier über mehrere Runden: Einladungen, Plan, Türschild. Das Kind weiß, was Opa noch nicht weiß. Am Ende geht die Tür auf. In der Pause: Ein Geheimnis, das Bauchweh macht, darf man immer erzählen.

**S15 Der Film** · Wenn etwas schiefgeht (`wenn-etwas-schiefgeht`) · Kl. 1–4 (Schw. 2) / 1
- Sachgrund: Wenn etwas schiefgeht, geht es weiter: Glas umgefallen, aufwischen, neu einschenken; Reihenfolgen, die etwas bewirken.
- Sache wächst mit: Kl. 1–2: kleine Missgeschicke im Alltag (Glas umgefallen). Kl. 3–4: wenn ein Plan nicht aufgeht, neu planen; Anleitung, Bericht und Erzählung mit Höhepunkt.
- Rahmen: Fest · Spannung aus: Durcheinander
- Ruhig: Kurze Filme aus dem Alltag: Glas umgefallen, aufgewischt, neu eingeschenkt. Richtig gelegt, läuft der Film bis zum guten Ende.
- Sanft: Der Drachen hängt im Baum. Die Bilder mit der Lösung liegen durcheinander: erst die Leiter holen oder erst Papa rufen?
- Abenteuer: Ein Film in Fortsetzungen über mehrere Runden: Die Runde baut ein Floß, und in jeder Folge geht eine Kleinigkeit schief (Knoten auf, Paddel vergessen, Segel verkehrt herum). Jede Folge endet mit der Lösung, die letzte mit der Fahrt über den Teich.

**S16 Die Lupe** · Das Auge (`das-auge`) · Kl. 1–4 (Schw. 3) / 3
- Sachgrund: Das Auge hat eine Linse wie die Lupe; Forscherberichte über das Auge genau lesen und verbessern.
- Sache wächst mit: Kl. 1–2: Was das Auge kann und wie man es schützt. Kl. 3–4: Pupille, Linse, Netzhaut; Berichte über Versuche.
- Rahmen: Forschen · Spannung aus: Vorhersage
- Ruhig: Ein Forscherbericht über das Auge für die Schülerzeitung. Die Lupe zeigt eine Stelle; geändert, klingt der Text beim Vorlesen klarer.
- Sanft: Ein Leser versteht einen Satz nicht („Es ist rund. Es ist nass.“ Was ist „es“?). Die Lupe findet die Stelle.
- Abenteuer: Sehforscher über mehrere Runden: Die Runde macht Versuche (die Pupille im Hellen und im Dunkeln, Lupe und Linse) und schreibt nach jedem den Bericht besser. Am Ende wird die Zeitung gedruckt und verteilt.

**S17 Gedichte** · Ja-Gefühl und Nein-Gefühl (`ja-und-nein-gefuehl`) · Kl. 1–3 (Schw. 2) / 1
- Sachgrund: Ja-Gefühl und Nein-Gefühl: was ich mag und nicht mag, hat keine falsche Antwort; das Gedicht hat ein festes Muster.
- Rahmen: Fest · Spannung aus: Lücke
- Ruhig: Ein Gedichtbuch „Ich mag, ich mag nicht“. Jede gefüllte Zeile wird eine Seite. Geprüft wird nur das Muster; was jemand mag, ist nie falsch.
- Sanft: Eine Zeile hat ein Wort zu viel für das Elfchen. Welches darf gehen?
- Abenteuer: Gedichte-Leine über mehrere Runden: Die Runde hängt ihre Gedichte im Hof auf, andere Kinder dürfen eine Zeile dazuschreiben. Ein Blatt kommt mit einer neuen Strophe zurück, ohne Namen. Sie ist von der Lehrerin.

**S18 Selbst schreiben** · Mein Schulweg (`schulweg`) · Kl. 1 / 1
- Sachgrund: Auf dem Schulweg stehen Schilder und Hausnummern; schreiben lernen heißt Schilder selbst schreiben.
- Rahmen: Bauen · Spannung aus: Lücke
- Ruhig: Schilder für den Schulweg-Plan: Jeder geschriebene Buchstabe wird Teil eines Schildes (das A an der Ampel, die Hausnummer an der Tür).
- Sanft: Am Laden der Bäckerin fehlt ein Buchstabe im Schild: B_CKEREI. Der Bote sucht die Tür; mit dem Buchstaben findet er sie.
- Abenteuer: Kreidespur über mehrere Runden: Die Runde schreibt mit Straßenkreide Buchstaben auf den Schulweg, an jede Ecke einen. Wer den Weg geht, liest am Ende ein Wort. Jede Runde ergibt ein neues.

**S19 Zwei Schriften** · Früher und heute: Spielzeug, Schule, Familie (`frueher-heute`) · Kl. 2 / 2
- Sachgrund: Früher schrieb man mit der Hand in Schreibschrift; Omas Rezept lesen.
- Rahmen: Zeitreise · Spannung aus: Rätsel
- Ruhig: Omas Rezeptbuch in Schreibschrift. Jedes entzifferte Wort kommt in die Abschrift; ist das Rezept lesbar, wird gebacken.
- Sanft: Im Buch liegt ein Zettel ohne Unterschrift. Die Schrift verrät, von wem er ist: dieselbe Schleife am g wie bei Opa.
- Abenteuer: Ein Brief vom Dachboden über mehrere Runden: geschrieben von einem Kind vor siebzig Jahren, Zeile für Zeile entziffert. Er erzählt von einem Versteck im Garten. Dort liegt eine Blechdose mit Glasmurmeln.

**S20 Schreibschrift** · Um Hilfe bitten, helfen, Danke sagen (`hilfe-und-danke`) · Kl. 2–3 (Schw. 2) / 1
- Sachgrund: Ein Dankesbrief mit der Hand ist eine Form, Danke zu sagen.
- Sache wächst mit: Kl. 2: Danke sagen mit einer Karte. Kl. 3: Wer arbeitet für uns alle (Müllabfuhr, Busfahrerin, Köchin), Briefe an Menschen außerhalb der Schule.
- Rahmen: Miteinander · Spannung aus: Wissensvorsprung
- Ruhig: Ein Dankesbrief an die Hausmeisterin. Jedes verbundene Wort kommt auf die Karte; fertig, wird sie eingeworfen.
- Sanft: Bei einem Wort ist der Strich abgerissen. In einem Zug neu geschrieben, hält es zusammen.
- Abenteuer: Dankespost über mehrere Runden: Wer hat der Klasse in diesem Jahr geholfen? Busfahrer, Köchin, Bibliothekar. Jede Runde eine Karte. Nach der letzten kommt Post zurück, in Schreibschrift.


### Grammatik

**G01 Dreieck und Kreis** · Fell, Federn, Schuppen (`fell-federn-schuppen`) · Kl. 1–2 (Schw. 1) / 1
- Sachgrund: Tiere unterscheiden sich durch Fell, Federn, Schuppen und Bewegung; Nomen und Verben sortieren (der Vogel, fliegen).
- Rahmen: Fest · Spannung aus: Rätsel
- Ruhig: Tierkarten für eine Ausstellung: Der Vogel fliegt, der Fisch schwimmt. Jedes Wort bekommt sein Symbol; ist der Satz belegt, kommt er zur Karte seines Tiers.
- Sanft: Ein Wort macht Mühe: „fliegen“ oder „die Fliege“? Die Probe entscheidet, welches Symbol es bekommt.
- Abenteuer: Unbekannte Tiere über mehrere Runden: Im Naturkundemuseum liegen nur Hinweise in Sätzen („Es hat Federn. Es taucht.“). Symbol für Symbol wird klar, wer es ist. Das letzte hat Fell und legt Eier: das Schnabeltier.

**G02 Ich, du, wir** · Darf ich mitspielen? (`mitspielen`) · Kl. 2–3 (Schw. 2) / 1
- Sachgrund: Beim Mitspielen wechseln ich, du, wir; wer fragt und wer antwortet, zeigt die Personalform.
- Sache wächst mit: Kl. 2: mitspielen und fragen. Kl. 3: Mannschaften bilden, Regeln aushandeln, jemanden dazuholen, der am Rand steht.
- Rahmen: Miteinander · Spannung aus: Hilfe
- Ruhig: Auf dem Hof fragt Timo, ob er mitspielen darf. Die Personenscheibe zeigt, wer handelt; mit der passenden Verbform geht das Spiel einen Zug weiter.
- Sanft: Zwei Kinder wollen gleichzeitig werfen. „Du wirfst, dann werfe ich“: Die Formen klären, wer dran ist.
- Abenteuer: Ein neues Kind kommt in die Klasse, über mehrere Runden: Es kennt die Spiele noch nicht. Die Runde erklärt (ich fange, du läufst, wir zählen) und lernt dafür sein Spiel. Am Ende spielen alle beides.

**G03 Zeit-Uhr** · Früher und heute: Spielzeug, Schule, Familie (`frueher-heute`) · Kl. 2–4 (Schw. 4) / 2
- Sachgrund: Früher, heute, später: Spielzeug, Schule und Familie von früher erzählt man in der Vergangenheit.
- Sache wächst mit: Kl. 2: Spielzeug und Schule früher. Kl. 3–4: Woher weiß man, wie es war (Fotos, Dinge, Erzählungen)? Kindheit der Großeltern und Urgroßeltern auf dem Zeitstrahl.
- Rahmen: Zeitreise · Spannung aus: Durcheinander · Fähigkeit: in die Zeit reisen
- Ruhig: Das Fotoalbum: Was war, was ist, was kommt? Die richtige Zeitform klebt das Foto an seine Stelle.
- Sanft: Ein Foto ist in die falsche Zeit gerutscht: „Morgen fuhren wir“? Das Kind stellt den Satz richtig.
- Abenteuer: Mit der Zeituhr über mehrere Runden in Omas Kindheit: Schulbank, Spielzeug, Waschtag. Erzählt wird in der Vergangenheit, geplant in der Zukunft. Jede Runde endet im Heute, mit einem Ding, das es immer noch gibt: dem Kreisel.

**G04 Satz-Bilder** · Wer frisst was? (`wer-frisst-was`) · Kl. 1 / 1
- Sachgrund: Wer frisst was: Raupen fressen Blätter, Eichhörnchen Nüsse (auf ruhig nur Pflanzenfutter, ab sanft auch Pfeile im Schaubild ohne Jagd).
- Rahmen: Versorgen · Spannung aus: Durcheinander
- Ruhig: Fütterung im Wildpark nach Plan: „Die Raupe frisst das Blatt.“ Ist es ein Satz, kommt das Futter an seinen Platz. (Auf „ruhig“ nur Pflanzenfutter.)
- Sanft: Am Trog liegt das falsche Futter. Der Satz zeigt, wer was frisst; ab „sanft“ auch als Pfeil im Schaubild, ohne Jagd.
- Abenteuer: Ein Tag mit dem Tierpfleger über mehrere Runden: vom Streichelgehege bis zur Voliere. In der Futterküche fehlt etwas aus der Schüssel. Ein Rabe hat sich eine Nuss geholt. (Keine Jagd, kein benanntes Opfer.)

**G05 Satz-Zug** · Brücken, die tragen (`bruecken`) · Kl. 3–4 (Schw. 3) / 3
- Sachgrund: Sätze über Brücken und Züge sind die Übungssätze (K10); der Zug fährt in jeder Runde über eine andere Brückenart (Balkenbrücke, Bogenbrücke, Hängebrücke), die das Sachbild zeigt.
- Rahmen: Reise · Spannung aus: Durcheinander
- Ruhig: Ein Güterzug im Tal: Die Wagen sind Satzglieder, die Lok ist das Prädikat an zweiter Stelle. Jede gültige Umstellung fährt den Zug über die Brücke zum nächsten Bahnhof.
- Sanft: Eine Weiche klemmt. Erst der umgestellte Satz mit einem anderen Satzglied vorn stellt sie.
- Abenteuer: Bergbahn über mehrere Runden: Viadukt, kurzer Tunnel, Hängebrücke. Im Tunnel pfeift es: die eigene Lok. Am Gipfelbahnhof ist Aussicht im Hellen.

**G06 Wer, wem, was?** · Wie Menschen Wald und Wasser verändern (`mensch-und-natur`) · Kl. 4 / 4
- Sachgrund: Menschen verändern Wald und Wasser (der Förster pflanzt den Baum, die Gemeinde gibt dem Bach Platz): wer tut wem was.
- Rahmen: Forschen · Spannung aus: Lücke
- Ruhig: Eine Bildtafel für den Naturpfad: „Die Försterin gibt dem jungen Baum einen Pfahl.“ Sind alle Rollen besetzt, spielt die Szene, und das Bild kommt auf die Tafel.
- Sanft: In einem Satz fehlt, wem etwas gegeben wird. Die Szene bleibt stehen, bis die Rolle besetzt ist.
- Abenteuer: Ein Bach bekommt sein Bett zurück, über mehrere Runden: Die Runde begleitet den Umbau und schreibt die Tafeln dazu. Wer tut was für wen? Im letzten Bild sitzt ein Eisvogel am Ufer. (Sachlich, ohne Haltung.)

**G07 Satz-Brücke** · Strom und Stromkreis (`strom`) · Kl. 3–4 (Schw. 4) / 3
- Sachgrund: Ein Stromkreis ist Ursache und Wirkung: die Lampe leuchtet, weil der Kreis geschlossen ist.
- Rahmen: Bauen · Spannung aus: Rätsel
- Ruhig: Stromkreise mit Batterie und Lämpchen: „Die Lampe leuchtet, weil der Kreis geschlossen ist.“ Jeder richtig verbundene Satz schließt einen Kreis.
- Sanft: Ein Lämpchen bleibt dunkel. Welcher Satz erklärt es? „… weil der Draht nicht an der Batterie ist.“ Angeschlossen, leuchtet es.
- Abenteuer: Über mehrere Runden baut die Runde ein beleuchtetes Modellhaus mit Schaltern. In einem Zimmer geht das Licht an und aus: ein Wackelkontakt, den der weil-Satz findet. Am Ende leuchtet das ganze Haus.

**G08 Eins und viele** · Samen gehen auf Reisen (`samen-reisen`) · Kl. 1–2 (Schw. 2) / 2
- Sachgrund: Samen gibt es immer viele: der Kern, die Kerne; die Nuss, die Nüsse; das Korn, die Körner.
- Rahmen: Versorgen · Spannung aus: Verwandlung · Fähigkeit: verzaubern
- Ruhig: Samen sammeln im Herbst: eine Nuss, viele Nüsse. Mit der gebildeten Mehrzahl zaubert ein Kind der Runde aus einem viele; die Kontrollkarte zeigt, ob die Form stimmt, und das Glas ist voll.
- Sanft: Ein Glas hat kein Schild mehr: Kerne oder Körner? Die Form passt zu dem, was darin liegt.
- Abenteuer: Samentausch über mehrere Runden: Die Runde tauscht mit einer anderen Schule Samen und beschriftet die Tütchen. Aus einem Tütchen ohne Schild wächst etwas, das keiner kennt. Im Herbst ist es ein riesiger Kürbis.

**G09 der, die, das** · Mein Körper gehört mir (`mein-koerper-gehoert-mir`) · Kl. 1–3 (Schw. 1) / 1
- Sachgrund: Mein Körper gehört mir, und alle Teile haben Namen mit Artikel: der Arm, die Vulva, das Knie.
- Sache wächst mit: Kl. 1: Körperteile mit Artikel. Kl. 3: Artikel bei schwierigen und zusammengesetzten Nomen; was zu mir gehört, bestimme ich.
- Rahmen: Fest · Spannung aus: Lücke
- Ruhig: Ein Körperbild für das Klassenzimmer: der Arm, die Vulva, das Knie. Das Kind legt den Artikel, dreht die Kontrollkarte um und klebt das Schild an.
- Sanft: Zwei Schilder haben sich gelöst. Zu welchem Wort gehört „das“?
- Abenteuer: Über mehrere Runden gestaltet die Runde ein großes Buch „Mein Körper“, jede Runde eine Seite. Am Ende liegt es in der Leseecke. (Schutz-Welt: Auf jeder Stufe gleich sachlich; alle Namen wie Arm und Knie; Elternvorschau.)

**G10 Fundbüro** · Holz, Metall, Glas, Wolle, Papier (`stoffe`) · Kl. 2–4 (Schw. 2) / 1
- Sachgrund: Dinge sind aus Holz, Metall, Glas, Wolle, Papier; genau beschreiben (der weiche Wollschal) findet das Richtige.
- Sache wächst mit: Kl. 2: Woraus ist das Ding (Holz, Metall, Glas, Wolle, Papier)? Kl. 3–4: Eigenschaften von Stoffen (biegsam, durchsichtig, wasserfest), Vergleichsformen.
- Rahmen: Spur · Spannung aus: Rätsel
- Ruhig: Im Fundbüro der Schule sucht ein Kind seinen Schal. Mit jedem genauen Wort (der weiche, wollene) gehen die Dinge zurück, die nicht passen; bleibt eines, ist es gefunden.
- Sanft: Zwei Schals bleiben übrig. Welches Wort unterscheidet sie? „Der längere.“
- Abenteuer: Das große Aufräumen nach dem Schulfest über mehrere Runden: Kisten voller Fundsachen aus Holz, Metall, Glas, Wolle. Ein Ding kennt niemand. Genau beschrieben, erkennt es der Hausmeister: die Kurbel seiner Kaffeemühle.

**G11 Bühne** · Nah und fern, Stadt und Land (`stadt-und-land`) · Kl. 2–4 (Schw. 3) / 2
- Sachgrund: Stadt und Land, nah und fern sind Gegensatzpaare; Wortfelder und Lagewörter beschreiben Orte.
- Rahmen: Fest · Spannung aus: Verwandlung
- Ruhig: Kindertheater: eine Reise von der Stadt aufs Land. Die Bühne spielt genau das gewählte Wort (schleichen oder rennen, laut oder still).
- Sanft: Die Kulissen stehen verkehrt: Der Traktor ist in der Stadt, die Straßenbahn auf dem Feld. Das Gegenteil stellt sie um.
- Abenteuer: Tournee über mehrere Runden: Die Runde spielt ihr Stück im Dorf, in der Kleinstadt, in der Großstadt. Überall tauscht das Publikum ein Wort, und die Bühne spielt es. Bei der letzten Vorstellung geht kurz das Licht aus: Die Technikerin hat den falschen Schalter erwischt.

**G12 Wort-Werkstatt** · Wie Erfindungen sich verändern (`erfindungen`) · Kl. 2–4 (Schw. 3) / 3
- Sachgrund: Neue Erfindungen brauchen neue Namen (Fahr-rad, Kühl-schrank); Wörter zusammensetzen.
- Rahmen: Werkstatt · Spannung aus: Verwandlung
- Ruhig: Im Erfindermuseum bekommt jede Erfindung ihren Namen aus Bausteinen (Fahr-rad, Kühl-schrank). Das gesteckte Wort beschriftet das Ding.
- Sanft: Eine Erfindung hat noch keinen Namen. Was tut sie? Aus den Bausteinen entsteht er: Regenschirmhalter.
- Abenteuer: Erfinderfest über mehrere Runden: Die Runde baut eigene Erfindungen und gibt ihnen Namen. Die Werkstatt baut wörtlich, was dasteht, auch einen Handschuhlöffel. Am Fest stellt jedes Kind eine vor.

**G13 Kisten packen** · Fünf Gruppen von Wirbeltieren (`wirbeltierklassen`) · Kl. 2–3 (Schw. 2) / 2
- Sachgrund: Wirbeltiere bilden fünf Gruppen (Säugetiere, Vögel, Fische, Kriechtiere, Lurche): Oberbegriffe sind Kisten.
- Rahmen: Spur · Spannung aus: Rätsel
- Ruhig: Die Tiersammlung des Museums wird eingeräumt: Säugetiere, Vögel, Fische, Kriechtiere, Lurche. Jedes Tier kommt in seine Kiste.
- Sanft: Ein Tier will in keine Kiste passen: Der Pinguin schwimmt und fliegt nicht und ist doch ein Vogel. Die Federn entscheiden.
- Abenteuer: Abends im Museum über mehrere Runden, mit der Museumsleiterin und Taschenlampe: Die Runde richtet eine neue Ausstellung ein. In einem Saal hängt etwas von der Decke: eine Fledermaus aus Stoff. In welche Kiste gehört die echte? Zu den Säugetieren.


### Lesen

**L01 Verse-Werkstatt** · Alle Gefühle sind richtig (`alle-gefuehle`) · Kl. 1–4 (Schw. 1) / 1
- Sachgrund: Alle Gefühle sind richtig; Lieder und Reime haben für jedes Gefühl eine Strophe.
- Sache wächst mit: Kl. 1–2: Gefühle benennen (froh, wütend, müde). Kl. 4: gemischte Gefühle und wie Gedichte sie ausdrücken; Paarreim und Kreuzreim.
- Rahmen: Fest · Spannung aus: Lücke
- Ruhig: Ein Gefühle-Lied: Jede Strophe braucht ihr Reimwort. Mit dem passenden klingt der Vers; ist das Lied fertig, wird es gesungen. Geprüft wird nur der Reim, nie das Gefühl.
- Sanft: Zwei Wörter reimen sich fast. Vorgelesen hört man, welches wirklich klingt.
- Abenteuer: Über mehrere Runden schreibt die Runde ein Lied für das Schulfest, jede Runde eine Strophe. Bei der Probe singt jemand eine Strophe, die keiner geschrieben hat: Der Musiklehrer hat eine dazugedichtet.

**L02 Abzählen** · Tiere auf allen Erdteilen (`tiere-der-erdteile`) · Kl. 1 / 2
- Sachgrund: Tiere aller Erdteile haben lange Namen (Ka-ma-le-on); Silben klatschen macht sie merkbar.
- Rahmen: Reise · Spannung aus: Lücke · Fähigkeit: schweben
- Ruhig: Der Tierpark nach Erdteilen: Ka-me-le, Pin-gu-i-ne. Jeder geschwungene Name bringt das Tier an sein Gehege; der Abzählvers bestimmt, welches als Nächstes kommt.
- Sanft: Ein Namensschild ist in zwei Teile gebrochen. Welche Silbe fehlt bei „Kän-gu-…“?
- Abenteuer: Weltreise über mehrere Runden, mit dem Schirm von Erdteil zu Erdteil: Überall wohnt ein Tier mit langem Namen. In Australien hüpft etwas durchs hohe Gras, man sieht nur die Ohren: ein Kän-gu-ru.

**L03 Geheimsprache** · Tarnen und Verstecken (`tarnen-verstecken`) · Kl. 1 / 1
- Sachgrund: Tiere tarnen sich; ihr Name wird in Stücken gesagt, das Kind setzt ihn zusammen und findet sie.
- Rahmen: Spur · Spannung aus: Rätsel
- Ruhig: Die Runde spricht in Geheimsprache: „Ta-sche“. Das Kind zieht die Stücke zusammen und tippt auf das Versteck; das Ding kommt heraus.
- Sanft: Im Garten wird ein getarntes Tier in Stücken genannt („F-r-o-sch“). Wo sitzt es? Angetippt, wird es sichtbar.
- Abenteuer: Waldgang über mehrere Runden mit dem Förster: Er flüstert die Tiernamen in Stücken, damit kein Tier erschrickt. Am Ende zeigt er auf einen Zweig, der sich bewegt. Es ist kein Zweig, es ist eine Raupe.

**L04 Laut-Körbe** · Obst und Gemüse und wann es reif ist (`obst-gemuese-reif`) · Kl. 1 / 2
- Sachgrund: Obst und Gemüse sind zu bestimmten Zeiten reif; für den Markt wird gepackt, was jetzt reif ist.
- Rahmen: Versorgen · Spannung aus: Durcheinander
- Ruhig: Körbe für den Markt: In Mamas Korb kommt, was wie „Mama“ anfängt (Möhre, Mais). Sind die Körbe voll, fährt der Stand los.
- Sanft: Ein Ding scheint in zwei Körbe zu passen. Nur der erste Laut zählt: Apfel fängt mit A an.
- Abenteuer: Ein Erntejahr über mehrere Runden: Frühling (Radieschen, Rhabarber), Sommer, Herbst, Winter. Jede Runde eine Jahreszeit mit dem, was dann reif ist. Im Winterkorb liegt etwas Krummes, Erdiges: eine Pastinake.

**L05 Wortzug** · Zu Fuß, mit Rad, Bus und Bahn (`unterwegs`) · Kl. 1 / 1
- Sachgrund: Bahnen haben Wagen mit Plätzen; jeder Laut braucht seinen Platz.
- Rahmen: Reise · Spannung aus: Verwandlung · Fähigkeit: verzaubern
- Ruhig: Ein Zug im Dorf: Jeder Laut steigt in seinen Wagen. Stimmen die Wagen, fährt der Zug los und spricht das Wort Wagen für Wagen.
- Sanft: Ein Laut wird getauscht: Aus der Hose wird eine Dose. In welchem Wagen ist umgestiegen worden?
- Abenteuer: Zugreise über mehrere Runden: Brücke, Tunnel, Meer. An jedem Bahnhof steigt ein Laut um, und aus dem Wort wird ein neues (Hand, Wand, Sand). Am Meer hält der Zug am Strand, im Sand.

**L06 Buchstabenhaus** · Wie man mit Händen oder Ohren mehr wahrnimmt (`sinne-anders`) · Kl. 1 / 2
- Sachgrund: Buchstaben kann man auch ertasten (Sandpapierbuchstaben, Blindenschrift); manche Menschen lesen mit den Händen.
- Rahmen: Entdecken · Spannung aus: Lücke
- Ruhig: Das Buchstabenhaus: Jeder neue Buchstabe wird gehört und gesehen (ertasten als Mach mit). Sein Fenster leuchtet, und mit ihm wird ein neues Schild im Haus lesbar.
- Sanft: Zwei Fenster sehen sich ähnlich (b und d). Der Laut verrät, welches gemeint ist.
- Abenteuer: Geheimschrift über mehrere Runden: Eine Nachbarin der Runde liest mit den Fingern (Punktschrift). Sie schickt in jeder Runde ein Wort; mit den Buchstaben, die das Kind schon kennt, wird es lesbar. Am Ende ist es eine Einladung zum Kuchen.

**L07 Lesefenster** · Feste im Kalender (`feste-im-kalender`) · Kl. 1 / 1
- Sachgrund: Zu Festen gibt es Geschenke mit Kärtchen; Namen lesen bringt das Geschenk zum Richtigen.
- Rahmen: Fest · Spannung aus: Rätsel
- Ruhig: Geschenke für ein Fest: Auf jedem Anhänger steht ein Name. Selbst gelesen, kommt das Päckchen zum Richtigen. (Feste wechseln und stehen gleichwertig nebeneinander.)
- Sanft: Zwei Namen sehen fast gleich aus (Mila, Mira). Silbe für Silbe gelesen, ist es klar.
- Abenteuer: Wichteln über mehrere Runden: Statt eines Namens trägt jedes Päckchen einen Hinweis („für das Kind mit dem roten Rad“). Das letzte ist für das spielende Kind: ein Lesezeichen.

**L08 Kaufladen** · Unbekannte Pflanzen nicht essen (`unbekannte-pflanzen`) · Kl. 1–2 (Schw. 1) / 1
- Sachgrund: Manche Pflanzen sehen sich sehr ähnlich. Was man nicht sicher kennt, isst man nicht, man fragt. Genau hinsehen unterscheidet Pflanzen wie Wörter (Minze, Münze).
- Rahmen: Versorgen · Spannung aus: Rätsel
- Ruhig: Im Kräutergarten bekommt jeder Topf sein Schild. Die Wörter sehen fast gleich aus (Minze, Münze); genau gelesen, kommt das Schild an den richtigen Topf.
- Sanft: Zwei Töpfe sehen gleich aus, nur einer hat ein Schild. Die Gärtnerin wird gefragt; sie riecht am Blatt und weiß es.
- Abenteuer: Kräuterwanderung über mehrere Runden mit der Gärtnerin: Am Wegrand stehen Pflanzen, die sich ähneln. Gepflückt wird nur, was sie bestätigt. Am Ende gibt es Kräuterquark; ein Blatt, das nur gut riecht, bleibt im Strauß. (Nie als Gefahr erzählt.)

**L09 Blitzwörter** · Wie fühlt sich das an? (`gefuehle`) · Kl. 1–2 (Schw. 1) / 1
- Sachgrund: Gefühlswörter (froh, müde, wütend) liest man schnell an der Gefühlstafel der Klasse; keine falsche Antwort beim Gefühl.
- Rahmen: Miteinander · Spannung aus: Wissensvorsprung
- Ruhig: Die Gefühlstafel am Morgen: Jedes gelesene Wort (froh, müde) kommt an die Tafel, und jedes Kind der Runde hängt sein Zeichen dazu. Das Wort blitzt nur auf, wenn das Kind tippt.
- Sanft: Ein Kärtchen liegt umgedreht. Kurz aufgeblitzt: Welches Wort war es?
- Abenteuer: Pantomime über mehrere Runden: Das Wort blitzt auf, ein Kind der Runde spielt es ohne Worte, die anderen raten. Das spielende Kind weiß es schon.

**L10 Wortbausteine** · Berufe in Hof, Werkstatt, Laden und Pflege (`berufe`) · Kl. 2–3 (Schw. 2) / 2
- Sachgrund: Berufe haben zusammengesetzte Namen und Werkzeuge (Bäcker-ei, Tier-ärztin); Bausteine lesen.
- Rahmen: Reise · Spannung aus: Rätsel
- Ruhig: Die Straße der Werkstätten: Jedes lange Schild (Tier-ärzt-in, Bäck-er-ei) wird an den Fugen getrennt. Gelesen, öffnet die Werkstatt.
- Sanft: Ein Schild hat einen Baustein verloren: „…macherin“. Was macht sie? In der Werkstatt ticken Uhren.
- Abenteuer: Berufe-Rallye über mehrere Runden: Die Runde sucht für das Schulfest Menschen, die etwas vorführen. Auf den Türschildern stehen lange Wörter. Hinter der letzten Tür arbeitet eine Glasbläserin.

**L11 Quatsch finden** · Echt oder ausgedacht? (`echt-oder-ausgedacht`) · Kl. 1–4 (Schw. 1) / 2
- Sachgrund: Echt oder ausgedacht: Sachsätze prüfen (Kühe legen keine Eier).
- Sache wächst mit: Kl. 1–2: echt oder Quatsch im Alltag (Kühe legen keine Eier). Kl. 4: Woran prüft man, ob etwas stimmt (nachschlagen, zwei Quellen)?
- Rahmen: Forschen · Spannung aus: Rätsel
- Ruhig: Die Zeitung der Runde wird geprüft: „Kühe legen Eier.“ Das Wort, das nicht stimmen kann, wird ersetzt; dann wird gedruckt.
- Sanft: Ein Satz klingt wie Quatsch und stimmt doch: „Ein Fisch kann fliegen.“ Das Sachbild zeigt den Flugfisch.
- Abenteuer: Echt oder ausgedacht? Über mehrere Runden bekommt die Redaktion Leserbriefe mit unglaublichen Sätzen. Im Sachbuch nachgeschaut: Manche sind wahr (Kraken haben drei Herzen). Am Ende erscheint die Seite „Stimmt wirklich“.

**L12 Nachlesen** · Kinderrechte (`kinderrechte`) · Kl. 1–4 (Schw. 2) / 3
- Sachgrund: Kinderrechte stehen in einem Sachtext (Recht auf Spiel, auf Schule, auf Schutz); man liest gezielt nach.
- Sache wächst mit: Kl. 1–2: kurze Texte aus dem Alltag der Runde („Kinder dürfen spielen“). Kl. 3–4: die Kinderrechte als Sachtext, wer in der Gemeinde entscheidet.
- Rahmen: Fest · Spannung aus: Lücke
- Ruhig: Ein Plakat zu den Kinderrechten: Zu jeder Frage findet das Kind die Stelle im Text. Sie kommt aufs Plakat.
- Sanft: Zwei Kinder der Runde sind sich nicht einig, was im Text steht. Nachgelesen zeigt es die Stelle.
- Abenteuer: Kinderparlament über mehrere Runden: Die Klasse wünscht sich einen Zebrastreifen am Spielplatz. Für jeden Schritt wird nachgelesen: Wer entscheidet, wie schreibt man hin? Am Ende kommt eine Antwort der Bürgermeisterin.

**L13 Nachschlagen** · Wegklicken und Bescheid sagen (`sicher-im-netz`) · Kl. 2–4 (Schw. 2) / 2
- Sachgrund: Im Netz sucht man auf Kinderseiten, klickt weg, was komisch ist, und sagt Bescheid; Tabellen und Verzeichnisse nutzen.
- Sache wächst mit: Kl. 2: Tabelle und Inhaltsverzeichnis im Buch. Kl. 3–4: Kinderseiten im Netz, Verweise, was man wegklickt und wem man Bescheid sagt.
- Rahmen: Spur · Spannung aus: Rätsel
- Ruhig: Für ein Referat schlägt die Runde nach: im Buch und auf einer Kinderseite. Über Verzeichnis und Tabelle springt das Kind zur Angabe; sie kommt ins Heft.
- Sanft: Ein Fenster geht auf, das nicht zur Seite gehört. Kofi klickt es weg und sagt der Lehrerin Bescheid; dann geht die Suche weiter.
- Abenteuer: Über mehrere Runden baut die Klasse ein eigenes Lexikon über Tiere der Nacht: Stichwörter, Verweise, Verzeichnis. Zum Schluss sucht ein Gast darin und findet in drei Schritten, was er braucht.

**L14 Titel finden** · Medien im Alltag (`medien-alltag`) · Kl. 2–4 (Schw. 4) / 2
- Sachgrund: Medien im Alltag (Hörspiel, Video, Zeitung) bekommen Titel, damit man sie findet.
- Sache wächst mit: Kl. 2: Buch, Hörspiel, Film in der Medienkiste. Kl. 3–4: Wozu dienen Überschriften und Titel in Zeitung, Radio und Netz, und was versprechen sie?
- Rahmen: Fest · Spannung aus: Wissensvorsprung
- Ruhig: Die Medienkiste der Klasse: Hörspiel, Film, Sachbuch. Jeder passende Titel beschriftet eine Hülle; damit findet man es wieder.
- Sanft: Eine Hülle ist leer, eine CD hat keine Hülle. Der Anfang der Geschichte verrät, welcher Titel passt.
- Abenteuer: Schulradio über mehrere Runden: Die Runde macht eine Sendung und braucht für jeden Beitrag einen Titel, der neugierig macht und nicht zu viel verrät. Nach der Sendung fragen Kinder nach einem Beitrag, mit seinem Titel.

**L15 Spurenleser** · Wie Tiere atmen und Junge bekommen (`atmen-und-junge`) · Kl. 2–4 (Schw. 2) / 3
- Sachgrund: Wie Tiere atmen und Junge bekommen, zeigt sich an Spuren (Laich, Nest mit Schalen, Bau).
- Rahmen: Spur · Spannung aus: Rätsel
- Ruhig: Am Teich und im Wald am Tag: ein Nest mit Schalen, Laich im Wasser, ein Bau. Zwei Hinweise zusammen zeigen, wer hier Junge hat.
- Sanft: Etwas hat die Kräuter am Beet abgefressen. Spur und Köttel zusammen sagen: ein Hase.
- Abenteuer: Forscherwoche über mehrere Runden: Wer wohnt im Garten der Schule? Wildkamera, Spurentunnel, angenagte Zapfen. Jede Runde ein Rätsel. Das letzte Bild der Kamera zeigt einen Marder auf dem Schuppendach.

**L16 Wörterlupe** · Pilze und winzige Lebewesen (`pilze-kleinstlebewesen`) · Kl. 2–4 (Schw. 3) / 4
- Sachgrund: Pilze und Kleinstlebewesen haben Sachwörter (Sporen, Myzel); unbekannte Wörter aus dem Satz klären.
- Rahmen: Entdecken · Spannung aus: Rätsel · Fähigkeit: schrumpfen
- Ruhig: Ein Sachbuch über Pilze. Ein unbekanntes Wort wird aus dem Satz heraus geklärt und kommt ins Wörterheft; dann geht der Text weiter.
- Sanft: Ein Wort bedeutet hier etwas anderes als sonst: der „Hut“ des Pilzes. Der Satz zeigt es.
- Abenteuer: Die Runde schrumpft und steigt über mehrere Runden unter die Erde: Dort liegt das Geflecht des Pilzes wie ein Netz zwischen den Wurzeln. Jedes geklärte Wort (Sporen, Geflecht) macht ein Stück sichtbar. Wieder oben, stehen die Pilze im Kreis.

**L17 Bücherei** · Gemeinde, Bayern, Deutschland, Europa (`gemeinde-bis-europa`) · Kl. 2–4 (Schw. 3) / 4
- Sachgrund: Sagen aus der Gegend erzählen von Orten der Gemeinde; Sage, Märchen, Sachtext unterscheiden.
- Rahmen: Spur · Spannung aus: Rätsel
- Ruhig: Die Bücherei der Gemeinde: Der Anfang eines Textes verrät seine Sorte (Rezept, Gedicht, Sage). Im richtigen Fach wird er benutzt: gekocht, vorgelesen, gebaut.
- Sanft: Ein Text beginnt wie ein Märchen und ist ein Sachtext über Wölfe. Woran merkt man es?
- Abenteuer: Sagen der Gegend über mehrere Runden: Zu einem Felsen, einem Brunnen und einer Brücke im Ort gibt es eine Sage und einen Sachtext. Die Runde besucht den Ort und liest beides. Was davon wirklich so war, weiß die Ortschronistin.

**L18 Vorlese-Partitur** · Bewegen, Spielen, Ausruhen, Schlafen (`bewegen-schlafen`) · Kl. 1–4 (Schw. 2) / 1
- Sachgrund: Abends vorlesen gehört zum Ausruhen und Schlafen; betonen und Pausen machen es schön.
- Sache wächst mit: Kl. 1–2: Vorlesen am Abend, ausruhen. Kl. 3–4: Lesenacht und Vorlesen für Jüngere; was Schlaf dem Körper gibt.
- Rahmen: Fest · Spannung aus: Verwandlung
- Ruhig: Abends vorlesen: Das Kind setzt Pausen und Betonung und liest selbst. Der Erzähler liest genau nach diesen Marken; daraus wird ein Gute-Nacht-Hörbuch für ein jüngeres Kind.
- Sanft: Ein Satz geht über das Zeilenende. Wo ist die Pause wirklich? Falsch gesetzt, klingt er komisch, richtig gesetzt klar.
- Abenteuer: Lesenacht in der Schule über mehrere Runden: Schlafsäcke, Taschenlampen, die Lehrerin ist da. Jede Runde ein Kapitel einer Fortsetzungsgeschichte, vom Kind vorbereitet. Das letzte endet ruhig, und alle schlafen ein.


### Sprechen und Zuhören

**Z01 Lauschposten** · Sehen, hören, riechen, schmecken, tasten (`sinne`) · Kl. 1 / 1
- Sachgrund: Ohren hören Richtung und Lautstärke; Geräusche erkennen ist Lernkern der Sinne.
- Rahmen: Forschen · Spannung aus: Rätsel
- Ruhig: Auf dem Hof am Tag, mit geschlossenen Augen: Was ist das, und woher kommt es? Angetippt, zeigt sich die Quelle (Sachbild).
- Sanft: Ein Geräusch hört auf. Was fehlt jetzt? Der Brunnen ist abgestellt.
- Abenteuer: Nachtwanderung über mehrere Runden, mit Laterne und Lenas großem Bruder: ein Rascheln (ein Igel), ein Ruf (ein Käuzchen), ein Plätschern. Alle Geräusche sind leise, keines kommt plötzlich. Jede Runde endet am hellen Haus.

**Z02 Wäscheleine** · Hände waschen, Sonnenschutz (`haende-sonne`) · Kl. 1–2 (Schw. 1) / 1
- Sachgrund: Händewaschen geht nur in einer Reihenfolge (nass, Seife, reiben, abspülen, abtrocknen); Sonnenschutz ebenso.
- Rahmen: Versorgen · Spannung aus: Durcheinander
- Ruhig: Bildkarten für das Waschbecken: nass machen, Seife, reiben, abspülen, abtrocknen. In der gehörten Reihenfolge aufgehängt, spielt die Szene sie ab.
- Sanft: Eine Karte ist heruntergefallen. Kommt die Sonnencreme vor oder nach dem Anziehen? Die Hörgeschichte sagt es.
- Abenteuer: Badetag am See über mehrere Runden, Erwachsene sind dabei: eincremen, Hut, Schatten, trinken, nach dem Baden abtrocknen. Jede Runde ein Ablauf als Hörgeschichte. Am Ende hängt die Leine am Strandkorb.

**Z03 Auftrag** · Sicher über die Straße, Helm beim Rad (`sicher-ueber-die-strasse`) · Kl. 1–2 (Schw. 1) / 1
- Sachgrund: Über die Straße: anhalten, links, rechts, links schauen, Helm beim Rad; Aufträge nacheinander ausführen.
- Rahmen: Reise · Spannung aus: Hilfe
- Ruhig: Verkehrsgarten auf dem Schulhof: „Halt an. Schau nach links, dann nach rechts.“ Jeder ausgeführte Auftrag bringt ein Kind über den gemalten Zebrastreifen.
- Sanft: Drei Aufträge hintereinander, der mittlere war leise. Was kam nach „Helm auf“? Das Kind darf noch einmal hören.
- Abenteuer: Radtag im Verkehrsgarten über mehrere Runden, mit der Polizistin: Jede Runde ein längerer Parcours aus Aufträgen. Am Ende fährt die ganze Runde gemeinsam die große Schleife um den Hof.

**Z04 Hörbühne** · Niemand wird ausgelacht (`fuer-andere-einstehen`) · Kl. 1–4 (Schw. 1) / 2
- Sachgrund: Niemand wird ausgelacht: kurze Hörgeschichten zeigen, wie ein Kind für ein anderes einsteht.
- Sache wächst mit: Kl. 1–2: kurze Alltagsgeschichten, jemand stellt sich dazu. Kl. 3–4: längere Hörgeschichten mit mehreren Stimmen; Gerüchte und Vorurteile in einer Gruppe und wie jemand widerspricht.
- Rahmen: Fest · Spannung aus: Rätsel · Fähigkeit: ins Bild steigen
- Ruhig: Hörgeschichten aus dem Alltag. Danach baut das Kind die Bühne: wer, wo, was. Die Bühne spielt die Geschichte so nach, wie sie gebaut ist; das Kind sitzt in der ersten Reihe.
- Sanft: In der Geschichte lacht jemand über Kofis Zeichnung. Ela stellt sich daneben und sagt, was ihr daran gefällt. Welche Einzelheit hat das Kind gehört?
- Abenteuer: Hörspiel in Fortsetzungen über mehrere Runden: Wer nimmt die Pausenbrote? Verdächtigt wird der Neue, zu Unrecht, und Lena sagt das laut. Am Ende war es der Schulhund. (Niemand wird bestraft, der Konflikt bleibt kurz.)

**Z05 Noch mal, bitte** · Höflich miteinander reden (`hoeflich-reden`) · Kl. 1–3 (Schw. 1) / 1
- Sachgrund: Höflich nachfragen („Wie bitte? Noch mal, bitte.“) gehört zum höflichen Reden; laute Orte geben den Anlass.
- Rahmen: Reise · Spannung aus: Lücke
- Ruhig: Am Bahnhof erklärt die Schaffnerin den Weg zum Gleis. Ein Wort geht im Lärm unter: losgehen oder nachfragen? Nach der Bitte sagt sie es noch einmal.
- Sanft: Die Durchsage nennt ein Wort, das die Runde nicht kennt („Wagenreihung“). Die passende Frage klärt es.
- Abenteuer: Klassenfahrt über mehrere Runden: Bahnhof, Fähre, Jugendherberge. Überall wird etwas erklärt, und immer fehlt ein Stück. Am Ende findet die Runde den Speisesaal, weil sie dreimal gefragt hat.

**Z06 Gesprächszug** · Streiten und sich versöhnen (`streit-versoehnen`) · Kl. 1–4 (Schw. 1) / 1
- Sachgrund: Streiten und sich versöhnen: Ich-Botschaft, Entschuldigung, Trösten; der Konflikt kurz, die Lösung ausführlich.
- Sache wächst mit: Kl. 1–2: trösten, sich entschuldigen, abwechseln. Kl. 3–4: Kompromisse finden, Streit schlichten, sagen, was man braucht.
- Rahmen: Miteinander · Spannung aus: Hilfe
- Ruhig: Szenen in der Runde: Lena hat Geburtstag, Kofi zeigt sein Knie. Das Kind sieht, wie es dem anderen geht, und wählt, was es jetzt sagt; das Gespräch geht weiter.
- Sanft: Kofi und Lena wollen dieselbe Schaukel. Kurz wird es laut. Dann sagt einer, was er möchte, und sie wechseln sich ab.
- Abenteuer: Das Baumhaus über mehrere Runden: vier Kinder, vier Ideen. Jede Runde eine Meinungsverschiedenheit (Leiter oder Seil? Wer malt?) und ein Gespräch, das sie löst. Am Ende steht es, mit Leiter und Seil.

**Z07 Stuhlkreis** · Warten und verlieren können (`warten-verlieren`) · Kl. 1–4 (Schw. 1) / 1
- Sachgrund: Warten, bis man dran ist, und verlieren können gehören zum Stuhlkreis und zum Spiel.
- Sache wächst mit: Kl. 1–2: warten, bis man dran ist. Kl. 4: Klassenrat mit Rollen, abstimmen und ein Ergebnis mittragen, das man nicht wollte.
- Rahmen: Miteinander · Spannung aus: Durcheinander
- Ruhig: Im Stuhlkreis wandert der Redestein. Das Kind tippt auf den Moment, in dem eine Regel fehlt; dann läuft das Gespräch noch einmal, und alle verstehen sich.
- Sanft: Zwei reden gleichzeitig los. Wer hat den Stein? Er entscheidet.
- Abenteuer: Über mehrere Runden plant die Klasse im Klassenrat ihr Sommerfest: jede Runde ein Punkt, das Kind verteilt die Rollen. Bei der Abstimmung bekommt Timos Vorschlag keine Mehrheit. Er hilft trotzdem beim Aufbauen, und sein Vorschlag kommt auf die Liste fürs nächste Mal.

**Z08 Weil-Brücke** · Eis, Wasser, Dampf (`eis-wasser-dampf`) · Kl. 2–4 (Schw. 4) / 2
- Sachgrund: Eis schmilzt, Wasser verdampft: Vermutungen äußern und begründen.
- Sache wächst mit: Kl. 2: Eis schmilzt, Wasser gefriert. Kl. 4: verdampfen und verdunsten, Wärme und Kälte als Ursache; Vermutung, Versuch, Ergebnis.
- Rahmen: Forschen · Spannung aus: Vorhersage
- Ruhig: Eiswürfel auf der Fensterbank: „Ich glaube, dass er schmilzt, weil die Sonne scheint.“ Dann läuft der Versuch, und alle sehen es.
- Sanft: Zwei Vermutungen stehen gegeneinander: Schmilzt der Würfel im Wollhandschuh schneller oder langsamer? Jede braucht ihren Grund; der Versuch zeigt es.
- Abenteuer: Forscherkiste über mehrere Runden: Wohin verschwindet die Pfütze? Warum beschlägt das Fenster? Jede Runde ein Rätsel, eine Vermutung mit Grund, ein Versuch. Beim letzten steigt Dampf aus dem Kessel und wird am kalten Löffel wieder Wasser (ein Erwachsener kocht).

**Z09 Tonstudio** · Gefühle im Gesicht und im Körper (`gefuehle-erkennen`) · Kl. 1–4 (Schw. 3) / 1
- Sachgrund: Gefühle hört man in der Stimme und sieht man im Gesicht; Aufnahmen machen, keine falsche Antwort beim Gefühl.
- Sache wächst mit: Kl. 1–2: froh, traurig, wütend in Stimme und Gesicht. Kl. 3–4: feine Unterschiede (aufgeregt, verlegen, erleichtert), wie eine Stimme im Hörspiel eine Figur zeigt.
- Rahmen: Fest · Spannung aus: Verwandlung
- Ruhig: Im Tonstudio: ein Reim, ein Satz, eine Ansage. Das Kind nimmt sich auf, hört sich an und prüft mit der Kontrollkarte: laut genug, deutlich?
- Sanft: Derselbe Satz, einmal froh, einmal müde. Wie klingt er? Beim Gefühl gibt es kein Falsch.
- Abenteuer: Ein Hörspiel über mehrere Runden: Die Runde vertont eine Geschichte mit Stimmen und Geräuschen (Kokosnuss für Hufe, Folie für Regen). Bei der Premiere im Klassenzimmer raten die anderen, womit der Donner gemacht wurde: mit einem Backblech.

**Z10 Erzählkino** · Mein Tag: morgens, mittags, abends (`mein-tag`) · Kl. 1–4 (Schw. 3) / 1
- Sachgrund: Mein Tag: morgens, mittags, abends; vom eigenen Tag in Reihenfolge erzählen.
- Sache wächst mit: Kl. 1–2: der eigene Tag. Kl. 3–4: der Tag von anderen (Bäckerin, Igel, Kind auf einer Hallig), Zeitangaben und Höhepunkt beim Erzählen.
- Rahmen: Fest · Spannung aus: Lücke
- Ruhig: Ein Film über einen Tag: morgens, mittags, abends. Das Kind legt die Bilder, setzt „zuerst“ und „danach“ davor und erzählt dazu.
- Sanft: Zwischen Frühstück und Schule fehlt ein Bild. Was ist dazwischen passiert? Das Kind erzählt es.
- Abenteuer: Ein Tag anderswo über mehrere Runden: der Tag der Bäckerin (er beginnt nachts), der Tag eines Igels, der Tag auf einer Hallig. Das Kind erzählt jeden als Film. Am Ende laufen alle beim Kinoabend der Klasse.

**Z11 Reporterheft** · Wie Kinder anderswo leben (`kinder-anderswo`) · Kl. 1–4 (Schw. 3) / 3
- Sachgrund: Kinder anderswo leben verschieden (Schulweg mit Boot, Bus oder zu Fuß); Reporter fragen nach, ohne exotisch.
- Sache wächst mit: Kl. 1–2: Schulweg und Pausenspiel anderswo. Kl. 3–4: Alltag, Wohnen und Schule in anderen Ländern, immer gleichwertig und nie als Besonderheit erzählt.
- Rahmen: Forschen · Spannung aus: Wissensvorsprung
- Ruhig: Videoanruf mit einer Partnerklasse: Das Kind wählt Reporterfragen; jede Antwort füllt eine Seite im Heft.
- Sanft: Eine Antwort wirft eine neue Frage auf („Wir fahren mit dem Boot zur Schule.“). Welche Frage passt jetzt?
- Abenteuer: Über mehrere Runden macht die Runde eine Zeitung mit der Partnerklasse: Schulweg, Pausenspiel, Lieblingsessen. Ein Paket ist unterwegs. Darin liegt ein Spiel, das beide Klassen noch nicht kannten.


### Geometrie

**R01 Hinlegen, wo es hingehört** · Ich habe mich verlaufen – wen frage ich? (`verlaufen`) · Kl. 1 / 1
- Sachgrund: Wer sagen kann, wo etwas ist (neben, hinter, vor), findet sich und andere wieder. Vor einem Ausflug macht man einen Treffpunkt aus; wer jemanden nicht findet, bleibt stehen und fragt an der Kasse oder Eltern mit Kindern.
- Rahmen: Reise · Spannung aus: Rätsel
- Ruhig: Vor dem Ausflug in den Zoo macht die Runde einen Treffpunkt aus: „neben dem Brunnen, vor dem Kiosk“. Das Kind legt die Dinge im Plan dorthin, wo der Erzähler sagt; dann wissen alle, wo man sich trifft. (Auf keiner Stufe geht ein Kind verloren.)
- Sanft: Lenas Mütze ist weg. Sie beschreibt der Frau an der Kasse, wo sie zuletzt saß („auf der Bank hinter dem Karussell“). Dort liegt sie.
- Abenteuer: Zoo-Rallye über mehrere Runden, immer zu zweit und mit Treffpunkt: Die Hinweise sind Lagewörter („unter der Brücke, zwischen den Bambusstäben“). Am Ziel hängt etwas hinter der Scheibe und rührt sich nicht: ein Faultier.

**R02 Dem Weg folgen** · Sicher über die Straße, Helm beim Rad (`sicher-ueber-die-strasse`) · Kl. 1–3 (Schw. 1) / 1
- Sachgrund: Der sichere Weg führt über Ampel und Zebrastreifen; Pfeilwegen folgen.
- Sache wächst mit: Kl. 1: der sichere Weg über Ampel und Zebrastreifen. Kl. 3: Wege im Ortsplan beschreiben, Radwege und Regeln für das Rad.
- Rahmen: Reise · Spannung aus: Durcheinander
- Ruhig: Ein Brief für die Nachbarin. Das Kind liest die Pfeilkette und tippt vorher, wo der Weg endet; dann geht Ela ihn über Ampel und Zebrastreifen.
- Sanft: Eine Baustelle versperrt den Gehweg. Die neue Pfeilkette führt über die Ampel. Wo kommt sie an?
- Abenteuer: Schulweg-Karte über mehrere Runden: Die Runde probiert Wege für die neuen Erstklässler aus und markiert den sichersten. An einer Ecke steht jeden Morgen jemand in Gelb: der Schülerlotse. Am Ende steht er mit auf dem Plan.

**R03 Den Weg legen** · Was rollt? Murmelbahn und Fahrzeuge (`was-rollt`) · Kl. 1–3 (Schw. 1) / 1
- Sachgrund: Kugeln und Zylinder rollen; eine Murmelbahn braucht einen gelegten Weg.
- Sache wächst mit: Kl. 1: Was rollt, kommt an. Kl. 3: Gefälle, Schwung und Kurven; Wegbeschreibungen mit Fehler finden.
- Rahmen: Bauen · Spannung aus: Vorhersage
- Ruhig: Eine Murmelbahn: Die Pfeilkarten legen den Weg. Erst wenn alle liegen, rollt die Murmel los. Kommt sie ins Ziel?
- Sanft: Ein Bauklotz liegt im Weg. Der Weg muss außen herum; welche Karte wird getauscht?
- Abenteuer: Die längste Bahn der Schule über mehrere Runden: vom Fensterbrett durchs Klassenzimmer bis in den Flur, mit Trichter, Wippe und Glocke. Jede Runde ein Abschnitt. In der letzten rollt die Murmel durch alle und läutet die Glocke.

**R04 Formen nach einem Merkmal einsortieren** · Ampel, Zebrastreifen, Verkehrszeichen (`verkehrszeichen`) · Kl. 1–2 (Schw. 1) / 1
- Sachgrund: Verkehrszeichen haben feste Formen (Dreieck warnt, Kreis gebietet, Viereck weist hin).
- Rahmen: Spur · Spannung aus: Rätsel
- Ruhig: Schilder für den Verkehrsgarten: runde, dreieckige, viereckige. Jedes kommt in die Kiste mit seinem Merkmal und dann an seinen Pfahl.
- Sanft: Ein Schild ist eingeschneit, man sieht nur die Form: acht Ecken. Davon gibt es nur eines, das Stoppschild.
- Abenteuer: Schilder-Suche über mehrere Runden durch die Stadt, mit der Polizistin: Welche Formen gibt es, und was sagen sie? Die Runde sammelt Fotos nach Merkmalen. Eines hat keine der Formen: das Andreaskreuz am Bahnübergang.

**R05 Den Körper geben, der bestellt ist** · Berufe in Hof, Werkstatt, Laden und Pflege (`berufe`) · Kl. 2–3 (Schw. 2) / 2
- Sachgrund: Im Laden räumt die Verkäuferin Dosen (Zylinder), Kartons (Quader) und Bälle (Kugeln) ein.
- Rahmen: Werkstatt · Spannung aus: Rätsel
- Ruhig: Im Laden wird eingeräumt: Dosen zu den Zylindern, Kartons zu den Quadern. Das Kind gibt den bestellten Körper; ist das Regal voll, öffnet der Laden.
- Sanft: Ein Ding passt in keine Reihe: die Eistüte. Welcher Körper ist das? Ein Kegel.
- Abenteuer: Ein Tag in vier Berufen über mehrere Runden: Bäckerin, Maurer, Töpferin, Eisverkäufer. Überall wird ein Körper bestellt. Am Abend baut die Runde aus leeren Verpackungen eine Stadt.

**R06 Lückenlos belegen und zählen** · Werkzeuge und wofür man sie nimmt (`werkzeuge`) · Kl. 1–4 (Schw. 1) / 1
- Sachgrund: Modelle baut man in der Werkstatt aus Stäben und Kugeln; jedes Werkzeug hat seinen Zweck.
- Sache wächst mit: Kl. 1–2: Ecken und Seiten an Formen legen. Kl. 3–4: Kantenmodelle wie im Gerüstbau, Bauwerke aus Dreiecken.
- Rahmen: Bauen · Spannung aus: Vorhersage
- Ruhig: In Elas Werkstatt entstehen Kantenmodelle: auf jede Kante ein Stab, an jede Ecke eine Kugel. Ist nichts mehr frei, steht das Modell; dann wird gezählt.
- Sanft: Für den Würfel liegen nur elf Stäbe da. Reicht das? Erst vorhersagen, dann bauen: Eine Kante bleibt offen.
- Abenteuer: Kuppelbau über mehrere Runden: Aus Stäben und Kugeln entsteht erst ein Würfel, dann eine Pyramide, zuletzt eine Kuppel aus Dreiecken, groß genug zum Hineinsetzen. Vor jedem Schritt: Wie viele Stäbe? Am Ende sitzt die Runde darin.

**R07 Den Umriss füllen** · Schwimmen nur mit Aufsicht (`schwimmen-aufsicht`) · Kl. 1–4 (Schw. 4) / 1
- Sachgrund: Im Schwimmbad geht es erst ins Wasser, wenn die Aufsicht da ist. Bis dahin wird am Beckenrand aufgebaut: Matten und Bretter füllen ihren Platz lückenlos, und Mosaike am Becken bestehen aus Formen ohne Lücke.
- Sache wächst mit: Kl. 1: Baderegeln (nur mit Aufsicht, nicht rennen). Kl. 3–4: Schwimmabzeichen und was man dafür können muss; Mosaike und Parkette als Muster.
- Rahmen: Bauen · Spannung aus: Lücke
- Ruhig: Vor dem Schwimmen: Bretter und Matten gehören lückenlos in ihren Rahmen am Beckenrand. Ist das Bild gelegt und die Bademeisterin an ihrem Platz, geht es ins Wasser.
- Sanft: Ein Teil passt nur gedreht. Das Kind dreht es, und die Lücke schließt sich.
- Abenteuer: Über mehrere Runden legt die Runde mit der Bademeisterin ein neues Mosaik für die Schwimmhalle: Welle, Fisch, Boot. Das letzte Bild ist ein Rätsel aus Umrissen. Gelegt, zeigt es die Bademeisterin auf ihrem Hochsitz.

**R08 Mit gleichen Plättchen auslegen** · Was Pflanzen brauchen (`was-pflanzen-brauchen`) · Kl. 2–4 (Schw. 4) / 1
- Sachgrund: Pflanzen brauchen Platz, Licht und Wasser; jedes Beet bekommt so viele Plätze, wie es Fläche hat.
- Sache wächst mit: Kl. 2: Pflanzen brauchen Platz, Licht und Wasser. Kl. 3–4: Beetplanung im Schulgarten (wer braucht wie viel Platz, Fruchtfolge), Flächen in Quadratzentimetern und Quadratmetern.
- Rahmen: Versorgen · Spannung aus: Vorhersage
- Ruhig: Zwei Beete: Welches ist größer? Mit gleichen Platten ausgelegt und gezählt, zeigt es sich; aufs größere kommen die Kürbisse, die viel Platz brauchen.
- Sanft: Ein Beet ist lang und schmal, eines kurz und breit. Kofi tippt auf das lange. Ausgelegt sind beide gleich groß.
- Abenteuer: Der Schulgarten wird über mehrere Runden neu geplant: Radieschen brauchen wenig Platz, Kürbisse viel. Die Runde legt aus und sät. Im Sommer zeigt sich, ob der Kürbis im Beet geblieben ist: Er ist über den Weg gewachsen.

**R09 Den Rand abzäunen** · Was Pflanzen brauchen (`was-pflanzen-brauchen`) · Kl. 2–4 (Schw. 4) / 1
- Sachgrund: Ein Beet braucht einen Zaun, damit nichts hineintritt; der Rand ist der Umfang (gleiche Welt wie R08 zum Mischen).
- Sache wächst mit: Kl. 2: Ein Zaun schützt das Beet. Kl. 4: Wer frisst am Salat und was hilft; gleiche Fläche, verschiedener Umfang.
- Rahmen: Forschen · Spannung aus: Vorhersage
- Ruhig: Die Beete bekommen einen niedrigen Zaun, damit niemand hineintritt. Latte für Latte um den Rand: Welches Beet braucht mehr?
- Sanft: Zwei Beete sind gleich groß, aber eines braucht mehr Zaun. Wie kann das sein? Nachgelegt sieht man es.
- Abenteuer: Schneckenforscher über mehrere Runden: Etwas knabbert am Salat. Die Runde baut einen Schneckenzaun und will mit denselben Latten möglichst viel Beet schützen. Welche Form nimmt man? Am Morgen sitzt die Schnecke außen am Zaun.

**R10 Formen spannen** · Auf dem Bauernhof (`bauernhof`) · Kl. 1–2 (Schw. 1) / 1
- Sachgrund: Auf dem Hof steckt man Gehege und Weiden mit Schnur und Pflöcken ab.
- Rahmen: Versorgen · Spannung aus: Durcheinander
- Ruhig: Neue Weiden für die Ziegen: Mit Schnur und Pflöcken spannt das Kind die Form, die die Bäuerin braucht. Steht das Gehege, kommen die Ziegen.
- Sanft: „Ein Rechteck, das kein Quadrat ist.“ Die erste Schnur ergibt ein Quadrat; ein Pflock wird umgesteckt.
- Abenteuer: Weidewechsel über mehrere Runden: Jede Woche brauchen die Ziegen frisches Gras, also eine neue Form um Baum, Teich und Stall herum. Eine Ziege steht jedes Mal schon auf dem Stalldach und schaut zu.

**R11 Das Werkzeug richtig anlegen** · Himmelsrichtungen und Karten (`karten`) · Kl. 2–4 (Schw. 4) / 3
- Sachgrund: Auf Karten misst man mit dem Lineal ab Null; der Maßstab macht aus Zentimetern Kilometer.
- Sache wächst mit: Kl. 2: mit dem Lineal messen und zeichnen. Kl. 3–4: Karte, Himmelsrichtungen, Maßstab, rechter Winkel beim Planen.
- Rahmen: Reise · Spannung aus: Vorhersage
- Ruhig: Eine Wanderung wird geplant: Lineal mit der Null an den Start, Maßstabsleiste an den Weg. Jede Messung zeichnet ein Wegstück.
- Sanft: Zwei Wege führen zur Hütte. Welcher ist kürzer? Erst schätzen, dann messen.
- Abenteuer: Schatzkarte der Klasse über mehrere Runden: Die Runde versteckt etwas im Stadtpark und zeichnet die Karte dazu, mit Himmelsrichtung, Winkel und Maß. Eine andere Klasse sucht danach und findet es beim ersten Versuch.

**R12 Würfelbau nachbauen** · Türme, die fest stehen (`tuerme-bauen`) · Kl. 2–4 (Schw. 2) / 1
- Sachgrund: Türme stehen fest, wenn Würfel richtig aufeinander lasten.
- Sache wächst mit: Kl. 2: Türme, die stehen bleiben. Kl. 3–4: Bauplan und Ansichten, wie Architektinnen ein Haus von allen Seiten zeichnen.
- Rahmen: Bauen · Spannung aus: Rätsel · Fähigkeit: schrumpfen
- Ruhig: Türme nach Foto: Das Kind baut nach, was das Bild zeigt. Steht der Turm wie auf dem Foto, wird er fotografiert.
- Sanft: Auf dem Foto ist ein Würfel nicht zu sehen. Er muss aber da sein, sonst würde der obere schweben.
- Abenteuer: Die Würfelstadt über mehrere Runden: jede Runde ein Gebäude nach Plan. Dann schrumpft die Runde und geht durch ihre Straßen. Von unten sieht ein Turm anders aus als auf dem Plan. Von oben stimmt er.

**R13 Von oben eintragen** · Himmelsrichtungen und Karten (`karten`) · Kl. 3–4 (Schw. 4) / 3
- Sachgrund: Lagepläne zeigen Orte von oben; Karten haben Himmelsrichtungen.
- Rahmen: Entdecken · Spannung aus: Vorhersage · Fähigkeit: schweben
- Ruhig: Ein Lageplan des Schulgeländes für neue Kinder: Jedes Gebäude wird von oben eingetragen. Hängt der Plan am Eingang, findet ein Gast die Turnhalle.
- Sanft: Ein Gast steht mit dem Plan vor der falschen Tür. Was ist falsch eingetragen?
- Abenteuer: Mit dem Ballon schwebt die Runde über mehrere Runden über Schule, Dorf und Tal und zeichnet, was sie von oben sieht. Zurück am Boden geht sie einen Weg nach dem eigenen Plan. Stimmt er, kommt sie am Badesee an.

**R14 Wer sieht was?** · Der Mond und seine Gestalten (`mond`) · Kl. 2–3 (Schw. 3) / 3
- Sachgrund: Die Mondgestalten entstehen, weil wir die beleuchtete Hälfte von verschiedenen Seiten sehen (Ansichten).
- Rahmen: Forschen · Spannung aus: Vorhersage · Fähigkeit: schweben
- Ruhig: Ball und Lampe im Guckkasten: Durch welches Loch sieht man den Ball halb hell? Jede richtige Ansicht zeigt eine Mondgestalt.
- Sanft: Kofi und Lena sehen denselben Ball verschieden. Wer sitzt wo? Die Ansicht verrät den Platz.
- Abenteuer: Ein Monat mit dem Mond über mehrere Runden: Jeden Abend schaut die Runde aus dem Fenster und sagt vorher, wie er morgen aussieht. Am Ende schwebt sie im Ballon so weit hinaus, dass Sonne, Erde und Mond zugleich zu sehen sind (Sachbild).

**R15 Falten und vorhersagen** · Raupe und Schmetterling, Kaulquappe und Frosch (`vom-ei-zum-tier`) · Kl. 2–3 (Schw. 2) / 2
- Sachgrund: Schmetterlingsflügel sind symmetrisch; vom Ei über Raupe und Puppe zum Falter.
- Rahmen: Forschen · Spannung aus: Vorhersage
- Ruhig: Schmetterlinge fürs Fenster: Ein halber Flügel ist gemalt. Wie sieht er aufgeklappt aus? Erst vorhersagen, dann aufklappen.
- Sanft: Ein Fleck sitzt nah an der Faltlinie. Wo landet er auf der anderen Seite?
- Abenteuer: Im Schmetterlingshaus über mehrere Runden: Die Runde sucht Falter nach halben Bildern. Ein Flügel hat einen Fleck, der wie ein Auge aussieht: das Tagpfauenauge (Sachbild). Am Ende schlüpft im Kasten ein Falter und klappt die Flügel auf.

**R16 Ins Gitter übertragen** · Insel und See, Halbinsel und Bucht (`land-und-wasser`) · Kl. 1–4 (Schw. 4) / 2
- Sachgrund: Inseln spiegeln sich im See; Land- und Wasserformen im Gitter abzeichnen und vergrößern.
- Sache wächst mit: Kl. 1–2: Insel, See, Bucht abzeichnen. Kl. 4: Karten vergrößern und verkleinern (Maßstab), Küstenformen mit Namen.
- Rahmen: Bauen · Spannung aus: Verwandlung
- Ruhig: Eine Seenkarte wird ins Gitter abgezeichnet, Kästchen für Kästchen. Fertig, wird sie gerahmt.
- Sanft: Die Karte soll doppelt so groß an die Wand. Aus einem Kästchen werden vier. Stimmt die Insel noch?
- Abenteuer: Die Insel der Runde über mehrere Runden: Sie erfindet eine Insel, zeichnet sie ab, spiegelt sie zur Zwillingsinsel und vergrößert sie zur Wandkarte. Am Ende fährt ein Papierschiff im Sandkasten um die gebaute Insel.

**R17 Post nach Planquadrat** · Nah und fern, Stadt und Land (`stadt-und-land`) · Kl. 3 / 2
- Sachgrund: Stadt und Land haben Pläne mit Planquadraten; die Post findet so jedes Haus.
- Rahmen: Reise · Spannung aus: Rätsel
- Ruhig: Post austragen im Dorf: Auf jedem Brief steht ein Planquadrat. Richtig gefunden, kommt der Brief an.
- Sanft: Auf einem Brief ist das Quadrat verwischt: B und eine Zahl. Im Brief steht „neben der Kirche“.
- Abenteuer: Vertretung für die Briefträgerin über mehrere Runden: erst das Dorf, dann die Kleinstadt, dann ein Viertel der Großstadt. Ein Brief hat ein Quadrat, in dem nur Wasser ist. Er geht an das Hausboot.

**R18 Muster weiterlegen** · Feste im Kalender (`feste-im-kalender`) · Kl. 1–3 (Schw. 1) / 1
- Sachgrund: Feste haben Schmuck mit Mustern (Girlanden, Bänder), als Brauch gleichwertig.
- Sache wächst mit: Kl. 1: Girlanden und Bänder. Kl. 3: Muster in Bräuchen vieler Feste (Laternen, Rangoli, Ostereier, Sterne), immer als Brauch und gleichwertig.
- Rahmen: Fest · Spannung aus: Durcheinander
- Ruhig: Der Raum wird für ein Fest geschmückt. Jedes fortgesetzte Muster verlängert die Girlande; reicht sie durch den Raum, wird gefeiert.
- Sanft: In der Girlande ist ein Stück falsch aufgefädelt. Wo bricht das Muster?
- Abenteuer: Feste des Jahres über mehrere Runden: Laternen, Girlanden, Muster aus Farbpulver am Boden, bemalte Eier. Jede Runde ein Fest mit seinem Muster. Das letzte Muster erfindet die Runde selbst, für das Klassenfest.

**R19 Netz falten** · Wer an meinem Brot mitgearbeitet hat (`wer-macht-mein-brot`) · Kl. 3–4 (Schw. 4) / 2
- Sachgrund: Brot und Brezen werden in gefalteten Schachteln geliefert; Netze falten.
- Sache wächst mit: Die Welt gehört zu Kl. 2, das Spiel zu Kl. 3–4. Hier geht es deshalb um Verpackung und Lieferung: wie Brot und Kuchen heil ankommen, wie man Karton spart.
- Rahmen: Werkstatt · Spannung aus: Vorhersage
- Ruhig: Schachteln für die Bäckerei: Welches Netz ergibt eine Schachtel? Erst vorhersagen, dann falten.
- Sanft: Ein Netz sieht richtig aus und bleibt an einer Seite offen. Welche Fläche muss umziehen?
- Abenteuer: Über mehrere Runden entwirft die Runde eigene Verpackungen: für eine Breze, ein Brot, eine Torte. Wenig Karton, nichts darf wackeln. Am Markttag trägt die Bäckerin die Torte darin über den Platz. Sie kommt heil an.

**R20 Rollt es oder kippt es?** · Was rollt? Murmelbahn und Fahrzeuge (`was-rollt`) · Kl. 2 / 1
- Sachgrund: Was rollt und was kippt: Kugeln rollen in alle Richtungen, Zylinder geradeaus.
- Rahmen: Forschen · Spannung aus: Vorhersage
- Ruhig: Dinge auf der Rampe: Rollt es oder kippt es? Erst vorhersagen, dann loslassen. Jede Vorhersage kommt ins Testheft.
- Sanft: Die Dose rollt, aber nur auf der Seite. Hingestellt bleibt sie stehen. Wie muss sie liegen?
- Abenteuer: Seifenkisten über mehrere Runden: Die Runde baut ein Fahrzeug und probiert Räder aus (Scheiben, Kugeln, eine Walze, zum Spaß auch eckige). Vor jedem Start wird vorhergesagt. Die Kiste mit den eckigen Rädern hoppelt einen Meter und bleibt stehen.

## 3. Welten und ihre Spiele

| Welt (id) | Klasse | stufe_ab | Spiele |
|---|---|---|---|
| Tiere auf Wiese und Hecke (`wiese-und-hecke`) | 1 | ruhig | M35 Tüten packen, M37 Kettenhüpfer |
| Fell, Federn, Schuppen (`fell-federn-schuppen`) | 1 | ruhig | G01 Dreieck und Kreis |
| Tarnen und Verstecken (`tarnen-verstecken`) | 1 | ruhig | L03 Geheimsprache, S07 Merken |
| Wer frisst was? (`wer-frisst-was`) | 1 | sanft | G04 Satz-Bilder |
| Fünf Gruppen von Wirbeltieren (`wirbeltierklassen`) | 2 | ruhig | G13 Kisten packen |
| Tiere auf allen Erdteilen (`tiere-der-erdteile`) | 2 | ruhig | L02 Abzählen |
| Haustiere und was sie brauchen (`haustiere`) | 1 | ruhig | M16 Aufgabenfamilie, M52 Je mehr … |
| Auf dem Bauernhof (`bauernhof`) | 1 | ruhig | R10 Formen spannen, S04 Das lange Wort |
| Wurzel, Stängel, Blatt, Blüte (`teile-der-pflanze`) | 1 | ruhig | S01 Wörter legen |
| Was Pflanzen brauchen (`was-pflanzen-brauchen`) | 1 | ruhig | R08 Mit gleichen Plättchen auslegen, R09 Den Rand abzäunen |
| Samen gehen auf Reisen (`samen-reisen`) | 2 | ruhig | G08 Eins und viele, M12 Hundertertafel |
| Obst und Gemüse und wann es reif ist (`obst-gemuese-reif`) | 2 | ruhig | L04 Laut-Körbe, M15 Mach voll |
| Unbekannte Pflanzen nicht essen (`unbekannte-pflanzen`) | 1 | ruhig | L08 Kaufladen |
| Tiere im Winter, Frühblüher, Herbstfrüchte (`jahreszeiten-natur`) | 1 | ruhig | M17 Was passiert? |
| Raupe und Schmetterling, Kaulquappe und Frosch (`vom-ei-zum-tier`) | 2 | ruhig | R15 Falten und vorhersagen, S02 Silbenbogen |
| Wald und Teich (`wald-und-teich`) | 3 | ruhig | M24 Rechenstrich |
| Wie Tiere atmen und Junge bekommen (`atmen-und-junge`) | 3 | ruhig | L15 Spurenleser |
| Tierbaum und Pflanzenbaum (`tierbaum-pflanzenbaum`) | 3 | ruhig | S05 Der Wortbaum |
| Pilze und winzige Lebewesen (`pilze-kleinstlebewesen`) | 4 | ruhig | L16 Wörterlupe |
| Wie Menschen Wald und Wasser verändern (`mensch-und-natur`) | 4 | ruhig | G06 Wer, wem, was? |
| Was Luft kann (`was-luft-kann`) | 1 | ruhig | M54 Säckchen |
| Wetter beobachten und messen (`wetter-messen`) | 2 | ruhig | M51 Ablesen |
| Was man bei Gewitter tut (`gewitter`) | 1 | ruhig | M48 Wie lange? |
| Holz, Metall, Glas, Wolle, Papier (`stoffe`) | 1 | ruhig | G10 Fundbüro |
| Müll trennen (`muell-trennen`) | 1 | ruhig | M14 Zwei Tonnen |
| Eis, Wasser, Dampf (`eis-wasser-dampf`) | 2 | ruhig | Z08 Weil-Brücke |
| Der Weg des Wassers (`wasserkreislauf`) | 3 | ruhig | M29 Zahlenmaschine |
| Tag und Nacht, Sonne und Erde (`tag-und-nacht`) | 1 | ruhig | M47 Die Uhr |
| Der Mond und seine Gestalten (`mond`) | 3 | ruhig | R14 Wer sieht was? |
| Sonne, Sterne, Planeten (`am-himmel`) | 2 | ruhig | M05 Was sagt die Zahl? |
| Steine, Sand und Boden (`steine-boden`) | 2 | ruhig | M45 Wiegen |
| Gebirge und das Innere der Erde (`gebirge-vulkane`) | 3 | sanft | M09 Aufdecken |
| Wenn ein Vulkan ausbricht (`vulkanausbruch`) | 3 | abenteuer | **keins** (Abschnitt 4) |
| Strom und Stromkreis (`strom`) | 3 | ruhig | G07 Satz-Brücke |
| Wasser sparen und sauber halten (`wasser-sauber`) | 3 | ruhig | M46 Umfüllen |
| Was Magnete anziehen (`magnete`) | 3 | ruhig | M33 Stimmt das? |
| Mein Tag: morgens, mittags, abends (`mein-tag`) | 1 | ruhig | Z10 Erzählkino |
| Woche, Monat, Jahr (`jahreskreis`) | 1 | ruhig | M27 Gleiche Sprünge, M49 Kalender |
| Feste im Kalender (`feste-im-kalender`) | 1 | ruhig | L07 Lesefenster, R18 Muster weiterlegen |
| Vom Baby bis heute (`lebenskette`) | 1 | ruhig | M18 Wie viel mehr? |
| Früher und heute: Spielzeug, Schule, Familie (`frueher-heute`) | 2 | ruhig | G03 Zeit-Uhr, S19 Zwei Schriften |
| Echt oder ausgedacht? (`echt-oder-ausgedacht`) | 2 | ruhig | L11 Quatsch finden |
| Die lange Zeitleiste des Lebens (`zeitleiste-des-lebens`) | 2 | ruhig | M11 Flug zur Zahl |
| Dinosaurier: wie groß, was sie fraßen (`dinosaurier`) | 2 | sanft | **keins** (Abschnitt 4) |
| Warum es keine Dinosaurier mehr gibt (`dinosaurier-aussterben`) | 3 | abenteuer | **keins** (Abschnitt 4) |
| Wie die Zahlen entstanden sind (`geschichte-der-zahlen`) | 1 | ruhig | M03 Alle da?, M55 Zahlenrätsel |
| Wie die Schrift entstanden ist (`geschichte-der-schrift`) | 1 | ruhig | S09 Schere, S10 Bücherei |
| Die ersten Menschen: Werkzeug, Feuer, Ackerbau (`erste-menschen`) | 3 | ruhig | M07 Bündeln |
| Wie Erfindungen sich verändern (`erfindungen`) | 3 | ruhig | G12 Wort-Werkstatt, M34 So geht es |
| Jahr, Jahrzehnt, Jahrhundert (`jahrhunderte`) | 4 | ruhig | M32 Zauberquadrat |
| Das Klassenzimmer von oben (`von-oben`) | 1 | ruhig | M36 Punktefeld |
| Mein Schulweg (`schulweg`) | 1 | ruhig | M20 Streifenbrett, S18 Selbst schreiben |
| Nah und fern, Stadt und Land (`stadt-und-land`) | 2 | ruhig | G11 Bühne, R17 Post nach Planquadrat |
| Zu Fuß, mit Rad, Bus und Bahn (`unterwegs`) | 1 | ruhig | L05 Wortzug, M25 Welcher Weg? |
| Ampel, Zebrastreifen, Verkehrszeichen (`verkehrszeichen`) | 1 | ruhig | R04 Formen nach einem Merkmal einsortieren |
| Insel und See, Halbinsel und Bucht (`land-und-wasser`) | 2 | ruhig | M19 Spiegel, R16 Ins Gitter übertragen |
| Erdteile und Ozeane (`erdteile-ozeane`) | 2 | ruhig | M13 Schätzen |
| Himmelsrichtungen und Karten (`karten`) | 3 | ruhig | R11 Das Werkzeug richtig anlegen, R13 Von oben eintragen |
| Gemeinde, Bayern, Deutschland, Europa (`gemeinde-bis-europa`) | 4 | ruhig | L17 Bücherei |
| Wie Kinder anderswo leben (`kinder-anderswo`) | 3 | ruhig | Z11 Reporterheft |
| Werkzeuge und wofür man sie nimmt (`werkzeuge`) | 1 | ruhig | R06 Lückenlos belegen und zählen, S08 Proben-Kiste |
| Berufe in Hof, Werkstatt, Laden und Pflege (`berufe`) | 2 | ruhig | L10 Wortbausteine, R05 Den Körper geben, der bestellt ist |
| Türme, die fest stehen (`tuerme-bauen`) | 1 | ruhig | M28 Muster-Päckchen, R12 Würfelbau nachbauen |
| Was rollt? Murmelbahn und Fahrzeuge (`was-rollt`) | 1 | ruhig | R03 Den Weg legen, R20 Rollt es oder kippt es? |
| Burg, Kloster, Schloss (`burg-kloster-schloss`) | 2 | ruhig | M23 Klein und groß, M30 Zahlenmauer |
| Wer an meinem Brot mitgearbeitet hat (`wer-macht-mein-brot`) | 2 | ruhig | M40 Die Rechenfrage, R19 Netz falten |
| Was alle Menschen brauchen (`was-menschen-brauchen`) | 1 | ruhig | M53 Wie viele Arten? |
| Ackerbau, Hausbau, Handwerk (`ackerbau-hausbau`) | 3 | ruhig | M41 Skizze, S03 Das Silbenhaus |
| Brücken, die tragen (`bruecken`) | 3 | ruhig | G05 Satz-Zug, M31 Rechendreieck |
| Wippe, Hebel, Balkenwaage (`hebel-waage`) | 3 | ruhig | M10 Waage |
| Wie Kleidung hergestellt wird (`kleidung`) | 4 | ruhig | M26 Markenspiel, M39 Mal-Marken |
| Mein Körper von Kopf bis Fuß (`koerperteile`) | 1 | ruhig | M04 Blitzblick, S06 Groß oder klein |
| Sehen, hören, riechen, schmecken, tasten (`sinne`) | 1 | ruhig | M01 Paare bilden, Z01 Lauschposten |
| Wie man mit Händen oder Ohren mehr wahrnimmt (`sinne-anders`) | 2 | ruhig | L06 Buchstabenhaus |
| Zähne und wie man sie pflegt (`zaehne`) | 1 | ruhig | M21 Über die Zehn |
| Was in Lebensmitteln steckt (`was-im-essen-steckt`) | 2 | ruhig | M43 Der Laden |
| Hände waschen, Sonnenschutz (`haende-sonne`) | 1 | ruhig | Z02 Wäscheleine |
| Bewegen, Spielen, Ausruhen, Schlafen (`bewegen-schlafen`) | 1 | ruhig | L18 Vorlese-Partitur |
| Das Auge (`das-auge`) | 3 | ruhig | S16 Die Lupe |
| Wachsen und sich verändern (`wachsen`) | 3 | ruhig | M44 Messen |
| Erste Hilfe und Notruf (`erste-hilfe`) | 3 | ruhig | S13 Was fehlt? |
| Wie fühlt sich das an? (`gefuehle`) | 1 | ruhig | L09 Blitzwörter |
| Gefühle im Gesicht und im Körper (`gefuehle-erkennen`) | 1 | ruhig | Z09 Tonstudio |
| Wenn die Wut kommt (`wenn-die-wut-kommt`) | 1 | ruhig | M02 Zählweg |
| Warten und verlieren können (`warten-verlieren`) | 1 | ruhig | Z07 Stuhlkreis |
| Darf ich mitspielen? (`mitspielen`) | 1 | ruhig | G02 Ich, du, wir |
| Streiten und sich versöhnen (`streit-versoehnen`) | 1 | ruhig | Z06 Gesprächszug |
| Gerecht teilen und abwechseln (`gerecht-teilen`) | 2 | ruhig | M38 Gerecht verteilen |
| Um Hilfe bitten, helfen, Danke sagen (`hilfe-und-danke`) | 1 | ruhig | M22 Eine Perle leihen, S20 Schreibschrift |
| Höflich miteinander reden (`hoeflich-reden`) | 1 | ruhig | Z05 Noch mal, bitte |
| Wozu Regeln? Gemeinsam abstimmen (`regeln`) | 2 | ruhig | M56 Wer sagt 20? |
| Wer zusammenlebt (`familien`) | 1 | ruhig | **keins** (Abschnitt 4) |
| Wenn etwas schiefgeht (`wenn-etwas-schiefgeht`) | 1 | ruhig | S15 Der Film |
| Wünsche, Kaufen, Taschengeld (`wuensche-taschengeld`) | 2 | ruhig | M08 Stellentafel |
| Medien im Alltag (`medien-alltag`) | 2 | ruhig | L14 Titel finden |
| Niemand wird ausgelacht (`fuer-andere-einstehen`) | 2 | ruhig | Z04 Hörbühne |
| Mehrheit entscheidet: Klassensprecherin oder Klassensprecher (`mehrheit`) | 3 | ruhig | M50 Säulen bauen |
| Kinderrechte (`kinderrechte`) | 3 | ruhig | L12 Nachlesen |
| Werbung und was sie will (`werbung`) | 3 | ruhig | M42 Ungefähr |
| Mein Körper gehört mir (`mein-koerper-gehoert-mir`) | 1 | ruhig | G09 der, die, das |
| Ja-Gefühl und Nein-Gefühl (`ja-und-nein-gefuehl`) | 1 | ruhig | S17 Gedichte |
| Alle Gefühle sind richtig (`alle-gefuehle`) | 1 | ruhig | L01 Verse-Werkstatt |
| Angenehme, unangenehme und komische Berührungen (`beruehrungen`) | 2 | ruhig | **keins** (Abschnitt 4) |
| Ich darf Nein sagen (`nein-sagen`) | 1 | ruhig | S11 Zeichen setzen |
| Gute und schlechte Geheimnisse (`gute-schlechte-geheimnisse`) | 1 | ruhig | S14 Die Karte |
| Ich hole mir Hilfe (`hilfe-holen`) | 1 | ruhig | **keins** (Abschnitt 4) |
| Ich bin nicht schuld (`nicht-schuld`) | 1 | ruhig | **keins** (Abschnitt 4) |
| Wegklicken und Bescheid sagen (`sicher-im-netz`) | 2 | ruhig | L13 Nachschlagen |
| Sicher über die Straße, Helm beim Rad (`sicher-ueber-die-strasse`) | 1 | ruhig | R02 Dem Weg folgen, Z03 Auftrag |
| Feuer und Kerzen: Erwachsene holen (`feuer-notruf`) | 1 | ruhig | M06 Zahlenpost |
| Schwimmen nur mit Aufsicht (`schwimmen-aufsicht`) | 1 | ruhig | R07 Den Umriss füllen |
| Ich sage Bescheid, wo ich bin (`bescheid-sagen`) | 1 | ruhig | S12 Post |
| Ich habe mich verlaufen – wen frage ich? (`verlaufen`) | 1 | ruhig | R01 Hinlegen, wo es hingehört |

## 4. Welten ohne echten Sachgrund in einem Spiel

Diese sieben Welten sind nicht erzwungen. Jede kommt trotzdem beim Kind vor, nur nicht als Heimat.

- **Wenn ein Vulkan ausbricht** (`vulkanausbruch`, Kl. 3, stufe_ab abenteuer): Nur Sachmoment in der Pause auf „abenteuer“, nie Spannungsquelle (9.2 Nr. 8). Auf „ruhig“ und „sanft“ gibt es die Welt nicht, also kann sie kein Spiel fest tragen. Vorschlag: Pausenmoment von M09 Aufdecken (gebirge-vulkane) auf „abenteuer“.
- **Warum es keine Dinosaurier mehr gibt** (`dinosaurier-aussterben`, Kl. 3, stufe_ab abenteuer): Wie vulkanausbruch: nur Pausen-Sachmoment auf „abenteuer“. Vorschlag: Pausenmoment von M11 Flug zur Zahl (zeitleiste-des-lebens) auf „abenteuer“.
- **Dinosaurier: wie groß, was sie fraßen** (`dinosaurier`, Kl. 2, stufe_ab sanft): `stufe_ab` sanft, und 9.3 sagt: auf „ruhig“ kommen Dinosaurier nicht vor. Ein Spiel mit fester Heimat „dinosaurier“ hätte auf „ruhig“ keine Welt. Vorschlag: Zusatzmoment ab „sanft“ in M18 Wie viel mehr? (Längen vergleichen) oder M44 Messen. Wenn du entscheidest, dass Dinosaurier als Zeitleiste und Größe auch auf „ruhig“ vorkommen dürfen, wird M18 die Heimat (lebenskette wandert dann zu G03 oder Z10).
- **Ich bin nicht schuld** (`nicht-schuld`, Kl. 1, stufe_ab ruhig): Die Welt sagt selbst „Querschnitt in allen Schutz-Themen, kein eigenes Spiel“. Vorschlag: als fester Satz in der Elternvorschau und in den Pausen der Schutz-Spiele (S11, S12, S14, S17, G09, Z03) mitführen.
- **Wer zusammenlebt** (`familien`, Kl. 1, stufe_ab ruhig): Die Welt sagt „beiläufig, nie als Thema einer Aufgabe“ (6.1 Nr. 2). Eine Heimat würde sie zum Aufgabengrund machen. Vorschlag: nur im Bild aller Spiele (Figurenblatt: wer abholt, wo gewohnt wird).
- **Angenehme, unangenehme und komische Berührungen** (`beruehrungen`, Kl. 2, stufe_ab ruhig): „Sortieren ohne Wertung“ widerspricht jedem vorhandenen Spiel, das eine richtige Antwort hat; Berührungen mit richtig/falsch zu sortieren wäre gegen K13. Vorschlag: ein eigenes kleines Schutz-Spiel ohne falsche Antwort (zusammen mit hilfe-holen), mit Elternvorschau.
- **Ich hole mir Hilfe** (`hilfe-holen`, Kl. 1, stufe_ab ruhig): Möglich wäre Z05 Noch mal, bitte („weitererzählen, bis jemand hilft“), dann verliert hoeflich-reden seine Heimat und müsste nach S11, und nein-sagen hätte keine. Der Tausch macht es nicht besser. Vorschlag: gemeinsam mit beruehrungen ein eigenes Schutz-Spiel; als Notlösung Z05.

**Entscheidung nötig:** Soll jede Welt Heimat sein, auch um den Preis schwacher Paarungen? Dann als Notlösung: dinosaurier → M18 (nur mit Freigabe für „ruhig“), hilfe-holen → Z05, beruehrungen und nicht-schuld → ein neues Schutz-Spiel, familien und die beiden Abenteuer-Welten bleiben ohne Heimat, weil ihre Regeln es verbieten.
