// Grundbestand der Haltungen (figuren.md §4).
// Winkel in Grad. Negativ = gegen den Uhrzeigersinn: der vordere Arm (rechts) hebt sich nach vorn und oben,
// der hintere Arm (links) mit positiven Werten. Im Profil schwingt ein Bein mit negativem Winkel nach vorn.
// Zubehör (braucht) und Zustände kommen mit dem Zubehör dazu (zubehoer/*.js).

import { meldeHaltung } from "./bestand.js";

const LOCKER = { "arm-vorn-oben": -6, "arm-hinten-oben": 6 };

meldeHaltung({ id: "stehen", ansicht: "beide", wort: "steht", winkel: LOCKER });

meldeHaltung({
  id: "zeigen", ansicht: "dreiviertel", wort: "zeigt",
  winkel: { ...LOCKER, "arm-vorn-oben": -80, "arm-vorn-unten": -10, kopf: 4 },
  haende: { vorn: "zeigen" },
});

meldeHaltung({
  id: "fragen", ansicht: "dreiviertel", wort: "fragt", gesicht: "neugierig",
  winkel: { ...LOCKER, "arm-vorn-oben": -50, "arm-vorn-unten": -15, kopf: 9 },
  haende: { vorn: "zeigen" },
});

meldeHaltung({
  id: "tragen", ansicht: "dreiviertel", wort: "trägt",
  winkel: { "arm-vorn-oben": 12, "arm-vorn-unten": 75, "arm-hinten-oben": -12, "arm-hinten-unten": -70 },
});

meldeHaltung({
  id: "tragen-gehen", ansicht: "profil", wort: "trägt",
  winkel: { "arm-vorn-oben": -30, "arm-vorn-unten": -55, "arm-hinten-oben": -24, "arm-hinten-unten": -60 },
});

meldeHaltung({
  id: "staunen", ansicht: "dreiviertel", wort: "staunt", gesicht: "staunen",
  winkel: { "arm-vorn-oben": -28, "arm-vorn-unten": -22, "arm-hinten-oben": 28, "arm-hinten-unten": 22, kopf: -4 },
});

meldeHaltung({
  id: "freuen-klein", ansicht: "dreiviertel", wort: "freut sich", gesicht: "freuen-klein",
  winkel: { ...LOCKER, "arm-vorn-oben": -12, "arm-vorn-unten": -95, kopf: 5 },
  haende: { vorn: "faust" },
});

meldeHaltung({
  id: "freuen-gross", ansicht: "dreiviertel", wort: "freut sich", gesicht: "freuen-gross",
  winkel: { "arm-vorn-oben": -132, "arm-vorn-unten": -18, "arm-hinten-oben": 132, "arm-hinten-unten": 18, kopf: -3 },
});

meldeHaltung({
  id: "nachdenken", ansicht: "dreiviertel", wort: "denkt nach", gesicht: "nachdenken",
  winkel: { "arm-vorn-oben": 38, "arm-vorn-unten": 142, "arm-hinten-oben": -14, "arm-hinten-unten": -62, kopf: 7 },
});

meldeHaltung({
  id: "winken", ansicht: "dreiviertel", wort: "winkt", gesicht: "freuen-klein",
  winkel: { "arm-vorn-oben": -118, "arm-vorn-unten": -38, "arm-hinten-oben": 6, kopf: 3 },
});

meldeHaltung({
  id: "zaubern", ansicht: "dreiviertel", wort: "zaubert", gesicht: "freuen-klein",
  winkel: { "arm-vorn-oben": -120, "arm-vorn-unten": -12, "arm-hinten-oben": 10 },
});

meldeHaltung({
  id: "schweben", ansicht: "dreiviertel", wort: "schwebt", gesicht: "freuen-klein",
  winkel: { "arm-vorn-oben": -172, "arm-vorn-unten": 0, "arm-hinten-oben": 22, "arm-hinten-unten": 10 },
  versatz: [0, -60],
});

meldeHaltung({ id: "klein", ansicht: "beide", wort: "ist ganz klein", winkel: LOCKER, groesse: 0.5 });
meldeHaltung({ id: "gross", ansicht: "beide", wort: "ist riesig", winkel: LOCKER, groesse: 1.6 });
