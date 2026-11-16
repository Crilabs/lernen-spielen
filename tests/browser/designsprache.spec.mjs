// Browser-Prüfung der Designsprache (Spec docs/superpowers/specs/2026-11-15-designsprache-design.md), Funde der Abschluss-
// prüfung: „Zuletzt gelernt“ zeigt alle Einträge ganz (nichts abgeschnitten und doch per Tab erreichbar); das
// Inhaltsverzeichnis des Sachbuchs zeigt links das Titelbild 2 : 1, rechts alle Kapitel ohne Rollen (Spec 2026-11-16); Vorlesen steht auf derselben
// Höhe wie der Ton-Knopf. Chromium und WebKit bei 1920 × 1080, 1280 × 800 und 1024 × 768.
//   NODE_PATH=/private/tmp/claude-501/pw/node_modules node tests/browser/designsprache.spec.mjs
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { starteStumm } from "./stumm.mjs";
import { starteServer } from "./server.mjs";

const { chromium, webkit } = createRequire(import.meta.url)("playwright");
const WURZEL = resolve(fileURLToPath(import.meta.url), "../../..");
let fehler = 0;
const pruefe = (ok, name, detail = "") => { if (!ok) fehler++; console.log(`${ok ? "ok    " : "FEHLER"} ${name}${ok ? "" : ` – ${detail}`}`); };
const e = (k) => ({ z: "kann-ich", k, stufe: "kopf", v: [], e: "", seit: k, u: "", frei: 0 });
const STAND = { "mengen-5": e("2026-11-01"), "zerlegen-2": e("2026-11-03"), "zerlegen-3": e("2026-11-05"), namenwoerter: e("2026-11-08"), "zerlegen-4": e("2026-11-10") };

const server = await starteServer(WURZEL);
const basis = `http://127.0.0.1:${server.address().port}/spiele`;
for (const typ of [chromium, webkit]) {
  for (const [w, h] of [[1920, 1080], [1280, 800], [1024, 768]]) {
    const L = `[${typ.name()} ${w}x${h}]`;
    const browser = await starteStumm(typ);
    const kontext = await browser.newContext({ viewport: { width: w, height: h } });
    await kontext.addInitScript((stand) => {
      if (location.protocol !== "http:") return;
      localStorage.setItem("lernstand-kind-1-lernplan", JSON.stringify({ version: 1, themen: stand, aufgaben: {}, verlauf: [] }));
    }, STAND);
    const p = await kontext.newPage();

    await p.goto(`${basis}/index.html`);
    await p.waitForFunction(() => document.querySelectorAll(".zuletzt .ding").length > 0);
    const z = await p.evaluate(() => {
      const ganz = (el) => { const r = el.getBoundingClientRect(); let k = el.parentElement;
        while (k && k !== document.body) { const q = k.getBoundingClientRect(); const s = getComputedStyle(k);
          if (s.overflow !== "visible" && (r.left < q.left - 1 || r.right > q.right + 1 || r.top < q.top - 1 || r.bottom > q.bottom + 1)) return false; k = k.parentElement; }
        return r.width > 0 && r.left >= 0 && r.right <= innerWidth + 0.5 && r.bottom <= innerHeight + 0.5; };
      const d = [...document.querySelectorAll(".zuletzt .ding")];
      return { anzahl: d.length, ganz: d.map(ganz), regal: ganz(document.querySelector(".regal-knopf")) };
    });
    pruefe(z.anzahl === 5 && z.ganz.every(Boolean) && z.regal, `${L} Zuletzt gelernt: alle fünf Einträge ganz sichtbar, Knopf im Bild`, JSON.stringify(z));

    // Regal „Was ich schon kann“: der Sonnenring um das gewählte Ding (0,9 rem um das Material) wird nicht abgeschnitten
    await p.goto(`${basis}/regal.html`);
    await p.waitForFunction(() => document.querySelector('.ding[aria-pressed="true"] .material'));
    const ring = await p.evaluate(() => {
      const m = document.querySelector('.ding[aria-pressed="true"] .material').getBoundingClientRect();
      const b = document.querySelector(".bretter").getBoundingClientRect();
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      return { links: m.left - 0.9 * rem - b.left, oben: m.top - 0.9 * rem - b.top };
    });
    pruefe(ring.links >= -0.5 && ring.oben >= -0.5, `${L} Regal: Sonnenring des gewählten Dings ganz sichtbar`, JSON.stringify(ring));

    await p.goto(`${basis}/geschichte.html?id=haustiere&pruefen`);
    await p.waitForFunction(() => window.lsGeschichte?.kapitelZahl > 0);
    await p.waitForTimeout(300);
    const i = await p.locator("ls-geschichte").evaluate((el) => {
      const s = el.shadowRoot, r = (q) => s.querySelector(q)?.getBoundingClientRect().toJSON() ?? null;
      const inhalt = s.querySelector(".inhalt"), zeilen = [...s.querySelectorAll(".kapitel")].map((k) => k.getBoundingClientRect());
      const titel = [...s.querySelectorAll(".kapitel .titel")].map((t) => Math.round(t.getBoundingClientRect().height / parseFloat(getComputedStyle(t).lineHeight)));
      return { bild: r(".titelbild"), links: r(".inhalt-links"), liste: r(".kapitel-liste"), rollt: inhalt.scrollHeight - inhalt.clientHeight,
        unten: Math.max(...zeilen.map((z) => z.bottom)), hoehe: el.getBoundingClientRect().bottom, zeilen: titel };
    });
    pruefe(i.bild && Math.abs(i.bild.width / i.bild.height - 2) < 0.05 && i.liste.left >= i.links.right - 1 && i.rollt <= 1 && i.unten <= i.hoehe + 1
      && (w < 1280 || i.zeilen.every((n) => n === 1)),
      `${L} Inhaltsverzeichnis: Titelbild 2 : 1 links, alle Kapitel rechts ohne Rollen${w >= 1280 ? ", je eine Zeile" : ""}`, JSON.stringify(i));
    await p.evaluate(() => window.lsGeschichte.oeffne(0));
    await p.waitForTimeout(300);
    const v = await p.evaluate(() => {
      const g = document.querySelector("ls-geschichte").shadowRoot.querySelector(".vorlesen").shadowRoot.querySelector(".form").getBoundingClientRect();
      const t = document.querySelector("ls-leiste").shadowRoot.querySelector(".ton").shadowRoot.querySelector(".form").getBoundingClientRect();
      const z = document.getElementById("zurueck").shadowRoot.querySelector(".form").getBoundingClientRect();
      return { vorlesen: g.top, ton: t.top, zurueck: z.top };
    });
    pruefe(Math.abs(v.vorlesen - v.ton) < 1.5 && Math.abs(v.zurueck - v.ton) < 1.5, `${L} Vorlesen, Ton und Zurück auf einer Höhe`, JSON.stringify(v));
    await browser.close();
  }
}
server.close();
console.log(fehler ? `${fehler} Fehler` : "alle Prüfungen bestanden");
process.exit(fehler ? 1 : 0);
