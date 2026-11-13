// Gemeinsame Bibliothek der Lernspiele: Speichern, Touch-Sperren, Fehlerprotokoll.
// Läuft in der Tauri-App (window.__TAURI__) und im normalen Browser (localStorage).

const VERZOEGERUNG_MS = 300;
const PROTOKOLL_MAX = 30;

export function istApp() {
  return !!globalThis.window?.__TAURI__;
}

function ls() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function esc(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// --- Protokoll ---------------------------------------------------------

export function protokollLesen() {
  try {
    const v = JSON.parse(ls()?.getItem("protokoll") ?? "[]");
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

export function protokoll(text) {
  try {
    const eintraege = protokollLesen();
    eintraege.push(`${new Date().toISOString()} ${text}`);
    ls()?.setItem("protokoll", JSON.stringify(eintraege.slice(-PROTOKOLL_MAX)));
  } catch {
    // Protokollieren darf nie selbst einen Fehler auslösen.
  }
}

// --- Speichern ---------------------------------------------------------

export async function lade(spiel, standard) {
  const kopie = () => structuredClone(standard);
  try {
    let roh;
    if (istApp()) {
      roh = await window.__TAURI__.core.invoke("lernstand_lesen", { spiel });
    } else {
      roh = ls()?.getItem("lernstand-" + spiel);
    }
    if (roh == null) return kopie();
    const daten = JSON.parse(roh);
    if (daten === null || typeof daten !== "object" || Array.isArray(daten)) return kopie();
    return { ...kopie(), ...daten };
  } catch (e) {
    protokoll(`lade ${spiel}: ${e?.message ?? e}`);
    return kopie();
  }
}

const ausstehend = new Map(); // spiel -> { daten, timer }

async function schreibe(spiel, daten) {
  const json = JSON.stringify(daten);
  try {
    if (istApp()) {
      await window.__TAURI__.core.invoke("lernstand_schreiben", { spiel, daten: json });
    } else {
      ls()?.setItem("lernstand-" + spiel, json);
    }
  } catch (e) {
    protokoll(`speichern ${spiel}: ${e?.message ?? e}`);
  }
}

function ausfuehren(spiel) {
  const eintrag = ausstehend.get(spiel);
  if (!eintrag) return Promise.resolve();
  clearTimeout(eintrag.timer);
  ausstehend.delete(spiel);
  return schreibe(spiel, eintrag.daten);
}

export function speichere(spiel, daten) {
  const alt = ausstehend.get(spiel);
  if (alt) clearTimeout(alt.timer);
  const timer = setTimeout(() => ausfuehren(spiel), VERZOEGERUNG_MS);
  ausstehend.set(spiel, { daten, timer });
}

export async function sofortSpeichern() {
  await Promise.all([...ausstehend.keys()].map(ausfuehren));
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

// --- Automatische Registrierung beim Import ----------------------------

const w = globalThis.window;
if (w?.addEventListener) {
  w.addEventListener("error", (e) => protokoll(`Fehler: ${e.message} (${e.filename ?? ""}:${e.lineno ?? ""})`));
  w.addEventListener("unhandledrejection", (e) => protokoll(`Promise: ${e.reason?.message ?? e.reason}`));
}
if (globalThis.document?.addEventListener) {
  globalThis.document.addEventListener("visibilitychange", () => {
    if (globalThis.document.visibilityState === "hidden") sofortSpeichern();
  });
}
