// Schirm (figuren.md §5 „schweben“): Griff in der vorderen Hand, Stange in Armrichtung, das Dach am Ende.
// Zustand „zu“ (gefaltet, Grundfassung) und „auf“ (Dach mit Streben). Arm hängt = +y.

import { meldeZubehoer } from "../bestand.js";
import * as S from "../kinder/stil.js";

const STOFF = "#8FD3EE";
const STREIFEN = "#FFFCF7";
const STANGE = "#6B5C96";

const griff = S.zusammen(
  S.glied([0, 2], 2.6, [0, 14], 2.6, STANGE),
  S.glied([0, 8], 1.8, [0, 78], 1.6, STANGE),
);
const zu = S.zusammen(griff, S.form(S.pfad("M0 62 L-7 94 L0 106 L7 94 Z"), STOFF, [-3, 70], { s: 0.86 }),
  S.naht("M0 64 L-2 100 M0 64 L3 98", STOFF, 1.6));
const dach = "M-50 76 C-46 114 46 114 50 76 Q34 70 17 76 Q0 70 -17 76 Q-34 70 -50 76 Z";
const auf = S.zusammen(
  griff,
  S.form(S.pfad(dach), STOFF, [-30, 80], { s: 0.9 }),
  { svg: `<path d="M-17 76 C-15 96 -8 108 0 112 C8 108 15 96 17 76 Q0 70 -17 76 Z" fill="${STREIFEN}" opacity="0.85" stroke="none"/>`, kontur: "" },
  S.naht("M0 112 L-50 76 M0 112 L-17 76 M0 112 L17 76 M0 112 L50 76", STOFF, 1.8),
  S.form(S.oval(0, 114, 3, 3), STANGE, [-1, 113], { s: 0.8 }),
);

meldeZubehoer({
  id: "schirm",
  wort: "der Schirm",
  teile: [{ platz: "hand-vorn", ebene: "hinten", greift: true, svg: { dreiviertel: zu, profil: zu }, zustaende: { auf: { dreiviertel: auf, profil: auf } } }],
});
