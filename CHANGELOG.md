# Änderungen

## Unveröffentlicht

- Neue Ansichten, übersichtlich und ohne Zahlen beim Kind:
  - **Startseite:** oben bis zu drei Spiele, deren Thema gerade dran ist; darunter die Fächer, für die es Spiele gibt; unten „Mein Regal“. Ohne Spiele bleibt eine ruhige Seite mit dem Regal.
  - **Fach-Seite:** der Weg eines Fachs mit dem, was schon gekonnt ist, was dran ist (Sonnenring) und zwei Themen in Sicht. Ein Thema antippen zeigt seine Spiele und, falls es eine gibt, „Geschichte ansehen“.
  - **Mein Regal:** Was das Kind kann, steht als Lernmaterial auf einem Holzregal, ein Brett je Fach (Perlenstäbchen, Wortart-Zeichen, Buchstabenkarten). Neues leuchtet beim nächsten Besuch einmal ruhig auf; ein zurückgesetztes Thema verschwindet still. Auch Gekonntes aus entfernten Spielen bleibt stehen.
  - **Mit echten Dingen:** Bei Themen und im Regal öffnet ein Knopf eine Karte mit einer Anregung für den Alltag, für den Erwachsenen, der mit dem Kind schaut. Ohne PIN, weil es zum gemeinsamen Machen gehört.
- Elternbereich nur noch für Erwachsenes: Lernstand (beschreibend, mit Bezug zur Klasse, Eingriffe mit „Wirklich?“), Geschichten, Gerät, Hinweise und Sicherheit. Die Stimmenwahl entfällt (eine Stimme für alle). Ton an/aus, Regal und Anregungen brauchen keine PIN. Der Zugang bleibt: Zahnrad auf der Startseite drei Sekunden halten.
- Geschichten-Stufe: Im Elternbereich lässt sich wählen, wie aufregend Geschichten sein dürfen (Ruhig, Sanft – Standard –, Abenteuer), mit einem Beispielsatz je Stufe. Die Spiele richten sich danach, sobald sie Geschichten erzählen.

- Die Einführungen vor einem neuen Thema erzählen jetzt mit den Kindern der Runde (Ela, Kofi, Lena, Timo) statt mit dem Einhorn. Die alten Figuren und Wimmelbilder der entfernten Spiele sind gelöscht.
- Die ersten sechs Spiele (Zahlenzauber, Perlenbrücke, Kettenhüpfer, Wimmelbild, Zauberin, Einhorn-Steine) sind entfernt. Sie werden nach den Grundsätzen neu gebaut, je Thema ein passendes Spiel. Bis dahin ist die Startseite leer. Alte Lernstände werden nicht übernommen.
- Natürliche Stimme vorbereitet: Die Spiele spielen vorab erzeugte Aufnahmen (Azure Speech) ab, sobald es sie gibt, sonst spricht wie bisher die Systemstimme. Im Elternbereich heißt die Systemstimme jetzt „Ersatzstimme“, dazu ein Hinweis, dass die Stimme computererzeugt ist. Erzähler ist Florian (Azure), 10 % langsamer; Figuren sprechen nicht selbst (`docs/stimme.md`). Neue Anhör-Seite `npm run audio:anhoeren`.

- Aufgeräumt: Reste der früheren Web-Fassung (PHP, FTP-Upload) sind entfernt.
- Lernstand je Profil: Die Daten des Kindes liegen jetzt im Unterordner `lernstand\kind-1\`; `eltern.json` (PIN) bleibt im Ordner darüber. **Einmaliger Handgriff beim Aktualisieren des Kiosks**, direkt nach dem Update, bevor das Kind spielt (die App startet nach dem Update einmal selbst neu):
  1. Die App beenden: im Elternbereich auf „App beenden“ tippen. Nur wenn das nicht geht: Tastatur anschließen, Strg+Alt+Entf → Task-Manager (siehe „PIN vergessen“ im README).
  2. Im Explorer in die Adresszeile `%APPDATA%\de.crilabs.lernen-spielen\lernstand\` eingeben.
  3. Dort einen Ordner `kind-1` anlegen (gibt es ihn schon, weil die neue Version schon einmal lief: einfach weiter).
  4. Alle Dateien **außer** `eltern.json`, `eltern.json.bak`, `geraet.json` und `geraet.json.bak` in `kind-1` verschieben (auch die übrigen `.bak`-Dateien). Fragt Windows, ob vorhandene Dateien ersetzt werden sollen: ja, ersetzen (die neuen Dateien in `kind-1` stammen dann vom ersten Start mit leerem Stand).
  5. App wieder starten.

  Ohne den Handgriff beginnt das Kind mit leerem Lernstand, die PIN bleibt.
- Eine Stimme für alle Spiele: Die Stimmenwahl gilt jetzt für alle Spiele gemeinsam und wird je Gerät gemerkt. Zahlen werden weiterhin nie gesprochen. Der Ton-Knopf wird je Spiel gemerkt (früher gespeicherte Ton- und Stimmeneinstellungen werden nicht übernommen: Ton an, Stimme automatisch).
- Elternbereich je Gerät: Update, Beenden und Kiosk erscheinen nur dort, wo das Gerät sie kann (Windows-Kiosk), nicht mehr im Browser oder auf anderen Geräten.
- Intern: aller Plattform-Zugriff (Speicher, Einstellungen, Sprache, Gerätefunktionen) liegt in `spiele/kern/`; ein Test sorgt dafür, dass Spiele ihn nicht mehr umgehen.
- Die App heißt jetzt **Lernen Spielen**. Startseite und „Was ich kann“ kommen ohne Einhorn aus; die Spiele selbst sind noch unverändert und werden einzeln umgebaut.
- Lernplan für die ganze Grundschule: rund 950 kleine Themen in Mathe, Geometrie, Lesen, Schreiben (mit Druck- und Schreibschrift), Grammatik und dem neuen Bereich Sprechen und Zuhören. Klasse 1 und 2 sind ausführlich beschrieben, mit Ziel, Beispielen, einem Alltagszweck und einem Hinweis für Eltern; Klasse 3 und 4 sind grob angelegt. Themen ohne Spiel bleiben für das Kind unsichtbar, an den vorhandenen Spielen ändert sich nichts.
- Lernplan: 42 typische Fehlerbilder (z. B. Zahlendreher, Rechnen durch Zählen, Spiegelschrift, vergessene Wortgrenzen) mit Erkennungsmerkmal, passenden Übungsthemen und ruhigen Hinweisen für Kind und Eltern. Noch ohne Auswertung in den Spielen.
- Lernplan: Die Mathe-Spiele folgen jetzt einem gemeinsamen Plan aus vielen kleinen Themen (zum Beispiel „Die 7 zerlegen“ oder „Plus ohne Zehnerübergang bis 20“). Die App sucht das passende Thema selbst aus; das Kind muss nichts wählen.
- Eine kurze Probe zu Beginn eines neuen Themas überspringt, was das Kind schon kann. Fehler und Hilfen führen ruhig zurück zum Üben; bekannte Aufgaben kommen nach einigen Tagen noch einmal vor.
- Vor einem neuen Thema erzählt eine kurze Einführung mit dem Einhorn, worum es geht.
- Neue Seite „Was ich kann“: ein ruhiger Weg mit Stationen zeigt, welche Themen schon gekonnt sind und welches als Nächstes kommt, ohne Punkte, Zähler oder Prozente.
- Elternbereich: zeigt die Themen mit Hinweis, was man zu Hause tun kann. Themen lassen sich als gekonnt markieren, zurücksetzen oder freigeben.
- Perlenbrücke: drei Stufen, erst mit den Perlen zum Anfassen, dann nur im Kopf mit Vorstellung, zuletzt ganz im Kopf.
- Die Computerstimme spricht keine Zahlen mehr; Zahlen stehen groß im Bild oder in der Sprechblase.
- Spiele mit dem Lernplan (Perlenbrücke, Zahlenzauber) haben auf der Startseite keinen Fortschrittsbalken mehr.
- Mathe-Spiele lesen keine Zahlen mehr vor: Die Computerstimme sprach Zahlen oft falsch („eins mal fünf“, „fünfter“). Kettenhüpfer und Perlenbrücke zeigen ihre Sätze jetzt in einer Sprechblase mit Ziffern (z. B. „5 · 7 = 35. Und noch ein Stäbchen?“), der Zahlenzauber zeigt nur noch Text. Die Klänge bleiben.
- Kettenhüpfer: Bei einer falschen Zahl steht kurz und klar „6 Stäbchen sind nicht 48.“
- Einhorn-Steine: Das Spiel bleibt nicht mehr hängen, wenn die Eingabe ganz anders ist als der Satz. Die Zeile schüttelt sich, das Einhorn schaut ratlos, dann wird die Zeile geleert und der Satz noch einmal diktiert. Bisher blieb der Text stehen, der nächste Versuch hängte sich daran, und ohne Ton passierte scheinbar nichts mehr.

## v0.1.8

- Kettenhüpfer: Nach einer richtigen Antwort geht es erst weiter, wenn der Satz („Sechs mal sieben ist zweiundvierzig.“) ganz gesprochen ist.
- Kettenhüpfer: Ist die Runde voll, kommen falsch gelöste Aufgaben sofort noch einmal, ohne zusätzliche neue Aufgaben davor.
- Kettenhüpfer: Bei einer falschen Zahl schaut das Einhorn verdutzt zu dem Pfeilchen, das zeigt, wo die Zahl liegt.

## v0.1.7

- Neues Spiel **Kettenhüpfer** (Mathe, kleines Einmaleins): Eine Montessori-Perlenkette liegt eingerollt auf dem Arbeitsteppich. Das Kind tippt das Ergebnis ein (z. B. 6 · 7), dann rollt die Kette aus und das Einhorn hüpft sechs Stäbchen weit. Richtig: Das Pfeilchen 42 rastet am Stäbchenende ein (beim Quadrat ein großes goldenes). Falsch: Das Pfeilchen zeigt, wo die getippte Zahl wirklich liegt. Ab dem zweiten Fehler hilft die passende Kernaufgabe (5 · 7 = 35, „und noch ein Stäbchen?“), ab dem dritten kommt die Lösung mit Begründung. Kernaufgaben (·1, ·2, ·5, ·10) zuerst, Ableitungen danach, Wiedervorlage über Tage, Pause: die Kette legt sich zum Perlenquadrat. Lernstand für Eltern mit `?eltern`.
- Startseite: Hat eine Kategorie drei oder mehr Spiele, werden die Kacheln etwas dichter, damit alle Platz haben.

## v0.1.6

- Zahlenzauber: Ein Blatt welkt nur noch, solange die zweite Zahl gesucht wird. Sind zwei Zahlen gewählt, steht jedes andere Blatt wieder frisch da – vorher konnte ausgerechnet das Ergebnisblatt welk aussehen. Ein leuchtendes Blatt (Hilfe) ist nie welk.
- Zahlenzauber: Die Stimme liest Zahlen als Wörter vor („zwei und drei sind zusammen fünf“) statt „fünfter“.
- Zauberer: Der Satz wird am Anfang einmal vorgelesen. Mit dem runden Sprechblasen-Knopf links unten kann das Kind ihn so oft hören, wie es will. Ist die Stimme beim Öffnen noch gesperrt, kommt der erste Satz bei der ersten Berührung.

- Einhornfotos als Pause gibt es nur noch im Wimmelbild. Perlenbrücke (Einhorn auf der Perlenbrücke im Abendlicht), Zauberer (Zauberin döst unter dem Sternenhimmel) und Einhorn-Steine (Einhorn schläft am Ufer, der Mond spiegelt sich) haben eigene gezeichnete Pausen: 10 Sekunden, kleiner Balken, keine Knöpfe.
- Fortschrittsbalken auf der Startseite jetzt für alle Spiele: Zahlenzauber (Plus und Minus bis 20), Zauberer (Nomen), Einhorn-Steine (Sätze). Schon Gelerntes zählt sofort, der Balken wächst nur.
- Schrift: Wörter, Sätze, Zahlen und Knöpfe in normaler Stärke (Andika 400), nur Überschriften etwas kräftiger.
- Alle Spiele nach den Lern-Grundsätzen nachgeschärft: kürzere Effekte (mehr Aufgaben pro Minute), Hilfe in drei Stufen (Signal, Denkhilfe, Lösung mit Begründung), mit Hilfe oder durch Raten Gelöstes zählt nicht als gekonnt, Deko ohne Bedeutung steht still, keine Fanfaren.
- Zahlenzauber: Fressen dauert nur noch etwa 2 s, die Perlen-Erklärung kommt nur nach Fehler oder Hilfe. Keine Besuche und keine Einhorn-Herde mehr.
- Perlenbrücke: Gelernte Aufgaben kommen nach 21 Tagen wieder (vorher nie). Fehlerszene höchstens 5 s, bei richtiger Brücke läuft das Einhorn hinüber statt Fanfare. Runden sind länger (20 Brücken), Raten lohnt sich weniger.
- Wimmelbild: Erst beim zweiten Daneben leuchtet das richtige Ding auf, das Wort zählt dann als Fehler. Kein Rundenpunkt mehr. Nach drei Szenen am Tag ein ruhiger Abschluss.
- Zauberer: Nur Wörter zählen, die verhext waren oder angetippt wurden. Die Zauberin niest bei Fehlern, wartet nur noch halb so lang, und der Probe-Stab zeigt auch die Erweiterungsprobe („der Hund – der kleine Hund“). Adjektiv-Fallen erst ab Runde 2. Nach drei Runden am Tag einmal ein ruhiger Halt.
- Einhorn-Steine: Riss mit gesprochener Lösung erst nach dem dritten Fehler, Glocke und Funken nur bei richtig gesetzter Lücke, ruhiger Hintergrund, Runden mit 6 Sätzen.

## v0.1.3

- Startseite: Das Einhorn steht jetzt auf der Wiese statt darüber zu schweben.
- Überall die gut lesbare Schrift Andika, nicht mehr die dicke Überschriften-Schrift.
- Perlenbrücke neu im Querformat: links und rechts je eine Spalte Perlenstäbchen, das Kind baut die Brücke aus zwei Teilen. Bei einem Fehler zeigt das Spiel länger und deutlich, warum es nicht passt. Fortschrittsbalken auf der Startseite.
- Einhorn-Steine im Querformat mit eigener Regenbogen-Tastatur auf dem Bildschirm und neuer Szene. Keine Emojis mehr.
- Wimmelbild: Knapp daneben zählt jetzt auch (größerer Treffer-Rand für Kinderfinger). Der Hilfe-Knopf erscheint erst nach 15 Sekunden je Wort.
- Großbuchstaben-Zauberer im Querformat mit neuer Spielleiterin: Eine Zauberin verhext den Satz (alle Buchstaben flackern), dann ist das Kind dran.
- Bei „Fertig!“ mit Fehler liest die Zauberin den Satz stumm und grübelt – eine bewusste Pause, in der nichts änderbar ist, damit Durchprobieren länger dauert als Nachdenken. Sie verrät dabei nicht, wo der Fehler steckt.
- Nach dem 2. Fehlversuch bringt sie die ein/eine-Probe, nach dem 3. zeigt sie auf die falschen Wörter und erklärt sie.
- Ist der Satz richtig, tritt sie zur Seite und die Szene spielt. Kein Startbildschirm mehr, Pause mit Einhornbild wie im Wimmelbild.
- Zahlenzauber neu im Querformat: Die Zahlen stehen auf den Blättern einer großen Blume, in der Mitte + oder −. Kein Startbildschirm, keine Seitenleiste – Ton, Haus und Hilfe schweben am Rand, fünf kleine Blumen zeigen die Runde.
- Das Kind wählt selbst, mit welcher Zahl es anfängt, und tippt dann eine zweite dazu. Eine andere Zahl antippen heißt „nächster Versuch“; schon probierte Blätter welken (blass und hängend), so sieht man, was man mit dieser Zahl schon gerechnet hat. Gelöst ist die Blume, sobald die drei passenden Zahlen gewählt sind – in jeder Reihenfolge.
- Als Fehler zählt nur, ein richtiges Paar zu verlassen, ohne das Ergebnis anzutippen. Hilfe-Knopf in drei Stufen (Tipp, Ergebnis leuchtet, Lösung zum Nachtippen).
- Ist die Blume gelöst, frisst das Einhorn sie Blatt für Blatt, danach zeigen Montessori-Perlenstäbchen (Farben wie in der Perlenbrücke) als kurze Pause, was das Kind herausgefunden hat: Die Teile gleiten zusammen, darunter wächst das Ganze gleich lang, über 10 als goldener Zehner und Rest. Nur diese Erklärung wird vorgelesen, sonst spricht das Spiel nicht.
- Minus-Blumen mit eigener Stufe; Zahlenraum wächst mit dem Tempo (bis 10, 20, 30, 100). Nach fünf Blumen schläft das Einhorn kurz, dann geht es von selbst weiter.

## v0.1.2

- Wimmelbild: fünf neue Szenen im Querformat (Dorfplatz, Strand, Weltraum, Safari, Zauberwald) mit neu markierten Dingen.
- Kein Startbildschirm mehr – das Spiel beginnt sofort.
- Nach jeder Szene kommt 10 Sekunden lang ein passendes Einhorn-Bild mit kleinem Balken, danach geht es von selbst mit der nächsten Szene weiter.
- Vorlesen funktioniert auch ohne vorheriges Antippen.

## v0.1.1

Fehlerbehebungen. Der Lernstand bleibt beim Update erhalten.

- Lernstand sicherer: Kann die App eine Lernstand-Datei einmal nicht lesen (z. B. weil sie gerade gesperrt ist),
  überschreibt sie sie nicht mehr mit einem leeren Stand. Für dieses Spiel wird dann bis zum nächsten Öffnen
  nicht gespeichert, und im Protokoll steht ein Hinweis.
- Die letzte Antwort geht nicht mehr verloren, wenn das Kind gleich danach aufs Haus tippt.
- Die App kommt von selbst zurück, wenn sie minimiert wurde (z. B. durch Wischen mit drei Fingern nach unten).
  Beim Beenden über den Elternbereich und während eines Updates bleibt sie zu.
- Der Elternbereich schließt sich nach 5 Minuten ohne Eingabe und zeigt wieder die Startseite.
- „PIN vergessen“: Die Anleitung auf dem PIN-Bildschirm und im README stimmt jetzt – es müssen `eltern.json`
  **und** `eltern.json.bak` gelöscht werden; dazu steht, wie man die App ohne PIN beendet.
- Das Protokoll füllt sich nicht mehr mit Meldungen zu Spielen, die (noch) keinen Fortschrittsbalken haben.
- Der Hinweis zu besseren Stimmen in den Elternansichten beschreibt jetzt Windows statt iPhone.
- Bildschirm-Einstellungen (kein Zoom, kein Kontextmenü, keine Browser-Tastenkürzel) werden einzeln gesetzt,
  damit ein Fehler bei einer nicht die anderen verhindert.

## v0.1.0

Erste Windows-Version als Kiosk-App (Tauri 2).

- Vollbild ohne Rahmen und Taskleiste, Wisch- und Tippgesten bleiben in der App.
- Startseite mit Kategorien und Spielen aus `spiele/spiele.json`, Balken für den Lernfortschritt.
- Lernstand wird atomar im App-Datenordner gespeichert (mit `.bak`).
- Wimmelbild-Detektiv mit lokaler Schrift, Vorlesen und Mülleimer „Kein Nomen“.
- Elternbereich mit PIN: Lernstand, Stimme und Ton, Protokoll, Nach Updates suchen, App beenden.
- Updates auf Knopfdruck im Elternbereich über GitHub-Releases (signiert).
