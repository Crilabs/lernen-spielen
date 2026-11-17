// Startet den Versanddienst auf dem Server: Zugangsdaten aus /etc/lernen-spielen/graph.env, Zeitgeber jede Minute.
// Umgebung: PORT (Standard 3600), TAGESBRIEF_AUS=1 (Not-Aus), TAGESBRIEF_DATEI (Speicherdatei).
import { starteDienst } from "./server.js";
import { graphSenderAusDatei } from "./zugang.js";

const dienst = await starteDienst({
  port: Number(process.env.PORT ?? 3600),
  datei: process.env.TAGESBRIEF_DATEI ?? "/var/lib/lernen-spielen/tagesbrief.json",
  sende: graphSenderAusDatei(),
  aus: process.env.TAGESBRIEF_AUS === "1",
});

const zeitgeber = setInterval(() => {
  dienst.pruefeFaellige().catch((e) => console.log(`${new Date().toISOString()} Prüfung fehlgeschlagen: ${e?.name ?? "Fehler"} ${e?.code ?? ""}`.trim()));
}, 60_000);

for (const signal of ["SIGTERM", "SIGINT"]) process.on(signal, () => { clearInterval(zeitgeber); dienst.stop().then(() => process.exit(0)); });
