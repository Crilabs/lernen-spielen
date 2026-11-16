# Spielentwicklung: vom Katalog-Eintrag zum fertigen Spiel

Stand: 2026-11-14 · Entscheidungen von Christian (2026-11-14)

> **Abgelöst am 2026-11-15 (Christian):** Neue Spiele entstehen nach [`spielbau.md`](spielbau.md) (Spielkern zuerst,
> ein Bauheft statt aller Dokumente, Steuerung als Skript, höchstens zwei Runden). Hier stehen nur noch **Ablage**,
> **Spielobjekte** mit Schnittstelle, **Regal-Bild**, **Kartenbild** und die Kosten (§6); der alte Ablauf ist entfernt
> (Git-Historie).

Markierung: **(Christian)** entschieden · **(Annahme)** Vorschlag, korrigierbar.

## Ablage (Christian)

Jedes Spiel hat **einen eigenen Ordner, sortiert nach Fach** (Fach-Ids wie in `spiele.json`: `mathe`, `lesen`,
`schreiben`, `grammatik`, `geometrie`, `sprechen`). Der Ordnername ist **Katalog-Nummer und Name** in Kleinbuchstaben
mit Bindestrichen (Christian), z. B. M37 „Kettenhüpfer“ → `m37-kettenhuepfer`:

```
spiele/
  mathe/
    m37-kettenhuepfer/
      index.html        dünne Seite (Bausteine, seite.css, spiel.js)
      spiel.js          Spielwelt, Aufgabe, Rahmen (aus der Vorlage)
      logik.js          reine Spiellogik, in Node getestet (falls nötig)
      texte.json        alle gesprochenen und geschriebenen Sätze (für die Audio-Pipeline)
      symbol.svg        Spielsymbol = Kopf der Figur (Kopfleiste, Regal-Detail)
      spielbild.webp    Spielbild der Karte (aus Screenshots, mit herkunft.json)
      objekte/          spielspezifische animierte SVG-Objekte
      bilder/           Szenenbild(er) mit herkunft.json (A4)
  objekte/              Objekte, die mehrere Spiele nutzen (Tonne, Baum, Korb …)
  vorlage/              die Spielvorlage als Ordner – zum Kopieren
  rahmen/  kern/  …     gemeinsame Bausteine und Dienste
tests/spiele/<fach>/<spiel>.test.mjs   Node-Tests der Spiellogik
docs/spiele/<fach>/<spiel>.md          die Spielidee
```

- `spiele.json` nennt die Seite relativ zu `spiele/`: `"datei": "mathe/m37-kettenhuepfer/index.html"`,
  `"symbol": "mathe/m37-kettenhuepfer/symbol.svg"`.
- Bausteine finden ihre Pfade selbst (`import.meta.url`); im Spiel verweisen Imports relativ (`../../rahmen/…`).
- Ein neues Spiel entsteht durch Kopieren von `spiele/vorlage/` in `spiele/<fach>/<katalog-nr>-<name>/`;
  `tests/ablage.test.mjs` prüft Ordner, `datei`, `symbol` und Fach.
- `tests/browser/pruefkopie.mjs` spielt die Vorlage in dieser Tiefe durch: Kopie nach `spiele/mathe/m99-pruefkopie/`,
  jedes „../“ wird „../../“, Prüfstand darüber, Kopie wieder gelöscht. So fällt auf, wenn ein Baustein oder Dienst
  seine Dateien relativ zur Seite statt zu sich selbst sucht.

## Spielobjekte (Christian)

- Jedes Spiel entwickelt seine Dinge als **animierte SVG-Bilder im Stil der Runde** (`docs/figuren.md` §4:
  Kontur nur um die Silhouette, Licht von oben links in Stufen, Schlagschatten, keine Verläufe; Welt-Paletten aus
  `grundsaetze-bilder.md` 6.2). Von Hand als SVG, nie KI-generiert (A1). Sachlich richtig (eine Papiertonne sieht aus
  wie eine Papiertonne, T2/K3).
- Sie stehen **im Spiel** (Stimmungs- bzw. Wortbild-Ebene) und **im Regal**: Das Spiel nennt für seine
  Themen ein Regal-Bild (z. B. die Tonne mit der Zahl des Themas), das dort statt des allgemeinen Kärtchens steht.
- **Lernzeichen bleiben schlicht (M1):** Gezählt und gerechnet wird am Lernzeichen (Perlenstab, Zehnerfeld,
  Wortkarte). Die Sachobjekte sind die **Wirkung** der Lösung (B1): Der geteilte Stab wird zu Papier und Wertstoff,
  die Dinge wandern in die Tonnen. Sachobjekte werden nicht als Zählmaterial benutzt.
- **Das Gelernte bleibt als Lernzeichen sichtbar (Christian):** Nach der Wirkung steht das Ergebnis wieder als
  Lernzeichen da, verbunden mit dem Zeichen (M7) – bei einer Zerlegung die zwei Perlenstäbe nebeneinander unter dem
  ganzen Stab und die Gleichung („6 = 2 + 4“). Das bleibt stehen (z. B. in der wachsenden Liste), damit es sich
  einprägt; die Sachobjekte sind nur der Weg dorthin.
- **Bewegung nach §7:** Folge einer Kinderhandlung, etwa 1 s während der Handlung, bis etwa 3 s für die Folge einer gelösten Aufgabe (mit Varianten, W-Freude), überspringbar; still, solange das Kind denkt (B3); bei
  `prefers-reduced-motion` ohne Bewegung (Endzustand sofort).
- **Ablage:** Objekte, die mehr als ein Spiel brauchen kann (Tonne, Baum, Korb), in `spiele/objekte/<art>.js`, damit
  der Bestand mit jedem Spiel wächst; Spielspezifisches im Spielordner unter `objekte/`. Regal-Bilder müssen im
  gemeinsamen Bestand liegen (Regal, Fach-Seite und Startseite laden sie dort nach).
- **Held (Christian, 2026-11-15):** Der Held ist immer ein Kind der Runde (`spielbau.md`); in Kopfform ist er das
  Spielsymbol.

### Schnittstelle (`spiele/objekte/objekt.js`)

```html
<ls-objekt art="papiertonne" zustand="offen"></ls-objekt>      <!-- im Spiel, Größe über height am Host -->
<ls-objekt art="papiertonne" wert="7" still></ls-objekt>        <!-- Regal: Zahl auf dem Aufkleber, ohne Bewegung -->
```

- **Attribute:** `art` (angemeldete Art), `zustand` (einer der Zustände der Art, sonst der erste), `wert` (kurzer Text,
  den die Art zeigt, z. B. die Zahl auf dem Aufkleber der Tonne), `still` (nie bewegen). Standard `aria-hidden="true"`
  (Schmuck der Sachwelt; was zählt, sagt der Erzähler). Größe: `height` am Host (Vorgabe 20 rem); das Feld ist das
  Objekt in Ruhe, ein offener Deckel ragt darüber hinaus, ohne etwas zu verschieben.
- **Bewegung:** Ein Wechsel von `zustand` spielt die Bewegung der Art einmal (0,4 bis 3 s, B1, B6), danach steht alles
  still (B3). Bei `prefers-reduced-motion` oder `still` steht der neue Zustand sofort da (B7).
- **Methoden:** `wechsle(zustand)` → Promise, wenn die Bewegung fertig ist; `fertig()`; `ueberspringe()` springt ans
  Ende (B6, z. B. beim Antippen); `anstossen(ding)` → kurze Antwort, ohne den Zustand zu ändern (das Ding fällt hinein,
  die Tonne wackelt satt); `einwurfPunkt()` → Punkt im Fenster, an dem ein Ding hineinfällt.
- **Werfen:** `wirf(ding, ziel, { dauer, oeffne })` lässt ein `ls-objekt` (z. B. `papier`, `dose`) im Bogen in ein Ziel
  fliegen: Ist das Ziel zu, geht der Deckel dabei auf; am Ziel verschwindet das Ding (`hidden`) und fällt im Ziel
  hinein. Rückgabe `{ fertig, ueberspringe, abbrechen }`; `fertig` endet mit `"angekommen"` oder `"abgebrochen"`.
  `ueberspringe` springt ganz ans Ende (Ding drin, Tonne offen, ohne Hineinfallen); `abbrechen` vor der Ankunft lässt
  das Ding am Start und setzt einen dabei geöffneten Deckel sofort in den alten Zustand zurück. Bewegt wird über die CSS-Eigenschaften `translate`/`rotate`/`scale`, ein
  `transform` der Seite bleibt unberührt.
- **Neue Art:** eine Datei, die beim Import `meldeObjekt(art, { zustaende, zeichne(zustand, { wert }), bewegung(von,
  nach), anstoss(ding), einwurf })` aufruft. `zeichne` baut das SVG mit `bild({ breite, hoehe, oben, teile, ursprung })`
  aus Teilen `{ stueck, teil, in, ursprung, eigen }`; die Stücke kommen aus den Helfern der Runde
  (`spiele/runde/kinder/stil.js`: `form`, `falte`, `naht`, `flach` …), so entsteht die Kontur-Schicht unter allen
  Flächen wie bei den Kindern. Ein Bild trägt alle Zustände: Teile mit `in: "zu voll"` sind nur in diesen Zuständen
  sichtbar. `bewegung` gibt Schritte `{ teil, keyframes, dauer, beginn, easing }` (Web Animations) zurück; ein Teil,
  das ein- oder ausgeblendet wird, nennt `opacity` in jedem Keyframe. Farben der Welt-Schicht, heller und weicher als
  die Lernzeichen (6.2), damit kein Objekt mit einer Perle oder einem Wortart-Zeichen verwechselt wird. Vorbild: `tonne.js` (Schnitt und Bewegungen
  der Mülltonnen), `papiertonne.js`, `wertstofftonne.js`, `papier.js`, `dose.js`. `tests/objekte.test.mjs` prüft
  Anmeldung, Stil-Grundlagen und dass jede Bewegung vorhandene Teile trifft.
- **Ansehen:** `spiele/rahmen/vorschau.html?objekte` zeigt jede Art in jedem Zustand neben Ela, Werfen zum Ausprobieren
  und das Regal-Bild.

### Regal-Bild

Ein Spiel nennt in `spiele.json` sein Regal-Bild: `"regal": { "objekt": "papiertonne", "wert": "zahl" }` (`wert`:
`"zahl"` = die Zahl des Themas, `null` = ohne). Für jedes Thema nimmt die Lernsteuerung das erste Spiel in
`spiele.json`, das das Thema bedient und ein Regal-Bild nennt (`regalBildFuer`). **Reihenfolge (Christian):** erst die
Lernzeichen (Perlenstab, Wortart-Zeichen, Karte mit dem Graphem), dann das Regal-Bild des Spiels, dann die Karte mit
dem Fachsymbol (`materialFuer`, `spiele/rahmen/material.js`). `bausteinHtml` baut das Bild als
`<ls-objekt art="…" wert="…" still aria-hidden="true">` – flach und still im Regal, auf der Fach-Seite und der
Startseite.
Buchstaben stehen nie auf einem Regal-Bild: Wo der Buchstabe der Inhalt ist, nimmt schon die Graphem-Karte
den Platz ein, sonst stünde er für nichts. Jedes `regal.objekt` muss als `spiele/objekte/<art>.js` vorliegen
(`tests/rahmen-regal-bild.test.mjs` prüft `spiele.json`).

### Kartenbild

Regeln: `grundsaetze-bilder.md` §16. Die Karte zeigt das **Spielbild** (`"bild"` in `spiele.json`, z. B.
`"mathe/m37-kettenhuepfer/spielbild.webp"`), gemacht von `werkzeuge/bilder/spielbild.mjs` aus 2–3 Screenshots des
Spiels. Die Karte hat keinen runden Knopf (Christian).

## 6. Kosten je Spiel (Christian)

Für jedes Spiel wird festgehalten, was seine Entwicklung verbraucht hat, damit die Kosten im Blick bleiben und sich
für alle Spiele des Katalogs vorhersagen lassen.

- **Ablage:** `spiele/<fach>/<spiel>/kosten.json`, eine Liste von Einträgen
  `{ datum, phase, posten, modell, eingabe, ausgabe, einheit, menge, notiz }`:
  - **KI-Entwicklung** (Claude): je Agent (Idee, Bau, Prüfstand, Spielprüfung) Modell und
    Token-Verbrauch aus dem Transkript des Agenten, getrennt nach Eingabe, Ausgabe, Cache lesen und Cache schreiben
    (`phase`: idee, bau, pruefstand, pruefung, ältere Einträge auch entwurf, pruefung-a, prototyp, pruefung-b, ausbau,
    review; die steuernde Sitzung selbst einmal am Ende als `steuerung`; `einheit`: tokens).
  - **Bilder** (Azure OpenAI): je erzeugtem Bild der Verbrauch aus der API-Antwort (`usage`: Ein- und Ausgabe-Token,
    bzw. Bildanzahl und Größe), eingetragen vom Bild-Werkzeug; dasselbe steht in `herkunft.json` des Bildes (A4).
  - **Stimme** (ElevenLabs Livia, Rückfall Azure Speech; Notiz nennt den Anbieter): je Lauf von `npm run audio` die Zahl der neu erzeugten Zeichen für die Texte des
    Spiels (`einheit`: zeichen).
- **Werkzeuge:** `werkzeuge/kosten/kosten.mjs` (`trageEin`, `summen`, `prognose`, `usageAusTranskript`) und
  `werkzeuge/kosten/transkript.mjs` (bucht einen Agenten aus seinem Transkript; mit `--stand` bei Fortsetzungen nur den
  Zuwachs). Posten: `claude` (`einheit: tokens`, `menge` = Eingabe + Ausgabe + `cache_lesen` + `cache_schreiben`), `bild` (`bilder`, `menge` 1, `usage` aus der Antwort), `stimme` (`zeichen`), `status` (`phase: geparkt`, `einheit: keine`, markiert ein geparktes Spiel). Bilder: `node werkzeuge/bilder/erzeugen.mjs --spiel <ordner> <ziel> "<Szene>"`; Stimme: `npm run audio` ordnet neue Zeichen über `texte.json` zu, oder `-- --spiel <ordner>`. Für „Mit echten Dingen“ nennt ein Eintrag zusätzlich `thema` (Liste der Thema-Ids, die er abdeckt; der Bericht zählt jedes Thema einmal, auch wenn Schreiben und Prüfrunden es mehrfach buchen) oder, für ältere Einträge, `themen` (Zahl).
- **Preise:** `werkzeuge/kosten/preise.json` (Preis je Million Token je Modell, je Bild/Token für Bilder, je Million
  Zeichen für die Stimme, mit Stand-Datum und Quelle). Preise ändern sich; der Bericht rechnet immer mit der Datei.
- **Bericht:** `npm run kosten` zeigt je Spiel die Summe in Token, Zeichen, Bildern und Euro, den Durchschnitt je
  fertigem Spiel und eine **Prognose für alle Spiele des Katalogs** (Anzahl aus `docs/spielkatalog.md`), getrennt nach
  Posten, mit Spannweite (günstigstes bis teuerstes bisheriges Spiel). Geparkte Spiele zählen mit, gesondert ausgewiesen.
  Der Ordner eines geparkten Spiels liegt nur in seinem Branch; seine Kosten stehen deshalb zusätzlich als
  `werkzeuge/kosten/geparkt/<spiel>.json` auf `main`, und der Bericht liest sie dort.
