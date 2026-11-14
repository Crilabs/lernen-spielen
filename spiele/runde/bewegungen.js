// Grundbestand der Bewegungen (figuren.md §4, grundsaetze-bilder.md §7).
// Jeder Schritt höchstens 1 s (B6), außer dem sanften Schweben. Im Ruhezustand bewegt sich nichts (B3).

import { meldeBewegung } from "./bestand.js";

// Gehen im Profil mit Knie: Aufsetzen mit fast gestrecktem Vorderbein, das hintere Knie beugt beim Abstoßen,
// beim Durchschwingen hebt das Bein den Fuß mit gebeugtem Knie. Arme schwingen gegengleich, Ellbogen leicht gebeugt.
// Rollstuhl (Timo): die Hände greifen oben hinten am Greifreifen, schieben nach vorn (Räder drehen 90°), lassen los
// und greifen neu; die Räder springen unsichtbar auf 0° zurück (Speichen 45°-symmetrisch).
// Armwinkel aus der Armlänge berechnet, damit die Hand auf dem Greifreifen liegt.
const SCHRITT = 260;
const ARM = (/** @type {number} */ vo, /** @type {number} */ hi) => ({
  "arm-vorn-oben": vo, "arm-hinten-oben": hi, "arm-vorn-unten": -Math.abs(vo) * 0.6 - 8, "arm-hinten-unten": -Math.abs(hi) * 0.6 - 8,
});
meldeBewegung({
  id: "gehen", ansicht: "profil", mal: 2, ende: "stehen",
  schritte: [
    // Kontakt: vorn aufsetzen, hinten abstoßen
    { ms: SCHRITT, winkel: { "bein-vorn": -24, "bein-vorn-unten": 4, "bein-hinten": 20, "bein-hinten-unten": 22, ...ARM(22, -22) }, versatz: [0, 1] },
    // Durchschwingen: hinteres Bein kommt mit gebeugtem Knie nach vorn
    { ms: SCHRITT, winkel: { "bein-vorn": -2, "bein-vorn-unten": 2, "bein-hinten": -14, "bein-hinten-unten": 42, ...ARM(4, -4) }, versatz: [0, -4] },
    // Kontakt mit dem anderen Bein
    { ms: SCHRITT, winkel: { "bein-hinten": -24, "bein-hinten-unten": 4, "bein-vorn": 20, "bein-vorn-unten": 22, ...ARM(-22, 22) }, versatz: [0, 1] },
    { ms: SCHRITT, winkel: { "bein-hinten": -2, "bein-hinten-unten": 2, "bein-vorn": -14, "bein-vorn-unten": 42, ...ARM(-4, 4) }, versatz: [0, -4] },
  ],
  rollstuhl: {
    schritte: [
      { ms: 160, winkel: { "arm-vorn-oben": 71, "arm-vorn-unten": -85, "arm-hinten-oben": 71, "arm-hinten-unten": -85 }, haende: { vorn: "faust", hinten: "faust" } },
      { ms: 460, winkel: { "arm-vorn-oben": 6, "arm-vorn-unten": -42, "arm-hinten-oben": 6, "arm-hinten-unten": -42, "rad-vorn": 90, "rad-hinten": 90 } },
      { ms: 1, winkel: { "rad-vorn": 0, "rad-hinten": 0 } },
    ],
  },
});

meldeBewegung({
  id: "winken", ansicht: "dreiviertel", mal: 2, ende: "stehen",
  schritte: [
    { ms: 300, haltung: "winken" },
    { ms: 250, winkel: { "arm-vorn-unten": -68 } },
    { ms: 250, winkel: { "arm-vorn-unten": -18 } },
  ],
});

// Hüpfen: kurz in die Knie (Versatz nach unten), hoch, landen. Im Rollstuhl heben sich die Vorderräder.
meldeBewegung({
  id: "huepfen", ansicht: "dreiviertel", ende: "freuen-gross",
  schritte: [
    { ms: 150, haltung: "freuen-gross", versatz: [0, 5] },
    { ms: 220, versatz: [0, -40] },
    { ms: 220, versatz: [0, 0] },
  ],
  rollstuhl: {
    schritte: [
      { ms: 150, haltung: "freuen-gross" },
      { ms: 220, winkel: { koerper: -7 } },
      { ms: 220, winkel: { koerper: 0 } },
    ],
  },
});

meldeBewegung({
  id: "zaubern", ansicht: "dreiviertel", ende: "stehen",
  schritte: [
    { ms: 400, haltung: "zaubern" },
    { ms: 200, winkel: { "arm-vorn-oben": -95 } },
    { ms: 250, winkel: { "arm-vorn-oben": -128 }, zustaende: { "zauberstab-umhang": "leuchtet" } },
    { ms: 500, winkel: { "arm-vorn-oben": -122 }, zustaende: { "zauberstab-umhang": "" } },
  ],
});

// Schweben: sanft hoch, kurz oben, sanft wieder herunter (spec §5.6, nichts fällt). Bleiben soll die Figur oben
// nur, wenn ein Spiel haltung("schweben") wählt.
meldeBewegung({
  id: "schweben", ansicht: "dreiviertel", ende: "stehen",
  schritte: [{ ms: 1100, haltung: "schweben" }, { ms: 600, versatz: [0, -66] }, { ms: 1100, versatz: [0, -4] }],
});

meldeBewegung({ id: "schrumpfen", ansicht: "dreiviertel", ende: "klein", schritte: [{ ms: 800, haltung: "klein" }] });
meldeBewegung({ id: "wachsen", ansicht: "dreiviertel", ende: "gross", schritte: [{ ms: 800, haltung: "gross" }] });
