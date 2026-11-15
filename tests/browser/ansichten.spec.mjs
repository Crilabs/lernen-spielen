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
//   leer      kein Lernstand, keine Spiele (spiele.json per page.route leer): ruhige Seiten, keine Fehler;
//   gekonnt   gekonnte Themen, aber keine Spiele (aus entfernten Spielen): Regal und Regal-Kachel zeigen sie;
//   spiele    dazu drei Testspiele (nur im Browser per page.route in spiele.json, nichts davon im Repo) und
//             Themen „dran“: Dran-Kacheln, Fach-Kacheln, Weg mit dran und in Sicht.
// Dazu: keine Seiten- oder Konsolenfehler; direkter Aufruf von eltern.html zeigt die PIN (mit und ohne
// gespeicherte PIN), nie den Bereich; das Zahnrad führt nur durch Halten (3 s) zu eltern.html, kurzes Tippen
// tut nichts; themen.html ohne oder mit unbekanntem Fach führt zur Startseite; ein Themenname mit Ziffer wird als
// Aufnahme gesprochen (Ziffern-Regel), nie von der Systemstimme.
// Übersicht „Mit echten Dingen“ (mit-echten-dingen.html, ohne PIN): Gerade dran (auch ohne Spiel), Bald, Zum
// Wiederholen, aufklappbar mit allen Formen, keine Zahlen, kein Kopf mit Quellen; Zugang aus dem Elternbereich; PDF je
// Thema über kern/geraet.js; das Blatt (Chromium, page.pdf) zeigt alle Formen voll, ohne Bedienelemente, A4.
//
// WebKit: In diesem Playwright-Build (1.65, WebKit 27.2, macOS) landen echte Mausklicks mit falschen Koordinaten
// an <html>. Die Prüfung tippt deshalb in beiden Browsern per element.click() (evaluate); das Halten des Zahnrads
// geht in Chromium mit der echten Maus, in WebKit mit ausgelösten Pointer-Ereignissen, in beiden zusätzlich mit
// der Eingabetaste.

import { createRequire } from "node:module";
import http from "node:http";
import { starteServer } from "./server.mjs";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium, webkit } = require("playwright");
const { pinHash } = await import("../../spiele/eltern.js");

const WURZEL = resolve(fileURLToPath(import.meta.url), "../../..");
// Server mit Byte-Bereichen: tests/browser/server.mjs (WebKit braucht Range für Audio).

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
  { id: "test-perlen", titel: "Perlenbrücke", kategorie: "mathe", symbol: "symbole/test-spiel.svg", datei: "test-perlen.html", welt: "muell-trennen", arten: [{ art: "zerlegung", zahlen: [2, 10], stufen: ["kopf"] }],
    beschreibung: "Das Kind legt Perlen zu einer Brücke und sieht, aus welchen zwei Teilen die Zahl besteht. So übt es das Zerlegen mit etwas, das es greifen kann." },
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
// Übersicht „Mit echten Dingen“: drei Themen mit Anleitung dran (auch ohne Spiel), gekonnte zum Wiederholen.
const ECHT = {
  "mehr-weniger-gleich-viele": eintrag("kann-ich", "2026-11-01"), "mengen-5": eintrag("kann-ich", "2026-11-02"),
  "reim-hoeren": eintrag("kann-ich", "2026-11-03"), "zerlegen-5": eintrag("kann-ich", "2026-11-05"), "zerlegen-6": eintrag("kann-ich", "2026-11-08"),
  "vorwaerts-zaehlen": eintrag("dran", "", "2026-11-12"), "zerlegen-7": eintrag("dran", "", "2026-11-13"), "silben-klatschen": eintrag("dran", "", "2026-11-11"),
};
// Eine Anleitung mit drei langen Formen (je sechs Schritte, etwa 120 Wörter) für die Probe „Blatt mit drei Formen“.
const DREI_STAND = { "zerlegen-2": eintrag("dran", "", "2026-11-13") };
const langeForm = (wort, name) => `## ${wort}: ${name}\n\n`
  + "Ihr braucht: sieben Nudeln, zwei Teller, einen Becher, ein Tuch und einen Würfel aus dem Spieleschrank\n\n"
  + [1, 2, 3, 4, 5, 6].map((n) => `${n}. Verteilt die Nudeln auf die zwei Teller und sagt dabei laut, was ihr auf beiden Tellern seht.`).join("\n")
  + "\n\n**Darauf kommt es an:** Es bleiben immer sieben Nudeln. Wandert eine Nudel hinüber, hat ein Teller eine weniger und der andere eine mehr, so lange ihr spielt.\n\n"
  + "**Leichter:** mit fünf. **Schwerer:** mit zehn.\n\n";
const DREI_FORMEN = `---\nthema: zerlegen-2\nfach: mathe\n---\n# Probe\n\n${langeForm("Unterwegs", "Steine")}${langeForm("Am Tisch", "Nudeln")}${langeForm("In Bewegung", "Hüpfen")}`;
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
  // Die Spiele kommen immer aus dem Test, nie aus dem Repo: ohne `spiele` eine leere Liste (Fälle „keine Spiele“
  // bleiben gültig, auch wenn spiele.json echte Spiele hat), mit `spiele` die drei Testspiele.
  await kontext.route("**/spiele/spiele.json", async (r) => {
    const res = await r.fetch();
    const j = await res.json();
    j.spiele = spiele ? SPIELE : [];
    await r.fulfill({ response: res, json: j });
  });
  if (spiele) await kontext.route("**/spiele/symbole/test-spiel.svg", (r) => r.fulfill({ contentType: "image/svg+xml", body: SYMBOL }));
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
        const imBild = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left >= 0 && r.top >= 0 && r.right <= innerWidth + 0.5 && r.bottom <= innerHeight + 0.5; };
        const leiste = document.getElementById("leiste");
        const raster = document.getElementById("raster").getBoundingClientRect();
        const seite = document.getElementById("seite").getBoundingClientRect();
        const karten = [...document.querySelectorAll("#raster .karte.spiel")];
        return {
          abschnitte: [...document.querySelectorAll(".fach-abschnitt")].map((a) => a.getAttribute("aria-label")),
          karten: karten.length,
          links: karten.map((a) => a.getAttribute("href")),
          jeFach: Math.max(0, ...[...document.querySelectorAll(".fach-abschnitt")].map((a) => a.querySelectorAll(".karte.spiel").length)),
          echt: document.querySelectorAll("#raster .karte.echt").length,
          namePasst: karten.every((a) => a.querySelector("b").scrollWidth <= a.querySelector(".text").clientWidth + 1),
          zuletzt: document.querySelectorAll(".zuletzt .ding").length,
          regalKnopf: document.querySelector(".regal-knopf")?.getAttribute("href") ?? null,
          regalImBild: imBild(document.querySelector(".regal-knopf")),
          rechts: seite.left >= raster.right - 1,
          hausWeg: leiste.shadowRoot.querySelector("a.haus").hidden,
          zahnrad: imBild(document.getElementById("zahnrad")),
          text: document.body.innerText,
        };
      });
      pruefe(F, "Startseite: Regal-Knopf ganz im Bild (→ regal.html), Seitenleiste rechts, Haus fehlt, Zahnrad da",
        st.regalKnopf === "regal.html" && st.regalImBild && st.rechts && st.hausWeg && st.zahnrad, JSON.stringify(st));
      pruefe(F, "Startseite: keine Zahl als Fortschritt („x von y“, Prozent)", !/\d+\s*(von|\/)\s*\d+|%/.test(st.text), st.text);
      if (fall === "leer") {
        pruefe(F, "Startseite leer: keine Karte, Satz statt Raster, Zuletzt gelernt leer", st.karten === 0 && st.echt === 0 && st.zuletzt === 0 && /Hier kommen bald Spiele/.test(st.text), JSON.stringify(st));
      } else if (fall === "gekonnt") {
        pruefe(F, "Startseite ohne Spiele: keine Karte, Zuletzt gelernt zeigt fünf Dinge", st.karten === 0 && st.zuletzt === 5, JSON.stringify(st));
      } else {
        pruefe(F, "Startseite mit Spielen: Abschnitt Mathe, Karten mit ?thema=, höchstens 5 je Fach",
          st.abschnitte[0] === "Mathe" && st.karten >= 1 && st.jeFach <= 5 && st.links.every((h) => /\.html\?thema=/.test(h)), JSON.stringify(st));
        pruefe(F, "Startseite: Spielname passt auf die Karte", st.namePasst, JSON.stringify(st));
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
        leer: document.querySelector(".leer p")?.textContent ?? "",
        reiter: [...document.querySelectorAll(".reiter-knopf")].map((k) => k.textContent.trim()),
        aktiv: document.querySelector('.reiter-knopf[aria-selected="true"]')?.textContent.trim() ?? "",
        dinge: document.querySelectorAll("#bretter .ding").length,
        bretter: [...document.querySelectorAll("#bretter .brett")].map((b) => b.getAttribute("aria-label")),
        detail: !document.getElementById("detail").hidden && document.getElementById("name").textContent,
        text: document.body.innerText,
      }));
      if (fall === "leer") pruefe(F, "Regal leer: der Satz des Erzählers, kein Ding", rg.leer === "Hier stellst du hin, was du kannst." && rg.dinge === 0, JSON.stringify(rg));
      else {
        pruefe(F, "Regal: Reiter Mathe und Grammatik, der erste (Mathe) gewählt, Bretter je Bereich",
          JSON.stringify(rg.reiter) === JSON.stringify(["Mathe", "Grammatik"]) && rg.aktiv === "Mathe" && rg.bretter.length >= 1 && !rg.bretter.includes("Mathe"), JSON.stringify(rg));
        pruefe(F, "Regal: Detail rechts zeigt das Neueste des Fachs", typeof rg.detail === "string" && rg.detail.length > 0, JSON.stringify(rg));
        const gr = await regal.evaluate(async () => {
          [...document.querySelectorAll(".reiter-knopf")].find((k) => k.dataset.fach === "grammatik").click();
          await new Promise((r) => setTimeout(r, 100));
          const gewaehlt = document.querySelector('#bretter .ding[aria-pressed="true"]');
          return { dinge: document.querySelectorAll("#bretter .ding").length, passt: !!gewaehlt && gewaehlt === document.querySelector("#bretter .ding")
            && document.getElementById("name").textContent === gewaehlt.querySelector(".name").textContent };
        });
        pruefe(F, "Regal: Reiterwechsel wählt das erste Thema des Fachs, Detail passt dazu", gr.passt, JSON.stringify(gr));
        const alle = rg.dinge + gr.dinge;
        pruefe(F, "Regal: alle fünf gekonnten Dinge über die Reiter (auch ohne Spiele)", alle === 5, JSON.stringify({ mathe: rg.dinge, grammatik: gr.dinge }));
      }
      await bild(regal, s("regal", fall));
      await regal.close();

      // --- Mit echten Dingen: Anleitung aus der Datei (zerlegen-2 über die Familie mathe/zerlegen.md), sonst der Einzeiler
      if (fall === "leer") {
        const echt = await oeffne(kontext, `${basis}/spiele/echt.html?thema=zerlegen-2`);
        const ea = await echt.evaluate(async () => {
          // auf das Laden warten (Verzeichnis und Datei kommen nacheinander)
          for (let i = 0; i < 50 && !document.querySelector(".anleitung h1"); i++) await new Promise((r) => setTimeout(r, 50));
          const titel = document.querySelector(".anleitung h1")?.textContent ?? "";
          const quellen = /quellen|abgerufen|pikas/i.test(document.body.innerText);
          const sichtbareForm = () => [...document.querySelectorAll(".form")].filter((f) => !f.hidden).map((f) => f.dataset.situation);
          const vorher = sichtbareForm();
          document.querySelector('.form-knopf[data-situation="unterwegs"]').click();
          const nachher = sichtbareForm();
          const form = document.querySelector('.form[data-situation="unterwegs"]');
          const schritte = form.querySelectorAll(".schritte li").length;
          const [l, sw] = ["leichter", "schwerer"].map((x) => form.querySelector(`.stufe[data-stufe="${x}"]`));
          l.click(); sw.click();
          await new Promise((r) => setTimeout(r, 50));
          const sichtbar = [...form.querySelectorAll(".stufen-text")].filter((p) => !p.hidden).map((p) => p.dataset.stufe);
          return { titel, schritte, quellen, vorher, nachher, sichtbar, fach: document.getElementById("leiste").getAttribute("fach") };
        });
        pruefe(F, "Mit echten Dingen: Anleitung mit Titel, Wahl der Situation (eine Form zur Zeit), vier Schritten, ohne Quellen, Fach Mathe; eine Stufe zur Zeit",
          ea.titel === "Eine Zahl in zwei Teile legen" && JSON.stringify(ea.vorher) === '["tisch"]' && JSON.stringify(ea.nachher) === '["unterwegs"]'
          && ea.schritte === 4 && !ea.quellen && ea.fach === "mathe" && JSON.stringify(ea.sichtbar) === '["schwerer"]', JSON.stringify(ea));
        await bild(echt, s("echt", "anleitung"));
        await echt.close();
        const ersatz = await oeffne(kontext, `${basis}/spiele/echt.html?thema=rechnen-3`);
        const ez = await ersatz.evaluate(() => ({ einzeiler: !!document.querySelector(".einzeiler")?.textContent, schritte: document.querySelectorAll(".schritte li").length }));
        pruefe(F, "Mit echten Dingen ohne Datei: der Einzeiler aus dem Lernplan", ez.einzeiler && ez.schritte === 0, JSON.stringify(ez));
        await ersatz.close();
      }

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

    // --- Beschreibung für Erwachsene: im Elternbereich (hinter der PIN) sichtbar, nie auf der Startseite --------
    {
      const kontext = await kontextFuer(browser, groesse, basis, { stand: GEKONNT, spiele: true, pinHash: await pinHash("1234") }, fehlerListe);
      const start = await oeffne(kontext, `${basis}/spiele/index.html`);
      const startText = await start.evaluate(() => document.body.innerText + [...document.querySelectorAll("[aria-label],[title]")].map((e) => e.getAttribute("aria-label") + e.getAttribute("title")).join(" "));
      pruefe(L, "Startseite: Beschreibung für Erwachsene steht nicht auf den Karten", !/Perlen zu einer Brücke/.test(startText));
      await start.close();
      const eltern = await oeffne(kontext, `${basis}/spiele/eltern.html`);
      for (const z of "1234") await eltern.evaluate((z) => [...document.querySelectorAll("#ziffern ls-knopf")].find((k) => k.getAttribute("wort") === z).click(), z);
      await eltern.waitForFunction(() => !document.getElementById("bereich").hidden);
      await eltern.evaluate(() => document.querySelector('[data-tab="lernstand"]').click());
      await eltern.waitForSelector("details.spiel-beschreibung", { state: "attached", timeout: 5000 }).catch(() => {});
      const bs = await eltern.evaluate(() => [...document.querySelectorAll("details.spiel-beschreibung")].map((d) => ({
        titel: d.querySelector("summary").textContent, text: d.querySelector("p").textContent, offen: d.open })));
      pruefe(L, "Elternbereich: das Spiel mit Beschreibung ist unter seinem Fach aufklappbar, die anderen haben keine", bs.length === 1 && bs[0].titel === "Perlenbrücke"
        && /^Das Kind legt Perlen zu einer Brücke/.test(bs[0].text) && !bs[0].offen, JSON.stringify(bs));
      await eltern.evaluate(() => document.querySelector("details.spiel-beschreibung > summary").click());
      const sichtbar = await eltern.evaluate(() => { const r = document.querySelector("details.spiel-beschreibung > p").getBoundingClientRect(); return r.width > 0 && r.height > 0; });
      pruefe(L, "Elternbereich: Beschreibung nach dem Aufklappen sichtbar", sichtbar);
      await bild(eltern, `eltern-beschreibung-${name}-${groesse.width}`);
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

    // --- Mit echten Dingen: Übersicht, Zugang aus dem Elternbereich, PDF je Thema ------------------------
    // ?entwurf: auch Entwürfe; Fall „app“: ohne ?entwurf liest die App nur verzeichnis.json – hier eines ohne Einträge
    // (als gäbe es nur Entwürfe), dann zeigt sie keine Formen. Die Trennung selbst prüft tests/echte-dinge.test.mjs.
    // „drei“: eine Anleitung mit drei langen Formen (nur im Browser per page.route): Reihenfolge, kleiner gesetzt, keine Form geteilt.
    for (const [fall, stand, such] of [["leer", null, "?entwurf"], ["echt", ECHT, "?entwurf"], ["app", ECHT, ""], ["drei", DREI_STAND, "?entwurf"]]) {
      const F = `${L} echte-dinge ${fall}`;
      const kontext = await kontextFuer(browser, groesse, basis, { stand }, fehlerListe);
      await kontext.addInitScript(() => { window.__gedruckt = 0; window.print = () => { window.__gedruckt++; }; });
      if (fall === "app") {
        await kontext.route("**/mit-echten-dingen/verzeichnis.json", (r) => r.fulfill({ contentType: "application/json", body: '{"themen":{}}' }));
      }
      if (fall === "drei") {
        // zerlegen-2 gehört zur Familie mathe/zerlegen.md (themen:), die Datei holt ladeAnleitung über das Verzeichnis
        await kontext.route("**/mit-echten-dingen/mathe/zerlegen.md", (r) => r.fulfill({ contentType: "text/markdown", body: DREI_FORMEN }));
      }
      const seite = await kontext.newPage();
      await seite.goto(`${basis}/spiele/mit-echten-dingen.html${such}`, { waitUntil: "load" });
      await seite.waitForFunction(() => document.body.dataset.bereit === "1", null, { timeout: 8000 });
      await seite.evaluate(() => document.fonts.ready);
      const ue = await seite.evaluate(() => {
        const teil = (titel) => [...document.querySelectorAll("section.abschnitt")].find((x) => x.querySelector("h2").textContent === titel);
        const namen = (t) => (t ? [...t.querySelectorAll("details.thema summary .name b")].map((b) => b.textContent) : null);
        const erstes = document.querySelector("details.thema");
        return {
          dran: namen(teil("Gerade dran")), bald: namen(teil("Bald")), wieder: namen(teil("Zum Wiederholen")),
          offen: erstes?.open ?? false, formenOffen: erstes ? erstes.querySelectorAll(".spiel").length : 0,
          formenAlle: document.querySelectorAll("article.spiel").length,
          situationen: erstes ? [...erstes.querySelectorAll("summary .situation")].map((x) => x.textContent) : [],
          pdf: [...document.querySelectorAll("[data-pdf]")].map((k) => k.dataset.pdf),
          mitFormen: [...document.querySelectorAll("details.thema")].filter((d) => d.querySelector(".spiel")).length,
          text: document.body.innerText,
        };
      });
      if (fall === "leer") {
        pruefe(F, "Übersicht ohne Lernstand: nichts dran, kein PDF-Knopf", JSON.stringify(ue.dran) === "[]" && /Gerade ist kein Thema dran/.test(ue.text) && ue.pdf.length === 0, JSON.stringify(ue.dran));
      } else if (fall === "app") {
        pruefe(F, "ohne ?entwurf nur verzeichnis.json: ohne Eintrag keine Formen, kein PDF-Knopf",
          ue.dran?.includes("Die 7 zerlegen") && ue.formenAlle === 0 && ue.pdf.length === 0, JSON.stringify({ ...ue, text: undefined }));
      } else if (fall === "echt") {
        pruefe(F, "Übersicht: Gerade dran mit den Themen dran (auch ohne Spiel), zuerst aufgeklappt mit allen seinen Formen",
          ["Vorwärts zählen", "Die 7 zerlegen", "Silben klatschen"].every((n) => ue.dran?.includes(n)) && ue.offen && ue.formenOffen >= 1
            && ue.situationen.length === ue.formenOffen, JSON.stringify({ ...ue, text: undefined }));
        pruefe(F, "Übersicht: höchstens ein Thema ohne Spiel je begonnenem Fach unter Gerade dran",
          ue.dran.length <= 3 + 2, JSON.stringify(ue.dran));
        pruefe(F, "Übersicht: Zum Wiederholen die drei zuletzt gekonnten, neueste zuerst",
          JSON.stringify(ue.wieder) === JSON.stringify(["Die 6 zerlegen", "Die 5 zerlegen", "Reimt sich das?"]), JSON.stringify(ue.wieder));
        pruefe(F, "Übersicht: Bald zeigt Themen in Sicht", (ue.bald?.length ?? 0) >= 1, JSON.stringify(ue.bald));
      }
      pruefe(F, "Übersicht: keine Zahl als Fortschritt, kein Lehrplan, kein Kopf mit Quellen",
        !/\d+\s*(von|\/)\s*\d+|%|Klasse \d|Lehrplan|quellen:|https?:/i.test(ue.text), ue.text.slice(0, 300));
      if (fall === "echt" || fall === "drei") {
        pruefe(F, "PDF-Knopf an jedem Thema mit Anleitung, an keinem ohne", ue.pdf.length >= 1 && ue.pdf.length === ue.mitFormen, JSON.stringify(ue.pdf));
        const thema = fall === "drei" ? "zerlegen-2" : ue.pdf[0];
        const klick = await seite.evaluate(async (thema) => {
          document.querySelector(`[data-pdf="${thema}"]`).click();
          for (let i = 0; i < 40 && !window.__gedruckt; i++) await new Promise((r) => setTimeout(r, 50));
          const blatt = document.getElementById("blatt");
          const r = { gedruckt: window.__gedruckt, titel: document.title, eng: blatt.classList.contains("eng"),
            formen: [...blatt.querySelectorAll("article.form h2")].map((h) => h.textContent.trim()) };
          window.dispatchEvent(new Event("afterprint"));
          return { ...r, danach: document.title };
        }, thema);
        pruefe(F, "PDF ruft den Druckdialog über kern/geraet.js, Titel ist der Dateiname, danach wieder wie vorher",
          klick.gedruckt === 1 && /^Mit echten Dingen – \S/.test(klick.titel) && klick.danach === "Mit echten Dingen", JSON.stringify(klick));
        if (fall === "drei") pruefe(F, "Blatt mit drei Formen: Am Tisch, In Bewegung, Unterwegs; zu lang → eine Stufe kleiner",
          JSON.stringify(klick.formen) === JSON.stringify(["Am Tisch: Nudeln", "In Bewegung: Hüpfen", "Unterwegs: Steine"]) && klick.eng, JSON.stringify(klick));
      }
      if (SHOTS && fall !== "drei") {
        await mkdir(SHOTS, { recursive: true });
        await seite.screenshot({ path: join(SHOTS, `uebersicht-${fall}-${name}-${groesse.width}.png`), fullPage: true });
      }
      if (name === "chromium" && (fall === "echt" || fall === "drei")) {
        await seite.emulateMedia({ media: "print" });
        const druck = await seite.evaluate(() => {
          const blatt = document.getElementById("blatt");
          return {
            knoepfe: [...document.querySelectorAll("ls-knopf, button, summary")].filter((k) => k.getClientRects().length > 0).length,
            sichtbar: getComputedStyle(blatt).visibility, formen: blatt.querySelectorAll("article.form").length,
            flaechen: [...blatt.querySelectorAll("*")].filter((e) => !/^(rgba\(0, 0, 0, 0\)|transparent)$/.test(getComputedStyle(e).backgroundColor)).length,
            text: blatt.innerText,
          };
        });
        await seite.emulateMedia({ media: null }); // zurück auf „keine Vorgabe“: page.pdf() nimmt dann print
        const pdf = await seite.pdf({ format: "A4", preferCSSPageSize: true, printBackground: true });
        const seiten = (pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;
        pruefe(F, `Blatt: nur das Blatt, keine Bedienelemente, keine Flächen, alle Formen voll (${druck.formen} Formen, ${seiten} Seiten)`,
          druck.knoepfe === 0 && druck.sichtbar === "visible" && druck.flaechen === 0 && druck.formen >= 1
            && /Ihr braucht/.test(druck.text) && /Darauf kommt es an/.test(druck.text) && /Leichter/.test(druck.text) && /Schwerer/.test(druck.text)
            && !/Sie |Ihr Kind/.test(druck.text) && seiten <= (fall === "drei" ? 2 : 1), JSON.stringify({ seiten, ...druck, text: undefined }));
        if (SHOTS && groesse.width === 1920) {
          const pfad = join(SHOTS, `blatt-${fall}.pdf`);
          await writeFile(pfad, pdf);
          try { execFileSync("sips", ["-s", "format", "png", "-Z", "1600", pfad, "--out", pfad.replace(/\.pdf$/, ".png")], { stdio: "ignore" }); } catch { /* nur macOS */ }
        }
      }
      await seite.close();
      // Zugang aus dem Elternbereich (der Knopf liegt in der Navigation hinter der PIN)
      if (fall === "echt") {
        const eltern = await oeffne(kontext, `${basis}/spiele/eltern.html`);
        await eltern.evaluate(() => document.getElementById("echte-dinge").click());
        await eltern.waitForURL(/mit-echten-dingen\.html$/, { timeout: 5000 }).catch(() => {});
        pruefe(F, "Elternbereich: „Mit echten Dingen“ führt zur Übersicht", eltern.url().endsWith("/spiele/mit-echten-dingen.html"), eltern.url());
        await eltern.close();
      }
      await kontext.close();
    }

    pruefe(L, "keine Seiten- oder Konsolenfehler", fehlerListe.length === 0, fehlerListe.join(" | "));
  } finally {
    await browser.close();
  }
}

const server = await starteServer(WURZEL);
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
