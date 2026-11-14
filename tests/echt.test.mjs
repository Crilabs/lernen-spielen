// Vorgaben an die Seite „Mit echten Dingen“ (spiele/echt.html), docs/mit-echten-dingen.md.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../spiele/echt.html", import.meta.url), "utf8");
const skript = html.slice(html.indexOf('<script type="module">'));

test("Mit echten Dingen: Kopfleiste mit Titel, Fach des Themas, Thema als Unterzeile", () => {
  assert.match(html, /<ls-leiste id="leiste" spiel="ansichten" titel="Mit echten Dingen"><\/ls-leiste>/);
  assert.match(skript, /leiste\.setAttribute\("fach", thema\.strang\)/);
  assert.match(skript, /leiste\.setAttribute\("thema", thema\.name\)/);
});

test("Mit echten Dingen: Anleitung aus der Datei, sonst der Einzeiler aus dem Lernplan", () => {
  assert.match(skript, /anleitungPfad\(thema\.strang, thema\.id\)/);
  assert.match(skript, /leseAnleitung\(/);
  assert.match(skript, /anleitungHtml\(/);
  assert.match(skript, /einzeilerHtml\(thema\.name, thema\.eltern\)/);
});

test("Mit echten Dingen: Leichter und Schwerer als Umschalter, eine Stufe zur Zeit", () => {
  assert.match(skript, /\.stufe/);
  assert.match(skript, /aria-pressed/);
});

test("Mit echten Dingen: wird nicht vorgelesen, schreibt nichts", () => {
  assert.doesNotMatch(skript, /\bsprich\(/);
  assert.doesNotMatch(skript, /speichere\(|markiereGekonnt|verbucheErgebnis|localStorage/);
});
