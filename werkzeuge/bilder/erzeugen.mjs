// Szenenbilder mit Azure OpenAI erzeugen (Stimmungsebene, docs/grundsaetze-bilder.md §11 A1–A6).
// Aufruf: node werkzeuge/bilder/erzeugen.mjs <ziel.png> "<Szene>"   (Basis-Prompt: basis-szene.txt)
// Zugang aus .env (nie ins Repo): AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, AZURE_OPENAI_IMAGE_DEPLOYMENT,
// AZURE_OPENAI_API_VERSION. Die Herkunft (A4) trägt der Aufrufer in herkunft.json neben dem Bild ein.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const hier = (p) => fileURLToPath(new URL(p, import.meta.url));
const env = Object.fromEntries(
  readFileSync(hier("../../.env"), "utf8").split("\n").map((z) => z.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/)).filter(Boolean)
    .map(([, k, v]) => [k, v.replace(/^["']|["']$/g, "")]),
);
const [ziel, szene] = process.argv.slice(2);
if (!ziel || !szene) throw new Error('Aufruf: node werkzeuge/bilder/erzeugen.mjs <ziel.png> "<Szene>"');
const basis = readFileSync(hier("basis-szene.txt"), "utf8").trim();
const prompt = `${basis}\n\nScene: ${szene}`;
const url = `${env.AZURE_OPENAI_ENDPOINT.replace(/\/$/, "")}/openai/deployments/${env.AZURE_OPENAI_IMAGE_DEPLOYMENT}/images/generations?api-version=${env.AZURE_OPENAI_API_VERSION}`;
const antwort = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json", "api-key": env.AZURE_OPENAI_API_KEY },
  body: JSON.stringify({ prompt, size: "1536x1024", quality: "high", n: 1 }),
});
const daten = await antwort.json();
if (!antwort.ok) throw new Error(`Azure OpenAI ${antwort.status}: ${JSON.stringify(daten).slice(0, 500)}`);
writeFileSync(ziel, Buffer.from(daten.data[0].b64_json, "base64"));
console.log(JSON.stringify({ ziel, modell: env.AZURE_OPENAI_IMAGE_DEPLOYMENT, prompt }, null, 2));
