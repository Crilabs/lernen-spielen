// Ela – figuren.md §2: mittelbraune Haut, dunkle Haare in zwei Zöpfen, Brille. Läuft, klettert.
// Kleidung Senfgelb gedämpft (vorläufig bis zur Freigabe der ersten Zeichnung, figuren.md §9).

import { meldeKind } from "../bestand.js";
import { dreiviertel, ellipse, flaeche, INK } from "./schnitt.js";

const farben = { haut: "#B97E57", haar: "#4A2E2A", oben: "#D9B85C", unten: "#6F6A86", schuhe: "#F4EFE6" };
const BAND = "#7FB3C9";

/** Zopf aus drei Gliedern mit Band. @param {number} x @param {number} y */
const zopf = (x, y) =>
  [0, 1, 2].map((i) => ellipse(x, y + i * 15, 9 - i, 9, farben.haar)).join("")
  + `<path d="M${x - 7} ${y + 40} l7 -5 l7 5 l-7 5 Z" fill="${BAND}" stroke-width="3"/>`;

const kopfDreiviertel = {
  haareHinten: ellipse(162, 66, 45, 42, farben.haar) + zopf(119, 98) + zopf(203, 94),
  haareOben: flaeche(
    "M120 82 C114 42 138 25 164 25 C192 25 210 42 206 76 C200 60 190 50 176 49 C170 56 158 58 146 54 C134 58 124 68 120 82 Z",
    farben.haar,
  ) + `<path d="M166 27 Q162 38 166 50" fill="none" stroke="${INK}" stroke-width="3"/>`,
  nachGesicht: `<g fill="none" stroke="${INK}">`
    + `<circle cx="157" cy="80" r="11" stroke-width="3.5"/><circle cx="183" cy="80" r="10" stroke-width="3.5"/>`
    + `<path d="M168 79 Q170 77 173 79" stroke-width="3"/><path d="M146 79 L126 76" stroke-width="3"/></g>`,
};

meldeKind({
  id: "ela",
  name: "Ela",
  pronomen: "sie",
  bewegt: "geht",
  entwurf: true,
  ansichten: {
    dreiviertel: dreiviertel({ breite: 1, farben, kopf: kopfDreiviertel }),
  },
});
