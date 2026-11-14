# M37 Kettenhüpfer – Spielentwurf

- **Katalog-Id:** M37 · „Kettenhüpfer“ · Mathe · `spiele/mathe/m37-kettenhuepfer/` · Heimatwelt `wiese-und-hecke` (Forschen, Rätsel) ·
  **Stand:** 2026-11-14 · **(Annahme)** = korrigierbar. **Weg:** voller Weg (neue Art `mal`, neues Lernzeichen, Änderungen an `rahmen/`).
- **Abweichungen vom Katalog-Eintrag:**
  1. **Hüpfer ist ein Grashüpfer** (Figur des Spiels), kein Kind der Runde: Ein hüpfendes Kind bräuchte neue Haltungen samt
     Rollstuhl-Fassung für Timo, Kinder hüpfen in Einführungen nie, Kinder sind keine Kartenfiguren (KB7); Springen ist natürlich (T3).
  2. **Eine Figur der Runde, eine Aufgabe: Kofi, vorzeigen** (`figuren.md` §3), nicht Timo und Ela; die Mechanik zeigt den Ort der
     falschen Zahl, Ela muss sich nicht wundern. Verteilung: M14 Timo, Einführungen Ela.
  3. Kernaufgaben zuerst über die Themenfolge, nicht über Pakete der Spec 2026-11-13. 4. Wirkung als Zeile im Heft statt Tiergruppe
     auf dem Bildschirm (Platz, M1). 5. Mach mit (Lena) kommt als Karte vom Skill „Mit echten Dingen“ (Branch `echte-dinge-m37`).

## 1. Zweck in der Spielwelt
- Kofi zählt in der Hecke Beine: Jede gelöste Aufgabe setzt ein Pfeilchen, die Kette füllt sich, die Gruppe kommt ins Heft.

## 2. Die Runde in fünf Sätzen
1. Eine Perlenkette (zehn Stäbchen zu je n Perlen) liegt auf der Matte, links wartet der Grashüpfer, oben steht „6 · 7“, daneben das Heft.
2. Kofi legt die erste Aufgabe jeder Runde vor (ein Stäbchen, Pfeilchen mit n) und zählt mit dem Finger mit.
3. Das Kind tippt die Zahl auf der Bildschirm-Tastatur und bestätigt mit „Fertig“ (erst festlegen, dann sehen, L2).
4. Der Grashüpfer springt a Stäbchen weit: Landet er auf der Zahl, rastet dort das Pfeilchen ein und „6 · 7 = 42“ mit dem Tier steht im Heft;
   sonst liegt die getippte Zahl an ihrem Ort auf der Kette (hohles Pfeilchen) und die Aufgabe bleibt.
5. Nach etwa 8 Aufgaben (höchstens 4 Minuten) steht die Reihe voller Pfeilchen im Heft; dann Pause.

## 3. Lernhandlung = Spielhandlung
- Das Ergebnis von a · n abrufen und tippen; die Kette prüft es. Ohne die Aufgabe gibt es kein Sprungziel. Eine Schwierigkeit (A2): Abruf.

## 4. Sachwelt und Sachgrund
- **Welt:** Hecken-Zählung, Palette „Wiese und Wald“, Flächen von Hand (kein erzeugtes Bild). Nur Hecke, Zweig, Tiere, Heft (A4b).
- **Sachgrund (K2):** Rotkehlchen 2, Hase 4, Marienkäfer 6, Kreuzspinne 8 Beine: Ein Stäbchen der Kette n sind die Beine eines Tiers,
  a Tiere sind a Stäbchen, die Beine zusammen stehen am Pfeilchen. Die Tiere erscheinen erst nach dem Festlegen (Wirkung, nie Zählmaterial, M1).
- **Ehrlich festgehalten (A4):** Für die Ketten 3, 5, 7, 9, 10 gibt die Welt keinen Tiersachgrund; sie laufen ohne Tier, erfunden wird keiner.
  Offen, ob Klee (3 Blättchen) und Heckenrose (5 Blütenblätter) die Lücke füllen.
- **Fakten (K4, Annahme, Quellen vor dem Ausbau prüfen):** Rotkehlchen zwei Beine · Hase vier · Marienkäfer sechs · Spinne acht; einer je Runde (K6).

## 5. Figur
- **Kofi** (`figuren.md` §2), Aufgabe **vorzeigen** (L5): die erste Aufgabe jeder Runde, danach still (B3). **Platz:** links unten in der Hecke,
  Dreiviertel zur Matte, nie im Lernfeld. **Haltungen (vorhanden):** `stehen`, `zeigen`, `nachdenken`, `fragen` (neugierig nach einer Zahl, die nicht
  passt), Rundenende `freuen-klein`/`freuen-gross` im Wechsel. **Gast (F3):** eine Naturschützerin mit Zählbrett am Heckenrand.

## 6. Bildschirm-Skizze
```
┌──────────────────────────────────────────────────────────────────────────┐
│ (⌂) [Mathe] Kettenhüpfer                                            (♪)  │
│             Die 7er-Reihe                                                │
├──────────────────────────────────────────────────────────────────────────┤
│        ┌ Blase: „Wo kommt der Hüpfer an? Tipp die Zahl.“ ……… (🔊) ┐       │
│ ┌ MATTE ─────────────────────────────────────────────┐ ┌ HEFT ─────────┐ │
│ │ 6 · 7 = [ 4 2 ]          ▼7   ▼14  ▼21  ▼28 …      │ │ 1 · 7 = 7  ●  │ │
│ │ 🦗 ●●●●●╎●● ─ ●●●●●╎●● ─ ●●●●●╎●● ─ … (10 Stäbchen)│ │ 2 · 7 = 14 ●  │ │
│ └────────────────────────────────────────────────────┘ └───────────────┘ │
│ Kofi, Tier   [0][1][2][3][4][5][6][7][8][9][⌫]  [ Fertig ]         (?)   │
└──────────────────────────────────────────────────────────────────────────┘
```
- Plätze nach `bedienung.md` §3; Tastatur mit zehn Ziffern und Löschen, Hauptknopf „Fertig“ (§4). Perlengröße aus der Mattenbreite (n = 10 etwa
  1,2 rem, am Gerät prüfen); Ziffern ab 3,2 rem; Heft 8 Zeilen zu 4,4 rem.

## 7. Rückmeldung
- **Passt:** Der Hüpfer landet am Ende von Stäbchen a, das Pfeilchen mit der Zahl rastet ein, das Tier springt als Zeile ins Heft (zusammen etwa 1,8 s,
  Tippen überspringt). Im Wechsel (B4): „Der Hüpfer ist angekommen. Dort steht das Pfeilchen.“ · „Jedes Stäbchen ein Sprung. Das Pfeilchen sitzt am Ende.“ ·
  „Die Zeile steht jetzt im Heft.“
- **Passt nicht:** Der Hüpfer landet an seinem Ort, die getippte Zahl bekommt ihr hohles Pfeilchen an ihrem Platz (sechs Sprünge über die 7er-Kette
  enden woanders als 48), dann gleiten beide zurück, nichts kommt ins Heft (N7). „Der Hüpfer ist hier angekommen. Deine Zahl liegt weiter hinten.“ ·
  „… weiter vorn.“ · „Deine Zahl liegt hinter dem Ende der Kette.“ · „Kofi schaut sich die beiden Pfeilchen an.“
- **Kofi legt vor:** „Kofi fängt mit einem Sprung an. Der Hüpfer ist ein Stäbchen weit gekommen. Dort steht das erste Pfeilchen.“
- **Sachsatz** (Rundenanfang, laut): „Kofi zählt Beine in der Hecke. Ein Rotkehlchen hat zwei Beine. Ein Stäbchen sind die Beine von einem Rotkehlchen.“ ·
  Hase: „… Ein Hase hat vier Beine. … von einem Hasen.“ · Marienkäfer: „… Ein Marienkäfer hat sechs Beine. … von einem Marienkäfer.“ · Kreuzspinne: „… Eine
  Kreuzspinne hat acht Beine. … von einer Kreuzspinne.“ · ohne Tier: „Kofi zählt Stäbchen in der Hecke.“
- **Auftrag** (erste Aufgabe laut, dann still): material „Der Hüpfer springt so viele Stäbchen, wie die erste Zahl sagt. Wo kommt er an? Tipp die Zahl.“ ·
  vorstellung „Die Perlen liegen unter einem Tuch. Wo kommt der Hüpfer an? Tipp die Zahl.“ · kopf „Wo kommt der Hüpfer an? Tipp die Zahl.“
- **Rundenende:** „Das Heft ist voll. Kofi freut sich. Er wollte wissen, wie viele Beine in der Hecke zusammenkommen.“ · ohne Tier: „Die Kette hat viele
  Pfeilchen. Kofi freut sich über die Reihe.“ · Sanft (Annahme, Standard): „Der Hüpfer sitzt auf dem Heft. Kofi stupst ihn an. Er hüpft zurück an den
  Anfang der Kette.“ Alles feste Zeichenketten, Zahlen als Ziffern im Bild, keine Wörter aus §3.2.

## 8. Hilfe-Leiter
Nach dem zweiten Versuch, der nicht passt, leuchtet Hilfe einmal; mit Hilfe Gelöstes zählt nicht als gekonnt (L12).
- **Stufe 1, Probe:** bei a ∉ {1, 2, 5, 10} erscheint das Pfeilchen der nächsten Kernaufgabe mit Zahl und Sonnenring (3 → 2, 4 → 5, 6 → 5, 7 → 5, 8 → 10,
  9 → 10): „Eine Aufgabe in der Nähe kennst du schon. Das Pfeilchen zeigt sie. Wie viele Stäbchen sind es von dort aus?“ Bei einer Kernaufgabe springt der
  Hüpfer langsam bis ein Stäbchen vor das Ziel, Pfeilchen ohne Zahl: „Der Hüpfer springt langsam, Stäbchen für Stäbchen. Zähl bei jedem Stäbchen mit.“
- **Stufe 2, Lösung mit Begründung** (das Kind führt aus): Der Hüpfer springt ans Ziel, das Pfeilchen zeigt die Zahl, die nächste Taste bekommt den Sonnenring
  (`.markiert`): „Vom bekannten Pfeilchen aus springt er noch ein Stück. Hier kommt er an. Tipp die Zahl am Pfeilchen.“ · Kernaufgabe: „So weit springt er.
  Hier kommt er an. Tipp die Zahl am Pfeilchen.“ In vorstellung und kopf hebt sich dabei das Tuch bzw. erscheint die Kette.
- Die Probe ist der Weg über eine sichere Aufgabe (Nachbaraufgabe), keine Bedeutungsregel (§5).

## 9. Stufen
- **material:** Kette offen, jede Perle einzeln, Fünfermarke (M2); der Hüpfer springt nach der Eingabe über sichtbare Perlen.
- **vorstellung:** Perlen unter dem Tuch (Fünfermarke bleibt); sichtbar nur Stäbchengrenzen und die Pfeilchen dieser Runde; nach der Eingabe hebt sich das Tuch.
- **kopf:** nur Aufgabe und Heft; Kette, Hüpfer, Pfeilchen erst nach der Eingabe (Kette als Bedeutung danach).
- **Zuerst gebaut (§8a):** Kl. 2, alle drei Stufen, ruhig und Sanft. **Ausbau:** Teilen (Art `geteilt`, das Kind tippt die Sprungzahl bis zum Pfeilchen, für M35 wieder
  verwendbar), Teiler (Kl. 4, auf welchen Ketten hat die 24 ein Pfeilchen), Abenteuer; jede neue Art ändert Schlüssel (voller Weg).

## 10. Aufgabenschlüssel und arten
- **Art `mal`** (neu in `spiele/aufgabenarten.js`, wiederverwendbar für M35/M36): Schlüssel `mal:<a>*<n>` (a Gruppen zu n), daten `{ a, b: n, c }`, c = a·n; passt zu den
  Proben der Fehlerbilder (`mal:6*7`). Pools ohne Überschneidung (Annahme, Test dazu): Reihen 2, 5, 10 mit a = 1 bis 10; Reihen 3, 4, 6, 7, 8, 9 mit a ∈ {3, 4, 6, 7, 8, 9};
  Kernaufgaben a ∈ {1, 2, 5, 10} mit n ∈ {3, 4, 6, 7, 8, 9}. **`ZIEL_MS.mal` = 8000** (Annahme); `schwierigkeit`: Kernfaktor 0, a ∈ {3, 4, 6, 9} 1, a ∈ {7, 8} 2;
  `darstellbar`: `reihen: [von, bis]` gegen `daten.b`.
- **`lernplan.json`:** `aufgaben` für `zweierreihe` `{ art: "mal", reihe: 2 }`, `zehnerreihe`, `fuenferreihe`, `kernaufgaben-einmaleins` `{ art: "mal", kern: true }`, dann
  `dreierreihe` bis `neunerreihe`; `einfuehrung` dieser Themen zeigt auf `mathe/m37-kettenhuepfer/einfuehrung.json` (Kofi legt die Kette; Stäbe und Ziffern, keine Zahlwörter).
  `einmaleins-gemischt`, `-sicher` bleiben `null` (gesichert aus den Reihen). **`spiele.json`:** `arten: [{ art: "mal", reihen: [2, 10], stufen: [material, vorstellung, kopf] }]`.
- **Meldung:** je Aufgabe `ok`, `hilfe`, `ms` (bis Fertig); Fehlversuche mit der getippten Zahl, soweit der RAHMEN sie annimmt (`einmaleins-nachbar`), sonst Ausbau.
  Test-Schnittstelle: Züge Ziffer, Löschen, Fertig; `fehlversuche: true`. Elternansicht: welche Reihen zuletzt, beschreibend, ohne Vergleich (3.3).

## 11. Spielobjekte
| Ding | Ablage | Zustände, Bewegung | Rolle |
|---|---|---|---|
| Grashüpfer (**Figur des Spiels**, Regal-Bild) | `spiele/objekte/grashuepfer.js` neu | sitzt, springt; Bogen von Stäbchen zu Stäbchen, `anstossen` | Wirkung |
| Rotkehlchen, Hase | `spiele/runde/tiere/` vorhanden | sitzt am Zweig | Sachgrund Beine (Wortbild, T3) |
| Marienkäfer, Kreuzspinne | `spiele/runde/tiere/` neu | sitzt | Sachgrund Beine |
- **Karte:** `karte: { figur: "grashuepfer", zustand: "springt", welt: "wiese-und-hecke" }`, Moment: Sprung über eine Kette. Silhouette schlank gewinkelt mit langen Fühlern und
  Hinterbeinen, anders als die Tonne von M14; `(grashuepfer, wiese-und-hecke, springt)` ist im Fach frei (M35, gleiche Welt, nimmt eine andere Figur, KB6). Symbol: Kopf mit Fühlern.
- **Regal:** `regal: { objekt: "grashuepfer", wert: null }`. Vorn steht die **Perlenkette n** (neue Regel in `material.js`, Art `mal` mit `reihe`) für die Reihen-Themen; der Grashüpfer
  wird sichtbar für `kernaufgaben-einmaleins`, später `einmaleins-gemischt`, `geteilt-*`, `teiler-*`. Bewegung nach §7: Folge der Eingabe, still beim Denken, bei wenig Bewegung sofort am Ende.

## Bausteine
- **Bedienteile, vorhanden:** `<ls-leiste>`, `<ls-blase>`, `<ls-hilfe>`, `<ls-pause>`, `<ls-knopf>` (Fertig), `<ls-tastatur>`, `<ls-perlenstab>` (Einführung, Pause); Geste nur Tippen.
- **Lernzeichen, neu:** `<ls-perlenkette>` in `spiele/rahmen/` (Attribute `reihe`, `pfeile`, `verdeckt`; zehn Stäbchen in Perlenfarbe n, Fünfermarke wie am Stab, Pfeilchen mit Ziffer, hohl
  für die getippte Zahl; Geometrie ohne DOM), Eintrag in `grundsaetze-bilder.md` §4 und `bedienung.md` §9; dazu die Regal-Regel. Heft: schlichte Textzeilen, kein neues Lernzeichen (Annahme).
- **Spielobjekte:** `grashuepfer` neu, Tiere wie in §11; Szene von Hand. **Rahmen:** `rahmen/` (Perlenkette, `material.js`), `aufgabenarten.js`, `lernplan.json` ändern sich; `kern/`,
  `lernsteuerung.js` und der RAHMEN der Vorlage bleiben, die Einführung läuft über `EINFUEHRUNG`.

## Freigabe nötig
Keine: Perlenkette, Pfeilchen und Art `mal` deckt Christians Auftrag vom 2026-11-14 samt Katalog-Eintrag; keine offene Frage aus `grundsaetze-bilder.md` §15 (die Pause zeigt Kette und Heft,
keinen Sachfakt, also kein Echt-Zeichen). Zur Kenntnis: Sachgrund nur für 2, 4, 6, 8 (§4).

## Selbstprüfung `grundsaetze.md` §12
Zweck, eine Schwierigkeit, Abruf vor dem Sehen, Mechanik zeigt den Ort, Fehler-Folge stiller, Hilfe mit Probe, Wiedervorlage über die Lernsteuerung, erst zeigen (Kofi), keine Punkte oder Timer,
Fachbegriffe nach §5.1, Geschichte ruhig, Sachthema am Sachgrund (K1); offen benannt: Ketten ohne Tier.
