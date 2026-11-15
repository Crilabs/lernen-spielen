// <ls-objekt art="versteckvorhang">: ein Vorhang an der Stange, hinter dem sich jemand versteckt – der Saum ist in der
// Mitte angehoben, darunter schauen zwei Schuhspitzen hervor (wie beim Versteckspiel). Feld 0…100.
// Licht von oben links: Stoff in Koralle mit Falten als Schattenformen (figuren.md §4), Stange aus Holz.
// Keine Person zu sehen, keine Ziffer, keine Schrift.

import { form, falte, glanz, naht, pfad, oval, zusammen, heller } from "../runde/kinder/stil.js";
import { meldeObjekt, bild } from "./objekt.js";

export const STOFF = "#FF9F8A";
const HOLZ = "#D2A56E";
const SCHUH = "#7FB6E8";
const SOHLE = "#FFFCF7";

/**
 * Eine Schuhspitze von vorn, die unter dem Saum hervorschaut; x ist die Mitte.
 * @param {number} x @returns {import("../runde/kinder/stil.js").Stueck}
 */
function spitze(x) {
  const kappe = form(pfad(`M${x - 6} 89 Q${x - 6.5} 80 ${x} 80 Q${x + 6.5} 80 ${x + 6} 89 Z`), SCHUH, [x - 2, 82], { s: 0.86 });
  const sohle = form(pfad(`M${x - 7} 88 L${x + 7} 88 Q${x + 7.5} 92 ${x + 5} 92 L${x - 5} 92 Q${x - 7.5} 92 ${x - 7} 88 Z`), SOHLE, [x - 3, 89], { s: 0.9 });
  return zusammen(sohle, kappe);
}

/** Der Vorhang als Stück im Feld 0…100. @returns {import("../runde/kinder/stil.js").Stueck} */
export function versteckvorhangStueck() {
  const schuhe = zusammen(spitze(44), spitze(57));
  const stoff = form(
    pfad("M23 12 L77 12 Q79 40 80 56 Q82 72 83 84 Q74 88 66 84 Q57 74 46 76 Q38 77 34 84 Q26 88 17 84 Q18 72 20 56 Q21 40 23 12 Z"),
    STOFF, [32, 22], { s: 0.9 },
  );
  const falten = zusammen(
    falte("M31 14 Q29 50 27 84 L30 85 Q32 50 33 14 Z", STOFF, 0.22),
    falte("M45 14 Q44 46 43 75 L46 75 Q47 46 47 14 Z", STOFF, 0.22),
    falte("M60 14 Q61 46 62 77 L65 80 Q64 46 62 14 Z", STOFF, 0.22),
    falte("M73 14 Q75 50 77 85 L80 85 Q77 50 75 14 Z", STOFF, 0.28),
  );
  const licht = glanz("M37 18 Q36 40 35 62", STOFF, 2.4);
  const ringe = naht("M27 14 L29 14 M38 14 L40 14 M49 14 L51 14 M60 14 L62 14 M71 14 L73 14", STOFF, 2);
  const stange = form(pfad("M13 8 L87 8 Q89 8 89 10.5 Q89 13 87 13 L13 13 Q11 13 11 10.5 Q11 8 13 8 Z"), HOLZ, [30, 9], { s: 0.9 });
  const knauf = zusammen(form(oval(10, 10.5, 4, 4), HOLZ, [9, 9], { s: 0.86 }), form(oval(90, 10.5, 4, 4), HOLZ, [89, 9], { s: 0.86 }));
  const kante = glanz("M16 9.6 L84 9.6", heller(HOLZ, 0.1), 1.4);
  return zusammen(schuhe, stoff, falten, licht, ringe, stange, knauf, kante);
}

meldeObjekt("versteckvorhang", {
  zustaende: ["haengt"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: versteckvorhangStueck() }], ursprung: [50, 92] }),
});
