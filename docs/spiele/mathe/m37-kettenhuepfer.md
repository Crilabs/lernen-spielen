# M37 Kettenhüpfer – Spielentwurf

- **Katalog-Id:** M37 · **Name:** „Kettenhüpfer“ · **Fach:** Mathe · **Spielordner:** `spiele/mathe/m37-kettenhuepfer/` · Welt `vorrat-und-packungen` (Versorgen, Rätsel) · **Stand:** 2026-11-14 · **(Annahme)** = korrigierbar.
- **Weg: voller Weg** – neue Art `mal` (`aufgabenarten.js` mit `ZIEL_MS`, `aufgaben` in `lernplan.json`), Lernzeichen Perlenkette (Christian 2026-11-14), Änderungen in `spiele/rahmen/`.
- **Wiederaufnahme 2026-11-14 (Christian): neue Sachwelt Vorrat und Packungen** (statt Wiese und Hecke; Katalog und `lernplan.json` angepasst, eigener Commit).
- **Abweichungen vom Katalog-Eintrag (Grund):** (1) Es hüpft das **Zählpfeilchen** (Teil des Lernzeichens), keine Figur; Name bleibt. (2) **Figur des Spiels: Einkaufskorb**, Wirkung: Packungen kommen hinein. (3) Sanft: verwischte Zeile statt „48 Beine“ (Teilerstoff Kl. 4 im Ausbau).
  (4) Abenteuer ohne Naturschützerin (Welt wechselt). (5) Packungsgrößen sind **Setzungen des Spiels**; echte Fakten nur Paar, Woche, Cent (Abschnitt 4).

## 1. Zweck in der Spielwelt
- Das Kind füllt den Vorratskorb: Jede Malaufgabe, deren Ergebnis es tippt, bringt a Packungen in den Korb und eine Zeile auf die Vorratsliste. Ohne Ergebnis kein Pfeilchen, keine Packung.

## 2. Die Runde in fünf Sätzen
1. Auf der Matte liegt die Perlenkette von n (zehn Stäbchen zu je n Perlen), oben „6 · 7 = ▢“; links in der Welt steht auf dem Vorratsregal in Ruhe das Ding der Reihe (Sachbild, kein Zählmaterial), darunter auf dem Boden Timo und der leere Korb; rechts liegt die Vorratsliste.
2. Der Erzähler stellt die Aufgabe in der Sache; zu Beginn jeder Runde legt Timo eine Aufgabe vor (1 · n, wenn die erste Aufgabe selbst 1 · n ist: 10 · n), danach bekommt das Kind jede Aufgabe der Lernsteuerung.
3. Das Kind tippt die Zahl und bestätigt mit „Fertig“ (erst festlegen, dann sehen, L2).
4. Passt sie: Das Pfeilchen hüpft Stäbchen für Stäbchen, bei jedem fliegt eine Packung in den Korb (a Packungen), es rastet am a-ten Stäbchen ein, die Zeile mit Kurzkette steht auf der Liste; ist die letzte Packung gelandet, liegt das Ding der Reihe im Korb (plumpst, rutscht oder hüpft hinein).
   Passt sie nicht: Das Pfeilchen hält am a-ten Stäbchen, die getippte Zahl liegt als hohles Pfeilchen an ihrem Ort, nichts fliegt, die Aufgabe bleibt.
5. Jede Lösung legt eine Packung ihrer Reihe in den Korb (Zahl = Lösungen samt Timos, bleibt stehen, auch bei wenig Bewegung). Nach 8 Aufgaben (`AUFGABEN_JE_RUNDE`) ist die Liste voll, der Korb gefüllt; dann Pause.
6. **Wiederholt sich eine Aufgabe in der Runde** (die Lernsteuerung holt sie nach einem Fehlversuch zurück; Reihen 3, 4, 6–9 haben nur sechs Aufgaben), steht nichts von ihrem Ergebnis da: Ihre alte Zeile ist **verdeckt** (nur die Kurzkette ohne Zahl), das alte Pfeilchen **leer** (kein Wert), bis das Kind getippt hat; dann erscheinen sie wieder. So gibt es nie etwas zum Ablesen (L1), und die Lernsteuerung bucht „richtig ohne Hilfe“ zu Recht. Gilt in allen Stufen, auch in `kopf` (Liste). Nach einem Fehlversuch trägt das Pfeilchen seine Zahl nicht; in `vorstellung` und `kopf` bleiben die Perlen verdeckt, nur Stäbchengrenzen und der Ring am a-ten Stäbchen sind zu sehen.

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
| 10 | Zehn-Cent-Münze (-Münzen) | Cent | Nennwert: **Fakt**, de.wikipedia.org/wiki/Euro-Münzen (Nennwerte 1, 2, 5, 10 … Cent; es gibt eine Zehn-Cent-Münze), 2026-11-14 | `muenze`, Variante `zehn-cent` mit Prägung „10“ (neu, wie echt) |

- **K4, K11:** Setzungen beginnen mit „Hier“ und sagen so, dass es die Regel des Spiels ist, nie eine Behauptung über Läden; **nur Paar, Woche und Zehn-Cent-Münze** sind Fakten, sie tragen das Echt-Zeichen („In echt …“, `grundsaetze-bilder.md` §4) und stehen in `fakten` der Welt mit diesen Quellen.
- **A4:** Jedes Beispiel nennt sein Ding: „6 · 7“ heißt sechs Wochenschachteln, nicht Eier; die Frage nennt die Teile.
- **Ding-Bindung (`lernsteuerung.js` bleibt):** Die Lernsteuerung mischt Aufgaben anderer Reihen ein und zieht in Kern-Runden alle sechs n. Das Spiel liest je Aufgabe `daten.b` = n und stellt auf **die Kette dieser Aufgabe** um (Matte, Ding, Korbpackung). Wechselt n gegenüber der Aufgabe davor, sagt der Erzähler den **Wechselsatz** (Abschnitt 7), die Matte leert sich, die Liste behält ihre Zeilen. Eine Obergrenze für Ketten je Runde gibt es nicht **(Annahme, „höchstens zwei Ketten“ entfällt)**; Kern-Runden zeigen Aufgabe für Aufgabe ihre Kette.
- **K6 (ein neuer Fakt je Runde):** Ein Faktensatz kommt nur am Rundenanfang einer **Reihen-Runde der eigenen Reihe** (2, 7, 10), also höchstens einer je Runde, nie in Kern-Runden und nie im Wechselsatz; dort stehen nur Setzungs-Sätze ohne Fakt, die K6 nicht zählt. Fakten nie während des Denkens (K1).
- Nicht verwendet: Zehnerpack, Dreierpack u. Ä. (Zahlwort im Namen verwechselt sich mit a); „Zehn-Cent-Münze“ nennt n, nicht a, und ist die einzige Ausnahme, weil der Name der echten Münze gilt.

## 5. Figur
- **Timo** (`figuren.md` §2), nur **vorzeigen** (L5): zu Beginn jeder Runde 1 · n auf der Kette der ersten Aufgabe (ist sie selbst 1 · n: 10 · n), mit Probe und Zögern (`nachdenken`, `zeigen`): Er hält die Hand über dem Kernpfeilchen, tippt dann die Zahl, danach `stehen`. Trägt die Packung auf dem Schoß. Kein Freuen, Fragen, Anstupsen.
  Platz links unten auf dem Boden neben dem Korb, Dreiviertel zur Matte, nie im Lernfeld. Er dreht sich in „stehen“ zurück, bevor die erste Aufgabe des Kindes erscheint (B3); bei wenig Bewegung springen die Haltungen, die Standzeiten bleiben (Vorzeigen sichtbar). Paket auf dem Schoß: Ausbau. Katalog gesetzt; (Annahme) Ausgleich der Vorzeige-Zählung nach `figuren.md` §8 über alle Spiele.
- **Gäste (F3, beiläufig, nicht im Lernkern):** eine Bäckerin mit Kopftuch bringt auf „abenteuer“ die Kiste, eine Hausmeisterin im Hintergrund (Berufe gegen das Klischee, `grundsaetze.md` 6.1 Nr. 1).

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
- **Passt:** Pfeilchen hüpft, Packungen fliegen in den Korb, Pfeilchen mit Zahl rastet ein, Korb wackelt satt, Zeile mit Kurzkette; danach kommt das Ding der Reihe in den Korb, in einer von drei Varianten (plumpst, rutscht von der Seite, hüpft noch einmal auf; zufällig, alle gleich ruhig, W-Freude). Zusammen bis etwa 2,8 s (`FOLGE_MS`), Tippen überspringt. Im Wechsel (B4): „So viele Packungen liegen jetzt im Korb.“ · „Das Pfeilchen zeigt, wie viele es zusammen sind.“ · „Die Zeile steht jetzt auf der Vorratsliste.“
- **Passt nicht:** Ring am a-ten Stäbchen, hohles Pfeilchen der getippten Zahl, nichts fliegt (N7); das Bild bleibt still stehen, bis das Kind die nächste Taste tippt (statt „beide gleiten zurück“: ein Zurückgleiten von selbst wäre Bewegung, während das Kind denkt, B3). „Das Pfeilchen sitzt hier. Deine Zahl liegt weiter hinten.“ · „Das Pfeilchen sitzt hier. Deine Zahl liegt weiter vorn.“ · „Deine Zahl liegt hinter dem Ende der Kette.“
- **Timo legt vor:** „Timo überlegt und tippt die Zahl. Das Pfeilchen hüpft und rastet ein. Ein Stäbchen sind die Teile von einer Packung.“ (Er prüft erst am Kernpfeilchen, zögert kurz, tippt die richtige Zahl; sonst nichts.)
- **Rundenanfang** (Erzähler, laut; „Der Vorratskorb wird gefüllt.“ plus je Reihe; Fakten mit Echt-Zeichen):
  2 „In echt hat ein Schuhpaar zwei Schuhe. Ein Stäbchen sind die Schuhe von einem Schuhpaar.“ · 3 „Hier kommen in eine Ballröhre drei Bälle. Ein Stäbchen sind die Bälle von einer Ballröhre.“ ·
  4 „Hier hat ein Gedeck vier Dinge: Teller, Gabel, Löffel und Becher. Ein Stäbchen sind die Dinge von einem Gedeck.“ · 5 „Hier kommen in eine Brötchentüte fünf Brötchen. Ein Stäbchen sind die Brötchen von einer Brötchentüte.“ ·
  6 „Hier kommen in einen Eierkarton sechs Eier. Ein Stäbchen sind die Eier von einem Eierkarton.“ · 7 „In echt hat eine Woche sieben Tage. Hier hat eine Wochenschachtel ein Fach für jeden Tag. Ein Stäbchen sind die Fächer von einer Wochenschachtel.“ ·
  8 „Hier kommen in eine Stiftebox acht Stifte. Ein Stäbchen sind die Stifte von einer Stiftebox.“ · 9 „Hier kommen in einen Muffinkarton neun Muffins. Ein Stäbchen sind die Muffins von einem Muffinkarton.“ · 10 „In echt ist eine Zehn-Cent-Münze zehn Cent wert. Ein Stäbchen sind die Cent von einer Zehn-Cent-Münze.“
  In Kern-Runden und bei fremdem n (Thema der Runde ist nicht die Reihe von n, z. B. Wiederholung) statt „In echt“ die Setzung: 2 „Hier hat ein Schuhpaar zwei Schuhe.“ · 7 „Hier hat eine Wochenschachtel sieben Fächer.“ · 10 „Hier hat eine Zehn-Cent-Münze zehn Cent.“ (Rest wie oben).
- **Wechselsatz** (n ändert sich, Muster aus Daten, nie ein Fakt): „Jetzt sind es Eierkartons. Ein Stäbchen sind die Eier von einem Eierkarton.“ Er kommt **vor** der Aufgabe: Matte leer, das neue Ding auf dem Regal, der Satz steht (gesprochen, mindestens 2,4 s, Tippen kürzt ab); erst dann erscheint die Aufgabe und ihr Auftrag wird laut gesagt. Ab da ändert sich die Blase nicht mehr von selbst (B3).
- **Auftrag** (Muster aus Daten, a als Zahlwort; Vorlage mit allen 9 Dingen × 10 Zahlwörtern in `inhalte/vorlagen.json`, Einzahl mit Artikel, Mehrzahl mit „zusammen“, `stimme.md` §3; erste laut, dann still): „Sechs Wochenschachteln. Wie viele Fächer sind es zusammen?“ · „Ein Eierkarton. Wie viele Eier sind es?“ Alle Stufen gleich; „6 · 7 = ▢“ steht im Bild.
- **Rundenende** (vor der Pause, Korb mit seinem Füllstand im Bild): „Die Vorratsliste ist voll. Im Korb liegen die Packungen.“ (Kern: „Die Vorratsliste ist voll. Der Vorrat ist eingeräumt.“) Endet die Runde früher (gekonnt, Zeit), ohne den ersten Satz **(Annahme)**.
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
- **Stufe 2, Lösung mit Begründung** (Taste mit Sonnenring, Ringe zwischen Kernpfeilchen und Ziel, im Bild z. B. „35 + 7 = ▢“; das Kind rechnet selbst, das Ergebnis steht nicht am Pfeilchen, L12):
  - Nachbaraufgabe vor: „Von der Kernaufgabe geht es ein Stäbchen weiter. Zum Ergebnis kommen die Perlen von einem Stäbchen dazu. Rechne es aus und tipp die Zahl.“ · zurück: „Von der Kernaufgabe geht es ein Stäbchen zurück. Vom Ergebnis gehen die Perlen von einem Stäbchen weg. Rechne es aus und tipp die Zahl.“
  - a = 7: „Von der Kernaufgabe geht es zwei Stäbchen weiter. Zum Ergebnis kommen die Perlen von zwei Stäbchen dazu. Rechne es aus und tipp die Zahl.“ · a = 8: „Von der Kernaufgabe geht es zwei Stäbchen zurück. Vom Ergebnis gehen die Perlen von zwei Stäbchen weg. Rechne es aus und tipp die Zahl.“
  - a = 5: „Das Ergebnis der Kernaufgabe ist am zehnten Stäbchen. Die Hälfte davon gehört zum fünften Stäbchen. Rechne es aus und tipp die Zahl.“ · a = 2: „Das zweite Stäbchen hat genauso viele Perlen wie das erste. Das Ergebnis ist das Doppelte. Rechne es aus und tipp die Zahl.“
  - a = 10: „Zehn Stäbchen sind so viele Perlen wie die Zehnerstäbe in der Tauschaufgabe zusammen. Rechne es aus und tipp die Zahl.“ · a = 1: „Ein Stäbchen. Die Perlen darauf sind das Ergebnis. Rechne es aus und tipp die Zahl.“

## 9. Stufen
- **material:** Kette offen, jede Perle einzeln, Fünfermarke (M2). **vorstellung:** Perlen unter dem Tuch, nur Stäbchengrenzen sichtbar; nach der Eingabe hebt sich das Tuch. **kopf:** nur Aufgabe und Liste; die Kette erscheint nach der Eingabe.
- **Das Gelernte bleibt (A6b):** Nach der Wirkung bleiben Kette und Pfeilchen bis zur nächsten Aufgabe (in kopf die Kurzkette der Zeile), die Zeile bis Rundenende (außer bei Wiederholung der Aufgabe, Satz 6 der Runde). **Reihen:** feste Kette n, die Pfeilchen sammeln sich. **Kern:** auf der Matte die Kette der laufenden Aufgabe, jede gelöste als Zeile „a · n = c“ mit Kurzkette.
- **Gebaut (voller Weg):** zweierreihe, zehnerreihe, fuenferreihe, kernaufgaben-einmaleins, dann dreier- bis neunerreihe, alle Stufen, ruhig und Sanft. **Ausbau:** Teilen (Art `geteilt`), Teiler, Abenteuer-Bogen, `einmaleins-gemischt`.

## 10. Aufgabenschlüssel und arten
- **Art `mal`** (wiederverwendbar für M35/M36, nichts Spieleigenes): Schlüssel `mal:<a>*<n>`, daten `{ a, b: n, c }`, c = a·n. Pools ohne Überschneidung (Test): Reihen 2, 5, 10 mit a = 1–10; Reihen 3, 4, 6, 7, 8, 9 mit a ∈ {3, 4, 6, 7, 8, 9};
  Kern a ∈ {1, 2, 5, 10}, n ∈ {3, 4, 6, 7, 8, 9}. Zusammen alle 90 Aufgaben a·n (a 1–10, n 2–10), auch 1·9, 2·9, 5·9, 10·9. **`ZIEL_MS.mal` = 8000** (Annahme); `schwierigkeit`: Kernfaktor 0, a ∈ {3, 4, 6, 9} 1, a ∈ {7, 8} 2; `darstellbar`: `reihen: [von, bis]` gegen `daten.b`. Buchung wie jede Art: `ok` ohne `hilfe` zählt; Satz 6 der Runde sichert, dass bei Wiederholung nichts ablesbar ist.
- **Fehlerbilder:** `einmaleins-nachbar` vergleicht mit a·(n ± 1) und (a ± 1)·n; `einmaleins-hochzaehlen` meint die Schrittzahl `daten.a` (Regel „zeit-steigung-zweiter-faktor“ in `lernplan.json`: Id und Beschreibung zusammen auf „Schrittzahl a“, im Bau per Suche bestätigen).
- **`lernplan.json`:** `aufgaben` `{ art: "mal", reihe: n }` für die neun Reihen, `{ art: "mal", kern: true }` für `kernaufgaben-einmaleins`; `einfuehrung` zeigt auf `mathe/m37-kettenhuepfer/einfuehrung.json` (eigene Einführung in der Welt, A4b). Welt `vorrat-und-packungen` angelegt; `fakten` im Bau. **`spiele.json`:** `arten: [{ art: "mal", reihen: [2, 10], stufen: [material, vorstellung, kopf] }]`.
- **Meldung:** je Aufgabe `ok`, `hilfe`, `ms`; Fehlversuche mit der getippten Zahl. Test-Schnittstelle: Ziffer, Löschen, Fertig; `fehlversuche: true`. Elternansicht: welche Reihen zuletzt, ohne Vergleich (3.3).

## 11. Spielobjekte
- **Wirkung (je Reihe ein Ding, Abschnitt 4):** vorhanden `schuhpaar`, `gedeck`, `broetchen`, `eierkarton`, `muenze` (Variante `zehn-cent` mit „10“, einziges Objekt mit Ziffer, wie die echte Münze); neu in `spiele/objekte/` (wiederverwendbar): `ballroehre`, `wochenschachtel` (sieben Fächer), `stiftebox` (acht Stifte), `muffinkarton` (3 × 3). Bewegung: fliegt in den Korb, sonst ohne Ziffer und Schrift.
- **Figur des Spiels: `einkaufskorb`** (neu, `spiele/objekte/einkaufskorb.js`), Zustände `leer`, `1` … `8` (Füllstand: so viele Packungen schauen heraus), `gefuellt` (= 8, Karte); Bewegung: die neue Packung sinkt hinein, Korb wackelt satt; Anstoß beim Einwurf. Farben nur aus Palette „Werkstatt“ und Tokens (Weide = Kante, Tüte = Ahorn), keine Lernzeichenfarben.
- **Vorratsregal:** ~~links oben in der Welt~~ im Ausbau die Fensterbank des Szenenbilds, darauf das Ding der laufenden Reihe in Ruhe (`<ls-objekt>`).
- **Karte:** `karte: { figur: "einkaufskorb", zustand: "gefuellt", welt: "vorrat-und-packungen" }`; typischer Moment: Korb mit herausschauenden Packungen. **Silhouette (KB3):** breit und flach mit hohem Henkelbogen; die Tonne von M14 ist schmal, hoch, mit Deckel. In `spiele.json` hat Mathe sonst keine Karte mit diesem Bild; `(einkaufskorb, vorrat-und-packungen, gefuellt)` ist im Fach frei. Kein Kind, keine Perle, keine Ziffer. Spielsymbol `symbol.svg` = Henkel mit Korbrand.
- **Regal:** `regal: { objekt: "einkaufskorb", wert: null }`; bei den Reihen-Themen (zweier- bis neunerreihe, Kern) steht vorn die Perlenkette n (neue Regel in `material.js`, Art `mal` mit `reihe`), der Korb erst bei den übrigen Themen des Spiels (Teilen, Teiler, gemischt).

## Bausteine
- **Vorhanden:** `<ls-leiste>`, `<ls-blase>`, `<ls-hilfe>`, `<ls-pause>`, `<ls-knopf>`, `<ls-tastatur>`, `<ls-perlenstab>` (Zehnerstäbe der Hilfe); Geste nur Tippen; Objekte `schuhpaar`, `gedeck`, `broetchen`, `eierkarton`, `muenze` (`spiele/objekte/`); Figur Timo (`spiele/runde/`).
- **Neu:** Lernzeichen `<ls-perlenkette>` in `spiele/rahmen/` (Attribute `reihe`, `pfeile`, `verdeckt`, `kurz`; Einträge in `grundsaetze-bilder.md` §4, `bedienung.md` §9, Regal-Regel); Art `mal`; Objekte `einkaufskorb`, `ballroehre`, `wochenschachtel`, `stiftebox`, `muffinkarton`; Welt in `lernplan.json`.
- Die Vorratsliste ist kein neues Lernzeichen: Zeilen aus `<ls-perlenkette kurz>` und Gleichung. `kern/`, `lernsteuerung.js` und der RAHMEN der Vorlage bleiben; Einführung über `EINFUEHRUNG`.

## Prototyp (Bau 2026-11-14)
- **Gebaut:** eine Stufe (`material`), eine Runde über die echte Lernsteuerung (Art `mal`, `spiele.json` `kettenhuepfer` mit `stufen: [material]`); Systemstimme, kein Bild. `<ls-perlenkette>` (`spiele/rahmen/perlenkette.js`, Geometrie `perlenkette()` in `perlen-geometrie.js`), Objekt `einkaufskorb`, Sätze aus Daten in `texte.json` (alle 90 Aufträge ausgeschrieben), feste Sätze im Aufruf `blase.sage`.
- **(Annahme) Timo legt 1 · n vor** (statt der ersten Aufgabe der Lernsteuerung, die dann dem Kind fehlen und falsch gebucht würde): Rundenanfang, Timo denkt nach, zeigt, tippt n, das Pfeilchen hüpft auf das erste Stäbchen, Zeile „1 · n = n“. Zählt nicht. Ist die erste Aufgabe selbst 1 · n, legt er 10 · n vor (Runde 2, unten). Dafür eine Zeile im RAHMEN (`await vorzeigen(aufgabe)` vor der ersten Aufgabe), damit die Zeit der Aufgabe erst danach läuft; Kandidat für die Vorlage.
- **(Annahme) Gemeldet wird beim Tippen auf Fertig;** Hüpfen und Flüge laufen in der Folge (sonst zählte die Animation zu `ms`).
- **(Annahme) Kernpfeilchen:** nur das von Timo (1 · n) steht von Anfang an mit Zahl; weitere zeigt die Hilfe Stufe 1. Das Pfeilchen der laufenden Aufgabe ist immer ohne Zahl; eine wiederholte Zeile der Liste zeigt „a · n = ▢“, bis getippt ist (Satz 6).
- **(Annahme) Kurzkette der Liste** als Stäbe in der Farbe von n, ohne Einzelperlen (wiedererkennen, nicht zählen; auch in `kopf`). Nach Prüfstand B, Runde 2: in zwei Reihen zu fünf wie die große Kette, **gemeinsamer Maßstab** (jeder Stab ein Fünftel der Spalte, 16 rem, für jedes n gleich: die Länge zählt die Packungen a, 1 · 10 ist ein Stab, 10 · 10 sind zehn; die Farbe zeigt n), Lücke 0,8 rem (drei Konturen), Stab 2,6 × 1,3 rem; Liste 44 rem breit, damit „10 · 10 = 100“ in einer Zeile steht (Matte 6 rem schmaler).
- **(Annahme) Passt-Satz** „Alles liegt jetzt im Korb.“ statt „So viele Packungen …“ (passte nicht zu Münzen und Schuhpaaren, Hinweis A4).
- **(Annahme) Welt-Palette** „Werkstatt“ (6.2), bis Vorrat und Packungen eine eigene hat; Kette in zwei Reihen zu fünf, beide von links nach rechts.
- **Nach Prüfstand B, Runde 1:** (1) Die Lösung ändert Stäbchen, Zeile und Korb **sofort**; nur das Bild der Kette folgt dem Hüpfen und wird beim Überspringen synchron gesetzt, ein später Rückruf ändert nichts mehr (vorher überschrieb er die Kette der nächsten Aufgabe; Test `tests/browser/m37-kettenhuepfer.spec.mjs`). Beim Überspringen startet kein Flug mehr.
  (2) ~~Timos Aufgabe 1 · n stellt die Runde dem Kind nicht~~ (ersetzt nach Runde 2, siehe unten). (3) Rundenanfang wählt den Fakt nach dem Thema der Runde, nicht der ersten Aufgabe.
- **Nach Prüfstand B, Runde 2:**
  (1) **Keine Lieferung wird verworfen.** Das Verwerfen von 1 · n (`ohneVorgezeigt`) kürzte die Runde, hob `sitzung.letzte` auf (dieselbe Aufgabe direkt hintereinander, als gekonnt gebucht) und hielt 1 · n auf Fach 0. Jetzt bekommt das Kind jede Lieferung; **(Annahme)** Timo zeigt 1 · n auf der Kette der ersten Aufgabe vor, ist die erste Aufgabe selbst 1 · n, zeigt er 10 · n (`logik.js` `vorzeigeAufgabe`). Die erste Aufgabe des Kindes ist so nie Timos; kommt Timos Aufgabe später, ist sein Pfeilchen leer und seine Zeile verdeckt (§2 Satz 6), es gibt nichts abzulesen. Test: `tests/spiele/mathe/m37-kettenhuepfer.test.mjs` (viele Runden und Tage mit der echten Lernsteuerung: 8 Aufgaben je Runde, keine direkt doppelt, 1 · n kommt), `tests/browser/m37-kettenhuepfer.spec.mjs` (drei Runden im Browser).
  (2) **Wechselsatz vor der Aufgabe** (zweite Zeile im RAHMEN, `wechsleKette`, wie `vorzeigen` vor `spieleAufgabe`, damit die Zeit der Aufgabe erst danach läuft): vorher ersetzte der Auftrag den Wechselsatz still 5,4 s nach Beginn der Aufgabe. Browser-Test: Blase ändert sich ab Phase `aufgabe` nicht mehr.
  (3) **Kurzkette mit gemeinsamem Maßstab** (oben, Annahme Kurzkette); Änderung an `<ls-perlenkette kurz>` und in `bedienung.md` §9 (Grund: die Kurzkette ist Teil des Lernzeichens; je Zeile ein eigener Maßstab stellte a falsch dar, 1 · 10 so lang wie 10 · 10).
  (4) **Korb:** Die Packung kommt erst in den Korb, wenn die letzte geflogene gelandet ist (bei wenig Bewegung und beim Überspringen sofort, ohne Bewegung). Im Korb liegt **das Ding der Reihe** (Schuhpaar, Gedeck, Münzen …, bis zu neun, der untere Teil hinter dem Korbrand), nicht mehr ein allgemeiner Karton; der Korb selbst bleibt im Spiel auf `leer`, seine Füllstände `1` … `gefuellt` bleiben für Karte und Regal. Korb 15 rem hoch (vorher 12), Packung im Flug 9 rem (vorher 7). Schuhpaar sitzt auf dem Regalbrett (im Feld höher als die anderen Dinge).
- **Hilfe Stufe 2:** Sonnenring an der nächsten Taste; dafür `markiere(zeichen)` an `<ls-tastatur>` (kleine Erweiterung des Bausteins, gleicher Sonnenring wie beim Fokus).
- **Test-Schnittstelle:** Züge sind Tasten zu Ergebnis und Nachbarn um ein Stäbchen (`kandidaten`), `fehlversuche: true`.
- **Offen für den Ausbau (erledigt im Ausbau, unten):** Stufen `vorstellung`/`kopf` am Gerät prüfen (im Code angelegt), Einführung in der Welt, `karte`/`regal`, Objekte `ballroehre`, `wochenschachtel`, `stiftebox`, `muffinkarton` (bis dahin Platzhalter-Päckchen), Zehn-Cent-Variante von `muenze`, Regal-Regel in `material.js`, Sanft und Abenteuer, Audio-Sammler für `texte.json` (sammelt heute nur Literale und `sprich`-Felder).

- **Bewusst offen (Runde 3):** Die Sachwelt-Spalte bleibt 30 rem (Matte und Liste brauchen die Breite); das Regal steht weiter flach. Der Korb zeigt die Dinge der Reihen als Überlagerung im Spiel; ob `einkaufskorb` dafür eine eigene Art „mit Inhalt“ bekommt, entscheidet der Ausbau.

## Ausbau (2026-11-15)
- **Stufen:** `material`, `vorstellung`, `kopf` gebaut und im Browser angesehen (1920 × 1080, 1280 × 800, 1024 × 768); `spiele.json` `stufen` alle drei. Die Folge ist in jeder Stufe gleich (in `kopf` erscheint die Kette mit der Eingabe).
- **W-Freude (Steuerung, verbindlich):** Jede geflogene Packung **bleibt im Korb**: a Packungen je Lösung a · n (Hinweis B-Welt R3: vorher blieb je Lösung nur eine liegen). Der Korb hat 14 Plätze (`KORB_PLAETZE`); danach ersetzt jede neue Packung die älteste, der Korb ist voll und die neuen liegen oben **(Annahme)**. Die Packungen kommen je Lösung in einer von vier Varianten hinein (plumpst, rutscht, hüpft, gleitet; zufällig, alle gleich ruhig). Ist die letzte gelandet, **reagiert Timo** mit einer Reaktion der Runde, nie zweimal dieselbe hintereinander: nickt (`nicken`, neu im gemeinsamen Bestand `spiele/runde/bewegungen.js`, nur der Kopf, gilt auch im Rollstuhl), dreht eine kleine Runde (`pirouette`) oder freut sich leise (`freuen-klein`). Etwa 1 s Hüpfen und Flüge, bis 2,8 s Folge (`FOLGE_MS`), Tippen überspringt (alle Packungen liegen sofort drin, Timo steht). Wenig Bewegung: alle Packungen sofort, Timo nur mit dem Gesicht, 0,7 s. Nach einer Antwort, die nicht passt, nichts davon (B5). Damit ändert sich §5 (Timo nur vorzeigen): Timo zeigt vor **und** freut sich mit (F7), ohne zu bewerten, und steht still, bevor die nächste Aufgabe kommt (B3; Browser-Test).
- **Sanft (Standard) und Abenteuer:** vor dem Rundenende ist die letzte Zeile des Kindes verwischt (`verwischteZeile`, ab zwei Zeilen; Ruhig: keine): „a · n = ▢“ in Tinte weich, die Kurzkette bleibt. Satz (statt „Die Kette darunter …“, die Kurzkette steht neben der Zeile): „Auf der Liste ist eine Zeile verwischt. Die Kette daneben zeigt, wohin sie gehört.“ Dann kommt die Aufgabe wie jede andere (Pfeilchen leer, Zeile verdeckt, §2 Satz 6), wird aber **nicht an die Lernsteuerung gemeldet** **(Annahme)**: Das Kind hat sie eben erst gelöst; eine zweite Antwort so kurz danach sagt nichts über das Behalten und darf keine Probe voranbringen (im Browser-Test stieß sie sonst eine Probe vorzeitig an). Für die Prüfung kommt sie als `ls-ergebnis` mit `zusatz: true`. Abenteuer verhält sich wie Sanft, der Bogen bleibt in diesem Entwurf (nicht gebaut).
- **Einführung in der Welt (A4b):** `einfuehrung.json` im Spielordner, `EINFUEHRUNG` in der SPIELWELT samt Hintergrund (Szenenbild); in `lernplan.json` haben die zehn Themen des Spiels `einfuehrung` mit Werten n, 2n, 3n, Packung, Zustand (Kern: n = 6, Eierkarton). Timo zeigt vor, die Packung der Reihe und der Korb stehen im Bild. Dafür kann `spiele/einfuehrung.js` ein Bildelement `objekt` (Ding aus `spiele/objekte/`, still); `tests/lernplan.test.mjs` prüft es und rechnet „·“ in den Gleichungen von `zeig`.
- **Objekte:** `ballroehre`, `wochenschachtel`, `stiftebox`, `muffinkarton` (neu, `spiele/objekte/`), `muenze` Zustand `zehn-cent` (Prägung „10“); Farben nur aus Tokens und Welt-Paletten, keine Lernzeichenfarbe (Test). `einkaufskorb` im Maßstab 1,5 (Kontur bei Spielgröße so stark wie bei Timo). Vergleichsbild: `tests/browser/objektbilder.mjs --kind timo` setzt das Kind der Runde im selben Maßstab daneben (`<art>-vergleich.png`).
- **Welt und Platz (Steuerung Punkt 6):** Die Sachwelt steht links über Blase und Arbeit (38 rem, 4:3: 30 rem), Timo 32 rem (Figur etwa 25 rem), Korb 18 rem. Die Kurzketten der Liste haben Stäbe von 3,4 × 1,6 rem (vorher 2,6 × 1,3), Zeilen 4,6 rem, Liste 46 rem; die Matte ist dafür bei 1280 × 800 etwa 80 rem breit (vorher 90). Szenenbild `bilder/vorratskammer.webp` (Azure, `herkunft.json`; ein erster Versuch mit einer Kiste auf dem Boden ist verworfen, Kosten gebucht): in rem an der Bühne ausgerichtet, die Kante von Wand und Boden liegt auf der Bodenlinie der Arbeit, **das Ding der Reihe steht auf der Fensterbank** (statt des gezeichneten Regals). Bei 4:3 rückt Fertig unter die Ziffern neben Löschen (sonst stieß es an die Hilfe).
- **Regal und Karte:** `regal: { objekt: "einkaufskorb", wert: null }`, `karte: { figur: "einkaufskorb", zustand: "gefuellt", welt: "vorrat-und-packungen" }`. In `material.js` Regel 1b: die neun Reihen-Themen zeigen die Kurzkette von n (`<ls-perlenkette kurz="10">`, Liste `REIHE` mit Test); **Kern** hat keine eine Reihe und zeigt den Korb **(Annahme)**. Regal, Startseite und Themen-Seite laden dafür `perlenkette.js`. Silhouettentest: Mathe hat nur diese Karte; breiter Korb mit hohem Henkel, in 64 px grau erkennbar. `symbol.svg` neu aus den Helfern der Runde (Henkel, Rand, drei Packungen; Farben aus Tokens und Palette).
- **Beschreibung für Eltern (Christian, 2026-11-14):** in `spiele.json` `beschreibung`.
- **Audio-Sammler:** `werkzeuge/audio/texte.mjs` liest jede `texte.json` eines Spielordners (alle Zeichenketten rekursiv, ohne `hinweis`, ohne Zahlen), Test in `tests/audio-werkzeuge.test.mjs`.
- **Keine Änderung** an `docs/bedienung.md` und `docs/grundsaetze-bilder.md` in diesem Ausbau.
- **Bewusst offen:** Teilen (Art `geteilt`), Teiler, `einmaleins-gemischt`, Abenteuer-Bogen (nur in diesem Entwurf); Aufnahmen (`npm run audio` macht die Steuerung); die Matte ist bei 4:3 nur etwa 60 rem breit, die Zehnerkette dort klein; die Pflanze des Szenenbilds steht neben dem Ding auf der Fensterbank (Stimmung, keine Bedeutung).

## Freigabe nötig (Christian)
- Keine neue Frage: Perlenkette, Art `mal` und die Welt deckt Christians Auftrag (2026-11-14). **(Annahme)** zur Kenntnis: neun Packungen mit je eigenem Ding, davon vier neue Objekte und die Figur `einkaufskorb`.

## Selbstprüfung `grundsaetze.md` §12
Zweck (Korb füllen), eine Schwierigkeit (Abruf), Abruf vor dem Sehen, Mechanik zeigt den Ort, Fehler-Folge stiller, Hilfe über Kernaufgaben (nie Hochzählen, Begriffe stimmen), Wiedervorlage über die Lernsteuerung, erst zeigen (Timo), keine Punkte oder Timer,
Geschichte ruhig mit Elternvorschau und hellem Rundenschluss, Sachthema am Sachgrund (K1, K2), Fakten mit Quelle, Setzungen benannt (K4), Sätze ohne Wörter aus 3.2, Fachbegriffe nach 5.1, Gäste und Bestand beiläufig (A12 Soll).
