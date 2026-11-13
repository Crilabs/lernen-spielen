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
│ [⌂] [Fach]  ┌ Sprechblase ……………………… [🔊] ┐            [♪]    │
│                                                              │
│                                                              │
│                        Spielfeld                             │
│                  (still, solange das Kind denkt)             │
│                                                              │
│                                                       [?]    │
│              [  Bildschirm-Tastatur, falls nötig  ]          │
└──────────────────────────────────────────────────────────────┘
```

| Platz | Element | Name (gesprochen/Bezeichnung) |
|---|---|---|
| oben links | **Alle Spiele** (Haus) | „Alle Spiele“ |
| oben links, rechts daneben | **Fachsymbol** (Mathe, Lesen, Schreiben, Grammatik, Sachthemen) – nur Anzeige, kein Knopf | – |
| oben rechts | **Ton** an/aus | „Ton an“ / „Ton aus“ |
| in der Sprechblase, rechts | **Noch mal hören** | „Noch mal hören“ |
| unten rechts | **Hilfe** | „Hilfe“ |
| unten Mitte | **Bildschirm-Tastatur**, nur in Spielen mit Eingabe | – |
| Pause/Rundenende, unten Mitte | **Alle Spiele** und **Weiter**, nebeneinander, gleich groß | „Alle Spiele“ / „Weiter“ |

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
| Bedienknopf (Haus, Ton, Hilfe) | 11 rem rund | am Kiosk (1080 px, 21,5″) ≈ 2,9 cm, auf 10″-Tablet (800 px) ≈ 2,3 cm; Mindestmaß K4: 2 × 2 cm **(Annahme, am Tablet prüfen)** |
| Hauptaktion (Weiter, Alle Spiele in der Pause) | 16 rem rund | |
| Noch mal hören (in der Blase) | 8 rem | Tippfläche durch Polster auf 11 rem erweitert |
| Fachsymbol | 8 rem | nur Anzeige |
| Taste der Bildschirm-Tastatur | mindestens 9 × 8,6 rem | |
| Abstand zwischen Tippzielen | mindestens 2 rem | |
| Schrift im Spiel | mindestens 3,2 rem, Andika | Kontur und Schrift `#3B2A6B` |

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
- **Name beim ersten Tippen (Christian):** Ein Bedienzeichen spricht beim ersten Antippen je Sitzung
  seinen Namen (K3), sofern der Ton an ist. Danach bleibt es still. Sitzung heißt: seit dem Start der App.
- **Ton aus** beendet laufende Sprache sofort. Klänge des Spiels verstummen ebenfalls.
- **Hilfe (Christian):** Der Hilfe-Knopf ist immer da. Nach dem zweiten Versuch, der noch nicht passt,
  leuchtet er **einmal** ruhig auf (etwa 1 s, kein Blinken in Schleife, B3). Die Hilfe selbst kommt nur
  auf Tippen: erst eine Denkhilfe (die Probe), beim nächsten Tippen die Lösung mit Begründung, die das
  Kind selbst ausführt (L12). Mit Hilfe Gelöstes meldet das Spiel der Lernsteuerung als „mit Hilfe“.
- **Noch mal hören** spricht den Text der Blase erneut, im Tempo, in dem er zuerst kam (Diktat langsamer).
- **Wenig Bewegung:** Bei `prefers-reduced-motion` entfallen Einsinken-Animation und Aufleuchten; das
  Aufleuchten wird zu einem ruhigen Rahmen, der 1 s sichtbar ist.

---------------------------------------------------------------------------------------------------
## 7. Abläufe

### 7.1 Eine Runde

1. **Einführung** (beim ersten Mal und wenn ein neues Thema beginnt): kurze Szene, immer überspringbar,
   mit „Wie geht es aus?“ (9.2 Nr. 7). Neue Spieltypen zeigen einmal vor (L5).
2. **Aufgaben** (3–5 Minuten, L10). Während das Kind denkt, bewegt sich nichts, und es erscheint nichts
   Neues (B3, 3.1 Nr. 6).
3. **Rundenende:** eine ruhige Pause mit Bild (Stimmungsebene) und zwei gleichwertigen Knöpfen **Alle
   Spiele** und **Weiter**. Nichts läuft ab, nichts geht von selbst weiter, kein Füllbalken
   (`grundsaetze.md` 13). Ein Sachmoment (K1, K8) darf hier stehen.

### 7.2 Verlassen

- „Alle Spiele“ ist jederzeit erreichbar und speichert vorher (`linkKlick` in `lernspiel.js`).
- Beim Verlassen zeigt keine Figur ein Gefühl, es gibt keine Rückfrage (N6).

### 7.3 Eingabe

- **Keine Systemtastatur.** Spiele mit Eingabe nutzen die Bildschirm-Tastatur.
- Die Tastatur zeigt **nur die Tasten, die die Aufgabe braucht** (z. B. die Buchstaben des Satzes),
  in fester Reihenfolge (alphabetisch bzw. 1–9, 0), dazu Leertaste und Löschen, falls nötig.
- Tastenfarben dürfen beim Wiederfinden helfen, tragen aber keine Bedeutung allein (C1): Auf jeder Taste
  steht das Zeichen.
- Eine angeschlossene Hardware-Tastatur funktioniert zusätzlich.

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
| `<ls-knopf>` | runder Grundknopf: Symbol, Name, Einsinken, Mindestgröße, Name beim ersten Tippen | Attribute `symbol`, `name`, `groesse="bedien\|haupt\|klein"`; Ereignis `click` |
| `<ls-leiste>` | Haus, Fachsymbol und Ton an den festen Plätzen | Attribute `spiel`, `fach`; Eigenschaft `ton` (boolean); Ereignis `ton` |
| `<ls-blase>` | Sprechblase mit Noch-mal-hören | `sage(text, { sprechen = true, tempo })`; Eigenschaft `text` |
| `<ls-hilfe>` | Hilfe-Knopf unten rechts | `leuchte()`; Ereignis `hilfe` |
| `<ls-pause>` | Pause/Rundenende mit Alle Spiele und Weiter | Inhalt (Bild, Sachmoment) per Slot; `await zeige()` → `"weiter"` |
| `<ls-tastatur>` | Bildschirm-Tastatur | Attribute `tasten` (die benötigten Zeichen), `leertaste`, `loeschen`; Ereignis `taste` mit `detail.zeichen` |

- **Aussehen über CSS-Variablen (Annahme):** `--ls-tinte` (`#3B2A6B`), `--ls-papier`, `--ls-knopf`,
  `--ls-schatten`. Eine Welt darf Papier und Knopf leicht tönen, nicht Form, Größe oder Platz.
- **Vorschau:** `spiele/rahmen/vorschau.html` zeigt alle Bausteine zum Ansehen und Ausprobieren.
- **Regel (geplant):** Sobald das erste Spiel umgezogen ist, prüft ein Test, dass umgezogene Spiele Haus-
  und Ton-Knopf nicht selbst bauen.

---------------------------------------------------------------------------------------------------
## 10. Checkliste für jedes neue Spiel

- [ ] `<ls-leiste>` mit `spiel` und `fach`; keine eigenen Haus-/Ton-Knöpfe.
- [ ] Gesprochene Texte über `<ls-blase>` oder `kern`-`sprich`, mit Noch-mal-hören.
- [ ] `<ls-hilfe>` mit Hilfe-Leiter (Probe, dann Lösung); `leuchte()` nach dem zweiten Versuch.
- [ ] Rundenende mit `<ls-pause>`; nichts läuft von selbst weiter.
- [ ] Eingabe nur über `<ls-tastatur>`; nur die nötigen Tasten.
- [ ] Jedes Ziehen auch per Tippen.
- [ ] Tippziele nach Abschnitt 4; Abstände mindestens 2 rem.
- [ ] Still beim Denken; `prefers-reduced-motion` geprüft.
- [ ] Im Browser in Chromium und WebKit bei 1920 × 1080 und 1280 × 800 angesehen.
