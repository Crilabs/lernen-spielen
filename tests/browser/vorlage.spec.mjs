// Browser-Prüfung der Spielvorlage (spiele/vorlage.html + vorlage.js): eine ganze Runde spielen.
// Kein Teil von `npm test`: braucht Playwright und installierte Browser (Chromium, WebKit).
//
// Aufruf wie tests/browser/rahmen.spec.mjs:
//   NODE_PATH=/private/tmp/claude-501/pw/node_modules node tests/browser/vorlage.spec.mjs
// Optional: SHOTS=/pfad/zum/ordner legt vorlage-<schritt>-<browser>-<breite>x<hoehe>.png ab
// (start, angehoben, hilfe-1, hilfe-2, pause).
//
// Geprüft wird in Chromium und WebKit bei 1920 × 1080 und 1280 × 800: Legen per Tippen und per Ziehen, ein Stab,
// der nicht passt, gleitet zurück, Hilfe leuchtet nach dem zweiten Versuch, Hilfe Stufe 1 (Probe) und Stufe 2
// (Lösung), Meldung mit Hilfe-Stufe, Folge zwischen den Aufgaben ohne Weiter (läuft von selbst, Tippen
// überspringt), Pause am Rundenende, Weiter startet die nächste Runde, keine Konsolenfehler, die Vorschau schreibt
// nichts (Speicher unverändert bis auf das Protokoll, das einmal „nicht in spiele.json“ vermerkt). Dazu der
// Schreibweg eines eingetragenen Spiels (spiele.json wird im Browser um die Vorlage ergänzt): eine Aufgabe landet
// im Lernstand. Name beim ersten Tippen: die Probe der Hilfe hat Vorrang. Fehlerweg: eine unbekannte Aufgabe.

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

const AUFLOESUNGEN = [{ width: 1920, height: 1080 }, { width: 1280, height: 800 }];
const SHOTS = process.env.SHOTS;
const pause = (ms) => new Promise((ok) => setTimeout(ok, ms));

// Ein vorhandener Lernstand, der unberührt bleiben muss (Vorschau: nurAnsehen).
const STAND = {
  "lernstand-kind-1-lernplan": JSON.stringify({ version: 1, themen: { "zerlegen-6": { z: "kann-ich", stufe: "kopf", k: "2026-11-01" } }, aufgaben: {}, verlauf: [], migriert: 1 }),
  "lernstand-kind-1-einstellungen": JSON.stringify({}),
};

let fehler = 0;
let geprueft = 0;
/** @param {string} lauf @param {string} name @param {boolean} ok @param {string} [detail] */
function pruefe(lauf, name, ok, detail = "") {
  geprueft++;
  if (!ok) fehler++;
  console.log(`${ok ? "ok    " : "FEHLER"} [${lauf}] ${name}${ok ? "" : detail ? ` – ${detail}` : ""}`);
}

// --- Hilfen im Browser ---------------------------------------------------------------------------

/** Werte der Stäbe auf dem Tablett, in der Reihenfolge dort. */
const tablettWerte = (seite) => seite.$$eval("#tablett .stab", (l) => l.map((s) => Number(s.getAttribute("wert"))));
const zielWert = (seite) => seite.$eval("#matte > ls-perlenstab", (s) => Number(s.getAttribute("wert")));
const rinneWerte = (seite) => seite.$$eval(".rinne .stab", (l) => l.map((s) => Number(s.getAttribute("wert"))));
const stab = (seite, wert) => seite.locator(`#tablett .stab[wert="${wert}"]`).first();

async function tippeLege(seite, wert) {
  await stab(seite, wert).click();
  await seite.locator(".rinne").click({ position: { x: 20, y: 20 } });
  await pause(450); // Gleiten 0,3 s
}

async function zieheLege(seite, wert) {
  const q = await stab(seite, wert).boundingBox();
  const z = await seite.locator(".rinne").boundingBox();
  await seite.mouse.move(q.x + q.width / 2, q.y + q.height / 2);
  await seite.mouse.down();
  await seite.mouse.move(z.x + z.width * 0.6, z.y + z.height / 2, { steps: 14 });
  await seite.mouse.up();
  await pause(450);
}

const hilfeLeuchtet = (seite) => seite.evaluate(() => document.getElementById("hilfe").shadowRoot.querySelector(".platz").classList.contains("leuchtet"));
const blasenText = (seite) => seite.evaluate(() => document.getElementById("blase").text);
const tippeHilfe = (seite) => seite.evaluate(() => document.getElementById("hilfe").knopf.shadowRoot.querySelector("button").click());
/** Wartet, bis eine neue Aufgabe liegt (leere Gleichung, volles Tablett); liefert die Wartezeit in ms. */
async function neueAufgabe(seite, timeout = 4000) {
  const t0 = Date.now();
  await seite.waitForFunction(() => document.querySelector(".gleichung")?.textContent === "" && document.querySelectorAll("#tablett .stab").length >= 6, null, { timeout });
  return Date.now() - t0;
}
/** Tippt auf eine freie Stelle des Spielfelds (unten Mitte). */
async function tippeFeld(seite) {
  const f = await seite.locator(".spielflaeche").boundingBox();
  await seite.mouse.click(f.x + f.width / 2, f.y + f.height - 40);
}
const speicher = (seite) => seite.evaluate(() => Object.fromEntries(Object.keys(localStorage).filter((k) => k !== "protokoll").map((k) => [k, localStorage.getItem(k)])));

async function bild(seite, schritt, name, groesse) {
  if (!SHOTS) return;
  await mkdir(SHOTS, { recursive: true });
  await seite.screenshot({ path: join(SHOTS, `vorlage-${schritt}-${name}-${groesse.width}x${groesse.height}.png`) });
}

async function lauf(typ, name, groesse, basis) {
  const L = `${name} ${groesse.width}x${groesse.height}`;
  const browser = await typ.launch();
  const fehlerListe = [];
  try {
    const kontext = await browser.newContext({ viewport: groesse, deviceScaleFactor: 1 });
    await kontext.addInitScript((stand) => {
      if (sessionStorage.getItem("vorlage-test")) return; // nur beim ersten Laden setzen
      sessionStorage.setItem("vorlage-test", "1");
      for (const [k, v] of Object.entries(stand)) localStorage.setItem(k, v);
    }, STAND);
    const seite = await kontext.newPage();
    seite.on("pageerror", (e) => fehlerListe.push(`Seitenfehler: ${e.message}`));
    seite.on("console", (m) => { if (m.type() === "error") fehlerListe.push(`Konsole: ${m.text()}`); });
    await seite.goto(`${basis}/spiele/vorlage.html`, { waitUntil: "load" });
    await seite.evaluate(() => {
      window.ergebnisse = [];
      document.addEventListener("ls-ergebnis", (e) => window.ergebnisse.push(e.detail));
    });
    await seite.waitForSelector("#tablett .stab");
    await seite.evaluate(() => document.fonts.ready);
    const vorher = await speicher(seite);

    // --- Start -----------------------------------------------------------------------------------
    const n = await zielWert(seite);
    const werte = await tablettWerte(seite);
    const thema = await seite.evaluate(() => document.getElementById("leiste").getAttribute("thema"));
    pruefe(L, "Aufgabe aus der Lernsteuerung: Die 7 zerlegen, sechs Stäbe 1 bis 6", n === 7 && thema === "Die 7 zerlegen" && [...werte].sort().join() === "1,2,3,4,5,6", `${n} ${thema} ${werte}`);
    const lage = await seite.evaluate(() => {
      const r = (s) => document.querySelector(s).getBoundingClientRect();
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const leiste = document.getElementById("leiste").shadowRoot.querySelector(".band").getBoundingClientRect();
      const ziel = document.querySelector("#matte > ls-perlenstab").shadowRoot.querySelector("svg").getBoundingClientRect();
      const rinne = r(".rinne");
      const hilfe = document.getElementById("hilfe").shadowRoot.querySelector(".platz").getBoundingClientRect();
      const teile = [...document.querySelectorAll("#tablett .stab")].map((s) => s.getBoundingClientRect());
      return {
        rem, unterLeiste: r(".spielflaeche").top >= leiste.bottom - 1,
        buendig: Math.abs(ziel.left - (rinne.left + 0.3 * rem)) < 2 && Math.abs(ziel.width - (rinne.width - 0.6 * rem)) < 2,
        tippflaeche: teile.every((t) => t.height >= 11 * rem - 1),
        imBild: [r("#matte"), r("#tablett")].every((b) => b.left >= 0 && b.right <= innerWidth && b.bottom <= innerHeight),
        frei: [r("#matte"), r("#tablett")].every((b) => b.right < hilfe.left || b.bottom < hilfe.top),
      };
    });
    pruefe(L, "Spielfeld unter der Kopfleiste", lage.unterLeiste);
    pruefe(L, "Rinne bündig unter dem langen Stab, gleich lang", lage.buendig);
    pruefe(L, "Stäbe auf dem Tablett: Tippfläche ≥ 11 rem", lage.tippflaeche);
    pruefe(L, "Matte und Tablett im Bild, frei von der Hilfe", lage.imBild && lage.frei);
    await bild(seite, "start", name, groesse);

    // --- Aufgabe 1: tippen, zwei Versuche, die nicht passen, Hilfe-Leiter, ziehen ----------------
    const erster = werte[0];
    await stab(seite, erster).click();
    const angehoben = await stab(seite, erster).evaluate((s) => s.classList.contains("angehoben"));
    const zieleFrei = await seite.locator(".rinne.ziel-frei").count();
    pruefe(L, "Tippen hebt den Stab an, die Rinne zeigt sich als Ziel", angehoben && zieleFrei === 1);
    await bild(seite, "angehoben", name, groesse);
    await seite.locator(".rinne").click({ position: { x: 20, y: 20 } });
    await pause(450);
    pruefe(L, "Tippen auf die Rinne legt den Stab hinein", (await rinneWerte(seite)).join() === String(erster));

    const partner = n - erster;
    const falsche = (await tablettWerte(seite)).filter((w) => w !== partner);
    await zieheLege(seite, falsche[0]);
    const zurueck = await stab(seite, falsche[0]).evaluate((s) => ({ imTablett: !!s.closest("#tablett"), translate: s.style.translate }));
    const text1 = await blasenText(seite);
    pruefe(L, "ein Stab, der nicht passt, gleitet zurück aufs Tablett", zurueck.imTablett && (zurueck.translate === "" || /^0px/.test(zurueck.translate)) && (await rinneWerte(seite)).length === 1, JSON.stringify(zurueck));
    pruefe(L, "Erzähler beschreibt: zu lang / zu kurz", /zu (lang|kurz)/.test(text1), text1);
    pruefe(L, "nach dem ersten Versuch leuchtet die Hilfe nicht", !(await hilfeLeuchtet(seite)));
    await tippeLege(seite, falsche[1]);
    pruefe(L, "nach dem zweiten Versuch leuchtet die Hilfe einmal", await hilfeLeuchtet(seite));

    await tippeHilfe(seite);
    const stufe1 = await seite.evaluate(() => ({ frei: document.querySelector(".rinne .frei").classList.contains("markiert"), teile: document.querySelectorAll("#tablett .markiert").length }));
    pruefe(L, "Hilfe Stufe 1: Probe an der freien Stelle, keine Lösung", stufe1.frei && stufe1.teile === 0 && /Zähl die Perlen/.test(await blasenText(seite)), JSON.stringify(stufe1));
    await pause(200);
    const gesagt1 = await seite.evaluate(() => JSON.parse(sessionStorage.getItem("ls-gesagt") ?? "[]"));
    pruefe(L, "erstes Tippen auf Hilfe: die Probe hat Vorrang, „Hilfe“ gilt noch nicht als gesagt", !gesagt1.includes("Hilfe"), JSON.stringify(gesagt1));
    await pause(1100);
    await bild(seite, "hilfe-1", name, groesse);
    await tippeHilfe(seite);
    const stufe2 = await seite.$$eval("#tablett .markiert", (l) => l.map((s) => Number(s.getAttribute("wert"))));
    pruefe(L, "Hilfe Stufe 2: der passende Stab hat den Sonnenring", stufe2.join() === String(partner), stufe2.join());
    await bild(seite, "hilfe-2", name, groesse);
    await zieheLege(seite, partner);
    const e1 = await seite.evaluate(() => window.ergebnisse.at(-1));
    pruefe(L, "Ziehen legt den passenden Stab; Meldung mit Hilfe 2, nicht ok", e1?.key === `zerl:${n}:${erster}+${partner}` && e1.ok === false && e1.hilfe === 2, JSON.stringify(e1));
    const gl = await seite.$eval(".gleichung", (g) => g.textContent);
    pruefe(L, "Folge: Gleichung und Erzählersatz nach dem Legen, kein Weiter-Knopf", gl === `${n} = ${erster} + ${partner}` && /zusammen so lang/.test(await blasenText(seite)) && (await seite.locator("#weiter").count()) === 0, gl);
    const warte1 = await neueAufgabe(seite);
    pruefe(L, "nächste Aufgabe kommt nach der Folge von selbst (etwa 1–2 s)", warte1 >= 800 && warte1 <= 2500, `${warte1 + 450} ms nach dem Legen`);

    // --- Aufgabe 2: beide Stäbe ziehen, ohne Hilfe; Tippen überspringt die Folge -------------------
    const w2 = (await tablettWerte(seite))[0];
    await zieheLege(seite, w2);
    await zieheLege(seite, n - w2);
    const e2 = await seite.evaluate(() => window.ergebnisse.at(-1));
    pruefe(L, "Aufgabe 2 per Ziehen: ok ohne Hilfe", e2?.ok === true && e2.hilfe === 0 && e2.key === `zerl:${n}:${w2}+${n - w2}`, JSON.stringify(e2));
    await tippeFeld(seite);
    const warte2 = await neueAufgabe(seite);
    pruefe(L, "Tippen überspringt die Folge", warte2 < 600, `${warte2} ms`);

    // --- Aufgabe 3: beide Stäbe tippen; dann Rundenende ------------------------------------------
    const w3 = (await tablettWerte(seite))[0];
    await tippeLege(seite, w3);
    await tippeLege(seite, n - w3);
    const e3 = await seite.evaluate(() => window.ergebnisse.at(-1));
    pruefe(L, "Aufgabe 3 per Tippen: ok ohne Hilfe", e3?.ok === true && e3.hilfe === 0, JSON.stringify(e3));
    const offenVorFolge = await seite.evaluate(() => document.getElementById("pause").hasAttribute("offen"));
    await seite.waitForFunction(() => document.getElementById("pause").hasAttribute("offen"), null, { timeout: 3000 });
    const p = await seite.evaluate(() => {
      const w = document.getElementById("pause").shadowRoot;
      const a = w.querySelector("a.alle").getBoundingClientRect();
      const b = w.querySelector("ls-knopf.weiter").getBoundingClientRect();
      return { gleich: Math.abs(a.width - b.width) < 2 && Math.abs(a.height - b.height) < 2, karte: !w.querySelector(".karte").classList.contains("leer"), stab: !!document.querySelector("#sachmoment ls-perlenstab") };
    });
    pruefe(L, "Pause nach der Folge der letzten Aufgabe, mit Sachmoment, Alle Spiele und Weiter gleich groß", !offenVorFolge && p.gleich && p.karte && p.stab, JSON.stringify(p));
    await pause(300);
    await bild(seite, "pause", name, groesse);
    await seite.waitForTimeout(1500);
    pruefe(L, "Pause bleibt offen (kein Ablauf)", await seite.evaluate(() => document.getElementById("pause").hasAttribute("offen")));
    await seite.locator("ls-pause ls-knopf.weiter").click();
    await seite.waitForSelector("#tablett .stab");
    pruefe(L, "Weiter in der Pause startet die nächste Runde", !(await seite.evaluate(() => document.getElementById("pause").hasAttribute("offen"))) && (await rinneWerte(seite)).length === 0);

    const nachher = await speicher(seite);
    pruefe(L, "Vorschau schreibt nichts (Speicher bis auf das Protokoll unverändert)", JSON.stringify(nachher) === JSON.stringify(vorher), `${JSON.stringify(vorher)} → ${JSON.stringify(nachher)}`);
    const protokoll = await seite.evaluate(() => JSON.parse(localStorage.getItem("protokoll") ?? "[]"));
    const vorschauZeilen = protokoll.filter((z) => z.includes("vorlage: nicht in spiele.json – Vorschau, schreibt nicht"));
    pruefe(L, "Protokoll: einmal „nicht in spiele.json – Vorschau“, sonst höchstens fehlende Audiodateien",
      vorschauZeilen.length === 1 && protokoll.every((z) => /Keine Audiodatei/.test(z) || vorschauZeilen.includes(z)), protokoll.join(" | "));

    // --- Vorschau-Parameter -----------------------------------------------------------------------
    // spiele.json ist leer, bis das erste neue Spiel eingetragen ist: für den Hinweis ein Beispielspiel ergänzen.
    await kontext.route("**/spiele/spiele.json", async (route) => {
      const antwort = await route.fetch();
      const json = await antwort.json();
      json.spiele.push({ id: "beispiel", titel: "Beispiel", thema: "Zerlegen", kategorie: "mathe", symbol: "symbole/mathe.svg", datei: "index.html" });
      await route.fulfill({ response: antwort, json });
    });
    const s2 = await kontext.newPage();
    s2.on("pageerror", (e) => fehlerListe.push(`Seitenfehler (?pause): ${e.message}`));
    s2.on("console", (m) => { if (m.type() === "error") fehlerListe.push(`Konsole (?pause): ${m.text()}`); });
    await s2.goto(`${basis}/spiele/vorlage.html?hinweis`, { waitUntil: "load" });
    await s2.waitForFunction(() => document.getElementById("pause").hasAttribute("offen"), null, { timeout: 3000 });
    pruefe(L, "?hinweis: Pause sofort, mit Hinweis auf ein anderes Spiel", (await s2.locator("#sachmoment a.hinweis").count()) === 1);
    await s2.goto(`${basis}/spiele/vorlage.html?eltern`, { waitUntil: "load" });
    await s2.waitForSelector("section.eltern");
    pruefe(L, "?eltern: Elternansicht", (await s2.locator("section.eltern a[href='eltern.html']").count()) === 1);
    pruefe(L, "Vorschau-Parameter schreiben nichts", JSON.stringify(await speicher(s2)) === JSON.stringify(vorher));
    await s2.close();

    // --- Schreibweg eines eingetragenen Spiels: spiele.json im Browser um die Vorlage ergänzt -------
    const echt = await browser.newContext({ viewport: groesse });
    await echt.route("**/spiele/spiele.json", async (route) => {
      const antwort = await route.fetch();
      const json = await antwort.json();
      json.spiele.push({ id: "vorlage", titel: "Spielvorlage", thema: "Zerlegen", kategorie: "mathe", datei: "vorlage.html", arten: [{ art: "zerlegung", zahlen: [7, 7], stufen: ["material"] }] });
      await route.fulfill({ response: antwort, json });
    });
    // Einführung schon gesehen, damit die Runde gleich beginnt (sonst käme zuerst die Szene).
    await echt.addInitScript(() => {
      if (sessionStorage.getItem("vorlage-test")) return;
      sessionStorage.setItem("vorlage-test", "1");
      localStorage.setItem("lernstand-kind-1-lernplan", JSON.stringify({ version: 1, themen: { "zerlegen-7": { e: "2026-11-01" } }, aufgaben: {}, verlauf: [], migriert: 1 }));
    });
    const s4 = await echt.newPage();
    s4.on("pageerror", (e) => fehlerListe.push(`Seitenfehler (eingetragen): ${e.message}`));
    s4.on("console", (m) => { if (m.type() === "error") fehlerListe.push(`Konsole (eingetragen): ${m.text()}`); });
    await s4.goto(`${basis}/spiele/vorlage.html`, { waitUntil: "load" });
    await s4.waitForSelector("#tablett .stab");
    await tippeHilfe(s4);
    await tippeHilfe(s4);
    const paar = await s4.$$eval("#tablett .markiert", (l) => l.map((x) => Number(x.getAttribute("wert"))));
    pruefe(L, "Hilfe Stufe 2 vor dem ersten Stab: das Paar mit Begründung", paar.length === 2 && paar[0] + paar[1] === n && /zusammen so lang/.test(await blasenText(s4)), paar.join());
    const e4 = (await tablettWerte(s4))[0];
    await tippeLege(s4, e4);
    await tippeLege(s4, n - e4);
    await pause(700); // speichere() wartet kurz, bevor es schreibt
    const lernstand = await s4.evaluate(() => JSON.parse(localStorage.getItem("lernstand-kind-1-lernplan") ?? "{}"));
    const geschrieben = lernstand.aufgaben?.[`zerl:${n}:${e4}+${n - e4}`];
    // Mit Hilfe gelöst: steht im Lernstand als 0 (zählt nicht als gekonnt, L12), Fach 0.
    const protokoll4 = await s4.evaluate(() => localStorage.getItem("protokoll") ?? "");
    pruefe(L, "eingetragenes Spiel: kein Vorschau-Eintrag im Protokoll", !protokoll4.includes("nicht in spiele.json"), protokoll4);
    pruefe(L, "eingetragenes Spiel schreibt den Lernstand; mit Hilfe gelöst zählt nicht", Array.isArray(geschrieben?.h) && geschrieben.h.at(-1) === 0 && geschrieben.f === 0 && lernstand.themen?.["zerlegen-7"]?.z === "dran", JSON.stringify(lernstand).slice(0, 300));
    await echt.close();

    // --- Fehlerweg: unbekannte Aufgabe → ruhiger Satz, Protokoll, kein unbehandelter Fehler --------
    // Lernplan nicht ladbar → feste Vorschau-Aufgaben; deren Schlüssel im Browser durch einen unbekannten ersetzt.
    const kaputt = await browser.newContext({ viewport: groesse });
    await kaputt.route("**/spiele/lernplan.json", (route) => route.abort());
    await kaputt.route("**/spiele/vorlage.js", async (route) => {
      const antwort = await route.fetch();
      const text = (await antwort.text()).replace('aufgaben: ["zerl:7:3+4"', 'aufgaben: ["unbekannt:1"');
      await route.fulfill({ response: antwort, body: text });
    });
    const s5 = await kaputt.newPage();
    const fehler5 = [];
    s5.on("pageerror", (e) => fehler5.push(e.message));
    await s5.goto(`${basis}/spiele/vorlage.html`, { waitUntil: "load" });
    await s5.waitForFunction(() => document.getElementById("blase").text === "Das Spiel geht gerade nicht.", null, { timeout: 4000 }).catch(() => null);
    await pause(200);
    const f5 = await s5.evaluate(() => ({ text: document.getElementById("blase").text, protokoll: JSON.parse(localStorage.getItem("protokoll") ?? "[]") }));
    pruefe(L, "unbekannte Aufgabe: „Das Spiel geht gerade nicht.“, im Protokoll, kein unbehandelter Fehler",
      f5.text === "Das Spiel geht gerade nicht." && f5.protokoll.some((z) => /unbekannte Aufgabe unbekannt:1/.test(z)) && !f5.protokoll.some((z) => z.startsWith("Promise:")) && fehler5.length === 0,
      `${f5.text} | ${f5.protokoll.join(" | ")} | ${fehler5.join(" | ")}`);
    await kaputt.close();

    // --- Wenig Bewegung: Zurückgleiten ohne Bewegung ---------------------------------------------
    const ruhig = await browser.newContext({ viewport: groesse, reducedMotion: "reduce" });
    const s3 = await ruhig.newPage();
    s3.on("pageerror", (e) => fehlerListe.push(`Seitenfehler (ruhig): ${e.message}`));
    await s3.goto(`${basis}/spiele/vorlage.html`, { waitUntil: "load" });
    await s3.waitForSelector("#tablett .stab");
    const r1 = (await tablettWerte(s3))[0];
    await tippeLege(s3, r1);
    const falsch = (await tablettWerte(s3)).find((w) => w !== n - r1);
    await zieheLege(s3, falsch);
    const ohne = await stab(s3, falsch).evaluate((s) => s.style.translate === "" && s.getAnimations().length === 0);
    pruefe(L, "wenig Bewegung: Stab steht sofort wieder auf dem Tablett", ohne);
    await ruhig.close();

    pruefe(L, "keine Seiten- oder Konsolenfehler", fehlerListe.length === 0, fehlerListe.join(" | "));
  } finally {
    await browser.close();
  }
}

const server = await starteServer();
const basis = `http://127.0.0.1:${server.address().port}`;
console.log(`Server ${basis}`);
try {
  const nur = process.env.NUR; // z. B. NUR=chromium für einen schnellen Lauf
  for (const [name, typ] of [["chromium", chromium], ["webkit", webkit]]) {
    if (nur && nur !== name) continue;
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
