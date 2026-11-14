// Ein Kind der Runde als SVG-Text: fester Gelenkbaum, Teile des Kindes, Gesicht, Zubehör.
// Rein: gleiche Eingabe, gleicher Text. steuere.js setzt danach nur noch transform-Attribute.

import { bestand } from "./bestand.js";
import { BAUM, WURZEL, FUSSPUNKT } from "./gelenke.js";
import { pose as posen } from "./pose.js";

/**
 * @typedef {import("./gelenke.js").Ansicht} Ansicht
 * @typedef {import("./bestand.js").KindAnsicht} KindAnsicht
 * @typedef {import("./pose.js").Pose} Pose
 * @typedef {{zubehoer?: string[], zustaende?: Record<string, string>, blick?: "rechts"|"links", haltung?: string}} Ausstattung
 */

const INK = "#3B2A6B";
/** @param {number} n */
const z = (n) => String(Math.round(n * 100) / 100);

/** @param {[number, number]} punkt @param {number} grad */
export function transformFuer(punkt, grad) {
  return `rotate(${z(grad)} ${z(punkt[0])} ${z(punkt[1])})`;
}

/**
 * transform-Attribut eines Gelenks in einer Pose. Die Wurzel trägt zusätzlich Versatz und Größe.
 * @param {KindAnsicht} ans @param {string} gelenk @param {Pose} p
 */
export function gelenkTransform(ans, gelenk, p) {
  const dreh = transformFuer(ans.drehpunkte[gelenk], p.winkel[gelenk] ?? 0);
  if (gelenk !== WURZEL) return dreh;
  const [fx, fy] = FUSSPUNKT;
  return `translate(${z(p.versatz[0])} ${z(p.versatz[1])}) translate(${fx} ${fy}) scale(${z(p.groesse)}) translate(${-fx} ${-fy}) ${dreh}`;
}

/** @param {string} kindId */
function kind(kindId) {
  const k = bestand.kinder.get(kindId);
  if (!k) throw new Error(`Runde: unbekanntes Kind „${kindId}“`);
  return k;
}

/** @param {string} kindId @param {Ansicht} ansicht */
function ansichtVon(kindId, ansicht) {
  const ans = kind(kindId).ansichten[ansicht];
  if (!ans) throw new Error(`Runde: ${kindId} hat noch keine Ansicht ${ansicht}`);
  return ans;
}

/** Inhalt der Gesichtsgruppe. @param {Ansicht} ansicht @param {string} gesichtId */
export function gesichtInnen(ansicht, gesichtId) {
  const g = bestand.gesichter.get(gesichtId);
  const svg = g?.ansichten[ansicht];
  if (typeof svg !== "string") throw new Error(`Runde: Gesicht „${gesichtId}“ fehlt für Ansicht ${ansicht}`);
  return svg;
}

/**
 * Inhalt eines Zubehörteils (Zustandsfassung, sonst Grundfassung).
 * @param {string} zubehoerId @param {number} index @param {Ansicht} ansicht @param {string} [zustand]
 */
export function zubehoerInnen(zubehoerId, index, ansicht, zustand) {
  const t = bestand.zubehoer.get(zubehoerId)?.teile[index];
  if (!t) throw new Error(`Runde: unbekanntes Zubehör „${zubehoerId}“`);
  return (zustand && t.zustaende?.[zustand]?.[ansicht]) ?? t.svg[ansicht] ?? "";
}

/**
 * Vorlesbarer Name der Figur: „Ela staunt“, ohne Wort zur Haltung nur „Ela“.
 * @param {string} kindId @param {string} [haltungId]
 */
export function labelFuer(kindId, haltungId) {
  const h = haltungId ? bestand.haltungen.get(haltungId) : undefined;
  const name = kind(kindId).name;
  return h?.wort ? `${name} ${h.wort}` : name;
}

/**
 * Zeichnet eine aufgelöste Pose.
 * @param {string} kindId @param {Pose} p @param {Ausstattung} [aus]
 */
export function zeichnePose(kindId, p, aus = {}) {
  const k = kind(kindId);
  const ans = ansichtVon(kindId, p.ansicht);
  const zustaende = { ...p.zustaende, ...(aus.zustaende ?? {}) };
  const ids = [...new Set([...p.braucht, ...(aus.zubehoer ?? [])])];
  const aktiv = ids.map((id) => {
    const zb = bestand.zubehoer.get(id);
    if (!zb) throw new Error(`Runde: unbekanntes Zubehör „${id}“`);
    return zb;
  }).filter((zb) => !zb.nurAnsicht || zb.nurAnsicht === p.ansicht);
  const verdeckt = new Set(aktiv.flatMap((zb) => zb.verdeckt ?? []));

  /** @param {string} gelenk @param {"vorne"|"hinten"} ebene */
  const zubehoerAn = (gelenk, ebene) => aktiv.flatMap((zb) => zb.teile.map((t, i) => {
    const platz = ans.plaetze[t.platz];
    if (platz.gelenk !== gelenk || t.ebene !== ebene) return "";
    const je = zb.je?.[kindId] ?? {};
    const [dx, dy] = je.versatz ?? [0, 0];
    const mass = (platz.mass ?? 1) * (je.mass ?? 1);
    const zustand = zustaende[zb.id];
    const tr = `translate(${z(platz.punkt[0] + dx)} ${z(platz.punkt[1] + dy)}) rotate(${z(platz.winkel ?? 0)}) scale(${z(mass)})`;
    return `<g data-zubehoer="${zb.id}" data-teil="${i}"${zustand ? ` data-zustand="${zustand}"` : ""} transform="${tr}">`
      + `${zubehoerInnen(zb.id, i, p.ansicht, zustand)}</g>`;
  })).join("");

  /** @param {string} gelenk @returns {string} */
  const gruppe = (gelenk) => {
    if (!ans.drehpunkte[gelenk]) return "";
    const knoten = BAUM[gelenk];
    const eigene = (ans.teile[gelenk] ?? []).filter((t) => !verdeckt.has(t.teil)).map((t) => {
      if (t.teil === "gesicht" && !t.svg) {
        const [gx, gy] = ans.gesicht;
        return `<g data-gesicht="${p.gesicht}" transform="translate(${z(gx)} ${z(gy)})">${gesichtInnen(p.ansicht, p.gesicht)}</g>`;
      }
      return t.svg ?? "";
    }).join("");
    return `<g data-gelenk="${gelenk}" transform="${gelenkTransform(ans, gelenk, p)}">`
      + zubehoerAn(gelenk, "hinten") + knoten.vor.map(gruppe).join("") + eigene
      + zubehoerAn(gelenk, "vorne") + knoten.nach.map(gruppe).join("") + `</g>`;
  };

  const label = labelFuer(kindId, aus.haltung);
  const blick = aus.blick === "links"
    ? `<g data-blick="links" transform="translate(320 0) scale(-1 1)">`
    : `<g data-blick="rechts">`;
  return `<svg class="runde" viewBox="0 0 320 280" data-kind="${k.id}" data-ansicht="${p.ansicht}"`
    + `${aus.haltung ? ` data-haltung="${aus.haltung}"` : ""} role="img" aria-label="${label}"`
    + ` stroke="${INK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">`
    + `${blick}${gruppe(WURZEL)}</g></svg>`;
}

/**
 * Ein Kind in einer Haltung als SVG-Text.
 * @param {string} kindId
 * @param {Ausstattung & {ansicht?: Ansicht, gesicht?: string}} [opts]
 */
export function zeichne(kindId, opts = {}) {
  const haltung = opts.haltung ?? "stehen";
  const p = posen(kindId, haltung, opts.ansicht);
  if (opts.gesicht) p.gesicht = opts.gesicht;
  return zeichnePose(kindId, p, { ...opts, haltung });
}
