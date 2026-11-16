# Lernen Spielen

Lernspiele für ein Kind, als Windows-Kiosk-App (Tauri 2). Die App zeigt eine Startseite mit
Kategorien und Spielen (HTML/JS in `spiele/`), speichert den Lernstand lokal, hat einen
PIN-geschützten Elternbereich und aktualisiert sich über GitHub-Releases.

Die frühere Web-Fassung mit PHP ist entfernt.

## Aufbau

- `spiele/` – die Oberfläche der App, gebaut aus den Rahmen-Bausteinen:
  - `index.html` (Startseite): je Fach ein Abschnitt mit Spielkarten und Karten „Mit echten Dingen“; rechts
    „Zuletzt gelernt“, „Was ich schon kann“ und „Bibliothek“. Zahnrad gedrückt halten (3 s) führt zum Elternbereich.
  - `themen.html?fach=<id>` (Fach-Seite): der Weg eines Fachs (gekonnt, dran, zwei in Sicht); ein Thema
    antippen zeigt seine Spiele, „Geschichte ansehen“ und „Mit echten Dingen“.
  - `regal.html` („Was ich schon kann“, das Regal): je Fach ein Brett, jedes gekonnte Thema steht als sein Lernmaterial
    darauf (Regeln in `rahmen/material.js`), ohne Zahl und ohne Platzhalter.
  - `bibliothek.html`, `bibliothek.json`, `geschichte.html`, `geschichten/` (Bibliothek): Sachbücher und
    Geschichten mit Fotos, Regeln in `docs/geschichten.md`.
  - `echt.html`, `mit-echten-dingen/` („Mit echten Dingen“): kurze Spiele ohne Bildschirm je Thema,
    Regeln in `docs/mit-echten-dingen.md`.
  - `eltern.html`/`eltern.js` (Elternbereich hinter PIN): nur, was das Kind nicht darf – Reiter Lernplan, Sachthemen,
    Spielzeit, Updates, Hinweise, Sicherheit.
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
- `spiele/<fach>/<katalog-nr>-<name>/` – ein Ordner je Spiel, nach Fach (z. B. `spiele/mathe/m37-kettenhuepfer/`);
  `spiele/objekte/` – animierte Objekte, die mehrere Spiele nutzen. `tests/ablage.test.mjs` prüft die Ablage.
- `spiele/kern/` – der Plattform-Kern: aller Zugriff auf Speicher (je Profil), Einstellungen (Ton je Spiel, Stimme
  je Gerät), Sprache und Gerätefähigkeiten (Update, Beenden, Kiosk). Siehe `dienste.js` (Schnittstellen),
  `speicher.js`, `einstellungen.js`, `stimme.js`, `geraet.js`, `protokoll.js`. Außerhalb von `kern/` darf kein Spiel
  und keine Seite die Plattform direkt ansprechen; `tests/plattform-regel.test.mjs` prüft das.
- `spiele/audio/` – vorab erzeugte Sprachausgabe (`index.json` + MP3 je Stimme). Erzeugt mit `npm run audio`
  aus `werkzeuge/audio/` (Azure Speech, Ablauf in `werkzeuge/audio/README.md`). Fehlt eine Datei, spricht die
  Systemstimme. Regeln für gesprochene Texte: `docs/stimme.md`.
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
npm run dev                   # App im Entwicklungsmodus (= npm run tauri dev)
python3 -m http.server -d spiele   # nur im Browser ansehen: http://localhost:8000
```

Im Browser gibt es kein Tauri; dort wird im localStorage gespeichert. Rust-Tests: `cd src-tauri && cargo test`.

## Verwaltung (nur lokal)

```sh
npm run verwaltung            # http://127.0.0.1:4711
```

Übersicht für Christian, nicht Teil der App (`werkzeuge/verwaltung/`, Spec
`docs/superpowers/specs/2026-11-16-verwaltung-design.md`): alle Spiele je Fach mit ihren Lernthemen („Mit echten
Dingen“, Einführung; Lernthemen ohne Spiel je Fach am Ende), die Bibliothek nach Raum und Regal, Kosten wie `npm run kosten`, und eine Warteschlange von Aufträgen. „Warteschlange
abarbeiten“ startet einen Hintergrundlauf (`claude -p`, ein Auftrag nach dem anderen, kein `git push`); Protokolle unter
`werkzeuge/verwaltung/protokolle/`. Im Chat: „Aufträge abarbeiten“ holt den nächsten Auftrag mit
`node werkzeuge/verwaltung/lauf.mjs naechster` und meldet ihn mit `lauf.mjs fertig <id> <status>` zurück (dieselbe
Sperre wie die Seite). Wartet ein Auftrag auf Christian, beantwortet er ihn in der Seite: „Ja“ oder „Antworten …“ legt
einen Folgeauftrag (Art `antwort`, ca. 2 €) an, der den Auftrag mit der Antwort fortsetzt; „Nein“ schließt ihn ohne
Lauf ab. Der Reiter „Proben“ zeigt die Spiele mit `"probe": true`, spielbar unter `127.0.0.1:4711/spiele/…`;
„Probe abschließen“ nimmt die Markierung heraus und committet nur `spiele/spiele.json` auf main (kein Push).
Warteschlange, Sperre, Ergebnisse und Protokolle sind gitignored.

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

Abnahme einer Version am Windows-Rechner: `kiosk/pruefliste-v1.0.0.md`.

## Lernstand-Ordner

`%APPDATA%\de.crilabs.lernen-spielen\lernstand\` – hier liegen die Dateien, die zum Gerät gehören
(`eltern.json` mit der PIN, `geraet.json`).
Die Daten des Kindes liegen im Unterordner `lernstand\kind-1\` (das Profil): je Schlüssel eine JSON-Datei
(plus `.bak` als Sicherung), zum Beispiel `lernplan.json` und `einstellungen.json` (Ton je Spiel).
Bei Updates bleibt der Ordner unberührt.

Nach dem Update auf 1.0.0 beginnt das Kind mit leerem Lernstand (die alten Spiele sind weg); die PIN bleibt.

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
  Neben `themen` stehen `ueberschriften` und `welten`: die Sachthemen der Bibliothek und des Elternbereichs.
- `spiele/aufgabenarten.js`: Aufgaben-Erzeuger. Aufgabenarten: `zerlegung`, `rechnen`, `menge`, `zwillinge`, `mal`.
- `spiele/lernsteuerung.js`: Steuerung (reine Logik ohne DOM, in Node testbar) und `runde()` für die Spiele.
  Sie wählt das Thema, macht bei neuen Themen eine Probe (bekannte Themen werden übersprungen), übt auf den Stufen,
  legt Aufgaben mit Wiedervorlage (Abstände 0, 1, 3, 7, 21 Tage) wieder vor und stellt Hilfen für den
  Elternbereich bereit (`elternThemen`, `markiereGekonnt`, `setzeZurueck`, `gibFrei`).
- `spiele/einfuehrung.js` und `spiele/einfuehrungen/*.json`: kurze Geschichten vor einem neuen Thema.
  Jeder Text hat `sprich` (wird gesprochen, **nie mit Ziffern oder Zahlwörtern**, die Computerstimme spricht Zahlen
  oft falsch), `zeig` (Erzählblase, darf Ziffern enthalten) und `bild`. Es erzählt der Erzähler; im Bild stehen
  Kinder der Runde (`{ "figur": "ela", "haltung": "zeigen", "aufgabe": "vorzeigen" }`, gezeichnet mit
  `spiele/runde/`), Perlenstäbe und Zahlen.
- `spiele/themen.html`: die Fach-Seite (Weg mit Stationen, ruhig, ohne Zähler oder Prozente).
- `scripts/luecken.mjs`: `npm run luecken` listet Lücken im Plan, z. B. Themen ohne Spiel, das sie bedient.

Lernstand: Schlüssel `lernplan` (gespeichert über `kern/speicher.js`, in der App im Ordner `lernstand\kind-1\`).
Die Spiele speichern ihre eigenen, nicht lernbezogenen Daten unter eigenem Schlüssel `<id>-spiel`.
Die Tests der Lernsteuerung nutzen einen festen Beispiel-Katalog (`tests/daten/spiele-beispiel.json`).

`npm test` prüft den Plan (eindeutige IDs, Voraussetzungen, jede Aufgabe in genau einem Thema, Einführungen).

## Neues Spiel hinzufügen

Ein neues Spiel entsteht mit dem Skill „Spiel entwickeln“ nach `docs/spielbau.md` (Werkzeuge in
`werkzeuge/spielbau/`). Es startet als Kopie der Spielvorlage `spiele/vorlage/`; Bausteine und Bedienung stehen in
`docs/bedienung.md`.
