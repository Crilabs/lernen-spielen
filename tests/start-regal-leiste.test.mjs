// Regal als Seitenleiste (spiele/start/regal-leiste.js): Fach → Thema → Detail, nicht grafisch (Spec Karten §3.2).
import { test } from "node:test";
import assert from "node:assert/strict";

const { regalBaum, regalHtml } = await import("../spiele/start/regal-leiste.js");

const KAT = [{ id: "mathe", name: "Mathe" }, { id: "grammatik", name: "Grammatik" }];
const CTX = {
  plan: { themen: [{ id: "z2", eltern: "Gabeln teilen" }, { id: "z3", eltern: "" }, { id: "nomen", eltern: "" }] },
  spiele: { kategorien: KAT, spiele: [{ id: "a", titel: "Zwei Tonnen", datei: "a.html" }, { id: "b", titel: "Wörter", datei: "b.html" }] },
};
const GEKONNT = [
  { id: "z3", name: "Die 3 zerlegen", strang: "mathe", art: "zerlegung", zahl: 3, seit: "2026-11-02", bereich: "" },
  { id: "nomen", name: "Nomen erkennen", strang: "grammatik", art: null, zahl: null, seit: "2026-11-03", bereich: "Wortarten" },
  { id: "z2", name: "Die 2 zerlegen", strang: "mathe", art: "zerlegung", zahl: 2, seit: "2026-11-05", bereich: "" },
];
const spieleFuer = (_ctx, id) => (id === "nomen" ? ["b"] : ["a"]);

test("regalBaum: Fächer in Kategorien-Reihenfolge, Themen in der Reihenfolge des Gekonnt-Werdens, mit Spielen und Anleitung", () => {
  const baum = regalBaum(GEKONNT, CTX, spieleFuer);
  assert.deepEqual(baum.map((f) => f.fach), ["mathe", "grammatik"]);
  assert.deepEqual(baum[0].themen.map((t) => t.id), ["z3", "z2"]);
  assert.equal(baum[0].name, "Mathe");
  assert.deepEqual(baum[0].themen[1].spiele, [{ id: "a", titel: "Zwei Tonnen", datei: "a.html" }]);
  assert.equal(baum[0].themen[1].eltern, true);
  assert.equal(baum[0].themen[0].eltern, false);
});

test("regalHtml: aufklappbare Ebenen (details), Themenname mit Material, Detail mit Nochmal-Spielen und Mit echten Dingen", () => {
  const h = regalHtml(regalBaum(GEKONNT, CTX, spieleFuer));
  assert.match(h, /^<section class="regal-leiste" aria-label="Was ich kann"><h2>Was ich kann<\/h2>/);
  assert.equal((h.match(/<details class="fach"/g) ?? []).length, 2);
  assert.equal((h.match(/<details class="thema" data-thema="/g) ?? []).length, 3);
  assert.match(h, /<summary><span class="material"><ls-perlenstab wert="2"[^>]*><\/ls-perlenstab><\/span><span class="name">Die 2 zerlegen<\/span><\/summary>/);
  assert.match(h, /<a class="nochmal" href="a\.html\?thema=z2">Zwei Tonnen<\/a>/);
  assert.match(h, /<button class="echt" type="button" data-thema="z2">Mit echten Dingen<\/button>/);
  assert.doesNotMatch(h, /2026-|seit/);
});

test("regalHtml: leer → Satz des Erzählers", () => {
  assert.match(regalHtml([]), /<p class="leer">Hier steht, was du kannst\.<\/p>/);
});
