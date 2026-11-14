// Anleitungen „Mit echten Dingen“ (docs/mit-echten-dingen.md): Verzeichnis aktuell, Form jeder Datei, die Regeln
// für den Text, soweit sie sich ohne Lesen prüfen lassen (Rest: Prüfung E1–E11 durch einen frischen Agenten).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { anleitungen, baueVerzeichnis, themenDerDatei, alsText, VERZEICHNIS, VERZEICHNIS_ENTWURF } from "../werkzeuge/echte-dinge/verzeichnis.mjs";
import { liesAnleitung, formText } from "../spiele/rahmen/markdown.js";

const plan = JSON.parse(readFileSync(new URL("../spiele/lernplan.json", import.meta.url), "utf8"));
const themen = new Map(plan.themen.map((t) => [t.id, t]));
const liste = anleitungen();

// Wortliste grundsaetze.md 3.2, „schnell“ (Druck), Fachbegriffe, die §5.1 ausschließt, und Elternsprache statt „ihr“.
const VERBOTEN = [
  /\b(super|toll|klasse|prima|spitze|perfekt|unglaublich|wahnsinn|klug|schlau|profi|brav|lieb|fleißig|falsch|leider|schade|fehler|endlich|schnell\w*)\b/i,
  /oh nein|schon wieder|immer noch|schaffst du|ganz leicht|besser als|schneller als/i,
  /\b(namenwort|hauptwort|dingwort|tunwort|tätigkeitswort|zeitwort|wiewort|eigenschaftswort|selbstlaut|mitlaut|ergibt)\b/i,
  /\bIhr Kind\b|\bSie\b|\bIhnen\b|\bIhre[mnrs]?\b/,
];

test("es gibt Anleitungen, und beide Verzeichnisse passen zu den Dateien (sonst: npm run echte-dinge)", () => {
  assert.ok(liste.length >= 1);
  assert.equal(readFileSync(VERZEICHNIS, "utf8"), alsText(baueVerzeichnis(liste, plan)));
  assert.equal(readFileSync(VERZEICHNIS_ENTWURF, "utf8"), alsText(baueVerzeichnis(liste, plan, { entwuerfe: true })));
});

const datei = (thema, kopf) => ({ fach: "mathe", thema, text: `---\nthema: ${thema}\n${kopf}---\n# T\n\n## Am Tisch: A\n\nText` });
const PLAN = { themen: [
  { id: "a", name: "Einmalig", strang: "mathe" }, { id: "b", name: "Doppelt", strang: "mathe" },
  { id: "c", name: "Doppelt", strang: "lesen" }, { id: "d", name: "Auch einmalig", strang: "mathe" },
] };

test("Entwürfe und geparkte Anleitungen stehen nicht im Verzeichnis der App; das Entwurfs-Verzeichnis hat nur die Entwürfe dazu", () => {
  const l = [datei("a", ""), datei("b", "entwurf: true\n"), datei("d", "entwurf: true\ngeparkt: true\n")];
  assert.deepEqual(Object.keys(baueVerzeichnis(l, PLAN).themen), ["a"]);
  assert.deepEqual(Object.keys(baueVerzeichnis(l, PLAN, { entwuerfe: true }).themen), ["a", "b"]);
  assert.equal(baueVerzeichnis(l, PLAN, { entwuerfe: true }).themen.b.entwurf, true);
});

const familie = (name, ids, kopf = "") => ({ fach: "mathe", thema: name, text: `---\nthemen:\n${ids.map((i) => `  - ${i}`).join("\n")}\n${kopf}---\n# T\n\n## Am Tisch: A\n\nText` });

test("Familie: eine Datei mit `themen:` trägt jedes ihrer Themen, jedes mit dem Pfad der Datei", () => {
  const v = baueVerzeichnis([datei("b", ""), familie("fam", ["a", "d"])], PLAN).themen;
  assert.deepEqual(Object.keys(v).sort(), ["a", "b", "d"]);
  assert.equal(v.a.datei, "mathe/fam.md");
  assert.equal(v.d.datei, "mathe/fam.md");
  assert.equal(v.b.datei, "mathe/b.md");
  assert.equal(v.a.name, "Einmalig");
});

test("Familie: ein Entwurf steht nur im Entwurfs-Verzeichnis", () => {
  const l = [familie("fam", ["a", "d"], "entwurf: true\n")];
  assert.deepEqual(Object.keys(baueVerzeichnis(l, PLAN).themen), []);
  assert.deepEqual(Object.keys(baueVerzeichnis(l, PLAN, { entwuerfe: true }).themen), ["a", "d"]);
});

test("ein Thema in zwei Dateien ist ein Fehler, der beide Dateien nennt", () => {
  assert.throws(() => baueVerzeichnis([datei("a", ""), familie("fam", ["a", "d"])], PLAN, { entwuerfe: true }),
    /a.*mathe\/a\.md.*mathe\/fam\.md/);
});

test("themenDerDatei: aus `themen` oder `thema`", () => {
  assert.deepEqual(themenDerDatei({ themen: ["a", "d"] }), ["a", "d"]);
  assert.deepEqual(themenDerDatei({ thema: "a" }), ["a"]);
  assert.deepEqual(themenDerDatei({}), []);
});

test("Name des Themas nur, wenn er im ganzen Lernplan eindeutig ist", () => {
  const v = baueVerzeichnis([datei("a", ""), datei("b", "")], PLAN).themen;
  assert.equal(v.a.name, "Einmalig");
  assert.equal(v.b.name, ""); // „Doppelt“ heißt auch c
  // im echten Lernplan gibt es doppelte Namen (z. B. „Stimmt das?“)
  const zahl = new Map();
  for (const t of plan.themen) zahl.set(t.name, (zahl.get(t.name) ?? 0) + 1);
  assert.ok([...zahl.values()].some((n) => n > 1));
  for (const [id, e] of Object.entries(JSON.parse(readFileSync(VERZEICHNIS_ENTWURF, "utf8")).themen)) {
    if (e.name) assert.equal(zahl.get(e.name), 1, id);
  }
});

for (const a of liste) {
  test(`${a.fach}/${a.thema}.md: Kopf, Thema im Lernplan, Formen vollständig, Regeln für den Text`, () => {
    const l = liesAnleitung(a.text);
    assert.ok(("thema" in l.kopf) !== ("themen" in l.kopf), "genau eines von thema / themen im Kopf");
    if ("thema" in l.kopf) assert.equal(l.kopf.thema, a.thema, "thema im Kopf = Dateiname");
    else assert.ok(Array.isArray(l.kopf.themen) && l.kopf.themen.length >= 2, "themen: eine Liste mit mindestens zwei Themen");
    assert.equal(l.kopf.fach, a.fach, "fach im Kopf = Ordner");
    for (const id of themenDerDatei(l.kopf)) assert.equal(themen.get(id)?.strang, a.fach, `${id} steht im Lernplan in diesem Fach`);
    assert.ok(Array.isArray(l.kopf.quellen) && l.kopf.quellen.length >= 1, "Quellen im Kopf");
    for (const q of /** @type {string[]} */ (l.kopf.quellen)) assert.match(q, /https?:\/\/\S+/, `Quelle mit Adresse: ${q}`);
    assert.ok(l.titel, "Überschrift # in Alltagssprache");
    assert.ok(l.formen.length >= 1 && l.formen.length <= 3, "eine Grundform, höchstens zwei Varianten");
    assert.equal(l.vorspann.length, 0, "nichts zwischen Überschrift und erster Form");
    for (const f of l.formen) {
      const p = f.bloecke.filter((b) => b.typ === "p").map((b) => /** @type {any} */ (b).text);
      assert.ok(p.some((t) => /^Ihr braucht: \S/.test(t)), `${f.name}: „Ihr braucht:“`);
      assert.ok(f.bloecke.some((b) => b.typ === "ol" && b.punkte.length >= 2), `${f.name}: Schritte als nummerierte Liste`);
      assert.ok(p.some((t) => /^\*\*Darauf kommt es an:\*\* \S/.test(t)), `${f.name}: „Darauf kommt es an“`);
      assert.ok(p.some((t) => /\*\*Leichter:\*\* \S/.test(t) && /\*\*Schwerer:\*\* \S/.test(t)), `${f.name}: Leichter und Schwerer`);
      const text = formText(f);
      const woerter = text.split(/\s+/).filter(Boolean).length;
      assert.ok(woerter <= 130, `${f.name}: höchstens etwa 120 Wörter (sind ${woerter})`);
      for (const muster of VERBOTEN) assert.doesNotMatch(text, muster, `${f.name}: Wortliste/Anrede`);
    }
  });
}
