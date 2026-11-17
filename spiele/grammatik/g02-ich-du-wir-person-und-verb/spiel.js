// G02 Ich, du, wir (Idee: docs/spiele/grammatik/g02-ich-du-wir-person-und-verb.md). Das Kind sitzt mit Kofi, Lena, Timo und
// Ela am Maltisch (Ich-Sicht). Auf seinem Platz liegt ein Wortstreifen mit einer Lücke: „du mal▢“, „▢ malen.“ oder
// „Ela mal[t]“ Es zieht ein Plättchen in die Lücke (Antippen von Plättchen und Lücke geht auch); auf der Stufe kopf
// schreibt es das Wort mit der Tastatur. Passt es, tun genau die Gemeinten es auf dem gemeinsamen Bogen: ich → die eigene
// Hand, du → Kofi (oder Lena), er → Timo, sie → Ela, wir → alle, ihr → Kofi und Lena. Passt es nicht, heben die den Stift,
// zu denen die Form gehört, und das Plättchen gleitet zurück; nichts wird zurückgesetzt.
//
// Aufbau wie die Spielvorlage (spiele/vorlage/spiel.js, dort die Schritte zum eigenen Spiel):
//   SPIELWELT  Kennung, Aufgabenarten, Sätze des Erzählers, Klänge
//   AUFGABE    Tisch, Runde, Bogen, Streifen, Ablage; eine Aufgabe darstellen, prüfen (die Sache urteilt), Hilfe-Stufen
//   EINFÜHRUNG im echten Spielbild (docs/spielbau.md §8): eine kleine Geschichte, das Kind zieht selbst
//   RAHMEN     aus der Vorlage; die Lernsteuerung bestimmt die Länge der Runde
//
// Vorschau-Parameter wie in der Vorlage (?pause, ?hinweis, ?eltern, ?einfuehrung, ?thema=, ?pruefen, ?stufe=).

import "../../rahmen/leiste.js";
import "../../rahmen/blase.js";
import "../../rahmen/hilfe.js";
import "../../rahmen/pause.js";
import "../../rahmen/knopf.js";
import "../../rahmen/wortart.js";
import "../../rahmen/tastatur.js";
import * as Runde from "../../runde/runde.js";
import "./runde.js";
import { ziehbar, zurueck } from "../../rahmen/ziehen.js";
import { meldePruefSchnittstelle, selektor, testbetrieb } from "../../rahmen/pruefen.js";
import { einfuehrungsLauf } from "../../rahmen/einfuehrung-lauf.js";
import { sperreTouch, protokoll, esc } from "../../lernspiel.js";
import { sprich } from "../../kern/stimme.js";
import { runde, einmal } from "../../lernsteuerung.js";
import { starteSpielzeit, amRundenende, sage } from "../../rahmen/spielzeit.js";
import { becherSvg, kisteSvg } from "./raum.js";
import { markeSvg, stiftSvg, kaeferSvg, handSvg, MARKEN_FARBEN, HAUTTOENE } from "./marken.js";
import {
  aufgabeAus, FUERWOERTER, BOGEN_PLAETZE, MAX_AUF_EINMAL, passt, richtigesPlaettchen, personDerAntwort, wirkende, plaettchenFuer, probeFuer,
  hebenStift, tippeBuchstabe, naechsterBuchstabe, tastenFuer, bildWechsel, bogenReicht, platzFuer, naechsteFreude, witz, akkordTon,
} from "./logik.js";

sperreTouch();

const $ = (/** @type {string} */ id) => /** @type {any} */ (document.getElementById(id));
const leiste = $("leiste");
const blase = $("blase");
const hilfe = $("hilfe");
const pause = $("pause");
const streifen = $("streifen");
const ablage = $("ablage");
const tastatur = $("tastatur");
const bogenEl = $("bogen");
const kaertchen = $("kaertchen");

// =====================================================================================================
// SPIELWELT
// =====================================================================================================

/** Kennung des Spiels: steht einmal in der HTML-Datei an <ls-leiste spiel>. */
const SPIEL_ID = leiste.getAttribute("spiel");

/** Aufgabenarten (gilt nur, solange das Spiel nicht in spiele.json steht; dort steht dasselbe). */
const ARTEN = [{ art: "verbform", ziele: ["endung", "pronomen"], stufen: ["material", "vorstellung", "kopf"] }];

/** Die Folge einer Lösung steht nach der Wirkung noch so lange, dann kommt die nächste Aufgabe (Tippen überspringt). */
const NACH_WIRKUNG_MS = 80;
/** Längstens so lange wartet die Folge auf das Ende der Wirkung (Regeln §1: etwa 2,5 s, höchstens 3 s). */
const FOLGE_MAX_MS = 2900;
/** Der Satz zu einem Wechsel steht mindestens so lange, auch ohne Ton. */
const WECHSEL_SATZ_MS = 1300;

/** Nur Vorschau: Aufgaben, falls die Lernsteuerung nichts liefert. */
const VORSCHAU = { thema: "Verb passt zur Person", aufgaben: ["verbform:endung:malen:du", "verbform:endung:kleben:wir", "verbform:endung:legen:er"] };

/** Sätze aus Daten (je Aufgabe ausgeschrieben, texte.json). */
const TEXTE = await fetch(new URL("texte.json", import.meta.url)).then((r) => r.json()).catch(() => null);

/** Der zuletzt begonnene Satz nach einer Lösung; vor dem nächsten Satz des Spiels wartet es darauf. @type {Promise<any>} */
let letzterSatz = Promise.resolve();

/** Der Erzähler (docs/stimme.md): beschreibt, was zu sehen ist, nie ein Urteil (grundsaetze.md 3.2). */
const erzaehler = {
  /** Der Streifen zum Noch-mal-hören (wird nicht von selbst gesprochen). @param {any} a */
  aufgabe: (a) => (TEXTE?.aufgabe?.[a.key] ? blase.sage(TEXTE.aufgabe[a.key], { sprechen: false }) : Promise.resolve("still")),
  /** Die Lösung als Satz, zugleich die Wirkung. @param {any} a @param {string} antwort */
  richtig: (a, antwort) => {
    const person = personDerAntwort(a, antwort);
    const satz = TEXTE?.richtig?.[`${a.verb}:${person}`];
    return satz ? blase.sage(satz) : Promise.resolve("still");
  },
  /** Hilfe 1, die Hörprobe: eine der Formen im selben Ton. @param {any} a @param {number} i */
  paar: (a, i) => (TEXTE?.hilfe1?.[a.key]?.[i] ? blase.sage(TEXTE.hilfe1[a.key][i]) : Promise.resolve("still")),
  /** Hilfe 2, die Lösung (das Kind legt oder schreibt selbst). */
  loesung: () => blase.sage("Kofi dreht das Kärtchen um."),
  /** Nach einem Fehlversuch ein klarer Auftrag (wie M06, M08). */
  nochmal: () => blase.sage("Versuch es noch einmal."),
  /** Die Stufe wechselt (Regeln §8). @param {string} stufe @param {string} ziel */
  wechsel: (stufe, ziel) => (stufe === "vorstellung" ? blase.sage("Jetzt zeigt nur der Satz, wer es tut.")
    : stufe === "kopf" ? (ziel === "pronomen" ? blase.sage("Jetzt schreibst du das Pronomen.") : blase.sage("Jetzt schreibst du das Verb."))
      : blase.sage("Jetzt hebt den Stift, wer es tut.")),
  gehtNicht: () => blase.sage("Das Spiel geht gerade nicht."),
};

/**
 * Die Sätze der Einführung (docs/spielbau.md §8): in Ruhe, als kleine Geschichte. Jeder steht als feste Zeichenkette
 * in blase.sage (für `npm run audio`).
 */
const einleitung = {
  malen: (/** @type {any} */ o) => blase.sage("Die Runde malt zusammen ein großes Bild.", o),
  tisch: (/** @type {any} */ o) => blase.sage("Du sitzt mit am Tisch.", o),
  kofi: (/** @type {any} */ o) => blase.sage("Kofi schaut dich an.", o),
  drueben: (/** @type {any} */ o) => blase.sage("Timo und Ela malen da drüben.", o),
  satz: (/** @type {any} */ o) => blase.sage("Hier liegt dein Satz.", o),
  luecke: (/** @type {any} */ o) => blase.sage("Am Verb fehlt das Ende.", o),
  endungen: (/** @type {any} */ o) => blase.sage("Hier liegen die Endungen.", o),
  jetztDu: (/** @type {any} */ o) => blase.sage("Jetzt du. Du sagst zu Kofi: du …", o),
  rutscht: (/** @type {any} */ o) => blase.sage("Passt es nicht, rutscht es zurück.", o),
  nochmal: (/** @type {any} */ o) => blase.sage("Dann probierst du es einfach noch einmal.", o),
  lernen: (/** @type {any} */ o) => blase.sage("So lernst du, wer was tut.", o),
  los: (/** @type {any} */ o) => blase.sage("Jetzt geht es los.", o),
  // kleine Einführungen für ein neues Ziel (Regeln §8: beim ersten Mal tippt das Kind das Neue selbst)
  fehlt: (/** @type {any} */ o) => blase.sage("Jetzt fehlt, wer es tut.", o),
};

/** Elternansicht (?eltern): beschreibend, von Stärken aus, kein Vergleich (3.3). @param {HTMLElement} feld */
function fuelleEltern(feld) {
  feld.innerHTML = `<p>Ihr Kind sitzt mit Kofi, Lena, Timo und Ela am Maltisch. Auf seinem Platz liegt ein Wortstreifen mit
    einer Lücke, etwa „du mal▢“. Es zieht eine Endung (-e, -st, -t, -en) in die Lücke oder setzt ein Pronomen (ich, du, er, sie,
    wir, ihr) vor das Verb. Passt es, malen, kleben oder bauen genau die Gemeinten auf dem
    gemeinsamen Bogen: bei „ich“ die eigene Hand, bei „du“ Kofi gegenüber. Passt es
    nicht, heben diejenigen den Stift, zu denen die gelegte Endung gehört, und das Plättchen gleitet zurück. So erlebt Ihr Kind, dass die Endung des Verbs von der
    Person abhängt.</p>
    <p>Als Hilfe spricht der Erzähler die Formen im selben Ton, danach dreht Kofi ein Kärtchen mit der Lösung um. Welche
    Verben dran sind und was Ihr Kind schon kann, steht bei den Themen im Elternbereich.</p>`;
}

/**
 * Pause (K1, K8): zwei Zettel zum Mitmachen (Idee §6).
 * @param {HTMLElement} feld @param {boolean} ton
 */
function fuelleSachmoment(feld, ton) {
  feld.replaceChildren();
  const zettel = document.createElement("div");
  zettel.className = "zettel";
  for (const t of ["ich male", "du malst"]) zettel.insertAdjacentHTML("beforeend", `<span>${t}</span>`);
  const satz = document.createElement("p");
  satz.textContent = "Malt zusammen: ich male, du malst.";
  feld.append(zettel, satz);
  if (ton) sprich("Malt zusammen: ich male, du malst.");
}

// --- Klänge (Web Audio, leise; Ton aus gilt) ---------------------------------------------------------
/** @type {AudioContext | null} */
let audio = null;
/** @param {number} hz @param {{ dauer?: number, typ?: OscillatorType, laut?: number, gleiten?: number, spaeter?: number }} [o] */
function ton(hz, { dauer = 0.13, typ = "triangle", laut = 0.07, gleiten = 0, spaeter = 0 } = {}) {
  if (!leiste.ton || lauf?.skip) return;
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
/** Kurzes Rauschen (Stift kratzt auf Papier). @param {number} dauer @param {number} laut */
function rauschen(dauer, laut) {
  if (!leiste.ton || lauf?.skip) return;
  try {
    audio ??= new AudioContext();
    if (audio.state === "suspended") audio.resume().catch(() => {});
    const n = Math.max(1, Math.floor(audio.sampleRate * dauer));
    const puffer = audio.createBuffer(1, n, audio.sampleRate);
    const d = puffer.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const quelle = audio.createBufferSource();
    quelle.buffer = puffer;
    const filter = audio.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 2600;
    const g = audio.createGain();
    g.gain.value = laut;
    quelle.connect(filter).connect(g).connect(audio.destination);
    quelle.start();
  } catch {
    // ohne Web Audio: still
  }
}
const klang = {
  /** Das Plättchen rastet ein: weiches Plopp mit Überschwingen. */
  plopp: () => { ton(740, { dauer: 0.1, typ: "sine", laut: 0.1, gleiten: 0.55 }); ton(1100, { dauer: 0.06, typ: "sine", laut: 0.03, spaeter: 0.04 }); },
  /** Der Stift kratzt über das Papier. */
  kratz: () => { rauschen(0.22, 0.05); ton(2200, { dauer: 0.18, typ: "sine", laut: 0.012, gleiten: 1.25 }); },
  /** Papier-Tapp: etwas liegt auf dem Bogen. */
  tapp: () => ton(520, { dauer: 0.07, typ: "triangle", laut: 0.06, gleiten: 0.7 }),
  /** Klötzchen-Klack. */
  klack: () => { ton(170, { dauer: 0.16, typ: "sine", laut: 0.14, gleiten: 0.6 }); ton(980, { dauer: 0.03, typ: "triangle", laut: 0.04 }); },
  /** Weiches Boing, das Plättchen gleitet zurück. */
  boing: () => ton(196, { dauer: 0.38, typ: "sine", laut: 0.06, gleiten: 1.5 }),
  /** Ein Ton je Gemeinten beim Akkord (wir). @param {number} i */
  akkord: (i) => ton(akkordTon(i), { dauer: 0.5, typ: "sine", laut: 0.05 }),
};

// =====================================================================================================
// AUFGABE
// =====================================================================================================

const wenigBewegung = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const remPx = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 10;

// --- Läufe: jede Wirkung läuft in einem Lauf; Tippen und die nächste Aufgabe springen ans Ende ---------------
/** @typedef {{ skip: boolean, anims: Set<Animation>, uhren: Set<() => void> }} Lauf */
/** @type {Lauf | null} */
let lauf = null;

/** Beginnt einen neuen Lauf (der alte springt ans Ende). @returns {Lauf} */
function neuerLauf() {
  ueberspringeAlles();
  lauf = { skip: wenigBewegung(), anims: new Set(), uhren: new Set() };
  return lauf;
}
/** Alles, was läuft, ist sofort im Endzustand; was danach kommt, ebenso. */
function ueberspringeAlles() {
  if (!lauf) return;
  lauf.skip = true;
  for (const a of [...lauf.anims]) {
    try { a.finish(); } catch { /* schon fertig */ }
  }
  for (const f of [...lauf.uhren]) f();
}
/** @param {number} ms */
function warte(ms) {
  const l = lauf;
  return new Promise((ok) => {
    if (!l || l.skip) return ok(undefined);
    const fertig = () => { clearTimeout(t); l.uhren.delete(fertig); ok(undefined); };
    const t = setTimeout(fertig, ms);
    l.uhren.add(fertig);
  });
}
/**
 * Spielt eine Animation, setzt danach den Endzustand als Stil und räumt sie ab.
 * @param {HTMLElement} el @param {Keyframe[]} frames @param {number} ms @param {Partial<CSSStyleDeclaration>} [ende]
 * @param {{ easing?: string, verzoegerung?: number }} [o]
 */
async function bewege(el, frames, ms, ende = {}, { easing = "ease-in-out", verzoegerung = 0 } = {}) {
  const l = lauf;
  if (!l || l.skip || typeof el.animate !== "function") {
    Object.assign(el.style, ende);
    return;
  }
  const a = el.animate(frames, { duration: ms, easing, delay: verzoegerung, fill: "forwards" });
  l.anims.add(a);
  await a.finished.catch(() => undefined);
  l.anims.delete(a);
  Object.assign(el.style, ende);
  a.cancel();
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

// --- Die Runde am Tisch ---------------------------------------------------------------------------------
/** Blickrichtung der Figuren: Kofi und Lena schauen das Kind an, Timo und Ela über ihr Papier zur Mitte. */
const BLICK = { kofi: "rechts", lena: "links", timo: "links", ela: "links" };
/** Die Haltung, in der jede(r) wartet. */
const RUHE = { kofi: "stehen", lena: "stehen", timo: "ueber-papier", ela: "ueber-papier" };
/** @type {Record<string, { el: HTMLElement, s: ReturnType<typeof Runde.steuere> }>} */
const fig = {};
for (const id of /** @type {const} */ (["kofi", "lena", "timo", "ela"])) {
  const el = $(`figur-${id}`);
  const koerper = el.querySelector(".koerper");
  koerper.innerHTML = Runde.zeichne(id, { haltung: RUHE[id], blick: BLICK[id] });
  fig[id] = { el, s: Runde.steuere(koerper.querySelector("svg")) };
}
/** Eine Figur in einer Haltung (ohne zu warten). @param {string} id @param {string} haltung @param {number} [ms] */
const haltung = (id, haltung, ms = 220) => { fig[id]?.s.haltung(haltung, { ms: lauf?.skip ? 0 : ms }); };
/** Die Figur wartet wieder. @param {string} id @param {number} [ms] */
const ruhe = (id, ms = 260) => haltung(id, RUHE[/** @type {keyof typeof RUHE} */ (id)], ms);

// Die eigenen Hände (Hautton wechselt je Start, Annahme der Idee §3).
const haut = HAUTTOENE[Math.floor(Math.random() * HAUTTOENE.length)];
$("hand-links").innerHTML = handSvg("links", haut, "#BFE3C9");
$("hand-rechts").innerHTML = handSvg("rechts", haut, "#BFE3C9");
const handRechts = $("hand-rechts");
handRechts.style.transition = wenigBewegung() ? "" : "transform 0.22s ease-out";

$("becher").innerHTML = becherSvg();
$("kiste").innerHTML = kisteSvg();

/** Wo ein Ding startet, wenn `wer` es auf den Bogen legt (Hand der Figur oder die eigene Hand). @param {string} wer @param {number} k Kantenlänge */
function handRect(wer, k) {
  if (wer === "ich") {
    const r = handRechts.getBoundingClientRect();
    return new DOMRect(r.left + r.width / 2 - k / 2, r.top + r.height * 0.1 - k / 2, k, k);
  }
  const r = fig[wer].el.getBoundingClientRect();
  const x = BLICK[/** @type {keyof typeof BLICK} */ (wer)] === "links" ? 0.36 : 0.64;
  return new DOMRect(r.left + r.width * x - k / 2, r.top + r.height * 0.56 - k / 2, k, k);
}

/** Wer den Stift hebt: die Figur in „am-bogen“ (gebeugter Arm, Faust mit dem Stift am Bogen), die eigene Hand ein Stück nach oben. @param {string} wer @param {boolean} hoch */
function hebe(wer, hoch) {
  if (wer === "ich") {
    handRechts.style.transform = hoch ? "translateY(-4rem) rotate(-6deg)" : "";
    return;
  }
  if (hoch) haltung(wer, "am-bogen", 200);
  else ruhe(wer);
}

// --- Der Papierbogen -------------------------------------------------------------------------------------
/** Was auf dem Bogen liegt: Platz → Marke. @type {(HTMLElement | null)[]} */
const marken = Array.from({ length: BOGEN_PLAETZE }, () => null);
let farbZaehler = 0;
const belegt = () => marken.map((m) => m !== null);

/** Eine Marke an ihren Platz legen (zuerst unsichtbar). @param {number} platz @param {string} verb @returns {HTMLElement} */
function legeMarke(platz, verb) {
  const spalte = platz % 6;
  const reihe = Math.floor(platz / 6);
  const m = document.createElement("div");
  m.className = "marke";
  m.innerHTML = markeSvg(verb, MARKEN_FARBEN[farbZaehler++ % MARKEN_FARBEN.length]);
  m.style.left = `calc(${((spalte + 0.5) / 6) * 100}% + ${((platz * 7) % 5 - 2) * 0.5}rem)`;
  m.style.top = `calc(${((reihe + 0.5) / 2) * 100}% + ${((platz * 3) % 5 - 2) * 0.4}rem)`;
  m.style.visibility = "hidden";
  m.dataset.farbe = MARKEN_FARBEN[(farbZaehler - 1) % MARKEN_FARBEN.length];
  bogenEl.append(m);
  marken[platz] = m;
  return m;
}

/** Ein leerer Bogen (kein Flug). */
function leereBogen() {
  for (let i = 0; i < marken.length; i++) {
    marken[i]?.remove();
    marken[i] = null;
  }
  bogenEl.style.transform = "";
  bogenEl.style.opacity = "";
}

/** Der Bogen ist voll: die Runde rollt ihn auf und legt einen neuen hin (≤ 1,5 s). */
async function neuerBogen() {
  await bewege(bogenEl, [{ transform: "scaleX(1)", opacity: 1 }, { transform: "scaleX(0.06)", opacity: 0.2 }], 600, { opacity: "0" }, { easing: "ease-in" });
  leereBogen();
  bogenEl.style.opacity = "0";
  klang.tapp();
  await bewege(bogenEl, [{ transform: "translateX(18rem)", opacity: 0 }, { transform: "translateX(0)", opacity: 1 }], 500, { opacity: "" }, { easing: "ease-out" });
  bogenEl.style.opacity = "";
}

// --- Streifen, Lücke, Ablage (bleiben für alle Aufgaben bestehen) -----------------------------------------------
const luecke = document.createElement("div");
luecke.className = "luecke";
luecke.id = "luecke";
luecke.setAttribute("name", "Lücke");

/** @type {Record<string, HTMLElement>} */
const plaettchen = {};
/** @param {string} id @param {string} text @param {string} wert */
function baueTeil(id, text, wert) {
  const p = document.createElement("button");
  p.type = "button";
  p.className = "teil plaettchen";
  p.id = `p-${id}`;
  p.dataset.wert = wert;
  p.setAttribute("aria-label", text);
  p.textContent = text;
  p.hidden = true;
  // lose hingelegt: jedes Plättchen etwas schräg und etwas höher oder tiefer
  const nr = Object.keys(plaettchen).length;
  p.style.rotate = `${[-3.2, 2.4, -1.6, 3.4, -2.4, 1.8][nr % 6]}deg`;
  p.style.marginTop = `${[0.5, -0.3, 0.9, -0.2, 0.7, 0][nr % 6]}rem`;
  ablage.insertBefore(p, tastatur);
  plaettchen[id] = p;
}
for (const e of ["e", "st", "t", "en"]) baueTeil(`e-${e}`, `-${e}`, e);
for (const f of FUERWOERTER) baueTeil(`f-${f}`, f, f);
/** Die Plättchen, die zu einer Aufgabe gehören (Endung oder Fürwort). @param {any} a */
const plaettchenVon = (a) => (a.ziel === "pronomen" ? FUERWOERTER.map((f) => ({ wert: f, el: plaettchen[`f-${f}`] })) : plaettchenFuer(a).map((e) => ({ wert: e, el: plaettchen[`e-${e}`] })));
/** Das Plättchen zu einem Wert. @param {any} a @param {string} wert */
const teilFuer = (a, wert) => plaettchenVon(a).find((t) => t.wert === wert)?.el ?? null;

/** Was gerade auf dem Tisch liegt. */
const B = {
  /** @type {any} */ a: null,
  stufe: "material",
  /** leer, start (Aufgabe steht), loesung (gelöst, Wirkung läuft oder steht) */
  lage: "leer",
  /** Aufgabe, die gerade offen ist (für die Ablage der Plättchen). @type {null | { ablegen: (teil: HTMLElement) => void }} */
  offen: null,
  /** Letzte Stufe, auf der eine Aufgabe gestellt wurde (für den Wechsel). @type {string | null} */
  letzteStufe: null,
  letztesZiel: /** @type {string | null} */ (null),
};
/** Schließt die laufende Wirkung ab (Endzustand von Bogen und Runde), damit nichts halb liegen bleibt. @type {(() => void) | null} */
let schliesse = null;

/** Die Ziele der Plättchen: nur die Lücke, solange eine Aufgabe offen ist. */
const ziele = () => (B.lage === "start" ? [luecke] : []);
for (const p of Object.values(plaettchen)) ziehbar(p, { ziele, beimAblegen: (teil) => (B.offen ? B.offen.ablegen(teil) : zurueck(teil)) });

/** @param {string} tag @param {string} klasse @param {string} [html] */
function neu(tag, klasse, html = "") {
  const el = document.createElement(tag);
  el.className = klasse;
  el.innerHTML = html;
  return el;
}

/** Ein Teil des Spielbildes ist weg (Aufgabe, Wechsel): laufende Wirkungen schließen sich ab. */
function raeumeAb() {
  const s = schliesse;
  schliesse = null;
  s?.();
}

/** Ein Wort im Streifen, auf Wunsch mit dem roten Verbkreis darüber (D1). @param {string} text @param {boolean} [verb] */
const wortEl = (text, verb = false) => neu("span", "wort", `${verb ? `<ls-wortart art="verb"></ls-wortart>` : ""}<b>${esc(text)}</b>`);

/**
 * Legt den Wortstreifen und die Ablage für eine Aufgabe. Die Gemeinten heben auf der Stufe material schon den Stift (die
 * Szene zeigt, wer gemeint ist); sonst sitzen alle gleich still.
 * @param {any} a @param {string} stufe
 */
function legeStreifen(a, stufe) {
  raeumeAb();
  B.a = a;
  B.stufe = stufe;
  B.lage = "start";
  luecke.replaceChildren();
  luecke.className = "luecke";
  streifen.replaceChildren();
  const kopf = stufe === "kopf";
  // Der Wortstreifen ist ein Papierstück auf dem Holz; die Lücke ist sein abgeschnittenes Ende (Kerbe mit Naht), kein Kasten.
  const papier = (/** @type {Node[]} */ ...teile) => { const p = neu("span", "papier"); p.append(...teile); return p; };
  if (a.ziel === "endung") streifen.append(papier(wortEl(a.pronomen), wortEl(a.stamm, true)), luecke);
  else streifen.append(luecke, papier(wortEl(`${a.form}.`, true)));
  streifen.setAttribute("aria-label", `Lücke ${a.ziel === "pronomen" ? a.form : `${a.pronomen} ${a.stamm}`}`);

  // Ablage: Plättchen oder (kopf) die Tastatur
  for (const p of Object.values(plaettchen)) {
    p.hidden = true;
    p.classList.remove("verborgen", "klingt", "markiert", "gesetzt", "angehoben", "gezogen");
    p.style.translate = "";
    p.style.transform = "";
  }
  tastatur.hidden = !kopf;
  if (kopf) {
    tastatur.setAttribute("tasten", tastenFuer(a));
    tastatur.markiere(null);
  } else {
    for (const t of plaettchenVon(a)) t.el.hidden = false;
  }

  // Haltungen der Runde: auf material heben die Gemeinten den Stift und schauen, sonst sitzen alle gleich still.
  const gemeint = stufe === "material" ? wirkende(a, richtigesPlaettchen(a)) : [];
  for (const id of Object.keys(fig)) {
    if (gemeint.includes(id)) hebe(id, true);
    else ruhe(id, 200);
  }
  hebe("ich", gemeint.includes("ich"));
  erzaehler.aufgabe(a);
}

// --- Flüge ----------------------------------------------------------------------------------------------------
/** Ebene für fliegende Dinge, über allem Bild. */
const fluege = document.createElement("div");
Object.assign(fluege.style, { position: "fixed", inset: "0", zIndex: "8", pointerEvents: "none", overflow: "hidden" });
document.body.append(fluege);

/** Ein fliegendes Ding aus HTML in der Größe von `von` an dessen Stelle. @param {string} html @param {DOMRect} von @param {string} [klasse] */
function flugDing(html, von, klasse = "") {
  const el = neu("div", `flug ${klasse}`, html);
  Object.assign(el.style, { width: `${von.width}px`, height: `${von.height}px`, transformOrigin: "0 0", transform: `translate(${von.left}px, ${von.top}px)` });
  fluege.append(el);
  return el;
}

/**
 * Das Ding fliegt im Bogen von `von` nach `nach` (Rechtecke), zuletzt skaliert auf die Größe von `nach`.
 * @param {HTMLElement} el @param {DOMRect} von @param {DOMRect} nach @param {number} ms
 * @param {{ bogen?: number, dreh?: number }} [o] bogen in rem
 */
async function flieg(el, von, nach, ms, { bogen = 6, dreh = 0 } = {}) {
  const s = nach.width / von.width;
  const rem = remPx();
  const mitte = `translate(${von.left + (nach.left - von.left) * 0.5}px, ${Math.min(von.top, nach.top) - bogen * rem}px) scale(${1 + (s - 1) * 0.5}) rotate(${dreh}deg)`;
  const ende = `translate(${nach.left}px, ${nach.top}px) scale(${s})`;
  await bewege(el, [{ transform: `translate(${von.left}px, ${von.top}px) scale(1)` }, { transform: mitte, offset: 0.5 }, { transform: ende }], ms, { transform: ende }, { easing: "cubic-bezier(.4,.05,.35,1)" });
}

// --- Wirkungen -----------------------------------------------------------------------------------------------
/** Die Wirkung der letzten Lösung (die Folge wartet darauf). @type {Promise<any>} */
let wirkungFertig = Promise.resolve();
let vorigeFreude = /** @type {string | null} */ (null);
let seitHuepfen = 0;
let seitWitz = 0;
let nachFehler = false;

/** Das Plättchen in der Lücke: flach, ohne Schatten (Endung oder Fürwort). @param {string} text */
const eingerastetEl = (text) => neu("span", "eingerastet", esc(text));

/**
 * Richtig: Das Plättchen rastet ein, der Erzähler liest den Streifen, und genau die Gemeinten tun es: Sie heben den Stift,
 * ihr Ding fliegt im Bogen auf den Bogen und bleibt dort liegen. Etwa 2,2 s; ein Tipp springt ans Ende (Regeln §1).
 * @param {any} a @param {string} antwort @param {{ freude?: boolean }} [o]
 */
async function wirkungRichtig(a, antwort, { freude = true } = {}) {
  const wer = wirkende(a, antwort);
  const traeger = wer;
  const k = 12.6 * remPx();
  /** @type {HTMLElement[]} */
  const klone = [];
  /** @type {{ wer: string, marke: HTMLElement }[]} */
  const ziel = [];
  let aus = false;
  const schliessen = () => {
    if (aus) return;
    aus = true;
    for (const f of klone) f.remove();
    for (const z of ziel) z.marke.style.visibility = "visible";
    for (const id of Object.keys(fig)) ruhe(id, 0);
    hebe("ich", false);
    if (schliesse === schliessen) schliesse = null;
  };
  schliesse = schliessen;
  B.lage = "loesung";

  // Plätze auf dem Bogen: reicht er nicht, ist er schon beim Legen der Aufgabe aufgerollt worden.
  const bel = belegt();
  for (const w of traeger) {
    const platz = platzFuer(bel, w) ?? marken.findIndex((m) => m === null);
    if (platz < 0) continue;
    bel[platz] = true;
    ziel.push({ wer: w, marke: legeMarke(platz, a.verb) });
  }

  // 1. Plopp: das Plättchen rastet in der Lücke ein (kopf: das Wort steht schon da).
  luecke.classList.add("voll");
  if (B.stufe !== "kopf") {
    luecke.append(eingerastetEl(antwort));
    bewege(/** @type {HTMLElement} */ (luecke.lastElementChild), [{ transform: "scale(0.9)" }, { transform: "scale(1.1)", offset: 0.55 }, { transform: "scale(1)" }], 220);
  }
  klang.plopp();
  await warte(240);
  if (aus) return;

  // 2. Die Gemeinten heben den Stift und lassen ihr Ding auf den Bogen fliegen (nacheinander, je 90 ms später).
  const lustig = freude && wer.length > 0 && witz(seitWitz, nachFehler);
  const flug = ziel.map(async (z, i) => {
    await warte(i * 90);
    if (aus) return;
    hebe(z.wer, true);
    const von = handRect(z.wer, k);
    const nach = z.marke.getBoundingClientRect();
    const farbe = z.marke.dataset.farbe ?? MARKEN_FARBEN[0];
    const ding = flugDing(a.verb === "malen" ? stiftSvg(farbe) : markeSvg(a.verb, farbe), von);
    klone.push(ding);
    await warte(150);
    if (aus) return;
    await flieg(ding, von, nach, 560, { bogen: 7, dreh: z.wer === "ich" ? 8 : -10 });
    if (aus) return;
    ding.remove();
    z.marke.style.visibility = "visible";
    if (wer.length === 5) klang.akkord(i);
    else if (a.verb === "malen") klang.kratz();
    else if (a.verb === "bauen" || a.verb === "legen") klang.klack();
    else klang.tapp();
    // malen: der Strich entsteht, sonst setzt das Ding auf (Stauchen, dann zurück)
    if (a.verb === "malen") bewege(z.marke, [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }], 260, { clipPath: "" }, { easing: "ease-out" });
    else bewege(z.marke, [{ transform: "scale(0.7)" }, { transform: "scale(1.12)", offset: 0.55 }, { transform: "scale(1)" }], 220);
    hebe(z.wer, false);
  });
  await Promise.all(flug);
  if (aus) return;

  // 3. Freude: ein Gemeinter nickt, winkt oder hüpft; ab und zu kommt der kleine Witz (Idee §7).
  if (freude) freudeDer(wer, lustig);
  if (lustig) seitWitz = 0;
  else seitWitz++;
  if (!lauf?.skip) await warte(120);
  schliessen();
}

/**
 * Die Freude nach einer richtigen Antwort: zwei bis drei Varianten, nie zweimal dieselbe; ab und zu der kleine Witz.
 * @param {string[]} wer @param {boolean} lustig
 */
function freudeDer(wer, lustig) {
  const figuren = wer.filter((w) => w !== "ich");
  if (lustig) {
    kaefer();
    return;
  }
  if (!figuren.length) return;
  const art = naechsteFreude(vorigeFreude, seitHuepfen);
  vorigeFreude = art;
  seitHuepfen = art === "huepfen" ? 0 : seitHuepfen + 1;
  const id = figuren[Math.floor(Math.random() * figuren.length)];
  fig[id].s.bewegung(art)?.then?.(() => ruhe(id, 200)).catch?.(() => undefined);
}

/** Der Witz: Lena malt dem Kind einen kleinen Käfer an seinen Platz. */
function kaefer() {
  if (lauf?.skip) return;
  const k = 5.6 * remPx();
  const von = handRect("lena", k);
  const nachR = streifen.getBoundingClientRect();
  const nach = new DOMRect(nachR.left + 2 * remPx(), nachR.top - k * 0.8, k, k);
  const el = flugDing(kaeferSvg(), von);
  haltung("lena", "zeigen", 180);
  flieg(el, von, nach, 640, { bogen: 5, dreh: 10 }).then(async () => {
    klang.tapp();
    await bewege(el, [{ opacity: 1 }, { opacity: 1, offset: 0.7 }, { opacity: 0 }], 1100);
    el.remove();
    ruhe("lena", 200);
  });
}

/**
 * Daneben: Das Plättchen legt sich an, rastet nicht ein, kippt leicht schräg, weiches Boing, gleitet zurück; die, zu denen
 * die gelegte Endung (das Fürwort) gehört, heben kurz den Stift und schauen zum Streifen, die Gemeinten warten. Kein
 * falsches Paar wird gesprochen. Nichts wird zurückgesetzt. Das echte Plättchen liegt sofort wieder an seinem Platz
 * (blass); eine Kopie macht den Weg, damit die Lücke frei bleibt. Ohne Plättchen (Tastatur) wackelt nur die Lücke.
 * @param {any} a @param {string} antwort @param {HTMLElement | null} teil @param {DOMRect | null} abgelegt wo es losgelassen wurde
 */
async function wirkungDaneben(a, antwort, teil, abgelegt) {
  neuerLauf();
  nachFehler = true;
  klang.boing();
  const heber = hebenStift(a, antwort);
  for (const w of heber) hebe(w, true);
  setTimeout(() => { if (B.lage === "start") for (const w of heber) hebe(w, false); }, lauf?.skip ? 0 : 1200);
  if (!teil || !abgelegt) {
    await bewege(luecke, [{ transform: "rotate(0deg)" }, { transform: "rotate(-3deg)", offset: 0.25 }, { transform: "rotate(2.5deg)", offset: 0.6 }, { transform: "rotate(0deg)" }], 420, {}, { easing: "ease-in-out" });
    return;
  }
  const heim = teil.getBoundingClientRect();
  const kopie = /** @type {HTMLElement} */ (teil.cloneNode(true));
  kopie.removeAttribute("id");
  kopie.classList.remove("gezogen", "angehoben", "gedrueckt", "markiert", "klingt");
  kopie.style.cssText = "";
  kopie.classList.add("flug");
  Object.assign(kopie.style, { width: `${abgelegt.width}px`, height: `${abgelegt.height}px`, transformOrigin: "50% 50%", transform: `translate(${abgelegt.left}px, ${abgelegt.top}px)` });
  fluege.append(kopie);
  teil.style.opacity = "0.35";
  const lr = luecke.getBoundingClientRect();
  const x = lr.left + lr.width / 2 - abgelegt.width / 2;
  const y = lr.top + lr.height / 2 - abgelegt.height / 2;
  try {
    // anlegen, schräg kippen, nicht einrasten
    await bewege(kopie, [{ transform: `translate(${abgelegt.left}px, ${abgelegt.top}px)` }, { transform: `translate(${x}px, ${y}px)` }], 160, { transform: `translate(${x}px, ${y}px)` }, { easing: "ease-out" });
    await bewege(kopie, [{ transform: `translate(${x}px, ${y}px) rotate(0deg)` }, { transform: `translate(${x}px, ${y}px) rotate(9deg)`, offset: 0.45 }, { transform: `translate(${x}px, ${y}px) rotate(-3deg)`, offset: 0.8 }, { transform: `translate(${x}px, ${y}px) rotate(4deg)` }], 340, { transform: `translate(${x}px, ${y}px) rotate(4deg)` }, { easing: "ease-out" });
    // ruhig zurückgleiten an den Platz
    await bewege(kopie, [{ transform: `translate(${x}px, ${y}px) rotate(4deg)` }, { transform: `translate(${heim.left}px, ${heim.top}px) rotate(0deg)` }], 420, { transform: `translate(${heim.left}px, ${heim.top}px)` }, { easing: "ease-in-out" });
  } finally {
    kopie.remove();
    teil.style.opacity = "";
  }
}

// --- Stelle eine Aufgabe -------------------------------------------------------------------------------------
/**
 * Zeigt eine Aufgabe und meldet dem RAHMEN nur zwei Dinge: melde.passtNicht() und melde.geloest(key).
 * Zurück kommt { hilfe(stufe), zuege(), richtigerZug(), spielZug(wert), abbau() }.
 * @param {{ ziel: { key: string }, stufe?: string }} aufgabe
 * @param {{ passtNicht: () => void, geloest: (key: string) => void }} melde
 */
function stelleAufgabe(aufgabe, melde) {
  const a = aufgabeAus(aufgabe.ziel.key);
  if (!a) throw new Error(`G02: unbekannte Aufgabe ${aufgabe.ziel.key}`);
  let fertig = false;
  let probe = 0;
  let loesungGezeigt = false;
  const stufe = aufgabe.stufe ?? "material";
  const kopf = stufe === "kopf";
  /** Was das Kind auf der Stufe kopf bisher geschrieben hat. */
  let eingabe = "";
  legeStreifen(a, stufe);

  const ohneMarkierung = () => {
    for (const p of Object.values(plaettchen)) p.classList.remove("markiert", "klingt");
    luecke.classList.remove("markiert", "klingt", "geist");
    tastatur.markiere?.(null);
  };

  /** Die Aufgabe ist gelöst (Plättchen oder Wort). @param {string} antwort */
  const loese = (antwort) => {
    fertig = true;
    probe++; // laufende Hörprobe abbrechen
    ohneMarkierung();
    neuerLauf();
    letzterSatz = erzaehler.richtig(a, antwort);
    const freude = !nachFehler;
    wirkungFertig = wirkungRichtig(a, antwort, { freude }).catch((e) => protokoll(`${SPIEL_ID}: Wirkung: ${e?.message ?? e}`));
    nachFehler = false;
    melde.geloest(a.key);
  };

  /** Ein Plättchen liegt über der Lücke. @param {HTMLElement} teil */
  const ablegen = (teil) => {
    const wert = teil.dataset.wert ?? "";
    if (fertig || B.lage !== "start") return zurueck(teil);
    if (!passt(a, wert, stufe)) {
      const abgelegt = teil.getBoundingClientRect();
      teil.style.translate = "";
      zurueck(teil);
      wirkungDaneben(a, wert, teil, abgelegt);
      melde.passtNicht();
      if (!fertig) erzaehler.nochmal();
      return;
    }
    teil.classList.add("verborgen");
    teil.style.transform = "";
    zurueck(teil);
    loese(wert);
  };
  B.offen = { ablegen };

  // Stufe kopf: das Kind schreibt nur die Endung (bei Fürwörtern das Fürwort), Buchstabe für Buchstabe; der Stamm bleibt sichtbar.
  /** @param {any} e */
  const beiTaste = (e) => {
    if (fertig || B.lage !== "start") return;
    const z = e.detail.zeichen;
    const r = tippeBuchstabe(a, eingabe, z);
    if (!r.ok) {
      wirkungDaneben(a, "", null, null);
      melde.passtNicht();
      if (!fertig) erzaehler.nochmal();
      return;
    }
    eingabe = r.eingabe;
    if (r.fertig) {
      luecke.textContent = eingabe;
      loese(eingabe);
      return;
    }
    luecke.classList.remove("geist");
    luecke.textContent = eingabe;
    if (loesungGezeigt) tastatur.markiere(naechsterBuchstabe(a, eingabe));
  };
  if (kopf) tastatur.addEventListener("taste", beiTaste);

  /** Lösung mit Begründung (L12): Kofi dreht das Kärtchen um, die richtige Stelle bekommt den Sonnenring. */
  const zeigeLoesung = () => {
    ohneMarkierung();
    const hinten = kaertchen.querySelector(".hinten");
    if (hinten) hinten.textContent = a.ziel === "pronomen" ? a.pronomen : `-${a.endung}`;
    const dreher = /** @type {HTMLElement} */ (kaertchen.querySelector(".dreher"));
    dreher.style.transition = "";
    dreher.style.transform = "";
    kaertchen.style.left = `calc(50% + var(--sp) * -62rem - 7.5rem)`;
    kaertchen.classList.add("da");
    void dreher.offsetWidth;
    if (!wenigBewegung()) dreher.style.transition = "transform 0.45s ease-in-out";
    dreher.style.transform = "rotateY(180deg)";
    haltung("kofi", "zeigen", 200);
    if (kopf) tastatur.markiere(naechsterBuchstabe(a, eingabe));
    else teilFuer(a, richtigesPlaettchen(a))?.classList.add("markiert");
    erzaehler.loesung();
  };

  /** Hörprobe (Hilfe 1): die Möglichkeiten leuchten nacheinander, der Erzähler spricht sie im selben Ton. */
  const hoerprobe = async () => {
    const nr = ++probe;
    ohneMarkierung();
    /** Die Möglichkeiten in der Reihenfolge der Sätze in texte.json. */
    const moeglich = a.ziel === "pronomen" ? FUERWOERTER.filter((p) => passt(a, p, "kopf")) : probeFuer(a);
    for (let i = 0; i < moeglich.length; i++) {
      if (nr !== probe || fertig) break;
      const wert = moeglich[i];
      const el = kopf ? luecke : teilFuer(a, wert);
      if (kopf) {
        luecke.textContent = wert;
        luecke.classList.add("geist");
      } else el?.classList.add("klingt");
      await erzaehler.paar(a, i);
      if (!kopf) el?.classList.remove("klingt");
    }
    if (kopf && !fertig) {
      luecke.classList.remove("geist");
      luecke.textContent = eingabe;
    }
  };

  /** @param {string} wert */
  const plaettchenZug = (wert) => ({ art: "ziehen", von: selektor(/** @type {Element} */ (teilFuer(a, wert))), nach: selektor(luecke) });
  /** @param {string} z */
  const tastenZug = (z) => {
    const knopf = [...tastatur.shadowRoot.querySelectorAll("button[data-z]")].find((k) => /** @type {HTMLElement} */ (k).dataset.z === z);
    return knopf ? { art: "tippen", von: selektor(knopf) } : null;
  };

  return {
    zuege() {
      if (fertig) return [];
      if (kopf) return [...tastenFuer(a)].map(tastenZug).filter(Boolean);
      return plaettchenVon(a).map((t) => plaettchenZug(t.wert));
    },
    richtigerZug() {
      if (fertig) return null;
      if (kopf) {
        const z = naechsterBuchstabe(a, eingabe);
        return z ? tastenZug(z) : null;
      }
      return plaettchenZug(richtigesPlaettchen(a));
    },
    /** @param {1 | 2} s */
    hilfe(s) {
      if (fertig) return;
      if (s === 1) {
        hoerprobe();
        return;
      }
      probe++;
      loesungGezeigt = true;
      if (kopf) {
        luecke.classList.remove("geist");
        luecke.textContent = eingabe;
      }
      zeigeLoesung();
    },
    /** Für die Einführung: das Plättchen zieht selbst in die Lücke (wie ein Kind) und rastet ein. @param {string} wert */
    async spielZug(wert) {
      const teil = /** @type {HTMLElement} */ (teilFuer(a, wert));
      const von = teil.getBoundingClientRect();
      const nach = luecke.getBoundingClientRect();
      const dx = nach.left + nach.width / 2 - (von.left + von.width / 2);
      const dy = nach.top + nach.height / 2 - (von.top + von.height / 2);
      await bewege(teil, [{ transform: "translate(0, 0)" }, { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 3 * remPx()}px) scale(1.06)`, offset: 0.5 }, { transform: `translate(${dx}px, ${dy}px)` }], 760, { transform: "" }, { easing: "ease-in-out" });
      ablegen(teil);
    },
    abbau() {
      B.offen = null;
      probe++;
      ohneMarkierung();
      tastatur.removeEventListener("taste", beiTaste);
      kaertchen.classList.remove("da");
    },
  };
}

// --- Szenen zwischen den Aufgaben ------------------------------------------------------------------------------
/** Sonnenring auf Dingen der Einführung (Hände, Figuren, Streifen, Lücke, Plättchen). @type {Element[]} */
let ringAuf = [];
/** @param {(Element | null)[]} els */
function ring(els) {
  for (const el of ringAuf) el.classList.remove("markiert");
  ringAuf = /** @type {Element[]} */ (els.filter(Boolean));
  for (const el of ringAuf) el.classList.add("markiert");
}

/**
 * Vor jeder Aufgabe: ein voller Bogen wird aufgerollt; wechselt die Stufe, erzählt eine kurze Szene den Wechsel (Regeln §8:
 * kein Wechsel ohne Bild): die Runde legt die Stifte hin und setzt sich gerade (≤ 1,5 s).
 * @param {{ ziel: { key: string }, stufe?: string }} aufgabe
 */
async function bereiteAufgabe(aufgabe) {
  stand.phase = "folge";
  neuerLauf();
  raeumeAb();
  const a = aufgabeAus(aufgabe.ziel.key);
  const stufe = aufgabe.stufe ?? "material";
  const wechsel = bildWechsel(B.letzteStufe, stufe);
  /** @type {() => void} */
  let getippt = () => {};
  const tipp = new Promise((ok) => { getippt = () => ok(undefined); });
  const abmelden = beimTippen(() => {
    ueberspringeAlles();
    getippt();
  });
  try {
    let gesagt = Promise.resolve();
    if (wechsel) {
      await Promise.race([letzterSatz, tipp]);
      gesagt = erzaehler.wechsel(wechsel, a?.ziel ?? "endung").catch(() => undefined);
      for (const id of Object.keys(fig)) haltung(id, "stehen", 200);
      hebe("ich", false);
      if (B.lage !== "leer") await bewege(streifen, [{ opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: "translateY(2rem)" }], 400, { opacity: "", transform: "" }, { easing: "ease-in" });
    }
    if (!bogenReicht(marken.filter(Boolean).length, MAX_AUF_EINMAL)) await neuerBogen();
    if (wechsel) {
      await Promise.race([Promise.all([gesagt, warte(WECHSEL_SATZ_MS)]), tipp]);
      for (const id of Object.keys(fig)) ruhe(id, 240);
    }
  } finally {
    abmelden();
  }
  B.letzteStufe = stufe;
  B.letztesZiel = a?.ziel ?? null;
}

// =====================================================================================================
// EINFÜHRUNG im echten Spielbild (docs/spielbau.md §8, Idee §6)
// =====================================================================================================
// Eine kleine Geschichte: die Runde, die Hände, der Streifen, die Lücke, die Ablage – je mit dem Sonnenring; Timo zieht
// „-t“ an „er mal“; dann zieht das Kind selbst „-st“ an „du mal“. Für Fürwörter kommt danach nur das Neue
// dazu (je ein Zug des Kindes). Nicht gebucht.

/** Die Einführung: Sätze, Hilfe und Zug für den Prüfstand (rahmen/einfuehrung-lauf.js). */
const stand = { phase: "laden", aufgabe: /** @type {string | null} */ (null), nr: 0, versuche: 0, hilfeStufe: 0, vorschau: true, lernstufe: /** @type {string | null} */ (null) };
const E = einfuehrungsLauf({ ton: () => leiste.ton, text: () => blase.text, stand });
// Ohne Ton kürzt nur ein Tipp des Kindes die Lesezeit ab, nie die Einstellung (spielbau.md §8). Hilfe, Pause und
// Leiste nicht – die Hilfe sagt den Schritt noch einmal.
E.verbindeTippen(document, { ausser: [hilfe, pause, leiste] });

/** @param {string} key @returns {{ ziel: { key: string }, stufe: string }} */
const material = (key) => ({ ziel: { key }, stufe: "material" });

/** Das Kind legt in der Einführung selbst `wert` (Sonnenring), die Aufgabe `key`. @param {string} key @param {string} wert @param {(o: any) => Promise<any>} [satz] */
async function kindZieht(key, wert, satz) {
  neuerLauf();
  /** @type {() => void} */
  let gelegt = () => {};
  const getan = new Promise((ok) => { gelegt = () => ok(undefined); });
  const du = stelleAufgabe(material(key), { passtNicht() {}, geloest: () => gelegt() });
  const a = /** @type {any} */ (aufgabeAus(key));
  teilFuer(a, wert)?.classList.add("markiert");
  const zug = { art: "ziehen", von: selektor(/** @type {Element} */ (teilFuer(a, wert))), nach: selektor(luecke) };
  const kind = E.kind(zug, getan);
  if (satz) await E.satz(satz);
  await kind;
  du.abbau();
  await wirkungFertig;
  await letzterSatz;
}

/**
 * Die Einführung im echten Spielbild: immer die ganze Geschichte, für „pronomen“ danach das Neue. Mit `r`
 * gilt sie danach als gesehen, und die Rundenzeit beginnt.
 * @param {{ einfuehrungGesehen(): void, beginneZeit(): void } | undefined} r @param {string} ziel
 */
function einfuehrung(r, ziel = "endung") {
  const e = einleitung;
  const satz = E.satz;
  /** @type {ReturnType<typeof stelleAufgabe> | null} */
  let demo = null;
  return E.spiele(async () => {
    try {
      neuerLauf();
      raeumeAb();
      leereBogen();
      B.letzteStufe = null;
      {
        // Die ganze Geschichte erzählt jeder Start, mit welchem Thema auch immer er beginnt (Tisch, Hände, Streifen, Lücke,
        // Ablage, ein Zug vorgemacht, ein Zug vom Kind); nur das Neue eines anderen Themas kommt danach dazu.
        demo = stelleAufgabe(material("verbform:endung:malen:er"), { passtNicht() {}, geloest() {} });
        await satz(e.malen);
        ring([$("hand-links"), handRechts]);
        await satz(e.tisch);
        ring([fig.kofi.el]);
        await satz(e.kofi);
        ring([fig.timo.el, fig.ela.el]);
        await satz(e.drueben);
        ring([streifen]);
        await satz(e.satz);
        ring([luecke]);
        await satz(e.luecke);
        ring(plaettchenFuer({ ziel: "endung" }).map((x) => plaettchen[`e-${x}`]));
        await satz(e.endungen);
        ring([]);
        // Timo zieht „-t“ an „er mal“; Wirkung: der Erzähler liest „Er malt.“, Timo malt.
        await demo.spielZug("t");
        await wirkungFertig;
        await letzterSatz;
        demo.abbau();
        // Jetzt du: du mal▢; das Kind zieht „-st“ (Sonnenring), der Erzähler liest „Du malst.“, Kofi malt.
        await kindZieht("verbform:endung:malen:du", "st", e.jetztDu);
        await satz(e.rutscht);
        await satz(e.nochmal);
        if (ziel === "pronomen") {
          await kindZieht("verbform:pronomen:malen:sie-pl", "sie", e.fehlt);
        } else {
          await satz(e.lernen);
        }
      }
      await satz(e.los);
    } finally {
      ueberspringeAlles();
      ring([]);
      demo?.abbau();
      B.offen = null;
      raeumeAb();
      leereBogen();
      streifen.replaceChildren();
      for (const p of Object.values(plaettchen)) { p.classList.remove("markiert", "verborgen"); p.hidden = true; }
      tastatur.hidden = true;
      B.lage = "leer";
      B.letzteStufe = null;
      for (const id of Object.keys(fig)) ruhe(id, 0);
      hebe("ich", false);
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
// In der Einführung ist der richtige Zug das Plättchen im Sonnenring (das Kind zieht selbst), sonst wie in der Vorlage.
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
        a = stelleAufgabe(aufgabe, melde);
      } };
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
      return key ? { ziel: { key }, auch: [], stufe: "material" } : null;
    },
    melde() { return null; },
    async ende() { return { hinweisSpiel: null }; },
  };
}

/** Die Einführung lief schon (sie kommt bei jedem Start einmal, danach über „Anleitung“). */
let einfuehrungGespielt = false;

// „Anleitung“: die Einführung im Spielbild jederzeit wieder (während einer Aufgabe); danach steht die Aufgabe wieder da,
// der Bogen ist dann leer.
$("anleitung")?.addEventListener("click", async () => {
  if (stand.phase !== "aufgabe" || E.laeuft) return;
  const merke = offeneAufgabe;
  await einfuehrung(undefined, aufgabeAus(stand.aufgabe)?.ziel ?? "endung");
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
    await einfuehrung(r, aufgabeAus(aufgabe.ziel?.key)?.ziel ?? "endung");
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

  raeumeAb();
  await letzterSatz;
  const { hinweisSpiel } = await r.ende();
  await zeigePause({ hinweis: hinweisSpiel, zeit: vorschau ? undefined : await amRundenende(), echteDinge: r.echteDinge });
  B.lage = "leer";
  B.letzteStufe = null;
  leereBogen();
  streifen.replaceChildren();
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
