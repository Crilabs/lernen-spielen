# Prüfstand B: B-Didaktik

Vorlage für den Skill `spiel-entwickeln`. Empfänger: ein **neuer Agent, der am Spiel nicht gebaut hat**, je Runde ein
neuer; läuft parallel zu den anderen B-Prüfern. Der Skill füllt `{{…}}` und schickt alles unter der Linie.
`{{VORIGE_BEFUNDE}}` ist in Runde 1 leer, ab Runde 2: „Befunde der vorigen Runde (prüfe je Befund, ob er behoben ist;
urteile trotzdem über alle Kriterien neu): …“.

---

Du prüfst ein Lernspiel für Kinder der Klassen 1–4 (Stadium: {{STADIUM}}, Prototyp oder Ausbau). Du hast es nicht
gebaut und sollst es nicht verbessern, sondern beurteilen. Arbeitsordner `{{WORKTREE}}`: nur lesen und ansehen, nichts ändern, nichts committen,
keine Unteragenten. Spiel: {{ID}} „{{NAME}}“, Seite `{{SEITE}}`, Entwurf `{{ENTWURF}}`. Nicht lesen:
`{{PRUEFUNGEN}}` und Commit-Nachrichten – du urteilst unabhängig.

{{VORIGE_BEFUNDE}}

**Lies:** den Entwurf; den Code im Spielordner `{{SPIELORDNER}}` (`spiel.js`, ggf. `logik.js`, `texte.json`) und den
Eintrag in `spiele/spiele.json`; `docs/spielentwicklung.md` §1–§2; `docs/grundsaetze.md`; den Kopf von
`spiele/vorlage/spiel.js` (RAHMEN: Meldung an die Lernsteuerung, Hilfe-Leiter) und `spiele/rahmen/pruefen.js`. Du
darfst das Spiel im Browser öffnen (`?pruefen`, Playwright mit `NODE_PATH=/private/tmp/claude-501/pw/node_modules`)
und `npm test` laufen lassen.

**Auftrag** (wörtlich):

<!-- wörtlich aus docs/spielentwicklung.md §4; tests/skill-spiel-entwickeln.test.mjs prüft, dass es übereinstimmt -->
**B-Didaktik** (Code + Entwurf): A1–A8 am gebauten Prototyp nachgeprüft; dazu: die Lernsteuerung bekommt jede
Aufgabe mit `ok`, `hilfe`, `ms` gemeldet; mit Hilfe Gelöstes zählt nicht als gekonnt. Erklärt das Spiel in der
Test-Schnittstelle `fehlversuche: false` (kein Zug kann danebengehen), prüft B-Didaktik, dass das stimmt; der Prüfstand
überspringt dann die Hilfe-Leiter des ratenden Kindes (n/a im Bericht).
<!-- ende wörtlich -->

**Kriterien:**
- **D-A1 … D-A8:** die Kriterien A1 bis A8 einschließlich A4b und A6b aus der Tabelle in `docs/spielentwicklung.md`
  §2, diesmal **am gebauten Prototyp**: Was der Code und die Seite tun, nicht was der Entwurf verspricht. Weicht der
  Prototyp vom Entwurf ab, ist das ein Befund.
- **D-Meldung:** jede Aufgabe wird mit `ok`, `hilfe`, `ms` an die Lernsteuerung gemeldet (Beleg: Datei:Zeile).
- **D-Gekonnt:** mit Hilfe Gelöstes zählt nicht als gekonnt (`ok` nur ohne Fehlversuch und Hilfe; Beleg).
- **D-Fehlversuche:** meldet das Spiel `fehlversuche: false`, kann wirklich kein Zug danebengehen (Beleg: alle
  `zuege()` führen weiter). Sonst „n/a“.
- **D-Sätze:** jeder gesprochene Satz steht als feste Zeichenkette oder als Daten (Kopf der Vorlage, Schritt 3),
  keine Wörter aus `docs/grundsaetze.md` §3.2, Fachbegriffe nach §5.1.

**Grün heißt:** alle Kriterien grün, kein kritischer Befund. Im Zweifel rot.

**So sieht deine Antwort aus** (nichts davor, nichts danach):

```
Ergebnis: GRÜN | ROT

| Nr. | grün/rot | Beleg (Datei:Zeile, Bilddatei, Befehl mit Ausgabe) | Befund, falls rot |
|---|---|---|---|
… eine Zeile je Kriterium: D-A1, D-A2, D-A3, D-A4, D-A4b, D-A5, D-A6, D-A6b, D-A7, D-A8, D-Meldung, D-Gekonnt, D-Fehlversuche, D-Sätze

Kritische Befunde:
- <Befund> – <Beleg> – <was es lösen würde>   (oder „keine“)

Vorige Befunde: <je Befund behoben / nicht behoben mit Beleg>   (nur ab Runde 2)
```
