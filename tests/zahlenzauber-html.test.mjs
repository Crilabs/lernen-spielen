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
test("Dritte Zahl ist immer eine Behauptung: löst nur bei wahrer Rechnung, wird nie neuer Partner", () => {
  const tipp = html.slice(html.indexOf("function tipp(i)"), html.indexOf("function nachStart()"));
  assert.match(tipp, /B\.nums\[i\]===paarWert\(A,P\) && istLoesung\(A,P,i\)\) return geloest\(\)/);
  assert.match(tipp, /return verpasst\(i\);\s*\}\s*$/);
  assert.equal((tipp.match(/waehlePartner\(i\)/g)||[]).length, 1, "nur bei Start ohne Partner");
});
test("Tipp-Leuchten färbt das Blatt nicht wie ein angetipptes, Hilfe wählt nichts aus", () => {
  assert.doesNotMatch(html, /\.blatt\.zeig \.form path\{fill:/);
  const hilfe = html.slice(html.indexOf('$("hilfe").addEventListener'), html.indexOf("function nachtippen"));
  assert.doesNotMatch(hilfe, /B\.start=/);
});

// Lernsteuerung (Task 8): Aufgaben kommen von runde(), kein eigener Aufstieg, kein eigener Lernstand
test("Lernsteuerung statt eigener Stufen", () => {
  assert.match(html, /import \{[^}]*\brunde\b[^}]*\} from "\.\/lernsteuerung\.js"/);
  assert.match(html, /import \{[^}]*\bspieleEinfuehrung\b[^}]*\} from "\.\/einfuehrung\.js"/);
  assert.doesNotMatch(html, /pruefeAufstieg|STUFEN|istMinusDran|waehleFakt|plusPool|minusPool|save\.fakten/);
  assert.match(html, /<script src="figuren\/figuren\.js"><\/script>/);
  assert.match(html, /<script src="figuren\/einhorn\.js"><\/script>/);
  assert.match(html, /\.naechste\(\)/);
  assert.match(html, /\.melde\(B\.key, \{ok, hilfe, ms\}\)/);
  assert.match(html, /max = ziel\.daten\.raum|ziel\.daten\.raum/);
});
test("Hilfe für die Lernsteuerung: 2 nach gezeigter Lösung, 1 nach Denkhilfe oder Durchprobieren", () => {
  assert.match(html, /const hilfe = B\.loesungGezeigt \? 2 : \(B\.hilfe>0 \|\| B\.fehler>=2 \|\| B\.probiert\.size>=RATEN_AB\) \? 1 : 0/);
});
test("Einführung vor der ersten Aufgabe, gesehen erst nach „gesehen“", () => {
  assert.match(html, /einfuehrungFaellig[\s\S]*spieleEinfuehrung\([\s\S]*[!=]== ?"gesehen"[\s\S]*einfuehrungGesehen\(\)[\s\S]*naechste\(\)/);
});
test("Spieleigener Stand unter zahlenzauber-spiel, der alte Stand wird nie geschrieben", () => {
  assert.match(html, /const SPEICHER = "zahlenzauber-spiel"/);
  assert.doesNotMatch(html, /speichere\("zahlenzauber"/);
  assert.match(html, /blumenJeThema/);
  assert.match(html, /EINSTIEG = 6/);
});
test("Vorschau und Elternansicht schreiben nie", () => {
  assert.match(html, /nurAnsehen: vorschau/);
  assert.match(html, /function persist\(\)\{ if\(!vorschau\)/);
  assert.match(html, /if\(params\.has\("eltern"\)\)\{[^\n]*return; \}/);
  const eltern = html.indexOf('if(params.has("eltern"))'), r = html.indexOf("await runde(");
  assert.ok(eltern > 0 && r > eltern, "Elternansicht kehrt vor runde() zurück");
  assert.doesNotMatch(html, /stufeMinus|stufePlus/);
  assert.match(html, /href="eltern\.html"/);
});
test("Gekonnt ruhig: Stimme ohne Zahl, Name mit Ziffer in der Blase", () => {
  assert.match(html, /sprich\("Das kannst du jetzt\."\)/);
  assert.match(html, /sag\(`\$\{[^}]*name[^}]*\} kannst du jetzt\.`\)/);
  assert.match(html, /\/\\d\/\.test\(text\)/);   // sprich() spricht nie etwas mit Ziffern
});
test("nach einer Wiederholungsrunde: Hinweis auf das Spiel mit Neuem", () => {
  assert.match(html, /hinweisSpiel/);
  assert.match(html, /sprich\(sp\.titel\)/);
});
