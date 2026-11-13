import { test } from "node:test";
import assert from "node:assert/strict";

const { fortschritt, ALLE } = await import("../spiele/fortschritt/zahlenzauber.js");

test("Gesamtmenge: Plus und Minus bis 20 (a<b), 90 + 180", () => {
  assert.equal(ALLE.length, 270);
  assert.equal(new Set(ALLE).size, 270);
  assert.ok(ALLE.includes("3+9") && ALLE.includes("12-3") && ALLE.includes("12-9"));
  assert.ok(!ALLE.includes("9+3") && !ALLE.includes("12-12"));
});

test("ohne Stand oder mit fremdem Stand 0, kein Wurf", async () => {
  for (const s of [null, undefined, {}, { fakten: null }, { fakten: [] }, { fakten: "x" }, 5, { fakten: { "3+9": null } }]) {
    assert.equal((await fortschritt(s)).wert, 0);
  }
});

test("alter Stand ohne g zählt (Fach >= 4), Fach 3 nicht", async () => {
  const r = await fortschritt({ fakten: { "3+9": { f: 4, t: "", h: [] }, "4+5": { f: 3, t: "", h: [] } } });
  assert.equal(r.wert, 1 / 270);
});

test("g=1 nach Rückstufung zählt, Aufgaben ausserhalb der Menge nicht", async () => {
  const r = await fortschritt({ fakten: {
    "3+9": { f: 0, t: "", h: [], g: 1 },
    "12-3": { f: 4, t: "", h: [] },
    "40+50": { f: 4, t: "", h: [] },        // Zahlenraum 100: nicht Teil der Menge
    "9+3": { f: 4, t: "", h: [] } } });
  assert.equal(r.wert, 2 / 270);
  assert.equal(r.text, "2 von 270 Aufgaben bis 20 sicher");
});
