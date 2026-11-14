// Browser-Prüfung M37 Kettenhüpfer (spiele/mathe/m37-kettenhuepfer/). Kein Teil von `npm test`: braucht Playwright
// und Chromium.
//
//   NODE_PATH=/private/tmp/claude-501/pw/node_modules node tests/browser/m37-kettenhuepfer.spec.mjs
//
// 1. Zweierreihe, 1920 × 1080, drei Runden hintereinander (Weiter in der Pause):
//    - Nach einer Lösung verrät nichts das Ergebnis einer wiederholten Aufgabe, auch wenn das Kind die Folge wegtippt
//      (Prüfstand B, Runde 1): 80 ms und 600 ms nach Beginn trägt das Pfeilchen der Aufgabe keine Zahl, bei einer
//      Wiederholung ist es leer und die Zeile zeigt „▢“. In Runde 1 sind die ersten beiden Aufgaben erst falsch.
//    - Jede Runde hat AUFGABEN_JE_RUNDE Aufgaben, keine kommt zweimal direkt hintereinander, die erste ist nie Timos
//      Aufgabe, am Ende steht „Die Vorratsliste ist voll …“ (Prüfstand B, Runde 2: verworfene Lieferungen 1 · n).
//    - Der Korb bekommt erst etwas, wenn die Packung gelandet ist (nicht schon beim Tippen auf Fertig); nach dem
//      Wegtippen liegt je Lösung (samt Timos) eine Packung der Reihe darin.
//    - Timo steht still, sobald die erste Aufgabe dasteht.
// 2. Kernaufgaben (Kette wechselt von Aufgabe zu Aufgabe), 1280 × 800: Ab Phase `aufgabe` ändert sich die Blase nicht
//    mehr von selbst, auch nach einem Kettenwechsel (Prüfstand B, Runde 2: der Auftrag ersetzte den Wechselsatz still,
//    5,4 s nach Beginn der Aufgabe). Mindestens ein Wechsel kommt vor.
// 3. Zehnerreihe, 1280 × 800: Die Kurzketten der Vorratsliste haben einen gemeinsamen Maßstab (jeder Stab gleich lang,
//    so viele Stäbe wie a, Lücke mehrere Konturen breit, Stab deutlich über 8 px), „10 · 10 = 100“ steht in einer Zeile.

import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { starteServer } from "./server.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const WURZEL = resolve(fileURLToPath(import.meta.url), "../../..");
const { AUFGABEN_JE_RUNDE } = await import("../../spiele/mathe/m37-kettenhuepfer/logik.js");

let fehler = 0;
/** @param {string} name @param {boolean} ok @param {string} [detail] */
function pruefe(name, ok, detail = "") {
  if (!ok) fehler++;
  console.log(`${ok ? "ok    " : "FEHLER"} ${name}${ok ? "" : ` – ${detail}`}`);
}

const server = await starteServer(WURZEL);
const basis = `http://127.0.0.1:${server.address().port}/spiele/mathe/m37-kettenhuepfer/index.html?pruefen`;
const browser = await chromium.launch();

/** Hilfen für eine Seite des Spiels. @param {any} seite */
function spieler(seite) {
  const zustand = () => seite.evaluate(() => window.lsPruefen.zustand());
  const warteAufgabe = (/** @type {number} */ nr) => seite.waitForFunction((nr) => {
    const z = window.lsPruefen?.zustand();
    return z && (z.phase === "pause" || (z.phase === "aufgabe" && z.nr >= nr));
  }, nr, { timeout: 30000 });
  /** Stand der Kette, der Zeile der laufenden Aufgabe und des Korbs. */
  const bild = () => seite.evaluate(() => {
    const z = window.lsPruefen.zustand();
    const [a, b] = z.aufgabe.slice(4).split("*").map(Number);
    const k = document.getElementById("kette");
    const zahlen = (/** @type {string} */ attr) => (k.getAttribute(attr) ?? "").split(/\s+/).filter(Boolean).map(Number);
    const zeile = document.querySelector(`#liste [data-aufgabe="${a}*${b}"] .text`)?.textContent ?? null;
    return { a, b, pfeile: zahlen("pfeile"), leer: zahlen("leer"), zeile, imKorb: document.getElementById("korb-inhalt").children.length };
  });
  const taste = (/** @type {string} */ z) => seite.evaluate((z) => document.getElementById("tastatur").dispatchEvent(new CustomEvent("taste", { detail: { zeichen: z } })), z);
  const fertig = () => seite.evaluate(() => document.getElementById("fertig").click());
  const tippeZahl = async (/** @type {number} */ zahl) => { for (const z of String(zahl)) await taste(z); await fertig(); };
  const wegtippen = () => seite.locator(".spielflaeche").dispatchEvent("pointerdown");
  const blase = () => seite.evaluate(() => document.getElementById("blase").text);
  const weiter = () => seite.evaluate(() => document.querySelector("#pause").shadowRoot.querySelector("ls-knopf.weiter").click());
  return { zustand, warteAufgabe, bild, taste, fertig, tippeZahl, wegtippen, blase, weiter };
}

try {
  // --- 1. Zweierreihe, drei Runden ------------------------------------------------------------------------------
  {
    const seite = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    const seitenFehler = [];
    seite.on("pageerror", (/** @type {Error} */ e) => seitenFehler.push(e.message));
    await seite.goto(`${basis}&thema=zweierreihe`);
    const sp = spieler(seite);
    let wiederholt = 0;
    for (let runde = 1; runde <= 3; runde++) {
      await sp.warteAufgabe(1);
      const start = await sp.zustand();
      const timo = await seite.evaluate(() => document.querySelector("#liste .zeile")?.dataset.aufgabe ?? null);
      if (runde === 1) {
        const timoBewegt = await seite.evaluate(() => new Promise((ok) => {
          const svg = document.querySelector("#timo svg");
          let n = 0;
          const mo = new MutationObserver((l) => { n += l.length; });
          mo.observe(svg, { subtree: true, attributes: true, childList: true });
          setTimeout(() => { mo.disconnect(); ok(n); }, 1500);
        }));
        pruefe("Timo still, solange das Kind die erste Aufgabe liest", timoBewegt === 0, `${timoBewegt} Änderungen`);
      }
      pruefe(`Runde ${runde}: Timos Packung liegt im Korb`, (await sp.bild()).imKorb === 1, String((await sp.bild()).imKorb));
      pruefe(`Runde ${runde}: die erste Aufgabe ist nicht Timos (${timo})`, `mal:${timo}` !== start.aufgabe, start.aufgabe);

      /** @type {string[]} */
      const gesehen = [];
      /** @type {string[]} */
      const folge = [];
      let loesungen = 1; // Timos
      for (let nr = start.nr; ; nr++) {
        await sp.warteAufgabe(nr);
        const z = await sp.zustand();
        if (z.phase === "pause") break;
        folge.push(z.aufgabe);
        await seite.waitForTimeout(80);
        for (const wann of ["80 ms", "600 ms"]) {
          const b = await sp.bild();
          const schon = gesehen.includes(`${b.a}*${b.b}`) || timo === `${b.a}*${b.b}`;
          if (schon && wann === "80 ms") wiederholt++;
          pruefe(`R${runde} A${nr - start.nr + 1} (${b.a} · ${b.b}${schon ? ", wiederholt" : ""}) nach ${wann}: Pfeilchen ohne Zahl`, !b.pfeile.includes(b.a), `pfeile ${b.pfeile.join(" ")}`);
          if (schon) pruefe(`R${runde} A${nr - start.nr + 1} nach ${wann}: Pfeilchen leer, Zeile verdeckt`, b.leer.includes(b.a) && b.zeile === `${b.a} · ${b.b} = ▢`, `leer ${b.leer.join(" ")}, Zeile ${b.zeile}`);
          if (wann === "80 ms") await seite.waitForTimeout(520);
        }
        const b = await sp.bild();
        if (runde === 1 && nr - start.nr < 2) await sp.tippeZahl(9); // falsch: die Lernsteuerung holt die Aufgabe zurück
        await sp.tippeZahl(b.a * b.b);
        loesungen++;
        gesehen.push(`${b.a}*${b.b}`);
        pruefe(`R${runde} A${nr - start.nr + 1}: Korb springt nicht schon beim Tippen auf Fertig`, (await sp.bild()).imKorb === Math.min(9, loesungen - 1), String((await sp.bild()).imKorb));
        await seite.waitForTimeout(120);
        await sp.wegtippen();
        pruefe(`R${runde} A${nr - start.nr + 1}: nach dem Wegtippen ${Math.min(9, loesungen)} Packungen im Korb`, (await seite.evaluate(() => document.getElementById("korb-inhalt").children.length)) === Math.min(9, loesungen));
      }
      pruefe(`Runde ${runde}: ${AUFGABEN_JE_RUNDE} Aufgaben (${folge.length}: ${folge.join(" ")})`, folge.length === AUFGABEN_JE_RUNDE);
      pruefe(`Runde ${runde}: keine Aufgabe zweimal direkt hintereinander`, folge.every((k, i) => i === 0 || k !== folge[i - 1]), folge.join(" "));
      const ende = await sp.blase();
      pruefe(`Runde ${runde}: „Die Vorratsliste ist voll“`, ende.startsWith("Die Vorratsliste ist voll"), ende);
      await sp.weiter();
      await seite.waitForFunction(() => window.lsPruefen.zustand().phase !== "pause", null, { timeout: 10000 });
    }
    pruefe("Mindestens eine Aufgabe kam wiederholt", wiederholt > 0, "keine Wiederholung in drei Runden");
    pruefe("Keine Seitenfehler (Zweierreihe)", seitenFehler.length === 0, seitenFehler.join("; "));
    await seite.close();
  }

  // --- 2. Kernaufgaben: Blase still ab Phase aufgabe, auch nach einem Kettenwechsel -----------------------------
  {
    const kontext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    await kontext.addInitScript(() => {
      localStorage.setItem("lernstand-kind-1-lernplan", JSON.stringify({ version: 1, themen: { "kernaufgaben-einmaleins": { z: "dran", stufe: "material", seit: "2026-11-01", v: [] } }, aufgaben: {}, verlauf: [], migriert: 1 }));
    });
    const seite = await kontext.newPage();
    const seitenFehler = [];
    seite.on("pageerror", (/** @type {Error} */ e) => seitenFehler.push(e.message));
    await seite.goto(basis);
    const sp = spieler(seite);
    // Beobachter: jeder neue Text der Blase (blase.sage) mit Zeit, Phase und Aufgabe, im Moment des Aufrufs.
    await sp.warteAufgabe(1);
    await seite.evaluate(() => {
      const b = document.getElementById("blase");
      /** @type {any[]} */
      const log = (window.__blase = []);
      const sage = b.sage.bind(b);
      b.sage = (/** @type {string} */ text, /** @type {any} */ o) => {
        const z = window.lsPruefen.zustand();
        log.push({ t: performance.now(), text, phase: z.phase, nr: z.nr });
        return sage(text, o);
      };
    });
    let wechsel = 0;
    let reihe = null;
    for (let nr = 1; ; nr++) {
      await sp.warteAufgabe(nr);
      const z = await sp.zustand();
      if (z.phase === "pause") break;
      const b = await sp.bild();
      if (reihe !== null && b.b !== reihe) wechsel++;
      reihe = b.b;
      const t0 = await seite.evaluate(() => performance.now());
      const text0 = await sp.blase();
      await seite.waitForTimeout(6000); // länger als Wechselsatz und Sprechen zusammen
      const aenderungen = await seite.evaluate((t0) => window.__blase.filter((/** @type {any} */ e) => e.t > t0), t0);
      pruefe(`Kern A${nr} (${b.a} · ${b.b}): Blase still ab Phase aufgabe`, aenderungen.length === 0 && (await sp.blase()) === text0, JSON.stringify(aenderungen));
      await sp.tippeZahl(b.a * b.b);
      await seite.waitForTimeout(120);
      await sp.wegtippen();
    }
    pruefe("Kern: mindestens ein Kettenwechsel in der Runde", wechsel > 0, "kein Wechsel");
    const vorAufgabe = await seite.evaluate(() => window.__blase.filter((/** @type {any} */ e) => e.text.startsWith("Jetzt sind es")).map((/** @type {any} */ e) => e.phase));
    pruefe("Kern: der Wechselsatz kommt vor der Aufgabe (Phase folge)", vorAufgabe.length > 0 && vorAufgabe.every((p) => p === "folge"), JSON.stringify(vorAufgabe));
    pruefe("Keine Seitenfehler (Kern)", seitenFehler.length === 0, seitenFehler.join("; "));
    await kontext.close();
  }

  // --- 3. Zehnerreihe, 1280 × 800: Kurzketten mit gemeinsamem Maßstab ----------------------------------------------
  {
    const seite = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await seite.goto(`${basis}&thema=zehnerreihe`);
    const sp = spieler(seite);
    for (let nr = 1; ; nr++) {
      await sp.warteAufgabe(nr);
      if ((await sp.zustand()).phase === "pause") break;
      const b = await sp.bild();
      await sp.tippeZahl(b.a * b.b);
      await seite.waitForTimeout(60);
      await sp.wegtippen();
    }
    const zeilen = await seite.evaluate(() => [...document.querySelectorAll("#liste .zeile")].map((z) => {
      const [a] = /** @type {string} */ (/** @type {HTMLElement} */ (z).dataset.aufgabe).split("*").map(Number);
      const staebe = [...z.querySelector("ls-perlenkette").shadowRoot.querySelectorAll("rect")].map((r) => r.getBoundingClientRect());
      const text = /** @type {HTMLElement} */ (z.querySelector(".text"));
      const luecken = staebe.slice(1).map((r, i) => [staebe[i], r]).filter(([l, r]) => Math.abs(r.top - l.top) < 1).map(([l, r]) => r.left - l.right);
      return { a, n: staebe.length, breiten: staebe.map((r) => Math.round(r.width * 10) / 10), luecken, textHoch: text.getBoundingClientRect().height, schrift: parseFloat(getComputedStyle(text).fontSize), text: text.textContent };
    }));
    const breiten = zeilen.flatMap((z) => z.breiten);
    pruefe("Zehnerreihe 1280: je Zeile so viele Stäbe wie a", zeilen.every((z) => z.n === z.a), JSON.stringify(zeilen.map((z) => [z.a, z.n])));
    pruefe("Zehnerreihe 1280: jeder Stab gleich lang (gemeinsamer Maßstab)", Math.max(...breiten) - Math.min(...breiten) < 0.5, breiten.join(" "));
    pruefe("Zehnerreihe 1280: Stab deutlich über 8 px", Math.min(...breiten) >= 14, `${Math.min(...breiten)} px`);
    const kleinsteLuecke = Math.min(...zeilen.flatMap((z) => z.luecken));
    pruefe("Zehnerreihe 1280: Lücke zwischen den Stäben mehrere Konturen breit (≥ 4 px)", kleinsteLuecke >= 4, `${kleinsteLuecke} px`);
    const lang = zeilen.find((z) => z.a === 10);
    pruefe("Zehnerreihe 1280: „10 · 10 = 100“ in einer Zeile", !lang || lang.textHoch < 1.5 * lang.schrift, lang ? `${lang.textHoch} px bei ${lang.schrift} px` : "");
    await seite.close();
  }
} finally {
  await browser.close();
  server.close();
}
console.log(fehler ? `\n${fehler} Fehler` : "\nalles grün");
process.exit(fehler ? 1 : 0);
