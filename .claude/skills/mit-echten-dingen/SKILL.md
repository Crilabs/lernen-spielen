---
name: mit-echten-dingen
description: Schreibt für Themen des Lernplans ohne vorhandene Anleitung ein kurzes Spiel „Mit echten Dingen“ (spiele/mit-echten-dingen/<fach>/<thema>.md) – Recherche, Ideen, Schreiben, Bild, Prüfung E1–E12 durch einen frischen Agenten, höchstens drei Runden, dann Datei, Verzeichnis und Kosten. Aufruf „Mit echten Dingen <thema-id> [<thema-id> …]“; der Skill „Spiel entwickeln“ startet ihn parallel zum Spiel, für dessen Themen nacheinander.
---

# Mit echten Dingen

Verbindlich: `docs/mit-echten-dingen.md` (ganz), `docs/grundsaetze.md` §1, §3.2, §4, §5.1, §6, §8. Eine Anleitung ist
ein kurzes Spiel mit Dingen aus dem Alltag, das Kind und Erwachsene zusammen spielen (Anrede „ihr“), je Thema eine
Datei mit einer Grundform und bis zu zwei Varianten nach Situation (Am Tisch / In Bewegung / Unterwegs).

## 0. Auswahl

- Je Thema-Id aus `spiele/lernplan.json`: Fach = `strang`, Datei `spiele/mit-echten-dingen/<fach>/<thema-id>.md`.
- **Trägt eine Datei das Thema schon, nichts tun** (`thema:` oder in `themen:` einer Familie; auch wenn ein weiteres
  Spiel das Thema bedient; `grep -rl "<thema-id>" spiele/mit-echten-dingen/*/`).
- **Erst eine Familie suchen** (`docs/mit-echten-dingen.md` „Eine Anleitung für eine Familie“): Gibt es im Fach eine
  Anleitung mit derselben Handlung, bei der nur ein Wert wechselt (Zahl, Buchstabe), kommt das Thema in ihre
  `themen:`-Liste (aus `thema:` wird dabei `themen:`, die Datei bekommt den Namen der Familie, `git mv`), der Text
  wird allgemein, und die Datei geht als Entwurf in die Prüfung (§4, E1 für jedes Thema der Liste). Keine neue Datei.
  Themen mit eigener Schwierigkeit oder eigenem Alltagszweck bleiben getrennt. Nur Themen ohne Datei –
  Ausnahme: eine Datei mit `entwurf: true` ohne `geparkt` ist noch nicht fertig; sie geht ohne neues Schreiben gleich
  in die Prüfung (§4).
- Mehrere Themen: je Thema ein eigener Durchlauf, jeder mit eigener Prüfung; im selben Arbeitsordner nacheinander,
  nie parallel (`npm run echte-dinge` schreibt dieselben Verzeichnisse).
- Aus „Spiel entwickeln“ heraus (`.claude/skills/spiel-entwickeln/SKILL.md`, Abschnitt „Mit echten Dingen“): eigener
  Worktree `echte-dinge-<id>`; die steuernde Sitzung startet Schreib-Agent und frische Prüfer selbst und bucht die
  Kosten (`werkzeuge/kosten/transkript.mjs`, mit `--thema <thema-id>`). Der Schreib-Agent macht dann nur §1–§3a und
  §5.1, ohne Unteragenten und ohne Kosten zu buchen, und committet nie `kosten.json`.

## 1. Recherche (Web)

- Lernplan-Eintrag lesen: `name`, `ziel`, `beispiele`, `zweck`, `eltern` (der Einzeiler ist eine Anregung, nicht das
  Ergebnis).
- 2–4 Quellen: Fachdidaktik (z. B. PIKAS/DZLM, Landesinstitute wie ISB, LISUM, QUA-LiS), Montessori-Übungen,
  Elternmaterial von Schulen und Verlagen. Kein Text wird übernommen; Quellen nur in den Kopf der Datei.
- **Gesucht sind die besten Methoden für genau dieses Thema** (`docs/mit-echten-dingen.md`, Schritt 1): was in den
  Quellen als wirksam gilt, bevorzugt praxisnah nach Montessori (eine Handlung mit echtem Zweck im Alltag: Tisch
  decken, teilen, einkaufen, sortieren). Keine Methode ist vorab gesetzt.
- Festhalten: Was ist die eigentliche Schwierigkeit des Themas (§4 „isoliert die Schwierigkeit“)? Welcher
  Fachbegriff gilt (§5.1)? Welche Regeln mit Verfallsdatum sind zu vermeiden?

## 2. Ideen

3–5 Ansätze mit Dingen, die in jedem Haushalt da sind (Besteck, Wäscheklammern, Socken, Nudeln, Knöpfe ab 6, Papier,
Stift, Würfel, Treppe, Spaziergang). Einen wählen, nach Wirksamkeit laut Recherche und Praxisnähe, nicht nach
Originalität; Begründung und verworfene Ansätze in den Bericht, **nicht** in die Datei. Varianten Am Tisch / Unterwegs
nur, wo eine Situation das Thema wirklich trifft (lieber eine gute Form als drei erzwungene).

**In Bewegung immer:** 2–3 Bewegungsideen (hüpfen, klatschen, stampfen, Buchstaben ablaufen, Dinge im Haus suchen,
Treppe, Kissen als Felder). Zuerst fragen: Zeigt eine Bewegung das Prinzip selbst (dann zum Verstehen, ohne Marke,
gern als Grundform)? Sonst eine wählen, die das Verstandene festigt, mit `**Zum Verinnerlichen:** Spielt zuerst
„<Name der Form zum Verstehen>“. …` als erstem Absatz der Form. Jede Bewegung trägt den Inhalt; kein Wettlauf, keine
Zeit, nichts Gefährliches.

## 3. Schreiben

```markdown
---
thema: <thema-id>          # oder für eine Familie: themen: mit einer Zeile „  - <thema-id>“ je Thema
fach: <fach>
entwurf: true
bild: { figur: <art>, zustand: <zustand> }
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

Die Form `## In Bewegung: …` fehlt nie; zum Verinnerlichen beginnt sie vor „Ihr braucht“ mit
`**Zum Verinnerlichen:** Spielt zuerst „<Name>“. Dieses Spiel hilft, <Kern> zu behalten.`

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

## 3a. Bild der Karte

Nach `docs/mit-echten-dingen.md` „Bild der Karte“ und `docs/grundsaetze-bilder.md` §16: das Alltagsding der
Grundform wählen (z. B. sieben Nudeln auf zwei Tellern, ein Würfel, eine Treppe). Zuerst in `spiele/objekte/`
nachsehen, auch auf `main` (`git show main:spiele/objekte/`, ein anderes Spiel kann die Art inzwischen gebracht haben);
fehlt es, als `spiele/objekte/<art>.js` zeichnen (Schnittstelle und Stil: `docs/spielentwicklung.md`
„Spielobjekte“, `docs/figuren.md` §4; von Hand, nie KI; `tests/objekte.test.mjs` grün). Ein Ding, groß, kein Text,
keine Ziffern, keine Lernzeichen; an der Silhouette von den Bildern der anderen Anleitungen des Fachs zu unterscheiden.
Im Kopf `bild: { figur: <art>, zustand: <zustand> }`. Die Hand als Zeichen „echt“ setzt die Karte selbst.

## 4. Prüfung E1–E12 (frischer Agent)

Ein **neuer Agent, der nicht geschrieben hat**, bekommt nur: die Datei, den Lernplan-Eintrag des Themas,
`docs/mit-echten-dingen.md`, `docs/grundsaetze.md` und das Objekt aus `bild` (nicht die Ideen, nicht diesen Bericht). Auftrag: je Kriterium
**grün** oder **rot** mit Beleg (Zitat aus der Datei, Zeile), dazu kritische Befunde.

| Nr. | Kriterium |
|---|---|
| E1 | trifft genau das Thema und isoliert seine Schwierigkeit; bei einer Familie: trägt jedes Thema der Liste |
| E2 | „Darauf kommt es an“ benennt den Kern sachlich richtig |
| E3 | nur Alltagsdinge, nichts zu kaufen, sicher |
| E4 | Anrede „ihr“, kurze Sätze, für ein Kind der Klassenstufe lesbar |
| E5 | neutral: kein Lob, kein Abfragen, kein Druck, keine Klischees |
| E6 | Fachbegriffe nach §5.1 |
| E7 | eigene Worte, Quellen angegeben (der Prüfer öffnet mindestens eine Quelle und vergleicht) |
| E8 | Leichter und Schwerer sinnvoll, Dauer etwa 5 Minuten |
| E9 | Methode laut Recherche wirksam für dieses Thema (Quelle im Kopf); die Handlung ist praxisnah und hat einen Zweck über das Üben hinaus |
| E10 | jede Variante passt wirklich zur Situation und trifft dasselbe Thema; keine erzwungene Variante |
| E11 | Bild: Alltagsding passt, erkennbar, im Stil der Runde (`bild` im Kopf, Objekt in `spiele/objekte/`, „Bild der Karte“) |
| E12 | In Bewegung: da; jede Bewegung trägt den Inhalt; zeigt sie das Prinzip nicht selbst, steht vorn „Zum Verinnerlichen“ mit der Form zum Verstehen; sicher, ohne Wettlauf |

E9 für eine Form zum Verinnerlichen: Spaß an der Bewegung und Behalten genügen als Zweck; den Alltagszweck trägt die
Form zum Verstehen.

**Nachrüsten** (Anleitung ohne In Bewegung, z. B. nach einer Regeländerung): nur §2 (Bewegung) und §3 für die neue Form,
Kopf, Bild und übrige Formen bleiben; geprüft wird die ganze Datei, mit Schwerpunkt E1, E4, E5, E8, E10, E12.

Grün heißt: alle zwölf grün, kein kritischer Befund. Rot → überarbeiten und mit einem **wieder neuen** Prüfer prüfen,
**höchstens 3 Runden**. Bleibt es rot: Datei nicht anlegen (bzw. mit `entwurf: true` und `geparkt: true` im Kopf
liegen lassen) und die Befunde an Christian melden.

Hinweis: Die drei ersten Dateien (`mathe/vorwaerts-zaehlen`, `mathe/zerlegen-7`, `lesen/silben-klatschen`) sind noch
`entwurf: true` und brauchen diese Prüfung.

## 5. Abschluss: Datei, Verzeichnis, Kosten

1. Prüfung grün: `entwurf: true` aus dem Kopf löschen (erst dann steht die Anleitung in `verzeichnis.json` und
   erreicht die App). Geparkt: `geparkt: true` in den Kopf (steht in keinem Verzeichnis). Datei liegt unter
   `spiele/mit-echten-dingen/<fach>/<thema-id>.md`, `npm run echte-dinge` ist gelaufen, `npm test` grün.
2. Kosten je Agent (Recherche, Schreiben, Prüfung) aus seinem Transkript buchen, immer mit `--stand` (bei einer
   Fortsetzung desselben Agenten per SendMessage bucht es nur den Zuwachs, nie doppelt) und mit `--thema`:

```bash
T=$(ls ~/.claude/projects/-Users-christian-Code-einhorn-lernspiele*/*/subagents/agent-<agentId>.jsonl)
node werkzeuge/kosten/transkript.mjs "$T" --ordner spiele/mit-echten-dingen --phase schreiben \
  --thema zerlegen-7 --notiz "zerlegen-7, Schreiben" --stand <Arbeitsablage>/kosten-stand.json
```

   Phasen: `recherche`, `schreiben`, `pruefung`; je Prüfrunde ein Aufruf. `--thema` (Thema-Ids, mit Komma getrennt)
   lässt den Bericht jedes Thema einmal zählen, auch über mehrere Einträge. Die Datei der analogen Spiele verlangt
   `thema` oder `themen`. Nur wenn kein Transkript da ist, von Hand mit `trageEin` aus
   `werkzeuge/kosten/kosten.mjs`, z. B. `{ datum: "2026-11-14", phase: "schreiben", posten: "claude", modell:
   "claude-sonnet-5-5", eingabe: 41000, ausgabe: 3200, menge: 44200, einheit: "tokens", thema: ["zerlegen-7"],
   notiz: "zerlegen-7" }` (Modell und Token aus der Agenten-Rückmeldung).
3. Bericht (an den Aufrufer): Thema, gewählte Idee mit Begründung, verworfene Ideen, Prüfergebnis je Runde
   (E1–E12 mit Beleg), Kosten.

## Was die App damit macht

Die App liest die Datei über das Verzeichnis (`verzeichnis.json`, nur freigegebene Anleitungen) an diesen Stellen:
die eigene Seite der Anleitung `spiele/echt.html?thema=<id>`; die Karte „Mit echten Dingen“ auf der Startseite
(`spiele/start/karten.js`, mit dem Titel der Anleitung) und im Regal; der Knopf auf der Fach-Seite; das ruhige Angebot
in der Pause am Rundenende eines Spiels (`spiele/rahmen/pause.js`). Sie führen zu `echt.html`. Für Erwachsene steht
die Anleitung im Lernplan des Elternbereichs als Karte im aufgeklappten Thema (mit PDF je Thema); dort zeigt die Karte
auch das Bild der Karte (`bild`), das Kinderseiten noch nicht zeigen. Analoges Spielen zählt nie für den Lernstand.
