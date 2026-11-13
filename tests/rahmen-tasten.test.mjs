import { test } from "node:test";
import assert from "node:assert/strict";
import { tastenFuer, reihen } from "../spiele/rahmen/tasten.js";

test("tastenFuer: jede Taste einmal, ohne Leerzeichen, Satzzeichen am Ende", () => {
  const t = tastenFuer("Die Katze schläft.");
  assert.equal(new Set(t).size, t.length);
  assert.ok(!t.includes(" "));
  assert.equal(t.at(-1), ".");
});

test("tastenFuer: Reihenfolge a ä c D e f h i K l s t z .", () => {
  assert.deepEqual(tastenFuer("Die Katze schläft."), ["a", "ä", "c", "D", "e", "f", "h", "i", "K", "l", "s", "t", "z", "."]);
});

test("tastenFuer: Ziffern 1 bis 9, dann 0", () => {
  assert.deepEqual(tastenFuer("3120"), ["1", "2", "3", "0"]);
});

test("tastenFuer: Groß vor Klein bei gleichem Buchstaben", () => {
  assert.deepEqual(tastenFuer("Ää"), ["Ä", "ä"]);
  assert.deepEqual(tastenFuer("aA"), ["A", "a"]);
});

test("tastenFuer: leer", () => {
  assert.deepEqual(tastenFuer(""), []);
  assert.deepEqual(tastenFuer("   "), []);
});

test("reihen teilt 23 Tasten in 10/10/3", () => {
  const t = Array.from({ length: 23 }, (_, i) => String(i));
  assert.deepEqual(reihen(t).map((r) => r.length), [10, 10, 3]);
  assert.deepEqual(reihen(t, 8).map((r) => r.length), [8, 8, 7]);
  assert.deepEqual(reihen([]), []);
});
