# Mit echten Dingen – Spiele ohne Bildschirm

Stand: 2026-11-14 · **freigegeben (Christian, 2026-11-14)** · Entscheidungen von Christian (2026-11-14)
Markierung: **(Christian)** entschieden · **(Annahme)** Vorschlag, korrigierbar.

## Warum

Gekonnt heißt auch woanders gekonnt (`grundsaetze.md` L13), und echtes Material trägt das Lernen (Montessori, §4).
Zu jedem Thema des Lernplans gibt es deshalb ein kurzes Spiel mit Dingen aus dem Alltag, das Kind und Erwachsene
zusammen spielen. Die Beispiele im Lernplan (`eltern`) sind Anregungen, nicht das Ergebnis **(Christian)**.

Name in der App und im Projekt: **„Mit echten Dingen“** (Annahme; der Knopf und die Karte heißen schon so).

## Was entsteht

- **Genau eine Anleitung je Thema (Christian).** Gibt es für ein Thema schon eine, entsteht keine zweite, auch wenn
  ein weiteres Spiel das Thema bedient.
- Datei `spiele/mit-echten-dingen/<fach>/<thema-id>.md` (Markdown), eigene Worte, Quellen nur im Kopf der Datei.
- **Anrede „ihr“ (Christian):** Kind und Erwachsene als Team, keiner prüft den anderen („Legt die Gabeln in eine
  Reihe.“).
- **Eine Anleitung mit „Leichter“ und „Schwerer“ (Christian).**

```markdown
---
thema: vorwaerts-zaehlen
quellen:
  - <Titel, Herausgeber, URL, abgerufen am>
---
# Gabeln zählen

Ihr braucht: eine Besteckschublade

1. Nehmt die Gabeln heraus und legt sie in eine Reihe.
2. Zeigt beim Zählen auf jede Gabel genau einmal.
3. Sagt am Ende, wie viele es sind.

**Darauf kommt es an:** Die letzte Zahl beim Zählen sagt, wie viele Gabeln es sind.

**Leichter:** nur bis fünf. **Schwerer:** erst schätzen, dann zählen.

**Passt gut:** beim Tischdecken, beim Einkauf-Auspacken.
```

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
2. **Ideen:** 3–5 Ansätze mit Alltagsdingen, einer wird gewählt (Begründung im Bericht, nicht in der Datei).
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

Rot → überarbeiten, höchstens 3 Runden; danach parken mit Befunden.
5. **Kosten** (Token für Recherche, Schreiben, Prüfung) in `spiele/mit-echten-dingen/kosten.json`, wie bei den
   Spielen (`spielentwicklung.md` §6).

## Wo es zu sehen ist

- **Karte „Mit echten Dingen“** (`<ls-anregung>`) auf der Fach-Seite und im Regal, formatiert (kleiner eigener
  Markdown-Darsteller: Überschrift, Listen, fett; der Kopf mit den Quellen wird nicht angezeigt). Fehlt die Datei,
  bleibt der bisherige Einzeiler aus dem Lernplan **(Christian)**.
- **Am Rundenende eines Spiels** als ruhiges Angebot in der Pause, neben „Alle Spiele“ und „Weiter“ (kein Muss, keine
  Belohnung, K8; der Katalog nennt das „Mach mit“) **(Christian)**.
