// Browser-Prüfung des Abspielers für Sachbücher mit Kapiteln (docs/geschichten.md §2a, §4; Christian 2026-11-15).
// Kein Teil von `npm test`: braucht Playwright und installierte Browser (Chromium, WebKit).
//
//   NODE_PATH=/private/tmp/claude-501/pw/node_modules node tests/browser/sachbuch.spec.mjs
//
// Ein Probebuch (5 Kapitel à 4 Seiten, Bilder aus haustiere/) wird per page.route ausgeliefert, damit die Prüfung nicht
// am Text eines echten Buchs hängt. Geprüft: Inhaltsverzeichnis mit Kapitelkarten, Karte öffnet ihr Kapitel,
// Kapitelende mit „Kapitel n+1“ und „Inhalt“, Vorlesen blättert nie ins nächste Kapitel, der Lesestand wird gemerkt und
// „Weiterlesen“ springt dorthin, alle Kapitel fertig → gelesen, Vorschau der Eltern merkt nichts, Absätze, Layout.

import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { starteServer } from "./server.mjs";

const require = createRequire(import.meta.url);
const { chromium, webkit } = require("playwright");
const WURZEL = resolve(fileURLToPath(import.meta.url), "../../..");

const server = await starteServer(WURZEL);
const basis = `http://127.0.0.1:${/** @type {any} */ (server.address()).port}`;
let fehler = 0;
const pruefe = (ok, was) => { console.log(`${ok ? "ok  " : "FEHLER"} ${was}`); if (!ok) fehler++; };

const satz = "Eine Katze sieht in der Dämmerung viel mehr als wir Menschen.";
const seite = (k, s) => ({ text: `Kapitel ${k + 1}, Seite ${s + 1}. ${Array(5).fill(satz).join(" ")}\n\nNoch ein Absatz. ${satz}`,
  bild: `../haustiere/bilder/${String(((k * 4 + s) % 14) + 1).padStart(2, "0")}.webp` });
const BUCH = { id: "probebuch", titel: "Das Probebuch", art: "sachbuch", welt: "haustiere", familie: null, kulisse: "im-haus", klasse: 1,
  quellen: [{ fakt: "x", quelle: "y" }],
  kapitel: [0, 1, 2, 3, 4].map((k) => ({ titel: `Kapitel ${k + 1} Titel`, seiten: [0, 1, 2, 3].map((s) => ({ ...seite(k, s), ...(k === 1 && s === 1 ? { frage: true } : {}) })) })) };

const STAND = "lernstand-kind-1-lernplan";
const oeffne = async (browser, { eltern = false, stand = null, ohneStimme = true, groesse = [1280, 800] } = {}) => {
  const page = await browser.newPage({ viewport: { width: groesse[0], height: groesse[1] } });
  page.fehler = [];
  page.on("pageerror", (e) => page.fehler.push(e.message));
  await page.route("**/geschichten/probebuch/geschichte.json", (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify(BUCH) }));
  await page.addInitScript(({ s, key, ohne }) => {
    if (ohne) try { Object.defineProperty(window, "speechSynthesis", { value: undefined }); } catch {}
    if (s && !sessionStorage.getItem("gesetzt")) { localStorage.setItem(key, JSON.stringify({ version: 1, themen: {}, aufgaben: {}, verlauf: [], buecher: { probebuch: s } })); sessionStorage.setItem("gesetzt", "1"); }
  }, { s: stand, key: STAND, ohne: ohneStimme });
  await page.goto(`${basis}/spiele/geschichte.html?id=probebuch&weiter=themen.html&pruefen${eltern ? "&eltern" : ""}`);
  await page.waitForFunction(() => window.lsGeschichte?.kapitelZahl > 0);
  return page;
};
const G = (page) => page.evaluate(() => ({ kapitel: window.lsGeschichte.kapitel, seite: window.lsGeschichte.seite, seiten: window.lsGeschichte.seiten }));
const sr = (page, f) => page.locator("ls-geschichte").evaluate(f);
const gespeichert = (page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) || "{}"), STAND);

for (const typ of [chromium, webkit]) {
  const browser = await typ.launch();
  const name = typ.name();

  // Buchanfang: Inhaltsverzeichnis
  let p = await oeffne(browser);
  pruefe((await G(p)).kapitel === -1, `${name}: Buchanfang zeigt das Inhaltsverzeichnis`);
  pruefe(await sr(p, (el) => el.shadowRoot.querySelectorAll(".inhalt .kapitelkarte").length) === 5, `${name}: fünf Kapitelkarten`);
  pruefe(await sr(p, (el) => /Kapitel 3 Titel/.test(el.shadowRoot.querySelector(".inhalt").textContent)), `${name}: Kapiteltitel auf den Karten`);
  pruefe(await sr(p, (el) => !el.shadowRoot.querySelector(".inhalt .weiterlesen") || el.shadowRoot.querySelector(".inhalt .weiterlesen").hidden), `${name}: ohne Stand kein „Weiterlesen“`);

  // Karte öffnet ihr Kapitel; Absätze
  await sr(p, (el) => el.shadowRoot.querySelectorAll(".inhalt .kapitelkarte")[2].click());
  let g = await G(p);
  pruefe(g.kapitel === 2 && g.seite === 0 && g.seiten === 4, `${name}: Karte 3 öffnet Kapitel 3, Seite 1`);
  pruefe(await sr(p, (el) => el.shadowRoot.querySelectorAll(".text p").length === 2), `${name}: Absätze als zwei p`);
  // Kapitelende
  await p.evaluate(() => { const l = window.lsGeschichte; while (l.seite < l.seiten - 1) l.weiter(); });
  pruefe(await sr(p, (el) => { const s = el.shadowRoot; return !s.querySelector(".naechstes").hidden && /Kapitel 4/.test(s.querySelector(".naechstes").getAttribute("wort") ?? "") && !s.querySelector(".zum-inhalt").hidden && s.querySelector(".fertig").hidden; }),
    `${name}: Kapitelende – „Kapitel 4“ und „Inhalt“, kein Fertig`);
  await sr(p, (el) => el.shadowRoot.querySelector(".naechstes").click());
  g = await G(p);
  pruefe(g.kapitel === 3 && g.seite === 0, `${name}: „Kapitel 4“ öffnet Kapitel 4`);
  await sr(p, (el) => el.shadowRoot.querySelector(".zum-inhalt").click());
  pruefe((await G(p)).kapitel === -1, `${name}: „Inhalt“ führt zum Inhaltsverzeichnis`);
  const st = (await gespeichert(p)).buecher?.probebuch;
  pruefe(st && st.kapitel === 3 && st.fertig.includes(2) && !st.fertig.includes(3), `${name}: Stand gemerkt (Kapitel 4, Kapitel 3 fertig) ${JSON.stringify(st)}`);
  pruefe(await sr(p, (el) => el.shadowRoot.querySelectorAll(".inhalt .kapitelkarte.gelesen").length === 1), `${name}: gelesenes Kapitel mit Haken`);
  pruefe(!p.fehler.length, `${name}: keine Seitenfehler ${p.fehler.join(" | ")}`);
  await p.close();

  // Weiterlesen springt zum Stand
  p = await oeffne(browser, { stand: { kapitel: 1, seite: 2, fertig: [0] } });
  pruefe(await sr(p, (el) => { const w = el.shadowRoot.querySelector(".inhalt .weiterlesen"); return w && !w.hidden && /Kapitel 2/.test(w.getAttribute("wort") ?? ""); }), `${name}: „Weiterlesen: Kapitel 2“ sichtbar`);
  await sr(p, (el) => el.shadowRoot.querySelector(".inhalt .weiterlesen").click());
  g = await G(p);
  pruefe(g.kapitel === 1 && g.seite === 2, `${name}: Weiterlesen springt zu Kapitel 2, Seite 3`);
  await p.close();

  // Vorlesen blättert nie ins nächste Kapitel
  p = await oeffne(browser);
  await p.evaluate(() => window.lsGeschichte.waehle("vorlesen"));
  await p.evaluate(() => window.lsGeschichte.oeffne(4));
  await p.evaluate(() => { const l = window.lsGeschichte; l.halte(); while (l.seite < l.seiten - 2) l.weiter(); l.halte(); });
  await p.waitForFunction(() => window.lsGeschichte.seite === window.lsGeschichte.seiten - 1, null, { timeout: 25000 });
  await p.waitForTimeout(7000);
  g = await G(p);
  pruefe(g.kapitel === 4 && g.seite === 3, `${name}: Vorlesen bleibt am Kapitelende stehen`);
  pruefe(await sr(p, (el) => !el.shadowRoot.querySelector(".fertig").hidden), `${name}: letztes Kapitel – Fertig`);
  await p.close();

  // Alle Kapitel fertig → gelesen; Vorschau der Eltern merkt nichts
  p = await oeffne(browser, { stand: { kapitel: 4, seite: 0, fertig: [0, 1, 2, 3] } });
  await sr(p, (el) => el.shadowRoot.querySelector(".inhalt .weiterlesen").click());
  await p.evaluate(() => { const l = window.lsGeschichte; while (l.seite < l.seiten - 1) l.weiter(); });
  await p.waitForTimeout(400);
  pruefe(!!(await gespeichert(p)).sachthemen?.geschichten?.probebuch, `${name}: alle Kapitel fertig – Buch gelesen`);
  await p.close();
  p = await oeffne(browser, { eltern: true });
  await sr(p, (el) => el.shadowRoot.querySelectorAll(".inhalt .kapitelkarte")[0].click());
  await p.evaluate(() => { const l = window.lsGeschichte; while (l.seite < l.seiten - 1) l.weiter(); });
  await p.waitForTimeout(400);
  pruefe(!(await gespeichert(p)).buecher, `${name}: Vorschau der Eltern merkt keinen Stand`);
  await p.close();

  // Nur das letzte Kapitel gelesen und „Fertig“: das Buch gilt noch nicht als gelesen (Spec §7)
  p = await oeffne(browser);
  await p.evaluate(() => { const l = window.lsGeschichte; l.oeffne(l.kapitelZahl - 1); while (l.seite < l.seiten - 1) l.weiter(); });
  await Promise.all([p.waitForURL(/themen\.html/), p.evaluate(() => window.lsGeschichte.fertig())]);
  await p.waitForLoadState("networkidle"); await p.waitForTimeout(300);
  pruefe(!(await gespeichert(p)).sachthemen?.geschichten?.probebuch, `${name}: nur letztes Kapitel + Fertig – Buch noch nicht gelesen`);
  await p.close();

  // Stand kommt erst nach dem ersten Kapitel an: aufgeschlagenes Kapitel bleibt, fertige Kapitel werden vereinigt
  p = await oeffne(browser);
  await p.evaluate(() => { window.lsGeschichte.oeffne(0); document.querySelector("ls-geschichte").setzeStand({ kapitel: 3, seite: 2, fertig: [1, 2] }); });
  const st2 = await p.evaluate(() => window.lsGeschichte.stand);
  pruefe((await G(p)).kapitel === 0 && st2.kapitel === 0 && [1, 2].every((k) => st2.fertig.includes(k)), `${name}: später Stand überschreibt das offene Kapitel nicht ${JSON.stringify(st2)}`);
  await p.close();

  // Ton aus im Inhaltsverzeichnis: keine Wahl mehr, Selbst lesen, nichts blättert stumm von selbst
  p = await oeffne(browser);
  await p.locator("ls-leiste").evaluate((el) => el.shadowRoot.querySelector(".tonknopf").click());
  pruefe(await p.evaluate(() => window.lsGeschichte.modus) === "selbst" && await sr(p, (el) => el.shadowRoot.querySelector(".wahl").hidden),
    `${name}: Ton aus im Inhaltsverzeichnis – Selbst lesen, Wahl verborgen`);
  await p.evaluate(() => window.lsGeschichte.oeffne(0));
  await p.waitForTimeout(8000);
  pruefe((await G(p)).seite === 0, `${name}: Ton aus – kein stummes Selbstblättern`);
  await p.close();

  // Alte Form mit seiten (Lerngeschichte) spielt weiter wie bisher
  const lp = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await lp.goto(`${basis}/spiele/geschichte.html?id=zehnerpaare&pruefen`);
  await lp.waitForFunction(() => window.lsGeschichte?.seiten > 0);
  pruefe((await lp.evaluate(() => window.lsGeschichte.kapitel)) === -1 && (await lp.evaluate(() => window.lsGeschichte.kapitelZahl)) === 0 &&
    await lp.locator("ls-geschichte").evaluate((el) => el.shadowRoot.querySelector(".inhalt").hidden), `${name}: Geschichte ohne Kapitel – kein Inhaltsverzeichnis`);
  await lp.close();

  // Layout: Inhaltsverzeichnis und Kapitelseiten in fünf Größen
  for (const groesse of [[1366, 1024], [1180, 820], [820, 1180], [390, 844], [844, 390]]) {
    p = await oeffne(browser, { groesse });
    const inhaltOk = await sr(p, (el) => {
      const i = el.shadowRoot.querySelector(".inhalt"), r = i.getBoundingClientRect();
      const karten = [...i.querySelectorAll(".kapitelkarte")];
      return r.width > 0 && i.scrollWidth <= i.clientWidth + 1 && karten.every((k) => { const kr = k.getBoundingClientRect(); return kr.left >= r.left - 1 && kr.right <= r.right + 1; });
    });
    await sr(p, (el) => el.shadowRoot.querySelectorAll(".inhalt .kapitelkarte")[0].click());
    await p.evaluate(() => { const l = window.lsGeschichte; while (l.seite < l.seiten - 1) l.weiter(); });
    await p.waitForTimeout(300);
    const seiteOk = await sr(p, (el) => {
      const s = el.shadowRoot, lese = s.querySelector(".lese").getBoundingClientRect(), tf = s.querySelector(".textfeld");
      const zeile = parseFloat(getComputedStyle(s.querySelector(".text")).lineHeight) || 40;
      const drin = [...s.querySelectorAll(".lese .knoepfe > *:not([hidden]), .lese .rechts > *:not([hidden])")]
        .every((e) => { const r = e.getBoundingClientRect(); return !r.width || (r.left >= lese.left - 1 && r.right <= lese.right + 1 && r.bottom <= lese.bottom + 1); });
      return tf.clientHeight >= 2 * zeile - 2 && drin;
    });
    pruefe(inhaltOk && seiteOk, `${name}: ${groesse.join("×")} – Inhaltsverzeichnis und Kapitelende passen (${inhaltOk}, ${seiteOk})`);
    await p.close();
  }
  await browser.close();
}
server.close();
process.exit(fehler ? 1 : 0);
