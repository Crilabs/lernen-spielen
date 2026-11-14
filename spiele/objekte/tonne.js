// Gemeinsamer Schnitt der Mülltonnen (240-Liter-Tonne auf zwei Rädern), von vorn und leicht von oben gesehen:
// Korpus nach unten schmaler, Deckel mit vorderer Lippe und Griff, hinten die Räder. Feld 200 breit, von y 58 bis 250 (geschlossene Tonne); der offene Deckel ragt nach oben heraus.
// Die Arten unterscheiden sich in Farbe, Aufkleber und Inhalt (papiertonne.js, wertstofftonne.js).
//
// Zustände: zu, offen, voll (Deckel liegt auf dem Inhalt, etwas angehoben). Bewegungen (grundsaetze-bilder §7, B1):
//   zu → offen      Deckel klappt nach hinten auf (0,6 s)
//   offen → zu      Deckel klappt zu
//   offen → voll    ein Ding fällt hinein, der Deckel klappt zu, die Tonne wackelt satt (etwa 1 s)
//   zu → voll       dasselbe mit Aufklappen davor, schneller
//   voll → offen    Deckel klappt auf, der Inhalt sinkt
//   Anstoß (wirf)   das geworfene Ding fällt hinein, die Tonne wackelt satt
// Klappen ohne 3D: Der geschlossene Deckel staucht sich zur Scharnierkante, dann wächst der offene Deckel (seine
// Unterseite im Schatten) von dort nach oben. Licht von oben links: Schatten unten rechts, Deckel oben hell.

import { form, flach, falte, naht, pfad, zusammen, heller, dunkler, z, INK } from "../runde/kinder/stil.js";
import { meldeObjekt, bild, verschiebe, esc } from "./objekt.js";
import { papierStueck } from "./papier.js";
import { doseStueck } from "./dose.js";

/** @typedef {import("../runde/kinder/stil.js").Stueck} Stueck */
/** @typedef {import("./objekt.js").Schritt} Schritt */

const RAD = "#5B5370";
const AUFKLEBER = "#FFFCF7";
/** Scharnier (Hinterkante oben) und Fußpunkt. */
const SCHARNIER = /** @type {[number, number]} */ ([100, 66]);
const FUSS = /** @type {[number, number]} */ ([100, 230]);
/** Dinge, die in jede Tonne fallen können (auch ein falsches muss sichtbar hineinfallen können). */
const DINGE = { papier: papierStueck, dose: doseStueck };

/** @param {Stueck} s */
const ohneKontur = (s) => ({ svg: s.svg, kontur: "" });

/** @param {string} farbe @returns {Stueck} */
function deckelZu(farbe) {
  return zusammen(
    form(pfad(`M46 66 L154 66 Q159 66 161 71 L167 95 Q168 102 161 102 L39 102 Q32 102 33 95 L39 71 Q41 66 46 66 Z`), farbe, [52, 72], { s: 0.93 }),
    { svg: `<path d="M50 68 L150 68 L156 88 L44 88 Z" fill="${heller(farbe, 0.3)}" stroke="none"/>`, kontur: "" },
    naht(`M35 93 L165 93`, farbe, 2),
    form(pfad(`M86 101 L114 101 L112 107 Q100 109 88 107 Z`), farbe, [90, 102], { s: 0.9 }),
  );
}

/** Schlagschatten der Deckellippe auf dem Korpus. @param {string} farbe */
const lippenSchatten = (farbe) => falte(`M39 102 L161 102 L160.5 109 Q100 113 39.5 109 Z`, farbe, 0.42);

/** @param {string} farbe @returns {Stueck} */
function deckelAuf(farbe) {
  const unten = dunkler(farbe, 0.2);
  return zusammen(
    form(pfad(`M46 66 L154 66 L149 10 Q148 4 141 4 L59 4 Q52 4 51 10 Z`), unten, [56, 14], { s: 0.94 }),
    naht(`M72 18 L70 60 M100 16 L100 62 M128 18 L130 60`, unten, 2.4),
    form(pfad(`M51.6 13 L148.4 13 L149 10 Q148 4 141 4 L59 4 Q52 4 51 10 Z`), farbe, [56, 6], { s: 0.9, kontur: false }),
  );
}

/** @param {string} farbe @returns {Stueck} */
function oeffnung(farbe) {
  return zusammen(
    // Rand der Tonne (Wandstärke, von oben im Licht), darin der dunkle Innenraum mit der Rückwand.
    flach(pfad(`M46 66 L154 66 L162 96 L38 96 Z`), heller(farbe, 0.18)),
    { svg: `<path d="M52 70 L148 70 L155 92 L45 92 Z" fill="${dunkler(farbe, 0.7)}" stroke="none"/>`
      + `<path d="M52 70 L148 70 L150.5 78 L49.5 78 Z" fill="${dunkler(farbe, 0.52)}" stroke="none"/>`, kontur: "" },
  );
}

/**
 * Korpus mit Rand, Rillen und Aufkleber (Zahl oder Buchstabe aus `wert`, sonst das Bildzeichen der Art).
 * @param {string} farbe @param {string} wert @param {string} zeichen SVG des Bildzeichens im Aufkleber (Mitte 100, 154)
 * @returns {Stueck}
 */
function korpus(farbe, wert, zeichen) {
  // Ziffern und Buchstaben möglichst groß (Regal), mit Rand auf dem Aufkleber (72 breit, Text höchstens 54); geschätzte
  // Breite in em: M und W breit, Leerzeichen schmal, sonst 0,62.
  const breite = [...wert].reduce((s, c) => s + (/[MWmw]/.test(c) ? 0.9 : c === " " ? 0.3 : 0.62), 0);
  const groesse = Math.min(56, Math.round(54 / Math.max(0.62, breite)));
  const text = wert
    ? `<text x="100" y="${z(154 + groesse * 0.35)}" font-size="${groesse}"`
      + ` text-anchor="middle" fill="${INK}" stroke="none">${esc(wert)}</text>`
    : zeichen;
  return zusammen(
    form(pfad(`M38 96 L162 96 L151 222 Q150 230 141 230 L59 230 Q50 230 49 222 Z`), farbe, [54, 110], { s: 0.9 }),
    { svg: `<path d="M38 96 L162 96 L161.4 103 L38.6 103 Z" fill="${heller(farbe, 0.22)}" stroke="none"/>`, kontur: "" },
    falte(`M38.6 103 L161.4 103 L161 108 Q100 111 39 108 Z`, farbe, 0.3),
    naht(`M58 116 L64 214 M142 116 L136 214`, farbe, 2.4),
    ohneKontur(form(pfad(`M76 118 L124 118 Q136 118 136 130 L136 178 Q136 190 124 190 L76 190 Q64 190 64 178 L64 130 Q64 118 76 118 Z`),
      AUFKLEBER, [72, 122], { s: 0.95, trenn: true })),
    { svg: text, kontur: "" },
  );
}

/** @returns {Stueck} */
function raeder() {
  /** @param {number} cx */
  const rad = (cx) => zusammen(
    form(`circle cx="${cx}" cy="226" r="15"`, RAD, [cx - 5, 220], { s: 0.86 }),
    flach(`circle cx="${cx}" cy="226" r="5.5"`, heller(RAD, 0.45)),
  );
  return zusammen(rad(47), rad(153));
}

/**
 * Meldet eine Tonne an.
 * @param {string} art
 * @param {{ farbe: string, ding: keyof typeof DINGE, zeichen: string, inhalt: () => Stueck }} o
 *   ding: was beim Wechsel offen → voll hineinfällt; zeichen: Bildzeichen im Aufkleber; inhalt: was bei voll
 *   unter dem Deckel herausschaut (zwischen y 56 und 100)
 */
export function meldeTonne(art, o) {
  const { farbe } = o;
  /** @param {string} zustand @param {{ wert: string }} w */
  const zeichne = (zustand, { wert }) => bild({
    breite: 200, oben: 58, hoehe: 192, ursprung: FUSS,
    teile: [
      { stueck: raeder() },
      { stueck: deckelAuf(farbe), teil: "deckel-auf", in: "offen", ursprung: SCHARNIER },
      { stueck: oeffnung(farbe) },
      ...Object.entries(DINGE).map(([name, f]) => ({
        stueck: verschiebe(f(), "translate(75 14) scale(0.5)"), teil: `einwurf-${name}`, in: "", eigen: true,
        ursprung: /** @type {[number, number]} */ ([100, 41]),
      })),
      { stueck: korpus(farbe, wert, o.zeichen) },
      { stueck: o.inhalt(), teil: "inhalt", in: "voll", ursprung: /** @type {[number, number]} */ ([100, 100]) },
      { stueck: zusammen(lippenSchatten(farbe), deckelZu(farbe)), teil: "deckel-zu", in: "zu", ursprung: SCHARNIER },
      { stueck: verschiebe(zusammen(lippenSchatten(farbe), deckelZu(farbe)), "translate(0 -10) rotate(-6 160 90)"),
        teil: "deckel-voll", in: "voll", ursprung: /** @type {[number, number]} */ ([100, 56]) },
    ],
  });

  /** Geschlossener Deckel staucht sich zum Scharnier, der offene wächst. @param {string} deckel @param {number} b @param {number} k */
  const auf = (deckel, b, k = 1) => /** @type {Schritt[]} */ ([
    { teil: deckel, beginn: b, dauer: 240 * k, easing: "ease-in",
      keyframes: [{ transform: "scaleY(1)", opacity: 1 }, { transform: "scaleY(0)", opacity: 1, offset: 0.99 }, { transform: "scaleY(0)", opacity: 0 }] },
    { teil: "deckel-auf", beginn: b + 240 * k, dauer: 360 * k, easing: "ease-out",
      keyframes: [{ transform: "scaleY(0)", opacity: 1 }, { transform: "scaleY(1.06)", opacity: 1, offset: 0.7 }, { transform: "scaleY(1)", opacity: 1 }] },
  ]);
  /** @param {string} deckel @param {number} b */
  const zu = (deckel, b) => /** @type {Schritt[]} */ ([
    { teil: "deckel-auf", beginn: b, dauer: 220, easing: "ease-in",
      keyframes: [{ transform: "scaleY(1)", opacity: 1 }, { transform: "scaleY(0)", opacity: 1, offset: 0.99 }, { transform: "scaleY(0)", opacity: 0 }] },
    { teil: deckel, beginn: b + 220, dauer: 200, easing: "ease-out",
      keyframes: [{ transform: "scaleY(0)", opacity: 1 }, { transform: "scaleY(1)", opacity: 1 }] },
  ]);
  /** @param {string} ding @param {number} b */
  const faellt = (ding, b) => /** @type {Schritt[]} */ ([
    { teil: `einwurf-${ding}`, beginn: b, dauer: 340, easing: "ease-in",
      keyframes: [{ transform: "translateY(-6px) rotate(0deg)", opacity: 1 },
        { transform: "translateY(86px) rotate(50deg)", opacity: 1, offset: 0.99 }, { transform: "translateY(86px)", opacity: 0 }] },
  ]);
  /** Wackelt satt: einmal gestaucht, gedehnt, kurz geneigt. @param {number} b */
  const satt = (b) => /** @type {Schritt[]} */ ([
    { teil: "ganz", beginn: b, dauer: 360, easing: "ease-out",
      keyframes: [{ transform: "none" }, { transform: "scale(1.04, 0.94)", offset: 0.25 },
        { transform: "scale(0.98, 1.03) rotate(-1.5deg)", offset: 0.55 }, { transform: "rotate(1deg)", offset: 0.8 }, { transform: "none" }] },
  ]);
  /** Inhalt steigt unter dem Deckel hoch (oder sinkt). @param {number} b @param {boolean} [weg] */
  const inhalt = (b, weg = false) => /** @type {Schritt[]} */ ([
    { teil: "inhalt", beginn: b, dauer: 220, easing: "ease-out",
      keyframes: weg ? [{ transform: "none", opacity: 1 }, { transform: "translateY(14px)", opacity: 0 }]
        : [{ transform: "translateY(14px)", opacity: 0 }, { transform: "none", opacity: 1 }] },
  ]);

  meldeObjekt(art, {
    zustaende: ["zu", "offen", "voll"],
    zeichne,
    einwurf: [100, 41, 31],
    bewegung(von, nach) {
      const weg = `${von}>${nach}`;
      if (weg === "zu>offen") return auf("deckel-zu", 0);
      if (weg === "offen>zu") return zu("deckel-zu", 0);
      if (weg === "offen>voll") return [...faellt(o.ding, 0), ...zu("deckel-voll", 300), ...inhalt(520), ...satt(700)];
      if (weg === "zu>voll") return [...auf("deckel-zu", 0, 0.5), ...faellt(o.ding, 270), ...zu("deckel-voll", 480), ...inhalt(700), ...satt(820)];
      if (weg === "voll>offen") return [...auf("deckel-voll", 0), ...inhalt(0, true)];
      return [];
    },
    anstoss(ding) {
      return [...(Object.hasOwn(DINGE, ding) ? faellt(ding, 0) : []), ...satt(260)];
    },
  });
}
