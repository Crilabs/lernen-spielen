// Browser-Prüfung der Grenzen der Eltern (Spec 2026-11-16-buecherzeit): Bibliothek, Abspieler, Elternbereich, Uhr
// über gesperrten Spielen und Büchern, Hinweis nur mit OK, Zahnrad auf „Wissen“.
// Kein Teil von `npm test`: braucht Playwright und Chromium.
//   NODE_PATH=/private/tmp/claude-501/pw/node_modules node tests/browser/buecherzeit.spec.mjs

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
  /** Prüft den Hinweis: geht auf, Escape und Tippen daneben schließen nicht, OK schließt; die Seite bleibt. */
  async function pruefeHinweis(seite, wo, satz) {
    const url = seite.url();
    await seite.waitForSelector("dialog.ls-hinweis[open]");
    pruefe(`${wo}: Hinweis mit Satz`, (await seite.locator("dialog.ls-hinweis p").innerText()) === satz);
    await seite.keyboard.press("Escape");
    await seite.mouse.click(5, 5);
    await seite.waitForTimeout(200);
    pruefe(`${wo}: Escape und daneben schließen nicht`, await seite.locator("dialog.ls-hinweis[open]").count() === 1);
    await seite.evaluate(() => document.querySelector("dialog.ls-hinweis .ok").click());
    await seite.waitForTimeout(200);
    pruefe(`${wo}: OK schließt, Seite bleibt`, await seite.locator("dialog.ls-hinweis[open]").count() === 0 && seite.url() === url);
  }
  const PAUSE = "Du hast heute schon viel geschafft. Jetzt ist Zeit für eine Pause!";

  // 1. Grenze 1 am Tag, auch für Lesen, heute vorgelesen: das Buch bleibt frei, die anderen tragen die Uhr.
  {
    const s = await speicher({ anzahl: 1, je: "tag", auchLesen: true }, { vorlesen: ["haustiere"] });
    const { kontext, seite, konsole } = await neueSeite(browser, s);
    await seite.goto(BASIS + "bibliothek.html?raum=tiere");
    await seite.waitForSelector(".buch");
    pruefe("Bibliothek: heute geöffnetes Buch frei", (await seite.locator('a.buch:not(.gesperrt)[href*="id=haustiere"]').count()) === 1);
    const zu = await seite.locator(".buch.gesperrt").count(), offen = await seite.locator(".buch:not(.gesperrt)").count();
    pruefe("Bibliothek: übrige Bücher gesperrt", zu > 0 && offen === 1, `${zu} zu, ${offen} offen`);
    pruefe("Bibliothek: Uhr über dem Deckel", await seite.locator(".buch.gesperrt .deckel .ls-sperre").count() === zu);
    await seite.locator(".buch.gesperrt").first().click();
    await pruefeHinweis(seite, "Bibliothek", PAUSE);
    pruefe("Wissen: Zahnrad für Erwachsene", await seite.locator('#zahnrad ls-knopf[name="Für Erwachsene: gedrückt halten"]').count() === 1);
    await seite.goto(BASIS + "geschichte.html?id=hund&weiter=" + encodeURIComponent("bibliothek.html?raum=tiere"));
    await seite.waitForURL(/bibliothek\.html/);
    pruefe("Direkt geöffnet: zurück zur Bibliothek", /bibliothek\.html\?raum=tiere/.test(seite.url()), seite.url());
    pruefe("Gesperrt merkt nichts", !(await lies(seite, STAND)).tage[heute].selbst.includes("hund"));
    pruefe("Bibliothek ohne Konsolenfehler", konsole.length === 0, konsole.join(" | "));
    await kontext.close();
  }
  // 2. Grenze nur fürs Vorlesen erreicht: keine Uhr; Sachbuch ohne Anhören, Lesen merkt das Buch.
  {
    const s = await speicher({ anzahl: 1, je: "tag" }, { vorlesen: ["haustiere"] });
    const { kontext, seite, konsole } = await neueSeite(browser, s);
    await seite.goto(BASIS + "bibliothek.html?raum=tiere");
    await seite.waitForSelector(".buch");
    pruefe("Nur Vorlesen: kein Buch gesperrt", await seite.locator(".buch.gesperrt").count() === 0);
    await seite.goto(BASIS + "geschichte.html?id=hund&weiter=bibliothek.html&pruefen");
    await seite.waitForFunction(() => window.lsGeschichte?.kapitelZahl > 0);
    const k = await seite.locator("ls-geschichte").evaluate((el) => ({
      ohneVor: el.classList.contains("ohne-vorlesen"), ohneSelbst: el.classList.contains("ohne-selbst"),
      anhoeren: getComputedStyle(el.shadowRoot.querySelector(".start-anhoeren")).display,
      lesen: getComputedStyle(el.shadowRoot.querySelector(".start-lesen")).display, modus: el.modus }));
    pruefe("Sachbuch: Anhören fehlt, Lesen da", k.ohneVor && !k.ohneSelbst && k.anhoeren === "none" && k.lesen !== "none" && k.modus === "selbst", JSON.stringify(k));
    await seite.evaluate(() => window.lsGeschichte.starte("selbst"));
    await seite.waitForFunction((k) => Object.values(JSON.parse(localStorage.getItem(k)).tage).some((t) => t.selbst.includes("hund")), STAND);
    pruefe("Sachbuch: Lesen merkt das Buch", true);
    await seite.goto(BASIS + "geschichte.html?id=zehnerpaare&weiter=bibliothek.html&pruefen");
    await seite.waitForFunction(() => window.lsGeschichte?.seiten > 0);
    const w = await seite.locator("ls-geschichte").evaluate((el) => [".waehle-vorlesen", ".waehle-selbst"].map((q) => getComputedStyle(el.shadowRoot.querySelector(q)).display));
    pruefe("Kurzgeschichte: nur Selbst lesen zur Wahl", w[0] === "none" && w[1] !== "none", JSON.stringify(w));
    pruefe("Abspieler ohne Konsolenfehler", konsole.length === 0, konsole.join(" | "));
    await kontext.close();
  }
  // 3. Vorschau der Eltern: keine Grenze, nichts gemerkt.
  {
    const s = await speicher({ anzahl: 1, je: "tag", auchLesen: true }, { vorlesen: ["x"] });
    const { kontext, seite } = await neueSeite(browser, s);
    await seite.goto(BASIS + "geschichte.html?id=hund&eltern&weiter=eltern.html&pruefen");
    await seite.waitForFunction(() => window.lsGeschichte?.kapitelZahl > 0);
    await seite.evaluate(() => window.lsGeschichte.starte("selbst"));
    await seite.waitForTimeout(300);
    const st = (await lies(seite, STAND)).tage[heute];
    pruefe("Vorschau: offen und merkt nichts", /geschichte\.html/.test(seite.url()) && !st.selbst.includes("hund"), JSON.stringify(st));
    await kontext.close();
  }
  // 4. Spielzeit um: Spielkarten auf Startseite mit Uhr, Tippen zeigt den Hinweis statt das Spiel.
  {
    const { kontext, seite } = await neueSeite(browser);
    await seite.goto(BASIS + "bibliothek.html");
    const woche = await seite.evaluate(async () => (await import("./kern/spielzeit.js")).wochenSchluessel(new Date()));
    await kontext.close();
    const { kontext: k2, seite: s2, konsole } = await neueSeite(browser, {
      [EINST]: JSON.stringify({ spielzeit: { proTag: 1 } }),
      "lernstand-kind-1-spielzeit-stand": JSON.stringify({ woche, tage: { [heute]: { sekunden: 120, zugabe: 0 } } }),
    });
    await s2.goto(BASIS + "index.html");
    await s2.waitForSelector("a.karte.spiel");
    const n = await s2.locator("a.karte.spiel").count(), g = await s2.locator("a.karte.spiel.gesperrt .bild .ls-sperre").count();
    pruefe("Startseite: alle Spielkarten mit Uhr", n > 0 && g === n, `${g} von ${n}`);
    await s2.locator("a.karte.spiel").first().click();
    await pruefeHinweis(s2, "Startseite", PAUSE);
    pruefe("Startseite: Echte Dinge ohne Uhr", await s2.locator("a.karte.echt.gesperrt").count() === 0);
    pruefe("Startseite ohne Konsolenfehler", konsole.length === 0, konsole.join(" | "));
    await k2.close();
  }
  // 5. Elternbereich: Höchstens, Tag/Woche, „Gilt auch für Lesen“, „Heute ein Buch mehr“.
  {
    const { kontext, seite, konsole } = await neueSeite(browser, { "lernstand-eltern": JSON.stringify({ pinHash: await pinHash("1234") }) });
    await seite.goto(BASIS + "eltern.html");
    for (const z of "1234") await seite.evaluate((z) => [...document.querySelectorAll("#ziffern ls-knopf")].find((k) => k.getAttribute("wort") === z).click(), z);
    await seite.waitForFunction(() => !document.getElementById("bereich").hidden);
    await seite.evaluate(() => document.querySelector('[data-tab="spielzeit"]').click());
    await seite.waitForSelector('ls-knopf[name="Höchstens: mehr"]');
    const klick = async (sel) => { await seite.evaluate((sel) => document.querySelector(sel).click(), sel); await seite.waitForTimeout(150); };
    await klick('ls-knopf[name="Höchstens: mehr"]');
    await klick('ls-knopf[name="Höchstens: mehr"]');
    await klick('ls-knopf[name="Bücher: in der woche"]');
    await klick('.haken input');
    await klick('ls-knopf[wort="Heute ein Buch mehr"]');
    await seite.waitForTimeout(400);
    const e = (await lies(seite, EINST))?.buecher;
    pruefe("Eltern: höchstens 2 in der Woche, auch Lesen", e?.anzahl === 2 && e?.je === "woche" && e?.auchLesen === true, JSON.stringify(e));
    pruefe("Eltern: ein Buch mehr für heute", (await lies(seite, STAND))?.tage?.[heute]?.zugabe === 1);
    const text = await seite.locator("#inhalt").innerText();
    pruefe("Eltern: Stand zeigt Grenze und Zugabe", /Diese Woche geöffnet: 0 von 2 Büchern/.test(text) && /Heute dazugegeben: 1 Buch\./.test(text), text.slice(text.indexOf("Bücher\n"), text.indexOf("Bücher\n") + 600));
    pruefe("Eltern: Spielzeit-Einstellung unberührt", (await lies(seite, EINST))?.spielzeit === undefined);
    await seite.screenshot({ path: process.env.BILD ?? "/dev/null" }).catch(() => {});
    pruefe("Eltern ohne Konsolenfehler", konsole.length === 0, konsole.join(" | "));
    await kontext.close();
  }
} finally {
  await browser.close();
  server.close();
}
console.log(`\n${geprueft - fehler}/${geprueft} geprüft, ${fehler} Fehler`);
process.exit(fehler ? 1 : 0);
