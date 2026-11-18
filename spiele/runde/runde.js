// Die Runde: Ela, Kofi, Lena und Timo als Gelenk-Baukasten.
// Ein Spiel importiert diese Datei und meldet eigene Haltungen, Bewegungen, Gesichter und Zubehör
// in spiele/<spiel>/runde.js an. tests/runde-gesamt.test.mjs prüft jede Erweiterung an allen Kindern.

import "./gesichter.js";
import "./haltungen.js";
import "./bewegungen.js";
import "./luftzeichen.js";
import "./albern.js";
import "./rolli.js";
import "./zubehoer/zauberstab-umhang.js";
import "./zubehoer/lupenmuetze.js";
import "./zubehoer/schirm.js";
import "./zubehoer/roller.js";
import "./kinder/ela.js";
import "./kinder/kofi.js";
import "./kinder/lena.js";
import "./kinder/timo.js";
import { pruefeBestand } from "./bestand.js";

export { meldeKind, meldeGesicht, meldeHaltung, meldeBewegung, meldeZubehoer, meldeLuftzeichen, pruefeBestand, bestand } from "./bestand.js";
export { zeichne, labelFuer } from "./zeichne.js";
export { pose, ablauf } from "./pose.js";
export { steuere, zusammen } from "./steuere.js";

pruefeBestand();
