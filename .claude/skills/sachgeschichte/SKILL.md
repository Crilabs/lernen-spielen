---
name: sachgeschichte
description: Schreibt ein Buch für die Bibliothek – eine Sachgeschichte mit Fotos (spiele/geschichten/<id>/) nach docs/geschichten.md – Recherche mit Quellen, Vorlesebuch-Fassung, frischer Prüfer, Bilder je Abschnitt mit Bildprüfung, Eintrag in index.json und bibliothek.json, Ton, Kosten. Aufruf „Sachgeschichte <buch-id> [<buch-id> …]“ mit Ids aus spiele/bibliothek.json.
---

# Sachgeschichte

Verbindlich: `docs/geschichten.md` (ganz, besonders §1 „echte Geschichte, kein Lernbuch“, §2 Regeln und
Schreibverfahren, §3 Ablage), `docs/grundsaetze.md` §3, §6, §9.3, `docs/grundsaetze-bilder.md` (Fotos, Vielfalt),
`docs/research_notes/*/geschichten_angst_gewalt.md`. Vorbild: `spiele/geschichten/haustiere/` („Mia zieht ein“ samt
`pruefung.md` und Fassung `haustiere-ruhig`). Plan der Bücher: `spiele/bibliothek.json` (Raum › Regal › Buch, Arbeitstitel).

## 0. Auswahl

- Buch-Id aus `spiele/bibliothek.json`; Ordner `spiele/geschichten/<id>/`. Gibt es ihn schon, nichts tun.
- Die Welten des Regals (`welten`) im Lernplan lesen (`beschreibung`, `eltern`) und, falls vorhanden,
  `spiele/geschichten/beurteilung.json` → `welten.<welt>.geschichte` als Anregung.
- Mehrere Bücher dürfen parallel entstehen (je Buch ein Agent, je eigener Ordner). **Gemeinsame Dateien**
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
- Spannung von der Realität her, nicht überdramatisiert; Hauptfassung für die Stufe „Sanft“. Kein Tod, keine
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
realistisch? Braucht es eine Fassung `ruhig` oder `abenteuer` (nur begründet)? Der Schreiber setzt die Befunde um;
höchstens drei Runden, sonst parken und berichten. Urteil zusammengefasst in `pruefung.md` §2.

## 4. Bilder je Abschnitt

- Erst einen **Steckbrief der Figur** festlegen (Art, Farbe, Abzeichen, Augen, Alter, Halsband …) und **wörtlich in
  jeden Prompt** schreiben, damit es überall dasselbe Tier ist; ebenso die Menschen (nur Hände/Arme/Beine, Hautton,
  Ärmel).
- Je Abschnitt ein Prompt, der genau die **Kernaussage** zeigt (nicht die Stimmung allgemein), Motiv mittig, hell,
  ruhig, keine Schrift. Auf der Frage-Seite darf das Bild die Antwort nicht verraten.
- `node werkzeuge/bilder/erzeugen.mjs --spiel spiele/geschichten/<id> --basis foto spiele/geschichten/<id>/bilder/NN.png "<Prompt>"`,
  dann `cwebp -q 82 NN.png -o NN.webp` und das PNG löschen. Das Werkzeug wartet bei Ratenlimit selbst.
- **Jedes Bild mit dem Read-Werkzeug ansehen**: zeigt es die Kernaussage? Körperbau stimmt (Beine, Ohren, Augen,
  Flügel, Fühler zählen)? Dieselbe Figur? Keine Schrift, keine erfundenen Details, nichts Unheimliches? Sonst
  höchstens zwei neue Versuche mit geschärftem Prompt – oder den **Text an das Bild anpassen**, wenn das Bild die
  Wahrheit besser zeigt. Ergebnis je Bild als Tabelle in `pruefung.md` §3 (Kernaussage, was stimmt, Versuche).
- Fassungen: Bilder je Abschnitt beurteilen, übernehmen wo die Aussage gleich ist (`../<id>/bilder/NN.webp`).

## 5. Abschluss im Buch-Ordner

`geschichte.json`, `bilder/*.webp`, `bilder/herkunft.json` (schreibt das Werkzeug), `kosten.json`, `pruefung.md`
(§1 Recherche, §2 Prüfer, §3 Bilder). Prüfen: `node --test tests/geschichten.test.mjs` (Format, Satzlängen; der
Index-Test schlägt fehl, bis §6 gelaufen ist – das ist erwartet).

## 6. Eintragen (einmal, nach allen Büchern)

- `spiele/geschichten/index.json`: je Buch `{ id, titel, art, welt, familie }`; Fassungen unter `fassungen`.
- `spiele/bibliothek.json`: der Arbeitstitel des Buchs darf bleiben (die Bibliothek zeigt den Titel der Geschichte).
- Ton: `npm run audio` (Azure, Florian HD) für die neuen Seiten; ohne Schlüssel berichten.
- `node --test tests/*.test.mjs`, `node tests/browser/bibliothek.spec.mjs` (NODE_PATH wie dort), Bildschirmfoto
  des Raums ansehen.
- Kosten: `node werkzeuge/kosten/bericht.mjs`; Claude-Kosten der Agenten mit `werkzeuge/kosten/transkript.mjs`
  buchen, soweit möglich.
- Commit je Bündel: „feat(bibliothek): <Bücher>“ mit kurzer Liste (Titel, Abschnitte, Bilder, Kosten).
