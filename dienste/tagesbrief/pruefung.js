// Prüfung der Ereignisse beim Eingang (Spec „Versanddienst“): Typen und Längen je Art. Ein ungültiges Ereignis lässt den
// ganzen Push scheitern, damit nichts Halbes im Topf landet und der spätere Brief nie auf unerwartete Formen trifft.

const KURZ = 200;
const MITTEL = 500;
const LANG = 1000;
export const FOTO_MAX = 60_000;

/** @param {unknown} v @param {number} max */
const text = (v, max) => typeof v === "string" && v.length <= max;
/** @param {unknown} v */
const objekt = (v) => Boolean(v) && typeof v === "object" && !Array.isArray(v);
/** @param {unknown} v @param {number} n @param {number} max */
const textListe = (v, n, max) => Array.isArray(v) && v.length <= n && v.every((x) => text(x, max));
/** Base64-Zeichen oder leer. @param {unknown} v */
const foto = (v) => typeof v === "string" && v.length <= FOTO_MAX && /^[A-Za-z0-9+/=]*$/.test(v);

/** @param {any} f */
const form = (f) => objekt(f) && ["situation", "wort", "name", "braucht", "kern", "verinnerlichen"].every((k) => text(f[k], k === "kern" || k === "verinnerlichen" ? LANG : MITTEL)) && textListe(f.schritte, 20, MITTEL);

/** Prüfer je Art für `daten`. @type {Record<string, (d: any) => boolean>} */
const NACH_ART = {
  gekonnt: (d) => text(d.id, KURZ) && text(d.name, KURZ) && text(d.zweck, MITTEL) && text(d.fach, KURZ),
  dabei: (d) => text(d.id, KURZ) && text(d.name, KURZ) && text(d.fach, KURZ),
  gelesen: (d) => text(d.id, KURZ) && text(d.titel, KURZ) && text(d.frage, MITTEL) && text(d.antwort, MITTEL),
  naechstes: (d) => text(d.id, KURZ) && text(d.thema, KURZ) && text(d.fach, KURZ) && text(d.titel, KURZ) && typeof d.passendZuGerade === "boolean"
    && Array.isArray(d.formen) && d.formen.length <= 10 && d.formen.every(form) && foto(d.foto) && textListe(d.weitere, 10, KURZ),
};

/**
 * Ob das Ereignis Form und Längen seiner Art einhält. Unbekannte Arten gelten als ungültig.
 * @param {any} e
 */
export function gueltigesEreignis(e) {
  return objekt(e) && text(e.id, KURZ) && typeof e.art === "string" && Object.hasOwn(NACH_ART, e.art) && objekt(e.daten) && NACH_ART[e.art](e.daten);
}
