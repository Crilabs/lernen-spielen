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

Eine Datei je Art, angemeldet beim Import; Name der Datei = Name der Art (so lädt `<ls-objekt>` eine unbekannte Art
selbst nach). Ansehen: `spiele/rahmen/vorschau.html?objekte`. Prüfen: `tests/objekte.test.mjs`.
