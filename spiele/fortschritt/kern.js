// Fortschritts-Rechnung: reines ES-Modul, ohne DOM und ohne fetch.
// Läuft im Browser (spiele/index.html) und in Node-Tests.

// Mittelwert über Spiele mit Fortschritts-Modul. Wer ein Modul hat, aber
// noch keinen Lernstand, steht mit 0 in `werte`; Spiele ohne Modul haben
// keinen Eintrag (undefined) und zählen nicht mit.
export function kategorieWert(spieleDerKategorie, werte) {
  const zahlen = spieleDerKategorie
    .map((s) => werte[s.id])
    .filter((w) => typeof w === "number");
  if (zahlen.length === 0) return undefined;
  return zahlen.reduce((a, b) => a + b, 0) / zahlen.length;
}

// Nur Kategorien mit mindestens einem Spiel, in der Reihenfolge von `kategorien`.
export function sichtbareKategorien(daten) {
  return daten.kategorien
    .map((kategorie) => ({
      kategorie,
      spiele: daten.spiele.filter((s) => s.kategorie === kategorie.id),
    }))
    .filter((e) => e.spiele.length > 0);
}
