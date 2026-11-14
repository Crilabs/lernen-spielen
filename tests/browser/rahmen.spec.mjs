// Browser-Prüfung der Rahmen-Bausteine (spiele/rahmen/) an spiele/rahmen/vorschau.html.
// Kein Teil von `npm test`: braucht Playwright und installierte Browser (Chromium, WebKit).
//
// Aufruf (Playwright liegt außerhalb des Repos, z. B. in /private/tmp/claude-501/pw):
//   NODE_PATH=/private/tmp/claude-501/pw/node_modules node tests/browser/rahmen.spec.mjs
// Einrichtung dort: npm i playwright && npx playwright install chromium webkit
// Optional: SHOTS=/pfad/zum/ordner legt je Lauf ein Bild vorschau-<browser>-<breite>x<hoehe>.png ab.
// Das Skript startet einen eigenen statischen Server auf einem freien Port und beendet sich mit Code 1,
// sobald eine Prüfung fehlschlägt.
//
// Geprüft wird in Chromium und WebKit bei 1920 × 1080 und 1280 × 800: keine Seiten- oder Konsolenfehler,
// feste Plätze, Größen nach docs/bedienung.md 4, Ton bleibt aus nach dem Neuladen, Pause, doppelter Import,
// Tastatur, Ziehen (Tippen und Ziehen), wenig Bewegung, Kopfleisten-Höhe, Perlenstäbchen, Kopfleiste `ohne-haus`
// und Slot `rechts`.

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
const URL_VORSCHAU = (basis) => `${basis}/spiele/rahmen/vorschau.html`;

let fehler = 0;
let geprueft = 0;
/** @param {string} lauf @param {string} name @param {boolean} ok @param {string} [detail] */
function pruefe(lauf, name, ok, detail = "") {
  geprueft++;
  if (!ok) fehler++;
  console.log(`${ok ? "ok    " : "FEHLER"} [${lauf}] ${name}${ok ? "" : detail ? ` – ${detail}` : ""}`);
}

/** Öffnet die Seite, sammelt Fehler und wartet, bis die Leiste bereit ist. */
async function oeffne(kontext, basis, fehlerListe) {
  const seite = await kontext.newPage();
  seite.on("pageerror", (e) => fehlerListe.push(`Seitenfehler: ${e.message}`));
  seite.on("console", (m) => { if (m.type() === "error") fehlerListe.push(`Konsole: ${m.text()}`); });
  await seite.goto(URL_VORSCHAU(basis), { waitUntil: "load" });
  await seite.evaluate(() => document.getElementById("leiste").bereit());
  await seite.evaluate(() => document.fonts.ready);
  return seite;
}

// WebKit: Der aktuelle Playwright-Build (WebKit 27.2) leitet echte Mausklicks an <html> um. Tippen geht dort mit
// ausgelösten Ereignissen (pointerdown, pointerup, click); echte Zeigerbewegungen (Ziehen, Einsinken, Bewegungsschwelle) prüft nur Chromium.
let WEBKIT = false;
const UEBERSPRUNGEN = "übersprungen in WebKit (Playwright-Build)";
/** Tippen auf ein Element: in WebKit ausgelöste Zeiger- und Klickereignisse (Mitte bzw. position), sonst ein echter Klick. */
const tipp = (ort, optionen) => (WEBKIT ? ort.evaluate((el, pos) => {
  const r = el.getBoundingClientRect();
  const o = { bubbles: true, composed: true, cancelable: true, pointerId: 9, isPrimary: true, pointerType: "touch", button: 0,
    clientX: r.left + (pos ? pos.x : r.width / 2), clientY: r.top + (pos ? pos.y : r.height / 2) };
  el.dispatchEvent(new PointerEvent("pointerdown", { ...o, buttons: 1 }));
  el.dispatchEvent(new PointerEvent("pointerup", o));
  el.click();
}, optionen?.position) : ort.click(optionen));

async function lauf(typ, name, groesse, basis) {
  WEBKIT = name === "webkit";
  const L = `${name} ${groesse.width}x${groesse.height}`;
  const browser = await typ.launch();
  const fehlerListe = [];
  try {
    const kontext = await browser.newContext({ viewport: groesse, deviceScaleFactor: 1 });
    const seite = await oeffne(kontext, basis, fehlerListe);
    const h = groesse.height;
    const rem = h / 108;
    const tol = 0.75; // px

    // --- Plätze und Größen -------------------------------------------------------------------
    const m = await seite.evaluate(() => {
      const r = (el) => { const b = el.getBoundingClientRect(); return { x: b.left, y: b.top, b: b.right, u: b.bottom, w: b.width, h: b.height }; };
      const leiste = document.getElementById("leiste");
      const hilfe = document.getElementById("hilfe");
      const blase = document.getElementById("blase");
      const tasten = [...document.querySelector("ls-tastatur").shadowRoot.querySelectorAll(".taste")].map(r);
      const form = (knopf) => r(knopf.shadowRoot.querySelector(".form"));
      return {
        innerHeight, innerWidth,
        haus: r(leiste.shadowRoot.querySelector("a.haus .form")),
        ton: form(leiste.tonKnopf),
        fach: r(leiste.shadowRoot.querySelector(".fach")),
        band: r(leiste.shadowRoot.querySelector(".band")),
        hilfe: form(hilfe.knopf),
        hilfeTipp: r(hilfe.knopf.shadowRoot.querySelector(".knopf")),
        hauptknopf: form(document.getElementById("pausenknopf")),
        klein: form(blase.shadowRoot.querySelector("ls-knopf")),
        kleinTipp: r(blase.shadowRoot.querySelector("ls-knopf").shadowRoot.querySelector(".knopf")),
        tasten,
        hoehe: document.documentElement.style.getPropertyValue("--ls-leiste-hoehe"),
        fontPx: parseFloat(getComputedStyle(document.documentElement).fontSize),
      };
    });
    pruefe(L, "1rem = Bildhöhe/108", Math.abs(m.fontPx - h / 108) < 0.01, `${m.fontPx}`);
    const feld = { x: Math.max(0, (m.innerWidth - 192 * rem) / 2), w: Math.min(m.innerWidth, 192 * rem) };
    feld.b = feld.x + feld.w;
    const rand = 2.4 * rem - tol;
    pruefe(L, "Haus oben links im sicheren Feld, Rand ≥ 2,4 rem",
      m.haus.x - feld.x >= rand && m.haus.y >= rand && m.haus.x < feld.x + feld.w / 4 && m.haus.u < m.band.u,
      JSON.stringify(m.haus));
    pruefe(L, "Ton oben rechts im sicheren Feld, Rand ≥ 2,4 rem",
      feld.b - m.ton.b >= rand && m.ton.y >= rand && m.ton.x > feld.x + feld.w * 0.75 && m.ton.u < m.band.u,
      JSON.stringify(m.ton));
    pruefe(L, "Hilfe unten rechts im sicheren Feld, Rand ≥ 2,4 rem",
      feld.b - m.hilfe.b >= rand && h - m.hilfe.u >= rand && m.hilfe.x > feld.x + feld.w * 0.75 && m.hilfe.y > h * 0.6,
      JSON.stringify(m.hilfe));
    const nah = (a, soll) => Math.abs(a - soll * rem) <= tol;
    pruefe(L, "Haus 11 rem rund", nah(m.haus.w, 11) && nah(m.haus.h, 11), `${m.haus.w}x${m.haus.h}`);
    pruefe(L, "Ton 11 rem rund", nah(m.ton.w, 11) && nah(m.ton.h, 11), `${m.ton.w}x${m.ton.h}`);
    pruefe(L, "Hilfe 11 rem rund", nah(m.hilfe.w, 11) && nah(m.hilfe.h, 11), `${m.hilfe.w}x${m.hilfe.h}`);
    pruefe(L, "Hauptknopf Pille 11 rem hoch, mindestens 24 rem breit", nah(m.hauptknopf.h, 11) && m.hauptknopf.w >= 24 * rem - tol, `${m.hauptknopf.w}x${m.hauptknopf.h}`);
    pruefe(L, "Noch mal hören 8 rem, Tippfläche ≥ 11 rem", nah(m.klein.w, 8) && nah(m.klein.h, 8) && m.kleinTipp.w >= 11 * rem - tol && m.kleinTipp.h >= 11 * rem - tol, `${m.klein.w}, Tippfläche ${m.kleinTipp.w}x${m.kleinTipp.h}`);
    pruefe(L, "Tippfläche Hilfe ≥ 11 rem", m.hilfeTipp.w >= 11 * rem - tol && m.hilfeTipp.h >= 11 * rem - tol);
    pruefe(L, "Fachkachel 9 rem", nah(m.fach.w, 9) && nah(m.fach.h, 9), `${m.fach.w}x${m.fach.h}`);
    pruefe(L, "Kopfleiste 15,8 rem hoch", nah(m.band.h, 15.8), `${m.band.h}`);
    pruefe(L, "Tasten mindestens 9 × 8,6 rem", m.tasten.length > 0 && m.tasten.every((t) => t.w >= 9 * rem - tol && t.h >= 8.6 * rem - tol), `${m.tasten.length} Tasten`);
    pruefe(L, "--ls-leiste-hoehe am <html> gesetzt", /15\.8rem/.test(m.hoehe), m.hoehe);
    const hoeheAufgeloest = await seite.evaluate(() => {
      const t = document.createElement("div");
      t.style.cssText = "position:absolute;visibility:hidden;height:var(--ls-leiste-hoehe)";
      document.body.append(t);
      const hpx = t.getBoundingClientRect().height;
      t.remove();
      return hpx;
    });
    pruefe(L, "--ls-leiste-hoehe entspricht der Höhe des Bands", Math.abs(hoeheAufgeloest - m.band.h) <= tol, `${hoeheAufgeloest} vs ${m.band.h}`);

    // --- Perlenstäbe ---------------------------------------------------------------------------
    const p = await seite.evaluate(() => {
      const bau = (wert) => {
        const el = document.createElement("ls-perlenstab");
        el.setAttribute("wert", String(wert));
        el.style.cssText = "position:fixed;left:2rem;top:2rem;height:10rem;opacity:0;pointer-events:none";
        document.body.append(el);
        const svg = el.shadowRoot.querySelector("svg");
        const perlen = [...el.shadowRoot.querySelectorAll(".perle")].map((c) => { const b = c.getBoundingClientRect(); return b.left + b.width / 2; });
        const r = { breite: svg.getBoundingClientRect().width, perlen, marken: el.shadowRoot.querySelectorAll(".marke").length };
        el.remove();
        return r;
      };
      return { w5: bau(5), w7: bau(7), w10: bau(10) };
    });
    const schritt = (a, i) => a[i + 1] - a[i];
    const luecke7 = schritt(p.w7.perlen, 4) - schritt(p.w7.perlen, 3);
    pruefe(L, "Perlenstab 7: Lücke und Marke nach der fünften Perle", p.w7.perlen.length === 7 && luecke7 > 0.02 * rem && p.w7.marken === 1 && p.w5.marken === 0, `Lücke ${luecke7.toFixed(2)} px, Marken ${p.w7.marken}/${p.w5.marken}`);
    const luecke10 = schritt(p.w10.perlen, 4) - schritt(p.w10.perlen, 3);
    const erwartet = 2 * p.w5.breite + luecke10;
    pruefe(L, "Länge(10) = 2 × Länge(5) + Lücke (Boundingbox, 2 %)", Math.abs(p.w10.breite - erwartet) / p.w10.breite < 0.02, `${p.w10.breite.toFixed(1)} vs ${erwartet.toFixed(1)}`);

    // --- ohne-haus und Slot rechts (Startseite: kein Haus, Zahnrad rechts neben Ton) -------------
    // Ohne Maus, damit es auch in WebKit läuft, wo Mausklicks in diesem Playwright-Build an <html> landen.
    const kopf = await seite.evaluate(async () => {
      const leiste = document.getElementById("leiste");
      const r = (el) => el.getBoundingClientRect();
      const bild = () => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok)));
      const rechts = document.createElement("span");
      rechts.slot = "rechts";
      rechts.style.cssText = "display:inline-block;width:10rem;height:10rem";
      leiste.setAttribute("ohne-haus", "");
      leiste.append(rechts);
      await bild();
      const haus = leiste.shadowRoot.querySelector("a.haus");
      const ton = r(leiste.tonKnopf), slot = r(rechts), band = r(leiste.shadowRoot.querySelector(".band"));
      const ohne = { hausWeg: haus.hidden && r(haus).width === 0, tonRechts: ton.right, slotLinks: slot.left, slotRechts: slot.right,
        bandRechts: band.right, mitteSlot: slot.top + slot.height / 2, mitteTon: ton.top + ton.height / 2,
        zugewiesen: leiste.shadowRoot.querySelector('slot[name="rechts"]').assignedElements().includes(rechts) };
      leiste.removeAttribute("ohne-haus");
      rechts.remove();
      await bild();
      return { ...ohne, hausWieder: !haus.hidden && r(haus).width > 0 };
    });
    pruefe(L, "ohne-haus: Haus verborgen, ohne das Attribut wieder da", kopf.hausWeg && kopf.hausWieder, JSON.stringify(kopf));
    pruefe(L, "Slot rechts: zugewiesen, rechts neben Ton, im Band, auf der Mitte des Tons",
      kopf.zugewiesen && kopf.slotLinks >= kopf.tonRechts - 1 && kopf.slotRechts <= kopf.bandRechts + 1 && Math.abs(kopf.mitteSlot - kopf.mitteTon) <= 2,
      JSON.stringify(kopf));

    // --- Tastatur ------------------------------------------------------------------------------
    await seite.evaluate(() => (window.ereignisse.length = 0));
    await tipp(seite.locator('ls-tastatur button[data-z="D"]'));
    await tipp(seite.locator('ls-tastatur button[data-z=" "]'));
    await seite.keyboard.press("a");
    await seite.keyboard.press("Shift+K");
    await seite.keyboard.press("Backspace");
    await seite.keyboard.press("q"); // nicht in tasten: kein Ereignis
    const ev = await seite.evaluate(() => window.ereignisse.filter((e) => e.startsWith("taste")));
    pruefe(L, "Tastatur meldet taste für Klick und Hardware-Taste (k ≠ K, q nicht)",
      JSON.stringify(ev) === JSON.stringify(['taste "D"', 'taste " "', 'taste "a"', 'taste "K"', 'taste "loeschen"']), JSON.stringify(ev));

    // --- Ziehen: Tippen und Ziehen -------------------------------------------------------------
    await seite.evaluate(() => (window.abgelegt.length = 0));
    await tipp(seite.locator('#tablett .teil[data-wert="1"]'));
    const angehoben = await seite.locator('#tablett .teil[data-wert="1"]').evaluate((el) => el.classList.contains("angehoben"));
    await tipp(seite.locator('.luecke[data-passt="1"]'));
    await pause(450);
    const nachTippen = await seite.evaluate(() => JSON.stringify(window.abgelegt));
    pruefe(L, "ziehbar: Tippen, dann Ziel ruft beimAblegen (Teil hob sich an)", angehoben && nachTippen === '[["1","1"]]', `${angehoben} ${nachTippen}`);
    if (WEBKIT) {
      console.log(`${UEBERSPRUNGEN}: [${L}] ziehbar: Ziehen ruft beimAblegen (echte Maus)`);
    } else {
      const quelle = await seite.locator('#tablett .teil[data-wert="2"]').boundingBox();
      const ziel = await seite.locator('.luecke[data-passt="2"]').boundingBox();
      await seite.mouse.move(quelle.x + quelle.width / 2, quelle.y + quelle.height / 2);
      await seite.mouse.down();
      await seite.mouse.move(ziel.x + ziel.width / 2, ziel.y + ziel.height / 2, { steps: 12 });
      await seite.mouse.up();
      await pause(450);
      const nachZiehen = await seite.evaluate(() => JSON.stringify(window.abgelegt));
      pruefe(L, "ziehbar: Ziehen ruft beimAblegen", nachZiehen === '[["1","1"],["2","2"]]', nachZiehen);
    }
    const gesetzt = await seite.evaluate(() => [...document.querySelectorAll(".luecke .teil")].map((t) => t.dataset.wert).sort().join(","));
    pruefe(L, "passende Teile liegen in den Lücken", gesetzt === (WEBKIT ? "1" : "1,2"), gesetzt);

    // loesen gibt alles zurück, was ziehbar gesetzt hat; was das Element selbst hatte, bleibt.
    const geloest = await seite.evaluate(async () => {
      const { ziehbar } = await import("/spiele/rahmen/ziehen.js");
      const bild = (el) => JSON.stringify([el.getAttributeNames().filter((a) => a !== "style").sort().map((a) => [a, el.getAttribute(a)]), el.style.cssText]);
      const nackt = document.createElement("div");
      const eigen = document.createElement("div");
      eigen.setAttribute("role", "listitem");
      eigen.setAttribute("tabindex", "-1");
      eigen.setAttribute("aria-pressed", "mixed");
      eigen.style.touchAction = "pan-x";
      document.body.append(nackt, eigen);
      const vorher = [bild(nackt), bild(eigen)];
      const l1 = ziehbar(nackt, { ziele: [] });
      const l2 = ziehbar(eigen, { ziele: [] });
      const gesetzt = nackt.getAttribute("role") === "button" && nackt.getAttribute("tabindex") === "0" && nackt.style.touchAction === "none";
      l1();
      l2();
      const nachher = [bild(nackt), bild(eigen)];
      nackt.remove();
      eigen.remove();
      return { gesetzt, vorher, nachher };
    });
    pruefe(L, "loesen gibt tabindex, role, aria-pressed, touch-action, user-select zurück (eigene Werte bleiben)",
      geloest.gesetzt && JSON.stringify(geloest.vorher) === JSON.stringify(geloest.nachher), JSON.stringify(geloest));

    // Ein markiertes Teil (Sonnenring) sinkt beim Drücken ein wie jedes Teil: kürzerer Schatten.
    const sinkt = await seite.evaluate(() => {
      const t = document.createElement("div");
      t.className = "teil markiert";
      t.style.transition = "none"; // sonst meldet getComputedStyle den Anfang des Übergangs
      document.body.append(t);
      const schatten = () => getComputedStyle(t).boxShadow;
      const oben = schatten();
      t.classList.add("gedrueckt");
      const unten = schatten();
      const transform = getComputedStyle(t).transform;
      t.remove();
      return { oben, unten, transform };
    });
    pruefe(L, "markiertes Teil sinkt beim Drücken ein (Schatten kürzer, 0,3 rem tiefer)",
      sinkt.oben !== sinkt.unten && sinkt.transform !== "none", JSON.stringify(sinkt));

    // --- Pause ---------------------------------------------------------------------------------
    await seite.evaluate(() => {
      window.zaehler = 0;
      const p = document.getElementById("pause");
      const a = p.zeige();
      window.gleich = p.zeige() === a;
      a.then(() => window.zaehler++);
    });
    const pm = await seite.evaluate(() => {
      const p = document.getElementById("pause");
      const r = (el) => { const b = el.getBoundingClientRect(); return { x: b.left, w: b.width, h: b.height, u: b.bottom }; };
      return { alle: r(p.shadowRoot.querySelector("a.alle .form")), weiter: r(p.shadowRoot.querySelector("ls-knopf.weiter").shadowRoot.querySelector(".form")), offen: p.hasAttribute("offen") };
    });
    pruefe(L, "Pausenknöpfe gleich groß, 14 rem hoch, 50 rem breit",
      pm.offen && Math.abs(pm.alle.w - pm.weiter.w) <= tol && Math.abs(pm.alle.h - pm.weiter.h) <= tol && nah(pm.alle.h, 14) && nah(pm.alle.w, 50), JSON.stringify(pm));
    pruefe(L, "Pausenknöpfe nebeneinander mit Abstand ≥ 2 rem", pm.weiter.x - (pm.alle.x + pm.alle.w) >= 2 * rem - tol && Math.abs(pm.alle.u - pm.weiter.u) <= tol);
    await tipp(seite.locator("ls-pause ls-knopf.weiter"));
    await pause(150);
    const pz = await seite.evaluate(() => ({ n: window.zaehler, gleich: window.gleich, offen: document.getElementById("pause").hasAttribute("offen") }));
    pruefe(L, "zeige() löst genau einmal auf (zweiter Aufruf liefert dasselbe Versprechen)", pz.n === 1 && pz.gleich && !pz.offen, JSON.stringify(pz));

    // --- Doppelter Import ----------------------------------------------------------------------
    const doppelt = await seite.evaluate(async () => {
      const mods = ["stil", "knopf", "leiste", "blase", "hilfe", "pause", "tastatur", "perlenstab", "wortart"];
      try {
        for (const mod of mods) await import(`/spiele/rahmen/${mod}.js?nochmal=${Date.now()}`);
        return "ok";
      } catch (e) {
        return String(e);
      }
    });
    pruefe(L, "doppelter Import (frisch ausgeführte Module) registriert ohne Fehler", doppelt === "ok", doppelt);

    if (SHOTS) {
      await seite.reload({ waitUntil: "load" });
      await seite.evaluate(() => document.getElementById("leiste").bereit());
      await seite.evaluate(() => document.fonts.ready);
      await mkdir(SHOTS, { recursive: true });
      await seite.screenshot({ path: join(SHOTS, `vorschau-${name}-${groesse.width}x${groesse.height}.png`) });
    }
    await seite.close();

    // --- Ton aus, neu laden --------------------------------------------------------------------
    const seite2 = await oeffne(kontext, basis, fehlerListe);
    const vorher = await seite2.evaluate(() => document.getElementById("leiste").ton);
    await seite2.evaluate(() => document.getElementById("leiste").tonKnopf.shadowRoot.querySelector("button").click());
    await pause(300);
    const aus = await seite2.evaluate(() => document.getElementById("leiste").ton);
    await seite2.reload({ waitUntil: "load" });
    await seite2.evaluate(() => document.getElementById("leiste").bereit());
    const nach = await seite2.evaluate(() => ({ ton: document.getElementById("leiste").ton, name: document.getElementById("leiste").tonKnopf.getAttribute("name") }));
    pruefe(L, "Ton aus → neu laden → bleibt aus", vorher === true && aus === false && nach.ton === false && nach.name === "Ton aus", `${vorher} ${aus} ${JSON.stringify(nach)}`);
    await seite2.close();
    await kontext.close();

    // --- Wenig Bewegung ------------------------------------------------------------------------
    const ruhig = await browser.newContext({ viewport: groesse, reducedMotion: "reduce" });
    const seite3 = await oeffne(ruhig, basis, fehlerListe);
    await tipp(seite3.locator("#leuchtknopf"));
    await pause(150);
    const laufend = await seite3.evaluate(() => {
      const alle = [];
      const gehe = (wurzel) => {
        alle.push(...wurzel.getAnimations().filter((a) => a.playState === "running").map((a) => a.animationName ?? a.id ?? "?"));
        for (const el of wurzel.querySelectorAll("*")) if (el.shadowRoot) gehe(el.shadowRoot);
      };
      gehe(document);
      const platz = document.getElementById("hilfe").shadowRoot.querySelector(".platz");
      return { laufend: alle, ring: getComputedStyle(platz, "::after").opacity, klasse: platz.classList.contains("leuchtet") };
    });
    pruefe(L, "wenig Bewegung: keine laufende Animation nach leuchte(), ruhiger Ring steht", laufend.laufend.length === 0 && laufend.klasse && laufend.ring === "1", JSON.stringify(laufend));
    await pause(1100);
    const danach = await seite3.evaluate(() => document.getElementById("hilfe").shadowRoot.querySelector(".platz").classList.contains("leuchtet"));
    pruefe(L, "wenig Bewegung: Ring steht etwa 1 s, dann weg", danach === false);
    await ruhig.close();

    // --- Normale Bewegung: einmal Aufleuchten, nie in Schleife --------------------------------
    const normal = await browser.newContext({ viewport: groesse });
    const seite4 = await oeffne(normal, basis, fehlerListe);
    await tipp(seite4.locator("#leuchtknopf"));
    await pause(200);
    const anim = await seite4.evaluate(() => document.getElementById("hilfe").shadowRoot.getAnimations().map((a) => a.effect.getComputedTiming().iterations));
    await pause(1300);
    const ende = await seite4.evaluate(() => document.getElementById("hilfe").shadowRoot.getAnimations().filter((a) => a.playState === "running").length);
    pruefe(L, "Aufleuchten läuft einmal (eine Wiederholung) und endet", anim.length === 1 && anim[0] === 1 && ende === 0, `${JSON.stringify(anim)} ${ende}`);
    await normal.close();

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
