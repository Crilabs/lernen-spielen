# Grundsätze für Bilder, Figuren, Symbole und Farben

Stand: 2026-11-14 · **freigegeben** (Christian, 2026-11-14)
Ergänzt [`grundsaetze.md`](grundsaetze.md) und gilt wie dieses für jedes neue Spiel, jedes Bild und jedes Symbol.
Begründungen und Quellen: [`docs/reports/Bilder und Symbole für Lernspiele.md`](reports/Bilder%20und%20Symbole%20f%C3%BCr%20Lernspiele.md),
Rohnotizen in `docs/research_notes/Bilder und Symbole für Lernspiele/`.

Kennzeichnung wie in `grundsaetze.md`: **[B]** gut belegt · **[b]** belegt mit Einschränkungen ·
**[P]** Praxiswissen bzw. Tradition · **[E]** eigene Entscheidung des Projekts · *Annahme:* noch zu prüfen.

Dieses Dokument legt fest, wie es aussehen soll. Es ändert keine bestehenden Spiele.

---------------------------------------------------------------------------------------------------
## 0. Leitsatz

> **Fest bleibt, was Bedeutung trägt. Wechseln darf, was Stimmung trägt.**

Jedes Bildelement gehört zu genau einer von zwei Ebenen:

| Ebene | Was dazugehört | Regel |
|---|---|---|
| **Bedeutungsebene** | Lernzeichen (Perlen, Plättchen, Zahlenstrahl, Stellenwerte, Wortartensymbole, Wortkarten), Bedeutungsfarben, Bedienknöpfe, Rückmeldesignale, Echt-Zeichen, Raster der Bildschirme | in allen Spielen gleich, schlicht, ohne Schmuck |
| **Stimmungsebene** | Szenen und Hintergründe, Farbpalette und Licht einer Welt, Wetter, Tageszeit, Gäste, Beispiele | darf und soll wechseln |

Daraus folgt die Prüffrage für jedes Bild: **Auf welcher Ebene steht es?** Steht etwas auf der
Bedeutungsebene, wird es nicht für ein Spiel neu erfunden. Steht es auf der Stimmungsebene, darf es
nicht so aussehen wie ein Lernzeichen (keine Deko-Perlen, keine Dreiecke als Schmuck).

Begründung kurz: Schlichtes Lernmaterial wirkt beim Behalten und Problemlösen deutlich besser als
realistisches (Carbonneau 2013: d = 0,77 gegen 0,28 bzw. 0,80 gegen −0,27) [B]; zählbare Bildchen
verleiten Kinder in Kl. 1–2 zum Abzählen statt zur Struktur (Kaminski & Sloutsky) [b]. Abwechslung auf
der Stimmungsebene kostet nichts und hält die Spiele unterscheidbar [P].

---------------------------------------------------------------------------------------------------
## 1. Bildarten und ihr Stil

| Bildart | Wofür | Stil | Herstellung |
|---|---|---|---|
| **Lernzeichen** | der Lernkern | flach, eine Farbe je Bedeutung, keine Gesichter, kein Glanz, keine Gegenstände als Zählobjekte | SVG von Hand |
| **Erzählfiguren** | Geschichte, Gefühle, Vorbild | klar stilisiert (Abschnitt 2) | SVG von Hand nach Figurenblatt |
| **Wortbilder** | Bild zu einem Wort (Hör-, Anlaut-, Zuordnungsaufgaben, verwandeln) | stilisiert wie die Figuren, aber sachlich richtig (Abschnitt 3) | SVG von Hand |
| **Sachbilder** | echte Welt in der Kosmik-Schicht | Foto oder naturgetreue Zeichnung, mit Echt-Zeichen | lizenziertes Foto oder geprüfte Zeichnung, nie fotorealistische KI |
| **Szenenbilder** | Welt, Wimmelbild, Pausenbild | frei je Welt, gemeinsame Grundregeln (Abschnitt 8) | darf generiert werden (Abschnitt 10) |
| **Bedienzeichen** | Knöpfe, Navigation | gegenständlich, überall gleich (Abschnitt 7) | SVG von Hand (`spiele/symbole/`) |

**Gemeinsame Grundregeln für alles Gezeichnete** [E]: Kontur `#3B2A6B`, Strich 4 (bei Figuren in der
viewBox 0 0 320 280), runde Linienenden, Pastell als Grundton. Schrift Andika. Diese Merkmale halten
Figuren, Wortbilder und Bedienzeichen als eine Familie zusammen.

---------------------------------------------------------------------------------------------------
## 2. Erzählfiguren: eine Runde von Kindern

| Nr. | Regel | Stand |
|---|---|---|
| F1 | **Figuren sind Kinder.** Keine vermenschlichten Tiere, keine Fabelwesen, keine Fantasiefiguren. Das Einhorn, der Drache und die Zauberin entfallen. | [E]; gestützt durch Ganea 2014 (vermenschlichte Tiere senken den Faktentransfer) [b] |
| F2 | **Eine feste Runde für alle Fächer.** Dieselben Kinder in Mathe, Deutsch und den Sachthemen, gleich in Aussehen, Proportion und Stimme. Kein Kind ist einem Fach zugeordnet. Das Fach zeigt sich an Fachsymbol und Ort, nicht an einer Figur. | [E]; Bindung an bekannte Figuren hilft [b] (Gola 2013, Kinder bis 6); Fachfiguren ohne Forschung, Stereotyp-Risiko [B] (Cvencek 2011) |
| F3 | **Gäste am Rand.** Jede Welt darf Nebenfiguren haben (Menschen, die dort arbeiten oder wohnen). Sie wechseln, die Runde bleibt. | [E] |
| F4 | **Klar stilisiert, nichts Halbrealistisches.** Kontur nur um die Silhouette, große Köpfe, Farbflächen mit Schatten in Stufen statt Verläufen (Einzelheiten: `figuren.md` §4). Bis etwa 8 Jahre wirkt Menschenähnlichkeit nicht unheimlich, ab etwa 9 schon; halbrealistische Figuren sind das größte Risiko. | [b] Brink 2019 (an Robotern untersucht); Borgi 2014 (Kindchenschema lenkt Aufmerksamkeit) |
| F5 | **Für Gefühle Dreiviertel- oder Frontalansicht.** Das heutige Profil nach rechts bleibt für Bewegung (laufen, tragen). | *Annahme* |
| F6 | **Bewältigungsmodelle.** Die Kinder zögern, irren sich, probieren eine Probe und schaffen es dann. Keines ist „die Schlaue“ oder „der Schnelle“; Erfolg kommt sichtbar aus einem Weg, nicht aus Begabung. | [b] Schunk 1987, Schunk & Hanson 1985; Bian 2017 |
| F7 | **Jede Figur hat eine Aufgabe** (zeigen, fragen, sich freuen, sich wundern), nie nur Deko. Gefühle nach `grundsaetze.md` 3.1: Die Figur benennt ihr eigenes Bedürfnis, nie das Kind als Ursache. | [B] Schroeder 2013 (kleiner Effekt von Lernfiguren); 3.1 |
| F8 | **Keine Fakten aus dem Mund der Figur als eigenes Erlebnis.** Die Figur zeigt auf das Sachbild („Schau, so sieht eine Feldmaus aus“), das Sachbild trägt den Fakt. | [b] K3 |
| F9 | **Figurenblatt.** Aussehen, Name, Stimme und typische Rollen der Runde stehen in einem Figurenblatt, das nach `grundsaetze.md` 6.1–6.3 geprüft ist: verschiedene Hautfarben, Haare, Körper; Brille, Hörgerät, Rollstuhl, Kopftuch als selbstverständliche Teile aktiver Figuren; beide Geschlechter lösen in Mathe und Deutsch gleich oft. | [B] 6; *Annahme:* Zusammensetzung der Runde (Zahl, Namen) noch festzulegen |

---------------------------------------------------------------------------------------------------
## 3. Tiere

| Nr. | Regel | Stand |
|---|---|---|
| T1 | **Tiere sind nie Figuren.** Kein Tier spricht, trägt Kleidung, zeigt menschliche Mimik oder handelt wie ein Mensch. | [b] Ganea 2014; Ausweitung auf alle Tiere [E] |
| T2 | **Als Sachbild naturgetreu.** Foto oder naturgetreue Zeichnung mit Echt-Zeichen; Art, Anatomie und Lebensraum stimmen. | [b] Ganea 2014, Strouse 2018 |
| T3 | **Als Wortbild stilisiert, aber richtig.** Wortbilder (die Katze im Großbuchstaben-Zauberer, der Hund im Anlautspiel) bleiben im Figurenstil, haben die richtige Zahl Beine, die richtigen Ohren und keine menschliche Mimik. Natürliches Verhalten (fressen, schlafen, laufen, blinzeln) darf animiert sein. | [E]; *Annahme:* Grenze „vereinfacht ja, falsch nein“ ist nicht empirisch geprüft |
| T4 | **Keine Mythen im Bild.** Keine Maus mit Käse, kein Igel mit Apfel auf dem Rücken. | [b] K3 |

---------------------------------------------------------------------------------------------------
## 4. Lernzeichen Mathematik

| Nr. | Regel | Stand |
|---|---|---|
| M1 | **Schlicht.** Perlen, Plättchen, Stäbe: flache Farbe, kein Glanz, keine Gesichter. Das Thema der Welt steckt in Rahmen und Aufgabe (Körner für Mäusenester), nicht im Zählmaterial. | [B] Carbonneau 2013; McNeil 2009 |
| M2 | **Mengen zeigen ihre Struktur.** Fünfer- und Zehnergliederung durch eine Lücke nach der fünften Perle und eine Marke; jede Perle einzeln sichtbar; Länge proportional zur Zahl. | [b] Obersteiner 2013, Lüken 2012 |
| M3 | **Perlenstäbchen in den Montessori-Farben** (1 rot, 2 grün, 3 rosa, 4 gelb, 5 hellblau, 6 lila, 7 weiß, 8 braun, 9 dunkelblau, 10 gold), immer zusammen mit der Fünfergliederung aus M2. Die Farbe hilft beim Wiedererkennen eines Stäbchens; die Menge zeigt die Struktur. | Farbfolge [P] Montessori, ohne Wirkungsstudie; Fünfergliederung [b] Obersteiner 2013; Beibehalten [E] |
| M4 | **Proportionales Material zuerst.** Goldenes Perlenmaterial (Einer, Zehnerstab, Hunderterplatte) vor dem Markenspiel; Bündeln und Entbündeln werden gezeigt (Animation). Das Markenspiel kommt erst nach sicherem Bündeln, sein Aufdruck 1/10/100 trägt, die Farbe hilft. Nicht zu lange auf der konkreten Stufe bleiben. | [b] Laski 2016 |
| M5 | **Stellenwertfarben nur zusätzlich.** Einer türkis, Zehner orange, Hunderter schiefergrau, immer zusammen mit Spalte, Beschriftung E/Z/H und Ziffer; ausblendbar und später ausgeblendet. Die Montessori-Stellenwertfarben (grün, blau, rot) werden nicht übernommen, weil sie mit den Perlenfarben kollidieren (Rot wäre die 1 und der Hunderter, Grün die 2 und der Einer, Blau die 5/9 und der Zehner). | [E] Farbwahl; [P] keine Wirkungsstudie |
| M6 | **Zahlenstrahl linear,** nie kreisförmig, Zehner gegliedert. Hunderterfeld 10 × 10 mit Fünferbruch, Verbindung zum Zahlenstrahl sichtbar. | [B] Siegler & Ramani 2008; Hunderterfeld [P] |
| M7 | **Material und Zeichen verbinden.** Wo Perlen stehen, steht (nach dem Festlegen, L2) auch die Ziffer; der Übergang Ding → Bild → Zeichen ist sichtbar. | [B] Carbonneau 2013 (Anleitung verstärkt den Effekt); L7 |
| M8 | **Perlenkette fürs Einmaleins** (`<ls-perlenkette>`): zehn gleiche Stäbchen zu je n Perlen (M2, M3) hintereinander, in zwei Reihen zu fünf; am Ende jedes Stäbchens ein Pfeilchen mit k · n (Montessori-Pfeilkärtchen, erst nach dem Festlegen, M7). Ein Stäbchen ist eine Gruppe, die Kette viele gleiche Gruppen. | Christian 2026-11-14 (M37); [P] Montessori-Kurzketten |

---------------------------------------------------------------------------------------------------
## 5. Lernzeichen Deutsch

| Nr. | Regel | Stand |
|---|---|---|
| D1 | **Wortartensymbole: Form trägt, Größe und Farbe helfen.** Nomen großes schwarzes Dreieck, Artikel kleines hellblaues Dreieck, Adjektiv mittleres dunkelblaues Dreieck, Verb großer roter Kreis (nach AMI). In Kl. 1–2 nur diese vier. Das Symbol hängt an der Probe, nie an einer Bedeutungsregel (`grundsaetze.md` 5). | [P] AMI/Ortega; Auswahl [E] |
| D2 | **Keine weiteren Grammatiksymbole in Kl. 1–2** (Pronomen, Präposition, Konjunktion, Interjektion, Zahlwort, Satzanalyse). Satzerweiterung mit Wortstreifen ja, ohne neue Symbole. | [P] |
| D3 | **Vokale beim Wortbauen dezent markiert,** ausblendbar; beim Lesen fertiger Texte ohne Markierung. | [P]/[b] |
| D4 | **Farbige Silben nicht als Standard.** Zuschaltbar, nur für mehrsilbige Wörter. | [b] Brügelmann 2025 (Befunde widersprüchlich, Effekte um 0,1) |
| D5 | **Beim Erlesen kommt das Bild danach.** Soll ein Wort gelesen werden, verrät kein Bild es vorher; das Bild bestätigt. Bei Hör-, Anlaut- und Zuordnungsaufgaben sind Bilder richtig. | [b] Samuels 1967, Torcasio & Sweller 2010 |
| D6 | **Schrift groß und weit gesetzt,** Andika in den Richtformen der Grundschule; Größe und Abstand einstellbar. | [B] Hughes & Wilkins 2000; [b] Zorzi 2012 |
| D7 | **Schreiben statt Nachspuren.** Strichfolge vorführen, dann frei schreiben lassen, tolerant erkennen, Laut dazu sprechen. Sandpapierbuchstaben als Mach-mit-Moment im Spiel (`grundsaetze.md` L13). | [b] Longcamp 2005, Mayer 2020, James & Engelhardt 2012 |
| D8 | **Buchstaben tragen keine Einzelfarben.** Kein Farbcode je Buchstabe (auch kein Regenbogen nach dem Alphabet): 30 willkürliche Farbpaare muss das Kind erst lernen, benachbarte Töne sind kaum zu unterscheiden, und die Vokalmarkierung (D3) wäre nicht mehr möglich. Auf Tastaturen helfen **feste Plätze** beim Finden: Das ganze Alphabet steht immer an derselben Stelle, Tasten, die gerade nicht gebraucht werden, sind blass statt zu verschwinden. | [B] Farbe als Suchmerkmal nur bei bekannter Zielfarbe (Treisman, Wolfe; an Erwachsenen); feste Plätze [P]; Regel [E] |

### 5a. Geplante Lernzeichen (Spielkatalog §8)

Der Spielkatalog braucht weitere Lernzeichen. Sie sind **noch nicht festgelegt**: Jedes wird im Plan des ersten
Spiels entworfen, das es braucht, mit diesem Plan freigegeben (Christian) und dann hier eingetragen. Bis dahin
gilt diese Liste nur als Vormerkung.

- **Geometrie** (bisher keine): Formplättchen, Kästchen- und Punktgitter, Stäbe und Kugeln, Holzwürfel, Pfeil- und
  Lagewort-Karten, Werkzeuge (Lineal, Zirkel, Geodreieck); eine Merkmalspalette für „Farbe als Sortiermerkmal“,
  getrennt von den Perlenfarben (M3).
- **Mathematik:** u. a. Balkenwaage, Zahlenmauer, Rechendreieck, Zeigeruhr, Lineal, Messbecher, Geld (vereinfacht,
  in Größe und Farbe wie echt, Annahme), Strichliste, Baumdiagramm, Tausenderwürfel, Stellenwertfarbe Tausender
  (neben M5), Zerlegungsliste (geordnete Tabelle der Zerlegungen).
- **Deutsch:** Silbenbogen, Lautplättchen und Wagen, Pausen- und Stimmmarken, Fuge zwischen Wortbausteinen,
  **Kontrollkarte** (Fehlerkontrolle zum Selbst-Umdrehen bei Formen, die man nicht herleiten kann,
  `grundsaetze.md` 3.1).

---------------------------------------------------------------------------------------------------
## 6. Farben

### 6.1 Regeln

| Nr. | Regel | Stand |
|---|---|---|
| C1 | **Farbe nie allein.** Jede Bedeutungsfarbe ist doppelt codiert: Form, Größe, Ort oder Beschriftung. Prüfen in der Simulation für Protanopie und Deuteranopie. | [B] Birch 2012, WCAG 1.4.1 |
| C2 | **Eine Farbe, eine Bedeutung je Spiel.** Kommen Mathe- und Deutschzeichen nie im selben Spiel vor, dürfen sie dieselbe Farbe nutzen (Rot: Perle 1 und Verb). Treffen sie sich in einem Spiel, trägt die Form die Unterscheidung und eine der Farben tritt zurück. | [E] |
| C3 | **Welt-Paletten lassen die Bedeutungsfarben frei.** Im Lernfeld nutzt die Szene keine der Bedeutungsfarben aus 6.2 für Schmuck; das Lernfeld liegt immer auf Papier. | [E] |
| C4 | **Kontrast** Text mindestens 4,5:1, Bedienzeichen und Lernzeichen mindestens 3:1 gegen den Grund. | [B] WCAG 1.4.3, 1.4.11 |
| C5 | **Kein Farbcode für Personen.** Keine Jungen- und Mädchenfarben, keine Farbe als Merkmal einer Gruppe (`grundsaetze.md` 6.1 Nr. 7). | [b] 6 |

### 6.2 Die Farbwelt

Freigegeben 2026-11-14 [E]. Anschauung: [`docs/farbwelt.html`](farbwelt.html) bzw. Artifact „Farbwelt Lernen Spielen“
(https://claude.ai/artifact/Kdyxd4fQ9DxcFNgerBMvwr). Kontraste nach WCAG gegen Papier `#FFFCF7` berechnet.

**Bild: ein Montessori-Werkraum.** Papier und Tinte sind der ruhige Grund. Das Material liegt auf einem
hellen Holztablett, gearbeitet wird auf einer Matte. Drumherum leuchten die Welten weich.

**Fünf Schichten.** Eine Farbe darf auf mehreren Schichten vorkommen, trägt auf einer Schicht aber nur eine
Bedeutung. Die Schichten sind räumlich getrennt und an der Form zu unterscheiden.

| Schicht | Was | Farben |
|---|---|---|
| 1 Hülle | Knöpfe, Navigation, Schrift | Grundton und Funktionsfarben |
| 2 Rahmen | Kopfleiste, Kachel, Fachsymbol: welches Fach dran ist | Fachfarben; nie als Fläche im Lernfeld |
| 3 Welt | Himmel, Landschaft, Gäste | Welt-Paletten, heller und weicher als die Lernzeichen |
| 4 Lernfeld (Matte) | Lernzeichen | liegt immer auf Papier, Rand als feine Naht; Bedeutungsfarben satt, flach, mit Tinte-Kontur |
| 5 Aufmerksamkeit | ausgewählt, hier geht es weiter | Sonnenring; bewertet nichts |

**Grundton**

| Name | Wert | Verwendung |
|---|---|---|
| Tinte | `#3B2A6B` | Schrift, Kontur aller Zeichnungen, Hauptknopf (11,9:1) |
| Tinte weich | `#6B5C96` | Nebentext, Vokal-Unterstrich (5,7:1) |
| Papier | `#FFFCF7` | Lernfeld, Karten, Nebenknöpfe |
| Nebel | `#F4F0FA` | Grundfläche hinter allem |
| Linie | `#E4DEF0` | Trennlinien (nie Schatten eines Knopfs) |
| Naht | `#CFC4E3` | gestrichelter Rand der Matte |
| Ahorn / Kante | `#EAD5B5` / `#B98E5E` | Tablett für den Materialvorrat |
| Nacht | `#1F1B45` | Pausen, Abend |

**Funktionsfarben der Hülle**

| Name | Wert | Bedeutung |
|---|---|---|
| Sonne | `#FFD95A` | ausgewählt, hier geht es weiter, Hilfe-Licht; als Ring oder Licht, nie als Fläche einer Antwort |
| Hauptknopf | Tinte, Schatten `#24184A` | z. B. Fertig; neutral, nicht grün. Weiter in der Pause ist wie Alle Spiele ein Papierknopf (N6) |
| Nebenknopf | Papier mit Tinte-Kontur, Schatten Tinte weich `#6B5C96` | Haus, Ton, Vorlesen, Hilfe |
| Beere | `#B3315A` | nur Elternbereich (Löschen, Achtung); beim Kind nie |

Es gibt kein Grün für „richtig“ und kein Rot für „falsch“; ob etwas passt, zeigt die Mechanik (`grundsaetze.md` 3.1).

**Fachfarben (Rahmen)**, je Füllung / Tief (Schrift, Schatten) / Tönung. Sachthemen haben keine Fachfarbe, sie sind Welten.

| Fach | Name | Füllung | Tief | Tönung | Tief auf Tönung |
|---|---|---|---|---|---|
| Mathe | Himbeere | `#F06BB0` | `#B8327A` | `#FFE6F2` | 4,7:1 |
| Grammatik | Minze | `#3DB98F` | `#1B7656` | `#DBF5EA` | 4,8:1 |
| Schreiben | Himmelblau | `#4C9BD1` | `#25689C` | `#DFF0FC` | 5,1:1 |
| Lesen | Honig | `#F2B630` | `#8A5D05` | `#FFF3D1` | 5,2:1 |
| Geometrie | Flieder | `#8C6FE0` | `#5B3FB8` | `#EEE8FF` | 6,2:1 |
| Sprechen und Zuhören | Aprikose | `#F08A4B` | `#A44C16` | `#FFEADD` | 5,0:1 |

**Lernfeld Mathe**

| Bedeutung | Wert | Zweites Merkmal |
|---|---|---|
| Perle 1 rot | `#E5484D` | Länge, Lücke und Marke nach der 5. Perle |
| Perle 2 grün | `#3FA34D` | |
| Perle 3 rosa | `#F4A3C0` | |
| Perle 4 gelb | `#F7D038` | |
| Perle 5 hellblau | `#6CB8F0` | |
| Perle 6 lila | `#9B5DE5` | |
| Perle 7 weiß | `#FFFFFF` | |
| Perle 8 braun | `#9A6B4F` | |
| Perle 9 dunkelblau | `#2F5BC4` (Kobalt, damit die Tinte-Kontur sichtbar bleibt) | |
| Perle 10 gold, goldenes Material | `#D9A520` | |
| Einer / Zehner / Hunderter | `#0FA3A3` türkis / `#F07C1E` orange / `#5B6478` schiefergrau | Spalte, E/Z/H, Ziffer; Orange nur als Fläche mit Kontur, nie als Schrift (2,7:1) |

**Lernfeld Deutsch**

| Bedeutung | Wert | Zweites Merkmal |
|---|---|---|
| Nomen | `#1E1A2E` | großes Dreieck |
| Artikel | `#7CC4F0` | kleines Dreieck, immer mit Kontur |
| Adjektiv | `#2F5BC4` | mittleres Dreieck |
| Verb | `#E5484D` | großer Kreis |
| Vokal beim Wortbauen | keine Farbe: Unterstrich in Tinte weich | ausblendbar (D3) |

**Welt-Paletten** (Himmel, Ferne, Boden, Akzent, Schatten); Tageszeiten verschieben nur das Licht.

| Welt | Werte |
|---|---|
| Wiese und Wald | `#CFEFFF` `#BFE3C9` `#9ED8A8` `#FFC9DE` `#5E9C77` |
| Wasser und Strand | `#C9ECFA` `#8FD3EE` `#F6E1B5` `#FF9F8A` `#4F8FB3` |
| Savanne | `#FDE7C4` `#F4C98E` `#E2B47A` `#8FB06A` `#A86E44` |
| Dorf und Stadt | `#DDEBFF` `#F7D6C5` `#CBB7A0` `#E9A0B5` `#7B6A8E` |
| Werkstatt | `#EFE7DD` `#D9C7B3` `#BFA58A` `#7FB3C9` `#6E5A4A` |
| Nacht und Himmel | `#2A2560` `#3D3A82` `#5B5AA6` `#FFE9A8` `#1F1B45` |

**Wahlfarben für das Kind** (N2), nur für Dinge, die dem Kind gehören oder die es gemacht hat (Profil, eigenes
Boot, eigenes Bild, Stift): Koralle `#FF7A6B`, Mandarine `#FFA94D`, Sonnenblume `#FFD43B`, Limette `#94D35A`,
Lagune `#2EC4B6`, Kornblume `#6C8CFF`, Orchidee `#C77DFF`, Kirschblüte `#FF9EC7`.

**Echt-Zeichen (Sachbild):** *Annahme:* fester Rahmen mit Symbol und dem Satz „In echt …“; Gestalt und Farbe noch offen.

### 6.3 Was bedeutet welche Farbe?

| Farbe | Hülle | Rahmen | Lernfeld Mathe | Lernfeld Deutsch | Welt |
|---|---|---|---|---|---|
| Rot | – | – | Perle 1 | Verb | Akzente (Fahnen, Blumen), nie im Lernfeld |
| Grün | – | Grammatik | Perle 2 | – | Wiese, Wald |
| Blau | – | Schreiben | Perle 5 hellblau, Perle 9 dunkelblau | Artikel hellblau, Adjektiv dunkelblau | Himmel, Wasser |
| Gelb | Sonne: ausgewählt, weiter, Hilfe | Lesen | Perle 4 | – | Sonne, Licht |
| Lila | – | Geometrie | Perle 6 | – | Abendlicht |
| Rosa | – | Mathe | Perle 3 | – | Blüten |
| Orange | – | Sprechen | Zehner | – | Savanne, Abendsonne |
| Türkis | – | – | Einer | – | Lagune |
| Schiefergrau | – | – | Hunderter | – | Stein, Fels |
| Gold | – | – | Perle 10, goldenes Material | – | – |
| Braun | – | – | Perle 8 | – | Erde, Holz |
| Weiß / Papier | Papier, Nebenknöpfe | – | Perle 7 | – | Wolken |
| Schwarz / Tinte | Schrift, Kontur, Hauptknopf | – | – | Nomen | Nacht |
| Beere | nur Elternbereich | – | – | – | – |

### 6.4 Stilmerkmale

- **Schatten heißt drückbar:** Knöpfe, Kacheln und ziehbare Teile haben einen festen, deutlich sichtbaren
  Schatten im Tief-Ton und sinken beim Drücken ein: Hauptknopf `#24184A`, Nebenknopf und Taste Tinte weich
  `#6B5C96`, Fachkachel der Startseite im Fach-Tief. Linie und Naht sind nie Schatten. Alles Flache ist zum
  Ansehen.
- **Eine Kontur für alles:** Tinte, Strich 3–4, runde Enden.
- **Verläufe nur in der Welt** (Himmel, Wasser, Licht); Lernzeichen immer flach, ohne Glanz.
- **Große, weiche Formen,** viel Papier um das Lernfeld.
- **Nacht für Pausen** mit Sonne und Papier, ohne Ablaufbalken.
- **Nicht:** Grün/Rot als richtig/falsch, Farben für Jungen und Mädchen, Farbe je Buchstabe, Neon und
  Dauerleuchten im Lernfeld, Fachfarben als Fläche im Lernfeld.

---------------------------------------------------------------------------------------------------
## 7. Bewegung

| Nr. | Regel | Stand |
|---|---|---|
| B1 | **Bewegung zeigt, was das Kind bewirkt.** Die richtige Antwort verwandelt, baut, trägt, lässt wachsen (N3). Diese Folge-Animationen sind ausdrücklich erwünscht; sie sind die Freude am Spiel. **Folge mit Freude (Christian, 2026-11-14):** Jede richtige Lösung hat eine sichtbare Folge, die sich aus der Aufgabe selbst erklärt (das Tier kann jetzt über die Brücke gehen, weil sie hält; der Deckel der Tonne schließt sich über dem Papier): eine Figur oder ein Ding reagiert. Sie gehört zum Spiel und ist keine Belohnung (N5, L8, K8): keine Punkte, keine Sterne. **Abwechslung und Passung:** Die Folge wechselt, damit sie nicht eintönig wird (gehen, traben, rutschen, hüpfen …); die Reaktion passt zur Handlung und zum Ding. Wie im echten Leben macht man nicht alles genau gleich: Form, Tempo und Weg dürfen variieren, kleine Zufallsauswahl unter passenden Varianten, nie ein seltener „Jackpot“ (B4). Spiele nutzen die Reaktionen der Runde (Branch `lustige-bewegungen`), sobald sie auf `main` sind, statt eigene zu bauen. | [b] N3; Beobachtung am eigenen Kind (keine Studie); (Christian) |
| B2 | **Bewegung zeigt, wie die Sache funktioniert.** Bündeln, Wandern auf dem Zahlenstrahl, Strichfolge: in Schritten, mit Sprechtext, vom Kind anzuhalten. | [B] Höffler & Leutner 2007, Berney & Bétrancourt 2016, Takacs 2015 |
| B3 | **Still, solange das Kind denkt.** Kein Wackeln, Blinzeln, Glitzern oder Pulsieren im oder neben dem Lernfeld, keine Dauerbewegung. Ein neues Element darf sich beim ersten Erscheinen einmal bewegen. | [B] Sundararajan & Adesope 2020; [b] Fisher 2014 |
| B4 | **Freude aus der Sache, nicht aus dem Zufall.** Die Folge einer richtigen Antwort kommt verlässlich, ihre Form wechselt mit dem Inhalt; keine seltene „Jackpot“-Animation. Nicht jedes Mal gleich laut (3.1 Nr. 5). | [E] nach N4, N5 |
| B5 | **Die Folge einer Antwort, die nicht passt, ist nie reizvoller** als die einer richtigen (N7). | [E] |
| B6 | **Kurz und überspringbar.** Rückmeldung während der Handlung etwa 1 s; die Folge einer gelösten Aufgabe bis etwa 3 s. Sie hält die nächste Aufgabe nicht auf, lässt sich immer antippen und überspringen, steht still, solange das Kind denkt (B3), und mit reduzierter Bewegung läuft eine ruhige, kurze Fassung (B7). | *Annahme* Dauer; (Christian) |
| B7 | **Wenig Bewegung einstellbar;** `prefers-reduced-motion` gilt in jedem Spiel. Keine Blitze, kein schnelles Flackern. | [B] WCAG 2.2.2, 2.3.3 |

---------------------------------------------------------------------------------------------------
## 8. Szenen und Welten

| Nr. | Regel | Stand |
|---|---|---|
| W1 | **Jede Welt hat eine eigene Palette und eigenes Licht** (Safari warm, Raumstation kühl, Dorffest bunt), innerhalb der gemeinsamen Grundregeln (Abschnitt 1). | [E] |
| W2 | **Sicherheitssignale im Bild** nach `grundsaetze.md` 9.2 Nr. 5: hell, ein freundlicher Mensch sichtbar oder in Rufweite, kein bedrohliches Dunkel. | [b] 9 |
| W3 | **Szenen prüfen und auszählen** nach `grundsaetze.md` 6.2 und 6.3: wer handelt, wer schaut zu, Berufe, Familien, Körper. | [B] 6 |
| W4 | **Tiere in Szenen sind sachlich richtig** (Art, Anatomie, Lebensraum, T1–T4). | [b] K3 |
| W5 | **Pausenbilder** gehören zur Stimmungsebene, haben einen sichtbaren Weiter-Knopf und laufen nicht ab (`grundsaetze.md` 13). | [E] |

---------------------------------------------------------------------------------------------------
## 9. Bedienzeichen

| Nr. | Regel | Stand |
|---|---|---|
| K1 | **Gegenständlich und überall gleich.** Ein Satz Bedienzeichen in `spiele/symbole/`, kein Spiel erfindet eigene für dieselbe Funktion. | [b] Kubincová & Ingesson 2021 |
| K2 | **Feste Plätze.** Zurück, Hilfe, Vorlesen, Ton haben in jedem Spiel denselben Platz. | [P] NN/g |
| K3 | **Jedes Zeichen hat einen Namen,** gesprochen beim Antippen oder geschrieben daneben. Kinder lesen Zeichen wörtlich (das Haus heißt nicht von selbst „Startseite“). | [P] NN/g |
| K4 | **Groß:** Tippfläche mindestens 2 × 2 cm; zu jedem Ziehen eine sichtbare Tipp-Alternative. | [P] NN/g |
| K5 | **Fachsymbole** (Mathe, Lesen, Schreiben, Grammatik, Sachthemen) sind die Orientierung, welches Fach gerade dran ist (F2): auf der Startseite und in jedem Spiel an derselben Stelle. | [E] |

---------------------------------------------------------------------------------------------------
## 10. Einheitlich ohne Monotonie

1. **Erst stabil, dann variiert.** Ein neues Konzept erscheint zuerst in einer festen Darstellung,
   danach in wechselnden Welten und Beispielen. [b] Braithwaite & Goldstone (an Studierenden); für Kl. 1–2
   *Annahme*.
2. **Variation im Lernkern, wo sie das Verstehen erweitert:** Dreiecke in verschiedenen Lagen, Nomen mit
   wechselnden Beispielen, Gleichungen auch als 7 = □ + 3. Nicht variiert werden die Zeichen selbst
   (die Perle bleibt die Perle). [b]
3. **Variation auf der Stimmungsebene ist frei:** Welt, Palette, Wetter, Tageszeit, Gäste, Musik.
4. **Wiedererkennen über die Runde:** Die Kinder der Runde verbinden die Spiele; die Welten machen sie
   unterscheidbar.

---------------------------------------------------------------------------------------------------
## 11. KI-generierte Bilder

| Nr. | Regel | Stand |
|---|---|---|
| A1 | **Nur für die Stimmungsebene.** Szenen-, Wimmel- und Pausenbilder dürfen generiert werden. Figuren, Wortbilder, Lernzeichen und Bedienzeichen entstehen von Hand als SVG. Sachbilder sind lizenzierte Fotos oder geprüfte naturgetreue Zeichnungen, nie fotorealistische KI-Bilder. | [E]; [b] erfundene Anatomie häufig |
| A2 | **Fester Basis-Prompt und Stilreferenz** je Bildart, im Repo abgelegt, damit die Welten zusammenpassen. | [P] |
| A3 | **Prüfen vor Verwendung:** Anatomie und Art der Tiere gegen ein Referenzfoto, Menschen nach 6.3, Bestand nach 6.2 auszählen. Generatoren verstärken Stereotype auch ohne Personenangabe im Prompt und trotz Gegenanweisung. | [B] Bianchi 2023 |
| A4 | **Herkunftseintrag je Bild:** Quelle, KI ja/nein, Modell, Prompt, geprüft gegen, von wem, Datum. | [E] |
| A5 | **Kennzeichnung** generierter Bilder in Elternansicht und Impressum. Vor einer Veröffentlichung Art. 50 KI-Verordnung (seit 2. 8. 2026) rechtlich prüfen lassen. | *Annahme:* Rechtslage, keine Rechtsberatung |
| A6 | **Kein Text im generierten Bild.** Wörter, Zahlen und Buchstaben setzt die App selbst darüber. | [P] |

---------------------------------------------------------------------------------------------------
## 12. Montessori-Material: was übernommen wird

| Material / Konvention | Urteil | Was genau | Stand |
|---|---|---|---|
| Schlichte, nicht realistische Rechenobjekte | übernehmen | M1 | [B] |
| Abfolge konkret → Bild → Zeichen | übernehmen, zügig | M4, M7 | [b] |
| Perlentreppe, Perlenstäbe | übernehmen, ergänzt | Montessori-Farben, Länge, Einzelperlen, dazu Fünfergliederung (M2, M3) | Farben [P]; Struktur [b] |
| Goldenes Perlenmaterial | übernehmen | proportional, Bündeln gezeigt, Fünferbruch ergänzt | [b] |
| Markenspiel | anpassen | nach sicherem Bündeln, Aufdruck trägt | [P] |
| Stellenwertfarben grün/blau/rot | nicht übernehmen | kollidieren mit den Perlenfarben; stattdessen türkis/orange/schiefergrau, nur zusätzlich (M5) | [P] |
| Hunderterkette | anpassen | linear, Zehnergliederung | [B] Linearität |
| Hunderterbrett | anpassen | 10 × 10 mit Fünferbruch | [P] |
| Rot-blaue Stangen | anpassen | Längenproportion; Abschnitte abwechselnd hell und dunkel statt Rot/Blau, weil Rot und Blau in Mathe schon Perlenfarben sind | [P] |
| Spindelkasten | anpassen | Null als leeres Fach, schlichte Stäbchen | [P] |
| Quadrat- und Kubikketten, Bruchkreise | nicht in Kl. 1–2 | nicht im LehrplanPLUS 1/2 | – |
| Wortartensymbole | anpassen | vier Symbole, Form und Größe tragen (D1) | [P] |
| Weitere Grammatik- und Satzsymbole | nicht in Kl. 1–2 | D2 | [P] |
| Satzerweiterung mit Wortstreifen | übernehmen | ohne neue Symbole | [P] |
| Bewegliches Alphabet | anpassen | Vokale dezent, ausblendbar (D3) | [P]/[b] |
| Sandpapierbuchstaben | anpassen | D7, echtes Material als Elternanregung | [b] |
| Bild-Wort-Karten | anpassen | Bild nach dem Erlesen (D5) | [b] |

---------------------------------------------------------------------------------------------------
## 13. Checkliste für jedes neue Bild und Symbol

- [ ] **Ebene:** Bedeutung oder Stimmung? Bedeutungszeichen aus dem Bestand genommen, nicht neu erfunden?
- [ ] **Bildart** nach Abschnitt 1, Stil und Herstellung passend.
- [ ] **Figuren:** ein Kind der Runde, klar stilisiert, mit Aufgabe, Gefühl nach 3.1, kein Fakt als Ich-Erlebnis.
- [ ] **Tiere:** nicht vermenschlicht, sachlich richtig, kein Mythos.
- [ ] **Lernmaterial schlicht,** Struktur sichtbar (Fünfergliederung), Perlen- und Stellenwertfarben aus 6.2.
- [ ] **Farbe nie allein,** eine Bedeutung je Farbe im Spiel, Werte aus der Farbwelt (6.2), Kontrast geprüft, Farbsehschwäche simuliert.
- [ ] **Bewegung** zeigt die Folge einer Kinderhandlung oder die Sache; still während des Denkens; Fehler-Folge nicht reizvoller; Reduced Motion.
- [ ] **Folge mit Freude:** jede richtige Lösung hat eine Folge, die sich aus der Aufgabe erklärt, mit passenden wechselnden Varianten (kein Jackpot), bis etwa 3 s, überspringbar, ohne Punkte und Sterne.
- [ ] **Beim Erlesen** kein Bild vorab.
- [ ] **Buchstaben** ohne Einzelfarben; Tastaturen mit festen Plätzen, unbenutzte Tasten blass.
- [ ] **Bedienzeichen** aus `spiele/symbole/`, fester Platz, Name, 2 × 2 cm.
- [ ] **KI-Bild:** nur Stimmungsebene, Basis-Prompt, geprüft (Anatomie, 6.3), Herkunftseintrag, kein Text im Bild.
- [ ] **Vielfalt** nach `grundsaetze.md` 6 geprüft und im Bestand ausgezählt.
- [ ] **Kartenbild** nach §16: eine Figur im Stil der Runde vor der Welt-Vignette, Silhouettentest im Fach bestanden, kein Text, keine Lernzeichen.

---------------------------------------------------------------------------------------------------
## 14. Ausstehende Anpassungen in `grundsaetze.md`

**Erledigt (2026-11-14).** Ursprünglich vorgemerkt: Abschnitt 4 „Fantasie
und Einhorn“ ohne Einhorn neu fassen; K12 „Einhorn und Tiere begleiten“ → „Die Kinder der Runde
begleiten“; in Abschnitt 5 die *Annahme* zu den Symbolfarben streichen (AMI bestätigt) und „über Symbol
und Farbe“ → „über Symbol (Form und Größe), Farbe zusätzlich“; L8 um „Was sich bewegt, zeigt den Inhalt
oder die Folge einer Kinderhandlung“ ergänzen; in Abschnitt 11 Farbsehschwäche [P] → [B]; einen Verweis
auf dieses Dokument aufnehmen.

---------------------------------------------------------------------------------------------------
## 15. Offen

- ~~Zauber ohne Zauberin~~ entschieden (Christian, 2026-11-14): Die Kinder der Runde zaubern selbst und
  können weitere Dinge, die es in echt nicht gibt (schrumpfen, fliegen, Zeitreise …), mit Zubehör wie beim
  Verkleiden ([`figuren.md`](figuren.md) §5).
- ~~Die Runde~~ festgelegt im Figurenblatt [`figuren.md`](figuren.md) (Christian, 2026-11-14).
- **Echt-Zeichen:** Gestalt und Farbe (6.2).
- **Prüfung in der App:** dieselbe Aufgabe mit und ohne Folge-Animation über einige Tage, gemessen an
  „gekonnt an verschiedenen Tagen“ und freiwillig gewählten Runden (neben dem Drei-Fakten-Test der
  Kosmik-Schicht).

---------------------------------------------------------------------------------------------------
## 16. Kartenbild

Freigegeben (Christian, 2026-11-14). Eine Spielkarte (Startseite, Fach-Seite) muss **ohne Lesen** erkennbar sein.
Die Welt-Vignette allein leistet das nicht (Spiele derselben Welt sehen gleich aus, die Karten „Mit echten Dingen“
zeigen alle dieselbe Hand). Markierung wie in [`figuren.md`](figuren.md): **(Christian)** entschieden ·
**(Annahme)** Vorschlag.

| Nr. | Regel | Stand |
|---|---|---|
| KB1 | **Zwei Schichten.** Hinten die Sachwelt als flache Welt-Vignette (die fünf Töne der Welt-Palette, 6.2, ohne Kontur); vorn die **Figur des Spiels** als sauberes SVG im Stil der Runde (Tinte-Kontur nur um die Silhouette, Licht in Stufen, [`figuren.md`](figuren.md) §4), eingesetzt als `<ls-objekt still>`. | (Christian) |
| KB2 | **Eine Figur, groß:** mindestens 60 % der Bildhöhe, mittig bis Mitte rechts mit normalem Rand. Die Karte zeigt nur das Kartenbild, Titel und Thema; **kein runder Knopf** (Christian, 2026-11-14: „zu viele Infos“). | (Christian) |
| KB3 | **An der Silhouette erkennbar:** klein und in Graustufen unterscheidet sich die Karte von allen anderen Karten ihres Fachs. Probe (Silhouettentest): alle Karten eines Fachs als Raster in 64 px Graustufen nebeneinander. | (Christian) |
| KB4 | **Der typische Moment** des Spiels (kennzeichnender Zustand der Figur), als Standbild (B3). | (Christian) |
| KB5 | **Keine Lernzeichen, kein Text im Bild:** keine Ziffern, Buchstaben, Perlen (C2, M1). Ein Regal-Bild mit `wert` steht auf der Karte ohne Wert. | (Christian) |
| KB6 | **Eindeutig je Fach.** Eine Figur darf mehreren Spielen dienen, aber `(figur, welt, zustand)` kommt je Fach nur einmal vor. Gleiche Figur in gleicher Welt → Unterschied über Zustand oder Zubehör. Ein Test verhindert gleiche Bilder in einem Fach. | (Christian) |
| KB7 | **Kinder der Runde sind keine Kartenfiguren.** Sie verbinden alle Spiele (§10 Nr. 4) und unterscheiden keins. | (Annahme) |
| KB8 | **Spielsymbol = Kopfform der Figur:** Das Spielsymbol ist die Kopf- bzw. Kurzform der Figur und steht in der Kopfleiste und im Regal-Detail, nicht auf der Karte. | (Christian) |
| KB9 | **Karten „Mit echten Dingen“** behalten ihr eigenes Aussehen (Papier mit Naht, keine Welt). Bild: das echte Alltagsding im Stil der Runde (z. B. sieben Nudeln auf zwei Tellern, ein Würfel, eine Treppe), klein in der Ecke des Bildes eine Hand als Zeichen „echt“; kein Knopf. Die Dinge liegen in `spiele/objekte/` und sind wiederverwendbar ([`mit-echten-dingen.md`](mit-echten-dingen.md) „Bild der Karte“). | (Christian) |
| KB10 | **Daten statt Einzelbilder:** `spiele.json` `karte: { figur, zustand, welt }`; Kopf der Anleitung `bild: { figur, zustand }`. Die Kartenfigur ist zugleich das Regal-Bild des Spiels (`regal.objekt`); das Spielsymbol ist die Kopfform dieser Figur, von Hand als eigene Datei `symbol.svg` im Spielordner gezeichnet (KB8). | (Annahme) |

Herkunft der Figuren und Prüfung: [`spielentwicklung.md`](spielentwicklung.md) „Spielobjekte“ und B-Welt (W-Karte).
Die Umsetzung auf der Startseite steht noch aus (Christian).
