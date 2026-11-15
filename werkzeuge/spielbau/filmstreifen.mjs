#!/usr/bin/env node
// Filmstreifen eines Spiels (docs/spielbau.md, Spielprüfung): So sieht ein Kind die Wirkung. Chromium nimmt die
// Seite über das Screencast-Protokoll auf; aus der Aufnahme werden Bildreihen mit Zeitstempel und der Takt gemessen.
//
//   NODE_PATH=/private/tmp/claude-501/pw/node_modules node werkzeuge/spielbau/filmstreifen.mjs <seite> --aus <ordner>
//     [--stufe material|vorstellung|kopf] [--groesse 1280x800]
//
// Ergebnis in <ordner>: einfuehrung.png, richtig.png, daneben.png (je bis zu 12 Bilder mit Zeit in ms nach dem Zug),
// aufgabe.png (Standbild), takt.json { reaktionMs, folgeMs, taktMs, danebenMs, fehler[] }.
// Braucht die Test-Schnittstelle (spiele/rahmen/pruefen.js), sonst nichts vom Spiel.
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, relative, resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { starteServer } from "../../tests/browser/server.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const warte = (ms) => new Promise((r) => setTimeout(r, ms));
const STAND = {
  "lernstand-kind-1-lernplan": JSON.stringify({ version: 1, themen: {}, aufgaben: {}, verlauf: [], migriert: 1 }),
  "lernstand-kind-1-einstellungen": JSON.stringify({}),
};

function leseAufruf(argv) {
  const a = { seite: null, aus: null, stufe: null, groesse: { width: 1280, height: 800 } };
  for (let i = 0; i < argv.length; i++) {
    const x = argv[i];
    if (x === "--aus") a.aus = resolve(argv[++i]);
    else if (x === "--stufe") a.stufe = argv[++i];
    else if (x === "--groesse") { const [w, h] = argv[++i].split("x").map(Number); a.groesse = { width: w, height: h }; }
    else if (!x.startsWith("--")) a.seite = x;
  }
  if (!a.seite || !a.aus) throw new Error("Aufruf: filmstreifen.mjs <seite> --aus <ordner> [--stufe s] [--groesse BxH]");
  return a;
}

/** Wählt bis zu n Bilder gleichmäßig aus dem Zeitfenster [von, bis]; ohne neues Bild gilt das letzte davor. */
export function waehleBilder(bilder, von, bis, n = 12) {
  const raus = [];
  for (let i = 0; i < n; i++) {
    const t = von + ((bis - von) * i) / (n - 1);
    let b = null;
    for (const x of bilder) if (x.t <= t) b = x; else break;
    if (b && raus.at(-1)?.daten !== b.daten) raus.push({ ...b, ab: Math.round(t - von) });
  }
  return raus;
}

async function blatt(browser, bilder, titel, datei) {
  if (!bilder.length) return false;
  const seite = await browser.newPage({ viewport: { width: 1600, height: 400 } });
  const html = `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;background:#2b2b33;font:600 18px system-ui;color:#fff;padding:12px}
    h1{font-size:20px;margin:0 0 10px} .r{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
    figure{margin:0} img{width:100%;display:block;border-radius:6px} figcaption{font-size:14px;opacity:.8;padding:2px 0}
  </style><h1>${titel}</h1><div class="r">${bilder
    .map((b) => `<figure><img src="data:image/jpeg;base64,${b.daten}"><figcaption>+${b.ab} ms</figcaption></figure>`).join("")}</div>`;
  await seite.setContent(html);
  await seite.screenshot({ path: datei, fullPage: true });
  await seite.close();
  return true;
}

async function main() {
  const a = leseAufruf(process.argv.slice(2));
  mkdirSync(a.aus, { recursive: true });
  const pfad = relative(WURZEL, resolve(a.seite)).split("\\").join("/");
  const server = await starteServer(WURZEL);
  // ?einfuehrung: auch in der Vorschau (mit ?stufe) beginnt das Spiel mit seiner Einführung, damit sie im Film ist.
  const url = `http://127.0.0.1:${server.address().port}/${pfad}?einfuehrung${a.stufe ? `&stufe=${a.stufe}` : ""}`;
  const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const takt = { stufe: a.stufe, reaktionMs: null, folgeMs: null, taktMs: null, danebenMs: null, fehler: [] };
  try {
    const kontext = await browser.newContext({ viewport: a.groesse, deviceScaleFactor: 1 });
    await kontext.addInitScript((stand) => {
      window.__LS_PRUEFEN__ = true;
      for (const [k, v] of Object.entries(stand)) localStorage.setItem(k, v);
    }, STAND);
    const seite = await kontext.newPage();
    seite.on("pageerror", (e) => takt.fehler.push(String(e)));
    const cdp = await kontext.newCDPSession(seite);
    /** @type {{ t: number, daten: string }[]} */
    const bilder = [];
    cdp.on("Page.screencastFrame", (f) => {
      bilder.push({ t: Date.now(), daten: f.data });
      cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
    });
    await seite.goto(url, { waitUntil: "load" });
    await cdp.send("Page.startScreencast", { format: "jpeg", quality: 60, maxWidth: 800, everyNthFrame: 3 });
    const tStart = Date.now();
    await seite.waitForFunction(() => !!window.lsPruefen, null, { timeout: 10000 });
    const zustand = () => seite.evaluate(() => window.lsPruefen.zustand());
    const fuehreAus = (z) => seite.evaluate((zug) => window.lsPruefen.fuehreAus(zug), z);
    const bisPhase = async (phasen, frist) => {
      const t0 = Date.now();
      let z = await zustand();
      while (!phasen.includes(z.phase)) {
        if (Date.now() - t0 > frist) throw new Error(`nach ${frist} ms noch in Phase ${z.phase}`);
        // Die Einführung wartet auf das Kind (§8): Weiter tippen, sobald er da ist, und mitzählen.
        if (z.phase === "einfuehrung" && await seite.evaluate(() => { const k = document.querySelector(".einf-weiter.da"); if (k) k.click(); return !!k; })) takt.einfuehrungSchritte = (takt.einfuehrungSchritte ?? 0) + 1;
        await warte(40);
        z = await zustand();
      }
      return z;
    };

    // Einführung (falls es eine gibt): bis zur ersten Aufgabe
    let z = await bisPhase(["aufgabe", "pause", "fehler"], 120000);
    const tAufgabe = Date.now();
    if (tAufgabe - tStart > 1500) await blatt(browser, waehleBilder(bilder, tStart, tAufgabe), `Einführung bis zur ersten Aufgabe (${Math.round((tAufgabe - tStart) / 1000)} s)`, join(a.aus, "einfuehrung.png"));
    await warte(300);
    await seite.screenshot({ path: join(a.aus, "aufgabe.png") });

    // Richtig: die richtigen Züge bis zur Wirkung, dann bis zur nächsten Aufgabe
    const nr = z.nr;
    let tZug = 0;
    for (let i = 0; i < 40; i++) {
      const zug = await seite.evaluate(() => window.lsPruefen.richtigerZug());
      if (!zug) break;
      tZug = Date.now();
      await fuehreAus(zug);
      await warte(30);
      z = await zustand();
      if (z.phase !== "aufgabe" || z.nr !== nr) break;
    }
    const tFolge = Date.now();
    z = await bisPhase(["aufgabe", "pause", "fehler"], 15000).catch((e) => (takt.fehler.push(e.message), z));
    const tEnde = Date.now();
    await warte(400);
    takt.folgeMs = tEnde - tZug;
    takt.taktMs = tEnde - tAufgabe;
    const nachZug = bilder.find((b) => b.t > tZug + 16);
    takt.reaktionMs = nachZug ? Math.max(0, nachZug.t - tZug) : null;
    await blatt(browser, waehleBilder(bilder, tZug - 100, Math.max(tEnde + 300, tFolge + 600)), `Richtig: letzter Zug bis zur nächsten Aufgabe (${takt.folgeMs} ms)`, join(a.aus, "richtig.png"));

    // Daneben: zufällige Züge (feste Saat) wie ein ratendes Kind, bis ein Fehlversuch zählt. Der Zeitpunkt ist der
    // letzte Zug davor; die Aufnahme läuft ohnehin, also fehlt kein Bild.
    let saat = 4711;
    const zufall = (n) => ((saat = (saat * 1103515245 + 12345) % 2147483648), saat % n);
    let tDaneben = 0;
    for (let i = 0; i < 80 && !tDaneben; i++) {
      z = await zustand();
      if (z.phase === "pause" || z.phase === "fehler") break;
      if (z.phase !== "aufgabe") { await warte(80); continue; }
      const vorher = z.versuche, nrVorher = z.nr;
      const alle = (await seite.evaluate(() => window.lsPruefen.zuege())).filter((x) => !/hilfe|haus|leiste/i.test(JSON.stringify(x)));
      if (!alle.length) break;
      const t = Date.now();
      await fuehreAus(alle[zufall(alle.length)]);
      await warte(60);
      const n = await zustand();
      if (n.nr === nrVorher && n.versuche > vorher) tDaneben = t;
    }
    if (tDaneben) {
      await warte(3200);
      const letztes = [...bilder].reverse().find((b) => b.t > tDaneben);
      takt.danebenMs = letztes ? letztes.t - tDaneben : null;
      await blatt(browser, waehleBilder(bilder, tDaneben - 100, tDaneben + 3200), "Daneben: Fehlversuch und was danach zu sehen ist", join(a.aus, "daneben.png"));
    } else takt.fehler.push("kein Fehlversuch gefunden (fehlversuche: false?)");
    await cdp.send("Page.stopScreencast").catch(() => {});
    await kontext.close();
  } catch (e) {
    takt.fehler.push(e.message);
  } finally {
    await browser.close();
    server.close();
  }
  writeFileSync(join(a.aus, "takt.json"), JSON.stringify(takt, null, 1));
  console.log(JSON.stringify(takt));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main().catch((e) => { console.error(e); process.exit(1); });
