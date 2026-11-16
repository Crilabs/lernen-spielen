import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { request } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { WURZEL } from "../werkzeuge/kosten/kosten.mjs";
import { echteDingeNachSpiel } from "../werkzeuge/verwaltung/folge.mjs";
import { gibSperreFrei, nimmSperre, pfade } from "../werkzeuge/verwaltung/lauf.mjs";
import { erstelleServer } from "../werkzeuge/verwaltung/server.mjs";
import { speichereAuftraege } from "../werkzeuge/verwaltung/auftraege.mjs";

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

test("Server: fremde Herkunft, fremder Host und Nicht-JSON werden abgewiesen", () => mitServer(async ({ hol }) => {
  const post = (kopf, body = "{}") => hol("/api/auftraege", { method: "POST", headers: kopf, body });
  assert.equal((await post({ "content-type": "application/json", origin: "https://boese.example" })).status, 403);
  assert.equal((await post({ "content-type": "text/plain" }, JSON.stringify({ art: "frei", ziel: "x" }))).status, 415);
  // fetch setzt den Host selbst; DNS-Rebinding mit node:http nachstellen
  const port = new URL((await hol("/api/auftraege")).url).port;
  const status = await new Promise((ok, fehler) => {
    request({ host: "127.0.0.1", port, path: "/api/uebersicht", headers: { host: "boese.example:4711" } }, (r) => { r.resume(); ok(r.statusCode); })
      .on("error", fehler).end();
  });
  assert.equal(status, 403);
  assert.equal((await hol("/api/abarbeiten", { method: "POST", headers: { "content-type": "application/json", origin: "null" } })).status, 403);
}));

test("Server: Fehler des letzten Laufs in /api/auftraege", () => mitServer(async ({ hol, ordner }) => {
  mkdirSync(join(ordner, "protokolle"));
  writeFileSync(join(ordner, "protokolle", "lauf.log"), "Fehler: auftraege.json ist kein gültiges JSON\n");
  assert.equal((await (await hol("/api/auftraege")).json()).laufFehler, "auftraege.json ist kein gültiges JSON");
}));

test("Server: antworten legt Folgeauftrag an, ablehnen schließt ab", () => mitServer(async ({ hol, sende, ordner }) => {
  const warte = (id) => ({ id, art: "spiel", ziel: "M08", befehl: "Spiel entwickeln M08", status: "wartet-auf-christian",
    ergebnis: { status: "freigabe", zusammenfassung: "geparkt", frage: "Darf das?" } });
  speichereAuftraege(pfade(ordner).auftraege, [warte("a-1"), warte("a-2")]);
  let r = await sende("/api/auftraege/a-1/antwort", { text: "Ja" });
  assert.equal(r.status, 201);
  const neu = await r.json();
  assert.equal(neu.art, "antwort");
  r = await sende("/api/auftraege/a-1/antwort", { text: "Ja" });
  assert.equal(r.status, 409);
  r = await sende("/api/auftraege/a-2/antwort", { text: " " });
  assert.equal(r.status, 400);
  r = await sende("/api/auftraege/a-2/ablehnen");
  assert.equal(r.status, 200);
  r = await sende("/api/auftraege/fehlt/ablehnen");
  assert.equal(r.status, 404);
  const l = (await (await hol("/api/auftraege")).json()).auftraege;
  assert.deepEqual(l.map((x) => x.status), ["beantwortet", "erledigt", "wartet"]);
}));

test("Server: liefert Spiele aus, ohne Ausbruch aus spiele/", () => mitServer(async ({ hol }) => {
  const r = await hol("/spiele/rahmen/seite.css");
  assert.equal(r.status, 200);
  assert.match(r.headers.get("content-type") ?? "", /text\/css/);
  assert.equal((await hol("/spiele/..%2Fpackage.json")).status, 404);
}));

test("Server: Probe abschließen – unbekannte Id → 400", () => mitServer(async ({ sende }) => {
  assert.equal((await sende("/api/proben/X1/abschliessen")).status, 400);
}));
