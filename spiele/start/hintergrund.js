// Dezente Landschaft hinter den Karten (Spec 2026-11-14-startseite-karten-design.md §3.3a): zwei, drei flache
// Hügelbänder mit heller Kante, nur in den Grundtönen der Farbwelt, ohne Kontur, ohne Einzelteile.
const NEBEL = "#F4F0FA";
const LINIE = "#E4DEF0";
const NAHT = "#CFC4E3";
const PAPIER = "#FFFCF7";

/** @returns {string} */
export function hintergrundSvg() {
  return `<svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">`
    + `<rect width="1920" height="1080" fill="${NEBEL}"/>`
    + `<path d="M0 800 C320 700 640 720 960 760 C1280 800 1600 700 1920 720 L1920 1080 L0 1080Z" fill="${LINIE}"/>`
    + `<path d="M0 790 C320 690 640 710 960 750 C1280 790 1600 690 1920 710 L1920 724 C1600 704 1280 804 960 764 C640 724 320 704 0 804Z" fill="${PAPIER}"/>`
    + `<path d="M0 930 C400 860 760 880 1120 910 C1440 936 1700 880 1920 890 L1920 1080 L0 1080Z" fill="${NAHT}"/>`
    + `</svg>`;
}
