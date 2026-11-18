// S20 Leuchtschrift (Idee docs/spiele/schreiben/s20-schreibschrift-verbunden-schreiben.md).
// Ela schreibt ein Wort mit der Wunderkerze in die obere Zeile des Nachthimmels, das Kind schreibt es mit Stift oder Finger in
// einem Zug in die untere. Die Spur leuchtet und sprüht Funken. Bleibt der Stift 0,8 s oben, macht die Kamera ein Foto, das
// Wort fliegt an Elas Wäscheleine. Wo abgesetzt wurde, zeigt das Foto eine Lücke; Start, Drehrichtung und Band zeigt Elas Spur.
//
// Aufbau dieser Datei:
//   SPIELWELT   Kennung, Sätze, Klänge
//   ZEICHENFLÄCHE  Lineatur, leuchtende Spuren, Funken (ein Canvas)
//   EINGABE     Freihand-Strich mit Aufzeichnung (Pointer Events, Stift bevorzugt)
//   WIRKUNG     Ela schreibt vor, Kamera, Foto, Leine, Daneben
//   AUFGABE     eine Aufgabe stellen, prüfen (logik.js), Hilfe
//   EINFÜHRUNG  im echten Spielbild
//   RAHMEN      Hilfe-Leiter, Lernsteuerung, Folge, Pause (wie die Vorlage)

import "../../rahmen/leiste.js";
import "../../rahmen/blase.js";
import "../../rahmen/hilfe.js";
import "../../rahmen/pause.js";
import "../../rahmen/knopf.js";
import * as Runde from "../../runde/runde.js";
import { meldePruefSchnittstelle, testbetrieb } from "../../rahmen/pruefen.js";
import { einfuehrungsLauf } from "../../rahmen/einfuehrung-lauf.js";
import { sperreTouch, protokoll, esc } from "../../lernspiel.js";
import { sprich } from "../../kern/stimme.js";
import { runde, einmal } from "../../lernsteuerung.js";
import { starteSpielzeit, amRundenende, sage } from "../../rahmen/spielzeit.js";
import { ladeVorlagen, wort as vorlagenWort, form as vorlagenForm, hatSatz } from "../../kern/vorlagen.js";
import { schriftPfad } from "../../kern/einstellungen.js";
import { schreibAus } from "../../aufgabenarten.js";
import { kameraSvg } from "./raum.js";
import * as P from "./logik.js";

sperreTouch();

const $ = (/** @type {string} */ id) => /** @type {any} */ (document.getElementById(id));
const leiste = $("leiste");
const blase = $("blase");
const hilfe = $("hilfe");
const pause = $("pause");
const matte = $("matte");
const cv = /** @type {HTMLCanvasElement} */ ($("zeichen"));
const cx = /** @type {CanvasRenderingContext2D} */ (cv.getContext("2d"));
const spielflaeche = /** @type {HTMLElement} */ (document.querySelector(".spielflaeche"));

// =====================================================================================================
// SPIELWELT
// =====================================================================================================

/** Kennung des Spiels: steht einmal in der HTML-Datei an <ls-leiste spiel>. */
const SPIEL_ID = leiste.getAttribute("spiel");

/** Aufgabenarten (gilt nur, solange das Spiel nicht in spiele.json steht; dort steht dasselbe). */
const ARTEN = [{ art: "schreibschrift", stufen: ["material", "vorstellung", "kopf"] }];

/** Aufgaben je Runde (die Lernsteuerung begrenzt zusätzlich auf 4 Minuten). */
const AUFGABEN_JE_RUNDE = 8;
/** Längstens so lange wartet die Folge auf das Ende der Wirkung (Idee §1: etwa 2,5 s). */
const FOLGE_MAX_MS = 4200;
/** Wie viele Fotos an die Leine passen, bevor das älteste Platz macht. */
const LEINE_PLAETZE = 11;
/** Eine Spur unter dieser Wegstrecke (Einheiten) ist ein Tupfer: sie sprüht kurz und ist kein Versuch. */
const MIN_WEG = 40;

/** Nur Vorschau: Aufgaben, falls die Lernsteuerung nichts liefert. */
const VORSCHAU = { thema: "Schaukel-Buchstaben", aufgaben: ["schreib:i", "schreib:u", "schreib:ui"] };

/** Sätze aus Daten (je Wort ausgeschrieben, texte.json). */
const TEXTE = await fetch(new URL("texte.json", import.meta.url)).then((r) => r.json()).catch(() => null);

/** Der zuletzt begonnene Satz nach einer Lösung; vor dem nächsten Satz des Spiels wartet es darauf. @type {Promise<any>} */
let letzterSatz = Promise.resolve();

/** @param {string | undefined} text @param {any} [o] */
const sagenText = (text, o) => (text ? blase.sage(text, o) : Promise.resolve("still"));

/** Der Erzähler (docs/stimme.md): beschreibt, was zu sehen ist, nie ein Urteil (grundsaetze.md 3.2). Jeder Satz steht als feste Zeichenkette. */
const erzaehler = {
  /** Das Wort zum Noch-mal-hören (wird nicht von selbst gesprochen). @param {string} w */
  wort: (w) => sagenText(TEXTE?.wort?.[w], { sprechen: false }),
  /** Dasselbe nach einem Fehlversuch, still. @param {string} w */
  zug: (w) => sagenText(TEXTE?.zug?.[w], { sprechen: false }),
  luecke: () => blase.sage("Hier ist die Spur unterbrochen."),
  start: () => blase.sage("Ela fängt hier an."),
  richtung: () => blase.sage("Ela schreibt hier andersherum."),
  band: () => blase.sage("Hier geht die Spur über die Linie."),
  nochmal: () => blase.sage("Versuch es noch einmal."),
  probe: () => blase.sage("Ela schreibt das langsam vor.", { zeigen: true }),
  loesung: () => blase.sage("Fahr Elas Spur in einem Zug nach.", { zeigen: true }),
  wechselVorstellung: () => blase.sage("Ela schreibt nur noch einmal vor.", { zeigen: true }),
  wechselKopf: () => blase.sage("Jetzt steht das Wort auf dem Schild.", { zeigen: true }),
  gehtNicht: () => blase.sage("Das Spiel geht gerade nicht."),
};

/** Die Sätze der Einführung (docs/spielbau.md §8): in Ruhe, als kleine Geschichte. */
const einleitung = {
  dunkel: (/** @type {any} */ o) => blase.sage("Es wird dunkel am Zeltplatz.", o),
  kerze: (/** @type {any} */ o) => blase.sage("Ela hat eine Wunderkerze.", o),
  schreibt: (/** @type {any} */ o) => blase.sage("Sie schreibt ein Wort in die Luft.", o),
  nichtAb: (/** @type {any} */ o) => blase.sage("Sie setzt nicht ab.", o),
  foto: (/** @type {any} */ o) => blase.sage("Die Kamera macht ein Foto.", o),
  jetztDu: (/** @type {any} */ o) => blase.sage("Jetzt schreibst du ui, hier unten.", o),
  leine: (/** @type {any} */ o) => blase.sage("Ohne Absetzen kommt das Foto an die Leine.", o),
  luecke: (/** @type {any} */ o) => blase.sage("Mit Lücke probierst du es einfach noch einmal.", o),
  los: (/** @type {any} */ o) => blase.sage("Jetzt geht es los.", o),
};

/** Elternansicht (?eltern): beschreibend, von Stärken aus, kein Vergleich (3.3). @param {HTMLElement} feld */
function fuelleEltern(feld) {
  feld.innerHTML = `<p>Es wird dunkel am Zeltplatz, und Ela schreibt mit einer Wunderkerze ein Wort in die obere Zeile des
    Nachthimmels. Ihr Kind schreibt dasselbe Wort mit Stift oder Finger in die untere Zeile, in einem Zug, so wie man
    verbunden schreibt. Solange der Stift aufliegt, leuchtet die Spur und sprüht Funken. Bleibt er danach kurz oben, macht
    die Kamera ein Foto, und das Wort hängt an Elas Wäscheleine.</p>
    <p>Gemessen wird nur, was man messen kann: ob mitten im Wort abgesetzt wurde, wo der Strich beginnt, in welche Richtung
    ein Oval oder eine Girlande läuft und ob die Schrift im Band bleibt. Schönheit, Druck und die Haltung der Hand werden nie
    bewertet. Wo abgesetzt wurde, zeigt das Foto eine Lücke; bei Start, Richtung oder Band schreibt Ela die Stelle noch
    einmal vor. Als Hilfe schreibt Ela die Stelle ganz langsam, danach liegt ihre Spur in der Zeile, und Ihr Kind fährt sie nach.</p>
    <p>Welche Wörter dran sind und was Ihr Kind schon kann, steht bei den Themen im Elternbereich.</p>`;
}

/**
 * Pause (K1, K8): „Mach mit“ (Idee §6). Ein Leuchtwort wie ein Foto und der Satz, auch gesprochen.
 * @param {HTMLElement} feld @param {boolean} ton
 */
function fuelleSachmoment(feld, ton) {
  feld.replaceChildren();
  const bild = document.createElement("div");
  bild.className = "bildchen";
  bild.innerHTML = fotoSvg("ui");
  const satz = document.createElement("p");
  satz.textContent = "Schreib ein Wort auf Papier, ohne abzusetzen.";
  feld.append(bild, satz);
  if (ton) sprich("Schreib ein Wort auf Papier, ohne abzusetzen.");
}

// --- Klänge (Web Audio, leise; Ton aus gilt) ---------------------------------------------------------
/** @type {AudioContext | null} */
let audio = null;
/** Der Audio-Kontext, erst nach der ersten Eingabe des Kindes (davor erlaubt der Browser keinen Ton). */
const ctxAudio = () => {
  if (!audio && navigator.userActivation && !navigator.userActivation.hasBeenActive) return null;
  audio ??= new AudioContext();
  if (audio.state === "suspended") audio.resume().catch(() => {});
  return audio;
};
/** @param {number} hz @param {{ dauer?: number, typ?: OscillatorType, laut?: number, gleiten?: number, spaeter?: number }} [o] */
function ton(hz, { dauer = 0.13, typ = "triangle", laut = 0.07, gleiten = 0, spaeter = 0 } = {}) {
  if (!leiste.ton) return;
  try {
    const a = ctxAudio();
    if (!a) return;
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
/** Rauschen durch einen Filter. @param {number} dauer @param {BiquadFilterType} typ @param {number} hz @param {number} laut @param {number} [spaeter] @param {boolean} [abklingen] */
function rauschen(dauer, typ, hz, laut, spaeter = 0, abklingen = true) {
  if (!leiste.ton) return null;
  try {
    const a = ctxAudio();
    if (!a) return null;
    const n = Math.floor(a.sampleRate * dauer);
    const puffer = a.createBuffer(1, n, a.sampleRate);
    const d = puffer.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (abklingen ? 1 - i / n : 1);
    const quelle = a.createBufferSource();
    quelle.buffer = puffer;
    const filter = a.createBiquadFilter();
    filter.type = typ;
    filter.frequency.value = hz;
    filter.Q.value = 0.8;
    const g = a.createGain();
    g.gain.value = laut;
    quelle.connect(filter).connect(g).connect(a.destination);
    quelle.start(a.currentTime + spaeter);
    return { quelle, g };
  } catch {
    return null;
  }
}
/** Knistern, solange der Stift aufliegt: gefiltertes Rauschen, das beim Abheben ausklingt. */
const knistern = (() => {
  /** @type {{ quelle: AudioBufferSourceNode, g: GainNode } | null} */
  let lauf = null;
  return {
    an() {
      if (lauf) return;
      lauf = rauschen(1.5, "bandpass", 4200, 0.028, 0, false);
      if (lauf) lauf.quelle.loop = true;
    },
    aus() {
      const l = lauf;
      lauf = null;
      if (!l || !audio) return;
      try {
        l.g.gain.setTargetAtTime(0.0001, audio.currentTime, 0.04);
        l.quelle.stop(audio.currentTime + 0.25);
      } catch {
        // schon still
      }
    },
  };
})();
const klang = {
  /** Heller Ton an einer Spitze, je Spitze einen Ton höher (Pentatonik). @param {number} k */
  spitze: (k) => ton(880 * 2 ** ([0, 2, 4, 7, 9][k % 5] / 12), { dauer: 0.16, typ: "sine", laut: 0.05 }),
  /** Klick der Kamera, dazu das weiche Blitz-Fff. */
  klick: () => { ton(1500, { dauer: 0.035, typ: "square", laut: 0.04 }); ton(300, { dauer: 0.07, typ: "sine", laut: 0.07, gleiten: 0.6, spaeter: 0.03 }); rauschen(0.5, "highpass", 2500, 0.03, 0.06); },
  /** Die Klammer: weiches Plopp. */
  plopp: () => { ton(520, { dauer: 0.1, typ: "sine", laut: 0.1, gleiten: 0.6 }); ton(780, { dauer: 0.06, typ: "sine", laut: 0.03, spaeter: 0.04 }); },
  /** Lücke: kurzes, leises Pff. */
  pff: () => rauschen(0.22, "lowpass", 900, 0.05),
  /** Funkenfontäne: kurzes Zischen. */
  zisch: () => rauschen(0.45, "bandpass", 5200, 0.03),
};

// =====================================================================================================
// ZEICHENFLÄCHE: Lineatur, leuchtende Spuren, Funken
// =====================================================================================================

const wenigBewegung = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const remPx = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 10;

/**
 * Maße der Zeichenfläche. Zwei Zeilen übereinander (e = Ela oben, k = Kind unten), je 300 Einheiten hoch
 * (Oberlinie 0, Mittellinie 100, Grundlinie 200, Unterlänge bis 300); s = Bildpunkte je Einheit.
 */
const G = { s: 0.1, w: 0, h: 0, dpr: 1, pad: 0, x0: 0, yE: 0, yK: 0 };

/** Passt den Canvas an seine Größe an und wählt den Maßstab für ein Wort der Breite `breite` (Einheiten). @param {number} [breite] */
function messen(breite = 420) {
  const r = cv.getBoundingClientRect();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  if (r.width < 2 || r.height < 2) return;
  cv.width = Math.round(r.width * dpr);
  cv.height = Math.round(r.height * dpr);
  G.dpr = dpr;
  G.w = r.width;
  G.h = r.height;
  G.pad = 1.8 * remPx();
  const hoeheE = 300 + 56 + 300;
  const sH = (G.h - 2 * G.pad) / hoeheE;
  const sW = (G.w - 2 * G.pad) / (breite + 190);
  G.s = Math.min(sH, sW);
  G.x0 = G.pad + 80 * G.s;
  G.yE = (G.h - hoeheE * G.s) / 2;
  G.yK = G.yE + (300 + 56) * G.s;
  zeichneAlles();
}

/** Einheiten in Bildpunkte der Zeile. @param {"e" | "k"} z @param {{ x: number, y: number }} p */
const px = (z, p) => ({ x: G.x0 + p.x * G.s, y: (z === "e" ? G.yE : G.yK) + p.y * G.s });
/** Bildpunkte (Canvas) in Einheiten der Kinderzeile. @param {number} x @param {number} y */
const einh = (x, y) => ({ x: (x - G.x0) / G.s, y: (y - G.yK) / G.s });

/**
 * @typedef {{ z: "e" | "k", art: "ela" | "kind" | "stueck" | "hilfe", pts: { x: number, y: number }[], teil: number, alpha: number,
 *   dicke: number, punkt?: boolean }} Spur
 */
/** @type {Spur[]} */
let spuren = [];
/** Ein kurzes Aufglühen der Linie oder Stelle (Band): { y (Einheiten), bis (ms) }. @type {{ z: "k", y: number, bis: number, von: number } | null} */
let blinkLinie = null;
/** Ringe und Glühen auf einer Stelle: { z, x, y (Einheiten), bis, von }. @type {{ z: "e" | "k", x: number, y: number, von: number, bis: number }[]} */
let gluehen = [];

/** @type {{ x: number, y: number, vx: number, vy: number, l: number, d: number, r: number, hell: number }[]} */
let funken = [];
/** Streut Funken um einen Punkt. @param {number} x @param {number} y @param {number} n @param {number} [kraft] @param {number} [hell] */
function streue(x, y, n, kraft = 1, hell = 0.8) {
  if (wenigBewegung()) n = Math.ceil(n / 3);
  const rem = remPx();
  for (let i = 0; i < n && funken.length < 260; i++) {
    const w = Math.random() * Math.PI * 2;
    const v = (3 + Math.random() * 9) * rem * kraft;
    funken.push({ x, y, vx: Math.cos(w) * v, vy: Math.sin(w) * v - 2 * rem, l: 1, d: 1.3 + Math.random() * 1.5, r: (0.18 + Math.random() * 0.22) * rem, hell });
  }
}

/** @type {Set<{ tick: (t: number) => void }>} */
const animierte = new Set();
let schreibtGerade = false;
let rafId = 0;
let letzterTakt = 0;

function an() {
  if (!rafId) {
    letzterTakt = performance.now();
    rafId = requestAnimationFrame(takt);
  }
}
/** @param {number} jetzt */
function takt(jetzt) {
  rafId = 0;
  const dt = Math.min(0.05, Math.max(0.001, (jetzt - letzterTakt) / 1000));
  letzterTakt = jetzt;
  for (const a of [...animierte]) a.tick(jetzt);
  const g = 18 * remPx();
  for (const f of funken) {
    f.vy += g * dt;
    f.vx *= 1 - 1.2 * dt;
    f.x += f.vx * dt;
    f.y += f.vy * dt;
    f.l -= f.d * dt;
  }
  funken = funken.filter((f) => f.l > 0);
  gluehen = gluehen.filter((g2) => jetzt < g2.bis);
  if (blinkLinie && jetzt >= blinkLinie.bis) blinkLinie = null;
  zeichneAlles(jetzt);
  if (animierte.size || funken.length || schreibtGerade || gluehen.length || blinkLinie) rafId = requestAnimationFrame(takt);
}

/** Lineatur einer Zeile: Mittelband als Streifen, Oberlinie, Mittellinie und Grundlinie. @param {"e" | "k"} z @param {number} jetzt */
function lineatur(z, jetzt) {
  const y0 = z === "e" ? G.yE : G.yK;
  const x1 = G.pad;
  const x2 = G.w - G.pad;
  const rem = remPx();
  cx.fillStyle = "rgba(125, 155, 235, 0.13)";
  cx.fillRect(x1, y0 + 100 * G.s, x2 - x1, 100 * G.s);
  const linie = (/** @type {number} */ v, /** @type {number} */ alpha, /** @type {number} */ dicke, /** @type {number[]} */ strich = []) => {
    cx.beginPath();
    cx.setLineDash(strich);
    cx.strokeStyle = `rgba(170, 195, 250, ${alpha})`;
    cx.lineWidth = dicke * rem;
    cx.moveTo(x1, y0 + v * G.s);
    cx.lineTo(x2, y0 + v * G.s);
    cx.stroke();
    cx.setLineDash([]);
  };
  linie(0, 0.2, 0.2, [0.9 * rem, 1.1 * rem]);
  linie(100, 0.34, 0.24);
  linie(200, 0.5, 0.3);
  if (z === "k" && blinkLinie && jetzt !== undefined) {
    const u = (jetzt - blinkLinie.von) / (blinkLinie.bis - blinkLinie.von);
    const a = Math.sin(Math.min(1, Math.max(0, u)) * Math.PI);
    cx.beginPath();
    cx.strokeStyle = `rgba(255, 233, 160, ${0.85 * a})`;
    cx.lineWidth = 0.5 * rem;
    cx.moveTo(x1, y0 + blinkLinie.y * G.s);
    cx.lineTo(x2, y0 + blinkLinie.y * G.s);
    cx.stroke();
  }
}

const FARBEN = {
  ela: { glanz: "110, 165, 255", kern: "226, 240, 255" },
  kind: { glanz: "255, 168, 58", kern: "255, 246, 208" },
  stueck: { glanz: "150, 200, 255", kern: "250, 253, 255" },
  hilfe: { glanz: "110, 165, 255", kern: "226, 240, 255" },
};

/** Eine leuchtende Linie in drei Schichten (Hof, Schein, Kern). @param {Spur} s */
function leuchteSpur(s) {
  const n = Math.min(s.teil, s.pts.length);
  if (n < 1) return;
  const f = FARBEN[s.art];
  const rem = remPx();
  const pp = s.pts.slice(0, n).map((p) => px(s.z, p));
  cx.lineCap = "round";
  cx.lineJoin = "round";
  cx.globalCompositeOperation = "lighter";
  const schicht = (/** @type {number} */ breite, /** @type {number} */ a, /** @type {string} */ farbe) => {
    cx.beginPath();
    cx.lineWidth = breite * rem * s.dicke;
    cx.strokeStyle = `rgba(${farbe}, ${a * s.alpha})`;
    cx.moveTo(pp[0].x, pp[0].y);
    if (pp.length === 1) cx.lineTo(pp[0].x + 0.01, pp[0].y);
    for (let i = 1; i < pp.length; i++) cx.lineTo(pp[i].x, pp[i].y);
    cx.stroke();
  };
  schicht(3.2, 0.1, f.glanz);
  schicht(1.9, 0.2, f.glanz);
  schicht(1.15, 0.45, f.glanz);
  cx.globalCompositeOperation = "source-over";
  schicht(0.62, 0.95, f.kern);
}

/** Zeichnet alles neu: Lineaturen, Spuren, Spitzenglühen, Funken. @param {number} [jetzt] */
function zeichneAlles(jetzt = performance.now()) {
  if (!G.w) return;
  cx.setTransform(G.dpr, 0, 0, G.dpr, 0, 0);
  cx.clearRect(0, 0, G.w, G.h);
  lineatur("e", jetzt);
  lineatur("k", jetzt);
  for (const s of spuren) leuchteSpur(s);
  const rem = remPx();
  cx.globalCompositeOperation = "lighter";
  // Die Spitze der Spur, die gerade wächst
  for (const s of spuren) {
    if (!s.punkt && s.teil < s.pts.length + 0.5 && s.alpha > 0.3 && s.pts.length && (s.art === "kind" ? schreibtGerade : s.teil < s.pts.length)) {
      const p = px(s.z, s.pts[Math.min(s.teil, s.pts.length) - 1] ?? s.pts[0]);
      const r = (2.2 + Math.random() * 0.5) * rem;
      const grad = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      grad.addColorStop(0, `rgba(${FARBEN[s.art].kern}, 0.95)`);
      grad.addColorStop(0.35, `rgba(${FARBEN[s.art].glanz}, 0.5)`);
      grad.addColorStop(1, `rgba(${FARBEN[s.art].glanz}, 0)`);
      cx.fillStyle = grad;
      cx.fillRect(p.x - r, p.y - r, 2 * r, 2 * r);
    }
  }
  for (const g of gluehen) {
    const u = Math.min(1, Math.max(0, (jetzt - g.von) / (g.bis - g.von)));
    const a = Math.sin(u * Math.PI);
    const p = px(g.z, g);
    const r = 6 * rem;
    const grad = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
    grad.addColorStop(0, `rgba(255, 238, 170, ${0.9 * a})`);
    grad.addColorStop(1, "rgba(255, 200, 90, 0)");
    cx.fillStyle = grad;
    cx.fillRect(p.x - r, p.y - r, 2 * r, 2 * r);
  }
  for (const f of funken) {
    cx.fillStyle = `rgba(255, ${Math.round(190 + 50 * f.hell)}, ${Math.round(90 + 120 * f.hell)}, ${Math.max(0, f.l) * 0.95})`;
    cx.beginPath();
    cx.arc(f.x, f.y, f.r * (0.4 + 0.6 * f.l), 0, Math.PI * 2);
    cx.fill();
  }
  cx.globalCompositeOperation = "source-over";
}

/** Eine neue Spur anlegen. @param {Spur["z"]} z @param {Spur["art"]} art @param {{ x: number, y: number }[]} pts @param {number} teil @param {Partial<Spur>} [o] */
function neueSpur(z, art, pts, teil, o = {}) {
  /** @type {Spur} */
  const s = { z, art, pts, teil, alpha: 1, dicke: 1, ...o };
  spuren.push(s);
  an();
  return s;
}
/** @param {(s: Spur) => boolean} wer */
function entferneSpuren(wer) {
  spuren = spuren.filter((s) => !wer(s));
  an();
}

// --- Läufe: jede Wirkung läuft in einem Lauf; ein Tipp und die nächste Aufgabe springen ans Ende -----------------
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
 * Warten und Bewegen an einen bestimmten Lauf gebunden.
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

// =====================================================================================================
// ELA UND DIE KAMERA
// =====================================================================================================

const elaKoerper = $("ela-koerper");
elaKoerper.innerHTML = Runde.zeichne("ela", { haltung: "stehen", blick: "rechts" });
const ela = Runde.steuere(elaKoerper.querySelector("svg"));
/** Ela in einer Haltung (ohne zu warten). @param {string} id @param {number} [ms] */
const elaHaltung = (id, ms = 260) => {
  ela.haltung(id, { ms: lauf.skip ? 0 : ms });
  $("ela").classList.toggle("zeigt", id === "zeigen");
};
/** Ela spielt eine Bewegung (ohne zu warten). @param {string} id */
const elaBewegung = (id) => { if (!lauf.skip) ela.bewegung(id); };

const kamera = $("kamera");
kamera.innerHTML = kameraSvg();
const blitz = $("blitz");

/** Ein Tipp auf Ela (Stufe vorstellung): Ela schreibt das Wort noch einmal. @type {(() => void) | null} */
let elaTippen = null;
$("ela").addEventListener("pointerdown", () => elaTippen?.());

/**
 * Ela schreibt Wege (in Einheiten) in ihre Zeile: die Spur wächst, an Spitzen hält sie kurz an, dort sprüht es heller.
 * Mit `hold` 0 ohne Halt. Danach bleibt die Spur (`bleibt`: "blass" steht, "weg" verglimmt in 1 s, "stueck" leuchtet heller und
 * bleibt für den Aufrufer).
 * @param {Lauf} L @param {{ x: number, y: number }[][]} wege @param {boolean[]} [luft] Punkte (kurze Striche) nach dem Zug
 * @param {{ tempo?: number, bleibt?: "blass" | "weg" | "stueck", hold?: number, art?: Spur["art"], z?: "e" | "k" }} [o]
 * @returns {Promise<Spur[]>}
 */
async function elaSchreibt(L, wege, luft = [], { tempo = 1, bleibt = "blass", hold = 300, art = "ela", z = "e" } = {}) {
  /** @type {Spur[]} */
  const gemacht = [];
  const { warte } = mit(L);
  for (const [k, weg] of wege.entries()) {
    if (!weg.length) continue;
    const punkt = !!luft[k];
    const q = punkt ? weg : P.abtasten(weg, 6);
    const spur = neueSpur(z, art, q, L.skip ? q.length : 0, { punkt, alpha: bleibt === "stueck" ? 1 : 0.95 });
    gemacht.push(spur);
    if (L.skip) continue;
    const spitzenNr = new Set(punkt ? [] : P.spitzenIndizes(q));
    const dauer = punkt ? 220 : P.schreibDauer(P.weg(q), tempo);
    const je = dauer / Math.max(1, q.length);
    /** Zeit, zu der Punkt i erreicht ist (Halt an Spitzen eingerechnet). */
    const zeiten = [0];
    for (let i = 1; i < q.length; i++) zeiten.push(zeiten[i - 1] + je + (spitzenNr.has(i - 1) ? hold / tempo : 0));
    const gesamt = zeiten[zeiten.length - 1];
    await new Promise((fertig) => {
      const t0 = performance.now();
      let nr = 0;
      const a = {
        tick(t) {
          const vergangen = t - t0;
          while (nr < q.length && zeiten[nr] <= vergangen) {
            const p = px(z, q[nr]);
            if (spitzenNr.has(nr)) { streue(p.x, p.y, 9, 1.1, 1); klang.spitze(nr); } else if (nr % 3 === 0) streue(p.x, p.y, 1, 0.5);
            nr++;
          }
          spur.teil = Math.max(1, nr);
          if (vergangen >= gesamt + 20) ende();
        },
      };
      const ende = () => {
        animierte.delete(a);
        L.uhren.delete(ende);
        spur.teil = q.length;
        fertig(undefined);
      };
      animierte.add(a);
      L.uhren.add(ende);
      an();
    });
    if (punkt && !L.skip) {
      const p = px(z, q[0]);
      streue(p.x, p.y, 4, 0.7, 1);
      await warte(120);
    } else if (!L.skip) await warte(160);
  }
  if (bleibt === "blass") {
    for (const s of gemacht) s.alpha = 0.55;
    an();
  } else if (bleibt === "weg") {
    await warte(300);
    await verglimme(L, gemacht, 1000);
  }
  return gemacht;
}

/** Spuren in `ms` ausblenden und entfernen. @param {Lauf} L @param {Spur[]} liste @param {number} ms */
function verglimme(L, liste, ms) {
  if (L.skip || !liste.length) {
    entferneSpuren((s) => liste.includes(s));
    return Promise.resolve();
  }
  return new Promise((fertig) => {
    const t0 = performance.now();
    const a1 = liste.map((s) => s.alpha);
    const a = {
      tick(t) {
        const u = Math.min(1, (t - t0) / ms);
        liste.forEach((s, i) => { s.alpha = a1[i] * (1 - u); });
        if (u >= 1) ende();
      },
    };
    const ende = () => {
      animierte.delete(a);
      L.uhren.delete(ende);
      entferneSpuren((s) => liste.includes(s));
      fertig(undefined);
    };
    animierte.add(a);
    L.uhren.add(ende);
    an();
  });
}

/** Die Wege eines Wortes aus der Vorlage: erst die Züge, dann die Punkte. @param {import("./logik.js").Wort} ref */
const wegeDes = (ref) => ({ wege: ref.striche, luft: ref.luft });

/** @param {string} text @returns {string} SVG-Bild eines Leuchtwortes (Pause) */
function fotoSvg(text) {
  try {
    const w = vorlagenWort(SATZ ?? "sas", text);
    const b = { x0: -30, y0: 20, b: w.breite + 60, h: 270 };
    const pfad = w.striche.map((s) => `M${s.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L")}`).join(" ");
    return `<svg viewBox="${b.x0} ${b.y0} ${b.b} ${b.h}" aria-hidden="true"><g fill="none" stroke-linecap="round" stroke-linejoin="round">`
      + `<path d="${pfad}" stroke="#FFB347" stroke-width="18" opacity="0.3"/><path d="${pfad}" stroke="#FFF3C4" stroke-width="7"/></g></svg>`;
  } catch {
    return "";
  }
}

// --- Foto: gemalt auf einen kleinen Canvas, hängt an einer Klammer --------------------------------------------
/** Ein Foto der Spuren (Einheiten). @param {{ x: number, y: number }[][]} striche @param {{ x: number, y: number } | null} ring */
function machFoto(striche, ring) {
  const el = document.createElement("div");
  el.className = "foto";
  el.innerHTML = `<div class="klammer"></div><div class="rahmen"><canvas width="420" height="316"></canvas></div>`;
  const c = /** @type {HTMLCanvasElement} */ (el.querySelector("canvas"));
  const g = /** @type {CanvasRenderingContext2D} */ (c.getContext("2d"));
  const alle = striche.flat();
  g.fillStyle = "#121E4B";
  g.fillRect(0, 0, c.width, c.height);
  if (alle.length) {
    const xs = alle.map((p) => p.x);
    const ys = alle.map((p) => p.y);
    const rand = 46;
    const bx = Math.min(...xs) - rand;
    const by = Math.min(Math.min(...ys), 100) - rand;
    const bb = Math.max(...xs) - Math.min(...xs) + 2 * rand;
    const bh = Math.max(Math.max(...ys), 200) - Math.min(Math.min(...ys), 100) + 2 * rand;
    const sk = Math.min(c.width / bb, c.height / bh);
    const ox = (c.width - bb * sk) / 2 - bx * sk;
    const oy = (c.height - bh * sk) / 2 - by * sk;
    const um = (/** @type {{ x: number, y: number }} */ p) => ({ x: ox + p.x * sk, y: oy + p.y * sk });
    g.lineCap = "round";
    g.lineJoin = "round";
    const f = FARBEN.kind;
    for (const [breite, a, farbe, modus] of /** @type {[number, number, string, GlobalCompositeOperation][]} */ ([
      [34, 0.1, f.glanz, "lighter"], [20, 0.2, f.glanz, "lighter"], [12, 0.45, f.glanz, "lighter"], [6.5, 0.95, f.kern, "source-over"]])) {
      g.globalCompositeOperation = modus;
      g.strokeStyle = `rgba(${farbe}, ${a})`;
      g.lineWidth = breite * sk * 0.75;
      for (const s of striche) {
        if (!s.length) continue;
        g.beginPath();
        const p0 = um(s[0]);
        g.moveTo(p0.x, p0.y);
        if (s.length === 1) g.lineTo(p0.x + 0.1, p0.y);
        for (const p of s.slice(1)) g.lineTo(um(p).x, um(p).y);
        g.stroke();
      }
    }
    g.globalCompositeOperation = "source-over";
    if (ring) {
      const r = um(ring);
      g.beginPath();
      g.arc(r.x, r.y, 34 * sk + 10, 0, Math.PI * 2);
      g.lineWidth = 7;
      g.strokeStyle = "#FFD95A";
      g.stroke();
    }
  }
  spielflaeche.append(el);
  return el;
}

/** Mittelpunkt und Größe eines Elements in Bildpunkten der Spielfläche. @param {Element} el */
function rechteck(el) {
  const s = spielflaeche.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  return { l: r.left - s.left, t: r.top - s.top, w: r.width, h: r.height };
}
/** Transform eines Fotos: obere Mitte bei (x, y). @param {number} x @param {number} y @param {number} [skala] @param {number} [grad] @param {HTMLElement} el */
const fotoTransform = (el, x, y, skala = 1, grad = 0) => `translate(${(x - el.offsetWidth / 2).toFixed(1)}px, ${y.toFixed(1)}px) rotate(${grad}deg) scale(${skala})`;

/** Fotos an der Leine, in der Reihenfolge, wie sie hingen. @type {HTMLElement[]} */
let leineFotos = [];
let leineNr = 0;
/** Das Foto, das noch bei der Kamera liegt (nach einem Fehlversuch). @type {HTMLElement | null} */
let liegtFoto = null;

/** Platz an der Leine: obere Mitte des Fotos in Bildpunkten der Spielfläche. @param {number} nr */
function leinePlatz(nr) {
  const l = rechteck($("leine"));
  const u = 0.045 + 0.91 * (((nr % LEINE_PLAETZE) + 0.5) / LEINE_PLAETZE);
  const seilY = (1.5 + 14 * u * (1 - u)) / 10 * l.h;
  return { x: l.l + u * l.w, y: l.t + seilY - 1.5 * remPx() };
}
/** Hängt ein Foto ohne Flug an seinen Platz. @param {HTMLElement} el @param {number} nr */
function haengeAn(el, nr) {
  const p = leinePlatz(nr);
  el.style.transform = fotoTransform(el, p.x, p.y, 1, ((nr * 7) % 5) - 2);
}
function raeumeLeine() {
  for (const f of leineFotos) f.remove();
  leineFotos = [];
  leineNr = 0;
  entferneLiegt();
}
function entferneLiegt() {
  liegtFoto?.remove();
  liegtFoto = null;
}

/** Die Fläche, auf der das Wort steht (Mitte oben, Breite, Höhe in Bildpunkten der Spielfläche). @param {{ x: number, y: number }[]} pts Einheiten der Kinderzeile */
function wortFlaeche(pts) {
  const c = rechteck(cv);
  if (!pts.length) return { x: c.l + c.w / 2, y: c.t + G.yK, b: c.w / 3 };
  const xs = pts.map((p) => px("k", p).x);
  const ys = pts.map((p) => px("k", p).y);
  return { x: c.l + (Math.min(...xs) + Math.max(...xs)) / 2, y: c.t + Math.min(...ys, G.yK + 100 * G.s), b: Math.max(...xs) - Math.min(...xs) };
}

/** Der Blitz der Kamera: die Fläche leuchtet kurz auf, die Kamera federt. @param {Lauf} L @param {number} [stark] */
async function klickUndBlitz(L, stark = 0.85) {
  const { bewege } = mit(L);
  klang.klick();
  const lampe = kamera.querySelector(".blitzlicht");
  if (!L.skip) {
    if (lampe) /** @type {SVGElement} */ (lampe).animate?.([{ opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 0 }], { duration: 380 });
    kamera.animate?.([{ transform: "scale(1)" }, { transform: "scale(1.06, 0.95)", offset: 0.25 }, { transform: "scale(0.99, 1.02)", offset: 0.6 }, { transform: "scale(1)" }], { duration: 360 });
  }
  await bewege(blitz, [{ opacity: 0 }, { opacity: stark, offset: 0.18 }, { opacity: 0 }], 300, { opacity: "0" }, { easing: "ease-out" });
}

/** Das Leuchtwort wird zum Foto und fliegt an die Leine (die Wirkung einer richtigen Antwort). @param {Lauf} L @param {{ x: number, y: number }[][]} striche */
async function fotoAnDieLeine(L, striche) {
  const { warte } = mit(L);
  const nr = leineNr++;
  const alle = striche.flat();
  const von = wortFlaeche(alle);
  const variante = nr % 7 === 3 ? "hoch" : "gerade";
  if (!L.skip && nr % 4 === 2) {
    // selten: eine Funkenfontäne aus der Wunderkerze, bevor die Kamera auslöst
    const letzte = striche.at(-1)?.at(-1);
    if (letzte) { const p = px("k", letzte); streue(p.x, p.y, 36, 1.8, 1); klang.zisch(); }
    await warte(420);
  }
  const foto = machFoto(striche, null);
  foto.style.transform = fotoTransform(foto, von.x, von.y, 0.01);
  foto.style.opacity = "0";
  const platz = leinePlatz(nr);
  // Wer schon an diesem Platz hängt (die Leine ist voll), macht Platz.
  const alt = leineFotos.find((f) => f.dataset.platz === String(nr % LEINE_PLAETZE));
  if (alt) { alt.remove(); leineFotos = leineFotos.filter((f) => f !== alt); }
  foto.dataset.platz = String(nr % LEINE_PLAETZE);
  leineFotos.push(foto);
  await klickUndBlitz(L);
  entferneSpuren((s) => s.art === "kind");
  elaBewegung(nr % 7 === 5 ? "doppelblick" : "nicken");
  if (L.skip || wenigBewegung() || typeof foto.animate !== "function") {
    foto.style.opacity = "1";
    haengeAn(foto, nr);
    return;
  }
  const { bewege } = mit(L);
  const sk = Math.max(1.2, Math.min(5, (von.b + 6 * remPx()) / foto.offsetWidth));
  const start = fotoTransform(foto, von.x, von.y, sk, 0);
  const oben = fotoTransform(foto, von.x, von.y - 6 * remPx(), sk * 0.9, -3);
  const mitte = fotoTransform(foto, (von.x + platz.x) / 2, Math.min(von.y, platz.y) + 4 * remPx(), 0.55, 6);
  const ziel = fotoTransform(foto, platz.x, platz.y, 1, ((nr * 7) % 5) - 2);
  foto.style.opacity = "1";
  if (variante === "hoch") {
    // Ela hält das Foto kurz hoch (zum Kind), dann kommt es an die Leine.
    await bewege(foto, [{ transform: start }, { transform: oben }], 380, { transform: oben }, { easing: "ease-out" });
    await warte(480);
    await bewege(foto, [{ transform: oben }, { transform: mitte, offset: 0.55 }, { transform: ziel }], 640, { transform: ziel }, { easing: "ease-in-out" });
  } else {
    await bewege(foto, [{ transform: start }, { transform: mitte, offset: 0.5 }, { transform: ziel }], 760, { transform: ziel }, { easing: "cubic-bezier(.25,.6,.35,1)" });
  }
  klang.plopp();
  // Pendel: die Klammer fängt das Foto, es schwingt aus.
  const g0 = ((nr * 7) % 5) - 2;
  await bewege(foto, [
    { transform: ziel }, { transform: fotoTransform(foto, platz.x, platz.y, 1, g0 + 9) }, { transform: fotoTransform(foto, platz.x, platz.y, 1, g0 - 5), offset: 0.55 },
    { transform: fotoTransform(foto, platz.x, platz.y, 1, g0 + 2), offset: 0.8 }, { transform: ziel }], 640, { transform: ziel }, { easing: "ease-out" });
}

// =====================================================================================================
// EINGABE: Freihand-Strich mit Aufzeichnung
// =====================================================================================================

/** @typedef {{ x: number, y: number, t: number }} Probe */
const eingabe = {
  offen: false,
  /** @type {number | null} */ aktiv: null,
  /** @type {{ punkte: Probe[], spur: Spur } | null} */ strich: null,
  /** @type {{ punkte: Probe[], spur: Spur }[]} */ striche: [],
  uhr: 0,
  stift: 0,
  letztePing: 0,
  pingNr: 0,
  /** Wird am Ende eines Versuchs (Stift 0,8 s oben) mit den Strichen in Einheiten gerufen. @type {((striche: Probe[][]) => void) | null} */ beiVersuch: null,
  /** @type {(() => void)[]} */ bewertet: [],
};

/** Tupfer und andere Spuren der Kinderzeile entfernen (die Hilfe-Spur bleibt). */
const leereKind = () => entferneSpuren((s) => s.art === "kind");

/** Die Grenze zwischen Elas Zeile und der Kinderzeile (Bildpunkte im Canvas). */
const grenzeY = () => G.yK - 22 * G.s;

/** @param {PointerEvent} e */
function lokal(e) {
  const r = cv.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}

cv.addEventListener("pointerdown", (e) => {
  if (!eingabe.offen) return;
  const jetzt = performance.now();
  if (e.pointerType === "pen") eingabe.stift = jetzt;
  else if (e.pointerType === "touch" && jetzt - eingabe.stift < 1500) return; // Handballen neben dem Stift
  if (eingabe.aktiv !== null) return;
  const p = lokal(e);
  if (p.y < grenzeY()) {
    // Elas Zeile gehört Ela: die Stelle wackelt, der Ring zeigt, wo geschrieben wird.
    matte.classList.remove("wackelt");
    void matte.offsetWidth;
    matte.classList.add("wackelt");
    gluehen.push({ z: "k", x: 40, y: 150, von: jetzt, bis: jetzt + 700 });
    an();
    return;
  }
  e.preventDefault();
  clearTimeout(eingabe.uhr);
  if (!eingabe.striche.length) {
    neuerLauf();
    leereKind();
    entferneLiegt();
    $("startring").hidden = !hilfeRing;
  }
  eingabe.aktiv = e.pointerId;
  try { cv.setPointerCapture(e.pointerId); } catch { /* synthetisch */ }
  const spur = neueSpur("k", "kind", [], 0);
  eingabe.strich = { punkte: [], spur };
  eingabe.striche.push(eingabe.strich);
  schreibtGerade = true;
  knistern.an();
  nimmPunkt(e);
});

/** @param {PointerEvent} e */
function nimmPunkt(e) {
  const st = eingabe.strich;
  if (!st) return;
  const l = lokal(e);
  const u = einh(l.x, l.y);
  const vor = st.punkte.at(-1);
  if (vor && Math.hypot(u.x - vor.x, u.y - vor.y) * G.s < 1.1) return;
  st.punkte.push({ x: u.x, y: u.y, t: performance.now() });
  st.spur.pts = st.punkte;
  st.spur.teil = st.punkte.length;
  streue(l.x, l.y, vor ? 2 : 6, 0.55);
  // Spitze: die Richtung ändert sich scharf, dann sprüht es heller und es klingt ein Ton.
  const n = st.punkte.length;
  if (n > 8) {
    const a = st.punkte[n - 1];
    const b = st.punkte[n - 5];
    const c = st.punkte[n - 9];
    const w1 = Math.atan2(b.y - c.y, b.x - c.x);
    const w2 = Math.atan2(a.y - b.y, a.x - b.x);
    let d = Math.abs(w2 - w1);
    if (d > Math.PI) d = 2 * Math.PI - d;
    if (d > 1.5 && performance.now() - eingabe.letztePing > 160) {
      eingabe.letztePing = performance.now();
      streue(l.x, l.y, 10, 1.1, 1);
      klang.spitze(eingabe.pingNr++);
    }
  }
  an();
}

cv.addEventListener("pointermove", (e) => {
  if (e.pointerId !== eingabe.aktiv) return;
  const evs = typeof e.getCoalescedEvents === "function" ? e.getCoalescedEvents() : [];
  for (const ev of evs.length ? evs : [e]) nimmPunkt(ev);
});

/** @param {PointerEvent} e */
function stiftHoch(e) {
  if (e.pointerId !== eingabe.aktiv) return;
  eingabe.aktiv = null;
  schreibtGerade = false;
  knistern.aus();
  eingabe.strich = null;
  try { cv.releasePointerCapture(e.pointerId); } catch { /* schon frei */ }
  clearTimeout(eingabe.uhr);
  eingabe.uhr = window.setTimeout(abgehoben, P.ABHEBEN_MS);
  an();
}
cv.addEventListener("pointerup", stiftHoch);
cv.addEventListener("pointercancel", stiftHoch);

/** Der Stift war 0,8 s oben: der Versuch ist zu Ende. */
function abgehoben() {
  const striche = eingabe.striche.map((s) => s.punkte.map((p) => ({ ...p })));
  eingabe.striche = [];
  const gesamt = striche.reduce((s, p) => s + P.weg(p), 0);
  if (!striche.length || gesamt < MIN_WEG) {
    // ein Tupfer: er sprüht kurz und verglimmt, kein Versuch
    const L = neuerLauf();
    const spuren2 = spuren.filter((s) => s.art === "kind");
    void verglimme(L, spuren2, 450);
    meldeBewertet();
    return;
  }
  eingabe.beiVersuch?.(striche);
}
function meldeBewertet() {
  for (const f of eingabe.bewertet.splice(0)) f();
}

/**
 * Der Prüfstand schreibt: als Folge ausgelöster Zeiger-Ereignisse am Canvas (wie ein Stift), dann wartet er, bis der
 * Versuch bewertet ist.
 * @param {"richtig" | "luecke" | "start"} wie
 */
async function schreibeSimuliert(wie) {
  const a = B.aufgabe;
  if (!a) return;
  const r = cv.getBoundingClientRect();
  const nachClient = (/** @type {{ x: number, y: number }} */ p) => { const q = px("k", p); return { x: r.left + q.x, y: r.top + q.y }; };
  const zug = a.ref.striche.filter((_, i) => !a.ref.luft[i]);
  const punkte = a.ref.striche.filter((_, i) => a.ref.luft[i]);
  /** @type {{ x: number, y: number }[][]} */
  let wege;
  if (wie === "richtig") wege = [...zug, ...punkte];
  else if (wie === "start") wege = [[...zug[0]].reverse()];
  else {
    const z = zug[0];
    const h = Math.floor(z.length / 2);
    wege = [z.slice(0, h - 3), z.slice(h + 3)];
  }
  const warte = (/** @type {number} */ ms) => new Promise((ok) => setTimeout(ok, ms));
  const id = 71 + Math.floor(Math.random() * 20);
  const ereignis = (/** @type {string} */ typ, /** @type {{ x: number, y: number }} */ c) => cv.dispatchEvent(new PointerEvent(typ, {
    bubbles: true, cancelable: true, clientX: c.x, clientY: c.y, pointerId: id, pointerType: "mouse", isPrimary: true, buttons: typ === "pointerup" ? 0 : 1,
  }));
  for (const [k, weg] of wege.entries()) {
    const q = weg.length > 1 ? weg : [weg[0], { x: weg[0].x + 3, y: weg[0].y + 3 }];
    ereignis("pointerdown", nachClient(q[0]));
    for (let i = 1; i < q.length; i++) {
      ereignis("pointermove", nachClient(q[i]));
      if (i % 6 === 0) await warte(3);
    }
    ereignis("pointerup", nachClient(q[q.length - 1]));
    if (k < wege.length - 1) await warte(120);
  }
  await Promise.race([new Promise((ok) => eingabe.bewertet.push(() => ok(undefined))), warte(P.ABHEBEN_MS + 2500)]);
}

// =====================================================================================================
// AUFGABE
// =====================================================================================================

/** Welche Schrift gilt (SAS oder VA); erst nach den Einstellungen bekannt. @type {string | null} */
let SATZ = null;

/** Was gerade dran ist. */
const B = {
  /** @type {null | { text: string, ref: import("./logik.js").Wort, formen: import("./logik.js").FormTeil[], stufe: string }} */ aufgabe: null,
  /** Das Ergebnis des letzten Fehlversuchs. @type {import("./logik.js").Urteil | null} */ letzter: null,
  /** @type {string | null} */ letzteStufe: null,
};
/** Zeigt der Startring gerade die Lösung (Hilfe 2, Einführung)? */
let hilfeRing = false;

const schild = $("schild");
const kerze = $("kerze");

/** Der Startring im Sonnenring an einer Stelle der Kinderzeile; ohne Stelle weg. @param {{ x: number, y: number } | null} u */
function setzeStartring(u) {
  const ring = $("startring");
  hilfeRing = !!u;
  if (!u) {
    ring.hidden = true;
    ring.classList.remove("markiert");
    return;
  }
  const p = px("k", u);
  ring.style.left = `${p.x}px`;
  ring.style.top = `${p.y}px`;
  ring.hidden = false;
  ring.classList.add("markiert");
}

/** Räumt die Zeilen und das Foto bei der Kamera für die nächste Aufgabe (die Leine bleibt, nichts zurück). */
function raeumeAuf() {
  entferneSpuren((s) => true);
  gluehen = [];
  blinkLinie = null;
  setzeStartring(null);
  entferneLiegt();
  eingabe.striche = [];
  eingabe.strich = null;
  clearTimeout(eingabe.uhr);
}

/** Ela zeigt ihre Spur noch einmal (Stufe vorstellung: Tipp auf Ela). @param {Lauf} L */
async function vorzeigen(L, stufe = B.aufgabe?.stufe ?? "material") {
  const a = B.aufgabe;
  if (!a || stufe === "kopf") return;
  entferneSpuren((s) => s.art === "ela");
  elaHaltung("zeigen", 200);
  const { wege, luft } = wegeDes(a.ref);
  await elaSchreibt(L, wege, luft, { bleibt: stufe === "material" ? "blass" : "weg" });
  elaHaltung("stehen", 300);
}

/**
 * Szene beim Wechsel der Stufe (Regeln §8): Ela steckt die Wunderkerze in den Sand bzw. hängt das Holzschild an.
 * @param {Lauf} L @param {string} von @param {string} nach
 */
async function szeneWechsel(L, von, nach) {
  const { bewege, warte } = mit(L);
  const rang = { material: 0, vorstellung: 1, kopf: 2 };
  const auf = rang[/** @type {"material"} */ (nach)] > rang[/** @type {"material"} */ (von)];
  if (auf && nach === "vorstellung") {
    elaHaltung("zeigen", 200);
    const satz = erzaehler.wechselVorstellung();
    kerze.classList.add("sand");
    await Promise.all([satz, warte(900)]);
    elaHaltung("stehen", 260);
  } else if (auf) {
    const satz = erzaehler.wechselKopf();
    schild.hidden = false;
    await bewege(schild, [{ transform: "translateY(-14rem)", opacity: 0 }, { transform: "translateY(1.2rem)", opacity: 1, offset: 0.7 }, { transform: "translateY(0)", opacity: 1 }], 700, { transform: "none", opacity: "1" }, { easing: "ease-in" });
    kerze.hidden = true;
    await Promise.all([satz, warte(400)]);
  } else {
    // zurück: still, ohne Satz
    if (nach !== "kopf") {
      await bewege(schild, [{ opacity: 1 }, { opacity: 0 }], 300, { opacity: "0" });
      schild.hidden = true;
      kerze.hidden = false;
      kerze.classList.toggle("sand", nach === "vorstellung");
    }
  }
}

/**
 * Stellt eine Aufgabe: Ela schreibt vor (je nach Stufe), das Kind schreibt in die untere Zeile.
 * @param {{ ziel: { key: string }, stufe?: string }} aufgabe
 * @param {{ passtNicht: () => void, geloest: (key: string) => void }} melde
 * @param {{ ohneSatz?: boolean, ohneVorzeigen?: boolean }} [o]
 */
function stelleAufgabe(aufgabe, melde, o = {}) {
  const a = schreibAus(aufgabe.ziel.key);
  if (!a) throw new Error(`Leuchtschrift: unbekannte Aufgabe ${aufgabe.ziel.key}`);
  const stufe = ["material", "vorstellung", "kopf"].includes(aufgabe.stufe ?? "") ? /** @type {string} */ (aufgabe.stufe) : "material";
  if (!SATZ || !hatSatz(SATZ)) throw new Error(`Leuchtschrift: keine Vorlagen für die Schrift „${SATZ}“`);
  const satz = SATZ;
  const ref = vorlagenWort(satz, a.wort);
  const formen = [...a.wort.normalize("NFC")].map((c) => vorlagenForm(satz, c));
  const L = neuerLauf();
  raeumeAuf();
  messen(ref.breite);
  B.aufgabe = { text: a.wort, ref, formen, stufe };
  B.letzter = null;
  schild.querySelector("span").textContent = a.wort;
  if (!o.ohneSatz) erzaehler.wort(a.wort);

  const wechsel = B.letzteStufe !== null && B.letzteStufe !== stufe && !o.ohneVorzeigen ? [B.letzteStufe, stufe] : null;
  if (B.letzteStufe === null) {
    // erste Aufgabe: der Zustand der Stufe ohne Szene
    schild.hidden = stufe !== "kopf";
    kerze.hidden = stufe === "kopf";
    kerze.classList.toggle("sand", stufe === "vorstellung");
  }
  B.letzteStufe = stufe;
  elaTippen = stufe === "vorstellung" ? () => { if (eingabe.offen && !hilfeRing) vorzeigen(neuerLauf()); } : null;

  eingabe.offen = true;
  let geschlossen = false;
  /** Die Hilfe 2 hat die Lösung gezeigt. */
  let loesungGezeigt = false;

  (async () => {
    if (wechsel) await szeneWechsel(L, wechsel[0], wechsel[1]);
    if (!o.ohneVorzeigen) await vorzeigen(L, stufe);
  })().catch((e) => protokoll(`${SPIEL_ID}: Vorzeigen: ${e?.message ?? e}`));

  const beiVersuch = async (/** @type {{ x: number, y: number, t: number }[][]} */ striche) => {
    if (geschlossen) return;
    const punkteEinheiten = striche.map((s) => s.map((p) => ({ x: p.x, y: p.y })));
    const urteil = P.pruefe(ref, formen, striche.map((punkte) => ({ punkte })));
    meldeBewertet();
    if (urteil.ok) {
      geschlossen = true;
      eingabe.offen = false;
      const R = neuerLauf();
      setzeStartring(null);
      const wirkung = fotoAnDieLeine(R, punkteEinheiten).catch((e) => protokoll(`${SPIEL_ID}: Foto: ${e?.message ?? e}`));
      folgeWirkung = wirkung;
      melde.geloest(aufgabe.ziel.key);
      return;
    }
    if (urteil.befund === "leer") return;
    B.letzter = urteil;
    melde.passtNicht();
    daneben(urteil, punkteEinheiten).catch((e) => protokoll(`${SPIEL_ID}: Daneben: ${e?.message ?? e}`));
  };
  eingabe.beiVersuch = beiVersuch;

  /** Das Foto des Versuchs bleibt bei der Kamera liegen; dann erklärt Elas Zeile, was abwich. @param {import("./logik.js").Urteil} u @param {{ x: number, y: number }[][]} striche */
  async function daneben(u, striche) {
    if (u.ok) return;
    const R = neuerLauf();
    const { warte, bewege } = mit(R);
    const luecke = u.befund === "luecke";
    // Klick; das Foto bleibt bei der Kamera liegen (Lücke: mit Ring an der Naht).
    const foto = machFoto(striche, luecke ? u.stelle : null);
    foto.style.opacity = "0";
    entferneLiegt();
    liegtFoto = foto;
    const k = rechteck(kamera);
    const x = k.l + k.w * 0.5;
    const y = k.t + k.h * 0.5;
    foto.style.transform = fotoTransform(foto, x, y, 0.01);
    await klickUndBlitz(R, 0.5);
    foto.style.opacity = "1";
    if (luecke) klang.pff();
    const ziel = fotoTransform(foto, x, y + 1.4 * remPx(), 0.9, 7);
    await bewege(foto, [{ transform: fotoTransform(foto, x, y, 0.2, 0) }, { transform: ziel }], 420, { transform: ziel }, { easing: "cubic-bezier(.3,.7,.3,1)" });
    elaHaltung("fragen", 240);
    const satz = u.befund === "luecke" ? erzaehler.luecke() : u.befund === "start" ? erzaehler.start() : u.befund === "richtung" ? erzaehler.richtung() : erzaehler.band();
    if (u.befund === "luecke" && u.stelle) {
      // der Ring liegt schon auf dem Foto; in der Zeile glüht die Stelle
      gluehen.push({ z: "k", x: u.stelle.x, y: u.stelle.y, von: performance.now(), bis: performance.now() + 1400 });
      an();
    } else if (u.befund === "band" && u.stelle) {
      gluehen.push({ z: "k", x: u.stelle.x, y: u.stelle.y, von: performance.now(), bis: performance.now() + 1500 });
      const ueber = u.stelle.y < 100 ? (u.stelle.y < 50 ? 0 : 100) : 200;
      blinkLinie = { z: "k", y: ueber, von: performance.now(), bis: performance.now() + 1100 };
      an();
    } else if (u.stelle) {
      // Ela schreibt nur diesen Buchstaben ganz langsam nach; ein Funke zeigt Anfang und Richtung
      const stueck = P.buchstabenStueck(ref, formen, u.buchstabe);
      void elaSchreibt(R, [stueck], [], { tempo: 0.5, bleibt: "weg", hold: 0, art: "stueck" });
    }
    await satz;
    await warte(300);
    await erzaehler.nochmal();
    erzaehler.zug(a.wort);
    elaHaltung("stehen", 300);
    await warte(150);
    if (R.skip) return;
    // Die Zeile wird für den neuen Zug frei; das Foto bleibt bei der Kamera.
    const kind = spuren.filter((s) => s.art === "kind");
    await verglimme(R, kind, 380);
  }

  /** Hilfe 1: Ela schreibt die Stelle, an der es hakte, sehr langsam vor. Hilfe 2: ihre ganze Spur liegt in der Zeile. @param {1 | 2} stufeNr */
  const hilfeZeigen = (stufeNr) => {
    const R = neuerLauf();
    if (stufeNr === 1) {
      entferneSpuren((s) => s.art === "ela" || s.art === "stueck");
      elaHaltung("zeigen", 200);
      erzaehler.probe();
      const u = B.letzter;
      const teile = u && !u.ok ? [P.buchstabenStueck(ref, formen, u.buchstabe)] : ref.striche.filter((_, i) => !ref.luft[i]);
      void elaSchreibt(R, teile, [], { tempo: 0.5, bleibt: "weg", hold: 400, art: "stueck" }).then(() => elaHaltung("stehen", 300));
      return;
    }
    loesungGezeigt = true;
    entferneSpuren((s) => s.art === "hilfe");
    const haupt = ref.striche.filter((_, i) => !ref.luft[i]).flat();
    neueSpur("k", "hilfe", P.abtasten(haupt, 5), 99999, { alpha: 0.5 });
    setzeStartring(haupt[0]);
    erzaehler.loesung();
  };

  return {
    /** @param {1 | 2} stufeNr */
    hilfe: (stufeNr) => hilfeZeigen(stufeNr),
    // Prüfstand: drei mögliche Züge (richtig, mit Lücke, am Ende anfangen); richtig ist die Spur der Vorlage in einem Zug.
    zuege() {
      if (geschlossen) return [];
      return [
        { art: "schreiben", wie: "richtig", von: "#startring" },
        { art: "schreiben", wie: "luecke", von: "#zeichen" },
        { art: "schreiben", wie: "start", von: "#zeichen" },
      ];
    },
    richtigerZug() {
      return geschlossen ? null : { art: "schreiben", wie: "richtig", von: "#startring" };
    },
    /** Nach der Anleitung steht dieselbe Aufgabe wieder da. */
    neuStellen() {
      if (geschlossen) return;
      const L2 = neuerLauf();
      raeumeAuf();
      messen(ref.breite);
      B.aufgabe = { text: a.wort, ref, formen, stufe };
      schild.hidden = stufe !== "kopf";
      kerze.hidden = stufe === "kopf";
      kerze.classList.toggle("sand", stufe === "vorstellung");
      eingabe.offen = true;
      eingabe.beiVersuch = beiVersuch;
      elaTippen = stufe === "vorstellung" ? () => { if (eingabe.offen && !hilfeRing) vorzeigen(neuerLauf()); } : null;
      void vorzeigen(L2, stufe);
    },
    abbau() {
      geschlossen = true;
      eingabe.offen = false;
      eingabe.beiVersuch = null;
      elaTippen = null;
      void loesungGezeigt;
    },
  };
}

/** Das Ende der Wirkung nach einer Lösung (Foto hängt an der Leine); die Folge wartet darauf. @type {Promise<any>} */
let folgeWirkung = Promise.resolve();

// =====================================================================================================
// EINFÜHRUNG im echten Spielbild (docs/spielbau.md §8, Idee §6)
// =====================================================================================================

/** Die Einführung: Sätze, Hilfe und Zug für den Prüfstand (rahmen/einfuehrung-lauf.js). */
const stand = { phase: "laden", aufgabe: /** @type {string | null} */ (null), nr: 0, versuche: 0, hilfeStufe: 0, vorschau: true, lernstufe: /** @type {string | null} */ (null) };
const E = einfuehrungsLauf({ ton: () => leiste.ton, text: () => blase.text, stand });
// Ohne Ton kürzt nur ein Tipp des Kindes die Lesezeit ab, nie die Einstellung (spielbau.md §8). Hilfe, Pause und
// Leiste nicht – die Hilfe sagt den Schritt noch einmal. Das Schreiben selbst (Canvas) kürzt nichts ab.
E.verbindeTippen(document, { ausser: [hilfe, pause, leiste, cv] });

/** @param {HTMLElement | null | undefined} el */
const ringUm = (el) => el?.classList.add("markiert");
const ringWeg = () => document.querySelectorAll(".ela.markiert, .kamera.markiert").forEach((e) => e.classList.remove("markiert"));

/**
 * Die Einführung im echten Spielbild. Mit `r` gilt sie danach als gesehen, und die Rundenzeit beginnt.
 * @param {{ einfuehrungGesehen(): void, beginneZeit(): void }} [r]
 */
function einfuehrung(r) {
  const satz = E.satz;
  return E.spiele(async () => {
    /** @type {ReturnType<typeof stelleAufgabe> | null} */
    let du = null;
    try {
      raeumeLeine();
      neuerLauf();
      B.letzteStufe = null;
      schild.hidden = true;
      kerze.hidden = false;
      kerze.classList.remove("sand");
      // Das Kind sieht zuerst das leere Bild: der Himmel, Ela, die Zeilen.
      const vorlage = stelleAufgabe({ ziel: { key: "schreib:ui" }, stufe: "material" }, { passtNicht() {}, geloest() {} }, { ohneSatz: true, ohneVorzeigen: true });
      eingabe.offen = false;
      entferneSpuren(() => true);
      await satz(einleitung.dunkel);
      ringUm($("ela"));
      await satz(einleitung.kerze);
      // Ela schreibt ui; der Satz läuft währenddessen.
      const L = neuerLauf();
      elaHaltung("zeigen", 200);
      const a = B.aufgabe;
      if (a) {
        const { wege, luft } = wegeDes(a.ref);
        const schreibt = elaSchreibt(L, wege, luft, { bleibt: "blass", tempo: 0.9 });
        await satz(einleitung.schreibt);
        await satz(einleitung.nichtAb);
        await schreibt;
      }
      ringWeg();
      elaHaltung("stehen", 300);
      ringUm(kamera);
      const ela1 = a ? a.ref.striche.map((s) => s.map((p) => ({ x: p.x, y: p.y }))) : [];
      const saetze = satz(einleitung.foto);
      await mit(L).warte(500);
      // Elas Foto: die Kamera klickt, das Wort hängt an der Leine (als Beispiel; es bleibt nicht).
      const fertigFoto = fotoDerVorlage(L, ela1);
      await Promise.all([saetze, fertigFoto]);
      ringWeg();
      vorlage.abbau();
      // Jetzt du.
      /** @type {() => void} */
      let getan = () => {};
      const gelegt = new Promise((ok) => { getan = () => ok(undefined); });
      du = stelleAufgabe({ ziel: { key: "schreib:ui" }, stufe: "material" }, { passtNicht() {}, geloest: () => getan() }, { ohneSatz: true, ohneVorzeigen: true });
      entferneSpuren(() => true);
      const start = B.aufgabe?.ref.striche.filter((_, i) => !B.aufgabe?.ref.luft[i])[0]?.[0];
      setzeStartring(start ?? null);
      const kind = E.kind({ art: "schreiben", wie: "richtig", von: "#startring" }, gelegt);
      await satz(einleitung.jetztDu);
      await kind;
      setzeStartring(null);
      await folgeWirkung;
      await satz(einleitung.leine);
      await satz(einleitung.luecke);
      await satz(einleitung.los);
    } finally {
      ueberspringeAlles();
      ringWeg();
      du?.abbau();
      eingabe.offen = false;
      eingabe.beiVersuch = null;
      raeumeAuf();
      raeumeLeine();
      B.aufgabe = null;
      B.letzteStufe = null;
      elaHaltung("stehen", 0);
    }
  }, r);
}

/** Elas Foto in der Einführung: die Kamera klickt, das Foto fliegt kurz an die Leine. @param {Lauf} L @param {{ x: number, y: number }[][]} striche */
async function fotoDerVorlage(L, striche) {
  // Elas Spur steht in ihrer Zeile (Einheiten der oberen Zeile); das Foto zeigt sie gleich.
  const nr = leineNr++;
  const foto = machFoto(striche, null);
  const e = rechteck(cv);
  const von = { x: e.l + e.w / 2, y: e.t + G.yE + 60 * G.s };
  foto.style.opacity = "0";
  foto.style.transform = fotoTransform(foto, von.x, von.y, 0.01);
  foto.dataset.platz = String(nr % LEINE_PLAETZE);
  leineFotos.push(foto);
  await klickUndBlitz(L);
  entferneSpuren((s) => s.art === "ela");
  foto.style.opacity = "1";
  const platz = leinePlatz(nr);
  const ziel = fotoTransform(foto, platz.x, platz.y, 1, -1);
  if (L.skip || wenigBewegung() || typeof foto.animate !== "function") {
    foto.style.transform = ziel;
    return;
  }
  await mit(L).bewege(foto, [{ transform: fotoTransform(foto, von.x, von.y, 2.2, 0) }, { transform: fotoTransform(foto, (von.x + platz.x) / 2, platz.y + 4 * remPx(), 0.6, 5), offset: 0.5 }, { transform: ziel }], 760, { transform: ziel });
  klang.plopp();
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
/** Steht das Spiel in spiele.json? Sonst läuft es als Vorschau. */
const eingetragen = (/** @type {{ spiele: any }} */ c) => c.spiele.spiele.some((/** @type {any} */ s) => s.id === SPIEL_ID);

// --- Prüfstand (rahmen/pruefen.js, nur im Testbetrieb ?pruefen) ------------------------------------
/** @type {{ zuege: () => any[], richtigerZug: () => any, neuStellen?: () => void } | null} */
let offeneAufgabe = null;
const ORTE = { hilfe: "#hilfe >>> ls-knopf", haus: "#leiste >>> a.haus", weiter: "#pause >>> ls-knopf.weiter" };
const WEITER = { art: "tippen", von: ORTE.weiter };
meldePruefSchnittstelle({
  zustand: () => ({ ...stand }),
  zuege: () => (stand.phase === "aufgabe" ? offeneAufgabe?.zuege() ?? [] : stand.phase === "pause" ? [WEITER] : stand.phase === "einfuehrung" ? [E.zug].filter(Boolean) : []),
  richtigerZug: () => (stand.phase === "einfuehrung" ? E.zug : stand.phase === "aufgabe" ? offeneAufgabe?.richtigerZug() ?? null : stand.phase === "pause" ? WEITER : null),
  orte: ORTE,
  /** Eigene Mechanik: der Prüfstand schreibt mit Zeiger-Ereignissen am Canvas. @param {any} zug */
  fuehreAus: async (zug) => {
    if (zug?.art === "schreiben") return schreibeSimuliert(zug.wie);
    if (zug?.art === "tippen") {
      const el = zug.von.includes(">>>") ? null : document.querySelector(zug.von);
      if (el) { /** @type {HTMLElement} */ (el).click(); return; }
    }
    const { fuehreAus } = await import("../../rahmen/pruefen.js");
    return fuehreAus(zug);
  },
});

// --- Hilfe-Leiter (grundsaetze.md L12, bedienung.md 6) ---------------------------------------------
/** @type {(() => void) | null} */
let hilfeTippen = null;
hilfe.addEventListener("hilfe", () => {
  if (E.hilfeGedrueckt()) return;
  hilfeTippen?.();
});

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
// Zwischen zwei Aufgaben kein Weiter-Knopf: die Folge dauert, bis das Foto hängt (längstens FOLGE_MAX_MS); ein Tipp
// irgendwo überspringt sie, dann kommt die nächste Aufgabe.
function warteFolge() {
  return new Promise((ok) => {
    const fertig = () => {
      clearTimeout(uhr);
      document.removeEventListener("pointerdown", fertig, true);
      ok(undefined);
    };
    const uhr = setTimeout(fertig, FOLGE_MAX_MS);
    document.addEventListener("pointerdown", fertig, true);
    folgeWirkung.then(() => setTimeout(fertig, 250), fertig);
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
    a.tabIndex = 0;
    a.innerHTML = `<img src="${esc(new URL(spiel.symbol, new URL("../../", import.meta.url)).href)}" alt=""><span>${esc(spiel.titel)}</span>`;
    karte.append(a);
  }
  stand.phase = "pause";
  eingabe.offen = false;
  await pause.zeige({ ...zeit, echteDinge });
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
  const r = await runde(SPIEL_ID, { wunsch: wunsch(), max: AUFGABEN_JE_RUNDE, ctx: mitSpiel, nurAnsehen: vorschau });
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
  if (!SATZ || !hatSatz(SATZ)) {
    protokoll(`${SPIEL_ID}: keine Schriftvorlagen für „${SATZ}“`);
    stand.phase = "fehler";
    return erzaehler.gehtNicht();
  }

  let aufgabe = aufStufe(r.naechste());
  if (!aufgabe && vorschau) {
    r = vorschauRunde();
    aufgabe = aufStufe(r.naechste());
  }
  leiste.setAttribute("thema", r.thema);

  // Das Spiel beginnt mit der Einführung im echten Spielbild (bei jedem Start; in der Vorschau nur mit ?einfuehrung).
  // Die Rundenzeit beginnt danach (E.spiele ruft r.beginneZeit(), G14).
  if (!einfuehrungGespielt && aufgabe && (!vorschau || params.has("einfuehrung"))) {
    einfuehrungGespielt = true;
    await einfuehrung(r);
  }
  $("anleitung")?.removeAttribute("hidden");
  raeumeLeine();

  while (aufgabe) {
    const e = await spieleAufgabe(aufgabe);
    const ergebnis = { key: e.key, ok: e.versuche === 0, hilfe: e.hilfe, ms: e.ms };
    r.melde(e.key, ergebnis);
    document.dispatchEvent(new CustomEvent("ls-ergebnis", { detail: ergebnis }));
    await warteFolge();
    aufgabe = aufStufe(r.naechste());
  }

  const { hinweisSpiel } = await r.ende();
  await letzterSatz;
  await folgeWirkung;
  await zeigePause({ hinweis: hinweisSpiel, zeit: vorschau ? undefined : await amRundenende(), echteDinge: r.echteDinge });
  return spieleRunde(vorschau);
}

// --- Start ---------------------------------------------------------------------------------------
async function start() {
  await leiste.bereit(); // Ton-Einstellung geladen
  if (params.has("eltern")) return elternansicht();
  await ladeVorlagen();
  SATZ = schriftPfad();
  messen();
  window.addEventListener("resize", () => messen(B.aufgabe?.ref.breite));
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
