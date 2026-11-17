// Versand zur Uhrzeit: Fälligkeit in Berlin, ein Brief je Tag, Topf leeren, 48 h, Fehler je Adresse, Eingangsprüfung.
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { starteDienst } from "../dienste/tagesbrief/server.js";

const KOPF = { "x-app": "lernen-spielen-1", "content-type": "application/json" };
const ADRESSE = "familie@example.org";
const naechstes = (id, extra = {}) => ({ id, thema: "Neunerreihe", fach: "mathe", titel: "Die Neunerreihe", passendZuGerade: true, formen: [{ situation: "tisch", wort: "Tisch", name: "Mit Perlen", braucht: "Perlen", schritte: ["Legen"], kern: "k", verinnerlichen: "v" }], foto: "", weitere: [], ...extra });
const gekonnt = (id = "g1") => ({ id: `e-${id}`, art: "gekonnt", daten: { id, name: "Plus", zweck: "Rechnen im Alltag", fach: "mathe" } });

let jetzt, t, sendeFehler, log, originalLog;
beforeEach(async () => {
  jetzt = new Date("2026-11-17T10:00:00Z");
  sendeFehler = new Set();
  originalLog = console.log;
  log = [];
  console.log = (...a) => { log.push(a.join(" ")); };
  const ordner = mkdtempSync(join(tmpdir(), "tagesbrief-v-"));
  const datei = join(ordner, "s.json");
  const mails = [];
  const dienst = await starteDienst({
    port: 0, datei, basis: "http://basis", jetzt: () => jetzt,
    sende: async (m) => { if (sendeFehler.has(m.an)) throw Object.assign(new Error(`kaputt ${m.an} ${m.html}`), { code: "ECONNRESET" }); mails.push(m); },
  });
  t = { dienst, mails, ordner, datei, url: `http://127.0.0.1:${dienst.server.address().port}` };
});
afterEach(async () => {
  console.log = originalLog;
  await t.dienst.stop();
  rmSync(t.ordner, { recursive: true, force: true });
});

const post = (pfad, koerper, kopf = KOPF) => fetch(t.url + pfad, { method: "POST", headers: kopf, body: JSON.stringify(koerper) });
const bearer = (s) => ({ ...KOPF, authorization: `Bearer ${s}` });
const speicher = () => JSON.parse(readFileSync(t.datei, "utf8"));

async function einrichten(adresse = ADRESSE, uhrzeit = "18:00") {
  const { anfrageId } = await (await post("/anmelden", { adresse, name: "Mia", uhrzeit })).json();
  const token = /bestaetigen\?t=([\w-]+)/.exec(t.mails.at(-1).text)[1];
  await fetch(t.url + "/bestaetigen", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ t: token }).toString() });
  return (await (await fetch(`${t.url}/status?anfrage=${anfrageId}`, { headers: KOPF })).json()).schluessel;
}
const push = (schluessel, liste) => post("/ereignisse", liste, bearer(schluessel));

test("vor der Uhrzeit nichts, um 18:00 genau ein Brief; Links ersetzt, Topf leer, verschickt vermerkt", async () => {
  const s = await einrichten();
  await push(s, [gekonnt(), { id: "n1", art: "naechstes", daten: naechstes("mathe/neunerreihe.md", { foto: "QUJD" }) }]);
  const vorher = t.mails.length;
  jetzt = new Date("2026-11-17T16:59:00Z"); // 17:59 MEZ
  assert.equal(await t.dienst.pruefeFaellige(), 0);
  assert.equal(t.mails.length, vorher);
  jetzt = new Date("2026-11-17T17:00:00Z");
  assert.equal(await t.dienst.pruefeFaellige(), 1);
  assert.equal(t.mails.length, vorher + 1);
  const m = t.mails.at(-1);
  assert.equal(m.an, ADRESSE);
  assert.equal(m.foto, "QUJD");
  assert.ok(!m.html.includes("{{"));
  assert.match(m.html, /http:\/\/basis\/abmelden\?t=/);
  const a = speicher().adressen[ADRESSE];
  assert.deepEqual(a.topf, { ids: [], gekonnt: [], dabei: [], gelesen: [], naechstes: null, seit: null });
  assert.equal(a.verschickt.length, 1);
  assert.equal(a.verschickt[0].anleitung, "mathe/neunerreihe.md");
  assert.equal(a.verschickt[0].am, jetzt.toISOString());
  assert.equal(await t.dienst.pruefeFaellige(), 0, "nicht zweimal in derselben Minute");
});

test("nach Versand neuer Topf, kein zweiter Brief am selben Tag", async () => {
  const s = await einrichten();
  await push(s, [gekonnt()]);
  jetzt = new Date("2026-11-17T17:00:00Z");
  assert.equal(await t.dienst.pruefeFaellige(), 1);
  jetzt = new Date("2026-11-17T17:05:00Z");
  await push(s, [gekonnt("g2")]);
  for (const z of ["2026-11-17T17:06:00Z", "2026-11-17T22:59:00Z"]) { jetzt = new Date(z); assert.equal(await t.dienst.pruefeFaellige(), 0); }
  jetzt = new Date("2026-11-18T17:00:00Z");
  assert.equal(await t.dienst.pruefeFaellige(), 1);
});

test("Topf nur mit naechstes: kein Brief, Topf bleibt", async () => {
  const s = await einrichten();
  await push(s, [{ id: "n1", art: "naechstes", daten: naechstes("a.md") }]);
  const vorher = t.mails.length;
  jetzt = new Date("2026-11-17T17:30:00Z");
  assert.equal(await t.dienst.pruefeFaellige(), 0);
  assert.equal(t.mails.length, vorher);
  assert.equal(speicher().adressen[ADRESSE].topf.naechstes.id, "a.md");
});

test("Topf älter als 48 Stunden ohne Versand wird gelöscht", async () => {
  const s = await einrichten();
  await push(s, [{ id: "n1", art: "naechstes", daten: naechstes("a.md") }]);
  jetzt = new Date("2026-11-19T10:01:00Z");
  await t.dienst.pruefeFaellige();
  assert.equal(speicher().adressen[ADRESSE].topf.seit, null);
  assert.equal(speicher().adressen[ADRESSE].topf.naechstes, null);
});

test("Sommerzeit: 16:00 UTC am 29.3.2026 ist 18:00 MESZ", async () => {
  jetzt = new Date("2026-03-29T10:00:00Z");
  const s = await einrichten();
  await push(s, [gekonnt()]);
  const vorher = t.mails.length;
  jetzt = new Date("2026-03-29T15:59:00Z");
  assert.equal(await t.dienst.pruefeFaellige(), 0);
  jetzt = new Date("2026-03-29T16:00:00Z");
  assert.equal(await t.dienst.pruefeFaellige(), 1);
  assert.equal(t.mails.length, vorher + 1);
});

test("Not-Aus: pruefeFaellige sendet nichts", async () => {
  await t.dienst.stop();
  const ordner = mkdtempSync(join(tmpdir(), "tagesbrief-v-"));
  const mails = [];
  const dienst = await starteDienst({ port: 0, datei: join(ordner, "s.json"), aus: true, sende: async (m) => { mails.push(m); } });
  assert.equal(await dienst.pruefeFaellige(), 0);
  await dienst.stop();
  rmSync(ordner, { recursive: true, force: true });
  t.dienst = { stop: async () => {} };
});

test("Fehler beim Senden: Topf bleibt, die anderen Adressen bekommen ihren Brief, Protokoll ohne Adresse und Inhalt", async () => {
  const a = await einrichten("a@example.org");
  const b = await einrichten("b@example.org");
  await push(a, [gekonnt()]);
  await push(b, [gekonnt()]);
  const vorher = t.mails.length;
  sendeFehler.add("a@example.org");
  jetzt = new Date("2026-11-17T17:00:00Z");
  assert.equal(await t.dienst.pruefeFaellige(), 1);
  assert.equal(t.mails.length, vorher + 1);
  assert.equal(t.mails.at(-1).an, "b@example.org");
  const d = speicher().adressen;
  assert.equal(d["a@example.org"].topf.gekonnt.length, 1, "Topf bleibt");
  assert.ok(d["a@example.org"].topf.seit);
  assert.equal(d["b@example.org"].topf.gekonnt.length, 0);
  const protokoll = log.join("\n");
  assert.match(protokoll, /Error ECONNRESET/);
  assert.ok(!protokoll.includes("example.org") && !protokoll.includes("Plus") && !protokoll.includes("kaputt"));
  sendeFehler.clear();
  jetzt = new Date("2026-11-17T17:01:00Z");
  assert.equal(await t.dienst.pruefeFaellige(), 0, "vor Ablauf der 15 Minuten kein neuer Versuch");
  jetzt = new Date("2026-11-17T17:15:00Z");
  assert.equal(await t.dienst.pruefeFaellige(), 1, "nach 15 Minuten klappt es");
});

test("Eingangsprüfung: ungültige Ereignisse geben 400, nichts wird gespeichert", async () => {
  const s = await einrichten();
  const gut = gekonnt();
  const ungueltig = [
    { id: "x", art: "gekonnt", daten: { id: "g", name: 5, zweck: "z", fach: "mathe" } },
    { id: "x", art: "gekonnt", daten: { id: "g", name: "n".repeat(201), zweck: "z", fach: "mathe" } },
    { id: "x", art: "unbekannt", daten: {} },
    { id: "x", art: "dabei", daten: [] },
    { id: "x", art: "gelesen", daten: { id: "g", titel: "t", frage: "f" } },
    { id: "x", art: "naechstes", daten: naechstes("a", { formen: "nein" }) },
    { id: "x", art: "naechstes", daten: naechstes("a", { formen: [{ situation: "tisch", wort: "w", name: "n", braucht: "b", schritte: "nicht-liste", kern: "k", verinnerlichen: "v" }] }) },
    { id: "x", art: "naechstes", daten: naechstes("a", { foto: "A".repeat(60_001) }) },
    { id: "x", art: "naechstes", daten: naechstes("a", { foto: "<script>" }) },
    { id: "x", art: "naechstes", daten: naechstes("a", { weitere: [1] }) },
    { id: 7, art: "gekonnt", daten: gut.daten },
  ];
  for (const e of ungueltig) assert.equal((await push(s, [gut, e])).status, 400, JSON.stringify(e).slice(0, 80));
  assert.equal(speicher().adressen[ADRESSE].topf.gekonnt.length, 0, "auch das gültige Ereignis wird nicht gespeichert");
  assert.equal((await push(s, [gut, { id: "n", art: "naechstes", daten: naechstes("a", { foto: "QUJD" }) }])).status, 200);
});

test("Probebrief sendet sofort, leert den Topf nicht, 4. am Tag 429", async () => {
  const s = await einrichten();
  await push(s, [gekonnt()]);
  const vorher = t.mails.length;
  assert.equal((await post("/probebrief", {}, bearer(s))).status, 200);
  assert.equal(t.mails.length, vorher + 1);
  assert.ok(!t.mails.at(-1).html.includes("{{"));
  assert.equal(speicher().adressen[ADRESSE].topf.gekonnt.length, 1);
  await post("/probebrief", {}, bearer(s));
  await post("/probebrief", {}, bearer(s));
  assert.equal((await post("/probebrief", {}, bearer(s))).status, 429);
});

test("Push nach der Uhrzeit bei leerem Tag: kein Brief um 18:06, am nächsten Tag um 18:00", async () => {
  const s = await einrichten();
  const vorher = t.mails.length;
  jetzt = new Date("2026-11-17T17:00:00Z");
  assert.equal(await t.dienst.pruefeFaellige(), 0);
  jetzt = new Date("2026-11-17T17:05:00Z");
  await push(s, [gekonnt()]);
  for (const z of ["2026-11-17T17:06:00Z", "2026-11-17T22:00:00Z"]) { jetzt = new Date(z); assert.equal(await t.dienst.pruefeFaellige(), 0); }
  jetzt = new Date("2026-11-18T17:00:00Z");
  assert.equal(await t.dienst.pruefeFaellige(), 1);
  assert.equal(t.mails.length, vorher + 1);
});

test("Push 17:00 und 18:05: der Brief um 18:00 enthält nur das frühere, das spätere kommt morgen", async () => {
  const s = await einrichten();
  jetzt = new Date("2026-11-17T16:00:00Z"); // 17:00
  await push(s, [{ id: "e-a", art: "gekonnt", daten: { id: "a", name: "Frühes", zweck: "z", fach: "mathe" } }]);
  jetzt = new Date("2026-11-17T17:05:00Z"); // 18:05
  await push(s, [{ id: "e-b", art: "gekonnt", daten: { id: "b", name: "Spätes", zweck: "z", fach: "mathe" } }]);
  // Dienst war um 18:00 aus, startet 18:30: nachgeholt, aber nur mit dem Früheren.
  jetzt = new Date("2026-11-17T17:30:00Z");
  assert.equal(await t.dienst.pruefeFaellige(), 1);
  const m = t.mails.at(-1);
  assert.match(m.text, /Frühes/);
  assert.ok(!m.text.includes("Spätes"));
  assert.deepEqual(speicher().adressen[ADRESSE].topf.gekonnt.map((x) => x.id), ["b"]);
  jetzt = new Date("2026-11-18T17:00:00Z");
  assert.equal(await t.dienst.pruefeFaellige(), 1);
  assert.match(t.mails.at(-1).text, /Spätes/);
});

test("zwei gleichzeitige Prüfungen mit langsamem Versand senden genau einmal", async () => {
  await t.dienst.stop();
  const ordner = mkdtempSync(join(tmpdir(), "tagesbrief-v-"));
  let gesendet = 0;
  const dienst = await starteDienst({ port: 0, datei: join(ordner, "s.json"), jetzt: () => jetzt, basis: "http://basis", sende: async (m) => {
    if (m.betreff.includes("bestätigen")) return;
    gesendet++;
    await new Promise((ok) => setTimeout(ok, 100));
  } });
  const alt = t;
  t = { ...alt, dienst, url: `http://127.0.0.1:${dienst.server.address().port}`, mails: [] };
  t.mails = [];
  // Bestätigungsmail abfangen: Sender oben verwirft sie, daher Token aus der Speicherdatei lesen.
  const { anfrageId } = await (await post("/anmelden", { adresse: ADRESSE, uhrzeit: "18:00" })).json();
  const token = Object.values(JSON.parse(readFileSync(join(ordner, "s.json"), "utf8")).anfragen).find((a) => a.token).token;
  await fetch(t.url + "/bestaetigen", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ t: token }).toString() });
  const { schluessel } = await (await fetch(`${t.url}/status?anfrage=${anfrageId}`, { headers: KOPF })).json();
  await push(schluessel, [gekonnt()]);
  jetzt = new Date("2026-11-17T17:00:00Z");
  const [a, b] = await Promise.all([dienst.pruefeFaellige(), dienst.pruefeFaellige()]);
  assert.equal(a + b, 1);
  assert.equal(gesendet, 1);
  await dienst.stop();
  rmSync(ordner, { recursive: true, force: true });
  t.dienst = { stop: async () => {} };
});

test("Wiederholung: höchstens fünf Versuche am Tag, Abstand 15 Minuten, am nächsten Tag normal", async () => {
  const s = await einrichten();
  await push(s, [gekonnt()]);
  sendeFehler.add(ADRESSE);
  let versuche = 0;
  const vorher = log.length;
  for (let minute = 0; minute < 8 * 60; minute++) {
    jetzt = new Date(Date.parse("2026-11-17T17:00:00Z") + minute * 60_000);
    await t.dienst.pruefeFaellige();
  }
  versuche = log.slice(vorher).filter((z) => /Versand fehlgeschlagen/.test(z)).length;
  assert.equal(versuche, 5);
  assert.equal(speicher().adressen[ADRESSE].topf.gekonnt.length, 1, "Topf bleibt");
  sendeFehler.clear();
  jetzt = new Date("2026-11-18T17:00:00Z");
  assert.equal(await t.dienst.pruefeFaellige(), 1);
});

test("Wiederholung nach Graph-429 wartet mindestens Retry-After", async () => {
  await t.dienst.stop();
  const ordner = mkdtempSync(join(tmpdir(), "tagesbrief-v-"));
  let drossel = false;
  const dienst = await starteDienst({ port: 0, datei: join(ordner, "s.json"), jetzt: () => jetzt, basis: "http://basis", sende: async (m) => {
    if (drossel && !m.betreff.includes("bestätigen")) throw Object.assign(new Error("x"), { name: "GraphFehler", code: "GRAPH_429", status: 429, retryAfter: 3600 });
  } });
  t = { ...t, dienst, url: `http://127.0.0.1:${dienst.server.address().port}` };
  const { anfrageId } = await (await post("/anmelden", { adresse: ADRESSE, uhrzeit: "18:00" })).json();
  const token = Object.values(JSON.parse(readFileSync(join(ordner, "s.json"), "utf8")).anfragen).find((a) => a.token).token;
  await fetch(t.url + "/bestaetigen", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ t: token }).toString() });
  const { schluessel } = await (await fetch(`${t.url}/status?anfrage=${anfrageId}`, { headers: KOPF })).json();
  await push(schluessel, [gekonnt()]);
  drossel = true;
  jetzt = new Date("2026-11-17T17:00:00Z");
  assert.equal(await dienst.pruefeFaellige(), 0);
  drossel = false;
  jetzt = new Date("2026-11-17T17:30:00Z");
  assert.equal(await dienst.pruefeFaellige(), 0, "nach 30 Minuten noch gedrosselt");
  jetzt = new Date("2026-11-17T18:00:00Z");
  assert.equal(await dienst.pruefeFaellige(), 1);
  await dienst.stop();
  rmSync(ordner, { recursive: true, force: true });
  t.dienst = { stop: async () => {} };
});
