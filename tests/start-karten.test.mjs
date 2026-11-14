// Karten der Startseite (spiele/start/karten.js), Spec Karten §3.1.
import { test } from "node:test";
import assert from "node:assert/strict";

const { spielKarteHtml, echtKarteHtml, abschnittHtml } = await import("../spiele/start/karten.js");

const SPIEL = { id: "m14", titel: "Zwei Tonnen", datei: "m14.html", symbol: "symbole/m14.svg", kategorie: "mathe" };

test("Spielkarte: ganze Karte ist ein Link mit ?thema, Name fürs Vorlesen, Vignette oben, Name und Thema", () => {
  const h = spielKarteHtml({ spiel: SPIEL, thema: { id: "zerlegen 5", name: "Die 5 zerlegen" } }, "mathe", "<svg>V</svg>");
  assert.match(h, /^<a class="karte spiel" href="m14\.html\?thema=zerlegen%205"/);
  assert.match(h, /aria-label="Zwei Tonnen, Die 5 zerlegen"/);
  assert.match(h, /<span class="bild"><svg>V<\/svg><\/span>/);
  assert.match(h, /<b>Zwei Tonnen<\/b>/);
  assert.match(h, /<span class="thema">Die 5 zerlegen<\/span>/);
  assert.match(h, /--fach-fuellung:#F06BB0;--fach-tief:#B8327A;--fach-toenung:#FFE6F2/);
});

test("Spielkarte: ohne Vignette eine Fläche in der Fachtönung mit dem Spielsymbol; Texte escaped", () => {
  const h = spielKarteHtml({ spiel: { ...SPIEL, titel: "A<b" }, thema: { id: "t", name: "T" } }, "mathe", null);
  assert.match(h, /<span class="bild ohne"><img src="symbole\/m14\.svg" alt=""><\/span>/);
  assert.match(h, /<b>A&lt;b<\/b>/);
});

test("Karte Mit echten Dingen: Link zur Seite der Anleitung, eigene Gestalt, Name fürs Vorlesen", () => {
  const h = echtKarteHtml({ thema: { id: "zaehlen", name: "Bis 10 zählen", eltern: "Gabeln zählen" } }, "mathe");
  assert.match(h, /^<a class="karte echt" href="echt\.html\?thema=zaehlen" data-thema="zaehlen"/);
  assert.match(h, /aria-label="Mit echten Dingen: Bis 10 zählen"/);
  assert.match(h, /<b>Mit echten Dingen<\/b>/);
  assert.match(h, /<span class="thema">Bis 10 zählen<\/span>/);
});

test("Abschnitt: Kopf mit Fachsymbol und Name als Link zur Fach-Seite, darunter die Karten", () => {
  const h = abschnittHtml({ id: "mathe", name: "Mathe" }, "<a>K</a>");
  assert.match(h, /^<section class="fach-abschnitt" style="--fach-fuellung:#F06BB0;--fach-tief:#B8327A;--fach-toenung:#FFE6F2" aria-label="Mathe">/);
  assert.match(h, /<a class="fach-kopf" href="themen\.html\?fach=mathe"><span class="knopf" aria-hidden="true"><i style="--bild:url\('symbole\/mathe\.svg'\)"><\/i><\/span><b>Mathe<\/b><\/a>/);
  assert.match(h, /<div class="karten"><a>K<\/a><\/div><\/section>$/);
});
