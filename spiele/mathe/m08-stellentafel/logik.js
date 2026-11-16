// Stellentafel – reine Spiellogik ohne DOM (in Node testbar: tests/spiele/mathe/m08-stellentafel.test.mjs).
// Idee: docs/spiele/mathe/m08-stellentafel.md. Eine Aufgabe 10 + e, c − 10 oder c − e (Art `rechnen`, Themen zehn-plus
// und minus-zehner): Das Kind tippt das Ergebnis in die Plätze Zehner und Einer; die Ziffern der Aufgabe und ihr
// Material wandern in die Stellentafel (Christian, 2026-11-16).

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
 * sagt er, wie viele Stangen dort liegen, sonst, wie viele Perlen.
 * @param {number} w getippt @param {number} antwort @returns {{ art: "stangen" | "perlen", n: number }}
 */
export function danebenSatz(w, antwort) {
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

// --- Stellen-Eingabe (Christian 2026-11-16): das Ergebnis in Zehner und Einer tippen ---------------------------
/** @typedef {"z" | "e"} Stelle */
/** @typedef {{ z: string, e: string, aktiv: Stelle }} Stellen Ziffer je Platz ("" = leer), aktiv trägt den Sonnenring. */

/** @returns {Stellen} */
export const leereStellen = () => ({ z: "", e: "", aktiv: "z" });

/** Eine Ziffer auf den aktiven Platz; danach ist der Einer-Platz dran. @param {Stellen} s @param {string} ziffer @returns {Stellen} */
export function tippeStelle(s, ziffer) {
  if (!/^\d$/.test(ziffer)) return s;
  return { ...s, [s.aktiv]: ziffer, aktiv: "e" };
}

/** Ein Tipp auf einen Platz wählt ihn aus. @param {Stellen} s @param {Stelle} stelle @returns {Stellen} */
export const waehleStelle = (s, stelle) => ({ ...s, aktiv: stelle });

/** Löschen: leert den aktiven Platz; ist er leer, den anderen gefüllten, und der Ring geht dorthin. @param {Stellen} s @returns {Stellen} */
export function loescheStelle(s) {
  if (s[s.aktiv]) return { ...s, [s.aktiv]: "" };
  const andere = s.aktiv === "z" ? "e" : "z";
  return s[andere] ? { ...s, [andere]: "", aktiv: andere } : s;
}

/**
 * Die getippte Zahl, oder null, wenn sie so nicht gilt: ohne Einer, oder mit einer Null als Zehner („08“). Ein leerer
 * Zehner-Platz heißt: keine Zehner (18 − 10 = 8). @param {Stellen} s @returns {number | null}
 */
export function zahlAusStellen(s) {
  if (!s.e || s.z === "0") return null;
  return Number(s.z || "0") * 10 + Number(s.e);
}

/** Die Plätze, wie sie für `antwort` aussehen müssen. @param {number} antwort @returns {{ z: string, e: string }} */
const zielStellen = (antwort) => ({ z: antwort >= 10 ? String(Math.floor(antwort / 10)) : "", e: String(antwort % 10) });

/** Stellen, deren Ziffer nicht zur Antwort passt (leer zählt als 0). @param {Stellen} s @param {number} antwort @returns {Stelle[]} */
export function falscheStellen(s, antwort) {
  const t = zielStellen(antwort);
  return /** @type {Stelle[]} */ (["z", "e"]).filter((k) => Number(s[k] || "0") !== Number(t[k] || "0"));
}

/**
 * Der nächste Zug auf dem Weg zur Zahl `antwort` (Hilfe 2 und Prüfstand): erst den Zehner-, dann den Einer-Platz
 * richtig machen (Platz wählen, falsche Ziffer löschen, Ziffer tippen), dann Fertig.
 * @param {Stellen} s @param {number} antwort
 * @returns {{ art: "platz", stelle: Stelle } | { art: "taste", taste: string } | { art: "fertig" }}
 */
export function naechsterStellenZug(s, antwort) {
  const t = zielStellen(antwort);
  for (const k of /** @type {Stelle[]} */ (["z", "e"])) {
    if (s[k] === t[k]) continue;
    if (s.aktiv !== k) return { art: "platz", stelle: k };
    return { art: "taste", taste: s[k] ? "loeschen" : t[k] };
  }
  return { art: "fertig" };
}

/** Die verschiedenen nächsten Züge zu mehreren Zahlen (für zuege() des Prüfstands). @param {Stellen} s @param {number[]} zahlen */
export function zuegeZu(s, zahlen) {
  const aus = new Map();
  for (const x of zahlen) {
    const z = naechsterStellenZug(s, x);
    aus.set(JSON.stringify(z), z);
  }
  return [...aus.values()];
}

/**
 * Die Aufgabe aus Zifferntäfelchen (die Oberfläche ist das Spiel): jede Ziffer mit ihrer Stelle (Rand in
 * Stellenfarbe) und ihrer Rolle beim Haken – „wandert“ auf ihren Platz in der Tafel, „bleibt“ stehen, „geht“ mit Timo
 * weg. Dazu das Material unter den Zahlen (unter: Index der Zahl, 0 = links). Bei c − e kommt unter der Einerziffer
 * von c eine 0 zum Vorschein, die auf den Einer-Platz wandert (nullDarunter).
 * @param {Aufgabe} a
 */
export function aufgabenTaefelchen(a) {
  /** @param {string} ziffer @param {Stelle} stelle @param {"wandert" | "bleibt" | "geht"} rolle */
  const t = (ziffer, stelle, rolle) => ({ art: "ziffer", ziffer, stelle, rolle });
  /** @param {string} zeichen */
  const z = (zeichen) => ({ art: "zeichen", zeichen });
  const e = String(a.e);
  if (a.op === "plus")
    return {
      taefelchen: [t("1", "z", "wandert"), t("0", "e", "bleibt"), z("+"), t(e, "e", "wandert"), z("=")],
      nullDarunter: false,
      material: [{ wert: 10, unter: 0, stelle: "z", rolle: "wandert" }, { wert: a.e, unter: 1, stelle: "e", rolle: "wandert" }],
    };
  const zehnerWeg = a.weg === 10;
  return {
    taefelchen: [
      t("1", "z", zehnerWeg ? "geht" : "wandert"),
      t(e, "e", zehnerWeg ? "wandert" : "geht"),
      z("−"),
      ...(zehnerWeg ? [t("1", "z", "bleibt"), t("0", "e", "bleibt")] : [t(e, "e", "bleibt")]),
      z("="),
    ],
    nullDarunter: !zehnerWeg,
    material: [
      { wert: 10, unter: 0, stelle: "z", rolle: zehnerWeg ? "geht" : "wandert" },
      { wert: a.e, unter: 0, stelle: "e", rolle: zehnerWeg ? "wandert" : "geht" },
    ],
  };
}

// --- Klang und Takt der Perlen ---------------------------------------------------------------------------
/** Pentatonik (C-Dur ab C5): jede Perle einen Ton höher. */
const PENTATONIK = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98];
/** Ton der i-ten Perle (1 bis 9). @param {number} i */
export const perlenTon = (i) => PENTATONIK[Math.min(PENTATONIK.length, Math.max(1, i)) - 1];
/** Ab der fünften Perle klingt ein heller Oberton mit. @param {number} i */
export const perleHell = (i) => i >= 5;

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
