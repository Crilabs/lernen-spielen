// G09 Werkzeugwand (Idee: docs/spiele/grammatik/g09-der-die-das-artikel.md). Ela räumt ihre Werkzeugwand ein: Auf der
// Werkbank liegt die Wortkarte mit einem Werkzeug (Hammer, Säge, Seil …), davor eine Lücke. Das Kind zieht eines der
// drei Plättchen der · die · das in die Lücke (Antippen von Plättchen und Lücke geht auch). Passt es, rastet es ein,
// der Erzähler sagt das Paar („Der Hammer.“), Ela hängt das Werkzeug in seinen Umriss an der Wand, und die Karte
// fliegt als Schild darunter. Passt es nicht, gleitet das Plättchen zurück, nichts wird zurückgesetzt.
//
// Aufbau wie die Spielvorlage (spiele/vorlage/spiel.js, dort die Schritte zum eigenen Spiel):
//   SPIELWELT  Kennung, Aufgabenarten, Sätze des Erzählers, Klänge
//   AUFGABE    Werkraum, Ela, Wand, Karte, Plättchen; eine Aufgabe darstellen, prüfen (die Sache urteilt), Hilfe-Stufen
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
import * as Runde from "../../runde/runde.js";
import { ziehbar, zurueck } from "../../rahmen/ziehen.js";
import { meldePruefSchnittstelle, selektor, testbetrieb } from "../../rahmen/pruefen.js";
import { einfuehrungsLauf } from "../../rahmen/einfuehrung-lauf.js";
import { sperreTouch, protokoll, esc } from "../../lernspiel.js";
import { sprich } from "../../kern/stimme.js";
import { runde, einmal } from "../../lernsteuerung.js";
import { starteSpielzeit, amRundenende, sage } from "../../rahmen/spielzeit.js";
import { form, flach, naht, zusammen, zeichner } from "../../start/zeichnen.js";
import { werkzeugSvg } from "./werkzeuge.js";
import { aufgabeAus, ARTIKEL, passt, satzTeile, bildWechsel, WAND_PLAETZE, wandTon, naechsteFreude, witz } from "./logik.js";

sperreTouch();

const $ = (/** @type {string} */ id) => /** @type {any} */ (document.getElementById(id));
const leiste = $("leiste");
const blase = $("blase");
const hilfe = $("hilfe");
const pause = $("pause");
const matte = $("matte");
const karte = $("karte");
const reihe = $("reihe");
const kiste = $("kiste");
const wandEl = $("wand");

// =====================================================================================================
// SPIELWELT
// =====================================================================================================

/** Kennung des Spiels: steht einmal in der HTML-Datei an <ls-leiste spiel>. */
const SPIEL_ID = leiste.getAttribute("spiel");

/** Aufgabenarten (gilt nur, solange das Spiel nicht in spiele.json steht; dort steht dasselbe). */
const ARTEN = [{ art: "artikel", stufen: ["material", "vorstellung", "kopf"] }];

/** Die Folge einer Lösung steht nach der Wirkung noch so lange, dann kommt die nächste Aufgabe (Tippen überspringt). */
const NACH_WIRKUNG_MS = 80;
/** Längstens so lange wartet die Folge auf das Ende der Wirkung (Regeln §1: etwa 2,5 s, höchstens 3 s). */
const FOLGE_MAX_MS = 2900;
/** Der Satz zu einem Wechsel steht mindestens so lange, auch ohne Ton. */
const WECHSEL_SATZ_MS = 1300;

/** Nur Vorschau: Aufgaben, falls die Lernsteuerung nichts liefert. */
const VORSCHAU = { thema: "der, die, das", aufgaben: ["artikel:hammer", "artikel:saege", "artikel:seil"] };

/** Sätze aus Daten (je Werkzeug ausgeschrieben, texte.json). */
const TEXTE = await fetch(new URL("texte.json", import.meta.url)).then((r) => r.json()).catch(() => null);

/** Der zuletzt begonnene Satz nach einer Lösung; vor dem nächsten Satz des Spiels wartet es darauf. @type {Promise<any>} */
let letzterSatz = Promise.resolve();

/** Der Erzähler (docs/stimme.md): beschreibt, was zu sehen ist, nie ein Urteil (grundsaetze.md 3.2). */
const erzaehler = {
  /** Das Wort bzw. der Satz mit Lücke nur zum Noch-mal-hören (wird nicht von selbst gesprochen). @param {any} a @param {string} stufe */
  aufgabe: (a, stufe) => {
    const text = stufe === "kopf" ? TEXTE?.kopf?.[a.key] : TEXTE?.aufgabe?.[a.key];
    return text ? blase.sage(text, { sprechen: false }) : Promise.resolve("still");
  },
  /** Das Paar, zugleich die Wirkung. @param {any} a */
  richtig: (a) => (TEXTE?.richtig?.[a.key] ? blase.sage(TEXTE.richtig[a.key]) : Promise.resolve("still")),
  /** Hilfe 1, die Hörprobe: eines der drei Paare im selben Ton. @param {any} a @param {number} i */
  paar: (a, i) => (TEXTE?.hilfe1?.[a.key]?.[i] ? blase.sage(TEXTE.hilfe1[a.key][i], { zeigen: true }) : Promise.resolve("still")),
  /** Hilfe 2, die Lösung (das Kind zieht selbst). */
  loesung: () => blase.sage("Ela dreht das Schild um.", { zeigen: true }),
  /** Nach einem Fehlversuch ein klarer Auftrag (wie M06, M08). */
  nochmal: () => blase.sage("Versuch es noch einmal."),
  /** Die Stufe wechselt (Regeln §8). @param {string} stufe */
  wechsel: (stufe) => (stufe === "vorstellung" ? blase.sage("Jetzt bleibt das Werkzeug in der Kiste.")
    : stufe === "kopf" ? blase.sage("Jetzt steht das Wort in einem Satz.") : blase.sage("Jetzt liegt das Werkzeug wieder auf der Werkbank.")),
  gehtNicht: () => blase.sage("Das Spiel geht gerade nicht."),
};

/**
 * Die Sätze der Einführung (docs/spielbau.md §8): in Ruhe, als kleine Geschichte. Jeder steht als feste Zeichenkette
 * in blase.sage (für `npm run audio`).
 */
const einleitung = {
  raeumt: (/** @type {any} */ o) => blase.sage("Ela räumt ihre Werkzeugwand auf.", o),
  platz: (/** @type {any} */ o) => blase.sage("Jedes Werkzeug hat seinen Platz.", o),
  liegt: (/** @type {any} */ o) => blase.sage("Hier liegt der Pinsel.", o),
  fehlt: (/** @type {any} */ o) => blase.sage("Davor fehlt ein kleines Wort.", o),
  plaettchen: (/** @type {any} */ o) => blase.sage("Hier liegen der, die und das.", o),
  haengt: (/** @type {any} */ o) => blase.sage("Ela hängt ihn auf.", o),
  jetztDu: (/** @type {any} */ o) => blase.sage("Jetzt du: Hier liegt die Säge.", o),
  rutscht: (/** @type {any} */ o) => blase.sage("Passt es nicht, rutscht es zurück.", o),
  nochmal: (/** @type {any} */ o) => blase.sage("Dann probierst du es einfach noch einmal.", o),
  lernen: (/** @type {any} */ o) => blase.sage("So lernst du der, die und das.", o),
  los: (/** @type {any} */ o) => blase.sage("Jetzt geht es los.", o),
};

/** Elternansicht (?eltern): beschreibend, von Stärken aus, kein Vergleich (3.3). @param {HTMLElement} feld */
function fuelleEltern(feld) {
  feld.innerHTML = `<p>Ela räumt ihre Werkzeugwand ein. Auf der Werkbank liegt ein Wort wie Hammer, Säge oder Seil, davor
    eine Lücke. Ihr Kind zieht eines der drei Plättchen der, die oder das in die Lücke. Passt es, spricht der Erzähler das
    Paar („Der Hammer.“), und Ela hängt das Werkzeug an die Wand; das Wort kommt als Schild darunter. Passt es nicht,
    gleitet das Plättchen zurück. Das Geschlecht eines Nomens ist nicht an der Endung abzulesen (Hammer, Leiter und
    Messer enden gleich und haben drei verschiedene Artikel); deshalb hilft nur das Hören: „der Hammer“ klingt richtig.
    Als Hilfe spricht der Erzähler alle drei Paare im selben Ton, danach dreht Ela das Schild um, auf dessen Rückseite der
    Artikel steht.</p>
    <p>Welche Wörter dran sind und was Ihr Kind schon kann, steht bei den Themen im Elternbereich.</p>`;
}

/**
 * Pause (K1, K8): drei Zettel zum Mitmachen (Idee §6).
 * @param {HTMLElement} feld @param {boolean} ton
 */
function fuelleSachmoment(feld, ton) {
  feld.replaceChildren();
  const zettel = document.createElement("div");
  zettel.className = "zettel";
  for (const art of ARTIKEL) zettel.insertAdjacentHTML("beforeend", `<span><ls-wortart art="artikel"></ls-wortart>${art}</span>`);
  const satz = document.createElement("p");
  satz.textContent = "Kleb zu Hause Zettel mit der, die, das.";
  feld.append(zettel, satz);
  if (ton) sprich("Kleb zu Hause Zettel mit der, die, das.");
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
const klang = {
  /** Das Plättchen rastet ein: weiches Plopp mit Überschwingen. */
  plopp: () => { ton(740, { dauer: 0.1, typ: "sine", laut: 0.1, gleiten: 0.55 }); ton(1100, { dauer: 0.06, typ: "sine", laut: 0.03, spaeter: 0.04 }); },
  /** Holz-Klack beim Aufhängen. */
  klack: () => { ton(170, { dauer: 0.16, typ: "sine", laut: 0.14, gleiten: 0.6 }); ton(980, { dauer: 0.03, typ: "triangle", laut: 0.04 }); },
  /** Papier-Tapp, das Schild liegt. */
  tapp: () => ton(520, { dauer: 0.07, typ: "triangle", laut: 0.06, gleiten: 0.7 }),
  /** Weiches Boing, das Plättchen gleitet zurück. */
  boing: () => ton(196, { dauer: 0.38, typ: "sine", laut: 0.06, gleiten: 1.5 }),
  /** Das Werkzeug rutscht aus der Kiste. */
  rutsch: () => ton(310, { dauer: 0.22, typ: "sine", laut: 0.025, gleiten: 0.75 }),
  /** Volle Wand: ein Ton je Werkzeug. @param {number} i */
  wand: (i) => ton(wandTon(i), { dauer: 0.5, typ: "sine", laut: 0.05 }),
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

// --- Ela und ihr Tritt ----------------------------------------------------------------------------------
const elaKoerper = $("ela-koerper");
elaKoerper.innerHTML = Runde.zeichne("ela", { haltung: "stehen", blick: "rechts" });
const ela = Runde.steuere(elaKoerper.querySelector("svg"));
/** Ela in einer Haltung (ohne zu warten; ein neuer Auftrag löst den alten ab). @param {string} id @param {number} [ms] */
const elaHaltung = (id, ms = 220) => { ela.haltung(id, { ms: lauf?.skip ? 0 : ms }); };
/** Ela spielt eine Bewegung (ohne zu warten). @param {string} id */
const elaBewegung = (id) => { ela.bewegung(id); };

/** Der Tritt: ein Holzblock, auf dem Ela steht. */
(() => {
  const zz = zeichner("g09tritt", 2.4);
  $("tritt").innerHTML = `<svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true" focusable="false">${zz.guss(
    form(`rect x="3" y="3" width="94" height="34" rx="5"`, "#C9A06E", [12, 8], { tiefe: 0.7 }),
    naht("M10 22 L90 22", "#C9A06E", 1.6, 0.3),
    flach(`rect x="12" y="29" width="14" height="7" rx="2"`, "#8F6A43", false),
  )}</svg>`;
})();

/** Das Fenster hinter Ela: Rahmen, Scheiben, draußen eine Baumkrone. */
(() => {
  const zz = zeichner("g09fenster", 2.6);
  $("fenster").innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">${zz.guss(
    form(`rect x="10" y="6" width="80" height="88" rx="4"`, "#B98E5E", [16, 12], { tiefe: 0.6 }),
    zz.innen([`rect x="17" y="13" width="66" height="74"`],
      `<rect x="10" y="6" width="80" height="88" fill="#EAF3F3"/><ellipse cx="34" cy="86" rx="30" ry="22" fill="#CFE0C5"/><ellipse cx="72" cy="90" rx="26" ry="18" fill="#DCE9D2"/>`),
    flach(`rect x="46" y="6" width="8" height="88"`, "#B98E5E", false),
    flach(`rect x="10" y="46" width="80" height="7"`, "#B98E5E", false),
    form(`rect x="4" y="92" width="92" height="7" rx="3"`, "#EAD5B5", [10, 94], { tiefe: 0.7 }),
  )}</svg>`;
})();

/** Die Kiste: Holz, oben offen; aus ihr kommt das nächste Werkzeug. */
(() => {
  const zz = zeichner("g09kiste", 2.4);
  kiste.innerHTML = `<svg viewBox="0 0 120 96" aria-hidden="true" focusable="false">${zz.guss(
    form(`rect x="6" y="14" width="108" height="76" rx="6"`, "#C9A06E", [16, 22], { tiefe: 0.7 }),
    flach(`rect x="14" y="20" width="92" height="16" rx="3"`, "#6E4E2E", false),
    naht("M8 52 L112 52", "#C9A06E", 2, 0.3),
    naht("M8 72 L112 72", "#C9A06E", 2, 0.3),
    flach(`rect x="46" y="44" width="28" height="7" rx="3"`, "#8F6A43", false),
    zusammen(),
  )}</svg>`;
})();

// --- Die Wand: sechs Plätze mit Umriss (oder Werkzeug) und Schild ---------------------------------------------
/** @typedef {{ el: HTMLElement, haken: HTMLElement, umriss: HTMLElement, werkzeug: HTMLElement, schild: HTMLElement, dreher: HTMLElement, vorn: HTMLElement, hinten: HTMLElement }} Fach */
/** @type {Fach[]} */
const fach = [];
for (let i = 0; i < WAND_PLAETZE; i++) {
  const el = document.createElement("div");
  el.className = "fach";
  el.innerHTML = `<div class="haken"><div class="umriss leer"></div><div class="werkzeug" hidden></div></div>
    <div class="schild leer"><div class="dreher"><div class="seite vorn"></div><div class="seite hinten"></div></div></div>`;
  wandEl.append(el);
  const q = (/** @type {string} */ s) => /** @type {HTMLElement} */ (el.querySelector(s));
  fach.push({ el, haken: q(".haken"), umriss: q(".umriss"), werkzeug: q(".werkzeug"), schild: q(".schild"), dreher: q(".dreher"), vorn: q(".vorn"), hinten: q(".hinten") });
}

// --- Plättchen und Lücke (bleiben für alle Aufgaben bestehen) ----------------------------------------------
const luecke = document.createElement("div");
luecke.className = "luecke";
luecke.id = "luecke";
luecke.setAttribute("name", "Lücke");
/** @type {Record<string, HTMLElement>} */
const plaettchen = {};
for (const art of ARTIKEL) {
  const p = document.createElement("button");
  p.type = "button";
  p.className = "teil plaettchen";
  p.id = `p-${art}`;
  p.dataset.artikel = art;
  p.setAttribute("aria-label", art);
  p.innerHTML = `<ls-wortart art="artikel"></ls-wortart><b>${art}</b>`;
  reihe.append(p);
  plaettchen[art] = p;
}

/** Was gerade auf der Werkbank und an der Wand liegt. */
const B = {
  /** @type {any} */ a: null,
  stufe: "material",
  /** leer, start (Aufgabe steht), loesung (gelöst, Wirkung läuft oder steht) */
  lage: "leer",
  /** Plätze an der Wand, die belegt sind. */
  platz: 0,
  /** Platz der aktuellen Aufgabe. */
  slot: 0,
  /** Aufgabe, die gerade offen ist (für die Ablage der Plättchen). @type {null | { ablegen: (teil: HTMLElement) => void }} */
  offen: null,
  /** Letzte Stufe, auf der eine Aufgabe gestellt wurde (für den Wechsel). @type {string | null} */
  letzteStufe: null,
};
/** Schließt die laufende Wirkung ab (Endzustand von Wand und Werkbank), damit nichts halb liegen bleibt. @type {(() => void) | null} */
let schliesse = null;

/** Die Ziele der Plättchen: nur die Lücke, solange eine Aufgabe offen ist. */
const ziele = () => (B.lage === "start" ? [luecke] : []);
for (const art of ARTIKEL) ziehbar(plaettchen[art], { ziele, beimAblegen: (teil) => (B.offen ? B.offen.ablegen(teil) : zurueck(teil)) });

/** @param {string} tag @param {string} klasse @param {string} [html] */
function neu(tag, klasse, html = "") {
  const el = document.createElement(tag);
  el.className = klasse;
  el.innerHTML = html;
  return el;
}

/** Das Plättchen in der Lücke: flach, ohne Schatten. @param {string} art */
const eingerastetEl = (art) => neu("div", "eingerastet", `<ls-wortart art="artikel"></ls-wortart><b>${art}</b>`);

/** Die Beschriftung eines Schildes: Artikel und Wort. @param {{ artikel: string, wort: string }} a */
const schildText = (a) => `<span>${esc(a.artikel)}</span><span>${esc(a.wort)}</span>`;

/** Ein Teil des Spielbildes ist weg (Aufgabe, Wechsel): laufende Wirkungen schließen sich ab. */
function raeumeAb() {
  const s = schliesse;
  schliesse = null;
  s?.();
}

/** Das Werkzeug an der Wand und das Schild eines Platzes leeren (kein Flug). @param {number} i */
function leereFach(i) {
  const f = fach[i];
  f.werkzeug.hidden = true;
  f.werkzeug.innerHTML = "";
  f.werkzeug.classList.remove("schaukelt");
  f.umriss.className = "umriss leer";
  f.umriss.innerHTML = "";
  f.haken.classList.remove("markiert");
  f.vorn.innerHTML = "";
  f.schild.classList.add("leer");
  f.dreher.style.transition = "";
  f.dreher.style.transform = "";
  f.el.style.transform = "";
  f.el.style.opacity = "";
}

/** Eine leere Wand. */
function leereWand() {
  fach.forEach((_, i) => leereFach(i));
  B.platz = 0;
  B.slot = 0;
}

/**
 * Legt die Aufgabe auf die Werkbank: Karte mit Wort (und Werkzeug), Lücke, drei Plättchen; an der Wand pulsiert der
 * Umriss des nächsten Platzes. Die Plättchen stehen immer in fester Reihe (der · die · das).
 * @param {any} a @param {string} stufe
 */
function legeKarte(a, stufe) {
  raeumeAb();
  B.a = a;
  B.stufe = stufe;
  B.lage = "start";
  B.slot = B.platz;
  luecke.replaceChildren();
  luecke.classList.remove("markiert");
  karte.style.visibility = "";
  karte.replaceChildren();
  const wort = `<span class="nomen"><ls-wortart art="nomen"></ls-wortart><b>${esc(a.wort)}</b></span>`;
  const satz = neu("div", `satz${stufe === "kopf" ? " kopf" : ""}`);
  if (stufe === "kopf") {
    const t = satzTeile(a.wort);
    satz.append(luecke);
    satz.insertAdjacentHTML("beforeend", `${wort}<span class="rest">${esc(t.nach.slice(a.wort.length).trim())}</span>`);
    karte.append(satz);
  } else {
    if (stufe === "material") karte.append(neu("div", "bild", werkzeugSvg(a.id)));
    satz.append(luecke);
    satz.insertAdjacentHTML("beforeend", wort);
    karte.append(satz);
  }
  karte.setAttribute("aria-label", stufe === "kopf" ? `Lücke ${a.wort} hängt an der Wand` : `Lücke ${a.wort}`);
  for (const art of ARTIKEL) {
    const p = plaettchen[art];
    p.classList.remove("verborgen", "klingt", "markiert", "gesetzt", "angehoben", "gezogen");
    p.style.translate = "";
    p.style.transform = "";
  }
  // Wand: der Umriss des nächsten Platzes (Stufe material das Werkzeug, sonst ein schlichtes Rechteck).
  const f = fach[B.slot];
  leereFach(B.slot);
  f.umriss.className = `umriss${stufe === "material" ? "" : " schlicht"}`;
  f.umriss.innerHTML = stufe === "material" ? werkzeugSvg(a.id, { umriss: true }) : "";
  if (!lauf?.skip) {
    f.umriss.classList.add("puls");
    setTimeout(() => f.umriss.classList.remove("puls"), 800);
  }
  // Das Werkzeug rutscht aus der Kiste auf die Werkbank (nur material; sonst bleibt es in der Kiste).
  const bild = /** @type {HTMLElement | null} */ (karte.querySelector(".bild"));
  if (bild && !wenigBewegung()) {
    const von = kiste.getBoundingClientRect();
    const nach = bild.getBoundingClientRect();
    const dx = von.left + von.width / 2 - (nach.left + nach.width / 2);
    const dy = von.top + von.height * 0.3 - (nach.top + nach.height / 2);
    bild.animate([{ transform: `translate(${dx}px, ${dy}px) scale(0.55)`, opacity: 0.2 }, { transform: "translate(0, 0) scale(1)", opacity: 1 }], { duration: 420, easing: "cubic-bezier(.2,.8,.3,1)" });
    klang.rutsch();
  }
  erzaehler.aufgabe(a, stufe);
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
  const x1 = nach.left;
  const y1 = nach.top;
  const rem = remPx();
  const mitte = `translate(${von.left + (x1 - von.left) * 0.5}px, ${Math.min(von.top, y1) - bogen * rem}px) scale(${1 + (s - 1) * 0.5}) rotate(${dreh}deg)`;
  const ende = `translate(${x1}px, ${y1}px) scale(${s})`;
  await bewege(el, [{ transform: `translate(${von.left}px, ${von.top}px) scale(1)` }, { transform: mitte, offset: 0.5 }, { transform: ende }], ms, { transform: ende }, { easing: "cubic-bezier(.4,.05,.35,1)" });
}

/** Wo Ela das Werkzeug hält: vor ihr, auf Brusthöhe. */
function handRect() {
  const r = elaKoerper.getBoundingClientRect();
  const k = 11 * remPx();
  return new DOMRect(r.left + r.width * 0.64 - k / 2, r.top + r.height * 0.5 - k / 2, k, k);
}

// --- Wirkungen -----------------------------------------------------------------------------------------------
/** Die Wirkung der letzten Lösung (die Folge wartet darauf). @type {Promise<any>} */
let wirkungFertig = Promise.resolve();
let vorigeFreude = /** @type {string | null} */ (null);
let seitHuepfen = 0;
let seitWitz = 0;
let nachFehler = false;

/**
 * Richtig: Das Plättchen rastet ein, der Erzähler sagt das Paar, Ela hängt das Werkzeug in seinen Umriss, die Karte
 * fliegt als Schild darunter und rastet ein. Etwa 2,2 s; ein Tipp springt ans Ende (Regeln §1).
 * @param {any} a @param {string} artikel @param {{ freude?: boolean }} [o]
 */
async function wirkungRichtig(a, artikel, { freude = true } = {}) {
  const i = B.slot;
  const f = fach[i];
  const stufe = B.stufe;
  /** @type {HTMLElement[]} */
  const klone = [];
  let aus = false;
  const schliessen = () => {
    if (aus) return;
    aus = true;
    for (const k of klone) k.remove();
    f.werkzeug.innerHTML = werkzeugSvg(a.id);
    f.werkzeug.hidden = false;
    f.umriss.classList.add("leer");
    f.vorn.innerHTML = schildText(a);
    f.schild.classList.remove("leer");
    karte.style.visibility = "hidden";
    if (B.platz === i) B.platz = i + 1;
    if (schliesse === schliessen) schliesse = null;
  };
  schliesse = schliessen;
  B.lage = "loesung";

  // 1. Plopp: das Plättchen rastet links an der Lücke ein.
  const chip = eingerastetEl(artikel);
  luecke.append(chip);
  klang.plopp();
  bewege(chip, [{ transform: "scale(0.9)" }, { transform: "scale(1.1)", offset: 0.55 }, { transform: "scale(1)" }], 220);
  await warte(240);
  if (aus) return;

  // 2. Ela nimmt das Werkzeug (von der Werkbank oder aus der Kiste).
  const bild = /** @type {HTMLElement | null} */ (karte.querySelector(".bild"));
  const kr = kiste.getBoundingClientRect();
  const quelle = bild ? bild.getBoundingClientRect() : new DOMRect(kr.left + kr.width * 0.5 - 7 * remPx(), kr.top + kr.height * 0.1, 14 * remPx(), 14 * remPx());
  const ding = flugDing(werkzeugSvg(a.id), quelle);
  klone.push(ding);
  if (bild) bild.style.visibility = "hidden";
  elaHaltung("tragen", 180);
  const hand = handRect();
  await flieg(ding, quelle, hand, 380, { bogen: 3 });
  if (aus) return;

  // 3. Ela hängt es auf: im Bogen zum Umriss, Klack, das Werkzeug schaukelt kurz.
  elaHaltung("zeigen", 200);
  const ziel = f.haken.getBoundingClientRect();
  const lustig = freude && witz(seitWitz, nachFehler);
  if (lustig) seitWitz = 0;
  else seitWitz++;
  await flieg(ding, hand, ziel, lustig ? 880 : 740, { bogen: 8, dreh: lustig ? -28 : 6 });
  if (aus) return;
  klang.klack();
  ding.remove();
  f.werkzeug.innerHTML = werkzeugSvg(a.id);
  f.werkzeug.hidden = false;
  f.umriss.classList.add("leer");
  if (!lauf?.skip) f.werkzeug.classList.add("schaukelt");
  if (freude) freudeElas(lustig);

  // 4. Die Karte fliegt als Schild darunter und rastet ein.
  const schild = f.schild.getBoundingClientRect();
  const wortEl = /** @type {HTMLElement | null} */ (karte.querySelector(".nomen"));
  const lr = luecke.getBoundingClientRect();
  const wr = wortEl?.getBoundingClientRect() ?? lr;
  const start = new DOMRect(lr.left, Math.min(lr.top, wr.top), Math.max(lr.right, wr.right) - lr.left, Math.max(lr.bottom, wr.bottom) - Math.min(lr.top, wr.top));
  const label = flugDing(`<div class="seite" style="position:absolute;inset:0;backface-visibility:visible;width:100%;height:100%;font-size:${3.5 * remPx()}px;gap:${0.8 * remPx()}px">${schildText(a)}</div>`, new DOMRect(0, 0, schild.width, schild.height), "label");
  klone.push(label);
  // Start in der Größe der Karte: das Schild wächst zur Karte, fliegt und schrumpft ins Schild.
  const sk = Math.min(3, Math.max(1.7, (start.width * 1.5) / schild.width));
  label.style.transform = `translate(${start.left + start.width / 2 - schild.width * sk / 2}px, ${start.top + start.height / 2 - schild.height * sk / 2}px) scale(${sk})`;
  karte.style.visibility = "hidden";
  const von = new DOMRect(start.left + start.width / 2 - schild.width * sk / 2, start.top + start.height / 2 - schild.height * sk / 2, schild.width * sk, schild.height * sk);
  await flieg(label, von, schild, 560, { bogen: 5, dreh: -3 });
  if (aus) return;
  klang.tapp();
  schliessen();
  if (B.platz >= WAND_PLAETZE) schaukelWand();
  void stufe;
}

/** Die Freude nach einer richtigen Antwort: zwei bis drei Varianten, nie zweimal dieselbe. @param {boolean} lustig */
function freudeElas(lustig) {
  if (lustig) {
    elaHaltung("staunen", 180);
    return;
  }
  const art = naechsteFreude(vorigeFreude, seitHuepfen);
  vorigeFreude = art;
  seitHuepfen = art === "huepfen" ? 0 : seitHuepfen + 1;
  if (art === "klopfen") elaHaltung("freuen-klein", 200);
  else elaBewegung(art);
}

/** Volle Wand: alle Werkzeuge schaukeln einmal leise an ihren Haken, ein Ton je Werkzeug, dann Ruhe (Idee §7). */
function schaukelWand() {
  if (lauf?.skip) return;
  fach.forEach((f, i) => {
    setTimeout(() => {
      f.werkzeug.classList.remove("schaukelt");
      void f.werkzeug.offsetWidth;
      f.werkzeug.classList.add("schaukelt");
      klang.wand(i);
    }, i * 140);
  });
}

/**
 * Daneben: Das Plättchen legt sich an, rastet nicht ein, kippt leicht schräg, weiches Boing, gleitet zurück; Ela
 * schaut neugierig auf das Schild. Kein falsches Paar wird gesprochen. Nichts wird zurückgesetzt. Das echte Plättchen
 * liegt sofort wieder an seinem Platz (blass); eine Kopie macht den Weg, damit die Lücke frei bleibt.
 * @param {HTMLElement} teil @param {DOMRect} abgelegt wo das Plättchen losgelassen wurde
 */
async function wirkungDaneben(teil, abgelegt) {
  neuerLauf();
  nachFehler = true;
  klang.boing();
  elaHaltung("fragen", 200);
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
  const f = fach[B.slot];
  try {
    // anlegen, schräg kippen, nicht einrasten
    await bewege(kopie, [{ transform: `translate(${abgelegt.left}px, ${abgelegt.top}px)` }, { transform: `translate(${x}px, ${y}px)` }], 160, { transform: `translate(${x}px, ${y}px)` }, { easing: "ease-out" });
    bewege(f.schild, [{ transform: "rotate(0deg)" }, { transform: "rotate(-2.5deg)", offset: 0.3 }, { transform: "rotate(2deg)", offset: 0.65 }, { transform: "rotate(0deg)" }], 460, {}, { easing: "ease-in-out" });
    await bewege(kopie, [{ transform: `translate(${x}px, ${y}px) rotate(0deg)` }, { transform: `translate(${x}px, ${y}px) rotate(9deg)`, offset: 0.45 }, { transform: `translate(${x}px, ${y}px) rotate(-3deg)`, offset: 0.8 }, { transform: `translate(${x}px, ${y}px) rotate(4deg)` }], 340, { transform: `translate(${x}px, ${y}px) rotate(4deg)` }, { easing: "ease-out" });
    // ruhig zurückgleiten an den Platz
    await bewege(kopie, [{ transform: `translate(${x}px, ${y}px) rotate(4deg)` }, { transform: `translate(${heim.left}px, ${heim.top}px) rotate(0deg)` }], 420, { transform: `translate(${heim.left}px, ${heim.top}px)` }, { easing: "ease-in-out" });
  } finally {
    kopie.remove();
    teil.style.opacity = "";
  }
  elaHaltung("stehen", 260);
}

// --- Stelle eine Aufgabe -------------------------------------------------------------------------------------
/**
 * Zeigt eine Aufgabe und meldet dem RAHMEN nur zwei Dinge: melde.passtNicht() und melde.geloest(key).
 * Zurück kommt { hilfe(stufe), zuege(), richtigerZug(), spielZug(artikel), abbau() }.
 * @param {{ ziel: { key: string }, stufe?: string }} aufgabe
 * @param {{ passtNicht: () => void, geloest: (key: string) => void }} melde
 */
function stelleAufgabe(aufgabe, melde) {
  const a = aufgabeAus(aufgabe.ziel.key);
  if (!a) throw new Error(`G09: unbekannte Aufgabe ${aufgabe.ziel.key}`);
  let fertig = false;
  let loesungGezeigt = false;
  let probe = 0;
  const stufe = aufgabe.stufe ?? "material";
  legeKarte(a, stufe);

  const ohneMarkierung = () => {
    for (const art of ARTIKEL) plaettchen[art].classList.remove("markiert", "klingt");
    luecke.classList.remove("markiert");
  };

  /** @param {HTMLElement} teil */
  const ablegen = (teil) => {
    const art = teil.dataset.artikel ?? "";
    if (fertig || B.lage !== "start") return zurueck(teil);
    if (!passt(a, art)) {
      const abgelegt = teil.getBoundingClientRect();
      teil.style.translate = "";
      zurueck(teil);
      wirkungDaneben(teil, abgelegt);
      melde.passtNicht();
      if (!fertig) erzaehler.nochmal();
      return;
    }
    fertig = true;
    probe++; // laufende Hörprobe abbrechen
    ohneMarkierung();
    teil.classList.add("verborgen");
    teil.style.transform = "";
    zurueck(teil);
    neuerLauf();
    letzterSatz = erzaehler.richtig(a);
    const freude = !nachFehler;
    wirkungFertig = wirkungRichtig(a, art, { freude }).catch((e) => protokoll(`${SPIEL_ID}: Wirkung: ${e?.message ?? e}`));
    nachFehler = false;
    melde.geloest(a.key);
  };
  B.offen = { ablegen };

  /** Lösung mit Begründung (L12): Ela dreht das Schild um, das Plättchen mit dem Artikel bekommt den Sonnenring. */
  const zeigeLoesung = () => {
    ohneMarkierung();
    const f = fach[B.slot];
    f.hinten.innerHTML = `<ls-wortart art="artikel"></ls-wortart><span>${esc(a.artikel)}</span>`;
    if (!wenigBewegung()) f.dreher.style.transition = "transform 0.45s ease-in-out";
    f.dreher.style.transform = "rotateY(180deg)";
    elaHaltung("zeigen", 200);
    plaettchen[a.artikel].classList.add("markiert");
    erzaehler.loesung();
  };

  /** Hörprobe (Hilfe 1): die drei Plättchen leuchten nacheinander, der Erzähler spricht die drei Paare im selben Ton. */
  const hoerprobe = async () => {
    const nr = ++probe;
    ohneMarkierung();
    for (let i = 0; i < ARTIKEL.length; i++) {
      if (nr !== probe || fertig) break;
      plaettchen[ARTIKEL[i]].classList.add("klingt");
      await erzaehler.paar(a, i);
      plaettchen[ARTIKEL[i]].classList.remove("klingt");
    }
  };

  const zugVon = (/** @type {string} */ art) => ({ art: "ziehen", von: selektor(plaettchen[art]), nach: selektor(luecke) });

  return {
    zuege() {
      if (fertig) return [];
      return ARTIKEL.map(zugVon);
    },
    richtigerZug() {
      return fertig ? null : zugVon(a.artikel);
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
      zeigeLoesung();
    },
    /** Für die Einführung: das Plättchen zieht selbst in die Lücke (wie ein Kind) und rastet ein. @param {string} art */
    async spielZug(art) {
      const teil = plaettchen[art];
      const von = teil.getBoundingClientRect();
      const nach = luecke.getBoundingClientRect();
      const dx = nach.left + nach.width / 2 - (von.left + von.width / 2);
      const dy = nach.top + nach.height / 2 - (von.top + von.height / 2);
      elaHaltung("zeigen", 200);
      await bewege(teil, [{ transform: "translate(0, 0)" }, { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 3 * remPx()}px) scale(1.06)`, offset: 0.5 }, { transform: `translate(${dx}px, ${dy}px)` }], 760, { transform: "" }, { easing: "ease-in-out" });
      ablegen(teil);
    },
    abbau() {
      B.offen = null;
      probe++;
      ohneMarkierung();
    },
  };
}

// --- Szenen zwischen den Aufgaben ------------------------------------------------------------------------------
/** Sonnenring auf Dingen der Einführung (Umriss, Karte, Lücke, Plättchen). @type {Element[]} */
let ringAuf = [];
/** @param {(Element | null)[]} els */
function ring(els) {
  for (const el of ringAuf) el.classList.remove("markiert");
  ringAuf = /** @type {Element[]} */ (els.filter(Boolean));
  for (const el of ringAuf) el.classList.add("markiert");
}

/** Die Wand ist voll: Ela nimmt alles ab und legt es in die Kiste (≤ 1,5 s), danach hängt eine leere Wand da. */
async function neueWand() {
  elaHaltung("zeigen", 160);
  const k = kiste.getBoundingClientRect();
  const teile = fach.map((f) => f.el);
  await Promise.all(teile.map((el, i) => {
    const r = el.getBoundingClientRect();
    const dx = k.left + k.width / 2 - (r.left + r.width / 2);
    const dy = k.top + k.height / 2 - (r.top + r.height / 2);
    return bewege(el, [{ transform: "translate(0, 0) scale(1)", opacity: 1 }, { transform: `translate(${dx}px, ${dy}px) scale(0.3)`, opacity: 0 }], 700, { opacity: "0" }, { easing: "ease-in", verzoegerung: i * 70 });
  }));
  klang.rutsch();
  leereWand();
  elaHaltung("stehen", 260);
}

/**
 * Vor jeder Aufgabe: eine volle Wand wird abgeräumt; wechselt die Stufe, erzählt eine kurze Szene den Wechsel (Regeln §8:
 * kein Wechsel ohne Bild): Ela legt das Werkzeug in die Kiste bzw. schiebt die Karte hin (≤ 1,5 s).
 * @param {{ stufe?: string }} aufgabe
 */
async function bereiteAufgabe(aufgabe) {
  stand.phase = "folge";
  neuerLauf();
  raeumeAb();
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
      gesagt = erzaehler.wechsel(wechsel).catch(() => undefined);
      elaHaltung("zeigen", 200);
      // Die Karte rutscht weg, das Werkzeug (falls da) geht in die Kiste.
      if (B.lage !== "leer") await bewege(karte, [{ opacity: 1, transform: "translateX(0)" }, { opacity: 0, transform: "translateX(6rem)" }], 500, { opacity: "", transform: "" }, { easing: "ease-in" });
      karte.style.visibility = "hidden";
    }
    if (B.platz >= WAND_PLAETZE) await neueWand();
    if (wechsel) {
      const satzZeit = Promise.race([Promise.all([gesagt, warte(WECHSEL_SATZ_MS)]), tipp]);
      await satzZeit;
      elaHaltung("stehen", 240);
    }
  } finally {
    abmelden();
  }
  B.letzteStufe = stufe;
}

// =====================================================================================================
// EINFÜHRUNG im echten Spielbild (docs/spielbau.md §8, Idee §6)
// =====================================================================================================
// Eine kleine Geschichte: der Umriss, die Karte, die Lücke, die Plättchen – je mit dem Sonnenring; Ela zieht „der“ an
// „Pinsel“ und hängt ihn auf; dann zieht das Kind selbst „die“ an „Säge“. Nicht gebucht.

/** Die Einführung: Sätze, Hilfe und Zug für den Prüfstand (rahmen/einfuehrung-lauf.js). */
const stand = { phase: "laden", aufgabe: /** @type {string | null} */ (null), nr: 0, versuche: 0, hilfeStufe: 0, vorschau: true, lernstufe: /** @type {string | null} */ (null) };
const E = einfuehrungsLauf({ ton: () => leiste.ton, text: () => blase.text, stand });
// Ohne Ton kürzt nur ein Tipp des Kindes die Lesezeit ab, nie die Einstellung (spielbau.md §8). Hilfe, Pause und
// Leiste nicht – die Hilfe sagt den Schritt noch einmal.
E.verbindeTippen(document, { ausser: [hilfe, pause, leiste] });

/** @param {string} key @returns {{ ziel: { key: string }, stufe: string }} */
const material = (key) => ({ ziel: { key }, stufe: "material" });

/**
 * Die Einführung im echten Spielbild. Mit `r` gilt sie danach als gesehen, und die Rundenzeit beginnt.
 * @param {{ einfuehrungGesehen(): void, beginneZeit(): void }} [r]
 */
function einfuehrung(r) {
  const e = einleitung;
  const satz = E.satz;
  /** @type {ReturnType<typeof stelleAufgabe> | null} */
  let demo = null;
  return E.spiele(async () => {
    try {
      neuerLauf();
      raeumeAb();
      leereWand();
      B.letzteStufe = null;
      demo = stelleAufgabe(material("artikel:pinsel"), { passtNicht() {}, geloest() {} });
      await satz(e.raeumt);
      ring([fach[0].haken]);
      await satz(e.platz);
      ring([karte]);
      await satz(e.liegt);
      ring([luecke]);
      await satz(e.fehlt);
      ring(ARTIKEL.map((art) => plaettchen[art]));
      await satz(e.plaettchen);
      ring([]);
      // Ela zieht „der“ an „Pinsel“; Wirkung: „Der Pinsel.“, dann „Ela hängt ihn auf.“
      await demo.spielZug("der");
      await wirkungFertig;
      await letzterSatz;
      await satz(e.haengt);
      demo.abbau();
      // Jetzt du: die Säge; das Kind zieht „die“ (Sonnenring), Zug für Zug.
      neuerLauf();
      /** @type {() => void} */
      let gelegt = () => {};
      const getan = new Promise((ok) => { gelegt = () => ok(undefined); });
      const du = stelleAufgabe(material("artikel:saege"), { passtNicht() {}, geloest: () => gelegt() });
      plaettchen.die.classList.add("markiert");
      const zug = { art: "ziehen", von: selektor(plaettchen.die), nach: selektor(luecke) };
      const kind = E.kind(zug, getan);
      await satz(e.jetztDu);
      await kind;
      du.abbau();
      await wirkungFertig;
      await letzterSatz;
      await satz(e.rutscht);
      await satz(e.nochmal);
      await satz(e.lernen);
      await satz(e.los);
    } finally {
      ueberspringeAlles();
      ring([]);
      demo?.abbau();
      B.offen = null;
      raeumeAb();
      leereWand();
      karte.replaceChildren();
      for (const art of ARTIKEL) plaettchen[art].classList.remove("markiert", "verborgen");
      B.lage = "leer";
      B.letzteStufe = null;
      elaHaltung("stehen", 0);
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
// die Wand ist dann leer.
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

  raeumeAb();
  await letzterSatz;
  const { hinweisSpiel } = await r.ende();
  await zeigePause({ hinweis: hinweisSpiel, zeit: vorschau ? undefined : await amRundenende(), echteDinge: r.echteDinge });
  B.lage = "leer";
  B.letzteStufe = null;
  leereWand();
  karte.replaceChildren();
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
