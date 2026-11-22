// Browser-Prüfung des Elternbereichs „Tagesbrief“ und der Startseite ohne Karten „Mit echten Dingen“
// (Spec docs/superpowers/specs/2026-11-17-tagesbrief-design.md, „In der App“). Kein Teil von `npm test`:
// braucht Playwright und installierte Browser.
//
//   NODE_PATH=/private/tmp/claude-501/pw/node_modules node tests/browser/tagesbrief.spec.mjs
//   (SHOTS=<ordner> legt Bildschirmfotos ab)
//
// Die App wird nachgebaut: ein Init-Skript setzt window.__TAURI__ mit einem `invoke`, das den Lernstand aus dem
// localStorage liefert und die Tagesbrief-Befehle aus window.__tb beantwortet (Zustand, aufgezeichnete Aufrufe).
// Geprüft: Empfängerliste (Adressen, bestätigt/wartend, Hinzufügen bis vier, Entfernen, letzte Adresse mit Rückfrage), Namensprüfung;
// aus (Felder, Standard 18:00, Einrichten, Meldung „Wir haben eine E-Mail …“), wartet (Abfrage alle 10 s, dann
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
          const liste = () => t.empfaenger ??= [{ adresse: t.adresse || "eltern@example.org", bestaetigt: true }];
          if (name === "tagesbrief_empfaenger" && t.ladefehler) throw new Error("nicht erreichbar");
          if (name === "tagesbrief_empfaenger") return { uhrzeit: t.uhrzeit, name: "", empfaenger: liste() };
          if (name === "tagesbrief_empfaenger_hinzufuegen") {
            if (t.fehler) return { fehler: t.fehler };
            if (liste().length >= 4) return { fehler: "voll" };
            if (liste().some((e) => e.adresse === a.adresse)) return { fehler: "vorhanden" };
            liste().push({ adresse: a.adresse, bestaetigt: false });
            return { ok: true };
          }
          if (name === "tagesbrief_empfaenger_entfernen") {
            t.empfaenger = liste().filter((e) => e.adresse !== a.adresse);
            if (!t.empfaenger.some((e) => e.bestaetigt)) { t.zustand = "aus"; return { familieGeloescht: true }; }
            return { ok: true };
          }
          if (name === "tagesbrief_probebrief" && t.probeFehler) throw t.probeFehler;
          if (name === "tagesbrief_status") return { zustand: t.zustand, adresse: t.adresse, uhrzeit: t.uhrzeit };
          if (name === "tagesbrief_einrichten") { t.zustand = "wartet"; t.adresse = a.adresse; t.uhrzeit = a.uhrzeit; return "anfrage-1"; }
          if (name === "tagesbrief_einstellen") { t.uhrzeit = a.uhrzeit; return null; }
          if (name === "tagesbrief_abmelden") { t.zustand = t.zustand === "wartet" ? "aus" : "abbestellt"; return null; }
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

    // Tippfehler: „Andere Adresse“ setzt zurück und zeigt das Formular wieder
    pruefe(await seite.evaluate(() => !!document.querySelector('#inhalt ls-knopf[wort="Andere Adresse"]')), `${L} wartet: Knopf „Andere Adresse“`);
    await klick(seite, "Andere Adresse");
    await seite.waitForSelector('#inhalt input[name="adresse"]');
    pruefe((await aufrufe(seite, "tagesbrief_abmelden")).length === 1 && (await text(seite)).includes("Einrichten") && !(await text(seite)).includes("Wir haben eine E-Mail"), `${L} „Andere Adresse“: Abmelden, Formular wieder da`);
    await seite.fill('input[name="adresse"]', "eltern@example.org");
    await seite.fill('input[name="name"]', "Lena");
    await klick(seite, "Einrichten");
    await seite.waitForFunction(() => document.getElementById("inhalt").innerText.includes("Bitte den Link darin bestätigen."));

    await seite.evaluate(() => { window.__tb.zustand = "aktiv"; }); // Link bestätigt
    await seite.waitForFunction(() => document.getElementById("inhalt").innerText.includes("✓ Eingerichtet"), null, { timeout: 15000 });
    pruefe(true, `${L} wartet: nach der Bestätigung zeigt die Abfrage von selbst „✓ Eingerichtet“`);

    // --- aktiv --------------------------------------------------------------------------------------------------
    await seite.waitForSelector("iframe.tb-vorschau");
    const vor = await seite.evaluate(() => {
      const f = document.querySelector("iframe.tb-vorschau");
      const w = [...document.querySelectorAll("#inhalt ls-knopf")].map((k) => k.getAttribute("wort"));
      return { srcdoc: f.srcdoc.includes("<html") || f.srcdoc.includes("<body"), lena: f.srcdoc.includes("Lena"), neu: f.srcdoc.includes("Zweierreihe") || f.srcdoc.includes("zweierreihe") || /Neu gekonnt/.test(f.srcdoc), knoepfe: w };
    });
    pruefe(vor.srcdoc && vor.lena && vor.neu, `${L} aktiv: Vorschau (iframe srcdoc) mit Name und gekonntem Thema`, JSON.stringify(vor));
    pruefe(["Probebrief senden", "Uhrzeit ändern", "Abbestellen"].every((w) => vor.knoepfe.includes(w)), `${L} aktiv: Knöpfe Probebrief senden, Uhrzeit ändern, Abbestellen`, JSON.stringify(vor.knoepfe));
    pruefe(!(await text(seite)).includes("Neu einrichten"), `${L} aktiv: kein „Neu einrichten“`);
    if (SHOTS) await seite.screenshot({ path: join(SHOTS, `tagesbrief-aktiv-${typ.name()}.png`) });

    await klick(seite, "Probebrief senden");
    await seite.waitForFunction(() => document.getElementById("inhalt").innerText.includes("Der Probebrief ist unterwegs."));
    pruefe((await aufrufe(seite, "tagesbrief_probebrief")).length === 1, `${L} Probebrief ruft den Befehl`);
    // Leerer Topf (heute nicht gespielt): der Dienst antwortet 409, die App sagt, was hilft
    await seite.evaluate(() => { window.__tb.probeFehler = "Probebrief nicht möglich (Status 409)"; });
    await klick(seite, "Probebrief senden");
    await seite.waitForFunction(() => document.getElementById("inhalt").innerText.includes("Heute wurde noch nicht gespielt."));
    pruefe(true, `${L} Probebrief bei leerem Topf: Hinweis „Heute wurde noch nicht gespielt“`);
    await seite.evaluate(() => { window.__tb.probeFehler = "Probebrief nicht möglich (Status 500)"; });
    await klick(seite, "Probebrief senden");
    await seite.waitForFunction(() => document.getElementById("inhalt").innerText.includes("Bitte später noch einmal versuchen."));
    pruefe(true, `${L} Probebrief bei anderem Fehler: „später noch einmal“`);
    await seite.evaluate(() => { delete window.__tb.probeFehler; });

    await klick(seite, "Uhrzeit ändern");
    await seite.fill('#inhalt .tb-felder input[name="uhrzeit"]', "19:30");
    await klick(seite, "Speichern");
    await seite.waitForFunction(() => document.getElementById("inhalt").innerText.includes("19:30"));
    const einst = await aufrufe(seite, "tagesbrief_einstellen");
    pruefe(einst.length === 1 && einst[0].args.uhrzeit === "19:30" && einst[0].args.name === "Lena" && einst[0].args.profil === "kind-1", `${L} Uhrzeit ändern ruft einstellen (Name bleibt)`, JSON.stringify(einst));

    // Abbestellen fragt auf der Seite nach (kein JS-Dialog): „Doch nicht“ bricht ab, „Ja, abbestellen“ meldet ab.
    let dialoge = 0;
    seite.on("dialog", (d) => { dialoge++; d.dismiss(); });
    await klick(seite, "Abbestellen");
    const frage = await text(seite);
    pruefe(frage.includes("Wirklich abbestellen? Danach kommen keine Briefe mehr an diese Adresse.") && (await aufrufe(seite, "tagesbrief_abmelden")).length === 1 // nur „Andere Adresse“ von vorhin
      && await seite.evaluate(() => ["Ja, abbestellen", "Doch nicht"].every((w) => !!document.querySelector(`#inhalt ls-knopf[wort="${w}"]`))), `${L} Abbestellen fragt nach, noch kein Befehl`);
    await klick(seite, "Doch nicht");
    pruefe(!(await text(seite)).includes("Wirklich abbestellen?") && (await aufrufe(seite, "tagesbrief_abmelden")).length === 1 && (await text(seite)).includes("✓ Eingerichtet"), `${L} „Doch nicht“: Frage weg, kein Befehl, weiter eingerichtet`);
    await klick(seite, "Abbestellen");
    await klick(seite, "Ja, abbestellen");
    await seite.waitForFunction(() => document.getElementById("inhalt").innerText.includes("Abbestellt"));
    pruefe(dialoge === 0, `${L} kein JS-Dialog`);
    pruefe((await aufrufe(seite, "tagesbrief_abmelden")).length === 2 && await seite.evaluate(() => !!document.querySelector('#inhalt ls-knopf[wort="Neu einrichten"]')), `${L} abbestellt: „Abbestellt“ und „Neu einrichten“`);
    if (SHOTS) await seite.screenshot({ path: join(SHOTS, `tagesbrief-abbestellt-${typ.name()}.png`) });

    await klick(seite, "Neu einrichten");
    await seite.fill('input[name="adresse"]', "neu@example.org");
    await klick(seite, "Einrichten");
    await seite.waitForFunction(() => document.getElementById("inhalt").innerText.includes("neu@example.org"));
    pruefe((await aufrufe(seite, "tagesbrief_einrichten")).length === 3, `${L} Neu einrichten ruft den Befehl erneut`);
    pruefe(fehlerListe.length === 0, `${L} keine Seiten- oder Konsolenfehler`, fehlerListe.join(" | "));
    await kontext.close();
  }

  // --- aktiv: mehrere Empfänger ----------------------------------------------------------------------------------
  {
    const { kontext, seite, fehlerListe } = await neueSeite(browser, { zustand: "aktiv", adresse: "mama@example.org", empfaenger: [{ adresse: "mama@example.org", bestaetigt: true }, { adresse: "papa@example.org", bestaetigt: true }, { adresse: "oma@example.org", bestaetigt: false }] }, STAND_MIT_NEUEM);
    let dialoge = 0;
    seite.on("dialog", (d) => { dialoge++; d.dismiss(); });
    await oeffneTagesbrief(seite);
    await seite.waitForSelector("#inhalt .tb-adresse");
    const zeilen = await seite.evaluate(() => [...document.querySelectorAll("#inhalt .tb-adresse")].map((li) => li.innerText.replace(/\s+/g, " ").trim()));
    pruefe(zeilen.length === 3 && zeilen[0].includes("mama@example.org") && zeilen[0].includes("✓ bestätigt") && zeilen[2].includes("oma@example.org") && zeilen[2].includes("wartet auf Bestätigung"), `${L} Liste: 2 bestätigt, 1 wartet`, JSON.stringify(zeilen));
    pruefe(await seite.evaluate(() => document.querySelectorAll('#inhalt .tb-adresse ls-knopf[wort="Entfernen"]').length === 3 && !!document.querySelector('#inhalt ls-knopf[wort="Adresse hinzufügen"]')), `${L} Liste: je Adresse „Entfernen“, Knopf „Adresse hinzufügen“`);
    if (SHOTS) { await mkdir(SHOTS, { recursive: true }); await seite.screenshot({ path: join(SHOTS, `tagesbrief-empfaenger-${typ.name()}.png`) }); }

    // Hinzufügen: ungültig, dann vierte Adresse, dann ist der Knopf weg
    await klick(seite, "Adresse hinzufügen");
    await klick(seite, "Senden");
    pruefe((await text(seite)).includes("gültige E-Mail-Adresse") && (await aufrufe(seite, "tagesbrief_empfaenger_hinzufuegen")).length === 0, `${L} Hinzufügen ohne Adresse: Hinweis, kein Befehl`);
    await seite.fill('input[name="neue-adresse"]', "tante@example.org");
    await klick(seite, "Senden");
    await seite.waitForFunction(() => document.querySelectorAll("#inhalt .tb-adresse").length === 4);
    const hin = await aufrufe(seite, "tagesbrief_empfaenger_hinzufuegen");
    pruefe(hin.length === 1 && JSON.stringify(hin[0].args) === JSON.stringify({ profil: "kind-1", adresse: "tante@example.org" }), `${L} Hinzufügen ruft den Befehl mit Profil und Adresse`, JSON.stringify(hin));
    pruefe((await text(seite)).includes("Wir haben eine E-Mail an tante@example.org geschickt.") && (await text(seite)).includes("Höchstens vier Adressen.") && await seite.evaluate(() => !document.querySelector('#inhalt ls-knopf[wort="Adresse hinzufügen"]:not([hidden])')), `${L} bei vier: Hinweis „Höchstens vier Adressen.“, kein Hinzufügen-Knopf`);

    // Entfernen einer wartenden Adresse: ohne Rückfrage; Liste lädt neu
    await seite.evaluate(() => document.querySelectorAll('#inhalt .tb-adresse ls-knopf[wort="Entfernen"]')[2].click());
    await seite.waitForFunction(() => document.querySelectorAll("#inhalt .tb-adresse").length === 3);
    pruefe((await aufrufe(seite, "tagesbrief_empfaenger_entfernen")).length === 1 && !(await text(seite)).includes("oma@example.org") && await seite.evaluate(() => !!document.querySelector('#inhalt ls-knopf[wort="Adresse hinzufügen"]:not([hidden])')), `${L} Entfernen (wartend): ohne Rückfrage, Hinzufügen wieder da`);

    // Wartende Adresse wird bestätigt: die Liste holt sich das alle 10 s
    await seite.evaluate(() => { window.__tb.empfaenger.find((e) => e.adresse === "tante@example.org").bestaetigt = true; });
    await seite.waitForFunction(() => [...document.querySelectorAll("#inhalt .tb-adresse")].every((li) => li.innerText.includes("✓ bestätigt")), null, { timeout: 15000 });
    pruefe(true, `${L} wartende Adresse: Abfrage alle 10 s zeigt „✓ bestätigt“`);

    // Entfernen bis eine bestätigte übrig ist; die letzte fragt nach
    await seite.evaluate(() => document.querySelectorAll('#inhalt .tb-adresse ls-knopf[wort="Entfernen"]')[2].click());
    await seite.evaluate(() => document.querySelectorAll('#inhalt .tb-adresse ls-knopf[wort="Entfernen"]')[1].click()).catch(() => {});
    await seite.waitForFunction(() => document.querySelectorAll("#inhalt .tb-adresse").length === 1);
    const vorher = (await aufrufe(seite, "tagesbrief_empfaenger_entfernen")).length;
    await seite.evaluate(() => document.querySelector('#inhalt .tb-adresse ls-knopf[wort="Entfernen"]').click());
    pruefe((await text(seite)).includes("letzte bestätigte Adresse") && (await aufrufe(seite, "tagesbrief_empfaenger_entfernen")).length === vorher && await seite.evaluate(() => ["Ja, entfernen", "Behalten"].every((w) => !!document.querySelector(`#inhalt ls-knopf[wort="${w}"]`))), `${L} letzte bestätigte Adresse: Rückfrage, noch kein Befehl`);
    await klick(seite, "Behalten");
    pruefe(!(await text(seite)).includes("letzte bestätigte Adresse") && (await aufrufe(seite, "tagesbrief_empfaenger_entfernen")).length === vorher, `${L} „Behalten“: Rückfrage weg, kein Befehl`);
    await seite.evaluate(() => document.querySelector('#inhalt .tb-adresse ls-knopf[wort="Entfernen"]').click());
    await klick(seite, "Ja, entfernen");
    await seite.waitForSelector('#inhalt input[name="adresse"]');
    pruefe((await aufrufe(seite, "tagesbrief_empfaenger_entfernen")).length === vorher + 1 && (await text(seite)).includes("Einrichten"), `${L} „Ja, entfernen“: Familie gelöscht, Formular „Einrichten“`);
    pruefe(dialoge === 0, `${L} Empfänger: kein JS-Dialog`);
    pruefe(fehlerListe.length === 0, `${L} keine Fehler (Empfänger)`, fehlerListe.join(" | "));
    await kontext.close();
  }

  // --- Ladefehler der Adressliste ------------------------------------------------------------------------------------
  {
    const { kontext, seite } = await neueSeite(browser, { zustand: "aktiv", adresse: "mama@example.org", ladefehler: true }, null);
    await oeffneTagesbrief(seite);
    await seite.waitForFunction(() => document.getElementById("inhalt").innerText.includes("Die Adressen konnten nicht geladen werden."));
    pruefe(await seite.evaluate(() => !document.querySelector("#inhalt .tb-adresse") && !document.getElementById("inhalt").innerText.includes("mama@example.org") && !document.getElementById("inhalt").innerText.includes("✓ bestätigt") && !!document.querySelector('#inhalt ls-knopf[wort="Erneut laden"]')), `${L} Ladefehler: Hinweis und „Erneut laden“, keine Ersatzliste`);
    const n1 = (await aufrufe(seite, "tagesbrief_empfaenger")).length;
    await klick(seite, "Erneut laden");
    pruefe((await aufrufe(seite, "tagesbrief_empfaenger")).length === n1 + 1 && (await text(seite)).includes("nicht geladen"), `${L} „Erneut laden“ fragt neu, Hinweis bleibt solange es scheitert`);
    await seite.waitForFunction((n) => window.__tb.aufrufe.filter((a) => a.name === "tagesbrief_empfaenger").length > n, n1 + 1, { timeout: 15000 });
    pruefe(true, `${L} Ladefehler: Abfrage alle 10 s läuft weiter`);
    await seite.evaluate(() => { window.__tb.ladefehler = false; });
    await klick(seite, "Erneut laden");
    await seite.waitForSelector("#inhalt .tb-adresse");
    pruefe(await seite.evaluate(() => !document.getElementById("inhalt").innerText.includes("nicht geladen") && document.querySelectorAll("#inhalt .tb-adresse").length === 1 && !!document.querySelector('#inhalt ls-knopf[wort="Adresse hinzufügen"]:not([hidden])')), `${L} nach Erfolg: echte Liste, Hinweis weg, Hinzufügen wieder da`);
    await kontext.close();
  }

  // --- Fehler beim Hinzufügen und Namensprüfung --------------------------------------------------------------------
  {
    const { kontext, seite } = await neueSeite(browser, { zustand: "aktiv", adresse: "mama@example.org", fehler: "vorhanden" }, null);
    await oeffneTagesbrief(seite);
    await seite.waitForSelector("#inhalt .tb-adresse");
    await klick(seite, "Adresse hinzufügen");
    await seite.fill('input[name="neue-adresse"]', "mama@example.org");
    await klick(seite, "Senden");
    await seite.waitForFunction(() => document.getElementById("inhalt").innerText.includes("Diese Adresse ist schon dabei."));
    pruefe(true, `${L} Fehler „vorhanden“: Hinweis`);
    await seite.evaluate(() => { window.__tb.fehler = "zu-viele"; });
    await klick(seite, "Senden");
    await seite.waitForFunction(() => document.getElementById("inhalt").innerText.includes("zu oft"));
    pruefe(true, `${L} Fehler „zu-viele“: Hinweis`);

    await klick(seite, "Uhrzeit ändern");
    await seite.fill('#inhalt .tb-felder input[name="name"]', "Lena 7<script>");
    await klick(seite, "Speichern");
    pruefe((await text(seite)).includes("Bitte nur Buchstaben, Leerzeichen und Bindestrich.") && (await aufrufe(seite, "tagesbrief_einstellen")).length === 0, `${L} Name mit Ziffern oder Zeichen: Hinweis, kein Befehl`);
    await seite.fill('#inhalt .tb-felder input[name="name"]', "Anna-Lena Müller ß");
    await klick(seite, "Speichern");
    await seite.waitForFunction(() => window.__tb.aufrufe.some((a) => a.name === "tagesbrief_einstellen"));
    pruefe((await aufrufe(seite, "tagesbrief_einstellen"))[0].args.name === "Anna-Lena Müller ß", `${L} Name mit Umlaut, ß, Bindestrich geht durch`);
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
