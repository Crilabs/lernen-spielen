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

// spielbau.md §8: „Nur ein Tipp des Kindes kürzt ab, nie die Einstellung.“
test("abkuerzen beendet die Lesezeit sofort", async () => {
  const stand = { phase: "" };
  let gewartet = 0;
  const l = einfuehrungsLauf({
    ton: () => false,
    text: () => "Timo bringt den Brief.",
    stand,
    warte: () => {
      gewartet++;
      return new Promise(() => {}); // endet nie von selbst
    },
  });
  let fertig = false;
  await l.spiele(async () => {
    const s = l.satz(async () => {}).then(() => (fertig = true));
    await new Promise((ok) => setTimeout(ok, 0));
    assert.equal(gewartet, 1);
    assert.equal(fertig, false);
    l.abkuerzen();
    await s;
    assert.equal(fertig, true);
  });
});

test("abkuerzen ohne laufende Lesezeit tut nichts", async () => {
  const { l, gewartet } = lauf({ ton: true });
  l.abkuerzen();
  let n = 0;
  await l.spiele(async () => {
    l.abkuerzen();
    await l.satz(async () => void n++);
    l.abkuerzen();
  });
  l.abkuerzen();
  assert.equal(n, 1);
  assert.deepEqual(gewartet, []);
});

test("hilfe mit bis überlebt satz-Aufrufe bis zum Ende", async () => {
  const { l } = lauf({ ton: true });
  let h = 0;
  let b = 0;
  const sagB = async () => void b++;
  let getan = () => {};
  const bis = new Promise((ok) => (getan = ok));
  await l.spiele(async () => {
    await l.satz(async () => {});
    l.hilfe(() => void h++, { bis });
    await l.satz(sagB);
    assert.equal(b, 1);
    assert.equal(l.hilfeGedrueckt(), true);
    assert.equal(h, 1, "die gehaltene Hilfe gilt noch");
    assert.equal(b, 1);
    getan(undefined);
    await bis;
    await Promise.resolve();
    assert.equal(l.hilfeGedrueckt(), true);
    assert.equal(h, 1, "danach nicht mehr");
    assert.equal(b, 2, "danach wiederholt sie den laufenden Satz");
  });
});

test("hilfe mit bis endet auch, wenn bis abgelehnt wird; spiele beginnt ohne Hilfe", async () => {
  const { l } = lauf({ ton: true });
  let h = 0;
  let ablehnen = (/** @type {any} */ _) => {};
  const bis = new Promise((_, nein) => (ablehnen = nein));
  await l.spiele(async () => {
    l.hilfe(() => void h++, { bis });
    ablehnen(new Error("weg"));
    await bis.catch(() => {});
    await Promise.resolve();
    l.hilfeGedrueckt();
    assert.equal(h, 0);
  });
  // Eine Hilfe, die vor spiele gesetzt wurde, gilt im neuen Ablauf nicht.
  l.hilfe(() => void h++);
  await l.spiele(async () => {
    l.hilfeGedrueckt();
  });
  assert.equal(h, 0);
});
