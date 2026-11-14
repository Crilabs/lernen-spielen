// Ziehen mit Tipp-Alternative (docs/bedienung.md §5).
//
//   const loesen = ziehbar(teil, { ziele: [luecke1, luecke2], beimAblegen(teil, ziel) {
//     if (passt(teil, ziel)) setze(teil, ziel); else zurueck(teil);
//   } });
//
// Ziehen: Teil mit dem Finger auf ein Ziel ziehen (Pointer Events, setPointerCapture). Erst ab 1 rem
// Bewegung ist es Ziehen, sonst ein Tippen.
// Tippen: Teil antippen → es hebt sich an (Klasse `angehoben`, Sonnenring) → Ziel antippen. Ein zweites
// Antippen des Teils legt es zurück, ein anderes Teil antippen wechselt die Auswahl.
// Tastatur: Enter oder Leertaste auf dem Teil hebt es an, auf einem Ziel legt es ab; Escape setzt es ab.
//
// Solange ein Teil angehoben ist oder gezogen wird, tragen seine Ziele `ziel-frei` (ruhige Naht-Linie),
// das Ziel unter dem Finger zusätzlich `ziel-ueber`. Beim Ziehen trägt das Teil `gezogen`, beim Drücken
// `gedrueckt`. Das Aussehen steht in seite.css (`.teil`); hier werden nur Klassen und `translate` gesetzt.
//
// Ob es passt, entscheidet das Spiel in beimAblegen und ruft zurueck(teil) oder setze(teil, ziel).
// zurueck bewegt das Teil ruhig zurück (0,3 s, bei wenig Bewegung sofort), nie reizvoller als ein
// Treffer (B5). Die Zustandslogik steht ohne DOM in ziehen-zustand.js.

import { RUHE, schritt } from "./ziehen-zustand.js";

/** Dauer der Rückkehr und des Einsetzens in ms (kurz, B6). */
const DAUER = 300;

/**
 * @typedef {Iterable<Element> | (() => Iterable<Element>)} Ziele
 * @typedef {{ ziele: Ziele, beimAblegen?: (teil: HTMLElement, ziel: Element) => void }} Optionen
 * @typedef {import("./ziehen-zustand.js").Folge<HTMLElement, Element>} Folge
 */

/** @type {import("./ziehen-zustand.js").Zustand<HTMLElement, Element>} */
let zustand = RUHE;
/** @type {WeakMap<Element, Optionen>} */
const teile = new WeakMap();
/** Ziele, an denen schon ein Hörer hängt. @type {WeakSet<Element>} */
const bekannteZiele = new WeakSet();
/** Ziele, die gerade markiert sind. @type {Set<Element>} */
const markiert = new Set();

/**
 * Macht ein Element ziehbar (und antippbar).
 * @param {HTMLElement} element
 * @param {Optionen} optionen
 * @returns {() => void} löst das Element wieder
 */
export function ziehbar(element, optionen) {
  teile.set(element, optionen);
  element.style.touchAction = "none";
  element.style.userSelect = "none";
  element.style.setProperty("-webkit-user-select", "none");
  if (!istFokussierbar(element)) element.tabIndex = 0;
  if (!(element instanceof HTMLButtonElement) && !element.hasAttribute("role")) element.setAttribute("role", "button");
  element.setAttribute("aria-pressed", "false");
  for (const z of zieleVon(element)) beobachteZiel(z);

  /** @type {{ id: number, x: number, y: number, aktiv: boolean } | null} */
  let griff = null;

  /** @param {PointerEvent} e */
  const unten = (e) => {
    if (griff || !e.isPrimary || e.button !== 0 || zustand.phase === "ziehen") return;
    griff = { id: e.pointerId, x: e.clientX, y: e.clientY, aktiv: false };
    try {
      element.setPointerCapture(e.pointerId);
    } catch {
      // Ohne Capture (synthetische Ereignisse) läuft alles weiter über das Element selbst.
    }
    element.classList.add("gedrueckt");
  };
  /** @param {PointerEvent} e */
  const bewegt = (e) => {
    if (!griff || e.pointerId !== griff.id) return;
    const dx = e.clientX - griff.x;
    const dy = e.clientY - griff.y;
    if (!griff.aktiv) {
      if (Math.hypot(dx, dy) <= remPx()) return;
      griff.aktiv = true;
      element.classList.remove("gedrueckt");
      weiter({ art: "ziehe", teil: element });
    }
    element.style.translate = `${dx}px ${dy}px`;
    const ueber = zielUnter(element, e.clientX, e.clientY);
    for (const z of markiert) z.classList.toggle("ziel-ueber", z === ueber);
  };
  /** @param {PointerEvent} e */
  const oben = (e) => {
    if (!griff || e.pointerId !== griff.id) return;
    const war = griff;
    griff = null;
    element.classList.remove("gedrueckt");
    if (war.aktiv) weiter({ art: "loslassen", ziel: zielUnter(element, e.clientX, e.clientY) });
    else weiter({ art: "tippe-teil", teil: element });
  };
  /** @param {PointerEvent} e */
  const abgebrochen = (e) => {
    if (!griff || e.pointerId !== griff.id) return;
    const war = griff;
    griff = null;
    element.classList.remove("gedrueckt");
    if (war.aktiv) weiter({ art: "abbrechen" });
  };
  /** @param {KeyboardEvent} e */
  const taste = (e) => {
    if (e.target !== element) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      weiter({ art: "tippe-teil", teil: element });
    } else if (e.key === "Escape" && zustand.teil === element) {
      weiter({ art: "abbrechen" });
    }
  };

  element.addEventListener("pointerdown", unten);
  element.addEventListener("pointermove", bewegt);
  element.addEventListener("pointerup", oben);
  element.addEventListener("pointercancel", abgebrochen);
  element.addEventListener("keydown", taste);

  return () => {
    if (zustand.teil === element) weiter({ art: "abbrechen" });
    element.removeEventListener("pointerdown", unten);
    element.removeEventListener("pointermove", bewegt);
    element.removeEventListener("pointerup", oben);
    element.removeEventListener("pointercancel", abgebrochen);
    element.removeEventListener("keydown", taste);
    element.removeAttribute("aria-pressed");
    teile.delete(element);
  };
}

/**
 * Teil kehrt an seinen Platz zurück: kurze, ruhige Bewegung, bei wenig Bewegung sofort.
 * @param {HTMLElement} teil
 * @returns {void}
 */
export function zurueck(teil) {
  loese(teil);
  const verschoben = teil.style.translate !== "" && !/^(none|0px( 0px)?)$/.test(teil.style.translate);
  if (!verschoben || wenigBewegung()) {
    teil.style.translate = "";
    return;
  }
  gleite(teil, teil.style.translate);
}

/**
 * Setzt das Teil ins Ziel (als letztes Kind). Es gleitet von dort, wo es war, an seinen neuen Platz.
 * @param {HTMLElement} teil
 * @param {Element} ziel
 * @returns {void}
 */
export function setze(teil, ziel) {
  const vor = teil.getBoundingClientRect();
  loese(teil);
  teil.style.translate = "";
  ziel.append(teil);
  if (wenigBewegung()) return;
  const nach = teil.getBoundingClientRect();
  const dx = vor.left - nach.left;
  const dy = vor.top - nach.top;
  if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
  gleite(teil, `${dx}px ${dy}px`);
}

// --- Ausführen ---------------------------------------------------------------------------------

/** @param {import("./ziehen-zustand.js").Ereignis<HTMLElement, Element>} e */
function weiter(e) {
  fuehreAus(schritt(zustand, e));
}

/** @param {{ zustand: import("./ziehen-zustand.js").Zustand<HTMLElement, Element>, folgen: Folge[] }} r */
function fuehreAus(r) {
  zustand = r.zustand;
  for (const f of r.folgen) {
    const teil = f.teil;
    switch (f.art) {
      case "hebe":
        teil.style.transition = "";
        teil.classList.add("angehoben");
        teil.setAttribute("aria-pressed", "true");
        markiere(teil);
        break;
      case "senke":
        teil.classList.remove("angehoben");
        teil.setAttribute("aria-pressed", "false");
        markiere(null);
        break;
      case "greife":
        teil.style.transition = "none";
        teil.classList.add("gezogen");
        markiere(teil);
        break;
      case "ablegen": {
        teil.classList.remove("gezogen");
        markiere(null);
        const beimAblegen = teile.get(teil)?.beimAblegen;
        if (beimAblegen) beimAblegen(teil, f.ziel);
        else zurueck(teil);
        break;
      }
      case "zurueck":
        zurueck(teil);
        break;
    }
  }
}

/**
 * Nimmt das Teil aus der Hand (falls es darin ist) und entfernt alle Zustandsklassen.
 * @param {HTMLElement} teil
 */
function loese(teil) {
  if (zustand.teil === teil) {
    zustand = RUHE;
    markiere(null);
  }
  teil.classList.remove("angehoben", "gezogen", "gedrueckt");
  if (teile.has(teil)) teil.setAttribute("aria-pressed", "false");
}

/**
 * Gleitet von `von` (translate) nach 0.
 * @param {HTMLElement} teil
 * @param {string} von
 */
function gleite(teil, von) {
  teil.style.transition = "none";
  teil.style.translate = von;
  teil.getBoundingClientRect();
  teil.style.transition = `translate ${DAUER}ms ease-out`;
  teil.style.translate = "0px 0px";
  const fertig = () => {
    teil.style.transition = "";
    if (/^0px( 0px)?$/.test(teil.style.translate)) teil.style.translate = "";
  };
  teil.addEventListener("transitionend", fertig, { once: true });
  setTimeout(fertig, DAUER + 50);
}

/**
 * Markiert die Ziele eines Teils als frei (oder hebt die Markierung auf).
 * @param {HTMLElement | null} teil
 */
function markiere(teil) {
  for (const z of markiert) {
    z.classList.remove("ziel-frei", "ziel-ueber");
    if (z instanceof HTMLElement && z.dataset.lsTabindex === "") {
      z.removeAttribute("tabindex");
      delete z.dataset.lsTabindex;
    }
  }
  markiert.clear();
  if (!teil) return;
  for (const z of zieleVon(teil)) {
    beobachteZiel(z);
    z.classList.add("ziel-frei");
    if (z instanceof HTMLElement && !istFokussierbar(z)) {
      z.tabIndex = 0;
      z.dataset.lsTabindex = "";
    }
    markiert.add(z);
  }
}

// --- Ziele -------------------------------------------------------------------------------------

/** @param {Element} ziel */
function beobachteZiel(ziel) {
  if (bekannteZiele.has(ziel)) return;
  bekannteZiele.add(ziel);
  const antippen = () => {
    if (zustand.phase !== "angehoben" || !markiert.has(ziel)) return;
    weiter({ art: "tippe-ziel", ziel });
  };
  ziel.addEventListener("click", (e) => {
    // Ein Tippen auf ein Teil, das im Ziel liegt, gehört dem Teil.
    if (teilVon(e.target, ziel)) return;
    antippen();
  });
  ziel.addEventListener("keydown", (e) => {
    const k = /** @type {KeyboardEvent} */ (e);
    if (k.target !== ziel || (k.key !== "Enter" && k.key !== " ")) return;
    if (ziel instanceof HTMLButtonElement) return; // der Knopf meldet selbst click
    k.preventDefault();
    antippen();
  });
}

/**
 * Liegt `start` in einem ziehbaren Teil innerhalb von `grenze`?
 * @param {EventTarget | null} start
 * @param {Element} grenze
 */
function teilVon(start, grenze) {
  for (let el = start instanceof Element ? start : null; el && el !== grenze; el = el.parentElement) {
    if (teile.has(el)) return true;
  }
  return false;
}

/** @param {HTMLElement} teil @returns {Element[]} */
function zieleVon(teil) {
  const ziele = teile.get(teil)?.ziele;
  if (!ziele) return [];
  return [...(typeof ziele === "function" ? ziele() : ziele)];
}

/**
 * Das Ziel unter dem Punkt (über die Rechtecke, das gezogene Teil liegt ja darüber).
 * @param {HTMLElement} teil
 * @param {number} x
 * @param {number} y
 * @returns {Element | null}
 */
function zielUnter(teil, x, y) {
  for (const z of zieleVon(teil)) {
    const r = z.getBoundingClientRect();
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return z;
  }
  return null;
}

// --- Hilfen ------------------------------------------------------------------------------------

/** @param {HTMLElement} el */
function istFokussierbar(el) {
  return el.hasAttribute("tabindex") || el instanceof HTMLButtonElement || (el instanceof HTMLAnchorElement && el.hasAttribute("href"));
}

function remPx() {
  return parseFloat(getComputedStyle(document.documentElement).fontSize) || 10;
}

function wenigBewegung() {
  return globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}
