// Fortschritt eines Spiels über sein Modul fortschritt/<id>.js laden.
// Nur Spiele mit "fortschritt": true in spiele.json haben ein Modul (Tauri liefert für
// fehlende Dateien index.html aus, eine Probe per Anfrage hilft deshalb nicht).
// Modul vorhanden: Zahl 0..1 (ohne Lernstand 0). Kein Modul oder Fehler: undefined.
import { lade, protokoll } from "../lernspiel.js";

export async function wertVon(spiel) {
  if (spiel?.fortschritt !== true) return undefined;
  const id = spiel.id;
  try {
    const modul = await import(new URL(id + ".js", import.meta.url).href);
    const roh = await lade(id, {});
    const save = roh && Object.keys(roh).length === 0 ? null : roh;
    const r = await modul.fortschritt(save, p => fetch(p).then(x => x.json()));
    return Number.isFinite(r?.wert) ? Math.min(1, Math.max(0, r.wert)) : undefined;
  } catch (e) { protokoll("Fortschritt " + id + ": " + e); return undefined; }
}
