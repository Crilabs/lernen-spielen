# Die Stimme der Lernspiele

Wie gesprochene Texte geschrieben, erzeugt und geprüft werden. Gilt für jedes Spiel, jede Einführung und jede
Seite, die vorliest. Ergänzt `docs/grundsaetze.md` (Leitsatz: „Die Sache urteilt, die Stimme beschreibt“).

Markierung: **(Christian)** = von Christian entschieden, **(Annahme)** = Vorschlag, beim Lesen korrigierbar.

## Kurz

- **Eine Stimme: ein Erzähler.** Azure `de-DE-Florian:DragonHDLatestNeural`, Originalhöhe, 10 % langsamer
  **(Christian, 2026-11-13)**.
- **Die Stimme passt nicht zu den Kindern und Tieren der Spiele (Christian, 2026-11-14).** Deshalb sprechen
  die Figuren nie selbst. **Der Erzähler spricht, die Figuren handeln.**
- Gesprochen wird aus vorab erzeugten und angehörten Aufnahmen. Fehlt eine, springt die Systemstimme ein.
  Sie ist nur Notbehelf.

## 1. Der Erzähler spricht, die Figuren handeln

### Der Erzähler

- erzählt in der **dritten Person**, was die Figuren tun, sehen und fühlen;
- spricht das Kind mit **„du“** an: Aufgabe, Hinweis, Sache und Warum;
- klingt ruhig und freundlich wie ein Erwachsener, der vorliest. Kein verstellter Kinderton, keine Comicstimme.

### Die Figuren

- **handeln** und zeigen ihre Gefühle mit Körper, Gesicht und Bewegung. Geräusche sind erlaubt (Seufzen,
  Staunen, Lachen als Klang), aber **keine Wörter**;
- haben **keine Ich-Sätze**, auch nicht als Zitat des Erzählers („Ela sagt: Ich …“);
- haben **keine Sprechblasen mit Text, der vorgelesen wird**. Vorgelesener Text steht als Erzähltext im
  Bild (Erzählfeld, Tafel, Schriftband), nicht im Mund einer Figur. Denkblasen mit Bild ohne Text sind
  erlaubt **(Annahme)**.

Warum: Eine Männerstimme aus dem Mund eines Kindes passt nicht und wirkt fremd. Ein Erzähler
ist eine eigene, glaubwürdige Rolle wie beim Vorlesen eines Bilderbuchs. Er passt zu allen Figuren gleichzeitig.

### Die Regeln zu Gefühlen bleiben, nur erzählt

Grundsätze §2, Punkte 4 und 5 gelten weiter: Jede Figur ist für ihre Gefühle selbst verantwortlich. Gefühle
gelten der Sache, nie dem Kind. Nach einer Antwort, die nicht passt, sind sie neugierig oder gelassen. Der
Erzähler benennt sie in der dritten Person:

| Statt (Figur spricht) | So (Erzähler) |
|---|---|
| „Ich freu mich so! Ich wollte schon lange über den Bach.“ | „Ela freut sich. Sie wollte schon lange über den Bach.“ |
| „Puh, ich war gespannt, ob die Brücke hält.“ | „Puh. Timo war gespannt, ob die Brücke hält.“ |
| „Oh, das überrascht mich – das Kärtchen passt nicht.“ | „Lena staunt. Das Kärtchen passt nicht. Sie will wissen, warum.“ |
| „Hilfst du mir?“ | „Kofi möchte über den Bach. Hilfst du ihm?“ |
| „Ich darf Nein sagen.“ (K15) | „Lena sagt Nein. Das darf sie.“ oder an das Kind: „Du darfst Nein sagen.“ |

Auch erzählt gilt: kein „Du machst Kofi glücklich“, kein Lob, keine Wörter aus Grundsätze §3.2.

### Ausnahmen

- **Diktat- und Lesetexte** sind Text zum Schreiben oder Lesen, keine Rede einer Figur. Die Ich-Form ist
  darin erlaubt (heutige Diktatsätze wie „Ich habe Durst.“). Neue Diktatsätze möglichst in dritter Person
  oder neutral **(Annahme)**.
- **Wörter, Wortstücke und Laute** („Pony … frisst?“, „Schmet … terling?“) spricht der Erzähler als Sache.
- **Weitere Stimmen nur für Hörthemen (Christian, 2026-11-14):** Themen, die mehrere Stimmen zum Inhalt haben
  (sprecher-unterscheiden, viele-stimmen-verstehen, gefuehl-in-der-stimme), bekommen kurze Aufnahmen weiterer
  Stimmen. Sie gehören zu Gästen in einer Hörszene, sind vorab erzeugt und klar als Hörstück gerahmt. Sonst bleibt
  es beim Erzähler; die Kinder der Runde sprechen weiterhin nicht.
- **Die Stimme des Kindes (Christian, 2026-11-14):** In einigen Spielen (Z09, Z10, L18 im Spielkatalog) darf das
  Kind sich selbst aufnehmen und anhören. Die Aufnahme bleibt auf dem Gerät, wird nicht erkannt oder bewertet und
  ist nie Bedingung. Aufnahme nur über `spiele/kern/`.

## 2. Texte für die Stimme schreiben

- **Kurze Sätze, ein Gedanke je Satz.** Punkt = Pause, Komma = kurze Pause, „…“ trennt Wortstücke.
- **Fragen enden mit „?“**, dann hebt die Stimme am Ende.
- **Zahlen** dürfen in Aufnahmen vorkommen **(Christian)**, als Ziffer oder Zahlwort. Ausnahme Einführungen
  (`spiele/einfuehrungen/`): Dort enthält `sprich` weder Ziffern noch Zahlwörter noch Platzhalter; Zahlen
  stehen in `zeig` und im Bild (`fuelleVorlage` in `spiele/einfuehrung.js` prüft das). Beim Anhören auf
  Ordinalzahlen achten („fünfter“ statt „fünf“). Die Systemstimme spricht nie Zahlen. Ob ein Satz eine Lösung
  verrät, entscheidet das Spiel (Grundsätze).
- **Keine Abkürzungen, Sonderzeichen, Gendersternchen** (Grundsätze §6). Schwierige Wörter mit Bild.
- **Gleicher Text, gleiche Aufnahme.** Dieselbe Sache immer gleich formulieren. Das spart Aufnahmen und hilft
  dem Kind, Sätze wiederzuerkennen.
- **Varianten** (`sprich(text, { variante: "diktat" })`) nur, wenn das Tempo anders sein muss.

## 3. Texte müssen erfassbar sein

Eine Aufnahme gibt es nur für Texte, die `werkzeuge/audio/texte.mjs` findet:

- Texte in Daten: `spiele.json`, `lernplan.json`, `einfuehrungen/*.json`, `saetze/saetze.json`;
- feste Zeichenketten im Code: `sprich("…")`, `say("…")`, `sag("…")` und die Erzählerblase `blase.sage("…")`.

**Sätze, die zur Laufzeit zusammengesetzt werden** (`` `${artikel} ${wort}. …` ``), findet das Sammeln nicht.
Dort spricht die Systemstimme. Neue Spiele legen solche Vorlagen deshalb als Daten an, damit das Werkzeug alle
Belegungen erzeugen kann (Plattform-Spec: `inhalte/vorlagen.json`). `npm run audio` zählt die noch nicht
erfassten Stellen je Datei.

## 4. Ablauf bei neuen oder geänderten Texten

1. Text schreiben oder ändern (Regeln oben).
2. `npm run audio`: erzeugt nur, was neu oder geändert ist. Schlüssel siehe `werkzeuge/audio/README.md`.
3. `npm run audio:anhoeren` → http://127.0.0.1:8766: jede neue Aufnahme anhören.
   - <kbd>Leertaste</kbd> abspielen, <kbd>Enter</kbd> passt und weiter, <kbd>K</kbd> Aussprache korrigieren.
   - Eine Korrektur ist eine andere Schreibweise nur für die Stimme (Silben mit Bindestrich, Komma für eine
     Pause, Zahlwort statt Ziffer). Sie landet in `werkzeuge/audio/aussprache.json` und wird sofort neu erzeugt.
     Der Text im Spiel bleibt gleich.
   - Hilft keine Schreibweise: SSML (`ssml`, z. B. `<phoneme>`) oder eine von Hand ersetzte Datei (`datei`) in
     `aussprache.json` eintragen.
4. Committen: `spiele/audio/` (MP3 + `index.json`) und `werkzeuge/audio/aussprache.json`.
5. Vor einem Release: `npm run audio -- --pruefen` (meldet Texte ohne Aufnahme). Nicht Abgehörtes darf mit,
   soll aber die Ausnahme sein.

Im Elternbereich (Protokoll) steht „Keine Audiodatei: …“, wenn ein Spiel einen Text ohne Aufnahme spricht.

## 5. Stimme und Einstellungen

- `werkzeuge/audio/einstellungen.json`: Stimme, Ordner, Tempo (−10 %), Diktat (−20 %), Zahlen an.
- **Höher geht nicht:** HD-Stimmen ignorieren die Tonhöhe in SSML (gemessen). Eine höhere „Figurenstimme“
  per Nachbearbeitung (Rubber Band) wurde geprüft. Christian blieb beim Original. Daraus folgt die
  Erzähler-Regel oben.
- **Stimme wechseln:** neue Stimme und neuer `ordner` in `einstellungen.json`, `npm run audio` erzeugt alles
  neu, alles muss neu angehört werden, danach `npm run audio -- --aufraeumen`.
- **Hinweis an die Eltern** (Azure-Vorgabe für Angebote für Kinder): im Elternbereich unter „Hinweise“.
  Er bleibt, solange eine erzeugte Stimme spricht.
- Azure-Ressource `lernen-spielen-stimme` (Gruppe `lernen-spielen`, westeurope, S0). Warum Azure und nicht
  ElevenLabs: `werkzeuge/audio/README.md`.
