// Ein Kind der Runde auf der Startseite (Spec 2026-11-14-startseite-karten-design.md §3.3): bei jedem Öffnen ein
// anderes (reihum, gemerkt über kern/speicher), winkt einmal beim Ankommen; antippen: kurze Bewegung reihum, der
// Erzähler nennt den Namen einmal je Sitzung. Bei prefers-reduced-motion wechselt steuere() die Haltung ruhig.
import { zeichne, steuere } from "../runde/runde.js";
import { sprich } from "../kern/stimme.js";
import { sageEinmal } from "../kern/sitzung.js";
import { lade, speichere } from "../kern/speicher.js";

export const KINDER = /** @type {const} */ (["ela", "kofi", "lena", "timo"]);
const ANTWORTEN = ["huepfen", "winken", "staunen"];

/** Namen als feste Aufrufe, damit das Audio-Werkzeug sie sammelt. */
const NAME = {
  ela: () => sageEinmal("Ela", () => sprich("Ela")),
  kofi: () => sageEinmal("Kofi", () => sprich("Kofi")),
  lena: () => sageEinmal("Lena", () => sprich("Lena")),
  timo: () => sageEinmal("Timo", () => sprich("Timo")),
};

/**
 * Setzt das Kind dieses Besuchs in den Behälter.
 * @param {HTMLElement} el
 * @param {{ton?: () => boolean}} [opts]
 * @returns {Promise<string>} Id des Kindes
 */
export async function setzeKind(el, opts = {}) {
  const merk = await lade("startkind", { nr: -1 });
  const nr = (Number(merk.nr) + 1 + KINDER.length) % KINDER.length;
  speichere("startkind", { nr });
  const kind = KINDER[nr];
  el.innerHTML = zeichne(kind, { ansicht: "dreiviertel", haltung: "stehen", blick: "links" });
  const svg = /** @type {any} */ (el.querySelector("svg"));
  const figur = steuere(svg);
  setTimeout(() => figur.bewegung("winken"), 600);
  let i = 0;
  el.addEventListener("click", () => {
    figur.bewegung(ANTWORTEN[i++ % ANTWORTEN.length]);
    if (opts.ton?.() ?? true) NAME[kind]();
  });
  return kind;
}
