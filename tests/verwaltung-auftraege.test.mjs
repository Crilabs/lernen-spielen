import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  ARTEN, STATUS, befehlFuer, waehleIdee, ladeAuftraege, naechsterWartender, neuerAuftrag, speichereAuftraege, statusAusErgebnis, streiche, verschiebe,
} from "../werkzeuge/verwaltung/auftraege.mjs";

const JETZT = new Date("2026-11-16T10:00:00Z");
const a = (id, status = "wartet") => ({ id, art: "frei", ziel: id, befehl: id, status });

test("ARTEN: die sieben Auftragsarten", () => {
  assert.deepEqual(ARTEN, ["spiel", "echte-dinge", "buch", "einfuehrung", "frei", "ideen", "aenderung"]);
});

test("befehlFuer: ein Befehl je Art", () => {
  assert.equal(befehlFuer("spiel", "M15"), "Spiel entwickeln M15");
  assert.equal(befehlFuer("echte-dinge", ["a", "b"]), "Mit echten Dingen a b");
  assert.equal(befehlFuer("echte-dinge", "a"), "Mit echten Dingen a");
  assert.equal(befehlFuer("buch", "hund"), "Sachgeschichte hund");
  assert.match(befehlFuer("einfuehrung", "zerlegen-2"), /^Einführung für Thema zerlegen-2 nach den Vorlagen in spiele\/einfuehrungen\//);
  assert.equal(befehlFuer("frei", "Mach X"), "Mach X");
  assert.equal(befehlFuer("ideen", "G05"), "Spielideen G05");
});

test("neuerAuftrag: wartet, mit Befehl, Schätzung und Zeit", () => {
  const n = neuerAuftrag({ art: "spiel", ziel: "M15", schaetzung_eur: 7.5 }, JETZT);
  assert.match(n.id, /^a-\d+-[a-z0-9]+$/);
  assert.equal(n.status, "wartet");
  assert.equal(n.befehl, "Spiel entwickeln M15");
  assert.equal(n.schaetzung_eur, 7.5);
  assert.equal(n.angelegt, "2026-11-16T10:00:00.000Z");
});

test("neuerAuftrag: unbekannte Art oder leeres Ziel wirft", () => {
  assert.throws(() => neuerAuftrag({ art: "x", ziel: "M1" }, JETZT), /Art/);
  assert.throws(() => neuerAuftrag({ art: "spiel", ziel: "" }, JETZT), /Ziel/);
  assert.throws(() => neuerAuftrag({ art: "echte-dinge", ziel: [] }, JETZT), /Ziel/);
  assert.throws(() => neuerAuftrag({ art: "spiel", ziel: "M1; rm -rf" }, JETZT), /Ziel/);
});

test("verschiebe: hoch und runter, am Rand unverändert", () => {
  const l = [a("x"), a("y"), a("z")];
  assert.deepEqual(verschiebe(l, "y", -1).map((x) => x.id), ["y", "x", "z"]);
  assert.deepEqual(verschiebe(l, "y", 1).map((x) => x.id), ["x", "z", "y"]);
  assert.deepEqual(verschiebe(l, "x", -1).map((x) => x.id), ["x", "y", "z"]);
  assert.deepEqual(l.map((x) => x.id), ["x", "y", "z"]);
});

test("streiche: nur wartende, laufende bleiben", () => {
  const l = [a("x"), a("y", "laeuft")];
  assert.equal(streiche(l, "x")[0].status, "gestrichen");
  assert.equal(streiche(l, "y")[1].status, "laeuft");
});

test("naechsterWartender: der oberste mit Status wartet", () => {
  assert.equal(naechsterWartender([a("x", "erledigt"), a("y"), a("z")])?.id, "y");
  assert.equal(naechsterWartender([a("x", "erledigt")]), null);
});

test("statusAusErgebnis: Zuordnung der Ergebnisse", () => {
  assert.equal(statusAusErgebnis(null), "fehlgeschlagen");
  assert.equal(statusAusErgebnis({ status: "gruen" }), "erledigt");
  assert.equal(statusAusErgebnis({ status: "erledigt" }), "erledigt");
  assert.equal(statusAusErgebnis({ status: "freigabe" }), "wartet-auf-christian");
  assert.equal(statusAusErgebnis({ status: "geparkt" }), "wartet-auf-christian");
  assert.equal(statusAusErgebnis({ status: "abgebrochen" }), "fehlgeschlagen");
  assert.equal(statusAusErgebnis({ status: "quatsch" }), "fehlgeschlagen");
});

test("ladeAuftraege/speichereAuftraege: fehlende Datei leer, Rundreise, kaputte Datei wirft und bleibt", () => {
  const d = mkdtempSync(join(tmpdir(), "auftraege-"));
  const f = join(d, "auftraege.json");
  assert.deepEqual(ladeAuftraege(f), []);
  speichereAuftraege(f, [a("x")]);
  assert.deepEqual(ladeAuftraege(f), [a("x")]);
  writeFileSync(f, "{kaputt");
  assert.throws(() => ladeAuftraege(f), /auftraege.json ist kein gültiges JSON/);
  assert.equal(readFileSync(f, "utf8"), "{kaputt");
  rmSync(d, { recursive: true });
});

test("beantworte: Folgeauftrag mit Bezug, Frage und Antwort; der alte wird beantwortet", async () => {
  const { beantworte, SCHAETZUNG_ANTWORT } = await import("../werkzeuge/verwaltung/auftraege.mjs");
  const alt = { ...a("x1", "wartet-auf-christian"), art: "spiel", befehl: "Spiel entwickeln M08",
    ergebnis: { status: "freigabe", zusammenfassung: "M08 gebaut, geparkt", frage: "Darf die Karte rein?" } };
  const { liste, neu } = beantworte([alt, a("x2")], "x1", "  Ja  ", JETZT);
  assert.equal(neu.art, "antwort");
  assert.equal(neu.ziel, "x1");
  assert.equal(neu.status, "wartet");
  assert.equal(neu.schaetzung_eur, SCHAETZUNG_ANTWORT);
  for (const teil of ["Spiel entwickeln M08", "M08 gebaut, geparkt", "Darf die Karte rein?", "Antwort von Christian: Ja",
    "werkzeuge/verwaltung/ergebnisse/", ".claude/skills/spiel-entwickeln/SKILL.md"]) assert.ok(neu.befehl.includes(teil), teil);
  assert.equal(liste.length, 3);
  assert.equal(liste[2], neu);
  assert.equal(liste[0].status, "beantwortet");
  assert.equal(liste[0].notiz, "Antwort: Ja");
});

test("beantworte: nur bei „wartet auf dich“ und mit Text", async () => {
  const { beantworte } = await import("../werkzeuge/verwaltung/auftraege.mjs");
  assert.throws(() => beantworte([a("x1", "erledigt")], "x1", "Ja", JETZT), /wartet nicht auf eine Antwort/);
  assert.throws(() => beantworte([a("x1", "wartet-auf-christian")], "x1", "   ", JETZT), /Antwort fehlt/);
  assert.throws(() => beantworte([], "x1", "Ja", JETZT), /nicht gefunden/);
});

test("lehneAb: erledigt mit Notiz, kein neuer Auftrag; nur bei „wartet auf dich“", async () => {
  const { lehneAb } = await import("../werkzeuge/verwaltung/auftraege.mjs");
  const l = lehneAb([a("x1", "wartet-auf-christian"), a("x2")], "x1");
  assert.equal(l.length, 2);
  assert.equal(l[0].status, "erledigt");
  assert.equal(l[0].notiz, "abgelehnt");
  assert.throws(() => lehneAb([a("x1")], "x1"), /wartet nicht auf eine Antwort/);
});

test("STATUS kennt „beantwortet“", () => {
  assert.ok(STATUS.includes("beantwortet"));
});

// --- Spielideen (docs/superpowers/specs/2026-11-17-spielideen-design.md) ---------------------------------------
const IDEEN = [{ titel: "Hüpfkette", text: "Lena hüpft." }, { titel: "Brückenbau", text: "Timo baut." }, { titel: "Zauberwald", text: "Aylin zaubert." }];
const ideenAuftrag = (ergebnis = { status: "geparkt", zusammenfassung: "drei", frage: "Welche?", ideen: IDEEN }) =>
  ({ id: "i-1", art: "ideen", ziel: "G05", befehl: "Spielideen G05", status: "wartet-auf-christian", ergebnis });

test("waehleIdee: Karte → Spiel-Auftrag mit Vorgabe direkt dahinter", () => {
  const { liste, neu } = waehleIdee([ideenAuftrag(), a("x")], "i-1", { karte: 2 }, JETZT);
  assert.deepEqual(liste.map((x) => x.id), ["i-1", neu.id, "x"]);
  assert.equal(neu.art, "spiel");
  assert.equal(neu.ziel, "G05");
  assert.equal(neu.status, "wartet");
  assert.equal(neu.befehl, `Spiel entwickeln G05 --vorgabe werkzeuge/verwaltung/vorgaben/${neu.id}.md`);
  for (const t of ["Hüpfkette", "Brückenbau", "Zauberwald", "Karte 2"]) assert.ok(neu.vorgabe.includes(t), t);
  assert.match(neu.vorgabe, /^# Vorgabe von Christian/);
  assert.equal(liste[0].status, "beantwortet");
  assert.equal(liste[0].notiz, "Wahl: Karte 2 „Brückenbau“");
});

test("waehleIdee: eigener Text, die Skizzen bleiben in der Vorgabe", () => {
  const { liste, neu } = waehleIdee([ideenAuftrag()], "i-1", { text: "die zweite, aber mit Hund" }, JETZT);
  for (const t of ["Hüpfkette", "Brückenbau", "Zauberwald", "die zweite, aber mit Hund"]) assert.ok(neu.vorgabe.includes(t), t);
  assert.equal(liste[0].notiz, "Wahl: eigene Idee");
});

test("waehleIdee: falsche Karte, leerer Text, falsche Art oder Status, fehlende Ideen werfen", () => {
  assert.throws(() => waehleIdee([ideenAuftrag()], "i-1", { karte: 0 }));
  assert.throws(() => waehleIdee([ideenAuftrag()], "i-1", { karte: 4 }));
  assert.throws(() => waehleIdee([ideenAuftrag()], "i-1", { text: "  " }));
  assert.throws(() => waehleIdee([{ ...ideenAuftrag(), art: "spiel" }], "i-1", { karte: 1 }));
  assert.throws(() => waehleIdee([{ ...ideenAuftrag(), status: "beantwortet" }], "i-1", { karte: 1 }));
  assert.throws(() => waehleIdee([ideenAuftrag({ status: "geparkt" })], "i-1", { karte: 1 }));
  assert.throws(() => waehleIdee([ideenAuftrag({ status: "geparkt", ideen: [] })], "i-1", { karte: 1 }));
  assert.equal(waehleIdee([ideenAuftrag({ status: "geparkt" })], "i-1", { text: "Eigenes" }).neu.art, "spiel");
});

// Ideen laufen gleichzeitig (2026-11-17): Vier Prozesse änderten auftraege.json zugleich, drei Änderungen gingen
// verloren. aendereAuftraege sperrt Lesen–Ändern–Schreiben über Prozesse hinweg.
test("aendereAuftraege: acht Prozesse gleichzeitig, keine Änderung geht verloren", async () => {
  const { spawn } = await import("node:child_process");
  const o = mkdtempSync(join(tmpdir(), "sperre-"));
  const datei = join(o, "auftraege.json");
  speichereAuftraege(datei, Array.from({ length: 8 }, (_, i) => ({ id: `a${i}`, status: "wartet" })));
  const modul = new URL("../werkzeuge/verwaltung/auftraege.mjs", import.meta.url).href;
  const skript = (i) => `import { aendereAuftraege } from ${JSON.stringify(modul)};
    for (let k = 0; k < 5; k++) aendereAuftraege(${JSON.stringify(datei)}, (l) => l.map((a) => a.id === "a${i}" ? { ...a, n: (a.n ?? 0) + 1 } : a));`;
  await Promise.all(Array.from({ length: 8 }, (_, i) => new Promise((ok, nein) => {
    const k = spawn(process.execPath, ["--input-type=module", "-e", skript(i)], { stdio: "inherit" });
    k.on("close", (c) => (c === 0 ? ok() : nein(new Error(`Prozess ${i}: ${c}`))));
  })));
  assert.deepEqual(ladeAuftraege(datei).map((a) => a.n), [5, 5, 5, 5, 5, 5, 5, 5]);
  rmSync(o, { recursive: true });
});
