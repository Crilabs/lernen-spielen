import { test } from "node:test";
import assert from "node:assert/strict";
import { regeln, aktuell, darf, merke, gibZugabe, zahlen } from "../spiele/kern/buecherzeit.js";

const mo = new Date(2026, 10, 16, 10);   // Montag
const di = new Date(2026, 10, 17, 10);
const naechsteWoche = new Date(2026, 10, 23, 10);

test("regeln: nur 1–10 gilt, alles andere ist aus", () => {
  assert.deepEqual(regeln(null), { vorlesenTag: null, vorlesenWoche: null, selbstTag: null, selbstWoche: null });
  assert.deepEqual(regeln({ vorlesenTag: 2, vorlesenWoche: 11, selbstTag: 0, selbstWoche: "3" }),
    { vorlesenTag: 2, vorlesenWoche: null, selbstTag: null, selbstWoche: null });
});

test("darf: ohne Grenze immer; Tagesgrenze zählt verschiedene Bücher je Modus", () => {
  const r = regeln({ vorlesenTag: 2 });
  let s = aktuell(null, mo);
  assert.ok(darf(regeln(null), s, "vorlesen", "a", mo));
  s = merke(s, "vorlesen", "a", mo);
  s = merke(s, "vorlesen", "a", mo);   // dasselbe Buch zählt einmal
  assert.equal(zahlen(s, "vorlesen", mo).heute, 1);
  assert.ok(darf(r, s, "vorlesen", "b", mo));
  s = merke(s, "vorlesen", "b", mo);
  assert.equal(darf(r, s, "vorlesen", "c", mo), false);
  assert.ok(darf(r, s, "vorlesen", "a", mo), "heute schon geöffnet geht weiter");
  assert.ok(darf(r, s, "selbst", "c", mo), "Selbst lesen hat seine eigene Grenze");
  assert.ok(darf(r, s, "vorlesen", "c", di), "am nächsten Tag neu");
});

test("darf: Woche zählt verschiedene Bücher; ein Buch der Woche kostet die Woche nichts", () => {
  const r = regeln({ selbstWoche: 2 });
  let s = merke(merke(aktuell(null, mo), "selbst", "a", mo), "selbst", "b", mo);
  assert.equal(darf(r, s, "selbst", "c", di), false);
  assert.ok(darf(r, s, "selbst", "a", di), "a war diese Woche schon offen");
  s = merke(s, "selbst", "a", di);
  assert.deepEqual(zahlen(s, "selbst", di), { heute: 1, woche: 2, zugabe: 0 });
  assert.ok(darf(r, s, "selbst", "c", naechsteWoche), "neue Woche, neuer Stand");
  assert.deepEqual(aktuell(s, naechsteWoche).tage, {});
});

test("gibZugabe: ein Buch mehr für heute, für beide Modi und über die Woche", () => {
  const r = regeln({ vorlesenTag: 1, selbstWoche: 1 });
  let s = merke(merke(aktuell(null, mo), "vorlesen", "a", mo), "selbst", "a", mo);
  assert.equal(darf(r, s, "vorlesen", "b", mo), false);
  assert.equal(darf(r, s, "selbst", "b", mo), false);
  s = gibZugabe(s, 1, mo);
  assert.ok(darf(r, s, "vorlesen", "b", mo));
  assert.ok(darf(r, s, "selbst", "b", mo));
  assert.equal(darf(r, s, "vorlesen", "b", di), true, "Tagesgrenze morgen neu");
  assert.equal(darf(r, gibZugabe(s, 0, di), "selbst", "b", di), false, "die Zugabe gilt nur heute");
});

test("aktuell: kaputter Stand wird bereinigt", () => {
  const s = aktuell({ woche: aktuell(null, mo).woche, tage: { "2026-11-16": { vorlesen: ["a", 3, "a"], zugabe: -1 } } }, mo);
  assert.deepEqual(s.tage["2026-11-16"], { vorlesen: ["a"], selbst: [], zugabe: 0 });
});
