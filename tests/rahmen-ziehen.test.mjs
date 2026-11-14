import { test } from "node:test";
import assert from "node:assert/strict";
import { RUHE, schritt } from "../spiele/rahmen/ziehen-zustand.js";

/** Spielt Ereignisse nacheinander ab; gibt den letzten Zustand und alle Folgen zurück. */
function spiele(...ereignisse) {
  let zustand = RUHE;
  const folgen = [];
  for (const e of ereignisse) {
    const r = schritt(zustand, e);
    zustand = r.zustand;
    folgen.push(...r.folgen);
  }
  return { zustand, folgen };
}

test("antippen hebt an, Ziel antippen legt ab", () => {
  const { zustand, folgen } = spiele({ art: "tippe-teil", teil: "a" }, { art: "tippe-ziel", ziel: "x" });
  assert.deepEqual(zustand, RUHE);
  assert.deepEqual(folgen, [
    { art: "hebe", teil: "a" },
    { art: "senke", teil: "a" },
    { art: "ablegen", teil: "a", ziel: "x" },
  ]);
});

test("zweites Antippen desselben Teils legt es zurück", () => {
  const { zustand, folgen } = spiele({ art: "tippe-teil", teil: "a" }, { art: "tippe-teil", teil: "a" });
  assert.deepEqual(zustand, RUHE);
  assert.deepEqual(folgen, [
    { art: "hebe", teil: "a" },
    { art: "senke", teil: "a" },
  ]);
});

test("ein anderes Teil antippen wechselt die Auswahl", () => {
  const { zustand, folgen } = spiele({ art: "tippe-teil", teil: "a" }, { art: "tippe-teil", teil: "b" });
  assert.deepEqual(zustand, { phase: "angehoben", teil: "b" });
  assert.deepEqual(folgen, [
    { art: "hebe", teil: "a" },
    { art: "senke", teil: "a" },
    { art: "hebe", teil: "b" },
  ]);
});

test("Ziel antippen ohne angehobenes Teil tut nichts", () => {
  assert.deepEqual(spiele({ art: "tippe-ziel", ziel: "x" }), { zustand: RUHE, folgen: [] });
});

test("ziehen auf ein Ziel legt ab", () => {
  const { zustand, folgen } = spiele({ art: "ziehe", teil: "a" }, { art: "loslassen", ziel: "x" });
  assert.deepEqual(zustand, RUHE);
  assert.deepEqual(folgen, [
    { art: "greife", teil: "a" },
    { art: "ablegen", teil: "a", ziel: "x" },
  ]);
});

test("ziehen ohne Ziel bringt das Teil zurück", () => {
  const { folgen } = spiele({ art: "ziehe", teil: "a" }, { art: "loslassen", ziel: null });
  assert.deepEqual(folgen.at(-1), { art: "zurueck", teil: "a" });
});

test("ein angehobenes Teil ziehen: Auswahl endet, Ziehen beginnt", () => {
  const { zustand, folgen } = spiele({ art: "tippe-teil", teil: "a" }, { art: "ziehe", teil: "a" });
  assert.deepEqual(zustand, { phase: "ziehen", teil: "a" });
  assert.deepEqual(folgen, [
    { art: "hebe", teil: "a" },
    { art: "senke", teil: "a" },
    { art: "greife", teil: "a" },
  ]);
});

test("ein anderes Teil ziehen, während eins angehoben ist", () => {
  const { zustand, folgen } = spiele({ art: "tippe-teil", teil: "a" }, { art: "ziehe", teil: "b" });
  assert.deepEqual(zustand, { phase: "ziehen", teil: "b" });
  assert.deepEqual(folgen.slice(1), [
    { art: "senke", teil: "a" },
    { art: "greife", teil: "b" },
  ]);
});

test("während des Ziehens zählen Tippen nicht", () => {
  const start = spiele({ art: "ziehe", teil: "a" }).zustand;
  for (const e of [
    { art: "tippe-teil", teil: "b" },
    { art: "tippe-ziel", ziel: "x" },
    { art: "ziehe", teil: "b" },
  ]) {
    assert.deepEqual(schritt(start, e), { zustand: start, folgen: [] });
  }
});

test("abbrechen: angehoben → senken, ziehen → zurück, Ruhe → nichts", () => {
  assert.deepEqual(spiele({ art: "tippe-teil", teil: "a" }, { art: "abbrechen" }).folgen.at(-1), { art: "senke", teil: "a" });
  assert.deepEqual(spiele({ art: "ziehe", teil: "a" }, { art: "abbrechen" }).folgen.at(-1), { art: "zurueck", teil: "a" });
  assert.deepEqual(spiele({ art: "abbrechen" }), { zustand: RUHE, folgen: [] });
});

test("loslassen ohne Ziehen tut nichts", () => {
  assert.deepEqual(spiele({ art: "loslassen", ziel: "x" }), { zustand: RUHE, folgen: [] });
});
