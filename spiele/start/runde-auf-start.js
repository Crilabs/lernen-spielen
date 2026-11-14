// Die Runde auf der Startseite (Spec §5.5): Ela, Kofi, Lena und Timo stehen vorne auf der Wiese; dazu ein paar
// Tiere (Feldhase, Hausmaus, Rotkehlchen), die einfach da sind.
// Sie sind keine Links und haben keine Aufgabe. Antippen: Der Erzähler sagt den Namen einmal je Sitzung.
// Stufe 2 ergänzt Ankunft und Antworten mit steuere().
import { zeichne } from "../runde/runde.js";
import { tierSvg, TIERE } from "../runde/tiere/tiere.js";
import { sprich } from "../kern/stimme.js";
import { sageEinmal } from "../kern/sitzung.js";
import { ORTE } from "./szene.js";

/** Höhe einer Figur (viewBox 320 × 280) bei Skala 1, in rem. */
export const FIGUR_HOEHE = 34;
const FUSS = [160 / 320, 254 / 280];

/** Namen als feste Aufrufe, damit das Audio-Werkzeug sie sammelt. */
const NAME = {
  ela: () => sageEinmal("Ela", () => sprich("Ela")),
  kofi: () => sageEinmal("Kofi", () => sprich("Kofi")),
  lena: () => sageEinmal("Lena", () => sprich("Lena")),
  timo: () => sageEinmal("Timo", () => sprich("Timo")),
};

/**
 * Setzt die vier Kinder an ihre Plätze (ORTE.runde) in den Behälter (Box-Koordinaten in rem).
 * @param {HTMLElement} el
 * @param {{ton?: () => boolean}} [opts] ton: ob gesprochen werden darf (Tonschalter der Kopfleiste)
 */
export function setzeRunde(el, opts = {}) {
  el.replaceChildren(...ORTE.runde.map((o) => {
    const h = FIGUR_HOEHE * o.skala;
    const b = h * 320 / 280;
    const kind = document.createElement("div");
    kind.className = "kind";
    kind.dataset.kind = o.kind;
    kind.style.cssText = `left:${o.x + o.b / 2 - b * FUSS[0]}rem;top:${o.fuss - h * FUSS[1]}rem;width:${b}rem;height:${h}rem`;
    kind.innerHTML = zeichne(o.kind, { ansicht: "dreiviertel", haltung: o.haltung, blick: /** @type {"rechts"|"links"} */ (o.blick) });
    kind.addEventListener("click", () => { if (opts.ton?.() ?? true) NAME[/** @type {keyof typeof NAME} */ (o.kind)](); });
    return kind;
  }));
}

/** Tiernamen als feste Aufrufe (Audio-Werkzeug). */
const TIERNAME = {
  hase: () => sageEinmal("Feldhase", () => sprich("Feldhase")),
  maus: () => sageEinmal("Hausmaus", () => sprich("Hausmaus")),
  rotkehlchen: () => sageEinmal("Rotkehlchen", () => sprich("Rotkehlchen")),
};

/**
 * Setzt die Tiere an ihre Plätze (ORTE.tiere). Antippen: der Erzähler nennt das Tier einmal je Sitzung.
 * @param {HTMLElement} el
 * @param {{ton?: () => boolean}} [opts]
 */
export function setzeTiere(el, opts = {}) {
  el.replaceChildren(...ORTE.tiere.map((o) => {
    const [vb, vh] = TIERE[o.tier].groesse;
    const [fx, fy] = TIERE[o.tier].fuss;
    const h = (vh / 280) * FIGUR_HOEHE * o.skala;
    const b = h * vb / vh;
    const tier = document.createElement("div");
    tier.className = "kind tier";
    tier.dataset.tier = o.tier;
    const links = o.blick === "links";
    tier.style.cssText = `left:${o.x + o.b / 2 - b * (links ? 1 - fx / vb : fx / vb)}rem;top:${o.fuss - h * fy / vh}rem;width:${b}rem;height:${h}rem`;
    tier.innerHTML = tierSvg(o.tier, { blick: links ? "links" : "rechts" });
    tier.addEventListener("click", () => { if (opts.ton?.() ?? true) TIERNAME[/** @type {keyof typeof TIERNAME} */ (o.tier)](); });
    return tier;
  }));
}
