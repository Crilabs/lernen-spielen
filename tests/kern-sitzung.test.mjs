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

test("vergissGesagt nimmt den Namen zurück, auch aus sessionStorage", async () => {
  const S = await frisch();
  S.merkeGesagt("Hilfe");
  S.merkeGesagt("Weiter");
  S.vergissGesagt("Hilfe");
  assert.equal(S.schonGesagt("Hilfe"), false);
  assert.deepEqual(JSON.parse(daten.get("ls-gesagt")), ["Weiter"]);
});

test("sageEinmal: zu Ende gesprochen gilt als gesagt, danach still", async () => {
  const S = await frisch();
  const gesagt = [];
  const sprich = async (t) => (gesagt.push(t), "gesprochen");
  assert.equal(await S.sageEinmal("Hilfe", sprich), "gesprochen");
  assert.equal(await S.sageEinmal("Hilfe", sprich), null);
  assert.deepEqual(gesagt, ["Hilfe"]);
  assert.equal(S.schonGesagt("Hilfe"), true);
});

test("sageEinmal: abgebrochen (Inhalt hat Vorrang) gilt nicht als gesagt", async () => {
  const S = await frisch();
  let schonWaehrend = false;
  const sprich = async () => {
    schonWaehrend = S.schonGesagt("Hilfe"); // während des Sprechens schon gemerkt: kein Doppeltes
    return "abgebrochen";
  };
  assert.equal(await S.sageEinmal("Hilfe", sprich), "abgebrochen");
  assert.equal(schonWaehrend, true);
  assert.equal(S.schonGesagt("Hilfe"), false);
  assert.equal(await S.sageEinmal("Hilfe", async () => "gesprochen"), "gesprochen");
  assert.equal(S.schonGesagt("Hilfe"), true);
});

test("sageEinmal: leerer Name sagt nichts", async () => {
  const S = await frisch();
  let aufgerufen = false;
  assert.equal(await S.sageEinmal("", async () => ((aufgerufen = true), "gesprochen")), null);
  assert.equal(aufgerufen, false);
});
