// <ls-perlenkette reihe="7" pfeile="1 2 5" leer="6" verdeckt breite="96">
// <ls-perlenkette reihe="7" kurz="6" perle="1.4">
// Lernzeichen Perlenkette (Einmaleins; grundsaetze-bilder §4 M1–M3, M7; Christian 2026-11-14, Entwurf M37): zehn
// gleiche Perlenstäbchen zu je n Perlen hintereinander, in zwei Reihen zu fünf (beide von links nach rechts). Jedes
// Stäbchen sieht aus wie <ls-perlenstab> (Montessori-Farbe von n, jede Perle einzeln, Lücke und Marke nach der
// fünften), zwischen zwei Stäbchen ein Glied. Unter dem Ende eines Stäbchens hängt sein Pfeilchen (Montessori:
// Pfeilkärtchen) mit der Zahl k · n. Ein Stäbchen sind die Teile einer Gruppe; die Kette sind viele gleiche Gruppen.
// Geometrie ohne DOM: perlenkette() in perlen-geometrie.js.
//
// Attribute (alle zur Laufzeit änderbar; Listen sind Nummern der Stäbchen 1–10, durch Leerzeichen getrennt):
//   reihe     n (1–10); ungültig: nichts gezeichnet, einmal ins Protokoll
//   pfeile    Pfeilchen mit Zahl an diesen Stäbchen (k · n, Ziffern in Tinte, fett)
//   leer      Pfeilchen ohne Zahl (z. B. eine Aufgabe, die gerade noch einmal dran ist: nichts zum Ablesen)
//   markiert  Sonnenring um diese Pfeilchen (Hilfe: von hier aus rechnen)
//   hell      Sonnenring um diese Stäbchen (Hilfe: die Stäbchen zwischen Kernaufgabe und Ziel)
//   ring      Ring in Tinte weich um dieses Stäbchen (der Ort der Aufgabe, wenn die getippte Zahl nicht passt)
//   hohl      eine Zahl: hohles, gestricheltes Pfeilchen an ihrem Ort auf der Kette, eine Ebene tiefer
//             (die getippte Zahl, die nicht passt; liegt sie hinter dem Ende, steht es hinter der Kette)
//   verdeckt  Tuch über jedem Stäbchen (Stufe Vorstellung): Grenzen und Fünfermarke bleiben, Perlen nicht zählbar
//   kurz      Kurzkette (Vorratsliste): so viele Stäbchen als schlichte Stäbe in der Farbe von n, ohne Einzelperlen
//             und Pfeilchen (wiedererkennen, nicht zählen), in zwei Reihen zu fünf wie die Kette. Gemeinsamer Maßstab:
//             Jeder Stab ist ein Fünftel von `breite` (abzüglich der Lücken), gleich für jedes n und jede Zahl; Zeilen
//             mit derselben `breite` sind also vergleichbar (die Länge zählt die Stäbchen, 1 · 10 ist ein Stab, 10 · 10
//             sind zehn). Die Lücke zwischen den Stäben ist fest (KURZ.luecke, mehrere Konturen breit), die Höhe immer
//             zwei Reihen (Zeilen bleiben gleich hoch).
//   breite    verfügbare Breite in rem (Vorgabe 96, bei `kurz` 14 = fünf Stäbe); die Perlengröße folgt daraus, höchstens `perle`
//   hoehe     verfügbare Höhe in rem (ohne: beliebig); die Perlen werden so klein, dass die Kette hineinpasst
//   perle     größter Perlendurchmesser in rem (Vorgabe 4,4; bei `kurz` 1,6 = Höhe eines Stabs)
// Methoden: stabPunkt(k) → Mitte von Stäbchen k im Fenster (px). huepfe(bis, { wert, schritt, ms }) → { fertig, ueberspringe }: das Zählpfeilchen hüpft vom Anfang der
//   Kette Stäbchen für Stäbchen bis zum Ende von Stäbchen `bis` und bleibt dort (mit `wert` als Zahl, sonst leer);
//   schritt(k) nach jeder Landung (z. B. eine Packung fliegt). Bei prefers-reduced-motion sofort am Ende.
//   zeigerWeg(): das Zählpfeilchen verschwinden lassen. Eigenschaft `zeiger` ({ bis, wert } | null).
// Flach (6.4: nichts daran ist drückbar), still (B3): bewegt sich nur in huepfe(), der Folge einer Eingabe.
// Kein Ton; der Name „Perlenkette 7“ steht als aria-label am Bild.

import { protokoll } from "../kern/protokoll.js";
import { TOKENS, LERNFARBE, FARBE, definiere } from "./stil.js";
import { perlenkette, wertAus, DRAHT, GLIED } from "./perlen-geometrie.js";

/** Pfeilchen in rem: Abstand unter den Perlen, Spitze, Kärtchen, Schrift, zweite Ebene (hohl), Abstand der Reihen. */
const PFEIL = { abstand: 0.5, spitze: 1.1, hoehe: 4.8, schrift: 3.4, breite: 5.6, ebene: 5.4, radius: 1.2 };
const REIHEN_ABSTAND = 1.0;
/** Kurzkette in rem: Lücke zwischen zwei Stäben (gut drei Konturen), Abstand der beiden Reihen, Kontur. */
const KURZ = { luecke: 0.8, reihen: 0.5, kontur: 0.25, jeReihe: 5 };
const ZONE = PFEIL.abstand + PFEIL.spitze + PFEIL.hoehe + PFEIL.ebene;
const RAND = 3.4;

const TOKEN_CSS = Object.entries(TOKENS).map(([name, wert]) => `${name}: ${wert};`).join(" ");

const CSS = `
:host { ${TOKEN_CSS} display: inline-block; vertical-align: middle; line-height: 0; }
:host([hidden]) { display: none; }
svg { display: block; overflow: visible; }
svg.leer { display: none; }
text { font-family: "Andika", sans-serif; font-weight: 700; fill: var(--ls-tinte); }
`;

/** @param {number} x */
const z = (x) => String(Math.round(x * 1000) / 1000);
/** @param {string | null} roh @returns {number[]} */
const liste = (roh) => (roh ?? "").split(/[\s,]+/).filter(Boolean).map(Number).filter((k) => Number.isInteger(k) && k >= 1 && k <= 10);
const wenigBewegung = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

export class LsPerlenkette extends HTMLElement {
  static observedAttributes = ["reihe", "pfeile", "leer", "markiert", "hell", "ring", "hohl", "verdeckt", "kurz", "breite", "hoehe", "perle"];

  constructor() {
    super();
    const wurzel = this.attachShadow({ mode: "open" });
    wurzel.innerHTML = `<style>${CSS}</style><svg xmlns="http://www.w3.org/2000/svg"></svg>`;
    this.svg = /** @type {SVGSVGElement} */ (wurzel.querySelector("svg"));
    this.gemeldet = false;
    /** Das Zählpfeilchen nach dem Hüpfen. @type {{ bis: number, wert: number | null } | null} */
    this.zeiger = null;
    /** Laufendes Hüpfen. @type {{ ueberspringe: () => void } | null} */
    this.laeuft = null;
    /** Maße der letzten Zeichnung (rem). */
    this.mass = { d: 1, links: 0, reihenAbstand: 0, perlenHoehe: 0 };
    this.zeichne();
  }

  /** @returns {number | null} n der Kette */
  get reihe() {
    return wertAus(this.getAttribute("reihe"));
  }

  attributeChangedCallback() {
    this.laeuft?.ueberspringe();
    this.zeichne();
  }

  connectedCallback() {
    if (!this.hasAttribute("reihe")) this.melde("keine Reihe");
  }

  /** @param {string} grund */
  melde(grund) {
    if (this.gemeldet) return;
    this.gemeldet = true;
    protokoll(`ls-perlenkette: ${grund}`);
  }

  /** Geometrie und Maße für die aktuellen Attribute, oder null. */
  geometrie() {
    const kurz = this.hasAttribute("kurz") ? wertAus(this.getAttribute("kurz")) : null;
    const k = kurz ? perlenkette(this.getAttribute("reihe"), { staebchen: kurz, jeReihe: KURZ.jeReihe }) : perlenkette(this.getAttribute("reihe"));
    if (!k) return null;
    const zahl = (/** @type {string} */ name, /** @type {number} */ vorgabe) => {
      const v = Number(this.getAttribute(name));
      return Number.isFinite(v) && v > 0 ? v : vorgabe;
    };
    if (kurz) {
      // Ein Stab ist ein Fünftel der Breite (ohne Lücken), für jedes n gleich: gemeinsamer Maßstab der Liste.
      const breite = zahl("breite", 14);
      const stab = Math.max(0.5, (breite - (KURZ.jeReihe - 1) * KURZ.luecke) / KURZ.jeReihe);
      return { k, kurz, d: 1, stab, breite, links: 0, rechts: 0, perlenHoehe: zahl("perle", 1.6), reihenAbstand: zahl("perle", 1.6) + KURZ.reihen };
    }
    const breite = zahl("breite", 96);
    // Platz für das Zählpfeilchen vor der Kette und ein hohles Pfeilchen hinter dem Ende (1,5 Glieder).
    const hoch = zahl("hoehe", Infinity);
    const nachHoehe = (hoch - k.reihen * (ZONE + REIHEN_ABSTAND) + REIHEN_ABSTAND) / (k.reihen * k.hoehe);
    const d = Math.max(0.6, Math.min(zahl("perle", 4.4), (breite - 2 * RAND) / (k.breite + 1.5 * GLIED), nachHoehe));
    const perlenHoehe = k.hoehe * d;
    return { k, kurz, d, links: RAND, rechts: RAND + 1.5 * GLIED * d, perlenHoehe, reihenAbstand: perlenHoehe + ZONE + REIHEN_ABSTAND };
  }

  zeichne() {
    const g = this.geometrie();
    const svg = this.svg;
    if (!g) {
      const roh = this.getAttribute("reihe");
      if (roh !== null) this.melde(`ungültige Reihe ${roh}`);
      svg.setAttribute("class", "leer");
      svg.innerHTML = "";
      return;
    }
    const { k, kurz, d, links, rechts, perlenHoehe, reihenAbstand } = g;
    this.mass = { d, links, reihenAbstand, perlenHoehe };
    const verdeckt = this.hasAttribute("verdeckt");
    const farbe = LERNFARBE.perle[/** @type {keyof typeof LERNFARBE.perle} */ (k.n)];
    const X = (/** @type {number} */ x) => links + x * d;
    const Y = (/** @type {number} */ reihe, /** @type {number} */ q) => reihe * reihenAbstand + q * d;
    const mitte = k.hoehe / 2;
    const hell = liste(this.getAttribute("hell"));
    const ring = liste(this.getAttribute("ring"));

    let inhalt = "";
    for (const s of k.staebchen) {
      // Glied zum nächsten Stäbchen derselben Reihe.
      const naechster = k.staebchen[s.nr];
      if (naechster && naechster.reihe === s.reihe && !kurz) {
        inhalt += `<line x1="${z(X(s.x1) - 0.1 * d)}" y1="${z(Y(s.reihe, mitte))}" x2="${z(X(naechster.x0) + 0.1 * d)}" y2="${z(Y(s.reihe, mitte))}" stroke="${FARBE.tinteWeich}" stroke-width="${z(0.35)}" stroke-dasharray="${z(0.3)} ${z(0.35)}" stroke-linecap="round"/>`;
      }
      const um = (/** @type {number} */ rand) => `x="${z(X(s.x0) - rand)}" y="${z(Y(s.reihe, 0) - rand)}" width="${z((s.x1 - s.x0) * d + 2 * rand)}" height="${z(perlenHoehe + 2 * rand)}" rx="${z(perlenHoehe / 2 + rand)}"`;
      if (hell.includes(s.nr)) inhalt += `<rect ${um(0.9)} fill="none" stroke="${FARBE.sonne}" stroke-width="0.8"/><rect ${um(1.35)} fill="none" stroke="${FARBE.tinte}" stroke-width="0.3"/>`;
      if (ring.includes(s.nr)) inhalt += `<rect class="ring" ${um(0.7)} fill="none" stroke="${FARBE.tinteWeich}" stroke-width="0.5"/>`;
      const marke = s.marke === null ? "" : `<line x1="${z(X(s.marke))}" y1="${z(Y(s.reihe, 0.06))}" x2="${z(X(s.marke))}" y2="${z(Y(s.reihe, k.hoehe - 0.06))}" stroke="${FARBE.tinte}" stroke-width="0.45" stroke-linecap="round"/>`;
      if (kurz) {
        const stab = /** @type {number} */ (g.stab);
        const x = ((s.nr - 1) % KURZ.jeReihe) * (stab + KURZ.luecke) + KURZ.kontur / 2;
        const y = s.reihe * reihenAbstand + KURZ.kontur / 2;
        inhalt += `<rect x="${z(x)}" y="${z(y)}" width="${z(stab - KURZ.kontur)}" height="${z(perlenHoehe - KURZ.kontur)}" rx="${z(Math.min(0.4, (perlenHoehe - KURZ.kontur) / 2))}" fill="${farbe}" stroke="${FARBE.tinte}" stroke-width="${KURZ.kontur}"/>`;
      } else if (verdeckt) {
        const dk = 1.1;
        inhalt += `<rect x="${z(X(s.x0))}" y="${z(Y(s.reihe, mitte - dk / 2))}" width="${z((s.x1 - s.x0) * d)}" height="${z(dk * d)}" rx="${z((dk * d) / 2)}" fill="${FARBE.nebel}" stroke="${FARBE.tinte}" stroke-width="0.3"/>${marke}`;
      } else {
        inhalt += `<rect x="${z(X(s.x0))}" y="${z(Y(s.reihe, mitte - DRAHT / 2))}" width="${z((s.x1 - s.x0) * d)}" height="${z(DRAHT * d)}" rx="${z((DRAHT * d) / 2)}" fill="${LERNFARBE.draht}"/>`;
        for (const p of s.perlen) inhalt += `<circle cx="${z(X(p))}" cy="${z(Y(s.reihe, mitte))}" r="${z(d / 2)}" fill="${farbe}" stroke="${FARBE.tinte}" stroke-width="${z(Math.min(0.3, d * 0.1))}"/>`;
        inhalt += marke;
      }
    }

    if (!kurz) {
      const markiert = liste(this.getAttribute("markiert"));
      const mitZahl = liste(this.getAttribute("pfeile"));
      const ohneZahl = liste(this.getAttribute("leer"));
      const zeiger = this.zeiger;
      // Das hohle Pfeilchen zuerst: liegt es unter einem anderen, verdeckt dessen Kärtchen seinen Stiel.
      const hohl = this.getAttribute("hohl");
      if (hohl !== null && /^\d{1,3}$/.test(hohl.trim())) {
        const zahl = Number(hohl);
        const o = k.ort(zahl);
        inhalt += `<g transform="translate(${z(X(o.x))} ${z(this.spitzeY(o.reihe))})">${pfeil(String(zahl), { hohl: true, ebene: 1 })}</g>`;
      }
      for (const s of k.staebchen) {
        const istZeiger = zeiger?.bis === s.nr;
        if (istZeiger) continue;
        if (mitZahl.includes(s.nr)) inhalt += this.pfeilAm(s.nr, s.nr * k.n, { markiert: markiert.includes(s.nr) });
        else if (ohneZahl.includes(s.nr)) inhalt += this.pfeilAm(s.nr, null, { markiert: markiert.includes(s.nr) });
      }
      if (zeiger) inhalt += this.pfeilAm(zeiger.bis, zeiger.wert, { markiert: markiert.includes(zeiger.bis) });
    }

    const breite = kurz ? /** @type {number} */ (g.breite) : links + k.breite * d + rechts;
    const hoehe = kurz ? 2 * reihenAbstand - KURZ.reihen : k.reihen * reihenAbstand - REIHEN_ABSTAND;
    svg.setAttribute("viewBox", `0 0 ${z(breite)} ${z(hoehe)}`);
    svg.setAttribute("width", `${z(breite)}rem`);
    svg.setAttribute("height", `${z(hoehe)}rem`);
    svg.style.width = `${z(breite)}rem`;
    svg.style.height = `${z(hoehe)}rem`;
    svg.setAttribute("class", "kette");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", verdeckt ? "Perlenkette" : `Perlenkette ${k.n}`);
    svg.innerHTML = `${inhalt}<g class="lauf"></g>`;
  }

  /** y der Pfeilspitze unter einer Reihe (rem). @param {number} reihe */
  spitzeY(reihe) {
    return reihe * this.mass.reihenAbstand + this.mass.perlenHoehe + PFEIL.abstand;
  }

  /**
   * Pfeilchen am Ende von Stäbchen k (SVG-Text).
   * @param {number} k @param {number | null} wert @param {{ markiert?: boolean }} [o]
   */
  pfeilAm(k, wert, o = {}) {
    const g = this.geometrie();
    if (!g) return "";
    const ort = g.k.ort(k * g.k.n);
    return `<g class="pfeil" data-stab="${k}" transform="translate(${z(this.mass.links + ort.x * this.mass.d)} ${z(this.spitzeY(ort.reihe))})">${pfeil(wert === null ? "" : String(wert), o)}</g>`;
  }

  /**
   * Das Zählpfeilchen hüpft vom Anfang der Kette bis ans Ende von Stäbchen `bis`.
   * @param {number} bis 1 … 10
   * @param {{ wert?: number | null, schritt?: (k: number) => void, ms?: number }} [o]
   * @returns {{ fertig: Promise<void>, ueberspringe: () => void }}
   */
  huepfe(bis, { wert = null, schritt = () => {}, ms = 240 } = {}) {
    this.laeuft?.ueberspringe();
    const g = this.geometrie();
    const ziel = Math.max(1, Math.min(10, Math.round(bis)));
    let gesprungen = 0;
    let vorbei = false;
    const ende = () => {
      if (vorbei) return;
      vorbei = true;
      while (gesprungen < ziel) schritt(++gesprungen);
      this.laeuft = null;
      this.zeiger = { bis: ziel, wert };
      this.zeichne();
    };
    if (!g || g.kurz || wenigBewegung()) {
      ende();
      return { fertig: Promise.resolve(), ueberspringe: () => {} };
    }
    const lauf = /** @type {SVGGElement} */ (this.svg.querySelector("g.lauf"));
    const punkt = (/** @type {number} */ k) => {
      const o = g.k.ort(k * g.k.n);
      return { x: this.mass.links + o.x * this.mass.d, y: this.spitzeY(o.reihe) };
    };
    lauf.innerHTML = `<g>${pfeil(wert === null ? "" : String(wert))}</g>`;
    const teil = /** @type {SVGGElement} */ (lauf.firstElementChild);
    const start = punkt(0);
    teil.setAttribute("transform", `translate(${z(start.x)} ${z(start.y)})`);
    /** @type {Animation | null} */
    let jetzt = null;
    const fertig = (async () => {
      let von = start;
      for (let k = 1; k <= ziel && !vorbei; k++) {
        const nach = punkt(k);
        const hoch = Math.min(4, 1.5 + Math.abs(nach.x - von.x) * 0.15);
        const mx = (von.x + nach.x) / 2;
        const my = Math.min(von.y, nach.y) - hoch;
        jetzt = teil.animate(
          [{ transform: `translate(${z(von.x)}px, ${z(von.y)}px)` }, { transform: `translate(${z(mx)}px, ${z(my)}px)` }, { transform: `translate(${z(nach.x)}px, ${z(nach.y)}px)` }],
          { duration: ms, easing: "ease-in-out", fill: "forwards" },
        );
        await jetzt.finished.catch(() => undefined);
        if (vorbei) break;
        gesprungen = k;
        schritt(k);
        von = nach;
      }
      ende();
    })();
    const steuerung = {
      ueberspringe: () => {
        jetzt?.cancel();
        ende();
      },
    };
    this.laeuft = steuerung;
    return { fertig, ueberspringe: steuerung.ueberspringe };
  }

  /**
   * Mitte von Stäbchen k im Fenster (px), z. B. als Start einer Packung, die von dort in den Korb fliegt.
   * @param {number} k 1 … 10 @returns {{ x: number, y: number } | null}
   */
  stabPunkt(k) {
    const g = this.geometrie();
    const s = g?.k.staebchen[k - 1];
    const box = this.svg.viewBox.baseVal;
    if (!g || !s || !box?.width) return null;
    const r = this.svg.getBoundingClientRect();
    const f = r.width / box.width;
    return { x: r.left + (this.mass.links + ((s.x0 + s.x1) / 2) * this.mass.d) * f, y: r.top + (s.reihe * this.mass.reihenAbstand + this.mass.perlenHoehe / 2) * f };
  }

  /** Das Zählpfeilchen verschwindet (die Pfeilchen aus `pfeile` bleiben). */
  zeigerWeg() {
    this.laeuft?.ueberspringe();
    this.zeiger = null;
    this.zeichne();
  }
}

/**
 * Ein Pfeilchen mit der Spitze bei (0, 0), das Kärtchen darunter (SVG-Text, rem).
 * @param {string} text leer = Pfeilchen ohne Zahl
 * @param {{ hohl?: boolean, ebene?: number, markiert?: boolean }} [o]
 */
function pfeil(text, { hohl = false, ebene = 0, markiert = false } = {}) {
  const b = Math.max(PFEIL.breite, text.length * PFEIL.schrift * 0.62 + 2);
  const oben = PFEIL.spitze + ebene * PFEIL.ebene;
  const strich = hohl ? ` stroke-dasharray="0.9 0.6"` : "";
  const flaeche = hohl ? FARBE.nebel : FARBE.papier;
  let s = "";
  if (ebene) s += `<line x1="0" y1="${z(PFEIL.spitze)}" x2="0" y2="${z(oben)}" stroke="${FARBE.tinte}" stroke-width="0.3"${strich}/>`;
  s += `<path d="M0 0 L${z(PFEIL.spitze * 0.85)} ${z(PFEIL.spitze)} L${z(-PFEIL.spitze * 0.85)} ${z(PFEIL.spitze)} Z" fill="${FARBE.tinte}"/>`;
  if (markiert) s += `<rect x="${z(-b / 2 - 1)}" y="${z(oben - 1)}" width="${z(b + 2)}" height="${z(PFEIL.hoehe + 2)}" rx="${z(PFEIL.radius + 1)}" fill="none" stroke="${FARBE.sonne}" stroke-width="0.8"/>`;
  s += `<rect x="${z(-b / 2)}" y="${z(oben)}" width="${z(b)}" height="${z(PFEIL.hoehe)}" rx="${PFEIL.radius}" fill="${flaeche}" stroke="${FARBE.tinte}" stroke-width="0.3"${strich}/>`;
  if (text) s += `<text x="0" y="${z(oben + PFEIL.hoehe / 2 + PFEIL.schrift * 0.35)}" font-size="${PFEIL.schrift}" text-anchor="middle">${text}</text>`;
  return s;
}

definiere("ls-perlenkette", LsPerlenkette);
