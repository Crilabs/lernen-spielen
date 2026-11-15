// Geschichten (docs/geschichten.md): Format jeder spiele/geschichten/<id>/geschichte.json, die Bildelemente der
// Szenen (spiele/rahmen/szene.js) und die Lerngeschichte „Zehnerpaare“.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { pruefeTexte, inSaetze, satzGrenzeGeschichte, satzGrenzeBuch } from "../werkzeuge/spielbau/texte.mjs";

const { pruefeSzene, paarLage, hausSvg, artDes, ELEMENTE } = await import("../spiele/rahmen/szene.js");
const { laenge } = await import("../spiele/rahmen/perlen-geometrie.js");

const SPIELE = fileURLToPath(new URL("../spiele/", import.meta.url));
const ORDNER = join(SPIELE, "geschichten");
const beurteilung = JSON.parse(readFileSync(join(ORDNER, "beurteilung.json"), "utf8"));
const FAMILIEN = new Set(beurteilung.familien.map((f) => f.id));
const WELTEN = new Set(Object.keys(beurteilung.welten));
const KINDER = new Set(readdirSync(join(SPIELE, "runde", "kinder")).filter((d) => /^[a-z]+\.js$/.test(d) && !["schnitt.js", "stil.js"].includes(d)).map((d) => d.slice(0, -3)));
const HALTUNGEN = new Set([...readFileSync(join(SPIELE, "runde", "haltungen.js"), "utf8").matchAll(/id: "([a-z-]+)"/g)].map((m) => m[1]));
const ARTEN = new Set(["sachbuch", "sachgeschichte", "sinn", "form", "struktur"]);
/** Wörter einer Seite (wie texte.mjs). */
const woerterVon = (text) => text.split(/\s+/).filter((w) => /\p{L}|\d/u.test(w)).length;

/** Sachbuch (geschichten.md §2, §3): 5–7 Kapitel à 4–6 Seiten, je Seite 60–120 Wörter, Sätze ≤ satzGrenzeBuch. */
function pruefeSachbuch(g, ordner) {
  const f = [];
  if (!WELTEN.has(g.welt)) f.push(`welt „${g.welt}“ fehlt in beurteilung.json`);
  if (!Array.isArray(g.quellen) || !g.quellen.length || !g.quellen.every((q) => q?.fakt && q?.quelle)) f.push("Sachbuch ohne quellen (fakt, quelle)");
  if ("seiten" in g || !Array.isArray(g.kapitel)) f.push("Sachbuch: seiten oder kapitel – ein Sachbuch hat nur kapitel");
  const kapitel = Array.isArray(g.kapitel) ? g.kapitel : [];
  if (kapitel.length < 5 || kapitel.length > 7) f.push(`${kapitel.length} Kapitel (5–7)`);
  const texte = [];
  kapitel.forEach((k, ki) => {
    const wo = `Kapitel ${ki + 1}`;
    if (typeof k?.titel !== "string" || !k.titel.trim()) f.push(`${wo}: titel fehlt`);
    const seiten = Array.isArray(k?.seiten) ? k.seiten : [];
    if (seiten.length < 4 || seiten.length > 6) f.push(`${wo}: ${seiten.length} Seiten (4–6)`);
    const fragen = seiten.filter((s) => s?.frage === true).length;
    if (fragen > 1) f.push(`${wo}: ${fragen} Fragen (höchstens eine je Kapitel)`);
    if (seiten.at(-1)?.frage) f.push(`${wo}: Frage auf der letzten Seite (Auflösung fehlt)`);
    seiten.forEach((s, i) => {
      const ws = `${wo}, Seite ${i + 1}`;
      if (typeof s?.text !== "string" || !s.text.trim()) return void f.push(`${ws}: text fehlt`);
      const n = woerterVon(s.text);
      if (n < 60 || n > 120) f.push(`${ws}: ${n} Wörter (60–120)`);
      if (typeof s.bild !== "string" || !existsSync(join(ORDNER, ordner, s.bild))) f.push(`${ws}: Bild ${s.bild} fehlt`);
      texte.push(s.text);
      if (typeof s.sprich === "string") texte.push(s.sprich);
    });
  });
  const r = pruefeTexte(texte, { klasse: g.klasse, grenze: satzGrenzeBuch(g.klasse), budget: Infinity });
  f.push(...r.rot, ...r.hinweise.filter((h) => h.startsWith("§3 Satz")));
  return f;
}

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
  if (g.art === "sachbuch") return [...f, ...pruefeSachbuch(g, ordner)];
  if (g.art === "sachgeschichte") {
    if (!WELTEN.has(g.welt)) f.push(`welt „${g.welt}“ fehlt in beurteilung.json`);
    if (!Array.isArray(g.quellen) || !g.quellen.length || !g.quellen.every((q) => q?.fakt && q?.quelle)) f.push("Sachgeschichte ohne quellen (fakt, quelle)");
  } else if (!FAMILIEN.has(g.familie)) f.push(`familie „${g.familie}“ fehlt in beurteilung.json`);
  // Eine Fassung je Geschichte, keine Stufen (Christian 2026-11-15)
  if ("fassung" in g || "fassungVon" in g) f.push("fassung/fassungVon gibt es nicht mehr (eine Fassung je Geschichte)");
  const seiten = Array.isArray(g.seiten) ? g.seiten : [];
  // Vorlesebuch-Maß (Christian 2026-11-15)
  if (seiten.length < 10 || seiten.length > 14) f.push(`${seiten.length} Seiten (10–14)`);
  const fragen = seiten.filter((s) => s?.frage === true).length;
  if (fragen > 1) f.push(`${fragen} Fragen (höchstens eine)`);
  if (seiten.at(-1)?.frage) f.push("Frage auf der letzten Seite (Auflösung fehlt)");
  seiten.forEach((s, i) => {
    const wo = `Seite ${i + 1}`;
    if (typeof s?.text !== "string" || !s.text.trim()) return void f.push(`${wo}: text fehlt`);
    const n = inSaetze(s.text).length;
    if (n < 2 || n > 4) f.push(`${wo}: ${n} Sätze (2–4)`);
    if ("sprich" in s && typeof s.sprich !== "string") f.push(`${wo}: sprich ist kein Text`);
    const hatBild = typeof s.bild === "string", hatSzene = Array.isArray(s.szene);
    if (hatBild === hatSzene) f.push(`${wo}: genau eins von bild oder szene`);
    if (hatBild && !existsSync(join(ORDNER, ordner, s.bild))) f.push(`${wo}: Bild ${s.bild} fehlt`);
    if ("zaehlung" in s) {
      const z = s.zaehlung;
      if (!hatBild || !Array.isArray(z) || z.length !== 2 || !z.every((x) => Number.isInteger(x) && x >= 0)) f.push(`${wo}: zaehlung ist [links, rechts] an einem Foto`);
    }
    if ("verdeckt" in s && (![0, 1].includes(s.verdeckt) || !("zaehlung" in s))) f.push(`${wo}: verdeckt ist 0 oder 1 und braucht zaehlung`);
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
  const r = pruefeTexte(texte, { klasse: g.klasse, grenze: satzGrenzeGeschichte(g.klasse) });
  f.push(...r.rot, ...r.hinweise.filter((h) => h.startsWith("§3 Satz")));
  return f;
}

test("es gibt Geschichten", () => {
  assert.ok(geschichten.length >= 1);
});

test("index.json listet genau die Geschichten der Ordner mit Titel, Art, Welt und Familie", () => {
  const index = JSON.parse(readFileSync(join(ORDNER, "index.json"), "utf8"));
  const liste = index.geschichten;
  assert.equal("fassungen" in index, false, "keine Fassungen mehr");
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
  const seite = { text: "Ela legt die Perlen. Kofi schaut zu.", szene: [{ figur: "ela", x: 10 }] };
  const gut = { id: "probe", titel: "Probe", art: "struktur", familie: "zehnerpaare", klasse: 1, kulisse: "garten", seiten: Array(10).fill(seite) };
  assert.deepEqual(pruefeGeschichte(gut, "probe"), []);
  const f = (aenderung) => pruefeGeschichte({ ...gut, ...aenderung }, "probe").join(" | ");
  assert.match(f({ art: "roman" }), /art/);
  assert.match(f({ familie: "gibt-es-nicht" }), /familie/);
  const neun = Array(9).fill(seite);
  assert.match(f({ seiten: neun }), /9 Seiten/);
  assert.match(f({ seiten: Array(15).fill(seite) }), /15 Seiten/);
  assert.match(f({ seiten: [...Array(8).fill(seite), { ...seite, frage: true }, { ...seite, frage: true }] }), /2 Fragen/);
  assert.match(f({ seiten: [...neun, { ...seite, frage: true }] }), /letzten Seite/);
  assert.match(f({ seiten: [...neun, { text: "Ela legt.", szene: [] }] }), /1 Sätze/);
  assert.match(f({ seiten: [...neun, { text: "Ela legt. Kofi legt. Lena legt. Timo legt. Mia schaut.", szene: [] }] }), /5 Sätze/);
  assert.match(f({ seiten: [...neun, { text: "Ela und Kofi legen heute am Abend sehr viele bunte Perlen. Gut.", szene: [] }] }), /Wörtern/);
  assert.match(f({ seiten: [...neun, { text: "Ela legt. Kofi legt.", bild: "fehlt.webp" }] }), /fehlt/);
  assert.match(f({ seiten: [...neun, { text: "Ela legt. Kofi legt.", szene: [{ drache: 1 }] }] }), /unbekanntes Bildelement/);
  assert.match(f({ seiten: [...neun, { text: "Ela legt. Kofi legt.", szene: [{ figur: "mia" }] }] }), /Kind/);
  assert.match(f({ seiten: [...neun, { text: "Super, Ela. Kofi legt.", szene: [] }] }), /G1/);
  assert.match(f({ seiten: [...neun, { ...seite, zaehlung: [3, 7] }] }), /zaehlung/);
  assert.match(f({ seiten: [...neun, { ...seite, verdeckt: 1 }] }), /verdeckt/);
  assert.match(f({ fassung: "ruhig", fassungVon: "haustiere" }), /eine Fassung je Geschichte/);
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

test("Zehnerpaare: jedes gezählte Foto zeigt zehn Tiere, die Paare der Reihe nach, die Frage wird aufgelöst, am Ende alle fünf Paare", () => {
  const g = geschichten.find((x) => x.ordner === "zehnerpaare")?.g;
  assert.ok(g, "spiele/geschichten/zehnerpaare/geschichte.json fehlt");
  assert.equal(g.art, "struktur");
  assert.equal(g.familie, "zehnerpaare");
  assert.ok(g.klasse <= 2 && satzGrenzeGeschichte(g.klasse) === 10);
  assert.ok(Array.isArray(g.quellen) && g.quellen.length, "das Tierwissen braucht quellen");
  const gesehen = [];
  g.seiten.forEach((s, i) => {
    if (s.zaehlung) {
      assert.equal(s.zaehlung[0] + s.zaehlung[1], 10, `Seite ${i + 1}: ${s.zaehlung} sind nicht zehn`);
      if (s.verdeckt === undefined) gesehen.push(s.zaehlung.join("+"));
    }
    for (const b of s.szene ?? []) if (b.paare) for (const [a, c] of b.paare) assert.equal(a + c, 10, `Seite ${i + 1}: ${a}+${c}`);
  });
  assert.deepEqual([...new Set(gesehen)], ["1+9", "2+8", "3+7", "4+6", "5+5"], "die Paare der Reihe nach");
  const f = g.seiten.findIndex((s) => s.frage);
  assert.ok(f > 0 && [0, 1].includes(g.seiten[f].verdeckt), "auf der Frage-Seite ist eine Seite verdeckt");
  assert.deepEqual(g.seiten[f + 1].zaehlung, g.seiten[f].zaehlung, "die nächste Seite zeigt dasselbe Paar");
  assert.equal(g.seiten[f + 1].verdeckt, undefined, "aufgelöst: nichts mehr verdeckt");
  const letzte = g.seiten.at(-1);
  assert.deepEqual(letzte.szene?.find((b) => b.paare)?.paare, [[1, 9], [2, 8], [3, 7], [4, 6], [5, 5]], "Schluss gezeichnet: alle fünf Paare");
  // Erzähler in der dritten Person, kein „X ist Y“ zwischen Zahlen (spielbau.md §8)
  for (const s of g.seiten) {
    assert.doesNotMatch(s.text, /\b(ich|wir|mein)\b/i, s.text);
    assert.doesNotMatch(s.text, /\b(eins|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn)\b[^.?!]*\b(ist|sind|macht|ergibt)\b[^.?!]*\bzehn\b/i, s.text);
  }
});

// Kulissen (Christian 2026-11-15: „nicht wie ein Buch“, statt des lila Standardhintergrunds je Geschichte eine Kulisse)
const KULISSEN_ORDNER = join(SPIELE, "rahmen", "kulissen");
const kulissenListe = () => JSON.parse(readFileSync(join(KULISSEN_ORDNER, "kulissen.json"), "utf8")).kulissen;

test("Kulissen: die sechs ersten gibt es, jede als SVG ohne Schrift, höchstens 60 KB, mit Grund- und Tieffarbe", () => {
  const liste = kulissenListe();
  assert.deepEqual(liste.map((k) => k.id).sort(), ["dschungel", "garten", "im-haus", "stadt", "strand", "wasser"]);
  for (const k of liste) {
    assert.ok(k.name && /^#[0-9A-F]{6}$/i.test(k.grund) && /^#[0-9A-F]{6}$/i.test(k.tief), `${k.id}: name, grund, tief`);
    const datei = join(KULISSEN_ORDNER, `${k.id}.svg`);
    assert.ok(existsSync(datei), `${k.id}.svg fehlt`);
    const svg = readFileSync(datei, "utf8");
    assert.ok(svg.length <= 60_000, `${k.id}.svg zu groß (${svg.length})`);
    assert.match(svg, /^<svg [^>]*viewBox="0 0 1920 1080"/, `${k.id}: viewBox 1920 × 1080`);
    assert.doesNotMatch(svg, /<text|<script|<image|href="http/i, `${k.id}: keine Schrift, kein Skript, keine fremden Bilder`);
  }
});

test("Kulissen: jede Geschichte wählt eine bekannte Kulisse", () => {
  const ids = new Set(kulissenListe().map((k) => k.id));
  for (const { ordner, g } of geschichten) assert.ok(ids.has(g.kulisse), `${ordner}: kulisse „${g.kulisse}“ unbekannt`);
});

// Sachbuch mit Kapiteln (Christian 2026-11-15: Inhalt zuerst, Kapitel, ~25 Seiten, Vorlesebuch)
test("pruefeGeschichte findet Verstöße (Sachbuch)", () => {
  const satz = "Eine Katze sieht in der Dämmerung viel mehr als wir Menschen.";   // 11 Wörter
  const text = Array(7).fill(satz).join(" ");                                 // 77 Wörter
  const seite = { text, bild: "../haustiere/bilder/01.webp" };
  const kapitel = (n = 4) => ({ titel: "Augen", seiten: Array(n).fill(seite) });
  const gut = { id: "probe", titel: "Probe", art: "sachbuch", welt: "haustiere", familie: null, klasse: 1, kulisse: "im-haus",
    quellen: [{ fakt: "Katzen sehen in der Dämmerung gut.", quelle: "https://example.org, abgerufen 2026-11-15" }],
    kapitel: Array(5).fill(0).map(() => kapitel()) };
  assert.deepEqual(pruefeGeschichte(gut, "probe"), []);
  const f = (aenderung) => pruefeGeschichte({ ...gut, ...aenderung }, "probe").join(" | ");
  assert.match(f({ kapitel: Array(4).fill(0).map(() => kapitel()) }), /4 Kapitel/);
  assert.match(f({ kapitel: Array(8).fill(0).map(() => kapitel()) }), /8 Kapitel/);
  assert.match(f({ kapitel: [...Array(4).fill(0).map(() => kapitel()), kapitel(3)] }), /Kapitel 5: 3 Seiten/);
  assert.match(f({ kapitel: [...Array(4).fill(0).map(() => kapitel()), kapitel(7)] }), /Kapitel 5: 7 Seiten/);
  const kurz = { ...seite, text: Array(4).fill(satz).join(" ") };   // 44 Wörter
  assert.match(f({ kapitel: [...Array(4).fill(0).map(() => kapitel()), { titel: "K", seiten: [kurz, seite, seite, seite] }] }), /44 Wörter/);
  const lang = { ...seite, text: `${text} Eine Katze schleicht ganz leise und vorsichtig durch das hohe nasse Gras am Rand vom Garten.` };
  assert.match(f({ kapitel: [...Array(4).fill(0).map(() => kapitel()), { titel: "K", seiten: [lang, seite, seite, seite] }] }), /Wörtern/);
  const frage = { ...seite, frage: true };
  assert.match(f({ kapitel: [...Array(4).fill(0).map(() => kapitel()), { titel: "K", seiten: [frage, frage, seite, seite] }] }), /Kapitel 5: 2 Fragen/);
  assert.match(f({ kapitel: [...Array(4).fill(0).map(() => kapitel()), { titel: "K", seiten: [seite, seite, seite, frage] }] }), /Kapitel 5: Frage auf der letzten Seite/);
  assert.match(f({ kapitel: [...Array(4).fill(0).map(() => kapitel()), { titel: "", seiten: Array(4).fill(seite) }] }), /Kapitel 5: titel/);
  assert.match(f({ kapitel: [...Array(4).fill(0).map(() => kapitel()), { titel: "K", seiten: [{ ...seite, bild: "fehlt.webp" }, seite, seite, seite] }] }), /fehlt/);
  assert.match(f({ quellen: [] }), /quellen/);
  assert.match(f({ seiten: [seite] }), /seiten oder kapitel/);
});
