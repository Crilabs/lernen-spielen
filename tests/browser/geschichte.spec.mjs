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

  const anzahl = await page.evaluate(() => window.lsGeschichte.seiten);
  const frageSeite = await page.evaluate(() => window.lsGeschichte.frageSeite);
  pruefe(anzahl >= 6 && frageSeite > 1 && frageSeite < anzahl - 1, `${name}: ${anzahl} Seiten, Frage auf Seite ${frageSeite + 1}`);
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
  await page.evaluate((f) => { while (window.lsGeschichte.seite < f) window.lsGeschichte.weiter(); }, frageSeite);
  const frage = await g();
  pruefe(frage.seite === frageSeite && !frage.bereit, `${name}: Frage-Seite – Weiter wartet`);
  await page.keyboard.press("ArrowRight");
  pruefe((await g()).seite === frageSeite, `${name}: Frage-Seite – Pfeiltaste wartet auch`);
  const t0 = Date.now();
  await page.waitForFunction(() => window.lsGeschichte.weiterBereit, null, { timeout: 30000 });
  pruefe(Date.now() - t0 >= 1500, `${name}: Weiter erst nach der Ruhe (${Date.now() - t0} ms)`);
  await page.evaluate(() => { while (window.lsGeschichte.seite < window.lsGeschichte.seiten - 1) window.lsGeschichte.weiter(); });
  pruefe((await g()).seite === anzahl - 1, `${name}: letzte Seite`);
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
  // Startwahl und Vorlesemodus (ohne Systemstimme: sprich liefert „still“, umgeblättert wird nach der Lesezeit)
  const vp = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await vp.addInitScript(() => { try { delete window.speechSynthesis; Object.defineProperty(window, "speechSynthesis", { value: undefined }); } catch {} });
  await vp.goto(`${basis}/spiele/geschichte.html?id=haustiere&pruefen`);
  await vp.waitForFunction(() => window.lsGeschichte?.seiten > 0);
  const v = (f, a) => vp.evaluate(f, a);
  pruefe(await v(() => window.lsGeschichte.modus) === null, `${name}: Startwahl vor dem Lesen`);
  pruefe(await vp.locator("ls-geschichte").evaluate((el) => !el.shadowRoot.querySelector(".startwahl").hidden), `${name}: Startwahl sichtbar`);
  await v(() => window.lsGeschichte.waehle("vorlesen"));
  pruefe(await vp.locator("ls-geschichte").evaluate((el) => el.shadowRoot.querySelector(".startwahl").hidden), `${name}: Startwahl verschwindet`);
  const tv = Date.now();
  await vp.waitForFunction(() => window.lsGeschichte.seite === 1, null, { timeout: 20000 });
  pruefe(Date.now() - tv >= 1500, `${name}: Vorlesen blättert von selbst (${Date.now() - tv} ms)`);
  await v(() => window.lsGeschichte.halte());
  pruefe(await v(() => window.lsGeschichte.angehalten), `${name}: angehalten`);
  await vp.waitForTimeout(9000);
  pruefe(await v(() => window.lsGeschichte.seite) === 1, `${name}: angehalten bleibt die Seite`);
  await v(() => window.lsGeschichte.halte());
  pruefe(!(await v(() => window.lsGeschichte.angehalten)), `${name}: zweiter Tipp liest weiter`);
  // Frageseite wartet im Vorlesemodus
  const fs = await v(() => window.lsGeschichte.frageSeite);
  await v((f) => { while (window.lsGeschichte.seite < f) window.lsGeschichte.weiter(); }, fs);
  if (await v(() => window.lsGeschichte.angehalten)) await v(() => window.lsGeschichte.halte());
  pruefe(!(await v(() => window.lsGeschichte.angehalten)), `${name}: Frage-Seite im laufenden Vorlesemodus`);
  await vp.waitForTimeout(12000);
  { const ist = await v(() => [window.lsGeschichte.seite, window.lsGeschichte.angehalten]); pruefe(ist[0] === fs, `${name}: Frage-Seite blättert nicht von selbst (fs ${fs}, ist ${ist})`); }
  // nach der Frage: anhalten, schnell zweimal blättern – genau +2, kein alter Timer blättert weiter
  await v(() => window.lsGeschichte.halte());
  await vp.waitForFunction(() => window.lsGeschichte.weiterBereit);
  await v(() => { window.lsGeschichte.weiter(); window.lsGeschichte.weiter(); });
  pruefe(await v(() => window.lsGeschichte.seite) === fs + 2, `${name}: zweimal blättern = zwei Seiten`);
  await vp.waitForTimeout(7000);
  pruefe(await v(() => window.lsGeschichte.seite) === fs + 2, `${name}: angehalten – kein alter Timer blättert`);
  await vp.close();

  // Ton aus: keine Startwahl, Selbst lesen
  const tp = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await tp.addInitScript(() => localStorage.setItem("lernstand-kind-1-einstellungen", JSON.stringify({ "ton.geschichte": false })));
  await tp.goto(`${basis}/spiele/geschichte.html?id=haustiere&pruefen`);
  await tp.waitForFunction(() => window.lsGeschichte?.modus === "selbst", null, { timeout: 5000 }).catch(() => {});
  pruefe(await tp.evaluate(() => window.lsGeschichte.modus) === "selbst", `${name}: Ton aus – gleich Selbst lesen`);
  pruefe(await tp.locator("ls-geschichte").evaluate((el) => el.shadowRoot.querySelector(".startwahl").hidden), `${name}: Ton aus – keine Startwahl`);
  await tp.close();
  await browser.close();
}
server.close();
process.exit(fehler ? 1 : 0);
