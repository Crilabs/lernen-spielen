// Kettenhüpfer – reine Spiellogik ohne DOM (in Node testbar: tests/spiele/mathe/m37-kettenhuepfer.test.mjs).
// Entwurf: docs/spiele/mathe/m37-kettenhuepfer.md. Eine Aufgabe a · n (Art `mal`, daten { a, b: n, c }) liegt auf der
// Kette von n: a Stäbchen zu je n Perlen, das Pfeilchen am Ende von Stäbchen a trägt c.

/** Aufgaben des Kindes je Runde: die Vorratsliste hat Platz für Timos Zeile und acht weitere. */
export const AUFGABEN_JE_RUNDE = 8;

/**
 * Ding je Reihe (Abschnitt 4 des Entwurfs): das Objekt (spiele/objekte/<art>.js) und sein Zustand ("" = der erste),
 * das auf dem Regal steht und in den Korb fliegt.
 * @type {Readonly<Record<number, { art: string, zustand: string }>>}
 */
export const PACKUNG = Object.freeze({
  2: { art: "schuhpaar", zustand: "" },
  3: { art: "ballroehre", zustand: "" },
  4: { art: "gedeck", zustand: "" },
  5: { art: "broetchen", zustand: "" },
  6: { art: "eierkarton", zustand: "" },
  7: { art: "wochenschachtel", zustand: "" },
  8: { art: "stiftebox", zustand: "" },
  9: { art: "muffinkarton", zustand: "" },
  10: { art: "muenze", zustand: "zehn-cent" },
});

/** Plätze im Korb (Packungen, die gleichzeitig zu sehen sind); danach ersetzt jede neue die älteste. */
export const KORB_PLAETZE = 14;

/**
 * Platz im Korb für die k-te Packung der Runde (0 …): erst füllen sich die Plätze, dann ersetzt jede neue die älteste
 * (der Korb ist voll, die neuen liegen oben). @param {number} k @returns {{ platz: number, neu: boolean }}
 */
export function korbPlatz(k) {
  return { platz: k % KORB_PLAETZE, neu: k < KORB_PLAETZE };
}

/**
 * Die verwischte Zeile (Entwurf §7): die letzte Zeile des Kindes auf der Liste (nicht Timos), aber erst, wenn das Kind
 * mindestens zwei Zeilen geschrieben hat. Gilt für alle Kinder – Stufen der Geschichten gibt es nicht mehr (Christian
 * 2026-11-15). @param {string[]} zeilen Schlüssel "a*n" in der Reihenfolge der Liste, Timos zuerst @returns {string | null}
 */
export function verwischteZeile(zeilen) {
  const vomKind = zeilen.slice(1);
  return vomKind.length >= 2 ? vomKind[vomKind.length - 1] : null;
}

/**
 * Wo liegt die getippte Zahl gegenüber dem Ergebnis? Die Mechanik zeigt es, der Erzähler beschreibt den Ort.
 * @param {number} zahl getippt
 * @param {{ a: number, b: number }} aufgabe
 * @returns {"passt" | "hinten" | "vorn" | "ueber"} hinten = weiter hinten auf der Kette (größer), ueber = hinter dem Ende
 */
export function vergleiche(zahl, { a, b }) {
  if (zahl === a * b) return "passt";
  if (zahl > 10 * b) return "ueber";
  return zahl > a * b ? "hinten" : "vorn";
}

/**
 * Hilfe über eine Kernaufgabe, nie Hochzählen (Entwurf §8).
 * art: nachbar (ein Stäbchen Abstand), zwei (zwei Stäbchen Abstand), haelfte (5 von 10), doppelt (2 von 1),
 * tausch (10: Tauschaufgabe n · 10), eins (1: ein Stäbchen). kern: Stäbchen der Kernaufgabe (null bei tausch und eins);
 * schritt: +1/+2 weiter, −1/−2 zurück. Rechnung: die Gleichung der Lösung (Stufe 2), Ergebnis als ▢.
 * @param {number} a @param {number} n
 * @returns {{ art: "nachbar" | "zwei" | "haelfte" | "doppelt" | "tausch" | "eins", kern: number | null, schritt: number, rechnung: string, hell: number[] }}
 */
export function hilfeVon(a, n) {
  const zwischen = (/** @type {number} */ von, /** @type {number} */ bis) => {
    const l = [];
    for (let k = Math.min(von, bis) + 1; k <= Math.max(von, bis); k++) l.push(k);
    return l;
  };
  const NACHBAR = /** @type {Record<number, number>} */ ({ 3: 2, 4: 5, 6: 5, 9: 10 });
  if (a in NACHBAR) {
    const kern = NACHBAR[a];
    const schritt = a - kern;
    return { art: "nachbar", kern, schritt, rechnung: `${kern * n} ${schritt > 0 ? "+" : "−"} ${n} = ▢`, hell: zwischen(kern, a) };
  }
  if (a === 7) return { art: "zwei", kern: 5, schritt: 2, rechnung: `${5 * n} + ${2 * n} = ▢`, hell: [6, 7] };
  if (a === 8) return { art: "zwei", kern: 10, schritt: -2, rechnung: `${10 * n} − ${2 * n} = ▢`, hell: [9, 10] };
  if (a === 5) return { art: "haelfte", kern: 10, schritt: -5, rechnung: `▢ + ▢ = ${10 * n}`, hell: [1, 2, 3, 4, 5] };
  if (a === 2) return { art: "doppelt", kern: 1, schritt: 1, rechnung: `${n} + ${n} = ▢`, hell: [1, 2] };
  if (a === 10) return { art: "tausch", kern: null, schritt: 0, rechnung: `${n} · 10 = ▢`, hell: [] };
  return { art: "eins", kern: null, schritt: 0, rechnung: `1 · ${n} = ▢`, hell: [1] };
}

/**
 * Zahlen, die ein ratendes Kind auf dieser Kette am ehesten tippt: das Ergebnis und die Nachbarn um ein Stäbchen
 * (nur für die Test-Schnittstelle: deren Züge führen zu diesen Zahlen; das Kind kann jede Zahl tippen).
 * @param {number} a @param {number} n @returns {number[]}
 */
export function kandidaten(a, n) {
  return [a * n, (a - 1) * n, (a + 1) * n].filter((x) => x > 0);
}

/**
 * Nächste Taste auf dem Weg zur Zahl `ziel`: die nächste Ziffer, "loeschen", wenn die Eingabe nicht mehr passt, sonst "fertig".
 * @param {string} eingabe @param {number} ziel @returns {string}
 */
export function naechsteTaste(eingabe, ziel) {
  const z = String(ziel);
  if (eingabe === z) return "fertig";
  if (!z.startsWith(eingabe)) return "loeschen";
  return z[eingabe.length];
}

/**
 * Tasten, die die Eingabe zu einer der Zahlen weiterführen (für zuege()), dazu "fertig", wo es geht, und "loeschen",
 * wenn nichts anderes mehr geht.
 * @param {string} eingabe @param {number[]} zahlen @returns {string[]}
 */
export function tastenZu(eingabe, zahlen) {
  const t = new Set();
  for (const x of zahlen.map(String)) if (x.startsWith(eingabe) && x.length > eingabe.length) t.add(x[eingabe.length]);
  const aus = [...t].sort();
  if (zahlen.map(String).includes(eingabe)) aus.push("fertig");
  // Löschen nur, wenn die Eingabe zu keiner der Zahlen mehr führt (sonst irrt der Prüfstand lange hin und her).
  if (eingabe && !aus.length) aus.push("loeschen");
  return aus;
}

/** Eingabe nach einer Taste (höchstens drei Ziffern, keine führende Null). @param {string} eingabe @param {string} taste */
export function tippe(eingabe, taste) {
  if (taste === "loeschen") return eingabe.slice(0, -1);
  if (!/^\d$/.test(taste) || eingabe.length >= 3 || (eingabe === "" && taste === "0")) return eingabe;
  return eingabe + taste;
}

/**
 * Pfeilchen auf der Kette während einer Aufgabe a: die schon gelösten mit Zahl, das eigene immer ohne Zahl (eine
 * Aufgabe, die noch einmal dran ist, zeigt nichts zum Ablesen; Entwurf §2 Satz 6).
 * @param {Iterable<number>} geloest Stäbchen der gelösten Aufgaben dieser Kette @param {number} a
 */
export function pfeileWaehrend(geloest, a) {
  const g = new Set(geloest);
  return { pfeile: [...g].filter((k) => k !== a).sort((x, y) => x - y), leer: g.has(a) ? [a] : [] };
}

/**
 * Die Aufgabe, die Timo zu Beginn der Runde vorzeigt (L5), auf der Kette der ersten Lieferung der Lernsteuerung:
 * 1 · n (ein Stäbchen = eine Packung). Ist die erste Lieferung selbst 1 · n, zeigt er 10 · n (das Ende der Kette),
 * damit das Kind nie direkt nachtippt, was Timo eben getippt hat (L1). Jede Lieferung der Lernsteuerung bekommt das
 * Kind, keine wird verworfen (Prüfstand B, Runde 2: verworfene Lieferungen kürzten die Runde, hoben `sitzung.letzte`
 * auf und sperrten 1 · n für die Wiedervorlage). Kommt Timos Aufgabe später in der Runde, ist sein Pfeilchen leer und
 * seine Zeile verdeckt (Entwurf §2 Satz 6). @param {any} lieferung @returns {{ a: number, b: number, key: string } | null}
 */
export function vorzeigeAufgabe(lieferung) {
  const m = /^mal:(\d+)\*(\d+)$/.exec(lieferung?.ziel?.key ?? "");
  if (!m) return null;
  const b = Number(m[2]);
  const a = Number(m[1]) === 1 ? 10 : 1;
  return { a, b, key: `mal:${a}*${b}` };
}
