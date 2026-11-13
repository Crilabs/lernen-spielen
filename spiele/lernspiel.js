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

// Spiele, deren Lernstand in der App nicht gelesen werden konnte. Für sie wird
// nichts gespeichert, damit der Standard nicht den echten Lernstand überschreibt.
const gesperrt = new Set();

export async function lade(spiel, standard) {
  const kopie = () => structuredClone(standard);
  let roh;
  try {
    if (istApp()) {
      roh = await window.__TAURI__.core.invoke("lernstand_lesen", { spiel });
    } else {
      roh = ls()?.getItem("lernstand-" + spiel);
    }
  } catch (e) {
    if (istApp() && !gesperrt.has(spiel)) {
      gesperrt.add(spiel);
      protokoll(`lade ${spiel}: ${e?.message ?? e} – Speichern für dieses Spiel gesperrt`);
    } else if (!istApp()) {
      protokoll(`lade ${spiel}: ${e?.message ?? e}`);
    }
    return kopie();
  }
  gesperrt.delete(spiel);
  try {
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
const ketten = new Map(); // spiel -> Promise des letzten Schreibvorgangs

async function schreibeJetzt(spiel, json) {
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

// Schreibvorgänge je Spiel nacheinander, damit ein älterer Stand nie einen neueren überholt.
function schreibe(spiel, daten) {
  if (gesperrt.has(spiel)) return Promise.resolve();
  const json = JSON.stringify(daten);
  const vorher = ketten.get(spiel);
  const jetzt = vorher ? vorher.then(() => schreibeJetzt(spiel, json)) : schreibeJetzt(spiel, json);
  ketten.set(spiel, jetzt);
  jetzt.then(() => { if (ketten.get(spiel) === jetzt) ketten.delete(spiel); });
  return jetzt;
}

function ausfuehren(spiel) {
  const eintrag = ausstehend.get(spiel);
  if (!eintrag) return Promise.resolve();
  clearTimeout(eintrag.timer);
  ausstehend.delete(spiel);
  return schreibe(spiel, eintrag.daten);
}

export function speichere(spiel, daten) {
  if (gesperrt.has(spiel)) return;
  const alt = ausstehend.get(spiel);
  if (alt) clearTimeout(alt.timer);
  const timer = setTimeout(() => ausfuehren(spiel), VERZOEGERUNG_MS);
  ausstehend.set(spiel, { daten, timer });
}

export async function sofortSpeichern() {
  await Promise.all([...ausstehend.keys()].map(ausfuehren));
  await Promise.all([...ketten.values()]);
}

function hatUngespeichertes() {
  return ausstehend.size > 0 || ketten.size > 0;
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
