// Startet den Versanddienst auf dem Server: Zugangsdaten aus /etc/lernen-spielen/graph.env, Zeitgeber jede Minute.
// Umgebung: PORT (Standard 3600), TAGESBRIEF_AUS=1 (Not-Aus), TAGESBRIEF_DATEI (Speicherdatei).
import { readFileSync } from "node:fs";
import { graphSender } from "./graph.js";
import { starteDienst } from "./server.js";

const ENV_DATEI = "/etc/lernen-spielen/graph.env";

/** Liest `SCHLÜSSEL=Wert`-Zeilen; Kommentare (#) und Leerzeilen entfallen. @param {string} text */
function liesEnv(text) {
  /** @type {Record<string, string>} */ const env = {};
  for (const zeile of text.split("\n")) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(zeile);
    if (m && !zeile.trim().startsWith("#")) env[m[1]] = m[2].replace(/^(["'])(.*)\1$/, "$2");
  }
  return env;
}

const env = liesEnv(readFileSync(ENV_DATEI, "utf8"));
for (const k of ["GRAPH_TENANT_ID", "GRAPH_CLIENT_ID", "GRAPH_ABSENDER", "GRAPH_ZERTIFIKAT", "GRAPH_SCHLUESSEL"]) {
  if (!env[k]) throw new Error(`${ENV_DATEI}: ${k} fehlt`);
}

const sende = graphSender({
  tenant: env.GRAPH_TENANT_ID,
  client: env.GRAPH_CLIENT_ID,
  absender: env.GRAPH_ABSENDER,
  zertifikatPem: readFileSync(env.GRAPH_ZERTIFIKAT, "utf8"),
  schluesselPem: readFileSync(env.GRAPH_SCHLUESSEL, "utf8"),
});

const dienst = await starteDienst({
  port: Number(process.env.PORT ?? 3600),
  datei: process.env.TAGESBRIEF_DATEI ?? "/var/lib/lernen-spielen/tagesbrief.json",
  sende,
  aus: process.env.TAGESBRIEF_AUS === "1",
});

const zeitgeber = setInterval(() => {
  dienst.pruefeFaellige().catch((e) => console.log(`${new Date().toISOString()} Prüfung fehlgeschlagen: ${e?.name ?? "Fehler"} ${e?.code ?? ""}`.trim()));
}, 60_000);

for (const signal of ["SIGTERM", "SIGINT"]) process.on(signal, () => { clearInterval(zeitgeber); dienst.stop().then(() => process.exit(0)); });
