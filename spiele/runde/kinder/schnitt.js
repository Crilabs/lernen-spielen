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
 * @typedef {{haareHinten?: Stueck, haareOben?: Stueck, nachGesicht?: Stueck, ohr?: Stueck, zoepfe?: Stueck, ponyschatten?: Stueck}} KopfStuecke
 *   zoepfe: hängen hinter dem Körper; ponyschatten: Schlagschatten der Haare auf der Stirn
 */

/** Teil aus einem Stück (Fläche + Kontur). @param {string} teil @param {Stueck} st @returns {Teil} */
const T = (teil, st) => ({ teil, svg: st.svg, kontur: st.kontur });

/**
 * Turnschuh von vorn (Dreiviertel: leicht nach rechts gedreht): Kappe zum Betrachter, Schnürung oben, Sohle als Rand.
 * hinten: im Schatten. dy: Höhenversatz (Sohle unten bei 254.5 + dy).
 * @param {Farben & {sohle?: string}} f @param {number} x @param {boolean} hinten @param {number} dy
 */
function schuhVorn(f, x, hinten, dy) {
  const farbe = hinten ? S.dunkler(f.schuhe, 0.16) : f.schuhe;
  const sohle = hinten ? S.dunkler(f.sohle ?? "#F4EEE4", 0.14) : (f.sohle ?? "#F4EEE4");
  const Y = (/** @type {number} */ v) => z(v + dy);
  return S.zusammen(
    S.form(S.pfad(`M${z(x - 13)} ${Y(249)} C${z(x - 14)} ${Y(240)} ${z(x - 9)} ${Y(233)} ${z(x - 2)} ${Y(232)} L${z(x + 7)} ${Y(232)}`
      + ` C${z(x + 14)} ${Y(233)} ${z(x + 18)} ${Y(240)} ${z(x + 17)} ${Y(249)} Z`), farbe, [x - 8, 236 + dy]),
    { svg: `<path d="M${z(x - 10)} ${Y(248)} C${z(x - 9)} ${Y(242)} ${z(x + 12)} ${Y(242)} ${z(x + 14)} ${Y(248)} Z" fill="${S.heller(farbe, 0.3)}" stroke="none"/>`, kontur: "" },
    S.naht(`M${z(x - 1)} ${Y(239)} l6 2.5 M${z(x + 5)} ${Y(239)} l-6 2.5 M${z(x - 1)} ${Y(243)} l6 2 M${z(x + 5)} ${Y(243)} l-6 2`, farbe, 1.7),
    S.form(S.pfad(`M${z(x - 15)} ${Y(248)} L${z(x + 19)} ${Y(248)} C${z(x + 21)} ${Y(250)} ${z(x + 20)} ${Y(254)} ${z(x + 16)} ${Y(254.5)}`
      + ` L${z(x - 12)} ${Y(254.5)} C${z(x - 16)} ${Y(254)} ${z(x - 17)} ${Y(250)} ${z(x - 15)} ${Y(248)} Z`), sohle, [x - 10, 248 + dy], { s: 0.9 }),
  );
}

/**
 * Dreiviertelansicht eines gehenden Kindes, aus einem Guss: Tinte nur um die Silhouette (kinder/stil.js).
 * farben.hemd: sichtbares Hemd unter offener Jacke (sonst geschlossenes Oberteil).
 * @param {{breite: number, farben: Farben & {hemd?: string, ringel?: string, sohle?: string, muster?: string[], latz?: string, kurzarm?: boolean, wangen?: number, kapuze?: boolean},
 *   kopf: KopfStuecke}} k breite 1 = Grundmaß. Oberteil: hemd = offene Jacke über Shirt, latz = Latzhose über Shirt, sonst Pulli.
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
  const huefte = `M${z(X(-27))} 172 L${z(X(27))} 172 C${z(X(29))} 180 ${z(X(29))} 188 ${z(X(26))} 195`
    + ` L${z(X(-26))} 195 C${z(X(-29))} 188 ${z(X(-29))} 180 ${z(X(-27))} 172 Z`;
  const schuh = (/** @type {number} */ x, /** @type {boolean} */ hinten) => schuhVorn(f, x, hinten, hinten ? -1.5 : 0);
  const KNIE = 212;
  /** Weites Hosenbein mit Knie: Oberschenkel endet unten rund (deckt die Fuge, wenn das Knie beugt), der
   * Unterschenkel samt Schuh dreht am Knie. Schattenstreifen liegen in einer Flucht, gerade sieht man keine Naht.
   * o = +1 rechts, -1 links (Grätsche). @param {number} cx @param {1|-1} o */
  const hosenbein = (cx, o) => {
    const u = cx + o * 7;
    const k = cx + o * 1.8;
    const kl = k - 12.3;
    const kr = k + 11.6;
    const oben = `M${z(cx - 12)} 182 C${z(cx - 13)} 196 ${z(kl - 0.3)} 206 ${z(kl)} ${KNIE} Q${z(k)} ${KNIE + 9} ${z(kr)} ${KNIE}`
      + ` C${z(kr + 0.5)} 204 ${z(cx + 13)} 194 ${z(cx + 12)} 182 Z`;
    const unten = `M${z(kl)} ${KNIE - 4} L${z(kr)} ${KNIE - 4} L${z(u + 13)} 238 L${z(u - 13)} 238 Z`;
    const c = f.unten;
    return {
      oben: {
        svg: `<path d="${oben}" fill="${c}" stroke="none"/>`
          + `<path d="M${z(cx + 4)} 182 L${z(k + 4)} ${KNIE} L${z(kr)} ${KNIE} L${z(cx + 12)} 182 Z" fill="${S.dunkler(c, 0.26)}" stroke="none"/>`
          + `<path d="M${z(cx + 9)} 182 L${z(k + 9)} ${KNIE} L${z(kr)} ${KNIE} L${z(cx + 12)} 182 Z" fill="${S.dunkler(c, 0.46)}" stroke="none"/>`
          + `<path d="M${z(cx - 8)} 192 L${z(k - 8)} ${KNIE + 2}" fill="none" stroke="${S.heller(c, 0.48)}" stroke-width="4" opacity="0.85"/>`
          + S.falte(`M${z(k - 8)} ${KNIE - 3} q6 5 13 -1 q-6 2 -13 4 Z`, c).svg,
        kontur: `<path d="${oben}"/>`,
      },
      unten: {
        svg: `<path d="${unten}" fill="${c}" stroke="none"/>`
          + `<path d="M${z(k + 4)} ${KNIE - 4} L${z(u + 4)} 238 L${z(u + 13)} 238 L${z(kr)} ${KNIE - 4} Z" fill="${S.dunkler(c, 0.26)}" stroke="none"/>`
          + `<path d="M${z(k + 9)} ${KNIE - 4} L${z(u + 9)} 238 L${z(u + 13)} 238 L${z(kr)} ${KNIE - 4} Z" fill="${S.dunkler(c, 0.46)}" stroke="none"/>`
          + `<path d="M${z(k - 8)} ${KNIE + 2} L${z(u - 9)} 228" fill="none" stroke="${S.heller(c, 0.48)}" stroke-width="4" opacity="0.85"/>`
          + S.falte(`M${z(k + 1)} ${KNIE + 9} q4 3 8 -1 q-4 2 -8 3 Z`, c).svg
          + S.naht(`M${z(u - 13)} 230 Q${z(u)} 232 ${z(u + 13)} 230`, c, 2).svg,
        kontur: `<path d="${unten}"/>`,
      },
    };
  };
  /** @param {number} dx @param {1|-1} o @returns {{oben: Teil[], unten: Teil[]}} */
  const bein = (dx, o) => {
    const h = hosenbein(X(dx), o);
    return { oben: [T("oberschenkel", h.oben)], unten: [T("unterschenkel", h.unten), T("schuh", schuh(X(dx) + o * 7, o < 0))] };
  };
  /** Arm mit Ärmel, der zum Bündchen weiter wird. @param {number} dx @param {number} ex @param {1|-1} daumen @param {boolean} trenn */
  const arm = (dx, ex, daumen, trenn) => {
    const w = P(X(ex) - Math.sign(dx), 166);
    return {
      oben: [T("oberarm", f.kurzarm
        ? S.zusammen(S.glied(P(X(ex), 134), 7.4, P(X(ex), 146), 7.4, f.haut), S.glied(P(X(dx), schulterY), 10, P(X(ex) - Math.sign(dx), 136), 9.6, f.oben, { trenn, ansatz: true }))
        : S.glied(P(X(dx), schulterY), 9.5, P(X(ex), 146), 8.8, f.oben, { trenn, ansatz: true }))],
      unten: [
        T("unterarm", f.kurzarm
          ? S.glied(P(X(ex), 146), 7.4, P(w[0], 160), 6.8, f.haut, { trenn })
          : S.glied(P(X(ex), 146), 8.8, P(w[0], 160), 9.4, f.oben, { trenn })),
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
        ? {
          // Ringel genau zwischen den Jackenkanten (links X(-6)→X(-4), rechts X(15)→X(20) von y 112 bis 189), gerade Enden
          svg: `<path d="${[141, 160, 178].map((y) => {
            const t = (y - 112) / 77;
            return `M${z(X(-6 + 2 * t) + 1.5)} ${y} L${z(X(15 + 5 * t) - 1.5)} ${y}`;
          }).join(" ")}" fill="none" stroke="${f.ringel}" stroke-width="5" stroke-linecap="butt"/>`,
          kontur: "",
        }
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
    : f.latz ? latzhose() : pulli();
  /** Seitenkanten des Oberteils auf Höhe y (für Bänder und Muster, die nicht über den Rand ragen). @param {number} y */
  function kanten(y) {
    const t = Math.max(0, Math.min(1, (y - 118) / 66));
    return [X(-23 - 11 * t * t * 0.4 - 6.6 * t), X(23 + 11 * t * t * 0.4 + 6.6 * t)];
  }
  /** Geschlossener Pulli mit Rundkragen, Bündchen und wahlweise einem Musterband (f.muster: [Grund, Zeichen]). */
  function pulli() {
    const teile = [
      S.form(S.pfad(jacke), f.oben, P(X(-22), 118), { s: 0.88 }),
      S.falte(`M${z(X(-10))} 112 Q160 124 ${z(X(10))} 112 Q160 117 ${z(X(-10))} 112 Z`, f.oben, 0.4),
      S.naht(`M${z(X(-11))} 112 Q160 123 ${z(X(11))} 112`, f.oben, 2.4),
    ];
    if (f.muster) {
      const [a1, b1] = kanten(140);
      const [a2, b2] = kanten(154);
      teile.push({ svg: `<path d="M${z(a1 + 1)} 140 L${z(b1 - 1)} 140 L${z(b2 - 1)} 154 L${z(a2 + 1)} 154 Z" fill="${f.muster[0]}" stroke="none"/>`
        + `<path d="M${z(a1 + 3)} 147 ${Array.from({ length: 9 }, (_, i) => `L${z(a1 + 3 + (i + 0.5) * (b1 - a1 - 6) / 9)} ${i % 2 ? 150.5 : 143.5}`).join(" ")} L${z(b1 - 3)} 147"`
        + ` fill="none" stroke="${f.muster[1]}" stroke-width="2.6" stroke-linecap="butt"/>`
        + `<path d="M${z(a1 + 1)} 154 L${z(b1 - 1)} 154 L${z(b2 - 1)} 156 L${z(a2 + 1)} 156 Z" fill="${S.dunkler(f.oben, 0.3)}" stroke="none"/>`, kontur: "" });
    }
    if (f.kapuze) {
      teile.push(
        { svg: `<path d="M${z(X(-5))} 117 L${z(X(-6))} 138 M${z(X(5))} 117 L${z(X(6))} 135" fill="none" stroke="#FFFCF7" stroke-width="2.4"/>`
          + `<circle cx="${z(X(-6))}" cy="140" r="2.2" fill="#FFFCF7" stroke="${S.dunkler(f.oben, 0.4)}" stroke-width="1"/>`
          + `<circle cx="${z(X(6))}" cy="137" r="2.2" fill="#FFFCF7" stroke="${S.dunkler(f.oben, 0.4)}" stroke-width="1"/>`, kontur: "" },
        S.naht(`M${z(X(-15))} 160 L${z(X(15))} 160 L${z(X(19))} 177 L${z(X(-19))} 177 Z`, f.oben, 2.4),
        S.falte(`M${z(X(-15))} 160 L${z(X(15))} 160 L${z(X(15.4))} 163 L${z(X(-15.4))} 163 Z`, f.oben, 0.3),
      );
    }
    const [ua, ub] = kanten(178);
    teile.push(
      S.naht(`M${z(ua + 2)} 180 C${z(X(-12))} 185 ${z(X(12))} 185 ${z(ub - 2)} 180`, f.oben, 2.4),
      S.naht(`M${z(X(-18))} 182 l1 6 M${z(X(-8))} 184 l0.5 6 M${z(X(2))} 185 l0 6 M${z(X(12))} 184 l-0.5 6 M${z(X(22))} 182 l-1 6`, f.oben, 1.8),
      S.glanz(`M${z(X(-22))} 124 C${z(X(-25))} 145 ${z(X(-27))} 165 ${z(X(-29))} 178`, f.oben, 4),
      S.falte(`M${z(X(21))} 120 C${z(X(25))} 135 ${z(X(27))} 160 ${z(X(31))} 183 L${z(X(26))} 186 C${z(X(24))} 160 ${z(X(22))} 140 ${z(X(19))} 122 Z`, f.oben, 0.2),
      S.falte(`M${z(X(-30))} 172 C${z(X(-22))} 166 ${z(X(-12))} 167 ${z(X(-6))} 171 C${z(X(-14))} 170 ${z(X(-22))} 171 ${z(X(-30))} 175 Z`, f.oben),
    );
    return S.zusammen(...teile);
  }
  /** Latzhose über einem Shirt (f.oben = Shirt, f.latz = Latzhose; f.unten sollte gleich f.latz sein). */
  function latzhose() {
    const latz = /** @type {string} */ (f.latz);
    const brust = `M${z(X(-15))} 142 L${z(X(15))} 142 L${z(X(18))} 176 L${z(X(-18))} 176 Z`;
    const [ua, ub] = kanten(176);
    const bauch = `M${z(ua)} 172 L${z(ub)} 172 L${z(X(31))} 184 C${z(X(20))} 192 ${z(X(-20))} 192 ${z(X(-31))} 184 Z`;
    return S.zusammen(
      S.form(S.pfad(jacke), f.oben, P(X(-22), 118), { s: 0.88 }),
      S.falte(`M${z(X(-10))} 112 Q160 124 ${z(X(10))} 112 Q160 117 ${z(X(-10))} 112 Z`, f.oben, 0.4),
      S.naht(`M${z(X(-11))} 112 Q160 123 ${z(X(11))} 112`, f.oben, 2.4),
      S.glanz(`M${z(X(-22))} 124 C${z(X(-25))} 140 ${z(X(-26))} 155 ${z(X(-27))} 168`, f.oben, 4),
      S.falte(`M${z(X(21))} 120 C${z(X(25))} 135 ${z(X(27))} 160 ${z(X(29))} 172 L${z(X(25))} 172 C${z(X(24))} 160 ${z(X(22))} 140 ${z(X(19))} 122 Z`, f.oben, 0.2),
      // Träger von der Brust über die Schultern
      S.form(S.pfad(`M${z(X(-15))} 143 L${z(X(-9))} 143 L${z(X(-11))} 111 L${z(X(-17))} 112 Z`), latz, P(X(-15), 116), { s: 0.8, kontur: false }),
      S.form(S.pfad(`M${z(X(9))} 143 L${z(X(15))} 143 L${z(X(18))} 112 L${z(X(12))} 111 Z`), latz, P(X(11), 116), { s: 0.8, kontur: false }),
      S.form(S.pfad(brust), latz, P(X(-13), 145), { s: 0.86, kontur: false }),
      S.form(S.pfad(bauch), latz, P(X(-26), 174), { s: 0.9, kontur: false }),
      S.falte(`M${z(X(-15))} 142 L${z(X(15))} 142 L${z(X(15.3))} 146 L${z(X(-15.3))} 146 Z`, f.oben, 0.42),
      // Brusttasche, Knöpfe, Naht
      S.naht(`M${z(X(-8))} 150 L${z(X(8))} 150 L${z(X(8.5))} 164 Q160 167 ${z(X(-8.5))} 164 Z`, latz, 2.2),
      { svg: [X(-12), X(12)].map((x) => `<circle cx="${z(x)}" cy="146" r="2.6" fill="#E9D9A8" stroke="${S.dunkler(latz, 0.5)}" stroke-width="1.4"/>`).join(""), kontur: "" },
      S.naht(`M${z(X(-18))} 176 L${z(X(18))} 176`, latz, 2),
      S.falte(`M${z(X(14))} 144 L${z(X(15))} 144 L${z(X(18))} 176 L${z(X(14))} 176 Z`, latz, 0.3),
    );
  }
  return {
    drehpunkte: {
      koerper: [160, 254], rumpf: [160, hueftY], kopf: [160, 110],
      "arm-hinten-oben": [X(-24), schulterY], "arm-hinten-unten": [X(-29), 146],
      "arm-vorn-oben": [X(24), schulterY], "arm-vorn-unten": [X(29), 146],
      "bein-hinten": [X(-13), hueftY], "bein-vorn": [X(13), hueftY],
      "bein-hinten-unten": [X(-13) - 1.8, KNIE], "bein-vorn-unten": [X(13) + 1.8, KNIE],
    },
    teile: {
      koerper: kopf.zoepfe ? [T("zoepfe", kopf.zoepfe)] : [],
      "bein-hinten": bein(-13, -1).oben, "bein-hinten-unten": bein(-13, -1).unten,
      "bein-vorn": bein(13, 1).oben, "bein-vorn-unten": bein(13, 1).unten,
      rumpf: [
        ...(f.kapuze ? [T("kapuze", S.form(S.pfad(`M${z(X(-21))} 121 C${z(X(-25))} 97 ${z(X(25))} 97 ${z(X(21))} 121 Z`), f.oben, P(X(-18), 104), { s: 0.86 }))] : []),
        T("hals", S.zusammen(S.form(S.pfad("M153 96 L167 96 L168 118 L152 118 Z"), f.haut, P(153, 96), { s: 0.7 }),
          S.falte("M152 96 L168 96 L168 108 Q160 113 152 106 Z", f.haut, 0.42))),
        // Hüfte endet unter dem Saumschatten; der Saumschatten liegt über Hüfte und Beinen (Beine liegen hinter dem Rumpf),
        // so gibt es am Schritt keine Kante und die Hosenbeine kommen mit ihrer eigenen Schattierung darunter hervor.
        T("huefte", {
          svg: `<path d="${huefte}" fill="${f.unten}" stroke="none"/>` + S.naht(`M${z(X(1))} 186 L${z(X(1.5))} 194`, f.unten, 2).svg,
          kontur: `<path d="${huefte}"/>`,
        }),
        T("saumschatten", {
          svg: `<path d="M${z(X(-30))} 182 C${z(X(-20))} 190 ${z(X(20))} 190 ${z(X(30))} 182 L${z(X(30))} 191`
            + ` C${z(X(20))} 200 ${z(X(-20))} 200 ${z(X(-30))} 191 Z" fill="${S.dunkler(f.unten, 0.5)}" stroke="none"/>`,
          kontur: "",
        }),
        T("oberteil", oberteil),
      ],
      kopf: [
        ...(kopf.haareHinten ? [T("haare-hinten", kopf.haareHinten)] : []),
        T("ohr", kopf.ohr ?? S.zusammen(S.form(S.oval(123, 82, 7.5, 10.5), f.haut, P(120, 77), { s: 0.8 }),
          S.naht("M125 76 Q119 82 125 89", f.haut, 2.2))),
        T("kopf", S.form(S.pfad("M162 30 C190 30 206 48 206 72 C206 93 196 108 178 113 C168 116 152 116 142 110"
          + " C127 102 119 88 120 70 C122 46 138 30 162 30 Z"), f.haut, P(146, 54), { s: 0.9, trenn: true })),
        // Schlagschatten des Ponys auf der Stirn (vom Kind geliefert, folgt den Lockenspitzen).
        ...(kopf.ponyschatten ? [T("haarschatten", kopf.ponyschatten)] : []),
        T("wangen", S.zusammen(S.roete(148, 95, 8, 5, f.wangen), S.roete(191, 94, 6, 4.5, f.wangen))),
        T("nase", S.zusammen(S.falte("M174 86 Q179 90 173 94 Q176 90 174 86 Z", f.haut, 0.4), S.naht("M173 87 Q177 90.5 172 93.5", f.haut, 2.4))),
        { teil: "gesicht" },
        // Brille und Hörgeräte unter den Haaren: Locken dürfen über die Bügel fallen.
        ...(kopf.nachGesicht ? [T("hilfsmittel", kopf.nachGesicht)] : []),
        ...(kopf.haareOben ? [T("haare-oben", kopf.haareOben)] : []),
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
 * Turnschuh von der Seite (Profil, Spitze nach rechts). dunkel: hinterer Fuß im Schatten.
 * @param {Farben & {sohle?: string}} f @param {number} x Ferse-Mitte @param {boolean} dunkel @param {number} dy
 */
function schuhSeite(f, x, dunkel, dy) {
  const farbe = dunkel ? S.dunkler(f.schuhe, 0.18) : f.schuhe;
  const sohle = dunkel ? S.dunkler(f.sohle ?? "#F4EEE4", 0.16) : (f.sohle ?? "#F4EEE4");
  const Y = (/** @type {number} */ v) => z(v + dy);
  return S.zusammen(
    S.form(S.pfad(`M${z(x - 11)} ${Y(247)} C${z(x - 12)} ${Y(238)} ${z(x - 6)} ${Y(232)} ${z(x + 2)} ${Y(232)} C${z(x + 9)} ${Y(232)} ${z(x + 12)} ${Y(237)} ${z(x + 16)} ${Y(239)}`
      + ` C${z(x + 25)} ${Y(240)} ${z(x + 29)} ${Y(244)} ${z(x + 29)} ${Y(248)} L${z(x - 11)} ${Y(248)} Z`), farbe, [x - 6, 235 + dy]),
    { svg: `<path d="M${z(x + 15)} ${Y(240)} C${z(x + 22)} ${Y(240)} ${z(x + 27)} ${Y(243)} ${z(x + 28)} ${Y(247)} C${z(x + 23)} ${Y(245)} ${z(x + 18)} ${Y(244)} ${z(x + 15)} ${Y(240)} Z" fill="${S.heller(farbe, 0.32)}" stroke="none"/>`, kontur: "" },
    S.naht(`M${z(x + 1)} ${Y(236)} l5 3 M${z(x + 5)} ${Y(234.5)} l5 3 M${z(x - 9)} ${Y(242)} Q${z(x - 4)} ${Y(238)} ${z(x + 2)} ${Y(238)}`, farbe, 1.8),
    S.form(S.pfad(`M${z(x - 12)} ${Y(247)} L${z(x + 30)} ${Y(247)} C${z(x + 32)} ${Y(249)} ${z(x + 31)} ${Y(254)} ${z(x + 27)} ${Y(254.5)}`
      + ` L${z(x - 9)} ${Y(254.5)} C${z(x - 13)} ${Y(254)} ${z(x - 14)} ${Y(250)} ${z(x - 12)} ${Y(247)} Z`), sohle, [x - 8, 247 + dy], { s: 0.9 }),
  );
}

/** Kopf im Profil (Blick nach rechts): runder Hinterkopf, Stirn, Nase, Oberlippe, Kinn, Kiefer zum Ohr. */
const KOPF_PROFIL = "M163 30 C187 30 203 43 205 62 C206 68 206 72 208 76 C211 80 214 84 212 88 C210 90 207 90 205 91"
  + " C206 94 206 96 204 98 C206 101 205 104 202 106 C198 111 190 114 180 114 C164 115 148 110 138 104"
  + " C126 96 119 80 120 62 C121 44 138 30 163 30 Z";

/**
 * Profil eines gehenden Kindes, Blick nach rechts, im Stil aus einem Guss (kinder/stil.js).
 * Hinteres Bein und hinterer Arm liegen im Schatten, damit man beim Gehen vorn und hinten unterscheidet.
 * Licht von oben links: der Rücken ist hell, Schatten liegen vorn unten (unter Kinn, Brust, Gesäß).
 * @param {{breite: number, farben: Farben & Record<string, any>, kopf: KopfStuecke}} k
 * @returns {import("../bestand.js").KindAnsicht}
 */
export function profil({ breite: b, farben: f, kopf }) {
  const X = (/** @type {number} */ d) => 160 + d * b;
  const P = (/** @type {number} */ x, /** @type {number} */ y) => /** @type {[number, number]} */ ([x, y]);
  const hueftY = 184;
  const schulterY = 124;
  const KNIE = 212;
  const hinten = (/** @type {string} */ c) => S.dunkler(c, 0.16);
  // Rumpf: Rücken mit Schulterblatt-Rundung (links), Brust nach vorn gewölbt (rechts), Saum.
  const rumpf = `M${z(X(-13))} 114 C${z(X(-4))} 108 ${z(X(8))} 108 ${z(X(13))} 113 C${z(X(19))} 124 ${z(X(20))} 140 ${z(X(19))} 156`
    + ` C${z(X(18))} 168 ${z(X(21))} 178 ${z(X(21))} 187 C${z(X(10))} 193 ${z(X(-10))} 193 ${z(X(-19))} 187`
    + ` C${z(X(-21))} 170 ${z(X(-19))} 150 ${z(X(-18))} 136 C${z(X(-17))} 124 ${z(X(-16))} 118 ${z(X(-13))} 114 Z`;
  /** Vorderkante des Rumpfes auf Höhe y (für Shirt und Ringel). @param {number} y */
  const vorn = (y) => (y < 124 ? X(13 + (y - 113) * 0.55) : y < 156 ? X(19.5) : X(19 + (y - 156) * 0.06));
  const huefte = `M${z(X(-18))} 172 L${z(X(20))} 172 C${z(X(22))} 180 ${z(X(22))} 188 ${z(X(19))} 195 L${z(X(-17))} 195 C${z(X(-20))} 188 ${z(X(-20))} 180 ${z(X(-18))} 172 Z`;

  /** Hosenbein von der Seite mit Knie. @param {boolean} dunkel */
  const bein = (dunkel) => {
    const c = dunkel ? hinten(f.unten) : f.unten;
    const oben = `M148 182 L172 182 C173 196 172 206 171 ${KNIE} Q160 ${KNIE + 9} 149 ${KNIE} C148 206 147 196 148 182 Z`;
    const unten = `M149 ${KNIE - 4} L171 ${KNIE - 4} C171 222 170 230 169 238 L151 238 C150 230 149 222 149 ${KNIE - 4} Z`;
    return {
      oben: [T("oberschenkel", {
        svg: `<path d="${oben}" fill="${c}" stroke="none"/>`
          + `<path d="M163 182 L172 182 C173 196 172 206 171 ${KNIE} L163 ${KNIE} Z" fill="${S.dunkler(c, 0.24)}" stroke="none"/>`
          + `<path d="M168 182 L172 182 C173 196 172 206 171 ${KNIE} L168 ${KNIE} Z" fill="${S.dunkler(c, 0.44)}" stroke="none"/>`
          + `<path d="M153 190 C152 198 152 206 153 ${KNIE}" fill="none" stroke="${S.heller(c, 0.45)}" stroke-width="3.6" opacity="0.8"/>`,
        kontur: `<path d="${oben}"/>`,
      })],
      unten: [
        T("unterschenkel", {
          svg: `<path d="${unten}" fill="${c}" stroke="none"/>`
            + `<path d="M163 ${KNIE - 4} L171 ${KNIE - 4} C171 222 170 230 169 238 L163 238 Z" fill="${S.dunkler(c, 0.24)}" stroke="none"/>`
            + `<path d="M168 ${KNIE - 4} L171 ${KNIE - 4} C171 222 170 230 169 238 L167 238 Z" fill="${S.dunkler(c, 0.44)}" stroke="none"/>`
            + `<path d="M153 ${KNIE + 2} C153 220 154 228 155 232" fill="none" stroke="${S.heller(c, 0.45)}" stroke-width="3.6" opacity="0.8"/>`
            + S.falte(`M152 ${KNIE + 6} q8 4 16 -1 q-8 2 -16 4 Z`, c).svg + S.naht("M151 231 Q160 233 169 231", c, 2).svg,
          kontur: `<path d="${unten}"/>`,
        }),
        T("schuh", schuhSeite(f, 158, dunkel, 0)),
      ],
    };
  };

  /** Arm von der Seite, Ärmel weitet sich zum Bündchen, Hand von der Seite. @param {boolean} dunkel */
  const arm = (dunkel) => {
    const c = dunkel ? hinten(f.oben) : f.oben;
    const haut = dunkel ? hinten(f.haut) : f.haut;
    const kurz = Boolean(f.kurzarm);
    return {
      oben: [T("oberarm", kurz
        ? S.zusammen(S.glied(P(161, 134), 7.2, P(162, 146), 7.2, haut), S.glied(P(160, schulterY + 2), 10.2, P(161, 137), 9.8, c, { trenn: !dunkel, ansatz: true }))
        : S.glied(P(160, schulterY + 2), 9.8, P(162, 146), 8.8, c, { trenn: !dunkel, ansatz: true }))],
      unten: [
        T("unterarm", kurz
          ? S.glied(P(162, 146), 7.2, P(164, 160), 6.6, haut, { trenn: !dunkel })
          : S.zusammen(S.glied(P(162, 146), 8.8, P(164, 160), 9.6, c, { trenn: !dunkel }),
            S.naht("M156 157 Q164 160 172 157", c, 2))),
        { teil: "hand", formen: S.haendeSeite(P(164, 163), haut) },
      ],
    };
  };
  const armVorn = arm(false);
  const armHinten = arm(true);
  const beinVorn = bein(false);
  const beinHinten = bein(true);

  /** Oberteil im Profil je nach Kleidung. */
  const oberteil = () => {
    const teile = [
      S.form(S.pfad(rumpf), f.oben, P(X(-14), 116), { s: 0.9 }),
      // Brust- und Bauchschatten vorn, Glanz auf dem Rücken
      S.falte(`M${z(X(14))} 120 C${z(X(19))} 132 ${z(X(20))} 146 ${z(X(19))} 156 C${z(X(18))} 168 ${z(X(21))} 178 ${z(X(21))} 187 L${z(X(15))} 189 C${z(X(15))} 176 ${z(X(13))} 166 ${z(X(14))} 154 C${z(X(15))} 140 ${z(X(14))} 128 ${z(X(10))} 116 Z`, f.oben, 0.22),
      S.glanz(`M${z(X(-14))} 122 C${z(X(-17))} 136 ${z(X(-18))} 154 ${z(X(-18))} 176`, f.oben, 4),
    ];
    if (f.hemd) {
      // offene Jacke: vorn schaut das Shirt heraus, Ringel genau bis zur Vorderkante
      const kante = (/** @type {number} */ y) => X(8 + (y - 112) * 0.085);
      teile.push(
        S.flach(S.pfad(`M${z(kante(112))} 112 Q${z(X(12))} 112 ${z(X(13))} 113 C${z(X(19))} 124 ${z(X(20))} 140 ${z(X(19))} 156 C${z(X(18))} 168 ${z(X(21))} 178 ${z(X(21))} 187 L${z(kante(189))} 190 Z`), f.hemd),
        f.ringel ? { svg: `<path d="${[141, 160, 178].map((y) => `M${z(kante(y) + 1)} ${y} L${z(vorn(y) - 1.5)} ${y}`).join(" ")}" stroke="${f.ringel}" stroke-width="5" stroke-linecap="butt" fill="none"/>`, kontur: "" } : { svg: "", kontur: "" },
        S.falte(`M${z(kante(112))} 112 L${z(kante(190))} 190 L${z(kante(190) + 4)} 190 L${z(kante(112) + 3)} 114 Z`, f.hemd, 0.3),
        S.naht(`M${z(kante(112))} 112 L${z(kante(190))} 190`, f.oben, 2.6),
        S.naht(`M${z(X(-8))} 160 L${z(X(3))} 160`, f.oben, 2.4),
        S.naht(`M${z(X(2))} 112 L${z(X(-2))} 122 L${z(X(6))} 126`, f.oben, 2.4),
      );
    }
    if (f.muster) {
      const [m1, m2] = f.muster;
      const r1 = vorn(140);
      teile.push({ svg: `<path d="M${z(X(-17.5))} 140 L${z(r1 - 0.5)} 140 L${z(vorn(154) - 0.5)} 154 L${z(X(-18))} 154 Z" fill="${m1}" stroke="none"/>`
        + `<path d="M${z(X(-16))} 147 ${Array.from({ length: 6 }, (_, i) => `L${z(X(-16) + (i + 0.5) * (r1 - 2 - X(-16)) / 6)} ${i % 2 ? 150.5 : 143.5}`).join(" ")} L${z(r1 - 2)} 147" fill="none" stroke="${m2}" stroke-width="2.6" stroke-linecap="butt"/>`
        + `<path d="M${z(X(-18))} 154 L${z(vorn(154) - 0.5)} 154 L${z(vorn(156) - 0.5)} 156 L${z(X(-18))} 156 Z" fill="${S.dunkler(f.oben, 0.3)}" stroke="none"/>`, kontur: "" },
        S.naht(`M${z(X(-19))} 181 C${z(X(-6))} 186 ${z(X(8))} 186 ${z(X(21))} 181`, f.oben, 2.4),
        S.naht(`M${z(X(-14))} 183 l0.6 6 M${z(X(-5))} 184 l0.3 6 M${z(X(4))} 184 l0 6 M${z(X(13))} 183 l-0.4 6`, f.oben, 1.8),
        S.naht(`M${z(X(4))} 110 Q${z(X(10))} 114 ${z(X(13))} 113`, f.oben, 2.4));
    }
    if (f.latz) {
      const latz = f.latz;
      teile.push(
        S.form(S.pfad(`M${z(X(3))} 142 L${z(vorn(142) - 0.5)} 142 L${z(vorn(176))} 176 L${z(X(1))} 176 Z`), latz, P(X(4), 145), { s: 0.86, kontur: false }),
        S.form(S.pfad(`M${z(X(-18.5))} 172 L${z(vorn(172))} 172 L${z(X(21))} 187 C${z(X(10))} 193 ${z(X(-10))} 193 ${z(X(-19))} 187 Z`), latz, P(X(-16), 174), { s: 0.9, kontur: false }),
        // Träger: vom Latz senkrecht hoch über die Schulter, auf dem Rücken hinunter bis zum Bund
        S.form(S.pfad(`M${z(X(-12.5))} 174 L${z(X(-7.5))} 174 L${z(X(2))} 111 L${z(X(-3))} 110 Z`), latz, P(X(-9), 150), { s: 0.8, kontur: false }),
        S.form(S.pfad(`M${z(X(4))} 143 L${z(X(10))} 143 L${z(X(7))} 110 L${z(X(1))} 110 Z`), latz, P(X(3), 118), { s: 0.8, kontur: false }),
        { svg: `<circle cx="${z(X(-10))}" cy="171" r="2.2" fill="#E9D9A8" stroke="${S.dunkler(latz, 0.5)}" stroke-width="1.2"/>`, kontur: "" },
        { svg: `<circle cx="${z(X(7))}" cy="146" r="2.6" fill="#E9D9A8" stroke="${S.dunkler(latz, 0.5)}" stroke-width="1.4"/>`, kontur: "" },
        S.naht(`M${z(X(6))} 151 L${z(vorn(151) - 2)} 151 L${z(vorn(164) - 2)} 164 L${z(X(6))} 164`, latz, 2),
        S.falte(`M${z(X(3))} 142 L${z(vorn(142) - 0.5)} 142 L${z(vorn(145))} 145 L${z(X(3))} 145 Z`, f.oben, 0.4),
      );
    }
    if (f.kapuze) {
      teile.push(
        { svg: `<path d="M${z(X(10))} 114 L${z(X(12))} 138" fill="none" stroke="#FFFCF7" stroke-width="2.4"/><circle cx="${z(X(12))}" cy="140" r="2.2" fill="#FFFCF7" stroke="none"/>`, kontur: "" },
        S.naht(`M${z(X(-2))} 160 L${z(vorn(160) - 2)} 160 L${z(vorn(177) - 1)} 177 L${z(X(-2))} 177 Z`, f.oben, 2.4),
        S.falte(`M${z(X(-2))} 160 L${z(vorn(160) - 2)} 160 L${z(vorn(163) - 2)} 163 L${z(X(-2))} 163 Z`, f.oben, 0.3),
      );
    }
    if (!f.hemd && !f.latz) teile.push(S.naht(`M${z(X(2))} 110 Q${z(X(9))} 115 ${z(X(13))} 113`, f.oben, 2.4));
    return S.zusammen(...teile);
  };

  return {
    drehpunkte: {
      koerper: [160, 254], rumpf: [160, hueftY], kopf: [162, 110],
      "arm-hinten-oben": [160, schulterY + 2], "arm-hinten-unten": [162, 146],
      "arm-vorn-oben": [160, schulterY + 2], "arm-vorn-unten": [162, 146],
      "bein-hinten": [160, hueftY], "bein-vorn": [160, hueftY],
      "bein-hinten-unten": [160, KNIE], "bein-vorn-unten": [160, KNIE],
    },
    teile: {
      koerper: kopf.zoepfe ? [T("zoepfe", kopf.zoepfe)] : [],
      "bein-hinten": beinHinten.oben, "bein-hinten-unten": beinHinten.unten,
      "bein-vorn": beinVorn.oben, "bein-vorn-unten": beinVorn.unten,
      rumpf: [
        ...(f.kapuze ? [T("kapuze", S.zusammen(
          S.form(S.pfad(`M${z(X(-22))} 128 C${z(X(-27))} 108 ${z(X(-10))} 96 ${z(X(4))} 108 L${z(X(1))} 120 C${z(X(-6))} 112 ${z(X(-14))} 114 ${z(X(-16))} 130 Z`), f.oben, P(X(-20), 110), { s: 0.86 }),
          S.falte(`M${z(X(-10))} 106 C${z(X(-4))} 104 ${z(X(2))} 106 ${z(X(4))} 108 L${z(X(1))} 120 C${z(X(-2))} 114 ${z(X(-6))} 112 ${z(X(-10))} 112 Z`, f.oben, 0.4),
        ))] : []),
        T("hals", S.zusammen(S.form(S.pfad("M154 98 L171 98 L171 118 L154 118 Z"), f.haut, P(154, 98), { s: 0.7 }),
          S.falte("M154 98 L171 98 L171 110 Q162 114 154 106 Z", f.haut, 0.42))),
        T("huefte", { svg: `<path d="${huefte}" fill="${f.unten}" stroke="none"/>`, kontur: `<path d="${huefte}"/>` }),
        T("saumschatten", {
          svg: `<path d="M${z(X(-20))} 183 C${z(X(-10))} 191 ${z(X(10))} 191 ${z(X(21))} 183 L${z(X(21))} 191 C${z(X(10))} 199 ${z(X(-10))} 199 ${z(X(-20))} 191 Z" fill="${S.dunkler(f.unten, 0.5)}" stroke="none"/>`,
          kontur: "",
        }),
        T("oberteil", oberteil()),
      ],
      kopf: [
        ...(kopf.haareHinten ? [T("haare-hinten", kopf.haareHinten)] : []),
        // Kopf: Grundton, Schatten nur unter Kiefer und Kinn (Licht von oben links – die Nase bleibt hell)
        T("kopf", {
          svg: `<path d="${KOPF_PROFIL}" fill="${f.haut}" stroke="none"/>`
            + `<path d="M138 104 C148 110 164 115 180 114 C190 114 198 111 202 106 C199 113 190 118 178 118 C162 118 148 112 138 104 Z" fill="${S.dunkler(f.haut, 0.3)}" stroke="none"/>`
            + `<path d="M140 100 C150 108 166 112 182 111 C192 110 198 108 201 105 C196 110 188 113 178 113 C162 113 150 108 140 100 Z" fill="${S.dunkler(f.haut, 0.16)}" stroke="none"/>`
            + `<path d="${KOPF_PROFIL}" fill="none" stroke="${S.dunkler(f.haut, 0.5)}" stroke-width="2"/>`,
          kontur: `<path d="${KOPF_PROFIL}"/>`,
        }),
        T("ohr", kopf.ohr ?? S.zusammen(S.form(S.oval(151, 84, 6, 8.5), f.haut, P(149, 80), { s: 0.8 }), S.naht("M154 79 Q148 84 154 89", f.haut, 2))),
        ...(kopf.ponyschatten ? [T("haarschatten", kopf.ponyschatten)] : []),
        T("wangen", S.roete(186, 95, 7, 4.5, f.wangen)),
        T("nase", S.zusammen(S.falte("M205 89 C207 90 208 90 210 89 C209 91 207 92 205 91 Z", f.haut, 0.35), S.naht("M206 83 Q209 86 207 88", f.haut, 1.6))),
        { teil: "gesicht" },
        ...(kopf.nachGesicht ? [T("hilfsmittel", kopf.nachGesicht)] : []),
        ...(kopf.haareOben ? [T("haare-oben", kopf.haareOben)] : []),
      ],
      "arm-hinten-oben": armHinten.oben, "arm-hinten-unten": armHinten.unten,
      "arm-vorn-oben": armVorn.oben, "arm-vorn-unten": armVorn.unten,
    },
    gesicht: /** @type {[number, number]} */ (GESICHT.profil),
    plaetze: {
      kopf: { gelenk: "kopf", punkt: [164, 32] },
      "hand-vorn": { gelenk: "arm-vorn-unten", punkt: [166, 174] },
      "hand-hinten": { gelenk: "arm-hinten-unten", punkt: [166, 174] },
      ruecken: { gelenk: "rumpf", punkt: [X(-17), 130] },
      fuesse: { gelenk: "koerper", punkt: [160, 250] },
      schoss: { gelenk: "rumpf", punkt: [X(12), 182] },
    },
  };
}

// ------------------------------------------------------------------------------------------------
// Rollstuhl (Timo). Oberkörper, Kopf und Arme kommen aus demselben Schnitt, um die Sitzhöhe verschoben,
// damit Kopfgröße, Gesicht und Zubehör-Plätze bei allen Kindern gleich bleiben.

const REIFEN = "#3A3F4B";
const FELGE = "#C7CDD6";
const METALL = "#9AA6B4";
const RAHMEN = "#3E6E8C";
const POLSTER = "#34404F";
/** Sitzhöhe: so weit liegt der Oberkörper tiefer als beim stehenden Kind. */
export const SITZ_DY = 26;

/** @param {string|undefined} svg @param {number} dy */
const versetzt = (svg, dy) => (svg ? `<g transform="translate(0 ${dy})">${svg}</g>` : svg);
/** @param {Teil} t @param {number} dy @returns {Teil} */
function verschiebe(t, dy) {
  /** @type {Teil} */
  const neu = { teil: t.teil };
  if (t.svg !== undefined) neu.svg = versetzt(t.svg, dy);
  if (t.kontur !== undefined) neu.kontur = versetzt(t.kontur, dy);
  if (t.formen) {
    neu.formen = Object.fromEntries(Object.entries(t.formen).map(([k, v]) => [k, typeof v === "string"
      ? versetzt(v, dy) ?? ""
      : { svg: versetzt(v.svg, dy) ?? "", kontur: versetzt(v.kontur, dy) }]));
  }
  return neu;
}

/** Oberkörper einer Ansicht übernehmen und um dy nach unten verschieben. @param {import("../bestand.js").KindAnsicht} a @param {number} dy */
function oberkoerper(a, dy) {
  const gelenke = ["rumpf", "kopf", "arm-hinten-oben", "arm-hinten-unten", "arm-vorn-oben", "arm-vorn-unten"];
  /** @type {Record<string, Teil[]>} */
  const teile = {};
  /** @type {Record<string, [number, number]>} */
  const drehpunkte = {};
  for (const g of gelenke) {
    teile[g] = (a.teile[g] ?? []).map((t) => (t.teil === "gesicht" && !t.svg ? t : verschiebe(t, dy)));
    const [x, y] = a.drehpunkte[g];
    drehpunkte[g] = [x, y + dy];
  }
  /** @param {string} p */
  const platz = (p) => ({ ...a.plaetze[p], punkt: /** @type {[number, number]} */ ([a.plaetze[p].punkt[0], a.plaetze[p].punkt[1] + dy]) });
  return { teile, drehpunkte, gesicht: /** @type {[number, number]} */ ([a.gesicht[0], a.gesicht[1] + dy]), platz };
}

/**
 * Rad in Dreiviertelansicht (Ellipse): Reifen, Felge mit Speichen, Greifreifen.
 * @param {number} cx @param {number} cy @param {number} rx @param {number} ry @param {boolean} greifreifen
 */
function radSchraeg(cx, cy, rx, ry, greifreifen) {
  const speichen = [0, 45, 90, 135].map((g) => {
    const a = (g * Math.PI) / 180;
    const dx = Math.cos(a) * rx * 0.62;
    const dy = Math.sin(a) * ry * 0.72;
    return `M${z(cx - dx)} ${z(cy - dy)} L${z(cx + dx)} ${z(cy + dy)}`;
  }).join(" ");
  return S.zusammen(
    S.form(S.oval(cx, cy, rx, ry), REIFEN, [cx - rx * 0.5, cy - ry * 0.5], { s: 0.9 }),
    { svg: `<ellipse cx="${z(cx)}" cy="${z(cy)}" rx="${z(rx * 0.74)}" ry="${z(ry * 0.82)}" fill="${S.dunkler(FELGE, 0.1)}" stroke="none"/>`
      + `<path d="${speichen}" fill="none" stroke="${METALL}" stroke-width="1.8"/>`
      + `<ellipse cx="${z(cx)}" cy="${z(cy)}" rx="${z(rx * 0.16)}" ry="${z(ry * 0.14)}" fill="${METALL}" stroke="${S.dunkler(METALL, 0.4)}" stroke-width="1.2"/>`
      + `<path d="M${z(cx - rx * 0.55)} ${z(cy - ry * 0.55)} A${z(rx * 0.8)} ${z(ry * 0.86)} 0 0 1 ${z(cx + rx * 0.2)} ${z(cy - ry * 0.84)}" fill="none" stroke="${S.heller(REIFEN, 0.35)}" stroke-width="2.4" opacity="0.8"/>`, kontur: "" },
    greifreifen
      ? { svg: `<ellipse cx="${z(cx - rx * 0.18)}" cy="${z(cy)}" rx="${z(rx * 0.9)}" ry="${z(ry * 0.9)}" fill="none" stroke="${METALL}" stroke-width="2.6"/>`, kontur: "" }
      : { svg: "", kontur: "" },
  );
}

/**
 * Dreiviertelansicht im Rollstuhl, selbst fahrend (figuren.md §2).
 * @param {{breite: number, farben: Farben & Record<string, any>, kopf: KopfStuecke}} k
 * @returns {import("../bestand.js").KindAnsicht}
 */
export function dreiviertelStuhl(k) {
  const { breite: b, farben: f } = k;
  const X = (/** @type {number} */ d) => 160 + d * b;
  const P = (/** @type {number} */ x, /** @type {number} */ y) => /** @type {[number, number]} */ ([x, y]);
  const basis = dreiviertel(k);
  const ok = oberkoerper(basis, SITZ_DY);
  const sitzY = 186 + SITZ_DY;

  /** Ein sitzendes Bein aus einem Guss: Schienbein hinter dem Knie, Schuh auf der Fußstütze, vorn der verkürzte
   * Oberschenkel mit runder Kniekappe. @param {number} l @param {number} r linke/rechte Kante (Breiteneinheiten) */
  const bein = (l, r) => {
    const xl = X(l);
    const xr = X(r);
    const xm = (xl + xr) / 2;
    const knie = sitzY + 8;
    return S.zusammen(
      S.form(S.pfad(`M${z(xl + 3)} ${knie - 4} L${z(xr - 3)} ${knie - 4} C${z(xr - 2)} ${knie + 8} ${z(xr - 3)} 230 ${z(xr - 4)} 238`
        + ` L${z(xl + 4)} 238 C${z(xl + 3)} 230 ${z(xl + 2)} ${knie + 8} ${z(xl + 3)} ${knie - 4} Z`), f.unten, P(xl + 6, knie), { s: 0.84 }),
      schuhVorn(f, xm + 1, l < 0, -7),
      S.form(S.pfad(`M${z(xl)} ${sitzY - 10} L${z(xr)} ${sitzY - 10} C${z(xr + 3)} ${sitzY - 2} ${z(xr + 3)} ${knie + 2} ${z(xr - 1)} ${knie + 8}`
        + ` C${z(xm + 6)} ${knie + 14} ${z(xm - 6)} ${knie + 14} ${z(xl + 1)} ${knie + 8} C${z(xl - 3)} ${knie + 2} ${z(xl - 3)} ${sitzY - 2} ${z(xl)} ${sitzY - 10} Z`),
      f.unten, P(xl + 4, sitzY - 6), { s: 0.88 }),
      S.glanz(`M${z(xl + 5)} ${knie + 1} Q${z(xm)} ${knie - 3} ${z(xr - 5)} ${knie + 1}`, f.unten, 3.2),
      S.falte(`M${z(xl + 2)} ${sitzY - 10} L${z(xr)} ${sitzY - 10} L${z(xr)} ${sitzY - 6} Q${z(xm)} ${sitzY - 3} ${z(xl + 2)} ${sitzY - 6} Z`, f.unten, 0.35),
    );
  };

  const rollstuhl = S.zusammen(
    // Rückenlehne hinter dem Oberkörper, Schiebegriffe
    S.form(S.pfad(`M${z(X(-26))} ${sitzY - 62} Q${z(X(-26))} ${sitzY - 68} ${z(X(-20))} ${sitzY - 68} L${z(X(20))} ${sitzY - 68}`
      + ` Q${z(X(26))} ${sitzY - 68} ${z(X(26))} ${sitzY - 62} L${z(X(28))} ${sitzY} L${z(X(-28))} ${sitzY} Z`), POLSTER, P(X(-22), sitzY - 64)),
    S.glied(P(X(-27), sitzY - 66), 3, P(X(-29), sitzY - 76), 3.4, REIFEN),
    S.glied(P(X(27), sitzY - 66), 3, P(X(29), sitzY - 76), 3.4, REIFEN),
    // Sitzkissen
    S.form(S.pfad(`M${z(X(-30))} ${sitzY - 8} Q${z(X(-30))} ${sitzY - 13} ${z(X(-24))} ${sitzY - 13} L${z(X(26))} ${sitzY - 13}`
      + ` Q${z(X(32))} ${sitzY - 13} ${z(X(32))} ${sitzY - 8} L${z(X(32))} ${sitzY + 2} L${z(X(-30))} ${sitzY + 2} Z`), POLSTER, P(X(-26), sitzY - 11)),
    // Rahmen zur Fußstütze, Fußstütze, Lenkräder
    S.glied(P(X(-20), sitzY), 3, P(X(-18), 244), 3, METALL),
    S.glied(P(X(24), sitzY), 3, P(X(26), 244), 3, METALL),
    S.form(S.pfad(`M${z(X(-26))} 243 L${z(X(30))} 243 L${z(X(32))} 248 L${z(X(-28))} 248 Z`), RAHMEN, P(X(-24), 244), { s: 0.8 }),
    S.form(S.oval(X(-22), 250, 4, 5.5), REIFEN, P(X(-23), 248), { s: 0.8 }),
    S.form(S.oval(X(28), 250, 4, 5.5), REIFEN, P(X(27), 248), { s: 0.8 }),
  );

  return {
    drehpunkte: {
      koerper: [160, 254], ...ok.drehpunkte,
      rollstuhl: [160, sitzY], "rad-hinten": [X(36), 214], "rad-vorn": [X(-34), 216], beine: [160, sitzY],
    },
    teile: {
      koerper: [],
      "rad-hinten": [T("rad", radSchraeg(X(36), 214, 14, 33, false))],
      rollstuhl: [T("rollstuhl", rollstuhl)],
      ...ok.teile,
      beine: [T("beine", S.zusammen(bein(-25, -2), bein(2, 25)))],
      "rad-vorn": [T("rad", radSchraeg(X(-34), 216, 17, 37, true))],
    },
    gesicht: ok.gesicht,
    plaetze: {
      kopf: ok.platz("kopf"), "hand-vorn": ok.platz("hand-vorn"), "hand-hinten": ok.platz("hand-hinten"), ruecken: ok.platz("ruecken"),
      fuesse: { gelenk: "beine", punkt: [160, 248] },
      schoss: { gelenk: "beine", punkt: [162, sitzY - 6] },
    },
  };
}

/**
 * Profil im Rollstuhl, Blick nach rechts. Räder rund mit Speichen: sie drehen sich beim Rollen (Bewegung „gehen“).
 * @param {{breite: number, farben: Farben & Record<string, any>, kopf: KopfStuecke}} k
 * @returns {import("../bestand.js").KindAnsicht}
 */
export function profilStuhl(k) {
  const f = k.farben;
  const P = (/** @type {number} */ x, /** @type {number} */ y) => /** @type {[number, number]} */ ([x, y]);
  const basis = profil(k);
  const ok = oberkoerper(basis, SITZ_DY);
  const sitzY = 184 + SITZ_DY;
  const RX = 150;
  const RY = 216;
  /** Großes Rad im Profil: Reifen, Felge, 4 Speichen (45°-symmetrisch), Nabe, Greifreifen. @param {number} cx @param {number} cy @param {number} r @param {boolean} fern */
  const radRund = (cx, cy, r, fern) => {
    const reifen = fern ? S.dunkler(REIFEN, 0.1) : REIFEN;
    const felge = fern ? S.dunkler(FELGE, 0.2) : FELGE;
    const sp = [0, 45, 90, 135].map((g) => {
      const a = (g * Math.PI) / 180;
      return `M${z(cx - Math.cos(a) * r * 0.74)} ${z(cy - Math.sin(a) * r * 0.74)} L${z(cx + Math.cos(a) * r * 0.74)} ${z(cy + Math.sin(a) * r * 0.74)}`;
    }).join(" ");
    return S.zusammen(
      S.form(S.oval(cx, cy, r, r), reifen, P(cx - r * 0.4, cy - r * 0.4), { s: 0.9 }),
      { svg: `<circle cx="${z(cx)}" cy="${z(cy)}" r="${z(r * 0.78)}" fill="${felge}" stroke="none"/>`
        + `<path d="${sp}" fill="none" stroke="${S.dunkler(METALL, 0.1)}" stroke-width="1.8"/>`
        + `<circle cx="${z(cx)}" cy="${z(cy)}" r="4.5" fill="${METALL}" stroke="${S.dunkler(METALL, 0.4)}" stroke-width="1.2"/>`
        + (fern ? "" : `<circle cx="${z(cx)}" cy="${z(cy)}" r="${z(r * 0.9)}" fill="none" stroke="${METALL}" stroke-width="2.4"/>`
          + `<path d="M${z(cx - r * 0.62)} ${z(cy - r * 0.62)} A${z(r * 0.88)} ${z(r * 0.88)} 0 0 1 ${z(cx + r * 0.1)} ${z(cy - r * 0.88)}" fill="none" stroke="${S.heller(REIFEN, 0.35)}" stroke-width="2.4" opacity="0.8"/>`), kontur: "" },
    );
  };

  const rollstuhl = S.zusammen(
    // Rückenlehne hinter dem Rücken, Schiebegriff
    S.form(S.pfad(`M130 ${sitzY - 66} L142 ${sitzY - 66} L144 ${sitzY} L132 ${sitzY} Z`), POLSTER, P(132, sitzY - 62)),
    S.glied(P(134, sitzY - 64), 3, P(120, sitzY - 70), 3.4, REIFEN),
    // Sitz und Rahmen zur Fußstütze, Lenkrad
    S.form(S.pfad(`M130 ${sitzY - 10} L190 ${sitzY - 10} Q194 ${sitzY - 10} 194 ${sitzY - 6} L194 ${sitzY + 2} L130 ${sitzY + 2} Z`), POLSTER, P(134, sitzY - 8)),
    S.glied(P(188, sitzY + 2), 3, P(198, 244), 3, METALL),
    S.glied(P(186, sitzY + 2), 3, P(200, 236), 2.6, METALL),
    S.form(S.pfad("M192 243 L218 243 L218 248 L192 248 Z"), RAHMEN, P(194, 244), { s: 0.8 }),
    S.form(S.oval(204, 249, 5.5, 5.5), REIFEN, P(202, 247), { s: 0.8 }),
  );
  /** Sitzendes Bein im Profil: Oberschenkel nach vorn, Schienbein hinunter zur Fußstütze. @param {boolean} dunkel */
  const bein = (dunkel) => {
    const c = dunkel ? S.dunkler(f.unten, 0.16) : f.unten;
    const dx = dunkel ? -4 : 0;
    return S.zusammen(
      S.glied(P(186 + dx, sitzY - 4), 10, P(190 + dx, 236), 9, c),
      schuhSeite(f, 192 + dx, dunkel, -9),
      S.glied(P(156 + dx, sitzY - 6), 12, P(186 + dx, sitzY - 4), 10.5, c, { trenn: !dunkel }),
    );
  };

  return {
    drehpunkte: {
      koerper: [160, 254], ...ok.drehpunkte,
      rollstuhl: [160, sitzY], "rad-hinten": [RX - 6, RY - 2], "rad-vorn": [RX, RY], beine: [160, sitzY],
    },
    teile: {
      koerper: [],
      "rad-hinten": [T("rad", radRund(RX - 6, RY - 2, 35, true))],
      rollstuhl: [T("rollstuhl", rollstuhl)],
      ...ok.teile,
      beine: [T("beine", S.zusammen(bein(true), bein(false)))],
      "rad-vorn": [T("rad", radRund(RX, RY, 36, false))],
    },
    gesicht: ok.gesicht,
    plaetze: {
      kopf: ok.platz("kopf"), "hand-vorn": ok.platz("hand-vorn"), "hand-hinten": ok.platz("hand-hinten"), ruecken: ok.platz("ruecken"),
      fuesse: { gelenk: "beine", punkt: [200, 244] },
      schoss: { gelenk: "beine", punkt: [174, sitzY - 16] },
    },
  };
}
