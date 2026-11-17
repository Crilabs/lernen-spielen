// Browser-Prüfung des Elternbereichs „Tagesbrief“ und der Startseite ohne Karten „Mit echten Dingen“
// (Spec docs/superpowers/specs/2026-11-17-tagesbrief-design.md, „In der App“). Kein Teil von `npm test`:
// braucht Playwright und installierte Browser.
//
//   NODE_PATH=/private/tmp/claude-501/pw/node_modules node tests/browser/tagesbrief.spec.mjs
//   (SHOTS=<ordner> legt Bildschirmfotos ab)
//
// Die App wird nachgebaut: ein Init-Skript setzt window.__TAURI__ mit einem `invoke`, das den Lernstand aus dem
// localStorage liefert und die Tagesbrief-Befehle aus window.__tb beantwortet (Zustand, aufgezeichnete Aufrufe).
// Geprüft: aus (Felder, Standard 18:00, Einrichten, Meldung „Wir haben eine E-Mail …“), wartet (Abfrage alle 10 s, dann
// aktiv), aktiv („✓ Eingerichtet“, Vorschau im iframe, Probebrief, Uhrzeit ändern, Abbestellen), aktiv ohne Neues
// (Hinweis statt iframe), abbestellt (Neu einrichten), Datenschutzsatz; Startseite ohne .karte.echt, echt.html lädt.

import { createRequire } from "node:module";
import { starteStumm } from "./stumm.mjs";
import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { starteServer } from "./server.mjs";

const require = createRequire(import.meta.url);
const { chromium, webkit } = require("playwright");
const WURZEL = resolve(fileURLToPath(import.meta.url), "../../..");
const SHOTS = process.env.SHOTS;
const { pinHash } = await import("../../spiele/eltern.js");

const server = await starteServer(WURZEL);
const basis = `http://127.0.0.1:${/** @type {any} */ (server.address()).port}/spiele`;
let fehler = 0;
const pruefe = (ok, was, info = "") => { console.log(`${ok ? "ok  " : "FEHLER"} ${was}${ok ? "" : " " + info}`); if (!ok) fehler++; };

const HEUTE = new Date().toLocaleDateString("sv");
const STAND_MIT_NEUEM = { version: 1, themen: { zweierreihe: { z: "kann-ich", stufe: "kopf", e: "", seit: HEUTE, k: HEUTE, u: "", frei: 0, v: [] } }, aufgaben: {}, verlauf: [] };
const PIN = await pinHash("1234");

/** Neue Seite mit nachgebauter App; `tb` ist der Anfangszustand des Dienstes. */
async function neueSeite(browser, tb, stand) {
  const kontext = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  await kontext.addInitScript(({ tb, stand, pin }) => {
    if (location.protocol !== "http:") return;
    localStorage.setItem("lernstand-eltern", JSON.stringify({ pinHash: pin }));
    if (stand && !localStorage.getItem("lernstand-kind-1-lernplan")) localStorage.setItem("lernstand-kind-1-lernplan", JSON.stringify(stand));
    window.__tb = { zustand: "aus", adresse: "", uhrzeit: "18:00", aufrufe: [], ...tb };
    const key = (a) => (a.spiel === "eltern" || a.spiel === "geraet" ? `lernstand-${a.spiel}` : `lernstand-${a.profil}-${a.spiel}`);
    window.__TAURI__ = {
      core: {
        invoke: async (name, a = {}) => {
          if (name === "lernstand_lesen") return localStorage.getItem(key(a));
          if (name === "lernstand_schreiben") { localStorage.setItem(key(a), a.daten); return null; }
          if (!name.startsWith("tagesbrief_")) return null;
          const t = window.__tb;
          t.aufrufe.push({ name, args: a });
          if (name === "tagesbrief_status") return { zustand: t.zustand, adresse: t.adresse, uhrzeit: t.uhrzeit };
          if (name === "tagesbrief_einrichten") { t.zustand = "wartet"; t.adresse = a.adresse; t.uhrzeit = a.uhrzeit; return "anfrage-1"; }
          if (name === "tagesbrief_einstellen") { t.uhrzeit = a.uhrzeit; return null; }
          if (name === "tagesbrief_abmelden") { t.zustand = "abbestellt"; return null; }
          return null;
        },
      },
    };
  }, { tb, stand, pin: PIN });
  const seite = await kontext.newPage();
  const fehlerListe = [];
  seite.on("pageerror", (e) => fehlerListe.push(`Seitenfehler: ${e.message}`));
  seite.on("console", (m) => { if (m.type() === "error") fehlerListe.push(`Konsole: ${m.text()}`); });
  return { kontext, seite, fehlerListe };
}

/** PIN eingeben und den Punkt „Tagesbrief“ öffnen. */
async function oeffneTagesbrief(seite) {
  await seite.goto(`${basis}/eltern.html`);
  for (const z of "1234") await seite.evaluate((z) => [...document.querySelectorAll("#ziffern ls-knopf")].find((k) => k.getAttribute("wort") === z).click(), z);
  await seite.waitForFunction(() => !document.getElementById("bereich").hidden);
  await seite.evaluate(() => document.querySelector('[data-tab="tagesbrief"]').click());
  await seite.waitForSelector("#inhalt h2");
}
const klick = (seite, wort) => seite.evaluate((w) => [...document.querySelectorAll("#inhalt ls-knopf")].find((k) => k.getAttribute("wort") === w).click(), wort);
const text = (seite) => seite.locator("#inhalt").innerText();
const aufrufe = (seite, name) => seite.evaluate((n) => window.__tb.aufrufe.filter((a) => a.name === n), name);

for (const typ of [chromium, webkit]) {
  const L = `[${typ.name()}]`;
  const browser = await starteStumm(typ);

  // --- aus -> Einrichten -> wartet -> (Abfrage) -> aktiv ---------------------------------------------------------
  {
    const { kontext, seite, fehlerListe } = await neueSeite(browser, {}, STAND_MIT_NEUEM);
    await oeffneTagesbrief(seite);
    await seite.waitForSelector('#inhalt input[name="adresse"]');
    const aus = await seite.evaluate(() => ({
      adresse: !!document.querySelector('input[name="adresse"]'), name: !!document.querySelector('input[name="name"]'),
      uhr: document.querySelector('input[name="uhrzeit"]')?.value, knopf: !!document.querySelector('#inhalt ls-knopf[wort="Einrichten"]'),
      nav: document.querySelector('[data-tab="tagesbrief"]').getAttribute("aria-current"),
    }));
    pruefe(aus.adresse && aus.name && aus.uhr === "18:00" && aus.knopf && aus.nav === "page", `${L} aus: Felder E-Mail, Name, Uhrzeit 18:00, Knopf „Einrichten“`, JSON.stringify(aus));
    pruefe((await text(seite)).includes("Was Ihr Kind lernt, liegt bis zum Versand auf unserem Server und wird danach gelöscht."), `${L} Datenschutzsatz sichtbar`);
    if (SHOTS) { await mkdir(SHOTS, { recursive: true }); await seite.screenshot({ path: join(SHOTS, `tagesbrief-aus-${typ.name()}.png`) }); }

    await klick(seite, "Einrichten"); // ohne Adresse
    pruefe((await text(seite)).includes("gültige E-Mail-Adresse") && (await aufrufe(seite, "tagesbrief_einrichten")).length === 0, `${L} ohne Adresse: Hinweis, kein Befehl`);

    await seite.fill('input[name="adresse"]', "eltern@example.org");
    await seite.fill('input[name="name"]', "Lena");
    await klick(seite, "Einrichten");
    await seite.waitForFunction(() => document.getElementById("inhalt").innerText.includes("Bitte den Link darin bestätigen."));
    const ein = await aufrufe(seite, "tagesbrief_einrichten");
    pruefe(ein.length === 1 && JSON.stringify(ein[0].args) === JSON.stringify({ profil: "kind-1", adresse: "eltern@example.org", name: "Lena", uhrzeit: "18:00" }), `${L} Einrichten ruft den Befehl mit Profil, Adresse, Name, Uhrzeit`, JSON.stringify(ein));
    pruefe((await text(seite)).includes("Wir haben eine E-Mail an eltern@example.org geschickt. Bitte den Link darin bestätigen."), `${L} wartet: Text mit Adresse`);

    await seite.evaluate(() => { window.__tb.zustand = "aktiv"; }); // Link bestätigt
    await seite.waitForFunction(() => document.getElementById("inhalt").innerText.includes("✓ Eingerichtet"), null, { timeout: 15000 });
    pruefe(true, `${L} wartet: nach der Bestätigung zeigt die Abfrage von selbst „✓ Eingerichtet“`);

    // --- aktiv --------------------------------------------------------------------------------------------------
    await seite.waitForSelector("iframe.tb-vorschau");
    const vor = await seite.evaluate(() => {
      const f = document.querySelector("iframe.tb-vorschau");
      const w = [...document.querySelectorAll("#inhalt ls-knopf")].map((k) => k.getAttribute("wort"));
      return { srcdoc: f.srcdoc.includes("<html") || f.srcdoc.includes("<body"), lena: f.srcdoc.includes("Lena"), neu: f.srcdoc.includes("Zweierreihe") || f.srcdoc.includes("zweierreihe") || /Kann jetzt/.test(f.srcdoc), knoepfe: w };
    });
    pruefe(vor.srcdoc && vor.lena && vor.neu, `${L} aktiv: Vorschau (iframe srcdoc) mit Name und gekonntem Thema`, JSON.stringify(vor));
    pruefe(["Probebrief senden", "Uhrzeit ändern", "Abbestellen"].every((w) => vor.knoepfe.includes(w)), `${L} aktiv: Knöpfe Probebrief senden, Uhrzeit ändern, Abbestellen`, JSON.stringify(vor.knoepfe));
    pruefe(!(await text(seite)).includes("Neu einrichten"), `${L} aktiv: kein „Neu einrichten“`);
    if (SHOTS) await seite.screenshot({ path: join(SHOTS, `tagesbrief-aktiv-${typ.name()}.png`) });

    await klick(seite, "Probebrief senden");
    await seite.waitForFunction(() => document.getElementById("inhalt").innerText.includes("Der Probebrief ist unterwegs."));
    pruefe((await aufrufe(seite, "tagesbrief_probebrief")).length === 1, `${L} Probebrief ruft den Befehl`);

    await klick(seite, "Uhrzeit ändern");
    await seite.fill('#inhalt .tb-felder input[name="uhrzeit"]', "19:30");
    await klick(seite, "Speichern");
    await seite.waitForFunction(() => document.getElementById("inhalt").innerText.includes("19:30"));
    const einst = await aufrufe(seite, "tagesbrief_einstellen");
    pruefe(einst.length === 1 && einst[0].args.uhrzeit === "19:30" && einst[0].args.name === "Lena" && einst[0].args.profil === "kind-1", `${L} Uhrzeit ändern ruft einstellen (Name bleibt)`, JSON.stringify(einst));

    await klick(seite, "Abbestellen");
    await seite.waitForFunction(() => document.getElementById("inhalt").innerText.includes("Abbestellt"));
    pruefe((await aufrufe(seite, "tagesbrief_abmelden")).length === 1 && await seite.evaluate(() => !!document.querySelector('#inhalt ls-knopf[wort="Neu einrichten"]')), `${L} abbestellt: „Abbestellt“ und „Neu einrichten“`);
    if (SHOTS) await seite.screenshot({ path: join(SHOTS, `tagesbrief-abbestellt-${typ.name()}.png`) });

    await klick(seite, "Neu einrichten");
    await seite.fill('input[name="adresse"]', "neu@example.org");
    await klick(seite, "Einrichten");
    await seite.waitForFunction(() => document.getElementById("inhalt").innerText.includes("neu@example.org"));
    pruefe((await aufrufe(seite, "tagesbrief_einrichten")).length === 2, `${L} Neu einrichten ruft den Befehl erneut`);
    pruefe(fehlerListe.length === 0, `${L} keine Seiten- oder Konsolenfehler`, fehlerListe.join(" | "));
    await kontext.close();
  }

  // --- aktiv, aber nichts Neues: Hinweis statt iframe ------------------------------------------------------------
  {
    const { kontext, seite, fehlerListe } = await neueSeite(browser, { zustand: "aktiv", adresse: "eltern@example.org" }, null);
    await oeffneTagesbrief(seite);
    await seite.waitForFunction(() => document.getElementById("inhalt").innerText.includes("✓ Eingerichtet"));
    await seite.waitForFunction(() => document.querySelector("iframe.tb-vorschau") || document.getElementById("inhalt").innerText.includes("Heute gibt es noch nichts Neues."));
    pruefe(await seite.evaluate(() => !document.querySelector("iframe.tb-vorschau")) && (await text(seite)).includes("Heute gibt es noch nichts Neues."), `${L} aktiv ohne Neues: „Heute gibt es noch nichts Neues.“ statt iframe`);
    pruefe(fehlerListe.length === 0, `${L} keine Fehler (ohne Neues)`, fehlerListe.join(" | "));
    await kontext.close();
  }

  // --- gesperrt und abbestellt direkt ----------------------------------------------------------------------------
  {
    const { kontext, seite } = await neueSeite(browser, { zustand: "abbestellt" }, null);
    await oeffneTagesbrief(seite);
    await seite.waitForFunction(() => document.getElementById("inhalt").innerText.includes("Abbestellt"));
    pruefe(await seite.evaluate(() => !!document.querySelector('#inhalt ls-knopf[wort="Neu einrichten"]')), `${L} Start im Zustand abbestellt: „Neu einrichten“`);
    await kontext.close();
  }

  // --- Startseite ohne Karten „Mit echten Dingen“; echt.html bleibt ----------------------------------------------
  {
    const { kontext, seite, fehlerListe } = await neueSeite(browser, {}, STAND_MIT_NEUEM);
    // ohne App-Nachbau: die Startseite läuft im Browser
    await kontext.close();
    const k2 = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const s2 = await k2.newPage();
    const f2 = [];
    s2.on("pageerror", (e) => f2.push(e.message));
    await s2.goto(`${basis}/index.html`);
    await s2.waitForSelector("a.karte.spiel");
    pruefe(await s2.locator("a.karte.echt").count() === 0 && await s2.locator("a.karte.spiel").count() > 0, `${L} Startseite: Spielkarten ja, keine Karten „Mit echten Dingen“`);
    await s2.goto(`${basis}/echt.html?thema=neunerreihe`);
    await s2.waitForFunction(() => document.body.innerText.trim().length > 20, null, { timeout: 10000 });
    pruefe(!/nicht gefunden/i.test(await s2.locator("body").innerText()) && f2.length === 0, `${L} echt.html?thema=neunerreihe lädt weiter`, f2.join(" | "));
    pruefe(fehlerListe.length === 0, `${L} keine Fehler (Startseite)`);
    await k2.close();
  }
  await browser.close();
}
server.close();
console.log(fehler ? `${fehler} Fehler` : "alle Prüfungen bestanden");
process.exit(fehler ? 1 : 0);
