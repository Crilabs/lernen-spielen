// <ls-objekt art="wertstofftonne" zustand="zu|offen|voll" wert="…">: die Gelbe Tonne (Leichtverpackungen aus
// Metall, Kunststoff und Verbund, z. B. Konservendosen und Getränkekartons; mancherorts „Wertstofftonne“). In
// Deutschland ist sie gelb (ganz gelb oder mit gelbem Deckel); hier ganz gelb, mit Dose und Karton auf dem Aufkleber.
// Schnitt und Bewegungen: tonne.js.
// Farbe der Welt-Schicht (grundsaetze-bilder 6.2): heller und weicher als die Lernzeichen, damit die Tonne nicht
// mit den Perlen verwechselt wird (gelb: Perle 4 #F7D038; blau: Perlen 5 #6CB8F0 und 9 #2F5BC4).

import { form, pfad, zusammen } from "../runde/kinder/stil.js";
import { meldeTonne } from "./tonne.js";
import { verschiebe } from "./objekt.js";
import { doseStueck } from "./dose.js";

export const GELB = "#F3D98A";
const KARTON = "#8FD3EE";
const WEICH = "#6B5C96";

meldeTonne("wertstofftonne", {
  farbe: GELB,
  ding: "dose",
  zeichen: `<g fill="#FFFCF7" stroke="${WEICH}" stroke-width="3"><path d="M82 146 L98 146 L98 170 Q98 173 95 173 L85 173 Q82 173 82 170 Z"/>`
    + `<ellipse cx="90" cy="146" rx="8" ry="3"/><path d="M82 152 L98 152 M82 166 L98 166" fill="none"/>`
    + `<path d="M104 173 L104 147 L111 139 L118 147 L118 173 Z"/><path d="M104 147 L118 147" fill="none"/></g>`,
  inhalt: () => zusammen(
    verschiebe(doseStueck(), "translate(34 24) rotate(-14 26 26) scale(0.52)"),
    form(pfad(`M88 100 L90 56 L101 46 L112 56 L110 100 Z`), KARTON, [93, 57], { s: 0.9 }),
    { svg: `<path d="M90 56 L101 46 L112 56 Z" fill="#FFFCF7" stroke="none"/>`, kontur: "" },
    form(pfad(`M130 100 L136 76 L154 80 L150 100 Z`), "#FFFCF7", [138, 80], { s: 0.9 }),
  ),
});
