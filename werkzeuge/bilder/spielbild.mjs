#!/usr/bin/env node
// Spielbild eines Spiels (Christian, 2026-11-15): 2–3 Screenshots des echten Spiels gehen an Azure OpenAI
// (images/edits mit mehreren Eingangsbildern), zurück kommt ein plastisches, attraktives Querformatbild für die Karte
// auf der Startseite. Es zeigt das Spiel, wie es ist (Held, Spielfeld, Stimmung), nur schöner – ohne Schrift und Bedienung.
//
//   node werkzeuge/bilder/spielbild.mjs --spiel <spielordner> [<screenshot1.png> <screenshot2.png> [<screenshot3.png>]]
//     [--hinweis "<was das Bild zeigen soll>"]
//
// Ohne Screenshots nimmt das Werkzeug sie selbst auf (Playwright, stumm, NODE_PATH wie beim Prüfstand): das Spiel im
// Testbetrieb auf seiner ersten Lernstufe, je ein Bild mitten in der Wirkung zweier gelöster Aufgaben und eins in der
// nächsten Aufgabe. Ergänzt in spiele/spiele.json „bild“ nicht selbst – das macht der Bau bzw. die Steuerung.
//
// Ergebnis: <spielordner>/spielbild.webp (1536 × 1024), Verbrauch in <spielordner>/kosten.json (Posten bild),
// herkunft.json daneben. Zugang aus .env: AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, AZURE_OPENAI_IMAGE_DEPLOYMENT,
// AZURE_OPENAI_API_VERSION, optional AZURE_OPENAI_INPUT_FIDELITY (high hält Figur und Spielfeld nah an den Screenshots).
import { execFileSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { schreibeVerbrauch, usageAusAntwort } from "./erzeugen.mjs";

const hier = (p) => fileURLToPath(new URL(p, import.meta.url));

export const PROMPT = [
  "Create the key art (game card image) for a children's learning game, landscape format, based on the attached screenshots of the real game.",
  "Keep exactly what the game is: the same main character (same hair, clothes, face, hearing aids if present), the same playing field and objects, the same idea and colours of the learning material.",
  "Make it look plastic and attractive: soft three-dimensional, rounded shapes, gentle light and soft shadows, a little depth of field, like a polished illustration of a premium children's app – friendly, bright, calm, never scary.",
  "Show one lively moment of play (the character in motion, e.g. mid-jump), the playing field clearly recognisable.",
  "Absolutely no text, no letters, no words, no user interface, no buttons, no keypad, no logos. Digits only if they are part of the learning material itself, and then few and large.",
  "IMPORTANT: this image is only shown as a small thumbnail on a game card (about 300 pixels wide). Show only very few, large, simple elements: the character big and close, a short section of the playing field, a calm plain background. Leave out small objects, background scenery, fences, plants and fine details – everything must still read at thumbnail size.",
  "Nothing important at the very edges.",
].join(" ");

/** Nimmt drei Screenshots des Spiels auf (Testbetrieb, stumm): mitten in der Wirkung und in der nächsten Aufgabe. */
export async function nimmAuf(spielordner, ziel) {
  const { createRequire } = await import("node:module");
  const require = createRequire(import.meta.url);
  const { chromium } = require("playwright");
  const wurzel = hier("../..");
  const { starteServer } = await import(pathToFileURL(join(wurzel, "tests/browser/server.mjs")).href);
  const { starteStumm } = await import(pathToFileURL(join(wurzel, "tests/browser/stumm.mjs")).href);
  const rel = resolve(spielordner).slice(resolve(wurzel).length + 1);
  const server = await starteServer(wurzel);
  const url = `http://127.0.0.1:${server.address().port}/${rel}/index.html`;
  const browser = await starteStumm(chromium, {});
  const warte = (ms) => new Promise((r) => setTimeout(r, ms));
  const bilder = [];
  try {
    const k = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
    await k.addInitScript(() => { window.__LS_PRUEFEN__ = true; });
    const p = await k.newPage();
    await p.goto(`${url}?stufe=material`);
    const phase = () => p.evaluate(() => window.lsPruefen?.zustand().phase);
    const bisAufgabe = async () => { for (let i = 0; i < 400 && (await phase()) !== "aufgabe"; i++) await warte(150); };
    const loese = async () => {
      for (let i = 0; i < 12; i++) {
        const z = await p.evaluate(() => window.lsPruefen.richtigerZug());
        if (!z) break;
        await p.evaluate((zz) => window.lsPruefen.fuehreAus(zz), z);
        await warte(60);
        if ((await phase()) !== "aufgabe") break;
      }
    };
    await bisAufgabe();
    for (const [i, nach] of [[1, 650], [2, 1100]]) {
      await loese();
      await warte(nach);
      const b = join(ziel, `spielbild-${i}.png`);
      await p.screenshot({ path: b });
      bilder.push(b);
      await bisAufgabe();
    }
    const b = join(ziel, "spielbild-3.png");
    await p.screenshot({ path: b });
    bilder.push(b);
  } finally {
    await browser.close();
    server.close();
  }
  return bilder;
}

function leseArgumente(argv) {
  const a = { spiel: "", bilder: [], hinweis: "" };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--spiel") a.spiel = argv[++i];
    else if (argv[i] === "--hinweis") a.hinweis = argv[++i];
    else a.bilder.push(argv[i]);
  }
  if (!a.spiel || a.bilder.length > 4)
    throw new Error('Aufruf: node werkzeuge/bilder/spielbild.mjs --spiel <ordner> <bild1.png> <bild2.png> [<bild3.png>] [--hinweis "…"]');
  return a;
}

async function main() {
  const a = leseArgumente(process.argv.slice(2));
  if (!a.bilder.length) {
    const { mkdtempSync } = await import("node:fs");
    const { tmpdir } = await import("node:os");
    a.bilder = await nimmAuf(a.spiel, mkdtempSync(join(tmpdir(), "spielbild-")));
  }
  const env = Object.fromEntries(
    readFileSync(hier("../../.env"), "utf8").split("\n").map((z) => z.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/)).filter(Boolean)
      .map(([, k, v]) => [k, v.replace(/^["']|["']$/g, "")]),
  );
  const prompt = a.hinweis ? `${PROMPT}\n\nThis game: ${a.hinweis}` : PROMPT;
  const form = new FormData();
  for (const b of a.bilder) form.append("image[]", new Blob([readFileSync(b)], { type: "image/png" }), basename(b));
  form.append("prompt", prompt);
  form.append("size", "1536x1024");
  form.append("quality", "high");
  form.append("n", "1");
  if (env.AZURE_OPENAI_INPUT_FIDELITY) form.append("input_fidelity", env.AZURE_OPENAI_INPUT_FIDELITY);
  const url = `${env.AZURE_OPENAI_ENDPOINT.replace(/\/$/, "")}/openai/deployments/${env.AZURE_OPENAI_IMAGE_DEPLOYMENT}/images/edits?api-version=${env.AZURE_OPENAI_API_VERSION}`;
  const antwort = await fetch(url, { method: "POST", headers: { "api-key": env.AZURE_OPENAI_API_KEY }, body: form });
  const daten = await antwort.json();
  if (!antwort.ok) throw new Error(`Azure OpenAI ${antwort.status}: ${JSON.stringify(daten).slice(0, 600)}`);
  const png = join(resolve(a.spiel), "spielbild.png");
  const webp = join(resolve(a.spiel), "spielbild.webp");
  writeFileSync(png, Buffer.from(daten.data[0].b64_json, "base64"));
  execFileSync("cwebp", ["-quiet", "-q", "85", png, "-o", webp]);
  rmSync(png);
  try {
    schreibeVerbrauch({ spiel: a.spiel, ziel: webp, modell: env.AZURE_OPENAI_IMAGE_DEPLOYMENT, prompt: `${prompt}\n\nScreenshots: ${a.bilder.map((b) => basename(b)).join(", ")}`, usage: usageAusAntwort(daten) });
  } catch (e) {
    console.error(`Bild gespeichert, aber Kosten nicht eingetragen: ${e.message}`);
    process.exitCode = 1;
  }
  console.log(JSON.stringify({ ziel: webp, usage: daten.usage }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((e) => { console.error(String(e?.message ?? e)); process.exitCode = 1; });
}
