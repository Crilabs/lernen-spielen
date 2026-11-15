# Prüfung – Lotta folgt dem Tanz

Stand 2026-11-15: Recherche, Vorlesebuch-Fassung, Prüfer (§2), Bilder (§3). Fassung `ruhig`: `../biene-ruhig/`.

Buch `biene` (Raum Tiere › Regal „Wiese und Garten“), Welt `wiese-und-hecke`, Klasse 1, Kulisse `garten`.
Anregung aus `beurteilung.json` („Ein Tag auf der Wiese … wie jedes vorankommt“) bewusst nur teilweise übernommen: ein
Tier statt vier, damit es eine Geschichte mit Hauptfigur wird; Fortbewegung (Fliegen, Heimweg finden) bleibt der Kern.

**Bogen:** Lotta fliegt zum ersten Mal hinaus und prägt sich ihr Zuhause ein → folgt einem Tanz und findet so die
Löwenzahnwiese → sammelt → Wolken verdecken die Sonne (Komplikation, Stufe Sanft) → findet trotzdem heim (Lichtmuster,
die Merkpunkte vom ersten Flug) → schläft → Frage: was macht sie jetzt? → sie tanzt selbst, andere folgen ihr. Das
Wissen ist jeweils der Grund der Handlung (Tanz → Richtung und Weite, Duft → Wiese finden, UV-Mitte → Landeplatz,
Merkpunkte und Himmelslicht → Heimweg, Geruch → Einlass).

**Behalten soll das Kind (Annahme):** (1) Bienen zeigen einander den Weg mit einem Wackeltanz. (2) Bienen sehen Farben,
die wir nicht sehen, und finden so die Blütenmitte. (3) Die „gelben Kugeln“ an den Hinterbeinen sind gesammelter
Blütenstaub – kann das Kind im Frühling an jeder Biene am Löwenzahn selbst sehen.

## 1. Recherche

Quellen (alle abgerufen 2026-11-15; je Tatsache in `quellen` der `geschichte.json`):

1. Universität Hohenheim, Landesanstalt für Bienenkunde: Rosenkranz, Skript „Nutztierethologie: Honigbienen“ –
   Arbeitsteilung nach Alter (Sammelbiene meist ab ca. 2 Wochen, flexibel), Schwänzeltanz (Winkel zum Lot = Winkel
   Sonne–Futter), Fühlerkontakt, Blütenduft, Nektargaben, Polarisationslicht bei bedecktem Himmel, Blütenstetigkeit,
   Wächterbienen.
2. LAVES Institut für Bienenkunde Celle: „Bienen können Farben unterscheiden“ (UV ja, Rot nein, Saftmale, Duft im
   Pelz als Kennzeichen der Tracht), „Pollen – ein wichtiger Bestandteil der Bienenernährung“ (Pollenhöschen,
   Blütenstetigkeit, Bienenbrot), „Bienenbiologie – eine Einführung“ (Tabelle Aufgaben: Sammelbiene ab ca. Tag 21).
3. Bayerische Landesanstalt für Weinbau und Gartenbau, Fachzentrum Bienen: „Wir erforschen die Bienenanatomie“
   (3 Teile, 2 Flügelpaare mit Häkchen, 3 Beinpaare, 2 Facetten- und 3 Punktaugen, Rüssel, Körbchen, Stachel mit
   Widerhaken).
4. Bayerische Akademie für Naturschutz (ANL), Aktion 8 „Ein Bienenvolk im Schulhof“: Orientierungsflug in kurzen
   Bögen, Wächterbienen prüfen Ankommende, erfahrene Bienen fliegen gleich in die bekannte Richtung.
5. R. Menzel (FU Berlin), „Was Bienen im Tanz mitteilen“, Schweizerische Bienen-Zeitung 08/2019; SRF Kids 2025:
   je länger das Wackeln, desto weiter.
6. Koski & Ashman 2014 (Functional Ecology): UV-Bullseye verbreitet, lockt Bienen; UV-Foto Löwenzahn (Kennard):
   Blütenblätter UV-hell, Mitte UV-dunkel.
7. Eban-Rothschild & Bloch 2008 (J. Exp. Biol.): Sammlerinnen schlafen nachts; Kaiser 1988 (über scienceabc):
   Fühler sinken im Schlaf.
8. Vincze et al. 2025 (Int. J. Biometeorology): Regen, Wind und Kälte behindern den Flug.
9. Pollenfarbe Löwenzahn orange/rötlich-gelb: Wikipedia „Pollen source“ (nach Kirk, Colour Guide to Pollen Loads) –
   schwächste Quelle, siehe Unsicherheiten.

**Verworfen bzw. abgeschwächt:**

- „Jede Biene stirbt, wenn sie sticht“ – nur beim Stich in elastische Haut (Mensch, Säugetier) bleiben die
  Widerhaken hängen und der Stachelapparat reißt heraus; gegen Insekten mit Panzer kann sie mehrfach stechen (SRF
  2026, LWG Anatomie). Die Geschichte kommt ohne Stich aus (Stufe Sanft; Wächterin prüft nur mit den Fühlern).
- „Bienen sehen Rot“ – nein, Rot ist für das Bienenauge unsichtbar, UV dagegen sichtbar (LAVES). Deshalb kein roter
  Mohn als Zielblume. Auch nicht: „Die Mitte sieht für Bienen dunkel aus“ – Bienen sehen dort eine *andere Farbe*
  (UV fehlt), nicht Dunkelheit → Text: „hat für Bienen eine eigene Farbe“.
- „Das Vorspiel vor dem Flugloch sind Jungbienen beim Orientierungsflug“ – laut neuerer Imkerliteratur besteht die
  schwebende „Bienenwolke“ kaum aus Jungbienen. Text sagt nur, was die ANL belegt: kurze Bögen, Lage einprägen; kein
  Begriff „Vorspiel“, kein „Kopf zum Stock“.
- „Der Tanz gibt die Entfernung in Metern an“ – die Entfernungsangabe ist ungenau (Spektrum: über Wasser anders als
  über Land) → nur „lange gewackelt – weit“.
- „Neue Sammlerin fliegt per Tanz exakt zur Blüte“ – Nachfolgerinnen fliegen grob in die Richtung und suchen dann
  am Duft (Hohenheim, LAVES) → S. 6 „Da riecht Lotta den Duft der Tänzerin“.
- „Bienen arbeiten genau 21 Tage im Stock“ – Angaben schwanken (Hohenheim ca. 2 Wochen, ab 5 Tagen möglich; LAVES
  ca. 21 Tage, „nur Anhalt“) → „Viele Tage lang“.
- „Bienen verkriechen sich bei Regen unter Blättern“ – nur in Imker-Blogs belegt → nicht im Text; Lotta kommt vor
  dem Regen heim.
- Der Schwänzeltanz wird erst ab ca. 100 m getanzt (darunter Rundtanz) → Wiese „weit, weit über die Hecke“.

**Offene Unsicherheiten:**

- Pollenfarbe Löwenzahn „orange“ steht nur in einer Sekundärtabelle (Wikipedia nach Kirk); Imkerquellen nennen
  Löwenzahn als Pollenquelle, aber keine Farbe. Für Fotos und Text plausibel (Löwenzahn-Pollen kräftig gelb-orange),
  der Prüfer soll entscheiden, ob „orange“ bleibt oder „gelbe Kugeln“ sicherer ist. → entschieden: „gelb“ (§2).
- „Fühler sinken im Schlaf“ (Kaiser 1988) nur populär belegt → gestrichen (§2).
- Polarisationslicht: Hohenheim „bei bedecktem Himmel“; genauer braucht die Biene Flecken freien Himmels. Text sagt
  „ein Lichtmuster, unsichtbar für uns“ – Bild deshalb mit Wolken *und* blauen Lücken.
- Wächterin prüft am Geruch: ANL + Butler & Free 1952 (nur Katalogeintrag gelesen). Wächterinnen stehen nicht immer
  am Flugloch – für eine Geschichte vertretbar.
- Zeitablauf: S. 1 → S. 3 „ein paar Tage“ Orientierung, dann ein Sammeltag, Nacht, Morgen – realistisch. Löwenzahn,
  Gänseblümchen und Apfelblüte blühen gleichzeitig im April/Mai.
- Lotta ist auf Fotos nicht von anderen Bienen zu unterscheiden. Auf Seiten mit mehreren Bienen (3, 4, 11, 14) muss
  der Bildaufbau sie zeigen (vorn, scharf, mittig) – Prüfer und Bildschritt entscheiden; kein Farbpunkt auf dem
  Rücken (müsste erklärt werden, Imkereingriff).

## 2. Urteil des frischen Prüfers (Zusammenfassung)

- **Stark:** Bogen „Tanz lernen → selbst tanzen“; die Komplikation (Wolken) wird mit Wissen gelöst (Merkpunkte von S. 2,
  Lichtmuster); Frage S. 13 sehr gut; Mythen sauber verworfen; Titel gut.
- **Umgesetzt:**
  1. S. 5 war zu abstrakt („gerade nach oben gelaufen → zur Sonne“) → „Der Tanz zeigt Lotta die Richtung: zur Sonne
     hin. Und er zeigt: Es ist weit.“ Die Regel oben = Sonne steht nur in `quellen`.
  2. S. 6 Lehrsatz („Die Mitte jeder Blüte hat für Bienen eine eigene Farbe“, „mehr als wir“) → aus Lottas Sicht:
     „In der Mitte der Blüten leuchtet für Lotta ein Fleck. Menschen können seine Farbe nicht sehen.“ Allgemein
     „der Blüten“, weil das UV-Muster beim Löwenzahn nur durch UV-Fotos belegt ist, nicht durch eine Studie.
  3. Pollenfarbe: keine Pollenfarbtafel eines Bieneninstituts für Löwenzahn gefunden → „gelbe Kugeln“ (S. 8, 13),
     im Steckbrief und in den Bildern ebenso gelb.
  4. „Fühler sinken im Schlaf“ (nur populär belegt) gestrichen → „Lotta hält still und schläft.“
  5. Fassung `ruhig` angelegt (`../biene-ruhig/`): S. 9–12 ohne Unsicherheit, Lotta ist vor dem Regen zu Hause.
     `abenteuer` nicht nötig.

## Steckbrief (für jeden Bild-Prompt wörtlich)

**Lotta:** „a single Western honey bee worker (Apis mellifera carnica), photographed as a sharp macro photo; dark
brown to black abdomen with narrow pale grey hair bands, no yellow rings; thorax covered in short light brown-grey fuzz;
two large dark compound eyes; two elbowed dark antennae; exactly four transparent wings with fine dark veins (two on
each side, a larger forewing over a smaller hindwing); exactly six legs, all attached to the thorax; the bee fills about
one third of the frame“.

**Pollenhöschen** (nur ab Seite 8 und auf 11–13; Seite 7 nur gelber Staub im Pelz): „one round bright yellow pollen
load on the outer side of each hind leg (two in total)“. Seiten 1–6, 9–10 ohne Pollenhöschen; 11 mit; 12 beim
Abstreifen; 13 mit; 14 ohne (abgestreift).

**Orte (wörtlich gleich):**

- Stock: „a light blue painted wooden beehive box with a narrow horizontal entrance slit and a small landing board,
  standing on a low stand in a garden“.
- Merkpunkte: „a green hedge behind the hive and a flowering apple tree with white-pink blossoms beside it“.
- Wiese: „a spring meadow full of yellow dandelions (Taraxacum officinale) with a few white daisies, soft daylight“.
- Im Stock: „honeycomb with hexagonal wax cells on a vertical comb, warm dim light as in an observation hive“.
- Alle Bilder: Frühling, hell, ruhig, Hintergrund weich unscharf, keine Menschen, keine Schrift, kein Imker, kein
  Stich, keine toten oder kranken Bienen, keine Wespen/Hornissen, keine Spinnen.

**Körperbau prüfbar halten:** Bienen bevorzugt in Seitenansicht oder Schrägaufsicht, sitzend (Beine und Flügel zählbar);
Flugbilder seitlich mit ganz leichter Flügelunschärfe, Biene nicht zu klein; auf Waben höchstens 3–5 Bienen deutlich,
Lotta vorn; keine Schwärme in Nahaufnahme.

## Geplante Kernaussage je Abschnitt (Bild)

| Seite | Kernaussage des Bildes | Motiv (Körperbau prüfbar) |
|---|---|---|
| 01 | Lotta kommt zum ersten Mal ins Licht | Lotta sitzt seitlich auf dem Anflugbrett vor dem Flugloch des blauen Kastens, Sonnenlicht, ohne Pollen |
| 02 | Kurzer Bogenflug vor dem eigenen Stock; Merkpunkte sichtbar | Lotta seitlich im Flug nah vor dem Flugloch; im weichen Hintergrund Hecke und Apfelbaum |
| 03 | Eine Biene tanzt auf der Wabe (Wackellauf) | Wabe senkrecht, eine Tänzerin mittig, Hinterleib leicht unscharf vom Wackeln, 2–3 Bienen ringsum |
| 04 | Lotta folgt der Tänzerin, Fühler berühren sie | zwei Bienen groß im Bild auf der Wabe: Lotta dicht hinter der Tänzerin, Fühler an ihrem Hinterleib |
| 05 | Lotta fliegt weit, über die Hecke, zur Sonne hin | Lotta seitlich im Flug, unter/hinter ihr die Hecke, Sonne tief im Bildhintergrund (Gegenlicht weich) |
| 06 | Unten liegt die gelbe Wiese; die Blütenmitte ist das Ziel | Lotta im Anflug knapp über einer Löwenzahnblüte, die Blüte groß und scharf, Wiese dahinter (kein UV-Falschfarbenbild – Annahme; sonst Text anpassen) |
| 07 | Rüssel trinkt Nektar, Staub bleibt im Pelz | Makro seitlich: Lotta in der Blütenmitte, Rüssel sichtbar, gelber Pollen im Brustpelz |
| 08 | Zwei gelbe Pollenkugeln an den Hinterbeinen; Gänseblümchen daneben bleiben unbesucht | Lotta seitlich auf Löwenzahn, beide Höschen gut sichtbar, Gänseblümchen unscharf daneben |
| 09 | Dunkle Wolken verdecken die Sonne, Lotta fliegt los | Lotta klein bis mittel im Flug über der Wiese, Himmel mit dunklen Wolken, ruhig (kein Gewitter, kein Blitz) |
| 10 | Blaue Himmelslücken – und die Merkpunkte sind wieder da | Lotta im Flug, vor ihr Hecke, Apfelbaum und blauer Kasten; Wolken mit blauen Lücken |
| 11 | Wächterin prüft Lotta am Flugloch mit den Fühlern | zwei Bienen auf dem Anflugbrett, Fühler aneinander, Lotta mit gelben Höschen (ohne Tropfen, damit das Bild auch zur Fassung `ruhig` passt) |
| 12 | Kugeln in die Zelle – dann Nachtruhe | Lotta am Rand einer Wabenzelle, in der gelber Pollen liegt; ruhig, gedämpftes Licht (eine Szene; der Schlaf steht im Text) |
| 13 | Frage: Lotta kommt wieder mit Pollen heim (verrät den Tanz nicht) | Lotta landet im Morgenlicht auf dem Anflugbrett, gelbe Höschen, keine Wabe, kein Tanz |
| 14 | Lotta tanzt, andere folgen ihr | wie 03/04: Lotta mittig auf der Wabe (ohne Höschen), Hinterleib leicht unscharf, 2–3 Bienen folgen mit Fühlern |

## 3. Bilder

Jedes Bild mit dem Read-Werkzeug angesehen. Maßstab: Kernaussage des Abschnitts, Körperbau (sechs Beine an der Brust,
je Seite Vorder- über Hinterflügel, zwei geknickte Fühler, Carnica-Färbung ohne Wespenringe), Lotta auf Bildern mit
mehreren Bienen vorn und scharf, Pollenhöschen nur an den Hinterbeinen und nur auf 08–13, hell, ruhig, keine Schrift.
Steckbrief und Orte stehen wörtlich in jedem Prompt; 1024 × 1024 `--basis foto`, WebP `cwebp -q 82`; Prompts in
`bilder/herkunft.json` (bei Neuversuchen der letzte).

| Bild | Kernaussage | was stimmt | Versuche |
|---|---|---|---|
| 01 | Lotta kommt zum ersten Mal hinaus ins Licht | steht auf dem Anflugbrett, das Flugloch hinter ihr, Kopf zum sonnigen Garten; ohne Pollen | 2 (Versuch 1 zeigte sie zum Flugloch hin, wirkte wie Heimkehr) |
| 02 | kurzer Bogen vor dem eigenen Stock, Merkpunkte | fliegt nah vor dem blauen Kasten, dahinter Hecke und blühender Apfelbaum | 1 |
| 03 | eine Biene tanzt auf der Wabe | Tänzerin mittig, Hinterleib vom Wackeln unscharf, drei Bienen ringsum | 1 |
| 04 | Lotta folgt der Tänzerin, Fühler an ihr | zwei Bienen groß, Lottas Fühler am Hinterleib der Tänzerin | 1 |
| 05 | Lotta fliegt über die Hecke zur Sonne hin | von hinten, fliegt auf die tiefe Sonne zu, unter ihr die Hecke | 2 (Versuch 1 flog von der Sonne weg) |
| 06 | Wiese voller Löwenzahn, Anflug auf die Blütenmitte | Lotta knapp über einer großen Löwenzahnblüte, Wiese mit Gänseblümchen; Naturfarben, kein UV-Falschfarbenbild | 1 |
| 07 | Rüssel trinkt Nektar, Staub im Pelz | Rüssel in den Blütchen, gelber Pollen im Brustpelz | 1 |
| 08 | gelbe Pollenkugeln, Gänseblümchen bleiben unbesucht | Höschen am Hinterbein deutlich, Gänseblümchen daneben | 1 |
| 09 | dunkle Wolken vor der Sonne, Lotta fliegt los | graue Wolkendecke, Lotta mit beiden Höschen über der Wiese; ruhig, kein Gewitter | 1 |
| 10 | Wolken mit blauen Lücken, die Merkpunkte sind da | Lotta fliegt auf Hecke, Apfelbaum und blauen Kasten zu; blaue Lücken zwischen Wolken | 1 |
| 11 | Wächterin prüft Lotta mit den Fühlern | zwei Bienen auf dem Anflugbrett, Fühler aneinander, Lotta mit Höschen vorn rechts; keine Tropfen (passt zu `ruhig`) | 1 |
| 12 | Pollen in die Zelle | Lotta am Zellrand, Höschen nur an den Hinterbeinen, Zellen mit Pollen und Honig | 2 (Versuch 1: zweite Kugel schien am Mittelbein) |
| 13 | Frage: Lotta kommt mit Pollen heim | landet im Morgenlicht auf dem Anflugbrett, beide Höschen; keine Wabe, kein Tanz | 1 |
| 14 | Lotta tanzt, andere folgen | Lotta vorn rechts, scharf, Hinterleib unscharf vom Wackeln, drei Bienen tasten sie mit den Fühlern; ohne Höschen | 1 |

17 Versuche für 14 Bilder (Fassung `ruhig`: 1 weiteres Bild, `../biene-ruhig/bilder/09.webp`, 1 Versuch). Kosten laut
`node werkzeuge/kosten/bericht.mjs`: biene 1,10 €, biene-ruhig 0,06 € (`kosten.json`).
