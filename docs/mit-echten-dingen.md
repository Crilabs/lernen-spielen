# Mit echten Dingen – Spiele ohne Bildschirm

Stand: 2026-11-15 (Immer auch in Bewegung) · **freigegeben (Christian, 2026-11-14)** · Entscheidungen von Christian (2026-11-14)
Zusammengeführt am 2026-11-14 aus der Fassung des Prüfstands (Formen nach Situation, Entwürfe, Übersicht, Bild) und der
Fassung auf `main` (eigene Seite `echt.html`, Recherche nach Wirksamkeit) **(Christian)**.
Markierung: **(Christian)** entschieden · **(Annahme)** Vorschlag, korrigierbar.

## Warum

Gekonnt heißt auch woanders gekonnt (`grundsaetze.md` L13), und echtes Material trägt das Lernen (Montessori, §4).
Zu jedem Thema des Lernplans gibt es deshalb ein kurzes Spiel mit Dingen aus dem Alltag, das Kind und Erwachsene
zusammen spielen. Die Beispiele im Lernplan (`eltern`) sind Anregungen, nicht das Ergebnis **(Christian)**.

Name in der App und im Projekt: **„Mit echten Dingen“** (Annahme; der Knopf und die Karte heißen schon so).

## Was entsteht

- **Je Thema eine Datei mit einer Grundform und bis zu zwei Varianten nach Situation (Christian):** *Am Tisch*
  (ruhig, konzentriert), *In Bewegung* (Treppe, hüpfen, Raum), *Unterwegs* (Spaziergang, Auto, Einkauf). *In Bewegung*
  gibt es immer (nächster Punkt); *Am Tisch* und *Unterwegs* nur, wo sie das Thema wirklich treffen; erzwungene
  Varianten streicht die Prüfung (E10). Gibt es für ein Thema schon
  eine Datei, entsteht keine zweite, auch wenn ein weiteres Spiel das Thema bedient.
- **Eine Anleitung für eine Familie (Christian, 2026-11-14):** Wer die 4 mit Nudeln und Tellern zerlegt, braucht kein
  zweites Spiel, das die 6 mit Erbsen und Tassen zerlegt. Ist die Handlung dieselbe und wechselt nur ein Wert (Zahl,
  Buchstabe), trägt **eine** Datei alle diese Themen: im Kopf `themen:` als Liste statt `thema:`, Dateiname = Name der
  Familie (z. B. `mathe/zerlegen.md`), der Wert steht im Text allgemein („so viele, wie die Zahl sagt, zum Beispiel
  sieben“). Vor jedem neuen Thema wird deshalb erst eine passende Familie gesucht; passt eine, kommt das Thema in ihre
  Liste, und die Prüfung E1 prüft, ob sie es wirklich trägt. **Gegenregel:** Themen mit eigener Schwierigkeit oder
  eigenem Alltagszweck bleiben getrennt, auch bei gleichem Material (die Zweierreihe paart Socken, die Fünferreihe
  zählt Kleingeld). Jedes Thema steht in höchstens einer Datei (`npm run echte-dinge` bricht sonst ab).
- **Immer auch in Bewegung (Christian, 2026-11-15):** Jede Anleitung hat eine Form *In Bewegung* (hüpfen, klatschen,
  stampfen, Buchstaben ablaufen, Dinge im Haus suchen …). Bewegung macht Spaß, und was man mit dem Körper getan hat,
  merkt man sich besser. Es gibt sie in zwei Arten:
  - **Zum Verstehen:** Ergibt sich die Bewegung aus der Sache (Treppenstufen zählen, Silben abzählen beim Verstecken),
    zeigt sie das Prinzip selbst; sie kann dann auch die Grundform sein.
  - **Zum Verinnerlichen:** Ergibt sie sich nicht aus der Sache, festigt sie, was eine andere Form erklärt hat. Das wird
    gesagt: Die Form beginnt mit `**Zum Verinnerlichen:**` und nennt die Form zum Verstehen in „…“, z. B.
    `**Zum Verinnerlichen:** Spielt zuerst „Kleingeld für die Brötchen“. Dieses Spiel hilft, die Fünferreihe zu
    behalten.` Die Seite zeigt das als „Erst verstehen, dann verinnerlichen“ vor „Ihr braucht“, das Druckblatt auch.
    Auch hier gilt „Darauf kommt es an“ (der Kern, den die Bewegung festigt), Leichter/Schwerer, Neutralität, kein
    „schnell“, kein Abfragen: kein Wettlauf, keine Zeit, wer danebenhüpft, hüpft einfach weiter.
  Die Bewegung ist an das Thema gebunden (jeder Hüpfer, jedes Klatschen, jeder Fund trägt den Inhalt), nicht Bewegung
  plus eine Frage. Ohne Gerät, mit Platz in Wohnung, Flur, Treppe oder Hof; nichts Gefährliches (keine Treppe
  hinunterspringen, nicht rennen auf glattem Boden). Geparkte Anleitungen brauchen sie erst, wenn sie weitergehen.
- **Nach Situation, nicht nach Kind-Typ:** keine Einstellung „Bewegungstyp“ o. ä. im Profil (Lerntypen sind ein
  Mythos, `grundsaetze.md` §1). Gewählt wird auf der Seite im Moment (N1, N2); die Seite merkt sich die letzte Wahl
  als Voreinstellung.
- Datei `spiele/mit-echten-dingen/<fach>/<thema-id>.md` (Markdown), eigene Worte, Quellen nur im Kopf der Datei.
- **Anrede „ihr“ (Christian):** Kind und Erwachsene als Team, keiner prüft den anderen („Legt die Gabeln in eine
  Reihe.“).
- **Jede Form mit „Leichter“ und „Schwerer“ (Christian).**

```markdown
---
thema: vorwaerts-zaehlen
bild: { figur: treppe, zustand: hinauf }
quellen:
  - <Titel, Herausgeber, URL, abgerufen am>
---
# Zählen, wie viele es sind

## Am Tisch: Gabeln zählen

Ihr braucht: eine Besteckschublade

1. Nehmt die Gabeln heraus und legt sie in eine Reihe.
2. Zeigt beim Zählen auf jede Gabel genau einmal.
3. Sagt am Ende, wie viele es sind.

**Darauf kommt es an:** Die letzte Zahl beim Zählen sagt, wie viele Gabeln es sind.

**Leichter:** nur bis fünf. **Schwerer:** erst schätzen, dann zählen.

## In Bewegung: Treppenstufen

Ihr braucht: eine Treppe

1. Geht die Treppe hinauf und zählt bei jeder Stufe eine Zahl.
2. Oben sagt ihr, wie viele Stufen es waren.

**Darauf kommt es an:** Jede Stufe bekommt genau eine Zahl. Die letzte Zahl sagt, wie viele Stufen es sind.

**Leichter:** nur die ersten fünf Stufen. **Schwerer:** rückwärts hinunter zählen.
```

Die Überschrift der Datei nennt das Thema in Alltagssprache; jede Form beginnt mit `## <Situation>: <Name>`, genau so
geschrieben (sonst erkennt der Leser die Form nicht; je Situation zählt nur die erste). Die Seite zeigt die Formen
als kleine Wahl (Knopf mit Symbol und Wort). Weitere Ideen zum selben Thema kommen nicht in die Datei; eine Abstufung
desselben Kerns gehört in „Leichter“ oder „Schwerer“.

## Bild der Karte (Christian)

- Die Karte „Mit echten Dingen“ behält ihr eigenes Aussehen: Papier mit Naht, keine Welt-Vignette. Ihr Bild ist **das
  echte Alltagsding der Anleitung** im Stil der Runde (`figuren.md` §4), z. B. sieben Nudeln auf zwei Tellern, ein
  Würfel, eine Treppe; klein in der Ecke des Bildes eine Hand als Zeichen „echt“; kein runder Knopf (Christian). Regeln wie für jedes Kartenbild
  (`grundsaetze-bilder.md` §16): ein Ding, groß, an der Silhouette von den anderen Karten des Fachs zu unterscheiden,
  kein Text, keine Ziffern, keine Lernzeichen.
- Im Kopf der Datei: `bild: { figur: <art>, zustand: <zustand> }` (Annahme). Das Ding liegt als
  `spiele/objekte/<art>.js` und ist wiederverwendbar (Nudeln, Teller, Würfel, Treppe …); zuerst im Bestand nachsehen.
  Gibt es für eine Anleitung mehrere Formen, zeigt das Bild die Grundform.

## Regeln für den Text

- **Für beide lesbar:** kurze Sätze, Alltagswörter, höchstens etwa 120 Wörter (Annahme). Es stört nicht, wenn das Kind
  mitliest und den Kern versteht – der Satz „Darauf kommt es an“ ist für beide geschrieben **(Christian)**.
- **Fachbegriffe** nach `grundsaetze.md` §5.1 (Nomen, Einer, Zehner, ist gleich …), keine Regeln mit Verfallsdatum.
- **Neutral:** kein Lob, keine Bewertung, kein Abfragen, kein Druck, kein „schnell“ (3.2, N5, N6); keine Rollen nach
  Geschlecht, Familien in ihrer Vielfalt (§6); Essen ohne Moral (§8).
- **Dinge, die in jedem Haushalt da sind:** Besteck, Wäscheklammern, Socken, Nudeln, Knöpfe (ab 6 Jahren), Papier,
  Stift, Würfel, Treppenstufen, Spaziergang. Nichts zu kaufen, nichts Gefährliches (keine Messer, kein Feuer, keine
  verschluckbaren Kleinteile für Geschwister im Hinweis „Passt gut“ bedenken).
- **Isoliert die Schwierigkeit des Themas** (§4), genau wie die Spiele; das Kind handelt selbst (L1).
- **Etwa 5 Minuten**, jederzeit beendbar, kein Material zum Basteln vorher.

## Wie eine Anleitung entsteht (Dienst neben der Spielentwicklung)

**Auslöser (Christian):** Startet der Skill „Spiel entwickeln“, läuft parallel der Dienst für alle Themen des
Spiels, die noch keine Anleitung haben.

1. **Recherche** (Web): Fachdidaktik, Montessori-Übungen, Elternmaterial von Schulen, Verlagen und Landesinstituten.
   Quellen in den Kopf der Datei; der Text ist immer eigen formuliert, nichts wird übernommen.
   **Gesucht sind die besten Methoden für genau dieses Thema (Christian, 2026-11-14):** Welche Wege, das Thema mit
   Alltagsdingen zu lernen, gelten in den Quellen als wirksam? Bevorzugt praxisnah im Sinne Montessoris: Das Kind
   tut etwas, das im Alltag einen echten Zweck hat (Tisch decken, teilen, einkaufen, sortieren), und lernt dabei
   nebenbei. Lernen ist kein Selbstzweck (`grundsaetze.md`, zweite Prüffrage). Keine Methode ist vorab gesetzt; was
   am besten trägt, ergibt die Recherche je Thema.
2. **Ideen:** 3–5 Ansätze mit Alltagsdingen, einer wird gewählt (Begründung im Bericht, nicht in der Datei). Gewählt
   wird nach Wirksamkeit laut Recherche und Praxisnähe, nicht nach Originalität.
3. **Schreiben** nach den Regeln oben.
4. **Prüfung** durch einen frischen Agenten, grün/rot je Kriterium mit Beleg:

| Nr. | Kriterium |
|---|---|
| E1 | trifft genau das Thema und isoliert seine Schwierigkeit |
| E2 | „Darauf kommt es an“ benennt den Kern sachlich richtig |
| E3 | nur Alltagsdinge, nichts zu kaufen, sicher |
| E4 | Anrede „ihr“, kurze Sätze, für ein Kind der Klassenstufe lesbar |
| E5 | neutral: kein Lob, kein Abfragen, kein Druck, keine Klischees |
| E6 | Fachbegriffe nach §5.1 |
| E7 | eigene Worte, Quellen angegeben |
| E8 | Leichter und Schwerer sinnvoll, Dauer etwa 5 Minuten |
| E9 | Methode laut Recherche wirksam für dieses Thema (Quelle im Kopf); die Handlung ist praxisnah und hat einen Zweck über das Üben hinaus |
| E10 | jede Variante passt wirklich zur Situation und trifft dasselbe Thema; keine erzwungene Variante |
| E11 | Bild: Alltagsding passt, erkennbar, im Stil der Runde (`bild` im Kopf, Objekt in `spiele/objekte/`, „Bild der Karte“) |
| E12 | In Bewegung: da; jede Bewegung trägt den Inhalt; zeigt sie das Prinzip nicht selbst, steht vorn „Zum Verinnerlichen“ mit der Form zum Verstehen; sicher, ohne Wettlauf |

E9 für eine Form zum Verinnerlichen: Ihr Zweck ist Spaß an der Bewegung und Behalten; sie braucht keinen Alltagszweck,
die Form zum Verstehen hat ihn (Christian, 2026-11-15). E12 seit 2026-11-15 (Christian).

Nummern seit der Zusammenführung (Christian, 2026-11-14): E9 wie auf `main` beschlossen, die Prüfung der Varianten
(vorher E9 im Prüfstand) ist E10, das Bild (vorher E10) ist E11. Die Spielobjekte (`spiele/objekte/`) sind auf
`main`, E11 gilt also; das Bild der Karte ist in der App noch nicht gebaut (E11 prüft das Objekt und `bild` im Kopf).

Die Grundsätze (`grundsaetze.md`) gelten für jede Anleitung ganz, auch wo E1–E12 sie nicht einzeln nennen.

Rot → überarbeiten, höchstens 3 Runden; danach parken mit Befunden.
5. **Kosten** (Token für Recherche, Schreiben, Prüfung) in `spiele/mit-echten-dingen/kosten.json`, wie bei den
   Spielen (`spielentwicklung.md` §6).

## Wo es zu sehen ist

- **Eigene Seite `spiele/echt.html?thema=<id>` (Christian, 2026-11-14)**, Kopfleiste im Fach des Themas, das Thema als
  Unterzeile. Aufbau: Titel, bei mehr als einer Form die **Wahl der Situation** (Am Tisch / In Bewegung / Unterwegs,
  eine Form zur Zeit, die letzte Wahl als Voreinstellung), je Form ihr Name, „Ihr braucht“ (auf dem Tablett, wie
  Material), nummerierte Schritte, „Darauf kommt es an“ (mit dem Sonnenring), „Leichter“/„Schwerer“ als **zwei
  Umschalter**, eine Stufe zur Zeit (Christian), „Passt gut“. Der Kopf mit den Quellen wird nicht angezeigt. **Nur
  lesen, kein Vorlesen** (Christian). Fehlt die Anleitung (oder ist sie noch Entwurf), steht der bisherige Einzeiler
  aus dem Lernplan da **(Christian)**.
- **Gleichwertig im Weg des Kindes (Christian):** Auf der **Startseite** steht „Mit echten Dingen“ als Karte gleicher
  Größe neben den Spielkarten eines Fachs (Themen „dran“, mit dem Titel der Anleitung, wenn es eine gibt); dazu das
  **Regal** (Karte im Detail eines Themas) und die **Fach-Seite** (Knopf „Mit echten Dingen“). Alle führen zu
  `echt.html`. Analoges Spielen zählt **nicht** für den Lernstand (Annahme): „gekonnt“ misst nur die App, niemand
  trägt Ergebnisse ein.

- **Für Erwachsene im Lernplan (Christian, 2026-11-15; ersetzt die eigene Übersichtsseite):** Im Elternbereich,
  Reiter „Lernplan“, stehen im aufgeklappten Thema dessen Spiele als kleine Karten: digitale und „Mit echten Dingen“
  (Bild der Karte aus `bild:`, Titel, Situationen, später die Kurzbeschreibung). Die analoge Karte öffnet
  `<ls-anregung>` über dem Lernplan; Zurück schließt sie, der Lernplan steht an derselben Stelle (keine neue PIN).
  - **PDF je Thema (Christian, 2026-11-14):** In dieser Karte steht der Knopf „PDF“ (nur im Elternbereich, nur wo das
    Gerät drucken kann; Kinder sehen ihn nie). Er druckt ein A4-Blatt mit allen Formen des Themas, voll (Ihr braucht,
    Schritte, Darauf kommt es an, Leichter/Schwerer), in der Reihenfolge Am Tisch, In Bewegung, Unterwegs. Stil wie
    die Seite (Andika, Tinte, Linien und Schrittkreise im Tief-Ton des Fachs), ohne Flächen. Über den Druckdialog als
    PDF speichern; der Dateiname ist „Mit echten Dingen – <Thema>“. Design:
    `docs/superpowers/specs/2026-11-14-echte-dinge-pdf-je-thema-design.md`,
    `docs/superpowers/specs/2026-11-14-lernstand-lernplan-abhaken-design.md`.

- **Am Rundenende eines Spiels** als ruhiges Angebot in der Pause, neben „Alle Spiele“ und „Weiter“ (kein Muss, keine
  Belohnung, K8; der Katalog nennt das „Mach mit“) **(Christian)**; führt zur selben Seite `echt.html` (vorher wird
  gespeichert wie bei „Alle Spiele“).

## Umsetzung (Stand 2026-11-15)

- **Dateien:** `spiele/mit-echten-dingen/<fach>/<thema>.md`; `npm run echte-dinge` schreibt daraus
  `verzeichnis.json` (nur **freigegebene** Anleitungen: ohne `entwurf: true` und ohne `geparkt: true`; das liest die
  App) und `verzeichnis-entwurf.json` (dazu die Entwürfe; nur mit `?entwurf` in der Adresse, für Vorschau und
  Prüfungen). So erreicht kein ungeprüfter Text das Kind. Der Themenname steht im Verzeichnis nur, wenn er im ganzen
  Lernplan eindeutig ist (die Karte erkennt ein Thema notfalls daran). Die Seiten laden nur das Verzeichnis und die
  Anleitung, die sie zeigen. `tests/echte-dinge.test.mjs` prüft, dass das Verzeichnis aktuell
  ist, und die Form jeder Datei (Kopf, Thema im Lernplan, Ihr braucht, Schritte, Darauf kommt es an, Leichter/Schwerer,
  Wortzahl, Wortliste 3.2, Anrede „ihr“). Die ersten drei Dateien (`mathe/vorwaerts-zaehlen`, `mathe/zerlegen-7`,
  `lesen/silben-klatschen`) sind **Entwürfe** (`entwurf: true`): sie haben die Prüfung E1–E12 noch nicht durchlaufen und
  bleiben Entwurf, bis der Skill sie grün prüft.
- **Darstellung:** `spiele/rahmen/markdown.js` (Leser: klein, ohne DOM, alles escaped, Kopf wird abgetrennt),
  `spiele/rahmen/echte-dinge.js` (Verzeichnis, Laden, gemerkte Form `echte-dinge.form`), die Seite `spiele/echt.html`
  mit `spiele/start/anleitung.js` (bringt jede Form in den Aufbau der Seite), Angebot in `<ls-pause>`
  (`docs/bedienung.md` §9; führt zu `echt.html`). Die Spielvorlage reicht das Thema der Runde an die Pause. Die Karte
  `<ls-anregung>` ist die Karte (Fach-Seite, Regal, Pause; im Lernplan der Eltern mit `pdf`); die Kachel `<ls-echte-dinge-kachel>` steht nur in der Vorschau
  (`spiele/rahmen/vorschau.html?echte-dinge`), die App nutzt die Karten der Startseite.
- **Daten:** `echteDingeFuer(ctx, themaId)` in `spiele/lernsteuerung.js` (`ctx.echteDinge` = Verzeichnis), nur lesend.
- **Lernplan und PDF:** Karten in `spiele/eltern.html` (erst beim Aufklappen eines Themas, nur freigegebene
  Anleitungen); `<ls-anregung>` mit `oeffne({ …, pdf: true })`. Das Blatt baut `spiele/rahmen/echte-dinge-blatt.js`
  (ohne DOM, `tests/echte-dinge-blatt.test.mjs`); `spiele/rahmen/echte-dinge-druck.js` setzt es versteckt in die
  Seite (`#ls-blatt`), misst und setzt es eine Schriftstufe kleiner, wenn es länger als eine Seite ist (passt es dann
  nicht, folgt eine zweite Seite; keine Form wird geteilt), und druckt über `drucke()` in `spiele/kern/geraet.js`
  (Fähigkeit `drucken`: Browser und Desktop ja, Android/iOS nein).
- **Skill:** `.claude/skills/mit-echten-dingen/SKILL.md` (Recherche → Ideen → Schreiben → Bild → Prüfung E1–E12 durch einen
  frischen Agenten → höchstens 3 Runden → Datei, Verzeichnis, Kosten in `spiele/mit-echten-dingen/kosten.json`).
