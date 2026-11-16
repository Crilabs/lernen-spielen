---
name: sachgeschichte
description: Schreibt ein Buch für die Bibliothek – ein Sachbuch mit Kapiteln (oder, wenn die Inhalte es natürlich tragen, eine Sachgeschichte) mit Fotos (spiele/geschichten/<id>/) nach docs/geschichten.md – Recherche mit Quellen, Vorlesebuch-Fassung, frischer Prüfer, Bilder je Abschnitt mit Bildprüfung, Eintrag in index.json und bibliothek.json, Ton, Kosten. Aufruf „Sachgeschichte <buch-id> [<buch-id> …]“ mit Ids aus spiele/bibliothek.json.
---

# Sachgeschichte

> **Neu (Christian, 2026-11-15 abends): Inhalt zuerst, meist ein Sachbuch mit Kapiteln** – `docs/geschichten.md` §1 und
> §2a gehen den Abschnitten 1–3 unten vor. Erst `inhalte.md` (Lerninhalte mit Quellen, Prüfer A), dann Form wählen,
> dann schreiben (5–7 Kapitel à 4–6 Seiten, 60–120 Wörter je Seite, Sätze ≤ 15 Wörter), Prüfer B gegen
> `inhalte.md`. Das kurze Maß (10–14 Abschnitte à 2–4 Sätze) gilt nur noch für Geschichten, deren Inhalte eine
> natürliche Handlung tragen. Vorbild ist das Katzenbuch `spiele/geschichten/haustiere/` (nicht mehr „Mia zieht ein“).

Verbindlich: `docs/geschichten.md` (ganz, besonders §1 „echte Geschichte, kein Lernbuch“, §2 Regeln und
Schreibverfahren, §3 Ablage), `docs/grundsaetze.md` §3, §6, §9.3, `docs/grundsaetze-bilder.md` (Fotos, Vielfalt),
`docs/research_notes/*/geschichten_angst_gewalt.md`. Vorbild: `spiele/geschichten/haustiere/` (Katzen-Sachbuch samt `inhalte.md` und
`pruefung.md`). Plan der Bücher: `spiele/bibliothek.json` (Raum › Regal › Buch, Arbeitstitel).

## Ablauf: frische Agenten je Schritt (Christian, 2026-11-16)

Kostentreiber war ein einziger Agent, der Recherche, Text, ~45 Bilder und die Bildprüfung nacheinander machte: Jeder
Werkzeugaufruf liest den ganzen, wachsenden Verlauf neu (Bienenbuch: 64 Mio. Cache-Token, 19,50 €), und während der
Bilderzeugung verfällt der Cache und wird teuer neu geschrieben. Darum:

- **Du steuerst nur.** Du recherchierst, schreibst und siehst keine Bilder an. Du startest je Schritt einen **frischen**
  Agenten (Agent-Werkzeug, `general-purpose`) mit dem Modell aus der Tabelle, gibst ihm nur die Buch-Id, die Pfade und
  den Abschnitt dieses Skills, den er befolgt. Er liest, was er braucht, aus Dateien, schreibt seine Ergebnisse in
  Dateien und antwortet zuletzt nur mit kurzem JSON (`{ "ok": true|false, "befunde": [...] }` o. ä.), keinem Bericht.
- **Befunde setzt ein neuer frischer Agent um** (liest die Datei und die Befunde aus `pruefung.md`), nie der Agent mit
  dem langen Verlauf. Kein SendMessage über Schritte hinweg.
- **Kosten sofort buchen:** nach jedem Agenten `node werkzeuge/kosten/transkript.mjs <agent-transkript> --ordner
  spiele/geschichten/<id> --phase <phase> --notiz "<Schritt>"` (Transkript:
  `~/.claude/projects/<projekt>/<sitzung>/subagents/agent-<agentId>.jsonl`).

| Schritt | Agent | Modell | liest | schreibt | Phase |
|---|---|---|---|---|---|
| 1 Inhalte | Recherche | opus | `docs/geschichten.md` §1–2a, Welten | `inhalte.md` (mit Quellen), `pruefung.md` §1 | recherche |
| 1 Prüfer A | frisch | opus | `inhalte.md` | Befunde in `pruefung.md` §1 | pruefung |
| 2 Schreiben | Schreiber | opus | `docs/geschichten.md`, `inhalte.md` | `geschichte.json` (ohne Bilder), `bilder/auftrag.md` | schreiben |
| 3 Prüfer B | frisch | opus | `geschichte.json`, `inhalte.md` | `pruefung.md` §2 | pruefung |
| 4 Bilder | Bildmacher | sonnet | `bilder/auftrag.md` | `bilder/*.webp`, Prompts in `bilder/auftrag.md` | bilder |
| 4 Bildprüfung | frisch, **je Kapitel einer** | sonnet | `bilder/auftrag.md`, Kapiteltext, Bilder des Kapitels | `pruefung.md` §3 | bilder |
| 4a Titelbild | frisch | sonnet | Bilder, `geschichte.json` | `titelbild`, `pruefung.md` §4 | bilder |
| 4b Fragen | Schreiber, dann Prüfer | opus | `geschichte.json`, `inhalte.md` | `erinnern`, `pruefung.md` §5 | schreiben / pruefung |

Korrekturrunden (Prüfer A/B, Fragen): ein frischer Agent desselben Modells wie der Schritt. Bei einer Sachgeschichte
(§2 unten) gilt dieselbe Kette; Schritt 1 heißt dann Recherche (§1).

## 0. Auswahl

- Buch-Id aus `spiele/bibliothek.json`; Ordner `spiele/geschichten/<id>/`. Gibt es ihn schon, nichts tun.
- Die Welten des Regals (`welten`) im Lernplan lesen (`beschreibung`, `eltern`) und, falls vorhanden,
  `spiele/geschichten/beurteilung.json` → `welten.<welt>.geschichte` als Anregung.
- Mehrere Bücher dürfen parallel entstehen (je Buch eine eigene Kette frischer Agenten wie oben, je eigener Ordner). **Gemeinsame Dateien**
  (`spiele/geschichten/index.json`, `spiele/bibliothek.json`, Audio) schreibt danach **eine** Stelle (§6), nie die Agenten.

## 1. Recherche (Web)

- 4–8 verlässliche Quellen (Fachstellen, Zoos und Naturschutzverbände, Universitäten, Tierärztekammern, Lexika).
  Jede Tatsache, die in der Geschichte steckt, kommt mit Quelle in `quellen` (`{ fakt, quelle }`, `fakt` generisch:
  „Hunde …“, Quelle mit URL und „abgerufen <JJJJ-MM-TT>“).
- **Mythen und Halbwahrheiten verwerfen** und in `pruefung.md` §1 nennen (Vorbild: Schnurrhaare messen nicht die
  Breite; Eingewöhnung dauert Wochen, nicht einen Tag).
- Gesucht: 6–10 Dinge, über die ein Kind staunt und die es an echten Tieren selbst beobachten oder sich vorstellen
  kann (Verhalten, Sinne, Körper, Lebenslauf) – nicht Zahlenlisten.

## 2. Vorlesebuch-Fassung schreiben

- `docs/geschichten.md` §2: 10–14 Abschnitte, je 2–4 Sätze; Kl. 1–2 höchstens 10 Wörter je Satz
  (`satzGrenzeGeschichte`). Hauptfigur (ein bestimmtes Tier mit Namen, oder ein Kind mit einem Tier) mit Wunsch oder
  Problem; ein Bogen (Anfang – Komplikation aus der Wirklichkeit – Lösung – ruhiges Ende). Das Wissen ist der Grund,
  warum etwas passiert; keine Lehrsätze, kein „X ist Y“, keine Vermenschlichung (Tiere denken und sprechen nicht wie
  Menschen; Gefühle nur, wo sie belegt beobachtbar sind: Angst, Neugier, Ruhe).
- Spannung von der Realität her, nicht überdramatisiert; eine Fassung für alle Kinder (`grundsaetze.md` 9.3, keine Stufen). Kein Tod, keine
  Verletzung im Bild; Fressen und Gefressenwerden höchstens angedeutet, nie gezeigt.
- Höchstens eine Frage zum Vorhersagen (`frage: true`), aufgelöst auf der nächsten Seite.
- Felder: `id`, `titel` (erzählend, kurz, kein „Der Hund“), `art: "sachgeschichte"`, `welt` (eine Welt des Regals),
  `familie: null`, `kulisse` (aus `spiele/rahmen/kulissen/kulissen.json`, passend zum Ort), `klasse`, `quellen`,
  `seiten` (`text`, `bild`, ggf. `frage`). Vielfalt beiläufig (G8): Menschen nur mit Händen, Armen, Beinen, Füßen,
  ohne Gesichter, Hautfarben wechseln über die Bücher.

## 3. Frischer Prüfer

Ein **anderer** Agent als der Schreiber (frisch, ohne den Schreibverlauf) liest `docs/geschichten.md` §1–2, die
Recherche und die Geschichte und urteilt: Geschichte oder Sachtext? Bleibt das Wissen hängen (welche 2–3 Dinge)?
Spannend genug, zu belastend (Angst-Notiz)? Stimmt jede Tatsache, steht sie in `quellen`? Satzlängen? Zeitablauf
realistisch? Was zu belastend ist, wird in der einen Fassung geändert – es gibt keine Fassungen. Der Schreiber setzt die Befunde um;
höchstens drei Runden, sonst parken und berichten. Urteil zusammengefasst in `pruefung.md` §2.

## 4. Bilder je Abschnitt

- **Der Schreiber** legt in `bilder/auftrag.md` den **Steckbrief der Figur** fest (Art, Farbe, Abzeichen, Augen,
  Alter, Halsband …; ebenso die Menschen: nur Hände/Arme/Beine, Hautton, Ärmel) und je Seite eine Zeile:
  Dateiname, **Kernaussage** des Bilds (nicht die Stimmung allgemein), bei der Frage-Seite „verrät nicht: …“.
- **Der Bildmacher** (sonnet) schreibt je Seite einen Prompt: Steckbrief **wörtlich**, damit es überall dasselbe Tier
  ist, dazu die Kernaussage; Motiv mittig, hell, ruhig, keine Schrift. Er hält die Prompts in `bilder/auftrag.md` fest.
  `node werkzeuge/bilder/erzeugen.mjs --spiel spiele/geschichten/<id> --basis foto spiele/geschichten/<id>/bilder/NN.png "<Prompt>"`,
  dann `cwebp -q 82 NN.png -o NN.webp` und das PNG löschen. Das Werkzeug wartet bei Ratenlimit selbst.
  **Er sieht die Bilder nicht an** – das ist die Bildprüfung.
- **Bildprüfung** (sonnet, je Kapitel ein frischer Agent): jedes Bild des Kapitels mit dem Read-Werkzeug ansehen,
  dazu Steckbrief und Seitentext: zeigt es die Kernaussage? Körperbau stimmt (Beine, Ohren, Augen, Flügel, Fühler
  zählen)? Dieselbe Figur? Keine Schrift, keine erfundenen Details, nichts Unheimliches? Wahr nach
  `docs/grundsaetze-bilder.md`? Urteil je Bild: `ok`, `neu` (mit geschärftem Prompt) oder `text` (das Bild zeigt die
  Wahrheit besser – Vorschlag, wie der Text angepasst wird). Tabelle in `pruefung.md` §3 (Kernaussage, was stimmt,
  Versuche).
- `neu` → frischer Bildmacher nur für diese Bilder, danach frische Bildprüfung nur für diese; höchstens zwei neue
  Versuche je Bild, dann `text` oder parken. `text` → frischer Schreiber (opus) passt nur diese Seiten an.

## 4a. Titelbild wählen (frischer Agent)

Nach der Bildprüfung sieht sich ein **frischer Agent** (Agent-Werkzeug, Typ general-purpose, Modell sonnet) alle Fotos des Buchs mit
dem Read-Werkzeug an und wählt das Titelbild fürs Inhaltsverzeichnis und den Deckel in der Bibliothek: das eine Foto,
das das ganze Buch am besten zusammenfasst und **im Streifen 2 : 1 (doppelt so breit wie hoch) das Wesentliche zeigt**
– Motiv nicht angeschnitten (Kopf, Augen, Körper des Tiers), ruhig, hell, keine Frage-Seite, wahr nach
`docs/grundsaetze-bilder.md`. Er bestimmt den Ausschnitt als `fokus` (`object-position` in Prozent, z. B. `"50% 35%"`:
waagrecht egal bei 1024 × 1024, senkrecht so, dass der Streifen das Motiv trifft) und schreibt
`"titelbild": { "bild": "bilder/NN-MM.webp", "fokus": "50% 35%" }` in `geschichte.json` (nach `kulisse`) und einen
Satz Begründung in `pruefung.md` §4 „Titelbild“. Er erzeugt keine neuen Bilder.

## 4b. Erinnerungsfragen (Schreiber, dann frischer Prüfer)

Nach dem Titelbild bekommt **jedes Kapitel** ein Feld `erinnern` nach `docs/geschichten.md` §2b (Frage nach der
Kernerkenntnis, drei Antworten mit echten Fehlvorstellungen, neutrale Auflösung ohne „Ja/Richtig/Leider“, Foto des
Kapitels, das die Antwort nicht verrät, `seite` zum Nachlesen, `richtig` über das Buch verteilt). Danach prüft ein
**frischer Agent** jede Frage mit dem Kapiteltext: Kernerkenntnis statt Nebensache? Passt genau eine Antwort, und
stimmt sie mit Buch und `quellen`? Sind die anderen plausibel, nicht albern? Klingt die Auflösung nach jeder Wahl
richtig? Verrät das Bild nichts? Befunde umsetzen (höchstens zwei Runden), Urteil in `pruefung.md` §5
„Erinnerungsfragen“.

## 5. Abschluss im Buch-Ordner

`geschichte.json`, `bilder/*.webp`, `bilder/herkunft.json` (schreibt das Werkzeug), `kosten.json`, `pruefung.md`
(§1 Recherche, §2 Prüfer, §3 Bilder, §4 Titelbild, §5 Erinnerungsfragen). Prüfen: `node --test tests/geschichten.test.mjs` (Format, Satzlängen; der
Index-Test schlägt fehl, bis §6 gelaufen ist – das ist erwartet).

## 6. Eintragen (einmal, nach allen Büchern)

- `spiele/geschichten/index.json`: je Buch `{ id, titel, art, welt, familie }`.
- `spiele/bibliothek.json`: der Arbeitstitel des Buchs darf bleiben (die Bibliothek zeigt den Titel der Geschichte). Das Feld `thema` (Tier oder Sache, kurz, z. B. „Katze“) steht über dem Titel der Karte; ein neues Buch bekommt es mit.
- Ton: `npm run audio` für die neuen Seiten (ElevenLabs Livia, Schlüssel in `.env`; Texte mit SSML-Korrektur Azure); ohne Schlüssel berichten.
- `node --test tests/*.test.mjs`, `node tests/browser/bibliothek.spec.mjs` (NODE_PATH wie dort), Bildschirmfoto
  des Raums ansehen.
- Kosten: `node werkzeuge/kosten/bericht.mjs`; die Claude-Kosten sind je Agent schon gebucht (Ablauf oben), die
  Steuerung selbst mit `transkript.mjs` und `--phase steuerung` auf die Bücher verteilt.
- Commit je Bündel: „feat(bibliothek): <Bücher>“ mit kurzer Liste (Titel, Abschnitte, Bilder, Kosten).

## Lauf aus der Verwaltung

Ist `VERWALTUNG_AUFTRAG` gesetzt (Start über `npm run verwaltung`, `werkzeuge/verwaltung/`), schreib als Letztes
`werkzeuge/verwaltung/ergebnisse/<auftrag>.json` (`<auftrag>` = Wert von `$VERWALTUNG_AUFTRAG`) im Repo, in dem der Lauf gestartet wurde: `{ "status": "erledigt"|"geparkt"|"abgebrochen",
"zusammenfassung": "<ein Satz: Bücher, Ergebnis, Kosten>", "frage": "<nur bei geparkt>" }` (`erledigt` = alles grün und
eingetragen, `geparkt` = etwas wartet auf Christian). Fehlt die Datei, gilt der Auftrag als fehlgeschlagen. Ein
`git push` scheitert im Lauf absichtlich.
