// Zugang für Erwachsene auf den Seiten Können (index.html) und Wissen (bibliothek.html): das Zahnrad rechts im Kopf
// gedrückt halten (Finger, Maus oder Eingabe-/Leertaste), dabei läuft leise ein Ring herum. Der Knopf ist stumm:
// sein Name wird nicht gesprochen, ein kurzes Tippen tut nichts.
//   <span class="zahnrad" id="zahnrad" slot="rechts"></span>  →  zahnrad(document.getElementById("zahnrad"))

import "./knopf.js";

export const HALTEN_MS = 3000;

const CSS = `
.zahnrad { position: relative; display: flex; width: 11rem; height: 11rem; touch-action: none; }
/* Der Ring sitzt um die sichtbare Form beim Halten: Knopf eingesunken (0.3rem) samt Kante unten (0.6 − 0.3rem),
   deren Mitte liegt 0.45rem unter der Mitte des Kastens. */
.zahnrad svg { position: absolute; inset: 0.6rem; width: calc(100% - 1.2rem); height: calc(100% - 1.2rem); transform: translateY(0.45rem) rotate(-90deg); pointer-events: none; opacity: 0; transition: opacity 0.2s; }
.zahnrad circle { fill: none; stroke: var(--ls-tinte-weich); stroke-width: 2.8; stroke-linecap: round; stroke-dasharray: 100; stroke-dashoffset: 100; }
.zahnrad.haelt svg { opacity: 1; }
.zahnrad.haelt circle { stroke-dashoffset: 0; transition: stroke-dashoffset var(--halten) linear; }
`;

/**
 * Füllt den Platzhalter mit Knopf und Ring und öffnet nach HALTEN_MS den Elternbereich.
 * @param {HTMLElement} rad
 * @param {string} [ziel] Adresse des Elternbereichs
 */
export function zahnrad(rad, ziel = new URL("../eltern.html", import.meta.url).href) {
  if (!document.getElementById("ls-zahnrad-stil")) {
    const s = document.createElement("style");
    s.id = "ls-zahnrad-stil";
    s.textContent = CSS;
    document.head.append(s);
  }
  rad.classList.add("zahnrad");
  rad.innerHTML = `<ls-knopf id="eltern" symbol="zahnrad.svg" name="Für Erwachsene: gedrückt halten" groesse="seite" stumm></ls-knopf>`
    + `<svg viewBox="0 0 34 34" aria-hidden="true"><circle cx="17" cy="17" r="15.6" pathLength="100"/></svg>`;
  rad.style.setProperty("--halten", HALTEN_MS + "ms");
  /** @type {ReturnType<typeof setTimeout> | null} */
  let uhr = null;
  const los = () => { if (uhr) clearTimeout(uhr); uhr = null; rad.classList.remove("haelt"); };
  const halte = () => {
    if (uhr) return;
    rad.classList.add("haelt");
    uhr = setTimeout(() => { los(); location.href = ziel; }, HALTEN_MS);
  };
  rad.addEventListener("pointerdown", (e) => {
    try { rad.setPointerCapture(e.pointerId); } catch { /* egal */ }
    halte();
  });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach((t) => rad.addEventListener(t, los));
  rad.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); halte(); } });
  rad.addEventListener("keyup", (e) => { if (e.key === "Enter" || e.key === " ") los(); });
  rad.addEventListener("focusout", los);
}
