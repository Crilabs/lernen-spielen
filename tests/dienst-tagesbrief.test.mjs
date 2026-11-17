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
export const naechstes = (id, extra = {}) => ({ id, thema: "Neunerreihe", fach: "mathe", titel: "Die Neunerreihe", passendZuGerade: true, formen: [{ situation: "tisch", wort: "Tisch", name: "Mit Perlen", braucht: "Perlen", schritte: ["Legen"], kern: "k", verinnerlichen: "v" }], foto: "", weitere: [], ...extra });
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
const speicher = () => JSON.parse(readFileSync(t.datei, "utf8"));
const fam = (adresse = ADRESSE) => Object.values(speicher().familien).find((f) => adresse in f.empfaenger);
const tokenAusMail = (m) => /bestaetigen\?t=([\w-]+)/.exec(m.text)[1];
const del = (pfad, koerper, schluessel) => fetch(t.url + pfad, { method: "DELETE", headers: bearer(schluessel), body: JSON.stringify(koerper) });
const liste = async (schluessel) => (await fetch(`${t.url}/empfaenger`, { headers: bearer(schluessel) })).json();
/** Fügt eine Adresse hinzu und bestätigt sie. */
async function empfaengerDazu(schluessel, adresse) {
  assert.equal((await post("/empfaenger", { adresse }, bearer(schluessel))).status, 200);
  const token = tokenAusMail(t.mails.at(-1));
  assert.equal((await formular("/bestaetigen", token)).status, 200);
  return token;
}

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
  assert.equal(fam().topf.gekonnt.length, 1);
  assert.equal(fam("andere@example.org").topf.gekonnt.length, 0);
  assert.ok(andere.schluessel);
  assert.ok(!JSON.stringify(speicher).includes(mia.schluessel), "Schlüssel nur als Hash");
});

test("doppelte Ereignis-Id zählt einmal; naechstes ersetzt den vorigen", async () => {
  // Feste Uhr vor der Brief-Uhrzeit (18:00): danach käme ein naechstes absichtlich nur auf den zweiten Platz.
  const { originalLog } = t;
  await t.dienst.stop();
  rmSync(t.ordner, { recursive: true, force: true });
  t = { ...(await starte({ jetzt: () => new Date("2026-11-17T09:00:00Z") })), originalLog };
  const { schluessel } = await einrichten();
  const g = (id, did) => ({ id, art: "gekonnt", daten: { id: did, name: "N", zweck: "z", fach: "mathe" } });
  await post("/ereignisse", [g("e1", "g1"), g("e1", "g2"), g("e2", "g1"), { id: "e3", art: "gelesen", daten: { id: "b1", titel: "T", frage: "f", antwort: "a" } }, { id: "e4", art: "gelesen", daten: { id: "b1", titel: "T", frage: "f", antwort: "a" } }], bearer(schluessel));
  await post("/ereignisse", [g("e1", "g1"), { id: "n1", art: "naechstes", daten: naechstes("a1") }], bearer(schluessel));
  await post("/ereignisse", [{ id: "n2", art: "naechstes", daten: naechstes("a2") }], bearer(schluessel));
  const topf = fam().topf;
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
  const abmeldeToken = fam().empfaenger[ADRESSE].abmeldeToken;
  const frage = await fetch(`${t.url}/abmelden?t=${abmeldeToken}`);
  assert.match(await frage.text(), /<form method="post"/);
  assert.equal((await post("/ereignisse", [], bearer(eins.schluessel))).status, 200, "GET allein meldet nicht ab");
  assert.ok(fam());
  const seite = await formular("/abmelden", abmeldeToken);
  assert.equal(seite.status, 200);
  assert.match(await seite.text(), /Abgemeldet/);
  assert.equal((await post("/ereignisse", [], bearer(eins.schluessel))).status, 410);
  assert.equal((await post("/ereignisse", [], bearer(zwei.schluessel))).status, 410);
  assert.equal(fam(), undefined);
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
  assert.equal(fam().topf.gekonnt.length, 1);
  await post("/probebrief", {}, bearer(schluessel));
  assert.equal((await post("/probebrief", {}, bearer(schluessel))).status, 429);
});

test("Einstellungen ändern Uhrzeit; DELETE /geraet löst das Gerät", async () => {
  const { schluessel } = await einrichten();
  assert.equal((await post("/einstellungen", { uhrzeit: "07:30", name: "Lena" }, bearer(schluessel))).status, 200);
  assert.equal((await post("/einstellungen", { uhrzeit: "25:00" }, bearer(schluessel))).status, 400);
  assert.equal(fam().uhrzeit, "07:30");
  assert.equal(fam().name, "Lena");
  assert.equal((await fetch(`${t.url}/geraet`, { method: "DELETE", headers: bearer(schluessel) })).status, 200);
  assert.equal((await post("/ereignisse", [], bearer(schluessel))).status, 401);
});

test("Datenschutzseite ohne App-Schlüssel erreichbar", async () => {
  const r = await fetch(`${t.url}/datenschutz`);
  assert.equal(r.status, 200);
  assert.match(await r.text(), /Datenschutz/);
});

test("HEAD auf Seiten antwortet wie GET (Link-Prüfer, curl -I)", async () => {
  assert.equal((await fetch(`${t.url}/datenschutz`, { method: "HEAD" })).status, 200);
  assert.equal((await fetch(`${t.url}/abmelden?t=x`, { method: "HEAD" })).status, 200);
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

test("gesperrtes Gerät (Präfix des Hash in `gesperrt`) bekommt bei allen Geräte-Endpunkten außer DELETE /geraet 403", async () => {
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
  assert.equal((await post("/einstellungen", { uhrzeit: "07:30" }, bearer(schluessel))).status, 403);
  assert.equal((await post("/ereignisse", [], bearer(andere.schluessel))).status, 200);
  assert.equal((await fetch(`${t.url}/geraet`, { method: "DELETE", headers: bearer(schluessel) })).status, 200, "sich selbst lösen bleibt erlaubt");
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

// ---- Familie mit Empfängern ----

test("Empfänger hinzufügen: wartend bis zur Bestätigung per POST, Mail mit Text für zusätzliche Adresse, kein Schlüssel", async () => {
  const { schluessel } = await einrichten();
  assert.equal((await post("/empfaenger", { adresse: "Oma@Example.org " }, bearer(schluessel))).status, 200);
  const mail = t.mails.at(-1);
  assert.equal(mail.an, "oma@example.org");
  const TEXT = "Sie sollen den Tagesbrief für Mia zusätzlich erhalten. Wenn Sie das nicht erwartet haben, bestätigen Sie nicht.";
  assert.ok(mail.text.includes(TEXT));
  assert.ok(mail.html.includes(TEXT));
  assert.deepEqual((await liste(schluessel)).empfaenger, [{ adresse: ADRESSE, bestaetigt: true }, { adresse: "oma@example.org", bestaetigt: false }]);
  const token = tokenAusMail(mail);
  const seite = await (await fetch(`${t.url}/bestaetigen?t=${token}`)).text();
  assert.ok(seite.includes(TEXT));
  assert.equal((await liste(schluessel)).empfaenger[1].bestaetigt, false, "GET allein bestätigt nicht");
  assert.equal((await formular("/bestaetigen", token)).status, 200);
  assert.deepEqual(await liste(schluessel), { uhrzeit: "18:00", name: "Mia", empfaenger: [{ adresse: ADRESSE, bestaetigt: true }, { adresse: "oma@example.org", bestaetigt: true }] });
  assert.equal((await formular("/bestaetigen", token)).status, 400, "Link nur einmal");
  assert.ok(!JSON.stringify(speicher().anfragen).includes("schluessel\":\""), "kein Schlüssel für Empfänger");
});

test("Empfänger: ohne Namen heißt es „ein Kind“; Name nur aus Buchstaben, Leerzeichen, Bindestrich (sonst 400)", async () => {
  const { schluessel } = await einrichten();
  await post("/einstellungen", { name: "" }, bearer(schluessel));
  await post("/empfaenger", { adresse: "a@example.org" }, bearer(schluessel));
  assert.ok(t.mails.at(-1).text.includes("für ein Kind zusätzlich"));
  for (const schlecht of ["<b>X</b>", "http://boese.example", "Mia1", "a".repeat(41), "Mia\nLena"]) {
    assert.equal((await post("/einstellungen", { name: schlecht }, bearer(schluessel))).status, 400, schlecht);
  }
  assert.equal((await post("/anmelden", { adresse: "n@example.org", name: "<b>", uhrzeit: "18:00" })).status, 400);
  assert.equal((await post("/einstellungen", { name: "Anna-Lena Müßig" }, bearer(schluessel))).status, 200);
  await post("/empfaenger", { adresse: "b@example.org" }, bearer(schluessel));
  assert.ok(t.mails.at(-1).text.includes("für Anna-Lena Müßig zusätzlich"));
  // Ein ungültiger, schon gespeicherter Name (z. B. aus älterer Datei) kommt nie in eine Einladung.
  await t.dienst.stop();
  const daten = speicher();
  for (const f of Object.values(daten.familien)) f.name = "http://boese.example";
  writeFileSync(t.datei, JSON.stringify(daten));
  t.dienst = await starteDienst({ port: 0, datei: t.datei, sende: async (m) => { t.mails.push(m); }, basis: "http://basis" });
  t.url = `http://127.0.0.1:${t.dienst.server.address().port}`;
  await post("/empfaenger", { adresse: "c@example.org" }, bearer(schluessel));
  assert.ok(!t.mails.at(-1).text.includes("boese") && t.mails.at(-1).text.includes("ein Kind"));
  const seite = await (await fetch(`${t.url}/bestaetigen?t=${tokenAusMail(t.mails.at(-1))}`)).text();
  assert.ok(!seite.includes("boese"));
});

test("Über /empfaenger hinzugefügte Adresse führt bei /anmelden zu einer neuen Familie ohne Zugriff auf die alte", async () => {
  const alt = await einrichten();
  await empfaengerDazu(alt.schluessel, "gast@example.org");
  const neu = await einrichten("gast@example.org");
  assert.equal(Object.keys(speicher().familien).length, 2);
  assert.deepEqual((await liste(neu.schluessel)).empfaenger, [{ adresse: "gast@example.org", bestaetigt: true }]);
  assert.deepEqual((await liste(alt.schluessel)).empfaenger.map((e) => e.adresse), [ADRESSE, "gast@example.org"]);
  assert.ok(!t.mails.at(-1).text.includes("weiteres Gerät"));
  assert.equal(fam(ADRESSE).empfaenger["gast@example.org"].rolle, "empfaenger");
  assert.equal(Object.keys(fam(ADRESSE).geraete).length, 1, "kein Gerät in der alten Familie dazu");
});

test("Einladungen: höchstens 5 je Familie und Tag (zusätzlich zu IP und Adresse)", async () => {
  const { schluessel } = await einrichten();
  const mitIp = (i) => ({ ...bearer(schluessel), "x-forwarded-for": `10.0.0.${i}` });
  for (let i = 0; i < 5; i++) {
    assert.equal((await post("/empfaenger", { adresse: `e${i}@example.org` }, mitIp(i))).status, 200, `Einladung ${i + 1}`);
    await del("/empfaenger", { adresse: `e${i}@example.org` }, schluessel);
  }
  assert.equal((await post("/empfaenger", { adresse: "e6@example.org" }, mitIp(9))).status, 429);
});

test("Empfänger: höchstens 4 (bestätigt und wartend), doppelt 409, ungültig 400, ohne Schlüssel 401", async () => {
  const { schluessel } = await einrichten();
  assert.equal((await post("/empfaenger", { adresse: "kein-at" }, bearer(schluessel))).status, 400);
  assert.equal((await post("/empfaenger", { adresse: "x@example.org" }, KOPF)).status, 401);
  assert.equal((await post("/empfaenger", { adresse: ADRESSE }, bearer(schluessel))).status, 409);
  assert.deepEqual(await (await post("/empfaenger", { adresse: ADRESSE.toUpperCase() }, bearer(schluessel))).json(), { fehler: "vorhanden" });
  await empfaengerDazu(schluessel, "b@example.org");
  assert.equal((await post("/empfaenger", { adresse: "c@example.org" }, bearer(schluessel))).status, 200, "wartend zählt mit");
  assert.equal((await post("/empfaenger", { adresse: "c@example.org" }, bearer(schluessel))).status, 409);
  assert.equal((await post("/empfaenger", { adresse: "d@example.org" }, bearer(schluessel))).status, 200);
  const voll = await post("/empfaenger", { adresse: "e@example.org" }, bearer(schluessel));
  assert.equal(voll.status, 409);
  assert.deepEqual(await voll.json(), { fehler: "voll" });
  assert.equal(t.mails.at(-1).an, "d@example.org", "keine Mail an die abgelehnte Adresse");
});

test("GET /empfaenger zeigt nur die eigene Familie", async () => {
  const mia = await einrichten();
  const andere = await einrichten("andere@example.org");
  await empfaengerDazu(andere.schluessel, "fremd@example.org");
  assert.deepEqual((await liste(mia.schluessel)).empfaenger, [{ adresse: ADRESSE, bestaetigt: true }]);
  assert.ok(!JSON.stringify(await liste(mia.schluessel)).includes("fremd"));
});

test("Empfängerbindung: ein Empfänger in einem Ereignis-Körper bekommt nie einen Brief und nichts landet bei ihm", async () => {
  const { schluessel } = await einrichten();
  const ereignis = { id: "e1", art: "gekonnt", an: "x@example.org", empfaenger: ["x@example.org"], daten: { id: "g1", name: "N", zweck: "z", fach: "mathe" } };
  assert.equal((await post("/ereignisse", [ereignis], bearer(schluessel))).status, 200);
  assert.deepEqual(Object.keys(fam().empfaenger), [ADRESSE]);
  assert.ok(!JSON.stringify(speicher()).includes("x@example.org"));
});

test("Empfänger entfernen: wartend (Link wird ungültig), bestätigt, letzter bestätigter löscht die Familie (410)", async () => {
  const { schluessel } = await einrichten();
  const geraet2 = await einrichten();
  await post("/empfaenger", { adresse: "wartet@example.org" }, bearer(schluessel));
  const wartenderToken = tokenAusMail(t.mails.at(-1));
  assert.deepEqual(await (await del("/empfaenger", { adresse: "wartet@example.org" }, schluessel)).json(), { ok: true });
  assert.equal((await formular("/bestaetigen", wartenderToken)).status, 400);
  assert.equal((await liste(schluessel)).empfaenger.length, 1);
  assert.equal((await del("/empfaenger", { adresse: "unbekannt@example.org" }, schluessel)).status, 404);
  await empfaengerDazu(schluessel, "zwei@example.org");
  assert.deepEqual(await (await del("/empfaenger", { adresse: ADRESSE }, schluessel)).json(), { ok: true });
  assert.equal((await post("/ereignisse", [], bearer(schluessel))).status, 200, "Familie lebt mit dem zweiten Empfänger");
  await post("/empfaenger", { adresse: "wartet2@example.org" }, bearer(schluessel));
  assert.deepEqual(await (await del("/empfaenger", { adresse: "zwei@example.org" }, schluessel)).json(), { familieGeloescht: true });
  assert.equal((await post("/ereignisse", [], bearer(schluessel))).status, 410);
  assert.equal((await post("/ereignisse", [], bearer(geraet2.schluessel))).status, 410);
  assert.deepEqual(speicher().familien, {});
  assert.deepEqual(Object.keys(speicher().anfragen).filter((k) => speicher().anfragen[k].art === "empfaenger"), []);
});

test("Abmelden per Token entfernt nur diesen Empfänger; der letzte löscht die Familie", async () => {
  const { schluessel } = await einrichten();
  await empfaengerDazu(schluessel, "zwei@example.org");
  const tokenEins = fam().empfaenger[ADRESSE].abmeldeToken;
  const tokenZwei = fam().empfaenger["zwei@example.org"].abmeldeToken;
  assert.notEqual(tokenEins, tokenZwei);
  assert.equal((await formular("/abmelden", tokenEins)).status, 200);
  assert.deepEqual((await liste(schluessel)).empfaenger, [{ adresse: "zwei@example.org", bestaetigt: true }]);
  assert.equal((await formular("/abmelden", tokenEins)).status, 200, "zweimal ist harmlos");
  assert.equal((await formular("/abmelden", tokenZwei)).status, 200);
  assert.equal((await post("/ereignisse", [], bearer(schluessel))).status, 410);
});

test("Anmelden mit Adresse eines bestätigten Empfängers tritt der Familie bei; in mehreren Familien entsteht eine neue", async () => {
  const eins = await einrichten();
  await empfaengerDazu(eins.schluessel, "geteilt@example.org");
  const zwei = await einrichten("andere@example.org");
  await empfaengerDazu(zwei.schluessel, "geteilt@example.org");
  assert.equal(Object.keys(speicher().familien).length, 2);
  // Die Grenze je IP (5 je Stunde) würde sonst greifen: Zähler in der Datei leeren und neu starten.
  await t.dienst.stop();
  writeFileSync(t.datei, JSON.stringify({ ...speicher(), zaehler: {} }));
  t.dienst = await starteDienst({ port: 0, datei: t.datei, sende: async (m) => { t.mails.push(m); }, basis: "http://basis" });
  t.url = `http://127.0.0.1:${t.dienst.server.address().port}`;
  const neu = await einrichten("geteilt@example.org");
  assert.equal(Object.keys(speicher().familien).length, 3, "mehrdeutig: neue Familie");
  assert.ok(!t.mails.at(-1).text.includes("weiteres Gerät"));
  const beitritt = await einrichten("familie@example.org");
  assert.equal(Object.keys(speicher().familien).length, 3, "eindeutig: Beitritt");
  assert.equal(Object.keys(fam().geraete).length, 2);
  assert.ok(neu.schluessel && beitritt.schluessel);
});

test("Empfänger-Link läuft nach 24 Stunden ab und gibt den Platz frei", async () => {
  await t.dienst.stop();
  rmSync(t.ordner, { recursive: true, force: true });
  let jetzt = new Date("2026-11-17T10:00:00Z");
  t = await starte({ jetzt: () => jetzt });
  console.log = () => {};
  const { schluessel } = await einrichten();
  await post("/empfaenger", { adresse: "spaet@example.org" }, bearer(schluessel));
  const token = tokenAusMail(t.mails.at(-1));
  jetzt = new Date("2026-11-18T10:00:01Z");
  assert.equal((await formular("/bestaetigen", token)).status, 400);
  assert.deepEqual((await liste(schluessel)).empfaenger.map((e) => e.adresse), [ADRESSE]);
});

test("Mail-Fehler beim Hinzufügen lässt keinen wartenden Empfänger zurück", async () => {
  const { schluessel } = await einrichten();
  await t.dienst.stop();
  const alt = t;
  const dienst = await starteDienst({ port: 0, datei: alt.datei, sende: async () => { throw new Error("aus"); } });
  t = { ...alt, dienst, url: `http://127.0.0.1:${dienst.server.address().port}` };
  assert.equal((await post("/empfaenger", { adresse: "x@example.org" }, bearer(schluessel))).status, 500);
  assert.deepEqual((await liste(schluessel)).empfaenger.map((e) => e.adresse), [ADRESSE]);
});

test("Empfänger-Endpunkte: Not-Aus 503 beim Hinzufügen, gesperrtes Gerät 403, Grenze je Adresse 429", async () => {
  const { schluessel } = await einrichten();
  const h = createHash("sha256").update(schluessel).digest("hex");
  for (let i = 0; i < 3; i++) {
    await post("/empfaenger", { adresse: "viel@example.org" }, bearer(schluessel));
    await del("/empfaenger", { adresse: "viel@example.org" }, schluessel);
  }
  assert.equal((await post("/empfaenger", { adresse: "viel@example.org" }, bearer(schluessel))).status, 429);
  await t.dienst.stop();
  const speichern = speicher();
  speichern.gesperrt = [h.slice(0, 12)];
  writeFileSync(t.datei, JSON.stringify(speichern));
  const alt = t;
  const dienst = await starteDienst({ port: 0, datei: alt.datei, sende: async () => {} });
  t = { ...alt, dienst, url: `http://127.0.0.1:${dienst.server.address().port}` };
  assert.equal((await post("/empfaenger", { adresse: "n@example.org" }, bearer(schluessel))).status, 403);
  assert.equal((await fetch(`${t.url}/empfaenger`, { headers: bearer(schluessel) })).status, 403);
  assert.equal((await del("/empfaenger", { adresse: ADRESSE }, schluessel)).status, 403);
  await dienst.stop();
  writeFileSync(alt.datei, JSON.stringify({ ...speicher(), gesperrt: [] }));
  const aus = await starteDienst({ port: 0, datei: alt.datei, sende: async () => { throw new Error("Not-Aus darf nicht senden"); }, aus: true });
  t = { ...alt, dienst: aus, url: `http://127.0.0.1:${aus.server.address().port}` };
  assert.equal((await post("/empfaenger", { adresse: "n@example.org" }, bearer(schluessel))).status, 503);
  assert.deepEqual((await liste(schluessel)).empfaenger.map((e) => e.adresse), [ADRESSE], "nichts angelegt");
});

test("Start mit fehlender, 0-Byte- und alter Datei (adressen) gelingt, alte Daten werden verworfen", async () => {
  await t.dienst.stop();
  for (const inhalt of ["", "LEER", '{"adressen":{"alt@example.org":{"uhrzeit":"18:00","namen":{},"geraete":{},"topf":{},"verschickt":[],"abmeldeToken":"x"}},"anfragen":{},"zaehler":{},"abgemeldet":{}}', '{"adressen":{"x":{}},"familien":{},"anfragen":{},"zaehler":{},"abgemeldet":{}}']) {
    if (inhalt === "LEER") writeFileSync(t.datei, "");
    else if (inhalt) writeFileSync(t.datei, inhalt);
    else rmSync(t.datei, { force: true });
    const dienst = await starteDienst({ port: 0, datei: t.datei, sende: async () => {} });
    const url = `http://127.0.0.1:${dienst.server.address().port}`;
    assert.equal((await fetch(`${url}/datenschutz`)).status, 200);
    assert.equal(await dienst.pruefeFaellige(), 0);
    assert.equal((await fetch(`${url}/anmelden`, { method: "POST", headers: KOPF, body: JSON.stringify({ adresse: ADRESSE, uhrzeit: "18:00" }) })).status, 200);
    await dienst.stop();
    const nach = JSON.parse(readFileSync(t.datei, "utf8"));
    assert.deepEqual(nach.familien, {});
    assert.equal(nach.adressen, undefined, "alte Tabelle fällt weg");
  }
  t.dienst = await starteDienst({ port: 0, datei: t.datei, sende: async () => {} });
  t.url = `http://127.0.0.1:${t.dienst.server.address().port}`;
});

test("Protokoll der Empfänger-Endpunkte enthält keine Adressen", async () => {
  const { schluessel } = await einrichten();
  await empfaengerDazu(schluessel, "geheim@example.org");
  await liste(schluessel);
  await del("/empfaenger", { adresse: "geheim@example.org" }, schluessel);
  const log = t.logs.join("\n");
  assert.ok(log.includes("/empfaenger"));
  assert.ok(!log.includes("geheim") && !log.includes("example.org"));
});
