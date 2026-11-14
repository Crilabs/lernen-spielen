import { test } from "node:test";
import assert from "node:assert/strict";
import { leseFormSvg } from "../spiele/kern/vorlagen/svg.js";

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 300" data-zeichen="i" data-satz="sas">
  <!-- Anstrich und Abstrich -->
  <path data-strich="1" d="M 0 200 L 60 100 L 60 200" fill="none"/>
  <path data-strich="2" data-luft="ja" d="M 60 70 L 60 72" />
</svg>`;

test("liest Maße, Kennung und Striche in Dokumentreihenfolge", () => {
  const f = leseFormSvg(SVG);
  assert.equal(f.breite, 120);
  assert.equal(f.hoehe, 300);
  assert.equal(f.zeichen, "i");
  assert.equal(f.satz, "sas");
  assert.deepEqual(
    f.striche.map((s) => [s.nummer, s.luft, s.d]),
    [
      [1, false, "M 0 200 L 60 100 L 60 200"],
      [2, true, "M 60 70 L 60 72"],
    ],
  );
  assert.deepEqual(f.fremd, []);
  assert.deepEqual(f.fuellung, []);
});

test("meldet fremde Elemente und Füllung", () => {
  const f = leseFormSvg(`<svg viewBox="0 0 10 300" data-zeichen="x" data-satz="t"><g><path data-strich="1" d="M 0 0 L 1 1" fill="red"/></g><circle r="2"/></svg>`);
  assert.deepEqual(f.fremd, ["g", "circle"]);
  assert.deepEqual(f.fuellung, [1]);
});

test("ohne viewBox wirft", () => {
  assert.throws(() => leseFormSvg(`<svg data-zeichen="x"></svg>`), /viewBox/);
});
