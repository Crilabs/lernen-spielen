// G01 Dreieck und Kreis (Idee: docs/spiele/grammatik/g01-dreieck-und-kreis-wortarten-mit-symbolen.md). Kofi hat Wörter in
// Kreidekästchen auf den Hof gemalt, ein Wort je Kästchen. Das Kind zieht ein Wortartensymbol (Dreieck für Nomen, Kreis für
// Verben) vom Tablett über ein Wort (Antippen von Symbol und Wort geht auch). Passt es, hüpft Kofi hinter das Wort, und die
// Probe läuft im Bild: Nomen – davor schreibt sich das Artikelwort („die Katze“); Verb – ich und du mit ihrer Endung („ich
// gähne, du gähnst“). Passt es nicht, kippt das Symbol, die Frage ohne Antwort ist zu hören, und es rutscht zurück.
//
// Aufbau wie die Spielvorlage (spiele/vorlage/spiel.js, dort die Schritte zum eigenen Spiel):
//   SPIELWELT  Kennung, Aufgabenarten, Sätze des Erzählers, Klänge
//   AUFGABE    Hof, Kofi, Kreidereihe, Tablett; eine Aufgabe darstellen, prüfen (die Sache urteilt), Hilfe-Stufen
//   EINFÜHRUNG im echten Spielbild (docs/spielbau.md §8): eine kleine Geschichte, das Kind legt selbst
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
import { wortartAus } from "../../aufgabenarten.js";
import { verbTeile } from "../../woerter/wortarten.js";
import { bildSvg, hatBild } from "./bilder.js";
import { versalien, plan, passt, richtigesKaestchen, probeKaesten, richtigText, falschText, probeKreide, bildWechsel, huepfTon, naechsteFreude, witz } from "./logik.js";

sperreTouch();

const $ = (/** @type {string} */ id) => /** @type {any} */ (document.getElementById(id));
const leiste = $("leiste");
const blase = $("blase");
const hilfe = $("hilfe");
const pause = $("pause");
const matte = $("matte");
const reihe = $("reihe");
const vorrat = $("vorrat");
const tablett = $("tablett");
const weg = $("weg");
const buehne = /** @type {HTMLElement} */ (document.querySelector(".buehne"));

// =====================================================================================================
// SPIELWELT
// =====================================================================================================

/** Kennung des Spiels: steht einmal in der HTML-Datei an <ls-leiste spiel>. */
const SPIEL_ID = leiste.getAttribute("spiel");

/** Aufgabenarten (gilt nur, solange das Spiel nicht in spiele.json steht; dort steht dasselbe). */
const ARTEN = [{ art: "wortart", stufen: ["material", "vorstellung", "kopf"] }];

/** Die Folge einer Lösung steht nach der Wirkung noch so lange, dann kommt die nächste Aufgabe (Tippen überspringt). */
const NACH_WIRKUNG_MS = 80;
/** Längstens so lange wartet die Folge auf das Ende der Wirkung (Probe, dann Kofi hüpft den Satz ab: Idee §1 etwa 2,2 s + 2,5 s). */
const FOLGE_MAX_MS = 5400;

/** Nur Vorschau: Aufgaben, falls die Lernsteuerung nichts liefert. */
const VORSCHAU = {
  thema: "Nomen und Verben",
  aufgaben: ["wortart:nomen:katze-gaehnt", "wortart:verb:hund-bellt", "wortart:nomen:katze-jagt-ball"],
};

/** Name der Symbole für Vorleser. */
const SYMBOL_NAME = { nomen: "Nomen", verb: "Verb", adjektiv: "Adjektiv" };

/** Sätze aus Daten (je Satz und Wort ausgeschrieben, texte.json). */
const TEXTE = await fetch(new URL("texte.json", import.meta.url)).then((r) => r.json()).catch(() => null);

/** Der zuletzt begonnene Satz nach einer Lösung; vor dem nächsten Satz des Spiels wartet es darauf. @type {Promise<any>} */
let letzterSatz = Promise.resolve();

/** @param {string | undefined} text @param {any} [o] */
const sagenText = (text, o) => (text ? blase.sage(text, o) : Promise.resolve("still"));

/** Der Erzähler (docs/stimme.md): beschreibt, was zu sehen ist, nie ein Urteil (grundsaetze.md 3.2). */
const erzaehler = {
  /** Der Satz zum Noch-mal-hören (wird nicht von selbst gesprochen). @param {{ satz: string }} p */
  satz: (p) => sagenText(TEXTE?.satz?.[p.satz], { sprechen: false }),
  /** Der fertige Satz (Kofi hüpft ihn ab). @param {{ satz: string }} p */
  fertig: (p) => sagenText(TEXTE?.satz?.[p.satz]),
  /** Ein angetipptes Wort. @param {any} w */
  wort: (w) => sagenText(TEXTE?.wort?.[w.wort]),
  /** Die Probe am passenden Wort, zugleich die Wirkung. @param {any} w @param {any} [o] */
  richtig: (w, o) => sagenText(TEXTE?.richtig?.[w.wort], o),
  /** Die Frage ohne Antwort an einem Wort, zu dem das Symbol nicht passt. @param {string} symbol @param {any} w @param {any} [o] */
  falsch: (symbol, w, o) => sagenText(TEXTE?.[symbol === "nomen" ? "dreieck" : symbol === "verb" ? "kreis" : "adjektiv"]?.[w.wort], o),
  /** Hilfe 2, die Lösung (das Kind legt selbst). */
  zeigt: () => blase.sage("Kofi zeigt auf das Wort.", { zeigen: true }),
  /** Nach einem Fehlversuch ein klarer Auftrag (wie M06, M08). */
  nochmal: () => blase.sage("Versuch es noch einmal."),
  /** Die Stufe wechselt (Regeln §8). @param {"ohneBilder" | "mitBildern" | "zweitesSymbol"} wechsel */
  wechsel: (wechsel) => (wechsel === "ohneBilder" ? blase.sage("Jetzt malt Kofi keine Bilder mehr.", { zeigen: true })
    : wechsel === "mitBildern" ? blase.sage("Jetzt malt Kofi wieder Bilder.", { zeigen: true })
      : blase.sage("Hier liegt jetzt auch das Nomen-Dreieck.", { zeigen: true })),
  gehtNicht: () => blase.sage("Das Spiel geht gerade nicht."),
};

/**
 * Die Sätze der Einführung (docs/spielbau.md §8): in Ruhe, als kleine Geschichte, je Thema (Nomen oder Verb). Jeder steht
 * als feste Zeichenkette in blase.sage (für `npm run audio`).
 */
const einleitung = {
  nomen: {
    gemalt: (/** @type {any} */ o) => blase.sage("Kofi hat Wörter auf den Hof gemalt.", o),
    symbol: (/** @type {any} */ o) => blase.sage("Hier liegt das Nomen-Dreieck.", o),
    legt: (/** @type {any} */ o) => blase.sage("Kofi legt es über Katze.", o),
    probiert: (/** @type {any} */ o) => blase.sage("Er probiert: Passt der, die oder das davor?", o),
    bleibt: (/** @type {any} */ o) => blase.sage("Das Dreieck bleibt liegen.", o),
    jetztDu: (/** @type {any} */ o) => blase.sage("Jetzt du: Leg das Dreieck über Ball.", o),
    lernen: (/** @type {any} */ o) => blase.sage("So findest du die Nomen.", o),
  },
  verb: {
    gemalt: (/** @type {any} */ o) => blase.sage("Kofi hat Wörter auf den Hof gemalt.", o),
    symbol: (/** @type {any} */ o) => blase.sage("Hier liegt der Verb-Kreis.", o),
    legt: (/** @type {any} */ o) => blase.sage("Kofi legt ihn über gähnt.", o),
    probiert: (/** @type {any} */ o) => blase.sage("Er probiert: ich gähne, du gähnst?", o),
    bleibt: (/** @type {any} */ o) => blase.sage("Der Kreis bleibt liegen.", o),
    jetztDu: (/** @type {any} */ o) => blase.sage("Jetzt du: Leg den Kreis über rollt.", o),
    lernen: (/** @type {any} */ o) => blase.sage("So findest du die Verben.", o),
  },
  rutscht: (/** @type {any} */ o) => blase.sage("Passt es nicht, rutscht es zurück.", o),
  nochmal: (/** @type {any} */ o) => blase.sage("Dann probierst du es einfach noch einmal.", o),
  los: (/** @type {any} */ o) => blase.sage("Jetzt geht es los.", o),
};

/** Elternansicht (?eltern): beschreibend, von Stärken aus, kein Vergleich (3.3). @param {HTMLElement} feld */
function fuelleEltern(feld) {
  feld.innerHTML = `<p>Kofi hat Wörter in Kreidekästchen auf den Hof gemalt. Ihr Kind zieht ein Symbol vom Tablett über ein
    Wort: das schwarze Dreieck über ein Nomen, den roten Kreis über ein Verb. Kofi hüpft hinter das Wort und macht die Probe,
    die man auch im Kopf macht: Bei einem Nomen passt ein Artikelwort davor („die Katze“), bei einem Verb gibt es eine Form
    für ich und eine für du („ich gähne, du gähnst“). Passt die Probe nicht („der gähnt?“), gleitet das Symbol zurück, und die
    Frage ist zu hören. So entscheidet die Probe und nicht die Bedeutung: Auch Wörter wie Durst oder Wind kann man nicht
    anfassen und sind doch Nomen. Als Hilfe macht Kofi die Probe an den Wörtern des Satzes nacheinander, danach zeigt er auf
    das Wort.</p>
    <p>Welche Wörter dran sind und was Ihr Kind schon kann, steht bei den Themen im Elternbereich.</p>`;
}

/**
 * Pause (K1, K8): ein Dreieck und ein Kreis zum Ausschneiden (Idee §6).
 * @param {HTMLElement} feld @param {boolean} ton
 */
function fuelleSachmoment(feld, ton) {
  feld.replaceChildren();
  const zettel = document.createElement("div");
  zettel.className = "zettel";
  zettel.insertAdjacentHTML("beforeend", `<span><ls-wortart art="nomen"></ls-wortart></span><span><ls-wortart art="verb"></ls-wortart></span>`);
  const satz = document.createElement("p");
  satz.textContent = versalien("Schneidet Dreiecke und Kreise aus Papier aus.");
  feld.append(zettel, satz);
  if (ton) sprich("Schneidet Dreiecke und Kreise aus Papier aus.");
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
/** Kreide auf Stein: ein kurzes, leises Kratzen aus gefiltertem Rauschen. @param {number} [dauer] */
function kratzen(dauer = 0.28) {
  if (!leiste.ton) return;
  try {
    audio ??= new AudioContext();
    if (audio.state === "suspended") audio.resume().catch(() => {});
    const n = Math.floor(audio.sampleRate * dauer);
    const puffer = audio.createBuffer(1, n, audio.sampleRate);
    const d = puffer.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const quelle = audio.createBufferSource();
    quelle.buffer = puffer;
    const filter = audio.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 3200;
    filter.Q.value = 0.9;
    const g = audio.createGain();
    g.gain.value = 0.05;
    quelle.connect(filter).connect(g).connect(audio.destination);
    quelle.start();
  } catch {
    // ohne Web Audio: still
  }
}
const klang = {
  /** Das Symbol rastet ein: weiches Plopp mit Überschwingen. */
  plopp: () => { ton(740, { dauer: 0.1, typ: "sine", laut: 0.1, gleiten: 0.55 }); ton(1100, { dauer: 0.06, typ: "sine", laut: 0.03, spaeter: 0.04 }); },
  /** Kreidekratzen bei der Probe. */
  kreide: () => kratzen(),
  /** Ein Hüpfer beim Abhüpfen des Satzes, je Wort einen Ton höher (Pentatonik). @param {number} k */
  huepf: (k) => ton(huepfTon(k), { dauer: 0.22, typ: "sine", laut: 0.06 }),
  /** Ein Hüpfer der Probe (ich, du): ein Ton höher als der vorige. @param {number} k */
  probe: (k) => ton(523 * 2 ** ([0, 4, 7][k % 3] / 12), { dauer: 0.16, typ: "triangle", laut: 0.05 }),
  /** Weiches Boing, das Symbol gleitet zurück. */
  boing: () => ton(196, { dauer: 0.38, typ: "sine", laut: 0.06, gleiten: 1.5 }),
};

// =====================================================================================================
// AUFGABE
// =====================================================================================================

const wenigBewegung = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const remPx = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 10;

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
/**
 * Warten und Bewegen an einen bestimmten Lauf gebunden (eine Wirkung bleibt in ihrem Lauf, auch wenn ein neuer beginnt).
 * @param {Lauf} L
 */
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
   * @param {HTMLElement} el @param {Keyframe[]} frames @param {number} ms @param {Partial<CSSStyleDeclaration>} [ende]
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

// --- Kofi und sein Schatten ---------------------------------------------------------------------------
const kofiEl = $("kofi");
const kofiKoerper = $("kofi-koerper");
const schatten = $("schatten");
kofiKoerper.innerHTML = Runde.zeichne("kofi", { haltung: "stehen", blick: "rechts" });
const kofi = Runde.steuere(kofiKoerper.querySelector("svg"));
/** Kofi in einer Haltung (ohne zu warten; ein neuer Auftrag löst den alten ab). @param {string} id @param {number} [ms] @param {Lauf} [L] */
const kofiHaltung = (id, ms = 220, L = lauf) => { kofi.haltung(id, { ms: L.skip ? 0 : ms }); };
/** Kofi spielt eine Bewegung (ohne zu warten). @param {string} id */
const kofiBewegung = (id) => { kofi.bewegung(id); };

/** Anteil der Feldhöhe, auf dem Kofis Füße stehen (wie bei Lena in M37). */
const FUSS = 0.907;
/** Wo Kofi steht (x in px der Bühne), null = daheim am linken Rand. @type {number | null} */
let kofiX = null;
/** Kofi schaut nach links (er hüpft nach links). */
let spiegel = false;

/** Maße des Wegs in px der Bühne: y der Füße, x des Heimatplatzes, x-Mitte eines Elements. */
function wegMass() {
  const b = buehne.getBoundingClientRect();
  const w = weg.getBoundingClientRect();
  return {
    y: w.bottom - b.top - 0.8 * remPx(),
    heim: w.left - b.left + 30 * remPx(),
    /** @param {Element} el */
    mitte: (el) => { const r = el.getBoundingClientRect(); return r.left - b.left + r.width / 2; },
  };
}
/** @param {number} x @param {number} [hoch] px über dem Boden @param {boolean} [sp] */
const kofiTransform = (x, hoch = 0, sp = spiegel) => {
  const m = wegMass();
  return `translate(${(x - kofiEl.offsetWidth / 2).toFixed(1)}px, ${(m.y - kofiEl.offsetHeight * FUSS - hoch).toFixed(1)}px) scale(${sp ? -1 : 1}, 1)`;
};
/** @param {number} x @param {number} [luft] 0 … 1 */
const schattenTransform = (x, luft = 0) => {
  const m = wegMass();
  return `translate(${(x - schatten.offsetWidth / 2).toFixed(1)}px, ${(m.y - schatten.offsetHeight / 2).toFixed(1)}px) scale(${(1 - 0.4 * luft).toFixed(3)}, ${(1 - 0.4 * luft).toFixed(3)})`;
};
/** Kofi steht bei x, ohne Bewegung. @param {number} x */
function stelleKofi(x) {
  kofiX = x;
  kofiEl.getAnimations().forEach((a) => a.cancel());
  schatten.getAnimations().forEach((a) => a.cancel());
  kofiKoerper.getAnimations().forEach((a) => a.cancel());
  kofiEl.style.transform = kofiTransform(x);
  schatten.style.transform = schattenTransform(x);
}
/** Kofi daheim (am linken Rand). */
const kofiHeim = () => stelleKofi(wegMass().heim);

/**
 * Kofi hüpft im Bogen nach x (Abspringen gestaucht, Landung gestaucht, dann zurück). Hinter der Reihe, nie davor.
 * @param {Lauf} L @param {number} x @param {{ ms?: number, hoch?: number }} [o] hoch in rem
 */
async function kofiZu(L, x, { ms = 440, hoch = 5.5 } = {}) {
  const von = kofiX ?? wegMass().heim;
  if (x < von - 2) spiegel = true;
  else if (x > von + 2) spiegel = false;
  if (L.skip || wenigBewegung() || typeof kofiEl.animate !== "function") return stelleKofi(x);
  const rem = remPx();
  const mitteX = (von + x) / 2;
  kofiHaltung("freuen-klein", 100, L);
  const tf = (/** @type {number} */ px, /** @type {number} */ h) => kofiTransform(px, h);
  const aktiv = [
    kofiEl.animate([
      { transform: tf(von, 0), easing: "ease-out" },
      { transform: tf(mitteX, hoch * rem), offset: 0.5, easing: "ease-in" },
      { transform: tf(x, 0) },
    ], { duration: ms, fill: "forwards" }),
    schatten.animate([
      { transform: schattenTransform(von), opacity: 1 },
      { transform: schattenTransform(mitteX, 1), opacity: 0.55, offset: 0.5 },
      { transform: schattenTransform(x), opacity: 1 },
    ], { duration: ms, fill: "forwards" }),
    kofiKoerper.animate([
      { transform: "scale(1.07, 0.9)" },
      { transform: "scale(0.95, 1.07)", offset: 0.22 },
      { transform: "scale(1, 1)", offset: 0.6 },
      { transform: "scale(1.09, 0.88)" },
    ], { duration: ms, fill: "forwards" }),
  ];
  for (const a of aktiv) L.anims.add(a);
  await aktiv[0].finished.catch(() => undefined);
  for (const a of aktiv) L.anims.delete(a);
  stelleKofi(x);
  if (!L.skip) {
    const feder = kofiKoerper.animate([{ transform: "scale(1.09, 0.88)" }, { transform: "scale(0.98, 1.03)", offset: 0.6 }, { transform: "scale(1, 1)" }], { duration: 160 });
    L.anims.add(feder);
    await feder.finished.catch(() => undefined);
    L.anims.delete(feder);
  }
}

/** Kofi hüpft auf der Stelle (die Probe: eine Form, ein Hüpfer). @param {Lauf} L */
async function kofiHuepftHier(L) {
  if (L.skip || wenigBewegung() || kofiX === null) return;
  const x = kofiX;
  const rem = remPx();
  const a = kofiEl.animate([
    { transform: kofiTransform(x, 0), easing: "ease-out" },
    { transform: kofiTransform(x, 2.2 * rem), offset: 0.5, easing: "ease-in" },
    { transform: kofiTransform(x, 0) },
  ], { duration: 210, fill: "forwards" });
  L.anims.add(a);
  await a.finished.catch(() => undefined);
  L.anims.delete(a);
  stelleKofi(x);
}

// --- Das Spielbild: Kreidereihe und Tablett ----------------------------------------------------------------
/** Was gerade auf dem Hof liegt. */
const B = {
  /** @type {ReturnType<typeof plan>} */ p: null,
  /** leer, start (Aufgabe steht), loesung (gelöst, Wirkung läuft oder steht) */
  lage: "leer",
  /** @type {Set<number>} */ belegt: new Set(),
  /** Kästchen nach Wortnummer. @type {Map<number, HTMLElement>} */ kaesten: new Map(),
  /** Symbole auf dem Tablett, die noch nicht gelegt sind. @type {{ el: HTMLElement, art: string }[]} */ stuecke: [],
  /** Löst alle Symbole des Tabletts wieder vom Ziehen (auch die schon gelegten). @type {(() => void)[]} */ loesen: [],
  /** Aufgabe, die gerade offen ist (für die Ablage der Symbole). @type {null | { ablegen: (teil: HTMLElement, ziel: Element) => void }} */ offen: null,
  /** Letzte Stufe, auf der eine Aufgabe gestellt wurde (für den Wechsel). @type {string | null} */ letzteStufe: null,
  /** Ein Wechsel, den die nächste Aufgabe ansagt. @type {"ohneBilder" | "mitBildern" | "zweitesSymbol" | null} */ wechsel: null,
};
/** Schließt die laufenden Wirkungen ab (Endzustand von Reihe und Hof), damit nichts halb liegen bleibt. @type {Set<() => void>} */
const offeneWirkungen = new Set();
/** Zählt die Wirkungen; nur die jüngste setzt Kofi an seinen Platz. */
let wirkungNr = 0;

/** @param {string} tag @param {string} klasse @param {string} [html] */
function neu(tag, klasse, html = "") {
  const el = document.createElement(tag);
  el.className = klasse;
  el.innerHTML = html;
  return el;
}

/** Ein Teil des Spielbildes ist weg (Aufgabe, Wechsel): laufende Wirkungen schließen sich ab. */
function raeumeAb() {
  const alle = [...offeneWirkungen];
  offeneWirkungen.clear();
  for (const f of alle) f();
}

/** Das Tablett leeren und die Symbole lösen. */
function leereTablett() {
  for (const f of B.loesen) f();
  B.loesen = [];
  B.stuecke = [];
  vorrat.replaceChildren();
}

/** Eine leere Reihe. */
function leereReihe() {
  reihe.replaceChildren();
  B.kaesten.clear();
  B.belegt = new Set();
}

/** Das Wort im Kästchen; ein Verb mit Stamm und beweglicher Endung (die Probe klappt sie um). @param {any} w */
function wortHtml(w) {
  if (w.art !== "verb") return esc(versalien(w.wort));
  const t = verbTeile(w);
  return `<span class="stamm">${esc(versalien(t.stamm))}</span><span class="endung">${esc(versalien(t.t))}</span>`;
}

/** Die Ziele der Symbole: nur die freien Kästchen, solange eine Aufgabe offen ist. */
const ziele = () => (B.lage === "start" ? [...B.kaesten.entries()].filter(([i]) => !B.belegt.has(i)).map(([, el]) => el) : []);

/**
 * Legt die Aufgabe auf den Hof: Kästchen mit Wort (und Kreidebild), Symbole auf das Tablett; Kofi steht daheim. Die Reihe
 * malt sich in 0,5 s hin.
 * @param {NonNullable<ReturnType<typeof plan>>} p
 */
function legeReihe(p) {
  raeumeAb();
  leereTablett();
  leereReihe();
  B.p = p;
  B.lage = "start";
  for (const k of p.karten) {
    const el = neu("div", "kaestchen");
    el.id = `k-${k.i}`;
    el.setAttribute("name", k.wort.wort);
    el.setAttribute("aria-label", k.wort.wort);
    el.dataset.i = String(k.i);
    el.innerHTML = `<div class="symbolplatz"></div>${k.bild && hatBild(k.bild) ? `<div class="bild">${bildSvg(k.bild)}</div>` : ""}<div class="probe"></div><div class="wort">${wortHtml(k.wort)}</div>`;
    /** Das Kästchen wurde angetippt, ohne dass ein Symbol angehoben war: der Erzähler spricht das Wort (Zugang ohne Lesen). */
    let ohneAuswahl = false;
    el.addEventListener("pointerdown", () => { ohneAuswahl = !B.stuecke.some((s) => s.el.classList.contains("angehoben")); }, true);
    el.addEventListener("click", () => { if (ohneAuswahl && B.lage === "start") letzterSatz = erzaehler.wort(k.wort); ohneAuswahl = false; });
    reihe.append(el);
    B.kaesten.set(k.i, el);
  }
  // Das Wort ohne Bild hängt unten: alle Wörter einer Reihe stehen auf einer Linie.
  for (const el of B.kaesten.values()) if (!el.querySelector(".bild")) el.querySelector(".probe")?.setAttribute("style", "margin-top:auto");
  p.symbole.forEach((art, n) => {
    const b = /** @type {HTMLElement} */ (neu("button", "teil symbol", `<ls-wortart art="${art}"></ls-wortart>`));
    b.setAttribute("type", "button");
    b.id = `s-${n}`;
    b.dataset.art = art;
    b.setAttribute("aria-label", SYMBOL_NAME[/** @type {keyof typeof SYMBOL_NAME} */ (art)]);
    vorrat.append(b);
    const loesen = ziehbar(b, { ziele, beimAblegen: (teil, ziel) => (B.offen ? B.offen.ablegen(teil, ziel) : zurueck(teil)) });
    B.stuecke.push({ el: b, art });
    B.loesen.push(loesen);
  });
  // Die Reihe malt sich hin: die Kästchen wachsen nacheinander aus dem Boden (nur transform und opacity).
  if (!lauf.skip && !wenigBewegung()) {
    [...B.kaesten.values()].forEach((el, i) => {
      el.animate([{ opacity: 0, transform: "translateY(1.6rem) scale(0.94)" }, { opacity: 1, transform: "none" }], { duration: 320, delay: i * 45, easing: "cubic-bezier(.2,.8,.3,1)", fill: "backwards" });
    });
    klang.kreide();
  }
  kofiHeim();
  kofiHaltung("stehen", 120);
  erzaehler.satz(p);
}

// --- Flüge ----------------------------------------------------------------------------------------------------
/** Ebene für fliegende Dinge, über allem Bild. */
const fluege = document.createElement("div");
Object.assign(fluege.style, { position: "fixed", inset: "0", zIndex: "8", pointerEvents: "none", overflow: "hidden" });
document.body.append(fluege);

// --- Wirkungen -----------------------------------------------------------------------------------------------
/** Die Wirkung der letzten Lösung (die Folge wartet darauf). @type {Promise<any>} */
let wirkungFertig = Promise.resolve();
let vorigeFreude = /** @type {string | null} */ (null);
let seitHuepfen = 0;
let seitWitz = 0;
let nachFehler = false;

/** Das Symbol steht flach im Kästchen (kein Knopf, kein Schatten). @param {HTMLElement} kasten @param {string} art */
function setzeSymbol(kasten, art) {
  const platz = /** @type {HTMLElement} */ (kasten.querySelector(".symbolplatz"));
  platz.replaceChildren();
  platz.append(neu("div", "eingerastet", `<ls-wortart art="${art}"></ls-wortart>`));
  kasten.classList.add("belegt");
}

/** Die Probe-Zeile eines Kästchens zeigen oder verwehen lassen. @param {HTMLElement} kasten @param {string | null} text */
function probeZeile(kasten, text) {
  const z = /** @type {HTMLElement} */ (kasten.querySelector(".probe"));
  if (text === null) {
    z.classList.remove("da");
    return;
  }
  z.textContent = versalien(text);
  z.classList.add("da");
}

/** Das Wort im Kästchen in seine Grundform zurück (die Endung klappt wieder). @param {HTMLElement} kasten @param {any} w */
function endungZurueck(kasten, w) {
  const e = kasten.querySelector(".endung");
  if (e && w.art === "verb") e.textContent = versalien(verbTeile(w).t);
}

/** Die Endung eines Verbs umklappen: erst weg, dann die neue (0,2 s). @param {Lauf} L @param {HTMLElement} kasten @param {string} neueEndung */
async function klappe(L, kasten, neueEndung) {
  const e = /** @type {HTMLElement | null} */ (kasten.querySelector(".endung"));
  if (!e) return;
  const { bewege } = mit(L);
  await bewege(e, [{ transform: "rotateX(0deg)" }, { transform: "rotateX(90deg)" }], 90, {}, { easing: "ease-in" });
  e.textContent = versalien(neueEndung);
  await bewege(e, [{ transform: "rotateX(-90deg)" }, { transform: "rotateX(0deg)" }], 110, { transform: "" }, { easing: "ease-out" });
}

/**
 * Richtig: Das Symbol setzt sich über das Wort, Kofi hüpft hinter das Kästchen, die Probe läuft im Bild (Nomen: das Artikelwort
 * schreibt sich davor; Verb: ich und du mit ihrer Endung, je ein Hüpfer, ein Ton höher), verweht, und das Symbol drückt sich
 * mit Plopp fest. Etwa 2,2 s (Verb), ein Tipp springt ans Ende (Regeln §1). Ist es das letzte Symbol, hüpft Kofi danach den Satz ab.
 * @param {any} k die Karte @param {string} art @param {HTMLElement} teil @param {{ letztes: boolean, freude: boolean, kurz: boolean, ohneSatz: boolean }} o
 */
async function wirkungRichtig(k, art, teil, { letztes, freude, kurz, ohneSatz }) {
  const L = lauf;
  const { warte, bewege } = mit(L);
  const nr = ++wirkungNr;
  const p = B.p;
  const kasten = /** @type {HTMLElement} */ (B.kaesten.get(k.i));
  const w = k.wort;
  let aus = false;
  const schliessen = () => {
    if (aus) return;
    aus = true;
    setzeSymbol(kasten, art);
    probeZeile(kasten, null);
    endungZurueck(kasten, w);
    teil.classList.add("verborgen");
    offeneWirkungen.delete(schliessen);
    if (nr === wirkungNr) {
      stelleKofi(wegMass().mitte(kasten));
      kofiHaltung("stehen", 0);
    }
  };
  offeneWirkungen.add(schliessen);

  // 1. Das Symbol setzt sich über das Wort (0,2 s).
  teil.classList.add("verborgen");
  const chip = neu("div", "eingerastet", `<ls-wortart art="${art}"></ls-wortart>`);
  kasten.querySelector(".symbolplatz")?.replaceChildren(chip);
  await bewege(chip, [{ transform: "scale(1.25)", opacity: 0.6 }, { transform: "scale(1)", opacity: 1 }], 200, {}, { easing: "ease-out" });
  if (aus) return;

  // 2. Kofi hüpft hinter das Kästchen (0,45 s).
  await kofiZu(L, wegMass().mitte(kasten), { ms: kurz ? 240 : 320 });
  if (aus) return;
  kofiHaltung("zeigen", 140, L);

  // 3. Die Probe in Kreide.
  if (!L.skip) klang.kreide();
  if (w.art === "verb") {
    const t = verbTeile(w);
    probeZeile(kasten, probeKreide(w, "ich"));
    await klappe(L, kasten, t.ich);
    if (aus) return;
    if (!L.skip) klang.probe(0);
    await kofiHuepftHier(L);
    if (aus) return;
    await warte(kurz ? 80 : 100);
    if (aus) return;
    probeZeile(kasten, probeKreide(w, "du"));
    await klappe(L, kasten, t.du);
    if (aus) return;
    if (!L.skip) klang.probe(1);
    await kofiHuepftHier(L);
    if (aus) return;
    await warte(kurz ? 80 : 150);
  } else {
    probeZeile(kasten, probeKreide(w));
    await warte(kurz ? 280 : 450);
  }
  if (aus) return;

  // 4. Die Kreide verweht, das Symbol drückt sich mit Plopp fest.
  probeZeile(kasten, null);
  endungZurueck(kasten, w);
  await warte(100);
  if (aus) return;
  if (!L.skip) klang.plopp();
  await bewege(chip, [{ transform: "scale(1)" }, { transform: "scale(1.12)", offset: 0.5 }, { transform: "scale(1)" }], 150);
  if (aus) return;
  schliessen();
  if (!letztes || ohneSatz) {
    if (nr === wirkungNr) kofiHaltung("stehen", 200, L);
    return;
  }

  // 5. Der Satz ist fertig: Kofi hüpft die ganze Reihe ab, je Wort ein Hüpfer und ein Ton, das Wort leuchtet.
  const lauf2 = L;
  const kasten2 = p?.karten.map((kk) => /** @type {HTMLElement} */ (B.kaesten.get(kk.i))) ?? [];
  let n = 0;
  const fertigSchluss = () => {
    for (const el of kasten2) el.classList.remove("leuchtet");
    offeneWirkungen.delete(fertigSchluss);
    if (nr === wirkungNr && kasten2.length) stelleKofi(wegMass().mitte(kasten2[kasten2.length - 1]));
  };
  offeneWirkungen.add(fertigSchluss);
  if (p) letzterSatz = erzaehler.fertig(p);
  for (const el of kasten2) {
    if (lauf2.skip) break;
    el.classList.add("leuchtet");
    if (!lauf2.skip) klang.huepf(n);
    await kofiZu(lauf2, wegMass().mitte(el), { ms: 150, hoch: 3 });
    n++;
    el.classList.remove("leuchtet");
  }
  fertigSchluss();
  if (freude && nr === wirkungNr) freudeKofi(w, p?.karten.map((kk) => kk.wort) ?? []);
  else if (nr === wirkungNr) kofiHaltung("stehen", 200, L);
}

/** Die Freude nach einer richtigen Antwort: zwei bis drei Varianten, nie zweimal dieselbe; ab und zu ein Witz. @param {any} w @param {any[]} woerter */
function freudeKofi(w, woerter) {
  const lustig = witz(seitWitz, nachFehler, woerter);
  if (lustig) {
    seitWitz = 0;
    kofiBewegung(lustig);
    return;
  }
  seitWitz++;
  const art = naechsteFreude(vorigeFreude, seitHuepfen);
  vorigeFreude = art;
  seitHuepfen = art === "huepfen" ? 0 : seitHuepfen + 1;
  if (art === "klopfen") kofiHaltung("freuen-klein", 200);
  else kofiBewegung(art);
  void w;
}

/**
 * Daneben: Kofi hüpft hin, die Probe schreibt sich davor (die Frage ohne Antwort „Der gähnt?“), das Symbol legt sich an,
 * rastet nicht ein, kippt leicht schräg, weiches Boing, gleitet zurück; die Kreide verweht, Kofi legt den Kopf schief. Etwa
 * 1,6 s. Nichts wird zurückgesetzt. Das echte Symbol liegt sofort wieder an seinem Platz (blass); eine Kopie macht den Weg.
 * @param {HTMLElement} teil @param {DOMRect} abgelegt wo das Symbol losgelassen wurde @param {any} k @param {string} art
 */
async function wirkungDaneben(teil, abgelegt, k, art) {
  const L = neuerLauf();
  const { warte, bewege } = mit(L);
  const nr = ++wirkungNr;
  nachFehler = true;
  const kasten = /** @type {HTMLElement} */ (B.kaesten.get(k.i));
  const kreide = art === "nomen" ? "der" : art === "verb" ? "ich" : "das";
  let aus = false;
  const heim = teil.getBoundingClientRect();
  const kopie = /** @type {HTMLElement} */ (teil.cloneNode(true));
  kopie.removeAttribute("id");
  kopie.classList.remove("gezogen", "angehoben", "gedrueckt", "markiert");
  kopie.style.cssText = "";
  kopie.classList.add("flug");
  Object.assign(kopie.style, { width: `${abgelegt.width}px`, height: `${abgelegt.height}px`, transformOrigin: "50% 50%", transform: `translate(${abgelegt.left}px, ${abgelegt.top}px)` });
  fluege.append(kopie);
  teil.style.opacity = "0.35";
  const aufraeumen = () => {
    if (aus) return;
    aus = true;
    kopie.remove();
    teil.style.opacity = "";
    probeZeile(kasten, null);
    offeneWirkungen.delete(aufraeumen);
    if (nr === wirkungNr) kofiHaltung("stehen", 200, L);
  };
  offeneWirkungen.add(aufraeumen);
  const kr = kasten.getBoundingClientRect();
  const x = kr.left + kr.width / 2 - abgelegt.width / 2;
  const y = kr.top + 2 * remPx();
  try {
    // anlegen, Kofi hüpft hin, die Frage schreibt sich davor
    bewege(kopie, [{ transform: `translate(${abgelegt.left}px, ${abgelegt.top}px)` }, { transform: `translate(${x}px, ${y}px)` }], 170, { transform: `translate(${x}px, ${y}px)` }, { easing: "ease-out" });
    await kofiZu(L, wegMass().mitte(kasten), { ms: 320, hoch: 4 });
    if (aus) return;
    kofiHaltung("nachdenken", 160, L);
    if (!L.skip) klang.kreide();
    probeZeile(kasten, kreide);
    // schräg kippen, nicht einrasten
    klang.boing();
    await bewege(kopie, [{ transform: `translate(${x}px, ${y}px) rotate(0deg)` }, { transform: `translate(${x}px, ${y}px) rotate(11deg)`, offset: 0.45 }, { transform: `translate(${x}px, ${y}px) rotate(-3deg)`, offset: 0.8 }, { transform: `translate(${x}px, ${y}px) rotate(5deg)` }], 320, { transform: `translate(${x}px, ${y}px) rotate(5deg)` }, { easing: "ease-out" });
    if (aus) return;
    await warte(260);
    // ruhig zurückgleiten an den Platz, die Kreide verweht
    probeZeile(kasten, null);
    await bewege(kopie, [{ transform: `translate(${x}px, ${y}px) rotate(5deg)` }, { transform: `translate(${heim.left}px, ${heim.top}px) rotate(0deg)` }], 400, { transform: `translate(${heim.left}px, ${heim.top}px)` }, { easing: "ease-in-out" });
  } finally {
    aufraeumen();
  }
}

// --- Stelle eine Aufgabe -------------------------------------------------------------------------------------
/**
 * Zeigt eine Aufgabe und meldet dem RAHMEN nur zwei Dinge: melde.passtNicht() und melde.geloest(key).
 * Zurück kommt { hilfe(stufe), zuege(), richtigerZug(), spielZug(), abbau() }.
 * @param {{ ziel: { key: string, daten?: any }, stufe?: string }} aufgabe
 * @param {{ passtNicht: () => void, geloest: (key: string) => void }} melde
 * @param {{ ohneSatz?: boolean }} [opt] ohneSatz: nach dem letzten Symbol hüpft Kofi den Satz nicht ab (Einführung)
 */
function stelleAufgabe(aufgabe, melde, { ohneSatz = false } = {}) {
  const stufe = aufgabe.stufe ?? "material";
  const p = plan(aufgabe.ziel, stufe);
  if (!p) throw new Error(`G01: unbekannte Aufgabe ${aufgabe.ziel.key}`);
  let fertig = false;
  let probe = 0;
  /** Hilfe 2 wurde gezeigt: nach jedem gelegten Symbol zeigt der Ring das nächste (die Hilfe bleibt, bis die Aufgabe gelöst ist). */
  let loesungGezeigt = false;
  const wechsel = B.wechsel;
  B.wechsel = null;
  legeReihe(p);
  if (wechsel) {
    // Der Wechsel wird angesagt (Regeln §8); danach gilt wieder der Satz zum Noch-mal-hören.
    if (wechsel === "zweitesSymbol") {
      const neue = B.stuecke.filter((s) => s.art !== p.ziel);
      for (const s of neue) s.el.classList.add("markiert");
      const ringWeg = () => { for (const s of neue) s.el.classList.remove("markiert"); };
      document.addEventListener("pointerdown", ringWeg, { once: true, capture: true });
    }
    letzterSatz = erzaehler.wechsel(wechsel);
    letzterSatz.catch(() => undefined).then(() => erzaehler.satz(p));
  }

  const ohneMarkierung = () => {
    for (const s of B.stuecke) s.el.classList.remove("markiert");
    for (const el of B.kaesten.values()) el.classList.remove("markiert");
  };

  /** @param {HTMLElement} teil @param {Element} ziel */
  const ablegen = (teil, ziel) => {
    const art = teil.dataset.art ?? "";
    const i = Number(/** @type {HTMLElement} */ (ziel).dataset.i);
    const k = p.karten.find((x) => x.i === i);
    if (fertig || B.lage !== "start" || !k || B.belegt.has(i)) return zurueck(teil);
    if (!passt(k, art)) {
      const abgelegt = teil.getBoundingClientRect();
      teil.style.translate = "";
      zurueck(teil);
      wirkungDaneben(teil, abgelegt, k, art);
      melde.passtNicht();
      probe++;
      if (!fertig) {
        // Die Frage ohne Antwort, dann der Auftrag; ein neuer Zug des Kindes bricht beides ab.
        const nr = probe;
        letzterSatz = erzaehler.falsch(art, k.wort).then(() => (nr === probe && !fertig ? erzaehler.nochmal() : undefined)).catch(() => undefined);
      }
      return;
    }
    probe++; // laufende Hilfe abbrechen
    ohneMarkierung();
    B.belegt.add(i);
    const stueck = B.stuecke.find((s) => s.el === teil);
    if (stueck) B.stuecke = B.stuecke.filter((s) => s !== stueck);
    teil.style.transform = "";
    teil.style.translate = "";
    teil.classList.remove("angehoben", "gezogen", "gedrueckt");
    const letztes = B.stuecke.length === 0;
    if (loesungGezeigt && !letztes) markiereNaechstes();
    const kurz = p.karten.filter((x) => B.belegt.has(x.i) && x.wort.art === k.wort.art).length > 1;
    if (letztes) {
      fertig = true;
      B.lage = "loesung";
    }
    neuerLauf();
    letzterSatz = erzaehler.richtig(k.wort);
    const freude = !nachFehler;
    wirkungFertig = wirkungRichtig(k, art, teil, { letztes, freude, kurz, ohneSatz }).catch((e) => protokoll(`${SPIEL_ID}: Wirkung: ${e?.message ?? e}`));
    if (letztes) {
      nachFehler = false;
      melde.geloest(p.key);
    }
  };
  B.offen = { ablegen };

  /** Das nächste Symbol und das Kästchen, in das es gehört. */
  const naechstes = () => {
    const s = B.stuecke[0];
    return s ? { s, k: richtigesKaestchen(p.karten, B.belegt, s.art) } : null;
  };

  /** Der Sonnenring auf dem nächsten Symbol und seinem Wort. @returns {HTMLElement | null} das Kästchen */
  const markiereNaechstes = () => {
    ohneMarkierung();
    const n = naechstes();
    if (!n || !n.k) return null;
    const kasten = /** @type {HTMLElement} */ (B.kaesten.get(n.k.i));
    n.s.el.classList.add("markiert");
    kasten.classList.add("markiert");
    return kasten;
  };

  /** Lösung mit Begründung (L12): Kofi hüpft hinter das Wort und zeigt darauf, Symbol und Wort bekommen den Sonnenring. */
  const zeigeLoesung = async () => {
    loesungGezeigt = true;
    const kasten = markiereNaechstes();
    if (!kasten) return;
    const L = neuerLauf();
    erzaehler.zeigt();
    await kofiZu(L, wegMass().mitte(kasten), { ms: 360, hoch: 4 });
    kofiHaltung("zeigen", 160, L);
  };

  /** Hörprobe (Hilfe 1): Kofi hüpft die freien Wörter ab, an jedem läuft die Probe des nächsten Symbols; das Kind entscheidet. */
  const hoerprobe = async () => {
    const nr = ++probe;
    ohneMarkierung();
    const n = naechstes();
    if (!n) return;
    const L = neuerLauf();
    const { warte } = mit(L);
    for (const k of probeKaesten(p.karten, B.belegt)) {
      if (nr !== probe || fertig) break;
      const kasten = /** @type {HTMLElement} */ (B.kaesten.get(k.i));
      await kofiZu(L, wegMass().mitte(kasten), { ms: 300, hoch: 3.5 });
      if (nr !== probe || fertig) break;
      kasten.classList.add("markiert");
      if (!L.skip) klang.kreide();
      probeZeile(kasten, k.wort.art === n.s.art ? probeKreide(k.wort) : n.s.art === "nomen" ? "der" : n.s.art === "verb" ? "ich" : "das");
      const satz = passt(k, n.s.art) ? erzaehler.richtig(k.wort, { zeigen: true }) : erzaehler.falsch(n.s.art, k.wort, { zeigen: true });
      await satz;
      await warte(150);
      kasten.classList.remove("markiert");
      probeZeile(kasten, null);
    }
    if (nr === probe) kofiHaltung("stehen", 200, L);
  };

  const zugVon = (/** @type {{ el: HTMLElement }} */ s, /** @type {number} */ i) => ({ art: "ziehen", von: selektor(s.el), nach: selektor(/** @type {Element} */ (B.kaesten.get(i))) });

  return {
    zuege() {
      if (fertig || B.lage !== "start") return [];
      // Der richtige Zug steht vorn: nach Hilfe 2 trägt das Symbol den Sonnenring, alle seine Züge gelten dem Prüfstand als „gezeigt“.
      const n = naechstes();
      const z = B.stuecke.flatMap((s) => p.karten.filter((k) => !B.belegt.has(k.i)).map((k) => ({ s, k })));
      return z.sort((a, b) => Number(b.s === n?.s && b.k === n?.k) - Number(a.s === n?.s && a.k === n?.k)).map(({ s, k }) => zugVon(s, k.i));
    },
    richtigerZug() {
      if (fertig || B.lage !== "start") return null;
      const n = naechstes();
      return n?.k ? zugVon(n.s, n.k.i) : null;
    },
    /** @param {1 | 2} s */
    hilfe(s) {
      if (fertig) return;
      if (s === 1) {
        hoerprobe();
        return;
      }
      probe++;
      zeigeLoesung();
    },
    /** Für die Einführung: das Symbol zieht selbst über das Wort (wie ein Kind) und rastet ein. @param {number} wortNr */
    async spielZug(wortNr) {
      const n = naechstes();
      if (!n) return;
      const kasten = /** @type {HTMLElement} */ (B.kaesten.get(wortNr));
      const von = n.s.el.getBoundingClientRect();
      const nach = /** @type {HTMLElement} */ (kasten.querySelector(".symbolplatz")).getBoundingClientRect();
      const dx = nach.left + nach.width / 2 - (von.left + von.width / 2);
      const dy = nach.top + nach.height / 2 - (von.top + von.height / 2);
      const { bewege } = mit(lauf);
      await bewege(n.s.el, [{ transform: "translate(0, 0)" }, { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 3 * remPx()}px) scale(1.06)`, offset: 0.5 }, { transform: `translate(${dx}px, ${dy}px)` }], 760, { transform: "" }, { easing: "ease-in-out" });
      ablegen(n.s.el, kasten);
    },
    abbau() {
      B.offen = null;
      probe++;
      ohneMarkierung();
    },
  };
}

// --- Szenen zwischen den Aufgaben ------------------------------------------------------------------------------
/** Sonnenring auf Dingen der Einführung (Reihe, Tablett, Wort, Symbol). @type {Element[]} */
let ringAuf = [];
/** @param {(Element | null | undefined)[]} els */
function ring(els) {
  for (const el of ringAuf) el.classList.remove("markiert");
  ringAuf = /** @type {Element[]} */ (els.filter(Boolean));
  for (const el of ringAuf) el.classList.add("markiert");
}

/**
 * Vor jeder Aufgabe: wechselt die Stufe, erzählt eine kurze Szene den Wechsel (Regeln §8: kein Wechsel ohne Bild): Kofi
 * wischt die Reihe weg (≤ 0,6 s), danach malt er die neue; die Aufgabe sagt den Wechsel an.
 * @param {{ ziel?: { daten?: any }, stufe?: string }} aufgabe
 */
async function bereiteAufgabe(aufgabe) {
  stand.phase = "folge";
  const L = neuerLauf();
  const { bewege } = mit(L);
  raeumeAb();
  const stufe = aufgabe.stufe ?? "material";
  const daten = aufgabe.ziel?.daten ?? {};
  const wechsel = bildWechsel(B.letzteStufe, stufe, daten.ziel ?? [], daten.kopfZiel ?? daten.ziel ?? []);
  /** @type {() => void} */
  let getippt = () => {};
  const tipp = new Promise((ok) => { getippt = () => ok(undefined); });
  const abmelden = beimTippen(() => {
    ueberspringeAlles();
    getippt();
  });
  try {
    if (wechsel) {
      await Promise.race([letzterSatz.catch(() => undefined), tipp]);
      B.wechsel = wechsel;
      // Der Schuh wischt die Reihe weg (nur wenn die Bilder kommen oder gehen).
      if (wechsel !== "zweitesSymbol" && B.lage !== "leer") await bewege(reihe, [{ opacity: 1, transform: "translateX(0)" }, { opacity: 0, transform: "translateX(6rem)" }], 420, { opacity: "", transform: "" }, { easing: "ease-in" });
    }
  } finally {
    abmelden();
  }
  B.letzteStufe = stufe;
}

// =====================================================================================================
// EINFÜHRUNG im echten Spielbild (docs/spielbau.md §8, Idee §6)
// =====================================================================================================
// Eine kleine Geschichte: die Reihe, das Tablett, das Wort, das Symbol – je mit dem Sonnenring; Kofi legt es über „Katze“
// bzw. „gähnt“ und macht die Probe; dann legt das Kind selbst das Symbol über „Ball“ bzw. „rollt“. Nicht gebucht.

/** Die Einführung: Sätze, Hilfe und Zug für den Prüfstand (rahmen/einfuehrung-lauf.js). */
const stand = { phase: "laden", aufgabe: /** @type {string | null} */ (null), nr: 0, versuche: 0, hilfeStufe: 0, vorschau: true, lernstufe: /** @type {string | null} */ (null) };
const E = einfuehrungsLauf({ ton: () => leiste.ton, text: () => blase.text, stand });
// Ohne Ton kürzt nur ein Tipp des Kindes die Lesezeit ab, nie die Einstellung (spielbau.md §8). Hilfe, Pause und
// Leiste nicht – die Hilfe sagt den Schritt noch einmal.
E.verbindeTippen(document, { ausser: [hilfe, pause, leiste] });

/** Das Thema der Einführung: Verben, sonst Nomen. */
let variante = /** @type {"nomen" | "verb"} */ ("nomen");

/** @param {string} key @param {string[]} ziel @returns {{ ziel: { key: string, daten: any }, stufe: string }} */
const material = (key, ziel) => ({ ziel: { key, daten: { ziel, kopfZiel: ziel } }, stufe: "material" });

/**
 * Die Einführung im echten Spielbild. Mit `r` gilt sie danach als gesehen, und die Rundenzeit beginnt.
 * @param {{ einfuehrungGesehen(): void, beginneZeit(): void }} [r]
 */
function einfuehrung(r) {
  const art = variante;
  const e = einleitung[art];
  const satz = E.satz;
  // Kofi macht es an „Katze“ bzw. „gähnt“ vor, das Kind übernimmt „Ball“ bzw. „rollt“.
  const vorKey = `wortart:${art}:katze-gaehnt`;
  const duKey = `wortart:${art}:ball-rollt`;
  /** Nummer des Wortes der Wortart im Satz. @param {string} key */
  const wortNr = (key) => plan(material(key, [art]).ziel, "material")?.karten.find((k) => k.wort.art === art)?.i ?? 0;
  const vorWort = wortNr(vorKey);
  const duWort = wortNr(duKey);
  /** @type {ReturnType<typeof stelleAufgabe> | null} */
  let demo = null;
  return E.spiele(async () => {
    try {
      neuerLauf();
      raeumeAb();
      B.letzteStufe = null;
      B.wechsel = null;
      demo = stelleAufgabe(material(vorKey, [art]), { passtNicht() {}, geloest() {} }, { ohneSatz: true });
      ring([matte]);
      await satz(e.gemalt);
      ring([B.stuecke[0]?.el]);
      await satz(e.symbol);
      ring([B.kaesten.get(vorWort)]);
      await satz(e.legt);
      ring([]);
      await satz(e.probiert);
      // Kofi legt das Symbol über das Wort; Wirkung: die Probe („Die Katze.“, „Ich gähne, du gähnst.“).
      await demo.spielZug(vorWort);
      await wirkungFertig;
      await letzterSatz;
      await satz(e.bleibt);
      demo.abbau();
      // Jetzt du: das Kind legt selbst, Zug für Zug.
      neuerLauf();
      /** @type {() => void} */
      let gelegt = () => {};
      const getan = new Promise((ok) => { gelegt = () => ok(undefined); });
      const du = stelleAufgabe(material(duKey, [art]), { passtNicht() {}, geloest: () => gelegt() });
      const symbol = B.stuecke[0]?.el;
      const wort = B.kaesten.get(duWort);
      ring([symbol, wort]);
      const zug = { art: "ziehen", von: selektor(/** @type {Element} */ (symbol)), nach: selektor(/** @type {Element} */ (wort)) };
      const kind = E.kind(zug, getan);
      await satz(e.jetztDu);
      await kind;
      ring([]);
      du.abbau();
      await wirkungFertig;
      await letzterSatz;
      await satz(einleitung.rutscht);
      await satz(einleitung.nochmal);
      await satz(e.lernen);
      await satz(einleitung.los);
    } finally {
      ueberspringeAlles();
      ring([]);
      demo?.abbau();
      B.offen = null;
      raeumeAb();
      leereTablett();
      leereReihe();
      B.lage = "leer";
      B.letzteStufe = null;
      kofiHeim();
      kofiHaltung("stehen", 0);
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
// In der Einführung ist der richtige Zug das Symbol im Sonnenring (das Kind zieht selbst), sonst wie in der Vorlage.
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
      const a = wortartAus(key);
      return key && a ? { ziel: { key, daten: { ziel: [a.ziel], kopfZiel: a.ziel === "verb" ? ["verb", "nomen"] : [a.ziel] } }, auch: [], stufe: key.includes("jagt") ? "kopf" : "material" } : null;
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
  variante = wortartAus(aufgabe?.ziel?.key)?.ziel === "verb" ? "verb" : "nomen";

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
  leereTablett();
  leereReihe();
  kofiHeim();
  return spieleRunde(vorschau);
}

// --- Start ---------------------------------------------------------------------------------------
async function start() {
  await leiste.bereit(); // Ton-Einstellung geladen
  if (params.has("eltern")) return elternansicht();
  kofiHeim();
  window.addEventListener("resize", () => { if (B.lage === "leer") kofiHeim(); });
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
