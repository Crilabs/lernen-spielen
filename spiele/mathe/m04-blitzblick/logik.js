// Blitzblick – reine Spiellogik ohne DOM (in Node testbar: tests/spiele/mathe/m04-blitzblick.test.mjs).
// Idee: docs/spiele/mathe/m04-blitzblick.md. Eine Aufgabe (Art `menge`, daten { n }) ist eine Menge von Glühwürmchen im
// Zehner- (bis 10) oder Zwanzigerfeld (bis 20); das Kind tippt die Perle auf Kofis Schnur, bis zu der geschoben wird.

/** Perlen je Schnur und Perlen je Fünferreihe; das Glas hat Reihen zu fünf, zwei Reihen je Zehnerfeld. */
export const SCHNUR = 10;
export const REIHE = 5;
/** Größte Menge, die das Spiel darstellt (zwei Zehnerfelder, zwei Schnüre). */
export const MAX = 20;

/** "menge:7" → { n: 7 }, sonst null. @param {string} key */
export function mengeAus(key) {
  const m = /^menge:(\d+)$/.exec(String(key ?? ""));
  return m && Number(m[1]) >= 1 && Number(m[1]) <= MAX ? { n: Number(m[1]) } : null;
}

/** Wie viele Schnüre (je zehn Perlen) liegen da? Bis 10 eine, darüber zwei. @param {number} n */
export const schnuereFuer = (n) => (n > SCHNUR ? 2 : 1);
/** Wie viele Zehnerfelder hat das Glas? @param {number} n */
export const felderFuer = (n) => (n > SCHNUR ? 2 : 1);

/**
 * Die Mulde der i-ten Lichts (ab 0): die Reihen füllen sich von oben nach unten, je Reihe fünf von links; das zweite
 * Zehnerfeld liegt unter dem ersten („oben voll, unten noch …“).
 * @param {number} i
 * @returns {{ feld: number, reihe: number, spalte: number }}
 */
export function mulde(i) {
  const feld = Math.floor(i / SCHNUR);
  const im = i % SCHNUR;
  return { feld, reihe: Math.floor(im / REIHE), spalte: im % REIHE };
}

/**
 * Der Platz der i-ten Perle (ab 0): welche Schnur, wievielte Perle darauf, und ob sie hinter der Lücke steht.
 * @param {number} i
 * @returns {{ schnur: number, platz: number, hinterLuecke: boolean }}
 */
export function perle(i) {
  const platz = i % SCHNUR;
  return { schnur: Math.floor(i / SCHNUR), platz, hinterLuecke: platz >= REIHE };
}

/**
 * Die Lichter landen Fünfer für Fünfer: die Größen der Gruppen, die zusammen losfliegen (Idee §1).
 * @param {number} m Zahl der Lichter, die landen
 * @returns {number[]}
 */
export function gruppen(m) {
  /** @type {number[]} */
  const g = [];
  for (let rest = m; rest > 0; rest -= REIHE) g.push(Math.min(REIHE, rest));
  return g;
}

/**
 * Was ein Tipp auf die k-te Perle bei der Menge n zeigt: so viele Lichter landen, so viele fehlen oder so viele Perlen
 * bleiben dunkel.
 * @param {number} k Perlen, bis zu der geschoben wurde (1 bis 20) @param {number} n gezeigte Menge
 * @returns {{ passt: boolean, landen: number, ohnePerle: number, dunkel: number }}
 */
export function wirkung(k, n) {
  return { passt: k === n, landen: Math.min(k, n), ohnePerle: Math.max(0, n - k), dunkel: Math.max(0, k - n) };
}

// --- Zahlwörter für die Sätze (texte.json) -------------------------------------------------------------------------

const EINER = ["null", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn", "elf", "zwölf",
  "dreizehn", "vierzehn", "fünfzehn", "sechzehn", "siebzehn", "achtzehn", "neunzehn", "zwanzig"];
/** @param {string} s */
const gross = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** Das Zahlwort 0 bis 20, klein: „sieben“, „eins“. @param {number} n */
export function zahlwort(n) {
  if (!Number.isInteger(n) || n < 0 || n > MAX) throw new RangeError(`zahlwort: ${n}`);
  return EINER[n];
}

/**
 * Hilfe Stufe 2, was die Lichter im Feld zeigen: bis 5 eine Reihe, 6 bis 10 „eine volle Reihe und noch r“, 11 bis 20
 * „oben voll, unten r“ (Idee §6).
 * @param {number} n
 */
export function hilfeSatz(n) {
  if (n <= REIHE) return n === 1 ? "Ein Licht in einer Reihe." : `${gross(zahlwort(n))} Lichter in einer Reihe.`;
  if (n <= SCHNUR) return `Eine volle Reihe und noch ${zahlwort(n - REIHE)}.`;
  return `Oben voll, unten ${zahlwort(n - SCHNUR)}.`;
}

/**
 * Die Sätze, die aus Daten kommen, je Zahl ausgeschrieben (keine zur Laufzeit zusammengesetzten Sätze mit Zahlen,
 * damit `npm run audio` sie findet): richtig (nach Fehlversuch oder Hilfe), zuWenig (k Lichter ohne Perle), zuViel
 * (k Perlen bleiben dunkel), hilfe2 (die Lichter im Feld).
 * @param {number} [bis]
 */
export function texteErzeugen(bis = MAX) {
  /** @type {Record<string, Record<string, string>>} */
  const t = { richtig: {}, zuWenig: {}, zuViel: {}, hilfe2: {} };
  for (let n = 1; n <= bis; n++) {
    t.richtig[n] = n === 1 ? "Ein Glühwürmchen, eine Perle." : `${gross(zahlwort(n))} Glühwürmchen, ${zahlwort(n)} Perlen.`;
    t.hilfe2[n] = hilfeSatz(n);
  }
  // Fehlt oder bleibt übrig: bis zu MAX − 1 (ein Tipp auf die erste Perle bei 20, ein Tipp auf die letzte bei 1).
  for (let k = 1; k < MAX; k++) {
    t.zuWenig[k] = k === 1 ? "Ein Glühwürmchen hat keine Perle." : `${gross(zahlwort(k))} Glühwürmchen haben keine Perle.`;
    t.zuViel[k] = k === 1 ? "Eine Perle bleibt dunkel." : `${gross(zahlwort(k))} Perlen bleiben dunkel.`;
  }
  return t;
}

// --- Prüfstand und Eingabe -----------------------------------------------------------------------------------------

/**
 * Perlen, die ein ratendes Kind am ehesten antippt: die Nachbarn der Menge (eine zu wenig, eine zu viel), dann
 * weitere (nur für die Test-Schnittstelle; das Kind kann jede Perle tippen).
 * @param {number} n gesuchte Menge @param {number} [max] Zahl der sichtbaren Perlen
 */
export function kandidaten(n, max = SCHNUR) {
  const wahl = [n, n - 1, n + 1, n - 2, n + 2].filter((k) => k >= 1 && k <= max);
  return [...new Set(wahl)];
}

/**
 * Neue Eingabe nach einer Taste auf der Tastatur (nur Stufe kopf, nur wenn die Menge zweistellig sein kann): höchstens
 * zwei Ziffern; eine einzelne Null wird von der nächsten Ziffer ersetzt; „loeschen“ nimmt die letzte.
 * @param {string} eingabe @param {string} taste
 */
export function tippeZiffer(eingabe, taste) {
  if (taste === "loeschen") return eingabe.slice(0, -1);
  if (!/^\d+$/.test(taste)) return eingabe;
  if (taste === "10") return "10";
  if (eingabe === "0") return taste;
  return eingabe.length < 2 ? eingabe + taste : eingabe;
}

/** Nächste Taste auf dem Weg zu n (Hilfe 2): die nächste Ziffer, „loeschen“, wenn die Eingabe nicht mehr passt, sonst „fertig“. @param {string} eingabe @param {number} n */
export function naechsteTaste(eingabe, n) {
  const z = String(n);
  if (eingabe === z) return "fertig";
  if (!z.startsWith(eingabe)) return "loeschen";
  return z[eingabe.length];
}
