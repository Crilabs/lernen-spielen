// Weltandeutung „Tiere auf Wiese und Hecke“ (M35, M37): Hecke mit Blüten, ein Zitronenfalter.
// Koordinaten im Bogen 0 0 240 280.
import { zeichner, flaeche } from "../zeichnen.js";

const { guss } = zeichner("welt-hecke", 4);

const hecke = guss([
  `<circle cx="60" cy="196" r="34"/>`, `<circle cx="104" cy="178" r="40"/>`, `<circle cx="150" cy="186" r="38"/>`,
  `<circle cx="190" cy="200" r="30"/>`, `<rect x="30" y="196" width="180" height="40"/>`,
], "#5FAE5E", flaeche("M20 214 C80 226 160 222 220 212 L220 240 L20 240Z", "#4A9450")
  + [[70, 182], [112, 160], [146, 176], [184, 192], [96, 204], [160, 206]].map(([x, y]) =>
    `<circle cx="${x}" cy="${y}" r="5" fill="#FFFFFF"/>`).join(""));

// Zitronenfalter (Gonepteryx rhamni): gelbe, spitz zulaufende Flügel, kleiner oranger Punkt.
const falter = guss([
  `<path d="M150 96 C136 74 116 72 112 86 C110 100 130 108 150 100Z"/>`,
  `<path d="M150 96 C164 74 184 72 188 86 C190 100 170 108 150 100Z"/>`,
  `<rect x="147" y="86" width="6" height="22" rx="3"/>`,
], "#F4E04D", `<circle cx="128" cy="88" r="3" fill="#E8893A"/><circle cx="172" cy="88" r="3" fill="#E8893A"/>`);

export default hecke + falter;
