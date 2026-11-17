import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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
  const ideenGestartet = [];
  const server = erstelleServer({
    wurzel: WURZEL, ordner,
    starteLauf: () => { gestartet++; nimmSperre(ordner, { pid: process.pid, wer: "seite" }); },
    starteIdeen: (id) => { ideenGestartet.push(id); },
  });
  await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
  const basis = `http://127.0.0.1:${/** @type {any} */ (server.address()).port}`;
  const hol = (pfad, opt = {}) => fetch(basis + pfad, opt);
  const sende = (pfad, daten) => hol(pfad, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(daten ?? {}) });
  try { await f({ hol, sende, ordner, gestartet: () => gestartet, ideenGestartet }); } finally {
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

test("Server: /spiele/ liefert die Startseite der App (Knopf „App öffnen“)", () => mitServer(async ({ hol }) => {
  const r = await hol("/spiele/");
  assert.equal(r.status, 200);
  assert.match(r.headers.get("content-type") ?? "", /text\/html/);
}));

test("Server: Probe abschließen – unbekannte Id → 400", () => mitServer(async ({ sende }) => {
  assert.equal((await sende("/api/proben/X1/abschliessen")).status, 400);
}));

test("Server: Ideen nur für geplante Spiele, Schätzung 1 €", () => mitServer(async ({ hol, sende }) => {
  const u = await (await hol("/api/uebersicht")).json();
  const geplant = Object.values(u.spiele).find((s) => s.status === "geplant");
  const fertig = Object.values(u.spiele).find((s) => s.status === "fertig");
  let r = await sende("/api/auftraege", { art: "ideen", ziel: fertig.id });
  assert.equal(r.status, 400);
  assert.match((await r.json()).fehler, /noch nicht gebaut/);
  r = await sende("/api/auftraege", { art: "ideen", ziel: geplant.id });
  assert.equal(r.status, 201);
  assert.equal((await r.json()).schaetzung_eur, 1);
}));

test("Server: Wahl einer Idee legt Spiel-Auftrag und Vorgabe an, zweite Wahl 409", () => mitServer(async ({ hol, sende, ordner }) => {
  const ideen = [{ titel: "A", text: "a" }, { titel: "B", text: "b" }, { titel: "C", text: "c" }];
  speichereAuftraege(pfade(ordner).auftraege, [
    { id: "i-1", art: "ideen", ziel: "G05", befehl: "Spielideen G05", status: "wartet-auf-christian", ergebnis: { status: "geparkt", ideen } },
    { id: "i-2", art: "ideen", ziel: "G06", befehl: "Spielideen G06", status: "wartet-auf-christian", ergebnis: { status: "geparkt" } },
  ]);
  let r = await sende("/api/auftraege/i-1/wahl", { karte: 2 });
  assert.equal(r.status, 201);
  const neu = await r.json();
  const datei = join(ordner, "vorgaben", `${neu.id}.md`);
  assert.ok(existsSync(datei));
  assert.match(readFileSync(datei, "utf8"), /Karte 2/);
  r = await sende("/api/auftraege/i-1/wahl", { karte: 2 });
  assert.equal(r.status, 409);
  r = await sende("/api/auftraege/i-2/wahl", { karte: 1 });
  assert.equal(r.status, 400);
  r = await sende("/api/auftraege/fehlt/wahl", { karte: 1 });
  assert.equal(r.status, 404);
  const l = (await (await hol("/api/auftraege")).json()).auftraege;
  assert.deepEqual(l.map((x) => x.art), ["ideen", "spiel", "ideen"]);
}));

// Review 2026-11-17: zwei gleichzeitige Wahlen – nur eine darf gewinnen, die andere bekommt 409.
test("Server: gleichzeitige Wahl derselben Idee – genau eine 201", () => mitServer(async ({ hol, sende, ordner }) => {
  const ideen = [{ titel: "A", text: "a" }, { titel: "B", text: "b" }, { titel: "C", text: "c" }];
  speichereAuftraege(pfade(ordner).auftraege, [
    { id: "i-1", art: "ideen", ziel: "G05", befehl: "Spielideen G05", status: "wartet-auf-christian", ergebnis: { status: "geparkt", ideen } },
  ]);
  // A schickt Kopf sofort, Körper erst, nachdem B fertig ist – so trifft A die Prüfung, bevor B speichert.
  const port = new URL((await hol("/api/auftraege")).url).port;
  const koerperA = JSON.stringify({ karte: 1 });
  let antwortA;
  const a = request({ host: "127.0.0.1", port, method: "POST", path: "/api/auftraege/i-1/wahl",
    headers: { host: `127.0.0.1:${port}`, "content-type": "application/json", "content-length": Buffer.byteLength(koerperA) } });
  const fertigA = new Promise((ok) => a.on("response", (r) => { antwortA = r.statusCode; r.resume(); r.on("end", ok); }));
  a.flushHeaders();
  await new Promise((ok) => setTimeout(ok, 50));
  const b = await sende("/api/auftraege/i-1/wahl", { karte: 3 });
  a.end(koerperA);
  await fertigA;
  assert.deepEqual([b.status, antwortA].sort(), [201, 409]);
  const l = (await (await hol("/api/auftraege")).json()).auftraege;
  assert.equal(l.filter((x) => x.art === "spiel").length, 1);
}));

test("Server: Ideen-Auftrag startet sofort, Spiel-Auftrag nicht", () => mitServer(async ({ hol, sende, ideenGestartet }) => {
  const u = await (await hol("/api/uebersicht")).json();
  const [g1, g2] = Object.values(u.spiele).filter((s) => s.status === "geplant");
  const a = await (await sende("/api/auftraege", { art: "ideen", ziel: g1.id })).json();
  await sende("/api/auftraege", { art: "spiel", ziel: g2.id });
  assert.deepEqual(ideenGestartet, [a.id]);
  const r = await sende("/api/auftraege", { art: "ideen", ziel: g1.id });
  assert.equal(r.status, 400, "zweiter Ideen-Auftrag für dasselbe Spiel");
}));

test("Server: Rückmeldung zu einem fertigen Spiel → neuer Änderungs-Auftrag (3 €), zweite wird angehängt", () => mitServer(async ({ hol, sende }) => {
  const r = await sende("/api/rueckmeldung", { bereich: "spiel", id: "M06", text: "Knopf größer" });
  assert.equal(r.status, 201);
  const j = await r.json();
  assert.equal(j.wie, "neu");
  assert.equal(j.auftrag.art, "aenderung");
  assert.equal(j.auftrag.schaetzung_eur, 3);
  const r2 = await (await sende("/api/rueckmeldung", { bereich: "spiel", id: "M06", text: "Ton leiser" })).json();
  assert.equal(r2.wie, "angehaengt");
  const l = (await (await hol("/api/auftraege")).json()).auftraege;
  assert.equal(l.length, 1);
  assert.deepEqual(l[0].rueckmeldungen.map((x) => x.text), ["Knopf größer", "Ton leiser"]);
  assert.deepEqual(l[0].stueck, { bereich: "spiel", ids: ["M06"] });
}));

test("Server: Rückmeldung zu Buch und Echten Dingen; Schätzung je Bereich", () => mitServer(async ({ sende }) => {
  const b = await (await sende("/api/rueckmeldung", { bereich: "buch", id: "hund", text: "Foto tauschen" })).json();
  assert.equal(b.auftrag.schaetzung_eur, 2);
  const e = await (await sende("/api/rueckmeldung", { bereich: "echte-dinge", id: "vorwaerts-zaehlen", text: "Bewegung fehlt" })).json();
  assert.equal(e.auftrag.schaetzung_eur, 1);
}));

test("Server: Rückmeldung zu Ungebautem ohne offenen Auftrag → 409, mit offenem Auftrag erlaubt", () => mitServer(async ({ sende }) => {
  assert.equal((await sende("/api/rueckmeldung", { bereich: "spiel", id: "R01", text: "x" })).status, 409);
  assert.equal((await sende("/api/rueckmeldung", { bereich: "buch", id: "kaninchen", text: "x" })).status, 409);
  assert.equal((await sende("/api/rueckmeldung", { bereich: "echte-dinge", id: "mehr-weniger-gleich-viele", text: "x" })).status, 409);
  assert.equal((await sende("/api/rueckmeldung", { bereich: "spiel", id: "Z99", text: "x" })).status, 404);
  await sende("/api/auftraege", { art: "spiel", ziel: "R01" });
  const r = await sende("/api/rueckmeldung", { bereich: "spiel", id: "R01", text: "Rahmen weg" });
  assert.equal(r.status, 201);
  assert.equal((await r.json()).wie, "angehaengt");
}));

test("Server: Rückmeldung ohne Text oder mit falschem Bereich → 400", () => mitServer(async ({ sende }) => {
  assert.equal((await sende("/api/rueckmeldung", { bereich: "spiel", id: "M06", text: " " })).status, 400);
  assert.equal((await sende("/api/rueckmeldung", { bereich: "film", id: "M06", text: "x" })).status, 400);
}));

test("Server: Rückmeldung zu einem Auftrag, der auf Christian wartet, wird seine Antwort", () => mitServer(async ({ hol, sende, ordner }) => {
  speichereAuftraege(pfade(ordner).auftraege, [{ id: "a-1-x", art: "buch", ziel: "hund", befehl: "Sachgeschichte hund", status: "wartet-auf-christian",
    ergebnis: { status: "geparkt", frage: "Passt es?" }, notiz: "" }]);
  const j = await (await sende("/api/rueckmeldung", { bereich: "buch", id: "hund", text: "Seite 3 tauschen" })).json();
  assert.equal(j.wie, "antwort");
  const l = (await (await hol("/api/auftraege")).json()).auftraege;
  assert.deepEqual(l.map((a) => a.status), ["beantwortet", "wartet"]);
  assert.equal(l[1].art, "antwort");
}));

test("Review I1: Spiel mit offenen Ideen bekommt keine Rückmeldung (409), kein Änderungs-Auftrag", () => mitServer(async ({ hol, sende, ordner }) => {
  speichereAuftraege(pfade(ordner).auftraege, [{ id: "a-1-i", art: "ideen", ziel: "R01", befehl: "Spielideen R01", status: "wartet-auf-christian", ergebnis: { ideen: [] }, notiz: "" }]);
  const r = await sende("/api/rueckmeldung", { bereich: "spiel", id: "R01", text: "Lieber mit Tieren" });
  assert.equal(r.status, 409);
  assert.equal((await (await hol("/api/auftraege")).json()).auftraege.length, 1);
}));

test("Server: Probe abschließen, solange ein Auftrag zum Spiel offen ist → 409, nichts committet", () => mitServer(async ({ sende }) => {
  await sende("/api/rueckmeldung", { bereich: "spiel", id: "G01", text: "Knopf größer" });
  const r = await sende("/api/proben/G01/abschliessen", {});
  assert.equal(r.status, 409);
  assert.match((await r.json()).fehler, /offen/);
}));
