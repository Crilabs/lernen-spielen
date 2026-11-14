> Teil des Spielkatalogs (`docs/spielkatalog.md`). **Die Entscheidungen im Hauptdokument gehen vor**: Sie beantworten die
> offenen Fragen am Ende dieser Datei (u. a. alle Spiele bleiben getrennt, Kontrollkarte, Stimmen, Sachwelt je Spiel).
> Die Heimatwelt jedes Spiels steht in der Übersicht des Hauptdokuments.

# Spielkatalog Lesen sowie Sprechen und Zuhören

Stand: 2026-11-14 · Entwurf von Claude zur Prüfung · Eingabe: `themen-lesen-sprechen.md` (193 Themen)
Markierung: **(Annahme)** = Vorschlag, beim Lesen korrigierbar.

## 1. Überblick

- **29 Spiele:** 18 mit Kürzel L (Lesen), 11 mit Kürzel Z (Sprechen und Zuhören). Das liegt über der
  Orientierung von 18 bis 22. Grund: Sprechen und Zuhören enthält viele verschiedene Handlungen (orten,
  ordnen, ausführen, antworten, beobachten, aufnehmen), die sich nicht ehrlich zu einer zusammenfassen lassen.
  Wer kürzen will, findet in Abschnitt 4 drei Zusammenlegungen, die am wenigsten kosten.
- **Grundgedanke des Schnitts:** Ein Spiel trägt alle Themen, für die dieselbe Handlung am selben Material die
  beste ist, auch über Klassen hinweg. Hören und Lesen teilen ein Spiel, wenn die Handlung gleich bleibt
  (Aufträge ausführen, Karten ordnen, aus Hinweisen schließen). Sie bekommen getrennte Spiele, wenn sich die
  Handlung ändert: Eine Hörgeschichte baut man aus dem Gedächtnis nach (Z04), in einem Text zeigt man auf die
  Stelle (L12).
- **Die rund 50 Buchstabenthemen** (laut-m bis laut-ph und buchstabenpaare-gross-klein) teilen eine Handlung:
  Laut und Zeichen einander zuordnen (L06, in beide Richtungen). Laute hören ohne Buchstaben (L03 bis L05) und
  Silben erlesen (L07) sind andere Handlungen und eigene Spiele. Jedes Buchstabenthema hat L06 als Hauptspiel
  und L07 als zweiten Zugang: Sobald ein Buchstabe im Buchstabenhaus sitzt, liest das Kind ihn im Lesefenster
  in Silben.
- **Eigenes Sprechen:** Kein Spiel hängt von Spracherkennung ab. Wo das Kind spricht, prüft die Sache etwas
  anderes am Bildschirm (der Erzähler liest genau so, wie das Kind die Pausen gesetzt hat, L18). Das eigene
  Sprechen selbst ist ein Mach-mit-Moment am Rundenende, nie Bedingung; „gekonnt“ entsteht nur aus dem Teil,
  den die App sieht (Punkt 13 des Nachtrags). Aufnahmen der Kinderstimme (Z09, Z10, L18) sind ein Zusatz, der auf dem Gerät
  bleibt; sie brauchen einen neuen Baustein (siehe Offene Fragen).
- **Prüfung:** Skript (`python3`, liest die Eingabe und die Tabelle): 193 Themen in der Eingabe, 193 Tabellenzeilen, jede ID genau einmal als Hauptthema, keine fremde ID, kein Thema mit seinem Hauptspiel zugleich als weiterem Zugang. Ergebnis: bestanden.

**Was der Nachtrag (Bedienung, Bilder, Stimme, Fehlerbilder, Figuren, Ansichten) am Schnitt geändert hat:**
1. *Figuren sprechen nicht, eine Erzählerstimme:* Gesprächsthemen (Z06, Z07) werden als Szenen der Runde
   mit Gesten und Geräuschen erzählt; das Kind wählt, was **es** sagt. Zwei Themen (sprecher-unterscheiden,
   viele-stimmen-verstehen) und der Gefühlsklang (gefuehl-in-der-stimme) sind so nicht baubar, solange es nur
   eine Stimme gibt. Sie bleiben zugeordnet, sind aber als „wartet auf Entscheidung“ markiert.
2. *Gefühle ohne falsche Antwort (K13):* gefuehl-der-figur und gefuehl-in-der-stimme haben kein eigenes
   Gefühle-Spiel mehr. Sie stecken im Gesprächszug Z06: Das Kind benennt kein Gefühl, es wählt eine Antwort,
   und die Szene zeigt, ob sie zu dem passt, was Kofi gerade braucht.
3. *Nur Tippen und Ziehen:* Alle Handlungen sind so gebaut. Neu wären nur der Aufnahmeknopf (Z09, Z10, L18)
   und Kopfhörer für links/rechts (Z01). Ein früher erwogenes „Schlüsselwort beim Hören sofort antippen“
   bleibt Tippen, ist aber zeitgebunden; es steht als Stufe in Z04, nicht als eigenes Spiel.
4. *Beim Erlesen kommt das Bild danach (D5):* L07 und L08 zeigen die Bilder erst, wenn das Kind gelesen und
   festgelegt hat bzw. nur als Auswahl ähnlich klingender Dinge, damit Raten am Anfang nicht trägt
   (Fehlerbild `anfang-raten`).
5. *Buchstaben ohne Einzelfarben (D8), keine Buchstaben in Tierform (§4):* Die Lernplan-Merkhilfen „in der Möwe
   steckt das M“ entfallen. Fürs Buchstabenhaus gilt eine schwarze Andika-Form auf Papier.
6. *Neue Lernzeichen nötig:* Silbenbogen, Lautplättchen und Wagen (L05), Pausen- und Stimmmarken (L18),
   Fuge zwischen Wortbausteinen (L10). Sie sind unten je Spiel markiert.
7. *Ansichten:* Je Spiel ein Name fürs Kind und ein Symbol. Einige Spiele bedienen Themen aus Lesen **und**
   Sprechen (Z02, Z03, L14, L15); dafür müsste die Kopfleiste das Fach je Runde nach dem Thema setzen
   **(Annahme)**. Für das Regal reicht die Karte mit Buchstabe nur bei den Buchstabenthemen; für die übrigen
   schlage ich je Spiel ein Regal-Material vor.
8. *Stufen passen das Spiel an:* Bei `anpassbar` steht kurz, was sich je Stufe ändert. Die Lernhandlung bleibt
   auf jeder Stufe gleich.
9. *Mach mit statt Elternansicht:* Keine Anregungen für die Elternansicht mehr. Jedes Spiel hat eine Zeile
   `Mach mit:` (eine Figur tut es vor, der Erzähler lädt ein). Dadurch hat sich Z11 geändert: Es ist kein
   Gesprächsspiel mit einem Erwachsenen mehr, sondern ein Bildschirmteil (Fragen wählen, Buchkarte, Gesicht)
   mit Mach-mit-Einladung. Bei Z09, Z10 und L18 zählt für „gekonnt“ nur der Bildschirmteil.

**Wo ich unsicher bin:** (a) ob Einzellaute („mmm“, „t“) mit der Azure-Stimme sauber genug klingen (L03 bis
L06 hängen daran), (b) ob die Zusammenlegung von Hören und Lesen in Z03 und L15 den Auftraggeber überzeugt,
(c) wie viel Aufnahme der Kinderstimme gewollt ist.

**Abweichungen von den Lernplan-Beispielen** (gelten für alle Spiele): sprechende Tiere (Fuchs und Hase, der
Bär mit dem Ballon, der Riese, die Hexe) werden durch Kinder der Runde und Gäste ersetzt (T1, F1); Ich-Sätze
von Figuren („Ich hab’s geschafft!“) werden erzählt; „Daumen hoch oder runter“ für die eigene Aufnahme wird
eine Kontrollkarte mit Fragen (laut genug, deutlich, Pausen), kein Urteil.

---------------------------------------------------------------------------------------------------
## 2. Die Spiele

### L01 Verse-Werkstatt
- Name fürs Kind: „Reime“ · Symbol: ein Blatt mit zwei kurzen Zeilen, deren Enden ein Bogen verbindet
- Handlung: Das Kind setzt das fehlende Reimwort ans Ende eines Verses oder verbindet die Zeilen, die sich reimen.
  · Wirkung: Der Vers ist fertig und wird als kleines Lied oder Postkartengedicht für jemanden aus der Runde
  verschickt.
- Material und Stufen: Wortbilder als Reimkarten, später Verszeilen. material: der Erzähler spricht den Vers,
  zwei bis drei Wortbilder liegen bereit, das Ende jedes Wortes klingt beim Antippen nach (Hose, Dose) ·
  vorstellung: Bilder ohne Nachklang, das Kind muss das Ende im Kopf vergleichen · kopf: nur gesprochen, viele
  Bilder als Auswahl oder ein Wort selbst finden (reimwort-finden „Haus → ?“). Kl. 2 bis 4: gedruckter
  Vierzeiler, Bögen von Zeile zu Zeile ziehen; Kl. 4 zusätzlich das Muster als Bogenform (zwei kurze Bögen
  für Paarreim, zwei gekreuzte für Kreuzreim).
- Fehlerkontrolle: Der Erzähler liest den Vers mit dem gewählten Wort. Passt es nicht, endet die Zeile hörbar
  anders; die Enden beider Wörter erscheinen untereinander (-ose / -ut).
- Hauptthemen: reim-hoeren, reimwort-finden (Kl. 1); reim-im-gedicht (Kl. 2); paarreim-kreuzreim (Kl. 4)
- Weitere Zugänge: reim-nachsprechen (Haupt Z09)
- Warum perfekt: Reime erkennt man am Zweck, für den sie da sind: ein Vers, der „klingt“. Vom gehörten
  Abzählreim bis zum gedruckten Gedicht bleibt die Handlung dieselbe (gleiche Enden verbinden), nur das
  Material wird schriftlich.
- Bewusst nicht drin: reim-nachsprechen → Z09 (eigenes Sprechen); gedicht-vortragen → Z09.
- Gesten: Tippen (Wortbild wählen), Ziehen von Bögen zwischen Zeilenenden (Tipp-Alternative: Zeile, dann Zeile).
- Lernzeichen: Wortbilder (Abschnitt 3), Wortkarten, Andika-Zeilen. **Neu:** Reimbogen zwischen zwei Zeilen.
- Stimme: viel Varianten (jeder Vers mit jedem Kandidatenwort als eigene Aufnahme, Wortenden einzeln).
- Fehlerbilder: keins im Bestand.
- Figuren: Ein Kind der Runde zeigt den ersten Vers vor und zögert hörbar beim falschen Wort (vorzeigen);
  wer die Karte bekommt, freut sich an der Sache. Keine Fähigkeit nötig.
- Mach mit: Lena klatscht einen Abzählreim und lässt das letzte Wort offen. „Sag jemandem einen Vers und lass das letzte Wort weg. Findet er den Reim?“
- Regal-Material: Karte mit zwei Reimwörtern untereinander (Hose / Dose) statt erstem Buchstaben.
- Sachgrund der Heimatwelt: ein Vers oder Lied zu einem Anlass, das zu Ende gedichtet werden muss ·
  Kandidaten: jahreszeiten-natur, feste-im-kalender, wiese-und-hecke
- Stimmung: ruhig fest
- Fachübergreifend: Schreiben, falls es dort „Reimwörter schreiben“ gibt.

### L02 Abzählen
- Name fürs Kind: „Abzählen“ · Symbol: ein Arm, der einen Bogen schwingt
- Handlung: Das Kind schwingt ein gesprochenes Wort in Silbenbögen (ein Bogen je Silbe). · Wirkung: Beim
  Abzählvers wandert der Finger mit jedem Bogen ein Kind der Runde weiter; wo der letzte Bogen landet, darf
  dieses Kind anfangen.
- Material und Stufen: material: ein Kind der Runde schwingt mit dem Arm mit, jeder Bogen erscheint unter dem
  Wortbild · vorstellung: nur Bögen, das Kind setzt sie selbst · kopf: das Kind tippt die Zahl der Silben
  ohne zu schwingen, danach wird geschwungen.
- Fehlerkontrolle: Der Erzähler spricht das Wort Silbe für Silbe im Takt der gesetzten Bögen. Ein Bogen zu
  viel bleibt stumm, einer zu wenig lässt eine Silbe ohne Bogen. Der Abzählfinger landet dann bei einem
  anderen Kind, das sichtlich überrascht ist.
- Hauptthemen: silben-klatschen (Kl. 1)
- Weitere Zugänge: silben-zusammenhoeren (Haupt L03); lesen-lange-woerter (Haupt L07)
- Warum perfekt: Silben schwingen ist die Grundhandlung der Silbenanalyse, und der Abzählvers ist ihr
  echter Zweck aus dem Lernplan: Die Silbenzahl entscheidet, wer dran ist (gerecht, nicht zufällig).
- Bewusst nicht drin: silben-zusammenhoeren → L03 (Synthese, andere Richtung); lesen-lange-woerter → L07
  (Lesen).
- Gesten: Tippen (je Tippen ein Bogen) oder Ziehen eines Bogens; Tippen auf die Ziffer in der kopf-Stufe.
- Lernzeichen: Wortbilder. **Neu:** Silbenbogen (Tinte, flach), wird auch in L07 und Schreiben gebraucht.
- Stimme: mittel (jedes Wort ganz und in Silben).
- Fehlerbilder: `endung-ausgelassen` (Übung silben-klatschen), `wort-zerrissen` vorbereitend.
- Figuren: Die Runde sitzt im Kreis und wird abgezählt; ein Kind zeigt das Schwingen vor. Wer gewählt wird,
  freut sich mal leise, mal mit Hüpfer (B4).
- Mach mit: Kofi schwingt beim Tischdecken die Namen der Runde. „Schwing deinen Namen mit dem Arm. Wie viele Bögen hat er?“
- Regal-Material: Karte mit drei Silbenbögen.
- Sachgrund der Heimatwelt: gerecht auswählen, wer anfängt; lange Namen in Stücke teilen, um sie zu merken ·
  Kandidaten: dinosaurier (lange Namen), tiere-der-erdteile, gerecht-teilen
- Stimmung: ruhig fest
- Fachübergreifend: **Schreiben** (Silben schwingen beim Schreiben). Dieselbe Handlung, der Auftraggeber
  sollte die beiden zusammenführen.

### L03 Geheimsprache
- Name fürs Kind: „Geheimsprache“ · Symbol: ein Mund mit drei Punkten davor (Wort in Stücken)
- Handlung: Der Erzähler sagt, was versteckt ist, aber nur in Stücken (Ta-sche oder S-o-f-a); das Kind
  zieht die Stücke im Kopf zusammen und tippt auf das Versteck. · Wirkung: Das Versteck öffnet sich, das Ding
  kommt heraus und wird für den Ausflug gebraucht.
- Material und Stufen: material: die Stücke erscheinen als Plättchen, die sich beim Antippen nacheinander
  zusammenschieben und dabei klingen · vorstellung: Stücke nur gehört, im Bild drei Wortbilder als Auswahl ·
  kopf: Stücke gehört, viele Dinge in der Szene. Erst Silben, dann Laute (Voraussetzungsfolge). Für
  laute-statt-namen versucht der Erzähler einmal „em-a“ und einmal „mmm-aaa“; das Kind wählt, welche
  Sprechweise ins Versteck geschickt wird, und hört, dass nur die Laute zu „Ma“ verschmelzen.
- Fehlerkontrolle: Das angetippte Ding wird in denselben Stücken gesprochen, neben dem Rätselwort
  (Ta-sse / Ta-sche). Der Unterschied ist hörbar.
- Hauptthemen: silben-zusammenhoeren, laute-statt-namen, laute-verschmelzen-hoeren (Kl. 1)
- Weitere Zugänge: keine
- Warum perfekt: Zusammenziehen ist Synthese, die Gegenrichtung zum Zerlegen. Die Geheimsprache ist genau der
  Zweck aus dem Lernplan und braucht keine Buchstaben.
- Bewusst nicht drin: laute-zaehlen → L05 (Zerlegen); silben-klatschen → L02.
- Gesten: Tippen.
- Lernzeichen: Wortbilder; **neu:** Lautplättchen (neutral, ohne Buchstabe, nicht wie Mathe-Plättchen geformt).
- Stimme: viel (Wörter in Silben und Lauten; Einzellaute mit der Azure-Stimme sind unsicher, **Annahme prüfen**).
- Fehlerbilder: `anfang-raten` (Übung laute-verschmelzen-hoeren), `laute-ausgelassen`, `laute-vertauscht`
  (vorbereitend).
- Figuren: Ein Kind der Runde rät beim Vorzeigen erst falsch, hört noch einmal und findet es (Bewältigung);
  die anderen schauen gespannt aufs Versteck.
- Mach mit: Timo spricht einem Gast ein Wort in Stücken vor. „Sag jemandem ein Wort in Stücken. Errät er es?“
- Regal-Material: Karte mit einem Wort in drei Plättchen-Stücken.
- Sachgrund der Heimatwelt: etwas Verstecktes finden, das sich tarnt · Kandidaten: tarnen-verstecken,
  wiese-und-hecke
- Stimmung: anpassbar. ruhig: Dinge im Kinderzimmer verstecken · sanft: Schatzsuche im Garten, ein Ding ist
  kurz weg und schon wieder in Sicht · abenteuer: Suche über mehrere Runden, am Ende eine Höhle mit Laterne,
  in der eine Eule sitzt.

### L04 Laut-Körbe
- Name fürs Kind: „Einpacken“ · Symbol: ein Korb mit Henkel
- Handlung: Das Kind legt Dinge in den Korb, die mit demselben Laut anfangen wie der Name auf dem Korb
  (Mama, Ida, Tim). · Wirkung: Der Korb ist für den Ausflug gepackt, und am Ziel wird gebraucht, was drin ist.
- Material und Stufen: material: Wortbilder, beim Antippen gedehnt gesprochen („Mmmelone“), der Korbname
  ebenso · vorstellung: Wortbilder ohne Dehnen · kopf: Wortbilder, die der Erzähler nur einmal nennt, dann
  still. Folge: Vokale, dann Dauerlaute, dann kurze Laute (Voraussetzungen).
- Fehlerkontrolle: Was nicht passt, wird beim Hineinlegen neben dem Korbnamen gedehnt gesprochen
  („Sssofa, Mmmama“); die Anfänge sind hörbar verschieden, das Ding bleibt neben dem Korb liegen.
- Hauptthemen: anlaut-selbstlaut, anlaut-dauerlaut, anlaut-stopplaut (Kl. 1)
- Weitere Zugänge: endlaut-hoeren (Haupt L05)
- Warum perfekt: Das ist das Montessori-Lautkörbchen (Gegenstände nach Anlaut sammeln) mit dem Einpackspiel als
  Zweck aus dem Lernplan.
- Bewusst nicht drin: endlaut-hoeren → L05 (Stelle im Wort).
- Gesten: Ziehen in den Korb (Tipp-Alternative: Ding, dann Korb).
- Lernzeichen: Wortbilder; kein Buchstabe (Hören vor Zeichen).
- Stimme: mittel (Wörter normal und gedehnt).
- Fehlerbilder: `aehnliche-laute` (Übung anlaut-stopplaut), `b-d-lesen` vorbereitend.
- Figuren: Der Korb gehört einem Kind der Runde oder einem Gast mit passendem Namen (Ela: E; Opa: O). Ein Kind
  zeigt vor, ein anderes wundert sich über ein Ding, das nicht passt, und hört noch einmal.
- Mach mit: Ela legt zu Hause Dinge mit dem Anfang ihres Namens in einen Korb. „Such drei Dinge, die so anfangen wie dein Name.“
- Regal-Material: Karte mit Korb und dem Laut als Buchstaben erst ab L06; bis dahin das Wortbild.
- Sachgrund der Heimatwelt: für einen Ausflug oder Markt packen · Kandidaten: obst-gemuese-reif, unterwegs,
  bauernhof
- Stimmung: ruhig fest

### L05 Wortzug
- Name fürs Kind: „Wortzug“ · Symbol: eine Lok mit drei Wagen
- Handlung: Für jeden Laut eines gesprochenen Wortes setzt das Kind ein Plättchen in einen Wagen; es zeigt
  dann, in welchem Wagen ein Laut fährt, oder tauscht einen Laut aus. · Wirkung: Der Zug fährt los und spricht
  das Wort Wagen für Wagen; nach einem Tausch wird aus der Hose eine Dose (verzaubern).
- Material und Stufen: material: Lautplättchen, jedes klingt beim Antippen · vorstellung: leere Wagen,
  das Kind zieht die Plättchen ohne Klang · kopf: nur die Zahl der Wagen festlegen, dann fährt der Zug.
  Folge: woerter-im-satz-zaehlen (ein Wagen je Wort, Kl. 1 früh), dann laute-zaehlen, endlaut-hoeren
  (letzter Wagen), laut-in-der-mitte, laut-tauschen.
- Fehlerkontrolle: Der Zug spricht genau das, was in seinen Wagen sitzt. Fehlt ein Wagen, fehlt hörbar ein
  Laut („Na-e“); bei einem Wort zu wenig fehlt es im Satz. Beim Tauschen wird der Gegenstand, den das neue Wort
  meint, sichtbar, oder es entsteht hörbar ein Quatschwort.
- Hauptthemen: woerter-im-satz-zaehlen, laute-zaehlen, endlaut-hoeren, laut-in-der-mitte, laut-tauschen (Kl. 1)
- Weitere Zugänge: keine
- Warum perfekt: Lautkästchen nach Elkonin (ein Feld je Laut) sind das Standardmaterial für Zerlegen,
  Lautposition und Lauttausch. Der Zug macht das Ergebnis hörbar, ohne dass das Kind sprechen muss.
- Bewusst nicht drin: anlaut-* → L04 (Sammeln ist für den Anfang die bessere Handlung als Zerlegen).
- Gesten: Ziehen der Plättchen in die Wagen (Tipp-Alternative), Tippen auf einen Wagen.
- Lernzeichen: **neu:** Lautplättchen und Wagen als Lautkästchen. Sobald Buchstaben bekannt sind, dürfen die
  Plättchen den Buchstaben tragen (Übergang zu Schreiben).
- Stimme: viel (Einzellaute, Wörter, Quatschwörter beim Tausch).
- Fehlerbilder: `laute-ausgelassen`, `laute-vertauscht` (Übung laute-zaehlen, laut-in-der-mitte, laut-tauschen),
  `wortgrenzen-fehlen` (Übung woerter-im-satz-zaehlen), `endung-ausgelassen` (Übung endlaut-hoeren),
  `aehnliche-laute` (Übung laut-tauschen).
- Figuren: Ein Kind der Runde ist Zugführerin oder Zugführer und zeigt den ersten Zug vor; beim Tausch nutzt ein
  Kind die Fähigkeit „verzaubern“ (Zauberstab): Die Szene verwandelt sich, weil das Kind den Laut getauscht hat.
  Das Plättchen bleibt ein Plättchen (Regel aus figuren.md §5).
- Mach mit: Lena legt für jeden Laut ihres Namens einen Knopf hin. „Leg für jeden Laut in deinem Namen einen Stein hin.“
- Regal-Material: Karte mit drei Wagen.
- Sachgrund der Heimatwelt: eine Bahn, in der jeder Laut einen Platz braucht · Kandidaten: unterwegs,
  geschichte-der-schrift
- Stimmung: anpassbar. ruhig: Zug im Dorf · sanft: Zug über eine Brücke, ein Wagen klemmt kurz und rollt
  weiter · abenteuer: Reise über mehrere Runden durch Tunnel und Berge, jede Runde endet am Bahnhof im Hellen.
- Fachübergreifend: **Schreiben** (Laute zählen vor dem Schreiben; Lautkästchen mit Buchstaben).

### L06 Buchstabenhaus
- Name fürs Kind: „Buchstabenhaus“ · Symbol: ein Haus mit vier Fenstern, in einem ein A
- Handlung: Das Kind hört einen Laut und setzt den passenden Buchstaben (oder die Buchstabengruppe) in sein Fach
  im Buchstabenhaus; in der Gegenrichtung sieht es ein Zeichen in einem Wort und wählt den Laut, der hier
  klingt. · Wirkung: Mit dem neuen Buchstaben lässt sich ein Schild im Tierpark lesen, und das Tier dahinter
  wird sichtbar (Sachbild mit Echt-Zeichen, ein Fakt in der Pause).
- Material und Stufen: material: Buchstabe groß und klein auf einer Tafel, beim Antippen der Laut und das
  Anlaut-Wortbild · vorstellung: Buchstabe ohne Wortbild, Laut gehört · kopf: der Buchstabe in einem Schild
  oder Wort, Laut ohne Hilfe abrufen. Für Gruppen mit Regel (ch nach a/o/u, St am Anfang, V, C, Y, ph, äu,
  ai) wählt das Kind zwischen zwei Lauten („Teich“: ich-Laut oder ach-Laut). buchstabenpaare-gross-klein: zu
  einem Großbuchstaben die kleine Form ins selbe Fach legen. Folge nach Voraussetzungen.
- Fehlerkontrolle: Der falsche Buchstabe nennt im Fach seinen eigenen Laut („Das ist das S. Es klingt sss.“)
  und passt nicht zum Anlautbild; das Schild bleibt unlesbar. Eine Gruppe mit falschem Laut wird im Wort
  vorgelesen und klingt hörbar fremd („Teach“).
- Hauptthemen: laut-m, laut-a, laut-i, laut-o, laut-l, laut-s, laut-r, laut-u, laut-e, laut-n, laut-f, laut-t, laut-w, laut-h-anfang, laut-d, laut-k, laut-p, laut-b, laut-g, laut-ei, laut-au, laut-sch, laut-ch-ich, laut-ch-ach, laut-z, laut-ae, laut-oe, laut-ue, laut-eu, laut-aeu, laut-ie, laut-st-anfang, laut-sp-anfang, laut-tz, laut-ck, laut-ng, laut-nk, laut-pf, laut-j, laut-v, laut-eszett, laut-qu, laut-x, laut-y, laut-c, laut-ai, laut-ph, buchstabenpaare-gross-klein (Kl. 1)
- Weitere Zugänge: anlaut-selbstlaut (Haupt L04); anlaut-dauerlaut (Haupt L04); anlaut-stopplaut (Haupt L04); laute-statt-namen (Haupt L03); laut-tauschen (Haupt L05); b-d-p-unterscheiden (Haupt L08)
- Warum perfekt: Laut und Zeichen zuordnen ist eine Handlung, egal ob Einzelbuchstabe oder Gruppe. Die
  Anlauttabelle (Buchstabenhaus) ist das Standardmaterial der Grundschule und wächst sichtbar mit (N8).
- Bewusst nicht drin: erste-silben-lesen und alles Erlesen → L07; b-d-p-unterscheiden → L08 (Unterscheiden
  im Wort ist eine andere Schwierigkeit); Merkhilfen mit Buchstabenform in Tieren oder Dingen (Möwe,
  Seepferdchen, Stehlampe) aus dem Lernplan entfallen (§4, keine Buchstaben in Tierform).
- Gesten: Ziehen des Buchstabens ins Fach (Tipp-Alternative), Tippen auf einen von zwei Lauten.
- Lernzeichen: Buchstaben in Andika ohne Einzelfarbe (D8), Wortbilder, Sachbild mit Echt-Zeichen. Die
  Anlauttabelle als Haus ist ein **neues** festes Bild für alle Deutsch-Spiele (Annahme: Schreiben nutzt es mit).
- Stimme: viel (je Buchstabe Laut, Anlautwort, Schildwort, Fehlersatz; etwa 50 Buchstaben).
- Fehlerbilder: `aehnliche-laute` (Übung laut-d, laut-t, laut-b, laut-p, laut-g, laut-k, laut-n, laut-m),
  `hochdeutsch-hoeren` (laut-ue, laut-oe, laut-eu), `ei-ie-vertauscht` (laut-ei, laut-ie), `b-d-lesen` (laut-b,
  laut-d), `spiegelschrift` (Übung buchstabenhaus).
- Figuren: Ein Kind der Runde zeigt auf das Sachbild des Tieres („Schau, so sieht ein Lama aus“, F8), ein
  anderes zeigt beim ersten Mal vor. Keine Fähigkeit.
- Mach mit: Kofi findet beim Einkaufen ein M auf einer Packung. „Frag jemanden, ob ihr zusammen einkaufen geht. Wo findest du dein Buchstabenhaus-Zeichen?“
- Regal-Material: Karte mit dem Buchstaben oder der Gruppe des Themas (M m, sch, St), **nicht** dem ersten
  Buchstaben des Themennamens. `materialFuer` bräuchte dafür ein Feld je Thema.
- Sachgrund der Heimatwelt: Schilder im Tierpark lesen, um das Tier zu finden · Kandidaten: tiere-der-erdteile,
  bauernhof, geschichte-der-schrift (Pause: wie Buchstaben aus Bildern entstanden, Fakt nach K4 prüfen)
- Stimmung: ruhig fest
- Fachübergreifend: **Schreiben** (Anlauttabelle, Laut zu Buchstabe beim Schreiben, Groß- und Kleinbuchstaben).

### L07 Lesefenster
- Name fürs Kind: „Post“ · Symbol: ein Päckchen mit Anhänger
- Handlung: Das Kind schiebt ein Lesefenster Silbe für Silbe über das Wort auf einem Anhänger, liest es selbst
  (laut oder leise) und legt sich fest, wohin das Päckchen gehört. · Wirkung: Das Päckchen kommt beim richtigen
  Empfänger an (Kind der Runde, Gast, Tier im Stall), der es auspackt.
- Material und Stufen: material: Fenster zeigt eine Silbe, Silbenbogen darunter, Vokal dezent unterstrichen
  (D3) · vorstellung: Fenster zeigt das ganze Wort, Bögen nur auf Wunsch · kopf: Anhänger ohne Hilfen. Die
  Empfänger erscheinen erst, wenn das Kind fertig gelesen hat (D5). Für Quatschwörter (Namen neuer Orte) sind
  die Empfänger Wegweiser; das Kind wählt unter drei gesprochenen Namen den, der geschrieben steht. Folge:
  offene Silben, -en/-er, geschlossene Silbe, zwei Konsonanten am Anfang, Häufung, lange Wörter.
- Fehlerkontrolle: Beim falschen Empfänger liest der Erzähler den Anhänger im Fenster Silbe für Silbe vor;
  der Empfänger zeigt seinen Namen oder sein Bild, das Päckchen bleibt bei der Post. Nicht als Strafe: der
  Empfänger schaut neugierig, nicht enttäuscht.
- Hauptthemen: erste-silben-lesen, lesen-offene-silben, lesen-endungen-en-er, lesen-kurzer-selbstlaut, lesen-zwei-mitlaute-anfang, lesen-mitlauthaeufung, lesen-lange-woerter, quatschwoerter-lesen (Kl. 1)
- Weitere Zugänge: laut-m (Haupt L06); laut-a (Haupt L06); laut-i (Haupt L06); laut-o (Haupt L06); laut-l (Haupt L06); laut-s (Haupt L06); laut-r (Haupt L06); laut-u (Haupt L06); laut-e (Haupt L06); laut-n (Haupt L06); laut-f (Haupt L06); laut-t (Haupt L06); laut-w (Haupt L06); laut-h-anfang (Haupt L06); laut-d (Haupt L06); laut-k (Haupt L06); laut-p (Haupt L06); laut-b (Haupt L06); laut-g (Haupt L06); laut-ei (Haupt L06); laut-au (Haupt L06); laut-sch (Haupt L06); laut-ch-ich (Haupt L06); laut-ch-ach (Haupt L06); laut-z (Haupt L06); laut-ae (Haupt L06); laut-oe (Haupt L06); laut-ue (Haupt L06); laut-eu (Haupt L06); laut-aeu (Haupt L06); laut-ie (Haupt L06); laut-st-anfang (Haupt L06); laut-sp-anfang (Haupt L06); laut-tz (Haupt L06); laut-ck (Haupt L06); laut-ng (Haupt L06); laut-nk (Haupt L06); laut-pf (Haupt L06); laut-j (Haupt L06); laut-v (Haupt L06); laut-eszett (Haupt L06); laut-qu (Haupt L06); laut-x (Haupt L06); laut-y (Haupt L06); laut-c (Haupt L06); laut-ai (Haupt L06); laut-ph (Haupt L06); lesen-lang-oder-kurz (Haupt L08); genau-hinsehen-lesen (Haupt L08)
- Warum perfekt: Erlesen ist Synthese am Schriftbild. Das Fenster macht die Silbe zur Leseeinheit, und der
  Empfänger prüft das Gelesene über den Sinn, ohne dass Spracherkennung nötig ist.
- Bewusst nicht drin: lesen-wort-zum-bild → L08 (dort sind die Ablenker ähnlich geschrieben, die Schwierigkeit
  ist Genauigkeit, nicht Synthese); wortbausteine-lesen → L10.
- Gesten: Ziehen des Fensters (Tipp-Alternative: auf die nächste Silbe tippen), Tippen auf den Empfänger.
- Lernzeichen: Andika, Silbenbogen (neu, siehe L02), Vokal-Unterstrich (D3), farbige Silben nur zuschaltbar
  (D4). Das Lesefenster selbst ist **neu**.
- Stimme: viel (jedes Wort ganz und in Silben, Quatschwörter je drei Fassungen).
- Fehlerbilder: `anfang-raten` (Übung erste-silben-lesen, lesen-offene-silben, quatschwoerter-lesen; Signatur
  über Ablenker mit gleichem Anfang), `laute-ausgelassen` (lesen-zwei-mitlaute-anfang, lesen-mitlauthaeufung),
  `endung-ausgelassen` (lesen-endungen-en-er), `wort-zerrissen` (lesen-lange-woerter).
- Figuren: Die Kinder der Runde sind Empfänger; ihre Namen sind lautgetreu und zweisilbig (Ela, Kofi, Lena,
  Timo) und eignen sich als erste Lesewörter. Eines zeigt die Post einmal vor.
- Mach mit: Timo liest die Namen an den Briefkästen im Haus. „Lies die Namen an den Briefkästen, wenn du nach Hause kommst.“
- Regal-Material: Karte mit einem Anhänger, darauf ein Wort in Silbenbögen.
- Sachgrund der Heimatwelt: Post und Geschenke verteilen, Namen und Inhalte lesen · Kandidaten: berufe
  (die Postbotin), feste-im-kalender (Geschenkkärtchen), bauernhof (Futter für die Tiere)
- Stimmung: anpassbar. ruhig: Post im eigenen Haus · sanft: ein Päckchen ohne Namen, das Kind findet den
  Empfänger am Inhalt · abenteuer: Postfahrt über mehrere Orte mit Quatschwort-Namen, am Ende ein Fest.

### L08 Kaufladen
- Name fürs Kind: „Kaufladen“ · Symbol: eine Dose mit Etikett
- Handlung: Das Kind liest ein Etikett und klebt es an das richtige von drei Dingen, deren Namen fast gleich
  aussehen (Dose, Rose, Hose; Tasse, Tasche; Ofen, offen; Rabe, Rade). · Wirkung: Der Laden ist richtig
  beschriftet, und Kundinnen und Kunden (Gäste) finden, was auf ihrem Zettel steht.
- Material und Stufen: material: Etikett mit der Stelle, an der sich die Wörter unterscheiden, dezent
  unterstrichen · vorstellung: ohne Unterstrich · kopf: Etiketten mit zwei Unterschieden, auch Kl. 2
  (laufen/kaufen, Wald/Wand). Folge: wort-zum-bild, b-d-p, lang/kurz, genau hinsehen.
- Fehlerkontrolle: Klebt das Etikett am falschen Ding, schreibt sich der Name des Dings darunter; der
  unterschiedliche Buchstabe steht genau übereinander (H / D). Der Erzähler nennt beide: „Dose. Hose. Der
  Anfang ist anders.“
- Hauptthemen: lesen-wort-zum-bild, b-d-p-unterscheiden, lesen-lang-oder-kurz (Kl. 1); genau-hinsehen-lesen (Kl. 2)
- Weitere Zugänge: buchstabenpaare-gross-klein (Haupt L06)
- Warum perfekt: Montessori-Objektkarten (Etikett zum Ding) mit Minimalpaaren zwingen zum genauen Lesen; der
  Laden gibt den Zweck. Bild-Auswahl ist hier richtig, weil die Ablenker gerade das Raten verhindern.
- Bewusst nicht drin: Erlesen neuer Wörter → L07; Blitzwörter (ohne Bild) → L09.
- Gesten: Ziehen des Etiketts ans Ding (Tipp-Alternative).
- Lernzeichen: Wortkarten (Etiketten), Wortbilder, Unterstrich in Tinte weich (wie D3, aber für die
  Unterschiedsstelle: **neue Verwendung**, Annahme).
- Stimme: wenig bis mittel (Wörter und ein fester Vergleichssatz je Paar).
- Fehlerbilder: `b-d-lesen` (Signatur Ablenker b/d), `anfang-raten` (Ablenker mit gleichem Anfang: Haus,
  Hase), `ie-unsicher` und `schaerfung-fehlt` vorbereitend (lesen-lang-oder-kurz).
- Figuren: Ein Kind der Runde führt den Laden und klebt beim Vorzeigen einmal falsch, schaut, vergleicht
  Buchstabe für Buchstabe und klebt um. Gäste kaufen ein.
- Mach mit: Ela klebt Zettel an Dosen in der Küche. „Frag jemanden, ob ihr zusammen Zettel an Dinge in der Küche klebt.“
- Regal-Material: Karte mit zwei Wörtern untereinander, die sich in einem Buchstaben unterscheiden.
- Sachgrund der Heimatwelt: Dinge richtig beschriften, damit andere sie finden · Kandidaten:
  was-im-essen-steckt (Etiketten auf Lebensmitteln), werkzeuge (Werkzeugwand), obst-gemuese-reif
- Stimmung: ruhig fest
- Fachübergreifend: Schreiben (genau abschreiben, Fehler durch Vergleich finden).

### L09 Blitzwörter
- Name fürs Kind: „Blitzwörter“ · Symbol: eine Anzeigetafel mit einem kurzen Wort
- Handlung: Das Kind tippt, damit ein kleines Wort kurz auf der Anzeigetafel erscheint, und findet es danach
  unter drei bis vier Wortkarten. · Wirkung: Die Anzeige am Bahnhof ist vollständig, und der Satz darauf sagt,
  wohin der Zug fährt.
- Material und Stufen: material: das Wort bleibt lange stehen und wird gesprochen · vorstellung: kürzer,
  ohne Sprechen · kopf: kurz, und das Wort steht danach im Satz der Anzeige, den das Kind fertig liest.
  Blitzwörter 2 nach Blitzwörter 1.
- Fehlerkontrolle: Die gewählte Karte legt sich über die Stelle der Anzeige; ihr Umriss passt nicht zur Form
  des Blitzworts, beide Wörter erscheinen untereinander.
- Hauptthemen: blitzwoerter-1 (Kl. 1); blitzwoerter-2 (Kl. 2)
- Weitere Zugänge: keine
- Warum perfekt: Blitzlesen übt das Erkennen auf einen Blick. Die Anzeigetafel ist ein echter Ort, an dem man
  auf einen Blick liest.
- Bewusst nicht drin: Inhaltswörter mit Bild → L08.
- Gesten: Tippen.
- Lernzeichen: Wortkarten, Andika. Kurzes Zeigen ist **kein Timer**: Das Kind startet das Zeigen selbst und darf
  es wiederholen; wiederholtes Zeigen gilt als Hilfe (L12). **Annahme** zur Prüfung gegen N5.
- Stimme: wenig.
- Fehlerbilder: `anfang-raten` (blitzwoerter-1 als Thema), `lautgetreu-statt-merkwort` beim Schreiben
  (lernwoerter-kleine-woerter) als Verwandter.
- Figuren: Die Runde wartet am Bahnsteig, ein Kind liest die Anzeige vor (zeigt vor), alle freuen sich, wenn
  klar ist, wohin es geht.
- Mach mit: Kofi liest im Vorbeigehen ein kleines Wort auf einem Schild. „Unterwegs stehen kleine Wörter auf Schildern. Welches findest du?“
- Regal-Material: Karte mit dem Blitzwort (und, ist).
- Sachgrund der Heimatwelt: Anzeigen und Schilder, die man im Vorbeigehen liest · Kandidaten: unterwegs,
  verkehrszeichen
- Stimmung: ruhig fest
- Fachübergreifend: Schreiben (Lernwörter, kleine Wörter).

### L10 Wortbausteine
- Name fürs Kind: „Bausteine“ · Symbol: drei Bausteine nebeneinander
- Handlung: Das Kind trennt ein langes Wort an den Fugen in Bausteine (ver | lauf | en, Spiel | zeug | kiste)
  und findet den bekannten Stamm. · Wirkung: Die Bausteine fallen in die Fächer einer Werkstatt; das Ding,
  das das Wort meint, wird aus den Teilen sichtbar gebaut.
- Material und Stufen: material: Fugen sind als feine Linien vorgezeichnet, das Kind tippt sie nur an ·
  vorstellung: ohne Linien, das Kind setzt die Fugen · kopf: Wort lesen und den Stamm in einer Wortfamilie
  wiederfinden (spielen, Spieler, Spielzeug).
- Fehlerkontrolle: Eine Fuge an falscher Stelle ergibt Teile, die es nicht gibt („Spi | elzeug“); diese
  passen in kein Fach und werden so gesprochen.
- Hauptthemen: wortbausteine-lesen, wortstamm-lesen (Kl. 2); lange-woerter-in-bausteinen-lesen (Kl. 3)
- Weitere Zugänge: lesen-lange-woerter (Haupt L07)
- Warum perfekt: Morphemisches Lesen heißt, bekannte Teile wiederzuerkennen. Trennen an Fugen ist dafür
  genauer als Silbenlesen.
- Bewusst nicht drin: lesen-lange-woerter → L07 (Silben, nicht Bausteine).
- Gesten: Tippen auf die Fuge.
- Lernzeichen: Wortkarten. **Neu:** Fuge zwischen Bausteinen (Strich in Tinte). Keine Wortartsymbole (D2).
- Stimme: mittel.
- Fehlerbilder: `ableitung-ae-aeu` (Übung wortstamm-lesen), `wort-zerrissen` (vorsilben-ver-vor).
- Figuren: Ela baut gern (beiläufig, figuren.md §2), sie zeigt hier aber nicht fest vor; wer vorzeigt, wechselt.
- Mach mit: Lena teilt ein langes Wort auf einer Packung in Bausteine. „Such ein langes Wort auf einer Packung. Welche Bausteine stecken darin?“
- Regal-Material: Karte mit drei Bausteinen und Fugen.
- Sachgrund der Heimatwelt: zusammengesetzte Dinge und ihre Namen in einer Werkstatt · Kandidaten: werkzeuge,
  berufe, erfindungen
- Stimmung: ruhig fest
- Fachübergreifend: **Grammatik und Schreiben** (Wortfamilie, Wortstamm, Vorsilben). Dort vermutlich ein
  eigenes Spiel mit derselben Handlung; zusammenführen.

### L11 Quatsch finden
- Name fürs Kind: „Stimmt das?“ · Symbol: ein Zeitungsblatt mit Lupe
- Handlung: Das Kind liest einen Satz für die Zeitung der Runde und tippt das Wort an, das in echt nicht
  stimmen kann (Kl. 4: den Satz, der einem anderen widerspricht). · Wirkung: Das Kind ersetzt das Wort aus zwei
  Vorschlägen, und die Zeitung wird gedruckt.
- Material und Stufen: material: ein Satz mit Sachbild daneben · vorstellung: ohne Sachbild · kopf: zwei bis vier
  Sätze, der Fehler kann überall stecken. Kl. 1 zuerst nur „stimmt / stimmt nicht“, dann das Wort finden.
- Fehlerkontrolle: Das Sachbild mit Echt-Zeichen zeigt, wie es in echt ist (eine Henne legt das Ei, nicht die
  Kuh). Tippt das Kind ein Wort an, das stimmt, zeigt das Sachbild genau dieses Wort als richtig.
- Hauptthemen: lesen-sinn-pruefen (Kl. 1); falsches-wort-finden (Kl. 2); widerspruch-im-text (Kl. 4)
- Weitere Zugänge: lesen-satz-zum-bild (Haupt Z03); gehoertes-pruefen (Haupt Z04)
- Warum perfekt: Sinnprüfen braucht eine Sache, an der man prüft. Das Echt-Zeichen (K11) trennt Wirklichkeit
  von Fantasie; „Der Ball kann singen“ ist in der Zeitung Quatsch, im Märchen nicht. So lernt das Kind auch die
  Rahmung.
- Bewusst nicht drin: gehoertes-pruefen → Z04 (Hören); textsorte-erkennen → L17.
- Gesten: Tippen.
- Lernzeichen: Wortkarten, Sachbild mit Echt-Zeichen.
- Stimme: mittel (jeder Satz in Fehler- und Richtigform).
- Fehlerbilder: keins im Bestand.
- Figuren: Ein Kind der Runde zeigt auf das Sachbild (F8); ein anderes wundert sich über den Satz.
- Mach mit: Timo denkt sich einen Quatschsatz aus, Ela lacht. „Sag jemandem einen Satz, der in echt nicht stimmen kann. Merkt er es?“
- Regal-Material: Karte mit Zeitungsblatt.
- Sachgrund der Heimatwelt: Echt oder ausgedacht unterscheiden, Sachsätze prüfen · Kandidaten:
  echt-oder-ausgedacht, bauernhof, fell-federn-schuppen
- Stimmung: ruhig fest

### L12 Nachlesen
- Name fürs Kind: „Nachlesen“ · Symbol: ein Blatt mit Zeilen und einem Finger daran
- Handlung: Das Kind hat eine Frage (Wem gehört der Hut? Wann ist das Fest?) und tippt im Text auf das Wort
  oder die Zeile, die antwortet. · Wirkung: Die Antwort wird benutzt: Der Hut kommt zu Ida, das Fest trägt
  sich in den Kalender ein, das Plakat über den Igel bekommt sein Bild.
- Material und Stufen: material: zwei Sätze, die Antwortzeile ist leicht hervorgehoben · vorstellung: drei
  bis vier Sätze, ohne Hervorhebung · kopf: Absatz mit Überschrift; Kl. 2 auch fett gedruckte Wörter als
  Hilfe; Kl. 3 und 4 markiert das Kind selbst, verbindet zwei Stellen, findet, wen „er“ meint, und liest
  aus Bild und Bildunterschrift.
- Fehlerkontrolle: Das angetippte Wort wird wörtlich benutzt. Tippt das Kind „Ole“, wandert der Hut zu Ole,
  der schon einen Ball hält; die Zeile „Ole hat einen Ball“ leuchtet ruhig auf. Die Sache zeigt, dass es nicht
  passt.
- Hauptthemen: frage-zum-text (Kl. 1); wer-wo-wann-lesen, zeile-und-absatz-finden, fettdruck-nutzen (Kl. 2); wichtiges-im-text-markieren, sachtext-mit-bild-lesen, wer-ist-mit-er-gemeint (Kl. 3); informationen-verknuepfen (Kl. 4)
- Weitere Zugänge: mein-stichwortzettel (Haupt Z10)
- Warum perfekt: Nachlesen heißt: Die Antwort steht im Text, man muss sie finden und zeigen. Zeigen statt
  Auswählen ist echter Abruf (L1) und zugleich der Beleg.
- Bewusst nicht drin: zwischen-den-zeilen-lesen → L15 (die Antwort steht nicht wörtlich da); lesen-tabelle,
  inhaltsverzeichnis-nutzen → L13 (Ordnung statt Fließtext).
- Gesten: Tippen auf Wort oder Zeile.
- Lernzeichen: Andika, Wortkarten; Hervorhebung als Sonnenring (Aufmerksamkeit, bewertet nichts).
- Stimme: viel (Texte vorlesbar, L11; je Text Fragen und Folgesätze).
- Fehlerbilder: keins im Bestand.
- Figuren: Ein Kind der Runde hat etwas verloren und schaut fragend (fragen / etwas fehlt); ein anderes zeigt
  das Nachlesen mit dem Finger vor.
- Mach mit: Ela sucht auf einer Einladung, wann das Fest ist. „Wenn eine Einladung oder ein Zettel kommt: Such, was du wissen willst.“
- Regal-Material: Karte mit drei Zeilen und einem markierten Wort.
- Sachgrund der Heimatwelt: aus Nachrichten, Einladungen und Sachtexten etwas herausfinden, das man braucht ·
  Kandidaten: wald-und-teich, haustiere, feste-im-kalender
- Stimmung: ruhig fest
- Fachübergreifend: **Grammatik** (wer-ist-mit-er-gemeint, Pronomen); **Mathe** (Angaben in Sachaufgaben finden).

### L13 Nachschlagen
- Name fürs Kind: „Nachschlagen“ · Symbol: ein Buch mit Lesezeichen
- Handlung: Das Kind nutzt eine Ordnung (Zeile und Spalte einer Tabelle, Inhaltsverzeichnis, Verweise auf einer
  Seite), um zu einer Angabe zu springen, und tippt sie an. · Wirkung: Die Angabe wird gebraucht: Die
  Turnsachen kommen am richtigen Tag in die Tasche, das Kapitel über den Fuchs öffnet sich.
- Material und Stufen: material: Tabelle mit vier Zellen, Finger folgt Zeile und Spalte · vorstellung: größere
  Tabelle (Stundenplan) · kopf: Kl. 3 Inhaltsverzeichnis mit Seitenzahl, Kl. 4 eine nachgebaute Seite mit
  Verweisen (offline, keine echte Webseite).
- Fehlerkontrolle: Die angetippte Zelle oder Seite öffnet sich und zeigt, was dort wirklich steht (am Montag:
  Musik). Die Frage bleibt sichtbar daneben.
- Hauptthemen: lesen-tabelle (Kl. 2); inhaltsverzeichnis-nutzen (Kl. 3); auf-webseiten-suchen (Kl. 4)
- Weitere Zugänge: zeile-und-absatz-finden (Haupt L12)
- Warum perfekt: Nachschlagen liest nicht den ganzen Text, sondern nutzt eine Ordnung. Das ist eine eigene
  Handlung und trägt vom Stundenplan bis zur Webseite.
- Bewusst nicht drin: sachtext-mit-bild-lesen → L12.
- Gesten: Tippen.
- Lernzeichen: Tabelle mit Linien in Tinte, Ziffern; Seitenzahlen. Keine Stellenwertfarben.
- Stimme: mittel.
- Fehlerbilder: keins im Bestand.
- Figuren: Timo packt seine Tasche (beiläufig), ein anderes Kind zeigt mit dem Finger Zeile und Spalte vor.
- Mach mit: Kofi schaut auf seinen Stundenplan. „Schau auf deinen Stundenplan: Wann hast du Sport?“
- Regal-Material: Karte mit kleiner Tabelle.
- Sachgrund der Heimatwelt: Fahrplan, Stundenplan, Lexikon benutzen · Kandidaten: unterwegs (Fahrplan),
  jahreskreis, karten
- Stimmung: ruhig fest
- Fachübergreifend: **Mathe** (Tabellen, Strichliste, Diagramme lesen). Falls Mathe ein Tabellen-Spiel hat,
  wäre lesen-tabelle dort zweiter Zugang.

### L14 Titel finden
- Name fürs Kind: „Titel“ · Symbol: ein Buchrücken mit Schriftzug
- Handlung: Das Kind gibt einem Text oder einer Hörgeschichte den passenden Titel (oder vermutet vorher aus einem
  Titel, worum es geht). · Wirkung: Der Text kommt mit seinem Titel in den Schaukasten der Schule, und wer etwas
  zu diesem Thema sucht, findet ihn.
- Material und Stufen: material: zwei Titel zur Wahl, kurzer Text · vorstellung: drei Titel, einer davon nennt
  nur eine Einzelheit · kopf: Kl. 4 den besten von mehreren Titeln oder einen Satz „kurz gesagt“. Für
  ueberschrift-verraet: erst aus dem Titel vermuten (L2), dann lesen.
- Fehlerkontrolle: Unter dem gewählten Titel leuchten die Sätze des Textes auf, die er wirklich abdeckt. Ein
  Titel, der nur eine Einzelheit nennt, lässt die meisten Sätze dunkel.
- Hauptthemen: ueberschrift-verraet (Kl. 2); worum-gehts-hoeren (Kl. 3); beste-ueberschrift-waehlen, kurz-gesagt (Kl. 4)
- Weitere Zugänge: text-in-eigenen-worten (Haupt Z10)
- Warum perfekt: Den Kern erfassen heißt, eine Überschrift zu finden, die alles trägt. Das Aufleuchten macht
  „trägt alles / trägt nur einen Teil“ sichtbar, ohne Urteil. Hören und Lesen teilen das Spiel, weil die
  Handlung (Titel geben) gleich bleibt; bei Hörtexten leuchten Bilder statt Sätze.
- Bewusst nicht drin: text-in-eigenen-worten → Z10 (selbst sprechen).
- Gesten: Tippen.
- Lernzeichen: Wortkarten, Andika. Fach je Runde: Lesen oder Sprechen nach Thema (Annahme).
- Stimme: viel (Texte, Titel).
- Fehlerbilder: keins im Bestand.
- Figuren: Ein Kind der Runde sucht etwas im Schaukasten und freut sich, wenn es den Text findet.
- Mach mit: Lena schreibt einen Titel über ihr Bild. „Gib einem Bild, das du gemalt hast, einen Titel.“
- Regal-Material: Karte mit Buchrücken.
- Sachgrund der Heimatwelt: Texte so ordnen, dass andere sie finden · Kandidaten: medien-alltag, frueher-heute
- Stimmung: ruhig fest

### L15 Spurenleser
- Name fürs Kind: „Spuren“ · Symbol: Fußspuren im Schnee
- Handlung: Das Kind verbindet zwei oder mehr Hinweise aus einer Hörgeschichte oder einem Text zu einem Schluss
  (Wer war es? Warum tut sie das? Wie geht es weiter?) und tippt auf die Hinweise, die den Schluss tragen. ·
  Wirkung: Das Rätsel löst sich in der Szene: Die Katze leckt sich das Maul, die Spur im Schnee war ein Hase.
- Material und Stufen: material: Hinweise liegen als Bildkarten bereit · vorstellung: Hinweise nur gehört
  oder gelesen · kopf: Kl. 3 und 4 Ratekrimi mit mehreren Hinweisen, Gründe für das Handeln einer Figur,
  Eigenschaften einer Figur aus ihrem Tun (figur-beschreiben-lesen: das Kind wählt ein Adjektiv und tippt die
  Stelle, die es zeigt).
- Fehlerkontrolle: Die Szene spielt den gewählten Schluss an: Passt er nicht zu einem Hinweis, bleibt genau
  dieser Hinweis sichtbar offen („Der Teller ist leer. Der Hund schläft draußen.“).
- Hauptthemen: hoeren-und-schliessen, wie-geht-es-weiter-lesen, figur-beschreiben-lesen (Kl. 2); zwischen-den-zeilen-lesen, puzzle-im-ohr, warum-tut-sie-das-hoeren (Kl. 3); warum-handelt-die-figur-so, ratekrimi (Kl. 4)
- Weitere Zugänge: gefuehl-der-figur (Haupt Z06); vermutung-aeussern (Haupt Z08)
- Warum perfekt: Schließen heißt, Hinweise zu verbinden. Das gilt gleich für Hören und Lesen; die
  Hinweise-Antippen-Pflicht verhindert Raten und ist die Begründung zugleich. Spannung kommt aus Neugier
  (9.2 Nr. 1, „Wer hat die Spuren gemacht? Ein Hase.“).
- Bewusst nicht drin: Antworten, die wörtlich dastehen → L12; ich-finde-weil → Z08 (Meinung).
- Gesten: Tippen.
- Lernzeichen: Bildkarten, Wortkarten, Adjektive ohne Wortartsymbol (Thema ist Verstehen, nicht Grammatik).
- Stimme: viel (Geschichten und Hinweise).
- Fehlerbilder: keins im Bestand.
- Figuren: Lena sammelt Käfer und Steine (beiläufig) und findet die erste Spur; ein Kind wundert sich laut ohne
  Worte, ein anderes zeigt auf das Sachbild der Spur. Fähigkeit möglich: schrumpfen (Lupenmütze), um eine Spur
  von nahem zu sehen, nur wenn die Szene es braucht.
- Mach mit: Timo entdeckt Spuren im Sand. „Schau draußen, ob du Spuren findest. Wer könnte das gewesen sein?“
- Regal-Material: Karte mit Fußspur.
- Sachgrund der Heimatwelt: Spuren und Zeichen in der Natur deuten · Kandidaten: wiese-und-hecke,
  jahreszeiten-natur, tarnen-verstecken
- Stimmung: anpassbar. ruhig: Spuren im Garten am Tag · sanft: ein Ding ist weg, die Spur führt sofort hin ·
  abenteuer: Ratekrimi über mehrere Runden, Nebel und ein Geräusch, es war eine Eule; jede Runde endet hell.

### L16 Wörterlupe
- Name fürs Kind: „Lupe“ · Symbol: eine Lupe über einem Wort
- Handlung: Das Kind tippt beim Lesen ein Wort an, das es nicht kennt, und wählt aus dem Satz heraus, was es
  hier bedeutet (Kl. 3 und 4 auch Redewendungen und Sprachbilder). · Wirkung: Das Wort klärt sich, und die
  Geschichte geht mit dem Verstandenen weiter (der Igel findet unter dem Reisig ein Winterquartier).
- Material und Stufen: material: unbekanntes Wort mit Bild zur Wahl · vorstellung: Bedeutung aus dem Satz
  ohne Bild · kopf: Redewendung („jemandem einen Bären aufbinden“): wörtliches Bild gegen gemeinte Bedeutung.
- Fehlerkontrolle: Ersatzprobe. Der Erzähler liest den Satz mit der gewählten Bedeutung an Stelle des Wortes;
  passt sie nicht, wird der Satz hörbar unsinnig. Bei Redewendungen zeigt das wörtliche Bild, wie absurd die
  wörtliche Deutung ist (humorvoll, aber nicht lustiger als die passende Auflösung, N7).
- Hauptthemen: unbekanntes-wort-klaeren (Kl. 2); wortbedeutung-aus-dem-satz, redewendungen-verstehen (Kl. 3); sprachbilder-verstehen (Kl. 4)
- Weitere Zugänge: unbekanntes-wort-erfragen (Haupt Z05)
- Warum perfekt: Bemerken und Klären sind zwei Schritte derselben Handlung; die Ersatzprobe ist die Sache, die
  urteilt.
- Bewusst nicht drin: unbekanntes-wort-erfragen → Z05 (Hören, Nachfragen).
- Gesten: Tippen.
- Lernzeichen: Wortkarten, Wortbilder.
- Stimme: viel (Sätze mit jeder Ersatzbedeutung).
- Fehlerbilder: keins im Bestand.
- Figuren: Ein Kind der Runde stockt beim Lesen, tippt das Wort an (zeigt vor, dass Nachfragen dazugehört).
- Mach mit: Ela fragt beim Vorlesen nach einem Wort (zeigt darauf, der Erzähler sagt die Frage). „Wenn du ein Wort nicht kennst, frag jemanden, was es heißt.“
- Regal-Material: Karte mit Lupe.
- Sachgrund der Heimatwelt: Sachwörter und alte Wörter in Sachtexten · Kandidaten: wald-und-teich,
  frueher-heute, berufe
- Stimmung: ruhig fest
- Fachübergreifend: Grammatik/Wortschatz, falls es dort Wortfelder gibt.

### L17 Bücherei
- Name fürs Kind: „Bücherei“ · Symbol: ein Regal mit drei Büchern
- Handlung: Das Kind liest den Anfang eines Textes und stellt ihn ins passende Fach (Gedicht, Geschichte,
  Sachtext, Anleitung, Rezept; Kl. 3 und 4 Märchen, Fabel, Sage). · Wirkung: Die Texte werden benutzt, wie es
  zu ihrer Sorte passt: Das Rezept wird gekocht, das Gedicht vorgelesen, die Anleitung gebaut.
- Material und Stufen: material: jedes Fach trägt ein Merkmalbild (Topf, Zeilen mit Reimbogen, Echt-Zeichen) ·
  vorstellung: Fächer nur beschriftet · kopf: Kl. 3 und 4 Merkmale benennen (Es war einmal, Tiere mit Lehre,
  ein echter Ort).
- Fehlerkontrolle: Im falschen Fach leuchten die Merkmale des Textes auf, die nicht passen (keine Zutaten im
  Rezeptfach), und die Benutzung stockt sichtbar (der Topf bleibt leer).
- Hauptthemen: textsorte-erkennen (Kl. 2); maerchen-erkennen, fabel-erkennen (Kl. 3); sage-erkennen (Kl. 4)
- Weitere Zugänge: keine
- Warum perfekt: Textsorten erkennt man an Merkmalen und am Gebrauch. Die Bücherei ist der Ort, an dem man
  danach ordnet.
- Bewusst nicht drin: Reim im Gedicht → L01; Titel → L14.
- Gesten: Ziehen ins Fach (Tipp-Alternative).
- Lernzeichen: Wortkarten, Echt-Zeichen für Sachtexte (K11). Fabeltexte zeigen sprechende Tiere als Textsorte;
  sie werden als gedruckter Text gelesen, nie als Figur der App gezeigt (T1, **Annahme**).
- Stimme: mittel.
- Fehlerbilder: keins im Bestand.
- Figuren: Ein Gast (der Bibliothekar) zeigt die Fächer; ein Kind der Runde holt sich ein Rezept und backt
  (Timo backt gern, beiläufig).
- Mach mit: Kofi stellt seine Bücher ins Regal. „Schau in dein Bücherregal: Wo steht ein Sachbuch, wo eine Geschichte?“
- Regal-Material: Karte mit drei Buchrücken.
- Sachgrund der Heimatwelt: echt oder ausgedacht, Geschichten von früher · Kandidaten: echt-oder-ausgedacht,
  frueher-heute, gemeinde-bis-europa (Sagen aus der Gegend)
- Stimmung: ruhig fest

### L18 Vorlese-Partitur
- Name fürs Kind: „Vorlesen“ · Symbol: ein aufgeschlagenes Buch mit Schallbogen
- Handlung: Das Kind bereitet einen kurzen Text zum Vorlesen vor: Es setzt an jeden Punkt eine Pause, folgt dem
  Satz über das Zeilenende, wählt bei Fragezeichen und Ausrufezeichen die Stimmführung; dann liest es selbst vor.
  · Wirkung: Der Erzähler liest genau nach diesen Marken; daraus wird ein Gute-Nacht-Hörbuch für ein jüngeres
  Kind in der Geschichte.
- Material und Stufen: material: Marken liegen als Kärtchen bereit (Pause, Stimme hoch, kräftig) · vorstellung:
  Marken unsichtbar, das Kind tippt nur die Stelle · kopf: eigenes Vorlesen als Angebot (Aufnahme, falls
  freigegeben; zählt nicht für „gekonnt“), am nächsten Tag derselbe Text noch einmal (schnell-lesen-wiederholt); die frühere Aufnahme liegt
  daneben (N8, Fortschritt aus der Sache). Kl. 2 auch: von zwei Lesungen des Erzählers die wählen, die zum
  Satzzeichen passt (betonen-und-pausen). Kl. 3 und 4 Gedichte und Rollentexte.
- Fehlerkontrolle: Der Erzähler liest wörtlich nach den Marken. Fehlt die Pause am Punkt, verschwimmen zwei
  Sätze hörbar („Tim ruft der Hund kommt“); eine Pause mitten im Satz zerreißt ihn; eine Frage ohne Marke
  klingt wie eine Feststellung.
- Hauptthemen: punkt-heisst-pause (Kl. 1); ueber-die-zeile-lesen, schnell-lesen-wiederholt, fragen-betont-lesen, betonen-und-pausen (Kl. 2); mit-betonung-vorlesen (Kl. 3); gedicht-vortragen-lesen, szenische-lesung (Kl. 4)
- Weitere Zugänge: blitzwoerter-1 (Haupt L09); blitzwoerter-2 (Haupt L09); gedicht-vortragen (Haupt Z09); stimme-verstellen (Haupt Z09)
- Warum perfekt: Satzzeichen beim Lesen hörbar machen ist eine Handlung von „Punkt heißt Pause“ bis zum
  betonten Vorlesen. Das Kind entscheidet, die Stimme führt es aus, die Sache klingt. So braucht es keine
  Spracherkennung.
- Bewusst nicht drin: gedicht-vortragen (auswendig) → Z09; satzarten → Grammatik.
- Gesten: Tippen auf Satzzeichen und Zeilenende, Ziehen von Marken (Tipp-Alternative). **Neu:** Aufnahmeknopf
  für das eigene Vorlesen (wahlweise, nicht nötig für die Kontrolle).
- Lernzeichen: Andika-Text. **Neu:** Pausenmarke und Stimmmarke über dem Text.
- Stimme: **sehr viel und technisch heikel.** Jeder Satz muss in Stücken aufgenommen werden, damit Pausen an
  beliebiger Stelle möglich sind, und Fragen in zwei Stimmführungen. **Annahme:** mit SSML-Pausen vorab je
  Markenkombination erzeugen; vor dem Bau an drei Sätzen ausprobieren.
- Fehlerbilder: `satzzeichen-fehlen` (Übung punkt-heisst-pause, fragen-betont-lesen).
- Figuren: Ein Kind der Runde ist das Publikum (hört zu, gähnt zufrieden beim Gute-Nacht-Text); ein anderes
  zeigt die erste Partitur vor und setzt dabei eine Pause falsch, hört es und schiebt sie.
- Mach mit: Timo liest seiner kleinen Halbschwester ein Buch vor. „Frag jemanden, ob du ihm heute einen kurzen Text vorlesen darfst.“
- Regal-Material: Karte mit einem Satz und einer Pausenmarke.
- Sachgrund der Heimatwelt: jemandem vorlesen, abends · Kandidaten: mein-tag, bewegen-schlafen
- Stimmung: ruhig fest
- Fachübergreifend: **Grammatik** (Satzarten, Satzschlusszeichen) und **Schreiben** (Punkt am Satzende).

### Z01 Lauschposten
- Name fürs Kind: „Lauschen“ · Symbol: ein Ohr mit Bogenlinien
- Handlung: Das Kind wartet still, bis ein Geräusch kommt oder aufhört, erkennt, was es ist, und tippt dort in
  die Szene, wo es herkommt (links oder rechts, nah oder fern). · Wirkung: Das Tier oder Ding zeigt sich an
  dieser Stelle, als Sachbild mit Echt-Zeichen.
- Material und Stufen: Z1-Themen haben nur kopf (bzw. material, kopf). kopf: Geräusch, dann Wahl unter drei
  Bildern; laut/leise: zwei Geräusche nacheinander, das leisere sitzt weiter weg; Richtung nur mit Kopfhörern.
  Folge: stille-hoeren, geraeusche-erkennen, dann laut-oder-leise und geraeusch-richtung.
- Fehlerkontrolle: An der angetippten Stelle zeigt sich, was wirklich dort ist (ein Busch, sonst nichts); das
  Geräusch kommt noch einmal von seiner echten Stelle.
- Hauptthemen: stille-hoeren, geraeusche-erkennen, laut-oder-leise, geraeusch-richtung (Kl. 1)
- Weitere Zugänge: keine
- Warum perfekt: Erkennen, Entfernung und Richtung sind Teile einer Handlung: eine Quelle orten. Der Sachgrund
  stimmt in echt: Tiere zeigen sich, wenn es still ist (Montessori-Stilleübung).
- Bewusst nicht drin: geraeuschkette-kurz → Z02 (Reihenfolge).
- Gesten: Tippen. **Neu:** Kopfhörer-Hinweis für links/rechts; ohne Kopfhörer entfällt diese Stufe.
- Lernzeichen: Sachbilder mit Echt-Zeichen; Geräusche aus echten Aufnahmen (Lizenz klären).
- Stimme: wenig Erzähler, viele Geräuschaufnahmen (kein Florian, sondern Klangbibliothek).
- Fehlerbilder: keins im Bestand.
- Figuren: Die Runde sitzt still am Rand und zeigt, wie man wartet; ein Kind hebt den Finger an die Lippen
  (vorzeigen), ein anderes freut sich leise, wenn der Vogel kommt. Lenas Hörgerät wird nicht zum Thema.
- Mach mit: Kofi sitzt still am offenen Fenster. „Setz dich einen Moment ganz still hin. Was hörst du?“
- Regal-Material: Karte mit Ohr.
- Sachgrund der Heimatwelt: Tiere an ihren Stimmen erkennen und finden · Kandidaten: wiese-und-hecke, sinne,
  tarnen-verstecken
- Stimmung: anpassbar. ruhig: Hecke am Tag · sanft: Dämmerung, ein Tier versteckt sich kurz · abenteuer:
  Nachtwanderung mit Laterne, ein Rascheln ist ein Igel, ein Ruf eine Eule.

### Z02 Wäscheleine
- Name fürs Kind: „Wäscheleine“ · Symbol: eine Leine mit drei Klammern
- Handlung: Das Kind hängt Karten in der Reihenfolge an die Leine, in der es etwas gehört oder gelesen hat
  (Geräusche, Bilder einer Hörgeschichte, Satzstreifen). · Wirkung: Die Szene spielt die Reihenfolge ab:
  Der Samen wird gepflanzt, gegossen, wächst, blüht.
- Material und Stufen: material: Karten mit Bild, beim Antippen klingen sie · kopf: Karten ohne Klang, drei
  bis vier. Kl. 2 lesen-reihenfolge: Satzstreifen statt Bilder.
- Fehlerkontrolle: Die Szene spielt genau die gehängte Reihenfolge. Was so nicht geht, stockt sichtbar: Die
  Blume soll blühen, wo noch kein Samen liegt, der Topf bleibt leer. Bei Geräuschketten läuft danach das
  Original, die Karten leuchten im echten Takt mit.
- Hauptthemen: geraeuschkette-kurz, geraeuschkette-lang (Kl. 1); hoergeschichte-reihenfolge, lesen-reihenfolge (Kl. 2)
- Weitere Zugänge: tag-erzaehlen-mit-bildern (Haupt Z10); nacherzaehlen-mit-bildern (Haupt Z10)
- Warum perfekt: Ordnen auf einer Leine ist die eine Handlung; dass die Szene die Ordnung abspielt, lässt die
  Sache urteilen (Ursache vor Wirkung).
- Bewusst nicht drin: Erzählen zu den Bildern → Z10.
- Gesten: Ziehen an die Leine (Tipp-Alternative: Karte, dann Klammer).
- Lernzeichen: Bildkarten, Satzstreifen in Andika.
- Stimme: mittel (Geschichten, Geräusche).
- Fehlerbilder: keins im Bestand.
- Figuren: Ein Kind der Runde zeigt vor und hängt erst eine Karte falsch, sieht die Szene stocken und hängt um.
- Mach mit: Ela hört beim Kuchenbacken zu, was zuerst kommt. „Hör beim Kochen oder Backen zu: Was kommt zuerst, was danach?“
- Regal-Material: Karte mit drei Klammern.
- Sachgrund der Heimatwelt: Abläufe, die nur in einer Reihenfolge gehen · Kandidaten: vom-ei-zum-tier,
  was-pflanzen-brauchen, wer-macht-mein-brot
- Stimmung: ruhig fest
- Fachübergreifend: **Schreiben** (bildergeschichte-ordnen-3 ist Voraussetzung eines Themas hier; vermutlich
  dieselbe Handlung).

### Z03 Auftrag
- Name fürs Kind: „Auftrag“ · Symbol: ein Tablett mit Tasse und Teller
- Handlung: Das Kind hört (oder liest auf einem Zettel) einen, zwei oder drei Aufträge und führt sie in der
  Szene aus (Teller auf den Tisch, den Vogel neben das Haus, „das Ding, das rund und rot ist und einen Stiel
  hat“). · Wirkung: Der Tisch ist gedeckt, die Bühne aufgebaut, die Gäste setzen sich.
- Material und Stufen: kopf (Hören): ein Auftrag, dann zwei, dann drei, dann mit Lagewort, dann Beschreibung
  mit mehreren Merkmalen (Fundbüro). Lesen: material: Zettel mit einem Wort und Bild (Lies und tu) ·
  vorstellung: kurzer Satz · kopf: Satz mit Lagewort (lesen-satz-zum-bild als „stell es so, wie es dasteht“).
- Fehlerkontrolle: Die Szene zeigt, was das Kind getan hat, und der Erzähler beschreibt es neben dem Auftrag:
  „Der Teller liegt unter dem Tisch. Auf den Tisch sollte er.“ Die Gäste setzen sich erst, wenn alles stimmt.
- Hauptthemen: auftrag-ausfuehren, doppelauftrag, auftrag-mit-lagewort, lies-und-tu, lesen-satz-zum-bild (Kl. 1); dreierauftrag, ding-beschreiben (Kl. 2)
- Weitere Zugänge: keine
- Warum perfekt: Ausführen ist die Handlung, die zeigt, ob man verstanden hat. Gehört oder gelesen bleibt die
  Handlung dieselbe; je Runde gilt nur ein Weg (eine Schwierigkeit). Beim Hören wächst die Zahl der Aufträge
  (Gedächtnis), beim Lesen die Satzlänge.
- Bewusst nicht drin: hoergeschichte-* → Z04 (Geschichte, nicht Auftrag).
- Gesten: Ziehen von Dingen (Tipp-Alternative), Tippen.
- Lernzeichen: Wortbilder, Zettel mit Andika. Lagewörter wie in Geometrie.
- Stimme: viel (jede Auftragskombination).
- Fehlerbilder: keins im Bestand.
- Figuren: Die Runde bereitet ein Fest vor; das Kind ist die Helferin oder der Helfer. Ein Kind der Runde zeigt
  den ersten Auftrag vor und fragt (ohne Worte) mit Blick auf den Zettel nach.
- Mach mit: Timo deckt den Tisch nach drei Aufträgen. „Frag jemanden, ob er dir drei Aufträge gibt, und mach sie der Reihe nach.“
- Regal-Material: Karte mit Tablett.
- Sachgrund der Heimatwelt: nach Anweisung einrichten und decken · Kandidaten: von-oben (Raumlage),
  haustiere (Käfig einrichten), bauernhof
- Stimmung: ruhig fest
- Fachübergreifend: **Geometrie** (Lagewörter; auftrag-mit-lagewort setzt neben-zwischen-ueber-unter-auf voraus).

### Z04 Hörbühne
- Name fürs Kind: „Theater“ · Symbol: ein kleiner Bühnenvorhang
- Handlung: Das Kind hört eine kurze Geschichte und baut danach die Bühne: wer vorkommt, wo es spielt, welche
  Einzelheiten. · Wirkung: Die Bühne spielt die Geschichte als Puppentheater nach, so wie das Kind sie gebaut
  hat; das Kind steigt dazu „ins Bild“ und sitzt in der ersten Reihe.
- Material und Stufen: kopf: nach der Geschichte zwei bis drei Bühnenteile zur Wahl. Folge: Hauptfigur, Ort,
  vorher ein Hörauftrag („Achte auf die Farbe“), dann eine Einzelheit ohne Ankündigung, dann Nachprüfen: Der
  Erzähler spielt nach und hat etwas verändert, das Kind hält an (gehoertes-pruefen). Kl. 3: eigene Hörfrage
  vorher wählen, ein Glöckchen antippen, wenn das Schlüsselwort fällt, Geschichte mit Hintergrundlärm. Kl. 4:
  zwei Geschichten auf zwei Bühnen vergleichen; Aussage prüfen und die Stelle nennen.
- Fehlerkontrolle: Das Puppentheater hält genau an der Stelle an, an der Bühne und Geschichte nicht
  zusammenpassen (die Geschichte sagt Ente, auf der Bühne steht ein Igel). Der Satz wird noch einmal gespielt.
- Hauptthemen: hoergeschichte-hauptfigur, hoergeschichte-ort, hoerauftrag-gezielt (Kl. 1); hoerdetail-nebenbei, gehoertes-pruefen, sprecher-unterscheiden (Kl. 2); meine-hoerfrage, schluesselwort-fangen, trotz-laerm-verstehen (Kl. 3); viele-stimmen-verstehen, stimmt-die-aussage-und-warum, zwei-geschichten-vergleichen (Kl. 4)
- Weitere Zugänge: frage-zum-text (Haupt L12); worum-gehts-hoeren (Haupt L14)
- Warum perfekt: Nachbauen aus dem Gedächtnis ist echter Abruf (L1); das Puppentheater ist die Sache, die
  prüft. Alle Spielarten nutzen dieselbe Bühne.
- Bewusst nicht drin: Reihenfolge → Z02; Schließen → L15. **sprecher-unterscheiden und viele-stimmen-verstehen
  sind mit einer Stimme nicht baubar**, solange Figuren nicht sprechen (siehe Offene Fragen); bis dahin nicht
  anbieten.
- Gesten: Ziehen von Bühnenteilen (Tipp-Alternative), Tippen (Anhalten, Glöckchen). Das Glöckchen ist
  zeitgebunden, aber ohne Timer und ohne Folge bei Verspätung (der Erzähler spielt die Stelle noch einmal).
- Lernzeichen: Wortbilder und Bühnenteile im Figurenstil. Kein Text.
- Stimme: viel (Geschichten, Fassungen mit Änderung, Lärmfassung).
- Fehlerbilder: keins im Bestand.
- Figuren: Die Runde spielt die Puppen (Gäste als Puppen erlaubt, Tiere nur sachlich). Ein Kind zeigt die erste
  Bühne vor. Fähigkeit: ins Bild steigen (Bilderrahmen als Tür), wenn die Bühne fertig ist; Folge der Lösung,
  nie Belohnung.
- Mach mit: Lena spielt eine gehörte Geschichte mit Spielsachen nach. „Spiel eine Geschichte, die du gehört hast, mit deinen Spielsachen nach.“
- Regal-Material: Karte mit Vorhang.
- Sachgrund der Heimatwelt: erzählte Geschichten über Orte und Tiere · Kandidaten: jahreszeiten-natur,
  wald-und-teich, frueher-heute
- Stimmung: anpassbar. ruhig: Alltagsgeschichten (Spielplatz, Küche) · sanft: kleine Komplikation, sofort gelöst ·
  abenteuer: Geschichten über mehrere Runden mit mildem Grusel und komischer Auflösung; jede endet hell.

### Z05 Noch mal, bitte
- Name fürs Kind: „Noch mal, bitte“ · Symbol: eine Hand hinter dem Ohr
- Handlung: Das Kind hört eine Erklärung oder Durchsage, in der ein Wort fremd oder vom Lärm verdeckt ist, und
  entscheidet: losgehen oder nachfragen; beim Nachfragen wählt es die passende Bitte. · Wirkung: Nach der
  Nachfrage erklärt der Gast das Wort oder sagt es lauter, und das Kind findet den richtigen Treffpunkt.
- Material und Stufen: kopf. Kl. 1: Lärm oder Nuscheln, höflich nachfragen. Kl. 2: ein fremdes Wort bemerken
  („Was ist Schilf?“). Kl. 3: sagen, warum man nichts versteht (zu laut, zu schnell, fremdes Wort).
- Fehlerkontrolle: Geht das Kind ohne Nachfrage los, kommt es an einen Ort, der nicht passt (der Bahnsteig ist
  leer); der Erzähler sagt sachlich, was fehlte: „Das Wort Gleis war nicht zu hören.“ Wer nachfragt, bekommt
  die Auskunft.
- Hauptthemen: hoeflich-nachfragen (Kl. 1); unbekanntes-wort-erfragen (Kl. 2); warum-versteh-ich-nichts (Kl. 3)
- Weitere Zugänge: unbekanntes-wort-klaeren (Haupt L16); trotz-laerm-verstehen (Haupt Z04)
- Warum perfekt: Das Lernziel ist das Bemerken, dass man nicht verstanden hat. Das zeigt sich nur, wenn Raten
  eine sichtbare Folge hat und Fragen hilft.
- Bewusst nicht drin: unbekanntes-wort-klaeren → L16 (Lesen).
- Gesten: Tippen (losgehen, Bitte wählen).
- Lernzeichen: Wortbilder; Durchsagen als Hörtext.
- Stimme: mittel (Durchsagen klar und mit Lärm, Erklärungen).
- Fehlerbilder: keins im Bestand.
- Figuren: Ein Kind der Runde zeigt vor, wie es die Hand ans Ohr legt und fragt (fragen); ein Gast (Busfahrer,
  Schaffnerin) erklärt.
- Mach mit: Kofi legt die Hand ans Ohr, und der Gast wiederholt. „Wenn du etwas nicht verstehst, darfst du fragen: Noch mal, bitte.“
- Regal-Material: Karte mit Hand am Ohr.
- Sachgrund der Heimatwelt: Durchsagen und Erklärungen an lauten Orten · Kandidaten: unterwegs, berufe
- Stimmung: ruhig fest

### Z06 Gesprächszug
- Name fürs Kind: „Was sagst du?“ · Symbol: zwei Gesichter einander zugewandt
- Handlung: Eine Szene mit der Runde läuft (Kofi zeigt sein Knie, Lena hat Geburtstag, beim Bäcker, der Turm
  ist umgefallen); das Kind sieht, wie es dem anderen geht, und wählt, was **es** jetzt sagt. · Wirkung: Das
  Gespräch geht weiter: Die Bäckerin reicht die Brezel, Kofi zeigt, wo es wehtut, beide bauen den Turm wieder
  auf.
- Material und Stufen: kopf. Drei gesprochene Sätze zur Wahl; der Erzähler sagt: „Du sagst: …“. Kl. 1 Gruß,
  Bitte, Dank, Entschuldigung; Gefühl der anderen Person an Gesicht, Körper und Klang (Seufzen, Lachen)
  erkennen, um die Antwort zu wählen. Kl. 2 auf das Gesagte eingehen, Ich-Botschaft statt Vorwurf, freundlich
  und genau zurückmelden. Kl. 3 und 4 trösten, gratulieren, anknüpfen, du oder Sie.
- Fehlerkontrolle: Die Szene reagiert. Passt die Antwort nicht, schaut der andere fragend und das Gespräch
  stockt; der Erzähler benennt sachlich die Lage („Kofi hat sich wehgetan. Er braucht jetzt jemanden, der
  fragt.“). Gefühle selbst werden nie als richtig oder falsch bewertet (K13); geprüft wird nur, ob die
  Antwort zur Lage passt.
- Hauptthemen: gefuehl-in-der-stimme, hallo-bitte-danke, sich-entschuldigen, gefuehl-der-figur (Kl. 1); passend-antworten, ich-botschaft, rueckmeldung-geben (Kl. 2); troesten-und-gratulieren, daran-knuepf-ich-an (Kl. 3); mit-wem-rede-ich (Kl. 4)
- Weitere Zugänge: hoeflich-nachfragen (Haupt Z05); jury-ohr (Haupt Z09)
- Warum perfekt: Gesprächsformeln haben ihren Sinn nur im Gespräch; ob sie passen, zeigt der nächste Zug des
  anderen. So kommt auch Gefühle-Erkennen ohne Gefühlsabfrage aus.
- Bewusst nicht drin: ausreden-lassen, warten-bis-dran → Z07 (beobachten, nicht antworten);
  hoeflich-nachfragen → Z05.
- Gesten: Tippen.
- Lernzeichen: keine; Szenen im Figurenstil.
- Stimme: viel (Szenen, je drei Antworten, Folgesätze). **gefuehl-in-der-stimme** braucht Gefühlsklang; mit
  Florian nur, wenn Seufzen und Lachen als Geräusch der Figur reichen (Annahme), sonst wartet das Thema.
- Fehlerbilder: keins im Bestand.
- Figuren: Die Runde spielt die Szenen (K12: Konflikt kurz, Lösung ausführlich). Wer sich wehtut oder Geburtstag
  hat, wechselt; Timo im Rollstuhl ist nie der, dem geholfen werden muss, weil er im Rollstuhl sitzt.
- Mach mit: Ela grüßt die Nachbarin im Treppenhaus. „Grüß heute jemanden, dem du begegnest, und schau, was passiert.“
- Regal-Material: Karte mit zwei Gesichtern.
- Sachgrund der Heimatwelt: Alltag miteinander · Kandidaten: hoeflich-reden, hilfe-und-danke,
  streit-versoehnen, gefuehle-erkennen
- Stimmung: ruhig fest
- Fachübergreifend: **Sachthemen** „Wie wir miteinander umgehen“ (dieselben Szenen).

### Z07 Stuhlkreis
- Name fürs Kind: „Stuhlkreis“ · Symbol: vier Stühle im Kreis
- Handlung: Das Kind beobachtet ein kurzes Gespräch der Runde und tippt auf den Moment, in dem eine
  Gesprächsregel nicht eingehalten wird (dazwischenreden, durcheinander, zu leise, auslachen). · Wirkung: Die
  Szene läuft noch einmal, diesmal mit der Regel, und alle verstehen sich; in Kl. 4 vergibt das Kind Rollen
  (wer leitet, wer achtet auf die Zeit) und das Gespräch läuft geordnet.
- Material und Stufen: kopf. Kl. 1: zwei Szenen, in welcher wird gewartet? Kl. 2: welche Regel. Kl. 4:
  Gesprächsrollen, Videoanruf (Ton aus, wenn man nicht dran ist).
- Fehlerkontrolle: Tippt das Kind zu früh oder zu spät, spielt die Szene den angetippten Moment noch einmal:
  Da redet nur eine. Die Stelle, an der zwei gleichzeitig murmeln, ist an zwei sich bewegenden Mündern und
  übereinanderliegenden Murmelgeräuschen zu sehen und zu hören.
- Hauptthemen: ausreden-lassen, warten-bis-dran (Kl. 1); gespraechsregel-erkennen (Kl. 2); gespraechsrollen, videoanruf-regeln (Kl. 4)
- Weitere Zugänge: keine
- Warum perfekt: Regeln zu erkennen braucht Abstand; zuschauen ist die passende Handlung. Weil Figuren nicht
  sprechen, trägt das Bild das Gespräch (Mund, Hand heben, Murmeln).
- Bewusst nicht drin: passend-antworten → Z06.
- Gesten: Tippen.
- Lernzeichen: keine; **Annahme:** Murmelgeräusch ohne Wörter ist als „Geräusch“ nach stimme.md erlaubt.
- Stimme: wenig Erzähler, Murmelklänge.
- Fehlerbilder: keins im Bestand.
- Figuren: Die Runde ist der Stuhlkreis. Wer dazwischenredet, wechselt; der Konflikt ist kurz, die
  Wiederholung mit Regel ausführlich (K12). Niemand wird ausgelacht gezeigt, nur dass jemand lacht und dann
  aufhört.
- Mach mit: Timo hebt beim Abendessen die Hand und wartet. „Probiert beim Essen aus: Eine redet, die anderen hören zu.“
- Regal-Material: Karte mit Stühlen.
- Sachgrund der Heimatwelt: gemeinsam reden und abstimmen · Kandidaten: regeln, mehrheit, hoeflich-reden
- Stimmung: ruhig fest
- Fachübergreifend: Sachthemen (regeln, mehrheit).

### Z08 Weil-Brücke
- Name fürs Kind: „Ich glaube“ · Symbol: ein Glas über einer Kerze
- Handlung: Das Kind baut einen Satz „Ich glaube, dass …, weil …“ (oder „Ich finde …, weil …“) aus Satzteilen
  und tippt für das „weil“ den Grund an, der zur Sache gehört. · Wirkung: Bei einer Vermutung läuft der Versuch,
  und alle sehen, was passiert; bei einer Meinung über einen Text zeigt die angetippte Textstelle den Grund;
  bei einer Bitte willigt der Gast ein, wenn der Grund seine Sorge aufgreift.
- Material und Stufen: kopf. Kl. 2 Vermutungen vor einem Versuch (L2: erst festlegen, dann sehen). Kl. 4 Meinung
  mit Beleg im Text, Bitte mit Grund.
- Fehlerkontrolle: Bei Vermutungen urteilt der Versuch über die Vermutung, nicht über das Kind („Die Kerze geht
  aus. Unter dem Glas ist die Luft verbraucht.“ Fakt nach K4 prüfen). Bei Meinungen gibt es keine falsche
  Meinung; nur der Grund muss im Text stehen: Eine Stelle ohne Bezug leuchtet nicht auf.
- Hauptthemen: vermutung-aeussern (Kl. 2); ich-finde-weil, meinung-zum-text-begruenden, bitte-ueberzeugend (Kl. 4)
- Weitere Zugänge: wie-geht-es-weiter-lesen (Haupt L15); leseerfahrung-austauschen (Haupt Z11)
- Warum perfekt: Begründen braucht eine Sache, an der der Grund hängt. Das Experiment und die Textstelle sind
  diese Sache, ohne dass eine Meinung bewertet wird.
- Bewusst nicht drin: Schlüsse aus Hinweisen → L15.
- Gesten: Ziehen von Satzteilen (Tipp-Alternative), Tippen.
- Lernzeichen: Satzstreifen ohne Wortartsymbole.
- Stimme: mittel bis viel (Satzteile als feste Bausteine, Versuchsbeschreibungen).
- Fehlerbilder: keins im Bestand.
- Figuren: Ein Kind der Runde zeigt eine Vermutung vor, die nicht eintrifft, und staunt (F6: Irrtum gehört dazu);
  ein anderes zeigt auf das Sachbild des Versuchs.
- Mach mit: Lena und ihr großer Bruder stellen ein Glas über eine Kerze. „Frag jemanden, ob ihr den Versuch zusammen macht. Sag vorher: Ich glaube, dass …“ (Kerze nur mit Erwachsenen)
- Regal-Material: Karte mit Glas und Kerze.
- Sachgrund der Heimatwelt: kleine Versuche mit Luft, Wasser und Magneten · Kandidaten: was-luft-kann,
  eis-wasser-dampf, was-rollt
- Stimmung: ruhig fest
- Fachübergreifend: Sachthemen (Versuche); Mathe, falls dort „erst schätzen, dann sehen“ ein Spiel trägt.

### Z09 Tonstudio
- Name fürs Kind: „Tonstudio“ · Symbol: ein Mikrofon
- Handlung: Das Kind nimmt sich auf (Reim nachsprechen, Gedicht aufsagen, Figurenstimme, Ansage) und hört die
  Aufnahme neben einem Vorbild an; dazu prüft es mit einer Kontrollkarte: laut genug, deutlich, Tempo, Pausen.
  Kl. 3 und 4: ein Hörspiel mit Geräuschen vertonen; zwei Vorbild-Aufnahmen nach Merkmalen vergleichen
  (Jury-Ohr). · Wirkung: Die Aufnahme wird eine Sprachnachricht für jemanden aus der Runde oder Teil eines
  Hörspiels, das am Ende abläuft.
- Material und Stufen: material: Vorbild in Zeilen mit Bildern (Gedicht) · vorstellung: Bilder blassen aus ·
  kopf: ohne Bilder, auswendig. Jury-Ohr und Tempo: zwei Aufnahmen des Erzählers (schnell ohne Pause gegen
  ruhig), das Kind ordnet Merkmale zu.
- Fehlerkontrolle: Beim eigenen Sprechen urteilt das Spiel nicht; die Aufnahme neben dem Vorbild ist die
  Kontrolle (Montessori-Kontrollkarte). „Gekonnt“ zählt nur aus dem, was die App sieht: dem Vergleich von
  Vorbild-Aufnahmen nach Merkmalen (Jury-Ohr, Tempo, Betonung) und dem Vertonen. Beim Jury-Ohr zeigt eine
  Lautstärke- und Pausenlinie unter jeder Aufnahme, was zu hören war. Beim Vertonen läuft das Hörspiel mit den
  gewählten Geräuschen; ein Türquietschen beim Wort „Regen“ fällt hörbar auf.
- Hauptthemen: eigene-aufnahme-pruefen, reim-nachsprechen (Kl. 1); gedicht-vortragen, stimme-verstellen (Kl. 2); tempo-und-lautstaerke-sprechen, hoerspiel-werkstatt, ich-bin-nicht-der-wolf (Kl. 3); jury-ohr (Kl. 4)
- Weitere Zugänge: geraeusche-erkennen (Haupt Z01); betonen-und-pausen (Haupt L18); rueckmeldung-geben (Haupt Z06); szenische-lesung (Haupt L18)
- Warum perfekt: Sprechen kann der Bildschirm offline nicht verlässlich prüfen; aufnehmen und neben dem
  Vorbild anhören ist das Ehrlichste, was er kann, und entspricht der eigenen Kontrolle mit Material.
- Bewusst nicht drin: freies Erzählen → Z10; Vorlesen von Text → L18.
- Gesten: Tippen. **Neu:** Aufnahmeknopf (Start/Stopp) und Abspielen der eigenen Aufnahme, als Baustein
  (`<ls-aufnahme>`?) im Rahmen. Spracheingabe nur zusätzlich, wenn sie später kommt („wurde das Erwartete
  gesagt“), nie als Bedingung.
- Lernzeichen: Lautstärke- und Pausenlinie (**neu**), Kontrollkarte mit Bildfragen.
- Stimme: mittel (Vorbilder). **Stimme verstellen:** Ein Vorbild mit Riesen- und Mäusestimme kann Florian nicht
  liefern (HD ignoriert die Tonhöhe, Figuren sprechen nicht); das Kind bekommt nur die Beschreibung („tief und
  langsam“) und Bilder.
- Fehlerbilder: keins im Bestand.
- Figuren: Ein Kind der Runde zeigt die erste Aufnahme vor und hört, dass sie zu leise war (Bewältigung,
  Geräusch ohne Wort); die anderen hören als Publikum zu. Bei „Ich bin nicht der Wolf“ setzt ein Kind eine
  Maske auf und nimmt sie wieder ab (Rolle und Ich getrennt), ohne bösen Wolf.
- Mach mit: Kofi nimmt eine Sprachnachricht für Opa auf. „Frag jemanden, ob ihr zusammen eine Sprachnachricht aufnehmt.“
- Regal-Material: Karte mit Mikrofon.
- Sachgrund der Heimatwelt: Sprachnachrichten und Hörspiele machen · Kandidaten: medien-alltag, frueher-heute
  (Radio früher)
- Stimmung: ruhig fest

### Z10 Erzählkino
- Name fürs Kind: „Kino“ · Symbol: eine Filmrolle
- Handlung: Das Kind legt eine Bildfolge (oder Stichwortkarten) fest, setzt Reihenfolgewörter davor (zuerst,
  danach, zum Schluss) und erzählt dazu, Bild für Bild. · Wirkung: Die Bilder laufen als kleiner Film, das
  Erzählte ist der Ton; der Film geht an Oma oder einen Gast.
- Material und Stufen: material: Bilder und Wortkarten der Reihenfolgewörter · vorstellung: nur Bilder,
  Reihenfolgewörter gesprochen · kopf: Kl. 3 und 4 Stichwortzettel aus Schlüsselwörtern wählen, Anfang, Mitte,
  Schluss, Kurzreferat; text-in-eigenen-worten: nach einem Text erzählen.
- Fehlerkontrolle: Am Bildschirm prüfbar ist die Ordnung: „zuerst“ passt nur vor das erste Bild, „zum Schluss“
  nur vor das letzte, die Karte rutscht sonst an ihren Platz zurück. Beim Stichwortzettel fehlt im Film ein Bild,
  wenn ein nötiges Stichwort fehlt. „Gekonnt“ entsteht nur aus Ordnen und Stichworten; das Erzählen selbst
  ist Angebot (Aufnahme neben einer Vorbild-Erzählung) und Mach mit.
- Hauptthemen: tag-erzaehlen-mit-bildern (Kl. 1); erzaehlen-mit-reihenfolgewoertern, nacherzaehlen-mit-bildern (Kl. 2); text-in-eigenen-worten, anfang-mitte-schluss-vortragen, mein-stichwortzettel (Kl. 3); mein-kurzreferat (Kl. 4)
- Weitere Zugänge: lesen-reihenfolge (Haupt Z02); hoergeschichte-reihenfolge (Haupt Z02); kurz-gesagt (Haupt L14)
- Warum perfekt: Erzählen braucht eine Folge und Wörter, die sie tragen. Beides lässt sich am Bildschirm legen;
  das Sprechen bekommt ein echtes Publikum.
- Bewusst nicht drin: Ordnen ohne Erzählen → Z02.
- Gesten: Ziehen von Karten (Tipp-Alternative), Tippen. **Neu:** Aufnahmeknopf (wie Z09), wahlweise.
- Lernzeichen: Bildkarten, Wortkarten.
- Stimme: mittel (Vorbild-Erzählungen, Reihenfolgewörter).
- Fehlerbilder: keins im Bestand.
- Figuren: Ein Kind der Runde erzählt vor, ohne Worte: Der Erzähler erzählt, was es zeigt, die Figur deutet auf
  die Bilder (Erzähler-Regel). Ein anderes ist Publikum.
- Mach mit: Ela erzählt zu Hause mit drei Bildern von ihrem Tag (der Erzähler sagt, was sie zeigt). „Erzähl jemandem von deinem Tag: zuerst, danach, zum Schluss.“
- Regal-Material: Karte mit Filmstreifen.
- Sachgrund der Heimatwelt: vom eigenen Tag und von Abläufen erzählen · Kandidaten: mein-tag, lebenskette,
  wer-macht-mein-brot
- Stimmung: ruhig fest
- Fachübergreifend: **Schreiben** (Texte planen, Reihenfolgewörter beim Schreiben).

### Z11 Reporterheft
- Name fürs Kind: „Reporter“ · Symbol: ein kleines Heft mit Stift
- Handlung: Das Kind füllt am Bildschirm eine Karte für sein Heft: Reporterfragen an einen Gast wählen, eine
  Buchkarte (Titel, Lieblingsstelle als Bild, wem es das Buch zeigen würde) oder nach einer Runde ein Gesicht
  und einen Satz „So hab ich es gemacht“ wählen. · Wirkung: Die Karte steht im eigenen Heft und kann wieder
  angeschaut werden (ohne Bewertung); beim Reporter füllt die Antwort des Gastes den Artikel.
- Material und Stufen: kopf. Kl. 1: nach einer Runde ein Gesicht für leicht, mittel oder schwer (Rahmen,
  freiwillig). Kl. 2: über ein Buch reden. Kl. 3: Reporterfragen wählen, die etwas herausfinden (W-Fragen statt
  Ja/Nein: der Gast erzählt dann mehr, eine Ja/Nein-Frage bekommt nur „Ja“), so habe ich es gelernt. Kl. 4:
  eigenes Ziel, was beim Zuhören hilft.
- Fehlerkontrolle: Keine, wo es um eigene Einschätzung geht (K13). Nur bei Reporterfragen zeigt die Antwort des
  Gastes, ob die Frage etwas herausgefunden hat.
- Hauptthemen: lernen-einschaetzen (Kl. 1); leseerfahrung-austauschen (Kl. 2); so-hab-ichs-gelernt, reporter-fragen (Kl. 3); mein-ziel-sprechen, was-half-beim-zuhoeren (Kl. 4)
- Weitere Zugänge: ding-beschreiben (Haupt Z03); meinung-zum-text-begruenden (Haupt Z08)
- Warum perfekt: Über Lesen und Lernen sprechen ist ein Gespräch, kein Test. Der Bildschirm kann es vorbereiten
  (Fragen wählen, Gedanken ordnen) und einladen, mehr nicht. „Gekonnt“ entsteht nur bei reporter-fragen (die
  Antwort des Gastes zeigt es); die übrigen Themen zählen nicht als gekonnt **(Annahme)**.
- Bewusst nicht drin: Gesprächsformeln → Z06.
- Gesten: Tippen.
- Lernzeichen: Gesichter für leicht, mittel, nachdenklich (**neu**, neutral, kein Lachen als Belohnung).
- Stimme: wenig.
- Fehlerbilder: keins im Bestand.
- Figuren: Ein Kind der Runde interviewt einen Gast (die Bäckerin) und zeigt so vor, wie Fragen gehen.
- Mach mit: Timo fragt seine Mama wie ein Reporter. „Frag jemanden wie ein Reporter: Was machst du morgens als Erstes?“
- Regal-Material: Karte mit Heft. Für lernen-einschaetzen eher **kein** Regal-Material („gekonnt“ passt
  zu Selbsteinschätzung nicht; Annahme: Thema zählt nicht als gekonnt).
- Sachgrund der Heimatwelt: Leute fragen, wie sie leben und arbeiten · Kandidaten: berufe, medien-alltag,
  kinderrechte
- Stimmung: ruhig fest
- Hinweis: Das Gesicht nach einer Runde (lernen-einschaetzen) gehört eher in den Rahmen (Rundenende) als in ein
  eigenes Spiel.

---------------------------------------------------------------------------------------------------
## 3. Zuordnungstabelle

| id | Hauptspiel | weitere |
|---|---|---|
| reim-hoeren | L01 |  |
| reimwort-finden | L01 |  |
| silben-klatschen | L02 |  |
| silben-zusammenhoeren | L03 | L02 |
| woerter-im-satz-zaehlen | L05 |  |
| anlaut-selbstlaut | L04 | L06 |
| anlaut-dauerlaut | L04 | L06 |
| anlaut-stopplaut | L04 | L06 |
| endlaut-hoeren | L05 | L04 |
| laut-in-der-mitte | L05 |  |
| laute-statt-namen | L03 | L06 |
| laute-verschmelzen-hoeren | L03 |  |
| laute-zaehlen | L05 |  |
| laut-tauschen | L05 | L06 |
| laut-m | L06 | L07 |
| laut-a | L06 | L07 |
| laut-i | L06 | L07 |
| laut-o | L06 | L07 |
| erste-silben-lesen | L07 |  |
| laut-l | L06 | L07 |
| laut-s | L06 | L07 |
| laut-r | L06 | L07 |
| laut-u | L06 | L07 |
| laut-e | L06 | L07 |
| laut-n | L06 | L07 |
| laut-f | L06 | L07 |
| lesen-offene-silben | L07 |  |
| laut-t | L06 | L07 |
| laut-w | L06 | L07 |
| laut-h-anfang | L06 | L07 |
| lesen-endungen-en-er | L07 |  |
| laut-d | L06 | L07 |
| laut-k | L06 | L07 |
| laut-p | L06 | L07 |
| laut-b | L06 | L07 |
| laut-g | L06 | L07 |
| b-d-p-unterscheiden | L08 | L06 |
| laut-ei | L06 | L07 |
| laut-au | L06 | L07 |
| laut-sch | L06 | L07 |
| laut-ch-ich | L06 | L07 |
| laut-ch-ach | L06 | L07 |
| laut-z | L06 | L07 |
| laut-ae | L06 | L07 |
| laut-oe | L06 | L07 |
| laut-ue | L06 | L07 |
| laut-eu | L06 | L07 |
| laut-aeu | L06 | L07 |
| laut-ie | L06 | L07 |
| laut-st-anfang | L06 | L07 |
| laut-sp-anfang | L06 | L07 |
| laut-tz | L06 | L07 |
| laut-ck | L06 | L07 |
| laut-ng | L06 | L07 |
| laut-nk | L06 | L07 |
| laut-pf | L06 | L07 |
| laut-j | L06 | L07 |
| laut-v | L06 | L07 |
| laut-eszett | L06 | L07 |
| laut-qu | L06 | L07 |
| laut-x | L06 | L07 |
| laut-y | L06 | L07 |
| laut-c | L06 | L07 |
| laut-ai | L06 | L07 |
| laut-ph | L06 | L07 |
| buchstabenpaare-gross-klein | L06 | L08 |
| lesen-zwei-mitlaute-anfang | L07 |  |
| lesen-kurzer-selbstlaut | L07 |  |
| lesen-lang-oder-kurz | L08 | L07 |
| lesen-mitlauthaeufung | L07 |  |
| lesen-lange-woerter | L07 | L02, L10 |
| blitzwoerter-1 | L09 | L18 |
| lesen-wort-zum-bild | L08 |  |
| quatschwoerter-lesen | L07 |  |
| lesen-satz-zum-bild | Z03 | L11 |
| lesen-sinn-pruefen | L11 |  |
| lies-und-tu | Z03 |  |
| punkt-heisst-pause | L18 |  |
| frage-zum-text | L12 | Z04 |
| stille-hoeren | Z01 |  |
| geraeusche-erkennen | Z01 | Z09 |
| laut-oder-leise | Z01 |  |
| geraeusch-richtung | Z01 |  |
| geraeuschkette-kurz | Z02 |  |
| geraeuschkette-lang | Z02 |  |
| auftrag-ausfuehren | Z03 |  |
| doppelauftrag | Z03 |  |
| auftrag-mit-lagewort | Z03 |  |
| hoergeschichte-hauptfigur | Z04 |  |
| hoergeschichte-ort | Z04 |  |
| hoerauftrag-gezielt | Z04 |  |
| gefuehl-in-der-stimme | Z06 |  |
| hoeflich-nachfragen | Z05 | Z06 |
| ausreden-lassen | Z07 |  |
| warten-bis-dran | Z07 |  |
| hallo-bitte-danke | Z06 |  |
| sich-entschuldigen | Z06 |  |
| tag-erzaehlen-mit-bildern | Z10 | Z02 |
| eigene-aufnahme-pruefen | Z09 |  |
| reim-nachsprechen | Z09 | L01 |
| gefuehl-der-figur | Z06 | L15 |
| lernen-einschaetzen | Z11 |  |
| wortbausteine-lesen | L10 |  |
| blitzwoerter-2 | L09 | L18 |
| genau-hinsehen-lesen | L08 | L07 |
| ueber-die-zeile-lesen | L18 |  |
| schnell-lesen-wiederholt | L18 |  |
| falsches-wort-finden | L11 |  |
| wer-wo-wann-lesen | L12 |  |
| lesen-reihenfolge | Z02 | Z10 |
| ueberschrift-verraet | L14 |  |
| unbekanntes-wort-klaeren | L16 | Z05 |
| wie-geht-es-weiter-lesen | L15 | Z08 |
| lesen-tabelle | L13 |  |
| textsorte-erkennen | L17 |  |
| reim-im-gedicht | L01 |  |
| zeile-und-absatz-finden | L12 | L13 |
| fettdruck-nutzen | L12 |  |
| leseerfahrung-austauschen | Z11 | Z08 |
| figur-beschreiben-lesen | L15 |  |
| fragen-betont-lesen | L18 |  |
| wortstamm-lesen | L10 |  |
| dreierauftrag | Z03 |  |
| hoergeschichte-reihenfolge | Z02 | Z10 |
| hoerdetail-nebenbei | Z04 |  |
| hoeren-und-schliessen | L15 |  |
| sprecher-unterscheiden | Z04 |  |
| gehoertes-pruefen | Z04 | L11 |
| unbekanntes-wort-erfragen | Z05 | L16 |
| passend-antworten | Z06 |  |
| gespraechsregel-erkennen | Z07 |  |
| ich-botschaft | Z06 |  |
| erzaehlen-mit-reihenfolgewoertern | Z10 |  |
| nacherzaehlen-mit-bildern | Z10 | Z02 |
| ding-beschreiben | Z03 | Z11 |
| betonen-und-pausen | L18 | Z09 |
| gedicht-vortragen | Z09 | L18 |
| rueckmeldung-geben | Z06 | Z09 |
| stimme-verstellen | Z09 | L18 |
| vermutung-aeussern | Z08 | L15 |
| lange-woerter-in-bausteinen-lesen | L10 |  |
| mit-betonung-vorlesen | L18 |  |
| wortbedeutung-aus-dem-satz | L16 |  |
| wichtiges-im-text-markieren | L12 |  |
| zwischen-den-zeilen-lesen | L15 |  |
| maerchen-erkennen | L17 |  |
| fabel-erkennen | L17 |  |
| sachtext-mit-bild-lesen | L12 |  |
| inhaltsverzeichnis-nutzen | L13 |  |
| redewendungen-verstehen | L16 |  |
| text-in-eigenen-worten | Z10 | L14 |
| wer-ist-mit-er-gemeint | L12 |  |
| meine-hoerfrage | Z04 |  |
| schluesselwort-fangen | Z04 |  |
| puzzle-im-ohr | L15 |  |
| trotz-laerm-verstehen | Z04 | Z05 |
| warum-tut-sie-das-hoeren | L15 |  |
| worum-gehts-hoeren | L14 | Z04 |
| warum-versteh-ich-nichts | Z05 |  |
| anfang-mitte-schluss-vortragen | Z10 |  |
| mein-stichwortzettel | Z10 | L12 |
| tempo-und-lautstaerke-sprechen | Z09 |  |
| troesten-und-gratulieren | Z06 |  |
| daran-knuepf-ich-an | Z06 |  |
| reporter-fragen | Z11 |  |
| hoerspiel-werkstatt | Z09 |  |
| ich-bin-nicht-der-wolf | Z09 |  |
| so-hab-ichs-gelernt | Z11 |  |
| informationen-verknuepfen | L12 |  |
| beste-ueberschrift-waehlen | L14 |  |
| warum-handelt-die-figur-so | L15 |  |
| sprachbilder-verstehen | L16 |  |
| paarreim-kreuzreim | L01 |  |
| sage-erkennen | L17 |  |
| auf-webseiten-suchen | L13 |  |
| widerspruch-im-text | L11 |  |
| gedicht-vortragen-lesen | L18 |  |
| viele-stimmen-verstehen | Z04 |  |
| stimmt-die-aussage-und-warum | Z04 |  |
| zwei-geschichten-vergleichen | Z04 |  |
| ratekrimi | L15 |  |
| kurz-gesagt | L14 | Z10 |
| ich-finde-weil | Z08 |  |
| meinung-zum-text-begruenden | Z08 | Z11 |
| bitte-ueberzeugend | Z08 |  |
| mit-wem-rede-ich | Z06 |  |
| mein-kurzreferat | Z10 |  |
| jury-ohr | Z09 | Z06 |
| gespraechsrollen | Z07 |  |
| videoanruf-regeln | Z07 |  |
| szenische-lesung | L18 | Z09 |
| mein-ziel-sprechen | Z11 |  |
| was-half-beim-zuhoeren | Z11 |  |

---------------------------------------------------------------------------------------------------
## 4. Offene Fragen an den Auftraggeber

1. **Zweite Stimme oder Gefühlsklang?** sprecher-unterscheiden, viele-stimmen-verstehen (Kl. 2 und 4) und
   gefuehl-in-der-stimme brauchen zwei Stimmen bzw. eine Stimme mit Gefühl; Figuren sprechen nicht, Florian HD
   ändert die Tonhöhe nicht. Optionen: (a) Themen zurückstellen, (b) eine zweite Erzählstimme für Hördialoge
   zwischen Gästen (Erzählerin, schon in grundsaetze.md §11 offen), (c) nur wortlose Geräusche (Seufzen,
   Lachen). **Empfehlung: (b)** für die zwei Hörthemen, (c) für den Gefühlsklang.
2. **Aufnahme der Kinderstimme?** Z09, Z10 und L18 werden mit Aufnahme deutlich besser (Vorbild daneben,
   Fortschritt über Tage). Die Aufnahme bliebe auf dem Gerät, Eltern könnten sie löschen; sie braucht einen
   neuen Baustein und Mikrofonzugriff auf Kiosk und Tablets. Optionen: (a) ja, lokal, (b) nein, nur Mach-mit-Einladung, (c) erst nach dem Spracheingabe-Versuch. **Empfehlung: (a).**
3. **Hören und Lesen in einem Spiel?** Z03 (Aufträge gehört oder gelesen), L15 (Schließen) und Z02 (Ordnen)
   mischen beide Fächer; die Kopfleiste müsste das Fach je Runde zeigen. Optionen: (a) so lassen, (b) je
   Fach ein Spiel mit derselben Maschine (drei Spiele mehr). **Empfehlung: (a).**
4. **Weniger Spiele gewünscht?** Am wenigsten kostet: Z05 in Z06 (Nachfragen ist auch ein Gesprächszug),
   L13 in L12 (Nachschlagen als Kl.-3/4-Stufe des Nachlesens), L09 in L08 (Blitzwörter als Etiketten ohne
   Bild). Das ergäbe 26. **Empfehlung:** nicht zusammenlegen; die drei Handlungen sind jeweils anders.
5. **Einzellaute vorab erzeugen:** L03 bis L06 brauchen saubere Einzellaute („mmm“, „t“) und Wörter in
   Lautstücken. Optionen: (a) mit Azure ausprobieren und abhören, (b) Einzellaute von einem Menschen aufnehmen
   (zweite Stimme, nur für Laute). **Empfehlung:** (a) zuerst, (b) als Rückfall.
