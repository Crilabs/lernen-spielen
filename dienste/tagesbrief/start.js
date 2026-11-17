// Startet den Versanddienst auf dem Server: Zugangsdaten aus /etc/lernen-spielen/graph.env, Zeitgeber jede Minute.
// Umgebung: PORT (Standard 3600), TAGESBRIEF_AUS=1 (Not-Aus), TAGESBRIEF_DATEI (Speicherdatei).
import { starteDienst } from "./server.js";
import { graphSenderAusDatei } from "./zugang.js";
import { fahreHerunter } from "./herunterfahren.js";

const dienst = await starteDienst({
  port: Number(process.env.PORT ?? 3600),
  datei: process.env.TAGESBRIEF_DATEI ?? "/var/lib/lernen-spielen/tagesbrief.json",
  sende: graphSenderAusDatei(),
  aus: process.env.TAGESBRIEF_AUS === "1",
});

/** @type {Promise<unknown> | null} Die gerade laufende Prüfung, damit das Herunterfahren sie abwartet. */
let laufend = null;
const zeitgeber = setInterval(() => {
  const lauf = dienst.pruefeFaellige()
    .catch((e) => console.log(`${new Date().toISOString()} Prüfung fehlgeschlagen: ${e?.name ?? "Fehler"} ${e?.code ?? ""}`.trim()))
    .finally(() => { if (laufend === lauf) laufend = null; });
  laufend = lauf;
}, 60_000);

for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => {
    fahreHerunter({ stoppeZeitgeber: () => clearInterval(zeitgeber), laufend: () => laufend, stop: () => dienst.stop() })
      .finally(() => process.exit(0));
  });
}
