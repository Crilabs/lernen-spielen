import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

let abrufe = 0;
globalThis.fetch = /** @type {any} */ (
  async (url) => {
    abrufe += 1;
    const text = await readFile(fileURLToPath(url), "utf8");
    return { ok: true, text: async () => text, json: async () => JSON.parse(text) };
  }
);

let n = 0;
const frisch = () => import(`../spiele/kern/vorlagen.js?n=${++n}`);

test("form liefert Striche als Punktfolgen, Start = Pfadanfang", async () => {
  const V = await frisch();
  await V.ladeVorlagen();
  const f = V.form("ziffern", "1");
  assert.equal(f.striche.length, 1);
  assert.deepEqual(f.striche[0][0], { x: 30, y: 50 });
  assert.deepEqual(f.striche[0].at(-1), { x: 70, y: 200 });
  assert.deepEqual(f.luft, [false]);
  assert.equal(f.breite, 100);
  assert.deepEqual(f.band, ["mitte", "oben"]);
  assert.equal(V.raster().grund, 200);
});

test("hatSatz: nur Sätze mit Formen; kein Ersatz für VA", async () => {
  const V = await frisch();
  await V.ladeVorlagen();
  assert.equal(V.hatSatz("ziffern"), true);
  assert.equal(V.hatSatz("va"), false);
  assert.equal(V.hatSatz("unbekannt"), false);
  assert.throws(() => V.form("va", "a"), /Fehlende Form: va\/a/);
});

test("fehlende Form wirft mit Satz und Zeichen", async () => {
  const V = await frisch();
  await V.ladeVorlagen();
  assert.throws(() => V.form("sas", "Q"), /Fehlende Form: sas\/Q/);
});

test("formen(satz) listet alle Formen des Satzes", async () => {
  const V = await frisch();
  await V.ladeVorlagen();
  assert.ok(V.formen("ziffern").some((f) => f.zeichen === "1"));
  assert.deepEqual(V.formen("va"), []);
});

test("formen(satz) in der Reihenfolge von liste.json, unabhängig von der Ladezeit", async () => {
  const echt = globalThis.fetch;
  // Spätere Dateien kommen zuerst an
  globalThis.fetch = async (url) => {
    const m = String(url).match(/ziffern\/(\d)\.svg$/);
    if (m) await new Promise((r) => setTimeout(r, 30 - Number(m[1]) * 3));
    return echt(url);
  };
  try {
    const V = await frisch();
    await V.ladeVorlagen();
    const liste = JSON.parse(await readFile(new URL("../spiele/schrift/vorlagen/liste.json", import.meta.url), "utf8"));
    const erwartet = liste.formen.filter((f) => f.satz === "ziffern").map((f) => f.zeichen);
    assert.deepEqual(V.formen("ziffern").map((f) => f.zeichen), erwartet);
  } finally {
    globalThis.fetch = echt;
  }
});

test("zweimal laden ruft nur einmal ab", async () => {
  const V = await frisch();
  await V.ladeVorlagen();
  const nachEinmal = abrufe;
  await V.ladeVorlagen();
  assert.equal(abrufe, nachEinmal);
});

test("vor dem Laden wirft form", async () => {
  const V = await frisch();
  assert.throws(() => V.form("ziffern", "1"), /nicht geladen/);
});
