// M37 Kettenhüpfer (Idee: docs/spiele/mathe/m37-kettenhuepfer.md, Neubau 2026-11-15). Das Kind tippt das Ergebnis
// einer Malaufgabe a · n und bestätigt mit Fertig; dann hüpft Lena a Stäbchen weit über die Perlenkette von n, die
// mit Kreide auf die Straße gemalt ist (kreide.js), jeder Hüpfer ein Ton höher, und die getippte Zahl fliegt aus dem
// Kästchen der Aufgabe an ihr Stäbchen und wird dort in ein Kreide-Kästchen geschrieben. Passt die Zahl nicht, hüpft Lena trotzdem a Stäbchen; unter ihr hängt ein „?“, und das Pfeilchen
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
import "../../rahmen/perlenkette.js"; // nur für die Pause (Papierkarte)
import "./kreide.js";
import * as Runde from "../../runde/runde.js";
import { malAus } from "../../aufgabenarten.js";
import { LERNFARBE } from "../../rahmen/stil.js";
import { meldePruefSchnittstelle, selektor, testbetrieb } from "../../rahmen/pruefen.js";
import { sperreTouch, protokoll, esc } from "../../lernspiel.js";
import { sprich } from "../../kern/stimme.js";
import { runde, einmal, K, rundenMs } from "../../lernsteuerung.js";
import { starteSpielzeit, amRundenende, sage } from "../../rahmen/spielzeit.js";
import { hilfeVon, kandidaten, naechsteTaste, tastenZu, tippe, pfeileWaehrend, einfuehrungsKette, hueperZeiten, hueperTon, naechsteFreude, witz, waehleAufgabe, bildWechsel } from "./logik.js";

sperreTouch();

const $ = (/** @type {string} */ id) => /** @type {any} */ (document.getElementById(id));
const leiste = $("leiste");
const blase = $("blase");
const hilfe = $("hilfe");
const pause = $("pause");
const kette = $("kette");
const brett = $("brett");
const schatten = $("schatten");
const rechnung = $("rechnung");
const tafel = $("tafel");
const karte = $("eingabe");
const tastatur = $("tastatur");
const fertigKnopf = $("fertig");
const lenaEl = $("lena");
const lenaKoerper = $("lena-koerper");
const werkzeug = $("werkzeug");
const figurenLage = /** @type {HTMLElement} */ (document.querySelector(".figuren"));

// =====================================================================================================
// SPIELWELT
// =====================================================================================================

/** Kennung des Spiels: steht einmal in der HTML-Datei an <ls-leiste spiel>. */
const SPIEL_ID = leiste.getAttribute("spiel");

/** Aufgabenarten (gilt nur, solange das Spiel nicht in spiele.json steht; dort steht dasselbe). */
const ARTEN = [{ art: "mal", reihen: [2, 10], stufen: ["material", "vorstellung", "kopf"] }];

/** Die Folge einer Lösung steht nach der Wirkung noch so lange, dann kommt die nächste Aufgabe (Tippen überspringt). */
const NACH_WIRKUNG_MS = 150;
/** Längstens so lange wartet die Folge auf das Ende der Wirkung (Regeln §1: etwa 2,5 s, höchstens 3 s). */
const FOLGE_MAX_MS = 2600;
/** Der Satz zu einem Wechsel (Reihe oder Stufe) steht mindestens so lange, auch ohne Ton. */
const WECHSEL_SATZ_MS = 1400;
/**
 * Eine neue Aufgabe beginnt nur, solange von der Rundenlänge der Lernsteuerung (K.RUNDE_MS, 4 Minuten) noch so viel
 * übrig ist: auch ein Kind, das lange rät, ist mit seiner letzten Aufgabe vor dem Ende der 4 Minuten fertig.
 */
const LETZTE_AUFGABE_MS = 30000;
/** Ein Stäbchen wischen oder malen (Lena hüpft drauf, Schwamm oder Kreide gehen darüber): zehn zusammen etwa 1,5 s. */
const STAB_MS = 150;

/** Nur Vorschau: Aufgaben, falls die Lernsteuerung nichts liefert. */
const VORSCHAU = { thema: "Siebenerreihe", aufgaben: ["mal:6*7", "mal:3*7", "mal:8*7", "mal:4*7"] };

/** Sätze aus Daten (je Reihe, Aufgabe und getippter Zahl ausgeschrieben, texte.json). */
const TEXTE = await fetch(new URL("texte.json", import.meta.url)).then((r) => r.json()).catch(() => null);

/** Der zuletzt begonnene Satz nach einer Lösung; vor dem nächsten Satz des Spiels wartet es darauf (kein Satz wird abgeschnitten). @type {Promise<any>} */
let letzterSatz = Promise.resolve();

/** Der Erzähler (docs/stimme.md): beschreibt, was zu sehen ist, nie ein Urteil (grundsaetze.md 3.2). */
const erzaehler = {
  /** Eine Aufgabe einer anderen Reihe kommt: „Jetzt die Dreierkette.“ @param {number} b */
  jetzt: (b) => (TEXTE?.jetzt?.[b] ? blase.sage(TEXTE.jetzt[b]) : Promise.resolve("still")),
  /** Wechsel der Stufe (perlen-weg, perlen-hin, kette-weg, kette-hin). @param {string} art */
  wechsel: (art) => (TEXTE?.wechsel?.[art] ? blase.sage(TEXTE.wechsel[art]) : Promise.resolve("still")),
  /** „a · n = c.“ (nach Fehlversuch oder Hilfe, Probe der Kernaufgabe, Lösung); in der Hilfe kurz auch zu lesen.
   * @param {number} a @param {number} b @param {boolean} [zeigen] */
  gleichung: (a, b, zeigen = false) => blase.sage(TEXTE?.gleichung?.[`${a}*${b}`] ?? "", { zeigen }),
  /** Ort der getippten Zahl, die nicht passt (bis 100; darüber zeigt es nur das Bild). @param {number} w */
  daneben: (w) => (TEXTE?.daneben?.[w] ? blase.sage(TEXTE.daneben[w]) : Promise.resolve("still")),
  einStaebchen: () => blase.sage("Lena hüpft nur ein Stäbchen.", { zeigen: true }),
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

/** Tasten, die eine Folge oder Szene abkürzen (wie ein Tipp). */
const KUERZT = new Set(["Enter", " ", "Escape"]);
/**
 * Ruft fn beim nächsten Tipp irgendwo auf der Seite (auch auf Kette, Lena oder Leiste) oder bei Enter, Leertaste,
 * Escape (Regeln §1: der nächste Tipp überspringt Folge und Szene). @param {() => void} fn @returns {() => void} abmelden
 */
function beimTippen(fn) {
  const hoer = (/** @type {Event} */ e) => {
    if (e instanceof KeyboardEvent && !KUERZT.has(e.key)) return;
    fn();
  };
  document.addEventListener("pointerdown", hoer, true);
  document.addEventListener("keydown", hoer, true);
  return () => {
    document.removeEventListener("pointerdown", hoer, true);
    document.removeEventListener("keydown", hoer, true);
  };
}

// --- Kette: die Straße reicht bis ans Ziffernbrett (Breite in rem an <m37-kreidekette>) ---------------------
function passeStrasseAn() {
  const neu = brett.getBoundingClientRect().left / remPx() - 1.6;
  if (neu > 0 && Math.abs(neu - Number(kette.getAttribute("breite") ?? 0)) > 0.3) kette.setAttribute("breite", neu.toFixed(1));
  requestAnimationFrame(() => stelleLena(lenaBei));
}
new ResizeObserver(passeStrasseAn).observe(brett);
addEventListener("resize", passeStrasseAn);

/** Stellt die Kette auf n um (leert sie bei einem Wechsel). @param {number} neu @returns {boolean} gewechselt */
function kettenWechsel(neu) {
  if (n === neu) return false;
  n = neu;
  geloest = new Set();
  for (const a of ["pfeile", "leer", "frage", "markiert", "hell", "ring", "hohl"]) kette.removeAttribute(a);
  kette.setAttribute("reihe", String(neu));
  return true;
}

/** Was die Kette zwischen zwei Aufgaben zeigt: die Stufe, in der sie gemalt ist (null: noch keine Kette). @type {string | null} */
let bildStufe = null;
const ALLE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
/** Stäbchen, die gerade zu sehen sind (Stufe kopf: nur die beim Hüpfen entstandenen). */
function sichtbareStaebchen() {
  const bis = kette.getAttribute("bis");
  const weg = new Set((kette.getAttribute("weg") ?? "").split(/\s+/).filter(Boolean).map(Number));
  const max = bis === null ? 10 : Number(bis);
  return ALLE.filter((k) => k <= max && !weg.has(k));
}
/** Die Kette ohne Zwischenstand einer Szene in der Stufe (verdeckt, bis, perlen, weg). @param {string} stufe */
function setzeStufe(stufe) {
  kette.removeAttribute("perlen");
  kette.removeAttribute("weg");
  kette.toggleAttribute("verdeckt", stufe === "vorstellung");
  if (stufe === "kopf") kette.setAttribute("bis", "0");
  else kette.removeAttribute("bis");
}

// --- Schwamm und Kreide ------------------------------------------------------------------------------
/** Gelber Küchenschwamm mit grüner Scheuerseite, unten weiß von Kreide (von schräg oben). */
const SCHWAMM = `<svg viewBox="0 0 120 80"><path d="M14 30 Q14 18 26 18 L96 14 Q108 14 108 26 L108 50 Q108 62 96 62 L26 66 Q14 66 14 54 Z" fill="#F2C94C" stroke="#3B2A6B" stroke-width="3"/>
  <path d="M14 30 Q14 18 26 18 L96 14 Q108 14 108 26 L108 32 L14 36 Z" fill="#4E9A54" stroke="#3B2A6B" stroke-width="3" stroke-linejoin="round"/>
  <g fill="#D9A92E"><circle cx="34" cy="48" r="3"/><circle cx="52" cy="54" r="2.4"/><circle cx="70" cy="46" r="3.2"/><circle cx="88" cy="52" r="2.6"/><circle cx="44" cy="58" r="1.8"/><circle cx="80" cy="58" r="2"/></g>
  <path d="M18 58 Q50 70 104 56" stroke="#FBF8F1" stroke-width="6" stroke-linecap="round" fill="none" opacity="0.85"/></svg>`;
/** Dickes Stück Straßenkreide in der Farbe der Reihe, die Spitze unten weiß bestäubt. @param {string} farbe */
const KREIDE_STUECK = (farbe) => `<svg viewBox="0 0 120 80"><g transform="rotate(-32 60 40)"><rect x="22" y="26" width="76" height="28" rx="12" fill="${farbe}" stroke="#3B2A6B" stroke-width="3"/>
  <rect x="30" y="30" width="56" height="6" rx="3" fill="#fff" opacity="0.35"/><path d="M22 34 Q14 40 22 46" stroke="#FBF8F1" stroke-width="5" fill="none" stroke-linecap="round"/></g></svg>`;

/** Zeigt Schwamm oder Kreide (Farbe der Reihe n). @param {"schwamm" | "kreide"} art */
function nimmWerkzeug(art) {
  werkzeug.innerHTML = art === "schwamm" ? SCHWAMM : KREIDE_STUECK(farbeVon(n));
  werkzeug.hidden = false;
}
function legeWerkzeugWeg() {
  werkzeug.getAnimations().forEach((a) => a.cancel());
  werkzeug.hidden = true;
}
/** Montessori-Farbe der Reihe (wie die Perlen der Kreidekette). @param {number | null} r */
function farbeVon(r) {
  return LERNFARBE.perle[/** @type {keyof typeof LERNFARBE.perle} */ (r ?? 1)] ?? "#fff";
}
/**
 * Schwamm oder Kreide gehen einmal über Stäbchen k (vorwärts von links, rückwärts von rechts), vorn vor Lenas Füßen.
 * @param {number} k @param {boolean} rueckwaerts @param {number} ms
 */
function strichUeber(k, rueckwaerts, ms) {
  const o = kette.stabOrt(k);
  if (!o || wenigBewegung()) return Promise.resolve();
  const vorn = 2.2 * o.s * remPx();
  const [a, e] = rueckwaerts ? [o.ende, o.anfang] : [o.anfang, o.ende];
  const t = (/** @type {{ x: number, y: number }} */ p, /** @type {number} */ w) => `translate(${p.x.toFixed(1)}px, ${(p.y + vorn).toFixed(1)}px) scale(${o.s.toFixed(3)}) rotate(${w}deg)`;
  const mitte = { x: (a.x + e.x) / 2, y: (a.y + e.y) / 2 - 0.6 * remPx() };
  return werkzeug.animate([
    { transform: t(a, -6) },
    { transform: t(mitte, 5), offset: 0.5 },
    { transform: t(e, -4) },
  ], { duration: ms, easing: "ease-in-out", fill: "forwards" }).finished.catch(() => undefined);
}

/** Die Szene eines Wechsels wurde durch Tippen abgekürzt: der Rest geschieht sofort. */
let abgekuerzt = false;

/**
 * Lena hüpft die Stäbchen der Folge ab; auf jedem geht das Werkzeug darüber und tut seine Arbeit (je Stäbchen etwa
 * STAB_MS, zehn zusammen etwa 1,5 s). Rückwärts schaut sie nach links. Abgekürzt: der Rest sofort.
 * @param {number[]} folge @param {"schwamm" | "kreide"} art @param {(k: number, sofort: boolean) => Promise<void> | void} aufStab
 */
async function geheAb(folge, art, aufStab) {
  const rueckwaerts = folge.length > 1 && folge[1] < folge[0];
  if (abgekuerzt || wenigBewegung()) {
    for (const k of folge) await aufStab(k, true);
    return;
  }
  spiegel = rueckwaerts;
  nimmWerkzeug(art);
  lena.haltung("zeigen", { ms: 140 });
  try {
    for (const k of folge) {
      if (abgekuerzt) {
        await aufStab(k, true);
        continue;
      }
      const h = lenaHuepft(k, { folge: [k], ms: STAB_MS });
      laufend.push(h.ueberspringe);
      await Promise.all([h.fertig, strichUeber(k, rueckwaerts, STAB_MS), aufStab(k, false)]);
    }
  } finally {
    legeWerkzeugWeg();
  }
}

/** Stäbchenliste als Attributwert. @param {Iterable<number>} l */
const alsListe = (l) => [...l].sort((x, y) => x - y).join(" ");

/** Lena wischt die ganze Kette weg (vorwärts, Schwamm). */
async function wischeKette() {
  const da = sichtbareStaebchen();
  if (!da.length) return;
  await lenaZumStart();
  const weg = new Set(ALLE.filter((k) => !da.includes(k)));
  kette.setAttribute("weg", alsListe(weg));
  kette.removeAttribute("bis");
  await geheAb(da, "schwamm", async (k, sofort) => {
    if (!sofort) await kette.wische(k, { ganz: true, ms: STAB_MS });
    weg.add(k);
    kette.setAttribute("weg", alsListe(weg));
  });
}

/** Die beim Hüpfen entstandene Kette (Stufe kopf) geht schnell zurück, Stäbchen für Stäbchen (ohne Schwamm, wie gebaut). */
async function rolleEin() {
  const da = sichtbareStaebchen();
  if (!da.length) return kette.setAttribute("bis", "0");
  kette.removeAttribute("verdeckt");
  for (let k = Math.max(...da) - 1; k >= 0; k--) {
    kette.setAttribute("bis", String(k));
    if (!abgekuerzt && !wenigBewegung()) await warte(18);
  }
}

/**
 * Lena malt die Kette von b in der Stufe hin (mit Perlen oder als leere Kästchen); steht sie hinten (nach dem
 * Wegwischen), malt sie rückwärts zurück zum Start. @param {number} b @param {string} stufe
 */
async function maleKette(b, stufe) {
  const weg = new Set(ALLE);
  kette.setAttribute("weg", alsListe(weg));
  kettenWechsel(b);
  kette.removeAttribute("bis");
  kette.toggleAttribute("verdeckt", stufe === "vorstellung");
  const rueckwaerts = lenaBei >= 6;
  await geheAb(rueckwaerts ? [...ALLE].reverse() : ALLE, "kreide", (k) => {
    weg.delete(k);
    kette.setAttribute("weg", alsListe(weg));
  });
}

/** Lena wischt die Perlen weg (material → vorstellung): die Kästchen bleiben sauber stehen. */
async function wischePerlen() {
  await lenaZumStart();
  const mit = new Set(ALLE);
  await geheAb(ALLE, "schwamm", async (k, sofort) => {
    if (!sofort) await kette.wische(k, { ms: STAB_MS });
    mit.delete(k);
    kette.setAttribute("perlen", alsListe(mit));
  });
}

/** Lena malt die Perlen wieder in die Kästchen (vorstellung → material). */
async function malePerlen() {
  await lenaZumStart();
  const mit = new Set();
  kette.setAttribute("perlen", "");
  kette.removeAttribute("verdeckt");
  await geheAb(ALLE, "kreide", (k) => {
    mit.add(k);
    kette.setAttribute("perlen", alsListe(mit));
  });
}

// --- Lena ------------------------------------------------------------------------------------------
/** Fußpunkt im Feld der Figur (spiele/runde: viewBox 320 × 280, Fuß bei 160, 254). */
const FUSS = 254 / 280;
lenaKoerper.innerHTML = Runde.zeichne("lena", { haltung: "stehen", blick: "rechts" });
const lena = Runde.steuere(lenaKoerper.querySelector("svg"));

/**
 * Lena steht mit den Füßen auf p (px) und ist so groß, wie die Tiefe der Straße dort sagt (p.s; vorn 1).
 * @param {{ x: number, y: number, s: number }} p @param {number} [hoch] px über dem Punkt
 */
const lenaTransform = (p, hoch = 0) => `translate(${(p.x - lenaEl.offsetWidth / 2).toFixed(1)}px, ${(p.y - lenaEl.offsetHeight * FUSS - hoch).toFixed(1)}px) scale(${(spiegel ? -p.s : p.s).toFixed(3)}, ${p.s.toFixed(3)})`;
/** Lena schaut nach links (sie malt die neue Kette rückwärts, von Stäbchen 10 zurück zum Start). */
let spiegel = false;
/** Wo Lena zuletzt stand (px): der nächste Hüpfer beginnt dort, auch wenn die Kette inzwischen eine andere ist. @type {{ x: number, y: number, s: number } | null} */
let lenaP = null;
/** Schatten am Boden unter Lena (kleiner und blasser, je höher sie ist). @param {{ x: number, y: number, s: number }} p @param {number} [luft] 0 … 1 */
const schattenTransform = (p, luft = 0) => `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) scale(${(p.s * (1 - 0.35 * luft)).toFixed(3)}, ${(p.s * p.s * (1 - 0.35 * luft)).toFixed(3)})`;

/** Lena steht auf Stäbchen k (0: Startplatz), ohne Bewegung. @param {number} k */
function stelleLena(k) {
  const p = kette.standPunkt(k);
  if (!p) return;
  lenaBei = k;
  lenaP = p;
  lenaEl.getAnimations().forEach((a) => a.cancel());
  schatten.getAnimations().forEach((a) => a.cancel());
  lenaEl.style.transform = lenaTransform(p);
  schatten.style.transform = schattenTransform(p);
  schatten.style.opacity = "1";
}

/**
 * Lena hüpft von Stäbchen `von` Stäbchen für Stäbchen bis `bis` (Bogen, beim Abspringen geduckt, Landung gestaucht).
 * Rückwärts (bis < von): ein großer Bogen. beiLandung(k) nach jeder Landung (Ton, Leuchten, Kette rollt aus).
 * folge: eigene Folge von Stäbchen (Wischen und Malen), ms: Dauer je Hüpfer statt zeiten.
 * @param {number} bis @param {{ zeiten?: number[], folge?: number[], ms?: number, vorher?: (k: number) => void, beiLandung?: (k: number) => void }} [o]
 * @returns {{ fertig: Promise<void>, gelandet: Promise<void>, ueberspringe: () => void }} gelandet: nach der letzten
 *   Landung, vor dem Nachfedern (dort darf die nächste Bewegung schon beginnen)
 */
function lenaHuepft(bis, { zeiten = [], folge, ms: jeMs, vorher = () => {}, beiLandung = () => {} } = {}) {
  const von = lenaBei;
  const schritte = folge ?? (bis >= von ? Array.from({ length: bis - von }, (_, i) => von + i + 1) : [bis]);
  let aus = false;
  let i = 0;
  /** @type {Animation[]} */
  let jetzt = [];
  /** @type {() => void} */
  let lande = () => {};
  const gelandet = new Promise((ok) => { lande = () => ok(undefined); });
  const ende = () => {
    lande();
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
      const p0 = lenaP ?? kette.standPunkt(lenaBei);
      const p1 = kette.standPunkt(k);
      if (!p0 || !p1) break;
      vorher(k);
      const zurueck = !folge && k < lenaBei;
      const reihenwechsel = Math.abs(p1.y - p0.y) > 1;
      const ms = jeMs ? (reihenwechsel ? jeMs * 1.8 : jeMs) : zurueck ? 360 : zeiten[k - 1] ?? 220;
      // Bogen: auf derselben Reihe 2,5 rem plus ein wenig je Weite; in die andere Reihe und zurück an den Start ein
      // flacher großer Bogen (nie bis in die Blase).
      const sm = (p0.s + p1.s) / 2;
      const hoch = (reihenwechsel || zurueck ? 7 : jeMs ? 2.6 : Math.min(7, 4.5 + Math.abs(p1.x - p0.x) / rem * 0.12)) * rem * sm;
      const mitte = { x: (p0.x + p1.x) / 2, y: reihenwechsel || zurueck ? Math.min(p0.y, p1.y) : (p0.y + p1.y) / 2, s: sm };
      const boden = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2, s: sm };
      jetzt = [
        lenaEl.animate([
          { transform: lenaTransform(p0), easing: "ease-out" },
          { transform: lenaTransform(mitte, hoch), offset: 0.5, easing: "ease-in" },
          { transform: lenaTransform(p1) },
        ], { duration: ms, fill: "forwards" }),
        schatten.animate([
          { transform: schattenTransform(p0), opacity: 1 },
          { transform: schattenTransform(boden, 1), opacity: 0.55, offset: 0.5 },
          { transform: schattenTransform(p1), opacity: 1 },
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
      schatten.style.transform = schattenTransform(p1);
      jetzt.forEach((a) => a.cancel());
      lenaBei = k;
      lenaP = p1;
      if (!zurueck) kette.staub(p1.x, p1.y, p1.s);
      beiLandung(k);
    }
    lande();
    if (aus) return;
    // Nach der letzten Landung federt sie zurück.
    const zurueck = lenaKoerper.animate([{ transform: "scale(1.09, 0.88)" }, { transform: "scale(0.98, 1.03)", offset: 0.6 }, { transform: "scale(1, 1)" }], { duration: 160 });
    jetzt = [zurueck];
    await zurueck.finished.catch(() => undefined);
    aus = true;
  })();
  return { fertig: fertig.finally(lande), gelandet, ueberspringe: ende };
}

/** Der Heimweg zum Start läuft noch (die neue Aufgabe steht schon da): springt ans Ende. @type {(() => void) | null} */
let heimweg = null;

/** Lena hüpft zurück an den Start (ein Bogen, 0,36 s) und steht still. */
function lenaZumStart() {
  lena.haltung("stehen", { ms: 200 });
  if (lenaBei === 0) return Promise.resolve();
  const h = lenaHuepft(0);
  laufend.push(h.ueberspringe);
  heimweg = h.ueberspringe;
  return h.fertig.then(() => {
    if (heimweg === h.ueberspringe) heimweg = null;
    lena.haltung("stehen", { ms: 160 });
  });
}

// --- Tafel und Pfeilchen im Flug -------------------------------------------------------------------
/** Die Aufgabe auf der Tafel, das Kärtchen leer. @param {number} a @param {number} b */
function zeigeAufgabe(a, b) {
  tafel.classList.remove("still");
  rechnung.textContent = `${a} · ${b} =`;
  setzeEingabe("");
}
/** @param {string} text */
function setzeEingabe(text) {
  karte.textContent = text || "0";
  karte.classList.toggle("leer", !text);
}

/**
 * Die getippte Zahl fliegt aus dem Kästchen der Aufgabe an ihren Platz an der Kette (Mitte des Kreide-Kästchens
 * `ziel`) und wird dabei so klein, wie die Tiefe der Straße dort sagt.
 * @param {string} text @param {{ x: number, y: number, rem: number, s: number, schrift?: number } | null} ziel
 * @param {{ hohl?: boolean }} [o] @returns {{ fertig: Promise<void>, ueberspringe: () => void }}
 */
function fliege(text, ziel, { hohl = false } = {}) {
  const start = karte.getBoundingClientRect();
  setzeEingabe("");
  if (!ziel || wenigBewegung()) return { fertig: Promise.resolve(), ueberspringe: () => {} };
  const r = ziel.rem;
  const el = document.createElement("div");
  el.className = `flug${hohl ? " hohl" : ""}`;
  el.textContent = text;
  const schrift = 6 * r; // wie im Kästchen der Aufgabe
  el.style.fontSize = `${schrift}px`;
  figurenLage.append(el);
  const b = el.offsetWidth;
  const h = el.offsetHeight;
  const f1 = ((ziel.schrift ?? 5.4 * ziel.s) * r) / schrift; // Schrift des Kreide-Kästchens
  const x0 = start.left + start.width / 2 - b / 2;
  const y0 = start.top + start.height / 2 - h / 2;
  const x1 = ziel.x - b / 2;
  const y1 = ziel.y - h / 2;
  const a = el.animate([
    { transform: `translate(${x0}px, ${y0}px) scale(1)`, easing: "ease-out" },
    { transform: `translate(${(x0 + x1) / 2}px, ${Math.min(y0, y1) - 4 * r}px) scale(${(1 + f1) / 2}) rotate(-8deg)`, offset: 0.45, easing: "ease-in" },
    { transform: `translate(${x1}px, ${y1}px) scale(${f1})` },
  ], { duration: 320, fill: "forwards" });
  const weg = () => el.remove();
  return { fertig: a.finished.then(weg, weg), ueberspringe: () => { a.cancel(); weg(); } };
}

// --- Die Wirkungen ---------------------------------------------------------------------------------
/** Kopf: vor dem Tipp keine Kette; nach Fertig rollt unter jedem Hüpfer ein Stäbchen aus. */
let kopfStufe = false;

/**
 * Lena hüpft a Stäbchen (wenn sie nicht schon dort steht), Ton und Leuchten je Hüpfer; in Kopf rollt die Kette dabei aus.
 * @param {number} a @returns {{ fertig: Promise<void>, gelandet: Promise<void> }}
 */
function hinHuepfen(a) {
  heimweg?.(); // tippt das Kind schnell, ist Lena noch auf dem Heimweg: sie steht sofort am Start
  heimweg = null;
  if (lenaBei === a) return { fertig: Promise.resolve(), gelandet: Promise.resolve() };
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
  return h;
}

/**
 * Richtig: Lena hüpft hin; mit der letzten Landung fliegt das Pfeilchen an ihr Stäbchen und rastet ein, und Lena freut
 * sich zugleich (oder ein Witz) – die Folge bleibt so unter etwa 2,5 s (Regeln §1).
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
  const freueDich = () => {
    const w = witz(a, ++seitWitz);
    const bewegung = w ?? naechsteFreude(vorigeFreude);
    if (w) seitWitz = 0;
    else vorigeFreude = bewegung;
    lenaEl.dataset.freude = bewegung;
    const fertig = lena.bewegung(bewegung);
    laufend.push(() => lena.halt());
    return fertig;
  };
  const ablauf = (async () => {
    const h = hinHuepfen(a);
    await h.gelandet;
    if (gesetzt) return;
    const f = fliege(String(c), kette.pfeilPunkt(a));
    laufend.push(f.ueberspringe);
    const gefreut = freude ? freueDich() : Promise.resolve();
    await f.fertig;
    if (!gesetzt) {
      setze();
      kette.einrasten(a);
      klang.plopp();
      if (satz) letzterSatz = erzaehler.gleichung(a, b).catch(() => undefined);
    }
    await Promise.all([gefreut, h.fertig]);
  })();
  return ablauf;
}

/** Bis zu welchem Stäbchen die Kette in Kopf steht, wenn w gezeigt wird (a gehüpft, w liegt auf Stäbchen ⌈w / n⌉). @param {number} a @param {number} w */
const bisZu = (a, w) => Math.max(a, Math.min(10, Math.ceil(w / n)));

/**
 * Daneben: Lena hüpft trotzdem a Stäbchen, unter ihr hängt ein „?“; das Pfeilchen der getippten Zahl fliegt hohl an
 * den Ort, wo sie wirklich liegt, und wackelt; Lena staunt hin. Nie reizvoller als richtig (N7).
 * @param {number} a @param {number} w getippt @param {boolean} kopfZu Kopf ohne Hilfe: die Kette malt sich bis zur Zahl weiter
 */
function wirkungDaneben(a, w, kopfZu) {
  let gesetzt = false;
  const setze = () => {
    if (gesetzt) return;
    gesetzt = true;
    if (kopfZu) kette.setAttribute("bis", String(bisZu(a, w)));
    kette.setAttribute("frage", String(a));
    kette.setAttribute("hohl", String(w));
    lena.haltung("staunen", { ms: 220 });
  };
  laufend.push(setze);
  return (async () => {
    await hinHuepfen(a).gelandet;
    if (gesetzt) return;
    // Kopf: dasselbe Bild wie beim Hüpfen (Felder mit Perlen); die Kette malt sich bis zum Feld der getippten Zahl weiter.
    if (kopfZu) kette.setAttribute("bis", String(bisZu(a, w)));
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
  kettenWechsel(b); // gewechselt (sichtbar) hat schon bereiteBild im RAHMEN; hier nur zur Sicherheit

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
    for (const x of ["leer", "frage", "hohl", "markiert", "hell", "ring", "perlen", "weg"]) kette.removeAttribute(x);
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
    /** Nach der Einführung über „Anleitung“: die Kette kommt sichtbar in ihre Stufe zurück, die Aufgabe steht wieder da. */
    async zeigeWieder() {
      await bereiteBild(b, stufe);
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
      if (hilfeStufe === 1) return h.kern === null ? erzaehler.einStaebchen() : erzaehler.gleichung(h.kern, b, true);
      // Lösung: die nächste Taste im Sonnenring; das Kind tippt selbst (L12).
      loesungGezeigt = true;
      markiereNaechste();
      return erzaehler.gleichung(a, b, true);
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
 * Vor einer Aufgabe: Wechseln Reihe oder Stufe, geschieht es sichtbar in einer kurzen Szene (Christian 2026-11-15,
 * Regeln §8): Lena wischt mit dem Schwamm weg und malt mit Kreide hin, Feld für Feld, dazu höchstens ein Satz. Erst
 * danach erscheint die Aufgabe (die Zeit läuft erst dann). Ein Tipp irgendwo (oder Enter) kürzt die Szene ab, auch das
 * Warten auf den Satz davor. Danach bleibt die Stufe, bis die Lernsteuerung eine andere verlangt. Ohne Wechsel (oder
 * nur mit Einrollen in Stufe kopf) hüpft Lena erst mit der neuen Aufgabe heim, nicht davor (der Takt bleibt kurz).
 * @param {number} b Reihe der nächsten Aufgabe @param {string} stufe ihre Stufe @param {{ satz?: boolean }} [o]
 */
async function bereiteBild(b, stufe, { satz = true } = {}) {
  stand.phase = "folge";
  ueberspringeAlles();
  rechnung.textContent = "";
  setzeEingabe("");
  tafel.classList.add("still"); // während der Szene keine Aufgabe (die nächste kommt danach)
  kopfStufe = false;
  const plan = bildWechsel({ n, stufe: bildStufe }, { n: b, stufe });
  abgekuerzt = false;
  /** @type {() => void} */
  let getippt = () => {};
  const tipp = new Promise((ok) => { getippt = () => ok(undefined); });
  const abmelden = beimTippen(() => {
    abgekuerzt = true;
    ueberspringeAlles();
    getippt();
  });
  const nurHeim = plan.schritte.every((x) => x === "einrollen");
  try {
    let gesagt = Promise.resolve();
    if (satz && plan.satz) {
      await Promise.race([letzterSatz, tipp]);
      gesagt = (plan.satz === "jetzt" ? erzaehler.jetzt(b) : erzaehler.wechsel(plan.satz)).catch(() => undefined);
    }
    const szene = (async () => {
      for (const schritt of plan.schritte) {
        if (schritt === "kette-weg") await wischeKette();
        else if (schritt === "einrollen") await rolleEin();
        else if (schritt === "perlen-weg") await wischePerlen();
        else if (schritt === "perlen-hin") await malePerlen();
        else if (schritt === "kette-hin") await maleKette(b, stufe);
      }
      kettenWechsel(b);
      setzeStufe(stufe);
      bildStufe = stufe;
      if (nurHeim) return; // Lena hüpft mit der Aufgabe heim (stelleAufgabe)
      await lenaZumStart();
      spiegel = false;
      stelleLena(0);
    })();
    // Der Satz steht, bis er gesprochen ist (mindestens WECHSEL_SATZ_MS, wenn es einen gibt); ein Tipp kürzt ab.
    const satzZeit = satz && plan.satz ? Promise.race([Promise.all([gesagt, warte(WECHSEL_SATZ_MS)]), tipp]) : Promise.resolve();
    await Promise.all([szene, satzZeit]);
  } finally {
    abmelden();
    abgekuerzt = false;
  }
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

/** Spielt die Einführung auf der Kette von b, in der Stufe der ersten Aufgabe (in Kopf wächst die Kette erst beim Hüpfen). @param {number} b @param {string} [stufe] */
async function einfuehrung(b, stufe = "material") {
  einfuehrungLaeuft = true;
  try {
    // Die Kette der Einführung kommt sichtbar (Lena malt sie hin oder wischt, was nicht passt; ohne Satz).
    await bereiteBild(b, stufe, { satz: false });
    kopfStufe = stufe === "kopf";
    stand.phase = "einfuehrung";
    lena.haltung("stehen", { ms: 0 });
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
    if (kopfStufe) await rolleEin();
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
/** @type {{ zuege: () => any[], richtigerZug: () => any, zeigeWieder: () => Promise<void> } | null} */
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
// ein Tipp irgendwo (oder Enter) überspringt beides, dann kommt die nächste Aufgabe.
function warteFolge() {
  return new Promise((ok) => {
    let vorbei = false;
    const fertig = () => {
      if (vorbei) return;
      vorbei = true;
      clearTimeout(uhr);
      abmelden();
      ok(undefined);
    };
    const uhr = setTimeout(fertig, FOLGE_MAX_MS + NACH_WIRKUNG_MS);
    const abmelden = beimTippen(fertig);
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

/** Name eines Themas des Lernplans (für die Leiste, wenn eine Aufgabe einer anderen Reihe kommt). @param {string | undefined} id */
const themaName = (id) => (id ? ctx?.plan?.themen?.find((/** @type {any} */ t) => t.id === id)?.name ?? null : null);

/** Die Einführung lief schon (sie kommt bei jedem Start einmal, danach über „Anleitung“). */
let einfuehrungGespielt = false;

// „Anleitung“: die Einführung im Spielbild jederzeit wieder (während einer Aufgabe); danach steht die Aufgabe wieder da.
$("anleitung")?.addEventListener("click", async () => {
  if (stand.phase !== "aufgabe" || einfuehrungLaeuft || n === null) return;
  const merke = { n, geloest: new Set(geloest), aufgabe: offeneAufgabe };
  await einfuehrung(n, stand.lernstufe === "kopf" ? "kopf" : "material");
  geloest = merke.geloest;
  await merke.aufgabe?.zeigeWieder();
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

  /** Aufgaben, die in dieser Runde nicht passten oder Hilfe brauchten (kommen als Wiedervorlage; nie getauscht). */
  const wieder = new Set();
  const beginn = Date.now();
  const zeitDa = () => Date.now() - beginn < rundenMs() - Math.min(LETZTE_AUFGABE_MS, rundenMs() / 4);
  const naechste = () => (zeitDa() ? waehleAufgabe(aufStufe(r.naechste()), n, wieder) : null);
  let aufgabe = naechste();
  if (!aufgabe && vorschau) {
    r = vorschauRunde();
    aufgabe = naechste();
  }
  leiste.setAttribute("thema", r.thema);

  // Das Spiel beginnt mit der Einführung im echten Spielbild (bei jedem Start; in der Vorschau nur mit ?einfuehrung).
  const erste = malAus(aufgabe?.ziel?.key);
  if (!einfuehrungGespielt && erste && (!vorschau || params.has("einfuehrung"))) {
    einfuehrungGespielt = true;
    await einfuehrung(einfuehrungsKette(erste.a, erste.b), aufgabe?.stufe === "kopf" ? "kopf" : "material");
    r.einfuehrungGesehen();
  }
  $("anleitung")?.removeAttribute("hidden");

  // Rundenanfang: die Pfeilchen der vorigen Runde gehen mit (die Pause lag darüber); kein Satz – die Leiste nennt
  // das Thema (Christian, 2026-11-15).
  geloest = new Set();
  kette.removeAttribute("pfeile");
  while (aufgabe) {
    raeumeAuf();
    const z = malAus(aufgabe.ziel.key);
    if (z) {
      // Die Leiste nennt das Thema der Aufgabe (eine Wiederholung einer anderen Reihe kommt mit ihrer Kette).
      leiste.setAttribute("thema", themaName(aufgabe.ziel.thema) ?? r.thema);
      await bereiteBild(z.b, aufgabe.stufe ?? "material");
    }
    const e = await spieleAufgabe(aufgabe);
    const ergebnis = { key: e.key, ok: e.versuche === 0, hilfe: e.hilfe, ms: e.ms };
    if (!ergebnis.ok || ergebnis.hilfe) wieder.add(e.key);
    r.melde(e.key, ergebnis);
    document.dispatchEvent(new CustomEvent("ls-ergebnis", { detail: ergebnis })); // für die Browser-Prüfung
    await warteFolge();
    aufgabe = naechste();
  }

  raeumeAuf();
  await letzterSatz;
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
