// Tagesbrief (docs/superpowers/specs/2026-11-17-tagesbrief-design.md, „Ereignisse“): löst nach einer Spielrunde und nach
// dem ersten Lesen eines Buchs die Ereignisse aus und schiebt sie über die App-Befehle in den Topf. Die Spiele warten
// nie darauf; nichts hier wirft nach außen. Außerhalb der App (kein Tauri) passiert nichts.

import { befehl as echterBefehl, istApp } from "../kern/dienste.js";
import { PROFIL, lade, speichere, sofortSpeichern } from "../kern/speicher.js";
import { protokoll } from "../kern/protokoll.js";
import { liesAnleitung } from "../rahmen/markdown.js";
import { waehleAnleitung } from "./anleitung.js";
import { dabeiEreignis, gekonntEreignis, gelesenEreignis, naechstesEreignis } from "./ereignisse.js";

/** Schlüssel des Lernstands der Lernsteuerung (wie STAND_KEY in lernsteuerung.js). */
const STAND_KEY = "lernplan";
/** Größte Foto-Größe als base64 (wie FOTO_MAX im Dienst). */
const FOTO_MAX = 60_000;
/** Gesperrte Anleitungen, die älter sind, werden aus dem Lernstand entfernt (die Sperre gilt 14 Tage). */
const SPERRE_BEHALTEN_TAGE = 30;

/** @typedef {(name: string, args?: object) => Promise<any>} Befehl */
/** @typedef {(pfad: string) => Promise<{ ok: boolean, json(): Promise<any>, text(): Promise<string>, arrayBuffer(): Promise<ArrayBuffer> }>} Lader */

/** @type {Befehl} */
let befehl = echterBefehl;
/** @type {Lader} Pfade relativ zu spiele/ */
const echterLader = (pfad) => fetch(new URL(`../${pfad}`, import.meta.url));
/** @type {Lader} */
let lader = echterLader;
/** @type {Promise<any> | null} */
let verzeichnis = null;
/** Nach „abbestellt“ (oder gesperrt) pusht diese Seite nicht mehr. */
let gestoppt = false;

/** Ersatz für Befehl und Lader in Tests; setzt den Zustand zurück. */
export const testHaken = {
  /** @param {Befehl | null} fn */
  setzeBefehl(fn) { befehl = fn ?? echterBefehl; gestoppt = false; },
  /** @param {Lader | null} fn */
  setzeLader(fn) { lader = fn ?? echterLader; verzeichnis = null; },
};

/** @param {unknown} x */
const istObjekt = (x) => Boolean(x) && typeof x === "object" && !Array.isArray(x);

/** @param {string} pfad @returns {Promise<any>} JSON oder null */
async function ladeJson(pfad) {
  const r = await lader(pfad);
  return r.ok ? r.json() : null;
}

/** Verzeichnis der Anleitungen, einmal je Seite. */
function ladeVerzeichnis() {
  verzeichnis ??= ladeJson("mit-echten-dingen/verzeichnis.json").catch(() => null);
  return verzeichnis;
}

/** @param {ArrayBuffer} puffer */
function alsBase64(puffer) {
  const bytes = new Uint8Array(puffer);
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

/**
 * Foto der Anleitung fürs Briefbild (`<name>.brief.jpg` neben dem webp) als base64; "" ohne oder zu groß.
 * @param {string | undefined} foto `foto` aus dem Verzeichnis
 */
async function ladeFoto(foto) {
  if (typeof foto !== "string" || !/^[a-z0-9-]+\/bilder\/[a-z0-9-]+\.webp$/.test(foto)) return "";
  try {
    const r = await lader(`mit-echten-dingen/${foto.replace(/\.webp$/, ".brief.jpg")}`);
    if (!r.ok) return "";
    const b = alsBase64(await r.arrayBuffer());
    return b.length <= FOTO_MAX ? b : "";
  } catch {
    return "";
  }
}

/**
 * Das Ereignis „Als Nächstes“ aus dem Lernstand, oder null (keine passende Anleitung).
 * @param {any} ctx
 * @param {any} stand
 * @param {{ heute: string, zuletztGeuebt: string }} o
 */
async function baueNaechstes(ctx, stand, { heute, zuletztGeuebt }) {
  const tb = istObjekt(stand.tagesbrief) ? stand.tagesbrief : {};
  const wahl = waehleAnleitung(ctx, stand, {
    heute, gesperrt: istObjekt(tb.gesperrt) ? tb.gesperrt : {}, zuletztGeuebt,
    letztesFach: typeof tb.letztesFach === "string" ? tb.letztesFach : "",
  });
  if (!wahl || !/^[a-z0-9-]+\/[a-z0-9-]+\.md$/.test(wahl.datei)) return null;
  const antwort = await lader(`mit-echten-dingen/${wahl.datei}`);
  if (!antwort.ok) return null;
  const anleitung = liesAnleitung(await antwort.text());
  if (!anleitung.formen.length) return null;
  const thema = (ctx.plan?.themen ?? []).find((/** @type {any} */ t) => t.id === wahl.thema);
  const fach = typeof thema?.strang === "string" ? thema.strang : wahl.datei.split("/")[0];
  const foto = await ladeFoto(ctx.echteDinge?.themen?.[wahl.thema]?.foto);
  return naechstesEreignis(wahl, anleitung, fach, foto);
}

/**
 * Hält verschickte Anleitungen im Lernstand fest (14-Tage-Sperre, letztes Fach) und speichert.
 * Schreibt auf den frisch geladenen Stand, damit eine spätere Runde nicht überschrieben wird.
 * @param {any} stand
 * @param {{ anleitung?: string, am?: string }[]} verschickt
 * @param {string} heute
 */
async function merkeVerschickt(stand, verschickt, heute) {
  const gueltig = verschickt.filter((v) => istObjekt(v) && typeof v.anleitung === "string" && /^[a-z0-9-]+\/[a-z0-9-]+\.md$/.test(v.anleitung));
  if (!gueltig.length) return;
  const frisch = await lade(STAND_KEY, {});
  for (const ziel of [stand, frisch]) {
    const tb = istObjekt(ziel.tagesbrief) ? ziel.tagesbrief : {};
    /** @type {Record<string, string>} */
    const gesperrt = {};
    for (const [datei, am] of Object.entries(istObjekt(tb.gesperrt) ? tb.gesperrt : {})) {
      if (typeof am === "string" && (Date.parse(heute) - Date.parse(am)) / 86400000 <= SPERRE_BEHALTEN_TAGE) gesperrt[datei] = am;
    }
    for (const v of gueltig) gesperrt[/** @type {string} */ (v.anleitung)] = String(v.am ?? heute).slice(0, 10);
    ziel.tagesbrief = { ...tb, gesperrt, letztesFach: /** @type {string} */ (gueltig[gueltig.length - 1].anleitung).split("/")[0] };
  }
  speichere(STAND_KEY, frisch);
  await sofortSpeichern();
}

/**
 * Schiebt Ereignisse in den Topf, wenn der Brief eingerichtet ist.
 * @param {any} ctx
 * @param {any} stand
 * @param {{ art: string, daten: object }[]} ereignisse
 * @param {string} heute
 */
async function pushe(ctx, stand, ereignisse, heute) {
  if (gestoppt || !ereignisse.length) return;
  const status = await befehl("tagesbrief_status", { profil: PROFIL });
  if (status?.zustand === "abbestellt") gestoppt = true;
  if (status?.zustand !== "aktiv") return;
  const antwort = await befehl("tagesbrief_pushen", { profil: PROFIL, ereignisse });
  if (["abbestellt", "aus", "gesperrt"].includes(antwort?.zustand)) { gestoppt = true; return; }
  if (Array.isArray(antwort?.verschickt)) await merkeVerschickt(stand, antwort.verschickt, heute);
}

/** @param {unknown} e */
function melde(e) {
  if (istApp()) protokoll(`tagesbrief: ${/** @type {any} */ (e)?.message ?? e}`);
}

/**
 * Ergänzt den Kontext um das Verzeichnis der Anleitungen.
 * @param {any} ctx
 */
async function mitVerzeichnis(ctx) {
  return ctx?.echteDinge ? ctx : { ...ctx, echteDinge: (await ladeVerzeichnis()) ?? { themen: {} } };
}

/**
 * Nach einer Spielrunde: „Neu gekonnt“ oder „Dabei“ (nur, wenn das Thema gerade dran ist) und „Als Nächstes“.
 * @param {any} ctx Lernplan und Spiele (plan, spiele; echteDinge wird bei Bedarf geladen)
 * @param {any} stand Lernstand nach der Runde
 * @param {{ thema: string | null, gekonnt: string | null, heute: string }} o thema: Thema der Runde; gekonnt: in dieser Runde gekonntes Thema
 * @returns {Promise<void>} wirft nie
 */
export async function meldeRundenende(ctx, stand, { thema, gekonnt, heute }) {
  try {
    if (gestoppt) return;
    const c = await mitVerzeichnis(ctx);
    /** @type {{ art: string, daten: object }[]} */
    const ereignisse = [];
    if (gekonnt) {
      const daten = gekonntEreignis(c, gekonnt);
      if (daten) ereignisse.push({ art: "gekonnt", daten });
    } else if (thema && stand.themen?.[thema]?.z === "dran") {
      const daten = dabeiEreignis(c, thema);
      if (daten) ereignisse.push({ art: "dabei", daten });
    }
    const naechstes = await baueNaechstes(c, stand, { heute, zuletztGeuebt: gekonnt ?? thema ?? "" });
    if (naechstes) ereignisse.push({ art: "naechstes", daten: naechstes });
    await pushe(c, stand, ereignisse, heute);
  } catch (e) {
    melde(e);
  }
}

/**
 * Nach dem ersten Lesen eines Buchs: „Gelesen“ und „Als Nächstes“.
 * @param {any} ctx Lernplan und Spiele
 * @param {any} stand Lernstand
 * @param {string} id Buch-Id
 * @param {{ heute: string }} o
 * @returns {Promise<void>} wirft nie
 */
export async function meldeGelesen(ctx, stand, id, { heute }) {
  try {
    if (gestoppt || !/^[a-z0-9-]+$/.test(id)) return;
    const c = await mitVerzeichnis(ctx);
    const geschichte = await ladeJson(`geschichten/${id}/geschichte.json`);
    if (!geschichte) return;
    /** @type {{ art: string, daten: object }[]} */
    const ereignisse = [{ art: "gelesen", daten: gelesenEreignis(id, geschichte) }];
    const naechstes = await baueNaechstes(c, stand, { heute, zuletztGeuebt: "" });
    if (naechstes) ereignisse.push({ art: "naechstes", daten: naechstes });
    await pushe(c, stand, ereignisse, heute);
  } catch (e) {
    melde(e);
  }
}
