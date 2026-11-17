// G02 Ich, du, wir: reine Spiellogik ohne DOM (in Node testbar, tests/spiele/grammatik/g02-ich-du-wir-person-und-verb.test.mjs).
import { verbformAus } from "../../aufgabenarten.js";
import { ENDUNG_VON, PERSONEN, PRONOMEN_VON, werVon } from "../../woerter/verben.js";

/** Die Endungsplättchen in fester Reihe (Verb zur Person und Grundform). */
export const ENDUNGEN = Object.freeze(["e", "st", "t", "en", "n"]);
/** Die Fürwort-Plättchen in fester Reihe (sie steht für eine und für mehrere). */
export const FUERWOERTER = Object.freeze(["ich", "du", "er", "sie", "wir", "ihr"]);
/** Die Endungen der Hörprobe: -n gehört nur zu Wörtern auf -eln und -ern, es wird nicht mitgesprochen. */
export const PROBE_ENDUNGEN = Object.freeze(["e", "st", "t", "en"]);
/** Plätze auf dem Bogen (sechs Spalten, zwei Reihen); danach kommt ein neuer Bogen. */
export const BOGEN_PLAETZE = 12;
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

/** Die Plättchen der Ablage für ein Ziel. @param {{ ziel: string }} a */
export const plaettchenFuer = (a) => (a.ziel === "pronomen" ? FUERWOERTER : ENDUNGEN);

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
  // Grundform: die Wirkung gilt allen am Tisch (der Becher kippt, jeder bekommt einen Stift)
  if (a.ziel === "grundform") return "wir";
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
  if (a.ziel === "grundform") return plaettchen === a.endung;
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
 * Die Wörter, die das Kind auf der Stufe kopf schreiben darf: die Form (malst), das Fürwort (sie) oder die Grundform.
 * @param {any} a @returns {string[]}
 */
export function richtigeWoerter(a) {
  if (a.ziel === "grundform") return [a.grundform];
  if (a.ziel === "pronomen") return FUERWOERTER.filter((p) => passt(a, p, "kopf"));
  return passendePlaettchen(a, "kopf").map((e) => `${a.stamm}${e}`);
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

/** Die Tasten der Stufe kopf: die Buchstaben der richtigen Wörter und der Endungen (e s t n), je einmal. @param {any} a */
export function tastenFuer(a) {
  const buchstaben = richtigeWoerter(a).join("") + (a.ziel === "pronomen" ? FUERWOERTER.join("") : "estn");
  return [...new Set(buchstaben)].join("");
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
 * Gemeinten der Aufgabe, sie warten. Passt die Endung zu niemandem (maln), hebt niemand den Stift. Bei der Grundform
 * gehört -t zu der Person selbst (Ela malt), -e, -st und -en zu anderen.
 * @param {any} a @param {string} antwort
 * @returns {string[]}
 */
export function hebenStift(a, antwort) {
  const personen = PERSONEN.filter((p) => (a.ziel === "pronomen" ? PRONOMEN_VON[p] === antwort : ENDUNG_VON[p] === antwort));
  const alle = [...new Set(personen.flatMap((p) => werVon(p, a.verb)))];
  if (a.ziel === "grundform") return alle.filter((w) => w !== "ich" && (antwort === "t" || !werVon(a.person, a.verb).includes(w)));
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
 * Die Spalte des Bogens (0 bis 5), die zu einer handelnden Person gehört: Kofi links, dann Lena, die eigene Hand
 * unten Mitte, Timo und Ela rechts. @param {string} wer
 */
export const spalteVon = (wer) => ({ kofi: 0, lena: 2, ich: 3, timo: 4, ela: 5 })[/** @type {"kofi"} */ (wer)] ?? 3;

/**
 * Der nächste freie Platz für `wer` (Platz = Reihe · 6 + Spalte): erst die eigene Spalte, dann die nächste Spalte.
 * @param {boolean[]} belegt je Platz @param {string} wer @returns {number | null}
 */
export function platzFuer(belegt, wer) {
  const s = spalteVon(wer);
  const reihenfolge = [0, 1, -1, 2, -2, 3, -3, 4, -4, 5, -5].map((d) => s + d).filter((x) => x >= 0 && x < 6);
  for (const spalte of reihenfolge) for (const reihe of [0, 1]) if (!belegt[reihe * 6 + spalte]) return reihe * 6 + spalte;
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
