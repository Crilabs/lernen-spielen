// Graph-Sender: Token mit Zertifikats-JWT, Cache, sendMail-Form, Fehler ohne Mailinhalt. Kein echter Netzaufruf.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash, generateKeyPairSync, randomBytes, verify } from "node:crypto";
import { graphSender } from "../dienste/tagesbrief/graph.js";

const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const schluesselPem = privateKey.export({ type: "pkcs8", format: "pem" });
const DER = randomBytes(300);
const zertifikatPem = `-----BEGIN CERTIFICATE-----\n${DER.toString("base64").replace(/.{64}/g, "$&\n")}\n-----END CERTIFICATE-----\n`;
const X5T = createHash("sha1").update(DER).digest("base64url");

function attrappe(antworten = {}) {
  const aufrufe = [];
  const fetch = async (url, opt) => {
    aufrufe.push({ url, opt });
    if (url.includes("login.microsoftonline.com")) return antworten.token ?? { ok: true, status: 200, json: async () => ({ access_token: "T0K3N", expires_in: 3600 }) };
    return antworten.mail ?? { ok: true, status: 202, json: async () => ({}) };
  };
  return { aufrufe, fetch };
}
const sender = (fetch) => graphSender({ tenant: "tenant-1", client: "client-1", absender: "lernen-spielen@crilabs.de", zertifikatPem, schluesselPem, fetch });
const mail = { an: "eltern@example.org", betreff: "Betreff", html: "<p>GEHEIMER-INHALT</p>", text: "t", foto: "QUJD" };

test("erster Versand holt ein Token mit signiertem JWT, zweiter nutzt den Cache", async () => {
  const { aufrufe, fetch } = attrappe();
  const sende = sender(fetch);
  await sende(mail);
  await sende(mail);
  assert.equal(aufrufe.filter((a) => a.url.includes("login.")).length, 1);
  const tokenAufruf = aufrufe[0];
  assert.equal(tokenAufruf.url, "https://login.microsoftonline.com/tenant-1/oauth2/v2.0/token");
  const f = new URLSearchParams(tokenAufruf.opt.body);
  assert.equal(f.get("client_assertion_type"), "urn:ietf:params:oauth:client-assertion-type:jwt-bearer");
  assert.equal(f.get("grant_type"), "client_credentials");
  assert.equal(f.get("scope"), "https://graph.microsoft.com/.default");
  assert.equal(f.get("client_id"), "client-1");
  const [k, p, s] = f.get("client_assertion").split(".");
  const kopf = JSON.parse(Buffer.from(k, "base64url"));
  const inhalt = JSON.parse(Buffer.from(p, "base64url"));
  assert.deepEqual(kopf, { alg: "RS256", typ: "JWT", x5t: X5T });
  assert.equal(inhalt.aud, "https://login.microsoftonline.com/tenant-1/oauth2/v2.0/token");
  assert.equal(inhalt.iss, "client-1");
  assert.equal(inhalt.sub, "client-1");
  assert.ok(inhalt.jti);
  assert.equal(inhalt.exp - inhalt.nbf, 600);
  assert.ok(verify("RSA-SHA256", Buffer.from(`${k}.${p}`), publicKey, Buffer.from(s, "base64url")), "Signatur stimmt");
});

test("sendMail: HTML-Body, saveToSentItems false, Foto als Inline-Anlage mit contentId anleitung", async () => {
  const { aufrufe, fetch } = attrappe();
  await sender(fetch)(mail);
  const m = aufrufe[1];
  assert.equal(m.url, "https://graph.microsoft.com/v1.0/users/lernen-spielen@crilabs.de/sendMail");
  assert.equal(m.opt.headers.authorization, "Bearer T0K3N");
  const k = JSON.parse(m.opt.body);
  assert.equal(k.saveToSentItems, false);
  assert.deepEqual(k.message.body, { contentType: "HTML", content: "<p>GEHEIMER-INHALT</p>" });
  assert.equal(k.message.subject, "Betreff");
  assert.equal(k.message.toRecipients[0].emailAddress.address, "eltern@example.org");
  assert.equal(k.message.attachments.length, 1);
  assert.equal(k.message.attachments[0].contentId, "anleitung");
  assert.equal(k.message.attachments[0].isInline, true);
  assert.equal(k.message.attachments[0]["@odata.type"], "#microsoft.graph.fileAttachment");
  assert.equal(k.message.attachments[0].contentBytes, "QUJD");
});

test("ohne Foto keine Anlage", async () => {
  const { aufrufe, fetch } = attrappe();
  await sender(fetch)({ ...mail, foto: undefined });
  assert.equal(JSON.parse(aufrufe[1].opt.body).message.attachments, undefined);
});

test("Antwort 4xx beim Senden: Fehler mit Status, ohne Mailinhalt", async () => {
  const { fetch } = attrappe({ mail: { ok: false, status: 403, json: async () => ({ fehler: "GEHEIMER-INHALT" }) } });
  await assert.rejects(sender(fetch)(mail), (e) => {
    assert.equal(e.status, 403);
    assert.match(e.message, /403/);
    for (const v of ["GEHEIMER-INHALT", "eltern@example.org", "Betreff"]) assert.ok(!e.message.includes(v));
    return true;
  });
});

test("Antwort 4xx beim Token: Fehler mit Status, kein Senden", async () => {
  const { aufrufe, fetch } = attrappe({ token: { ok: false, status: 401, json: async () => ({}) } });
  await assert.rejects(sender(fetch)(mail), (e) => e.status === 401);
  assert.equal(aufrufe.length, 1);
});

test("Graph-Aufrufe haben ein Zeitlimit; Retry-After wandert in den Fehler", async () => {
  const { aufrufe, fetch } = attrappe({ mail: { ok: false, status: 429, headers: new Headers({ "retry-after": "120" }), json: async () => ({}) } });
  await assert.rejects(sender(fetch)(mail), (e) => e.status === 429 && e.retryAfter === 120);
  for (const a of aufrufe) assert.ok(a.opt.signal instanceof AbortSignal);
});
