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
  // Jeder Kontext bekommt einen frisch gestarteten Browser: WebKit stürzte im langen Lauf nach vielen Kontexten
  // gelegentlich ab („Target closed“), einzeln lief derselbe Block grün.
  /** @type {any[]} */
  const offen = [];
  const browser = {
    newContext: async (/** @type {any} */ o) => {
      const b = await starteStumm(typ, {});
      offen.push(b);
      const k = await b.newContext(o);
      // Mit dem Kontext geht auch sein Browser zu (sonst laufen viele WebKit-Prozesse gleichzeitig).
      const zu = k.close.bind(k);
      k.close = async () => { await zu(); await b.close().catch(() => {}); };
      return k;
    },
    close: async () => { for (const b of offen) await b.close().catch(() => {}); },
  };
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
    // Ohne Ton und mit „Bewegung reduzieren“ steht jeder Satz der Einführung eine Lesezeit lang da (Review 2026-11-16:
    // vorher sprang die Einführung vom Haken in 0,3 s zur ersten Aufgabe). Und die Hilfe wiederholt auch einen späten
    // Satz der Einführung (vorher tat sie nach dem Haken nichts).
    {
      const k = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
      await k.addInitScript(() => { window.__LS_PRUEFEN__ = true; });
      const p = await k.newPage();
      await p.goto(`${basis}?einfuehrung&pruefen`);
      await p.locator("#leiste .tonknopf").click();
      await p.evaluate(() => {
        const b = /** @type {any} */ (document.getElementById("blase"));
        window.__saetze = [];
        const sage = b.sage.bind(b);
        b.sage = (/** @type {string} */ t, /** @type {any} */ o) => { window.__saetze.push(t); return sage(t, o); };
      });
      const zustand = () => p.evaluate(() => window.lsPruefen?.zustand());
      const t0 = Date.now();
      let haken = 0;
      let hilfeGetippt = false;
      while (Date.now() - t0 < FRIST_MS && (await zustand())?.phase !== "aufgabe") {
        const z = await p.evaluate(() => window.lsPruefen.richtigerZug());
        if (z) {
          if (JSON.stringify(z).includes("fertig")) haken = Date.now();
          await p.evaluate((zz) => window.lsPruefen.fuehreAus(zz), z);
        }
        const saetze = await p.evaluate(() => window.__saetze);
        if (!hilfeGetippt && saetze.at(-1) === "Passt eine Zahl nicht, siehst du es.") {
          hilfeGetippt = true;
          await p.locator("#hilfe ls-knopf").click();
          await warte(400);
        }
        await warte(150);
      }
      const nachHaken = haken ? Date.now() - haken : 0;
      pruefe(nachHaken > 12000, `${name}, ohne Ton, Bewegung reduziert: nach dem Haken noch ${Math.round(nachHaken / 1000)} s Einführung (Sätze bleiben lesbar)`);
      const saetze = await p.evaluate(() => window.__saetze);
      pruefe(saetze.filter((t) => t === "Passt eine Zahl nicht, siehst du es.").length >= 2, `${name}: Hilfe nach dem Haken wiederholt den laufenden Satz`);
      await k.close();
    }
    // Wanderung (Christian 2026-11-16): Stellen tippen, Ziffern und Material wandern in die Tafel.
    for (const reduziert of [false, true]) {
      const k = await browser.newContext({ viewport: { width: 1280, height: 800 }, ...(reduziert ? { reducedMotion: "reduce" } : {}) });
      await k.addInitScript(() => { window.__LS_PRUEFEN__ = true; });
      const p = await k.newPage();
      const fehler = [];
      p.on("pageerror", (e) => fehler.push(String(e)));
      await p.goto(`${basis}?pruefen`);
      const zustand = () => p.evaluate(() => window.lsPruefen?.zustand());
      const was = `${name}${reduziert ? ", Bewegung reduziert" : ""}`;
      const t0 = Date.now();
      // Die Einführung (beim Start) zügig durchtippen, bis die erste Aufgabe dasteht.
      while (Date.now() - t0 < FRIST_MS && (await zustand())?.phase !== "aufgabe") {
        const z = await p.evaluate(() => window.lsPruefen?.richtigerZug());
        if (z) await p.evaluate((zz) => window.lsPruefen.fuehreAus(zz), z);
        await warte(200);
      }
      await warte(500);
      const taste = (/** @type {string} */ z) => p.locator("#tastatur button", { hasText: new RegExp(`^${z}$`) }).first().click();
      const aufgabe = String((await zustand())?.aufgabe);
      const e = Number(/plus:(\d)\+10/.exec(aufgabe)?.[1] ?? 0);
      pruefe(e > 0, `${was}: erste Aufgabe ist Plus (${aufgabe})`);
      // Falsch in den Einern: nur der Einer-Platz wackelt, die Zehner rasten ein.
      const falschE = String(e === 9 ? 8 : e + 1);
      await taste("1");
      await taste(falschE);
      await p.locator("#fertig").click();
      await warte(2600);
      const wackeln = await p.evaluate(() => ["z", "e"].filter((k) => document.getElementById(`platz-${k}`).classList.contains("passt-nicht")));
      pruefe(JSON.stringify(wackeln) === JSON.stringify(["e"]), `${was}: bei 1${falschE} wackelt nur der Einer-Platz (${wackeln.join(",")})`);
      // Korrigieren nur die Einer: Einer-Platz, richtige Ziffer, Haken.
      await p.locator("#platz-e").click();
      await taste(String(e));
      await p.locator("#fertig").click();
      // Die Endlage abwarten (bei reduzierter Bewegung sofort; die nächste Aufgabe räumt sie bald wieder ab).
      const lies = () => p.evaluate(() => ({
        z: document.querySelector("#platz-z .taefelchen")?.textContent,
        e: document.querySelector("#platz-e .taefelchen")?.textContent,
        stabZ: document.querySelector("#real-z ls-perlenstab")?.getAttribute("wert"),
        stabE: document.querySelector("#real-e ls-perlenstab")?.getAttribute("wert"),
        fliegen: document.querySelectorAll(".flug").length,
      }));
      let ende = await lies();
      for (let i = 0; i < 120 && !(ende.z === "1" && ende.stabE && ende.fliegen === 0); i++) { await warte(50); ende = await lies(); }
      pruefe(ende.z === "1" && ende.e === String(e) && ende.stabZ === "10" && ende.stabE === String(e) && ende.fliegen === 0,
        `${was}: Endlage 1 | ${e} mit Stange und Stäbchen in den Spalten (${JSON.stringify(ende)})`);
      pruefe(fehler.length === 0, `${was}: keine Seitenfehler ${fehler.join(" | ")}`);
      await k.close();
    }
    // Einer zuerst: Platz Einer, Ziffer, Platz Zehner, 1, Haken.
    {
      const k = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      await k.addInitScript(() => { window.__LS_PRUEFEN__ = true; });
      const p = await k.newPage();
      await p.goto(`${basis}?pruefen`);
      const zustand = () => p.evaluate(() => window.lsPruefen?.zustand());
      const taste = (/** @type {string} */ z) => p.locator("#tastatur button", { hasText: new RegExp(`^${z}$`) }).first().click();
      const t0 = Date.now();
      const geloest = [];
      p.on("console", () => {});
      await p.exposeFunction("__geloest", (/** @type {string} */ key) => geloest.push(key));
      await p.evaluate(() => document.addEventListener("ls-ergebnis", (/** @type {any} */ ev) => window.__geloest(`${ev.detail.key}:${ev.detail.ok}`)));
      let einerZuerst = false;
      while (Date.now() - t0 < FRIST_MS && !einerZuerst) {
        const st = await zustand();
        if (st?.phase !== "aufgabe") {
          const z = await p.evaluate(() => window.lsPruefen?.richtigerZug());
          if (z && st?.phase === "einfuehrung") await p.evaluate((zz) => window.lsPruefen.fuehreAus(zz), z);
          await warte(200);
          continue;
        }
        const key = String(st.aufgabe);
        const plus = /plus:(\d)\+10/.exec(key);
        const vorher = geloest.length;
        if (plus && !einerZuerst) {
          await p.locator("#platz-e").click();
          await taste(plus[1]);
          await p.locator("#platz-z").click();
          await taste("1");
          await p.locator("#fertig").click();
          await warte(300);
          einerZuerst = geloest.length > vorher && geloest.at(-1) === `${key}:true`;
          pruefe(einerZuerst, `${name}: Einer zuerst getippt löst ${key}`);
        } else {
          const z = await p.evaluate(() => window.lsPruefen.richtigerZug());
          if (z) await p.evaluate((zz) => window.lsPruefen.fuehreAus(zz), z);
        }
        await warte(250);
      }
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
    // Das Kind tippt das Beispiel selbst: Platz Einer, 3, Haken – der Zehner-Platz bleibt leer (Zahl ohne Zehner).
    const ersterZug = async () => { for (let i = 0; i < 100; i++) { const z = await p.evaluate(() => window.lsPruefen?.richtigerZug()); if (z) return z; await warte(150); } return null; };
    const z1 = await ersterZug();
    pruefe(z1?.von === "#platz-e", `${name}: bei 13 − 10 zuerst der Platz Einer (${z1?.von})`);
    await p.locator("#platz-e").click();
    await warte(200);
    await p.locator("#tastatur button", { hasText: /^3$/ }).first().click();
    await (async () => { for (let i = 0; i < 100; i++) { if ((await p.evaluate(() => window.lsPruefen?.richtigerZug()))?.von === "#fertig") return; await warte(150); } })();
    await p.locator("#fertig").click();
    const liesMinus = () => p.evaluate(() => ({ z: document.querySelector("#platz-z .taefelchen")?.textContent ?? "", e: document.querySelector("#platz-e .taefelchen")?.textContent, stabE: document.querySelector("#real-e ls-perlenstab")?.getAttribute("wert"), schoss: document.querySelectorAll("#schoss ls-perlenstab").length }));
    let minusEnde = await liesMinus();
    for (let i = 0; i < 60 && !(minusEnde.stabE && minusEnde.schoss); i++) { await warte(100); minusEnde = await liesMinus(); }
    pruefe(minusEnde.z === "" && minusEnde.e === "3" && minusEnde.stabE === "3" && minusEnde.schoss === 1, `${name}: 13 − 10: Zehner leer, Einer 3, Stange bei Timo (${JSON.stringify(minusEnde)})`);
    await k.close();
  } finally {
    await browser.close();
  }
}
server.close();
console.log(rot ? `${rot} rot` : "alles grün");
process.exit(rot ? 1 : 0);
