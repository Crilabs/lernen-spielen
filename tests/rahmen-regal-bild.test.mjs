// Regal-Bild eines Spiels (spiele.json `regal: { objekt, wert }`): Lernsteuerung findet es je Thema, materialFuer
// nimmt es nach den Lernzeichen (Perlenstab, Wortart, Graphem-Karte) und vor der Fach-Karte, bausteinHtml baut ein
// stilles ls-objekt. Fixture: tests/daten/spiele-regal.json.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const { regalBildFuer, gekonnteThemen, themaMaterial, markiereGekonnt, neuerStand } = await import("../spiele/lernsteuerung.js");
const { materialFuer, bausteinHtml, regalBildVon } = await import("../spiele/rahmen/material.js");

const SPIELE = JSON.parse(readFileSync(new URL("./daten/spiele-regal.json", import.meta.url), "utf8"));
const thema = (id, aufgaben, extra = {}) => ({ id, name: `Die ${aufgaben?.zahl ?? ""} zerlegen`, sprich: "", strang: "mathe",
  voraussetzungen: [], aufgaben, stufen: ["kopf"], tempo: false, eltern: "", ...extra });
const PLAN = { themen: [
  thema("z3", { art: "zerlegung", zahl: 3 }),   // nur zwei-tonnen
  thema("z7", { art: "zerlegung", zahl: 7 }),   // zwei-tonnen und spaeter: das erste in spiele.json gewinnt
  thema("z8", { art: "zerlegung", zahl: 8 }),   // ohne-bild steht vorn, nennt aber kein Bild
  thema("z9", { art: "zerlegung", zahl: 9 }),   // auch kaputt (leerer Name zählt nicht)
  thema("z12", { art: "zerlegung", zahl: 12 }), // zwei-tonnen (kein Perlenstab über 10)
  thema("z14", { art: "zerlegung", zahl: 14 }), // nur spaeter
  thema("z20", { art: "zerlegung", zahl: 20 }), // kein Spiel
] };
const CTX = { plan: PLAN, spiele: SPIELE };

test("regalBildFuer: erstes Spiel, das das Thema bedient und ein Bild nennt", () => {
  assert.deepEqual(regalBildFuer(CTX, "z3"), { objekt: "papiertonne", wert: "zahl" });
  assert.deepEqual(regalBildFuer(CTX, "z7"), { objekt: "papiertonne", wert: "zahl" });
  assert.deepEqual(regalBildFuer(CTX, "z8"), { objekt: "papiertonne", wert: "zahl" });
  assert.deepEqual(regalBildFuer(CTX, "z9"), { objekt: "papiertonne", wert: "zahl" });
  assert.deepEqual(regalBildFuer(CTX, "z14"), { objekt: "wertstofftonne", wert: "zahl" });
  assert.deepEqual(regalBildFuer(CTX, "z12"), { objekt: "papiertonne", wert: "zahl" });
  assert.equal(regalBildFuer(CTX, "z20"), null);
  assert.equal(regalBildFuer({ plan: PLAN, spiele: { spiele: [] } }, "z3"), null);
});

test("unbekannter wert (auch das frühere „buchstabe“) wird null", () => {
  for (const wert of ["farbe", "buchstabe"]) {
    const ctx = { plan: PLAN, spiele: { spiele: [{ id: "x", regal: { objekt: "papiertonne", wert },
      arten: [{ art: "zerlegung", zahlen: [3, 3], stufen: ["kopf"] }] }] } };
    assert.deepEqual(regalBildFuer(ctx, "z3"), { objekt: "papiertonne", wert: null });
  }
});

test("Reihenfolge: Lernzeichen vor dem Regal-Bild, das Regal-Bild vor der Fach-Karte", () => {
  const stand = neuerStand();
  for (const id of ["z3", "z12", "z20"]) markiereGekonnt(stand, id, "2026-11-12");
  const [z3, z12, z20] = gekonnteThemen(CTX, stand);
  assert.deepEqual(z3.regal, { objekt: "papiertonne", wert: "zahl" });
  assert.deepEqual(materialFuer(z3), { baustein: "perlenstab", wert: 3 });                    // Lernzeichen zuerst
  assert.deepEqual(materialFuer(z12), { baustein: "objekt", art: "papiertonne", wert: "12" }); // dann das Bild
  assert.deepEqual(materialFuer(z20), { baustein: "karte", wert: "", fach: "mathe" });         // sonst die Karte
  assert.deepEqual(materialFuer(/** @type {any} */ (themaMaterial(CTX, "z14"))), { baustein: "objekt", art: "wertstofftonne", wert: "14" });
  const regal = { objekt: "papiertonne", wert: "zahl" };
  // Wortart und Graphem gehen ebenfalls vor: keine Tonne mit „Mm“.
  assert.deepEqual(materialFuer({ id: "namenwoerter", name: "Nomen", strang: "grammatik", regal }), { baustein: "wortart", wert: "nomen" });
  assert.deepEqual(materialFuer({ id: "m", name: "M und m", strang: "lesen", bereich: "Buchstaben und Laute", regal }), { baustein: "karte", wert: "Mm" });
  assert.deepEqual(materialFuer({ id: "s", name: "Das Subjekt", strang: "grammatik", bereich: "Satzglieder", regal: { objekt: "korb", wert: null } }),
    { baustein: "objekt", art: "korb", wert: "" });
});

test("regalBildVon: Zahl, ohne Wert, ungültiger Name", () => {
  const t = (extra) => ({ id: "x", name: "Ein Thema", strang: "mathe", zahl: null, ...extra });
  assert.deepEqual(regalBildVon(t({ regal: { objekt: "papiertonne", wert: "zahl" } })), { baustein: "objekt", art: "papiertonne", wert: "" });
  assert.deepEqual(regalBildVon(t({ zahl: 0, regal: { objekt: "korb", wert: "zahl" } })), { baustein: "objekt", art: "korb", wert: "0" });
  assert.deepEqual(regalBildVon(t({ zahl: 7, regal: { objekt: "korb", wert: null } })), { baustein: "objekt", art: "korb", wert: "" });
  assert.deepEqual(regalBildVon(t({ name: "M und m", regal: { objekt: "korb", wert: "buchstabe" } })), { baustein: "objekt", art: "korb", wert: "" });
  assert.equal(regalBildVon(t({ regal: { objekt: "../boese", wert: null } })), null);
  assert.equal(regalBildVon(t({ regal: null })), null);
  assert.equal(regalBildVon(t({})), null);
});

test("jedes Regal-Bild in spiele.json liegt im gemeinsamen Bestand (spiele/objekte/<art>.js)", () => {
  const echt = JSON.parse(readFileSync(new URL("../spiele/spiele.json", import.meta.url), "utf8"));
  for (const s of [...echt.spiele, ...SPIELE.spiele]) {
    if (!s.regal?.objekt) continue;
    assert.ok(existsSync(new URL(`../spiele/objekte/${s.regal.objekt}.js`, import.meta.url)),
      `${s.id}: spiele/objekte/${s.regal.objekt}.js fehlt (sonst bleibt im Regal nur eine leere Stelle)`);
  }
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
