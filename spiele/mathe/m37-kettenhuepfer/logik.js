// Kettenhüpfer – reine Spiellogik ohne DOM (in Node testbar: tests/spiele/mathe/m37-kettenhuepfer.test.mjs).
// Idee: docs/spiele/mathe/m37-kettenhuepfer.md. Eine Aufgabe a · n (Art `mal`, daten { a, b: n, c }) liegt auf der
// Kette von n: Lena hüpft a Stäbchen zu je n Perlen weit, das Pfeilchen an ihrem Stäbchen trägt c.

/**
 * Hilfe Stufe 1, die Probe über eine nahe Kernaufgabe (nie Hochzählen, Idee §4): das Pfeilchen der Kernaufgabe `kern`
 * im Sonnenring, die Stäbchen `hell` zwischen ihr und dem Ziel leuchten. Bei 1 · n leuchtet nur das erste Stäbchen.
 * Bei 10 · n ist die Probe 5 · n (die Hälfte der Kette), nicht die Tauschaufgabe – die wäre schon die Lösung.
 * @param {number} a
 * @returns {{ kern: number | null, hell: number[] }}
 */
export function hilfeVon(a) {
  const zwischen = (/** @type {number} */ von, /** @type {number} */ bis) => {
    const l = [];
    for (let k = Math.min(von, bis) + 1; k <= Math.max(von, bis); k++) l.push(k);
    return l;
  };
  /** @type {Record<number, number>} */
  const KERN = { 2: 1, 3: 2, 4: 5, 6: 5, 7: 5, 8: 10, 9: 10, 10: 5 };
  if (a === 1) return { kern: null, hell: [1] };
  if (a === 5) return { kern: 10, hell: [1, 2, 3, 4, 5] };
  const kern = KERN[a];
  if (!kern) return { kern: null, hell: [] };
  // Rückwärts (4, 8, 9): die Stäbchen, die von der Kernaufgabe weggehen, liegen zwischen Ziel und Kern.
  return { kern, hell: kern < a ? zwischen(kern, a) : zwischen(a, kern) };
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
 * Pfeilchen auf der Kette während einer Aufgabe a: die schon gelösten mit Zahl, das eigene nie (eine Aufgabe, die
 * noch einmal dran ist, zeigt nichts zum Ablesen; Idee §3).
 * @param {Iterable<number>} geloest Stäbchen der gelösten Aufgaben dieser Kette @param {number} a
 * @returns {number[]}
 */
export function pfeileWaehrend(geloest, a) {
  return [...new Set(geloest)].filter((k) => k !== a).sort((x, y) => x - y);
}

/**
 * Kette der Einführung (Idee §6): die Kette der ersten Aufgabe; Lena macht 2 · n vor, das Kind tippt 3 · n. Ist die
 * erste Aufgabe selbst 2 · n oder 3 · n, nimmt die Einführung eine andere Kette, damit das Kind nie nachtippt, was es
 * eben gesehen hat (L1). @param {number} a @param {number} n @returns {number}
 */
export function einfuehrungsKette(a, n) {
  if (a !== 2 && a !== 3) return n;
  return n === 10 ? 9 : n + 1;
}

/**
 * Dauer der Hüpfer (ms) über a Stäbchen: je Hüpfer 0,24 s, bei vielen Stäbchen schneller (alle zusammen höchstens
 * etwa 1,6 s); der Hüpfer von Stäbchen 5 auf 6 in die zweite Reihe ist ein großer Bogen (0,4 s, bei vielen kürzer).
 * @param {number} a @returns {number[]} Dauer des Hüpfers auf Stäbchen 1 … a
 */
export function hueperZeiten(a) {
  const je = Math.round(Math.min(240, 1400 / Math.max(1, a)));
  const gross = Math.round(Math.min(400, je * 1.7));
  return Array.from({ length: a }, (_, i) => (i === 5 ? gross : je));
}

/** Pentatonik ab c'' (Hz): Hüpfer k klingt eine Stufe höher als Hüpfer k − 1. @param {number} k 1 … 10 */
export function hueperTon(k) {
  const STUFEN = [0, 2, 4, 7, 9];
  const i = Math.max(0, k - 1);
  const halbton = 12 * Math.floor(i / 5) + STUFEN[i % 5];
  return 523.25 * 2 ** (halbton / 12);
}

/** Freude nach einer richtigen Landung (Idee §7): kleiner Sprung, Drehung, Freudentanz (seltener, etwa jede vierte). */
export const FREUDE = Object.freeze(["huepfen", "umdrehen", "freudentanz"]);

/**
 * Nächste Freude: nie zweimal dieselbe hintereinander, zufällig; der Freudentanz etwa jedes vierte Mal.
 * @param {string | null} vorige @param {() => number} [rnd] @returns {string}
 */
export function naechsteFreude(vorige, rnd = Math.random) {
  const gross = rnd() < 0.25;
  const wahl = gross ? ["freudentanz"] : ["huepfen", "umdrehen"];
  const frei = wahl.filter((f) => f !== vorige);
  const liste = frei.length ? frei : FREUDE.filter((f) => f !== vorige);
  return liste[Math.floor(rnd() * liste.length) % liste.length];
}

/**
 * Ein kleiner Witz der Figur statt der Freude (Idee §7), höchstens jede fünfte Aufgabe: bei 10 · n balanciert Lena am
 * Kettenende, bei 1 · n schaut sie nach dem winzigen Hüpfer zweimal hin. Sonst null.
 * @param {number} a @param {number} seitWitz gelöste Aufgaben seit dem letzten Witz
 * @returns {string | null} Bewegung der Runde
 */
export function witz(a, seitWitz) {
  if (seitWitz < 5) return null;
  if (a === 10) return "fast-umfallen";
  if (a === 1) return "doppelblick";
  return null;
}
