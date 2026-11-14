# M37 Kettenhüpfer – Spielentwurf

- **Katalog:** M37 · Mathe · `spiele/mathe/m37-kettenhuepfer/` · Welt `wiese-und-hecke` (Forschen, Rätsel) · **Stand:** 2026-11-14 (nach Prüfung A, Runde 2) · **(Annahme)** = korrigierbar.
- **Weg: voller Weg** – neue Art `mal` (`aufgabenarten.js` mit `ZIEL_MS`, `aufgaben` in `lernplan.json`), Lernzeichen Perlenkette (Christian 2026-11-14), Änderungen in `spiele/rahmen/`.
- **Abweichungen vom Katalog (Grund):** (1) Kein hüpfendes Tier: Es hüpft das **Zählpfeilchen**, Teil des Lernzeichens; Name bleibt (A4b). Figur des Spiels: **Marienkäfer**.
  (2) **Kofi, vorzeigen** (`figuren.md` §3), nicht Timo/Ela. (3) Sachgrund: gleich viele Teile je Ding der Hecke, nicht nur Beine (§4). (4) Sanft ohne Anstupsen, Kernaufgaben über die Themenfolge.
  (5) Mach mit (Lena) kommt als Karte vom Skill „Mit echten Dingen“. (6) **Zählbrett und Naturschützerin entfallen** (Strichliste wäre neues Lernzeichen, §5a; Gründe §4).

## 1. Zweck in der Spielwelt
- Das Kind führt das Zählheft der Hecke: Wie viele Beine, Blättchen, Kronblätter oder Punkte haben a Tiere bzw. Blüten zusammen? Jede richtige Zahl setzt ein Pfeilchen auf die Kette und eine Zeile ins Heft;
  ohne das Ergebnis keine Zeile. Das Kind rechnet, Kofi zeigt nur die erste Aufgabe vor.

## 2. Die Runde in fünf Sätzen
1. Auf der Matte liegt die Perlenkette von n (zehn Stäbchen zu je n Perlen), oben „6 · 7 = ▢“, am Zweig der Hecke (Welt-Schicht, über der Matte) ist noch nichts, rechts liegt das Heft.
2. Der Erzähler stellt die Aufgabe in der Sache („Sechs Siebenpunkt-Marienkäfer. Wie viele Beine sind es zusammen?“); die erste Aufgabe legt Kofi vor.
3. Das Kind tippt die Zahl und bestätigt mit „Fertig“ (erst festlegen, dann sehen, L2).
4. Passt die Zahl: Das Zählpfeilchen hüpft Stäbchen für Stäbchen, bei jedem setzt sich ein Ding an den Zweig (a Dinge), das Pfeilchen mit der Zahl rastet am a-ten Stäbchen ein, die Zeile mit Kurzkette steht im Heft.
   Passt sie nicht: Das Pfeilchen hält am a-ten Stäbchen, die getippte Zahl liegt als hohles Pfeilchen an ihrem Ort, nichts kommt ins Heft, die Aufgabe bleibt.
5. Nach etwa 8 Aufgaben (höchstens 4 Minuten) ist das Heft voll; dann Pause.

## 3. Lernhandlung = Spielhandlung
- Das Ergebnis von a · n abrufen und tippen; die Kette prüft es. Ohne Aufgabe kein Ziel des Pfeilchens. Eine Schwierigkeit (A2): Abruf.

## 4. Sachwelt und Sachgrund (A4, K2, K4)
- **Eine Sache:** Die Kette ist die Sache gezählt (ein Stäbchen = die Teile eines Dings, n Perlen). Die Dinge am Zweig sind Wirkung, nie Zählmaterial (M1). Jede Aufgabe fragt in der Sache.
- **Sachgrund je Kette** (Quelle geprüft am 2026-11-14, alle de.wikipedia.org; Orte nur, wo die Quelle sie nennt):

| n | Ding (ein Name) | Teile je Ding | Quelle |
|---|---|---|---|
| 2 | Siebenpunkt-Marienkäfer | 2 weiße Punkte am Kopf | /Siebenpunkt-Marienkäfer („zwei weiße Punkte“ am Kopf) |
| 3 | Weißklee, ein Blatt | 3 Blättchen | /Weiß-Klee („dreizählig gefingert“); Ort Wiesenrand (Annahme) |
| 4 | Knoblauchsrauke, eine Blüte | 4 Kronblätter | /Knoblauchsrauke („Die vier weißen Kronblätter …“; „in Gebüschen und Hecken“) |
| 5 | Hundsrose, eine Blüte | 5 Kronblätter | /Hunds-Rose („Die fünf Kronblätter …“) |
| 6 | Siebenpunkt-Marienkäfer | 6 Beine | /Webspinnen („Insekten … sechs Beine“) |
| 7 | Siebenpunkt-Marienkäfer | 7 Punkte | /Siebenpunkt-Marienkäfer (drei je Deckflügel, einer auf dem Schildchen) |
| 8 | Kreuzspinne | 8 Beine | /Webspinnen („wie alle Spinnentiere acht Beine“) |
| 9, 10 | – | – | **keine Quelle gefunden, nichts erfunden** (siehe „Freigabe nötig“) |

- **Geprüft und verworfen (K4, Befund 4):** Rotkehlchen (2 Beine) und Feldhase (4 Beine): Wikipedia-Artikel nennen die Zahl nicht; ersetzt durch Marienkäfer-Kopfpunkte (2) und Knoblauchsrauke (4), beide mit Quelle.
  Vogelzählung in Zehnerblöcken (für 10): in DDA-, NABU-, LBV-Merkblättern nicht gefunden (Schätzen und danach genau zählen, keine Zehnerblöcke) – **nicht verwendet**. Hase und Weißklee nicht mehr am Zweig (Befund 5).
- **9 und 10 in diesem Bau (Annahme, Steuerung):** n = 9 fällt aus dem Pool von `kernaufgaben-einmaleins` (Pool n ∈ {3, 4, 6, 7, 8}); die neunerreihe bleibt in den Daten, wird nicht gebaut. Die **zehnerreihe wird gebaut und geprüft, aber geparkt**,
  bis Christian entschieden hat (Freigabe nötig). a = 10 als Faktor (Kernaufgabe 10 · n, n ≤ 8) braucht keinen Sachgrund für die Kette 10 und bleibt.
- **K6:** höchstens ein neuer Fakt je Runde. Gemischte Runden nehmen höchstens eine neue Kette; n = 6 und n = 7 sind dasselbe Tier, die Frage nennt „Beine“ bzw. „Punkte“ (im Bau prüfen, ob das Kind verwechselt). Fakten am Sachbild, nie als Ich-Erlebnis (F8, K3).

## 5. Figur
- **Kofi** (`figuren.md` §2), nur **vorzeigen** (L5): die erste Aufgabe jeder Runde, mit Probe und Zögern („zeigen“, `nachdenken`), danach `stehen`. Kein Freuen, Fragen, Anstupsen. Platz links unten, Dreiviertel zur Matte, nie im Lernfeld. Gast: keiner.

## 6. Bildschirm-Skizze
```
┌──────────────────────────────────────────────────────────────────────────┐
│ (⌂) [Mathe] Kettenhüpfer                                            (♪)  │
│             Die 7er-Reihe                                                │
├──────────────────────────────────────────────────────────────────────────┤
│  Hecke (Welt): Zweig  🐞🐞🐞🐞🐞🐞   ┌ Blase „Sechs …?“ (🔊) ┐                  │
│ ┌ MATTE ─────────────────────────────────────────────┐ ┌ HEFT ─────────┐ │
│ │ 6 · 7 = [ 4 2 ]                                     │ │ 3 · 7 = 21 ▪▪▪│ │
│ │ ●●●●●╎●● ─ ●●●●●╎●● ─ ●●●●●╎●● ─ … ▼7 ▼14 ▼21 …   │ │ 6 · 7 = 42    │ │
│ └────────────────────────────────────────────────────┘ └───────────────┘ │
│ Kofi         [0][1][2][3][4][5][6][7][8][9][⌫]  [ Fertig ]         (?)   │
└──────────────────────────────────────────────────────────────────────────┘
```
- Plätze nach `bedienung.md` §3, Hauptknopf „Fertig“ (§4). Der Zweig liegt in der Welt-Schicht über der Matte, nicht auf dem Papier (6.2, C3). Die Blase hat nur Sätze des Erzählers. Perlen n = 8 aus der Mattenbreite (am Gerät prüfen); Ziffern ab 3,2 rem; Heft 8 Zeilen zu 4,4 rem.

## 7. Rückmeldung
- **Passt:** Zählpfeilchen und Dinge (etwa 1,8 s, Tippen überspringt), Pfeilchen mit Zahl rastet ein, Heftzeile mit Kurzkette. Im Wechsel (B4): „Das Pfeilchen zeigt die Zahl.“ · „Das Pfeilchen sitzt am letzten Stäbchen.“ · „Die Zeile steht jetzt im Heft.“
- **Passt nicht:** Ring am a-ten Stäbchen, hohles Pfeilchen der getippten Zahl, keine Dinge (N7), beide gleiten zurück. „Das Pfeilchen sitzt hier. Deine Zahl liegt weiter hinten.“ · „… weiter vorn.“ · „Deine Zahl liegt hinter dem Ende der Kette.“
- **Kofi legt vor:** „Kofi legt die erste Aufgabe. Ein Stäbchen, die Teile von einem Ding. Dort steht das erste Pfeilchen.“ (Fassung je Ding in `texte.json`.)
- **Sachsatz** (Rundenanfang, laut, je Ding ausgeschrieben, ein Name je Ding): n 2 „In der Hecke wird gezählt. Ein Siebenpunkt-Marienkäfer hat zwei weiße Punkte am Kopf. Ein Stäbchen sind die Kopfpunkte von einem Siebenpunkt-Marienkäfer.“ ·
  n 3 „… Ein Weißklee-Blatt hat drei Blättchen. Ein Stäbchen sind die Blättchen von einem Blatt.“ · n 4 „… Eine Knoblauchsrauke-Blüte hat vier Kronblätter. Ein Stäbchen sind die Kronblätter von einer Blüte.“ ·
  n 5 „… Eine Hundsrosen-Blüte hat fünf Kronblätter. Ein Stäbchen …“ · n 6 „… Ein Siebenpunkt-Marienkäfer hat sechs Beine. Ein Stäbchen sind die Beine von einem Siebenpunkt-Marienkäfer.“ ·
  n 7 „… hat sieben Punkte. Ein Stäbchen sind die Punkte von einem Siebenpunkt-Marienkäfer.“ · n 8 „… Eine Kreuzspinne hat acht Beine. Ein Stäbchen sind die Beine von einer Kreuzspinne.“ (alle 1–10 vollständig in `texte.json`)
- **Auftrag** (Muster aus Daten, a als Zahlwort; erste laut, dann still): „Sechs Siebenpunkt-Marienkäfer. Wie viele Beine sind es zusammen?“ · „Eine Kreuzspinne. Wie viele Beine sind es?“ Alle Stufen gleich; „6 · 7 = ▢“ steht im Bild.
- **Rundenende** (feste Zeichenketten, ohne Wörter aus 3.2, nicht Kofi als Zähler): „Das Heft ist voll. Die Siebenpunkt-Marienkäfer sind gezählt.“ (Ding je Kette) · Kern: „Das Heft ist voll. In der Hecke ist alles gezählt.“
- **Sanft (Annahme, Standard; Abweichung von `welten.md`: dessen „48 Beine“ ist Teilerstoff Kl. 4, kommt im Ausbau):** Die letzte Zeile im Heft ist verwischt. Von ihr steht noch die Aufgabe „a · n = ▢“ mit ihrer Kurzkette, das Ergebnis fehlt.
  **Das Kind tippt das Ergebnis neu**, die Kurzkette zeigt, bis wohin (Zeile mit Kurzkette steht in Reihen und Kernaufgaben im Heft, nicht auf der Matte); danach steht die Zeile wieder da. Es ist nur eine Aufgabe mehr, ohne Tier-Eingriff, still bei Fehlern.
  „Im Heft ist eine Zeile verwischt. Die Kette darunter zeigt, wohin sie gehört.“
- **Abenteuer (nur auf Wunsch; Bogen über die Zahl der Runden dieses Spiels, Annahme; ohne Zähler erst im Ausbau).** Jede Runde endet **hell, in Ruhe, aufgelöst**: 1 „Im Gebüsch raschelt es. Ein Igel kommt heraus und geht weiter.“ · 2 „Ein Reh schaut aus dem Wald und geht weiter.“ ·
  3 „Die Sonne scheint auf die Hecke.“ · 4 „Die Jahresliste der Hecke ist fertig.“ Die Spannung bleibt Rätsel (4.7), keine Lücke dazwischen.
- **Vorschau für Eltern (9.3):** Ruhig: Das Heft der Hecke wird Zeile für Zeile voll. Sanft: Eine Zeile ist verwischt; das Kind schreibt sie neu. Abenteuer: Tiere kommen vorbei (Igel, Reh) und gehen weiter; am Ende steht die Jahresliste.

## 8. Hilfe-Leiter
Nach dem zweiten Versuch, der nicht passt, leuchtet Hilfe einmal; mit Hilfe Gelöstes zählt nicht als gekonnt (L12). Fachbegriffe wörtlich (§5.1). Die Probe ist **nie Hochzählen**, sondern geht über eine Kernaufgabe.
- **Stufe 1, Probe** (Pfeilchen mit Zahl und Sonnenring; in vorstellung hebt sich das Tuch nur bis dort, in kopf erscheint unter der Aufgabe eine Kurzkette):
  - a ∈ {3, 4, 6, 9}, **Nachbaraufgabe** (ein Stäbchen Abstand: 3 → 2, 4 → 5, 6 → 5, 9 → 10): „Das Pfeilchen zeigt eine Kernaufgabe. Deine Aufgabe ist ihre Nachbaraufgabe. Wie viele Stäbchen liegen dazwischen?“
  - a ∈ {7, 8} **(zwei Stäbchen Abstand, keine Nachbaraufgabe):** 7 · n = 5 · n + 2 · n, 8 · n = 10 · n − 2 · n: „Das Pfeilchen zeigt eine Kernaufgabe. Von dort sind es zwei Stäbchen. Wie viele Stäbchen liegen dazwischen?“
  - a = 5: „10 · n ist eine Kernaufgabe. Fünf Stäbchen sind die Hälfte von zehn. Wie viel ist die Hälfte?“ · a = 2: „1 · n ist eine Kernaufgabe. Das zweite Stäbchen ist genauso. Wie viel ist das Doppelte?“ ·
    a = 10: „Die Tauschaufgabe ist n · 10. Wie viele Zehner sind es?“ (im Bild n Zehnerstäbe, `<ls-perlenstab>`) · a = 1: „Ein Stäbchen. Wie viele Perlen liegen darauf?“
- **Stufe 2, Lösung mit Begründung** (die nächste Taste bekommt den Sonnenring): Nachbaraufgabe, Ringe zwischen Kernpfeilchen und Ziel, im Bild „35 + 7“ bzw. „35 − 7“: „Von der Kernaufgabe geht es ein Stäbchen weiter. Zum Ergebnis kommen die Perlen von einem Stäbchen dazu. Tipp die Zahl am Pfeilchen.“
  (zurück: „… gehen weg.“) · zwei Stäbchen: „Von der Kernaufgabe sind es zwei Stäbchen. Zum Ergebnis kommen die Perlen von zwei Stäbchen dazu (bei 8: gehen weg).“ · Hälfte, Doppeltes, Zehner, Eins: Sätze wie in der Spec 2026-11-13, Zahlen als Ziffern im Bild.

## 9. Stufen
- **material:** Kette offen, jede Perle einzeln, Fünfermarke (M2). **vorstellung:** Perlen unter dem Tuch, nur Stäbchengrenzen sichtbar; nach der Eingabe hebt sich das Tuch. **kopf:** nur Aufgabe und Heft; die Kette erscheint erst nach der Eingabe.
- **Das Gelernte bleibt (A6b):** Nach der Wirkung bleiben Kette und eingerastetes Pfeilchen bis zur nächsten Aufgabe (in kopf die Kurzkette der Zeile), die Heftzeile bis Rundenende. **Reihen:** feste Kette n, die Pfeilchen sammeln sich („die Reihe voller Pfeilchen“).
  **Gemischte Ketten (Kern):** auf der Matte nur die Kette der laufenden Aufgabe; jede gelöste Aufgabe bleibt als Heftzeile „a · n = c“ mit Kurzkette; „Heft voll“ = acht Zeilen. Das Tier steht nie im Heft.
- **Zuerst gebaut (§8a):** zweierreihe, fuenferreihe, kernaufgaben-einmaleins (ohne n = 9), Kl. 2, alle Stufen, ruhig und Sanft; **zehnerreihe gebaut, geparkt** (Freigabe nötig). **Ausbau:** Reihen 3, 4, 6–8, neunerreihe (Sachfrage offen), Teilen (Art `geteilt`, für M35), Teiler (Kl. 4), Abenteuer.

## 10. Aufgabenschlüssel und arten
- **Art `mal`** (wiederverwendbar für M35/M36, nichts Kettenhüpfer-Eigenes): Schlüssel `mal:<a>*<n>`, daten `{ a, b: n, c }`, c = a·n. Pools ohne Überschneidung (Test dazu): Reihen 2, 5, 10 mit a = 1–10; Reihen 3, 4, 6, 7, 8, 9 mit a ∈ {3, 4, 6, 7, 8, 9};
  Kern a ∈ {1, 2, 5, 10}, n ∈ {3, 4, 6, 7, 8}. **`ZIEL_MS.mal` = 8000** (Annahme); `schwierigkeit`: Kernfaktor 0, a ∈ {3, 4, 6, 9} 1, a ∈ {7, 8} 2; `darstellbar`: `reihen: [von, bis]` gegen `daten.b`.
- **Fehlerbilder:** `einmaleins-nachbar` vergleicht mit a·(n ± 1) und (a ± 1)·n. `einmaleins-hochzaehlen` meint die Schrittzahl `daten.a`. In `lernplan.json` steht die Regel nur an einer Stelle (Z. 24905, „zeit-steigung-zweiter-faktor“, Beschreibung „zweiten Faktor“);
  der Bau ändert **Id und Beschreibung zusammen** (`zeit-steigung-schrittzahl`, „Lösezeit steigt mit der Schrittzahl a“), weil sie sonst nirgends gelesen wird (Annahme, im Bau per Suche bestätigen).
- **`lernplan.json`:** `aufgaben` für `zweierreihe` `{ art: "mal", reihe: 2 }`, `zehnerreihe`, `fuenferreihe`, `kernaufgaben-einmaleins` `{ art: "mal", kern: true }`, dann `dreierreihe` bis `neunerreihe`; `einfuehrung` zeigt auf `mathe/m37-kettenhuepfer/einfuehrung.json`.
  Die Welt `wiese-und-hecke` bekommt `fakten` nur für n = 2–8 (§4). **`spiele.json`:** `arten: [{ art: "mal", reihen: [2, 10], stufen: [material, vorstellung, kopf] }]`.
- **Meldung:** je Aufgabe `ok`, `hilfe`, `ms`; Fehlversuche mit der getippten Zahl (`einmaleins-nachbar`). Test-Schnittstelle: Ziffer, Löschen, Fertig; `fehlversuche: true`. Elternansicht: welche Reihen zuletzt, ohne Vergleich (3.3).

## 11. Spielobjekte
| Ding | Ablage | Zustände, Bewegung | Rolle |
|---|---|---|---|
| Siebenpunkt-Marienkäfer (**Figur des Spiels**, Karte) | `spiele/objekte/marienkaefer.js` neu | `sitzt` (sechs Beine), `sieben-punkte`; kleine Krabbelbewegung | Wirkung; n 2, 6, 7 |
| Kreuzspinne | `spiele/runde/tiere/` bzw. `objekte/` | sitzt am Zweig | Wirkung, n 8 |
| Weißklee-Blatt, Knoblauchsrauke-, Hundsrosen-Blüte | `spiele/objekte/` neu | liegen / blühen am Zweig bzw. Wiesenrand | Wirkung, n 3, 4, 5 |
- **Karte:** `karte: { figur: "marienkaefer", zustand: "sitzt", welt: "wiese-und-hecke" }`; ein Käfer auf einem Heckenzweig, rundlich gewölbt, kleiner Kopf, sechs Beine, anders als die Tonne von M14; ohne Perlen, Ziffern, Text. Fach `(marienkaefer, wiese-und-hecke, sitzt)` frei; M35 nimmt anderes (KB6).
- **Regal:** `regal: { objekt: "marienkaefer", wert: null }`; vorn die Perlenkette n (neue Regel in `material.js`, Art `mal` mit `reihe`), der Käfer ab `kernaufgaben-einmaleins`.

## Bausteine
- **Vorhanden:** `<ls-leiste>`, `<ls-blase>`, `<ls-hilfe>`, `<ls-pause>`, `<ls-knopf>`, `<ls-tastatur>`, `<ls-perlenstab>`; Geste nur Tippen. **Neu (Lernzeichen):** `<ls-perlenkette>` in `spiele/rahmen/` (Attribute `reihe`, `pfeile`, `verdeckt`, `kurz`), Einträge in `grundsaetze-bilder.md` §4 und `bedienung.md` §9, Regal-Regel.
  Szene von Hand; `kern/`, `lernsteuerung.js` und der RAHMEN bleiben, Einführung über `EINFUEHRUNG`.

## Freigabe nötig (Christian)
1. **Sachgrund für die zehnerreihe (und die neunerreihe).** Kein geprüfter Fakt „zehn gleiche Teile je Ding“ in der Hecke; Zehnerblöcke bei Vogelzählungen fanden sich in keiner Quelle. Entscheiden, K2 ist nicht erfüllt:
   (a) Zählbrett mit Strichliste: **neues Lernzeichen** (`grundsaetze-bilder.md` §5a, `spielkatalog.md` §8a), schwächer als ein Tier; (b) andere Welt für 9 und 10 (Kalender, zehn Tage); (c) zehner- und neunerreihe in einem anderen Spiel üben.
   **Empfehlung (c).** Bis dahin: zehnerreihe gebaut und geprüft, aber geparkt.
2. Marienkäfer als Figur des Spiels und Sachgrund über Beine hinaus (Blättchen, Kronblätter, Punkte); Perlenkette und Art `mal` deckt Christians Auftrag.

## Selbstprüfung `grundsaetze.md` §12
Zweck, eine Schwierigkeit, Abruf vor dem Sehen, Mechanik zeigt den Ort, Fehler-Folge stiller, Hilfe über Kernaufgaben (nie Hochzählen, Begriffe stimmen), Wiedervorlage über die Lernsteuerung, erst zeigen (Kofi), keine Punkte oder Timer, Geschichte ruhig mit Elternvorschau
und jeder Rundenschluss hell, Sachthema am Sachgrund (K1, K4); offen: 9 und 10.

## Geparkt

- **Datum:** 2026-11-14 · **Grund:** Prüfung A nach drei Runden rot (`docs/spielentwicklung.md` §7), dazu „Freigabe nötig“ (oben). Gebaut ist nichts außer diesem Entwurf: kein Prototyp, keine Aufgabenart `mal` (die soll mit dem Spiel entstehen, wenn der Entwurf steht). Prüfberichte: `m37-kettenhuepfer.pruefungen.md`.
- **Offene Befunde, Prüfung A Runde 3:**
  - **A2 (rot):** Drei Ketten (2, 6, 7) hängen am selben Tier, dessen Name ein Zahlwort trägt: „Sechs Siebenpunkt-Marienkäfer. Wie viele Beine sind es zusammen?“ meint 6 · 6, hörbar sind „sechs“ und „sieben“ (§4 Isolation). Beleg: Entwurf §2, §4 (n = 2, 6, 7).
  - **A4 (rot):** Hauptbeispiel widerspricht dem Sachgrund (Beine, aber „6 · 7 = 42“); n = 9 aus `kernaufgaben-einmaleins` genommen, dann kommen 1·9, 2·9, 5·9, 10·9 in keinem Pool vor (§8a); Empfehlung (c) läuft gegen Christians Bau-Reihenfolge (zehnerreihe ist erstes Thema, `spielkatalog.md` §9); Knoblauchsrauke/Klee „am Zweig“ sachlich schief.
  - **A11 (rot):** Sätze nicht wörtlich bzw. falsch („Das Pfeilchen sitzt am letzten Stäbchen“), Sachsätze für n = 3, 4, 5, 7 mit „…“, Vorzeigen/Rundenende/Stufe 2 nur als Verweis.
  - Grün in Runde 3: A1, A3, A4b, A5–A10, A12, Pflichtteile.
- **Kern des Problems:** Der Sachgrund des Katalogs („gleich viele Beine je Art: 2, 4, 6, 8“) trägt in der Hecke die Reihen 10, 5, 3, 7, 9 nicht; drei Runden haben keinen sauberen Ersatz gefunden.
- **Fragen an Christian:**
  1. Sachgrund für zehnerreihe/fuenferreihe (erste Themen): (a) Sachgrund im Katalog erweitern auf „Zählen in der Hecke“ mit Zählweise statt Tierfakt (Zehnerblöcke, Strichliste – dann neues Lernzeichen §5a freigeben), (b) andere Welt für M37 mit Dingen in festen Gruppen für alle Reihen (z. B. Vorrat/Packungen), (c) die Welt behalten und zehner-/fünferreihe vorerst in einem anderen Spiel (ändert die Reihenfolge in §9). Empfehlung der Steuerung: (b) oder (a) – die Wiese-und-Hecke-Welt trägt nur 2, 4, 6, 8.
  2. Gilt der Sachgrund über Beine hinaus (Blättchen, Kronblätter, Punkte) und der Marienkäfer als Figur des Spiels statt eines hüpfenden Kindes?
  3. Darf Kofi (vorzeigen) statt Timo/Ela die Figur der Runde sein?
