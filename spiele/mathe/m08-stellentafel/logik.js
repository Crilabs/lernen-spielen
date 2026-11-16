// Stellentafel – reine Spiellogik ohne DOM (in Node testbar: tests/spiele/mathe/m08-stellentafel.test.mjs).
// Idee: docs/spiele/mathe/m08-stellentafel.md. Eine Aufgabe 10 + e, c − 10 oder c − e (Art `rechnen`, Themen zehn-plus
// und minus-zehner): Timo legt goldenes Material in die Stellentafel (Spalte Z: Stangen, Spalte E: Perlen), und die
// Stellenwertkarten schieben sich zur Zahl zusammen.

/**
 * @typedef {{ op: "plus" | "minus", e: number, c: number, weg: number, antwort: number, key: string }} Aufgabe
 * plus: 10 + e = c (antwort c; weg 0). minus: c − weg = antwort; weg ist 10 oder die Einerzahl e (dann bleibt 10).
 * e: die Einer von c (1 bis 9).
 */

/**
 * "plus:4+10" → { op: "plus", e: 4, c: 14 }; "minus:14-10" → { op: "minus", e: 4, c: 14, weg: 10, antwort: 4 };
 * "minus:14-4" → { …, weg: 4, antwort: 10 }. Alles andere (kein ganzer Zehner, Zahl über 19) ist null.
 * @param {string | null | undefined} key @returns {Aufgabe | null}
 */
export function aufgabeAus(key) {
  const p = /^plus:(\d+)\+(\d+)$/.exec(String(key ?? ""));
  if (p) {
    const [a, b] = [Number(p[1]), Number(p[2])];
    const e = a === 10 ? b : b === 10 ? a : 0;
    return e >= 1 && e <= 9 ? { op: "plus", e, c: 10 + e, weg: 0, antwort: 10 + e, key: String(key) } : null;
  }
  const m = /^minus:(\d+)-(\d+)$/.exec(String(key ?? ""));
  if (m) {
    const [c, weg] = [Number(m[1]), Number(m[2])];
    const e = c - 10;
    if (e < 1 || e > 9 || (weg !== 10 && weg !== e)) return null;
    return { op: "minus", e, c, weg, antwort: c - weg, key: String(key) };
  }
  return null;
}

/** Die Aufgabe, wie sie an der Tafel steht (immer „10 + x“, nie „x + 10“). @param {Aufgabe} a */
export const anzeige = (a) => (a.op === "plus" ? `10 + ${a.e} =` : `${a.c} − ${a.weg} =`);

/** Zehner und Einer einer Zahl bis 99. @param {number} w @returns {{ z: number, e: number }} */
export const teile = (w) => ({ z: Math.floor(w / 10), e: w % 10 });

/**
 * Die Karten einer Zahl: Zehnerkarte (z. B. „10“, „40“) und Einerkarte; fehlt eine Stelle, fehlt die Karte (die
 * Spalte bleibt leer und sichtbar). Über 99 gibt es keine Spalte dafür: eine einzige lange Karte.
 * @param {number} w @returns {{ z: string | null, e: string | null, lang: string | null }}
 */
export function karten(w) {
  if (w > 99) return { z: null, e: null, lang: String(w) };
  const { z, e } = teile(w);
  return { z: z ? `${z}0` : null, e: e ? String(e) : null, lang: null };
}

/** Zahlendreher (14 → 41); bei gleichen Ziffern oder Einerzahlen null. @param {number} w @returns {number | null} */
export function zahlendreher(w) {
  if (w < 10 || w > 99) return null;
  const { z, e } = teile(w);
  return e === 0 || e === z ? null : e * 10 + z;
}

/**
 * Zahlen, die ein ratendes Kind am ehesten tippt: das Ergebnis, der Zahlendreher, nur die Einer, die Nachbarn (nur für
 * die Test-Schnittstelle; das Kind kann jede Zahl tippen).
 * @param {number} antwort @returns {number[]}
 */
export function kandidaten(antwort) {
  const dreher = zahlendreher(antwort);
  const l = [antwort, ...(dreher ? [dreher] : []), antwort % 10, antwort + 1, antwort - 1, antwort + 10];
  return [...new Set(l)].filter((x) => x > 0 && x <= 99);
}

/**
 * Welcher Satz sagt, was an der getippten Zahl w nicht passt (texte.json › daneben): unterscheiden sich die Zehner,
 * sagt er, wie viele Stangen dort liegen, sonst, wie viele Perlen; über 99 gibt es nur den einen Satz.
 * @param {number} w getippt @param {number} antwort @returns {{ art: "stangen" | "perlen" | "gross", n: number }}
 */
export function danebenSatz(w, antwort) {
  if (w > 99) return { art: "gross", n: 0 };
  const t = teile(w);
  return teile(antwort).z !== t.z ? { art: "stangen", n: t.z } : { art: "perlen", n: t.e };
}

/**
 * Hilfe Stufe 1, die Probe (nie die Lösung, nie Hochzählen): das Material der Aufgabe liegt still in der Tafel, ohne
 * Karten; bei Minus hat das Wegzunehmende den Sonnenring. @param {Aufgabe} a
 * @returns {{ stange: boolean, perlen: number, ring: "stange" | "perlen" | null, satz: string }}
 */
export function probeVon(a) {
  if (a.op === "plus") return { stange: true, perlen: a.e, ring: null, satz: `plus:${a.e}` };
  return { stange: true, perlen: a.e, ring: a.weg === 10 ? "stange" : "perlen", satz: a.weg === 10 ? "stange" : "perlen" };
}

/**
 * Nächste Taste auf dem Weg zur Zahl `ziel`: die nächste Ziffer, "loeschen", wenn die Eingabe nicht mehr passt,
 * sonst "fertig". @param {string} eingabe @param {number} ziel @returns {string}
 */
export function naechsteTaste(eingabe, ziel) {
  const z = String(ziel);
  if (eingabe === z) return "fertig";
  if (!z.startsWith(eingabe)) return "loeschen";
  return z[eingabe.length];
}

/**
 * Tasten, die die Eingabe zu einer der Zahlen weiterführen (für zuege()), dazu "fertig", wo es geht, und "loeschen",
 * wenn nichts anderes mehr geht. @param {string} eingabe @param {number[]} zahlen @returns {string[]}
 */
export function tastenZu(eingabe, zahlen) {
  const t = new Set();
  for (const x of zahlen.map(String)) if (x.startsWith(eingabe) && x.length > eingabe.length) t.add(x[eingabe.length]);
  const aus = [...t].sort();
  if (zahlen.map(String).includes(eingabe)) aus.push("fertig");
  if (eingabe && !aus.length) aus.push("loeschen");
  return aus;
}

/** Eingabe nach einer Taste (höchstens drei Ziffern, keine führende Null). @param {string} eingabe @param {string} taste */
export function tippe(eingabe, taste) {
  if (taste === "loeschen") return eingabe.slice(0, -1);
  if (!/^\d$/.test(taste) || eingabe.length >= 3 || (eingabe === "" && taste === "0")) return eingabe;
  return eingabe + taste;
}

// --- Klang und Takt der Perlen ---------------------------------------------------------------------------
/** Pentatonik (C-Dur ab C5): jede Perle einen Ton höher. */
const PENTATONIK = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98];
/** Ton der i-ten Perle (1 bis 9). @param {number} i */
export const perlenTon = (i) => PENTATONIK[Math.min(PENTATONIK.length, Math.max(1, i)) - 1];
/** Ab der fünften Perle klingt ein heller Oberton mit. @param {number} i */
export const perleHell = (i) => i >= 5;
/** Abstand der Perlen in ms: alle zusammen höchstens etwa 1,1 s (Idee §1). @param {number} e */
export const perlenAbstand = (e) => Math.round(Math.min(100, 760 / Math.max(1, e)));

// --- Freude und Witz ------------------------------------------------------------------------------------
/** Bewegungen für eine richtige Antwort (Idee §7): nie zweimal dieselbe hintereinander. */
export const FREUDE = ["nicken", "bunny-hop"];
/**
 * Nächste Freude, zufällig; der Bunny-Hop seltener (etwa jede zweite bis dritte). Alle ohne Wende (Timo fällt nie zu einem Strich
 * zusammen) und kurz; sie beginnen schon mit den Perlen, damit die Folge unter 3 s bleibt. @param {string | null} vorige @param {() => number} [zufall]
 */
export function naechsteFreude(vorige, zufall = Math.random) {
  const wahl = zufall() < 0.4 ? "bunny-hop" : "nicken";
  if (wahl !== vorige) return wahl;
  return wahl === "nicken" ? "bunny-hop" : "nicken";
}

/**
 * Ein kleiner Witz, höchstens jede fünfte Aufgabe, nie bei Daneben (Idee §7): Timo linst auf die versteckte Null
 * (Plus mit Einern), eine Perle rollt davon (10 + 9), Timo winkt mit der Stange auf dem Schoß (Minus).
 * @param {Aufgabe} a @param {number} seit Aufgaben seit dem letzten Witz @param {() => number} [zufall]
 * @returns {"linsen" | "perle" | "winken" | null}
 */
export function witz(a, seit, zufall = Math.random) {
  if (seit < 4 || zufall() > 0.6) return null;
  if (a.op === "minus") return "winken";
  return a.e === 9 && zufall() < 0.5 ? "perle" : "linsen";
}

/**
 * Was zwischen zwei Aufgaben gezeigt werden muss, wenn die Rechenart wechselt (Regeln §8, Idee §5): null am
 * Rundenanfang und ohne Wechsel, sonst der Satz.
 * @param {"plus" | "minus" | null} vorher @param {"plus" | "minus"} jetzt @returns {"wegnehmen" | "dazulegen" | null}
 */
export function bildWechsel(vorher, jetzt) {
  if (vorher === null || vorher === jetzt) return null;
  return jetzt === "minus" ? "wegnehmen" : "dazulegen";
}
