// Zahlenzauber: Vorgaben, die im HTML stecken (Schrift, keine Zufallsbesuche, Effektzeiten, Hilfe-Leiter)
import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const html = readFileSync(new URL("../spiele/zahlenzauber.html", import.meta.url), "utf8");

test("Schrift 700 nur in Überschriften", () => {
  const treffer = html.split("\n").filter(z => /font(-weight)?:\s*700/.test(z));
  for(const z of treffer) assert.match(z, /^\.eltern h1/, "700 nur für Überschriften: " + z.trim());
});
test("keine Zufallsbesuche, kein Einhorn-Einzug, kein Füllbalken", () => {
  assert.doesNotMatch(html, /BESUCH|EINZUG|zieht auf deine Wiese|id="pbar"/);
});
test("Effektzeiten nach der Lösung kurz, Lektion nur nach Fehler/Hilfe", () => {
  assert.match(html, /await wait\(600\);\r?\n\s*\/\/ Einhorn läuft/);
  assert.match(html, /if\(lernen\) await lektion/);
  assert.match(html, /const lernen = !ok/);
  assert.match(html, /LEKTION_MS = 3000/);
});
test("Hilfe-Leiter: Durchprobieren zählt nicht als gekonnt", () => {
  assert.match(html, /B\.probiert\.size<RATEN_AB/);
  assert.match(html, /B\.fehler===1[\s\S]*B\.fehler===2[\s\S]*loesungZeigen/);
});
