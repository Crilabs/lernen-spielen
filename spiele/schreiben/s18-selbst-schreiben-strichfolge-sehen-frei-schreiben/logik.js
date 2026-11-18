// S18 Selbst schreiben: reine Logik ohne DOM (getestet in tests/spiele/schreiben/s18-selbst-schreiben-strichfolge-sehen-frei-schreiben.test.mjs).
// Das Blatt ist ein Buchstabenhaus in Haus-Einheiten (ein Band 100 hoch, siehe spiele/woerter/schriftzeichen.js), BREITE × HOEHE.
// Ela und Lena fahren Linienzüge ab: aus Strichen wird ein Fahrplan (Orte, Hüpfer zwischen den Strichen, Bremsen an den
// Enden); wo zwei Fahrpläne einander entgegenkommen, bremsen beide.

import { strichePunkte, zeichenMit } from "../../woerter/schriftzeichen.js";
import { gespiegelt, laenge, erkenne, bereit } from "../../schrift/erkennen.js";

export { erkenne, bereit, gespiegelt, laenge };

/** Das Blatt in Haus-Einheiten. */
export const BREITE = 640;
export const HOEHE = 300;
/** Linke Kante der Vorlage im Blatt. */
export const LINKS = 110;
/** Obergrenze der Fahrt von Ela (Wirkung etwa 2,5 s, höchstens 3 s) und Untergrenze (ms). */
export const FAHRT_MS = Object.freeze({ min: 900, max: 1200 });

/** @typedef {[number, number]} Punkt */

/** Hat das Blatt auf dieser Stufe Lineatur? Schwünge liegen zuerst frei auf der Fläche. @param {{ art?: string }} daten @param {string} stufe */
export const mitLineatur = (daten, stufe) => daten.art !== "schwung" || stufe !== "material";

/** Schwünge sind auf vorstellung und kopf eine Reihe in der Zeile. @param {{ art?: string, reihe?: boolean }} daten @param {string} stufe */
export const alsReihe = (daten, stufe) => daten.art === "schwung" && stufe !== "material" && daten.reihe === true;

/**
 * Die Vorlage im Blatt (Lenas Spur): die Striche der Aufgabe, bei Reihen die ganze Reihe, nach rechts an LINKS gerückt.
 * @param {{ zeichen: string, striche: Punkt[][], art?: string, reihe?: boolean }} daten @param {string} stufe
 * @returns {Punkt[][]}
 */
export function vorlageImBlatt(daten, stufe) {
  const z = zeichenMit(daten.zeichen);
  const roh = alsReihe(daten, stufe) && z ? strichePunkte(z, true) : daten.striche;
  const links = Math.min(...roh.flat().map((p) => p[0]));
  return roh.map((s) => s.map(([x, y]) => /** @type {Punkt} */ ([x - links + LINKS, y])));
}

/** Der Anfang der Vorlage (Startpunkt). @param {Punkt[][]} striche @returns {Punkt} */
export const startVon = (striche) => striche[0][0];

/** Ist die Vorlage so aufgebaut, dass sie zur Reihe wird? (Kein Einzelstrich, sondern Reihe.) */
export const hatReihe = (/** @type {{ reihe?: boolean }} */ d) => d.reihe === true;

/** Wie weit die Vorlage im Blatt von links nach rechts reicht. @param {Punkt[][]} striche */
export const breiteVon = (striche) => Math.max(...striche.flat().map((p) => p[0])) - Math.min(...striche.flat().map((p) => p[0]));

/**
 * Welcher feste Satz Lena zu einem Befund sagt (Idee §4); der Befund kommt aus erkenne().
 * @param {string} grund start | richtung | spiegel | reihenfolge | form | kurz
 * @param {string} zeichenId
 * @returns {"andersherum" | "bogen" | "oben" | "stab" | "anders"}
 */
export function satzZu(grund, zeichenId) {
  const z = zeichenMit(zeichenId);
  if (!z) return "anders";
  if (grund === "spiegel") return z.spiegel ? "bogen" : z.richtung === "andersherum" ? "andersherum" : "anders";
  if (grund === "richtung") return z.richtung === "andersherum" ? "andersherum" : z.richtung === "oben" ? "oben" : "anders";
  if (grund === "start") return z.richtung === "oben" ? "oben" : "anders";
  if (grund === "reihenfolge") return z.erstStab ? "stab" : "anders";
  return "anders";
}

/** Ecken eines Linienzugs (Wechsel der Richtung um mehr als etwa 50°), als Indizes. @param {Punkt[]} p @returns {number[]} */
export function ecken(p) {
  const aus = [];
  for (let i = 1; i < p.length - 1; i++) {
    const a = [p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]];
    const b = [p[i + 1][0] - p[i][0], p[i + 1][1] - p[i][1]];
    const la = Math.hypot(a[0], a[1]);
    const lb = Math.hypot(b[0], b[1]);
    if (la < 0.5 || lb < 0.5) continue;
    const cos = (a[0] * b[0] + a[1] * b[1]) / (la * lb);
    if (cos < 0.64) aus.push(i);
  }
  return aus;
}

/**
 * @typedef {{ x: number, y: number, t: number, hoch: number, blick: 1 | -1, rattert: boolean }} Stelle
 * @typedef {{ stellen: Stelle[], dauer: number, striche: { von: number, bis: number }[] }} Fahrplan
 */

/**
 * Fahrplan für einen Roller auf Strichen. Gleichmäßiges Tempo auf dem Strich (Dauer gesamt `fahrtMs`), an jedem Strichende
 * bremst er kurz (`bremseMs`), hebt ab, hüpft zum nächsten Anfang und setzt dort an (`huepfMs`). Ein Punkt (Tupfer) ist nur
 * ein Aufsetzen. Mit `ecken` hält er an den Spitzen (`eckenMs`, Lenas langsame Fahrt).
 * @param {Punkt[][]} striche
 * @param {{ fahrtMs: number, bremseMs?: number, huepfMs?: number, hohe?: number, eckenMs?: number }} o hohe: Hüpfhöhe in Einheiten
 * @returns {Fahrplan}
 */
export function fahrplan(striche, { fahrtMs, bremseMs = 70, huepfMs = 200, hohe = 26, eckenMs = 0 }) {
  const gesamt = striche.reduce((s, x) => s + laenge(x), 0) || 1;
  const proEinheit = fahrtMs / gesamt;
  /** @type {Stelle[]} */
  const stellen = [];
  /** @type {{ von: number, bis: number }[]} */
  const reihe = [];
  let t = 0;
  let blick = /** @type {1 | -1} */ (1);
  /** @param {number} x @param {number} y @param {number} hoch @param {boolean} rattert */
  const setze = (x, y, hoch, rattert) => stellen.push({ x, y, t, hoch, blick, rattert });
  striche.forEach((s, i) => {
    if (i > 0) {
      // Hüpfer vom letzten Ort zum Anfang dieses Strichs, im Bogen
      const a = stellen[stellen.length - 1];
      t += bremseMs;
      setze(a.x, a.y, 0, false);
      const b = s[0];
      for (let k = 1; k <= 6; k++) {
        const u = k / 6;
        if (b[0] - a.x > 2) blick = 1;
        else if (b[0] - a.x < -2) blick = -1;
        t += huepfMs / 6;
        setze(a.x + (b[0] - a.x) * u, a.y + (b[1] - a.y) * u, hohe * Math.sin(Math.PI * u), false);
      }
      t += 40;
      setze(b[0], b[1], 0, false);
    } else {
      setze(s[0][0], s[0][1], 0, false);
    }
    const von = stellen.length - 1;
    const hier = ecken(s);
    for (let j = 1; j < s.length; j++) {
      const dx = s[j][0] - s[j - 1][0];
      if (dx > 1.5) blick = 1;
      else if (dx < -1.5) blick = -1;
      t += Math.hypot(dx, s[j][1] - s[j - 1][1]) * proEinheit;
      setze(s[j][0], s[j][1], 0, true);
      if (eckenMs && hier.includes(j)) {
        t += eckenMs;
        setze(s[j][0], s[j][1], 0, false);
      }
    }
    reihe.push({ von, bis: stellen.length - 1 });
  });
  return { stellen, dauer: t, striche: reihe };
}

/** Ort auf dem Fahrplan zur Zeit t (linear zwischen den Stellen). @param {Fahrplan} f @param {number} t @returns {Stelle} */
export function ortZu(f, t) {
  const s = f.stellen;
  if (t <= s[0].t) return s[0];
  for (let i = 1; i < s.length; i++) {
    if (t <= s[i].t) {
      const a = s[i - 1];
      const b = s[i];
      const u = b.t === a.t ? 1 : (t - a.t) / (b.t - a.t);
      return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, t, hoch: a.hoch + (b.hoch - a.hoch) * u, blick: b.blick, rattert: b.rattert };
    }
  }
  return s[s.length - 1];
}

/**
 * Wann kommen sich zwei Fahrpläne entgegen? Beide starten zugleich und fahren gleich lang. Gesucht ist die erste Zeit, ab der
 * sie näher als `nah` beieinander sind, nachdem sie vorher weiter weg waren (Start nebeneinander zählt nicht).
 * @param {Fahrplan} a @param {Fahrplan} b @param {number} [nah] Einheiten
 * @returns {number | null} Zeit in ms oder null
 */
export function begegnung(a, b, nah = 40) {
  const dauer = Math.min(a.dauer, b.dauer);
  let war = false;
  for (let t = 0; t <= dauer; t += 20) {
    const p = ortZu(a, t);
    const q = ortZu(b, t);
    const d = Math.hypot(p.x - q.x, p.y - q.y);
    if (d > nah * 1.4) war = true;
    else if (war && d < nah) return t;
  }
  return null;
}

/** Das Kind schreibt so schnell oder langsam; Ela fährt im selben Tempo, gestaucht auf die Fahrzeit. @param {number} schreibMs */
export const fahrtZeit = (schreibMs) => Math.max(FAHRT_MS.min, Math.min(FAHRT_MS.max, schreibMs * 0.85));

/**
 * Die Vorlage an die Linie des Kindes gelegt (Lena fährt „genau darauf“): links an die Linie, bei freien Schwüngen auch in der Höhe.
 * @param {Punkt[][]} vorlage @param {Punkt[][]} kind @param {boolean} frei
 */
export function aufKind(vorlage, kind, frei) {
  const v = vorlage.flat();
  const k = kind.flat();
  const dx = Math.min(...k.map((p) => p[0])) - Math.min(...v.map((p) => p[0]));
  const dy = frei ? Math.min(...k.map((p) => p[1])) - Math.min(...v.map((p) => p[1])) : 0;
  return vorlage.map((s) => s.map(([x, y]) => /** @type {Punkt} */ ([x + dx, y + dy])));
}

/** Kind-Striche für den Prüfstand: richtig, rückwärts, gespiegelt (je mit Versatz im Blatt). @param {Punkt[][]} vorlage @param {"richtig" | "rueckwaerts" | "gespiegelt"} wie */
export function pruefZug(vorlage, wie) {
  if (wie === "rueckwaerts") return vorlage.map((s) => [...s].reverse()).reverse();
  if (wie === "gespiegelt") return gespiegelt(vorlage);
  return vorlage;
}

/**
 * Welche Prüfzüge gibt es jetzt, und welcher davon ist richtig? Nur Züge, die wirklich so ausgehen (ein l gespiegelt bleibt ein l).
 * @param {Punkt[][]} vorlage @param {boolean} frei
 * @returns {{ wie: "richtig" | "rueckwaerts" | "gespiegelt", ok: boolean }[]}
 */
export function pruefZuege(vorlage, frei) {
  return /** @type {const} */ (["richtig", "rueckwaerts", "gespiegelt"]).map((wie) => ({ wie, ok: erkenne(pruefZug(vorlage, wie), vorlage, { frei }).ok }));
}
