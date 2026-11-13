#!/usr/bin/env node
// Anhör-Seite: alle Aufnahmen durchhören, als „passt“ markieren oder die Aussprache korrigieren.
//   npm run audio:anhoeren   → http://127.0.0.1:8766 (nur auf diesem Rechner erreichbar)
// „passt“ setzt gehoert in spiele/audio/index.json. Eine Korrektur landet in aussprache.json und wird sofort
// neu erzeugt, wenn AZURE_SPEECH_KEY gesetzt ist (sonst beim nächsten npm run audio).

import { execFile } from "node:child_process";
import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { extname, join, normalize, sep } from "node:path";
import { AUDIO, WURZEL, ladeAussprache, ladeIndex, lauf, speichereAussprache, speichereIndex } from "./erzeugen.mjs";
import { sammle } from "./texte.mjs";
import { holeSchluessel } from "./azure.mjs";

const PORT = Number(process.env.PORT ?? 8766);
const SEITE = join(WURZEL, "werkzeuge", "audio", "anhoeren.html");
const TYPEN = { ".mp3": "audio/mpeg", ".wav": "audio/wav", ".ogg": "audio/ogg" };

// Schreibzugriffe nacheinander, damit sich zwei Klicks nicht gegenseitig die Dateien überschreiben.
let kette = Promise.resolve();
/** @template T @param {() => Promise<T> | T} f @returns {Promise<T>} */
const nacheinander = (f) => {
  const p = kette.then(f);
  kette = p.catch(() => {});
  return p;
};

function texte() {
  const index = ladeIndex();
  const korrektur = ladeAussprache().texte ?? {};
  const { eintraege } = sammle(WURZEL);
  const quellen = new Map(eintraege.map((e) => [e.schluessel, e]));
  return {
    stimme: index.stimme,
    schluessel: !!process.env.AZURE_SPEECH_KEY,
    texte: Object.entries(index.texte).map(([schluessel, t]) => ({
      schluessel,
      text: quellen.get(schluessel)?.text ?? schluessel.replace(/^[^|]*\|/, ""),
      variante: quellen.get(schluessel)?.variante ?? "",
      quellen: quellen.get(schluessel)?.quellen ?? [],
      url: `/audio/${t.datei}?v=${t.h ?? "hand"}`,
      gehoert: !!t.gehoert,
      hand: !!t.hand,
      sprich: korrektur[schluessel]?.sprich ?? "",
    })),
  };
}

/**
 * Nur JSON von der eigenen Seite: Content-Type application/json erzwingt bei fremden Seiten im Browser
 * eine CORS-Vorabfrage, die dieser Server nie erlaubt; Origin muss die eigene Adresse sein.
 * @param {import("node:http").IncomingMessage} req
 */
async function koerper(req) {
  const herkunft = req.headers.origin;
  if (herkunft && herkunft !== `http://127.0.0.1:${PORT}`) throw new Error("Fremde Herkunft");
  if (!String(req.headers["content-type"] ?? "").startsWith("application/json")) throw new Error("Nur JSON");
  let s = "";
  for await (const teil of req) s += teil;
  return JSON.parse(s || "{}");
}

/** Schlüssel nur als eigener Eintrag des Index, nie __proto__ und Co. */
function pruefeSchluessel(schluessel, index) {
  if (typeof schluessel !== "string" || !Object.hasOwn(index.texte, schluessel)) throw new Error("Unbekannter Text");
  return schluessel;
}

/** @param {import("node:http").ServerResponse} res */
const antworte = (res, status, daten, typ = "application/json; charset=utf-8") => {
  res.writeHead(status, { "Content-Type": typ, "Cache-Control": "no-store" });
  res.end(typ.startsWith("application/json") ? JSON.stringify(daten) : daten);
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", "http://localhost");
    if (req.method === "GET" && url.pathname === "/") return antworte(res, 200, readFileSync(SEITE), "text/html; charset=utf-8");
    if (req.method === "GET" && url.pathname === "/api/texte") return antworte(res, 200, texte());

    if (req.method === "GET" && url.pathname.startsWith("/audio/")) {
      const pfad = normalize(join(AUDIO, decodeURIComponent(url.pathname.slice("/audio/".length))));
      if (!pfad.startsWith(AUDIO + sep) || !existsSync(pfad)) return antworte(res, 404, { fehler: "nicht gefunden" });
      res.writeHead(200, { "Content-Type": TYPEN[extname(pfad)] ?? "application/octet-stream" });
      return res.end(readFileSync(pfad));
    }

    if (req.method === "POST" && url.pathname === "/api/gehoert") {
      const { schluessel, gehoert } = await koerper(req);
      await nacheinander(() => {
        const index = ladeIndex();
        index.texte[pruefeSchluessel(schluessel, index)].gehoert = !!gehoert;
        speichereIndex(index);
      });
      return antworte(res, 200, { ok: true });
    }

    if (req.method === "POST" && url.pathname === "/api/korrektur") {
      const { schluessel, sprich } = await koerper(req);
      const meldung = await nacheinander(async () => {
        pruefeSchluessel(schluessel, ladeIndex());
        const a = ladeAussprache();
        a.texte ??= {};
        const neu = String(sprich ?? "").trim();
        if (neu) a.texte[schluessel] = { ...a.texte[schluessel], sprich: neu };
        else if (a.texte[schluessel]) {
          delete a.texte[schluessel].sprich;
          if (!Object.keys(a.texte[schluessel]).length) delete a.texte[schluessel];
        }
        speichereAussprache(a);
        if (!process.env.AZURE_SPEECH_KEY) return "Korrektur gespeichert. Erzeugt wird sie mit npm run audio (AZURE_SPEECH_KEY fehlt hier).";
        const { bericht } = await lauf();
        if (bericht.fehler) throw new Error(bericht.fehler);
        return `Neu erzeugt: ${bericht.neu}`;
      });
      return antworte(res, 200, { ok: true, meldung });
    }

    antworte(res, 404, { fehler: "nicht gefunden" });
  } catch (e) {
    antworte(res, 500, { fehler: String(/** @type {any} */ (e)?.message ?? e) });
  }
});

holeSchluessel(JSON.parse(readFileSync(join(WURZEL, "werkzeuge", "audio", "einstellungen.json"), "utf8")));
server.listen(PORT, "127.0.0.1", () => {
  const adresse = `http://127.0.0.1:${PORT}`;
  console.log(`Anhören: ${adresse}   (beenden mit Ctrl+C)`);
  if (!process.env.AZURE_SPEECH_KEY) console.log("Kein Azure-Schlüssel: Korrekturen werden gespeichert, aber erst mit npm run audio erzeugt.");
  if (process.platform === "darwin" && !process.env.NICHT_OEFFNEN) execFile("open", [adresse]);
});
