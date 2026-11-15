# Spielkatalog

Stand: 2026-11-14 · Entwurf von Claude, Entscheidungen von Christian · geprüft und überarbeitet am 2026-11-14
· **zur Freigabe**

Markierung: **(Christian)** entschieden · **(Annahme)** Vorschlag von Claude, beim Lesen korrigierbar.

Die Spiele im Einzelnen stehen in vier Teilen:
[`mathe.md`](spielkatalog/mathe.md) (M01–M56) ·
[`schreiben-grammatik.md`](spielkatalog/schreiben-grammatik.md) (S01–S20, G01–G13) ·
[`lesen-sprechen.md`](spielkatalog/lesen-sprechen.md) (L01–L18, Z01–Z11) ·
[`geometrie.md`](spielkatalog/geometrie.md) (R01–R20).
Dort hat jedes Spiel: Handlung und Wirkung, Material und Stufen, Fehlerkontrolle, Haupt- und weitere Themen,
Warum es passt, was bewusst nicht drin ist, Gesten, Lernzeichen, Stimme, Fehlerbilder,
Figuren, Name fürs Kind, Symbol, Regal-Material, Mach mit. Die Entscheidungen hier gehen vor; sie beantworten
die offenen Fragen am Ende der vier Teile.

---------------------------------------------------------------------------------------------------
## 1. Absicht

Die ersten sechs Spiele sind entfernt (Commit `dab0ffe`). An ihre Stelle tritt ein Katalog, der vom Lernplan
ausgeht: **Jedes der 956 Themen (Kl. 1–4) bekommt ein Spiel, das perfekt dazu passt (Christian).** Ein Spiel soll
nicht möglichst viele Themen abdecken.

Der Katalog ist die Vorlage, aus der einzelne Spiele geplant und gebaut werden. Er legt fest, welche Spiele es
gibt und welche Themen sie tragen. Wie ein Spiel im Einzelnen aussieht, entscheidet
die Planung des Spiels, im Rahmen der Einträge hier.

---------------------------------------------------------------------------------------------------
## 2. Zahlen

| Fach | Spiele | Hauptthemen |
|---|---:|---:|
| Mathe | 56 | 388 |
| Schreiben | 20 | 242 |
| Grammatik | 13 | 69 |
| Lesen | 18 | 121 |
| Sprechen und Zuhören | 11 | 72 |
| Geometrie | 20 | 64 |
| **Zusammen** | **138** | **956** |

Geprüft per Skript: Jedes Thema des Lernplans steht genau einmal als Hauptthema eines Spiels, keine fremde ID.

---------------------------------------------------------------------------------------------------
## 3. Wie geschnitten wurde

- **Ein Spiel ist eine Spielhandlung mit einem Material (Christian, Annahme zum Wortlaut).** Ein Spiel enthält alle
  Themen, für die genau diese Handlung die beste ist, auch über Klassen hinweg (Stellentafel bis zur Million,
  Zerlegen 2 bis 10, dieselbe Handschrift-Handlung für alle Buchstaben). Passt eine Handlung zu einem Thema nur
  halb, hat das Thema ein anderes Spiel. Lernplan-Bereiche sind keine Einheit.
- **Alle 138 Spiele bleiben (Christian).** Auch wo zwei Fächer dieselbe Handlung haben, gibt es je Fach ein Spiel.
  Sie teilen sich dann Bausteine (Abschnitt 6), nicht das Spiel.
- **Mehrere Zugänge sind erwünscht (Christian).** Jedes Thema hat genau ein Hauptspiel und darf in weiteren
  Spielen als anderer Zugang vorkommen (z. B. Einmaleins abrufen im Kettenhüpfer M37, ableiten im Punktefeld M36).
  Die Fach-Seite zeigt zu einem Thema alle Spiele, die es bedienen (Ansichten-Design).
- **Rechtschreibung und Grammatik: Die Probe ist die Handlung** (Silben schwingen, Verlängern, Ableiten,
  Artikelprobe, Umstellprobe). **Mathe: Montessori-nahes Material** (Perlen, Markenspiel, Stellentafel,
  Streifenbrett), Abrufen und Ableiten als getrennte Zugänge.

---------------------------------------------------------------------------------------------------
## 4. Regeln für alle Spiele

### 4.1 Keine Sachwelt im Spiel (Christian, 2026-11-15)

Sachthemen und ihre Fakten leben in Geschichten und Sachspielen (`docs/spielbau.md` §6, `docs/geschichten.md`).
Heimatwelt, Sachgrund und Geschichte in den Einträgen gelten nicht.

### 4.2 Stimmung: eine Fassung für alle (Christian, 2026-11-15)

Die drei Stufen ruhig, sanft und abenteuer **entfallen** (`grundsaetze.md` §9.3: keine Stufen, keine Einstellung
`geschichten`). Jedes Spiel hat genau eine Fassung: Anlass und Ziel mit höchstens einer kleinen Komplikation, die in
derselben Szene gelöst wird; die Lernhandlung bleibt still (9.2 Nr. 4). Schutz-Welten und Gefühlsfragen: der
Rahmen nie in Richtung Bedrängnis; in R01 geht kein Kind verloren (9.2 Nr. 8). Stufen-Angaben in älteren
Einträgen sind überholt.

### 4.3 Mach mit statt Elternansicht (Christian)

Echtes Tun (falten, messen, mit dem Stift schreiben, erzählen) gehört zum Kind, nicht in die Elternansicht. Jedes
Spiel hat einen **Mach-mit-Moment**: Ein Kind der Runde tut es mit echtem Material vor, der Erzähler lädt ein („Das
kannst du auch mit Papier probieren.“, wo Erwachsene nötig sind: „Frag jemanden, ob ihr zusammen …“).
- Am Rundenende oder in der Pause, nie Bedingung, kein Nachfragen, kein Haken, kein Beleg (N1, N6).
- **„Gekonnt“ entsteht nur aus dem, was die App selbst sieht.** Bei Handwerks-Themen ist das der prüfbare Teil
  (Lineal durch zwei Punkte legen, Startpunkt und Richtung eines Buchstabens), der Name im Regal bleibt ehrlich
  („Lineal anlegen“) **(Annahme)**. Die Stifthaltung hat keinen prüfbaren Teil (keine Kamera): Sie bleibt im
  Lernplan, wird aber nie „gekonnt“; sie kommt nur als Vorzeigen und Mach-mit vor (S18) **(Annahme)**.
- Je Spiel ist der Mach-mit-Satz eine feste Aufnahme.

### 4.4 Kontrollkarte bei Formen, die man nicht herleiten kann (Christian)

Bei Artikeln (G09), Mehrzahlformen (G08) und starken Verben (G02, G03) kann die Sache nicht urteilen. Dort zeigt
eine **Montessori-Kontrollkarte**, ob es stimmt: Das Kind dreht sie selbst um und vergleicht (Fehlerkontrolle im
Material, §4). Die App urteilt nicht. Die Kontrollkarte ist ein neues Lernzeichen (Abschnitt 8).

### 4.5 Stimmen (Christian)

- Es spricht der Erzähler (Florian, `docs/stimme.md`); Figuren und Gäste sprechen nicht.
- **Ausnahme Hörthemen:** Für Themen, die mehrere Stimmen zum Inhalt haben (sprecher-unterscheiden,
  viele-stimmen-verstehen, gefuehl-in-der-stimme), gibt es **kurze Aufnahmen weiterer Stimmen**. Sie gehören zu
  Gästen in einer Hörszene; sonst bleibt es beim Erzähler.
- **Kinderstimme aufnehmen:** In Z09, Z10 und L18 darf das Kind sich selbst aufnehmen und anhören. Die Aufnahme
  bleibt auf dem Gerät, es gibt keine Erkennung, sie ist nie Bedingung. Braucht einen Aufnahme-Baustein und
  Mikrofonzugriff über `spiele/kern/`.
- Sätze werden nicht frei zusammengesetzt, sondern vorab aufgenommen. Spiele mit vielen Satzfassungen halten ihre
  Übungstexte klein; ungültige Fassungen spricht die Stimme nicht, die Sache zeigt sie **(Annahme)**. Viele
  Aufnahmen brauchen: M06, M17, M33, M34, M40, S11, S16, G03, G05, G06, R01, R02, L18.

### 4.6 Was weiter gilt

Alle Spiele folgen `docs/grundsaetze.md` (Checkliste §12), `docs/bedienung.md` (Checkliste §10),
`docs/grundsaetze-bilder.md` (Checkliste §13), `docs/stimme.md` und `docs/figuren.md`: Lernhandlung = Spielhandlung,
Nichts ist Selbstzweck, die Sache urteilt, Hilfe-Leiter, Wiedervorlage über Tage, keine Punkte, Sterne, Timer, Fehler
setzen nichts zurück, die Runde der vier Kinder begleitet und jedes Kind zeigt gleich oft vor, kein Einhorn.

### 4.7 Spannung und Abwechslung (Annahme)

- **Spannung kommt aus Neugier** (`grundsaetze.md` 9.2 Nr. 1, N4, L2). Jedes Spiel hat eine Spannungsquelle aus
  dieser Liste, gezählt über alle Spiele:
  Rätsel (40) · Vorhersage (27) · Lücke (24) · Durcheinander (18) · Verwandlung (14) · Hilfe (8) · Wissensvorsprung (7).
  - *Rätsel:* wer, wo oder was war das? · *Vorhersage:* erst festlegen, dann sehen (hält es, reicht es, rollt es) ·
    *Lücke:* etwas fehlt · *Durcheinander:* etwas ist vertauscht oder verrutscht · *Verwandlung:* etwas wird sichtbar
    anders · *Hilfe:* jemand braucht etwas · *Wissensvorsprung:* das Kind weiß schon, was eine Figur noch nicht weiß.
- **Zehn Rahmen**, der häufigste trägt 23 von 138 Spielen:
  Forschen (23) · Versorgen (18) · Fest (17) · Reise (15) · Bauen (14) · Werkstatt (13) · Miteinander (11) · Spur (11) · Entdecken (9) · Zeitreise (7).
- **Fähigkeiten** (`figuren.md` §5: schrumpfen, schweben, in die Zeit reisen, riesig werden, unter Wasser atmen,
  verzaubern, ins Bild steigen) bringen die Runde zur Sache. 31 Spiele nutzen eine.
- **Eine Runde endet mit etwas, das in der Welt jetzt da ist** (die Brücke trägt, das Lied wird gesungen), nicht mit
  „fertig“.
- Wer ein Spiel plant und Rahmen oder Spannungsquelle ändert, zählt nach.

---------------------------------------------------------------------------------------------------
## 5. Übersicht der Spiele

Name fürs Kind, Klassen (aus den Hauptthemen), Zahl der Hauptthemen, Rahmen und Spannungsquelle (4.7).
Alles Weitere im jeweiligen Teil.

| Spiel | Name fürs Kind | Fach | Kl. | Themen | Rahmen | Spannung aus |
|---|---|---|---|---:|---|---|
| [M01](spielkatalog/mathe.md) Paare bilden | Zu zweit | Mathe | 1–2 | 4 | Forschen | Rätsel |
| [M02](spielkatalog/mathe.md) Zählweg | Zählweg | Mathe | 1 | 4 | Bauen | Lücke |
| [M03](spielkatalog/mathe.md) Alle da? | Alle da? | Mathe | 1 | 2 | Zeitreise | Rätsel |
| [M04](spielkatalog/mathe.md) Blitzblick | Blitzblick | Mathe | 1 | 5 | Miteinander | Wissensvorsprung |
| [M05](spielkatalog/mathe.md) Was sagt die Zahl? | Was sagt die Zahl? | Mathe | 1 | 2 | Entdecken | Lücke |
| [M06](spielkatalog/mathe.md) Zahlenpost | Zahlenpost | Mathe | 1–4 | 5 | Werkstatt | Durcheinander |
| [M07](spielkatalog/mathe.md) Bündeln | Bündeln | Mathe | 2–4 | 3 | Zeitreise | Durcheinander |
| [M08](spielkatalog/mathe.md) Stellentafel | Zahlen legen | Mathe | 1–4 | 15 | Werkstatt | Vorhersage |
| [M09](spielkatalog/mathe.md) Aufdecken | Aufdecken | Mathe | 2–4 | 3 | Reise | Vorhersage |
| [M10](spielkatalog/mathe.md) Waage | Die Waage | Mathe | 1–4 | 7 | Werkstatt | Vorhersage |
| [M11](spielkatalog/mathe.md) Flug zur Zahl | Flug zur Zahl | Mathe | 1–4 | 9 | Entdecken | Lücke |
| [M12](spielkatalog/mathe.md) Hundertertafel | Hundertertafel | Mathe | 2 | 3 | Versorgen | Lücke |
| [M13](spielkatalog/mathe.md) Schätzen | Schätzen | Mathe | 2–4 | 8 | Forschen | Vorhersage |
| [M14](spielkatalog/mathe.md) Zwei Tonnen | Zwei Tonnen | Mathe | 1 | 13 | Versorgen | Lücke |
| [M15](spielkatalog/mathe.md) Mach voll | Mach voll | Mathe | 1–4 | 10 | Versorgen | Lücke |
| [M16](spielkatalog/mathe.md) Aufgabenfamilie | Aufgabenfamilie | Mathe | 1–2 | 12 | Versorgen | Wissensvorsprung |
| [M17](spielkatalog/mathe.md) Was passiert? | Was passiert? | Mathe | 1–3 | 9 | Forschen | Verwandlung |
| [M18](spielkatalog/mathe.md) Wie viel mehr? | Wie viel mehr? | Mathe | 1–2 | 5 | Zeitreise | Rätsel |
| [M19](spielkatalog/mathe.md) Spiegel | Der Spiegel | Mathe | 1–3 | 7 | Entdecken | Verwandlung |
| [M20](spielkatalog/mathe.md) Streifenbrett | Streifenbrett | Mathe | 1 | 8 | Reise | Durcheinander |
| [M21](spielkatalog/mathe.md) Über die Zehn | Über die Zehn | Mathe | 1 | 11 | Entdecken | Verwandlung |
| [M22](spielkatalog/mathe.md) Eine Perle leihen | Eine Perle leihen | Mathe | 1–2 | 5 | Miteinander | Hilfe |
| [M23](spielkatalog/mathe.md) Klein und groß | Klein und groß | Mathe | 1–4 | 12 | Bauen | Verwandlung |
| [M24](spielkatalog/mathe.md) Rechenstrich | Rechenstrich | Mathe | 2–3 | 14 | Reise | Hilfe |
| [M25](spielkatalog/mathe.md) Welcher Weg? | Welcher Weg? | Mathe | 2–3 | 4 | Reise | Durcheinander |
| [M26](spielkatalog/mathe.md) Markenspiel | Markenspiel | Mathe | 2–4 | 13 | Werkstatt | Lücke |
| [M27](spielkatalog/mathe.md) Gleiche Sprünge | Gleiche Sprünge | Mathe | 1–3 | 5 | Versorgen | Lücke |
| [M28](spielkatalog/mathe.md) Muster-Päckchen | Muster-Päckchen | Mathe | 1–4 | 6 | Bauen | Durcheinander |
| [M29](spielkatalog/mathe.md) Zahlenmaschine | Zahlenmaschine | Mathe | 1–4 | 6 | Forschen | Rätsel |
| [M30](spielkatalog/mathe.md) Zahlenmauer | Zahlenmauer | Mathe | 1–4 | 13 | Bauen | Rätsel |
| [M31](spielkatalog/mathe.md) Rechendreieck | Rechendreieck | Mathe | 1–3 | 4 | Bauen | Vorhersage |
| [M32](spielkatalog/mathe.md) Zauberquadrat | Zauberquadrat | Mathe | 3 | 2 | Zeitreise | Rätsel |
| [M33](spielkatalog/mathe.md) Stimmt das? | Stimmt das? | Mathe | 1–4 | 13 | Forschen | Rätsel |
| [M34](spielkatalog/mathe.md) So geht es | So geht es | Mathe | 1–4 | 10 | Werkstatt | Durcheinander |
| [M35](spielkatalog/mathe.md) Tüten packen | Tüten packen | Mathe | 2–3 | 7 | Forschen | Lücke |
| [M36](spielkatalog/mathe.md) Punktefeld | Punktefeld | Mathe | 2–4 | 12 | Entdecken | Verwandlung |
| [M37](spielkatalog/mathe.md) Kettenhüpfer | Kettenhüpfer | Mathe | 2–4 | 17 | Versorgen | Rätsel |
| [M38](spielkatalog/mathe.md) Gerecht verteilen | Gerecht verteilen | Mathe | 2–4 | 10 | Miteinander | Hilfe |
| [M39](spielkatalog/mathe.md) Mal-Marken | Mal-Marken | Mathe | 4 | 5 | Werkstatt | Hilfe |
| [M40](spielkatalog/mathe.md) Die Rechenfrage | Die Rechenfrage | Mathe | 1–3 | 8 | Werkstatt | Lücke |
| [M41](spielkatalog/mathe.md) Skizze | Skizze | Mathe | 2–3 | 9 | Bauen | Vorhersage |
| [M42](spielkatalog/mathe.md) Ungefähr | Ungefähr | Mathe | 3–4 | 4 | Werkstatt | Vorhersage |
| [M43](spielkatalog/mathe.md) Der Laden | Der Laden | Mathe | 1–3 | 8 | Werkstatt | Hilfe |
| [M44](spielkatalog/mathe.md) Messen | Messen | Mathe | 1–3 | 5 | Forschen | Vorhersage |
| [M45](spielkatalog/mathe.md) Wiegen | Wiegen | Mathe | 3 | 3 | Forschen | Vorhersage |
| [M46](spielkatalog/mathe.md) Umfüllen | Umfüllen | Mathe | 3 | 2 | Versorgen | Vorhersage |
| [M47](spielkatalog/mathe.md) Die Uhr | Die Uhr | Mathe | 1–2 | 6 | Forschen | Rätsel |
| [M48](spielkatalog/mathe.md) Wie lange? | Wie lange? | Mathe | 2–3 | 5 | Forschen | Vorhersage |
| [M49](spielkatalog/mathe.md) Kalender | Kalender | Mathe | 1–4 | 3 | Fest | Rätsel |
| [M50](spielkatalog/mathe.md) Säulen bauen | Säulen bauen | Mathe | 1–3 | 6 | Miteinander | Vorhersage |
| [M51](spielkatalog/mathe.md) Ablesen | Ablesen | Mathe | 2–4 | 5 | Forschen | Vorhersage |
| [M52](spielkatalog/mathe.md) Je mehr … | Je mehr … | Mathe | 3–4 | 4 | Versorgen | Vorhersage |
| [M53](spielkatalog/mathe.md) Wie viele Arten? | Wie viele Arten? | Mathe | 1–4 | 7 | Versorgen | Rätsel |
| [M54](spielkatalog/mathe.md) Säckchen | Säckchen | Mathe | 2–4 | 5 | Forschen | Vorhersage |
| [M55](spielkatalog/mathe.md) Zahlenrätsel | Zahlenrätsel | Mathe | 2–4 | 4 | Spur | Rätsel |
| [M56](spielkatalog/mathe.md) Wer sagt 20? | Wer sagt 20? | Mathe | 3 | 1 | Miteinander | Rätsel |
| [S01](spielkatalog/schreiben-grammatik.md) Wörter legen (bewegliches Alphabet, Laut für Laut) | Wörter legen | Schreiben | 1 | 13 | Versorgen | Lücke |
| [S02](spielkatalog/schreiben-grammatik.md) Silbenbogen (jede Silbe vollständig) | Silbenbogen | Schreiben | 1 | 7 | Versorgen | Verwandlung |
| [S03](spielkatalog/schreiben-grammatik.md) Das Silbenhaus (offene und geschlossene Silbe) | Silbenhaus | Schreiben | 2–3 | 18 | Bauen | Durcheinander |
| [S04](spielkatalog/schreiben-grammatik.md) Das lange Wort (Verlängern) | Das lange Wort | Schreiben | 2–3 | 12 | Spur | Rätsel |
| [S05](spielkatalog/schreiben-grammatik.md) Der Wortbaum (Ableiten und Wortfamilie) | Wortbaum | Schreiben | 2–4 | 14 | Forschen | Rätsel |
| [S06](spielkatalog/schreiben-grammatik.md) Groß oder klein (Artikelprobe) | Groß oder klein | Schreiben | 1–4 | 6 | Entdecken | Lücke |
| [S07](spielkatalog/schreiben-grammatik.md) Merken (ansehen, abdecken, schreiben, vergleichen) | Merken | Schreiben | 1–4 | 13 | Spur | Rätsel |
| [S08](spielkatalog/schreiben-grammatik.md) Proben-Kiste (Fehler finden, Probe wählen) | Proben-Kiste | Schreiben | 2–4 | 3 | Werkstatt | Rätsel |
| [S09](spielkatalog/schreiben-grammatik.md) Schere (Satz, Wort, Silbe; Trennen am Rand) | Schere | Schreiben | 1–3 | 4 | Zeitreise | Rätsel |
| [S10](spielkatalog/schreiben-grammatik.md) Bücherei (ABC und Nachschlagen) | Bücherei | Schreiben | 1–4 | 5 | Spur | Rätsel |
| [S11](spielkatalog/schreiben-grammatik.md) Zeichen setzen (Punkt, Fragezeichen, Komma, wörtliche Rede) | Zeichen setzen | Schreiben | 1–4 | 10 | Fest | Verwandlung |
| [S12](spielkatalog/schreiben-grammatik.md) Post (wozu und für wen ist der Text?) | Post | Schreiben | 1–4 | 6 | Reise | Durcheinander |
| [S13](spielkatalog/schreiben-grammatik.md) Was fehlt? (die Fragen des Lesers) | Was fehlt? | Schreiben | 2–4 | 6 | Miteinander | Lücke |
| [S14](spielkatalog/schreiben-grammatik.md) Die Karte (Seite einrichten) | Die Karte | Schreiben | 1–4 | 4 | Fest | Wissensvorsprung |
| [S15](spielkatalog/schreiben-grammatik.md) Der Film (Reihenfolge, die etwas bewirkt) | Der Film | Schreiben | 1–4 | 19 | Fest | Durcheinander |
| [S16](spielkatalog/schreiben-grammatik.md) Die Lupe (vorlesen, ändern, wieder vorlesen) | Die Lupe | Schreiben | 1–4 | 12 | Forschen | Vorhersage |
| [S17](spielkatalog/schreiben-grammatik.md) Gedichte (Muster füllen) | Gedichte | Schreiben | 1–3 | 4 | Fest | Lücke |
| [S18](spielkatalog/schreiben-grammatik.md) Selbst schreiben (Strichfolge sehen, frei schreiben) | Selbst schreiben | Schreiben | 1 | 41 | Bauen | Lücke |
| [S19](spielkatalog/schreiben-grammatik.md) Zwei Schriften (Druckschrift und Schreibschrift lesen) | Zwei Schriften | Schreiben | 2 | 1 | Zeitreise | Rätsel |
| [S20](spielkatalog/schreiben-grammatik.md) Schreibschrift (verbunden schreiben) | Schreibschrift | Schreiben | 2–3 | 37 | Miteinander | Wissensvorsprung |
| [G01](spielkatalog/schreiben-grammatik.md) Dreieck und Kreis (Wortarten mit Symbolen) | Dreieck und Kreis | Grammatik | 1–2 | 4 | Fest | Rätsel |
| [G02](spielkatalog/schreiben-grammatik.md) Ich, du, wir (Person und Verb) | Ich, du, wir | Grammatik | 2–3 | 6 | Miteinander | Hilfe |
| [G03](spielkatalog/schreiben-grammatik.md) Zeit-Uhr (gestern, heute, morgen) | Zeit-Uhr | Grammatik | 2–4 | 10 | Zeitreise | Durcheinander |
| [G04](spielkatalog/schreiben-grammatik.md) Satz-Bilder (Satz legen zum Bild) | Satz-Bilder | Grammatik | 1 | 2 | Versorgen | Durcheinander |
| [G05](spielkatalog/schreiben-grammatik.md) Satz-Zug (Umstellprobe und Satzglieder) | Satz-Zug | Grammatik | 3–4 | 8 | Reise | Durcheinander |
| [G06](spielkatalog/schreiben-grammatik.md) Wer, wem, was? (Rollen des Verbs und Fälle) | Wer, wem, was? | Grammatik | 4 | 6 | Forschen | Lücke |
| [G07](spielkatalog/schreiben-grammatik.md) Satz-Brücke (Sätze verbinden, Komma, das/dass) | Satz-Brücke | Grammatik | 3–4 | 4 | Bauen | Rätsel |
| [G08](spielkatalog/schreiben-grammatik.md) Eins und viele (Mehrzahl) | Eins und viele | Grammatik | 1–2 | 6 | Versorgen | Verwandlung |
| [G09](spielkatalog/schreiben-grammatik.md) der, die, das (Artikel) | der, die, das | Grammatik | 1–3 | 2 | Fest | Lücke |
| [G10](spielkatalog/schreiben-grammatik.md) Fundbüro (genau beschreiben) | Fundbüro | Grammatik | 2–4 | 6 | Spur | Rätsel |
| [G11](spielkatalog/schreiben-grammatik.md) Bühne (Wortfelder, Gegenteile, Lage) | Bühne | Grammatik | 2–4 | 7 | Fest | Verwandlung |
| [G12](spielkatalog/schreiben-grammatik.md) Wort-Werkstatt (Bausteine stecken) | Wort-Werkstatt | Grammatik | 2–4 | 11 | Werkstatt | Verwandlung |
| [G13](spielkatalog/schreiben-grammatik.md) Kisten packen (Oberbegriffe und Ideen ordnen) | Kisten packen | Grammatik | 2–3 | 4 | Spur | Rätsel |
| [L01](spielkatalog/lesen-sprechen.md) Verse-Werkstatt | Reime | Lesen | 1–4 | 4 | Fest | Lücke |
| [L02](spielkatalog/lesen-sprechen.md) Abzählen | Abzählen | Lesen | 1 | 1 | Reise | Lücke |
| [L03](spielkatalog/lesen-sprechen.md) Geheimsprache | Geheimsprache | Lesen | 1 | 3 | Spur | Rätsel |
| [L04](spielkatalog/lesen-sprechen.md) Laut-Körbe | Einpacken | Lesen | 1 | 3 | Versorgen | Durcheinander |
| [L05](spielkatalog/lesen-sprechen.md) Wortzug | Wortzug | Lesen | 1 | 5 | Reise | Verwandlung |
| [L06](spielkatalog/lesen-sprechen.md) Buchstabenhaus | Buchstabenhaus | Lesen | 1 | 48 | Entdecken | Lücke |
| [L07](spielkatalog/lesen-sprechen.md) Lesefenster | Päckchen | Lesen | 1 | 8 | Fest | Rätsel |
| [L08](spielkatalog/lesen-sprechen.md) Kaufladen | Fast gleich | Lesen | 1–2 | 4 | Versorgen | Rätsel |
| [L09](spielkatalog/lesen-sprechen.md) Blitzwörter | Blitzwörter | Lesen | 1–2 | 2 | Miteinander | Wissensvorsprung |
| [L10](spielkatalog/lesen-sprechen.md) Wortbausteine | Bausteine | Lesen | 2–3 | 3 | Reise | Rätsel |
| [L11](spielkatalog/lesen-sprechen.md) Quatsch finden | Quatsch? | Lesen | 1–4 | 3 | Forschen | Rätsel |
| [L12](spielkatalog/lesen-sprechen.md) Nachlesen | Nachlesen | Lesen | 1–4 | 8 | Fest | Lücke |
| [L13](spielkatalog/lesen-sprechen.md) Nachschlagen | Nachschlagen | Lesen | 2–4 | 3 | Spur | Rätsel |
| [L14](spielkatalog/lesen-sprechen.md) Titel finden | Titel | Lesen | 2–4 | 4 | Fest | Wissensvorsprung |
| [L15](spielkatalog/lesen-sprechen.md) Spurenleser | Spuren | Lesen | 2–4 | 8 | Spur | Rätsel |
| [L16](spielkatalog/lesen-sprechen.md) Wörterlupe | Lupe | Lesen | 2–4 | 4 | Entdecken | Rätsel |
| [L17](spielkatalog/lesen-sprechen.md) Bücherei | Welche Sorte? | Lesen | 2–4 | 4 | Spur | Rätsel |
| [L18](spielkatalog/lesen-sprechen.md) Vorlese-Partitur | Vorlesen | Lesen | 1–4 | 8 | Fest | Verwandlung |
| [Z01](spielkatalog/lesen-sprechen.md) Lauschposten | Lauschen | Sprechen und Zuhören | 1 | 4 | Forschen | Rätsel |
| [Z02](spielkatalog/lesen-sprechen.md) Wäscheleine | Wäscheleine | Sprechen und Zuhören | 1–2 | 4 | Versorgen | Durcheinander |
| [Z03](spielkatalog/lesen-sprechen.md) Auftrag | Auftrag | Sprechen und Zuhören | 1–2 | 7 | Reise | Hilfe |
| [Z04](spielkatalog/lesen-sprechen.md) Hörbühne | Theater | Sprechen und Zuhören | 1–4 | 12 | Fest | Rätsel |
| [Z05](spielkatalog/lesen-sprechen.md) Noch mal, bitte | Noch mal, bitte | Sprechen und Zuhören | 1–3 | 3 | Reise | Lücke |
| [Z06](spielkatalog/lesen-sprechen.md) Gesprächszug | Was sagst du? | Sprechen und Zuhören | 1–4 | 10 | Miteinander | Hilfe |
| [Z07](spielkatalog/lesen-sprechen.md) Stuhlkreis | Stuhlkreis | Sprechen und Zuhören | 1–4 | 5 | Miteinander | Durcheinander |
| [Z08](spielkatalog/lesen-sprechen.md) Weil-Brücke | Ich glaube | Sprechen und Zuhören | 2–4 | 4 | Forschen | Vorhersage |
| [Z09](spielkatalog/lesen-sprechen.md) Tonstudio | Tonstudio | Sprechen und Zuhören | 1–4 | 8 | Fest | Verwandlung |
| [Z10](spielkatalog/lesen-sprechen.md) Erzählkino | Kino | Sprechen und Zuhören | 1–4 | 7 | Fest | Lücke |
| [Z11](spielkatalog/lesen-sprechen.md) Reporterheft | Reporter | Sprechen und Zuhören | 1–4 | 6 | Forschen | Wissensvorsprung |
| [R01](spielkatalog/geometrie.md) Hinlegen, wo es hingehört (Lagewörter) | Oben und unten | Geometrie | 1 | 3 | Reise | Rätsel |
| [R02](spielkatalog/geometrie.md) Dem Weg folgen | Pfeilweg | Geometrie | 1–3 | 2 | Reise | Durcheinander |
| [R03](spielkatalog/geometrie.md) Den Weg legen | Weg legen | Geometrie | 1–3 | 2 | Bauen | Vorhersage |
| [R04](spielkatalog/geometrie.md) Formen nach einem Merkmal einsortieren | Formenkiste | Geometrie | 1–2 | 3 | Spur | Rätsel |
| [R05](spielkatalog/geometrie.md) Den Körper geben, der bestellt ist | Baukiste | Geometrie | 2–3 | 3 | Werkstatt | Rätsel |
| [R06](spielkatalog/geometrie.md) Lückenlos belegen und zählen | Stab und Kugel | Geometrie | 1–4 | 4 | Bauen | Vorhersage |
| [R07](spielkatalog/geometrie.md) Den Umriss füllen | Legebild | Geometrie | 1–4 | 4 | Bauen | Lücke |
| [R08](spielkatalog/geometrie.md) Mit gleichen Plättchen auslegen (Fläche) | Beet auslegen | Geometrie | 2–4 | 4 | Versorgen | Vorhersage |
| [R09](spielkatalog/geometrie.md) Den Rand abzäunen (Umfang) | Zaunbau | Geometrie | 2–4 | 3 | Forschen | Vorhersage |
| [R10](spielkatalog/geometrie.md) Formen spannen (Nagelbrett) | Nagelbrett | Geometrie | 1–2 | 2 | Versorgen | Durcheinander |
| [R11](spielkatalog/geometrie.md) Das Werkzeug richtig anlegen | Werkbank | Geometrie | 2–4 | 6 | Reise | Vorhersage |
| [R12](spielkatalog/geometrie.md) Würfelbau nachbauen | Würfelbau | Geometrie | 2–4 | 3 | Bauen | Rätsel |
| [R13](spielkatalog/geometrie.md) Von oben eintragen (Bauplan, Lageplan) | Bauplan | Geometrie | 3–4 | 3 | Entdecken | Vorhersage |
| [R14](spielkatalog/geometrie.md) Wer sieht was? (Ansichten) | Von wo? | Geometrie | 2–3 | 3 | Forschen | Vorhersage |
| [R15](spielkatalog/geometrie.md) Falten und vorhersagen | Falten | Geometrie | 2–3 | 4 | Forschen | Vorhersage |
| [R16](spielkatalog/geometrie.md) Ins Gitter übertragen (abzeichnen, spiegeln, vergrößern) | Kästchenbild | Geometrie | 1–4 | 4 | Bauen | Verwandlung |
| [R17](spielkatalog/geometrie.md) Post nach Planquadrat | Post auf dem Plan | Geometrie | 3 | 1 | Reise | Rätsel |
| [R18](spielkatalog/geometrie.md) Muster weiterlegen | Musterband | Geometrie | 1–3 | 3 | Fest | Durcheinander |
| [R19](spielkatalog/geometrie.md) Netz falten | Würfelnetz | Geometrie | 3–4 | 6 | Werkstatt | Vorhersage |
| [R20](spielkatalog/geometrie.md) Rollt es oder kippt es? | Rollt es? | Geometrie | 2 | 1 | Forschen | Vorhersage |

---------------------------------------------------------------------------------------------------
## 6. Gleiche Handlung in zwei Fächern

Getrennte Spiele (Christian), gemeinsame Bausteine **(Annahme)**: Was beide Spiele brauchen, wird einmal gebaut.

| Baustein | Spiele |
|---|---|
| Silbenbogen (Silben schwingen) | L02 Abzählen · S02 Silbenbogen |
| Wortbausteine stecken | L10 Wortbausteine · G12 Wort-Werkstatt · S05 Wortbaum (Stamm) |
| ABC und Nachschlagen | L13 Nachschlagen · S10 Bücherei |
| Lineal anlegen | M44 Messen · R11 Werkzeug |
| Spiegel | M19 Spiegel · R15 Falten · R16 Ins Gitter übertragen |
| Lagewörter, Ding hinlegen | R01 Lagewörter · Z03 Auftrag · G11 Bühne |
| Kurz zeigen, dann weg | M04 Blitzblick · L09 Blitzwörter · S07 Merken |
| Reime und Gedichtmuster | L01 Verse-Werkstatt · S17 Gedichte |
| Punktefeld und Fläche | M36 Punktefeld · R08 Fläche |
| Bildkarten ordnen | Z02 Wäscheleine · S15 Der Film |
| Bewegliches Alphabet, Lautplättchen | S01 Wörter legen · L05 Wortzug · L06 Buchstabenhaus |

Spiele, die Themen aus zwei Fächern tragen (Z02, Z03, L14, L15): Die Kopfleiste zeigt das Fach des Themas der
Runde **(Annahme; Hinweis an die Ansichten-Sitzung)**.

---------------------------------------------------------------------------------------------------
## 7. Vor dem Bau ausprobieren (Annahme)

Kleine Wegwerf-Versuche, bevor die betroffenen Spiele geplant werden:

1. **Freihand-Schreiben mit dem Finger** (S18, S20; 78 Handschrift-Themen): Strich aufzeichnen, Startpunkt,
   Richtung, Reihenfolge und Höhe in der Lineatur offline und tolerant erkennen. Trägt es auf Glas mit dem Finger?
2. **Einzellaute von Azure** („mmm“, „t“, Wörter in Lautstücken) für L03 bis L06. Klingen sie sauber genug, sonst
   von einem Menschen aufnehmen.
3. **Zwei Personen an einem Gerät** (M56, Mathe-Konferenz in M34): abwechselnd am selben Tablet.
4. **Vorlesen nach den Pausen des Kindes** (L18): an drei Sätzen prüfen, wie viele Aufnahmen nötig sind.
5. **Würfelbau in 3D am Tablet** (R12, R14): trägt es in Kl. 2?

---------------------------------------------------------------------------------------------------
## 8. Folgen für andere Dokumente (Aufgaben nach der Freigabe)

**Stand 2026-11-14: umgesetzt** in `grundsaetze.md` (L13, §3.1 Kontrollkarte, §4, Einhorn-Anpassungen), `stimme.md`, `bedienung.md` und `grundsaetze-bilder.md`
(als Vormerkung, Festlegung mit dem Plan des ersten Spiels, 8a), `figuren.md` §8, `lernplan.json` (Merkhilfen in
Tierform entfernt, sprechende Tiere in Beispielen ersetzt).
**Noch offen:** Die 13 Themen ohne Lehrplan-Nummer gehen erst mit den Plänen von M15, M16 und M24 in Pakete auf,
weil Aufgaben-Erzeuger (`aufgabenarten.js`) und Tests an ihnen hängen.

**`docs/grundsaetze.md`**
- §4 „Was vom Tasten lebt … als Anregung für echtes Material in die Elternansicht“ und L13 („Gehört in die
  Elternansicht als Anregung“) → Mach-mit-Moment im Spiel (Abschnitt 4.3).
- §3.1 bzw. §4: Kontrollkarte als Fehlerkontrolle im Material, wo die Sache nicht urteilen kann (4.4).

**`docs/stimme.md`:** Ausnahmen um weitere Stimmen für Hörthemen und die Aufnahme der Kinderstimme ergänzen (4.5).

**`docs/bedienung.md`:** neue Eingaben Freihand-Strich (S18, S20), Drehgriff und Drehpfeile (Geometrie: R04, R06,
R07, R10, R11, R12, R14, R18, R19), Zurück im Lernfeld (R10, R12), Zwei-Personen-Ablauf (M34, M56), Aufnahmeknopf
(Z09, Z10, L18), Kopfhörer für links/rechts (Z01).

**`docs/grundsaetze-bilder.md`:** neue Lernzeichen.
- Geometrie (noch keine): Formplättchen, Kästchen- und Punktgitter, Stäbe und Kugeln, Holzwürfel, Pfeil- und
  Lagewort-Karten, Werkzeuge; Merkmalspalette für „Farbe als Sortiermerkmal“.
- Mathe (rund 20): u. a. Balkenwaage, Zahlenmauer, Rechendreieck, Zeigeruhr, Lineal, Messbecher, Geld (vereinfacht,
  in Größe und Farbe wie echt **(Annahme)**), Strichliste, Baumdiagramm, Tausenderwürfel, Stellenwertfarbe Tausender.
- Deutsch: Silbenbogen, Lautplättchen und Wagen, Pausen- und Stimmmarken, Fuge zwischen Wortbausteinen,
  Kontrollkarte.

**`docs/figuren.md`:** §8 Auszählen um die Fähigkeiten ergänzen (welches Kind nutzt welche wie oft).

**`spiele/lernplan.json`**
- Die 13 Themen ohne Lehrplan-Nummer aus dem entfernten Zahlenzauber (rechnen-3 … rechnen-10, plus-zur-20,
  plus-/minus-bis-30, plus-/minus-bis-100) gehen als Pakete in die Lehrplan-Themen auf (M16, M15, M24, Vorschlag in
  `mathe.md`, Offene Frage 2) **(Annahme)**.
- Merkhilfen mit Buchstaben in Tierform („in der Möwe steckt das M“) entfallen (Bildregel §4, D8).
- Sprechende Tiere und Ich-Sätze von Figuren in Beispielen durch Kinder der Runde und Gäste ersetzen (T1, F1).
- Schulschrift: VA und SAS bleiben über das Feld `schrift` angelegt; welche Schrift ein Kind lernt, ist eine
  Einstellung im Profil **(Annahme; Hinweis an die Ansichten-Sitzung)**.

**Hinweise an die Ansichten-Sitzung** (dort entschieden, nicht hier gebaut): Regal-Material bei Buchstabenthemen
sollte den Buchstaben des Themas zeigen („M m“, „sch“), nicht den ersten Buchstaben des Themennamens; Geometrie
braucht einen Regal-Baustein `form`; Fach in der Kopfleiste nach dem Thema der Runde; Einstellung Schulschrift.

---------------------------------------------------------------------------------------------------
## 8a. Wie aus einem Eintrag ein Spiel wird (Annahme)

- **Seit 2026-11-15 (Christian): Der Eintrag ist Stoff und Idee, kein Bauplan.** Wie das Spiel sich anfühlt,
  entscheidet der Spielkern (`docs/spielbau.md` §1). Gesetzt bleiben Themen, Fehlerkontrolle, Lernzeichen
  und alles, was mit „Christian“ und Datum markiert ist; Geschichten, Packungen, Listen und Zusätze in einem Eintrag
  darf die Idee weglassen (`docs/spielbau.md` §6, §7). Heimatwelt und Sachgrund gelten nicht (4.1).
- **Figuren:** Die Namen unter „Figuren“ sind ein Startvorschlag. Die Planung eines Spiels darf neu verteilen. Über
  alle Spiele soll jedes Kind gleich oft vorzeigen (`figuren.md` §3); wer das ändert, zählt nach.
- **Umfang des ersten Baus eines Spiels:**
  - Die Datenstruktur trägt von Anfang an alle Hauptthemen des Spiels (alle Klassen).
  - Gebaut werden zuerst die Themen der Einstiegsklasse auf allen Lernstufen (material, vorstellung, kopf), soweit
    die Themen sie haben.
  - Die Themen späterer Klassen folgen in eigenen Ausbaustufen.
- **Neue Lernzeichen und Bedienteile:** Sie werden im Plan des ersten Spiels entworfen, das sie braucht, und mit
  diesem Plan freigegeben (Christian). Vor dem Bau werden sie in `grundsaetze-bilder.md` bzw. `bedienung.md`
  eingetragen und gelten dann für alle Spiele.
- **Annahmen:** Alle mit (Annahme) markierten Punkte gelten mit der Freigabe des Katalogs, soweit Christian nicht
  widerspricht.

---------------------------------------------------------------------------------------------------
## 9. Reihenfolge des Baus

**Entschieden am 2026-11-14 (Christian):** Die ersten zehn Spiele richten sich nach dem, woran das erste Kind in
Kl. 2 gerade arbeitet (Nomen, Artikel, Einmaleins, Schreibschrift, Buchstaben und Ziffern mit Strichfolge), nicht
nach dem Anfang von Kl. 1. Das Kind soll die App schnell nutzen können. Die Fächer wechseln sich ab, damit früh
jedes dieser Themen ein Spiel hat.

| # | Spiel | Bereich | Themen, auf die es zuerst ankommt |
|---|---|---|---|
| 1 | [M37](spielkatalog/mathe.md) Kettenhüpfer | Einmaleins | zweierreihe, zehnerreihe, fuenferreihe, kernaufgaben-einmaleins, dann alle Reihen |
| 2 | [S06](spielkatalog/schreiben-grammatik.md) Groß oder klein | Nomen | nomen-gross-artikelprobe, namen-gross |
| 3 | [S20](spielkatalog/schreiben-grammatik.md) Schreibschrift | Schreibschrift | die Kl.-2-Themen des Pfads der Schule |
| 4 | [S18](spielkatalog/schreiben-grammatik.md) Selbst schreiben | Buchstaben und Ziffern | ziffern-schreiben-*, spiegelziffern, spiegelbuchstaben-b-d-p-q; Schwünge und Kleinbuchstaben danach |
| 5 | [G09](spielkatalog/schreiben-grammatik.md) der, die, das | Artikel | der-die-das |
| 6 | [M36](spielkatalog/mathe.md) Punktefeld | Einmaleins | malaufgabe-als-punktefeld, tauschaufgaben-mal, nachbaraufgabe-mal, verdoppeln-beim-mal |
| 7 | [G01](spielkatalog/schreiben-grammatik.md) Dreieck und Kreis | Nomen | namenwoerter, nomen-proben |
| 8 | [M35](spielkatalog/mathe.md) Tüten packen | Einmaleins | gleich-grosse-gruppen, malaufgabe-zum-bild, mal-eins-mal-null |
| 9 | [G08](spielkatalog/schreiben-grammatik.md) Eins und viele | Nomen | mehrzahl-mit-* , mehrzahl-umlaut-ohne-endung |
| 10 | [S19](spielkatalog/schreiben-grammatik.md) Zwei Schriften | Schreibschrift lesen | schreibschrift-vergleichen |

Nachrücker: [M38](spielkatalog/mathe.md) Gerecht verteilen, sobald Teilen dazukommt.

- **(Annahme)** M37 vor M35: Das Kind übt in der Schule schon Reihen und weiß, was „mal“ heißt. Wackelt das, rückt
  M35 nach vorn.
- **Vor S18, S20 und S19 zu klären:** Versuch 1 aus Abschnitt 7 (Freihand-Schreiben mit dem Finger). Die
  Schriftvorlagen gibt es seit 2026-11-14 (Ziffern, Druckschrift b d p q, SAS-Kleinbuchstaben;
  `spiele/schrift/vorlagen/`, Prüfseite `npm run schrift:ansehen`).
- **Mit echten Dingen (Christian, 2026-11-14):** Zu allen Themen dieser zehn Spiele entstehen auch die Anleitungen
  ohne Bildschirm nach `docs/mit-echten-dingen.md`, eine je Thema (zusammen 133 Themen). Sie hängen nicht an der
  App, entstehen aber wie vorgesehen mit dem Bau des jeweiligen Spiels (Christian).
