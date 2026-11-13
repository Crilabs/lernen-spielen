// Fortschritt eines Spiels über sein Modul fortschritt/<id>.js laden.
// Modul vorhanden: Zahl 0..1 (ohne Lernstand 0). Kein Modul oder Fehler: undefined.
import { lade, protokoll } from "../lernspiel.js";

export async function wertVon(id) {
  const url = new URL(id + ".js", import.meta.url).href;
  try {
    const kopf = await fetch(url, { method: "HEAD" });
    if (!kopf.ok) return undefined;
  } catch (e) { protokoll("Fortschritt " + id + ": " + e); return undefined; }
  try {
    const modul = await import(url);
    const roh = await lade(id, {});
    const save = roh && Object.keys(roh).length === 0 ? null : roh;
    const r = await modul.fortschritt(save, p => fetch(p).then(x => x.json()));
    return Number.isFinite(r?.wert) ? Math.min(1, Math.max(0, r.wert)) : undefined;
  } catch (e) { protokoll("Fortschritt " + id + ": " + e); return undefined; }
}
