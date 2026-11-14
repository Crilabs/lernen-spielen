// <ls-objekt art="auftragszettel">: ein Zettel vom Block (oben abgerissen) mit drei Zeilen Bleistift-Gekritzel und
// dem Bleistift schräg daneben. Feld 0…100. Das Gekritzel sind Wellen, keine Buchstaben (kein Text, keine Lernzeichen);
// Abriss als Zacken, Schatten in Stufen (figuren.md §4). Hochkant und eckig, damit es sich vom Papierknäuel abhebt.

import { form, flach, naht, pfad, zusammen } from "../runde/kinder/stil.js";
import { meldeObjekt, bild } from "./objekt.js";

export const ZETTEL = "#FBF3DC";
export const BLEISTIFT = "#F5C451";
const HOLZ = "#E8C9A0";
const MINE = "#5B5F73";
const RADIERER = "#F59A86";
const GEKRITZEL = "#8A8FA3";

/** Eine Zeile Gekritzel aus Wellen; Lücken trennen die „Wörter“. */
function zeile(/** @type {number} */ x, /** @type {number} */ y, /** @type {number[]} */ laengen) {
  let d = "";
  let px = x;
  for (const n of laengen) {
    d += `M${px} ${y}`;
    for (let i = 0; i < n; i++) d += ` q1.6 -3 3.2 0 q1.6 3 3.2 0`;
    px += n * 6.4 + 4;
  }
  return `<path d="${d}" fill="none" stroke="${GEKRITZEL}" stroke-width="2"/>`;
}

/** Zettel und Bleistift als Stück im Feld 0…100. @returns {import("../runde/kinder/stil.js").Stueck} */
export function auftragszettelStueck() {
  const blatt = form(
    pfad("M22 20 L27 15 L32 19 L37 14 L42 18 L47 13 L52 17 L57 12 L62 16 L67 12 L70 86 L26 89 Z"),
    ZETTEL, [30, 22], { s: 0.9 },
  );
  const gekritzel = { svg: zeile(29, 32, [2, 3]) + zeile(30, 46, [3, 1, 1]) + zeile(31, 60, [2, 2]), kontur: "" };
  const holz = form(pfad("M58 90 L68.3 84 L61.1 78.5 Z"), HOLZ, [62, 82], { s: 0.86 });
  const mine = flach(pfad("M58 90 L61.7 87.8 L59.2 85.9 Z"), MINE);
  const schaft = form(pfad("M61.1 78.5 L68.3 84 L93.1 51.4 L85.9 46 Z"), BLEISTIFT, [64, 78], { s: 0.86 });
  const kante = naht("M64.7 81.2 L89.5 48.7", BLEISTIFT, 1.6);
  const radierer = form(pfad("M85.9 46 L93.1 51.4 L96.7 46.7 L89.6 41.2 Z"), RADIERER, [88, 44], { s: 0.86 });
  return zusammen(blatt, gekritzel, holz, mine, schaft, kante, radierer);
}

meldeObjekt("auftragszettel", {
  zustaende: ["liegt"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: auftragszettelStueck() }], ursprung: [50, 88] }),
});
