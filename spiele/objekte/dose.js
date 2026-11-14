// <ls-objekt art="dose">: eine leere Konservendose (Verpackung aus Metall, gehört in die Gelbe Tonne bzw.
// Wertstofftonne; Getränkedosen mit Pfand nicht – darum keine Getränkedose). Feld 0…100, Dose mittig, leicht
// von oben gesehen: Deckel als Oval mit Ring zum Aufziehen, Rillen über und unter dem Etikett.

import { form, flach, naht, pfad, oval, zusammen, heller, dunkler } from "../runde/kinder/stil.js";
import { meldeObjekt, bild } from "./objekt.js";

export const BLECH = "#C5CAD6";
const ETIKETT = "#FF9F8A";
const ETIKETT_FELD = "#FFFCF7";

/** Die Dose als Stück im Feld 0…100. @returns {import("../runde/kinder/stil.js").Stueck} */
export function doseStueck() {
  const koerper = form(pfad(`M30 24 L70 24 L70 80 Q70 86 64 86 L36 86 Q30 86 30 80 Z`), BLECH, [36, 30], { s: 0.9 });
  const etikett = form(pfad(`M30 38 L70 38 L70 72 L30 72 Z`), ETIKETT, [34, 42], { s: 0.9, kontur: false });
  const feld = flach(oval(48, 55, 10, 8), ETIKETT_FELD);
  const blatt = { svg: `<path d="M44 57 Q47 49 54 50 Q52 58 44 57 Z" fill="#9ED8A8" stroke="${dunkler("#9ED8A8", 0.5)}" stroke-width="1.4"/>`, kontur: "" };
  const glanz = { svg: `<path d="M35 28 L39 28 L39 36 L35 36 Z M35 74 L39 74 L39 82 L35 82 Z" fill="${heller(BLECH, 0.55)}" stroke="none"/>`, kontur: "" };
  const rillen = naht(`M30 30 L70 30 M30 34 L70 34 M30 76 L70 76 M30 80 L70 80`, BLECH, 1.6);
  const deckel = zusammen(
    form(oval(50, 24, 20, 6.5), heller(BLECH, 0.2), [42, 21], { s: 0.86 }),
    flach(oval(50, 24.6, 15, 4.4), dunkler(BLECH, 0.12)),
    naht(`M46 22 Q50 19 54 22 Q50 25 46 22 Z`, BLECH, 1.6),
  );
  return zusammen(koerper, { svg: etikett.svg, kontur: "" }, feld, blatt, glanz, rillen, deckel);
}

meldeObjekt("dose", {
  zustaende: ["liegt"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: doseStueck() }], ursprung: [50, 86] }),
});
