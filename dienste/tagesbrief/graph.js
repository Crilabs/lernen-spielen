// Versand über Microsoft Graph (Spec „Versanddienst“): Client-Credentials mit Zertifikat (JWT RS256 als client_assertion),
// Token im Speicher bis 5 Minuten vor Ablauf, sendMail nur mit HTML-Body (Graph kennt keinen zweiten Text-Teil).
import { createHash, randomUUID, sign } from "node:crypto";

const ZEITLIMIT_MS = 30_000;
const GUELTIG_S = 600;
const PUFFER_MS = 5 * 60_000;

/** @param {string | Buffer} daten */
const b64url = (daten) => Buffer.from(daten).toString("base64url");

/** Fehler ohne Mailinhalt: nur Phase und Status. @param {string} phase @param {number} status @param {any} [antwort] Antwort, aus der `Retry-After` stammt */
function graphFehler(phase, status, /** @type {any} */ antwort) {
  const sekunden = Number(antwort?.headers?.get?.("retry-after"));
  return Object.assign(new Error(`Graph ${phase} fehlgeschlagen (HTTP ${status})`), {
    name: "GraphFehler", code: `GRAPH_${status}`, status, ...(sekunden > 0 ? { retryAfter: sekunden } : {}),
  });
}

/**
 * @param {{ tenant: string, client: string, absender: string, zertifikatPem: string, schluesselPem: string, fetch?: typeof fetch }} optionen
 * @returns {(mail: { an: string, betreff: string, html: string, text?: string, foto?: string }) => Promise<void>}
 */
export function graphSender({ tenant, client, absender, zertifikatPem, schluesselPem, fetch = globalThis.fetch }) {
  const aud = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`;
  const der = Buffer.from(zertifikatPem.replace(/-----[A-Z ]+-----|\s/g, ""), "base64");
  const x5t = createHash("sha1").update(der).digest("base64url");
  /** @type {{ wert: string, bis: number } | null} */
  let zwischen = null;

  const assertion = () => {
    const jetzt = Math.floor(Date.now() / 1000);
    const kopf = b64url(JSON.stringify({ alg: "RS256", typ: "JWT", x5t }));
    const inhalt = b64url(JSON.stringify({ aud, iss: client, sub: client, jti: randomUUID(), nbf: jetzt, exp: jetzt + GUELTIG_S }));
    return `${kopf}.${inhalt}.${b64url(sign("RSA-SHA256", Buffer.from(`${kopf}.${inhalt}`), schluesselPem))}`;
  };

  async function token() {
    if (zwischen && zwischen.bis > Date.now()) return zwischen.wert;
    const antwort = await fetch(aud, {
      method: "POST",
      signal: AbortSignal.timeout(ZEITLIMIT_MS),
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: client,
        scope: "https://graph.microsoft.com/.default",
        client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
        client_assertion: assertion(),
        grant_type: "client_credentials",
      }).toString(),
    });
    if (!antwort.ok) throw graphFehler("Anmeldung", antwort.status, antwort);
    const k = await antwort.json();
    zwischen = { wert: k.access_token, bis: Date.now() + k.expires_in * 1000 - PUFFER_MS };
    return k.access_token;
  }

  return async ({ an, betreff, html, foto }) => {
    const nachricht = {
      subject: betreff,
      body: { contentType: "HTML", content: html },
      toRecipients: [{ emailAddress: { address: an } }],
      ...(foto ? { attachments: [{ "@odata.type": "#microsoft.graph.fileAttachment", name: "anleitung.jpg", contentType: "image/jpeg", contentBytes: foto, isInline: true, contentId: "anleitung" }] } : {}),
    };
    const antwort = await fetch(`https://graph.microsoft.com/v1.0/users/${absender}/sendMail`, {
      method: "POST",
      signal: AbortSignal.timeout(ZEITLIMIT_MS),
      headers: { authorization: `Bearer ${await token()}`, "content-type": "application/json" },
      body: JSON.stringify({ message: nachricht, saveToSentItems: false }),
    });
    if (!antwort.ok) throw graphFehler("Versand", antwort.status, antwort);
  };
}
