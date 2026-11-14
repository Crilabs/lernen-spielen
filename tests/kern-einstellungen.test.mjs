import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

const speicher = new Map();
globalThis.localStorage = {
  getItem: (k) => (speicher.has(k) ? speicher.get(k) : null),
  setItem: (k, v) => speicher.set(k, String(v)),
  removeItem: (k) => speicher.delete(k),
};
globalThis.window = {};

let n = 0;
async function frisch() {
  n += 1;
  const S = await import("../spiele/kern/speicher.js");
  const E = await import(`../spiele/kern/einstellungen.js?n=${n}`);
  return { S, E };
}

beforeEach(() => speicher.clear());

test("Standardwerte ohne Speicher", async () => {
  const { E } = await frisch();
  await E.ladeEinstellungen();
  assert.equal(E.einstellung("ton.wimmelbild", true), true);
  assert.equal(E.einstellung("stimme", ""), "");
});

test("stimme liegt am Gerät, ton im Profil", async () => {
  const { S, E } = await frisch();
  await E.ladeEinstellungen();
  E.setzeEinstellung("stimme", "system");
  E.setzeEinstellung("ton.x", false);
  await S.sofortSpeichern();
  assert.equal(JSON.parse(speicher.get("lernstand-geraet")).stimme, "system");
  assert.equal(JSON.parse(speicher.get("lernstand-kind-1-einstellungen"))["ton.x"], false);
});

test("setzeEinstellung bleibt nach Neuladen", async () => {
  const a = await frisch();
  await a.E.ladeEinstellungen();
  a.E.setzeEinstellung("ton.wimmelbild", false);
  await a.S.sofortSpeichern();
  const b = await frisch();
  await b.E.ladeEinstellungen();
  assert.equal(b.E.einstellung("ton.wimmelbild", true), false);
});

test("alte localStorage-Werte werden nicht übernommen", async () => {
  speicher.set("wimmelbild-ton", "aus");
  const { E } = await frisch();
  await E.ladeEinstellungen();
  assert.equal(E.einstellung("ton.wimmelbild", true), true);
});

test("ladeEinstellungen ist idempotent: zweiter Aufruf überschreibt nichts", async () => {
  const { S, E } = await frisch();
  await E.ladeEinstellungen();
  E.setzeEinstellung("ton.x", false);
  await E.ladeEinstellungen();
  assert.equal(E.einstellung("ton.x", true), false);
  await S.sofortSpeichern();
});

test("geschichten: Standard sanft, am Profil, unbekannte Werte zählen als sanft", async () => {
  const { S, E } = await frisch();
  await E.ladeEinstellungen();
  assert.equal(E.geschichtenStufe(), "sanft");
  E.setzeEinstellung("geschichten", "ruhig");
  assert.equal(E.geschichtenStufe(), "ruhig");
  await S.sofortSpeichern();
  assert.equal(JSON.parse(speicher.get("lernstand-kind-1-einstellungen")).geschichten, "ruhig");
  E.setzeEinstellung("geschichten", "gruselig");
  assert.equal(E.geschichtenStufe(), "sanft");
  assert.deepEqual([...E.GESCHICHTEN], ["ruhig", "sanft", "abenteuer"]);
});
