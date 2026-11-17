# Geschichten

Stand: 2026-11-15 · freigegeben (Christian, 2026-11-15: Entwurf „Geschichten statt Sachwelten in Spielen“,
Auswahlfragen, Beurteilung) · **(Annahme)** = korrigierbar.

Sachwelten werden nicht mehr mit Spielen verknüpft. Sachthemen werden **Sachgeschichten** oder **Sachspiele**, Lernthemen
können mit einer **Lerngeschichte** eingeführt werden. Welches Thema welche Geschichte bekommt, steht in
`spiele/geschichten/beurteilung.json` (Familien je Lerngeschichte, Form je Welt).

## 1. Was eine Geschichte ist

**Inhalt zuerst** (Christian, 2026-11-15 abends): Basis jedes Sachthemas ist eine Sammlung wissenswerter Fakten – was
sollen Kinder dazu lernen? Erst dann wird die Form gewählt: eine Geschichte nur, wenn sie die Inhalte natürlich trägt
(z. B. ein Lebenslauf); sonst – und für Sachthemen meist – ein **Sachbuch**: schöner, staunender Sachtext mit Fotos,
die ihn illustrieren. Kurze Geschichten mit wenig Wissen („Mia zieht ein“, 14 Abschnitte à 2–4 Sätze) lasen sich
„wie ein Kinderbuch für 3-Jährige“; erfundene Anlässe für Mathe-Strukturen („Zehn Meisen, zwei Zweige“) wirkten
konstruiert. **Mathe-Lerngeschichten** bleiben gezeichnet mit der Runde und Perlen, ohne Fotos (Christian).

**Eine echte Geschichte, kein Lernbuch** (Christian, 2026-11-15): emotional, mit spannenden Details, das Wissen nur
nebenbei in der Handlung – so bleibt es besser im Kopf. Text und ein Bild je Abschnitt; das Bild zeigt die
**Kernaussage** des Abschnitts. Das Kind wählt am Anfang „Vorlesen“ (blättert von selbst weiter) oder „Selbst lesen“
(§4); das ist die einzige Ausnahme zu `spielbau.md` §8 „nichts läuft von allein“.

| Art | Bild | trägt |
|---|---|---|
| `sachbuch` | **fotorealistisch, KI**, ein Foto je Seite | Sachthema mit Kapiteln: was ein Kind zum Thema wissen soll, warm und staunend erzählt (§2a) |
| `sachgeschichte` | **fotorealistisch, KI** (Christian), jedes Bild geprüft | Zusammenhänge, Ursachen, Wandel, Staunen über die echte Welt |
| `sinn` | gezeichnet (Szene aus Bausteinen) | wozu man es braucht, woher es kommt |
| `form` | gezeichnet | ein Bild wird Seite für Seite zum neuen Zeichen (Schwan → 2) |
| `struktur` | gezeichnet | eine Beziehung, die im Bild sichtbar ist (Zehnerpaare, Tausch, Bündeln) |

**Lerngeschichten zeichnen ihre Bilder aus den Bausteinen der App** (Kinder der Runde, Perlenstäbe, Spielobjekte,
Ziffern), nicht mit KI: Bei Struktur und Form müssen Anzahlen und Formen genau stimmen, und das kann ein Bildgenerator nicht
sicher **(Annahme)**.

## 2a. Sachbücher (Christian, 2026-11-15 abends)

- **Verfahren:** (1) **Lerninhalte sammeln** → `<id>/inhalte.md`: Maßstab Lehrplan (LehrplanPLUS Bayern HSU, andere
  Länder) und gute Kindersachbücher; 6–8 Themen à 3–6 Punkte „Das Kind weiß danach …“, jeder Punkt mit Quelle; Mythen
  verworfen. (2) **Prüfer A** (frischer Agent): vollständig, richtig, nicht zu viel, Sicherheitswissen? (3) **Form**
  begründen (Sachbuch oder Geschichte). (4) **Schreiben**. (5) **Prüfer B** gegen `inhalte.md`: alles abgedeckt?
  staunenswert, nicht kindisch? Fakten gedeckt? Höchstens drei Runden. (6) **Bilder** je Seite (Kernaussage),
  vorhandene je Seite prüfen und übernehmen.
- **Umfang:** 5–7 Kapitel (= Themen von `inhalte.md`) à 4–6 Seiten (~25 Seiten); je Seite 60–120 Wörter;
  **Vorlesebuch**: normale Kinderbuch-Sprache, Sätze bis 15 Wörter (Kl. 1–2, `satzGrenzeBuch`), Absätze mit
  Leerzeile; Kapitel einzeln lesbar, die App merkt sich den Stand (§4).
- **Ton:** warm, staunend, genau; direkte Ansprache erlaubt („Hast du schon einmal gesehen, wie …?“), Vergleiche aus
  dem Kinderalltag, kleine echte Szenen mit einem bestimmten Tier. Keine Faktenliste in Sätzen, keine Zahlenkolonnen,
  keine Vermenschlichung, keine Babysprache. Höchstens eine Frage zum Vorhersagen je Kapitel, aufgelöst auf der
  nächsten Seite.
- Vorbild: `spiele/geschichten/haustiere/` (Katzen: `inhalte.md`, `pruefung.md`).

## 2b. Erinnern statt Berieseln (Christian, 2026-11-16)

Bücher sollen nicht in Schleife nebenher laufen, ohne dass etwas hängen bleibt. Deshalb fragt jedes Sachbuch nach
jedem Kapitel einmal ab, was das Kind behalten hat (Abrufübung), und die Bibliothek holt Fragen mit Abstand zurück
(verteiltes Wiederholen). Beides bewertet nicht (grundsaetze.md §3, N7): keine Punkte, kein „richtig“/„falsch“, nichts
wird gezählt; eine Antwort, die nicht passt, löst nichts Besonderes aus.

- **Eine Erinnerungsfrage je Kapitel** (`kapitel[].erinnern`, Pflicht für jedes Sachbuch). Sie steht nach der letzten
  Seite des Kapitels; weiter zum nächsten Kapitel (oder Fertig) geht es erst nach einer Wahl – welche, ist egal.
  Das Kapitel gilt erst danach als gelesen.
- **Frage:** nach der Kernerkenntnis des Kapitels (das, was ein Kind nach dem Kapitel über die Sache wissen soll),
  nie nach Namen, Zahlen zum Auswendiglernen oder Nebensachen. Kurz (≤ 15 Wörter), Kindersprache, Fachbegriff wie im
  Buch. Keine Vorhersage („Was glaubst du“) – hier wird erinnert.
- **Drei Antworten**, je ≤ 8 Wörter, ähnlich lang und ähnlich gebaut. Genau eine passt. Die beiden anderen sind
  Vorstellungen, die Kinder wirklich haben (am besten die, die das Buch selbst ausräumt, z. B. „Wale sind Fische“),
  nie albern, witzig oder abwegig (N7) und nie „alle“/„keine davon“. Die passende Antwort steht nicht immer an
  derselben Stelle (`richtig`: 0, 1 oder 2, über das Buch verteilt).
- **Auflösung** (`aufloesung`): ein bis zwei Sätze, die die Sache sagen, nah am Wortlaut des Buchs. Sie passt nach jeder
  Wahl: kein „Ja“, „Genau“, „Richtig“, „Leider“, „Nicht ganz“, kein Lob. Danach leuchtet die passende Antwort auf.
- **Bild** (`bild`): das Foto der Seite `seite`, auf der die Antwort steht – es erinnert an die Stelle im Buch
  (Christian, 2026-11-17). Keine neuen Bilder.
- **Nachlesen** (`seite`): Index der Seite im Kapitel (ab 0), auf der die Antwort steht; der Knopf „Nachlesen“ springt
  dorthin.
- **Alles wird vorgelesen** (bei Ton an, in beiden Modi): Frage, jede Antwort, beim Tippen die gewählte Antwort, dann die
  Auflösung (`npm run audio` nimmt alles auf). Die gerade vorgelesene Antwort trägt den Sonnenring; wählen lässt sich
  erst, wenn alle drei Antworten vorgelesen sind (Christian, 2026-11-17). Bricht etwas das Vorlesen ab, ist die Wahl
  sofort frei.
- **„Weißt du noch?“ in der Bibliothek:** Höchstens einmal am Tag kommt beim Öffnen der Bibliothek die Frage eines
  Kapitels zurück, das das Kind frühestens gestern beendet hat; die am längsten nicht gestellte zuerst. Überspringbar
  („Später“), nichts wird gezählt.
- Ein frischer Prüfer prüft die Fragen mit dem Buch (`pruefung.md` §5 „Erinnerungsfragen“).

```json
"erinnern": {
  "frage": "Wie atmet ein Wal?",
  "bild": "bilder/01-02.webp",
  "antworten": ["Mit Kiemen, wie ein Fisch", "Mit einer Lunge, wie du", "Durch die Haut"],
  "richtig": 1,
  "aufloesung": "Ein Wal hat eine Lunge. Er muss zum Atmen auftauchen.",
  "seite": 2
}
```

## 2. Regeln (Lern- und Sachgeschichten)

- **Umfang:** gezeichnete **Lerngeschichten** (`sinn`, `form`, `struktur`) sind kurz vor dem Spiel: 6–10 Seiten, je
  1–3 Sätze, Satzlänge wie `spielbau.md` §3 (`satzGrenze`). **Sachgeschichten** (Vorlesebuch, Christian 2026-11-15; nur mit natürlicher Handlung, sonst Sachbuch §2a): 10–14 Abschnitte, je 2–4 Sätze; Satzlänge bis Kl. 2 höchstens 10
  Wörter, Kl. 3–4 höchstens 14 (`satzGrenzeGeschichte` in `werkzeuge/spielbau/texte.mjs`). Langer Text darf scrollen.
- **Schreibverfahren:** (1) Wirklichkeit recherchieren, jede Tatsache mit Quelle. (2) Realistische Fassung schreiben:
  Hauptfigur mit Wunsch oder Problem, Gefühle zeigen (nicht bewerten), Wissen ist der Grund, warum etwas passiert;
  keine Lehrsätze („Katzen …“, „Man …“), kein „X ist Y“. (3) Ein frischer Prüfer bewertet: Bleibt das Wissen hängen?
  Spannend genug? Zu belastend (`docs/research_notes/…/geschichten_angst_gewalt.md`)? Urteil in `pruefung.md`.
  (4) **Eine Fassung je Geschichte** (Christian, 2026-11-15): keine ruhigere oder aufregendere Fassung; was zu
  belastend ist, wird in der einen Fassung geändert.
- **Spannung von der Realität her** (Christian): nicht überdramatisiert – „die Welt ist ja oft schon grausam genug“.
  Kleine Schwierigkeiten halten Grundschulkinder aus; die Grenze steht in `grundsaetze.md` 9.3 (keine Stufen).
- **Bilder je Abschnitt beurteilen, nicht pauschal neu erzeugen** (Christian): Bei Überarbeitungen bleibt ein Bild,
  wenn es die Kernaussage des Abschnitts weiter zeigt; neu nur, wo sich Aussage oder Stimmung ändert.
- **Kein Transfer** (`spielbau.md` §8): Das Bild zeigt, was der Satz sagt. Bei Struktur zeigt das Bild die Struktur selbst,
  angeordnet wie das Montessori-Material; bei Form wird das Bild schrittweise zum schlichten Zeichen, die letzte Seite zeigt
  das Zeichen allein (neben dem Perlenstab).
- **Höchstens eine Frage zum Vorhersagen** je Geschichte (L2), aufgelöst auf der nächsten Seite; keine Antwort ist falsch,
  nichts wird gespeichert, nichts geprüft (K7).
- **Wahres stimmt** (G11): Jede Tatsache steht mit Quelle in `quellen` (dort generisch: „Katzen …“), im Erzähltext steckt
  sie in der Handlung; keine Mythen, keine falschen Erwartungen (z. B. Eingewöhnung dauert Wochen, nicht einen Tag);
  jedes Bild zeigt nur, was stimmt. Auch Lerngeschichten mit Tierwissen haben `quellen`. Erzeugte Bilder tragen kein Label im Bild; der Hinweis steht in den Eltern-Hinweisen (Christian 2026-11-16).
- **Grenzen wie bei Spielen:** G1 keine Bewertung, G8 Vielfalt beiläufig, G9 Sicherheit (ruhig, hell, Ende in Ruhe), G10
  Erzähler in der dritten Person, Figuren sprechen nicht.
- **Keine Regeln mit Verfallsdatum** (`grundsaetze.md` §5): Eine Geschichte trägt eine Form oder Struktur, nie eine
  Bedeutungsregel („Nomen kann man anfassen“, „das Krokodil frisst die größere Zahl“).
- **Fantasie als Gedächtnisstütze** (Christian, 2026-11-15): erlaubt, wenn das Bild die Form selbst zeigt und schrittweise
  zum schlichten Zeichen führt; im Spiel und im Material bleibt das Zeichen schlicht (ändert `grundsaetze.md` §4).

## 3. Ablage

```
spiele/geschichten/<id>/geschichte.json   die Geschichte
spiele/geschichten/<id>/bilder/*.webp     Fotos der Sachgeschichte (quadratisch 1024 × 1024, WebP; Christian 2026-11-15), herkunft.json daneben
spiele/geschichten/<id>/kosten.json       Kosten (werkzeuge/kosten/)
```

Ein **Sachbuch** hat statt `seiten` die Liste `kapitel` (`[{ "titel": "…", "seiten": [{ "text", "bild", "frage"? }] }]`),
`art: "sachbuch"`, sonst dieselben Felder; Bilder `bilder/KK-SS.webp` (Kapitel, Seite). Absätze im `text` mit `\n\n`.

```json
{
  "id": "beispiel",
  "titel": "Ein Tag mit Mia",
  "art": "sachgeschichte",
  "welt": "haustiere",
  "familie": null,
  "kulisse": "im-haus",
  "klasse": 1,
  "quellen": [ { "fakt": "Katzen schlafen viele Stunden am Tag.", "quelle": "https://…, abgerufen 2026-11-15" } ],
  "seiten": [
    { "text": "Mia schläft auf dem Sofa.", "bild": "bilder/01.webp" },
    { "text": "Was glaubst du: Was frisst Mia am liebsten?", "bild": "bilder/02.webp", "frage": true },
    { "text": "Zehn Gäste. 3 im roten Haus, 7 im blauen.", "szene": [ { "perlen": ["3", "7"], "x": 50 } ] }
  ]
}
```

- `text` steht rechts neben dem Bild und wird vorgelesen; `sprich` (optional) ersetzt den gesprochenen Text, wenn er vom
  geschriebenen abweichen muss.
- `bild` (Foto, Pfad relativ zum Ordner der Geschichte) **oder** `szene` (gezeichnet): Bildelemente aus
  `spiele/rahmen/szene.js`, dieselben wie in den Einführungen (`spiele/einfuehrung.js` baut sein Bild damit). `x` ist
  die Mitte in Prozent der Breite, `y` (optional) die Mitte in Prozent der Höhe. Die Bühne der Geschichte ist
  quadratisch (60 × 60 Einheiten): hinten die Häuser am Rand der Wiese, vorn die Kinder (etwas kleiner als die Häuser,
  sie reichen nie an die Fenster, damit jede Perle zu sehen bleibt); Kinder bei `x` 13 und 87.

  | Element | zeigt |
  |---|---|
  | `{ "figur": "ela", "x": 13, "haltung": "zeigen", "aufgabe": "vorzeigen" }` | ein Kind der Runde; bleibt es von Seite zu Seite an derselben Stelle, steht es still und wechselt nur die Haltung; `blick: "links"` (optional) für ein Kind rechts vom Material |
  | `{ "perlen": [3, 7], "hoehe": 4.4 }` | Perlenstäbe nebeneinander; `hoehe` (optional) ist die Dicke der Stäbe (in der Geschichte Sechzigstel der Bildhöhe, in der Einführung rem) |
  | `{ "zahl": 7 }`, `{ "objekt": "einkaufskorb", "zustand": "leer", "hoehe": 16 }` | große Ziffer; ein Ding aus `spiele/objekte/` |
  | `{ "haeuser": [3, 7], "zu": 1 }` | **neu (Zehnerpaare):** zwei Häuser auf dem Boden; im Fenster jedes Hauses liegt ein Perlenstab mit so vielen Perlen (0 = leer), beide links bündig, damit man die Längen vergleicht; `zu` (0 links, 1 rechts, optional): dort ist der Vorhang zu (Frage zum Vorhersagen) |
  | `{ "paare": [[1, 9], [2, 8], [3, 7], [4, 6], [5, 5]] }` | **neu (Zehnerpaare):** Paare von Perlenstäben untereinander wie das Montessori-Material: der erste Stab links bündig, der zweite rechts bündig, alle Reihen gleich lang; man sieht das Muster |

  Neue Elemente kommen nach `szene.js` und werden in `tests/geschichten.test.mjs` geprüft.
- `fach` (optional, z. B. `mathe`): Fach für die Kopfleiste (Kachel).
- `titelbild` (Sachbuch): `{ "bild": "bilder/03-02.webp", "fokus": "50% 40%" }` – von der KI nach den Bildern gewählt
  (Skill sachgeschichte §4a): das Foto, das das Buch am besten zusammenfasst und im Streifen 2 : 1 das Wesentliche
  zeigt; `fokus` ist der Bildausschnitt (`object-position`). Ohne Feld: das erste Foto, mittig. Auch Deckel in der
  Bibliothek.
- `kulisse` (Pflicht; bei Büchern mit Kapiteln ohne Wirkung, sie haben kein Hintergrundbild): gezeichneter Hintergrund aus `spiele/rahmen/kulissen/kulissen.json` (Dschungel, Strand, Wasser,
  Garten, Im Haus, Stadt …), den die Geschichte wählt – nicht wie ein Buch, kein lila Standard (Christian 2026-11-15).
  Neue Kulissen: ruhig, flach im Stil der Runde, Formen nur am Rand.
- `zaehlung: [links, rechts]` (an einem Foto): die geprüfte Anzahl links und rechts (Zehnerpaare); `verdeckt: 0|1`:
  diese Seite ist verdeckt (Frage zum Vorhersagen).
- `frage: true` markiert die eine Seite mit Frage zum Vorhersagen.
- `familie` (Lerngeschichte) bzw. `welt` (Sachgeschichte) verbinden sie mit `beurteilung.json`.

## 4. Abspielen

- Baustein `<ls-geschichte src="geschichten/<id>/geschichte.json">` in `spiele/rahmen/geschichte.js`, Seite
  `spiele/geschichte.html?id=<id>` (optional `&weiter=<Pfad>`: dorthin nach der letzten Seite, z. B. ins Spiel; nur
  ein Pfad innerhalb von `spiele/`, sonst die Startseite).
- **Auf der Kulisse: Bild links, Text rechts** (Christian, 2026-11-15): das Bild quadratisch und so groß wie möglich,
  der Text auf einer Papierfläche daneben in Andika, beide mit Stufen-Schatten in der Kulissenfarbe; Vorlesen
  (Florian, vorab aufgenommen, `npm run audio`), Weiter und Zurück per Tipp und Pfeiltaste, Haus; das Bild reagiert nicht auf Berühren (kein Anhalten, kein Wischen; Kinder fassen gern die Bilder an, Christian 2026-11-16); Fortschritt
  als Punkte ohne Zahl; nach der letzten Seite „Fertig“ (Ereignis `fertig`).
- **Sachbuch** (`kapitel`, Christian 2026-11-15/16): Am Anfang steht das **Inhaltsverzeichnis**, offen auf Papier und
  ohne Hintergrundbild (Spec 2026-11-16-inhaltsverzeichnis): links das **Titelbild** als Streifen 2 : 1 (`titelbild`),
  darunter groß der Buchtitel und die Knöpfe „Anhören“ und „Lesen“ (machen beim Lesestand weiter, dann steht darunter
  „Weiter bei Kapitel n“, sonst ab Kapitel 1); rechts alle Kapitel als Liste mit dezenten Linien – rundes Foto der
  ersten Seite, Titel, Haken für fertig, zwei Symbol-Knöpfe Anhören und Lesen. Der Tipp auf die Zeile öffnet im zuletzt
  gewählten Modus (gemerkt für alle Bücher; ohne Wahl bei Ton an Anhören); bei Ton aus fehlen die Anhören-Knöpfe. Ein
  Kapitel läuft wie eine Geschichte (Punkte je Kapitel), oben in der Textkarte der Knopf „Inhalt“
  (`symbole/inhalt.svg`). Am Kapitelende „Kapitel n+1“, im letzten Kapitel „Fertig“;
  der Vorlesemodus blättert nie über ein Kapitelende. Text mit Absätzen (Leerzeile), langer Text scrollt.
- **Lesestand:** `<ls-geschichte>` meldet bei jedem Seitenwechsel das Ereignis `stand` (`{ kapitel, seite, fertig,
  kapitelZahl }`); ein Kapitel ist fertig, sobald seine letzte Seite aufgeschlagen ist. `geschichte.html` speichert mit
  `merkeBuchStand` (Lernstand `buecher.<id>`; fertige Kapitel werden vereinigt, nie verloren) und gibt den gespeicherten
  Stand mit `setzeStand` zurück. Das Buch gilt als gelesen, wenn alle Kapitel fertig sind – nicht schon durch „Fertig“
  im letzten Kapitel. In der Vorschau der Eltern (`&eltern`) wird nichts gemerkt.
- **Startwahl:** Bei Ton an zeigt die erste Seite den Titel und „Vorlesen“ / „Selbst lesen“; vorher wird nichts gelesen,
  wer ohne Wahl blättert, liest selbst. Bei Ton aus keine Wahl.
- **Vorlesen:** Der Erzähler liest jede Seite beim Aufschlagen (`sprich`, sonst `text`) und blättert nach 1,5 s Ruhe
  um (ohne Stimme nach geschätzter Lesezeit). Tipp auf den Text oder den Vorlese-Knopf hält an, ein zweiter liest
  weiter. Frage- und letzte Seite blättern nie von selbst.
- **Selbst lesen:** Bei Ton an liest der Erzähler jede Seite beim Aufschlagen vor, der Knopf Vorlesen noch einmal; das
  Kind blättert. Nur ein Tipp des Kindes (Blättern) bricht einen Satz ab.
- Auf der Seite mit `frage` erscheint Weiter erst nach dem Vorlesen und 2 s Ruhe; bis dahin blättert auch die
  Pfeiltaste nicht weiter.
- Seitenwechsel ruhig (Überblenden mit kleinem Schub, nur `transform`/`opacity`; bei wenig Bewegung nur Überblenden).
  Die Kinder der Runde stehen in einer eigenen Ebene und bleiben beim Blättern stehen.
- Prüfen: `?pruefen` gibt `window.lsGeschichte` (`seite`, `seiten`, `weiterBereit`, `modus`, `angehalten`,
  `frageSeite`, `waehle(m)`, `halte()`, `weiter()`, `zurueck()`, `fertig()`; Sachbuch: `kapitel` (-1 = Inhalt),
  `kapitelZahl`, `stand`, `oeffne(k, seite)`, `inhalt()`; Prüfung `tests/browser/sachbuch.spec.mjs`); `tests/geschichten.test.mjs` prüft das Format, `tests/browser/geschichte.spec.mjs` das Blättern.
- Vor dem Spiel: Die Lerngeschichte eines Themas kommt beim ersten Start des Themas und bleibt über „Anleitung“ wieder
  aufrufbar; Sachbücher und Sachgeschichten stehen in der Bibliothek (`spiele/bibliothek.html`).
