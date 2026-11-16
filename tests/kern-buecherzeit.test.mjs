import { test } from "node:test";
import assert from "node:assert/strict";
import { regeln, aktuell, darf, merke, gibZugabe, zahlen } from "../spiele/kern/buecherzeit.js";

const mo = new Date(2026, 10, 16, 10);   // Montag
const di = new Date(2026, 10, 17, 10);
const naechsteWoche = new Date(2026, 10, 23, 10);

test("regeln: nur 1–10 gilt, Tag ist Vorgabe, alte Grenzen aus v1.2.1 werden übernommen", () => {
  assert.deepEqual(regeln(null), { anzahl: null, je: "tag", auchLesen: false });
  assert.deepEqual(regeln({ anzahl: 11, je: "monat", auchLesen: "ja" }), { anzahl: null, je: "tag", auchLesen: false });
  assert.deepEqual(regeln({ anzahl: 3, je: "woche", auchLesen: true }), { anzahl: 3, je: "woche", auchLesen: true });
  assert.deepEqual(regeln({ vorlesenTag: null, vorlesenWoche: 4, selbstTag: 2, selbstWoche: null }),
    { anzahl: 4, je: "woche", auchLesen: true });
  assert.deepEqual(regeln({ vorlesenTag: null, vorlesenWoche: null, selbstTag: null, selbstWoche: null }),
    { anzahl: null, je: "tag", auchLesen: false });
});

test("darf: ohne Grenze immer; am Tag zählen verschiedene Bücher; Lesen ohne Häkchen frei", () => {
  const r = regeln({ anzahl: 2, je: "tag" });
  let s = aktuell(null, mo);
  assert.ok(darf(regeln(null), s, "vorlesen", "a", mo));
  s = merke(s, "vorlesen", "a", mo);
  s = merke(s, "vorlesen", "a", mo);   // dasselbe Buch zählt einmal
  assert.equal(zahlen(r, s, mo).heute.size, 1);
  s = merke(s, "vorlesen", "b", mo);
  assert.equal(darf(r, s, "vorlesen", "c", mo), false);
  assert.ok(darf(r, s, "vorlesen", "a", mo), "heute schon geöffnet geht weiter");
  assert.ok(darf(r, s, "selbst", "c", mo), "ohne „Gilt auch für Lesen“ ist Lesen frei");
  assert.ok(darf(r, s, "vorlesen", "c", di), "am nächsten Tag neu");
});

test("darf: mit „Gilt auch für Lesen“ teilen sich Vorlesen und Lesen die Grenze", () => {
  const r = regeln({ anzahl: 2, je: "tag", auchLesen: true });
  let s = merke(merke(aktuell(null, mo), "vorlesen", "a", mo), "selbst", "b", mo);
  assert.equal(darf(r, s, "selbst", "c", mo), false);
  assert.equal(darf(r, s, "vorlesen", "c", mo), false);
  assert.ok(darf(r, s, "selbst", "a", mo), "heute vorgelesen, darf auch selbst gelesen werden");
  s = merke(s, "selbst", "a", mo);
  assert.equal(zahlen(r, s, mo).heute.size, 2, "a zählt einmal, auch in beiden Modi");
});

test("darf: in der Woche; ein Buch der Woche kostet nichts; neue Woche, neuer Stand", () => {
  const r = regeln({ anzahl: 2, je: "woche" });
  let s = merke(merke(aktuell(null, mo), "vorlesen", "a", mo), "vorlesen", "b", mo);
  assert.equal(darf(r, s, "vorlesen", "c", di), false);
  assert.ok(darf(r, s, "vorlesen", "a", di), "a war diese Woche schon offen");
  s = merke(s, "vorlesen", "a", di);
  const z = zahlen(r, s, di);
  assert.deepEqual([z.heute.size, z.woche.size, z.offen.size], [1, 2, 2]);
  assert.ok(darf(r, s, "vorlesen", "c", naechsteWoche));
  assert.deepEqual(aktuell(s, naechsteWoche).tage, {});
});

test("gibZugabe: ein Buch mehr, nur heute, auch über die Woche", () => {
  const r = regeln({ anzahl: 1, je: "woche", auchLesen: true });
  let s = merke(aktuell(null, mo), "vorlesen", "a", mo);
  assert.equal(darf(r, s, "selbst", "b", mo), false);
  s = gibZugabe(s, 1, mo);
  assert.ok(darf(r, s, "selbst", "b", mo));
  assert.ok(darf(r, s, "vorlesen", "b", mo));
  assert.equal(darf(r, s, "vorlesen", "b", di), false, "die Zugabe gilt nur heute");
});

test("aktuell: kaputter Stand wird bereinigt", () => {
  const s = aktuell({ woche: aktuell(null, mo).woche, tage: { "2026-11-16": { vorlesen: ["a", 3, "a"], zugabe: -1 } } }, mo);
  assert.deepEqual(s.tage["2026-11-16"], { vorlesen: ["a"], selbst: [], zugabe: 0 });
});
