// Eine Spiel-Erweiterung mit Fehler: bewegt die Beine, hat aber keine Rollstuhl-Fassung.
import { meldeHaltung } from "../../spiele/runde/bestand.js";

meldeHaltung({ id: "kaputt-kniebeuge", ansicht: "profil", winkel: { "bein-vorn": 30 } });
