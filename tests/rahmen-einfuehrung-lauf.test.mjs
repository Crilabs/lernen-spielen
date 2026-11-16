import { test } from "node:test";
import assert from "node:assert/strict";
import { einfuehrungsLauf } from "../spiele/rahmen/einfuehrung-lauf.js";
import { lesezeit } from "../spiele/rahmen/lesezeit.js";

/** Lauf mit aufzeichnendem Timer. */
function lauf({ ton = false, text = "Timo bringt den Brief." } = {}) {
  const gewartet = /** @type {number[]} */ ([]);
  const stand = { phase: "" };
  const l = einfuehrungsLauf({
    ton: () => ton,
    text: () => text,
    stand,
    warte: async (ms) => void gewartet.push(ms),
  });
  return { l, gewartet, stand };
}

test("satz ohne Ton wartet die Lesezeit mit eigenem Timer", async () => {
  const { l, gewartet } = lauf({ ton: false });
  const gezeigt = [];
  await l.spiele(() => l.satz(async (o) => void gezeigt.push(o.zeigen)));
  assert.deepEqual(gezeigt, [true]);
  assert.deepEqual(gewartet, [lesezeit("Timo bringt den Brief.")]);
  assert.equal(lesezeit("Timo bringt den Brief."), 3100);
});

test("satz mit Ton wartet nicht zusätzlich", async () => {
  const { l, gewartet } = lauf({ ton: true });
  const gezeigt = [];
  await l.spiele(() => l.satz(async (o) => void gezeigt.push(o.zeigen)));
  assert.deepEqual(gewartet, []);
  assert.deepEqual(gezeigt, [false]);
});

test("Hilfe wiederholt den laufenden Satz", async () => {
  const { l } = lauf({ ton: true });
  let a = 0;
  const sagA = async () => void a++;
  assert.equal(l.hilfeGedrueckt(), false);
  await l.spiele(async () => {
    await l.satz(sagA);
    assert.equal(a, 1);
    assert.equal(l.hilfeGedrueckt(), true);
    assert.equal(a, 2);
  });
  assert.equal(l.hilfeGedrueckt(), false);
});

test("hilfe überschreibt die Hilfe des Schritts", async () => {
  const { l } = lauf({ ton: true });
  let h = 0;
  await l.spiele(async () => {
    await l.satz(async () => {});
    l.hilfe(() => void h++);
    assert.equal(l.hilfeGedrueckt(), true);
    assert.equal(h, 1);
  });
});

test("kind setzt den Zug, bis das Kind getippt hat", async () => {
  const { l } = lauf();
  const zug = { art: "tippen", von: "#t5" };
  let erfuellt = () => {};
  const p = new Promise((ok) => (erfuellt = ok));
  await l.spiele(async () => {
    const k = l.kind(zug, p);
    assert.deepEqual(l.zug, zug);
    erfuellt(undefined);
    await k;
    assert.equal(l.zug, null);
  });
});

test("spiele räumt auch bei Fehler ab und startet die Zeit nur nach Erfolg", async () => {
  const { l, stand } = lauf();
  const aufrufe = { gesehen: 0, zeit: 0 };
  const runde = { einfuehrungGesehen: () => aufrufe.gesehen++, beginneZeit: () => aufrufe.zeit++ };
  await assert.rejects(
    l.spiele(async () => {
      assert.equal(l.laeuft, true);
      await l.satz(async () => {});
      throw new Error("kaputt");
    }, runde),
  );
  assert.equal(l.laeuft, false);
  assert.equal(l.zug, null);
  assert.equal(l.hilfeGedrueckt(), false);
  assert.deepEqual(aufrufe, { gesehen: 0, zeit: 0 });

  let phase = "";
  await l.spiele(async () => void (phase = stand.phase), runde);
  assert.equal(phase, "einfuehrung");
  assert.deepEqual(aufrufe, { gesehen: 1, zeit: 1 });
  assert.equal(l.laeuft, false);
});
