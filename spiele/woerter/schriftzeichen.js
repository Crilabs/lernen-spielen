// Vorlagen für Schwünge, Druckbuchstaben und Ziffern (S18 Selbst schreiben; S20 nutzt sie wieder).
//
// Haus-Einheiten (wie spiele/schrift/vorlagen/raster.json): x nach rechts, y nach unten, ein Band ist 100 hoch:
// Dach 0–100, Erdgeschoss 100–200, Keller 200–300. Grundlinie 200, Mittellinie 100. Die Formen folgen den
// Richtformen der bayerischen Druckschrift und Ziffern (spiele/schrift/vorlagen/QUELLEN.md): Startpunkt, Richtung,
// Strichfolge; keine Bilder übernommen. Ziffern 1, 4, 7 stehen als Pfade in spiele/schrift/vorlagen/ziffern/.
//
// Ein Strich ist ein Pfad aus M, L und C (absolut). Ein Strich nur mit M ist ein Punkt (i, j: der Tupfer).
//
// `richtung` sagt, was Lena beim verkehrten Anfang oder Umlauf sagt: "andersherum" (Bogenformen), "oben" (Start oben),
// null (der allgemeine Satz). `spiegel` heißt: das Spiegelbild ist eine andere Form (a, d, c, 4, 7), der Satz
// spricht dann vom Bogen auf der anderen Seite. `erstStab`: der erste Strich ist der Stab.

export const BAND = 100;
export const BAENDER = Object.freeze(["dach", "erdgeschoss", "keller"]);

/** @typedef {[number, number]} Punkt */
/**
 * @typedef {{ id: string, name: string, laut: string, art: "schwung" | "buchstabe" | "ziffer", striche: string[],
 *   baender: string[], richtung: "andersherum" | "oben" | null, spiegel: boolean, erstStab: boolean,
 *   reihe: null | { n: number, dx: number, fortlaufend: boolean } }} Zeichen
 */

/** Ein Pfad aus M, L, C (absolut) als Linienzug. @param {string} d @returns {Punkt[]} */
export function pfadPunkte(d) {
  const t = String(d).match(/[MLC]|-?\d+(?:\.\d+)?/g) ?? [];
  /** @type {Punkt[]} */
  const p = [];
  let i = 0;
  const num = () => Number(t[i++]);
  while (i < t.length) {
    const c = t[i++];
    if (c === "M" || c === "L") p.push([num(), num()]);
    else if (c === "C") {
      const [x0, y0] = p[p.length - 1];
      const [x1, y1, x2, y2, x3, y3] = [num(), num(), num(), num(), num(), num()];
      for (let k = 1; k <= 10; k++) {
        const s = k / 10;
        const u = 1 - s;
        p.push([u * u * u * x0 + 3 * u * u * s * x1 + 3 * u * s * s * x2 + s * s * s * x3, u * u * u * y0 + 3 * u * u * s * y1 + 3 * u * s * s * y2 + s * s * s * y3]);
      }
    } else throw new Error(`Schriftzeichen: unbekannter Pfadbefehl ${c}`);
  }
  return p;
}

/** Der Bauch von d, c, o, a (gegen den Uhrzeigersinn, von oben rechts über links nach unten). */
const BAUCH_AUF = "M 74 120 C 64 106 52 100 40 100 C 20 100 10 122 10 150 C 10 178 20 200 40 200 C 52 200 64 194 74 180";
const BAUCH_ZU = "M 74 120 C 64 106 52 100 40 100 C 20 100 10 122 10 150 C 10 178 20 200 40 200 C 62 200 74 178 74 150 C 74 138 74 130 74 120";

/** @param {Omit<Zeichen, "richtung" | "spiegel" | "erstStab" | "reihe"> & Partial<Pick<Zeichen, "richtung" | "spiegel" | "erstStab" | "reihe">>} z @returns {Zeichen} */
const z = (z) => ({ richtung: null, spiegel: false, erstStab: false, reihe: null, ...z });

/** @type {Zeichen[]} */
export const ZEICHEN = [
  // Schwünge (freie Fläche, Dach und Erdgeschoss)
  z({ id: "schwung-senkrecht", name: "Regen fällt", laut: "Regen fällt.", art: "schwung", striche: ["M 30 10 L 30 190"], baender: ["dach", "erdgeschoss"], richtung: "oben", reihe: { n: 3, dx: 70, fortlaufend: false } }),
  z({ id: "schwung-waagerecht", name: "Die Straße", laut: "Die Straße.", art: "schwung", striche: ["M 0 150 L 200 150"], baender: ["erdgeschoss"] }),
  z({ id: "schwung-kreis-linksherum", name: "Die Schnecke rollt", laut: "Die Schnecke rollt.", art: "schwung",
    striche: ["M 60 100 C 32 100 10 122 10 150 C 10 178 32 200 60 200 C 88 200 110 178 110 150 C 110 122 88 100 60 100"], baender: ["erdgeschoss"], richtung: "andersherum", reihe: { n: 3, dx: 140, fortlaufend: false } }),
  z({ id: "schwung-girlande", name: "Schaukel", laut: "Schaukel.", art: "schwung", striche: ["M 0 110 C 0 160 20 190 50 190 C 80 190 100 160 100 110"], baender: ["erdgeschoss"], reihe: { n: 3, dx: 100, fortlaufend: true } }),
  z({ id: "schwung-arkade", name: "Brücken", laut: "Brücken.", art: "schwung", striche: ["M 0 190 C 0 140 20 110 50 110 C 80 110 100 140 100 190"], baender: ["erdgeschoss"], reihe: { n: 3, dx: 100, fortlaufend: true } }),
  // Druckbuchstaben, klein
  z({ id: "l", name: "l", laut: "l.", art: "buchstabe", striche: ["M 40 0 L 40 200"], baender: ["dach", "erdgeschoss"], richtung: "oben", erstStab: true }),
  z({ id: "i", name: "i", laut: "i.", art: "buchstabe", striche: ["M 40 100 L 40 200", "M 40 40"], baender: ["dach", "erdgeschoss"], richtung: "oben", erstStab: true }),
  z({ id: "t", name: "t", laut: "t.", art: "buchstabe", striche: ["M 40 40 L 40 200", "M 8 105 L 72 105"], baender: ["dach", "erdgeschoss"], richtung: "oben", erstStab: true }),
  z({ id: "c", name: "c", laut: "c.", art: "buchstabe", striche: [BAUCH_AUF], baender: ["erdgeschoss"], richtung: "andersherum", spiegel: true }),
  z({ id: "o", name: "o", laut: "o.", art: "buchstabe", striche: [BAUCH_ZU], baender: ["erdgeschoss"], richtung: "andersherum" }),
  z({ id: "a", name: "a", laut: "a.", art: "buchstabe", striche: [BAUCH_ZU, "M 74 100 L 74 200"], baender: ["erdgeschoss"], richtung: "andersherum", spiegel: true }),
  z({ id: "d", name: "d", laut: "d.", art: "buchstabe", striche: [BAUCH_AUF, "M 74 0 L 74 200"], baender: ["dach", "erdgeschoss"], richtung: "andersherum", spiegel: true }),
  // Ziffern (Dach und Erdgeschoss)
  z({ id: "ziffer-1", name: "1", laut: "eins.", art: "ziffer", striche: ["M 30 50 L 70 0 L 70 200"], baender: ["dach", "erdgeschoss"], richtung: null }),
  z({ id: "ziffer-4", name: "4", laut: "vier.", art: "ziffer", striche: ["M 52 0 L 10 135 L 102 135", "M 78 30 L 78 200"], baender: ["dach", "erdgeschoss"], spiegel: true }),
  z({ id: "ziffer-7", name: "7", laut: "sieben.", art: "ziffer", striche: ["M 12 0 L 95 0 L 40 200", "M 38 100 L 88 100"], baender: ["dach", "erdgeschoss"], spiegel: true }),
];

/** @param {string} id @returns {Zeichen | null} */
export const zeichenMit = (id) => ZEICHEN.find((x) => x.id === id) ?? null;

/** Die Striche eines Zeichens als Linienzüge; mit `reihe` die Reihe (Schwünge auf vorstellung und kopf). @param {Zeichen} zeichen @param {boolean} [reihe] @returns {Punkt[][]} */
export function strichePunkte(zeichen, reihe = false) {
  const einheit = zeichen.striche.map(pfadPunkte);
  const r = zeichen.reihe;
  if (!reihe || !r) return einheit;
  const schieb = (/** @type {Punkt[]} */ s, /** @type {number} */ k) => s.map(([x, y]) => /** @type {Punkt} */ ([x + k * r.dx, y]));
  if (r.fortlaufend) return [Array.from({ length: r.n }, (_, k) => schieb(einheit[0], k).slice(k ? 1 : 0)).flat()];
  return Array.from({ length: r.n }, (_, k) => einheit.map((s) => schieb(s, k))).flat();
}

/** Die Daten einer Aufgabe (aufgabenarten.js): Striche als Linienzüge, Punkte (Tupfer), Bänder, Laut. @param {Zeichen} zeichen */
export function aufgabenDaten(zeichen) {
  const striche = strichePunkte(zeichen).map((s) => s.map(([x, y]) => /** @type {Punkt} */ ([Math.round(x * 10) / 10, Math.round(y * 10) / 10])));
  return {
    zeichen: zeichen.id, laut: zeichen.laut, name: zeichen.name, art: zeichen.art, striche,
    punkte: striche.filter((s) => s.length === 1).map((s) => s[0]),
    baender: [...zeichen.baender], reihe: zeichen.reihe !== null,
  };
}

/** Schwierigkeit: Zahl der Striche plus Wechsel der Drehrichtung (Idee §8). @param {Zeichen} zeichen */
export function zeichenSchwierigkeit(zeichen) {
  const wechsel = { a: 1, d: 1, "ziffer-4": 1, "ziffer-7": 1, t: 1 };
  return zeichen.striche.length + ((/** @type {Record<string, number>} */ (wechsel))[zeichen.id] ?? 0);
}
