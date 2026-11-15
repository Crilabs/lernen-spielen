// M37 Kettenhüpfer: reine Spiellogik (spiele/mathe/m37-kettenhuepfer/logik.js) und die Sätze aus Daten (texte.json).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const L = await import("../../../spiele/mathe/m37-kettenhuepfer/logik.js");
const { aufgabenVon } = await import("../../../spiele/aufgabenarten.js");
const TEXTE = JSON.parse(readFileSync(new URL("../../../spiele/mathe/m37-kettenhuepfer/texte.json", import.meta.url), "utf8"));
const REIHEN = [2, 3, 4, 5, 6, 7, 8, 9, 10];
const alle = [...REIHEN.map((n) => ({ art: "mal", reihe: n })), { art: "mal", kern: true }].flatMap(aufgabenVon);

test("hilfeVon: Probe über eine nahe Kernaufgabe, nie die Lösung selbst, Stäbchen zwischen Kern und Ziel", () => {
  assert.deepEqual(L.hilfeVon(1), { kern: null, hell: [1] });
  assert.deepEqual(L.hilfeVon(2), { kern: 1, hell: [2] });
  assert.deepEqual(L.hilfeVon(4), { kern: 5, hell: [5] });
  assert.deepEqual(L.hilfeVon(5), { kern: 10, hell: [1, 2, 3, 4, 5] });
  assert.deepEqual(L.hilfeVon(7), { kern: 5, hell: [6, 7] });
  assert.deepEqual(L.hilfeVon(8), { kern: 10, hell: [9, 10] });
  assert.deepEqual(L.hilfeVon(10), { kern: 5, hell: [6, 7, 8, 9, 10] });
  for (let a = 1; a <= 10; a++) {
    const h = L.hilfeVon(a);
    assert.notEqual(h.kern, a, `${a}: die Probe ist nicht die Aufgabe`);
    if (h.kern !== null) assert.ok([1, 2, 5, 10].includes(h.kern), `${a}: Kern ${h.kern}`);
    assert.ok(h.hell.length >= 1 && h.hell.length <= 5, `${a}`);
  }
});

test("Eingabe: Ziffern, Löschen, höchstens drei Ziffern, keine führende Null", () => {
  assert.equal(L.tippe("", "0"), "");
  assert.equal(L.tippe("4", "2"), "42");
  assert.equal(L.tippe("100", "1"), "100");
  assert.equal(L.tippe("42", "loeschen"), "4");
  assert.equal(L.tippe("", "x"), "");
});

test("naechsteTaste und tastenZu: der Weg zur Zahl, Löschen bei falschem Anfang", () => {
  assert.equal(L.naechsteTaste("", 42), "4");
  assert.equal(L.naechsteTaste("4", 42), "2");
  assert.equal(L.naechsteTaste("42", 42), "fertig");
  assert.equal(L.naechsteTaste("5", 42), "loeschen");
  assert.deepEqual(L.tastenZu("", [14, 7, 21]), ["1", "2", "7"]);
  assert.deepEqual(L.tastenZu("7", [14, 7, 70]), ["0", "fertig"]);
  assert.deepEqual(L.tastenZu("9", [14, 7, 21]), ["loeschen"]);
  assert.deepEqual(L.kandidaten(1, 7), [7, 14]);
});

test("Ratendes Kind: über die Kandidaten ist jede Aufgabe mit wenigen Tasten erreichbar", () => {
  for (const { daten: { a, b, c } } of alle) {
    let e = "";
    for (let i = 0; i < 5 && L.naechsteTaste(e, c) !== "fertig"; i++) {
      const t = L.naechsteTaste(e, c);
      assert.ok(L.tastenZu(e, L.kandidaten(a, b)).includes(t), `${a} · ${b}: ${t} fehlt bei „${e}“`);
      e = L.tippe(e, t);
    }
    assert.ok(L.tastenZu(e, L.kandidaten(a, b)).includes("fertig"), `${a} · ${b}`);
  }
});

test("pfeileWaehrend: gelöste mit Zahl, das eigene Pfeilchen nie (nichts zum Ablesen)", () => {
  assert.deepEqual(L.pfeileWaehrend([5, 2, 7], 7), [2, 5]);
  assert.deepEqual(L.pfeileWaehrend([], 3), []);
});

test("einfuehrungsKette: die Kette der ersten Aufgabe, eine andere, wenn sie selbst 2 · n oder 3 · n ist", () => {
  assert.equal(L.einfuehrungsKette(6, 7), 7);
  assert.equal(L.einfuehrungsKette(2, 7), 8);
  assert.equal(L.einfuehrungsKette(3, 10), 9);
});

test("Hüpfer: je 0,24 s, zusammen höchstens etwa 1,6 s, der Sprung in die zweite Reihe länger; Töne steigen", () => {
  assert.deepEqual(L.hueperZeiten(3), [240, 240, 240]);
  for (let a = 1; a <= 10; a++) {
    const z = L.hueperZeiten(a);
    assert.equal(z.length, a);
    assert.ok(z.reduce((s, x) => s + x, 0) <= 1700, `${a}: ${z}`);
    if (a >= 6) assert.ok(z[5] > z[4], `${a}: Reihenwechsel`);
  }
  for (let k = 2; k <= 10; k++) assert.ok(L.hueperTon(k) > L.hueperTon(k - 1), `Ton ${k}`);
});

test("Freude: nie zweimal dieselbe hintereinander, der Freudentanz seltener; Witz höchstens jede fünfte Aufgabe", () => {
  let saat = 3;
  const rnd = () => ((saat = (saat * 16807) % 2147483647) / 2147483647);
  let vorige = null;
  const zahl = /** @type {Record<string, number>} */ ({});
  for (let i = 0; i < 400; i++) {
    const f = L.naechsteFreude(vorige, rnd);
    assert.ok(L.FREUDE.includes(f));
    assert.notEqual(f, vorige);
    zahl[f] = (zahl[f] ?? 0) + 1;
    vorige = f;
  }
  assert.ok(zahl.freudentanz < zahl.huepfen && zahl.freudentanz < zahl.umdrehen, JSON.stringify(zahl));
  assert.equal(L.witz(10, 4), null);
  assert.equal(L.witz(10, 5), "fast-umfallen");
  assert.equal(L.witz(1, 6), "doppelblick");
  assert.equal(L.witz(6, 9), null);
});

test("texte.json: je Reihe der Anfang, je Aufgabe die Gleichung, je Zahl bis 100 ihr Ort; keine Wörter aus 3.2", () => {
  // Kein Satz am Rundenanfang (die Leiste nennt das Thema); beim Reihenwechsel nur, was sich ändert.
  assert.equal(TEXTE.anfang, undefined);
  const NAME = { 2: "Zweier", 3: "Dreier", 4: "Vierer", 5: "Fünfer", 6: "Sechser", 7: "Siebener", 8: "Achter", 9: "Neuner", 10: "Zehner" };
  for (const n of REIHEN) assert.equal(TEXTE.jetzt[n], `Jetzt die ${NAME[n]}kette.`);
  assert.deepEqual(Object.keys(TEXTE.wechsel).sort(), ["kette-hin", "kette-weg", "perlen-hin", "perlen-weg"]);
  for (const t of Object.values(TEXTE.wechsel)) assert.ok(t.split(" ").length <= 8, t);
  for (const { daten: { a, b, c } } of alle) assert.equal(TEXTE.gleichung[`${a}*${b}`], `${a} mal ${b} ist ${c}.`);
  // Auch jede Probe (Kernaufgabe) hat ihren Satz.
  for (const n of REIHEN) for (const k of [1, 2, 5, 10]) assert.ok(TEXTE.gleichung[`${k}*${n}`], `${k} · ${n}`);
  for (let w = 1; w <= 100; w++) assert.equal(TEXTE.daneben[w], `Die ${w} liegt dort drüben.`);
  const alleTexte = JSON.stringify(TEXTE);
  for (const w of ["super", "toll", "falsch", "leider", "Fehler", "richtig"]) assert.ok(!new RegExp(`\\b${w}\\b`, "i").test(alleTexte), w);
});

test("waehleAufgabe: bleibt auf der gemalten Kette, wenn das Angebot es erlaubt; Wiedervorlagen nie getauscht", () => {
  const a = (/** @type {string} */ key) => ({ key, thema: "t" });
  const angebot = { ziel: a("mal:5*7"), auch: [a("mal:2*3"), a("mal:10*3")], stufe: "material" };
  // Kette von 3 gemalt: die Aufgabe auf der Dreierkette kommt zuerst, das Ziel bleibt im Angebot.
  const w = L.waehleAufgabe(angebot, 3);
  assert.equal(w?.ziel.key, "mal:2*3");
  assert.deepEqual(w?.auch.map((x) => x.key), ["mal:5*7", "mal:10*3"]);
  assert.equal(w?.stufe, "material");
  // Gleiche Kette, keine Kette, keine passende in auch, Wiedervorlage: unverändert.
  assert.equal(L.waehleAufgabe(angebot, 7), angebot);
  assert.equal(L.waehleAufgabe(angebot, null), angebot);
  assert.equal(L.waehleAufgabe(angebot, 4), angebot);
  assert.equal(L.waehleAufgabe(angebot, 3, new Set(["mal:5*7"])), angebot);
  assert.equal(L.waehleAufgabe(null, 3), null);
});

test("bildWechsel: jeder Wechsel von Reihe oder Stufe ist eine Szene mit höchstens einem Satz", () => {
  // Erste Kette: Lena malt sie hin, ohne Satz; auf kopf gibt es nichts zu malen.
  assert.deepEqual(L.bildWechsel({ n: null, stufe: null }, { n: 2, stufe: "material" }), { schritte: ["kette-hin"], satz: null });
  assert.deepEqual(L.bildWechsel({ n: null, stufe: null }, { n: 2, stufe: "kopf" }), { schritte: [], satz: null });
  // Nichts gewechselt: nichts (auf kopf geht die beim Hüpfen entstandene Kette zurück).
  assert.deepEqual(L.bildWechsel({ n: 2, stufe: "material" }, { n: 2, stufe: "material" }), { schritte: [], satz: null });
  assert.deepEqual(L.bildWechsel({ n: 2, stufe: "kopf" }, { n: 2, stufe: "kopf" }), { schritte: ["einrollen"], satz: null });
  // Stufen.
  assert.deepEqual(L.bildWechsel({ n: 2, stufe: "material" }, { n: 2, stufe: "vorstellung" }), { schritte: ["perlen-weg"], satz: "perlen-weg" });
  assert.deepEqual(L.bildWechsel({ n: 2, stufe: "vorstellung" }, { n: 2, stufe: "material" }), { schritte: ["perlen-hin"], satz: "perlen-hin" });
  assert.deepEqual(L.bildWechsel({ n: 2, stufe: "vorstellung" }, { n: 2, stufe: "kopf" }), { schritte: ["kette-weg"], satz: "kette-weg" });
  assert.deepEqual(L.bildWechsel({ n: 2, stufe: "kopf" }, { n: 2, stufe: "material" }), { schritte: ["einrollen", "kette-hin"], satz: "kette-hin" });
  // Reihe: alte Kette weg, neue hin, ein Satz.
  assert.deepEqual(L.bildWechsel({ n: 2, stufe: "material" }, { n: 3, stufe: "material" }), { schritte: ["kette-weg", "kette-hin"], satz: "jetzt" });
  assert.deepEqual(L.bildWechsel({ n: 2, stufe: "kopf" }, { n: 3, stufe: "vorstellung" }), { schritte: ["einrollen", "kette-hin"], satz: "jetzt" });
  assert.deepEqual(L.bildWechsel({ n: 2, stufe: "vorstellung" }, { n: 3, stufe: "kopf" }), { schritte: ["kette-weg"], satz: "jetzt" });
});

// --- Kreidekette auf der Straße (kreide-geometrie.js, gezeichnet in kreide.js) ------------------------------------
const G = await import("../../../spiele/mathe/m37-kettenhuepfer/kreide-geometrie.js");

test("Kreidekette: zehn Stäbchen zu je n Perlen, Fünfermarke nach der fünften, zwei Reihen zu fünf", () => {
  for (let n = 1; n <= 10; n++) {
    const k = G.kreideKette(n, { breite: 120 });
    assert.ok(k, `${n}`);
    assert.equal(k.staebchen.length, 10);
    for (const st of k.staebchen) {
      assert.equal(st.perlen.length, n, `${n}: Stäbchen ${st.nr}`);
      assert.equal(st.reihe, st.nr <= 5 ? 0 : 1);
      if (n > 5) {
        assert.ok(st.marke, `${n}: Marke`);
        assert.ok(st.marke.x > st.perlen[4].x && st.marke.x < st.perlen[5].x, `${n}: Marke zwischen 5. und 6. Perle`);
      } else assert.equal(st.marke, null);
      // Perlen von links nach rechts, einzeln (kein Überlappen).
      for (let i = 1; i < n; i++) assert.ok(st.perlen[i].x - st.perlen[i - 1].x > st.perlen[i].rx * 1.6, `${n}: Perlen einzeln`);
    }
    // Beide Reihen von links nach rechts; die hintere liegt weiter oben und ist kleiner (Tiefe).
    assert.ok(k.staebchen[4].mitte.x > k.staebchen[0].mitte.x && k.staebchen[9].mitte.x > k.staebchen[5].mitte.x);
    assert.ok(k.staebchen[5].mitte.y < k.staebchen[0].mitte.y);
    assert.ok(k.staebchen[5].mitte.s < 1 && Math.abs(k.staebchen[0].mitte.s - 1) < 1e-9);
    assert.equal(k.stand(6).s, k.staebchen[5].mitte.s, "Lena wird hinten kleiner");
  }
  assert.equal(G.kreideKette(0, { breite: 120 }), null);
  assert.equal(G.kreideKette(11, { breite: 120 }), null);
});

test("Kreidekette: das Kästchen von Stäbchen k zeigt auf die Grenze zum nächsten Feld, die Zahl k · n liegt dort", () => {
  const k = G.kreideKette(7, { breite: 120 });
  for (let nr = 1; nr <= 10; nr++) {
    const p = k.pfeil(nr);
    const st = k.staebchen[nr - 1];
    assert.ok(Math.abs(p.x - (st.feld[1].x + st.feld[2].x) / 2) < 0.5, `${nr}: Kästchen an der Feldgrenze`);
    assert.ok(p.x > st.ende.x, `${nr}: hinter dem Ende des Stäbchens`);
    assert.ok(p.y > st.mitte.y, `${nr}: vor der Reihe (näher am Kind)`);
    assert.deepEqual([k.ort(nr * 7).x, k.ort(nr * 7).reihe], [p.x, st.reihe]);
  }
  // 48 auf der Siebenerkette: auf Stäbchen 7 zwischen der 6. und 7. Perle, das hohle Kästchen steht darüber.
  const o = k.ort(48);
  const st7 = k.staebchen[6];
  assert.ok(o.x > st7.perlen[5].x && o.x < st7.perlen[6].x);
  assert.ok(k.hohl(48).y < st7.mitte.y);
  // Hinter dem Ende der Kette (größer als 10 · n).
  assert.ok(k.ort(75).ueber && k.ort(75).x > k.staebchen[9].ende.x);
});

test("Kreidekette: Kreide in der Montessori-Farbe der Reihe (LERNFARBE.perle)", () => {
  const quelle = readFileSync(new URL("../../../spiele/mathe/m37-kettenhuepfer/kreide.js", import.meta.url), "utf8");
  assert.match(quelle, /LERNFARBE\.perle\[/);
});
