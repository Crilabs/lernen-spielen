// Stift im Schreibfeld (spiele/schrift/stift.js, Christian 2026-11-22): nur Stift (und Maus am Computer) schreiben.
import { test } from "node:test";
import assert from "node:assert/strict";
import { zaehltAlsStift } from "../spiele/schrift/stift.js";

test("Stift und Maus schreiben", () => {
  assert.equal(zaehltAlsStift(/** @type {any} */ ({ pointerType: "pen" })), true);
  assert.equal(zaehltAlsStift(/** @type {any} */ ({ pointerType: "mouse" })), true);
});

test("Finger und aufliegende Hand schreiben nicht", () => {
  assert.equal(zaehltAlsStift(/** @type {any} */ ({ pointerType: "touch" })), false);
  assert.equal(zaehltAlsStift(/** @type {any} */ ({ pointerType: "" })), false);
});
