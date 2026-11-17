// Wortschatz der Aufgabenart „verbform“ (G02 Ich, du, wir): regelmäßige Verben mit Stamm und Endung je Person – reine
// Daten ohne DOM. Nur Stämme ohne -t/-d/-s am Ende (kein Einschub: du malst, nicht du arbeitest); basteln (-eln) hat nur
// die Grundform-Aufgabe, weil dort im Wir und Sie-Plural nur -n steht (Idee docs/spiele/grammatik/g02-… §8, §10).

/** @typedef {"ich" | "du" | "er" | "sie" | "wir" | "ihr" | "sie-pl"} Person */
/** @typedef {{ id: string, stamm: string, grundform: string, nurGrundform?: true }} Verb */

/** Die sieben Personen; sie-pl ist „sie“ in der Mehrzahl (Timo und Ela). @type {readonly Person[]} */
export const PERSONEN = Object.freeze(["ich", "du", "er", "sie", "wir", "ihr", "sie-pl"]);

/** Die Endung der regelmäßigen Verben je Person. @type {Readonly<Record<Person, "e" | "st" | "t" | "en">>} */
export const ENDUNG_VON = Object.freeze({ ich: "e", du: "st", er: "t", sie: "t", wir: "en", ihr: "t", "sie-pl": "en" });

/** Das Fürwort, das auf dem Plättchen und im Streifen steht (sie und sie-pl sehen gleich aus). @type {Readonly<Record<Person, string>>} */
export const PRONOMEN_VON = Object.freeze({ ich: "ich", du: "du", er: "er", sie: "sie", wir: "wir", ihr: "ihr", "sie-pl": "sie" });

/** @type {Verb[]} */
export const VERBEN = [
  { id: "malen", stamm: "mal", grundform: "malen" },
  { id: "kleben", stamm: "kleb", grundform: "kleben" },
  { id: "legen", stamm: "leg", grundform: "legen" },
  { id: "bauen", stamm: "bau", grundform: "bauen" },
  { id: "rollen", stamm: "roll", grundform: "rollen" },
  { id: "tupfen", stamm: "tupf", grundform: "tupfen" },
  { id: "stecken", stamm: "steck", grundform: "stecken" },
  { id: "basteln", stamm: "bastel", grundform: "basteln", nurGrundform: true },
];

/** Verben für Endung und Fürwort (ohne basteln). */
export const VERBEN_PERSON = VERBEN.filter((v) => !v.nurGrundform);

/** Personen der Grundform-Aufgabe: eine einzelne Person der Runde (Timo, Ela), deren Verb auf -t endet. @type {readonly Person[]} */
export const PERSONEN_GRUNDFORM = Object.freeze(["er", "sie"]);

/** Wer in der Szene handelt, wenn die Aufgabe für diese Person ist (Namen der Runde; „ich“ ist die eigene Hand). */
export const NAMEN = Object.freeze({ kofi: "Kofi", lena: "Lena", timo: "Timo", ela: "Ela" });

/** Verb zu einer Kennung (malen) oder null. @param {string} id @returns {Verb | null} */
export const verbMit = (id) => VERBEN.find((v) => v.id === id) ?? null;

/** Die Personalform: Stamm und Endung (malst). @param {Verb} v @param {Person} p */
export const formVon = (v, p) => `${v.stamm}${ENDUNG_VON[p]}`;

/**
 * Wer handelt in der Szene? ich: die eigene Hand; du: Kofi oder Lena (wechselt je Verb, damit beide drankommen);
 * er: Timo; sie: Ela; wir: alle fünf; ihr: Kofi und Lena; sie-pl: Timo und Ela.
 * @param {Person} person @param {string} verbId @returns {string[]}
 */
export function werVon(person, verbId) {
  const nr = Math.max(0, VERBEN.findIndex((v) => v.id === verbId));
  switch (person) {
    case "ich": return ["ich"];
    case "du": return [nr % 2 === 0 ? "kofi" : "lena"];
    case "er": return ["timo"];
    case "sie": return ["ela"];
    case "wir": return ["ich", "kofi", "lena", "timo", "ela"];
    case "ihr": return ["kofi", "lena"];
    default: return ["timo", "ela"];
  }
}
