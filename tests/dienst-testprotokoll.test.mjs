// Test-Protokoll im Versanddienst (docs/testprotokoll.md): POST /protokoll legt JSON-Zeilen je Gerät und Tag ab,
// getrennt vom Topf; Löschung nach 90 Tagen.
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { starteDienst } from "../dienste/tagesbrief/server.js";
import { gueltigerEintrag, raeumeAuf } from "../dienste/tagesbrief/protokoll.js";

const KOPF = { "x-app": "lernen-spielen-1", "content-type": "application/json" };
const JETZT = new Date("2026-11-22T22:30:00Z"); // in Berlin schon der 22.11., 23:30

/** @type {{ dienst: any, url: string, mails: any[], ordner: string, datei: string, logs: string[], originalLog: any }} */
let t;

async function starte(optionen = {}) {
  const ordner = mkdtempSync(join(tmpdir(), "testprotokoll-"));
  const datei = join(ordner, "speicher.json");
  const mails = [];
  const dienst = await starteDienst({ port: 0, datei, sende: async (m) => { mails.push(m); }, basis: "http://basis", jetzt: () => JETZT, ...optionen });
  return { dienst, url: `http://127.0.0.1:${dienst.server.address().port}`, mails, ordner, datei, logs: [], originalLog: console.log };
}

beforeEach(async () => {
  t = await starte();
  console.log = (...a) => { t.logs.push(a.join(" ")); };
});
afterEach(async () => {
  console.log = t.originalLog;
  await t.dienst.stop();
  rmSync(t.ordner, { recursive: true, force: true });
});

const post = (pfad, koerper, kopf = KOPF) => fetch(t.url + pfad, { method: "POST", headers: kopf, body: typeof koerper === "string" ? koerper : JSON.stringify(koerper) });
const bearer = (schluessel) => ({ ...KOPF, authorization: `Bearer ${schluessel}` });
const formular = (pfad, token) => fetch(t.url + pfad, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ t: token }).toString() });
const kurz = (schluessel) => createHash("sha256").update(schluessel).digest("hex").slice(0, 12);

async function einrichten() {
  const { anfrageId } = await (await post("/anmelden", { adresse: "familie@example.org", name: "Mia", uhrzeit: "18:00" })).json();
  const token = /bestaetigen\?t=([\w-]+)/.exec(t.mails.at(-1).text)[1];
  await formular("/bestaetigen", token);
  const { schluessel } = await (await fetch(`${t.url}/status?anfrage=${anfrageId}`, { headers: KOPF })).json();
  return schluessel;
}

const eintrag = (art, extra = {}) => ({ t: "2026-11-22T23:29:00.000+01:00", art, ...extra });

test("POST /protokoll hängt Zeilen an die Tagesdatei des Geräts an, mit Eingangszeit; der Topf bleibt leer", async () => {
  const s = await einrichten();
  const r = await post("/protokoll", [eintrag("runde-start", { spiel: "kettenhuepfer" }), eintrag("antwort", { key: "2x3", ok: true, ms: 1800 })], bearer(s));
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { angenommen: 2 });
  assert.equal((await post("/protokoll", [eintrag("runde-ende")], bearer(s))).status, 200);

  const datei = join(t.ordner, "protokoll", kurz(s), "2026-11-22.jsonl");
  const zeilen = readFileSync(datei, "utf8").trim().split("\n").map((z) => JSON.parse(z));
  assert.deepEqual(zeilen.map((z) => z.art), ["runde-start", "antwort", "runde-ende"]);
  assert.equal(zeilen[1].key, "2x3");
  assert.equal(zeilen[0].e, JETZT.toISOString());

  const familie = Object.values(JSON.parse(readFileSync(t.datei, "utf8")).familien)[0];
  assert.deepEqual([familie.topf.gekonnt, familie.topf.dabei, familie.topf.ids], [[], [], []]);
});

test("Protokollzeilen landen nie im Journal, nur Weg und Status", async () => {
  const s = await einrichten();
  await post("/protokoll", [eintrag("antwort", { key: "GEHEIM-KEY" })], bearer(s));
  const zeile = t.logs.find((l) => l.includes("/protokoll"));
  assert.match(zeile, /POST \/protokoll 200$/);
  assert.ok(!t.logs.some((l) => l.includes("GEHEIM-KEY")));
});

test("POST /protokoll: ohne App-Kopf 403, ohne oder mit falschem Schlüssel 401", async () => {
  assert.equal((await post("/protokoll", [], { "content-type": "application/json" })).status, 403);
  assert.equal((await post("/protokoll", [])).status, 401);
  assert.equal((await post("/protokoll", [], bearer("falsch"))).status, 401);
  assert.ok(!existsSync(join(t.ordner, "protokoll")));
});

test("POST /protokoll: ungültige Körper 400, zu viele Einträge 413", async () => {
  const s = await einrichten();
  assert.equal((await post("/protokoll", "{kaputt", bearer(s))).status, 400);
  assert.equal((await post("/protokoll", { art: "x" }, bearer(s))).status, 400);
  assert.equal((await post("/protokoll", [{ art: "antwort" }], bearer(s))).status, 400);
  assert.equal((await post("/protokoll", [eintrag("Gross")], bearer(s))).status, 400);
  assert.equal((await post("/protokoll", Array.from({ length: 2001 }, () => eintrag("a")), bearer(s))).status, 413);
  assert.ok(!existsSync(join(t.ordner, "protokoll")));
});

test("POST /protokoll beim Not-Aus: 503, nichts abgelegt", async () => {
  const s = await einrichten();
  await t.dienst.stop();
  const alt = t;
  t = { ...(await starte({ datei: alt.datei, aus: true })), logs: alt.logs, originalLog: alt.originalLog, ordner: alt.ordner, datei: alt.datei };
  assert.equal((await post("/protokoll", [eintrag("antwort")], bearer(s))).status, 503);
  assert.ok(!existsSync(join(alt.ordner, "protokoll")));
});

test("gueltigerEintrag verlangt art und t", () => {
  assert.equal(gueltigerEintrag(eintrag("runde-start")), true);
  assert.equal(gueltigerEintrag({ art: "antwort" }), false);
  assert.equal(gueltigerEintrag({ t: "x" }), false);
  assert.equal(gueltigerEintrag([]), false);
  assert.equal(gueltigerEintrag(null), false);
  assert.equal(gueltigerEintrag(eintrag("a".repeat(41))), false);
});

test("raeumeAuf löscht Tage älter als 90 Tage und leere Geräteordner", () => {
  const ordner = join(t.ordner, "aufraeumen");
  mkdirSync(join(ordner, "alt"), { recursive: true });
  mkdirSync(join(ordner, "neu"), { recursive: true });
  writeFileSync(join(ordner, "alt", "2026-08-01.jsonl"), "{}\n");
  writeFileSync(join(ordner, "neu", "2026-08-01.jsonl"), "{}\n");
  writeFileSync(join(ordner, "neu", "2026-08-24.jsonl"), "{}\n");
  writeFileSync(join(ordner, "neu", "notiz.txt"), "bleibt");
  assert.equal(raeumeAuf(ordner, JETZT), 2);
  assert.deepEqual(readdirSync(ordner), ["neu"]);
  assert.deepEqual(readdirSync(join(ordner, "neu")).sort(), ["2026-08-24.jsonl", "notiz.txt"]);
  assert.equal(raeumeAuf(join(t.ordner, "gibt-es-nicht"), JETZT), 0);
});

test("Datenschutzseite nennt das Test-Protokoll und die 90 Tage", async () => {
  const text = await (await fetch(`${t.url}/datenschutz`)).text();
  assert.match(text, /Test-Protokoll/);
  assert.match(text, /90 Tagen/);
});
