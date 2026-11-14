import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  meldeKind, meldeGesicht, meldeHaltung, meldeBewegung, meldeZubehoer,
  pruefeBestand, leereBestand, bestand,
} from "../spiele/runde/bestand.js";
import { gelenkeFuer, BEINE, PLAETZE } from "../spiele/runde/gelenke.js";
import { TESTKIND_GEHT, TESTKIND_STUHL, kopie } from "./daten/runde-testkinder.js";

beforeEach(() => leereBestand());

test("gelenkeFuer kennt Beine nur beim gehenden Kind", () => {
  assert.ok(gelenkeFuer("geht").includes("bein-vorn"));
  assert.ok(!gelenkeFuer("rollstuhl").includes("bein-vorn"));
  assert.ok(gelenkeFuer("rollstuhl").includes("rad-vorn"));
  assert.deepEqual(BEINE, ["bein-hinten", "bein-vorn"]);
  assert.deepEqual(PLAETZE, ["kopf", "hand-vorn", "hand-hinten", "ruecken", "fuesse", "schoss"]);
});

test("meldeKind nimmt Testkinder an", () => {
  meldeKind(kopie(TESTKIND_GEHT));
  meldeKind(kopie(TESTKIND_STUHL));
  assert.equal(bestand.kinder.size, 2);
});

test("meldeKind lehnt fehlenden Drehpunkt ab", () => {
  const k = kopie(TESTKIND_GEHT);
  delete k.ansichten.dreiviertel.drehpunkte.kopf;
  assert.throws(() => meldeKind(k), /test-geht.*kopf/);
});

test("meldeKind lehnt fehlenden Platz ab", () => {
  const k = kopie(TESTKIND_GEHT);
  delete k.ansichten.profil.plaetze.schoss;
  assert.throws(() => meldeKind(k), /schoss/);
});

test("meldeKind lehnt Platz an fremdem Gelenk ab", () => {
  const k = kopie(TESTKIND_STUHL);
  k.ansichten.profil.plaetze.fuesse.gelenk = "bein-vorn";
  assert.throws(() => meldeKind(k), /bein-vorn/);
});

test("meldeKind lehnt id= in Teilen ab", () => {
  const k = kopie(TESTKIND_GEHT);
  k.ansichten.dreiviertel.teile.rumpf.push({ teil: "x", svg: `<path id="a" d="M0 0"/>` });
  assert.throws(() => meldeKind(k), /id=/);
});

test("meldeKind verlangt den Gesichtsplatzhalter im Kopf", () => {
  const k = kopie(TESTKIND_GEHT);
  k.ansichten.profil.teile.kopf = k.ansichten.profil.teile.kopf.filter((t) => t.teil !== "gesicht");
  assert.throws(() => meldeKind(k), /gesicht/);
});

test("doppelter Name wird abgelehnt", () => {
  meldeHaltung({ id: "x", ansicht: "beide" });
  assert.throws(() => meldeHaltung({ id: "x", ansicht: "beide" }), /schon vergeben/);
});

test("unbekanntes Gelenk wird abgelehnt", () => {
  assert.throws(() => meldeHaltung({ id: "y", ansicht: "beide", winkel: { ellbogen: 3 } }), /ellbogen/);
});

test("unbekannte Ansicht wird abgelehnt", () => {
  assert.throws(() => meldeHaltung({ id: "y", ansicht: "frontal" }), /frontal/);
});

test("Beinbewegung ohne Rollstuhl-Fassung wird abgelehnt", () => {
  assert.throws(() => meldeHaltung({ id: "knie", ansicht: "profil", winkel: { "bein-vorn": 10 } }), /knie.*rollstuhl/i);
  meldeHaltung({ id: "knie", ansicht: "profil", winkel: { "bein-vorn": 10 }, rollstuhl: {} });
  assert.ok(bestand.haltungen.has("knie"));
});

test("Bewegung mit Beinen braucht Rollstuhl-Schritte", () => {
  const schritte = [{ ms: 200, winkel: { "bein-hinten": 20 } }];
  assert.throws(() => meldeBewegung({ id: "lauf", ansicht: "profil", schritte, ende: "stehen" }), /lauf.*rollstuhl/i);
  meldeBewegung({ id: "lauf", ansicht: "profil", schritte, ende: "stehen", rollstuhl: { schritte: [{ ms: 200 }] } });
  assert.ok(bestand.bewegungen.has("lauf"));
});

test("verbotene Gesichter werden abgelehnt", () => {
  for (const id of ["traurig", "enttaeuscht", "erschrocken"]) {
    assert.throws(() => meldeGesicht({ id, ansichten: { dreiviertel: "", profil: "" } }), new RegExp(id));
  }
});

test("Zubehör ohne Ansicht wird abgelehnt, mit nurAnsicht angenommen", () => {
  const teile = [{ platz: "kopf", ebene: "vorne", svg: { dreiviertel: "<path d='M0 0'/>" } }];
  assert.throws(() => meldeZubehoer({ id: "hut", wort: "der Hut", teile }), /hut.*profil/);
  meldeZubehoer({ id: "hut", wort: "der Hut", teile, nurAnsicht: "dreiviertel" });
  assert.ok(bestand.zubehoer.has("hut"));
});

test("Zubehör mit unbekanntem Platz wird abgelehnt", () => {
  const teile = [{ platz: "nase", ebene: "vorne", svg: { dreiviertel: "", profil: "" } }];
  assert.throws(() => meldeZubehoer({ id: "brille2", wort: "die Brille", teile }), /nase/);
});

test("pruefeBestand findet unbekannte Ende-Haltung", () => {
  meldeBewegung({ id: "w", ansicht: "dreiviertel", schritte: [{ ms: 100 }], ende: "gibtsnicht" });
  assert.throws(() => pruefeBestand(), /w.*ende.*gibtsnicht/);
});

test("pruefeBestand findet unbekanntes Zubehör und unbekannten Zustand", () => {
  meldeHaltung({ id: "h1", ansicht: "beide", braucht: ["stab"] });
  assert.throws(() => pruefeBestand(), /h1.*stab/);
  leereBestand();
  meldeZubehoer({ id: "stab", wort: "der Stab", teile: [{ platz: "hand-vorn", ebene: "vorne", svg: { dreiviertel: "", profil: "" } }] });
  meldeHaltung({ id: "h2", ansicht: "beide", zustaende: { stab: "leuchtet" } });
  assert.throws(() => pruefeBestand(), /h2.*leuchtet/);
});

test("pruefeBestand findet unbekanntes Gesicht", () => {
  meldeHaltung({ id: "h3", ansicht: "beide", gesicht: "grinsen" });
  assert.throws(() => pruefeBestand(), /h3.*grinsen/);
});

test("Erweiterung eines Spiels mit Fehler bricht beim Laden mit Namen ab", async () => {
  await assert.rejects(import("./daten/runde-erweiterung-kaputt.js"), /kaputt-kniebeuge/);
});
