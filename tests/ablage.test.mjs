// Ablage (docs/spielentwicklung.md „Ablage“): jedes Spiel in spiele.json liegt unter
// spiele/<fach>/<katalog-nr>-<name>/, das Fach ist die `kategorie`, `datei` und `symbol` gehören in diesen Ordner.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SPIELE = join(dirname(fileURLToPath(import.meta.url)), "..", "spiele");
const ORDNERNAME = /^[a-z]\d{2}-[a-z0-9-]+$/;

/**
 * Fehlermeldungen zur Ablage der Spiele; leer, wenn alles passt.
 * @param {any[]} spiele  Einträge wie in spiele.json
 * @param {(pfad: string) => boolean} vorhanden  prüft einen Pfad relativ zu spiele/
 */
export function ablageFehler(spiele, vorhanden) {
  const fehler = [];
  for (const s of spiele) {
    const teile = String(s.datei ?? "").split("/");
    if (teile.length !== 3 || teile[2] !== "index.html") {
      fehler.push(`${s.id}: datei „${s.datei}“ ist nicht <fach>/<nr>-<name>/index.html`);
      continue;
    }
    const [fach, ordner] = teile;
    if (fach !== s.kategorie) fehler.push(`${s.id}: Fach-Ordner „${fach}“ ≠ kategorie „${s.kategorie}“`);
    if (!ORDNERNAME.test(ordner)) fehler.push(`${s.id}: Ordnername „${ordner}“ passt nicht zu <buchstabe><zahl zweistellig>-<name>`);
    if (!vorhanden(s.datei)) fehler.push(`${s.id}: datei „${s.datei}“ fehlt`);
    if (!s.symbol || !vorhanden(s.symbol)) fehler.push(`${s.id}: symbol „${s.symbol}“ fehlt`);
    else if (!s.symbol.startsWith(`${fach}/${ordner}/`)) fehler.push(`${s.id}: symbol „${s.symbol}“ liegt nicht im Spielordner`);
  }
  return fehler;
}

test("Ablage: jedes Spiel in spiele.json liegt unter spiele/<fach>/<nr>-<name>/", () => {
  const katalog = JSON.parse(readFileSync(join(SPIELE, "spiele.json"), "utf8"));
  assert.deepEqual(ablageFehler(katalog.spiele, (p) => existsSync(join(SPIELE, p))), []);
});

test("Ablage: die Vorlage und der Ordner für gemeinsame Objekte liegen da", () => {
  for (const p of ["vorlage/index.html", "vorlage/spiel.js", "objekte/README.md"]) assert.ok(existsSync(join(SPIELE, p)), p);
});

test("Ablage (Selbsttest mit Beispielen): richtig und falsch abgelegte Spiele", () => {
  const da = () => true;
  const gut = { id: "zwei-tonnen", kategorie: "mathe", datei: "mathe/m14-zwei-tonnen/index.html", symbol: "mathe/m14-zwei-tonnen/symbol.svg" };
  assert.deepEqual(ablageFehler([gut], da), []);
  assert.match(ablageFehler([{ ...gut, datei: "zwei-tonnen.html" }], da)[0], /nicht <fach>/);
  assert.match(ablageFehler([{ ...gut, kategorie: "lesen" }], da)[0], /≠ kategorie/);
  assert.match(ablageFehler([{ ...gut, datei: "mathe/zwei-tonnen/index.html" }], da)[0], /Ordnername/);
  assert.match(ablageFehler([{ ...gut, datei: "mathe/m1-zwei/index.html" }], da).join(), /Ordnername/);
  assert.match(ablageFehler([gut], (p) => !p.endsWith(".svg"))[0], /symbol .* fehlt/);
  assert.match(ablageFehler([gut], (p) => !p.endsWith(".html"))[0], /datei .* fehlt/);
  assert.match(ablageFehler([{ ...gut, symbol: "symbole/x.svg" }], da)[0], /nicht im Spielordner/);
});

test("Ablage: npm test nimmt die Node-Tests der Spiele mit (tests/spiele/<fach>/<spiel>.test.mjs)", () => {
  // Ohne das liefen die Logik-Tests eines Spiels nie; der Bau-Agent soll package.json dafür nicht anfassen müssen.
  const skript = JSON.parse(readFileSync(join(SPIELE, "..", "package.json"), "utf8")).scripts.test;
  assert.match(skript, /"tests\/\*\*\/\*\.test\.mjs"/);
});
