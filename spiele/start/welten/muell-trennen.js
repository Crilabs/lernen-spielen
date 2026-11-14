// Weltandeutung „Müll trennen“ (M14 Zwei Tonnen): zwei Tonnen auf der Wiese. Koordinaten im Bogen 0 0 240 280.
// Stil der Runde: Kontur nur außen, Schatten in Stufen, Fugen im dunklen Ton.
import { zeichner, form, flach, ton, naht, dunkler, heller } from "../zeichnen.js";

const zz = zeichner("welt-muell", 2.4);

/** @param {number} x @param {string} farbe */
const tonne = (x, farbe) => zz.guss(
  form(`path d="M${x + 4} 168 L${x + 50} 168 L${x + 46} 232 L${x + 8} 232Z"`, farbe, [x + 14, 174], { s: 0.84 }),
  naht(`M${x + 12} 182 L${x + 14} 222M${x + 27} 182 L${x + 27} 224M${x + 42} 182 L${x + 40} 222`, farbe, 1.4),
  flach(`rect x="${x - 2}" y="156" width="58" height="16" rx="6"`, dunkler(farbe, 0.08)),
  ton(`M${x + 2} 158 L${x + 52} 158 L${x + 52} 162 L${x + 2} 162Z`, heller(farbe, 0.32)),
  ton(`M${x - 2} 166 L${x + 56} 166 L${x + 56} 172 L${x - 2} 172Z`, dunkler(farbe, 0.34)),
  flach(`rect x="${x + 18}" y="148" width="18" height="10" rx="4"`, dunkler(farbe, 0.18)),
  form(`circle cx="${x + 14}" cy="233" r="6"`, "#5A5370", [x + 12, 231]), form(`circle cx="${x + 40}" cy="233" r="6"`, "#5A5370", [x + 38, 231]),
);

export default `<ellipse cx="120" cy="236" rx="78" ry="7" fill="${dunkler("#A5D78E", 0.26)}"/>` + tonne(62, "#5E9FD8") + tonne(124, "#F5CD4B");
