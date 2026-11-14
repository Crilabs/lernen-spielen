// Spielobjekte (spiele/objekte/): Anmeldung, Bild im Stil der Runde, Zustände und Bewegungen passen zusammen.
// Das Element selbst prüft die Browser-Ansicht (vorschau.html?objekte); hier nur, was ohne DOM geht.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

const { objekte, meldeObjekt, bild, dauerVon, KONTUR } = await import("../spiele/objekte/objekt.js");
const ARTEN = ["papier", "dose", "papiertonne", "wertstofftonne", "schuhpaar", "muenze", "broetchen", "eierkarton", "gedeck", "geschirrtablett"];
for (const art of ARTEN) await import(`../spiele/objekte/${art}.js`);

const teileIn = (svg) => new Set([...svg.matchAll(/data-teil="([^"]+)"/g)].map((m) => m[1]));

test("jede Datei in spiele/objekte meldet ihre Art beim Import an", () => {
  const dateien = readdirSync(new URL("../spiele/objekte/", import.meta.url)).filter((d) => d.endsWith(".js") && !["objekt.js", "tonne.js"].includes(d));
  assert.deepEqual(dateien.map((d) => d.replace(/\.js$/, "")).sort(), [...ARTEN].sort());
  for (const art of ARTEN) assert.ok(objekte.has(art), art);
});

test("Namen und doppelte Anmeldung werden abgelehnt", () => {
  assert.throws(() => meldeObjekt("Tonne", { zustaende: ["a"], zeichne: () => "" }), /ungültiger Name/);
  assert.throws(() => meldeObjekt("papier", { zustaende: ["a"], zeichne: () => "" }), /schon gemeldet/);
  assert.throws(() => meldeObjekt("leer-x", { zustaende: [], zeichne: () => "" }), /ohne Zustände/);
});

test("Stil der Runde: Kontur-Schicht in Tinte unter den Flächen, keine Verläufe, kein Bild von außen, keine ids", () => {
  for (const art of ARTEN) {
    const def = objekte.get(art);
    for (const zustand of def.zustaende) {
      const svg = def.zeichne(zustand, { wert: "7" });
      assert.match(svg, new RegExp(`<g data-schicht="kontur" fill="#3B2A6B" stroke="#3B2A6B" stroke-width="${KONTUR}">`), art);
      assert.ok(svg.indexOf('data-schicht="kontur"') < svg.indexOf('data-schicht="flaeche"'), art);
      assert.doesNotMatch(svg, /Gradient|<image|\bid="|<script|NaN|undefined/, `${art} ${zustand}`);
    }
  }
});

test("Tonnen: drei Zustände, jede Bewegung trifft vorhandene Teile, 0,4 bis 3 s", () => {
  for (const art of ["papiertonne", "wertstofftonne"]) {
    const def = objekte.get(art);
    assert.deepEqual(def.zustaende, ["zu", "offen", "voll"]);
    const teile = teileIn(def.zeichne("zu", { wert: "" }));
    for (const t of ["ganz", "deckel-zu", "deckel-auf", "deckel-voll", "inhalt", "einwurf-papier", "einwurf-dose"]) assert.ok(teile.has(t), `${art} ${t}`);
    for (const [von, nach] of [["zu", "offen"], ["offen", "zu"], ["offen", "voll"], ["zu", "voll"], ["voll", "offen"]]) {
      const schritte = def.bewegung(von, nach);
      assert.ok(schritte.length > 0, `${art} ${von}>${nach}`);
      for (const s of schritte) assert.ok(teile.has(s.teil), `${art} ${von}>${nach}: ${s.teil}`);
      const d = dauerVon(schritte);
      assert.ok(d >= 400 && d <= 3200, `${art} ${von}>${nach}: ${d} ms`);
    }
    assert.deepEqual(def.bewegung("voll", "zu"), []);
    for (const ding of ["papier", "dose", "unbekannt"]) {
      const s = def.anstoss(ding);
      assert.ok(s.every((x) => teile.has(x.teil)) && dauerVon(s) <= 1000, `${art} anstoss ${ding}`);
    }
    assert.equal(def.einwurf.length, 3);
  }
});

test("Ein ausblendendes Teil nennt seine Deckkraft in jedem Keyframe (sonst blitzt es während der Bewegung)", () => {
  for (const art of ["papiertonne", "wertstofftonne"]) {
    const def = objekte.get(art);
    for (const [von, nach] of [["zu", "offen"], ["offen", "zu"], ["offen", "voll"], ["zu", "voll"], ["voll", "offen"]]) {
      for (const s of def.bewegung(von, nach)) {
        if (s.teil === "ganz") continue;
        assert.ok(s.keyframes.every((k) => "opacity" in k), `${art} ${von}>${nach} ${s.teil}`);
      }
    }
  }
});

test("Wert auf dem Aufkleber: Zahl oder Buchstaben als Text, maskiert; ohne Wert das Bildzeichen", () => {
  const def = objekte.get("papiertonne");
  assert.match(def.zeichne("zu", { wert: "7" }), /<text[^>]*>7<\/text>/);
  assert.match(def.zeichne("zu", { wert: "<b>" }), />&lt;b&gt;<\/text>/);
  assert.doesNotMatch(def.zeichne("zu", { wert: "" }), /<text/);
});

test("bild(): eigenes Teil trägt seine Kontur selbst, Teile ohne Kontur fehlen in der Kontur-Schicht", () => {
  const svg = bild({ breite: 10, hoehe: 10, teile: [
    { stueck: { svg: "<rect/>", kontur: "<rect/>" } },
    { stueck: { svg: "<circle/>", kontur: "<circle/>" }, teil: "ding", in: "", eigen: true, ursprung: [5, 5] },
  ] });
  const kontur = svg.slice(svg.indexOf('data-schicht="kontur"'), svg.indexOf('data-schicht="flaeche"'));
  assert.ok(kontur.includes("<rect/>") && !kontur.includes("<circle/>"));
  assert.match(svg, /<g data-teil="ding" data-in="" style="transform-origin:5px 5px"><g fill="#3B2A6B"[^>]*><circle\/><\/g><circle\/><\/g>/);
});

test("kein Plattform-Zugriff und kein Zugriff auf Attribute im Konstruktor", () => {
  const quelle = readFileSync(new URL("../spiele/objekte/objekt.js", import.meta.url), "utf8");
  const konstruktor = quelle.slice(quelle.indexOf("constructor()"), quelle.indexOf("connectedCallback()"));
  assert.doesNotMatch(konstruktor, /setAttribute|getAttribute/);
});
