// Anleitungen „Mit echten Dingen“ (spiele/start/anleitung.js), docs/mit-echten-dingen.md: Markdown lesen, ohne Quellen
// anzeigen, Leichter/Schwerer als Umschalter; ohne Datei der Einzeiler aus dem Lernplan.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const { leseAnleitung, anleitungHtml, einzeilerHtml, anleitungPfad } = await import("../spiele/start/anleitung.js");
const MD = readFileSync(new URL("../spiele/mit-echten-dingen/mathe/abzaehlen.md", import.meta.url), "utf8");

test("leseAnleitung: Kopf, Titel, Ihr braucht, Schritte, Darauf kommt es an, Leichter, Schwerer, Passt gut", () => {
  const a = leseAnleitung(MD);
  assert.equal(a.kopf.thema, "abzaehlen");
  assert.equal(a.titel, "Gabeln zählen");
  assert.equal(a.braucht, "eine Besteckschublade");
  assert.deepEqual(a.schritte, ["Nehmt die Gabeln heraus und legt sie in eine Reihe.", "Zeigt beim Zählen auf jede Gabel genau einmal.", "Sagt am Ende, wie viele es sind."]);
  assert.equal(a.kern, "Die letzte Zahl beim Zählen sagt, wie viele Gabeln es sind.");
  assert.equal(a.leichter, "nur bis fünf.");
  assert.equal(a.schwerer, "erst schätzen, dann zählen.");
  assert.equal(a.passt, "beim Tischdecken, beim Einkauf-Auspacken.");
});

test("leseAnleitung: ohne Titel oder Schritte → null (dann gilt der Einzeiler)", () => {
  assert.equal(leseAnleitung("---\nthema: x\n---\nnur Text"), null);
  assert.equal(leseAnleitung(""), null);
});

test("anleitungHtml: nummerierte Schritte, Kern mit Sonnenring-Klasse, Umschalter Leichter/Schwerer, keine Quellen, escaped", () => {
  const h = anleitungHtml({ ...leseAnleitung(MD), titel: "A<b" });
  assert.match(h, /<h1>A&lt;b<\/h1>/);
  assert.match(h, /<section class="braucht"><h2>Ihr braucht<\/h2><p>eine Besteckschublade<\/p><\/section>/);
  assert.equal((h.match(/<li>/g) ?? []).length, 3);
  assert.match(h, /<ol class="schritte">/);
  assert.match(h, /<section class="kern"><h2>Darauf kommt es an<\/h2><p>Die letzte Zahl/);
  assert.match(h, /<button class="stufe" type="button" data-stufe="leichter" aria-pressed="false">Leichter<\/button>/);
  assert.match(h, /<button class="stufe" type="button" data-stufe="schwerer" aria-pressed="false">Schwerer<\/button>/);
  assert.match(h, /<p class="stufen-text" data-stufe="leichter" hidden>nur bis fünf\.<\/p>/);
  assert.match(h, /<section class="passt"><h2>Passt gut<\/h2><p>beim Tischdecken/);
  assert.doesNotMatch(h, /quellen|hinweis|---/);
});

test("einzeilerHtml und anleitungPfad", () => {
  assert.match(einzeilerHtml("Name", "Lassen Sie <b>"), /<h1>Name<\/h1><p class="einzeiler">Lassen Sie &lt;b&gt;<\/p>/);
  assert.equal(anleitungPfad("mathe", "abzaehlen"), "mit-echten-dingen/mathe/abzaehlen.md");
  assert.equal(anleitungPfad("mathe", "../x"), null);
});

test("Verzeichnis mit-echten-dingen/index.json nennt genau die vorhandenen Anleitungen; hatAnleitung fragt es ab", async () => {
  const { readdirSync } = await import("node:fs");
  const { hatAnleitung } = await import("../spiele/start/anleitung.js");
  const wurzel = new URL("../spiele/mit-echten-dingen/", import.meta.url);
  const index = JSON.parse(readFileSync(new URL("index.json", wurzel), "utf8"));
  const vorhanden = {};
  for (const e of readdirSync(wurzel, { withFileTypes: true }).filter((e) => e.isDirectory()))
    vorhanden[e.name] = readdirSync(new URL(`${e.name}/`, wurzel)).filter((f) => f.endsWith(".md")).map((f) => f.slice(0, -3)).sort();
  assert.deepEqual(Object.fromEntries(Object.entries(index).map(([f, l]) => [f, [...l].sort()])), vorhanden);
  assert.equal(hatAnleitung(index, "mathe", "abzaehlen"), true);
  assert.equal(hatAnleitung(index, "mathe", "rechnen-3"), false);
  assert.equal(hatAnleitung(null, "mathe", "abzaehlen"), false);
});
