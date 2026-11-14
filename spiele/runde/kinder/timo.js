// Timo – figuren.md §2: helle bis olive Haut, glatte hellbraune Haare, rundlich. Rollstuhl, fährt selbst,
// schnell und geschickt, trägt Dinge auf dem Schoß. Mag backen und abwiegen.
// Stil wie Ela (figuren.md §4): Silhouette, Schatten in Stufen, Farben aus den Welt-Paletten.

import { meldeKind } from "../bestand.js";
import { dreiviertelStuhl, profilStuhl, flaeche } from "./schnitt.js";
import * as S from "./stil.js";

const farben = {
  haut: "#E8C39E", haar: "#8A5A3A", oben: "#E9A0B5", unten: "#7B6A8E", schuhe: "#CBB7A0", sohle: "#FFFCF7",
  kapuze: true, wangen: 0.35,
};

// Glatte Haare: ein Schopf, Pony in geraden Strähnen (flache Wölbung), über den Kopf zurück.
const SCHOPF = /** @type {[number, number][]} */ ([
  [118, 86], [124, 60], [132, 67], [139, 50], [147, 63], [154, 48], [163, 61], [171, 47], [180, 60], [188, 48],
  [196, 61], [201, 53], [208, 82],
  [212, 62], [210, 45], [200, 31], [186, 24], [170, 21], [153, 23], [137, 29], [125, 40], [117, 56],
]);
const KERBEN = [[[124, 60], [130, 44]], [[139, 50], [142, 38]], [[154, 48], [156, 36]], [[171, 47], [171, 35]], [[188, 48], [186, 36]], [[201, 53], [196, 42]]];
/** @param {number[]} a @param {number[]} b */
const kerbe = (a, b) => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l = Math.hypot(dx, dy);
  const n = [(-dy / l) * 2.8, (dx / l) * 2.8];
  return `M${a[0] - n[0]} ${a[1] - n[1]} Q${(a[0] + b[0]) / 2} ${(a[1] + b[1]) / 2 + 1} ${b[0]} ${b[1]} Q${(a[0] + b[0]) / 2 + n[0] * 0.4} ${(a[1] + b[1]) / 2} ${a[0] + n[0]} ${a[1] + n[1]} Z`;
};
const LICHT = ["M136 44 Q142 34 152 29 Q144 37 140 47 Z", "M158 40 Q162 31 170 27 Q164 34 162 42 Z", "M176 40 Q181 32 189 30 Q183 36 180 43 Z"];

const PONY = SCHOPF.slice(1, 12).map(([x, y]) => /** @type {[number, number]} */ ([x, y + 5]));
const kopfDreiviertel = {
  ponyschatten: {
    svg: `<path d="${S.zacken([[PONY[0][0], 40], ...PONY, [PONY[PONY.length - 1][0], 40]], 0.08)}" fill="${S.dunkler(farben.haut, 0.3)}" stroke="none"/>`,
    kontur: "",
  },
  haareOben: S.zusammen(
    S.form(S.pfad(S.zacken(SCHOPF, 0.08)), farben.haar, [138, 32], { s: 0.92 }),
    { svg: KERBEN.map(([a, b]) => `<path d="${kerbe(a, b)}" fill="${S.dunkler(farben.haar, 0.4)}" stroke="none"/>`).join(""), kontur: "" },
    { svg: LICHT.map((d) => `<path d="${d}" fill="${S.heller(farben.haar, 0.25)}" stroke="none"/>`).join(""), kontur: "" },
  ),
};

// Profil vorerst schlicht (folgt mit dem Profil aller Kinder).
const kopfProfil = {
  haareOben: flaeche("M206 62 C198 52 186 47 174 49 C164 50 154 54 148 60 C144 70 144 84 142 96 C130 98 122 88 122 74"
    + " C122 42 142 24 166 24 C190 24 208 40 206 62 Z", farben.haar),
};

meldeKind({
  id: "timo",
  name: "Timo",
  pronomen: "er",
  bewegt: "rollstuhl",
  stil: { "--braue": "#5A3A26" },
  ansichten: {
    dreiviertel: dreiviertelStuhl({ breite: 1.15, farben, kopf: kopfDreiviertel }),
    profil: profilStuhl({ breite: 1.15, farben, kopf: kopfProfil }),
  },
});
