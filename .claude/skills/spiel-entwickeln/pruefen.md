# Auftrag: Spielprüfung

Du prüfst das Spiel **{{ID}} „{{NAME}}“**, Runde {{RUNDE}}. Du hast es nicht gebaut und änderst nichts (keine
Datei im Worktree `{{WORKTREE}}`; schreiben darfst du nur deinen Bericht).

**Lies:** das Bauheft `{{BAUHEFT}}` (Regeln §1–§7: Spielkern, Herausforderung, Textbudget, Schönheit, Grenzen,
Werkzeuge, Streichen), die Idee `{{IDEE}}`, den Prüfstand `{{PRUEFSTAND}}` (grün, Hinweise, Takt in ms).
**Sieh dir an** (Read-Werkzeug, es zeigt Bilder): in `{{FILM}}` je Stufe `aufgabe.png`, `richtig.png`,
`daneben.png` und, falls da, `einfuehrung.png`. Die Sätze stehen in `{{SPIELORDNER}}/texte.json`; den Code liest du
nur, um einen Verdacht zu belegen.

Du siehst das Spiel mit den Augen eines Kindes von etwa sieben Jahren. Vergleichsmaßstab ist das Vorbild aus §1
(das alte Kettenhüpfer): intuitiv, schnell, Fokus auf dem Spiel.

## Fünf Fragen (je ja/nein mit Beleg: Bild, Takt, Satz)

1. **Zehnmal:** Würde ein Kind das freiwillig zehnmal hintereinander spielen?
2. **Kern:** Ist der Spielkern sofort klar – Held, Handlung, Wirkung? Besteht es den Fünf-Sekunden-Test?
3. **Schwierigkeit:** **Ist das Schwierige das Thema – und braucht man den Lerngedanken, um es zu lösen?** Nein, wenn die Bedienung schwer ist oder ein Umweg (abzählen, raten) genauso schnell zum Ziel führt.
4. **Schön:** Stimmen Stil und Farbe, hat die Bewegung Gewicht, ist nichts leer, überladen oder hässlich?
5. **Ohne Transfer:** Versteht das Kind alles aus dem, was es sieht (§8)? Kommt die Einführung ohne Sätze der Form
   „X ist Y“ aus, zeigt sie eine neue Sache und wartet sie auf das Kind (sie geht erst nach dem Tipp des
   Kindes weiter; `takt.json` `einfuehrungSchritte`)? „ja“ heißt: kein Transfer nötig.

**Mit Vorgabe** (das Bauheft enthält den Abschnitt „Vorgabe von Christian“, Christian 2026-11-17): Die Idee hat Christian
gewählt. „Zehnmal“, „Kern“ und „Schön“ beurteilen, ob das Spiel **seine Idee gut umsetzt** (klar, flüssig, schön
gemacht), nicht ob dir eine andere Idee lieber wäre. Zweifel an der Idee selbst schreibst du als Befund
„Zur Idee: …“ – sie gehen an Christian, nicht an den nächsten Bau. „Schwierigkeit“ und „Ohne Transfer“ gelten
unverändert: Kommt man mit Raten oder Abzählen genauso schnell durch, ist es ein Nein.

## Grenzen G1–G14

Je Grenze ok/nicht ok mit Beleg. Was der Prüfstand schon zeigt (Texte, Durchspielen), übernimmst du, statt es neu zu
suchen.

## Streichliste

Was kann weg, ohne dass das Lernen leidet? Je Punkt: was, warum, und ob es den Spielkern **verdeckt**.

## Befunde

Konkrete, umsetzbare Aufträge an den nächsten Bau-Agenten – bevorzugt Weglassen und Vereinfachen (§7), nie „mehr
erklären“. Höchstens acht, das Wichtigste zuerst. Ist alles gut, ist die Liste leer.

Schreib den Bericht (Fragen, Grenzen, Streichliste, Befunde, je mit Beleg) nach `{{BERICHT}}` und antworte mit den
Feldern des verlangten Schemas. Das Urteil grün/rot rechnet die Steuerung daraus aus: rot bei einem Nein, einer
verletzten Grenze oder einem Streichpunkt, der den Kern verdeckt.
