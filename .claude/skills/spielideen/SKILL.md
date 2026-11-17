---
name: spielideen
description: Schreibt drei kurze, deutlich verschiedene Spielskizzen für ein noch nicht gebautes Spiel aus dem Spielkatalog (docs/spiele/ideen/<id>.md), damit Christian vor dem Bau eine wählt oder seine eigene Idee nennt. Aufruf „Spielideen <Katalog-Id>“; meist aus der Verwaltung (Auftragsart „Ideen“). Baut nichts.
---

# Spielideen

Ziel: Ideen, die einem Kind von etwa sieben Jahren **Spaß** machen, so wie Christians Prototypen. Regeltreue prüft
später der Bau (Phase „Idee“), nicht du. Du arbeitest allein: keine Unteragenten, niemanden fragen, nicht pushen.

## 1. Lesen (nur das)

- Den Katalog-Eintrag und die Hauptthemen:
  `node -e 'import("./werkzeuge/spielbau/bauheft.mjs").then(m=>{const e=m.katalogEintrag("<Id>");console.log(e.text);console.log(m.hauptthemen(e.text).join(" "))})'`
- Für jedes Hauptthema Name, Klasse, Ziel und Zweck aus `spiele/lernplan.json` (`themen[]`, Feld `id`).
- `docs/spielideen.md` ganz: was Spaß macht, woran man eine langweilige Idee erkennt, der Spielkern in fünf Zeilen.

Sonst nichts aus `docs/`, kein Bauheft, keine Grenzen und keinen Code vorhandener Spiele. Du sollst frei denken.

## 2. Drei Skizzen

Je Skizze etwa 8 Zeilen, in dieser Reihenfolge:

1. **Titel** (kurz, so wie ein Kind das Spiel nennen würde)
2. **Held:** wer aus der Runde, und was er tut
3. **Das Kind:** die eine Handlung (tippen, ziehen, legen), die die Lernhandlung ist
4. **Dann passiert:** was man sieht und hört, etwa 2,5 s
5. **Daneben:** was die Sache zeigt, wenn die Antwort falsch ist
6. **Spaß:** was daran lustig oder spannend ist
7. **Lerngedanke:** warum Raten oder Abzählen hier langsamer ist

Die drei müssen sich **deutlich** unterscheiden: anderer Held, andere Handlung, andere Bühne, nicht drei Varianten
einer Idee. Prüfe jede gegen „Woran man eine langweilige Idee erkennt“ und ersetze sie, wenn sie dort hängen bleibt.

## 3. Ablegen und mergen

```bash
cd <Hauptrepo> && git worktree add .worktrees/ideen-<id> -b ideen-<id> main
```

Gibt es Worktree oder Branch `ideen-<id>` schon (abgebrochener Lauf), weiterverwenden; nie mit `--force` oder
`branch -D` löschen.

In `.worktrees/ideen-<id>` die Datei `docs/spiele/ideen/<id>.md` schreiben (`<id>` klein, z. B. `g05`): Überschrift
`# Spielideen <Id> „<Name>“`, Datum, dann `## 1. <Titel>` bis `## 3. <Titel>` mit den Zeilen aus Schritt 2.

Dann **im Worktree** die Kosten buchen (bis hierher; der kleine Rest danach bleibt ungebucht). Nie im Hauptrepo
buchen: Eine ungetrackte `kosten.json` dort macht `main` schmutzig, und der Abschluss des nächsten Spiels mergt
nicht mehr (Review 2026-11-17).

```bash
cd .worktrees/ideen-<id> && node werkzeuge/kosten/transkript.mjs "$VERWALTUNG_TRANSKRIPT" --ordner docs/spiele/ideen \
  --phase ideen --thema <id> --notiz "<Id>, Ideen"
```

Ohne `VERWALTUNG_TRANSKRIPT` das eigene Transkript (neueste Datei in `~/.claude/projects/<Projekt>/`).

Commit beider Dateien `docs(ideen): Spielideen <Id>` mit Leerzeile und `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

Dann im Hauptrepo – nur wenn dort `git branch --show-current` `main` ist, sonst `abgebrochen` –
`git merge --ff-only ideen-<id>` (nie im Hauptrepo selbst committen: dort liegt oft fremde Arbeit),
danach `git worktree remove .worktrees/ideen-<id>` und `git branch -d ideen-<id>`. Scheitert der Merge, weil `main`
sich bewegt hat: im Worktree `git rebase main`, noch einmal `--ff-only`; scheitert es wieder, Status `abgebrochen`.

## Lauf aus der Verwaltung

Ist `VERWALTUNG_AUFTRAG` gesetzt, schreib als Letztes `werkzeuge/verwaltung/ergebnisse/<auftrag>.json`
(`<auftrag>` = Wert von `$VERWALTUNG_AUFTRAG`) im Hauptrepo:

```json
{ "status": "geparkt", "zusammenfassung": "<ein Satz: drei Titel, Kosten>", "frage": "Welche Idee soll gebaut werden?",
  "ideen": [{ "titel": "<Titel>", "text": "<die Zeilen 2–7, mit Zeilenumbrüchen>" }] }
```

`"ideen"` hat genau drei Einträge in der Reihenfolge der Datei. Bei einem Fehler `"status": "abgebrochen"` mit Grund
in `zusammenfassung`. Fehlt die Datei, gilt der Auftrag als fehlgeschlagen.

## Schlussmeldung

Die drei Titel mit je einem Satz, Pfad der Datei, Kosten.
