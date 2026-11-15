// Browser-Prüfung der Bibliothek (spiele/bibliothek.html, Spec docs/superpowers/specs/2026-11-15-bibliothek-design.md).
// Kein Teil von `npm test`: braucht Playwright und installierte Browser (Chromium, WebKit).
//
//   NODE_PATH=/private/tmp/claude-501/pw/node_modules node tests/browser/bibliothek.spec.mjs
//   (SHOTS=<ordner> legt Bildschirmfotos ab)
//
// Geprüft: Startseite hat den Knopf „Bibliothek“ ganz im Bild unter „Was ich schon kann“; die Halle zeigt die Räume als
// Türbögen mit Raumbild, mittig; eine Tür öffnet den Raum (?raum=), dort nur Regale mit fertigen Büchern (Bauernhof
// fehlt), Bücher hochkant; Zurück führt in die Halle; ein Buch öffnet die Geschichte, „Fertig“ führt in denselben Raum
// zurück und das Buch trägt nun ein Lesezeichen; keine Seitenfehler.

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

    // Halle: die Räume als Türbögen mit Raumbild, mittig
    await page.goto(`${basis}/spiele/bibliothek.html`);
    await page.waitForSelector(".tuer img");
    const halle = await page.evaluate(() => {
      const t = [...document.querySelectorAll(".tuer")];
      const rs = t.map((x) => x.querySelector(".bogen").getBoundingClientRect());
      const links = rs[0].left, rechts = innerWidth - rs[rs.length - 1].right;
      return { tueren: t.map((x) => x.dataset.raum), bilder: t.every((x) => x.querySelector(".bogen img")?.complete), mittig: Math.abs(links - rechts) < 4,
        imBild: rs.every((r) => r.bottom <= innerHeight && r.top >= 0) };
    });
    pruefe(JSON.stringify(halle.tueren) === JSON.stringify(["tiere", "zahlen-buchstaben"]) && halle.bilder && halle.mittig && halle.imBild,
      `${L} Halle: zwei Türen mit Raumbild, mittig, ganz im Bild`, JSON.stringify(halle));
    if (SHOTS) { await mkdir(SHOTS, { recursive: true }); await page.screenshot({ path: join(SHOTS, `bibliothek-halle-${typ.name()}-${w}x${h}.png`) }); }

    // Tür → Raum (Adresse ?raum=), nur Regale mit fertigen Büchern, Bücher hochkant, ganz im Bild
    await page.click('.tuer[data-raum="tiere"]');
    await page.waitForSelector(".buch");
    const b = await page.evaluate(() => ({ url: location.search, h1: document.querySelector(".raum h1").textContent,
      regale: [...document.querySelectorAll(".regal")].map((r) => r.dataset.regal), zurueck: !!document.querySelector("#zurueck"),
      buecher: [...document.querySelectorAll(".buch")].map((x) => ({ r: x.getBoundingClientRect().toJSON(), band: !!x.querySelector(".band") })) }));
    const erstes = b.buecher[0].r;
    pruefe(b.url === "?raum=tiere" && b.h1 === "Tiere" && b.zurueck, `${L} Tür öffnet den Raum Tiere mit Zurück-Knopf`, JSON.stringify(b));
    pruefe(b.regale.includes("haustiere") && !b.regale.includes("bauernhof"), `${L} nur Regale mit fertigen Büchern (Bauernhof fehlt)`, JSON.stringify(b.regale));
    pruefe(b.buecher.every((x) => x.r.right <= w && x.r.left >= 0) && erstes.height > erstes.width * 1.2 && b.buecher.every((x) => !x.band),
      `${L} Bücher hochkant, ganz in der Breite, ohne Lesezeichen`, JSON.stringify(erstes));
    if (SHOTS) await page.screenshot({ path: join(SHOTS, `bibliothek-raum-${typ.name()}-${w}x${h}.png`) });

    // Zurück → Halle, anderer Raum
    await page.click("#zurueck");
    await page.waitForSelector(".tuer");
    pruefe((await page.evaluate(() => location.search)) === "", `${L} Zurück führt in die Halle`);
    await page.click('.tuer[data-raum="zahlen-buchstaben"]');
    await page.waitForFunction(() => document.querySelector(".raum h1")?.textContent === "Zahlen und Buchstaben");
    pruefe(/\?raum=zahlen-buchstaben$/.test(page.url()) && (await page.locator('.regal[data-regal="rechnen"] .buch').count()) === 1,
      `${L} zweite Tür öffnet Zahlen und Buchstaben`, page.url());

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
