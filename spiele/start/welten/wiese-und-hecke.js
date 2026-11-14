// Weltandeutung „Tiere auf Wiese und Hecke“ (M35, M37): Hecke mit Blüten, ein Zitronenfalter.
// Koordinaten im Bogen 0 0 240 380 (Boden bei y ≈ 230, im Tor um 36 angehoben). Stil der Runde: Büschel mit Sichelschatten, Kontur nur außen.
import { zeichner, form, naht, dunkler, TOR_KONTUR } from "../zeichnen.js";

const zz = zeichner("welt-hecke", TOR_KONTUR);
const GRUEN = "#5FAE5E";

/** @type {[number, number, number][]} */
const BUESCHEL = [[104, 170, 30], [150, 176, 30], [60, 188, 28], [190, 194, 26], [84, 198, 26], [128, 196, 30], [170, 206, 26], [44, 212, 22], [104, 214, 24], [206, 214, 20], [146, 218, 24]];
const hecke = zz.guss(
  ...BUESCHEL.map(([x, y, r]) => form(`circle cx="${x}" cy="${y}" r="${r}"`, GRUEN, [x - r * 0.45, y - r * 0.55], { s: 0.84 })),
  ...[[78, 176], [118, 158], [152, 168], [186, 186], [100, 200], [162, 202], [56, 198]].map(([x, y]) =>
    form(`circle cx="${x}" cy="${y}" r="5"`, "#FFFFFF", [x - 2, y - 2], { kontur: false, tiefe: 0.6 })),
);

// Zitronenfalter (Gonepteryx rhamni): gelbe, spitz zulaufende Flügel mit kleinem orangen Punkt.
const falter = `<g transform="translate(0 30)">${zz.guss(
  form(`path d="M150 96 C136 74 116 72 112 86 C110 100 130 108 150 100Z"`, "#F4E04D", [124, 82]),
  form(`path d="M150 96 C164 74 184 72 188 86 C190 100 170 108 150 100Z"`, "#F4E04D", [164, 82]),
  naht("M148 96 C136 88 124 86 116 88M152 96 C164 88 176 86 184 88", "#F4E04D", 1.2),
  form(`rect x="147" y="86" width="6" height="22" rx="3"`, "#7A6A3A", [148, 88]),
  form(`circle cx="128" cy="90" r="3"`, "#E8893A", [127, 89], { kontur: false }), form(`circle cx="172" cy="90" r="3"`, "#E8893A", [171, 89], { kontur: false }),
)}</g>`;

export default `<ellipse cx="124" cy="236" rx="96" ry="7" fill="${dunkler("#A5D78E", 0.26)}"/>` + hecke + falter;
