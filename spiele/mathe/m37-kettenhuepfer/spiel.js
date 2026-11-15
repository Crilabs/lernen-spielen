// M37 Kettenhüpfer (Idee: docs/spiele/mathe/m37-kettenhuepfer.md, Neubau 2026-11-15). Das Kind tippt das Ergebnis
// einer Malaufgabe a · n und bestätigt mit Fertig; dann hüpft Lena a Stäbchen weit über die Perlenkette von n, jeder
// Hüpfer ein Ton höher, und das Kärtchen mit der getippten Zahl fliegt von der Tafel als Pfeilchen an ihr Stäbchen
// und rastet ein. Passt die Zahl nicht, hüpft Lena trotzdem a Stäbchen; unter ihr hängt ein „?“, und das Pfeilchen
// der getippten Zahl fliegt hohl an den Ort, wo die Zahl wirklich liegt. Die Kette ist das Einmaleins.
//
// Aufbau wie die Spielvorlage (spiele/vorlage/spiel.js, dort die Schritte zum eigenen Spiel):
//   SPIELWELT  Kennung, Aufgabenarten, Sätze des Erzählers, Klänge
//   AUFGABE    Lena, Kette, Tafel; eine Aufgabe darstellen, prüfen (die Kette urteilt), Hilfe-Stufen
//   EINFÜHRUNG im echten Spielbild (docs/spielbau.md §8): Lena macht 2 · n vor, das Kind tippt 3 · n
//   RAHMEN     aus der Vorlage; die Lernsteuerung bestimmt die Länge der Runde (kein AUFGABEN_JE_RUNDE). Ergänzt:
//              vor einer Aufgabe auf einer neuen Kette rollt die Kette aus und der Erzähler nennt sie, bevor die
//              Zeit der Aufgabe läuft; nach einer Lösung wartet die Folge, bis die Wirkung fertig ist.
//
// Vorschau-Parameter wie in der Vorlage (?pause, ?hinweis, ?eltern, ?einfuehrung, ?thema=, ?pruefen, ?stufe=).

import "../../rahmen/leiste.js";
import "../../rahmen/blase.js";
import "../../rahmen/hilfe.js";
import "../../rahmen/pause.js";
import "../../rahmen/knopf.js";
import "../../rahmen/tastatur.js";
import "../../rahmen/perlenkette.js";
import * as Runde from "../../runde/runde.js";
import { malAus } from "../../aufgabenarten.js";
import { meldePruefSchnittstelle, selektor, testbetrieb } from "../../rahmen/pruefen.js";
import { sperreTouch, protokoll, esc } from "../../lernspiel.js";
import { sprich } from "../../kern/stimme.js";
import { runde, einmal } from "../../lernsteuerung.js";
import { starteSpielzeit, amRundenende, sage } from "../../rahmen/spielzeit.js";
import { hilfeVon, kandidaten, naechsteTaste, tastenZu, tippe, pfeileWaehrend, einfuehrungsKette, hueperZeiten, hueperTon, naechsteFreude, witz } from "./logik.js";

sperreTouch();

const $ = (/** @type {string} */ id) => /** @type {any} */ (document.getElementById(id));
const leiste = $("leiste");
const blase = $("blase");
const hilfe = $("hilfe");
const pause = $("pause");
const kette = $("kette");
const kettePlatz = $("kette-platz");
const rechnung = $("rechnung");
const karte = $("eingabe");
const tastatur = $("tastatur");
const fertigKnopf = $("fertig");
const lenaEl = $("lena");
const lenaKoerper = $("lena-koerper");
const figurenLage = /** @type {HTMLElement} */ (document.querySelector(".figuren"));

// =====================================================================================================
// SPIELWELT
// =====================================================================================================

/** Kennung des Spiels: steht einmal in der HTML-Datei an <ls-leiste spiel>. */
const SPIEL_ID = leiste.getAttribute("spiel");

/** Aufgabenarten (gilt nur, solange das Spiel nicht in spiele.json steht; dort steht dasselbe). */
const ARTEN = [{ art: "mal", reihen: [2, 10], stufen: ["material", "vorstellung", "kopf"] }];

/** Die Folge einer Lösung steht nach der Wirkung noch so lange, dann kommt die nächste Aufgabe (Tippen überspringt). */
const NACH_WIRKUNG_MS = 300;
/** Längstens so lange wartet die Folge auf das Ende der Wirkung (B6, etwa 3 s). */
const FOLGE_MAX_MS = 3200;
/** Der Satz zu einer neuen Kette steht mindestens so lange, auch ohne Ton. */
const KETTE_SATZ_MS = 1400;

/** Nur Vorschau: Aufgaben, falls die Lernsteuerung nichts liefert. */
const VORSCHAU = { thema: "Siebenerreihe", aufgaben: ["mal:6*7", "mal:3*7", "mal:8*7", "mal:4*7"] };

/** Sätze aus Daten (je Reihe, Aufgabe und getippter Zahl ausgeschrieben, texte.json). */
const TEXTE = await fetch(new URL("texte.json", import.meta.url)).then((r) => r.json()).catch(() => null);

/** Der Erzähler (docs/stimme.md): beschreibt, was zu sehen ist, nie ein Urteil (grundsaetze.md 3.2). */
const erzaehler = {
  /** Rundenanfang und Kettenwechsel. @param {number} b */
  kette: (b) => blase.sage(TEXTE?.anfang?.[b] ?? ""),
  /** „a · n = c.“ (nach Fehlversuch oder Hilfe, Probe der Kernaufgabe, Lösung). @param {number} a @param {number} b */
  gleichung: (a, b) => blase.sage(TEXTE?.gleichung?.[`${a}*${b}`] ?? ""),
  /** Ort der getippten Zahl, die nicht passt (bis 100; darüber zeigt es nur das Bild). @param {number} w */
  daneben: (w) => (TEXTE?.daneben?.[w] ? blase.sage(TEXTE.daneben[w]) : Promise.resolve("still")),
  einStaebchen: () => blase.sage("Lena hüpft nur ein Stäbchen."),
  einfuehrungVor: () => blase.sage("Lena hüpft zwei Stäbchen weit."),
  einfuehrungDu: () => blase.sage("Jetzt tippst du."),
  gehtNicht: () => blase.sage("Das Spiel geht gerade nicht."),
};

/** Elternansicht (?eltern): beschreibend, von Stärken aus, kein Vergleich (3.3). @param {HTMLElement} feld */
function fuelleEltern(feld) {
  feld.innerHTML = `<p>Lena hüpft so viele Stäbchen weit über eine Montessori-Perlenkette, wie die erste Zahl der Aufgabe
    sagt; jedes Stäbchen hat so viele Perlen wie die zweite Zahl. Ihr Kind tippt vorher, wo sie landet. Passt die Zahl
    nicht, zeigt die Kette, wo die getippte Zahl wirklich liegt.</p>
    <p>Welche Reihen dran sind und was Ihr Kind schon kann, steht bei den Themen im Elternbereich.</p>`;
}

/**
 * Pause (K1, K8): die Kette der Runde mit ihren Pfeilchen, dazu das Angebot zum Mitmachen (Idee §6).
 * @param {HTMLElement} feld @param {boolean} ton
 */
function fuelleSachmoment(feld, ton) {
  feld.replaceChildren();
  const k = document.createElement("ls-perlenkette");
  k.setAttribute("reihe", String(n ?? 2));
  const pf = [...geloest].sort((x, y) => x - y).join(" ");
  if (pf) k.setAttribute("pfeile", pf);
  k.setAttribute("breite", "90");
  k.setAttribute("perle", "3");
  const satz = document.createElement("p");
  satz.textContent = "Legt zu zweit eine Kette aus Büroklammern.";
  feld.append(k, satz);
  if (ton) sprich("Legt zu zweit eine Kette aus Büroklammern.");
}

// --- Klänge (Web Audio, leise; Ton aus gilt) ---------------------------------------------------------
/** @type {AudioContext | null} */
let audio = null;
/** @param {number} hz @param {{ dauer?: number, typ?: OscillatorType, laut?: number, gleiten?: number, spaeter?: number }} [o] */
function ton(hz, { dauer = 0.13, typ = "triangle", laut = 0.07, gleiten = 0, spaeter = 0 } = {}) {
  if (!leiste.ton) return;
  try {
    audio ??= new AudioContext();
    if (audio.state === "suspended") audio.resume().catch(() => {});
    const t = audio.currentTime + spaeter;
    const o = audio.createOscillator();
    const g = audio.createGain();
    o.type = typ;
    o.frequency.setValueAtTime(hz, t);
    if (gleiten) o.frequency.exponentialRampToValueAtTime(hz * gleiten, t + dauer);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(laut, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dauer);
    o.connect(g).connect(audio.destination);
    o.start(t);
    o.stop(t + dauer + 0.03);
  } catch {
    // ohne Web Audio: still
  }
}
const klang = {
  /** Hüpfer auf Stäbchen k: eine Stufe höher als der vorige; an 5 und 10 ein heller Doppelton. @param {number} k */
  hueper: (k) => {
    ton(hueperTon(k));
    if (k === 5 || k === 10) ton(hueperTon(k) * 1.5, { spaeter: 0.07, laut: 0.05 });
  },
  plopp: () => ton(740, { dauer: 0.1, typ: "sine", laut: 0.1, gleiten: 0.55 }),
  boing: () => ton(196, { dauer: 0.38, typ: "sine", laut: 0.06, gleiten: 1.5 }),
};

// =====================================================================================================
// AUFGABE
// =====================================================================================================

const wenigBewegung = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const warte = (/** @type {number} */ ms) => new Promise((ok) => setTimeout(ok, ms));
const remPx = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 10;

/** Reihe der Kette (null vor der ersten Aufgabe). @type {number | null} */
let n = null;
/** Stäbchen mit gelöster Aufgabe auf der Kette von n (ihre Pfeilchen tragen die Zahl). @type {Set<number>} */
let geloest = new Set();
/** Auf welchem Stäbchen Lena steht (0: Startplatz). */
let lenaBei = 0;
/** Laufende Wirkungen; Tippen und die nächste Aufgabe springen ans Ende. @type {(() => void)[]} */
let laufend = [];
/** Die Wirkung der letzten Lösung (die Folge wartet darauf). @type {Promise<any>} */
let wirkungFertig = Promise.resolve();
/** Die Einführung läuft: die Aufgabe nimmt keine Tasten an. */
let einfuehrungLaeuft = false;
let vorigeFreude = /** @type {string | null} */ (null);
let seitWitz = 0;

function ueberspringeAlles() {
  while (laufend.length) {
    const l = laufend;
    laufend = [];
    for (const f of l) f();
  }
}

// --- Kette: füllt den Teppich (Breite und Höhe in rem an <ls-perlenkette>) -----------------------------
new ResizeObserver(() => {
  const r = kettePlatz.getBoundingClientRect();
  for (const [attr, px] of [["breite", r.width], ["hoehe", r.height]]) {
    const neu = px / remPx();
    if (Math.abs(neu - Number(kette.getAttribute(attr) ?? 0)) > 0.3) kette.setAttribute(attr, neu.toFixed(1));
  }
  requestAnimationFrame(() => stelleLena(lenaBei));
}).observe(kettePlatz);
addEventListener("resize", () => requestAnimationFrame(() => stelleLena(lenaBei)));

/** Stellt die Kette auf n um (leert sie bei einem Wechsel). @param {number} neu @returns {boolean} gewechselt */
function kettenWechsel(neu) {
  if (n === neu) return false;
  n = neu;
  geloest = new Set();
  for (const a of ["pfeile", "leer", "frage", "markiert", "hell", "ring", "hohl"]) kette.removeAttribute(a);
  kette.setAttribute("reihe", String(neu));
  return true;
}

/** Die Kette rollt aus (Stäbchen für Stäbchen, etwa 0,4 s; bei wenig Bewegung sofort). */
async function kettRolltAus() {
  if (wenigBewegung()) return kette.removeAttribute("bis");
  for (let k = 0; k <= 10; k++) {
    kette.setAttribute("bis", String(k));
    await warte(35);
  }
  kette.removeAttribute("bis");
}

// --- Lena ------------------------------------------------------------------------------------------
/** Fußpunkt im Feld der Figur (spiele/runde: viewBox 320 × 280, Fuß bei 160, 254). */
const FUSS = 254 / 280;
lenaKoerper.innerHTML = Runde.zeichne("lena", { haltung: "stehen", blick: "rechts" });
const lena = Runde.steuere(lenaKoerper.querySelector("svg"));

/** @param {{ x: number, y: number }} p Fußpunkt (px) @param {number} [hoch] px über dem Punkt */
const lenaTransform = (p, hoch = 0) => `translate(${(p.x - lenaEl.offsetWidth / 2).toFixed(1)}px, ${(p.y - lenaEl.offsetHeight * FUSS - hoch).toFixed(1)}px)`;

/** Lena steht auf Stäbchen k (0: Startplatz), ohne Bewegung. @param {number} k */
function stelleLena(k) {
  const p = kette.standPunkt(k);
  if (!p) return;
  lenaBei = k;
  lenaEl.getAnimations().forEach((a) => a.cancel());
  lenaEl.style.transform = lenaTransform(p);
}

/**
 * Lena hüpft von Stäbchen `von` Stäbchen für Stäbchen bis `bis` (Bogen, beim Abspringen geduckt, Landung gestaucht).
 * Rückwärts (bis < von): ein großer Bogen. beiLandung(k) nach jeder Landung (Ton, Leuchten, Kette rollt aus).
 * @param {number} bis @param {{ zeiten?: number[], vorher?: (k: number) => void, beiLandung?: (k: number) => void }} [o]
 * @returns {{ fertig: Promise<void>, ueberspringe: () => void }}
 */
function lenaHuepft(bis, { zeiten = [], vorher = () => {}, beiLandung = () => {} } = {}) {
  const von = lenaBei;
  const schritte = bis >= von ? Array.from({ length: bis - von }, (_, i) => von + i + 1) : [bis];
  let aus = false;
  let i = 0;
  /** @type {Animation[]} */
  let jetzt = [];
  const ende = () => {
    if (aus) return;
    aus = true;
    jetzt.forEach((a) => a.cancel());
    for (; i < schritte.length; i++) {
      vorher(schritte[i]);
      beiLandung(schritte[i]);
    }
    stelleLena(bis);
    lenaKoerper.getAnimations().forEach((a) => a.cancel());
  };
  const fertig = (async () => {
    if (wenigBewegung()) return ende();
    const rem = remPx();
    lena.haltung("freuen-klein", { ms: 120 });
    for (; i < schritte.length && !aus; i++) {
      const k = schritte[i];
      const p0 = kette.standPunkt(lenaBei);
      const p1 = kette.standPunkt(k);
      if (!p0 || !p1) break;
      vorher(k);
      const zurueck = k < lenaBei;
      const reihenwechsel = Math.abs(p1.y - p0.y) > 1;
      const ms = zurueck ? 420 : zeiten[k - 1] ?? 240;
      // Bogen: auf derselben Reihe 2,5 rem plus ein wenig je Weite; in die andere Reihe und zurück an den Start ein
      // flacher großer Bogen (nie bis in die Blase).
      const hoch = reihenwechsel || zurueck ? 3 * rem : Math.min(4 * rem, 2.5 * rem + Math.abs(p1.x - p0.x) * 0.06);
      const mitte = { x: (p0.x + p1.x) / 2, y: Math.min(p0.y, p1.y) };
      jetzt = [
        lenaEl.animate([
          { transform: lenaTransform(p0), easing: "ease-out" },
          { transform: lenaTransform(mitte, hoch), offset: 0.5, easing: "ease-in" },
          { transform: lenaTransform(p1) },
        ], { duration: ms, fill: "forwards" }),
        lenaKoerper.animate([
          { transform: "scale(1.07, 0.9)" },
          { transform: "scale(0.95, 1.07)", offset: 0.22 },
          { transform: "scale(1, 1)", offset: 0.6 },
          { transform: "scale(1.09, 0.88)" },
        ], { duration: ms, fill: "forwards" }),
      ];
      await jetzt[0].finished.catch(() => undefined);
      if (aus) return;
      lenaEl.style.transform = lenaTransform(p1);
      jetzt.forEach((a) => a.cancel());
      lenaBei = k;
      beiLandung(k);
    }
    if (aus) return;
    // Nach der letzten Landung federt sie zurück.
    const zurueck = lenaKoerper.animate([{ transform: "scale(1.09, 0.88)" }, { transform: "scale(0.98, 1.03)", offset: 0.6 }, { transform: "scale(1, 1)" }], { duration: 160 });
    jetzt = [zurueck];
    await zurueck.finished.catch(() => undefined);
    aus = true;
  })();
  return { fertig, ueberspringe: ende };
}

/** Lena hüpft zurück an den Start (ein Bogen, 0,4 s) und steht still. */
function lenaZumStart() {
  lena.haltung("stehen", { ms: 200 });
  if (lenaBei === 0) return Promise.resolve();
  const h = lenaHuepft(0);
  laufend.push(h.ueberspringe);
  return h.fertig.then(() => lena.haltung("stehen", { ms: 160 }));
}

// --- Tafel und Pfeilchen im Flug -------------------------------------------------------------------
/** Die Aufgabe auf der Tafel, das Kärtchen leer. @param {number} a @param {number} b */
function zeigeAufgabe(a, b) {
  rechnung.textContent = `${a} · ${b} =`;
  setzeEingabe("");
}
/** @param {string} text */
function setzeEingabe(text) {
  karte.textContent = text || "0";
  karte.classList.toggle("leer", !text);
}

/**
 * Das Kärtchen der Tafel fliegt als Pfeilchen an die Kette (Spitze `ziel`; unten: das Pfeilchen zeigt nach unten).
 * @param {string} text @param {{ x: number, y: number, rem: number, s: number } | null} ziel
 * @param {{ hohl?: boolean }} [o] @returns {{ fertig: Promise<void>, ueberspringe: () => void }}
 */
function fliege(text, ziel, { hohl = false } = {}) {
  const start = karte.getBoundingClientRect();
  setzeEingabe("");
  if (!ziel || wenigBewegung()) return { fertig: Promise.resolve(), ueberspringe: () => {} };
  const r = ziel.rem;
  const s = ziel.s;
  const hoehe = 4.8 * s * r;
  const breite = Math.max(5.6 * s, text.length * 3.4 * s * 0.62 + 2 * s) * r;
  const spitze = 1.1 * s * r;
  const el = document.createElement("div");
  el.className = `flug${hohl ? " hohl" : ""}`;
  el.textContent = text;
  Object.assign(el.style, { width: `${breite}px`, height: `${hoehe}px`, fontSize: `${3.4 * s * r}px` });
  figurenLage.append(el);
  const x1 = ziel.x - breite / 2;
  const y1 = hohl ? ziel.y - spitze - hoehe : ziel.y + spitze;
  const f0 = start.height / hoehe;
  const x0 = start.left + start.width / 2 - breite / 2;
  const y0 = start.top + start.height / 2 - hoehe / 2;
  const hoch = 3 * r;
  const a = el.animate([
    { transform: `translate(${x0}px, ${y0}px) scale(${f0})`, easing: "ease-out" },
    { transform: `translate(${(x0 + x1) / 2}px, ${Math.min(y0, y1) - hoch}px) scale(${(f0 + 1) / 2}) rotate(-8deg)`, offset: 0.45, easing: "ease-in" },
    { transform: `translate(${x1}px, ${y1}px) scale(1)` },
  ], { duration: 360, fill: "forwards" });
  const weg = () => el.remove();
  return { fertig: a.finished.then(weg, weg), ueberspringe: () => { a.cancel(); weg(); } };
}

// --- Die Wirkungen ---------------------------------------------------------------------------------
/** Kopf: vor dem Tipp keine Kette; nach Fertig rollt unter jedem Hüpfer ein Stäbchen aus. */
let kopfStufe = false;

/**
 * Lena hüpft a Stäbchen (wenn sie nicht schon dort steht), Ton und Leuchten je Hüpfer; in Kopf rollt die Kette dabei aus.
 * @param {number} a @returns {Promise<void>}
 */
function hinHuepfen(a) {
  if (lenaBei === a) return Promise.resolve();
  if (lenaBei !== 0) stelleLena(0);
  const h = lenaHuepft(a, {
    zeiten: hueperZeiten(a),
    vorher: (k) => { if (kopfStufe && kette.hasAttribute("bis")) kette.setAttribute("bis", String(k)); },
    beiLandung: (k) => {
      kette.leuchte(k);
      klang.hueper(k);
    },
  });
  laufend.push(h.ueberspringe);
  return h.fertig;
}

/**
 * Richtig: Lena hüpft hin, das Pfeilchen fliegt an ihr Stäbchen und rastet ein, Lena freut sich (oder ein Witz).
 * Endbild: Lena auf Stäbchen a, darunter das Pfeilchen mit c. Überspringbar (laufend).
 * @param {number} a @param {number} b @param {{ satz?: boolean, freude?: boolean }} [o]
 */
function wirkungRichtig(a, b, { satz = false, freude = true } = {}) {
  const c = a * b;
  const meine = geloest;
  let gesetzt = false;
  const setze = () => {
    if (gesetzt) return;
    gesetzt = true;
    if (meine !== geloest) return; // die Kette ist schon gewechselt
    meine.add(a);
    kette.removeAttribute("frage");
    kette.removeAttribute("hohl");
    kette.setAttribute("pfeile", [...meine].sort((x, y) => x - y).join(" "));
  };
  laufend.push(setze);
  const ablauf = (async () => {
    await hinHuepfen(a);
    if (gesetzt) return;
    const f = fliege(String(c), kette.pfeilPunkt(a));
    laufend.push(f.ueberspringe);
    await f.fertig;
    if (gesetzt) return;
    setze();
    kette.einrasten(a);
    klang.plopp();
    if (satz) erzaehler.gleichung(a, b);
    if (!freude) return;
    const w = witz(a, ++seitWitz);
    const bewegung = w ?? naechsteFreude(vorigeFreude);
    if (w) seitWitz = 0;
    else vorigeFreude = bewegung;
    lenaEl.dataset.freude = bewegung;
    const fertig = lena.bewegung(bewegung);
    laufend.push(() => lena.halt());
    await fertig;
  })();
  return ablauf;
}

/**
 * Daneben: Lena hüpft trotzdem a Stäbchen, unter ihr hängt ein „?“; das Pfeilchen der getippten Zahl fliegt hohl an
 * den Ort, wo sie wirklich liegt, und wackelt; Lena staunt hin. Nie reizvoller als richtig (N7).
 * @param {number} a @param {number} w getippt @param {boolean} kopfZu Kopf ohne Hilfe: Kette unter dem Tuch zeigen
 */
function wirkungDaneben(a, w, kopfZu) {
  let gesetzt = false;
  const setze = () => {
    if (gesetzt) return;
    gesetzt = true;
    if (kopfZu) {
      kette.removeAttribute("bis");
      kette.setAttribute("verdeckt", "");
    }
    kette.setAttribute("frage", String(a));
    kette.setAttribute("hohl", String(w));
    lena.haltung("staunen", { ms: 220 });
  };
  laufend.push(setze);
  return (async () => {
    await hinHuepfen(a);
    if (gesetzt) return;
    if (kopfZu) {
      kette.removeAttribute("bis");
      kette.setAttribute("verdeckt", "");
    }
    kette.setAttribute("frage", String(a));
    const f = fliege(String(w), kette.hohlPunkt(w), { hohl: true });
    laufend.push(f.ueberspringe);
    await f.fertig;
    if (gesetzt) return;
    setze();
    klang.boing();
    await erzaehler.daneben(w);
  })();
}

/**
 * @param {{ ziel: { key: string, thema?: string }, stufe?: string }} aufgabe
 * @param {{ passtNicht: () => void, geloest: (key: string) => void }} melde
 */
function stelleAufgabe(aufgabe, melde) {
  const ziel = malAus(aufgabe.ziel.key);
  if (!ziel) throw new Error(`Kettenhüpfer: unbekannte Aufgabe ${aufgabe.ziel.key}`);
  ueberspringeAlles();
  const { a, b, c } = ziel;
  const stufe = aufgabe.stufe ?? "material";
  kettenWechsel(b); // gewechselt (mit Satz) hat schon neueKette im RAHMEN; hier nur zur Sicherheit

  let eingabe = "";
  let fertig = false;
  let loesungGezeigt = false;
  let hilfeGezeigt = false;
  /** Zahlen, die bei dieser Aufgabe schon getippt wurden und nicht passten (nur für die Züge des Prüfstands). */
  const versucht = new Set();
  let versuche = 0;
  /** Das Bild eines Fehlversuchs; das nächste Tippen räumt es weg. @type {(() => void) | null} */
  let fehlerBild = null;

  const zeige = () => {
    kopfStufe = stufe === "kopf";
    kette.setAttribute("pfeile", pfeileWaehrend(geloest, a).join(" "));
    for (const x of ["leer", "frage", "hohl", "markiert", "hell", "ring"]) kette.removeAttribute(x);
    kette.toggleAttribute("verdeckt", stufe === "vorstellung");
    if (kopfStufe) kette.setAttribute("bis", "0");
    else kette.removeAttribute("bis");
    zeigeAufgabe(a, b);
    eingabe = "";
  };
  zeige();
  lenaZumStart();

  const markiereNaechste = () => {
    const t = naechsteTaste(eingabe, c);
    tastatur.markiere(t === "fertig" ? null : t);
    fertigKnopf.classList.toggle("markiert", t === "fertig");
  };
  const ohneMarkierung = () => {
    tastatur.markiere(null);
    fertigKnopf.classList.remove("markiert");
  };
  const raeumeFehlerBild = () => {
    fehlerBild?.();
    fehlerBild = null;
  };

  /** @param {string} taste */
  const beiTaste = (taste) => {
    if (fertig || einfuehrungLaeuft) return;
    raeumeFehlerBild();
    eingabe = tippe(eingabe, taste);
    setzeEingabe(eingabe);
    if (loesungGezeigt) markiereNaechste();
  };

  const pruefe = () => {
    if (fertig || einfuehrungLaeuft || !eingabe) return;
    raeumeFehlerBild();
    const zahl = Number(eingabe);
    eingabe = "";
    if (zahl === c) {
      fertig = true;
      abmelden();
      ohneMarkierung();
      // Gemeldet wird sofort (die Zeit der Aufgabe endet mit Fertig); die Wirkung läuft in der Zeit der Folge.
      melde.geloest(aufgabe.ziel.key);
      if (kopfStufe) kette.removeAttribute("verdeckt");
      wirkungFertig = wirkungRichtig(a, b, { satz: versuche > 0 || hilfeGezeigt });
      return;
    }
    // Passt nicht: die Kette zeigt, wo die Zahl wirklich liegt (N7, nichts setzt zurück).
    versuche++;
    melde.passtNicht();
    versucht.add(zahl);
    const kopfZu = kopfStufe && !hilfeGezeigt;
    const lauf = wirkungDaneben(a, zahl, kopfZu);
    fehlerBild = () => {
      ueberspringeAlles();
      void lauf;
      kette.removeAttribute("hohl");
      kette.removeAttribute("frage");
      lena.haltung("stehen", { ms: 200 });
      if (kopfZu) {
        kette.removeAttribute("verdeckt");
        kette.setAttribute("bis", "0");
      }
    };
    if (loesungGezeigt) markiereNaechste();
  };

  const tasteEreignis = (/** @type {any} */ e) => beiTaste(e.detail.zeichen);
  const fertigEreignis = () => pruefe();
  tastatur.addEventListener("taste", tasteEreignis);
  fertigKnopf.addEventListener("click", fertigEreignis);
  const abmelden = () => {
    tastatur.removeEventListener("taste", tasteEreignis);
    fertigKnopf.removeEventListener("click", fertigEreignis);
  };
  aufraeumen = () => {
    abmelden();
    fehlerBild = null;
    ohneMarkierung();
  };

  return {
    // Prüfstand: Tasten zu den Zahlen, die ein ratendes Kind hier am ehesten tippt (Ergebnis und Nachbarn um ein
    // Stäbchen); eine Zahl, die die Kette eben als „passt nicht“ gezeigt hat, tippt es nicht noch einmal.
    zuege() {
      if (fertig) return [];
      return tastenZu(eingabe, kandidaten(a, b).filter((x) => !versucht.has(x))).map(zug).filter(Boolean);
    },
    richtigerZug() {
      return fertig ? null : zug(naechsteTaste(eingabe, c));
    },
    /** Nach der Einführung über „Anleitung“: die Aufgabe steht wieder da, Lena am Start, das Kärtchen leer. */
    zeigeWieder() {
      kettenWechsel(b);
      zeige();
      stelleLena(0);
      lena.haltung("stehen", { ms: 0 });
      if (hilfeGezeigt || loesungGezeigt) this.hilfe(loesungGezeigt ? 2 : 1);
    },
    /** @param {1 | 2} hilfeStufe */
    hilfe(hilfeStufe) {
      if (fertig) return;
      raeumeFehlerBild();
      hilfeGezeigt = true;
      kette.removeAttribute("verdeckt");
      kette.removeAttribute("bis");
      const h = hilfeVon(a);
      // Probe (Stufe 1) und Lösung (Stufe 2): das Pfeilchen der Kernaufgabe im Sonnenring, die Stäbchen bis zum Ziel.
      if (h.kern !== null) {
        kette.setAttribute("pfeile", [...pfeileWaehrend(geloest, a), h.kern].join(" "));
        kette.setAttribute("markiert", String(h.kern));
      }
      kette.setAttribute("hell", h.hell.join(" "));
      if (hilfeStufe === 1) return h.kern === null ? erzaehler.einStaebchen() : erzaehler.gleichung(h.kern, b);
      // Lösung: die nächste Taste im Sonnenring; das Kind tippt selbst (L12).
      loesungGezeigt = true;
      markiereNaechste();
      return erzaehler.gleichung(a, b);
    },
  };
}

/** Selektor einer Taste („fertig“ ist der Knopf daneben). @param {string} t */
function tastenOrt(t) {
  if (t === "fertig") return "#fertig";
  const knopf = [...tastatur.shadowRoot.querySelectorAll("button[data-z]")].find((k) => k.dataset.z === t);
  return knopf ? selektor(knopf) : null;
}
const zug = (/** @type {string} */ t) => {
  const von = tastenOrt(t);
  return von ? { art: "tippen", von } : null;
};

/** Räumt die Bedienung der letzten Aufgabe ab (die Kette mit ihren Pfeilchen bleibt stehen). @type {() => void} */
let aufraeumen = () => {};
function raeumeAuf() {
  ueberspringeAlles();
  aufraeumen();
  aufraeumen = () => {};
}

/**
 * Vor der ersten Aufgabe einer Runde und bei einer neuen Kette: Lena springt an den Start, die Kette rollt aus, der
 * Erzähler nennt sie. Erst danach erscheint die Aufgabe (die Zeit läuft erst dann). Tippen kürzt ab.
 * @param {number} b
 */
async function neueKette(b) {
  stand.phase = "folge";
  ueberspringeAlles();
  await lenaZumStart();
  n = null;
  kettenWechsel(b);
  kopfStufe = false;
  kette.removeAttribute("verdeckt");
  rechnung.textContent = "";
  setzeEingabe("");
  await kettRolltAus();
  await steheSatz(erzaehler.kette(b));
}

/** Ein Satz steht, bis er gesprochen ist, mindestens KETTE_SATZ_MS; Tippen kürzt ab. @param {Promise<any>} gesagt */
function steheSatz(gesagt) {
  const feld = /** @type {HTMLElement} */ (document.querySelector(".spielflaeche"));
  return new Promise((ok) => {
    const fertig = () => {
      feld.removeEventListener("pointerdown", fertig);
      ok(undefined);
    };
    feld.addEventListener("pointerdown", fertig);
    Promise.all([gesagt, warte(KETTE_SATZ_MS)]).then(fertig);
  });
}

// =====================================================================================================
// EINFÜHRUNG im echten Spielbild (docs/spielbau.md §8, Idee §6)
// =====================================================================================================
// Schritt 1: Lena macht 2 · n vor – die Tasten sinken von selbst ein, Fertig, sie hüpft zwei Stäbchen, das Pfeilchen
// rastet ein. Schritt 2: 3 · n, der Sonnenring liegt auf der Taste, die das Kind tippt (erst die Ziffern, dann
// Fertig), und Lena hüpft. Weiter geht es nur mit dem Tipp des Kindes, nie nach einer Zeit. Nicht gebucht.

/** Taste, auf der in der Einführung der Sonnenring liegt (für richtigerZug). @type {string | null} */
let einfuehrungTaste = null;

/** Eine Taste sinkt von selbst ein (Vormachen). @param {string} t */
function drueckeVor(t) {
  const el = t === "fertig" ? fertigKnopf : tastatur.shadowRoot.querySelector(`button[data-z="${t}"]`);
  if (!el) return;
  if (typeof el.animate === "function" && !wenigBewegung()) el.animate([{ transform: "translateY(0)" }, { transform: "translateY(0.7rem)", offset: 0.4 }, { transform: "translateY(0)" }], { duration: 260 });
}

/** Das Kind tippt die Folge von Tasten, je eine im Sonnenring; andere Tasten tun nichts. @param {string[]} folge */
function kindTippt(folge) {
  return new Promise((ok) => {
    let i = 0;
    let eingabe = "";
    const ring = () => {
      const t = folge[i];
      einfuehrungTaste = t;
      tastatur.markiere(t === "fertig" ? null : t);
      fertigKnopf.classList.toggle("markiert", t === "fertig");
    };
    const weiter = (/** @type {string} */ t) => {
      if (t !== folge[i]) return;
      if (t !== "fertig") {
        eingabe += t;
        setzeEingabe(eingabe);
      }
      i++;
      if (i < folge.length) return ring();
      tastatur.removeEventListener("taste", taste);
      fertigKnopf.removeEventListener("click", fertig);
      einfuehrungTaste = null;
      tastatur.markiere(null);
      fertigKnopf.classList.remove("markiert");
      ok(undefined);
    };
    const taste = (/** @type {any} */ e) => weiter(e.detail.zeichen);
    const fertig = () => weiter("fertig");
    tastatur.addEventListener("taste", taste);
    fertigKnopf.addEventListener("click", fertig);
    ring();
  });
}

/** Spielt die Einführung auf der Kette von b. @param {number} b */
async function einfuehrung(b) {
  stand.phase = "einfuehrung";
  einfuehrungLaeuft = true;
  try {
    ueberspringeAlles();
    stelleLena(0);
    lena.haltung("stehen", { ms: 0 });
    n = null;
    kettenWechsel(b);
    kopfStufe = false;
    kette.removeAttribute("verdeckt");
    kette.removeAttribute("bis");
    // Schritt 1: Lena macht es vor.
    zeigeAufgabe(2, b);
    await warte(900);
    let vor = "";
    for (const z of String(2 * b)) {
      drueckeVor(z);
      vor += z;
      setzeEingabe(vor);
      await warte(450);
    }
    drueckeVor("fertig");
    await warte(300);
    const satz1 = erzaehler.einfuehrungVor();
    await Promise.all([wirkungRichtig(2, b, { freude: false }), satz1]);
    await warte(500);
    // Schritt 2: das Kind tippt.
    await lenaZumStart();
    geloest = new Set();
    kette.removeAttribute("pfeile");
    zeigeAufgabe(3, b);
    const satz2 = erzaehler.einfuehrungDu();
    await kindTippt([...String(3 * b), "fertig"]);
    await Promise.all([wirkungRichtig(3, b), satz2]);
    await warte(600);
  } finally {
    ueberspringeAlles();
    einfuehrungLaeuft = false;
    einfuehrungTaste = null;
  }
}

// =====================================================================================================
// RAHMEN (aus der Vorlage)
// =====================================================================================================

const params = new URLSearchParams(location.search);
const wunsch = einmal(params.get("thema")); // ?thema= gilt nur für die erste Runde der Seite
// ?stufe=<id> nur im Testbetrieb: jede Aufgabe auf dieser Lernstufe; die Runde ist dann eine Vorschau (schreibt nicht).
const PRUEF_STUFE = testbetrieb() ? params.get("stufe") || null : null;
/** @param {any} a */
const aufStufe = (a) => (a && PRUEF_STUFE ? { ...a, stufe: PRUEF_STUFE } : a);

/** @type {{ plan: any, spiele: any } | null} */
let ctx = null;
async function ladeCtx() {
  if (ctx) return ctx;
  const [plan, spiele] = await Promise.all(["lernplan.json", "spiele.json"].map((f) => fetch(new URL(`../../${f}`, import.meta.url)).then((r) => r.json())));
  ctx = { plan, spiele };
  return ctx;
}
/** Steht das Spiel in spiele.json? Sonst (ein Spiel vor dem Eintrag) läuft es als Vorschau. */
const eingetragen = (/** @type {{ spiele: any }} */ c) => c.spiele.spiele.some((/** @type {any} */ s) => s.id === SPIEL_ID);

// --- Prüfstand (rahmen/pruefen.js, nur im Testbetrieb ?pruefen) ------------------------------------
// In der Einführung ist der richtige Zug die Taste im Sonnenring (das Kind tippt selbst), sonst wie in der Vorlage.
const stand = { phase: "laden", aufgabe: /** @type {string | null} */ (null), nr: 0, versuche: 0, hilfeStufe: 0, vorschau: true, lernstufe: /** @type {string | null} */ (null) };
/** @type {{ zuege: () => any[], richtigerZug: () => any, zeigeWieder: () => void } | null} */
let offeneAufgabe = null;
const ORTE = { hilfe: "#hilfe >>> ls-knopf", haus: "#leiste >>> a.haus", weiter: "#pause >>> ls-knopf.weiter" };
const WEITER = { art: "tippen", von: ORTE.weiter };
const einfuehrungsZug = () => (einfuehrungTaste ? zug(einfuehrungTaste) : null);
meldePruefSchnittstelle({
  zustand: () => ({ ...stand }),
  zuege: () => (stand.phase === "aufgabe" ? offeneAufgabe?.zuege() ?? [] : stand.phase === "pause" ? [WEITER] : stand.phase === "einfuehrung" ? [einfuehrungsZug()].filter(Boolean) : []),
  richtigerZug: () => (stand.phase === "aufgabe" ? offeneAufgabe?.richtigerZug() ?? null : stand.phase === "pause" ? WEITER : stand.phase === "einfuehrung" ? einfuehrungsZug() : null),
  orte: ORTE,
});

// --- Hilfe-Leiter (grundsaetze.md L12, bedienung.md 6) ---------------------------------------------
/** @type {(() => void) | null} */
let hilfeTippen = null;
hilfe.addEventListener("hilfe", () => { if (!einfuehrungLaeuft) hilfeTippen?.(); });

/**
 * Spielt eine Aufgabe bis zur Lösung.
 * @param {any} aufgabe
 * @returns {Promise<{ key: string, versuche: number, hilfe: number, ms: number }>}
 */
function spieleAufgabe(aufgabe) {
  return new Promise((fertig, fehler) => {
    const start = Date.now();
    let versuche = 0;
    let stufe = 0;
    Object.assign(stand, { phase: "aufgabe", aufgabe: aufgabe?.ziel?.key ?? null, nr: stand.nr + 1, versuche, hilfeStufe: stufe, lernstufe: aufgabe?.stufe ?? null });
    /** @type {ReturnType<typeof stelleAufgabe>} */
    let a;
    try {
      a = stelleAufgabe(aufgabe, {
        passtNicht() {
          versuche++;
          stand.versuche = versuche;
          if (versuche === 2 && stufe === 0) hilfe.leuchte();
        },
        geloest(key) {
          hilfeTippen = null;
          offeneAufgabe = null;
          stand.phase = "folge";
          fertig({ key, versuche, hilfe: stufe, ms: Date.now() - start });
        },
      });
    } catch (e) {
      hilfeTippen = null;
      fehler(e);
      return;
    }
    offeneAufgabe = a;
    hilfeTippen = () => {
      stufe = Math.min(2, stufe + 1);
      stand.hilfeStufe = stufe;
      a.hilfe(/** @type {1 | 2} */ (stufe));
    };
  });
}

// --- Folge nach einer Lösung (bedienung.md 7.1, B6) ----------------------------------------------
// Kein Weiter-Knopf: die Folge wartet, bis die Wirkung fertig ist (höchstens FOLGE_MAX_MS), dann NACH_WIRKUNG_MS;
// ein Tippen auf das Spielfeld überspringt beides, dann kommt die nächste Aufgabe.
function warteFolge() {
  const feld = /** @type {HTMLElement} */ (document.querySelector(".spielflaeche"));
  return new Promise((ok) => {
    let vorbei = false;
    const fertig = () => {
      if (vorbei) return;
      vorbei = true;
      clearTimeout(uhr);
      feld.removeEventListener("pointerdown", fertig);
      ok(undefined);
    };
    const uhr = setTimeout(fertig, FOLGE_MAX_MS + NACH_WIRKUNG_MS);
    feld.addEventListener("pointerdown", fertig);
    wirkungFertig.catch(() => undefined).then(() => warte(NACH_WIRKUNG_MS)).then(fertig);
  });
}

// --- Pause am Rundenende (bedienung.md 7.1) --------------------------------------------------------
/** @param {{ hinweis?: string | null, zeit?: { schluss: boolean, satz: string | null }, echteDinge?: { thema?: string, fach?: string, titel?: string, text?: string } | null }} [optionen] */
async function zeigePause({ hinweis = null, zeit = { schluss: false, satz: null }, echteDinge = null } = {}) {
  const feld = $("sachmoment");
  fuelleSachmoment(feld, leiste.ton && !zeit.satz);
  if (zeit.satz && leiste.ton) sage(zeit.satz);
  const spiel = hinweis ? (ctx?.spiele?.spiele ?? []).find((/** @type {any} */ s) => s.id === hinweis) : null;
  if (spiel) {
    const a = document.createElement("a");
    a.className = "hinweis";
    a.href = spiel.datei;
    a.tabIndex = 0; // WebKit (Safari, macOS-Vorgabe) erreicht Links mit Tab nur mit tabindex
    a.innerHTML = `<img src="${esc(new URL(spiel.symbol, new URL("../../", import.meta.url)).href)}" alt=""><span>${esc(spiel.titel)}</span>`;
    feld.append(a);
  }
  stand.phase = "pause";
  await pause.zeige({ ...zeit, echteDinge }); // „Alle Spiele“ navigiert selbst (speichert vorher), „Weiter“ löst auf
  stand.phase = "laden";
}

// --- Elternansicht (?eltern): beschreibend, kein Vergleich -----------------------------------------
async function elternansicht() {
  const e = document.createElement("section");
  e.className = "eltern auswahl";
  const eintrag = (await ladeCtx().catch(() => null))?.spiele.spiele.find((/** @type {any} */ s) => s.id === SPIEL_ID);
  const beschreibung = typeof eintrag?.beschreibung === "string" ? eintrag.beschreibung.trim() : "";
  e.innerHTML = `<h1>${esc(leiste.getAttribute("titel"))}</h1>${beschreibung ? `<p class="beschreibung">${esc(beschreibung)}</p>` : ""}<div class="eigenes"></div>
    <p><a href="../../eltern.html">Themen im Elternbereich</a> · <a href="${esc(location.pathname.split("/").pop())}">Zum Spiel</a></p>`;
  fuelleEltern(/** @type {HTMLElement} */ (e.querySelector(".eigenes")));
  document.body.append(e);
}

// --- Runde: Lernsteuerung oder (nur Vorschau) die festen Aufgaben ----------------------------------

/** @param {boolean} vorschau */
async function starteRunde(vorschau) {
  const c = await ladeCtx();
  const mitSpiel = eingetragen(c) ? c : { plan: c.plan, spiele: { ...c.spiele, spiele: [...c.spiele.spiele, { id: SPIEL_ID, arten: ARTEN }] } };
  // Keine feste Rundenlänge: die Lernsteuerung beendet die Runde (gekonnt, Zeit; G14).
  const r = await runde(SPIEL_ID, { wunsch: wunsch(), ctx: mitSpiel, nurAnsehen: vorschau });
  const plan = r.thema ? c.plan.themen.find((/** @type {any} */ t) => t.id === r.thema?.id) : null;
  return {
    thema: r.thema?.name ?? "",
    echteDinge: plan ? { thema: plan.id, fach: plan.strang, titel: plan.name, text: plan.eltern ?? "" } : null,
    einfuehrungGesehen: () => r.einfuehrungGesehen(),
    naechste: () => r.naechste(),
    melde: (/** @type {string} */ key, /** @type {any} */ e) => r.melde(key, e),
    ende: () => r.ende(),
  };
}

/** Feste Aufgaben ohne Lernsteuerung, nur in der Vorschau. */
function vorschauRunde() {
  const keys = [...VORSCHAU.aufgaben];
  return {
    thema: VORSCHAU.thema,
    echteDinge: { titel: VORSCHAU.thema },
    einfuehrungGesehen() {},
    naechste() {
      const key = keys.shift();
      return key ? { ziel: { key }, auch: [], stufe: "material" } : null;
    },
    melde() { return null; },
    async ende() { return { hinweisSpiel: null }; },
  };
}

/** Die Einführung lief schon (sie kommt bei jedem Start einmal, danach über „Anleitung“). */
let einfuehrungGespielt = false;

// „Anleitung“: die Einführung im Spielbild jederzeit wieder (während einer Aufgabe); danach steht die Aufgabe wieder da.
$("anleitung")?.addEventListener("click", async () => {
  if (stand.phase !== "aufgabe" || einfuehrungLaeuft || n === null) return;
  const merke = { n, geloest: new Set(geloest), aufgabe: offeneAufgabe };
  await einfuehrung(n);
  n = merke.n;
  geloest = merke.geloest;
  merke.aufgabe?.zeigeWieder();
  stand.phase = "aufgabe";
});

/** @param {boolean} vorschau */
async function spieleRunde(vorschau) {
  /** @type {any} */
  let r;
  try {
    r = await starteRunde(vorschau);
  } catch (e) {
    protokoll(`${SPIEL_ID}: Runde starten: ${/** @type {any} */ (e)?.message ?? e}`);
    if (!vorschau) {
      stand.phase = "fehler";
      return erzaehler.gehtNicht();
    }
    r = vorschauRunde();
  }

  let aufgabe = aufStufe(r.naechste());
  if (!aufgabe && vorschau) {
    r = vorschauRunde();
    aufgabe = aufStufe(r.naechste());
  }
  leiste.setAttribute("thema", r.thema);

  // Das Spiel beginnt mit der Einführung im echten Spielbild (bei jedem Start; in der Vorschau nur mit ?einfuehrung).
  const erste = malAus(aufgabe?.ziel?.key);
  if (!einfuehrungGespielt && erste && (!vorschau || params.has("einfuehrung"))) {
    einfuehrungGespielt = true;
    await einfuehrung(einfuehrungsKette(erste.a, erste.b));
    r.einfuehrungGesehen();
  }
  $("anleitung")?.removeAttribute("hidden");

  let neueRunde = true;
  while (aufgabe) {
    raeumeAuf();
    const z = malAus(aufgabe.ziel.key);
    if (z && (neueRunde || z.b !== n)) await neueKette(z.b);
    neueRunde = false;
    const e = await spieleAufgabe(aufgabe);
    const ergebnis = { key: e.key, ok: e.versuche === 0, hilfe: e.hilfe, ms: e.ms };
    r.melde(e.key, ergebnis);
    document.dispatchEvent(new CustomEvent("ls-ergebnis", { detail: ergebnis })); // für die Browser-Prüfung
    await warteFolge();
    aufgabe = aufStufe(r.naechste());
  }

  raeumeAuf();
  const { hinweisSpiel } = await r.ende();
  await zeigePause({ hinweis: hinweisSpiel, zeit: vorschau ? undefined : await amRundenende(), echteDinge: r.echteDinge });
  return spieleRunde(vorschau);
}

// --- Start ---------------------------------------------------------------------------------------
async function start() {
  await leiste.bereit(); // Ton-Einstellung geladen
  if (params.has("eltern")) return elternansicht();
  const c = await ladeCtx().catch(() => null);
  const nichtEingetragen = c !== null && !eingetragen(c);
  if (nichtEingetragen) protokoll(`${SPIEL_ID}: nicht in spiele.json – Vorschau, schreibt nicht`);
  const vorschau = ["pause", "hinweis", "eltern", "einfuehrung"].some((p) => params.has(p)) || PRUEF_STUFE !== null || !c || nichtEingetragen;
  stand.vorschau = vorschau;
  if (!(await starteSpielzeit({ zaehlen: !vorschau }))) return;
  await new Promise((ok) => requestAnimationFrame(() => ok(undefined)));
  stelleLena(0);
  if (params.has("pause") || params.has("hinweis")) {
    const andere = (ctx?.spiele?.spiele ?? []).find((/** @type {any} */ s) => s.id !== SPIEL_ID)?.id ?? null;
    await zeigePause({ hinweis: params.has("hinweis") ? params.get("hinweis") || andere : null, echteDinge: { titel: VORSCHAU.thema } });
  }
  await spieleRunde(vorschau);
}

start().catch((e) => {
  protokoll(`${SPIEL_ID}: ${/** @type {any} */ (e)?.message ?? e}`);
  stand.phase = "fehler";
  erzaehler.gehtNicht();
});
