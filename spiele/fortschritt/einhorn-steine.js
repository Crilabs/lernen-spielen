// Fortschritt Einhorn-Steine: Anteil der Sätze, die als gelernt gelten.
// Gesamtmenge = alle Sätze in saetze/saetze.json (Stufe 1-3, doppelte und leere zählen nicht):
// das Spiel mischt über alle Stufen, die Menge ist also fest und für das Kind erreichbar.
// Einträge: save.saetze[Satztext] = {f: Fach 0..3, g}. Fach 3 = Abstand 7 Tage = sitzt.
// Gelernt: einmal gelernt (g=1, bleibt bei Rückstufung) oder Fach >= 3 (alte Stände ohne g).
const GELERNT = 3;

export async function fortschritt(save, holeJson) {
  let liste = [];
  try { liste = (await holeJson("saetze/saetze.json"))?.saetze; } catch (e) { liste = []; }
  if (!Array.isArray(liste)) liste = [];
  const texte = new Set();
  for (const s of liste) {
    if (s && typeof s.text === "string" && s.text.trim()) texte.add(s.text.trim());
  }
  const saetze = save?.saetze && typeof save.saetze === "object" && !Array.isArray(save.saetze) ? save.saetze : {};
  let sicher = 0;
  for (const t of texte) {
    const e = saetze[t];
    if (e && typeof e === "object" && (e.g === 1 || e.f >= GELERNT)) sicher++;
  }
  const gesamt = texte.size;
  return {
    wert: gesamt ? sicher / gesamt : 0,
    text: `${sicher} von ${gesamt} ${gesamt === 1 ? "Satz" : "Sätzen"} sicher`,
  };
}
