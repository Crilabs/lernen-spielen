// Wegweiser der Startseite (spiele/start/wegweiser.js): ein Brett je Fach mit Spielen (Spec §5.3).
import { test } from "node:test";
import assert from "node:assert/strict";

const { wegweiserHtml } = await import("../spiele/start/wegweiser.js");

const FAECHER = [{ id: "mathe", name: "Mathe" }, { id: "lesen", name: "Lesen" }, { id: "sprechen", name: "Sprechen und Zuhören" }];

test("Wegweiser: ein Brett je Fach, in der gegebenen Reihenfolge, Link zur Fach-Seite", () => {
  const h = wegweiserHtml(FAECHER);
  const links = [...h.matchAll(/<a class="brett[^"]*" href="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(links, ["themen.html?fach=mathe", "themen.html?fach=lesen", "themen.html?fach=sprechen"]);
  assert.match(h, /aria-label="Mathe"/);
  assert.match(h, /<b>Sprechen und Zuhören<\/b>/);
});

test("Wegweiser: Fachsymbol als Maske, Sprechen (ohne Symbol) ohne Zeichen; Fachfüllung als Variable", () => {
  const bretter = wegweiserHtml(FAECHER).split("</a>").filter(Boolean);
  assert.match(bretter[0], /<i style="--bild:url\('symbole\/mathe\.svg'\)"><\/i>/);
  assert.match(bretter[0], /--fach-fuellung:#F06BB0/);
  assert.doesNotMatch(bretter[2], /<i /);
});

test("Wegweiser: Bretter zeigen abwechselnd nach rechts und links", () => {
  const h = wegweiserHtml(FAECHER);
  assert.deepEqual([...h.matchAll(/class="brett (rechts|links)"/g)].map((m) => m[1]), ["rechts", "links", "rechts"]);
});

test("Wegweiser: keine Fächer, kein Brett", () => {
  assert.equal(wegweiserHtml([]), "");
});
