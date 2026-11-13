# Lernen Spielen

Lernspiele für ein Kind, als Windows-Kiosk-App (Tauri 2). Die App zeigt eine Startseite mit
Kategorien und Spielen (HTML/JS in `spiele/`), speichert den Lernstand lokal, hat einen
PIN-geschützten Elternbereich und aktualisiert sich über GitHub-Releases.

Die frühere Web-Fassung mit PHP ist entfernt.

## Aufbau

- `spiele/` – die Oberfläche der App: `index.html` (Startseite), `eltern.html`/`eltern.js` (Elternbereich),
  `lernspiel.js` (gemeinsame Hilfen der Spiele), die Spiele als HTML-Dateien,
  `spiele.json` (Kategorien und Spiele), `bilder/` (Wimmelbilder samt Pausenbildern), `figuren/`, `saetze/`. Die übrigen Spiele zeichnen ihre Pausen selbst (SVG).
- `spiele/kern/` – der Plattform-Kern: aller Zugriff auf Speicher (je Profil), Einstellungen (Ton je Spiel, Stimme
  je Gerät), Sprache und Gerätefähigkeiten (Update, Beenden, Kiosk). Siehe `dienste.js` (Schnittstellen),
  `speicher.js`, `einstellungen.js`, `stimme.js`, `geraet.js`, `protokoll.js`. Außerhalb von `kern/` darf kein Spiel
  und keine Seite die Plattform direkt ansprechen; `tests/plattform-regel.test.mjs` prüft das.
- `spiele/audio/` – vorab erzeugte Sprachausgabe (`index.json` + MP3 je Stimme). Erzeugt mit `npm run audio`
  aus `werkzeuge/audio/` (Azure Speech, Ablauf in `werkzeuge/audio/README.md`). Fehlt eine Datei, spricht die
  Systemstimme. Regeln für gesprochene Texte: `docs/stimme.md`.
- `spiele/fortschritt/` – je Spiel optional ein Modul `<id>.js`, das den Balken auf der Startseite berechnet
  (nur für Spiele mit `"fortschritt": true` in `spiele.json`).
- `spiele/symbole/` – SVG-Symbole (Kategorien, Spiele, Elternbereich).
- `spiele/schrift/` – lokal eingebundene Schrift (keine Webzugriffe nötig).
- `src-tauri/` – Rust-Hülle: Kiosk-Fenster, Lernstand lesen/schreiben, Logdatei, Updater, Installer-Konfiguration.
- `tests/` – Node-Tests (`npm test`).
- `kiosk/` – Prüfliste für die Abnahme am Windows-Rechner.
- `release.sh`, `.github/workflows/release.yml` – Veröffentlichung.

## Entwickeln am Mac

```sh
npm install
npm test                      # Node-Tests
npm run tauri dev             # App im Entwicklungsmodus
python3 -m http.server -d spiele   # nur im Browser ansehen: http://localhost:8000
```

Im Browser gibt es kein Tauri; dort wird im localStorage gespeichert. Rust-Tests: `cd src-tauri && cargo test`.

## Release

```sh
./release.sh 0.2.0 "Kurze Notiz"
```

Das Skript prüft (Tests), setzt die Version in `package.json`, `tauri.conf.json` und `Cargo.toml`,
committet, taggt `v0.2.0` und pusht. Danach baut GitHub Actions (`.github/workflows/release.yml`) auf Windows:
Tests, Installer `*-setup.exe`, Signatur und `latest.json`, und veröffentlicht das Release. Die Release-Notiz
kommt aus dem Abschnitt `## v0.2.0` in `CHANGELOG.md`, sonst aus der Tag-Nachricht. Installierte Apps finden
das Update über „Nach Updates suchen“ im Elternbereich.

**Signierschlüssel:** `~/.tauri/lernen-spielen.key` (privat) sicher aufbewahren und sichern. Geht er verloren,
können bestehende Installationen keine Updates mehr annehmen. Die GitHub-Secrets heißen
`TAURI_SIGNING_PRIVATE_KEY` und `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`. Der öffentliche Schlüssel steht in
`src-tauri/tauri.conf.json`.

Abnahme einer Version am Windows-Rechner: `kiosk/pruefliste-v0.1.0.md`.

## Lernstand-Ordner

`%APPDATA%\de.crilabs.lernen-spielen\lernstand\` – hier liegen die Dateien, die zum Gerät gehören
(`eltern.json` mit der PIN, `geraet.json`).
Die Daten des Kindes liegen im Unterordner `lernstand\kind-1\` (das Profil): je Schlüssel eine JSON-Datei
(plus `.bak` als Sicherung), zum Beispiel `lernplan.json` und `einstellungen.json` (Ton je Spiel).
Bei Updates bleibt der Ordner unberührt.

Einmalig beim Wechsel auf die Version mit `kind-1` (Schritte siehe `CHANGELOG.md`, Abschnitt „Unveröffentlicht“):
direkt nach dem Update, bevor das Kind spielt: App beenden (Elternbereich „App beenden“; sonst wie unter
„PIN vergessen“), im Ordner `lernstand\` einen Ordner `kind-1` anlegen, alle Dateien außer `eltern.json`,
`eltern.json.bak`, `geraet.json` und `geraet.json.bak` hineinschieben (auch die übrigen `.bak`-Dateien; bei der
Rückfrage „ersetzen“ mit ja), App starten. Ohne das beginnt das Kind mit leerem Lernstand, die PIN bleibt.

## Logdatei

Die App schreibt über `tauri-plugin-log` in den Log-Ordner der App. Nach der Plugin-Doku ist das unter
Windows `%LOCALAPPDATA%\de.crilabs.lernen-spielen\logs\` (Dateiname nach dem App-Namen). Im Elternbereich gibt
es zusätzlich das „Protokoll“.

## PIN vergessen

Die PIN (als Hash) liegt in `%APPDATA%\de.crilabs.lernen-spielen\lernstand\eltern.json` (eine Ebene über `kind-1`), nach einer PIN-Änderung
die vorige PIN zusätzlich in `eltern.json.bak`. So setzt du die PIN zurück:

1. App ohne PIN beenden: Tastatur anschließen, **Strg+Alt+Entf** → **Task-Manager** → „Lernen Spielen“
   auswählen → **Task beenden**. (Bleibt der Task-Manager hinter der App verborgen: Strg+Alt+Entf → **Abmelden**.)
2. Im Explorer `%APPDATA%\de.crilabs.lernen-spielen\lernstand\` öffnen und **`eltern.json` und
   `eltern.json.bak`** löschen. Nur eine der beiden zu löschen reicht nicht.
3. App starten, Zahnrad halten und eine neue PIN festlegen.

Die Lernstände der Spiele (Ordner `kind-1`) bleiben erhalten (der Hinweis steht auch auf dem PIN-Bildschirm).

## Lernplan

Der Lernplan ordnet kleine Themen (z. B. „Die 7 zerlegen“, „Plus ohne Zehnerübergang bis 20“) in einer festen
Reihenfolge. Der Plan ist Orientierung, keine Vorgabe: Das Kind wählt, was es spielen und lernen will; innerhalb
des gewählten Spiels bereitet die App das passende Thema vor. Spiele liefern nur die Darstellung.

Dateien:

- `spiele/lernplan.json`: die Themen unter `themen`; die Reihenfolge in der Datei ist die Planreihenfolge.
  Felder: `id`, `name`, `sprich` (vorlesbarer Name ohne Ziffern und Zahlwörter), `strang` (eine `id` aus
  `kategorien` in `spiele.json`; bisher `mathe`), `voraussetzungen` (IDs früherer Themen), `aufgaben`
  (Aufgabenart wie `{ "art": "rechnen", "thema": … }`; `null` heißt „geplant“: noch keine Aufgaben, kein Spiel),
  `stufen` (`material`, `vorstellung`, `kopf`), `einfuehrung` (`{ "vorlage": "einfuehrungen/<name>.json",
  "werte": {…} }`), `familie` (optional), `tempo`, `eltern` (Hinweis für Erwachsene).
  Aus der Recherche (`docs/reports/`) kommen dazu: `klasse` (1–4, nur zur Orientierung am Lehrplan, steuert nichts), `bereich` (Gruppe im Strang), `rid` (Schritt der
  Themenkarte), `quelle` (`Q` belegt, `E` eigene Unterteilung), `gesichert` (Voraussetzungen, die sicher abrufbar sein
  müssen, nicht nur eingeführt), `verwechslung` (Themen, die in der Wiederholung gezielt gemischt werden), `typ`
  (`regel`, `merkwort`, `fertigkeit`), `schrift` (`alle`, `va`, `sas`, `verbunden`), `land` (`BY` für bayerische
  Sonderwege), `pruefbar` (`ganz` oder `teilweise`). Themen der Klassen 1–2 haben außerdem `ziel` (die eine
  Schwierigkeit), `beispiele`, `zweck` (wozu ein Kind das im Alltag braucht: nichts ist Selbstzweck) und `eltern`.
  Themen der Klassen 3–4 sind nur grob angelegt (Name, Bereich, Voraussetzungen).
  Stränge: `mathe`, `geometrie`, `lesen`, `schreiben`, `grammatik`, `sprechen` (Sprechen und Zuhören).
  Neben `themen` steht `fehlerbilder`: typische Fehlermuster (z. B. Zahlendreher, Spiegelschrift, „kleiner von größer“),
  je mit `signatur` (woran die App das Muster an den Antworten erkennt), `themen` (wo es sichtbar wird), `uebung`
  (Themen, die bei einem Muster häufiger kommen: geübt wird das richtige Verfahren, nicht der Fehler), `probe`
  (Aufgaben, mit denen sich „nicht betroffen“ bestätigen lässt), `kind_hinweis` (wird vorgelesen: ohne Ziffern und
  Zahlwörter) und `eltern` (beschreibend; `stufe2` nur bei anhaltenden Mustern). Grundlage:
  `docs/reports/Häufige Fehler Grundschule.md`. Die Lernsteuerung wertet Fehlerbilder noch nicht aus.
- `spiele/aufgabenarten.js`: Aufgaben-Erzeuger. Aufgabenarten: `zerlegung`, `rechnen`, `menge`, `zwillinge`.
- `spiele/lernsteuerung.js`: Steuerung (reine Logik ohne DOM, in Node testbar) und `runde()` für die Spiele.
  Sie wählt das Thema, macht bei neuen Themen eine Probe (bekannte Themen werden übersprungen), übt auf den Stufen,
  legt Aufgaben mit Wiedervorlage (Abstände 0, 1, 3, 7, 21 Tage) wieder vor und stellt Hilfen für den
  Elternbereich bereit (`elternThemen`, `markiereGekonnt`, `setzeZurueck`, `gibFrei`).
- `spiele/einfuehrung.js` und `spiele/einfuehrungen/*.json`: kurze Geschichten vor einem neuen Thema.
  Jeder Text hat `sprich` (wird gesprochen, **nie mit Ziffern oder Zahlwörtern**, die Computerstimme spricht Zahlen
  oft falsch), `zeig` (Sprechblase, darf Ziffern enthalten) und `bild`.
- `spiele/themen.html`: die Übersicht „Was ich kann“ (Weg mit Stationen, ruhig, ohne Zähler oder Prozente).
- `scripts/luecken.mjs`: `npm run luecken` listet Lücken im Plan, z. B. Themen ohne Spiel, das sie bedient.

Lernstand: Schlüssel `lernplan` (gespeichert über `kern/speicher.js`, in der App im Ordner `lernstand\kind-1\`).
Die Spiele speichern ihre eigenen, nicht lernbezogenen Daten unter eigenem Schlüssel (`perlenbruecke-spiel`,
`zahlenzauber-spiel`). Die alten Stände `perlenbruecke` und `zahlenzauber` werden einmal zur Übernahme gelesen
und nie mehr geschrieben.

`npm test` prüft den Plan (eindeutige IDs, Voraussetzungen, jede Aufgabe in genau einem Thema, Einführungen).

## Neues Spiel hinzufügen

1. HTML-Datei in `spiele/` anlegen. Speichern, Einstellungen, Sprache und Gerätefunktionen laufen nur über
   `spiele/kern/` (`lade`/`speichere`, `einstellung`/`setzeEinstellung`, `sprich`/`stille`, `faehigkeiten`).
   **Regel:** Kein Plattform-Zugriff außerhalb von `spiele/kern/` – also kein `localStorage`, `sessionStorage`,
   `speechSynthesis`, `SpeechSynthesisUtterance`, `__TAURI__`, `navigator.mediaDevices` und kein `new Audio(`.
   `npm test` schlägt sonst fehl (`tests/plattform-regel.test.mjs`).
2. Eintrag in `spiele/spiele.json` unter `spiele`: `id`, `titel`, `thema`, `kategorie` (eine `id` aus
   `kategorien`), `symbol` (z. B. `symbole/<id>.svg`), `datei`, `text` (wird vorgelesen).
3. Symbol: SVG in `spiele/symbole/` im Stil der vorhandenen (viewBox `0 0 100 100`, Linien `#3B2A6B` 4 px,
   runde Enden, flächige Füllung in Pastell, siehe z. B. `symbole/hilfe.svg`).
4. Spiel am Lernplan (für Lernspiele mit Aufgaben): im Eintrag `arten` angeben, z. B.
   `"arten": [{ "art": "zerlegung", "zahlen": [2, 10], "stufen": ["material", "vorstellung", "kopf"] }]`
   (Perlenbrücke) oder `{ "art": "rechnen", "max": 100, "gleiche": false, "stufen": ["kopf"] }` (Zahlenzauber).
   Im Spiel `runde()` aus `lernsteuerung.js` verwenden:
   ```js
   const r = await runde(id, { wunsch, max, nurAnsehen });
   if (r.einfuehrungFaellig) { /* Einführung abspielen */ r.einfuehrungGesehen(); }  // vor dem ersten naechste()
   const angebot = r.naechste();                       // je Angebot
   r.melde(angebot.key, { ok, hilfe: 0 /* 0|1|2 */, ms });
   const { hinweisSpiel } = await r.ende();
   ```
   Einführungen spielt `einfuehrung.js` (`spieleEinfuehrung`); Vorlagen liegen in `spiele/einfuehrungen/`
   (Felder `sprich`, `zeig`, `bild`, siehe oben). Eigene Spieldaten, die nichts mit dem Lernen zu tun haben,
   unter einem eigenen Schlüssel `<id>-spiel` speichern, nicht im Schlüssel `lernplan`.
   **Vorschau-Parameter** (`?zahl`, `?fehler`, `?eltern` u. ä.) müssen `nurAnsehen: true` übergeben und schreiben
   nie in den Lernstand.
5. Fortschrittsbalken (Übergangslösung, nur für Spiele ohne `arten`): `spiele/fortschritt/<id>.js` mit
   `export async function fortschritt(save, holeJson)`, Rückgabe `{ wert: 0..1, text: "…" }`.
   `save` ist der gespeicherte Lernstand des Spiels, `holeJson(pfad)` lädt eine JSON-Datei aus `spiele/`.
   Zusätzlich im Eintrag in `spiele.json` `"fortschritt": true` setzen – nur dann wird das Modul geladen
   (die App liefert für fehlende Dateien die Startseite aus, deshalb wird nicht geraten). Ein Test prüft,
   dass Kennzeichen und Moduldatei zusammenpassen. Ohne Modul zeigt die Startseite keinen Balken.
   Spiele mit `arten` bekommen keinen Fortschrittsbalken; ihren Stand zeigt „Was ich kann“. Die Module bleiben
   nur, bis Kettenhüpfer, Wimmelbild, Zauberer und Einhorn-Steine umgestellt sind.
   Beispiel: `spiele/fortschritt/wimmelbild.js`.

## Wimmelbilder

Neue Bilder im Querformat, empfohlen 4:3, z. B. 1600×1200. Pro Bild:

- `spiele/bilder/<name>.jpg`
- `spiele/bilder/<name>.json` mit den Dingen; `formen` als `[x1,y1,x2,y2]` in Prozent des Bildes
- Eintrag (Name ohne Endung) in `spiele/bilder/index.json`
- Pausenbild `spiele/bilder/<name>-pause.jpg` (passend zur Szene), eingetragen als `"pause": "<name>-pause.jpg"` in der JSON;
  es erscheint nach dem letzten Wort der Runde 10 Sekunden lang (`PAUSE_MS` in `wimmelbild.html`), danach folgt die nächste Szene.

Kontrolle: `wimmelbild.html?pruefen` zeigt alle Bereiche (Tippen zeigt die Koordinate), ein einzelnes Bild mit
`?pruefen&bild=<name>`.
