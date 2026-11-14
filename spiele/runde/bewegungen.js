// Grundbestand der Bewegungen (figuren.md §4, grundsaetze-bilder.md §7).
// Jeder Schritt höchstens 1 s (B6), außer dem sanften Schweben. Im Ruhezustand bewegt sich nichts (B3).

import { meldeBewegung } from "./bestand.js";

// Gehen im Profil: Beine und Arme gegenläufig, kleiner Wipp-Versatz.
// Rollstuhl: Räder drehen um 90°, dann ein unsichtbarer Sprung zurück auf 0° (vier Speichen sehen gleich aus),
// die Hände schieben an den Greifreifen.
const SCHRITT = 250;
meldeBewegung({
  id: "gehen", ansicht: "profil", mal: 2, ende: "stehen",
  schritte: [
    { ms: SCHRITT, winkel: { "bein-vorn": -22, "bein-hinten": 22, "arm-vorn-oben": 18, "arm-hinten-oben": -18 }, versatz: [0, 0] },
    { ms: SCHRITT, winkel: { "bein-vorn": 0, "bein-hinten": 0, "arm-vorn-oben": 0, "arm-hinten-oben": 0 }, versatz: [0, -4] },
    { ms: SCHRITT, winkel: { "bein-vorn": 22, "bein-hinten": -22, "arm-vorn-oben": -18, "arm-hinten-oben": 18 }, versatz: [0, 0] },
    { ms: SCHRITT, winkel: { "bein-vorn": 0, "bein-hinten": 0, "arm-vorn-oben": 0, "arm-hinten-oben": 0 }, versatz: [0, -4] },
  ],
  rollstuhl: {
    schritte: [
      { ms: SCHRITT * 2, winkel: { "rad-vorn": 90, "rad-hinten": 90, "arm-vorn-oben": -28, "arm-hinten-oben": -28, "arm-vorn-unten": -20, "arm-hinten-unten": -20 } },
      { ms: 1, winkel: { "rad-vorn": 0, "rad-hinten": 0 } },
      { ms: SCHRITT * 2, winkel: { "rad-vorn": 90, "rad-hinten": 90, "arm-vorn-oben": 8, "arm-hinten-oben": 8, "arm-vorn-unten": 0, "arm-hinten-unten": 0 } },
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
    { ms: 250, winkel: { "arm-vorn-oben": -128 } },
    { ms: 500, winkel: { "arm-vorn-oben": -122 } },
  ],
});

meldeBewegung({
  id: "schweben", ansicht: "dreiviertel", ende: "schweben",
  schritte: [{ ms: 1200, haltung: "schweben" }],
});

meldeBewegung({ id: "schrumpfen", ansicht: "dreiviertel", ende: "klein", schritte: [{ ms: 800, haltung: "klein" }] });
meldeBewegung({ id: "wachsen", ansicht: "dreiviertel", ende: "gross", schritte: [{ ms: 800, haltung: "gross" }] });
