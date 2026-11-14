// Weltandeutung „Müll trennen“ (M14 Zwei Tonnen): zwei Tonnen auf der Wiese. Koordinaten im Bogen 0 0 240 280.
import { zeichner, flaeche } from "../zeichnen.js";

const { guss } = zeichner("welt-muell", 4);

/** @param {number} x @param {string} farbe @param {string} schatten */
const tonne = (x, farbe, schatten) => guss([
  `<path d="M${x + 4} 168 L${x + 50} 168 L${x + 46} 232 L${x + 8} 232Z"/>`,
  `<rect x="${x - 2}" y="156" width="58" height="16" rx="6"/>`,
  `<rect x="${x + 18}" y="148" width="18" height="10" rx="4"/>`,
], farbe, flaeche(`M${x + 30} 172 L${x + 50} 172 L${x + 46} 232 L${x + 30} 232Z`, schatten)
  + flaeche(`M${x - 2} 166 L${x + 56} 166 L${x + 56} 172 L${x - 2} 172Z`, schatten));

export default tonne(62, "#5E9FD8", "#3F7FB8") + tonne(124, "#F5CD4B", "#D9A922");
