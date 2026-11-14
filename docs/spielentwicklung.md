# Spielentwicklung: vom Katalog-Eintrag zum fertigen Spiel

Stand: 2026-11-14 · **Entwurf zur Freigabe** · Entscheidungen von Christian (2026-11-14)
Markierung: **(Christian)** entschieden · **(Annahme)** Vorschlag, korrigierbar.

## Warum

Das erste Spiel nach dem Katalog (Zerlegungshaus) war eine Fehlkonstruktion: keine Figur, eine Sachwelt, die nicht
zum Spiel passte, und eine Runde, die nicht funktionierte. Es wurde gebaut, bevor es gedacht war. Spiele sollen im
Hintergrund entstehen, ohne dass jedes erst mit einem Kind getestet wird **(Christian)**. Deshalb bewertet und testet
die KI jeden Entwurf und jeden Prototyp gegen feste Kriterien; Änderungen fließen zurück, bis alles grün ist. Erst
dann wird ausgebaut **(Christian)**.

Christian sieht ein Spiel nur, wenn es nach drei Runden rot bleibt (geparkt), und als gelegentliche Stichprobe
fertiger Spiele **(Christian)**. Gestartet wird je Spiel mit dem Skill „Spiel entwickeln <Katalog-Id>“, ein Spiel je
Lauf, mehrere parallel in eigenen Worktrees **(Christian)**.

## Ablauf

```
Katalog-Eintrag (docs/spielkatalog/*.md)
  → 1 Spielentwurf (eine Seite) ──→ Prüfung A (Entwurf) ──rot──┐
          ↑─────────────── Befunde, höchstens 3 Runden ─────────┘
  → 2 Prototyp (Spielvorlage, eine Runde, ohne Bild und Audio) ──→ Prüfung B (Prüfstand) ──rot──┐
          ↑─────────────── Befunde, höchstens 3 Runden ─────────────────────────────────────────┘
  → 3 Ausbau (Stufen, Bild, Audio-Texte als Daten, Tests, Regal-Material, Einführung)
  → 4 Abschluss-Review → main
Bleibt eine Prüfung nach 3 Runden rot: Spiel parken, Befunde an Christian.
```

Jede Prüfung vergibt je Kriterium **grün** oder **rot** mit Beleg (Datei:Zeile, Screenshot, Prüfungsausgabe).
**Grün heißt:** alle Pflichtkriterien grün, kein kritischer Befund. Kriterien mit „(Soll)“ dürfen rot sein, wenn
der Grund im Entwurf steht.

## Ablage (Christian)

Jedes Spiel hat **einen eigenen Ordner, sortiert nach Fach** (Fach-Ids wie in `spiele.json`: `mathe`, `lesen`,
`schreiben`, `grammatik`, `geometrie`, `sprechen`). Der Ordnername ist der Name des Spiels in Kleinbuchstaben mit
Bindestrichen (Annahme), z. B. M14 „Zwei Tonnen“:

```
spiele/
  mathe/
    zwei-tonnen/
      index.html        dünne Seite (Bausteine, seite.css, spiel.js)
      spiel.js          Spielwelt, Aufgabe, Rahmen (aus der Vorlage)
      logik.js          reine Spiellogik, in Node getestet (falls nötig)
      texte.json        alle gesprochenen und geschriebenen Sätze (für die Audio-Pipeline)
      symbol.svg        Spielsymbol (Startseite, Fach-Seite)
      objekte/          spielspezifische animierte SVG-Objekte
      bilder/           Szenenbild(er) mit herkunft.json (A4)
  objekte/              Objekte, die mehrere Spiele nutzen (Tonne, Baum, Korb …)
  vorlage/              die Spielvorlage als Ordner – zum Kopieren
  rahmen/  kern/  …     gemeinsame Bausteine und Dienste
tests/spiele/<fach>/<spiel>.test.mjs   Node-Tests der Spiellogik
docs/spiele/<fach>/<spiel>.md          der Spielentwurf
```

- `spiele.json` nennt die Seite relativ zu `spiele/`: `"datei": "mathe/zwei-tonnen/index.html"`,
  `"symbol": "mathe/zwei-tonnen/symbol.svg"`.
- Bausteine finden ihre Pfade selbst (`import.meta.url`); im Spiel verweisen Imports relativ (`../../rahmen/…`).
- Ein neues Spiel entsteht durch Kopieren von `spiele/vorlage/` in `spiele/<fach>/<spiel>/`.

## 1. Der Spielentwurf

Datei `docs/spiele/<fach>/<spiel>.md` (eine Seite), abgeleitet aus dem Katalog-Eintrag. **Der Katalog-Eintrag ist ein
Vorschlag, keine Vorgabe:** Passt seine Welt, Figur oder Mechanik nicht, weicht der Entwurf ab und sagt warum.

Pflichtteile:
1. **Zweck in der Spielwelt:** Wozu tut das Kind das? Was bewirkt die richtige Antwort? (ein Satz)
2. **Die Runde in fünf Sätzen:** was das Kind sieht, was es tut, was passiert, wie die Runde endet.
3. **Lernhandlung = Spielhandlung:** welche Handlung das Thema übt, und dass sie ohne das Thema nicht spielbar wäre.
4. **Sachwelt und Sachgrund:** welche Welt, und wie der Sachgrund *in der Aufgabe* steckt (Zahlen, Beziehungen,
   Wörter kommen aus der Sache, K2). Ein Satz, der erklärt, warum diese Welt zu genau dieser Handlung passt.
5. **Figur:** welches Kind der Runde was tut (vorzeigen, fragen, sich wundern, sich freuen; F6, F7), wo es im Bild
   steht, welche Haltungen aus der Runde gebraucht werden.
6. **Bildschirm-Skizze** (ASCII) nach `bedienung.md` §3: Kopfleiste, Erzählblase, Lernfeld, Tablett, Hilfe.
7. **Rückmeldung:** was die Mechanik bei passend / nicht passend zeigt; was der Erzähler sagt (Sätze wörtlich).
8. **Hilfe-Leiter:** Probe (Stufe 1) und Lösung mit Begründung (Stufe 2), wörtlich.
9. **Stufen** material / vorstellung / kopf, soweit der Katalog sie vorsieht; der Prototyp baut eine davon.
10. **Aufgabenschlüssel** und `arten` für `spiele.json`; welche Themen des Lernplans bedient werden.
11. **Spielobjekte (Christian):** welche Dinge der Sachwelt das Spiel als eigene, animierte SVG-Bilder braucht (z. B.
    Mülltonnen, Papier, Dosen), welche Bewegungen sie haben (z. B. Deckel öffnet sich, Ding fliegt hinein, Tonne
    wackelt satt) und welches davon als **Regal-Bild** für die Themen des Spiels dient.

### Spielobjekte (Christian)

- Jedes Spiel entwickelt seine Sachwelt-Dinge als **animierte SVG-Bilder im Stil der Runde** (`docs/figuren.md` §4:
  Kontur nur um die Silhouette, Licht von oben links in Stufen, Schlagschatten, keine Verläufe; Welt-Paletten aus
  `grundsaetze-bilder.md` 6.2). Von Hand als SVG, nie KI-generiert (A1). Sachlich richtig (eine Papiertonne sieht aus
  wie eine Papiertonne, T2/K3).
- Sie stehen **im Spiel** (Sachwelt, Stimmungs- bzw. Wortbild-Ebene) und **im Regal**: Das Spiel nennt für seine
  Themen ein Regal-Bild (z. B. die Tonne mit der Zahl des Themas), das dort statt des allgemeinen Kärtchens steht.
- **Lernzeichen bleiben schlicht (M1):** Gezählt und gerechnet wird am Lernzeichen (Perlenstab, Zehnerfeld,
  Wortkarte). Die Sachobjekte sind die **Wirkung** der Lösung (B1): Der geteilte Stab wird zu Papier und Wertstoff,
  die Dinge wandern in die Tonnen. Sachobjekte werden nicht als Zählmaterial benutzt.
- **Bewegung nach §7:** Folge einer Kinderhandlung, etwa 1 s, überspringbar; still, solange das Kind denkt (B3); bei
  `prefers-reduced-motion` ohne Bewegung (Endzustand sofort).
- **Ablage:** Objekte, die mehr als ein Spiel brauchen kann (Tonne, Baum, Korb), in `spiele/objekte/<name>.js` als
  Baustein mit gleicher Schnittstelle (z. B. `<ls-objekt art="papiertonne">` oder eine Zeichenfunktion), damit der
  Bestand mit jedem Spiel wächst; Spielspezifisches im Spielordner.

## 2. Prüfung A: der Entwurf

Ein Prüfer, der den Entwurf, den Katalog-Eintrag und die Grundsätze liest (nicht den Autor).

| Nr. | Kriterium | Quelle |
|---|---|---|
| A1 | Zweck in der Spielwelt klar; ohne den Lerninhalt wäre das Spiel nicht spielbar. | Prüffrage 2, N3 |
| A2 | Eine Schwierigkeit; alles andere leicht (kurze Wörter, Vorlesen). | §4 Isolation |
| A3 | Das Kind bringt die Antwort hervor (bauen, tippen, ziehen), wählt nicht aus wenigen Knöpfen. | L1, L2 |
| A4 | **Sachwelt passt:** der Sachgrund erzeugt die Aufgabe; eine Erwachsene würde die Verbindung in einem Satz verstehen. | K1, K2 |
| A4b | **Eine Welt, keine zweite Metapher:** Die Lernhandlung geschieht *in* der Sachwelt (sieben Dinge teilen sich auf zwei Tonnen auf). Kein zusätzliches Bild obendrauf, das mit der Sache nichts zu tun hat (Haus, Stockwerke, Licht beim Mülltrennen). Lernzeichen wie der Perlenstab dürfen daneben stehen. | K2, L8; Lehre aus dem Zerlegungshaus (Christian) |
| A5 | **Eine Figur der Runde hat eine Aufgabe** in der Runde und ist im Bild. | F6, F7, `figuren.md` |
| A6 | Rückmeldung: Mechanik zeigt passt/passt nicht; Erzähler beschreibt; keine Wörter aus 3.2; Fehler-Folge nicht reizvoller. | 3.1, 3.2, N7 |
| A7 | Hilfe-Leiter mit Probe statt Bedeutungsregel; Lösung mit Begründung. | L12, §5 |
| A8 | Fachbegriffe nach §5.1; keine Regeln mit Verfallsdatum. | §5 |
| A9 | Geschichte nach §9 (Spannung aus Neugier, keine Bedrohung, Stufe festgelegt). | §9 |
| A10 | Bildschirm folgt `bedienung.md` §3 (feste Plätze, Erzählblase ohne Zipfel). | `bedienung.md` |
| A11 | Erzähler spricht, Figuren handeln; Sätze wörtlich und als Daten erfassbar. | `stimme.md` |
| A12 (Soll) | Vielfalt beiläufig, Bilder nach 6.1–6.3. | §6 |

## 3. Der Prototyp

Eine Kopie der Spielvorlage (`spiele/vorlage/` nach `spiele/<fach>/<spiel>/`) mit genau einer Stufe und einer Runde, ohne erzeugtes Bild und
ohne Aufnahmen (die Systemstimme genügt), aber mit den Bausteinen aus `spiele/rahmen/`, der Figur als Platzhalter
aus der Runde (`docs/figuren.md`, gezeichnete Runde, sobald verfügbar) und einer schlichten Welt-Fläche.

## 4. Prüfung B: der Prüfstand

Vier unabhängige Prüfer (frische Agenten, die nicht gebaut haben). Jeder liefert grün/rot je Kriterium mit Beleg.

**B-Didaktik** (Code + Entwurf): A1–A8 am gebauten Prototyp nachgeprüft; dazu: die Lernsteuerung bekommt jede
Aufgabe mit `ok`, `hilfe`, `ms` gemeldet; mit Hilfe Gelöstes zählt nicht als gekonnt.

**B-Welt** (Screenshots + Entwurf): Figur sichtbar und tätig; Sachwelt im Bild erkennbar und passend zur Aufgabe;
eine Welt, keine zweite Metapher (A4b); Spielobjekte im Stil der Runde und sachlich richtig, als Wirkung animiert,
nicht als Zählmaterial (M1); nichts Bedrohliches; Fantasie nur im Rahmen (`figuren.md` §5). Im Prototyp dürfen die
Spielobjekte noch einfache Platzhalter sein, aber ihre Rolle (Wirkung) muss stimmen.

**B-Spielbarkeit** (automatisches Durchspielen, `tests/browser/durchspielen.mjs`): Simulierte Kinder spielen je eine
Runde in Chromium und WebKit, 1920×1080 und 1280×800:

| Kind | Verhalten | muss gelten |
|---|---|---|
| Sicher | löst jede Aufgabe beim ersten Versuch | Runde endet in der Pause; keine Hilfe nötig; Lernstand meldet `ok` |
| Ratend | probiert zufällig, bis es passt | jede Aufgabe ist lösbar; nach dem 2. Versuch leuchtet Hilfe; nichts hängt |
| Hilfe | tippt Hilfe zweimal, folgt der Lösung | Lösung ist ausführbar; Meldung `hilfe: 2`, nicht gekonnt |
| Wild | tippt 200-mal zufällig überall hin | keine Konsolenfehler, kein Einfrieren, kein Zustand ohne Ausweg |
| Tastatur | nur Tab/Enter/Leertaste | Runde lösbar |
| Zurück | verlässt mitten in der Runde über Haus, kommt zurück | Lernstand konsistent, Spiel startet sauber |

Pflicht außerdem: keine Konsolenfehler, Vorschau schreibt nichts, `npm test` grün.

**B-Bedienung** (Screenshots): Checkliste `bedienung.md` §10, Farbwelt §6 (Schatten nur am Drückbaren, Sonne nur
als Ring, keine Farbe als einziges Signal), Größen nach §4, still beim Denken (§7 B3), reduzierte Bewegung.

## 5. Ausbau

Erst nach grünem Prüfstand: alle Stufen, **Spielobjekte als animierte SVG im Stil der Runde** (Prüfer B-Welt
schaut sie erneut an, Screenshots je Bewegungszustand), Regal-Bild für die Themen, Szenenbild (Werkzeug `werkzeuge/bilder/`, Herkunft A4), Texte als Daten,
`npm run audio` (Erzeugen; Anhören ist Sache von Christian, Liste der neuen Texte im Bericht), Einführung, Regal-Material
(`material.js`), Eintrag in `spiele.json`, Browser-Prüfung des Spiels, Durchspielen erneut grün. Danach
Abschluss-Review des Branches (wie bei Rahmen und Ansichten) und Merge nach `main`.

## 6. Parken

Bleibt Prüfung A oder B nach drei Runden rot, wird das Spiel geparkt: Branch bleibt, `docs/spiele/<fach>/<spiel>.md` bekommt
einen Abschnitt „Geparkt“ mit den offenen Befunden, Christian bekommt eine kurze Meldung. Kein weiterer Versuch ohne
seine Entscheidung (z. B. Katalog-Eintrag ändern).
