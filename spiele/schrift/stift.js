// Stift im Schreibfeld (Christian, 2026-11-22): In den Schreibspielen (S18, S20 und alle weiteren mit Freihand-Strich)
// zählen im Schreibfeld nur Stiftsignale. Eine Hand, die beim Schreiben aufliegt, und ein Finger schreiben nicht mit.
// Knöpfe und Figuren (Beenden, Hilfe, Pause, Ela, Lena …) sind eigene Elemente und gehen weiter mit dem Finger.
//
// Die Maus zählt wie ein Stift: am Computer gibt es keinen Stift, und der Prüfstand schreibt mit synthetischen
// Ereignissen. Auf dem Tablet gibt es keine Maus, dort zählt also nur der Stift.

/** Zählt dieses Zeigerereignis im Schreibfeld? @param {PointerEvent} e */
export function zaehltAlsStift(e) {
  return e.pointerType === "pen" || e.pointerType === "mouse";
}

const STIFT_SVG =
  '<svg viewBox="0 0 48 48" width="56" height="56" aria-hidden="true">' +
  '<path d="M33 7l8 8-22 22-10 2 2-10z" fill="#fffaf0" stroke="#3b3a36" stroke-width="3" stroke-linejoin="round"/>' +
  '<path d="M29 11l8 8" stroke="#3b3a36" stroke-width="3"/>' +
  '<path d="M11 29l8 8" stroke="#3b3a36" stroke-width="3"/></svg>';

let letzterStift = -Infinity;
let letzterHinweis = -Infinity;

/**
 * Hängt an ein Schreibfeld: merkt sich, wann der Stift zuletzt da war, und zeigt bei einem Finger allein einen kleinen
 * Stift an der berührten Stelle (kein Satz, keine Stimme). Liegt die Hand beim Schreiben auf, erscheint nichts:
 * 2 s nach dem letzten Stiftsignal bleibt der Hinweis aus, und er kommt höchstens alle 2 s.
 * Muss vor den eigenen pointerdown-Hörern des Spiels registriert werden (Erfassungsphase, damit es immer zuerst läuft).
 * @param {HTMLElement | SVGElement} feld
 */
export function stiftFeld(feld) {
  /** @type {HTMLElement & { style: CSSStyleDeclaration }} */ (feld).style.touchAction = "none";
  feld.addEventListener("pointerdown", (ev) => {
    const e = /** @type {PointerEvent} */ (ev);
    const jetzt = performance.now();
    if (zaehltAlsStift(e)) {
      letzterStift = jetzt;
      return;
    }
    if (e.pointerType !== "touch") return;
    e.preventDefault();
    if (jetzt - letzterStift < 2000 || jetzt - letzterHinweis < 2000) return;
    letzterHinweis = jetzt;
    zeigeStift(e.clientX, e.clientY);
  }, true);
  for (const typ of ["pointermove", "pointerup"])
    feld.addEventListener(typ, (ev) => {
      if (zaehltAlsStift(/** @type {PointerEvent} */ (ev))) letzterStift = performance.now();
    }, true);
}

/** Ein kleiner Stift wackelt an der Stelle und verschwindet (≈ 1,2 s). @param {number} x @param {number} y */
function zeigeStift(x, y) {
  const el = document.createElement("div");
  el.className = "stift-hinweis";
  el.innerHTML = STIFT_SVG;
  Object.assign(el.style, {
    position: "fixed", left: `${x - 8}px`, top: `${y - 52}px`, pointerEvents: "none", zIndex: "50",
    filter: "drop-shadow(0 2px 3px rgba(0,0,0,.25))",
  });
  document.body.append(el);
  const ani = el.animate(
    [
      { opacity: 0, transform: "translateY(6px) rotate(0deg)" },
      { opacity: 1, transform: "translateY(0) rotate(-12deg)", offset: 0.2 },
      { opacity: 1, transform: "rotate(10deg)", offset: 0.4 },
      { opacity: 1, transform: "rotate(-8deg)", offset: 0.6 },
      { opacity: 0, transform: "rotate(0deg)" },
    ],
    { duration: 1200, easing: "ease-out" },
  );
  ani.onfinish = () => el.remove();
}
