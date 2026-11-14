// Setzt ein Wort aus Formen zusammen (Spec 2026-11-14-schriftvorlagen, 5.4). In verbundenen Sätzen werden der
// letzte Strich einer Form, die Verbindung und der erste Strich der nächsten ein Zug. Abgesetzte Striche
// (data-luft: i-Punkt, t-Strich, Umlaut-Punkte) folgen nach dem Zug ihres Wortes.

import { richtungAm, tastePfadAb } from "./pfad.js";

/** @typedef {import("./pfad.js").Punkt} Punkt */
/** @typedef {import("../vorlagen.js").Form} Form */
/** @typedef {import("../vorlagen.js").Satz} Satz */
/** @typedef {import("../vorlagen.js").Raster} Raster */
/** @typedef {{breite: number, striche: Punkt[][], luft: boolean[]}} Wort */
/**
 * @typedef {{raster: Raster, satz: Satz, form: (zeichen: string) => Form,
 *   sonder: (von: string, nach: string) => Punkt[] | null, abtastung: number}} Werkzeug
 */

/**
 * @param {Punkt[]} punkte
 * @param {number} dx
 * @returns {Punkt[]}
 */
const verschiebe = (punkte, dx) => punkte.map((p) => ({ x: p.x + dx, y: p.y }));

/**
 * Kubische Kurve vom Ende des einen Strichs zum Anfang des nächsten, tangential an beide.
 * @param {Punkt[]} vorher
 * @param {Punkt[]} nachher
 * @param {number} abtastung
 * @returns {Punkt[]}
 */
function kurve(vorher, nachher, abtastung) {
  const a = vorher[vorher.length - 1];
  const b = nachher[0];
  const l = Math.hypot(b.x - a.x, b.y - a.y);
  if (l === 0) return [a];
  const t0 = richtungAm(vorher, "ende");
  const t1 = richtungAm(nachher, "anfang");
  const h = l / 3;
  const zahl = (/** @type {number} */ z) => +z.toFixed(3);
  const d = `M ${zahl(a.x)} ${zahl(a.y)} C ${zahl(a.x + t0.x * h)} ${zahl(a.y + t0.y * h)} ${zahl(b.x - t1.x * h)} ${zahl(b.y - t1.y * h)} ${zahl(b.x)} ${zahl(b.y)}`;
  const p = tastePfadAb(d, abtastung);
  p[0] = a;
  p[p.length - 1] = b;
  return p;
}

/** Toleranz, ab der ein Punkt als „an der Mittellinie“ gilt. */
const SCHEITEL = 8;

/**
 * Endet die Form davor oben (b, o, v, w, r, x), entfällt der Anstrich des nächsten Buchstabens mit Eingang unten
 * oder oval: Sein erster Strich beginnt dort, wo er die Mittellinie erreicht (Formänderung je Folgebuchstabe).
 * @param {Form} vorher
 * @param {Form} f
 * @param {Punkt[]} strich
 * @param {Raster} raster
 * @returns {Punkt[]}
 */
function ohneAnstrich(vorher, f, strich, raster) {
  if (vorher.ausgang !== "oben" || (f.eingang !== "unten" && f.eingang !== "oval")) return strich;
  const k = strich.findIndex((p) => p.y <= raster.mitte + SCHEITEL);
  return k > 0 ? strich.slice(k) : strich;
}

/**
 * @param {Form | null} vorher
 * @param {Form} f
 * @param {Satz} satz
 * @returns {boolean}
 */
function verbindbar(vorher, f, satz) {
  if (!vorher || vorher.ausgang === "keiner" || f.eingang === "keiner") return false;
  return !(f.eingang === "oval" && satz.ovalVerbindung === "luftsprung");
}

/**
 * @param {string} text
 * @param {Werkzeug} w
 * @returns {Wort}
 */
export function setzeWort(text, w) {
  /** @type {Punkt[][]} */
  const striche = [];
  /** @type {boolean[]} */
  const luft = [];
  let x = 0;
  let rand = 0;
  // NFC: ein zerlegtes ü (u + Trema, kommt aus macOS- und iPad-Eingaben) ist ein Zeichen; jeder Leerraum trennt.
  const woerter = text.normalize("NFC").split(/\s+/).filter((t) => t.length > 0);
  for (const [nr, teil] of woerter.entries()) {
    if (nr > 0) x = rand + w.raster.wortabstand;
    const formen = [...teil].map((c) => w.form(c));
    /** @type {Punkt[][]} */
    const zuege = [];
    /** @type {Punkt[][]} */
    const abgesetzt = [];
    /** @type {Form | null} */
    let vorher = null;
    for (const f of formen) {
      let dx = vorher ? rand + w.raster.abstand : x;
      if (!w.satz.verbunden) {
        // Ohne Verbindung: Striche der Form in ihrer Reihenfolge, nur verschoben.
        for (const [i, s] of f.striche.entries()) (striche.push(verschiebe(s, dx)), luft.push(f.luft[i]));
        rand = dx + f.breite;
        vorher = f;
        continue;
      }
      const zug = f.striche.filter((_, i) => !f.luft[i]);
      const punkte = f.striche.filter((_, i) => f.luft[i]);
      if (verbindbar(vorher, f, w.satz) && zug.length > 0 && zuege.length > 0) {
        const letzter = zuege[zuege.length - 1];
        const ende = letzter[letzter.length - 1];
        const sonder = w.sonder(/** @type {Form} */ (vorher).zeichen, f.zeichen);
        const erster = ohneAnstrich(/** @type {Form} */ (vorher), f, zug[0], w.raster);
        /** @type {Punkt[]} */
        let verbindung;
        if (sonder) {
          verbindung = verschiebe(sonder, ende.x - sonder[0].x);
          dx = verbindung[verbindung.length - 1].x - erster[0].x;
        } else {
          verbindung = kurve(letzter, verschiebe(erster, dx), w.abtastung);
        }
        letzter.push(...verbindung.slice(1), ...verschiebe(erster, dx).slice(1));
        for (const s of zug.slice(1)) zuege.push(verschiebe(s, dx));
      } else {
        for (const s of zug) zuege.push(verschiebe(s, dx));
      }
      for (const s of punkte) abgesetzt.push(verschiebe(s, dx));
      rand = dx + f.breite;
      vorher = f;
    }
    for (const z of zuege) (striche.push(z), luft.push(false));
    for (const z of abgesetzt) (striche.push(z), luft.push(true));
  }
  return { breite: rand, striche, luft };
}
