# Tagesbrief-Versanddienst

Nimmt Ereignisse der App an und schickt den Eltern abends den Tagesbrief über Microsoft Graph
(Spec: `docs/superpowers/specs/2026-11-17-tagesbrief-design.md`). Läuft auf `crilabs-app-server`
unter `https://lernen-spielen.crilabs.de`.

## Aufbau auf dem Server

| Was | Wo |
| --- | --- |
| Code (nur `dienste/tagesbrief/*.js`, `spiele/tagesbrief/brief.js`, das Probe-Foto, `package.json` mit `"type": "module"`) | `/opt/lernen-spielen-tagesbrief/`, Besitzer root, im selben relativen Aufbau wie im Repo |
| Unit | `/etc/systemd/system/lernen-spielen-tagesbrief.service` (aus `betrieb/`), Nutzer `tagesbrief`, nur `127.0.0.1:3600` |
| Zugangsdaten | `/etc/lernen-spielen/graph.env`, `graph.key` (640, Gruppe `tagesbrief`), `graph.crt` (644); Ordner 750. Nie ins Repo. `start.js` liest `graph.env` selbst. |
| Daten | `/var/lib/lernen-spielen/tagesbrief.json` (StateDirectory, Ordner 700, Besitzer `tagesbrief`) |
| Caddy | `/etc/caddy/lernen-spielen.caddy` (aus `betrieb/`), importiert als letzte Zeile von `/etc/caddy/Caddyfile`; ohne Zugriffsprotokoll |

## Ausrollen

Aus dem Repo-Wurzelordner, mit `ssh crilabs-app-server` als root:

```sh
dienste/tagesbrief/betrieb/ausrollen.sh           # Code und Unit, Dienst neu starten
dienste/tagesbrief/betrieb/ausrollen.sh --caddy   # zusätzlich Caddy-Block: kopieren, validieren, reload
```

Das Skript ist wiederholbar. Beim ersten Lauf legt es den Systemnutzer `tagesbrief` an und setzt die Rechte in
`/etc/lernen-spielen/`. Mit `--caddy` sichert es das `Caddyfile` vor der neuen `import`-Zeile als
`Caddyfile.bak-<Datum>`, prüft mit `caddy validate` und stellt bei einem Fehler den vorigen Stand her. Caddy wird nur
neu geladen, nie neu gestartet: auf dem Server laufen andere Seiten mit.

## Betrieb

```sh
systemctl status lernen-spielen-tagesbrief
journalctl -u lernen-spielen-tagesbrief -n 50     # nur Zeit, Weg, Status, Fehlername – nie Adressen oder Inhalte
```

Not-Aus: `systemctl edit lernen-spielen-tagesbrief` mit `Environment=TAGESBRIEF_AUS=1`, dann `systemctl restart`.
Der Dienst nimmt dann keine Anmeldungen, Empfänger, Ereignisse oder Probebriefe mehr an (503) und sendet nichts.

## Familie, Empfänger, Abbestellen

Ein Topf gehört einer **Familie** (eine Uhrzeit, ein Name, mehrere Geräte) mit bis zu **4 Empfängern** (bestätigt und
wartend zusammen). Briefe gehen nur an bestätigte Adressen, je Empfänger eine eigene Mail mit eigenem Abbestell-Link.

| Endpunkt (mit `X-App`) | Zweck |
| --- | --- |
| `POST /anmelden` (ohne Bearer) | neue Familie, oder Beitritt eines Geräts, wenn die Adresse bestätigter Empfänger genau einer Familie ist |
| `POST /empfaenger { adresse }` (Bearer) | zusätzliche Adresse, wartet auf Bestätigung per Link (POST); 409 `voll` ab 4, 409 `vorhanden` |
| `GET /empfaenger` (Bearer) | `{ uhrzeit, name, empfaenger: [{ adresse, bestaetigt }] }` |
| `DELETE /empfaenger { adresse }` (Bearer) | entfernt bestätigte oder wartende Adresse; die letzte bestätigte löscht die Familie (`{ familieGeloescht: true }`, Geräte bekommen danach 410) |
| `GET/POST /abmelden?t=` | Token je Empfänger, entfernt nur diese Adresse; die letzte löscht die Familie |

Scheitert der Versand an einen Empfänger, wird nur dieser wiederholt (15 Minuten Abstand, höchstens 5 Versuche am Tag).
Der Topf wird geleert, sobald alle bestätigten Empfänger den Brief haben oder ihre Versuche aufgebraucht sind (bekam ihn
niemand, bleibt er bis morgen). Eine Speicherdatei aus der Zeit „eine Adresse je Topf“ (`adressen`) wird beim Start verworfen.

## Test-Protokoll

`POST /protokoll` (Bearer, `X-App`) nimmt das Test-Protokoll der App an und legt es als JSON-Zeilen unter
`/var/lib/lernen-spielen/protokoll/<gerät>/<tag>.jsonl` ab, getrennt vom Topf; Löschung nach 90 Tagen. Format, Holen
und Lesen: `docs/testprotokoll.md`.

## Probebrief

`probe.js` sendet den Beispiel-Topf der Spec (Mila, Neunerreihe mit Foto) ohne Geräteanmeldung an genau die eine
Adresse von der Befehlszeile:

```sh
cd /opt/lernen-spielen-tagesbrief && runuser -u tagesbrief -- /usr/bin/node dienste/tagesbrief/probe.js <adresse>
```
