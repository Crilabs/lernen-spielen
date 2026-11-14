// Die Runde: Ela, Kofi, Lena und Timo als Gelenk-Baukasten.
// Ein Spiel importiert diese Datei und meldet eigene Haltungen, Bewegungen, Gesichter und Zubehör
// in spiele/<spiel>/runde.js an. tests/runde-gesamt.test.mjs prüft jede Erweiterung an allen Kindern.

import "./gesichter.js";
import "./haltungen.js";
import "./bewegungen.js";
import "./kinder/ela.js";
import { pruefeBestand } from "./bestand.js";

export { meldeKind, meldeGesicht, meldeHaltung, meldeBewegung, meldeZubehoer, pruefeBestand, bestand } from "./bestand.js";
export { zeichne, labelFuer } from "./zeichne.js";
export { pose, ablauf } from "./pose.js";
export { steuere } from "./steuere.js";

pruefeBestand();
