// Test-Schnittstelle für den Prüfstand (docs/spielentwicklung.md §4, tests/browser/durchspielen.mjs).
//
//   meldePruefSchnittstelle({ zuege, richtigerZug, zustand, orte, fuehreAus?, fehlversuche? })
//
// Nur im Testbetrieb (URL-Parameter `?pruefen` oder `window.__LS_PRUEFEN__ = true` vor dem Laden) steht danach
// `window.lsPruefen` bereit; sonst passiert nichts, das Kind merkt nie etwas davon. Das Spiel liefert:
//   zuege()        alle jetzt möglichen Züge, abstrakt: { art: "tippen", von } oder { art: "ziehen", von, nach }
//                  (Teil `von` auf Ziel `nach`; der Prüfstand führt das als Ziehen, als Tippen-Tippen oder per
//                  Tastatur aus). von/nach sind CSS-Selektoren; ` >>> ` steigt in einen Shadow-Baum
//                  („ls-pause >>> ls-knopf.weiter“). Sie gelten nur für den Augenblick: nach jedem Zug neu fragen.
//   richtigerZug() ein Zug, der die Aufgabe voranbringt (in der Pause: Weiter), oder null (Folge, Laden).
//   zustand()      { phase, aufgabe, nr, versuche, hilfeStufe, vorschau }; phase ∈ PHASEN.
//   orte           feste Bedienorte als Selektoren: { hilfe, haus, weiter }.
//   fehlversuche   optional, Vorgabe true. false nur, wenn in diesem Spiel kein Zug danebengehen kann (jeder Zug
//                  passt); dann prüft das ratende Kind die Hilfe-Leiter nicht (n/a) und B-Didaktik prüft die Angabe.
//   fuehreAus(zug) optional: führt einen Zug im Browser aus (Vorgabe: ausgelöste Zeiger- und Klickereignisse am
//                  Punkt, wie ein Finger; nötig in WebKit, siehe tests/browser/vorlage.spec.mjs). Ein Spiel mit
//                  eigener Mechanik (andere `art`) bringt sein eigenes mit.
// Dazu gibt die Schnittstelle selbst: ergebnisse (jedes ls-ergebnis), finde, ort, fokussiert, tippeBei.
//
// Kein Plattform-Zugriff (tests/plattform-regel.test.mjs): nur DOM und location.

/** Die Phasen eines Spiels. laden: vor der ersten Aufgabe und nach Weiter; fehler: „Das Spiel geht gerade nicht“. */
export const PHASEN = Object.freeze(["laden", "einfuehrung", "aufgabe", "folge", "pause", "fehler"]);

/**
 * @typedef {{ art: "tippen", von: string } | { art: "ziehen", von: string, nach: string } | { art: string, von?: string, nach?: string }} Zug
 * @typedef {{ phase: string, aufgabe: string | null, nr: number, versuche: number, hilfeStufe: number, vorschau: boolean, lernstufe?: string | null }} Zustand
 * @typedef {{ hilfe: string, haus: string, weiter: string }} Orte
 * @typedef {{ zuege: () => Zug[], richtigerZug: () => Zug | null, zustand: () => Zustand, orte?: Orte,
 *   fuehreAus?: (zug: Zug) => Promise<void>, fehlversuche?: boolean }} Spielseite
 */

/**
 * Läuft die Seite im Testbetrieb?
 * @param {any} [umgebung] globalThis (im Browser window)
 */
export function testbetrieb(umgebung = globalThis) {
  if (umgebung?.__LS_PRUEFEN__ === true) return true;
  const suche = umgebung?.location?.search;
  return typeof suche === "string" && new URLSearchParams(suche).has("pruefen");
}

/**
 * Meldet die Schnittstelle als `lsPruefen` an, nur im Testbetrieb.
 * @param {Spielseite} spiel
 * @param {any} [umgebung]
 */
export function meldePruefSchnittstelle(spiel, umgebung = globalThis) {
  if (!testbetrieb(umgebung)) return null;
  /** @type {any[]} */
  const ergebnisse = [];
  const s = {
    version: 1,
    zuege: spiel.zuege,
    richtigerZug: spiel.richtigerZug,
    zustand: spiel.zustand,
    orte: spiel.orte ?? null,
    fehlversuche: spiel.fehlversuche !== false,
    fuehreAus: spiel.fuehreAus ?? fuehreAus,
    ergebnisse,
    finde,
    ort,
    fokussiert,
    tippeBei,
  };
  umgebung.document?.addEventListener("ls-ergebnis", (/** @type {any} */ e) => ergebnisse.push(e.detail));
  umgebung.lsPruefen = s;
  return s;
}

// --- Selektoren über Shadow-Grenzen ------------------------------------------------------------

/**
 * Sucht ein Element; ` >>> ` steigt in den Shadow-Baum des links gefundenen Elements.
 * @param {string} selektor
 * @param {ParentNode} [wurzel]
 * @returns {Element | null}
 */
export function finde(selektor, wurzel = document) {
  /** @type {any} */
  let hier = wurzel;
  /** @type {Element | null} */
  let el = null;
  for (const teil of selektor.split(">>>").map((t) => t.trim())) {
    if (!hier) return null;
    el = hier.querySelector(teil);
    if (!el) return null;
    hier = /** @type {any} */ (el).shadowRoot;
  }
  return el;
}

/**
 * Ein Selektor, der jetzt genau dieses Element trifft (Kennung oder nth-child-Pfad, über Shadow-Grenzen).
 * @param {Element} el
 * @returns {string}
 */
export function selektor(el) {
  /** @type {string[]} je Baum ein Pfad, außen zuerst */
  const baeume = [];
  /** @type {Element | null} */
  let k = el;
  while (k) {
    const wurzel = /** @type {any} */ (k.getRootNode());
    /** @type {string[]} */
    const pfad = [];
    while (k) {
      if (k.id && wurzel.getElementById?.(k.id) === k) {
        pfad.unshift(`#${CSS.escape(k.id)}`);
        break;
      }
      const geschwister = k.parentNode ? [.../** @type {ParentNode} */ (k.parentNode).children] : [k];
      pfad.unshift(`${k.localName}:nth-child(${geschwister.indexOf(k) + 1})`);
      if (!k.parentElement) break;
      k = k.parentElement;
    }
    baeume.unshift(pfad.join(" > "));
    k = wurzel.host ?? null;
  }
  return baeume.join(" >>> ");
}

// --- Orte, Treffer, Fokus ------------------------------------------------------------------------

/** Das tiefste Element unter dem Punkt (durch offene Shadow-Bäume). @param {number} x @param {number} y */
export function tiefBei(x, y) {
  /** @type {Element | null} */
  let el = document.elementFromPoint(x, y);
  while (el?.shadowRoot) {
    const innen = el.shadowRoot.elementFromPoint(x, y);
    if (!innen || innen === el) break;
    el = innen;
  }
  return el;
}

/** Liegt `el` in `ziel` (auch über Shadow-Grenzen)? @param {Element} ziel @param {Node | null} el */
export function enthaelt(ziel, el) {
  for (let k = el; k; k = k.parentNode ?? /** @type {any} */ (k).host ?? null) if (k === ziel) return true;
  return false;
}

/**
 * Wo liegt das Element, und trifft ein Finger in seiner Mitte wirklich das Element (nicht verdeckt)?
 * @param {string} sel
 */
export function ort(sel) {
  const el = finde(sel);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  const imBild = r.width > 0 && r.height > 0 && x >= 0 && y >= 0 && x <= innerWidth && y <= innerHeight;
  const oben = imBild ? tiefBei(x, y) : null;
  return { x, y, breite: r.width, hoehe: r.height, imBild, frei: !!oben && enthaelt(el, oben), oben: oben ? beschreibe(oben) : null };
}

/** Hat das Element (oder etwas darin) den Tastaturfokus? @param {string} sel */
export function fokussiert(sel) {
  const el = finde(sel);
  /** @type {Element | null} */
  let aktiv = document.activeElement;
  while (aktiv?.shadowRoot?.activeElement) aktiv = aktiv.shadowRoot.activeElement;
  return !!el && !!aktiv && aktiv !== document.body && enthaelt(el, aktiv);
}

/** @param {Element} el */
function beschreibe(el) {
  return `${el.localName}${el.id ? `#${el.id}` : ""}${el.classList.length ? `.${[...el.classList].join(".")}` : ""}`;
}

// --- Vorgabe: einen Zug wie ein Finger ausführen ---------------------------------------------------

const warte = (/** @type {number} */ ms) => new Promise((ok) => setTimeout(ok, ms));

/**
 * Tippt auf die Mitte des Elements: pointerdown, pointerup, click am Element, das dort oben liegt.
 * @param {string} sel
 */
export async function tippe(sel) {
  const el = finde(sel);
  if (!el) throw new Error(`Prüfstand: ${sel} nicht gefunden`);
  const r = el.getBoundingClientRect();
  return tippeBei(r.left + r.width / 2, r.top + r.height / 2, el);
}

/**
 * Tippt auf einen Punkt: Zeiger- und Klickereignisse am obersten Element dort.
 * @param {number} x @param {number} y @param {Element | null} [ersatz] falls dort nichts liegt
 */
export async function tippeBei(x, y, ersatz = null) {
  const ziel = tiefBei(x, y) ?? ersatz;
  if (!ziel) return;
  const o = { bubbles: true, composed: true, cancelable: true, pointerId: 9, isPrimary: true, pointerType: "touch", button: 0, clientX: x, clientY: y };
  ziel.dispatchEvent(new PointerEvent("pointerdown", { ...o, buttons: 1 }));
  await warte(30);
  ziel.dispatchEvent(new PointerEvent("pointerup", o));
  ziel.dispatchEvent(new MouseEvent("click", o));
}

/** @param {Zug} zug */
export async function fuehreAus(zug) {
  if (zug.art === "tippen" && zug.von) return tippe(zug.von);
  if (zug.art === "ziehen" && zug.von && zug.nach) {
    await tippe(zug.von);
    await warte(60);
    return tippe(zug.nach);
  }
  throw new Error(`Prüfstand: Zug ${zug.art} braucht ein eigenes fuehreAus`);
}
