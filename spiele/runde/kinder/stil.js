// Zeichenhelfer für den Stil der Runde: aus einem Guss.
// Die Tintenlinie läuft nur um die Silhouette der ganzen Figur: Jede Form liefert ihre Fläche (ohne Rahmen)
// und ihre Kontur (nur Geometrie). zeichne.js legt alle Konturen als dicke Tintenfläche unter alle Flächen.
// Licht von oben links, eine flache Schattenstufe: Schattenton, darüber die Grundfarbe verkleinert um einen
// Punkt oben links (bei konvexen Formen bleibt sie innen, übrig bleibt eine Sichel unten rechts). Ohne clipPath,
// weil SVG-Teile keine id tragen dürfen.

export const INK = "#3B2A6B";

/** @typedef {{svg: string, kontur: string}} Stueck */

/** @param {number} n */
export const z = (n) => String(Math.round(n * 100) / 100);

/** @param {string} hex @returns {number[]} */
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

/**
 * Schattenton: Grundfarbe zur Tinte hin gemischt, damit alle Schatten in einer Familie liegen.
 * @param {string} hex @param {number} [anteil]
 */
export function dunkler(hex, anteil = 0.22) {
  const a = rgb(hex);
  const b = rgb(INK);
  return "#" + a.map((v, i) => Math.round(v + (b[i] - v) * anteil).toString(16).padStart(2, "0")).join("").toUpperCase();
}

/**
 * Lichtton: Grundfarbe zu warmem Weiß hin gemischt.
 * @param {string} hex @param {number} [anteil]
 */
export function heller(hex, anteil = 0.28) {
  const a = rgb(hex);
  const b = rgb("#FFF6E6");
  return "#" + a.map((v, i) => Math.round(v + (b[i] - v) * anteil).toString(16).padStart(2, "0")).join("").toUpperCase();
}

/** Mehrere Stücke zu einem. @param {...Stueck} teile @returns {Stueck} */
export const zusammen = (...teile) => ({ svg: teile.map((t) => t.svg).join(""), kontur: teile.map((t) => t.kontur).join("") });

/**
 * Fläche mit Schattenstufe. trenn: feine Linie im Schattenton um die Fläche, wo sie vor Gleichfarbigem liegt.
 * @param {string} geo Element ohne Füllung, z. B. `path d="…"` @param {string} farbe
 * @param {[number, number]} licht Punkt oben links in der Fläche
 * @param {{s?: number, trenn?: boolean, kontur?: boolean, glanz?: boolean}} [o] kontur: false = trägt nicht zur Silhouette bei;
 *   glanz: false = ohne Lichtstufe
 * @returns {Stueck}
 */
export function form(geo, farbe, licht, o = {}) {
  const [lx, ly] = licht;
  const s = o.s ?? 0.88;
  const g = s * 0.62;
  return {
    svg: `<${geo} fill="${dunkler(farbe, 0.3)}" stroke="none"/>`
      + `<${geo} fill="${farbe}" stroke="none" transform="translate(${z(lx)} ${z(ly)}) scale(${s}) translate(${z(-lx)} ${z(-ly)})"/>`
      + (o.glanz === false ? "" : `<${geo} fill="${heller(farbe)}" stroke="none" opacity="0.85"`
        + ` transform="translate(${z(lx)} ${z(ly)}) scale(${z(g)}) translate(${z(-lx)} ${z(-ly)})"/>`)
      + (o.trenn ? `<${geo} fill="none" stroke="${dunkler(farbe, 0.5)}" stroke-width="2"/>` : ""),
    kontur: o.kontur === false ? "" : `<${geo}/>`,
  };
}

/** Fläche ohne Schatten. @param {string} geo @param {string} farbe @returns {Stueck} */
export const flach = (geo, farbe) => ({ svg: `<${geo} fill="${farbe}" stroke="none"/>`, kontur: `<${geo}/>` });

/** Feine Innenlinie im Schattenton einer Farbe (Naht, Falte, Schnürung). @param {string} d @param {string} farbe @param {number} [w] */
export const naht = (d, farbe, w = 2.2) => ({ svg: `<path d="${d}" fill="none" stroke="${dunkler(farbe, 0.5)}" stroke-width="${w}"/>`, kontur: "" });

/** Falte oder Schlagschatten als dunkle Form (keine Linie). @param {string} d @param {string} farbe @param {number} [anteil] */
export const falte = (d, farbe, anteil = 0.32) => ({ svg: `<path d="${d}" fill="${dunkler(farbe, anteil)}" stroke="none"/>`, kontur: "" });

/** Glanzstrich (Haar, Stoff). @param {string} d @param {string} farbe @param {number} [w] */
export const glanz = (d, farbe, w = 2.6) => ({ svg: `<path d="${d}" fill="none" stroke="${heller(farbe, 0.45)}" stroke-width="${w}" opacity="0.8"/>`, kontur: "" });

/** Weiche Röte (Wangen). @param {number} cx @param {number} cy @param {number} rx @param {number} ry */
export const roete = (cx, cy, rx, ry) => ({ svg: `<ellipse cx="${z(cx)}" cy="${z(cy)}" rx="${z(rx)}" ry="${z(ry)}" fill="#E9806A" opacity="0.35" stroke="none"/>`, kontur: "" });

/** Tintenlinie innen (Gesichtszüge, Brille). @param {string} d @param {number} [w] */
export const tinte = (d, w = 3) => ({ svg: `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w}"/>`, kontur: "" });

/** @param {string} d */
export const pfad = (d) => `path d="${d}"`;
/** @param {number} cx @param {number} cy @param {number} rx @param {number} ry */
export const oval = (cx, cy, rx, ry) => `ellipse cx="${z(cx)}" cy="${z(cy)}" rx="${z(rx)}" ry="${z(ry)}"`;

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
 * Glied mit Schattenstufe; das Licht liegt auf der linken Seite des Ansatzes.
 * @param {[number, number]} p1 @param {number} r1 @param {[number, number]} p2 @param {number} r2 @param {string} farbe
 * @param {{trenn?: boolean}} [o]
 */
export function glied(p1, r1, p2, r2, farbe, o = {}) {
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  const l = Math.hypot(dx, dy) || 1;
  const licht = /** @type {[number, number]} */ ([p1[0] - (dy / l) * r1 * 0.5, p1[1] + (dx / l) * r1 * 0.5]);
  return form(kapsel(p1, r1, p2, r2), farbe, licht, { s: 0.8, trenn: o.trenn });
}

/**
 * Handformen an einem Handgelenk w; die Hand zeigt in Richtung +y (Arm hängt) und dreht mit dem Unterarm.
 * daumen = +1: Daumen rechts, -1: links.
 * @param {[number, number]} w @param {string} haut @param {1|-1} daumen
 * @returns {{offen: Stueck, faust: Stueck, zeigen: Stueck}}
 */
export function haende(w, haut, daumen) {
  const [mx, wy] = w;
  const my = wy + 9;
  /** @param {number} grad @param {number} laenge @param {number} [r] */
  const finger = (grad, laenge, r = 3.4) => {
    const a = (grad * Math.PI) / 180;
    const p1 = /** @type {[number, number]} */ ([mx + Math.sin(a) * 4, my + Math.cos(a) * 4]);
    const p2 = /** @type {[number, number]} */ ([mx + Math.sin(a) * (6 + laenge), my + Math.cos(a) * (6 + laenge)]);
    return form(kapsel(p1, r, p2, r * 0.9), haut, p1, { s: 0.8 });
  };
  const d = form(kapsel([mx + daumen * 5, my - 3], 4, [mx + daumen * 12, my + 3], 3.4), haut, [mx + daumen * 5, my - 3], { s: 0.8 });
  const teller = form(oval(mx, my, 9, 9), haut, [mx - 3, my - 4], { s: 0.84 });
  const faust = zusammen(
    form(oval(mx, my + 1, 9.5, 9), haut, [mx - 3, my - 3], { s: 0.84 }),
    naht(`M${z(mx - 5)} ${z(my + 4)} Q${z(mx)} ${z(my + 7)} ${z(mx + 5)} ${z(my + 4)}`, haut),
  );
  return {
    offen: zusammen(...[-38, -13, 12, 36].map((g, i) => finger(g, i === 0 || i === 3 ? 5 : 7)), teller, d),
    faust: zusammen(faust, d),
    zeigen: zusammen(faust, finger(0, 12, 3.6)),
  };
}
