// Timos eigene Rollstuhl-Tricks (Spec lustige Bewegungen, „Timos eigene Rollstuhl-Tricks“).
// Vorbild ist echter Rollstuhl-Sport (WCMX, Rollstuhl-Basketball und -Tanz): Die Tricks zeigen Können.
// Der Stuhl bleibt immer unter Kontrolle und kippt nie um; der Rollstuhl ist nie die Pointe.
// Räder drehen sichtbar nur im Profil (runde Räder mit Speichen, 45°-symmetrisch: 360° springt unsichtbar auf 0°).
// Fahren nach vorn: Räder positiv, versatz x positiv. Wheelie: koerper negativ.

import { meldeBewegung } from "./bestand.js";

/** @typedef {import("./bestand.js").Schritt} Schritt */

/** Hände greifen oben hinten am Greifreifen (Ansatz zum Schieben). */
const GREIFEN = { "arm-vorn-oben": 71, "arm-vorn-unten": -85, "arm-hinten-oben": 71, "arm-hinten-unten": -85 };
/** Hände haben nach vorn geschoben. */
const GESCHOBEN = { "arm-vorn-oben": 6, "arm-vorn-unten": -42, "arm-hinten-oben": 6, "arm-hinten-unten": -42 };
/** Hände ruhen vorn oben auf dem Greifreifen. */
const RUHE = { rumpf: 0, kopf: 0, "arm-vorn-oben": 34, "arm-vorn-unten": -76, "arm-hinten-oben": 34, "arm-hinten-unten": -76 };
const FAUST = { vorn: "faust", hinten: "faust" };
/** @param {number} grad */
const rad = (grad) => ({ "rad-vorn": grad, "rad-hinten": grad });

/** @param {Partial<import("./bestand.js").Bewegung> & {id: string, schritte: Schritt[]}} b */
const trick = (b) => meldeBewegung({ ansicht: "profil", ende: "stehen", ...b, nur: "rollstuhl" });

// Wheelie: schiebt kurz an, kippt auf die Hinterräder, balanciert mit kleinen Korrekturen, setzt sanft auf.
/** @param {Schritt[]} oben @returns {Schritt[]} */
const wheelie = (oben) => [
  { ms: 200, winkel: GREIFEN, haende: FAUST, gesicht: "neugierig" },
  { ms: 260, kurve: "federn", winkel: { ...GESCHOBEN, koerper: -18, ...rad(40) } },
  ...oben,
  { ms: 380, kurve: "federn", winkel: { koerper: 0, ...RUHE, ...rad(0) }, gesicht: "freuen-klein" },
];
trick({
  id: "wheelie",
  schritte: wheelie([
    { ms: 300, winkel: { koerper: -13, "arm-vorn-oben": 22, "arm-hinten-oben": 22, ...rad(30) } },
    { ms: 300, winkel: { koerper: -20, "arm-vorn-oben": 0, "arm-hinten-oben": 0, ...rad(46) } },
    { ms: 300, winkel: { koerper: -16, "arm-vorn-oben": 12, "arm-hinten-oben": 12, ...rad(40) }, gesicht: "freuen-klein" },
  ]),
});
trick({
  id: "wheelie-freihaendig",
  schritte: wheelie([
    { ms: 280, winkel: { koerper: -15, ...rad(36) } },
    { ms: 160, kurve: "federn", haende: { vorn: "offen", hinten: "offen" }, gesicht: "freuen-gross", luft: { sterne: "kopf" },
      winkel: { "arm-vorn-oben": -160, "arm-vorn-unten": -14, "arm-hinten-oben": -112, "arm-hinten-unten": -10, koerper: -17 } },
    { ms: 420, luft: { sterne: "kopf" }, winkel: { koerper: -16 } },
    { ms: 200, haende: FAUST, winkel: { ...GESCHOBEN, koerper: -16 } },
  ]),
});

// Pirouette: eine Hand bremst, die andere schiebt, ein ganzer Dreh auf der Stelle (zwei Wenden).
trick({
  id: "pirouette", ansicht: "dreiviertel",
  schritte: [
    { ms: 200, haende: FAUST, gesicht: "freuen-klein", winkel: { "arm-vorn-oben": 60, "arm-vorn-unten": -80, "arm-hinten-oben": 10, "arm-hinten-unten": -50, rumpf: -4 } },
    { ms: 130, kurve: "gleich", streckung: [0.05, 1], luft: { striche: "hinten" } },
    { ms: 130, kurve: "gleich", wende: true, streckung: [1, 1], luft: { striche: "hinten" } },
    { ms: 130, kurve: "gleich", streckung: [0.05, 1], luft: { striche: "hinten" } },
    { ms: 260, kurve: "federn", wende: true, streckung: [1, 1], gesicht: "freuen-gross", winkel: { ...RUHE, rumpf: 3 } },
    { ms: 300, winkel: { rumpf: 0 } },
  ],
});

// Vollbremsung: saust von hinten herein, greift die Reifen, Oberkörper schwingt nach vorn, Staubwolke, steht.
/** @param {number} rutsch Länge der Rutschpartie @returns {Schritt[]} */
const herein = (rutsch) => [
  { ms: 1, versatz: [-320, 0], winkel: { ...GESCHOBEN, ...rad(0) } },
  { ms: 460, kurve: "gleich", versatz: [-rutsch, 0], winkel: { ...rad(315), rumpf: 10 }, luft: { striche: "hinten" }, gesicht: "freuen-klein" },
];
trick({
  id: "vollbremsung",
  schritte: [
    ...herein(40),
    { ms: 110, kurve: "ruck", haende: FAUST, winkel: { "arm-vorn-oben": 52, "arm-vorn-unten": -80, "arm-hinten-oben": 52, "arm-hinten-unten": -80 }, gesicht: "staunen" },
    { ms: 300, versatz: [0, 0], winkel: { ...rad(360), rumpf: 24, kopf: 12, koerper: 3 }, luft: { staub: "boden" } },
    { ms: 1, winkel: rad(0) },
    { ms: 420, kurve: "federn", winkel: { rumpf: -5, kopf: -4, koerper: 0 }, gesicht: "freuen-gross" },
    { ms: 300, winkel: RUHE },
  ],
});
trick({
  id: "hereinflitzen",
  schritte: [
    ...herein(20),
    { ms: 260, versatz: [0, 0], haende: FAUST, winkel: { ...rad(360), "arm-vorn-oben": 52, "arm-vorn-unten": -80, "arm-hinten-oben": 52, "arm-hinten-unten": -80, rumpf: 14, kopf: 6 } },
    { ms: 1, winkel: rad(0) },
    { ms: 380, kurve: "federn", winkel: RUHE, gesicht: "freuen-klein" },
  ],
});

// Bunny-Hop: Anlauf, kurzer Wheelie, der ganze Stuhl hüpft, federnde Landung.
trick({
  id: "bunny-hop",
  schritte: [
    { ms: 200, winkel: GREIFEN, haende: FAUST, gesicht: "neugierig" },
    { ms: 200, winkel: { ...GESCHOBEN, koerper: -10, ...rad(45) } },
    { ms: 240, versatz: [0, -48], winkel: { koerper: -4, rumpf: 8, kopf: 4 }, gesicht: "freuen-gross", luft: { striche: "boden" } },
    { ms: 160, kurve: "gleich", versatz: [0, 0], winkel: { koerper: 0 } },
    { ms: 110, kurve: "ruck", streckung: [1.12, 0.88], luft: { staub: "boden" }, winkel: { rumpf: 8 } },
    { ms: 160, streckung: [0.95, 1.05], winkel: { rumpf: 4, ...rad(0) } },
    { ms: 220, kurve: "federn", streckung: [1, 1], winkel: RUHE },
  ],
});

// Rückwärts lässig: rollt rückwärts aus, lehnt sich zurück, ein Arm hinter dem Kopf, rollt wieder vor.
trick({
  id: "rueckwaerts-laessig",
  schritte: [
    { ms: 200, winkel: GESCHOBEN, haende: FAUST },
    { ms: 700, versatz: [-70, 0], winkel: { ...rad(-180), rumpf: -10, kopf: -4, "arm-vorn-oben": -168, "arm-vorn-unten": -130 },
      haende: { vorn: "offen" }, gesicht: "freuen-klein", luft: { striche: "vorn" } },
    { ms: 500, winkel: { rumpf: -12, kopf: -6 } },
    { ms: 700, versatz: [0, 0], winkel: { ...rad(0), ...RUHE } },
  ],
});

// Trommeln: abwechselnd auf die Greifreifen, Kopf nickt im Takt, Noten; Schluss mit beiden Armen hoch.
/** @type {Schritt[]} */
const takt = [];
for (let i = 0; i < 8; i++) {
  const vorn = i % 2 === 0;
  takt.push({
    ms: 150, kurve: "ruck", haende: FAUST, luft: i % 4 === 0 ? { noten: "kopf" } : {}, gesicht: i < 2 ? "freuen-klein" : "freuen-gross",
    winkel: vorn
      ? { "arm-vorn-oben": 34, "arm-vorn-unten": -76, "arm-hinten-oben": 8, "arm-hinten-unten": -112, kopf: 5 }
      : { "arm-vorn-oben": 8, "arm-vorn-unten": -112, "arm-hinten-oben": 34, "arm-hinten-unten": -76, kopf: -2 },
  });
}
trick({
  id: "trommeln", ansicht: "dreiviertel",
  schritte: [
    ...takt,
    { ms: 320, kurve: "federn", haende: { vorn: "offen", hinten: "offen" }, luft: { noten: "kopf" }, gesicht: "freuen-gross",
      winkel: { "arm-vorn-oben": -146, "arm-vorn-unten": -16, "arm-hinten-oben": 146, "arm-hinten-unten": 16, kopf: -4 } },
    { ms: 400, winkel: RUHE },
  ],
});

// Ehrenrunde: rollt los, wendet, rollt zurück, wendet wieder, Arm hoch.
// Nach einer Wende rechnen Versatz und Räder in der neuen Blickrichtung (steuere.js kehrt den Versatz um).
trick({
  id: "ehrenrunde",
  schritte: [
    { ms: 200, winkel: GREIFEN, haende: FAUST, gesicht: "freuen-klein" },
    { ms: 520, versatz: [90, 0], winkel: { ...GESCHOBEN, ...rad(270), rumpf: 6 }, luft: { striche: "hinten" } },
    { ms: 130, kurve: "gleich", streckung: [0.06, 1] },
    { ms: 160, kurve: "federn", wende: true, versatz: [-90, 0], streckung: [1, 1], winkel: GREIFEN },
    { ms: 520, versatz: [0, 0], winkel: { ...GESCHOBEN, ...rad(540) }, luft: { striche: "hinten" } },
    { ms: 1, winkel: rad(0) },
    { ms: 130, kurve: "gleich", streckung: [0.06, 1] },
    { ms: 200, kurve: "federn", wende: true, streckung: [1, 1], gesicht: "freuen-gross", haende: { vorn: "offen" },
      winkel: { ...RUHE, "arm-vorn-oben": -150, "arm-vorn-unten": -16 } },
    { ms: 500, winkel: { "arm-vorn-oben": -146 } },
  ],
});

// Losflitzen: beugt sich vor, schiebt dreimal schnell, saust mit Strichen aus dem Bild (Ende-Haltung weg).
trick({
  id: "losflitzen", ende: "weg",
  schritte: [
    { ms: 260, winkel: { ...GREIFEN, rumpf: 14, kopf: 4 }, haende: FAUST, gesicht: "freuen-klein" },
    { ms: 180, versatz: [18, 0], winkel: { ...GESCHOBEN, ...rad(90) } },
    { ms: 110, winkel: GREIFEN },
    { ms: 160, versatz: [56, 0], winkel: { ...GESCHOBEN, ...rad(180) }, luft: { striche: "hinten" } },
    { ms: 100, winkel: GREIFEN },
    { ms: 140, versatz: [120, 0], winkel: { ...GESCHOBEN, ...rad(270) }, luft: { striche: "hinten" }, gesicht: "freuen-gross" },
    { ms: 320, kurve: "gleich", versatz: [460, 0], winkel: rad(540), luft: { striche: "hinten" } },
  ],
});

// Rolli-Tanz: wippt im Takt auf den Hinterrädern, halbe Drehungen hin und her, Noten.
/** @type {Schritt[]} */
const tanz = [];
for (let i = 0; i < 6; i++) {
  const auf = i % 2 === 0;
  tanz.push({
    ms: 240, luft: auf ? { noten: "kopf" } : {}, gesicht: "freuen-gross", streckung: [auf ? 0.62 : 1, 1],
    winkel: {
      koerper: auf ? -8 : 0, rumpf: auf ? 5 : -5, kopf: auf ? -5 : 5,
      "arm-vorn-oben": auf ? -140 : 10, "arm-vorn-unten": auf ? -30 : -60, "arm-hinten-oben": auf ? 20 : 140, "arm-hinten-unten": auf ? -40 : 30,
    },
  });
}
trick({ id: "rolli-tanz", ansicht: "dreiviertel", ende: "freuen-gross", schritte: [...tanz, { ms: 300, kurve: "federn", streckung: [1, 1], winkel: { koerper: 0 } }] });
