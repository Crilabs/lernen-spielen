import { test } from "node:test";
import assert from "node:assert/strict";
import { WURZEL } from "../werkzeuge/kosten/kosten.mjs";
import { baueUebersicht, katalogAbschnitte, liesQuellen } from "../werkzeuge/verwaltung/daten.mjs";

const PREISE = {
  stand: "x", usdInEur: { wert: 1 },
  claude: { m: { eingabeProMio: 1, ausgabeProMio: 0, waehrung: "EUR" } },
  bilder: { eingabeProMio: 0, ausgabeProMio: 0 }, stimme: { proMioZeichen: 0 },
};
const k = (mio, extra = {}) => ({ datum: "2026-11-16", phase: "bau", posten: "claude", modell: "m", eingabe: mio * 1e6, ausgabe: 0, einheit: "tokens", menge: mio * 1e6, ...extra });

const KATALOG = `## Teil A
### M01 Paare finden
- Hauptthemen: a, b (Kl. 1)
### M02 Zweites Spiel
- Hauptthemen: b
### M37 Kettenhüpfer
- Hauptthemen: c
`;

function quellen() {
  return {
    plan: {
      themen: [
        { id: "a", name: "A", strang: "mathe", klasse: 1, bereich: "Zahlen" },
        { id: "b", name: "B", strang: "mathe", klasse: 1, bereich: "Zahlen", einfuehrung: { vorlage: "einfuehrungen/zerlegen.json" } },
        { id: "c", name: "C", strang: "mathe", klasse: 2, bereich: "Mal" },
        { id: "d", name: "D", strang: "lesen", klasse: 1, bereich: "Laute" },
      ],
      ueberschriften: [{ id: "tiere", name: "Tiere", art: "sache" }],
      welten: [{ id: "haustiere", name: "Haustiere", ueberschrift: "tiere", klasse: 1, beschreibung: "x" }],
    },
    spieleJson: { kategorien: [{ id: "mathe", name: "Mathe", farbe: "#f0f" }], spiele: [{ id: "kettenhuepfer", datei: "mathe/m37-kettenhuepfer/index.html", probe: true }] },
    katalog: katalogAbschnitte(KATALOG, "docs/spielkatalog/mathe.md"),
    katalogUebersicht: "| [M01] x |\n| [M02] y |\n| [M37] z |\n| [M99] nur hier |\n",
    echteDinge: { themen: { a: { fach: "mathe", entwurf: false }, c: { fach: "mathe", entwurf: true } } },
    bibliothek: { raeume: [{ id: "tiere", regale: [{ id: "haustiere", welten: ["haustiere"], buecher: [{ id: "hund", titel: "Der Hund" }, { id: "katze", titel: "Die Katze" }] }] }] },
    geschichten: { geschichten: [{ id: "hund", titel: "Kalle", welt: "haustiere" }] },
    kosten: {
      spiele: [{ name: "mathe/m37-kettenhuepfer", eintraege: [k(10)] }],
      geparkt: [],
      analog: [k(2, { themen: 1, thema: ["a"] })],
      buecher: [{ id: "hund", name: "geschichten/hund", eintraege: [k(4)] }],
      bibliothek: [k(1)],
    },
    preise: PREISE,
  };
}

test("katalogAbschnitte: Id, Name und Hauptthemen je ### <Id>, Teil-Überschriften nicht", () => {
  const a = katalogAbschnitte(KATALOG, "docs/spielkatalog/mathe.md");
  assert.deepEqual(a.map((x) => x.id), ["M01", "M02", "M37"]);
  assert.deepEqual(a[0], { id: "M01", name: "Paare finden", datei: "docs/spielkatalog/mathe.md", hauptthemen: ["a", "b"] });
});

test("baueUebersicht: Thema in zwei Katalog-Spielen nennt beide", () => {
  const u = baueUebersicht(quellen(), []);
  assert.deepEqual(u.lernthemen.find((t) => t.id === "b").spiele, ["M01", "M02"]);
  assert.deepEqual(u.lernthemen.find((t) => t.id === "d").spiele, []);
});

test("baueUebersicht: Spielstatus probe, geplant, beauftragt; Kosten beim Spiel", () => {
  const u = baueUebersicht(quellen(), [{ art: "spiel", ziel: "M02", status: "wartet" }]);
  assert.equal(u.spiele.M37.status, "probe");
  assert.equal(u.spiele.M37.eur, 10);
  assert.equal(u.spiele.M01.status, "geplant");
  assert.equal(u.spiele.M02.status, "beauftragt");
});

test("baueUebersicht: geparktes Spiel", () => {
  const q = quellen();
  q.kosten.geparkt = [{ name: "geparkt/m01-paare-finden", eintraege: [k(1)], geparkt: true }];
  assert.equal(baueUebersicht(q, []).spiele.M01.status, "geparkt");
});

test("baueUebersicht: Echte Dinge fertig, Entwurf, beauftragt, fehlt; Einführung", () => {
  const u = baueUebersicht(quellen(), [{ art: "echte-dinge", ziel: ["d"], status: "laeuft" }]);
  const t = Object.fromEntries(u.lernthemen.map((x) => [x.id, x]));
  assert.equal(t.a.echteDinge, "fertig");
  assert.equal(t.a.echteDingeEur, 2);
  assert.equal(t.c.echteDinge, "entwurf");
  assert.equal(t.d.echteDinge, "beauftragt");
  assert.equal(t.b.echteDinge, "fehlt");
  assert.equal(t.b.einfuehrung, "einfuehrungen/zerlegen.json");
  assert.equal(t.a.einfuehrung, null);
});

test("baueUebersicht: Sachthemen mit Büchern fertig/geplant/beauftragt", () => {
  const u = baueUebersicht(quellen(), [{ art: "buch", ziel: "katze", status: "wartet" }]);
  const w = u.sachthemen[0];
  assert.equal(w.id, "haustiere");
  assert.deepEqual(w.buecher.map((b) => [b.id, b.status, b.eur]), [["hund", "fertig", 4], ["katze", "beauftragt", null]]);
});

test("baueUebersicht: Bibliothek nach Raum und Regal, Bücher mit Sachthemen", () => {
  const u = baueUebersicht(quellen(), []);
  assert.equal(u.bibliothek.length, 1);
  const raum = u.bibliothek[0];
  assert.equal(raum.id, "tiere");
  assert.equal(raum.name, "tiere");
  const regal = raum.regale[0];
  assert.deepEqual([regal.id, regal.name], ["haustiere", "haustiere"]);
  assert.deepEqual(regal.buecher.map((b) => [b.id, b.status, b.sachthemen]), [["hund", "fertig", ["haustiere"]], ["katze", "geplant", ["haustiere"]]]);
});

test("baueUebersicht: erledigte Aufträge zählen nicht als beauftragt", () => {
  const u = baueUebersicht(quellen(), [{ art: "spiel", ziel: "M02", status: "erledigt" }]);
  assert.equal(u.spiele.M02.status, "geplant");
});

test("baueUebersicht: Katalog-Hinweis, Kosten gesamt und Schätzungen", () => {
  const u = baueUebersicht(quellen(), []);
  assert.deepEqual(u.katalogHinweis, { nurUebersicht: ["M99"], nurAbschnitte: [] });
  assert.equal(u.kosten.gesamtEur, 10 + 2 + 4 + 1);
  assert.equal(u.schaetzung.spiel, 10);
  assert.equal(u.schaetzung.echteDingeJeThema, 2);
  assert.equal(u.schaetzung.buch, 4);
  assert.equal(u.kosten.katalog, 4);
});

test("baueUebersicht: ohne fertige Spiele schätzt ein Spiel 7,50 €", () => {
  const q = quellen();
  q.kosten.spiele = [];
  assert.equal(baueUebersicht(q, []).schaetzung.spiel, 7.5);
});

test("echtes Repo: 956 Lernthemen, 114 Sachthemen, M37 vorhanden", () => {
  const u = baueUebersicht(liesQuellen(WURZEL), []);
  assert.equal(u.lernthemen.length, 956);
  assert.equal(u.sachthemen.length, 114);
  assert.ok(u.spiele.M37);
});

test("baueUebersicht: offener Ideen-Auftrag macht das Spiel „beauftragt“, erledigter nicht", () => {
  assert.equal(baueUebersicht(quellen(), [{ art: "ideen", ziel: "M01", status: "laeuft" }]).spiele.M01.status, "beauftragt");
  assert.equal(baueUebersicht(quellen(), [{ art: "ideen", ziel: "M01", status: "wartet-auf-christian" }]).spiele.M01.status, "beauftragt");
  assert.equal(baueUebersicht(quellen(), [{ art: "ideen", ziel: "M01", status: "beantwortet" }]).spiele.M01.status, "geplant");
});

test("baueUebersicht: Lernthemen tragen Ziel, Beispiele und Zweck für die Ideen-Ansicht", () => {
  const u = baueUebersicht(liesQuellen(WURZEL), []);
  const mitZiel = u.lernthemen.find((t) => t.ziel);
  assert.ok(mitZiel, "mindestens ein Thema mit Ziel");
  assert.ok(Array.isArray(mitZiel.beispiele));
  assert.ok("zweck" in mitZiel);
});

test("baueUebersicht: offene Antwort oder Änderung zu einem ungebauten Spiel gilt als beauftragt", () => {
  const l = [
    { id: "s", art: "spiel", ziel: "M01", status: "beantwortet" },
    { id: "a", art: "antwort", ziel: "s", status: "wartet" },
    { id: "x", art: "aenderung", ziel: "M02", bereich: "spiel", status: "laeuft" },
  ];
  const u = baueUebersicht(quellen(), l);
  assert.equal(u.spiele.M01.status, "beauftragt");
  assert.equal(u.spiele.M02.status, "beauftragt");
  assert.equal(u.spiele.M37.status, "probe", "gebaute Spiele behalten ihren Stand");
});
