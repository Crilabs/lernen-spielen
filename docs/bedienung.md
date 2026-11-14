# Bedienung und Bausteine

Stand: 2026-11-14 · **Entwurf zur Freigabe** · Auswahlfragen von Christian beantwortet (2026-11-14)
Ergänzt [`grundsaetze.md`](grundsaetze.md) und [`grundsaetze-bilder.md`](grundsaetze-bilder.md) (Abschnitt 9
„Bedienzeichen“, Abschnitt 7 „Bewegung“). Die Grundsätze sagen, *was* gelten muss; diese Datei legt fest,
*wie* es in jedem Spiel aussieht und sich bedienen lässt. Umgesetzt wird sie durch die Bausteine in
`spiele/rahmen/`.

Markierung: **(Christian)** entschieden · **(Annahme)** Vorschlag, beim Bau oder am Gerät prüfen.

Geltung: für jedes **neue** Spiel ab sofort. Bestehende Spiele ziehen einzeln um, wenn sie ohnehin
angefasst werden (Christian, 2026-11-14).

---------------------------------------------------------------------------------------------------
## 1. Leitsatz

> **Bedienen ist nie die Aufgabe.**
> Wo ein Knopf liegt und was er tut, ist in jedem Spiel gleich. Das Kind lernt die Bedienung einmal und
> denkt danach nur noch an die Sache.

Bedienelemente gehören zur Bedeutungsebene (`grundsaetze-bilder.md` 0): fest, schlicht, ohne Schmuck,
von keinem Spiel neu erfunden.

---------------------------------------------------------------------------------------------------
## 2. Raster

- **Querformat.** Hochformat wird nicht unterstützt.
- **Einheit:** `1rem = 1/108 der Bildhöhe` (`html{font-size:calc(100dvh / 108)}`). Die Bühne ist
  192 × 108 rem (16:9).
- **Andere Seitenverhältnisse** (Tablets 16:10, 4:3) **(Annahme):** Die Bedeutungsebene (Lernfeld,
  Bedienelemente) bleibt im sicheren Feld 192 × 108 rem, mittig. Der Rand gehört der Stimmungsebene
  (Szene läuft weiter). Bedienelemente kleben am sicheren Feld, nicht am Bildschirmrand.
- **Ränder:** 2,4 rem Abstand von jeder Kante des sicheren Felds. Auf Geräten mit Aussparung kommt
  `env(safe-area-inset-*)` dazu.

---------------------------------------------------------------------------------------------------
## 3. Feste Plätze (Christian)

```
┌──────────────────────────────────────────────────────────────┐
│ (⌂) [Fach] Spielname                                    (♪)  │  ← Kopfleiste, Band in der
│            Thema                                             │    Tönung des Fachs
├──────────────────────────────────────────────────────────────┤
│          ┌ Sprechblase ………………………………… (🔊) ┐                  │
│                                                              │
│                        Spielfeld                             │
│                  (still, solange das Kind denkt)             │
│                                                              │
│              [  Bildschirm-Tastatur, falls nötig  ]     (?)  │
└──────────────────────────────────────────────────────────────┘
( ) Nebenknopf, drückbar   [ ] flache Kachel, nur Anzeige
```

| Platz | Element | Name (gesprochen/Bezeichnung) |
|---|---|---|
| Kopfleiste, links | **Alle Spiele** (Haus) | „Alle Spiele“ |
| Kopfleiste, rechts daneben | **Fachsymbol** als flache Kachel in der Fachfarbe (Mathe, Lesen, Schreiben, Grammatik, Geometrie) – nur Anzeige, kein Knopf | – |
| Kopfleiste, daneben | **Spielname** (fett, im Tief-Ton des Fachs) und darunter leiser das **Thema** der Runde (z. B. „Die 7 zerlegen“) – nur Anzeige | – |
| Kopfleiste, rechts | **Ton** an/aus | „Ton an“ / „Ton aus“ |
| in der Sprechblase, rechts | **Noch mal hören** | „Noch mal hören“ |
| unten rechts | **Hilfe** | „Hilfe“ |
| unten Mitte | **Bildschirm-Tastatur**, nur in Spielen mit Eingabe | – |
| Pause/Rundenende, unten Mitte | **Alle Spiele** und **Weiter**, nebeneinander, gleich groß | „Alle Spiele“ / „Weiter“ |

- **Kopfleiste (Christian):** ein Band über die ganze Breite des sicheren Felds, 15,8 rem hoch, in der
  Tönung des Fachs (Rahmen-Schicht, `grundsaetze-bilder.md` 6.2). Ohne Fachfarbe (Sachthemen, Startseite
  von Welten) ist das Band Nebel, ohne Kachel, der Name steht in Tinte. Das Spielfeld beginnt darunter:
  `<ls-leiste>` setzt `--ls-leiste-hoehe` am `<html>` (15,8 rem = `MASSE.leiste`, plus
  `env(safe-area-inset-top)`); das Spiel legt seine Fläche mit `top: var(--ls-leiste-hoehe)` darunter.
- Das Thema kommt aus der Lernsteuerung (`thema` in `spiele.json` bzw. das Thema der Runde) und darf sich
  während des Spiels ändern. Es wird nicht vorgelesen; Ziffern dürfen darin stehen.
- Kein Spiel legt etwas anderes auf diese Plätze, und keines verschiebt sie.
- Die Sprechblase selbst darf das Spiel platzieren. Sie gehört dem **Erzähler** (zur Szene), nie dem Mund
  einer Figur: kein Zipfel, der auf eine Figur zeigt, keine Ich-Sätze darin (`docs/stimme.md`). Der
  Noch-mal-hören-Knopf sitzt immer rechts in der Blase, weil er zu genau diesem Text gehört.
- Die Startseite hat ihre eigene Ordnung (Fächer, Spiele, Zahnrad für Erwachsene). Diese Datei regelt
  die Spielseiten.

---------------------------------------------------------------------------------------------------
## 4. Größen

| Element | Größe | Bemerkung |
|---|---|---|
| Nebenknopf (Haus, Ton, Hilfe) | 11 rem rund | am Kiosk (1080 px, 21,5″) ≈ 2,9 cm, auf 10″-Tablet (800 px) ≈ 2,3 cm; Mindestmaß K4: 2 × 2 cm **(Annahme, am Tablet prüfen)** |
| Hauptknopf (Weiter, Fertig) | Pille, 11 rem hoch, mindestens 24 rem breit | Symbol und Wort; Wort 4 rem fett |
| Pausenknöpfe (Alle Spiele, Weiter) | Pille, 14 rem hoch, beide 50 rem breit | gleich groß (N6); Wort 5 rem fett |
| Noch mal hören (in der Blase) | 8 rem | Tippfläche auf 11 rem erweitert |
| Fachsymbol | Kachel 9 rem, Radius 2,6 rem | nur Anzeige, flach |
| Kopfleiste | 15,8 rem hoch | Spielname 5,2 rem fett, Thema 3,4 rem |
| Kontur | 0,3 rem Tinte | Knöpfe, Kachel, Blase |
| Schatten drückbarer Teile | 0,6 rem, beim Drücken 0,3 rem | |
| Taste der Bildschirm-Tastatur | mindestens 9 × 8,6 rem | |
| Abstand zwischen Tippzielen | mindestens 2 rem | |
| Schrift im Spiel | mindestens 3,2 rem, Andika | Kontur und Schrift `#3B2A6B` |

Begründung Hauptknopf (Annahme): Die Pille ist so hoch wie ein Nebenknopf, damit sie in derselben Zeile
stehen kann; Breite und Wort machen sie zum Hauptknopf, nicht die Höhe. Die alte runde Hauptaktion mit
16 rem gibt es als `groesse="haupt"` weiter für runde Knöpfe.

### 4.1 Farben (Christian)

Die Werte stehen nur in `grundsaetze-bilder.md` 6.2 (Anschauung: `docs/farbwelt.html`) und im Code in
`spiele/rahmen/stil.js` (`FARBE`, `FACH`, `RADIUS`); hier nur, wie die Bedienung sie nutzt:

- **Nebenknopf:** Papier, Tinte-Kontur, Schatten in Tinte weich; nur Symbol, der Name wird beim ersten Tippen
  gesprochen. Haus, Ton, Noch mal hören, Hilfe.
- **Hauptknopf:** Tinte gefüllt, Symbol und Wort in Papier, Schatten im dunklen Tinte-Ton. Weiter, Fertig.
  Neutral, nie grün.
- **Schatten heißt drückbar:** Nur Knöpfe haben Schatten. Kopfleiste, Fachkachel, Sprechblase und die
  Karte der Pause sind flach.
- **Sonnenring:** Fokus, Auswahl und das Aufleuchten der Hilfe sind ein Ring in Sonne (mit feiner
  Tinte-Kante), nie eine Füllung.
- **Pause:** Nacht mit Sternen in Sonne, Inhalt auf Papier, Knöpfe aus Papier.
- Kein Grün und kein Rot für richtig/falsch, keine Farbe je Buchstabe, keine Verläufe in den Bausteinen
  (Verläufe nur in der Welt).

---------------------------------------------------------------------------------------------------
## 5. Gesten

- Im Spiel gibt es nur **Tippen** und **Ziehen**.
- **Jedes Ziehen hat eine Tipp-Alternative:** erst das Teil antippen (es hebt sich sichtbar an), dann
  das Ziel. Ein zweites Antippen des Teils legt es zurück.
- Nicht verwendet werden Doppeltipp, Wischen, langes Drücken, Zwei-Finger-Gesten. Langes Drücken gibt es
  nur beim Zahnrad auf der Startseite (Zugang für Erwachsene).
- Zoomen, Markieren, Kontextmenü und Ziehen von Bildern sind gesperrt (`sperreTouch()` aus
  `lernspiel.js`).

---------------------------------------------------------------------------------------------------
## 6. Wie Bedienelemente reagieren

- **Einsinken:** Jeder Knopf sinkt beim Drücken sichtbar ein (0,3 rem, Schatten wird kürzer). Kein
  Federn, kein Glitzern.
- **Sonnenring (Christian):** Was ausgewählt ist oder den Tastaturfokus hat, bekommt einen Ring in Sonne
  um den Knopf. Er bewertet nichts und füllt nie eine Fläche.
- **Name beim ersten Tippen (Christian):** Ein Bedienzeichen spricht beim ersten Antippen je Sitzung
  seinen Namen (K3), sofern der Ton an ist. Danach bleibt es still. Sitzung heißt: seit dem Start der App.
- **Ton aus** beendet laufende Sprache sofort. Klänge des Spiels verstummen ebenfalls.
- **Hilfe (Christian):** Der Hilfe-Knopf ist immer da. Nach dem zweiten Versuch, der noch nicht passt,
  leuchtet er **einmal** ruhig auf: ein Sonnenring mit weichem Licht um den Knopf (etwa 1 s, kein
  Blinken in Schleife, B3). Die Hilfe selbst kommt nur
  auf Tippen: erst eine Denkhilfe (die Probe), beim nächsten Tippen die Lösung mit Begründung, die das
  Kind selbst ausführt (L12). Mit Hilfe Gelöstes meldet das Spiel der Lernsteuerung als „mit Hilfe“.
- **Noch mal hören** spricht den Text der Blase erneut, im Tempo, in dem er zuerst kam (Diktat langsamer).
- **Wenig Bewegung:** Bei `prefers-reduced-motion` entfallen Animationen; das Aufleuchten wird zu einem
  ruhigen Sonnenring, der 1 s steht.

---------------------------------------------------------------------------------------------------
## 7. Abläufe

### 7.1 Eine Runde

1. **Einführung** (beim ersten Mal und wenn ein neues Thema beginnt): kurze Szene, immer überspringbar,
   mit „Wie geht es aus?“ (9.2 Nr. 7). Neue Spieltypen zeigen einmal vor (L5).
2. **Aufgaben** (3–5 Minuten, L10). Während das Kind denkt, bewegt sich nichts, und es erscheint nichts
   Neues (B3, 3.1 Nr. 6).
3. **Rundenende (Christian):** eine ruhige Pause auf Nacht mit stillen Sternen in Sonne; Bild oder
   Sachmoment (K1, K8) liegen auf einer Papierkarte. Darunter **Alle Spiele** und **Weiter**: gleich
   groß, gleich gestaltet (Papier, Tinte-Kontur, Symbol und Wort), keiner hervorgehoben, auch nicht durch
   den Fokus. Aufhören ist gleichwertig (N6). Nichts läuft ab, nichts geht von selbst weiter, kein
   Füllbalken (`grundsaetze.md` 13).

### 7.2 Verlassen

- „Alle Spiele“ ist jederzeit erreichbar und speichert vorher (`linkKlick` in `lernspiel.js`).
- Beim Verlassen zeigt keine Figur ein Gefühl, es gibt keine Rückfrage (N6).

### 7.3 Eingabe

- **Keine Systemtastatur.** Spiele mit Eingabe nutzen die Bildschirm-Tastatur.
- Die Tastatur zeigt **nur die Tasten, die die Aufgabe braucht** (z. B. die Buchstaben des Satzes),
  in fester Reihenfolge (alphabetisch bzw. 1–9, 0), dazu Leertaste und Löschen, falls nötig.
- **Tasten (Christian):** Papier mit Tinte-Kontur und Schatten in Tinte weich, das Zeichen in Tinte. Keine
  Farbe je Buchstabe (`grundsaetze-bilder.md` 6.4); Vokale werden nicht eingefärbt.
- Eine angeschlossene Hardware-Tastatur funktioniert zusätzlich. Sie nimmt Groß- und Kleinbuchstaben genau
  wie die Bildschirm-Tasten (k ≠ K), weil Groß/Klein selbst das Lernziel sein kann.
- Tasten in Reihen gleichmäßig verteilt (13 Tasten: 7/6, nicht 10/3); Abstand in der Reihe 1,6 rem, damit
  der Fokusring die Nachbarn nicht überdeckt.

---------------------------------------------------------------------------------------------------
## 8. Was es nicht gibt

- Keine eigene Farbe oder kein eigenes Symbol für „falsch“ oder „richtig“; die Mechanik zeigt es (3.1).
- Keine Pop-ups, Zwischenrufe oder Hinweise, während das Kind arbeitet.
- Keine Zähler, Punkte, Timer, Fortschrittsbalken im Spiel (N5, N8).
- Keine Knöpfe ohne Namen, keine Knöpfe, die nur ein Symbol ohne gegenständliche Bedeutung zeigen.
- Kein Bedienelement auf der Stimmungsebene (ein Knopf ist nie Teil der Szene).

---------------------------------------------------------------------------------------------------
## 9. Bausteine (`spiele/rahmen/`)

Web Components mit Shadow DOM, ohne Framework, angebunden an `spiele/kern/` (Ton-Einstellung, Stimme,
Speicher). Das Spiel setzt sie ein und hört auf ihre Ereignisse; es baut diese Elemente nie selbst.

| Baustein | Aufgabe | Schnittstelle (Kurzform) |
|---|---|---|
| `<ls-knopf>` | Grundknopf: Neben- oder Hauptknopf, Symbol, Name, Einsinken, Mindestgröße, Name beim ersten Tippen | Attribute `art="neben\|haupt"` (Vorgabe neben), `symbol`, `name`, `wort` (sichtbares Wort, macht den Knopf zur Pille), `groesse="bedien\|haupt\|klein"`, `gespiegelt`, `stumm`, `spiel`; Ereignis `click` |
| `<ls-leiste>` | Kopfleiste: Haus, Fachkachel, Spielname, Thema, Ton | Attribute `spiel`, `fach`, `titel`, `thema` (zur Laufzeit änderbar); Eigenschaft `ton` (boolean); Ereignisse `ton`, `bereit`; `istBereit`, `bereit()`, `bereitet` (Versprechen, sobald die Einstellungen geladen sind); setzt `--ls-leiste-hoehe` am Dokument |
| `<ls-blase>` | Sprechblase des Erzählers mit Noch-mal-hören, ohne Zipfel | `sage(text, { sprechen = true, tempo })`; Eigenschaft `text` |
| `<ls-hilfe>` | Hilfe-Knopf unten rechts | `leuchte()` (Sonnenring, einmal ~1 s); Ereignis `hilfe` |
| `<ls-pause>` | Pause/Rundenende mit Alle Spiele und Weiter | Inhalt (Bild, Sachmoment) per Slot; `await zeige()` → `"weiter"` |
| `<ls-tastatur>` | Bildschirm-Tastatur | Attribute `tasten` (die benötigten Zeichen), `leertaste`, `loeschen`; Ereignis `taste` mit `detail.zeichen` |
| `ziehbar()` (`ziehen.js`) | Ziehen mit Tipp-Alternative (§5): ziehen ab 1 rem Bewegung, sonst antippen → angehoben mit Sonnenring → Ziel antippen; Enter/Leertaste auf Teil und Ziel | `ziehbar(teil, { ziele, beimAblegen(teil, ziel) })` → `loesen()`; das Spiel ruft `setze(teil, ziel)` oder `zurueck(teil)` (0,3 s, bei wenig Bewegung sofort); Klassen `angehoben`, `gezogen`, `gedrueckt`, an Zielen `ziel-frei`, `ziel-ueber`; Zustand ohne DOM in `ziehen-zustand.js` |

- **Aussehen über CSS-Variablen:** `--ls-tinte`, `--ls-tinte-weich`, `--ls-papier`, `--ls-nebel`,
  `--ls-linie`, `--ls-naht`, `--ls-haupt-schatten`, `--ls-sonne`, `--ls-nacht`, `--ls-kontur`,
  `--ls-radius-gross|--ls-radius|--ls-radius-klein`, `--ls-knopf`, `--ls-neben-schatten`, `--ls-schatten`; Werte aus
  `stil.js` (Farbwelt). Eine Welt ändert sie nicht: Form, Farbe, Größe und Platz der Bedienung sind fest.
- **Seiten-Grundstil:** `spiele/rahmen/seite.css` (in die Spielseite einbinden): Raster, Andika, dieselben
  Variablen in `:root`, Ebenen `.welt` (hinter allem, ganzer Bildschirm), `.buehne` (sicheres Feld),
  `.spielflaeche` (ab `--ls-leiste-hoehe`), Flächen `.lernfeld` (Matte) und `.tablett` (flach, ohne Schatten),
  `.teil` (ziehbares Teil mit Schatten), `.auswahl` (Sonnenring). `tests/rahmen-stil.test.mjs` prüft die
  Variablen gegen `TOKENS` in `stil.js`.
- **Vorschau:** `spiele/rahmen/vorschau.html` zeigt alle Bausteine zum Ansehen und Ausprobieren.
- **Regel (geplant):** Sobald das erste Spiel umgezogen ist, prüft ein Test, dass umgezogene Spiele Haus-
  und Ton-Knopf nicht selbst bauen.

---------------------------------------------------------------------------------------------------
## 10. Checkliste für jedes neue Spiel

- [ ] `<ls-leiste>` mit `spiel`, `fach`, `titel` und `thema`; keine eigenen Haus-/Ton-Knöpfe; das
      Spielfeld beginnt unter der Kopfleiste.
- [ ] Gesprochene Texte über `<ls-blase>` oder `kern`-`sprich`, mit Noch-mal-hören.
- [ ] `<ls-hilfe>` mit Hilfe-Leiter (Probe, dann Lösung); `leuchte()` nach dem zweiten Versuch.
- [ ] Rundenende mit `<ls-pause>`; nichts läuft von selbst weiter.
- [ ] Eingabe nur über `<ls-tastatur>`; nur die nötigen Tasten.
- [ ] Jedes Ziehen auch per Tippen.
- [ ] Tippziele nach Abschnitt 4; Abstände mindestens 2 rem.
- [ ] Still beim Denken; `prefers-reduced-motion` geprüft.
- [ ] Im Browser in Chromium und WebKit bei 1920 × 1080 und 1280 × 800 angesehen.
