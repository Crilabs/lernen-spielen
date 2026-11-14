// Fach-Knöpfe der Startseite (spiele/start/faecher.js): Navigation am linken Rand, ein Knopf je Fach mit Spielen.
import { test } from "node:test";
import assert from "node:assert/strict";

const { faecherHtml } = await import("../spiele/start/faecher.js");

const FAECHER = [{ id: "mathe", name: "Mathe" }, { id: "lesen", name: "Lesen" }, { id: "sprechen", name: "Sprechen und Zuhören" }];

test("Fach-Knöpfe: ein Knopf je Fach, in der gegebenen Reihenfolge, Link zur Fach-Seite", () => {
  const h = faecherHtml(FAECHER);
  const links = [...h.matchAll(/<a class="fach" href="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(links, ["themen.html?fach=mathe", "themen.html?fach=lesen", "themen.html?fach=sprechen"]);
  assert.match(h, /aria-label="Mathe"/);
  assert.match(h, /<b>Sprechen und Zuhören<\/b>/);
});

test("Fach-Knöpfe: Fachsymbol als Maske auf der Fachfüllung, Schatten im Fach-Tief; Sprechen (ohne Symbol) ohne Zeichen", () => {
  const knoepfe = faecherHtml(FAECHER).split("</a>").filter(Boolean);
  assert.match(knoepfe[0], /<i style="--bild:url\('symbole\/mathe\.svg'\)"><\/i>/);
  assert.match(knoepfe[0], /--fach-fuellung:#F06BB0;--fach-tief:#B8327A/);
  assert.doesNotMatch(knoepfe[2], /<i /);
});

test("Fach-Knöpfe: keine Fächer, kein Knopf", () => {
  assert.equal(faecherHtml([]), "");
});
