# Prüfstand B: B-Welt

Vorlage für den Skill `spiel-entwickeln`. Empfänger: ein **neuer Agent, der am Spiel nicht gebaut hat**, je Runde ein
neuer; läuft parallel zu den anderen B-Prüfern. Der Skill füllt `{{…}}` und schickt alles unter der Linie.
`{{VORIGE_BEFUNDE}}` ist in Runde 1 leer, ab Runde 2: „Befunde der vorigen Runde (prüfe je Befund, ob er behoben ist;
urteile trotzdem über alle Kriterien neu): …“.
Der Skill gibt den Bilder-Ordner des Durchspielens (`--bilder`) mit; die Bilder der Spielobjekte macht der Prüfer
selbst (`tests/browser/objektbilder.mjs`).
Zum Stilvergleich: `spiele/runde/galerie.html` (die Runde) und `spiele/objekte/tonne.js`; Farben gegen
`spiele/rahmen/stil.js` (TOKENS) und `spiele/start/welten.js` (PALETTEN) prüfen – eigene Hexwerte oder Lernzeichen-Farben in der Sachwelt sind rot (W-Objekte).

---

Du prüfst ein Lernspiel für Kinder der Klassen 1–4 (Stadium: {{STADIUM}}, Prototyp oder Ausbau). Du hast es nicht
gebaut und sollst es nicht verbessern, sondern beurteilen. Arbeitsordner `{{WORKTREE}}`: nur lesen und ansehen, nichts ändern, nichts committen,
keine Unteragenten. Spiel: {{ID}} „{{NAME}}“, Seite `{{SEITE}}`, Entwurf `{{ENTWURF}}`. Nicht lesen:
die Prüfberichte `runde-*.md` in `{{PRUEFUNGEN}}` (die Bilder dort darfst du ansehen) und Commit-Nachrichten – du urteilst unabhängig.

{{VORIGE_BEFUNDE}}

**Lies und sieh an:** die Bilder in `{{BILDER}}` (alle Phasen: Einführung, Aufgabe, Hilfe, Folge, Pause, beide
Größen); den Entwurf; `docs/figuren.md` (ganz, besonders §3–§5), `docs/grundsaetze-bilder.md` §1, §6, §7, §8, §13, §16,
`docs/grundsaetze.md` §9, `docs/spielentwicklung.md` „Spielobjekte“. Du darfst die Seite selbst öffnen und weitere
Bilder machen (Playwright mit `NODE_PATH=/private/tmp/claude-501/pw/node_modules`; WebKit-Klicks über
`lsPruefen.fuehreAus`), auch mit `reducedMotion: "reduce"`.

**Bilder der Spielobjekte machst du selbst** (jede Art in jedem Zustand, jede Bewegung in der Mitte und am Ende, mit
reduzierter Bewegung, das Regal-Bild still mit Wert; `liste.json` nennt Dateien und Dauer der Bewegungen):

```bash
NODE_PATH=/private/tmp/claude-501/pw/node_modules node tests/browser/objektbilder.mjs <Scratchpad>/objekte \
  {{SPIELORDNER}}/objekte/*.js <weitere spiele/objekte/<art>.js, die das Spiel nutzt>
```

Im Ausbau außerdem das Regal ansehen: `spiele/regal.html` (lokaler Server wie in `tests/browser/durchspielen.mjs`,
z. B. `python3 -m http.server` im Arbeitsordner) bei einem Thema, für das das Regal-Bild aus `spiele/spiele.json`
gilt (bei Themen mit eigenem Lernzeichen steht das Lernzeichen vorn, das ist richtig).

Im Ausbau außerdem der **Silhouettentest**: die Kartenbilder aller Spiele des Fachs mit `karte` in
`spiele/spiele.json` (Welt-Vignette, davor `<ls-objekt art="<figur>" zustand="<zustand>" still>`) in ein Raster legen,
auf 64 px Höhe verkleinert und in Graustufen (Playwright, CSS `filter: grayscale(1)`), Bild in den Scratchpad.

**W-Karte beurteilst du am zusammengesetzten Kartenbild,** nicht an der heutigen Startseite: die Figur
(`<ls-objekt art="<figur>" zustand="<zustand>" still>` nach `karte` in `spiele/spiele.json`) groß vor der flachen
Welt-Vignette (Fläche in den Tönen der Welt-Palette, `docs/grundsaetze-bilder.md` §6.2), von dir selbst zusammengesetzt
und gerendert (Playwright, Bild in den Scratchpad), einmal in Kartengröße und einmal im Raster des Silhouettentests.
Die Karten der Startseite zeigen das Kartenbild noch nicht (Umsetzung auf der Startseite steht noch aus); wie die
Startseite heute aussieht, ist kein Befund für W-Karte.

**Auftrag** (wörtlich):

<!-- wörtlich aus docs/spielentwicklung.md §4; tests/skill-spiel-entwickeln.test.mjs prüft, dass es übereinstimmt -->
**B-Welt** (Screenshots + Entwurf): Figur sichtbar und tätig; Sachwelt im Bild erkennbar und passend zur Aufgabe;
eine Welt, keine zweite Metapher (A4b); Spielobjekte im Stil der Runde und sachlich richtig, als Wirkung animiert,
nicht als Zählmaterial (M1); W-Bewegung: Bewegung nur als Folge einer Kinderhandlung, ~1 s während der Handlung, bis ~3 s für die Folge einer gelösten Aufgabe, überspringbar, still beim Denken, mit reduzierter Bewegung ruhig und kurz; W-Freude (Christian, 2026-11-14): jede richtige Lösung hat eine sichtbare Folge, die sich aus der Aufgabe selbst erklärt (Figur oder Ding reagiert), als Teil des Spiels und nicht als Belohnung (keine Punkte, keine Sterne), verlässlich (B4), nach einer falschen Antwort nie reizvoller (B5), mit passenden wechselnden Varianten (gehen, traben, rutschen, hüpfen …; kleine Zufallsauswahl, nie ein seltener „Jackpot“); nichts Bedrohliches; Fantasie nur im Rahmen (`figuren.md` §5). Im Prototyp dürfen die
Spielobjekte noch einfache Platzhalter sein, aber ihre Rolle (Wirkung) muss stimmen; der Prototyp zeigt mindestens eine solche Folge (W-Freude). Im Ausbau das Kartenbild nach
`grundsaetze-bilder.md` §16 (W-Karte): eine Figur, groß, mittig bis Mitte rechts, kein Text und keine Lernzeichen, im
Silhouettentest (alle Karten des Fachs als Raster in 64 px Graustufen) von den anderen Karten des Fachs zu
unterscheiden, `(figur, welt, zustand)` im Fach eindeutig. Im Ausbau hat jede Stufe und jede Aufgabenart passende Folgen mit Varianten.
<!-- ende wörtlich -->

**Kriterien:**
- **W-Figur:** eine Figur der Runde ist sichtbar und tut ihre Aufgabe aus dem Entwurf (`docs/figuren.md` §3).
- **W-Sachwelt:** die Sachwelt ist im Bild erkennbar und passt zur Aufgabe (der Sachgrund erzeugt die Aufgabe).
- **W-Eine-Welt:** keine zweite Metapher (A4b).
- **W-Objekte:** Spielobjekte im Stil der Runde (`docs/figuren.md` §4, Welt-Paletten `docs/grundsaetze-bilder.md`
  §6.2) und sachlich richtig; im Prototyp dürfen es Platzhalter sein, im Ausbau nicht.
- **W-Wirkung:** die Objekte sind die Wirkung der Lösung, nicht Zählmaterial (M1); das Gelernte steht danach als
  Lernzeichen mit dem Zeichen da (A6b).
- **W-Bewegung:** nur als Folge einer Kinderhandlung, ~1 s während der Handlung, bis ~3 s für die Folge einer gelösten
  Aufgabe, überspringbar, still beim Denken; mit reduzierter Bewegung ruhig und kurz (im Ausbau: Bilder je Bewegungszustand).
- **W-Freude** (Christian, 2026-11-14): jede richtige Lösung hat eine sichtbare Folge, die sich aus der Aufgabe selbst
  erklärt (Figur oder Ding reagiert); Teil des Spiels, keine Belohnung (keine Punkte, Sterne); verlässlich, nach falscher
  Antwort nie reizvoller; passende wechselnde Varianten, nie ein seltener „Jackpot“. Prototyp: mindestens eine Folge;
  Ausbau: je Stufe und Aufgabenart Folgen mit Varianten. Reaktionen der Runde nutzen, wo vorhanden.
- **W-Regal** (nur im Ausbau, sonst „n/a“): das Regal-Bild erscheint im Regal flach und still, mit dem richtigen
  Wert, und ist sachlich richtig.
- **W-Ruhe:** nichts Bedrohliches; Fantasie nur im Rahmen (`docs/figuren.md` §5); Geschichte nach
  `docs/grundsaetze.md` §9.
- **W-Karte** (nur im Ausbau, sonst „n/a“): Kartenbild nach `docs/grundsaetze-bilder.md` §16 – eine Figur im Stil
  der Runde (kein Kind der Runde), mindestens 60 % der Bildhöhe, mittig bis Mitte rechts, kein Knopf auf der Karte; typischer Moment,
  still; keine Ziffern, Buchstaben, Perlen; im Silhouettentest von jeder anderen Karte des Fachs zu unterscheiden;
  `(figur, welt, zustand)` im Fach eindeutig; Spielsymbol (Kopfleiste, Regal-Detail) ist die Kopfform der Figur.

**Grün heißt:** alle Kriterien grün, kein kritischer Befund. Im Zweifel rot.

Schreib deine Antwort außerdem unverändert in die Datei `{{BERICHT}}` (Arbeitsablage außerhalb des Arbeitsordners;
die einzige Datei, die du schreibst).

**So sieht deine Antwort aus** (nichts davor, nichts danach):

```
Ergebnis: GRÜN | ROT

| Nr. | grün/rot | Beleg (Datei:Zeile, Bilddatei, Befehl mit Ausgabe) | Befund, falls rot |
|---|---|---|---|
… eine Zeile je Kriterium: W-Figur, W-Sachwelt, W-Eine-Welt, W-Objekte, W-Wirkung, W-Bewegung, W-Freude, W-Regal, W-Karte, W-Ruhe

Kritische Befunde:
- <Befund> – <Beleg> – <was es lösen würde>   (oder „keine“)

Vorige Befunde: <je Befund behoben / nicht behoben mit Beleg>   (nur ab Runde 2)
```
