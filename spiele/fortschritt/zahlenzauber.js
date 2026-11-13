// Fortschritt Zahlenzauber: Anteil der Plus- und Minus-Aufgaben im Zahlenraum bis 20, die als gelernt gelten.
// Menge fest: Plus a+b mit a<b und a+b<=20 (90) und dazu je zwei Minus-Aufgaben (Summe-b, Summe-a; 180) = 270.
// Begründung: Die Menge wächst nicht mit der Stufe mit (sonst schrumpfte der Balken beim Aufstieg durch den
// größeren Nenner). Bis 20 ist der Kern der 2. Klasse; die Stufen 30/100 bringen nur Aufgaben außerhalb der Menge,
// die nicht zählen. Schlüssel wie im Spiel: "3+9", "12-3".
// Gelernt: einmal gelernt (g=1, bleibt bei Rückstufung) oder Fach >= GELERNT (alter Stand ohne g).
const GELERNT = 4;
const MAX = 20;

export const ALLE = (() => {
  const out = [];
  for (let a = 1; a < MAX; a++) for (let b = a + 1; a + b <= MAX; b++) out.push(`${a}+${b}`, `${a + b}-${b}`, `${a + b}-${a}`);
  return out;
})();

export async function fortschritt(save) {
  const f = save && typeof save === "object" && save.fakten && typeof save.fakten === "object" && !Array.isArray(save.fakten) ? save.fakten : {};
  const sicher = ALLE.filter(k => { const e = f[k]; return e && typeof e === "object" && (e.g === 1 || e.f >= GELERNT); }).length;
  return { wert: sicher / ALLE.length, text: `${sicher} von ${ALLE.length} Aufgaben bis 20 sicher` };
}
