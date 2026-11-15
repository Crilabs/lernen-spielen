// Browser-Prüfung des Abspielers für Geschichten (spiele/rahmen/geschichte.js, spiele/geschichte.html).
// Kein Teil von `npm test`: braucht Playwright und installierte Browser (Chromium, WebKit).
//
//   NODE_PATH=/private/tmp/claude-501/pw/node_modules node tests/browser/geschichte.spec.mjs
//
// Geprüft mit der Lerngeschichte „Zehnerpaare“ über die Test-Schnittstelle window.lsGeschichte (?pruefen):
// Bild quadratisch links, Text rechts; Pfeiltaste, Wischen und Tipp blättern; auf der Frage-Seite ist Weiter zuerst nicht da und erscheint nach der Ruhe;
// Zurück auf Seite 1 tut nichts; „Fertig“ führt zu weiter und merkt die Geschichte als gelesen (Elternbereich „Sachthemen“),
// in der Vorschau der Eltern (&eltern) nicht; keine Seitenfehler. Unbekannte id zeigt einen ruhigen Text.

import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { starteServer } from "./server.mjs";

const require = createRequire(import.meta.url);
const { chromium, webkit } = require("playwright");
const WURZEL = resolve(fileURLToPath(import.meta.url), "../../..");

const server = await starteServer(WURZEL);
const basis = `http://127.0.0.1:${/** @type {any} */ (server.address()).port}`;
let fehler = 0;
const pruefe = (ok, was) => { console.log(`${ok ? "ok  " : "FEHLER"} ${was}`); if (!ok) fehler++; };

for (const typ of [chromium, webkit]) {
  const browser = await typ.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const seitenfehler = [];
  page.on("pageerror", (e) => seitenfehler.push(e.message));
  await page.goto(`${basis}/spiele/geschichte.html?id=zehnerpaare&weiter=themen.html&pruefen`);
  await page.waitForFunction(() => window.lsGeschichte?.seiten > 0);
  const g = () => page.evaluate(() => ({ seite: window.lsGeschichte.seite, bereit: window.lsGeschichte.weiterBereit }));
  const name = typ.name();

  pruefe((await page.evaluate(() => window.lsGeschichte.seiten)) === 9, `${name}: neun Seiten`);
  await page.evaluate(() => window.lsGeschichte.zurueck());
  pruefe((await g()).seite === 0, `${name}: Zurück auf Seite 1 bleibt`);
  await page.keyboard.press("ArrowRight");
  pruefe((await g()).seite === 1, `${name}: Pfeiltaste blättert weiter`);
  await page.keyboard.press("ArrowLeft");
  pruefe((await g()).seite === 0, `${name}: Pfeiltaste blättert zurück`);
  const r = await page.locator("ls-geschichte").evaluate((el) => el.shadowRoot.querySelector(".rahmen").getBoundingClientRect().toJSON());
  const t = await page.locator("ls-geschichte").evaluate((el) => el.shadowRoot.querySelector(".text").getBoundingClientRect().toJSON());
  pruefe(Math.abs(r.width - r.height) < 2 && r.height > 500, `${name}: Bild quadratisch und groß (${Math.round(r.width)} × ${Math.round(r.height)})`);
  pruefe(r.right < t.left, `${name}: Bild links, Text rechts`);
  await page.mouse.move(r.x + r.width * 0.7, r.y + r.height / 2);
  await page.mouse.down();
  await page.mouse.move(r.x + r.width * 0.3, r.y + r.height / 2, { steps: 6 });
  await page.mouse.up();
  pruefe((await g()).seite === 1, `${name}: Wischen nach links blättert weiter`);
  await page.locator("ls-geschichte").evaluate((el) => el.shadowRoot.querySelector(".weiter").click());
  pruefe((await g()).seite === 2, `${name}: Tipp auf Weiter blättert`);
  await page.evaluate(() => { window.lsGeschichte.weiter(); window.lsGeschichte.weiter(); });
  const frage = await g();
  pruefe(frage.seite === 4 && !frage.bereit, `${name}: Frage-Seite – Weiter wartet`);
  await page.keyboard.press("ArrowRight");
  pruefe((await g()).seite === 4, `${name}: Frage-Seite – Pfeiltaste wartet auch`);
  const t0 = Date.now();
  await page.waitForFunction(() => window.lsGeschichte.weiterBereit, null, { timeout: 30000 });
  pruefe(Date.now() - t0 >= 1500, `${name}: Weiter erst nach der Ruhe (${Date.now() - t0} ms)`);
  for (let i = 0; i < 4; i++) await page.evaluate(() => window.lsGeschichte.weiter());
  pruefe((await g()).seite === 8, `${name}: letzte Seite`);
  await Promise.all([page.waitForURL(/themen\.html/), page.evaluate(() => window.lsGeschichte.fertig())]);
  pruefe(true, `${name}: Fertig führt zu weiter`);
  // weiter=themen.html kann selbst weiterleiten: erst Ruhe abwarten, dann den Lernstand lesen
  const gelesen = async () => { await page.waitForLoadState("networkidle"); await page.waitForTimeout(300);
    return page.evaluate(() => JSON.parse(localStorage.getItem("lernstand-kind-1-lernplan") || "{}").sachthemen?.geschichten ?? {}); };
  pruefe(Object.keys(await gelesen()).join() === "zehnerpaare", `${name}: Fertig merkt die Geschichte als gelesen`);
  await page.goto(`${basis}/spiele/geschichte.html?id=haustiere&eltern&weiter=themen.html&pruefen`);
  await page.waitForFunction(() => window.lsGeschichte?.seiten > 0);
  await Promise.all([page.waitForURL(/themen\.html/), page.evaluate(() => window.lsGeschichte.fertig())]);
  pruefe(!("haustiere" in (await gelesen())), `${name}: Vorschau der Eltern merkt nichts`);
  pruefe(!seitenfehler.length, `${name}: keine Seitenfehler ${seitenfehler.join(" | ")}`);

  await page.goto(`${basis}/spiele/geschichte.html?id=gibt-es-nicht`);
  await page.waitForTimeout(500);
  const text = await page.locator("ls-geschichte").evaluate((el) => el.shadowRoot.querySelector(".text").textContent);
  pruefe(/geht gerade nicht/.test(text), `${name}: unbekannte Geschichte zeigt einen ruhigen Text`);
  await browser.close();
}
server.close();
process.exit(fehler ? 1 : 0);
