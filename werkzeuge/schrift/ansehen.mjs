#!/usr/bin/env node
// Prüfseite der Schriftvorlagen (Spec 2026-11-14-schriftvorlagen, 5.7): alle Formen auf der Lineatur ansehen,
// vorschreiben lassen, freigeben oder eine Anmerkung hinterlassen.
//   npm run schrift:ansehen   → http://127.0.0.1:8767 (nur auf diesem Rechner erreichbar)
// „Passt“ setzt `freigegeben` in spiele/schrift/vorlagen/liste.json, „Stimmt nicht“ schreibt die Notiz nach
// werkzeuge/schrift/anmerkungen.json (Claude arbeitet sie in der nächsten Sitzung ab).

import { createServer } from "node:http";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { gibFrei, merkeAnmerkung, schreibeListe } from "./freigabe.mjs";

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SPIELE = join(WURZEL, "spiele");
const LISTE = join(SPIELE, "schrift", "vorlagen", "liste.json");
const ANMERKUNGEN = join(WURZEL, "werkzeuge", "schrift", "anmerkungen.json");
const SEITE = join(WURZEL, "werkzeuge", "schrift", "ansehen.html");
const PORT = Number(process.env.PORT ?? 8767);
const TYPEN = {
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".css": "text/css; charset=utf-8",
  ".woff2": "font/woff2",
};

// Schreibzugriffe nacheinander, damit sich zwei Klicks nicht gegenseitig die Dateien überschreiben.
let kette = Promise.resolve();
/** @template T @param {() => Promise<T> | T} f @returns {Promise<T>} */
const nacheinander = (f) => {
  const p = kette.then(f);
  kette = p.catch(() => {});
  return /** @type {Promise<T>} */ (p);
};

const heute = () => new Date().toLocaleDateString("sv-SE");
const ladeListe = () => JSON.parse(readFileSync(LISTE, "utf8"));
const ladeAnmerkungen = () => (existsSync(ANMERKUNGEN) ? JSON.parse(readFileSync(ANMERKUNGEN, "utf8")) : { eintraege: [] });

/** Nur JSON von der eigenen Seite (wie die Anhör-Seite). @param {import("node:http").IncomingMessage} req */
async function koerper(req) {
  const herkunft = req.headers.origin;
  if (herkunft && herkunft !== `http://127.0.0.1:${PORT}`) throw new Error("Fremde Herkunft");
  if (!String(req.headers["content-type"] ?? "").startsWith("application/json")) throw new Error("Nur JSON");
  let s = "";
  for await (const teil of req) s += teil;
  return JSON.parse(s || "{}");
}

/** @param {import("node:http").ServerResponse} res */
const antworte = (res, status, daten, typ = "application/json; charset=utf-8") => {
  res.writeHead(status, { "Content-Type": typ, "Cache-Control": "no-store" });
  // Dateien (Buffer) gehen unverändert hinaus, auch wenn sie JSON sind; nur Objekte werden serialisiert.
  res.end(Buffer.isBuffer(daten) || typeof daten === "string" ? daten : JSON.stringify(daten));
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", "http://localhost");
    if (req.method === "GET" && url.pathname === "/") return antworte(res, 200, readFileSync(SEITE), "text/html; charset=utf-8");
    if (req.method === "GET" && url.pathname === "/api/stand")
      return antworte(res, 200, { liste: ladeListe(), anmerkungen: ladeAnmerkungen() });
    if (req.method === "GET" && url.pathname.startsWith("/spiele/")) {
      const pfad = normalize(join(SPIELE, decodeURIComponent(url.pathname.slice("/spiele/".length))));
      if (!pfad.startsWith(SPIELE + sep) || !existsSync(pfad) || !statSync(pfad).isFile())
        return antworte(res, 404, { fehler: "nicht gefunden" });
      const typ = TYPEN[/** @type {keyof typeof TYPEN} */ (extname(pfad))] ?? "application/octet-stream";
      return antworte(res, 200, readFileSync(pfad), typ);
    }
    if (req.method === "POST" && url.pathname === "/api/freigabe") {
      const { satz, zeichen, passt } = await koerper(req);
      await nacheinander(() => writeFileSync(LISTE, schreibeListe(gibFrei(ladeListe(), satz, zeichen, passt ? heute() : null))));
      return antworte(res, 200, { ok: true });
    }
    if (req.method === "POST" && url.pathname === "/api/anmerkung") {
      const { satz, zeichen, text } = await koerper(req);
      await nacheinander(() =>
        writeFileSync(ANMERKUNGEN, `${JSON.stringify(merkeAnmerkung(ladeAnmerkungen(), satz, zeichen, text, heute()), null, 2)}\n`),
      );
      return antworte(res, 200, { ok: true });
    }
    antworte(res, 404, { fehler: "nicht gefunden" });
  } catch (e) {
    antworte(res, 500, { fehler: String(/** @type {any} */ (e)?.message ?? e) });
  }
});

server.listen(PORT, "127.0.0.1", () => console.log(`Prüfseite der Schriftvorlagen: http://127.0.0.1:${PORT}`));
