// Prüfstand B-Spielbarkeit (docs/spielentwicklung.md §4): simulierte Kinder spielen je eine Runde eines Spiels.
// Kein Teil von `npm test`: braucht Playwright und installierte Browser (Chromium, WebKit).
//
//   NODE_PATH=/private/tmp/claude-501/pw/node_modules node tests/browser/durchspielen.mjs spiele/<fach>/<katalog-nr>-<name>/index.html \
//     [--kinder sicher,ratend,hilfe,wild,tastatur,zurueck] [--browser chromium,webkit] [--groessen 1920x1080,1280x800]
//     [--bilder <ordner>] [--bericht <datei.json>] [--saat <zahl>]
//
// Das Spiel braucht die Test-Schnittstelle (spiele/rahmen/pruefen.js); der Prüfstand schaltet den Testbetrieb mit
// window.__LS_PRUEFEN__ ein und kennt sonst nichts vom Spiel: alle Züge kommen aus window.lsPruefen.
//
// Die Kinder und was gelten muss:
//   sicher    löst jede Aufgabe beim ersten Versuch          Runde endet in der Pause, keine Hilfe, Meldung ok
//   ratend    probiert zufällig, bis es passt (die ersten     jede Aufgabe lösbar, nach dem 2. Versuch leuchtet
//             zwei Versuche je Aufgabe absichtlich daneben)    Hilfe (nach dem 1. nicht), nichts hängt; erklärt das
//                                                              Spiel fehlversuche: false, ist die Hilfe-Prüfung n/a
//                                                              und es darf kein Fehlversuch vorkommen
//   hilfe     tippt Hilfe zweimal, folgt der Lösung           Lösung (Sonnenring .markiert) ausführbar, Meldung hilfe 2
//   wild      200 zufällige Tipps im sicheren Feld            keine Fehler, kein Einfrieren, danach ist die Runde
//             (Links, die die Seite verlassen, ausgelassen;      noch zu Ende spielbar
//             alle 15 Tipps ein richtiger Zug, damit die
//             Tipps auch Folge und Pause treffen)
//   tastatur  nur Tab, Enter, Leertaste                       Runde lösbar, Weiter in der Pause erreichbar
//   zurueck   verlässt mitten in der Runde über Haus,         Lernstand konsistent, Spiel startet sauber
//             kommt zurück (neu geladen)
// Für alle: keine Seiten- oder Konsolenfehler, nichts im Protokoll außer erwarteten Zeilen, Vorschau schreibt nichts
// (Ton-Einstellung ausgenommen),
// jeder richtige Zug trifft unverdeckt (in seiner Mitte liegt wirklich das Teil).
//
// WebKit: Der Playwright-Build leitet echte Mausklicks an <html> um (tests/browser/vorlage.spec.mjs). Dort tippt der
// Prüfstand mit lsPruefen.fuehreAus (ausgelöste Zeiger- und Klickereignisse am Punkt); echtes Ziehen nur in
// Chromium („übersprungen in WebKit“ im Bericht). Die Tastatur ist in beiden echt.
//
// Ausgabe: je Lauf (Kind × Browser × Größe) grün/rot je Prüfung mit Grund; Bericht als JSON; Exit ≠ 0 bei Rot.

import { createRequire } from "node:module";
import http from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, extname, join, normalize, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium, webkit } = require("playwright");

const WURZEL = resolve(fileURLToPath(import.meta.url), "../../..");
const ALLE_KINDER = ["sicher", "ratend", "hilfe", "wild", "tastatur", "zurueck"];
const PHASEN = ["laden", "einfuehrung", "aufgabe", "folge", "pause", "fehler"];
/** Züge je Aufgabe, bevor sie als nicht lösbar gilt. */
const MAX_ZUEGE = 60;
/** So lange darf eine Phase ohne Züge (Laden, Folge) dauern; die Einführung länger. */
const MAX_WARTEN_MS = 10000;
const MAX_EINFUEHRUNG_MS = 120000;
const WILD_TIPPS = 200;
/** Protokollzeilen, die keinen Fehler bedeuten: fehlende Aufnahmen (Prototyp ohne Audio) und der Vorschau-Vermerk. */
const ERWARTET_IM_PROTOKOLL = [/Keine Audiodatei/, /nicht in spiele\.json – Vorschau, schreibt nicht/];
/**
 * „not-allowed“ der Web-Sprache: WebKit verweigert das Vorlesen ohne Nutzergeste (frisch geladene Seite, noch kein
 * Tipp). Nur in WebKit und nur zwischen Laden und erster Eingabe geduldet, und jede geduldete Zeile steht als Hinweis
 * im Bericht. Chromium startet mit --autoplay-policy=no-user-gesture-required: dort ist die Zeile immer rot. Danach
 * (nach einer Eingabe) ist sie überall rot: dann bliebe ein Satz stumm.
 */
const OHNE_GESTE = /Vorlesen fehlgeschlagen: not-allowed/;
// Ein vorhandener Lernstand, der in der Vorschau unberührt bleiben muss.
const STAND = {
  "lernstand-kind-1-lernplan": JSON.stringify({ version: 1, themen: { "zerlegen-6": { z: "kann-ich", stufe: "kopf", k: "2026-11-01" } }, aufgaben: {}, verlauf: [], migriert: 1 }),
  "lernstand-kind-1-einstellungen": JSON.stringify({}),
};
const UEBERSPRUNGEN = "übersprungen in WebKit (Playwright-Build leitet echte Mausklicks um): Ziehen und Tippen als ausgelöste Ereignisse";

// --- Aufruf ----------------------------------------------------------------------------------------

function leseAufruf(argv) {
  const a = { seite: null, kinder: ALLE_KINDER, browser: ["chromium", "webkit"], groessen: ["1920x1080", "1280x800"], bilder: null, bericht: null, saat: Date.now() % 100000 };
  for (let i = 0; i < argv.length; i++) {
    const x = argv[i];
    const wert = () => argv[++i];
    if (x === "--kinder") a.kinder = wert().split(",").map((s) => s.trim()).filter(Boolean);
    else if (x === "--browser") a.browser = wert().split(",").map((s) => s.trim()).filter(Boolean);
    else if (x === "--groessen") a.groessen = wert().split(",").map((s) => s.trim()).filter(Boolean);
    else if (x === "--bilder") a.bilder = resolve(wert());
    else if (x === "--bericht") a.bericht = resolve(wert());
    else if (x === "--saat") a.saat = Number(wert());
    else if (!x.startsWith("--") && !a.seite) a.seite = x;
    else throw new Error(`unbekannter Schalter ${x}`);
  }
  if (!a.seite) throw new Error("Aufruf: node tests/browser/durchspielen.mjs <seite.html> [--kinder …] [--bilder <dir>] [--bericht <datei>]");
  const datei = resolve(a.seite);
  if (!existsSync(datei)) throw new Error(`Seite nicht gefunden: ${a.seite}`);
  a.pfad = relative(WURZEL, datei).split("\\").join("/");
  if (a.pfad.startsWith("..")) throw new Error("Die Seite muss im Repo liegen");
  for (const k of a.kinder) if (!ALLE_KINDER.includes(k)) throw new Error(`unbekanntes Kind ${k} (${ALLE_KINDER.join(", ")})`);
  a.groessen = a.groessen.map((g) => {
    const [width, height] = g.split("x").map(Number);
    return { width, height };
  });
  return a;
}

// --- Server ----------------------------------------------------------------------------------------

const TYPEN = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json", ".css": "text/css", ".svg": "image/svg+xml", ".mp3": "audio/mpeg",
  ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp",
};

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

// --- Zufall (mit Saat, damit ein roter Lauf sich wiederholen lässt) --------------------------------

function zufall(saat) {
  let s = saat >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

const warte = (ms) => new Promise((ok) => setTimeout(ok, ms));

/** Wartet höchstens ms; sonst Hänger (eine eingefrorene Seite antwortet nie). */
function mitFrist(versprechen, ms, text) {
  let uhr;
  const frist = new Promise((_, nein) => { uhr = setTimeout(() => nein(new Haenger(text)), ms); });
  return Promise.race([versprechen, frist]).finally(() => clearTimeout(uhr));
}

// --- Ein Lauf: ein Kind in einem Browser bei einer Größe --------------------------------------------

class Lauf {
  constructor(kind, browser, groesse) {
    this.kind = kind;
    this.browser = browser;
    this.groesse = `${groesse.width}x${groesse.height}`;
    this.pruefungen = [];
    this.hinweise = [];
    this.bilder = [];
  }
  pruefe(name, ok, grund = "") {
    this.pruefungen.push({ name, ok: !!ok, grund: ok ? "" : String(grund || "") });
  }
  /** Prüfung, die für dieses Spiel nicht gilt: zählt nicht als rot, steht aber mit Grund im Bericht. */
  nichtAnwendbar(name, grund) {
    this.pruefungen.push({ name, ok: true, na: true, grund });
    this.hinweis(`n/a: ${name} – ${grund}`);
  }
  hinweis(text) {
    if (!this.hinweise.includes(text)) this.hinweise.push(text);
  }
  get gruen() {
    return this.pruefungen.every((p) => p.ok);
  }
}

/** Fehlschlag mitten im Spielen: beendet den Lauf mit einem Grund. */
class Haenger extends Error {}

class Spieler {
  constructor({ seite, lauf, webkit, url, bilder, rnd }) {
    this.seite = seite;
    this.lauf = lauf;
    this.webkit = webkit;
    this.url = url;
    this.bilderOrdner = bilder;
    this.rnd = rnd;
    this.fehler = [];
    /** Je Laden der Seite: von (Laden) bis (erste Eingabe), als ISO-Zeit wie im Protokoll. */
    this.ohneGeste = [];
    seite.on("pageerror", (e) => this.fehler.push(`Seitenfehler (${this.ortName()}): ${e.message}`));
    seite.on("console", (m) => { if (m.type() === "error") this.fehler.push(`Konsole (${this.ortName()}): ${m.text()}`); });
  }

  /** evaluate mit Frist: friert die Seite ein, endet der Lauf rot statt zu hängen. */
  ev(fn, arg) {
    return mitFrist(this.seite.evaluate(fn, arg), 5000, `eingefroren: die Seite antwortet 5 s nicht (${this.ortName()})`);
  }

  ortName() {
    try { return new URL(this.seite.url()).pathname.split("/").pop(); } catch { return "?"; }
  }

  // --- Laden ----------------------------------------------------------------------------------------

  /** Vor jeder Eingabe des Kindes: schließt das Fenster ohne Nutzergeste. */
  eingabe() {
    const f = this.ohneGeste.at(-1);
    if (f && !f.bis) f.bis = new Date().toISOString();
  }

  /** Steht die Protokollzeile (ISO-Zeit vorn) zwischen einem Laden und der ersten Eingabe danach? */
  vorErsterEingabe(zeile) {
    const zeit = zeile.slice(0, 24);
    return this.ohneGeste.some((f) => zeit >= f.von && (!f.bis || zeit <= f.bis));
  }

  async lade() {
    this.ohneGeste.push({ von: new Date().toISOString(), bis: null });
    await this.seite.goto(this.url, { waitUntil: "load" });
    const da = await this.seite.waitForFunction(() => !!window.lsPruefen, null, { timeout: 8000 }).then(() => true, () => false);
    if (!da) throw new Haenger("keine Test-Schnittstelle: window.lsPruefen fehlt im Testbetrieb (spiele/rahmen/pruefen.js)");
    await this.ev(() => document.fonts?.ready);
    await this.beobachteHilfe();
    await this.warteAufZug();
  }

  /** Zählt, wie oft der Hilfe-Knopf aufleuchtet (Klasse leuchtet an .platz in ls-hilfe). */
  async beobachteHilfe() {
    await this.ev(() => {
      window.__lsLeuchten = 0;
      const platz = document.querySelector("ls-hilfe")?.shadowRoot?.querySelector(".platz");
      if (!platz) return;
      let an = platz.classList.contains("leuchtet");
      new MutationObserver(() => {
        const jetzt = platz.classList.contains("leuchtet");
        if (jetzt && !an) window.__lsLeuchten++;
        an = jetzt;
      }).observe(platz, { attributes: true, attributeFilter: ["class"] });
    });
  }

  leuchten() {
    return this.ev(() => window.__lsLeuchten ?? 0);
  }

  zustand() {
    return this.ev(() => window.lsPruefen.zustand());
  }

  zuege() {
    return this.ev(() => window.lsPruefen.zuege());
  }

  richtigerZug() {
    return this.ev(() => window.lsPruefen.richtigerZug());
  }

  ergebnisse() {
    return this.ev(() => window.lsPruefen.ergebnisse.slice());
  }

  /** Wartet, bis das Spiel einen Zug erwartet (Aufgabe oder Pause) oder im Fehler steht. */
  async warteAufZug() {
    const t0 = Date.now();
    let z = await this.zustand();
    while (!["aufgabe", "pause", "fehler"].includes(z.phase)) {
      if (!PHASEN.includes(z.phase)) throw new Haenger(`unbekannte Phase ${z.phase}`);
      const grenze = z.phase === "einfuehrung" ? MAX_EINFUEHRUNG_MS : MAX_WARTEN_MS;
      if (Date.now() - t0 > grenze) throw new Haenger(`hängt: ${Math.round(grenze / 1000)} s in Phase „${z.phase}“ ohne Zug`);
      await warte(150);
      z = await this.zustand();
    }
    if (z.phase === "fehler") throw new Haenger("Phase „fehler“: das Spiel meldet, dass es nicht geht");
    return z;
  }

  // --- Züge ausführen -------------------------------------------------------------------------------

  ort(sel) {
    return this.ev((s) => window.lsPruefen.ort(s), sel);
  }

  /** Prüft, dass ein Finger das Element trifft; liefert seinen Ort. */
  async erreichbar(sel) {
    const o = await this.ort(sel);
    if (!o) throw new Haenger(`Zug zeigt auf ${sel}, das gibt es nicht`);
    if (!o.imBild) throw new Haenger(`${sel} liegt nicht im Bild`);
    if (!o.frei) throw new Haenger(`${sel} ist verdeckt (oben liegt ${o.oben})`);
    return o;
  }

  /** Tippt auf ein Element wie ein Finger. */
  async tippe(sel) {
    this.eingabe();
    const o = await this.erreichbar(sel);
    if (this.webkit) await this.ev((s) => window.lsPruefen.fuehreAus({ art: "tippen", von: s }), sel);
    else await this.seite.mouse.click(o.x, o.y);
  }

  /**
   * Führt einen Zug aus. weise: "tippen" (Teil, dann Ziel), "ziehen" (echtes Ziehen) oder "tastatur".
   */
  fuehre(zug, weise = "tippen") {
    return mitFrist(this.fuehreOhneFrist(zug, weise), 20000, `eingefroren: Zug ${JSON.stringify(zug)} endet nicht in 20 s`);
  }

  async fuehreOhneFrist(zug, weise) {
    this.eingabe();
    if (zug.art !== "tippen" && zug.art !== "ziehen") {
      await this.ev((z) => window.lsPruefen.fuehreAus(z), zug);
    } else if (weise === "tastatur") {
      await this.perTastatur(zug.von, "Enter");
      if (zug.art === "ziehen") await this.perTastatur(zug.nach, " ");
    } else if (zug.art === "tippen") {
      await this.tippe(zug.von);
    } else if (weise === "ziehen" && !this.webkit) {
      const q = await this.erreichbar(zug.von);
      const z = await this.ort(zug.nach);
      if (!z || !z.imBild) throw new Haenger(`Ziel ${zug.nach} nicht im Bild`);
      await this.seite.mouse.move(q.x, q.y);
      await this.seite.mouse.down();
      await this.seite.mouse.move(z.x, z.y, { steps: 14 });
      await this.seite.mouse.up();
    } else {
      if (weise === "ziehen") this.lauf.hinweis(UEBERSPRUNGEN);
      await this.tippe(zug.von);
      await warte(80);
      await this.tippe(zug.nach);
    }
    await warte(450); // Gleiten 0,3 s
  }

  /** Mit Tab bis zum Element, dann die Taste. */
  async perTastatur(sel, taste) {
    this.eingabe();
    for (let i = 0; i < 80; i++) {
      if (await this.ev((s) => window.lsPruefen.fokussiert(s), sel)) {
        await this.seite.keyboard.press(taste === " " ? "Space" : taste);
        return;
      }
      await this.seite.keyboard.press("Tab");
    }
    throw new Haenger(`${sel} ist mit Tab nicht erreichbar (80-mal Tab)`);
  }

  /** Züge, deren Teil den Sonnenring trägt (Hilfe Stufe 2: .markiert am Teil oder um es herum). */
  markierteZuege() {
    return this.ev(() => window.lsPruefen.zuege().filter((z) => {
      const el = window.lsPruefen.finde(z.von);
      return !!el && (!!el.closest(".markiert") || !!el.querySelector(".markiert"));
    }));
  }

  // --- Runde --------------------------------------------------------------------------------------

  /**
   * Spielt bis zur Pause. strategie.zug(z) führt einen Zug aus; strategie.neueAufgabe(z) zu Beginn jeder Aufgabe.
   * @returns {Promise<{ aufgaben: { nr: number, aufgabe: string, zuege: number }[] }>}
   */
  async spieleBisPause(strategie) {
    const aufgaben = [];
    const t0 = Date.now();
    let z = await this.warteAufZug();
    while (z.phase !== "pause") {
      if (Date.now() - t0 > 240000) throw new Haenger("Runde dauert über 4 Minuten");
      let a = aufgaben.at(-1);
      if (!a || a.nr !== z.nr) {
        a = { nr: z.nr, aufgabe: z.aufgabe, zuege: 0 };
        aufgaben.push(a);
        await strategie.neueAufgabe?.(z, a);
      }
      if (++a.zuege > MAX_ZUEGE) throw new Haenger(`Aufgabe ${z.aufgabe} nach ${MAX_ZUEGE} Zügen nicht gelöst`);
      await strategie.zug(z, a);
      z = await this.warteAufZug();
    }
    return { aufgaben };
  }

  // --- Ablage und Bilder ----------------------------------------------------------------------------

  /**
   * Der Speicher ohne Protokoll; in den Einstellungen ohne die Schlüssel ton.*: den Ton schaltet das Kind selbst mit
   * dem Ton-Knopf, das darf auch in der Vorschau bleiben. Alles andere (Lernstand, übrige Einstellungen) nicht.
   */
  speicher() {
    return this.ev(() => Object.fromEntries(Object.keys(localStorage).filter((k) => k !== "protokoll").sort().map((k) => {
      const v = localStorage.getItem(k);
      if (!k.endsWith("-einstellungen")) return [k, v];
      try {
        const e = JSON.parse(v);
        return [k, JSON.stringify(Object.fromEntries(Object.entries(e).filter(([n]) => !n.startsWith("ton."))))];
      } catch {
        return [k, v];
      }
    })));
  }

  protokoll() {
    return this.ev(() => { try { return JSON.parse(localStorage.getItem("protokoll") ?? "[]"); } catch { return ["Protokoll unlesbar"]; } });
  }

  async bild(schritt) {
    if (!this.bilderOrdner) return;
    await mkdir(this.bilderOrdner, { recursive: true });
    const name = `${this.lauf.kind}-${schritt}-${this.lauf.browser}-${this.lauf.groesse}.png`;
    await this.seite.screenshot({ path: join(this.bilderOrdner, name), timeout: 5000 }).catch(() => {});
    this.lauf.bilder.push(name);
  }
}

// --- Die Kinder --------------------------------------------------------------------------------------

/** Sicher: immer der richtige Zug, abwechselnd getippt und gezogen. */
function sicherStrategie(sp, { streng = true, merke } = {}) {
  let n = 0;
  return {
    async zug(z) {
      const zug = await sp.richtigerZug();
      if (!zug) throw new Haenger(`Aufgabe ${z.aufgabe}: kein richtigerZug()`);
      await sp.fuehre(zug, n++ % 2 ? "ziehen" : "tippen");
      await merke?.(n);
      const nach = await sp.zustand();
      if (streng && nach.phase === "aufgabe" && nach.nr === z.nr && nach.versuche > z.versuche) {
        throw new Haenger(`Aufgabe ${z.aufgabe}: richtigerZug ${JSON.stringify(zug)} wurde als Fehlversuch gezählt`);
      }
    },
  };
}

async function kindSicher(sp, lauf) {
  await sp.bild("start");
  const vorher = await sp.leuchten();
  const runde = await sp.spieleBisPause({
    ...sicherStrategie(sp, { merke: async (n) => { if (n === 1) await sp.bild("erster-zug"); } }),
    async neueAufgabe() {},
  });
  const hilfeGesehen = (await sp.leuchten()) > vorher;
  await warte(300);
  await sp.bild("pause");
  const e = await sp.ergebnisse();
  const z = await sp.zustand();
  lauf.pruefe("Runde endet in der Pause", z.phase === "pause", z.phase);
  lauf.pruefe("keine Hilfe nötig (Hilfe leuchtet nie, Stufe 0)", !hilfeGesehen && e.every((x) => x.hilfe === 0), `leuchtete: ${hilfeGesehen}, ${JSON.stringify(e)}`);
  lauf.pruefe("Lernsteuerung bekommt jede Aufgabe mit ok gemeldet", e.length === runde.aufgaben.length && e.length > 0 && e.every((x) => x.ok === true && typeof x.ms === "number" && x.key),
    `${e.length} Meldungen für ${runde.aufgaben.length} Aufgaben: ${JSON.stringify(e)}`);
}

async function kindRatend(sp, lauf) {
  const fehlversucheMoeglich = await sp.ev(() => window.lsPruefen.fehlversuche !== false);
  const verlauf = [];
  let leuchtFehler = null;
  const runde = await sp.spieleBisPause({
    async neueAufgabe(z, a) {
      a.versucht = new Set();
      a.fehl = 0;
    },
    async zug(z, a) {
      const alle = await sp.zuege();
      if (!alle.length) throw new Haenger(`Aufgabe ${z.aufgabe}: keine Züge, aber noch nicht gelöst`);
      const richtig = JSON.stringify(await sp.richtigerZug());
      const schluessel = (x) => JSON.stringify(x);
      // Die ersten zwei Versuche je Aufgabe absichtlich daneben (sonst nur zufällig), damit die Hilfe-Leiter
      // sicher geprüft wird; danach zufällig, ohne denselben Zug im selben Stand zu wiederholen.
      let auswahl = alle.filter((x) => !a.versucht.has(schluessel(x)));
      if (!auswahl.length) throw new Haenger(`Aufgabe ${z.aufgabe}: alle ${alle.length} Züge probiert, keiner bringt sie voran`);
      if (z.versuche < 2) {
        const daneben = auswahl.filter((x) => schluessel(x) !== richtig);
        if (daneben.length) auswahl = daneben;
      }
      const zug = auswahl[Math.floor(sp.rnd() * auswahl.length)];
      const leuchtenVorher = await sp.leuchten();
      await sp.fuehre(zug, sp.rnd() < 0.5 ? "tippen" : "ziehen");
      const nach = await sp.zustand();
      const leuchtete = (await sp.leuchten()) > leuchtenVorher;
      const gleich = nach.phase === "aufgabe" && nach.nr === z.nr;
      if (gleich && nach.versuche > z.versuche) {
        a.versucht.add(schluessel(zug));
        a.fehl = nach.versuche;
        verlauf.push({ aufgabe: z.aufgabe, versuch: nach.versuche, stufe: nach.hilfeStufe, leuchtete });
        if (nach.hilfeStufe === 0) {
          if (nach.versuche === 2 && !leuchtete && !leuchtFehler) leuchtFehler = `${z.aufgabe}: nach dem 2. Versuch leuchtet die Hilfe nicht`;
          if (nach.versuche === 1 && leuchtete && !leuchtFehler) leuchtFehler = `${z.aufgabe}: Hilfe leuchtet schon nach dem 1. Versuch`;
          if (nach.versuche > 2 && leuchtete && !leuchtFehler) leuchtFehler = `${z.aufgabe}: Hilfe leuchtet nach dem ${nach.versuche}. Versuch noch einmal`;
        }
      } else {
        a.versucht = new Set(); // Fortschritt: neuer Stand, alle Züge wieder offen
      }
    },
  });
  const e = await sp.ergebnisse();
  const zweite = verlauf.filter((v) => v.versuch === 2).length;
  lauf.pruefe("jede Aufgabe ist lösbar (Runde endet in der Pause)", (await sp.zustand()).phase === "pause");
  const name = "nach dem 2. Versuch leuchtet die Hilfe einmal, nach dem 1. nicht";
  if (fehlversucheMoeglich) lauf.pruefe(name, !leuchtFehler && zweite > 0, leuchtFehler ?? "kein zweiter Fehlversuch vorgekommen");
  else {
    lauf.nichtAnwendbar(name, "das Spiel erklärt fehlversuche: false (B-Didaktik prüft die Angabe)");
    lauf.pruefe("keine Fehlversuche, wie erklärt (fehlversuche: false)", verlauf.length === 0, `${verlauf.length} Fehlversuche gezählt: ${JSON.stringify(verlauf)}`);
  }
  lauf.pruefe("Meldung: ok nur ohne Fehlversuch", e.length === runde.aufgaben.length && e.every((x, i) => x.ok === (runde.aufgaben[i].fehl === 0)),
    `${JSON.stringify(e)} bei Fehlversuchen ${runde.aufgaben.map((a) => a.fehl)}`);
}

async function kindHilfe(sp, lauf) {
  const orte = await sp.ev(() => window.lsPruefen.orte);
  if (!orte?.hilfe) throw new Haenger("lsPruefen.orte.hilfe fehlt");
  let erste = true;
  let stufenFehler = null;
  await sp.spieleBisPause({
    async neueAufgabe(z) {
      await sp.tippe(orte.hilfe);
      await warte(300);
      const s1 = (await sp.zustand()).hilfeStufe;
      if (erste) await sp.bild("hilfe-1");
      await warte(900);
      await sp.tippe(orte.hilfe);
      await warte(300);
      const s2 = (await sp.zustand()).hilfeStufe;
      if (erste) await sp.bild("hilfe-2");
      erste = false;
      if ((s1 !== 1 || s2 !== 2) && !stufenFehler) stufenFehler = `${z.aufgabe}: Hilfe-Stufen ${s1}, ${s2} statt 1, 2`;
    },
    async zug(z) {
      const markiert = await sp.markierteZuege();
      if (!markiert.length) throw new Haenger(`${z.aufgabe}: nach Hilfe Stufe 2 trägt kein Teil eines Zugs den Sonnenring (.markiert)`);
      await sp.fuehre(markiert[0], sp.rnd() < 0.5 ? "tippen" : "ziehen");
      const nach = await sp.zustand();
      if (nach.phase === "aufgabe" && nach.nr === z.nr && nach.versuche > z.versuche) {
        throw new Haenger(`${z.aufgabe}: die gezeigte Lösung ${JSON.stringify(markiert[0])} passt nicht (Fehlversuch)`);
      }
    },
  });
  const e = await sp.ergebnisse();
  lauf.pruefe("Hilfe Stufe 1, dann 2", !stufenFehler, stufenFehler);
  lauf.pruefe("Lösung ist ausführbar (Runde endet in der Pause)", (await sp.zustand()).phase === "pause");
  lauf.pruefe("Meldung hilfe: 2, zählt nicht als gekonnt", e.length > 0 && e.every((x) => x.hilfe === 2), JSON.stringify(e));
}

async function kindWild(sp, lauf) {
  const feld = await sp.ev(() => {
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 10;
    const b = Math.min(innerWidth, 192 * rem);
    const h = Math.min(innerHeight, 108 * rem);
    return { x: (innerWidth - b) / 2, y: (innerHeight - h) / 2, b, h };
  });
  let ausgelassen = 0;
  let getippt = 0;
  let eingefroren = null;
  for (let versuch = 0; getippt < WILD_TIPPS && versuch < WILD_TIPPS * 5; versuch++) {
    const x = feld.x + sp.rnd() * feld.b;
    const y = feld.y + sp.rnd() * feld.h;
    // Links, die die Seite verlassen (Haus, Alle Spiele), lässt das wilde Kind aus: dafür gibt es das Kind „zurueck“.
    const verlaesst = await sp.ev(([px, py]) => {
      let el = document.elementFromPoint(px, py);
      while (el?.shadowRoot) { const i = el.shadowRoot.elementFromPoint(px, py); if (!i || i === el) break; el = i; }
      for (let k = el; k; k = k.parentNode ?? k.host ?? null) if (k.localName === "a" && k.hasAttribute?.("href")) return true;
      return false;
    }, [x, y]);
    if (verlaesst) { ausgelassen++; continue; }
    sp.eingabe();
    try {
      if (sp.webkit) await sp.ev(([px, py]) => window.lsPruefen.tippeBei(px, py), [x, y]);
      else await mitFrist(sp.seite.mouse.click(x, y), 5000, "eingefroren");
    } catch (e) {
      if (!(e instanceof Haenger)) throw e;
      eingefroren = `nach ${getippt} Tipps antwortet die Seite nicht`;
      break;
    }
    getippt++;
    await warte(20 + sp.rnd() * 100);
    // Zwischendurch bringt ein richtiger Zug das Spiel weiter, damit die Tipps auch Folge und Pause treffen.
    if (getippt % 15 === 0 && (await sp.zustand()).phase === "aufgabe") {
      const zug = await sp.richtigerZug();
      if (zug) await sp.fuehre(zug, "tippen");
    }
    if (getippt % 50 === 0) {
      const lebt = await sp.ev(() => true).catch(() => false);
      if (!lebt) { eingefroren = `nach ${getippt} Tipps antwortet die Seite 5 s nicht`; break; }
    }
  }
  if (sp.webkit) lauf.hinweis("WebKit: Tipps als ausgelöste Ereignisse am Punkt");
  if (!eingefroren) {
    await warte(2500);
    await sp.bild("nach-wild");
  }
  const lebt = eingefroren ? false : await sp.ev(() => true).catch(() => false);
  lauf.pruefe(`kein Einfrieren (${getippt} Tipps, ${ausgelassen} Links ausgelassen)`, !eingefroren && lebt, eingefroren ?? "Seite antwortet nicht");
  if (!lebt) throw new Haenger(eingefroren ?? "Seite antwortet nicht");
  const z = await sp.zustand();
  lauf.pruefe("Zustand danach bekannt", PHASEN.includes(z.phase), JSON.stringify(z));
  // Ausweg: von hier aus muss die Runde zu Ende spielbar sein (ein angehobenes Teil darf einen Zug kosten).
  await sp.spieleBisPause(sicherStrategie(sp, { streng: false }));
  lauf.pruefe("kein Zustand ohne Ausweg: Runde danach bis zur Pause spielbar", (await sp.zustand()).phase === "pause");
}

async function kindTastatur(sp, lauf) {
  await sp.spieleBisPause({
    async zug(z) {
      const zug = await sp.richtigerZug();
      if (!zug) throw new Haenger(`Aufgabe ${z.aufgabe}: kein richtigerZug()`);
      await sp.fuehre(zug, "tastatur");
    },
  });
  lauf.pruefe("Runde nur mit Tab, Enter, Leertaste lösbar", (await sp.zustand()).phase === "pause");
  const weiter = await sp.richtigerZug();
  if (weiter) await sp.fuehre(weiter, "tastatur");
  await warte(500);
  const z = await sp.zustand();
  lauf.pruefe("Weiter in der Pause per Tastatur", z.phase !== "pause", JSON.stringify(z));
}

async function kindZurueck(sp, lauf, vorher) {
  const orte = await sp.ev(() => window.lsPruefen.orte);
  if (!orte?.haus) throw new Haenger("lsPruefen.orte.haus fehlt");
  const zug = await sp.richtigerZug();
  if (!zug) throw new Haenger("kein richtigerZug() in der ersten Aufgabe");
  await sp.fuehre(zug, "tippen");
  await sp.tippe(orte.haus);
  const weg = await sp.seite.waitForURL(/index\.html/, { timeout: 5000 }).then(() => true, () => false);
  lauf.pruefe("Haus führt mitten in der Runde zur Startseite", weg, sp.seite.url());
  await sp.seite.waitForLoadState("load");
  await warte(1000);
  await sp.lade();
  const z = await sp.zustand();
  const zuege = z.phase === "aufgabe" ? await sp.zuege() : [];
  lauf.pruefe("Spiel startet sauber: erste Aufgabe mit Zügen", z.phase === "aufgabe" && z.nr === 1 && z.versuche === 0 && z.hilfeStufe === 0 && zuege.length > 0, JSON.stringify({ z, zuege: zuege.length }));
  const stand = await sp.speicher();
  const kaputt = Object.entries(stand).filter(([k, v]) => k.startsWith("lernstand") && (() => { try { JSON.parse(v); return false; } catch { return true; } })());
  lauf.pruefe("Lernstand konsistent (lesbar, in der Vorschau unverändert)", kaputt.length === 0 && (!z.vorschau || JSON.stringify(stand) === JSON.stringify(vorher)),
    kaputt.length ? `unlesbar: ${kaputt.map(([k]) => k)}` : `${JSON.stringify(vorher)} → ${JSON.stringify(stand)}`);
  await sp.spieleBisPause(sicherStrategie(sp));
  lauf.pruefe("Runde nach der Rückkehr bis zur Pause spielbar", (await sp.zustand()).phase === "pause");
}

const KINDER = { sicher: kindSicher, ratend: kindRatend, hilfe: kindHilfe, wild: kindWild, tastatur: kindTastatur, zurueck: kindZurueck };

// --- Ablauf -------------------------------------------------------------------------------------------

async function spieleLauf(browser, name, groesse, kind, aufruf, basis, rnd) {
  const lauf = new Lauf(kind, name, groesse);
  const kontext = await browser.newContext({ viewport: groesse, deviceScaleFactor: 1 });
  try {
    await kontext.addInitScript((stand) => {
      window.__LS_PRUEFEN__ = true;
      if (sessionStorage.getItem("ls-pruefstand")) return; // nur beim ersten Laden des Tabs
      sessionStorage.setItem("ls-pruefstand", "1");
      for (const [k, v] of Object.entries(stand)) localStorage.setItem(k, v);
    }, STAND);
    const seite = await kontext.newPage();
    const sp = new Spieler({ seite, lauf, webkit: name === "webkit", url: `${basis}/${aufruf.pfad}`, bilder: aufruf.bilder, rnd });
    let vorher = null;
    let vorschau = true;
    try {
      await sp.lade();
      lauf.pruefe("Test-Schnittstelle da, Spiel erwartet einen Zug", true);
      vorher = await sp.speicher();
      vorschau = (await sp.zustand()).vorschau;
      await KINDER[kind](sp, lauf, vorher);
      lauf.pruefe("durchgespielt ohne Hänger (nichts hängt, kein Zustand ohne Zug)", true);
    } catch (e) {
      if (!(e instanceof Haenger)) throw e;
      lauf.pruefe("durchgespielt ohne Hänger (nichts hängt, kein Zustand ohne Zug)", false, e.message);
      await sp.bild("haenger");
    }
    if (vorher && vorschau) {
      const nachher = await sp.speicher().catch(() => null);
      lauf.pruefe("Vorschau schreibt nichts (Speicher außer Protokoll und ton.* unverändert)", JSON.stringify(nachher) === JSON.stringify(vorher), `${JSON.stringify(vorher)} → ${JSON.stringify(nachher)}`);
    }
    const protokoll = await sp.protokoll().catch(() => []);
    const geduldet = (z) => OHNE_GESTE.test(z) && sp.webkit && sp.vorErsterEingabe(z);
    for (const z of protokoll.filter(geduldet)) lauf.hinweis(`geduldet (WebKit, vor der ersten Eingabe): ${z}`);
    const fremd = protokoll.filter((z) => !ERWARTET_IM_PROTOKOLL.some((m) => m.test(z)) && !geduldet(z));
    lauf.pruefe("Protokoll ohne Fehler", fremd.length === 0, fremd.join(" | "));
    lauf.pruefe("keine Seiten- oder Konsolenfehler", sp.fehler.length === 0, sp.fehler.join(" | "));
  } catch (e) {
    lauf.pruefe("Prüfstand lief durch", false, e.stack ?? String(e));
  } finally {
    await mitFrist(kontext.close(), 10000, "Kontext schließt nicht").catch(() => {});
  }
  return lauf;
}

async function laufeBrowser(name, aufruf, basis, rnd) {
  const typ = { chromium, webkit }[name];
  if (!typ) throw new Error(`unbekannter Browser ${name}`);
  // Chromium darf ohne Nutzergeste vorlesen (wie die App); so bleibt ein stummer erster Satz dort rot.
  const browser = await typ.launch(name === "chromium" ? { args: ["--autoplay-policy=no-user-gesture-required"] } : {});
  const laeufe = [];
  try {
    for (const groesse of aufruf.groessen) {
      for (const kind of aufruf.kinder) {
        const lauf = await spieleLauf(browser, name, groesse, kind, aufruf, basis, rnd);
        const rot = lauf.pruefungen.filter((p) => !p.ok);
        console.log(`${lauf.gruen ? "grün" : "ROT "}  ${kind.padEnd(8)} ${name.padEnd(8)} ${lauf.groesse.padEnd(9)} ${lauf.pruefungen.length - rot.length}/${lauf.pruefungen.length}`);
        for (const p of rot) console.log(`        ✗ ${p.name}: ${p.grund}`);
        laeufe.push(lauf);
      }
    }
  } finally {
    await browser.close();
  }
  return laeufe;
}

const aufruf = leseAufruf(process.argv.slice(2));
const server = await starteServer();
const basis = `http://127.0.0.1:${server.address().port}`;
console.log(`Prüfstand: ${aufruf.pfad} · Kinder ${aufruf.kinder.join(", ")} · ${aufruf.browser.join(", ")} · Saat ${aufruf.saat}`);
let laeufe = [];
let fehler = null;
try {
  // Die Browser laufen nebeneinander; jeder mit eigenem Zufall aus derselben Saat.
  const je = await Promise.all(aufruf.browser.map((b, i) => laufeBrowser(b, aufruf, basis, zufall(aufruf.saat + i))));
  laeufe = je.flat();
} catch (e) {
  fehler = e.stack ?? String(e);
  console.log(`FEHLER Prüfstand: ${fehler}`);
} finally {
  server.close();
}

const pruefungen = laeufe.flatMap((l) => l.pruefungen);
const rot = pruefungen.filter((p) => !p.ok).length;
const gruen = !fehler && rot === 0 && laeufe.length > 0;
const bericht = {
  seite: aufruf.pfad,
  zeit: new Date().toISOString(),
  saat: aufruf.saat,
  gruen,
  zusammenfassung: { laeufe: laeufe.length, laeufeRot: laeufe.filter((l) => !l.gruen).length, pruefungen: pruefungen.length, rot },
  fehler,
  laeufe: laeufe.map((l) => ({ kind: l.kind, browser: l.browser, groesse: l.groesse, gruen: l.gruen, pruefungen: l.pruefungen, hinweise: l.hinweise, bilder: l.bilder })),
};
if (aufruf.bericht) {
  await mkdir(dirname(aufruf.bericht), { recursive: true });
  await writeFile(aufruf.bericht, JSON.stringify(bericht, null, 2) + "\n");
}
console.log(`\n${gruen ? "GRÜN" : "ROT"}: ${laeufe.length - bericht.zusammenfassung.laeufeRot} von ${laeufe.length} Läufen grün, ${pruefungen.length - rot} von ${pruefungen.length} Prüfungen${aufruf.bericht ? ` · Bericht ${aufruf.bericht}` : ""}`);
process.exit(gruen ? 0 : 1);
