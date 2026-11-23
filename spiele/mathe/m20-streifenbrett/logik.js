// Streifenbrett – reine Spiellogik ohne DOM (in Node testbar: tests/spiele/mathe/m20-streifenbrett.test.mjs).
// Idee: docs/spiele/mathe/m20-streifenbrett.md. Eine Aufgabe (Art `paket`, daten { op, a, b, c, raum, kniff }) ist eine Plus-
// oder Minusaufgabe bis 20. Das Kind tippt das Ergebnis; danach legt sich der Steg aus Perlenstäben aufs Wasser, und Kofi
// rennt so viele Perlen weit, wie das Kind getippt hat.

import { SCHRITT, laenge, perlenstab } from "../../rahmen/perlen-geometrie.js";

// --- Zahlwörter (für die Sätze in texte.json und ihre Prüfung) -----------------------------------------------------

const WORT = ["Null", "Eins", "Zwei", "Drei", "Vier", "Fünf", "Sechs", "Sieben", "Acht", "Neun", "Zehn", "Elf", "Zwölf",
  "Dreizehn", "Vierzehn", "Fünfzehn", "Sechzehn", "Siebzehn", "Achtzehn", "Neunzehn", "Zwanzig"];

/** Das Zahlwort von 0 bis 20, groß geschrieben („Siebzehn“). @param {number} n */
export function zahlwort(n) {
  if (!Number.isInteger(n) || n < 0 || n > 20) throw new RangeError(`zahlwort: ${n}`);
  return WORT[n];
}

/** Größte Zahl, die das Kind als Ergebnis tippen kann: zwei Ziffern. */
export const MAX_EINGABE = 99;
/** Das Brett hat 20 Plätze; eine größere getippte Zahl liegt als Boje hinter dem letzten. */
export const PLAETZE = 20;

// --- Sätze aus Daten -----------------------------------------------------------------------------------------------

/**
 * Die Sätze, die aus Daten kommen (texte.json). Zahlen stehen als Wörter, denn die Stimme spricht keine Ziffern. Ein
 * Satz zur Aufgabe oder zur Hilfe besteht aus kurzen Stücken, die nacheinander gesprochen werden („Sechs“, „Plus“, „Drei.“);
 * so reichen 21 Zahlwörter statt jeder Aufgabe ein eigener Satz (siehe `satzTeile`).
 */
export function texteErzeugen() {
  const zahl = {}, ende = {}, frage = {}, insel = {};
  for (let n = 0; n <= PLAETZE; n++) {
    zahl[n] = zahlwort(n);
    ende[n] = `${zahlwort(n)}.`;
    frage[n] = `${zahlwort(n)}?`;
    insel[n] = `Die Insel liegt bei Nummer ${zahlwort(n)}.`;
  }
  return {
    hinweis: "Sätze von M20 Streifenbrett, die aus Daten kommen (Zahlen ausgeschrieben). Ein Satz zur Aufgabe, zum Ergebnis oder zur Hilfe besteht aus kurzen Stücken, die nacheinander gesprochen werden: zahl (Zahlwort ohne Punkt), zahlEnde (am Satzende), zahlFrage (am Ende einer Frage) und die Wörter dazwischen. insel: Hilfe 2, wo die Insel liegt. wechsel: der eine Satz beim Wechsel der Lernstufe. Feste Sätze stehen im Aufruf blase.sage in spiel.js.",
    zahl,
    zahlEnde: ende,
    zahlFrage: frage,
    wort: {
      plus: "Plus",
      minus: "Minus",
      gleich: "Gleich",
      undNoch: "Und noch",
      weg: "weg?",
      nachbarPlus: "und noch eine Perle.",
      nachbarMinus: "und eine Perle weniger.",
      nullPlus: "Es kommt nichts dazu.",
      nullMinus: "Es geht nichts weg.",
      alles: "Alle Perlen gehen unter.",
      fuenf: "Eine volle Fünf und noch",
      erstDie: "Erst die",
      dannDie: "dann die",
    },
    insel,
    wechsel: {
      "tuecher-hin": "Kofi legt Tücher über die Perlen.",
      "nebel-dicht": "Jetzt liegt dichter Nebel.",
      "tuecher-weg": "Kofi nimmt die Tücher weg.",
    },
  };
}

/** Die Stücke der Aufgabe als Satz: „Sechs plus drei.“ / „Neun minus vier.“ @param {Record<string, any>} T @param {{ op: string, a: number, b: number, c: number }} d */
export function aufgabeTeile(T, d) {
  return d.op === "plus"
    ? [T.zahl[d.a], T.wort.plus, T.zahlEnde[d.b]]
    : [T.zahl[d.c], T.wort.minus, T.zahlEnde[d.b]];
}

/** Die Stücke der Gleichung: „Sechs plus drei gleich neun.“ @param {Record<string, any>} T @param {{ op: string, a: number, b: number, c: number }} d */
export function gleichungTeile(T, d) {
  return d.op === "plus"
    ? [T.zahl[d.a], T.wort.plus, T.zahl[d.b], T.wort.gleich, T.zahlEnde[d.c]]
    : [T.zahl[d.c], T.wort.minus, T.zahl[d.b], T.wort.gleich, T.zahlEnde[d.a]];
}

// --- Hilfe Stufe 1 (Probe) -----------------------------------------------------------------------------------------

/**
 * Hilfe Stufe 1: eine Probe, nicht die Lösung, nie bloßes Hochzählen (L12). `art` ist der Kniff der Aufgabe (Bild und
 * Satz); `marke` ist der Platz auf dem Brett, an dem das Schild der bekannten Nachbaraufgabe mit dem Sonnenring steht.
 * k = der bekannte Schritt, p = Ergebnis der Nachbaraufgabe, r = was noch bleibt.
 * @param {{ op: string, a: number, b: number, c: number, kniff?: string }} d
 * @returns {{ art: "null" | "nachbar" | "schritt" | "fuenf" | "tausch" | "alles", marke: number | null, k?: number, p?: number, r?: number, g?: number }}
 */
export function hilfeVon(d) {
  const { op, a, b, c } = d;
  const plus = op === "plus";
  if (b === 0) return { art: "null", marke: null };
  if (!plus && a === 0) return { art: "alles", marke: null };
  if (d.kniff === "tausch" && plus) return { art: "tausch", marke: null, g: b, k: a };
  if (d.kniff === "fuenf" && plus) return { art: "fuenf", marke: null, r: a === 5 ? b : a };
  if (b === 1) return { art: "nachbar", marke: plus ? a : c };
  // Ein bekannter Schritt k (1 bis 5) und der Rest r: 6 + 2 = 8, und noch 1.
  const k = b >= 7 ? 5 : b >= 4 ? 3 : b - 1;
  const r = b - k;
  const p = plus ? a + k : c - k;
  return { art: "schritt", marke: p, k, p, r };
}

/**
 * Der Satz der Hilfe 1 als Stücke (texte.json).
 * @param {Record<string, any>} T @param {{ op: string, a: number, b: number, c: number, kniff?: string }} d
 * @returns {string[]}
 */
export function hilfeTeile(T, d) {
  const h = hilfeVon(d);
  const plus = d.op === "plus";
  switch (h.art) {
    case "null": return [plus ? T.wort.nullPlus : T.wort.nullMinus];
    case "alles": return [T.wort.alles];
    case "nachbar": return plus ? [T.zahl[d.a], T.wort.nachbarPlus] : [T.zahl[d.c], T.wort.nachbarMinus];
    case "fuenf": return [T.wort.fuenf, T.zahlEnde[/** @type {number} */ (h.r)]];
    case "tausch": return [T.wort.erstDie, T.zahl[/** @type {number} */ (h.g)], T.wort.dannDie, T.zahlEnde[/** @type {number} */ (h.k)]];
    default: {
      const k = /** @type {number} */ (h.k);
      const p = /** @type {number} */ (h.p);
      const r = /** @type {number} */ (h.r);
      return plus
        ? [T.zahl[d.a], T.wort.plus, T.zahl[k], T.wort.gleich, T.zahlEnde[p], T.wort.undNoch, T.zahlFrage[r]]
        : [T.zahl[d.c], T.wort.minus, T.zahl[k], T.wort.gleich, T.zahlEnde[p], T.wort.undNoch, T.zahl[r], T.wort.weg];
    }
  }
}

// --- Der Steg ------------------------------------------------------------------------------------------------------

/** Spalt zwischen zwei Stäben auf dem Steg, in Perlendurchmessern. */
export const FUGE = 0.3;

/** Die Stäbe einer Zahl: bis 10 einer, darüber der goldene Zehnerstab und der Rest. @param {number} n @returns {number[]} */
export const staebe = (n) => (n <= 0 ? [] : n <= 10 ? [n] : [10, n - 10]);

/**
 * Lage der Stäbe und Perlen auf dem Steg, in Perlendurchmessern vom Ufer aus (Anfang der ersten Perle bei 0).
 * Plus: die Stäbe von a und b hintereinander. Minus: der Stab von c; die letzten b Perlen decken die „Tuch“ ab und sinken.
 * @param {{ op: string, a: number, b: number, c: number }} d
 * @returns {{ staebe: { wert: number, x: number, laenge: number }[], perlen: number[], ende: number, laenge: number,
 *   tuch: { von: number, bis: number } | null, ergebnis: number }}
 */
export function stegVon(d) {
  const plus = d.op === "plus";
  const werte = plus ? [...staebe(d.a), ...staebe(d.b)] : staebe(d.c);
  /** @type {{ wert: number, x: number, laenge: number }[]} */
  const liste = [];
  /** @type {number[]} */
  const perlen = [];
  let x = 0;
  for (const w of werte) {
    const s = /** @type {NonNullable<ReturnType<typeof perlenstab>>} */ (perlenstab(w));
    liste.push({ wert: w, x, laenge: s.laenge });
    for (const p of s.perlen) perlen.push(x + p);
    x += s.laenge + FUGE;
  }
  const ende = perlen.length ? perlen[perlen.length - 1] + SCHRITT / 2 : 0;
  // Minus: das Tuch liegt über den letzten b Perlen (von der Kante der ersten abgedeckten bis zum Ende).
  const tuch = !plus && d.b > 0 && perlen.length
    ? { von: perlen[perlen.length - d.b] - SCHRITT / 2, bis: ende }
    : null;
  return { staebe: liste, perlen, ende, laenge: x > 0 ? x - FUGE : 0, tuch, ergebnis: plus ? d.c : d.a };
}

/**
 * Wo die Mitte von Platz i (1, 2, …) liegt: auf dem Steg die Perle, dahinter in gleichen Schritten weiter (das Wasser
 * hat keine Perlen, aber die Zahl hat ihren Ort). Platz 0 ist das Ufer (Anfang der ersten Perle).
 * @param {{ perlen: number[] }} steg @param {number} i
 */
export function platzX(steg, i) {
  if (i <= 0) return 0;
  const n = steg.perlen.length;
  if (i <= n) return steg.perlen[i - 1];
  return (n ? steg.perlen[n - 1] : 0) + (i - n) * SCHRITT;
}

/** So viele Perlen läuft Kofi: so weit, wie das Kind getippt hat, höchstens bis zum Ende des Stegs. @param {{ perlen: number[] }} steg @param {number} w */
export const laufPerlen = (steg, w) => Math.min(Math.max(0, w), steg.perlen.length);

/** So lange läuft Kofi über n Perlen: 0,09 s je Perle (Idee §1), bei sehr langen Wegen etwas schneller (höchstens 1,6 s). @param {number} n */
export const laufMs = (n) => Math.round(Math.min(n * 90, 1600));

/** Lage des Pfahls k (1 bis 4, bei 5, 10, 15, 20) in Perlendurchmessern vom Ufer; das Raster liegt fest am Ufer und verrät nichts über die Aufgabe. @param {number} k */
export const pfahlX = (k) => k * 5 * SCHRITT + (k - 1) * 0.6 + 0.3;

/** Tonhöhen beim Laufen: eine Pentatonik, jede Perle einen Schritt höher (Doppelton an 5, 10, 15 macht das Spiel selbst). @param {number} i Perle ab 1 */
export function tonHoehe(i) {
  const leiter = [0, 2, 4, 7, 9];
  const o = Math.floor((i - 1) / 5);
  return 392 * 2 ** ((leiter[(i - 1) % 5] + 12 * o * 0.5) / 12);
}

// --- Eingabe (freie Zeile mit höchstens zwei Ziffern) --------------------------------------------------------------

/**
 * Neue Eingabe nach einer Taste: höchstens zwei Ziffern, eine einzelne Null wird durch die nächste Ziffer ersetzt;
 * „loeschen“ nimmt die letzte Ziffer.
 * @param {string} eingabe @param {string} taste
 */
export function tippe(eingabe, taste) {
  if (taste === "loeschen") return eingabe.slice(0, -1);
  if (!/^\d$/.test(taste)) return eingabe;
  if (eingabe === "0") return taste;
  return eingabe.length < 2 ? eingabe + taste : eingabe;
}

/** Darf der Haken gelten? Ab einer Ziffer. @param {string} eingabe */
export const bereit = (eingabe) => eingabe.length >= 1;

/**
 * Nächste Taste auf dem Weg zur Zahl n: die nächste Ziffer, "loeschen", wenn die Eingabe nicht mehr passt, sonst "fertig".
 * @param {string} eingabe @param {number} n
 */
export function naechsteTaste(eingabe, n) {
  const z = String(n);
  if (eingabe === z) return "fertig";
  if (!z.startsWith(eingabe)) return "loeschen";
  return z[eingabe.length];
}

/**
 * Zahlen, die ein ratendes Kind am ehesten tippt (nur für die Test-Schnittstelle; das Kind kann jede Zahl tippen): das
 * Ergebnis, die Nachbarn und das Rechenzeichen verwechselt.
 * @param {{ op: string, a: number, b: number, c: number }} d @returns {number[]}
 */
export function kandidaten(d) {
  const e = d.op === "plus" ? d.c : d.a;
  const falsch = d.op === "plus" ? Math.abs(d.a - d.b) : d.c + d.b;
  return [...new Set([e, e + 1, e - 1, falsch])].filter((x) => x >= 0 && x <= 20);
}

/**
 * Tasten, die die Eingabe zu einer der Zahlen weiterführen (für zuege()), dazu "fertig", wo es geht, und "loeschen",
 * wenn nichts anderes mehr geht.
 * @param {string} eingabe @param {number[]} zahlen @returns {string[]}
 */
export function tastenZu(eingabe, zahlen) {
  const t = new Set();
  const z = zahlen.map(String);
  for (const x of z) if (x.startsWith(eingabe) && x.length > eingabe.length) t.add(x[eingabe.length]);
  const aus = [...t].sort();
  if (z.includes(eingabe)) aus.push("fertig");
  if (eingabe && !aus.length) aus.push("loeschen");
  return aus;
}

// --- Freude und Witz (Idee §7) -------------------------------------------------------------------------------------

export const FREUDEN = ["hocke", "reiher", "gross"];

/**
 * Wie sich Kofi nach der Landung freut: nie zweimal gleich; der große Sprung mit Drehung etwa jedes vierte Mal.
 * @param {string | null} vorige @param {() => number} [zufall]
 */
export function naechsteFreude(vorige, zufall = Math.random) {
  const moegliche = FREUDEN.filter((f) => f !== vorige);
  const gross = moegliche.includes("gross") && zufall() < 0.4;
  if (gross) return "gross";
  const ohne = moegliche.filter((f) => f !== "gross");
  return ohne[Math.floor(zufall() * ohne.length)] ?? "hocke";
}

/**
 * Ein kleiner Witz, höchstens jede fünfte Lösung, nie bei daneben. Er gehört zur Aufgabe: bei c − c sinken alle Perlen und
 * die Insel liegt direkt am Ufer (alles), bei + 0 schaut Kofi nach dem zweiten Stab (null), sonst fällt ein Tropfen aus
 * dem Nebel auf seine Nase (tropfen).
 * @param {number} seit Lösungen seit dem letzten Witz @param {{ op: string, a: number, b: number }} d @param {() => number} [zufall]
 * @returns {"alles" | "null" | "tropfen" | null}
 */
export function witz(seit, d, zufall = Math.random) {
  if (seit < 4) return null;
  if (d.op === "minus" && d.a === 0) return "alles";
  if (d.op === "plus" && d.b === 0) return "null";
  return zufall() < 0.5 ? "tropfen" : null;
}
