// Erweiterung der Runde für G02 Ich, du, wir: Wer am Maltisch auf sein Papier schaut, hält den Kopf leicht gesenkt und die
// Arme ruhig vor sich (der Tisch verdeckt sie zur Hälfte). Gemeldet wie in docs/figuren.md vorgesehen; die Prüfung von
// spiele/runde/bestand.js gilt auch hier.
import { meldeHaltung } from "../../runde/runde.js";

meldeHaltung({
  id: "ueber-papier", ansicht: "dreiviertel", wort: "schaut auf sein Papier",
  winkel: { "arm-vorn-oben": -14, "arm-vorn-unten": -48, "arm-hinten-oben": 10, "arm-hinten-unten": 36, kopf: 10 },
});
