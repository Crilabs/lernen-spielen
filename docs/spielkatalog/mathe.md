> Teil des Spielkatalogs (`docs/spielkatalog.md`). **Die Entscheidungen im Hauptdokument gehen vor**, für den Bau
> `docs/spielbau.md`. Ein Eintrag sagt, was gelernt wird; Szenen in Handlung, Figuren und Mach mit sind Vorschläge.
> Spiele haben keine Sachwelt und keine Stufen der Geschichte (Christian, 2026-11-15).

# Spielkatalog Mathe (Kl. 1–4)

Stand: 2026-11-14 · Entwurf von Claude für den Auftraggeber · Eingabe: `themen-mathe-12.md` (248 Themen) und
`themen-mathe-34.md` (140 Themen), zusammen 388 · Kürzel M01 bis M56

## 1. Überblick

- **56 Spiele** für 388 Themen. Grundgedanke: Ein Spiel ist eine Handlung an einem Montessori-nahen Material
  (paaren, bündeln, in die Stellentafel legen, ergänzen bis voll, zerlegen, verdoppeln am Spiegel, auf dem Strahl
  landen, Gruppen packen, verteilen, wiegen …). Wo Kl. 3–4 dieselbe Handlung mit größeren Zahlen ist, läuft sie im
  selben Spiel weiter (Stellentafel bis zur Million, Mach voll bis zur Stufenzahl, Verteilen bis schriftlich teilen,
  Punktefeld bis halbschriftlich mal, Markenspiel für schriftlich plus und minus). Nur sieben Spiele sind reine
  Kl.-3–4-Spiele (M32, M39, M42, M45, M46, M52, M56).
- **Abruf und Ableiten sind getrennte Zugänge:** Streifenbrett (M20) und Kettenhüpfer (M37) rufen ab, Über die Zehn
  (M21), Eine Perle leihen (M22) und Punktefeld (M36) leiten ab. Das passt zur Leitregel „mehrere Zugänge“ und zum
  Kettenhüpfer-Spec.
- **Abweichung von 35–40:** 56 liegt deutlich darüber. Gründe: Mathe hat 40 % aller Themen (388 von 956); Kl. 1–2
  allein enthält gut 25 klar verschiedene Handlungen; die Prozessthemen (Begründen, Erklären, Problemlösen,
  Modellieren, etwa 70 Themen) brauchen eigene Handlungen (Stimmt das?, So geht es, Skizze, Zahlenrätsel …); die
  Größen haben fünf verschiedene Messgeräte. Zusammenlegungen, die ich vertretbar finde, stehen in Offene Fragen 1
  (damit wären es etwa 49).
- **Unsicher** bin ich bei: den kleinen Spielen M05, M32, M46, M56 (zwei oder ein Thema); ob M22 zwei Rechenwege
  (Hilfsaufgabe, gegensinnig) als eine Handlung tragen darf; ob M25 „Welcher Weg?“ als Spiel trägt oder nur als
  Wahl vor M21/M22/M24/M26; und bei den Prozessthemen der Kl. 3–4, die nur mit Namen vorliegen.
- **Was der Nachtrag verändert hat:**
  - Gesten (`bedienung.md` §5): Skizzen werden aus Bausteinen gelegt statt gezeichnet (M41); die Uhr hat eine
    Tipp-Alternative (Zielziffer antippen); freies Zeichnen und Spracheingabe trägt kein Spiel. Neu nötig ist nur ein
    **Zwei-Personen-Ablauf** am selben Gerät (M56, Mathe-Konferenz in M34).
  - Lernzeichen (`grundsaetze-bilder.md` §4, §12): Ich habe den Montessori-Bestand bevorzugt, daraus kamen der
    Spindelkasten für die Null (M03), das Streifenbrett (M20, hell/dunkel statt rot/blau), Markenspiel erst nach
    Bündeln (M26) und die Größen-Kommaschreibweise in derselben Stellentafel (M08 statt eigenes Einheiten-Spiel).
    Neue Lernzeichen sind je Spiel markiert (u. a. Balkenwaage, Zahlenmauer, Rechendreieck, Zeigeruhr, Lineal,
    Messbecher, Geld, Strichliste, Baumdiagramm, Tausenderwürfel, Tausender-Stellenwertfarbe).
  - Stimme (`stimme.md`): Spiele mit vielen Aufnahmen sind markiert (M06, M17, M33, M34, M40). Für Zahlen bis zur
    Million schlage ich eine feste Auswahl als Daten vor, weil Sätze nicht frei zusammengesetzt werden dürfen.
  - Fehlerbilder: Alle Mathe-Fehlerbilder haben ein Spiel, das sie zeigt (z. B. zahlendreher M06, kleiner-von-groesser
    und entbuendeln-ueber-null M26, gleichheitszeichen-ergibt M10, uhr-zeiger-vertauscht M47, lineal-ab-eins M44).
    Deshalb habe ich schriftlich plus und minus in einem Markenspiel gelassen: Alle drei Fehler entstehen an derselben
    Tauschstelle.
  - Figuren: „vorzeigen“ ist gleich verteilt, jedes Kind zeigt in 14 Spielen vor (gezählt). Fähigkeiten (schweben, schrumpfen, riesig,
    zaubern, Zeitreise) nur in sechs Spielen, immer nur auf die Szene, nie auf Perlen oder Zahlen.
  - Mach mit (Punkt 13): je Spiel ein Angebot am Rundenende, nie Bedingung, „gekonnt“ zählt nur, was die App sieht.
  - Namen fürs Kind: kurz und gut hörbar; die Kachel spricht ihren Namen (K3). Streng lautgetreu ist nicht jeder Name
    („Waage“, „Zahl“); ich habe Fachbegriffe (Zahlenmauer, Rechenstrich) nicht ersetzt (`grundsaetze.md` §5).
- **Prüfung:** Ein Python-Skript liest beide Eingabedateien (388 IDs, alle eindeutig) und die Zuordnung. Ergebnis:
  jede ID genau einmal als Hauptthema, keine fehlt, keine fremde ID, keine Zweitzuordnung gleich dem Hauptspiel.

## 2. Die Spiele

Gemeinsam für alle Spiele (wird unten nicht wiederholt):
- **Gesten** nur Tippen und Ziehen, jedes Ziehen auch als „Teil antippen, dann Ziel antippen“ (`bedienung.md` §5).
  Zahlen tippt das Kind auf der Bildschirm-Tastatur (`<ls-tastatur>` mit 0–9, Löschen). Keine Spracheingabe nötig.
- **Ablauf** nach `bedienung.md` §7: Einführung mit einem Vorzeigen (L5), Aufgaben ohne Bewegung beim Denken,
  Rundenende mit `<ls-pause>`. Hilfe-Leiter über `<ls-hilfe>`: 1. Probe, 2. Lösung mit Begründung, die das Kind
  selbst ausführt. Fehler setzen nichts zurück, die Folge einer Antwort, die nicht passt, ist kürzer und leiser als
  die einer passenden (N7, B5).
- **Stufen** material → vorstellung → kopf heißen hier immer: *material* = das Kind bewegt das Lernzeichen selbst;
  *vorstellung* = das Lernzeichen ist zu sehen, aber verdeckt oder nur kurz sichtbar, das Kind legt erst fest (L2);
  *kopf* = nur Zeichen (Ziffern, Aufgabe), das Material erscheint erst danach als Kontrolle (M7).
- **Figuren:** Die Rolle „vorzeigen“ ist gleich verteilt (Ela, Kofi, Lena, Timo je 14-mal).
  „Sich wundern“ übernimmt jeweils das nächste Kind. Die Interessen aus `figuren.md` §2 (bauen, malen, sammeln,
  backen) werden bewusst nie zur Aufgabe des Kindes gemacht, das sie hat.

---------------------------------------------------------------------------------------------------
### Teil A: Zahlen verstehen

### M01 Paare bilden
- Name fürs Kind: „Zu zweit“ · Symbol: zwei gleiche Kreise nebeneinander, ein dritter etwas abgesetzt
- Handlung: Das Kind zieht je ein Ding der einen Menge zu einem Ding der anderen (oder Perlen zu Paaren) · Wirkung:
  Jedes Paar macht etwas fertig (ein Becher landet bei einem Teller, zwei Kinder fassen sich an der Hand); was
  übrig bleibt, steht sichtbar allein.
- Material und Stufen: Plättchen in zwei Reihen. material: Paare selbst ziehen. vorstellung: zwei Reihen kurz
  sehen, erst festlegen „wo sind mehr / gleich viele / bleibt einer übrig“, dann paaren. kopf (Kl. 2): eine Zahl
  bis 100 als Zehnerstangen und Einer; Zehnerstangen gehen immer in Paaren auf (sie zerfallen in fünf Paare), also
  entscheiden nur die Einer.
- Lernzeichen: Plättchen (vorhanden), goldenes Material (M4). Kein neues.
- Gesten: Ziehen (Tipp-Alternative), Tippen auf „mehr“, „gleich viele“, „bleibt einer“.
- Fehlerkontrolle: Ein Ding ohne Partner bleibt stehen; gibt es keine Partner mehr, ist die Frage beantwortet.
- Fehlerbilder: –
- Hauptthemen: mehr-weniger-gleich-viele, gerade-ungerade, gerade-ungerade-begruenden, gerade-ungerade-bis-100 (Kl. 1–2)
- Weitere Zugänge: zeichen-groesser-kleiner-gleich (M10)
- Warum perfekt: Paarbildung ist die Definition von „gleich viele“ und von „gerade“. Das Kind braucht dafür keine
  Zahl, und genau das verlangt M1-01. Dieselbe Handlung begründet in AR1-03 die Antwort.
- Bewusst nicht drin: abzaehlen → M03 (dort wird gezählt, hier gerade nicht), zeichen-groesser-kleiner-gleich →
  M10 (das Zeichen gehört zur Waage).
- Stimme: wenig Varianten (feste Sätze „Das sind gleich viele.“, „Eine bleibt übrig.“).
- Figuren: Ela zeigt einmal vor, wie sie Paare zieht; Kofi wundert sich über das übrige Plättchen.
- Regal-Material: Karte mit zwei Plättchen als Paar und einem einzelnen (besser als Ziffernkarte).
- Mach mit (am Rundenende, als Angebot): Ela legt Löffel zu Tellern. „Beim Tischdecken kannst du auch Paare legen: ein Löffel zu jedem Teller.“
- Fachübergreifend: –

### M02 Zählweg
- Name fürs Kind: „Zählweg“ · Symbol: drei Trittsteine in einer Reihe, der vierte leer
- Handlung: Das Kind tippt auf dem Weg den nächsten Stein (vorwärts oder rückwärts) und tippt seine Zahl ·
  Wirkung: Der Stein taucht auf, die Figur kann einen Schritt weiter (oder beim Countdown startet etwas).
- Material und Stufen: linearer Weg aus Steinen mit Fünfer- und Zehnergliederung (wie Zahlenstrahl, aber ohne
  Maßstab). material: Steine sind sichtbar, einer fehlt. vorstellung: nur jeder fünfte Stein ist beschriftet.
  kopf: nur Lücken „_ 6 _“, der Weg erscheint danach.
- Lernzeichen: Zahlenstrahl (M6) in der Form Steinweg; kein neues Zeichen, nur eine Stimmungsform.
- Gesten: Tippen, Ziffern tippen.
- Fehlerkontrolle: Eine falsche Zahl erscheint an ihrem echten Ort auf dem Weg, nicht an der Lücke.
- Fehlerbilder: –
- Hauptthemen: vorwaerts-zaehlen, rueckwaerts-zaehlen, nachbarzahlen-bis-10, zahlen-ordnen-bis-10 (Kl. 1)
- Weitere Zugänge: ordnungszahlen-bis-10 (M05)
- Warum perfekt: Die Zahlenreihe ist eine Folge von Schritten. Weiterzählen ab einer Startzahl und der Vorgänger
  sind genau „ein Stein weiter / zurück“.
- Bewusst nicht drin: zahlenstrahl-bis-10 → M11 (dort zählt der Abstand, hier nur die Reihenfolge),
  in-schritten-zaehlen-bis-100 → M27.
- Stimme: wenig (Zahlwörter bis 20, „Was kommt nach …?“).
- Figuren: Kofi zeigt vor; Lena wundert sich, wenn eine Zahl woanders auftaucht. Fähigkeit: keine.
- Regal-Material: Karte mit Ziffer.
- Mach mit (am Rundenende, als Angebot): Kofi zählt beim Treppensteigen. „Zähl auf der Treppe mit, hinauf und wieder hinunter.“
- Fachübergreifend: –

### M03 Alle da?
- Name fürs Kind: „Alle da?“ · Symbol: Kasten mit Fächern, ein Fach leer
- Handlung: Das Kind legt Dinge einzeln in eine Dose oder Spindeln in das Fach mit der Zahl und zählt dabei
  (jedes Ding wird beim Antippen sichtbar abgehakt) · Wirkung: Die Dose schließt sich, wenn alle drin sind; das
  leere Fach „0“ bleibt leer und schließt sich auch.
- Material und Stufen: Montessori-Spindelkasten (angepasst nach Bilder-§12: Null als leeres Fach, schlichte
  Stäbchen). material: einzeln legen. vorstellung: Dinge liegen ungeordnet, das Kind tippt jedes einmal an und
  nennt dann die Anzahl. kopf: Ziffer ansehen, die passende Anzahl Stäbchen in einem Zug nehmen.
- Lernzeichen: Spindelkasten (Bilder-§12, angepasst; muss als SVG neu gezeichnet werden).
- Gesten: Tippen (jedes Ding einmal), Ziehen ins Fach, Ziffer tippen.
- Fehlerkontrolle: Bleibt ein Stäbchen übrig oder fehlt eins, schließt sich das Fach nicht; ein doppelt
  angetipptes Ding hebt sich nicht erneut an.
- Fehlerbilder: –
- Hauptthemen: abzaehlen, die-null (Kl. 1)
- Weitere Zugänge: menge-bild-ziffer (M04)
- Warum perfekt: Eins-zu-eins-Zählen und „die letzte Zahl ist die Anzahl“ werden gleichzeitig sichtbar; die Null
  ist ein echtes leeres Fach, nicht eine fehlende Aufgabe.
- Bewusst nicht drin: mengen-5 → M04 (Blitzblick soll das Zählen gerade vermeiden).
- Stimme: wenig.
- Figuren: Lena zeigt vor (tippt jedes Ding, zögert einmal und zählt neu); Timo wundert sich über das leere Fach.
- Regal-Material: Perlenstab der Zahl; für die Null eine Karte „0“ mit leerem Fach.
- Mach mit (am Rundenende, als Angebot): Lena zählt Murmeln in eine Dose. „Zähl nach dem Spielen nach, ob alles wieder in der Dose ist.“
- Fachübergreifend: –

### M04 Blitzblick
- Name fürs Kind: „Blitzblick“ · Symbol: Zehnerfeld mit 7 Plättchen (5 und 2), Auge darüber
- Handlung: Eine Darstellung (Würfelbild, Fingerbild, Strichliste, Zehner- oder Zwanzigerfeld, Zahlwort) erscheint
  kurz; das Kind legt dieselbe Anzahl in sein Feld oder tippt die Ziffer · Wirkung: Die eigene Menge erscheint neben
  der gezeigten, deckungsgleich, und füllt z. B. einen Eierkarton.
- Material und Stufen: Zehner- und Zwanzigerfeld mit Fünferbruch, Plättchen, Perlenstäbchen. material: Bild
  bleibt stehen, das Kind legt nach. vorstellung: Bild nur kurz (etwa 1–2 s, einstellbar, nie als Zeitdruck
  erzählt), dann legen. kopf: Bild kurz, Ziffer tippen.
- Lernzeichen: Zehnerfeld, Zwanzigerfeld (M2 Fünfergliederung), Perlenstäbchen (M3). Neu: Würfelbild und
  Fingerbild als Lernzeichen (flach, ohne Hand-Realismus) gehören noch nicht zum Bestand.
- Gesten: Tippen (Plättchen ins Feld, Ziffer).
- Fehlerkontrolle: Die eigene Menge steht neben der gezeigten; die Fünferreihe zeigt sofort „eins zu wenig“.
- Fehlerbilder: zaehlendes-rechnen (als Übung: Fünf-und-noch-Struktur ohne Zählen).
- Hauptthemen: mengen-5, zehnerfeld-fuenf-und-noch, zwanzigerfeld, menge-bild-ziffer, zahl-in-vielen-formen (Kl. 1)
- Weitere Zugänge: zehn-plus (M08), strichliste (M50), ziffern-lesen-bis-10 (M06)
- Warum perfekt: Strukturierte Anzahlen erkennt man nur, wenn Zählen keine Zeit hat. Das kurze Zeigen ist die
  Handlung, die genau das erzwingt, ohne Druck: Das Bild kann man jederzeit noch einmal ansehen (mit Hilfe).
- Bewusst nicht drin: abzaehlen → M03 (Gegenteil), ziffern-lesen-bis-10 → M06 (Hören statt Sehen).
- Stimme: wenig.
- Figuren: Timo zeigt vor („Timo sieht die volle Reihe. Und noch zwei.“); Ela wundert sich.
- Regal-Material: Perlenstab der Zahl (passt).
- Mach mit (am Rundenende, als Angebot): Timo hält kurz Finger hoch. „Frag jemanden, ob ihr euch kurz Finger zeigt und gleich sagt, wie viele es sind.“
- Fachübergreifend: Blitzwörter in Lesen nutzen dieselbe Kurz-Zeigen-Mechanik (Baustein teilen).

### M05 Was sagt die Zahl?
- Name fürs Kind: „Was sagt die Zahl?“ · Symbol: Ziffer 3 auf einem Trikot und drei Punkte daneben
- Handlung: In einer Szene steht eine Zahl; das Kind tut, was sie meint: drei Dinge nehmen, zum dritten Platz gehen,
  die Hausnummer anfahren oder die Länge ablesen · Wirkung: Der Auftrag in der Szene wird erfüllt (das Paket kommt an
  der richtigen Tür an, der dritte Wagen wird beladen).
- Material und Stufen: Reihe von Plätzen mit Plättchen (Anzahl) und Platzmarken (Ordnung). material: Plätze
  sichtbar, das Kind tippt den n-ten. vorstellung: erst festlegen, ob die Zahl „wie viele“ oder „welcher“ meint
  (zwei Karten), dann handeln. kopf: Sätze mit Zahlen sortieren (Anzahl, Platz, Maß, Name).
- Lernzeichen: Plättchen; neu: Platzmarke (Fähnchen mit Ordnungszahl) als schlichtes Zeichen.
- Gesten: Tippen.
- Fehlerkontrolle: Wer drei Wagen belädt statt den dritten, sieht die Ladung an der falschen Stelle; die Szene
  wartet, bis die Ladung stimmt.
- Fehlerbilder: –
- Hauptthemen: ordnungszahlen-bis-10, wofuer-zahlen-stehen (Kl. 1)
- Weitere Zugänge: –
- Warum perfekt: Beide Themen fragen dasselbe: Wofür steht diese Zahl? Die Szene macht den Unterschied
  handgreiflich, statt ihn zu erklären.
- Bewusst nicht drin: –
- Stimme: mittel (Ordnungszahlen „der dritte“ bis „der zehnte“ in drei Fällen; beim Anhören prüfen, stimme.md §2).
- Figuren: Ela zeigt vor; Kofi wundert sich über die Hausnummer, die keine Anzahl ist.
- Regal-Material: Karte mit Ziffer und Punkt („3.“).
- Mach mit (am Rundenende, als Angebot): Ela zeigt auf eine Hausnummer. „Schau draußen: Welche Zahlen sagen, wie viele, und welche sind ein Name?“
- Fachübergreifend: Sprechen (Ordnungszahlwörter), Sachthemen Räume und Wege.

### M06 Zahlenpost
- Name fürs Kind: „Zahlenpost“ · Symbol: Briefumschlag mit einer zweistelligen Zahl
- Handlung: Der Erzähler sagt eine Zahl (Aufnahme), das Kind tippt die Ziffern auf den Umschlag · Wirkung: Der Brief
  fliegt zum Haus mit dieser Nummer bzw. das Schließfach mit der Nummer springt auf.
- Material und Stufen: Ziffernkarten auf Stellenwert-Spalten. material: Kl. 1 hört „sieben“ und tippt die Ziffer
  aus zehn großen Karten; ab 11 tippt das Kind in Spalten Z | E, die Spalten sind beschriftet und gefärbt.
  vorstellung: Spalten unbeschriftet, nur gefärbt (M5). kopf: freie Zeile, keine Spalten.
- Lernzeichen: Ziffernkarten; Stellenwertspalten E/Z/H/T mit Farben (M5), später ausgeblendet. Für Tausender und
  größer gibt es noch keine Stellenwertfarbe (neu nötig, Vorschlag: Tausender wieder türkis mit „T“, wie die
  Dreiergruppen im Zahlwort).
- Gesten: Tippen auf der Bildschirm-Tastatur.
- Fehlerkontrolle: Der Brief fliegt zu dem Haus, dessen Nummer das Kind getippt hat; dort steht Goldmaterial in
  der Tür (74 statt 47 sieht man an sieben Stangen). Der Erzähler sagt die getippte Zahl („Das ist die
  vierundsiebzig.“).
- Fehlerbilder: zahlendreher (gezielt: Zahlen mit verschiedenen Ziffern, getrennt zählen), stellenwert-additiv
  (Kl. 3–4: innere Null, „zweihundertsieben“).
- Hauptthemen: ziffern-lesen-bis-10, zahlen-bis-20-schreiben, zahlwort-ziffern-bis-100, dreistellige-zahlen-lesen, grosse-zahlen-lesen (Kl. 1–4)
- Weitere Zugänge: –
- Warum perfekt: Die Schwierigkeit ist genau der Weg vom gehörten Zahlwort zur Ziffernfolge (Inversion, Null,
  Dreiergruppen). Hören und Tippen isolieren sie.
- Bewusst nicht drin: zahl-darstellungen-bis-100 → M08 (Material legen ist die andere Richtung).
- Stimme: **viel** (alle Zahlwörter bis 1000 als Aufnahmen; bis zur Million nicht alle aufnehmbar, deshalb eine
  feste Auswahl von etwa 300 großen Zahlen je Thema als Daten anlegen, `inhalte/vorlagen.json`).
- Figuren: Kofi zeigt vor (hört „dreiundvierzig“, tippt erst die Vier); Lena wundert sich über einen Brief, der
  am falschen Haus landet.
- Regal-Material: Karte mit Ziffer passt.
- Mach mit (am Rundenende, als Angebot): Kofi schreibt eine Zahl auf, die jemand sagt. „Frag jemanden, ob er dir Zahlen sagt, und schreib sie auf.“
- Fachübergreifend: Schreiben (Ziffern schreiben); Lesen (Zahlwörter lesen) als zweite Richtung möglich.

### M07 Bündeln
- Name fürs Kind: „Bündeln“ · Symbol: zehn Stäbchen mit Band
- Handlung: Das Kind zieht aus einem ungeordneten Haufen je zehn Einer zu einem Bündel; zehn Bündel werden zu einer
  Platte, zehn Platten zu einem Würfel · Wirkung: Das Bündel wird verschnürt und passt in den Transportkorb; der
  Haufen ist danach zu überblicken, die Zahl steht da.
- Material und Stufen: goldenes Perlenmaterial (M4). material: Einer einzeln ziehen, beim zehnten verschmelzen sie
  sichtbar (B2). vorstellung: das Kind tippt zuerst „wie viele Bündel werden es?“, dann bündeln. kopf: nur Z|E-Tafel,
  Material als Kontrolle.
- Lernzeichen: goldenes Material, Stellenwertfarben (M5). Tausenderwürfel neu als flaches Zeichen (Bilder-§4
  nennt nur Einer, Zehnerstab, Hunderterplatte).
- Gesten: Ziehen (mehrere Einer: Tipp, Tipp, … dann „bündeln“ antippen).
- Fehlerkontrolle: Ein Bündel mit neun oder elf schließt sich nicht.
- Fehlerbilder: zahlendreher, uebertrag-vergessen, kleiner-von-groesser (alle als Übung: Bündeln ist die Grundlage).
- Hauptthemen: buendeln-zehner-einer, hunderter-buendeln, tausender-buendeln (Kl. 2–4)
- Weitere Zugänge: anzahlen-schaetzen-bis-100 (M13), geld-wechseln (M43)
- Warum perfekt: Bündeln ist eine Tätigkeit, keine Schreibweise. Das Spiel lässt sie selbst ausführen, über drei
  Stufen hinweg gleich.
- Bewusst nicht drin: zahl-darstellungen-bis-100 → M08, entbuendeln-zehner → M26 (Entbündeln gehört zum Rechnen).
- Stimme: wenig.
- Figuren: Lena zeigt vor; Timo wundert sich über ein Bündel, das nicht zugeht.
- Regal-Material: Zehnerstab, Hunderterplatte bzw. Tausenderwürfel (neu nötig; Perlenstab 10 gold passt für Kl. 2).
- Mach mit (am Rundenende, als Angebot): Lena bindet zehn Stifte mit einem Gummi. „Bündle Stifte oder Nudeln zu je zehn und zähl die Bündel.“
- Fachübergreifend: –

### M08 Stellentafel
- Name fürs Kind: „Zahlen legen“ · Symbol: drei Spalten mit Platte, Stab, Perle
- Handlung: Das Kind legt eine Zahl mit Material in die Stellentafel und schiebt die Stellenwertkarten
  übereinander (300 + 40 + 2 → 342), oder zieht eine Zahl auseinander · Wirkung: Die Zahl wird zum Schild, zur
  Bestellung oder zum Preis in der Szene.
- Material und Stufen: goldenes Material und Montessori-Stellenwertkarten. material: legen und Karten schieben.
  vorstellung: Karten nur als Umriss, das Kind tippt die Ziffern. kopf: Zahl in Schreibweisen übersetzen (32 = 30 +
  2, 4Z 0E → 40); in Kl. 3–4 dieselbe Tafel mit Größen-Spalten (km | m, € | ct, kg | g) und Komma.
- Lernzeichen: goldenes Material, Stellenwertfarben (M5); neu: Stellenwertkarten (übereinander schiebbar),
  Größen-Spaltenköpfe.
- Gesten: Ziehen, Tippen.
- Fehlerkontrolle: Übereinandergeschoben zeigt die Karte genau, wo eine Null bleibt (40 ist nicht 4); eine leere
  Spalte bleibt leer und sichtbar.
- Fehlerbilder: zahlendreher, stellenwert-additiv (2007 statt 207 sieht man an überstehenden Karten),
  ziffernweises-rechnen (Übung).
- Hauptthemen: zehner-und-einer-bis-20, zehn-plus, minus-zehner, zehnerzahlen-bis-100, zahl-darstellungen-bis-100, zahlen-mit-null-bis-100, zerlegen-zehner-einer, darstellungen-bis-1000, null-platzhalter-bis-1000, zerlegen-bis-1000, null-in-grossen-zahlen, zerlegen-grosse-zahlen, kommaschreibweise-groessen, schreibweisen-groessen, groessen-ordnen-gemischt (Kl. 1–4)
- Weitere Zugänge: zahlwort-ziffern-bis-100 (M06), zahlen-bis-20-schreiben (M06), dreistellige-zahlen-lesen (M06), zehnerzahlen-plus-minus (M23), mal-geteilt-stufenzahlen (M23), euro-und-cent (M43), meter-zentimeter (M44), hunderterzahlen-plus-minus (M23), die-null (M03)
- Warum perfekt: Alle Themen sind dieselbe Übersetzung zwischen Menge, Stellen und Ziffern. Die Größen in Kl. 3–4
  sind dieselbe Tafel mit anderen Spaltenköpfen; das hält den Zusammenhang „Komma trennt Einheiten“ sichtbar.
- Bewusst nicht drin: vergleichen-bis-100 → M09, hundertertafel → M12.
- Stimme: viel (alle Zahlen bis 1000; Größen-Sätze).
- Figuren: Timo zeigt vor; Ela wundert sich über die Karte, die beim Schieben die Null verdeckt.
- Regal-Material: Karte mit Ziffer; für Stellenwert besser eine Mini-Stellentafel mit Stab und Perlen (neu).
- Mach mit (am Rundenende, als Angebot): Timo legt Bündel und einzelne Stifte nebeneinander. „Leg eine Zahl mit Bündeln und einzelnen Dingen auf den Tisch.“
- Fachübergreifend: –

### M09 Aufdecken
- Name fürs Kind: „Aufdecken“ · Symbol: zwei Karten, die vordersten Stellen offen
- Handlung: Zwei verdeckte Zahlen; das Kind deckt Stelle für Stelle von vorn auf und tippt auf die größere, sobald
  es sicher ist · Wirkung: Die größere Zahl gewinnt den Platz (z. B. der längere Zug fährt in das größere Gleis).
- Material und Stufen: Stellenwertkarten. material: hinter jeder Stelle liegt Material sichtbar. vorstellung: nur
  Ziffern, Material erst nach der Entscheidung. kopf: ordnen von drei oder vier Zahlen.
- Lernzeichen: Stellenwertkarten (siehe M08), Stellenwertfarben.
- Gesten: Tippen (aufdecken, wählen).
- Fehlerkontrolle: Nach dem Tippen werden alle Stellen aufgedeckt und das Material liegt nebeneinander.
- Fehlerbilder: zahlendreher (73 und 37 als Paar).
- Hauptthemen: vergleichen-bis-100, vergleichen-bis-1000, vergleichen-bis-million (Kl. 2–4)
- Weitere Zugänge: –
- Warum perfekt: „Erst die Zehner, dann die Einer“ ist die Strategie; das Aufdecken von vorn macht sie zur
  Handlung und belohnt nicht das Ansehen aller Ziffern (L2: erst festlegen).
- Bewusst nicht drin: zeichen-groesser-kleiner-gleich → M10 (kleine Zahlen, Gleichheit), groessen-ordnen-gemischt →
  M08.
- Stimme: mittel.
- Figuren: Kofi zeigt vor (deckt auf, tippt früh); Lena wundert sich, dass sie nicht alles aufdecken musste.
- Regal-Material: Karte mit „>“ zwischen zwei Ziffern (neu).
- Mach mit (am Rundenende, als Angebot): Kofi vergleicht zwei Preise im Prospekt. „Such zwei große Zahlen und schau zuerst auf die vorderste Stelle.“
- Fachübergreifend: –

### M10 Waage
- Name fürs Kind: „Die Waage“ · Symbol: Balkenwaage im Gleichgewicht
- Handlung: Das Kind legt Perlenstäbchen oder Zahlgewichte auf die Waagschalen, bis sie im Gleichgewicht ist, und
  setzt dann das Zeichen <, > oder = · Wirkung: Im Gleichgewicht hebt die Waage eine Last oder öffnet eine Schleuse.
- Material und Stufen: Balkenwaage mit Perlenstäbchen (Gewicht proportional zur Zahl). material: legen und kippen
  sehen. vorstellung: erst vorhersagen, wohin sie kippt (L2), dann loslassen. kopf: Aufgaben auf beiden Seiten
  (4 + 3 = _ + 5, 3 · 4 + 2 _ 15), die Waage kommt danach.
- Lernzeichen: Perlenstäbchen (M3); neu: Balkenwaage als Lernzeichen (flach, Lernfeld).
- Gesten: Ziehen, Tippen (Zeichen).
- Fehlerkontrolle: Die Waage kippt.
- Fehlerbilder: gleichheitszeichen-ergibt (gezielt: Rechnung auf beiden Seiten), rechenzeichen-verwechselt
  (Punkt vor Strich, als Zugang).
- Hauptthemen: zeichen-groesser-kleiner-gleich, was-ist-mehr-bis-20, gleichheitszeichen-gleich-viel, lueckenaufgaben-bis-10, waage-raetsel, ungleichungen-einmaleins, terme-vergleichen (Kl. 1–4)
- Weitere Zugänge: punkt-vor-strich (M36)
- Warum perfekt: Das Gleichheitszeichen heißt „ist gleich viel wie“; die Waage ist genau das. Größer, kleiner und
  Lücke links oder rechts sind dieselbe Frage an dasselbe Material.
- Bewusst nicht drin: gramm-kilogramm → M45 (Waage zum Messen, nicht zum Vergleichen von Termen).
- Stimme: mittel.
- Figuren: Lena zeigt vor; Timo wundert sich, warum die Waage bei 4 + 3 und 7 still steht.
- Regal-Material: kleine Waage im Gleichgewicht (neu, besser als Karte).
- Mach mit (am Rundenende, als Angebot): Lena baut eine Wippe aus Lineal und Radiergummi. „Frag jemanden, ob ihr zusammen eine kleine Wippe baut.“
- Fachübergreifend: –

### M11 Flug zur Zahl
- Name fürs Kind: „Flug zur Zahl“ · Symbol: Zahlenstrahl mit Pfeil, darüber ein kleiner Ballon
- Handlung: Das Kind tippt die Stelle auf dem Zahlenstrahl, wo eine Zahl liegt (oder liest ab, wo der Pfeil steht),
  und nennt die Nachbarzehner bzw. den nächsten Zehner beim Runden · Wirkung: Die Runde fliegt mit dem Ballon an die
  Stelle und landet dort; beim Runden landet der Ballon am nächsten Zehner.
- Material und Stufen: linearer Zahlenstrahl mit Gliederung (M6), Bereiche 0–10, 0–20, 0–100, 0–1000, 0–1 000 000
  (Zoom als Wechsel des Ausschnitts, nicht als Geste). material: alle Striche beschriftet. vorstellung: nur Zehner
  bzw. Hunderter beschriftet, erst tippen, dann sehen (L2). kopf: leerer Strahl mit zwei Enden.
- Lernzeichen: Zahlenstrahl (M6), Hunderterkette als Brücke für 0–100 (Bilder-§12).
- Gesten: Tippen auf den Strahl.
- Fehlerkontrolle: Der Ballon landet dort, wo das Kind getippt hat; der Erzähler nennt die Zahl, die dort liegt;
  die richtige Stelle leuchtet danach kurz (Sonnenring).
- Fehlerbilder: zahlendreher (Übung).
- Hauptthemen: zahlenstrahl-bis-10, nachbarzahlen-zahlenstrahl-bis-20, zahlenstrahl-bis-100, nachbarzehner, zahlenstrahl-bis-1000, nachbarzehner-nachbarhunderter, runden-zehner-hunderter, zahlenstrahl-million, grosse-zahlen-runden (Kl. 1–4)
- Weitere Zugänge: zahlen-ordnen-bis-10 (M02), vergleichen-bis-100 (M09)
- Warum perfekt: Lage, Nachbarzehner und Runden sind alle Abstandsfragen auf derselben Linie. Kl. 3–4 sind nur
  größere Ausschnitte, das Spiel bleibt gleich.
- Bewusst nicht drin: zaehlen-grosse-schritte → M27 (Sprünge statt Orte), hundertertafel → M12.
- Stimme: viel (Zahlen bis 1000, große Zahlen als feste Auswahl).
- Figuren: Ela zeigt vor; Kofi wundert sich über die Landung. Fähigkeit: schweben (der Weg zur Stelle, wirkt nur
  auf die Szene, nie auf den Strahl).
- Regal-Material: Karte mit kurzem Zahlenstrahl und Marke (neu).
- Mach mit (am Rundenende, als Angebot): Ela legt ein Band mit Zahlenkarten aus. „Leg Zahlenkarten auf einen Faden, mit Abstand, wie auf dem Strahl.“
- Fachübergreifend: Geometrie (Maßstab im Plan) nur entfernt; Sachthemen Zeit.

### M12 Hundertertafel
- Name fürs Kind: „Hundertertafel“ · Symbol: Gitter 10 × 10, eine Spalte hervorgehoben
- Handlung: Das Kind setzt eine Figur auf eine Zahl der Tafel und zieht sie eine Reihe hinunter oder hinauf
  (+10, −10, +20 …) · Wirkung: Die Figur erreicht ein Fach mit der Zahl, in dem etwas wartet (ein Samen wird gesät,
  ein Fenster leuchtet).
- Material und Stufen: Hunderterfeld 10 × 10 mit Fünferbruch, Verbindung zum Zahlenstrahl sichtbar (M6). material:
  alle Zahlen stehen da. vorstellung: nur Zehnerspalte und Diagonale beschriftet. kopf: leere Tafel, Ziffer tippen.
- Lernzeichen: Hunderterfeld (M6).
- Gesten: Tippen, Ziehen in Reihen.
- Fehlerkontrolle: Die Figur steht auf dem Fach, das die getippte Zahl trägt; die Spalte bleibt sichtbar.
- Fehlerbilder: zahlendreher (Übung, 34 und 43 liegen weit auseinander).
- Hauptthemen: hundertertafel, plus-zehner-bis-100, minus-zehner-bis-100 (Kl. 2)
- Weitere Zugänge: gerade-ungerade-bis-100 (M01), zahlenraetsel-zwei-hinweise (M55)
- Warum perfekt: Dass sich bei +10 nur die Zehnerziffer ändert, ist auf der Tafel eine Bewegung senkrecht nach
  unten. Kein anderes Material zeigt das so direkt.
- Bewusst nicht drin: plus-zweistellig-ohne-uebergang → M24.
- Stimme: mittel.
- Figuren: Kofi zeigt vor; Lena wundert sich, dass unter der 34 die 44 liegt.
- Regal-Material: Karte mit Mini-Hunderterfeld (neu).
- Mach mit (am Rundenende, als Angebot): Kofi zeigt eine Hundertertafel mit Büroklammern. „Such auf einem Kalender oder einer Tafel die Zahl unter deiner Zahl.“
- Fachübergreifend: Geometrie (Planquadrate) ähnlich, aber getrennt lassen.

### M13 Schätzen
- Name fürs Kind: „Schätzen“ · Symbol: Glas mit vielen Perlen, eine Zehnergruppe umkreist
- Handlung: Das Kind legt eine Schätzung fest (tippt einen Bereich oder eine Zahl), zählt dann einen kleinen Teil
  genau (ein Zehnerhäufchen, eine Reihe, ein Schritt) und rechnet hoch · Wirkung: Genau so viele Säcke, Stühle oder
  Kisten werden bestellt; die Szene zeigt dann, ob es reicht.
- Material und Stufen: Perlen im Glas, Bezugsgröße (Zehnerhäufchen, Bus-Reihe, Schritt). material: Bezugsteil
  bündeln (M07). vorstellung: Bezugsteil nur markiert. kopf (Kl. 4): Fermi-Frage in Teilfragen zerlegen („Wie viele
  in einer Reihe? Wie viele Reihen?“), Teilantworten auf Karten.
- Lernzeichen: goldenes Material zum Prüfen; neu: Bezugsrahmen (umkreister Teil) und Fragekarten.
- Gesten: Tippen (Bereich wählen, Teil markieren), Ziffern tippen.
- Fehlerkontrolle: Nach dem Festlegen wird ganz gebündelt; die Schätzung steht als Marke auf einem Zahlenstrahl
  neben der echten Zahl. Es gibt keine „richtige“ Schätzung, nur einen sinnvollen Bereich.
- Fehlerbilder: –
- Hauptthemen: anzahlen-schaetzen-bis-100, grosse-anzahlen-schaetzen, fermi-schaetzen, fermi-wie-viele-passen, fermi-teilfragen, annahme-pruefen, mit-ungefaehren-zahlen-rechnen, schaetzung-begruenden (Kl. 2–4)
- Weitere Zugänge: laengen-schaetzen (M44), gewichte-schaetzen (M45)
- Warum perfekt: Schätzen heißt: einen Teil kennen und hochrechnen. Kl. 2 macht das mit einem Zehnerhäufchen,
  Kl. 4 mit einer Bus-Reihe; die Handlung ist dieselbe.
- Bewusst nicht drin: ueberschlag-plus-minus → M42 (Schätzen von Rechenergebnissen), laengen-schaetzen → M44.
- Stimme: mittel.
- Figuren: Lena zeigt vor (zählt eine Reihe, rechnet hoch); Timo wundert sich, wie nah die Schätzung war.
- Regal-Material: Karte mit „≈“ und einer Zahl (neu).
- Mach mit (am Rundenende, als Angebot): Lena schätzt Nudeln im Glas und zählt eine Handvoll. „Schätz etwas Großes und zähl dann einen kleinen Teil genau.“
- Fachübergreifend: Sachthemen (Mengen in der Natur).

### Teil B: Plus und Minus

### M14 Zwei Tonnen
- Name fürs Kind: „Zwei Tonnen“ (Annahme) · Symbol: zwei Tonnen nebeneinander, darüber die Zahl
- Handlung: n Dinge liegen nach dem Picknick auf der Decke (n = Thema). Das Kind teilt sie mit einem Trenner in zwei
  Teile: ein Teil wird Papier, der andere Wertstoff, und beide wandern in ihre Tonne. Danach steht die Zerlegung
  **wieder als Perlenstäbe** da – die beiden Teilstäbe nebeneinander unter dem ganzen Stab, dazu „6 = 2 + 4“ – und
  bleibt als Zeile in der Liste neben den Tonnen stehen (geordnet von 0 + n bis n + 0; Christian: damit es sich
  einprägt, M7) · Wirkung: Die Decke wird leer, die
  Tonnen füllen sich, die Liste wächst; ist sie vollständig, ist die Wiese sauber. **Keine zweite Metapher** (kein
  Haus, keine Stockwerke, kein Licht; Christian 2026-11-14).
- Material und Stufen: Perlenstäbchen n (M3). material: Trenner schieben. vorstellung: ein Teil ist verdeckt (wie
  Schüttelbox), das Kind tippt den anderen. kopf: Zerlegungen tippen, Stäbchen kommt als Probe.
- Lernzeichen: Perlenstäbchen (M3); die Zerlegungsliste als schlichte Tabelle im Lernfeld, jede Zeile mit den zwei
  Teilstäben unter dem ganzen Stab und der Gleichung (ohne Schmuck).
- Gesten: Ziehen (Trenner), Tippen.
- Fehlerkontrolle: Auf der Decke bleibt etwas liegen oder es fehlt, wenn die zwei Teile nicht n ergeben; eine
  doppelte Zerlegung steht schon in der Liste.
- Fehlerbilder: zaehlendes-rechnen (Übung: Zerlegungen sind das wichtigste Gegenmittel).
- Hauptthemen: zerlegen-2, zerlegen-3, zerlegen-4, zerlegen-5, zerlegen-6, zerlegen-7, zerlegen-8, zerlegen-9, zerlegen-10, zerlegungen-ordnen, mehrere-loesungen, alle-loesungen-finden, geordnet-probieren (Kl. 1)
- Weitere Zugänge: ergaenzen-bis-10 (M15), lueckenaufgaben-bis-10 (M10), geld-legen-bis-20 (M43)
- Warum perfekt: Die ganze Zahlzerlegung bis 10 ist eine einzige Handlung mit einem Stäbchen. Die drei
  Problemlöse-Themen der Kl. 1 (mehrere, alle, geordnet) zeigen sich in der wachsenden, geordneten Liste.
- Bewusst nicht drin: ergaenzen-bis-10 → M15 (Ergänzen zum vollen Zehner ist eine eigene Handlung).
- Stimme: wenig (Zahlen bis 10).
- Figuren: Timo zeigt vor (fängt bei 0 + 7 an); Ela wundert sich über eine Zerlegung, die schon in der Liste steht.
- Regal-Material: Perlenstab n (passt genau, `zerlegung`).
- Mach mit (am Rundenende, als Angebot): Timo verteilt sieben Murmeln auf zwei Hände. „Verstecke Murmeln in zwei Händen und lass raten, wie viele in der anderen sind.“
- Fachübergreifend: –

### M15 Mach voll
- Name fürs Kind: „Mach voll“ · Symbol: Eierkarton, drei Fächer leer
- Handlung: Das Kind ergänzt bis zum nächsten vollen Ganzen (Zehnerfeld voll, nächster Zehner, 100, 1000, Stufenzahl)
  und tippt, wie viel fehlt; bei „Minus von 10“ nimmt es aus dem vollen Ganzen heraus · Wirkung: Der Karton ist voll
  und wird verschickt; die Kiste schließt.
- Material und Stufen: Zehnerfeld, goldenes Material. material: fehlende Perlen ziehen. vorstellung: Leerstellen
  nur als Umriss. kopf: 63 + _ = 100, Material als Probe.
- Lernzeichen: Zehnerfeld (M2), goldenes Material (M4).
- Gesten: Tippen, Ziehen.
- Fehlerkontrolle: Der Karton geht nur zu, wenn er genau voll ist; eine Perle zu viel bleibt draußen liegen.
- Fehlerbilder: zehneruebergang-unsicher (Übung: ergaenzen-bis-10, minus-bis-zur-10).
- Hauptthemen: ergaenzen-bis-10, ergebnis-10, minus-von-10, plus-zur-20, minus-von-20, minus-bis-zur-10, ergaenzen-zum-zehner, ergaenzen-bis-100, ergaenzen-hunderter-1000, ergaenzen-stufenzahlen (Kl. 1–4)
- Weitere Zugänge: rueckgeld (M43)
- Warum perfekt: Zehnerfreunde, Ergänzen zum Zehner, zu 100, zu 1000 und zu einer Stufenzahl sind dieselbe Frage
  („Was fehlt bis voll?“) an immer größere Einheiten.
- Bewusst nicht drin: rueckgeld → M43 (Ergänzen mit Geld, dort als Kaufmannsmethode), zerlegen-10 → M14.
- Stimme: wenig.
- Figuren: Ela zeigt vor; Kofi wundert sich über die Perle, die draußen bleibt.
- Regal-Material: Perlenstab 10 mit Trennmarke (neu: zweifarbiger Stab, n und 10 − n).
- Mach mit (am Rundenende, als Angebot): Ela füllt einen Eierkarton. „Wie viele fehlen im Eierkarton bis voll? Schau beim Einkaufen nach.“
- Fachübergreifend: –

### M16 Aufgabenfamilie
- Name fürs Kind: „Aufgabenfamilie“ · Symbol: Dreieck mit drei Zahlen, vier Pfeile darum
- Handlung: Aus einem geteilten Perlenstäbchen (3 | 4 von 7) baut das Kind die vier Aufgaben der Familie, indem es
  Teile zusammenschiebt oder wegnimmt, und tippt die fehlende Zahl · Wirkung: Jede Aufgabe bekommt ihren Platz im
  Familienhaus; wer dazugehört, wohnt.
- Material und Stufen: Perlenstäbchen (M3), Zahlendreieck. material: Stäbchen schieben. vorstellung: ein Teil
  verdeckt. kopf: Umkehraufgabe als Probe (bis 100: 63 − 28 = 35, Probe 35 + 28).
- Lernzeichen: Perlenstäbchen; neu: Familiendreieck (drei Zahlen an den Ecken).
- Gesten: Ziehen, Tippen.
- Fehlerkontrolle: Eine Aufgabe, die nicht zur Familie gehört (7 − 1 bei 1, 7, 8), passt nicht an das Stäbchen.
- Fehlerbilder: rechenzeichen-verwechselt (Übung), gleichheitszeichen-ergibt (Übung).
- Hauptthemen: rechnen-3, rechnen-4, rechnen-5, rechnen-6, rechnen-7, rechnen-8, rechnen-9, rechnen-10, umkehraufgaben-bis-10, aufgabenfamilie-bis-10, umkehraufgaben-bis-20, probe-umkehraufgabe-bis-100 (Kl. 1–2)
- Weitere Zugänge: lueckenaufgaben-bis-10 (M10), probe-schriftlich-minus (M26), geteilt-umkehrung-mal (M37)
- Warum perfekt: Die acht Themen „Rechnen mit der n“ verlangen genau das: Plus-, Minus- und Ergänzungsaufgaben aus
  einer Zerlegung ableiten. Umkehraufgabe und Probe sind dieselbe Beziehung.
- Bewusst nicht drin: zerlegen-n → M14.
- Stimme: mittel (Aufgaben bis 20 als Sätze).
- Figuren: Kofi zeigt vor; Lena wundert sich über die Aufgabe, die nicht ins Haus passt.
- Regal-Material: Perlenstab n (passt).
- Mach mit (am Rundenende, als Angebot): Kofi legt drei und vier Steine zusammen und trennt sie wieder. „Leg zwei Häufchen und finde alle vier Aufgaben dazu.“
- Fachübergreifend: –

### M17 Was passiert?
- Name fürs Kind: „Was passiert?“ · Symbol: Bus mit Pfeil hinein und hinaus
- Handlung: Eine kurze Szene spielt sich ab (Kinder steigen ein, Äpfel fallen); das Kind baut aus Zahl- und
  Zeichenkarten die passende Rechnung oder wählt zur Rechnung die passende Szene · Wirkung: Die Szene läuft mit der
  gebauten Rechnung noch einmal ab; passt sie, geht die Geschichte weiter.
- Material und Stufen: Szene (Stimmungsebene) mit schlichten Plättchen-Einblendungen, Rechenkarten. material:
  Plättchen bewegen sich wie in der Szene. vorstellung: die Szene ist zu sehen, keine Plättchen. kopf: nur der
  vorgelesene Text.
- Lernzeichen: Plättchen; neu: Rechenkarten (Zahl, +, −, ·, :, =) als Lernzeichen.
- Gesten: Ziehen (Karten), Tippen.
- Fehlerkontrolle: Die Szene spielt die gebaute Rechnung wörtlich nach: Bei „6 + 2“ steigen Kinder ein, obwohl
  welche ausstiegen. Ein unmögliches Ergebnis (8 nach dem Gehen) sieht man an zu vielen Kindern.
- Fehlerbilder: rechenzeichen-verwechselt (Übung), signalwort-falle (Übung: rechnung-zu-bild).
- Hauptthemen: plus-verstehen, minus-verstehen, rechengeschichte-zum-bild, bild-zu-rechnung, rechnung-zu-bild, ergebnis-passt-zur-geschichte, geschichte-zur-malaufgabe, mal-oder-geteilt, rechnung-zur-geschichte (Kl. 1–3)
- Weitere Zugänge: malaufgabe-zum-bild (M35), sprache-zu-rechnung (M34), kapitaensaufgabe-erkennen (M40), ergebnis-zur-situation (M35), fragen-selbst-stellen (M40), sachaufgabe-skizze (M41)
- Warum perfekt: Plus, Minus, Mal und Geteilt verstehen heißt Situation und Rechnung ineinander übersetzen. Das
  Nachspielen der gebauten Rechnung ist die Fehlerkontrolle in der Sache.
- Bewusst nicht drin: kapitaensaufgabe-erkennen → M40 (Fragen und Angaben), sachaufgabe-skizze → M41.
- Stimme: **viel** (jede Geschichte ein eigener Satz; als feste Geschichtenbank anlegen).
- Figuren: Lena zeigt vor; Timo wundert sich, als die Szene mit der falschen Rechnung rückwärts läuft. Gäste: der
  Busfahrer, die Bäuerin.
- Regal-Material: Karte mit Rechenzeichen (+ bzw. ·).
- Mach mit (am Rundenende, als Angebot): Lena schaut aus dem Fenster auf eine Haltestelle. „Schau an einer Haltestelle, wer ein- und aussteigt, und erzähl die Rechnung.“
- Fachübergreifend: Lesen (kurze Sachaufgabentexte lesen) als Zugang ab Kl. 2.

### M18 Wie viel mehr?
- Name fürs Kind: „Wie viel mehr?“ · Symbol: zwei Türme nebeneinander, Überstand markiert
- Handlung: Zwei Perlentürme stehen nebeneinander; das Kind tippt, wie viel der eine mehr hat (der Überstand),
  oder baut den kleineren Turm hoch · Wirkung: Der Überstand wird zur Brücke oder zum Steg, der genau so lang ist.
- Material und Stufen: Perlenstäbchen bzw. goldenes Material als Türme. material: hochbauen. vorstellung: Türme
  nur als Umriss mit Zahl. kopf: Sachaufgabe „4 mehr als“, Türme danach; differenz-bleibt-gleich: beide Türme
  wachsen gleich, der Überstand bleibt.
- Lernzeichen: Perlenstäbchen, Zehnerstäbe.
- Gesten: Tippen, Ziehen.
- Fehlerkontrolle: Der Steg passt nur über genau diesen Überstand.
- Fehlerbilder: signalwort-falle (gezielt), kleiner-von-groesser (Übung: Hochzählen).
- Hauptthemen: unterschied-bis-10, ergaenzen-statt-abziehen, ergaenzen-statt-abziehen-bis-100, signalwoerter-falle, differenz-bleibt-gleich (Kl. 1–2)
- Weitere Zugänge: mehr-weniger-gleich-viele (M01), vereinfachen-plus-minus (M22)
- Warum perfekt: Der Unterschied ist ein Vergleich, nicht ein Wegnehmen; der Überstand zeigt ihn direkt. Hochzählen
  statt Abziehen ist dieselbe Handlung, und „beide wachsen gleich“ ist sichtbar.
- Bewusst nicht drin: minus-verstehen → M17 (Wegnehmen als Handlung).
- Stimme: mittel.
- Figuren: Timo zeigt vor; Ela wundert sich, dass der Abstand gleich bleibt.
- Regal-Material: zwei kurze Stäbe mit Überstand (neu).
- Mach mit (am Rundenende, als Angebot): Timo stellt zwei Türme aus Klötzen nebeneinander. „Bau zwei Türme und schau, wie viel der eine größer ist.“
- Fachübergreifend: –

### M19 Spiegel
- Name fürs Kind: „Der Spiegel“ · Symbol: halbe Perlenreihe und ihr Spiegelbild
- Handlung: Das Kind stellt einen Spiegel an eine Perlenreihe und tippt, wie viele es jetzt sind (verdoppeln), oder
  stellt den Spiegel so, dass die Reihe halbiert wird · Wirkung: Das Spiegelbild wird echt (die Doppelreihe Kekse
  liegt auf zwei Tellern).
- Material und Stufen: Perlenstäbchen, Zehnerstäbe (für bis 1000). material: Spiegel ziehen. vorstellung: Spiegel
  ist schon da, Spiegelbild verdeckt. kopf: Doppelt und Hälfte tippen; Fast-Verdoppeln: Doppelt und eine Perle
  dazu oder weg.
- Lernzeichen: Perlenstäbchen; neu: Spiegel (senkrechter Strich mit Glanzkante, Lernfeld).
- Gesten: Ziehen (Spiegel an eine Stelle), Tippen.
- Fehlerkontrolle: Das Spiegelbild zeigt, was wirklich da ist; ein halbierter Spiegel an der falschen Stelle
  erzeugt ungleiche Hälften.
- Fehlerbilder: zaehlendes-rechnen (Übung: verdoppeln, zwillinge, fast-verdoppeln).
- Hauptthemen: verdoppeln-bis-10, halbieren-bis-10, zwillinge, halbieren-bis-20, fast-verdoppeln, verdoppeln-halbieren-bis-100, verdoppeln-halbieren-bis-1000 (Kl. 1–3)
- Weitere Zugänge: –
- Warum perfekt: Verdoppeln ist Spiegeln; Halbieren ist die Spiegelachse finden. In Kl. 2–3 werden Zehner und
  Einer getrennt gespiegelt, wie das Thema es verlangt.
- Bewusst nicht drin: verdoppeln-beim-mal → M36 (Verdoppeln einer Malaufgabe am Punktefeld).
- Stimme: wenig.
- Figuren: Ela zeigt vor; Kofi wundert sich, wo der Spiegel für die Hälfte stehen muss. Keine Zauberei: Der
  Spiegel ist echt (Fähigkeiten wirken nie auf Lernzeichen).
- Regal-Material: Perlenstab (zwillinge) passt; sonst Karte „doppelt“.
- Mach mit (am Rundenende, als Angebot): Ela hält einen Spiegel an drei Knöpfe. „Frag jemanden, ob ihr mit einem Spiegel Dinge verdoppelt.“
- Fachübergreifend: **Geometrie** (symmetrie-erkennen, symmetrie-ergaenzen nutzen denselben Spiegel; Auftraggeber
  führt zusammen oder trennt bewusst).

### M20 Streifenbrett
- Name fürs Kind: „Streifenbrett“ · Symbol: Brett 1–20 mit zwei Streifen
- Handlung: Das Kind tippt das Ergebnis einer Plus- oder Minusaufgabe bis 20 aus dem Gedächtnis; danach legen sich
  die beiden Streifen auf das Brett und zeigen, was die Zahl bedeutet · Wirkung: Ein Stück Weg (Steg, Zaun) wird so
  lang, wie das Ergebnis sagt.
- Material und Stufen: Montessori-Additions- und Subtraktionsstreifenbrett (angepasst: Streifen in den
  Perlenstabfarben mit Fünfergliederung statt rot und blau). material: Streifen legen, dann tippen. vorstellung:
  Streifen liegen verdeckt. kopf: nur Aufgabe; Streifen als Bedeutung danach (wie im Kettenhüpfer).
- Lernzeichen: Streifenbrett (neu, abgeleitet aus rot-blauen Stangen, Bilder-§12: hell/dunkel statt rot/blau).
- Gesten: Ziffern tippen.
- Fehlerkontrolle: Eine falsche Zahl bekommt ihren Ort auf dem Brett; die Streifen enden woanders.
- Fehlerbilder: zaehlendes-rechnen (gezielt: Lernsteuerung erkennt Zeitsignatur), rechenzeichen-verwechselt
  (gemischte Päckchen), null-regel-vertauscht.
- Hauptthemen: plus-0-und-1, plus-2-und-3, plus-mit-5, tauschaufgaben-bis-10, plus-bis-10-gemischt, minus-0-1-alles-weg, minus-bis-10-gemischt, blitzrechnen-bis-20 (Kl. 1)
- Weitere Zugänge: plus-uebergang-gemischt (M21), minus-uebergang-gemischt (M21)
- Warum perfekt: Das ist der Zugang „abrufen“ für alle Aufgaben bis 20, mit Paketen wie im Kettenhüpfer
  (+0/+1, +2/+3, +5, Tausch, gemischt). Das Ableiten über die 10 hat sein eigenes Spiel (M21).
- Bewusst nicht drin: erst-zur-10 → M21 (Ableiten), verdoppeln-bis-10 → M19.
- Stimme: wenig (Ergebnisse als Zahl).
- Figuren: Kofi zeigt vor; Lena wundert sich über einen Streifen, der zu weit reicht.
- Regal-Material: Perlenstab der Zahl (passt).
- Mach mit (am Rundenende, als Angebot): Kofi rechnet beim Spazierengehen im Kopf. „Frag jemanden, ob ihr euch beim Gehen Aufgaben stellt.“
- Fachübergreifend: –

### M21 Über die Zehn
- Name fürs Kind: „Über die Zehn“ · Symbol: Zwanzigerfeld, obere Reihe voll, unten drei
- Handlung: Das Kind legt die Aufgabe ins Zwanzigerfeld und rechnet über die 10, indem es zuerst die obere Reihe
  voll macht (oder zwei Fünfer zusammenschiebt) und den Rest unten legt; bei Minus erst bis zur 10 wegnehmen · Wirkung:
  Die volle Zehnerreihe rollt als Stange weg (wird zum Zehner), die Rechnung steht als Weg darunter.
- Material und Stufen: Zwanzigerfeld mit Fünferbruch, Plättchen in zwei Farben. material: Plättchen umlegen.
  vorstellung: Feld zu sehen, das Kind tippt erst die Zerlegung (8 + 2 + 3). kopf: Aufgabe, Weg wählen, Feld als
  Probe. Wege: erst zur 10, Fünfertrick, Tauschen; das Kind wählt (plus/minus-uebergang-gemischt).
- Lernzeichen: Zwanzigerfeld (M2).
- Gesten: Ziehen, Tippen.
- Fehlerkontrolle: Die obere Reihe ist erst voll, wenn genau 10 drin sind; ein Plättchen zu viel bleibt am Rand.
- Fehlerbilder: zehneruebergang-unsicher (gezielt), zaehlendes-rechnen (Übung: erst-zur-10, fuenfertrick).
- Hauptthemen: erst-zur-10, ueber-10-mit-8, ueber-10-mit-7, fuenfertrick, tauschen-ueber-10, plus-uebergang-gemischt, minus-ueber-10-bis-5, minus-ueber-10-ab-6, minus-uebergang-gemischt, aufgabe-am-zwanzigerfeld, rechenweg-nachlegen (Kl. 1)
- Weitere Zugänge: zwanzigerfeld (M04), umkehraufgaben-bis-20 (M16), fast-verdoppeln (M19), blitzrechnen-bis-20 (M20), ueber-10-mit-9 (M22)
- Warum perfekt: Der Zehnerübergang ist eine Umlegehandlung im Feld. Alle gleichwertigen Wege (außer der
  Hilfsaufgabe mit der 10, M22) sind Umlegungen desselben Felds, und rechenweg-nachlegen fragt genau danach.
- Bewusst nicht drin: ueber-10-mit-9 → M22 (über 10 + x − 1), fast-verdoppeln → M19.
- Stimme: mittel.
- Figuren: Lena zeigt vor; Timo wundert sich, wohin das letzte Plättchen soll.
- Regal-Material: Karte mit Zwanzigerfeld (neu) oder Perlenstab 10 + n.
- Mach mit (am Rundenende, als Angebot): Lena legt Knöpfe in einen Eierkarton mit zehn Plätzen. „Leg eine Aufgabe in einen Zehnerkarton und mach zuerst die Zehn voll.“
- Fachübergreifend: –

### M22 Eine Perle leihen
- Name fürs Kind: „Eine Perle leihen“ · Symbol: Neunerstab, daneben eine geliehene Perle, Pfeil zurück
- Handlung: Das Kind macht aus der 9 (29, 19) eine 10 (30, 20), indem es eine Perle leiht, rechnet mit der runden
  Zahl und gibt die Perle zurück; entweder an die Bank (Hilfsaufgabe) oder sofort aus der anderen Zahl
  (gegensinnig verändern) · Wirkung: Die geliehene Perle kehrt sichtbar zurück, die Bank ist wieder voll.
- Material und Stufen: Perlenstäbchen, Zehnerstäbe, eine „Leihperle“. material: Perle hinüberziehen und zurück.
  vorstellung: Leihperle nur als Marke. kopf: 46 + 29 = 46 + 30 − 1 als Zeile.
- Lernzeichen: Perlenstäbchen, goldenes Material; neu: Leihperle mit Ring (Sonnenring, Bilder-§6.2 Schicht 5).
- Gesten: Ziehen, Tippen.
- Fehlerkontrolle: Bleibt die Perle hängen (nicht zurückgegeben) oder wird sie in die falsche Richtung gegeben,
  ist die Bank nicht voll und das Ergebnis liegt um 2 daneben, sichtbar an zwei Perlen.
- Fehlerbilder: –
- Hauptthemen: ueber-10-mit-9, minus-9-ueber-minus-10, hilfsaufgabe-plus-minus, vereinfachen-plus-minus, gegensinnig-summe-bleibt (Kl. 1–2)
- Weitere Zugänge: –
- Warum perfekt: Hilfsaufgabe und gegensinniges Verändern sind dieselbe Idee „runde Zahl durch Leihen“. Die Richtung
  des Ausgleichs (bei Plus und Minus verschieden) ist das, was Kinder verwechseln; hier ist sie eine Bewegung.
- Bewusst nicht drin: differenz-bleibt-gleich → M18 (Minus gleichsinnig, beide Türme).
- Stimme: mittel.
- Figuren: Timo zeigt vor (leiht, gibt zurück, zögert bei der Richtung); Ela wundert sich, warum bei Minus plus 1.
- Regal-Material: Karte mit Neunerstab und Leihperle (neu).
- Mach mit (am Rundenende, als Angebot): Timo leiht sich eine Murmel und gibt sie zurück. „Rechne mit einer runden Zahl und gib danach zurück, was du geliehen hast.“
- Fachübergreifend: –

### M23 Klein und groß
- Name fürs Kind: „Klein und groß“ · Symbol: kleine Perlen 3 + 4, darunter Zehnerstäbe 3 + 4
- Handlung: Das Kind löst eine kleine Aufgabe mit Einern; dann werden alle Einer zu Zehnern (Hundertern,
  Tausendern) und es tippt die große Aufgabe · Wirkung: Die kleine Lösung „wächst“ sichtbar zur großen, ein
  kleines Modell wird zum großen Bau.
- Material und Stufen: goldenes Material. material: Einer legen, dann tauschen. vorstellung: nur die kleine
  Aufgabe ist gelegt. kopf: 64 + 3 → welche kleine Aufgabe hilft? Auch mal: 3 · 4 → 3 · 40, und mal 10 als
  „jedes Stück wird das nächstgrößere“.
- Lernzeichen: goldenes Material, Stellenwertfarben.
- Gesten: Tippen, Ziehen.
- Fehlerkontrolle: Getauscht wird nur Stück für Stück; die große Menge liegt dann neben der getippten Zahl.
- Fehlerbilder: ziffernweises-rechnen (Übung).
- Hauptthemen: plus-ohne-20, minus-ohne-20, zehnerzahlen-plus-minus, plus-einer-ohne-uebergang-bis-100, minus-einer-ohne-uebergang-bis-100, zehnerzahl-minus-einer, analoge-aufgabe-nutzen, hunderterzahlen-plus-minus, analog-ohne-uebergang-1000, zehner-einmaleins, analog-kopfrechnen-million, mal-geteilt-stufenzahlen (Kl. 1–4)
- Weitere Zugänge: –
- Warum perfekt: Alle Themen „wie 3 + 4“, „Zehner-Einmaleins“ und „mal 10, 100, 1000“ sind dieselbe Einsicht: Die
  Einheit ändert sich, die Rechnung nicht. Das Tauschen der Stücke ist diese Einsicht als Handlung.
- Bewusst nicht drin: plus-zehner-bis-100 → M12.
- Stimme: mittel.
- Figuren: Ela zeigt vor; Kofi wundert sich, dass 30 + 40 wie 3 + 4 geht.
- Regal-Material: Karte mit Einer und Zehnerstab (neu).
- Mach mit (am Rundenende, als Angebot): Ela legt Münzen 3 und 4, dann Zehner 3 und 4. „Rechne mit Cent und dann mit Zehn-Cent-Münzen dieselbe Aufgabe.“
- Fachübergreifend: –

### M24 Rechenstrich
- Name fürs Kind: „Rechenstrich“ · Symbol: Strich mit zwei Bögen
- Handlung: Das Kind zerlegt die zweite Zahl und springt in Schritten am leeren Rechenstrich (erst Zehner, dann
  bis zum Zehner, dann Rest), oder liest einen fertigen Strich als Aufgabe · Wirkung: Ein Frosch oder Boot springt die
  Bögen mit, die Ankunft ist der Hafen mit der Ergebniszahl.
- Material und Stufen: leerer Rechenstrich mit Bögen; in material zusätzlich goldenes Material über dem Strich.
  vorstellung: Strich mit Zehnermarken. kopf: leerer Strich, das Kind zeichnet Bögen durch Tippen der Zwischenziele.
  Kl. 3: Hunderter- und Zehnerbögen.
- Lernzeichen: Rechenstrich (neu im Bestand; abgeleitet vom Zahlenstrahl M6, ohne Maßstab).
- Gesten: Tippen (Zielpunkt eines Bogens), Ziffern tippen.
- Fehlerkontrolle: Ein Bogen, der über einen Zehner springt, ohne ihn zu benennen, landet sichtbar zu weit; das
  Material über dem Strich zeigt den echten Stand.
- Fehlerbilder: zaehlendes-rechnen, ziffernweises-rechnen, kleiner-von-groesser (gezielt), zehneruebergang-unsicher.
- Hauptthemen: plus-ueber-den-zehner-bis-100, minus-ueber-den-zehner-bis-100, plus-bis-30, minus-bis-30, plus-zweistellig-ohne-uebergang, minus-zweistellig-ohne-uebergang, plus-zweistellig-mit-uebergang, minus-zweistellig-mit-uebergang, plus-bis-100, minus-bis-100, schrittweise-rechenstrich, rechenstrich-lesen, uebergang-zehner-hunderter, halbschriftlich-plus-minus-1000 (Kl. 2–3)
- Weitere Zugänge: stellenweise-rechnen (M26), plus-zehner-bis-100 (M12)
- Warum perfekt: Schrittweise rechnen ist der Hauptweg bis 100 und halbschriftlich bis 1000; der Rechenstrich ist
  seine Darstellung. Alle Aufgabentypen bis 100 (mit und ohne Übergang) laufen hier als Pakete.
- Bewusst nicht drin: stellenweise-rechnen → M26 (Stellen getrennt, Markenspiel), hilfsaufgabe-plus-minus → M22.
- Stimme: mittel.
- Figuren: Kofi zeigt vor; Lena wundert sich über einen Bogen, der zu weit reicht.
- Regal-Material: Karte mit Rechenstrich (neu).
- Mach mit (am Rundenende, als Angebot): Kofi malt einen Strich mit Bögen auf Papier. „Mal einen Strich und spring in Bögen, so wie im Spiel.“
- Fachübergreifend: –

### M25 Welcher Weg?
- Name fürs Kind: „Welcher Weg?“ · Symbol: Wegweiser mit drei Armen
- Handlung: Vor einer Aufgabe wählt das Kind einen Rechenweg (Rechenstrich, Perle leihen, hochzählen, stellenweise,
  schriftlich, Taschenrechner) und rechnet ihn dann · Wirkung: Die Runde nimmt den gewählten Pfad; danach zeigt eine
  Karte alle Pfade nebeneinander mit der Zahl der Schritte.
- Material und Stufen: Pfadkarte mit den Werkzeugen der Spiele M21, M22, M24, M26 als kleine Symbole. material:
  der gewählte Weg wird mit seinem Material gerechnet. vorstellung: nur Pfad und Zwischenschritte. kopf: nur wählen und
  begründen (Karte „weil die 29 fast 30 ist“).
- Lernzeichen: die Lernzeichen der Spiele, deren Wege gewählt werden; neu: Wegwahl-Karte.
- Gesten: Tippen.
- Fehlerkontrolle: Jeder Weg führt zum Ziel, wenn richtig gerechnet; der Vergleich der Schritte zeigt, welcher
  kürzer war. Es gibt keinen „falschen“ Weg, nur längere (bewertet wird das Ergebnis, nicht die Wahl).
- Fehlerbilder: –
- Hauptthemen: rechenweg-waehlen-bis-100, rechenwege-vergleichen, kopf-oder-schriftlich, taschenrechner-wann (Kl. 2–3)
- Weitere Zugänge: plus-uebergang-gemischt (M21), minus-uebergang-gemischt (M21), plus-zweistellig-mit-uebergang (M24), halbschriftlich-plus-minus-1000 (M24), rechenwege-zuordnen (M34)
- Warum perfekt: Rechenweg wählen ist eine eigene Kompetenz, die das Kind erst festlegt (L2) und dann am Ergebnis
  sieht. „Im Kopf oder schriftlich“ und „Taschenrechner“ sind dieselbe Wahl auf einer anderen Stufe.
- Bewusst nicht drin: rechenwege-zuordnen → M34 (Wege von anderen erklären).
- Stimme: mittel.
- Figuren: Lena zeigt vor; Timo wundert sich, dass der kurze Weg nicht der erste war. Die Runde wählt manchmal
  selbst verschiedene Wege nebeneinander (zeigt: viele Wege sind gleichwertig).
- Regal-Material: Karte mit Wegweiser (neu).
- Mach mit (am Rundenende, als Angebot): Lena und Timo rechnen dieselbe Aufgabe auf zwei Wegen. „Frag jemanden, wie er rechnet, und vergleicht eure Wege.“
- Fachübergreifend: –

### M26 Markenspiel
- Name fürs Kind: „Markenspiel“ · Symbol: Spalten mit Marken 1, 10, 100
- Handlung: Das Kind legt beide Zahlen mit Marken in Spalten, rechnet von rechts Stelle für Stelle, tauscht zehn
  Marken gegen eine größere (Übertrag) oder eine größere gegen zehn kleinere (Entbündeln) und schreibt die Ziffer ·
  Wirkung: Die Lieferung ist zusammengestellt bzw. aus dem Lager genommen, die Kisten stehen da.
- Material und Stufen: erst goldenes Material (M4: stellenweise rechnen, Kl. 2), dann Markenspiel (Kl. 3, erst nach
  sicherem Bündeln), dann schriftliches Verfahren. material: tauschen sichtbar. vorstellung: Marken nur gezählt, das
  Kind schreibt den Übertrag als kleine Ziffer. kopf: Verfahren mit Ziffern, Marken als Probe; Kl. 4 große Zahlen.
- Lernzeichen: goldenes Material, Markenspiel (M4), Stellenwertfarben.
- Gesten: Ziehen (Marken), Tippen (tauschen, Ziffern).
- Fehlerkontrolle: Mehr als neun Marken passen nicht in eine Spalte; bei Minus fehlen Marken zum Wegnehmen, bis das
  Kind entbündelt. Eine Null-Spalte ist leer und zwingt zum Entbündeln von weiter links.
- Fehlerbilder: uebertrag-vergessen (gezielt), kleiner-von-groesser (gezielt), entbuendeln-ueber-null (gezielt),
  ziffernweises-rechnen.
- Hauptthemen: stellenweise-rechnen, stellengerecht-untereinander, schriftlich-plus-ohne-uebertrag, schriftlich-plus-uebertrag, schriftlich-plus-mehrere-uebertraege, schriftlich-plus-drei-summanden, schriftlich-minus-ohne-entbuendeln, entbuendeln-zehner, entbuendeln-hunderter, zweifach-entbuendeln, entbuendeln-ueber-null, probe-schriftlich-minus, schriftlich-plus-minus-million (Kl. 2–4)
- Weitere Zugänge: plus-zweistellig-mit-uebergang (M24), plus-zweistellig-ohne-uebergang (M24), ueberschlag-plus-minus (M42), geld-mit-komma-rechnen (M43), anna-zahlen (M28)
- Warum perfekt: Schriftlich rechnen ist stellenweise rechnen mit Tauschen. Das Markenspiel ist dafür gebaut, und
  die drei häufigsten Fehlerbilder der Kl. 3 entstehen genau an den Tauschstellen.
- Bewusst nicht drin: schriftlich-mal-* → M39 (andere Tauschlogik).
- Stimme: wenig.
- Figuren: Ela zeigt vor (tauscht, vergisst einmal die kleine Ziffer, findet es an der vollen Spalte); Kofi wundert
  sich über die leere Null-Spalte.
- Regal-Material: Karte mit drei Marken 1/10/100 (neu).
- Mach mit (am Rundenende, als Angebot): Ela rechnet mit Münzen 1, 10 und 100 Cent. „Tausch zehn Cent-Münzen gegen eine Zehn-Cent-Münze, so wie im Spiel.“
- Fachübergreifend: –

### Teil C: Muster, Formate, Begründen

### M27 Gleiche Sprünge
- Name fürs Kind: „Gleiche Sprünge“ · Symbol: Strahl mit drei gleichen Bögen
- Handlung: Das Kind erkennt die Sprungweite einer Folge und setzt sie fort, vorwärts oder rückwärts · Wirkung: Ein
  Tier springt die Folge entlang und erreicht sein Ziel (ein Känguru, ein Grashüpfer).
- Material und Stufen: Zahlenstrahl mit Sprungbögen. material: Bögen sind sichtbar. vorstellung: nur die Zahlen
  der Folge. kopf: Folgen mit zwei Regeln (1, 4, 7 …; Kl. 3 auch +3, −1 abwechselnd), Formenfolgen in Kl. 1.
- Lernzeichen: Zahlenstrahl (M6).
- Gesten: Ziffern tippen.
- Fehlerkontrolle: Die getippte Zahl wird als Sprung gezeigt; ein ungleicher Sprung ist sichtbar länger.
- Fehlerbilder: –
- Hauptthemen: zahlenfolgen-bis-20, in-schritten-zaehlen-bis-100, zaehlen-grosse-schritte, zahlenfolgen-zahleigenschaften, muster-regel-finden (Kl. 1–3)
- Weitere Zugänge: –
- Warum perfekt: Zählen in Schritten und Zahlenfolgen sind beide „gleiche Sprünge“. Die Sprungweite als Länge
  macht die Regel sichtbar.
- Bewusst nicht drin: zweierreihe usw. → M37 (Einmaleins auf der Perlenkette).
- Stimme: wenig.
- Figuren: Timo zeigt vor; Ela wundert sich über einen zu langen Sprung.
- Regal-Material: Karte mit drei Bögen (neu).
- Mach mit (am Rundenende, als Angebot): Timo hüpft in großen Schritten über Fliesen. „Hüpf in gleichen Sprüngen und zähl mit.“
- Fachübergreifend: Geometrie (formen-muster-fortsetzen; Formenfolgen nur im Kl.-1-Thema muster-regel-finden).

### M28 Muster-Päckchen
- Name fürs Kind: „Muster-Päckchen“ · Symbol: Treppe aus vier Aufgabenzeilen
- Handlung: Das Kind setzt ein Päckchen zusammenhängender Aufgaben fort, markiert mit Pfeilen (+1, −1), was sich
  ändert, und findet die Aufgabe, die das Muster stört · Wirkung: Jede passende Zeile setzt eine Stufe an eine
  Treppe; die störende fällt beim Antippen heraus und findet ihren Platz.
- Material und Stufen: Aufgabenzeilen, darunter Plättchen-Reihen. material: Plättchen wandern sichtbar von Zeile zu
  Zeile. vorstellung: nur Pfeile. kopf: Zeilen, ANNA-Zahlen in Kl. 4.
- Lernzeichen: Plättchen; neu: Veränderungspfeil (+1/−1) als Lernzeichen.
- Gesten: Tippen, Ziffern tippen, Ziehen (Pfeil).
- Fehlerkontrolle: Eine Zeile, die das Muster bricht, passt nicht an die Treppe.
- Fehlerbilder: –
- Hauptthemen: paeckchen-mit-muster, paeckchen-muster-bis-100, passt-nicht-ins-muster, pfeile-und-farben-im-paeckchen, gleichsinnig-veraendern, anna-zahlen (Kl. 1–4)
- Weitere Zugänge: gegensinnig-summe-bleibt (M22), differenz-bleibt-gleich (M18), vermutung-aufstellen (M33), muster-regel-finden (M27)
- Warum perfekt: Operative Päckchen leben vom Vergleich benachbarter Aufgaben. Pfeile und wachsende Treppe machen
  den Vergleich zur Handlung.
- Bewusst nicht drin: vermutung-testen → M33 (Begründen über das Päckchen hinaus).
- Stimme: mittel.
- Figuren: Kofi zeigt vor; Lena wundert sich über die Stufe, die nicht passt.
- Regal-Material: Karte mit Treppe (neu).
- Mach mit (am Rundenende, als Angebot): Kofi schreibt ein Päckchen an die Tafel. „Erfinde ein Päckchen mit Muster für jemanden zum Fortsetzen.“
- Fachübergreifend: –

### M29 Zahlenmaschine
- Name fürs Kind: „Zahlenmaschine“ · Symbol: Kette aus drei Kästen mit Pfeilen
- Handlung: Das Kind schickt eine Zahl durch eine Kette von Maschinen (+5, −3, ·2) und tippt jedes Zwischenergebnis,
  oder rechnet vom Ende rückwärts zur Startzahl · Wirkung: Am Ende kommt das gewünschte Ding heraus (Saft, Brot,
  Stoff); rückwärts kommt die Zahl genau aus dem ersten Rohr.
- Material und Stufen: Maschinenkette, Plättchen fahren auf einem Band mit. material: Plättchen sichtbar. vorstellung:
  Plättchen nur beim ersten und letzten Kasten. kopf: nur Pfeile; Kl. 4: eigene Rechenvorschrift befolgen und prüfen.
- Lernzeichen: Plättchen; neu: Maschinenkasten mit Rechenkarte.
- Gesten: Ziffern tippen.
- Fehlerkontrolle: Mit einer falschen Zwischenzahl kommt am Ende etwas anderes heraus; rückwärts stimmt die Probe
  vorwärts nicht.
- Fehlerbilder: rechenzeichen-verwechselt (Rückwärtsrechnen kehrt das Zeichen um).
- Hauptthemen: rechenkette-bis-10, zahlenkette-rueckwaerts, rueckwaerts-geschichte, vorwaerts-rueckwaerts-kombinieren, rueckwaerts-rechnen-sachaufgabe, algorithmus-befolgen (Kl. 1–4)
- Weitere Zugänge: mauer-dreieck-kette-bis-20 (M30), zahlenmauer-rechendreieck-bis-100 (M30), sachaufgabe-zwei-rechenschritte (M41), gewinnstrategie (M56)
- Warum perfekt: Rechenketten und Rückwärtsrechnen sind dieselbe Kette in zwei Richtungen; Sachaufgaben „rückwärts“
  sind Ketten mit Geschichte.
- Bewusst nicht drin: zahlenmauer-* → M30.
- Stimme: mittel.
- Figuren: Lena zeigt vor; Timo wundert sich, warum rückwärts aus plus minus wird. Gäste: die Müllerin.
- Regal-Material: Karte mit Pfeil und Kasten (neu).
- Mach mit (am Rundenende, als Angebot): Lena spielt Maschine: ein Kind sagt eine Zahl, sie ruft plus zwei. „Frag jemanden, ob ihr Zahlenmaschine spielt.“
- Fachübergreifend: –

### M30 Zahlenmauer
- Name fürs Kind: „Zahlenmauer“ · Symbol: Mauer aus sechs Steinen
- Handlung: Das Kind trägt Steine ein: oben die Summe der beiden darunter, unten fehlende mit Minus; später wählt es
  Grundsteine selbst für einen Zieldeckstein · Wirkung: Die Mauer wird gebaut und trägt etwas (Dach, Brücke);
  ein Stein, der nicht passt, sitzt schief und lässt sich nicht verfugen.
- Material und Stufen: Steine mit Zahlen; material: unter den Steinen Perlenstäbchen. vorstellung: nur Zahlen, Stäbe
  als Probe. kopf: Mauern bis 1000, Lücken verteilt, Unbekannte; probieren-und-pruefen: der Deckstein zeigt
  „zu groß / zu klein“.
- Lernzeichen: Perlenstäbchen; neu: Zahlenmauer als Lernzeichen (Steine in Papier, Tinte-Kontur).
- Gesten: Tippen, Ziffern tippen, Ziehen (Grundsteine anordnen).
- Fehlerkontrolle: Der Stein darüber zeigt sofort die Summe, die aus den eingesetzten Zahlen folgt; ein falscher
  Stein macht den Deckstein falsch.
- Fehlerbilder: –
- Hauptthemen: zahlenmauer-bis-10, mauer-dreieck-kette-bis-20, probieren-und-pruefen, zahlenmauer-von-oben, zahlenmauer-rechendreieck-bis-100, zahlenmauer-ziel-erreichen, mittelstein-zaehlt-doppelt, groesster-kleinster-deckstein, zahlenmauern-bis-1000, zahlenmauer-luecken-verteilt, mittelstein-begruenden, zahlenmauer-unbekannte, knobelaufgabe-erfinden (Kl. 1–4)
- Weitere Zugänge: –
- Warum perfekt: Alle Mauerthemen von Kl. 1 bis 4 (rechnen, rückwärts, Ziel, Mittelstein, Unbekannte, eigene
  Mauer) sind dieselbe Mauer. Der Mittelstein zählt doppelt: sichtbar, weil er zwei Steine stützt.
- Bewusst nicht drin: rechendreieck-* → M31 (andere Struktur).
- Stimme: wenig.
- Figuren: Timo zeigt vor; Ela wundert sich, dass sich oben zwei ändert, wenn sie den Mittelstein um eins erhöht.
- Regal-Material: Karte mit drei Steinen als kleine Mauer (neu).
- Mach mit (am Rundenende, als Angebot): Timo baut eine Mauer aus Bechern mit Zahlenzetteln. „Bau eine Mauer aus Bechern und schreib die Zahlen drauf.“
- Fachübergreifend: –

### M31 Rechendreieck
- Name fürs Kind: „Rechendreieck“ · Symbol: Dreieck mit drei Innenfeldern
- Handlung: Das Kind legt Plättchen in die drei Innenfelder; jede Außenzahl ist die Summe der zwei angrenzenden ·
  Wirkung: Das Dreieck schließt sich zu einem Segel, Drachen oder Dach.
- Material und Stufen: Rechendreieck mit Plättchen. material: Plättchen legen. vorstellung: Zahlen, Plättchen als
  Probe. kopf: rückwärts von den Außenzahlen, und erkennen, wann es keine Lösung gibt.
- Lernzeichen: Plättchen; neu: Rechendreieck.
- Gesten: Tippen, Ziehen.
- Fehlerkontrolle: Die Außenzahl ergibt sich aus den gelegten Plättchen; passt sie nicht, steht die richtige
  daneben.
- Fehlerbilder: gleichheitszeichen-ergibt (als Zugang: Außen = Innen + Innen).
- Hauptthemen: rechendreieck-bis-10, rechendreieck-mit-luecken, rechendreieck-rueckwaerts, unmoegliche-aufgabe (Kl. 1–3)
- Weitere Zugänge: mauer-dreieck-kette-bis-20 (M30), zahlenmauer-rechendreieck-bis-100 (M30), zahlenmauern-bis-1000 (M30)
- Warum perfekt: Rechendreiecke sind die Struktur, in der jedes Feld zu zwei Summen gehört. Rückwärts und
  „unmöglich“ folgen genau aus dieser Struktur.
- Bewusst nicht drin: zahlenmauer-* → M30.
- Stimme: wenig.
- Figuren: Ela zeigt vor; Kofi wundert sich über ein Dreieck, das nicht aufgeht.
- Regal-Material: Karte mit Dreieck (neu).
- Mach mit (am Rundenende, als Angebot): Ela legt ein Dreieck aus Stiften. „Leg ein Dreieck aus Stiften und Münzen in die Ecken.“
- Fachübergreifend: –

### M32 Zauberquadrat
- Name fürs Kind: „Zauberquadrat“ · Symbol: 3 × 3 Gitter mit Zahlen
- Handlung: Das Kind ergänzt fehlende Zahlen, sodass jede Reihe, Spalte und Diagonale dieselbe Summe hat, und
  verändert ein Quadrat (alle +1) · Wirkung: Das Quadrat leuchtet als Fenster auf; die Runde zaubert damit ein
  Beet wachsen (Fähigkeit: verzaubern, wirkt nur auf die Szene).
- Material und Stufen: Gitter 3 × 3. material: Plättchen in Feldern. vorstellung: Summen am Rand. kopf: nur Zahlen.
- Lernzeichen: neu: Gitter 3 × 3 (Papier, Tinte-Kontur).
- Gesten: Tippen, Ziffern tippen.
- Fehlerkontrolle: Die Summen am Rand jeder Reihe zeigen, wo es nicht aufgeht.
- Fehlerbilder: –
- Hauptthemen: magisches-quadrat-ergaenzen, magisches-quadrat-veraendern (Kl. 3)
- Weitere Zugänge: –
- Warum perfekt: Beide Themen sind am Zauberquadrat definiert; eine andere Handlung gibt es dafür nicht.
- Bewusst nicht drin: –
- Stimme: wenig.
- Figuren: Kofi zeigt vor; Lena wundert sich über eine Spalte mit anderer Summe.
- Regal-Material: Karte mit 3 × 3 Gitter (neu).
- Mach mit (am Rundenende, als Angebot): Kofi zeichnet ein Gitter mit neun Feldern. „Zeichne ein Gitter und probier ein Zauberquadrat für jemanden.“
- Fachübergreifend: –

### M33 Stimmt das?
- Name fürs Kind: „Stimmt das?“ · Symbol: Zettel mit Fragezeichen und Lupe
- Handlung: Auf einem Zettel steht eine Behauptung oder eine Rechnung („4 + 3 ist mehr als 8“, „38 + 5 = 33“, „Minus
  macht kleiner“); das Kind prüft sie mit Material, legt einen Beleg oder ein Gegenbeispiel und stempelt „stimmt“,
  „stimmt nicht“, bei allgemeinen Sätzen „immer“, „manchmal“, „nie“ · Wirkung: Der Zettel kommt in das passende Fach
  des Forscherhefts; bei „stimmt nicht“ tippt das Kind die falsche Stelle und die Ursache.
- Material und Stufen: Plättchen, Perlen, Rechenstrich je nach Aussage. material: belegen mit Material.
  vorstellung: erst festlegen, dann prüfen (L2). kopf: Beweis „allgemein statt Beispiel“ (Kl. 4) mit Plättchenbild.
- Lernzeichen: wie in der Aussage; neu: Behauptungszettel und drei Stempel.
- Gesten: Tippen, Ziehen.
- Fehlerkontrolle: Der Beleg mit Material zeigt es; ein Gegenbeispiel kippt die Behauptung sichtbar
  (Zettel wird durchgestrichen). Gefühls- oder Meinungsfragen gibt es hier nicht.
- Fehlerbilder: alle Rechen-Fehlerbilder als Material für Zettel (z. B. kleiner-von-groesser bei 61 − 4 = 63,
  ziffernweises-rechnen), damit das Kind sie bei anderen findet.
- Hauptthemen: aussage-pruefen, mit-plaettchen-zeigen, begruendung-waehlen, vermutung-aufstellen, vermutung-testen, gegenbeispiel-finden, immer-manchmal-nie, fehler-finden-rechnen, fehlerursache-finden, rechenfehler-finden-bis-100, passt-die-begruendung, allgemein-statt-beispiel, anna-zahlen-erklaeren (Kl. 1–4)
- Weitere Zugänge: tauschaufgaben-bis-10 (M20), probe-umkehraufgabe-bis-100 (M16), passt-nicht-ins-muster (M28), gleichsinnig-veraendern (M28), mittelstein-begruenden (M30), teiler-begruenden (M37), gewinnchance-begruenden (M54)
- Warum perfekt: Prüfen, Belegen, Gegenbeispiel, Fehler finden: immer derselbe Zettel und dieselbe Probe am
  Material. So wird Begründen eine Handlung und kein Aufsatz.
- Bewusst nicht drin: mittelstein-begruenden → M30 (Begründung an der Mauer selbst).
- Stimme: **viel** (jede Behauptung ein eigener Satz; als Satzbank).
- Figuren: Lena zeigt vor; Timo wundert sich über eine Behauptung, die „manchmal“ stimmt. Fehlerhafte Rechnungen
  stammen von einem Kind der Runde, das zögert und dann selbst nachprüft (Bewältigungsmodell, F6), nie als
  Bloßstellung.
- Regal-Material: Karte mit Lupe (neu).
- Mach mit (am Rundenende, als Angebot): Lena prüft eine Behauptung mit Bohnen. „Stell jemandem eine Behauptung und prüft sie zusammen mit Bohnen.“
- Fachübergreifend: Grammatik/Schreiben (Fehler finden) nur entfernt.

### M34 So geht es
- Name fürs Kind: „So geht es“ · Symbol: drei Wortkarten in einer Reihe mit Pfeil
- Handlung: Das Kind ordnet Erklärkarten („Zuerst …“, „Dann …“, „Zum Schluss …“), wählt Fachwörter für einen
  Lückensatz oder übersetzt einen Satz in eine Rechnung · Wirkung: Ein Kind der Runde führt die Erklärung wörtlich
  mit Material aus; ist sie richtig geordnet, kommt das Ergebnis heraus.
- Material und Stufen: Wortkarten (vorgelesen), Material des erklärten Wegs. material: die Figur führt jede Karte
  sofort aus. vorstellung: erst die ganze Erklärung legen, dann ausführen lassen. kopf: Rechenweg notieren (Kl. 4),
  Erklärung für Jüngere zusammenstellen; Mathe-Konferenz als Zwei-Personen-Teil (N10).
- Lernzeichen: Rechenkarten, Wortkarten (Lernzeichen Deutsch ohne Wortartsymbole).
- Gesten: Ziehen (Karten ordnen), Tippen.
- Fehlerkontrolle: Die Figur macht genau, was die Karten sagen; in falscher Reihenfolge entsteht ein anderes
  Ergebnis, sichtbar am Material.
- Fehlerbilder: rechenzeichen-verwechselt (Übung: rechenzeichen-lesen).
- Hauptthemen: muster-in-worten, rechenzeichen-lesen, mathe-fachwoerter, erklaerung-ordnen, forscherbericht-ergaenzen, rechenwege-zuordnen, sprache-zu-rechnung, erklaeren-fuer-juengere, mathe-konferenz, rechenweg-notiz (Kl. 1–4)
- Weitere Zugänge: rechenweg-waehlen-bis-100 (M25), rechenweg-nachlegen (M21), algorithmus-befolgen (M29)
- Warum perfekt: Mathe-Sprache verstehen heißt: Worte bewirken eine Rechnung. Wenn eine Figur die Worte ausführt,
  zeigt die Sache, ob die Erklärung trägt.
- Bewusst nicht drin: rechenweg-waehlen-bis-100 → M25.
- Stimme: **viel** (Karten- und Lückensätze, Fachwörter).
- Figuren: Kofi zeigt vor; das ausführende Kind wechselt reihum. Es wundert sich, wenn die Erklärung etwas anderes
  ergibt.
- Regal-Material: Karte mit Wortkarte und Gleichheitszeichen (neu).
- Mach mit (am Rundenende, als Angebot): Timo erklärt einem kleineren Kind eine Aufgabe. „Erklär jemandem deinen Rechenweg, Schritt für Schritt.“
- Fachübergreifend: **Sprechen und Zuhören** (erklären, Reihenfolge-Wörter), Lesen (Wortkarten lesen). Kandidat zum
  Zusammenführen.

### Teil D: Mal und Geteilt

### M35 Tüten packen
- Name fürs Kind: „Tüten packen“ · Symbol: drei Tüten mit je vier Punkten
- Handlung: Das Kind packt je k Dinge in eine Tüte, Teller oder Kiste; entweder ist die Zahl der Tüten gegeben (mal)
  oder gesucht (aufteilen), am Ende bleibt manchmal ein Rest · Wirkung: Die Tüten werden verteilt; der Rest bleibt
  sichtbar liegen oder braucht eine eigene Tüte (17 Kinder, 5 je Auto: das vierte Auto fährt halb leer).
- Material und Stufen: Plättchen und Behälter. material: packen. vorstellung: Behälter mit Umriss, das Kind tippt
  erst die Zahl. kopf: Aufgabe „_ · 4 = 12“ bzw. „17 : 5 = _ Rest _“.
- Lernzeichen: Plättchen; neu: Behälter-Umriss (schlicht, als Lernzeichen, nicht als Gegenstand).
- Gesten: Ziehen (mehrere: Tipp-Alternative je Plättchen), Tippen.
- Fehlerkontrolle: Eine Tüte mit k − 1 schließt sich nicht; der Rest ist kleiner als k, sonst passt noch eine Tüte.
- Fehlerbilder: null-regel-vertauscht (gezielt: 5 Teller mit je 0 Keksen).
- Hauptthemen: gleich-grosse-gruppen, malaufgabe-zum-bild, mal-eins-mal-null, aufteilen-in-gruppen, teilen-mit-rest, teilen-mit-rest-sicher, ergebnis-zur-situation (Kl. 2–3)
- Weitere Zugänge: mal-oder-geteilt (M17)
- Warum perfekt: Gleich große Gruppen bilden ist die Grundhandlung des Malnehmens und des Aufteilens. Der Rest und
  seine Deutung in der Sache entstehen genau hier.
- Bewusst nicht drin: gerecht-verteilen → M38 (Verteilen ist die andere Handlung: reihum austeilen).
- Stimme: mittel.
- Figuren: Ela zeigt vor; Kofi wundert sich über den Rest.
- Regal-Material: Karte mit drei Gruppen (neu) oder Perlenstab k.
- Mach mit (am Rundenende, als Angebot): Ela packt Kekse zu je drei in Tütchen. „Pack Dinge in gleich große Gruppen und sag die Malaufgabe.“
- Fachübergreifend: –

### M36 Punktefeld
- Name fürs Kind: „Punktefeld“ · Symbol: Rechteck aus 3 × 5 Punkten, ein Schnitt
- Handlung: Das Kind legt ein Punktefeld zu einer Malaufgabe, dreht es (Tausch), nimmt eine Reihe dazu oder weg
  (Nachbaraufgabe), verdoppelt es oder schneidet es in Zehner- und Einerteile (halbschriftlich, Malkreuz) · Wirkung:
  Das Feld wird ein Beet, ein Fenster oder ein Parkplatz, jedes Teil passt an seinen Platz.
- Material und Stufen: Punktefeld mit Fünfergliederung, Abdeckwinkel. material: Reihen ziehen. vorstellung: Feld
  teilweise verdeckt, nur Ränder beschriftet. kopf: Malkreuz mit Zahlen, Feld als Probe; Punkt vor Strich:
  Feld plus einzelne Punkte.
- Lernzeichen: Punktefeld (Plättchen, M2-Gliederung); neu: Abdeckwinkel und Schnittlinie.
- Gesten: Ziehen (Winkel, Schnitt), Tippen.
- Fehlerkontrolle: Ein Schnitt, der nicht aufgeht, lässt Punkte übrig oder doppelt; das gedrehte Feld deckt das
  alte genau.
- Fehlerbilder: einmaleins-nachbar (Übung: nachbaraufgabe-mal, verdoppeln-beim-mal, quadrataufgaben).
- Hauptthemen: punktefeld-reihen-spalten, tauschaufgaben-mal, malaufgabe-als-punktefeld, mal-tausch-begruenden, nachbaraufgabe-mal, verdoppeln-beim-mal, quadrataufgaben, quadratzahlen, punkt-vor-strich, halbschriftlich-mal, halbschriftlich-mal-geteilt-million, loesungsweg-weiterentwickeln (Kl. 2–4)
- Weitere Zugänge: kernaufgaben-einmaleins (M37), gleich-grosse-gruppen (M35), terme-vergleichen (M10), halbschriftlich-geteilt (M38)
- Warum perfekt: Alle Ableitungen beim Malnehmen sind Veränderungen eines Rechtecks. Halbschriftlich mal ist
  derselbe Schnitt mit größeren Zahlen; das bündelt Kl. 2 bis 4.
- Bewusst nicht drin: einmaleins-gemischt → M37 (Abruf).
- Stimme: wenig.
- Figuren: Lena zeigt vor; Timo wundert sich, dass das gedrehte Feld gleich viele hat.
- Regal-Material: Karte mit Punktefeld (neu).
- Mach mit (am Rundenende, als Angebot): Kofi zeigt auf ein Fenster mit Scheiben in Reihen. „Such Dinge in Reihen und Spalten: Fenster, Kacheln, Eierkarton.“
- Fachübergreifend: **Geometrie** (flaechen-auslegen, flaecheninhalt-kaestchen nutzen dasselbe Rechteck).

### M37 Kettenhüpfer
- Name fürs Kind: „Kettenhüpfer“ · Symbol: Einkaufskorb (Christian, 2026-11-14: Kopfform der Figur des Spiels)
- Handlung: Das Kind tippt das Ergebnis einer Malaufgabe; danach hüpft das Zählpfeilchen a Stäbchen weit über die Kette von
  n. Beim Teilen fragt das Spiel, wie viele Sprünge bis zu einem Pfeilchen nötig sind (35 auf der Fünferkette), und bei
  Teilern, auf welchen Ketten die 24 ein Pfeilchen hat · Wirkung: Das Pfeilchen wird gesetzt, die Kette wächst (wie im
  Spec 2026-11-13), und je Stäbchen kommt eine Packung in den Vorratskorb (Christian, 2026-11-14).
- Material und Stufen: kurze Montessori-Perlenketten mit 10 Stäbchen und Pfeilchen (Spec). material: hüpfen
  zählen. vorstellung: Kette verdeckt bis auf Pfeilchen. kopf: nur Aufgabe, Kette als Bedeutung danach.
- Lernzeichen: Perlenstäbchen und Perlenketten (M3, Kettenhüpfer-Spec).
- Gesten: Ziffern tippen.
- Fehlerkontrolle: Eine falsche Zahl bekommt ihren Ort auf der Kette; sechs Sprünge über die Siebenerkette enden
  woanders als 48.
- Fehlerbilder: einmaleins-nachbar (gezielt), einmaleins-hochzaehlen (gezielt über die Lösezeit).
- Hauptthemen: zweierreihe, zehnerreihe, fuenferreihe, kernaufgaben-einmaleins, viererreihe, achterreihe, dreierreihe, sechserreihe, neunerreihe, siebenerreihe, einmaleins-gemischt, einmaleins-sicher, geteilt-umkehrung-mal, geteilt-durch-2-5-10, geteilt-alle-reihen, teiler-vielfache, teiler-begruenden (Kl. 2–4)
- Weitere Zugänge: in-schritten-zaehlen-bis-100 (M27), nachbaraufgabe-mal (M36), verdoppeln-beim-mal (M36), quadrataufgaben (M36), quadratzahlen (M36), gleich-grosse-gruppen (M35), aufteilen-in-gruppen (M35), teilen-mit-rest (M35), zehner-einmaleins (M23)
- Warum perfekt: Das Spec begründet den Abruf mit Kernaufgaben zuerst; Teilen ist dieselbe Kette mit gesuchter
  Sprungzahl, Teiler und Vielfache sind die Pfeilchen verschiedener Ketten.
- Bewusst nicht drin: nachbaraufgabe-mal → M36 (Ableiten am Feld; hier nur als Hilfe).
- Stimme: mittel (Ergebnisse bis 100).
- Figuren: Timo zeigt vor (trägt Packungen auf dem Schoß). Die Figur des Spiels ist der Einkaufskorb (kein Kind der Runde, `grundsaetze-bilder.md` §16); die hüpfende Figur entfällt, es hüpft das Zählpfeilchen.
- Regal-Material: Perlenkette n bzw. Perlenstab n (passt).
- Mach mit (am Rundenende, als Angebot): Lena legt eine Kette aus Büroklammern. „Frag jemanden, ob ihr eine Kette aus Klammern in Fünfern legt.“
- Fachübergreifend: –

### M38 Gerecht verteilen
- Name fürs Kind: „Gerecht verteilen“ · Symbol: drei Teller, auf jedem gleich viele
- Handlung: Das Kind verteilt reihum auf n Teller; bei großen Zahlen verteilt es erst die Hunderter, dann die
  Zehner, tauscht, was nicht aufgeht, in kleinere Stücke und verteilt weiter (halbschriftlich und schriftlich
  geteilt) · Wirkung: Jeder Teller bekommt gleich viel, die Gäste können essen; der Rest bleibt in der Mitte.
- Material und Stufen: Plättchen, dann goldenes Material bzw. Marken (Montessori-Division mit Kegeln).
  material: reihum austeilen. vorstellung: erst festlegen, wie viele je Teller. kopf: schriftliches Verfahren mit
  Marken als Probe; Probe mit Mal (alle Teller wieder zusammen).
- Lernzeichen: Plättchen, goldenes Material, Markenspiel; neu: Teller als schlichter Umriss.
- Gesten: Ziehen, Tippen (reihum: „noch eine Runde austeilen“).
- Fehlerkontrolle: Ungleiche Teller sieht man; ein Rest, der größer als n ist, lässt sich noch verteilen. Eine leere
  Stelle (Null im Ergebnis) ist ein Teller ohne Hunderter, sichtbar leer.
- Fehlerbilder: quotient-null-vergessen (gezielt).
- Hauptthemen: gerecht-verteilen, sonderfaelle-teilen, halbschriftlich-geteilt, halbschriftlich-geteilt-rest, schriftlich-geteilt-ohne-rest, schriftlich-geteilt-erste-stelle, schriftlich-geteilt-null-ergebnis, schriftlich-geteilt-rest, schriftlich-geteilt-durch-10, probe-teilen (Kl. 2–4)
- Weitere Zugänge: halbieren-bis-10 (M19), halbieren-bis-20 (M19), halbschriftlich-mal-geteilt-million (M36), je-mehr-desto-weniger (M52)
- Warum perfekt: Verteilen ist eine Handlung, und schriftliches Teilen ist dieselbe Handlung stellenweise. So
  bündelt ein Spiel Kl. 2 bis 4 statt drei Spiele.
- Bewusst nicht drin: aufteilen-in-gruppen → M35, geteilt-alle-reihen → M37 (Abruf).
- Stimme: wenig.
- Figuren: Kofi zeigt vor; Lena wundert sich über den Rest. Die Kinder der Runde sitzen manchmal selbst an den
  Tellern (keiner bekommt mehr).
- Regal-Material: Karte mit drei Tellern (neu).
- Mach mit (am Rundenende, als Angebot): Timo verteilt Weintrauben reihum auf Teller. „Verteil etwas gerecht, reihum, und schau, ob etwas übrig bleibt.“
- Fachübergreifend: Sachthemen „Gerecht teilen“ (Miteinander).

### M39 Mal-Marken
- Name fürs Kind: „Mal-Marken“ · Symbol: Spalten mit Marken und ein Malzeichen
- Handlung: Das Kind legt die Zahl so oft mit Marken, wie der zweite Faktor sagt, fasst Stelle für Stelle zusammen,
  tauscht und schreibt die Ziffern; bei zweistelligem Faktor zuerst mal Zehnerzahl (Stellen rücken) · Wirkung: Die
  Großbestellung ist fertig gepackt.
- Material und Stufen: Markenspiel, dann schriftliches Verfahren. material: Marken vervielfachen. vorstellung:
  Marken gezählt, Ziffern geschrieben. kopf: Verfahren, Überschlag als Probe.
- Lernzeichen: Markenspiel, Stellenwertfarben.
- Gesten: Tippen, Ziehen.
- Fehlerkontrolle: Mehr als neun Marken je Spalte passen nicht; eine Null im Faktor ergibt eine leere Zeile.
- Fehlerbilder: uebertrag-vergessen (gezielt), null-regel-vertauscht (schriftlich-mal-null).
- Hauptthemen: schriftlich-mal-ohne-uebertrag, schriftlich-mal-uebertrag, schriftlich-mal-null, mal-zehnerzahl, schriftlich-mal-zweistellig (Kl. 4)
- Weitere Zugänge: ueberschlag-mal (M42)
- Warum perfekt: Schriftlich mal ist stellenweises Vervielfachen mit Tauschen; dasselbe Markenspiel wie M26, aber
  mit eigener Logik (Übertrag aus Produkten), deshalb ein eigenes Spiel.
- Bewusst nicht drin: halbschriftlich-mal → M36.
- Stimme: wenig.
- Figuren: Ela zeigt vor; Kofi wundert sich über die leere Zeile bei der Null.
- Regal-Material: Karte mit Marken und Malzeichen (neu).
- Mach mit (am Rundenende, als Angebot): Ela rechnet eine Bestellung mit Münzen. „Leg eine Malaufgabe mit Münzen und tausche, wenn es zehn werden.“
- Fachübergreifend: –

### Teil E: Sachrechnen und Daten

### M40 Die Rechenfrage
- Name fürs Kind: „Die Rechenfrage“ · Symbol: Fragezeichen über zwei Zahlkärtchen
- Handlung: Zu einer Szene mit Zahlen wählt oder baut das Kind eine Frage, legt nur die nötigen Zahlkärtchen auf
  den Rechenzettel und antwortet; bei einer Frage ohne genug Angaben tippt es „geht nicht“ und sagt, was fehlt ·
  Wirkung: Ein Gast in der Szene kann handeln (die Bäckerin backt genug Brezeln); bei „geht nicht“ holt die Runde
  die fehlende Angabe.
- Material und Stufen: Szene mit Zahlkärtchen, Rechenzettel. material: Kärtchen in der Szene sichtbar. vorstellung:
  Angaben nur vorgelesen. kopf: kurzer Text (Kl. 3: überflüssige und fehlende Angaben, eigene Fragen).
- Lernzeichen: neu: Zahlkärtchen in der Szene, Rechenzettel.
- Gesten: Ziehen, Tippen.
- Fehlerkontrolle: Eine Rechnung mit der überflüssigen Zahl führt in der Szene zu etwas Unsinnigem (der Hirte wird
  17 Jahre alt, die Szene zeigt einen jungen Hirten, der Erzähler sagt, dass das Alter nicht in der Aufgabe steht).
- Fehlerbilder: signalwort-falle (gezielt: Kapitänsaufgaben, unwichtige Zahl).
- Hauptthemen: rechenfrage-finden, passende-frage-waehlen, sachaufgabe-frage-rechnung-antwort, kapitaensaufgabe-erkennen, unwichtige-zahl-erkennen, fehlende-angabe-finden, ueberfluessige-fehlende-angaben, fragen-selbst-stellen (Kl. 1–3)
- Weitere Zugänge: signalwoerter-falle (M18)
- Warum perfekt: Alle Themen fragen: Welche Angaben braucht diese Frage? Das Sortieren der Kärtchen ist genau diese
  Entscheidung.
- Bewusst nicht drin: sachaufgabe-skizze → M41.
- Stimme: **viel** (jede Situation eigene Sätze).
- Figuren: Lena zeigt vor; Timo wundert sich über die Frage nach dem Alter. Gäste: die Bäckerin Aylin, der Hirte.
- Regal-Material: Karte mit Fragezeichen (neu).
- Mach mit (am Rundenende, als Angebot): Kofi liest einen Kassenzettel. „Schau auf einen Kassenzettel: Welche Frage kann man damit beantworten?“
- Fachübergreifend: Lesen (Sachtexte verstehen) ab Kl. 3.

### M41 Skizze
- Name fürs Kind: „Skizze“ · Symbol: Striche und Kästchen zu einem Zaun
- Handlung: Das Kind baut aus Bausteinen (Striche, Kästchen, Pfeile, Tabellenzeilen) eine Skizze zur Geschichte oder
  wählt eine; die Skizze spielt dann die Geschichte nach · Wirkung: Der Zaun steht mit der richtigen Zahl Pfosten, die
  Stühle stehen an den Tischen.
- Material und Stufen: Skizzen-Bausteine (keine freie Zeichnung). material: Bausteine legen und zählen.
  vorstellung: Skizze wählen. kopf: Rechenschritte planen (zwei Schritte, Situation verändern), das passende Werkzeug
  wählen (Skizze, Tabelle, Rückwärts).
- Lernzeichen: neu: Skizzen-Bausteine.
- Gesten: Ziehen, Tippen. Freies Zeichnen wäre eine neue Eingabe und wird bewusst vermieden.
- Fehlerkontrolle: Die Skizze wird zur Szene; fünf Felder mit fünf Pfosten lassen ein Ende offen.
- Fehlerbilder: signalwort-falle (Übung: sachaufgabe-skizze).
- Hauptthemen: sachaufgabe-skizze, skizze-waehlen, zaunpfahl-falle, strategie-waehlen, sachaufgabe-zwei-rechenschritte, zwei-schritte-planen, situation-veraendern, passende-darstellung-waehlen, vorgehen-aendern (Kl. 2–3)
- Weitere Zugänge: rueckwaerts-geschichte (M29), rueckwaerts-rechnen-sachaufgabe (M29)
- Warum perfekt: Eine Skizze ist ein Modell der Situation; wenn sie die Geschichte nachspielt, prüft die Sache das
  Modell. Zaunpfahl, Zwei-Schritt-Aufgaben und die Wahl des Werkzeugs gehören dazu.
- Bewusst nicht drin: tabelle-beim-probieren → M55.
- Stimme: viel.
- Figuren: Timo zeigt vor; Ela wundert sich über das offene Zaunende.
- Regal-Material: Karte mit Skizze (neu).
- Mach mit (am Rundenende, als Angebot): Lena zeichnet einen Zaun auf Papier. „Mal eine Skizze zu einer Geschichte und zähl dann nach.“
- Fachübergreifend: Geometrie (Lageplan) nur entfernt.

### M42 Ungefähr
- Name fürs Kind: „Ungefähr“ · Symbol: Zahlenstrahl mit Bereich, Zeichen ≈
- Handlung: Vor dem Rechnen rundet das Kind die Zahlen und legt den Überschlag auf den Zahlenstrahl fest; nach dem
  Rechnen (in M26, M39 oder hier) muss das Ergebnis im Bereich liegen · Wirkung: Ein Ergebnis im Bereich öffnet das
  Tor; eines außerhalb bleibt sichtbar draußen.
- Material und Stufen: Zahlenstrahl mit Bereich. material: runden am Strahl (M11). vorstellung: Bereich tippen.
  kopf: Überschlag im Kopf, „genau oder ungefähr?“ in Sachsituationen.
- Lernzeichen: Zahlenstrahl (M6); neu: Bereichsklammer.
- Gesten: Tippen, Ziffern tippen.
- Fehlerkontrolle: Das genaue Ergebnis wird auf dem Strahl eingetragen; liegt es weit außerhalb, ist entweder der
  Überschlag oder die Rechnung zu prüfen.
- Fehlerbilder: uebertrag-vergessen, kleiner-von-groesser (Übung: ueberschlag-plus-minus findet sie).
- Hauptthemen: ueberschlag-plus-minus, ueberschlag-mal, genau-oder-ungefaehr, ueberschlag-als-beweis (Kl. 3–4)
- Weitere Zugänge: runden-zehner-hunderter (M11), grosse-zahlen-runden (M11), ergebnis-passt-zur-geschichte (M17)
- Warum perfekt: Der Überschlag ist ein Vorhersagen (L2) mit gerundeten Zahlen; der Bereich auf dem Strahl macht
  ihn prüfbar.
- Bewusst nicht drin: runden-zehner-hunderter → M11.
- Stimme: mittel.
- Figuren: Kofi zeigt vor; Lena wundert sich über ein Ergebnis außerhalb.
- Regal-Material: Karte mit „≈“ (neu).
- Mach mit (am Rundenende, als Angebot): Timo schätzt beim Einkaufen, ob das Geld reicht. „Frag jemanden, ob du beim Einkaufen ungefähr mitrechnen darfst.“
- Fachübergreifend: –

### M43 Der Laden
- Name fürs Kind: „Der Laden“ · Symbol: Münze und Schein
- Handlung: Das Kind legt einen Betrag mit Münzen und Scheinen (möglichst wenige, auf verschiedene Arten), wechselt
  und gibt Rückgeld, indem es vom Preis bis zum bezahlten Betrag Münzen auflegt · Wirkung: Die Kundin bekommt ihre
  Ware bzw. ihr Geld, die Kasse ist ausgeglichen.
- Material und Stufen: Münzen und Scheine. material: Geld als naturgetreue Zeichnung legen. vorstellung: nur
  Beträge. kopf: Kommaschreibweise, Beträge mit Komma zusammenrechnen.
- Lernzeichen: neu: Geld. Euro-Münzen und -Scheine sind echte Dinge; Vorschlag: vereinfachte, aber sachlich
  richtige Zeichnung mit Wertaufdruck. *Annahme:* Reproduktionsregeln der EZB beachten (Scheine nur deutlich verändert).
- Gesten: Ziehen, Tippen.
- Fehlerkontrolle: Die Waage der Kasse (oder der Betrag über der Ablage) zeigt laufend, was liegt; eine Münze zu
  viel bleibt sichtbar übrig.
- Fehlerbilder: –
- Hauptthemen: muenzen-kennen, geld-legen-bis-20, euro-scheine, geldbetraege-legen-bis-100, euro-und-cent, geld-wechseln, rueckgeld, geld-mit-komma-rechnen (Kl. 1–3)
- Weitere Zugänge: kommaschreibweise-groessen (M08), menge-und-preis (M52)
- Warum perfekt: Geld legen, wechseln und Rückgeld (Kaufmannsmethode) sind alle „Betrag mit Münzen legen“. Das ist
  die echte Handlung an einer Kasse.
- Bewusst nicht drin: menge-und-preis → M52.
- Stimme: mittel.
- Figuren: Lena zeigt vor; Timo wundert sich über die übrige Münze. Gäste: Verkäuferin, Kunde.
- Regal-Material: Münze (neu).
- Mach mit (am Rundenende, als Angebot): Ela bezahlt in einem Laden. „Frag jemanden, ob du beim Einkaufen mit Münzen bezahlen darfst.“
- Fachübergreifend: Sachthemen (Wünsche, Taschengeld).

### Teil F: Größen

### M44 Messen
- Name fürs Kind: „Messen“ · Symbol: Lineal an einem Stift
- Handlung: Das Kind vergleicht Längen direkt, misst mit Körpermaßen und mit dem Lineal (bei der Null anlegen) und
  schätzt vorher · Wirkung: Das Brett wird passend zugeschnitten, das Band reicht um das Paket.
- Material und Stufen: Stangen hell/dunkel (Bilder-§12), Lineal, Meterstab. material: anlegen. vorstellung:
  schätzen, dann messen. kopf: Einheiten wählen (m, cm, km, mm).
- Lernzeichen: Stangen (Bilder-§12); neu: Lineal und Meterstab als Lernzeichen.
- Gesten: Ziehen (Lineal anlegen, Tipp-Alternative: Startpunkt antippen), Tippen.
- Fehlerkontrolle: Beim Anlegen an der 1 steht das Ende sichtbar über; das zugeschnittene Brett passt nicht.
- Fehlerbilder: lineal-ab-eins (gezielt).
- Hauptthemen: laenger-kuerzer, messen-mit-lineal, meter-zentimeter, laengen-schaetzen, kilometer-millimeter (Kl. 1–3)
- Weitere Zugänge: kommaschreibweise-groessen (M08)
- Warum perfekt: Länge vergleichen, messen und schätzen ist eine Handlung mit dem Lineal; Kl. 3 erweitert nur die
  Einheiten.
- Bewusst nicht drin: kommaschreibweise-groessen → M08.
- Stimme: wenig.
- Figuren: Ela zeigt vor; Kofi wundert sich über das Lineal, das bei der 1 anfängt.
- Regal-Material: kleines Lineal (neu).
- Mach mit (am Rundenende, als Angebot): Kofi misst einen Tisch mit dem Lineal. „Frag jemanden, ob ihr zusammen etwas mit dem Lineal messt.“
- Fachübergreifend: **Geometrie** (lineal-bei-null-anlegen, zeichnen-mit-lineal: dasselbe Lineal).

### M45 Wiegen
- Name fürs Kind: „Wiegen“ · Symbol: Waage mit Gewichtsstücken
- Handlung: Das Kind schätzt ein Gewicht, legt es auf die Balkenwaage und gleicht mit Gewichtsstücken (g, kg) aus;
  Tonnen über Bezugsgrößen (ein Auto) · Wirkung: Die Zutat ist abgewogen, das Rezept gelingt; der Lastwagen darf
  über die Brücke.
- Material und Stufen: Balkenwaage, Gewichtssatz. material: ausgleichen. vorstellung: erst schätzen. kopf:
  Umrechnen g ↔ kg.
- Lernzeichen: Balkenwaage (siehe M10); neu: Gewichtsstücke.
- Gesten: Ziehen, Tippen.
- Fehlerkontrolle: Die Waage kippt.
- Fehlerbilder: –
- Hauptthemen: gramm-kilogramm, gewichte-schaetzen, tonne (Kl. 3)
- Weitere Zugänge: bruchteile-bei-groessen (M46), waage-raetsel (M10)
- Warum perfekt: Gewicht versteht man durch Abwiegen mit Bezugsgewichten; Schätzen vorher macht es zu einem
  Vorhersagen.
- Bewusst nicht drin: waage-raetsel → M10.
- Stimme: wenig.
- Figuren: Lena zeigt vor; Timo wundert sich, dass das große Kissen leichter ist als der kleine Stein. (Timo mag
  Abwiegen, zeigt hier aber bewusst nicht vor.)
- Regal-Material: Gewichtsstück (neu).
- Mach mit (am Rundenende, als Angebot): Lena wiegt Äpfel auf einer Küchenwaage. „Frag jemanden, ob ihr zusammen etwas abwiegt.“
- Fachübergreifend: –

### M46 Umfüllen
- Name fürs Kind: „Umfüllen“ · Symbol: Messbecher mit Strichen bei ¼, ½, ¾
- Handlung: Das Kind füllt mit Messbechern (1 l, ½ l, ¼ l, 100 ml) um, bis ein Gefäß die verlangte Menge hat ·
  Wirkung: Der Topf ist voll für die Suppe, die Gießkanne hat genug für das Beet.
- Material und Stufen: Messbecher mit Skala. material: umgießen (Ziehen). vorstellung: schätzen, wie viele Becher.
  kopf: halb, Viertel, Dreiviertel in ml.
- Lernzeichen: neu: Messbecher mit Skala.
- Gesten: Ziehen (Becher zum Gefäß), Tippen.
- Fehlerkontrolle: Läuft über oder bleibt unter dem Strich.
- Fehlerbilder: –
- Hauptthemen: liter-milliliter, bruchteile-bei-groessen (Kl. 3)
- Weitere Zugänge: –
- Warum perfekt: Liter und Bruchteile versteht man beim Umfüllen; ½ l = 500 ml ist eine Beobachtung.
- Bewusst nicht drin: uhr-viertel → M47 (Viertel an der Uhr).
- Stimme: wenig.
- Figuren: Kofi zeigt vor; Lena wundert sich über das übergelaufene Glas (gelassen, ohne Ärger).
- Regal-Material: Messbecher (neu).
- Mach mit (am Rundenende, als Angebot): Kofi füllt Wasser mit einem Messbecher um. „Frag jemanden, ob ihr mit einem Messbecher Wasser umfüllt.“
- Fachübergreifend: –

### M47 Die Uhr
- Name fürs Kind: „Die Uhr“ · Symbol: Zeigeruhr auf halb drei
- Handlung: Das Kind stellt eine Uhrzeit auf der Zeigeruhr ein (Zeiger ziehen) oder liest sie ab und ordnet die
  Digitalzeit zu · Wirkung: Etwas in der Szene geschieht zu dieser Zeit (der Bus fährt, die Sonne steht dort).
- Material und Stufen: Zeigeruhr mit gekoppelten Zeigern, Digitalanzeige. material: Minutenzeiger drehen, der
  Stundenzeiger läuft mit. vorstellung: erst die Stellung festlegen, dann drehen. kopf: Digital ↔ analog,
  Nachmittag.
- Lernzeichen: neu: Zeigeruhr (Stunden- und Minutenzeiger nach Länge und Form unterscheidbar, C1).
- Gesten: Ziehen entlang des Zifferblatts (Tipp-Alternative: Zielziffer antippen, Zeiger springt). Das Kreisziehen ist
  keine neue Geste, aber am Gerät zu prüfen.
- Fehlerkontrolle: Die Szene zeigt die eingestellte Zeit (der Bus steht noch an der Haltestelle oder ist schon weg);
  die gekoppelten Zeiger verhindern unmögliche Stellungen.
- Fehlerbilder: uhr-zeiger-vertauscht (gezielt). „viertel acht“ als bayerische Sprechweise gilt nicht als Fehler.
- Hauptthemen: volle-stunde, uhr-halbe-stunde, uhr-viertel, uhr-fuenf-minuten, uhr-minutengenau, uhr-digital-24-stunden (Kl. 1–2)
- Weitere Zugänge: bruchteile-bei-groessen (M46), stunde-und-minute (M48), zeitspannen (M48)
- Warum perfekt: Uhrzeiten von voll bis minutengenau sind dieselbe Uhr mit feinerer Ablesung.
- Bewusst nicht drin: zeitspannen → M48.
- Stimme: mittel (Uhrzeiten in zwei Sprechweisen).
- Figuren: Timo zeigt vor; Ela wundert sich, warum der kleine Zeiger nicht genau auf der 3 steht.
- Regal-Material: kleine Uhr (neu).
- Mach mit (am Rundenende, als Angebot): Timo stellt eine Spielzeuguhr. „Schau auf eine Uhr mit Zeigern und sag, wie spät es ist.“
- Fachübergreifend: –

### M48 Wie lange?
- Name fürs Kind: „Wie lange?“ · Symbol: Zeitleiste mit Bogen von 8 bis 9:30
- Handlung: Das Kind springt auf einer Zeitleiste von der Startzeit zur Endzeit (volle Stunden, Minuten, Sekunden)
  und tippt die Dauer; Zeitpunkt oder Dauer wird vorher sortiert · Wirkung: Der Kuchen ist genau fertig, der Zug kommt
  an.
- Material und Stufen: Zeitleiste (linear, wie Rechenstrich). material: Bögen in Stunden und Minuten. vorstellung:
  Leiste ohne Marken. kopf: Rechnung.
- Lernzeichen: Rechenstrich-Form (M24) als Zeitleiste; neu: Stunden- und Minutenmarken.
- Gesten: Tippen, Ziffern tippen.
- Fehlerkontrolle: Der Bogen endet dort, wo die getippte Dauer hinführt; der Zug kommt dann zu früh oder zu spät.
- Fehlerbilder: –
- Hauptthemen: stunde-und-minute, zeitspannen, sekunden, zeitpunkt-zeitdauer, zeitspannen-stunden-minuten (Kl. 2–3)
- Weitere Zugänge: zeitspannen-ueber-tage (M49), fahrplaene (M51)
- Warum perfekt: Dauer ist ein Abstand auf einer Linie; dieselbe Handlung wie der Rechenstrich, mit 60 statt 100.
- Bewusst nicht drin: zeitspannen-ueber-tage → M49 (Tage im Kalender), fahrplaene → M51.
- Stimme: mittel.
- Figuren: Ela zeigt vor; Kofi wundert sich über 60 statt 100.
- Regal-Material: Karte mit Zeitbogen (neu).
- Mach mit (am Rundenende, als Angebot): Ela stellt einen Küchenwecker. „Schau auf die Uhr, wenn etwas anfängt und aufhört, und sag, wie lange es gedauert hat.“
- Fachübergreifend: –

### M49 Kalender
- Name fürs Kind: „Kalender“ · Symbol: Monatsblatt mit einem Kreis
- Handlung: Das Kind findet Tage im Monatsblatt, ordnet Wochentage und gestern, heute, morgen und zählt Tage bis
  zu einem Ereignis · Wirkung: Das Ereignis (Aussaat, Ernte, Fest) wird eingetragen und findet statt.
- Material und Stufen: Wochenstreifen, Monatsblatt. material: Wochentage als Streifen legen. vorstellung: Monatsblatt
  ohne Zahlen. kopf: Zeitspannen über Tage.
- Lernzeichen: neu: Wochenstreifen und Monatsblatt (Gitter wie Hunderterfeld, aber 7 Spalten).
- Gesten: Tippen, Ziehen.
- Fehlerkontrolle: Das eingetragene Ereignis erscheint am getippten Tag, die Szene passt dann nicht (Ernte vor der
  Aussaat).
- Fehlerbilder: –
- Hauptthemen: wochentage-tageszeiten, kalender-lesen, zeitspannen-ueber-tage (Kl. 1–4)
- Weitere Zugänge: –
- Warum perfekt: Wochentage, Datum und Tage zählen sind dieselben Kalenderhandlungen.
- Bewusst nicht drin: zeitspannen-stunden-minuten → M48.
- Stimme: mittel (Wochentage, Monate, Daten).
- Figuren: Timo zeigt vor; Lena wundert sich über eine Ernte vor der Aussaat.
- Regal-Material: Kalenderblatt (neu).
- Mach mit (am Rundenende, als Angebot): Timo kreuzt einen Tag im Kalender an. „Such im Kalender, wie viele Tage es noch bis zu einem Tag sind, auf den du wartest.“
- Fachübergreifend: Sachthemen Zeit.

### M50 Säulen bauen
- Name fürs Kind: „Säulen bauen“ · Symbol: Strichliste und drei Säulen
- Handlung: Das Kind zählt in einer Szene (oder aus einem vorgelesenen Text) mit Strichliste in Fünferbündeln und
  baut daraus ein Bild-, Balken- oder Säulendiagramm und eine Tabelle · Wirkung: Das Diagramm hängt an der Tafel, die
  Klasse kann entscheiden (welches Tier gefüttert wird zuerst).
- Material und Stufen: Strichliste, Säulen aus Plättchen. material: Plättchen stapeln. vorstellung: Säulen mit
  Raster. kopf: Säulen mit Skala (Kl. 3).
- Lernzeichen: neu: Strichliste (Fünferbündel), Säulendiagramm.
- Gesten: Tippen (Strich setzen), Ziehen (Plättchen).
- Fehlerkontrolle: Die Säule muss so hoch sein wie die Strichliste; daneben liegen die Striche als Probe.
- Fehlerbilder: –
- Hauptthemen: strichliste, strichliste-und-bilddiagramm, tabelle-aus-text, balkendiagramm, daten-sammeln-darstellen, saeulendiagramm-tabelle (Kl. 1–3)
- Weitere Zugänge: tabellen-schaubilder-lesen (M51)
- Warum perfekt: Daten erheben und darstellen ist eine Handlungskette von Zählen zu Darstellung; das Kind baut sie.
- Bewusst nicht drin: diagramme-kritisch-lesen → M51.
- Stimme: viel (Texte zum Übertragen).
- Figuren: Lena zeigt vor; Timo wundert sich über eine zu hohe Säule. Gezählt wird nie nach Gruppen von Menschen
  (6.1 Nr. 10), nur nach neutralen Merkmalen.
- Regal-Material: Karte mit drei Säulen (neu).
- Mach mit (am Rundenende, als Angebot): Lena macht eine Strichliste der Vögel am Fenster. „Mach eine Strichliste: Autos, Vögel oder Wetter.“
- Fachübergreifend: Sachthemen (Wetter, Abstimmen).

### M51 Ablesen
- Name fürs Kind: „Ablesen“ · Symbol: Tabelle mit Lupe
- Handlung: Das Kind liest aus Tabelle, Preisliste, Fahrplan oder Diagramm einen Wert ab, vergleicht und beantwortet
  eine Frage; in Kl. 4 prüft es, ob ein Diagramm täuscht (abgeschnittene Achse) · Wirkung: Die Runde nimmt den
  richtigen Bus, kauft die günstigste Tüte.
- Material und Stufen: Tabelle und Diagramm. material: Finger-Linie (Lineal) über die Zeile. vorstellung: ohne
  Linie. kopf: kritisch lesen.
- Lernzeichen: Säulendiagramm (M50), neu: Tabelle, Fahrplan.
- Gesten: Tippen.
- Fehlerkontrolle: Die Szene folgt dem abgelesenen Wert (der falsche Bus fährt in eine andere Richtung, ruhig).
- Fehlerbilder: –
- Hauptthemen: tabellen-schaubilder-lesen, tabellen-preislisten, fahrplaene, diagramme-kritisch-lesen, darstellungen-bewerten (Kl. 2–4)
- Weitere Zugänge: tabelle-aus-text (M50), saeulendiagramm-tabelle (M50), wertetabelle (M52), passende-darstellung-waehlen (M41)
- Warum perfekt: Ablesen ist die umgekehrte Handlung zu M50, ein eigenes Spiel nach der Regel „eine Handlung“.
- Bewusst nicht drin: strichliste → M50.
- Stimme: viel.
- Figuren: Timo zeigt vor; Ela wundert sich über die abgeschnittene Achse.
- Regal-Material: Karte mit Tabelle (neu).
- Mach mit (am Rundenende, als Angebot): Timo liest einen Fahrplan an der Haltestelle. „Frag jemanden, ob ihr zusammen auf einem Fahrplan sucht, wann der Bus kommt.“
- Fachübergreifend: Lesen (Tabellen lesen als Lesestrategie).

### M52 Je mehr …
- Name fürs Kind: „Je mehr …“ · Symbol: Tabelle 1, 2, 3 mit wachsenden Stapeln
- Handlung: Das Kind füllt eine Wertetabelle (1 Brot → 300 g Mehl, 2 Brote → …) und erkennt, ob mehr zu mehr oder zu
  weniger führt (mehr Kinder, weniger je Kind) · Wirkung: Das Rezept reicht genau für alle Gäste.
- Material und Stufen: Wertetabelle mit Plättchenstapeln. material: Stapel wachsen sichtbar. vorstellung: nur
  erste Zeile mit Stapeln. kopf: Menge und Preis, Dreisatz-Vorstufe.
- Lernzeichen: neu: Wertetabelle.
- Gesten: Ziffern tippen.
- Fehlerkontrolle: Der Stapel in der Zeile passt nicht zu den vorigen (wächst ungleich).
- Fehlerbilder: –
- Hauptthemen: je-mehr-desto, wertetabelle, menge-und-preis, je-mehr-desto-weniger (Kl. 3–4)
- Weitere Zugänge: –
- Warum perfekt: Proportionale und umgekehrt proportionale Zuordnungen sind Tabellenhandlungen.
- Bewusst nicht drin: tabellen-preislisten → M51 (Ablesen statt Ausfüllen).
- Stimme: mittel.
- Figuren: Ela zeigt vor; Kofi wundert sich, dass mehr Kinder weniger bekommen.
- Regal-Material: Karte mit Tabelle (neu).
- Mach mit (am Rundenende, als Angebot): Ela liest ein Rezept für doppelt so viele. „Frag jemanden, ob ihr ein Rezept für mehr Leute umrechnet.“
- Fachübergreifend: –

### M53 Wie viele Arten?
- Name fürs Kind: „Wie viele Arten?“ · Symbol: zwei Hüte, zwei Hosen, Linien dazwischen
- Handlung: Das Kind legt alle Kombinationen (Kleidung, Frühstück, Eisbecher, Siegerpodest, Händeschütteln) als
  Paare und ordnet sie in einem Baum · Wirkung: Jede neue Kombination zieht eine Figur an oder stellt einen Becher in
  die Theke; eine doppelte findet ihren Platz schon besetzt.
- Material und Stufen: Wortbilder (Kleidung) und Baumdiagramm. material: anziehen. vorstellung: Baum mit Ästen.
  kopf: Anzahl ohne Legen; mit Reihenfolge (Podest).
- Lernzeichen: neu: Baumdiagramm; Wortbilder nach Bilder-§3 für Kleidung und Speisen.
- Gesten: Ziehen, Tippen.
- Fehlerkontrolle: Doppelte Kombinationen passen nicht an einen freien Platz; der Baum zeigt leere Äste.
- Fehlerbilder: –
- Hauptthemen: kleidung-kombinieren, kombinieren-systematisch, kombinieren-drei-mal-zwei, baumdiagramm-kombinationen, handschlag-problem, kombinatorik-reihenfolge, siegerpodest-reihenfolgen (Kl. 1–4)
- Weitere Zugänge: tabelle-beim-probieren (M55)
- Warum perfekt: Alle Kombinatorik-Themen sind „alle Möglichkeiten finden, keine doppelt“, Kl. 1 bis 4 mit
  wachsender Ordnung.
- Bewusst nicht drin: geordnet-probieren → M14 (Zerlegungen).
- Stimme: mittel.
- Figuren: Kofi zeigt vor; Lena wundert sich über eine doppelte Kombination. Die Kinder der Runde ziehen sich
  selbst an (keine Jungen- oder Mädchenfarben, C5).
- Regal-Material: Karte mit kleinem Baum (neu).
- Mach mit (am Rundenende, als Angebot): Kofi legt zwei Hosen und zwei Shirts aus. „Leg Kleidung aus und finde alle Arten, sie anzuziehen.“
- Fachübergreifend: –

### M54 Säckchen
- Name fürs Kind: „Säckchen“ · Symbol: Säckchen mit roten und blauen Kugeln
- Handlung: Das Kind sagt vorher, ob ein Ergebnis sicher, möglich, unmöglich oder wahrscheinlicher ist, wählt ein
  Säckchen und zieht dann viele Male · Wirkung: Die gezogenen Kugeln stapeln sich zu Säulen; über viele Züge zeigt sich,
  was häufiger kommt. Kl. 4: Kugeln tauschen, um die Chance zu ändern.
- Material und Stufen: Säckchen mit Kugeln, Würfel. material: ziehen. vorstellung: Säckchen zeigt Inhalt, Ergebnis
  verdeckt. kopf: Chancen begründen.
- Lernzeichen: neu: Säckchen und Kugeln (Kugelfarben nicht aus den Perlenfarben, Form zusätzlich: Kreis und
  Quadrat, C1).
- Gesten: Tippen.
- Fehlerkontrolle: Viele Züge zeigen die Häufigkeit. Einzelne Züge urteilen nie (sonst lernt das Kind, Zufall als
  Fehler zu sehen); erst die Säule nach 20 Zügen gilt.
- Fehlerbilder: –
- Hauptthemen: sicher-moeglich-unmoeglich, wahrscheinlich-unwahrscheinlich, gewinnchancen, chancen-veraendern, gewinnchance-begruenden (Kl. 2–4)
- Weitere Zugänge: –
- Warum perfekt: Zufall versteht man nur durch Vorhersagen und viele Versuche; das Säckchen ist das Standardmaterial.
- Bewusst nicht drin: –
- Stimme: wenig.
- Figuren: Timo zeigt vor; Ela wundert sich über drei blaue Kugeln hintereinander.
- Regal-Material: Säckchen (neu).
- Mach mit (am Rundenende, als Angebot): Timo zieht Knöpfe aus einem Säckchen. „Frag jemanden, ob ihr ein Säckchen mit Knöpfen füllt und oft zieht.“
- Fachübergreifend: –

### M55 Zahlenrätsel
- Name fürs Kind: „Zahlenrätsel“ · Symbol: Schloss mit Zahlenrad
- Handlung: Das Kind findet eine Zahl, die alle Hinweise erfüllt, indem es auf einer Tafel Zahlen ausschließt oder in
  einer Probiertabelle Zeile für Zeile einträgt; in Kl. 4 knackt es eine Geheimschrift (Buchstaben für Ziffern) ·
  Wirkung: Das Zahlenschloss springt auf.
- Material und Stufen: Hundertertafel zum Ausschließen, Probiertabelle. material: Zahlen abdecken. vorstellung:
  Tabelle. kopf: Geheimschrift.
- Lernzeichen: Hunderterfeld (M6), neu: Probiertabelle, Zahlenschloss (Stimmungsebene).
- Gesten: Tippen.
- Fehlerkontrolle: Das Schloss geht nur mit der Zahl auf, die alle Hinweise erfüllt; ein abgedeckter Hinweis zeigt,
  welcher verletzt ist.
- Fehlerbilder: –
- Hauptthemen: zahlenraetsel-zwei-hinweise, tabelle-beim-probieren, raetsel-mit-tabelle, geheimschrift-zahlen (Kl. 2–4)
- Weitere Zugänge: magisches-quadrat-ergaenzen (M32)
- Warum perfekt: Hinweise systematisch abarbeiten ist die gemeinsame Handlung; die Tabelle verhindert, dass etwas
  fehlt.
- Bewusst nicht drin: magisches-quadrat-ergaenzen → M32.
- Stimme: viel (Hinweise).
- Figuren: Ela zeigt vor; Timo wundert sich über eine Zahl, die einen Hinweis bricht.
- Regal-Material: Karte mit Schloss (neu).
- Mach mit (am Rundenende, als Angebot): Ela erfindet ein Zahlenrätsel. „Denk dir eine Zahl und zwei Hinweise aus und lass jemanden raten.“
- Fachübergreifend: Lesen (Hinweise lesen).

### M56 Wer sagt 20?
- Name fürs Kind: „Wer sagt 20?“ · Symbol: Zahlenstrahl bis 20 mit zwei Spielsteinen
- Handlung: Zwei Spieler (Kind und Erwachsener, oder Kind und ein Kind der Runde) zählen abwechselnd 1 bis 3 weiter;
  wer 20 sagt, hat die letzte Zahl. Das Kind findet rückwärts die Zahlen, die sicher zum Ziel führen · Wirkung: Der
  Stein erreicht das Ziel; die gefundenen Zahlen leuchten als Spur.
- Material und Stufen: Zahlenstrahl bis 20. material: Steine ziehen. vorstellung: nur Zahlen. kopf: andere Ziele
  und Schritte (bis 30, Schritte 1–4).
- Lernzeichen: Zahlenstrahl (M6).
- Gesten: Tippen. **Neu:** Zwei-Personen-Ablauf am selben Gerät (abwechselnd tippen); `bedienung.md` hat dafür noch
  keine Regel.
- Fehlerkontrolle: Das Spiel selbst zeigt, wer die 20 erreicht; die Rückwärtsspur macht sichtbar, warum.
- Fehlerbilder: –
- Hauptthemen: gewinnstrategie (Kl. 3)
- Weitere Zugänge: –
- Warum perfekt: Eine Gewinnstrategie findet man nur im Spiel gegeneinander und durch Rückwärtsdenken; es ist der
  „Zeig’s mir“-Moment aus N10.
- Bewusst nicht drin: zahlenkette-rueckwaerts → M29.
- Stimme: wenig.
- Figuren: Timo zeigt vor (spielt gegen den Erzähler-Tisch, nicht gegen ein anderes Kind); Lena wundert sich, dass die
  16 sicher zur 20 führt.
- Regal-Material: Karte „20“ (Ziffer, passt).
- Mach mit (am Rundenende, als Angebot): Timo spielt mit jemandem am Tisch bis 20. „Spiel mit jemandem: Wer sagt 20? Zählt abwechselnd eins bis drei weiter.“
- Fachübergreifend: Sachthemen Miteinander (warten und verlieren können).


## 3. Zuordnungstabelle

| id | Hauptspiel | weitere |
|---|---|---|
| mehr-weniger-gleich-viele | M01 | M18 |
| vorwaerts-zaehlen | M02 | – |
| rueckwaerts-zaehlen | M02 | – |
| abzaehlen | M03 | – |
| ziffern-lesen-bis-10 | M06 | M04 |
| menge-bild-ziffer | M04 | M03 |
| mengen-5 | M04 | – |
| zehnerfeld-fuenf-und-noch | M04 | – |
| die-null | M03 | M08 |
| wofuer-zahlen-stehen | M05 | – |
| ordnungszahlen-bis-10 | M05 | M02 |
| nachbarzahlen-bis-10 | M02 | – |
| zahlen-ordnen-bis-10 | M02 | M11 |
| zeichen-groesser-kleiner-gleich | M10 | M01 |
| zahlenstrahl-bis-10 | M11 | – |
| zerlegen-2 | M14 | – |
| zerlegen-3 | M14 | – |
| zerlegen-4 | M14 | – |
| plus-verstehen | M17 | – |
| minus-verstehen | M17 | – |
| rechnen-3 | M16 | – |
| rechnen-4 | M16 | – |
| zerlegen-5 | M14 | – |
| rechnen-5 | M16 | – |
| zerlegen-6 | M14 | – |
| rechnen-6 | M16 | – |
| zerlegen-7 | M14 | – |
| rechnen-7 | M16 | – |
| zerlegen-8 | M14 | – |
| rechnen-8 | M16 | – |
| zerlegen-9 | M14 | – |
| rechnen-9 | M16 | – |
| zerlegen-10 | M14 | – |
| rechnen-10 | M16 | – |
| zerlegungen-ordnen | M14 | – |
| ergaenzen-bis-10 | M15 | M14 |
| plus-0-und-1 | M20 | – |
| plus-2-und-3 | M20 | – |
| plus-mit-5 | M20 | – |
| verdoppeln-bis-10 | M19 | – |
| ergebnis-10 | M15 | – |
| tauschaufgaben-bis-10 | M20 | M33 |
| plus-bis-10-gemischt | M20 | – |
| minus-0-1-alles-weg | M20 | – |
| minus-von-10 | M15 | – |
| halbieren-bis-10 | M19 | M38 |
| minus-bis-10-gemischt | M20 | – |
| umkehraufgaben-bis-10 | M16 | – |
| aufgabenfamilie-bis-10 | M16 | – |
| lueckenaufgaben-bis-10 | M10 | M14, M16 |
| unterschied-bis-10 | M18 | – |
| rechenkette-bis-10 | M29 | – |
| zahlenmauer-bis-10 | M30 | – |
| rechendreieck-bis-10 | M31 | – |
| zehner-und-einer-bis-20 | M08 | – |
| zahlen-bis-20-schreiben | M06 | M08 |
| zwanzigerfeld | M04 | M21 |
| nachbarzahlen-zahlenstrahl-bis-20 | M11 | – |
| gerade-ungerade | M01 | – |
| zehn-plus | M08 | M04 |
| plus-ohne-20 | M23 | – |
| plus-zur-20 | M15 | – |
| minus-zehner | M08 | – |
| minus-ohne-20 | M23 | – |
| minus-von-20 | M15 | – |
| zwillinge | M19 | – |
| halbieren-bis-20 | M19 | M38 |
| fast-verdoppeln | M19 | M21 |
| erst-zur-10 | M21 | – |
| ueber-10-mit-9 | M22 | M21 |
| ueber-10-mit-8 | M21 | – |
| ueber-10-mit-7 | M21 | – |
| fuenfertrick | M21 | – |
| tauschen-ueber-10 | M21 | – |
| plus-uebergang-gemischt | M21 | M20, M25 |
| minus-bis-zur-10 | M15 | – |
| minus-ueber-10-bis-5 | M21 | – |
| minus-ueber-10-ab-6 | M21 | – |
| minus-9-ueber-minus-10 | M22 | – |
| ergaenzen-statt-abziehen | M18 | – |
| minus-uebergang-gemischt | M21 | M20, M25 |
| umkehraufgaben-bis-20 | M16 | M21 |
| blitzrechnen-bis-20 | M20 | M21 |
| mauer-dreieck-kette-bis-20 | M30 | M31, M29 |
| was-ist-mehr-bis-20 | M10 | – |
| paeckchen-mit-muster | M28 | – |
| zahlenfolgen-bis-20 | M27 | – |
| rechengeschichte-zum-bild | M17 | – |
| rechenfrage-finden | M40 | – |
| muenzen-kennen | M43 | – |
| geld-legen-bis-20 | M43 | M14 |
| laenger-kuerzer | M44 | – |
| wochentage-tageszeiten | M49 | – |
| volle-stunde | M47 | – |
| strichliste | M50 | M04 |
| mehrere-loesungen | M14 | – |
| alle-loesungen-finden | M14 | – |
| geordnet-probieren | M14 | – |
| probieren-und-pruefen | M30 | – |
| zahlenmauer-von-oben | M30 | – |
| rechendreieck-mit-luecken | M31 | – |
| kleidung-kombinieren | M53 | – |
| muster-regel-finden | M27 | M28 |
| aussage-pruefen | M33 | – |
| mit-plaettchen-zeigen | M33 | – |
| gerade-ungerade-begruenden | M01 | – |
| passt-nicht-ins-muster | M28 | M33 |
| begruendung-waehlen | M33 | – |
| muster-in-worten | M34 | – |
| rechenweg-nachlegen | M21 | M34 |
| bild-zu-rechnung | M17 | – |
| rechnung-zu-bild | M17 | – |
| passende-frage-waehlen | M40 | – |
| ergebnis-passt-zur-geschichte | M17 | M42 |
| zahl-in-vielen-formen | M04 | – |
| aufgabe-am-zwanzigerfeld | M21 | – |
| strichliste-und-bilddiagramm | M50 | – |
| rechenzeichen-lesen | M34 | – |
| gleichheitszeichen-gleich-viel | M10 | – |
| zehnerzahlen-bis-100 | M08 | – |
| buendeln-zehner-einer | M07 | – |
| zahlwort-ziffern-bis-100 | M06 | M08 |
| zahl-darstellungen-bis-100 | M08 | – |
| zahlen-mit-null-bis-100 | M08 | – |
| hundertertafel | M12 | – |
| zahlenstrahl-bis-100 | M11 | – |
| nachbarzehner | M11 | – |
| vergleichen-bis-100 | M09 | M11 |
| zerlegen-zehner-einer | M08 | – |
| anzahlen-schaetzen-bis-100 | M13 | M07 |
| in-schritten-zaehlen-bis-100 | M27 | M37 |
| gerade-ungerade-bis-100 | M01 | M12 |
| zehnerzahlen-plus-minus | M23 | M08 |
| ergaenzen-zum-zehner | M15 | – |
| ergaenzen-bis-100 | M15 | – |
| plus-einer-ohne-uebergang-bis-100 | M23 | – |
| minus-einer-ohne-uebergang-bis-100 | M23 | – |
| plus-zehner-bis-100 | M12 | M24 |
| minus-zehner-bis-100 | M12 | – |
| plus-ueber-den-zehner-bis-100 | M24 | – |
| plus-bis-30 | M24 | – |
| zehnerzahl-minus-einer | M23 | – |
| minus-ueber-den-zehner-bis-100 | M24 | – |
| minus-bis-30 | M24 | – |
| plus-zweistellig-ohne-uebergang | M24 | M26 |
| minus-zweistellig-ohne-uebergang | M24 | – |
| plus-zweistellig-mit-uebergang | M24 | M26, M25 |
| plus-bis-100 | M24 | – |
| minus-zweistellig-mit-uebergang | M24 | – |
| minus-bis-100 | M24 | – |
| schrittweise-rechenstrich | M24 | – |
| stellenweise-rechnen | M26 | M24 |
| hilfsaufgabe-plus-minus | M22 | – |
| vereinfachen-plus-minus | M22 | M18 |
| ergaenzen-statt-abziehen-bis-100 | M18 | – |
| rechenweg-waehlen-bis-100 | M25 | M34 |
| verdoppeln-halbieren-bis-100 | M19 | – |
| probe-umkehraufgabe-bis-100 | M16 | M33 |
| zahlenmauer-rechendreieck-bis-100 | M30 | M31, M29 |
| paeckchen-muster-bis-100 | M28 | – |
| rechenfehler-finden-bis-100 | M33 | – |
| gleich-grosse-gruppen | M35 | M37, M36 |
| punktefeld-reihen-spalten | M36 | – |
| malaufgabe-zum-bild | M35 | M17 |
| tauschaufgaben-mal | M36 | – |
| mal-eins-mal-null | M35 | – |
| zweierreihe | M37 | – |
| zehnerreihe | M37 | – |
| fuenferreihe | M37 | – |
| kernaufgaben-einmaleins | M37 | M36 |
| quadrataufgaben | M36 | M37 |
| nachbaraufgabe-mal | M36 | M37 |
| verdoppeln-beim-mal | M36 | M37 |
| viererreihe | M37 | – |
| achterreihe | M37 | – |
| dreierreihe | M37 | – |
| sechserreihe | M37 | – |
| neunerreihe | M37 | – |
| siebenerreihe | M37 | – |
| einmaleins-gemischt | M37 | – |
| gerecht-verteilen | M38 | – |
| aufteilen-in-gruppen | M35 | M37 |
| geteilt-umkehrung-mal | M37 | M16 |
| geteilt-durch-2-5-10 | M37 | – |
| geteilt-alle-reihen | M37 | – |
| sonderfaelle-teilen | M38 | – |
| teilen-mit-rest | M35 | M37 |
| mal-oder-geteilt | M17 | M35 |
| euro-scheine | M43 | – |
| geldbetraege-legen-bis-100 | M43 | – |
| euro-und-cent | M43 | M08 |
| geld-wechseln | M43 | M07 |
| rueckgeld | M43 | M15 |
| messen-mit-lineal | M44 | – |
| meter-zentimeter | M44 | M08 |
| laengen-schaetzen | M44 | M13 |
| uhr-halbe-stunde | M47 | – |
| uhr-viertel | M47 | – |
| uhr-fuenf-minuten | M47 | – |
| uhr-minutengenau | M47 | – |
| uhr-digital-24-stunden | M47 | – |
| stunde-und-minute | M48 | M47 |
| zeitspannen | M48 | M47 |
| kalender-lesen | M49 | – |
| sachaufgabe-frage-rechnung-antwort | M40 | – |
| sachaufgabe-skizze | M41 | M17 |
| signalwoerter-falle | M18 | M40 |
| kapitaensaufgabe-erkennen | M40 | M17 |
| kombinieren-systematisch | M53 | – |
| tabellen-schaubilder-lesen | M51 | M50 |
| sicher-moeglich-unmoeglich | M54 | – |
| wahrscheinlich-unwahrscheinlich | M54 | – |
| tabelle-beim-probieren | M55 | M53 |
| kombinieren-drei-mal-zwei | M53 | – |
| zahlenmauer-ziel-erreichen | M30 | – |
| mittelstein-zaehlt-doppelt | M30 | – |
| groesster-kleinster-deckstein | M30 | – |
| zahlenkette-rueckwaerts | M29 | – |
| rueckwaerts-geschichte | M29 | M41 |
| skizze-waehlen | M41 | – |
| zaunpfahl-falle | M41 | – |
| analoge-aufgabe-nutzen | M23 | – |
| zahlenraetsel-zwei-hinweise | M55 | M12 |
| waage-raetsel | M10 | M45 |
| strategie-waehlen | M41 | – |
| vermutung-aufstellen | M33 | M28 |
| vermutung-testen | M33 | – |
| gegenbeispiel-finden | M33 | – |
| gleichsinnig-veraendern | M28 | M33 |
| gegensinnig-summe-bleibt | M22 | M28 |
| differenz-bleibt-gleich | M18 | M28 |
| fehler-finden-rechnen | M33 | – |
| fehlerursache-finden | M33 | – |
| immer-manchmal-nie | M33 | – |
| mal-tausch-begruenden | M36 | – |
| rechenwege-zuordnen | M34 | M25 |
| erklaerung-ordnen | M34 | – |
| mathe-fachwoerter | M34 | – |
| forscherbericht-ergaenzen | M34 | – |
| unwichtige-zahl-erkennen | M40 | – |
| fehlende-angabe-finden | M40 | – |
| geschichte-zur-malaufgabe | M17 | – |
| fermi-wie-viele-passen | M13 | – |
| rechenstrich-lesen | M24 | – |
| malaufgabe-als-punktefeld | M36 | – |
| tabelle-aus-text | M50 | M51 |
| pfeile-und-farben-im-paeckchen | M28 | – |
| sprache-zu-rechnung | M34 | M17 |
| hunderter-buendeln | M07 | – |
| dreistellige-zahlen-lesen | M06 | M08 |
| null-platzhalter-bis-1000 | M08 | – |
| darstellungen-bis-1000 | M08 | – |
| zahlenstrahl-bis-1000 | M11 | – |
| nachbarzehner-nachbarhunderter | M11 | – |
| vergleichen-bis-1000 | M09 | – |
| runden-zehner-hunderter | M11 | M42 |
| grosse-anzahlen-schaetzen | M13 | – |
| zerlegen-bis-1000 | M08 | – |
| zaehlen-grosse-schritte | M27 | – |
| hunderterzahlen-plus-minus | M23 | M08 |
| ergaenzen-hunderter-1000 | M15 | – |
| analog-ohne-uebergang-1000 | M23 | – |
| uebergang-zehner-hunderter | M24 | – |
| halbschriftlich-plus-minus-1000 | M24 | M25 |
| verdoppeln-halbieren-bis-1000 | M19 | – |
| zahlenmauern-bis-1000 | M30 | M31 |
| einmaleins-sicher | M37 | – |
| quadratzahlen | M36 | M37 |
| teilen-mit-rest-sicher | M35 | – |
| punkt-vor-strich | M36 | M10 |
| ungleichungen-einmaleins | M10 | – |
| zehner-einmaleins | M23 | M37 |
| halbschriftlich-mal | M36 | – |
| halbschriftlich-geteilt | M38 | M36 |
| halbschriftlich-geteilt-rest | M38 | – |
| stellengerecht-untereinander | M26 | – |
| ueberschlag-plus-minus | M42 | M26 |
| schriftlich-plus-ohne-uebertrag | M26 | – |
| schriftlich-plus-uebertrag | M26 | – |
| schriftlich-plus-mehrere-uebertraege | M26 | – |
| schriftlich-plus-drei-summanden | M26 | – |
| schriftlich-minus-ohne-entbuendeln | M26 | – |
| entbuendeln-zehner | M26 | – |
| entbuendeln-hunderter | M26 | – |
| zweifach-entbuendeln | M26 | – |
| entbuendeln-ueber-null | M26 | – |
| probe-schriftlich-minus | M26 | M16 |
| kopf-oder-schriftlich | M25 | – |
| kilometer-millimeter | M44 | – |
| kommaschreibweise-groessen | M08 | M43, M44 |
| geld-mit-komma-rechnen | M43 | M26 |
| gramm-kilogramm | M45 | – |
| gewichte-schaetzen | M45 | M13 |
| tonne | M45 | – |
| sekunden | M48 | – |
| zeitpunkt-zeitdauer | M48 | – |
| zeitspannen-stunden-minuten | M48 | – |
| liter-milliliter | M46 | – |
| bruchteile-bei-groessen | M46 | M47, M45 |
| tabellen-preislisten | M51 | – |
| fragen-selbst-stellen | M40 | M17 |
| sachaufgabe-zwei-rechenschritte | M41 | M29 |
| ueberfluessige-fehlende-angaben | M40 | – |
| balkendiagramm | M50 | – |
| daten-sammeln-darstellen | M50 | – |
| baumdiagramm-kombinationen | M53 | – |
| gewinnchancen | M54 | – |
| zahlenfolgen-zahleigenschaften | M27 | – |
| je-mehr-desto | M52 | – |
| zahlenmauer-luecken-verteilt | M30 | – |
| rechendreieck-rueckwaerts | M31 | – |
| magisches-quadrat-ergaenzen | M32 | M55 |
| magisches-quadrat-veraendern | M32 | – |
| handschlag-problem | M53 | – |
| vorwaerts-rueckwaerts-kombinieren | M29 | – |
| gewinnstrategie | M56 | M29 |
| unmoegliche-aufgabe | M31 | – |
| vorgehen-aendern | M41 | – |
| mittelstein-begruenden | M30 | M33 |
| rechenwege-vergleichen | M25 | – |
| passt-die-begruendung | M33 | – |
| teiler-begruenden | M37 | M33 |
| schaetzung-begruenden | M13 | – |
| erklaeren-fuer-juengere | M34 | – |
| loesungsweg-weiterentwickeln | M36 | – |
| ergebnis-zur-situation | M35 | M17 |
| zwei-schritte-planen | M41 | – |
| situation-veraendern | M41 | – |
| rechnung-zur-geschichte | M17 | – |
| wertetabelle | M52 | M51 |
| passende-darstellung-waehlen | M41 | M51 |
| saeulendiagramm-tabelle | M50 | M51 |
| taschenrechner-wann | M25 | – |
| tausender-buendeln | M07 | – |
| grosse-zahlen-lesen | M06 | – |
| null-in-grossen-zahlen | M08 | – |
| zahlenstrahl-million | M11 | – |
| vergleichen-bis-million | M09 | – |
| grosse-zahlen-runden | M11 | M42 |
| fermi-schaetzen | M13 | – |
| zerlegen-grosse-zahlen | M08 | – |
| teiler-vielfache | M37 | – |
| analog-kopfrechnen-million | M23 | – |
| ergaenzen-stufenzahlen | M15 | – |
| mal-geteilt-stufenzahlen | M23 | M08 |
| schriftlich-plus-minus-million | M26 | – |
| halbschriftlich-mal-geteilt-million | M36 | M38 |
| schriftlich-mal-ohne-uebertrag | M39 | – |
| schriftlich-mal-uebertrag | M39 | – |
| schriftlich-mal-null | M39 | – |
| mal-zehnerzahl | M39 | – |
| schriftlich-mal-zweistellig | M39 | – |
| ueberschlag-mal | M42 | M39 |
| schriftlich-geteilt-ohne-rest | M38 | – |
| schriftlich-geteilt-erste-stelle | M38 | – |
| schriftlich-geteilt-null-ergebnis | M38 | – |
| schriftlich-geteilt-rest | M38 | – |
| schriftlich-geteilt-durch-10 | M38 | – |
| probe-teilen | M38 | – |
| terme-vergleichen | M10 | M36 |
| anna-zahlen | M28 | M26 |
| geheimschrift-zahlen | M55 | – |
| schreibweisen-groessen | M08 | – |
| groessen-ordnen-gemischt | M08 | – |
| zeitspannen-ueber-tage | M49 | M48 |
| fahrplaene | M51 | M48 |
| menge-und-preis | M52 | M43 |
| rueckwaerts-rechnen-sachaufgabe | M29 | M41 |
| genau-oder-ungefaehr | M42 | – |
| diagramme-kritisch-lesen | M51 | – |
| kombinatorik-reihenfolge | M53 | – |
| chancen-veraendern | M54 | – |
| zahlenmauer-unbekannte | M30 | – |
| siegerpodest-reihenfolgen | M53 | – |
| raetsel-mit-tabelle | M55 | – |
| knobelaufgabe-erfinden | M30 | – |
| allgemein-statt-beispiel | M33 | – |
| anna-zahlen-erklaeren | M33 | – |
| ueberschlag-als-beweis | M42 | – |
| gewinnchance-begruenden | M54 | M33 |
| mathe-konferenz | M34 | – |
| fermi-teilfragen | M13 | – |
| annahme-pruefen | M13 | – |
| mit-ungefaehren-zahlen-rechnen | M13 | – |
| je-mehr-desto-weniger | M52 | M38 |
| darstellungen-bewerten | M51 | – |
| rechenweg-notiz | M34 | – |
| algorithmus-befolgen | M29 | M34 |

## 4. Offene Fragen an den Auftraggeber

1. **Zahl der Spiele.** 56 statt 35–40. Vertretbare Zusammenlegungen (jeweils mit kleinem Verlust an Isolation):
   M09 Aufdecken in M08 Stellentafel · M31 Rechendreieck und M32 Zauberquadrat zu „Rechenfiguren“ · M46 Umfüllen und
   M45 Wiegen zu „Messen mit Geräten“ · M49 Kalender in M48 Wie lange? · M51 Ablesen in M50 Säulen bauen · M56 Wer sagt
   20? als Spielform von M29. Damit wären es etwa 49. Empfehlung: erst M51→M50 und M49→M48, der Rest getrennt.
2. **Die 13 Themen ohne rid.** Vorschlag: nicht als eigene Lernplan-Themen behalten, sondern als Pakete der Spiele:
   rechnen-3 … rechnen-10 gehen in aufgabenfamilie-bis-10 auf (je Zahl ein Paket in M16, die Zerlegung bleibt bei
   zerlegen-n); plus-zur-20 in ergaenzen-zum-zehner bzw. minus-bis-zur-10 (M15); plus-bis-30 und minus-bis-30 in
   plus-/minus-ueber-den-zehner-bis-100 (M24, Zahlraum als Stufe); plus-bis-100 und minus-bis-100 in
   plus-/minus-zweistellig-mit-uebergang (M24, gemischtes Paket). Zugeordnet habe ich sie trotzdem.
3. **Spiegel und Symmetrie.** M19 (verdoppeln mit Spiegel) und Geometrie (symmetrie-erkennen, -ergaenzen) nutzen
   dasselbe Werkzeug. Ein gemeinsames Spiel mit zwei Fächern oder bewusst zwei Spiele?
4. **Zwei-Personen-Ablauf.** M56 und die Mathe-Konferenz (M34) brauchen „abwechselnd am selben Gerät“. Soll
   `bedienung.md` das bekommen, oder bleiben diese Themen beim Mach-mit-Angebot ohne eigenes Spiel?
5. **Geld als Lernzeichen.** Echte Euro-Abbildungen (EZB-Regeln, Sachbild mit Echt-Zeichen) oder vereinfachte Münzen
   mit Wertaufdruck (Lernzeichen)? Ich empfehle vereinfacht, aber in Größe und Farbe wie echt.
