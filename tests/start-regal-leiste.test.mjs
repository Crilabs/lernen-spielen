// Regal-Daten und -Darstellung (spiele/start/regal-leiste.js): Fach → Bereich → Thema (Lernplan), „Zuletzt gelernt“
// auf der Startseite, Reiter und Bretter der Regal-Seite. Ohne Zahl, ohne Datum.
import { test } from "node:test";
import assert from "node:assert/strict";

const { regalBaum, zuletztHtml, reiterHtml, bretterHtml } = await import("../spiele/start/regal-leiste.js");

const KAT = [{ id: "mathe", name: "Mathe" }, { id: "grammatik", name: "Grammatik" }];
const CTX = {
  plan: { themen: [
    { id: "z2", bereich: "Zahlzerlegung", eltern: "Gabeln teilen" }, { id: "plus3", bereich: "Plus und Minus bis 10", eltern: "" },
    { id: "z3", bereich: "Zahlzerlegung", eltern: "" }, { id: "nomen", bereich: "Wortarten", eltern: "" },
  ] },
  spiele: { kategorien: KAT, spiele: [{ id: "a", titel: "Zwei Tonnen", datei: "a.html" }, { id: "b", titel: "Wörter", datei: "b.html" }] },
};
const g = (id, strang, name, extra = {}) => ({ id, name, strang, art: "zerlegung", zahl: Number(id.replace(/\D/g, "")) || null, seit: "", bereich: "", ...extra });
const GEKONNT = [
  g("plus3", "mathe", "Plus bis 3", { art: null, zahl: null }),
  g("z3", "mathe", "Die 3 zerlegen", { seit: "2026-11-02" }),
  g("nomen", "grammatik", "Nomen erkennen", { art: null, zahl: null, bereich: "Wortarten" }),
  g("z2", "mathe", "Die 2 zerlegen", { seit: "2026-11-05" }),
];
const spieleFuer = (_ctx, id) => (id === "nomen" ? ["b"] : ["a"]);

test("regalBaum: Fach → Bereich → Thema, das Neueste oben (Bereich mit dem jüngsten Thema zuerst, darin neueste zuerst)", () => {
  const baum = regalBaum(GEKONNT, CTX, spieleFuer);
  assert.deepEqual(baum.map((f) => f.fach), ["mathe", "grammatik"]);
  // gekonnt in der Reihenfolge plus3, z3, nomen, z2 → Zahlzerlegung (z2 jüngstes) vor Plus und Minus bis 10
  assert.deepEqual(baum[0].bereiche.map((b) => b.name), ["Zahlzerlegung", "Plus und Minus bis 10"]);
  assert.deepEqual(baum[0].bereiche[0].themen.map((t) => t.id), ["z2", "z3"]);
  assert.deepEqual(baum[0].bereiche[0].themen[0].spiele, [{ id: "a", titel: "Zwei Tonnen", datei: "a.html" }]);
  assert.equal(baum[0].bereiche[0].themen[0].eltern, true);
});

test("regalBaum: ein Bereich mit frisch Gekonntem rückt nach oben", () => {
  const baum = regalBaum([...GEKONNT, g("plus4", "mathe", "Plus bis 4", { art: null, zahl: null })],
    { ...CTX, plan: { themen: [...CTX.plan.themen, { id: "plus4", bereich: "Plus und Minus bis 10" }] } }, spieleFuer);
  assert.deepEqual(baum[0].bereiche.map((b) => b.name), ["Plus und Minus bis 10", "Zahlzerlegung"]);
  assert.deepEqual(baum[0].bereiche[0].themen.map((t) => t.id), ["plus4", "plus3"]);
});

test("zuletztHtml: die letzten fünf, neueste zuerst, Name und Material, jedes führt ins Regal an sein Thema; Knopf Mein Regal; ohne Datum", () => {
  const viele = [...Array(7)].map((_, i) => g(`z${i + 2}`, "mathe", `Die ${i + 2} zerlegen`));
  const h = zuletztHtml(viele);
  assert.match(h, /^<section class="zuletzt" aria-label="Zuletzt gelernt"><h2>Zuletzt gelernt<\/h2>/);
  const namen = [...h.matchAll(/<span class="name">([^<]+)<\/span>/g)].map((m) => m[1]);
  assert.deepEqual(namen, ["Die 8 zerlegen", "Die 7 zerlegen", "Die 6 zerlegen", "Die 5 zerlegen", "Die 4 zerlegen"]);
  assert.match(h, /<a class="ding" href="regal\.html\?thema=z8" data-thema="z8"><span class="material"><ls-perlenstab wert="8"/);
  assert.match(h, /<a class="regal-knopf" href="regal\.html"><img src="symbole\/regal\.svg" alt=""><b>Mein Regal<\/b><\/a><\/section>$/);
  assert.doesNotMatch(h, /2026-/);
});

test("zuletztHtml: leer → Satz und trotzdem der Knopf", () => {
  const h = zuletztHtml([]);
  assert.match(h, /<p class="leer">Hier steht, was du kannst\.<\/p>/);
  assert.match(h, /class="regal-knopf"/);
});

test("reiterHtml: ein Reiter je Fach mit Gekonntem, der aktive trägt aria-selected", () => {
  const h = reiterHtml(regalBaum(GEKONNT, CTX, spieleFuer), "grammatik");
  assert.match(h, /^<div class="reiter" role="tablist" aria-label="Fächer">/);
  assert.match(h, /<button class="reiter-knopf" type="button" role="tab" data-fach="mathe" aria-selected="false"[^>]*>/);
  assert.match(h, /data-fach="grammatik" aria-selected="true"/);
});

test("bretterHtml: je Bereich ein Brett (Gruppe mit Bereichsname), Themen als Knöpfe mit Name, Neues markiert", () => {
  const mathe = regalBaum(GEKONNT, CTX, spieleFuer)[0];
  const h = bretterHtml(mathe, new Set(["z2"]));
  assert.equal((h.match(/<section class="brett" role="group" aria-label="/g) ?? []).length, 2);
  assert.match(h, /aria-label="Zahlzerlegung"><h3>Zahlzerlegung<\/h3>/);
  assert.match(h, /<button class="ding neu" type="button" data-thema="z2"><span class="material">/);
  assert.match(h, /<button class="ding" type="button" data-thema="z3">/);
  assert.match(h, /<span class="name">Die 2 zerlegen<\/span>/);
});
