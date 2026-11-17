// G01 Dreieck und Kreis: reine Spiellogik ohne DOM (in Node testbar, tests/spiele/grammatik/g01-dreieck-und-kreis-wortarten-mit-symbolen.test.mjs).
import { wortartAus } from "../../aufgabenarten.js";
import { satzMit, probeText, danebenText } from "../../woerter/wortarten.js";

/** Die Wortarten, die ein Symbol auf dem Tablett tragen, in fester Reihe (Dreieck vor Kreis vor Adjektiv). */
export const SYMBOLE = Object.freeze(["nomen", "verb", "adjektiv"]);
/** Wortarten, deren Wörter in der Stufe „material“ einzeln mit Bild stehen (der Artikel und Füllwörter bleiben weg). */
const INHALT = new Set(["nomen", "verb", "adjektiv"]);

/**
 * @typedef {import("../../woerter/wortarten.js").Wort} Wort
 * @typedef {{ i: number, wort: Wort, bild: string | null }} Karte
 * @typedef {{ key: string, ziel: string, satz: string, stufe: string, text: string, karten: Karte[], symbole: ("nomen" | "verb" | "adjektiv")[] }} Plan
 */

/**
 * Was auf dem Hof liegt: die Kästchen mit ihren Wörtern und die Symbole auf dem Tablett.
 * material: nur die Inhaltswörter, einzeln, mit Kreidebild, ein Symbol (die Wortart des Themas).
 * vorstellung: der Satz ohne Bilder, die Wortart des Themas. kopf: der Satz, dazu die Wortarten aus `kopfZiel`
 * (tunwoerter: auch die Nomen). Je Wort der Wortart ein Symbol.
 * @param {{ key: string, daten?: { ziel?: string[], kopfZiel?: string[] } }} aufgabe @param {string} [stufe]
 * @returns {Plan | null}
 */
export function plan(aufgabe, stufe = "material") {
  const a = wortartAus(aufgabe?.key);
  const s = a ? satzMit(a.id) : null;
  if (!a || !s) return null;
  const ziele = stufe === "kopf" ? aufgabe.daten?.kopfZiel ?? aufgabe.daten?.ziel ?? [a.ziel] : aufgabe.daten?.ziel ?? [a.ziel];
  const arten = SYMBOLE.filter((x) => ziele.includes(x));
  const woerter = s.woerter.map((wort, i) => ({ i, wort, bild: stufe === "material" ? wort.bild ?? null : null }));
  const karten = stufe === "material" ? woerter.filter((k) => k.wort.art && INHALT.has(k.wort.art)) : woerter;
  const symbole = /** @type {("nomen" | "verb" | "adjektiv")[]} */ (
    arten.flatMap((art) => karten.filter((k) => k.wort.art === art).map(() => art))
  );
  return { key: a.key, ziel: a.ziel, satz: a.id, stufe, text: s.text, karten, symbole };
}

/** Passt das Symbol zum Wort? Die Sache urteilt: nur die Wortart des Wortes. @param {Karte} karte @param {string} symbol */
export const passt = (karte, symbol) => karte.wort.art === symbol;

/**
 * Das Wort, auf das das nächste Symbol gehört (für Hilfe 2 und den Prüfstand): das erste unbelegte Kästchen, das zum
 * Symbol passt. @param {Karte[]} karten @param {Set<number>} belegt @param {string} symbol
 */
export const richtigesKaestchen = (karten, belegt, symbol) => karten.find((k) => !belegt.has(k.i) && passt(k, symbol)) ?? null;

/**
 * Kästchen, an denen Hilfe 1 die Probe zeigt: die unbelegten Inhaltswörter, an denen ein anderes Symbol etwas täte (die
 * Gegenprobe). @param {Karte[]} karten @param {Set<number>} belegt
 */
export const probeKaesten = (karten, belegt) => karten.filter((k) => !belegt.has(k.i) && k.wort.art && INHALT.has(k.wort.art));

/** Sprechtext der Probe am richtigen Wort (die Wirkung): „Die Katze.“, „Ich gähne, du gähnst.“ @param {Wort} w */
export const richtigText = (w) => probeText(w) ?? "";

/** Sprechtext der Probe am falschen Wort: „Der gähnt?“, „Ich Katze?“ @param {string} symbol @param {Wort} w */
export const falschText = (symbol, w) => danebenText(/** @type {"nomen" | "verb" | "adjektiv"} */ (symbol), w);

/** Das Wort, das als Kreideprobe vor dem Wort steht: „die“, „ich“, „du“, „der große“. @param {Wort} w @param {"ich" | "du"} [person] */
export function probeKreide(w, person = "ich") {
  if (w.art === "nomen") return w.artikel ?? "";
  if (w.art === "verb") return person;
  if (w.art === "adjektiv") return `${w.artikel ?? ""} ${w.wort}`;
  return "";
}

/**
 * Welcher Wechsel steht an? null = keiner. „ohneBilder“: die Kästchen verlieren ihre Bilder (von material zu einer
 * anderen Stufe); „mitBildern“: sie bekommen wieder welche; „zweitesSymbol“: auf dem Tablett liegt jetzt auch das
 * Symbol einer zweiten Wortart (kopf). Nie bei der ersten Aufgabe.
 * @param {string | null} vorher @param {string} jetzt @param {string[]} ziele @param {string[]} kopfZiele
 * @returns {"ohneBilder" | "mitBildern" | "zweitesSymbol" | null}
 */
export function bildWechsel(vorher, jetzt, ziele, kopfZiele) {
  if (!vorher || vorher === jetzt) return null;
  if (vorher === "material") return "ohneBilder";
  if (jetzt === "material") return "mitBildern";
  if (jetzt === "kopf" && kopfZiele.length > ziele.length) return "zweitesSymbol";
  return null;
}

/** Tonhöhe des k-ten Hüpfers beim Abhüpfen des Satzes (Pentatonik, C-Dur, steigend). @param {number} k */
export function huepfTon(k) {
  const halbtoene = [0, 2, 4, 7, 9, 12, 14, 16];
  return 392 * 2 ** (halbtoene[k % halbtoene.length] / 12);
}

/**
 * Die Freude nach einer richtigen Antwort: nie zweimal dieselbe, meist klein; jede dritte bis vierte ein höherer
 * Sprung (Idee §7). @param {string | null} vorige @param {number} seitHuepfen Aufgaben seit dem letzten Sprung @param {() => number} [rnd]
 * @returns {"nicken" | "klopfen" | "huepfen"}
 */
export function naechsteFreude(vorige, seitHuepfen, rnd = Math.random) {
  if (seitHuepfen >= 3 && vorige !== "huepfen" && rnd() < (seitHuepfen >= 4 ? 1 : 0.5)) return "huepfen";
  const klein = /** @type {("nicken" | "klopfen")[]} */ (["nicken", "klopfen"]).filter((f) => f !== vorige);
  return klein[Math.floor(rnd() * klein.length)] ?? "nicken";
}

/**
 * Der Witz: höchstens jede fünfte Aufgabe, nie nach einem Fehlversuch (Idee §7). Bei „gähnt“ gähnt Kofi mit; nach einer
 * langen Reihe (mehr als vier Wörter) landet er wackelig.
 * @param {number} seitWitz Aufgaben seit dem letzten Witz @param {boolean} nachFehler @param {Wort[]} woerter @param {() => number} [rnd]
 * @returns {"gaehnen" | "fast-umfallen" | null}
 */
export function witz(seitWitz, nachFehler, woerter, rnd = Math.random) {
  if (nachFehler || seitWitz < 5 || rnd() >= 0.6) return null;
  if (woerter.some((w) => w.art === "verb" && w.wort === "gähnt")) return "gaehnen";
  return woerter.length > 4 ? "fast-umfallen" : null;
}
