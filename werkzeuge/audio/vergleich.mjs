#!/usr/bin/env node
// Stimmen-Vergleich: dieselben Probesätze mit mehreren deutschen Azure-Stimmen, als Seite zum Anhören.
//   npm run audio:vergleich   → werkzeuge/audio/vergleich/index.html (nicht versioniert)
// Die gewählte Stimme kommt danach in einstellungen.json (stimme, ordner).

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { azure, holeSchluessel } from "./azure.mjs";
import { ssml, xml } from "./ssml.mjs";

const KANDIDATEN = [
  "de-DE-Seraphina:DragonHDLatestNeural",
  "de-DE-Florian:DragonHDLatestNeural",
  "de-DE-SeraphinaMultilingualNeural",
  "de-DE-KatjaNeural",
  "de-DE-AmalaNeural",
  "de-DE-ConradNeural",
  "de-DE-KillianNeural",
  "de-DE-GiselaNeural",
];

// Typische Sätze der Spiele, dazu Stolpersteine: Wortstücke, lange Wörter, Zahlen.
const PROBEN = [
  { text: "Das Pony frisst Gras. Die Katze schläft auf dem Sofa." },
  { text: "Ein Hund. Den schreibt man groß." },
  { text: "ein Hund? eine Hund? Hör mal, ob das passt." },
  { text: "Pony … frisst?" },
  { text: "Schmet … terling?" },
  { text: "Der Schmetterling sitzt auf der Sonnenblume." },
  { text: "Hör noch mal hin. Der Hund bellt.", variante: "diktat" },
  { text: "Sieben mal acht ist sechsundfünfzig." },
  { text: "7 mal 8 ist 56." },
  { text: "Für heute ist Schluss. Bis morgen!" },
];

const hier = dirname(fileURLToPath(import.meta.url));
const ziel = join(hier, "vergleich");
const einstellungen = JSON.parse(readFileSync(join(hier, "einstellungen.json"), "utf8"));
const schluessel = holeSchluessel(einstellungen);
const region = process.env.AZURE_SPEECH_REGION ?? einstellungen.region;
const synth = azure({ schluessel, region, format: einstellungen.format });

// Welche Kandidaten gibt es in dieser Region?
const liste = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/voices/list`, {
  headers: { "Ocp-Apim-Subscription-Key": /** @type {string} */ (schluessel) },
});
if (!liste.ok) throw new Error(`Stimmenliste: Azure ${liste.status}`);
const deutsch = (await liste.json()).filter((v) => v.Locale === "de-DE").map((v) => v.ShortName);
console.log(`Deutsche Stimmen in ${region}: ${deutsch.length}`);
const stimmen = KANDIDATEN.filter((s) => deutsch.includes(s));
const fehlen = KANDIDATEN.filter((s) => !deutsch.includes(s));
if (fehlen.length) console.log("Nicht in dieser Region: " + fehlen.join(", "));

mkdirSync(ziel, { recursive: true });
const zeilen = [];
for (const [i, p] of PROBEN.entries()) {
  const zellen = [];
  for (const stimme of stimmen) {
    const datei = `${stimme.replace(/[^a-z0-9]+/gi, "-")}-${i}.mp3`;
    writeFileSync(join(ziel, datei), await synth(ssml(p, { ...einstellungen, stimme })));
    zellen.push(`<td><audio controls preload="none" src="${datei}"></audio></td>`);
    process.stdout.write(".");
  }
  zeilen.push(`<tr><th>${xml(p.text)}${p.variante ? ` <small>(${p.variante})</small>` : ""}</th>${zellen.join("")}</tr>`);
}
writeFileSync(
  join(ziel, "index.html"),
  `<!doctype html><meta charset="utf-8"><title>Stimmen-Vergleich</title>
<style>body{font:15px system-ui;margin:16px}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:6px;text-align:left;vertical-align:middle}
th{max-width:260px;font-weight:500}thead th{font-size:12px;writing-mode:vertical-rl;transform:rotate(180deg);max-width:none}audio{width:150px}</style>
<h1>Stimmen-Vergleich (${xml(region)})</h1><p>Gleiche Sätze, verschiedene Stimmen. Die gewählte Stimme kommt in <code>werkzeuge/audio/einstellungen.json</code>.</p>
<table><thead><tr><th></th>${stimmen.map((s) => `<th>${xml(s)}</th>`).join("")}</tr></thead><tbody>${zeilen.join("\n")}</tbody></table>`,
);
console.log(`\n${join(ziel, "index.html")}`);
