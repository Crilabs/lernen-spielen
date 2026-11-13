#!/usr/bin/env node
// Erzeugt fehlende Audiodateien für alle gesammelten Texte und pflegt spiele/audio/index.json.
//
//   npm run audio                 fehlende oder geänderte Dateien erzeugen (braucht AZURE_SPEECH_KEY)
//   npm run audio -- --pruefen    nur prüfen, nichts erzeugen; Exit 1, wenn etwas fehlt
//   npm run audio -- --aufraeumen Dateien zu Texten löschen, die kein Spiel mehr spricht
//
// Von Hand ersetzte Dateien (aussprache.json › datei) werden nie erzeugt oder überschrieben.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { azure } from "./azure.mjs";
import { ssml } from "./ssml.mjs";
import { sammle } from "./texte.mjs";

/** @typedef {import("./texte.mjs").Eintrag} Eintrag */
/** @typedef {{ datei: string, h?: string, gehoert?: boolean, hand?: boolean }} IndexEintrag */
/** @typedef {{ stimme: string, texte: Record<string, IndexEintrag> }} Index */

const kurz = (s, n = 12) => createHash("sha1").update(s).digest("hex").slice(0, n);

/**
 * Plant und erzeugt. Reine Logik: Lesen, Schreiben und Azure kommen von außen.
 * @param {{
 *   eintraege: Eintrag[],
 *   index: Index,
 *   einstellungen: { stimme: string, ordner: string, zahlen?: boolean, varianten?: Record<string, { tempo?: string }> },
 *   aussprache: Record<string, import("./ssml.mjs").Aussprache>,
 *   synth?: (ssml: string) => Promise<Buffer>,
 *   schreibe?: (datei: string, daten: Buffer) => void,
 *   loesche?: (datei: string) => void,
 *   aufraeumen?: boolean,
 *   melde?: (zeile: string) => void,
 * }} o
 */
export async function erzeuge({ eintraege, index, einstellungen, aussprache, synth, schreibe, loesche, aufraeumen = false, melde = () => {} }) {
  /** @type {Record<string, IndexEintrag>} */
  const texte = {};
  const bericht = { neu: 0, gleich: 0, hand: 0, fehlt: /** @type {string[]} */ ([]), zahl: /** @type {string[]} */ ([]), verwaist: /** @type {string[]} */ ([]), zeichen: 0, fehler: "" };

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
    const s = ssml(e, einstellungen, korrektur);
    const h = kurz(s, 10);
    if (alt && !alt.hand && alt.h === h) {
      texte[e.schluessel] = alt;
      bericht.gleich += 1;
      continue;
    }
    if (!synth || !schreibe || bericht.fehler) {
      bericht.fehlt.push(e.schluessel);
      if (alt) texte[e.schluessel] = alt;   // im Prüflauf nichts verlieren
      continue;
    }
    const datei = `${einstellungen.ordner}/${kurz(e.schluessel)}.mp3`;
    melde(`erzeuge ${datei}  ${e.schluessel}`);
    try {
      schreibe(datei, await synth(s));
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

async function main() {
  const hier = dirname(fileURLToPath(import.meta.url));
  const wurzel = join(hier, "..", "..");
  const audio = join(wurzel, "spiele", "audio");
  const indexPfad = join(audio, "index.json");
  const args = new Set(process.argv.slice(2));
  const pruefen = args.has("--pruefen");

  const einstellungen = JSON.parse(readFileSync(join(hier, "einstellungen.json"), "utf8"));
  const aussprache = JSON.parse(readFileSync(join(hier, "aussprache.json"), "utf8"));
  /** @type {Index} */
  const index = existsSync(indexPfad) ? JSON.parse(readFileSync(indexPfad, "utf8")) : { stimme: einstellungen.stimme, texte: {} };
  const { eintraege, offen } = sammle(wurzel);

  const synth = pruefen
    ? undefined
    : azure({ schluessel: process.env.AZURE_SPEECH_KEY, region: process.env.AZURE_SPEECH_REGION ?? einstellungen.region, format: einstellungen.format });

  const { index: neu, bericht } = await erzeuge({
    eintraege,
    index,
    einstellungen,
    aussprache: aussprache.texte ?? {},
    synth,
    schreibe: pruefen
      ? undefined
      : (datei, daten) => {
          const p = join(audio, datei);
          mkdirSync(dirname(p), { recursive: true });
          writeFileSync(p, daten);
        },
    loesche: (datei) => rmSync(join(audio, datei), { force: true }),
    aufraeumen: args.has("--aufraeumen"),
    melde: (z) => console.log(z),
  });

  if (!pruefen) {
    mkdirSync(audio, { recursive: true });
    writeFileSync(indexPfad, JSON.stringify(neu, null, 1) + "\n");
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
