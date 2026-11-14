---
name: spiel-entwickeln
description: Verwenden, wenn ein Spiel aus dem Spielkatalog entstehen soll – Aufruf „Spiel entwickeln <Katalog-Id>“ (z. B. „Spiel entwickeln M15“). Führt genau ein Spiel vom Katalog-Eintrag über Entwurf, Prüfung A, Prototyp, Prüfstand B, Ausbau und Abschluss-Review bis zum Merge nach main oder parkt es; Prüfer sind immer frische Agenten.
---

# Spiel entwickeln

Verbindlich, ganz: `docs/spielentwicklung.md` (Ablauf §1–§7, Ablage, Spielobjekte, Kosten, Parken). Dazu
`docs/grundsaetze.md`, `docs/grundsaetze-bilder.md`, `docs/figuren.md`, `docs/stimme.md`, `docs/bedienung.md`,
`docs/mit-echten-dingen.md`, `docs/spielkatalog.md` und `docs/spielkatalog/*.md`. Steht hier etwas anderes als dort,
gilt das Dokument; den Skill dann anpassen.

**Ein Spiel je Lauf.** Du steuerst: Du lässt bauen und prüfen, du entscheidest grün/rot nach den Prüfberichten, du
trägst die Kosten ein. Du baust nicht selbst und prüfst nicht selbst.

## Grundregeln

- **Prüfer sind immer frische Agenten**, die nicht gebaut haben, je Runde ein **neuer** Prüfer. Sie bekommen nur,
  was die Vorlage nennt (nie die Überlegungen der Bauenden). Jeder liefert grün/rot je Kriterium mit Beleg.
- **Grün** = alle Pflichtkriterien grün und kein kritischer Befund; „(Soll)“ darf rot sein, wenn der Grund im Entwurf
  steht. **Höchstens 3 Runden je Prüfung**, dann parken („Parken“ unten).
- **Christian wird während des Laufs nicht gefragt.** Anhalten und fragen nur bei: (1) etwas Zerstörerischem
  (Löschen fremder Arbeit, Force-Push, `reset --hard` auf fremden Branches, schmutziger `main`-Worktree),
  (2) Sicherheit (Schlüssel, Zugangsdaten, Plattform-Zugriff außerhalb `kern/`), (3) Wirkung nach außen über den
  Merge in das lokale `main` hinaus (Push, Veröffentlichen, Mails, Bestellungen), (4) aussichtslose Vorgabe (der
  Katalog-Eintrag lässt sich nach den Grundsätzen nicht als Spiel bauen – dann parken statt fragen, wenn eine
  Prüfung das belegt). Alles andere entscheidest du nach den Dokumenten und schreibst Annahmen in den Entwurf.
- **Kosten nach jedem Agenten** (bauen, prüfen, Review, auch jede Fortsetzung mit SendMessage) sofort eintragen,
  siehe „Kosten“. Kein Agent ohne Eintrag.
- **Nie pushen.** Merge nur in das lokale `main`.

## Wo was liegt

| Was | Wo |
|---|---|
| Katalog-Eintrag | `docs/spielkatalog/<teil>.md` „### <Id> <Name>“; Welt: `docs/spielkatalog/welten.md`; Vorrang: `docs/spielkatalog.md` §8a |
| Fach aus der Id | M → `mathe`, R → `geometrie`, L → `lesen`, Z → `sprechen`, S → `schreiben`, G → `grammatik` (Spalte „Fach“ in `docs/spielkatalog.md` §5) |
| Spielordner | `spiele/<fach>/<id klein>-<name>/` (Name aus der Überschrift, klein, ä→ae, ö→oe, ü→ue, ß→ss, Bindestriche), z. B. M15 „Mach voll“ → m15-mach-voll |
| Entwurf | `docs/spiele/<fach>/<id klein>-<name>.md` |
| Vorlage | `spiele/vorlage/` (Kopf von `spiele/vorlage/spiel.js`: Schritte 1–7, „../“ → „../../“) |
| Prüfstand | `tests/browser/durchspielen.mjs`, `tests/browser/pruefkopie.mjs`, Playwright mit `NODE_PATH=/private/tmp/claude-501/pw/node_modules` |
| Objekte | `spiele/objekte/objekt.js`, Vorschau `spiele/rahmen/vorschau.html?objekte` |
| Kosten | `werkzeuge/kosten/kosten.mjs` (`trageEin`), Bericht `npm run kosten` |
| Vorlagen der Aufträge | neben dieser Datei: `bauen.md`, `pruefung-a.md`, `pruefung-b-didaktik.md`, `pruefung-b-welt.md`, `pruefung-b-bedienung.md`, `abschluss-review.md` |

## Aufträge an Agenten

- Text **unter der Linie** (`---`) der Vorlage schicken, Platzhalter gefüllt; bei `bauen.md` den gemeinsamen Teil plus
  einen Abschnitt. Platzhalter: `{{ID}}`, `{{NAME}}`, `{{WORKTREE}}`, `{{BRANCH}}`, `{{SPIELORDNER}}`,
  `{{ORDNERNAME}}`, `{{SEITE}}` (`spiele/<fach>/<spiel>/index.html`), `{{ENTWURF}}`, `{{PRUEFUNGEN}}`
  (`docs/spiele/<fach>/<spiel>.pruefungen.md`), `{{KATALOG_DATEI}}`, `{{BILDER}}`, `{{STADIUM}}` (Prototyp/Ausbau),
  `{{RUNDE}}`, `{{BEFUNDE}}`, `{{VORIGE_BEFUNDE}}` (Runde 1 leer; sonst wie im Kopf der Vorlage).
- **Urteil lesen:** Rot ist, was rot ist – steht „GRÜN“ über einer roten Pflichtzeile oder einem kritischen Befund,
  gilt rot. Fehlt die Tabelle oder der Beleg je Zeile, zählt die Antwort nicht: neuer Prüfer, keine neue Runde.
- Prüfer ändern nichts. Hat einer doch Dateien geändert (`git status`), die Änderung verwerfen
  (`git restore` nur dieser Dateien) und den Bericht nicht werten.

## 0. Start

1. Katalog-Eintrag finden (Id, Teil-Datei, Fach, Ordnername). Gibt es die Id nicht oder liegt
   `docs/spiele/<fach>/<spiel>.md` schon mit „Geparkt“ vor (auf `main` oder im Branch `spiel-<id klein>`): nichts
   bauen, Christian melden (kein neuer Versuch ohne seine Entscheidung, §7).
2. Worktree vom lokalen `main` (Hauptrepo = Verzeichnis über `git rev-parse --git-common-dir`):
   ```bash
   git -C <Hauptrepo> worktree add <Hauptrepo>/.worktrees/spiel-<id klein> -b spiel-<id klein> main
   cd <Hauptrepo>/.worktrees/spiel-<id klein> && npm ci && ln -s <Hauptrepo>/.env .env
   npm test
   ```
   Gibt es den Branch schon (abgebrochener Lauf), dort weitermachen statt neu anlegen. `npm test` muss vor dem
   ersten Schritt grün sein; ist er auf `main` rot, ist das nicht dein Spiel: melden und anhalten (Grund 4).
3. **Mit echten Dingen parallel:** Hauptthemen des Eintrags, die in `spiele/lernplan.json` stehen und noch keine
   Datei `spiele/mit-echten-dingen/<fach>/<thema>.md` haben, an einen Agenten im Hintergrund geben: „Lies
   `.claude/skills/mit-echten-dingen/SKILL.md` und führe ihn aus für <Themen>. Arbeitsordner <Worktree>. Ändere nur
   `spiele/mit-echten-dingen/`, committe nur diese Pfade, trage die Kosten dort ein, starte keine weiteren Agenten
   außer den Prüfern, die der Skill verlangt. Committe mit `git commit -- <pfade>`; meldet Git `index.lock`, kurz
   warten und wiederholen (im selben Worktree baut ein anderer Agent).“ Sein Ergebnis gehört vor das
   Abschluss-Review.

## 1. Entwurf → Prüfung A

1. Bau-Agent mit `bauen.md`, Abschnitt **Entwurf**. Ergebnis: `docs/spiele/<fach>/<spiel>.md` mit allen elf
   Pflichtteilen aus `docs/spielentwicklung.md` §1, committet.
2. Prüfer mit `pruefung-a.md` (frisch). Rot → Befunde an den Bau-Agenten (SendMessage, Abschnitt **Befunde
   umsetzen**), dann wieder ein **neuer** Prüfer mit den vorigen Befunden. Höchstens 3 Runden.
3. Den Prüfbericht jeder Runde knapp in `docs/spiele/<fach>/<spiel>.pruefungen.md` festhalten (Prüfung, Runde,
   grün/rot je Kriterium, offene Befunde) und committen. Prüfer lesen diese Datei nicht; sie bekommen nur die
   Befunde der letzten Runde.

## 2. Prototyp → Prüfstand B

1. Bau-Agent (`bauen.md`, **Prototyp**): Kopie der Vorlage, eine Stufe, eine Runde, Systemstimme, Figur als
   Platzhalter, schlichte Welt-Fläche, Test-Schnittstelle, Eintrag in `spiele/spiele.json`. Lädt
   `frontend-design:frontend-design` vor der UI-Arbeit.
2. **B-Spielbarkeit** führst du selbst aus (kein Urteil, nur Ausgabe):
   ```bash
   NODE_PATH=/private/tmp/claude-501/pw/node_modules node tests/browser/durchspielen.mjs \
     spiele/<fach>/<spiel>/index.html --bilder <Scratchpad>/b-<n>/bilder --bericht <Scratchpad>/b-<n>/bericht.json
   npm test
   ```
   (Bilder und Bericht ins Scratchpad der Sitzung, nicht ins Repo.) Grün = Exit 0 beider Befehle, kein Rot im Bericht.
3. Drei frische Prüfer **parallel**: `pruefung-b-didaktik.md`, `pruefung-b-welt.md` (mit dem Bilder-Ordner),
   `pruefung-b-bedienung.md` (mit dem Bilder-Ordner).
4. Grün = alle vier grün. Sonst alle Befunde gesammelt an den Bau-Agenten, danach **alle vier** neu (neue Prüfer),
   höchstens 3 Runden. Prüfberichte wie oben in `<spiel>.pruefungen.md`.

## 3. Ausbau

Erst nach grünem Prüfstand. Bau-Agent (`bauen.md`, **Ausbau**) nach `docs/spielentwicklung.md` §5: alle Stufen des
Eintrags (Umfang nach `docs/spielkatalog.md` §8a), Spielobjekte als animierte SVG im Stil der Runde, Regal-Bild,
Szenenbild, Texte als Daten, Einführung, Regal-Material, `spiele.json` vollständig.

- **Bilder:** nur `node werkzeuge/bilder/erzeugen.mjs --spiel <spielordner> <ziel> "<Szene>"` (trägt die Kosten ein).
- **Audio** erzeugst du selbst, nachdem der Bau-Agent die Texte committet hat: nur `npm run audio`; vorher die
  Einträge in `<spielordner>/kosten.json` zählen, danach prüfen, dass ein Eintrag `posten: stimme` dazukam (oder die
  Ausgabe 0 neue Zeichen meldet), dann `spiele/audio/` und `kosten.json` committen. Fehlt der Schlüssel: Texte trotzdem
  fertig, „Audio nicht erzeugt“ in die Schlussmeldung. **Anhören ist Christians Sache:** die neuen Texte wörtlich
  sammeln (aus `texte.json`) für die Schlussmeldung; `npm run audio:anhoeren` nicht selbst abnehmen.
- Danach: B-Spielbarkeit erneut (alle Kinder, beide Browser, beide Größen) und `tests/browser/pruefkopie.mjs` nur, wenn
  der Ausbau Bausteine in `spiele/rahmen/` oder `spiele/objekte/` geändert hat; **B-Welt erneut** mit Bildern je
  Bewegungszustand der Objekte (`?objekte`-Vorschau) und `pruefung-b-bedienung.md` erneut. Rot → Befunde, höchstens
  3 Runden, dann parken.

## 4. Abschluss-Review und Merge

1. Ergebnis von „Mit echten Dingen“ abwarten (geparkte Anleitungen halten das Spiel nicht auf, stehen aber in der
   Meldung).
2. `git merge main` im Spiel-Branch (andere Spiele können `spiele.json` geändert haben; Konflikte additiv lösen),
   dann `npm test` und B-Spielbarkeit erneut grün.
3. Frischer Reviewer mit `abschluss-review.md` über `git diff main...HEAD`. Rot → Befunde an den Bau-Agenten,
   neuer Reviewer, höchstens 3 Runden.
4. **Merge nur, wenn** Abschluss-Review grün, `npm test` grün, Durchspielen grün, letzte B-Prüfer grün:
   - Ist `main` in einem Worktree ausgecheckt (`git worktree list`): dort `git status --short` muss leer sein, dann
     `git -C <main-worktree> merge --ff-only spiel-<id>` (geht kein Fast-Forward: erst Schritt 2 wiederholen).
     Ist er nicht sauber: anhalten (Grund 1).
   - Sonst: `git -C <Hauptrepo> fetch . spiel-<id>:main` (nur Fast-Forward).
   - Danach Worktree entfernen und Branch mit `git branch -d` löschen. Nie pushen.

## Kosten

Nach **jedem** Agenten, aus seiner Rückmeldung (Modell, Token). Meldet sie nur eine Gesamtzahl: `eingabe` = Gesamt,
`ausgabe` = 0, `notiz` „nur Gesamt gemeldet“.

```bash
node -e '
import("./werkzeuge/kosten/kosten.mjs").then(({ trageEin }) => trageEin("spiele/mathe/m15-mach-voll", {
  datum: "2026-11-14", phase: "pruefung-a", posten: "claude", modell: "claude-opus-5-5",
  eingabe: 52000, ausgabe: 4100, menge: 56100, einheit: "tokens", notiz: "Runde 2, Prüfer A" }))'
```

Phasen: `entwurf`, `pruefung-a`, `prototyp`, `pruefung-b`, `ausbau`, `review`. Der Spielordner darf vor dem Prototyp
noch leer sein (`trageEin` legt ihn an). Bilder und Stimme tragen die Werkzeuge selbst ein. `kosten.json` committen.

## Parken

Bleibt eine Prüfung (A, B, Ausbau-Prüfung oder Abschluss-Review) nach 3 Runden rot (`docs/spielentwicklung.md` §7)
oder belegt eine Prüfung, dass die Vorgabe aussichtslos ist:

1. In `docs/spiele/<fach>/<spiel>.md` Abschnitt **„Geparkt“**: Datum, welche Prüfung, offene Befunde je Kriterium
   mit Beleg, was eine Entscheidung von Christian lösen könnte (z. B. Katalog-Eintrag ändern).
2. Kosten-Eintrag `{ posten: "status", phase: "geparkt", einheit: "keine", menge: 0, … }` im Spielordner.
3. Committen; Branch und Worktree bleiben. Kein Merge, kein weiterer Versuch.

## Schlussmeldung (deine letzte Nachricht)

Kurz, für Christian:

- **Spiel:** Id, Name, Ordner, Branch; **gemergt** (Commit auf `main`) oder **geparkt** (Prüfung, Runde).
- **Belege:** je Prüfung die Runden mit grün/rot (A, B-Didaktik, B-Welt, B-Spielbarkeit mit Zahl der grünen Läufe,
  B-Bedienung, Abschluss-Review); bei Parken die offenen Befunde.
- **Anhören:** Liste der neuen Texte wörtlich (oder „Audio nicht erzeugt“), Aufruf `npm run audio:anhoeren`.
- **Mit echten Dingen:** welche Anleitungen entstanden, welche geparkt.
- **Kosten:** Summe aus `npm run kosten` für dieses Spiel.
- **Stichprobe (Annahme):** Bei gemergten Spielen mit Wahrscheinlichkeit 1 zu 5
  (`node -e 'console.log(Math.random() < 0.2)'`) „Stichprobe – bitte ansehen“ mit dem Pfad der Seite; sonst nichts.

## Häufige Fehler

| Fehler | Richtig |
|---|---|
| Prüfer aus Runde 1 nach der Überarbeitung wieder fragen | neuer Agent je Runde, vorige Befunde mitgeben |
| Bau-Agent „prüft selbst“ und meldet grün | grün gibt nur ein frischer Prüfer bzw. der Prüfstand |
| Kosten am Ende schätzen | nach jedem Agenten aus seiner Rückmeldung |
| Christian nach Geschmack fragen | entscheiden, Annahme in den Entwurf schreiben |
| Nach Runde 3 „noch eine kleine Runde“ | parken |
| Audio erzeugt und als „angehört“ gemeldet | Anhören bleibt bei Christian |
