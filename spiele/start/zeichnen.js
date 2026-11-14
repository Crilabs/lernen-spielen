// Zeichenhilfen für die Startseite (Szene, Tore, Weltandeutungen) im Stil der Runde (figuren.md §4):
// Tinte nur um die vereinigte Silhouette, Schatten und Licht als Flächen innerhalb der Silhouette.

export const TINTE = "#3B2A6B";

/**
 * Ein Zeichner mit eigener Vorsilbe für die clipPath-Kennungen (mehrere Zeichnungen auf einer Seite).
 * @param {string} praefix
 * @param {number} kontur Breite der sichtbaren Kontur in Einheiten der Zeichnung
 */
export function zeichner(praefix, kontur) {
  let zaehler = 0;
  /** @param {string} f @param {string} attr */
  const mit = (f, attr) => f.replace(/\/?>$/, ` ${attr}/>`);
  return {
    /**
     * Silhouette mit Kontur: erst alle Formen als Tinte-Kontur, dann alle Flächen darüber. So entsteht eine Linie
     * nur außen um die vereinigte Form, nie zwischen den Teilen („aus einem Guss“).
     * @param {string[]} formen SVG-Elemente ohne fill/stroke, z. B. `<circle cx=".." cy=".." r=".."/>`
     * @param {string} fill
     * @param {string} [innen] Stufenschatten und Licht (ohne Kontur), auf die Silhouette zugeschnitten
     */
    guss(formen, fill, innen = "") {
      const umriss = formen.map((f) => mit(f, `fill="none" stroke="${TINTE}" stroke-width="${kontur * 2}" stroke-linejoin="round"`)).join("");
      const flaechen = formen.map((f) => mit(f, `fill="${fill}" stroke="none"`)).join("");
      if (!innen) return `<g>${umriss}${flaechen}</g>`;
      const id = `${praefix}-${++zaehler}`;
      return `<g>${umriss}${flaechen}<clipPath id="${id}">${formen.join("")}</clipPath><g clip-path="url(#${id})">${innen}</g></g>`;
    },
  };
}

/** Fläche ohne Kontur (Schatten, Licht). @param {string} d @param {string} fill */
export const flaeche = (d, fill) => `<path d="${d}" fill="${fill}" stroke="none"/>`;

/**
 * Text für HTML maskieren. Gleich wie `esc` in lernspiel.js; hier eigen, weil lernspiel.js nicht unter der
 * Typprüfung (tsconfig) steht und ein Import sie dort hineinziehen würde.
 * @param {unknown} text
 */
export function esc(text) {
  return String(text ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
