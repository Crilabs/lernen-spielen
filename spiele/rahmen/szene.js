// Gezeichnete Szenen aus Bausteinen der App: die Bildelemente der Einführungen (spiele/einfuehrung.js) und der
// Geschichten (rahmen/geschichte.js, docs/geschichten.md §3). Beide bauen ihr Bild mit baueBild; das Aussehen
// (Größen, Lage) setzt der Abspieler per CSS, die neuen Elemente bringen ihr CSS mit (SZENE_CSS).
//
// ELEMENTE, x = Mitte in Prozent der Breite, y (optional) = Mitte in Prozent der Höhe:
//   { "figur": "ela", "x": 16, "haltung": "zeigen", "aufgabe": "vorzeigen" }
//       ein Kind der Runde (ela, kofi, lena, timo); haltung aus dem Bestand, sonst stehen. Steht ein Kind in der
//       nächsten Szene an derselben Stelle, bleibt seine Zeichnung und wechselt nur sanft die Haltung. blick
//       (optional): "rechts" (Vorgabe) oder "links", z. B. für ein Kind rechts vom Material.
//   { "perlen": [3, 7], "x": 60, "hoehe": 4.4 } Stäbe in Montessori-Farben nebeneinander (<ls-perlenstab>); hoehe
//       (optional) ist die Dicke der Stäbe in Einheiten des Abspielers, sonst passend zur Matte
//   { "zahl": 7, "x": 80 }                     große Ziffer
//   { "objekt": "einkaufskorb", "zustand": "leer", "hoehe": 16 }   ein Ding aus spiele/objekte/ (<ls-objekt still>)
//   { "haeuser": [3, 7], "zu": 1 }             zwei Häuser nebeneinander; im Fenster jedes Hauses liegt ein
//       Perlenstab mit so vielen Perlen (0 = leeres Fenster). Beide Stäbe beginnen links im Fenster an derselben
//       Stelle, damit man die Längen vergleicht. zu (0 oder 1, optional): beim linken bzw. rechten Haus ist der
//       Vorhang zu, die Perlen sind nicht zu sehen (Frage zum Vorhersagen). Zehnerpaare: [1, 9] … [5, 5].
//   { "paare": [[1, 9], [2, 8], [3, 7], [4, 6], [5, 5]] }
//       Paare von Perlenstäben untereinander, wie das Montessori-Material gelegt: der erste Stab beginnt links, der
//       zweite endet rechts, alle Reihen gleich lang, wenn jede Summe gleich ist; man sieht das Muster (links eine
//       Perle mehr, rechts eine weniger). Jede Reihe höchstens zehn Perlen.
//
// pruefeSzene (ohne DOM, in Node testbar) prüft ein Bild; baueBild greift erst beim Aufruf auf das DOM zu.

import { laenge } from "./perlen-geometrie.js";
import { dunkler, heller } from "../runde/kinder/stil.js";

/** Bekannte Bildelemente (der Schlüssel, der die Art bestimmt). */
export const ELEMENTE = Object.freeze(["figur", "perlen", "zahl", "objekt", "haeuser", "paare"]);

/**
 * Art eines Bildelements oder null.
 * @param {any} b
 * @returns {string | null}
 */
export function artDes(b) {
  if (!b || typeof b !== "object" || Array.isArray(b)) return null;
  return ELEMENTE.find((k) => k in b) ?? null;
}

/** @param {unknown} n @param {number} von @param {number} bis */
const ganz = (n, von, bis) => Number.isInteger(n) && /** @type {number} */ (n) >= von && /** @type {number} */ (n) <= bis;

/**
 * Prüft die Elemente eines Bildes (ohne DOM). Kinder und Haltungen prüft der Aufrufer gegen den Bestand.
 * @param {unknown} bild
 * @returns {string[]} Fehler, leer wenn alles passt
 */
export function pruefeSzene(bild) {
  if (!Array.isArray(bild)) return ["Szene ist keine Liste"];
  /** @type {string[]} */
  const fehler = [];
  bild.forEach((b, i) => {
    const wo = `Element ${i + 1}`;
    const art = artDes(b);
    if (!art) return void fehler.push(`${wo}: unbekanntes Bildelement ${JSON.stringify(b)}`);
    for (const k of ["x", "y"]) if (k in b && !(typeof b[k] === "number" && b[k] >= 0 && b[k] <= 100)) fehler.push(`${wo}: ${k} nicht 0–100`);
    if (art === "figur" && !(typeof b.figur === "string" && /^[a-z]+$/.test(b.figur))) fehler.push(`${wo}: figur ohne Namen`);
    if (art === "figur" && "blick" in b && b.blick !== "rechts" && b.blick !== "links") fehler.push(`${wo}: blick ist rechts oder links`);
    if ((art === "perlen" || art === "objekt") && "hoehe" in b && !(typeof b.hoehe === "number" && b.hoehe > 0 && b.hoehe <= 30)) fehler.push(`${wo}: hoehe ungültig`);
    if (art === "perlen" && !(Array.isArray(b.perlen) && b.perlen.length > 0 && b.perlen.every((/** @type {unknown} */ n) => ganz(n, 1, 10))))
      fehler.push(`${wo}: perlen braucht Zahlen 1–10`);
    if (art === "zahl" && !(typeof b.zahl === "number" || typeof b.zahl === "string")) fehler.push(`${wo}: zahl fehlt`);
    if (art === "objekt" && !(typeof b.objekt === "string" && /^[a-z][a-z0-9-]*$/.test(b.objekt))) fehler.push(`${wo}: objekt ohne Art`);
    if (art === "haeuser") {
      if (!(Array.isArray(b.haeuser) && b.haeuser.length === 2 && b.haeuser.every((/** @type {unknown} */ n) => ganz(n, 0, 9))))
        fehler.push(`${wo}: haeuser braucht zwei Zahlen 0–9`);
      if ("zu" in b && !(b.zu === 0 || b.zu === 1)) fehler.push(`${wo}: zu ist 0 oder 1`);
    }
    if (art === "paare") {
      const ok = Array.isArray(b.paare) && b.paare.length > 0 && b.paare.every((/** @type {any} */ p) => Array.isArray(p) && p.length === 2
        && p.every((/** @type {unknown} */ n) => ganz(n, 1, 9)) && p[0] + p[1] <= 10);
      if (!ok) fehler.push(`${wo}: paare braucht Paare von Zahlen 1–9, je höchstens zehn`);
    }
  });
  return fehler;
}

// ---------------------------------------------------------------- Häuser

const HAUS = Object.freeze({
  breite: 100, hoehe: 92,
  /** Fenster, in dem die Perlen liegen (Feld 0…100 × 0…92). */
  fenster: { x: 11, y: 46, b: 78, h: 30 },
  /** Platz für einen Stab mit neun Perlen im Fenster. */
  rand: 4,
});
/** Wände und Dächer aus der Welt-Schicht (heller und weicher als die Perlen, grundsaetze-bilder 6.2). */
const HAUS_FARBEN = Object.freeze([
  { wand: "#F2DDB8", dach: "#D98872", vorhang: "#E9A7A0" },
  { wand: "#D9E8EE", dach: "#6E9CC2", vorhang: "#A9C3E6" },
]);
const LICHT = "#FFF4D6";
const INK = "#3B2A6B";

/** Höhe des Stabs im Fenster in Prozent der Hausbreite: ein Stab mit neun Perlen füllt das Fenster. */
export const HAUS_STAB = ((HAUS.fenster.b - 2 * HAUS.rand) / (laenge(9) / 1.4));

/**
 * SVG eines Hauses (Stil der Runde: Silhouette in Tinte, eine Schattenstufe).
 * @param {number} i 0 links, 1 rechts
 * @param {boolean} zu Vorhang zu
 * @returns {string}
 */
export function hausSvg(i, zu) {
  const f = HAUS_FARBEN[i % 2];
  const { x, y, b, h } = HAUS.fenster;
  const kante = `stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"`;
  const dach = "M2 40 L50 6 L98 40 Z";
  const schornstein = i === 0 ? "M70 12 L80 12 L80 30 L70 23 Z" : "M22 12 L32 12 L32 22 L22 30 Z";
  let vorhang = "";
  if (zu) {
    const m = x + b / 2;
    const falten = [0.2, 0.45, 0.7].map((t) => `M${x + t * (b / 2)} ${y + 2} L${x + t * (b / 2)} ${y + h - 2} M${m + t * (b / 2)} ${y + 2} L${m + t * (b / 2)} ${y + h - 2}`).join(" ");
    vorhang = `<rect x="${x}" y="${y}" width="${b / 2}" height="${h}" fill="${f.vorhang}"/>`
      + `<rect x="${m}" y="${y}" width="${b / 2}" height="${h}" fill="${f.vorhang}"/>`
      + `<path d="${falten}" stroke="${dunkler(f.vorhang, 0.28)}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`
      + `<line x1="${m}" y1="${y}" x2="${m}" y2="${y + h}" stroke="${INK}" stroke-width="1.6"/>`;
  }
  return `<svg viewBox="-2 0 ${HAUS.breite + 4} ${HAUS.hoehe + 2}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">`
    + `<path d="${schornstein}" fill="${dunkler(f.dach, 0.2)}" ${kante}/>`
    + `<rect x="7" y="34" width="86" height="56" rx="1.5" fill="${dunkler(f.wand, 0.2)}" ${kante}/>`
    + `<rect x="8.4" y="35.4" width="82" height="51" rx="1" fill="${f.wand}"/>`
    + `<path d="${dach}" fill="${dunkler(f.dach, 0.25)}" ${kante}/>`
    + `<path d="M8 38.4 L50 9 L92 38.4 Z" fill="${f.dach}"/>`
    + `<rect x="${x - 1.6}" y="${y - 1.6}" width="${b + 3.2}" height="${h + 3.2}" rx="2" fill="${heller(f.wand, 0.6)}" ${kante}/>`
    + `<rect x="${x}" y="${y}" width="${b}" height="${h}" rx="1" fill="${LICHT}"/>`
    + vorhang
    + `<rect x="${x - 3}" y="${y + h + 1.6}" width="${b + 6}" height="3" rx="1" fill="${dunkler(f.wand, 0.3)}"/>`
    + `</svg>`;
}

// ---------------------------------------------------------------- Paare

/** Abstand zwischen den beiden Stäben einer Reihe (in Perlen-Durchmessern). */
const PAAR_SPALT = 0.5;

/**
 * Lage der Stäbe eines Paar-Bildes (ohne DOM): alle Reihen gleich lang (die längste Reihe plus Spalt), der erste
 * Stab links bündig, der zweite rechts bündig.
 * @param {number[][]} paare
 * @returns {{ gesamt: number, reihen: { a: number, b: number, links: number }[] }}
 *   gesamt: Länge einer Reihe; links: Beginn des zweiten Stabs (beides in Perlen-Durchmessern)
 */
export function paarLage(paare) {
  const gesamt = Math.max(...paare.map(([a, b]) => laenge(a) + laenge(b))) + PAAR_SPALT;
  return { gesamt, reihen: paare.map(([a, b]) => ({ a, b, links: gesamt - laenge(b) })) };
}

// ---------------------------------------------------------------- CSS der neuen Elemente

/**
 * CSS für haeuser und paare. Größen in --szene-u (eine Einheit des Abspielers: in der Einführung 1 rem, in der
 * Geschichte ein Teil der Bildhöhe).
 */
export const SZENE_CSS = `
.el.haeuser{display:flex;gap:calc(var(--szene-u,1rem)*5);align-items:flex-end}
.el.haeuser .haus{position:relative;width:calc(var(--szene-u,1rem)*var(--haus-breite,40))}
.el.haeuser .haus svg{display:block;width:100%;height:auto;overflow:visible}
.el.haeuser .haus ls-perlenstab{position:absolute;left:${(((HAUS.fenster.x + HAUS.rand + 2) / (HAUS.breite + 4)) * 100).toFixed(2)}%;
  top:${(((HAUS.fenster.y + HAUS.fenster.h / 2) / (HAUS.hoehe + 2)) * 100).toFixed(2)}%;transform:translateY(-50%);
  height:calc(var(--szene-u,1rem)*var(--haus-breite,40)*${(HAUS_STAB / (HAUS.breite + 4)).toFixed(4)})}
.el.paare{display:flex;flex-direction:column;gap:calc(var(--szene-u,1rem)*var(--paar-stab,6)*.42)}
.el.paare .reihe{position:relative;height:calc(var(--szene-u,1rem)*var(--paar-stab,6));width:calc(var(--szene-u,1rem)*var(--paar-stab,6)*var(--paar-laenge,9))}
.el.paare .reihe ls-perlenstab{position:absolute;top:0;height:100%}
`;

// ---------------------------------------------------------------- DOM-Teil

/**
 * @typedef {{ el: HTMLElement, steuer: { haltung: (h: string) => void, halt: () => void }, x: number, blick: string, haltung?: string }} Kind
 * @typedef {{ bestand: { kinder: Map<string, unknown>, haltungen: Map<string, unknown> },
 *   zeichne: (id: string, o: { haltung: string, blick?: "rechts" | "links" }) => string, steuere: (svg: Element | null) => any }} Runde
 */

/**
 * Baut die Elemente eines Bildes in die Bühne. Kaputte Elemente bleiben still weg.
 * @param {Element} buehne
 * @param {any[]} bild
 * @param {Runde | null} R die Runde (runde/runde.js) oder null, dann bleiben die Kinder weg
 * @param {Map<string, Kind>} vorher Kinder der letzten Szene
 * @returns {Map<string, Kind>} Kinder dieser Szene
 */
export function baueBild(buehne, bild, R, vorher) {
  /** @type {Map<string, Kind>} */
  const jetzt = new Map();
  for (const b of bild) {
    if (!b || typeof b !== "object") continue;
    try {
      const x = typeof b.x === "number" ? b.x : 50;
      if (b.figur) {
        if (!R || !R.bestand.kinder.has(b.figur) || jetzt.has(b.figur)) continue;
        const haltung = R.bestand.haltungen.has(b.haltung) ? b.haltung : "stehen";
        const blick = b.blick === "links" ? "links" : "rechts";
        const alt = vorher.get(b.figur);
        /** @type {Kind} */
        let f;
        if (alt && alt.x === x && alt.blick === blick) {
          f = alt;
          if (f.haltung !== haltung) f.steuer.haltung(haltung);
        } else {
          const el = document.createElement("div");
          el.className = "el figur-h";
          el.style.left = x + "%";
          el.innerHTML = R.zeichne(b.figur, { haltung, blick });
          f = { el, steuer: R.steuere(el.querySelector("svg")), x, blick };
        }
        f.haltung = haltung;
        jetzt.set(b.figur, f);
        buehne.appendChild(f.el);
        continue;
      }
      const el = document.createElement("div");
      el.className = "el";
      el.style.left = x + "%";
      if (typeof b.y === "number") el.style.top = b.y + "%";
      if (Array.isArray(b.perlen)) {
        el.classList.add("perlen");
        const werte = b.perlen.filter((/** @type {unknown} */ n) => Number.isInteger(n) && /** @type {number} */ (n) > 0 && /** @type {number} */ (n) <= 10);
        // Perlengröße so, dass alle Stäbe der Szene neben einem Kind auf die Matte passen (gleiche Größe für alle)
        const lang = werte.reduce((/** @type {number} */ s, /** @type {number} */ n) => s + n * 1.12 + (n > 5 ? 0.6 : 0), 0) + (werte.length - 1) * 2.4;
        const stab = Math.min(8, (96 / Math.max(lang, 1)) * 1.4);
        el.style.setProperty("--einf-stab", stab.toFixed(2) + "rem");
        el.style.setProperty("--szene-stab", (stab / 8).toFixed(3));
        // hoehe (optional): Dicke der Stäbe in Einheiten des Abspielers (Einführung rem), z. B. so groß wie in den Häusern
        if (typeof b.hoehe === "number" && b.hoehe > 0 && b.hoehe <= 20) {
          el.style.setProperty("--einf-stab", b.hoehe + "rem");
          el.style.setProperty("--szene-perlen", String(b.hoehe));
        }
        for (const n of werte) {
          const st = document.createElement("ls-perlenstab");
          st.setAttribute("wert", String(n));
          el.appendChild(st);
        }
      } else if (b.zahl !== undefined) {
        el.classList.add("zahl");
        el.textContent = String(b.zahl);
      } else if (typeof b.objekt === "string" && /^[a-z][a-z0-9-]*$/.test(b.objekt)) {
        el.classList.add("objekt");
        if (typeof b.hoehe === "number" && b.hoehe > 0 && b.hoehe <= 30) el.style.setProperty("--einf-objekt", b.hoehe + "rem");
        const o = document.createElement("ls-objekt");
        o.setAttribute("art", b.objekt);
        if (typeof b.zustand === "string" && b.zustand) o.setAttribute("zustand", b.zustand);
        o.setAttribute("still", "");
        el.appendChild(o);
      } else if (Array.isArray(b.haeuser) && b.haeuser.length === 2) {
        el.classList.add("haeuser");
        b.haeuser.forEach((/** @type {unknown} */ n, /** @type {number} */ i) => {
          const haus = document.createElement("div");
          haus.className = "haus";
          const zu = b.zu === i;
          haus.innerHTML = hausSvg(i, zu);
          if (!zu && Number.isInteger(n) && /** @type {number} */ (n) >= 1 && /** @type {number} */ (n) <= 9) {
            const st = document.createElement("ls-perlenstab");
            st.setAttribute("wert", String(n));
            haus.appendChild(st);
          }
          haus.setAttribute("role", "img");
          haus.setAttribute("aria-label", zu ? "Haus mit Vorhang" : `Haus mit ${n} Perlen`);
          el.appendChild(haus);
        });
      } else if (Array.isArray(b.paare)) {
        el.classList.add("paare");
        const paare = b.paare.filter((/** @type {unknown} */ p) => Array.isArray(p) && p.length === 2 && p.every((n) => Number.isInteger(n) && n >= 1 && n <= 9));
        if (!paare.length) continue;
        const { gesamt, reihen } = paarLage(paare);
        // Breite einer Reihe in Stab-Höhen (ein Stab ist 1,4 Perlen hoch)
        el.style.setProperty("--paar-laenge", (gesamt / 1.4).toFixed(3));
        for (const r of reihen) {
          const reihe = document.createElement("div");
          reihe.className = "reihe";
          for (const [n, links] of /** @type {[number, number][]} */ ([[r.a, 0], [r.b, r.links]])) {
            const st = document.createElement("ls-perlenstab");
            st.setAttribute("wert", String(n));
            st.style.left = ((links / gesamt) * 100).toFixed(3) + "%";
            reihe.appendChild(st);
          }
          el.appendChild(reihe);
        }
      } else continue;
      buehne.appendChild(el);
    } catch (e) { /* kaputtes Bildelement: weglassen */ }
  }
  for (const [id, f] of vorher) if (!jetzt.has(id)) f.steuer.halt();
  return jetzt;
}
