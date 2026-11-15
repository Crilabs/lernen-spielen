# Prüfliste Lernen Spielen v1.0.0 (am Windows-Kiosk, nach dem Update)

Vorher: nichts vom Rechner des Kindes löschen. Handy zum Fotografieren bereithalten, Tastatur in Reichweite
(nur für den Notfall „PIN vergessen“ und den Explorer). Das Kind spielt erst, wenn Abschnitt 2 erledigt ist.

## 1. Update von v0.1.8

- [ ] In v0.1.8: Zahnrad 3 Sekunden halten, PIN, im Elternbereich „Nach Updates suchen“.
  *Du siehst:* „Neu in Version 1.0.0“ mit der Release-Notiz, dann „Installieren und neu starten“.
- [ ] Installieren und abwarten.
  *Du siehst:* Ladebalken, „Fertig. Die App startet neu …“; danach die neue Startseite „Lernen Spielen“ (ohne Einhorn).

## 2. Einmaliger Handgriff: Ordner `kind-1`

Gleich nach dem Neustart, bevor das Kind spielt (Schritte wie in `CHANGELOG.md`, Abschnitt v1.0.0).

- [ ] Zahnrad 3 Sekunden halten, PIN eingeben.
  *Du siehst:* die **alte PIN** gilt noch (sie liegt in `eltern.json` eine Ebene über `kind-1`).
- [ ] Links unten in der Leiste „App beenden“.
  *Du siehst:* die App schließt sich und kommt **nicht** von selbst zurück.
- [ ] Explorer, Adresszeile `%APPDATA%\de.crilabs.lernen-spielen\lernstand\`.
  *Du siehst:* `eltern.json`, `geraet.json` (je mit `.bak`), die alten Dateien der entfernten Spiele und einen Ordner `kind-1` vom ersten Start (sonst anlegen).
- [ ] Alle Dateien **außer** `eltern.json`, `eltern.json.bak`, `geraet.json`, `geraet.json.bak` in `kind-1` verschieben; bei „Ersetzen?“ ja.
  *Du siehst:* im Ordner `lernstand\` nur noch die vier Gerätedateien und `kind-1`.
- [ ] App wieder starten, Zahnrad halten.
  *Du siehst:* die Startseite; die PIN wird abgefragt (keine neue PIN festlegen).

## 3. Kiosk-Fenster

- [ ] Von allen vier Rändern nach innen wischen; langes Drücken, Pinch, Doppeltipp; Drei- und Vier-Finger-Wischen.
  *Du siehst:* nichts verlässt die App, kein Kontextmenü, kein Zoom, kein Markieren, keine Fensterübersicht.
- [ ] Mit drei Fingern nach unten wischen (mit Tastatur zusätzlich Windows+D, Windows+M).
  *Du siehst:* höchstens kurz den Desktop; nach etwa 2 Sekunden ist die App von selbst wieder im Vollbild.

## 4. Startseite, Fach-Seite, Regal

- [ ] Startseite ansehen (bei der eingestellten Skalierung).
  *Du siehst:* die Wiese mit der Runde, einen Abschnitt **Mathe** mit der Karte **Kettenhüpfer** (Thema Zweierreihe); eine Karte „Mit echten Dingen“ kommt dazu, sobald das Thema dran ist (nach der ersten Runde); rechts „Zuletzt gelernt“ (noch leer) und den Knopf „Was ich schon kann“. Keine Zahlen, keine Balken, nichts abgeschnitten.
- [ ] Ton an: auf die Karte Kettenhüpfer tippen, dann zurück; auf den Fachnamen „Mathe“ tippen.
  *Du siehst/hörst:* der Name wird einmal gesprochen; „Mathe“ öffnet die Fach-Seite mit dem Weg: das Thema, das dran ist (Sonnenring), und zwei Themen in Sicht. Ein Thema antippen zeigt seine Spiele und „Mit echten Dingen“.
- [ ] Zahnrad nur kurz antippen und 1 Sekunde halten.
  *Du siehst:* es passiert nichts (erst 3 Sekunden Halten öffnet den PIN-Bildschirm).

## 5. Kettenhüpfer

- [ ] Kettenhüpfer öffnen.
  *Du siehst:* zuerst die Einführung in der Vorratskammer mit Timo (Erzähler spricht, überspringen möglich), dann die erste Aufgabe, z. B. „6 · 2 = ▢“ mit Tastatur.
- [ ] **Stufe Kopf (Probe):** Die ersten Aufgaben einer neuen Reihe sind eine Probe.
  *Du siehst:* die Kette liegt zu; erst nach der Eingabe erscheint sie und das Pfeilchen hüpft.
- [ ] In der Probe absichtlich eine falsche Zahl tippen und „Fertig“.
  *Du siehst:* das Pfeilchen hält am richtigen Stäbchen (ohne Zahl, mit Ring), die getippte Zahl liegt als hohles Pfeilchen an ihrem Ort. Die Probe endet damit.
- [ ] **Stufe Material:** die nächsten Aufgaben.
  *Du siehst:* die Perlenkette liegt sichtbar da; richtig getippt hüpft das Pfeilchen Stäbchen für Stäbchen, je Stäbchen fliegt eine Packung in den Korb und bleibt dort; Timo reagiert.
- [ ] Hilfe: zweimal falsch, dann Hilfe antippen (zweimal).
  *Du siehst:* nach dem 2. Fehlversuch leuchtet die Hilfe; Stufe 1 zeigt eine Kernaufgabe als Pfeilchen mit Zahl, Stufe 2 den Rechenweg mit Sonnenring an der nächsten Taste. Das Ergebnis selbst steht nirgends.
- [ ] **Stufe Vorstellung:** weiter sicher lösen (4 von 5 richtig ohne Hilfe), notfalls über mehrere Runden.
  *Du siehst:* die Kette ist mit einem Tuch verdeckt, nur die Stäbchengrenzen sind zu sehen.
- [ ] **Stufe Kopf:** wieder 4 von 5 richtig ohne Hilfe.
  *Du siehst:* die Kette liegt zu und erscheint erst mit der Eingabe; nach einem Fehlversuch liegt sie unter dem Tuch.
  (Ist das am Gerät zu langwierig, genügen Material und Vorstellung; die Stufe Kopf ist im Browser geprüft.)
- [ ] Runde zu Ende spielen (etwa 4 Minuten).
  *Du siehst:* die Pause mit dem Korb; unten gleich groß „Alle Spiele“ und „Weiter“, dazu das Angebot „Mit echten Dingen“.
- [ ] In der Pause „Mit echten Dingen“ antippen.
  *Du siehst:* die Anleitung zum Thema der Runde (z. B. Zweierreihe: Schuhe in Paaren), „Leichter“/„Schwerer“ klappen auf und zu; das Haus führt zurück.
- [ ] Mitten in einer Runde aufs Haus, dann Kettenhüpfer wieder öffnen.
  *Du siehst:* die Startseite, danach startet das Spiel sauber (keine doppelte Einführung, keine Fehlermeldung).

## 6. Regal „Was ich schon kann“

- [ ] Elternbereich → Lernplan → Mathe: das Thema „Zweierreihe“ abhaken (zweimal tippen: „Wirklich?“).
  *Du siehst:* das Thema und seine Voraussetzungen sind abgehakt, die Farbe wechselt.
- [ ] Zur Startseite, „Was ich schon kann“.
  *Du siehst:* Reiter je Fach, Mathe gewählt; oben die neue **Perlenkette** der Zweierreihe, sie leuchtet beim ersten Besuch einmal ruhig auf. Auf der Startseite rechts unter „Zuletzt gelernt“ steht sie auch.
- [ ] Im Elternbereich das Thema wieder **zurücksetzen** (falls das Kind es noch nicht kann).
  *Du siehst:* die Perlenkette ist im Regal verschwunden, ohne Meldung.

## 7. Elternbereich

- [ ] **Lernplan:** Fächer als Baum, Farbe nach Stand, Filter umschalten; unter Mathe die Beschreibung des Kettenhüpfers aufklappen.
  *Du siehst:* ruhiger Text für Erwachsene, keine Prozente; Abhaken, Zurücksetzen, Freigeben fragen erst „Wirklich?“.
- [ ] **Spielzeit:** einen Tag sperren bzw. „Höchstens“ auf wenige Minuten, Zeitfenster so, dass das Ende in 5 Minuten ist.
  *Du siehst:* die Änderung steht sofort unter „Heute“.
- [ ] Kettenhüpfer spielen, bis die Zeit um ist.
  *Du siehst:* die laufende Runde geht zu Ende; die Pause sagt „Gleich ist für heute Schluss.“ bzw. den Schluss-Satz, es gibt nur „Alle Spiele“, kein „Weiter“. Die Startseite zeigt danach keine Spielkarten, aber die Karte „Mit echten Dingen“ und das Regal.
- [ ] Außerhalb des Zeitfensters die App öffnen (Beginn auf später stellen).
  *Du siehst:* keine Spielkarten. Zugabe (15 Minuten) im Elternbereich geben: die Karten sind wieder da. Danach Spielzeit wieder auf den Wunsch der Familie einstellen (Standard: alles aus).
- [ ] **Geschichten:** Ruhig wählen, dann wieder Sanft.
  *Du siehst:* „Eingestellt: …“; die Einführung des Kettenhüpfers erzählt bei Ruhig ohne Aufregung.
- [ ] **Gerät:** Version.
  *Du siehst:* „1.0.0“; „Nach Updates suchen“ meldet, dass die App aktuell ist.
- [ ] **Hinweise** und **Sicherheit** öffnen; PIN ändern und wieder zurück ändern; Protokoll ansehen.
  *Du siehst:* der Hinweis zur Stimme nennt Microsoft Azure und dass beim Spielen nichts ins Internet geht; im Protokoll keine roten Fehler aus dieser Sitzung.
- [ ] Elternbereich 5 Minuten offen lassen.
  *Du siehst:* die App kehrt von selbst zur Startseite zurück.
- [ ] Hier ergänzen, was Christian zuletzt am Elternbereich geändert hat (siehe CHANGELOG, Platzhalter).

## 8. Mit echten Dingen

- [ ] Nach der ersten Kettenhüpfer-Runde: Startseite → Karte „Mit echten Dingen“.
  *Du siehst:* die Anleitung zum Thema, das dran ist, mit Bild, Schritten, „Darauf kommt es an“, Leichter/Schwerer; ohne PIN; zählt nicht zur Spielzeit.
- [ ] Elternbereich → „Mit echten Dingen“: ein Thema aufklappen und drucken („PDF“).
  *Du siehst:* der Windows-Druckdialog mit **einem** A4-Blatt (alle Formen, ohne graue Flächen); „Microsoft Print to PDF“ oder ein Drucker funktioniert. Danach ist die App wieder im Vollbild.

## 9. Ton und Stimme

- [ ] Startseite, Regal und Kettenhüpfer mit Ton an.
  *Du hörst:* die natürliche Stimme (Florian) bei Fachnamen, Themennamen, Einführung und den Aufträgen im Kettenhüpfer („Sechs Schuhpaare. Wie viele Schuhe sind es zusammen?“).
- [ ] Auf Sätze achten, die anders klingen.
  *Du hörst:* nur bei wenigen Sätzen aus Vorlagen die Ersatzstimme von Windows; sie spricht keine Zahlen. Notieren, welche Sätze das sind.
- [ ] Ton-Knopf oben in einem Spiel aus, Spiel verlassen und wieder öffnen.
  *Du siehst:* der Ton bleibt in diesem Spiel aus; Startseite, Fach-Seite und Regal teilen sich ihren eigenen Schalter.

## 10. App beenden und Neustart

- [ ] Elternbereich → „App beenden“, App neu starten.
  *Du siehst:* die Startseite; Lernstand (Kettenhüpfer, Regal), Spielzeit-Einstellungen und PIN sind noch da; im Ordner `lernstand\kind-1\` liegen `lernplan.json` und `einstellungen.json`.

## Was du mir zurückmeldest

- Fotos oder Notizen zu allem, was komisch aussah oder sich komisch anfühlte (Gesten, abgeschnittene Stellen, Ruckeln, falsch klingende Sätze).
- Welche Sätze mit der Ersatzstimme kamen.
- Die Logdatei der App (Ordner siehe README, „Logdatei“).
