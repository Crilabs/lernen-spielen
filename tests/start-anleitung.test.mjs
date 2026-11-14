// Darstellung der Anleitungen „Mit echten Dingen“ auf echt.html (spiele/start/anleitung.js), docs/mit-echten-dingen.md:
// Formen nach Situation aus dem gemeinsamen Leser (rahmen/markdown.js) in den festen Aufbau der Seite, ohne Quellen,
// Leichter/Schwerer als Umschalter je Form, Wahl der Situation nur bei mehr als einer Form; ohne Datei der Einzeiler.
import { test } from "node:test";
import assert from "node:assert/strict";

const { formTeile, anleitungHtml, einzeilerHtml } = await import("../spiele/start/anleitung.js");
const { liesAnleitung } = await import("../spiele/rahmen/markdown.js");
// Feste Anleitung (frühere Fassung von mathe/zerlegen-2.md, heute Familie mathe/zerlegen.md), damit der Test nicht vom
// Wortlaut einer echten Datei abhängt.
const MD = "---\nthema: zerlegen-2\nfach: mathe\nquellen:\n  - Zahlen zerlegen, PIKAS, DZLM, https://pikas.dzlm.de/, abgerufen 2026-11-14\n---\n# Die 2 in zwei Teile legen\n\n## Am Tisch: Zwei Nudeln, zwei Teller\n\nIhr braucht: zwei Nudeln, zwei Teller\n\n1. Legt die zwei Nudeln gemeinsam auf die zwei Teller, wie ihr wollt.\n2. Sagt zusammen, was ihr seht, zum Beispiel: „2 ist gleich 1 plus 1.“\n3. Legt sie anders hin und sagt es wieder. Auch beide auf einen Teller geht: „2 ist gleich 2 plus 0.“\n4. Findet alle Arten, die zwei Nudeln zu verteilen.\n\n**Darauf kommt es an:** Es sind immer zwei Nudeln. Die Teile sind 1 und 1, oder 2 und 0. 2 plus 0 und 0 plus 2 sind zwei Arten, weil die Teller verschieden liegen.\n\n**Leichter:** Legt die Nudeln einzeln und zählt laut. **Schwerer:** Probiert es mit drei Nudeln.\n\n## Unterwegs: Zwei Steine in zwei Händen\n\nIhr braucht: zwei kleine Steine, Kastanien oder Blätter vom Weg\n\n1. Sammelt unterwegs zwei Dinge.\n2. Haltet beide Hände offen. Legt die zwei Dinge gemeinsam in die Hände, zum Beispiel eins links und eins rechts.\n3. Schaut hin und sagt zusammen, wie viele in jeder Hand liegen.\n4. Legt um: beide in die linke Hand. Sagt wieder, was ihr seht. Tauscht dann, wer die Hände hält.\n\n**Darauf kommt es an:** Beide Hände zusammen haben immer zwei. Wenn die eine Hand eins hat, hat die andere auch eins. Ist eine Hand leer, hat die andere zwei.\n\n**Leichter:** Legt die Dinge einzeln in die Hände und zählt laut. **Schwerer:** Schließt die Hände zur Faust. Überlegt gemeinsam, wie zwei Dinge in den Fäusten liegen könnten, und öffnet dann beide.\n";
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
