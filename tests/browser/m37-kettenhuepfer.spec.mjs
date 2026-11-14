// Browser-Prüfung M37 Kettenhüpfer (spiele/mathe/m37-kettenhuepfer/): Nach einer Lösung darf nichts das Ergebnis einer
// wiederholten Aufgabe verraten, auch wenn das Kind die Folge wegtippt (Prüfstand B, Runde 1, kritischer Befund
// „Wegtippen der Folge“: der späte Rückruf der alten Folge überschrieb die Kette der neuen Aufgabe).
// Kein Teil von `npm test`: braucht Playwright und Chromium.
//
//   NODE_PATH=/private/tmp/claude-501/pw/node_modules node tests/browser/m37-kettenhuepfer.spec.mjs
//
// Ablauf (Zweierreihe, ?pruefen): Die ersten beiden Aufgaben erst mit 9 falsch (die Lernsteuerung holt sie zurück),
// dann richtig. Jede Folge wird nach 120 ms weggetippt. Bei jeder neuen Aufgabe wird 80 ms nach ihrem Beginn und noch
// einmal nach 600 ms (wenn ein später Rückruf gelaufen wäre) geprüft: Das Pfeilchen der Aufgabe trägt keine Zahl
// (steht in `leer`, nicht in `pfeile`), ihre Zeile auf der Liste zeigt „▢“. Dazu: Timos Aufgabe 1 · 2 kommt in der
// Runde nicht, der Korb füllt sich mit jeder Lösung (Zustand = Zahl der Lösungen samt Timos), Timo steht still,
// sobald die erste Aufgabe dasteht.

import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { starteServer } from "./server.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const WURZEL = resolve(fileURLToPath(import.meta.url), "../../..");

let fehler = 0;
/** @param {string} name @param {boolean} ok @param {string} [detail] */
function pruefe(name, ok, detail = "") {
  if (!ok) fehler++;
  console.log(`${ok ? "ok    " : "FEHLER"} ${name}${ok ? "" : ` – ${detail}`}`);
}

const server = await starteServer(WURZEL);
const url = `http://127.0.0.1:${server.address().port}/spiele/mathe/m37-kettenhuepfer/index.html?pruefen&thema=zweierreihe`;
const browser = await chromium.launch();
try {
  const seite = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const seitenFehler = [];
  seite.on("pageerror", (e) => seitenFehler.push(e.message));
  await seite.goto(url);

  const zustand = () => seite.evaluate(() => window.lsPruefen.zustand());
  const warteAufgabe = (nr) => seite.waitForFunction((nr) => {
    const z = window.lsPruefen?.zustand();
    return z && (z.phase === "pause" || (z.phase === "aufgabe" && z.nr >= nr));
  }, nr, { timeout: 30000 });
  /** Stand der Kette und der Zeile der laufenden Aufgabe. */
  const bild = () => seite.evaluate(() => {
    const z = window.lsPruefen.zustand();
    const [a, b] = z.aufgabe.slice(4).split("*").map(Number);
    const k = document.getElementById("kette");
    const zahlen = (attr) => (k.getAttribute(attr) ?? "").split(/\s+/).filter(Boolean).map(Number);
    const zeile = document.querySelector(`#liste [data-aufgabe="${a}*${b}"] .text`)?.textContent ?? null;
    return { a, b, pfeile: zahlen("pfeile"), leer: zahlen("leer"), zeile, korb: document.getElementById("korb").getAttribute("zustand") };
  });
  const taste = (z) => seite.evaluate((z) => document.getElementById("tastatur").dispatchEvent(new CustomEvent("taste", { detail: { zeichen: z } })), z);
  const fertig = () => seite.evaluate(() => document.getElementById("fertig").click());
  const tippeZahl = async (zahl) => { for (const z of String(zahl)) await taste(z); await fertig(); };

  // Timo legt vor: sobald die erste Aufgabe dasteht, bewegt er sich nicht mehr (B3).
  await warteAufgabe(1);
  const timoBewegt = await seite.evaluate(() => new Promise((ok) => {
    const svg = document.querySelector("#timo svg");
    let n = 0;
    const mo = new MutationObserver((l) => { n += l.length; });
    mo.observe(svg, { subtree: true, attributes: true, childList: true });
    setTimeout(() => { mo.disconnect(); ok(n); }, 1500);
  }));
  pruefe("Timo still, solange das Kind die erste Aufgabe liest", timoBewegt === 0, `${timoBewegt} Änderungen`);
  pruefe("Korb nach Timos Vorzeigen: eine Packung", (await bild()).korb === "1", (await bild()).korb);

  const gesehen = [];
  let loesungen = 1; // Timos
  let wiederholt = 0;
  for (let nr = 1; ; nr++) {
    await warteAufgabe(nr);
    const z = await zustand();
    if (z.phase === "pause") break;
    await seite.waitForTimeout(80);
    for (const wann of ["80 ms", "600 ms"]) {
      const b = await bild();
      const schon = gesehen.includes(`${b.a}*${b.b}`);
      if (schon) wiederholt++;
      pruefe(`Aufgabe ${nr} (${b.a} · ${b.b}${schon ? ", wiederholt" : ""}) nach ${wann}: Pfeilchen ohne Zahl`, !b.pfeile.includes(b.a), `pfeile ${b.pfeile.join(" ")}`);
      if (schon) {
        pruefe(`Aufgabe ${nr} nach ${wann}: Pfeilchen leer, Zeile verdeckt`, b.leer.includes(b.a) && b.zeile === `${b.a} · ${b.b} = ▢`, `leer ${b.leer.join(" ")}, Zeile ${b.zeile}`);
      }
      if (wann === "80 ms") await seite.waitForTimeout(520);
    }
    const b = await bild();
    pruefe(`Aufgabe ${nr}: nicht Timos 1 · 2`, !(b.a === 1 && b.b === 2));
    if (nr <= 2) await tippeZahl(9); // falsch: die Lernsteuerung holt die Aufgabe zurück
    await tippeZahl(b.a * b.b);
    loesungen++;
    gesehen.push(`${b.a}*${b.b}`);
    pruefe(`Aufgabe ${nr}: Korb zeigt ${Math.min(8, loesungen)} Packungen`, (await bild()).korb === String(Math.min(8, loesungen)), (await bild()).korb);
    await seite.waitForTimeout(120);
    await seite.locator(".spielflaeche").dispatchEvent("pointerdown"); // Folge wegtippen
  }
  pruefe("Mindestens eine Aufgabe kam wiederholt", wiederholt > 0, "keine Wiederholung in der Runde");
  pruefe("Keine Seitenfehler", seitenFehler.length === 0, seitenFehler.join("; "));
} finally {
  await browser.close();
  server.close();
}
console.log(fehler ? `\n${fehler} Fehler` : "\nalles grün");
process.exit(fehler ? 1 : 0);
