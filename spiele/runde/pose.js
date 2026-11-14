// Haltungen und Bewegungen in Zielwerte auflösen. Rein: kein DOM, keine Zeit.

import { bestand } from "./bestand.js";
import { BEINE, gelenkeFuer } from "./gelenke.js";

/**
 * @typedef {import("./gelenke.js").Ansicht} Ansicht
 * @typedef {import("./bestand.js").Werte} Werte
 * @typedef {import("./bestand.js").Schritt} Schritt
 * @typedef {{ansicht: Ansicht, gesicht: string, winkel: Record<string, number>, versatz: [number, number],
 *            groesse: number, zustaende: Record<string, string>, braucht: string[], haende: {vorn: string, hinten: string}}} Pose
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
  return { ansicht, gesicht: "ruhig", winkel, versatz: [0, 0], groesse: 1, zustaende: {}, braucht: [], haende: { vorn: "offen", hinten: "offen" } };
}

/**
 * Legt Werte über eine Pose. Beim Rollstuhlkind fallen Beinwinkel weg, unbekannte Gelenke ebenso.
 * @param {Pose} p
 * @param {Werte & {gesicht?: string, zustaende?: Record<string, string>, braucht?: string[]}} w
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
    zustaende: { ...p.zustaende, ...(w.zustaende ?? {}) },
    braucht: [...new Set([...p.braucht, ...(w.braucht ?? [])])],
    haende: { ...p.haende, ...(w.haende ?? {}) },
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
 * @returns {{pose: Pose, ms: number}[]}
 */
export function ablauf(kindId, bewegungId) {
  const k = kind(kindId);
  const b = bestand.bewegungen.get(bewegungId);
  if (!b) throw new Error(`Runde: unbekannte Bewegung „${bewegungId}“`);
  const schritte = k.bewegt === "rollstuhl" && b.rollstuhl ? b.rollstuhl.schritte : b.schritte;
  const extra = { braucht: b.braucht ?? [] };
  /** @type {{pose: Pose, ms: number}[]} */
  const folge = [];
  let vorher = lege(grundpose(kindId, b.ansicht), extra);
  for (let m = 0; m < (b.mal ?? 1); m++) {
    for (const s of schritte) {
      const basis = s.haltung ? lege(pose(kindId, s.haltung, b.ansicht), extra) : vorher;
      vorher = lege(basis, fuerKind(kindId, s));
      folge.push({ pose: vorher, ms: s.ms });
    }
  }
  folge.push({ pose: pose(kindId, b.ende, b.ansicht), ms: ENDE_MS });
  return folge;
}

/** @param {number} t */
const sanft = (t) => t * t * (3 - 2 * t);
/** @param {number} a @param {number} b @param {number} e */
const lerp = (a, b, e) => a + (b - a) * e;

/**
 * Zwischenpose. Winkel, Versatz und Größe weich überblendet; Gesicht und Zustände wechseln bei der Hälfte;
 * Zubehör von Start und Ziel bleibt bis zum Ende des Übergangs.
 * @param {Pose} a @param {Pose} b @param {number} t 0..1
 * @returns {Pose}
 */
export function mische(a, b, t) {
  const e = sanft(Math.min(1, Math.max(0, t)));
  /** @type {Record<string, number>} */
  const winkel = {};
  for (const g of new Set([...Object.keys(a.winkel), ...Object.keys(b.winkel)])) {
    winkel[g] = lerp(a.winkel[g] ?? 0, b.winkel[g] ?? 0, e);
  }
  const spaet = t >= 0.5 ? b : a;
  return {
    ansicht: b.ansicht,
    gesicht: spaet.gesicht,
    winkel,
    versatz: [lerp(a.versatz[0], b.versatz[0], e), lerp(a.versatz[1], b.versatz[1], e)],
    groesse: lerp(a.groesse, b.groesse, e),
    zustaende: spaet.zustaende,
    braucht: t >= 1 ? b.braucht : [...new Set([...a.braucht, ...b.braucht])],
    haende: spaet.haende,
  };
}
