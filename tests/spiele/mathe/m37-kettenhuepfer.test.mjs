// M37 Kettenhüpfer: reine Spiellogik (spiele/mathe/m37-kettenhuepfer/logik.js) und die Sätze aus Daten (texte.json).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const L = await import("../../../spiele/mathe/m37-kettenhuepfer/logik.js");
const { aufgabenVon } = await import("../../../spiele/aufgabenarten.js");
const TEXTE = JSON.parse(readFileSync(new URL("../../../spiele/mathe/m37-kettenhuepfer/texte.json", import.meta.url), "utf8"));
const REIHEN = [2, 3, 4, 5, 6, 7, 8, 9, 10];
const alle = [...REIHEN.map((n) => ({ art: "mal", reihe: n })), { art: "mal", kern: true }].flatMap(aufgabenVon);

test("hilfeVon: Probe über eine nahe Kernaufgabe, nie die Lösung selbst, Stäbchen zwischen Kern und Ziel", () => {
  assert.deepEqual(L.hilfeVon(1), { kern: null, hell: [1] });
  assert.deepEqual(L.hilfeVon(2), { kern: 1, hell: [2] });
  assert.deepEqual(L.hilfeVon(4), { kern: 5, hell: [5] });
  assert.deepEqual(L.hilfeVon(5), { kern: 10, hell: [1, 2, 3, 4, 5] });
  assert.deepEqual(L.hilfeVon(7), { kern: 5, hell: [6, 7] });
  assert.deepEqual(L.hilfeVon(8), { kern: 10, hell: [9, 10] });
  assert.deepEqual(L.hilfeVon(10), { kern: 5, hell: [6, 7, 8, 9, 10] });
  for (let a = 1; a <= 10; a++) {
    const h = L.hilfeVon(a);
    assert.notEqual(h.kern, a, `${a}: die Probe ist nicht die Aufgabe`);
    if (h.kern !== null) assert.ok([1, 2, 5, 10].includes(h.kern), `${a}: Kern ${h.kern}`);
    assert.ok(h.hell.length >= 1 && h.hell.length <= 5, `${a}`);
  }
});

test("Eingabe: Ziffern, Löschen, höchstens drei Ziffern, keine führende Null", () => {
  assert.equal(L.tippe("", "0"), "");
  assert.equal(L.tippe("4", "2"), "42");
  assert.equal(L.tippe("100", "1"), "100");
  assert.equal(L.tippe("42", "loeschen"), "4");
  assert.equal(L.tippe("", "x"), "");
});

test("naechsteTaste und tastenZu: der Weg zur Zahl, Löschen bei falschem Anfang", () => {
  assert.equal(L.naechsteTaste("", 42), "4");
  assert.equal(L.naechsteTaste("4", 42), "2");
  assert.equal(L.naechsteTaste("42", 42), "fertig");
  assert.equal(L.naechsteTaste("5", 42), "loeschen");
  assert.deepEqual(L.tastenZu("", [14, 7, 21]), ["1", "2", "7"]);
  assert.deepEqual(L.tastenZu("7", [14, 7, 70]), ["0", "fertig"]);
  assert.deepEqual(L.tastenZu("9", [14, 7, 21]), ["loeschen"]);
  assert.deepEqual(L.kandidaten(1, 7), [7, 14]);
});

test("Ratendes Kind: über die Kandidaten ist jede Aufgabe mit wenigen Tasten erreichbar", () => {
  for (const { daten: { a, b, c } } of alle) {
    let e = "";
    for (let i = 0; i < 5 && L.naechsteTaste(e, c) !== "fertig"; i++) {
      const t = L.naechsteTaste(e, c);
      assert.ok(L.tastenZu(e, L.kandidaten(a, b)).includes(t), `${a} · ${b}: ${t} fehlt bei „${e}“`);
      e = L.tippe(e, t);
    }
    assert.ok(L.tastenZu(e, L.kandidaten(a, b)).includes("fertig"), `${a} · ${b}`);
  }
});

test("pfeileWaehrend: gelöste mit Zahl, das eigene Pfeilchen nie (nichts zum Ablesen)", () => {
  assert.deepEqual(L.pfeileWaehrend([5, 2, 7], 7), [2, 5]);
  assert.deepEqual(L.pfeileWaehrend([], 3), []);
});

test("einfuehrungsKette: die Kette der ersten Aufgabe, eine andere, wenn sie selbst 2 · n oder 3 · n ist", () => {
  assert.equal(L.einfuehrungsKette(6, 7), 7);
  assert.equal(L.einfuehrungsKette(2, 7), 8);
  assert.equal(L.einfuehrungsKette(3, 10), 9);
});

test("Hüpfer: je 0,24 s, zusammen höchstens etwa 1,6 s, der Sprung in die zweite Reihe länger; Töne steigen", () => {
  assert.deepEqual(L.hueperZeiten(3), [240, 240, 240]);
  for (let a = 1; a <= 10; a++) {
    const z = L.hueperZeiten(a);
    assert.equal(z.length, a);
    assert.ok(z.reduce((s, x) => s + x, 0) <= 1700, `${a}: ${z}`);
    if (a >= 6) assert.ok(z[5] > z[4], `${a}: Reihenwechsel`);
  }
  for (let k = 2; k <= 10; k++) assert.ok(L.hueperTon(k) > L.hueperTon(k - 1), `Ton ${k}`);
});

test("Freude: nie zweimal dieselbe hintereinander, der Freudentanz seltener; Witz höchstens jede fünfte Aufgabe", () => {
  let saat = 3;
  const rnd = () => ((saat = (saat * 16807) % 2147483647) / 2147483647);
  let vorige = null;
  const zahl = /** @type {Record<string, number>} */ ({});
  for (let i = 0; i < 400; i++) {
    const f = L.naechsteFreude(vorige, rnd);
    assert.ok(L.FREUDE.includes(f));
    assert.notEqual(f, vorige);
    zahl[f] = (zahl[f] ?? 0) + 1;
    vorige = f;
  }
  assert.ok(zahl.freudentanz < zahl.huepfen && zahl.freudentanz < zahl.umdrehen, JSON.stringify(zahl));
  assert.equal(L.witz(10, 4), null);
  assert.equal(L.witz(10, 5), "fast-umfallen");
  assert.equal(L.witz(1, 6), "doppelblick");
  assert.equal(L.witz(6, 9), null);
});

test("texte.json: je Reihe der Anfang, je Aufgabe die Gleichung, je Zahl bis 100 ihr Ort; keine Wörter aus 3.2", () => {
  for (const n of REIHEN) assert.equal(TEXTE.anfang[n], `Lena hüpft auf der Kette von ${n}.`);
  for (const { daten: { a, b, c } } of alle) assert.equal(TEXTE.gleichung[`${a}*${b}`], `${a} mal ${b} ist ${c}.`);
  // Auch jede Probe (Kernaufgabe) hat ihren Satz.
  for (const n of REIHEN) for (const k of [1, 2, 5, 10]) assert.ok(TEXTE.gleichung[`${k}*${n}`], `${k} · ${n}`);
  for (let w = 1; w <= 100; w++) assert.equal(TEXTE.daneben[w], `Die ${w} liegt dort drüben.`);
  const alleTexte = JSON.stringify(TEXTE);
  for (const w of ["super", "toll", "falsch", "leider", "Fehler", "richtig"]) assert.ok(!new RegExp(`\\b${w}\\b`, "i").test(alleTexte), w);
});
