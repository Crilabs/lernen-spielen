// Kettenhüpfer: Lage der mit Kreide auf die Straße gemalten Perlenkette, leicht perspektivisch (ohne DOM, in Node
// testbar: tests/spiele/mathe/m37-kettenhuepfer.test.mjs). Gezeichnet wird in kreide.js.
//
// Bedeutung wie das Lernzeichen Perlenkette (spiele/rahmen/perlen-geometrie.js, grundsaetze-bilder §4 M1–M3):
// zehn Stäbchen zu je n Perlen, jede Perle einzeln, Lücke und Marke nach der fünften, zwei Reihen zu fünf, beide von
// links nach rechts. Die vordere Reihe (Stäbchen 1–5) liegt nah, die hintere (6–10) weiter hinten auf der Straße.
//
// Perspektive: Lochkamera schräg von oben auf den Boden. Alle Bildmaße in rem (Bildhöhe 108 rem). Ein Punkt am
// Boden hat die Lage u (quer, in rem gemessen auf der vorderen Reihe) und v (in die Tiefe, in rem auf der vorderen
// Reihe); sein Maßstab s fällt mit der Tiefe (1 auf der vorderen Reihe, R auf der hinteren). Kreise am Boden werden
// flache Ellipsen (Stauchung Q · s).

import { perlenkette, GLIED } from "../../rahmen/perlen-geometrie.js";

/** Bildhöhe (rem), Höhe der Perlenmitte der vorderen und der hinteren Reihe (rem von oben). */
export const BILD = Object.freeze({ hoehe: 108, nah: 89, fern: 60 });
/** Maßstab der hinteren Reihe zur vorderen (wie weit hinten sie liegt). */
export const R = 0.7;
/** Stauchung eines Kreises am Boden auf der vorderen Reihe (Höhe : Breite). */
export const Q = 0.6;
/** Größter Perlendurchmesser vorn (rem) und Platz für den Startkreis vor dem ersten Stäbchen (rem). */
export const PERLE_MAX = 8.4;
export const START = 13;
/** Halbe Tiefe eines Hüpffelds am Boden (rem, vorn gemessen): jedes Stäbchen liegt in seinem Feld wie beim Hüpfkästchen. */
export const FELD = 11;
/** Kreide-Kästchen (Pfeilchen) vorn in rem: Breite je Ziffer, Höhe, Abstand zur Perle; wächst mit s. */
export const KAESTCHEN = Object.freeze({ hoehe: 7, ziffer: 3.4, rand: 3, abstand: 1.2, schrift: 5.4 });

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
  const rand = 5;
  const d = Math.max(0.6, Math.min(PERLE_MAX, (breite - 2 * rand - START) / k.breite));
  const gesamt = START + k.breite * d;
  const mitte = breite / 2;
  const u0 = -gesamt / 2 + START; // u des ersten Stäbchens
  /** Bildpunkt eines Bodenpunkts (u quer, v Tiefe in rem; 0 = vordere Reihe). @param {number} u @param {number} v */
  const bild = (u, v) => {
    const s = 1 / (1 + (v / tiefe) * (1 / R - 1));
    return { x: mitte + u * s, y: HORIZONT + (BILD.nah - HORIZONT) * s, s };
  };
  const reiheV = (/** @type {number} */ r) => r * tiefe;
  /** Halbe Höhe einer Perle an der Stelle (Ellipse am Boden). @param {number} s */
  // Perlen etwas runder als streng perspektivisch (0,74 statt Q), damit auch kleine zählbar bleiben.
  const ry = (s) => (d / 2) * 0.74 * s * s;
  /** Hüpffeld von Stäbchen nr: Ecken hinten links, hinten rechts, vorn rechts, vorn links (die Grenze zweier Felder
   * liegt in der Mitte des Glieds, dort zeigt das Kästchen hin). @param {typeof k.staebchen[number]} st */
  const feldVon = (st) => {
    const v = reiheV(st.reihe);
    const l = u0 + (st.x0 - GLIED / 2) * d;
    const r = u0 + (st.x1 + GLIED / 2) * d;
    return [bild(l, v + FELD), bild(r, v + FELD), bild(r, v - FELD), bild(l, v - FELD)];
  };
  /** Halbe Bildhöhe eines Felds nach vorn bzw. hinten. @param {number} reihe @param {number} richtung 1 vorn, -1 hinten */
  const feldRand = (reihe, richtung) => Math.abs(bild(0, reiheV(reihe) - richtung * FELD).y - bild(0, reiheV(reihe)).y);
  const staebchen = k.staebchen.map((st) => {
    const v = reiheV(st.reihe);
    const p = (/** @type {number} */ x) => bild(u0 + x * d, v);
    return {
      nr: st.nr,
      reihe: st.reihe,
      anfang: p(st.x0),
      ende: p(st.x1),
      mitte: p((st.x0 + st.x1) / 2),
      perlen: st.perlen.map((x) => {
        const q = p(x);
        return { x: q.x, y: q.y, rx: (d / 2) * q.s, ry: ry(q.s), s: q.s };
      }),
      marke: st.marke === null ? null : p(st.marke),
      feld: feldVon(st),
    };
  });
  /** Halbe Höhe der Perlen einer Reihe. @param {number} reihe */
  const halb = (reihe) => ry(bild(0, reiheV(reihe)).s);
  /** Kästchen mit Mittelpunkt (x, y), Maßstab s, für einen Text. @param {{ x: number, y: number, s: number }} p @param {number} oben -1 über der Reihe, 1 darunter @param {number} reihe */
  const kaestchenAn = (p, oben, reihe) => {
    const h = KAESTCHEN.hoehe * p.s;
    const rand = feldRand(reihe, oben);
    const y = p.y + oben * (rand + KAESTCHEN.abstand * p.s + h / 2);
    return { x: p.x, y, s: p.s, spitze: { x: p.x, y: p.y + oben * (rand - 0.6 * p.s) } };
  };
  return {
    n: k.n,
    d,
    staebchen,
    /** Startkreis vor dem ersten Stäbchen (vordere Reihe). */
    start: bild(u0 - START / 2, 0),
    /** Glieder zwischen zwei Stäbchen derselben Reihe: von bis. */
    glieder: k.staebchen.slice(0, -1).filter((st, i) => k.staebchen[i + 1].reihe === st.reihe).map((st) => ({ von: staebchen[st.nr - 1].ende, bis: staebchen[st.nr].anfang })),
    /** Hier steht Lena auf Stäbchen k (Mitte), k = 0: im Startkreis. @param {number} nr */
    stand: (nr) => (nr <= 0 ? bild(u0 - START / 2, 0) : staebchen[Math.min(10, nr) - 1].mitte),
    /** Bildpunkt nach `zahl` Perlen (Ort eines Pfeilchens), mit Reihe. @param {number} zahl */
    ort: (zahl) => {
      const o = k.ort(zahl);
      return { ...bild(u0 + o.x * d, reiheV(o.reihe)), reihe: o.reihe, ueber: o.ueber };
    },
    /** Kreide-Kästchen unter dem Ende von Stäbchen nr (Zahl nr · n). @param {number} nr */
    pfeil(nr) {
      const o = this.ort(nr * k.n);
      return kaestchenAn(o, 1, o.reihe);
    },
    /** Gestricheltes Kästchen über dem Ort der Zahl (die getippte Zahl, die nicht passt). @param {number} zahl */
    hohl(zahl) {
      const o = this.ort(zahl);
      return kaestchenAn(o, -1, o.reihe);
    },
    /** Breite eines Kästchens für einen Text (rem, Maßstab 1). @param {string} text */
    kaestchenBreite: (text) => Math.max(KAESTCHEN.hoehe * 1.15, text.length * KAESTCHEN.ziffer + KAESTCHEN.rand),
    halb,
    bild,
    glied: GLIED * d,
  };
}
