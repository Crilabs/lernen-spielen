// S20 Leuchtschrift: Prüfung der Aufzeichnung gegen die Vorlage (logik.js), Aufgabenart schreibschrift, Daten.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

globalThis.fetch = /** @type {any} */ (
  async (/** @type {any} */ url) => {
    const text = await readFile(fileURLToPath(url), "utf8");
    return { ok: true, text: async () => text, json: async () => JSON.parse(text) };
  }
);

const ORDNER = "../../../spiele/schreiben/s20-schreibschrift-verbunden-schreiben";
const L = await import(`${ORDNER}/logik.js`);
const V = await import("../../../spiele/kern/vorlagen.js");
const { aufgabenVon, schreibAus, darstellbar, schwierigkeit } = await import("../../../spiele/aufgabenarten.js");
await V.ladeVorlagen();

const formenVon = (/** @type {string} */ text) => [...text].map((c) => V.form("sas", c));
const strichDes = (/** @type {{x:number,y:number}[]} */ p, dx = 0, dy = 0, t0 = 0) => ({ punkte: p.map((q, i) => ({ x: q.x + dx, y: q.y + dy, t: t0 + i * 10 })) });
/** Das Kind schreibt genau die Vorlage (Hauptstrich) und setzt die Punkte danach. */
function richtig(/** @type {string} */ text, dx = 60, dy = 0) {
  const w = V.wort("sas", text);
  return w.striche.map((s, i) => strichDes(s, dx, dy, i * 5000));
}
const pruefe = (/** @type {string} */ text, /** @type {any} */ auf) => L.pruefe(V.wort("sas", text), formenVon(text), auf);

test("schreibAus und aufgabenVon: Schlüssel schreib:<wort>, Wörter ohne Doppelte, nur kleine Buchstaben", () => {
  assert.deepEqual(schreibAus("schreib:nun"), { wort: "nun" });
  assert.deepEqual(schreibAus("schreib:küh"), { wort: "küh" });
  assert.equal(schreibAus("schreib:Nun"), null);
  assert.equal(schreibAus("schreib:"), null);
  assert.equal(schreibAus("zahl:7"), null);
  const a = aufgabenVon({ art: "schreibschrift", woerter: ["i", "u", "ü", "uu", "u", "Hose", "a b"] });
  assert.deepEqual(a.map((x) => x.key), ["schreib:i", "schreib:u", "schreib:ü", "schreib:uu"]);
  assert.deepEqual(a[0], { key: "schreib:i", art: "schreibschrift", daten: { wort: "i" } });
  assert.deepEqual(aufgabenVon({ art: "schreibschrift" }), []);
  assert.ok(schwierigkeit(a[3]) > schwierigkeit(a[0]));
  assert.equal(darstellbar(a[0], { art: "schreibschrift", stufen: ["material"] }), true);
  assert.equal(darstellbar(a[0], { art: "artikel" }), false);
});

test("Lernplan: jedes Thema mit Schreibschrift-Aufgaben hat nur Wörter, die die SAS-Vorlage schreiben kann", () => {
  const plan = JSON.parse(readFileSync(new URL("../../../spiele/lernplan.json", import.meta.url), "utf8"));
  const mit = plan.themen.filter((/** @type {any} */ t) => t.aufgaben?.art === "schreibschrift");
  assert.ok(mit.length >= 20);
  for (const t of mit) {
    assert.ok(t.tempo === false, `${t.id}: tempo`);
    const a = aufgabenVon(t.aufgaben);
    assert.equal(a.length, new Set(t.aufgaben.woerter).size, `${t.id}: Wörter ohne Aufgabe`);
    for (const x of a) assert.doesNotThrow(() => V.wort("sas", x.daten.wort), `${t.id}: ${x.daten.wort}`);
  }
});

test("richtig geschriebene Wörter (die Vorlage selbst, verschoben und mit etwas Zittern) bestehen", () => {
  for (const w of ["i", "u", "ü", "uu", "ui", "iu", "üi", "nun", "nur", "tut", "au", "da", "wo", "vom", "nie", "hallo", "kühl", "lieb", "gegen", "süß", "heißen", "essen", "backen"]) {
    assert.deepEqual(pruefe(w, richtig(w)), { ok: true }, w);
    const zittert = richtig(w).map((s, k) => ({ punkte: s.punkte.map((p, i) => ({ ...p, x: p.x + Math.sin(i * 1.7 + k) * 6, y: p.y + Math.cos(i * 2.3) * 6 })) }));
    assert.deepEqual(pruefe(w, zittert), { ok: true }, `${w} mit Zittern`);
  }
});

test("Größe und Lage im Zeilenfeld ändern nichts, solange das Band stimmt (nach rechts verschoben, etwas breiter)", () => {
  const w = V.wort("sas", "nun");
  const breiter = w.striche.map((s) => ({ punkte: s.map((p) => ({ x: 120 + p.x * 1.25, y: p.y })) }));
  assert.deepEqual(pruefe("nun", breiter), { ok: true });
});

test("Punkte kommen nach dem Zug und dürfen fehlen oder zusätzlich da sein; ein Tupfer zählt nicht", () => {
  const ohne = richtig("ui").slice(0, 1);
  assert.deepEqual(pruefe("ui", ohne), { ok: true });
  const mit = [...richtig("ui"), strichDes([{ x: 200, y: 60 }, { x: 205, y: 66 }], 0, 0, 9000)];
  assert.deepEqual(pruefe("ui", mit), { ok: true });
  const tupfer = [...richtig("ui"), strichDes([{ x: 500, y: 150 }, { x: 502, y: 151 }], 0, 0, 9000)];
  assert.deepEqual(pruefe("ui", tupfer), { ok: true });
});

test("Absetzen mitten im Wort: Lücke, Stelle zwischen den Stücken, Buchstabe an der Lücke", () => {
  const w = V.wort("sas", "nun");
  const s = w.striche[0];
  const hälfte = Math.floor(s.length / 2);
  const auf = [strichDes(s.slice(0, hälfte), 60), strichDes(s.slice(hälfte), 60, 0, 3000)];
  const u = pruefe("nun", auf);
  assert.equal(u.ok, false);
  assert.equal(u.befund, "luecke");
  assert.ok(u.stelle && Math.abs(u.stelle.x - (60 + s[hälfte].x)) < 12);
  assert.ok(u.buchstabe >= 1 && u.buchstabe <= 2, `Buchstabe ${u.buchstabe}`);
  // Buchstabe für Buchstabe einzeln: Lücke an der ersten Naht
  const einzeln = ["n", "u", "n"].map((c, k) => strichDes(V.wort("sas", c).striche[0], 60 + k * 100, 0, k * 2000));
  assert.equal(pruefe("nun", einzeln).befund, "luecke");
});

test("Startpunkt: von hinten (rückwärts) oder an der falschen Linie begonnen", () => {
  const w = V.wort("sas", "nun");
  const rueck = [strichDes([...w.striche[0]].reverse(), 60)];
  const u = pruefe("nun", rueck);
  assert.deepEqual([u.ok, u.befund, u.buchstabe], [false, "start", 0]);
  // ein u beginnt am Grund; wer es an der Oberlinie beginnt, startet falsch
  const hoch = [strichDes(V.wort("sas", "u").striche[0], 60, -150)];
  assert.equal(pruefe("u", hoch).befund, "start");
});

test("Drehrichtung: ein Oval im Uhrzeigersinn statt dagegen (gleicher Start, gleiche Größe)", () => {
  // o der Vorlage: Anstrich, dann Oval gegen den Uhrzeigersinn. Ein Kind, das am selben Punkt beginnt, aber andersherum kreist:
  const o = V.wort("sas", "o").striche[0];
  const gegen = L.drehung(o);
  assert.ok(gegen < -2.6, `Vorlage dreht gegen den Uhrzeigersinn (${gegen})`);
  const m = { x: 40, y: 150 };
  /** @type {{x:number,y:number}[]} */
  const kreis = [{ x: 0, y: 200 }, { x: 8, y: 180 }, { x: 14, y: 150 }, { x: 20, y: 120 }];
  for (let w = 0; w <= 360; w += 8) {
    const a = (-130 + w) * (Math.PI / 180); // im Uhrzeigersinn (y nach unten)
    kreis.push({ x: m.x + 32 * Math.cos(a) + 18, y: m.y + 50 * Math.sin(a) });
  }
  kreis.push({ x: 80, y: 100 }, { x: 95, y: 100 });
  const u = pruefe("o", [strichDes(kreis, 60)]);
  assert.equal(u.ok, false);
  assert.equal(u.befund, "richtung");
  assert.equal(u.buchstabe, 0);
});

test("Band: eine Oberlänge, die weit über das Band ragt, wird gefunden; im Band bleibt es ruhig", () => {
  const w = V.wort("sas", "nun");
  const zuHoch = [{ punkte: w.striche[0].map((p, i) => ({ x: 60 + p.x, y: i > 12 && p.y < 140 ? p.y - 110 : p.y })) }];
  const u = pruefe("nun", zuHoch);
  assert.equal(u.ok, false);
  assert.equal(u.befund, "band");
  assert.ok(u.stelle && u.stelle.y < 50);
  // ein l hat eine Oberlänge: dort ist das hohe Band richtig
  assert.deepEqual(pruefe("l", richtig("l")), { ok: true });
  // und ein g darf in den Keller
  assert.deepEqual(pruefe("g", richtig("g")), { ok: true });
});

test("leere Eingabe: nur Tupfer ergibt „leer“", () => {
  assert.equal(pruefe("ui", [strichDes([{ x: 5, y: 5 }, { x: 6, y: 6 }])]).befund, "leer");
  assert.equal(pruefe("ui", []).befund, "leer");
});

test("Hilfsfunktionen: Spitzen, Stück eines Buchstabens, Schreibdauer", () => {
  const w = V.wort("sas", "ui");
  assert.ok(L.spitzen(w.striche[0]).length >= 1);
  const k = L.buchstabenStueck(w, formenVon("ui"), 1);
  assert.ok(k.length > 4 && L.weg(k) < L.weg(w.striche[0]));
  assert.equal(L.buchstabeAn(w.striche[0], { x: 2, y: 200 }, 2), 0);
  assert.equal(L.buchstabeAn(w.striche[0], { x: 9999, y: 200 }, 2), 1);
  assert.ok(L.schreibDauer(300) < L.schreibDauer(300, 0.5));
  assert.ok(L.schreibDauer(20) >= 500 && L.schreibDauer(99999) <= 4200);
});

test("Sätze aus Daten: jedes Wort der Themen hat seinen Satz (texte.json), kurz, ohne Urteil", () => {
  const texte = JSON.parse(readFileSync(new URL(`${ORDNER}/texte.json`, import.meta.url), "utf8"));
  const plan = JSON.parse(readFileSync(new URL("../../../spiele/lernplan.json", import.meta.url), "utf8"));
  const woerter = new Set(["ui"]);
  for (const t of plan.themen) if (t.aufgaben?.art === "schreibschrift") for (const w of t.aufgaben.woerter) woerter.add(w);
  assert.deepEqual(Object.keys(texte.wort).sort(), [...woerter].sort());
  assert.deepEqual(Object.keys(texte.zug).sort(), [...woerter].sort());
  for (const w of woerter) {
    assert.equal(texte.wort[w], `${w}.`);
    assert.equal(texte.zug[w], `${w}, in einem Zug.`);
    assert.ok(texte.zug[w].split(/\s+/).length <= 8);
  }
});

test("feste Sätze in spiel.js: höchstens 8 Wörter, zusammen unter dem Budget, keine Urteilswörter, genau die Sätze der Idee", () => {
  const quelle = readFileSync(new URL(`${ORDNER}/spiel.js`, import.meta.url), "utf8");
  const saetze = [...quelle.matchAll(/(?:blase\.sage|sprich)\("([^"]+)"/g)].map((m) => m[1]);
  assert.ok(saetze.length >= 15);
  for (const s of saetze) assert.ok(s.split(/\s+/).length <= 8, s);
  assert.ok(saetze.join("").length < 2500);
  for (const s of saetze) assert.doesNotMatch(s, /\b(super|toll|falsch|leider|fehler|schlau|prima|schade)\b/i, s);
  for (const s of [
    "Hier ist die Spur unterbrochen.", "Ela fängt hier an.", "Ela schreibt hier andersherum.", "Hier geht die Spur über die Linie.",
    "Versuch es noch einmal.", "Ela schreibt das langsam vor.", "Fahr Elas Spur in einem Zug nach.", "Ela schreibt nur noch einmal vor.",
    "Jetzt steht das Wort auf dem Schild.", "Es wird dunkel am Zeltplatz.", "Ela hat eine Wunderkerze.", "Sie schreibt ein Wort in die Luft.",
    "Sie setzt nicht ab.", "Die Kamera macht ein Foto.", "Jetzt schreibst du ui, hier unten.", "Ohne Absetzen kommt das Foto an die Leine.",
    "Mit Lücke probierst du es einfach noch einmal.", "Jetzt geht es los.", "Schreib ein Wort auf Papier, ohne abzusetzen.",
  ]) assert.ok(saetze.includes(s), `fehlt: ${s}`);
});

test("Eintrag leuchtschrift in spiele.json: Aufgabenart schreibschrift auf allen Stufen, Dateien da", () => {
  const spiele = JSON.parse(readFileSync(new URL("../../../spiele/spiele.json", import.meta.url), "utf8"));
  const e = spiele.spiele.find((/** @type {any} */ s) => s.id === "leuchtschrift");
  assert.ok(e);
  assert.equal(e.kategorie, "schreiben");
  assert.deepEqual(e.arten, [{ art: "schreibschrift", stufen: ["material", "vorstellung", "kopf"] }]);
  for (const d of [e.datei, e.symbol]) assert.ok(readFileSync(new URL(`../../../spiele/${d}`, import.meta.url)).length > 100, d);
});
