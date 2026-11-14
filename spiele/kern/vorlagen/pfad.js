// Pfade der Schriftvorlagen lesen und abtasten (Spec 2026-11-14-schriftvorlagen, 5.2).
// Ein Strich ist ein SVG-Pfad mit genau einem M am Anfang und danach nur absoluten L, C, Q.
// Der Pfadanfang ist der Startpunkt, die Laufrichtung die Schreibrichtung.

/** @typedef {{x: number, y: number}} Punkt */
/** @typedef {{befehl: "M" | "L" | "C" | "Q", punkte: Punkt[]}} Segment */

/** Anzahl der Koordinatenpaare je Befehl. */
const PAARE = { M: 1, L: 1, Q: 2, C: 3 };

/** Teilpunkte je Kurvensegment für die Längenmessung. */
const FEIN = 64;

/**
 * @param {string} d
 * @returns {Segment[]}
 */
export function zerlegePfad(d) {
  const fehler = () => new Error(`Ungültiger Pfad: ${d}`);
  const teile = String(d).match(/[A-Za-z]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/g) ?? [];
  /** @type {Segment[]} */
  const segmente = [];
  let i = 0;
  while (i < teile.length) {
    const befehl = teile[i++];
    if (!Object.hasOwn(PAARE, befehl)) throw fehler();
    if ((befehl === "M") !== (segmente.length === 0)) throw fehler();
    const n = PAARE[/** @type {keyof typeof PAARE} */ (befehl)] * 2;
    const zahlen = teile.slice(i, i + n).map(Number);
    if (zahlen.length !== n || zahlen.some((z) => Number.isNaN(z))) throw fehler();
    i += n;
    /** @type {Punkt[]} */
    const punkte = [];
    for (let k = 0; k < n; k += 2) punkte.push({ x: zahlen[k], y: zahlen[k + 1] });
    segmente.push({ befehl: /** @type {Segment["befehl"]} */ (befehl), punkte });
  }
  if (segmente.length === 0) throw fehler();
  return segmente;
}

/**
 * Punkt auf einem Segment bei t (0…1), ausgehend von `von`.
 * @param {Punkt} von
 * @param {Segment} s
 * @param {number} t
 * @returns {Punkt}
 */
function aufSegment(von, s, t) {
  const u = 1 - t;
  const p = s.punkte;
  if (s.befehl === "L") return { x: u * von.x + t * p[0].x, y: u * von.y + t * p[0].y };
  if (s.befehl === "Q")
    return {
      x: u * u * von.x + 2 * u * t * p[0].x + t * t * p[1].x,
      y: u * u * von.y + 2 * u * t * p[0].y + t * t * p[1].y,
    };
  return {
    x: u * u * u * von.x + 3 * u * u * t * p[0].x + 3 * u * t * t * p[1].x + t * t * t * p[2].x,
    y: u * u * u * von.y + 3 * u * u * t * p[0].y + 3 * u * t * t * p[1].y + t * t * t * p[2].y,
  };
}

/**
 * Tastet einen Pfad gleichmäßig nach Bogenlänge ab. Erster Punkt = Startpunkt, letzter = Endpunkt.
 * @param {string} d
 * @param {number} [abstand]
 * @returns {Punkt[]}
 */
export function tastePfadAb(d, abstand = 4) {
  const segmente = zerlegePfad(d);
  // Feine Linienzug-Näherung
  /** @type {Punkt[]} */
  const fein = [segmente[0].punkte[0]];
  for (const s of segmente.slice(1)) {
    const von = fein[fein.length - 1];
    const schritte = s.befehl === "L" ? 1 : FEIN;
    for (let k = 1; k <= schritte; k++) fein.push(aufSegment(von, s, k / schritte));
  }
  const laengen = [0];
  for (let k = 1; k < fein.length; k++)
    laengen.push(laengen[k - 1] + Math.hypot(fein[k].x - fein[k - 1].x, fein[k].y - fein[k - 1].y));
  const gesamt = laengen[laengen.length - 1];
  const start = fein[0];
  const ende = fein[fein.length - 1];
  if (gesamt === 0) return [{ ...start }];
  const n = Math.max(1, Math.round(gesamt / abstand));
  /** @type {Punkt[]} */
  const ergebnis = [{ x: start.x, y: start.y }];
  let k = 1;
  for (let i = 1; i < n; i++) {
    const ziel = (gesamt * i) / n;
    while (laengen[k] < ziel) k++;
    const t = (ziel - laengen[k - 1]) / (laengen[k] - laengen[k - 1] || 1);
    ergebnis.push({
      x: fein[k - 1].x + t * (fein[k].x - fein[k - 1].x),
      y: fein[k - 1].y + t * (fein[k].y - fein[k - 1].y),
    });
  }
  ergebnis.push({ x: ende.x, y: ende.y });
  return ergebnis;
}

/**
 * Einheitsvektor der Laufrichtung am Anfang oder Ende einer Punktfolge.
 * @param {Punkt[]} punkte
 * @param {"anfang" | "ende"} wo
 * @returns {Punkt}
 */
export function richtungAm(punkte, wo) {
  if (punkte.length < 2) return { x: 0, y: 0 };
  const [a, b] = wo === "anfang" ? [punkte[0], punkte[1]] : [punkte[punkte.length - 2], punkte[punkte.length - 1]];
  const l = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  return { x: (b.x - a.x) / l + 0, y: (b.y - a.y) / l + 0 };
}
