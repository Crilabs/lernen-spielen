// Erkennung einer Handschrift-Linie: offline, tolerant, reine Logik ohne DOM (Node-Test in
// tests/schrift-erkennen.test.mjs; S18 Selbst schreiben, S20 nutzt sie wieder).
//
// Eingabe sind Striche in Haus-Einheiten (spiele/woerter/schriftzeichen.js: ein Band ist 100 hoch). Geprüft werden
// Startpunkt, Richtung, Reihenfolge und grobe Form nach dem Band; nicht Schönheit, Strichdicke, Tempo. Zusammengezogene
// Striche (a in einem Zug) gelten, wenn Weg und Reihenfolge stimmen: Kind und Vorlage werden je als ein Linienzug
// verglichen, mit den Sprüngen des Absetzens als gerade Brücken.
//
// bereit(): Ela fährt, sobald die Linie mindestens 80 % der Vorlagenlänge hat und jeder Punkt der Vorlage einen
// Tupfer; Striche unter 15 Einheiten (0,15 Bandhöhe) sind ein Tipp, kein Strich.

/** @typedef {[number, number]} Punkt */

export const TIPP = 15;
export const MIN_ANTEIL = 0.8;
export const MAX_ANTEIL = 2.2;
/** Mittlerer und größter Abstand zur Vorlage (Einheiten), Startradius = halbe Bandhöhe. */
export const TOLERANZ = Object.freeze({ mittel: 30, groesst: 70, start: 50 });
const N = 48;

/** @param {Punkt[]} p */
export function laenge(p) {
  let l = 0;
  for (let i = 1; i < p.length; i++) l += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
  return l;
}

/** Tinte: Länge aller Striche mit mindestens zwei Punkten. @param {Punkt[][]} striche */
export const tinte = (striche) => striche.reduce((s, x) => s + laenge(x), 0);

/** Gleichmäßig auf n Punkte, nach Weglänge. @param {Punkt[]} p @param {number} n @returns {Punkt[]} */
export function gleichmaessig(p, n = N) {
  if (p.length === 1) return Array.from({ length: n }, () => p[0]);
  const gesamt = laenge(p);
  if (gesamt === 0) return Array.from({ length: n }, () => p[0]);
  /** @type {Punkt[]} */
  const aus = [];
  let seg = 1;
  let vor = 0;
  for (let k = 0; k < n; k++) {
    const ziel = (gesamt * k) / (n - 1);
    while (seg < p.length - 1 && vor + Math.hypot(p[seg][0] - p[seg - 1][0], p[seg][1] - p[seg - 1][1]) < ziel) {
      vor += Math.hypot(p[seg][0] - p[seg - 1][0], p[seg][1] - p[seg - 1][1]);
      seg++;
    }
    const a = p[seg - 1];
    const b = p[seg];
    const sl = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const t = Math.max(0, Math.min(1, (ziel - vor) / sl));
    aus.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
  }
  return aus;
}

/** Alle Striche als ein Linienzug (Absetzen = gerade Brücke). @param {Punkt[][]} striche @returns {Punkt[]} */
export const zug = (striche) => striche.flat();

/** @param {Punkt[][]} striche @returns {{ minX: number, maxX: number, minY: number, maxY: number }} */
function huelle(striche) {
  const alle = striche.flat();
  return {
    minX: Math.min(...alle.map((p) => p[0])), maxX: Math.max(...alle.map((p) => p[0])),
    minY: Math.min(...alle.map((p) => p[1])), maxY: Math.max(...alle.map((p) => p[1])),
  };
}

/** @param {Punkt[][]} striche @param {number} dx @param {number} dy */
const versetzt = (striche, dx, dy) => striche.map((s) => s.map(([x, y]) => /** @type {Punkt} */ ([x + dx, y + dy])));

/** Die Vorlage an der senkrechten Mitte gespiegelt. @param {Punkt[][]} striche */
export function gespiegelt(striche) {
  const h = huelle(striche);
  return striche.map((s) => s.map(([x, y]) => /** @type {Punkt} */ ([h.minX + h.maxX - x, y])));
}

/**
 * Wie weit liegt der Linienzug des Kindes von der Vorlage? Das Kind wird links an die Vorlage gelegt (wo in der Zeile
 * es schreibt, ist gleich); senkrecht zählt das Band, nur bei freien Schwüngen schreibt man überall.
 * @param {Punkt[][]} kind @param {Punkt[][]} vorlage @param {boolean} freiHoch
 * @returns {{ mittel: number, groesst: number, start: number }}
 */
export function abstand(kind, vorlage, freiHoch) {
  const k = huelle(kind);
  const v = huelle(vorlage);
  const ks = versetzt(kind, v.minX - k.minX, freiHoch ? v.minY - k.minY : 0);
  const a = gleichmaessig(zug(ks));
  const b = gleichmaessig(zug(vorlage));
  let summe = 0;
  let groesst = 0;
  for (let i = 0; i < N; i++) {
    const d = Math.hypot(a[i][0] - b[i][0], a[i][1] - b[i][1]);
    summe += d;
    groesst = Math.max(groesst, d);
  }
  const s0 = ks.flat()[0];
  const v0 = vorlage.flat()[0];
  return { mittel: summe / N, groesst, start: Math.hypot(s0[0] - v0[0], s0[1] - v0[1]) };
}

/** @param {{ mittel: number, groesst: number }} d */
const nah = (d) => d.mittel <= TOLERANZ.mittel && d.groesst <= TOLERANZ.groesst;

/** Alle Reihenfolgen von bis zu drei Strichen. @template T @param {T[]} l @returns {T[][]} */
function folgen(l) {
  if (l.length <= 1) return [l];
  return l.flatMap((x, i) => folgen([...l.slice(0, i), ...l.slice(i + 1)]).map((r) => [x, ...r]));
}

/**
 * Das Kind: Striche unter TIPP sind Tupfer (ein Punkt) oder Tipp (weg), wenn die Vorlage keinen Punkt hat.
 * @param {Punkt[][]} striche @param {number} punkte Zahl der Tupfer der Vorlage
 * @returns {{ striche: Punkt[][], tupfer: number }}
 */
export function saeubere(striche, punkte) {
  /** @type {Punkt[][]} */
  const aus = [];
  let tupfer = 0;
  for (const s of striche) {
    if (!s.length) continue;
    if (s.length > 1 && laenge(s) >= TIPP) aus.push(s);
    else if (punkte > 0) {
      const m = /** @type {Punkt} */ ([s.reduce((t, p) => t + p[0], 0) / s.length, s.reduce((t, p) => t + p[1], 0) / s.length]);
      aus.push([m]);
      tupfer++;
    }
  }
  return { striche: aus, tupfer };
}

/**
 * Reicht, was das Kind gezogen hat, damit Ela fährt (80 % der Länge, jeder Punkt ein Tupfer), oder ist es schon viel zu viel?
 * @param {Punkt[][]} striche @param {Punkt[][]} vorlage
 */
export function bereit(striche, vorlage) {
  const punkte = vorlage.filter((s) => s.length === 1).length;
  const k = saeubere(striche, punkte);
  const ist = tinte(k.striche);
  const soll = tinte(vorlage);
  return (ist >= MIN_ANTEIL * soll && k.tupfer >= punkte) || ist > MAX_ANTEIL * soll;
}

/**
 * Urteil über die Linie des Kindes.
 * @param {Punkt[][]} striche das Kind (in Haus-Einheiten, in der Reihenfolge des Ziehens)
 * @param {Punkt[][]} vorlage Striche der Vorlage
 * @param {{ frei?: boolean }} [o] frei: Schwung auf freier Fläche (die Höhe zählt nicht)
 * @returns {{ ok: boolean, grund: null | "kurz" | "start" | "richtung" | "spiegel" | "reihenfolge" | "form" }}
 */
export function erkenne(striche, vorlage, { frei = false } = {}) {
  const punkte = vorlage.filter((s) => s.length === 1).length;
  const k = saeubere(striche, punkte);
  if (!k.striche.length) return { ok: false, grund: "kurz" };
  const ist = tinte(k.striche);
  const soll = tinte(vorlage);
  if (ist < MIN_ANTEIL * soll || k.tupfer < punkte) return { ok: false, grund: "kurz" };
  const d = abstand(k.striche, vorlage, frei);
  if (ist <= MAX_ANTEIL * soll && nah(d) && d.start <= TOLERANZ.start) return { ok: true, grund: null };

  // Warum nicht? Vom Besonderen zum Allgemeinen.
  if (nah(abstand(k.striche, gespiegelt(vorlage), frei))) return { ok: false, grund: "spiegel" };
  const rueck = k.striche.map((s) => [...s].reverse()).reverse();
  if (nah(abstand(rueck, vorlage, frei))) return { ok: false, grund: "richtung" };
  if (k.striche.length === vorlage.length && k.striche.length > 1 && k.striche.length <= 3) {
    for (const f of folgen(k.striche)) if (f.some((s, i) => s !== k.striche[i]) && nah(abstand(f, vorlage, frei))) return { ok: false, grund: "reihenfolge" };
  }
  if (d.start > TOLERANZ.start) return { ok: false, grund: "start" };
  return { ok: false, grund: "form" };
}
