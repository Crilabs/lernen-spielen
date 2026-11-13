import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

const daten = new Map();
function setzeSessionStorage() {
  daten.clear();
  globalThis.sessionStorage = {
    getItem: (k) => (daten.has(k) ? daten.get(k) : null),
    setItem: (k, v) => daten.set(k, String(v)),
    removeItem: (k) => daten.delete(k),
  };
}

let n = 0;
const frisch = () => import(`../spiele/kern/sitzung.js?n=${++n}`);

beforeEach(setzeSessionStorage);

test("merkeGesagt, dann schonGesagt ist true", async () => {
  const S = await frisch();
  assert.equal(S.schonGesagt("Hilfe"), false);
  S.merkeGesagt("Hilfe");
  assert.equal(S.schonGesagt("Hilfe"), true);
});

test("fremder Name ist false", async () => {
  const S = await frisch();
  S.merkeGesagt("Hilfe");
  assert.equal(S.schonGesagt("Ton an"), false);
});

test("liegt in sessionStorage und überlebt ein neues Modul", async () => {
  const S = await frisch();
  S.merkeGesagt("Weiter");
  assert.deepEqual(JSON.parse(daten.get("ls-gesagt")), ["Weiter"]);
  const T = await frisch();
  assert.equal(T.schonGesagt("Weiter"), true);
});

test("ohne sessionStorage per Speicher", async () => {
  delete globalThis.sessionStorage;
  const S = await frisch();
  assert.equal(S.schonGesagt("Hilfe"), false);
  S.merkeGesagt("Hilfe");
  assert.equal(S.schonGesagt("Hilfe"), true);
  assert.equal(S.schonGesagt("Ton aus"), false);
});

test("werfender sessionStorage bricht nichts", async () => {
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    get() {
      throw new Error("gesperrt");
    },
  });
  const S = await frisch();
  S.merkeGesagt("Hilfe");
  assert.equal(S.schonGesagt("Hilfe"), true);
  delete globalThis.sessionStorage;
});
