// Zahlenpost – reine Spiellogik ohne DOM (in Node testbar: tests/spiele/mathe/m06-zahlenpost.test.mjs).
// Idee: docs/spiele/mathe/m06-zahlenpost.md. Eine Aufgabe (Art `zahlwort`, daten { n }) ist ein gehörtes Zahlwort;
// das Kind tippt die Ziffern auf den Umschlag, Timo bringt den Brief zum Haus mit dieser Nummer.

// --- Zahlwörter (für die Sätze in texte.json und ihre Prüfung) -----------------------------------------------------

const EINER = ["null", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn", "elf", "zwölf",
  "dreizehn", "vierzehn", "fünfzehn", "sechzehn", "siebzehn", "achtzehn", "neunzehn"];
const ZEHNER = ["", "", "zwanzig", "dreißig", "vierzig", "fünfzig", "sechzig", "siebzig", "achtzig", "neunzig"];
/** @param {string} s */
const gross = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Das Zahlwort einer Zahl von 0 bis 100, klein geschrieben („siebzehn“, „einundsiebzig“, „hundert“).
 * @param {number} n
 */
export function zahlwort(n) {
  if (!Number.isInteger(n) || n < 0 || n > 100) throw new RangeError(`zahlwort: ${n}`);
  if (n === 100) return "hundert";
  if (n < 20) return EINER[n];
  const e = n % 10;
  return e === 0 ? ZEHNER[n / 10] : `${e === 1 ? "ein" : EINER[e]}und${ZEHNER[Math.floor(n / 10)]}`;
}

/** Die Zahl als Nomen für „bei der …“: „Siebzehn“, „Eins“, „Einundsiebzig“. @param {number} n */
export const nomen = (n) => gross(zahlwort(n));

/** Die Ziffer 0 bis 9 als Nomen: „Null“, „Eins“, „Sieben“. @param {number} d */
export const ziffernwort = (d) => gross(EINER[d]);

/**
 * Hilfe Stufe 1 (Probe): was auf dem Umschlag in der Reihenfolge des Wortes erscheint. Zuerst die Einer (das Wort
 * nennt sie bei 13 bis 19 zuerst), dann die Zehner; bei 0 bis 9 nur Perlen. Ganzzahlen von 0 bis 99.
 * @param {number} n
 * @returns {{ einer: number, zehner: number }} Zahl der einzelnen Perlen und Wert der Zehnerstangen (10, 20 …)
 */
export function probeVon(n) {
  return { einer: n % 10, zehner: Math.floor(n / 10) * 10 };
}

/**
 * Die Sätze der Hilfe und der Wirkung je Zahl, wie sie in texte.json stehen. Zahlwort, „bei“ und Hilfe gibt es für die
 * Zahlen, die als Aufgabe dran sein können (0 bis `bis`, Vorgabe 20: Thema 11 bis 20; für 21 bis 100 mit `bis` 100 neu
 * erzeugen); „daneben“ gibt es immer für 0 bis 99, denn das Kind kann jedes Haus der Straße antippen.
 * @param {number} [bis]
 */
export function texteErzeugen(bis = 20) {
  /** @type {Record<string, Record<string, string>>} */
  const t = { wort: {}, bei: {}, daneben: {}, hilfe1: {}, hilfe2: {} };
  for (let n = 0; n <= bis; n++) t.wort[n] = `${nomen(n)}.`;
  for (let n = 0; n <= 99; n++) {
    const wo = n === 0 ? "Post" : nomen(n);
    t.daneben[n] = `Timo steht bei der ${wo}.`;
    if (n > bis) continue;
    t.bei[n] = `Der Brief ist bei der ${wo}.`;
    const e = n % 10;
    const z = Math.floor(n / 10);
    if (n === 0) t.hilfe1[n] = "Keine Perle.";
    else if (n === 1) t.hilfe1[n] = "Eine Perle.";
    else if (n < 10) t.hilfe1[n] = `${nomen(n)} Perlen.`;
    else if (n === 10) t.hilfe1[n] = "Ein Zehner.";
    else if (n < 20) t.hilfe1[n] = `${nomen(e)} und zehn.`;
    else if (e === 0) t.hilfe1[n] = `${nomen(z)} Zehner.`;
    else t.hilfe1[n] = `${nomen(e)} und ${ZEHNER[z]}.`;
    t.hilfe2[n] = n < 10 ? `Die ${ziffernwort(n)} tippen.` : `Erst die ${ziffernwort(z)}, dann die ${ziffernwort(e)}.`;
  }
  return t;
}

// --- Eingabe -------------------------------------------------------------------------------------------------------

/**
 * Wie viele Felder hat der Umschlag? In den Stufen material und vorstellung so viele, wie die Zahl Ziffern hat
 * (eins für 0 bis 9, zwei ab 10: Spalten Z | E); in der Stufe kopf keine Felder (freie Zeile, null).
 * @param {number} n @param {string} [stufe]
 * @returns {0 | 1 | 2}
 */
export const felderFuer = (n, stufe = "material") => (stufe === "kopf" ? 0 : n >= 10 ? 2 : 1);

/**
 * Neue Eingabe nach einer Taste. Mit Feldern wird von links nach rechts gefüllt, nicht mehr als Felder da sind; in
 * der freien Zeile höchstens zwei Ziffern, eine einzelne Null wird durch die nächste Ziffer ersetzt. „loeschen“
 * nimmt die letzte Ziffer.
 * @param {string} eingabe @param {string} taste @param {number} felder 0 (freie Zeile), 1 oder 2
 */
export function tippe(eingabe, taste, felder) {
  if (taste === "loeschen") return eingabe.slice(0, -1);
  if (!/^\d$/.test(taste)) return eingabe;
  const max = felder > 0 ? felder : 2;
  if (felder === 0 && eingabe === "0") return taste;
  return eingabe.length < max ? eingabe + taste : eingabe;
}

/** Darf „Fertig“ gelten? Mit Feldern erst, wenn alle gefüllt sind; in der freien Zeile ab einer Ziffer. @param {string} eingabe @param {number} felder */
export const bereit = (eingabe, felder) => (felder > 0 ? eingabe.length === felder : eingabe.length >= 1);

/** Die Ziffern der Zahl, wie das Kind sie auf dem Umschlag tippen müsste. @param {number} n @param {number} felder */
export const ziffernVon = (n, felder) => (felder > 0 ? String(n).padStart(felder, "0") : String(n));

/**
 * Nächste Taste auf dem Weg zur Zahl n: die nächste Ziffer, "loeschen", wenn die Eingabe nicht mehr passt, sonst "fertig".
 * @param {string} eingabe @param {number} n @param {number} felder
 */
export function naechsteTaste(eingabe, n, felder) {
  const z = ziffernVon(n, felder);
  if (eingabe === z) return "fertig";
  if (!z.startsWith(eingabe)) return "loeschen";
  return z[eingabe.length];
}

/**
 * Zahlen (als Ziffernfolgen), die ein ratendes Kind am ehesten tippt: das Ergebnis, der Zahlendreher (wenn die
 * Ziffern verschieden sind) und die Nachbarn (nur für die Test-Schnittstelle; das Kind kann jede Zahl tippen).
 * @param {number} n @param {number} felder
 * @returns {string[]}
 */
export function kandidaten(n, felder) {
  const grenze = felder === 1 ? 9 : 99;
  const z = ziffernVon(n, felder);
  /** @type {number[]} */
  const wahl = [n];
  if (z.length === 2 && z[0] !== z[1]) {
    const dreher = Number(z[1] + z[0]);
    if (felder > 0 || z[1] !== "0") wahl.push(dreher);
  }
  for (const d of [1, -1, 10, -10, 2, -2]) wahl.push(n + d);
  const aus = [...new Set(wahl)].filter((x) => x >= 0 && x <= grenze);
  return aus.map((x) => ziffernVon(x, felder)).slice(0, 6);
}

/**
 * Tasten, die die Eingabe zu einer der Ziffernfolgen weiterführen, dazu "fertig", wo es geht, und "loeschen", wenn
 * nichts anderes mehr geht (für zuege()).
 * @param {string} eingabe @param {string[]} ziele @param {number} felder
 */
export function tastenZu(eingabe, ziele, felder) {
  const t = new Set();
  for (const x of ziele) if (x.startsWith(eingabe) && x.length > eingabe.length) t.add(x[eingabe.length]);
  const aus = [...t].sort();
  if (ziele.includes(eingabe) && bereit(eingabe, felder)) aus.push("fertig");
  if (eingabe && !aus.length) aus.push("loeschen");
  return aus;
}

// --- Fahrt ---------------------------------------------------------------------------------------------------------

/** Die Fahrt dauert immer so lange, egal wie weit (weit heißt schneller, die Häuser huschen vorbei). */
export const FAHRT_MS = 1400;
/** Abstand der Häuser auf der Straße in rem. */
export const HAUS_ABSTAND = 32;

/** CSS-Kurve ease-in-out (cubic-bezier(0.42, 0, 0.58, 1)): Fortschritt 0 … 1 zur Zeit t 0 … 1. @param {number} t */
export function fortschritt(t) {
  const bez = (/** @type {number} */ u, /** @type {number} */ a, /** @type {number} */ b) => 3 * (1 - u) ** 2 * u * a + 3 * (1 - u) * u * u * b + u ** 3;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 40; i++) {
    const m = (lo + hi) / 2;
    if (bez(m, 0.42, 0.58) < t) lo = m; else hi = m;
  }
  return bez((lo + hi) / 2, 0, 1);
}

/**
 * Wann (ms nach dem Start der Fahrt) kommt Timo an einem Zehnerhaus vorbei (10, 20 …)? Für den leisen Tick.
 * @param {number} von Haus, an dem er steht @param {number} nach Haus, zu dem er fährt @param {number} [dauer]
 * @returns {number[]}
 */
export function tickZeiten(von, nach, dauer = FAHRT_MS) {
  if (von === nach) return [];
  const a = Math.min(von, nach);
  const b = Math.max(von, nach);
  /** @type {number[]} */
  const zeiten = [];
  const wege = (/** @type {number} */ t) => fortschritt(t);
  for (let h = Math.ceil((a + 0.001) / 10) * 10; h <= b; h += 10) {
    if (h === von) continue;
    const anteil = (h - von) / (nach - von);
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 30; i++) {
      const m = (lo + hi) / 2;
      if (wege(m) < anteil) lo = m; else hi = m;
    }
    zeiten.push(Math.round(((lo + hi) / 2) * dauer));
  }
  return von < nach ? zeiten : zeiten.reverse();
}

// --- Freude und Witz -----------------------------------------------------------------------------------------------

export const FREUDEN = ["fahne", "pirouette", "wheelie"];

/**
 * Welche Freude kommt nach einer richtigen Antwort? Nie zweimal dieselbe hintereinander; der Wheelie ist selten
 * (etwa jede vierte), die Fähnchen und die Pirouette teilen sich den Rest.
 * @param {string | null} vorige @param {() => number} [zufall]
 */
export function naechsteFreude(vorige, zufall = Math.random) {
  const gewicht = { fahne: 3, pirouette: 3, wheelie: 2 };
  const frei = FREUDEN.filter((f) => f !== vorige);
  const summe = frei.reduce((s, f) => s + gewicht[/** @type {keyof typeof gewicht} */ (f)], 0);
  let x = zufall() * summe;
  for (const f of frei) {
    x -= gewicht[/** @type {keyof typeof gewicht} */ (f)];
    if (x < 0) return f;
  }
  return frei[frei.length - 1];
}

/**
 * Ein kleiner Witz nach einer richtigen Antwort, höchstens jede fünfte Aufgabe (seit = Aufgaben seit dem letzten):
 * bei der 0 dreht Timo einen Kreis und wirft den Brief in den Postkasten, nach einer weiten Fahrt pustet er die
 * Wangen auf, manchmal rutscht der Brief vom Schoß und er fängt ihn. Daneben nie.
 * @param {number} seit @param {number} haus @param {number} weg Zahl der Häuser, die er gefahren ist
 * @param {() => number} [zufall] @returns {"kreis" | "wangen" | "fangen" | null}
 */
export function witz(seit, haus, weg, zufall = Math.random) {
  if (seit < 4) return null;
  if (haus === 0) return zufall() < 0.7 ? "kreis" : null;
  if (zufall() > 0.45) return null;
  if (weg >= 20 && zufall() < 0.5) return "wangen";
  return "fangen";
}
