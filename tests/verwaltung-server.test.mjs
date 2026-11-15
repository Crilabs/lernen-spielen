import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { WURZEL } from "../werkzeuge/kosten/kosten.mjs";
import { echteDingeNachSpiel } from "../werkzeuge/verwaltung/folge.mjs";
import { gibSperreFrei, nimmSperre, pfade } from "../werkzeuge/verwaltung/lauf.mjs";
import { erstelleServer } from "../werkzeuge/verwaltung/server.mjs";

test("echteDingeNachSpiel: Hauptthemen ohne Anleitung, Einstiegsklasse zuerst, höchstens fünf", () => {
  const u = {
    spiele: { M1: { hauptthemen: ["a", "b", "c", "d", "e", "f", "g"] } },
    lernthemen: [
      { id: "a", klasse: 3, echteDinge: "fehlt" }, { id: "b", klasse: 1, echteDinge: "fertig" },
      { id: "c", klasse: 2, echteDinge: "fehlt" }, { id: "d", klasse: 1, echteDinge: "fehlt" },
      { id: "e", klasse: 4, echteDinge: "fehlt" }, { id: "f", klasse: 2, echteDinge: "beauftragt" },
      { id: "g", klasse: 3, echteDinge: "fehlt" }, { id: "h", klasse: 1, echteDinge: "fehlt" },
    ],
  };
  assert.deepEqual(echteDingeNachSpiel(u, "M1"), ["d", "c", "a", "g", "e"]);
  assert.deepEqual(echteDingeNachSpiel(u, "M9"), []);
});

async function mitServer(f) {
  const ordner = mkdtempSync(join(tmpdir(), "verwaltung-"));
  let gestartet = 0;
  const server = erstelleServer({
    wurzel: WURZEL, ordner,
    starteLauf: () => { gestartet++; nimmSperre(ordner, { pid: process.pid, wer: "seite" }); },
  });
  await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
  const basis = `http://127.0.0.1:${/** @type {any} */ (server.address()).port}`;
  const hol = (pfad, opt = {}) => fetch(basis + pfad, opt);
  const sende = (pfad, daten) => hol(pfad, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(daten ?? {}) });
  try { await f({ hol, sende, ordner, gestartet: () => gestartet }); } finally {
    gibSperreFrei(ordner);
    server.close();
    rmSync(ordner, { recursive: true });
  }
}

test("Server: Übersicht und Seite", () => mitServer(async ({ hol }) => {
  const r = await hol("/api/uebersicht");
  assert.equal(r.status, 200);
  assert.equal((await r.json()).lernthemen.length, 956);
  const s = await hol("/");
  assert.equal(s.status, 200);
  assert.match(s.headers.get("content-type") ?? "", /text\/html/);
}));

test("Server: Auftrag anlegen mit Schätzung, verschieben, streichen", () => mitServer(async ({ hol, sende }) => {
  const a = await (await sende("/api/auftraege", { art: "spiel", ziel: "M15" })).json();
  assert.equal(a.befehl, "Spiel entwickeln M15");
  assert.equal(typeof a.schaetzung_eur, "number");
  const b = await (await sende("/api/auftraege", { art: "echte-dinge", ziel: ["zweierreihe", "dreierreihe"] })).json();
  await sende(`/api/auftraege/${b.id}/hoch`);
  let l = await (await hol("/api/auftraege")).json();
  assert.deepEqual(l.auftraege.map((x) => x.id), [b.id, a.id]);
  assert.equal(l.laeuft, false);
  await sende(`/api/auftraege/${a.id}/streichen`);
  l = await (await hol("/api/auftraege")).json();
  assert.equal(l.auftraege[1].status, "gestrichen");
}));

test("Server: unbekannte Art → 400", () => mitServer(async ({ sende }) => {
  const r = await sende("/api/auftraege", { art: "quatsch", ziel: "x" });
  assert.equal(r.status, 400);
  assert.match((await r.json()).fehler, /Art/);
}));

test("Server: abarbeiten zweimal → zweites 409, nur ein Start", () => mitServer(async ({ sende, gestartet }) => {
  assert.equal((await sende("/api/abarbeiten")).status, 202);
  assert.equal((await sende("/api/abarbeiten")).status, 409);
  assert.equal(gestartet(), 1);
}));

test("Server: anhalten setzt die Marke", () => mitServer(async ({ sende, hol }) => {
  assert.equal((await sende("/api/anhalten")).status, 200);
  assert.equal((await (await hol("/api/auftraege")).json()).anhalten, true);
}));

test("Server: Protokoll ab einer Stelle", () => mitServer(async ({ hol, ordner }) => {
  const id = "a-1-abcde";
  mkdirSync(join(ordner, "protokolle"));
  writeFileSync(pfade(ordner).protokoll(id), "Hallo Welt");
  const r = await (await hol(`/api/protokoll/${id}?ab=6`)).json();
  assert.equal(r.text, "Welt");
  assert.equal(r.groesse, 10);
  assert.equal((await hol("/api/protokoll/..%2Fx")).status, 404);
}));

test("Server: kein Ausbruch aus dem Seitenordner", () => mitServer(async ({ hol }) => {
  assert.equal((await hol("/seite/..%2F..%2Fpackage.json")).status, 404);
  assert.equal((await hol("/seite/../server.mjs")).status, 404);
}));
