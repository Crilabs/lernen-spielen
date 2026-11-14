// Verzeichnis der Anleitungen „Mit echten Dingen“ (docs/mit-echten-dingen.md): liest alle
// spiele/mit-echten-dingen/<fach>/<thema>.md und schreibt spiele/mit-echten-dingen/verzeichnis.json.
// Die Seiten laden nur das Verzeichnis (eine Datei statt einer Anfrage je Thema) und die Anleitung, die sie zeigen.
// tests/echte-dinge.test.mjs prüft, dass das Verzeichnis zu den Dateien passt, und die Form jeder Datei.
//
// Aufruf: npm run echte-dinge   (nach jeder neuen oder geänderten Anleitung)

import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { liesAnleitung } from "../../spiele/rahmen/markdown.js";

export const WURZEL = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const ORDNER = join(WURZEL, "spiele", "mit-echten-dingen");
export const VERZEICHNIS = join(ORDNER, "verzeichnis.json");

/** Alle Anleitungen: [{ fach, thema, pfad, text }] in fester Reihenfolge (Fach, dann Thema). */
export function anleitungen(ordner = ORDNER) {
  if (!existsSync(ordner)) return [];
  return readdirSync(ordner, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()
    .flatMap((fach) => readdirSync(join(ordner, fach))
      .filter((n) => n.endsWith(".md"))
      .sort()
      .map((n) => ({ fach, thema: n.slice(0, -3), pfad: join(ordner, fach, n), text: readFileSync(join(ordner, fach, n), "utf8") })));
}

/**
 * Das Verzeichnis als Objekt: { themen: { [thema]: { fach, name, titel, formen: [{ situation, name }], entwurf } } }.
 * name = Name des Themas im Lernplan (die Karte erkennt ein Thema auch an ihm), titel = Überschrift der Datei.
 */
export function baueVerzeichnis(liste = anleitungen(), plan = JSON.parse(readFileSync(join(WURZEL, "spiele", "lernplan.json"), "utf8"))) {
  const namen = new Map((plan.themen ?? []).map((t) => [t.id, t.name]));
  /** @type {Record<string, any>} */
  const themen = {};
  for (const a of liste) {
    const l = liesAnleitung(a.text);
    themen[a.thema] = {
      fach: a.fach,
      name: namen.get(a.thema) ?? "",
      titel: l.titel,
      formen: l.formen.map((f) => ({ situation: f.situation, name: f.name })),
      entwurf: l.kopf.entwurf === true,
    };
  }
  return { themen };
}

export const alsText = (v) => JSON.stringify(v, null, 1) + "\n";

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const v = baueVerzeichnis();
  writeFileSync(VERZEICHNIS, alsText(v));
  console.log(`${Object.keys(v.themen).length} Anleitungen in ${VERZEICHNIS}`);
}
