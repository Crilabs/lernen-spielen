// G02 Ich, du, wir: reine Spiellogik ohne DOM (in Node testbar, tests/spiele/grammatik/g02-ich-du-wir-person-und-verb.test.mjs).
import { verbformAus } from "../../aufgabenarten.js";
import { ENDUNG_VON, PERSONEN, PRONOMEN_VON, VERBEN, werVon } from "../../woerter/verben.js";

/** Alle Endungsplättchen in fester Reihe. */
export const ENDUNGEN = Object.freeze(["e", "st", "t", "en"]);
/** Die Fürwort-Plättchen in fester Reihe (sie steht für eine und für mehrere). */
export const FUERWOERTER = Object.freeze(["ich", "du", "er", "sie", "wir", "ihr"]);
/** Die Endungen der Personalform (Endung an den Stamm). */
export const PROBE_ENDUNGEN = Object.freeze(["e", "st", "t", "en"]);
/** Plätze auf dem Bogen (fünf Spalten, zwei Reihen, je ein großes Ding); danach kommt ein neuer Bogen. */
export const BOGEN_PLAETZE = 10;
/** Die Tastatur der Stufe kopf hat höchstens so viele Tasten (eine Reihe). */
export const MAX_TASTEN = 10;
/** So viele Stifte brauchen die fünf zusammen höchstens (wir). */
export const MAX_AUF_EINMAL = 5;

/**
 * Aufgabe aus ihrem Schlüssel (verbform:endung:malen:du) oder null.
 * @param {string | null | undefined} key
 */
export function aufgabeAus(key) {
  const d = verbformAus(/** @type {string} */ (key));
  return d ? { key: /** @type {string} */ (key), ...d } : null;
}

/** Die Plättchen der Ablage für ein Ziel: Fürwörter oder die vier Endungen der Personalform. @param {{ ziel: string }} a */
export const plaettchenFuer = (a) => (a.ziel === "pronomen" ? FUERWOERTER : PROBE_ENDUNGEN);

/** Die Endungen der Hörprobe: die vier der Personalform. @param {any} _a */
export const probeFuer = (_a) => [...PROBE_ENDUNGEN];

/**
 * Welche Person meint die Antwort? Bei „sie“ entscheidet die Endung (-t eine Person, -en mehrere), weil das Wort allein
 * es nicht sagt; sonst die Person der Aufgabe.
 * @param {any} a @param {string} antwort Plättchen (Endung oder Fürwort)
 * @returns {import("../../woerter/verben.js").Person | null}
 */
export function personDerAntwort(a, antwort) {
  if (a.ziel === "pronomen") {
    if (!FUERWOERTER.includes(antwort)) return null;
    if (antwort === "sie") return a.endung === "t" ? "sie" : "sie-pl";
    return /** @type {any} */ (antwort);
  }
  if (a.pronomen === "sie") return antwort === "t" ? "sie" : antwort === "en" ? "sie-pl" : a.person;
  return a.person;
}

/**
 * Passt das Plättchen? Die Sache urteilt. Auf der Stufe material gibt die Szene die Person vor (Ela allein oder Ela und
 * Timo): nur die genaue Antwort. Sonst zählt, ob die Form zur Person passt – bei „sie“ gehören -t und -en dazu, bei
 * einer Form wie „malt“ gehören er, sie und ihr dazu.
 * @param {any} a @param {string} plaettchen @param {string} [stufe]
 */
export function passt(a, plaettchen, stufe = "material") {
  const streng = stufe === "material";
  if (a.ziel === "endung") {
    if (streng || a.pronomen !== "sie") return plaettchen === a.endung;
    return plaettchen === "t" || plaettchen === "en";
  }
  if (!FUERWOERTER.includes(plaettchen)) return false;
  if (streng) return plaettchen === a.pronomen;
  return PERSONEN.some((p) => PRONOMEN_VON[p] === plaettchen && ENDUNG_VON[p] === a.endung);
}

/** Das Plättchen, das die Szene meint (Hilfe 2, Prüfstand). @param {any} a */
export const richtigesPlaettchen = (a) => (a.ziel === "pronomen" ? a.pronomen : a.endung);

/** Alle Plättchen, die passen. @param {any} a @param {string} [stufe] */
export const passendePlaettchen = (a, stufe = "material") => plaettchenFuer(a).filter((p) => passt(a, p, stufe));

/**
 * Was das Kind auf der Stufe kopf schreibt: die Endung (st), der Stamm bleibt sichtbar im Streifen; oder das Fürwort (sie).
 * @param {any} a @returns {string[]}
 */
export function richtigeWoerter(a) {
  if (a.ziel === "pronomen") return FUERWOERTER.filter((p) => passt(a, p, "kopf"));
  return passendePlaettchen(a, "kopf");
}

/**
 * Tippt das Kind einen Buchstaben? Weiter nur, wenn ein richtiges Wort so beginnt; fertig, wenn eines vollständig ist.
 * @param {any} a @param {string} eingabe bisher geschrieben @param {string} zeichen
 * @returns {{ ok: boolean, eingabe: string, fertig: boolean }}
 */
export function tippeBuchstabe(a, eingabe, zeichen) {
  const neu = eingabe + zeichen;
  const worte = richtigeWoerter(a);
  if (!worte.some((w) => w.startsWith(neu))) return { ok: false, eingabe, fertig: false };
  return { ok: true, eingabe: neu, fertig: worte.includes(neu) };
}

/** Der nächste Buchstabe, den Hilfe 2 mit dem Sonnenring zeigt (der erste richtige Weg). @param {any} a @param {string} eingabe */
export function naechsterBuchstabe(a, eingabe) {
  const w = richtigeWoerter(a).find((x) => x.startsWith(eingabe) && x.length > eingabe.length);
  return w ? w[eingabe.length] : null;
}

/**
 * Die Tasten der Stufe kopf: bei Endungen genau e s t n (eine Reihe), bei Fürwörtern die Buchstaben aller Fürwörter.
 * @param {any} a
 */
export function tastenFuer(a) {
  if (a.ziel === "pronomen") return [...new Set(FUERWOERTER.join(""))].join("");
  return "estn";
}

/**
 * Wer in der Szene handelt, wenn das Kind `antwort` legt (Namen der Runde und „ich“ für die eigene Hand).
 * @param {any} a @param {string} antwort
 */
export function wirkende(a, antwort) {
  const person = personDerAntwort(a, antwort);
  return person ? werVon(person, a.verb) : [];
}

/**
 * Wer hebt bei einer falschen Antwort den Stift? Die, zu denen die gelegte Endung (bzw. das Fürwort) gehört – nie die
 * Gemeinten der Aufgabe, sie warten. Passt die Endung zu niemandem (maln), hebt niemand den Stift.
 * @param {any} a @param {string} antwort
 * @returns {string[]}
 */
export function hebenStift(a, antwort) {
  const personen = PERSONEN.filter((p) => (a.ziel === "pronomen" ? PRONOMEN_VON[p] === antwort : ENDUNG_VON[p] === antwort));
  const alle = [...new Set(personen.flatMap((p) => werVon(p, a.verb)))];
  const warten = werVon(a.person, a.verb);
  return alle.filter((w) => !warten.includes(w));
}

/**
 * Welcher Wechsel steht an? null = keiner. vorstellung: nur der Satz sagt, wer; kopf: das Kind schreibt; material: die
 * Gemeinten heben wieder den Stift.
 * @param {string | null} vorher @param {string} jetzt
 */
export function bildWechsel(vorher, jetzt) {
  if (!vorher || vorher === jetzt) return null;
  return ["material", "vorstellung", "kopf"].includes(jetzt) ? jetzt : null;
}

/** Wie viele Plätze auf dem Bogen sind noch frei? @param {number} belegt */
export const freiePlaetze = (belegt) => Math.max(0, BOGEN_PLAETZE - belegt);

/** Reicht der Bogen für diese Wirkung, oder kommt vorher ein neuer? @param {number} belegt @param {number} noetig */
export const bogenReicht = (belegt, noetig) => freiePlaetze(belegt) >= noetig;

/**
 * Die Spalte des Bogens (0 bis 4), die zu einer handelnden Person gehört: Kofi links, dann Lena, die eigene Hand
 * in der Mitte, Timo und Ela rechts; wer sonst legt, legt in die Mitte. @param {string} wer
 */
export const spalteVon = (wer) => ({ kofi: 0, lena: 1, ich: 2, timo: 3, ela: 4 })[/** @type {"kofi"} */ (wer)] ?? 2;

/**
 * Der nächste freie Platz für `wer` (Platz = Reihe · 5 + Spalte): erst die eigene Spalte, dann die nächste Spalte.
 * @param {boolean[]} belegt je Platz @param {string} wer @returns {number | null}
 */
export function platzFuer(belegt, wer) {
  const s = spalteVon(wer);
  const reihenfolge = [0, 1, -1, 2, -2, 3, -3, 4, -4].map((d) => s + d).filter((x) => x >= 0 && x < 5);
  for (const spalte of reihenfolge) for (const reihe of [0, 1]) if (!belegt[reihe * 5 + spalte]) return reihe * 5 + spalte;
  return null;
}

/**
 * Die Freude nach einer richtigen Antwort: nie zweimal dieselbe, meist klein; jede dritte bis vierte hüpft der Gemeinte
 * (Idee §7). @param {string | null} vorige @param {number} seitHuepfen Aufgaben seit dem letzten Hüpfen @param {() => number} [rnd]
 * @returns {"nicken" | "winken" | "huepfen"}
 */
export function naechsteFreude(vorige, seitHuepfen, rnd = Math.random) {
  if (seitHuepfen >= 3 && vorige !== "huepfen" && rnd() < (seitHuepfen >= 4 ? 1 : 0.5)) return "huepfen";
  const klein = /** @type {("nicken" | "winken")[]} */ (["nicken", "winken"]).filter((f) => f !== vorige);
  return klein[Math.floor(rnd() * klein.length)] ?? "nicken";
}

/** Der Witz kommt höchstens jede fünfte Aufgabe und nie nach einem Fehlversuch. @param {number} seitWitz @param {boolean} nachFehler @param {() => number} [rnd] */
export const witz = (seitWitz, nachFehler, rnd = Math.random) => !nachFehler && seitWitz >= 5 && rnd() < 0.6;

/** Tonhöhe des Gemeinten i beim Akkord (wir: fünf Töne, C-Dur-Pentatonik, steigend). @param {number} i */
export function akkordTon(i) {
  const halbtoene = [0, 4, 7, 9, 12];
  return 330 * 2 ** (halbtoene[i % halbtoene.length] / 12);
}
