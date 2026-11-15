import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { katalogAnzahl, liesGeparkte, liesKosten, ordneZu, prognose, prognoseAnalog, pruefeEintrag, summen, trageEin, usageAusTranskript } from "../werkzeuge/kosten/kosten.mjs";
import { formatiere } from "../werkzeuge/kosten/bericht.mjs";
import { leseArgumente, schreibeVerbrauch, usageAusAntwort } from "../werkzeuge/bilder/erzeugen.mjs";
import { trageZeichenEin } from "../werkzeuge/audio/erzeugen.mjs";

const PREISE = {
  stand: "2026-11-14",
  usdInEur: { wert: 0.5, unsicher: true },
  claude: { "m-a": { eingabeProMio: 4, ausgabeProMio: 20, waehrung: "USD" }, "m-b": { eingabeProMio: 1, ausgabeProMio: 2, waehrung: "EUR" } },
  bilder: { modell: "bild", eingabeProMio: 5, ausgabeProMio: 40, waehrung: "EUR", unsicher: true },
  stimme: { proMioZeichen: 20, waehrung: "EUR" },
};
const claude = (modell, eingabe, ausgabe, phase = "entwurf") => ({ datum: "2026-11-14", phase, posten: "claude", modell, eingabe, ausgabe, einheit: "tokens", menge: eingabe + ausgabe, notiz: "" });
const bild = (eingabe, ausgabe) => ({ datum: "2026-11-14", phase: "bild", posten: "bild", modell: "bild", eingabe, ausgabe, einheit: "bilder", menge: 1, notiz: "" });
const stimme = (menge) => ({ datum: "2026-11-14", phase: "stimme", posten: "stimme", modell: "", eingabe: 0, ausgabe: 0, einheit: "zeichen", menge, notiz: "" });
const geparkt = { datum: "2026-11-14", phase: "geparkt", posten: "status", einheit: "keine", menge: 0 };
const temp = () => mkdtempSync(join(tmpdir(), "kosten-"));

test("trageEin: hängt an, legt die Datei an und behält ältere Einträge", () => {
  const d = temp();
  const o = join(d, "mathe", "m01-x");
  trageEin(o, claude("m-a", 100, 50));
  trageEin(o, stimme(300));
  const l = liesKosten(o);
  assert.equal(l.length, 2);
  assert.equal(l[0].menge, 150);
  assert.equal(JSON.parse(readFileSync(join(o, "kosten.json"), "utf8"))[1].posten, "stimme");
  rmSync(d, { recursive: true });
});

test("trageEin: prüft die Felder und schreibt bei Fehler nichts", () => {
  const d = temp();
  const bad = [
    [{ ...claude("m-a", 1, 1), posten: "geld" }, /posten muss/],
    [{ ...claude("m-a", 1, 1), datum: "14.11.2026" }, /datum/],
    [{ ...claude("m-a", 1, 1), phase: "bild" }, /phase für claude/],
    [{ ...claude("m-a", 1, 1), einheit: "zeichen" }, /einheit/],
    [{ ...claude("m-a", 1, 1), modell: "" }, /modell fehlt/],
    [{ ...claude("m-a", 1, 1), eingabe: -1 }, /ganze Zahlen/],
    [{ ...claude("m-a", 1, 1), ausgabe: 1.5 }, /ganze Zahlen/],
    [{ ...claude("m-a", 1, 1), menge: 5 }, /eingabe \+ ausgabe/],
    [{ ...bild(1, 1), menge: 0 }, /mindestens 1/],
    [{ ...stimme(1), menge: "7" }, /menge/],
    [{ ...stimme(1), phase: "entwurf" }, /phase für stimme/],
    [null, /Eintrag fehlt/],
  ];
  for (const [e, muster] of bad) assert.throws(() => trageEin(d, e), muster);
  assert.deepEqual(liesKosten(d), []);
  assert.doesNotThrow(() => pruefeEintrag(geparkt));
  rmSync(d, { recursive: true });
});

test("summen: Token, Bilder, Zeichen und Euro, Claude-USD wird umgerechnet", () => {
  const s = summen([claude("m-a", 1e6, 1e6), claude("m-b", 1e6, 1e6, "prototyp"), bild(1e6, 1e5), stimme(2e6)], PREISE);
  assert.equal(s.claude.tokens, 4e6);
  assert.equal(s.claude.eur, (4 + 20) * 0.5 + (1 + 2));   // 15
  assert.equal(s.bilder.anzahl, 1);
  assert.ok(Math.abs(s.bilder.eur - (5 + 4)) < 1e-9);
  assert.equal(s.stimme.zeichen, 2e6);
  assert.equal(s.stimme.eur, 40);
  assert.ok(Math.abs(s.eur - (15 + 9 + 40)) < 1e-9);
});

test("summen: Modell ohne Preis zählt Token, aber nicht Euro, und wird gemeldet", () => {
  const s = summen([claude("unbekannt", 10, 10)], PREISE);
  assert.equal(s.claude.tokens, 20);
  assert.equal(s.claude.eur, 0);
  assert.deepEqual(s.claude.ohnePreis, ["unbekannt"]);
  assert.equal(summen([], PREISE).eur, 0);
});

const SPIELE = [
  { name: "mathe/m01", eintraege: [claude("m-b", 1e6, 0)] },          // 1 €
  { name: "mathe/m02", eintraege: [claude("m-b", 3e6, 0), stimme(1e6)] },   // 3 + 20 = 23 €
  { name: "lesen/l01", eintraege: [claude("m-b", 10e6, 0), geparkt] },     // 10 €, geparkt
];

test("prognose: Durchschnitt und Spanne nur über fertige Spiele, Geparktes gesondert", () => {
  const p = prognose(SPIELE, 10, PREISE);
  assert.equal(p.fertig, 2);
  assert.equal(p.geparkt.anzahl, 1);
  assert.equal(p.geparkt.eur, 10);
  assert.equal(p.ausgegeben, 34);
  assert.equal(p.durchschnitt.eur, 12);
  assert.deepEqual(p.spanne, { min: 1, max: 23 });
  assert.deepEqual([p.gesamt.mittel, p.gesamt.min, p.gesamt.max], [120, 10, 230]);
  assert.equal(p.offen, 7);
  assert.equal(p.rest.mittel, 84);
  assert.equal(p.gesamt.stimme, 100);   // Durchschnitt 10 € × 10
});

test("prognose: ohne fertiges Spiel keine Zahlen, aber Ausgaben", () => {
  const p = prognose([SPIELE[2]], 138, PREISE);
  assert.equal(p.durchschnitt, null);
  assert.equal(p.gesamt, null);
  assert.equal(p.ausgegeben, 10);
  assert.equal(prognose([], 5, PREISE).offen, 5);
});

test("analoge Spiele: Kosten je Thema, Prognose über alle Themen", () => {
  const e = [{ ...claude("m-b", 2e6, 0, "recherche"), themen: 2 }, { ...claude("m-b", 4e6, 0, "schreiben"), themen: 2 }];
  const a = prognoseAnalog(e, 100, PREISE);
  assert.equal(a.themen, 4);
  assert.equal(a.jeThema, 1.5);
  assert.equal(a.prognose, 150);
  assert.equal(prognoseAnalog([claude("m-b", 1, 1)], 100, PREISE).prognose, null);
  // Einträge ohne themen verfälschen den Durchschnitt nicht
  assert.equal(prognoseAnalog([...e, claude("m-b", 90e6, 0)], 100, PREISE).jeThema, 1.5);
  // die Datei der analogen Spiele verlangt themen
  const d = temp();
  const analog = join(d, "mit-echten-dingen");
  assert.throws(() => trageEin(analog, claude("m-b", 1, 1, "recherche")), /brauchen themen/);
  trageEin(analog, { ...claude("m-b", 1, 1, "recherche"), themen: 1 });
  assert.equal(liesKosten(analog).length, 1);
  rmSync(d, { recursive: true });
  assert.throws(() => pruefeEintrag({ ...claude("m-b", 1, 1), themen: -1 }), /themen/);
});

test("analoge Spiele: mit Thema-Ids zählt jedes Thema einmal, egal wie viele Agenten es buchen", () => {
  const z = (phase, thema) => ({ ...claude("m-b", 1e6, 0, phase), thema });
  const e = [z("schreiben", ["zerlegen-2"]), z("pruefung", ["zerlegen-2"]), z("pruefung", ["zerlegen-2"]),
    z("schreiben", ["zerlegen-3"]), z("pruefung", ["zerlegen-3"]), z("schreiben", ["zerlegen-2"])]
    .map((x) => pruefeEintrag(x));
  assert.equal(e[0].themen, 1);
  const a = prognoseAnalog(e, 100, PREISE);
  assert.equal(a.themen, 2);
  assert.equal(a.jeThema, 3);   // 6 Mio. Token zu 1 €/Mio. auf 2 Themen
  // gemischt: alte Einträge ohne Ids zählen ihre Zahl dazu
  assert.equal(prognoseAnalog([...e, { ...claude("m-b", 1, 0, "recherche"), themen: 3 }], 100, PREISE).themen, 5);
  assert.throws(() => pruefeEintrag({ ...claude("m-b", 1, 1), thema: [] }), /thema/);
  assert.throws(() => pruefeEintrag({ ...claude("m-b", 1, 1), thema: ["a"], themen: 2 }), /themen/);
});

test("Katalog: zählt die Spiel-Zeilen der Übersicht, nicht Tabellen anderswo", () => {
  const t = "| Fach | Spiele |\n|---|---:|\n| Mathe | 56 |\n| [M01](a.md) Paare | x |\n| [M02](a.md) Weg | x |\n| [M01](a.md) doppelt | x |\n| [L01](b.md) Post | x |";
  assert.equal(katalogAnzahl(t), 3);
});

test("Bericht: Spiel, geparkt, Prognose mit Spannweite, analoge Spiele getrennt", () => {
  const text = formatiere({ spiele: SPIELE, katalog: 10, preise: PREISE, analog: [{ ...claude("m-b", 2e6, 0, "recherche"), themen: 2 }], themenGesamt: 100 });
  assert.match(text, /mathe\/m02: 23,00 €/);
  assert.match(text, /lesen\/l01  \[geparkt\]/);
  assert.match(text, /Prognose für alle 10 Spiele/);
  assert.match(text, /Spannweite 10,00 € bis 230,00 €/);
  assert.match(text, /Mit echten Dingen/);
  assert.match(text, /Prognose für alle 100 Themen des Lernplans: 100,00 €/);
  assert.match(text, /unsicher: Wechselkurs USD→EUR, Bildpreis/);
  assert.match(formatiere({ spiele: [], katalog: 138, preise: PREISE, analog: [], themenGesamt: 956 }), /Noch kein Spiel/);
});

test("Bild-Werkzeug: Argumente, usage und Eintrag in kosten.json und herkunft.json", () => {
  assert.deepEqual(leseArgumente(["--spiel", "x/y", "b.png", "Szene"]), { ziel: "b.png", szene: "Szene", spiel: "x/y" });
  assert.equal(leseArgumente(["b.png", "S"]).spiel, "");
  assert.throws(() => leseArgumente(["--spiel"]), /Spielordner/);
  assert.throws(() => leseArgumente(["b.png"]), /Aufruf/);
  assert.throws(() => usageAusAntwort({ data: [] }), /usage/);
  const usage = { input_tokens: 120, output_tokens: 6200, total_tokens: 6320 };
  assert.equal(usageAusAntwort({ usage }), usage);
  const d = temp();
  const spiel = join(d, "spiel");
  const bilder = join(spiel, "bilder");
  mkdirSync(bilder, { recursive: true });
  schreibeVerbrauch({ spiel: "", ziel: join(bilder, "ohne.png"), modell: "m", prompt: "p", usage });
  assert.equal(existsSync(join(bilder, "herkunft.json")), false);   // ohne --spiel wie zuvor: nichts schreiben
  assert.equal(existsSync(join(spiel, "kosten.json")), false);
  schreibeVerbrauch({ spiel, ziel: join(bilder, "a.png"), modell: "gpt-image-1", prompt: "p", usage, datum: "2026-11-14" });
  const k = liesKosten(spiel);
  assert.equal(k.length, 1);
  assert.deepEqual([k[0].posten, k[0].eingabe, k[0].ausgabe, k[0].menge], ["bild", 120, 6200, 1]);
  const h = JSON.parse(readFileSync(join(bilder, "herkunft.json"), "utf8"));
  assert.deepEqual(h["a.png"].usage, usage);
  rmSync(d, { recursive: true });
});

test("Audio: neu erzeugte Zeichen je Spiel über texte.json oder --spiel", () => {
  const d = temp();
  const a = join(d, "mathe", "m01-a");
  const b = join(d, "mathe", "m02-b");
  for (const [o, texte] of [[a, ["Zähl mal.", "Hallo"]], [b, [{ satz: "Leg zwei Stäbe." }]]]) {
    mkdirSync(o, { recursive: true });
    writeFileSync(join(o, "texte.json"), JSON.stringify(texte));
  }
  const erzeugt = [{ text: "Zähl  mal.", zeichen: 9 }, { text: "Leg zwei Stäbe.", zeichen: 15 }, { text: "Fremd", zeichen: 5 }];
  assert.deepEqual(ordneZu(erzeugt, { a: ["Zähl mal."], b: ["Leg zwei Stäbe."] }), { je: { a: 9, b: 15 }, ohneSpiel: 5 });
  const r = trageZeichenEin(erzeugt, { spielordner: [a, b], datum: "2026-11-14" });
  assert.equal(r.ohneSpiel, 5);
  assert.equal(liesKosten(a)[0].menge, 9);
  assert.equal(liesKosten(b)[0].einheit, "zeichen");
  const r2 = trageZeichenEin(erzeugt, { spiel: b, spielordner: [a, b] });
  assert.deepEqual(r2.je, { [b]: 29 });
  assert.equal(liesKosten(b).length, 2);
  assert.deepEqual(trageZeichenEin([], { spiel: b }), { je: {}, ohneSpiel: 0 });
  rmSync(d, { recursive: true });
});

test("Preise: jede Zeile hat Stand und Quelle, Unsicheres ist markiert", () => {
  const p = JSON.parse(readFileSync(new URL("../werkzeuge/kosten/preise.json", import.meta.url), "utf8"));
  for (const [k, m] of Object.entries(p.claude)) assert.ok(m.stand && m.quelle && m.eingabeProMio > 0 && m.ausgabeProMio > 0, k);
  for (const k of ["bilder", "stimme"]) assert.ok(p[k].stand && p[k].quelle && typeof p[k].unsicher === "boolean", k);
  assert.equal(p.usdInEur.unsicher, true);
});

test("Audio: lauf() selbst trägt die Zeichen ein, damit auch die Anhör-Seite Kosten erfasst", () => {
  const q = readFileSync(new URL("../werkzeuge/audio/erzeugen.mjs", import.meta.url), "utf8");
  const lauf = q.slice(q.indexOf("export async function lauf"), q.indexOf("async function main"));
  assert.match(lauf, /trageZeichenEin\(bericht\.erzeugt/);
  assert.ok(!q.slice(q.indexOf("async function main")).includes("trageZeichenEin("), "main trägt nicht zusätzlich ein (sonst doppelt)");
  const a = readFileSync(new URL("../werkzeuge/audio/anhoeren.mjs", import.meta.url), "utf8");
  assert.match(a, /await lauf\(\)/);
});

// --- Verbrauch aus dem Transkript, Cache, Steuerung, Geparktes auf main (Skill „Spiel entwickeln“) -------------------

const TRANSKRIPT = new URL("./daten/transkript-agent.jsonl", import.meta.url);

test("Transkript: zählt jede Antwort einmal, Cache getrennt, abgebrochene Zeile übergangen", () => {
  const u = usageAusTranskript(readFileSync(TRANSKRIPT, "utf8"));
  assert.deepEqual(
    { modell: u.modell, eingabe: u.eingabe, ausgabe: u.ausgabe, cache_lesen: u.cache_lesen, cache_schreiben: u.cache_schreiben, nachrichten: u.nachrichten },
    { modell: "claude-opus-5-5", eingabe: 10, ausgabe: 210, cache_lesen: 2200, cache_schreiben: 1500, nachrichten: 3 },
  );
  assert.equal(u.menge, 10 + 210 + 2200 + 1500);
  assert.deepEqual(u.ids.sort(), ["msg_1", "msg_2", "msg_3"]);
});

test("Transkript: Fortsetzung bucht nur den Zuwachs (ohne = schon gebuchte Ids)", () => {
  const u = usageAusTranskript(readFileSync(TRANSKRIPT, "utf8"), { ohne: ["msg_1", "msg_2"] });
  assert.equal(u.nachrichten, 1);
  assert.deepEqual([u.eingabe, u.ausgabe, u.cache_lesen, u.cache_schreiben], [5, 90, 1200, 300]);
  assert.equal(usageAusTranskript(readFileSync(TRANSKRIPT, "utf8"), { ohne: u.ids }).nachrichten, 0);
});

test("Transkript-Werkzeug: bucht mit Stand, zweiter Aufruf bucht nichts doppelt", async () => {
  const { spawnSync } = await import("node:child_process");
  const ordner = temp();
  const stand = join(ordner, "stand.json");
  const lauf = () => spawnSync(process.execPath, [fileURLToPath(new URL("../werkzeuge/kosten/transkript.mjs", import.meta.url)), fileURLToPath(TRANSKRIPT),
    "--ordner", ordner, "--phase", "pruefung-a", "--notiz", "Runde 1", "--stand", stand, "--datum", "2026-11-14"], { encoding: "utf8" });
  assert.equal(lauf().status, 0);
  assert.equal(lauf().status, 0);
  const l = liesKosten(ordner);
  assert.equal(l.length, 1);
  assert.equal(l[0].cache_lesen, 2200);
  assert.equal(l[0].menge, 3920);
  rmSync(ordner, { recursive: true });
});

test("Cache: eigene Preise, ohne Cache-Preis gilt der Eingabepreis; menge prüft die Cache-Token mit", () => {
  const P = { ...PREISE, claude: { ...PREISE.claude, "m-c": { eingabeProMio: 4, ausgabeProMio: 20, cacheLesenProMio: 0.4, cacheSchreibenProMio: 5, waehrung: "EUR" } } };
  const e = (modell) => ({ ...claude(modell, 0, 0), cache_lesen: 1e6, cache_schreiben: 1e6, menge: 2e6 });
  assert.equal(summen([e("m-c")], P).claude.eur, 5.4);
  assert.equal(summen([e("m-b")], P).claude.eur, 2);   // m-b ohne Cache-Preise: 2 × 1 EUR
  assert.equal(summen([e("m-c")], P).claude.tokens, 2e6);
  assert.throws(() => pruefeEintrag({ ...e("m-c"), menge: 0 }), /cache_lesen/);
  assert.throws(() => pruefeEintrag({ ...stimme(5), cache_lesen: 1 }), /nur bei claude/);
  assert.equal(pruefeEintrag({ ...claude("m-a", 1, 1), phase: "steuerung" }).phase, "steuerung");
});

test("Geparkt auf main: werkzeuge/kosten/geparkt/<ordner>.json zählt als geparkt", () => {
  const w = temp();
  mkdirSync(join(w, "werkzeuge/kosten/geparkt"), { recursive: true });
  writeFileSync(join(w, "werkzeuge/kosten/geparkt/m15-mach-voll.json"), JSON.stringify([claude("m-b", 1e6, 0), geparkt]));
  const g = liesGeparkte(w);
  assert.deepEqual(g.map((x) => [x.name, x.geparkt, x.eintraege.length]), [["geparkt/m15-mach-voll", true, 2]]);
  assert.match(formatiere({ spiele: g, katalog: 10, preise: PREISE, analog: [], themenGesamt: 1 }), /geparkt\/m15-mach-voll  \[geparkt\]: 1,00 €/);
  assert.deepEqual(liesGeparkte(temp()), []);
  rmSync(w, { recursive: true });
});
