// Bleibende Bilder auf dem Papierbogen von G02 und die Dinge, die dorthin fliegen: je Verb ein Ding (malen: Blume, kleben:
// Stern, legen: Legestein, bauen: Klotz, rollen: Kugel, tupfen: Tupfen, stecken: Stecknadel, basteln: Windrad), dazu der Stift und die Hände.
// Im Stil der Runde: Kontur nur um die Silhouette (guss), Schatten in Stufen (form). Felder 0…100, ohne Schrift.
import { dunkler, flach, form, heller, naht, zeichner } from "../../start/zeichnen.js";

/** Farben der Dinge auf dem Bogen: reihum, nicht an eine Person gebunden (keine Bedeutungsfarben). */
export const MARKEN_FARBEN = Object.freeze(["#8FD3EE", "#F59A86", "#FFD95A", "#9ED8A8", "#C9A6E8", "#F4C98E"]);
/** Hauttöne der eigenen Hände; je Start einer (Annahme der Idee §3). */
export const HAUTTOENE = Object.freeze(["#F1C7A5", "#D9A07A", "#A9714B", "#7A4A2E"]);

/** @param {string} inhalt */
const svg = (inhalt) => `<svg viewBox="0 0 100 100" overflow="visible" xmlns="http://www.w3.org/2000/svg" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${inhalt}</svg>`;

/** Ein Stern mit n Zacken um (50, 50). @param {number} aussen @param {number} innen @param {number} [n] */
function sternPunkte(aussen, innen, n = 5) {
  const p = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? aussen : innen;
    const w = (Math.PI * i) / n - Math.PI / 2;
    p.push(`${(50 + r * Math.cos(w)).toFixed(1)},${(50 + r * Math.sin(w)).toFixed(1)}`);
  }
  return p.join(" ");
}

/**
 * Das bleibende Bild eines Verbs.
 * @param {string} verb @param {string} farbe
 * @returns {string} SVG-Text
 */
export function markeSvg(verb, farbe) {
  const zz = zeichner("g02marke", 3.2);
  switch (verb) {
    case "malen": {
      // Blume: Stiel, fünf Blütenblätter, gelbe Mitte
      const blaetter = [0, 1, 2, 3, 4].map((i) => {
        const w = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        return form(`circle cx="${(50 + 17 * Math.cos(w)).toFixed(1)}" cy="${(38 + 17 * Math.sin(w)).toFixed(1)}" r="12"`, farbe, [44, 30], { s: 0.86 });
      });
      return svg(zz.guss(
        flach(`rect x="46.5" y="50" width="7" height="44" rx="3.5"`, "#7FA36C"),
        flach(`path d="M53 76 Q70 66 74 78 Q64 86 53 82 Z"`, "#9ED8A8"),
        ...blaetter,
        form(`circle cx="50" cy="38" r="10"`, "#FFD95A", [46, 34], { s: 0.86 }),
      ));
    }
    case "kleben":
      return svg(zz.guss(
        flach(`polygon points="${sternPunkte(46, 22)}"`, "#FFFCF7"),
        form(`polygon points="${sternPunkte(38, 17)}"`, farbe, [42, 40], { s: 0.9, glanz: true }),
      ));
    case "legen":
      return svg(zz.guss(
        form(`path d="M26 24 L74 24 Q82 24 82 32 L82 68 Q82 76 74 76 L26 76 Q18 76 18 68 L18 32 Q18 24 26 24 Z"`, farbe, [24, 30], { s: 0.9 }),
        form(`path d="M34 34 L66 34 Q70 34 70 38 L70 62 Q70 66 66 66 L34 66 Q30 66 30 62 L30 38 Q30 34 34 34 Z"`, heller(farbe, 0.28), [36, 38], { s: 0.9, kontur: false }),
      ));
    case "bauen":
      return svg(zz.guss(
        form(`path d="M50 18 L84 34 L50 50 L16 34 Z"`, heller(farbe, 0.3), [40, 28], { s: 0.9 }),
        form(`path d="M16 34 L50 50 L50 88 L16 70 Z"`, farbe, [22, 44], { s: 0.9 }),
        form(`path d="M50 50 L84 34 L84 70 L50 88 Z"`, dunkler(farbe, 0.18), [56, 56], { s: 0.9 }),
        flach(`circle cx="50" cy="34" r="5"`, heller(farbe, 0.1), false),
      ));
    case "rollen":
      return svg(zz.guss(
        form(`circle cx="50" cy="52" r="38"`, farbe, [36, 38], { s: 0.9, glanz: true }),
        naht("M16 58 Q50 76 84 58", farbe, 3.2),
        naht("M20 40 Q50 58 80 40", farbe, 3.2),
      ));
    case "tupfen":
      return svg(zz.guss(
        form(`circle cx="34" cy="38" r="17"`, farbe, [28, 30], { s: 0.88 }),
        form(`circle cx="68" cy="34" r="13"`, heller(farbe, 0.12), [64, 30], { s: 0.88 }),
        form(`circle cx="54" cy="70" r="15"`, dunkler(farbe, 0.08), [48, 64], { s: 0.88 }),
      ));
    case "stecken":
      return svg(zz.guss(
        flach(`rect x="45" y="44" width="10" height="46" rx="3"`, "#B7BBC8"),
        flach(`path d="M45 90 L55 90 L50 100 Z"`, "#B7BBC8"),
        form(`circle cx="50" cy="32" r="29"`, farbe, [38, 20], { s: 0.88, glanz: true }),
      ));
    case "basteln":
      // Windrad aus vier Papierecken
      return svg(zz.guss(
        form(`path d="M50 50 L50 8 L90 28 Z"`, farbe, [56, 22], { s: 0.9 }),
        form(`path d="M50 50 L92 50 L72 90 Z"`, heller(farbe, 0.3), [72, 56], { s: 0.9 }),
        form(`path d="M50 50 L50 92 L10 72 Z"`, dunkler(farbe, 0.12), [38, 76], { s: 0.9 }),
        form(`path d="M50 50 L8 50 L28 10 Z"`, heller(farbe, 0.15), [26, 40], { s: 0.9 }),
        flach(`circle cx="50" cy="50" r="7"`, "#FFD95A"),
      ));
    default:
      return svg(zz.guss(form(`circle cx="50" cy="50" r="38"`, farbe, [38, 38])));
  }
}

/** Ein Buntstift, schräg: das Ding, das beim Malen fliegt (die Blume entsteht beim Landen). @param {string} farbe */
export function stiftSvg(farbe) {
  const zz = zeichner("g02stift", 3.2);
  return svg(zz.guss(
    form(`path d="M18 64 L74 18 L84 28 L28 74 Z"`, farbe, [30, 58], { s: 0.86 }),
    form(`path d="M74 18 L80 12 Q84 10 88 14 Q92 18 90 22 L84 28 Z"`, "#F59A86", [80, 14], { s: 0.86 }),
    form(`path d="M18 64 L28 74 L10 90 Z"`, "#F3D9B1", [16, 72], { s: 0.86 }),
    flach(`path d="M10 90 L13.5 82 L18 86.5 Z"`, "#4F8FB3"),
  ));
}

/** Ein Marienkäfer: der kleine Witz, wenn Lena dem Kind einen Käfer an den Platz malt. */
export function kaeferSvg() {
  const zz = zeichner("g02kaefer", 3.2);
  return svg(zz.guss(
    form(`ellipse cx="50" cy="56" rx="30" ry="26"`, "#F59A86", [40, 44], { s: 0.9 }),
    form(`circle cx="50" cy="26" r="13"`, "#6E5A4A", [46, 22], { s: 0.9 }),
    flach(`circle cx="38" cy="52" r="5"`, "#6E5A4A", false),
    flach(`circle cx="62" cy="52" r="5"`, "#6E5A4A", false),
    flach(`circle cx="50" cy="70" r="5"`, "#6E5A4A", false),
    naht("M50 32 L50 82", "#F59A86", 2.4),
  ));
}

/**
 * Eine Hand mit Ärmel von unten, die Finger zeigen nach oben (Feld 0 0 100 190); rechts gespiegelt.
 * @param {"links" | "rechts"} seite @param {string} haut @param {string} aermel
 */
export function handSvg(seite, haut, aermel) {
  const zz = zeichner(`g02hand${seite}`, 3);
  const g = zz.guss(
    form(`path d="M14 196 L22 96 Q22 86 32 86 L68 86 Q78 86 78 96 L86 196 Z"`, aermel, [24, 100], { s: 0.92, tiefe: 0.8 }),
    flach(`rect x="20" y="84" width="60" height="10" rx="4"`, heller(aermel, 0.2), false),
    form(`path d="M24 84 L24 52 Q24 40 36 40 Q48 40 48 52 L48 84 Z"`, haut, [28, 46], { s: 0.9 }),
    form(`path d="M44 84 L44 30 Q44 18 56 18 Q68 18 68 30 L68 84 Z"`, haut, [48, 24], { s: 0.9 }),
    form(`path d="M64 84 L64 46 Q64 36 74 36 Q84 36 84 46 L84 84 Z"`, haut, [68, 42], { s: 0.9 }),
    form(`path d="M8 92 Q4 78 14 70 Q24 64 30 76 L34 90 Z"`, haut, [12, 76], { s: 0.9 }),
  );
  const rahmen = `<svg viewBox="0 0 100 190" overflow="visible" xmlns="http://www.w3.org/2000/svg" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">`;
  return `${rahmen}${seite === "rechts" ? `<g transform="translate(100 0) scale(-1 1)">${g}</g>` : g}</svg>`;
}
