import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const { waehleAnleitung, briefFormen } = await import("../spiele/tagesbrief/anleitung.js");
const { neuerStand } = await import("../spiele/lernsteuerung.js");
const { liesAnleitung } = await import("../spiele/rahmen/markdown.js");

const thema = (id, strang, voraussetzungen = []) => ({
  id, name: `Name ${id}`, sprich: `Sprich ${id}`, strang, voraussetzungen, aufgaben: { art: "zerlegung", zahl: 5 },
  stufen: ["kopf"], tempo: false, eltern: `Eltern ${id}`,
});
// Planreihenfolge: m1, l1, m2, l2, m3, l3, m4, l4
const PLAN = { themen: [
  thema("m1", "mathe"), thema("l1", "lesen"),
  thema("m2", "mathe", ["m1"]), thema("l2", "lesen", ["l1"]),
  thema("m3", "mathe", ["m2"]), thema("l3", "lesen", ["l2"]),
  thema("m4", "mathe", ["m3"]), thema("l4", "lesen"),
] };
const SPIELE = { spiele: [{ id: "s", arten: [{ art: "zerlegung", zahlen: [2, 10], stufen: ["kopf"] }] }] };
const eintrag = (fach, datei, extra = {}) => ({ fach, titel: `Titel ${datei}`, datei, formen: [{ situation: "tisch", name: "Tisch" }], ...extra });
// m2 und m4 teilen sich eine Familien-Anleitung
const verzeichnis = (extra = {}) => ({ themen: {
  m2: eintrag("mathe", "mathe/a.md"), l2: eintrag("lesen", "lesen/b.md"), m3: eintrag("mathe", "mathe/c.md"),
  l3: eintrag("lesen", "lesen/d.md"), m4: eintrag("mathe", "mathe/a.md"), l4: eintrag("lesen", "lesen/e.md"), ...extra,
} });
const ctxMit = (echteDinge = verzeichnis()) => ({ plan: PLAN, spiele: SPIELE, echteDinge });
const standDran = (...ids) => { const s = neuerStand(); for (const id of ids) s.themen[id] = { z: "dran", seit: "2026-11-01" }; return s; };
const HEUTE = "2026-11-17";

test("Standard: erstes Thema der Kandidaten aus alsNaechstes, passendZuGerade false, weitere ohne das gewählte", () => {
  const r = waehleAnleitung(ctxMit(), standDran("m1", "l1"), { heute: HEUTE });
  assert.equal(r.thema, "m2");
  assert.equal(r.datei, "mathe/a.md");
  assert.equal(r.passendZuGerade, false);
  assert.deepEqual(r.weitere, ["Name l2", "Name m3"]);
});

test("Entwurf wird nie gewählt", () => {
  const ctx = ctxMit(verzeichnis({ m2: eintrag("mathe", "mathe/a.md", { entwurf: true }) }));
  const r = waehleAnleitung(ctx, standDran("m1", "l1"), { heute: HEUTE });
  assert.notEqual(r.thema, "m2");
  assert.ok(!r.weitere.includes("Name m2"));
});

test("Keine Kandidaten aus alsNaechstes: ein Thema, das dran ist, mit Anleitung (passendZuGerade)", () => {
  const ctx = ctxMit({ themen: { m1: eintrag("mathe", "mathe/z.md") } });
  const r = waehleAnleitung(ctx, standDran("m1", "l1"), { heute: HEUTE });
  assert.deepEqual(r, { thema: "m1", datei: "mathe/z.md", passendZuGerade: true, weitere: [] });
});

test("Ohne jede Anleitung: null", () => {
  assert.equal(waehleAnleitung(ctxMit({ themen: {} }), standDran("m1", "l1"), { heute: HEUTE }), null);
});

test("Sperre: 13 Tage her gesperrt, 14 Tage her wieder erlaubt", () => {
  const stand = standDran("m1", "l1");
  // m2 und m4 haben dieselbe Datei: beide fallen weg
  const gesperrt13 = waehleAnleitung(ctxMit(), stand, { heute: HEUTE, gesperrt: { "mathe/a.md": "2026-11-04" } });
  assert.equal(gesperrt13.thema, "l2");
  assert.ok(!gesperrt13.weitere.includes("Name m4"));
  const gesperrt14 = waehleAnleitung(ctxMit(), stand, { heute: HEUTE, gesperrt: { "mathe/a.md": "2026-11-03" } });
  assert.equal(gesperrt14.thema, "m2");
});

test("Vorrang: folgt auf zuletztGeuebt (Voraussetzung) auch gegen früheres Thema im Plan", () => {
  const r = waehleAnleitung(ctxMit(), standDran("m1", "l1"), { heute: HEUTE, zuletztGeuebt: "l1" });
  assert.equal(r.thema, "l2"); // m2 steht früher, aber l2 hat l1 als Voraussetzung
});

test("Vorrang: nächstes Thema im selben Fach nach zuletztGeuebt", () => {
  const r = waehleAnleitung(ctxMit(), standDran("m1", "l1"), { heute: HEUTE, zuletztGeuebt: "l3" });
  assert.equal(r.thema, "l4"); // l4 ohne Voraussetzung, aber nächstes Lesen-Thema nach l3
});

test("Gleichstand: anderes Fach als letztesFach gewinnt", () => {
  const stand = standDran("m1", "l1");
  assert.equal(waehleAnleitung(ctxMit(), stand, { heute: HEUTE, letztesFach: "mathe" }).thema, "l2");
  assert.equal(waehleAnleitung(ctxMit(), stand, { heute: HEUTE, letztesFach: "lesen" }).thema, "m2");
});

test("Familien-Anleitung erscheint nur einmal (auch in weitere)", () => {
  const r = waehleAnleitung(ctxMit(), standDran("m1", "l1"), { heute: HEUTE, letztesFach: "lesen" });
  assert.equal(r.thema, "m2");
  assert.ok(!r.weitere.includes("Name m4"));
});

test("weitere: höchstens 2 Namen, nicht das gewählte Thema", () => {
  const r = waehleAnleitung(ctxMit(), standDran("m1", "l1"), { heute: HEUTE });
  assert.ok(r.weitere.length <= 2);
  assert.ok(!r.weitere.includes("Name " + r.thema));
});

test("Gleiche Eingabe, gleiche Ausgabe", () => {
  const args = [ctxMit(), standDran("m1", "l1"), { heute: HEUTE, zuletztGeuebt: "m1", letztesFach: "mathe" }];
  assert.deepEqual(waehleAnleitung(...args), waehleAnleitung(...args));
});

test("briefFormen: neunerreihe hat 2 Formen mit braucht, 4 Schritten, kern, ohne Leichter/Schwerer", () => {
  const text = readFileSync(new URL("../spiele/mit-echten-dingen/mathe/neunerreihe.md", import.meta.url), "utf8");
  const formen = briefFormen(liesAnleitung(text));
  assert.equal(formen.length, 2);
  assert.deepEqual(formen.map((f) => [f.situation, f.wort]), [["bewegung", "In Bewegung"], ["unterwegs", "Unterwegs"]]);
  for (const f of formen) {
    assert.ok(f.name);
    assert.ok(f.braucht && !f.braucht.startsWith("Ihr braucht"));
    assert.equal(f.schritte.length, 4);
    assert.ok(f.kern && !f.kern.includes("Darauf kommt es an") && !f.kern.includes("**"));
    assert.equal(f.verinnerlichen, "");
    assert.ok(!JSON.stringify(f).match(/Leichter|Schwerer/));
  }
  assert.equal(formen[0].braucht, "einen Hof oder langen Flur, vier Socken");
});

test("briefFormen: Zum Verinnerlichen wird übernommen", () => {
  const md = "# T\n\n## Am Tisch: Nudeln\n\nIhr braucht: Nudeln\n\n1. Eins\n2. Zwei\n\n**Darauf kommt es an:** Kern **fett**.\n\n**Zum Verinnerlichen:** Noch einmal legen.\n";
  const [f] = briefFormen(liesAnleitung(md));
  assert.equal(f.verinnerlichen, "Noch einmal legen.");
  assert.equal(f.kern, "Kern fett.");
  assert.deepEqual(f.schritte, ["Eins", "Zwei"]);
});
