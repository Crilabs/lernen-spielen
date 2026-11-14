import { test, before } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

globalThis.fetch = /** @type {any} */ (
  async (url) => {
    const text = await readFile(fileURLToPath(url), "utf8");
    return { ok: true, text: async () => text, json: async () => JSON.parse(text) };
  }
);

const V = await import("../spiele/kern/vorlagen.js?wort");
before(() => V.ladeVorlagen(new URL("./daten/vorlagen/", import.meta.url)));

const nahe = (a, b) => Math.hypot(a.x - b.x, a.y - b.y) <= 0.5;
const enthaelt = (zug, p) => zug.some((q) => nahe(q, p));

test("in: ein verbundener Zug, i-Punkt am Ende", () => {
  const w = V.wort("test", "in");
  assert.equal(w.striche.length, 2);
  assert.deepEqual(w.luft, [false, true]);
  assert.deepEqual(w.striche[0][0], { x: 0, y: 200 });
  // n beginnt bei x = 40 (Breite i) + 30 (Abstand); die Verbindung endet dort
  assert.ok(enthaelt(w.striche[0], { x: 70, y: 200 }));
  assert.deepEqual(w.striche[0].at(-1), { x: 150, y: 200 });
  assert.equal(w.breite, 150);
});

test("nü: Umlaut-Punkte sind die letzten zwei Striche", () => {
  const w = V.wort("test", "nü");
  assert.deepEqual(w.luft, [false, true, true]);
  assert.ok(w.striche[1].every((p) => p.y < 100));
});

test("Verbindung ist stetig: keine Lücke zwischen Punkten des Zugs", () => {
  const [zug] = V.wort("test", "in").striche;
  for (let i = 1; i < zug.length; i++)
    assert.ok(Math.hypot(zug[i].x - zug[i - 1].x, zug[i].y - zug[i - 1].y) <= V.ABTASTUNG + 1, `Sprung bei ${i}`);
});

test("Luftsprung zum Oval: zwei Züge; durchgezogen: einer", () => {
  assert.equal(V.wort("test", "no").striche.length, 2);
  assert.equal(V.wort("testd", "no").striche.length, 1);
});

test("Sonderverbindung s → * statt berechneter Kurve", () => {
  const [zug] = V.wort("test", "sn").striche;
  const sonder = V.sonderverbindung("test", "s", "n");
  assert.ok(sonder);
  for (const p of sonder) assert.ok(enthaelt(zug, { x: p.x + 60, y: p.y }), `Punkt ${p.x},${p.y}`);
  // n schließt an das Ende der Sonderverbindung an
  assert.ok(enthaelt(zug, { x: 90, y: 200 }));
});

test("Leerzeichen: neuer Zug und Wortabstand", () => {
  const w = V.wort("test", "in no");
  assert.deepEqual(w.luft, [false, true, false, false]);
  const ersterRand = Math.max(...w.striche[0].map((p) => p.x));
  const zweiterAnfang = Math.min(...w.striche[2].map((p) => p.x));
  assert.ok(zweiterAnfang - ersterRand >= V.raster().wortabstand);
});

test("nach Ausgang oben entfällt der Anstrich: oi ohne Knick zur Grundlinie", () => {
  const [zug] = V.wort("test", "oi").striche;
  // o endet bei x=80 an der Mittellinie; das i beginnt bei x=110, sein Anstrich erreicht die Mittellinie bei x=130
  const zwischen = zug.filter((p) => p.x > 80 && p.x < 128);
  assert.ok(zwischen.length > 0);
  for (const p of zwischen) assert.ok(p.y <= 112, `Punkt ${p.x.toFixed(1)},${p.y.toFixed(1)} sackt ab`);
  // Abgetastet wird alle ABTASTUNG Einheiten; die Ecke selbst muss nicht genau getroffen sein.
  assert.ok(zug.some((p) => Math.hypot(p.x - 130, p.y - 100) <= V.ABTASTUNG), "Anschluss am Scheitel des i");
});

test("nach Ausgang unten bleibt der Anstrich: in beginnt n an der Grundlinie", () => {
  const [zug] = V.wort("test", "in").striche;
  assert.ok(enthaelt(zug, { x: 70, y: 200 }));
});

test("fehlende Form im Wort wirft", () => {
  assert.throws(() => V.wort("test", "On"), /Fehlende Form: test\/O/);
});

test("nicht verbundener Satz: Formen nebeneinander, Striche getrennt", () => {
  const w = V.wort("testz", "11");
  assert.equal(w.striche.length, 2);
  assert.deepEqual(w.striche[1][0], { x: 130 + 30, y: 50 });
});
