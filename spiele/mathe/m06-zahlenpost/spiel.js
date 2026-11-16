// M06 Zahlenpost (Idee: docs/spiele/mathe/m06-zahlenpost.md). Die Stimme sagt ein Zahlwort („siebzehn“), das Kind tippt die
// Ziffern auf den Umschlag auf Timos Schoß und bestätigt mit Fertig. Dann rollt Timo die Häuserreihe entlang zu genau
// dieser Hausnummer (immer 1,4 s, weit heißt schneller), der Brief rutscht in den Schlitz, die Tür springt auf, und in
// der Tür steht die Zahl als Goldmaterial. Ein Zahlendreher führt zu einem anderen Haus: der Brief bleibt auf dem
// Schoß, die Tür geht auf, und man sieht, wie weit es weg ist.
//
// Aufbau wie die Spielvorlage (spiele/vorlage/spiel.js, dort die Schritte zum eigenen Spiel):
//   SPIELWELT  Kennung, Aufgabenarten, Sätze des Erzählers, Klänge
//   STRASSE    Häuser, Kamera, Timo, Umschlag
//   AUFGABE    eine Aufgabe darstellen, prüfen (das Haus urteilt), Hilfe-Stufen
//   EINFÜHRUNG im echten Spielbild (docs/spielbau.md §8): Timo bringt den Brief zur 13, das Kind tippt die 5
//   RAHMEN     aus der Vorlage; die Lernsteuerung bestimmt die Länge der Runde
//
// Vorschau-Parameter wie in der Vorlage (?pause, ?hinweis, ?eltern, ?einfuehrung, ?thema=, ?pruefen, ?stufe=).

import "../../rahmen/leiste.js";
import "../../rahmen/blase.js";
import "../../rahmen/hilfe.js";
import "../../rahmen/pause.js";
import "../../rahmen/knopf.js";
import "../../rahmen/tastatur.js";
import "../../rahmen/goldmaterial.js";
import * as Runde from "../../runde/runde.js";
import { zahlAus } from "../../aufgabenarten.js";
import { gold } from "../../rahmen/gold-geometrie.js";
import { meldePruefSchnittstelle, selektor, testbetrieb } from "../../rahmen/pruefen.js";
import { sperreTouch, protokoll, esc } from "../../lernspiel.js";
import { sprich } from "../../kern/stimme.js";
import { runde, einmal, rundenMs } from "../../lernsteuerung.js";
import { starteSpielzeit, amRundenende, sage } from "../../rahmen/spielzeit.js";
import { felderFuer, tippe, bereit, naechsteTaste, kandidaten, tastenZu, probeVon, FAHRT_MS, HAUS_ABSTAND, tickZeiten, naechsteFreude, witz } from "./logik.js";

sperreTouch();

const $ = (/** @type {string} */ id) => /** @type {any} */ (document.getElementById(id));
const leiste = $("leiste");
const blase = $("blase");
const hilfe = $("hilfe");
const pause = $("pause");
const tastatur = $("tastatur");
const fertigKnopf = $("fertig");
const strasse = $("strasse");
const timoEl = $("timo");
const timoKoerper = $("timo-koerper");
const umschlag = $("umschlag");
const wortEl = $("wort");
const feldZ = $("feld-z");
const feldE = $("feld-e");
const feldFrei = $("feld-frei");

// =====================================================================================================
// SPIELWELT
// =====================================================================================================

/** Kennung des Spiels: steht einmal in der HTML-Datei an <ls-leiste spiel>. */
const SPIEL_ID = leiste.getAttribute("spiel");

/** Aufgabenarten (gilt nur, solange das Spiel nicht in spiele.json steht; dort steht dasselbe). */
const ARTEN = [{ art: "zahlwort", zahlen: [0, 20], stufen: ["material", "vorstellung", "kopf"] }];

/** Längstens so lange wartet die Folge auf das Ende der Wirkung (Regeln §1: etwa 2,5 s, höchstens 3 s). */
const FOLGE_MAX_MS = 2700;
const NACH_WIRKUNG_MS = 150;
/** Der Stufenwechsel des Umschlags (Aufkleber ab, Farben weg) dauert so lange; ein Tipp kürzt ab. */
const WECHSEL_MS = 1200;
/** Eine neue Aufgabe beginnt nur, solange von der Rundenlänge noch so viel übrig ist (wie M37). */
const LETZTE_AUFGABE_MS = 30000;
/** So lange wartet die Pause längstens auf den letzten Satz (ein Satz dauert etwa 2 s). */
const SATZ_WARTE_MS = 4000;
/** Die Straße reicht immer bis 99. */
const LETZTES_HAUS = 99;

/** Nur Vorschau: Aufgaben, falls die Lernsteuerung nichts liefert. */
const VORSCHAU = { thema: "Zahlen hören und schreiben", aufgaben: ["zahl:17", "zahl:5", "zahl:13", "zahl:20"] };

/** Sätze aus Daten (je Zahl ausgeschrieben, texte.json). */
const TEXTE = await fetch(new URL("texte.json", import.meta.url)).then((r) => r.json()).catch(() => null);

/**
 * Alle Sätze des Spiels sprechen nacheinander: ein neuer Satz beginnt erst, wenn der vorige zu Ende ist, damit keiner
 * abgeschnitten wird (spielbau.md §8). Ein Tipp des Kindes darf einen Satz abbrechen, das Spiel nie.
 * @type {Promise<any>}
 */
let sprechSchlange = Promise.resolve();
/** Zählt die Tipps des Kindes: ein Satz, der noch nicht begonnen hat und verwerfbar ist, fällt nach einem Tipp weg. */
let tippZaehler = 0;
document.addEventListener("pointerdown", () => { tippZaehler++; }, true);
/** @param {() => Promise<any>} sag @param {boolean} [verwerfbar] Sätze zur Wirkung (nicht das Zahlwort der Aufgabe) @returns {Promise<any>} */
function spricht(sag, verwerfbar = false) {
  const tipps = tippZaehler;
  const p = sprechSchlange.catch(() => undefined).then(() => (verwerfbar && tipps !== tippZaehler ? "still" : sag()));
  sprechSchlange = p;
  return p;
}
/** @param {string | undefined} text @param {{ zeigen?: boolean, verwerfbar?: boolean }} [o] */
const sagt = (text, { zeigen = false, verwerfbar = false } = {}) => (text ? spricht(() => blase.sage(text, { zeigen }), verwerfbar) : Promise.resolve("still"));

/** Der Erzähler (docs/stimme.md): beschreibt, was zu sehen ist, nie ein Urteil (grundsaetze.md 3.2). */
const erzaehler = {
  /** Das Zahlwort der Aufgabe als Aufnahme. @param {number} n */
  wort: (n) => sagt(TEXTE?.wort?.[n]),
  /** Nach einem Fehlversuch noch einmal; fällt nach einem Tipp weg. @param {number} n */
  wortNochmal: (n) => sagt(TEXTE?.wort?.[n], { verwerfbar: true }),
  /** Nach Fehlversuch oder Hilfe am Haus der richtigen Zahl. @param {number} n */
  bei: (n) => sagt(TEXTE?.bei?.[n], { verwerfbar: true }),
  /** Timo steht an dem Haus, dessen Nummer das Kind getippt hat. @param {number} w */
  daneben: (w) => sagt(TEXTE?.daneben?.[w], { verwerfbar: true }),
  /** Hilfe 1: was auf dem Umschlag erscheint. @param {number} n */
  probe: (n) => sagt(TEXTE?.hilfe1?.[n], { zeigen: true }),
  /** Hilfe 2: die Lösung, die das Kind selbst tippt. @param {number} n */
  loesung: (n) => sagt(TEXTE?.hilfe2?.[n], { zeigen: true }),
  einfuehrungVor: () => spricht(() => blase.sage("Timo bringt den Brief zur Dreizehn.")),
  einfuehrungDu: () => spricht(() => blase.sage("Jetzt tippst du.")),
  gehtNicht: () => blase.sage("Das Spiel geht gerade nicht."),
};

/** Elternansicht (?eltern): beschreibend, von Stärken aus, kein Vergleich (3.3). @param {HTMLElement} feld */
function fuelleEltern(feld) {
  feld.innerHTML = `<p>Ihr Kind hört ein Zahlwort und tippt die Ziffern auf einen Umschlag. Timo bringt den Brief zu dem Haus mit
    dieser Nummer; in der Tür steht die Zahl als goldenes Perlenmaterial. Bei Zahlen wie siebzehn, die man mit den Einern
    zuerst spricht, führt ein Zahlendreher zu einem ganz anderen Haus, und man sieht, wie weit es entfernt ist.</p>
    <p>Welche Zahlen dran sind und was Ihr Kind schon kann, steht bei den Themen im Elternbereich.</p>`;
}

/** Pause (K1, K8): nur das Angebot zum Mitmachen (Idee §6). @param {HTMLElement} feld @param {boolean} ton */
function fuelleSachmoment(feld, ton) {
  feld.replaceChildren();
  const satz = document.createElement("p");
  satz.textContent = "Lass dir Zahlen sagen und schreib sie auf.";
  feld.append(satz);
  if (ton) sprich("Lass dir Zahlen sagen und schreib sie auf.");
}

// --- Klänge (Web Audio, leise; Ton aus gilt) ---------------------------------------------------------
/** @type {AudioContext | null} */
let audio = null;
/** @returns {AudioContext | null} */
function kontext() {
  try {
    audio ??= new AudioContext();
    if (audio.state === "suspended") audio.resume().catch(() => {});
    return audio;
  } catch {
    return null;
  }
}
/** @param {number} hz @param {{ dauer?: number, typ?: OscillatorType, laut?: number, gleiten?: number, spaeter?: number }} [o] */
function ton(hz, { dauer = 0.13, typ = "triangle", laut = 0.07, gleiten = 0, spaeter = 0 } = {}) {
  if (!leiste.ton) return;
  const a = kontext();
  if (!a) return;
  try {
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
/** Rollen als weiches Rauschen, das mit der Fahrt an- und abschwillt. @param {number} ms */
function rauschen(ms) {
  if (!leiste.ton) return;
  const a = kontext();
  if (!a) return;
  try {
    const sek = ms / 1000;
    const puffer = a.createBuffer(1, Math.ceil(a.sampleRate * sek), a.sampleRate);
    const daten = puffer.getChannelData(0);
    for (let i = 0; i < daten.length; i++) daten[i] = Math.random() * 2 - 1;
    const quelle = a.createBufferSource();
    quelle.buffer = puffer;
    const filter = a.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 520;
    const g = a.createGain();
    const t = a.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05, t + sek * 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, t + sek);
    quelle.connect(filter).connect(g).connect(a.destination);
    quelle.start(t);
  } catch {
    // still
  }
}
const klang = {
  tick: () => ton(880, { dauer: 0.05, typ: "sine", laut: 0.035 }),
  plopp: () => ton(740, { dauer: 0.1, typ: "sine", laut: 0.1, gleiten: 0.55 }),
  klingel: () => {
    ton(660, { dauer: 0.16, typ: "sine", laut: 0.07 });
    ton(880, { dauer: 0.22, typ: "sine", laut: 0.07, spaeter: 0.13 });
  },
  boing: () => ton(196, { dauer: 0.38, typ: "sine", laut: 0.06, gleiten: 1.5 }),
};

// =====================================================================================================
// STRASSE
// =====================================================================================================

const wenigBewegung = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const remPx = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 10;

/** Laufende Wirkungen und Wartezeiten; Tippen und die nächste Aufgabe springen ans Ende. @type {(() => void)[]} */
let laufend = [];
function ueberspringeAlles() {
  while (laufend.length) {
    const l = laufend;
    laufend = [];
    for (const f of l) f();
  }
  timo.halt();
}

/** Wartet ms oder bis zum Überspringen. @param {number} ms */
const warte = (ms) => new Promise((ok) => {
  const fertig = () => {
    clearTimeout(uhr);
    ok(undefined);
  };
  const uhr = setTimeout(fertig, ms);
  laufend.push(fertig);
});

/**
 * Eine Web-Animation, die beim Überspringen ans Ende springt (die Endlage bleibt stehen, fill forwards).
 * @param {Element} el @param {Keyframe[]} keyframes @param {KeyframeAnimationOptions} opt
 */
function anim(el, keyframes, opt) {
  if (typeof el.animate !== "function" || wenigBewegung()) return Promise.resolve();
  const a = el.animate(keyframes, { fill: "forwards", ...opt });
  laufend.push(() => {
    try {
      a.finish();
    } catch {
      // schon fertig
    }
  });
  return a.finished.then(() => undefined, () => undefined);
}

/** Tasten, die eine Folge oder Szene abkürzen (wie ein Tipp). */
const KUERZT = new Set(["Enter", " ", "Escape"]);
/**
 * Ruft fn beim nächsten Tipp irgendwo auf der Seite oder bei Enter, Leertaste, Escape (Regeln §1: der nächste Tipp
 * überspringt Folge und Szene). @param {() => void} fn @returns {() => void} abmelden
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

// --- Häuser ---------------------------------------------------------------------------------------------
/** Abstand der Straße links vom ersten Haus (rem) und Lage des Hauses, vor dem Timo steht, relativ zur Mitte Timos (rem; das Zielhaus steht mit seiner Mitte über Timos Mitte). */
const RAND_LINKS = 70;
const TIMO_X = 40;
const HAUS_VOR_TIMO = -16;
/** Durchmesser einer Perle im Goldmaterial der Tür (rem). */
const PERLE_TUER = 2;
const WAENDE = ["#F4E3C8", "#EBD5CF", "#DCE8D4", "#DDE4F0", "#F2E1B9"];
const DAECHER = ["#C97B63", "#8F6FA8", "#5E8FA8", "#B5654F", "#6FA37F"];
const TUEREN = ["#4F8FB3", "#B3315A", "#3DB98F", "#8C6FE0", "#F08A4B"];
const TINTE = "#3B2A6B";

/** Das Haus k als Element (0 ist die Post, die Zehnerhäuser sind etwas höher). @param {number} k */
function baueHaus(k) {
  const post = k === 0;
  const hoch = k > 0 && k % 10 === 0;
  const w = hoch ? 38 : 34;
  const h = w + 10;
  const wand = post ? "#F5D56B" : WAENDE[k % 5];
  const dach = post ? "#C5483F" : DAECHER[(k * 3) % 5];
  const fenster = (/** @type {number} */ y) => `<rect x="7.5" y="${y}" width="7" height="7" fill="#A7D6EE"/><path d="M11 ${y} V${y + 7} M7.5 ${y + 3.5} H14.5" fill="none"/>`;
  const el = document.createElement("div");
  el.className = "haus";
  el.dataset.k = String(k);
  el.style.setProperty("--h", `${h}rem`);
  el.style.setProperty("--tuer", post ? "#C5483F" : TUEREN[(k * 2) % 5]);
  el.style.left = `${RAND_LINKS + k * HAUS_ABSTAND}rem`;
  el.innerHTML = `<svg viewBox="0 0 32 ${h}" aria-hidden="true"><g stroke="${TINTE}" stroke-width="0.3" stroke-linejoin="round" stroke-linecap="round">
    <rect x="5" y="${h - w}" width="26" height="${w}" fill="${wand}"/>
    <rect x="23" y="${h - w - 8}" width="3.4" height="8" fill="#B08A6E"/>
    <polygon points="3.5,${h - w} 18,${h - w - 10} 32.5,${h - w}" fill="${dach}"/>
    ${fenster(h - w + 5)}${hoch ? fenster(h - w + 16) : ""}
    <rect x="1.6" y="${h - 11}" width="1.1" height="11" fill="#8A5A3B"/>
    <rect x="0" y="${h - 14}" width="4.6" height="3.4" rx="0.8" fill="${post ? "#F2C94C" : "#4F8FB3"}"/>
    <g class="fahne" style="transform-origin:4.4px ${h - 12.8}px; transform: rotate(78deg)"><rect x="4" y="${h - 18}" width="0.55" height="5.4" fill="${TINTE}"/><rect x="4.5" y="${h - 18}" width="2.8" height="1.9" fill="#E5484D"/></g>
  </g></svg>
  <div class="nr${post ? " post" : ""}">${post ? "Post" : k}</div>
  <div class="tuer"><div class="innen"></div><div class="mat"></div><div class="blatt"><div class="schlitz"></div><div class="griff"></div></div></div>`;
  return el;
}

/** @type {HTMLElement[]} */
const haeuser = [];
{
  const teile = document.createDocumentFragment();
  for (let k = 0; k <= LETZTES_HAUS; k++) {
    const h = baueHaus(k);
    haeuser.push(h);
    teile.append(h);
  }
  strasse.append(teile);
}

/** Häuser, deren Tür für den Fortschritt offen bleibt (der Brief ist dort angekommen). @type {Set<number>} */
let besucht = new Set();

/** Öffnet die Tür von Haus k; in der Tür steht die Zahl als Goldmaterial. @param {number} k */
function oeffneTuer(k) {
  const haus = haeuser[k];
  const mat = /** @type {HTMLElement} */ (haus.querySelector(".mat"));
  mat.replaceChildren();
  const g = gold(k);
  if (g && g.zahl > 0) {
    const el = document.createElement("ls-goldmaterial");
    el.setAttribute("zahl", String(k));
    el.style.height = `${(g.hoehe * PERLE_TUER).toFixed(2)}rem`; // Perle 2 rem: bleibt zählbar, die Stange als Stange erkennbar
    mat.append(el);
  }
  haus.classList.add("offen");
}
/** Schließt die Tür von Haus k wieder (außer bei einem Haus, in dem der Brief angekommen ist). @param {number} k */
function schliesseTuer(k) {
  if (besucht.has(k)) return;
  const haus = haeuser[k];
  haus.classList.remove("offen");
  haus.querySelector(".mat")?.replaceChildren();
}
/** Alle Türen zu, nur die besuchten offen (nach der Einführung). */
function stelleTueren() {
  for (let k = 0; k <= LETZTES_HAUS; k++) {
    if (besucht.has(k)) {
      if (!haeuser[k].classList.contains("offen")) oeffneTuer(k);
    } else {
      haeuser[k].classList.remove("offen", "fahne-hoch");
      haeuser[k].querySelector(".mat")?.replaceChildren();
    }
  }
}

// --- Kamera ----------------------------------------------------------------------------------------------
/** Vor welchem Haus Timo steht. */
let hausBei = 0;
/** Verschiebung der Straße in px, damit Haus k vor Timo steht. @param {number} k */
const kameraX = (k) => (TIMO_X + HAUS_VOR_TIMO - RAND_LINKS - k * HAUS_ABSTAND) * remPx();
/** Stellt die Kamera auf Haus k, ohne Bewegung. @param {number} k */
function stelleKamera(k) {
  strasse.getAnimations().forEach((a) => a.cancel());
  strasse.style.transform = `translate3d(${kameraX(k).toFixed(1)}px, 0, 0)`;
}
addEventListener("resize", () => stelleKamera(hausBei));

// --- Timo --------------------------------------------------------------------------------------------------
timoKoerper.innerHTML = Runde.zeichne("timo", { haltung: "stehen", ansicht: "profil", blick: "rechts" });
const timo = Runde.steuere(timoKoerper.querySelector("svg"), { tempo: 0.7 });
/** Zähler der Fahrten: eine neue Fahrt beendet das Radschieben der alten. */
let fahrtNr = 0;

/** Timo schiebt die Räder, solange die Fahrt dauert (die Kamera trägt ihn, er bleibt am Platz). @param {number} nr @param {number} ms */
async function schiebeRaeder(nr, ms) {
  const bis = performance.now() + ms - 150;
  while (nr === fahrtNr && performance.now() < bis) await timo.bewegung("gehen");
}

/**
 * Timo rollt von Haus von nach Haus nach: immer FAHRT_MS, egal wie weit (weit heißt schneller, die Häuser huschen vorbei),
 * je Zehnerhaus ein leiser Tick. Danach steht er vor dem Haus. @param {number} von @param {number} nach @param {number} [ms]
 */
async function fahre(von, nach, ms = FAHRT_MS) {
  if (von === nach) return;
  timoKoerper.style.transform = nach < von ? "scaleX(-1)" : "";
  hausBei = nach;
  if (wenigBewegung()) {
    stelleKamera(nach);
    return;
  }
  const nr = ++fahrtNr;
  schiebeRaeder(nr, ms);
  rauschen(ms);
  /** @type {ReturnType<typeof setTimeout>[]} */
  const ticks = tickZeiten(von, nach, ms).map((t) => setTimeout(klang.tick, t));
  laufend.push(() => ticks.forEach(clearTimeout));
  const x0 = kameraX(von);
  const x1 = kameraX(nach);
  await anim(strasse, [{ transform: `translate3d(${x0.toFixed(1)}px, 0, 0)` }, { transform: `translate3d(${x1.toFixed(1)}px, 0, 0)` }], { duration: ms, easing: "cubic-bezier(0.42, 0, 0.58, 1)" });
  stelleKamera(nach);
  fahrtNr++;
  await timo.haltung("stehen", { ms: 120 });
}

/** Mitte eines Elements in px. @param {Element} el */
function mitte(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

// --- Umschlag --------------------------------------------------------------------------------------------
/** Welche Fassung der Umschlag zeigt (material, vorstellung, kopf; null: noch keine). @type {string | null} */
let bildStufe = null;
/** Felder des Umschlags: 2 (Z | E), 1 (E), 0 (freie Zeile). */
let felderJetzt = 2;

/** @param {0 | 1 | 2} felder */
function zeigeFelder(felder) {
  felderJetzt = felder;
  feldZ.hidden = felder !== 2;
  feldE.hidden = felder === 0;
  feldFrei.hidden = felder !== 0;
}
/** Die getippten Ziffern in die Felder des Umschlags. @param {string} text */
function setzeEingabe(text) {
  const setze = (/** @type {HTMLElement} */ feld, /** @type {string} */ z) => {
    const el = /** @type {HTMLElement} */ (feld.querySelector(".ziffer"));
    if (el.textContent === z) return;
    el.textContent = z;
    if (z && !wenigBewegung()) {
      el.classList.remove("sinkt");
      void el.offsetWidth;
      el.classList.add("sinkt");
    }
  };
  if (felderJetzt === 2) {
    setze(feldZ, text[0] ?? "");
    setze(feldE, text[1] ?? "");
  } else if (felderJetzt === 1) {
    setze(feldE, text);
  } else {
    setze(feldFrei, text);
  }
}
/** Material in einem Feld des Umschlags (Hilfe 1): z = Zehnerstangen, e = Perlen. @param {"z" | "e"} stelle @param {number} zahl */
function zeigeMaterial(stelle, zahl) {
  const feld = felderJetzt === 0 ? feldFrei : stelle === "z" ? feldZ : feldE;
  const mat = /** @type {HTMLElement} */ (feld.querySelector(".mat"));
  const ziel = felderJetzt === 0 ? /** @type {HTMLElement} */ (mat.querySelector(stelle === "z" ? ".mz" : ".me")) : mat;
  if (!ziel || zahl <= 0) return;
  ziel.replaceChildren();
  const g = document.createElement("ls-goldmaterial");
  g.setAttribute("zahl", String(zahl));
  // Perlen (Einer) groß in der Mitte des Felds, die Stange füllt ihr Feld in der Höhe.
  g.style.height = stelle === "e" ? "20rem" : "9.6rem";
  ziel.append(g);
}
function leereMaterial() {
  for (const f of [feldZ, feldE]) f.querySelector(".mat")?.replaceChildren();
  feldFrei.querySelectorAll(".mz, .me").forEach((m) => m.replaceChildren());
}
/** Ein neuer, leerer Umschlag liegt auf Timos Schoß (er kommt von oben herein). @param {number} n @param {string} stufe */
function neuerUmschlag(n, stufe) {
  umschlag.getAnimations().forEach((a) => a.cancel());
  umschlag.dataset.stufe = stufe;
  zeigeFelder(felderFuer(n, stufe));
  leereMaterial();
  setzeEingabe("");
  for (const f of [feldZ, feldE, feldFrei]) f.querySelector(".ziffer")?.replaceChildren();
  // Ohne Ton steht das Zahlwort geschrieben auf dem Umschlag (Annahme der Idee §10).
  wortEl.hidden = leiste.ton;
  wortEl.textContent = leiste.ton ? "" : (TEXTE?.wort?.[n] ?? "").replace(/\.$/, "");
  umschlag.style.visibility = "visible";
  return anim(umschlag, [{ transform: "translateY(-5rem)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 240, easing: "ease-out" });
}
/** Der Brief rutscht in den Schlitz an der Tür von Haus k (Plopp). @param {number} k */
async function briefEinwerfen(k) {
  const s = mitte(/** @type {Element} */ (haeuser[k].querySelector(".schlitz")));
  const u = mitte(umschlag);
  const dx = s.x - u.x;
  const dy = s.y - u.y;
  await anim(umschlag, [
    { transform: "none", opacity: 1, easing: "ease-in" },
    { transform: `translate(${(dx * 0.55).toFixed(1)}px, ${(dy * 0.55 - 4 * remPx()).toFixed(1)}px) scale(0.55) rotate(-8deg)`, opacity: 1, offset: 0.55, easing: "ease-in" },
    { transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(0.18) rotate(0deg)`, opacity: 0 },
  ], { duration: 340 });
  klang.plopp();
}
/** Witz: der Brief rutscht vom Schoß, und Timo fängt ihn. */
async function briefFangen() {
  await anim(umschlag, [
    { transform: "none", easing: "ease-in" },
    { transform: "translate(1rem, 7rem) rotate(24deg)", offset: 0.5, easing: "cubic-bezier(0.3, 1.6, 0.6, 1)" },
    { transform: "none" },
  ], { duration: 520 });
}

/** Die Fassung des Umschlags wechselt sichtbar (Regeln §8): Aufkleber ab (vorstellung) bzw. Farben weg (kopf), je 1,2 s; ein Tipp kürzt ab. @param {string} stufe */
async function wechsleStufe(stufe) {
  umschlag.dataset.stufe = stufe;
  await warte(wenigBewegung() ? 0 : WECHSEL_MS);
}

// =====================================================================================================
// AUFGABE
// =====================================================================================================

let vorigeFreude = /** @type {string | null} */ (null);
let seitWitz = 0;
/** Die Wirkung der letzten Lösung (die Folge wartet darauf). @type {Promise<any>} */
let wirkungFertig = Promise.resolve();
/** Die Einführung läuft: die Aufgabe nimmt keine Tasten an. */
let einfuehrungLaeuft = false;

/**
 * Timo freut sich, nie zweimal gleich: Fähnchen am Briefkasten klappt hoch, Pirouette, selten ein Wheelie (Idee §7).
 * @param {number} k Haus @param {string} art
 */
function freue(k, art) {
  if (art === "fahne") {
    haeuser[k].classList.add("fahne-hoch");
    timo.bewegung("huepfen");
  } else if (art === "pirouette") {
    timo.bewegung("pirouette");
  } else {
    timo.bewegung("wheelie");
  }
}

/**
 * Wirkung einer richtigen Antwort: Timo rollt zum Haus, der Brief rutscht in den Schlitz, die Tür springt auf und das
 * Goldmaterial der Hausnummer steht darin, dazu Freude (dauert insgesamt etwa 2,3 s).
 * @param {number} n @param {{ satz?: boolean, freude?: boolean }} [o]
 */
async function wirkungRichtig(n, { satz = false, freude = true } = {}) {
  const art = freude ? naechsteFreude(vorigeFreude) : null;
  if (art) vorigeFreude = art;
  let w = null;
  if (freude) {
    seitWitz++;
    w = witz(seitWitz, n, Math.abs(n - hausBei));
    if (w) seitWitz = 0;
  }
  await fahre(hausBei, n);
  if (w === "fangen") await briefFangen();
  await briefEinwerfen(n);
  besucht.add(n);
  oeffneTuer(n);
  klang.klingel();
  if (art) {
    if (w === "kreis") timo.bewegung("pirouette");
    else if (w === "wangen") timo.bewegung("pusten");
    else freue(n, art);
  }
  if (satz) erzaehler.bei(n);
  await warte(360);
}

/**
 * Wirkung einer Zahl, die nicht passt: Timo rollt trotzdem los, bis zur getippten Nummer. Der Brief bleibt auf dem Schoß,
 * die Tür geht auf, und man sieht, wie viel dort steht. Timo schaut auf den Brief, dann zur Tür (staunen).
 * @param {number} w die getippte Zahl @param {number} n die gesuchte
 */
async function wirkungDaneben(w, n) {
  await fahre(hausBei, w);
  oeffneTuer(w);
  klang.klingel();
  timo.haltung("staunen", { ms: 260 });
  klang.boing();
  await warte(260);
  // Danach sagt die Stimme das Zahlwort noch einmal; die Aufgabe bleibt.
  erzaehler.daneben(w);
  await erzaehler.wortNochmal(n);
}

/**
 * @param {{ ziel: { key: string, thema?: string }, stufe?: string }} aufgabe
 * @param {{ passtNicht: () => void, geloest: (key: string) => void }} melde
 */
function stelleAufgabe(aufgabe, melde) {
  const ziel = zahlAus(aufgabe.ziel.key);
  if (!ziel) throw new Error(`Zahlenpost: unbekannte Aufgabe ${aufgabe.ziel.key}`);
  ueberspringeAlles();
  const { n } = ziel;
  const stufe = aufgabe.stufe ?? "material";
  const felder = felderFuer(n, stufe);

  let eingabe = "";
  let fertig = false;
  let loesungGezeigt = false;
  let hilfeGezeigt = false;
  let versuche = 0;
  /** Ziffernfolgen, die bei dieser Aufgabe schon getippt wurden und nicht passten (nur für die Züge des Prüfstands). */
  const versucht = new Set();
  /** Das Bild eines Fehlversuchs (offene Tür, Timos Blick); das nächste Tippen räumt es weg. @type {(() => void) | null} */
  let fehlerBild = null;

  const zeige = () => {
    const sofort = neuerUmschlag(n, stufe);
    void sofort;
    eingabe = "";
  };
  zeige();

  const markiereNaechste = () => {
    const t = naechsteTaste(eingabe, n, felder);
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
    // Die Eingabe des Fehlversuchs steht noch auf dem Umschlag; die erste neue Taste beginnt von vorn.
    raeumeFehlerBild();
    eingabe = tippe(eingabe, taste, felder);
    setzeEingabe(eingabe);
    if (loesungGezeigt) markiereNaechste();
  };

  const pruefe = () => {
    if (fertig || einfuehrungLaeuft || !bereit(eingabe, felder)) return;
    const getippt = eingabe;
    const zahl = Number(getippt);
    eingabe = "";
    if (zahl === n) {
      fertig = true;
      abmelden();
      ohneMarkierung();
      // Gemeldet wird sofort (die Zeit der Aufgabe endet mit Fertig); die Wirkung läuft in der Zeit der Folge.
      melde.geloest(aufgabe.ziel.key);
      wirkungFertig = wirkungRichtig(n, { satz: versuche > 0 || hilfeGezeigt });
      return;
    }
    // Passt nicht: das Haus der getippten Zahl zeigt, wie viel dort steht (N7, nichts setzt zurück).
    versuche++;
    melde.passtNicht();
    versucht.add(getippt);
    ohneMarkierung();
    const lauf = wirkungDaneben(zahl, n);
    fehlerBild = () => {
      ueberspringeAlles();
      void lauf;
      schliesseTuer(zahl);
      setzeEingabe("");
      timo.haltung("stehen", { ms: 200 });
    };
    // Die getippten Ziffern bleiben auf dem Umschlag stehen; die Eingabe beginnt beim nächsten Tippen neu.
    eingabe = "";
    if (loesungGezeigt) lauf.then(markiereNaechste);
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
    // Prüfstand: Tasten zu den Zahlen, die ein ratendes Kind hier am ehesten tippt (Ergebnis, Zahlendreher, Nachbarn);
    // eine Zahl, die das Haus eben als „passt nicht“ gezeigt hat, tippt es nicht noch einmal.
    zuege() {
      if (fertig) return [];
      const start = fehlerBild ? "" : eingabe;
      const ziele = kandidaten(n, felder).filter((x) => !versucht.has(x));
      return tastenZu(start, ziele, felder).map(zug).filter(Boolean);
    },
    richtigerZug() {
      if (fertig) return null;
      return zug(naechsteTaste(fehlerBild ? "" : eingabe, n, felder));
    },
    /** Nach der Einführung über „Anleitung“: der Umschlag liegt wieder da, die Hilfe steht wieder. */
    async zeigeWieder() {
      zeige();
      if (hilfeGezeigt || loesungGezeigt) this.hilfe(loesungGezeigt ? 2 : 1);
    },
    /** @param {1 | 2} hilfeStufe */
    hilfe(hilfeStufe) {
      if (fertig) return;
      raeumeFehlerBild();
      hilfeGezeigt = true;
      const p = probeVon(n);
      if (hilfeStufe === 1) {
        // Probe: das Goldmaterial in der Reihenfolge des Wortes, zuerst die Perlen (Einer, rechts), dann die Stange (Zehner, links).
        leereMaterial();
        const satz = erzaehler.probe(n);
        zeigeMaterial("e", p.einer);
        if (p.zehner > 0) warte(650).then(() => zeigeMaterial("z", p.zehner));
        return satz;
      }
      // Lösung: die nächste Taste im Sonnenring; das Kind tippt selbst (L12).
      loesungGezeigt = true;
      markiereNaechste();
      return erzaehler.loesung(n);
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

/** Räumt die Bedienung der letzten Aufgabe ab (Timo und die Straße bleiben stehen, wo sie sind). @type {() => void} */
let aufraeumen = () => {};
function raeumeAuf() {
  ueberspringeAlles();
  aufraeumen();
  aufraeumen = () => {};
}

/**
 * Vor einer Aufgabe: Wechselt die Fassung des Umschlags (Stufe), geschieht es sichtbar in einer kurzen Szene (Regeln §8),
 * erst danach erscheint die Aufgabe. Ein Tipp irgendwo kürzt ab. @param {string} stufe
 */
async function bereiteBild(stufe) {
  stand.phase = "folge";
  ueberspringeAlles();
  if (bildStufe !== null && bildStufe !== stufe) {
    const abmelden = beimTippen(ueberspringeAlles);
    try {
      umschlag.style.visibility = "visible";
      await wechsleStufe(stufe);
    } finally {
      abmelden();
    }
  }
  bildStufe = stufe;
}

// =====================================================================================================
// EINFÜHRUNG im echten Spielbild (docs/spielbau.md §8, Idee §6)
// =====================================================================================================
// Schritt 1: die Stimme sagt „dreizehn“, die Tasten 1 und 3 sinken von selbst ein, Fertig, Timo rollt von der Post zur 13,
// die Tür springt auf. Schritt 2: „fünf“, der Sonnenring liegt auf der Taste, die das Kind tippt, dann Fertig; Timo rollt
// zur 5. Weiter geht es nur mit dem Tipp des Kindes, nie nach einer Zeit. Nicht gebucht.

/** Taste, auf der in der Einführung der Sonnenring liegt (für richtigerZug). @type {string | null} */
let einfuehrungTaste = null;

/** Eine Taste sinkt von selbst ein (Vormachen). @param {string} t */
function drueckeVor(t) {
  const el = t === "fertig" ? fertigKnopf : tastatur.shadowRoot.querySelector(`button[data-z="${t}"]`);
  if (!el) return;
  if (typeof el.animate === "function" && !wenigBewegung()) el.animate([{ transform: "translateY(0)" }, { transform: "translateY(0.7rem)", offset: 0.4 }, { transform: "translateY(0)" }], { duration: 260 });
}

/** Das Kind tippt die Folge von Tasten, je eine im Sonnenring; andere Tasten tun nichts. @param {string[]} folge @param {number} felder */
function kindTippt(folge, felder) {
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
        eingabe = tippe(eingabe, t, felder);
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

/** Spielt die Einführung in der Fassung der ersten Aufgabe. @param {string} [stufe] */
async function einfuehrung(stufe = "material") {
  einfuehrungLaeuft = true;
  try {
    stand.phase = "einfuehrung";
    ueberspringeAlles();
    // Timo rollt erst zur Post zurück (kein plötzlich anderes Bild), die Türen schließen sich.
    if (hausBei !== 0) await fahre(hausBei, 0, 900);
    besucht = new Set();
    stelleTueren();
    bildStufe = stufe;
    // Schritt 1: Timo macht es vor.
    await neuerUmschlag(13, stufe);
    const felder1 = felderFuer(13, stufe);
    await erzaehler.wort(13);
    let vor = "";
    for (const z of "13") {
      drueckeVor(z);
      vor = tippe(vor, z, felder1);
      setzeEingabe(vor);
      await warte(450);
    }
    drueckeVor("fertig");
    await warte(300);
    const satz1 = erzaehler.einfuehrungVor();
    await Promise.all([wirkungRichtig(13, { freude: false }), satz1]);
    await warte(500);
    // Schritt 2: das Kind tippt.
    await neuerUmschlag(5, stufe);
    await erzaehler.wort(5);
    const satz2 = erzaehler.einfuehrungDu();
    await satz2;
    await kindTippt(["5", "fertig"], felderFuer(5, stufe));
    await wirkungRichtig(5, { freude: false });
    await warte(400);
  } finally {
    ueberspringeAlles();
    einfuehrungLaeuft = false;
    einfuehrungTaste = null;
    tastatur.markiere(null);
    fertigKnopf.classList.remove("markiert");
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
    // Die Stimme sagt das Zahlwort, sobald der Umschlag da liegt.
    erzaehler.wort(/** @type {{ n: number }} */ (zahlAus(aufgabe.ziel.key)).n);
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
    const abmelden = beimTippen(() => {
      ueberspringeAlles();
      fertig();
    });
    wirkungFertig.catch(() => undefined).then(() => new Promise((w) => setTimeout(w, NACH_WIRKUNG_MS))).then(fertig);
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

/** Name eines Themas des Lernplans (für die Leiste). @param {string | undefined} id */
const themaName = (id) => (id ? ctx?.plan?.themen?.find((/** @type {any} */ t) => t.id === id)?.name ?? null : null);

/** Die Einführung lief schon (sie kommt bei jedem Start einmal, danach über „Anleitung“). */
let einfuehrungGespielt = false;

// „Anleitung“: die Einführung im Spielbild jederzeit wieder (während einer Aufgabe); danach steht die Aufgabe wieder da.
$("anleitung")?.addEventListener("click", async () => {
  if (stand.phase !== "aufgabe" || einfuehrungLaeuft) return;
  const merke = { haus: hausBei, besucht: new Set(besucht), aufgabe: offeneAufgabe, stufe: bildStufe ?? "material" };
  await einfuehrung(stand.lernstufe === "kopf" ? "kopf" : "material");
  // Zurück an den Ort vor der Einführung: Timo rollt zum Haus, die Türen stehen wieder wie vorher.
  await fahre(hausBei, merke.haus, 900);
  besucht = merke.besucht;
  stelleTueren();
  bildStufe = stand.lernstufe ?? merke.stufe;
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

  const beginn = Date.now();
  const zeitDa = () => Date.now() - beginn < rundenMs() - Math.min(LETZTE_AUFGABE_MS, rundenMs() / 4);
  const naechste = () => (zeitDa() ? aufStufe(r.naechste()) : null);
  let aufgabe = naechste();
  if (!aufgabe && vorschau) {
    r = vorschauRunde();
    aufgabe = naechste();
  }
  leiste.setAttribute("thema", r.thema);

  // Das Spiel beginnt mit der Einführung im echten Spielbild (bei jedem Start; in der Vorschau nur mit ?einfuehrung).
  const erste = zahlAus(aufgabe?.ziel?.key);
  if (!einfuehrungGespielt && erste && (!vorschau || params.has("einfuehrung"))) {
    einfuehrungGespielt = true;
    await einfuehrung(aufgabe?.stufe === "kopf" ? "kopf" : "material");
    r.einfuehrungGesehen();
  }
  $("anleitung")?.removeAttribute("hidden");

  while (aufgabe) {
    raeumeAuf();
    const z = zahlAus(aufgabe.ziel.key);
    if (z) {
      leiste.setAttribute("thema", themaName(aufgabe.ziel.thema) ?? r.thema);
      await bereiteBild(aufgabe.stufe ?? "material");
    }
    const e = await spieleAufgabe(aufgabe);
    const ergebnis = { key: e.key, ok: e.versuche === 0, hilfe: e.hilfe, ms: e.ms };
    r.melde(e.key, ergebnis);
    document.dispatchEvent(new CustomEvent("ls-ergebnis", { detail: ergebnis })); // für die Browser-Prüfung
    await warteFolge();
    aufgabe = naechste();
  }

  raeumeAuf();
  // Die Wirkung der letzten Lösung läuft zu Ende, dann spricht die Pause erst, wenn der letzte Satz zu Ende ist (kein Satz
  // wird abgeschnitten); steht die Stimme länger still als ein Satz dauert, geht es weiter.
  await wirkungFertig.catch(() => undefined);
  await Promise.race([sprechSchlange, new Promise((ok) => setTimeout(ok, SATZ_WARTE_MS))]);
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
  stelleKamera(0);
  umschlag.style.visibility = "hidden";
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
