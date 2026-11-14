// Browser-Prüfung der Spielzeit (Spec 2026-11-14-spielzeit): Startseite, Spielstart, Pause, Takt, Elternbereich.
// Kein Teil von `npm test`: braucht Playwright und Chromium.
//
// Aufruf wie tests/browser/vorlage.spec.mjs:
//   NODE_PATH=/private/tmp/claude-501/pw/node_modules node tests/browser/spielzeit.spec.mjs
// Optional: SHOTS=/pfad/zum/ordner legt spielzeit-<schritt>-<breite>x<hoehe>.png ab (start, eltern).
//
// Geprüft wird bei 1920 × 1080 und 1280 × 800: Startseite gesperrt zeigt den Satz und das Regal, ausgeblendet ohne
// Satz; ein gesperrtes Spiel führt zur Startseite; die Pause zeigt den Satz und ohne Weiter beim Schluss;
// amRundenende warnt einmal je Tag; der Takt zählt nur mit Eingabe in den letzten zwei Minuten; im Elternbereich
// stellen Weniger/Mehr, Tage, Ausblenden und „Heute 15 Minuten mehr“ die gespeicherten Werte; keine Konsolenfehler.

import { createRequire } from "node:module";
import http from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const { pinHash } = await import("../../spiele/eltern.js");

const WURZEL = resolve(fileURLToPath(import.meta.url), "../../..");
const TYPEN = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json", ".css": "text/css", ".svg": "image/svg+xml", ".mp3": "audio/mpeg",
  ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf", ".png": "image/png", ".jpg": "image/jpeg",
};

function starteServer() {
  const server = http.createServer(async (req, res) => {
    const pfad = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (pfad === "/favicon.ico") return void res.writeHead(204).end();
    const datei = join(WURZEL, normalize(pfad));
    if (!datei.startsWith(WURZEL)) return void res.writeHead(403).end();
    try {
      res.writeHead(200, { "content-type": TYPEN[extname(datei)] ?? "application/octet-stream" }).end(await readFile(datei));
    } catch {
      res.writeHead(404).end("nicht gefunden");
    }
  });
  return new Promise((ok) => server.listen(0, "127.0.0.1", () => ok(server)));
}

const AUFLOESUNGEN = [{ width: 1920, height: 1080 }, { width: 1280, height: 800 }];
const SHOTS = process.env.SHOTS;
let fehler = 0, geprueft = 0;
function pruefe(lauf, name, ok, detail = "") {
  geprueft++;
  if (!ok) fehler++;
  console.log(`${ok ? "ok    " : "FEHLER"} [${lauf}] ${name}${ok ? "" : detail ? ` – ${detail}` : ""}`);
}

const heute = new Date().toLocaleDateString("sv");
/** Stand der laufenden Woche mit `minuten` heute (Woche wie kern/spielzeit.js). */
async function standMit(seite, minuten) {
  return seite.evaluate(async ([m, tag]) => {
    const { wochenSchluessel } = await import("./kern/spielzeit.js");
    return JSON.stringify({ woche: wochenSchluessel(new Date()), tage: { [tag]: { sekunden: m * 60, zugabe: 0 } } });
  }, [minuten, heute]);
}

/** Neue Seite mit leerem Speicher; `speicher` wird vor jedem Laden gesetzt. */
async function neueSeite(browser, groesse, speicher = {}) {
  const kontext = await browser.newContext({ viewport: groesse, deviceScaleFactor: 1 });
  await kontext.addInitScript((s) => {
    if (sessionStorage.getItem("gesetzt")) return;
    sessionStorage.setItem("gesetzt", "1");
    localStorage.clear();
    for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v);
  }, speicher);
  const seite = await kontext.newPage();
  const konsole = [];
  seite.on("console", (m) => { if (m.type() === "error") konsole.push(m.text()); });
  seite.on("pageerror", (e) => konsole.push(String(e)));
  return { kontext, seite, konsole };
}
const einst = (spielzeit) => JSON.stringify({ spielzeit });
const lies = (seite, k) => seite.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? "null"), k);

const server = await starteServer();
const BASIS = `http://127.0.0.1:${server.address().port}/spiele/`;
const browser = await chromium.launch();
if (SHOTS) await mkdir(SHOTS, { recursive: true });

try {
  for (const groesse of AUFLOESUNGEN) {
    const L = `${groesse.width}x${groesse.height}`;

    // 1. Startseite: Tagesgrenze erreicht → Satz mit „Morgen“, Regal bleibt; ausgeblendet → kein Satz.
    {
      const vor = await neueSeite(browser, groesse);
      await vor.seite.goto(BASIS + "index.html");
      const stand = await standMit(vor.seite, 30);
      await vor.kontext.close();
      const { kontext, seite, konsole } = await neueSeite(browser, groesse, {
        "lernstand-kind-1-einstellungen": einst({ proTag: 30 }), "lernstand-kind-1-spielzeit-stand": stand,
      });
      await seite.goto(BASIS + "index.html");
      await seite.waitForFunction(() => !document.getElementById("schluss").hidden, null, { timeout: 5000 });
      const text = await seite.locator("#schluss").textContent();
      pruefe(L, "Startseite gesperrt: Satz mit „Morgen geht es weiter“", text === "Für heute ist das Spielen fertig. Morgen geht es weiter.", text);
      pruefe(L, "Startseite gesperrt: Regal bleibt sichtbar, keine Spielkacheln", await seite.locator("#regal").isVisible() && await seite.locator("#dran").isHidden());
      const box = await seite.locator("#schluss").boundingBox();
      pruefe(L, "Satz liegt ganz im Bild", box && box.x >= 0 && box.x + box.width <= groesse.width && box.y >= 0, JSON.stringify(box));
      if (SHOTS) await seite.screenshot({ path: `${SHOTS}/spielzeit-start-${L}.png` });

      // 2. Ein gesperrtes Spiel führt zur Startseite.
      await seite.goto(BASIS + "vorlage.html");
      await seite.waitForURL(/index\.html$/, { timeout: 5000 }).catch(() => {});
      pruefe(L, "gesperrtes Spiel führt zur Startseite", seite.url().endsWith("index.html"), seite.url());
      pruefe(L, "Startseite ohne Konsolenfehler", konsole.length === 0, konsole.join(" | "));
      await kontext.close();
    }
    {
      const { kontext, seite } = await neueSeite(browser, groesse, { "lernstand-kind-1-einstellungen": einst({ ausgeblendet: true }) });
      await seite.goto(BASIS + "index.html");
      await seite.waitForFunction(() => document.getElementById("dinge") !== null);
      await seite.waitForTimeout(400);
      pruefe(L, "ausgeblendet: kein Satz, Regal da", await seite.locator("#schluss").isHidden() && await seite.locator("#regal").isVisible());
      await kontext.close();
    }

    // 3. Pause: Satz und Schluss ohne Weiter; amRundenende warnt einmal je Tag.
    {
      const vor = await neueSeite(browser, groesse);
      await vor.seite.goto(BASIS + "index.html");
      const stand = await standMit(vor.seite, 26);
      await vor.kontext.close();
      const { kontext, seite, konsole } = await neueSeite(browser, groesse, {
        "lernstand-kind-1-einstellungen": einst({ proTag: 30 }), "lernstand-kind-1-spielzeit-stand": stand,
      });
      await seite.goto(BASIS + "vorlage.html");
      await seite.waitForSelector("#tablett .stab");
      const zwei = await seite.evaluate(async () => {
        const { amRundenende } = await import("./rahmen/spielzeit.js");
        return [await amRundenende(), await amRundenende()];
      });
      pruefe(L, "amRundenende: Vorwarnung einmal, dann nicht mehr", zwei[0].satz === "Gleich ist für heute Schluss." && !zwei[0].schluss && zwei[1].satz === null, JSON.stringify(zwei));
      const pause = await seite.evaluate(() => {
        const p = document.getElementById("pause");
        p.zeige({ satz: "Für heute ist das Spielen fertig.", schluss: true });
        const w = p.shadowRoot.querySelector(".weiter"), s = p.shadowRoot.querySelector(".satz");
        return { weiter: w.hidden && getComputedStyle(w).display === "none", satz: s.textContent, sichtbar: s.getBoundingClientRect().height > 0,
          alle: p.shadowRoot.querySelector("a.alle").getBoundingClientRect().width > 0 };
      });
      pruefe(L, "Pause beim Schluss: Satz sichtbar, kein Weiter, „Alle Spiele“ da", pause.weiter && pause.sichtbar && pause.alle && pause.satz === "Für heute ist das Spielen fertig.", JSON.stringify(pause));
      pruefe(L, "Spiel ohne Konsolenfehler", konsole.length === 0, konsole.join(" | "));
      await kontext.close();
    }

    // 4. Takt: zählt mit Eingabe, hört zwei Minuten nach der letzten Eingabe auf; die Vorschau zählt nie.
    {
      const { kontext, seite } = await neueSeite(browser, groesse, { "lernstand-kind-1-einstellungen": einst({}) });
      await seite.clock.install();
      await seite.goto(BASIS + "vorlage.html");
      await seite.waitForSelector("#tablett .stab");
      await seite.mouse.click(groesse.width / 2, groesse.height - 40);
      await seite.clock.runFor(60_000);
      pruefe(L, "Vorschau zählt keine Spielzeit", (await lies(seite, "lernstand-kind-1-spielzeit-stand")) === null);
      await kontext.close();
    }
    {
      const { kontext, seite } = await neueSeite(browser, groesse, { "lernstand-kind-1-einstellungen": einst({}) });
      // Die Vorschau zählt nicht: die Vorlage als eingetragenes Spiel (wie der Schreibweg in vorlage.spec.mjs).
      await kontext.route("**/spiele/spiele.json", async (route) => {
        const antwort = await route.fetch();
        const json = await antwort.json();
        json.spiele.push({ id: "vorlage", titel: "Spielvorlage", thema: "Zerlegen", kategorie: "mathe", datei: "vorlage.html", arten: [{ art: "zerlegung", zahlen: [7, 7], stufen: ["material"] }] });
        await route.fulfill({ response: antwort, json });
      });
      await seite.clock.install();
      await seite.goto(BASIS + "vorlage.html");
      await seite.waitForSelector("#tablett .stab");
      await seite.mouse.click(groesse.width / 2, groesse.height - 40);
      await seite.clock.runFor(60_000);
      await seite.mouse.click(groesse.width / 2, groesse.height - 40);
      await seite.clock.runFor(5 * 60_000); // nach der letzten Eingabe zählen höchstens zwei Minuten
      await seite.clock.runFor(1_000);
      const s = await lies(seite, "lernstand-kind-1-spielzeit-stand");
      const sek = s?.tage?.[heute]?.sekunden ?? 0;
      pruefe(L, "Takt: etwa 1 + 2 Minuten gezählt, nicht die ganzen 6", sek >= 165 && sek <= 200, String(sek));
      await kontext.close();
    }

    // 5. Elternbereich: Reiter Spielzeit stellt die Werte.
    {
      const { kontext, seite, konsole } = await neueSeite(browser, groesse, {
        "lernstand-eltern": JSON.stringify({ pinHash: await pinHash("1234") }),
      });
      await seite.goto(BASIS + "eltern.html");
      for (const z of "1234") await seite.evaluate((z) => [...document.querySelectorAll("#ziffern ls-knopf")].find((k) => k.getAttribute("wort") === z).click(), z);
      await seite.waitForFunction(() => !document.getElementById("bereich").hidden);
      await seite.evaluate(() => document.querySelector('[data-tab="spielzeit"]').click());
      await seite.waitForSelector('ls-knopf[name="Am Tag: mehr"]');
      const klick = (sel) => seite.evaluate((sel) => document.querySelector(sel).click(), sel);
      await klick('ls-knopf[name="Am Tag: mehr"]');
      await seite.waitForTimeout(100);
      await klick('ls-knopf[name="Am Tag: mehr"]');
      await klick('ls-knopf[name="Samstag: erlaubt"]');
      await klick('ls-knopf[name="In der Woche: mehr"]');
      await seite.waitForTimeout(100);
      await klick('ls-knopf[wort="Ausblenden"]');
      await seite.waitForTimeout(100);
      await klick('ls-knopf[wort="Wieder zeigen"]');
      await seite.waitForTimeout(100);
      await klick('ls-knopf[wort="Heute 15 Minuten mehr"]');
      await seite.waitForTimeout(500);
      const e = (await lies(seite, "lernstand-kind-1-einstellungen"))?.spielzeit;
      pruefe(L, "Eltern: Tag 15 min, Woche 30 min, Samstag aus, nicht ausgeblendet",
        e?.proTag === 15 && e?.proWoche === 30 && !e.tage.includes(6) && e.tage.length === 6 && e.ausgeblendet === false, JSON.stringify(e));
      const st = await lies(seite, "lernstand-kind-1-spielzeit-stand");
      pruefe(L, "Eltern: Zugabe 15 Minuten für heute", st?.tage?.[heute]?.zugabe === 15, JSON.stringify(st));
      const text = await seite.locator("#inhalt").innerText();
      pruefe(L, "Eltern: Stand zeigt Grenze und Zugabe", /Heute: 0 Minuten von 15 Minuten\./.test(text) && /Heute dazugegeben: 15 Minuten\./.test(text), text.slice(0, 400));
      const breit = await seite.evaluate(() => { const i = document.getElementById("inhalt"); return i.scrollWidth <= i.clientWidth + 1; });
      pruefe(L, "Eltern: nichts ragt waagrecht hinaus", breit);
      pruefe(L, "Eltern ohne Konsolenfehler", konsole.length === 0, konsole.join(" | "));
      if (SHOTS) {
        await seite.screenshot({ path: `${SHOTS}/spielzeit-eltern-${L}.png` });
        await seite.evaluate(() => { const i = document.getElementById("inhalt"); i.scrollTop = i.scrollHeight; });
        await seite.screenshot({ path: `${SHOTS}/spielzeit-eltern-unten-${L}.png` });
      }
      await kontext.close();
    }
  }
} finally {
  await browser.close();
  server.close();
}
console.log(`\n${geprueft - fehler}/${geprueft} geprüft, ${fehler} Fehler`);
process.exit(fehler ? 1 : 0);
