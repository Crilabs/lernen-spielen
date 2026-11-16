#!/usr/bin/env node
// Textprüfung eines Spiels (docs/spielbau.md §3 Textbudget, §5 G1, G7, G10): was eine Maschine an den Sätzen sehen
// kann, prüft sie, damit die Spielprüfung sich um Freude und Schönheit kümmert.
//
//   node werkzeuge/spielbau/texte.mjs <spielordner> [--klasse <1–4>]
//
// Gelesen werden texte.json und einfuehrung.json (alle Zeichenketten außer Schlüsseln wie „hinweis“) und die festen
// Sätze in spiel.js (Zeichenketten in sage(…)/sprich(…)). Ergebnis: { rot, hinweise, saetze, zeichen }.
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

/** Wörter, die urteilen (grundsaetze.md §3.2), als Muster auf ganze Wörter; Groß/klein egal. */
export const URTEIL = [
  "super", "toll", "prima", "spitze", "perfekt", "unglaublich", "wahnsinn", "klug", "schlau", "profi",
  "rechenkönig", "rechenkönigin", "brav", "fleißig", "falsch", "leider", "oh nein", "schade", "fehler",
  "schon wieder", "endlich", "immer noch", "versuch's nochmal", "versuchs nochmal", "versuch es nochmal",
  "schaffst du", "ganz leicht", "besser als", "schneller als", "angestrengt", "gut gemacht", "richtig so",
];

/** Ersatznamen statt Fachbegriffen (grundsaetze.md §5.1). */
export const ERSATZ = [
  "namenwort", "hauptwort", "dingwort", "tunwort", "tätigkeitswort", "zeitwort", "wiewort", "eigenschaftswort",
  "selbstlaut", "mitlaut", "doppelmitlaut", "fürwort", "satzgegenstand", "satzaussage", "ergibt",
];

/**
 * Zahl direkt nach „der/dem/zur/zum“: Die Stimme liest sie als Ordnungszahl („zur Dreizehn“ → „zur dreizehnten“,
 * stimme.md). Zahlwörter nur als ganze Wörter – „Zehner“, „Einer“, „Zwanziger“ sind keine Zahlwörter.
 */
export const ZAHL_NACH_ARTIKEL =
  /\b(der|dem|zur|zum)\s+(\d+|(?:null|eins|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|elf|zwölf|\p{L}*zehn|\p{L}*zig|hundert|tausend))(?![\p{L}\d])/iu;

/** Schlüssel in JSON, deren Werte keine Sätze für das Kind sind. */
const KEINE_SAETZE = new Set(["hinweis", "quelle", "id", "art", "objekt", "zustand", "vorlage", "packung", "symbol", "datei", "welt", "figur", "farbe"]);

/** Höchstzahl der Wörter je Satz nach Klasse (§3, Annahme). */
export const satzGrenze = (klasse) => (klasse <= 2 ? 8 : 12);
/** Geschichten werden vorgelesen (Vorlesebuch-Maß, Christian 2026-11-15, docs/geschichten.md §2). */
export const satzGrenzeGeschichte = (klasse) => (klasse <= 2 ? 10 : 14);
/** Sachbücher sind Vorlesebücher in normaler Kinderbuch-Sprache (Christian 2026-11-15, docs/geschichten.md §2). */
export const satzGrenzeBuch = (klasse) => (klasse <= 2 ? 15 : 18);
/** Budget aller festen Texte in Zeichen (§3). */
export const BUDGET = 2500;

const wortMuster = (w) => new RegExp(`(^|[^\\p{L}])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=$|[^\\p{L}])`, "iu");

/** Alle Zeichenketten eines JSON-Werts, die Sätze sein können. */
export function saetzeAusJson(wert, schluessel = "") {
  if (typeof wert === "string") return KEINE_SAETZE.has(schluessel) || !/\p{L}{2}/u.test(wert) ? [] : [wert];
  if (Array.isArray(wert)) return wert.flatMap((w) => saetzeAusJson(w, schluessel));
  if (wert && typeof wert === "object") return Object.entries(wert).flatMap(([k, v]) => saetzeAusJson(v, k));
  return [];
}

/** Feste Sätze in spiel.js: erste Zeichenkette in sage(…), sprich(…), sag(…). */
export function saetzeAusCode(code) {
  const raus = [];
  for (const m of code.matchAll(/\b(?:sage|sprich|sag)\(\s*(["'`])((?:\\.|(?!\1).)*)\1/g)) {
    const s = m[2].replace(/\$\{[^}]*\}/g, "7");
    if (/\p{L}{2}/u.test(s)) raus.push(s);
  }
  return raus;
}

/** Zerlegt einen Text in Sätze. */
export const inSaetze = (text) => text.split(/(?<=[.!?…])\s+/).map((s) => s.trim()).filter(Boolean);
const woerter = (satz) => satz.replace(/[·=+−\-:]/g, " ").split(/\s+/).filter((w) => /\p{L}|\d/u.test(w));

/**
 * Prüft die Texte.
 * @param {string[]} texte
 * @param {{ klasse?: number, grenze?: number, budget?: number, beschriftungen?: string[] }} [opt] beschriftungen: Texte
 *   aus index.html (nur Hinweis auf Abkürzungen); grenze überschreibt satzGrenze(klasse) (z. B.
 *   Geschichten); budget überschreibt BUDGET (Bücher haben kein Textbudget: Infinity)
 */
export function pruefeTexte(texte, { klasse = 2, grenze = satzGrenze(klasse), budget = BUDGET, beschriftungen = [] } = {}) {
  const rot = [], hinweise = [];
  const einzeln = [...new Set(texte)];
  const gesehen = new Set();
  for (const text of einzeln) {
    for (const w of URTEIL) if (wortMuster(w).test(text)) rot.push(`G1 urteilendes Wort „${w}“: „${text}“`);
    for (const w of ERSATZ) if (wortMuster(w).test(text)) rot.push(`G7 Ersatzname „${w}“: „${text}“`);
    const za = ZAHL_NACH_ARTIKEL.exec(text);
    if (za) rot.push(`Stimme: Zahl nach „${za[1].toLowerCase()}“ wird als Ordnungszahl gesprochen („zu Nummer Dreizehn“, stimme.md): „${text}“`);
    if (/(^|[^\p{L}])(ich|mir|mich|mein|meine)(?=$|[^\p{L}])/iu.test(text) && !/ich \p{L}+e, du \p{L}+st/iu.test(text))
      hinweise.push(`G10 Ich-Form? (Figuren sprechen nicht): „${text}“`);
    for (const s of inSaetze(text)) {
      if (gesehen.has(s)) continue;
      gesehen.add(s);
      const n = woerter(s).length;
      if (n > grenze) (n > grenze + 4 ? rot : hinweise).push(`§3 Satz mit ${n} Wörtern (Kl. ${klasse}: höchstens ${grenze}): „${s}“`);
    }
  }
  for (const b of new Set(beschriftungen)) if (/^[A-ZÄÖÜ]{1,2}$/.test(b.trim())) hinweise.push(`§8 Abkürzung als Beschriftung? „${b}“ – ausgeschrieben, bis das Thema sie einführt`);
  const zeichen = einzeln.reduce((n, t) => n + t.length, 0);
  if (zeichen > budget * 2) rot.push(`§3 feste Texte zusammen ${zeichen} Zeichen (Budget etwa ${budget})`);
  else if (zeichen > budget) hinweise.push(`§3 feste Texte zusammen ${zeichen} Zeichen (Budget etwa ${BUDGET}; Varianten aus Daten zählen hier mit)`);
  return { rot, hinweise, saetze: einzeln.length, zeichen };
}

/** Liest die Texte eines Spielordners; am Feld `beschriftungen` hängen die Abkürzungs-Beschriftungen aus index.html. */
export function texteDesSpiels(ordner) {
  const texte = [];
  for (const d of ["texte.json", "einfuehrung.json"]) {
    const p = join(ordner, d);
    if (existsSync(p)) texte.push(...saetzeAusJson(JSON.parse(readFileSync(p, "utf8"))));
  }
  for (const d of ["spiel.js"]) {
    const p = join(ordner, d);
    if (existsSync(p)) texte.push(...saetzeAusCode(readFileSync(p, "utf8")));
  }
  // Beschriftungen: Elemente, die nur aus 1–2 Großbuchstaben bestehen (§8 Abkürzungen)
  const html = join(ordner, "index.html");
  texte.beschriftungen = existsSync(html)
    ? [...readFileSync(html, "utf8").matchAll(/>\s*([A-ZÄÖÜ]{1,2})\s*</g)].map((m) => m[1])
    : [];
  return texte;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const argv = process.argv.slice(2);
  const ordner = argv.find((a) => !a.startsWith("--"));
  const klasse = argv.includes("--klasse") ? Number(argv[argv.indexOf("--klasse") + 1]) : 2;
  if (!ordner) { console.error("Aufruf: node werkzeuge/spielbau/texte.mjs <spielordner> [--klasse n]"); process.exit(1); }
  const texte = texteDesSpiels(resolve(ordner));
  const r = pruefeTexte(texte, { klasse, beschriftungen: texte.beschriftungen });
  console.log(JSON.stringify(r, null, 1));
  process.exit(r.rot.length ? 1 : 0);
}
