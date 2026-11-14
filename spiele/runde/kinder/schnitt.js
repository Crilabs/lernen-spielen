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
 * @param {{breite: number, farben: Farben & {hemd?: string, ringel?: string, sohle?: string}, kopf: KopfStuecke}} k breite 1 = Grundmaß
 * @returns {import("../bestand.js").KindAnsicht}
 */
export function dreiviertel({ breite: b, farben: f, kopf }) {
  const X = (/** @type {number} */ d) => 160 + d * b;
  const hueftY = 186;
  const schulterY = 124;
  const P = (/** @type {number} */ x, /** @type {number} */ y) => /** @type {[number, number]} */ ([x, y]);
  // Jacke: Schulterlinie gewölbt, weitet sich nach unten, Saum leicht gebogen.
  const jacke = `M${z(X(-23))} 118 C${z(X(-14))} 109 ${z(X(14))} 109 ${z(X(23))} 118`
    + ` C${z(X(28))} 140 ${z(X(31))} 165 ${z(X(34))} 184 C${z(X(20))} 192 ${z(X(-20))} 192 ${z(X(-34))} 184`
    + ` C${z(X(-31))} 165 ${z(X(-28))} 140 ${z(X(-23))} 118 Z`;
  const huefte = `M${z(X(-27))} 172 L${z(X(27))} 172 C${z(X(30))} 182 ${z(X(30))} 192 ${z(X(27))} 201`
    + ` L${z(X(-27))} 201 C${z(X(-30))} 192 ${z(X(-30))} 182 ${z(X(-27))} 172 Z`;
  /** Turnschuh mit Kappe und Sohle, Spitze nach rechts. @param {number} x */
  const schuh = (x) => S.zusammen(
    S.form(S.pfad(`M${z(x - 13)} 247 C${z(x - 14)} 236 ${z(x - 6)} 231 ${z(x + 2)} 232 C${z(x + 9)} 232 ${z(x + 12)} 237 ${z(x + 15)} 239`
      + ` C${z(x + 24)} 240 ${z(x + 26)} 244 ${z(x + 26)} 248 L${z(x - 13)} 248 Z`), f.schuhe, P(x - 7, 236)),
    S.flach(S.pfad(`M${z(x - 14)} 246 L${z(x + 27)} 246 L${z(x + 27)} 250 Q${z(x + 27)} 255 ${z(x + 21)} 255`
      + ` L${z(x - 9)} 255 Q${z(x - 14)} 255 ${z(x - 14)} 250 Z`), f.sohle ?? "#FFFCF7"),
    S.naht(`M${z(x + 13)} 239 C${z(x + 12)} 243 ${z(x + 13)} 245 ${z(x + 15)} 246`, f.schuhe, 2.2),
    S.naht(`M${z(x)} 236 l6 2.5 M${z(x + 3)} 234 l6 2.5`, f.schuhe, 2.4),
    S.glanz(`M${z(x - 9)} 241 C${z(x - 8)} 237 ${z(x - 5)} 235 ${z(x - 2)} 234 M${z(x + 17)} 241 l4 1`, f.schuhe, 2.6),
    S.naht(`M${z(x - 14)} 251 L${z(x + 27)} 251`, f.sohle ?? "#FFFCF7", 1.6),
  );
  /** Weites Hosenbein, ein Stück bis zum Saum: Schattenstreifen rechts in einer Flucht mit der Hüfte. @param {number} cx @param {1|-1} o */
  const hosenbein = (cx, o) => {
    const u = cx + o * 5;
    const bein = `M${z(cx - 12)} 182 C${z(cx - 13)} 200 ${z(cx - 12 + o * 2)} 214 ${z(u - 13)} 238`
      + ` L${z(u + 13)} 238 C${z(cx + 11 + o * 2)} 214 ${z(cx + 13)} 200 ${z(cx + 12)} 182 Z`;
    return {
      svg: `<path d="${bein}" fill="${f.unten}" stroke="none"/>`
        + `<path d="M${z(cx + 4)} 182 C${z(cx + 5)} 200 ${z(cx + 4 + o * 2)} 214 ${z(u + 4)} 238 L${z(u + 13)} 238`
        + ` C${z(cx + 11 + o * 2)} 214 ${z(cx + 13)} 200 ${z(cx + 12)} 182 Z" fill="${S.dunkler(f.unten, 0.26)}" stroke="none"/>`
        + `<path d="M${z(cx + 9)} 182 C${z(cx + 10)} 200 ${z(cx + 9 + o * 2)} 214 ${z(u + 9)} 238 L${z(u + 13)} 238`
        + ` C${z(cx + 11 + o * 2)} 214 ${z(cx + 13)} 200 ${z(cx + 12)} 182 Z" fill="${S.dunkler(f.unten, 0.46)}" stroke="none"/>`
        + `<path d="M${z(cx - 8)} 192 C${z(cx - 9)} 206 ${z(cx - 8 + o * 2)} 218 ${z(u - 9)} 228" fill="none" stroke="${S.heller(f.unten, 0.48)}" stroke-width="4" opacity="0.85"/>`
        + S.falte(`M${z(cx - 8 + o)} 210 q6 5 13 -1 q-6 2 -13 4 Z M${z(cx + 1)} 221 q4 3 8 -1 q-4 2 -8 3 Z`, f.unten).svg
        + S.naht(`M${z(u - 13)} 230 Q${z(u)} 232 ${z(u + 13)} 230`, f.unten, 2).svg,
      kontur: `<path d="${bein}"/>`,
    };
  };
  /** @param {number} dx @param {1|-1} o @returns {Teil[]} */
  const bein = (dx, o) => [
    T("bein", hosenbein(X(dx), o)),
    T("schuh", schuh(X(dx) + o * 5)),
  ];
  /** Arm mit Ärmel, der zum Bündchen weiter wird. @param {number} dx @param {number} ex @param {1|-1} daumen @param {boolean} trenn */
  const arm = (dx, ex, daumen, trenn) => {
    const w = P(X(ex) - Math.sign(dx), 166);
    return {
      oben: [T("oberarm", S.zusammen(
        S.glied(P(X(dx), schulterY), 9.5, P(X(ex), 146), 8.5, f.oben, { trenn, ansatz: true }),
        S.falte(`M${z(X(ex) - 7)} 140 q7 5 13 -1 q-6 3 -13 4 Z`, f.oben),
      ))],
      unten: [
        T("unterarm", S.zusammen(
          S.glied(P(X(ex), 146), 8.5, P(w[0], 160), 9.5, f.oben, { trenn }),
          S.naht(`M${z(w[0] - 8)} 157 Q${z(w[0])} 160 ${z(w[0] + 8)} 157`, f.oben),
        )),
        { teil: "hand", formen: S.haende(w, f.haut, daumen) },
      ],
    };
  };
  const vorn = arm(24, 29, -1, true);
  const hinten = arm(-24, -29, 1, false);
  const oberteil = f.hemd
    ? S.zusammen(
      S.form(S.pfad(jacke), f.oben, P(X(-22), 118), { s: 0.88 }),
      S.flach(S.pfad(`M${z(X(-6))} 113 Q${z(X(5))} 122 ${z(X(15))} 113 L${z(X(20))} 189 Q${z(X(7))} 191 ${z(X(-4))} 189 Z`), f.hemd),
      f.ringel
        ? { svg: `<path d="M${z(X(-5))} 141 L${z(X(17))} 141 M${z(X(-4))} 160 L${z(X(18))} 160 M${z(X(-4))} 178 L${z(X(19))} 178" fill="none" stroke="${f.ringel}" stroke-width="5"/>`, kontur: "" }
        : S.naht(`M${z(X(-5))} 141 L${z(X(17))} 141 M${z(X(-4))} 160 L${z(X(18))} 160 M${z(X(-4))} 178 L${z(X(19))} 178`, f.hemd, 3),
      S.naht(`M${z(X(-6))} 113 C${z(X(-8))} 140 ${z(X(-6))} 165 ${z(X(-4))} 189 M${z(X(15))} 113 C${z(X(18))} 140 ${z(X(19))} 165 ${z(X(20))} 189`, f.oben, 2.6),
      S.naht(`M${z(X(-6))} 114 L${z(X(-13))} 126 L${z(X(-5))} 131 M${z(X(15))} 114 L${z(X(22))} 125 L${z(X(16))} 130`, f.oben, 2.4),
      S.naht(`M${z(X(-26))} 162 L${z(X(-13))} 162`, f.oben, 2.4),
      S.glanz(`M${z(X(-22))} 124 C${z(X(-25))} 145 ${z(X(-27))} 165 ${z(X(-29))} 180`, f.oben, 4),
      S.glanz(`M${z(X(-12))} 115 C${z(X(-8))} 113 ${z(X(-4))} 113 ${z(X(-2))} 114`, f.oben, 3),
      S.falte(`M${z(X(-30))} 178 C${z(X(-24))} 172 ${z(X(-16))} 172 ${z(X(-10))} 176 C${z(X(-16))} 175 ${z(X(-22))} 176 ${z(X(-30))} 181 Z`, f.oben),
      S.falte(`M${z(X(21))} 120 C${z(X(25))} 135 ${z(X(27))} 160 ${z(X(31))} 183 L${z(X(26))} 186 C${z(X(24))} 160 ${z(X(22))} 140 ${z(X(19))} 122 Z`, f.oben, 0.2),
      S.falte(`M${z(X(-4))} 113 Q${z(X(5))} 122 ${z(X(15))} 113 Q${z(X(5))} 130 ${z(X(-4))} 116 Z`, f.hemd, 0.42),
      S.falte(`M${z(X(-6))} 113 C${z(X(-8))} 140 ${z(X(-6))} 165 ${z(X(-4))} 189 L${z(X(1))} 189 C${z(X(-1))} 165 ${z(X(-3))} 140 ${z(X(-1))} 118 Z`, f.hemd, 0.3),
      S.falte(`M${z(X(13))} 116 C${z(X(16))} 140 ${z(X(17))} 165 ${z(X(18))} 189 L${z(X(20))} 189 C${z(X(19))} 165 ${z(X(18))} 140 ${z(X(15))} 113 Z`, f.hemd, 0.22),
    )
    : S.zusammen(S.form(S.pfad(jacke), f.oben, P(X(-22), 118), { s: 0.88 }), S.naht(`M${z(X(-10))} 113 Q160 121 ${z(X(10))} 113`, f.oben));
  return {
    drehpunkte: {
      koerper: [160, 254], rumpf: [160, hueftY], kopf: [160, 110],
      "arm-hinten-oben": [X(-24), schulterY], "arm-hinten-unten": [X(-29), 146],
      "arm-vorn-oben": [X(24), schulterY], "arm-vorn-unten": [X(29), 146],
      "bein-hinten": [X(-13), hueftY], "bein-vorn": [X(13), hueftY],
    },
    teile: {
      koerper: [],
      "bein-hinten": bein(-13, -1),
      "bein-vorn": bein(13, 1),
      rumpf: [
        T("hals", S.zusammen(S.form(S.pfad("M153 96 L167 96 L168 118 L152 118 Z"), f.haut, P(153, 96), { s: 0.7 }),
          S.falte("M152 96 L168 96 L168 108 Q160 113 152 106 Z", f.haut, 0.42))),
        T("huefte", {
          svg: `<path d="${huefte}" fill="${f.unten}" stroke="none"/>`
            + `<path d="M${z(X(17))} 172 L${z(X(27))} 172 C${z(X(30))} 182 ${z(X(30))} 192 ${z(X(27))} 201 L${z(X(17))} 201 Z" fill="${S.dunkler(f.unten, 0.26)}" stroke="none"/>`
            + `<path d="M${z(X(22))} 172 L${z(X(27))} 172 C${z(X(30))} 182 ${z(X(30))} 192 ${z(X(27))} 201 L${z(X(22))} 201 Z" fill="${S.dunkler(f.unten, 0.46)}" stroke="none"/>`
            + `<path d="M${z(X(-30))} 184 C${z(X(-20))} 192 ${z(X(20))} 192 ${z(X(30))} 184 L${z(X(30))} 191 C${z(X(20))} 199 ${z(X(-20))} 199 ${z(X(-30))} 191 Z" fill="${S.dunkler(f.unten, 0.5)}" stroke="none"/>`
            + S.naht(`M${z(X(1))} 178 L${z(X(2))} 201`, f.unten, 2).svg,
          kontur: `<path d="${huefte}"/>`,
        }),
        T("oberteil", oberteil),
      ],
      kopf: [
        ...(kopf.haareHinten ? [T("haare-hinten", kopf.haareHinten)] : []),
        T("ohr", kopf.ohr ?? S.zusammen(S.form(S.oval(123, 82, 7.5, 10.5), f.haut, P(120, 77), { s: 0.8 }),
          S.naht("M125 76 Q119 82 125 89", f.haut, 2.2))),
        T("kopf", S.form(S.pfad("M162 30 C190 30 206 48 206 72 C206 93 196 108 178 113 C168 116 152 116 142 110"
          + " C127 102 119 88 120 70 C122 46 138 30 162 30 Z"), f.haut, P(146, 54), { s: 0.9, trenn: true })),
        T("stirnschatten", S.falte("M124 74 C134 62 146 58 152 62 C160 66 170 66 176 60 C184 58 196 62 204 76"
          + " C200 70 192 66 184 66 C176 72 162 74 152 68 C142 66 132 70 124 80 Z", f.haut, 0.34)),
        T("wangen", S.zusammen(S.roete(148, 95, 8, 5), S.roete(191, 94, 6, 4.5))),
        T("nase", S.zusammen(S.falte("M174 89 Q180 95 172 100 Q176 95 174 89 Z", f.haut, 0.4), S.naht("M172 90 Q178 95 171 99", f.haut, 2.6))),
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
      "hand-vorn": { gelenk: "arm-vorn-unten", punkt: [X(28), 175] },
      "hand-hinten": { gelenk: "arm-hinten-unten", punkt: [X(-28), 175] },
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
