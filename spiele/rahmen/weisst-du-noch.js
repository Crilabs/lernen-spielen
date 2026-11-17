// „Weißt du noch?“ außerhalb der Bibliothek (Pause am Rundenende, Christian 2026-11-17; docs/geschichten.md §2b):
// sucht die nächste fällige Kapitelfrage (lernsteuerung: höchstens zwei am Tag, mit Abstand) und lädt sie samt Buch.
// lernsteuerung.js liegt außerhalb der Typprüfung (tsconfig); darum wird sie über ihre Adresse geladen, nicht statisch.

const GESCHICHTEN = new URL("../geschichten/", import.meta.url);
const LERNSTEUERUNG = new URL("../lernsteuerung.js", import.meta.url).href;

/** @returns {Promise<{ ladeErinnerung: (ids: Iterable<string>) => Promise<{ id: string, kapitel: number } | null>, merkeErinnert: (id: string, kapitel: number, gestellt: boolean) => Promise<void> }>} */
const lernsteuerung = () => import(LERNSTEUERUNG);

/**
 * @typedef {{ frage: string, antworten: string[], richtig: number, aufloesung: string, bild?: string }} Frage
 * @returns {Promise<{ id: string, kapitel: number, titel: string, frage: Frage, bild: string } | null>}
 */
export async function holeErinnerung() {
  /** @type {{ geschichten?: { id: string, art?: string }[] }} */
  const index = await fetch(new URL("index.json", GESCHICHTEN)).then((r) => r.json());
  const ids = (index.geschichten ?? []).filter((g) => g?.art === "sachbuch").map((g) => g.id);
  const wahl = await (await lernsteuerung()).ladeErinnerung(ids);
  if (!wahl) return null;
  const g = await fetch(new URL(`${wahl.id}/geschichte.json`, GESCHICHTEN)).then((r) => r.json());
  /** @type {Frage | undefined} */
  const e = g.kapitel?.[wahl.kapitel]?.erinnern;
  if (!e || typeof e.frage !== "string" || !Array.isArray(e.antworten)) return null;
  return { id: wahl.id, kapitel: wahl.kapitel, titel: g.titel ?? "", frage: e, bild: e.bild ? new URL(`${wahl.id}/${e.bild}`, GESCHICHTEN).href : "" };
}

/** Frage gezeigt (gestellt = false) oder beantwortet (true). @param {string} id @param {number} kapitel @param {boolean} gestellt */
export async function merkeErinnert(id, kapitel, gestellt) {
  await (await lernsteuerung()).merkeErinnert(id, kapitel, gestellt);
}
