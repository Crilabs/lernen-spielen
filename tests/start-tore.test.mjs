// Tore der Startseite (spiele/start/tore.js): ein Dran-Spiel als Tor mit gezeichneter Weltandeutung.
// Spec docs/superpowers/specs/2026-11-14-startseite-treffpunkt-design.md §5.2.
import { test } from "node:test";
import assert from "node:assert/strict";

const { torHtml } = await import("../spiele/start/tore.js");
const { ANDEUTUNGEN } = await import("../spiele/start/welten/index.js");

const spiel = (welt) => ({ titel: "Zwei Tonnen", symbol: "symbole/test.svg", datei: "m14-zwei-tonnen.html", ...(welt ? { welt } : {}) });
const dran = (welt, extra = {}) => ({ id: "zerlegen 5", name: "Die 5 zerlegen", strang: "mathe", spiel: { ...spiel(welt), ...extra } });

test("Tor: Link ins Spiel mit ?thema, Name fürs Vorlesen, Spielname und Thema", () => {
  const h = torHtml(dran());
  assert.match(h, /^<a class="tor" href="m14-zwei-tonnen\.html\?thema=zerlegen%205"/);
  assert.match(h, /aria-label="Zwei Tonnen, Die 5 zerlegen"/);
  assert.match(h, /<b>Zwei Tonnen<\/b>/);
  assert.match(h, /<span class="thema">Die 5 zerlegen<\/span>/);
  assert.match(h, /<img src="symbole\/test\.svg" alt="">/);
});

test("Tor: Fachfarben als Variablen, Himmel im Bogen in der Fachtönung", () => {
  const h = torHtml(dran());
  assert.match(h, /--fach-fuellung:#F06BB0/);
  assert.match(h, /--fach-toenung:#FFE6F2/);
});

test("Tor: mit bekannter Welt die Andeutung, sonst nur Himmel und Symbol", () => {
  assert.ok(ANDEUTUNGEN["muell-trennen"], "Beispiel muell-trennen fehlt");
  assert.ok(ANDEUTUNGEN["wiese-und-hecke"], "Beispiel wiese-und-hecke fehlt");
  const mit = torHtml(dran("muell-trennen"));
  assert.match(mit, /data-welt="muell-trennen"/);
  assert.ok(mit.includes(ANDEUTUNGEN["muell-trennen"]));
  for (const ohne of [torHtml(dran()), torHtml(dran("gibt-es-nicht"))]) {
    assert.doesNotMatch(ohne, /data-welt/);
    assert.ok(!Object.values(ANDEUTUNGEN).some((a) => ohne.includes(a)));
  }
});

test("Tor: Texte werden escaped", () => {
  const h = torHtml(dran(undefined, { titel: "A<b" }));
  assert.match(h, /<b>A&lt;b<\/b>/);
  assert.doesNotMatch(h, /<b>A<b/);
});

test("Weltandeutungen: kein Text, Kontur nur Tinte", () => {
  for (const [welt, a] of Object.entries(ANDEUTUNGEN)) {
    assert.doesNotMatch(a, /<text/, welt);
    const fremd = [...a.matchAll(/stroke="([^"]+)"/g)].map((m) => m[1]).filter((s) => s !== "#3B2A6B" && s !== "none");
    assert.deepEqual(fremd, [], welt);
  }
});
