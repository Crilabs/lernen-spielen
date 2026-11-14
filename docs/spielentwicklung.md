# Spielentwicklung: vom Katalog-Eintrag zum fertigen Spiel

Stand: 2026-11-14 · **Entwurf zur Freigabe** · Entscheidungen von Christian (2026-11-14)
Markierung: **(Christian)** entschieden · **(Annahme)** Vorschlag, korrigierbar.

## Warum

Das erste Spiel nach dem Katalog (Zerlegungshaus) war eine Fehlkonstruktion: keine Figur, eine Sachwelt, die nicht
zum Spiel passte, und eine Runde, die nicht funktionierte. Es wurde gebaut, bevor es gedacht war. Spiele sollen im
Hintergrund entstehen, ohne dass jedes erst mit einem Kind getestet wird **(Christian)**. Deshalb bewertet und testet
die KI jeden Entwurf und jeden Prototyp gegen feste Kriterien; Änderungen fließen zurück, bis alles grün ist. Erst
dann wird ausgebaut **(Christian)**.

Christian sieht ein Spiel nur, wenn es nach drei Runden rot bleibt (geparkt), und als gelegentliche Stichprobe
fertiger Spiele **(Christian)**. Gestartet wird je Spiel mit dem Skill „Spiel entwickeln <Katalog-Id>“, ein Spiel je
Lauf, mehrere parallel in eigenen Worktrees **(Christian)**. Parallel dazu startet er den Skill „Mit echten Dingen“
(`.claude/skills/mit-echten-dingen/SKILL.md`) für alle Themen des Spiels, die noch keine Anleitung haben
(`docs/mit-echten-dingen.md`).

## Ablauf

```
Katalog-Eintrag (docs/spielkatalog/*.md)
  → 1 Spielentwurf (eine Seite) ──→ Prüfung A (Entwurf) ──rot──┐
          ↑─────────────── Befunde, höchstens 3 Runden ─────────┘
  → 2 Prototyp (Spielvorlage, eine Runde, ohne Bild und Audio) ──→ Prüfung B (Prüfstand) ──rot──┐
          ↑─────────────── Befunde, höchstens 3 Runden ─────────────────────────────────────────┘
  → 3 Ausbau (Stufen, Bild, Audio-Texte als Daten, Tests, Regal-Material, Einführung)
  → 4 Abschluss-Review → main
Bleibt eine Prüfung nach 3 Runden rot: Spiel parken, Befunde an Christian.
```

Jede Prüfung vergibt je Kriterium **grün** oder **rot** mit Beleg (Datei:Zeile, Screenshot, Prüfungsausgabe).
**Grün heißt:** alle Pflichtkriterien grün, kein kritischer Befund. Kriterien mit „(Soll)“ dürfen rot sein, wenn
der Grund im Entwurf steht.

Die Aufträge an Bau-Agenten und Prüfer liegen beim Skill (`.claude/skills/spiel-entwickeln/`). A1–A12 (§2) und die
Aufträge B-Didaktik, B-Welt, B-Bedienung (§4) stehen dort wörtlich, in der Prüfung des Schnellwegs zusammen mit der
Checkliste `bedienung.md` §10; `tests/skill-spiel-entwickeln.test.mjs` wird rot, wenn sie von diesem Dokument (bzw.
`bedienung.md`) abweichen. Wer hier ein Kriterium ändert, zieht die Vorlage nach.

Der Ablauf oben ist der **volle Weg**. Die meisten Spiele nehmen den kürzeren **Schnellweg** (nächster Abschnitt).

## Zwei Wege (Christian, 2026-11-14)

Der volle Weg ist für ein Spiel aus lauter vorhandenen Teilen zu schwer: Ein Probelauf an M14 brauchte über eine
Stunde und 23 €, bis Prüfstand B Runde 1 erreicht war; ein von Hand gebautes Spiel war in 30 Minuten fertig und
erfüllte sein Ziel. Deshalb gibt es zwei Wege. Welcher gilt, entscheidet die Steuerung **nach dem Entwurf** (§1).

### Entscheidung

<!-- regel schnellweg -->
**Regel:** Schnellweg, wenn der Entwurf keinen Abschnitt „Freigabe nötig“ hat und das Spiel nur Vorhandenes braucht:
die Bausteine aus `spiele/rahmen/` unverändert, festgelegte Lernzeichen mit Baustein, Aufgabenarten, die es für seine
Themen schon gibt (`aufgaben` in `spiele/lernplan.json`), Spielobjekte über `spiele/objekte/objekt.js`, und weder
`spiele/rahmen/`, `spiele/kern/`, `spiele/lernsteuerung.js`, `spiele/objekte/objekt.js`, `spiele/aufgabenarten.js`
(mit `ZIEL_MS`), die `aufgaben` in `spiele/lernplan.json` noch der RAHMEN von `spiele/vorlage/spiel.js` ändert sich.
Sonst voller Weg.
<!-- ende regel -->

**Vorhanden** heißt im Einzelnen:

| Was | vorhanden (Schnellweg) | neu (voller Weg) |
|---|---|---|
| Bedienteile | die Bausteine aus `bedienung.md` §9 (`<ls-knopf>`, `<ls-leiste>`, `<ls-blase>`, `<ls-hilfe>`, `<ls-pause>`, `<ls-tastatur>`, `ziehbar()` …), so benutzt, wie ihre Schnittstelle es vorsieht | ein neuer Baustein oder eine Änderung an einem vorhandenen; eine eigene Bedienung im Spiel, die einen Baustein nachbaut |
| Lernzeichen | festgelegt in `grundsaetze-bilder.md` §4/§5 **und** als Baustein in `spiele/rahmen/` gebaut (heute `<ls-perlenstab>`, `<ls-wortart>`) | jede Vormerkung aus `grundsaetze-bilder.md` §5a (Zerlegungsliste, Silbenbogen …) und jedes festgelegte Zeichen ohne Baustein |
| Aufgabenart | jedes Thema des Spiels hat `aufgaben` in `spiele/lernplan.json` mit einer Art aus `spiele/aufgabenarten.js` (heute `zerlegung`, `rechnen`, `menge`, `zwillinge`), im Spiel über `arten` in `spiele.json` gewählt (Schema `darstellbar`) | eine neue Aufgabenart, eine Änderung an `spiele/aufgabenarten.js` (auch `ZIEL_MS`) oder an den `aufgaben` in `lernplan.json`: Sie ändert die Schlüssel, an denen der Lernstand hängt |
| Mechanik | die Lernhandlung geht mit diesen Bausteinen, den Gesten aus `bedienung.md` §5 und dem RAHMEN der Vorlage (Hilfe-Leiter, Meldung, Stufen) | eine neue Geste oder Eingabe, ein Eingriff in `spiele/kern/`, `spiele/lernsteuerung.js` oder den RAHMEN |
| Spielobjekte, Figur | Arten aus `spiele/objekte/` und neue Arten als eigene Datei über `meldeObjekt` **(Annahme:** eine neue Sachwelt-Art ist kein neues Bauteil) | eine Änderung an `spiele/objekte/objekt.js` |
| offene Fragen | keine | eine offene Frage aus `grundsaetze-bilder.md` §15 oder ein Widerspruch zu einer Entscheidung von Christian im Katalog-Eintrag (beides steht dann unter „Freigabe nötig“) |

Was neu ist, wird nach §8a des Katalogs ohnehin erst mit Christians Freigabe gültig: Der volle Weg baut und prüft es
und parkt dann mit „Freigabe nötig“; nach der Freigabe läuft der volle Weg zu Ende. Merkt der Bau-Agent des
Schnellwegs, dass er doch etwas Neues braucht, hält er an und meldet es; die Steuerung wechselt in den vollen Weg
(der gebaute Stand dient als Prototyp, die Runden von Prüfstand B zählen ab 1).

### Schnellweg (Regelfall)

```
Katalog-Eintrag → 1 Entwurf (kompakt) → Entscheidung: Schnellweg
  → Bau in einem Zug (alle Lernstufen, frischer Bau-Agent) → Durchspielen (jede Stufe) ──rot──┐
  → eine Prüfung (frischer Prüfer, alle Kriterien) ──rot──────────────────────────────────────┤
          ↑──────────── frischer Bau-Agent mit Entwurf + Befunden, höchstens 2 Runden ────────┘
  → Audio → Merge nach main          (nach 2 Runden rot: parken, §7)
```

| Schritt | Wer | Modell | Ergebnis |
|---|---|---|---|
| Entwurf | frischer Bau-Agent | `sonnet` (Annahme) | §1 als Pflichtliste: die elf Teile knapp in Stichpunkten, Sätze wörtlich, dazu „Bausteine“ (was das Spiel aus den Zeilen der Tabelle oben braucht); höchstens etwa 80 Zeilen |
| Entscheidung | Steuerung | – | Schnellweg oder voller Weg nach der Regel, Grund in einer Zeile in den Entwurf |
| Bau | frischer Bau-Agent | `sonnet` | das ganze Spiel in einem Zug: alle Lernstufen und der Umfang des Ausbaus (§5), ohne Audio; Einführung in der Welt des Spiels (A4b) |
| Durchspielen | Steuerung | – | `tests/browser/durchspielen.mjs` ohne und mit `--stufe` für jede Lernstufe, `npm test`; rot → zurück an einen frischen Bau-Agenten, ohne Prüfer |
| Prüfung | ein frischer Prüfer | `opus` | eine Prüfung mit allen Kriterien: A1–A12 (§2) am Entwurf und am Spiel, B-Didaktik, B-Welt mit W-Karte, B-Bedienung (§4), Checkliste `bedienung.md` §10, dazu: der Diff bleibt im Schnellweg (nichts in den Pfaden der Regel geändert) |
| Audio, Merge | Steuerung | – | `npm run audio -- --spiel …`, Prüfberichte, Kosten, Merge wie im vollen Weg |

- **Runden:** Eine Runde ist Bau (bzw. Befunde umsetzen), Durchspielen und Prüfung. Höchstens **2 Runden**; ist
  danach etwas rot (auch das Durchspielen), wird geparkt (§7). Prüfung A, Prüfstand B und Abschluss-Review entfallen
  als eigene Schritte, ihre Kriterien stehen in der einen Prüfung.
- **Je Runde ein frischer Bau-Agent:** Er bekommt den Entwurf und die Befunde der letzten Runde, den Stand findet er
  im Branch. Ein Bau-Agent wird nie über Runden fortgesetzt: Ein fortgesetzter Agent liest bei jedem Zug seinen ganzen
  Kontext neu (im Probelauf etwa 380 000 Token je Zug, 8,9 Millionen Cache-Token für eine einzige Runde Befunde).
- **Prüfer schreiben ihren Bericht selbst** in die Arbeitsablage des Laufs; die Steuerung tippt nichts ab.
- **Entscheidungen von Christian im Katalog-Eintrag** (mit „Christian“ und Datum gekennzeichnet) sind gesetzt. Kein
  Befund ist ein Grund, davon wegzubauen; ein Widerspruch zu einem Kriterium kommt unter „Freigabe nötig“ (und führt
  damit in den vollen Weg).
- **Eine Welt, auch in der Einführung (A4b):** Erzählt die Einführung eines Themas (`spiele/einfuehrungen/*.json`) eine
  andere Welt, bringt das Spiel eine eigene Einführung in seiner Welt mit (`einfuehrung.json` im Spielordner,
  eingetragen als `EINFUEHRUNG` in der SPIELWELT der Vorlage, Pfad relativ zu `spiele/`; das ist kein Eingriff in den
  RAHMEN); die Einführung abzuschalten ist keine Lösung (L5).
- **Ziel:** 30–60 Minuten und 8–15 € je Spiel, Steuerung eingerechnet. Liegt ein Lauf darüber, nennt die
  Schlussmeldung Zeit, Kosten und den teuersten Agenten.

### Voller Weg

Für eine neue Mechanik, ein neues Lernzeichen oder ein neues Bedienteil: Ablauf oben, §2–§5, unverändert, mit
höchstens 3 Runden je Prüfung. Auch hier bekommt jede Runde einen frischen Bau-Agenten mit Entwurf und Befunden.

## Ablage (Christian)

Jedes Spiel hat **einen eigenen Ordner, sortiert nach Fach** (Fach-Ids wie in `spiele.json`: `mathe`, `lesen`,
`schreiben`, `grammatik`, `geometrie`, `sprechen`). Der Ordnername ist **Katalog-Nummer und Name** in Kleinbuchstaben
mit Bindestrichen (Christian), z. B. M14 „Zwei Tonnen“ → `m14-zwei-tonnen`:

```
spiele/
  mathe/
    m14-zwei-tonnen/
      index.html        dünne Seite (Bausteine, seite.css, spiel.js)
      spiel.js          Spielwelt, Aufgabe, Rahmen (aus der Vorlage)
      logik.js          reine Spiellogik, in Node getestet (falls nötig)
      texte.json        alle gesprochenen und geschriebenen Sätze (für die Audio-Pipeline)
      symbol.svg        Spielsymbol = Kopf der Figur (Kopfleiste, Regal-Detail)
      objekte/          spielspezifische animierte SVG-Objekte
      bilder/           Szenenbild(er) mit herkunft.json (A4)
  objekte/              Objekte, die mehrere Spiele nutzen (Tonne, Baum, Korb …)
  vorlage/              die Spielvorlage als Ordner – zum Kopieren
  rahmen/  kern/  …     gemeinsame Bausteine und Dienste
tests/spiele/<fach>/<spiel>.test.mjs   Node-Tests der Spiellogik
docs/spiele/<fach>/<spiel>.md          der Spielentwurf
```

- `spiele.json` nennt die Seite relativ zu `spiele/`: `"datei": "mathe/m14-zwei-tonnen/index.html"`,
  `"symbol": "mathe/m14-zwei-tonnen/symbol.svg"`.
- Bausteine finden ihre Pfade selbst (`import.meta.url`); im Spiel verweisen Imports relativ (`../../rahmen/…`).
- Ein neues Spiel entsteht durch Kopieren von `spiele/vorlage/` in `spiele/<fach>/<katalog-nr>-<name>/`;
  `tests/ablage.test.mjs` prüft Ordner, `datei`, `symbol` und Fach.
- `tests/browser/pruefkopie.mjs` spielt die Vorlage in dieser Tiefe durch: Kopie nach `spiele/mathe/m99-pruefkopie/`,
  jedes „../“ wird „../../“, Prüfstand darüber, Kopie wieder gelöscht. So fällt auf, wenn ein Baustein oder Dienst
  seine Dateien relativ zur Seite statt zu sich selbst sucht.

## 1. Der Spielentwurf

Datei `docs/spiele/<fach>/<spiel>.md` (eine Seite), abgeleitet aus dem Katalog-Eintrag. **Der Katalog-Eintrag ist ein
Vorschlag, keine Vorgabe:** Passt seine Welt, Figur oder Mechanik nicht, weicht der Entwurf ab und sagt warum.
Ausgenommen sind Entscheidungen von Christian im Eintrag (mit Datum): Sie sind gesetzt.

Der Entwurf ist eine **Pflichtliste**: die elf Teile knapp in Stichpunkten (höchstens etwa 80 Zeilen), gesprochene
Sätze wörtlich. Am Ende steht **„Bausteine“**: welche Bedienteile, Lernzeichen und Spielobjekte das Spiel braucht,
je mit „vorhanden“ oder „neu“ nach der Tabelle in „Zwei Wege“. Danach entscheidet die Steuerung den Weg.
Die **Beschreibung für Erwachsene** (`beschreibung` in `spiele.json`) gehört nicht in den Entwurf: Der Bau-Agent leitet sie
später aus den Teilen 2 (Runde in fünf Sätzen), 3 (Lernhandlung) und 4 (Sachgrund) ab (siehe §5 Ausbau).

Pflichtteile:
1. **Zweck in der Spielwelt:** Wozu tut das Kind das? Was bewirkt die richtige Antwort? (ein Satz)
2. **Die Runde in fünf Sätzen:** was das Kind sieht, was es tut, was passiert, wie die Runde endet.
3. **Lernhandlung = Spielhandlung:** welche Handlung das Thema übt, und dass sie ohne das Thema nicht spielbar wäre.
4. **Sachwelt und Sachgrund:** welche Welt, und wie der Sachgrund *in der Aufgabe* steckt (Zahlen, Beziehungen,
   Wörter kommen aus der Sache, K2). Ein Satz, der erklärt, warum diese Welt zu genau dieser Handlung passt.
5. **Figur:** welches Kind der Runde was tut (vorzeigen, fragen, sich wundern, sich freuen; F6, F7), wo es im Bild
   steht, welche Haltungen aus der Runde gebraucht werden.
6. **Bildschirm-Skizze** (ASCII) nach `bedienung.md` §3: Kopfleiste, Erzählblase, Lernfeld, Tablett, Hilfe.
7. **Rückmeldung:** was die Mechanik bei passend / nicht passend zeigt; was der Erzähler sagt (Sätze wörtlich). Dazu
   die **Folgen je Aufgabe mit Varianten** (W-Freude, Christian, 2026-11-14): was nach einer richtigen Lösung sichtbar
   geschieht und warum es sich aus der Aufgabe erklärt, mit den wechselnden Varianten (z. B. gehen, traben, rutschen,
   hüpfen), ~1 s während der Handlung, bis ~3 s für die Folge; die Reaktionen der Runde nutzen, wo vorhanden.
8. **Hilfe-Leiter:** Probe (Stufe 1) und Lösung mit Begründung (Stufe 2), wörtlich.
9. **Stufen** material / vorstellung / kopf, soweit der Katalog sie vorsieht; der Prototyp baut eine davon.
10. **Aufgabenschlüssel** und `arten` für `spiele.json`; welche Themen des Lernplans bedient werden.
11. **Spielobjekte (Christian):** welche Dinge der Sachwelt das Spiel als eigene, animierte SVG-Bilder braucht (z. B.
    Mülltonnen, Papier, Dosen), welche Bewegungen sie haben (z. B. Deckel öffnet sich, Ding fliegt hinein, Tonne
    wackelt satt) und welches davon als **Regal-Bild** für die Themen des Spiels dient. Dazu die **Figur des Spiels**
    (neu oder aus `spiele/objekte/`) mit dem Eintrag `karte: { figur, zustand, welt }` für das Kartenbild
    (`grundsaetze-bilder.md` §16): welcher Zustand den typischen Moment zeigt und wie sich die Karte von den anderen
    Karten des Fachs unterscheidet.

### Spielobjekte (Christian)

- Jedes Spiel entwickelt seine Sachwelt-Dinge als **animierte SVG-Bilder im Stil der Runde** (`docs/figuren.md` §4:
  Kontur nur um die Silhouette, Licht von oben links in Stufen, Schlagschatten, keine Verläufe; Welt-Paletten aus
  `grundsaetze-bilder.md` 6.2). Von Hand als SVG, nie KI-generiert (A1). Sachlich richtig (eine Papiertonne sieht aus
  wie eine Papiertonne, T2/K3).
- Sie stehen **im Spiel** (Sachwelt, Stimmungs- bzw. Wortbild-Ebene) und **im Regal**: Das Spiel nennt für seine
  Themen ein Regal-Bild (z. B. die Tonne mit der Zahl des Themas), das dort statt des allgemeinen Kärtchens steht.
- **Lernzeichen bleiben schlicht (M1):** Gezählt und gerechnet wird am Lernzeichen (Perlenstab, Zehnerfeld,
  Wortkarte). Die Sachobjekte sind die **Wirkung** der Lösung (B1): Der geteilte Stab wird zu Papier und Wertstoff,
  die Dinge wandern in die Tonnen. Sachobjekte werden nicht als Zählmaterial benutzt.
- **Das Gelernte bleibt als Lernzeichen sichtbar (Christian):** Nach der Wirkung steht das Ergebnis wieder als
  Lernzeichen da, verbunden mit dem Zeichen (M7) – bei einer Zerlegung die zwei Perlenstäbe nebeneinander unter dem
  ganzen Stab und die Gleichung („6 = 2 + 4“). Das bleibt stehen (z. B. in der wachsenden Liste), damit es sich
  einprägt; die Sachobjekte sind nur der Weg dorthin.
- **Bewegung nach §7:** Folge einer Kinderhandlung, etwa 1 s während der Handlung, bis etwa 3 s für die Folge einer gelösten Aufgabe (mit Varianten, W-Freude), überspringbar; still, solange das Kind denkt (B3); bei
  `prefers-reduced-motion` ohne Bewegung (Endzustand sofort).
- **Ablage:** Objekte, die mehr als ein Spiel brauchen kann (Tonne, Baum, Korb), in `spiele/objekte/<art>.js`, damit
  der Bestand mit jedem Spiel wächst; Spielspezifisches im Spielordner unter `objekte/`. Regal-Bilder müssen im
  gemeinsamen Bestand liegen (Regal, Fach-Seite und Startseite laden sie dort nach).
- **Figur des Spiels (Christian):** Jedes Spiel entwickelt mindestens eine eigene Figur oder nimmt eine vorhandene
  (zuerst in `spiele/objekte/` nachsehen). Sie ist das Kartenbild (§16 in `grundsaetze-bilder.md`), das Regal-Bild und
  in Kopfform das Spielsymbol. Figuren sind Objekte, keine Kinder der Runde (`figuren.md` §4).

#### Schnittstelle (`spiele/objekte/objekt.js`)

```html
<ls-objekt art="papiertonne" zustand="offen"></ls-objekt>      <!-- im Spiel, Größe über height am Host -->
<ls-objekt art="papiertonne" wert="7" still></ls-objekt>        <!-- Regal: Zahl auf dem Aufkleber, ohne Bewegung -->
```

- **Attribute:** `art` (angemeldete Art), `zustand` (einer der Zustände der Art, sonst der erste), `wert` (kurzer Text,
  den die Art zeigt, z. B. die Zahl auf dem Aufkleber der Tonne), `still` (nie bewegen). Standard `aria-hidden="true"`
  (Schmuck der Sachwelt; was zählt, sagt der Erzähler). Größe: `height` am Host (Vorgabe 20 rem); das Feld ist das
  Objekt in Ruhe, ein offener Deckel ragt darüber hinaus, ohne etwas zu verschieben.
- **Bewegung:** Ein Wechsel von `zustand` spielt die Bewegung der Art einmal (0,4 bis 3 s, B1, B6), danach steht alles
  still (B3). Bei `prefers-reduced-motion` oder `still` steht der neue Zustand sofort da (B7).
- **Methoden:** `wechsle(zustand)` → Promise, wenn die Bewegung fertig ist; `fertig()`; `ueberspringe()` springt ans
  Ende (B6, z. B. beim Antippen); `anstossen(ding)` → kurze Antwort, ohne den Zustand zu ändern (das Ding fällt hinein,
  die Tonne wackelt satt); `einwurfPunkt()` → Punkt im Fenster, an dem ein Ding hineinfällt.
- **Werfen:** `wirf(ding, ziel, { dauer, oeffne })` lässt ein `ls-objekt` (z. B. `papier`, `dose`) im Bogen in ein Ziel
  fliegen: Ist das Ziel zu, geht der Deckel dabei auf; am Ziel verschwindet das Ding (`hidden`) und fällt im Ziel
  hinein. Rückgabe `{ fertig, ueberspringe, abbrechen }`; `fertig` endet mit `"angekommen"` oder `"abgebrochen"`.
  `ueberspringe` springt ganz ans Ende (Ding drin, Tonne offen, ohne Hineinfallen); `abbrechen` vor der Ankunft lässt
  das Ding am Start und setzt einen dabei geöffneten Deckel sofort in den alten Zustand zurück. Bewegt wird über die CSS-Eigenschaften `translate`/`rotate`/`scale`, ein
  `transform` der Seite bleibt unberührt.
- **Neue Art:** eine Datei, die beim Import `meldeObjekt(art, { zustaende, zeichne(zustand, { wert }), bewegung(von,
  nach), anstoss(ding), einwurf })` aufruft. `zeichne` baut das SVG mit `bild({ breite, hoehe, oben, teile, ursprung })`
  aus Teilen `{ stueck, teil, in, ursprung, eigen }`; die Stücke kommen aus den Helfern der Runde
  (`spiele/runde/kinder/stil.js`: `form`, `falte`, `naht`, `flach` …), so entsteht die Kontur-Schicht unter allen
  Flächen wie bei den Kindern. Ein Bild trägt alle Zustände: Teile mit `in: "zu voll"` sind nur in diesen Zuständen
  sichtbar. `bewegung` gibt Schritte `{ teil, keyframes, dauer, beginn, easing }` (Web Animations) zurück; ein Teil,
  das ein- oder ausgeblendet wird, nennt `opacity` in jedem Keyframe. Farben der Welt-Schicht, heller und weicher als
  die Lernzeichen (6.2), damit kein Objekt mit einer Perle oder einem Wortart-Zeichen verwechselt wird. Vorbild: `tonne.js` (Schnitt und Bewegungen
  der Mülltonnen), `papiertonne.js`, `wertstofftonne.js`, `papier.js`, `dose.js`. `tests/objekte.test.mjs` prüft
  Anmeldung, Stil-Grundlagen und dass jede Bewegung vorhandene Teile trifft.
- **Ansehen:** `spiele/rahmen/vorschau.html?objekte` zeigt jede Art in jedem Zustand neben Ela, Werfen zum Ausprobieren
  und das Regal-Bild.

#### Regal-Bild

Ein Spiel nennt in `spiele.json` sein Regal-Bild: `"regal": { "objekt": "papiertonne", "wert": "zahl" }` (`wert`:
`"zahl"` = die Zahl des Themas, `null` = ohne). Für jedes Thema nimmt die Lernsteuerung das erste Spiel in
`spiele.json`, das das Thema bedient und ein Regal-Bild nennt (`regalBildFuer`). **Reihenfolge (Christian):** erst die
Lernzeichen (Perlenstab, Wortart-Zeichen, Karte mit dem Graphem), dann das Regal-Bild des Spiels, dann die Karte mit
dem Fachsymbol (`materialFuer`, `spiele/rahmen/material.js`). `bausteinHtml` baut das Bild als
`<ls-objekt art="…" wert="…" still aria-hidden="true">` – flach und still im Regal, auf der Fach-Seite und der
Startseite. Die Figur des Spiels ist zugleich sein Regal-Bild (`regal.objekt` = `karte.figur`, Annahme).
Buchstaben stehen nie auf einem Regal-Bild: Wo der Buchstabe der Inhalt ist, nimmt schon die Graphem-Karte
den Platz ein, sonst stünde er für nichts. Jedes `regal.objekt` muss als `spiele/objekte/<art>.js` vorliegen
(`tests/rahmen-regal-bild.test.mjs` prüft `spiele.json`).

#### Kartenbild

Regeln: `grundsaetze-bilder.md` §16. Ein Spiel nennt in `spiele.json` sein Kartenbild:
`"karte": { "figur": "papiertonne", "zustand": "offen", "welt": "<welt>" }` (Annahme). Die Karte zeigt die Welt als
flache Vignette und davor `<ls-objekt art="<figur>" zustand="<zustand>" still>`, ohne `wert` (keine Ziffern, Buchstaben,
Perlen im Bild). `(figur, welt, zustand)` ist je Fach eindeutig; ein Test prüft das an `spiele.json` (kommt mit der
Umsetzung). Die Karte hat keinen runden Knopf (Christian); das Spielsymbol in Kopfleiste und Regal-Detail ist die Kopfform der
Figur, von Hand gezeichnet als `symbol.svg` im Spielordner (KB8, KB10). Die Umsetzung auf der Startseite steht noch aus (Christian); bis dahin beurteilt W-Karte das zusammengesetzte
Kartenbild (Figur vor der Vignette), nicht die heutige Startseite.

## 2. Prüfung A: der Entwurf

Ein Prüfer, der den Entwurf, den Katalog-Eintrag und die Grundsätze liest (nicht den Autor).

| Nr. | Kriterium | Quelle |
|---|---|---|
| A1 | Zweck in der Spielwelt klar; ohne den Lerninhalt wäre das Spiel nicht spielbar. | Prüffrage 2, N3 |
| A2 | Eine Schwierigkeit; alles andere leicht (kurze Wörter, Vorlesen). | §4 Isolation |
| A3 | Das Kind bringt die Antwort hervor (bauen, tippen, ziehen), wählt nicht aus wenigen Knöpfen. | L1, L2 |
| A4 | **Sachwelt passt:** der Sachgrund erzeugt die Aufgabe; eine Erwachsene würde die Verbindung in einem Satz verstehen. | K1, K2 |
| A4b | **Eine Welt, keine zweite Metapher:** Die Lernhandlung geschieht *in* der Sachwelt (sieben Dinge teilen sich auf zwei Tonnen auf). Kein zusätzliches Bild obendrauf, das mit der Sache nichts zu tun hat (Haus, Stockwerke, Licht beim Mülltrennen). Lernzeichen wie der Perlenstab dürfen daneben stehen. | K2, L8; Lehre aus dem Zerlegungshaus (Christian) |
| A5 | **Eine Figur der Runde hat eine Aufgabe** in der Runde und ist im Bild. | F6, F7, `figuren.md` |
| A6 | Rückmeldung: Mechanik zeigt passt/passt nicht; Erzähler beschreibt; keine Wörter aus 3.2; Fehler-Folge nicht reizvoller. | 3.1, 3.2, N7 |
| A6b | **Das Gelernte bleibt sichtbar:** Nach der Wirkung steht das Ergebnis als Lernzeichen mit dem Zeichen da (z. B. Perlenstäbe 2 und 4 unter der 6 und „6 = 2 + 4“) und bleibt in der Runde stehen. | M7, L1; Christian |
| A7 | Hilfe-Leiter mit Probe statt Bedeutungsregel; Lösung mit Begründung. | L12, §5 |
| A8 | Fachbegriffe nach §5.1; keine Regeln mit Verfallsdatum. | §5 |
| A9 | Geschichte nach §9 (Spannung aus Neugier, keine Bedrohung, Stufe festgelegt). | §9 |
| A10 | Bildschirm folgt `bedienung.md` §3 (feste Plätze, Erzählblase ohne Zipfel). | `bedienung.md` |
| A11 | Erzähler spricht, Figuren handeln; Sätze wörtlich und als Daten erfassbar. | `stimme.md` |
| A12 (Soll) | Vielfalt beiläufig, Bilder nach 6.1–6.3. | §6 |

## 3. Der Prototyp

Eine Kopie der Spielvorlage (`spiele/vorlage/` nach `spiele/<fach>/<spiel>/`) mit genau einer Stufe und einer Runde, ohne erzeugtes Bild und
ohne Aufnahmen (die Systemstimme genügt), aber mit den Bausteinen aus `spiele/rahmen/`, der Figur als Platzhalter
aus der Runde (`docs/figuren.md`, gezeichnete Runde, sobald verfügbar) und einer schlichten Welt-Fläche.

## 4. Prüfung B: der Prüfstand

Vier unabhängige Prüfer (frische Agenten, die nicht gebaut haben). Jeder liefert grün/rot je Kriterium mit Beleg.

**B-Didaktik** (Code + Entwurf): A1–A8 am gebauten Prototyp nachgeprüft; dazu: die Lernsteuerung bekommt jede
Aufgabe mit `ok`, `hilfe`, `ms` gemeldet; mit Hilfe Gelöstes zählt nicht als gekonnt. Erklärt das Spiel in der
Test-Schnittstelle `fehlversuche: false` (kein Zug kann danebengehen), prüft B-Didaktik, dass das stimmt; der Prüfstand
überspringt dann die Hilfe-Leiter des ratenden Kindes (n/a im Bericht). Im Ausbau dazu D-Beschreibung (Christian, 2026-11-14): `beschreibung` im Eintrag in `spiele.json` ist vorhanden, stimmt sachlich mit dem gebauten Spiel überein, ist neutral (keine Wörter aus `grundsaetze.md` §3.2) und für Eltern lesbar (2–3 Sätze, keine Klassen- oder Lehrplanzahlen).

**B-Welt** (Screenshots + Entwurf): Figur sichtbar und tätig; Sachwelt im Bild erkennbar und passend zur Aufgabe;
eine Welt, keine zweite Metapher (A4b); Spielobjekte im Stil der Runde und sachlich richtig, als Wirkung animiert,
nicht als Zählmaterial (M1); W-Bewegung: Bewegung nur als Folge einer Kinderhandlung, ~1 s während der Handlung, bis ~3 s für die Folge einer gelösten Aufgabe, überspringbar, still beim Denken, mit reduzierter Bewegung ruhig und kurz; W-Freude (Christian, 2026-11-14): jede richtige Lösung hat eine sichtbare Folge, die sich aus der Aufgabe selbst erklärt (Figur oder Ding reagiert), als Teil des Spiels und nicht als Belohnung (keine Punkte, keine Sterne), verlässlich (B4), nach einer falschen Antwort nie reizvoller (B5), mit passenden wechselnden Varianten (gehen, traben, rutschen, hüpfen …; kleine Zufallsauswahl, nie ein seltener „Jackpot“); nichts Bedrohliches; Fantasie nur im Rahmen (`figuren.md` §5). Im Prototyp dürfen die
Spielobjekte noch einfache Platzhalter sein, aber ihre Rolle (Wirkung) muss stimmen; der Prototyp zeigt mindestens eine solche Folge (W-Freude). Im Ausbau das Kartenbild nach
`grundsaetze-bilder.md` §16 (W-Karte): eine Figur, groß, mittig bis Mitte rechts, kein Text und keine Lernzeichen, im
Silhouettentest (alle Karten des Fachs als Raster in 64 px Graustufen) von den anderen Karten des Fachs zu
unterscheiden, `(figur, welt, zustand)` im Fach eindeutig. Im Ausbau hat jede Stufe und jede Aufgabenart passende Folgen mit Varianten.

**B-Spielbarkeit** (automatisches Durchspielen, `tests/browser/durchspielen.mjs`): Simulierte Kinder spielen je eine
Runde in Chromium und WebKit, 1920×1080 und 1280×800 (Aufruf mit der Seite des Spiels, z. B.
`node tests/browser/durchspielen.mjs spiele/mathe/m14-zwei-tonnen/index.html`; die Vorlage: `spiele/vorlage/index.html`):

| Kind | Verhalten | muss gelten |
|---|---|---|
| Sicher | löst jede Aufgabe beim ersten Versuch | Runde endet in der Pause; keine Hilfe nötig; Lernstand meldet `ok` |
| Ratend | probiert zufällig, bis es passt | jede Aufgabe ist lösbar; nach dem 2. Versuch leuchtet Hilfe; nichts hängt |
| Hilfe | tippt Hilfe zweimal, folgt der Lösung | Lösung ist ausführbar; Meldung `hilfe: 2`, nicht gekonnt |
| Wild | tippt 200-mal zufällig überall hin | keine Konsolenfehler, kein Einfrieren, kein Zustand ohne Ausweg |
| Tastatur | nur Tab/Enter/Leertaste | Runde lösbar |
| Zurück | verlässt mitten in der Runde über Haus, kommt zurück | Lernstand konsistent, Spiel startet sauber |

Pflicht außerdem: keine Konsolenfehler, Vorschau schreibt nichts, `npm test` grün.

**B-Bedienung** (Screenshots): Checkliste `bedienung.md` §10, Farbwelt §6 (Schatten nur am Drückbaren, Sonne nur
als Ring, keine Farbe als einziges Signal), Größen nach §4, still beim Denken (§7 B3), reduzierte Bewegung.

## 5. Ausbau

Erst nach grünem Prüfstand: alle Stufen, **Spielobjekte als animierte SVG im Stil der Runde** (Prüfer B-Welt
schaut sie erneut an, Screenshots je Bewegungszustand), Regal-Bild für die Themen, **je Stufe und Aufgabenart passende Folgen mit Varianten (W-Freude)**, Kartenbild (`karte`, Figur in
`spiele/objekte/`), Szenenbild (Werkzeug `werkzeuge/bilder/`, Herkunft A4), Texte als Daten,
`npm run audio` (Erzeugen; Anhören ist Sache von Christian, Liste der neuen Texte im Bericht), Einführung, Regal-Material
(`material.js`), Eintrag in `spiele.json` mit **`beschreibung`** (Christian, 2026-11-14: 2–3 Sätze für Eltern, abgeleitet aus Runde in fünf Sätzen, Lernhandlung und Sachgrund des Entwurfs: was das Kind tut, was es lernt, wie die Welt dazu passt; neutral, „das Kind“, keine Klassenzahlen; sie erscheint nur in `?eltern` und im Elternbereich, nie für das Kind), Browser-Prüfung des Spiels, Durchspielen erneut grün. Danach
Abschluss-Review des Branches (wie bei Rahmen und Ansichten) und Merge nach `main`.

## 6. Kosten je Spiel (Christian)

Für jedes Spiel wird festgehalten, was seine Entwicklung verbraucht hat, damit die Kosten im Blick bleiben und sich
für alle Spiele des Katalogs vorhersagen lassen.

- **Ablage:** `spiele/<fach>/<spiel>/kosten.json`, eine Liste von Einträgen
  `{ datum, phase, posten, modell, eingabe, ausgabe, einheit, menge, notiz }`:
  - **KI-Entwicklung** (Claude): je Agent (Entwurf, Prüfung A, Prototyp, Prüfer B, Ausbau, Review) Modell und
    Token-Verbrauch aus dem Transkript des Agenten, getrennt nach Eingabe, Ausgabe, Cache lesen und Cache schreiben
    (`phase`: entwurf, pruefung-a, prototyp, pruefung-b, ausbau, review; die steuernde Sitzung selbst einmal am Ende
    als `steuerung`; `einheit`: tokens).
  - **Bilder** (Azure OpenAI): je erzeugtem Bild der Verbrauch aus der API-Antwort (`usage`: Ein- und Ausgabe-Token,
    bzw. Bildanzahl und Größe), eingetragen vom Bild-Werkzeug; dasselbe steht in `herkunft.json` des Bildes (A4).
  - **Stimme** (Azure Speech): je Lauf von `npm run audio` die Zahl der neu erzeugten Zeichen für die Texte des
    Spiels (`einheit`: zeichen).
- **Werkzeuge:** `werkzeuge/kosten/kosten.mjs` (`trageEin`, `summen`, `prognose`, `usageAusTranskript`) und
  `werkzeuge/kosten/transkript.mjs` (bucht einen Agenten aus seinem Transkript; mit `--stand` bei Fortsetzungen nur den
  Zuwachs). Posten: `claude` (`einheit: tokens`, `menge` = Eingabe + Ausgabe + `cache_lesen` + `cache_schreiben`), `bild` (`bilder`, `menge` 1, `usage` aus der Antwort), `stimme` (`zeichen`), `status` (`phase: geparkt`, `einheit: keine`, markiert ein geparktes Spiel). Bilder: `node werkzeuge/bilder/erzeugen.mjs --spiel <ordner> <ziel> "<Szene>"`; Stimme: `npm run audio` ordnet neue Zeichen über `texte.json` zu, oder `-- --spiel <ordner>`. Für „Mit echten Dingen“ nennt ein Eintrag zusätzlich `thema` (Liste der Thema-Ids, die er abdeckt; der Bericht zählt jedes Thema einmal, auch wenn Schreiben und Prüfrunden es mehrfach buchen) oder, für ältere Einträge, `themen` (Zahl).
- **Preise:** `werkzeuge/kosten/preise.json` (Preis je Million Token je Modell, je Bild/Token für Bilder, je Million
  Zeichen für die Stimme, mit Stand-Datum und Quelle). Preise ändern sich; der Bericht rechnet immer mit der Datei.
- **Bericht:** `npm run kosten` zeigt je Spiel die Summe in Token, Zeichen, Bildern und Euro, den Durchschnitt je
  fertigem Spiel und eine **Prognose für alle Spiele des Katalogs** (Anzahl aus `docs/spielkatalog.md`), getrennt nach
  Posten, mit Spannweite (günstigstes bis teuerstes bisheriges Spiel). Geparkte Spiele zählen mit, gesondert ausgewiesen.
  Der Ordner eines geparkten Spiels liegt nur in seinem Branch; seine Kosten stehen deshalb zusätzlich als
  `werkzeuge/kosten/geparkt/<spiel>.json` auf `main`, und der Bericht liest sie dort.

## 7. Parken

Bleibt Prüfung A oder B nach drei Runden rot (im Schnellweg: die Prüfung oder das Durchspielen nach zwei Runden),
wird das Spiel geparkt: Branch bleibt, `docs/spiele/<fach>/<spiel>.md` bekommt
einen Abschnitt „Geparkt“ mit den offenen Befunden, Christian bekommt eine kurze Meldung. Kein weiterer Versuch ohne
seine Entscheidung (z. B. Katalog-Eintrag ändern).
