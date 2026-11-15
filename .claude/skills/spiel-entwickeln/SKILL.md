---
name: spiel-entwickeln
description: Verwenden, wenn ein Spiel aus dem Spielkatalog entstehen soll – Aufruf „Spiel entwickeln <Katalog-Id> [--basis <branch>]“ (z. B. „Spiel entwickeln M15“). Führt genau ein Spiel vom Katalog-Eintrag bis zum Merge nach main oder parkt es, auf dem Schnellweg (nur vorhandene Bausteine) oder dem vollen Weg (neue Mechanik, neues Lernzeichen oder Bedienteil); Prüfer und Bau-Agenten sind je Runde frisch.
---

# Spiel entwickeln

Verbindlich, ganz: `docs/spielentwicklung.md` (Ablauf, Zwei Wege, §1–§7, Ablage, Spielobjekte, Kosten, Parken). Dazu
`docs/grundsaetze.md`, `docs/grundsaetze-bilder.md`, `docs/figuren.md`, `docs/stimme.md`, `docs/bedienung.md`,
`docs/mit-echten-dingen.md`, `docs/spielkatalog.md` und `docs/spielkatalog/*.md`. Steht hier etwas anderes als dort,
gilt das Dokument; den Skill dann anpassen.

**Ein Spiel je Lauf.** Du steuerst: Du lässt bauen und prüfen, du entscheidest grün/rot nach den Prüfberichten, du
trägst die Kosten ein. Du baust nicht selbst und prüfst nicht selbst.

## Grundregeln

- **Prüfer sind immer frische Agenten**, die nicht gebaut haben, je Runde ein **neuer** Prüfer. Sie bekommen nur,
  was die Vorlage nennt (nie die Überlegungen der Bauenden). Jeder liefert grün/rot je Kriterium mit Beleg.
- **Grün** = alle Pflichtkriterien grün und kein kritischer Befund; „(Soll)“ darf rot sein, wenn der Grund im Entwurf
  steht. **Höchstens 3 Runden je Prüfung** im vollen Weg, **höchstens 2 Runden** im Schnellweg, dann parken
  („Parken“ unten).
- **Christian wird während des Laufs nicht gefragt.** Anhalten und fragen nur bei: (1) etwas Zerstörerischem
  (Löschen fremder Arbeit, Force-Push, `reset --hard` auf fremden Branches, schmutziger `main`-Worktree),
  (2) Sicherheit (Schlüssel, Zugangsdaten, Plattform-Zugriff außerhalb `kern/`), (3) Wirkung nach außen über den
  Merge in das lokale `main` hinaus (Push, Veröffentlichen, Mails, Bestellungen), (4) aussichtslose Vorgabe (der
  Katalog-Eintrag lässt sich nach den Grundsätzen nicht als Spiel bauen – dann parken statt fragen, wenn eine
  Prüfung das belegt). Alles andere entscheidest du nach den Dokumenten und schreibst Annahmen in den Entwurf.
- **Freigabe nötig:** Braucht das Spiel ein neues Lernzeichen oder Bedienteil (`docs/spielkatalog.md` §8a) oder eine
  offene Frage aus `docs/grundsaetze-bilder.md` §15, entscheidet der Entwurf sie als **(Annahme)**; gebaut und geprüft
  wird normal, aber **nicht gemergt**: am Ende parken mit Grund „Freigabe nötig“ und der konkreten Frage.
- **Kosten nach jedem Agenten** (bauen, prüfen, Review, Wiederholung, jede Fortsetzung eines Schreib-Agenten), siehe
  „Kosten“. Kein Agent ohne Eintrag.
- **Nie pushen.** Merge nur in das lokale `main`, und nur ohne `--basis` (Probelauf mergt nie).
- **Modelle** (Agent-Werkzeug, Feld `model`):

  | Agent | Schnellweg | voller Weg |
  |---|---|---|
  | Bau-Agent Entwurf | `sonnet` | `sonnet` (derselbe Entwurf, er entscheidet den Weg) |
  | Bau-Agent Spiel (jede Runde) | `sonnet` | Standardmodell der Sitzung |
  | Prüfer (Schnellweg-Prüfung, A, B, Abschluss-Review) | `opus` | Standardmodell, nie kleiner als der Bau-Agent |
  | Schreib-Agent und Prüfer E der Anleitungen | `sonnet` | `sonnet` |

  Nie ein kleines Modell (`haiku`).
- **Je Runde ein neuer Bau-Agent, nie fortsetzen.** Ein fortgesetzter Bau-Agent liest bei jedem Zug seinen ganzen
  Kontext neu (im Probelauf M14 rund 380 000 Token je Zug, 8,9 Millionen Cache-Token für eine Runde Befunde). Jede
  Runde, jede Phase und jedes „Befunde umsetzen“ bekommt einen **neuen** Bau-Agenten mit dem Gemeinsamen Teil, dem
  Abschnitt seiner Phase und den Befunden; den Stand findet er im Branch und im Entwurf. Kein SendMessage an
  Bau-Agenten des Spiels. Grüne Hinweise der letzten Prüfung gehen als „Hinweise aus Prüfung …“ mit.

## Wo was liegt

| Was | Wo |
|---|---|
| Katalog-Eintrag | `docs/spielkatalog/<teil>.md` „### <Id> <Name>“; Welt: `docs/spielkatalog/welten.md`; Vorrang: `docs/spielkatalog.md` §8a |
| Fach aus der Id | M → `mathe`, R → `geometrie`, L → `lesen`, Z → `sprechen`, S → `schreiben`, G → `grammatik` (Spalte „Fach“ in `docs/spielkatalog.md` §5) |
| Spielordner | `spiele/<fach>/<id klein>-<name>/` (Name aus der Überschrift, klein, ä→ae, ö→oe, ü→ue, ß→ss, Bindestriche), z. B. M15 „Mach voll“ → m15-mach-voll |
| Entwurf, Prüfberichte | `docs/spiele/<fach>/<spiel>.md`; Berichte erst beim Merge/Parken nach `docs/spiele/<fach>/<spiel>.pruefungen.md` |
| Arbeitsablage des Laufs | `<Hauptrepo>/.superpowers/spiele/<id klein>/` (nicht im Repo): `runde-<prüfung>-<n>.md` je Prüfbericht, `kosten-stand.json`, `b-<runde>/` (Bilder, Bericht) |
| Vorlage | `spiele/vorlage/` (Kopf von `spiele/vorlage/spiel.js`: Schritte 1–7, „../“ → „../../“, `?stufe` im Testbetrieb) |
| Prüfstand | `tests/browser/durchspielen.mjs` (`--stufe`), `tests/browser/pruefkopie.mjs`, `tests/browser/objektbilder.mjs`; Playwright mit `NODE_PATH=/private/tmp/claude-501/pw/node_modules` |
| Kosten | `werkzeuge/kosten/transkript.mjs` (bucht aus dem Agenten-Transkript), `werkzeuge/kosten/kosten.mjs`, Bericht `npm run kosten` |
| Vorlagen der Aufträge | neben dieser Datei: `bauen.md`; Schnellweg `pruefung-schnell.md`; voller Weg `pruefung-a.md`, `pruefung-b-didaktik.md`, `pruefung-b-welt.md`, `pruefung-b-bedienung.md`, `abschluss-review.md`; Anleitungen `pruefung-e.md` |

## Aufträge an Agenten

- Text **unter der Linie** (`---`) der Vorlage schicken, Platzhalter gefüllt; bei `bauen.md` den gemeinsamen Teil plus
  einen Abschnitt. Platzhalter: `{{ID}}`, `{{NAME}}`, `{{WORKTREE}}`, `{{BRANCH}}`, `{{BASIS}}` (`main` oder
  `--basis`), `{{SPIELORDNER}}`, `{{ORDNERNAME}}`, `{{SEITE}}` (`spiele/<fach>/<spiel>/index.html`), `{{ENTWURF}}`,
  `{{PRUEFUNGEN}}` (die Arbeitsablage des Laufs), `{{KATALOG_DATEI}}` (die Teil-Datei des Katalogs, z. B.
  `docs/spielkatalog/mathe.md`), `{{BILDER}}` (Ordner `b-<runde>/bilder` aus dem Durchspielen dieser Runde),
  `{{STADIUM}}` (Prototyp oder Ausbau), `{{STUFEN}}` (Lernstufen des Spiels), `{{RUNDE}}`, `{{BEFUNDE}}`,
  `{{VORIGE_BEFUNDE}}` (Runde 1 leer; sonst wie im Kopf der Vorlage), `{{BERICHT}}` (Datei des Prüfberichts in der
  Arbeitsablage, z. B. `runde-a-2.md`), für `pruefung-e.md` außerdem `{{THEMA}}`, `{{FACH}}` und `{{DATEI}}` (Dateiname ohne `.md`; Einzelthema = `{{THEMA}}`) (`{{WORKTREE}}` ist
  dort der Worktree der Anleitungen).
- **Befunde** für „Befunde umsetzen“: die roten Zeilen und kritischen Befunde wörtlich, dazu die Hinweise des Prüfers
  zu grünen Zeilen (als solche gekennzeichnet).
- **Urteil lesen:** Rot ist, was rot ist – steht „GRÜN“ über einer roten Pflichtzeile oder einem kritischen Befund,
  gilt rot. Fehlt die Tabelle oder der Beleg je Zeile, ist die Antwort ungültig: **höchstens eine** Wiederholung je
  Runde mit einem neuen Prüfer (auch sie wird gebucht); eine gültige Antwort wird nie durch eine neue ersetzt. Ist
  auch die Wiederholung ungültig, gilt die Runde als rot.
- Jeden Prüfbericht wörtlich als `runde-<prüfung>-<n>.md` in die Arbeitsablage (nicht in den Worktree): Der Prüfer
  schreibt ihn selbst dorthin (`{{BERICHT}}`); du vergleichst die Datei mit seiner Rückmeldung und schreibst sie nur
  neu, wenn sie fehlt oder abweicht. Namen: `runde-a-<n>.md`, `runde-b-<n>-didaktik.md` (`-welt`, `-bedienung`),
  `runde-b-<n>-spielbarkeit.md` (Ausgabe des Durchspielens), `runde-ba-<n>-….md` (Ausbau-Prüfung),
  im Schnellweg `runde-s-<n>.md` (Prüfung) und `runde-s-<n>-spielbarkeit.md` (Durchspielen),
  `runde-review-<n>.md`, `runde-e-<thema>-<n>.md`.
- Prüfer ändern nichts. Hat einer doch Dateien geändert (`git status`), die Änderung verwerfen
  (`git restore` nur dieser Dateien) und den Bericht nicht werten (zählt als ungültig).
- **Wer baut, bucht welche Phase:** Bau-Agent des Entwurfs (auch Befunde aus Prüfung A) `entwurf`, in Prüfstand B
  `prototyp`, ab dem Ausbau (auch Befunde aus Ausbau-Prüfung und Abschluss-Review) `ausbau`; Prüfer A `pruefung-a`,
  Prüfer B `pruefung-b` (auch nach dem Ausbau), Abschluss-Reviewer `review`. Schnellweg: Bau-Agent des Spiels
  `ausbau`, Prüfer `review`.
- **Lange Aufträge:** Statt des ganzen Texts darfst du die gefüllte Vorlage als Datei in die Arbeitsablage legen
  (`auftrag-<prüfung>-<n>.md`) und dem Agenten nur „Lies `<Pfad>` und führe den Auftrag aus“ schicken.

## 0. Start

1. Aufruf lesen: Id und `--basis <branch>` (Vorgabe `main`). Mit `--basis` ist es ein **Probelauf**: alles wie unten,
   aber nichts wird nach `main` gemergt oder geschrieben (Spiel, Anleitungen, geparkte Kosten bleiben in den Branches).
2. Katalog-Eintrag finden (Id, Teil-Datei, Fach, Ordnername). Gibt es die Id nicht oder liegt
   `docs/spiele/<fach>/<spiel>.md` mit „Geparkt“ schon auf der Basis oder im Branch `spiel-<id klein>`, oder liegt
   `werkzeuge/kosten/geparkt/<spiel>.json` auf der Basis: nichts bauen, Christian melden (§7).
3. `Hauptrepo` = `git rev-parse --path-format=absolute --git-common-dir` ohne das letzte `/.git`. Die Basis muss
   den Prüfstand haben: `git -C <Hauptrepo> cat-file -e <basis>:<pfad>` für `tests/browser/durchspielen.mjs`,
   `werkzeuge/kosten/kosten.mjs`, `werkzeuge/kosten/transkript.mjs`, `.claude/skills/spiel-entwickeln/SKILL.md`.
   Fehlt einer: anhalten und melden (Grund 4).
4. Worktree:
   ```bash
   git -C <Hauptrepo> worktree add <Hauptrepo>/.worktrees/spiel-<id klein> -b spiel-<id klein> <basis>
   cd <Hauptrepo>/.worktrees/spiel-<id klein> && npm ci && ln -s <Hauptrepo>/.env .env && npm test
   mkdir -p <Hauptrepo>/.superpowers/spiele/<id klein>
   ```
   `npm test` muss grün sein; ist er auf der Basis rot: melden und anhalten (Grund 4).
5. **Wiederaufnahme** (Branch oder Arbeitsablage gibt es schon): dort weitermachen, nicht neu anlegen. Die Runden
   zählen aus den `runde-*.md` der Arbeitsablage; ein **neuer** Bau-Agent bekommt den Entwurf und die Befunde der
   letzten Runde (der alte Kontext ist weg).
6. **Mit echten Dingen** starten (Abschnitt unten), parallel zum Spiel.

## 1. Entwurf und Entscheidung

1. Bau-Agent (`sonnet`) mit `bauen.md`, Abschnitt **Entwurf**. Ergebnis: `docs/spiele/<fach>/<spiel>.md` als
   Pflichtliste mit den elf Teilen aus `docs/spielentwicklung.md` §1 (Teil 11 mit Figur des Spiels und
   `karte`-Eintrag) und dem Abschnitt „Bausteine“, committet.
2. **Weg entscheiden** – du selbst, nach dem Abschnitt „Bausteine“ und „Freigabe nötig“ des Entwurfs und nach dieser
   Regel (`docs/spielentwicklung.md` „Zwei Wege“, dort die Tabelle, was als vorhanden gilt):

   <!-- regel schnellweg -->
   **Regel:** Schnellweg, wenn der Entwurf keinen Abschnitt „Freigabe nötig“ hat und das Spiel nur Vorhandenes braucht:
   die Bausteine aus `spiele/rahmen/` unverändert, festgelegte Lernzeichen mit Baustein, Aufgabenarten, die es für seine
   Themen schon gibt (`aufgaben` in `spiele/lernplan.json`), Spielobjekte über `spiele/objekte/objekt.js`, und weder
   `spiele/rahmen/`, `spiele/kern/`, `spiele/lernsteuerung.js`, `spiele/objekte/objekt.js`, `spiele/aufgabenarten.js`
   (mit `ZIEL_MS`), die `aufgaben` in `spiele/lernplan.json` noch der RAHMEN von `spiele/vorlage/spiel.js` ändert sich.
   Sonst voller Weg.
   <!-- ende regel -->

   Steht ein Baustein als „vorhanden“ im Entwurf, gibt es ihn aber nicht in `spiele/rahmen/` bzw. als festgelegtes
   Lernzeichen (`docs/grundsaetze-bilder.md` §4/§5, nicht §5a): Er ist neu. Im Zweifel voller Weg. Schreib den Weg
   mit Grund als eine Zeile „Weg: Schnellweg | voller Weg – <Grund>“ in den Kopf des Entwurfs, committe.
3. Schnellweg → Abschnitt **S**. Voller Weg → Prüfung A: Prüfer mit `pruefung-a.md` (frisch). Rot → ein **neuer**
   Bau-Agent (`bauen.md`, Abschnitt **Befunde umsetzen**, Phase Entwurf), dann wieder ein **neuer** Prüfer mit den
   vorigen Befunden. Höchstens 3 Runden; danach weiter mit §2.

## S. Schnellweg

Ziel: 30–60 Minuten und 8–15 € je Spiel, Steuerung eingerechnet. Höchstens **2 Runden**; Runde `<n>` =
Bau → Durchspielen → Prüfung, mit eigenem Ordner `A=<Hauptrepo>/.superpowers/spiele/<id klein>/s-<n>`.

1. **Bau** – ein **neuer** Bau-Agent (`sonnet`) mit `bauen.md`: Gemeinsamer Teil + Abschnitt **Schnellweg**; ab
   Runde 2 zusätzlich **Befunde umsetzen** mit den Befunden der Runde davor. Meldet er, dass er doch etwas Neues
   braucht (neues Bauteil, Änderung in den Pfaden der Regel): Weg im Entwurf auf „voller Weg“ ändern und mit §2
   weitermachen, der gebaute Stand ist der Prototyp.
2. **Durchspielen** – du selbst, kein Urteil, nur Ausgabe:
   ```bash
   NODE_PATH=/private/tmp/claude-501/pw/node_modules node tests/browser/durchspielen.mjs \
     spiele/<fach>/<spiel>/index.html --bilder $A/bilder --bericht $A/bericht.json
   # für jede Lernstufe <id> des Spiels:
   NODE_PATH=/private/tmp/claude-501/pw/node_modules node tests/browser/durchspielen.mjs \
     spiele/<fach>/<spiel>/index.html --stufe <id> --bilder $A/<id>/bilder --bericht $A/<id>/bericht.json
   npm test
   ```
   Ausgabe als `runde-s-<n>-spielbarkeit.md`. Grün = Exit 0 aller Befehle. **Rot → die Runde ist rot**, ohne den
   Prüfer zu starten; die Ausgabe ist der Befund für die nächste Runde.
3. **Prüfung** – ein **neuer** Prüfer (`opus`) mit `pruefung-schnell.md` (`{{BILDER}}` = `$A/bilder`,
   `{{STUFEN}}`, `{{BERICHT}}` = `runde-s-<n>.md`). Er schreibt den Bericht selbst; du liest das Urteil wie in
   „Aufträge an Agenten“.
4. Rot und `<n>` = 1 → Runde 2 ab Schritt 1. Rot nach Runde 2 → parken. **Schnellweg-Prüfung grün** (Durchspielen
   und Prüfung der Runde grün) → **Audio** wie in §3, dann **Abschluss** nach §4 ohne Schritt 3 (die
   Schnellweg-Prüfung ist das Review): Mit echten Dingen, `git merge <basis>`, Merge-Schritte 4 und 5. Ändert der
   Merge der Basis Dateien des Spiels oder `spiele.json` über einen additiven Konflikt hinaus, zählt das als neue
   Runde (Schritt 2 und 3): nach Runde 1 als Runde 2; ist das schon Runde 2, gibt es keine dritte → parken.
5. In der Schlussmeldung Laufzeit (Start bis Merge) und Kosten des Spiels; liegt eines über dem Ziel, den teuersten
   Agenten nennen.

## 2. Prototyp → Prüfstand B (voller Weg)

1. Bau-Agent (`bauen.md`, **Prototyp**). Er lädt `frontend-design:frontend-design` vor der UI-Arbeit.
2. **B-Spielbarkeit** führst du selbst aus (kein Urteil, nur Ausgabe), Runde `<n>`:
   ```bash
   A=<Hauptrepo>/.superpowers/spiele/<id klein>/b-<n>
   NODE_PATH=/private/tmp/claude-501/pw/node_modules node tests/browser/durchspielen.mjs \
     spiele/<fach>/<spiel>/index.html --bilder $A/bilder --bericht $A/bericht.json
   npm test
   ```
   Grün = Exit 0 beider Befehle. **Rot → zuerst zurück an den Bau-Agenten** (Ausgabe als Befund), ohne die drei
   Prüfer zu starten; das zählt als Runde von Prüfstand B.
3. Bei grünem Durchspielen drei frische Prüfer **parallel**: `pruefung-b-didaktik.md`, `pruefung-b-welt.md`,
   `pruefung-b-bedienung.md` (beide mit `{{BILDER}}`).
4. Grün = alle vier grün. Sonst alle Befunde gesammelt an einen **neuen** Bau-Agenten (Abschnitt **Befunde
   umsetzen**, Phase Prototyp), danach wieder ab Schritt 2 (neue Prüfer), höchstens 3 Runden.

## 3. Ausbau (voller Weg)

Erst nach grünem Prüfstand. Bau-Agent (`bauen.md`, **Ausbau**) nach `docs/spielentwicklung.md` §5. Danach du:

- **Audio:** nur `npm run audio -- --spiel <spielordner>` (bucht die Zeichen); danach prüfen, dass in
  `<spielordner>/kosten.json` ein Eintrag `posten: stimme` dazukam (oder die Ausgabe 0 neue Zeichen meldet), dann
  `spiele/audio/` und `kosten.json` committen. Fehlt der Schlüssel: „Audio nicht erzeugt“ in die Schlussmeldung.
  **Anhören ist Christians Sache:** die neuen Texte wörtlich sammeln (aus `texte.json`); nichts als angehört melden.
- **Ausbau-Prüfung** (eine Prüfung, höchstens 3 Runden, Runde `<n>` mit eigenem `b-a<n>/`):
  - Durchspielen wie oben, dazu **jede Lernstufe einzeln**: `… durchspielen.mjs <seite> --stufe <id> --bilder
    $A/<id>/bilder --bericht $A/<id>/bericht.json` für jede Stufe des Spiels; dazu `npm test`. Rot → zuerst an den
    Bau-Agenten.
  - Hat der Ausbau `spiele/rahmen/`, `spiele/objekte/` oder `spiele/lernsteuerung.js` geändert: `pruefkopie.mjs` in
    einem eigenen Worktree, damit die Kopie keinem Bau-Agenten in den Weg kommt:
    `git worktree add --detach <Scratchpad>/pruefkopie HEAD`, dort `NODE_PATH=… node tests/browser/pruefkopie.mjs`,
    danach `git worktree remove <Scratchpad>/pruefkopie`.
  - Drei frische Prüfer parallel: `pruefung-b-didaktik.md` (`{{STADIUM}}` Ausbau, `{{STUFEN}}`),
    `pruefung-b-welt.md` (macht die Bilder der Objektzustände selbst mit `tests/browser/objektbilder.mjs`, dazu den
    Silhouettentest der Karten des Fachs, W-Karte),
    `pruefung-b-bedienung.md`.
  - Rot → Befunde an einen neuen Bau-Agenten; nach 3 Runden rot: parken.

## 4. Abschluss-Review und Merge

1. **Mit echten Dingen** muss gemergt oder geparkt sein (geparkte Anleitungen halten das Spiel nicht auf).
2. `git merge <basis>` im Spiel-Branch (andere Spiele können `spiele.json` geändert haben; Konflikte additiv lösen).
   Das ist keine Runde; Befunde, die daraus folgen, zählen zur nächsten Runde des Abschluss-Reviews.
3. Frischer Reviewer mit `abschluss-review.md` über `git diff <basis>...HEAD` (nur voller Weg). Rot → Befunde an einen neuen Bau-Agenten,
   neuer Reviewer, höchstens 3 Runden. Ändert eine Korrektur danach UI-Teile oder `spiel.js`, den passenden B-Prüfer
   (Bedienung bzw. Didaktik/Welt) noch einmal frisch laufen lassen, bevor das Review wiederholt wird.
4. **Freigabe nötig** (Grundregeln) oder Probelauf: hier aufhören → parken bzw. Probelauf-Meldung.
5. Merge, nur wenn Abschluss-Review grün und die letzten B-Prüfer grün:
   1. Prüfberichte aus der Arbeitsablage nach `docs/spiele/<fach>/<spiel>.pruefungen.md` (je Prüfung und Runde,
      wörtlich), Steuerung buchen („Kosten“), `npm run kosten`, committen.
   2. **Auf genau diesem Commit** `npm test` und Durchspielen (alle Kinder, beide Browser, beide Größen) grün.
   3. Ist `main` in einem Worktree ausgecheckt (`git worktree list`): dort muss `git status --short` leer sein, dann
      `git -C <main-worktree> merge --ff-only spiel-<id klein>`; sonst `git -C <Hauptrepo> fetch . spiel-<id klein>:main`.
      Geht kein Fast-Forward: zurück zu Schritt 2. Ist der `main`-Worktree nicht sauber: anhalten (Grund 1).
   4. `git -C <Hauptrepo> rev-parse main` muss gleich dem geprüften Commit sein. Danach Worktree entfernen,
      `git branch -d spiel-<id klein>`. Nie pushen.

## Mit echten Dingen (eigener Branch)

- **Themen:** die Hauptthemen des Eintrags, die in `spiele/lernplan.json` stehen und für die
  keine Datei in `spiele/mit-echten-dingen/<fach>/` trägt (`thema:` oder `themen:` einer Familie, siehe
  `.claude/skills/mit-echten-dingen/SKILL.md` §0) **oder** deren Datei `entwurf: true` ohne `geparkt` im Kopf hat. Höchstens
  **5** je Lauf: zuerst vorhandene Entwürfe (`entwurf: true`, sie brauchen nur noch die Prüfung), dann die fehlenden
  Themen der Einstiegsklasse in der Reihenfolge des Eintrags; die übrigen stehen als offen in der Schlussmeldung.
- **Worktree:** `git -C <Hauptrepo> worktree add <Hauptrepo>/.worktrees/echte-dinge-<id klein> -b
  echte-dinge-<id klein> <basis>`. Der Bau-Agent des Spiels fasst `spiele/mit-echten-dingen/` nie an.
- **Ablauf je Thema** nach `.claude/skills/mit-echten-dingen/SKILL.md`, gesteuert von dir: ein Schreib-Agent (Auftrag:
  „Lies `.claude/skills/mit-echten-dingen/SKILL.md`, führe §1–§3a für <Thema> aus, Arbeitsordner <Worktree>, keine
  Unteragenten, keine Kosten buchen; committe nur deine Datei, ein neues Objekt in `spiele/objekte/` (Bild der Karte)
  und die beiden Verzeichnisse (`npm run echte-dinge` direkt vor dem Commit), nie die `kosten.json` der
  Anleitungen.“). Liegt die Datei schon als Entwurf vor, entfällt dieser Schritt: gleich prüfen, der Schreib-Agent
  kommt erst mit Befunden dazu; fehlt dem Entwurf `bild` im Kopf, macht er vorher nur §3a. Dann die
  Prüfung E1–E11 mit **frischen** Prüfern nach `pruefung-e.md`, die du startest, höchstens 3 Runden; rote Befunde per
  SendMessage an denselben Schreib-Agenten (überarbeiten, Tests, committen). §5.1 nach grüner Prüfung lässt du den
  Schreib-Agenten machen (`entwurf: true` löschen, `npm run echte-dinge`, `npm test`, committen), bei Rot nach Runde
  3 `geparkt: true`. Die Schreib-Agenten laufen **nacheinander**, nie parallel: Sie teilen den Worktree, und
  `npm run echte-dinge` schreibt dieselben Verzeichnisse (ein Thema nach dem anderen, das nächste erst nach dem
  Commit des vorigen).
- **Kosten** bucht du im Worktree der Anleitungen mit `werkzeuge/kosten/transkript.mjs` wie in „Kosten“, je Agent mit
  der Thema-Id und immer mit `--stand`: `--ordner spiele/mit-echten-dingen --phase schreiben|pruefung --thema
  <thema-id> --stand <Hauptrepo>/.superpowers/spiele/<id klein>/kosten-stand-echte-dinge.json` (der Schreib-Agent recherchiert und schreibt in einem Transkript:
  `schreiben`; `recherche` nur, wenn ein eigener Agent recherchiert). Mit `--thema` zählt der Bericht jedes Thema
  einmal, egal wie viele Runden es gebucht haben. `kosten.json` committest du (nach jedem grünen oder geparkten
  Thema).
- **Merge** (nicht im Probelauf), unabhängig vom Spiel, sobald alle Themen grün oder geparkt sind: im Branch
  `git merge <basis>`, `npm run echte-dinge`, `npm test`, committen, dann Fast-Forward nach `main` wie in §4.5.3.
  Klappt das nicht: den Branch vor §4 Schritt 2 in den Spiel-Branch mergen.

## Kosten

Nach **jedem** Agenten aus seinem Transkript buchen; die Agent-Id steht in der Rückmeldung des Agenten-Werkzeugs:

```bash
T=$(ls ~/.claude/projects/-Users-christian-Code-einhorn-lernspiele*/*/subagents/agent-<agentId>.jsonl)
node werkzeuge/kosten/transkript.mjs "$T" --ordner spiele/<fach>/<spiel> --phase pruefung-a \
  --notiz "Prüfer A, Runde 2" --stand <Hauptrepo>/.superpowers/spiele/<id klein>/kosten-stand.json
```

- Das Werkzeug zählt Eingabe, Ausgabe, Cache lesen und Cache schreiben genau. Mit `--stand` bucht es bei einer
  Fortsetzung desselben Agenten (SendMessage) nur den Zuwachs, nie doppelt; deshalb immer mit `--stand`.
- **Steuerung:** deine eigenen Token einmal am Ende (vor dem Merge- bzw. Park-Commit) mit `--phase steuerung` aus
  deinem Transkript, gesucht nur im Projektordner dieses Repos (`~/.claude/projects/-Users-christian-Code-einhorn-lernspiele*/`,
  auch Worktrees): als Hauptsitzung die neueste Sitzung dort,
  `ls -t ~/.claude/projects/-Users-christian-Code-einhorn-lernspiele*/*.jsonl | head -1` (eine Datei je Sitzung,
  keine Unteragenten); läufst du selbst als Unteragent, ist es `…/<sitzung>/subagents/agent-<deine Id>.jsonl` – die
  Id nennen dir Bau-Agenten, die dir per SendMessage antworten, oder `grep -l "<ein Satz aus deinem Aufruf>"
  ~/.claude/projects/-Users-christian-Code-einhorn-lernspiele*/*/subagents/agent-*.jsonl`. Nie das neueste
  Transkript irgendeines Projekts nehmen. Wird später noch weitergesteuert (Wiederaufnahme), bucht
  `--stand` nur den Zuwachs.
- Bilder bucht `werkzeuge/bilder/erzeugen.mjs --spiel`, Stimme `npm run audio -- --spiel`. `kosten.json` committen.
- Der Spielordner darf vor dem Prototyp noch leer sein (das Werkzeug legt ihn an).

## Parken

Bleibt eine Prüfung (A, B, Ausbau-Prüfung, Abschluss-Review) nach 3 Runden rot, im Schnellweg Prüfung oder
Durchspielen nach 2 Runden (`docs/spielentwicklung.md` §7),
belegt eine Prüfung, dass die Vorgabe aussichtslos ist, oder ist eine **Freigabe nötig**:

1. In `docs/spiele/<fach>/<spiel>.md` Abschnitt **„Geparkt“**: Datum, Grund, welche Prüfung, offene Befunde je
   Kriterium mit Beleg, die Frage, die Christian entscheiden müsste (z. B. Katalog-Eintrag ändern, Lernzeichen freigeben).
2. Prüfberichte nach `docs/spiele/<fach>/<spiel>.pruefungen.md`; Steuerung buchen; Kosten-Eintrag
   `{ posten: "status", phase: "geparkt", einheit: "keine", menge: 0, … }` per `trageEin` im Spielordner; committen.
   Branch und Worktree bleiben.
3. Nicht im Probelauf: `<spielordner>/kosten.json` als `werkzeuge/kosten/geparkt/<spiel>.json` auf `main`
   committen (`chore(kosten): <spiel> geparkt`) – im `main`-Worktree, wenn er sauber ist (sonst anhalten, Grund 1),
   oder, wenn `main` nirgends ausgecheckt ist, in einem kurzen Worktree `git worktree add <Scratchpad>/main main`,
   der danach wieder entfernt wird. So zählt `npm run kosten` auf `main` das geparkte Spiel mit.

## Schlussmeldung (deine letzte Nachricht)

Kurz, für Christian:

- **Spiel:** Id, Name, Weg (Schnellweg/voller Weg), **gemergt** (Commit auf `main`), **geparkt** (Grund, Prüfung, Runde) oder **Probelauf**.
  Bei geparkt: Branch, Worktree-Pfad und die Frage, die er entscheiden soll.
- **Belege:** je Prüfung die Runden mit grün/rot (Schnellweg: Durchspielen mit Zahl der grünen Läufe je Stufe und
  die eine Prüfung; voller Weg: A, B-Didaktik, B-Welt, B-Spielbarkeit, B-Bedienung, Abschluss-Review); bei Parken
  die offenen Befunde.
- **Anhören:** die neuen Texte wörtlich (oder „Audio nicht erzeugt“), Aufruf `npm run audio:anhoeren`.
- **Mit echten Dingen:** gemergt, geparkt, offen (über 5 Themen).
- **Kosten:** Summe aus `npm run kosten` für das Spiel und für die Anleitungen, mit Steuerung; Laufzeit.
- **Stichprobe (Annahme):** Bei gemergten Spielen mit Wahrscheinlichkeit 1 zu 5
  (`node -e 'console.log(Math.random() < 0.2)'`) „Stichprobe – bitte ansehen“ mit dem Pfad der Seite; sonst nichts.

## Häufige Fehler

| Fehler | Richtig |
|---|---|
| Prüfer aus Runde 1 nach der Überarbeitung wieder fragen | neuer Agent je Runde, vorige Befunde mitgeben |
| Bau-Agent mit SendMessage für die nächste Runde fortsetzen | neuer Bau-Agent mit Entwurf und Befunden |
| Schnellweg, obwohl der Entwurf „Freigabe nötig“ hat oder ein Bauteil fehlt | voller Weg |
| Schnellweg und dazu Prüfung A, drei B-Prüfer und Review | eine Prüfung nach `pruefung-schnell.md` |
| Fremde Einführung abschalten, weil sie eine andere Welt erzählt | eigene Einführung in der Welt des Spiels |
| Christians Entscheidung im Katalog-Eintrag wegen eines Befunds umbauen | gesetzt; Widerspruch unter „Freigabe nötig“ |
| Bau-Agent „prüft selbst“ und meldet grün | grün gibt nur ein frischer Prüfer bzw. der Prüfstand |
| Prüfer starten, obwohl das Durchspielen rot ist | erst zurück an den Bau-Agenten |
| Unpassende Prüferantwort mehrmals neu anfordern | höchstens eine Wiederholung, dann rot |
| Kosten schätzen oder nur Gesamt-Token buchen | `transkript.mjs` mit `--stand` nach jedem Agenten |
| Christian nach Geschmack fragen | entscheiden, Annahme in den Entwurf schreiben |
| Neues Lernzeichen gebaut und gemergt | parken mit „Freigabe nötig“ |
| Nach Runde 3 (Schnellweg: Runde 2) „noch eine kleine Runde“ | parken |
| Nach dem letzten Test noch committen und dann mergen | gemergt wird genau der geprüfte Commit |
| Audio erzeugt und als „angehört“ gemeldet | Anhören bleibt bei Christian |
