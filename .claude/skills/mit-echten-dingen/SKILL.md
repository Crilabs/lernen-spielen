---
name: mit-echten-dingen
description: Schreibt für Themen des Lernplans ohne vorhandene Anleitung ein kurzes Spiel „Mit echten Dingen“ (spiele/mit-echten-dingen/<fach>/<thema>.md) – Recherche, Ideen, Schreiben, Prüfung E1–E9 durch einen frischen Agenten, höchstens drei Runden, dann Datei, Verzeichnis und Kosten. Aufruf „Mit echten Dingen <thema-id> [<thema-id> …]“; der Skill „Spiel entwickeln“ startet ihn parallel für die Themen seines Spiels.
---

# Mit echten Dingen

Verbindlich: `docs/mit-echten-dingen.md` (ganz), `docs/grundsaetze.md` §1, §3.2, §4, §5.1, §6, §8. Eine Anleitung ist
ein kurzes Spiel mit Dingen aus dem Alltag, das Kind und Erwachsene zusammen spielen (Anrede „ihr“), je Thema eine
Datei mit einer Grundform und bis zu zwei Varianten nach Situation (Am Tisch / In Bewegung / Unterwegs).

## 0. Auswahl

- Je Thema-Id aus `spiele/lernplan.json`: Fach = `strang`, Datei `spiele/mit-echten-dingen/<fach>/<thema-id>.md`.
- **Gibt es die Datei schon, nichts tun** (auch wenn ein weiteres Spiel das Thema bedient). Nur Themen ohne Datei.
- Mehrere Themen: je Thema ein eigener Durchlauf (gern parallel), jeder mit eigener Prüfung.

## 1. Recherche (Web)

- Lernplan-Eintrag lesen: `name`, `ziel`, `beispiele`, `zweck`, `eltern` (der Einzeiler ist eine Anregung, nicht das
  Ergebnis).
- 2–4 Quellen: Fachdidaktik (z. B. PIKAS/DZLM, Landesinstitute wie ISB, LISUM, QUA-LiS), Montessori-Übungen,
  Elternmaterial von Schulen und Verlagen. Kein Text wird übernommen; Quellen nur in den Kopf der Datei.
- Festhalten: Was ist die eigentliche Schwierigkeit des Themas (§4 „isoliert die Schwierigkeit“)? Welcher
  Fachbegriff gilt (§5.1)? Welche Regeln mit Verfallsdatum sind zu vermeiden?

## 2. Ideen

3–5 Ansätze mit Dingen, die in jedem Haushalt da sind (Besteck, Wäscheklammern, Socken, Nudeln, Knöpfe ab 6, Papier,
Stift, Würfel, Treppe, Spaziergang). Einen wählen; Begründung und verworfene Ansätze in den Bericht, **nicht** in die
Datei. Varianten nur, wo eine Situation das Thema wirklich trifft (lieber eine gute Form als drei erzwungene).

## 3. Schreiben

```markdown
---
thema: <thema-id>
fach: <fach>
entwurf: true
quellen:
  - <Titel>, <Herausgeber>, <URL>, abgerufen <JJJJ-MM-TT>
---
# <Thema in Alltagssprache>

## Am Tisch: <Name der Form>

Ihr braucht: <Dinge>

1. <Schritt>
2. <Schritt>

**Darauf kommt es an:** <der Kern, sachlich richtig, für Kind und Erwachsene lesbar>

**Leichter:** <…> **Schwerer:** <…>
```

Regeln: Anrede „ihr“, kurze Sätze, Alltagswörter, höchstens etwa 120 Wörter je Form, etwa 5 Minuten, jederzeit
beendbar, nichts zu basteln oder zu kaufen, nichts Gefährliches. Kein Lob, keine Bewertung, kein Abfragen, kein Druck,
kein „schnell“ (§3.2), keine Rollen nach Geschlecht, Familien in ihrer Vielfalt, Essen ohne Moral. Fachbegriffe nach
§5.1 („ist gleich“, „Silbe“, „Nomen“ …). Team-Wörter statt Rollen („Einer sagt …, der andere …“, nicht „der
Erwachsene … das Kind“). Situationen genau so schreiben: `## Am Tisch: …`, `## In Bewegung: …`, `## Unterwegs: …`
(sonst erkennt die Karte die Form nicht). `entwurf: true` bleibt, bis die Prüfung (Schritt 4) grün ist: Entwürfe stehen
nur in `verzeichnis-entwurf.json` und erreichen die App nicht (ansehen mit `?entwurf`, z. B.
`spiele/rahmen/vorschau.html?echte-dinge&entwurf`).

Danach: `npm run echte-dinge` (Verzeichnis) und `node --test tests/echte-dinge.test.mjs tests/rahmen-markdown.test.mjs`
(prüft Kopf, Thema im Lernplan, Ihr braucht / Schritte / Darauf kommt es an / Leichter / Schwerer, Wortzahl, Wortliste
§3.2, Anrede). Grün ist Pflicht vor der Prüfung.

## 4. Prüfung E1–E9 (frischer Agent)

Ein **neuer Agent, der nicht geschrieben hat**, bekommt nur: die Datei, den Lernplan-Eintrag des Themas,
`docs/mit-echten-dingen.md` und `docs/grundsaetze.md` (nicht die Ideen, nicht diesen Bericht). Auftrag: je Kriterium
**grün** oder **rot** mit Beleg (Zitat aus der Datei, Zeile), dazu kritische Befunde.

| Nr. | Kriterium |
|---|---|
| E1 | trifft genau das Thema und isoliert seine Schwierigkeit |
| E2 | „Darauf kommt es an“ benennt den Kern sachlich richtig |
| E3 | nur Alltagsdinge, nichts zu kaufen, sicher |
| E4 | Anrede „ihr“, kurze Sätze, für ein Kind der Klassenstufe lesbar |
| E5 | neutral: kein Lob, kein Abfragen, kein Druck, keine Klischees |
| E6 | Fachbegriffe nach §5.1 |
| E7 | eigene Worte, Quellen angegeben (der Prüfer öffnet mindestens eine Quelle und vergleicht) |
| E8 | Leichter und Schwerer sinnvoll, Dauer etwa 5 Minuten |
| E9 | jede Variante passt wirklich zur Situation und trifft dasselbe Thema; keine erzwungene Variante |

Grün heißt: alle neun grün, kein kritischer Befund. Rot → überarbeiten und mit einem **wieder neuen** Prüfer prüfen,
**höchstens 3 Runden**. Bleibt es rot: Datei nicht anlegen (bzw. mit `entwurf: true` und `geparkt: true` im Kopf
liegen lassen) und die Befunde an Christian melden.

Hinweis: Die drei ersten Dateien (`mathe/vorwaerts-zaehlen`, `mathe/zerlegen-7`, `lesen/silben-klatschen`) sind noch
`entwurf: true` und brauchen diese Prüfung.

## 5. Abschluss: Datei, Verzeichnis, Kosten

1. Prüfung grün: `entwurf: true` aus dem Kopf löschen (erst dann steht die Anleitung in `verzeichnis.json` und
   erreicht die App). Geparkt: `geparkt: true` in den Kopf (steht in keinem Verzeichnis). Datei liegt unter
   `spiele/mit-echten-dingen/<fach>/<thema-id>.md`, `npm run echte-dinge` ist gelaufen, `npm test` grün.
2. Kosten je Agent (Recherche, Schreiben, Prüfung – Modell und Token aus der Agenten-Rückmeldung) eintragen;
   die Datei der analogen Spiele verlangt `themen` (Zahl der Themen, die der Eintrag abdeckt):

```bash
node -e '
import("./werkzeuge/kosten/kosten.mjs").then(({ trageEin }) => trageEin("spiele/mit-echten-dingen", {
  datum: "2026-11-14", phase: "schreiben", posten: "claude", modell: "claude-opus-5-5",
  eingabe: 41000, ausgabe: 3200, menge: 44200, einheit: "tokens", themen: 1, notiz: "zerlegen-7" }))'
```

   Phasen: `recherche`, `schreiben`, `pruefung`. Je Prüfrunde ein Eintrag.
3. Bericht (an den Aufrufer): Thema, gewählte Idee mit Begründung, verworfene Ideen, Prüfergebnis je Runde
   (E1–E9 mit Beleg), Kosten.

## Was die App damit macht

Die Karte (`<ls-anregung>`), die Kachel (`<ls-echte-dinge-kachel>`), das Angebot in der Pause und die Übersicht
(`spiele/mit-echten-dingen.html`, Küchenzettel zum Drucken) lesen die Datei über das Verzeichnis. Analoges Spielen
zählt nie für den Lernstand.
