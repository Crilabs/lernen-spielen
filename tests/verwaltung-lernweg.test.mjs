import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { abdeckung, baueLernweg, kette } from "../werkzeuge/verwaltung/seite/lernweg.js";

const t = (id, voraussetzungen = [], extra = {}) => ({ id, name: id.toUpperCase(), strang: "mathe", klasse: 1, bereich: "B", voraussetzungen, ...extra });
const spalte = (lw, id) => lw.knoten.find((n) => n.id === id)?.ebene;
const pfeile = (lw) => lw.kanten.map((k) => `${k.von}>${k.nach}`).sort();

test("Spalten folgen der längsten Kette", () => {
  const lw = baueLernweg([t("a"), t("b", ["a"]), t("c", ["b"]), t("d", ["a"])], "mathe");
  assert.deepEqual(["a", "b", "c", "d"].map((id) => spalte(lw, id)), [0, 1, 2, 1]);
});

test("überzählige Pfeile fallen weg, die Kette bleibt", () => {
  const lw = baueLernweg([t("a"), t("b", ["a"]), t("c", ["a", "b"])], "mathe");
  assert.deepEqual(pfeile(lw), ["a>b", "b>c"]);
  assert.deepEqual([...kette(lw, "c").knoten].sort(), ["a", "b", "c"]);
});

test("jede Klasse beginnt rechts vom Band der vorigen", () => {
  const lw = baueLernweg([t("a"), t("b", ["a"]), t("c", [], { klasse: 2 }), t("d", ["c"], { klasse: 2 })], "mathe");
  assert.equal(spalte(lw, "c"), 2);
  assert.equal(spalte(lw, "d"), 3);
  assert.deepEqual(lw.baender.map((b) => b.klasse), [1, 2]);
  assert.ok(lw.baender[1].x > lw.baender[0].x);
});

test("Voraussetzung aus einem anderen Fach wird ein Stummel direkt vor dem Ziel", () => {
  const lw = baueLernweg([t("l", [], { strang: "lesen" }), t("a"), t("b", ["a", "l"])], "mathe");
  const st = lw.knoten.find((n) => n.id === "l");
  assert.equal(st?.stummel, "fach");
  assert.equal(st?.ebene, spalte(lw, "b") - 1);
  assert.ok(pfeile(lw).includes("l>b"));
});

test("Stummel vor einem Thema der ersten Spalte schiebt alles um eine Spalte", () => {
  const lw = baueLernweg([t("l", [], { strang: "lesen" }), t("a", ["l"])], "mathe");
  assert.equal(spalte(lw, "l"), 0);
  assert.equal(spalte(lw, "a"), 1);
  assert.ok(lw.baender[0].x > 0);
});

test("Klassenfilter: Voraussetzungen aus früheren Klassen werden Stummel", () => {
  const lw = baueLernweg([t("a"), t("b", ["a"], { klasse: 2 })], "mathe", "2");
  assert.equal(lw.knoten.find((n) => n.id === "a")?.stummel, "klasse");
  assert.equal(lw.knoten.filter((n) => !n.stummel).length, 1);
});

test("Kette: Vorgänger und Nachfolger, nicht die Geschwister", () => {
  const lw = baueLernweg([t("a"), t("b", ["a"]), t("c", ["b"]), t("x", ["a"])], "mathe");
  const k = kette(lw, "b");
  assert.deepEqual([...k.knoten].sort(), ["a", "b", "c"]);
  assert.deepEqual([...k.kanten].sort(), ["a>b", "b>c"]);
});

test("Abdeckung: Spiel vor Echten Dingen, beauftragt gestrichelt", () => {
  const spiele = { M01: { status: "probe" }, M02: { status: "beauftragt" }, M03: { status: "geplant" } };
  assert.deepEqual(abdeckung({ spiele: ["M03", "M01"], echteDinge: "fehlt" }, spiele), { art: "spiel", inArbeit: false });
  assert.deepEqual(abdeckung({ spiele: ["M03"], echteDinge: "fertig" }, spiele), { art: "echte", inArbeit: false });
  assert.deepEqual(abdeckung({ spiele: ["M02"], echteDinge: "fertig" }, spiele), { art: "echte", inArbeit: true });
  assert.deepEqual(abdeckung({ spiele: [], echteDinge: "entwurf" }, spiele), { art: "fehlt", inArbeit: true });
  assert.deepEqual(abdeckung({ spiele: [], echteDinge: "fehlt" }, spiele), { art: "fehlt", inArbeit: false });
});

test("echter Lernplan: jedes Fach und jede Klasse baut ohne Überlappung", () => {
  const plan = JSON.parse(readFileSync(new URL("../spiele/lernplan.json", import.meta.url), "utf8"));
  const faecher = [...new Set(plan.themen.map((x) => x.strang))];
  for (const fach of faecher) for (const klasse of ["", "1", "2", "3", "4"]) {
    const lw = baueLernweg(plan.themen, fach, klasse);
    const soll = plan.themen.filter((x) => x.strang === fach && (!klasse || String(x.klasse) === klasse)).length;
    assert.equal(lw.knoten.filter((n) => !n.stummel).length, soll, `${fach} ${klasse}`);
    const ids = new Set(lw.knoten.map((n) => n.id));
    for (const k of lw.kanten) assert.ok(ids.has(k.von) && ids.has(k.nach), `${fach}: Pfeil ${k.von}>${k.nach}`);
    for (const k of lw.kanten) assert.ok(spalte(lw, k.von) < spalte(lw, k.nach), `${fach}: Pfeil ${k.von}>${k.nach} läuft nach rechts`);
    const plaetze = new Set(lw.knoten.map((n) => `${n.ebene}/${n.y}`));
    assert.equal(plaetze.size, lw.knoten.length, `${fach} ${klasse}: Kästchen überlappen`);
    assert.ok(Number.isFinite(lw.breite) && Number.isFinite(lw.hoehe));
  }
});
