# Einhorn-Lernspiele

Alle Dateien in einen Ordner auf dem Webserver legen (PHP aktiv, Ordner beschreibbar):

- `index.html`        – Übersicht mit Links zu beiden Spielen
- `zahlenzauber.html` – Zahlenzauber (Kakooma: zwei Blüten ergeben eine dritte; Fäden zeigen geprüfte Paare,
  Stufen bis 10 → 20 → Minus → 30 → 100 je nach Tempo). Elternansicht: `zahlenzauber.html?eltern`.
- `zahlen-save.php`   – Lernstand Zahlenzauber → `zahlen.json`
- `save.php`          – alter Spielstand (`spielstand.json`); nur noch zum einmaligen Übernehmen der Einhörner
- `perlenbruecke.html`– Perlenbrücke (Zahlzerlegung 2–10 mit Montessori-Perlenstäbchen)
- `bruecke-save.php`  – Lernstand Perlenbrücke → `bruecke.json`
- `wimmelbild.html`   – Wimmelbild-Detektiv (Nomen: Wortkärtchen auf Dinge im Bild ziehen)
- `wimmel-save.php`   – Lernstand Wimmelbild → `wimmel.json` (Elternansicht: `wimmelbild.html?eltern`)
- `bilder/`           – Wimmelbilder: je Bild `<name>.jpg` + `<name>.json` (Bereiche), Reihenfolge in `bilder/index.json`.
  Bereiche als `[x1,y1,x2,y2]` in Prozent des Bildes. Kontrolle: `wimmelbild.html?pruefen` (zeigt alle Bereiche,
  Tippen zeigt die Koordinate), einzelnes Bild mit `?pruefen&bild=<name>`.
- `einhorn-steine.html` – Einhorn-Steine (Leerzeichen beim Schreiben: diktierten Satz tippen, jedes Wort wird ein Trittstein).
  Rechtschreibung/Lautsprache zählt nicht, nur die Abstände. Elternansicht: `einhorn-steine.html?eltern`.
- `steine-save.php`   – Lernstand Einhorn-Steine → `steine.json`
- `saetze/saetze.json` – Diktatsätze für Einhorn-Steine; eigene Sätze einfach ergänzen (`stufe` 1–3 optional).
  Test der Auswertung: `node docs/tests/steine-auswertung-test.mjs`
- `grossbuchstaben.html` – Großbuchstaben-Zauberer (Nomen großschreiben: Wörter antippen, richtiger Satz wird vorgelesen und gespielt).
  Elternansicht: `grossbuchstaben.html?eltern`, einzelne Szene ansehen: `?szene=<typ>` (ueber, zu, schlaf, frisst, tanz, rollt, versteckt, fliegt, jagt; optional `&d=<ding>&s=<figur>`).
- `zauber-saetze.js`  – Satz-Baukasten (Figuren × Tätigkeiten × Dinge, Grammatik)
- `zauber-save.php`   – Lernstand Großbuchstaben-Zauberer → `zauber.json`
- `figuren/`          – SVG-Figuren und Dinge für den Zauberer, je Datei eine (`figuren.js` = Baukasten und Bewegungen).
  Galerie zum Ansehen: `docs/superpowers/probe/figuren.html` (lokal öffnen, wird nicht hochgeladen).
- `pausenbilder/`     – Pausenbilder (z. B. Einhörner), erscheinen nach jeder Wimmelbild-Runde. Neues Bild als JPG
  ablegen und in `pausenbilder/index.json` eintragen; Häufigkeit über `PAUSE_ALLE` in `wimmelbild.html`.

Beide Spiele haben einen Link zurück zur Übersicht (🏠). Die JSON-Dateien legt PHP beim ersten Speichern an;
bei Updates nur die HTML-Dateien ersetzen, die Spielstände bleiben. Ohne PHP wird im Browser (localStorage) gespeichert.

Einstellungen stehen jeweils oben im Script der HTML-Datei (Zahlenzauber: Stufen, Aufstiegs-Regel, Besuche auf der Wiese;
Perlenbrücke: Tempo-Schwelle, „gelernt“-Regel, OVERUSE, Überraschungen).

## Hochladen

Zugangsdaten in `.env` eintragen, dann `./deploy.sh --test` (zeigt nur an) bzw. `./deploy.sh`.
Es werden nur geänderte Dateien übertragen, auf dem Server wird nichts gelöscht, Spielstände bleiben unberührt.
Nicht hochgeladen: `.env`, versteckte Ordner, `docs/`, `README.md`, `ideen.txt`, `deploy.sh`.
