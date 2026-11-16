# Bedienung und Bausteine

> **Für den Bau von Spielen** gilt seit 2026-11-15 [`spielbau.md`](spielbau.md): Dessen Spielkern (§1) und „Zeigen statt
> erklären“ (§8) gehen den Regeln hier vor; die Grenzen G1–G14 dort fassen das Verbindliche zusammen (Christian).

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
  `env(safe-area-inset-*)` dazu. Die Übersichtsseiten (Können, Regal, Wissen, Geschichte) haben nach der Designsprache
  (2026-11-15) 9,6 rem Außenrand (`SEITE.rand`, `--ls-seite-rand`); Spiele behalten 2,4 rem.

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
| Kopfleiste, rechts daneben | **Fachsymbol** als flache Kachel in der Fachfarbe (Mathe, Lesen, Schreiben, Grammatik, Geometrie, Sprechen) – nur Anzeige, kein Knopf | – |
| Kopfleiste, daneben | **Spielname** (fett, im Tief-Ton des Fachs) und darunter leiser das **Thema** der Runde (z. B. „Die 7 zerlegen“) – nur Anzeige | – |
| Kopfleiste, rechts | **Ton** an/aus | „Ton an“ / „Ton aus“ |
| in der Sprechblase, rechts | **Noch mal hören** | „Noch mal hören“ |
| unten rechts | **Hilfe** | „Hilfe“ |
| unten Mitte | **Bildschirm-Tastatur**, nur in Spielen mit Eingabe | – |
| Pause/Rundenende, unten Mitte | **Alle Spiele** und **Weiter**, nebeneinander, gleich groß | „Alle Spiele“ / „Weiter“ |

- **Kopfleiste (Christian, Designsprache 2026-11-15):** ein ruhiger Grund in Nebel über die ganze Breite des sicheren
  Felds, 15,8 rem hoch – kein Band in der Fachtönung mehr. Die Fachfarbe erscheint nur klein in der flachen Fachkachel
  (ohne Kontur). Der Spielname steht in Inter in Tinte, das Thema darunter leiser in Andika. Ohne Fach keine Kachel. Das Spielfeld beginnt darunter:
  `<ls-leiste>` setzt `--ls-leiste-hoehe` am `<html>` (15,8 rem = `MASSE.leiste`, plus
  `env(safe-area-inset-top)`); das Spiel legt seine Fläche mit `top: var(--ls-leiste-hoehe)` darunter.
- Das Thema kommt aus der Lernsteuerung (`thema` in `spiele.json` bzw. das Thema der Runde) und darf sich
  während des Spiels ändern. Es wird nicht vorgelesen; Ziffern dürfen darin stehen.
- Kein Spiel legt etwas anderes auf diese Plätze, und keines verschiebt sie.
- Die Sprechblase selbst darf das Spiel platzieren. Sie gehört dem **Erzähler** (zur Szene), nie dem Mund
  einer Figur: kein Zipfel, der auf eine Figur zeigt, keine Ich-Sätze darin (`docs/stimme.md`). Der
  Noch-mal-hören-Knopf sitzt immer rechts in der Blase, weil er zu genau diesem Text gehört.
  Welche Figuren es gibt, was sie können und wie der Erzähler über sie spricht, steht in
  [`docs/figuren.md`](figuren.md).
- Die Übersichtsseiten haben ihre eigene Ordnung (Designsprache 2026-11-15): oben links die Reiter „Können“
  (Startseite) und „Wissen“ (Bibliothek), oben rechts Ton (und auf der Startseite das Zahnrad für Erwachsene),
  `<ls-kopf>`. Diese Datei regelt die Spielseiten.

---------------------------------------------------------------------------------------------------
## 4. Größen

| Element | Größe | Bemerkung |
|---|---|---|
| Nebenknopf auf Übersichtsseiten (`groesse="seite"`) | sichtbar 8,4 rem, Tippfläche 11 rem | Designsprache 2026-11-15; K4 bleibt über die Tippfläche erfüllt |
| Nebenknopf (Haus, Ton, Hilfe) | 11 rem rund | am Kiosk (1080 px, 21,5″) ≈ 2,9 cm, auf 10″-Tablet (800 px) ≈ 2,3 cm; Mindestmaß K4: 2 × 2 cm **(Annahme, am Tablet prüfen)** |
| Hauptknopf (z. B. Fertig, wenn das Kind selbst sagt, dass es fertig ist) | Pille, 11 rem hoch, mindestens 24 rem breit | Symbol und Wort; Wort 4 rem fett. Kein Weiter zwischen Aufgaben (7.1) |
| Pausenknöpfe (Alle Spiele, Weiter) | Pille, 14 rem hoch (`groesse="gross"`), beide 50 rem breit | gleich groß und gleich gestaltet: Nebenknöpfe aus Papier, keiner ist Hauptknopf (N6); Wort 5 rem fett |
| Noch mal hören (in der Blase) | 8 rem | Tippfläche auf 11 rem erweitert |
| Fachsymbol | Kachel 9 rem, Radius 2,6 rem | nur Anzeige, flach |
| Kopfleiste | 15,8 rem hoch | Spielname 5,2 rem fett, Thema 3,4 rem |
| Kontur | 0,3 rem Tinte | Knöpfe, Kachel, Blase |
| Schatten drückbarer Teile | 0,6 rem, beim Drücken 0,3 rem | Knöpfe und Teile (`.teil`); Ausnahme Tasten, s. nächste Zeile |
| Taste der Bildschirm-Tastatur | mindestens 9 × 8,6 rem; Schatten 0,8 rem, sinkt beim Drücken 0,7 rem ein | Ausnahme (Annahme): beim schnellen Tippen soll jeder Anschlag deutlich zu sehen sein, daher tiefer als bei Knöpfen (`TASTE` in `tastatur.js`) |
| Abstand zwischen Tippzielen | mindestens 2 rem | |
| Schrift im Spiel | mindestens 3,2 rem, Andika | Kontur und Schrift `#3B2A6B`; Spielname und Wörter auf Knöpfen in Inter (Oberfläche, D6) |

Begründung Hauptknopf (Annahme): Die Pille ist so hoch wie ein Nebenknopf, damit sie in derselben Zeile
stehen kann; Breite und Wort machen sie zum Hauptknopf, nicht die Höhe. Die alte runde Hauptaktion mit
16 rem gibt es als `groesse="gross"` weiter für runde Knöpfe. `groesse` (bedien, gross, klein) ist nur die
Größe, `art` (neben, haupt) nur die Gestalt; beides ist unabhängig.

### 4.1 Farben (Christian)

Die Werte stehen nur in `grundsaetze-bilder.md` 6.2 (Anschauung: `docs/farbwelt.html`) und im Code in
`spiele/rahmen/stil.js` (`FARBE`, `FACH`, `RADIUS`); hier nur, wie die Bedienung sie nutzt:

- **Nebenknopf:** Papier, Tinte-Kontur, Schatten in Tinte weich; nur Symbol, der Name wird beim ersten Tippen
  gesprochen. Haus, Ton, Noch mal hören, Hilfe.
- **Hauptknopf:** Tinte gefüllt, Symbol und Wort in Papier, Schatten im dunklen Tinte-Ton. Z. B. Fertig.
  Neutral, nie grün. Zwischen zwei Aufgaben gibt es keinen Weiter-Knopf (7.1), und die Pausenknöpfe
  Alle Spiele und Weiter sind beide gleiche Pillen aus Papier, kein Hauptknopf.
- **Schatten heißt drückbar:** Nur Knöpfe, ziehbare Teile und Tasten haben Schatten. Kopfleiste,
  Fachkachel, Sprechblase, Matte, Tablett und die Karte der Pause sind flach.
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
- **Vorgemerkt (Spielkatalog §8, noch nicht freigegeben):** Freihand-Strich mit Aufzeichnung (S18, S20),
  Drehgriff am angehobenen Teil und Drehpfeile an Körpern (Geometrie), Zurück im Lernfeld (R10, R12),
  Zwei-Personen-Ablauf am selben Gerät (M34, M56), Aufnahmeknopf (Z09, Z10, L18), Kopfhörer für links/rechts (Z01).
  Jede Eingabe wird im Plan des ersten Spiels entworfen, das sie braucht, mit diesem Plan freigegeben und dann
  hier als Geste oder Baustein eingetragen. Bis dahin bleibt es bei Tippen und Ziehen.

---------------------------------------------------------------------------------------------------
## 6. Wie Bedienelemente reagieren

- **Einsinken:** Jeder Knopf sinkt beim Drücken sichtbar ein (0,3 rem, Schatten wird kürzer). Kein
  Federn, kein Glitzern.
- **Sonnenring (Christian):** Was ausgewählt ist oder den Tastaturfokus hat, bekommt einen Ring in Sonne
  um den Knopf. Er bewertet nichts und füllt nie eine Fläche.
- **Name beim ersten Tippen (Christian):** Ein Bedienzeichen spricht beim ersten Antippen je Sitzung
  seinen Namen (K3), sofern der Ton an ist. Danach bleibt es still. Sitzung heißt: seit dem Start der App.
  **Inhalt geht vor (Christian, 2026-11-14):** Der Name gilt nur als gesagt, wenn ihn nichts abbricht. Löst
  das Tippen selbst Sprache aus (Hilfe spricht die Probe, Weiter startet den Auftrag), bricht dieser Inhalt
  den Namen ab; der Name kommt dann bei einem späteren Tippen. Ein Link (Alle Spiele) navigiert sofort; sein
  Name gilt als gesagt, sobald er beginnt. Umgesetzt in `sageEinmal` (`spiele/kern/sitzung.js`), für alle
  Bausteine gleich (Knopf, Haus und Ton der Leiste, Alle Spiele der Pause).
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

1. **Einführung** bei jedem Start, im echten Spielbild; weiter erst nach dem Tipp des Kindes (`spielbau.md` §8).
2. **Aufgaben** (3–5 Minuten, L10). Während das Kind denkt, bewegt sich nichts, und es erscheint nichts
   Neues (B3, 3.1 Nr. 6).
   **Zwischen zwei Aufgaben (Christian, 2026-11-14):** kein Weiter-Knopf. Nach der Lösung kommt die Folge
   (Bewegung und Erzählersatz, etwa 1–2 s, B6); ein Tippen überspringt sie. Danach kommt die nächste Aufgabe
   von selbst. Weiter (mit Alle Spiele daneben) gibt es nur am Rundenende.
3. **Rundenende (Christian):** eine ruhige Pause auf Nacht mit stillen Sternen in Sonne; ein Bild liegt
   auf einer Papierkarte (K8). Darunter **Alle Spiele** und **Weiter**: gleich
   groß, gleich gestaltet (Papier, Tinte-Kontur, Symbol und Wort), keiner hervorgehoben, auch nicht durch
   den Fokus. Aufhören ist gleichwertig (N6). Nichts läuft ab, nichts geht von selbst weiter, kein
   Füllbalken (`grundsaetze.md` 12).
4. **Gekonnt (Christian, 2026-11-16):** Hat die Lernsteuerung in der Runde ein Thema als gekonnt verbucht
   (`runde().ende()` → `gekonnt`), kommt statt der Pause `<ls-gekonnt>`: die freudigste und strahlendste Ansicht
   der App – Sonne mit Strahlen, die hinter grünen Hügeln aufgeht, alle stehen auf dem Boden, einmal Konfetti, kurze Fanfare, die ganze Runde jubelt. Die
   Stimme sagt „<Thema> kannst du.“, „<Figur> freut sich mit dir.“, „Du findest das Thema jetzt bei: Was ich schon
   kann.“ Drei gleichwertige Papierknöpfe: Weiter, Alle Spiele, Was ich schon kann.

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
| `<ls-knopf>` | Grundknopf: Neben- oder Hauptknopf, Symbol, Name, Einsinken, Mindestgröße, Name beim ersten Tippen | Attribute `art="neben\|haupt"` (Gestalt, Vorgabe neben), `symbol`, `name`, `wort` (sichtbares Wort, macht den Knopf zur Pille), `groesse="bedien\|gross\|klein\|seite"` (nur die Größe: rund 11/16/8 rem, Pille 11 rem, mit `gross` 14 rem, mit `klein` 8 rem und Tippfläche 9 rem – nur im Elternbereich; `seite` sichtbar 8,4 rem, Tippfläche 11 rem – Übersichtsseiten), `gespiegelt`, `hinten` (Symbol hinter dem Wort, z. B. Weiter →), `achtung` (Beere samt Schatten, nur Elternbereich: Löschen, Zurücksetzen), `stumm`, `spiel`; Ereignis `click` |
| `<ls-kopf>` (`kopf.js`) | Kopf der Übersichtsseiten (Designsprache): Reiter „Können“ (`index.html`) und „Wissen“ (`bibliothek.html`), der aktive mit Strich in Sonne (`aria-current="page"`); rechts Ton (`groesse="seite"`) und Slot `rechts` (Zahnrad); setzt `--ls-leiste-hoehe` (14 rem) | Attribute `reiter="koennen\|wissen"`, `spiel`; Eigenschaft `ton`, Ereignisse `ton`, `bereit`; `await kopf.bereit()` – wie `<ls-leiste>` |
| `<ls-muster>` (`muster.js`) | Grundmuster im Ton des Grundes, fest hinter allem, ohne Zeiger | Attribut `art="huegel\|wellen\|blaetter\|ringe"`; `musterSvg(art)` ohne DOM |
| `<ls-leiste>` | Kopfleiste: Haus, Fachkachel, Spielname, Thema, Ton; mit `nur-ton` nur der Ton-Knopf oben rechts (Geschichte) | Attribute `spiel`, `fach`, `titel`, `thema` (zur Laufzeit änderbar), `ohne-haus` (nur Startseite); Slot `rechts` (neben Ton, Zahnrad der Startseite); Eigenschaft `ton` (boolean); Ereignisse `ton` (`detail.an`), `bereit`; `await leiste.bereit()` (Versprechen, sobald die Einstellungen geladen sind, auch für späte Aufrufer); setzt `--ls-leiste-hoehe` am Dokument |
| `<ls-blase>` | Sprechblase des Erzählers mit Noch-mal-hören, ohne Zipfel; mit `ohne-text` keine sichtbare Blase, nur der runde Knopf „Noch mal hören“ (bedien), sichtbar erst, wenn es einen Satz gibt (Christian, 2026-11-15) | Attribute `spiel` (sonst die Leiste der Seite), `ohne-text`; `sage(text, { sprechen = true, tempo, zeigen })` spricht und merkt sich den Text, mit `zeigen` (nur bei `ohne-text`) erscheint der Satz kurz als Blase neben dem Knopf und blendet sich nach dem Sprechen, frühestens nach `lesezeit(text)`, von selbst aus; Eigenschaft `text`; Host-Attribute `hat-text`, `zeigt` |
| `<ls-hilfe>` | Hilfe-Knopf unten rechts | Attribut `spiel` (sonst die Leiste der Seite); `leuchte()` (Sonnenring, einmal ~1 s); Ereignis `hilfe` |
| `einfuehrung-lauf.js` | Ablauf der Einführung im Spielbild: Satz abwarten, Lesezeit ohne Ton (eigener Timer), Hilfe wiederholt den Schritt, Zug für den Prüfstand, Rundenzeit danach; ohne DOM | `einfuehrungsLauf({ ton, text, stand, warte? })` → `satz(sag)`, `hilfe(fn)`, `kind(zug, getan)`, `hilfeGedrueckt()`, `spiele(ablauf, runde?)`; `laeuft`, `zug` |
| `<ls-pause>` | Pause/Rundenende mit Alle Spiele und Weiter; optional in derselben Reihe nach den beiden das ruhige Angebot „Mit echten Dingen“ (kleine Papier-Pille, 11 rem, Hand und Wort, kleiner als die beiden Pausenknöpfe; auf schmalen Bildschirmen wie 4:3 allein in einer Reihe darunter, die beiden bleiben mittig; öffnet die Karte zum Thema der Runde in der Pause; `docs/mit-echten-dingen.md`) | Attribute `spiel` (sonst die Leiste der Seite), `offen` (gesetzt, solange sie zu sehen ist; setzt `zeige()`); Inhalt (Bild, Sachmoment) per Slot; `await zeige({ echteDinge })` → `"weiter"` (`echteDinge = { thema, fach, titel, text }` des Themas der Runde; ohne: kein Angebot) |
| `<ls-anregung>` (`anregung.js`) | Karte „Mit echten Dingen“ (`docs/mit-echten-dingen.md`), ohne PIN; Fach-Seite, Regal, Kachel und Pause nutzen dieselbe. Gibt es zum Thema eine freigegebene Anleitung (`spiele/mit-echten-dingen/<fach>/<thema>.md`, im Verzeichnis `verzeichnis.json`; Entwürfe nur mit `?entwurf`), zeigt sie die Formen (Am Tisch / In Bewegung / Unterwegs) als kleine Wahl (Reiter mit Symbol und Wort; die gewählte Form in Tinte gefüllt, die anderen aus Papier, der Sonnenring nur beim Fokus; Pfeiltasten) und darunter die Form: links „Ihr braucht“ und die Schritte, rechts „Darauf kommt es an“ und Leichter/Schwerer; die letzte Wahl ist die Voreinstellung (Einstellung `echte-dinge.form`). Ohne Anleitung der Einzeiler aus dem Lernplan (`eltern`, 4,4 rem). Der Kopf mit den Quellen wird nie gezeigt (`markdown.js`, alles escaped). **Ohne Vorlesen** (kein Noch-mal-hören). Ruhiger Schleier in Nebel über der ganzen Seite (keine Nacht), darauf eine flache Papierkarte: links Zurück (schließt), Überschrift „Mit echten Dingen“ und leiser der Name des Themas. Schließen auch mit Escape oder Tippen auf den Schleier; Schließen beendet laufende Sprache. Solange sie offen ist, sind ihre Geschwister `inert` (in der Pause die Knöpfe der Pause); danach kehrt der Fokus zurück. Geöffnet wird sie über einen Nebenknopf `symbol="hand.svg" wort="Mit echten Dingen"` (Name `ANREGUNG_TITEL`) oder die Kachel | keine Attribute nötig; `await oeffne({ titel, text, thema, fach, form })` (titel: Name des Themas; text: Einzeiler; thema/fach: Id und Fach, ohne thema sucht sie über den Namen; form: gewünschte Situation; löst beim Schließen auf), Versprechen `geladen` (Inhalt steht), `schliesse()`, Eigenschaften `offen`, `form`, Attribut `offen` |
| `<ls-echte-dinge-kachel>` (`echte-dinge-kachel.js`) | Kachel „Mit echten Dingen“: das analoge Spiel eines Themas, gleich groß wie eine Spiel-Kachel der Fach-Seite (mindestens 40 × 16 rem, Symbolfeld 12 rem in der Füllung des Fachs, Schatten: drückbar), Symbol Hand, groß der Name der Form (gemerkte Situation, sonst die erste), leiser „Mit echten Dingen“; ohne Anleitung nur das Wort, ohne Anleitung und Einzeiler verborgen. Antippen öffnet die Karte mit dieser Form. Eingebaut in Startseite und Fach-Seite erst nach der UI-Überarbeitung `startseite-treffpunkt`; zu sehen in `vorschau.html?echte-dinge` | Attribute `thema`, `fach`, `titel`, `text`; `oeffneKarte()`; Versprechen `geladen`; Ereignis `bereit` |
| `<ls-gekonnt>` (`gekonnt.js`) | Bildschirm „Gekonnt“ am Rundenende (7.1 Nr. 4) | `await zeige({ thema: { name, sprich }, figur })` → `"weiter"`; `figur` = Held des Spiels in der Mitte, ohne: ein zufälliges Kind der Runde; Alle Spiele und Was ich schon kann sind Links; Satz „<sprich> kannst du.“ aus `kern/saetze.js` (aufgenommen für jedes Thema mit Aufgaben); bei weniger Bewegung still |
| `<ls-tastatur>` | Bildschirm-Tastatur | Attribute `tasten` (die benötigten Zeichen), `leertaste`, `loeschen`, `je-reihe` (höchstens so viele Tasten je Reihe, z. B. 3 als Ziffernblock; Löschen kommt in die letzte Reihe, wenn es passt); `zehn` (eine Taste „10“ nach der 0, Ziffernblock bis 10); Ereignis `taste` mit `detail.zeichen`; `markiere(zeichen)` gibt einer Taste den Sonnenring (Hilfe Stufe 2), `markiere(null)` nimmt ihn |
| `ziehbar()` (`ziehen.js`) | Ziehen mit Tipp-Alternative (§5): ziehen ab 1 rem Bewegung, sonst antippen → angehoben mit Sonnenring → Ziel antippen; Enter/Leertaste auf Teil und Ziel | `ziehbar(teil, { ziele, beimAblegen(teil, ziel) })` → `loesen()`; das Spiel ruft `setze(teil, ziel, { vor })` oder `zurueck(teil)` (0,3 s, bei wenig Bewegung sofort); die Reihenfolge im Ziel bestimmt das Spiel über `vor` (Knoten, vor den das Teil kommt; ohne `vor` ans Ende); Escape setzt ab, auch vom Ziel aus; Ziele heißen für Vorleser nach ihrem Attribut `name`, sonst „Ablage“; Klassen `angehoben`, `gezogen`, `gedrueckt`, an Zielen `ziel-frei`, `ziel-ueber`; Zustand ohne DOM in `ziehen-zustand.js` |
| `<ls-perlenstab>` (`perlenstab.js`) | Lernzeichen Perlenstäbchen (grundsaetze-bilder §4 M1–M3, M7): Montessori-Farbe, jede Perle einzeln, Lücke und Marke nach der fünften, Länge proportional; flach (ziehbar nur mit `class="teil"`) | Attribute `wert` (1–10; ungültig oder fehlend: nichts gezeichnet, einmal ins Protokoll), `ausrichtung="waagrecht\|senkrecht"`, `ziffer` (Ziffer davor bzw. darüber), `verdeckt` (Tuch in Nebel mit Fünfermarke, Ziffer darauf); Dicke per CSS am Host: waagrecht `height`, senkrecht `width` (Vorgabe 7 rem), mit `verdeckt` und `ziffer` mindestens 6 rem; als Teil (`class="teil"`) gibt `seite.css` das Grundmaß vor (`ls-perlenstab.teil`: 11 rem hoch, Polster 2 rem, darin der Stab); Name „Perlenstab 7“ als aria-label; Geometrie ohne DOM in `perlen-geometrie.js` |
| `<ls-perlenkette>` (`perlenkette.js`) | Lernzeichen Perlenkette fürs Einmaleins (§4 M1–M3, M7; Christian 2026-11-14, M37): zehn Stäbchen zu je n Perlen in zwei Reihen zu fünf, je Stäbchen wie `<ls-perlenstab>`, dazwischen ein Glied; unter dem Ende jedes Stäbchens sein Pfeilchen mit k · n; flach | Attribute `reihe`, `pfeile`, `leer`, `markiert` (Sonnenring am Pfeilchen), `hell` (Sonnenring um Stäbchen), `ring`, `frage` (Pfeilchen mit „?“), `hohl` (getippte Zahl an ihrem Ort: hohles Pfeilchen über der Reihe, zeigt von oben auf seine Perle, wackelt einmal), `verdeckt`, `luft` (Freiraum über jeder Reihe für eine Figur, die auf der Kette steht; dann ein Startplatz vor dem ersten Stäbchen), `bis` (nur Stäbchen 1 … bis sichtbar, neue rollen aus; Stufe Kopf), `kurz` (Kurzkette, Vorratsliste: so viele gleich lange Stäbe in zwei Reihen zu fünf, ein Stab = ein Fünftel von `breite` für jedes n, also gemeinsamer Maßstab aller Zeilen mit derselben `breite`; Lücke mehrere Konturen breit), `breite`, `hoehe`, `perle` (Pfeilchen wachsen mit großen Perlen mit); `huepfe(bis, { wert, schritt })` (Zählpfeilchen, Folge einer Eingabe), `zeigerWeg()`, `stabPunkt(k)`, `standPunkt(k)` (wo eine Figur auf Stäbchen k steht, 0 = Startplatz), `pfeilPunkt(k)`, `hohlPunkt(zahl)`, `leuchte(k)`, `einrasten(k)`; Geometrie ohne DOM `perlenkette()` in `perlen-geometrie.js` |
| `<ls-goldmaterial>` (`goldmaterial.js`) | Lernzeichen Goldenes Perlenmaterial (§4 M4; M06 Zahlenpost): eine Zahl von 0 bis 99 als Zehnerstangen (senkrecht, wie `<ls-perlenstab>` mit Marke nach der fünften Perle) und einzelne Perlen in Säulen zu fünf; flach, keine Bewegung | Attribut `zahl` (0 bis 99; 0 zeichnet nichts, ungültig einmal ins Protokoll); Größe per CSS `height` am Host (Vorgabe 10 rem), die Breite folgt; `aria-label` wie „1 Zehnerstange und 7 Perlen“; Geometrie ohne DOM `gold()` in `gold-geometrie.js` |
| `<ls-geschichte>` (`geschichte.js`) | Abspieler für Geschichten (`docs/geschichten.md` §4), geteilt nach der Designsprache: links das Bild randlos (Foto oder Szene aus `szene.js` vor der Kulisse), rechts auf Papier Titel (Inter) und Text (Andika; Kurzgeschichte ein Satz je Zeile, Sachbuch Absätze); oben rechts Vorlesen (Pille), unten Zurück, Punkte ohne Zahl (aktuelle Seite als Sonnenpunkt) und Weiter (Hauptknopf-Pille, Pfeil hinter dem Wort), auf der letzten Seite Fertig | Attribut `src`; Eigenschaften `seite`, `seiten`, Versprechen `geladen`; Ereignis `fertig` |
| `<ls-wortart>` (`wortart.js`) | Lernzeichen Wortart (§5 D1): Nomen, Artikel, Adjektiv als Dreiecke in drei Größen, Verb als Kreis, gemeinsame Grundlinie | Attribut `art="nomen\|artikel\|adjektiv\|verb"` (unbekannt oder fehlend: nichts gezeichnet, einmal ins Protokoll); Größe per `height` am Host (Vorgabe 8 rem, quadratisch); Name („Nomen“ …) als aria-label |

- **Aussehen über CSS-Variablen:** `--ls-tinte`, `--ls-tinte-weich`, `--ls-papier`, `--ls-nebel`,
  `--ls-linie`, `--ls-naht`, `--ls-haupt-schatten`, `--ls-sonne`, `--ls-nacht`, `--ls-ahorn` und `--ls-kante`
  (Holz des Tabletts), `--ls-kontur`, `--ls-radius-gross|--ls-radius|--ls-radius-klein`, `--ls-knopf`,
  `--ls-neben-schatten`, `--ls-schatten` (drückbar, 0,6 rem) und `--ls-schatten-unten` (gedrückt, 0,3 rem),
  `--ls-leiste-hoehe` (setzt `<ls-leiste>`); Werte aus `stil.js` (Farbwelt). Eine Welt ändert sie nicht: Form, Farbe, Größe und Platz der Bedienung sind fest.
- **Seiten-Grundstil:** `spiele/rahmen/seite.css` (in die Spielseite einbinden): Raster, Andika, dieselben
  Variablen in `:root`, Ebenen `.welt` (hinter allem, ganzer Bildschirm), `.buehne` (sicheres Feld),
  `.spielflaeche` (ab `--ls-leiste-hoehe`), Flächen `.lernfeld` (Matte) und `.tablett` (flach, ohne Schatten),
  `.teil` (ziehbares Teil mit Schatten; `ls-perlenstab.teil` mit Grundmaß 11 rem), `.markiert` (Sonnenring; `.auswahl` bleibt die Klasse „Text darf markiert werden“ von `sperreTouch()`). `tests/rahmen-stil.test.mjs` prüft die
  Variablen gegen `TOKENS` in `stil.js`.
- **Vorschau:** `spiele/rahmen/vorschau.html` zeigt alle Bausteine zum Ansehen und Ausprobieren (`?objekte` die
  Spielobjekte, `?echte-dinge` die Kacheln „Mit echten Dingen“ neben einer Spiel-Kachel, `&karte` mit offener Karte).
- **Regel (geplant):** Sobald das erste Spiel umgezogen ist, prüft ein Test, dass umgezogene Spiele Haus-
  und Ton-Knopf nicht selbst bauen.

---------------------------------------------------------------------------------------------------
## 10. Checkliste für jedes neue Spiel

- [ ] Spielordner `spiele/<fach>/<katalog-nr>-<name>/` als Kopie von `spiele/vorlage/` (`index.html`, `spiel.js`);
      `datei` und `symbol` in `spiele.json` relativ zu `spiele/`; gemeinsame Objekte nach `spiele/objekte/`.
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
