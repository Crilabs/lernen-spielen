import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  ARTEN, befehlFuer, ladeAuftraege, naechsterWartender, neuerAuftrag, speichereAuftraege, statusAusErgebnis, streiche, verschiebe,
} from "../werkzeuge/verwaltung/auftraege.mjs";

const JETZT = new Date("2026-11-16T10:00:00Z");
const a = (id, status = "wartet") => ({ id, art: "frei", ziel: id, befehl: id, status });

test("ARTEN: die fünf Auftragsarten", () => {
  assert.deepEqual(ARTEN, ["spiel", "echte-dinge", "buch", "einfuehrung", "frei"]);
});

test("befehlFuer: ein Befehl je Art", () => {
  assert.equal(befehlFuer("spiel", "M15"), "Spiel entwickeln M15");
  assert.equal(befehlFuer("echte-dinge", ["a", "b"]), "Mit echten Dingen a b");
  assert.equal(befehlFuer("echte-dinge", "a"), "Mit echten Dingen a");
  assert.equal(befehlFuer("buch", "hund"), "Sachgeschichte hund");
  assert.match(befehlFuer("einfuehrung", "zerlegen-2"), /^Einführung für Thema zerlegen-2 nach den Vorlagen in spiele\/einfuehrungen\//);
  assert.equal(befehlFuer("frei", "Mach X"), "Mach X");
});

test("neuerAuftrag: wartet, mit Befehl, Schätzung und Zeit", () => {
  const n = neuerAuftrag({ art: "spiel", ziel: "M15", schaetzung_eur: 7.5 }, JETZT);
  assert.match(n.id, /^a-\d+-[a-z0-9]+$/);
  assert.equal(n.status, "wartet");
  assert.equal(n.befehl, "Spiel entwickeln M15");
  assert.equal(n.schaetzung_eur, 7.5);
  assert.equal(n.angelegt, "2026-11-16T10:00:00.000Z");
});

test("neuerAuftrag: unbekannte Art oder leeres Ziel wirft", () => {
  assert.throws(() => neuerAuftrag({ art: "x", ziel: "M1" }, JETZT), /Art/);
  assert.throws(() => neuerAuftrag({ art: "spiel", ziel: "" }, JETZT), /Ziel/);
  assert.throws(() => neuerAuftrag({ art: "echte-dinge", ziel: [] }, JETZT), /Ziel/);
  assert.throws(() => neuerAuftrag({ art: "spiel", ziel: "M1; rm -rf" }, JETZT), /Ziel/);
});

test("verschiebe: hoch und runter, am Rand unverändert", () => {
  const l = [a("x"), a("y"), a("z")];
  assert.deepEqual(verschiebe(l, "y", -1).map((x) => x.id), ["y", "x", "z"]);
  assert.deepEqual(verschiebe(l, "y", 1).map((x) => x.id), ["x", "z", "y"]);
  assert.deepEqual(verschiebe(l, "x", -1).map((x) => x.id), ["x", "y", "z"]);
  assert.deepEqual(l.map((x) => x.id), ["x", "y", "z"]);
});

test("streiche: nur wartende, laufende bleiben", () => {
  const l = [a("x"), a("y", "laeuft")];
  assert.equal(streiche(l, "x")[0].status, "gestrichen");
  assert.equal(streiche(l, "y")[1].status, "laeuft");
});

test("naechsterWartender: der oberste mit Status wartet", () => {
  assert.equal(naechsterWartender([a("x", "erledigt"), a("y"), a("z")])?.id, "y");
  assert.equal(naechsterWartender([a("x", "erledigt")]), null);
});

test("statusAusErgebnis: Zuordnung der Ergebnisse", () => {
  assert.equal(statusAusErgebnis(null), "fehlgeschlagen");
  assert.equal(statusAusErgebnis({ status: "gruen" }), "erledigt");
  assert.equal(statusAusErgebnis({ status: "erledigt" }), "erledigt");
  assert.equal(statusAusErgebnis({ status: "freigabe" }), "wartet-auf-christian");
  assert.equal(statusAusErgebnis({ status: "geparkt" }), "wartet-auf-christian");
  assert.equal(statusAusErgebnis({ status: "abgebrochen" }), "fehlgeschlagen");
  assert.equal(statusAusErgebnis({ status: "quatsch" }), "fehlgeschlagen");
});

test("ladeAuftraege/speichereAuftraege: fehlende Datei leer, Rundreise, kaputte Datei wirft und bleibt", () => {
  const d = mkdtempSync(join(tmpdir(), "auftraege-"));
  const f = join(d, "auftraege.json");
  assert.deepEqual(ladeAuftraege(f), []);
  speichereAuftraege(f, [a("x")]);
  assert.deepEqual(ladeAuftraege(f), [a("x")]);
  writeFileSync(f, "{kaputt");
  assert.throws(() => ladeAuftraege(f), /auftraege.json ist kein gültiges JSON/);
  assert.equal(readFileSync(f, "utf8"), "{kaputt");
  rmSync(d, { recursive: true });
});
