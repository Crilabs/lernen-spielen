// PDF je Thema „Mit echten Dingen“ (docs/superpowers/specs/2026-11-14-echte-dinge-pdf-je-thema-design.md): das Blatt
// als HTML, ohne DOM.
import { test } from "node:test";
import assert from "node:assert/strict";
import { liesAnleitung } from "../spiele/rahmen/markdown.js";
import { blattHtml, blattTitel } from "../spiele/rahmen/echte-dinge-blatt.js";

const form = (wort, name) => `## ${wort}: ${name}\n\nIhr braucht: zwei Nudeln\n\n1. Erst das.\n2. Dann das.\n\n`
  + "**Darauf kommt es an:** Es bleiben zwei.\n\n**Leichter:** mit einer. **Schwerer:** mit drei.\n\n";
const DREI = liesAnleitung(`---\nthema: probe\n---\n# Probe\n\n${form("Unterwegs", "Steine")}${form("Am Tisch", "Nudeln")}${form("In Bewegung", "Hüpfen")}`);
const SVG = '<svg viewBox="0 0 100 100" fill="none" stroke="#fff" stroke-width="9"><path d="M1 1"/></svg>';

test("Blatt: alle Formen in der Reihenfolge Am Tisch, In Bewegung, Unterwegs, voll mit Leichter und Schwerer", () => {
  const html = blattHtml({ name: "Die 2 zerlegen", titel: "Die 2 in zwei Teile legen", fach: "mathe", formen: DREI.formen });
  const koepfe = [...html.matchAll(/<h2>[\s\S]*?<\/h2>/g)].map((m) => m[0].replace(/<[^>]+>/g, "").trim());
  assert.deepEqual(koepfe, ["Am Tisch: Nudeln", "In Bewegung: Hüpfen", "Unterwegs: Steine"]);
  assert.equal(html.match(/<article class="form">/g)?.length, 3);
  assert.match(html, /<h1>Die 2 zerlegen<\/h1>/);
  assert.match(html, /Die 2 in zwei Teile legen/);
  assert.match(html, /<b>Ihr braucht:<\/b>/);
  assert.match(html, /class="kern"><b>Darauf kommt es an:<\/b>/);
  assert.match(html, /<b>Leichter:<\/b>[\s\S]*<b>Schwerer:<\/b>/);
  assert.match(html, /<img src="symbole\/tisch\.svg" alt="">/);
});

test("Blatt: Fachfarbe aus dem Tief-Ton, ohne Fach zurück auf Tinte; Fachsymbol in der Fachfarbe, ohne Fläche", () => {
  const mathe = blattHtml({ name: "A", titel: "", fach: "mathe", formen: DREI.formen, fachSvg: SVG });
  assert.match(mathe, /--fach:\s*#B8327A/);
  assert.match(mathe, /stroke="#B8327A"/);
  assert.doesNotMatch(mathe, /stroke="#fff"/);
  const ohne = blattHtml({ name: "A", titel: "", fach: "unbekannt", formen: DREI.formen });
  assert.match(ohne, /--fach:\s*#3B2A6B/);
  assert.doesNotMatch(ohne, /undefined/);
});

test("Blatt: Namen werden escaped", () => {
  const html = blattHtml({ name: "<b>&", titel: "x<y", fach: "mathe", formen: DREI.formen });
  assert.match(html, /<h1>&lt;b&gt;&amp;<\/h1>/);
  assert.match(html, /x&lt;y/);
});

test("Titel des Dokuments beim Drucken (Dateiname des PDFs)", () => {
  assert.equal(blattTitel("Die 2 zerlegen"), "Mit echten Dingen – Die 2 zerlegen");
});

test("Blatt: „Zum Verinnerlichen“ steht als „Erst verstehen, dann verinnerlichen“ vorn in der Form", () => {
  const a = liesAnleitung("# T\n\n## In Bewegung: Hüpfen\n\n**Zum Verinnerlichen:** Spielt erst „Teller“.\n\nIhr braucht: Platz\n\n1. a\n2. b\n\n**Darauf kommt es an:** K\n\n**Leichter:** l **Schwerer:** s");
  const h = blattHtml({ name: "N", titel: "", fach: "mathe", formen: a.formen });
  assert.match(h, /<div class="links"><p class="verinnerlichen"><b>Erst verstehen, dann verinnerlichen:<\/b> Spielt erst „Teller“\.<\/p>/);
});
