// Weltandeutungen für die Tore der Startseite, je Welt-id aus lernplan.json (Spec §5.2).
// Neue Andeutungen entstehen mit den Spielen: Datei <welt>.js mit Standard-Export (SVG-Fragment im Bogen
// 0 0 240 280, Boden bei y ≈ 230, Himmel darüber), hier eintragen.
import muellTrennen from "./muell-trennen.js";
import wieseUndHecke from "./wiese-und-hecke.js";

/** @type {Readonly<Record<string, string>>} */
export const ANDEUTUNGEN = Object.freeze({
  "muell-trennen": muellTrennen,
  "wiese-und-hecke": wieseUndHecke,
});
