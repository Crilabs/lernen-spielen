#!/usr/bin/env node
// Probe → fertig (docs/spielbau.md, Ablauf „Erst Probe, dann fertig“): Christian oder Noelia hat das Spiel zwei Minuten
// gespielt. Nimmt "probe": true aus dem Eintrag in spiele/spiele.json; committen tut, wer es aufruft.
//
//   node werkzeuge/spielbau/freigeben.mjs <Katalog-Id>      (im Ordner, dessen spiele.json gemeint ist, meist main)
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { katalogEintrag, ordnername, FAECHER } from "./bauheft.mjs";

/** Setzt oder entfernt die Probe-Markierung eines Spiels; gibt den Eintrag zurück. */
export function setzeProbe(wurzel, id, probe) {
  const e = katalogEintrag(id, wurzel);
  if (!e) throw new Error(`Katalog-Id ${id} nicht gefunden`);
  const datei = `${FAECHER[id[0]]}/${ordnername(id, e.name)}/index.html`;
  const pfad = join(wurzel, "spiele/spiele.json");
  const roh = readFileSync(pfad, "utf8");
  const liste = JSON.parse(roh).spiele ?? [];
  const spiel = liste.find((s) => s.datei === datei);
  if (!spiel) throw new Error(`kein Eintrag mit datei ${datei} in spiele/spiele.json`);
  // Die Datei ist von Hand formatiert (ein Spiel über wenige Zeilen): nur am Eintrag selbst ändern, nicht neu schreiben.
  const anfang = roh.indexOf(`{ "id": "${spiel.id}"`);
  if (anfang < 0) throw new Error(`Eintrag ${spiel.id} nicht in der erwarteten Form ({ "id": … })`);
  const kopf = `{ "id": "${spiel.id}", "probe": true`;
  let neu = roh;
  if (probe && !spiel.probe) neu = roh.slice(0, anfang) + kopf + roh.slice(anfang + `{ "id": "${spiel.id}"`.length);
  if (!probe && spiel.probe) neu = roh.replace(kopf, `{ "id": "${spiel.id}"`);
  if (!probe && neu === roh && spiel.probe) throw new Error(`"probe": true bei ${spiel.id} nicht direkt hinter der Id – bitte von Hand entfernen`);
  JSON.parse(neu);
  writeFileSync(pfad, neu);
  return spiel;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const id = process.argv[2]?.toUpperCase();
  if (!id) { console.error("Aufruf: node werkzeuge/spielbau/freigeben.mjs <Katalog-Id>"); process.exit(1); }
  const s = setzeProbe(process.cwd(), id, false);
  console.log(`${s.id}: Probe beendet, gilt als fertig. Jetzt spiele/spiele.json committen.`);
}
