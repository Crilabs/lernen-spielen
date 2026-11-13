// Fortschritt Großbuchstaben-Zauberer: Anteil der Nomen, die als gelernt gelten.
// Gesamtmenge = alle Nomen aus zauber-saetze.js (NOMEN: 12 Figuren + 10 Dinge = 22). Jedes
// kommt in den Sätzen vor; das Spiel lehrt "Nomen schreibt man groß". Schlüssel wie im
// Spiel: "der Hund". Kleingeschriebene Wörter ("~springt") zählen bewusst nicht: es sind
// viele Funktionswörter, die den Balken verwässern würden, und sie dienen nur als Gegenprobe.
// Gelernt: einmal gelernt (g=1, bleibt bei Rückstufung) oder Fach >= 4 (alte Stände ohne g).
import "../zauber-saetze.js";
const GELERNT = 4;

export async function fortschritt(save, holeJson) {
  const nomen = globalThis.ZauberSaetze?.NOMEN || {};
  const schluessel = new Set(Object.values(nomen).map((n) => n.a + " " + n.w));
  const woerter = save?.woerter && typeof save.woerter === "object" && !Array.isArray(save.woerter) ? save.woerter : {};
  let sicher = 0;
  for (const s of schluessel) {
    const e = woerter[s];
    if (e && (e.g === 1 || e.f >= GELERNT)) sicher++;
  }
  const gesamt = schluessel.size;
  return {
    wert: gesamt ? sicher / gesamt : 0,
    text: `${sicher} von ${gesamt} Nomen sicher`,
  };
}
