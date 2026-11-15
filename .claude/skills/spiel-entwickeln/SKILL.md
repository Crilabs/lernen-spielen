---
name: spiel-entwickeln
description: Verwenden, wenn ein Spiel aus dem Spielkatalog entstehen soll – Aufruf „Spiel entwickeln <Katalog-Id> [--basis <branch>] [--zweig <branch>]“ (z. B. „Spiel entwickeln M15“). Baut genau ein Spiel nach docs/spielbau.md (Spielkern zuerst, schön und flüssig): Vorbereiten per Skript, dann der Workflow spiel-bauen (Idee, Bau, Prüfstand, Spielprüfung, höchstens zwei Runden), dann Abschluss per Skript mit Kosten, Audio und Merge nach main. Ziel 5–10 € und 1–2 Stunden je Spiel.
---

# Spiel entwickeln

Verbindlich: `docs/spielbau.md` (Spielkern, Grenzen, Werkzeuge, Ablauf). Du liest es nicht ganz: Die Agenten bekommen
das **Bauheft**, das die Regeln enthält. Du steuerst nur: drei Befehle und ein Workflow. Du baust nicht, du prüfst
nicht, du liest keine Berichte und keinen Code – nur die JSON-Ergebnisse.

**Ein Spiel je Lauf.** Christian wird während des Laufs nicht gefragt. Anhalten nur bei Zerstörerischem (fremde
Arbeit löschen, schmutziger `main`-Worktree), Sicherheit oder Wirkung nach außen (Push, Veröffentlichen). Nie pushen.

## 1. Vorbereiten (Skript)

```bash
cd <Hauptrepo> && node werkzeuge/spielbau/vorbereiten.mjs <Id> [--basis <branch>] [--zweig <branch>]
```

- Legt den Worktree `.worktrees/<zweig>` an (Vorgabe `spiel-<id>`, Basis `main`), schreibt Bauheft und `lauf.json`
  in `.superpowers/spiele/<zweig>/`. Die letzte Zeile ist `lauf.json`.
- **Basis ≠ main** ist ein Probelauf: Es wird nie gemergt. **Neubau** eines gemergten Spiels: `--zweig spiel-<id>-neu`.
- Gibt es den Worktree schon, ist es eine **Wiederaufnahme**: Der Workflow läuft neu, die Agenten finden den Stand im
  Branch.
- Bricht das Skript ab (Id unbekannt, Basis ohne `werkzeuge/spielbau/`): Christian melden, nichts weiter.

**Mit echten Dingen** (Auslöser Christian, `docs/mit-echten-dingen.md`): Gleich danach einen Hintergrund-Agenten
(`general-purpose`, `run_in_background`) starten: „Führe den Skill `mit-echten-dingen` für die Hauptthemen von <Id>
aus, die noch keine Anleitung haben (höchstens fünf, Einstiegsklasse zuerst), in einem eigenen Worktree
`echte-dinge-<id>`; er bucht seine Kosten selbst und mergt selbst.“ Er läuft unabhängig vom Spiel und zählt nicht zu
dessen Budget. Bei einem Probelauf nicht starten.

## 2. Workflow „spiel-bauen“

Workflow-Werkzeug mit `name: "spiel-bauen"` und `args: { lauf: <lauf.json als Objekt> }` (optional
`modelle: { idee, bau, pruefung }`, Vorgabe opus/sonnet/opus). Er läuft im Hintergrund; warte auf die Meldung.

Er macht: **Idee** (frischer Agent, nur Bauheft → `docs/spiele/<fach>/<spiel>.md`) → je Runde **Bau** (frischer
Agent) → **Prüfstand** (`werkzeuge/spielbau/pruefstand.mjs`: npm test, Durchspielen je Stufe, Textprüfung,
Filmstreifen mit Takt; rot → einmal Reparatur) → **Spielprüfung** (frischer Prüfer: vier Fragen, Grenzen G1–G13,
Streichliste; Urteil fest gerechnet). Höchstens zwei Runden. Ergebnis `status`: `gruen`, `freigabe` (gebaut, aber
neues Lernzeichen oder Widerspruch zu einer Entscheidung von Christian), `geparkt` oder `abgebrochen`.

Ohne Workflow-Werkzeug: dieselben Schritte mit dem Agent-Werkzeug, je Schritt ein frischer Agent mit dem Auftrag aus
`idee.md`, `bauen.md`, `pruefen.md` (gleiche Marke `[spielbau:<phase> <Id> <Branch>]` als erste Zeile, gleiche
Platzhalter wie in `.claude/workflows/spiel-bauen.js`).

## 3. Abschluss (Skript)

```bash
cd <Hauptrepo> && node werkzeuge/spielbau/abschliessen.mjs --lauf <ablage>/lauf.json \
  --transkripte ~/.claude/projects/-Users-christian-Code-einhorn-lernspiele/ \
  --steuerung "$(ls -t ~/.claude/projects/-Users-christian-Code-einhorn-lernspiele/*.jsonl | head -1)" \
  --audio [--merge] [--parken "<Grund>"]
```

- `--transkripte` darf der ganze Projektordner sein: gebucht werden nur Agenten mit der Marke dieses Laufs, jeder
  nur einmal (Stand in der Ablage). Läufst du selbst als Unteragent, ist `--steuerung` dein eigenes Transkript.
- `status: gruen` → `--audio --merge`. Ein Merge geht nur als Fast-Forward und nur ohne Probelauf; meldet das Skript
  „kein Fast-Forward“: im Worktree `git merge main` (Konflikte in `spiele.json` additiv lösen), committen, dann den
  Prüfstand einmal direkt laufen lassen (`node werkzeuge/spielbau/pruefstand.mjs --lauf … --runde 3`); grün →
  Abschluss mit `--merge` wiederholen, rot → parken.
- `status: freigabe` → `--audio --parken "Freigabe nötig: <Frage>"`; die Frage steht im Ergebnis des Workflows.
- `status: geparkt` → `--parken "<Grund>"`; trag zuvor in die Idee einen Abschnitt „Geparkt“ ein (Datum, Grund,
  offene Befunde aus dem Ergebnis, Frage an Christian) und committe ihn.
- **Anhören ist Christians Sache:** Audio nie als angehört melden.

## Schlussmeldung (deine letzte Nachricht, kurz)

- **Spiel:** Id, Name, gemergt (Commit) / geparkt (Grund, Frage) / Probelauf; Branch und Worktree.
- **Wie es sich anfühlt:** die Zusammenfassung der Idee, dazu der Pfad zum Filmstreifen
  `<ablage>/r<n>/film/<stufe>/richtig.png`.
- **Belege:** je Runde Prüfstand und Spielprüfung grün/rot; Hinweise des Prüfers, die offen bleiben.
- **Kosten und Zeit:** aus `ergebnis.json` (Euro je Phase, Minuten). Liegt es über 10 € oder 2 Stunden, den teuersten
  Schritt nennen.
- **Stichprobe:** mit Wahrscheinlichkeit 1 zu 5 (`node -e 'console.log(Math.random() < 0.2)'`) „Bitte selbst
  spielen“ mit dem Pfad der Seite.
