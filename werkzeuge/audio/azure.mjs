// Azure Speech, REST-Schnittstelle (keine Abhängigkeit vom SDK).
// Schlüssel und Region kommen aus der Umgebung: AZURE_SPEECH_KEY, AZURE_SPEECH_REGION.

const WARTEN_MS = [1000, 3000, 8000];

/**
 * @param {{ schluessel?: string, region?: string, format: string, fetch?: typeof fetch, schlafe?: (ms: number) => Promise<void> }} o
 * @returns {(ssml: string) => Promise<Buffer>}
 */
export function azure({ schluessel, region, format, fetch: f = fetch, schlafe = (ms) => new Promise((r) => setTimeout(r, ms)) }) {
  if (!schluessel || !region)
    throw new Error(
      "AZURE_SPEECH_KEY und AZURE_SPEECH_REGION fehlen. Siehe werkzeuge/audio/README.md (Schlüssel holen).",
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
