# Spielbau: vom Katalog-Eintrag zum Spiel, das Spaß macht

Stand: 2026-11-15 · gilt ab sofort für jedes neue Spiel (Christian, 2026-11-15: „Fokus ist spielerisch und schöne
Grafiken/Animationen“) · löst den Ablauf in [`spielentwicklung.md`](spielentwicklung.md) ab (dort gelten weiter:
Ablage, Spielobjekte mit Schnittstelle, Regal-Bild, Kartenbild, Kosten-Posten).
Markierung: **(Christian)** entschieden · **(Annahme)** Vorschlag, korrigierbar.

## Warum neu

M37 Kettenhüpfer kostete 123 € und zehn Stunden, und das Ergebnis wird als Lernen wahrgenommen, nicht als Spiel
**(Christian, 2026-11-15)**. Das alte Kettenhüpfer vom 13.11. war intuitiv, schnell und hat Spaß gemacht: Fokus war
das Spiel, gelernt wurde nebenbei. Zwei Ursachen:

1. **Jede Regel fügte etwas hinzu, keine nahm etwas weg.** Sachgrund je Zahl, Echt-Zeichen, Figur legt jede Runde
   vor, Vorratsliste, drei Stimmungen, Hilfe mit Fachbegriffen – jede für sich begründet, zusammen ein Spiel, das man
   erst verstehen muss.
2. **Prüfer finden nur, was fehlt.** Eine Tabelle grün/rot je Kriterium kann „zu viel“ nicht melden; jede rote Zeile
   wurde durch mehr Inhalt grün. Drei Runden mit vier Prüfern schichteten immer weiter auf.

Dazu die Kosten: 97 % der Token waren Cache-Lesen, weil jeder Agent rund 220 000 Token Dokumente bei jedem Zug mit
sich trug, und ein Viertel der Kosten war die Steuerung durch ein Sprachmodell.

**Ziel (Christian, 2026-11-15):** 5–10 € und 1–2 Stunden je Spiel. Schlichte Spiele sind billiger zu bauen und
machen mehr Spaß; beides kommt aus derselben Änderung.

<!-- regeln -->
**Vorrang:** §1 Spielkern und §8 Zeigen statt erklären gehen jeder anderen Regel vor – den Grundsätzen, den
Checklisten in `grundsaetze-bilder.md` §13 und `bedienung.md` §10, den Kriterien A1–A12, W-… und Kartenbild in
`spielentwicklung.md` und jedem Katalog-Eintrag. Widerspricht eine ältere Pflicht dem Spielkern, gilt der Spielkern.
Die Grenzen §5 (G1–G14) bleiben immer.

### §1 Der Spielkern (vor allen anderen Regeln)

Ein Spiel hat genau einen Kern, und alles andere muss sich vor ihm rechtfertigen:

- **Ein Held:** eine Figur oder Sache, die etwas *tut* – hüpft, rollt, baut, fliegt, wächst. Ein Kind der Runde
  oder die Figur des Spiels. Ein Pfeil oder eine Zeile ist kein Held.
- **Eine Handlung des Kindes**, und sie ist die Lernhandlung (tippen, ziehen, legen). Nicht zwei.
- **Eine Wirkung**, die man sieht und hört: Sie beginnt sofort (unter 0,3 s nach dem Tippen), dauert etwa 2,5 s,
  höchstens 3 s (wie `grundsaetze-bilder.md` B6), und endet in einem Bild, das bleibt. Der nächste Tipp überspringt sie.
- **Ein Takt:** Für ein sicheres Kind vergehen von der Aufgabe bis zur nächsten Aufgabe unter 10 s.
- **Fünf-Sekunden-Test:** Wer das Spiel einmal vorgemacht bekommen hat (Einführung), weiß ohne Satz, was zu tun ist.
- **Spielbar ohne Ton und ohne Lesen** des Erzählers – die Sache zeigt alles; die Stimme ist Zugang, nicht Anleitung.

**Vorbild: das alte Kettenhüpfer** (13.11., ansehen mit `git show 4633d0a:spiele/einmaleins.html`). Die Perlenkette liegt auf
dem Teppich, die Figur steht davor. Oben steht „6 · 7 = ▢“. Das Kind tippt 42 und „los“: Die Figur hüpft Stäbchen
für Stäbchen über die Kette, jeder Hüpfer ein Ton, eine Stufe höher als der vorige, das Stäbchen leuchtet kurz auf;
das Pfeilchen „42“ fliegt aus der Anzeige an seine Stelle und rastet mit einem Plopp ein, die Figur macht einen
kleinen Freudensprung. Tippt es 48, hüpft die Figur trotzdem sechs Stäbchen; das Pfeilchen „48“ fliegt an die Stelle,
wo 48 wirklich liegt, wackelt, und die Figur dreht den Kopf verdutzt dorthin – an ihrem Platz hängt ein leeres „?“.
Ein Satz in der Blase: „6 Stäbchen sind nicht 48.“ Kein Korb, keine Liste, keine Packungsgeschichte. Gelernt wird
nebenbei, weil die Kette das Einmaleins *ist*.

### §2 Herausforderung kommt aus dem Stoff, nicht aus der Hülle

| darf mit dem Thema wachsen | bleibt in allen Klassen schlicht |
|---|---|
| Schwierigkeit: größere Zahlen, mehr Schritte, weniger Hilfe | Zahl der Figuren, Objekte und Anzeigen auf dem Bildschirm |
| Lernstufen material → vorstellung → kopf | Erzählschichten (Sachgrund je Zahl, Vorzeigen jede Runde, Wechselsätze) |
| **Entscheidungen** des Kindes: Weg wählen, knobeln, planen, vorhersagen | **Erklärungen** an das Kind |
| Textmenge, wenn das Kind selbst liest (etwa ab Kl. 3) | Fachbegriffe in der Hilfe, wo eine Zahl im Bild reicht |
| Tempo und Länge der Runde | Wie schnell nach dem Tippen etwas passiert |

Leichte Themen für kleine Kinder dürfen ganz intuitiv sein; schwerere wollen mehr Herausforderung, aber der
Unterschied zwischen Vorschule und Kl. 4 ist nicht riesig **(Christian, 2026-11-15)**. Themen, die von Natur aus
mehrere Schritte haben (schriftlich rechnen, Satzglieder bestimmen), bekommen mehr Ablauf – jeder Schritt ist Stoff,
keiner ist Geschichte. Die Idee nennt in einer Zeile: **Woher kommt die Schwierigkeit?** Die Antwort liegt im Stoff
oder in einer Entscheidung des Kindes, nie in der Bedienung.

### §3 Textbudget (Annahme)

- **Je Aufgabe höchstens ein Satz** des Erzählers, oft keiner (die Gleichung, das Wort oder das Bild stellt die
  Aufgabe). Passt es: meist kein Satz – die Sache zeigt es; wenn einer, dann höchstens sechs Wörter („6 · 7 = 42.“).
- **Passt es nicht:** ein Satz, der beschreibt, was ist („6 Stäbchen sind nicht 48.“).
- **Hilfe:** Zahlen und Zeichen im Bild, dazu höchstens ein Satz mit höchstens zehn Wörtern, in den Wörtern des Kindes
  („5 · 7 = 35. Und noch ein Stäbchen?“). Fachbegriffe nur, wenn sie das Thema selbst sind.
- **Rundenanfang:** höchstens ein Satz. **Einführung:** höchstens drei Schritte mit je einem Satz, im Tempo des Kindes (§8).
- **Satzlänge:** bis Kl. 2 höchstens 8 Wörter, Kl. 3–4 höchstens 12.
- **Alle festen Texte eines Spiels zusammen** (ohne die aus Daten erzeugten Varianten je Zahl): höchstens etwa
  2 500 Zeichen. M37 hatte 10 200.

### §4 Schön und flüssig

- **Stil der Runde** (`docs/figuren.md`, Silhouette, Stufen-Schatten) und **Farbwelt** (`docs/grundsaetze-bilder.md`
  §6.2: Perlen in Montessori-Farben, Stellenwerte türkis/orange/schiefer, Welt-Schicht heller und weicher). Die Welt
  ist eine **Bühne**: ein ruhiger Hintergrund mit ein, zwei Dingen der Welt, nie ein Wimmelbild.
- **Bewegung mit Gewicht:** Sprünge im Bogen mit Bodenkontakt (Landung leicht gestaucht, dann zurück), Einrasten mit
  kurzem Überschwingen, Dinge fallen mit Beschleunigung und setzen auf. Nur `transform` und `opacity` animieren (Web
  Animations API oder CSS), 60 Bilder je Sekunde, kein Ruckeln, keine Layout-Sprünge.
- **Ton:** kurze, freundliche Klänge aus Web Audio (steigende Hüpfer, Plopp, weiches „Boing“), nie laut; Ton aus gilt.
- **Freude mit Abwechslung:** Die Wirkung einer richtigen Antwort hat zwei bis drei Varianten und ist nicht jedes
  Mal gleich groß (N5). Ab und zu ein kleiner Witz der Figur (sie wackelt, schaut, staunt) – nie bei jeder Aufgabe.
- **Daneben ist ruhig, aber nicht tot:** Die Sache zeigt, wo die getippte Zahl wirklich liegt; die Figur schaut
  neugierig hin. Nie reizvoller als richtig (N7).
- **Wenig Bewegung** (`prefers-reduced-motion`): gleiche Schritte, ohne Flug.

### §5 Grenzen – gelten immer, werden geprüft

| Nr. | Grenze | Quelle |
|---|---|---|
| G1 | **Die Sache urteilt, die Stimme beschreibt.** Kein Lob, kein Tadel, kein Vergleich; keine Wörter der Wortliste (super, toll, falsch, leider, schon wieder, Fehler, schlau …). Anrede „du“ oder Name, ohne Geschlechtsform. | `grundsaetze.md` §0, §3.1, §3.2 |
| G2 | **Keine erwarteten Belohnungen:** keine Punkte, Sterne, Münzen als Belohnung, Abzeichen, Streaks, Leben, Timer, Ranglisten. Fortschritt zeigt die Sache. | N5, N8 |
| G3 | **Keine manipulativen Muster:** keine traurige Figur beim Verlassen, kein „noch eine Runde“, kein Zeitdruck, nichts läuft von selbst in die nächste Runde. | N6 |
| G4 | **Fehler sind nie reizvoller als richtig und setzen nichts zurück.** | N7 |
| G5 | **Erst festlegen, dann sehen:** Das Kind bringt die Antwort hervor, bevor die Wirkung sie zeigt. | L1, L2 |
| G6 | **Hilfe-Leiter:** nach dem 2. Versuch leuchtet Hilfe; Stufe 1 eine Probe (nicht die Lösung, nie bloßes Hochzählen), Stufe 2 die Lösung, die das Kind selbst ausführt. Mit Hilfe Gelöstes zählt nicht als gekonnt. | L12 |
| G7 | **Fachbegriffe richtig** (Nomen, Verb, Einer, Zehner, mal, geteilt durch …), keine Ersatznamen, keine Regeln mit Verfallsdatum. | §5, §5.1 |
| G8 | **Vielfalt beiläufig:** Berufe, Familien, Aussehen gegen das Klischee, nie zum Thema gemacht; nie nach Gruppen zählen. | §6.1 |
| G9 | **Sicherheit:** Lernen und Bedrohung nie gleichzeitig, keine Gewalt, keine Schockeffekte, jede Runde endet hell und in Ruhe. | §9.2 |
| G10 | **Figuren sprechen nicht.** Es spricht der Erzähler in der dritten Person; Gefühle der Figuren gelten der Sache, nie dem Kind als Ursache. | §3.1 Nr. 4–5, `stimme.md` |
| G11 | **Was als echt gilt, stimmt:** Sachfakten nur aus den geprüften Fakten der Welt; sonst ist es erkennbar Spiel („Hier …“) oder kommt nicht vor. Mengen in Mathe bleiben neutrales Material (Perlen). | K3, K4, L7 |
| G12 | **Bedienung:** feste Plätze und Bausteine (Leiste, Blase, Hilfe, Pause, Tastatur), große Tippziele, jedes Ziehen auch per Tippen, alles vorlesbar, Information nie nur über Farbe, still beim Denken. | `bedienung.md` §3, §4, §10; §11 |
| G13 | **Technik:** Vorlage mit RAHMEN, Lernsteuerung meldet jede Aufgabe, Test-Schnittstelle (`spiele/rahmen/pruefen.js`), Plattform nur über `spiele/kern/`, `npm test` grün. | `spielentwicklung.md` Ablage |
| G14 | **Wer es kann, ist schnell fertig:** Probe zu Beginn; das Spiel lässt die Runde von der Lernsteuerung steuern, endet beim Ereignis „gekonnt“ und hält kein Kind in einem gekonnten Thema fest. Der Prüfstand prüft es (Kind „sicher“: höchstens 5 Aufgaben, Thema gekonnt, Pause). | L3, N1, `lernsteuerung.js` |

### §6 Werkzeuge – Angebot, kein Muss

Diese Mittel sind gut, wenn sie dem Spielkern dienen, und weg, wenn sie ihn verdecken. Eine Prüfung fragt nie, ob
sie da sind, nur, ob sie stören.

- **Sachgrund in der Aufgabe** (K2): nur, wenn er die Aufgabe *leichter verständlich* macht. Sonst ist die Welt
  Bühne und Kulisse (K1: „als Welt und Rahmen der Szene“). Die Heimatwelt bleibt **(Christian, 2026-11-14)**.
- **Fakten mit Echt-Zeichen** (K6, K11): höchstens in der Pause, nie im Takt der Aufgaben.
- **Figur der Runde legt vor** (L5): die Einführung macht es einmal vor; nicht jede Runde.
- **Stimmungen sanft und abenteuer** (§9.3, Spielkatalog 4.2): Der erste Bau ist auf jeder Stufe gleich ruhig
  spielbar; eine Komplikation oder ein Bogen kommt erst in einem späteren Ausbau **(Annahme)**.
- **Mach-mit-Moment** (L13, Spielkatalog 4.3, Christian): ein Satz in der Pause, sonst nichts.
- **Listen, Sammelanzeigen, Zweitfiguren:** nur, wenn das Spiel ohne sie nicht verständlich wäre.
- **Neue Lernzeichen** (Bedeutung für alle Spiele): erlaubt, aber dann wird nicht gemergt, sondern Christian gefragt
  (Spielkatalog §8a). Spieleigene Teile im Spielordner und neue Objekte in `spiele/objekte/` sind frei.

### §7 Streichen

Bevor etwas Neues dazukommt, fragt jeder Schritt: **Was kann weg, ohne dass das Lernen leidet?** Ein Teil, das
in der Idee keinen Satz im Spielkern hat, kommt nicht ins Spiel. Ein Prüfbefund wird nie durch *mehr* Text oder
eine weitere Anzeige gelöst, wenn er sich durch Weglassen lösen lässt.

### §8 Zeigen statt erklären – kein Transfer (Christian, 2026-11-15)

Die Einführung von M37 war viel zu schnell und erklärte Zusammenhänge („Ein Stäbchen sind die Teile von einer
Packung“), die schon ein Erwachsener kaum so schnell aufnimmt; ein Kind ist damit überfordert **(Christian)**. Für
alle Spiele gilt deshalb:

- **Was dasselbe bedeutet, ist im Bild dasselbe Ding.** Wenn ein Perlenstäbchen eine Packung ist, ist die Packung
  gemalt, und man sieht die Perlen in ihr (die Packung *ist* das Stäbchen). Das Kind muss nichts übertragen, was es
  nicht sieht. Geht das nicht, fällt die Gleichsetzung weg – sie wird nie mit Worten nachgereicht.
- **Kein Satz der Form „X ist Y“, „X bedeutet Y“, „Jedes X bringt Y“.** Sätze beschreiben, was zu sehen ist oder was
  passiert, nie eine Beziehung, die man sich denken muss.
- **Eine neue Sache je Einführung.** Alles andere ist schon bekannt oder kommt später von selbst.
- **Das Spiel beginnt mit der Einführung, und sie spielt im echten Spielbild:** derselbe Held, dieselbe Kette,
  dieselbe Tastatur. Ein Kind der Runde macht einen Zug ganz vor (tippen, Wirkung), dann leuchtet beim Kind die Taste
  im Sonnenring und es tippt selbst. Bei jedem Start; der Knopf „Anleitung“ ruft sie jederzeit wieder auf. Je Schritt
  ein Satz; weiter erst nach dem Tipp des Kindes, nie nach einer Zeit. Der Abspieler `spiele/einfuehrung.js` (eigene
  Szenen mit Stäben und Ziffern) bleibt nur für Themen ohne eigenes Spielbild.
- **Kein Satz wird vom Spiel abgeschnitten**, nur ein Tipp des Kindes darf ihn abbrechen: Das Spiel wartet
  (`await blase.sage(…)`), bevor es den nächsten Satz sagt. Die Stimme schreibt sonst „Satz abgeschnitten“ ins
  Protokoll, und der Prüfstand wird rot.
- **Prüffrage:** Muss das Kind etwas verstehen oder übertragen, das nicht zu sehen ist? Dann ist es zu schwer – das
  Bild wird einfacher, nicht die Erklärung länger.
<!-- ende regeln -->

## Die Regeln bleiben klein

Das Bauheft ist die einzige Quelle der Agenten; dort sammelt sich Gewicht am leichtesten wieder an. Deshalb:

- **Eine neue Regel kommt nur hinein, wenn eine alte wegfällt oder gekürzt wird.** Der Regelblock oben bleibt unter
  etwa 4 500 Token, das ganze Bauheft eines Spiels unter 25 000 Token; `tests/skill-spiel-entwickeln.test.mjs` prüft
  beides.
- Neue Erkenntnisse aus einem Spiel gehören zuerst in das Werkzeug (Prüfstand, Textprüfung, Bausteine), erst dann in
  einen Satz.

## Ablauf

```
Vorbereiten (Skript)  → Worktree, Bauheft, Arbeitsablage
Idee        (1 Agent) → docs/spiele/<fach>/<spiel>.md, höchstens 40 Zeilen
Bau         (1 Agent) → das ganze Spiel, Einstiegsklasse auf allen Stufen
Prüfstand   (Skript)  → Durchspielen je Stufe, npm test, Textprüfung, Filmstreifen, Takt ──rot──→ Bau (Befunde)
Spielprüfung(1 Agent) → Freude, Streichliste, Grenzen, Schönheit ──rot──→ Bau (Befunde) → Prüfstand → Spielprüfung
Abschluss   (Skript)  → Audio, Kosten, Merge nach main      (nach 2 Runden rot: parken)
```

| Schritt | Wer | Modell | Liest | Ergebnis |
|---|---|---|---|---|
| Vorbereiten | `werkzeuge/spielbau/vorbereiten.mjs` | – | Repo | Worktree `spiel-<id>`, `bauheft.md`, Arbeitsablage |
| Idee | frischer Agent | `opus` | nur das Bauheft | Idee: Spielkern, Woher die Schwierigkeit, Stufen, alle Sätze wörtlich, Momente der Freude, Streichliste |
| Bau | frischer Agent | `sonnet` | Bauheft, Idee, Vorlage | Spiel, `spiele.json`, Tests, Commit |
| Prüfstand | `werkzeuge/spielbau/pruefstand.mjs` | – | das Spiel | `pruefstand.json` grün/rot mit Befunden, Bilder, Filmstreifen |
| Spielprüfung | frischer Agent | `opus` | Bauheft, Idee, Filmstreifen, Texte, Prüfstand | Urteil nach §5 und fünf Fragen, Streichliste |
| Abschluss | `werkzeuge/spielbau/abschliessen.mjs` | – | Ablage | Audio, Kosten gebucht, Merge |

- **Die Steuerung ist ein Skript** (`.claude/workflows/spiel-bauen.js`, gestartet vom Skill „Spiel entwickeln“).
  Sie liest nur kurze JSON-Ergebnisse, nie Berichte oder Code.
- **Höchstens zwei Runden.** Eine Runde ist Bau (bzw. Befunde umsetzen), Prüfstand, Spielprüfung. Rot im Prüfstand
  geht ohne Spielprüfung zurück an einen neuen Bau-Agenten. Nach zwei Runden rot: parken.
- **Jeder Agent ist frisch** und bekommt nur das Bauheft und seine Dateien; kein Agent wird fortgesetzt.
- **Mit echten Dingen** gehört nicht zum Lauf: Die Anleitungen entstehen in eigenen Sammelläufen
  (`.claude/skills/mit-echten-dingen/`).
- **Ein Spiel nach dem anderen** (Christian, 2026-11-15): nie zwei Läufe gleichzeitig; der nächste startet erst nach
  dem Abschluss des vorigen.
- **Erst Probe, dann fertig** (Christian, 2026-11-15): Ein grünes Spiel kommt als **Probe** nach `main`
  (`"probe": true` in `spiele/spiele.json`). Christian oder Noelia spielt zwei Minuten; erst danach gilt es als
  fertig (`node werkzeuge/spielbau/freigeben.mjs <Id>` nimmt die Markierung weg, oder die Befunde gehen als neue
  Runde in den nächsten Lauf). Spaß beurteilt am Ende ein Mensch, kein Prüfer.

### Die Spielprüfung

Ein frischer Prüfer sieht das Spiel so, wie ein Kind es erlebt (Filmstreifen in Bildern, Takt in Millisekunden) und
beantwortet zuerst fünf Fragen, dann die Grenzen:

1. **Würde ein Kind das freiwillig zehnmal spielen?** Woran sieht man es, woran nicht?
2. **Ist der Spielkern sofort klar?** Held, Handlung, Wirkung; Fünf-Sekunden-Test.
3. **Ist das Schwierige das Thema oder die Bedienung?**
4. **Ist es schön?** Stil, Farbe, Bewegung mit Gewicht, nichts ruckelt, nichts ist leer oder überladen.
5. **Kommt es ohne Transfer aus?** Alles ist zu sehen, nichts muss übertragen werden; die Einführung wartet auf das Kind (§8).

Dazu die **Streichliste**: was weg kann (mit Grund). Rot ist ein Spiel, wenn eine Grenze G1–G14 verletzt ist, eine
der fünf Fragen mit Nein beantwortet wird oder die Streichliste etwas nennt, das den Spielkern verdeckt.

### Kosten

| Posten | Ziel |
|---|---|
| Idee (Opus, kleiner Kontext) | 0,5–1,5 € |
| Bau (Sonnet) | 3–6 € |
| Spielprüfung (Opus, Bilder) | 1–2 € |
| Prüfstand-Läufer, Steuerung | unter 0,5 € |
| Eine zweite Runde | 2–4 € |

Gebucht wird wie bisher in `<spielordner>/kosten.json` (`werkzeuge/kosten/`); `abschliessen.mjs` bucht alle
Agenten des Laufs aus ihren Transkripten (Phasen `idee`, `bau`, `pruefstand`, `pruefung`, `steuerung`).

### Parken

Bleibt das Spiel nach zwei Runden rot, oder braucht es ein neues Lernzeichen: Abschnitt „Geparkt“ in der Idee mit
Grund, offenen Befunden und der Frage an Christian; Kosten-Eintrag `geparkt`; Branch und Worktree bleiben.
