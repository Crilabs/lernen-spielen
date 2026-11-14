import { test } from "node:test";
import assert from "node:assert/strict";
import { alsHtml, bloecke, trenneKopf, liesAnleitung, kurzform, inline, escape, SITUATIONEN } from "../spiele/rahmen/markdown.js";

test("Kopf wird abgetrennt: Werte, Listen, Wahrheitswerte; nie im HTML", () => {
  const { kopf, rumpf } = trenneKopf("---\nthema: zerlegen-7\nentwurf: true\nquellen:\n  - A, https://a.de\n  - B\n---\n# Titel\n");
  assert.deepEqual(kopf, { thema: "zerlegen-7", entwurf: true, quellen: ["A, https://a.de", "B"] });
  assert.equal(rumpf, "# Titel\n");
  const html = alsHtml("---\nquellen:\n  - geheim\n---\nText");
  assert.equal(html, "<p>Text</p>");
});

test("ohne Kopf bleibt alles Rumpf; Windows-Zeilenenden", () => {
  assert.deepEqual(trenneKopf("# A\r\nB"), { kopf: {}, rumpf: "# A\nB" });
});

test("Überschriften, Listen, fett, Absätze", () => {
  const md = "# Eins\n\n## Zwei\n\nIhr braucht: **sieben** Nudeln\nund zwei Teller\n\n1. erst\n2. dann\n   weiter\n\n- a\n* b\n\n### Drei";
  assert.equal(alsHtml(md),
    "<h1>Eins</h1>\n<h2>Zwei</h2>\n<p>Ihr braucht: <b>sieben</b> Nudeln und zwei Teller</p>\n<ol><li>erst</li><li>dann weiter</li></ol>\n<ul><li>a</li><li>b</li></ul>\n<h3>Drei</h3>");
  assert.equal(alsHtml("# A\n## B", { ebene: 3 }), "<h3>A</h3>\n<h4>B</h4>");
  assert.equal(alsHtml("### A", { ebene: 5 }), "<h6>A</h6>");
});

test("HTML-Einschleusung erscheint nur als Text", () => {
  const boese = "<script>alert(1)</script>\n\n**<img src=x onerror=alert(1)>**\n\n1. <a href=\"javascript:x\">x</a>\n\n# <b onclick='y'>";
  const html = alsHtml(boese);
  assert.doesNotMatch(html, /<script|<img|<a |onclick='|onerror=alert\(1\)>/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(html, /<b>&lt;img src=x onerror=alert\(1\)&gt;<\/b>/);
  assert.match(html, /&quot;javascript:x&quot;/);
  assert.match(html, /<h1>&lt;b onclick=&#39;y&#39;&gt;<\/h1>/);
  assert.equal(escape(`&<>"'`), "&amp;&lt;&gt;&quot;&#39;");
});

test("fett nur paarweise; ein einzelnes ** bleibt Text", () => {
  assert.equal(inline("a ** b"), "a ** b");
  assert.equal(inline("**a** und **b**"), "<b>a</b> und <b>b</b>");
});

test("leere Eingaben", () => {
  assert.equal(alsHtml(""), "");
  assert.deepEqual(bloecke(undefined), []);
});

test("liesAnleitung: Titel, Formen nach Situation, sortiert, Rest gehört zur Form", () => {
  const a = liesAnleitung("---\nthema: x\n---\n# Zählen\n\nVorweg.\n\n## Unterwegs: Steine\n\nText U\n\n## Am Tisch: Gabeln\n\nIhr braucht: Gabeln\n\n1. eins\n\n## Notiz\n\nmehr\n\n## am tisch: doppelt\n\n**Leichter:** a. **Schwerer:** b.");
  assert.equal(a.titel, "Zählen");
  assert.deepEqual(a.kopf, { thema: "x" });
  assert.deepEqual(a.vorspann, [{ typ: "p", text: "Vorweg." }]);
  assert.deepEqual(a.formen.map((f) => [f.situation, f.wort, f.name]), [["tisch", "Am Tisch", "Gabeln"], ["unterwegs", "Unterwegs", "Steine"]]);
  const tisch = a.formen[0];
  assert.equal(tisch.bloecke.length, 6); // Ihr braucht, Liste, ## Notiz, mehr, ## am tisch: doppelt, Leichter
  assert.deepEqual(kurzform(tisch).map((b) => b.typ), ["p", "ol", "h", "p", "h"]);
  assert.deepEqual(SITUATIONEN.map((s) => s.wort), ["Am Tisch", "In Bewegung", "Unterwegs"]);
});
