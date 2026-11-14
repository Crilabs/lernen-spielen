// Laden der Anleitungen „Mit echten Dingen“ (docs/mit-echten-dingen.md) für Karte, Kachel, Pause und Übersicht.
// spiele/mit-echten-dingen/verzeichnis.json sagt, welche Themen eine freigegebene Anleitung haben (`npm run echte-dinge`);
// erst dann wird die Datei <fach>/<thema>.md geholt. So fragt keine Seite nach Dateien, die es nicht gibt, und kein
// Entwurf erreicht das Kind. Nur mit `?entwurf` in der Adresse der Seite (Vorschau, Prüfungen) gilt
// verzeichnis-entwurf.json mit den Entwürfen.
// Die letzte Wahl der Form merkt sich die Einstellung `echte-dinge.form` (am Profil): eine Voreinstellung für das
// nächste Mal, kein Typ des Kindes (Lerntypen gibt es nicht, grundsaetze.md §1).

import { protokoll } from "../kern/protokoll.js";
import { ladeEinstellungen, einstellung, setzeEinstellung } from "../kern/einstellungen.js";
import { liesAnleitung } from "./markdown.js";

/** @typedef {import("./markdown.js").Anleitung} Anleitung */
/** @typedef {import("./markdown.js").Form} Form */
/** @typedef {{ fach: string, name: string, titel: string, formen: { situation: string, name: string }[], entwurf: boolean }} Eintrag */

const ORDNER = new URL("../mit-echten-dingen/", import.meta.url);
export const FORM_EINSTELLUNG = "echte-dinge.form";

/** @type {Promise<{ themen: Record<string, Eintrag> }> | null} */
let verzeichnis = null;
/** @type {Map<string, Promise<Anleitung | null>>} */
const anleitungen = new Map();

/**
 * Das Verzeichnis (einmal je Seite geladen); ohne Verzeichnis leer.
 * @returns {Promise<{ themen: Record<string, Eintrag> }>}
 */
export function ladeVerzeichnis() {
  const entwurf = new URLSearchParams(globalThis.location?.search ?? "").has("entwurf");
  verzeichnis ??= fetch(new URL(entwurf ? "verzeichnis-entwurf.json" : "verzeichnis.json", ORDNER))
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
    .then((v) => (v && typeof v.themen === "object" && v.themen ? v : { themen: {} }))
    .catch((e) => {
      protokoll("Mit echten Dingen, Verzeichnis: " + (e?.message ?? e));
      return { themen: {} };
    });
  return verzeichnis;
}

/**
 * Sucht das Thema im Verzeichnis: nach Id (und Fach, wenn angegeben), sonst nach dem Namen aus dem Lernplan, wenn
 * genau ein Thema so heißt (Seiten, die nur den Namen übergeben). null, wenn es keine Anleitung gibt.
 * @param {{ thema?: string, fach?: string, titel?: string }} wer
 * @returns {Promise<{ thema: string, fach: string } | null>}
 */
export async function findeAnleitung({ thema = "", fach = "", titel = "" }) {
  const { themen } = await ladeVerzeichnis();
  if (thema) {
    const e = Object.hasOwn(themen, thema) ? themen[thema] : null;
    return e && (!fach || e.fach === fach) ? { thema, fach: e.fach } : null;
  }
  if (!titel) return null;
  const treffer = Object.entries(themen).filter(([, e]) => e.name === titel);
  return treffer.length === 1 ? { thema: treffer[0][0], fach: treffer[0][1].fach } : null;
}

/**
 * Lädt und liest eine Anleitung (gemerkt); null, wenn sie fehlt oder keine Form hat.
 * @param {string} fach
 * @param {string} thema
 * @returns {Promise<Anleitung | null>}
 */
export function ladeAnleitung(fach, thema) {
  const pfad = `${fach}/${thema}.md`;
  if (!/^[a-z0-9-]+\/[a-z0-9-]+\.md$/.test(pfad)) return Promise.resolve(null);
  if (!anleitungen.has(pfad)) {
    anleitungen.set(pfad, fetch(new URL(pfad, ORDNER))
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((t) => { const a = liesAnleitung(t); return a.formen.length ? a : null; })
      .catch((e) => {
        protokoll(`Mit echten Dingen, ${pfad}: ${e?.message ?? e}`);
        return null;
      }));
  }
  return /** @type {Promise<Anleitung | null>} */ (anleitungen.get(pfad));
}

/**
 * Die zuletzt gewählte Situation ("tisch", "bewegung", "unterwegs") oder "".
 * @returns {Promise<string>}
 */
export async function letzteForm() {
  try {
    await ladeEinstellungen();
  } catch {
    return "";
  }
  const w = einstellung(FORM_EINSTELLUNG, "");
  return typeof w === "string" ? w : "";
}

/** @param {string} situation */
export function merkeForm(situation) {
  setzeEinstellung(FORM_EINSTELLUNG, situation);
}

/**
 * Die Form der gewünschten Situation, sonst die erste.
 * @template {{ situation: string }} F
 * @param {F[]} formen
 * @param {string} [gewuenscht]
 * @returns {F | undefined}
 */
export function waehleForm(formen, gewuenscht = "") {
  return formen.find((f) => f.situation === gewuenscht) ?? formen[0];
}
