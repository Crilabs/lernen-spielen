// Haltungen und Bewegungen in Zielwerte auflösen. Rein: kein DOM, keine Zeit.

import { bestand } from "./bestand.js";
import { BEINE, gelenkeFuer } from "./gelenke.js";

/**
 * @typedef {import("./gelenke.js").Ansicht} Ansicht
 * @typedef {import("./bestand.js").Werte} Werte
 * @typedef {import("./bestand.js").Schritt} Schritt
 * @typedef {import("./bestand.js").Kurve} Kurve
 * @typedef {Record<string, import("./bestand.js").Anker|[number, number]>} Luft
 * @typedef {{ansicht: Ansicht, gesicht: string, winkel: Record<string, number>, versatz: [number, number],
 *            groesse: number, streckung: [number, number], zustaende: Record<string, string>, braucht: string[],
 *            haende: {vorn: string, hinten: string}, luft: Luft}} Pose
 * @typedef {{pose: Pose, ms: number, kurve?: Kurve, wende?: boolean}} Schrittpose
 */

/** Dauer des Übergangs in die Ende-Haltung einer Bewegung. */
export const ENDE_MS = 400;

/** @param {string} id */
function kind(id) {
  const k = bestand.kinder.get(id);
  if (!k) throw new Error(`Runde: unbekanntes Kind „${id}“`);
  return k;
}

/** @param {string} kindId @param {Ansicht} ansicht @returns {Pose} */
function grundpose(kindId, ansicht) {
  const winkel = Object.fromEntries(gelenkeFuer(kind(kindId).bewegt).map((g) => [g, 0]));
  return {
    ansicht, gesicht: "ruhig", winkel, versatz: [0, 0], groesse: 1, streckung: [1, 1], zustaende: {}, braucht: [],
    haende: { vorn: "offen", hinten: "offen" }, luft: {},
  };
}

/**
 * Legt Werte über eine Pose. Beim Rollstuhlkind fallen Beinwinkel weg, unbekannte Gelenke ebenso.
 * Luftzeichen gelten nur für den Schritt, der sie nennt (nicht vererbt).
 * @param {Pose} p
 * @param {Werte & {gesicht?: string, zustaende?: Record<string, string>, braucht?: string[], luft?: Luft}} w
 * @returns {Pose}
 */
function lege(p, w) {
  const winkel = { ...p.winkel };
  for (const [g, grad] of Object.entries(w.winkel ?? {})) if (g in winkel) winkel[g] = grad;
  return {
    ansicht: p.ansicht,
    gesicht: w.gesicht ?? p.gesicht,
    winkel,
    versatz: w.versatz ? [w.versatz[0], w.versatz[1]] : p.versatz,
    groesse: w.groesse ?? p.groesse,
    streckung: w.streckung ? [w.streckung[0], w.streckung[1]] : p.streckung,
    zustaende: { ...p.zustaende, ...(w.zustaende ?? {}) },
    braucht: [...new Set([...p.braucht, ...(w.braucht ?? [])])],
    haende: { ...p.haende, ...(w.haende ?? {}) },
    luft: { ...(w.luft ?? {}) },
  };
}

/** @param {string} kindId @param {Werte & object} h @returns {Werte} */
function fuerKind(kindId, h) {
  const r = /** @type {Werte & {rollstuhl?: Werte}} */ (h);
  if (kind(kindId).bewegt !== "rollstuhl") return h;
  const winkel = { ...(h.winkel ?? {}), ...(r.rollstuhl?.winkel ?? {}) };
  for (const b of BEINE) delete winkel[b];
  return {
    ...h, winkel, versatz: r.rollstuhl?.versatz ?? h.versatz, groesse: r.rollstuhl?.groesse ?? h.groesse,
    streckung: r.rollstuhl?.streckung ?? h.streckung,
    haende: { ...(h.haende ?? {}), ...(r.rollstuhl?.haende ?? {}) },
  };
}

/**
 * Zielwerte einer Haltung für ein Kind.
 * @param {string} kindId
 * @param {string} haltungId
 * @param {Ansicht} [ansicht] nur nötig bei Haltungen mit ansicht "beide" (Standard dreiviertel)
 * @returns {Pose}
 */
export function pose(kindId, haltungId, ansicht) {
  kind(kindId);
  const h = bestand.haltungen.get(haltungId);
  if (!h) throw new Error(`Runde: unbekannte Haltung „${haltungId}“`);
  if (h.ansicht !== "beide" && ansicht && ansicht !== h.ansicht) {
    throw new Error(`Runde: Haltung ${haltungId} gibt es nur in der Ansicht ${h.ansicht}, nicht ${ansicht}`);
  }
  const a = h.ansicht === "beide" ? (ansicht ?? "dreiviertel") : h.ansicht;
  return lege(grundpose(kindId, a), fuerKind(kindId, h));
}

/**
 * Eine Bewegung als Folge von Zielposen mit Dauer. Endet mit der Ende-Haltung (ENDE_MS).
 * Das Zubehör, das die Bewegung braucht, gilt nur für ihre Schritte; die Ende-Haltung trägt nur ihr eigenes.
 * @param {string} kindId
 * @param {string} bewegungId
 * @returns {Schrittpose[]}
 */
export function ablauf(kindId, bewegungId) {
  const k = kind(kindId);
  const b = bestand.bewegungen.get(bewegungId);
  if (!b) throw new Error(`Runde: unbekannte Bewegung „${bewegungId}“`);
  if (b.nur && b.nur !== k.bewegt) {
    throw new Error(`Runde: Bewegung ${bewegungId} gibt es nur für Kinder ${b.nur === "rollstuhl" ? "im Rollstuhl" : "zu Fuß"}, nicht für ${k.name}`);
  }
  const schritte = k.bewegt === "rollstuhl" && b.rollstuhl ? b.rollstuhl.schritte : b.schritte;
  const extra = { braucht: b.braucht ?? [] };
  /** @type {Schrittpose[]} */
  const folge = [];
  // Schritte bauen auf dem Stehen auf (bei Timo liegen die Hände dann auf dem Greifreifen), nicht auf der Nullpose.
  const steht = bestand.haltungen.get("stehen");
  const anfang = steht && (steht.ansicht === "beide" || steht.ansicht === b.ansicht) ? pose(kindId, "stehen", b.ansicht) : grundpose(kindId, b.ansicht);
  let vorher = lege(anfang, extra);
  for (let m = 0; m < (b.mal ?? 1); m++) {
    for (const s of schritte) {
      const basis = s.haltung ? lege(pose(kindId, s.haltung, b.ansicht), extra) : vorher;
      vorher = lege(basis, fuerKind(kindId, s));
      /** @type {Schrittpose} */
      const sp = { pose: vorher, ms: s.ms };
      if (s.kurve) sp.kurve = s.kurve;
      if (s.wende) sp.wende = true;
      folge.push(sp);
    }
  }
  folge.push({ pose: pose(kindId, b.ende, b.ansicht), ms: ENDE_MS });
  return folge;
}

/** @param {number} t */
const sanft = (t) => t * t * (3 - 2 * t);

/**
 * Fortschritt 0..1 (bei „federn“ kurz darüber) für eine Kurve.
 * @param {Kurve} kurve @param {number} t 0..1
 */
export function kurvenwert(kurve, t) {
  const u = Math.min(1, Math.max(0, t));
  if (kurve === "gleich") return u;
  if (kurve === "ruck") return u > 0 ? 1 : 0;
  if (kurve === "federn") {
    // Überschwingen um etwa 10 % (easeOutBack mit c = 1,70158), dann zurück auf 1.
    const c = 1.70158;
    const v = u - 1;
    return 1 + (c + 1) * v * v * v + c * v * v;
  }
  return sanft(u);
}
/** @param {number} a @param {number} b @param {number} e */
const lerp = (a, b, e) => a + (b - a) * e;

/**
 * Zwischenpose. Winkel, Versatz, Größe und Streckung folgen der Kurve; Gesicht und Zustände wechseln bei der
 * Hälfte (bei „ruck“ sofort); Luftzeichen des Ziels erscheinen sofort.
 * Zubehör von Start und Ziel bleibt bis zum Ende des Übergangs.
 * @param {Pose} a @param {Pose} b @param {number} t 0..1 @param {Kurve} [kurve]
 * @returns {Pose}
 */
export function mische(a, b, t, kurve = "weich") {
  const e = kurvenwert(kurve, t);
  /** @type {Record<string, number>} */
  const winkel = {};
  for (const g of new Set([...Object.keys(a.winkel), ...Object.keys(b.winkel)])) {
    winkel[g] = lerp(a.winkel[g] ?? 0, b.winkel[g] ?? 0, e);
  }
  const spaet = t >= 0.5 || (kurve === "ruck" && t > 0) ? b : a;
  return {
    ansicht: b.ansicht,
    gesicht: spaet.gesicht,
    winkel,
    versatz: [lerp(a.versatz[0], b.versatz[0], e), lerp(a.versatz[1], b.versatz[1], e)],
    groesse: lerp(a.groesse, b.groesse, e),
    streckung: [lerp(a.streckung[0], b.streckung[0], e), lerp(a.streckung[1], b.streckung[1], e)],
    zustaende: spaet.zustaende,
    braucht: t >= 1 ? b.braucht : [...new Set([...a.braucht, ...b.braucht])],
    haende: spaet.haende,
    luft: t > 0 ? b.luft : a.luft,
  };
}
