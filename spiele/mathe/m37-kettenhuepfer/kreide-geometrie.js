// Kettenhüpfer: Lage der mit Kreide auf die Straße gemalten Perlenkette, leicht perspektivisch (ohne DOM, in Node
// testbar: tests/spiele/mathe/m37-kettenhuepfer.test.mjs). Gezeichnet wird in kreide.js.
//
// Bedeutung wie das Lernzeichen Perlenkette (spiele/rahmen/perlen-geometrie.js, grundsaetze-bilder §4 M1–M3):
// zehn Stäbchen zu je n Perlen, jede Perle einzeln, Lücke und Marke nach der fünften, zwei Reihen zu fünf, beide von
// links nach rechts. Jedes Stäbchen liegt quer zum Weg in seinem Hüpffeld (von vorn nach hinten gezählt); die
// Perlengröße hängt so an der Tiefe des Feldes, nicht an der Länge der ganzen Kette. Die vordere Reihe (Stäbchen
// 1–5) liegt nah, die hintere (6–10) etwas weiter hinten, flach genug, dass ihre Perlen fast so groß sind.
//
// Perspektive: Lochkamera schräg von oben auf den Boden. Alle Bildmaße in rem (Bildhöhe 108 rem). Ein Punkt am
// Boden hat die Lage u (quer, in rem gemessen auf der vorderen Reihe) und v (in die Tiefe, in rem auf der vorderen
// Reihe); sein Maßstab s fällt mit der Tiefe (1 auf der vorderen Reihe, R auf der hinteren). Kreise am Boden werden
// flache Ellipsen (Stauchung Q · s).

import { perlenkette, laenge, SCHRITT, LUECKE, GLIED } from "../../rahmen/perlen-geometrie.js";

/** Bildhöhe (rem), Höhe der Mitte der vorderen und der hinteren Reihe (rem von oben). */
export const BILD = Object.freeze({ hoehe: 108, nah: 86, fern: 60 });
/** Maßstab der hinteren Reihe zur vorderen (wie weit hinten sie liegt). */
export const R = 0.88;
/** Stauchung eines Kreises am Boden auf der vorderen Reihe (Höhe : Breite). */
export const Q = 0.85;
/** Größter Perlendurchmesser vorn (rem) und Platz für den Startkreis vor dem ersten Feld (rem). */
export const PERLE_MAX = 3.4;
export const START = 10;
/** Rand der Straße links und rechts der Kette (rem; rechts bleibt Platz für das Kästchen hinter dem Kettenende). */
export const RAND = Object.freeze({ links: 3, rechts: 14.5 });
/** Hüpffeld (Boden, rem vorn gemessen): Lücke zwischen zwei Feldern, Rand vor und hinter dem Stäbchen, Lücke zwischen den Reihen. */
export const FELD = Object.freeze({ luecke: 1.6, vorn: 1.4, hinten: 4.2, reihen: 2 });
/** Kreide-Kästchen in rem (nicht kleiner mit der Tiefe): Breite je Ziffer, Höhe, Rand, Pfeillänge, Schrift. */
export const KAESTCHEN = Object.freeze({ hoehe: 6.2, ziffer: 3, rand: 2.4, pfeil: 1.6, abstand: 0.6, schrift: 4.8 });

/** Horizont (rem von oben; über dem Bild). */
export const HORIZONT = (BILD.fern - R * BILD.nah) / (1 - R);

/** Maßstab an der Bildhöhe y (rem). @param {number} y */
export const massstabBei = (y) => (y - HORIZONT) / (BILD.nah - HORIZONT);

/**
 * Lage der Kreidekette von n auf einer Straße der Breite `breite` (rem, von links 0).
 * @param {unknown} n Reihe 1 … 10
 * @param {{ breite: number }} feld
 */
export function kreideKette(n, { breite }) {
  const k = perlenkette(n);
  if (!k) return null;
  // Tiefe zwischen den Reihen (rem am Boden), so dass ein Kreis vorn auf Q gestaucht ist.
  const tiefe = ((BILD.nah - HORIZONT) * (1 / R - 1)) / Q;
  const lang = laenge(k.n);
  // Perlendurchmesser: das Stäbchen füllt die Tiefe des Feldes, nicht die Breite der Straße.
  const d = Math.max(0.6, Math.min(PERLE_MAX, (tiefe - FELD.reihen - FELD.vorn - FELD.hinten) / lang));
  const halb = (lang * d + FELD.vorn + FELD.hinten) / 2; // halbe Tiefe des Hüpffelds
  const mitte = breite / 2;
  const fw = (breite - RAND.links - START - RAND.rechts) / 5; // Breite eines Feldes samt Lücke
  const u0 = -mitte + RAND.links + START; // linker Rand des ersten Feldes
  /** Bildpunkt eines Bodenpunkts (u quer, v Tiefe in rem; 0 = Mitte der vorderen Reihe). @param {number} u @param {number} v */
  const bild = (u, v) => {
    const s = 1 / (1 + (v / tiefe) * (1 / R - 1));
    return { x: mitte + u * s, y: HORIZONT + (BILD.nah - HORIZONT) * s, s };
  };
  const reiheV = (/** @type {number} */ r) => r * tiefe;
  /** Halbe Höhe einer Perle (Ellipse am Boden, streng perspektivisch). @param {number} s */
  const ry = (s) => (d / 2) * Q * s * s;
  /** Lage der Perle j (0-basiert) entlang des Stäbchens, in Perlendurchmessern ab seinem Anfang. @param {number} j */
  const entlang = (j) => (j + 0.5) * SCHRITT + (j >= 5 ? LUECKE : 0);
  const markeEntlang = 5 * SCHRITT + LUECKE / 2;
  const mitteU = (/** @type {number} */ i) => u0 + ((i % 5) + 0.5) * fw;
  const feldV = (/** @type {number} */ reihe) => reiheV(reihe) - halb + FELD.vorn; // Anfang (vorn) des Stäbchens
  const staebchen = k.staebchen.map((st) => {
    const i = st.nr - 1;
    const c = mitteU(i);
    const vS = feldV(st.reihe);
    const p = (/** @type {number} */ e) => bild(c, vS + e * d);
    const l = u0 + (i % 5) * fw + FELD.luecke / 2;
    const r = l + fw - FELD.luecke;
    const v0 = reiheV(st.reihe) - halb;
    const v1 = reiheV(st.reihe) + halb;
    const mitteStab = p(lang / 2);
    const oben = p(lang + 0.3);
    const unten = p(-0.3);
    return {
      nr: st.nr,
      reihe: st.reihe,
      anfang: p(0),
      ende: p(lang),
      mitte: mitteStab,
      perlen: st.perlen.map((_, j) => {
        const q = p(entlang(j));
        return { x: q.x, y: q.y, rx: (d / 2) * q.s, ry: ry(q.s), s: q.s };
      }),
      marke: st.marke === null ? null : p(markeEntlang),
      /** Hüpffeld: Ecken hinten links, hinten rechts, vorn rechts, vorn links. */
      feld: [bild(l, v1), bild(r, v1), bild(r, v0), bild(l, v0)],
      /** Leeres Kästchen des Stäbchens (Vorstellung): Mitte, Breite, Höhe. */
      kasten: { x: mitteStab.x, y: (oben.y + unten.y) / 2, s: mitteStab.s, b: 1.5 * d * mitteStab.s, h: unten.y - oben.y },
      /** Von links nach rechts quer über das Feld (Schwamm und Kreide gehen so darüber), Mitte des Feldes. */
      quer: { von: bild(l, reiheV(st.reihe)), bis: bild(r, reiheV(st.reihe)) },
    };
  });
  /** Ort nach `zahl` Perlen: am Ende eines Stäbchens (ein halbes Glied dahinter) oder zwischen zwei Perlen. Hinter
   * dem Kettenende (ueber): am rechten Rand des letzten Feldes. @param {number} zahl */
  const ort = (zahl) => {
    const z = Math.max(0, Math.round(zahl));
    if (z > 10 * k.n) {
      const q = bild(u0 + 4 * fw + fw - FELD.luecke / 2, reiheV(1));
      return { ...q, nr: 10, reihe: 1, ueber: true };
    }
    if (z === 0) return { ...bild(mitteU(0), feldV(0) - 0.45 * d), nr: 1, reihe: 0, ueber: false };
    const nr = z % k.n === 0 ? z / k.n : Math.floor(z / k.n) + 1;
    const st = staebchen[nr - 1];
    const vS = feldV(st.reihe);
    const rest = z - (nr - 1) * k.n; // Perlen auf diesem Stäbchen gezählt (1 … n)
    const e = rest === k.n ? lang + (GLIED / 2) : (entlang(rest - 1) + entlang(rest)) / 2;
    return { ...bild(mitteU(nr - 1), vS + e * d), nr, reihe: st.reihe, ueber: false };
  };
  /** Breite eines Kästchens für einen Text (rem). @param {string} text */
  const kaestchenBreite = (text) => Math.max(KAESTCHEN.hoehe * 1.15, text.length * KAESTCHEN.ziffer + KAESTCHEN.rand);
  /**
   * Kästchen neben der Stelle o: seite 1 rechts vom Stäbchen, -1 links; der Pfeil läuft waagerecht zur Stelle.
   * @param {ReturnType<typeof ort>} o @param {number} seite @param {string} text
   */
  const kaestchenAn = (o, seite, text) => {
    const b = kaestchenBreite(text);
    const rand = o.ueber ? 0.6 : (d / 2) * o.s + 0.6;
    const spitze = { x: o.x + seite * rand, y: o.y };
    return { x: spitze.x + seite * (KAESTCHEN.pfeil + b / 2), y: o.y, s: 1, spitze, seite, breite: b };
  };
  return {
    n: k.n,
    d,
    felderBreite: fw,
    staebchen,
    /** Startkreis vor dem ersten Feld, am hinteren Rand der vorderen Reihe (hier steht Lena vor dem ersten Hüpfer). */
    start: bild(u0 - START / 2, reiheV(0) + halb),
    /** Hier steht Lena auf Stäbchen nr (hinterer Rand seines Feldes, nie auf dem Feld selbst), 0: im Startkreis. @param {number} nr */
    stand: (nr) => {
      if (nr <= 0) return bild(u0 - START / 2, reiheV(0) + halb);
      const st = staebchen[Math.min(10, nr) - 1];
      return bild(mitteU(st.nr - 1), reiheV(st.reihe) + halb);
    },
    ort,
    /** Kästchen rechts vom Stäbchen nr, an seinem Ende (Zahl nr · n). @param {number} nr @param {string} [text] */
    pfeil(nr, text = String(nr * k.n)) {
      return kaestchenAn(ort(nr * k.n), 1, text);
    },
    /** Gestricheltes Kästchen links vom Stäbchen der Zahl, die Spitze zeigt auf ihren Ort; hinter dem Kettenende rechts davon. @param {number} zahl */
    hohl(zahl) {
      const o = ort(zahl);
      return kaestchenAn(o, o.ueber ? 1 : -1, String(Math.round(zahl)));
    },
    kaestchenBreite,
    /** Halbe Höhe der Perlen einer Reihe. @param {number} reihe */
    halb: (reihe) => ry(bild(0, reiheV(reihe)).s),
    bild,
  };
}
