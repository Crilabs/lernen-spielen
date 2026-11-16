// ElevenLabs, REST-Schnittstelle. Stimme für neue Texte seit 2026-11-16 (Christian: „klingt deutlich besser“);
// Azure bleibt für Texte mit SSML-Korrekturen und als Rückfall. Schlüssel: ELEVENLABS_API_KEY (Umgebung oder .env).

import { existsSync } from "node:fs";
import { join } from "node:path";

const WARTEN_MS = [2000, 5000, 15000];

/** @param {string} wurzel @returns {string | undefined} */
export function holeElevenlabsSchluessel(wurzel) {
  if (!process.env.ELEVENLABS_API_KEY && existsSync(join(wurzel, ".env"))) {
    try {
      process.loadEnvFile(join(wurzel, ".env"));
    } catch {
      /* .env unlesbar: unten fehlt dann der Schlüssel */
    }
  }
  return process.env.ELEVENLABS_API_KEY || undefined;
}

/**
 * @param {{ schluessel?: string, stimme: string, modell: string, format: string, sprache?: string,
 *   fetch?: typeof fetch, schlafe?: (ms: number) => Promise<void> }} o
 * @returns {(text: string, o?: { tempo?: number }) => Promise<Buffer>} tempo: ElevenLabs speed (0.7–1.2)
 */
export function elevenlabs({ schluessel, stimme, modell, format, sprache = "de", fetch: f = fetch, schlafe = (ms) => new Promise((r) => setTimeout(r, ms)) }) {
  if (!schluessel) throw new Error("Kein ElevenLabs-Schlüssel: ELEVENLABS_API_KEY in der Umgebung oder in .env setzen. Siehe werkzeuge/audio/README.md.");
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(stimme)}?output_format=${encodeURIComponent(format)}`;
  return async function synth(text, { tempo } = {}) {
    const body = { text, model_id: modell, language_code: sprache, ...(tempo ? { voice_settings: { speed: tempo } } : {}) };
    for (let versuch = 0; ; versuch += 1) {
      const r = await f(url, { method: "POST", headers: { "xi-api-key": schluessel, "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (r.ok) return Buffer.from(await r.arrayBuffer());
      const nochmal = (r.status === 429 || r.status >= 500) && versuch < WARTEN_MS.length;
      if (!nochmal) throw new Error(`ElevenLabs ${r.status}: ${(await r.text()).slice(0, 300)}`);
      await schlafe(WARTEN_MS[versuch]);
    }
  };
}
