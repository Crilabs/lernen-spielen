// Sammelt alle Texte, die die Spiele vorlesen können und die schon als Daten oder als feste Zeichenkette
// vorliegen (dazu die Sätze aus `texte.json` jedes Spielordners, docs/spielentwicklung.md „Ablage“). Sätze aus Vorlagen im Spielcode (Template-Strings, zusammengesetzte Texte) findet das Skript
// nicht. Es zählt sie aber je Datei, damit sichtbar bleibt, was noch fehlt (siehe Spec: Vorlagen als Daten).

import { readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { audioSchluessel, normalisiere } from "../../spiele/kern/audio.js";

/** Pfad relativ zu spiele/, immer mit „/“ (auch unter Windows, wo relative() „\\“ liefert). */
const rel = (/** @type {string} */ von, /** @type {string} */ zu) => relative(von, zu).split(sep).join("/");

/** @typedef {{ schluessel: string, text: string, variante: string, quellen: string[] }} Eintrag */

const json = (pfad) => JSON.parse(readFileSync(pfad, "utf8"));

/** Alle Werte unter dem Feld `feld`, rekursiv. */
function felder(o, feld, aus = []) {
  if (Array.isArray(o)) o.forEach((v) => felder(v, feld, aus));
  else if (o && typeof o === "object")
    for (const [k, v] of Object.entries(o)) {
      if (k === feld && typeof v === "string") aus.push(v);
      else felder(v, feld, aus);
    }
  return aus;
}

function dateien(dir, endungen, ohne = []) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return ohne.includes(e.name) ? [] : dateien(p, endungen, ohne);
    return endungen.some((x) => e.name.endsWith(x)) ? [p] : [];
  });
}

// Aufrufe der Sprechfunktionen in den Spielen. Nur ein reines Zeichenketten-Literal als erstes Argument
// wird übernommen; alles andere zählt als „nicht erfasst“. Dazu die Sprechblase des Erzählers
// (`blase.sage("…")`, spiele/rahmen/blase.js): als einzige Methode, `obj.say(…)` bleibt fremd.
const AUFRUF = /\b(?:sprich|kernSprich|say|sag)\(\s*|\.sage\(\s*/g;
const LITERAL = /^(["'])((?:\\.|(?!\1)[^\\\n])*)\1\s*[,)]/;

/**
 * @param {string} quelltext
 * @returns {{ texte: string[], offen: number }}
 */
export function literaleAusCode(quelltext) {
  const texte = [];
  let offen = 0;
  for (const m of quelltext.matchAll(AUFRUF)) {
    const rest = quelltext.slice(m.index + m[0].length);
    if (rest.startsWith(")")) continue;   // Aufruf ohne Argument
    const vor = quelltext.slice(Math.max(0, m.index - 9), m.index);
    const methode = m[0].startsWith(".");
    if (!methode && (/function\s*$/.test(vor) || /\.\s*$/.test(quelltext.slice(m.index - 1, m.index)))) continue;
    const l = rest.match(LITERAL);
    if (l) texte.push(l[2].replace(/\\(.)/g, "$1"));
    else offen += 1;
  }
  return { texte, offen };
}

/**
 * Alle Sätze aus einer `texte.json` eines Spielordners: jede Zeichenkette, rekursiv in Objekten und Listen. Keine
 * Schlüssel, keine Zahlen (auch keine Zeichenkette aus lauter Ziffern), nichts unter `hinweis` (Erklärung für
 * Entwickler, wird nicht gesprochen).
 * @param {unknown} daten @returns {string[]}
 */
export function saetzeAusTexten(daten, aus = []) {
  if (typeof daten === "string") {
    if (/\p{L}/u.test(daten)) aus.push(daten);
  } else if (Array.isArray(daten)) daten.forEach((v) => saetzeAusTexten(v, aus));
  else if (daten && typeof daten === "object")
    for (const [k, v] of Object.entries(daten)) if (k !== "hinweis") saetzeAusTexten(v, aus);
  return aus;
}

// Namen der Rahmen-Knöpfe: `<ls-knopf … name="…">` (sonst `wort="…"`) spricht seinen Namen beim ersten Tippen
// (spiele/rahmen/knopf.js), außer mit `stumm`. Nur feste Werte; `${…}` zählt nicht.
const KNOPF = /<ls-knopf\b[^>]*>/g;
/** Entwicklerseiten (nicht aus der App erreichbar): ihre Knopfnamen brauchen keine Aufnahme. */
const NUR_ENTWICKLUNG = new Set(["rahmen/vorschau.html"]);

/**
 * @param {string} quelltext
 * @returns {string[]}
 */
export function knopfNamen(quelltext) {
  const namen = [];
  for (const [tag] of quelltext.matchAll(KNOPF)) {
    if (/\sstumm[\s>=]/.test(tag)) continue;
    const wert = (attr) => tag.match(new RegExp(`\\s${attr}="([^"]*)"`))?.[1];
    const name = wert("name") ?? wert("wort");
    if (name && !name.includes("${")) namen.push(name);
  }
  return namen;
}

/**
 * Sammelt die Texte des Projekts.
 * @param {string} wurzel Projektordner
 * @returns {{ eintraege: Eintrag[], offen: Record<string, number> }}
 */
export function sammle(wurzel) {
  const spiele = join(wurzel, "spiele");
  /** @type {Map<string, Eintrag>} */
  const alle = new Map();
  /** @type {Record<string, number>} */
  const offen = {};
  const neu = (text, quelle, variante = "") => {
    const t = normalisiere(text);
    if (!t) return;
    const schluessel = audioSchluessel(t, variante);
    const e = alle.get(schluessel) ?? { schluessel, text: t, variante, quellen: [] };
    if (!e.quellen.includes(quelle)) e.quellen.push(quelle);
    alle.set(schluessel, e);
  };

  // Namen der Kacheln beim ersten Tippen: Spiel-Kacheln (Startseite „dran“, Fach-Seite) und Fach-Kacheln der Startseite
  const katalog = json(join(spiele, "spiele.json"));
  for (const s of katalog.spiele) if (s.titel) neu(s.titel, "spiele.json");
  for (const k of katalog.kategorien ?? []) if (k.name) neu(k.name, "spiele.json");

  // Lernplan: Namen der Themen zum Vorlesen. Die Anregungen `eltern` (ls-anregung) sind Elternsprache und werden
  // nicht vorgelesen, also auch nicht gesammelt.
  for (const t of felder(json(join(spiele, "lernplan.json")), "sprich")) neu(t, "lernplan.json");

  // Einführungen
  for (const p of dateien(join(spiele, "einfuehrungen"), [".json"]))
    for (const t of felder(json(p), "sprich")) neu(t, rel(spiele, p));
  // Eigene Einführung eines Spiels im Spielordner (EINFUEHRUNG in spiele/vorlage/spiel.js)
  for (const p of dateien(spiele, [".json"], ["einfuehrungen", "kern", "audio", "mit-echten-dingen"]))
    if (p.endsWith(`${sep}einfuehrung.json`)) for (const t of felder(json(p), "sprich")) neu(t, rel(spiele, p));

  // Sätze aus Daten eines Spiels (spiele/<fach>/<spiel>/texte.json): ausgeschriebene Sätze je Aufgabe, Reihe …
  for (const p of dateien(spiele, [".json"], ["einfuehrungen", "kern", "audio", "mit-echten-dingen"]))
    if (p.endsWith(`${sep}texte.json`)) for (const t of saetzeAusTexten(json(p))) neu(t, rel(spiele, p));

  // Diktatsätze (Material für die Schreibspiele): der Satz selbst, ohne Variante, wie bisher aufgenommen.
  // Einleitungen wie „Hör noch mal hin. …“ gehören zum jeweiligen Spiel und kommen mit ihm.
  for (const s of json(join(spiele, "saetze", "saetze.json")).saetze ?? [])
    if (typeof s?.text === "string") neu(s.text, "saetze/saetze.json");

  // Feste Sätze im Spielcode
  for (const p of dateien(spiele, [".html", ".js"], ["kern", "audio"])) {
    const { texte, offen: n } = literaleAusCode(readFileSync(p, "utf8"));
    const q = rel(spiele, p);
    texte.forEach((t) => neu(t, q));
    if (!NUR_ENTWICKLUNG.has(q)) knopfNamen(readFileSync(p, "utf8")).forEach((t) => neu(t, q));
    if (n) offen[q] = n;
  }

  return { eintraege: [...alle.values()].sort((a, b) => a.schluessel.localeCompare(b.schluessel, "de")), offen };
}
