// Fortschritt Perlenbrücke: Anteil der 44 geordneten Zerlegungen (3 bis 10), die als gelernt gelten.
// Gelernt: einmal gelernt (g=1, bleibt bei Rückstufung) oder Fach >= GELERNT.
import { K, paareVon } from "../perlen-logik.js";

export async function fortschritt(save) {
  const alle = [3, 4, 5, 6, 7, 8, 9, 10].flatMap(paareVon);
  const paare = save?.version === 2 && save.paare && typeof save.paare === "object" ? save.paare : {};
  const sicher = alle.filter(p => { const e = paare[p.key]; return e && (e.g === 1 || e.f >= K.GELERNT); }).length;
  return { wert: sicher / alle.length, text: `${sicher} von ${alle.length} Zerlegungen sicher` };
}
