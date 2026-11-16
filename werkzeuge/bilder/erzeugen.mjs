// Szenenbilder mit Azure OpenAI erzeugen (Stimmungsebene, docs/grundsaetze-bilder.md §11 A1–A6).
// Aufruf: node werkzeuge/bilder/erzeugen.mjs [--spiel <spielordner>] [--basis szene|foto|raum] <ziel.png> "<Szene>"
//   Basis-Prompt: basis-szene.txt (Vorgabe, gezeichnete Szene), basis-foto.txt (fotorealistisch, Sachgeschichten,
//   docs/geschichten.md) oder basis-raum.txt (gezeichnetes Raumbild, hochkant 1024 × 1536; seit 16.11. tragen die Räume Fotos mit --basis foto). --spiel darf auch der Ordner einer Geschichte sein (spiele/geschichten/<id>).
// Mit --spiel steht der Verbrauch (usage der API-Antwort) in <spielordner>/kosten.json und in herkunft.json neben dem Bild
// (docs/spielentwicklung.md §6); fehlt usage, endet der Lauf mit Exit 1. Ohne --spiel verhält sich das Werkzeug wie zuvor:
// kein kosten.json, keine herkunft.json, usage steht nur in der Ausgabe (fehlt sie, nur eine Warnung).
// Zugang aus .env (nie ins Repo): AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, AZURE_OPENAI_IMAGE_DEPLOYMENT,
// AZURE_OPENAI_API_VERSION. Weitere Angaben zur Herkunft (A4) trägt der Aufrufer in herkunft.json ein.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { trageEin } from "../kosten/kosten.mjs";

const hier = (p) => fileURLToPath(new URL(p, import.meta.url));

/** Zerlegt die Argumente: --spiel <ordner>, dann Ziel und Szene. */
export function leseArgumente(argv) {
  const rest = [];
  let spiel = "", basis = "szene";
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--spiel") {
      spiel = argv[++i] ?? "";
      if (!spiel) throw new Error("--spiel braucht einen Spielordner");
    } else if (argv[i] === "--basis") {
      basis = argv[++i] ?? "";
      if (!["szene", "foto", "raum"].includes(basis)) throw new Error("--basis ist szene, foto oder raum");
    } else rest.push(argv[i]);
  }
  const [ziel, szene] = rest;
  if (!ziel || !szene) throw new Error('Aufruf: node werkzeuge/bilder/erzeugen.mjs [--spiel <ordner>] [--basis szene|foto|raum] <ziel.png> "<Szene>"');
  return { ziel, szene, spiel, basis };
}

/** Verbrauch aus der API-Antwort (usage: input_tokens, output_tokens, …) als Zahlen; fehlt er, ist es ein Fehler. */
export function usageAusAntwort(daten) {
  const u = daten?.usage;
  if (!u || !Number.isInteger(u.input_tokens) || !Number.isInteger(u.output_tokens))
    throw new Error("Die Antwort enthält keine usage mit input_tokens und output_tokens; Kosten lassen sich nicht eintragen");
  return u;
}

/** Schreibt den Verbrauch in kosten.json des Spiels und herkunft.json neben dem Bild. */
export function schreibeVerbrauch({ spiel, ziel, modell, prompt, usage, datum = new Date().toISOString().slice(0, 10) }) {
  if (!spiel) return;   // wie zuvor: ohne --spiel schreibt das Werkzeug nur das Bild
  trageEin(spiel, {
    datum, phase: "bild", posten: "bild", modell, eingabe: usage.input_tokens, ausgabe: usage.output_tokens,
    einheit: "bilder", menge: 1, notiz: basename(ziel), usage,
  });
  const datei = join(dirname(ziel), "herkunft.json");
  const alt = existsSync(datei) ? JSON.parse(readFileSync(datei, "utf8")) : {};
  alt[basename(ziel)] = { datum, modell, prompt, usage };
  mkdirSync(dirname(ziel), { recursive: true });
  writeFileSync(datei, JSON.stringify(alt, null, 1) + "\n");
}

async function main() {
  const a = leseArgumente(process.argv.slice(2));
  const { ziel, szene, spiel } = a;
  const env = Object.fromEntries(
    readFileSync(hier("../../.env"), "utf8").split("\n").map((z) => z.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/)).filter(Boolean)
      .map(([, k, v]) => [k, v.replace(/^["']|["']$/g, "")]),
  );
  const basis = readFileSync(hier(`basis-${a.basis ?? "szene"}.txt`), "utf8").trim();
  const prompt = `${basis}\n\nScene: ${szene}`;
  const url = `${env.AZURE_OPENAI_ENDPOINT.replace(/\/$/, "")}/openai/deployments/${env.AZURE_OPENAI_IMAGE_DEPLOYMENT}/images/generations?api-version=${env.AZURE_OPENAI_API_VERSION}`;
  // Bei Ratenlimit (429) wartet das Werkzeug selbst und versucht es erneut (mehrere Bücher entstehen parallel).
  let antwort, daten;
  for (let versuch = 1; ; versuch++) {
    antwort = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": env.AZURE_OPENAI_API_KEY },
      // Fotos der Geschichten quadratisch (docs/geschichten.md: Bild links, Text rechts; Christian 2026-11-15)
      body: JSON.stringify({ prompt, size: a.basis === "foto" ? "1024x1024" : a.basis === "raum" ? "1024x1536" : "1536x1024", quality: "high", n: 1 }),
    });
    daten = await antwort.json();
    if (antwort.status !== 429 || versuch >= 8) break;
    const warte = Math.min(90, Number(antwort.headers.get("retry-after")) || 10 * versuch) + Math.random() * 5;
    console.error(`Ratenlimit, warte ${Math.round(warte)} s (Versuch ${versuch})`);
    await new Promise((ok) => setTimeout(ok, warte * 1000));
  }
  if (!antwort.ok) throw new Error(`Azure OpenAI ${antwort.status}: ${JSON.stringify(daten).slice(0, 500)}`);
  mkdirSync(dirname(ziel), { recursive: true }); // bezahltes Bild nie verlieren, weil der Ordner fehlt
  writeFileSync(ziel, Buffer.from(daten.data[0].b64_json, "base64"));
  const modell = env.AZURE_OPENAI_IMAGE_DEPLOYMENT;
  // Das Bild ist bezahlt und gespeichert; fehlt usage, nur melden statt es zu verwerfen.
  try {
    schreibeVerbrauch({ spiel, ziel, modell, prompt, usage: usageAusAntwort(daten) });
  } catch (e) {
    console.error(`Bild gespeichert, aber Kosten nicht eingetragen: ${e.message}`);
    if (spiel) process.exitCode = 1;
  }
  console.log(JSON.stringify({ ziel, modell, prompt, usage: daten.usage }, null, 2));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((e) => {
    console.error(String(e?.message ?? e));
    process.exitCode = 1;
  });
}
