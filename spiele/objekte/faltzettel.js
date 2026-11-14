// <ls-objekt art="faltzettel">: ein aufgeklapptes Blatt Papier, dreimal in der Mitte gefaltet (2 mal 4 Felder).
// Ein Feld oben rechts ist schon an den Falzen abgerissen und liegt schräg daneben (der typische Moment:
// Merkzettel abreißen). Feld 0…100, das Blatt hochkant und leicht gedreht. Falze als feine Linien im dunklen Ton
// der Fläche, die Felder abwechselnd wie Berg und Tal leicht schattiert (figuren.md §4). Keine Schrift, keine Ziffer.

import { form, falte, naht, pfad, zusammen, z } from "../runde/kinder/stil.js";
import { meldeObjekt, bild } from "./objekt.js";

export const BLATT = "#FBF6EA";

const B = 28; // halbe Breite des Blatts
const H = 39; // halbe Höhe des Blatts (Hochformat, etwa wie A4)
const ZEILE = H / 2; // Höhe eines Felds

/**
 * Punkte drehen (Grad) und verschieben.
 * @param {[number, number][]} punkte @param {number} winkel @param {[number, number]} mitte @returns {[number, number][]}
 */
function setze(punkte, winkel, mitte) {
  const a = (winkel * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return punkte.map(([x, y]) => [mitte[0] + x * c - y * s, mitte[1] + x * s + y * c]);
}

/** @param {[number, number][]} punkte @param {boolean} [zu] */
const linie = (punkte, zu = true) => "M" + punkte.map(([x, y]) => `${z(x)} ${z(y)}`).join(" L") + (zu ? " Z" : "");

/**
 * Gerissene Kante von a nach b: kleine, unregelmäßige Zacken quer zur Richtung.
 * @param {[number, number]} a @param {[number, number]} b @param {number[]} ausschlag @returns {[number, number][]}
 */
function riss(a, b, ausschlag) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l = Math.hypot(dx, dy);
  const nx = -dy / l;
  const ny = dx / l;
  const n = ausschlag.length + 1;
  /** @type {[number, number][]} */
  const punkte = [];
  for (let i = 1; i < n; i++) {
    const t = i / n;
    punkte.push([a[0] + dx * t + nx * ausschlag[i - 1], a[1] + dy * t + ny * ausschlag[i - 1]]);
  }
  return punkte;
}

const RISS_SENKRECHT = [0.9, -0.6, 0.7, -0.9, 0.5, -0.7, 0.8];
const RISS_WAAGRECHT = [-0.8, 0.6, -0.9, 0.7, -0.5, 0.9, -0.7, 0.6];

/** Das Blatt mit Lücke oben rechts als Stück. @returns {import("../runde/kinder/stil.js").Stueck} */
function blatt() {
  const W = -7;
  const M = /** @type {[number, number]} */ ([40, 54]);
  /** @type {[number, number][]} */
  const umriss = [
    [-B, -H], [0, -H],
    ...riss([0, -H], [0, -ZEILE], RISS_SENKRECHT), [0, -ZEILE],
    ...riss([0, -ZEILE], [B, -ZEILE], RISS_WAAGRECHT), [B, -ZEILE],
    [B, H], [-B, H],
  ];
  const flaeche = form(pfad(linie(setze(umriss, W, M))), BLATT, setze([[-B + 6, -H + 6]], W, M)[0], { s: 0.94 });
  // Berg und Tal: die rechte Spalte und jede zweite Zeile liegen leicht im Schatten.
  const schatten = [
    falte(linie(setze([[0, -ZEILE + 1], [B - 2, -ZEILE + 1], [B - 2, 0], [0, 0]], W, M)), BLATT, 0.07),
    falte(linie(setze([[-B + 1.5, 0], [0, 0], [0, ZEILE], [-B + 1.5, ZEILE]], W, M)), BLATT, 0.06),
    falte(linie(setze([[0, ZEILE], [B - 2, ZEILE], [B - 2, H - 2.5], [0, H - 2.5]], W, M)), BLATT, 0.07),
    falte(linie(setze([[-B + 1.5, -H + 1.5], [0, -H + 1.5], [0, -ZEILE], [-B + 1.5, -ZEILE]], W, M)), BLATT, 0.05),
  ];
  const falze = naht([
    linie(setze([[0, -ZEILE], [0, H - 1]], W, M), false),
    linie(setze([[-B + 1, -ZEILE], [0, -ZEILE]], W, M), false),
    linie(setze([[-B + 1, 0], [B - 1, 0]], W, M), false),
    linie(setze([[-B + 1, ZEILE], [B - 1, ZEILE]], W, M), false),
  ].join(" "), BLATT, 1.3);
  return zusammen(flaeche, ...schatten, falze);
}

/** Der abgerissene Zettel, schräg rechts oben. @returns {import("../runde/kinder/stil.js").Stueck} */
function zettel() {
  const W = 11;
  const M = /** @type {[number, number]} */ ([78, 17]);
  const b = B / 2;
  const h = ZEILE / 2;
  // gerissen sind die linke und die untere Kante (dort hing er am Blatt)
  /** @type {[number, number][]} */
  const umriss = [
    [-b, -h], [b, -h], [b, h],
    ...riss([b, h], [-b, h], RISS_WAAGRECHT.map((v) => -v)), [-b, h],
    ...riss([-b, h], [-b, -h], RISS_SENKRECHT.map((v) => -v)),
  ];
  return form(pfad(linie(setze(umriss, W, M))), BLATT, setze([[-b + 4, -h + 4]], W, M)[0], { s: 0.92 });
}

/** Blatt und Zettel als Stück im Feld 0…100. @returns {import("../runde/kinder/stil.js").Stueck} */
export function faltzettelStueck() {
  return zusammen(blatt(), zettel());
}

meldeObjekt("faltzettel", {
  zustaende: ["abgerissen"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: faltzettelStueck() }], ursprung: [44, 94] }),
});
