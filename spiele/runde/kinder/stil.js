// Zeichenhelfer für den Stil der Runde: flache Flächen mit einer Schattenstufe (Licht von oben links),
// Kontur Tinte, sich verjüngende Glieder, Hände mit Fingern. Ohne clipPath, weil SVG-Teile keine id tragen dürfen:
// Jede Fläche wird dreimal gezeichnet – Schattenton, darüber die Grundfarbe verkleinert um einen Punkt oben links
// (bei konvexen Formen bleibt sie innen, übrig bleibt eine Sichel unten rechts), zuletzt die Kontur.

export const INK = "#3B2A6B";

/** @param {number} n */
export const z = (n) => String(Math.round(n * 100) / 100);

/** @param {string} hex @returns {number[]} */
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

/**
 * Schattenton: Grundfarbe zur Tinte hin gemischt, damit alle Schatten in einer Familie liegen.
 * @param {string} hex @param {number} [anteil]
 */
export function dunkler(hex, anteil = 0.24) {
  const a = rgb(hex);
  const b = rgb(INK);
  return "#" + a.map((v, i) => Math.round(v + (b[i] - v) * anteil).toString(16).padStart(2, "0")).join("").toUpperCase();
}

/**
 * Fläche mit Schattenstufe und Kontur.
 * @param {string} geo Element ohne Füllung, z. B. `path d="…"` oder `ellipse cx=…`
 * @param {string} farbe @param {[number, number]} licht Punkt oben links in der Fläche @param {number} [s] Größe der hellen Fläche
 * @param {number} [strich]
 */
export function form(geo, farbe, licht, s = 0.88, strich = 4) {
  const [lx, ly] = licht;
  return `<${geo} fill="${dunkler(farbe)}" stroke="none"/>`
    + `<${geo} fill="${farbe}" stroke="none" transform="translate(${z(lx)} ${z(ly)}) scale(${s}) translate(${z(-lx)} ${z(-ly)})"/>`
    + `<${geo} fill="none" stroke-width="${strich}"/>`;
}

/** Fläche ohne Schatten (kleine Teile). @param {string} geo @param {string} farbe @param {number} [strich] */
export const flach = (geo, farbe, strich = 4) => `<${geo} fill="${farbe}" stroke-width="${strich}"/>`;

/** @param {string} d */
export const pfad = (d) => `path d="${d}"`;
/** @param {number} cx @param {number} cy @param {number} rx @param {number} ry */
export const oval = (cx, cy, rx, ry) => `ellipse cx="${z(cx)}" cy="${z(cy)}" rx="${z(rx)}" ry="${z(ry)}"`;
/** @param {string} d @param {number} [w] */
export const linie = (d, w = 3) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w}"/>`;

/**
 * Sich verjüngende Kapsel von p1 (Radius r1) nach p2 (Radius r2), als Geometrie für form().
 * @param {[number, number]} p1 @param {number} r1 @param {[number, number]} p2 @param {number} r2
 */
export function kapsel(p1, r1, p2, r2) {
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  const l = Math.hypot(dx, dy) || 1;
  const n = [-dy / l, dx / l];
  /** @param {[number, number]} p @param {number} r @param {number} k */
  const P = (p, r, k) => `${z(p[0] + n[0] * r * k)} ${z(p[1] + n[1] * r * k)}`;
  return pfad(`M${P(p1, r1, 1)} L${P(p2, r2, 1)} A${z(r2)} ${z(r2)} 0 0 0 ${P(p2, r2, -1)}`
    + ` L${P(p1, r1, -1)} A${z(r1)} ${z(r1)} 0 0 0 ${P(p1, r1, 1)} Z`);
}

/**
 * Glied: Kapsel mit Schattenstufe; das Licht liegt auf der linken Seite des Ansatzes.
 * @param {[number, number]} p1 @param {number} r1 @param {[number, number]} p2 @param {number} r2 @param {string} farbe
 */
export function glied(p1, r1, p2, r2, farbe) {
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  const l = Math.hypot(dx, dy) || 1;
  const licht = /** @type {[number, number]} */ ([p1[0] - (dy / l) * r1 * 0.5, p1[1] + (dx / l) * r1 * 0.5]);
  return form(kapsel(p1, r1, p2, r2), farbe, licht, 0.8);
}

/**
 * Handformen an einem Handgelenk w; die Hand zeigt in Richtung +y (Arm hängt) und dreht mit dem Unterarm.
 * seite = +1, wenn der Daumen zur Bildmitte rechts liegt, sonst -1.
 * @param {[number, number]} w @param {string} haut @param {1|-1} seite
 * @returns {{offen: string, faust: string, zeigen: string}}
 */
export function haende(w, haut, seite) {
  const [x, y] = w;
  const mx = x;
  const my = y + 10;
  /** Finger als kräftige Kapsel aus dem Handteller heraus. @param {number} grad @param {number} laenge @param {number} [r] */
  const finger = (grad, laenge, r = 3.6) => {
    const a = (grad * Math.PI) / 180;
    const p1 = /** @type {[number, number]} */ ([mx + Math.sin(a) * 4, my + Math.cos(a) * 4]);
    const p2 = /** @type {[number, number]} */ ([mx + Math.sin(a) * (6 + laenge), my + Math.cos(a) * (6 + laenge)]);
    return form(kapsel(p1, r, p2, r * 0.92), haut, p1, 0.8, 3);
  };
  const daumen = form(kapsel([mx + seite * 5, my - 3], 4, [mx + seite * 12, my + 3], 3.5), haut, [mx + seite * 5, my - 3], 0.8, 3);
  const teller = form(oval(mx, my, 9, 9), haut, [mx - 3, my - 4], 0.84, 3.2);
  const faust = form(oval(mx, my + 1, 9.5, 9), haut, [mx - 3, my - 3], 0.84, 3.2)
    + linie(`M${z(mx - 5)} ${z(my + 4)} Q${z(mx)} ${z(my + 7)} ${z(mx + 5)} ${z(my + 4)}`, 2.4);
  return {
    offen: [-38, -13, 12, 36].map((g, i) => finger(g, i === 0 || i === 3 ? 5 : 7)).join("") + teller + daumen,
    faust: faust + daumen,
    zeigen: faust + finger(0, 12, 3.8),
  };
}
