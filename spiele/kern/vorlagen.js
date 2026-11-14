// Zugang zu den Schriftvorlagen (Spec 2026-11-14-schriftvorlagen, 5.2): lädt raster.json, liste.json und die
// Form-Dateien einmal je Seite und liefert Formen als Strichlisten (Punktfolgen je Strich).
// Spiele lesen die SVG-Dateien nie selbst.

import { tastePfadAb } from "./vorlagen/pfad.js";
import { leseFormSvg } from "./vorlagen/svg.js";
import { setzeWort } from "./vorlagen/wort.js";

/** @typedef {import("./vorlagen/pfad.js").Punkt} Punkt */
/**
 * @typedef {{hoehe: number, oberlaenge: number, mitte: number, grund: number, unterlaenge: number,
 *   abstand: number, wortabstand: number}} Raster
 * @typedef {{zeichen: string, satz: string, breite: number, band: string[], spiegel: string | null,
 *   eingang: string | null, ausgang: string | null, striche: Punkt[][], luft: boolean[],
 *   freigegeben: string | null}} Form
 * @typedef {{verbunden: boolean, ovalVerbindung?: "durchgezogen" | "luftsprung"}} Satz
 * @typedef {{satz: string, von: string, nach: string, datei: string, punkte: Punkt[]}} Sonderverbindung
 */

/** Abstand der Abtastpunkte in Rastereinheiten. */
export const ABTASTUNG = 4;

/** @type {{raster: Raster, saetze: Record<string, Satz>, formen: Map<string, Form>, sonder: Sonderverbindung[]} | null} */
let stand = null;
/** @type {Promise<void> | null} */
let geladen = null;

/**
 * @param {URL} url
 * @returns {Promise<string>}
 */
async function hole(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Schriftvorlage nicht ladbar: ${url}`);
  return r.text();
}

/**
 * Lädt alle Vorlagen (einmal je Seite; weitere Aufrufe teilen sich das Ergebnis).
 * @param {URL | string} [basis]
 * @returns {Promise<void>}
 */
export function ladeVorlagen(basis = new URL("../schrift/vorlagen/", import.meta.url)) {
  geladen ??= (async () => {
    const wurzel = new URL(String(basis));
    const [raster, liste] = await Promise.all(
      ["raster.json", "liste.json"].map(async (n) => JSON.parse(await hole(new URL(n, wurzel)))),
    );
    /** @type {Map<string, Form>} */
    const formen = new Map();
    await Promise.all(
      liste.formen.map(async (/** @type {any} */ e) => {
        const roh = leseFormSvg(await hole(new URL(e.datei, wurzel)));
        formen.set(`${e.satz}/${e.zeichen}`, {
          zeichen: e.zeichen,
          satz: e.satz,
          breite: roh.breite,
          band: e.band,
          spiegel: e.spiegel,
          eingang: e.eingang,
          ausgang: e.ausgang,
          striche: roh.striche.map((s) => tastePfadAb(s.d, ABTASTUNG)),
          luft: roh.striche.map((s) => s.luft),
          freigegeben: e.freigegeben,
        });
      }),
    );
    const sonder = await Promise.all(
      liste.sonderverbindungen.map(async (/** @type {any} */ v) => {
        const roh = leseFormSvg(await hole(new URL(v.datei, wurzel)));
        return { satz: v.satz, von: v.von, nach: v.nach, datei: v.datei, punkte: tastePfadAb(roh.striche[0].d, ABTASTUNG) };
      }),
    );
    stand = { raster, saetze: liste.saetze, formen, sonder };
  })();
  return geladen;
}

function geladenerStand() {
  if (!stand) throw new Error("Schriftvorlagen nicht geladen (erst ladeVorlagen())");
  return stand;
}

/** @returns {Raster} */
export function raster() {
  return geladenerStand().raster;
}

/**
 * @param {string} satz
 * @returns {Satz | null}
 */
export function satzAngaben(satz) {
  return Object.hasOwn(geladenerStand().saetze, satz) ? geladenerStand().saetze[satz] : null;
}

/**
 * True nur, wenn der Satz bekannt ist und Formen hat. Kein Ersatz eines Satzes durch einen anderen.
 * @param {string} satz
 * @returns {boolean}
 */
export function hatSatz(satz) {
  return satzAngaben(satz) !== null && formen(satz).length > 0;
}

/**
 * @param {string} satz
 * @param {string} zeichen
 * @returns {Form}
 */
export function form(satz, zeichen) {
  const f = geladenerStand().formen.get(`${satz}/${zeichen}`);
  if (!f) throw new Error(`Fehlende Form: ${satz}/${zeichen}`);
  return f;
}

/**
 * @param {string} satz
 * @returns {Form[]}
 */
export function formen(satz) {
  return [...geladenerStand().formen.values()].filter((f) => f.satz === satz);
}

/**
 * Gezeichnete Verbindung von `von` nach `nach` im Satz, sonst null. `nach: "*"` passt auf jeden Nachfolger.
 * @param {string} satz
 * @param {string} von
 * @param {string} nach
 * @returns {Punkt[] | null}
 */
export function sonderverbindung(satz, von, nach) {
  const passend = geladenerStand().sonder.filter((v) => v.satz === satz && v.von === von);
  return (passend.find((v) => v.nach === nach) ?? passend.find((v) => v.nach === "*"))?.punkte ?? null;
}

/**
 * Setzt ein Wort (oder mehrere, durch Leerzeichen getrennt) aus den Formen eines Satzes zusammen.
 * Wirft `Fehlende Form: <satz>/<zeichen>`, wenn ein Zeichen fehlt.
 * @param {string} satz
 * @param {string} text
 * @returns {import("./vorlagen/wort.js").Wort}
 */
export function wort(satz, text) {
  const angaben = satzAngaben(satz);
  if (!angaben) throw new Error(`Unbekannter Satz: ${satz}`);
  return setzeWort(text, {
    raster: raster(),
    satz: angaben,
    form: (zeichen) => form(satz, zeichen),
    sonder: (von, nach) => sonderverbindung(satz, von, nach),
    abtastung: ABTASTUNG,
  });
}
