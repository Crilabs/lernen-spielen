// Zugangsdaten für Microsoft Graph aus /etc/lernen-spielen/graph.env (Dienst und Probebrief lesen dieselbe Datei).
import { readFileSync } from "node:fs";
import { graphSender } from "./graph.js";

export const ENV_DATEI = "/etc/lernen-spielen/graph.env";
const PFLICHT = ["GRAPH_TENANT_ID", "GRAPH_CLIENT_ID", "GRAPH_ABSENDER", "GRAPH_ZERTIFIKAT", "GRAPH_SCHLUESSEL"];

/** Liest `SCHLÜSSEL=Wert`-Zeilen; Kommentare (#) und Leerzeilen entfallen. @param {string} text */
export function liesEnv(text) {
  /** @type {Record<string, string>} */ const env = {};
  for (const zeile of text.split("\n")) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(zeile);
    if (m && !zeile.trim().startsWith("#")) env[m[1]] = m[2].replace(/^(["'])(.*)\1$/, "$2");
  }
  return env;
}

/** Baut den Graph-Sender aus der Env-Datei; fehlt ein Schlüssel, bricht er mit dessen Namen ab. @param {string} [datei] */
export function graphSenderAusDatei(datei = ENV_DATEI) {
  const env = liesEnv(readFileSync(datei, "utf8"));
  for (const k of PFLICHT) if (!env[k]) throw new Error(`${datei}: ${k} fehlt`);
  return graphSender({
    tenant: env.GRAPH_TENANT_ID,
    client: env.GRAPH_CLIENT_ID,
    absender: env.GRAPH_ABSENDER,
    zertifikatPem: readFileSync(env.GRAPH_ZERTIFIKAT, "utf8"),
    schluesselPem: readFileSync(env.GRAPH_SCHLUESSEL, "utf8"),
  });
}
