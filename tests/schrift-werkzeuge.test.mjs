import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { gibFrei, merkeAnmerkung, schreibeListe } from "../werkzeuge/schrift/freigabe.mjs";

test("schreibeListe: eine Zeile je Form, verlustfrei", () => {
  const l = liste();
  const text = schreibeListe(l);
  assert.deepEqual(JSON.parse(text), l);
  assert.equal(text.split("\n").filter((z) => z.includes('"zeichen"')).length, 2);
  assert.ok(text.endsWith("\n"));
});

const liste = () => ({
  saetze: { ziffern: { verbunden: false } },
  formen: [
    { zeichen: "1", satz: "ziffern", freigegeben: null },
    { zeichen: "2", satz: "ziffern", freigegeben: null },
  ],
  sonderverbindungen: [],
});

test("schreibeListe gibt die echte liste.json unverändert wieder", () => {
  const text = readFileSync(new URL("../spiele/schrift/vorlagen/liste.json", import.meta.url), "utf8");
  assert.equal(schreibeListe(JSON.parse(text)), text);
});

test("gibFrei setzt das Datum nur an der Form", () => {
  const l = gibFrei(liste(), "ziffern", "1", "2026-11-14");
  assert.equal(l.formen[0].freigegeben, "2026-11-14");
  assert.equal(l.formen[1].freigegeben, null);
});

test("gibFrei mit null nimmt die Freigabe zurück", () => {
  const l = gibFrei(gibFrei(liste(), "ziffern", "1", "2026-11-14"), "ziffern", "1", null);
  assert.equal(l.formen[0].freigegeben, null);
});

test("gibFrei wirft bei unbekannter Form und falschem Datum", () => {
  assert.throws(() => gibFrei(liste(), "ziffern", "7", "2026-11-14"), /Unbekannte Form: ziffern\/7/);
  assert.throws(() => gibFrei(liste(), "ziffern", "1", "gestern"), /Datum/);
});

test("merkeAnmerkung hängt offen an", () => {
  const a = merkeAnmerkung({ eintraege: [] }, "sas", "s", "Knoten zu groß", "2026-11-14");
  assert.deepEqual(a.eintraege, [{ satz: "sas", zeichen: "s", text: "Knoten zu groß", datum: "2026-11-14", erledigt: false }]);
  assert.throws(() => merkeAnmerkung(a, "sas", "s", "   ", "2026-11-14"), /leer/);
});
