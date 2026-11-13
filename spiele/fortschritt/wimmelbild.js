// Fortschritt Wimmelbild: Anteil der Nomen aller Bilder, die als gelernt gelten.
// Schlüssel wie im Spiel: "der Hund". Gelernt: einmal gelernt (g=1, bleibt bei
// Rückstufung) oder Fach >= 4 (alte Stände ohne g). Nicht-Nomen ("~rennt") zählen nicht.
const GELERNT = 4;

export async function fortschritt(save, holeJson) {
  let namen = [];
  try { namen = await holeJson("bilder/index.json"); } catch (e) { namen = []; }
  if (!Array.isArray(namen)) namen = [];
  const schluessel = new Set();
  await Promise.all(namen.map(async (n) => {
    try {
      const b = await holeJson("bilder/" + n + ".json");
      for (const d of b?.dinge || []) schluessel.add(d.artikel + " " + d.wort);
    } catch (e) { /* Bild fehlt: zählt nicht mit */ }
  }));
  const woerter = save?.woerter && !Array.isArray(save.woerter) ? save.woerter : {};
  let sicher = 0;
  for (const s of schluessel) {
    const e = woerter[s];
    if (e && (e.g === 1 || e.f >= GELERNT)) sicher++;
  }
  const gesamt = schluessel.size;
  return {
    wert: gesamt ? sicher / gesamt : 0,
    text: `${sicher} von ${gesamt} ${gesamt === 1 ? "Ding" : "Dingen"} sicher`,
  };
}
