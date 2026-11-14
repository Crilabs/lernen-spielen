// Alberne Bewegungen für alle vier Kinder (Spec docs/superpowers/specs/2026-11-14-lustige-bewegungen-design.md).
// Die Kinder sind über sich selbst albern, niemand wird ausgelacht, niemand fällt hin oder tut sich weh.
// Timo macht jede Bewegung im Rollstuhl mit; wo die anderen springen oder die Beine bewegen, zeigt er Können
// (Wheelie, federnder Stuhl), nie ist der Rollstuhl die Pointe.
// Winkel: negativ hebt den vorderen Arm nach vorn und oben, positiv den hinteren; koerper negativ kippt nach hinten.

import { meldeBewegung, meldeHaltung } from "./bestand.js";

/** @typedef {import("./bestand.js").Schritt} Schritt */

/** Alle Gelenke oberhalb der Hüfte in Ruhe (Schritte ohne Haltung bauen auf dem vorigen Schritt auf). */
const RUHE = { rumpf: 0, kopf: 0, "arm-vorn-oben": -6, "arm-vorn-unten": 0, "arm-hinten-oben": 6, "arm-hinten-unten": 0 };
const BEINE_RUHE = { "bein-vorn": 0, "bein-vorn-unten": 0, "bein-hinten": 0, "bein-hinten-unten": 0 };
/** Timo: Hände ruhen vorn oben auf dem Greifreifen (wie Haltung stehen). */
const STUHL_RUHE = { rumpf: 0, kopf: 0, "arm-vorn-oben": 34, "arm-vorn-unten": -76, "arm-hinten-oben": 34, "arm-hinten-unten": -76 };
const ARME_HOCH = { "arm-vorn-oben": -150, "arm-vorn-unten": -18, "arm-hinten-oben": 150, "arm-hinten-unten": 18 };


// Niesen: dreimal Anlauf, jedes Mal weiter zurück, dann Hatschi mit Ruck nach vorn.
/** @param {number} g Größe (Riesen-Hatschi) @returns {Schritt[]} */
const nieser = (g = 1) => [
  { ms: 260, groesse: g, gesicht: "nies-anlauf", winkel: { kopf: -8, rumpf: -3, "arm-vorn-oben": -14, "arm-vorn-unten": -40 }, streckung: [0.98, 1.03] },
  { ms: 180, winkel: { kopf: -3, rumpf: -1 }, streckung: [1, 1] },
  { ms: 260, winkel: { kopf: -12, rumpf: -5 }, streckung: [0.97, 1.05] },
  { ms: 160, winkel: { kopf: -5, rumpf: -2 }, streckung: [1, 1] },
  { ms: 340, winkel: { kopf: -17, rumpf: -8, "arm-hinten-oben": 26 }, streckung: [0.96, 1.08] },
];
/** @param {number} g @returns {Schritt} */
const hatschi = (g = 1) => ({
  ms: 120, kurve: "ruck", groesse: g, gesicht: "hatschi", luft: { pusten: "mund" },
  winkel: { kopf: 16, rumpf: 9, "arm-vorn-oben": -40, "arm-vorn-unten": -70, "arm-hinten-oben": -10 },
  streckung: [1.08, 0.92], versatz: [0, 3],
});

meldeBewegung({
  id: "niesen", ansicht: "dreiviertel", ende: "freuen-klein",
  schritte: [...nieser(), hatschi(), { ms: 320, luft: { pusten: "mund" }, winkel: { kopf: 11, rumpf: 6 }, streckung: [1.02, 0.98] },
    { ms: 420, kurve: "federn", gesicht: "freuen-klein", winkel: RUHE, streckung: [1, 1], versatz: [0, 0] }],
  rollstuhl: {
    // Beim Hatschi rollt der Stuhl ein Stück zurück.
    schritte: [...nieser(), { ...hatschi(), versatz: [-14, 0] }, { ms: 320, luft: { pusten: "mund" }, winkel: { kopf: 11, rumpf: 6 }, streckung: [1.02, 0.98] },
      { ms: 420, kurve: "federn", gesicht: "freuen-klein", winkel: STUHL_RUHE, streckung: [1, 1], versatz: [0, 0] }],
  },
});

meldeBewegung({
  id: "riesen-hatschi", ansicht: "dreiviertel", ende: "freuen-klein",
  // Wächst, niest als Riese, das Hatschi lässt wieder auf normale Größe schrumpfen.
  schritte: [{ ms: 700, groesse: 1.6, kurve: "federn", gesicht: "staunen" }, ...nieser(1.6), hatschi(1.6),
    { ms: 600, groesse: 1, kurve: "federn", luft: { pusten: "mund", sterne: "kopf" }, gesicht: "freuen-gross", winkel: RUHE, streckung: [1, 1], versatz: [0, 0] }],
});

// Doppelblick: dreht sich weg, schaut gelangweilt, reißt sich zurück und staunt (zwei Wenden).
meldeBewegung({
  id: "doppelblick", ansicht: "dreiviertel", ende: "staunen",
  schritte: [
    { ms: 110, streckung: [0.06, 1] },
    { ms: 130, wende: true, streckung: [1, 1], kurve: "federn" },
    { ms: 420, winkel: { kopf: 5 } },
    { ms: 70, streckung: [0.06, 1.02], kurve: "gleich", luft: { striche: "hinten" } },
    { ms: 160, wende: true, kurve: "federn", streckung: [0.96, 1.1], versatz: [0, -8], gesicht: "staunen",
      winkel: { kopf: -6, "arm-vorn-oben": -32, "arm-vorn-unten": -26, "arm-hinten-oben": 32, "arm-hinten-unten": 26 } },
    { ms: 400, streckung: [1, 1], versatz: [0, 0] },
  ],
});

// Freudentanz: Hüfte wackelt, Arme kreisen gegengleich, Noten.
/** @param {number} s Seite ±1 @param {Record<string, number>} extra @returns {Schritt} */
const tanzschritt = (s, extra = {}) => ({
  ms: 230, gesicht: "freuen-gross", luft: { noten: "kopf" }, versatz: [0, s > 0 ? -6 : 0],
  winkel: {
    rumpf: 8 * s, kopf: -6 * s,
    "arm-vorn-oben": s > 0 ? -145 : -40, "arm-vorn-unten": s > 0 ? -30 : -70,
    "arm-hinten-oben": s > 0 ? 40 : 145, "arm-hinten-unten": s > 0 ? 70 : 30, ...extra,
  },
});
meldeBewegung({
  id: "freudentanz", ansicht: "dreiviertel", ende: "freuen-gross", mal: 2,
  schritte: [tanzschritt(1), tanzschritt(-1)],
  rollstuhl: { schritte: [tanzschritt(1, { koerper: -6 }), tanzschritt(-1, { koerper: 0 })] },
});

// Hampelmann: zweimal auf und zu, beim dritten Mal zu viel Schwung, Wackelpudding-Landung.
const AUF = { "bein-vorn": -18, "bein-hinten": 18, "arm-vorn-oben": -155, "arm-vorn-unten": -10, "arm-hinten-oben": 155, "arm-hinten-unten": 10 };
const ZU = { ...BEINE_RUHE, ...RUHE };
/** @param {Schritt[]} landung @returns {Schritt[]} */
const hampel = (landung) => [
  { ms: 200, winkel: AUF, versatz: [0, -22], gesicht: "freuen-klein" }, { ms: 200, winkel: ZU, versatz: [0, 0] },
  { ms: 200, winkel: AUF, versatz: [0, -22] }, { ms: 200, winkel: ZU, versatz: [0, 0] },
  { ms: 300, winkel: AUF, versatz: [0, -78], kurve: "federn", gesicht: "staunen" },
  ...landung,
];
const wackelLandung = /** @type {Schritt[]} */ ([
  { ms: 180, winkel: ZU, versatz: [0, 0], kurve: "gleich", streckung: [0.92, 1.08] },
  { ms: 110, kurve: "ruck", streckung: [1.2, 0.82], luft: { staub: "boden" }, gesicht: "freuen-gross" },
  { ms: 150, streckung: [0.9, 1.1] }, { ms: 140, streckung: [1.06, 0.95] }, { ms: 160, streckung: [1, 1], kurve: "federn" },
]);
meldeBewegung({
  id: "hampelmann", ansicht: "dreiviertel", ende: "freuen-gross",
  schritte: hampel(wackelLandung),
  rollstuhl: {
    // Arme wie ein Hampelmann, beim dritten Mal ein Wheelie, der Stuhl federt beim Aufsetzen.
    schritte: [
      { ms: 200, winkel: { ...AUF, koerper: 0 }, gesicht: "freuen-klein" }, { ms: 200, winkel: STUHL_RUHE },
      { ms: 200, winkel: AUF }, { ms: 200, winkel: STUHL_RUHE },
      { ms: 320, winkel: { ...AUF, koerper: -16 }, kurve: "federn", gesicht: "staunen" },
      { ms: 200, winkel: { ...STUHL_RUHE, koerper: 0 }, kurve: "gleich" },
      { ms: 110, kurve: "ruck", streckung: [1.12, 0.88], luft: { staub: "boden" }, gesicht: "freuen-gross" },
      { ms: 160, streckung: [0.96, 1.04] }, { ms: 160, streckung: [1, 1], kurve: "federn" },
    ],
  },
});

// Wackelpudding: Hüpfer, breit gestaucht landen, lang federn, auspendeln.
meldeBewegung({
  id: "wackelpudding", ansicht: "dreiviertel", ende: "freuen-klein",
  schritte: [
    { ms: 160, streckung: [1.1, 0.9], gesicht: "freuen-klein" },
    { ms: 230, streckung: [0.9, 1.12], versatz: [0, -52], winkel: ARME_HOCH },
    { ms: 170, versatz: [0, 0], kurve: "gleich", winkel: RUHE },
    ...wackelLandung.slice(1),
  ],
  rollstuhl: {
    schritte: [
      { ms: 160, streckung: [1.06, 0.94], gesicht: "freuen-klein" },
      { ms: 240, winkel: { koerper: -12, ...ARME_HOCH } },
      { ms: 170, winkel: { koerper: 0, ...STUHL_RUHE }, kurve: "gleich" },
      { ms: 110, kurve: "ruck", streckung: [1.14, 0.86], luft: { staub: "boden" }, gesicht: "freuen-gross" },
      { ms: 150, streckung: [0.94, 1.06] }, { ms: 140, streckung: [1.03, 0.97] }, { ms: 160, streckung: [1, 1], kurve: "federn" },
    ],
  },
});

// Grimasse: Zunge raus, Kopf wackelt, Backen aufblasen, Pfff.
/** @param {Record<string, number>} arme @returns {Schritt[]} */
const grimasse = (arme) => [
  { ms: 200, gesicht: "zunge", winkel: { kopf: 7, ...arme } }, { ms: 160, winkel: { kopf: -7 } },
  { ms: 160, winkel: { kopf: 7 } }, { ms: 160, winkel: { kopf: -4 } },
  { ms: 360, gesicht: "backen", winkel: { kopf: -2 }, streckung: [1.03, 0.98] },
  { ms: 220, gesicht: "kichern", kurve: "ruck", luft: { pusten: "mund" }, winkel: { kopf: 6 }, streckung: [0.98, 1.02] },
  { ms: 300, luft: { pusten: "mund" }, winkel: { kopf: 0 }, streckung: [1, 1] },
];
meldeBewegung({
  id: "grimasse", ansicht: "dreiviertel", ende: "freuen-klein",
  schritte: grimasse({ "arm-vorn-oben": -6, "arm-hinten-oben": 6 }),
});

// Kicheranfall: Hand vor dem Bauch, die andere in die Seite gestützt, kleine schnelle Schüttler.
/** @param {Record<string, number>} hand @returns {Schritt[]} */
const kichern = (hand) => {
  /** @type {Schritt[]} */
  const s = [{ ms: 300, gesicht: "kichern", haende: { vorn: "faust" }, winkel: { ...hand, kopf: 6, rumpf: 3 } }];
  for (let i = 0; i < 8; i++) s.push({ ms: 90, winkel: { rumpf: i % 2 ? 3 : -2, kopf: i % 2 ? 8 : 2 }, versatz: [0, i % 2 ? 0 : -3] });
  s.push({ ms: 300, winkel: { rumpf: 0, kopf: 0 }, versatz: [0, 0] });
  return s;
};
meldeBewegung({
  id: "kichern", ansicht: "dreiviertel", ende: "freuen-klein",
  schritte: kichern({ "arm-vorn-oben": 24, "arm-vorn-unten": 96, "arm-hinten-oben": 26, "arm-hinten-unten": -92 }),
  rollstuhl: { schritte: kichern({ "arm-vorn-oben": 24, "arm-vorn-unten": 96, "arm-hinten-oben": 34, "arm-hinten-unten": -76 }) },
});

// Muskelprotz: Superheldenpose, Brust raus, Arm angewinkelt, Kinn hoch, Sternchen.
meldeBewegung({
  id: "muskeln", ansicht: "dreiviertel", ende: "stehen",
  schritte: [
    { ms: 320, gesicht: "freuen-klein", haende: { vorn: "faust", hinten: "faust" }, streckung: [1.04, 1.05],
      winkel: { "arm-vorn-oben": -58, "arm-vorn-unten": -100, "arm-hinten-oben": 28, "arm-hinten-unten": -104, kopf: -8, rumpf: -2 } },
    { ms: 140, kurve: "ruck", luft: { sterne: "kopf" }, gesicht: "freuen-gross", winkel: { "arm-vorn-oben": -62, "arm-vorn-unten": -122 }, streckung: [1.06, 1.07] },
    { ms: 520, luft: { sterne: "kopf" }, winkel: { "arm-vorn-unten": -114 } },
  ],
});

// Roboter: zackige Winkel ohne Überblenden, ernstes Gesicht, am Ende lacht er doch.
/** @param {Record<string, number>} w @returns {Schritt} */
const zack = (w) => ({ ms: 260, kurve: "ruck", winkel: w });
meldeBewegung({
  id: "roboter", ansicht: "dreiviertel", ende: "freuen-klein",
  schritte: [
    { ...zack({ "arm-vorn-oben": -45, "arm-vorn-unten": -90, "arm-hinten-oben": 6, "arm-hinten-unten": 0 }), gesicht: "roboter" },
    zack({ kopf: 10 }),
    zack({ "arm-vorn-oben": -6, "arm-vorn-unten": 0, "arm-hinten-oben": 45, "arm-hinten-unten": 90, kopf: 0 }),
    zack({ rumpf: -8, kopf: -10 }),
    zack({ "arm-vorn-oben": -45, "arm-vorn-unten": -90, rumpf: 0, kopf: 0 }),
    { ms: 400, gesicht: "freuen-gross", winkel: RUHE },
  ],
});

// Fast umgefallen: Fuß hakt, kippt nach vorn, rudert wild, fängt sich, grinst (Christian: fängt sich immer).
const RUDERN_A = { "arm-vorn-oben": -160, "arm-vorn-unten": -30, "arm-hinten-oben": -40, "arm-hinten-unten": -40 };
const RUDERN_B = { "arm-vorn-oben": -40, "arm-vorn-unten": -40, "arm-hinten-oben": -165, "arm-hinten-unten": -20 };
meldeBewegung({
  id: "fast-umfallen", ansicht: "profil", ende: "stehen",
  schritte: [
    { ms: 170, winkel: { koerper: 10, "bein-hinten": 26, "bein-hinten-unten": 40, "bein-vorn": -6, "arm-vorn-oben": -50, "arm-hinten-oben": -30 }, gesicht: "staunen" },
    { ms: 160, winkel: { koerper: 21, ...RUDERN_A }, luft: { striche: "hinten" } },
    { ms: 150, winkel: { koerper: 17, ...RUDERN_B } },
    { ms: 150, winkel: { koerper: 23, ...RUDERN_A } },
    { ms: 150, winkel: { koerper: 15, ...RUDERN_B } },
    { ms: 320, kurve: "federn", winkel: { koerper: -3, ...BEINE_RUHE, ...RUHE, "arm-vorn-oben": -20, "arm-hinten-oben": 20 } },
    { ms: 320, winkel: { koerper: 0 }, gesicht: "freuen-klein" },
  ],
  rollstuhl: {
    // Wheelie ein Stück zu weit nach hinten, rudert, setzt sicher auf.
    schritte: [
      { ms: 200, winkel: { koerper: -16, "arm-vorn-oben": 6, "arm-vorn-unten": -42, "arm-hinten-oben": 6, "arm-hinten-unten": -42 }, gesicht: "freuen-klein" },
      { ms: 160, winkel: { koerper: -24, ...RUDERN_A }, gesicht: "staunen", luft: { striche: "vorn" } },
      { ms: 150, winkel: { koerper: -20, ...RUDERN_B } },
      { ms: 150, winkel: { koerper: -25, ...RUDERN_A } },
      { ms: 340, kurve: "federn", winkel: { koerper: 0, ...STUHL_RUHE } },
      { ms: 300, gesicht: "freuen-klein" },
    ],
  },
});

// Umdrehen: Sprung mit Dreh in die andere Richtung, federnde Landung. Timo: Pirouette mit dem Stuhl.
meldeBewegung({
  id: "umdrehen", ansicht: "dreiviertel", ende: "stehen",
  schritte: [
    { ms: 120, streckung: [0.62, 1.04], versatz: [0, -12], gesicht: "freuen-klein" },
    { ms: 90, streckung: [0.05, 1.06], versatz: [0, -24], luft: { striche: "hinten" }, kurve: "gleich" },
    { ms: 110, wende: true, streckung: [0.62, 1.04], versatz: [0, -12], luft: { striche: "hinten" }, kurve: "gleich" },
    { ms: 160, streckung: [1.12, 0.9], versatz: [0, 0], luft: { staub: "boden" } },
    { ms: 200, streckung: [1, 1], kurve: "federn" },
  ],
  rollstuhl: {
    schritte: [
      { ms: 160, gesicht: "freuen-klein", haende: { vorn: "faust", hinten: "faust" } },
      { ms: 120, streckung: [0.05, 1], luft: { striche: "hinten" }, kurve: "gleich" },
      { ms: 160, wende: true, streckung: [1, 1], kurve: "federn" },
    ],
  },
});

// Purzelbaum: runter in die Hocke, zur Kugel einrollen (Kopf auf die Brust, Knie an den Bauch, Arme um die Beine),
// über den Rücken nach vorn rollen, aufrollen, aufstehen mit „Ta-da“, in zwei Hüpfern zurück an den Platz.
// Die Kugel rollt um einen festen Punkt im Körper; ROLLE nennt je 10° den Versatz [x, y], gemessen im Browser an
// Ela, Kofi und Lena: tiefster Punkt der Umrisse auf dem Boden für das Kind, das am meisten Platz braucht, die
// Hubkurve geglättet (nie unter dem Messwert), auch zwischen zwei Stützstellen sinkt nichts ein. Weg nach vorn: 120.
// Kurze Schritte (18 ms) laufen flüssig, weil steuere.js sie auf einer durchgehenden Zeitachse abspielt.
// Am Ende der Rolle ein 1-ms-Schritt von 360° auf 0°, sonst dreht der Übergang rückwärts.
const HOCKE = {
  "bein-vorn": -95, "bein-vorn-unten": 150, "bein-hinten": -88, "bein-hinten-unten": 146, rumpf: 40, kopf: 30,
  "arm-vorn-oben": -80, "arm-vorn-unten": -30, "arm-hinten-oben": -70, "arm-hinten-unten": -30,
};
const KUGEL = {
  ...HOCKE, "bein-vorn": -105, "bein-hinten": -100, rumpf: 78, kopf: 62,
  "arm-vorn-oben": -105, "arm-vorn-unten": -70, "arm-hinten-oben": -95, "arm-hinten-unten": -70,
};
/** Hocke: Hüfte so weit unten, dass die Füße auf dem Boden bleiben. */
const HOCKE_TIEF = 22;
/** [Grad, x, y] */
const ROLLE = /** @type {[number, number, number][]} */ ([
  [0, 0, -22], [10, -4, -36], [20, -5, -52], [30, -3, -69], [40, 1, -89], [50, 9, -113], [60, 19, -134], [70, 31, -151],
  [80, 45, -164], [90, 62, -173], [100, 80, -180], [110, 98, -182], [120, 118, -180], [130, 137, -179], [140, 156, -182],
  [150, 174, -183], [160, 191, -178], [170, 206, -169], [180, 218, -156], [190, 229, -141], [200, 237, -123],
  [210, 242, -103], [220, 244, -85], [230, 243, -71], [240, 240, -57], [250, 234, -44], [260, 226, -32], [270, 217, -20],
  [280, 205, -9], [290, 193, 1], [300, 181, 8], [310, 168, 15], [320, 156, 21], [330, 144, 19], [340, 134, 9],
  [350, 126, -5], [360, 120, -19],
]);
const WEG = 120;
const TADA = { ...BEINE_RUHE, rumpf: -4, kopf: -8, "arm-vorn-oben": -118, "arm-vorn-unten": -20, "arm-hinten-oben": -132, "arm-hinten-unten": -16 };
const PROFIL_RUHE = { ...BEINE_RUHE, ...RUHE };
meldeBewegung({
  id: "purzelbaum", ansicht: "profil", ende: "stehen",
  schritte: [
    { ms: 220, winkel: HOCKE, versatz: [0, HOCKE_TIEF], gesicht: "freuen-klein" },
    { ms: 150, winkel: { ...KUGEL, koerper: 0 }, versatz: [ROLLE[0][1], ROLLE[0][2]], gesicht: "kichern" },
    ...ROLLE.slice(1).map(([g, x, y]) => /** @type {Schritt} */ ({ ms: 18, kurve: "gleich", winkel: { koerper: g }, versatz: [x, y] })),
    { ms: 1, winkel: { koerper: 0 } },
    { ms: 180, kurve: "federn", winkel: HOCKE, versatz: [WEG, HOCKE_TIEF], luft: { staub: "boden" } },
    { ms: 240, kurve: "federn", winkel: TADA, versatz: [WEG, 0], gesicht: "freuen-gross", luft: { sterne: "kopf" } },
    { ms: 260, luft: { sterne: "kopf" } },
    // zurück an den Platz: zwei kleine Hüpfer rückwärts
    { ms: 120, winkel: { ...PROFIL_RUHE, "bein-vorn": -10, "bein-hinten": 8 }, versatz: [WEG * 0.75, -16], gesicht: "freuen-klein" },
    { ms: 90, winkel: BEINE_RUHE, versatz: [WEG * 0.5, 0] },
    { ms: 120, winkel: { "bein-vorn": -10, "bein-hinten": 8 }, versatz: [WEG * 0.25, -16] },
    { ms: 90, winkel: BEINE_RUHE, versatz: [0, 0] },
  ],
  rollstuhl: {
    // Wheelie-Kreisel: auf den Hinterrädern hin und her.
    schritte: [
      { ms: 220, winkel: { koerper: -14, "arm-vorn-oben": 6, "arm-vorn-unten": -42, "arm-hinten-oben": 6, "arm-hinten-unten": -42 }, gesicht: "freuen-klein" },
      { ms: 140, streckung: [0.1, 1], kurve: "gleich", luft: { striche: "hinten" } },
      { ms: 140, wende: true, streckung: [1, 1], kurve: "gleich" },
      { ms: 140, streckung: [0.1, 1], kurve: "gleich", luft: { striche: "hinten" } },
      { ms: 220, wende: true, streckung: [1, 1], kurve: "federn" },
      { ms: 300, winkel: { koerper: 0, ...STUHL_RUHE }, kurve: "federn", gesicht: "freuen-gross", luft: { staub: "boden" } },
    ],
  },
});

// Gähnen und Strecken (für Pausen und Rundenende).
meldeBewegung({
  id: "gaehnen", ansicht: "dreiviertel", ende: "stehen",
  schritte: [
    { ms: 600, gesicht: "gaehnen", winkel: { ...ARME_HOCH, kopf: -6 }, streckung: [0.97, 1.1] },
    { ms: 500, streckung: [0.96, 1.13], winkel: { kopf: -9 } },
    { ms: 420, gesicht: "ruhig", winkel: { ...RUHE, kopf: 8 }, streckung: [1.04, 0.95] },
    { ms: 320, winkel: { kopf: 0 }, streckung: [1, 1] },
  ],
  rollstuhl: {
    schritte: [
      { ms: 600, gesicht: "gaehnen", winkel: { ...ARME_HOCH, kopf: -6, rumpf: -4 } },
      { ms: 500, winkel: { kopf: -9, rumpf: -6 } },
      { ms: 420, gesicht: "ruhig", winkel: { ...STUHL_RUHE, kopf: 8, rumpf: 3 } },
      { ms: 320, winkel: { kopf: 0, rumpf: 0 } },
    ],
  },
});

// Anschleichen: zwei große, langsame Zehenspitzen-Schritte, Kopf eingezogen. Timo rollt in Zeitlupe.
const SCHLEICH_ARME = { "arm-vorn-oben": -42, "arm-vorn-unten": -84, "arm-hinten-oben": -26, "arm-hinten-unten": -84, kopf: 10, rumpf: 7 };
meldeBewegung({
  id: "anschleichen", ansicht: "profil", ende: "stehen", mal: 2,
  schritte: [
    { ms: 480, gesicht: "neugierig", winkel: { ...SCHLEICH_ARME, "bein-vorn": -34, "bein-vorn-unten": 30, "bein-hinten": 18, "bein-hinten-unten": 10 }, versatz: [0, -8] },
    { ms: 380, winkel: { "bein-vorn": -8, "bein-vorn-unten": 4, "bein-hinten": 4, "bein-hinten-unten": 36 }, versatz: [0, -4] },
    { ms: 480, winkel: { "bein-hinten": -34, "bein-hinten-unten": 30, "bein-vorn": 18, "bein-vorn-unten": 10 }, versatz: [0, -8] },
    { ms: 380, winkel: { "bein-hinten": -8, "bein-hinten-unten": 4, "bein-vorn": 4, "bein-vorn-unten": 36 }, versatz: [0, -4] },
  ],
  rollstuhl: {
    schritte: [
      { ms: 300, gesicht: "neugierig", winkel: { "arm-vorn-oben": 71, "arm-vorn-unten": -85, "arm-hinten-oben": 71, "arm-hinten-unten": -85, kopf: 10, rumpf: 9 }, haende: { vorn: "faust", hinten: "faust" } },
      { ms: 900, winkel: { "arm-vorn-oben": 30, "arm-vorn-unten": -60, "arm-hinten-oben": 30, "arm-hinten-unten": -60, "rad-vorn": 45, "rad-hinten": 45 } },
      { ms: 1, winkel: { "rad-vorn": 0, "rad-hinten": 0 } },
    ],
  },
});

// Kuckuck: vordere Hand vor den Augen, die hintere schaut neben dem Kopf hervor, dann großes Grinsen.
meldeBewegung({
  id: "kuckuck", ansicht: "dreiviertel", ende: "freuen-gross",
  schritte: [
    { ms: 300, winkel: { "arm-vorn-oben": -118, "arm-vorn-unten": -112, "arm-hinten-oben": 128, "arm-hinten-unten": 60, kopf: 4 }, gesicht: "freuen-klein" },
    { ms: 500, winkel: { kopf: 7 } },
    { ms: 140, kurve: "ruck", gesicht: "freuen-gross", streckung: [1.05, 1.05], versatz: [0, -8],
      winkel: { "arm-vorn-oben": -112, "arm-vorn-unten": -10, "arm-hinten-oben": 112, "arm-hinten-unten": 10, kopf: -5 } },
    { ms: 300, streckung: [1, 1], versatz: [0, 0], kurve: "federn" },
  ],
});

// Welle: Arme hoch und runter mit kleinem Hüpfer, für zusammen(). welle-spaet tanzt aus der Reihe.
meldeBewegung({
  id: "welle", ansicht: "dreiviertel", ende: "stehen",
  schritte: [{ ms: 220, winkel: ARME_HOCH, versatz: [0, -16], gesicht: "freuen-gross" }, { ms: 280, winkel: RUHE, versatz: [0, 0] }],
  rollstuhl: { schritte: [{ ms: 220, winkel: { ...ARME_HOCH, koerper: -7 }, gesicht: "freuen-gross" }, { ms: 280, winkel: { ...STUHL_RUHE, koerper: 0 } }] },
});
meldeBewegung({
  id: "welle-spaet", ansicht: "dreiviertel", ende: "freuen-klein",
  schritte: [
    { ms: 520, winkel: { kopf: 7 } },
    { ms: 90, kurve: "ruck", gesicht: "staunen", winkel: { kopf: -8 }, streckung: [0.97, 1.06] },
    { ms: 220, streckung: [1, 1] },
    { ms: 150, winkel: ARME_HOCH, versatz: [0, -24], gesicht: "freuen-gross" },
    { ms: 220, winkel: RUHE, versatz: [0, 0] },
  ],
  rollstuhl: {
    schritte: [
      { ms: 520, winkel: { kopf: 7 } },
      { ms: 90, kurve: "ruck", gesicht: "staunen", winkel: { kopf: -8 } },
      { ms: 220 },
      { ms: 150, winkel: { ...ARME_HOCH, koerper: -9 }, gesicht: "freuen-gross" },
      { ms: 220, winkel: { ...STUHL_RUHE, koerper: 0 } },
    ],
  },
});

// Abklatschen: ausholen, nach vorn oben, die Hände treffen sich (Sternchen). Zwei Kinder einander zugewandt.
meldeBewegung({
  id: "abklatschen", ansicht: "dreiviertel", ende: "freuen-klein",
  schritte: [
    { ms: 260, winkel: { "arm-vorn-oben": -168, "arm-vorn-unten": -50, rumpf: -4, kopf: -3 }, gesicht: "freuen-klein" },
    { ms: 130, kurve: "ruck", winkel: { "arm-vorn-oben": -112, "arm-vorn-unten": -8, rumpf: 5, kopf: 2 }, luft: { abklatsch: [236, 84] }, gesicht: "freuen-gross" },
    { ms: 300, luft: { abklatsch: [236, 84] }, winkel: { rumpf: 2 } },
    { ms: 300, winkel: { rumpf: 0 } },
  ],
});

// Ende-Haltung für Timos losflitzen: außerhalb des Bildes.
meldeHaltung({ id: "weg", ansicht: "profil", wort: "ist weggeflitzt", versatz: [460, 0] });
