#!/usr/bin/env node
// Foto einer Anleitung „Mit echten Dingen“ (docs/superpowers/specs/2026-11-16-echte-dinge-foto-design.md,
// docs/mit-echten-dingen.md „Foto der Anleitung“): Der Text der Grundform geht an den Bildgenerator
// (werkzeuge/bilder/erzeugen.mjs, Vorlage basis-echt.txt), zurück kommt ein quadratisches Foto der Dinge.
//
//   node werkzeuge/echte-dinge/foto.mjs <fach>/<datei>|<thema-id> … [--hinweis "<Schärfung>"] [--nur-szene]
//   node werkzeuge/echte-dinge/foto.mjs --alle [--parallel 6]     (jede freigegebene Anleitung ohne Foto)
//
// Grundform = „Am Tisch“, sonst die erste Form (Reihenfolge der Situationen). Mit geht: Name der Form, „Ihr braucht“,
// die Schritte. Nicht mit: Kern, Leichter/Schwerer und alles in Anführungszeichen (verleitet zu Schrift). Jede Ziffer und
// jedes Zahlwort wird „einige“ – das Foto zeigt keine zählbare Menge (Christian, 2026-11-16: „Bilder bleiben wahr“).
// --nur-szene gibt nur die Szene aus (kostet nichts).
//
// Ergebnis: spiele/mit-echten-dingen/<fach>/bilder/<datei>.webp, herkunft.json daneben, Kosten (Posten bild, mit
// thema) in spiele/mit-echten-dingen/kosten.json, im Kopf der Anleitung `foto: bilder/<datei>.webp` statt `bild: …`.
// Danach: Foto ansehen (Sichtprüfung), npm run echte-dinge.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { liesAnleitung } from "../../spiele/rahmen/markdown.js";
import { erzeuge } from "../bilder/erzeugen.mjs";
import { ORDNER, anleitungen, themenDerDatei } from "./verzeichnis.mjs";

const ZAHLWOERTER = ["null", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn", "elf",
  "zwölf", "dreizehn", "vierzehn", "fünfzehn", "sechzehn", "siebzehn", "achtzehn", "neunzehn", "zwanzig", "dreißig",
  "vierzig", "fünfzig", "hundert", "tausend", "paar", "dutzend", "beide", "beiden", "zweimal", "dreimal", "doppelt"];
const ORDNUNG = /(?<![\p{L}])(?:zweit|dritt|viert|fünft|sechst|siebt|neunt|zehnt|elft|zwölft|zwanzigst|hundertst)(e[rnms]?)(?![\p{L}])/giu;
const ZAHL = new RegExp(`(?<![\\p{L}])(?:\\d+(?:[.,]\\d+)?|${ZAHLWOERTER.join("|")})(?![\\p{L}])`, "giu");

/**
 * Entfernt Mengen und Gesprochenes aus einem Satz der Anleitung.
 * @param {string} s
 * @returns {string}
 */
export function ohneMengen(s) {
  return String(s)
    .replace(/\*\*/g, "")
    .replace(/„[^“]*“/g, "…")
    .replace(/"[^"]*"/g, "…")
    .replace(ORDNUNG, "weiter$1")
    .replace(/(?<![\p{L}])\d+\.(?=\s)/gu, "weitere")
    .replace(ZAHL, "einige")
    .replace(/(?:einige\s*(?:mal|plus|minus|durch|und|bis|oder|·|×|\+|−|-|=)\s*)+einige/giu, "einige")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Die Grundform einer Anleitung: „Am Tisch“, sonst die erste Form.
 * @param {ReturnType<typeof liesAnleitung>} l
 */
export function grundform(l) {
  return l.formen.find((f) => f.situation === "tisch") ?? l.formen[0];
}

/**
 * Die Szene für den Bildgenerator aus dem Text der Anleitung.
 * @param {string} text Markdown der Anleitung
 * @param {string} [hinweis]
 * @returns {string}
 */
export function szeneAus(text, hinweis = "") {
  const l = liesAnleitung(text);
  const f = grundform(l);
  if (!f) throw new Error("Die Anleitung hat keine Form");
  const absaetze = f.bloecke.flatMap((b) => (b.typ === "p" ? [b.text] : []));
  const braucht = absaetze.find((t) => /^Ihr braucht:?/.test(t))?.replace(/^Ihr braucht:?\s*/, "") ?? "";
  const schritte = f.bloecke.flatMap((b) => (b.typ === "ol" ? b.punkte : []));
  const ort = f.situation === "tisch" ? "at a table at home" : f.situation === "bewegung" ? "indoors, in a room, hallway or on stairs at home" : "outside, on a calm street, path or in a park";
  return [
    `A short game called „${ohneMengen(f.name)}“ (German instructions below), played ${ort}.`,
    "Photograph the things this game is played with, ready to play, as described here (quantities intentionally left open):",
    braucht ? `Material: ${ohneMengen(braucht)}` : "",
    schritte.length ? `What happens: ${schritte.map(ohneMengen).join(" ")}` : "",
    hinweis ? `Important: ${hinweis}` : "",
  ].filter(Boolean).join("\n");
}

/**
 * Kopf der Anleitung: `foto: <pfad>` statt `bild: …` (oder nach `fach:`).
 * @param {string} text
 * @param {string} pfad relativ zum Ordner des Fachs
 */
export function setzeFoto(text, pfad) {
  const ende = text.indexOf("\n---", 4);
  const kopf = text.slice(0, ende), rest = text.slice(ende);
  const zeile = `foto: ${pfad}`;
  if (/^foto:.*$/m.test(kopf)) return kopf.replace(/^foto:.*$/m, zeile) + rest;
  if (/^bild:.*$/m.test(kopf)) return kopf.replace(/^bild:.*$/m, zeile) + rest;
  return kopf.replace(/^(fach:.*)$/m, `$1\n${zeile}`) + rest;
}

/** @param {string} wahl `<fach>/<datei>` oder eine Thema-Id */
export function findeAnleitung(wahl, liste = anleitungen()) {
  const a = liste.find((x) => `${x.fach}/${x.thema}` === wahl)
    ?? liste.find((x) => x.thema === wahl)
    ?? liste.find((x) => themenDerDatei(liesAnleitung(x.text).kopf).includes(wahl));
  if (!a) throw new Error(`Keine Anleitung für ${wahl}`);
  return a;
}

/**
 * Erzeugt das Foto einer Anleitung, speichert es als WebP, trägt Herkunft und Kosten ein und setzt `foto:` im Kopf.
 * Alles nach dem Erzeugen läuft synchron: Mehrere Fotos dürfen im selben Prozess gleichzeitig entstehen, ohne dass
 * sich kosten.json oder herkunft.json gegenseitig überschreiben.
 * @param {{ fach: string, thema: string, pfad: string, text: string }} a
 * @param {string} [hinweis]
 */
export async function machFoto(a, hinweis = "") {
  const bilder = join(ORDNER, a.fach, "bilder");
  const png = join(bilder, `${a.thema}.png`), webp = join(bilder, `${a.thema}.webp`);
  const thema = themenDerDatei(liesAnleitung(a.text).kopf);
  await erzeuge({ ziel: png, szene: szeneAus(a.text, hinweis), spiel: ORDNER, basis: "echt", thema });
  execFileSync("cwebp", ["-quiet", "-q", "82", png, "-o", webp]);
  rmSync(png);
  const herkunftDatei = join(bilder, "herkunft.json");
  if (existsSync(herkunftDatei)) {
    const h = JSON.parse(readFileSync(herkunftDatei, "utf8"));
    if (h[`${a.thema}.png`]) {
      h[`${a.thema}.webp`] = { ...h[`${a.thema}.png`], ki: true, geprueft: "Sichtprüfung beim Erzeugen (foto.mjs)" };
      delete h[`${a.thema}.png`];
      writeFileSync(herkunftDatei, JSON.stringify(h, null, 1) + "\n");
    }
  }
  writeFileSync(a.pfad, setzeFoto(readFileSync(a.pfad, "utf8"), `bilder/${a.thema}.webp`));
  return webp;
}

async function main() {
  const argv = process.argv.slice(2);
  let hinweis = "", nurSzene = false, alle = false, parallel = 1;
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--hinweis") hinweis = argv[++i] ?? "";
    else if (argv[i] === "--nur-szene") nurSzene = true;
    else if (argv[i] === "--alle") alle = true;
    else if (argv[i] === "--parallel") parallel = Math.max(1, Number(argv[++i]) || 1);
    else rest.push(argv[i]);
  }
  const liste = anleitungen();
  // --alle: jede Anleitung ohne Foto, außer geparkten (erreichen die App nicht).
  const ziele = alle
    ? liste.filter((a) => { const k = liesAnleitung(a.text).kopf; return !k.foto && k.geparkt !== true; })
    : rest.map((w) => findeAnleitung(w, liste));
  if (!ziele.length) throw new Error('Aufruf: node werkzeuge/echte-dinge/foto.mjs <fach>/<datei>|<thema-id> … | --alle [--parallel N] [--hinweis "…"] [--nur-szene]');
  if (nurSzene) { for (const a of ziele) console.log(`# ${a.fach}/${a.thema}\n${szeneAus(a.text, hinweis)}\n`); return; }
  const offen = [...ziele];
  const fehler = [];
  await Promise.all(Array.from({ length: Math.min(parallel, offen.length) }, async () => {
    for (let a = offen.shift(); a; a = offen.shift()) {
      try { console.log(`fertig ${await machFoto(a, hinweis)}`); }
      catch (e) { fehler.push(`${a.fach}/${a.thema}: ${e?.message ?? e}`); console.error(`FEHLER ${a.fach}/${a.thema}: ${e?.message ?? e}`); }
    }
  }));
  if (fehler.length) { console.error(`${fehler.length} ohne Foto:\n${fehler.join("\n")}`); process.exitCode = 1; }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((e) => { console.error(String(e?.message ?? e)); process.exitCode = 1; });
}
