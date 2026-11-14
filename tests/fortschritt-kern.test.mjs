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

test("kategorieWert ignoriert Spiele mit arten (Lernsteuerung statt Balken)", () => {
  const w = kategorieWert([{ id: "a", arten: [{ art: "zerlegung" }] }, { id: "b" }], { a: 1, b: 0.2 });
  assert.ok(Math.abs(w - 0.2) < 1e-9);
  assert.equal(kategorieWert([{ id: "a", arten: [] }], { a: 0.5 }), undefined);
});

test("sichtbareKategorien blendet leere aus", () => {
  const daten = { kategorien: [{ id: "mathe" }, { id: "lesen" }, { id: "schreiben" }], spiele: [{ id: "a", kategorie: "schreiben" }, { id: "b", kategorie: "mathe" }] };
  assert.deepEqual(sichtbareKategorien(daten).map((e) => e.kategorie.id), ["mathe", "schreiben"]);
  assert.deepEqual(sichtbareKategorien({ kategorien: [{ id: "mathe" }], spiele: [] }), []);
});

test("fortschritt-Kennzeichen passt zu den Modulen", async () => {
  const { readdirSync } = await import("node:fs");
  const daten = JSON.parse(readFileSync(new URL("../spiele/spiele.json", import.meta.url), "utf8"));
  const module = readdirSync(new URL("../spiele/fortschritt/", import.meta.url))
    .filter((f) => f.endsWith(".js") && !["kern.js", "laden.js"].includes(f))
    .map((f) => f.slice(0, -3))
    .sort();
  const markiert = daten.spiele.filter((s) => s.fortschritt === true).map((s) => s.id).sort();
  assert.deepEqual(markiert, module);
  for (const s of daten.spiele) assert.ok(s.fortschritt === undefined || s.fortschritt === true, s.id);
});

test("wertVon lädt ohne Kennzeichen nichts und protokolliert nichts", async () => {
  const speicher = new Map();
  globalThis.localStorage = { getItem: (k) => speicher.get(k) ?? null, setItem: (k, v) => speicher.set(k, String(v)) };
  let abrufe = 0;
  const altFetch = globalThis.fetch;
  globalThis.fetch = async () => { abrufe++; throw new Error("kein Netz"); };
  try {
    const { wertVon } = await import("../spiele/fortschritt/laden.js");
    assert.equal(await wertVon({ id: "zahlenzauber" }), undefined);
    assert.equal(abrufe, 0);
    assert.equal(speicher.get("protokoll"), undefined);
  } finally {
    globalThis.fetch = altFetch;
  }
});
