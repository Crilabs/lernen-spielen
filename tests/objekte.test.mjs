// Spielobjekte (spiele/objekte/): Anmeldung, Bild im Stil der Runde, Zustände und Bewegungen passen zusammen.
// Das Element selbst prüft die Browser-Ansicht (vorschau.html?objekte); hier nur, was ohne DOM geht.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

const { objekte, meldeObjekt, bild, dauerVon, KONTUR } = await import("../spiele/objekte/objekt.js");
// Alle Arten aus dem Ordner (Dateiname = Art), damit ein neues Objekt keinen Eintrag hier braucht.
const ARTEN = readdirSync(new URL("../spiele/objekte/", import.meta.url))
  .filter((d) => d.endsWith(".js") && !["objekt.js", "tonne.js"].includes(d)).map((d) => d.slice(0, -3)).sort();
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

test("Einkaufskorb (M37): Füllstand leer, 1 … 8, gefuellt; jede Packung bleibt ab ihrem Stand, Bewegungen treffen vorhandene Teile", async () => {
  const def = objekte.get("einkaufskorb");
  const { fuellstand, PLAETZE } = await import("../spiele/objekte/einkaufskorb.js");
  assert.deepEqual(def.zustaende, ["leer", "1", "2", "3", "4", "5", "6", "7", "8", "gefuellt"]);
  assert.equal(PLAETZE, 8);
  assert.deepEqual([0, 1, 5, 8, 12].map(fuellstand), ["leer", "1", "5", "8", "8"]);
  const svg = def.zeichne("leer", { wert: "" });
  const teile = teileIn(svg);
  assert.ok(teile.has("ganz"));
  // Packung i ist ab Stand i sichtbar und in gefuellt, nie in leer.
  for (let i = 1; i <= PLAETZE; i++) {
    const m = svg.match(new RegExp(`data-teil="packung-${i}" data-in="([^"]*)"`));
    assert.ok(m, `packung-${i}`);
    const in_ = m[1].split(" ");
    assert.ok(in_.includes(String(i)) && in_.includes("gefuellt") && !in_.includes("leer") && !in_.includes(String(i - 1)), `packung-${i}: ${m[1]}`);
  }
  assert.doesNotMatch(svg, /<text/);
  for (const s of [...def.bewegung("leer", "3"), ...def.bewegung("2", "3"), ...def.anstoss("schuhpaar")]) assert.ok(teile.has(s.teil), s.teil);
  assert.deepEqual(def.bewegung("5", "leer"), []);
  assert.ok(dauerVon(def.bewegung("2", "3")) <= 1200);
  assert.equal(def.einwurf.length, 3);
  // Farben nur aus Tokens und Welt-Palette (keine eigenen Hex-Werte in der Datei).
  const quelle = (await import("node:fs")).readFileSync(new URL("../spiele/objekte/einkaufskorb.js", import.meta.url), "utf8");
  assert.doesNotMatch(quelle, /#[0-9A-Fa-f]{6}/);
});

test("Packungen der Reihen 3, 7, 8, 9 (M37): ein Zustand, ohne Schrift und Ziffer, Farben nur aus Tokens und Welt-Paletten", async () => {
  const { readFileSync } = await import("node:fs");
  const anzahl = { ballroehre: 3, wochenschachtel: 7, stiftebox: 8, muffinkarton: 9 };
  for (const art of Object.keys(anzahl)) {
    const def = objekte.get(art);
    assert.equal(def.zustaende.length, 1, art);
    const svg = def.zeichne(def.zustaende[0], { wert: "7" });
    assert.doesNotMatch(svg, /<text/, `${art}: keine Schrift, auch nicht mit wert`);
    const quelle = readFileSync(new URL(`../spiele/objekte/${art}.js`, import.meta.url), "utf8");
    assert.doesNotMatch(quelle, /#[0-9A-Fa-f]{6}/, `${art}: keine eigenen Hex-Werte`);
    assert.match(quelle, /from "\.\.\/start\/welten\.js"/, `${art}: Farben aus den Welt-Paletten`);
  }
  // Die Zahl der Teile ist im Bild abzählbar wie in echt (Sachbild, kein Zählmaterial): je Ball, Fach, Stift, Muffin ein Teil.
  const { FAECHER } = await import("../spiele/objekte/wochenschachtel.js");
  const { ANZAHL } = await import("../spiele/objekte/stiftebox.js");
  const { REIHEN } = await import("../spiele/objekte/muffinkarton.js");
  assert.deepEqual([FAECHER, ANZAHL, REIHEN * REIHEN], [7, 8, 9]);
});

test("Keine Farbe der Lernzeichen in den Packungen von M37 und im Einkaufskorb (Sachwelt, grundsaetze-bilder 6.2)", async () => {
  const { LERNFARBE } = await import("../spiele/rahmen/stil.js");
  const lern = new Set([...Object.values(LERNFARBE.perle), ...Object.values(LERNFARBE.wortart)].map((f) => f.toUpperCase()));
  for (const art of ["schuhpaar", "ballroehre", "wochenschachtel", "stiftebox", "muffinkarton", "einkaufskorb"]) {
    const def = objekte.get(art);
    for (const z of def.zustaende) {
      const farben = [...def.zeichne(z, { wert: "" }).matchAll(/fill="(#[0-9A-Fa-f]{6})"/g)].map((m) => m[1].toUpperCase());
      for (const f of farben) assert.ok(!lern.has(f), `${art} ${z}: ${f} ist eine Farbe der Lernzeichen`);
    }
  }
});

test("Schuhpaar (M37, Fakt „Paar“): beide Schuhe in einer Farbe, Farben nur aus Tokens und Welt-Paletten", async () => {
  const { readFileSync } = await import("node:fs");
  const quelle = readFileSync(new URL("../spiele/objekte/schuhpaar.js", import.meta.url), "utf8");
  assert.doesNotMatch(quelle, /#[0-9A-Fa-f]{6}/, "schuhpaar: keine eigenen Hex-Werte");
  const { SCHUH } = await import("../spiele/objekte/schuhpaar.js");
  const { PALETTEN } = await import("../spiele/start/welten.js");
  assert.equal(SCHUH, PALETTEN.werkstatt[3]);
  // Grundfarbe der Schäfte: genau eine (beide Schuhe gleich), kein zweiter Schuhton.
  const svg = objekte.get("schuhpaar").zeichne("liegt", { wert: "" });
  const grund = [...svg.matchAll(/fill="(#[0-9A-Fa-f]{6})"[^>]*transform="[^"]*scale\(0\.88\)/g)].map((m) => m[1].toUpperCase());
  assert.equal(grund.length, 2, "zwei Schäfte");
  assert.equal(new Set(grund).size, 1, "beide Schuhe in derselben Farbe");
});

test("Münze: Variante zehn-cent mit Prägung 10, stapel bleibt der erste Zustand ohne Ziffer", () => {
  const def = objekte.get("muenze");
  assert.deepEqual(def.zustaende, ["stapel", "zehn-cent"]);
  const svg = def.zeichne("stapel", { wert: "" });
  // Ein Bild trägt beide Zustände: die Teile sind über data-in getrennt, die 10 steht nur in zehn-cent.
  assert.match(svg, /data-in="stapel"/);
  const zehn = svg.slice(svg.lastIndexOf('data-in="zehn-cent"'));
  assert.match(zehn, /<text[^>]*>10<\/text>/);
  const stapel = svg.slice(svg.indexOf('data-schicht="flaeche"'), svg.lastIndexOf('data-in="zehn-cent"'));
  assert.doesNotMatch(stapel, /<text/);
});
