// Kosten je Spiel (docs/spielentwicklung.md §6): Einträge anhängen, summieren, für den Katalog hochrechnen.
// Ablage: spiele/<fach>/<spiel>/kosten.json = Liste von { datum, phase, posten, modell, eingabe, ausgabe, einheit, menge, notiz },
// bei claude optional cache_lesen und cache_schreiben (Token aus dem Cache gelesen bzw. in ihn geschrieben; menge zählt sie mit).
// Geparkte Spiele: Kopie der Liste in werkzeuge/kosten/geparkt/<ordner>.json (auf main, der Spielordner liegt nur im Branch).
// Reine Logik; Lesen und Schreiben nur in trageEin und lade*.

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const WURZEL = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const KOSTEN_DATEI = "kosten.json";

export const CLAUDE_PHASEN = ["entwurf", "pruefung-a", "prototyp", "pruefung-b", "ausbau", "review", "steuerung", "recherche", "schreiben", "pruefung", "idee", "bau", "pruefstand"];
export const GEPARKT_ORDNER = "werkzeuge/kosten/geparkt";
const POSTEN = {
  claude: { einheit: "tokens", phasen: CLAUDE_PHASEN },
  bild: { einheit: "bilder", phasen: ["bild"] },
  stimme: { einheit: "zeichen", phasen: ["stimme"] },
  status: { einheit: "keine", phasen: ["geparkt"] },
};

const ganz = (v) => Number.isInteger(v) && v >= 0;

/** Prüft einen Eintrag; wirft mit deutscher Meldung. Gibt den bereinigten Eintrag zurück. */
export function pruefeEintrag(e) {
  if (!e || typeof e !== "object") throw new Error("Eintrag fehlt");
  const p = POSTEN[e.posten];
  if (!p) throw new Error(`posten muss ${Object.keys(POSTEN).join(", ")} sein (war: ${e.posten})`);
  if (typeof e.datum !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(e.datum) || Number.isNaN(Date.parse(e.datum)))
    throw new Error(`datum muss JJJJ-MM-TT sein (war: ${e.datum})`);
  if (!p.phasen.includes(e.phase)) throw new Error(`phase für ${e.posten} muss ${p.phasen.join(", ")} sein (war: ${e.phase})`);
  if (e.einheit !== p.einheit) throw new Error(`einheit für ${e.posten} muss ${p.einheit} sein (war: ${e.einheit})`);
  if (e.posten === "claude" || e.posten === "bild") {
    if (typeof e.modell !== "string" || !e.modell) throw new Error(`modell fehlt für ${e.posten}`);
    if (!ganz(e.eingabe) || !ganz(e.ausgabe)) throw new Error("eingabe und ausgabe müssen ganze Zahlen ≥ 0 sein");
  }
  if (!ganz(e.menge)) throw new Error("menge muss eine ganze Zahl ≥ 0 sein");
  if (e.posten === "bild" && e.menge < 1) throw new Error("menge (Bilder) muss mindestens 1 sein");
  for (const f of ["cache_lesen", "cache_schreiben"]) {
    if (e[f] === undefined) continue;
    if (e.posten !== "claude") throw new Error(`${f} gibt es nur bei claude`);
    if (!ganz(e[f])) throw new Error(`${f} muss eine ganze Zahl ≥ 0 sein`);
  }
  if (e.posten === "claude" && e.menge !== e.eingabe + e.ausgabe + (e.cache_lesen ?? 0) + (e.cache_schreiben ?? 0))
    throw new Error("menge muss bei claude eingabe + ausgabe + cache_lesen + cache_schreiben sein");
  if (e.themen !== undefined && !ganz(e.themen)) throw new Error("themen muss eine ganze Zahl ≥ 0 sein");
  if (e.thema !== undefined) {
    if (!Array.isArray(e.thema) || !e.thema.length || !e.thema.every((t) => typeof t === "string" && t))
      throw new Error("thema muss eine Liste von Thema-Ids sein");
    if (e.themen !== undefined && e.themen !== e.thema.length) throw new Error("themen muss die Zahl der Ids in thema sein");
  }
  if (e.notiz !== undefined && typeof e.notiz !== "string") throw new Error("notiz muss Text sein");
  return {
    datum: e.datum, phase: e.phase, posten: e.posten, modell: e.modell ?? "", eingabe: e.eingabe ?? 0, ausgabe: e.ausgabe ?? 0,
    einheit: e.einheit, menge: e.menge, notiz: e.notiz ?? "",
    ...(e.cache_lesen !== undefined ? { cache_lesen: e.cache_lesen } : {}),
    ...(e.cache_schreiben !== undefined ? { cache_schreiben: e.cache_schreiben } : {}),
    ...(e.themen !== undefined || e.thema !== undefined ? { themen: e.themen ?? e.thema.length } : {}),
    ...(e.thema !== undefined ? { thema: e.thema } : {}),
    ...(e.usage !== undefined ? { usage: e.usage } : {}),
  };
}

/** Liest die Liste eines Ordners (leer, wenn es sie noch nicht gibt). */
export function liesKosten(spielOrdner, datei = KOSTEN_DATEI) {
  const p = join(spielOrdner, datei);
  if (!existsSync(p)) return [];
  const l = JSON.parse(readFileSync(p, "utf8"));
  if (!Array.isArray(l)) throw new Error(`${p} muss eine Liste sein`);
  return l;
}

/** Hängt einen geprüften Eintrag an <spielOrdner>/kosten.json an. */
export function trageEin(spielOrdner, eintrag) {
  const e = pruefeEintrag(eintrag);
  // Die Datei der analogen Spiele braucht die Themenzahl, sonst lässt sich nichts je Thema hochrechnen.
  if (basename(resolve(spielOrdner)) === "mit-echten-dingen" && !(e.themen >= 1))
    throw new Error("Einträge in mit-echten-dingen/kosten.json brauchen themen (Zahl der Themen, ≥ 1) oder thema (Thema-Ids)");
  const liste = liesKosten(spielOrdner);
  liste.push(e);
  mkdirSync(spielOrdner, { recursive: true });
  writeFileSync(join(spielOrdner, KOSTEN_DATEI), JSON.stringify(liste, null, 1) + "\n");
  return e;
}

/** Preise in Euro je Mio; Claude-Preise (USD) werden mit usdInEur umgerechnet. */
function claudePreis(preise, modell) {
  const m = preise.claude?.[modell] ?? Object.entries(preise.claude ?? {}).find(([k]) => modell.startsWith(k))?.[1];
  if (!m) return null;
  const f = m.waehrung === "USD" ? preise.usdInEur.wert : 1;
  // Fehlt ein Cache-Preis, gilt der Eingabepreis (eher zu hoch als zu niedrig).
  return { ein: m.eingabeProMio * f, aus: m.ausgabeProMio * f, lesen: (m.cacheLesenProMio ?? m.eingabeProMio) * f, schreiben: (m.cacheSchreibenProMio ?? m.eingabeProMio) * f };
}

const leer = () => ({
  claude: { eingabe: 0, ausgabe: 0, cache_lesen: 0, cache_schreiben: 0, tokens: 0, eur: 0, ohnePreis: /** @type {string[]} */ ([]) },
  bilder: { anzahl: 0, eingabe: 0, ausgabe: 0, eur: 0 },
  stimme: { zeichen: 0, eur: 0 },
  eur: 0,
});

/** Summen einer Liste von Einträgen, in Token, Zeichen, Bildern und Euro. */
export function summen(eintraege, preise) {
  const s = leer();
  for (const e of eintraege) {
    if (e.posten === "claude") {
      s.claude.eingabe += e.eingabe;
      s.claude.ausgabe += e.ausgabe;
      const lesen = e.cache_lesen ?? 0;
      const schreiben = e.cache_schreiben ?? 0;
      s.claude.cache_lesen += lesen;
      s.claude.cache_schreiben += schreiben;
      s.claude.tokens += e.eingabe + e.ausgabe + lesen + schreiben;
      const p = claudePreis(preise, e.modell);
      if (p) s.claude.eur += (e.eingabe * p.ein + e.ausgabe * p.aus + lesen * p.lesen + schreiben * p.schreiben) / 1e6;
      else if (!s.claude.ohnePreis.includes(e.modell)) s.claude.ohnePreis.push(e.modell);
    } else if (e.posten === "bild") {
      s.bilder.anzahl += e.menge;
      s.bilder.eingabe += e.eingabe;
      s.bilder.ausgabe += e.ausgabe;
      s.bilder.eur += (e.eingabe * preise.bilder.eingabeProMio + e.ausgabe * preise.bilder.ausgabeProMio) / 1e6;
    } else if (e.posten === "stimme") {
      s.stimme.zeichen += e.menge;
      s.stimme.eur += (e.menge * preise.stimme.proMioZeichen) / 1e6;
    }
  }
  s.eur = s.claude.eur + s.bilder.eur + s.stimme.eur;
  return s;
}

/** Ist das Spiel geparkt? (Eintrag phase „geparkt“ in kosten.json) */
export const istGeparkt = (eintraege) => eintraege.some((e) => e.phase === "geparkt");

/**
 * Prognose für den ganzen Katalog aus den bisherigen Spielen.
 * @param {{ name: string, eintraege: any[], geparkt?: boolean }[]} spiele
 * @param {number} katalogAnzahl Zahl der Spiele im Katalog
 */
export function prognose(spiele, katalogAnzahl, preise) {
  const je = spiele.map((sp) => ({ name: sp.name, geparkt: sp.geparkt ?? istGeparkt(sp.eintraege), s: summen(sp.eintraege, preise) }));
  const fertig = je.filter((x) => !x.geparkt);
  const geparkt = je.filter((x) => x.geparkt);
  const summiere = (l) => l.reduce((a, x) => a + x.s.eur, 0);
  const bericht = {
    katalog: katalogAnzahl,
    je,
    fertig: fertig.length,
    geparkt: { anzahl: geparkt.length, eur: summiere(geparkt), tokens: geparkt.reduce((a, x) => a + x.s.claude.tokens, 0) },
    ausgegeben: summiere(je),
    offen: Math.max(0, katalogAnzahl - je.length),
    durchschnitt: /** @type {any} */ (null),
    spanne: /** @type {any} */ (null),
    gesamt: /** @type {any} */ (null),
    rest: /** @type {any} */ (null),
  };
  if (!fertig.length) return bericht;
  const n = fertig.length;
  const mittel = (f) => fertig.reduce((a, x) => a + f(x.s), 0) / n;
  bericht.durchschnitt = {
    eur: mittel((s) => s.eur), claude: mittel((s) => s.claude.eur), bilder: mittel((s) => s.bilder.eur), stimme: mittel((s) => s.stimme.eur),
    tokens: mittel((s) => s.claude.tokens), bildAnzahl: mittel((s) => s.bilder.anzahl), zeichen: mittel((s) => s.stimme.zeichen),
  };
  const eurs = fertig.map((x) => x.s.eur);
  bericht.spanne = { min: Math.min(...eurs), max: Math.max(...eurs) };
  const mal = (k) => ({ mittel: bericht.durchschnitt.eur * k, min: bericht.spanne.min * k, max: bericht.spanne.max * k });
  // gesamt: alle Katalog-Spiele zum Durchschnitt; rest: die noch nicht begonnenen
  bericht.gesamt = {
    ...mal(katalogAnzahl),
    claude: bericht.durchschnitt.claude * katalogAnzahl, bilder: bericht.durchschnitt.bilder * katalogAnzahl, stimme: bericht.durchschnitt.stimme * katalogAnzahl,
  };
  bericht.rest = mal(bericht.offen);
  return bericht;
}

/** Die Zahl der Spiele im Katalog: Zeilen der Übersicht („| [M01] …“) in docs/spielkatalog.md. */
export function katalogAnzahl(text) {
  const ids = new Set([...text.matchAll(/^\|\s*\[([A-Z]+\d+)\]/gm)].map((m) => m[1]));
  return ids.size;
}

/** Analoge Spiele („Mit echten Dingen“): Kosten je Thema aus dem Anteil bisher erledigter Themen; Prognose für alle Themen. */
export function prognoseAnalog(eintraege, themenGesamt, preise) {
  const mitThemen = eintraege.filter((e) => e.themen);   // nur Einträge mit Themenzahl gehen in den Durchschnitt
  const s = summen(mitThemen, preise);
  // Einträge mit Thema-Ids (thema) zählen jedes Thema einmal, auch wenn mehrere Agenten (Schreiben, Prüfrunden)
  // dasselbe Thema buchen; Einträge ohne Ids zählen ihre Themenzahl.
  const ids = new Set(mitThemen.flatMap((e) => e.thema ?? []));
  const themen = ids.size + mitThemen.filter((e) => !e.thema).reduce((a, e) => a + e.themen, 0);
  const jeThema = themen ? s.eur / themen : null;
  return { summe: s, themen, themenGesamt, jeThema, prognose: jeThema === null ? null : jeThema * themenGesamt };
}

/** Findet alle Spielordner (spiele/<fach>/<spiel>/) mit kosten.json oder texte.json. */
export function findeSpielordner(wurzel = WURZEL) {
  const basis = join(wurzel, "spiele");
  const aus = [];
  for (const fach of readdirSync(basis, { withFileTypes: true })) {
    if (!fach.isDirectory()) continue;
    for (const sp of readdirSync(join(basis, fach.name), { withFileTypes: true })) {
      const ordner = join(basis, fach.name, sp.name);
      if (sp.isDirectory() && (existsSync(join(ordner, KOSTEN_DATEI)) || existsSync(join(ordner, "texte.json")))) aus.push(ordner);
    }
  }
  return aus;
}

/**
 * Ordnet neu erzeugte Texte den Spielen zu: ein Text gehört dem ersten Spiel, dessen texte.json ihn als Zeichenkette enthält.
 * @param {{ text: string, zeichen?: number }[]} neueTexte
 * @param {Record<string, string[]>} texteJeSpiel Spielordner → alle Zeichenketten aus texte.json
 * @returns {{ je: Record<string, number>, ohneSpiel: number }} Zeichen je Spielordner
 */
export function ordneZu(neueTexte, texteJeSpiel) {
  const norm = (t) => t.normalize("NFC").replace(/\s+/g, " ").trim();
  const je = /** @type {Record<string, number>} */ ({});
  let ohneSpiel = 0;
  const mengen = Object.entries(texteJeSpiel).map(([o, l]) => [o, new Set(l.map(norm))]);
  for (const t of neueTexte) {
    const z = t.zeichen ?? t.text.length;
    const treffer = mengen.find(([, m]) => m.has(norm(t.text)));
    if (treffer) je[treffer[0]] = (je[treffer[0]] ?? 0) + z;
    else ohneSpiel += z;
  }
  return { je, ohneSpiel };
}

/** Alle Zeichenketten (rekursiv) aus der texte.json eines Spiels. */
export function texteDesSpiels(spielOrdner) {
  const p = join(spielOrdner, "texte.json");
  if (!existsSync(p)) return [];
  const aus = [];
  const geh = (v) => {
    if (typeof v === "string") aus.push(v);
    else if (Array.isArray(v)) v.forEach(geh);
    else if (v && typeof v === "object") Object.values(v).forEach(geh);
  };
  geh(JSON.parse(readFileSync(p, "utf8")));
  return aus;
}

/**
 * Verbrauch eines Agenten aus seinem Transkript (Claude Code: JSONL, je Zeile ein Ereignis). Gezählt wird message.usage
 * jeder Antwort des Modells; dieselbe Nachricht (message.id) steht oft mehrfach da und zählt einmal (die letzte Zeile).
 * `ohne`: Nachrichten-Ids, die schon gebucht sind (Fortsetzung desselben Agenten, z. B. SendMessage) – so zählt nur der
 * Zuwachs. Rückgabe passt zu trageEin (posten claude) plus `ids` (alle gezählten und übergangenen) für die nächste Buchung.
 * @param {string} text Inhalt der JSONL-Datei
 * @param {{ ohne?: string[] }} [o]
 */
export function usageAusTranskript(text, { ohne = [] } = {}) {
  const schon = new Set(ohne);
  /** @type {Map<string, { modell: string, u: any }>} */
  const je = new Map();
  for (const zeile of text.split("\n")) {
    if (!zeile.trim()) continue;
    let d;
    try { d = JSON.parse(zeile); } catch { continue; }   // abgebrochene letzte Zeile eines laufenden Transkripts
    const m = d?.message;
    if (d?.type !== "assistant" || !m?.usage || !m.id) continue;
    je.set(m.id, { modell: m.model ?? "", u: m.usage });
  }
  const summe = { eingabe: 0, ausgabe: 0, cache_lesen: 0, cache_schreiben: 0 };
  const modelle = new Map();
  for (const [id, { modell, u }] of je) {
    if (schon.has(id)) continue;
    summe.eingabe += u.input_tokens ?? 0;
    summe.ausgabe += u.output_tokens ?? 0;
    summe.cache_lesen += u.cache_read_input_tokens ?? 0;
    summe.cache_schreiben += u.cache_creation_input_tokens ?? 0;
    if (modell) modelle.set(modell, (modelle.get(modell) ?? 0) + 1);
  }
  const modell = [...modelle].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
  return {
    modell, ...summe, menge: summe.eingabe + summe.ausgabe + summe.cache_lesen + summe.cache_schreiben,
    einheit: "tokens", posten: "claude", nachrichten: [...je.keys()].filter((id) => !schon.has(id)).length, ids: [...new Set([...schon, ...je.keys()])],
  };
}

/** Geparkte Spiele auf main: werkzeuge/kosten/geparkt/<ordner>.json, je Datei die Liste aus kosten.json. */
export function liesGeparkte(wurzel = WURZEL) {
  const ordner = join(wurzel, GEPARKT_ORDNER);
  if (!existsSync(ordner)) return [];
  return readdirSync(ordner)
    .filter((d) => d.endsWith(".json"))
    .map((d) => ({ name: `geparkt/${d.replace(/\.json$/, "")}`, eintraege: liesKosten(ordner, d), geparkt: true }));
}
