// Browser-Prüfung der Spielzeit (Spec 2026-11-14-spielzeit): Startseite, Spielstart, Pause, Takt, Elternbereich.
// Kein Teil von `npm test`: braucht Playwright und Chromium.
//
// Aufruf wie tests/browser/vorlage.spec.mjs:
//   NODE_PATH=/private/tmp/claude-501/pw/node_modules node tests/browser/spielzeit.spec.mjs
// Optional: SHOTS=/pfad/zum/ordner legt spielzeit-<schritt>-<breite>x<hoehe>.png ab (start, eltern).
//
// Geprüft wird bei 1920 × 1080 und 1280 × 800: Startseite gesperrt zeigt den Satz und das Regal, keine Spielkarten, ausgeblendet ohne
// Satz; ein gesperrtes Spiel führt zur Startseite; die Pause zeigt den Satz und ohne Weiter beim Schluss;
// amRundenende warnt einmal je Tag; der Takt zählt nur mit Eingabe in den letzten zwei Minuten; im Elternbereich
// stellen Weniger/Mehr, Tage, Ausblenden und „Heute 15 Minuten mehr“ die gespeicherten Werte; keine Konsolenfehler.

import { createRequire } from "node:module";
import { durchEinfuehrung } from "./einfuehrung-durch.mjs";
import { starteStumm } from "./stumm.mjs";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { starteServer } from "./server.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const { pinHash } = await import("../../spiele/eltern.js");

const WURZEL = resolve(fileURLToPath(import.meta.url), "../../..");
// Server mit Byte-Bereichen: tests/browser/server.mjs (wie die anderen Browser-Prüfungen).

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
/** Trägt die Vorlage im Browser in spiele.json ein (wie der Schreibweg in vorlage.spec.mjs): die Startseite hat
 * dann eine Spielkarte, sonst gäbe es nichts, das die Sperre ausblenden könnte. */
async function mitVorlage(kontext) {
  await kontext.route("**/spiele/spiele.json", async (route) => {
    const antwort = await route.fetch();
    const json = await antwort.json();
    json.spiele.push({ id: "vorlage", titel: "Spielvorlage", thema: "Zerlegen", kategorie: "mathe", datei: "vorlage/index.html", arten: [{ art: "zerlegung", zahlen: [7, 7], stufen: ["material"] }] });
    await route.fulfill({ response: antwort, json });
  });
}
/** Startseite fertig aufgebaut: rechts „Was ich schon kann“ (ersetzt #regal), im Raster die Karten. */
const startFertig = (seite) => seite.waitForSelector(".regal-knopf", { state: "attached", timeout: 5000 });
const spielKarten = (seite) => seite.locator("#raster a.karte.spiel").count();
const lies = (seite, k) => seite.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? "null"), k);

const server = await starteServer(WURZEL);
const BASIS = `http://127.0.0.1:${server.address().port}/spiele/`;
const browser = await starteStumm(chromium);
if (SHOTS) await mkdir(SHOTS, { recursive: true });

try {
  for (const groesse of AUFLOESUNGEN) {
    const L = `${groesse.width}x${groesse.height}`;

    // 1. Startseite: Tagesgrenze erreicht → Satz mit „Morgen“, Regal bleibt; ausgeblendet → kein Satz.
    {
      const vor = await neueSeite(browser, groesse);
      await mitVorlage(vor.kontext);
      await vor.seite.goto(BASIS + "index.html");
      await startFertig(vor.seite);
      const frei = await spielKarten(vor.seite);
      pruefe(L, "Startseite frei (ohne Spielzeit-Regeln): Spielkarten da", frei > 0, String(frei));
      const stand = await standMit(vor.seite, 30);
      await vor.kontext.close();
      const { kontext, seite, konsole } = await neueSeite(browser, groesse, {
        "lernstand-kind-1-einstellungen": einst({ proTag: 30 }), "lernstand-kind-1-spielzeit-stand": stand,
      });
      await mitVorlage(kontext);
      await seite.goto(BASIS + "index.html");
      await seite.waitForFunction(() => !document.getElementById("schluss").hidden, null, { timeout: 5000 });
      await startFertig(seite);
      const text = await seite.locator("#schluss").textContent();
      pruefe(L, "Startseite gesperrt: Satz mit „Morgen geht es weiter“", text === "Für heute ist das Spielen fertig. Morgen geht es weiter.", text);
      const gesperrt = await spielKarten(seite);
      pruefe(L, "Startseite gesperrt: Regal bleibt sichtbar, keine Spielkarten", await seite.locator(".regal-knopf:not(.bibliothek-knopf)").isVisible() && gesperrt === 0, `Spielkarten: ${gesperrt}`);
      const box = await seite.locator("#schluss").boundingBox();
      pruefe(L, "Satz liegt ganz im Bild", box && box.x >= 0 && box.x + box.width <= groesse.width && box.y >= 0, JSON.stringify(box));
      if (SHOTS) await seite.screenshot({ path: `${SHOTS}/spielzeit-start-${L}.png` });

      // 2. Ein gesperrtes Spiel führt zur Startseite.
      await seite.goto(BASIS + "vorlage/index.html");
      // Die Vorlage heißt selbst vorlage/index.html: genau die Startseite verlangen.
      await seite.waitForURL(BASIS + "index.html", { timeout: 5000 }).catch(() => {});
      pruefe(L, "gesperrtes Spiel führt zur Startseite", seite.url() === BASIS + "index.html", seite.url());
      pruefe(L, "Startseite ohne Konsolenfehler", konsole.length === 0, konsole.join(" | "));
      await kontext.close();
    }
    {
      const { kontext, seite } = await neueSeite(browser, groesse, { "lernstand-kind-1-einstellungen": einst({ ausgeblendet: true }) });
      await mitVorlage(kontext);
      await seite.goto(BASIS + "index.html");
      await startFertig(seite);
      await seite.waitForTimeout(400);
      const karten = await spielKarten(seite);
      pruefe(L, "ausgeblendet: kein Satz, Regal da, keine Spielkarten", await seite.locator("#schluss").isHidden() && await seite.locator(".regal-knopf:not(.bibliothek-knopf)").isVisible() && karten === 0, `Spielkarten: ${karten}`);
      await kontext.close();
    }

    // Uhrzeit: vor dem Beginn „später los“, nach dem Ende Schluss (von 23:59 bzw. bis 0:01 trifft zu jeder Laufzeit).
    for (const [regel, erwartet, name] of [
      [{ von: 1439 }, "Das Spielen geht heute später los.", "vor dem Beginn"],
      [{ bis: 1 }, "Für heute ist das Spielen fertig. Morgen geht es weiter.", "nach dem Ende"],
    ]) {
      const { kontext, seite, konsole } = await neueSeite(browser, groesse, { "lernstand-kind-1-einstellungen": einst(regel) });
      await seite.goto(BASIS + "index.html");
      await seite.waitForFunction(() => !document.getElementById("schluss").hidden, null, { timeout: 5000 }).catch(() => {});
      const text = await seite.locator("#schluss").textContent();
      pruefe(L, `Uhrzeit ${name}: Satz auf der Startseite`, text === erwartet, text);
      pruefe(L, `Uhrzeit ${name}: ohne Konsolenfehler`, konsole.length === 0, konsole.join(" | "));
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
      await seite.goto(BASIS + "vorlage/index.html");
      await durchEinfuehrung(seite, "#tablett .stab");
      const zwei = await seite.evaluate(async () => {
        const { amRundenende } = await import("../rahmen/spielzeit.js");
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
      await seite.goto(BASIS + "vorlage/index.html");
      await durchEinfuehrung(seite, "#tablett .stab", { uhr: true });
      await seite.mouse.click(groesse.width / 2, groesse.height - 40);
      await seite.clock.runFor(60_000);
      pruefe(L, "Vorschau zählt keine Spielzeit", (await lies(seite, "lernstand-kind-1-spielzeit-stand")) === null);
      await kontext.close();
    }
    {
      const { kontext, seite } = await neueSeite(browser, groesse, { "lernstand-kind-1-einstellungen": einst({}) });
      // Die Vorschau zählt nicht: die Vorlage als eingetragenes Spiel (wie der Schreibweg in vorlage.spec.mjs).
      await mitVorlage(kontext);
      await seite.clock.install();
      await seite.goto(BASIS + "vorlage/index.html");
      // Das Spiel beginnt mit der Einführung (docs/spielbau.md §8); ihr Durchtippen zählt mit und wird abgezogen.
      const vorEinf = await seite.evaluate(() => Date.now());
      await durchEinfuehrung(seite, "#tablett .stab", { uhr: true });
      const einfSek = Math.round(((await seite.evaluate(() => Date.now())) - vorEinf) / 1000);
      await seite.mouse.click(groesse.width / 2, groesse.height - 40);
      await seite.clock.runFor(60_000);
      await seite.mouse.click(groesse.width / 2, groesse.height - 40);
      await seite.clock.runFor(5 * 60_000); // nach der letzten Eingabe zählen höchstens zwei Minuten
      await seite.clock.runFor(1_000);
      const s = await lies(seite, "lernstand-kind-1-spielzeit-stand");
      const sek = (s?.tage?.[heute]?.sekunden ?? 0) - einfSek;
      pruefe(L, "Takt: etwa 1 + 2 Minuten gezählt (ohne Einführung), nicht die ganzen 6", sek >= 165 && sek <= 200, `${sek} (Einführung ${einfSek} s abgezogen)`);
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
      await klick('ls-knopf[name="Frühestens ab: später"]');
      await seite.waitForTimeout(100);
      await klick('ls-knopf[name="Frühestens ab: später"]');
      await seite.waitForTimeout(100);
      await klick('ls-knopf[name="Spätestens bis: früher"]');
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
      pruefe(L, "Eltern: Uhrzeit ab 6:30 bis 22:00 Uhr", e?.von === 390 && e?.bis === 1320, JSON.stringify(e));
      const st = await lies(seite, "lernstand-kind-1-spielzeit-stand");
      pruefe(L, "Eltern: Zugabe 15 Minuten für heute", st?.tage?.[heute]?.zugabe === 15, JSON.stringify(st));
      const text = await seite.locator("#inhalt").innerText();
      pruefe(L, "Eltern: Stand zeigt Grenze und Zugabe", /Heute: 0 Minuten von 15 Minuten\./.test(text) && /Heute dazugegeben: 15 Minuten\./.test(text) && /Uhrzeit: 6:30 Uhr bis 22:00 Uhr\./.test(text), text.slice(0, 400));
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
