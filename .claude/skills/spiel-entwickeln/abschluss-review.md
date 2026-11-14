# Abschluss-Review des Spiel-Branches

Vorlage für den Skill `spiel-entwickeln`. Empfänger: ein **neuer Agent, der am Spiel nicht gebaut und es nicht
geprüft hat**, je Runde ein neuer. Der Skill füllt `{{…}}` und schickt alles unter der Linie. `{{VORIGE_BEFUNDE}}` ist
in Runde 1 leer, ab Runde 2: „Befunde der vorigen Runde (prüfe je Befund, ob er behoben ist; urteile trotzdem über
alle Kriterien neu): …“.

---

Du machst das Abschluss-Review des Branches `{{BRANCH}}` (Spiel {{ID}} „{{NAME}}“) vor dem Merge nach `{{BASIS}}`, wie
bei Rahmen und Ansichten: Ist das fertig, richtig und sauber? Du hast nicht daran gebaut. Arbeitsordner
`{{WORKTREE}}`: nur lesen und Befehle ausführen, nichts ändern, nichts committen, keine Unteragenten.

**Lies:** `git diff {{BASIS}}...HEAD` (ganz) und `git log {{BASIS}}..HEAD --oneline`; den Entwurf `{{ENTWURF}}`;
`docs/spielentwicklung.md` (ganz, besonders „Ablage“, „Spielobjekte“, §5, §6); `docs/bedienung.md` §10;
`docs/grundsaetze.md` §12; `spiele/vorlage/spiel.js` (Kopf). Nicht lesen: die Prüfberichte `runde-*.md` in `{{PRUEFUNGEN}}` (die Bilder dort darfst du ansehen).

**Führe aus und zitiere die Ausgabe (gekürzt):**
```bash
npm test
NODE_PATH=/private/tmp/claude-501/pw/node_modules node tests/browser/durchspielen.mjs {{SEITE}}
# dazu je Lernstufe aus {{STUFEN}}: … durchspielen.mjs {{SEITE}} --stufe <id>
npm run audio -- --pruefen
npm run kosten
```
(`audio -- --pruefen` darf fehlende Aufnahmen melden, wenn der Skill „Audio nicht erzeugt“ mitteilt: dann R5 mit
diesem Vermerk.)

{{VORIGE_BEFUNDE}}

**Kriterien:**

| Nr. | Kriterium |
|---|---|
| R1 | **Ablage** nach `docs/spielentwicklung.md` „Ablage“: Spielordner, Entwurf, Tests, gemeinsame Objekte in `spiele/objekte/`; `tests/ablage.test.mjs` grün. |
| R2 | **Ausbau vollständig** nach §5: alle Stufen des Entwurfs, Spielobjekte als animierte SVG (keine Platzhalter mehr), Regal-Bild in `spiele.json` mit Objekt in `spiele/objekte/`, Szenenbild mit `herkunft.json`, Einführung, Regal-Material, vollständiger `spiele.json`-Eintrag mit `beschreibung` (vorhanden, stimmt mit dem Spiel überein, neutral, für Eltern lesbar; `tests/spiele-beschreibung.test.mjs`). |
| R3 | **Gebaut wie entworfen:** Spiel und Entwurf stimmen überein (Runde, Rückmeldesätze, Hilfe-Leiter, Figur); Abweichungen sind im Entwurf begründet. |
| R4 | **Regeln der Plattform:** kein Plattform-Zugriff außerhalb `spiele/kern/` (`tests/plattform-regel.test.mjs`); Test-Schnittstelle nur im Testbetrieb, für das Kind unsichtbar. |
| R5 | **Texte:** alle Sätze als feste Zeichenketten oder Daten (`texte.json`), keine zusammengesetzten Sätze mit Zahlen, Wörter aus `docs/grundsaetze.md` §3.2 nicht verwendet; Aufnahmen erzeugt (oder Vermerk). |
| R6 | **Tests:** `npm test` grün; reine Logik in Node getestet; Durchspielen grün (alle Kinder, Chromium und WebKit, beide Größen), auch je Lernstufe. |
| R7 | **Code:** keine Fehler, toten Reste oder Debug-Ausgaben; Änderungen an gemeinsamen Bausteinen (`spiele/rahmen/`, `spiele/objekte/`, `spiele/lernsteuerung.js`) begründet, getestet und rückwärtsverträglich. |
| R8 | **Kosten:** `{{SPIELORDNER}}/kosten.json` hat Einträge für jede Phase, die stattfand (entwurf, pruefung-a, prototyp, pruefung-b, ausbau, review; bild und stimme, falls erzeugt); `npm run kosten` zeigt das Spiel. |
| R9 | **Checklisten:** `docs/bedienung.md` §10 und `docs/grundsaetze.md` §12 sind erfüllt (Stichprobe am Code und an der Seite). |
| R10 | **Umfang:** nichts außerhalb des Spiels geändert, was nicht dazugehört (Startseite, Themen, Eltern nur, wenn der Entwurf es verlangt; `spiele/mit-echten-dingen/` gar nicht – das kommt aus einem eigenen Branch). |

**Grün heißt:** R1–R10 grün, kein kritischer Befund. Ein kritischer Befund ist alles, was nach dem Merge einem Kind
schadet oder den Lernstand falsch macht oder `main` rot macht.

Schreib deine Antwort außerdem unverändert in die Datei `{{BERICHT}}` (Arbeitsablage außerhalb des Arbeitsordners;
die einzige Datei, die du schreibst).

**So sieht deine Antwort aus** (nichts davor, nichts danach):

```
Ergebnis: GRÜN | ROT

| Nr. | grün/rot | Beleg (Datei:Zeile, Befehl mit Ausgabe) | Befund, falls rot |
|---|---|---|---|
… eine Zeile je Kriterium R1 bis R10

Kritische Befunde:
- <Befund> – <Beleg> – <was es lösen würde>   (oder „keine“)

Kleinere Hinweise (halten den Merge nicht auf):
- …

Vorige Befunde: <je Befund behoben / nicht behoben mit Beleg>   (nur ab Runde 2)
```
