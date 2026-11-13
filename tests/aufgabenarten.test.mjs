import { test } from "node:test";
import assert from "node:assert/strict";

const { aufgabenVon, klasseRechnen, poolRechnen, schwierigkeit, darstellbar, ZIEL_MS } =
  await import("../spiele/aufgabenarten.js");

const sd = (key) => schwierigkeit(aufgabenVon({ art: "rechnen", thema: klasseRechnen(key) }).find((a) => a.key === key));

test("zerlegung: geordnete Paare der 7", () => {
  assert.deepEqual(aufgabenVon({ art: "zerlegung", zahl: 7 }).map(a => a.key),
    ["zerl:7:1+6","zerl:7:2+5","zerl:7:3+4","zerl:7:4+3","zerl:7:5+2","zerl:7:6+1"]);
});
test("klasseRechnen: Beispiele je Thema", () => {
  const f = klasseRechnen;
  assert.equal(f("plus:3+4"), "rechnen-7");     assert.equal(f("minus:7-4"), "rechnen-7");
  assert.equal(f("plus:3+10"), "zehn-plus");    assert.equal(f("plus:2+13"), "plus-ohne-20");
  assert.equal(f("plus:9+11"), "plus-zur-20");  assert.equal(f("plus:8+9"), "ueber-10-mit-9");
  assert.equal(f("plus:5+6"), "ueber-10-mit-7");assert.equal(f("minus:13-10"), "minus-zehner");
  assert.equal(f("minus:13-3"), "minus-zehner");assert.equal(f("minus:16-2"), "minus-ohne-20");
  assert.equal(f("minus:20-7"), "minus-von-20");assert.equal(f("minus:13-4"), "minus-ueber-10-bis-5");
  assert.equal(f("minus:13-6"), "minus-ueber-10-ab-6");
  assert.equal(f("plus:12+14"), "plus-bis-30"); assert.equal(f("minus:75-31"), "minus-bis-100");
});
test("rechnen: Pool bis 100 vollständig und überschneidungsfrei aufgeteilt", () => {
  const ids = [...new Set(poolRechnen().map(klasseRechnen))];
  const alle = ids.flatMap(t => aufgabenVon({ art: "rechnen", thema: t }).map(a => a.key));
  assert.equal(new Set(alle).size, alle.length);
  assert.deepEqual(new Set(alle), new Set(poolRechnen()));
  assert.ok(!alle.includes("plus:3+3"));
  assert.ok(!alle.includes("plus:38+25"));
});
test("rechnen: daten und Raum stimmen", () => {
  const a = aufgabenVon({ art: "rechnen", thema: "minus-bis-100" }).find(x => x.key === "minus:75-31");
  assert.deepEqual(a.daten, { op: "minus", a: 44, b: 31, c: 75, raum: 100 });
  assert.equal(aufgabenVon({ art: "rechnen", thema: "rechnen-7" })[0].daten.raum, 10);
});
test("menge und zwillinge: Schlüssel und daten", () => {
  assert.deepEqual(aufgabenVon({ art: "menge", bis: 3 }).map(a => a.key), ["menge:1", "menge:2", "menge:3"]);
  assert.deepEqual(aufgabenVon({ art: "menge", bis: 2 })[1].daten, { n: 2 });
  const z = aufgabenVon({ art: "zwillinge" });
  assert.deepEqual(z.map(a => a.key), ["plus:6+6", "plus:7+7", "plus:8+8", "plus:9+9"]);
  assert.deepEqual(z[0].daten, { op: "plus", a: 6, b: 6, c: 12, raum: 20 });
});
test("darstellbar: Zahlenzauber kann keine Zwillinge, Perlenbrücke nur 2–10", () => {
  const zz = { art: "rechnen", max: 100, gleiche: false };
  assert.equal(darstellbar(aufgabenVon({ art: "zwillinge" })[0], zz), false);
  assert.equal(darstellbar(aufgabenVon({ art: "zwillinge" })[0], { ...zz, gleiche: true }), true);
  assert.equal(darstellbar(aufgabenVon({ art: "rechnen", thema: "rechnen-7" })[0], zz), true);
  const pb = { art: "zerlegung", zahlen: [2, 10] };
  assert.equal(darstellbar(aufgabenVon({ art: "zerlegung", zahl: 7 })[0], pb), true);
  assert.equal(darstellbar(aufgabenVon({ art: "zerlegung", zahl: 12 })[0], pb), false);
  assert.equal(darstellbar(aufgabenVon({ art: "menge", bis: 3 })[0], pb), false);
  assert.equal(darstellbar(aufgabenVon({ art: "rechnen", thema: "plus-bis-100" })[0], { art: "rechnen", max: 20 }), false);
});
test("schwierigkeit: 3+4 schwerer als 1+6", () => {
  const k = (key) => schwierigkeit(aufgabenVon({ art: "zerlegung", zahl: 7 }).find(a => a.key === key));
  assert.ok(k("zerl:7:3+4") > k("zerl:7:1+6"));
});
test("schwierigkeit: Übertrag macht Plus und Minus schwerer", () => {
  assert.ok(sd("plus:8+9") > sd("plus:2+13"));        // 13 gegen 2, aber Übertrag +5
  assert.equal(sd("plus:8+9"), 8 + 5);
  assert.equal(sd("plus:2+13"), 2);
  assert.equal(sd("minus:13-6"), 6 + 5);
  assert.equal(sd("minus:16-2"), 2);
  assert.equal(schwierigkeit(aufgabenVon({ art: "menge", bis: 4 })[3]), 4);
});
test("ZIEL_MS: Zielzeiten", () => {
  assert.equal(ZIEL_MS.zerlegung, 8000);
  assert.equal(ZIEL_MS.menge, 4000);
  assert.deepEqual([10, 20, 30, 100].map(ZIEL_MS.rechnen), [12000, 16000, 20000, 30000]);
});

test("aufgabenVon: null und undefined (geplantes Thema) ergeben keine Aufgaben", () => {
  assert.deepEqual(aufgabenVon(null), []);
  assert.deepEqual(aufgabenVon(undefined), []);
});
