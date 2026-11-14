# Spielkatalog

Stand: 2026-11-14 · Entwurf von Claude, Entscheidungen von Christian · geprüft und überarbeitet am 2026-11-14
(Abschnitt 1a) · **zur Freigabe**

Markierung: **(Christian)** entschieden · **(Annahme)** Vorschlag von Claude, beim Lesen korrigierbar.

Die Spiele im Einzelnen stehen in vier Teilen:
[`mathe.md`](spielkatalog/mathe.md) (M01–M56) ·
[`schreiben-grammatik.md`](spielkatalog/schreiben-grammatik.md) (S01–S20, G01–G13) ·
[`lesen-sprechen.md`](spielkatalog/lesen-sprechen.md) (L01–L18, Z01–Z11) ·
[`geometrie.md`](spielkatalog/geometrie.md) (R01–R20).
Dort hat jedes Spiel: Handlung und Wirkung, Material und Stufen, Fehlerkontrolle, Haupt- und weitere Themen,
Warum es passt, was bewusst nicht drin ist, Heimatwelt mit Sachgrund und Geschichte auf drei Stufen, Gesten, Lernzeichen, Stimme, Fehlerbilder,
Figuren, Name fürs Kind, Symbol, Regal-Material, Mach mit. Die Entscheidungen hier gehen vor; sie beantworten
die offenen Fragen am Ende der vier Teile.

---------------------------------------------------------------------------------------------------
## 1. Absicht

Die ersten sechs Spiele sind entfernt (Commit `dab0ffe`). An ihre Stelle tritt ein Katalog, der vom Lernplan
ausgeht: **Jedes der 956 Themen (Kl. 1–4) bekommt ein Spiel, das perfekt dazu passt (Christian).** Ein Spiel soll
nicht möglichst viele Themen abdecken. Die Welten des Lernplans sind die Geschichte der Spiele.

Der Katalog ist die Vorlage, aus der einzelne Spiele geplant und gebaut werden. Er legt fest, welche Spiele es
gibt, welche Themen sie tragen und in welcher Welt sie spielen. Wie ein Spiel im Einzelnen aussieht, entscheidet
die Planung des Spiels, im Rahmen der Einträge hier.

---------------------------------------------------------------------------------------------------
## 1a. Prüfung vom 2026-11-14 (Annahme)

Geprüft gegen das, was der Katalog leisten soll: spannend, abwechslungsreich, der Lernstoff sitzt, die Sachwelt
läuft mit, anpassbar von ruhig bis Abenteuer, Sachthemen passend zum Alter.

**Was trägt und unverändert bleibt**
- Schnitt und Lernhandlungen: 138 Spiele, 956 Themen, jedes Thema genau einmal Hauptthema (neu nachgezählt gegen
  `spiele/lernplan.json`). Material, Stufen, Fehlerkontrolle und Themen je Spiel sind nicht angefasst.
- Die Zuordnung der Heimatwelten.

**Was nicht trug und geändert ist**

| Befund | Änderung |
|---|---|
| 80 von 138 Spielen waren „ruhig fest“. Ein Kind auf „abenteuer“ hätte in 58 % der Spiele nichts davon gemerkt (Lesen 14 von 18, Sprechen 9 von 11, Geometrie 15 von 20). | Jedes Spiel hat alle drei Stufen (4.2). |
| Geschichten waren eintönig: 53 endeten mit „ist … fertig, ist Schluss“, Anlass war meist Ordnen, Einräumen, Beschriften, ein Plakat oder ein Heft. | Jede Geschichte hat eine Spannungsquelle und einen Rahmen aus festen Listen, die Verteilung ist gezählt (4.7). |
| „Abenteuer“ hieß in zwölf Spielen nur „länger“ oder „größer“, fünfmal „Dämmerung, es ist eine Eule“. | Jedes Spiel hat eine eigene Entdeckung oder Auflösung. |
| Zwei Quellen widersprachen sich: Die Fachteile beschrieben Szenen aus der Zeit vor der Weltzuordnung, `welten.md` andere. | Heimatwelt und Geschichte stehen wortgleich in `welten.md` und im Eintrag des Spiels. |
| Alter: Genannt waren drei Paarungen mit mehr als einer Klasse Abstand. Gemessen an den Themen sind es 74 Spiele (194 von 956 Themen). | Regel und Zeile „Sache wächst mit“ (4.1). |
| R01: „Lena findet ihren Papa nicht“ als Anlass jeder Runde verletzt `grundsaetze.md` 9.2 Nr. 8 (Verlassenwerden). M15 hatte verdeckten Zeitdruck, M48 ein Gewitter am Abend. | Geschichten ersetzt. |
| Sachgründe trugen sachlich nicht (z. B. „Brücken tragen Lasten über Teile, die man umstellen kann“ für Satzglieder, „Häuser mit offenen und geschlossenen Räumen“ für Silben) oder passten nicht zur neuen Geschichte. | Elf neu gefasst: M02, M19, M24, M29, M48, S03, S05, G05, L08, R01, R07. |
| Drei Namen fürs Kind waren doppelt vergeben (Post, Bücherei, Stimmt das?), ein vierter passte nicht mehr zur Welt (Kaufladen im Kräutergarten). | L07 „Päckchen“, L17 „Welche Sorte?“, L11 „Quatsch?“, L08 „Fast gleich“. |
| Fähigkeiten aus `figuren.md` §5 kamen kaum vor (in Mathe sechs Spiele). | 31 Spiele nutzen eine, immer nur in der Szene. |

**Was offen bleibt** (Abschnitt 7a): schwache Sachgründe bei sechs Spielen; alle Sachangaben sind ungeprüft (K4).

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
Jedes der 138 Spiele hat alle drei Stimmungen (Abschnitt 4.2).

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

### 4.1 Heimatwelt (Christian)

- **Jedes Spiel hat genau eine feste Heimatwelt** aus den Welten des Lernplans. Das Kind wählt keine Welt: Es soll
  sich auf die Spielhandlung konzentrieren und alle Welten mitbekommen, nicht nur ausgewählte.
- **Jedes Spiel hat eine Sachwelt.** Eine Welt darf Heimat von höchstens zwei Spielen sein (Christian).
- Geprüft je Paarung **(Annahme zu den Kriterien)**: Der Sachgrund steckt in der Aufgabe (K2); aus der Welt lässt
  sich eine Geschichte bauen (Anlass, jede richtige Lernhandlung bringt sie voran, Halt am Rundenende, genug Stoff
  für viele Runden, bei „anpassbar“ ein Bogen über alle Stufen); die Welt ist auf „ruhig“ tragbar; sie passt zum
  Alter (siehe „Sache wächst mit“ unten).
- Ergebnis: 106 von 113 Welten sind Heimat, 32 davon für zwei Spiele. **Sieben Welten haben keine Heimat**, weil
  ihre eigenen Regeln es verbieten oder kein Spiel mit richtiger Antwort sie trägt (Abschnitt 7a).
- **Sache wächst mit (Annahme).** Die Klasse einer Welt sagt, ab wann sie passt. Viele Spiele laufen über mehrere
  Klassen, und 62 der 113 Welten gehören zu Kl. 1. Bei 74 Spielen liegen deshalb Themen zwei oder mehr Klassen
  von der Klasse ihrer Welt entfernt (194 von 956 Themen).
  - Regel: Der Sachstoff einer Runde richtet sich nach der Klasse des Themas der Runde, nicht nach der Klasse der
    Welt. Ein Kind in Kl. 4 bekommt in der Welt „Haustiere“ Futterplan und Kosten, nicht „Meerschweinchen brauchen Heu“.
  - Für 65 dieser Spiele steht in `welten.md` die Zeile „Sache wächst mit“. Bei den übrigen 9 ist nur je ein
    Thema betroffen.
  - Folge: Jeder Fakt im Faktensatz einer Welt bekommt eine Klasse (Abschnitt 8).
- Die Zuordnung steht in der Übersicht (Abschnitt 5), Sachgrund und Geschichte in [`welten.md`](spielkatalog/welten.md).
- **Folge für `grundsaetze.md`:** K9 („Das Kind wählt die Welt“) wird ersetzt (Abschnitt 8).

### 4.2 Stimmung: ruhig, sanft, abenteuer (Christian)

Die Stufen aus `grundsaetze.md` §9.3 (Einstellung `geschichten` je Profil) **passen das Spiel an, sie sind kein
Filter auf Spiele.** Jedes Spiel ist auf jeder Stufe spielbar. Es ändern sich nur Bogen und Szene, nie die
Lernhandlung.

- **Jedes Spiel hat alle drei Stufen (Annahme).** Die frühere Einteilung in „ruhig fest“ und „anpassbar“ entfällt.
  Die Gründe für „ruhig fest“ („Ordnen trägt keinen Bogen“, „Hörarbeit braucht Stille“) galten dem Moment der Aufgabe.
  Der ist auf jeder Stufe still (K1, 9.2 Nr. 4). Der Bogen liegt davor und danach.
- **Was die Stufen heißen:**
  - *ruhig:* Anlass und Ziel ohne Komplikation, kein Dunkel. Auch hier gibt es eine Frage, die das Kind beantworten
    will (4.7).
  - *sanft* (Standard): dazu eine kleine Komplikation, die in derselben Szene gelöst wird.
  - *abenteuer* (nur auf Wunsch): ein Bogen über mehrere Runden mit einer Entdeckung oder einem milden Rätsel, die
    Auflösung ist komisch oder zum Staunen.
- **Wo die Stufe wirkt:** in der Einführung, in der Wirkung einer Antwort, am Rundenende und in der Pause.
  Aufgabe, Material, Hilfe-Leiter und Schwierigkeit sind auf allen Stufen gleich.
- **Bogen über mehrere Runden:** Jede Runde endet abgeschlossen, in Ruhe und im Hellen, ohne offenen Ausgang
  (9.2 Nr. 5). Hört das Kind auf, wartet der Bogen ohne Verlust und ohne Hinweis (N6).
- **Schutz-Welten und Gefühlsfragen** (S11, S12, S14, S17, G09, L01, L09, Z09, R01): Die Stufe ändert nur den
  Rahmen (Aufführung, Fest, Rallye), nie die Botschaft und nie in Richtung Bedrängnis. In R01 geht auf keiner Stufe
  ein Kind verloren (9.2 Nr. 8).
- Die drei Stufen je Spiel stehen in [`welten.md`](spielkatalog/welten.md) und wortgleich im Eintrag des Spiels.

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
- **Zehn Rahmen**, der häufigste trägt 24 von 138 Spielen:
  Forschen (24) · Versorgen (17) · Fest (17) · Reise (15) · Bauen (14) · Werkstatt (13) · Miteinander (11) · Spur (11) · Entdecken (9) · Zeitreise (7).
- **Keine Auflösung zweimal.** Jedes Abenteuer hat seine eigene Entdeckung; sie ist nach Möglichkeit ein Sachbild der
  Welt (ein Schnabeltier, ein Marder, ein Tagpfauenauge).
- **Fähigkeiten** (`figuren.md` §5: schrumpfen, schweben, in die Zeit reisen, riesig werden, unter Wasser atmen,
  verzaubern, ins Bild steigen) bringen die Runde zur Sache. 31 Spiele nutzen eine, vor allem auf „abenteuer“.
- **Eine Runde endet mit etwas, das in der Welt jetzt da ist** (die Brücke trägt, das Lied wird gesungen), nicht mit
  „fertig“.
- Wer ein Spiel plant und Rahmen oder Spannungsquelle ändert, zählt nach.

---------------------------------------------------------------------------------------------------
## 5. Übersicht der Spiele

Name fürs Kind, Klassen (aus den Hauptthemen), Zahl der Hauptthemen, Heimatwelt, Rahmen und Spannungsquelle (4.7).
Sachgrund und Geschichte auf drei Stufen je Spiel: [`welten.md`](spielkatalog/welten.md). Alles Weitere im jeweiligen Teil.

| Spiel | Name fürs Kind | Fach | Kl. | Themen | Heimatwelt | Rahmen | Spannung aus |
|---|---|---|---|---:|---|---|---|
| [M01](spielkatalog/mathe.md) Paare bilden | Zu zweit | Mathe | 1–2 | 4 | Sehen, hören, riechen, schmecken, tasten | Forschen | Rätsel |
| [M02](spielkatalog/mathe.md) Zählweg | Zählweg | Mathe | 1 | 4 | Wenn die Wut kommt | Bauen | Lücke |
| [M03](spielkatalog/mathe.md) Alle da? | Alle da? | Mathe | 1 | 2 | Wie die Zahlen entstanden sind | Zeitreise | Rätsel |
| [M04](spielkatalog/mathe.md) Blitzblick | Blitzblick | Mathe | 1 | 5 | Mein Körper von Kopf bis Fuß | Miteinander | Wissensvorsprung |
| [M05](spielkatalog/mathe.md) Was sagt die Zahl? | Was sagt die Zahl? | Mathe | 1 | 2 | Sonne, Sterne, Planeten | Entdecken | Lücke |
| [M06](spielkatalog/mathe.md) Zahlenpost | Zahlenpost | Mathe | 1–4 | 5 | Feuer und Kerzen: Erwachsene holen | Werkstatt | Durcheinander |
| [M07](spielkatalog/mathe.md) Bündeln | Bündeln | Mathe | 2–4 | 3 | Die ersten Menschen: Werkzeug, Feuer, Ackerbau | Zeitreise | Durcheinander |
| [M08](spielkatalog/mathe.md) Stellentafel | Zahlen legen | Mathe | 1–4 | 15 | Wünsche, Kaufen, Taschengeld | Werkstatt | Vorhersage |
| [M09](spielkatalog/mathe.md) Aufdecken | Aufdecken | Mathe | 2–4 | 3 | Gebirge und das Innere der Erde | Reise | Vorhersage |
| [M10](spielkatalog/mathe.md) Waage | Die Waage | Mathe | 1–4 | 7 | Wippe, Hebel, Balkenwaage | Werkstatt | Vorhersage |
| [M11](spielkatalog/mathe.md) Flug zur Zahl | Flug zur Zahl | Mathe | 1–4 | 9 | Die lange Zeitleiste des Lebens | Entdecken | Lücke |
| [M12](spielkatalog/mathe.md) Hundertertafel | Hundertertafel | Mathe | 2 | 3 | Samen gehen auf Reisen | Versorgen | Lücke |
| [M13](spielkatalog/mathe.md) Schätzen | Schätzen | Mathe | 2–4 | 8 | Erdteile und Ozeane | Forschen | Vorhersage |
| [M14](spielkatalog/mathe.md) Zerlegungshaus | Zerlegungshaus | Mathe | 1 | 13 | Müll trennen | Versorgen | Lücke |
| [M15](spielkatalog/mathe.md) Mach voll | Mach voll | Mathe | 1–4 | 10 | Obst und Gemüse und wann es reif ist | Versorgen | Lücke |
| [M16](spielkatalog/mathe.md) Aufgabenfamilie | Aufgabenfamilie | Mathe | 1–2 | 12 | Haustiere und was sie brauchen | Versorgen | Wissensvorsprung |
| [M17](spielkatalog/mathe.md) Was passiert? | Was passiert? | Mathe | 1–3 | 9 | Tiere im Winter, Frühblüher, Herbstfrüchte | Forschen | Verwandlung |
| [M18](spielkatalog/mathe.md) Wie viel mehr? | Wie viel mehr? | Mathe | 1–2 | 5 | Vom Baby bis heute | Zeitreise | Rätsel |
| [M19](spielkatalog/mathe.md) Spiegel | Der Spiegel | Mathe | 1–3 | 7 | Insel und See, Halbinsel und Bucht | Entdecken | Verwandlung |
| [M20](spielkatalog/mathe.md) Streifenbrett | Streifenbrett | Mathe | 1 | 8 | Mein Schulweg | Reise | Durcheinander |
| [M21](spielkatalog/mathe.md) Über die Zehn | Über die Zehn | Mathe | 1 | 11 | Zähne und wie man sie pflegt | Entdecken | Verwandlung |
| [M22](spielkatalog/mathe.md) Eine Perle leihen | Eine Perle leihen | Mathe | 1–2 | 5 | Um Hilfe bitten, helfen, Danke sagen | Miteinander | Hilfe |
| [M23](spielkatalog/mathe.md) Klein und groß | Klein und groß | Mathe | 1–4 | 12 | Burg, Kloster, Schloss | Bauen | Verwandlung |
| [M24](spielkatalog/mathe.md) Rechenstrich | Rechenstrich | Mathe | 2–3 | 14 | Wald und Teich | Reise | Hilfe |
| [M25](spielkatalog/mathe.md) Welcher Weg? | Welcher Weg? | Mathe | 2–3 | 4 | Zu Fuß, mit Rad, Bus und Bahn | Reise | Durcheinander |
| [M26](spielkatalog/mathe.md) Markenspiel | Markenspiel | Mathe | 2–4 | 13 | Wie Kleidung hergestellt wird | Werkstatt | Lücke |
| [M27](spielkatalog/mathe.md) Gleiche Sprünge | Gleiche Sprünge | Mathe | 1–3 | 5 | Woche, Monat, Jahr | Versorgen | Lücke |
| [M28](spielkatalog/mathe.md) Muster-Päckchen | Muster-Päckchen | Mathe | 1–4 | 6 | Türme, die fest stehen | Bauen | Durcheinander |
| [M29](spielkatalog/mathe.md) Zahlenmaschine | Zahlenmaschine | Mathe | 1–4 | 6 | Der Weg des Wassers | Forschen | Rätsel |
| [M30](spielkatalog/mathe.md) Zahlenmauer | Zahlenmauer | Mathe | 1–4 | 13 | Burg, Kloster, Schloss | Bauen | Rätsel |
| [M31](spielkatalog/mathe.md) Rechendreieck | Rechendreieck | Mathe | 1–3 | 4 | Brücken, die tragen | Bauen | Vorhersage |
| [M32](spielkatalog/mathe.md) Zauberquadrat | Zauberquadrat | Mathe | 3 | 2 | Jahr, Jahrzehnt, Jahrhundert | Zeitreise | Rätsel |
| [M33](spielkatalog/mathe.md) Stimmt das? | Stimmt das? | Mathe | 1–4 | 13 | Was Magnete anziehen | Forschen | Rätsel |
| [M34](spielkatalog/mathe.md) So geht es | So geht es | Mathe | 1–4 | 10 | Wie Erfindungen sich verändern | Werkstatt | Durcheinander |
| [M35](spielkatalog/mathe.md) Tüten packen | Tüten packen | Mathe | 2–3 | 7 | Tiere auf Wiese und Hecke | Forschen | Lücke |
| [M36](spielkatalog/mathe.md) Punktefeld | Punktefeld | Mathe | 2–4 | 12 | Das Klassenzimmer von oben | Entdecken | Verwandlung |
| [M37](spielkatalog/mathe.md) Kettenhüpfer | Kettenhüpfer | Mathe | 2–4 | 17 | Tiere auf Wiese und Hecke | Forschen | Rätsel |
| [M38](spielkatalog/mathe.md) Gerecht verteilen | Gerecht verteilen | Mathe | 2–4 | 10 | Gerecht teilen und abwechseln | Miteinander | Hilfe |
| [M39](spielkatalog/mathe.md) Mal-Marken | Mal-Marken | Mathe | 4 | 5 | Wie Kleidung hergestellt wird | Werkstatt | Hilfe |
| [M40](spielkatalog/mathe.md) Die Rechenfrage | Die Rechenfrage | Mathe | 1–3 | 8 | Wer an meinem Brot mitgearbeitet hat | Werkstatt | Lücke |
| [M41](spielkatalog/mathe.md) Skizze | Skizze | Mathe | 2–3 | 9 | Ackerbau, Hausbau, Handwerk | Bauen | Vorhersage |
| [M42](spielkatalog/mathe.md) Ungefähr | Ungefähr | Mathe | 3–4 | 4 | Werbung und was sie will | Werkstatt | Vorhersage |
| [M43](spielkatalog/mathe.md) Der Laden | Der Laden | Mathe | 1–3 | 8 | Was in Lebensmitteln steckt | Werkstatt | Hilfe |
| [M44](spielkatalog/mathe.md) Messen | Messen | Mathe | 1–3 | 5 | Wachsen und sich verändern | Forschen | Vorhersage |
| [M45](spielkatalog/mathe.md) Wiegen | Wiegen | Mathe | 3 | 3 | Steine, Sand und Boden | Forschen | Vorhersage |
| [M46](spielkatalog/mathe.md) Umfüllen | Umfüllen | Mathe | 3 | 2 | Wasser sparen und sauber halten | Versorgen | Vorhersage |
| [M47](spielkatalog/mathe.md) Die Uhr | Die Uhr | Mathe | 1–2 | 6 | Tag und Nacht, Sonne und Erde | Forschen | Rätsel |
| [M48](spielkatalog/mathe.md) Wie lange? | Wie lange? | Mathe | 2–3 | 5 | Was man bei Gewitter tut | Forschen | Vorhersage |
| [M49](spielkatalog/mathe.md) Kalender | Kalender | Mathe | 1–4 | 3 | Woche, Monat, Jahr | Fest | Rätsel |
| [M50](spielkatalog/mathe.md) Säulen bauen | Säulen bauen | Mathe | 1–3 | 6 | Mehrheit entscheidet: Klassensprecherin oder Klassensprecher | Miteinander | Vorhersage |
| [M51](spielkatalog/mathe.md) Ablesen | Ablesen | Mathe | 2–4 | 5 | Wetter beobachten und messen | Forschen | Vorhersage |
| [M52](spielkatalog/mathe.md) Je mehr … | Je mehr … | Mathe | 3–4 | 4 | Haustiere und was sie brauchen | Versorgen | Vorhersage |
| [M53](spielkatalog/mathe.md) Wie viele Arten? | Wie viele Arten? | Mathe | 1–4 | 7 | Was alle Menschen brauchen | Versorgen | Rätsel |
| [M54](spielkatalog/mathe.md) Säckchen | Säckchen | Mathe | 2–4 | 5 | Was Luft kann | Forschen | Vorhersage |
| [M55](spielkatalog/mathe.md) Zahlenrätsel | Zahlenrätsel | Mathe | 2–4 | 4 | Wie die Zahlen entstanden sind | Spur | Rätsel |
| [M56](spielkatalog/mathe.md) Wer sagt 20? | Wer sagt 20? | Mathe | 3 | 1 | Wozu Regeln? Gemeinsam abstimmen | Miteinander | Rätsel |
| [S01](spielkatalog/schreiben-grammatik.md) Wörter legen (bewegliches Alphabet, Laut für Laut) | Wörter legen | Schreiben | 1 | 13 | Wurzel, Stängel, Blatt, Blüte | Versorgen | Lücke |
| [S02](spielkatalog/schreiben-grammatik.md) Silbenbogen (jede Silbe vollständig) | Silbenbogen | Schreiben | 1 | 7 | Raupe und Schmetterling, Kaulquappe und Frosch | Versorgen | Verwandlung |
| [S03](spielkatalog/schreiben-grammatik.md) Das Silbenhaus (offene und geschlossene Silbe) | Silbenhaus | Schreiben | 2–3 | 18 | Ackerbau, Hausbau, Handwerk | Bauen | Durcheinander |
| [S04](spielkatalog/schreiben-grammatik.md) Das lange Wort (Verlängern) | Das lange Wort | Schreiben | 2–3 | 12 | Auf dem Bauernhof | Spur | Rätsel |
| [S05](spielkatalog/schreiben-grammatik.md) Der Wortbaum (Ableiten und Wortfamilie) | Wortbaum | Schreiben | 2–4 | 14 | Tierbaum und Pflanzenbaum | Forschen | Rätsel |
| [S06](spielkatalog/schreiben-grammatik.md) Groß oder klein (Artikelprobe) | Groß oder klein | Schreiben | 1–4 | 6 | Mein Körper von Kopf bis Fuß | Entdecken | Lücke |
| [S07](spielkatalog/schreiben-grammatik.md) Merken (ansehen, abdecken, schreiben, vergleichen) | Merken | Schreiben | 1–4 | 13 | Tarnen und Verstecken | Spur | Rätsel |
| [S08](spielkatalog/schreiben-grammatik.md) Proben-Kiste (Fehler finden, Probe wählen) | Proben-Kiste | Schreiben | 2–4 | 3 | Werkzeuge und wofür man sie nimmt | Werkstatt | Rätsel |
| [S09](spielkatalog/schreiben-grammatik.md) Schere (Satz, Wort, Silbe; Trennen am Rand) | Schere | Schreiben | 1–3 | 4 | Wie die Schrift entstanden ist | Zeitreise | Rätsel |
| [S10](spielkatalog/schreiben-grammatik.md) Bücherei (ABC und Nachschlagen) | Bücherei | Schreiben | 1–4 | 5 | Wie die Schrift entstanden ist | Spur | Rätsel |
| [S11](spielkatalog/schreiben-grammatik.md) Zeichen setzen (Punkt, Fragezeichen, Komma, wörtliche Rede) | Zeichen setzen | Schreiben | 1–4 | 10 | Ich darf Nein sagen | Fest | Verwandlung |
| [S12](spielkatalog/schreiben-grammatik.md) Post (wozu und für wen ist der Text?) | Post | Schreiben | 1–4 | 6 | Ich sage Bescheid, wo ich bin | Reise | Durcheinander |
| [S13](spielkatalog/schreiben-grammatik.md) Was fehlt? (die Fragen des Lesers) | Was fehlt? | Schreiben | 2–4 | 6 | Erste Hilfe und Notruf | Miteinander | Lücke |
| [S14](spielkatalog/schreiben-grammatik.md) Die Karte (Seite einrichten) | Die Karte | Schreiben | 1–4 | 4 | Gute und schlechte Geheimnisse | Fest | Wissensvorsprung |
| [S15](spielkatalog/schreiben-grammatik.md) Der Film (Reihenfolge, die etwas bewirkt) | Der Film | Schreiben | 1–4 | 19 | Wenn etwas schiefgeht | Fest | Durcheinander |
| [S16](spielkatalog/schreiben-grammatik.md) Die Lupe (vorlesen, ändern, wieder vorlesen) | Die Lupe | Schreiben | 1–4 | 12 | Das Auge | Forschen | Vorhersage |
| [S17](spielkatalog/schreiben-grammatik.md) Gedichte (Muster füllen) | Gedichte | Schreiben | 1–3 | 4 | Ja-Gefühl und Nein-Gefühl | Fest | Lücke |
| [S18](spielkatalog/schreiben-grammatik.md) Selbst schreiben (Strichfolge sehen, frei schreiben) | Selbst schreiben | Schreiben | 1 | 41 | Mein Schulweg | Bauen | Lücke |
| [S19](spielkatalog/schreiben-grammatik.md) Zwei Schriften (Druckschrift und Schreibschrift lesen) | Zwei Schriften | Schreiben | 2 | 1 | Früher und heute: Spielzeug, Schule, Familie | Zeitreise | Rätsel |
| [S20](spielkatalog/schreiben-grammatik.md) Schreibschrift (verbunden schreiben) | Schreibschrift | Schreiben | 2–3 | 37 | Um Hilfe bitten, helfen, Danke sagen | Miteinander | Wissensvorsprung |
| [G01](spielkatalog/schreiben-grammatik.md) Dreieck und Kreis (Wortarten mit Symbolen) | Dreieck und Kreis | Grammatik | 1–2 | 4 | Fell, Federn, Schuppen | Fest | Rätsel |
| [G02](spielkatalog/schreiben-grammatik.md) Ich, du, wir (Person und Verb) | Ich, du, wir | Grammatik | 2–3 | 6 | Darf ich mitspielen? | Miteinander | Hilfe |
| [G03](spielkatalog/schreiben-grammatik.md) Zeit-Uhr (gestern, heute, morgen) | Zeit-Uhr | Grammatik | 2–4 | 10 | Früher und heute: Spielzeug, Schule, Familie | Zeitreise | Durcheinander |
| [G04](spielkatalog/schreiben-grammatik.md) Satz-Bilder (Satz legen zum Bild) | Satz-Bilder | Grammatik | 1 | 2 | Wer frisst was? | Versorgen | Durcheinander |
| [G05](spielkatalog/schreiben-grammatik.md) Satz-Zug (Umstellprobe und Satzglieder) | Satz-Zug | Grammatik | 3–4 | 8 | Brücken, die tragen | Reise | Durcheinander |
| [G06](spielkatalog/schreiben-grammatik.md) Wer, wem, was? (Rollen des Verbs und Fälle) | Wer, wem, was? | Grammatik | 4 | 6 | Wie Menschen Wald und Wasser verändern | Forschen | Lücke |
| [G07](spielkatalog/schreiben-grammatik.md) Satz-Brücke (Sätze verbinden, Komma, das/dass) | Satz-Brücke | Grammatik | 3–4 | 4 | Strom und Stromkreis | Bauen | Rätsel |
| [G08](spielkatalog/schreiben-grammatik.md) Eins und viele (Mehrzahl) | Eins und viele | Grammatik | 1–2 | 6 | Samen gehen auf Reisen | Versorgen | Verwandlung |
| [G09](spielkatalog/schreiben-grammatik.md) der, die, das (Artikel) | der, die, das | Grammatik | 1–3 | 2 | Mein Körper gehört mir | Fest | Lücke |
| [G10](spielkatalog/schreiben-grammatik.md) Fundbüro (genau beschreiben) | Fundbüro | Grammatik | 2–4 | 6 | Holz, Metall, Glas, Wolle, Papier | Spur | Rätsel |
| [G11](spielkatalog/schreiben-grammatik.md) Bühne (Wortfelder, Gegenteile, Lage) | Bühne | Grammatik | 2–4 | 7 | Nah und fern, Stadt und Land | Fest | Verwandlung |
| [G12](spielkatalog/schreiben-grammatik.md) Wort-Werkstatt (Bausteine stecken) | Wort-Werkstatt | Grammatik | 2–4 | 11 | Wie Erfindungen sich verändern | Werkstatt | Verwandlung |
| [G13](spielkatalog/schreiben-grammatik.md) Kisten packen (Oberbegriffe und Ideen ordnen) | Kisten packen | Grammatik | 2–3 | 4 | Fünf Gruppen von Wirbeltieren | Spur | Rätsel |
| [L01](spielkatalog/lesen-sprechen.md) Verse-Werkstatt | Reime | Lesen | 1–4 | 4 | Alle Gefühle sind richtig | Fest | Lücke |
| [L02](spielkatalog/lesen-sprechen.md) Abzählen | Abzählen | Lesen | 1 | 1 | Tiere auf allen Erdteilen | Reise | Lücke |
| [L03](spielkatalog/lesen-sprechen.md) Geheimsprache | Geheimsprache | Lesen | 1 | 3 | Tarnen und Verstecken | Spur | Rätsel |
| [L04](spielkatalog/lesen-sprechen.md) Laut-Körbe | Einpacken | Lesen | 1 | 3 | Obst und Gemüse und wann es reif ist | Versorgen | Durcheinander |
| [L05](spielkatalog/lesen-sprechen.md) Wortzug | Wortzug | Lesen | 1 | 5 | Zu Fuß, mit Rad, Bus und Bahn | Reise | Verwandlung |
| [L06](spielkatalog/lesen-sprechen.md) Buchstabenhaus | Buchstabenhaus | Lesen | 1 | 48 | Wie man mit Händen oder Ohren mehr wahrnimmt | Entdecken | Lücke |
| [L07](spielkatalog/lesen-sprechen.md) Lesefenster | Päckchen | Lesen | 1 | 8 | Feste im Kalender | Fest | Rätsel |
| [L08](spielkatalog/lesen-sprechen.md) Kaufladen | Fast gleich | Lesen | 1–2 | 4 | Unbekannte Pflanzen nicht essen | Versorgen | Rätsel |
| [L09](spielkatalog/lesen-sprechen.md) Blitzwörter | Blitzwörter | Lesen | 1–2 | 2 | Wie fühlt sich das an? | Miteinander | Wissensvorsprung |
| [L10](spielkatalog/lesen-sprechen.md) Wortbausteine | Bausteine | Lesen | 2–3 | 3 | Berufe in Hof, Werkstatt, Laden und Pflege | Reise | Rätsel |
| [L11](spielkatalog/lesen-sprechen.md) Quatsch finden | Quatsch? | Lesen | 1–4 | 3 | Echt oder ausgedacht? | Forschen | Rätsel |
| [L12](spielkatalog/lesen-sprechen.md) Nachlesen | Nachlesen | Lesen | 1–4 | 8 | Kinderrechte | Fest | Lücke |
| [L13](spielkatalog/lesen-sprechen.md) Nachschlagen | Nachschlagen | Lesen | 2–4 | 3 | Wegklicken und Bescheid sagen | Spur | Rätsel |
| [L14](spielkatalog/lesen-sprechen.md) Titel finden | Titel | Lesen | 2–4 | 4 | Medien im Alltag | Fest | Wissensvorsprung |
| [L15](spielkatalog/lesen-sprechen.md) Spurenleser | Spuren | Lesen | 2–4 | 8 | Wie Tiere atmen und Junge bekommen | Spur | Rätsel |
| [L16](spielkatalog/lesen-sprechen.md) Wörterlupe | Lupe | Lesen | 2–4 | 4 | Pilze und winzige Lebewesen | Entdecken | Rätsel |
| [L17](spielkatalog/lesen-sprechen.md) Bücherei | Welche Sorte? | Lesen | 2–4 | 4 | Gemeinde, Bayern, Deutschland, Europa | Spur | Rätsel |
| [L18](spielkatalog/lesen-sprechen.md) Vorlese-Partitur | Vorlesen | Lesen | 1–4 | 8 | Bewegen, Spielen, Ausruhen, Schlafen | Fest | Verwandlung |
| [Z01](spielkatalog/lesen-sprechen.md) Lauschposten | Lauschen | Sprechen und Zuhören | 1 | 4 | Sehen, hören, riechen, schmecken, tasten | Forschen | Rätsel |
| [Z02](spielkatalog/lesen-sprechen.md) Wäscheleine | Wäscheleine | Sprechen und Zuhören | 1–2 | 4 | Hände waschen, Sonnenschutz | Versorgen | Durcheinander |
| [Z03](spielkatalog/lesen-sprechen.md) Auftrag | Auftrag | Sprechen und Zuhören | 1–2 | 7 | Sicher über die Straße, Helm beim Rad | Reise | Hilfe |
| [Z04](spielkatalog/lesen-sprechen.md) Hörbühne | Theater | Sprechen und Zuhören | 1–4 | 12 | Niemand wird ausgelacht | Fest | Rätsel |
| [Z05](spielkatalog/lesen-sprechen.md) Noch mal, bitte | Noch mal, bitte | Sprechen und Zuhören | 1–3 | 3 | Höflich miteinander reden | Reise | Lücke |
| [Z06](spielkatalog/lesen-sprechen.md) Gesprächszug | Was sagst du? | Sprechen und Zuhören | 1–4 | 10 | Streiten und sich versöhnen | Miteinander | Hilfe |
| [Z07](spielkatalog/lesen-sprechen.md) Stuhlkreis | Stuhlkreis | Sprechen und Zuhören | 1–4 | 5 | Warten und verlieren können | Miteinander | Durcheinander |
| [Z08](spielkatalog/lesen-sprechen.md) Weil-Brücke | Ich glaube | Sprechen und Zuhören | 2–4 | 4 | Eis, Wasser, Dampf | Forschen | Vorhersage |
| [Z09](spielkatalog/lesen-sprechen.md) Tonstudio | Tonstudio | Sprechen und Zuhören | 1–4 | 8 | Gefühle im Gesicht und im Körper | Fest | Verwandlung |
| [Z10](spielkatalog/lesen-sprechen.md) Erzählkino | Kino | Sprechen und Zuhören | 1–4 | 7 | Mein Tag: morgens, mittags, abends | Fest | Lücke |
| [Z11](spielkatalog/lesen-sprechen.md) Reporterheft | Reporter | Sprechen und Zuhören | 1–4 | 6 | Wie Kinder anderswo leben | Forschen | Wissensvorsprung |
| [R01](spielkatalog/geometrie.md) Hinlegen, wo es hingehört (Lagewörter) | Oben und unten | Geometrie | 1 | 3 | Ich habe mich verlaufen – wen frage ich? | Reise | Rätsel |
| [R02](spielkatalog/geometrie.md) Dem Weg folgen | Pfeilweg | Geometrie | 1–3 | 2 | Sicher über die Straße, Helm beim Rad | Reise | Durcheinander |
| [R03](spielkatalog/geometrie.md) Den Weg legen | Weg legen | Geometrie | 1–3 | 2 | Was rollt? Murmelbahn und Fahrzeuge | Bauen | Vorhersage |
| [R04](spielkatalog/geometrie.md) Formen nach einem Merkmal einsortieren | Formenkiste | Geometrie | 1–2 | 3 | Ampel, Zebrastreifen, Verkehrszeichen | Spur | Rätsel |
| [R05](spielkatalog/geometrie.md) Den Körper geben, der bestellt ist | Baukiste | Geometrie | 2–3 | 3 | Berufe in Hof, Werkstatt, Laden und Pflege | Werkstatt | Rätsel |
| [R06](spielkatalog/geometrie.md) Lückenlos belegen und zählen | Stab und Kugel | Geometrie | 1–4 | 4 | Werkzeuge und wofür man sie nimmt | Bauen | Vorhersage |
| [R07](spielkatalog/geometrie.md) Den Umriss füllen | Legebild | Geometrie | 1–4 | 4 | Schwimmen nur mit Aufsicht | Bauen | Lücke |
| [R08](spielkatalog/geometrie.md) Mit gleichen Plättchen auslegen (Fläche) | Beet auslegen | Geometrie | 2–4 | 4 | Was Pflanzen brauchen | Versorgen | Vorhersage |
| [R09](spielkatalog/geometrie.md) Den Rand abzäunen (Umfang) | Zaunbau | Geometrie | 2–4 | 3 | Was Pflanzen brauchen | Forschen | Vorhersage |
| [R10](spielkatalog/geometrie.md) Formen spannen (Nagelbrett) | Nagelbrett | Geometrie | 1–2 | 2 | Auf dem Bauernhof | Versorgen | Durcheinander |
| [R11](spielkatalog/geometrie.md) Das Werkzeug richtig anlegen | Werkbank | Geometrie | 2–4 | 6 | Himmelsrichtungen und Karten | Reise | Vorhersage |
| [R12](spielkatalog/geometrie.md) Würfelbau nachbauen | Würfelbau | Geometrie | 2–4 | 3 | Türme, die fest stehen | Bauen | Rätsel |
| [R13](spielkatalog/geometrie.md) Von oben eintragen (Bauplan, Lageplan) | Bauplan | Geometrie | 3–4 | 3 | Himmelsrichtungen und Karten | Entdecken | Vorhersage |
| [R14](spielkatalog/geometrie.md) Wer sieht was? (Ansichten) | Von wo? | Geometrie | 2–3 | 3 | Der Mond und seine Gestalten | Forschen | Vorhersage |
| [R15](spielkatalog/geometrie.md) Falten und vorhersagen | Falten | Geometrie | 2–3 | 4 | Raupe und Schmetterling, Kaulquappe und Frosch | Forschen | Vorhersage |
| [R16](spielkatalog/geometrie.md) Ins Gitter übertragen (abzeichnen, spiegeln, vergrößern) | Kästchenbild | Geometrie | 1–4 | 4 | Insel und See, Halbinsel und Bucht | Bauen | Verwandlung |
| [R17](spielkatalog/geometrie.md) Post nach Planquadrat | Post auf dem Plan | Geometrie | 3 | 1 | Nah und fern, Stadt und Land | Reise | Rätsel |
| [R18](spielkatalog/geometrie.md) Muster weiterlegen | Musterband | Geometrie | 1–3 | 3 | Feste im Kalender | Fest | Durcheinander |
| [R19](spielkatalog/geometrie.md) Netz falten | Würfelnetz | Geometrie | 3–4 | 6 | Wer an meinem Brot mitgearbeitet hat | Werkstatt | Vorhersage |
| [R20](spielkatalog/geometrie.md) Rollt es oder kippt es? | Rollt es? | Geometrie | 2 | 1 | Was rollt? Murmelbahn und Fahrzeuge | Forschen | Vorhersage |

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
## 7a. Offen bei den Welten

**Sieben Welten ohne Heimat:**
- `vulkanausbruch`, `dinosaurier-aussterben`: laut Welt nur Pausenmoment auf „abenteuer“.
- `nicht-schuld`: laut Welt „kein eigenes Spiel“. `familien`: laut Welt „nie Thema einer Aufgabe“.
- `dinosaurier`: §9.3 schließt Dinosaurier auf „ruhig“ aus; als Notlösung nur in M18, wenn Dinosaurier auf
  „ruhig“ freigegeben werden.
- `beruehrungen`, `hilfe-holen`: passen in kein Spiel mit richtiger Antwort, ohne K13 zu verletzen. Vorschlag: ein
  eigenes kleines Schutz-Spiel ohne richtige Antwort (wäre Spiel 139).

**Schwacher Sachgrund** (die Welt ist dort vor allem Ort und Wortstoff): S18 → Mein Schulweg, L02 → Tiere auf allen
Erdteilen, Z04 → Niemand wird ausgelacht, Z02 → Hände waschen, S14 → Gute und schlechte Geheimnisse (trägt nur die
gute Hälfte der Regel), M14 → Müll trennen. Ein Tausch wäre möglich, kostet aber an anderer Stelle eine Welt. Zu
entscheiden: so lassen oder für diese sechs neu zuordnen.

**Sachangaben ungeprüft:** Alle Fakten in `welten.md` (z. B. Dürers Quadrat von 1514, vierzehn Beine der Assel, drei
Sekunden zwischen Blitz und Donner je Kilometer) stammen aus dem Gedächtnis. Vor dem Bau eines Spiels kommen sie mit
Quelle in den Faktensatz der Welt oder fallen weg (K4).

**Zwei Spiele aus demselben Fach in einer Welt:** R08 und R09 (Was Pflanzen brauchen), M27 und M49 (Jahreskreis),
M35 und M37 (Wiese und Hecke), R11 und R13 (Karten).

---------------------------------------------------------------------------------------------------
## 8. Folgen für andere Dokumente (Aufgaben nach der Freigabe)

**`docs/grundsaetze.md`**
- K9 „Das Kind wählt die Welt“ → „Jedes Spiel hat eine feste Heimatwelt; das Kind lernt alle Welten über die
  Spiele kennen.“ K5 („Welten kehren über Spiele wieder“) entsprechend: über Zugänge und die Pause, nicht durch Wahl.
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
- `welten[].fakten[]`: jeder Fakt bekommt `klasse` (ab welcher Klasse er passt), damit ein Spiel den Sachstoff zur
  Klasse des Themas der Runde wählen kann (4.1, „Sache wächst mit“) **(Annahme)**.
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

- **Vorrang bei Widersprüchen:** Die Spiel-Einträge entstanden vor der Zuordnung der Welten.
  - Der **Eintrag im Fachteil** gilt für Lernhandlung, Material und Stufen, Fehlerkontrolle, Themen, Gesten,
    Lernzeichen und Fehlerbilder.
  - [`welten.md`](spielkatalog/welten.md) gilt für Heimatwelt, Geschichte, die Wirkung in der Szene und die Szene
    des Mach-mit-Moments.
  - Heimatwelt und Geschichte stehen seit der Überarbeitung wortgleich im Eintrag (Zeilen „Heimatwelt“ bis
    „Abenteuer“). Andere Szenen, Orte oder Wirkungen in einem Eintrag, die nicht zur Welt passen (z. B. Tierpark in
    L06, Beispiele in den Zeilen Handlung, Figuren, Mach mit), sind überholt.
- **Figuren:** Die Namen unter „Figuren“ sind ein Startvorschlag. Die Planung eines Spiels darf neu verteilen. Über
  alle Spiele soll jedes Kind gleich oft vorzeigen (`figuren.md` §3); wer das ändert, zählt nach.
- **Umfang des ersten Baus eines Spiels:**
  - Die Datenstruktur trägt von Anfang an alle Hauptthemen des Spiels (alle Klassen).
  - Gebaut werden zuerst die Themen der Einstiegsklasse auf allen Lernstufen (material, vorstellung, kopf), soweit
    die Themen sie haben, mit den Stimmungen ruhig und sanft (Standard). Der Bogen für
    „abenteuer“ wird von Anfang an mitgeplant, damit die Szene ihn tragen kann.
  - Abenteuer und die Themen späterer Klassen folgen in eigenen Ausbaustufen.
- **Neue Lernzeichen und Bedienteile:** Sie werden im Plan des ersten Spiels entworfen, das sie braucht, und mit
  diesem Plan freigegeben (Christian). Vor dem Bau werden sie in `grundsaetze-bilder.md` bzw. `bedienung.md`
  eingetragen und gelten dann für alle Spiele.
- **Annahmen:** Alle mit (Annahme) markierten Punkte gelten mit der Freigabe des Katalogs, soweit Christian nicht
  widerspricht.
- **Vor dem ersten Spiel mit Sachwelt zu klären** (außerhalb des Katalogs, `grundsaetze-bilder.md` §15): Quelle der
  Sachbilder (Lizenz für kommerzielle Nutzung), Herkunft der Szenenbilder, Gestalt des Echt-Zeichens.

---------------------------------------------------------------------------------------------------
## 9. Reihenfolge des Baus

Nicht Teil dieser Freigabe. Vorschlag für das Gespräch danach **(Annahme)**: zuerst die Spiele, deren Themen am
Anfang von Kl. 1 stehen und die keinen Versuch aus Abschnitt 7 brauchen, je Fach eins, damit die Startseite früh
alle Fächer zeigt.
