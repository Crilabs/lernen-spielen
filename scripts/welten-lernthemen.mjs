// Trägt in spiele/lernplan.json je Welt zwei Felder ein (Spec 2026-11-15-sachwelten-uebersicht):
//   beschreibung  Text für Eltern aus scripts/welten-beschreibungen.json (worum es in der Welt geht)
//   lernthemen    Thema-Ids, zu denen die Welt gehört: Hauptthemen ihrer Heimatspiele aus dem Spielkatalog
//                 (docs/spielkatalog/welten.md: Spiel → Welt; docs/spielkatalog/<fach>.md: Spiel → Hauptthemen),
//                 vereinigt mit dem vorhandenen Feld themen. Unbekannte Ids werden gemeldet und weggelassen.
// Nur der Abschnitt "welten" wird neu geschrieben, im Stil der Datei (Fakten einzeilig).
//
// Aufruf: node scripts/welten-lernthemen.mjs [--pruefen]
//   --pruefen  schreibt nichts, endet mit Code 1, wenn lernplan.json nicht dem Ergebnis entspricht.

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLAN = path.join(WURZEL, "spiele/lernplan.json");
const KATALOG = path.join(WURZEL, "docs/spielkatalog");

/** Spiel-Id → Welt-Id aus welten.md („**M01 Paare bilden** · Name (`welt-id`) · …“). */
export function spielZuWelt(text) {
  const m = new Map();
  for (const z of text.split("\n")) {
    const r = /^\*\*([A-Z]\d+)\s[^*]*\*\*\s·[^`]*`([a-z0-9-]+)`/.exec(z);
    if (r) m.set(r[1], r[2]);
  }
  return m;
}

/** Spiel-Id → Hauptthemen aus einer Fach-Datei („### M01 …“, darunter „- Hauptthemen: a, b (Kl. 1–2)“, auch umbrochen). */
export function spielZuThemen(text) {
  const m = new Map();
  let spiel = null, sammle = null;
  for (const z of text.split("\n")) {
    const kopf = /^###\s+([A-Z]\d+)\b/.exec(z);
    if (kopf) { spiel = kopf[1]; sammle = null; continue; }
    if (!spiel) continue;
    if (/^- Hauptthemen:/.test(z)) { sammle = z.replace(/^- Hauptthemen:/, ""); m.set(spiel, []); }
    else if (sammle !== null && /^\s{2,}\S/.test(z)) sammle += " " + z.trim();
    else if (sammle !== null) { m.set(spiel, ids(sammle)); sammle = null; }
  }
  if (spiel && sammle !== null) m.set(spiel, ids(sammle));
  return m;
}

function ids(zeile) {
  return zeile.replace(/\([^)]*\)/g, " ").split(/[,\s]+/).map((x) => x.replace(/[`.;]/g, "")).filter((x) => /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(x));
}

/** Welten mit beschreibung und lernthemen; meldet Lücken in fehler. */
export function ergaenzeWelten(plan, katalog, beschreibungen) {
  const fehler = [];
  const themenIds = new Set(plan.themen.map((t) => t.id));
  const zuWelt = spielZuWelt(katalog.welten);
  const zuThemen = new Map();
  for (const text of katalog.faecher) for (const [k, v] of spielZuThemen(text)) zuThemen.set(k, v);
  const jeWelt = new Map();
  for (const [spiel, welt] of zuWelt) {
    if (!zuThemen.has(spiel)) { fehler.push(`${spiel}: keine Hauptthemen im Katalog`); continue; }
    if (!jeWelt.has(welt)) jeWelt.set(welt, []);
    jeWelt.get(welt).push(...zuThemen.get(spiel));
  }
  const welten = plan.welten.map((w) => {
    const b = beschreibungen[w.id];
    if (!b) fehler.push(`${w.id}: keine Beschreibung`);
    const roh = [...(w.themen || []), ...(jeWelt.get(w.id) || [])];
    const unbekannt = roh.filter((id) => !themenIds.has(id));
    for (const id of new Set(unbekannt)) fehler.push(`${w.id}: unbekanntes Thema ${id}`);
    const lernthemen = [...new Set(roh.filter((id) => themenIds.has(id)))];
    const { beschreibung: _b, lernthemen: _l, ...rest } = w;
    // beschreibung nach name, lernthemen nach themen bzw. anbindung – lesbare Reihenfolge
    const neu = {};
    for (const [k, v] of Object.entries(rest)) {
      neu[k] = v;
      if (k === "name") neu.beschreibung = b || "";
      if (k === (rest.themen ? "themen" : "anbindung")) neu.lernthemen = lernthemen;
    }
    if (!("lernthemen" in neu)) neu.lernthemen = lernthemen;
    return neu;
  });
  for (const welt of jeWelt.keys()) if (!plan.welten.some((w) => w.id === welt)) fehler.push(`Katalog nennt unbekannte Welt ${welt}`);
  return { welten, fehler };
}

/** Abschnitt "welten" im Stil der Datei: zwei Leerzeichen, Fakten-Objekte einzeilig. */
export function weltenText(welten) {
  const roh = JSON.stringify(welten, null, 2).replace(/\n/g, "\n  ");
  const einzeilig = roh.replace(/\{\n\s+"satz": ("(?:[^"\\]|\\.)*"),\n\s+"quelle": ("(?:[^"\\]|\\.)*")\n\s+\}/g, "{ \"satz\": $1, \"quelle\": $2 }");
  return '\n  "welten": ' + einzeilig + "\n}\n";
}

export function neuerPlanText(text, welten) {
  const i = text.indexOf('\n  "welten": [');
  if (i < 0) throw new Error('Abschnitt "welten" nicht gefunden');
  return text.slice(0, i) + weltenText(welten);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const text = readFileSync(PLAN, "utf8");
  const plan = JSON.parse(text);
  const faecher = readdirSync(KATALOG).filter((f) => f.endsWith(".md") && f !== "welten.md").map((f) => readFileSync(path.join(KATALOG, f), "utf8"));
  const katalog = { welten: readFileSync(path.join(KATALOG, "welten.md"), "utf8"), faecher };
  const beschreibungen = JSON.parse(readFileSync(path.join(WURZEL, "scripts/welten-beschreibungen.json"), "utf8"));
  const { welten, fehler } = ergaenzeWelten(plan, katalog, beschreibungen);
  for (const f of fehler) console.warn("Hinweis: " + f);
  const neu = neuerPlanText(text, welten);
  if (process.argv.includes("--pruefen")) {
    if (neu !== text) { console.error("lernplan.json ist nicht aktuell: node scripts/welten-lernthemen.mjs"); process.exit(1); }
    console.log("lernplan.json ist aktuell.");
  } else {
    writeFileSync(PLAN, neu);
    console.log(`${welten.length} Welten, ${welten.filter((w) => w.lernthemen.length).length} mit Lernthemen.`);
  }
}
