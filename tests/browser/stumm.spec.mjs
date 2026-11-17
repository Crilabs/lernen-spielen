// Browser-Prüfung der stummen Prüf-Browser (tests/browser/stumm.mjs). Kein Teil von `npm test`: braucht Playwright.
//
//   NODE_PATH=/private/tmp/claude-501/pw/node_modules node tests/browser/stumm.spec.mjs
//
// Regression (Prüfstand G02, 2026-11-17): In WebKit sprach die echte Systemstimme, zwei Browser parallel. Die stille
// Nachbildung hing als eigene Eigenschaft an `speechSynthesis`; WebKit verwirft das JS-Objekt dahinter bei der
// Speicherbereinigung, das neue hat die Ersetzung nicht mehr. Hier wird das nachgestellt (eigene Eigenschaft löschen)
// und mit leerem Text gesprochen – selbst wenn die echte Stimme dranläge, wäre nichts zu hören.
import { createRequire } from "node:module";
import { starteStumm } from "./stumm.mjs";

const require = createRequire(import.meta.url);
const { chromium, webkit } = require("playwright");

let fehler = 0;
for (const typ of [chromium, webkit]) {
  const browser = await starteStumm(typ);
  const seite = await (await browser.newContext()).newPage();
  await seite.goto("data:text/html,<p>still</p>");
  const r = await seite.evaluate(() => new Promise((ok) => {
    delete (/** @type {any} */ (speechSynthesis)).speak; // wie nach der Speicherbereinigung in WebKit
    const nativ = /\[native code\]/.test(String(speechSynthesis.speak));
    const u = new SpeechSynthesisUtterance("");
    u.onstart = () => ok({ nativ, ereignis: "start" });
    u.onerror = (e) => ok({ nativ, ereignis: `error ${/** @type {any} */ (e).error}` });
    speechSynthesis.speak(u);
    setTimeout(() => ok({ nativ, ereignis: "keins" }), 2000);
  }));
  const gut = !r.nativ && r.ereignis === "start";
  console.log(`${gut ? "ok  " : "ROT "} ${typ.name()}: Systemstimme nachgebildet auch ohne eigene Eigenschaft (${JSON.stringify(r)})`);
  if (!gut) fehler++;
  await browser.close();
}
process.exit(fehler ? 1 : 0);
