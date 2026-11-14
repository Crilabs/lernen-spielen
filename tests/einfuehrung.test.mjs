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

// Eigene Einführung eines Spiels (EINFUEHRUNG in der SPIELWELT von spiele/vorlage/spiel.js): Der Pfad ist relativ zu
// spiele/, weil spieleEinfuehrung ihn an spiele/einfuehrung.js auflöst. Geprüft für die Vorlage und jedes Spiel.
const { readFileSync, readdirSync, existsSync } = await import("node:fs");
const { join, dirname } = await import("node:path");
const { fileURLToPath, pathToFileURL } = await import("node:url");
const SPIELE = join(dirname(fileURLToPath(import.meta.url)), "../spiele");

function spielDateien() {
  const dateien = [join(SPIELE, "vorlage/spiel.js")];
  for (const fach of readdirSync(SPIELE, { withFileTypes: true }).filter((d) => d.isDirectory())) {
    for (const spiel of readdirSync(join(SPIELE, fach.name), { withFileTypes: true }).filter((d) => d.isDirectory())) {
      const p = join(SPIELE, fach.name, spiel.name, "spiel.js");
      if (existsSync(p) && !dateien.includes(p)) dateien.push(p);
    }
  }
  return dateien;
}

test("Einführung des Spiels: ein Pfad relativ zu spiele/ löst sich so auf wie in spieleEinfuehrung", () => {
  const basis = pathToFileURL(join(SPIELE, "einfuehrung.js"));
  assert.equal(fileURLToPath(new URL("mathe/m14-zwei-tonnen/einfuehrung.json", basis)), join(SPIELE, "mathe/m14-zwei-tonnen/einfuehrung.json"));
  assert.equal(fileURLToPath(new URL("einfuehrungen/zerlegen.json", basis)), join(SPIELE, "einfuehrungen/zerlegen.json"));
});

test("Einführung des Spiels: Vorlage hat EINFUEHRUNG = null und reicht sie im RAHMEN an spieleEinfuehrung", () => {
  const s = readFileSync(join(SPIELE, "vorlage/spiel.js"), "utf8");
  assert.match(s, /^const EINFUEHRUNG = null;/m);
  assert.match(s, /EINFUEHRUNG\?\.vorlage \?\? r\.einfuehrung\.vorlage/);
});

test("Einführung des Spiels: jede genannte eigene Einführung liegt unter spiele/ und hat Szenen", () => {
  for (const datei of spielDateien()) {
    const m = readFileSync(datei, "utf8").match(/^const EINFUEHRUNG = (\{[\s\S]*?\});/m);
    if (!m) continue;
    const e = Function(`return (${m[1]})`)();
    for (const pfad of [e.vorlage, e.hintergrund].filter(Boolean))
      assert.ok(existsSync(join(SPIELE, pfad)), `${datei}: ${pfad} fehlt (Pfad relativ zu spiele/)`);
    const { szenen } = JSON.parse(readFileSync(join(SPIELE, e.vorlage), "utf8"));
    assert.ok(Array.isArray(szenen) && szenen.length > 0, `${datei}: ${e.vorlage} ohne Szenen`);
  }
});
