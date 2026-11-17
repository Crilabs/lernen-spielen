#!/usr/bin/env node
// Brief-Fotos (docs/superpowers/specs/2026-11-17-tagesbrief-design.md): macht aus jedem Foto im Verzeichnis der
// Anleitungen „Mit echten Dingen“ ein JPEG für den Brief – <ordner>/<name>.brief.jpg neben der .webp, längste Kante
// 640 px, höchstens 40 KB (Mail-Programme zeigen kein WebP). Nur macOS (sips). Aktuelle Dateien bleiben liegen.
//
// Aufruf: npm run echte-dinge:brief-fotos
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { ORDNER, VERZEICHNIS } from "./verzeichnis.mjs";

const MAX_BYTES = 40 * 1024;
const KANTE = 640;

/** Pfad des Brief-JPEG zu einem Foto des Verzeichnisses (relativ zu mit-echten-dingen/). @param {string} foto */
export const briefPfad = (foto) => foto.replace(/\.[^./]+$/, "") + ".brief.jpg";

/** Ist das JPEG da und jünger als das Foto? */
const aktuell = (/** @type {string} */ quelle, /** @type {string} */ ziel) =>
  existsSync(ziel) && statSync(ziel).mtimeMs >= statSync(quelle).mtimeMs && statSync(ziel).size <= MAX_BYTES;

/**
 * Erzeugt das Brief-JPEG, senkt die Qualität in 10er-Schritten (70, 60, …) bis es höchstens 40 KB hat.
 * @param {string} quelle
 * @param {string} ziel
 * @returns {number} Bytes
 */
export function erzeugeBriefFoto(quelle, ziel) {
  for (let q = 70; q >= 10; q -= 10) {
    execFileSync("sips", ["-Z", String(KANTE), "-s", "format", "jpeg", "-s", "formatOptions", String(q), quelle, "--out", ziel], { stdio: "ignore" });
    const b = statSync(ziel).size;
    if (b <= MAX_BYTES) return b;
  }
  throw new Error(`${ziel}: auch bei Qualität 10 über ${MAX_BYTES} Bytes`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (process.platform !== "darwin") { console.error("brief-fotos braucht macOS (sips)."); process.exit(1); }
  const fotos = [...new Set(Object.values(JSON.parse(readFileSync(VERZEICHNIS, "utf8")).themen).map((v) => v.foto).filter(Boolean))];
  let neu = 0;
  for (const foto of fotos) {
    const quelle = join(ORDNER, foto);
    const ziel = join(ORDNER, briefPfad(foto));
    if (!existsSync(quelle)) { console.error(`Foto fehlt: ${foto}`); process.exitCode = 1; continue; }
    if (aktuell(quelle, ziel)) continue;
    console.log(`${briefPfad(foto)}  ${(erzeugeBriefFoto(quelle, ziel) / 1024).toFixed(1)} KB`);
    neu++;
  }
  console.log(`${neu} neu, ${fotos.length - neu} aktuell.`);
}
