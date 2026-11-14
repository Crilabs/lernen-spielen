// Feldhase (Lepus europaeus), sitzend im Profil nach rechts. Artmerkmale (T3): Ohren länger als der Kopf mit
// schwarzen Spitzen, gelblich-graubraunes Fell, heller Bauch, große bernsteinfarbene Augen seitlich am Kopf, lange
// Hinterläufe, Blume (Schwanz) oben schwarz, unten weiß. Keine menschliche Mimik (T1).
import { form, flach, falte, naht, oval, pfad } from "../kinder/stil.js";

const FELL = "#B48B5C";
const BAUCH = "#F1E6D3";
const SPITZE = "#3A2C24";

/** @type {import("./tiere.js").Tier} */
export default {
  id: "hase",
  name: "Feldhase",
  groesse: [120, 100],
  fuss: [60, 96],
  teile: () => [
    // Ohren hinten (das ferne Ohr dunkler), dann Blume, Körper, Hinterlauf, Kopf, vorderes Ohr
    form(pfad("M70 40 C62 26 56 12 52 2 C58 2 66 12 74 34Z"), "#9E7850", [58, 10]),
    flach(pfad("M52 2 C55 1 58 4 60 9 L56 11 C54 8 52 5 52 2Z"), SPITZE),
    form(oval(22, 72, 8, 8), BAUCH, [19, 68]),
    falte("M16 68 C18 63 26 63 29 67 C26 66 20 66 16 68Z", BAUCH, 0.9),
    form(pfad("M28 66 C30 50 46 42 64 44 C82 46 88 62 86 76 C84 90 70 96 52 96 C36 96 26 84 28 66Z"), FELL, [44, 52], { glanz: true }),
    form(oval(46, 80, 20, 15), FELL, [38, 72]),
    form(pfad("M30 92 C40 90 62 90 70 92 C72 95 66 97 58 97 L34 97 C28 97 27 93 30 92Z"), FELL, [40, 91]),
    form(pfad("M74 74 C78 74 80 80 80 94 C80 97 72 97 72 94 C72 84 71 76 74 74Z"), FELL, [74, 78]),
    form(oval(78, 70, 9, 14), BAUCH, [74, 62], { kontur: false }),
    form(pfad("M66 44 C68 32 82 28 92 34 C100 38 104 46 102 52 C100 58 92 60 84 58 C74 56 66 52 66 44Z"), FELL, [76, 36], { glanz: true }),
    falte("M70 50 C76 56 86 58 94 56 C88 60 76 60 70 54Z", FELL, 0.3),
    form(pfad("M80 36 C76 22 74 10 74 0 C80 2 86 14 86 34Z"), FELL, [77, 8]),
    flach(pfad("M74 0 C77 0 80 3 82 8 L78 10 C76 7 74 4 74 0Z"), SPITZE),
    naht("M78 30 C77 22 76 14 76 6", FELL, 1.6),
    // Auge: bernstein, Pupille, Lichtpunkt; Nase und Mundspalte; Schnurrhaare fein
    { svg: `<circle cx="88" cy="42" r="4.2" fill="#B56E22" stroke="none"/><circle cx="88.6" cy="42" r="2.4" fill="#2B1B18" stroke="none"/><circle cx="87.4" cy="40.8" r="1" fill="#FFFFFF" stroke="none"/>`, kontur: "" },
    { svg: `<path d="M100 48 C102 48 103 50 102 51 C101 52 99 51 99 49Z" fill="#8A5A4A" stroke="none"/>`, kontur: "" },
    naht("M101 52 C101 55 99 56 97 56M103 50 L112 47M103 52 L112 53M102 54 L110 58", FELL, 1),
  ],
};
