// <m37-kreidekette reihe="7" breite="120" pfeile="1 5" verdeckt>
// Kettenhüpfer: die Straße und die mit Kreide darauf gemalte Perlenkette, leicht perspektivisch (Christian,
// 2026-11-15: „wie ein Kreidespiel auf der Straße, Lena hüpft sie ab“). Das Element füllt den ganzen Bildschirm
// (hinter der Bühne) und zeichnet in rem (Bildhöhe 108 rem). Lage: kreide-geometrie.js.
//
// Bedeutung wie das Lernzeichen Perlenkette (spiele/rahmen/perlenkette.js, das unverändert bleibt): zehn Stäbchen zu
// je n Perlen in der Montessori-Farbe von n (Kreide in der Farbe der Perlen), jede Perle einzeln, Fünfermarke nach
// der fünften, zwei Reihen zu fünf. Unter dem Ende eines Stäbchens steht sein Kreide-Kästchen mit der Zahl k · n.
//
// Attribute (Listen: Nummern der Stäbchen 1–10, durch Leerzeichen getrennt):
//   reihe     n (1–10)
//   breite    Breite der Straße in rem (von links; rechts liegt das Ziffernbrett)
//   pfeile    Kästchen mit Zahl an diesen Stäbchen
//   leer      Kästchen ohne Zahl
//   frage     Kästchen mit „?“ (der Ort der Aufgabe, wenn die getippte Zahl nicht passt)
//   markiert  Sonnenring um diese Kästchen (Hilfe: von hier aus rechnen)
//   hell      Sonnenring um diese Stäbchen (Hilfe: die Stäbchen zwischen Kernaufgabe und Ziel)
//   hohl      eine Zahl: gestricheltes Kästchen über ihrem Ort, die Spitze zeigt auf ihre Perle; es wackelt einmal
//   bis       nur Stäbchen 1 … bis sind gemalt (Stufe Kopf); ein neues Stäbchen wird Perle für Perle hingemalt
//   verdeckt  die Perlen sind weggewischt (Stufe Vorstellung): saubere leere Kreidekästchen mit Stäbchengrenzen
//             und Fünfermarke bleiben (Christian, 2026-11-15: weggewischt, nicht verschmiert)
//   perlen    nur diese Stäbchen tragen Perlen (die übrigen sind leere Kästchen wie bei verdeckt); neu
//             hinzugekommene werden hingemalt. Ohne Attribut: alle (außer bei verdeckt)
//   weg       diese Stäbchen sind ganz weggewischt (Feld, Perlen und Kästchen); kommen sie wieder, werden sie hingemalt
// Methoden (Bildpunkte in px im Fenster): standPunkt(k) → { x, y, s } (Lena steht auf Stäbchen k, 0: Startkreis;
//   s: Maßstab der Tiefe), pfeilPunkt(k) / hohlPunkt(zahl) → Mitte des Kästchens { x, y, s, rem }, leuchte(k),
//   einrasten(k) (das Kästchen wird hingeschrieben), staub(x, y, s) (Kreidestaub bei einer Landung, px),
//   wische(k, { ganz }) → Promise (die Perlen von Stäbchen k, mit ganz auch Feld und Kästchen, verschwinden unter
//   dem Schwamm; danach setzt der Aufrufer verdeckt/perlen/weg, damit das Bild so bleibt).
// Flach und still (B3): bewegt sich nur als Folge einer Eingabe.

import { LERNFARBE } from "../../rahmen/stil.js";
import { kreideKette, KAESTCHEN, massstabBei, BILD } from "./kreide-geometrie.js";

const NS = "http://www.w3.org/2000/svg";
const KREIDE = "#FBF8F1";
const SONNE = "#FFD95A";
const wenigBewegung = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
/** @param {number} x */
const z = (x) => String(Math.round(x * 100) / 100);
/** @param {string | null} roh @returns {number[]} */
const liste = (roh) => (roh ?? "").split(/[\s,]+/).filter(Boolean).map(Number).filter((k) => Number.isInteger(k) && k >= 1 && k <= 10);

/** Zufall mit Saat (gleiche Zeichnung bei jedem Neuzeichnen). @param {number} saat */
function zufall(saat) {
  let a = saat >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Raue Ellipse (Kreide von Hand). @param {number} x @param {number} y @param {number} rx @param {number} ry @param {() => number} rnd */
function rauheEllipse(x, y, rx, ry, rnd, wackel = 0.07) {
  const n = 13;
  const p = [];
  const dreh = rnd() * Math.PI;
  for (let i = 0; i < n; i++) {
    const w = dreh + (i / n) * Math.PI * 2;
    const f = 1 + (rnd() - 0.5) * 2 * wackel;
    p.push([x + Math.cos(w) * rx * f, y + Math.sin(w) * ry * f]);
  }
  // Weiche Kurve durch die Punkte (Catmull-Rom als Bézier).
  let d = `M${z(p[0][0])} ${z(p[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
    d += ` C${z(p1[0] + (p2[0] - p0[0]) / 6)} ${z(p1[1] + (p2[1] - p0[1]) / 6)} ${z(p2[0] - (p3[0] - p1[0]) / 6)} ${z(p2[1] - (p3[1] - p1[1]) / 6)} ${z(p2[0])} ${z(p2[1])}`;
  }
  return `${d}Z`;
}

/** Leicht gewellter Kreidestrich. @param {number} x1 @param {number} y1 @param {number} x2 @param {number} y2 @param {() => number} rnd @param {number} w */
function strich(x1, y1, x2, y2, rnd, w) {
  const mx = (x1 + x2) / 2 + (rnd() - 0.5) * w * 1.2;
  const my = (y1 + y2) / 2 + (rnd() - 0.5) * w * 1.2;
  return `M${z(x1 + (rnd() - 0.5) * w * 0.5)} ${z(y1 + (rnd() - 0.5) * w * 0.5)} Q${z(mx)} ${z(my)} ${z(x2)} ${z(y2)}`;
}

/** Rauer, gerundeter Kasten um die Mitte (x, y). @param {number} x @param {number} y @param {number} b @param {number} h @param {() => number} rnd */
function rauherKasten(x, y, b, h, rnd) {
  const r = Math.min(h * 0.3, b * 0.3);
  const j = () => (rnd() - 0.5) * h * 0.05;
  const l = x - b / 2, o = y - h / 2, re = x + b / 2, u = y + h / 2;
  return `M${z(l + r + j())} ${z(o + j())} L${z(re - r + j())} ${z(o + j())} Q${z(re)} ${z(o)} ${z(re + j())} ${z(o + r)} L${z(re + j())} ${z(u - r)} Q${z(re)} ${z(u)} ${z(re - r)} ${z(u + j())} L${z(l + r)} ${z(u + j())} Q${z(l)} ${z(u)} ${z(l + j())} ${z(u - r)} L${z(l + j())} ${z(o + r)} Q${z(l)} ${z(o)} ${z(l + r + 0.01)} ${z(o + j())}`;
}

/** Fläche eines Felds (Viereck). @param {{ x: number, y: number }[]} e */
const viereck = (e) => `M${e.map((p) => `${z(p.x)} ${z(p.y)}`).join(" L")}Z`;

/** Rand eines Hüpffelds: vier Kreidestriche, an den Ecken etwas über das Feld hinaus (von Hand gezogen). @param {{ x: number, y: number, s: number }[]} e @param {() => number} rnd */
function feldStriche(e, rnd) {
  let d = "";
  for (let i = 0; i < 4; i++) {
    const a = e[i], b = e[(i + 1) % 4];
    const ux = b.x - a.x, uy = b.y - a.y;
    const l = Math.hypot(ux, uy) || 1;
    const ueber = 0.5 * a.s;
    d += strich(a.x - (ux / l) * ueber * rnd(), a.y - (uy / l) * ueber * rnd(), b.x + (ux / l) * ueber * rnd(), b.y + (uy / l) * ueber * rnd(), rnd, 0.25 * a.s) + " ";
  }
  return d;
}

/**
 * Körnung als Bild (einmal je Seite): helle Flecken (Kreide hält) mit Löchern (der Asphalt scheint durch).
 * Auch als CSS-Variable --kreide-korn am Dokument (die Gleichung ist ebenfalls Kreide).
 */
function koernung() {
  try {
    const c = document.createElement("canvas");
    c.width = c.height = 160;
    const g = /** @type {CanvasRenderingContext2D} */ (c.getContext("2d"));
    g.fillStyle = "#fff";
    g.fillRect(0, 0, 160, 160);
    const rnd = zufall(7);
    for (let i = 0; i < 2600; i++) {
      const a = rnd();
      g.fillStyle = `rgba(0,0,0,${0.25 + a * 0.6})`;
      const r = 0.4 + rnd() * 1.3;
      g.beginPath();
      g.arc(rnd() * 160, rnd() * 160, r, 0, Math.PI * 2);
      g.fill();
    }
    return c.toDataURL("image/png");
  } catch {
    return "";
  }
}
/** Körnung des Asphalts: helle und dunkle Steinchen auf durchsichtigem Grund. */
function asphaltKorn() {
  try {
    const c = document.createElement("canvas");
    c.width = c.height = 220;
    const g = /** @type {CanvasRenderingContext2D} */ (c.getContext("2d"));
    const rnd = zufall(11);
    for (let i = 0; i < 2400; i++) {
      const hell = rnd() < 0.55;
      g.fillStyle = hell ? `rgba(236,230,220,${0.12 + rnd() * 0.22})` : `rgba(70,64,60,${0.1 + rnd() * 0.22})`;
      const r = 0.4 + rnd() * 1.4;
      g.beginPath();
      g.arc(rnd() * 220, rnd() * 220, r, 0, Math.PI * 2);
      g.fill();
    }
    return c.toDataURL("image/png");
  } catch {
    return "";
  }
}
const KORN = typeof document !== "undefined" ? koernung() : "";
const ASPHALT = typeof document !== "undefined" ? asphaltKorn() : "";
if (KORN && typeof document !== "undefined") document.documentElement.style.setProperty("--kreide-korn", `url(${KORN})`);

const CSS = `
:host { position: fixed; inset: 0; display: block; pointer-events: none; }
svg { width: 100%; height: 100%; display: block; }
text { font-family: "Andika", sans-serif; font-weight: 700; }
.neu .perle, .neu .teil, .perlen.neu .perle { transform-box: fill-box; transform-origin: 50% 50%; animation: malen 0.2s ease-out both; }
@keyframes malen { from { opacity: 0; transform: scale(0.3); } }
.hohl > g { transform-box: fill-box; transform-origin: 50% 100%; animation: wackel 0.5s ease-in-out 1; }
@keyframes wackel { 25% { transform: rotate(-8deg); } 70% { transform: rotate(6deg); } }
@media (prefers-reduced-motion: reduce) { .neu .perle, .neu .teil, .hohl > g { animation: none; } }
`;

export class M37Kreidekette extends HTMLElement {
  static observedAttributes = ["reihe", "breite", "pfeile", "leer", "frage", "markiert", "hell", "hohl", "verdeckt", "bis", "perlen", "weg"];

  constructor() {
    super();
    const w = this.attachShadow({ mode: "open" });
    w.innerHTML = `<style>${CSS}</style><svg xmlns="${NS}" role="img" aria-label="Perlenkette">
      <defs>
        <pattern id="korn" patternUnits="userSpaceOnUse" width="16" height="16"><image href="${KORN}" width="16" height="16"/></pattern>
        <mask id="kreide" maskUnits="userSpaceOnUse" x="-50" y="-50" width="400" height="300"><rect x="-50" y="-50" width="400" height="300" fill="url(#korn)"/></mask>
        <pattern id="asphalt" patternUnits="userSpaceOnUse" width="22" height="22"><image href="${ASPHALT}" width="22" height="22"/></pattern>
        <radialGradient id="licht" cx="0.3" cy="0.1" r="0.9"><stop offset="0" stop-color="#fff" stop-opacity="0.16"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
        <linearGradient id="tiefe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.08"/><stop offset="1" stop-color="#2b2622" stop-opacity="0.1"/></linearGradient>
        <filter id="wisch" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="0.45"/></filter>
      </defs>
      <g class="grund"></g><g class="kette" mask="url(#kreide)"></g><g class="lauf"></g></svg>`;
    this.svg = /** @type {SVGSVGElement} */ (w.querySelector("svg"));
    this.grund = /** @type {SVGGElement} */ (w.querySelector("g.grund"));
    this.ketteG = /** @type {SVGGElement} */ (w.querySelector("g.kette"));
    this.lauf = /** @type {SVGGElement} */ (w.querySelector("g.lauf"));
    /** @type {ReturnType<typeof kreideKette>} */
    this.geo = null;
    this.bildBreite = 0;
    /** @type {number | null} */
    this.bisVorher = null;
    /** Stäbchen mit Perlen und gezeichnete Stäbchen beim letzten Zeichnen (was neu dazukommt, wird hingemalt). @type {Set<number> | null} */
    this.perlenVorher = null;
    /** @type {Set<number> | null} */
    this.daVorher = null;
    /** Reihe beim letzten Zeichnen (eine neue Reihe malt nichts nach). @type {number | null} */
    this.nVorher = null;
    new ResizeObserver(() => this.zeichne(true)).observe(this);
  }

  attributeChangedCallback(/** @type {string} */ name) {
    this.zeichne(name === "breite");
  }

  /** px je rem. */
  rem() {
    return parseFloat(getComputedStyle(document.documentElement).fontSize) || 10;
  }

  /** @param {boolean} [grundAuch] */
  zeichne(grundAuch = false) {
    const rem = this.rem();
    const breiteBild = Math.max(1, this.clientWidth / rem || innerWidth / rem);
    if (grundAuch || Math.abs(breiteBild - this.bildBreite) > 0.1) {
      this.bildBreite = breiteBild;
      this.svg.setAttribute("viewBox", `0 0 ${z(breiteBild)} ${BILD.hoehe}`);
      this.zeichneGrund(breiteBild);
    }
    const breite = Number(this.getAttribute("breite")) || breiteBild * 0.72;
    this.geo = kreideKette(this.getAttribute("reihe"), { breite });
    this.zeichneKette();
  }

  /** Asphalt von schräg oben: Körnung, Licht, oben der Bordstein, am Rand eine Kreidedose und ein Blatt. @param {number} b */
  zeichneGrund(b) {
    const rnd = zufall(5);
    let s = `<rect x="0" y="0" width="${z(b)}" height="108" fill="#9C988F"/>`;
    s += `<rect x="0" y="0" width="${z(b)}" height="108" fill="url(#asphalt)"/>`;
    s += `<rect x="0" y="0" width="${z(b)}" height="108" fill="url(#tiefe)"/><rect x="0" y="0" width="${z(b)}" height="108" fill="url(#licht)"/>`;
    // Bordstein oben (direkt unter der Kopfleiste), mit Fugen, die zur Tiefe laufen.
    const y0 = 15.4;
    s += `<rect x="0" y="${y0}" width="${z(b)}" height="3.6" fill="#CFC9BE"/><rect x="0" y="${y0 + 3.6}" width="${z(b)}" height="1.1" fill="#76716b" opacity="0.6"/>`;
    for (let x = 6; x < b; x += 19) s += `<line x1="${z(x)}" y1="${y0}" x2="${z(x - (x - b / 2) * 0.04)}" y2="${y0 + 3.6}" stroke="#a9a397" stroke-width="0.3"/>`;
    // Kreidedose unten links: Blechdose von oben, darin bunte Kreiden.
    const dx = 7.5, dy = 101;
    s += `<g><ellipse cx="${dx + 0.6}" cy="${dy + 4.6}" rx="6.4" ry="2.2" fill="#2b2622" opacity="0.18"/>
      <path d="M${dx - 5.6} ${dy} L${dx - 5.6} ${dy + 4} A5.6 2.3 0 0 0 ${dx + 5.6} ${dy + 4} L${dx + 5.6} ${dy} Z" fill="#E9B949" stroke="#3B2A6B" stroke-width="0.3"/>
      <ellipse cx="${dx}" cy="${dy}" rx="5.6" ry="2.3" fill="#6b4a2a" stroke="#3B2A6B" stroke-width="0.3"/>`;
    const kreiden = [["#F4A3C0", -3.4, -0.2, -20], ["#6CB8F0", -1.4, -1.3, 8], ["#FBF8F1", 0.8, -0.4, -6], ["#F7D038", 2.8, -1, 18], ["#3FA34D", 1.6, 0.9, -30]];
    for (const [f, ox, oy, w] of kreiden) s += `<rect x="${dx + Number(ox) - 0.7}" y="${dy + Number(oy) - 2.6}" width="1.4" height="4" rx="0.6" fill="${f}" stroke="#3B2A6B" stroke-width="0.22" transform="rotate(${w} ${dx + Number(ox)} ${dy + Number(oy)})"/>`;
    s += `</g>`;
    // Ein Blatt am Rand (hinten rechts der Straße).
    const bx = b * 0.66, by = 27;
    s += `<g transform="translate(${z(bx)} ${by}) rotate(-24) scale(0.62 0.34)"><path d="M0 -4 C3.5 -3 4.2 1.8 0 4.6 C-4.2 1.8 -3.5 -3 0 -4Z" fill="#E7A33E" stroke="#8a5a2b" stroke-width="0.5"/><path d="M0 -3.6 L0 4.2" stroke="#8a5a2b" stroke-width="0.4"/></g>`;
    this.grund.innerHTML = s;
  }

  zeichneKette() {
    const g = this.geo;
    if (!g) {
      this.ketteG.innerHTML = "";
      return;
    }
    const farbe = LERNFARBE.perle[/** @type {keyof typeof LERNFARBE.perle} */ (g.n)];
    const bisRoh = this.getAttribute("bis");
    const bis = bisRoh !== null && /^\d+$/.test(bisRoh.trim()) ? Math.min(10, Number(bisRoh)) : 10;
    const vorher = this.bisVorher ?? bis;
    this.bisVorher = bis;
    const verdeckt = this.hasAttribute("verdeckt");
    const hell = liste(this.getAttribute("hell"));
    const weg = new Set(liste(this.getAttribute("weg")));
    const mitPerlen = new Set(verdeckt ? [] : this.hasAttribute("perlen") ? liste(this.getAttribute("perlen")) : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const da = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter((nr) => nr <= bis && !weg.has(nr)));
    // Neu Hingemaltes nur auf derselben Reihe (eine neue Reihe erscheint so, wie sie gemalt wird: über bis/weg).
    const gleicheReihe = this.nVorher === g.n;
    const perlenVorher = gleicheReihe && this.perlenVorher ? this.perlenVorher : mitPerlen;
    const daVorher = gleicheReihe && this.daVorher ? this.daVorher : da;
    this.perlenVorher = mitPerlen;
    this.daVorher = da;
    this.nVorher = g.n;
    // Jedes Stäbchen zeichnet mit eigenem Zufall: ein weggewischtes Stäbchen ändert die anderen nicht.
    const rndVon = (/** @type {number} */ nr) => zufall(g.n * 97 + nr * 31 + 3);
    let s = "";
    // Startkreis: hier steht Lena vor dem ersten Hüpfer.
    const st = g.start;
    s += `<path d="${rauheEllipse(st.x, st.y, 4.2 * st.s, 4.2 * st.s * 0.5 * st.s, rndVon(0), 0.05)}" fill="none" stroke="${KREIDE}" stroke-width="${z(0.45 * st.s)}" opacity="0.9"/>`;
    for (const gl of g.glieder) {
      const nr = g.staebchen.findIndex((x) => x.ende === gl.von) + 1;
      if (!da.has(nr) || !da.has(nr + 1)) continue;
      s += `<path data-glied="${nr}" d="${strich(gl.von.x, gl.von.y, gl.bis.x, gl.bis.y, rndVon(nr + 40), 0.2)}" stroke="${KREIDE}" stroke-width="${z(0.26 * gl.von.s)}" stroke-dasharray="${z(0.5 * gl.von.s)} ${z(0.55 * gl.von.s)}" stroke-linecap="round" fill="none" opacity="0.75"/>`;
    }
    for (const stab of g.staebchen) {
      if (!da.has(stab.nr)) continue;
      const rnd = rndVon(stab.nr);
      const bewegt = !wenigBewegung();
      const neu = bewegt && (stab.nr > vorher || !daVorher.has(stab.nr));
      const perlen = mitPerlen.has(stab.nr);
      const perlenNeu = bewegt && perlen && (neu || !perlenVorher.has(stab.nr));
      const sm = stab.mitte.s;
      const h = g.halb(stab.reihe);
      s += `<g class="stab${neu ? " neu" : ""}" data-stab="${stab.nr}">`;
      s += `<path class="teil" d="${feldStriche(stab.feld, rnd)}" stroke="${KREIDE}" stroke-width="${z(0.42 * sm)}" stroke-linecap="round" fill="none" opacity="0.88"/>`;
      if (hell.includes(stab.nr)) s += `<path d="${viereck(stab.feld)}" fill="${SONNE}" fill-opacity="0.3" stroke="${SONNE}" stroke-width="${z(0.8 * sm)}" stroke-linejoin="round"/>`;
      // Leeres Kästchen des Stäbchens: so lang wie die Perlen, Grenzen an beiden Enden, die Fünfermarke (Vorstellung).
      const b = stab.ende.x - stab.anfang.x + h * 2.1;
      const hoch = Math.max(h * 2.6, 3.2 * sm * sm);
      const kasten = `<path class="teil kasten" d="${rauherKasten(stab.mitte.x, stab.mitte.y, b, hoch, rnd)}" fill="${farbe}" fill-opacity="0.3" stroke="${farbe}" stroke-width="${z(0.75 * sm)}" stroke-linejoin="round"/>`;
      const grenzen = [stab.anfang, stab.ende].map((e, i) => `<path class="teil" d="${strich(e.x + (i ? h : -h) * 1.05, e.y - hoch * 0.62, e.x + (i ? h : -h) * 1.05, e.y + hoch * 0.62, rnd, 0.06 * sm)}" stroke="${KREIDE}" stroke-width="${z(0.6 * sm)}" stroke-linecap="round" fill="none"/>`).join("");
      const marke = stab.marke ? `<path class="teil" d="${strich(stab.marke.x, stab.marke.y - Math.max(h * 1.9, hoch * 0.62), stab.marke.x, stab.marke.y + Math.max(h * 1.9, hoch * 0.62), rnd, 0.1 * sm)}" stroke="${KREIDE}" stroke-width="${z(0.5 * sm)}" stroke-linecap="round" fill="none"/>` : "";
      if (!perlen) {
        s += kasten + grenzen + marke;
      } else {
        s += `<g class="perlen${perlenNeu ? " neu" : ""}">`;
        s += `<path class="teil" d="${strich(stab.anfang.x, stab.anfang.y, stab.ende.x, stab.ende.y, rnd, 0.15 * sm)}" stroke="${KREIDE}" stroke-width="${z(0.2 * sm)}" fill="none" opacity="0.7"/>`;
        stab.perlen.forEach((p, i) => {
          const ver = perlenNeu ? ` style="animation-delay:${i * 18}ms"` : "";
          s += `<g class="perle"${ver}><path d="${rauheEllipse(p.x, p.y, p.rx * 0.92, p.ry * 0.92, rnd)}" fill="${farbe}" opacity="0.94"/>`;
          s += `<path d="${rauheEllipse(p.x, p.y, p.rx * 0.95, p.ry * 0.95, rnd, 0.05)}" fill="none" stroke="${KREIDE}" stroke-width="${z(Math.min(0.32, p.rx * 0.13))}" opacity="0.85"/></g>`;
        });
        s += `${marke}</g>`;
      }
      s += `</g>`;
    }
    // Kästchen (Pfeilchen) der Stäbchen.
    const markiert = liste(this.getAttribute("markiert"));
    const mitZahl = liste(this.getAttribute("pfeile"));
    const ohneZahl = liste(this.getAttribute("leer"));
    const mitFrage = liste(this.getAttribute("frage"));
    for (let nr = 1; nr <= 10; nr++) {
      if (!da.has(nr)) continue;
      const text = mitZahl.includes(nr) ? String(nr * g.n) : mitFrage.includes(nr) ? "?" : ohneZahl.includes(nr) ? "" : null;
      if (text === null) continue;
      s += this.kaestchen(g.pfeil(nr), text, { nr, markiert: markiert.includes(nr), frage: text === "?", rnd: rndVon(nr + 20) });
    }
    const hohl = this.getAttribute("hohl");
    if (hohl !== null && /^\d{1,3}$/.test(hohl.trim())) s += `<g class="hohl">${this.kaestchen(g.hohl(Number(hohl)), String(Number(hohl)), { hohl: true, rnd: rndVon(99) })}</g>`;
    this.ketteG.innerHTML = s;
  }

  /**
   * Ein Kreide-Kästchen mit Text und einem Pfeilstrich zur Kette.
   * @param {{ x: number, y: number, s: number, spitze: { x: number, y: number } }} k @param {string} text
   * @param {{ nr?: number, markiert?: boolean, frage?: boolean, hohl?: boolean, rnd: () => number }} o
   */
  kaestchen(k, text, { nr, markiert = false, frage = false, hohl = false, rnd }) {
    const g = /** @type {NonNullable<typeof this.geo>} */ (this.geo);
    const s = k.s;
    const b = g.kaestchenBreite(text) * s;
    const h = KAESTCHEN.hoehe * s;
    const oben = k.spitze.y < k.y;
    const kante = k.y + (oben ? -h / 2 : h / 2);
    const strichArt = hohl ? ` stroke-dasharray="${z(0.9 * s)} ${z(0.7 * s)}"` : "";
    let t = `<g class="${hohl ? "" : "pfeil"}"${nr ? ` data-stab="${nr}"` : ""}>`;
    if (markiert) t += `<path d="${rauherKasten(k.x, k.y, b + 2.2 * s, h + 2.2 * s, rnd)}" fill="none" stroke="${SONNE}" stroke-width="${z(0.9 * s)}"/>`;
    // Pfeilstrich mit Spitze von der Kästchenkante zur Kette.
    const sp = k.spitze;
    const r = oben ? 1 : -1;
    t += `<path d="M${z(k.x)} ${z(kante)} L${z(sp.x)} ${z(sp.y + r * 0.2 * s)} M${z(sp.x - 0.9 * s)} ${z(sp.y + r * 1.1 * s)} L${z(sp.x)} ${z(sp.y)} L${z(sp.x + 0.9 * s)} ${z(sp.y + r * 1.1 * s)}" stroke="${KREIDE}" stroke-width="${z(0.38 * s)}" stroke-linecap="round" stroke-linejoin="round" fill="none"${strichArt}/>`;
    t += `<path class="rahmen" pathLength="1" d="${rauherKasten(k.x, k.y, b, h, rnd)}" fill="${hohl ? "none" : "#5f5b56"}" fill-opacity="0.25" stroke="${KREIDE}" stroke-width="${z(0.4 * s)}"${strichArt} stroke-linejoin="round"/>`;
    if (text) t += `<text class="zahl" x="${z(k.x)}" y="${z(k.y + KAESTCHEN.schrift * s * 0.36)}" font-size="${z(KAESTCHEN.schrift * s)}" text-anchor="middle" fill="${KREIDE}" opacity="${frage || hohl ? 0.8 : 1}">${text}</text>`;
    return `${t}</g>`;
  }

  // --- Bildpunkte im Fenster (px) ---------------------------------------------------------------
  /** @param {{ x: number, y: number, s: number }} p */
  px(p) {
    const r = this.getBoundingClientRect();
    const rem = this.rem();
    return { x: r.left + p.x * rem, y: r.top + p.y * rem, s: p.s, rem };
  }
  /** @param {number} k 0 … 10 */
  standPunkt(k) {
    return this.geo ? this.px(this.geo.stand(k)) : null;
  }
  /** @param {number} k 1 … 10 */
  pfeilPunkt(k) {
    return this.geo && k >= 1 && k <= 10 ? this.px(this.geo.pfeil(k)) : null;
  }
  /** Anfang und Ende der Perlen von Stäbchen k (px), für Schwamm und Kreide. @param {number} k 1 … 10 */
  stabOrt(k) {
    const st = this.geo?.staebchen[k - 1];
    if (!st) return null;
    const h = this.geo.halb(st.reihe);
    return { anfang: this.px({ ...st.anfang, x: st.anfang.x - h }), ende: this.px({ ...st.ende, x: st.ende.x + h }), s: st.mitte.s };
  }
  /** @param {number} zahl */
  hohlPunkt(zahl) {
    return this.geo ? this.px(this.geo.hohl(zahl)) : null;
  }

  /**
   * Der Schwamm wischt über Stäbchen k: die Perlen (mit ganz auch Feld, Glied und Kästchen) verblassen von links nach
   * rechts, Kreidestaub. Danach setzt der Aufrufer verdeckt/perlen/weg, damit das Bild so bleibt.
   * @param {number} k @param {{ ganz?: boolean, ms?: number }} [o] @returns {Promise<void>}
   */
  wische(k, { ganz = false, ms = 150 } = {}) {
    const g = this.geo;
    const stab = this.ketteG.querySelector(`g.stab[data-stab="${k}"]`);
    if (!g || !stab || wenigBewegung()) return Promise.resolve();
    /** @type {Element[]} */
    const ziele = ganz
      ? [stab, ...this.ketteG.querySelectorAll(`g.pfeil[data-stab="${k}"], [data-glied="${k - 1}"]`)]
      : [...stab.querySelectorAll(".perlen")];
    const st = g.staebchen[k - 1];
    if (st) this.staubRem(st.mitte.x, st.mitte.y, st.mitte.s, 4);
    const laeufe = ziele.map((el) => el.animate([
      { opacity: 1, clipPath: "inset(-50% -5% -50% -5%)" },
      { opacity: 0.2, clipPath: "inset(-50% -5% -50% 95%)" },
    ], { duration: ms, easing: "ease-in", fill: "forwards" }).finished.catch(() => undefined));
    return Promise.all(laeufe).then(() => undefined);
  }

  /** Stäbchen k leuchtet kurz in Sonne auf (Folge eines Hüpfers). @param {number} k */
  leuchte(k) {
    const g = this.geo;
    const st = g?.staebchen[k - 1];
    if (!g || !st || wenigBewegung()) return;
    const el = document.createElementNS(NS, "path");
    el.setAttribute("d", viereck(st.feld));
    el.setAttribute("fill", SONNE);
    el.setAttribute("opacity", "0");
    this.lauf.prepend(el);
    const a = el.animate([{ opacity: 0 }, { opacity: 0.5, offset: 0.2 }, { opacity: 0 }], { duration: 460, easing: "ease-out" });
    a.finished.then(() => el.remove(), () => el.remove());
  }

  /** Das Kästchen von Stäbchen k wird hingeschrieben: Rahmen in einem Zug, die Zahl kommt dazu, Staub. @param {number} k */
  einrasten(k) {
    const g = this.ketteG.querySelector(`g.pfeil[data-stab="${k}"]`);
    if (!g || wenigBewegung()) return;
    const rahmen = /** @type {SVGPathElement | null} */ (g.querySelector(".rahmen"));
    const zahl = /** @type {SVGTextElement | null} */ (g.querySelector(".zahl"));
    rahmen?.animate([{ strokeDasharray: "1 1", strokeDashoffset: 1 }, { strokeDasharray: "1 1", strokeDashoffset: 0 }], { duration: 300, easing: "ease-out" });
    if (zahl) {
      zahl.style.transformBox = "fill-box";
      zahl.style.transformOrigin = "50% 60%";
      zahl.animate([{ clipPath: "inset(0 100% 0 0)", transform: "scale(1.15)" }, { clipPath: "inset(0 0 0 0)", transform: "scale(1.06)", offset: 0.6 }, { clipPath: "inset(0 0 0 0)", transform: "scale(1)" }], { duration: 340, easing: "ease-out" });
    }
    const p = this.geo?.pfeil(k);
    if (p) this.staubRem(p.x, p.y, p.s, 5);
  }

  /** Kreidestaub an einem Punkt in px (Landung). @param {number} x @param {number} y @param {number} s */
  staub(x, y, s) {
    const r = this.getBoundingClientRect();
    const rem = this.rem();
    this.staubRem((x - r.left) / rem, (y - r.top) / rem, s, 6);
  }

  /** @param {number} x @param {number} y @param {number} s @param {number} zahl */
  staubRem(x, y, s, zahl) {
    if (wenigBewegung()) return;
    const rnd = zufall(Math.round(x * 13 + y * 7));
    for (let i = 0; i < zahl; i++) {
      const c = document.createElementNS(NS, "circle");
      const r0 = (0.35 + rnd() * 0.45) * s;
      c.setAttribute("cx", z(x));
      c.setAttribute("cy", z(y));
      c.setAttribute("r", z(r0));
      c.setAttribute("fill", KREIDE);
      this.lauf.append(c);
      const w = (i / zahl) * Math.PI * 2 + rnd();
      const weit = (2.4 + rnd() * 2.4) * s;
      const a = c.animate([
        { transform: "translate(0, 0)", opacity: 0.85 },
        { transform: `translate(${z(Math.cos(w) * weit)}px, ${z(Math.sin(w) * weit * 0.45 - 1.2 * s)}px)`, opacity: 0 },
      ], { duration: 420 + rnd() * 160, easing: "ease-out" });
      a.finished.then(() => c.remove(), () => c.remove());
    }
  }
}

if (typeof customElements !== "undefined" && !customElements.get("m37-kreidekette")) customElements.define("m37-kreidekette", M37Kreidekette);
