# Test-Protokoll des Spielfortschritts

Während der Erprobung schreibt die App jeden Schritt des Spielens mit und schickt ihn an den Tagesbrief-Dienst auf
`crilabs-app-server`. Es gibt keine Ansicht dafür: Gelesen wird mit Claude aus den Dateien, um Rückschlüsse zu ziehen
(Warum kam dieses Thema? Wo hängt ein Spiel? Welche Aufgaben brauchen Hilfe?).

## Lesen

```sh
npm run protokoll:holen                       # Server → protokoll/<gerät>/<JJJJ-MM-TT>.jsonl (git-ignoriert)
npm run protokoll:zeitachse                   # jüngster Tag als kurze Zeitachse, ohne Lernstände
npm run protokoll:zeitachse -- 2026-11-23 kettenhuepfer   # ein Tag, nur ein Spiel
```

Die Dateien sind JSON-Zeilen, eine je Eintrag. Lernstände (`art: "stand"`) sind groß; für Fragen zum Ablauf erst die
Zeitachse lesen und den passenden Lernstand gezielt holen, z. B. mit
`grep '"art":"stand"' protokoll/*/2026-11-23.jsonl | tail -1`.

## Einträge

Jeder Eintrag hat `t` (Zeit in der App, ISO, UTC), `art`, `s` (Kennung des Seitenaufrufs), `n` (laufende Nummer auf
dieser Seite) und `e` (Eingang beim Dienst). Einträge einer Runde tragen `spiel`.

| art | wann | Felder |
| --- | --- | --- |
| `seite` | erster Eintrag eines Seitenaufrufs | `pfad` (z. B. `perlenbruecke/index.html`) |
| `runde-start` | Rundenbeginn (`runde()` in `spiele/lernsteuerung.js`) | `thema`, `modus` (`thema`, `wiederholung`, `vorgriff`), `wunsch` (aus der Übersicht), `neu`, `stufe`, `probe` (Zahl der Probeaufgaben), `max`, `einfuehrungFaellig`, `themaVorher` (Themen-Eintrag vor der Runde), `kandidaten` (alle Themen, die das Spiel bedient, mit Zustand: `verborgen`, `in-sicht`, `dran`, `kann-ich`) |
| `einfuehrung` | Einführung gesehen | `thema` |
| `thema-start` | Thema wird `dran` | `thema` |
| `angebot` | nächste Aufgabe | `key`, `thema` (bei Wiederholungen ein anderes als das der Runde), `stufe`, `nr`, `auch` (Mitaufgaben); ohne Aufgabe `key: null` und `grund` (`gekonnt`, `ende`) |
| `antwort` | Ergebnis gemeldet | `key`, `ok`, `hilfe` (0 ohne, 1 Denkhilfe, 2 Lösung gezeigt), `ms`, `stufe` danach, `ereignis` (`{typ:"stufe",stufe}` oder `{typ:"gekonnt",thema}`), `aufgabe` (Eintrag der Aufgabe im Lernstand danach: Fach `f`, Verlauf `h`, Zeiten `ms` …) |
| `runde-ende` | Runde zu Ende (fehlt bei Abbruch) | `gezeigt`, `antworten`, `richtig`, `hilfe`, `dauerMs`, `stufe`, `gekonnt`, `hinweisSpiel`, `themaNachher` |
| `stand` | nach Rundenbeginn und -ende sowie nach Eingriffen der Eltern, nur wenn geändert | `anlass`, `stand` (ganzer Lernstand `lernplan`) |
| `buch` | Kapitel neu fertig, Buch erstmals ganz gelesen | `id`, `kapitelFertig`, `fertig`, `kapitelZahl`, `gelesen` |
| `erinnern` | „Weißt du noch?“ gezeigt oder beantwortet | `id`, `kapitel`, `gestellt` |
| `eltern` | Elternbereich hakt ab, setzt zurück, gibt frei | `aktion`, `themen` (bei `abhaken` auch `gewaehlt`) |

Neue Arten: klein mit Bindestrich, höchstens 40 Zeichen (der Dienst lehnt andere ab).

## Weg der Daten

1. `spiele/kern/testprotokoll.js` (`notiere`, `notiereStand`, `sendeProtokoll`): nur in der App, wirft nie.
2. `src-tauri/src/testprotokoll.rs`: hängt an `testprotokoll.jsonl` im Tagesbrief-Ordner des Profils an; sendet am
   Rundenende, 30 Sekunden nach dem Start und dann alle 5 Minuten in Stapeln (≤ 1000 Einträge, ≤ 700 KB). Ohne Netz
   bleibt alles liegen; über 20 MB fällt die ältere Hälfte weg.
3. Dienst `POST /protokoll` (`dienste/tagesbrief/protokoll.js`): Anmeldung mit dem Geräteschlüssel des Tagesbriefs,
   Ablage in `/var/lib/lernen-spielen/protokoll/<12 Zeichen Geräte-Hash>/<Tag in Berlin>.jsonl`, Löschung nach 90 Tagen.

Ohne eingerichteten Tagesbrief wird nur lokal gesammelt, gesendet wird nichts. Das Protokoll enthält keine Namen oder
Adressen. Die Datenschutzseite des Dienstes nennt es.
