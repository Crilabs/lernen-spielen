#!/usr/bin/env node
// Erzeugt fehlende Audiodateien für alle gesammelten Texte und pflegt spiele/audio/index.json.
//
//   npm run audio                 fehlende oder geänderte Dateien erzeugen (braucht AZURE_SPEECH_KEY)
//   npm run audio -- --pruefen    nur prüfen, nichts erzeugen; Exit 1, wenn etwas fehlt
//   npm run audio -- --aufraeumen Dateien zu Texten löschen, die kein Spiel mehr spricht
//
// Von Hand ersetzte Dateien (aussprache.json › datei) werden nie erzeugt oder überschrieben.
// Neue oder geänderte Texte spricht ElevenLabs (einstellungen.json › elevenlabs), Texte mit SSML-Korrektur Azure.
// Vorhandene Aufnahmen bleiben, wie sie sind: Die Prüfsumme h hängt weiter am Azure-SSML, nicht an der Stimme.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { azure, holeSchluessel } from "./azure.mjs";
import { elevenlabs, holeElevenlabsSchluessel } from "./elevenlabs.mjs";
import { klartext, ssml } from "./ssml.mjs";
import { sammle } from "./texte.mjs";
import { findeSpielordner, ordneZu, texteDesSpiels, trageEin } from "../kosten/kosten.mjs";

/** @typedef {import("./texte.mjs").Eintrag} Eintrag */
/** @typedef {{ datei: string, h?: string, gehoert?: boolean, hand?: boolean }} IndexEintrag */
/** @typedef {{ stimme: string, texte: Record<string, IndexEintrag> }} Index */

const kurz = (s, n = 12) => createHash("sha1").update(s).digest("hex").slice(0, n);

/**
 * Plant und erzeugt. Reine Logik: Lesen, Schreiben und Azure kommen von außen.
 * @param {{
 *   eintraege: Eintrag[],
 *   index: Index,
 *   einstellungen: { stimme: string, ordner: string, zahlen?: boolean, varianten?: Record<string, { tempo?: string }>,
 *     elevenlabs?: { ordner: string, varianten?: Record<string, { tempo?: number }> } },
 *   aussprache: Record<string, import("./ssml.mjs").Aussprache>,
 *   woerter?: Record<string, import("./ssml.mjs").Wort>,
 *   synth?: (ssml: string) => Promise<Buffer>,
 *   synthText?: (text: string, o?: { tempo?: number }) => Promise<Buffer>,
 *   schreibe?: (datei: string, daten: Buffer) => void,
 *   loesche?: (datei: string) => void,
 *   aufraeumen?: boolean,
 *   melde?: (zeile: string) => void,
 * }} o
 */
export async function erzeuge({ eintraege, index, einstellungen, aussprache, woerter = {}, synth, synthText, schreibe, loesche, aufraeumen = false, melde = () => {} }) {
  /** @type {Record<string, IndexEintrag>} */
  const texte = {};
  const bericht = { neu: 0, gleich: 0, hand: 0, fehlt: /** @type {string[]} */ ([]), zahl: /** @type {string[]} */ ([]), verwaist: /** @type {string[]} */ ([]), zeichen: 0, erzeugt: /** @type {{ text: string, zeichen: number, anbieter: string }[]} */ ([]), fehler: "" };

  for (const e of eintraege) {
    const alt = index.texte[e.schluessel];
    const korrektur = aussprache[e.schluessel] ?? aussprache[e.text] ?? {};
    if (korrektur.datei) {
      texte[e.schluessel] = { datei: korrektur.datei, hand: true, gehoert: true };
      bericht.hand += 1;
      continue;
    }
    if (!einstellungen.zahlen && /\d/.test(e.text)) {
      bericht.zahl.push(e.schluessel);
      continue;
    }
    const s = ssml(e, einstellungen, korrektur, woerter);
    const h = kurz(s, 10);
    if (alt && !alt.hand && alt.h === h) {
      texte[e.schluessel] = alt;
      bericht.gleich += 1;
      continue;
    }
    const el = einstellungen.elevenlabs;
    const text = el ? klartext(e, korrektur, woerter) : null;
    const anbieter = text !== null ? "elevenlabs" : "azure";
    const erzeuger = anbieter === "elevenlabs" ? synthText : synth;
    if (!erzeuger || !schreibe || bericht.fehler) {
      bericht.fehlt.push(e.schluessel);
      if (alt) texte[e.schluessel] = alt;   // im Prüflauf nichts verlieren
      continue;
    }
    const ordner = anbieter === "elevenlabs" ? /** @type {any} */ (el).ordner : einstellungen.ordner;
    const datei = `${ordner}/${kurz(e.schluessel)}.mp3`;
    melde(`erzeuge ${datei}  ${e.schluessel}`);
    try {
      const daten =
        anbieter === "elevenlabs"
          ? await /** @type {NonNullable<typeof synthText>} */ (synthText)(/** @type {string} */ (text), { tempo: e.variante ? el?.varianten?.[e.variante]?.tempo : undefined })
          : await /** @type {NonNullable<typeof synth>} */ (synth)(s);
      schreibe(datei, daten);
    } catch (err) {
      // Abbruch: was bis hier erzeugt wurde, bleibt im Index (bezahlte Zeichen gehen nicht verloren).
      bericht.fehler = String(/** @type {any} */ (err)?.message ?? err);
      bericht.fehlt.push(e.schluessel);
      if (alt) texte[e.schluessel] = alt;
      continue;
    }
    texte[e.schluessel] = { datei, h, gehoert: false };
    bericht.neu += 1;
    bericht.zeichen += e.text.length;
    bericht.erzeugt.push({ text: e.text, zeichen: e.text.length, anbieter });
  }

  for (const [k, alt] of Object.entries(index.texte)) {
    if (texte[k]) continue;
    bericht.verwaist.push(k);
    if (aufraeumen && !alt.hand && loesche) loesche(alt.datei);
    else texte[k] = alt;
  }

  const sortiert = Object.fromEntries(Object.entries(texte).sort(([a], [b]) => a.localeCompare(b, "de")));
  return { index: { stimme: einstellungen.stimme, texte: sortiert }, bericht };
}

// ---------------------------------------------------------------- Kommandozeile

export const WURZEL = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const AUDIO = join(WURZEL, "spiele", "audio");
const HIER = join(WURZEL, "werkzeuge", "audio");
const INDEX = join(AUDIO, "index.json");
const AUSSPRACHE = join(HIER, "aussprache.json");

/** @returns {Index} */
export function ladeIndex() {
  return existsSync(INDEX) ? JSON.parse(readFileSync(INDEX, "utf8")) : { stimme: "", texte: {} };
}

/** @param {Index} index */
export function speichereIndex(index) {
  mkdirSync(AUDIO, { recursive: true });
  writeFileSync(INDEX, JSON.stringify(index, null, 1) + "\n");
}

export function ladeAussprache() {
  return JSON.parse(readFileSync(AUSSPRACHE, "utf8"));
}

/** @param {any} aussprache ganze Datei (hinweis + texte) */
export function speichereAussprache(aussprache) {
  writeFileSync(AUSSPRACHE, JSON.stringify(aussprache, null, 2) + "\n");
}

/**
 * Trägt die neu erzeugten Zeichen in kosten.json ein (docs/spielentwicklung.md §6): alle in den Ordner `spiel`,
 * sonst je Spiel nach dessen texte.json. Texte ohne Spiel stehen nur im Rückgabewert.
 * @param {{ text: string, zeichen: number }[]} erzeugt
 * @returns {{ je: Record<string, number>, ohneSpiel: number }}
 */
export function trageZeichenEin(erzeugt, { spiel = "", spielordner = findeSpielordner(WURZEL), datum = new Date().toISOString().slice(0, 10) } = {}) {
  if (!erzeugt.length) return { je: {}, ohneSpiel: 0 };
  const el = erzeugt.filter((t) => t.anbieter === "elevenlabs");
  if (el.length && el.length < erzeugt.length) {
    // Je Anbieter ein eigener Eintrag, damit die Notiz stimmt.
    const a = trageZeichenEin(erzeugt.filter((t) => t.anbieter !== "elevenlabs"), { spiel, spielordner, datum });
    const b = trageZeichenEin(el, { spiel, spielordner, datum });
    const je = { ...a.je };
    for (const [o, n] of Object.entries(b.je)) je[o] = (je[o] ?? 0) + n;
    return { je, ohneSpiel: a.ohneSpiel + b.ohneSpiel };
  }
  const notiz = el.length ? "npm run audio · ElevenLabs Livia, Abrechnung über das ElevenLabs-Abo" : "npm run audio";
  const alle = erzeugt.reduce((a, t) => a + t.zeichen, 0);
  const { je, ohneSpiel } = spiel
    ? { je: { [spiel]: alle }, ohneSpiel: 0 }
    : ordneZu(erzeugt, Object.fromEntries(spielordner.map((o) => [o, texteDesSpiels(o)])));
  for (const [ordner, menge] of Object.entries(je))
    trageEin(ordner, { datum, phase: "stimme", posten: "stimme", einheit: "zeichen", menge, notiz });
  return { je, ohneSpiel };
}

/**
 * Ein ganzer Lauf über das Projekt: sammeln, erzeugen (ohne Schlüssel oder mit pruefen: nur planen),
 * Index speichern. Von der Kommandozeile und von der Anhör-Seite genutzt.
 * @param {{ pruefen?: boolean, aufraeumen?: boolean, melde?: (z: string) => void }} [o]
 */
export async function lauf({ pruefen = false, aufraeumen = false, spiel = "", melde = () => {} } = {}) {
  const einstellungen = JSON.parse(readFileSync(join(HIER, "einstellungen.json"), "utf8"));
  const aussprache = ladeAussprache();
  const index = ladeIndex();
  const { eintraege, offen } = sammle(WURZEL);
  let kosten = { je: /** @type {Record<string, number>} */ ({}), ohneSpiel: 0 };
  // Erst beim ersten Bedarf anlegen: Ein Lauf, der nur ElevenLabs braucht, braucht keine Azure-Anmeldung (und umgekehrt).
  /** @type {any} */ let az, el;
  const synth = pruefen
    ? undefined
    : (/** @type {string} */ s) =>
        (az ??= azure({ schluessel: holeSchluessel(einstellungen), region: process.env.AZURE_SPEECH_REGION ?? einstellungen.region, format: einstellungen.format }))(s);
  const e11 = einstellungen.elevenlabs;
  const synthText =
    pruefen || !e11
      ? undefined
      : (/** @type {string} */ t, /** @type {any} */ o) =>
          (el ??= elevenlabs({ schluessel: holeElevenlabsSchluessel(WURZEL), stimme: e11.stimme, modell: e11.modell, format: e11.format }))(t, o);
  const { index: neu, bericht } = await erzeuge({
    eintraege,
    index,
    einstellungen,
    aussprache: aussprache.texte ?? {},
    woerter: aussprache.woerter ?? {},
    synth,
    synthText,
    schreibe: pruefen
      ? undefined
      : (datei, daten) => {
          const p = join(AUDIO, datei);
          mkdirSync(dirname(p), { recursive: true });
          writeFileSync(p, daten);
        },
    loesche: (datei) => rmSync(join(AUDIO, datei), { force: true }),
    aufraeumen,
    melde,
  });
  if (!pruefen) {
    speichereIndex(neu);
    // Bezahlte Zeichen gehören in kosten.json, egal ob Kommandozeile oder Anhör-Seite (§6).
    kosten = trageZeichenEin(bericht.erzeugt, { spiel });
  }
  return { neu, bericht, eintraege, offen, kosten };
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const pruefen = args.has("--pruefen");
  const iSpiel = process.argv.indexOf("--spiel");
  const spiel = iSpiel >= 0 ? process.argv[iSpiel + 1] : "";
  if (iSpiel >= 0 && !spiel) throw new Error("--spiel braucht einen Spielordner");
  args.delete("--spiel");
  args.delete(spiel);
  const { neu, bericht, eintraege, offen, kosten } = await lauf({ pruefen, aufraeumen: args.has("--aufraeumen"), spiel, melde: (z) => console.log(z) });
  if (!pruefen) {
    const { je, ohneSpiel } = kosten;
    for (const [o, n] of Object.entries(je)) console.log(`Kosten: ${n} Zeichen in ${o}/kosten.json`);
    if (ohneSpiel) console.log(`Kosten: ${ohneSpiel} Zeichen gehören zu keinem Spiel (kein texte.json passt; --spiel <ordner> nutzen)`);
  }

  const ungehoert = Object.values(neu.texte).filter((t) => !t.gehoert).length;
  console.log(
    `\nTexte: ${eintraege.length} · neu erzeugt: ${bericht.neu} (${bericht.zeichen} Zeichen) · unverändert: ${bericht.gleich}` +
      ` · von Hand: ${bericht.hand} · nicht abgehört: ${ungehoert}`,
  );
  if (bericht.zahl.length)
    console.log(`Übersprungen, weil mit Ziffer (einstellungen.json › zahlen ist aus): ${bericht.zahl.length}\n  ` + bericht.zahl.join("\n  "));
  if (bericht.verwaist.length)
    console.log(`Nicht mehr gesprochen${args.has("--aufraeumen") ? " (gelöscht)" : " (mit --aufraeumen löschen)"}: ${bericht.verwaist.length}`);
  const offenSumme = Object.values(offen).reduce((a, b) => a + b, 0);
  if (offenSumme)
    console.log(
      `Sätze aus Vorlagen im Spielcode, noch nicht erfasst: ${offenSumme} Aufrufe\n  ` +
        Object.entries(offen).map(([d, n]) => `${d}: ${n}`).join("\n  "),
    );
  if (bericht.fehler) {
    console.error(`\nAbgebrochen: ${bericht.fehler}`);
    process.exitCode = 1;
  }
  if (pruefen && bericht.fehlt.length) {
    console.log(`Ohne Audiodatei: ${bericht.fehlt.length}\n  ` + bericht.fehlt.slice(0, 40).join("\n  "));
    process.exitCode = 1;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((e) => {
    console.error(String(e?.message ?? e));
    process.exitCode = 1;
  });
}
