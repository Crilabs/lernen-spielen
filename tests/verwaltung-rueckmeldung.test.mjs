import { test } from "node:test";
import assert from "node:assert/strict";
import { ARTEN, befehlFuer, neuerAuftrag } from "../werkzeuge/verwaltung/auftraege.mjs";
import {
  BEREICHE, SCHAETZUNG_AENDERUNG, befehlMitRueckmeldungen, ordneRueckmeldung, rueckmeldungenZu, stueckVon,
} from "../werkzeuge/verwaltung/rueckmeldung.mjs";

const JETZT = new Date("2026-11-17T12:00:00Z");
const auftrag = (id, art, ziel, status, extra = {}) => ({ id, art, ziel, befehl: `${art} ${ziel}`, status, notiz: "", ergebnis: null, ...extra });

test("ARTEN: Änderung ist eine Auftragsart", () => {
  assert.ok(ARTEN.includes("aenderung"));
  assert.deepEqual(BEREICHE, ["spiel", "buch", "echte-dinge"]);
});

test("befehlFuer: Änderung nennt Bereich und Id", () => {
  assert.equal(befehlFuer("aenderung", "G02", "spiel"), "Rückmeldung umsetzen spiel G02");
  assert.equal(befehlFuer("aenderung", "kopf-bis-fuss", "buch"), "Rückmeldung umsetzen buch kopf-bis-fuss");
  assert.throws(() => befehlFuer("aenderung", "G02"), /Bereich/);
  const n = neuerAuftrag({ art: "aenderung", ziel: "G02", bereich: "spiel", schaetzung_eur: 3 }, JETZT);
  assert.equal(n.bereich, "spiel");
  assert.equal(n.befehl, "Rückmeldung umsetzen spiel G02");
});

test("stueckVon: Art und Id; Antwort zählt zum Stück ihres Ursprungs, Ideen und Freies zu keinem", () => {
  const l = [
    auftrag("s", "spiel", "G02", "beantwortet"),
    auftrag("a1", "antwort", "s", "beantwortet"),
    auftrag("a2", "antwort", "a1", "wartet"),
    auftrag("e", "echte-dinge", ["t1", "t2"], "wartet"),
    auftrag("b", "buch", "hund", "wartet"),
    auftrag("x", "aenderung", "hund", "wartet", { bereich: "buch" }),
    auftrag("i", "ideen", "G05", "wartet-auf-christian"),
    auftrag("f", "frei", "Mach X", "wartet"),
  ];
  const s = (id) => stueckVon(l, l.find((a) => a.id === id));
  assert.deepEqual(s("s"), { bereich: "spiel", ids: ["G02"] });
  assert.deepEqual(s("a2"), { bereich: "spiel", ids: ["G02"] });
  assert.deepEqual(s("e"), { bereich: "echte-dinge", ids: ["t1", "t2"] });
  assert.deepEqual(s("b"), { bereich: "buch", ids: ["hund"] });
  assert.deepEqual(s("x"), { bereich: "buch", ids: ["hund"] });
  assert.equal(s("i"), null);
  assert.equal(s("f"), null);
  // Kreis in den Antworten bricht nicht
  const kreis = [auftrag("k1", "antwort", "k2", "wartet"), auftrag("k2", "antwort", "k1", "wartet")];
  assert.equal(stueckVon(kreis, kreis[0]), null);
});

test("ordneRueckmeldung 1: wartet ein Auftrag zum Stück, wird angehängt (Befehl bleibt)", () => {
  const l = [auftrag("s", "spiel", "G02", "beantwortet"), auftrag("a", "antwort", "s", "wartet"), auftrag("z", "spiel", "M01", "wartet")];
  const r = ordneRueckmeldung(l, { bereich: "spiel", id: "G02", text: "  Ziehen unsichtbar  " }, JETZT);
  assert.equal(r.wie, "angehaengt");
  assert.equal(r.auftrag.id, "a");
  assert.equal(r.liste.length, 3);
  assert.equal(r.liste[1].befehl, "antwort s");
  assert.deepEqual(r.liste[1].rueckmeldungen, [{ text: "Ziehen unsichtbar", zeit: JETZT.toISOString() }]);
  const r2 = ordneRueckmeldung(r.liste, { bereich: "spiel", id: "G02", text: "Rahmen weg" }, JETZT);
  assert.equal(r2.liste[1].rueckmeldungen.length, 2);
  assert.equal(l[1].rueckmeldungen, undefined, "Eingabeliste unverändert");
});

test("ordneRueckmeldung 1: Echte Dinge mit mehreren Themen im wartenden Auftrag", () => {
  const l = [auftrag("e", "echte-dinge", ["t1", "t2"], "wartet")];
  const r = ordneRueckmeldung(l, { bereich: "echte-dinge", id: "t2", text: "Bild fehlt" }, JETZT);
  assert.equal(r.wie, "angehaengt");
  assert.equal(r.auftrag.id, "e");
});

test("ordneRueckmeldung 2: wartet ein Auftrag auf Christian, wird die Rückmeldung seine Antwort", () => {
  const l = [auftrag("b", "buch", "hund", "wartet-auf-christian", { ergebnis: { frage: "Passt Kapitel 6?" } })];
  const r = ordneRueckmeldung(l, { bereich: "buch", id: "hund", text: "Seite 3 Foto tauschen" }, JETZT);
  assert.equal(r.wie, "antwort");
  assert.equal(r.liste[0].status, "beantwortet");
  assert.equal(r.auftrag.art, "antwort");
  assert.equal(r.auftrag.ziel, "b");
  assert.deepEqual(r.auftrag.rueckmeldungen, [{ text: "Seite 3 Foto tauschen", zeit: JETZT.toISOString() }]);
  // Der Text steht nur einmal im Befehl, den der Lauf baut
  const befehl = befehlMitRueckmeldungen(r.auftrag);
  assert.equal(befehl.split("Seite 3 Foto tauschen").length, 2);
});

test("ordneRueckmeldung 2: wartende Ideen zählen nicht", () => {
  const l = [auftrag("i", "ideen", "G05", "wartet-auf-christian")];
  const r = ordneRueckmeldung(l, { bereich: "spiel", id: "G05", text: "x" }, JETZT);
  assert.equal(r.wie, "neu");
  assert.equal(l.length, 1);
});

test("ordneRueckmeldung 3: läuft einer oder keiner, neuer Änderungs-Auftrag am Ende", () => {
  const l = [auftrag("s", "spiel", "G02", "laeuft"), auftrag("z", "buch", "x", "wartet")];
  const r = ordneRueckmeldung(l, { bereich: "spiel", id: "G02", text: "Knopf größer" }, JETZT);
  assert.equal(r.wie, "neu");
  assert.equal(r.liste.length, 3);
  assert.equal(r.liste[2], r.auftrag);
  assert.equal(r.auftrag.art, "aenderung");
  assert.equal(r.auftrag.bereich, "spiel");
  assert.equal(r.auftrag.ziel, "G02");
  assert.equal(r.auftrag.status, "wartet");
  assert.equal(r.auftrag.schaetzung_eur, SCHAETZUNG_AENDERUNG.spiel);
  assert.deepEqual(r.auftrag.rueckmeldungen, [{ text: "Knopf größer", zeit: JETZT.toISOString() }]);
});

test("ordneRueckmeldung 3: Schätzung je Bereich; Echte Dinge als Liste wie sonst", () => {
  assert.deepEqual(SCHAETZUNG_AENDERUNG, { spiel: 3, buch: 2, "echte-dinge": 1 });
  const r = ordneRueckmeldung([], { bereich: "echte-dinge", id: "t1", text: "x" }, JETZT);
  assert.equal(r.auftrag.ziel, "t1");
  assert.equal(r.auftrag.schaetzung_eur, 1);
  assert.equal(r.auftrag.befehl, "Rückmeldung umsetzen echte-dinge t1");
});

test("ordneRueckmeldung 3: geparktes Spiel wird weitergebaut (Art spiel)", () => {
  const r = ordneRueckmeldung([], { bereich: "spiel", id: "G02", text: "Rahmen weg", geparkt: true, schaetzungSpiel: 12 }, JETZT);
  assert.equal(r.wie, "neu");
  assert.equal(r.auftrag.art, "spiel");
  assert.equal(r.auftrag.befehl, "Spiel entwickeln G02");
  assert.equal(r.auftrag.schaetzung_eur, 12);
  assert.equal(r.auftrag.rueckmeldungen.length, 1);
});

test("ordneRueckmeldung: prüft Bereich, Id und Text", () => {
  assert.throws(() => ordneRueckmeldung([], { bereich: "film", id: "G02", text: "x" }, JETZT), /Bereich/);
  assert.throws(() => ordneRueckmeldung([], { bereich: "spiel", id: "../x", text: "x" }, JETZT), /Id/);
  assert.throws(() => ordneRueckmeldung([], { bereich: "spiel", id: "G02", text: "   " }, JETZT), /Rückmeldung fehlt/);
  assert.throws(() => ordneRueckmeldung([], { bereich: "spiel", id: "G02", text: "x".repeat(4001) }, JETZT), /4000/);
});

test("befehlMitRueckmeldungen: ohne Rückmeldung unverändert, sonst Abschnitt am Ende mit allen Punkten", () => {
  assert.equal(befehlMitRueckmeldungen({ befehl: "Spiel entwickeln G02 --vorgabe v.md" }), "Spiel entwickeln G02 --vorgabe v.md");
  assert.equal(befehlMitRueckmeldungen({ befehl: "X", rueckmeldungen: [] }), "X");
  const b = befehlMitRueckmeldungen({ befehl: "Spiel entwickeln G02 --vorgabe v.md", rueckmeldungen: [
    { text: "Ziehen unsichtbar", zeit: "2026-11-17T12:00:00Z" }, { text: "Zeile 1\nZeile 2", zeit: "2026-11-17T12:05:00Z" }] });
  assert.ok(b.startsWith("Spiel entwickeln G02 --vorgabe v.md\n\n## Rückmeldung von Christian"));
  assert.match(b, /Ziehen unsichtbar/);
  assert.match(b, /Zeile 1\n {2}Zeile 2/);
  assert.match(b, /ausdrücklich/);
});

test("rueckmeldungenZu: alle Rückmeldungen eines Stücks mit dem Stand ihres Auftrags, neueste zuerst", () => {
  const l = [
    auftrag("s", "spiel", "G02", "erledigt", { rueckmeldungen: [{ text: "alt", zeit: "2026-11-17T10:00:00Z" }] }),
    auftrag("a", "aenderung", "G02", "wartet", { bereich: "spiel", rueckmeldungen: [{ text: "neu", zeit: "2026-11-17T11:00:00Z" }] }),
    auftrag("b", "aenderung", "G02", "wartet", { bereich: "buch", rueckmeldungen: [{ text: "anderes Stück", zeit: "2026-11-17T11:00:00Z" }] }),
  ];
  assert.deepEqual(rueckmeldungenZu(l, "spiel", "G02").map((x) => [x.text, x.status, x.auftrag]), [["neu", "wartet", "a"], ["alt", "erledigt", "s"]]);
});
