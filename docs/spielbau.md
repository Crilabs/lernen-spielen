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

Die Einführung von M37 war zu schnell und erklärte Beziehungen wie „Ein Stäbchen sind die Teile von einer Packung“;
ein Kind ist damit überfordert (Christian, 2026-11-15). Darum zeigt §8 statt zu erklären.

**Ziel (Christian, 2026-11-15):** 5–10 € und 1–2 Stunden je Spiel. Schlichte Spiele sind billiger zu bauen und
machen mehr Spaß; beides kommt aus derselben Änderung.

<!-- regeln -->
**Vorrang:** §1 Spielkern und §8 Zeigen statt erklären gehen jeder anderen Regel vor – den Grundsätzen, den
Checklisten in `grundsaetze-bilder.md` §13 und `bedienung.md` §10, den Kriterien A1–A12, W-… und Kartenbild in
`spielentwicklung.md` und jedem Katalog-Eintrag. Widerspricht eine ältere Pflicht dem Spielkern, gilt der Spielkern.
Die Grenzen §5 (G1–G14) bleiben immer.

### §1 Der Spielkern (vor allen anderen Regeln)

Ein Spiel hat genau einen Kern, und alles andere muss sich vor ihm rechtfertigen:

- **Ein Held: immer ein Kind der Runde**, das etwas *tut* – hüpft, rollt, baut, wirft, staunt –, dazu die Figuren
  und Dinge, die das Spiel braucht (Christian, 2026-11-15). Ein Pfeil, ein Korb oder eine Zeile allein ist kein Held.
- **Eine Handlung des Kindes**, und sie ist die Lernhandlung (tippen, ziehen, legen). Nicht zwei.
- **Der Lernweg ist der kürzeste Weg** (Christian, 2026-11-16, M08: „rechnen ohne zu rechnen“): Die Handlung trägt
  die Struktur des Stoffs (Zehner und Einer getrennt tippen, die Ziffern wandern an ihren Platz). Die Idee nennt den
  Umweg, mit dem ein Kind ohne den Lerngedanken durchkäme (abzählen, raten), und wie das Spiel ihn überflüssig macht.
  Das Lernmaterial ist das Spielfeld, nie Hintergrund.
- **Eine Wirkung**, die man sieht und hört: Sie beginnt sofort (unter 0,3 s nach dem Tippen), dauert etwa 2,5 s,
  höchstens 3 s (wie `grundsaetze-bilder.md` B6), und endet in einem Bild, das bleibt. Der nächste Tipp überspringt sie.
  **Ausnahme (Christian, 2026-11-16):** Ist die Dauer selbst das Lernziel (wie weit ist es?), dauert die Wirkung so
  lange, wie die Sache es verlangt, **höchstens 8 s** (Christian, 2026-11-16: „das reicht als Lerneffekt“) – in M06
  fährt Timo immer gleich schnell, zu Haus 45 also länger als zu Haus 5.
  Eine Fahrt, die immer gleich lang dauert, verwischt die Entfernung. Der nächste Tipp überspringt auch hier.
- **Ein Takt:** Für ein sicheres Kind vergehen von der Aufgabe bis zur nächsten Aufgabe unter 10 s.
- **Fünf-Sekunden-Test:** Wer das Spiel einmal vorgemacht bekommen hat (Einführung), weiß ohne Satz, was zu tun ist.
- **Spielbar ohne Ton und ohne Lesen** des Erzählers – die Sache zeigt alles; die Stimme ist Zugang, nicht Anleitung.

**Vorbild: das alte Kettenhüpfer** (13.11., `git show 4633d0a:spiele/einmaleins.html`): Das Kind tippt 42, die
Figur hüpft sechs Stäbchen über die Kette, jeder Hüpfer ein Ton höher; die 42 fliegt an ihre Stelle und rastet ein.
Bei 48 fliegt die 48 dorthin, wo 48 wirklich liegt, und die Figur schaut verdutzt hin. Kein Korb, keine Liste – die
Kette *ist* das Einmaleins.

### §2 Herausforderung kommt aus dem Stoff, nicht aus der Hülle

| darf mit dem Thema wachsen | bleibt in allen Klassen schlicht |
|---|---|
| Schwierigkeit: größere Zahlen, mehr Schritte, weniger Hilfe | Zahl der Figuren, Objekte und Anzeigen auf dem Bildschirm |
| Lernstufen material → vorstellung → kopf | Erzählschichten (Sachgrund je Zahl, Vorzeigen jede Runde, Wechselsätze) |
| **Entscheidungen** des Kindes: Weg wählen, knobeln, planen, vorhersagen | **Erklärungen** an das Kind |
| Textmenge, wenn das Kind selbst liest (etwa ab Kl. 3) | Fachbegriffe in der Hilfe, wo eine Zahl im Bild reicht |
| Tempo und Länge der Runde | Wie schnell nach dem Tippen etwas passiert |
| Knöpfe, wenn der Stoff sie braucht (Fertig und Löschen erst ab zweistelligen Zahlen, M06) | keine Knöpfe, die bei leichtem Stoff nichts zu tun haben |

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
- **Keine Sprechblase im Spiel** (Christian, 2026-11-15): Sätze werden gesprochen, `<ls-blase ohne-text>` gibt
  „Nochmal hören“; kein Satz wiederholt, was Leiste oder Bild zeigen.
- **Rundenanfang:** höchstens ein Satz. **Einführung:** in Ruhe, als kleine Geschichte (§8, Christian 2026-11-16);
  ihre Sätze zählen nicht zum Budget unten, jeder einzelne hält aber die Satzlänge.
- **Satzlänge:** bis Kl. 2 höchstens 8 Wörter, Kl. 3–4 höchstens 12.
- **Alle festen Texte eines Spiels zusammen** (ohne die aus Daten erzeugten Varianten je Zahl): höchstens etwa
  2 500 Zeichen. M37 hatte 10 200.

### §4 Schön und flüssig

- **Stil der Runde** (`docs/figuren.md`, Silhouette, Stufen-Schatten) und **Farbwelt** (`docs/grundsaetze-bilder.md`
  §6.2: Perlen in Montessori-Farben, Stellenwerte türkis/orange/schiefer). **Das Spielbild ist die Szene und darf den
  ganzen Bildschirm nehmen** (Christian, 2026-11-15): Das Spielfeld gehört zur Welt, z. B. mit Kreide leicht
  perspektivisch auf die Straße gemalt, und die Figur hüpft es ab; keine Karte vor einem Hintergrund, nie ein Wimmelbild.
- **Bewegung mit Gewicht:** Sprünge im Bogen mit Bodenkontakt (Landung leicht gestaucht, dann zurück), Einrasten mit
  kurzem Überschwingen, Dinge fallen mit Beschleunigung und setzen auf. Nur `transform` und `opacity` animieren (Web
  Animations API oder CSS), 60 Bilder je Sekunde, kein Ruckeln, keine Layout-Sprünge.
- **Ton:** kurze, freundliche Klänge aus Web Audio (steigende Hüpfer, Plopp, weiches „Boing“), nie laut; Ton aus gilt.
- **Freude mit Abwechslung:** Die Wirkung einer richtigen Antwort hat zwei bis drei Varianten und ist nicht jedes
  Mal gleich groß (N5). Ab und zu ein kleiner Witz der Figur (sie wackelt, schaut, staunt) – nie bei jeder Aufgabe.
- **Daneben ist ruhig, aber nicht tot:** Die Sache zeigt, wo die getippte Zahl wirklich liegt; die Figur schaut
  neugierig hin. Nie reizvoller als richtig (N7).
- **Wenig Bewegung** (`prefers-reduced-motion`): gleiche Schritte, ohne Flug.
- **Die Bühne ist ein Ort, an dem man gern ist** (Christian, 2026-11-16): ein echter Ort aus der Farbwelt mit Licht
  und Tiefe (Wand, Boden, Fenster, wenige große Dinge im Stil der Runde; Beispiel `m08-stellentafel/raum.js`), nie
  leere Farbflächen; das Lernfeld liegt darin als Matte und ist das Hellste; keine Bedeutungsfarben in der Welt (C3).
- **Perlen nach Montessori** (Christian, 2026-11-16): Zehner sind goldene Zehnerstangen, die Einer ein Stäbchen in
  der Farbe ihrer Zahl, nie einzelne Perlen – in jedem Zustand (Hilfe, Schoß, Pause).
- **Nur Knöpfe tragen Schatten**; Brief, Karte und Matte sind flach. **Der Held verdeckt nie das Material** (M06, M08,
  M37): Er steht daneben oder dahinter.

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
| G11 | **Was als echt gilt, stimmt:** Sachfakten gehören in Geschichten (§6); im Spiel ist es erkennbar Spiel („Hier …“) oder kommt nicht vor. Mengen in Mathe bleiben neutrales Material (Perlen). | K3, K4, L7 |
| G12 | **Bedienung:** feste Plätze und Bausteine (Leiste, Blase, Hilfe, Pause, Tastatur), große Tippziele, jedes Ziehen auch per Tippen, alles vorlesbar, Information nie nur über Farbe, still beim Denken; jeder Tipp bekommt eine sichtbare Antwort (fehlt etwas, wackelt die Stelle und bekommt den Ring). | `bedienung.md` §3, §4, §10; §11 |
| G13 | **Technik:** Vorlage mit RAHMEN, Lernsteuerung meldet jede Aufgabe, Test-Schnittstelle (`spiele/rahmen/pruefen.js`), Plattform nur über `spiele/kern/`, `npm test` grün. | `spielentwicklung.md` Ablage |
| G14 | **Wer es kann, ist schnell fertig:** Probe zu Beginn; das Spiel lässt die Runde von der Lernsteuerung steuern, endet beim Ereignis „gekonnt“ und hält kein Kind in einem gekonnten Thema fest. Der Prüfstand prüft es (Kind „sicher“: höchstens 5 Aufgaben, Thema gekonnt, Pause). | L3, N1, `lernsteuerung.js` |

### §6 Werkzeuge – Angebot, kein Muss

Diese Mittel sind gut, wenn sie dem Spielkern dienen, und weg, wenn sie ihn verdecken. Eine Prüfung fragt nie, ob
sie da sind, nur, ob sie stören.

- **Keine Sachwelt im Spiel** (Christian, 2026-11-15): Sachthemen und ihre Fakten leben in Geschichten und
  Sachspielen (`docs/geschichten.md`); Heimatwelt, Sachgrund und Stufen eines Katalog-Eintrags gelten nicht.
- **Figur der Runde legt vor** (L5): die Einführung macht es einmal vor; nicht jede Runde.
- **Keine Stufen** (grundsaetze.md §9.3, Christian 2026-11-15): ein Spiel hat genau eine Fassung für alle Kinder;
  höchstens eine kleine Komplikation, rasch gelöst.
- **Listen, Sammelanzeigen, Zweitfiguren:** nur, wenn das Spiel ohne sie nicht verständlich wäre.
- **Neue Lernzeichen** (Bedeutung für alle Spiele): erlaubt, aber dann wird nicht gemergt, sondern Christian gefragt
  (Spielkatalog §8a). Spieleigene Teile im Spielordner und neue Objekte in `spiele/objekte/` sind frei.

### §7 Streichen

Bevor etwas Neues dazukommt, fragt jeder Schritt: **Was kann weg, ohne dass das Lernen leidet?** Ein Teil, das
in der Idee keinen Satz im Spielkern hat, kommt nicht ins Spiel. Ein Prüfbefund wird nie durch *mehr* Text oder
eine weitere Anzeige gelöst, wenn er sich durch Weglassen lösen lässt.

### §8 Zeigen statt erklären – kein Transfer (Christian, 2026-11-15)

Für alle Spiele gilt:

- **Was dasselbe bedeutet, ist im Bild dasselbe Ding.** Wenn ein Perlenstäbchen eine Packung ist, ist die Packung
  gemalt, und man sieht die Perlen in ihr (die Packung *ist* das Stäbchen). Das Kind muss nichts übertragen, was es
  nicht sieht. Geht das nicht, fällt die Gleichsetzung weg – sie wird nie mit Worten nachgereicht.
- **Kein Satz der Form „X ist Y“, „X bedeutet Y“, „Jedes X bringt Y“.** Sätze beschreiben, was zu sehen ist oder was
  passiert, nie eine Beziehung, die man sich denken muss.
- **Eine neue Sache je Einführung.** Alles andere ist schon bekannt oder kommt später von selbst.
- **Kein Wechsel ohne Bild:** Wechselt die Lernsteuerung mitten in der Runde Stufe oder Inhalt (andere Reihe,
  Perlen weg), zeigt das Spiel den Wechsel in einer kurzen Szene (z. B. Lena wischt die Perlen weg, malt die neue
  Kette hin), nie ein plötzlich anderes Bild (Christian, 2026-11-15); beim ersten Mal tippt das Kind das Neue selbst
  (Mini-Einführung nur dafür, M06).
- **Das Spiel beginnt mit der Einführung, und sie spielt im echten Spielbild:** derselbe Held, dieselbe Kette,
  dieselbe Tastatur. Ein Kind der Runde macht einen Zug ganz vor (tippen, Wirkung), dann leuchtet beim Kind die Taste
  im Sonnenring und es tippt selbst. Bei jedem Start; der Knopf „Anleitung“ ruft sie jederzeit wieder auf. Weiter
  erst nach dem Tipp des Kindes, nie nach einer Zeit.
- **Die Einführung erzählt in Ruhe eine kleine Geschichte** (Christian, 2026-11-16), je Gedanke ein kurzer Satz: wer
  was tut und warum, was das Kind hört oder sieht, was es tippt und mit welchem Knopf (Sonnenring auf jedem
  genannten Ding), ein Beispiel, das das Kind selbst ausführt, was bei einer anderen Antwort passiert („Dann
  probierst du es einfach noch einmal.“), wie es korrigiert, was es lernt, zum Schluss „Jetzt geht es los.“ Nach
  einem Fehlversuch im Spiel: „Versuch es noch einmal.“ Knöpfe heißen nach dem, was man sieht („der Knopf mit dem
  Haken“), nie nach einer Farbe. Gebaut wird sie mit `spiele/rahmen/einfuehrung-lauf.js` (wartet jeden Satz ab, hält
  ihn ohne Ton eine Lesezeit lang, auch bei „Bewegung reduzieren“ – nur ein Tipp des Kindes kürzt ab, nie die
  Einstellung –, Hilfe wiederholt den Schritt und zeigt die Taste, Rundenzeit erst danach). Der Abspieler
  `spiele/einfuehrung.js` bleibt nur für Themen ohne eigenes Spielbild.
- **Kein Satz wird vom Spiel abgeschnitten** – `await` vor dem nächsten; sonst meldet die Stimme „Satz
  abgeschnitten“, und der Prüfstand wird rot.
- **Keine Abkürzungen, die nicht eingeführt sind** (Christian, 2026-11-16, M08: „Z und E wird nicht erklärt“).
  Beschriftungen stehen ausgeschrieben („Zehner“, „Einer“), bis ein Thema die Abkürzung selbst einführt. Die
  Einführung zeigt jede Beschriftung mit dem Sonnenring und nennt sie.
- **Prüffrage:** Muss das Kind etwas verstehen oder übertragen, das nicht zu sehen ist? Dann ist es zu schwer – das
  Bild wird einfacher, nicht die Erklärung länger.
<!-- ende regeln -->

## Die Regeln bleiben klein

Das Bauheft ist die einzige Quelle der Agenten; dort sammelt sich Gewicht am leichtesten wieder an. Deshalb:

- **Eine neue Regel kommt nur hinein, wenn eine alte wegfällt oder gekürzt wird.** Der Regelblock oben bleibt unter
  etwa 4 500 Token, das ganze Bauheft eines Spiels unter 25 000 Token; `tests/skill-spiel-entwickeln.test.mjs` prüft
  beides.
- Neue Erkenntnisse aus einem Spiel gehören zuerst in das Werkzeug (Prüfstand, Textprüfung, Bausteine), erst dann in
  einen Satz. Prüfe nach jeder Änderung mit einem frischen Bauheft, dass die Regel darin steht.

## Ablauf

**Ideen vor dem Bau (Christian, 2026-11-17):** Für ein noch nicht gebautes Spiel liefert der Auftrag „Ideen“ in der
Verwaltung drei kurze Skizzen (Skill `spielideen`, Maßstab `docs/spielideen.md`: was Christians Prototypen spaßig
machte). Christian wählt eine oder schreibt seine eigene; daraus wird ein Spiel-Auftrag mit `--vorgabe`. Die Vorgabe
steht im Bauheft vor den Regeln: Die Idee-Phase behält Held, Handlung und Witz und nennt jede Abweichung; die
Spielprüfung misst dann die Umsetzung – Zweifel an der Idee gehen als „Zur Idee“ an Christian, nur Schwierigkeit und
Ohne Transfer bleiben hart. Ohne Vorgabe läuft alles wie unten.

```
Vorbereiten (Skript)  → Worktree, Bauheft, Arbeitsablage
Idee        (1 Agent) → docs/spiele/<fach>/<spiel>.md, höchstens 40 Zeilen
Bau         (1 Agent) → das ganze Spiel, Einstiegsklasse auf allen Stufen
Prüfstand   (Skript)  → Durchspielen je Stufe, npm test, Textprüfung, Filmstreifen, Takt ──rot──→ Bau (Befunde)
Spielprüfung(1 Agent) → Freude, Streichliste, Grenzen, Schönheit ──rot──→ Bau (Befunde) → Prüfstand → Spielprüfung
Abschluss   (Skript)  → Audio, Spielbild, Kosten, Merge nach main   (nach 2 Runden rot: parken)
```

| Schritt | Wer | Modell | Liest | Ergebnis |
|---|---|---|---|---|
| Vorbereiten | `werkzeuge/spielbau/vorbereiten.mjs` | – | Repo | Worktree `spiel-<id>`, `bauheft.md`, Arbeitsablage |
| Idee | frischer Agent | `opus` | nur das Bauheft | Idee: Spielkern, Woher die Schwierigkeit, Stufen, alle Sätze wörtlich, Momente der Freude, Streichliste |
| Bau | frischer Agent | `sonnet` | Bauheft, Idee, Vorlage | Spiel, `spiele.json`, Tests, Commit |
| Prüfstand | `werkzeuge/spielbau/pruefstand.mjs` | – | das Spiel | `pruefstand.json` grün/rot mit Befunden, Bilder, Filmstreifen |
| Spielprüfung | frischer Agent | `opus` | Bauheft, Idee, Filmstreifen, Texte, Prüfstand | Urteil nach §5 und fünf Fragen, Streichliste |
| Abschluss | `werkzeuge/spielbau/abschliessen.mjs` | – | Ablage | Audio, Spielbild (`werkzeuge/bilder/spielbild.mjs`: 2–3 Screenshots → plastisches Querformat für die Mini-Vorschau der Karte), Kosten, Merge |

- **Die Steuerung ist ein Skript** (`.claude/workflows/spiel-bauen.js`, gestartet vom Skill „Spiel entwickeln“).
  Sie liest nur kurze JSON-Ergebnisse, nie Berichte oder Code.
- **Höchstens zwei Runden.** Eine Runde ist Bau (bzw. Befunde umsetzen), Prüfstand, Spielprüfung. Rot im Prüfstand
  geht ohne Spielprüfung zurück an einen neuen Bau-Agenten. Nach zwei Runden rot: parken.
- **Jeder Agent ist frisch** und bekommt nur das Bauheft und seine Dateien; kein Agent wird fortgesetzt.
- **Mit echten Dingen** gehört nicht zum Lauf: Die Anleitungen entstehen in eigenen Sammelläufen
  (`.claude/skills/mit-echten-dingen/`).
- **Jeder Browser ist stumm** (Christian, 2026-11-16): Christian arbeitet und telefoniert neben den Läufen.
  Screenshots mit `werkzeuge/spielbau/bildschirm.mjs`, Skripte über `starteStumm` (`tests/browser/stumm.mjs`).
  Ein eigener Browserstart lädt das Spiel mit Ton; der Hook `.claude/hooks/nur-stumme-browser.mjs` lehnt ihn ab
  (Bau-Agenten taten das bis dahin bei fast jedem Screenshot).
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
3. **Ist das Schwierige das Thema – und braucht man den Lerngedanken, um es zu lösen?** Nein, wenn die Bedienung schwer ist oder ein Umweg (abzählen, raten) genauso schnell zum Ziel führt.
4. **Ist es schön, und lädt der Ort ein?** Stil, Farbe, Bewegung mit Gewicht, nichts ruckelt, nichts ist leer oder
   überladen; jede Beschriftung ist ohne Erklärung lesbar.
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
Grund, offenen Befunden und der Frage an Christian; Kosten-Eintrag `geparkt`; Branch und Worktree bleiben. Auch ein
geparktes Spiel bekommt sein Spielbild (`--spielbild`), sonst fehlt es auf der Karte, sobald es als Probe nach `main`
kommt (M08).
