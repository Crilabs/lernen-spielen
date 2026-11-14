// Spielzeit: die Grenzen der Eltern für digitale Spiele (Spec 2026-11-14-spielzeit). Ohne DOM und ohne Speicher;
// die Uhrzeit kommt immer von außen, damit Mitternacht und Wochenwechsel testbar sind.
// Regeln (Einstellung "spielzeit", am Profil): erlaubte Wochentage, höchstens Minuten am Tag und in der Woche,
// digitale Spiele ganz ausgeblendet. Im Standard ist alles aus: die App selbst setzt keine Zeit fest (L10).
// Stand ("spielzeit-stand", am Profil): gespielte Sekunden und Zugabe je Tag, nur die laufende ISO-Woche (Mo–So).
// Startseite, Regal, Fach-Seite, „Mit echten Dingen“ und Elternbereich zählen nie und sind nie gesperrt.

/** @typedef {{ tage: number[], proTag: number | null, proWoche: number | null, ausgeblendet: boolean }} Regeln */
/** @typedef {{ sekunden: number, zugabe: number }} Tag */
/** @typedef {{ woche: string, tage: Record<string, Tag>, gewarnt?: string }} Stand */
/** @typedef {{ frei: boolean, grund: "tag" | "tag-voll" | "woche-voll" | "aus" | null, rest: number,
 *   heute: number, woche: number, zugabe: number }} Lage  rest, heute, woche in Sekunden; zugabe in Minuten */

/** @type {Readonly<Regeln>} */
export const STANDARD = Object.freeze({ tage: [1, 2, 3, 4, 5, 6, 7], proTag: null, proWoche: null, ausgeblendet: false });

/** Minuten, die „Heute mehr“ dazugibt. */
export const ZUGABE_MINUTEN = 15;
/** Unter so vielen Sekunden Rest kommt am Rundenende einmal je Tag die Vorwarnung. */
export const WARNEN_UNTER = 5 * 60;

/** @param {unknown} v @returns {number | null} */
const minuten = (v) => (typeof v === "number" && Number.isFinite(v) && v > 0 ? Math.round(v) : null);

/**
 * Bereinigt die gespeicherte Einstellung; Unbrauchbares fällt auf den Standard zurück.
 * @param {any} roh
 * @returns {Regeln}
 */
export function regeln(roh) {
  const r = roh && typeof roh === "object" ? roh : {};
  const tage = Array.isArray(r.tage)
    ? [...new Set(r.tage.filter((/** @type {any} */ t) => Number.isInteger(t) && t >= 1 && t <= 7))].sort()
    : [...STANDARD.tage];
  return { tage, proTag: minuten(r.proTag), proWoche: minuten(r.proWoche), ausgeblendet: r.ausgeblendet === true };
}

/** "2026-11-14" in Ortszeit. @param {Date} jetzt */
export const tagSchluessel = (jetzt) => jetzt.toLocaleDateString("sv");

/** 1 = Montag … 7 = Sonntag. @param {Date} jetzt */
export const wochentag = (jetzt) => jetzt.getDay() || 7;

/**
 * ISO-Woche, z. B. "2026-W46" (die Woche gehört zu dem Jahr, in dem ihr Donnerstag liegt).
 * @param {Date} jetzt
 */
export function wochenSchluessel(jetzt) {
  const d = new Date(Date.UTC(jetzt.getFullYear(), jetzt.getMonth(), jetzt.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7)); // Donnerstag dieser Woche
  const jahr = d.getUTCFullYear();
  const woche = Math.ceil(((d.getTime() - Date.UTC(jahr, 0, 1)) / 864e5 + 1) / 7);
  return `${jahr}-W${String(woche).padStart(2, "0")}`;
}

/** @param {any} t @returns {Tag} */
const tagAus = (t) => ({
  sekunden: typeof t?.sekunden === "number" && t.sekunden > 0 ? t.sekunden : 0,
  zugabe: typeof t?.zugabe === "number" && t.zugabe > 0 ? t.zugabe : 0,
});

/**
 * Der Stand der laufenden Woche: eine bereinigte Kopie; aus einer anderen Woche oder kaputt wird er leer.
 * @param {any} roh
 * @param {Date} jetzt
 * @returns {Stand}
 */
export function aktuell(roh, jetzt) {
  const woche = wochenSchluessel(jetzt);
  if (!roh || typeof roh !== "object" || roh.woche !== woche || !roh.tage || typeof roh.tage !== "object") {
    return { woche, tage: {} };
  }
  /** @type {Stand} */
  const s = { woche, tage: Object.fromEntries(Object.entries(roh.tage).map(([k, t]) => [k, tagAus(t)])) };
  if (typeof roh.gewarnt === "string") s.gewarnt = roh.gewarnt;
  return s;
}

/**
 * @param {Stand} stand
 * @param {Date} jetzt
 * @param {(t: Tag) => Tag} aendere
 * @returns {Stand}
 */
function mitTag(stand, jetzt, aendere) {
  const s = aktuell(stand, jetzt);
  const k = tagSchluessel(jetzt);
  s.tage[k] = aendere(tagAus(s.tage[k]));
  return s;
}

/**
 * Zählt gespielte Sekunden zum heutigen Tag. Liefert einen neuen Stand.
 * @param {Stand} stand
 * @param {number} sekunden
 * @param {Date} jetzt
 */
export const zaehle = (stand, sekunden, jetzt) =>
  mitTag(stand, jetzt, (t) => ({ ...t, sekunden: t.sekunden + Math.max(0, sekunden) }));

/**
 * „Heute mehr“: Minuten nur für heute, auch an einem gesperrten Tag und über der Wochengrenze.
 * @param {Stand} stand
 * @param {number} minutenDazu
 * @param {Date} jetzt
 */
export const gibZugabe = (stand, minutenDazu, jetzt) =>
  mitTag(stand, jetzt, (t) => ({ ...t, zugabe: t.zugabe + Math.max(0, minutenDazu) }));

/**
 * Darf das Kind jetzt ein digitales Spiel spielen, und wie viel ist übrig?
 * Heute erlaubt = min(Tagesgrenze, Rest der Woche ohne heute) + Zugabe; an einem gesperrten Tag ist die
 * Tagesgrenze 0. Ausgeblendet schlägt alles, auch die Zugabe.
 * @param {Regeln} r
 * @param {Stand} stand
 * @param {Date} jetzt
 * @returns {Lage}
 */
export function lage(r, stand, jetzt) {
  const s = aktuell(stand, jetzt);
  const t = tagAus(s.tage[tagSchluessel(jetzt)]);
  const heute = t.sekunden;
  const woche = Object.values(s.tage).reduce((summe, x) => summe + x.sekunden, 0);
  const basis = { heute, woche, zugabe: t.zugabe };
  if (r.ausgeblendet) return { frei: false, grund: "aus", rest: 0, ...basis };

  const tagErlaubt = r.tage.includes(wochentag(jetzt));
  const tagGrenze = tagErlaubt ? (r.proTag === null ? Infinity : r.proTag * 60) : 0;
  const wochenRest = r.proWoche === null ? Infinity : Math.max(0, r.proWoche * 60 - (woche - heute));
  const erlaubt = Math.min(tagGrenze, wochenRest) + t.zugabe * 60;
  const rest = Math.max(0, erlaubt - heute);
  if (rest > 0) return { frei: true, grund: null, rest, ...basis };

  /** @type {Lage["grund"]} */
  let grund = "tag-voll";
  if (!tagErlaubt && t.zugabe === 0) grund = "tag";
  else if (wochenRest < tagGrenze) grund = "woche-voll";
  return { frei: false, grund, rest: 0, ...basis };
}

/**
 * Ist morgen ein Spieltag? Für den Satz „Morgen geht es weiter.“ Die Tagesgrenze beginnt morgen neu, die
 * Wochengrenze nur, wenn morgen eine neue Woche beginnt.
 * @param {Regeln} r
 * @param {Stand} stand
 * @param {Date} jetzt
 */
export function morgenFrei(r, stand, jetzt) {
  if (r.ausgeblendet) return false;
  const morgen = new Date(jetzt.getFullYear(), jetzt.getMonth(), jetzt.getDate() + 1, 12);
  if (!r.tage.includes(wochentag(morgen))) return false;
  if (r.proWoche === null || wochenSchluessel(morgen) !== wochenSchluessel(jetzt)) return true;
  const woche = Object.values(aktuell(stand, jetzt).tage).reduce((summe, x) => summe + x.sekunden, 0);
  return woche < r.proWoche * 60;
}

/**
 * Vorwarnung am Rundenende: es gibt eine Grenze, weniger als fünf Minuten sind übrig, heute noch nicht gewarnt.
 * @param {Lage} l
 * @param {Stand} stand
 * @param {Date} jetzt
 */
export const warnen = (l, stand, jetzt) =>
  l.frei && l.rest < WARNEN_UNTER && aktuell(stand, jetzt).gewarnt !== tagSchluessel(jetzt);

/**
 * @param {Stand} stand
 * @param {Date} jetzt
 * @returns {Stand}
 */
export function merkeGewarnt(stand, jetzt) {
  const s = aktuell(stand, jetzt);
  s.gewarnt = tagSchluessel(jetzt);
  return s;
}
