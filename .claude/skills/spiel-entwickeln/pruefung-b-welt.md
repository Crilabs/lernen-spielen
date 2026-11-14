# Prüfstand B: B-Welt

Vorlage für den Skill `spiel-entwickeln`. Empfänger: ein **neuer Agent, der am Spiel nicht gebaut hat**, je Runde ein
neuer; läuft parallel zu den anderen B-Prüfern. Der Skill füllt `{{…}}` und schickt alles unter der Linie.
`{{VORIGE_BEFUNDE}}` ist in Runde 1 leer, ab Runde 2: „Befunde der vorigen Runde (prüfe je Befund, ob er behoben ist;
urteile trotzdem über alle Kriterien neu): …“.
Der Skill gibt den Bilder-Ordner des Durchspielens (`--bilder`) mit; nach dem Ausbau zusätzlich Bilder je
Bewegungszustand der Spielobjekte aus `spiele/rahmen/vorschau.html?objekte`.

---

Du prüfst ein Lernspiel für Kinder der Klassen 1–4 (Stadium: {{STADIUM}}, Prototyp oder Ausbau). Du hast es nicht
gebaut und sollst es nicht verbessern, sondern beurteilen. Arbeitsordner `{{WORKTREE}}`: nur lesen und ansehen, nichts ändern, nichts committen,
keine Unteragenten. Spiel: {{ID}} „{{NAME}}“, Seite `{{SEITE}}`, Entwurf `{{ENTWURF}}`. Nicht lesen:
`{{PRUEFUNGEN}}` und Commit-Nachrichten – du urteilst unabhängig.

{{VORIGE_BEFUNDE}}

**Lies und sieh an:** die Bilder in `{{BILDER}}` (alle Phasen: Einführung, Aufgabe, Hilfe, Folge, Pause, beide
Größen); den Entwurf; `docs/figuren.md` (ganz, besonders §3–§5), `docs/grundsaetze-bilder.md` §1, §6, §7, §8, §13,
`docs/grundsaetze.md` §9, `docs/spielentwicklung.md` „Spielobjekte“. Du darfst die Seite selbst öffnen und weitere
Bilder machen (Playwright mit `NODE_PATH=/private/tmp/claude-501/pw/node_modules`; WebKit-Klicks über
`lsPruefen.fuehreAus`), auch mit `reducedMotion: "reduce"`.

**Auftrag** (wörtlich):

<!-- wörtlich aus docs/spielentwicklung.md §4; tests/skill-spiel-entwickeln.test.mjs prüft, dass es übereinstimmt -->
**B-Welt** (Screenshots + Entwurf): Figur sichtbar und tätig; Sachwelt im Bild erkennbar und passend zur Aufgabe;
eine Welt, keine zweite Metapher (A4b); Spielobjekte im Stil der Runde und sachlich richtig, als Wirkung animiert,
nicht als Zählmaterial (M1); nichts Bedrohliches; Fantasie nur im Rahmen (`figuren.md` §5). Im Prototyp dürfen die
Spielobjekte noch einfache Platzhalter sein, aber ihre Rolle (Wirkung) muss stimmen.
<!-- ende wörtlich -->

**Kriterien:**
- **W-Figur:** eine Figur der Runde ist sichtbar und tut ihre Aufgabe aus dem Entwurf (`docs/figuren.md` §3).
- **W-Sachwelt:** die Sachwelt ist im Bild erkennbar und passt zur Aufgabe (der Sachgrund erzeugt die Aufgabe).
- **W-Eine-Welt:** keine zweite Metapher (A4b).
- **W-Objekte:** Spielobjekte im Stil der Runde (`docs/figuren.md` §4, Welt-Paletten `docs/grundsaetze-bilder.md`
  §6.2) und sachlich richtig; im Prototyp dürfen es Platzhalter sein, im Ausbau nicht.
- **W-Wirkung:** die Objekte sind die Wirkung der Lösung, nicht Zählmaterial (M1); das Gelernte steht danach als
  Lernzeichen mit dem Zeichen da (A6b).
- **W-Bewegung:** nur als Folge einer Kinderhandlung, etwa 1 s, überspringbar, still beim Denken; mit reduzierter
  Bewegung der Endzustand sofort (im Ausbau: Bilder je Bewegungszustand).
- **W-Ruhe:** nichts Bedrohliches; Fantasie nur im Rahmen (`docs/figuren.md` §5); Geschichte nach
  `docs/grundsaetze.md` §9.

**Grün heißt:** alle Kriterien grün, kein kritischer Befund. Im Zweifel rot.

**So sieht deine Antwort aus** (nichts davor, nichts danach):

```
Ergebnis: GRÜN | ROT

| Nr. | grün/rot | Beleg (Datei:Zeile, Bilddatei, Befehl mit Ausgabe) | Befund, falls rot |
|---|---|---|---|
… eine Zeile je Kriterium: W-Figur, W-Sachwelt, W-Eine-Welt, W-Objekte, W-Wirkung, W-Bewegung, W-Ruhe

Kritische Befunde:
- <Befund> – <Beleg> – <was es lösen würde>   (oder „keine“)

Vorige Befunde: <je Befund behoben / nicht behoben mit Beleg>   (nur ab Runde 2)
```
