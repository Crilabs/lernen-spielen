// Darstellung der Anleitungen „Mit echten Dingen“ auf echt.html (spiele/start/anleitung.js), docs/mit-echten-dingen.md:
// Formen nach Situation aus dem gemeinsamen Leser (rahmen/markdown.js) in den festen Aufbau der Seite, ohne Quellen,
// Leichter/Schwerer als Umschalter je Form, Wahl der Situation nur bei mehr als einer Form; ohne Datei der Einzeiler.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const { formTeile, anleitungHtml, einzeilerHtml } = await import("../spiele/start/anleitung.js");
const { liesAnleitung } = await import("../spiele/rahmen/markdown.js");
const MD = readFileSync(new URL("../spiele/mit-echten-dingen/mathe/zerlegen-2.md", import.meta.url), "utf8");
const A = liesAnleitung(MD);

test("formTeile: Ihr braucht, Schritte, Darauf kommt es an, Leichter, Schwerer aus den Blöcken einer Form", () => {
  const t = formTeile(A.formen[0]);
  assert.equal(t.braucht, "zwei Nudeln, zwei Teller");
  assert.equal(t.schritte.length, 4);
  assert.match(t.kern, /^Es sind immer zwei Nudeln\./);
  assert.match(t.leichter, /^Legt die Nudeln einzeln/);
  assert.match(t.schwerer, /^Probiert es mit drei Nudeln/);
  assert.deepEqual(t.weiteres, []);
});

test("formTeile: Passt gut und unbekannte Blöcke", () => {
  const a = liesAnleitung("# T\n\n## Am Tisch: X\n\nIhr braucht: Stift\n\n1. a\n\nNoch ein Satz.\n\n**Darauf kommt es an:** K **Passt gut:** beim Essen");
  const t = formTeile(a.formen[0]);
  assert.equal(t.kern, "K");
  assert.equal(t.passt, "beim Essen");
  assert.deepEqual(t.weiteres, [{ typ: "p", text: "Noch ein Satz." }]);
});

test("anleitungHtml: Titel, Wahl der Situation, gewählte Form sichtbar, Sonnenring, Umschalter, keine Quellen, escaped", () => {
  const h = anleitungHtml({ ...A, titel: "A<b" }, "unterwegs");
  assert.match(h, /^<h1>A&lt;b<\/h1>/);
  assert.match(h, /<div class="formwahl" role="group" aria-label="Wo spielt ihr\?">/);
  assert.match(h, /<button class="form-knopf" type="button" data-situation="tisch" aria-pressed="false"><img src="symbole\/tisch\.svg" alt=""><span>Am Tisch<\/span><\/button>/);
  assert.match(h, /data-situation="unterwegs" aria-pressed="true"/);
  assert.match(h, /<div class="form" data-situation="tisch" hidden><p class="form-name">Zwei Nudeln, zwei Teller<\/p>/);
  assert.match(h, /<div class="form" data-situation="unterwegs"><p class="form-name">/);
  assert.match(h, /<section class="braucht"><h2>Ihr braucht<\/h2><p>zwei Nudeln, zwei Teller<\/p><\/section>/);
  assert.match(h, /<ol class="schritte"><li>/);
  assert.match(h, /<section class="kern"><h2>Darauf kommt es an<\/h2>/);
  assert.match(h, /<button class="stufe" type="button" data-stufe="leichter" aria-pressed="false">Leichter<\/button>/);
  assert.match(h, /<p class="stufen-text" data-stufe="schwerer" hidden>/);
  assert.doesNotMatch(h, /pikas|quellen|abgerufen/i);
});

test("anleitungHtml: ohne Wunsch die erste Form; eine Form ohne Wahl", () => {
  assert.match(anleitungHtml(A), /data-situation="tisch" aria-pressed="true"/);
  const eine = liesAnleitung("# T\n\n## In Bewegung: Treppe\n\nIhr braucht: eine Treppe\n\n1. Geht hinauf.");
  const h = anleitungHtml(eine, "tisch");
  assert.doesNotMatch(h, /formwahl/);
  assert.match(h, /<div class="form" data-situation="bewegung"><p class="form-name">Treppe<\/p>/);
});

test("einzeilerHtml: Name und Einzeiler, escaped", () => {
  assert.equal(einzeilerHtml("A<b", "x & y"), '<h1>A&lt;b</h1><p class="einzeiler">x &amp; y</p>');
});
