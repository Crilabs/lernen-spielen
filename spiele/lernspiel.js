// Gemeinsame Bibliothek der Lernspiele: Touch-Sperren, Link-Wechsel, Hilfen.
// Speichern und Protokoll liegen in kern/ und werden hier weitergereicht.

import { hatUngespeichertes, sofortSpeichern } from "./kern/speicher.js";
import { protokoll } from "./kern/protokoll.js";

export { istApp } from "./kern/dienste.js";
export { lade, speichere, sofortSpeichern } from "./kern/speicher.js";
export { protokoll, protokollLesen } from "./kern/protokoll.js";

export function esc(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Tipp auf einen Link der eigenen App (z. B. Haus): erst fertig speichern, dann wechseln.
export function linkKlick(e) {
  if (e.defaultPrevented || e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (!hatUngespeichertes()) return;
  const t = e.target;
  const el = t?.nodeType === 3 ? t.parentElement : t;
  const a = el?.closest?.("a[href]");
  if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
  const innen = el.closest("button, [role=button]");
  if (innen && a.contains(innen)) return;
  const hier = globalThis.location;
  let ziel;
  try { ziel = new URL(a.href, hier?.href); } catch { return; }
  if (!hier || ziel.origin !== hier.origin) return;
  if (ziel.hash && ziel.pathname === hier.pathname && ziel.search === hier.search) return;
  e.preventDefault();
  return sofortSpeichern().then(() => { hier.href = ziel.href; });
}

// --- Lernfortschritt ---------------------------------------------------

export function merkeGelernt(eintrag, gelernt) {
  if (eintrag.f >= gelernt) eintrag.g = 1;
}

// --- Touch-Sperren -----------------------------------------------------

let touchGesperrt = false;

export function sperreTouch() {
  const doc = globalThis.document;
  if (!doc?.addEventListener || touchGesperrt) return;
  touchGesperrt = true;
  const stopp = (e) => e.preventDefault();
  doc.addEventListener("contextmenu", stopp);
  doc.addEventListener("dragstart", stopp);
  doc.addEventListener("gesturestart", stopp);
  doc.addEventListener("selectstart", (e) => {
    const t = e.target;
    const el = t?.nodeType === 3 ? t.parentElement : t;
    if (!el?.closest?.(".auswahl")) e.preventDefault();
  });
  doc.addEventListener("wheel", (e) => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
  if (doc.documentElement?.style) doc.documentElement.style.touchAction = "manipulation";
}

// --- Pausen-Knöpfe -----------------------------------------------------
// Jede Pause endet nur, wenn das Kind es will: Haus (alle Spiele) oder Weiter.
// Kein Ablaufbalken, kein automatisches Weiter (docs/grundsaetze.md N1, N6, N8, 9.2 Nr. 7).
// Gibt ein Promise zurück, das beim Tippen auf „Weiter“ erfüllt wird; die Knöpfe entfernen sich dann selbst.

export function pausenKnoepfe(container, { beimTippen } = {}) {
  const doc = globalThis.document;
  const box = doc.createElement("div");
  box.className = "pausen-knoepfe";
  box.style.cssText = "position:absolute;left:0;right:0;bottom:6rem;display:flex;justify-content:center;gap:8rem;z-index:5";
  const rund = "width:16rem;height:16rem;border-radius:50%;background:rgba(255,255,255,.92);display:flex;align-items:center;"
    + "justify-content:center;padding:3.4rem;box-sizing:border-box;border:0;box-shadow:0 .8rem 0 rgba(0,0,0,.25);cursor:pointer";
  box.innerHTML = `<a href="index.html" aria-label="Alle Spiele" style="${rund}"><img src="symbole/haus.svg" alt="" style="width:100%;height:100%"></a>`
    + `<button type="button" aria-label="Weiter" style="${rund}"><img src="symbole/zurueck.svg" alt="" style="width:100%;height:100%;transform:scaleX(-1)"></button>`;
  container.appendChild(box);
  return new Promise((ok) => {
    box.querySelector("button").addEventListener("click", () => {
      beimTippen?.();
      box.remove();
      ok();
    }, { once: true });
  });
}

// --- Automatische Registrierung beim Import ----------------------------

const w = globalThis.window;
if (w?.addEventListener) {
  w.addEventListener("error", (e) => protokoll(`Fehler: ${e.message} (${e.filename ?? ""}:${e.lineno ?? ""})`));
  w.addEventListener("unhandledrejection", (e) => protokoll(`Promise: ${e.reason?.message ?? e.reason}`));
}
if (globalThis.document?.addEventListener) {
  globalThis.document.addEventListener("click", linkKlick, true);
  globalThis.document.addEventListener("visibilitychange", () => {
    if (globalThis.document.visibilityState === "hidden") sofortSpeichern();
  });
}
