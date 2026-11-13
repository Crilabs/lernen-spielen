# Änderungen

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
