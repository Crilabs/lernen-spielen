// Hausmaus (Mus musculus), im Profil nach rechts. Artmerkmale (T3): graubraunes Fell, hellerer Bauch, große runde
// Ohren, spitze Schnauze, schwarze Knopfaugen, langer fast nackter Schwanz etwa so lang wie der Körper. Kein Käse (T4).
import { form, flach, falte, naht, oval, pfad } from "../kinder/stil.js";

const FELL = "#8E8577";
const HAUT = "#D9AFA6";

/** @type {import("./tiere.js").Tier} */
export default {
  id: "maus",
  name: "Hausmaus",
  groesse: [80, 44],
  fuss: [40, 42],
  teile: () => [
    flach(pfad("M24 36 C14 40 6 40 2 34 C1 32 3 31 4 33 C8 38 14 37 22 33Z"), HAUT),
    form(oval(38, 30, 17, 11), FELL, [32, 23], { glanz: true }),
    falte("M24 34 C30 40 44 41 52 36 C46 40 30 41 24 34Z", FELL, 0.3),
    form(pfad("M48 24 C52 18 62 18 68 24 C72 27 74 30 72 32 C68 34 58 36 50 34 C46 32 45 27 48 24Z"), FELL, [54, 21]),
    form(oval(53, 17, 6.5, 7), FELL, [51, 13]),
    { svg: `<ellipse cx="53" cy="17.5" rx="4" ry="4.6" fill="${HAUT}" stroke="none"/>`, kontur: "" },
    { svg: `<circle cx="62" cy="25" r="2.3" fill="#1E1614" stroke="none"/><circle cx="61.3" cy="24.3" r="0.8" fill="#FFFFFF" stroke="none"/><circle cx="72.5" cy="30.5" r="1.6" fill="#C98A86" stroke="none"/>`, kontur: "" },
    flach(oval(34, 41, 4, 1.8), HAUT), flach(oval(50, 41, 4, 1.8), HAUT),
    naht("M70 30 L78 27M70 31 L78 32M69 32 L76 36", FELL, 0.8),
  ],
};
