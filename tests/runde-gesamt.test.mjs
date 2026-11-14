// Gesamttest der Runde: der echte Bestand samt allen Erweiterungen der Spiele (spiele/<spiel>/runde.js).
// Jede Kombination aus Kind, Ansicht, Haltung und Zubehör muss sich zeichnen lassen.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { join } from "node:path";

const SPIELE = fileURLToPath(new URL("../spiele/", import.meta.url));
const R = await import("../spiele/runde/runde.js");
const erweiterungen = readdirSync(SPIELE, { withFileTypes: true })
  .filter((e) => e.isDirectory() && e.name !== "runde")
  .map((e) => join(SPIELE, e.name, "runde.js"))
  .filter(existsSync);
for (const datei of erweiterungen) await import(pathToFileURL(datei).href);
R.pruefeBestand();

const { bestand, zeichne, ablauf } = R;
const { gelenkeFuer, ANSICHTEN } = await import("../spiele/runde/gelenke.js");
const KINDER = ["ela"];

test("die Runde ist angemeldet", () => {
  for (const id of KINDER) assert.ok(bestand.kinder.has(id), `${id} fehlt`);
});

test("kein Kind ist mehr Entwurf, jedes hat beide Ansichten", () => {
  for (const kind of bestand.kinder.values()) {
    assert.ok(!kind.entwurf, `${kind.id} ist noch Entwurf`);
    for (const a of ANSICHTEN) assert.ok(kind.ansichten[a], `${kind.id}: Ansicht ${a} fehlt`);
  }
});

test("Grundbestand aus figuren.md §4 ist da", () => {
  const haltungen = ["stehen", "zeigen", "fragen", "tragen", "tragen-gehen", "staunen", "freuen-klein", "freuen-gross",
    "nachdenken", "winken", "zaubern", "schweben", "klein", "gross"];
  for (const h of haltungen) assert.ok(bestand.haltungen.has(h), `Haltung ${h} fehlt`);
  for (const b of ["gehen", "winken", "huepfen", "zaubern", "schweben", "schrumpfen", "wachsen"]) {
    assert.ok(bestand.bewegungen.has(b), `Bewegung ${b} fehlt`);
  }
  for (const h of bestand.haltungen.values()) assert.ok(h.wort, `Haltung ${h.id} ohne wort für aria-label`);
});

test("jedes Kind kennt jedes Gesicht in jeder Ansicht", () => {
  for (const g of bestand.gesichter.values()) {
    for (const a of ANSICHTEN) assert.equal(typeof g.ansichten[a], "string", `Gesicht ${g.id} fehlt in ${a}`);
  }
});

test("jede Haltung mit jedem Zubehör lässt sich für jedes Kind zeichnen", () => {
  let n = 0;
  for (const kind of bestand.kinder.values()) {
    for (const a of ANSICHTEN) {
      if (!kind.ansichten[a]) continue;
      for (const h of bestand.haltungen.values()) {
        if (h.ansicht !== "beide" && h.ansicht !== a) continue;
        for (const zb of [[], ...[...bestand.zubehoer.keys()].map((z) => [z])]) {
          for (const gesicht of [undefined, ...bestand.gesichter.keys()]) {
            const wo = `${kind.id}/${a}/${h.id}/${zb.join("+") || "ohne"}/${gesicht ?? "-"}`;
            const svg = zeichne(kind.id, { ansicht: a, haltung: h.id, zubehoer: zb, gesicht });
            assert.doesNotMatch(svg, /undefined|NaN|\sid=/, wo);
            for (const g of gelenkeFuer(kind.bewegt)) assert.ok(svg.includes(`data-gelenk="${g}"`), `${wo}: ${g}`);
            n += 1;
          }
        }
      }
    }
  }
  assert.ok(n > 0);
});

test("jede Bewegung läuft für jedes Kind durch, kein Schritt über 1200 ms", () => {
  for (const kind of bestand.kinder.values()) {
    for (const b of bestand.bewegungen.values()) {
      if (!kind.ansichten[b.ansicht]) continue;
      const folge = ablauf(kind.id, b.id);
      assert.ok(folge.length > 1, `${kind.id}/${b.id}`);
      for (const s of folge) assert.ok(s.ms > 0 && s.ms <= 1200, `${kind.id}/${b.id}: ${s.ms} ms`);
    }
  }
});
