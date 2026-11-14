// Bestand der Runde: Kinder, Gesichter, Haltungen, Bewegungen, Zubehör.
// Jedes Spiel meldet seine Erweiterungen mit den melde…-Funktionen an (in spiele/<spiel>/runde.js).
// Beim Anmelden wird geprüft; Fehler nennen Name und Grund, damit ein kaputter Zusatz sofort auffällt.

import { BAUM, BEINE, PLAETZE, ANSICHTEN, VERBOTENE_GESICHTER, gelenkeFuer } from "./gelenke.js";

/**
 * @typedef {import("./gelenke.js").Ansicht} Ansicht
 * @typedef {import("./gelenke.js").Bewegt} Bewegt
 * @typedef {string|{svg: string, kontur?: string}} Fassung  Fläche, wahlweise mit Kontur (Silhouette)
 * @typedef {{teil: string, svg?: string, kontur?: string, formen?: Record<string, Fassung>}} Teil  formen: Handformen, „offen“ ist Pflicht
 * @typedef {{gelenk: string, punkt: [number, number], winkel?: number, mass?: number}} Platz
 * @typedef {{drehpunkte: Record<string, [number, number]>, teile: Record<string, Teil[]>,
 *            gesicht: [number, number], plaetze: Record<string, Platz>}} KindAnsicht
 * @typedef {{id: string, name: string, pronomen: "sie"|"er", bewegt: Bewegt, entwurf?: boolean, stil?: Record<string, string>,
 *            ansichten: Partial<Record<Ansicht, KindAnsicht>>}} Kind
 * @typedef {{id: string, ansichten: Partial<Record<Ansicht, string>>}} Gesicht
 * @typedef {{vorn?: string, hinten?: string}} Haende
 * @typedef {{winkel?: Record<string, number>, versatz?: [number, number], groesse?: number, haende?: Haende}} Werte
 * @typedef {Werte & {id: string, ansicht: Ansicht|"beide", wort?: string, gesicht?: string, braucht?: string[],
 *            zustaende?: Record<string, string>, rollstuhl?: Werte}} Haltung
 * @typedef {Werte & {ms: number, haltung?: string, gesicht?: string, zustaende?: Record<string, string>}} Schritt
 * @typedef {{id: string, ansicht: Ansicht, schritte: Schritt[], mal?: number, ende: string, braucht?: string[],
 *            rollstuhl?: {schritte: Schritt[]}}} Bewegung
 * @typedef {Partial<Record<Ansicht, Fassung>>} ZubehoerSvg
 * @typedef {{platz: string, ebene: "vorne"|"hinten", svg: ZubehoerSvg, zustaende?: Record<string, ZubehoerSvg>, greift?: boolean}} ZubehoerTeil
 *   greift: an einem Hand-Platz schließt sich die Hand zur Faust (wenn die Haltung keine andere Form wählt)
 * @typedef {{id: string, wort: string, nurAnsicht?: Ansicht, teile: ZubehoerTeil[], verdeckt?: string[],
 *            je?: Record<string, {versatz?: [number, number], mass?: number}>}} Zubehoer
 */

export const bestand = {
  /** @type {Map<string, Kind>} */ kinder: new Map(),
  /** @type {Map<string, Gesicht>} */ gesichter: new Map(),
  /** @type {Map<string, Haltung>} */ haltungen: new Map(),
  /** @type {Map<string, Bewegung>} */ bewegungen: new Map(),
  /** @type {Map<string, Zubehoer>} */ zubehoer: new Map(),
};

/** Nur für Tests: alles vergessen. */
export function leereBestand() {
  for (const m of Object.values(bestand)) m.clear();
}

/** @param {string} text @returns {never} */
const fehler = (text) => {
  throw new Error(`Runde: ${text}`);
};

/** @param {string} wo @param {string|undefined} svg */
function pruefeSvg(wo, svg) {
  if (svg && /\sid\s*=/.test(svg)) fehler(`${wo}: kein id= in SVG-Teilen (mehrere Figuren auf einer Seite)`);
}

/** @param {unknown} f */
const istFassung = (f) => typeof f === "string" || (typeof f === "object" && f !== null && typeof (/** @type {any} */ (f).svg) === "string");
/** @param {string} wo @param {Fassung|undefined} f */
function pruefeFassung(wo, f) {
  if (typeof f === "string") return pruefeSvg(wo, f);
  pruefeSvg(wo, f?.svg);
  pruefeSvg(wo, f?.kontur);
}

/** @param {Map<string, {id: string}>} karte @param {string} art @param {{id: string}} def */
function frei(karte, art, def) {
  if (!def || typeof def.id !== "string" || !def.id) fehler(`${art} ohne id`);
  if (!/^[a-z0-9-]+$/.test(def.id)) fehler(`${art} „${def.id}“: Namen nur aus Kleinbuchstaben, Ziffern und Bindestrich`);
  if (karte.has(def.id)) fehler(`${art} „${def.id}“ ist schon vergeben`);
}

/** @param {string} wo @param {string} ansicht @param {boolean} [beide] */
function pruefeAnsicht(wo, ansicht, beide = false) {
  const erlaubt = beide ? [...ANSICHTEN, "beide"] : ANSICHTEN;
  if (!erlaubt.includes(/** @type {any} */ (ansicht))) fehler(`${wo}: unbekannte Ansicht „${ansicht}“`);
}

/** @param {string} wo @param {Werte|undefined} w */
function pruefeWerte(wo, w) {
  for (const g of Object.keys(w?.winkel ?? {})) if (!(g in BAUM)) fehler(`${wo}: unbekanntes Gelenk „${g}“`);
  for (const h of Object.keys(w?.haende ?? {})) if (h !== "vorn" && h !== "hinten") fehler(`${wo}: unbekannte Hand „${h}“ (vorn oder hinten)`);
}

/** @param {Werte|undefined} w */
const bewegtBeine = (w) => Object.keys(w?.winkel ?? {}).some((g) => BEINE.includes(g));

/** @param {Kind} kind */
export function meldeKind(kind) {
  frei(bestand.kinder, "Kind", kind);
  for (const [k, v] of Object.entries(kind.stil ?? {})) {
    if (!/^--[a-z-]+$/.test(k)) fehler(`Kind ${kind.id}: stil erlaubt nur CSS-Variablen (--name), nicht „${k}“`);
    if (!/^[#\w.(), %-]+$/.test(v)) fehler(`Kind ${kind.id}: Wert für ${k} enthält unerlaubte Zeichen`);
  }
  const gelenke = gelenkeFuer(kind.bewegt);
  for (const a of ANSICHTEN) {
    const ans = kind.ansichten[a];
    const wo = `Kind ${kind.id} (${a})`;
    if (!ans) {
      if (kind.entwurf) continue;
      return fehler(`${wo}: Ansicht fehlt`);
    }
    for (const g of gelenke) if (!ans.drehpunkte[g]) fehler(`${wo}: Drehpunkt für ${g} fehlt`);
    for (const [g, teile] of Object.entries(ans.teile)) {
      if (!gelenke.includes(g)) fehler(`${wo}: Teile an unbekanntem Gelenk „${g}“`);
      for (const t of teile) {
        pruefeSvg(`${wo}, Teil ${t.teil}`, t.svg);
        pruefeSvg(`${wo}, Teil ${t.teil}`, t.kontur);
        if (t.formen && !istFassung(t.formen.offen)) fehler(`${wo}, Teil ${t.teil}: Handform „offen“ fehlt`);
        for (const f of Object.values(t.formen ?? {})) pruefeFassung(`${wo}, Teil ${t.teil}`, f);
      }
    }
    if (!(ans.teile.kopf ?? []).some((t) => t.teil === "gesicht" && !t.svg)) {
      fehler(`${wo}: im kopf fehlt der Platzhalter {teil:"gesicht"}`);
    }
    if (!Array.isArray(ans.gesicht)) fehler(`${wo}: Ursprung gesicht fehlt`);
    for (const p of PLAETZE) {
      const platz = ans.plaetze[p];
      if (!platz) fehler(`${wo}: Platz ${p} fehlt`);
      if (!gelenke.includes(platz.gelenk)) fehler(`${wo}: Platz ${p} hängt an „${platz.gelenk}“, das Gelenk hat dieses Kind nicht`);
    }
  }
  bestand.kinder.set(kind.id, kind);
}

/** @param {Gesicht} g */
export function meldeGesicht(g) {
  if (VERBOTENE_GESICHTER.includes(g?.id)) fehler(`Gesicht „${g.id}“ ist nicht erlaubt (grundsaetze.md 3.1 Nr. 5)`);
  frei(bestand.gesichter, "Gesicht", g);
  for (const [a, svg] of Object.entries(g.ansichten ?? {})) {
    pruefeAnsicht(`Gesicht ${g.id}`, a);
    pruefeSvg(`Gesicht ${g.id}`, svg);
  }
  bestand.gesichter.set(g.id, g);
}

/** @param {Haltung} h */
export function meldeHaltung(h) {
  frei(bestand.haltungen, "Haltung", h);
  const wo = `Haltung ${h.id}`;
  pruefeAnsicht(wo, h.ansicht, true);
  pruefeWerte(wo, h);
  pruefeWerte(`${wo} (rollstuhl)`, h.rollstuhl);
  if (bewegtBeine(h) && !h.rollstuhl) fehler(`${wo}: bewegt die Beine, braucht eine rollstuhl-Fassung`);
  bestand.haltungen.set(h.id, h);
}

/** @param {Bewegung} b */
export function meldeBewegung(b) {
  frei(bestand.bewegungen, "Bewegung", b);
  const wo = `Bewegung ${b.id}`;
  pruefeAnsicht(wo, b.ansicht);
  if (!Array.isArray(b.schritte) || !b.schritte.length) fehler(`${wo}: keine Schritte`);
  b.schritte.forEach((s, i) => pruefeWerte(`${wo}, Schritt ${i + 1}`, s));
  (b.rollstuhl?.schritte ?? []).forEach((s, i) => pruefeWerte(`${wo} (rollstuhl), Schritt ${i + 1}`, s));
  if (b.schritte.some(bewegtBeine) && !b.rollstuhl?.schritte) {
    fehler(`${wo}: bewegt die Beine, braucht rollstuhl.schritte`);
  }
  bestand.bewegungen.set(b.id, b);
}

/** @param {Zubehoer} z */
export function meldeZubehoer(z) {
  frei(bestand.zubehoer, "Zubehör", z);
  const wo = `Zubehör ${z.id}`;
  const noetig = z.nurAnsicht ? [z.nurAnsicht] : ANSICHTEN;
  if (z.nurAnsicht) pruefeAnsicht(wo, z.nurAnsicht);
  for (const t of z.teile ?? []) {
    if (!PLAETZE.includes(t.platz)) fehler(`${wo}: unbekannter Platz „${t.platz}“`);
    if (t.ebene !== "vorne" && t.ebene !== "hinten") fehler(`${wo}: ebene muss vorne oder hinten sein`);
    const fassungen = [t.svg, ...Object.values(t.zustaende ?? {})];
    for (const f of fassungen) {
      for (const a of noetig) if (!istFassung(f?.[a])) fehler(`${wo}: SVG für Ansicht ${a} fehlt`);
      for (const fa of Object.values(f ?? {})) pruefeFassung(wo, fa);
    }
  }
  bestand.zubehoer.set(z.id, z);
}

/** @param {Zubehoer|undefined} z */
const zustaendeVon = (z) => new Set((z?.teile ?? []).flatMap((t) => Object.keys(t.zustaende ?? {})));

/**
 * Prüft Querverweise, wenn alles geladen ist (Reihenfolge der Dateien egal).
 */
export function pruefeBestand() {
  /** @param {string} wo @param {{gesicht?: string, zustaende?: Record<string, string>, braucht?: string[], haltung?: string}} d */
  const verweise = (wo, d) => {
    if (d.gesicht && !bestand.gesichter.has(d.gesicht)) fehler(`${wo}: unbekanntes Gesicht „${d.gesicht}“`);
    if (d.haltung && !bestand.haltungen.has(d.haltung)) fehler(`${wo}: unbekannte Haltung „${d.haltung}“`);
    for (const z of d.braucht ?? []) if (!bestand.zubehoer.has(z)) fehler(`${wo}: braucht unbekanntes Zubehör „${z}“`);
    for (const [z, zustand] of Object.entries(d.zustaende ?? {})) {
      if (!bestand.zubehoer.has(z)) fehler(`${wo}: unbekanntes Zubehör „${z}“`);
      if (zustand !== "" && !zustaendeVon(bestand.zubehoer.get(z)).has(zustand)) fehler(`${wo}: ${z} kennt den Zustand „${zustand}“ nicht`);
    }
  };
  for (const h of bestand.haltungen.values()) verweise(`Haltung ${h.id}`, h);
  for (const b of bestand.bewegungen.values()) {
    if (!bestand.haltungen.has(b.ende)) fehler(`Bewegung ${b.id}: ende „${b.ende}“ ist keine Haltung`);
    for (const id of [b.ende, ...[...b.schritte, ...(b.rollstuhl?.schritte ?? [])].map((s) => s.haltung).filter(Boolean)]) {
      const h = bestand.haltungen.get(/** @type {string} */ (id));
      if (h && h.ansicht !== "beide" && h.ansicht !== b.ansicht) {
        fehler(`Bewegung ${b.id}: Haltung „${id}“ gibt es nicht in der Ansicht ${b.ansicht}`);
      }
    }
    verweise(`Bewegung ${b.id}`, b);
    [...b.schritte, ...(b.rollstuhl?.schritte ?? [])].forEach((s, i) => verweise(`Bewegung ${b.id}, Schritt ${i + 1}`, s));
  }
}
