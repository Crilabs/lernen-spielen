import { test } from "node:test";
import assert from "node:assert/strict";

const { pinHash, pinPruefen, pruefeUpdate } = await import("../spiele/eltern.js");

test("pinHash ist stabil", async () => {
  const a = await pinHash("1234");
  assert.equal(a, await pinHash("1234"));
  assert.match(a, /^[0-9a-f]{64}$/);
  assert.notEqual(a, await pinHash("1235"));
});

test("pinPruefen", async () => {
  const h = await pinHash("1234");
  assert.equal(await pinPruefen("1234", h), true);
  assert.equal(await pinPruefen("0000", h), false);
  assert.equal(await pinPruefen("1234", undefined), false);
});

test("pruefeUpdate meldet offline", async () => {
  const r = await pruefeUpdate(async () => { throw new Error("error sending request"); });
  assert.deepEqual(r, { status: "offline" });
});

test("pruefeUpdate meldet aktuell", async () => {
  assert.deepEqual(await pruefeUpdate(async () => null), { status: "aktuell" });
});

test("pruefeUpdate meldet neu", async () => {
  const update = { version: "0.2.0", body: "Neu: Dinge" };
  const r = await pruefeUpdate(async () => update);
  assert.deepEqual(r, { status: "neu", version: "0.2.0", notiz: "Neu: Dinge", update });
});

test("pruefeUpdate ohne App", async () => {
  assert.deepEqual(await pruefeUpdate(undefined), { status: "kein-app" });
});

test("pruefeUpdate hängt nicht (Zeitlimit)", async () => {
  const r = await pruefeUpdate(() => new Promise(() => {}), 20);
  assert.deepEqual(r, { status: "offline" });
});
