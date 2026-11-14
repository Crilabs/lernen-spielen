# Auftrag an den Bau-Agenten

Vorlage für den Skill `spiel-entwickeln`. Der Skill füllt `{{…}}` und schickt den **gemeinsamen Teil** plus genau
einen Abschnitt. Derselbe Bau-Agent darf über die Runden fortgesetzt werden (SendMessage mit „Befunde umsetzen“);
prüfen darf er nie.

---

## Gemeinsamer Teil

Du baust das Lernspiel **{{ID}} „{{NAME}}“** für Kinder der Klassen 1–4. Arbeitsordner: `{{WORKTREE}}` (Branch
`{{BRANCH}}`); arbeite nur dort. Spielordner: `{{SPIELORDNER}}`, Entwurf: `{{ENTWURF}}`.

Verbindlich, vor der Arbeit lesen: `docs/spielentwicklung.md` (ganz), `docs/grundsaetze.md`,
`docs/grundsaetze-bilder.md`, `docs/figuren.md`, `docs/stimme.md`, `docs/bedienung.md`; der Katalog-Eintrag
`{{KATALOG_DATEI}}` „### {{ID}} …“ und sein Eintrag in `docs/spielkatalog/welten.md` (Vorrang nach
`docs/spielkatalog.md` §8a). Der Eintrag ist ein Vorschlag: Passt Welt, Figur oder Mechanik nicht, weiche ab und
schreibe den Grund in den Entwurf. **Ausnahme:** Was der Eintrag als Entscheidung von Christian kennzeichnet
(„Christian“, mit Datum), ist gesetzt; auch ein Prüfbefund ist kein Grund, davon wegzubauen. Widerspricht es einem
Kriterium, benenne den Widerspruch offen und stelle ihn unter „Freigabe nötig“ als Frage.

Regeln:
- Niemanden fragen. Was offen ist, entscheidest du nach den Dokumenten und markierst es im Entwurf als **(Annahme)**.
  Nur bei Zerstörerischem, Sicherheit oder Wirkung nach außen anhalten und melden.
- Keine Unteragenten starten. Nicht pushen, nicht nach `main` mergen. `spiele/mit-echten-dingen/` nie anfassen (das
  läuft in einem eigenen Branch).
- Kein Plattform-Zugriff außerhalb `spiele/kern/`; die Test-Schnittstelle nur im Testbetrieb (`spiele/rahmen/pruefen.js`).
- Commits auf Deutsch, Form `feat(<spiel>): …` / `fix(<spiel>): …` / `docs(<spiel>): …`, Leerzeile, dann
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Du prüfst nicht, ob dein Ergebnis „grün“ ist; das tun andere. Tests und Prüfstand laufen lassen darfst und sollst du.

Rückmeldung am Ende (kurz): was entstanden ist (Dateien), Commits, Annahmen, was du bewusst offen gelassen hast.

---

## Entwurf

Schreibe `{{ENTWURF}}` (eine Seite) mit den elf Pflichtteilen aus `docs/spielentwicklung.md` §1 in dieser
Reihenfolge und mit diesen Überschriften: Zweck in der Spielwelt · Die Runde in fünf Sätzen · Lernhandlung =
Spielhandlung · Sachwelt und Sachgrund · Figur · Bildschirm-Skizze · Rückmeldung · Hilfe-Leiter · Stufen ·
Aufgabenschlüssel und arten · Spielobjekte.

- Kopf: Katalog-Id, Name, Fach, Spielordner, Stand (Datum), Abweichungen vom Katalog-Eintrag mit Grund.
- Alle gesprochenen Sätze **wörtlich** (Erzähler; Figuren sprechen nicht, `docs/stimme.md`), keine Wörter aus
  `docs/grundsaetze.md` §3.2, Fachbegriffe nach §5.1.
- Figur: eine aus `docs/figuren.md` §2 mit genau einer Aufgabe (§3), Platz im Bild, Haltungen.
- Bildschirm-Skizze als ASCII nach `docs/bedienung.md` §3.
- Spielobjekte: Dinge, Zustände, Bewegungen, welches das Regal-Bild ist (Abschnitt „Spielobjekte“ in
  `docs/spielentwicklung.md`); was es schon in `spiele/objekte/` gibt, wiederverwenden. Im Regal steht für ein Thema
  zuerst sein Lernzeichen (Perlenstab bei Zahlen und Zerlegen, Wortart-Zeichen, Graphem-Karte), erst danach das
  Regal-Bild des Spiels (Abschnitt „Regal-Bild“): Bei solchen Themen bleibt der Perlenstab vorn, das Regal-Bild gilt
  für die übrigen; schreib dazu, für welche Themen es sichtbar wird.
- Braucht das Spiel ein neues Lernzeichen oder Bedienteil (`docs/spielkatalog.md` §8a) oder eine offene Frage aus
  `docs/grundsaetze-bilder.md` §15: entwerfen, als **(Annahme)** markieren und unter der Überschrift
  „Freigabe nötig“ als konkrete Frage an Christian notieren. Das Spiel wird dann gebaut und geprüft, aber nicht gemergt.
- Prüfe selbst die Liste `docs/grundsaetze.md` §12, bevor du abgibst.

Committen: `docs({{ORDNERNAME}}): Spielentwurf`.

---

## Prototyp

Erst `frontend-design:frontend-design` laden (Skill), dann bauen. Farbwelt (`docs/grundsaetze-bilder.md` §6) und
`docs/bedienung.md` sind verbindlich und gehen vor allgemeinen Gestaltungsvorschlägen.

Nach `docs/spielentwicklung.md` §3 und dem Kopf von `spiele/vorlage/spiel.js` (Schritte 1–3 und 7):
- `spiele/vorlage/` nach `{{SPIELORDNER}}` kopieren; in `index.html` und `spiel.js` jedes „../“ zu „../../“;
  `<title>` und `<ls-leiste spiel fach titel thema>` setzen.
- Genau **eine Stufe** und **eine Runde** nach dem Entwurf; ohne erzeugtes Bild und ohne Aufnahmen (Systemstimme);
  Figur als Platzhalter aus der Runde (`spiele/runde/`), schlichte Welt-Fläche; Spielobjekte dürfen einfache
  Platzhalter sein, ihre Rolle (Wirkung, nicht Zählmaterial) muss stimmen.
- Test-Schnittstelle `meldePruefSchnittstelle` mit `zuege`, `richtigerZug`, Hilfe Stufe 2 mit `.markiert`;
  `fehlversuche: false` nur, wenn wirklich kein Zug danebengehen kann.
- Eintrag in `spiele/spiele.json` (`datei`, `symbol` relativ zu `spiele/`, `arten`, Themen); einfaches `symbol.svg`.
- Reine Logik in `logik.js` mit Node-Tests unter `tests/spiele/<fach>/<spiel>.test.mjs`, falls es Logik gibt.
- Den RAHMEN der Vorlage behalten, auch `?stufe` (nur im Testbetrieb) und `lernstufe` im Zustand.
- Selbst laufen lassen, bis es durchläuft: `npm test` und
  `NODE_PATH=/private/tmp/claude-501/pw/node_modules node tests/browser/durchspielen.mjs {{SEITE}}`.

Committen: `feat({{ORDNERNAME}}): Prototyp – eine Stufe, eine Runde`.

---

## Ausbau

Erst `frontend-design:frontend-design` laden. Nach `docs/spielentwicklung.md` §5, Umfang nach
`docs/spielkatalog.md` §8a (alle Hauptthemen in der Datenstruktur; gebaut die Themen der Einstiegsklasse auf allen
Lernstufen, ruhig und sanft; abenteuer mitgeplant):

- Alle Stufen (material / vorstellung / kopf), soweit der Eintrag sie vorsieht.
- **Spielobjekte** als animierte SVG im Stil der Runde (`docs/figuren.md` §4, Welt-Paletten
  `docs/grundsaetze-bilder.md` §6.2), von Hand, nie KI-generiert; Schnittstelle `spiele/objekte/objekt.js`
  (`meldeObjekt`, Vorbild `tonne.js`); gemeinsam Nutzbares nach `spiele/objekte/`, Spielspezifisches nach
  `{{SPIELORDNER}}/objekte/`; `tests/objekte.test.mjs` grün; in `spiele/rahmen/vorschau.html?objekte` sichtbar.
- **Regal-Bild:** `regal: { objekt, wert }` in `spiele.json`, Objekt in `spiele/objekte/`; Regal-Material
  (`spiele/rahmen/material.js`); im Regal (`spiele/regal.html`) bei einem Thema ansehen, für das es gilt.
- **Szenenbild** nur mit `node werkzeuge/bilder/erzeugen.mjs --spiel {{SPIELORDNER}} <ziel> "<Szene>"`, Herkunft in
  `bilder/herkunft.json` (`docs/grundsaetze-bilder.md` §11).
- **Texte als Daten** in `{{SPIELORDNER}}/texte.json` und als feste Zeichenketten (Kopf der Vorlage, Schritt 3).
  `npm run audio` startest du **nicht**; das tut der Skill danach (Kosten). Nichts anhören, nichts als angehört
  markieren. Gib die Liste der neuen Texte wörtlich zurück.
- Einführung (`spiele/einfuehrungen/`, Lernplan `einfuehrung`), vollständiger Eintrag in `spiele.json`.
- Checklisten `docs/bedienung.md` §10 und `docs/grundsaetze.md` §12 durchgehen; `npm test` und Durchspielen grün,
  auch je Lernstufe (`durchspielen.mjs {{SEITE}} --stufe <id>`).

Committen in sinnvollen Schritten (`feat({{ORDNERNAME}}): …`).

---

## Befunde umsetzen

Ein unabhängiger Prüfer hat Folgendes rot gegeben (Runde {{RUNDE}} von höchstens 3):

{{BEFUNDE}}

Seine Hinweise zu grünen Kriterien stehen dabei, wenn er welche gab; sie sind kein Muss, aber nimm sie mit, wo sie
das Spiel klarer machen.

Setze jeden Befund um oder begründe im Entwurf, warum er nicht zutrifft (mit Beleg aus den Dokumenten). Ändere
den Entwurf mit, wenn sich das Spiel ändert. Melde je Befund: umgesetzt (Datei:Zeile, Commit) oder begründet
abgelehnt.
