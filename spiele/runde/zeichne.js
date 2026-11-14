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
/** Strichbreite der Kontur-Schicht: die Hälfte liegt außerhalb der Fläche und bildet die Silhouette. */
const KONTUR = 6;
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

/**
 * Fläche oder Kontur einer Fassung.
 * @param {import("./bestand.js").Fassung|undefined} f @param {"flaeche"|"kontur"} modus
 */
export function fassung(f, modus) {
  if (typeof f === "string") return modus === "flaeche" ? f : "";
  return (modus === "flaeche" ? f?.svg : f?.kontur) ?? "";
}

/** Inhalt der Gesichtsgruppe. @param {Ansicht} ansicht @param {string} gesichtId */
export function gesichtInnen(ansicht, gesichtId) {
  const g = bestand.gesichter.get(gesichtId);
  const svg = g?.ansichten[ansicht];
  if (typeof svg !== "string") throw new Error(`Runde: Gesicht „${gesichtId}“ fehlt für Ansicht ${ansicht}`);
  return svg;
}

/**
 * Inhalt eines Zubehörteils (Zustandsfassung, sonst Grundfassung), als Fläche oder Kontur.
 * @param {string} zubehoerId @param {number} index @param {Ansicht} ansicht @param {string} [zustand]
 * @param {"flaeche"|"kontur"} [modus]
 */
export function zubehoerInnen(zubehoerId, index, ansicht, zustand, modus = "flaeche") {
  const t = bestand.zubehoer.get(zubehoerId)?.teile[index];
  if (!t) throw new Error(`Runde: unbekanntes Zubehör „${zubehoerId}“`);
  return fassung((zustand && t.zustaende?.[zustand]?.[ansicht]) || t.svg[ansicht], modus);
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
 * @param {string} kindId @param {Pose} pose @param {Ausstattung} [aus]
 */
export function zeichnePose(kindId, pose, aus = {}) {
  let p = pose;
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
  // Zubehör, das greift: die offene Hand an diesem Platz schließt sich zur Faust.
  for (const zb of aktiv) {
    for (const t of zb.teile) {
      const seite = t.platz === "hand-vorn" ? "vorn" : t.platz === "hand-hinten" ? "hinten" : null;
      if (t.greift && seite && p.haende[seite] === "offen") p = { ...p, haende: { ...p.haende, [seite]: "faust" } };
    }
  }

  /** @param {string} gelenk @param {"vorne"|"hinten"} ebene @param {"flaeche"|"kontur"} modus */
  const zubehoerAn = (gelenk, ebene, modus) => aktiv.flatMap((zb) => zb.teile.map((t, i) => {
    const platz = ans.plaetze[t.platz];
    if (platz.gelenk !== gelenk || t.ebene !== ebene) return "";
    const je = zb.je?.[kindId] ?? {};
    const [dx, dy] = je.versatz ?? [0, 0];
    const mass = (platz.mass ?? 1) * (je.mass ?? 1);
    const zustand = zustaende[zb.id];
    const tr = `translate(${z(platz.punkt[0] + dx)} ${z(platz.punkt[1] + dy)}) rotate(${z(platz.winkel ?? 0)}) scale(${z(mass)})`;
    const attr = modus === "kontur" ? "data-zubehoer-kontur" : "data-zubehoer";
    return `<g ${attr}="${zb.id}" data-teil="${i}"${zustand ? ` data-zustand="${zustand}"` : ""} transform="${tr}">`
      + `${zubehoerInnen(zb.id, i, p.ansicht, zustand, modus)}</g>`;
  })).join("");

  /** @param {string} gelenk @param {"flaeche"|"kontur"} modus @returns {string} */
  const gruppe = (gelenk, modus) => {
    if (!ans.drehpunkte[gelenk]) return "";
    const knoten = BAUM[gelenk];
    const eigene = (ans.teile[gelenk] ?? []).filter((t) => !verdeckt.has(t.teil)).map((t) => {
      if (t.teil === "gesicht" && !t.svg) {
        if (modus === "kontur") return "";
        const [gx, gy] = ans.gesicht;
        return `<g data-gesicht="${p.gesicht}" transform="translate(${z(gx)} ${z(gy)})">${gesichtInnen(p.ansicht, p.gesicht)}</g>`;
      }
      if (t.formen) {
        const form = gelenk.startsWith("arm-hinten") ? p.haende.hinten : p.haende.vorn;
        return fassung(t.formen[form] ?? t.formen.offen, modus);
      }
      return (modus === "flaeche" ? t.svg : t.kontur) ?? "";
    }).join("");
    return `<g data-gelenk="${gelenk}" transform="${gelenkTransform(ans, gelenk, p)}">`
      + zubehoerAn(gelenk, "hinten", modus) + knoten.vor.map((g) => gruppe(g, modus)).join("") + eigene
      + zubehoerAn(gelenk, "vorne", modus) + knoten.nach.map((g) => gruppe(g, modus)).join("") + `</g>`;
  };

  const label = labelFuer(kindId, aus.haltung);
  const blick = aus.blick === "links"
    ? `<g data-blick="links" transform="translate(320 0) scale(-1 1)">`
    : `<g data-blick="rechts">`;
  return `<svg class="runde" viewBox="0 0 320 280" overflow="visible" data-kind="${k.id}" data-ansicht="${p.ansicht}"`
    + `${aus.haltung ? ` data-haltung="${aus.haltung}"` : ""}`
    + `${k.stil ? ` style="${Object.entries(k.stil).map(([n, v]) => `${n}:${v}`).join(";")}"` : ""}`
    + ` role="img" aria-label="${label.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;")}"`
    + ` stroke="${INK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">`
    + `${blick}<g data-schicht="kontur" fill="${INK}" stroke="${INK}" stroke-width="${KONTUR}">${gruppe(WURZEL, "kontur")}</g>`
    + `<g data-schicht="flaeche">${gruppe(WURZEL, "flaeche")}</g></g></svg>`;
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
