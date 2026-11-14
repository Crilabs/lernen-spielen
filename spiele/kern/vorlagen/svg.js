// Liest eine Form-Datei der Schriftvorlagen (Spec 2026-11-14-schriftvorlagen, 5.2) ohne DOMParser,
// damit dieselbe Funktion im Browser, im Test und im Werkzeug läuft.

/**
 * @typedef {{nummer: number, luft: boolean, d: string}} RohStrich
 * @typedef {{breite: number, hoehe: number, zeichen: string, satz: string, striche: RohStrich[],
 *   fremd: string[], fuellung: number[]}} RohForm
 */

/**
 * @param {string} tag
 * @param {string} name
 * @returns {string | null}
 */
function attribut(tag, name) {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*"([^"]*)"`));
  return m ? m[1] : null;
}

/**
 * @param {string} text
 * @returns {RohForm}
 */
export function leseFormSvg(text) {
  const ohneKommentare = text.replace(/<!--[\s\S]*?-->/g, "");
  const kopf = ohneKommentare.match(/<svg\b[^>]*>/)?.[0] ?? "";
  const box = attribut(kopf, "viewBox")?.trim().split(/[\s,]+/).map(Number);
  if (!box || box.length !== 4 || box.some(Number.isNaN)) throw new Error("Form ohne gültige viewBox");
  /** @type {RohStrich[]} */
  const striche = [];
  /** @type {string[]} */
  const fremd = [];
  /** @type {number[]} */
  const fuellung = [];
  for (const [tag, name] of ohneKommentare.matchAll(/<([a-zA-Z][\w:-]*)\b[^>]*>/g)) {
    if (name === "svg") continue;
    if (name !== "path") {
      fremd.push(name);
      continue;
    }
    const nummer = Number(attribut(tag, "data-strich"));
    const fill = attribut(tag, "fill");
    if (fill !== null && fill !== "none") fuellung.push(nummer);
    striche.push({ nummer, luft: attribut(tag, "data-luft") === "ja", d: attribut(tag, "d") ?? "" });
  }
  return {
    breite: box[2],
    hoehe: box[3],
    zeichen: attribut(kopf, "data-zeichen") ?? "",
    satz: attribut(kopf, "data-satz") ?? "",
    striche,
    fremd,
    fuellung,
  };
}
