# Prüfung des Schnellwegs: alle Kriterien in einer Prüfung

Vorlage für den Skill `spiel-entwickeln`, Schnellweg (`docs/spielentwicklung.md` „Zwei Wege“). Empfänger: **ein neuer
Agent, der am Spiel nicht gebaut hat**, je Runde ein neuer, Modell `opus`. Er ersetzt Prüfung A, die drei B-Prüfer und
das Abschluss-Review. Der Skill füllt `{{…}}` und schickt alles unter der Linie (oder den Pfad der gefüllten Datei mit
„lies und führe aus“). `{{VORIGE_BEFUNDE}}` ist in Runde 1 leer, in Runde 2: „Befunde der vorigen Runde (prüfe je
Befund, ob er behoben ist; urteile trotzdem über alle Kriterien neu): …“. `{{BILDER}}` ist der Bilder-Ordner des
Durchspielens ohne `--stufe`; die Ordner je Stufe liegen daneben unter `<id>/bilder`.

---

Du prüfst ein fertig gebautes Lernspiel für Kinder der Klassen 1–4: den Entwurf, das Spiel auf allen Lernstufen und den
Diff des Branches. Du hast es nicht gebaut und sollst es nicht verbessern, sondern beurteilen. Arbeitsordner
`{{WORKTREE}}` (Branch `{{BRANCH}}`, Basis `{{BASIS}}`): nur lesen und ansehen, nichts ändern, nichts committen, keine
Unteragenten. Spiel: {{ID}} „{{NAME}}“, Spielordner `{{SPIELORDNER}}`, Seite `{{SEITE}}`, Entwurf `{{ENTWURF}}`,
Lernstufen {{STUFEN}}. Nicht lesen: die Prüfberichte `runde-*.md` in `{{PRUEFUNGEN}}` (die Bilder dort darfst du
ansehen) und Commit-Nachrichten – du urteilst unabhängig.

{{VORIGE_BEFUNDE}}

**Lies und sieh an:**
- den Entwurf; den Katalog-Eintrag `{{KATALOG_DATEI}}` „### {{ID}} …“ und seinen Eintrag in
  `docs/spielkatalog/welten.md` (Vorrang: `docs/spielkatalog.md` §8a) und den Eintrag der Heimatwelt in
  `spiele/lernplan.json` (`welten[]`, `beschreibung`: das Spiel bleibt in ihrem Rahmen oder der Bau hat sie angepasst). Der Eintrag ist ein Vorschlag: Eine begründete
  Abweichung ist kein Befund, eine unbegründete schon. **Ausnahme:** Was der Eintrag als Entscheidung von Christian
  kennzeichnet („Christian“, mit Datum), ist gesetzt; weicht der Entwurf davon ab, ist das ein Befund, nicht die
  Entscheidung.
- `docs/spielentwicklung.md` §1, „Zwei Wege“, §2, §4, §5 und „Spielobjekte“; `docs/grundsaetze.md`;
  `docs/grundsaetze-bilder.md` (besonders §1, §4–§6, §16); `docs/figuren.md` §3–§5; `docs/stimme.md`;
  `docs/bedienung.md` (ganz, besonders §3, §4, §7, §10); `docs/farbwelt.html`.
- den Code im Spielordner (`spiel.js`, ggf. `logik.js`, `texte.json`, `objekte/`), den Eintrag in `spiele/spiele.json`,
  den Kopf von `spiele/vorlage/spiel.js` und `spiele/rahmen/pruefen.js`; `git diff {{BASIS}}...HEAD --stat` und den
  Diff selbst.
- die Bilder in `{{BILDER}}` und in den Ordnern je Stufe daneben, mit den Berichten (`bericht.json`) des Durchspielens.

**Selbst ansehen und messen:** Öffne die Seite (Playwright mit `NODE_PATH=/private/tmp/claude-501/pw/node_modules`,
Server wie in `tests/browser/server.mjs`; WebKit-Klicks über `lsPruefen.fuehreAus`) mit `?pruefen&stufe=<id>` je Stufe,
in Chromium und WebKit bei 1920 × 1080 und 1280 × 800, einmal mit `reducedMotion: "reduce"`; miss Tippziele und
Abstände im DOM statt zu schätzen. Bilder der Spielobjekte:

```bash
NODE_PATH=/private/tmp/claude-501/pw/node_modules node tests/browser/objektbilder.mjs <Scratchpad>/objekte \
  {{SPIELORDNER}}/objekte/*.js <weitere spiele/objekte/<art>.js, die das Spiel nutzt>
```

Dazu der **Silhouettentest** der Karten: die Kartenbilder aller Spiele des Fachs mit `karte` in `spiele/spiele.json`
(Welt-Vignette, davor `<ls-objekt art="<figur>" zustand="<zustand>" still>`) als Raster, 64 px hoch, Graustufen
(CSS `filter: grayscale(1)`), Bild in den Scratchpad. Und das Regal (`spiele/regal.html`) bei einem Thema, für das das
Regal-Bild gilt.

**W-Karte beurteilst du am zusammengesetzten Kartenbild,** nicht an der heutigen Startseite: die Figur
(`<ls-objekt art="<figur>" zustand="<zustand>" still>` nach `karte` in `spiele/spiele.json`) groß vor der flachen
Welt-Vignette (Fläche in den Tönen der Welt-Palette, `docs/grundsaetze-bilder.md` §6.2), von dir selbst zusammengesetzt
und gerendert (Playwright, Bild in den Scratchpad), einmal in Kartengröße und einmal im Raster des Silhouettentests.
Die Karten der Startseite zeigen das Kartenbild noch nicht (Umsetzung auf der Startseite steht noch aus); wie die
Startseite heute aussieht, ist kein Befund für W-Karte.

**Kriterien.** Die Kürzel der Spalte „Quelle“ sind Tabellenzeilen der Grundsätze: L, N, K und §-Angaben ohne Datei
in `docs/grundsaetze.md` (K1/K2 = §10 Kosmik-Schicht), F, M, B, T in `docs/grundsaetze-bilder.md`, dazu
`docs/figuren.md`, `docs/stimme.md`, `docs/bedienung.md`.

**1. Der Entwurf** (Zeilen A1 … A12 und „Pflichtteile“: alle elf Teile aus `docs/spielentwicklung.md` §1 und
„Bausteine“ da; fehlt einer, kritischer Befund):

<!-- wörtlich aus docs/spielentwicklung.md §2; tests/skill-spiel-entwickeln.test.mjs prüft, dass es übereinstimmt -->
| Nr. | Kriterium | Quelle |
|---|---|---|
| A1 | Zweck in der Spielwelt klar; ohne den Lerninhalt wäre das Spiel nicht spielbar. | Prüffrage 2, N3 |
| A2 | Eine Schwierigkeit; alles andere leicht (kurze Wörter, Vorlesen). | §4 Isolation |
| A3 | Das Kind bringt die Antwort hervor (bauen, tippen, ziehen), wählt nicht aus wenigen Knöpfen. | L1, L2 |
| A4 | **Sachwelt passt:** der Sachgrund erzeugt die Aufgabe; eine Erwachsene würde die Verbindung in einem Satz verstehen. | K1, K2 |
| A4b | **Eine Welt, keine zweite Metapher:** Die Lernhandlung geschieht *in* der Sachwelt (sieben Dinge teilen sich auf zwei Tonnen auf). Kein zusätzliches Bild obendrauf, das mit der Sache nichts zu tun hat (Haus, Stockwerke, Licht beim Mülltrennen). Lernzeichen wie der Perlenstab dürfen daneben stehen. | K2, L8; Lehre aus dem Zerlegungshaus (Christian) |
| A5 | **Eine Figur der Runde hat eine Aufgabe** in der Runde und ist im Bild. | F6, F7, `figuren.md` |
| A6 | Rückmeldung: Mechanik zeigt passt/passt nicht; Erzähler beschreibt; keine Wörter aus 3.2; Fehler-Folge nicht reizvoller. | 3.1, 3.2, N7 |
| A6b | **Das Gelernte bleibt sichtbar:** Nach der Wirkung steht das Ergebnis als Lernzeichen mit dem Zeichen da (z. B. Perlenstäbe 2 und 4 unter der 6 und „6 = 2 + 4“) und bleibt in der Runde stehen. | M7, L1; Christian |
| A7 | Hilfe-Leiter mit Probe statt Bedeutungsregel; Lösung mit Begründung. | L12, §5 |
| A8 | Fachbegriffe nach §5.1; keine Regeln mit Verfallsdatum. | §5 |
| A9 | Geschichte nach §9 (Spannung aus Neugier, keine Bedrohung, Stufe festgelegt). | §9 |
| A10 | Bildschirm folgt `bedienung.md` §3 (feste Plätze, Erzählblase ohne Zipfel). | `bedienung.md` |
| A11 | Erzähler spricht, Figuren handeln; Sätze wörtlich und als Daten erfassbar. | `stimme.md` |
| A12 (Soll) | Vielfalt beiläufig, Bilder nach 6.1–6.3. | §6 |
<!-- ende wörtlich -->

**2. Das Spiel, Didaktik** (Zeilen D-A1 … D-A8 wie in `pruefung-b-didaktik.md`: A1–A8 einschließlich A4b und A6b,
diesmal am gebauten Spiel, Abweichung vom Entwurf ist ein Befund; D-Meldung, D-Gekonnt, D-Fehlversuche, D-Stufen
für jede Lernstufe, D-Beschreibung (`beschreibung` in `spiele.json`: vorhanden, am Spiel sachlich richtig, neutral,
für Eltern lesbar, 2–3 Sätze), D-Sätze):

<!-- wörtlich aus docs/spielentwicklung.md §4 B-Didaktik; tests/skill-spiel-entwickeln.test.mjs prüft, dass es übereinstimmt -->
**B-Didaktik** (Code + Entwurf): A1–A8 am gebauten Prototyp nachgeprüft; dazu: die Lernsteuerung bekommt jede
Aufgabe mit `ok`, `hilfe`, `ms` gemeldet; mit Hilfe Gelöstes zählt nicht als gekonnt. Erklärt das Spiel in der
Test-Schnittstelle `fehlversuche: false` (kein Zug kann danebengehen), prüft B-Didaktik, dass das stimmt; der Prüfstand
überspringt dann die Hilfe-Leiter des ratenden Kindes (n/a im Bericht). Im Ausbau dazu D-Beschreibung (Christian, 2026-11-14): `beschreibung` im Eintrag in `spiele.json` ist vorhanden, stimmt sachlich mit dem gebauten Spiel überein, ist neutral (keine Wörter aus `grundsaetze.md` §3.2) und für Eltern lesbar (2–3 Sätze, keine Klassen- oder Lehrplanzahlen).
<!-- ende wörtlich -->

**3. Das Spiel, Welt** (Zeilen W-Figur, W-Sachwelt, W-Eine-Welt, W-Objekte, W-Wirkung, W-Bewegung, W-Freude, W-Regal, W-Karte,
W-Ruhe wie in `pruefung-b-welt.md`; das Spiel ist ausgebaut: keine Platzhalter mehr, W-Regal und W-Karte gelten).
Zu W-Eine-Welt gehört die **Einführung**: Sie erzählt in der Welt des Spiels; spielt das Spiel eine Einführung aus
`spiele/einfuehrungen/` mit einer anderen Welt oder hat es die Einführung abgeschaltet, ist das rot.

<!-- wörtlich aus docs/spielentwicklung.md §4 B-Welt; tests/skill-spiel-entwickeln.test.mjs prüft, dass es übereinstimmt -->
**B-Welt** (Screenshots + Entwurf): Figur sichtbar und tätig; Sachwelt im Bild erkennbar und passend zur Aufgabe;
eine Welt, keine zweite Metapher (A4b); Spielobjekte im Stil der Runde und sachlich richtig, als Wirkung animiert,
nicht als Zählmaterial (M1); W-Bewegung: Bewegung nur als Folge einer Kinderhandlung, ~1 s während der Handlung, bis ~3 s für die Folge einer gelösten Aufgabe, überspringbar, still beim Denken, mit reduzierter Bewegung ruhig und kurz; W-Freude (Christian, 2026-11-14): jede richtige Lösung hat eine sichtbare Folge, die sich aus der Aufgabe selbst erklärt (Figur oder Ding reagiert), als Teil des Spiels und nicht als Belohnung (keine Punkte, keine Sterne), verlässlich (B4), nach einer falschen Antwort nie reizvoller (B5), mit passenden wechselnden Varianten (gehen, traben, rutschen, hüpfen …; kleine Zufallsauswahl, nie ein seltener „Jackpot“); nichts Bedrohliches; Fantasie nur im Rahmen (`figuren.md` §5). Im Prototyp dürfen die
Spielobjekte noch einfache Platzhalter sein, aber ihre Rolle (Wirkung) muss stimmen; der Prototyp zeigt mindestens eine solche Folge (W-Freude). Im Ausbau das Kartenbild nach
`grundsaetze-bilder.md` §16 (W-Karte): eine Figur, groß, mittig bis Mitte rechts, kein Text und keine Lernzeichen, im
Silhouettentest (alle Karten des Fachs als Raster in 64 px Graustufen) von den anderen Karten des Fachs zu
unterscheiden, `(figur, welt, zustand)` im Fach eindeutig. Im Ausbau hat jede Stufe und jede Aufgabenart passende Folgen mit Varianten.
<!-- ende wörtlich -->

**4. Das Spiel, Bedienung** (Zeilen U-Plätze, U-Farbe, U-Größen, U-Still, U-Reduziert wie in
`pruefung-b-bedienung.md`, dazu je Punkt der Checkliste eine Zeile U-10.1 … U-10.10 in dieser Reihenfolge):

<!-- wörtlich aus docs/spielentwicklung.md §4 B-Bedienung; tests/skill-spiel-entwickeln.test.mjs prüft, dass es übereinstimmt -->
**B-Bedienung** (Screenshots): Checkliste `bedienung.md` §10, Farbwelt §6 (Schatten nur am Drückbaren, Sonne nur
als Ring, keine Farbe als einziges Signal), Größen nach §4, still beim Denken (§7 B3), reduzierte Bewegung.
<!-- ende wörtlich -->

<!-- wörtlich aus docs/bedienung.md §10; tests/skill-spiel-entwickeln.test.mjs prüft, dass es übereinstimmt -->
- [ ] Spielordner `spiele/<fach>/<katalog-nr>-<name>/` als Kopie von `spiele/vorlage/` (`index.html`, `spiel.js`);
      `datei` und `symbol` in `spiele.json` relativ zu `spiele/`; gemeinsame Objekte nach `spiele/objekte/`.
- [ ] `<ls-leiste>` mit `spiel`, `fach`, `titel` und `thema`; keine eigenen Haus-/Ton-Knöpfe; das
      Spielfeld beginnt unter der Kopfleiste.
- [ ] Gesprochene Texte über `<ls-blase>` oder `kern`-`sprich`, mit Noch-mal-hören.
- [ ] `<ls-hilfe>` mit Hilfe-Leiter (Probe, dann Lösung); `leuchte()` nach dem zweiten Versuch.
- [ ] Rundenende mit `<ls-pause>`; nichts läuft von selbst weiter.
- [ ] Eingabe nur über `<ls-tastatur>`; nur die nötigen Tasten.
- [ ] Jedes Ziehen auch per Tippen.
- [ ] Tippziele nach Abschnitt 4; Abstände mindestens 2 rem.
- [ ] Still beim Denken; `prefers-reduced-motion` geprüft.
- [ ] Im Browser in Chromium und WebKit bei 1920 × 1080 und 1280 × 800 angesehen.
<!-- ende wörtlich -->

**5. Der Weg und der Diff:**
- **S-Weg:** Der Diff bleibt im Schnellweg (Regel in `docs/spielentwicklung.md` „Zwei Wege“): nichts geändert in
  `spiele/rahmen/`, `spiele/kern/`, `spiele/lernsteuerung.js`, `spiele/objekte/objekt.js`, `spiele/aufgabenarten.js`,
  `spiele/lernplan.json` (`aufgaben`) und im RAHMEN von `spiele/vorlage/spiel.js`; keine neue Aufgabenart; kein neues Lernzeichen, kein nachgebautes Bedienteil im Spiel; kein Abschnitt
  „Freigabe nötig“ im Entwurf. Sonst rot (kritisch: das Spiel gehört in den vollen Weg).
- **S-Prüfstand:** Die Berichte des Durchspielens (ohne und mit `--stufe` je Lernstufe) sind grün, `npm test` grün
  (selbst laufen lassen, Ausgabe als Beleg).
- **S-Code:** Der Diff (`git diff {{BASIS}}...HEAD --stat`) berührt nur diese Pfade: den Spielordner
  `spiele/<fach>/<spiel>/`, den Eintrag des Spiels in `spiele/spiele.json` (nur dieser Eintrag), neue Arten als
  eigene Datei `spiele/objekte/<neue art>.js` (keine vorhandene Datei in `spiele/objekte/` geändert) und den Entwurf
  `docs/spiele/<fach>/<spiel>.md`. Jeder andere Pfad ist rot, auch `spiele/aufgabenarten.js`, `spiele/lernplan.json`,
  `spiele/einfuehrungen/`, `spiele/mit-echten-dingen/`, `package.json` und fremde Spiele. Dazu: keine
  Test-Schnittstelle außerhalb des Testbetriebs; Texte stehen in `texte.json`.

**Grün heißt:** alle Pflichtkriterien grün, kein kritischer Befund; „(Soll)“ darf rot sein, wenn der Grund im Entwurf
steht. Im Zweifel rot. Gibt es keine zweite Runde mehr, ist rot das Parken – urteile trotzdem nur nach den Kriterien.

Schreib deine Antwort außerdem unverändert in die Datei `{{BERICHT}}` (Arbeitsablage außerhalb des Arbeitsordners;
die einzige Datei, die du schreibst).

**So sieht deine Antwort aus** (nichts davor, nichts danach):

```
Ergebnis: GRÜN | ROT

| Nr. | grün/rot | Beleg (Zitat aus dem Entwurf mit Zeile, Datei:Zeile, Bilddatei, Befehl mit Ausgabe) | Befund, falls rot |
|---|---|---|---|
… eine Zeile je Kriterium, in dieser Reihenfolge:
A1, A2, A3, A4, A4b, A5, A6, A6b, A7, A8, A9, A10, A11, A12, Pflichtteile,
D-A1, D-A2, D-A3, D-A4, D-A4b, D-A5, D-A6, D-A6b, D-A7, D-A8, D-Meldung, D-Gekonnt, D-Fehlversuche, D-Stufen, D-Beschreibung, D-Sätze,
W-Figur, W-Sachwelt, W-Eine-Welt, W-Objekte, W-Wirkung, W-Bewegung, W-Freude, W-Regal, W-Karte, W-Ruhe,
U-10.1 … U-10.10, U-Plätze, U-Farbe, U-Größen, U-Still, U-Reduziert,
S-Weg, S-Prüfstand, S-Code

Kritische Befunde:
- <Befund> – <Beleg> – <was es lösen würde>   (oder „keine“)

Vorige Befunde: <je Befund behoben / nicht behoben mit Beleg>   (nur in Runde 2)
```
