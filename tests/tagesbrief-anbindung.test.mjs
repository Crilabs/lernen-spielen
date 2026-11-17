import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const speicher = new Map();
globalThis.localStorage = {
  getItem: (k) => (speicher.has(k) ? speicher.get(k) : null),
  setItem: (k, v) => speicher.set(k, String(v)),
  removeItem: (k) => speicher.delete(k),
};
globalThis.window = {};
const { meldeRundenende, meldeGelesen, baueVorschauTopf, setzeZurueck, testHaken } = await import("../spiele/tagesbrief/anbindung.js");
const { gueltigesEreignis } = await import("../dienste/tagesbrief/pruefung.js");
const { neuerStand, migriereStand } = await import("../spiele/lernsteuerung.js");

const wurzel = new URL("../spiele/", import.meta.url);
const lies = (p) => JSON.parse(readFileSync(new URL(p, wurzel), "utf8"));
const ctx = { plan: lies("lernplan.json"), spiele: lies("spiele.json") };
const HEUTE = "2026-11-17";
const SCHLUESSEL = "lernstand-kind-1-lernplan";

/** Lader aus dem Dateisystem (wie fetch). */
const dateiLader = async (pfad) => {
  const url = new URL(pfad, wurzel);
  if (!existsSync(url)) return { ok: false };
  const roh = readFileSync(url);
  return { ok: true, json: async () => JSON.parse(roh.toString("utf8")), text: async () => roh.toString("utf8"),
    arrayBuffer: async () => roh.buffer.slice(roh.byteOffset, roh.byteOffset + roh.byteLength) };
};

let aufrufe;
/** Befehl-Attrappe: Status und Push-Antwort einstellbar. */
function attrappe({ zustand = "aktiv", pushen = { verschickt: [] }, wirft = false } = {}) {
  aufrufe = [];
  testHaken.setzeBefehl(async (name, args) => {
    aufrufe.push({ name, args });
    if (wirft) throw new Error("kaputt");
    return name === "tagesbrief_status" ? { zustand } : typeof pushen === "function" ? pushen() : pushen;
  });
}
const pushes = () => aufrufe.filter((a) => a.name === "tagesbrief_pushen");
const arten = (p) => p.args.ereignisse.map((e) => e.art);

/** Stand mit einem Thema im Zustand dran. */
function standDran(...ids) {
  const s = neuerStand();
  for (const id of ids) s.themen[id] = { z: "dran", stufe: "kopf", e: "", seit: "2026-11-10", k: "", u: "", frei: 0, v: [] };
  return s;
}

beforeEach(() => {
  speicher.clear();
  testHaken.setzeLader(dateiLader);
});

test("Rundenende mit gekonnt: gekonnt und naechstes, Profil wird mitgegeben", async () => {
  attrappe();
  await meldeRundenende(ctx, standDran("neunerreihe"), { thema: "zweierreihe", gekonnt: "zweierreihe", heute: HEUTE });
  assert.equal(pushes().length, 1);
  assert.equal(pushes()[0].args.profil, "kind-1");
  assert.deepEqual(arten(pushes()[0]), ["gekonnt", "naechstes"]);
  assert.equal(pushes()[0].args.ereignisse[0].daten.id, "zweierreihe");
});

test("Rundenende ohne gekonnt, Thema dran: dabei und naechstes", async () => {
  attrappe();
  await meldeRundenende(ctx, standDran("zweierreihe"), { thema: "zweierreihe", gekonnt: null, heute: HEUTE });
  assert.deepEqual(arten(pushes()[0]), ["dabei", "naechstes"]);
});

test("Rundenende, Thema nicht dran (Wiederholung): nur naechstes", async () => {
  attrappe();
  const stand = standDran("neunerreihe");
  stand.themen.zweierreihe = { z: "kann-ich" };
  await meldeRundenende(ctx, stand, { thema: "zweierreihe", gekonnt: null, heute: HEUTE });
  assert.deepEqual(arten(pushes()[0]), ["naechstes"]);
});

test("Gelesen: gelesen und naechstes", async () => {
  attrappe();
  await meldeGelesen(ctx, standDran("zweierreihe"), "wal", { heute: HEUTE });
  assert.deepEqual(arten(pushes()[0]), ["gelesen", "naechstes"]);
  assert.equal(pushes()[0].args.ereignisse[0].daten.id, "wal");
});

test("Gelesen: unbekannte oder ungültige Buch-Id pusht nichts", async () => {
  attrappe();
  await meldeGelesen(ctx, neuerStand(), "gibt-es-nicht", { heute: HEUTE });
  await meldeGelesen(ctx, neuerStand(), "../x", { heute: HEUTE });
  assert.equal(pushes().length, 0);
});

test("Status aus oder wartet: kein Push", async () => {
  for (const zustand of ["aus", "wartet"]) {
    attrappe({ zustand });
    await meldeRundenende(ctx, standDran("zweierreihe"), { thema: "zweierreihe", gekonnt: null, heute: HEUTE });
    assert.equal(pushes().length, 0);
  }
});

test("befehl wirft: keine Ausnahme nach außen", async () => {
  attrappe({ wirft: true });
  await meldeRundenende(ctx, standDran("zweierreihe"), { thema: "zweierreihe", gekonnt: null, heute: HEUTE });
  await meldeGelesen(ctx, neuerStand(), "wal", { heute: HEUTE });
});

test("Lader wirft: keine Ausnahme nach außen", async () => {
  attrappe();
  testHaken.setzeLader(async () => { throw new Error("netz"); });
  await meldeRundenende(ctx, standDran("zweierreihe"), { thema: "zweierreihe", gekonnt: null, heute: HEUTE });
});

test("abbestellt in der Push-Antwort: danach kein Push mehr", async () => {
  attrappe({ pushen: { zustand: "abbestellt" } });
  const stand = standDran("zweierreihe");
  await meldeRundenende(ctx, stand, { thema: "zweierreihe", gekonnt: null, heute: HEUTE });
  await meldeRundenende(ctx, stand, { thema: "zweierreihe", gekonnt: null, heute: HEUTE });
  await meldeGelesen(ctx, stand, "wal", { heute: HEUTE });
  assert.equal(pushes().length, 1);
});

test("Status abbestellt: kein Push, und die Seite fragt nicht erneut", async () => {
  attrappe({ zustand: "abbestellt" });
  const stand = standDran("zweierreihe");
  await meldeRundenende(ctx, stand, { thema: "zweierreihe", gekonnt: null, heute: HEUTE });
  await meldeRundenende(ctx, stand, { thema: "zweierreihe", gekonnt: null, heute: HEUTE });
  assert.equal(pushes().length, 0);
  assert.equal(aufrufe.length, 1);
});

const TB_SCHLUESSEL = "lernstand-kind-1-tagesbrief";

test("verschickt: gesperrt und letztesFach unter eigenem Schlüssel, 2. Brief wählt eine andere Anleitung", async () => {
  attrappe();
  const stand = standDran("zweierreihe");
  await meldeRundenende(ctx, stand, { thema: "zweierreihe", gekonnt: null, heute: HEUTE });
  const erste = pushes()[0].args.ereignisse.find((e) => e.art === "naechstes").daten.id;
  attrappe({ pushen: { verschickt: [{ anleitung: erste, am: "2026-11-17" }] } });
  await meldeRundenende(ctx, stand, { thema: "zweierreihe", gekonnt: null, heute: HEUTE });
  assert.deepEqual(JSON.parse(speicher.get(TB_SCHLUESSEL)), { gesperrt: { [erste]: "2026-11-17" }, letztesFach: erste.split("/")[0] });
  assert.equal(speicher.get(SCHLUESSEL), undefined); // der Lernstand bleibt unberührt
  attrappe();
  await meldeRundenende(ctx, stand, { thema: "zweierreihe", gekonnt: null, heute: "2026-11-18" });
  const zweite = pushes()[0]?.args.ereignisse.find((e) => e.art === "naechstes")?.daten.id;
  assert.notEqual(zweite, erste);
});

test("ausstehendes Speichern einer Runde und Sperre bleiben beide erhalten", async () => {
  const { speichere, lade, sofortSpeichern } = await import("../spiele/kern/speicher.js");
  attrappe();
  const stand = standDran("zweierreihe");
  await meldeRundenende(ctx, stand, { thema: "zweierreihe", gekonnt: null, heute: HEUTE });
  const erste = pushes()[0].args.ereignisse.find((e) => e.art === "naechstes").daten.id;
  attrappe({ pushen: { verschickt: [{ anleitung: erste, am: HEUTE }] } });
  const runde = { ...neuerStand(), verlauf: [{ marke: "runde-laeuft" }] };
  speichere("lernplan", runde); // Runde hat gespeichert, noch nicht geschrieben
  await meldeRundenende(ctx, stand, { thema: "zweierreihe", gekonnt: null, heute: HEUTE });
  await sofortSpeichern();
  assert.deepEqual(JSON.parse(speicher.get(SCHLUESSEL)).verlauf, [{ marke: "runde-laeuft" }]);
  assert.deepEqual((await lade("tagesbrief", {})).gesperrt, { [erste]: HEUTE });
  speichere("lernplan", { ...runde, verlauf: [{ marke: "naechste-runde" }] }); // spätere Runde löscht die Sperre nicht
  await sofortSpeichern();
  assert.deepEqual((await lade("tagesbrief", {})).gesperrt, { [erste]: HEUTE });
});

test("setzeZurueck: nach abbestellt wird wieder gepusht", async () => {
  attrappe({ pushen: { zustand: "abbestellt" } });
  const stand = standDran("zweierreihe");
  await meldeRundenende(ctx, stand, { thema: "zweierreihe", gekonnt: null, heute: HEUTE });
  await meldeRundenende(ctx, stand, { thema: "zweierreihe", gekonnt: null, heute: HEUTE });
  assert.equal(pushes().length, 1);
  setzeZurueck();
  await meldeRundenende(ctx, stand, { thema: "zweierreihe", gekonnt: null, heute: HEUTE });
  assert.equal(pushes().length, 2);
});

test("alle gebauten Ereignisse bestehen die Prüfung des Dienstes", async () => {
  attrappe();
  const stand = standDran("zweierreihe", "neunerreihe");
  await meldeRundenende(ctx, stand, { thema: "zweierreihe", gekonnt: "zweierreihe", heute: HEUTE });
  await meldeRundenende(ctx, stand, { thema: "neunerreihe", gekonnt: null, heute: HEUTE });
  await meldeGelesen(ctx, stand, "wal", { heute: HEUTE });
  assert.equal(pushes().length, 3);
  let n = 0;
  for (const p of pushes()) {
    for (const [i, e] of p.args.ereignisse.entries()) {
      assert.ok(!("id" in e));
      assert.ok(gueltigesEreignis({ ...e, id: `g-${++n}` }), `${e.art} ungültig`);
    }
  }
  const naechstes = pushes()[0].args.ereignisse.find((e) => e.art === "naechstes").daten;
  assert.ok(naechstes.formen.length > 0);
});

test("naechstes trägt das Foto als base64, wenn es eine .brief.jpg gibt", async () => {
  attrappe();
  await meldeRundenende(ctx, standDran("zweierreihe"), { thema: "zweierreihe", gekonnt: null, heute: HEUTE });
  const daten = pushes()[0].args.ereignisse.find((e) => e.art === "naechstes").daten;
  const v = lies("mit-echten-dingen/verzeichnis.json").themen[daten.thema];
  const jpg = new URL(`mit-echten-dingen/${v.foto.replace(/\.webp$/, ".brief.jpg")}`, wurzel);
  assert.equal(daten.foto, existsSync(jpg) ? readFileSync(jpg).toString("base64") : "");
  assert.ok(daten.foto.length > 0);
});

test("baueVorschauTopf: zuletzt erspielte Themen, laufende Themen und naechstes aus dem Lernstand; Name aus dem Aufruf", async () => {
  const stand = standDran("neunerreihe");
  stand.themen.zweierreihe = { z: "kann-ich", stufe: "kopf", e: "", seit: "2026-11-10", k: "2026-11-16", u: "", frei: 0, v: [] };
  const topf = await baueVorschauTopf(ctx, stand, { heute: HEUTE, name: "Lena" });
  assert.deepEqual(topf.namen, ["Lena"]);
  assert.deepEqual(topf.gekonnt.map((g) => g.id), ["zweierreihe"]);
  assert.deepEqual(topf.dabei.map((d) => d.id), ["neunerreihe"]);
  assert.deepEqual(topf.gelesen, []);
  assert.ok(topf.naechstes && topf.naechstes.formen.length > 0);
});

test("baueVorschauTopf: leerer Lernstand gibt einen Topf ohne Briefwert", async () => {
  const topf = await baueVorschauTopf(ctx, neuerStand(), { heute: HEUTE });
  assert.deepEqual([topf.namen, topf.gekonnt, topf.dabei], [[], [], []]);
});

test("baueVorschauTopf: von Eltern abgehakte Themen zählen nicht als neu gekonnt", async () => {
  const stand = neuerStand();
  stand.themen.zweierreihe = { z: "kann-ich", stufe: "kopf", e: "", seit: "2026-11-10", k: "2026-11-16", u: "", frei: 0, v: [], q: "eltern" };
  assert.deepEqual((await baueVorschauTopf(ctx, stand, { heute: HEUTE })).gekonnt, []);
});
