import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync, existsSync } from "node:fs";

const { gekonntEreignis, dabeiEreignis, gelesenEreignis, naechstesEreignis } = await import("../spiele/tagesbrief/ereignisse.js");

const lies = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), "utf8"));
const plan = lies("spiele/lernplan.json");
const ctx = { plan, spiele: lies("spiele/spiele.json"), echteDinge: lies("spiele/mit-echten-dingen/verzeichnis.json") };

test("gekonntEreignis: Name, Zweck und Fach des Themas", () => {
  assert.deepEqual(gekonntEreignis(ctx, "zweierreihe"), {
    id: "zweierreihe", name: "Zweierreihe",
    zweck: "Schnell wissen, wie viele Schuhe oder Handschuhe eine Gruppe Kinder braucht.", fach: "mathe",
  });
});

test("gekonntEreignis und dabeiEreignis: unbekanntes Thema gibt null", () => {
  assert.equal(gekonntEreignis(ctx, "gibt-es-nicht"), null);
  assert.equal(dabeiEreignis(ctx, "gibt-es-nicht"), null);
});

test("dabeiEreignis: Name und Fach", () => {
  assert.deepEqual(dabeiEreignis(ctx, "zweierreihe"), { id: "zweierreihe", name: "Zweierreihe", fach: "mathe" });
});

test("gelesenEreignis: Frage und richtige Antwort des ersten Kapitels mit Erinnerungsfrage", () => {
  const wal = lies("spiele/geschichten/wal/geschichte.json");
  assert.deepEqual(gelesenEreignis("wal", wal), {
    id: "wal", titel: wal.titel, frage: "Womit atmet ein Wal?", antwort: "Mit einer Lunge, wie du",
  });
});

test("gelesenEreignis: Buch ohne Erinnerungsfrage gibt leere Frage und Antwort", () => {
  const r = gelesenEreignis("x", { titel: "Ein Buch", seiten: [{ text: "Hallo" }] });
  assert.deepEqual(r, { id: "x", titel: "Ein Buch", frage: "", antwort: "" });
  assert.deepEqual(gelesenEreignis("y", { titel: "T", kapitel: [{ titel: "K", seiten: [] }] }), { id: "y", titel: "T", frage: "", antwort: "" });
});

test("naechstesEreignis: Datei als Id, Titel und Formen der Anleitung", () => {
  const wahl = { thema: "m2", datei: "mathe/a.md", passendZuGerade: true, weitere: ["B"] };
  const anleitung = { titel: "Mein Titel", formen: [{ situation: "tisch", wort: "Am Tisch", name: "**Tisch**", bloecke: [
    { typ: "p", text: "Ihr braucht: **Papier**" }, { typ: "ol", punkte: ["Falten"] },
    { typ: "p", text: "**Darauf kommt es an:** Das ist es" }, { typ: "p", text: "**Zum Verinnerlichen:** Nochmal" }] }] };
  const r = naechstesEreignis(wahl, anleitung, "mathe", "QUJD");
  assert.equal(r.id, "mathe/a.md");
  assert.equal(r.thema, "m2");
  assert.equal(r.fach, "mathe");
  assert.equal(r.titel, "Mein Titel");
  assert.equal(r.passendZuGerade, true);
  assert.equal(r.foto, "QUJD");
  assert.deepEqual(r.weitere, ["B"]);
  assert.equal(r.formen.length, 1);
  assert.equal(r.formen[0].name, "Tisch");
  assert.equal(r.formen[0].kern, "Das ist es");
});

test("jede Anleitung mit Foto hat eine .brief.jpg von höchstens 40 KB", () => {
  const eintraege = Object.entries(ctx.echteDinge.themen).filter(([, v]) => v.foto);
  assert.ok(eintraege.length > 0);
  for (const [id, v] of eintraege) {
    const pfad = new URL(`../spiele/mit-echten-dingen/${v.foto.replace(/\.[^./]+$/, "")}.brief.jpg`, import.meta.url);
    assert.ok(existsSync(pfad), `${id}: ${v.foto} hat keine .brief.jpg`);
    assert.ok(statSync(pfad).size <= 40960, `${id}: .brief.jpg über 40 KB`);
  }
});
