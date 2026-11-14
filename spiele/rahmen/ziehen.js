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
// Tastatur: Enter oder Leertaste auf dem Teil hebt es an, auf einem Ziel legt es ab; Escape (auf Teil oder
// Ziel) setzt es ab. Ziele werden dafür während der Auswahl fokussierbar, mit role="button" und einem Namen
// (Attribut `name` am Ziel, sonst „Ablage“). Nach dem Ablegen per Tastatur liegt der Fokus wieder am Teil.
//
// Solange ein Teil angehoben ist oder gezogen wird, tragen seine Ziele `ziel-frei` (ruhige Naht-Linie),
// das Ziel unter dem Finger zusätzlich `ziel-ueber`. Beim Ziehen trägt das Teil `gezogen`, beim Drücken
// `gedrueckt`. Das Aussehen steht in seite.css (`.teil`); hier werden nur Klassen und `translate` gesetzt.
//
// Ob es passt, entscheidet das Spiel in beimAblegen und ruft zurueck(teil) oder setze(teil, ziel, { vor }).
// Ein Teil, das während des Ziehens aus dem DOM genommen wird, gibt die Hand frei (sperrt nichts).
// zurueck bewegt das Teil ruhig zurück (0,3 s, bei wenig Bewegung sofort), nie reizvoller als ein
// Treffer (B5). Die Zustandslogik steht ohne DOM in ziehen-zustand.js.

import { RUHE, schritt } from "./ziehen-zustand.js";

/** Dauer der Rückkehr und des Einsetzens in ms (kurz, B6). */
const DAUER = 300;
/** Rückgabe, wenn nichts geliehen wurde. */
const NICHTS = () => {};

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
/** Ziele, die gerade als frei gezeigt werden, mit der Rückgabe des Geliehenen. @type {Map<Element, (() => void)[]>} */
const freieZiele = new Map();
/** Das Ablegen kam von der Tastatur: danach den Fokus ans Teil geben. */
let perTastatur = false;

// Wird das gezogene Teil aus dem DOM genommen, meldet der Browser den Verlust der Capture am Dokument.
globalThis.document?.addEventListener("lostpointercapture", () => {
  if (zustand.teil && !zustand.teil.isConnected) weiter({ art: "verloren" });
});

/**
 * Macht ein Element ziehbar (und antippbar).
 * @param {HTMLElement} element
 * @param {Optionen} optionen
 * @returns {() => void} löst das Element wieder und gibt zurück, was ziehbar gesetzt hat (tabindex, role,
 *   aria-pressed, touch-action, user-select); was das Element vorher selbst hatte, bleibt unberührt
 */
export function ziehbar(element, optionen) {
  teile.set(element, optionen);
  // Geliehen wie bei den Zielen (zeigeZiele): was das Element schon hatte, bleibt; loesen gibt den Rest zurück.
  /** @type {(() => void)[]} */
  const rueckgabe = [
    leiheStil(element, "touch-action", "none"),
    leiheStil(element, "user-select", "none"),
    leiheStil(element, "-webkit-user-select", "none"),
    istFokussierbar(element) ? NICHTS : leihe(element, "tabindex", "0"),
    element instanceof HTMLButtonElement ? NICHTS : leihe(element, "role", "button"),
    behalte(element, "aria-pressed"),
  ];
  element.setAttribute("aria-pressed", "false");
  for (const z of zieleVon(element)) beobachteZiel(z);

  /** @type {{ id: number, x: number, y: number, aktiv: boolean } | null} */
  let griff = null;

  /** @param {PointerEvent} e */
  const unten = (e) => {
    // Ist das Teil in der Hand verschwunden (aus dem DOM genommen), gibt es die Hand frei.
    if (zustand.teil && !zustand.teil.isConnected) weiter({ art: "verloren" });
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
    for (const z of freieZiele.keys()) z.classList.toggle("ziel-ueber", z === ueber);
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
  /** Capture verloren ohne pointerup (z. B. Element umgehängt): wie Abbrechen. @param {PointerEvent} e */
  const ohneCapture = (e) => {
    if (griff && e.pointerId === griff.id) abgebrochen(e);
  };

  element.addEventListener("pointerdown", unten);
  element.addEventListener("pointermove", bewegt);
  element.addEventListener("pointerup", oben);
  element.addEventListener("pointercancel", abgebrochen);
  element.addEventListener("lostpointercapture", ohneCapture);
  element.addEventListener("keydown", taste);

  return () => {
    if (zustand.teil === element) weiter({ art: "abbrechen" });
    element.removeEventListener("pointerdown", unten);
    element.removeEventListener("pointermove", bewegt);
    element.removeEventListener("pointerup", oben);
    element.removeEventListener("pointercancel", abgebrochen);
    element.removeEventListener("lostpointercapture", ohneCapture);
    element.removeEventListener("keydown", taste);
    element.classList.remove("angehoben", "gezogen", "gedrueckt");
    teile.delete(element);
    // Rückwärts wie ein Stapel: so stimmt es auch bei Alias-Eigenschaften (user-select / -webkit-user-select).
    for (const gib of rueckgabe.splice(0).reverse()) gib();
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
 * Setzt das Teil ins Ziel: vor den Knoten `vor` (ein Kind des Ziels), sonst ans Ende. So bestimmt das Spiel
 * die Reihenfolge. Das Teil gleitet von dort, wo es war, an seinen neuen Platz; hatte es den Fokus, behält es ihn.
 * @param {HTMLElement} teil
 * @param {Element} ziel
 * @param {{ vor?: Node | null }} [optionen]
 * @returns {void}
 */
export function setze(teil, ziel, { vor = null } = {}) {
  const alt = teil.getBoundingClientRect();
  const fokus = document.activeElement === teil;
  loese(teil);
  teil.style.translate = "";
  ziel.insertBefore(teil, vor);
  if (fokus && document.activeElement !== teil) teil.focus({ preventScroll: true });
  if (wenigBewegung()) return;
  const nach = teil.getBoundingClientRect();
  const dx = alt.left - nach.left;
  const dy = alt.top - nach.top;
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
  const tastatur = perTastatur;
  perTastatur = false;
  for (const f of r.folgen) {
    const teil = f.teil;
    switch (f.art) {
      case "hebe":
        teil.style.transition = "";
        teil.classList.add("angehoben");
        teil.setAttribute("aria-pressed", "true");
        zeigeZiele(teil);
        break;
      case "senke":
        teil.classList.remove("angehoben");
        teil.setAttribute("aria-pressed", "false");
        zeigeZiele(null);
        break;
      case "greife":
        teil.style.transition = "none";
        teil.classList.add("gezogen");
        zeigeZiele(teil);
        break;
      case "ablegen": {
        teil.classList.remove("gezogen");
        zeigeZiele(null);
        const beimAblegen = teile.get(teil)?.beimAblegen;
        if (beimAblegen) beimAblegen(teil, f.ziel);
        else zurueck(teil);
        if (tastatur && teil.isConnected) teil.focus({ preventScroll: true });
        break;
      }
      case "zurueck":
        zurueck(teil);
        break;
      case "vergiss":
        teil.classList.remove("angehoben", "gezogen", "gedrueckt");
        zeigeZiele(null);
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
    zeigeZiele(null);
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
  /** @param {Event} [e] */
  const fertig = (e) => {
    if (e && /** @type {TransitionEvent} */ (e).propertyName !== "translate") return;
    teil.removeEventListener("transitionend", fertig);
    teil.style.transition = "";
    if (/^0px( 0px)?$/.test(teil.style.translate)) teil.style.translate = "";
  };
  teil.addEventListener("transitionend", fertig);
  setTimeout(fertig, DAUER + 50);
}

// --- Geliehen: setzen, was fehlt, und genau das wieder zurückgeben -----------------------------

/**
 * Setzt `attr`, falls das Element es noch nicht hat. Liefert die Rückgabe (entfernt nur, was hier gesetzt wurde).
 * @param {Element} el @param {string} attr @param {string} wert
 * @returns {() => void}
 */
function leihe(el, attr, wert) {
  if (el.hasAttribute(attr)) return NICHTS;
  el.setAttribute(attr, wert);
  return () => el.removeAttribute(attr);
}

/**
 * Merkt sich den Wert von `attr` (oder dass es fehlte) und stellt ihn bei der Rückgabe wieder her.
 * @param {Element} el @param {string} attr
 * @returns {() => void}
 */
function behalte(el, attr) {
  const vorher = el.getAttribute(attr);
  return () => (vorher === null ? el.removeAttribute(attr) : el.setAttribute(attr, vorher));
}

/**
 * Setzt eine Inline-Stileigenschaft; die Rückgabe stellt den vorherigen Inline-Wert her (oder entfernt sie).
 * @param {HTMLElement} el @param {string} eigenschaft @param {string} wert
 * @returns {() => void}
 */
function leiheStil(el, eigenschaft, wert) {
  const vorher = el.style.getPropertyValue(eigenschaft);
  const prio = el.style.getPropertyPriority(eigenschaft);
  el.style.setProperty(eigenschaft, wert);
  return () => (vorher ? el.style.setProperty(eigenschaft, vorher, prio) : el.style.removeProperty(eigenschaft));
}

/**
 * Zeigt die Ziele eines Teils als frei (oder nimmt die Anzeige zurück). Ziele werden dabei fokussierbar,
 * mit role="button" und einem Namen; was sie vorher schon hatten, bleibt unberührt (geliehen).
 * @param {HTMLElement | null} teil
 */
function zeigeZiele(teil) {
  for (const [z, rueckgabe] of freieZiele) {
    z.classList.remove("ziel-frei", "ziel-ueber");
    for (const gib of rueckgabe.reverse()) gib();
  }
  freieZiele.clear();
  if (!teil) return;
  for (const z of zieleVon(teil)) {
    beobachteZiel(z);
    z.classList.add("ziel-frei");
    /** @type {(() => void)[]} */
    const rueckgabe = [];
    if (z instanceof HTMLElement) {
      if (!istFokussierbar(z)) rueckgabe.push(leihe(z, "tabindex", "0"));
      if (!(z instanceof HTMLButtonElement)) rueckgabe.push(leihe(z, "role", "button"));
      rueckgabe.push(leihe(z, "aria-label", z.getAttribute("name") || "Ablage"));
    }
    freieZiele.set(z, rueckgabe);
  }
}

// --- Ziele -------------------------------------------------------------------------------------

/** @param {Element} ziel */
function beobachteZiel(ziel) {
  if (bekannteZiele.has(ziel)) return;
  bekannteZiele.add(ziel);
  const antippen = () => {
    if (zustand.phase !== "angehoben" || !freieZiele.has(ziel)) return;
    weiter({ art: "tippe-ziel", ziel });
  };
  ziel.addEventListener("click", (e) => {
    // Ein Tippen auf ein Teil, das im Ziel liegt, gehört dem Teil.
    if (teilVon(e.target, ziel)) return;
    antippen();
  });
  ziel.addEventListener("keydown", (e) => {
    const k = /** @type {KeyboardEvent} */ (e);
    if (k.target !== ziel) return;
    if (k.key === "Escape" && zustand.phase === "angehoben" && freieZiele.has(ziel)) {
      const teil = zustand.teil;
      weiter({ art: "abbrechen" });
      if (teil.isConnected) teil.focus({ preventScroll: true });
      return;
    }
    if (k.key !== "Enter" && k.key !== " ") return;
    k.preventDefault();
    perTastatur = true;
    antippen();
    perTastatur = false;
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

/** Die Ziele eines Teils, soweit sie im Dokument sind. @param {HTMLElement} teil @returns {Element[]} */
function zieleVon(teil) {
  const ziele = teile.get(teil)?.ziele;
  if (!ziele) return [];
  return [...(typeof ziele === "function" ? ziele() : ziele)].filter((z) => z.isConnected);
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
