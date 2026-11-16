// Gesperrt durch die Grenzen der Eltern (Spielzeit, Bücher; Spec 2026-11-16-buecherzeit): Spiele und Bücher bleiben
// sichtbar, über ihrem Bild liegt eine Uhr auf halbdurchsichtigem Grund. Ein Tippen öffnet immer den Hinweis, der nur
// mit OK zugeht (kein Tippen daneben, kein Escape); bei Ton an liest der Erzähler ihn vor.
// Die Seiten hängen ihre eigenen Klicks (Name sagen, Link öffnen) nur an nicht gesperrte Karten (:not(.gesperrt)).

import { sprich, stille } from "../kern/stimme.js";
import "./knopf.js";

/** Die Sätze des Hinweises; jeder steht noch einmal als feste Zeichenkette in sage() (für `npm run audio`). */
export const SAETZE = {
  pause: "Du hast heute schon viel geschafft. Jetzt ist Zeit für eine Pause!",
  spaeter: "Das Spielen geht heute später los.",
};

const UHR = new URL("../symbole/uhr.svg", import.meta.url).href;

const CSS = `
.ls-sperre { position: absolute; inset: 0; z-index: 2; display: grid; place-items: center; pointer-events: none;
  background: color-mix(in srgb, var(--ls-nacht) 58%, transparent); }
.ls-sperre::before { content: ""; width: min(55%, 11rem); aspect-ratio: 1; border-radius: 50%;
  background: var(--ls-papier) var(--uhr) center / 72% no-repeat; box-shadow: 0 0.6rem 0 color-mix(in srgb, var(--ls-nacht) 60%, transparent); }
.gesperrt { cursor: pointer; }
dialog.ls-hinweis { box-sizing: border-box; width: min(84rem, calc(100vw - 8rem)); padding: 5.6rem 5.6rem 4.8rem;
  border: var(--ls-kontur) solid var(--ls-tinte); border-radius: var(--ls-radius-gross); background: var(--ls-papier);
  color: var(--ls-tinte); text-align: center; }
dialog.ls-hinweis[open] { display: flex; flex-direction: column; align-items: center; gap: 3.6rem; }
dialog.ls-hinweis::backdrop { background: color-mix(in srgb, var(--ls-nebel) 88%, transparent); }
dialog.ls-hinweis .uhr { width: 14rem; height: 14rem; background: var(--uhr) center / contain no-repeat; }
dialog.ls-hinweis p { margin: 0; font-size: 4.4rem; line-height: 1.3; font-weight: 600; }
`;

let stil = false;
function stilEinmal() {
  if (stil) return;
  stil = true;
  const s = document.createElement("style");
  s.textContent = CSS;
  document.head.append(s);
  document.documentElement.style.setProperty("--uhr", `url("${UHR}")`);
}

/** Satz zum Grund der Spielzeit (kern/spielzeit.js lage().grund). @param {string | null | undefined} grund */
export const satzFuer = (grund) => (grund === "frueh" ? SAETZE.spaeter : SAETZE.pause);

/** @param {string} satz */
function sage(satz) {
  if (satz === SAETZE.pause) return sprich("Du hast heute schon viel geschafft. Jetzt ist Zeit für eine Pause!");
  if (satz === SAETZE.spaeter) return sprich("Das Spielen geht heute später los.");
  return Promise.resolve(null);
}

/** @type {HTMLDialogElement | null} */
let dialog = null;

/**
 * Zeigt den Hinweis; löst auf, sobald OK gedrückt ist.
 * @param {string} satz
 * @param {{ ton?: boolean }} [optionen]
 * @returns {Promise<void>}
 */
export function zeigeHinweis(satz, { ton = false } = {}) {
  stilEinmal();
  if (!dialog) {
    dialog = document.createElement("dialog");
    dialog.className = "ls-hinweis";
    dialog.setAttribute("closedby", "none");
    dialog.setAttribute("aria-labelledby", "ls-hinweis-satz");
    dialog.innerHTML = `<span class="uhr" aria-hidden="true"></span><p id="ls-hinweis-satz"></p>`
      + `<ls-knopf class="ok" art="haupt" wort="OK" stumm></ls-knopf>`;
    // Nur OK schließt: Escape (cancel) wird abgefangen; schließt der Browser trotzdem, geht der Hinweis wieder auf.
    dialog.addEventListener("cancel", (e) => e.preventDefault());
    document.body.append(dialog);
  }
  const d = dialog;
  /** @type {HTMLElement} */ (d.querySelector("p")).textContent = satz;
  if (!d.open) d.showModal();
  if (ton) sage(satz);
  return new Promise((fertig) => {
    let ok = false;
    const knopf = /** @type {HTMLElement} */ (d.querySelector(".ok"));
    const zu = () => { ok = true; knopf.removeEventListener("click", zu); stille(); d.close(); };
    knopf.addEventListener("click", zu);
    const wieder = () => {
      if (!ok) { d.showModal(); return; }
      d.removeEventListener("close", wieder);
      fertig();
    };
    d.addEventListener("close", wieder);
  });
}

/**
 * Sperrt eine Karte: Uhr über das Bild (bild = Element, in das die Überlagerung kommt; es braucht position:relative
 * oder absolute), Klick öffnet den Hinweis statt des Links.
 * @param {HTMLElement} karte
 * @param {HTMLElement | null} bild
 * @param {string} satz
 * @param {() => boolean} ton
 */
export function sperre(karte, bild, satz, ton) {
  stilEinmal();
  karte.classList.add("gesperrt");
  karte.setAttribute("aria-label", `${karte.getAttribute("aria-label") ?? ""} – gerade gesperrt`.replace(/^ – /, ""));
  if (bild && !bild.querySelector(":scope > .ls-sperre")) {
    const u = document.createElement("span");
    u.className = "ls-sperre";
    u.setAttribute("aria-hidden", "true");
    bild.append(u);
  }
  karte.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    zeigeHinweis(satz, { ton: ton() });
  });
}
