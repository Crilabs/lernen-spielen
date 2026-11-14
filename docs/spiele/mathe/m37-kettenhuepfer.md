# M37 Kettenhüpfer – Spielentwurf

- **Katalog-Id:** M37 · „Kettenhüpfer“ · Mathe · `spiele/mathe/m37-kettenhuepfer/` · Heimatwelt `wiese-und-hecke` (Forschen, Rätsel) · **Stand:** 2026-11-14 (nach Prüfung A, Runde 1) ·
  **(Annahme)** = korrigierbar.
- **Weg: voller Weg** – neue Aufgabenart `mal` (`aufgabenarten.js` mit `ZIEL_MS`, `aufgaben` in `lernplan.json`), neues Lernzeichen Perlenkette (Christian 2026-11-14, mit dem Katalog-Eintrag),
  Änderungen in `spiele/rahmen/`.
- **Abweichungen vom Katalog-Eintrag (Grund):**
  1. **Kein hüpfendes Tier und kein hüpfendes Kind.** Der Grashüpfer aus der ersten Fassung war eine zweite Geschichte über dem Beinezählen (A4b). Es hüpft das **Zählpfeilchen**, ein Teil des
     Lernzeichens (Pfeilchen der Perlenkette, wie in der Spec 2026-11-13); der Name „Kettenhüpfer“ bleibt. Figur des Spiels ist der **Marienkäfer** (Sachgrund und Karte, §11).
  2. **Eine Figur der Runde, eine Aufgabe: Kofi, vorzeigen** (`figuren.md` §3), nicht Timo und Ela. Verteilung: M14 Timo, Einführungen Ela.
  3. **Sachgrund nicht nur Beine**, sondern gleich viele Teile je Ding der Hecke (Beine, Blättchen, Kronblätter, Punkte): Nur so trägt die Welt auch 3, 5, 7 (§4). Der Katalog nennt nur Beine.
  4. **Sanft ohne Anstupsen** (§7, A9). 5. Kernaufgaben zuerst über die Themenfolge, nicht über Pakete der Spec. 6. Mach mit (Lena) kommt als Karte vom Skill „Mit echten Dingen“ (Branch `echte-dinge-m37`).

## 1. Zweck in der Spielwelt
- Kofi zählt in der Hecke, wie viele Beine, Blättchen, Blütenblätter oder Punkte a Tiere bzw. Pflanzen zusammen haben, und führt Heft: Jede richtige Zahl setzt ein Pfeilchen auf die Kette und eine Zeile ins Heft.
  Ohne das Ergebnis gibt es keine Zeile. **Für 9 und 10 trägt die Hecke noch keinen Sachgrund** (§4, „Freigabe nötig“, Frage 1).

## 2. Die Runde in fünf Sätzen
1. Auf der Matte liegt die Perlenkette von n (zehn Stäbchen zu je n Perlen), oben steht „6 · 7 = ▢“, am Zweig der Hecke ist noch nichts, rechts liegt das Heft.
2. Der Erzähler stellt die Aufgabe in der Sache („Sechs Siebenpunkt-Käfer. Wie viele Punkte sind es zusammen?“); die erste Aufgabe jeder Runde legt Kofi vor (Pfeilchen am ersten Stäbchen).
3. Das Kind tippt die Zahl auf der Bildschirm-Tastatur und bestätigt mit „Fertig“ (erst festlegen, dann sehen, L2).
4. Das Zählpfeilchen hüpft Stäbchen für Stäbchen. Passt die Zahl: Bei jedem Stäbchen setzt sich ein Tier an den Zweig (a Tiere), das Pfeilchen mit der Zahl rastet am a-ten Stäbchen ein, die Zeile mit Kurzkette steht im Heft.
   Passt sie nicht: Das Pfeilchen hält am a-ten Stäbchen, die getippte Zahl liegt als hohles Pfeilchen an ihrem Ort auf der Kette, nichts kommt ins Heft, die Aufgabe bleibt.
5. Nach etwa 8 Aufgaben (höchstens 4 Minuten) ist das Heft voll; dann Pause.

## 3. Lernhandlung = Spielhandlung
- Das Ergebnis von a · n abrufen und tippen; die Kette prüft es. Ohne die Aufgabe gibt es kein Ziel des Pfeilchens. Eine Schwierigkeit (A2): Abruf.

## 4. Sachwelt und Sachgrund (A4, A4b, K2, K4)
- **Welt:** Zählung in der Hecke, Palette „Wiese und Wald“, Flächen von Hand. Nur Hecke, Zweig, Tiere und Pflanzen, Heft, Kette. **Eine Sache:** Die Kette ist die Sache gezählt (ein Stäbchen = die Teile
  eines Dings, n Perlen); das Pfeilchen läuft die Dinge ab. Die Tiere sind Wirkung, nie Zählmaterial (M1). Jede Aufgabe fragt in der Sache, nie „wo kommt es an“.
- **Sachgrund je Kette (Faktensatz der Welt mit diesem Spiel, K4; belegt = Quelle geprüft am 2026-11-14):**

| n | Ding | Teile je Ding | Quelle |
|---|---|---|---|
| 2 | Rotkehlchen | 2 Beine | **offen:** vor dem Bau eintragen (Annahme) |
| 3 | Weißklee, ein Blatt | 3 Blättchen | belegt: de.wikipedia.org/wiki/Weiß-Klee („dreizählig gefingert“) |
| 4 | Feldhase | 4 Beine | **offen:** vor dem Bau eintragen (Annahme) |
| 5 | Hundsrose (Heckenrose), eine Blüte | 5 Kronblätter | belegt: de.wikipedia.org/wiki/Hunds-Rose („Die fünf Kronblätter …“) |
| 6 | Marienkäfer (Insekt) | 6 Beine | belegt: de.wikipedia.org/wiki/Webspinnen („Insekten … sechs Beine“) |
| 7 | Siebenpunkt-Marienkäfer | 7 Punkte | belegt: de.wikipedia.org/wiki/Siebenpunkt-Marienkäfer (drei je Deckflügel, einer auf dem Schildchen) |
| 8 | Kreuzspinne | 8 Beine | belegt: de.wikipedia.org/wiki/Webspinnen („wie alle Spinnentiere acht Beine“) |
| 9, 10 | – | – | kein Fakt gefunden, nichts erfunden (Frage 1) |

- **Für 9 und 10 (Annahme, bis Frage 1 entschieden ist):** Die Naturschützerin zählt mit dem Zählbrett; eine Zeile ist eine Strichliste mit n Strichen (Zählweise, kein Sachfakt). Das ist schwächer als ein Tier:
  es trägt die Aufgabe als Zählung, nicht als Eigenschaft der Hecke. Offen benannt, nicht verdeckt.
- **K6:** höchstens ein neuer Fakt je Runde; schon erzählte Fakten zählen nicht neu. In Runden mit gemischten Ketten (Kernaufgaben) nimmt das Spiel aus den fälligen Aufgaben nur Ketten mit höchstens einer neuen (Annahme, im Bau prüfen).
  Fakten stehen am Sachbild, nie als Ich-Erlebnis einer Figur (F8, K3). Pause: kein Echt-Zeichen nötig, nur Kette und Heft.

## 5. Figur
- **Kofi** (`figuren.md` §2), Aufgabe **vorzeigen** (L5), sonst nichts: die erste Aufgabe jeder Runde (Haltungen `zeigen`, `nachdenken`), danach `stehen` (B3). Kein Freuen, Fragen oder Anstupsen.
  **Platz:** links unten in der Hecke, Dreiviertel zur Matte, nie im Lernfeld. **Gast (F3, Soll):** eine Naturschützerin mit Zählbrett am Heckenrand (Bild, ohne Aufgabe; Zählbrett-Zeile bei 9 und 10).

## 6. Bildschirm-Skizze
```
┌──────────────────────────────────────────────────────────────────────────┐
│ (⌂) [Mathe] Kettenhüpfer                                            (♪)  │
│             Die 7er-Reihe                                                │
├──────────────────────────────────────────────────────────────────────────┤
│   ┌ Blase: „Sechs Siebenpunkt-Käfer. Wie viele Punkte sind es zusammen?“ (🔊) ┐
│ ┌ MATTE ─────────────────────────────────────────────┐ ┌ HEFT ─────────┐ │
│ │ 6 · 7 = [ 4 2 ]     Zweig: 🐞🐞🐞🐞🐞🐞 (nach Fertig)│ │ 1 · 7 = 7  ▪  │ │
│ │ ●●●●●╎●● ─ ●●●●●╎●● ─ ●●●●●╎●● ─ … ▼7 ▼14 ▼21 …   │ │ 2 · 7 = 14 ▪▪ │ │
│ └────────────────────────────────────────────────────┘ └───────────────┘ │
│ Kofi         [0][1][2][3][4][5][6][7][8][9][⌫]  [ Fertig ]         (?)   │
└──────────────────────────────────────────────────────────────────────────┘
```
- Plätze nach `bedienung.md` §3; zehn Ziffern und Löschen, Hauptknopf „Fertig“ (§4). Perlengröße aus der Mattenbreite (n = 10 etwa 1,2 rem, am Gerät prüfen); Ziffern ab 3,2 rem; Heft 8 Zeilen zu 4,4 rem.

## 7. Rückmeldung
- **Passt:** Zählpfeilchen und Tiere (zusammen etwa 1,8 s, Tippen überspringt), Pfeilchen mit Zahl rastet ein, Zeile mit Kurzkette im Heft. Im Wechsel (B4): „Jedes Tier ein Stäbchen. Das Pfeilchen zeigt die Zahl.“ ·
  „Das Pfeilchen sitzt am letzten Stäbchen.“ · „Die Zeile steht jetzt im Heft.“
- **Passt nicht:** Pfeilchen hält am a-ten Stäbchen (Ring, ohne Zahl), keine Tiere (N7), hohles Pfeilchen der getippten Zahl, dann gleiten beide zurück. „Das Pfeilchen sitzt hier. Deine Zahl liegt weiter hinten.“ ·
  „… weiter vorn.“ · „Deine Zahl liegt hinter dem Ende der Kette.“ Keine Figurenreaktion außer `nachdenken` von Kofi nur in der ersten Aufgabe.
- **Kofi legt vor:** „Kofi legt die erste Aufgabe. Ein Tier, ein Stäbchen. Dort steht das erste Pfeilchen.“
- **Sachsatz** (Rundenanfang, laut; Muster, Dinge aus der Tabelle in §4, im Daten-Satz ausgeschrieben je Ding): „Kofi zählt in der Hecke. Ein Marienkäfer hat sechs Beine. Ein Stäbchen sind die Beine von einem Marienkäfer.“ ·
  Siebenpunkt: „… Ein Siebenpunkt-Marienkäfer hat sieben Punkte. Ein Stäbchen sind die Punkte von einem Käfer.“ · Klee: „… Ein Kleeblatt hat drei Blättchen. …“ · Rose: „… Eine Heckenrose hat fünf Blütenblätter. …“ ·
  9, 10: „Die Naturschützerin zählt mit dem Zählbrett. Eine Zeile sind zehn Striche. Ein Stäbchen ist eine Zeile.“
- **Auftrag** (Muster aus Daten, a als Zahlwort 1–10; erste Aufgabe laut, dann still): „Sechs Marienkäfer. Wie viele Beine sind es zusammen?“ · „Ein Hase. Wie viele Beine sind es zusammen?“ ·
  „Fünf Zeilen. Wie viele Striche sind es zusammen?“ Alle Stufen gleich; Ziffern „6 · 7 = ▢“ stehen im Bild.
- **Rundenende:** „Das Heft ist voll. Kofi hat Marienkäfer gezählt.“ (Ding je Kette) · Kern: „Das Heft ist voll. Kofi hat in der Hecke gezählt.“ · 9, 10: „Das Heft ist voll. Die Zeilen stehen auf dem Zählbrett.“
  Alles feste Zeichenketten, keine Wörter aus 3.2. Wo ein Muster Zahlwörter braucht, steht jede Fassung 1–10 vollständig in `texte.json`.
- **Sanft (Annahme, Standard; Abweichung von `welten.md` mit Grund):** Die Katalog-Fassung („48 Beine, von wem? Auf welchen Ketten hat die 48 ein Pfeilchen?“) ist Teilerstoff (Kl. 4, `teiler-vielfache`) und passt nicht zu den Reihen der Klasse 2;
  sie kommt als Aufgabe in den Ausbau (Teiler). Für die Reihen: Am Rundenende ist eine Zeile im Heft verwischt; das Pfeilchen auf der Kette zeigt noch, wohin sie gehört, dann steht sie wieder da
  („Im Heft ist eine Zeile verwischt. Das Pfeilchen auf der Kette zeigt noch, wo sie hingehört. Jetzt steht sie wieder da.“): kleine Komplikation, sofort gelöst (9.3), ohne Tier-Eingriff.
- **Abenteuer (nur auf Wunsch, Bogen mitgeplant, §8a):** Abendzählung in vier Rundenenden: 1 „Die Sonne geht unter. Die Naturschützerin zählt weiter.“ · 2 „Es knackt im Gebüsch.“ · 3 „Ein Reh schaut heraus und geht weiter.“ ·
  4 „Die Jahresliste der Hecke ist fertig.“ Auswahl nach der Zahl der Runden dieses Spiels (Annahme; bietet die Vorlage keinen Zähler, kommt Abenteuer erst im Ausbau). Jede Runde endet in Ruhe.
- **Vorschau für Eltern (9.3, §12):** Ruhig: Kofi zählt in der Hecke, das Heft wird voll. Sanft: Eine Zeile im Heft ist verwischt, das Pfeilchen zeigt, wohin sie gehört; am Ende steht sie wieder da.
  Abenteuer: Abendzählung über vier Runden mit der Naturschützerin; es knackt im Gebüsch, ein Reh schaut heraus und geht weiter, am Ende steht die Jahresliste.

## 8. Hilfe-Leiter
Nach dem zweiten Versuch, der nicht passt, leuchtet Hilfe einmal; mit Hilfe Gelöstes zählt nicht als gekonnt (L12). Fachbegriffe wörtlich (§5.1). Die Probe ist **nie Hochzählen**: Sie geht über eine Kernaufgabe, deren Ergebnis das Kind abrufen kann.
- **Stufe 1, Probe** (Pfeilchen mit Zahl und Sonnenring am Ende der gemeinten Stelle; in vorstellung hebt sich das Tuch nur bis dort, in kopf erscheint unter der Aufgabe eine Kurzkette mit diesem Pfeilchen):
  - a ∈ {3, 4, 6, 7, 8, 9}, Nachbaraufgabe: Pfeilchen der nächsten Kernaufgabe (3 → 2, 4 → 5, 6 → 5, 7 → 5, 8 → 10, 9 → 10): „Das Pfeilchen zeigt eine Kernaufgabe. Deine Aufgabe ist ihre Nachbaraufgabe. Wie viele Stäbchen liegen dazwischen?“
  - a = 5: Pfeilchen am Kettenende mit 10 · n: „Zehn Stäbchen sind die Kernaufgabe mal 10. Fünf Stäbchen sind die Hälfte. Wie viel ist die Hälfte?“ · a = 2: Pfeilchen am ersten Stäbchen mit n: „Das erste Stäbchen ist die Kernaufgabe mal 1. Das zweite Stäbchen ist genauso. Wie viel ist das Doppelte?“ ·
    a = 10: Tauschaufgabe, im Bild n Zehnerstäbe (`<ls-perlenstab>`): „Die Tauschaufgabe sind Zehner. Wie viele Zehner sind es?“ · a = 1: Pfeilchen ohne Zahl am ersten Stäbchen: „Ein Stäbchen. Wie viele Perlen liegen darauf?“
- **Stufe 2, Lösung mit Begründung** (das Kind führt aus; die nächste Taste bekommt den Sonnenring, `.markiert`): Nachbaraufgabe, Ringe an den Stäbchen zwischen Kernpfeilchen und Ziel, im Bild „35 + 7“ bzw. „35 − 7“:
  „Von der Kernaufgabe geht es ein Stäbchen weiter. Zum Ergebnis kommen die Perlen von einem Stäbchen dazu. Tipp die Zahl am Pfeilchen.“ (Fassungen: ein/zwei Stäbchen, weiter/zurück; zurück: „… Die Perlen von einem Stäbchen gehen weg.“) ·
  Hälfte: „Fünf Stäbchen sind die Hälfte von zehn. Das Ergebnis ist halb so groß. Tipp die Zahl am Pfeilchen.“ · Doppeltes: „Zwei Stäbchen sind das Doppelte von einem. Das Ergebnis ist doppelt so groß. Tipp die Zahl am Pfeilchen.“ ·
  Zehner: „So viele Zehner, so viele Zehnerstäbe. Tipp die Zahl am Pfeilchen.“ · Eins: „Tipp die Zahl am Pfeilchen.“ Zahlen stehen als Ziffern im Bild.

## 9. Stufen
- **material:** Kette offen, jede Perle einzeln, Fünfermarke (M2); das Pfeilchen hüpft nach der Eingabe über sichtbare Perlen.
- **vorstellung:** Perlen unter dem Tuch (Fünfermarke bleibt), sichtbar nur Stäbchengrenzen; nach der Eingabe hebt sich das Tuch.
- **kopf:** nur Aufgabe und Heft; Kette erscheint erst nach der Eingabe (Kette als Bedeutung danach).
- **Das Gelernte bleibt (A6b):** In allen Stufen bleiben nach der Wirkung Kette und das eingerastete Pfeilchen bis zur nächsten Aufgabe stehen (in kopf bleibt die Kurzkette der Zeile), die Heftzeile bleibt bis Rundenende. **Reihen-Themen:**
  eine feste Kette n, ihre Pfeilchen sammeln sich auf ihr (Rundenende: „die Reihe voller Pfeilchen“). **Gemischte Ketten (Kernaufgaben, n wechselt):** Auf der Matte liegt nur die Kette der laufenden Aufgabe; jede gelöste Aufgabe
  bleibt als **Heftzeile „a · n = c“ mit Kurzkette** (a kleine Stäbchen in der Perlenfarbe von n, Pfeilchen c) stehen; „Heft voll“ heißt acht solche Zeilen. Das Tier steht nie im Heft.
- **Zuerst gebaut (§8a):** zweierreihe, zehnerreihe, fuenferreihe, kernaufgaben-einmaleins, Kl. 2, alle drei Stufen, ruhig und Sanft. **Ausbau:** Reihen 3, 4, 6–9, Teilen (Art `geteilt`, das Kind tippt die Sprungzahl bis zum Pfeilchen, für M35 wiederverwendbar), Teiler (Kl. 4: auf welchen Ketten hat die 24 ein Pfeilchen), Abenteuer.

## 10. Aufgabenschlüssel und arten
- **Art `mal`** (neu in `spiele/aufgabenarten.js`, wiederverwendbar für M35/M36, nichts Kettenhüpfer-Eigenes): Schlüssel `mal:<a>*<n>` (a Gruppen zu n, a ist die Schrittzahl, n die Reihe; wie `mal:6*7` in `lernplan.json`), daten `{ a, b: n, c }`, c = a·n.
  Pools ohne Überschneidung (Annahme, Test dazu): Reihen 2, 5, 10 mit a = 1 bis 10; Reihen 3, 4, 6, 7, 8, 9 mit a ∈ {3, 4, 6, 7, 8, 9}; Kernaufgaben a ∈ {1, 2, 5, 10} mit n ∈ {3, 4, 6, 7, 8, 9}.
  **`ZIEL_MS.mal` = 8000** (Annahme); `schwierigkeit`: Kernfaktor 0, a ∈ {3, 4, 6, 9} 1, a ∈ {7, 8} 2; `darstellbar`: `reihen: [von, bis]` gegen `daten.b`.
- **Fehlerbilder, Faktorreihenfolge abgeglichen:** `einmaleins-nachbar` vergleicht die getippte Zahl mit a·(n ± 1) und (a ± 1)·n (beide Faktoren, `daten.a` und `daten.b`). `einmaleins-hochzaehlen` meint die Zahl der Schritte, also `daten.a`
  (Hochzählen einer Reihe braucht a Schritte); die Beschreibung der Signatur in `lernplan.json` („zweiter Faktor“) wird im Bau auf „Schrittzahl“ angepasst, falls dort `daten.b` gemeint wäre; der Schlüssel bleibt.
- **`lernplan.json`:** `aufgaben` für `zweierreihe` `{ art: "mal", reihe: 2 }`, `zehnerreihe`, `fuenferreihe`, `kernaufgaben-einmaleins` `{ art: "mal", kern: true }`, dann `dreierreihe` bis `neunerreihe`; `einfuehrung` dieser Themen
  zeigt auf `mathe/m37-kettenhuepfer/einfuehrung.json` (Kofi legt die Kette; Stäbe und Ziffern). Die Welt `wiese-und-hecke` bekommt ihre `fakten` (§4, mit Quelle). `einmaleins-gemischt`, `-sicher` bleiben `null`. **`spiele.json`:** `arten: [{ art: "mal", reihen: [2, 10], stufen: [material, vorstellung, kopf] }]`.
- **Meldung:** je Aufgabe `ok`, `hilfe`, `ms` (bis Fertig); Fehlversuche mit der getippten Zahl, soweit der RAHMEN sie annimmt (`einmaleins-nachbar`), sonst Ausbau. Test-Schnittstelle: Züge Ziffer, Löschen, Fertig; `fehlversuche: true`.
  Elternansicht: welche Reihen zuletzt, beschreibend, ohne Vergleich (3.3).

## 11. Spielobjekte
| Ding | Ablage | Zustände, Bewegung | Rolle |
|---|---|---|---|
| Marienkäfer (**Figur des Spiels**, Regal-Bild, Karte) | `spiele/objekte/marienkaefer.js` neu | `sitzt` (sechs Beine), `sieben-punkte`; kleine Krabbelbewegung, `anstossen` | Wirkung; Sachgrund 6 und 7 |
| Rotkehlchen, Hase | `spiele/runde/tiere/` vorhanden | sitzt am Zweig | Wirkung (Wortbild, T3) |
| Kreuzspinne, Weißklee-Blatt, Heckenrose-Blüte | `spiele/runde/tiere/` bzw. `spiele/objekte/` neu | sitzen / liegen am Zweig | Wirkung |
- **Karte:** `karte: { figur: "marienkaefer", zustand: "sitzt", welt: "wiese-und-hecke" }`; Moment: ein Käfer auf einem Heckenzweig; Silhouette rundlich gewölbt mit kleinem Kopf und sechs Beinen, anders als die Tonne von M14. Ohne Perlen,
  Ziffern, Text. `(marienkaefer, wiese-und-hecke, sitzt)` ist im Fach frei; M35 (gleiche Welt) nimmt eine andere Figur oder einen anderen Zustand (KB6). Symbol: Käferkopf mit Fühlern.
- **Regal:** `regal: { objekt: "marienkaefer", wert: null }`. Vorn steht die **Perlenkette n** (neue Regel in `material.js`, Art `mal` mit `reihe`) für die Reihen-Themen; der Käfer wird sichtbar für `kernaufgaben-einmaleins`, später `einmaleins-gemischt`, `geteilt-*`, `teiler-*`.
  Bewegung nach §7: Folge der Eingabe, still beim Denken, bei wenig Bewegung sofort am Ende.

## Bausteine
- **Bedienteile, vorhanden:** `<ls-leiste>`, `<ls-blase>`, `<ls-hilfe>`, `<ls-pause>`, `<ls-knopf>` (Fertig), `<ls-tastatur>`, `<ls-perlenstab>` (Einführung, Pause, Hilfe); Geste nur Tippen.
- **Lernzeichen, neu:** `<ls-perlenkette>` in `spiele/rahmen/` (Attribute `reihe`, `pfeile`, `verdeckt`, `kurz`; zehn Stäbchen in Perlenfarbe n, Fünfermarke wie am Stab, Pfeilchen mit Ziffer, hohl für die getippte Zahl; Zählpfeilchen läuft über die Stäbchen;
  Geometrie ohne DOM), Eintrag in `grundsaetze-bilder.md` §4 und `bedienung.md` §9, dazu die Regal-Regel. Heftzeile: Textzeile plus `kurz`-Kette, kein weiteres Zeichen (Annahme).
- **Spielobjekte:** wie §11, Szene von Hand. **Rahmen:** `rahmen/` (Perlenkette, `material.js`), `aufgabenarten.js`, `lernplan.json` ändern sich; `kern/`, `lernsteuerung.js` und der RAHMEN der Vorlage bleiben, Einführung über `EINFUEHRUNG`.

## Freigabe nötig
1. **Sachgrund für 9 und 10 (Neunerreihe, Zehnerreihe, also eines der zuerst gebauten Themen).** Die Hecke liefert keinen geprüften Fakt „gleich viele … je Ding“ (kein Tier mit 9 oder 10 Beinen, Blättchen, Blütenblättern; Zehnfußkrebse leben nicht in der Hecke).
   Optionen: (a) Zählbrett der Naturschützerin mit Zeilen zu n Strichen (jetzt eingebaut, Annahme; Zählweise statt Sachfakt, K2 nur schwach); (b) für 9 und 10 die Welt wechseln (Kalender: zehn Tage eines Beobachtungsheftes, Wochen zu sieben Tagen passen zur 7);
   (c) zehnerreihe und neunerreihe in einem anderen Spiel mit passender Welt üben. **Empfehlung (a) bis zur Entscheidung, danach (c) prüfen.**
2. Neues im Entwurf gegenüber Christians Auftrag und Katalog: **Sachgrund über Beine hinaus** (Blättchen, Kronblätter, Punkte, §4) und **Marienkäfer als Figur des Spiels** statt Grashüpfer. Beides folgt aus A4/A4b; Rückfrage, ob das so gilt.
   Keine offene Frage aus `grundsaetze-bilder.md` §15; Perlenkette, Pfeilchen und Art `mal` deckt Christians Auftrag.

## Selbstprüfung `grundsaetze.md` §12
Zweck, eine Schwierigkeit, Abruf vor dem Sehen, Mechanik zeigt den Ort, Fehler-Folge stiller (keine Tiere), Hilfe mit Probe über Kernaufgaben (nie Hochzählen), Wiedervorlage über die Lernsteuerung, erst zeigen (Kofi), keine Punkte oder Timer,
Fachbegriffe nach §5.1 (Kernaufgabe, Nachbaraufgabe, Tauschaufgabe), Geschichte ruhig mit Elternvorschau, Sachthema am Sachgrund (K1, K2); offen benannt: 9 und 10, Quellen für Rotkehlchen und Hase.
