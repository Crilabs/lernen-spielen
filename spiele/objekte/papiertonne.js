// <ls-objekt art="papiertonne" zustand="zu|offen|voll" wert="…">: die blaue Papiertonne (Altpapier: Papier, Pappe,
// Kartons). In Deutschland ist die Papiertonne blau (ganz blau oder mit blauem Deckel); hier ganz blau, damit
// Kinder sie an der Farbe und am Aufkleber mit dem Blatt erkennen. Schnitt und Bewegungen: tonne.js.
// Farbe der Welt-Schicht (grundsaetze-bilder 6.2): heller und weicher als die Lernzeichen, damit die Tonne nicht
// mit den Perlen verwechselt wird (gelb: Perle 4 #F7D038; blau: Perlen 5 #6CB8F0 und 9 #2F5BC4).

import { form, naht, pfad, zusammen } from "../runde/kinder/stil.js";
import { meldeTonne } from "./tonne.js";
import { PAPIER } from "./papier.js";

export const BLAU = "#7FA9D6";
const PAPPE = "#D2A56E";
const WEICH = "#6B5C96";

meldeTonne("papiertonne", {
  farbe: BLAU,
  ding: "papier",
  zeichen: `<g fill="${PAPIER}" stroke="${WEICH}" stroke-width="3"><path d="M89 135 L106 135 L115 144 L115 173 L89 173 Z"/>`
    + `<path d="M106 135 L106 144 L115 144" fill="none"/><path d="M95 153 L109 153 M95 160 L109 160 M95 167 L104 167" fill="none"/></g>`,
  inhalt: () => zusammen(
    form(pfad(`M46 100 L48 40 L80 34 L86 100 Z`), PAPPE, [52, 42], { s: 0.9 }),
    naht(`M48 40 L58 100`, PAPPE, 2),
    form(pfad(`M84 100 L90 46 L120 52 L114 100 Z`), PAPIER, [92, 50], { s: 0.92 }),
    { svg: `<path d="M92 58 L118 63 M91 68 L117 73" fill="none" stroke="#8FD3EE" stroke-width="2"/>`, kontur: "" },
    form(pfad(`M126 100 L142 74 L158 84 L151 100 Z`), "#E9E4EF", [140, 78], { s: 0.9 }),
  ),
});
