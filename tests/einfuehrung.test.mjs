import { test } from "node:test";
import assert from "node:assert/strict";

const { fuelleVorlage } = await import("../spiele/einfuehrung.js");

const VORLAGE = { szenen: [
  { sprich: "Diese Brücke braucht so viele Perlen.", zeig: "{n} Perlen und {n-1} davor",
    bild: [ { figur: "ela", x: 20, haltung: "zeigen", aufgabe: "vorzeigen" }, { perlen: ["{n}", "{n-1}"], x: "60" }, { zahl: "{n}", x: 80 } ] },
  { sprich: "Beide Stäbe zusammen.", zeig: "", bild: [] },
] };

test("fuelleVorlage: Platzhalter in zeig und bild, Zahlen werden echte Zahlen", () => {
  const s = fuelleVorlage(VORLAGE, { n: 7 });
  assert.equal(s[0].zeig, "7 Perlen und 6 davor");
  assert.deepEqual(s[0].bild[1], { perlen: [7, 6], x: 60 });
  assert.deepEqual(s[0].bild[2], { zahl: 7, x: 80 });
  assert.deepEqual(s[0].bild[0], { figur: "ela", x: 20, haltung: "zeigen", aufgabe: "vorzeigen" });
  assert.equal(s[1].zeig, "");
});

test("fuelleVorlage: rein, Vorlage bleibt unverändert", () => {
  const kopie = structuredClone(VORLAGE);
  fuelleVorlage(VORLAGE, { n: 3 });
  assert.deepEqual(VORLAGE, kopie);
});

test("fuelleVorlage: weitere Schlüssel (m, grenze, op) und Text-Werte", () => {
  const s = fuelleVorlage({ szenen: [{ sprich: "Wir rechnen.", zeig: "{n} {op} {m} bis {grenze}", bild: [{ zahl: "{m}" }] }] },
    { n: 8, m: 5, op: "+", grenze: "20" });
  assert.equal(s[0].zeig, "8 + 5 bis 20");
  assert.deepEqual(s[0].bild, [{ zahl: 5 }]);
});

test("fuelleVorlage: Arithmetik mit {n-1} und {n+2}", () => {
  const s = fuelleVorlage({ szenen: [{ sprich: "So.", zeig: "{n+2}/{n-1}", bild: [{ zahl: "{n+2}" }] }] }, { n: 10 });
  assert.equal(s[0].zeig, "12/9");
  assert.deepEqual(s[0].bild, [{ zahl: 12 }]);
});

test("fuelleVorlage: sprich ohne zeig zeigt später sprich (Feld bleibt, zeig leer)", () => {
  const s = fuelleVorlage({ szenen: [{ sprich: "Hallo Ela." }] }, {});
  assert.equal(s[0].sprich, "Hallo Ela.");
  assert.equal(s[0].zeig, "");
  assert.deepEqual(s[0].bild, []);
});

test("fuelleVorlage: sprich mit Ziffer, Zahlwort oder Platzhalter ist ein Fehler", () => {
  for (const sprich of ["Das sind 7 Perlen.", "Das sind {n} Perlen.", "Es sind sieben Perlen.", "Zehn Perlen."])
    assert.throws(() => fuelleVorlage({ szenen: [{ sprich, zeig: "x" }] }, { n: 7 }), /sprich/, sprich);
});

test("fuelleVorlage: Wörter, die nur wie Zahlwörter beginnen, sind erlaubt", () => {
  assert.doesNotThrow(() => fuelleVorlage({ szenen: [{ sprich: "Eimer, Nacht, einmal, Dreieck, Achtung.", zeig: "" }] }, {}));
});

test("fuelleVorlage: unbekannter Platzhalter ist ein Fehler", () => {
  assert.throws(() => fuelleVorlage({ szenen: [{ sprich: "Hallo.", zeig: "{q}" }] }, { n: 1 }), /q/);
  assert.throws(() => fuelleVorlage({ szenen: [{ sprich: "Hallo.", zeig: "{n-1}" }] }, { n: "a" }), /n/);
});

test("fuelleVorlage: leere oder fehlende Vorlage ergibt keine Szenen", () => {
  assert.deepEqual(fuelleVorlage({ szenen: [] }, { n: 1 }), []);
  assert.deepEqual(fuelleVorlage(null, {}), []);
  assert.deepEqual(fuelleVorlage({}, undefined), []);
});

test("fuelleVorlage: alle Zahlwörter in sprich werden abgelehnt", () => {
  const wort = ["null", "zwo", "elf", "zwölf", "dreizehn", "vierzehn", "fünfzehn", "sechzehn", "siebzehn", "achtzehn", "neunzehn",
    "zwanzig", "dreißig", "dreissig", "vierzig", "fünfzig", "sechzig", "siebzig", "achtzig", "neunzig", "hundert", "einhundert", "tausend", "eintausend"];
  for (const w of wort) assert.throws(() => fuelleVorlage({ szenen: [{ sprich: `Da sind ${w} Perlen.`, zeig: "" }] }, {}), /sprich/, w);
  assert.doesNotThrow(() => fuelleVorlage({ szenen: [{ sprich: "Eimer, Achtung, einmal, Zehnerstab, Vierecke.", zeig: "" }] }, {}));
});
