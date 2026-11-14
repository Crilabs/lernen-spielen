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
  /** Weites Hosenbein, ein Stück bis zum Saum: Schattenstreifen rechts in einer Flucht mit der Hüfte. @param {number} cx @param {1|-1} o */
  const hosenbein = (cx, o) => {
    const u = cx + o * 7;
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
    T("schuh", schuh(X(dx) + o * 7, o < 0)),
  ];
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
      S.form(S.pfad(`M${z(X(-15))} 143 L${z(X(-9))} 143 L${z(X(-15))} 112 L${z(X(-21))} 114 Z`), latz, P(X(-19), 116), { s: 0.8, kontur: false }),
      S.form(S.pfad(`M${z(X(9))} 143 L${z(X(15))} 143 L${z(X(22))} 114 L${z(X(16))} 112 Z`), latz, P(X(14), 116), { s: 0.8, kontur: false }),
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
    },
    teile: {
      koerper: kopf.zoepfe ? [T("zoepfe", kopf.zoepfe)] : [],
      "bein-hinten": bein(-13, -1),
      "bein-vorn": bein(13, 1),
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
 * Profil im Rollstuhl (vorläufig schlicht, folgt mit dem Profil aller Kinder). Räder rund, damit sie beim Fahren rollen.
 * @param {{breite: number, farben: Farben, kopf: Kopfteile}} k
 * @returns {import("../bestand.js").KindAnsicht}
 */
export function profilStuhl(k) {
  const f = k.farben;
  const basis = profil(k);
  const ok = oberkoerper(basis, SITZ_DY);
  const sitzY = 184 + SITZ_DY;
  /** @param {number} cx @param {number} cy @param {number} r */
  const radRund = (cx, cy, r) => kreis(cx, cy, r, REIFEN) + kreis(cx, cy, r * 0.78, FELGE)
    + `<path d="M${cx - r * 0.78} ${cy} L${cx + r * 0.78} ${cy} M${cx} ${cy - r * 0.78} L${cx} ${cy + r * 0.78}` 
    + ` M${z(cx - r * 0.55)} ${z(cy - r * 0.55)} L${z(cx + r * 0.55)} ${z(cy + r * 0.55)} M${z(cx - r * 0.55)} ${z(cy + r * 0.55)} L${z(cx + r * 0.55)} ${z(cy - r * 0.55)}"`
    + ` stroke="${METALL}" stroke-width="2" fill="none"/>` + kreis(cx, cy, 4, METALL);
  return {
    drehpunkte: { koerper: [160, 254], ...ok.drehpunkte, rollstuhl: [160, sitzY], "rad-hinten": [150, 218], "rad-vorn": [154, 218], beine: [160, sitzY] },
    teile: {
      koerper: [],
      "rad-hinten": [{ teil: "rad", svg: radRund(150, 218, 34) }],
      rollstuhl: [{ teil: "rollstuhl", svg: flaeche(`M132 ${sitzY - 70} L144 ${sitzY - 70} L146 ${sitzY} L134 ${sitzY} Z`, POLSTER)
        + flaeche(`M134 ${sitzY - 8} L188 ${sitzY - 8} L188 ${sitzY + 2} L134 ${sitzY + 2} Z`, POLSTER)
        + glied([186, sitzY + 2, 196, 244], 4, METALL) + flaeche("M188 243 L212 243 L212 248 L188 248 Z", RAHMEN) + kreis(196, 250, 5, REIFEN) }],
      ...ok.teile,
      beine: [{ teil: "beine", svg: glied([162, sitzY - 4, 192, sitzY - 2], 20, f.unten) + glied([192, sitzY - 2, 194, 236], 18, f.unten)
        + ellipse(201, 242, 14, 7, f.schuhe) }],
      "rad-vorn": [{ teil: "rad", svg: radRund(154, 218, 36) }],
    },
    gesicht: ok.gesicht,
    plaetze: {
      kopf: ok.platz("kopf"), "hand-vorn": ok.platz("hand-vorn"), "hand-hinten": ok.platz("hand-hinten"), ruecken: ok.platz("ruecken"),
      fuesse: { gelenk: "beine", punkt: [200, 246] },
      schoss: { gelenk: "beine", punkt: [176, sitzY - 14] },
    },
  };
}
