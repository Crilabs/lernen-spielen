// Versanddienst des Tagesbriefs: Anmeldung, Empfängerbindung, Ereignisse, Grenzen, Abmelden, Not-Aus, Protokoll.
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { starteDienst } from "../dienste/tagesbrief/server.js";

const KOPF = { "x-app": "lernen-spielen-1", "content-type": "application/json" };
const ADRESSE = "familie@example.org";
const GEHEIM = "Brüche-Geheimtext";

/** @type {{ dienst: any, url: string, mails: any[], ordner: string, datei: string, logs: string[], originalLog: any }} */
let t;

async function starte(optionen = {}) {
  const ordner = mkdtempSync(join(tmpdir(), "tagesbrief-"));
  const datei = join(ordner, "speicher.json");
  const mails = [];
  const dienst = await starteDienst({ port: 0, datei, sende: async (m) => { mails.push(m); }, basis: "http://basis", ...optionen });
  const url = `http://127.0.0.1:${dienst.server.address().port}`;
  return { dienst, url, mails, ordner, datei, logs: [], originalLog: console.log };
}

beforeEach(async () => {
  t = await starte();
  t.logs = [];
  console.log = (...a) => { t.logs.push(a.join(" ")); };
});
afterEach(async () => {
  console.log = t.originalLog;
  await t.dienst.stop();
  rmSync(t.ordner, { recursive: true, force: true });
});

const post = (pfad, koerper, kopf = KOPF) => fetch(t.url + pfad, { method: "POST", headers: kopf, body: typeof koerper === "string" ? koerper : JSON.stringify(koerper) });
const formular = (pfad, token) => fetch(t.url + pfad, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ t: token }).toString() });
const bearer = (schluessel) => ({ ...KOPF, authorization: `Bearer ${schluessel}` });

/** Meldet an, bestätigt und holt den Schlüssel. */
async function einrichten(adresse = ADRESSE) {
  const { anfrageId } = await (await post("/anmelden", { adresse, name: "Mia", uhrzeit: "18:00" })).json();
  const mail = t.mails.at(-1);
  const token = /bestaetigen\?t=([\w-]+)/.exec(mail.text)[1];
  await formular("/bestaetigen", token);
  const { schluessel } = await (await fetch(`${t.url}/status?anfrage=${anfrageId}`, { headers: KOPF })).json();
  return { anfrageId, schluessel, token };
}

test("Anmelden schickt genau eine Bestätigungsmail; Status erst nach Bestätigung, Schlüssel nur einmal", async () => {
  const antwort = await post("/anmelden", { adresse: ADRESSE, name: "Mia", uhrzeit: "18:00" });
  assert.equal(antwort.status, 200);
  const { anfrageId } = await antwort.json();
  assert.equal(t.mails.length, 1);
  assert.equal(t.mails[0].an, ADRESSE);
  assert.match(t.mails[0].text, /http:\/\/basis\/bestaetigen\?t=[\w-]+/);
  assert.match(t.mails[0].text, /Sie/);

  const vor = await (await fetch(`${t.url}/status?anfrage=${anfrageId}`, { headers: KOPF })).json();
  assert.deepEqual(vor, { bestaetigt: false });

  const token = /bestaetigen\?t=([\w-]+)/.exec(t.mails[0].text)[1];
  const frage = await fetch(`${t.url}/bestaetigen?t=${token}`);
  assert.equal(frage.status, 200);
  assert.match(await frage.text(), /<form method="post"/);
  assert.deepEqual(await (await fetch(`${t.url}/status?anfrage=${anfrageId}`, { headers: KOPF })).json(), { bestaetigt: false }, "GET allein bestätigt nicht");

  const seite = await formular("/bestaetigen", token);
  assert.equal(seite.status, 200);
  assert.match(await seite.text(), /Bestätigt\. Sie können das Fenster schließen\./);

  const nach = await (await fetch(`${t.url}/status?anfrage=${anfrageId}`, { headers: KOPF })).json();
  assert.equal(nach.bestaetigt, true);
  assert.ok(nach.schluessel.length >= 40);
  const zweit = await (await fetch(`${t.url}/status?anfrage=${anfrageId}`, { headers: KOPF })).json();
  assert.deepEqual(zweit, { bestaetigt: true });

  const nochmal = await formular("/bestaetigen", token);
  assert.equal(nochmal.status, 400);
});

test("Bestätigungslink läuft nach 24 Stunden ab", async () => {
  await t.dienst.stop();
  rmSync(t.ordner, { recursive: true, force: true });
  let jetzt = new Date("2026-11-17T10:00:00Z");
  t = await starte({ jetzt: () => jetzt });
  console.log = () => {};
  await post("/anmelden", { adresse: ADRESSE, uhrzeit: "18:00" });
  jetzt = new Date("2026-11-18T10:00:01Z");
  const token = /bestaetigen\?t=([\w-]+)/.exec(t.mails[0].text)[1];
  assert.equal((await formular("/bestaetigen", token)).status, 400);
});

test("ohne X-App 403, falscher Bearer 401", async () => {
  assert.equal((await post("/anmelden", { adresse: ADRESSE, uhrzeit: "18:00" }, { "content-type": "application/json" })).status, 403);
  assert.equal((await post("/ereignisse", [], bearer("falsch"))).status, 401);
  assert.equal((await post("/ereignisse", [], KOPF)).status, 401);
  assert.equal(t.mails.length, 0);
});

test("Ereignisse landen im Topf der eigenen Adresse; an/adresse im Körper wird ignoriert", async () => {
  const mia = await einrichten();
  const andere = await einrichten("andere@example.org");
  const ereignis = { id: "e1", art: "gekonnt", daten: { id: "g1", name: "Plus", zweck: "z", fach: "mathe" } };
  const kein = await post("/ereignisse", { an: "andere@example.org", adresse: "andere@example.org" }, bearer(mia.schluessel));
  assert.equal(kein.status, 400, "ein Objekt statt einer Liste ist keine Anfrage");
  const ok = await post("/ereignisse", [{ ...ereignis, an: "andere@example.org", adresse: "andere@example.org" }], bearer(mia.schluessel));
  assert.equal(ok.status, 200);
  assert.deepEqual(await ok.json(), { verschickt: [] });
  const speicher = JSON.parse(readFileSync(t.datei, "utf8"));
  assert.equal(speicher.adressen[ADRESSE].topf.gekonnt.length, 1);
  assert.equal(speicher.adressen["andere@example.org"].topf.gekonnt.length, 0);
  assert.ok(andere.schluessel);
  assert.ok(!JSON.stringify(speicher).includes(mia.schluessel), "Schlüssel nur als Hash");
});

test("doppelte Ereignis-Id zählt einmal; naechstes ersetzt den vorigen", async () => {
  const { schluessel } = await einrichten();
  const g = (id, did) => ({ id, art: "gekonnt", daten: { id: did, name: "N", zweck: "z", fach: "mathe" } });
  await post("/ereignisse", [g("e1", "g1"), g("e1", "g2"), g("e2", "g1"), { id: "e3", art: "gelesen", daten: { id: "b1", titel: "T", frage: "f", antwort: "a" } }, { id: "e4", art: "gelesen", daten: { id: "b1", titel: "T", frage: "f", antwort: "a" } }], bearer(schluessel));
  await post("/ereignisse", [g("e1", "g1"), { id: "n1", art: "naechstes", daten: { id: "a1" } }], bearer(schluessel));
  await post("/ereignisse", [{ id: "n2", art: "naechstes", daten: { id: "a2" } }], bearer(schluessel));
  const topf = JSON.parse(readFileSync(t.datei, "utf8")).adressen[ADRESSE].topf;
  assert.equal(topf.gekonnt.length, 1);
  assert.equal(topf.gelesen.length, 1);
  assert.equal(topf.naechstes.id, "a2");
  assert.deepEqual(topf.ids.sort(), ["e1", "e2", "e3", "e4", "n1", "n2"], "jede Ereignis-Id wird gemerkt, auch wenn ihr Inhalt schon im Topf lag");
});

test("Grenze: 6. Anmeldung derselben IP in einer Stunde 429", async () => {
  for (let i = 0; i < 5; i++) assert.equal((await post("/anmelden", { adresse: `a${i}@example.org`, uhrzeit: "18:00" })).status, 200);
  assert.equal((await post("/anmelden", { adresse: "a5@example.org", uhrzeit: "18:00" })).status, 429);
  assert.equal(t.mails.length, 5);
});

test("Grenze: 4. Anmeldung derselben Adresse am Tag 429", async () => {
  for (let i = 0; i < 3; i++) assert.equal((await post("/anmelden", { adresse: ADRESSE, uhrzeit: "18:00" })).status, 200);
  assert.equal((await post("/anmelden", { adresse: ADRESSE, uhrzeit: "18:00" })).status, 429);
});

test("Grenze: Push mit 201 Ereignissen 413, zu großer Körper 413, 51. Push am Tag 429", async () => {
  const { schluessel } = await einrichten();
  const viele = Array.from({ length: 201 }, (_, i) => ({ id: `e${i}`, art: "dabei", daten: { id: `d${i}`, name: "n", fach: "mathe" } }));
  assert.equal((await post("/ereignisse", viele, bearer(schluessel))).status, 413);
  const gross = [{ id: "x", art: "dabei", daten: { id: "x", name: "n".repeat(310 * 1024), fach: "mathe" } }];
  assert.equal((await post("/ereignisse", gross, bearer(schluessel))).status, 413);
  for (let i = 0; i < 50; i++) assert.equal((await post("/ereignisse", [], bearer(schluessel))).status, 200);
  assert.equal((await post("/ereignisse", [], bearer(schluessel))).status, 429);
});

test("Abmelden: alle Geräte der Adresse 410, Topf gelöscht", async () => {
  const eins = await einrichten();
  const zwei = await einrichten();
  await post("/ereignisse", [{ id: "e1", art: "dabei", daten: { id: "d1", name: "n", fach: "mathe" } }], bearer(eins.schluessel));
  const speicher = JSON.parse(readFileSync(t.datei, "utf8"));
  const abmeldeToken = speicher.adressen[ADRESSE].abmeldeToken;
  const frage = await fetch(`${t.url}/abmelden?t=${abmeldeToken}`);
  assert.match(await frage.text(), /<form method="post"/);
  assert.equal((await post("/ereignisse", [], bearer(eins.schluessel))).status, 200, "GET allein meldet nicht ab");
  assert.ok(JSON.parse(readFileSync(t.datei, "utf8")).adressen[ADRESSE]);
  const seite = await formular("/abmelden", abmeldeToken);
  assert.equal(seite.status, 200);
  assert.match(await seite.text(), /Abgemeldet/);
  assert.equal((await post("/ereignisse", [], bearer(eins.schluessel))).status, 410);
  assert.equal((await post("/ereignisse", [], bearer(zwei.schluessel))).status, 410);
  assert.equal(JSON.parse(readFileSync(t.datei, "utf8")).adressen[ADRESSE], undefined);
});

test("Not-Aus: /anmelden und /ereignisse antworten 503", async () => {
  const { schluessel } = await einrichten();
  await t.dienst.stop();
  const alt = t;
  t = { ...(await starte({ aus: true })), logs: alt.logs, originalLog: alt.originalLog };
  assert.equal((await post("/anmelden", { adresse: ADRESSE, uhrzeit: "18:00" })).status, 503);
  assert.equal(t.mails.length, 0);
  assert.equal((await post("/ereignisse", [], bearer(schluessel))).status, 401, "anderer Speicher, anderer Schlüssel");
  rmSync(alt.ordner, { recursive: true, force: true });
});

test("Not-Aus mit bekanntem Gerät: /ereignisse 503", async () => {
  const { schluessel } = await einrichten();
  await t.dienst.stop();
  const alt = t;
  const dienst = await starteDienst({ port: 0, datei: alt.datei, sende: async () => {}, aus: true });
  t = { ...alt, dienst, url: `http://127.0.0.1:${dienst.server.address().port}` };
  assert.equal((await post("/ereignisse", [], bearer(schluessel))).status, 503);
});

test("Probebrief sendet an die eigene Adresse, ohne den Topf zu leeren; 409 ohne Inhalt; 4. am Tag 429", async () => {
  const { schluessel } = await einrichten();
  assert.equal((await post("/probebrief", {}, bearer(schluessel))).status, 409);
  await post("/ereignisse", [{ id: "e1", art: "gekonnt", daten: { id: "g1", name: "Plus", zweck: "Rechnen im Alltag", fach: "mathe" } }], bearer(schluessel));
  const mailsVorher = t.mails.length;
  assert.equal((await post("/probebrief", {}, bearer(schluessel))).status, 200);
  assert.equal(t.mails.length, mailsVorher + 1);
  assert.equal(t.mails.at(-1).an, ADRESSE);
  assert.match(t.mails.at(-1).text, /Plus/);
  assert.match(t.mails.at(-1).text, /http:\/\/basis\/abmelden\?t=/);
  assert.equal(JSON.parse(readFileSync(t.datei, "utf8")).adressen[ADRESSE].topf.gekonnt.length, 1);
  await post("/probebrief", {}, bearer(schluessel));
  assert.equal((await post("/probebrief", {}, bearer(schluessel))).status, 429);
});

test("Einstellungen ändern Uhrzeit; DELETE /geraet löst das Gerät", async () => {
  const { schluessel } = await einrichten();
  assert.equal((await post("/einstellungen", { uhrzeit: "07:30", name: "Lena" }, bearer(schluessel))).status, 200);
  assert.equal((await post("/einstellungen", { uhrzeit: "25:00" }, bearer(schluessel))).status, 400);
  assert.equal(JSON.parse(readFileSync(t.datei, "utf8")).adressen[ADRESSE].uhrzeit, "07:30");
  assert.equal((await fetch(`${t.url}/geraet`, { method: "DELETE", headers: bearer(schluessel) })).status, 200);
  assert.equal((await post("/ereignisse", [], bearer(schluessel))).status, 401);
});

test("Datenschutzseite ohne App-Schlüssel erreichbar", async () => {
  const r = await fetch(`${t.url}/datenschutz`);
  assert.equal(r.status, 200);
  assert.match(await r.text(), /Datenschutz/);
});

test("Protokoll enthält weder Adresse noch Ereignistexte noch Token", async () => {
  const { schluessel, token } = await einrichten();
  await post("/ereignisse", [{ id: "e1", art: "gekonnt", daten: { id: "g1", name: GEHEIM, zweck: GEHEIM, fach: "mathe" } }], bearer(schluessel));
  await post("/probebrief", {}, bearer(schluessel));
  const log = t.logs.join("\n");
  assert.ok(log.length > 0);
  for (const verboten of [ADRESSE, "example.org", GEHEIM, token, schluessel]) assert.ok(!log.includes(verboten), `Protokoll enthält ${verboten}`);
});

test("Anfragen: abgelaufene verschwinden, abgeholte behalten weder Schlüssel noch Adresse noch Token", async () => {
  await t.dienst.stop();
  rmSync(t.ordner, { recursive: true, force: true });
  let jetzt = new Date("2026-11-17T10:00:00Z");
  t = await starte({ jetzt: () => jetzt });
  console.log = () => {};
  // abgeholt
  const { anfrageId } = await einrichten();
  const nachAbholung = JSON.parse(readFileSync(t.datei, "utf8")).anfragen[anfrageId];
  assert.deepEqual(Object.keys(nachAbholung).sort(), ["ablauf", "bestaetigt", "name", "token", "uhrzeit"].sort());
  assert.ok(!readFileSync(t.datei, "utf8").includes(ADRESSE + '","token'), "Adresse der Anfrage nicht mehr im Klartext");
  assert.equal(nachAbholung.token, "");
  // bestätigt, nie abgeholt
  const zwei = await post("/anmelden", { adresse: "zwei@example.org", uhrzeit: "18:00" });
  const zweiId = (await zwei.json()).anfrageId;
  await formular("/bestaetigen", /bestaetigen\?t=([\w-]+)/.exec(t.mails.at(-1).text)[1]);
  assert.ok(JSON.parse(readFileSync(t.datei, "utf8")).anfragen[zweiId].schluessel, "wartet auf Abholung");
  // unbestätigt
  await post("/anmelden", { adresse: "drei@example.org", uhrzeit: "18:00" });
  assert.equal(Object.keys(JSON.parse(readFileSync(t.datei, "utf8")).anfragen).length, 3);

  jetzt = new Date("2026-11-18T10:00:01Z");
  await post("/anmelden", { adresse: "vier@example.org", uhrzeit: "18:00" });
  const rest = JSON.parse(readFileSync(t.datei, "utf8")).anfragen;
  assert.equal(Object.keys(rest).length, 1, "nur die frische Anfrage bleibt");
  assert.ok(!readFileSync(t.datei, "utf8").includes("schluessel\":\""), "kein Klartext-Schlüssel mehr in der Datei");
  assert.equal((await fetch(`${t.url}/status?anfrage=${zweiId}`, { headers: KOPF })).status, 404);
});

test("gesperrtes Gerät (Präfix des Hash in `gesperrt`) bekommt bei /ereignisse und /probebrief 403", async () => {
  const { schluessel } = await einrichten();
  const andere = await einrichten("andere@example.org");
  const h = createHash("sha256").update(schluessel).digest("hex");
  await t.dienst.stop();
  const speicher = JSON.parse(readFileSync(t.datei, "utf8"));
  speicher.gesperrt = [h.slice(0, 12), "kurz"];
  writeFileSync(t.datei, JSON.stringify(speicher));
  const alt = t;
  const dienst = await starteDienst({ port: 0, datei: alt.datei, sende: async () => {} });
  t = { ...alt, dienst, url: `http://127.0.0.1:${dienst.server.address().port}` };
  assert.equal((await post("/ereignisse", [], bearer(schluessel))).status, 403);
  assert.equal((await post("/probebrief", {}, bearer(schluessel))).status, 403);
  assert.equal((await post("/ereignisse", [], bearer(andere.schluessel))).status, 200);
});

test("weiteres Gerät für eine bestätigte Adresse: Mail und Knopfseite warnen ausdrücklich", async () => {
  const WARNUNG = "Ein weiteres Gerät möchte den Tagesbrief für diese Adresse erhalten. Wenn Sie das nicht veranlasst haben, bestätigen Sie nicht.";
  await einrichten();
  assert.ok(!t.mails[0].text.includes("weiteres Gerät"), "erste Anmeldung ohne Warnung");
  await post("/anmelden", { adresse: ADRESSE, uhrzeit: "18:00" });
  const mail = t.mails.at(-1);
  assert.ok(mail.text.includes(WARNUNG));
  assert.ok(mail.html.includes(WARNUNG));
  const token = /bestaetigen\?t=([\w-]+)/.exec(mail.text)[1];
  assert.ok((await (await fetch(`${t.url}/bestaetigen?t=${token}`)).text()).includes(WARNUNG));
});
