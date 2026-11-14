// <ls-objekt art="waeschestapel">: ein Stapel frisch gefalteter Wäsche, leicht von vorn gesehen. Unten ein großes
// Handtuch (Wasserblau mit Streifen), darauf eine gefaltete Hose (Petrol-Jeans), oben ein Pulli (Koralle) mit
// Bündchen. Feld 0…100, die Stücke liegen leicht versetzt, damit man drei Teile erkennt. Keine Schrift, keine Ziffer.

import { form, flach, naht, falte, pfad, zusammen, heller, dunkler } from "../runde/kinder/stil.js";
import { meldeObjekt, bild } from "./objekt.js";

export const HANDTUCH = "#8FD3EE";
export const HOSE = "#4F8FB3";
export const PULLI = "#FF9F8A";

/** Ein gefaltetes Stück als Polster mit runden Kanten: links x, oben y, Breite b, Höhe h. */
function polster(/** @type {number} */ x, /** @type {number} */ y, /** @type {number} */ b, /** @type {number} */ h) {
  const r = h * 0.42;
  return pfad(`M${x + r} ${y} Q${x + b / 2} ${y - 3} ${x + b - r} ${y} Q${x + b + 1} ${y} ${x + b} ${y + r}`
    + ` L${x + b} ${y + h - r} Q${x + b} ${y + h} ${x + b - r} ${y + h} L${x + r} ${y + h}`
    + ` Q${x} ${y + h} ${x} ${y + h - r} L${x} ${y + r} Q${x - 1} ${y} ${x + r} ${y} Z`);
}

/** Unten: großes Handtuch, zweimal gefaltet, mit zwei Webstreifen. */
function handtuch() {
  const tuch = form(polster(6, 66, 88, 24), HANDTUCH, [14, 68], { s: 0.9 });
  const streifen = flach(pfad("M70 67 L76 67 L76 89 L70 89 Z"), dunkler(HANDTUCH, 0.18));
  const streifen2 = flach(pfad("M79 67 L81.5 67 L81.5 89 L79 89 Z"), dunkler(HANDTUCH, 0.18));
  const knick = naht("M10 78 Q50 80.5 90 78", HANDTUCH, 1.6);
  return zusammen(tuch, streifen, streifen2, knick);
}

/** Mitte: gefaltete Hose, die Beine übereinander, Saum vorn rechts. */
function hose() {
  const stoff = form(polster(14, 46, 70, 21), HOSE, [20, 48], { s: 0.9 });
  const bein = falte("M60 47 L80 47 Q83.5 47 83.5 52 L83.5 61 Q83.5 66 80 66 L60 66 Z", HOSE, 0.18);
  const naehte = naht("M60 48 L60 65 M18 56.5 L56 56.5", HOSE, 1.6);
  const saum = naht("M77 48 L77 65", heller(HOSE, 0.3), 1.4);
  return zusammen(stoff, bein, naehte, saum);
}

/** Oben: gefalteter Pulli mit Halsausschnitt, eingeschlagenen Ärmeln (zwei Kanten) und Bündchen. */
function pulli() {
  const stoff = form(polster(22, 24, 58, 23), PULLI, [28, 26], { s: 0.9 });
  const buendchen = flach(pfad("M24 40 L78 40 L78 43 Q78 46.5 74 46.5 L28 46.5 Q24 46.5 24 43 Z"), dunkler(PULLI, 0.14));
  const rippen = naht("M32 41 L32 46 M40 41 L40 46 M48 41 L48 46 M56 41 L56 46 M64 41 L64 46 M72 41 L72 46", PULLI, 1.2);
  const kragen = falte("M40 24 Q51 33 62 24 Q51 28 40 24 Z", PULLI, 0.3);
  const kanten = naht("M33 26 L33 39 M69 26 L69 39", PULLI, 1.5);
  return zusammen(stoff, kragen, kanten, buendchen, rippen);
}

/** Der Stapel als Stück im Feld 0…100. @returns {import("../runde/kinder/stil.js").Stueck} */
export function waeschestapelStueck() {
  return zusammen(handtuch(), hose(), pulli());
}

meldeObjekt("waeschestapel", {
  zustaende: ["gefaltet"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: waeschestapelStueck() }], ursprung: [50, 90] }),
});
