// Browser-Prüfung der Bibliothek (spiele/bibliothek.html, Spec docs/superpowers/specs/2026-11-15-bibliothek-design.md).
// Kein Teil von `npm test`: braucht Playwright und installierte Browser (Chromium, WebKit).
//
//   NODE_PATH=/private/tmp/claude-501/pw/node_modules node tests/browser/bibliothek.spec.mjs
//   (SHOTS=<ordner> legt Bildschirmfotos ab)
//
// Geprüft: Startseite hat den Knopf „Bibliothek“ ganz im Bild unter „Was ich schon kann“; die Bibliothek zeigt nur Räume
// und Regale mit fertigen Büchern (Bauernhof fehlt), der erste Raum ist gewählt (Sonnenring), Türen wechseln den Raum
// und die Adresse (?raum=); Bücher stehen ganz im Bild auf dem Brett; ein Buch öffnet die Geschichte, „Fertig“ führt in
// denselben Raum zurück und das Buch trägt nun ein Lesezeichen; keine Seitenfehler.

import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { starteServer } from "./server.mjs";

const require = createRequire(import.meta.url);
const { chromium, webkit } = require("playwright");
const WURZEL = resolve(fileURLToPath(import.meta.url), "../../..");
const SHOTS = process.env.SHOTS;

const server = await starteServer(WURZEL);
const basis = `http://127.0.0.1:${/** @type {any} */ (server.address()).port}`;
/** Blättert bis zur letzten Seite (die Frage-Seite wartet, bis Weiter bereit ist); erst dort wirkt „Fertig“. */
async function bisZumEnde(page) {
  for (let i = 0; i < 40; i++) {
    const s = await page.evaluate(() => ({ i: window.lsGeschichte.seite, n: window.lsGeschichte.seiten }));
    if (s.i >= s.n - 1) return;
    await page.waitForFunction(() => window.lsGeschichte.weiterBereit, null, { timeout: 30000 });
    await page.evaluate(() => window.lsGeschichte.weiter());
  }
}
let fehler = 0;
const pruefe = (ok, was, info = "") => { console.log(`${ok ? "ok  " : "FEHLER"} ${was}${ok ? "" : " " + info}`); if (!ok) fehler++; };

for (const typ of [chromium, webkit]) {
  for (const [w, h] of [[1280, 800], [1920, 1080], [1440, 1080]]) {
    const L = `[${typ.name()} ${w}x${h}]`;
    const browser = await typ.launch();
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    const seitenfehler = [];
    page.on("pageerror", (e) => seitenfehler.push(e.message));

    // Startseite: Knopf Bibliothek
    await page.goto(`${basis}/spiele/index.html`);
    await page.waitForSelector(".bibliothek-knopf");
    const knopf = await page.evaluate(() => {
      const k = document.querySelector(".bibliothek-knopf").getBoundingClientRect(), r = document.querySelector(".regal-knopf").getBoundingClientRect();
      return { unten: k.bottom <= innerHeight, rechts: k.right <= innerWidth, unter: k.top >= r.bottom, href: document.querySelector(".bibliothek-knopf").getAttribute("href"),
        wort: document.querySelector(".bibliothek-knopf b").textContent };
    });
    pruefe(knopf.unten && knopf.rechts && knopf.unter && knopf.href === "bibliothek.html" && knopf.wort === "Bibliothek",
      `${L} Startseite: Knopf „Bibliothek“ ganz im Bild unter „Was ich schon kann“`, JSON.stringify(knopf));

    // Bibliothek ohne Gelesenes
    await page.goto(`${basis}/spiele/bibliothek.html`);
    await page.waitForSelector(".buch");
    const b = await page.evaluate(() => {
      const tueren = [...document.querySelectorAll(".tuer")];
      const buecher = [...document.querySelectorAll(".buch")].map((x) => { const r = x.getBoundingClientRect(); return { r: r.toJSON(), band: !!x.querySelector(".band") }; });
      const brett = document.querySelector(".brett").getBoundingClientRect();
      return { tueren: tueren.map((t) => t.dataset.raum), gewaehlt: tueren.filter((t) => t.getAttribute("aria-selected") === "true").map((t) => t.dataset.raum),
        h1: document.querySelector(".raum h1").textContent, regale: [...document.querySelectorAll(".regal")].map((r) => r.dataset.regal),
        buecher, brett: brett.toJSON(), titel: document.title };
    });
    const erstes = b.buecher[0].r;
    pruefe(JSON.stringify(b.tueren) === JSON.stringify(["tiere", "zahlen-buchstaben"]) && JSON.stringify(b.gewaehlt) === JSON.stringify(["tiere"]) && b.h1 === "Tiere",
      `${L} zwei Räume als Türen, Tiere gewählt`, JSON.stringify(b));
    pruefe(b.regale.includes("haustiere") && !b.regale.includes("bauernhof"), `${L} nur Regale mit fertigen Büchern (Bauernhof fehlt)`, JSON.stringify(b.regale));
    pruefe(b.buecher.every((x) => x.r.right <= w && x.r.bottom <= h && x.r.left >= 0) && Math.abs(erstes.width - erstes.height) < 2,
      `${L} Bücher quadratisch und ganz im Bild`, JSON.stringify(erstes));
    pruefe(erstes.bottom <= b.brett.top + 0.26 * (h / 108) * 100 && b.buecher.every((x) => !x.band), `${L} Buch steht auf dem Brett, ohne Lesezeichen`, JSON.stringify(b));
    if (SHOTS) { await mkdir(SHOTS, { recursive: true }); await page.screenshot({ path: join(SHOTS, `bibliothek-${typ.name()}-${w}x${h}.png`) }); }

    // Raum wechseln
    await page.click('.tuer[data-raum="zahlen-buchstaben"]');
    await page.waitForFunction(() => document.querySelector(".raum h1")?.textContent === "Zahlen und Buchstaben");
    pruefe(/\?raum=zahlen-buchstaben$/.test(page.url()) && (await page.locator('.regal[data-regal="rechnen"] .buch').count()) === 1,
      `${L} Tür wechselt Raum und Adresse`, page.url());

    // Buch öffnen, bis Fertig, zurück im selben Raum mit Lesezeichen
    await page.goto(`${basis}/spiele/bibliothek.html?raum=tiere`);
    await page.waitForSelector('.regal[data-regal="haustiere"] .buch');
    await Promise.all([page.waitForURL(/geschichte\.html\?id=haustiere/), page.click('.regal[data-regal="haustiere"] .buch')]);
    await page.goto(page.url() + "&pruefen");
    await page.waitForFunction(() => window.lsGeschichte?.seiten > 0);
    await bisZumEnde(page);
    await Promise.all([page.waitForURL(/bibliothek\.html\?raum=tiere/), page.evaluate(() => window.lsGeschichte.fertig())]);
    await page.waitForSelector('.regal[data-regal="haustiere"] .buch');
    const band = await page.evaluate(() => ({ band: !!document.querySelector('.regal[data-regal="haustiere"] .buch .band'),
      label: document.querySelector('.regal[data-regal="haustiere"] .buch').getAttribute("aria-label") }));
    pruefe(band.band && /, gelesen$/.test(band.label), `${L} nach Fertig zurück im Raum Tiere, Buch mit Lesezeichen`, JSON.stringify(band));

    pruefe(!seitenfehler.length, `${L} keine Seitenfehler`, seitenfehler.join(" | "));
    await browser.close();
  }
}
server.close();
console.log(fehler ? `${fehler} Fehler` : "alle Prüfungen bestanden");
process.exit(fehler ? 1 : 0);
