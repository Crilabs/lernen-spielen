// <ls-objekt art="briefkasten">: ein eckiger Wand-Briefkasten für Haus oder Wohnung, von vorn: oben eine vorstehende
// Dachkante, darunter der Einwurfschlitz im Rahmen der Klappe, aus dem ein Briefumschlag (Rückseite mit Lasche) halb
// herausschaut; darunter ein leeres Namensschild mit zwei Schrauben und das Schloss. Feld 0…100.
// Keine Schrift, keine Ziffer: Name und Adresse stehen auf dem echten Brief und am echten Kasten.
// Bild der Karte „Mit echten Dingen“ für zahlwort-ziffern-bis-100 (Adressen für Briefe aufschreiben).
// Breiter, aufrechter Kasten mit Dach, damit er sich von `glueckwunschkarte` (Karte im Umschlag) und
// `nudelpackung` (Pappschachtel) abhebt.
//
// Farben nur aus den Welt-Paletten (spiele/start/welten.js, grundsaetze-bilder §6.2) und den Tokens (Papier für das
// Schild), keine Farbe der Lernzeichen.

import { form, flach, naht, pfad, oval, zusammen, heller, dunkler } from "../runde/kinder/stil.js";
import { FARBE } from "../rahmen/stil.js";
import { PALETTEN } from "../start/welten.js";
import { meldeObjekt, bild } from "./objekt.js";

/** @typedef {import("../runde/kinder/stil.js").Stueck} Stueck */

const KASTEN = PALETTEN.wiese[4];
const UMSCHLAG = PALETTEN.werkstatt[0];
const SCHILD = FARBE.papier;
const SCHLOSS = PALETTEN.werkstatt[1];

/** Briefkasten mit halb eingeworfenem Brief als Stück im Feld 0…100 (Boden bei y 92). @returns {Stueck} */
export function briefkastenStueck() {
  const kasten = form(pfad("M20 26 L80 26 L80 87 Q80 92 75 92 L25 92 Q20 92 20 87 Z"), KASTEN, [26, 30], { s: 0.93 });
  const dach = form(pfad("M15 28 L18 20 Q18.5 19 20 19 L80 19 Q81.5 19 82 20 L85 28 Z"), dunkler(KASTEN, 0.12), [22, 20], { s: 0.8 });
  const traufe = falteStreifen("M20 28 L80 28 L80 31 L20 31 Z");
  const klappe = form(pfad("M27 36 Q27 34 29 34 L71 34 Q73 34 73 36 L73 47 Q73 49 71 49 L29 49 Q27 49 27 47 Z"),
    heller(KASTEN, 0.16), [30, 35], { s: 0.9, kontur: false });
  const schlitz = flach(pfad("M31 38.5 Q31 37 32.5 37 L67.5 37 Q69 37 69 38.5 L69 42 Q69 43.5 67.5 43.5 L32.5 43.5 Q31 43.5 31 42 Z"),
    dunkler(KASTEN, 0.6));
  // Der Umschlag steckt im Schlitz: unten gerade abgeschnitten, oben leicht nach rechts gekippt.
  const brief = form(pfad("M36 43 L62 43 L65.6 13.4 L39.4 9.6 Z"), UMSCHLAG, [40, 12], { s: 0.92 });
  const lasche = naht("M39.4 9.6 L51.4 24 L65.6 13.4", UMSCHLAG, 1.4);
  const kante = naht("M30 49 L70 49", KASTEN, 1.4);
  const schild = form(pfad("M36 58 L64 58 L64 69 L36 69 Z"), SCHILD, [38, 59], { s: 0.9, kontur: false });
  const schraube1 = flach(oval(38.6, 63.5, 0.9, 0.9), dunkler(SCHILD, 0.3));
  const schraube2 = flach(oval(61.4, 63.5, 0.9, 0.9), dunkler(SCHILD, 0.3));
  const schloss = form(oval(50, 80, 3.6, 3.6), SCHLOSS, [48.6, 78.6], { s: 0.84, kontur: false });
  const loch = flach(pfad("M49.3 78.4 L50.7 78.4 L50.7 82 L49.3 82 Z"), dunkler(SCHLOSS, 0.55));
  return zusammen(
    kasten, dach, traufe, ohneKontur(klappe), schlitz, brief, lasche, kante,
    ohneKontur(schild), ohneKontur(schraube1), ohneKontur(schraube2), ohneKontur(schloss), ohneKontur(loch),
  );
}

/** Schattenstreifen unter dem Dach (Schlagschatten). @param {string} d @returns {Stueck} */
function falteStreifen(d) {
  return { svg: `<path d="${d}" fill="${dunkler(KASTEN, 0.35)}" stroke="none"/>`, kontur: "" };
}

/** Stück ohne Beitrag zur Silhouette. @param {Stueck} s @returns {Stueck} */
const ohneKontur = (s) => ({ svg: s.svg, kontur: "" });

meldeObjekt("briefkasten", {
  zustaende: ["brief"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: briefkastenStueck() }], ursprung: [50, 92] }),
});
