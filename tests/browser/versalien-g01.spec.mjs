// Browser-Prüfung G01 (Rückmeldung Christian 2026-11-22): Die Großschreibung darf nicht verraten, welches Wort ein Nomen ist.
// Jedes angezeigte Wort (Kästchen, Kreideprobe) steht in Versalien, ß bleibt ß, nichts läuft über. In allen drei Stufen.
//
//   NODE_PATH=/private/tmp/claude-501/pw/node_modules node tests/browser/versalien-g01.spec.mjs
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
const basis = `http://127.0.0.1:${/** @type {any} */ (server.address()).port}/${SPIEL}`;
const browser = await starteStumm(pw.chromium, {});
for (const thema of ["nomen", "verb", "adjektiv"]) {
  for (const stufe of ["material", "vorstellung", "kopf"]) {
    const L = `${thema}/${stufe}`;
    const k = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    await k.addInitScript(() => { /** @type {any} */ (window).__LS_PRUEFEN__ = true; });
    const p = await k.newPage();
    await p.goto(`${basis}?pruefen&stufe=${stufe}&thema=${thema}`);
    for (let i = 0; i < 400; i++) {
      if (await p.evaluate(() => /** @type {any} */ (window).lsPruefen?.zustand().phase) === "aufgabe") break;
      await p.evaluate(() => {
        const ps = /** @type {any} */ (window).lsPruefen;
        const w = /** @type {HTMLElement | null} */ (document.querySelector(".einf-weiter.da"));
        if (w) w.click();
        else if (ps.zustand().phase === "einfuehrung") { const z = ps.richtigerZug(); if (z) ps.fuehreAus(z); }
      });
      await p.waitForTimeout(150);
    }
    await p.waitForFunction(() => /** @type {any} */ (window).lsPruefen?.zustand().phase === "aufgabe", null, { timeout: 5000 });
    await p.waitForTimeout(900);
    const lies = () => p.evaluate(() => {
      const gross = (t) => t.split("ß").map((x) => x.toUpperCase()).join("ß");
      const woerter = [...document.querySelectorAll(".kaestchen .wort")].map((e) => /** @type {HTMLElement} */ (e).textContent ?? "");
      const proben = [...document.querySelectorAll(".kaestchen .probe.da")].map((e) => /** @type {HTMLElement} */ (e).textContent ?? "");
      const ueber = [...document.querySelectorAll(".kaestchen .wort, .kaestchen .probe")].filter((e) => e.scrollWidth > e.clientWidth + 1).map((e) => e.textContent);
      const kasten = [...document.querySelectorAll(".kaestchen")].filter((e) => e.scrollWidth > e.clientWidth + 1).length;
      return { woerter, proben, ueber, kasten, alleGross: [...woerter, ...proben].every((t) => t === gross(t)), gemischt: [...woerter, ...proben].filter((t) => /\p{Ll}/u.test(t)) };
    });
    const a = await lies();
    pruefe(`${L}: Kästchen nicht leer (${a.woerter.join(" ")})`, a.woerter.length > 0 && a.woerter.every((t) => t.length > 0));
    pruefe(`${L}: kein Kleinbuchstabe im Kästchen (nichts verrät das Nomen)`, a.gemischt.length === 0, JSON.stringify(a.gemischt));
    pruefe(`${L}: nichts läuft über`, a.ueber.length === 0 && a.kasten === 0, JSON.stringify(a));
    // Die Probe läuft: ein richtiger Zug, mitten in der Kreideprobe alles lesen.
    await p.evaluate(() => { const ps = /** @type {any} */ (window).lsPruefen; const z = ps.richtigerZug(); if (z) ps.fuehreAus(z); });
    let proben = [];
    for (let i = 0; i < 30 && !proben.length; i++) { await p.waitForTimeout(80); proben = (await lies()).proben; }
    const b = await lies();
    pruefe(`${L}: Kreideprobe in Versalien (${proben.join("|")})`, proben.length > 0 && b.gemischt.length === 0, JSON.stringify(b));
    pruefe(`${L}: Probe läuft nicht über`, b.ueber.length === 0 && b.kasten === 0, JSON.stringify(b));
    await k.close();
  }
}
await browser.close();
server.close();
process.exit(fehler ? 1 : 0);
