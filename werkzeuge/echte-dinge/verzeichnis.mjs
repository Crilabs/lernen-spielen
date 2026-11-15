// Verzeichnis der Anleitungen „Mit echten Dingen“ (docs/mit-echten-dingen.md): liest alle
// spiele/mit-echten-dingen/<fach>/<thema>.md und schreibt zwei Verzeichnisse:
//   verzeichnis.json          nur freigegebene Anleitungen (ohne `entwurf: true` und ohne `geparkt: true`): das liest die App
//   verzeichnis-entwurf.json  dazu die Entwürfe (nie geparkte): nur für Vorschau und Prüfungen (`?entwurf` an der Seite)
// Eine Datei trägt ein Thema (`thema: <id>`, Dateiname = Id) oder eine Familie (`themen:` als Liste, Dateiname = Name
// der Familie): dieselbe Handlung, nur ein Wert wechselt (docs/mit-echten-dingen.md). Jedes Thema bekommt einen
// Eintrag mit `datei`; ein Thema in zwei Dateien ist ein Fehler.
// So erreicht kein ungeprüfter Text das Kind. Die Seiten laden nur das Verzeichnis (eine Datei statt einer Anfrage je
// Thema) und die Anleitung, die sie zeigen.
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
export const VERZEICHNIS_ENTWURF = join(ORDNER, "verzeichnis-entwurf.json");

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
 * Die Themen, die eine Datei trägt: `themen` (Liste) oder `thema` (eine Id).
 * @param {Record<string, unknown>} kopf
 * @returns {string[]}
 */
export function themenDerDatei(kopf) {
  if (Array.isArray(kopf.themen)) return kopf.themen.map(String);
  return typeof kopf.thema === "string" && kopf.thema ? [kopf.thema] : [];
}

/**
 * Das Verzeichnis als Objekt: { themen: { [thema]: { fach, name, titel, formen: [{ situation, name }], entwurf, datei } } }.
 * datei = Pfad unter spiele/mit-echten-dingen/ (bei einer Familie für alle ihre Themen derselbe).
 * name = Name des Themas im Lernplan, nur wenn ihn im ganzen Lernplan kein anderes Thema trägt (die Karte erkennt ein
 * Thema auch an ihm), sonst ""; titel = Überschrift der Datei.
 * Ohne `entwuerfe` nur freigegebene Anleitungen; geparkte (`geparkt: true`) nie.
 */
export function baueVerzeichnis(liste = anleitungen(), plan = JSON.parse(readFileSync(join(WURZEL, "spiele", "lernplan.json"), "utf8")), { entwuerfe = false } = {}) {
  const zahl = new Map();
  for (const t of plan.themen ?? []) zahl.set(t.name, (zahl.get(t.name) ?? 0) + 1);
  const namen = new Map((plan.themen ?? []).map((t) => [t.id, zahl.get(t.name) === 1 ? t.name : ""]));
  /** @type {Record<string, any>} */
  const themen = {};
  /** @type {Map<string, string>} */
  const woher = new Map();
  for (const a of liste) {
    const l = liesAnleitung(a.text);
    const datei = `${a.fach}/${a.thema}.md`;
    const ids = themenDerDatei(l.kopf);
    for (const id of ids) {
      if (woher.has(id)) throw new Error(`Thema ${id} steht in zwei Dateien: ${woher.get(id)} und ${datei}`);
      woher.set(id, datei);
    }
    if (l.kopf.geparkt === true || (l.kopf.entwurf === true && !entwuerfe)) continue;
    for (const id of ids) {
      themen[id] = {
        fach: a.fach,
        name: namen.get(id) ?? "",
        titel: l.titel,
        formen: l.formen.map((f) => ({ situation: f.situation, name: f.name })),
        entwurf: l.kopf.entwurf === true,
        datei,
      };
    }
  }
  return { themen: Object.fromEntries(Object.entries(themen).sort(([x], [y]) => x.localeCompare(y))) };
}

export const alsText = (v) => JSON.stringify(v, null, 1) + "\n";

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const v = baueVerzeichnis();
  const e = baueVerzeichnis(undefined, undefined, { entwuerfe: true });
  writeFileSync(VERZEICHNIS, alsText(v));
  writeFileSync(VERZEICHNIS_ENTWURF, alsText(e));
  console.log(`${Object.keys(v.themen).length} freigegebene Anleitungen in ${VERZEICHNIS}`);
  console.log(`${Object.keys(e.themen).length} mit Entwürfen in ${VERZEICHNIS_ENTWURF}`);
}
