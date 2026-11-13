// Fortschritt Kettenhüpfer: Anteil der 90 Einmaleins-Aufgaben (2er- bis 10er-Kette), die als gelernt gelten.
// Gelernt: einmal gelernt (g=1, bleibt bei Rückstufung) oder Fach >= GELERNT.
import { K, alleAufgaben } from "../einmaleins-logik.js";

export async function fortschritt(save) {
  const alle = alleAufgaben();
  const aufgaben = save?.version === 1 && save.aufgaben && typeof save.aufgaben === "object" ? save.aufgaben : {};
  const sicher = alle.filter(x => { const e = aufgaben[x.key]; return e && (e.g === 1 || e.f >= K.GELERNT); }).length;
  return { wert: sicher / alle.length, text: `${sicher} von ${alle.length} Aufgaben sicher` };
}
