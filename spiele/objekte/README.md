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
- `muenze.js` – kleiner Stapel goldfarbener Münzen mit einer Münze daneben (ohne Ziffer und Wappen).
- `broetchen.js` – Papiertüte vom Bäcker mit zwei Brötchen (ohne Schrift und Ziffer).
- `eierkarton.js` – offener Eierkarton aus Pappe mit sechs Mulden und je einem Ei (ohne Schrift und Ziffer).
- `gedeck.js` – ein gedeckter Platz von oben: Teller, Gabel, Löffel und Becher (vier Dinge; ohne Schrift und Ziffer).
- `nudelteller.js` – zwei flache Teller nebeneinander mit Nudeln (Penne), links drei, rechts vier (eine Zahl in zwei Teilen; ohne Schrift und Ziffer).
- `wuerfel.js` – ein Spielwürfel, schräg von oben, drei Seiten mit Augen (ohne Ziffer und Schrift).
- `versteckvorhang.js` – ein Vorhang an der Stange mit angehobenem Saum, darunter zwei Schuhspitzen (Versteckspiel;
  keine Person zu sehen, ohne Ziffer und Schrift).
- `loeffel-klammern.js` – ein Löffel, darunter zwei Wäscheklammern aus Holz, eine je Silbe von „Löf-fel“ (ohne Schrift und
  Ziffer).

Eine Datei je Art, angemeldet beim Import; Name der Datei = Name der Art (so lädt `<ls-objekt>` eine unbekannte Art
selbst nach). Ansehen: `spiele/rahmen/vorschau.html?objekte`. Prüfen: `tests/objekte.test.mjs`.
