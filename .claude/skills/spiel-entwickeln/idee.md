# Auftrag: Idee

Du erfindest das Spiel **{{ID}} „{{NAME}}“** für Kinder von Vorschule bis Kl. 4. Du baust nichts.

**Lies nur das Bauheft** `{{BAUHEFT}}`. Es enthält die Regeln (Spielkern, Grenzen, Werkzeuge, Streichen), den
Katalog-Eintrag, die Themen und was es schon gibt. Andere Dokumente liest du nur, wenn dir eine bestimmte
Einzelheit fehlt, und dann nur den Abschnitt. Das Vorbild aus den Regeln §1 darfst du dir ansehen:
`git show 4633d0a:spiele/einmaleins.html`.

Arbeitsordner: `{{WORKTREE}}` (Branch `{{BRANCH}}`). Niemanden fragen, keine Unteragenten, nicht pushen.

## Was du schreibst

`{{IDEE}}`, **höchstens 60 Zeilen**, Stichpunkte, in dieser Reihenfolge:

1. **Spielkern** – Held (wer oder was, was tut er), Handlung des Kindes, Wirkung (was man sieht und hört, Dauer in
   Sekunden), Takt (Sekunden von Aufgabe zu Aufgabe für ein sicheres Kind). Ein Satz: „Ein Kind sieht … und weiß
   sofort, dass es … soll.“ Lernweg: der Umweg, mit dem ein Kind ohne den Lerngedanken durchkäme, und warum er hier länger ist (§1).
2. **Woher die Schwierigkeit kommt** – eine Zeile, aus dem Stoff oder aus einer Entscheidung des Kindes (§2).
3. **Bühne** – ein Ort, an dem man gern ist (§4), das Lernfeld als Matte, ein, zwei Dinge, keine Sachwelt (§6); wo der Held steht, ohne das Material zu verdecken.
4. **Eine Aufgabe, Sekunde für Sekunde** – richtig, daneben (die Sache zeigt, was die getippte Antwort wirklich
   ist), Hilfe Stufe 1 und 2.
5. **Stufen** – was sich zwischen material, vorstellung und kopf ändert (nur das Nötige).
6. **Alle Sätze wörtlich** – Erzähler, dritte Person, Textbudget §3 (je Aufgabe höchstens ein Satz; die Einführung als kleine Geschichte nach §8, jeder Satz in der Satzlänge). Sätze, die aus Daten entstehen, als Muster („{a} · {n} = {c}.“).
7. **Freude** – zwei bis drei Varianten der Wirkung, die Klänge, ein kleiner Witz des Helden ab und zu.
8. **Daten** – Eintrag in `spiele/spiele.json` (id, titel, thema, kategorie, symbol, datei, text, beschreibung,
   arten mit stufen, regal; das Spielbild `bild` macht der Abschluss); Aufgabenart aus `spiele/aufgabenarten.js` oder neu (dann: was sie braucht).
9. **Bausteine** – je Teil „vorhanden: <Pfad>“ oder „neu“. Neues **Lernzeichen** (Bedeutung für alle Spiele)? Dann
   eine Zeile „Freigabe nötig: <Frage an Christian>“. Einführung: `spiele/rahmen/einfuehrung-lauf.js`.
10. **Gestrichen** – was du aus Katalog-Eintrag, Welt oder einem vorhandenen Spiel bewusst weglässt, je eine Zeile
    mit Grund (§7). Diese Liste ist erwünscht, nicht verdächtig.

Gesetzt ist nur, was mit „Christian“ und Datum markiert ist; widerspricht es dem Spielkern, schreib den Widerspruch
unter „Freigabe nötig“ und bau den Spielkern trotzdem so gut es geht.

Committen: `docs({{ORDNER}}): Spielidee` mit Leerzeile und `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

Antwort: die Felder des verlangten Schemas; `zusammenfassung` in zwei Sätzen, wie sich das Spiel anfühlt.
