# Prüfung E: eine Anleitung „Mit echten Dingen“

Vorlage für den Skill `spiel-entwickeln` (Abschnitt „Mit echten Dingen“), nach `.claude/skills/mit-echten-dingen/SKILL.md`
§4. Empfänger: ein **neuer Agent, der die Anleitung nicht geschrieben hat**, je Runde ein neuer. Der Skill füllt `{{…}}`
und schickt alles unter der Linie. `{{VORIGE_BEFUNDE}}` ist in Runde 1 leer, ab Runde 2: „Befunde der vorigen Runde
(prüfe je Befund, ob er behoben ist; urteile trotzdem über alle Kriterien neu): …“ und die Antwort bekommt die Zeile
„Vorige Befunde“.

---

Du prüfst eine Anleitung „Mit echten Dingen“ (kurzes Spiel mit Alltagsdingen, das Kind und Erwachsene zusammen
spielen) für das Thema `{{THEMA}}`. Du hast sie nicht geschrieben und sollst sie nicht verbessern, sondern beurteilen.
Arbeitsordner `{{WORKTREE}}`: nur lesen, nichts ändern, nichts committen, keine Unteragenten.

**Lies nur:** die Datei `spiele/mit-echten-dingen/{{FACH}}/{{DATEI}}.md` (beim Einzelthema ist `{{DATEI}}` =
`{{THEMA}}`; bei einer Familie stehen alle Themen unter `themen:` im Kopf), den Eintrag jedes dieser Themen in
`spiele/lernplan.json`, `docs/mit-echten-dingen.md` (ganz) und `docs/grundsaetze.md`. Nicht die Git-Historie, keine
anderen Anleitungen, nicht die Prüfberichte `runde-*.md` in `{{PRUEFUNGEN}}` (die Bilder dort darfst du ansehen). Öffne mindestens eine der Quellen im Kopf der Datei (Web) und vergleiche
(E7). Für E11: das Objekt aus `bild` im Kopf (`spiele/objekte/<figur>.js`) im genannten Zustand ansehen
(`NODE_PATH=/private/tmp/claude-501/pw/node_modules node tests/browser/objektbilder.mjs <Scratchpad>/objekte
spiele/objekte/<figur>.js`) und mit den Bildern der anderen Anleitungen des Fachs vergleichen (je `bild` im Kopf).

{{VORIGE_BEFUNDE}}

| Nr. | Kriterium |
|---|---|
| E1 | trifft genau das Thema und isoliert seine Schwierigkeit; bei einer Familie (`themen:`): trägt jedes Thema der Liste |
| E2 | „Darauf kommt es an“ benennt den Kern sachlich richtig |
| E3 | nur Alltagsdinge, nichts zu kaufen, sicher |
| E4 | Anrede „ihr“, kurze Sätze, für ein Kind der Klassenstufe lesbar |
| E5 | neutral: kein Lob, kein Abfragen, kein Druck, keine Klischees |
| E6 | Fachbegriffe nach §5.1 |
| E7 | eigene Worte, Quellen angegeben (der Prüfer öffnet mindestens eine Quelle und vergleicht) |
| E8 | Leichter und Schwerer sinnvoll, Dauer etwa 5 Minuten |
| E9 | Methode laut Recherche wirksam für dieses Thema (Quelle im Kopf); die Handlung ist praxisnah und hat einen Zweck über das Üben hinaus |
| E10 | jede Variante passt wirklich zur Situation und trifft dasselbe Thema; keine erzwungene Variante |
| E11 | Bild: Alltagsding passt, erkennbar, im Stil der Runde (`bild` im Kopf, Objekt in `spiele/objekte/`, „Bild der Karte“) |
| E12 | In Bewegung: da; jede Bewegung trägt den Inhalt; zeigt sie das Prinzip nicht selbst, steht vorn „Zum Verinnerlichen“ mit der Form zum Verstehen; sicher, ohne Wettlauf |

E9 bei einer Form zum Verinnerlichen: Spaß an der Bewegung und Behalten genügen; den Alltagszweck trägt die Form zum
Verstehen.

**Grün heißt:** alle zwölf grün, kein kritischer Befund. Im Zweifel rot.

Schreib deine Antwort außerdem unverändert in die Datei `{{BERICHT}}` (außerhalb des Arbeitsordners; die einzige
Datei, die du schreibst).

**So sieht deine Antwort aus** (nichts davor, nichts danach):

```
Ergebnis: GRÜN | ROT

| Nr. | grün/rot | Beleg (Zitat aus der Datei mit Zeile) | Befund, falls rot |
|---|---|---|---|
… eine Zeile je Kriterium E1 bis E12

Kritische Befunde:
- <Befund> – <Beleg> – <was es lösen würde>   (oder „keine“)

Vorige Befunde: <je Befund behoben / nicht behoben mit Beleg>   (nur ab Runde 2)
```
