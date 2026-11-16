// Browser-Prüfung M08 Stellentafel (Review Christian 2026-11-16): Die Einführung ist eine kleine Geschichte, und die
// Hilfe wirkt in ihr – sie sagt den Schritt noch einmal, nicht nur „Hilfe“ (wie M06). Kein Teil von `npm test`:
// braucht Playwright und installierte Browser (Chromium, WebKit).
//
//   NODE_PATH=/private/tmp/claude-501/pw/node_modules node tests/browser/m08.spec.mjs
//
// Geprüft in beiden Browsern, mit und ohne Ton (ohne Ton steht jeder Satz als Blase und bleibt eine Lesezeit):
// - Im Schritt „Tippe die Eins und die Drei.“ sagt die Hilfe genau diesen Satz.
// - Mit den Zügen im Sonnenring (das Kind tippt selbst) endet die Einführung in der ersten Aufgabe.
// - In einer Minusaufgabe zeigt „Anleitung“ das Beispiel „Zum Beispiel dreizehn minus zehn.“
// - Keine Seitenfehler.

import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { starteServer } from "./server.mjs";
import { starteStumm } from "./stumm.mjs";

const require = createRequire(import.meta.url);
const { chromium, webkit } = require("playwright");
const WURZEL = resolve(fileURLToPath(import.meta.url), "../../..");
const FRIST_MS = 120000;

const server = await starteServer(WURZEL);
const basis = `http://127.0.0.1:${server.address().port}/spiele/mathe/m08-stellentafel/index.html`;
const warte = (/** @type {number} */ ms) => new Promise((r) => setTimeout(r, ms));
let rot = 0;
const pruefe = (/** @type {boolean} */ ok, /** @type {string} */ was) => {
  console.log(`${ok ? "grün" : "ROT "}  ${was}`);
  if (!ok) rot++;
};

for (const [name, typ] of [["chromium", chromium], ["webkit", webkit]]) {
  const browser = await starteStumm(typ, {});
  try {
    for (const ton of [true, false]) {
      const k = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      await k.addInitScript(() => { window.__LS_PRUEFEN__ = true; });
      const p = await k.newPage();
      const fehler = [];
      p.on("pageerror", (e) => fehler.push(String(e)));
      const was = `${name}, ${ton ? "mit Ton" : "ohne Ton"}`;
      await p.goto(`${basis}?einfuehrung&pruefen`);
      if (!ton) await p.locator("#leiste .tonknopf").click();
      const zustand = () => p.evaluate(() => window.lsPruefen?.zustand());
      const blase = () => p.evaluate(() => /** @type {any} */ (document.getElementById("blase")).text);
      // Bis zum ersten Tastenschritt: richtigerZug ist dann die Eins im Sonnenring.
      const t0 = Date.now();
      while (Date.now() - t0 < FRIST_MS && !(await p.evaluate(() => window.lsPruefen?.richtigerZug()))) await warte(200);
      await p.locator("#hilfe ls-knopf").click();
      let gesagt = "";
      for (let i = 0; i < 40 && gesagt !== "Tippe die Eins und die Drei."; i++) { await warte(150); gesagt = await blase(); }
      pruefe(gesagt === "Tippe die Eins und die Drei.", `${was}: Hilfe im Tastenschritt sagt „${gesagt}“`);
      // Das Kind tippt, was im Sonnenring liegt, bis die erste Aufgabe dasteht.
      while (Date.now() - t0 < FRIST_MS && (await zustand())?.phase !== "aufgabe") {
        const z = await p.evaluate(() => window.lsPruefen.richtigerZug());
        if (z) await p.evaluate((zz) => window.lsPruefen.fuehreAus(zz), z);
        await warte(200);
      }
      pruefe((await zustand())?.phase === "aufgabe", `${was}: Einführung endet in der ersten Aufgabe (${Math.round((Date.now() - t0) / 1000)} s)`);
      if (ton) {
        // Fehlversuch, dann sofort Hilfe: der Auftrag „Versuch es noch einmal.“ und andere alte Sätze fallen weg,
        // die Hilfe spricht ihren Satz (wie M06).
        const antwort = String(await p.evaluate(() => window.lsPruefen.zustand().aufgabe)).includes("minus") ? null : "41";
        if (antwort) {
          for (const z of antwort) await p.locator("#tastatur button", { hasText: new RegExp(`^${z}$`) }).first().click();
          await p.locator("#fertig").click();
          await warte(1200);
          await p.locator("#hilfe ls-knopf").click();
          const nachHilfe = [];
          for (let i = 0; i < 40; i++) { const t = await blase(); if (nachHilfe.at(-1) !== t) nachHilfe.push(t); await warte(150); }
          pruefe(!nachHilfe.includes("Versuch es noch einmal.") && /^Eine Stange und/.test(nachHilfe.at(-1) ?? ""),
            `${was}: nach Fehlversuch und Hilfe nur der Hilfesatz (${nachHilfe.join(" | ")})`);
        }
      }
      pruefe(fehler.length === 0, `${was}: keine Seitenfehler ${fehler.join(" | ")}`);
      await k.close();
    }
    // Minus: Die Vorschau bringt zwei Plus-, dann Minusaufgaben (VORSCHAU in spiel.js). In der ersten Minusaufgabe ruft
    // „Anleitung“ die Einführung in der Minus-Fassung auf; ihr Beispiel ist 13 − 10.
    const k = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    await k.addInitScript(() => { window.__LS_PRUEFEN__ = true; });
    const p = await k.newPage();
    await p.goto(`${basis}?pruefen`);
    const t0 = Date.now();
    const zustand = () => p.evaluate(() => window.lsPruefen?.zustand());
    while (Date.now() - t0 < FRIST_MS && !String((await zustand())?.aufgabe ?? "").startsWith("minus")) {
      const z = await p.evaluate(() => window.lsPruefen?.richtigerZug());
      if (z) await p.evaluate((zz) => window.lsPruefen.fuehreAus(zz), z);
      await warte(250);
    }
    await warte(800);
    await p.locator("#anleitung").click();
    const saetze = new Set();
    const t1 = Date.now();
    while (Date.now() - t1 < 40000 && !saetze.has("Zum Beispiel dreizehn minus zehn.") && !saetze.has("Zum Beispiel zehn plus drei.")) {
      saetze.add(await p.evaluate(() => /** @type {any} */ (document.getElementById("blase")).text));
      await warte(150);
    }
    pruefe(saetze.has("Zum Beispiel dreizehn minus zehn."), `${name}: Anleitung in einer Minusaufgabe zeigt 13 − 10`);
    await k.close();
  } finally {
    await browser.close();
  }
}
server.close();
console.log(rot ? `${rot} rot` : "alles grün");
process.exit(rot ? 1 : 0);
