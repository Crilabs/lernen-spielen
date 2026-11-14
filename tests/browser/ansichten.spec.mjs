// Browser-Prüfung der Ansichten: Startseite (index.html), Fach-Seite (themen.html), Regal (regal.html) und
// Elternbereich (eltern.html). Kein Teil von `npm test`: braucht Playwright und installierte Browser.
//
// Aufruf wie tests/browser/rahmen.spec.mjs:
//   NODE_PATH=/private/tmp/claude-501/pw/node_modules node tests/browser/ansichten.spec.mjs
// Optional: SHOTS=/pfad/zum/ordner legt je Seite und Fall ein Bild <seite>-<fall>-<browser>-<breite>.png ab.
// Das Skript startet einen eigenen statischen Server auf einem freien Port und beendet sich mit Code 1,
// sobald eine Prüfung fehlschlägt.
//
// Geprüft wird in Chromium und WebKit bei 1920 × 1080, 1280 × 800 und 1440 × 1080 (4:3), je in drei Lernständen:
//   leer      kein Lernstand, keine Spiele (Entwicklungsstand): ruhige Seiten, keine Fehler;
//   gekonnt   gekonnte Themen, aber keine Spiele (aus entfernten Spielen): Regal und Regal-Kachel zeigen sie;
//   spiele    dazu drei Testspiele (nur im Browser per page.route in spiele.json, nichts davon im Repo) und
//             Themen „dran“: Dran-Kacheln, Fach-Kacheln, Weg mit dran und in Sicht.
// Dazu: keine Seiten- oder Konsolenfehler; direkter Aufruf von eltern.html zeigt die PIN (mit und ohne
// gespeicherte PIN), nie den Bereich; das Zahnrad führt nur durch Halten (3 s) zu eltern.html, kurzes Tippen
// tut nichts; themen.html ohne oder mit unbekanntem Fach führt zur Startseite; ein Themenname mit Ziffer wird als
// Aufnahme gesprochen (Ziffern-Regel), nie von der Systemstimme.
//
// WebKit: In diesem Playwright-Build (1.65, WebKit 27.2, macOS) landen echte Mausklicks mit falschen Koordinaten
// an <html>. Die Prüfung tippt deshalb in beiden Browsern per element.click() (evaluate); das Halten des Zahnrads
// geht in Chromium mit der echten Maus, in WebKit mit ausgelösten Pointer-Ereignissen, in beiden zusätzlich mit
// der Eingabetaste.

import { createRequire } from "node:module";
import http from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium, webkit } = require("playwright");

const WURZEL = resolve(fileURLToPath(import.meta.url), "../../..");
const TYPEN = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json", ".css": "text/css", ".svg": "image/svg+xml", ".mp3": "audio/mpeg",
  ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf", ".png": "image/png", ".jpg": "image/jpeg",
};

/** Statischer Server für das Repo-Verzeichnis; Port 0 = freier Port. */
function starteServer() {
  const server = http.createServer(async (req, res) => {
    const pfad = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (pfad === "/favicon.ico") return void res.writeHead(204).end();
    const datei = join(WURZEL, normalize(pfad));
    if (!datei.startsWith(WURZEL)) return void res.writeHead(403).end();
    try {
      const inhalt = await readFile(datei);
      res.writeHead(200, { "content-type": TYPEN[extname(datei)] ?? "application/octet-stream" }).end(inhalt);
    } catch {
      res.writeHead(404).end("nicht gefunden");
    }
  });
  return new Promise((ok) => server.listen(0, "127.0.0.1", () => ok(server)));
}

const AUFLOESUNGEN = [{ width: 1920, height: 1080 }, { width: 1280, height: 800 }, { width: 1440, height: 1080 }];
const SHOTS = process.env.SHOTS;
const pause = (ms) => new Promise((ok) => setTimeout(ok, ms));
const HALTEN_MS = 3000; // wie spiele/index.html

// --- Testdaten (nur im Browser) ----------------------------------------------------------------
// Spielsymbol wie ein echtes: Tinte-Kontur, flache Flächen (grundsaetze-bilder §6).
const SYMBOL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="#3B2A6B" stroke-width="4"
  stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="30" width="72" height="40" rx="6" fill="#F7EFE3"/>
  <circle cx="34" cy="50" r="8" fill="#E5484D"/><circle cx="56" cy="50" r="8" fill="#3FA34D"/></svg>`;
const SPIELE = [
  { id: "test-perlen", titel: "Perlenbrücke", kategorie: "mathe", symbol: "symbole/test-spiel.svg", datei: "test-perlen.html", welt: "muell-trennen", arten: [{ art: "zerlegung", zahlen: [2, 10], stufen: ["kopf"] }] },
  { id: "test-rechnen", titel: "Zahlenzauber mit Kettenhüpfern", kategorie: "mathe", symbol: "symbole/test-spiel.svg", datei: "test-rechnen.html", welt: "gibt-es-nicht", arten: [{ art: "rechnen", max: 100, gleiche: false, stufen: ["kopf"] }] },
  { id: "test-lesen", titel: "Silbenschiff", kategorie: "lesen", symbol: "symbole/test-spiel.svg", datei: "test-lesen.html" },
];
const eintrag = (z, k, u) => z === "kann-ich"
  ? { z, k, stufe: "kopf", v: [], e: "", seit: k, u: "", frei: 0 }
  : { z, k: "", stufe: "", v: [], e: "", seit: u, u, frei: 0 };
const GEKONNT = {
  "mengen-5": eintrag("kann-ich", "2026-11-01"), "zerlegen-2": eintrag("kann-ich", "2026-11-03"),
  "zerlegen-3": eintrag("kann-ich", "2026-11-05"), namenwoerter: eintrag("kann-ich", "2026-11-08"),
  "zerlegen-4": eintrag("kann-ich", "2026-11-10"),
};
const DRAN = { "zerlegen-5": eintrag("dran", "", "2026-11-13"), "rechnen-3": eintrag("dran", "", "2026-11-12"), "rechnen-4": eintrag("dran", "", "2026-11-11") };
// von den Eltern freigegeben: in Sicht (Perlenstab-Themen zeigen dort die Karte mit dem Fachsymbol)
const FREI = { "zerlegen-8": { z: "", k: "", stufe: "", v: [], e: "", seit: "", u: "", frei: 1 }, "rechnen-9": { z: "", k: "", stufe: "", v: [], e: "", seit: "", u: "", frei: 1 } };
const FAELLE = {
  leer: { stand: null, spiele: false },
  gekonnt: { stand: GEKONNT, spiele: false },
  spiele: { stand: { ...GEKONNT, ...DRAN, ...FREI }, spiele: true },
};

let fehler = 0;
let geprueft = 0;
/** @param {string} lauf @param {string} name @param {boolean} ok @param {string} [detail] */
function pruefe(lauf, name, ok, detail = "") {
  geprueft++;
  if (!ok) fehler++;
  console.log(`${ok ? "ok    " : "FEHLER"} [${lauf}] ${name}${ok ? "" : detail ? ` – ${detail}` : ""}`);
}

/** Neuer Kontext mit Lernstand, PIN und Testspielen; sammelt Fehler, Aufnahmen und Systemstimme. */
async function kontextFuer(browser, groesse, basis, { stand = null, spiele = false, pinHash = null } = {}, fehlerListe) {
  const kontext = await browser.newContext({ viewport: groesse, deviceScaleFactor: 1 });
  await kontext.addInitScript(({ stand, pinHash }) => {
    if (location.protocol !== "http:") return; // about:blank der neuen Seite hat keinen Speicher
    if (stand) localStorage.setItem("lernstand-kind-1-lernplan", JSON.stringify({ version: 1, themen: stand, aufgaben: {}, verlauf: [] }));
    if (pinHash) localStorage.setItem("lernstand-eltern", JSON.stringify({ pinHash }));
    // Systemstimme mitschreiben (nicht sprechen): die Ziffern-Regel prüft, was sie sagen würde.
    window.__system = [];
    if (window.speechSynthesis) window.speechSynthesis.speak = (u) => { window.__system.push(u.text); };
  }, { stand, pinHash });
  if (spiele) {
    await kontext.route("**/spiele/spiele.json", async (r) => {
      const res = await r.fetch();
      const j = await res.json();
      j.spiele = SPIELE;
      await r.fulfill({ response: res, json: j });
    });
    await kontext.route("**/spiele/symbole/test-spiel.svg", (r) => r.fulfill({ contentType: "image/svg+xml", body: SYMBOL }));
  }
  kontext.aufnahmen = [];
  kontext.on("request", (q) => { if (/\/spiele\/audio\/.+\.mp3$/.test(q.url())) kontext.aufnahmen.push(q.url()); });
  kontext.on("page", (seite) => {
    seite.on("pageerror", (e) => fehlerListe.push(`Seitenfehler (${seite.url()}): ${e.message}`));
    seite.on("console", (m) => { if (m.type() === "error") fehlerListe.push(`Konsole (${seite.url()}): ${m.text()}`); });
  });
  return kontext;
}

/** Öffnet eine Seite und wartet, bis Leiste und Schriften bereit sind und die Seite gezeichnet hat. */
async function oeffne(kontext, url) {
  const seite = await kontext.newPage();
  await seite.goto(url, { waitUntil: "load" });
  await seite.evaluate(async () => {
    await document.getElementById("leiste")?.bereit?.();
    await document.fonts.ready;
  });
  await pause(400); // Seiten laden lernplan.json und zeichnen danach
  return seite;
}

/** Tippen ohne Maus (siehe Kopf: WebKit). */
const tippe = (seite, sel) => seite.evaluate((s) => document.querySelector(s).click(), sel);

async function bild(seite, name) {
  if (!SHOTS) return;
  await mkdir(SHOTS, { recursive: true });
  await seite.screenshot({ path: join(SHOTS, `${name}.png`) });
}

async function lauf(typ, name, groesse, basis) {
  const L = `${name} ${groesse.width}x${groesse.height}`;
  const browser = await typ.launch();
  const fehlerListe = [];
  const s = (seite, fall) => `${seite}-${fall}-${name}-${groesse.width}`;
  try {
    for (const [fall, daten] of Object.entries(FAELLE)) {
      const F = `${L} ${fall}`;
      const kontext = await kontextFuer(browser, groesse, basis, daten, fehlerListe);

      // --- Startseite ----------------------------------------------------------------------------
      const start = await oeffne(kontext, `${basis}/spiele/index.html`);
      const st = await start.evaluate(() => {
        const box = (el) => { const r = el.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom }; };
        const imBild = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left >= 0 && r.top >= 0 && r.right <= innerWidth + 0.5 && r.bottom <= innerHeight + 0.5; };
        const tore = [...document.querySelectorAll("#dran a.tor")];
        const bretter = [...document.querySelectorAll("#faecher a.brett")];
        const leiste = document.getElementById("leiste");
        const kinder = [...document.querySelectorAll("#runde .kind svg")];
        // Körper der Figur: gemalte Fläche ohne den leeren Rand der viewBox
        const koerper = kinder.map((svg) => { const g = svg.querySelector("[data-schicht='kontur']") ?? svg; return box(g); });
        const ueber = (a, b) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;
        // Ohne tabindex folgt die Tab-Reihenfolge der Reihenfolge im DOM.
        const fokus = document.querySelector(".bedienung [tabindex]") ? ["tabindex"] : [...document.querySelectorAll(".bedienung a")].map((a) => a.classList[0]);
        return {
          tore: tore.length,
          toreLinks: tore.map((a) => a.getAttribute("href")),
          toreWelt: tore.map((a) => a.dataset.welt ?? null),
          toreImBild: tore.every(imBild),
          namePasst: tore.every((a) => a.querySelector("b").scrollWidth <= a.querySelector(".text").clientWidth + 1),
          faecher: bretter.map((a) => a.getAttribute("href")),
          bretterImBild: bretter.every(imBild),
          schriftFrei: [...tore.map((a) => a.querySelector(".text")), ...bretter].every((t) => koerper.every((k) => !ueber(box(t), k))),
          regal: imBild(document.getElementById("regal")),
          kinder: kinder.length,
          kinderImBild: koerper.every((k) => k.l >= 0 && k.r <= innerWidth + 0.5 && k.b <= innerHeight + 0.5),
          pfahl: getComputedStyle(document.getElementById("pfahl")).display !== "none",
          fokus,
          dinge: document.getElementById("dinge").children.length,
          hausWeg: leiste.shadowRoot.querySelector("a.haus").hidden,
          zahnrad: imBild(document.getElementById("zahnrad")),
          text: document.body.innerText,
        };
      });
      pruefe(F, "Startseite: Baumhaus (Regal) ganz im Bild, Haus fehlt, Zahnrad da", st.regal && st.hausWeg && st.zahnrad, JSON.stringify(st));
      pruefe(F, "Startseite: die Runde steht ganz im Bild (vier Kinder)", st.kinder === 4 && st.kinderImBild, JSON.stringify(st));
      pruefe(F, "Startseite: keine Zahl als Fortschritt („x von y“, Prozent)", !/\d+\s*(von|\/)\s*\d+|%/.test(st.text), st.text);
      if (fall === "leer") {
        pruefe(F, "Startseite leer: kein Tor, kein Brett, kein Pfahl, leeres Regal", st.tore === 0 && st.faecher.length === 0 && !st.pfahl && st.dinge === 0, JSON.stringify(st));
      } else if (fall === "gekonnt") {
        pruefe(F, "Startseite ohne Spiele: kein Tor, kein Brett, Regal zeigt drei Dinge", st.tore === 0 && st.faecher.length === 0 && st.dinge === 3, JSON.stringify(st));
      } else {
        pruefe(F, "Startseite mit Spielen: höchstens drei Tore mit ?thema=, ganz im Bild", st.tore >= 1 && st.tore <= 3 && st.toreImBild && st.toreLinks.every((h) => /\.html\?thema=/.test(h)), JSON.stringify(st.toreLinks));
        pruefe(F, "Startseite mit Spielen: Bretter nur für Fächer mit Spielen (Mathe, Lesen), ganz im Bild, Pfahl da",
          JSON.stringify(st.faecher) === JSON.stringify(["themen.html?fach=mathe", "themen.html?fach=lesen"]) && st.bretterImBild && st.pfahl, JSON.stringify(st.faecher));
        pruefe(F, "Tore: Weltandeutung nur bei bekannter Welt (muell-trennen ja, gibt-es-nicht nein)",
          st.toreWelt.includes("muell-trennen") && !st.toreWelt.includes("gibt-es-nicht"), JSON.stringify(st.toreWelt));
        pruefe(F, "Tore: langer Spielname passt ins Schild", st.namePasst, JSON.stringify(st));
        pruefe(F, "Schilder und Bretter überdecken keine Figur", st.schriftFrei, JSON.stringify(st));
        const erst = st.fokus.lastIndexOf("tor"), brett = st.fokus.indexOf("brett"), bh = st.fokus.indexOf("baumhaus");
        pruefe(F, "Tab-Reihenfolge: Tore, dann Bretter, dann Baumhaus", erst < brett && brett < bh, JSON.stringify(st.fokus));
      }
      await bild(start, s("start", fall));
      await start.close();

      // --- Fach-Seite ----------------------------------------------------------------------------
      if (fall === "leer") {
        // ohne eine einzige Station: keine leere Wegzeile, zurück zur Startseite
        const seite = await kontext.newPage();
        await seite.goto(`${basis}/spiele/themen.html?fach=mathe`);
        await seite.waitForURL(/\/spiele\/index\.html$/, { timeout: 5000 }).catch(() => {});
        pruefe(F, "Fach-Seite ohne Stationen → Startseite", seite.url().endsWith("/spiele/index.html"), seite.url());
        await seite.close();
      }
      const fach = fall === "leer" ? null : await oeffne(kontext, `${basis}/spiele/themen.html?fach=mathe`);
      if (fach) {
      const fs = await fach.evaluate(() => {
        const st = [...document.querySelectorAll("#reihe .station")];
        const art = (z) => st.filter((b) => b.classList.contains(z));
        return {
          url: location.pathname,
          fehlerText: !!document.querySelector(".fehler"),
          gekonnt: art("kann-ich").length, dran: art("dran").length, inSicht: art("in-sicht").length,
          inSichtKarten: art("in-sicht").every((b) => b.querySelector(".karte.symbol i") && !/\d/.test(b.textContent)
            && getComputedStyle(b.querySelector(".karte")).borderTopColor === getComputedStyle(b).borderTopColor),
          flaeche: !document.getElementById("flaeche").hidden,
          spiele: document.querySelectorAll("#spiele a.spiel").length,
          ico: (() => { const i = document.querySelector("#spiele .ico"); return i ? getComputedStyle(i).backgroundColor : null; })(),
        };
      });
      pruefe(F, "Fach-Seite: bleibt auf themen.html, keine Fehlermeldung", fs.url.endsWith("/themen.html") && !fs.fehlerText, JSON.stringify(fs));
      if (fall === "gekonnt") pruefe(F, "Fach-Seite ohne Spiele: die vier gekonnten Mathe-Themen, nichts dran oder in Sicht", fs.gekonnt === 4 && fs.dran === 0 && fs.inSicht === 0, JSON.stringify(fs));
      if (fall === "spiele") {
        pruefe(F, "Fach-Seite mit Spielen: gekonnt, dran, höchstens zwei in Sicht (Karte mit Fachsymbol, Rand in Naht, ohne Ziffer)",
          fs.gekonnt === 4 && fs.dran >= 1 && fs.inSicht >= 1 && fs.inSicht <= 2 && fs.inSichtKarten, JSON.stringify(fs));
        pruefe(F, "Fach-Seite: das Thema dran ist aufgeschlagen, mit Spiel-Kachel auf der Füllung", fs.flaeche && fs.spiele >= 1 && fs.ico === "rgb(240, 107, 176)", JSON.stringify(fs));
        // Ziffern-Regel: „Die 5 zerlegen“ antippen spricht die Aufnahme seines sprich, die Systemstimme schweigt.
        const vorher = kontext.aufnahmen.length;
        const name = await fach.evaluate(() => {
          const b = document.querySelector("#reihe .station.dran");
          b.click();
          return b.getAttribute("aria-label");
        });
        await pause(800);
        const system = await fach.evaluate(() => window.__system);
        pruefe(F, `Themenname mit Ziffer („${name}“) kommt als Aufnahme, nicht von der Systemstimme`,
          /\d/.test(name) && kontext.aufnahmen.length > vorher && !system.some((t) => /\d/.test(t)),
          `Aufnahmen ${kontext.aufnahmen.length - vorher}, Systemstimme ${JSON.stringify(system)}`);
      }
      await bild(fach, s("fach", fall));
      await fach.close();
      }

      // --- Regal ---------------------------------------------------------------------------------
      const regal = await oeffne(kontext, `${basis}/spiele/regal.html`);
      const rg = await regal.evaluate(() => ({
        leer: document.querySelector(".brett.leer p")?.textContent ?? "",
        dinge: document.querySelectorAll("#regal .ding").length,
        bretter: [...document.querySelectorAll("#regal .brett:not(.leer)")].map((b) => b.getAttribute("aria-label")),
        text: document.body.innerText,
      }));
      if (fall === "leer") pruefe(F, "Regal leer: der Satz des Erzählers, kein Ding", rg.leer === "Hier stellst du hin, was du kannst." && rg.dinge === 0, JSON.stringify(rg));
      else pruefe(F, "Regal: alle fünf gekonnten Dinge (auch ohne Spiele), Bretter Mathe und Grammatik",
        rg.dinge === 5 && JSON.stringify(rg.bretter) === JSON.stringify(["Mathe", "Grammatik"]), JSON.stringify(rg));
      pruefe(F, "Regal: keine Zahl als Fortschritt", !/\d+\s*(von|\/)\s*\d+|%/.test(rg.text), rg.text);
      await bild(regal, s("regal", fall));
      await regal.close();

      // --- Elternbereich: direkter Aufruf zeigt die PIN ------------------------------------------
      const eltern = await oeffne(kontext, `${basis}/spiele/eltern.html`);
      const el = await eltern.evaluate(() => ({ pin: !document.getElementById("pin").hidden, bereich: !document.getElementById("bereich").hidden,
        titel: document.getElementById("pin-titel").textContent }));
      pruefe(F, "eltern.html direkt: PIN (neu festlegen), Bereich verborgen", el.pin && !el.bereich && el.titel === "Neue PIN festlegen", JSON.stringify(el));
      await bild(eltern, s("eltern", fall));
      await eltern.close();
      await kontext.close();
    }

    // --- eltern.html mit gespeicherter PIN ----------------------------------------------------------
    {
      const kontext = await kontextFuer(browser, groesse, basis, { stand: GEKONNT, pinHash: "nicht-zu-erraten" }, fehlerListe);
      const eltern = await oeffne(kontext, `${basis}/spiele/eltern.html`);
      const el = await eltern.evaluate(() => ({ pin: !document.getElementById("pin").hidden, bereich: !document.getElementById("bereich").hidden,
        titel: document.getElementById("pin-titel").textContent, inhalt: document.getElementById("inhalt").textContent.trim().length }));
      pruefe(L, "eltern.html direkt mit PIN: PIN abfragen, Bereich verborgen und leer", el.pin && !el.bereich && el.titel === "Für Erwachsene" && el.inhalt === 0, JSON.stringify(el));
      await bild(eltern, `eltern-pin-${name}-${groesse.width}`);
      await kontext.close();
    }

    // --- themen.html ohne oder mit unbekanntem Fach → Startseite -------------------------------------
    for (const such of ["", "?fach=gibtsnicht"]) {
      const kontext = await kontextFuer(browser, groesse, basis, {}, fehlerListe);
      const seite = await kontext.newPage();
      await seite.goto(`${basis}/spiele/themen.html${such}`);
      await seite.waitForURL(/\/spiele\/index\.html$/, { timeout: 5000 }).catch(() => {});
      pruefe(L, `themen.html${such || " ohne fach"} → Startseite`, seite.url().endsWith("/spiele/index.html"), seite.url());
      await kontext.close();
    }

    // --- Ton aus auf der Startseite gilt auch im Regal und auf der Fach-Seite -------------------------
    {
      const kontext = await kontextFuer(browser, groesse, basis, { stand: GEKONNT }, fehlerListe);
      const start = await oeffne(kontext, `${basis}/spiele/index.html`);
      await start.evaluate(() => document.getElementById("leiste").tonKnopf.click());
      await pause(300);
      const aus = await start.evaluate(() => document.getElementById("leiste").ton);
      await start.close();
      const tonAn = {};
      for (const [seite, url] of [["Regal", "regal.html"], ["Fach-Seite", "themen.html?fach=mathe"]]) {
        const p = await oeffne(kontext, `${basis}/spiele/${url}`);
        tonAn[seite] = await p.evaluate(() => document.getElementById("leiste").ton);
        await p.close();
      }
      pruefe(L, "Ton aus auf der Startseite: Regal und Fach-Seite bleiben stumm (ein gemeinsamer Schalter)",
        aus === false && tonAn["Regal"] === false && tonAn["Fach-Seite"] === false, JSON.stringify({ aus, ...tonAn }));
      await kontext.close();
    }

    // --- Zahnrad: nur durch Halten ------------------------------------------------------------------
    {
      const kontext = await kontextFuer(browser, groesse, basis, {}, fehlerListe);
      const seite = await oeffne(kontext, `${basis}/spiele/index.html`);
      const amStart = () => seite.url().endsWith("/spiele/index.html");
      // kurz tippen (Klick) und kurz halten (0,5 s) führen nirgends hin
      await tippe(seite, "#eltern");
      await pause(300);
      const nachTippen = amStart();
      const druecke = async (ms) => {
        if (name === "chromium") {
          const r = await seite.locator("#zahnrad").boundingBox();
          await seite.mouse.move(r.x + r.width / 2, r.y + r.height / 2);
          await seite.mouse.down();
          await pause(ms);
          await seite.mouse.up();
        } else {
          await seite.evaluate(() => document.getElementById("zahnrad").dispatchEvent(new PointerEvent("pointerdown", { pointerId: 7, bubbles: true })));
          await pause(ms);
          await seite.evaluate(() => document.getElementById("zahnrad")?.dispatchEvent(new PointerEvent("pointerup", { pointerId: 7, bubbles: true })));
        }
      };
      await druecke(500);
      await pause(HALTEN_MS); // falls der Abbruch fehlte, wäre die Seite jetzt gewechselt
      const nachKurz = amStart();
      const halten = await seite.evaluate(() => document.getElementById("zahnrad").classList.contains("haelt"));
      pruefe(L, "Zahnrad: Tippen und kurzes Halten bleiben auf der Startseite", nachTippen && nachKurz && !halten, seite.url());
      await druecke(HALTEN_MS + 600).catch(() => {}); // die Seite wechselt während des Haltens
      await seite.waitForURL(/\/spiele\/eltern\.html$/, { timeout: 3000 }).catch(() => {});
      pruefe(L, "Zahnrad 3 s halten → eltern.html (mit PIN)", seite.url().endsWith("/spiele/eltern.html")
        && (await seite.evaluate(() => !document.getElementById("pin").hidden && document.getElementById("bereich").hidden).catch(() => false)), seite.url());
      // Tastatur: Eingabetaste halten
      await seite.goto(`${basis}/spiele/index.html`);
      await seite.evaluate(() => document.getElementById("leiste").bereit());
      await seite.evaluate(() => document.getElementById("eltern").shadowRoot.querySelector("button").focus());
      await seite.keyboard.down("Enter");
      await pause(400);
      await seite.keyboard.up("Enter");
      await pause(HALTEN_MS);
      const tasteKurz = amStart();
      await seite.evaluate(() => document.getElementById("eltern").shadowRoot.querySelector("button").focus());
      await seite.keyboard.down("Enter");
      await seite.waitForURL(/\/spiele\/eltern\.html$/, { timeout: HALTEN_MS + 2000 }).catch(() => {});
      await seite.keyboard.up("Enter").catch(() => {});
      pruefe(L, "Zahnrad mit Eingabetaste: kurz nichts, 3 s halten → eltern.html", tasteKurz && seite.url().endsWith("/spiele/eltern.html"), seite.url());
      await kontext.close();
    }

    pruefe(L, "keine Seiten- oder Konsolenfehler", fehlerListe.length === 0, fehlerListe.join(" | "));
  } finally {
    await browser.close();
  }
}

const server = await starteServer();
const basis = `http://127.0.0.1:${server.address().port}`;
console.log(`Server ${basis}`);
try {
  for (const [name, typ] of [["chromium", chromium], ["webkit", webkit]]) {
    for (const groesse of AUFLOESUNGEN) await lauf(typ, name, groesse, basis);
  }
} catch (e) {
  fehler++;
  console.log(`FEHLER Skript: ${e.stack ?? e}`);
} finally {
  server.close();
}
console.log(`\n${geprueft - fehler} von ${geprueft} Prüfungen bestanden, ${fehler} Fehler`);
process.exit(fehler ? 1 : 0);
