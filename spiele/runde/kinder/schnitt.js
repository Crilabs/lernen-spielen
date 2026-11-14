// Gemeinsamer Schnitt der Runde: gleiche Kopfgröße, gleiche Augen- und Gelenkpunkte für alle Kinder.
// Ein Kind ändert nur Breite, Farben, Haare und Hilfsmittel. So passen Gesichter und Zubehör an alle vier.
// Zeichenvorgabe docs/figuren.md §4: Kontur Tinte, Strich 4, runde Enden, flache Farben, Kopf ≈ ⅓ der Höhe.

export const INK = "#3B2A6B";
/** Ursprung der Gesichtsteile (Mitte zwischen den Augen) je Ansicht – für alle Kinder gleich. */
export const GESICHT = { dreiviertel: [170, 80], profil: [188, 80] };

/** @param {number} n */
const z = (n) => String(Math.round(n * 100) / 100);

/**
 * Glied mit Kontur: dicker Tintenstrich, darüber der Farbstrich. Runde Enden, damit Gelenke beim Drehen geschlossen bleiben.
 * @param {number[]} p Punktliste x1,y1,x2,y2,… @param {number} breite @param {string} farbe
 */
export function glied(p, breite, farbe) {
  let d = `M${z(p[0])} ${z(p[1])}`;
  for (let i = 2; i < p.length; i += 2) d += `L${z(p[i])} ${z(p[i + 1])}`;
  return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${breite + 8}"/>`
    + `<path d="${d}" fill="none" stroke="${farbe}" stroke-width="${breite}"/>`;
}

/** @param {number} x @param {number} y @param {number} r @param {string} farbe */
export const kreis = (x, y, r, farbe) => `<circle cx="${z(x)}" cy="${z(y)}" r="${z(r)}" fill="${farbe}" stroke-width="4"/>`;
/** @param {number} x @param {number} y @param {number} rx @param {number} ry @param {string} farbe */
export const ellipse = (x, y, rx, ry, farbe) =>
  `<ellipse cx="${z(x)}" cy="${z(y)}" rx="${z(rx)}" ry="${z(ry)}" fill="${farbe}" stroke-width="4"/>`;
/** @param {string} d @param {string} farbe */
export const flaeche = (d, farbe) => `<path d="${d}" fill="${farbe}" stroke-width="4"/>`;
/** @param {string} d @param {number} [w] */
export const strich = (d, w = 3) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w}"/>`;

/**
 * @typedef {{haut: string, haar: string, oben: string, unten: string, schuhe: string}} Farben
 * @typedef {{teil: string, svg?: string}} Teil
 * @typedef {{haareHinten?: string, haareOben?: string, nachGesicht?: string, ohr?: string}} Kopfteile
 */

/**
 * Dreiviertelansicht eines gehenden Kindes.
 * @param {{breite: number, farben: Farben, kopf: Kopfteile}} k breite 1 = Grundmaß (schmal < 1 < rundlich)
 * @returns {import("../bestand.js").KindAnsicht}
 */
export function dreiviertel({ breite: b, farben: f, kopf }) {
  const X = (/** @type {number} */ d) => 160 + d * b;
  const hueftY = 184;
  const schulterY = 126;
  const rumpf = `M${z(X(-28))} 124 Q${z(X(-28))} 112 ${z(X(-16))} 112 L${z(X(16))} 112 Q${z(X(28))} 112 ${z(X(28))} 124`
    + ` L${z(X(31))} 176 Q${z(X(31))} 186 ${z(X(22))} 186 L${z(X(-22))} 186 Q${z(X(-31))} 186 ${z(X(-31))} 176 Z`;
  const huefte = `M${z(X(-27))} 172 L${z(X(27))} 172 L${z(X(27))} 190 Q${z(X(27))} 198 ${z(X(19))} 198`
    + ` L${z(X(-19))} 198 Q${z(X(-27))} 198 ${z(X(-27))} 190 Z`;
  /** @param {number} dx @returns {Teil[]} */
  const bein = (dx) => [
    { teil: "bein", svg: glied([X(dx), 192, X(dx) + 1, 238], 20, f.unten) },
    { teil: "schuh", svg: ellipse(X(dx) + 6, 246.5, 14, 7.5, f.schuhe) },
  ];
  /** @param {number} dx @param {number} hx */
  const arm = (dx, hx) => ({
    oben: [{ teil: "oberarm", svg: glied([X(dx), schulterY, X(hx), 146], 15, f.oben) }],
    unten: [
      { teil: "unterarm", svg: glied([X(hx), 146, X(hx) - Math.sign(dx), 164], 14, f.oben) },
      { teil: "hand", svg: kreis(X(hx) - Math.sign(dx), 172, 8.5, f.haut) },
    ],
  });
  const vorn = arm(26, 30);
  const hinten = arm(-26, -30);
  return {
    drehpunkte: {
      koerper: [160, 254], rumpf: [160, hueftY], kopf: [160, 110],
      "arm-hinten-oben": [X(-26), schulterY], "arm-hinten-unten": [X(-30), 146],
      "arm-vorn-oben": [X(26), schulterY], "arm-vorn-unten": [X(30), 146],
      "bein-hinten": [X(-12), hueftY], "bein-vorn": [X(12), hueftY],
    },
    teile: {
      koerper: [],
      "bein-hinten": bein(-12),
      "bein-vorn": bein(12),
      rumpf: [
        { teil: "hals", svg: flaeche("M152 100 L168 100 L168 118 L152 118 Z", f.haut) },
        { teil: "huefte", svg: flaeche(huefte, f.unten) },
        { teil: "pulli", svg: flaeche(rumpf, f.oben) },
        { teil: "kragen", svg: strich("M150 113 Q160 121 170 113") },
      ],
      kopf: [
        ...(kopf.haareHinten ? [{ teil: "haare-hinten", svg: kopf.haareHinten }] : []),
        { teil: "ohr", svg: kopf.ohr ?? ellipse(123, 80, 7, 10, f.haut) },
        { teil: "kopf", svg: ellipse(162, 72, 42, 41, f.haut) },
        { teil: "nase", svg: strich("M172 92 Q176 95 171 98") },
        { teil: "gesicht" },
        ...(kopf.haareOben ? [{ teil: "haare-oben", svg: kopf.haareOben }] : []),
        ...(kopf.nachGesicht ? [{ teil: "hilfsmittel", svg: kopf.nachGesicht }] : []),
      ],
      "arm-hinten-oben": hinten.oben, "arm-hinten-unten": hinten.unten,
      "arm-vorn-oben": vorn.oben, "arm-vorn-unten": vorn.unten,
    },
    gesicht: /** @type {[number, number]} */ (GESICHT.dreiviertel),
    plaetze: {
      kopf: { gelenk: "kopf", punkt: [162, 32] },
      "hand-vorn": { gelenk: "arm-vorn-unten", punkt: [X(30) - 1, 172] },
      "hand-hinten": { gelenk: "arm-hinten-unten", punkt: [X(-30) + 1, 172] },
      ruecken: { gelenk: "rumpf", punkt: [160, 116] },
      fuesse: { gelenk: "koerper", punkt: [160, 250] },
      schoss: { gelenk: "rumpf", punkt: [160, 182] },
    },
  };
}
