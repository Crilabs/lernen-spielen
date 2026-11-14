// Rotkehlchen (Erithacus rubecula), sitzend im Profil nach rechts. Artmerkmale (T3): orangerote Stirn, Kehle und
// Brust mit grauem Saum, olivbrauner Rücken und Flügel, weißlicher Bauch, dünner dunkler Schnabel, dunkles Auge,
// dünne bräunliche Beine.
import { form, flach, falte, naht, oval, pfad } from "../kinder/stil.js";

const RUECKEN = "#8A7752";
const BRUST = "#E8733C";
const BAUCH = "#F1ECE2";

/** @type {import("./tiere.js").Tier} */
export default {
  id: "rotkehlchen",
  name: "Rotkehlchen",
  groesse: [50, 48],
  fuss: [24, 47],
  teile: () => [
    form(pfad("M12 28 L2 36 C1 38 3 39 5 38 L16 33Z"), RUECKEN, [6, 32]),
    form(oval(24, 28, 13, 11), RUECKEN, [20, 22], { glanz: true }),
    form(oval(31, 16, 8.5, 8), RUECKEN, [28, 12]),
    // Brust und Gesicht orange, grauer Saum dazwischen, Bauch hell
    { svg: `<path d="M26 22 C28 14 34 10 38 14 C40 18 38 22 37 26 C36 33 31 38 25 38 C30 32 30 26 26 22Z" fill="#9AA2A8" stroke="none"/>`
      + `<path d="M28 22 C30 15 34 12 38 15 C40 18 38 22 37 26 C36 32 32 36 27 37 C31 31 31 26 28 22Z" fill="${BRUST}" stroke="none"/>`
      + `<path d="M31 24 C34 22 37 24 36 28 C35 32 32 34 29 35 C32 31 32 27 31 24Z" fill="#D25F2C" stroke="none"/>`, kontur: "" },
    { svg: `<${oval(24, 35, 8, 4)} fill="${BAUCH}" stroke="none"/>`, kontur: "" },
    form(pfad("M12 24 C16 20 26 21 30 26 C28 32 20 34 14 32 C11 30 10 26 12 24Z"), "#7A6846", [16, 23]),
    naht("M15 28 C19 30 24 30 28 28M14 31 C18 33 22 33 26 31", "#7A6846", 0.9),
    flach(pfad("M38.5 15.5 L45 17 L38.5 18.5Z"), "#3A2E28"),
    { svg: `<circle cx="34.5" cy="14.5" r="1.9" fill="#1E1614" stroke="none"/><circle cx="34" cy="14" r="0.6" fill="#FFFFFF" stroke="none"/>`, kontur: "" },
    falte("M22 38 L21.5 46 L23 46 L23.5 38Z", "#8E6F5C", 0.1), falte("M27 38 L27 46 L28.5 46 L28.5 38Z", "#8E6F5C", 0.1),
  ],
};
