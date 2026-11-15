// Bibliothek der Geschichten (docs/superpowers/specs/2026-11-15-bibliothek-design.md): Räume › Regale › Bücher.
// Logik in spiele/start/bibliothek.js, Plan in spiele/bibliothek.json.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const B = await import("../spiele/start/bibliothek.js");
const lies = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
const plan = lies("../spiele/bibliothek.json");
const index = lies("../spiele/geschichten/index.json").geschichten;
const lernplan = lies("../spiele/lernplan.json");

const PLAN = { raeume: [
  { id: "tiere", name: "Tiere", bild: "tiere-pflanzen", regale: [
    { id: "haus", name: "Haustiere", welten: ["haustiere"], buecher: [{ id: "katze", titel: "Katze (Arbeitstitel)" }, { id: "hund", titel: "Hund" }] },
    { id: "meer", name: "Im Meer", buecher: [{ id: "wal", titel: "Wal" }] }] },
  { id: "weltall", name: "Weltall", bild: "erde-himmel", regale: [{ id: "planeten", name: "Planeten", buecher: [{ id: "mars", titel: "Mars" }] }] },
] };
const FERTIG = [{ id: "katze", titel: "Ein Tag mit Mia" }, { id: "wal", titel: "Der Wal" }];

test("bibliothekGanz: jedes Buch mit da/geplant, Titel fertiger Bücher aus der Geschichte, gelesen am", () => {
  const g = B.bibliothekGanz(PLAN, FERTIG, { katze: { am: "2026-11-10" } });
  assert.deepEqual(g[0].regale[0].buecher, [
    { id: "katze", titel: "Ein Tag mit Mia", da: true, am: "2026-11-10" },
    { id: "hund", titel: "Hund", da: false, am: "" }]);
  assert.deepEqual(g[0].regale[0].welten, ["haustiere"]);
  assert.equal(g[1].regale[0].buecher[0].da, false);
});

test("bibliothekFuerKind: nur fertige Bücher; Regale und Räume ohne fertiges Buch fehlen", () => {
  const k = B.bibliothekFuerKind(PLAN, FERTIG, {});
  assert.deepEqual(k.map((r) => r.id), ["tiere"]);
  assert.deepEqual(k[0].regale.map((rg) => [rg.id, rg.buecher.map((b) => b.id)]), [["haus", ["katze"]], ["meer", ["wal"]]]);
  assert.deepEqual(B.bibliothekFuerKind(PLAN, [], {}), []);
  assert.deepEqual(B.bibliothekFuerKind(null, FERTIG, {}), []);
});

test("regalZustand: gelesen, teils, da, kommt", () => {
  const r = (bs) => ({ buecher: bs });
  assert.equal(B.regalZustand(r([{ da: true, am: "x" }, { da: false, am: "" }])), "gelesen");
  assert.equal(B.regalZustand(r([{ da: true, am: "x" }, { da: true, am: "" }])), "teils");
  assert.equal(B.regalZustand(r([{ da: true, am: "" }])), "da");
  assert.equal(B.regalZustand(r([{ da: false, am: "" }])), "kommt");
});

test("waehleRaum und buchHref: gewünschter Raum, sonst die Halle (null); Fertig führt in denselben Raum zurück", () => {
  const k = B.bibliothekFuerKind(PLAN, [...FERTIG, { id: "mars", titel: "Mars" }], {});
  assert.equal(B.waehleRaum(k, "weltall").id, "weltall");
  assert.equal(B.waehleRaum(k, "gibt-es-nicht"), null, "unbekannt: die Halle");
  assert.equal(B.waehleRaum(k, null), null, "ohne ?raum: die Halle");
  const href = B.buchHref("katze", "tiere");
  assert.equal(href, "geschichte.html?id=katze&weiter=bibliothek.html%3Fraum%3Dtiere");
  assert.equal(new URLSearchParams(href.split("?").slice(1).join("?")).get("weiter"), "bibliothek.html?raum=tiere");
});

test("raumSvg und raumBildFlach: Themenkreise und eigene Raumbilder, ohne Kontur", () => {
  for (const bild of ["tiere-pflanzen", "zahlen-buchstaben"]) {
    assert.match(B.raumSvg(bild), /^<svg viewBox="30 -128 240 288"/);
    assert.match(B.raumBildFlach(bild), /^<svg viewBox="0 0 300 160"/);
    assert.doesNotMatch(B.raumSvg(bild), /stroke="#3B2A6B"/, "keine Tinte-Kontur im Raumbild");
  }
  assert.match(B.raumWand("tiere-pflanzen"), /^#[0-9A-F]{6}$/i);
  assert.match(B.raumSchatten("tiere-pflanzen"), /^#[0-9A-F]{6}$/i);
});

// ---------- der echte Plan ----------

test("bibliothek.json: Ids eindeutig, Räume mit Bild, Regale mit Büchern, Welten aus dem Lernplan, Fächer bekannt", () => {
  const welten = new Set(lernplan.welten.map((w) => w.id));
  const faecher = new Set(["mathe", "lesen", "schreiben", "grammatik", "geometrie", "sprechen"]);
  const raumIds = new Set(), regalIds = new Set(), buchIds = new Set();
  for (const r of plan.raeume) {
    assert.ok(r.id && r.name && r.bild, `Raum ${r.id}`);
    assert.ok(typeof r.foto === "string" && existsSync(new URL(`../spiele/${r.foto}`, import.meta.url)), `Raum ${r.id}: Raumbild ${r.foto} fehlt`);
    assert.ok(!raumIds.has(r.id), `doppelter Raum ${r.id}`); raumIds.add(r.id);
    assert.ok(r.regale.length > 0, `Raum ${r.id} ohne Regale`);
    for (const rg of r.regale) {
      assert.ok(rg.id && rg.name && rg.buecher.length > 0, `Regal ${rg.id}`);
      assert.ok(!regalIds.has(rg.id), `doppeltes Regal ${rg.id}`); regalIds.add(rg.id);
      for (const w of rg.welten ?? []) assert.ok(welten.has(w), `Regal ${rg.id}: Welt ${w} fehlt im Lernplan`);
      if (rg.fach) assert.ok(faecher.has(rg.fach), `Regal ${rg.id}: Fach ${rg.fach}`);
      for (const b of rg.buecher) {
        assert.match(b.id, /^[a-z0-9]+(-[a-z0-9]+)*$/, `Buch ${b.id}`);
        assert.ok(b.titel, `Buch ${b.id} ohne Titel`);
        assert.ok(!buchIds.has(b.id), `Buch ${b.id} steht doppelt`); buchIds.add(b.id);
      }
    }
  }
});

test("bibliothek.json: jede fertige Geschichte steht in der Bibliothek; Lerngeschichten im Raum „Zahlen und Buchstaben“", () => {
  const raumVon = new Map(plan.raeume.flatMap((r) => r.regale.flatMap((rg) => rg.buecher.map((b) => [b.id, r.id]))));
  for (const g of index) {
    assert.ok(raumVon.has(g.id), `Geschichte ${g.id} fehlt in spiele/bibliothek.json`);
    if (!["sachgeschichte", "sachbuch"].includes(g.art)) assert.equal(raumVon.get(g.id), "zahlen-buchstaben", `Lerngeschichte ${g.id}`);
    assert.ok(existsSync(new URL(`../spiele/geschichten/${g.id}/geschichte.json`, import.meta.url)), g.id);
  }
});

test("Regal Tiere: zehn Regale, 51 Bücher (Plan 2026-11-15)", () => {
  const tiere = plan.raeume.find((r) => r.id === "tiere");
  assert.equal(tiere.regale.length, 10);
  assert.equal(tiere.regale.reduce((n, rg) => n + rg.buecher.length, 0), 51);
});
