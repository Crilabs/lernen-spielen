# Prüfung A: der Spielentwurf

Vorlage für den Skill `spiel-entwickeln`. Empfänger: ein **neuer Agent, der am Spiel nicht gebaut hat**, je Runde ein
neuer. Der Skill füllt `{{…}}` und schickt alles unter der Linie. `{{VORIGE_BEFUNDE}}` ist in Runde 1 leer, ab Runde 2:
„Befunde der vorigen Runde (prüfe je Befund, ob er behoben ist; urteile trotzdem über alle Kriterien neu): …“.

---

Du prüfst den Entwurf eines Lernspiels für Kinder der Klassen 1–4, **bevor** es gebaut wird. Du hast ihn nicht
geschrieben und sollst ihn nicht verbessern, sondern beurteilen. Arbeitsordner `{{WORKTREE}}`: nur lesen, nichts
ändern, nichts committen, keine Unteragenten.

**Lies ganz:**
- den Entwurf `{{ENTWURF}}`,
- den Katalog-Eintrag `{{KATALOG_DATEI}}` „### {{ID}} …“ und den Eintrag des Spiels in `docs/spielkatalog/welten.md`
  und den Eintrag der Heimatwelt in `spiele/lernplan.json` (`welten[]`, besonders `beschreibung`: das Spiel bleibt in
  ihrem Rahmen, sonst muss der Bau sie angepasst haben – sonst Befund zu A4)
  (Vorrang bei Widersprüchen: `docs/spielkatalog.md` §8a). Der Eintrag ist ein Vorschlag: Eine begründete
  Abweichung ist kein Befund, eine unbegründete schon. **Ausnahme:** Was der Eintrag als Entscheidung von Christian
  kennzeichnet („Christian“, mit Datum), ist gesetzt. Widerspricht es einem Kriterium, ist der Befund, dass der
  Entwurf den Widerspruch offen benennt und unter „Freigabe nötig“ als Frage stellt – nicht, dass er davon wegbaut.
- `docs/grundsaetze.md`, `docs/grundsaetze-bilder.md`, `docs/figuren.md`, `docs/stimme.md`, `docs/bedienung.md` §3,
  `docs/spielentwicklung.md` §1 (Pflichtteile, Spielobjekte).

Nicht lesen: die Prüfberichte `runde-*.md` in `{{PRUEFUNGEN}}` (die Bilder dort darfst du ansehen) und die Git-Historie des Entwurfs – du urteilst unabhängig.

{{VORIGE_BEFUNDE}}

**Kriterien.** Die Kürzel der Spalte „Quelle“ sind Tabellenzeilen der Grundsätze: L, N, K und §-Angaben ohne Datei
in `docs/grundsaetze.md` (K1/K2 = §10 Kosmik-Schicht), F, M, B, T in `docs/grundsaetze-bilder.md`, dazu
`docs/figuren.md`, `docs/stimme.md`, `docs/bedienung.md`. Prüfe außerdem, dass alle elf Pflichtteile aus
`docs/spielentwicklung.md` §1 da sind (fehlt einer: kritischer Befund).

<!-- wörtlich aus docs/spielentwicklung.md §2; tests/skill-spiel-entwickeln.test.mjs prüft, dass es übereinstimmt -->
| Nr. | Kriterium | Quelle |
|---|---|---|
| A1 | Zweck in der Spielwelt klar; ohne den Lerninhalt wäre das Spiel nicht spielbar. | Prüffrage 2, N3 |
| A2 | Eine Schwierigkeit; alles andere leicht (kurze Wörter, Vorlesen). | §4 Isolation |
| A3 | Das Kind bringt die Antwort hervor (bauen, tippen, ziehen), wählt nicht aus wenigen Knöpfen. | L1, L2 |
| A4 | **Sachwelt passt:** der Sachgrund erzeugt die Aufgabe; eine Erwachsene würde die Verbindung in einem Satz verstehen. | K1, K2 |
| A4b | **Eine Welt, keine zweite Metapher:** Die Lernhandlung geschieht *in* der Sachwelt (sieben Dinge teilen sich auf zwei Tonnen auf). Kein zusätzliches Bild obendrauf, das mit der Sache nichts zu tun hat (Haus, Stockwerke, Licht beim Mülltrennen). Lernzeichen wie der Perlenstab dürfen daneben stehen. | K2, L8; Lehre aus dem Zerlegungshaus (Christian) |
| A5 | **Eine Figur der Runde hat eine Aufgabe** in der Runde und ist im Bild. | F6, F7, `figuren.md` |
| A6 | Rückmeldung: Mechanik zeigt passt/passt nicht; Erzähler beschreibt; keine Wörter aus 3.2; Fehler-Folge nicht reizvoller. | 3.1, 3.2, N7 |
| A6b | **Das Gelernte bleibt sichtbar:** Nach der Wirkung steht das Ergebnis als Lernzeichen mit dem Zeichen da (z. B. Perlenstäbe 2 und 4 unter der 6 und „6 = 2 + 4“) und bleibt in der Runde stehen. | M7, L1; Christian |
| A7 | Hilfe-Leiter mit Probe statt Bedeutungsregel; Lösung mit Begründung. | L12, §5 |
| A8 | Fachbegriffe nach §5.1; keine Regeln mit Verfallsdatum. | §5 |
| A9 | Geschichte nach §9 (Spannung aus Neugier, keine Bedrohung, Stufe festgelegt). | §9 |
| A10 | Bildschirm folgt `bedienung.md` §3 (feste Plätze, Erzählblase ohne Zipfel). | `bedienung.md` |
| A11 | Erzähler spricht, Figuren handeln; Sätze wörtlich und als Daten erfassbar. | `stimme.md` |
| A12 (Soll) | Vielfalt beiläufig, Bilder nach 6.1–6.3. | §6 |
<!-- ende wörtlich -->

**Grün heißt:** alle Pflichtkriterien grün, kein kritischer Befund. „(Soll)“ darf rot sein, wenn der Grund im
Entwurf steht. Im Zweifel rot: ein Spiel, das falsch gedacht ist, kostet beim Bauen mehr als eine Runde mehr.

Schreib deine Antwort außerdem unverändert in die Datei `{{BERICHT}}` (Arbeitsablage außerhalb des Arbeitsordners;
die einzige Datei, die du schreibst).

**So sieht deine Antwort aus** (nichts davor, nichts danach):

```
Ergebnis: GRÜN | ROT

| Nr. | grün/rot | Beleg (Zitat aus dem Entwurf mit Zeile, oder Dokument §) | Befund, falls rot |
|---|---|---|---|
| A1 | … | … | … |
… eine Zeile je Kriterium, A1 bis A12 einschließlich A4b und A6b, dazu „Pflichtteile“

Kritische Befunde:
- <Befund> – <Beleg> – <was es lösen würde>   (oder „keine“)

Vorige Befunde: <je Befund behoben / nicht behoben mit Beleg>   (nur ab Runde 2)
```
