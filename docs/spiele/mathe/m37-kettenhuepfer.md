# M37 Kettenhüpfer – Spielentwurf

- **Katalog-Id:** M37 · **Name:** „Kettenhüpfer“ · **Fach:** Mathe · **Spielordner:** `spiele/mathe/m37-kettenhuepfer/` · Welt `vorrat-und-packungen` (Versorgen, Rätsel) · **Stand:** 2026-11-14 · **(Annahme)** = korrigierbar.
- **Weg: voller Weg** – neue Art `mal` (`aufgabenarten.js` mit `ZIEL_MS`, `aufgaben` in `lernplan.json`), Lernzeichen Perlenkette (Christian 2026-11-14), Änderungen in `spiele/rahmen/`.
- **Wiederaufnahme 2026-11-14 (Christian): neue Sachwelt Vorrat und Packungen** (statt Wiese und Hecke; Katalog und `lernplan.json` angepasst, eigener Commit).
- **Abweichungen vom Katalog-Eintrag (Grund):** (1) Es hüpft das **Zählpfeilchen** (Teil des Lernzeichens), keine Figur; Name bleibt. (2) **Figur des Spiels: Einkaufskorb**, Wirkung: Packungen kommen hinein. (3) Sanft: verwischte Zeile statt „48 Beine“ (Teilerstoff Kl. 4 im Ausbau).
  (4) Abenteuer ohne Naturschützerin (Welt wechselt). (5) Packungsgrößen sind **Setzungen des Spiels**; echte Fakten nur Paar, Woche, Cent (Abschnitt 4).

## 1. Zweck in der Spielwelt
- Das Kind füllt den Vorratskorb: Jede Malaufgabe, deren Ergebnis es tippt, bringt a Packungen in den Korb und eine Zeile auf die Vorratsliste. Ohne Ergebnis kein Pfeilchen, keine Packung.

## 2. Die Runde in fünf Sätzen
1. Auf der Matte liegt die Perlenkette von n (zehn Stäbchen zu je n Perlen), oben „6 · 7 = ▢“; links in der Welt steht der leere Korb, rechts liegt die Vorratsliste.
2. Der Erzähler stellt die Aufgabe in der Sache; die erste Aufgabe jeder Runde legt Timo vor.
3. Das Kind tippt die Zahl und bestätigt mit „Fertig“ (erst festlegen, dann sehen, L2).
4. Passt sie: Das Pfeilchen hüpft Stäbchen für Stäbchen, bei jedem fliegt eine Packung in den Korb (a Packungen), es rastet am a-ten Stäbchen ein, die Zeile mit Kurzkette steht auf der Liste.
   Passt sie nicht: Das Pfeilchen hält am a-ten Stäbchen, die getippte Zahl liegt als hohles Pfeilchen an ihrem Ort, nichts fliegt, die Aufgabe bleibt.
5. Nach etwa 8 Aufgaben ist die Liste voll, der Korb gefüllt; dann Pause.

## 3. Lernhandlung = Spielhandlung
- Ergebnis von a · n abrufen und tippen; die Kette prüft es (Wirkung erst danach). Ohne Aufgabe kein Ziel des Pfeilchens. Eine Schwierigkeit (A2): Abruf.

## 4. Sachwelt und Sachgrund
- **Eine Sache:** Dinge kommen in festen Gruppen. Ein Stäbchen = die Teile einer Packung (n), viele gleiche Packungen = die Kette. Die Packungen im Korb sind Wirkung, nie Zählmaterial (M1).
- **Je Reihe ein eigenes Ding, kein Zahlwort im Namen:**

| n | Ding (Mz.) | Teile | Grund | Objekt |
|---|---|---|---|---|
| 2 | Schuhpaar (Schuhpaare) | Schuhe | Paar = Zweiergruppe: **Fakt**, de.wikipedia.org/wiki/Paar („eine Zweiergruppe“), 2026-11-14 | `schuhpaar` vorhanden |
| 3 | Ballröhre (-röhren) | Bälle | Setzung | `ballroehre` neu |
| 4 | Gedeck (Gedecke) | Dinge (Teller, Gabel, Löffel, Becher) | Setzung, wie Anleitung viererreihe | `gedeck` vorhanden |
| 5 | Brötchentüte (-tüten) | Brötchen | Setzung, wie Anleitung fuenferreihe | `broetchen` vorhanden |
| 6 | Eierkarton (-kartons) | Eier | Setzung (sechs Mulden im Bild) | `eierkarton` vorhanden |
| 7 | Wochenschachtel (-schachteln) | Fächer | Woche = sieben Tage: **Fakt**, de.wikipedia.org/wiki/Woche („Zeiteinheit von sieben Tagen“), 2026-11-14 | `wochenschachtel` neu |
| 8 | Stiftebox (-boxen) | Stifte | Setzung | `stiftebox` neu |
| 9 | Muffinkarton (-kartons) | Muffins | Setzung (drei Reihen zu drei im Bild) | `muffinkarton` neu |
| 10 | Münze (Münzen) | Cent | Nennwert: **Fakt**, de.wikipedia.org/wiki/Euro-Münzen (Nennwerte 1, 2, 5, 10 … Cent), 2026-11-14 | `muenze` vorhanden |

- **K4:** Setzungen werden als das gesagt, was sie sind („In eine Ballröhre kommen drei Tennisbälle“ gilt in diesem Spiel), nie als Behauptung über Läden. Faktensatz der Welt (`fakten`) im Bau: Paar, Woche, Cent mit diesen Quellen.
- **A4:** Jedes Beispiel nennt sein Ding: „6 · 7“ heißt sechs Wochenschachteln, nicht Eier. Reihe 6 (Eier) und 7 (Fächer) haben verschiedene Dinge; die Frage nennt die Teile.
- **K6:** höchstens eine neue Packung je Runde; Kern-Runden ziehen höchstens zwei Ketten. Fakten stehen nur im Sachsatz am Rundenanfang (K1), nie während des Denkens.
- Nicht verwendet: Zehnerpack, Dreierpack u. Ä. (Zahlwort im Namen verwechselt sich mit a).

## 5. Figur
- **Timo** (`figuren.md` §2), nur **vorzeigen** (L5): die erste Aufgabe jeder Runde, mit Probe und Zögern (`nachdenken`, `zeigen`), danach `stehen`. Trägt die Packung auf dem Schoß. Kein Freuen, Fragen, Anstupsen.
  Platz links unten neben dem Korb, Dreiviertel zur Matte, nie im Lernfeld. Katalog gesetzt; (Annahme) Ausgleich der Vorzeige-Zählung nach `figuren.md` §8 über alle Spiele.
- **Gäste (F3, beiläufig, nicht im Lernkern):** eine Bäckerin mit Kopftuch bringt auf „abenteuer“ die Kiste, ein Hausmeister im Hintergrund.

## 6. Bildschirm-Skizze
```
┌──────────────────────────────────────────────────────────────────────────┐
│ (⌂) [Mathe] Kettenhüpfer                                            (♪)  │
│             Die 7er-Reihe                                                │
├──────────────────────────────────────────────────────────────────────────┤
│   ┌ Blase „Sechs Wochenschachteln. Wie viele Fächer sind es?“ (🔊) ┐      │
│ Welt: ┌ MATTE ───────────────────────────────────┐ ┌ VORRATSLISTE ───┐   │
│ Korb  │ 6 · 7 = [ 4 2 ]                           │ │ 3 · 7 = 21 ▪▪▪  │   │
│  🧺   │ ●●●●●╎●● ─ ●●●●●╎●● ─ … ▼7 ▼14 ▼21 …     │ │ 6 · 7 = 42      │   │
│ Timo  └──────────────────────────────────────────┘ └─────────────────┘   │
│       [0][1][2][3][4][5][6][7][8][9][⌫]  [ Fertig ]              (?)    │
└──────────────────────────────────────────────────────────────────────────┘
```
- Plätze nach `bedienung.md` §3, Hauptknopf „Fertig“. Korb in der Welt-Schicht (nicht auf dem Papier). Die Blase hat nur Sätze des Erzählers. Perlen für n = 10 aus der Mattenbreite (am Gerät prüfen), Ziffern ab 3,2 rem, Liste 8 Zeilen zu 4,4 rem.

## 7. Rückmeldung
- **Passt:** Pfeilchen hüpft, Packungen fliegen in den Korb (etwa 1,8 s, Tippen überspringt), Pfeilchen mit Zahl rastet ein, Korb wackelt satt, Zeile mit Kurzkette. Im Wechsel (B4): „So viele Packungen liegen jetzt im Korb.“ · „Das Pfeilchen zeigt, wie viele es zusammen sind.“ · „Die Zeile steht jetzt auf der Vorratsliste.“
- **Passt nicht:** Ring am a-ten Stäbchen, hohles Pfeilchen der getippten Zahl, nichts fliegt (N7), beide gleiten zurück. „Das Pfeilchen sitzt hier. Deine Zahl liegt weiter hinten.“ · „Das Pfeilchen sitzt hier. Deine Zahl liegt weiter vorn.“ · „Deine Zahl liegt hinter dem Ende der Kette.“
- **Timo legt vor:** „Timo legt die erste Aufgabe. Ein Stäbchen sind die Teile von einer Packung. Dort steht das erste Pfeilchen.“
- **Rundenanfang** (Erzähler, laut; „Der Vorratskorb wird gefüllt.“ plus je Reihe):
  2 „Ein Schuhpaar hat zwei Schuhe. Ein Stäbchen sind die Schuhe von einem Schuhpaar.“ · 3 „In eine Ballröhre kommen drei Bälle. Ein Stäbchen sind die Bälle von einer Ballröhre.“ ·
  4 „Ein Gedeck hat vier Dinge: Teller, Gabel, Löffel und Becher. Ein Stäbchen sind die Dinge von einem Gedeck.“ · 5 „In eine Brötchentüte kommen fünf Brötchen. Ein Stäbchen sind die Brötchen von einer Brötchentüte.“ ·
  6 „In einen Eierkarton kommen sechs Eier. Ein Stäbchen sind die Eier von einem Eierkarton.“ · 7 „Eine Woche hat sieben Tage. Eine Wochenschachtel hat ein Fach für jeden Tag. Ein Stäbchen sind die Fächer von einer Wochenschachtel.“ ·
  8 „In eine Stiftebox kommen acht Stifte. Ein Stäbchen sind die Stifte von einer Stiftebox.“ · 9 „In einen Muffinkarton kommen neun Muffins. Ein Stäbchen sind die Muffins von einem Muffinkarton.“ · 10 „Eine Münze ist zehn Cent wert. Ein Stäbchen sind die Cent von einer Münze.“
- **Auftrag** (Muster aus Daten, a als Zahlwort; erste laut, dann still): „Sechs Wochenschachteln. Wie viele Fächer sind es zusammen?“ · „Ein Eierkarton. Wie viele Eier sind es?“ Alle Stufen gleich; „6 · 7 = ▢“ steht im Bild.
- **Rundenende:** „Die Vorratsliste ist voll. Im Korb liegen die Packungen.“ (Kern: „Die Vorratsliste ist voll. Der Vorrat ist eingeräumt.“)
- **Sanft (Annahme, Standard):** Die letzte Zeile ist verwischt: Von ihr steht die Aufgabe „a · n = ▢“ mit Kurzkette, das Ergebnis fehlt. Das Kind tippt es neu, danach steht sie wieder da; nur eine Aufgabe mehr, still bei Fehlern.
  „Auf der Liste ist eine Zeile verwischt. Die Kette darunter zeigt, wohin sie gehört.“
- **Abenteuer (nur auf Wunsch, Bogen über mehrere Runden, Annahme; Vorrat fürs Schulfest).** Jede Runde endet hell, in Ruhe, aufgelöst: 1 „Am Lagertor klopft es. Der Lieferwagen steht davor und fährt weiter.“ · 2 „Die Bäckerin bringt eine Kiste Brötchen und winkt.“ ·
  3 „Die Regale der Schulküche füllen sich.“ · 4 „Das Regal der Schulküche ist voll. Das Fest kann beginnen.“ Spannung Rätsel (4.7), keine Gefahr, keine Zeitgrenze.
- **Vorschau für Eltern (9.3):** Ruhig: Der Vorratskorb wird mit Packungen gefüllt, Zeile für Zeile. Sanft: Eine Zeile der Liste ist verwischt; das Kind schreibt sie neu. Abenteuer: Vorrat fürs Schulfest, Lieferungen kommen und gehen.
- **Mach mit (Pause, Angebot):** „Lena legt eine Kette aus Büroklammern. Frag jemanden, ob ihr eine Kette aus Klammern in Fünfern legt.“

## 8. Hilfe-Leiter
Nach dem zweiten Versuch, der nicht passt, leuchtet Hilfe einmal; mit Hilfe Gelöstes zählt nicht als gekonnt (L12). Die Probe ist **nie Hochzählen**, sondern geht über eine Kernaufgabe; Begriffe nach §5.1. Zahlen stehen im Bild, die Sätze sind fest.
- **Stufe 1, Probe** (Pfeilchen der Kernaufgabe mit Sonnenring):
  - a ∈ {3, 4, 6, 9}, **Nachbaraufgabe** (ein Stäbchen Abstand: 3 → 2, 4 → 5, 6 → 5, 9 → 10): „Das Pfeilchen zeigt eine Kernaufgabe. Deine Aufgabe ist ihre Nachbaraufgabe. Wie viele Stäbchen liegen dazwischen?“
  - a ∈ {7, 8}, **zwei Stäbchen Abstand** (7 von 5, 8 von 10; keine Nachbaraufgabe): „Das Pfeilchen zeigt eine Kernaufgabe. Von dort sind es zwei Stäbchen. Wie viele Perlen liegen auf zwei Stäbchen?“
  - a = 5: „Das Pfeilchen zeigt die Kernaufgabe mit zehn Stäbchen. Fünf Stäbchen sind die Hälfte von zehn. Wie viel ist die Hälfte?“ · a = 2: „Das Pfeilchen zeigt das erste Stäbchen. Das zweite Stäbchen ist genauso. Wie viel ist das Doppelte?“
  - a = 10: „Die Tauschaufgabe steht im Bild. Wie viele Zehnerstäbe sind es?“ · a = 1: „Ein Stäbchen. Wie viele Perlen liegen darauf?“
- **Stufe 2, Lösung mit Begründung** (Taste mit Sonnenring, Ringe zwischen Kernpfeilchen und Ziel, im Bild z. B. „35 + 7“):
  - Nachbaraufgabe vor: „Von der Kernaufgabe geht es ein Stäbchen weiter. Zum Ergebnis kommen die Perlen von einem Stäbchen dazu. Tipp die Zahl am Pfeilchen.“ · zurück: „Von der Kernaufgabe geht es ein Stäbchen zurück. Vom Ergebnis gehen die Perlen von einem Stäbchen weg. Tipp die Zahl am Pfeilchen.“
  - a = 7: „Von der Kernaufgabe geht es zwei Stäbchen weiter. Zum Ergebnis kommen die Perlen von zwei Stäbchen dazu. Tipp die Zahl am Pfeilchen.“ · a = 8: „Von der Kernaufgabe geht es zwei Stäbchen zurück. Vom Ergebnis gehen die Perlen von zwei Stäbchen weg. Tipp die Zahl am Pfeilchen.“
  - a = 5: „Das Ergebnis der Kernaufgabe ist am zehnten Stäbchen. Die Hälfte davon gehört zum fünften Stäbchen. Tipp die Zahl am Pfeilchen.“ · a = 2: „Das zweite Stäbchen hat genauso viele Perlen wie das erste. Das Ergebnis ist das Doppelte. Tipp die Zahl am Pfeilchen.“
  - a = 10: „Zehn Stäbchen sind so viele Perlen wie Zehnerstäbe in der Tauschaufgabe. Tipp die Zahl am Pfeilchen.“ · a = 1: „Ein Stäbchen. Die Perlen darauf sind das Ergebnis. Tipp die Zahl am Pfeilchen.“

## 9. Stufen
- **material:** Kette offen, jede Perle einzeln, Fünfermarke (M2). **vorstellung:** Perlen unter dem Tuch, nur Stäbchengrenzen sichtbar; nach der Eingabe hebt sich das Tuch. **kopf:** nur Aufgabe und Liste; die Kette erscheint nach der Eingabe.
- **Das Gelernte bleibt (A6b):** Nach der Wirkung bleiben Kette und Pfeilchen bis zur nächsten Aufgabe (in kopf die Kurzkette der Zeile), die Zeile bis Rundenende. **Reihen:** feste Kette n, die Pfeilchen sammeln sich. **Kern:** auf der Matte die Kette der laufenden Aufgabe, jede gelöste als Zeile „a · n = c“ mit Kurzkette.
- **Gebaut (voller Weg):** zweierreihe, zehnerreihe, fuenferreihe, kernaufgaben-einmaleins, dann dreier- bis neunerreihe, alle Stufen, ruhig und Sanft. **Ausbau:** Teilen (Art `geteilt`), Teiler, Abenteuer-Bogen, `einmaleins-gemischt`.

## 10. Aufgabenschlüssel und arten
- **Art `mal`** (wiederverwendbar für M35/M36, nichts Spieleigenes): Schlüssel `mal:<a>*<n>`, daten `{ a, b: n, c }`, c = a·n. Pools ohne Überschneidung (Test): Reihen 2, 5, 10 mit a = 1–10; Reihen 3, 4, 6, 7, 8, 9 mit a ∈ {3, 4, 6, 7, 8, 9};
  Kern a ∈ {1, 2, 5, 10}, n ∈ {3, 4, 6, 7, 8, 9}. Zusammen alle 90 Aufgaben a·n (a 1–10, n 2–10), auch 1·9, 2·9, 5·9, 10·9. **`ZIEL_MS.mal` = 8000** (Annahme); `schwierigkeit`: Kernfaktor 0, a ∈ {3, 4, 6, 9} 1, a ∈ {7, 8} 2; `darstellbar`: `reihen: [von, bis]` gegen `daten.b`.
- **Fehlerbilder:** `einmaleins-nachbar` vergleicht mit a·(n ± 1) und (a ± 1)·n; `einmaleins-hochzaehlen` meint die Schrittzahl `daten.a` (Regel „zeit-steigung-zweiter-faktor“ in `lernplan.json`: Id und Beschreibung zusammen auf „Schrittzahl a“, im Bau per Suche bestätigen).
- **`lernplan.json`:** `aufgaben` `{ art: "mal", reihe: n }` für die neun Reihen, `{ art: "mal", kern: true }` für `kernaufgaben-einmaleins`; `einfuehrung` zeigt auf `mathe/m37-kettenhuepfer/einfuehrung.json` (eigene Einführung in der Welt, A4b). Welt `vorrat-und-packungen` angelegt; `fakten` im Bau. **`spiele.json`:** `arten: [{ art: "mal", reihen: [2, 10], stufen: [material, vorstellung, kopf] }]`.
- **Meldung:** je Aufgabe `ok`, `hilfe`, `ms`; Fehlversuche mit der getippten Zahl. Test-Schnittstelle: Ziffer, Löschen, Fertig; `fehlversuche: true`. Elternansicht: welche Reihen zuletzt, ohne Vergleich (3.3).

## 11. Spielobjekte
- **Wirkung (je Reihe ein Ding, Abschnitt 4):** vorhanden `schuhpaar`, `gedeck`, `broetchen`, `eierkarton`, `muenze`; neu in `spiele/objekte/` (wiederverwendbar): `ballroehre`, `wochenschachtel` (sieben Fächer), `stiftebox` (acht Stifte), `muffinkarton` (3 × 3). Bewegung: fliegt in den Korb, ohne Ziffer und Schrift.
- **Figur des Spiels: `einkaufskorb`** (neu, `spiele/objekte/einkaufskorb.js`), Zustände `leer`, `gefuellt`; Bewegung: Packung fällt hinein, Korb wackelt satt.
- **Karte:** `karte: { figur: "einkaufskorb", zustand: "gefuellt", welt: "vorrat-und-packungen" }`; typischer Moment: Korb mit herausschauenden Packungen. **Silhouette (KB3):** breit und flach mit hohem Henkelbogen; die Tonne von M14 ist schmal, hoch, mit Deckel. In `spiele.json` hat Mathe sonst keine Karte mit diesem Bild; `(einkaufskorb, vorrat-und-packungen, gefuellt)` ist im Fach frei. Kein Kind, keine Perle, keine Ziffer. Spielsymbol `symbol.svg` = Henkel mit Korbrand.
- **Regal:** `regal: { objekt: "einkaufskorb", wert: null }`; bei den Reihen-Themen (zweier- bis neunerreihe, Kern) steht vorn die Perlenkette n (neue Regel in `material.js`, Art `mal` mit `reihe`), der Korb erst bei den übrigen Themen des Spiels (Teilen, Teiler, gemischt).

## Bausteine
- **Vorhanden:** `<ls-leiste>`, `<ls-blase>`, `<ls-hilfe>`, `<ls-pause>`, `<ls-knopf>`, `<ls-tastatur>`, `<ls-perlenstab>` (Zehnerstäbe der Hilfe); Geste nur Tippen; Objekte `schuhpaar`, `gedeck`, `broetchen`, `eierkarton`, `muenze` (`spiele/objekte/`); Figur Timo (`spiele/runde/`).
- **Neu:** Lernzeichen `<ls-perlenkette>` in `spiele/rahmen/` (Attribute `reihe`, `pfeile`, `verdeckt`, `kurz`; Einträge in `grundsaetze-bilder.md` §4, `bedienung.md` §9, Regal-Regel); Art `mal`; Objekte `einkaufskorb`, `ballroehre`, `wochenschachtel`, `stiftebox`, `muffinkarton`; Welt in `lernplan.json`.
- Die Vorratsliste ist kein neues Lernzeichen: Zeilen aus `<ls-perlenkette kurz>` und Gleichung. `kern/`, `lernsteuerung.js` und der RAHMEN der Vorlage bleiben; Einführung über `EINFUEHRUNG`.

## Freigabe nötig (Christian)
- Keine neue Frage: Perlenkette, Art `mal` und die Welt deckt Christians Auftrag (2026-11-14). **(Annahme)** zur Kenntnis: neun Packungen mit je eigenem Ding, davon vier neue Objekte und die Figur `einkaufskorb`.

## Selbstprüfung `grundsaetze.md` §12
Zweck (Korb füllen), eine Schwierigkeit (Abruf), Abruf vor dem Sehen, Mechanik zeigt den Ort, Fehler-Folge stiller, Hilfe über Kernaufgaben (nie Hochzählen, Begriffe stimmen), Wiedervorlage über die Lernsteuerung, erst zeigen (Timo), keine Punkte oder Timer,
Geschichte ruhig mit Elternvorschau und hellem Rundenschluss, Sachthema am Sachgrund (K1, K2), Fakten mit Quelle, Setzungen benannt (K4), Sätze ohne Wörter aus 3.2, Fachbegriffe nach 5.1, Gäste und Bestand beiläufig (A12 Soll).
