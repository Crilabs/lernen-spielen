#!/usr/bin/env node
// Screenshot einer Seite, stumm (tests/browser/stumm.mjs). Für alles, was man sich beim Bauen ansehen will: Bühne,
// Zwischenstand, eine statische Bildtafel. Eigene Skripte mit einem direkten Browserstart spielen jeden Ton über die
// Lautsprecher (Christian, 2026-11-16) und sind im Repo per Hook gesperrt (.claude/hooks/nur-stumme-browser.mjs).
//
//   NODE_PATH=/private/tmp/claude-501/pw/node_modules node werkzeuge/spielbau/bildschirm.mjs <seite> <bild.png>
//     [--groesse 1280x800] [--warte 1500] [--browser chromium|webkit] [--stufe material|vorstellung|kopf]
//     [--bis-aufgabe] [--ganz]
//
// <seite>: Datei im Repo (z. B. spiele/grammatik/g09-…/index.html, wird über einen eigenen Server ausgeliefert),
// eine andere HTML-Datei (z. B. /tmp/tafel.html) oder eine http-URL.
// --bis-aufgabe: Testbetrieb (window.__LS_PRUEFEN__) und warten, bis lsPruefen die Phase „aufgabe“ meldet.
// --ganz: ganze Seite statt Ausschnitt.

import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { starteServer } from "../../tests/browser/server.mjs";
import { starteStumm } from "../../tests/browser/stumm.mjs";

const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const warte = (ms) => new Promise((r) => setTimeout(r, ms));

/** @param {string[]} argv */
export function leseAufruf(argv) {
  const a = { seite: null, bild: null, breite: 1280, hoehe: 800, warteMs: 1500, browser: "chromium", stufe: null, bisAufgabe: false, ganz: false };
  for (let i = 0; i < argv.length; i++) {
    const x = argv[i];
    if (x === "--groesse") {
      const m = String(argv[++i]).match(/^(\d+)x(\d+)$/);
      if (!m) throw new Error("--groesse braucht BxH, z. B. 1280x800");
      [a.breite, a.hoehe] = [Number(m[1]), Number(m[2])];
    } else if (x === "--warte") a.warteMs = Number(argv[++i]);
    else if (x === "--browser") a.browser = argv[++i];
    else if (x === "--stufe") a.stufe = argv[++i];
    else if (x === "--bis-aufgabe") a.bisAufgabe = true;
    else if (x === "--ganz") a.ganz = true;
    else if (x.startsWith("--")) throw new Error(`unbekannte Option ${x}`);
    else if (!a.seite) a.seite = x;
    else if (!a.bild) a.bild = x;
    else throw new Error(`zu viele Argumente: ${x}`);
  }
  if (!a.seite || !a.bild) throw new Error("Aufruf: bildschirm.mjs <seite> <bild.png> [--groesse BxH] [--warte ms] [--browser chromium|webkit] [--stufe s] [--bis-aufgabe] [--ganz]");
  if (!["chromium", "webkit"].includes(a.browser)) throw new Error("--browser chromium oder webkit");
  if (!Number.isFinite(a.warteMs) || a.warteMs < 0) throw new Error("--warte braucht Millisekunden");
  return a;
}

/** Adresse der Seite; startet für Dateien im Repo einen Server (wird zurückgegeben, damit er schließt). */
async function adresse(seite) {
  if (/^https?:\/\//.test(seite)) return { url: seite, server: null };
  const datei = resolve(seite);
  if (!datei.startsWith(WURZEL + sep)) return { url: pathToFileURL(datei).href, server: null };
  const server = await starteServer(WURZEL);
  const rel = datei.slice(WURZEL.length + 1).split(sep).join("/");
  return { url: `http://127.0.0.1:${/** @type {any} */ (server.address()).port}/${rel}`, server };
}

/** @param {ReturnType<typeof leseAufruf>} a */
export async function nimmBild(a) {
  const require = createRequire(import.meta.url);
  const typ = require("playwright")[a.browser];
  const { url, server } = await adresse(a.seite);
  const browser = await starteStumm(typ, {});
  try {
    const k = await browser.newContext({ viewport: { width: a.breite, height: a.hoehe } });
    if (a.bisAufgabe) await k.addInitScript(() => { /** @type {any} */ (window).__LS_PRUEFEN__ = true; });
    const p = await k.newPage();
    const ziel = new URL(url);
    if (a.stufe) ziel.searchParams.set("stufe", a.stufe);
    await p.goto(ziel.href);
    if (a.bisAufgabe) {
      for (let i = 0; i < 200; i++) {
        if ((await p.evaluate(() => /** @type {any} */ (window).lsPruefen?.zustand().phase)) === "aufgabe") break;
        await warte(150);
      }
    }
    await warte(a.warteMs);
    mkdirSync(dirname(resolve(a.bild)), { recursive: true });
    await p.screenshot({ path: a.bild, fullPage: a.ganz });
  } finally {
    await browser.close();
    server?.close();
  }
  return resolve(a.bild);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  try {
    console.log(await nimmBild(leseAufruf(process.argv.slice(2))));
  } catch (e) {
    console.error(`Fehler: ${/** @type {any} */ (e).message}`);
    process.exitCode = 1;
  }
}
