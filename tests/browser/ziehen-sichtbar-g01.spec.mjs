// Browser-Prüfung: Das gezogene Plättchen bleibt während des ganzen Ziehens sichtbar und liegt unter dem Zeiger
// (Rückmeldung Christian 2026-11-17, G01). Mitten im Ziehen: Klasse `gezogen`, sichtbar, deckend, mit dem Zeiger
// mitgewandert, und an jeder Ecke seiner Fläche ist es das oberste Element (nichts liegt darüber).
//
//   NODE_PATH=/private/tmp/claude-501/pw/node_modules node tests/browser/ziehen-sichtbar.spec.mjs
// Kein Teil von `npm test` (braucht Playwright); beendet sich mit Code 1, sobald etwas fehlschlägt.
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { starteServer } from "./server.mjs";
import { starteStumm } from "./stumm.mjs";

const require = createRequire(import.meta.url);
const pw = require("playwright");
const WURZEL = resolve(fileURLToPath(import.meta.url), "../../..");
const SPIEL = "spiele/grammatik/g01-dreieck-und-kreis-wortarten-mit-symbolen/index.html";
let fehler = 0;
const pruefe = (name, ok, was = "") => { if (!ok) fehler++; console.log(`${ok ? "ok  " : "FEHL"} ${name}${ok ? "" : ` ${was}`}`); };

const server = await starteServer(WURZEL);
const url = `http://127.0.0.1:${/** @type {any} */ (server.address()).port}/${SPIEL}`;
for (const typ of ["chromium", "webkit"]) {
  const browser = await starteStumm(pw[typ], {});
  for (const groesse of [{ width: 1920, height: 1080 }, { width: 1280, height: 800 }]) {
    const L = `${typ} ${groesse.width}x${groesse.height}`;
    const k = await browser.newContext({ viewport: groesse });
    await k.addInitScript(() => { /** @type {any} */ (window).__LS_PRUEFEN__ = true; });
    const p = await k.newPage();
    await p.goto(url);
    // Einführung überspringen wie durchspielen.mjs: „Weiter“ antippen, sobald es da ist.
    for (let i = 0; i < 400; i++) {
      if (await p.evaluate(() => /** @type {any} */ (window).lsPruefen?.zustand().phase) === "aufgabe") break;
      await p.evaluate(() => {
        const ps = /** @type {any} */ (window).lsPruefen;
        const k = /** @type {HTMLElement | null} */ (document.querySelector(".einf-weiter.da"));
        if (k) k.click();
        else if (ps.zustand().phase === "einfuehrung") { const z = ps.richtigerZug(); if (z) ps.fuehreAus(z); }
      });
      await p.waitForTimeout(150);
    }
    await p.waitForFunction(() => /** @type {any} */ (window).lsPruefen?.zustand().phase === "aufgabe", null, { timeout: 5000 });
    await p.waitForTimeout(600);
    const teil = await p.$("#s-0");
    const bb = /** @type {any} */ (await teil.boundingBox());
    const cx = bb.x + bb.width / 2;
    const cy = bb.y + bb.height / 2;
    await p.mouse.move(cx, cy);
    await p.mouse.down();
    // über Ablage, Streifen und Bogen
    for (const [name, dy] of [["über dem Tablett", -bb.height * 0.6], ["über der Kreidereihe", -bb.height * 1.6], ["über dem Weg", -bb.height * 2.6]]) {
      await p.mouse.move(cx - bb.width * 2.5 * (dy / -bb.height), cy + dy, { steps: 6 });
      const r = await p.evaluate(({ x, y }) => {
        const t = /** @type {HTMLElement} */ (document.getElementById("s-0"));
        const cs = getComputedStyle(t);
        const b = t.getBoundingClientRect();
        const oben = (px, py) => { const e = document.elementFromPoint(px, py); return e === t || t.contains(e); };
        const ecken = [[b.left + 8, b.top + 8], [b.right - 8, b.top + 8], [b.left + 8, b.bottom - 8], [b.right - 8, b.bottom - 8], [b.left + b.width / 2, b.top + b.height / 2]];
        return {
          gezogen: t.classList.contains("gezogen"), sichtbar: cs.visibility === "visible" && cs.display !== "none", deckend: Number(cs.opacity) === 1,
          amZeiger: Math.abs(b.left + b.width / 2 - x) < 4 && Math.abs(b.top + b.height / 2 - y) < 4, obenAufAllenEcken: ecken.every(([px, py]) => oben(px, py)),
        };
      }, { x: cx - bb.width * 2.5 * (dy / -bb.height), y: cy + dy });
      pruefe(`${L}: ${name}: gezogen und sichtbar`, r.gezogen && r.sichtbar && r.deckend, JSON.stringify(r));
      pruefe(`${L}: ${name}: unter dem Zeiger`, r.amZeiger, JSON.stringify(r));
      pruefe(`${L}: ${name}: nichts liegt darüber`, r.obenAufAllenEcken, JSON.stringify(r));
    }
    await p.mouse.up();
    await k.close();
  }
  await browser.close();
}
server.close();
process.exit(fehler ? 1 : 0);
