// Browser-Prüfung der Bücher-Grenze (Spec 2026-11-16-buecherzeit): Bibliothek, Abspieler, Elternbereich.
// Kein Teil von `npm test`: braucht Playwright und Chromium.
//   NODE_PATH=/private/tmp/claude-501/pw/node_modules node tests/browser/buecherzeit.spec.mjs
//
// Geprüft: beide Modi aufgebraucht → neues Buch in der Bibliothek nicht drückbar, heute geöffnetes Buch drückbar, direkt
// geöffnet zurück zur Bibliothek; nur Vorlesen aufgebraucht → Sachbuch ohne Anhören, Lesen merkt das Buch; Kurzgeschichte
// mit aufgebrauchtem Selbst lesen → nur Vorlesen, Blättern liest vor; Vorschau der Eltern merkt nichts; Elternbereich
// stellt die Grenzen und „Heute ein Buch mehr“; keine Konsolenfehler.

import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { starteServer } from "./server.mjs";
import { starteStumm } from "./stumm.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const { pinHash } = await import("../../spiele/eltern.js");
const WURZEL = resolve(fileURLToPath(import.meta.url), "../../..");

let fehler = 0, geprueft = 0;
function pruefe(name, ok, detail = "") {
  geprueft++;
  if (!ok) fehler++;
  console.log(`${ok ? "ok    " : "FEHLER"} ${name}${ok ? "" : detail ? ` – ${detail}` : ""}`);
}
const heute = new Date().toLocaleDateString("sv");
const STAND = "lernstand-kind-1-buecher-stand", EINST = "lernstand-kind-1-einstellungen";

async function neueSeite(browser, speicher = {}) {
  const kontext = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
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
const lies = (seite, k) => seite.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? "null"), k);

const server = await starteServer(WURZEL);
const BASIS = `http://127.0.0.1:${server.address().port}/spiele/`;
const browser = await starteStumm(chromium);

/** Speicher mit Grenzen und den heute geöffneten Büchern. */
async function speicher(grenzen, geoeffnet) {
  const { kontext, seite } = await neueSeite(browser);
  await seite.goto(BASIS + "bibliothek.html");
  const woche = await seite.evaluate(async () => (await import("./kern/spielzeit.js")).wochenSchluessel(new Date()));
  await kontext.close();
  return {
    [EINST]: JSON.stringify({ buecher: grenzen }),
    [STAND]: JSON.stringify({ woche, tage: { [heute]: { vorlesen: [], selbst: [], zugabe: 0, ...geoeffnet } } }),
  };
}

try {
  // 1. Beide aufgebraucht: Bibliothek zeigt neue Bücher nicht drückbar, das heute geöffnete drückbar.
  {
    const s = await speicher({ vorlesenTag: 1, selbstTag: 1 }, { vorlesen: ["haustiere"], selbst: ["haustiere"] });
    const { kontext, seite, konsole } = await neueSeite(browser, s);
    await seite.goto(BASIS + "bibliothek.html?raum=tiere");
    await seite.waitForSelector(".buch");
    pruefe("Bibliothek: heute geöffnetes Buch drückbar", (await seite.locator('a.buch[href*="id=haustiere"]').count()) === 1);
    const zu = await seite.locator(".buch.zu").count(), offen = await seite.locator("a.buch").count();
    pruefe("Bibliothek: neue Bücher sichtbar, nicht drückbar", zu > 0 && offen === 1, `${zu} zu, ${offen} offen`);
    pruefe("Bibliothek: nicht drückbar ohne Schatten", await seite.locator(".buch.zu .deckel").first().evaluate((d) => getComputedStyle(d).boxShadow === "none"));
    await seite.goto(BASIS + "geschichte.html?id=hund&weiter=" + encodeURIComponent("bibliothek.html?raum=tiere"));
    await seite.waitForURL(/bibliothek\.html/);
    pruefe("Direkt geöffnet: zurück zur Bibliothek", /bibliothek\.html\?raum=tiere/.test(seite.url()), seite.url());
    pruefe("Gesperrt merkt nichts", !(await lies(seite, STAND)).tage[heute].selbst.includes("hund"));
    pruefe("Bibliothek ohne Konsolenfehler", konsole.length === 0, konsole.join(" | "));
    await kontext.close();
  }
  // 2. Nur Vorlesen aufgebraucht: Sachbuch ohne Anhören, Lesen merkt das Buch.
  {
    const s = await speicher({ vorlesenTag: 1 }, { vorlesen: ["haustiere"] });
    const { kontext, seite, konsole } = await neueSeite(browser, s);
    await seite.goto(BASIS + "geschichte.html?id=hund&weiter=bibliothek.html&pruefen");
    await seite.waitForFunction(() => window.lsGeschichte?.kapitelZahl > 0);
    const k = await seite.locator("ls-geschichte").evaluate((el) => ({
      ohneVor: el.classList.contains("ohne-vorlesen"), ohneSelbst: el.classList.contains("ohne-selbst"),
      anhoeren: getComputedStyle(el.shadowRoot.querySelector(".start-anhoeren")).display,
      lesen: getComputedStyle(el.shadowRoot.querySelector(".start-lesen")).display, modus: el.modus }));
    pruefe("Sachbuch: Anhören fehlt, Lesen da, Modus Lesen", k.ohneVor && !k.ohneSelbst && k.anhoeren === "none" && k.lesen !== "none" && k.modus === "selbst", JSON.stringify(k));
    pruefe("Sachbuch: Inhaltsverzeichnis merkt noch nichts", (await lies(seite, STAND)).tage[heute].selbst.length === 0);
    await seite.evaluate(() => window.lsGeschichte.starte("selbst"));
    await seite.waitForFunction((k) => JSON.parse(localStorage.getItem(k)).tage[Object.keys(JSON.parse(localStorage.getItem(k)).tage)[0]].selbst.includes("hund"), STAND);
    pruefe("Sachbuch: Lesen merkt das Buch unter Selbst lesen", true);
    pruefe("Sachbuch ohne Konsolenfehler", konsole.length === 0, konsole.join(" | "));
    await kontext.close();
  }
  // 3. Kurzgeschichte, Selbst lesen aufgebraucht: nur Vorlesen; Blättern ohne Wahl liest vor.
  {
    const s = await speicher({ selbstTag: 1 }, { selbst: ["haustiere"] });
    const { kontext, seite, konsole } = await neueSeite(browser, s);
    await seite.goto(BASIS + "geschichte.html?id=zehnerpaare&weiter=bibliothek.html&pruefen");
    await seite.waitForFunction(() => window.lsGeschichte?.seiten > 0);
    const w = await seite.locator("ls-geschichte").evaluate((el) => [".waehle-vorlesen", ".waehle-selbst"].map((q) => getComputedStyle(el.shadowRoot.querySelector(q)).display));
    pruefe("Kurzgeschichte: nur Vorlesen zur Wahl", w[0] !== "none" && w[1] === "none", JSON.stringify(w));
    await seite.evaluate(() => window.lsGeschichte.weiter());
    pruefe("Kurzgeschichte: Blättern ohne Wahl liest vor", (await seite.evaluate(() => window.lsGeschichte.modus)) === "vorlesen");
    await seite.waitForTimeout(300);
    const st = (await lies(seite, STAND)).tage[heute];
    pruefe("Kurzgeschichte: unter Vorlesen gemerkt", st.vorlesen.includes("zehnerpaare") && !st.selbst.includes("zehnerpaare"), JSON.stringify(st));
    pruefe("Kurzgeschichte ohne Konsolenfehler", konsole.length === 0, konsole.join(" | "));
    await kontext.close();
  }
  // 4. Vorschau der Eltern: keine Grenze, nichts gemerkt.
  {
    const s = await speicher({ vorlesenTag: 1, selbstTag: 1 }, { vorlesen: ["x"], selbst: ["x"] });
    const { kontext, seite } = await neueSeite(browser, s);
    await seite.goto(BASIS + "geschichte.html?id=hund&eltern&weiter=eltern.html&pruefen");
    await seite.waitForFunction(() => window.lsGeschichte?.kapitelZahl > 0);
    await seite.evaluate(() => window.lsGeschichte.starte("selbst"));
    await seite.waitForTimeout(300);
    const st = (await lies(seite, STAND)).tage[heute];
    pruefe("Vorschau: offen und merkt nichts", /geschichte\.html/.test(seite.url()) && !st.selbst.includes("hund"), JSON.stringify(st));
    await kontext.close();
  }
  // 5. Elternbereich: Grenzen und „Heute ein Buch mehr“.
  {
    const { kontext, seite, konsole } = await neueSeite(browser, { "lernstand-eltern": JSON.stringify({ pinHash: await pinHash("1234") }) });
    await seite.goto(BASIS + "eltern.html");
    for (const z of "1234") await seite.evaluate((z) => [...document.querySelectorAll("#ziffern ls-knopf")].find((k) => k.getAttribute("wort") === z).click(), z);
    await seite.waitForFunction(() => !document.getElementById("bereich").hidden);
    await seite.evaluate(() => document.querySelector('[data-tab="spielzeit"]').click());
    await seite.waitForSelector('ls-knopf[name="Vorlesen am Tag: mehr"]');
    const klick = async (sel) => { await seite.evaluate((sel) => document.querySelector(sel).click(), sel); await seite.waitForTimeout(150); };
    await klick('ls-knopf[name="Vorlesen am Tag: mehr"]');
    await klick('ls-knopf[name="Vorlesen am Tag: mehr"]');
    await klick('ls-knopf[name="Selbst lesen in der Woche: mehr"]');
    await klick('ls-knopf[wort="Heute ein Buch mehr"]');
    await seite.waitForTimeout(400);
    const e = (await lies(seite, EINST))?.buecher;
    pruefe("Eltern: Vorlesen 2 am Tag, Selbst lesen 1 in der Woche", e?.vorlesenTag === 2 && e?.selbstWoche === 1 && e?.vorlesenWoche === null && e?.selbstTag === null, JSON.stringify(e));
    pruefe("Eltern: ein Buch mehr für heute", (await lies(seite, STAND))?.tage?.[heute]?.zugabe === 1);
    const text = await seite.locator("#inhalt").innerText();
    pruefe("Eltern: Stand zeigt Grenzen und Zugabe", /Vorgelesen heute: 0 von 2 Büchern/.test(text) && /Heute dazugegeben: 1 Buch\./.test(text), text.slice(text.indexOf("Bücher\n"), text.indexOf("Bücher\n") + 600));
    pruefe("Eltern: Spielzeit-Einstellung unberührt", (await lies(seite, EINST))?.spielzeit === undefined);
    pruefe("Eltern ohne Konsolenfehler", konsole.length === 0, konsole.join(" | "));
    await kontext.close();
  }
} finally {
  await browser.close();
  server.close();
}
console.log(`\n${geprueft - fehler}/${geprueft} geprüft, ${fehler} Fehler`);
process.exit(fehler ? 1 : 0);
