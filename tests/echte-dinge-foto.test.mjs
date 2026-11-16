// Foto der Anleitungen „Mit echten Dingen“ (docs/mit-echten-dingen.md „Foto der Anleitung“, Christian 2026-11-16):
// auf den Karten mit dem Siegel „echt“, auf der Seite der Anleitung und im PDF ohne Siegel; ohne Foto das alte Bild.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { liesAnleitung } from "../spiele/rahmen/markdown.js";
import { blattHtml } from "../spiele/rahmen/echte-dinge-blatt.js";
import { echtBildHtml, echtKarteHtml } from "../spiele/start/karten.js";
import { anleitungHtml } from "../spiele/start/anleitung.js";
import { fotoUrl, SIEGEL } from "../spiele/rahmen/echte-dinge.js";

const A = liesAnleitung("---\nthema: probe\nfach: mathe\nfoto: bilder/probe.webp\n---\n# Probe\n\n## Am Tisch: Teller\n\nIhr braucht: Teller\n\n1. A.\n2. B.\n\n**Darauf kommt es an:** K.\n\n**Leichter:** L. **Schwerer:** S.\n");

test("fotoUrl: nur ein Pfad <fach>/bilder/<name>.webp unter spiele/mit-echten-dingen/, sonst leer", () => {
  assert.match(fotoUrl({ foto: "mathe/bilder/probe.webp" }), /\/spiele\/mit-echten-dingen\/mathe\/bilder\/probe\.webp$/);
  for (const foto of [undefined, "", "mathe/bilder/", "../x/bilder/a.webp", "mathe/bilder/a.png", "javascript:a"])
    assert.equal(fotoUrl({ foto }), "", String(foto));
  assert.equal(fotoUrl(null), "");
  assert.ok(existsSync(new URL(SIEGEL)), "Siegel liegt in spiele/symbole/");
});

test("Karte: mit Foto das Foto und das Siegel „echt“, ohne Foto die Hand", () => {
  const mit = echtKarteHtml({ thema: { id: "t", name: "T" } }, "mathe", "Titel", "f.webp");
  assert.match(mit, /<span class="bild foto"><img class="foto" src="f\.webp" alt=""><img class="siegel" src="symbole\/siegel-echt\.svg" alt=""><\/span>/);
  assert.doesNotMatch(mit, /hand\.svg/);
  assert.match(echtBildHtml(), /symbole\/hand\.svg/);
  assert.doesNotMatch(echtBildHtml(), /siegel/);
  assert.match(echtBildHtml('"><x'), /src="&quot;&gt;&lt;x"/);
});

test("Seite und PDF: das Foto ohne Siegel", () => {
  const seite = anleitungHtml(A, "", "symbole/", "f.webp");
  assert.match(seite, /^<img class="foto" src="f\.webp" alt=""><h1>Probe<\/h1>/);
  assert.doesNotMatch(seite, /siegel/);
  assert.doesNotMatch(anleitungHtml(A), /class="foto"/);
  const blatt = blattHtml({ name: "N", titel: "Probe", fach: "mathe", formen: A.formen, foto: "f.webp" });
  assert.match(blatt, /<img class="foto" src="f\.webp" alt=""><\/header>/);
  assert.doesNotMatch(blatt, /siegel/);
  assert.doesNotMatch(blattHtml({ name: "N", titel: "Probe", fach: "mathe", formen: A.formen }), /class="foto"/);
});

test("Startseite, Regal, Kachel, Elternbereich und Karte zeigen das Foto aus dem Verzeichnis", () => {
  const lies = (p) => readFileSync(new URL(`../spiele/${p}`, import.meta.url), "utf8");
  assert.match(lies("index.html"), /a\.querySelector\("\.bild"\)\.outerHTML = echtBildHtml\(fotoUrl\(e\)\)/);
  assert.match(lies("regal.html"), /fach, anleitung\?\.titel, fotoUrl\(anleitung\)\)/);
  assert.match(lies("rahmen/echte-dinge-kachel.js"), /const foto = form \? fotoUrl\(e\) : ""/);
  assert.match(lies("eltern.html"), /const foto = fotoUrl\(ed\);/);
  assert.match(lies("rahmen/anregung.js"), /fotoUrl\(\{ foto: `\$\{ort\.fach\}\/\$\{anleitung\.kopf\.foto/);
  assert.match(lies("echt.html"), /anleitungHtml\(anleitung, await letzteForm\(\), "symbole\/", foto\)/);
});
