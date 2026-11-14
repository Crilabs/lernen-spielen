// Der feste Gelenkbaum der Runde. Jedes Kind hat dieselben Gelenknamen; es legt nur Drehpunkte und Teile fest.
// „vorn“ und „hinten“ statt „links“ und „rechts“, weil eine Figur gespiegelt werden kann.

/**
 * @typedef {"dreiviertel"|"profil"} Ansicht
 * @typedef {"geht"|"rollstuhl"} Bewegt
 * @typedef {{vor: string[], nach: string[], nur?: Bewegt}} Knoten
 */

/**
 * Gelenkbaum mit Zeichenreihenfolge: `vor` liegt hinter den eigenen Teilen, `nach` davor.
 * `nur` = das Gelenk gibt es nur für Kinder, die so unterwegs sind.
 * @type {Record<string, Knoten>}
 */
export const BAUM = {
  koerper: { vor: ["rad-hinten", "rollstuhl", "bein-hinten"], nach: ["rumpf", "beine", "bein-vorn", "rad-vorn"] },
  "rad-hinten": { vor: [], nach: [], nur: "rollstuhl" },
  rollstuhl: { vor: [], nach: [], nur: "rollstuhl" },
  "bein-hinten": { vor: [], nach: [], nur: "geht" },
  rumpf: { vor: ["arm-hinten-oben"], nach: ["kopf", "arm-vorn-oben"] },
  "arm-hinten-oben": { vor: [], nach: ["arm-hinten-unten"] },
  "arm-hinten-unten": { vor: [], nach: [] },
  kopf: { vor: [], nach: [] },
  "arm-vorn-oben": { vor: [], nach: ["arm-vorn-unten"] },
  "arm-vorn-unten": { vor: [], nach: [] },
  beine: { vor: [], nach: [], nur: "rollstuhl" },
  "bein-vorn": { vor: [], nach: [], nur: "geht" },
  "rad-vorn": { vor: [], nach: [], nur: "rollstuhl" },
};

export const WURZEL = "koerper";
export const BEINE = ["bein-hinten", "bein-vorn"];
export const PLAETZE = ["kopf", "hand-vorn", "hand-hinten", "ruecken", "fuesse", "schoss"];
/** @type {Ansicht[]} */
export const ANSICHTEN = ["dreiviertel", "profil"];
export const VERBOTENE_GESICHTER = ["traurig", "enttaeuscht", "erschrocken"];
/** Der Fußpunkt, um den `groesse` skaliert (Mitte unten). */
export const FUSSPUNKT = [160, 254];

/**
 * Alle Gelenke, die ein Kind hat, in Baum-Reihenfolge.
 * @param {Bewegt} bewegt
 * @returns {string[]}
 */
export function gelenkeFuer(bewegt) {
  /** @type {string[]} */
  const liste = [];
  /** @param {string} name */
  const gehe = (name) => {
    const k = BAUM[name];
    if (k.nur && k.nur !== bewegt) return;
    liste.push(name);
    k.vor.forEach(gehe);
    k.nach.forEach(gehe);
  };
  gehe(WURZEL);
  return liste;
}
