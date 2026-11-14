// Regal-Bild eines Spiels (spiele.json `regal: { objekt, wert }`): Lernsteuerung findet es je Thema, materialFuer
// zieht es allem anderen vor, bausteinHtml baut ein stilles ls-objekt. Fixture: tests/daten/spiele-regal.json.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const { regalBildFuer, gekonnteThemen, themaMaterial, markiereGekonnt, neuerStand } = await import("../spiele/lernsteuerung.js");
const { materialFuer, bausteinHtml, regalBildVon } = await import("../spiele/rahmen/material.js");

const SPIELE = JSON.parse(readFileSync(new URL("./daten/spiele-regal.json", import.meta.url), "utf8"));
const thema = (id, aufgaben, extra = {}) => ({ id, name: `Die ${aufgaben?.zahl ?? ""} zerlegen`, sprich: "", strang: "mathe",
  voraussetzungen: [], aufgaben, stufen: ["kopf"], tempo: false, eltern: "", ...extra });
const PLAN = { themen: [
  thema("z3", { art: "zerlegung", zahl: 3 }),   // nur zwei-tonnen
  thema("z7", { art: "zerlegung", zahl: 7 }),   // zwei-tonnen und spaeter: das erste in spiele.json gewinnt
  thema("z8", { art: "zerlegung", zahl: 8 }),   // ohne-bild und spaeter: nur spaeter nennt ein Bild
  thema("z9", { art: "zerlegung", zahl: 9 }),   // spaeter und kaputt (leerer Name zählt nicht)
  thema("z12", { art: "zerlegung", zahl: 12 }), // kein Spiel
] };
const CTX = { plan: PLAN, spiele: SPIELE };

test("regalBildFuer: erstes Spiel, das das Thema bedient und ein Bild nennt", () => {
  assert.deepEqual(regalBildFuer(CTX, "z3"), { objekt: "papiertonne", wert: "zahl" });
  assert.deepEqual(regalBildFuer(CTX, "z7"), { objekt: "papiertonne", wert: "zahl" });
  assert.deepEqual(regalBildFuer(CTX, "z8"), { objekt: "wertstofftonne", wert: "zahl" });
  assert.deepEqual(regalBildFuer(CTX, "z9"), { objekt: "wertstofftonne", wert: "zahl" });
  assert.equal(regalBildFuer(CTX, "z12"), null);
  assert.equal(regalBildFuer({ plan: PLAN, spiele: { spiele: [] } }, "z3"), null);
});

test("unbekannter wert wird null", () => {
  const ctx = { plan: PLAN, spiele: { spiele: [{ id: "x", regal: { objekt: "papiertonne", wert: "farbe" },
    arten: [{ art: "zerlegung", zahlen: [3, 3], stufen: ["kopf"] }] }] } };
  assert.deepEqual(regalBildFuer(ctx, "z3"), { objekt: "papiertonne", wert: null });
});

test("gekonnteThemen und themaMaterial tragen das Regal-Bild, materialFuer zieht es dem Perlenstab vor", () => {
  const stand = neuerStand();
  markiereGekonnt(stand, "z7", "2026-11-12");
  markiereGekonnt(stand, "z12", "2026-11-12");
  const [z7, z12] = gekonnteThemen(CTX, stand);
  assert.deepEqual(materialFuer(z7), { baustein: "objekt", art: "papiertonne", wert: "7" });
  assert.deepEqual(materialFuer(z12), { baustein: "karte", wert: "", fach: "mathe" }); // 12: kein Perlenstab, kein Spiel
  assert.deepEqual(materialFuer(/** @type {any} */ (themaMaterial(CTX, "z8"))), { baustein: "objekt", art: "wertstofftonne", wert: "8" });
});

test("regalBildVon: Zahl, Buchstabe, ohne Wert, ungültiger Name", () => {
  const t = (extra) => ({ id: "x", name: "M und m", strang: "lesen", zahl: null, ...extra });
  assert.deepEqual(regalBildVon(t({ regal: { objekt: "papiertonne", wert: "buchstabe" } })), { baustein: "objekt", art: "papiertonne", wert: "Mm" });
  assert.deepEqual(regalBildVon(t({ regal: { objekt: "papiertonne", wert: "zahl" } })), { baustein: "objekt", art: "papiertonne", wert: "" });
  assert.deepEqual(regalBildVon(t({ zahl: 0, regal: { objekt: "korb", wert: "zahl" } })), { baustein: "objekt", art: "korb", wert: "0" });
  assert.deepEqual(regalBildVon(t({ regal: { objekt: "korb", wert: null } })), { baustein: "objekt", art: "korb", wert: "" });
  assert.equal(regalBildVon(t({ regal: { objekt: "../boese", wert: null } })), null);
  assert.equal(regalBildVon(t({ regal: null })), null);
  assert.equal(regalBildVon(t({})), null);
});

test("bausteinHtml: stilles ls-objekt mit Wert, aria-hidden", () => {
  assert.equal(bausteinHtml({ baustein: "objekt", art: "papiertonne", wert: "7" }),
    '<ls-objekt art="papiertonne" wert="7" still aria-hidden="true"></ls-objekt>');
  assert.equal(bausteinHtml({ baustein: "objekt", art: "korb", wert: "" }), '<ls-objekt art="korb" still aria-hidden="true"></ls-objekt>');
  assert.equal(bausteinHtml({ baustein: "objekt", art: "korb", wert: '"<' }), '<ls-objekt art="korb" wert="&quot;&lt;" still aria-hidden="true"></ls-objekt>');
  assert.match(bausteinHtml({ baustein: "objekt", art: 'x" onload="', wert: "" }), /^<span class="karte symbol"/);
});

test("Seiten mit bausteinHtml laden den Objekt-Baustein und geben ihm eine Höhe", () => {
  for (const seite of ["regal.html", "index.html", "themen.html"]) {
    const html = readFileSync(new URL(`../spiele/${seite}`, import.meta.url), "utf8");
    assert.match(html, /import "\.\/objekte\/objekt\.js";/, seite);
    assert.match(html, /ls-objekt \{ height: [\d.]+rem; \}/, seite);
  }
});
