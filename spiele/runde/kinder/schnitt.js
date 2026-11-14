// Gemeinsamer Schnitt der Runde: gleiche Kopfgröße, gleiche Augen- und Gelenkpunkte für alle Kinder.
// Ein Kind ändert nur Breite, Farben, Haare und Hilfsmittel. So passen Gesichter und Zubehör an alle vier.
// Zeichenvorgabe docs/figuren.md §4: Kontur Tinte, Strich 4, runde Enden, flache Farben, Kopf ≈ ⅓ der Höhe.

import * as S from "./stil.js";

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
 * @typedef {import("../bestand.js").Teil} Teil
 * @typedef {{haareHinten?: string, haareOben?: string, nachGesicht?: string, ohr?: string}} Kopfteile
 */

/**
 * @typedef {import("./stil.js").Stueck} Stueck
 * @typedef {{haareHinten?: Stueck, haareOben?: Stueck, nachGesicht?: Stueck, ohr?: Stueck}} KopfStuecke
 */

/** Teil aus einem Stück (Fläche + Kontur). @param {string} teil @param {Stueck} st @returns {Teil} */
const T = (teil, st) => ({ teil, svg: st.svg, kontur: st.kontur });

/**
 * Dreiviertelansicht eines gehenden Kindes, aus einem Guss: Tinte nur um die Silhouette (kinder/stil.js).
 * farben.hemd: sichtbares Hemd unter offener Jacke (sonst geschlossenes Oberteil).
 * @param {{breite: number, farben: Farben & {hemd?: string, sohle?: string}, kopf: KopfStuecke}} k breite 1 = Grundmaß
 * @returns {import("../bestand.js").KindAnsicht}
 */
export function dreiviertel({ breite: b, farben: f, kopf }) {
  const X = (/** @type {number} */ d) => 160 + d * b;
  const hueftY = 184;
  const schulterY = 126;
  const P = (/** @type {number} */ x, /** @type {number} */ y) => /** @type {[number, number]} */ ([x, y]);
  const rumpf = `M${z(X(-27))} 124 Q${z(X(-27))} 111 ${z(X(-14))} 111 L${z(X(14))} 111 Q${z(X(27))} 111 ${z(X(27))} 124`
    + ` L${z(X(30))} 177 Q${z(X(30))} 187 ${z(X(21))} 187 L${z(X(-21))} 187 Q${z(X(-30))} 187 ${z(X(-30))} 177 Z`;
  const huefte = `M${z(X(-26))} 172 L${z(X(26))} 172 L${z(X(26))} 192 Q${z(X(26))} 200 ${z(X(18))} 200`
    + ` L${z(X(-18))} 200 Q${z(X(-26))} 200 ${z(X(-26))} 192 Z`;
  /** Turnschuh mit Sohle, Spitze nach rechts. @param {number} x */
  const schuh = (x) => S.zusammen(
    S.form(S.pfad(`M${z(x - 12)} 247 Q${z(x - 12)} 233 ${z(x + 1)} 233 Q${z(x + 10)} 233 ${z(x + 14)} 239`
      + ` Q${z(x + 23)} 241 ${z(x + 23)} 248 L${z(x - 12)} 248 Z`), f.schuhe, P(x - 6, 237)),
    S.flach(S.pfad(`M${z(x - 13)} 247 L${z(x + 24)} 247 L${z(x + 24)} 250 Q${z(x + 24)} 255 ${z(x + 18)} 255`
      + ` L${z(x - 8)} 255 Q${z(x - 13)} 255 ${z(x - 13)} 250 Z`), f.sohle ?? "#FFFCF7"),
    S.naht(`M${z(x + 1)} 237 l5 2 M${z(x + 4)} 235 l5 2`, f.schuhe, 2.4),
  );
  /** @param {number} dx @returns {Teil[]} */
  const bein = (dx) => [
    T("bein", S.glied(P(X(dx), 190), 11.5, P(X(dx) + 1, 236), 10, f.unten)),
    T("schuh", schuh(X(dx) + 1)),
  ];
  /** @param {number} dx @param {number} hx @param {1|-1} daumen @param {boolean} trenn */
  const arm = (dx, hx, daumen, trenn) => {
    const w = P(X(hx) - Math.sign(dx), 165);
    const haende = S.haende(w, f.haut, daumen);
    return {
      oben: [T("oberarm", S.glied(P(X(dx), schulterY), 9, P(X(hx), 146), 8, f.oben, { trenn }))],
      unten: [
        T("unterarm", S.zusammen(S.glied(P(X(hx), 146), 8, P(w[0], 162), 7.2, f.oben, { trenn }),
          S.naht(`M${z(w[0] - 6)} 158 L${z(w[0] + 6)} 158`, f.oben))),
        { teil: "hand", formen: haende },
      ],
    };
  };
  const vorn = arm(26, 30, -1, true);
  const hinten = arm(-26, -30, 1, false);
  const oberteil = f.hemd
    ? S.zusammen(
      S.form(S.pfad(rumpf), f.oben, P(X(-22), 118), { s: 0.86 }),
      S.flach(S.pfad(`M${z(X(-4))} 112 Q${z(X(6))} 120 ${z(X(16))} 112 L${z(X(19))} 187 L${z(X(-3))} 187 Z`), f.hemd),
      S.naht(`M${z(X(-3))} 142 L${z(X(18))} 142 M${z(X(-3))} 160 L${z(X(19))} 160`, f.hemd, 3),
      S.naht(`M${z(X(-4))} 112 L${z(X(-3))} 187 M${z(X(16))} 112 L${z(X(19))} 187`, f.oben, 2.6),
      S.naht(`M${z(X(-4))} 113 L${z(X(-11))} 124 L${z(X(-2))} 128 M${z(X(16))} 113 L${z(X(22))} 123 L${z(X(15))} 127`, f.oben, 2.4),
      S.naht(`M${z(X(-24))} 160 L${z(X(-12))} 160`, f.oben, 2.6),
    )
    : S.zusammen(S.form(S.pfad(rumpf), f.oben, P(X(-22), 118), { s: 0.86 }), S.naht(`M${z(X(-10))} 113 Q160 121 ${z(X(10))} 113`, f.oben));
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
        T("hals", S.form(S.pfad("M152 96 L168 96 L168 118 L152 118 Z"), f.haut, P(152, 96), { s: 0.7 })),
        T("huefte", S.form(S.pfad(huefte), f.unten, P(X(-24), 174))),
        T("oberteil", oberteil),
      ],
      kopf: [
        ...(kopf.haareHinten ? [T("haare-hinten", kopf.haareHinten)] : []),
        T("ohr", kopf.ohr ?? S.form(S.oval(123, 80, 7, 10), f.haut, P(120, 76), { s: 0.8 })),
        T("kopf", S.form(S.oval(162, 72, 42, 41), f.haut, P(146, 56), { s: 0.9, trenn: true })),
        T("nase", S.naht("M172 91 Q177 95 171 98", f.haut, 2.8)),
        { teil: "gesicht" },
        ...(kopf.haareOben ? [T("haare-oben", kopf.haareOben)] : []),
        ...(kopf.nachGesicht ? [T("hilfsmittel", kopf.nachGesicht)] : []),
      ],
      "arm-hinten-oben": hinten.oben, "arm-hinten-unten": hinten.unten,
      "arm-vorn-oben": vorn.oben, "arm-vorn-unten": vorn.unten,
    },
    gesicht: /** @type {[number, number]} */ (GESICHT.dreiviertel),
    plaetze: {
      kopf: { gelenk: "kopf", punkt: [162, 32] },
      "hand-vorn": { gelenk: "arm-vorn-unten", punkt: [X(29), 174] },
      "hand-hinten": { gelenk: "arm-hinten-unten", punkt: [X(-29), 174] },
      ruecken: { gelenk: "rumpf", punkt: [160, 116] },
      fuesse: { gelenk: "koerper", punkt: [160, 250] },
      schoss: { gelenk: "rumpf", punkt: [160, 182] },
    },
  };
}

/**
 * Profil eines gehenden Kindes, Blick nach rechts.
 * @param {{breite: number, farben: Farben, kopf: Kopfteile}} k
 * @returns {import("../bestand.js").KindAnsicht}
 */
export function profil({ breite: b, farben: f, kopf }) {
  const X = (/** @type {number} */ d) => 160 + d * b;
  const hueftY = 184;
  const schulterY = 126;
  const rumpf = `M${z(X(-16))} 124 Q${z(X(-16))} 112 ${z(X(-4))} 112 L${z(X(6))} 112 Q${z(X(18))} 112 ${z(X(18))} 124`
    + ` L${z(X(20))} 176 Q${z(X(20))} 186 ${z(X(11))} 186 L${z(X(-10))} 186 Q${z(X(-19))} 186 ${z(X(-19))} 176 Z`;
  const huefte = `M${z(X(-17))} 172 L${z(X(18))} 172 L${z(X(18))} 190 Q${z(X(18))} 198 ${z(X(10))} 198`
    + ` L${z(X(-9))} 198 Q${z(X(-17))} 198 ${z(X(-17))} 190 Z`;
  /** @param {number} dx @returns {Teil[]} */
  const bein = (dx) => [
    { teil: "bein", svg: glied([160 + dx, 192, 160 + dx, 238], 20, f.unten) },
    { teil: "schuh", svg: ellipse(168 + dx, 246.5, 15, 7.5, f.schuhe) },
  ];
  /** @param {number} dx */
  const arm = (dx) => ({
    oben: [{ teil: "oberarm", svg: glied([160 + dx, schulterY, 161 + dx, 146], 15, f.oben) }],
    unten: [
      { teil: "unterarm", svg: glied([161 + dx, 146, 163 + dx, 164], 14, f.oben) },
      { teil: "hand", svg: kreis(164 + dx, 172, 8.5, f.haut) },
    ],
  });
  const vorn = arm(0);
  const hinten = arm(-3);
  return {
    drehpunkte: {
      koerper: [160, 254], rumpf: [160, hueftY], kopf: [162, 110],
      "arm-hinten-oben": [157, schulterY], "arm-hinten-unten": [158, 146],
      "arm-vorn-oben": [160, schulterY], "arm-vorn-unten": [161, 146],
      "bein-hinten": [157, hueftY], "bein-vorn": [161, hueftY],
    },
    teile: {
      koerper: [],
      "bein-hinten": bein(-3),
      "bein-vorn": bein(1),
      rumpf: [
        { teil: "hals", svg: flaeche("M156 100 L170 100 L170 118 L156 118 Z", f.haut) },
        { teil: "huefte", svg: flaeche(huefte, f.unten) },
        { teil: "pulli", svg: flaeche(rumpf, f.oben) },
      ],
      kopf: [
        ...(kopf.haareHinten ? [{ teil: "haare-hinten", svg: kopf.haareHinten }] : []),
        { teil: "kopf", svg: ellipse(164, 72, 40, 41, f.haut) },
        { teil: "nase", svg: flaeche("M200 80 Q212 89 201 95", f.haut) },
        { teil: "ohr", svg: kopf.ohr ?? ellipse(153, 82, 6.5, 9, f.haut) + strich("M155 77 Q150 82 155 87", 2.5) },
        { teil: "gesicht" },
        ...(kopf.haareOben ? [{ teil: "haare-oben", svg: kopf.haareOben }] : []),
        ...(kopf.nachGesicht ? [{ teil: "hilfsmittel", svg: kopf.nachGesicht }] : []),
      ],
      "arm-hinten-oben": hinten.oben, "arm-hinten-unten": hinten.unten,
      "arm-vorn-oben": vorn.oben, "arm-vorn-unten": vorn.unten,
    },
    gesicht: /** @type {[number, number]} */ (GESICHT.profil),
    plaetze: {
      kopf: { gelenk: "kopf", punkt: [164, 32] },
      "hand-vorn": { gelenk: "arm-vorn-unten", punkt: [164, 172] },
      "hand-hinten": { gelenk: "arm-hinten-unten", punkt: [161, 172] },
      ruecken: { gelenk: "rumpf", punkt: [X(-16), 130] },
      fuesse: { gelenk: "koerper", punkt: [160, 250] },
      schoss: { gelenk: "rumpf", punkt: [X(12), 182] },
    },
  };
}
