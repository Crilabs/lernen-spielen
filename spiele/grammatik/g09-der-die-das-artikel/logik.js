// G09 Werkzeugwand: reine Spiellogik ohne DOM (in Node testbar, tests/spiele/grammatik/g09-der-die-das-artikel.test.mjs).
import { artikelAus } from "../../aufgabenarten.js";

/** Die drei Plättchen in fester Reihe. */
export const ARTIKEL = Object.freeze(["der", "die", "das"]);
/** Plätze an der Werkzeugwand (sechs Umrisse); danach kommt eine neue Wand. */
export const WAND_PLAETZE = 6;

/**
 * Aufgabe aus ihrem Schlüssel (artikel:hammer) oder null.
 * @param {string | null | undefined} key
 * @returns {{ key: string, id: string, wort: string, artikel: "der" | "die" | "das" } | null}
 */
export function aufgabeAus(key) {
  const a = artikelAus(/** @type {string} */ (key));
  return a ? { key: /** @type {string} */ (key), ...a } : null;
}

/** Passt das Plättchen? Die Sache urteilt: nur der Artikel des Wortes. @param {{ artikel: string }} a @param {string} plaettchen */
export const passt = (a, plaettchen) => a.artikel === plaettchen;

/** Das Plättchen, das passt (für Hilfe 2 und den Prüfstand). @param {{ artikel: string }} a */
export const richtigesPlaettchen = (a) => a.artikel;

/**
 * Der Satz der Stufe „kopf“: Plättchen an die Lücke (Nominativ, der Artikel bleibt unverändert).
 * @param {string} wort @returns {{ vor: string, nach: string }} Text vor der Lücke (leer) und nach ihr
 */
export const satzTeile = (wort) => ({ vor: "", nach: `${wort} hängt an der Wand.` });

/**
 * Welcher Wechsel steht an? null = keiner. „vorstellung“: das Werkzeug bleibt in der Kiste; „kopf“: das Wort steht in
 * einem Satz; „material“: das Werkzeug liegt wieder auf der Werkbank.
 * @param {string | null} vorher @param {string} jetzt
 */
export function bildWechsel(vorher, jetzt) {
  if (!vorher || vorher === jetzt) return null;
  return ["material", "vorstellung", "kopf"].includes(jetzt) ? jetzt : null;
}

/** Nächster freier Platz an der Wand (0 bis 5), oder null: die Wand ist voll. @param {number} belegt */
export const naechsterPlatz = (belegt) => (belegt < WAND_PLAETZE ? belegt : null);

/** Tonhöhe des Werkzeugs i beim Schaukeln der vollen Wand (Pentatonik, C-Dur, steigend). @param {number} i */
export function wandTon(i) {
  const halbtoene = [0, 2, 4, 7, 9, 12];
  return 392 * 2 ** (halbtoene[i % halbtoene.length] / 12);
}

/**
 * Die Freude nach einer richtigen Antwort: nie zweimal dieselbe, meist klein; jede dritte bis vierte hüpft Ela
 * (Idee §7). Der Witz kommt höchstens jede fünfte Aufgabe und nie nach einem Fehlversuch.
 * @param {string | null} vorige @param {number} seitHuepfen Aufgaben seit dem letzten Hüpfen @param {() => number} [rnd]
 * @returns {"nicken" | "klopfen" | "huepfen"}
 */
export function naechsteFreude(vorige, seitHuepfen, rnd = Math.random) {
  if (seitHuepfen >= 3 && vorige !== "huepfen" && rnd() < (seitHuepfen >= 4 ? 1 : 0.5)) return "huepfen";
  const klein = /** @type {("nicken" | "klopfen")[]} */ (["nicken", "klopfen"]).filter((f) => f !== vorige);
  return klein[Math.floor(rnd() * klein.length)] ?? "nicken";
}

/** @param {number} seitWitz Aufgaben seit dem letzten Witz @param {boolean} nachFehler @param {() => number} [rnd] */
export const witz = (seitWitz, nachFehler, rnd = Math.random) => !nachFehler && seitWitz >= 5 && rnd() < 0.6;
