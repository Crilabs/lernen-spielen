// Bilder der Spielobjekte für den Prüfer B-Welt (docs/spielentwicklung.md §5): jede Art in jedem Zustand, jede
// Bewegung zwischen zwei Zuständen in der Mitte und am Ende, dieselbe Bewegung mit reduzierter Bewegung (muss sofort
// am Ende stehen) und das Regal-Bild (still, mit Wert). Kein Teil von `npm test`: braucht Playwright und Chromium.
//
//   NODE_PATH=/private/tmp/claude-501/pw/node_modules node tests/browser/objektbilder.mjs <ausgabeordner> \
//     <objekt.js> [<objekt.js> …] [--wert 7] [--hoehe 320] [--kind ela]
//
// <objekt.js>: Dateien, die Arten anmelden (meldeObjekt), z. B. spiele/objekte/papiertonne.js oder
// spiele/mathe/m15-mach-voll/objekte/kiste.js. Gezeigt werden alle Arten, die diese Dateien anmelden.
// Ausgabe: <art>-<zustand>.png, <art>-<von>-<nach>-mitte.png, -ende.png, -reduziert.png, <art>-regal.png und
// liste.json (Dateien mit Art, Zustand, Bewegungsdauer). Exit ≠ 0, wenn eine Datei keine Art anmeldet oder die Seite
// Fehler wirft.

import { createRequire } from "node:module";
import http from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, normalize, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const WURZEL = resolve(fileURLToPath(import.meta.url), "../../..");
const TYPEN = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2" };

function leseAufruf(argv) {
  const a = { ziel: "", dateien: /** @type {string[]} */ ([]), wert: "7", hoehe: 320, kind: "ela" };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--wert") a.wert = argv[++i];
    else if (argv[i] === "--hoehe") a.hoehe = Number(argv[++i]);
    else if (argv[i] === "--kind") a.kind = argv[++i];
    else if (!a.ziel) a.ziel = resolve(argv[i]);
    else a.dateien.push(argv[i]);
  }
  if (!a.ziel || !a.dateien.length) throw new Error("Aufruf: node tests/browser/objektbilder.mjs <ausgabeordner> <objekt.js> [<objekt.js> …] [--wert 7] [--hoehe 320] [--kind ela]");
  a.dateien = a.dateien.map((d) => {
    const pfad = relative(WURZEL, resolve(d)).split("\\").join("/");
    if (pfad.startsWith("..") || !existsSync(join(WURZEL, pfad))) throw new Error(`Objektdatei nicht im Repo: ${d}`);
    return pfad;
  });
  return a;
}

const seite = (dateien) => `<!doctype html><meta charset="utf-8">
<style>body{margin:0;background:#fff}#buehne{display:inline-flex;align-items:flex-end;gap:32px;padding:96px 48px 24px}
#buehne > svg{display:block;width:auto}</style>
<div id="buehne"></div>
<script type="module">
  import { objekte } from "/spiele/objekte/objekt.js";
  import { zeichne } from "/spiele/runde/runde.js";
  window.__kind = (name) => zeichne(name, { haltung: "stehen" });
  ${dateien.map((d) => `import "/${d}";`).join("\n  ")}
  window.__arten = [...objekte.entries()].map(([art, d]) => ({ art, zustaende: d.zustaende }));
</script>`;

function starteServer(dateien) {
  const server = http.createServer(async (req, res) => {
    const pfad = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (pfad === "/__objektbilder.html") return void res.writeHead(200, { "content-type": TYPEN[".html"] }).end(seite(dateien));
    const datei = join(WURZEL, normalize(pfad));
    if (!datei.startsWith(WURZEL)) return void res.writeHead(403).end();
    try {
      res.writeHead(200, { "content-type": TYPEN[extname(datei)] ?? "application/octet-stream" }).end(await readFile(datei));
    } catch {
      res.writeHead(404).end();
    }
  });
  return new Promise((ok) => server.listen(0, "127.0.0.1", () => ok(server)));
}

/** Setzt ein frisches Objekt auf die Bühne. */
async function setze(p, { art, zustand, wert, still, hoehe }) {
  await p.evaluate(({ art, zustand, wert, still, hoehe }) => {
    const b = document.getElementById("buehne");
    b.innerHTML = "";
    const o = document.createElement("ls-objekt");
    o.setAttribute("art", art);
    if (zustand) o.setAttribute("zustand", zustand);
    if (wert) o.setAttribute("wert", wert);
    if (still) o.setAttribute("still", "");
    o.style.height = `${hoehe}px`;
    b.append(o);
  }, { art, zustand, wert, still, hoehe });
  await p.waitForTimeout(100);
}

/**
 * Vergleichsbild: das Kind der Runde (stehen, so hoch wie --hoehe) neben Objekten in den Zuständen, im selben Maßstab
 * (eine Bildeinheit des Objekts so groß wie eine des Kindes): So stehen Kontur, Lichtstufen und Schatten so
 * nebeneinander, wie sie bei gleicher Strichstärke wirken.
 */
async function setzeVergleich(p, { art, zustaende, kind, hoehe }) {
  await p.evaluate(({ art, zustaende, kind, hoehe }) => {
    const b = document.getElementById("buehne");
    b.innerHTML = window.__kind(kind);
    /** @type {SVGElement} */ (b.firstElementChild).style.height = `${hoehe}px`;
    for (const z of zustaende) {
      const o = document.createElement("ls-objekt");
      o.setAttribute("art", art);
      o.setAttribute("zustand", z);
      o.setAttribute("still", "");
      o.style.height = `${hoehe}px`;
      b.append(o);
    }
  }, { art, zustaende, kind, hoehe });
  await p.waitForTimeout(150);
  await p.evaluate(({ hoehe }) => {
    const b = document.getElementById("buehne");
    const kindHoehe = /** @type {SVGSVGElement} */ (b.firstElementChild).viewBox.baseVal.height || 280;
    for (const o of b.querySelectorAll("ls-objekt")) {
      const svg = o.shadowRoot?.querySelector("svg");
      const h = svg?.viewBox.baseVal.height;
      if (h) /** @type {HTMLElement} */ (o).style.height = `${(hoehe * h) / kindHoehe}px`;
    }
  }, { hoehe });
  await p.waitForTimeout(80);
}

const bild = (p, ziel, name) => p.locator("#buehne").screenshot({ path: join(ziel, name) }).then(() => name);

async function main() {
  const a = leseAufruf(process.argv.slice(2));
  await mkdir(a.ziel, { recursive: true });
  const server = await starteServer(a.dateien);
  const basis = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  const fehler = [];
  const liste = [];
  try {
    for (const reduziert of [false, true]) {
      const k = await browser.newContext({ viewport: { width: 1200, height: 900 }, reducedMotion: reduziert ? "reduce" : "no-preference" });
      const p = await k.newPage();
      p.on("pageerror", (e) => fehler.push(String(e)));
      p.on("console", (m) => m.type() === "error" && fehler.push(m.text()));
      await p.goto(`${basis}/__objektbilder.html`, { waitUntil: "load" });
      await p.waitForFunction(() => Array.isArray(window.__arten), null, { timeout: 8000 });
      const arten = await p.evaluate(() => window.__arten);
      if (!arten.length) fehler.push("keine Art angemeldet");
      for (const { art, zustaende } of arten) {
        if (!reduziert) {
          for (const z of zustaende) {
            await setze(p, { art, zustand: z, hoehe: a.hoehe });
            liste.push({ datei: await bild(p, a.ziel, `${art}-${z}.png`), art, zustand: z });
          }
          await setze(p, { art, zustand: zustaende[0], wert: a.wert, still: true, hoehe: a.hoehe });
          liste.push({ datei: await bild(p, a.ziel, `${art}-regal.png`), art, regal: true, wert: a.wert });
          const vergleich = [...new Set([zustaende[0], zustaende[zustaende.length - 1]])];
          await setzeVergleich(p, { art, zustaende: vergleich, kind: a.kind, hoehe: a.hoehe });
          liste.push({ datei: await bild(p, a.ziel, `${art}-vergleich.png`), art, vergleich: true, kind: a.kind, zustaende: vergleich });
        }
        for (let i = 0; i < zustaende.length; i++) {
          const von = zustaende[i];
          const nach = zustaende[(i + 1) % zustaende.length];
          if (von === nach) continue;
          await setze(p, { art, zustand: von, hoehe: a.hoehe });
          const t0 = Date.now();
          const fertig = p.evaluate((nach) => {
            const o = document.querySelector("ls-objekt");
            return Promise.resolve(o.wechsle(nach)).then(() => true);
          }, nach);
          const name = `${art}-${von}-${nach}`;
          if (reduziert) {
            await p.waitForTimeout(50);
            liste.push({ datei: await bild(p, a.ziel, `${name}-reduziert.png`), art, von, nach, reduziert: true });
            await fertig;
          } else {
            await p.waitForTimeout(250);
            liste.push({ datei: await bild(p, a.ziel, `${name}-mitte.png`), art, von, nach, mitte: true });
            await fertig;
            const dauer = Date.now() - t0;
            liste.push({ datei: await bild(p, a.ziel, `${name}-ende.png`), art, von, nach, dauerMs: dauer });
          }
        }
      }
      await k.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
  await writeFile(join(a.ziel, "liste.json"), JSON.stringify({ dateien: a.dateien, bilder: liste, fehler }, null, 2) + "\n");
  console.log(`${liste.length} Bilder in ${a.ziel}${fehler.length ? ` · FEHLER: ${fehler.join(" | ")}` : ""}`);
  if (fehler.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e.stack ?? String(e));
  process.exitCode = 1;
});
