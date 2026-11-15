# Lernen Spielen

Lernspiele für ein Kind, als Windows-Kiosk-App (Tauri 2). Die App zeigt eine Startseite mit
Kategorien und Spielen (HTML/JS in `spiele/`), speichert den Lernstand lokal, hat einen
PIN-geschützten Elternbereich und aktualisiert sich über GitHub-Releases.

Die frühere Web-Fassung mit PHP ist entfernt.

## Aufbau

- `spiele/` – die Oberfläche der App, gebaut aus den Rahmen-Bausteinen:
  - `index.html` (Startseite): oben bis zu drei Spiele, deren Thema gerade dran ist, darunter die Fächer mit Spielen,
    unten „Mein Regal“; Zahnrad gedrückt halten (3 s) führt zum Elternbereich.
  - `themen.html?fach=<id>` (Fach-Seite): der Weg eines Fachs (gekonnt, dran, zwei in Sicht); ein Thema
    antippen zeigt seine Spiele, „Geschichte ansehen“ und „Mit echten Dingen“.
  - `regal.html` („Mein Regal“, was ich kann): je Fach ein Brett, jedes gekonnte Thema steht als sein Lernmaterial
    darauf (Regeln in `rahmen/material.js`), ohne Zahl und ohne Platzhalter.
  - `eltern.html`/`eltern.js` (Elternbereich hinter PIN): nur, was das Kind nicht darf – Lernstand mit Eingriffen,
    Stufe der Geschichten, Gerät, Hinweise, Sicherheit.
  - `lernsteuerung.js` (Lernplan, Lernstand, Daten der Ansichten), `lernspiel.js` (gemeinsame Hilfen der Spiele), die
    Spiele als HTML-Dateien, `spiele.json` (Kategorien und Spiele). Die ersten sechs Spiele sind am 2026-11-14
    entfernt worden (Neubau nach `docs/grundsaetze.md`, Code in der Git-Historie).
  - Als Material liegt noch `saetze/` (Diktatsätze). Die Figuren zeichnet `runde/` (die Runde, `docs/figuren.md`).
  - Browser-Prüfung der vier Ansichten (leer, gekonnt ohne Spiele, mit Testspielen; PIN; Zahnrad):
    `tests/browser/ansichten.spec.mjs` (Aufruf im Kopfkommentar, nicht Teil von `npm test`).
- `spiele/rahmen/` – die gemeinsamen Bausteine jedes Spiels (Web Components `ls-*`: Kopfleiste, Knöpfe, Sprechblase,
  Hilfe, Pause, Tastatur, Ziehen, Lernzeichen, die Karte „Mit echten Dingen“ `ls-anregung`) und der Seiten-Grundstil
  `seite.css`. Wie sie aussehen und sich
  bedienen lassen, steht in `docs/bedienung.md`. `spiele/rahmen/vorschau.html` zeigt alle Bausteine (Entwicklerseite);
  die Browser-Prüfung dazu: `tests/browser/rahmen.spec.mjs` (Aufruf im Kopfkommentar, nicht Teil von `npm test`).
- `spiele/vorlage/` (`index.html` + `spiel.js`) – Spielvorlage, von der jedes neue Spiel als Kopie startet.
- `spiele/<fach>/<katalog-nr>-<name>/` – ein Ordner je Spiel, nach Fach (z. B. `spiele/mathe/m14-zwei-tonnen/`);
  `spiele/objekte/` – animierte Objekte, die mehrere Spiele nutzen. `tests/ablage.test.mjs` prüft die Ablage.
- `spiele/kern/` – der Plattform-Kern: aller Zugriff auf Speicher (je Profil), Einstellungen (Ton je Spiel, Stimme
  je Gerät), Sprache und Gerätefähigkeiten (Update, Beenden, Kiosk). Siehe `dienste.js` (Schnittstellen),
  `speicher.js`, `einstellungen.js`, `stimme.js`, `geraet.js`, `protokoll.js`. Außerhalb von `kern/` darf kein Spiel
  und keine Seite die Plattform direkt ansprechen; `tests/plattform-regel.test.mjs` prüft das.
- `spiele/audio/` – vorab erzeugte Sprachausgabe (`index.json` + MP3 je Stimme). Erzeugt mit `npm run audio`
  aus `werkzeuge/audio/` (Azure Speech, Ablauf in `werkzeuge/audio/README.md`). Fehlt eine Datei, spricht die
  Systemstimme. Regeln für gesprochene Texte: `docs/stimme.md`.
- `spiele/fortschritt/` – früher die Fortschrittsbalken der Startseite; keine Ansicht nutzt sie mehr (nur noch
  `tests/fortschritt-kern.test.mjs`).
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

Abnahme einer Version am Windows-Rechner: `kiosk/pruefliste-v0.1.0.md` (Erstinstallation), `kiosk/pruefliste-v1.0.0.md` (Update auf 1.0.0).

## Lernstand-Ordner

`%APPDATA%\de.crilabs.lernen-spielen\lernstand\` – hier liegen die Dateien, die zum Gerät gehören
(`eltern.json` mit der PIN, `geraet.json`).
Die Daten des Kindes liegen im Unterordner `lernstand\kind-1\` (das Profil): je Schlüssel eine JSON-Datei
(plus `.bak` als Sicherung), zum Beispiel `lernplan.json` und `einstellungen.json` (Ton je Spiel).
Bei Updates bleibt der Ordner unberührt.

Einmalig beim Wechsel auf die Version mit `kind-1` (Schritte siehe `CHANGELOG.md`, Abschnitt „v1.0.0“):
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
  Neben `themen` stehen `ueberschriften` und `welten` (Sachwelten, `docs/grundsaetze.md` §10). Jede Welt hat
  `fakten`: den geprüften Faktensatz (K4), gefüllt erst, wenn ein Spiel die Welt nutzt; jeder Fakt hat `text`,
  `quelle` und `klasse` (ab welcher Klasse er passt, „Sache wächst mit“, `docs/spielkatalog.md` 4.1).
  Welches Spiel in welcher Welt spielt: `docs/spielkatalog/welten.md`.
- `spiele/aufgabenarten.js`: Aufgaben-Erzeuger. Aufgabenarten: `zerlegung`, `rechnen`, `menge`, `zwillinge`.
- `spiele/lernsteuerung.js`: Steuerung (reine Logik ohne DOM, in Node testbar) und `runde()` für die Spiele.
  Sie wählt das Thema, macht bei neuen Themen eine Probe (bekannte Themen werden übersprungen), übt auf den Stufen,
  legt Aufgaben mit Wiedervorlage (Abstände 0, 1, 3, 7, 21 Tage) wieder vor und stellt Hilfen für den
  Elternbereich bereit (`elternThemen`, `markiereGekonnt`, `setzeZurueck`, `gibFrei`).
- `spiele/einfuehrung.js` und `spiele/einfuehrungen/*.json`: kurze Geschichten vor einem neuen Thema.
  Jeder Text hat `sprich` (wird gesprochen, **nie mit Ziffern oder Zahlwörtern**, die Computerstimme spricht Zahlen
  oft falsch), `zeig` (Erzählblase, darf Ziffern enthalten) und `bild`. Es erzählt der Erzähler; im Bild stehen
  Kinder der Runde (`{ "figur": "ela", "haltung": "zeigen", "aufgabe": "vorzeigen" }`, gezeichnet mit
  `spiele/runde/`), Perlenstäbe und Zahlen.
- `spiele/themen.html`: die Übersicht „Was ich kann“ (Weg mit Stationen, ruhig, ohne Zähler oder Prozente).
- `scripts/luecken.mjs`: `npm run luecken` listet Lücken im Plan, z. B. Themen ohne Spiel, das sie bedient.

Lernstand: Schlüssel `lernplan` (gespeichert über `kern/speicher.js`, in der App im Ordner `lernstand\kind-1\`).
Die Spiele speichern ihre eigenen, nicht lernbezogenen Daten unter eigenem Schlüssel `<id>-spiel`.
Die Tests der Lernsteuerung nutzen einen festen Beispiel-Katalog (`tests/daten/spiele-beispiel.json`).

`npm test` prüft den Plan (eindeutige IDs, Voraussetzungen, jede Aufgabe in genau einem Thema, Einführungen).

## Neues Spiel hinzufügen

Zuerst die Checkliste in `docs/bedienung.md` (Abschnitt 10) durchgehen: Kopfleiste, Blase, Hilfe, Pause, Tastatur
und Ziehen kommen aus `spiele/rahmen/`, kein Spiel baut sie selbst. Neue Spiele starten als Kopie der **Spielvorlage**
`spiele/vorlage/index.html` + `spiele/vorlage/spiel.js` (spielbarer Platzhalter „Leg die 7“; die Schritte stehen oben in
`spiel.js`); der Ordner wird nach `spiele/<fach>/<katalog-nr>-<name>/` kopiert. Die Vorlage steht nicht in `spiele.json` und schreibt nie in den Lernstand. Browser-Prüfung:
`NODE_PATH=… node tests/browser/vorlage.spec.mjs` (wie `rahmen.spec.mjs`).

1. Spielordner `spiele/<fach>/<katalog-nr>-<name>/` aus der Vorlage anlegen (`index.html`, `spiel.js`). Speichern, Einstellungen, Sprache und Gerätefunktionen laufen nur über
   `spiele/kern/` (`lade`/`speichere`, `einstellung`/`setzeEinstellung`, `sprich`/`stille`, `faehigkeiten`).
   **Regel:** Kein Plattform-Zugriff außerhalb von `spiele/kern/` – also kein `localStorage`, `sessionStorage`,
   `speechSynthesis`, `SpeechSynthesisUtterance`, `__TAURI__`, `navigator.mediaDevices` und kein `new Audio(`.
   `npm test` schlägt sonst fehl (`tests/plattform-regel.test.mjs`).
2. Eintrag in `spiele/spiele.json` unter `spiele`: `id`, `titel`, `thema`, `kategorie` (eine `id` aus
   `kategorien`), `symbol` und `datei` relativ zu `spiele/` (z. B. `mathe/m14-zwei-tonnen/symbol.svg` und
   `mathe/m14-zwei-tonnen/index.html`), `text` (wird vorgelesen), `beschreibung` (2–3 Sätze für Eltern: was das Kind tut, was es lernt, wie die Welt dazu passt; nur in `?eltern` des Spiels und im Elternbereich zu sehen, nie für das Kind; `tests/spiele-beschreibung.test.mjs`).
3. Symbol: `symbol.svg` im Spielordner, von Hand gezeichnet als Kopfform der Figur des Spiels (`karte.figur`,
   `docs/grundsaetze-bilder.md` §16 KB8, KB10), im Stil der vorhandenen Symbole (viewBox `0 0 100 100`, Linien `#3B2A6B`
   4 px, runde Enden, flächige Füllung in Pastell, siehe z. B. `symbole/hilfe.svg`); steht in Kopfleiste und
   Regal-Detail, nicht auf der Karte.
4. Spiel am Lernplan (für Lernspiele mit Aufgaben): im Eintrag `arten` angeben, z. B.
   `"arten": [{ "art": "zerlegung", "zahlen": [2, 10], "stufen": ["material", "vorstellung", "kopf"] }]`
   oder `{ "art": "rechnen", "max": 100, "gleiche": false, "stufen": ["kopf"] }`.
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
   Spiele mit `arten` bekommen keinen Fortschrittsbalken; ihren Stand zeigt „Was ich kann“.
