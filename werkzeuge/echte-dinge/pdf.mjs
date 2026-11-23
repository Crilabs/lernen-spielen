#!/usr/bin/env node
// Sammel-PDF „Mit echten Dingen“: druckt die Blätter mehrerer Themen in eine PDF-Datei, genau so, wie der Knopf „PDF“
// im Lernplan des Elternbereichs sie druckt (spiele/rahmen/echte-dinge-druck.js, docs/mit-echten-dingen.md „PDF je
// Thema“). Je Thema lädt ein Headless-Chromium die Anleitung über das Verzeichnis, ruft druckeAnleitung() auf (das
// Blatt, die Schriftstufe „eng“ bei Überlänge) und speichert statt des Druckdialogs ein PDF; pdfunite fügt die Blätter
// in der angegebenen Reihenfolge zusammen.
//
// Aufruf (Playwright liegt außerhalb des Repos, siehe tests/browser/rahmen.spec.mjs):
//   NODE_PATH=/private/tmp/claude-501/pw/node_modules node werkzeuge/echte-dinge/pdf.mjs \
//     --ziel ~/Downloads/plus-bis-100.pdf <thema-id> [<thema-id> …] [--entwurf]
// Themen ohne freigegebene Anleitung werden übersprungen und gemeldet (mit --entwurf zählen auch Entwürfe).
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { starteServer } from "../../tests/browser/server.mjs";
import { starteStumm } from "../../tests/browser/stumm.mjs";

const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const SEITE = "/spiele/__echte-dinge-pdf.html"; // gibt es nicht im Repo; Playwright liefert sie aus (route)
const HTML = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"><title>Mit echten Dingen</title>
<link rel="stylesheet" href="rahmen/seite.css"></head><body></body></html>`;

/** @param {string[]} argv */
function leseAufruf(argv) {
  const a = { ziel: "", themen: /** @type {string[]} */ ([]), entwurf: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--ziel") a.ziel = resolve(argv[++i] ?? "");
    else if (argv[i] === "--entwurf") a.entwurf = true;
    else a.themen.push(argv[i]);
  }
  if (!a.ziel || !a.themen.length) throw new Error("Aufruf: pdf.mjs --ziel <datei.pdf> <thema-id> [<thema-id> …] [--entwurf]");
  return a;
}

/** Name je Thema aus dem Lernplan (wie im Elternbereich: Überschrift des Blatts). */
function lernplanNamen() {
  const plan = JSON.parse(readFileSync(join(WURZEL, "spiele/lernplan.json"), "utf8"));
  const themen = Array.isArray(plan.themen) ? plan.themen : Object.values(plan.themen);
  return new Map(themen.map((/** @type {any} */ t) => [t.id, t.name]));
}

async function main() {
  const a = leseAufruf(process.argv.slice(2));
  const namen = lernplanNamen();
  const require = createRequire(import.meta.url);
  const { chromium } = require("playwright");
  const server = await starteServer(WURZEL);
  const basis = `http://127.0.0.1:${/** @type {any} */ (server.address()).port}`;
  const browser = await starteStumm(chromium, {});
  const ordner = mkdtempSync(join(tmpdir(), "echte-dinge-pdf-"));
  /** @type {string[]} */ const blaetter = [];
  /** @type {string[]} */ const fehlen = [];
  try {
    const seite = await browser.newPage();
    await seite.route(`**${SEITE}*`, (r) => r.fulfill({ contentType: "text/html; charset=utf-8", body: HTML }));
    seite.on("pageerror", (e) => console.error("Seitenfehler:", e.message));
    for (const thema of a.themen) {
      // je Thema neu laden: druckeAnleitung setzt Titel und Blatt; so bleibt nichts vom vorigen Thema stehen
      await seite.goto(basis + SEITE + (a.entwurf ? "?entwurf" : ""));
      const ok = await seite.evaluate(async ({ thema, name }) => {
        /** @type {any} */ (window).print = () => {}; // statt Druckdialog: das PDF macht Playwright
        const ed = await import("./rahmen/echte-dinge.js");
        const { druckeAnleitung } = await import("./rahmen/echte-dinge-druck.js");
        const ort = await ed.findeAnleitung({ thema });
        const anleitung = ort ? await ed.ladeAnleitung(ort.fach, ort.thema) : null;
        if (!ort || !anleitung) return false;
        const foto = ed.fotoUrl({ foto: `${ort.fach}/${anleitung.kopf.foto ?? ""}` });
        return druckeAnleitung({ name, titel: anleitung.titel ?? "", fach: ort.fach, foto, formen: anleitung.formen });
      }, { thema, name: namen.get(thema) ?? thema });
      if (!ok) { fehlen.push(thema); continue; }
      const datei = join(ordner, `${String(blaetter.length).padStart(2, "0")}-${thema}.pdf`);
      await seite.pdf({ path: datei, preferCSSPageSize: true, printBackground: false });
      blaetter.push(datei);
      console.log(`✓ ${thema}`);
    }
  } finally {
    await browser.close();
    server.close();
  }
  try {
    if (!blaetter.length) throw new Error("Keine Anleitung gefunden – kein PDF.");
    execFileSync("pdfunite", [...blaetter, a.ziel]);
    console.log(`${blaetter.length} Blätter → ${a.ziel}`);
    if (fehlen.length) console.log(`Ohne Anleitung (übersprungen): ${fehlen.join(", ")}`);
  } finally {
    rmSync(ordner, { recursive: true, force: true });
  }
}

main().catch((e) => { console.error(e?.message ?? e); process.exit(1); });
