// Erweiterung der Runde für G02 Ich, du, wir: Wer am Maltisch auf sein Papier schaut, hält den Kopf leicht gesenkt und die
// Arme ruhig vor sich (der Tisch verdeckt sie zur Hälfte). Gemeldet wie in docs/figuren.md vorgesehen; die Prüfung von
// spiele/runde/bestand.js gilt auch hier.
import { meldeHaltung } from "../../runde/runde.js";

meldeHaltung({
  id: "ueber-papier", ansicht: "dreiviertel", wort: "schaut auf sein Papier",
  winkel: { "arm-vorn-oben": -14, "arm-vorn-unten": -48, "arm-hinten-oben": 10, "arm-hinten-unten": 36, kopf: 10 },
});

// Wer gerade malt, klebt oder baut: der Arm ist gebeugt, die Faust mit dem Stift reicht zum Bogen auf dem Tisch (kein
// gerade ausgestreckter Arm). Der Tisch verdeckt die untere Hälfte, die Faust steht knapp über der Tischkante.
meldeHaltung({
  id: "am-bogen", ansicht: "dreiviertel", wort: "reicht mit dem Stift zum Bogen",
  winkel: { "arm-vorn-oben": -50, "arm-vorn-unten": 70, "arm-hinten-oben": 6, kopf: 10 },
  haende: { vorn: "faust" },
});
