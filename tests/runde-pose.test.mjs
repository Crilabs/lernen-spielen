import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { meldeKind, meldeHaltung, meldeBewegung, meldeGesicht, leereBestand } from "../spiele/runde/bestand.js";
import { pose, ablauf, mische } from "../spiele/runde/pose.js";
import { gelenkeFuer } from "../spiele/runde/gelenke.js";
import { TESTKIND_GEHT, TESTKIND_STUHL, kopie } from "./daten/runde-testkinder.js";

beforeEach(() => {
  leereBestand();
  meldeKind(kopie(TESTKIND_GEHT));
  meldeKind(kopie(TESTKIND_STUHL));
  for (const id of ["ruhig", "staunen"]) meldeGesicht({ id, ansichten: { dreiviertel: "", profil: "" } });
  meldeHaltung({ id: "stehen", ansicht: "beide" });
  meldeHaltung({ id: "zeigen", ansicht: "dreiviertel", winkel: { "arm-vorn-oben": -70, kopf: 4 }, gesicht: "staunen" });
  meldeHaltung({
    id: "schritt", ansicht: "profil", winkel: { "bein-vorn": 20, "arm-vorn-oben": 10 },
    rollstuhl: { winkel: { "rad-vorn": 90 }, versatz: [0, -2] },
  });
});

test("fehlende Gelenke sind 0", () => {
  const p = pose("test-geht", "zeigen");
  assert.deepEqual(Object.keys(p.winkel).sort(), gelenkeFuer("geht").sort());
  assert.equal(p.winkel.rumpf, 0);
  assert.equal(p.winkel["arm-vorn-oben"], -70);
  assert.deepEqual(p.versatz, [0, 0]);
  assert.equal(p.groesse, 1);
  assert.equal(p.gesicht, "staunen");
  assert.equal(p.ansicht, "dreiviertel");
});

test("ohne Gesicht ist das Gesicht ruhig", () => {
  assert.equal(pose("test-geht", "stehen").gesicht, "ruhig");
});

test("Rollstuhl-Fassung gilt für das Stuhlkind, Beine fehlen", () => {
  const p = pose("test-stuhl", "schritt");
  assert.equal(p.winkel["rad-vorn"], 90);
  assert.equal(p.winkel["arm-vorn-oben"], 10);
  assert.equal(p.winkel["bein-vorn"], undefined);
  assert.deepEqual(p.versatz, [0, -2]);
  assert.equal(pose("test-geht", "schritt").winkel["rad-vorn"], undefined);
});

test("Haltung ohne Beine gilt für beide Kinder gleich", () => {
  assert.equal(pose("test-stuhl", "zeigen").winkel["arm-vorn-oben"], pose("test-geht", "zeigen").winkel["arm-vorn-oben"]);
});

test("Ansicht: beide nimmt Standard dreiviertel oder die verlangte, falsche wirft", () => {
  assert.equal(pose("test-geht", "stehen").ansicht, "dreiviertel");
  assert.equal(pose("test-geht", "stehen", "profil").ansicht, "profil");
  assert.throws(() => pose("test-geht", "schritt", "dreiviertel"), /schritt.*profil/);
});

test("unbekanntes Kind oder unbekannte Haltung wirft mit Namen", () => {
  assert.throws(() => pose("niemand", "stehen"), /niemand/);
  assert.throws(() => pose("test-geht", "purzelbaum"), /purzelbaum/);
});

test("ablauf wiederholt mal und endet mit der Ende-Haltung", () => {
  meldeBewegung({
    id: "wink", ansicht: "dreiviertel", mal: 3, ende: "stehen",
    schritte: [{ ms: 100, winkel: { "arm-vorn-unten": 20 } }, { ms: 100, winkel: { "arm-vorn-unten": -20 } }],
  });
  const a = ablauf("test-geht", "wink");
  assert.equal(a.length, 7);
  assert.equal(a[6].ms, 400);
  assert.equal(a[6].pose.winkel["arm-vorn-unten"], 0);
  assert.equal(a[1].pose.winkel["arm-vorn-unten"], -20);
});

test("Schritt ohne Haltung erbt die vorige Pose", () => {
  meldeBewegung({
    id: "zeig-wink", ansicht: "dreiviertel", ende: "stehen",
    schritte: [{ ms: 100, haltung: "zeigen" }, { ms: 100, winkel: { "arm-vorn-unten": 15 } }],
  });
  const [, zweiter] = ablauf("test-geht", "zeig-wink");
  assert.equal(zweiter.pose.winkel["arm-vorn-oben"], -70);
  assert.equal(zweiter.pose.winkel["arm-vorn-unten"], 15);
  assert.equal(zweiter.pose.gesicht, "staunen");
});

test("ablauf nimmt beim Stuhlkind die Rollstuhl-Schritte", () => {
  meldeBewegung({
    id: "lauf", ansicht: "profil", ende: "stehen",
    schritte: [{ ms: 250, winkel: { "bein-vorn": 20 } }],
    rollstuhl: { schritte: [{ ms: 250, winkel: { "rad-vorn": 90 } }, { ms: 250, winkel: { "rad-vorn": 180 } }] },
  });
  const a = ablauf("test-stuhl", "lauf");
  assert.equal(a.length, 3);
  assert.equal(a[1].pose.winkel["rad-vorn"], 180);
  assert.equal(a[2].pose.ansicht, "profil");
  assert.equal(ablauf("test-geht", "lauf").length, 2);
});

test("braucht der Bewegung gilt für die Schritte, nicht für die Ende-Haltung", () => {
  meldeBewegung({ id: "zaub", ansicht: "dreiviertel", ende: "stehen", braucht: ["stab"], schritte: [{ ms: 100 }, { ms: 100 }] });
  const a = ablauf("test-geht", "zaub");
  assert.ok(a.slice(0, -1).every((s) => s.pose.braucht.includes("stab")));
  assert.deepEqual(a[a.length - 1].pose.braucht, []);
});

test("mische: Ränder, Mitte, Gesicht ab der Hälfte", () => {
  const a = pose("test-geht", "stehen");
  const b = pose("test-geht", "zeigen");
  assert.deepEqual(mische(a, b, 0).winkel, a.winkel);
  assert.deepEqual(mische(a, b, 1).winkel, b.winkel);
  assert.equal(mische(a, b, 0.5).winkel["arm-vorn-oben"], -35);
  assert.equal(mische(a, b, 0.49).gesicht, "ruhig");
  assert.equal(mische(a, b, 0.5).gesicht, "staunen");
  assert.ok(mische(a, b, 0.25).winkel["arm-vorn-oben"] > -70 * 0.25, "sanfter Anlauf");
});

test("mische: Zubehör bleibt während des Übergangs, am Ende nur das des Ziels", () => {
  const a = { ...pose("test-geht", "stehen"), braucht: ["stab"] };
  const b = { ...pose("test-geht", "zeigen"), braucht: ["schirm"] };
  assert.deepEqual(mische(a, b, 0.1).braucht.sort(), ["schirm", "stab"]);
  assert.deepEqual(mische(a, b, 0.9).braucht.sort(), ["schirm", "stab"]);
  assert.deepEqual(mische(a, b, 1).braucht, ["schirm"]);
});
