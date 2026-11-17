---
name: rueckmeldung
description: Setzt Christians Rückmeldung zu einem fertigen Spiel, Buch oder einer Anleitung „Mit echten Dingen“ um – nur seine Punkte, ein frischer Agent ändert, ein frischer Prüfer hakt jeden Punkt mit Beleg ab, höchstens eine Reparatur, dann Merge (ein Spiel wieder als Probe). Aufruf „Rückmeldung umsetzen <spiel|buch|echte-dinge> <Id>“ mit dem Abschnitt „Rückmeldung von Christian“ darunter; meist aus der Verwaltung (Auftragsart „Änderung“).
---

# Rückmeldung umsetzen

Christian hat ein Stück gespielt oder gelesen und schreibt, was anders werden soll
(`docs/superpowers/specs/2026-11-17-rueckmeldungen-design.md`). Seine Punkte stehen unter dem Aufruf im Abschnitt
„Rückmeldung von Christian“.

**Grundsatz:** Nur seine Punkte umsetzen. Nichts neu erfinden, nichts nebenbei „verbessern“. Die Grundsätze
(`docs/grundsaetze.md`) und die Regeln des Bereichs gelten weiter; widerspricht ein Punkt einer Regel, setz ihn so
um, dass beides stimmt, und nenne den Konflikt in der Schlussmeldung. Geht das nicht, parke mit einer Frage.

Du steuerst nur: Du änderst nichts selbst und prüfst nichts selbst. Je Schritt ein frischer Agent (Agent-Werkzeug,
`general-purpose`, Vordergrund). Christian wird während des Laufs nicht gefragt. Nie pushen.

**Punkte festhalten:** Schreib alle Punkte des Abschnitts (er enthält auch frühere Rückmeldungen) nummeriert nach
`<ablage>/rueckmeldung.md` (Ablage je Bereich unten). Jeder Agent bekommt diese Datei; der Prüfer urteilt je Nummer.

**Eigener Zweig je Auftrag:** `<zweig>` = `aenderung-<id>-<marke>` (Id klein; `<marke>` = die letzten fünf Zeichen von
`$VERWALTUNG_AUFTRAG`, ohne Verwaltung Datum und Uhrzeit `MMTTHHMM`). So liegt nie eine alte Ablage, ein altes
`nachpruefung.json` oder ein alter Worktree im Weg. Nach dem Merge (und beim Parken nicht) Worktree und Branch
entfernen: `git worktree remove .worktrees/<zweig> && git branch -d <zweig>`.

## Spiel

1. **Vorbereiten:** Erst prüfen, ob das Spiel in `spiele/spiele.json` auf `main` steht; sonst (geparkt) sofort
   abbrechen mit Ergebnis `abgebrochen` – geparkte Spiele baut der Skill `spiel-entwickeln` weiter (die Verwaltung
   legt dafür einen Spiel-Auftrag an). Dann `cd <Hauptrepo> && node werkzeuge/spielbau/vorbereiten.mjs <Id> --zweig
   <zweig>`. Die letzte Zeile ist `lauf.json`; Ablage, Worktree, Bauheft, Idee und Seite stehen darin.
2. **Ändern** (frischer Agent, Modell sonnet; erste Zeile `[spielbau:bau <Id> <zweig>]`, Id groß – sonst bucht
   `abschliessen.mjs` die Kosten nicht): Auftrag aus
   `.claude/skills/spiel-entwickeln/bauen.md` mit den Platzhaltern aus `lauf.json`, davor: „Du baust nicht neu: Setz
   nur die Punkte aus `<ablage>/rueckmeldung.md` um. Ein Fehler (etwas sieht man nicht, reagiert falsch) wird zuerst
   mit einem Test belegt, der rot ist, dann behoben. Was man nur in Bewegung sieht (Ziehen, Animation), belegst du
   mit einem Screenshot mitten in der Bewegung (`werkzeuge/spielbau/bildschirm.mjs`, Optionen im Kopf) in
   `<ablage>/r1/belege/`. Am Ende: je Punkt ein Satz, was du geändert hast, nach `<ablage>/r1/aenderungen.md`.“
3. **Prüfstand:** `node werkzeuge/spielbau/pruefstand.mjs --lauf <ablage>/lauf.json --runde 1 --start`, dann
   `… --abwarten 540` wiederholen, bis ein Ergebnis kommt (ein Lauf dauert länger als ein Bash-Aufruf). Rot → zurück
   zu Schritt 2 als Reparatur, zählt als die eine Reparatur.
4. **Nachprüfung** (frischer Agent, Modell opus; erste Zeile `[spielbau:pruefung <Id> <zweig>]`): Er hat nicht
   geändert und ändert nichts. Er liest `rueckmeldung.md`, `aenderungen.md`, den Prüfstand und sieht sich Film und
   Belege an (Read-Werkzeug). Er schreibt `<ablage>/r1/nachpruefung.json`:
   `{ "punkte": [{ "nr": 1, "umgesetzt": true|false, "beleg": "<Bild/Test/Satz>" }], "hart": { "schwierigkeit": true|false,
   "ohneTransfer": true|false, "grenzen": ["<verletzte Grenze G1–G14 mit Beleg>"] }, "hinweise": ["…"] }`
   (Fragen 3 und 5 und die Grenzen aus `.claude/skills/spiel-entwickeln/pruefen.md`).
   **Grün** = jeder Punkt umgesetzt, beide harten Fragen ja, keine Grenze verletzt – das rechnest du aus der Datei,
   nicht aus seinem Text.
5. **Rot:** einmal Schritt 2–4 als Runde 2 (`r2/`, Prüfstand `--runde 2`) mit den Befunden als Auftrag. Wieder rot:
   Abschluss mit `--parken "<offene Punkte>"`, Ergebnis `geparkt` mit Frage.
6. **Abschluss:** wie in `.claude/skills/spiel-entwickeln/SKILL.md` §3, aber ohne `--spielbild` (außer ein Punkt betrifft
   das Spielbild): `node werkzeuge/spielbau/abschliessen.mjs --lauf <ablage>/lauf.json --transkripte
   ~/.claude/projects/-Users-christian-Code-einhorn-lernspiele/ --steuerung "${VERWALTUNG_TRANSKRIPT:-…}" --audio
   --merge`. Das Spiel steht danach wieder als **Probe** auf `main` (Christian, 2026-11-17). „kein Fast-Forward“:
   im Worktree `git merge main`, Prüfstand `--runde 3`, grün → Abschluss wiederholen, rot → parken.

## Buch

Ablage `spiele/geschichten/<id>/` im Worktree `.worktrees/<zweig>` (Branch `<zweig>` von `main`).

1. **Ändern** (frischer Agent, opus): liest `docs/geschichten.md`, `geschichte.json`, `inhalte.md`, `pruefung.md` und
   `rueckmeldung.md`; ändert nur, was die Punkte verlangen (Text, Bild, Frage). Ein neues Bild geht durch die
   Bildprüfung wie in `.claude/skills/sachgeschichte/SKILL.md` §4 (Bilder bleiben wahr). Ändert sich Text, den die App
   vorliest: Ton neu (wie dort §5). Schreibt je Punkt einen Satz nach `pruefung.md` §6 „Rückmeldung <Datum>“.
2. **Nachprüfung** (frischer Agent, opus): je Punkt umgesetzt ja/nein mit Beleg, dazu die Regeln aus Prüfer B
   (`sachgeschichte` §3) für die geänderten Seiten; Ergebnis in `pruefung.md` §6. Rot → einmal Schritt 1 mit den
   Befunden, wieder rot → parken.
3. **Abschluss:** `node --test tests/geschichten.test.mjs`, Kosten je Agent buchen wie in `sachgeschichte` („Kosten
   sofort buchen“, Phase `schreiben`/`pruefung`), committen, Merge nach `main` per Fast-Forward (main-Worktree sauber,
   sonst parken).

## Mit echten Dingen

Datei `spiele/mit-echten-dingen/<fach>/<thema>.md` (aus dem Verzeichnis), Worktree `.worktrees/<zweig>`.

1. **Ändern** (frischer Agent, sonnet): liest `docs/mit-echten-dingen.md`, die Datei und `rueckmeldung.md`; ändert nur
   die Punkte (Form, Text, Foto nach `mit-echten-dingen` §3a).
2. **Nachprüfung** (frischer Agent, opus): je Punkt ja/nein mit Beleg, dazu E1–E12 aus `mit-echten-dingen` §4 für die
   ganze Datei. Rot → einmal Schritt 1, wieder rot → parken.
3. **Abschluss:** Kosten buchen wie dort §5 (`--thema <id>`), committen, Merge per Fast-Forward.

## Schlussmeldung (kurz)

Stück, je Punkt umgesetzt ja/nein mit Beleg, gemergt (Commit; beim Spiel „wieder zur Probe“) oder geparkt (offene
Punkte, Frage), Kosten.

## Lauf aus der Verwaltung

Ist `VERWALTUNG_AUFTRAG` gesetzt, schreib als Letztes `werkzeuge/verwaltung/ergebnisse/<auftrag>.json` im Repo, in dem
der Lauf gestartet wurde: `{ "status": "erledigt"|"geparkt"|"abgebrochen", "zusammenfassung": "<ein Satz: Stück,
Punkte umgesetzt x von y, gemergt/geparkt, Kosten>", "frage": "<nur bei geparkt>" }`. Fehlt die Datei, gilt der
Auftrag als fehlgeschlagen. Ein `git push` scheitert im Lauf absichtlich.
