// S18 Selbst schreiben (Idee: docs/spiele/schreiben/s18-selbst-schreiben-strichfolge-sehen-frei-schreiben.md, Karte „Kreidebahn“).
// Auf dem Schulhof ist ein Buchstabenhaus mit Kreide aufs Pflaster gemalt. Lena legt vor: Ihr Roller malt mit einem Kreidestück die
// Spur (gepunktet, mit großem Startpunkt). Das Kind zieht den Schwung, den Buchstaben oder die Ziffer mit dem Finger in die Zeile.
// Ela fährt genau diese Linie ab, in der Reihenfolge und Richtung, wie sie gezogen wurde; das Zeichen fliegt an das Hof-Schild.
// Stimmt es nicht, fährt Lena ihre Vorlage zugleich darauf, und man sieht, wo es anders losgeht (Gegenverkehr, anderer Bogen).
//
// Aufbau wie die Spielvorlage (spiele/vorlage/spiel.js, dort die Schritte zum eigenen Spiel):
//   SPIELWELT  Kennung, Aufgabenarten, Sätze des Erzählers, Klänge
//   AUFGABE    Blatt, Ela und Lena, Linie des Kindes, Wirkungen (richtig, daneben), Hilfe-Stufen
//   EINFÜHRUNG im echten Spielbild (docs/spielbau.md §8): Lena fährt i vor, das Kind schreibt es
//   RAHMEN     aus der Vorlage; die Lernsteuerung bestimmt die Länge der Runde
//
// Vorschau-Parameter wie in der Vorlage (?pause, ?hinweis, ?eltern, ?einfuehrung, ?thema=, ?pruefen, ?stufe=).

import "../../rahmen/leiste.js";
import "../../rahmen/blase.js";
import "../../rahmen/hilfe.js";
import "../../rahmen/pause.js";
import "../../rahmen/knopf.js";
import * as Runde from "../../runde/runde.js";
import { meldePruefSchnittstelle, testbetrieb, fuehreAus as standardZug } from "../../rahmen/pruefen.js";
import { einfuehrungsLauf } from "../../rahmen/einfuehrung-lauf.js";
import { sperreTouch, protokoll, esc } from "../../lernspiel.js";
import { sprich } from "../../kern/stimme.js";
import { runde, einmal } from "../../lernsteuerung.js";
import { starteSpielzeit, amRundenende, sage } from "../../rahmen/spielzeit.js";
import { aufgabenVon } from "../../aufgabenarten.js";
import { zeichenMit } from "../../woerter/schriftzeichen.js";
import { TIPP, saeubere } from "../../schrift/erkennen.js";
import {
  BREITE, HOEHE, mitLineatur, vorlageImBlatt, startVon, satzZu, fahrplan, ortZu, begegnung, fahrtZeit, aufKind,
  pruefZug, pruefZuege, erkenne, bereit, laenge,
} from "./logik.js";

sperreTouch();

const $ = (/** @type {string} */ id) => /** @type {any} */ (document.getElementById(id));
const leiste = $("leiste");
const blase = $("blase");
const hilfe = $("hilfe");
const pause = $("pause");
const flaeche = /** @type {HTMLElement} */ (document.querySelector(".spielflaeche"));
const feld = $("feld");
const zeile = $("zeile");
const haus = $("haus");
const spurLena = $("spur-lena");
const spurFest = $("spur-fest");
const spurKind = $("spur-kind");
const startEl = $("startpunkt");
const plaetze = $("plaetze");
const fluege = $("fluege");
const NS = "http://www.w3.org/2000/svg";

// =====================================================================================================
// SPIELWELT
// =====================================================================================================

/** Kennung des Spiels: steht einmal in der HTML-Datei an <ls-leiste spiel>. */
const SPIEL_ID = leiste.getAttribute("spiel");

/** Aufgabenarten (gilt nur, solange das Spiel nicht in spiele.json steht; dort steht dasselbe). */
const ARTEN = [{ art: "schreiben", stufen: ["material", "vorstellung", "kopf"] }];

/** Nach der Wirkung noch so lange, dann kommt die nächste Aufgabe (Tippen überspringt). */
const NACH_WIRKUNG_MS = 80;
/** Längstens so lange wartet die Folge auf das Ende der Wirkung (Idee §1: etwa 2,5 s, höchstens 3 s). */
const FOLGE_MAX_MS = 4200;

/** Nur Vorschau: Aufgaben, falls die Lernsteuerung nichts liefert. */
const VORSCHAU = { thema: "Schwünge und Buchstaben", aufgaben: ["schreiben:o", "schreiben:i", "schreiben:schwung-girlande", "schreiben:d"] };

/** Sätze aus Daten (der Laut oder Name je Zeichen, texte.json). */
const TEXTE = await fetch(new URL("texte.json", import.meta.url)).then((r) => r.json()).catch(() => null);

/** Die Daten einer Aufgabe aus ihrem Schlüssel (Vorschau, Einführung). @param {string} key */
const datenAus = (key) => aufgabenVon({ art: "schreiben", zeichen: [String(key).replace(/^schreiben:/, "")] })[0]?.daten ?? null;

/** @param {string | undefined} text @param {any} [o] */
const sagenText = (text, o) => (text ? blase.sage(text, o) : Promise.resolve("still"));

/** Der Erzähler (docs/stimme.md): beschreibt, was zu sehen ist, nie ein Urteil (grundsaetze.md 3.2). Jeder Satz eine feste Zeichenkette. */
const erzaehler = {
  /** Der Laut oder Name des Zeichens. @param {any} daten @param {boolean} sprechen */
  aufgabe: (daten, sprechen) => sagenText(TEXTE?.aufgabe?.[daten.zeichen], { sprechen }),
  /** Was Lena sieht, wenn die Spur des Kindes anders ist (Idee §4). @param {"andersherum" | "bogen" | "oben" | "stab" | "anders"} art */
  daneben: (art) => (art === "andersherum" ? blase.sage("Lena fährt andersherum.")
    : art === "bogen" ? blase.sage("Lenas Bogen liegt auf der anderen Seite.")
      : art === "oben" ? blase.sage("Lena fängt oben an.")
        : art === "stab" ? blase.sage("Lena fährt zuerst den Stab.")
          : blase.sage("Lenas Spur sieht anders aus.")),
  nochmal: () => blase.sage("Versuch es noch einmal."),
  /** Hilfe 1: eine Probe, nicht die Lösung. */
  zeigtStart: () => blase.sage("Lena zeigt, wo es losgeht.", { zeigen: true }),
  /** Hilfe 2: die Lösung, das Kind führt aus. */
  fahrtLangsam: () => blase.sage("Lena fährt langsam vor.", { zeigen: true }),
  /** Die Stufe wechselt (Regeln §8: Lena fegt ihre Spur weg). @param {"tipp" | "laut"} w */
  wechsel: (w) => (w === "tipp" ? blase.sage("Jetzt fährt Lena nur auf Tipp vor.", { zeigen: true }) : blase.sage("Jetzt hörst du nur den Laut.", { zeigen: true })),
  gehtNicht: () => blase.sage("Das Spiel geht gerade nicht."),
};

/** Die Sätze der Einführung (docs/spielbau.md §8): in Ruhe, als kleine Geschichte, am Beispiel i. */
const einleitung = {
  hof: (/** @type {any} */ o) => blase.sage("Ela und Lena fahren Roller auf dem Hof.", o),
  spur: (/** @type {any} */ o) => blase.sage("Lenas Roller malt eine Kreidespur.", o),
  oben: (/** @type {any} */ o) => blase.sage("Lena fängt oben an.", o),
  punkt: (/** @type {any} */ o) => blase.sage("Sie setzt ab und macht den Punkt.", o),
  ela: (/** @type {any} */ o) => blase.sage("Ela fährt nur, was du malst.", o),
  finger: (/** @type {any} */ o) => blase.sage("Leg den Finger auf den großen Punkt.", o),
  zieh: (/** @type {any} */ o) => blase.sage("Zieh die Linie wie Lena.", o),
  schild: (/** @type {any} */ o) => blase.sage("Das i kommt an das Schild.", o),
  mitfahren: (/** @type {any} */ o) => blase.sage("Ist deine Spur anders, fährt Lena mit.", o),
  nochmal: (/** @type {any} */ o) => blase.sage("Dann probierst du es einfach noch einmal.", o),
  lernen: (/** @type {any} */ o) => blase.sage("So lernst du, wo ein i anfängt.", o),
  los: (/** @type {any} */ o) => blase.sage("Jetzt geht es los.", o),
};

/** Elternansicht (?eltern): beschreibend, von Stärken aus, kein Vergleich (3.3). @param {HTMLElement} feldEltern */
function fuelleEltern(feldEltern) {
  feldEltern.innerHTML = `<p>Auf dem Schulhof ist ein Buchstabenhaus mit Kreide aufs Pflaster gemalt: oben das Dach, in der Mitte das
    Erdgeschoss, unten der Keller. Ihr Kind schreibt mit dem Finger einen Schwung, einen Buchstaben oder eine Ziffer hinein. Ela
    fährt genau diese Linie mit dem Roller ab, in der Reihenfolge und Richtung, in der sie gezogen wurde, und das Zeichen kommt an
    das Hof-Schild. Lena legt vor: Ihr Roller malt die Strichfolge als gepunktete Spur mit einem großen Startpunkt.</p>
    <p>Geprüft werden Startpunkt, Richtung, Reihenfolge und grobe Form, nicht Schönheit, Strichdicke oder Tempo. Ist die Spur anders,
    fährt Lena ihre Vorlage zugleich auf Elas Spur: Beim o rechtsherum kommen sich die beiden entgegen, beim gespiegelten d
    liegt der Bogen auf der anderen Seite. Zuerst liegt Lenas Spur zum Nachspuren da, später fährt sie nur noch auf Tipp vor, und
    zuletzt hört Ihr Kind nur den Laut. Mit Stift und Papier schreiben bleibt die Einladung zum Mitmachen.</p>
    <p>Welche Zeichen dran sind und was Ihr Kind schon kann, steht bei den Themen im Elternbereich.</p>`;
}

/**
 * Pause (K1, K8): die Einladung zum Mitmachen mit Kreide, Sand und Stift (Idee §6).
 * @param {HTMLElement} karte @param {boolean} ton
 */
function fuelleSachmoment(karte, ton) {
  karte.replaceChildren();
  const bilder = document.createElement("div");
  bilder.className = "zettel";
  const kreide = `<svg viewBox="0 0 60 120"><rect x="16" y="10" width="28" height="100" rx="8" fill="#FFFCF7" stroke="#3B2A6B" stroke-width="5"/><rect x="16" y="78" width="28" height="32" rx="8" fill="#E8E3F0" stroke="#3B2A6B" stroke-width="5"/></svg>`;
  const sand = `<svg viewBox="0 0 140 120"><path d="M6 100 Q70 70 134 100 L134 112 L6 112 Z" fill="#F2C14E" stroke="#3B2A6B" stroke-width="5" stroke-linejoin="round"/><path d="M36 88 C50 70 70 108 84 84 C92 72 104 82 108 90" fill="none" stroke="#3B2A6B" stroke-width="6" stroke-linecap="round"/></svg>`;
  const stift = `<svg viewBox="0 0 60 140"><path d="M30 130 L18 100 L18 14 Q18 8 24 8 L36 8 Q42 8 42 14 L42 100 Z" fill="#F26B5B" stroke="#3B2A6B" stroke-width="5" stroke-linejoin="round"/><path d="M18 100 L42 100" stroke="#3B2A6B" stroke-width="5"/></svg>`;
  bilder.innerHTML = kreide + sand + stift;
  const satz = document.createElement("p");
  satz.textContent = "Probier es mit Kreide, Sand oder Stift.";
  karte.append(bilder, satz);
  if (ton) sprich("Probier es mit Kreide, Sand oder Stift.");
}

// --- Klänge (Web Audio, leise; Ton aus gilt) ---------------------------------------------------------
/** @type {AudioContext | null} */
let audio = null;
const kontext = () => {
  audio ??= new AudioContext();
  if (audio.state === "suspended") audio.resume().catch(() => {});
  return audio;
};
/** @param {number} hz @param {{ dauer?: number, typ?: OscillatorType, laut?: number, gleiten?: number, spaeter?: number }} [o] */
function ton(hz, { dauer = 0.13, typ = "triangle", laut = 0.07, gleiten = 0, spaeter = 0 } = {}) {
  if (!leiste.ton) return;
  try {
    const a = kontext();
    const t = a.currentTime + spaeter;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = typ;
    o.frequency.setValueAtTime(hz, t);
    if (gleiten) o.frequency.exponentialRampToValueAtTime(hz * gleiten, t + dauer);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(laut, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dauer);
    o.connect(g).connect(a.destination);
    o.start(t);
    o.stop(t + dauer + 0.03);
  } catch {
    // ohne Web Audio: still
  }
}
/** Gefiltertes Rauschen: Kreide auf Stein. @param {number} dauer s @param {number} hz Mitte des Filters @param {number} laut @param {number} [spaeter] */
function rauschen(dauer, hz, laut, spaeter = 0) {
  if (!leiste.ton) return;
  try {
    const a = kontext();
    const n = Math.max(1, Math.floor(a.sampleRate * dauer));
    const puffer = a.createBuffer(1, n, a.sampleRate);
    const d = puffer.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (0.55 + 0.45 * Math.sin(i / 90));
    const quelle = a.createBufferSource();
    quelle.buffer = puffer;
    const filter = a.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = hz;
    filter.Q.value = 0.9;
    const g = a.createGain();
    const t = a.currentTime + spaeter;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(laut, t + Math.min(0.05, dauer / 3));
    g.gain.setValueAtTime(laut, t + Math.max(0.05, dauer - 0.08));
    g.gain.linearRampToValueAtTime(0.0001, t + dauer);
    quelle.connect(filter).connect(g).connect(a.destination);
    quelle.start(t);
  } catch {
    // ohne Web Audio: still
  }
}
const klang = {
  /** Kreide-Rattern, Höhe nach Tempo (schnelle Linie: höher). @param {number} ms @param {number} [tempo] */
  rattern: (ms, tempo = 1) => rauschen(ms / 1000, 2300 + 900 * Math.min(2, tempo), 0.05),
  /** Weiches Bremsen an einer Spitze. */
  bremsen: () => rauschen(0.12, 1500, 0.035),
  /** Klingel am Roller: zwei helle Töne. */
  klingel: () => { ton(1976, { dauer: 0.16, typ: "sine", laut: 0.05 }); ton(2349, { dauer: 0.2, typ: "sine", laut: 0.05, spaeter: 0.12 }); },
  /** Das Zeichen rastet am Schild ein: weiches Plopp mit Überschwingen. */
  plopp: () => { ton(740, { dauer: 0.1, typ: "sine", laut: 0.1, gleiten: 0.55 }); ton(1100, { dauer: 0.06, typ: "sine", laut: 0.03, spaeter: 0.04 }); },
  /** Die Landung. */
  landen: () => ton(220, { dauer: 0.1, typ: "sine", laut: 0.07, gleiten: 0.6 }),
  /** Beide bremsen und staunen. */
  staunen: () => { ton(330, { dauer: 0.16, typ: "sine", laut: 0.05, gleiten: 1.4 }); ton(262, { dauer: 0.2, typ: "sine", laut: 0.04, spaeter: 0.12 }); },
};

// =====================================================================================================
// AUFGABE
// =====================================================================================================

const wenigBewegung = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// --- Läufe: jede Wirkung läuft in einem Lauf; Tippen und die nächste Aufgabe springen ans Ende ---------------
/** @typedef {{ skip: boolean, anims: Set<Animation>, uhren: Set<() => void> }} Lauf */
/** @type {Lauf} */
let lauf = { skip: false, anims: new Set(), uhren: new Set() };

/** Beginnt einen neuen Lauf (der alte springt ans Ende). @returns {Lauf} */
function neuerLauf() {
  ueberspringeAlles();
  lauf = { skip: wenigBewegung(), anims: new Set(), uhren: new Set() };
  return lauf;
}
/** Alles, was läuft, ist sofort im Endzustand; was danach kommt, ebenso. */
function ueberspringeAlles() {
  lauf.skip = true;
  for (const a of [...lauf.anims]) {
    try { a.finish(); } catch { /* schon fertig */ }
  }
  for (const f of [...lauf.uhren]) f();
}
/** Warten und Bewegen an einen bestimmten Lauf gebunden. @param {Lauf} L */
function mit(L) {
  /** @param {number} ms */
  const warte = (ms) => new Promise((ok) => {
    if (L.skip) return ok(undefined);
    const fertig = () => { clearTimeout(t); L.uhren.delete(fertig); ok(undefined); };
    const t = setTimeout(fertig, ms);
    L.uhren.add(fertig);
  });
  /**
   * Spielt eine Animation, setzt danach den Endzustand als Stil und räumt sie ab.
   * @param {HTMLElement | SVGElement} el @param {Keyframe[]} frames @param {number} ms @param {Partial<CSSStyleDeclaration>} [ende]
   * @param {{ easing?: string, verzoegerung?: number }} [o]
   */
  const bewege = async (el, frames, ms, ende = {}, { easing = "ease-in-out", verzoegerung = 0 } = {}) => {
    if (L.skip || typeof el.animate !== "function") {
      Object.assign(el.style, ende);
      return;
    }
    const a = el.animate(frames, { duration: ms, easing, delay: verzoegerung, fill: "forwards" });
    L.anims.add(a);
    await a.finished.catch(() => undefined);
    L.anims.delete(a);
    Object.assign(el.style, ende);
    a.cancel();
  };
  return { warte, bewege };
}

/** Tasten, die eine Folge oder Szene abkürzen (wie ein Tipp). */
const KUERZT = new Set(["Enter", " ", "Escape"]);
/**
 * Ruft fn beim nächsten Tipp irgendwo auf der Seite oder bei Enter, Leertaste, Escape (Regeln §1).
 * @param {() => void} fn @returns {() => void} abmelden
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

/** @typedef {[number, number]} Punkt */

// --- Das Blatt: Maße, Umrechnung zwischen Haus-Einheiten und Bildschirm ---------------------------------------
/** Pixel je Haus-Einheit und Lage des Blatts. */
function mass() {
  const r = feld.getBoundingClientRect();
  return { r, k: r.width / BREITE };
}
/** @param {Punkt} p Haus-Einheiten → Bildschirm */
function nachClient(p) {
  const { r, k } = mass();
  return { x: r.left + p[0] * k, y: r.top + p[1] * k };
}
/** @param {number} cx @param {number} cy @returns {Punkt} */
function vonClient(cx, cy) {
  const { r, k } = mass();
  return [(cx - r.left) / k, (cy - r.top) / k];
}

/** @param {string} tag @param {Record<string, string | number>} attr */
function svgEl(tag, attr) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attr)) el.setAttribute(k, String(v));
  return el;
}
/** Der Pfad eines Strichs; ein Punkt (Tupfer) wird ein kurzer Strich, damit die runde Kappe ihn zeigt. @param {Punkt[]} p */
const pfadD = (p) => (p.length === 1 ? `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)} l0.01 0` : `M${p.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L")}`);
const TINTE = "#3B2A6B";
const SPUR = "#6B5C96";

/** Das Buchstabenhaus: Dach, Erdgeschoss (am hellsten), Keller; Schwünge zuerst frei auf heller Fläche. @param {boolean} lineatur */
function zeichneHaus(lineatur) {
  haus.replaceChildren();
  const klammer = svgEl("clipPath", { id: "hausclip" });
  klammer.append(svgEl("rect", { width: BREITE, height: HOEHE, rx: 22 }));
  const g = svgEl("g", { "clip-path": "url(#hausclip)" });
  if (lineatur) {
    g.append(svgEl("rect", { x: 0, y: 0, width: BREITE, height: 100, fill: "#E6E1EF" }));
    g.append(svgEl("rect", { x: 0, y: 100, width: BREITE, height: 100, fill: "#FFFCF7" }));
    g.append(svgEl("rect", { x: 0, y: 200, width: BREITE, height: 100, fill: "#D3CCE0" }));
    g.append(svgEl("path", { d: `M0 100 L${BREITE} 100`, stroke: "#B9AED3", "stroke-width": 2.4, "stroke-dasharray": "10 8", fill: "none" }));
    g.append(svgEl("path", { d: `M0 200 L${BREITE} 200`, stroke: SPUR, "stroke-width": 3.4, fill: "none" }));
  } else {
    g.append(svgEl("rect", { x: 0, y: 0, width: BREITE, height: HOEHE, fill: "#FFFCF7" }));
  }
  haus.append(klammer, g, svgEl("rect", { x: 1.5, y: 1.5, width: BREITE - 3, height: HOEHE - 3, rx: 21, fill: "none", stroke: "#FFFFFF", "stroke-width": 3, opacity: 0.9 }));
}

/** Der Startpunkt als großer Punkt (oder weg). @param {Punkt | null} p @param {boolean} [zeigen] */
function setzeStart(p, zeigen = true) {
  if (!p) {
    startEl.classList.remove("da", "markiert");
    return;
  }
  startEl.style.left = `${(p[0] / BREITE) * 100}%`;
  startEl.style.top = `${(p[1] / HOEHE) * 100}%`;
  startEl.classList.toggle("da", zeigen);
}

// --- Ela und Lena auf ihren Rollern -------------------------------------------------------------------------------
/** Anteil der Figurenhöhe, auf dem die Räder stehen (Unterkante der Räder, zubehoer/roller.js: 278 von 280). */
const BODEN = 278 / 280;

/** @param {"ela" | "lena"} name */
function macheFigur(name) {
  const el = /** @type {HTMLElement} */ ($(name));
  const koerper = /** @type {HTMLElement} */ ($(`${name}-koerper`));
  const schatten = /** @type {HTMLElement} */ ($(`${name}-schatten`));
  koerper.innerHTML = Runde.zeichne(name, { haltung: "stehen", blick: "rechts", zubehoer: [name === "lena" ? "roller-kreide" : "roller"] });
  const svg = /** @type {SVGSVGElement} */ (koerper.querySelector("svg"));
  return { name, el, koerper, schatten, steuer: Runde.steuere(svg), x: 0, y: 0, blick: /** @type {1 | -1} */ (1), heim: { x: 0, y: 0 } };
}
const ela = macheFigur("ela");
const lena = macheFigur("lena");
/** @typedef {ReturnType<typeof macheFigur>} Figur */

/** @param {Figur} f @param {number} x @param {number} y @param {number} hoch px @param {number} blick */
function figurTransform(f, x, y, hoch, blick) {
  const sf = flaeche.getBoundingClientRect();
  const tx = x - f.el.offsetWidth / 2 - sf.left;
  const ty = y - f.el.offsetHeight * BODEN - sf.top - hoch;
  return `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${blick}, 1)`;
}
/** @param {Figur} f @param {number} x @param {number} y @param {number} luft 0 … 1 */
function schattenTransform(f, x, y, luft) {
  const sf = flaeche.getBoundingClientRect();
  const s = 1 - 0.4 * luft;
  return `translate(${(x - f.schatten.offsetWidth / 2 - sf.left).toFixed(1)}px, ${(y - f.schatten.offsetHeight * 0.55 - sf.top).toFixed(1)}px) scale(${s.toFixed(3)}, ${s.toFixed(3)})`;
}
/** Die Figur steht bei (x, y), ohne Bewegung. @param {Figur} f @param {number} x @param {number} y @param {number} [blick] */
function stelleFigur(f, x, y, blick = f.blick) {
  f.x = x;
  f.y = y;
  f.blick = /** @type {1 | -1} */ (blick);
  f.el.getAnimations().forEach((a) => a.cancel());
  f.schatten.getAnimations().forEach((a) => a.cancel());
  f.koerper.getAnimations().forEach((a) => a.cancel());
  f.el.style.transform = figurTransform(f, x, y, 0, blick);
  f.schatten.style.transform = schattenTransform(f, x, y, 0);
}
/** Ela links, Lena rechts neben dem Blatt, die Räder auf der Höhe der Grundlinie. */
function figurenHeim() {
  const { r, k } = mass();
  const w = ela.el.offsetWidth;
  ela.heim = { x: r.left - 0.42 * w, y: r.top + 232 * k };
  lena.heim = { x: r.right + 0.42 * w, y: r.top + 200 * k };
  stelleFigur(ela, ela.heim.x, ela.heim.y, 1);
  stelleFigur(lena, lena.heim.x, lena.heim.y, -1);
}

/** @typedef {{ x: number, y: number, t: number, hoch: number, blick: number }} Schlussel */
/**
 * Fährt die Figur eine Folge von Orten ab (Bildschirm, hoch in px, t in ms). Räder drehen sich nicht, der Körper rattert leicht.
 * @param {Lauf} L @param {Figur} f @param {Schlussel[]} keys @param {{ rattern?: boolean }} [o]
 */
async function fahreKeys(L, f, keys, { rattern = true } = {}) {
  const ms = keys[keys.length - 1].t;
  if (L.skip || wenigBewegung() || typeof f.el.animate !== "function" || ms <= 0) {
    const e = keys[keys.length - 1];
    stelleFigur(f, e.x, e.y, e.blick);
    return;
  }
  const kf = keys.map((s) => ({ transform: figurTransform(f, s.x, s.y, s.hoch, s.blick), offset: Math.min(1, s.t / ms) }));
  const sf = keys.map((s) => ({ transform: schattenTransform(f, s.x, s.y, Math.min(1, s.hoch / 60)), opacity: 1 - Math.min(0.45, s.hoch / 120), offset: Math.min(1, s.t / ms) }));
  const aktiv = [
    f.el.animate(kf, { duration: ms, fill: "forwards", easing: "linear" }),
    f.schatten.animate(sf, { duration: ms, fill: "forwards", easing: "linear" }),
  ];
  for (const a of aktiv) L.anims.add(a);
  const rattert = rattern
    ? f.koerper.animate([{ transform: "translateY(0)" }, { transform: "translateY(-0.25rem)" }, { transform: "translateY(0)" }], { duration: 70, iterations: Infinity })
    : null;
  await aktiv[0].finished.catch(() => undefined);
  rattert?.cancel();
  for (const a of aktiv) L.anims.delete(a);
  const e = keys[keys.length - 1];
  stelleFigur(f, e.x, e.y, e.blick);
}

/**
 * Ein Fahrplan in Haus-Einheiten wird zu Orten auf dem Bildschirm; vorn eine Anfahrt von (von) zum ersten Ort.
 * @param {import("./logik.js").Fahrplan} plan @param {{ von?: { x: number, y: number }, anfahrtMs?: number, bis?: number }} [o]
 * @returns {Schlussel[]}
 */
function keysVon(plan, { von, anfahrtMs = 0, bis = Infinity } = {}) {
  const { k } = mass();
  /** @type {Schlussel[]} */
  const keys = [];
  if (von) {
    const a = nachClient([plan.stellen[0].x, plan.stellen[0].y]);
    keys.push({ x: von.x, y: von.y, t: 0, hoch: 0, blick: a.x >= von.x ? 1 : -1 });
    keys.push({ x: a.x, y: a.y, t: anfahrtMs, hoch: 0, blick: a.x >= von.x ? 1 : -1 });
  }
  const letzte = Math.min(bis, plan.dauer);
  for (const s of plan.stellen) {
    if (s.t > letzte) break;
    const c = nachClient([s.x, s.y]);
    keys.push({ x: c.x, y: c.y, t: anfahrtMs + s.t, hoch: s.hoch * k, blick: s.blick });
  }
  if (bis < plan.dauer) {
    const s = ortZu(plan, bis);
    const c = nachClient([s.x, s.y]);
    keys.push({ x: c.x, y: c.y, t: anfahrtMs + bis, hoch: s.hoch * k, blick: s.blick });
  }
  return keys;
}

/** Die Figur rollt (hüpft) geradlinig zu einem Ort. @param {Lauf} L @param {Figur} f @param {{ x: number, y: number }} ziel @param {number} ms @param {number} [hoch] px */
function fahreZu(L, f, ziel, ms, hoch = 0) {
  const blick = ziel.x >= f.x ? 1 : -1;
  /** @type {Schlussel[]} */
  const keys = [{ x: f.x, y: f.y, t: 0, hoch: 0, blick }];
  if (hoch) keys.push({ x: (f.x + ziel.x) / 2, y: (f.y + ziel.y) / 2, t: ms / 2, hoch, blick });
  keys.push({ x: ziel.x, y: ziel.y, t: ms, hoch: 0, blick });
  return fahreKeys(L, f, keys, { rattern: !hoch });
}

/** @param {Figur} f @param {string} id @param {number} [ms] @param {Lauf} [L] */
const haltung = (f, id, ms = 200, L = lauf) => { f.steuer.haltung(id, { ms: L.skip ? 0 : ms }); };

// --- Das Spielbild: was gerade auf dem Blatt liegt -----------------------------------------------------------
const B = {
  /** leer, start (Aufgabe steht, das Kind schreibt), fertig (gelöst, Wirkung läuft oder steht) */
  lage: "leer",
  /** @type {any} */ daten: null,
  stufe: "material",
  /** Die Vorlage im Blatt (Lenas Spur). @type {Punkt[][]} */ vor: [],
  frei: false,
  /** Die Striche des Kindes in Haus-Einheiten. @type {Punkt[][]} */ striche: [],
  /** Der Strich, der gerade gezogen wird. @type {{ punkte: Punkt[], pfad: SVGPathElement } | null} */ offen: null,
  t0: 0,
  /** Wann der letzte Strich endete (ms, performance.now). */
  letzterEnde: 0,
  schreibMs: 0,
  /** Zählt die Aufgaben (und Neustarts); veraltete Wirkungen legen nichts mehr hin. */
  nr: 0,
  /** Zählt die Wirkungen des Versuchs; beginnt das Kind neu zu schreiben, gilt die laufende nicht mehr. */
  wirk: 0,
  /** Die Wirkung „daneben“ läuft (Ela und Lena fahren, der Erzähler spricht). */
  imDaneben: false,
  /** Lena fährt gerade (die Spur entsteht). */
  lenaFaehrt: false,
  /** Die Stufe der letzten Aufgabe (für den Wechsel). @type {string | null} */ letzteStufe: null,
  /** Ein Wechsel, den die nächste Aufgabe ansagt. @type {"tipp" | "laut" | null} */ wechsel: null,
  /** Tippt das Kind eine Folge weg, schreibt der Tipp nicht gleich mit (ms-Zeitstempel). */ ignoriereBis: 0,
  /** Aufgabe, die gerade offen ist. @type {null | { pruefe: (erzwinge: boolean) => void, tastatur: () => void, lenaVor: () => void }} */ offeneHand: null,
};

/** Die Wirkung der letzten Lösung (die Folge wartet darauf). @type {Promise<any>} */
let wirkungFertig = Promise.resolve();
let zaehlFreude = 0;
let seitWitz = 0;
let nachFehler = false;

/** Die Spur des Kindes und Elas feste Linie wegräumen. */
function raeumeKind() {
  spurKind.replaceChildren();
  spurFest.replaceChildren();
  B.striche = [];
  B.offen = null;
}
/** Lenas Spur wegräumen. */
function raeumeSpur() {
  spurLena.replaceChildren();
}

/**
 * Lenas Spur entsteht, wo ihr Roller fährt: Punkte (Tupfer größer), die nacheinander erscheinen.
 * @param {Lauf} L @param {import("./logik.js").Fahrplan} plan @param {{ versatzMs?: number, dicht?: boolean, bis?: number }} [o] bis: nur bis zu dieser Zeit (ms)
 */
function zeichneSpur(L, plan, { versatzMs = 0, dicht = false, bis = Infinity } = {}) {
  const abstand = dicht ? 4.5 : 14;
  const r = dicht ? 3.4 : 3.8;
  /** @type {{ x: number, y: number, t: number, gross: boolean }[]} */
  const punkte = [];
  plan.striche.forEach(({ von, bis }) => {
    const s = plan.stellen;
    if (von === bis) {
      punkte.push({ x: s[von].x, y: s[von].y, t: s[von].t, gross: true });
      return;
    }
    let rest = 0;
    punkte.push({ x: s[von].x, y: s[von].y, t: s[von].t, gross: false });
    for (let i = von + 1; i <= bis; i++) {
      const a = s[i - 1];
      const b = s[i];
      const l = Math.hypot(b.x - a.x, b.y - a.y);
      if (l === 0) continue;
      let d = abstand - rest;
      while (d <= l) {
        const u = d / l;
        punkte.push({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, t: a.t + (b.t - a.t) * u, gross: false });
        d += abstand;
      }
      rest = l - (d - abstand);
    }
  });
  for (const p of punkte.filter((q) => q.t <= bis)) {
    const c = svgEl("circle", { cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: p.gross ? 7 : r, fill: SPUR, opacity: 1 });
    spurLena.append(c);
    if (!L.skip && !wenigBewegung() && typeof c.animate === "function") {
      c.style.opacity = "0";
      const a = c.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 70, delay: versatzMs + p.t, fill: "forwards" });
      L.anims.add(a);
      a.finished.then(() => { c.style.opacity = ""; a.cancel(); L.anims.delete(a); }, () => undefined);
    }
  }
}

/** Lenas Spur liegt sofort da (ohne Fahrt), an der Stelle der Vorlage. @param {Punkt[][]} striche @param {boolean} [dicht] */
function legeSpurHin(striche, dicht = false) {
  raeumeSpur();
  zeichneSpur({ skip: true, anims: new Set(), uhren: new Set() }, fahrplan(striche, { fahrtMs: 1500 }), { dicht });
}

/** Lenas Spur verweht (0,7 s). @param {Lauf} L */
async function verwehSpur(L) {
  const { bewege } = mit(L);
  await bewege(spurLena, [{ opacity: 1 }, { opacity: 0 }], 700, { opacity: "" });
  raeumeSpur();
}

/** Der Anfang eines Strichs bis zur Länge l. @param {Punkt[]} s @param {number} l @returns {Punkt[]} */
function kuerze(s, l) {
  if (s.length < 2) return s;
  /** @type {Punkt[]} */
  const aus = [s[0]];
  let sum = 0;
  for (let i = 1; i < s.length; i++) {
    const d = Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]);
    if (sum + d >= l) {
      const u = (l - sum) / d;
      aus.push([s[i - 1][0] + (s[i][0] - s[i - 1][0]) * u, s[i - 1][1] + (s[i][1] - s[i - 1][1]) * u]);
      return aus;
    }
    sum += d;
    aus.push(s[i]);
  }
  return aus;
}

/**
 * Lena fährt vor: ihr Roller malt die Spur der Vorlage; danach rollt sie zurück an ihren Platz.
 * @param {Lauf} L @param {{ langsam?: boolean, nurStart?: boolean, dicht?: boolean, striche?: Punkt[][] }} [o]
 */
async function lenaFaehrtVor(L, { langsam = false, nurStart = false, dicht = false, striche = B.vor } = {}) {
  const nr = B.nr;
  const { warte } = mit(L);
  B.lenaFaehrt = true;
  const teil = nurStart ? [kuerze(striche[0], 46)] : striche;
  const plan = fahrplan(teil, { fahrtMs: nurStart ? 560 : langsam ? 2700 : 1500, eckenMs: langsam ? 240 : 0, bremseMs: langsam ? 260 : 120, huepfMs: 320 });
  const anfahrt = 300;
  zeichneSpur(L, plan, { versatzMs: anfahrt, dicht });
  haltung(lena, "stehen", 0, L);
  klang.rattern(plan.dauer + anfahrt, 0.7);
  await fahreKeys(L, lena, keysVon(plan, { von: lena, anfahrtMs: anfahrt }));
  if (nr !== B.nr) return;
  await warte(nurStart ? 200 : 260);
  await fahreZu(L, lena, lena.heim, 420);
  B.lenaFaehrt = false;
}

// --- Flüge ----------------------------------------------------------------------------------------------------
/** Das Hof-Schild hat sechs Plätze, leer mit gestrichelter Kante; die Zeichen der Runde kommen von links nach rechts. */
function leereSchild() {
  plaetze.replaceChildren(...Array.from({ length: 6 }, () => Object.assign(document.createElement("div"), { className: "platz" })));
}
leereSchild();

/** Das Zeichen im Schild: die Striche des Kindes, in einem Kästchen so groß wie sie sind. @param {Punkt[][]} striche */
function zeichenSvg(striche) {
  const alle = striche.flat();
  const minX = Math.min(...alle.map((p) => p[0]));
  const maxX = Math.max(...alle.map((p) => p[0]));
  const minY = Math.min(...alle.map((p) => p[1]));
  const maxY = Math.max(...alle.map((p) => p[1]));
  const rand = 14;
  const w = Math.max(maxX - minX, 60) + rand * 2;
  const h = Math.max(maxY - minY, 60) + rand * 2;
  const x0 = (minX + maxX) / 2 - w / 2;
  const y0 = (minY + maxY) / 2 - h / 2;
  const svg = svgEl("svg", { viewBox: `${x0.toFixed(1)} ${y0.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`, preserveAspectRatio: "xMidYMid meet" });
  for (const s of striche) svg.append(svgEl("path", { d: pfadD(s), fill: "none", stroke: TINTE, "stroke-width": 9, "stroke-linecap": "round", "stroke-linejoin": "round" }));
  return { svg, w, h, x0, y0 };
}

/**
 * Das Zeichen fliegt an das Hof-Schild und rastet mit Plopp ein (Idee §1); bleibendes Bild.
 * @param {Lauf} L @param {Punkt[][]} striche
 */
async function fliegZumSchild(L, striche) {
  // Ein Platz am Schild ist frei; ist es voll, rückt das älteste Zeichen heraus.
  let platz = /** @type {HTMLElement | undefined} */ ([...plaetze.children].find((p) => !p.classList.contains("belegt")));
  if (!platz) {
    plaetze.firstElementChild?.remove();
    platz = document.createElement("div");
    platz.className = "platz";
    plaetze.append(platz);
  }
  const z = zeichenSvg(striche);
  const { r, k } = mass();
  const sf = flaeche.getBoundingClientRect();
  const quelle = { x: r.left + z.x0 * k - sf.left, y: r.top + z.y0 * k - sf.top, w: z.w * k, h: z.h * k };
  const ziel = platz.getBoundingClientRect();
  const s = Math.min((ziel.width * 0.86) / quelle.w, (ziel.height * 0.86) / quelle.h);
  const zx = ziel.left - sf.left + ziel.width / 2 - (quelle.w * s) / 2;
  const zy = ziel.top - sf.top + ziel.height / 2 - (quelle.h * s) / 2;
  const einrasten = () => {
    const fest = zeichenSvg(striche).svg;
    platz.replaceChildren(fest);
    platz.classList.add("belegt");
  };
  if (L.skip || wenigBewegung()) {
    einrasten();
    return;
  }
  const flug = document.createElement("div");
  flug.className = "flug";
  Object.assign(flug.style, { left: "0", top: "0", width: `${quelle.w}px`, height: `${quelle.h}px`, transformOrigin: "0 0" });
  flug.append(zeichenSvg(striche).svg);
  fluege.append(flug);
  spurKind.replaceChildren();
  spurFest.replaceChildren();
  const { bewege } = mit(L);
  const hoch = -quelle.h * 0.5 - 30;
  await bewege(flug, [
    { transform: `translate(${quelle.x}px, ${quelle.y}px) scale(1)`, easing: "ease-out" },
    { transform: `translate(${(quelle.x + zx) / 2}px, ${(quelle.y + zy) / 2 + hoch}px) scale(${((1 + s) / 2).toFixed(3)})`, offset: 0.5, easing: "ease-in" },
    { transform: `translate(${zx}px, ${zy}px) scale(${s.toFixed(3)})` },
  ], 480, {}, { easing: "linear" });
  flug.remove();
  einrasten();
  klang.plopp();
  if (!L.skip) await bewege(platz, [{ transform: "scale(1)" }, { transform: "scale(1.14)", offset: 0.4 }, { transform: "scale(1)" }], 200, {}, { easing: "ease-out" });
}

// --- Wirkung richtig: Ela fährt die Linie des Kindes ab ------------------------------------------------------------
/** @param {string} zeichenId @param {number} zaehl */
function freudeVon(zeichenId, zaehl) {
  const z = zeichenMit(zeichenId);
  const rund = !!z && (z.richtung === "andersherum" || z.id === "schwung-kreis-linksherum");
  if (rund && zaehl % 4 === 3) return "kreiseln";
  return zaehl % 2 ? "klingeln" : "abspringen";
}

/**
 * Ela springt am Ende ab und landet gestaucht, klingelt oder kreiselt (zufällig, verschieden groß).
 * @param {Lauf} L @param {"abspringen" | "klingeln" | "kreiseln"} art
 */
async function elaEnde(L, art) {
  const hoch = (art === "abspringen" ? 7 : 3.4) * mass().k * 10;
  haltung(ela, "freuen-klein", 100, L);
  if (L.skip || wenigBewegung()) return;
  ela.el.getAnimations().forEach((a) => a.cancel());
  const aktiv = [
    ela.el.animate([
      { transform: figurTransform(ela, ela.x, ela.y, 0, ela.blick), easing: "ease-out" },
      { transform: figurTransform(ela, ela.x, ela.y, hoch, ela.blick), offset: 0.5, easing: "ease-in" },
      { transform: figurTransform(ela, ela.x, ela.y, 0, ela.blick) },
    ], { duration: 380, fill: "forwards" }),
    ela.koerper.animate(art === "kreiseln"
      ? [{ transform: "rotate(0deg) scale(1)" }, { transform: "rotate(360deg) scale(1)", offset: 0.62 }, { transform: "rotate(360deg) scale(1.1, 0.88)", offset: 0.88 }, { transform: "rotate(360deg) scale(1)" }]
      : [{ transform: "scale(1.07, 0.92)" }, { transform: "scale(0.96, 1.06)", offset: 0.4 }, { transform: "scale(1.1, 0.86)", offset: 0.92 }, { transform: "scale(1)" }], { duration: art === "kreiseln" ? 520 : 380 }),
  ];
  for (const a of aktiv) L.anims.add(a);
  if (art === "klingeln") klang.klingel();
  await aktiv[0].finished.catch(() => undefined);
  for (const a of aktiv) L.anims.delete(a);
  klang.landen();
  stelleFigur(ela, ela.x, ela.y, ela.blick);
}

/**
 * Ela fährt die Linie des Kindes ab (Idee §1): Tempo des Kindes auf etwa 1–1,6 s gestaucht, an jedem Strichende bremst sie, hebt
 * ab und setzt neu an; am Ende springt sie ab, die Linie wird fest, das Zeichen fliegt an das Schild.
 * @param {Lauf} L @param {Punkt[][]} striche @param {number} schreibMs @param {string} zeichenId @param {number} nr
 */
async function wirkungRichtig(L, striche, schreibMs, zeichenId, nr) {
  const plan = fahrplan(striche, { fahrtMs: fahrtZeit(schreibMs) });
  const anfahrt = 200;
  const tempo = Math.min(2, 1300 / Math.max(1, plan.dauer));
  haltung(ela, "stehen", 0, L);
  klang.rattern(plan.dauer + anfahrt, tempo);
  // An jedem Strichende bremst sie weich.
  for (const s of plan.striche.slice(0, -1)) setTimeout(() => { if (!L.skip) klang.bremsen(); }, anfahrt + plan.stellen[s.bis].t);
  await fahreKeys(L, ela, keysVon(plan, { von: ela, anfahrtMs: anfahrt }));
  if (nr !== B.nr) return;
  const art = freudeVon(zeichenId, zaehlFreude++);
  // Die Linie wird zu festem Kreidestrich (0,25 s).
  const fest = svgEl("g", {});
  for (const s of striche) fest.append(svgEl("path", { d: pfadD(s), fill: "none", stroke: TINTE, "stroke-width": 11, "stroke-linecap": "round", "stroke-linejoin": "round" }));
  for (const s of striche) fest.append(svgEl("path", { d: pfadD(s), fill: "none", stroke: "#FFFCF7", "stroke-width": 2.6, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0.35 }));
  spurFest.append(fest);
  void mit(L).bewege(fest, [{ opacity: 0 }, { opacity: 1 }], 220, { opacity: "" });
  // Ela springt ab, und zugleich fliegt das Zeichen an das Schild (zusammen etwa 0,8 s).
  const witz = nachFehler ? null : witzFuer(zeichenId);
  const ende = elaEnde(L, art);
  const flug = fliegZumSchild(L, striche);
  if (witz) ela.steuer.bewegung(witz);
  if (witz === "abklatschen") lena.steuer.bewegung("abklatschen");
  await Promise.all([ende, flug]);
}

/** Ab und zu ein kleiner Witz (höchstens jede fünfte Lösung, nie nach einem Versuch, der danebenging). @param {string} zeichenId */
function witzFuer(zeichenId) {
  seitWitz++;
  if (seitWitz < 5) return null;
  seitWitz = 0;
  const z = zeichenMit(zeichenId);
  if (z && (z.id === "l" || z.id === "d" || z.id === "schwung-senkrecht" || z.id === "ziffer-1")) return "fast-umfallen";
  if (z && (z.richtung === "andersherum" || z.id === "schwung-girlande" || z.id === "schwung-arkade")) return "wackelpudding";
  return "abklatschen";
}

// --- Wirkung daneben: Lena fährt ihre Vorlage zugleich auf Elas Spur --------------------------------------------------
/**
 * Ela fährt die Spur des Kindes, Lena zugleich ihre Vorlage genau darauf. Kommen sie sich entgegen, bremsen beide und staunen.
 * Dann sagt der Erzähler, was anders ist; die Linie des Kindes verblasst, Lenas Spur und der Startpunkt bleiben.
 * @param {Lauf} L @param {Punkt[][]} kind @param {string} grund @param {string} zeichenId @param {number} nr
 */
async function wirkungDaneben(L, kind, grund, zeichenId, nr) {
  B.imDaneben = true;
  try {
    await wirkungDanebenAblauf(L, kind, grund, zeichenId, nr);
  } finally {
    B.imDaneben = false;
  }
}

/** @param {Lauf} L @param {Punkt[][]} kind @param {string} grund @param {string} zeichenId @param {number} nr */
async function wirkungDanebenAblauf(L, kind, grund, zeichenId, nr) {
  const { warte, bewege } = mit(L);
  const w = ++B.wirk;
  /** Gilt diese Wirkung noch? Beginnt das Kind neu zu schreiben oder kommt die nächste Aufgabe, legt sie nichts mehr hin. */
  const gilt = () => nr === B.nr && w === B.wirk;
  const lenaStriche = aufKind(B.vor, kind, B.frei);
  const elaPlan = fahrplan(kind, { fahrtMs: 1500 });
  const lenaPlan = fahrplan(lenaStriche, { fahrtMs: 1500 });
  const treffen = begegnung(elaPlan, lenaPlan);
  const bis = treffen === null ? undefined : Math.max(250, treffen);
  const anfahrt = 280;
  raeumeSpur();
  zeichneSpur(L, lenaPlan, { versatzMs: anfahrt, bis });
  haltung(ela, "stehen", 0, L);
  haltung(lena, "stehen", 0, L);
  klang.rattern((bis ?? Math.min(elaPlan.dauer, lenaPlan.dauer)) + anfahrt, 0.9);
  await Promise.all([
    fahreKeys(L, ela, keysVon(elaPlan, { von: ela, anfahrtMs: anfahrt, bis })),
    fahreKeys(L, lena, keysVon(lenaPlan, { von: lena, anfahrtMs: anfahrt, bis })),
  ]);
  if (!gilt()) return;
  // Beide bremsen und schauen sich verdutzt an (0,4 s).
  klang.bremsen();
  klang.staunen();
  ela.steuer.haltung("staunen", { ms: L.skip ? 0 : 120 });
  lena.steuer.haltung("staunen", { ms: L.skip ? 0 : 120 });
  if (treffen !== null) {
    const a = ortZu(elaPlan, bis ?? 0);
    const b = ortZu(lenaPlan, bis ?? 0);
    ela.blick = a.x <= b.x ? 1 : -1;
    lena.blick = -ela.blick;
    ela.el.style.transform = figurTransform(ela, ela.x, ela.y, 0, ela.blick);
    lena.el.style.transform = figurTransform(lena, lena.x, lena.y, 0, lena.blick);
  }
  await warte(400);
  if (!gilt()) return;
  await erzaehler.daneben(satzZu(grund, zeichenId));
  if (!gilt()) return;
  // Die Linie des Kindes verblasst (0,4 s); Lenas Spur und der Startpunkt bleiben, das Schild auch.
  await bewege(spurKind, [{ opacity: 1 }, { opacity: 0 }], 400, { opacity: "" });
  spurKind.replaceChildren();
  if (!gilt()) return;
  await Promise.all([fahreZu(L, ela, ela.heim, 460), fahreZu(L, lena, lena.heim, 460)]);
  haltung(ela, "stehen", 200, L);
  haltung(lena, "stehen", 200, L);
  ela.blick = 1;
  lena.blick = -1;
  stelleFigur(ela, ela.x, ela.y, 1);
  stelleFigur(lena, lena.x, lena.y, -1);
  // Auf material liegt Lenas Spur wieder an ihrer Stelle; sonst verweht sie nach dem Hinsehen.
  if (B.stufe === "material") legeSpurHin(B.vor);
  else {
    await warte(900);
    if (gilt()) await verwehSpur(L);
  }
  if (!gilt()) return;
  await erzaehler.nochmal();
}

/** Beginnt das Kind während einer Wirkung neu zu schreiben, ist sie vorbei: alles steht wieder an seinem Platz. */
function beendeWirkung() {
  B.wirk++;
  B.imDaneben = false;
  ueberspringeAlles();
  spurKind.replaceChildren();
  figurenHeim();
  haltung(ela, "stehen", 0);
  haltung(lena, "stehen", 0);
  if (B.stufe !== "material") raeumeSpur();
  B.lenaFaehrt = false;
}

// --- Die Aufgabe ---------------------------------------------------------------------------------------------------
/**
 * Legt die Aufgabe auf den Hof und gibt die Handgriffe zurück.
 * @param {any} aufgabe
 * @param {{ passtNicht: () => void, geloest: (key: string) => void, hilfeAuf?: (stufe: number) => void }} melde
 * @param {{ demo?: boolean }} [opt] demo: Einführung (kein Satz, Lena fährt nicht von selbst vor)
 */
function stelleAufgabe(aufgabe, melde, { demo = false } = {}) {
  const key = aufgabe?.ziel?.key;
  const daten = aufgabe?.ziel?.daten ?? datenAus(key);
  if (!daten) throw new Error(`S18: unbekannte Aufgabe ${key}`);
  const stufe = aufgabe.stufe ?? "material";
  B.nr++;
  const nr = B.nr;
  const L0 = neuerLauf();
  B.daten = daten;
  B.stufe = stufe;
  B.frei = daten.art === "schwung";
  B.vor = vorlageImBlatt(daten, stufe);
  document.body.dataset.stufe = stufe;
  raeumeKind();
  raeumeSpur();
  zeichneHaus(mitLineatur(daten, stufe));
  fluege.replaceChildren();
  startEl.classList.remove("markiert");
  setzeStart(startVon(B.vor), stufe !== "kopf");
  B.lage = "start";
  B.lenaFaehrt = false;
  zeile.classList.remove("sperre");
  figurenHeim();
  haltung(ela, "stehen", 0, L0);
  haltung(lena, "stehen", 0, L0);
  let loesungGezeigt = false;
  let hilfe2 = false;
  const miss = () => nr === B.nr;
  if (!demo) {
    void erzaehler.aufgabe(daten, true);
    // material und der erste Blick nach einem Wechsel: Lena legt vor (Idee §5)
    if (stufe === "material" || B.wechsel) {
      B.wechsel = null;
      void lenaFaehrtVor(lauf, {}).then(() => { if (miss() && stufe !== "material") void verwehSpurSpaeter(); });
    }
  }
  /** vorstellung und kopf: die Spur verweht nach dem Hinsehen. */
  async function verwehSpurSpaeter() {
    const L = lauf;
    await mit(L).warte(1200);
    if (miss() && B.lage === "start" && !hilfe2) await verwehSpur(L);
  }

  /** Das Kind hat etwas gezogen: prüfen. erzwinge: Ela wurde angetippt (fährt auch bei zu wenig Linie). @param {boolean} erzwinge */
  function pruefe(erzwinge) {
    if (B.lage !== "start" || !miss()) return;
    const k = saeubere(B.striche, B.vor.filter((s) => s.length === 1).length);
    if (!k.striche.length) {
      // Ela angetippt, aber nichts gezogen: sie wackelt (jeder Tipp bekommt eine Antwort), kein Versuch.
      if (erzwinge) antwortWackel(ela.el);
      return;
    }
    if (!erzwinge && !bereit(B.striche, B.vor)) {
      // Hat das Kind neu angesetzt (zu viele Striche), zählt der letzte Anlauf.
      const letzte = B.striche.slice(-B.vor.length);
      if (B.striche.length > B.vor.length && bereit(letzte, B.vor) && erkenne(letzte, B.vor, { frei: B.frei }).ok) richtig(saeubere(letzte, B.vor.filter((s) => s.length === 1).length).striche);
      return;
    }
    const urteil = erkenne(B.striche, B.vor, { frei: B.frei });
    if (urteil.ok) return richtig(k.striche);
    // Hat das Kind neu angesetzt, zählt der letzte Anlauf, wenn er stimmt.
    const letzte = B.striche.slice(-B.vor.length);
    if (B.striche.length > B.vor.length && erkenne(letzte, B.vor, { frei: B.frei }).ok) return richtig(saeubere(letzte, B.vor.filter((s) => s.length === 1).length).striche);
    daneben(k.striche, urteil.grund ?? "form");
  }

  /** @param {Punkt[][]} striche */
  function richtig(striche) {
    B.lage = "fertig";
    zeile.classList.add("sperre");
    setzeStart(null);
    raeumeSpur(); // Lenas Spur hat ihren Dienst getan; Ela fährt Elas Linie
    const L = neuerLauf();
    const mine = B.nr;
    wirkungFertig = wirkungRichtig(L, striche, B.schreibMs, daten.zeichen, mine).then(() => {
      if (mine === B.nr) { figurenHeim(); haltung(ela, "stehen", 200); }
    });
    nachFehler = false;
    melde.geloest(key);
  }

  /** @param {Punkt[][]} striche @param {string} grund */
  function daneben(striche, grund) {
    B.lage = "start"; // das Kind darf gleich weiterschreiben (ein Tipp überspringt die Wirkung)
    nachFehler = true;
    melde.passtNicht();
    const L = neuerLauf();
    const mine = B.nr;
    const kind = striche.map((s) => s.map((p) => /** @type {Punkt} */ ([...p])));
    B.striche = [];
    void wirkungDaneben(L, kind, grund, daten.zeichen, mine).then(() => {
      if (mine === B.nr) startEl.classList.toggle("da", B.stufe !== "kopf" || hilfe2 || loesungGezeigt);
    });
  }

  /** Enter oder Leertaste auf dem Blatt (Tastatur): Lena fährt vor, Ela fährt Lenas Spur; zählt nie als gekonnt. */
  function tastatur() {
    if (B.lage !== "start" || !miss()) return;
    melde.hilfeAuf?.(2);
    hilfe2 = true;
    B.lage = "fertig";
    zeile.classList.add("sperre");
    setzeStart(null);
    raeumeSpur();
    const L = neuerLauf();
    const mine = B.nr;
    const striche = B.vor.map((s) => s.map((p) => /** @type {Punkt} */ ([...p])));
    for (const s of striche) spurKind.append(svgEl("path", { d: pfadD(s), fill: "none", stroke: TINTE, "stroke-width": 9, "stroke-linecap": "round", "stroke-linejoin": "round" }));
    wirkungFertig = wirkungRichtig(L, striche, 1800, daten.zeichen, mine).then(() => {
      if (mine === B.nr) { figurenHeim(); haltung(ela, "stehen", 200); }
    });
    melde.geloest(key);
  }

  /** Tipp auf Lena: noch einmal vorfahren (kein Lernzug); auf kopf gibt es kein Vorzeigen. */
  function lenaVor() {
    if (B.lage !== "start" || !miss()) return;
    if (B.stufe === "kopf" && !hilfe2) {
      antwortWackel(lena.el);
      return;
    }
    if (B.lenaFaehrt) return;
    const L = neuerLauf();
    raeumeSpur();
    setzeStart(startVon(B.vor), true);
    void lenaFaehrtVor(L, {}).then(() => { if (miss() && B.stufe !== "material" && !hilfe2) void verwehSpurSpaeter(); });
  }

  /** Das Zeichen, das alle Prüfzüge ausführt (Testbetrieb). */
  const zuege = () => (B.lage === "fertig" ? [] : pruefZuege(B.vor, B.frei).filter((z) => z.wie === "richtig" || !z.ok).map((z) => ({ art: "schreiben", von: "#startpunkt", wie: z.wie })));
  const richtigerZug = () => (B.lage === "fertig" ? null : { art: "schreiben", von: "#startpunkt", wie: "richtig" });

  B.offeneHand = { pruefe, tastatur, lenaVor };
  return {
    zuege,
    richtigerZug,
    /** @param {1 | 2} s */
    hilfe(s) {
      if (B.lage === "fertig" || !miss()) return;
      const L = neuerLauf();
      raeumeSpur();
      setzeStart(startVon(B.vor), true);
      if (s === 1) {
        // Probe: Lena zeigt nur, wo es losgeht (ein kurzes Stück in die erste Richtung, 0,8 s).
        startEl.classList.remove("markiert");
        void erzaehler.zeigtStart();
        void lenaFaehrtVor(L, { nurStart: true });
        return;
      }
      // Lösung: Lena fährt das ganze Zeichen langsam vor, die Spur bleibt durchgezogen, der Startpunkt im Sonnenring; das Kind schreibt selbst.
      loesungGezeigt = true;
      hilfe2 = true;
      startEl.classList.add("markiert");
      void erzaehler.fahrtLangsam();
      void lenaFaehrtVor(L, { langsam: true, dicht: true });
    },
    abbau() {
      B.nr++;
      B.lage = "leer";
      B.offeneHand = null;
      startEl.classList.remove("markiert");
    },
  };
}

/** Jeder Tipp bekommt eine sichtbare Antwort: die Stelle wackelt. @param {HTMLElement} el */
function antwortWackel(el) {
  el.classList.remove("wackelt");
  void el.offsetWidth;
  el.classList.add("wackelt");
  klang.bremsen();
  setTimeout(() => el.classList.remove("wackelt"), 450);
}

// --- Die Linie des Kindes: Finger oder Stift auf dem Blatt -----------------------------------------------------------
/** @param {PointerEvent} e */
function strichBeginnt(e) {
  if (e.button > 0 || B.offen) return;
  // Tippt das Kind eine Folge weg, schreibt dieser Tipp nicht mit.
  if (B.lage !== "start" || performance.now() < B.ignoriereBis) return;
  if (B.imDaneben) beendeWirkung();
  else if (lauf.anims.size) ueberspringeAlles();
  // Wer nach einer langen Pause wiederkommt, fängt frisch an: die angefangene Linie verschwindet.
  if (B.striche.length && performance.now() - B.letzterEnde > 8000) {
    spurKind.replaceChildren();
    B.striche = [];
  }
  const p = vonClient(e.clientX, e.clientY);
  const pfad = svgEl("path", { d: pfadD([p]), fill: "none", stroke: TINTE, "stroke-width": 9, "stroke-linecap": "round", "stroke-linejoin": "round" });
  spurKind.append(pfad);
  B.offen = { punkte: [p], pfad };
  if (!B.t0 || !B.striche.length) B.t0 = performance.now();
  try { zeile.setPointerCapture(e.pointerId); } catch { /* der Prüfstand sendet Ereignisse ohne echten Zeiger */ }
}
/** @param {PointerEvent} e */
function strichLaeuft(e) {
  const o = B.offen;
  if (!o) return;
  const p = vonClient(e.clientX, e.clientY);
  const l = o.punkte[o.punkte.length - 1];
  if (Math.hypot(p[0] - l[0], p[1] - l[1]) < 1.2) return;
  o.punkte.push(p);
  o.pfad.setAttribute("d", pfadD(o.punkte));
}
/** @param {PointerEvent} e */
function strichEndet(e) {
  const o = B.offen;
  if (!o) return;
  strichLaeuft(e);
  B.offen = null;
  B.letzterEnde = performance.now();
  B.schreibMs = performance.now() - B.t0;
  const l = laenge(o.punkte);
  const wirdTupfer = l < TIPP && B.vor.some((s) => s.length === 1) && B.striche.length > 0;
  if (l < TIPP && !wirdTupfer) {
    // Nur getippt: kein Strich (Idee §1). Der Tipp bekommt trotzdem eine Antwort: ein kleiner Punkt, der verschwindet.
    o.pfad.remove();
    return;
  }
  B.striche.push(o.punkte);
  if (l < TIPP) o.pfad.setAttribute("d", pfadD([[o.punkte[0][0], o.punkte[0][1]]]));
  B.offeneHand?.pruefe(false);
}
zeile.addEventListener("pointerdown", strichBeginnt);
zeile.addEventListener("pointermove", strichLaeuft);
zeile.addEventListener("pointerup", strichEndet);
zeile.addEventListener("pointercancel", strichEndet);
zeile.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    B.offeneHand?.tastatur();
  }
});
ela.el.addEventListener("click", () => B.offeneHand?.pruefe(true));
lena.el.addEventListener("click", () => B.offeneHand?.lenaVor());

// --- Prüfstand: Striche wie ein Finger ziehen ------------------------------------------------------------------------
const warteMs = (/** @type {number} */ ms) => new Promise((ok) => setTimeout(ok, ms));

/** Sendet Striche (Haus-Einheiten) als Zeigerereignisse auf das Blatt, wie ein Finger. @param {Punkt[][]} striche */
async function schreibeStriche(striche) {
  const o = { bubbles: true, composed: true, cancelable: true, pointerId: 7, isPrimary: true, pointerType: "touch", button: 0 };
  for (const s of striche) {
    const pts = s.length === 1 ? [s[0], [s[0][0] + 0.2, s[0][1]]] : s;
    const c0 = nachClient(/** @type {Punkt} */ (pts[0]));
    zeile.dispatchEvent(new PointerEvent("pointerdown", { ...o, buttons: 1, clientX: c0.x, clientY: c0.y }));
    for (let i = 1; i < pts.length; i++) {
      const c = nachClient(/** @type {Punkt} */ (pts[i]));
      zeile.dispatchEvent(new PointerEvent("pointermove", { ...o, buttons: 1, clientX: c.x, clientY: c.y }));
      if (i % 12 === 0) await warteMs(4);
    }
    const c1 = nachClient(/** @type {Punkt} */ (pts[pts.length - 1]));
    zeile.dispatchEvent(new PointerEvent("pointerup", { ...o, clientX: c1.x, clientY: c1.y }));
    await warteMs(40);
  }
}

/** Dichter abtasten, damit die Linie glatt ankommt. @param {Punkt[][]} striche @returns {Punkt[][]} */
function dichter(striche) {
  return striche.map((s) => {
    if (s.length < 2) return s;
    /** @type {Punkt[]} */
    const aus = [s[0]];
    for (let i = 1; i < s.length; i++) {
      const n = Math.max(1, Math.ceil(Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]) / 6));
      for (let j = 1; j <= n; j++) aus.push([s[i - 1][0] + ((s[i][0] - s[i - 1][0]) * j) / n, s[i - 1][1] + ((s[i][1] - s[i - 1][1]) * j) / n]);
    }
    return aus;
  });
}

// =====================================================================================================
// EINFÜHRUNG im echten Spielbild (docs/spielbau.md §8, Idee §6)
// =====================================================================================================
// Eine kleine Geschichte am Beispiel i: Lena fährt vor und malt die Spur, das Kind legt den Finger auf den Startpunkt und schreibt
// selbst, Ela fährt, das i kommt an das Schild. Nicht gebucht.

/** Die Einführung: Sätze, Hilfe und Zug für den Prüfstand (rahmen/einfuehrung-lauf.js). */
const stand = { phase: "laden", aufgabe: /** @type {string | null} */ (null), nr: 0, versuche: 0, hilfeStufe: 0, vorschau: true, lernstufe: /** @type {string | null} */ (null) };
const E = einfuehrungsLauf({ ton: () => leiste.ton, text: () => blase.text, stand });
// Ohne Ton kürzt nur ein Tipp des Kindes die Lesezeit ab, nie die Einstellung (spielbau.md §8). Hilfe, Pause und Leiste nicht.
E.verbindeTippen(document, { ausser: [hilfe, pause, leiste] });

/** Sonnenring auf Dingen der Einführung (Spur, Startpunkt). @type {Element[]} */
let ringAuf = [];
/** @param {(Element | null | undefined)[]} els */
function ring(els) {
  for (const el of ringAuf) el.classList.remove("markiert");
  ringAuf = /** @type {Element[]} */ (els.filter(Boolean));
  for (const el of ringAuf) el.classList.add("markiert");
}

/** Die Einführung im echten Spielbild. Mit `r` gilt sie danach als gesehen, und die Rundenzeit beginnt. @param {{ einfuehrungGesehen(): void, beginneZeit(): void }} [r] */
function einfuehrung(r) {
  const e = einleitung;
  const satz = E.satz;
  const aufgabe = { ziel: { key: "schreiben:i", daten: datenAus("schreiben:i") }, stufe: "material" };
  /** @type {ReturnType<typeof stelleAufgabe> | null} */
  let demo = null;
  return E.spiele(async () => {
    try {
      neuerLauf();
      B.letzteStufe = null;
      B.wechsel = null;
      leereSchild();
      demo = stelleAufgabe(aufgabe, { passtNicht() {}, geloest() {} }, { demo: true });
      // Lena zeigt es: ihre Spur, der große Punkt; die Hilfe sagt den Satz noch einmal.
      await satz(e.hof);
      ring([feld]);
      const fahrt = lenaFaehrtVor(neuerLauf(), { langsam: true });
      await satz(e.spur);
      await satz(e.oben);
      await satz(e.punkt);
      await fahrt;
      ring([]);
      await satz(e.ela);
      // Jetzt du: Finger auf den Startpunkt, dann die Linie ziehen.
      demo.abbau();
      /** @type {() => void} */
      let getan = () => {};
      const geschrieben = new Promise((ok) => { getan = () => ok(undefined); });
      const du = stelleAufgabe(aufgabe, { passtNicht() {}, geloest: () => getan() }, { demo: true });
      demo = du;
      ring([startEl]);
      const zug = { art: "schreiben", von: "#startpunkt", wie: "richtig" };
      E.hilfe(() => satz(e.finger).then(() => satz(e.zieh)), { bis: geschrieben });
      const kind = E.kind(zug, geschrieben);
      await satz(e.finger);
      await satz(e.zieh);
      await kind;
      ring([]);
      du.abbau();
      await wirkungFertig;
      await satz(e.schild);
      await satz(e.mitfahren);
      await satz(e.nochmal);
      await satz(e.lernen);
      await satz(e.los);
    } finally {
      ueberspringeAlles();
      ring([]);
      demo?.abbau();
      raeumeKind();
      raeumeSpur();
      leereSchild();
      setzeStart(null);
      B.lage = "leer";
      B.letzteStufe = null;
      figurenHeim();
    }
  }, r);
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
/** @type {{ zuege: () => any[], richtigerZug: () => any, hilfe: (s: 1 | 2) => void, neuStellen?: () => void } | null} */
let offeneAufgabe = null;
const ORTE = { hilfe: "#hilfe >>> ls-knopf", haus: "#leiste >>> a.haus", weiter: "#pause >>> ls-knopf.weiter" };
const WEITER = { art: "tippen", von: ORTE.weiter };
const einfuehrungsZug = () => E.zug;
meldePruefSchnittstelle({
  zustand: () => ({ ...stand }),
  zuege: () => (stand.phase === "aufgabe" ? offeneAufgabe?.zuege() ?? [] : stand.phase === "pause" ? [WEITER] : stand.phase === "einfuehrung" ? [einfuehrungsZug()].filter(Boolean) : []),
  richtigerZug: () => (stand.phase === "aufgabe" ? offeneAufgabe?.richtigerZug() ?? null : stand.phase === "pause" ? WEITER : stand.phase === "einfuehrung" ? einfuehrungsZug() : null),
  orte: ORTE,
  /** Die eigene Art „schreiben“: Striche wie ein Finger ziehen (richtig, rückwärts, gespiegelt); sonst wie die Vorgabe. @param {any} zug */
  async fuehreAus(zug) {
    if (zug.art !== "schreiben") return standardZug(zug);
    await schreibeStriche(dichter(pruefZug(B.vor, zug.wie ?? "richtig")));
  },
});

// --- Hilfe-Leiter (grundsaetze.md L12, bedienung.md 6) ---------------------------------------------
/** @type {(() => void) | null} */
let hilfeTippen = null;
// In der Einführung sagt die Hilfe den Schritt noch einmal (sonst hörte das Kind nur den Namen „Hilfe“).
hilfe.addEventListener("hilfe", () => { if (!E.hilfeGedrueckt()) hilfeTippen?.(); });

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
    const melde = {
      passtNicht() {
        versuche++;
        stand.versuche = versuche;
        if (versuche === 2 && stufe === 0) hilfe.leuchte();
      },
      /** Die Tastatur lässt Ela Lenas Spur fahren: Hilfe Stufe 2, zählt nie als gekonnt. @param {number} s */
      hilfeAuf(s) {
        stufe = Math.max(stufe, s);
        stand.hilfeStufe = stufe;
      },
      /** @param {string} key */
      geloest(key) {
        hilfeTippen = null;
        offeneAufgabe = null;
        stand.phase = "folge";
        fertig({ key, versuche, hilfe: stufe, ms: Date.now() - start });
      },
    };
    /** @type {ReturnType<typeof stelleAufgabe>} */
    let a;
    try {
      a = stelleAufgabe(aufgabe, melde);
    } catch (e) {
      hilfeTippen = null;
      fehler(e);
      return;
    }
    offeneAufgabe = { zuege: () => a.zuege(), richtigerZug: () => a.richtigerZug(), hilfe: (s) => a.hilfe(s),
      // Nach der Einführung („Anleitung“): dieselbe Aufgabe noch einmal hinlegen; der Stand der Hilfe bleibt.
      neuStellen: () => {
        a.abbau();
        a = stelleAufgabe(aufgabe, melde, { demo: true });
      } };
    hilfeTippen = () => {
      stufe = Math.min(2, stufe + 1);
      stand.hilfeStufe = stufe;
      a.hilfe(/** @type {1 | 2} */ (stufe));
    };
  });
}

// --- Wechsel der Stufe: Lena fegt ihre Spur weg (Regeln §8: kein Wechsel ohne Bild) --------------------------------
/**
 * Vor jeder Aufgabe: wechselt die Stufe, fegt Lena ihre Spur mit dem Fuß weg (≤ 0,6 s) und der Erzähler sagt den Wechsel; die
 * erste Aufgabe danach beginnt mit einer kleinen Vorführung (Lena fährt einmal, das Kind schreibt).
 * @param {{ stufe?: string }} aufgabe
 */
async function bereiteAufgabe(aufgabe) {
  const stufe = aufgabe.stufe ?? "material";
  const vorher = B.letzteStufe;
  B.letzteStufe = stufe;
  if (!vorher || vorher === stufe) return;
  const wechsel = stufe === "vorstellung" ? "tipp" : stufe === "kopf" ? "laut" : null;
  stand.phase = "folge";
  const L = neuerLauf();
  const { bewege } = mit(L);
  /** @type {() => void} */
  let getippt = () => {};
  const tipp = new Promise((ok) => { getippt = () => ok(undefined); });
  const abmelden = beimTippen(() => {
    ueberspringeAlles();
    getippt();
  });
  try {
    if (wechsel) {
      // Lena rollt über die Spur und fegt sie weg.
      void bewege(spurLena, [{ opacity: 1 }, { opacity: 0 }], 600, { opacity: "" });
      await fahreZu(L, lena, { x: ela.heim.x + (lena.heim.x - ela.heim.x) * 0.5, y: lena.heim.y }, 340);
      await fahreZu(L, lena, lena.heim, 280);
      raeumeSpur();
      await Promise.race([erzaehler.wechsel(wechsel).catch(() => undefined), tipp, new Promise((ok) => setTimeout(ok, 4000))]); // nie länger als 4 s in der Folge hängen
      B.wechsel = wechsel;
    }
  } finally {
    abmelden();
  }
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
    const abmelden = beimTippen(() => {
      B.ignoriereBis = performance.now() + 250;
      ueberspringeAlles();
      fertig();
    });
    wirkungFertig.catch(() => undefined).then(() => new Promise((w) => setTimeout(w, NACH_WIRKUNG_MS))).then(fertig);
  });
}

// --- Pause am Rundenende (bedienung.md 7.1) --------------------------------------------------------
/** @param {{ hinweis?: string | null, zeit?: { schluss: boolean, satz: string | null }, echteDinge?: { thema?: string, fach?: string, titel?: string, text?: string } | null }} [optionen] */
async function zeigePause({ hinweis = null, zeit = { schluss: false, satz: null }, echteDinge = null } = {}) {
  const karte = $("sachmoment");
  fuelleSachmoment(karte, leiste.ton && !zeit.satz);
  if (zeit.satz && leiste.ton) sage(zeit.satz);
  const spiel = hinweis ? (ctx?.spiele?.spiele ?? []).find((/** @type {any} */ s) => s.id === hinweis) : null;
  if (spiel) {
    const a = document.createElement("a");
    a.className = "hinweis";
    a.href = spiel.datei;
    a.tabIndex = 0; // WebKit (Safari, macOS-Vorgabe) erreicht Links mit Tab nur mit tabindex
    a.innerHTML = `<img src="${esc(new URL(spiel.symbol, new URL("../../", import.meta.url)).href)}" alt=""><span>${esc(spiel.titel)}</span>`;
    karte.append(a);
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
    beginneZeit: () => r.beginneZeit(),
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
    beginneZeit() {},
    naechste() {
      const key = keys.shift();
      const daten = key ? datenAus(key) : null;
      const n = VORSCHAU.aufgaben.length - keys.length;
      return key && daten ? { ziel: { key, daten }, auch: [], stufe: n <= 2 ? "material" : n === 3 ? "vorstellung" : "kopf" } : null;
    },
    melde() { return null; },
    async ende() { return { hinweisSpiel: null }; },
  };
}

/** Die Einführung lief schon (sie kommt bei jedem Start einmal, danach über „Anleitung“). */
let einfuehrungGespielt = false;

// „Anleitung“: die Einführung im Spielbild jederzeit wieder (während einer Aufgabe); danach steht die Aufgabe wieder da.
$("anleitung")?.addEventListener("click", async () => {
  if (stand.phase !== "aufgabe" || E.laeuft) return;
  const merke = offeneAufgabe;
  await einfuehrung();
  merke?.neuStellen?.();
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

  const naechste = () => aufStufe(r.naechste());
  let aufgabe = naechste();
  if (!aufgabe && vorschau) {
    r = vorschauRunde();
    aufgabe = naechste();
  }
  leiste.setAttribute("thema", r.thema);

  // Das Spiel beginnt mit der Einführung im echten Spielbild (bei jedem Start; in der Vorschau nur mit ?einfuehrung).
  // Die Rundenzeit beginnt danach (E.spiele ruft r.beginneZeit(), G14).
  if (!einfuehrungGespielt && aufgabe && (!vorschau || params.has("einfuehrung"))) {
    einfuehrungGespielt = true;
    await einfuehrung(r);
  }
  $("anleitung")?.removeAttribute("hidden");

  while (aufgabe) {
    await bereiteAufgabe(aufgabe);
    const e = await spieleAufgabe(aufgabe);
    const ergebnis = { key: e.key, ok: e.versuche === 0, hilfe: e.hilfe, ms: e.ms };
    r.melde(e.key, ergebnis);
    document.dispatchEvent(new CustomEvent("ls-ergebnis", { detail: ergebnis })); // für die Browser-Prüfung
    await warteFolge();
    aufgabe = naechste();
  }

  const { hinweisSpiel } = await r.ende();
  await wirkungFertig.catch(() => undefined);
  await new Promise((ok) => setTimeout(ok, 450)); // ein Tipp, der die Folge übersprungen hat, trifft nicht gleich die Pause
  await zeigePause({ hinweis: hinweisSpiel, zeit: vorschau ? undefined : await amRundenende(), echteDinge: r.echteDinge });
  B.lage = "leer";
  B.letzteStufe = null;
  leereSchild();
  raeumeKind();
  raeumeSpur();
  return spieleRunde(vorschau);
}

// --- Start ---------------------------------------------------------------------------------------
async function start() {
  await leiste.bereit(); // Ton-Einstellung geladen
  if (params.has("eltern")) return elternansicht();
  zeichneHaus(true);
  figurenHeim();
  window.addEventListener("resize", () => { if (!B.lenaFaehrt && lauf.anims.size === 0) figurenHeim(); });
  const c = await ladeCtx().catch(() => null);
  const nichtEingetragen = c !== null && !eingetragen(c);
  if (nichtEingetragen) protokoll(`${SPIEL_ID}: nicht in spiele.json – Vorschau, schreibt nicht`);
  const vorschau = ["pause", "hinweis", "eltern", "einfuehrung"].some((p) => params.has(p)) || PRUEF_STUFE !== null || !c || nichtEingetragen;
  stand.vorschau = vorschau;
  if (!(await starteSpielzeit({ zaehlen: !vorschau }))) return;
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
