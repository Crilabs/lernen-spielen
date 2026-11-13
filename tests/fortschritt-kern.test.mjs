import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { kategorieWert, sichtbareKategorien } from "../spiele/fortschritt/kern.js";

test("kategorieWert mittelt", () => {
  const w = kategorieWert([{ id: "a" }, { id: "b" }], { a: 0.5, b: 0.1 });
  assert.ok(Math.abs(w - 0.3) < 1e-9);
});

test("kategorieWert ignoriert Spiele ohne Wert", () => {
  const w = kategorieWert([{ id: "a" }, { id: "b" }], { a: 0.4 });
  assert.ok(Math.abs(w - 0.4) < 1e-9);
});

test("kategorieWert ohne Werte ist undefined", () => {
  assert.equal(kategorieWert([{ id: "a" }, { id: "b" }], {}), undefined);
});

test("sichtbareKategorien blendet leere aus", () => {
  const daten = JSON.parse(readFileSync(new URL("../spiele/spiele.json", import.meta.url), "utf8"));
  assert.deepEqual(sichtbareKategorien(daten).map((e) => e.kategorie.id), ["mathe", "grammatik", "schreiben"]);
});
