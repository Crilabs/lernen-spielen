// Browser-Prüfung: Das gezogene Plättchen bleibt während des ganzen Ziehens sichtbar und liegt unter dem Zeiger
// (Rückmeldung Christian 2026-11-17, G02). Mitten im Ziehen: Klasse `gezogen`, sichtbar, deckend, mit dem Zeiger
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
const SPIEL = "spiele/grammatik/g02-ich-du-wir-person-und-verb/index.html";
let fehler = 0;
const pruefe = (name, ok, was = "") => { if (!ok) fehler++; console.log(`${ok ? "ok  " : "FEHL"} ${name}${ok ? "" : ` ${was}`}`); };

const server = await starteServer(WURZEL);
const url = `http://127.0.0.1:${/** @type {any} */ (server.address()).port}/${SPIEL}?stufe=material`;
for (const typ of ["chromium", "webkit"]) {
  const browser = await starteStumm(pw[typ], {});
  for (const groesse of [{ width: 1920, height: 1080 }, { width: 1280, height: 800 }]) {
    const L = `${typ} ${groesse.width}x${groesse.height}`;
    const k = await browser.newContext({ viewport: groesse });
    await k.addInitScript(() => { /** @type {any} */ (window).__LS_PRUEFEN__ = true; });
    const p = await k.newPage();
    await p.goto(url);
    await p.waitForFunction(() => /** @type {any} */ (window).lsPruefen?.zustand().phase === "aufgabe", null, { timeout: 60000 });
    await p.waitForTimeout(600);
    const teil = await p.$("#p-e-st");
    const bb = /** @type {any} */ (await teil.boundingBox());
    const cx = bb.x + bb.width / 2;
    const cy = bb.y + bb.height / 2;
    await p.mouse.move(cx, cy);
    await p.mouse.down();
    // über Ablage, Streifen und Bogen
    for (const [name, dy] of [["über der Ablage", -bb.height * 1.2], ["über dem Streifen", -bb.height * 3], ["über dem Bogen", -bb.height * 7]]) {
      await p.mouse.move(cx, cy + dy, { steps: 6 });
      const r = await p.evaluate(({ x, y }) => {
        const t = /** @type {HTMLElement} */ (document.getElementById("p-e-st"));
        const cs = getComputedStyle(t);
        const b = t.getBoundingClientRect();
        const oben = (px, py) => { const e = document.elementFromPoint(px, py); return e === t || t.contains(e); };
        const ecken = [[b.left + 8, b.top + 8], [b.right - 8, b.top + 8], [b.left + 8, b.bottom - 8], [b.right - 8, b.bottom - 8], [b.left + b.width / 2, b.top + b.height / 2]];
        return {
          gezogen: t.classList.contains("gezogen"), sichtbar: cs.visibility === "visible" && cs.display !== "none", deckend: Number(cs.opacity) === 1,
          amZeiger: Math.abs(b.left + b.width / 2 - x) < 4 && Math.abs(b.top + b.height / 2 - y) < 4, obenAufAllenEcken: ecken.every(([px, py]) => oben(px, py)),
        };
      }, { x: cx, y: cy + dy });
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
