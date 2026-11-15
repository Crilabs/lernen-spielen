// Geschichten (docs/geschichten.md): Format jeder spiele/geschichten/<id>/geschichte.json, die Bildelemente der
// Szenen (spiele/rahmen/szene.js) und die Lerngeschichte „Zehnerpaare“.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { pruefeTexte, inSaetze, satzGrenze } from "../werkzeuge/spielbau/texte.mjs";

const { pruefeSzene, paarLage, hausSvg, artDes, ELEMENTE } = await import("../spiele/rahmen/szene.js");
const { laenge } = await import("../spiele/rahmen/perlen-geometrie.js");

const SPIELE = fileURLToPath(new URL("../spiele/", import.meta.url));
const ORDNER = join(SPIELE, "geschichten");
const beurteilung = JSON.parse(readFileSync(join(ORDNER, "beurteilung.json"), "utf8"));
const FAMILIEN = new Set(beurteilung.familien.map((f) => f.id));
const WELTEN = new Set(Object.keys(beurteilung.welten));
const KINDER = new Set(readdirSync(join(SPIELE, "runde", "kinder")).filter((d) => /^[a-z]+\.js$/.test(d) && !["schnitt.js", "stil.js"].includes(d)).map((d) => d.slice(0, -3)));
const HALTUNGEN = new Set([...readFileSync(join(SPIELE, "runde", "haltungen.js"), "utf8").matchAll(/id: "([a-z-]+)"/g)].map((m) => m[1]));
const ARTEN = new Set(["sachgeschichte", "sinn", "form", "struktur"]);

const geschichten = readdirSync(ORDNER, { withFileTypes: true })
  .filter((e) => e.isDirectory() && existsSync(join(ORDNER, e.name, "geschichte.json")))
  .map((e) => ({ ordner: e.name, g: JSON.parse(readFileSync(join(ORDNER, e.name, "geschichte.json"), "utf8")) }));

/** Alle Fehler einer Geschichte (leer = gültig). */
function pruefeGeschichte(g, ordner) {
  const f = [];
  if (g.id !== ordner) f.push(`id „${g.id}“ passt nicht zum Ordner ${ordner}`);
  if (typeof g.titel !== "string" || !g.titel.trim()) f.push("titel fehlt");
  if (!ARTEN.has(g.art)) f.push(`art „${g.art}“ unbekannt`);
  if (!Number.isInteger(g.klasse) || g.klasse < 1 || g.klasse > 4) f.push("klasse nicht 1–4");
  if (g.art === "sachgeschichte") {
    if (!WELTEN.has(g.welt)) f.push(`welt „${g.welt}“ fehlt in beurteilung.json`);
    if (!Array.isArray(g.quellen) || !g.quellen.length || !g.quellen.every((q) => q?.fakt && q?.quelle)) f.push("Sachgeschichte ohne quellen (fakt, quelle)");
  } else if (!FAMILIEN.has(g.familie)) f.push(`familie „${g.familie}“ fehlt in beurteilung.json`);
  const seiten = Array.isArray(g.seiten) ? g.seiten : [];
  if (seiten.length < 6 || seiten.length > 10) f.push(`${seiten.length} Seiten (6–10)`);
  const fragen = seiten.filter((s) => s?.frage === true).length;
  if (fragen > 1) f.push(`${fragen} Fragen (höchstens eine)`);
  if (seiten.at(-1)?.frage) f.push("Frage auf der letzten Seite (Auflösung fehlt)");
  seiten.forEach((s, i) => {
    const wo = `Seite ${i + 1}`;
    if (typeof s?.text !== "string" || !s.text.trim()) return void f.push(`${wo}: text fehlt`);
    const n = inSaetze(s.text).length;
    if (n < 1 || n > 3) f.push(`${wo}: ${n} Sätze (1–3)`);
    if ("sprich" in s && typeof s.sprich !== "string") f.push(`${wo}: sprich ist kein Text`);
    const hatBild = typeof s.bild === "string", hatSzene = Array.isArray(s.szene);
    if (hatBild === hatSzene) f.push(`${wo}: genau eins von bild oder szene`);
    if (hatBild && !existsSync(join(ORDNER, ordner, s.bild))) f.push(`${wo}: Bild ${s.bild} fehlt`);
    if (hatSzene) {
      for (const e of pruefeSzene(s.szene)) f.push(`${wo}: ${e}`);
      for (const b of s.szene) {
        if (artDes(b) !== "figur") continue;
        if (!KINDER.has(b.figur)) f.push(`${wo}: Kind „${b.figur}“ gibt es nicht`);
        if (b.haltung !== undefined && !HALTUNGEN.has(b.haltung)) f.push(`${wo}: Haltung „${b.haltung}“ gibt es nicht`);
      }
    }
  });
  const texte = seiten.flatMap((s) => [s?.text, s?.sprich]).filter((t) => typeof t === "string");
  const r = pruefeTexte(texte, { klasse: g.klasse });
  f.push(...r.rot, ...r.hinweise.filter((h) => h.startsWith("§3 Satz")));
  return f;
}

test("es gibt Geschichten", () => {
  assert.ok(geschichten.length >= 1);
});

test("index.json listet genau die Geschichten der Ordner mit Titel, Art, Welt und Familie", () => {
  const liste = JSON.parse(readFileSync(join(ORDNER, "index.json"), "utf8")).geschichten;
  const erwartet = geschichten.map(({ g }) => ({ id: g.id, titel: g.titel, art: g.art, welt: g.welt ?? null, familie: g.familie ?? null }))
    .sort((a, b) => a.id.localeCompare(b.id));
  assert.deepEqual([...liste].sort((a, b) => a.id.localeCompare(b.id)), erwartet, "spiele/geschichten/index.json nachtragen");
});

for (const { ordner, g } of geschichten) {
  test(`Geschichte ${ordner}: Format und Regeln (geschichten.md §2, §3)`, () => {
    assert.deepEqual(pruefeGeschichte(g, ordner), []);
  });
}

test("pruefeGeschichte findet Verstöße", () => {
  const seite = { text: "Ela legt die Perlen.", szene: [{ figur: "ela", x: 10 }] };
  const gut = { id: "probe", titel: "Probe", art: "struktur", familie: "zehnerpaare", klasse: 1, seiten: Array(6).fill(seite) };
  assert.deepEqual(pruefeGeschichte(gut, "probe"), []);
  const f = (aenderung) => pruefeGeschichte({ ...gut, ...aenderung }, "probe").join(" | ");
  assert.match(f({ art: "roman" }), /art/);
  assert.match(f({ familie: "gibt-es-nicht" }), /familie/);
  assert.match(f({ seiten: Array(5).fill(seite) }), /5 Seiten/);
  assert.match(f({ seiten: [...Array(4).fill(seite), { ...seite, frage: true }, { ...seite, frage: true }] }), /2 Fragen/);
  assert.match(f({ seiten: [...Array(5).fill(seite), { ...seite, frage: true }] }), /letzten Seite/);
  assert.match(f({ seiten: [...Array(5).fill(seite), { text: "Ela und Kofi legen heute sehr viele bunte Perlen.", szene: [] }] }), /Wörtern/);
  assert.match(f({ seiten: [...Array(5).fill(seite), { text: "Ela legt.", bild: "fehlt.webp" }] }), /fehlt/);
  assert.match(f({ seiten: [...Array(5).fill(seite), { text: "Ela legt.", szene: [{ drache: 1 }] }] }), /unbekanntes Bildelement/);
  assert.match(f({ seiten: [...Array(5).fill(seite), { text: "Ela legt.", szene: [{ figur: "mia" }] }] }), /Kind/);
  assert.match(f({ seiten: [...Array(5).fill(seite), { text: "Super, Ela.", szene: [] }] }), /G1/);
  assert.match(f({ art: "sachgeschichte", welt: "haustiere" }), /quellen/);
});

// --- Bildelemente (rahmen/szene.js) -----------------------------------------------------------------------

test("szene: bekannte Elemente, Einführung nutzt dieselben", () => {
  assert.deepEqual([...ELEMENTE], ["figur", "perlen", "zahl", "objekt", "haeuser", "paare"]);
  assert.match(readFileSync(join(SPIELE, "einfuehrung.js"), "utf8"), /import \{ baueBild, SZENE_CSS \} from "\.\/rahmen\/szene\.js"/);
  assert.deepEqual(pruefeSzene([{ figur: "ela", x: 9 }, { perlen: [3, 7] }, { zahl: 7 }, { objekt: "einkaufskorb" },
    { haeuser: [3, 7], zu: 1 }, { paare: [[1, 9], [5, 5]] }]), []);
});

test("szene: pruefeSzene weist Kaputtes ab", () => {
  const eins = (b) => pruefeSzene([b]).join(" | ");
  assert.match(pruefeSzene("x").join(), /keine Liste/);
  assert.match(eins({ drache: 1 }), /unbekannt/);
  assert.match(eins({ perlen: [0] }), /perlen/);
  assert.match(eins({ perlen: [11] }), /perlen/);
  assert.match(eins({ haeuser: [3] }), /haeuser/);
  assert.match(eins({ haeuser: [3, 10] }), /haeuser/);
  assert.match(eins({ haeuser: [3, 7], zu: 2 }), /zu/);
  assert.match(eins({ paare: [[6, 6]] }), /paare/);
  assert.match(eins({ paare: [[0, 9]] }), /paare/);
  assert.match(eins({ perlen: [3], x: 120 }), /x/);
  assert.match(eins({ perlen: [3], hoehe: 0 }), /hoehe/);
  assert.match(eins({ figur: "kofi", blick: "oben" }), /blick/);
});

test("szene: paare liegen wie das Material – erster Stab links, zweiter rechts bündig, alle Reihen gleich lang", () => {
  const paare = [[1, 9], [2, 8], [3, 7], [4, 6], [5, 5]];
  const { gesamt, reihen } = paarLage(paare);
  for (const r of reihen) {
    assert.ok(Math.abs(r.links + laenge(r.b) - gesamt) < 1e-9, `${r.a}+${r.b}: zweiter Stab endet am Rand`);
    assert.ok(r.links >= laenge(r.a), `${r.a}+${r.b}: Stäbe überlappen nicht`);
  }
  assert.ok(gesamt >= laenge(10));
});

test("szene: Haus mit und ohne Vorhang", () => {
  const offen = hausSvg(0, false), zu = hausSvg(1, true);
  assert.match(offen, /^<svg /);
  assert.ok(zu.length > offen.length, "Vorhang wird gezeichnet");
  assert.doesNotMatch(offen + zu, /<text/, "keine Schrift im Haus");
});

// --- Lerngeschichte Zehnerpaare -----------------------------------------------------------------------------

test("Zehnerpaare: jedes Bild zeigt genau zehn Perlen, die Frage wird aufgelöst, am Ende alle fünf Paare", () => {
  const g = geschichten.find((x) => x.ordner === "zehnerpaare")?.g;
  assert.ok(g, "spiele/geschichten/zehnerpaare/geschichte.json fehlt");
  assert.equal(g.art, "struktur");
  assert.equal(g.familie, "zehnerpaare");
  assert.ok(g.klasse <= 2 && satzGrenze(g.klasse) === 8);
  const gesehen = [];
  g.seiten.forEach((s, i) => {
    for (const b of s.szene ?? []) {
      if (b.haeuser) {
        const summe = b.haeuser[0] + b.haeuser[1];
        assert.ok(summe === 10 || summe === 0, `Seite ${i + 1}: ${b.haeuser} sind nicht zehn`);
        if (summe === 10 && b.zu === undefined) gesehen.push(b.haeuser.join("+"));
      }
      if (b.paare) for (const [a, c] of b.paare) assert.equal(a + c, 10, `Seite ${i + 1}: ${a}+${c}`);
      if (b.perlen) assert.equal(b.perlen.reduce((x, y) => x + y, 0), 10, `Seite ${i + 1}: Perlen`);
    }
  });
  assert.deepEqual([...new Set(gesehen)], ["1+9", "2+8", "3+7", "4+6", "5+5"], "die Paare der Reihe nach");
  const f = g.seiten.findIndex((s) => s.frage);
  const frage = g.seiten[f].szene.find((b) => b.haeuser);
  const aufloesung = g.seiten[f + 1].szene.find((b) => b.haeuser);
  assert.equal(typeof frage.zu, "number", "auf der Frage-Seite ist ein Vorhang zu");
  assert.deepEqual(aufloesung.haeuser, frage.haeuser, "die nächste Seite zeigt dieselben Häuser offen");
  assert.equal(aufloesung.zu, undefined);
  const paare = g.seiten.flatMap((s) => s.szene ?? []).find((b) => b.paare)?.paare;
  assert.deepEqual(paare, [[1, 9], [2, 8], [3, 7], [4, 6], [5, 5]]);
  // Erzähler in der dritten Person, kein „X ist Y“ zwischen Zahlen (spielbau.md §8)
  for (const s of g.seiten) {
    assert.doesNotMatch(s.text, /\b(ich|wir|mein)\b/i, s.text);
    assert.doesNotMatch(s.text, /\b(eins|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn)\b[^.?!]*\b(ist|sind|macht|ergibt)\b[^.?!]*\bzehn\b/i, s.text);
  }
});
