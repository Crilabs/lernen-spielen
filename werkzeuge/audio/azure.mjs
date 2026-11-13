// Azure Speech, REST-Schnittstelle (keine Abhängigkeit vom SDK).
// Schlüssel und Region kommen aus der Umgebung: AZURE_SPEECH_KEY, AZURE_SPEECH_REGION.

import { execFileSync } from "node:child_process";

const WARTEN_MS = [1000, 3000, 8000];

/**
 * Schlüssel aus AZURE_SPEECH_KEY, sonst über die angemeldete Azure-CLI (az login) aus der Ressource in
 * einstellungen.json › azure. Liefert undefined, wenn beides nicht geht.
 * @param {{ azure?: { ressource: string, gruppe: string } }} einstellungen
 * @returns {string | undefined}
 */
export function holeSchluessel(einstellungen) {
  if (process.env.AZURE_SPEECH_KEY) return process.env.AZURE_SPEECH_KEY;
  const r = einstellungen.azure;
  if (!r) return undefined;
  try {
    const k = execFileSync(
      "az",
      ["cognitiveservices", "account", "keys", "list", "-n", r.ressource, "-g", r.gruppe, "--query", "key1", "-o", "tsv"],
      { encoding: "utf8", timeout: 30000, stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
    if (k) process.env.AZURE_SPEECH_KEY = k;   // nur für diesen Prozess
    return k || undefined;
  } catch {
    return undefined;
  }
}

/**
 * @param {{ schluessel?: string, region?: string, format: string, fetch?: typeof fetch, schlafe?: (ms: number) => Promise<void> }} o
 * @returns {(ssml: string) => Promise<Buffer>}
 */
export function azure({ schluessel, region, format, fetch: f = fetch, schlafe = (ms) => new Promise((r) => setTimeout(r, ms)) }) {
  if (!schluessel || !region)
    throw new Error(
      "Kein Azure-Schlüssel: weder AZURE_SPEECH_KEY gesetzt noch über die Azure-CLI abrufbar (az login?). Siehe werkzeuge/audio/README.md.",
    );
  const url = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
  return async function synth(ssml) {
    for (let versuch = 0; ; versuch += 1) {
      const r = await f(url, {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": schluessel,
          "Content-Type": "application/ssml+xml",
          "X-Microsoft-OutputFormat": format,
          "User-Agent": "lernen-spielen-werkzeuge",
        },
        body: ssml,
      });
      if (r.ok) return Buffer.from(await r.arrayBuffer());
      const nochmal = (r.status === 429 || r.status >= 500) && versuch < WARTEN_MS.length;
      if (!nochmal) throw new Error(`Azure ${r.status}: ${(await r.text()).slice(0, 300)}`);
      await schlafe(WARTEN_MS[versuch]);
    }
  };
}
