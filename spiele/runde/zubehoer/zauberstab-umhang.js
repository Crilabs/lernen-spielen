// Zauberstab mit Umhang (figuren.md §5 „verzaubern“). Die vordere Hand umschließt den Stab (er liegt hinter der
// Faust), er zeigt in
// Armrichtung; Zustand „leuchtet“: Sonnenring um die Spitze. Der Umhang hängt am Rücken hinter dem Rumpf.
// Der Umhang bedeckt Schultern und Rücken und ist vor dem Hals gebunden (Rückenbahn hinter, Schulterbahnen vor dem Rumpf).
// Koordinaten relativ zum Platz (Hand: Handgelenk-Mitte, Rücken: Schulterlinie Mitte), Arm hängt = +y.

import { meldeZubehoer } from "../bestand.js";
import * as S from "../kinder/stil.js";

const HOLZ = "#B98E5E";
const SPITZE = "#FFFCF7";
const SONNE = "#FFD95A";
const UMHANG = "#5B5AA6";

const stab = S.zusammen(
  S.glied([0, 4], 2.6, [0, 34], 2.2, HOLZ),
  S.form(S.oval(0, 37, 4.2, 4.2), SPITZE, [-1.5, 35.5], { s: 0.8 }),
);
const stabLeuchtet = S.zusammen(
  { svg: `<circle cx="0" cy="37" r="12" fill="${SONNE}" opacity="0.35" stroke="none"/>`, kontur: "" },
  stab,
  { svg: `<circle cx="0" cy="37" r="7.5" fill="none" stroke="${SONNE}" stroke-width="3"/>`
    + `<circle cx="0" cy="37" r="3.6" fill="#FFF3B8" stroke="none"/>`, kontur: "" },
);

/** Umhang von vorn: hängt hinter Schultern und Rücken, unten weit. */
const umhangVorn = S.zusammen(
  // Der Saum steigt in der Mitte bis hinter die Jacke: der Umhang liegt in der Rumpf-Ebene vor den Beinen,
  // darf also unten nur seitlich neben den Beinen herabfallen.
  S.form(S.pfad("M-34 6 C-22 -8 22 -8 34 6 C38 30 46 62 52 88 Q40 90 30 80 L26 70 L-26 70 L-30 80 Q-40 90 -52 88 C-46 62 -38 30 -34 6 Z"), UMHANG, [-22, 8], { s: 0.9 }),
  S.falte("M-28 20 C-34 44 -40 64 -46 86 L-40 87 C-35 66 -30 46 -25 22 Z M30 20 C36 44 42 64 48 86 L42 87 C37 66 32 46 27 22 Z", UMHANG, 0.3),
);
/** Umhang im Profil: fällt hinter dem Rücken herab. */
const umhangProfil = S.zusammen(
  S.form(S.pfad("M10 -16 L20 -14 L10 50 Q-2 58 -18 56 Z"), UMHANG, [4, -10], { s: 0.86 }),
  S.falte("M2 6 C-2 26 -6 44 -10 58 L-5 59 C-1 44 3 26 6 7 Z", UMHANG, 0.3),
);

const BAND = "#8F8FD0";
/** Schleife vor dem Hals: Knoten, zwei Schlaufen, zwei Enden. @param {number} x @param {number} y */
const schleife = (x, y) => S.zusammen(
  S.form(S.pfad(`M${x} ${y} C${x - 6} ${y - 7} ${x - 13} ${y - 3} ${x - 11} ${y + 3} C${x - 9} ${y + 7} ${x - 4} ${y + 4} ${x} ${y} Z`), BAND, [x - 9, y - 3], { s: 0.8 }),
  S.form(S.pfad(`M${x} ${y} C${x + 6} ${y - 7} ${x + 13} ${y - 3} ${x + 11} ${y + 3} C${x + 9} ${y + 7} ${x + 4} ${y + 4} ${x} ${y} Z`), BAND, [x + 4, y - 3], { s: 0.8 }),
  S.form(S.pfad(`M${x - 2} ${y + 2} L${x - 6} ${y + 14} L${x - 3} ${y + 15} L${x} ${y + 3} Z M${x + 2} ${y + 2} L${x + 5} ${y + 13} L${x + 8} ${y + 12} L${x + 1} ${y + 3} Z`), BAND, [x - 4, y + 4], { s: 0.8 }),
  S.form(S.oval(x, y + 0.5, 3, 2.6), S.dunkler(BAND, 0.1), [x - 1, y - 0.5], { s: 0.8 }),
);
/** Vorn: zwei Bahnen fallen vom Hals über die Schultern, Schleife vor dem Hals (liegt vor dem Rumpf). */
const umhangSchultern = S.zusammen(
  S.form(S.pfad("M-9 -4 C-22 -6 -31 0 -33 12 C-35 32 -38 52 -40 72 L-31 73 C-27 52 -23 30 -13 6 Z"), UMHANG, [-26, 4], { s: 0.86 }),
  S.form(S.pfad("M9 -4 C22 -6 31 0 33 12 C35 32 38 52 40 72 L31 73 C27 52 23 30 13 6 Z"), UMHANG, [16, 2], { s: 0.86 }),
  schleife(0, 1),
);
/** Profil: Kragen um den Hals, Bahn über die Schulter nach hinten, Schleife vorn am Hals. */
const umhangKragen = S.zusammen(
  S.form(S.pfad("M28 -22 C20 -26 6 -24 0 -18 C-4 -10 -2 2 2 12 L10 10 C8 0 8 -10 14 -14 C18 -16 24 -16 30 -14 Z"), UMHANG, [6, -20], { s: 0.86 }),
  schleife(28, -16),
);

meldeZubehoer({
  id: "zauberstab-umhang",
  wort: "Zauberstab und Umhang",
  teile: [
    { platz: "hand-vorn", ebene: "hinten", greift: true, svg: { dreiviertel: stab, profil: stab },
      zustaende: { leuchtet: { dreiviertel: stabLeuchtet, profil: stabLeuchtet } } },
    { platz: "ruecken", ebene: "hinten", svg: { dreiviertel: umhangVorn, profil: umhangProfil } },
    { platz: "ruecken", ebene: "vorne", svg: { dreiviertel: umhangSchultern, profil: umhangKragen } },
  ],
});
