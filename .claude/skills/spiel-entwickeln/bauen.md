# Auftrag: Bau

Du baust das Spiel **{{ID}} „{{NAME}}“** nach seiner Idee, ganz und spielbar. Arbeitsordner: `{{WORKTREE}}`
(Branch `{{BRANCH}}`), nur dort arbeiten. Niemanden fragen, keine Unteragenten, nicht pushen, nicht mergen,
`spiele/mit-echten-dingen/` nicht anfassen.

**Lies:** das Bauheft `{{BAUHEFT}}` (Regeln, Themen, was es gibt), die Idee `{{IDEE}}`, den Kopf von
`spiele/vorlage/spiel.js` (Schritte 1–7, RAHMEN, SPIELWELT). Einzelheiten zu einem Baustein stehen in seiner Datei
in `spiele/rahmen/` bzw. `spiele/objekte/`; lies gezielt, nicht alles.

**Lade vor der UI-Arbeit** den Skill `frontend-design:frontend-design`. Der Fokus ist ein Spiel, das Spaß macht,
mit schönen Bildern und flüssigen Animationen (Regeln §1, §4): ein Held mit Gewicht, eine Wirkung, die sofort kommt
und in höchstens etwa 2,5 s fertig ist, Klänge aus Web Audio, nichts ruckelt.

## Bauen

- Spielordner `{{SPIELORDNER}}` aus `spiele/vorlage/` (Schritte im Kopf von `spiel.js`). Gibt es ihn schon (Neubau),
  ersetze, was der Idee widerspricht; behalte, was ihr dient (Lernsteuerung, Test-Schnittstelle, Aufgabenart).
- Eintrag in `spiele/spiele.json` nach der Idee; Aufgaben über die Lernsteuerung, jede Aufgabe gemeldet. Die
  `beschreibung` sagt, wie das Spiel aussieht und was gemalt und was echt ist (das Spielbild der Karte entsteht daraus).
- **Test-Schnittstelle** (`spiele/rahmen/pruefen.js`): `zuege()`, `richtigerZug()`, `zustand()` mit den Phasen
  laden, einfuehrung, aufgabe, folge, pause, fehler – der Prüfstand und der Filmstreifen spielen nur darüber.
- Feste Sätze in `texte.json` (oder `einfuehrung.json`), wörtlich aus der Idee; nichts dazuerfinden.
- Was nur dieses Spiel braucht, liegt im Spielordner; ein neues gemeinsames Objekt nach `spiele/objekte/`
  (Schnittstelle `spiele/objekte/objekt.js`, Eintrag in `spiele/objekte/README.md`).
- Tests für die Spiellogik (`tests/spiele/`), wenn das Spiel eigene Logik hat (`logik.js`).

## Selbst laufen lassen (du urteilst nicht, du reparierst)

```bash
npm test
NODE_PATH=/private/tmp/claude-501/pw/node_modules node tests/browser/durchspielen.mjs {{SEITE}} --kinder sicher,ratend --browser chromium --groessen 1280x800
NODE_PATH=/private/tmp/claude-501/pw/node_modules node werkzeuge/spielbau/filmstreifen.mjs {{SEITE}} --aus {{ABLAGE}}/bau-film
node werkzeuge/spielbau/texte.mjs {{SPIELORDNER}} --klasse {{KLASSE}}
```

Sieh dir `{{ABLAGE}}/bau-film/richtig.png` und `daneben.png` an (Read-Werkzeug): Würdest du das als Kind noch einmal spielen wollen? Wenn nicht, mach es
schöner, bevor du abgibst.

{{BEFUNDE}}

Committen (Deutsch): `feat({{ORDNER}}): …` bzw. `fix({{ORDNER}}): …`, Leerzeile,
`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Am Ende ist alles committet.

Antwort: die Felder des verlangten Schemas.
