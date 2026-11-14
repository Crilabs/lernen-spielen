// Prüft alle Schriftvorlagen in spiele/schrift/vorlagen/ (Spec 2026-11-14-schriftvorlagen, 5.2–5.4, 5.6).
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { leseFormSvg } from "../spiele/kern/vorlagen/svg.js";
import { tastePfadAb } from "../spiele/kern/vorlagen/pfad.js";

const ORDNER = fileURLToPath(new URL("../spiele/schrift/vorlagen/", import.meta.url));
const raster = JSON.parse(readFileSync(join(ORDNER, "raster.json"), "utf8"));
const liste = JSON.parse(readFileSync(join(ORDNER, "liste.json"), "utf8"));
const TOLERANZ = 8;
const ARTEN = ["unten", "oben", "oval", "keiner"];

/** y-Bereich eines Bandes */
const BAENDER = {
  oben: [raster.oberlaenge, raster.mitte],
  mitte: [raster.mitte, raster.grund],
  unten: [raster.grund, raster.unterlaenge],
};

test("Raster: 1 : 1 : 1, Höhe 300", () => {
  assert.equal(raster.hoehe, 300);
  assert.equal(raster.mitte - raster.oberlaenge, raster.grund - raster.mitte);
  assert.equal(raster.unterlaenge - raster.grund, raster.grund - raster.mitte);
  assert.ok(raster.abstand > 0 && raster.wortabstand > raster.abstand);
});

test("Liste: jeder Satz bekannt, Zeichen eindeutig je Satz, Freigabe als Datum", () => {
  const gesehen = new Set();
  for (const f of liste.formen) {
    assert.ok(Object.hasOwn(liste.saetze, f.satz), `${f.satz}/${f.zeichen}: unbekannter Satz`);
    const k = `${f.satz}/${f.zeichen}`;
    assert.ok(!gesehen.has(k), `${k} doppelt`);
    gesehen.add(k);
    assert.ok(f.freigegeben === null || /^\d{4}-\d{2}-\d{2}$/.test(f.freigegeben), `${k}: freigegeben`);
  }
});

for (const f of liste.formen) {
  const k = `${f.satz}/${f.zeichen}`;
  test(`Form ${k}`, () => {
    const pfad = join(ORDNER, f.datei);
    assert.ok(existsSync(pfad), `${k}: Datei ${f.datei} fehlt`);
    const roh = leseFormSvg(readFileSync(pfad, "utf8"));
    assert.equal(roh.hoehe, raster.hoehe, `${k}: Höhe der viewBox`);
    assert.ok(roh.breite > 0, `${k}: Breite`);
    assert.equal(roh.zeichen, f.zeichen, `${k}: data-zeichen`);
    assert.equal(roh.satz, f.satz, `${k}: data-satz`);
    assert.deepEqual(roh.fremd, [], `${k}: nur <path>`);
    assert.deepEqual(roh.fuellung, [], `${k}: keine Füllung`);
    assert.deepEqual(
      roh.striche.map((s) => s.nummer),
      roh.striche.map((_, i) => i + 1),
      `${k}: data-strich lückenlos ab 1`,
    );
    assert.equal(roh.striche.length, f.striche, `${k}: Strichzahl laut Liste`);

    const erlaubt = f.band.map((b) => BAENDER[b]);
    const yMin = Math.min(...erlaubt.map((b) => b[0])) - TOLERANZ;
    const yMax = Math.max(...erlaubt.map((b) => b[1])) + TOLERANZ;
    const punkte = roh.striche.map((s) => tastePfadAb(s.d, 2));
    for (const [i, p] of punkte.entries())
      for (const q of p) {
        assert.ok(q.y >= yMin && q.y <= yMax, `${k}: Strich ${i + 1} verlässt die Bänder ${f.band} (y=${q.y.toFixed(1)})`);
        assert.ok(q.x >= -TOLERANZ && q.x <= roh.breite + TOLERANZ, `${k}: Strich ${i + 1} außerhalb der Breite`);
      }

    if (f.spiegel !== null) {
      const partner = liste.formen.find((g) => g.satz === f.satz && g.zeichen === f.spiegel);
      assert.ok(partner, `${k}: Spiegelpartner ${f.spiegel} fehlt`);
      assert.equal(partner.spiegel, f.zeichen, `${k}: Spiegelpartner verweist nicht zurück`);
    }

    const verbunden = liste.saetze[f.satz].verbunden;
    if (!verbunden) {
      assert.equal(f.eingang, null, `${k}: Eingang nur in verbundenen Sätzen`);
      assert.equal(f.ausgang, null, `${k}: Ausgang nur in verbundenen Sätzen`);
      return;
    }
    assert.ok(ARTEN.includes(f.eingang), `${k}: Eingang ${f.eingang}`);
    assert.ok(ARTEN.includes(f.ausgang) && f.ausgang !== "oval", `${k}: Ausgang ${f.ausgang}`);
    // Eingang unten und oval beginnen mit eigenem Anstrich auf der Grundlinie; oben an der Mittellinie.
    const hoehe = (art) => (art === "unten" || art === "oval" ? raster.grund : raster.mitte);
    const zug = roh.striche.map((s, i) => ({ s, p: punkte[i] })).filter((z) => !z.s.luft);
    assert.ok(zug.length > 0, `${k}: mindestens ein Strich ohne data-luft`);
    if (f.eingang !== "keiner") {
      const y = zug[0].p[0].y;
      assert.ok(Math.abs(y - hoehe(f.eingang)) <= TOLERANZ, `${k}: Eingang ${f.eingang}, Start bei y=${y}`);
    }
    if (f.ausgang !== "keiner") {
      const y = zug[zug.length - 1].p.at(-1).y;
      assert.ok(Math.abs(y - hoehe(f.ausgang)) <= TOLERANZ, `${k}: Ausgang ${f.ausgang}, Ende bei y=${y}`);
    }
  });
}

test("jede SVG im Ordner steht in der Liste", () => {
  const bekannt = new Set([...liste.formen.map((f) => f.datei), ...liste.sonderverbindungen.map((v) => v.datei)]);
  for (const satz of Object.keys(liste.saetze)) {
    const ordner = join(ORDNER, satz);
    if (!existsSync(ordner)) continue;
    for (const name of readdirSync(ordner).filter((n) => n.endsWith(".svg")))
      assert.ok(bekannt.has(`${satz}/${name}`), `${satz}/${name} fehlt in liste.json`);
  }
});

test("Sonderverbindungen: verbundener Satz, Datei lesbar, ein Strich", () => {
  for (const v of liste.sonderverbindungen) {
    assert.ok(liste.saetze[v.satz]?.verbunden, `${v.datei}: Satz nicht verbunden`);
    assert.match(v.datei, new RegExp(`^${v.satz}/verbindung-[a-z]+-[a-z]+\\.svg$`));
    const roh = leseFormSvg(readFileSync(join(ORDNER, v.datei), "utf8"));
    assert.equal(roh.striche.length, 1, `${v.datei}: genau ein Strich`);
    tastePfadAb(roh.striche[0].d);
  }
});
