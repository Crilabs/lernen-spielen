# Gemeinsame Objekte

Animierte SVG-Objekte der Sachwelt im Stil der Runde, die mehrere Spiele nutzen (Tonne, Baum, Korb …). Objekte, die nur
ein Spiel braucht, liegen im Ordner dieses Spiels unter `objekte/` (siehe „Ablage“ in `docs/spielentwicklung.md`).
Regal-Bilder (`regal` in `spiele.json`) müssen hier liegen.

- `objekt.js` – der Baustein `<ls-objekt art zustand wert still>`, `meldeObjekt`, `bild`, `verschiebe`, `wirf`.
  Schnittstelle: `docs/spielentwicklung.md`, Abschnitt „Spielobjekte“.
- `tonne.js` – gemeinsamer Schnitt und Bewegungen der Mülltonnen (zu, offen, voll; Deckel klappt auf, Ding fällt
  hinein, Tonne wackelt satt).
- `papiertonne.js` – blaue Papiertonne (Aufkleber: Blatt). `wertstofftonne.js` – Gelbe Tonne / Wertstofftonne
  (Aufkleber: Dose und Karton). Farben der Welt-Schicht, heller und weicher als die Perlen (6.2).
- `schuhpaar.js` – ein Paar Turnschuhe (blau und koralle).
- `papier.js` – zerknülltes Heftpapier. `dose.js` – leere Konservendose (keine Getränkedose: die hat Pfand).
- `muenze.js` – kleiner Stapel goldfarbener Münzen mit einer Münze daneben (ohne Ziffer und Wappen); Zustand
  `zehn-cent`: eine Zehn-Cent-Münze mit der Prägung „10“ wie die echte (Packung der Zehnerreihe in M37).
- `ballroehre.js` – durchsichtige Röhre mit drei Bällen. `wochenschachtel.js` – Schachtel mit sieben Fächern, Deckel
  aufgeklappt. `stiftebox.js` – Dose mit acht Buntstiften. `muffinkarton.js` – Karton mit neun Muffins (3 × 3). Alle
  ohne Schrift und Ziffer, Farben nur aus den Welt-Paletten (Packungen der Reihen 3, 7, 8, 9 in M37).
- `broetchen.js` – Papiertüte vom Bäcker mit zwei Brötchen (ohne Schrift und Ziffer).
- `eierkarton.js` – offener Eierkarton aus Pappe mit sechs Mulden und je einem Ei (ohne Schrift und Ziffer).
- `gedeck.js` – ein gedeckter Platz von oben: Teller, Gabel, Löffel und Becher (vier Dinge; ohne Schrift und Ziffer).
- `einkaufskorb.js` – geflochtener Einkaufskorb mit hohem Henkel (leer, gefuellt: Packungen schauen heraus); Figur von
  M37 Kettenhüpfer, Packungen fallen hinein (Einwurf), der Korb wackelt satt. Ausgabe im Maßstab 1,5, damit die
  Kontur bei der Spielgröße so stark ist wie bei den Kindern der Runde.
- `nudelteller.js` – zwei flache Teller nebeneinander mit Nudeln (Penne), links drei, rechts vier (eine Zahl in zwei Teilen; ohne Schrift und Ziffer).
- `wuerfel.js` – ein Spielwürfel, schräg von oben, drei Seiten mit Augen (ohne Ziffer und Schrift).
- `versteckvorhang.js` – ein Vorhang an der Stange mit angehobenem Saum, darunter zwei Schuhspitzen (Versteckspiel;
  keine Person zu sehen, ohne Ziffer und Schrift).
- `loeffel-klammern.js` – ein Löffel, darunter zwei Wäscheklammern aus Holz, eine je Silbe von „Löf-fel“ (ohne Schrift und
  Ziffer).
- `faltzettel.js` – aufgeklapptes, dreimal gefaltetes Blatt (2 mal 4 Felder), ein Feld schon als Merkzettel abgerissen und daneben (ohne Schrift und Ziffer).
- `brotzeitteller.js` – ein flacher Teller schräg von vorn mit drei runden Keksen (Brotzeit verteilt; ohne Schrift und Ziffer).
- `erhobene-haende.js` – zwei erhobene Hände einer Person, an der rechten der Daumen eingeklappt (zehn Finger, einer weg; ohne Schrift und Ziffer).
- `eintrittskarte.js` – zwei Eintrittskarten aus Papier, schräg übereinander (Hellblau und Koralle; Kerben, Abriss mit gestrichelter Linie, ohne Schrift und Ziffer).
- `wandkalender.js` – Wandkalender aus Papier am Nagel: oben ein Bild, unten 5 Wochen-Zeilen mit je 7 Kästchen, ein Tag
  umkringelt (ohne Schrift und Ziffer).
- `hausfassade.js` – Vorderseite eines hohen Wohnhauses mit Giebeldach; Fenster in Reihen und Spalten, unten die Haustür (ohne Schrift und Ziffer).
- `flaschen-sechserpack.js` – ein Sechserpack Wasserflaschen in Folie mit Tragschlaufe, drei vorne, drei hinten (ohne Etikett, Schrift und Ziffer).
- `erdbeerschale.js` – helle Schüssel mit blauem Band, darin ein Berg Erdbeeren, leicht von oben (ohne Schrift und Ziffer).
- `kartoffeltopf.js` – Kochtopf aus Emaille (Koralle) mit hellem Rand und zwei Griffen, oben ein Berg Kartoffeln (ohne Herd, Dampf, Schrift und Ziffer).
- `muenzglas.js` – Schraubglas mit Deckel, unten voll goldfarbener Münzen (Kleingeld-Glas; ohne Schrift und Ziffer).
- `spielkarten.js` – fünf Spielkarten als Fächer, nur Rückseiten (Koralle mit heller Raute; ohne Schrift, Ziffer und
  Kartenfarben).
- `keksblech.js` – flaches Backblech, leicht von oben, mit runden Keksen in gleich langen Reihen (4 mit je 6; ohne Schrift und Ziffer).
- `keksteller.js` – flacher Teller von der Seite mit einem kleinen Haufen runder Kekse (3, 2, 1; ohne Schrift und Ziffer).
- `auftragszettel.js` – ein Zettel vom Block mit drei Zeilen Bleistift-Gekritzel und dem Bleistift daneben (Wellen statt Buchstaben; ohne Schrift und Ziffer).
- `tischkaertchen.js` – gefaltetes Tischkärtchen, das wie ein Dach steht, mit einer Wellenlinie als Name und einem Buntstift davor (ohne Buchstaben und Ziffer).
- `glueckwunschkarte.js` – Karte mit gemalter Blume, halb aus dem offenen Briefumschlag gezogen (ohne Schrift und Ziffer).
- `nudelpackung.js` – stehende Nudelpackung aus Pappe mit Sichtfenster und Röhrennudeln (ohne Schrift und Ziffer).
- `ringelsocken.js` – ein Paar lange Ringelsocken von der Seite (grün mit hellen Ringeln, Ferse und Spitze koralle; ohne Schrift und Ziffer).
- `kramkiste.js` – offene Holzkiste mit drei Buntstiften und einem Pinsel, vorn ein leerer Zettel als Beschriftung (ohne Schrift und Ziffer).
- `waeschestapel.js` – Stapel gefalteter Wäsche: unten ein Handtuch, darauf eine Hose, oben ein Pulli (ohne Schrift und Ziffer).
- `einkaufstasche.js` – volle Stofftasche nach dem Einkauf mit hohem Henkelbogen, oben Milchtüte und Lauch (ohne Schrift und Ziffer).

Eine Datei je Art, angemeldet beim Import; Name der Datei = Name der Art (so lädt `<ls-objekt>` eine unbekannte Art
selbst nach). Ansehen: `spiele/rahmen/vorschau.html?objekte`. Prüfen: `tests/objekte.test.mjs`.
