// Proben abschließen (docs/spielbau.md, „Erst Probe, dann fertig“): Christian oder Noelia hat das Spiel gespielt.
// Nimmt "probe": true aus spiele/spiele.json (wie werkzeuge/spielbau/freigeben.mjs) und committet nur diese Datei auf
// main. Fremde Änderungen an spiele.json werden nie mitgenommen: dann wird abgelehnt.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { FAECHER, katalogEintrag, ordnername } from "../spielbau/bauheft.mjs";
import { setzeProbe } from "../spielbau/freigeben.mjs";

/** Fehler, den die Seite als „geht gerade nicht“ zeigt (409), im Gegensatz zu einer falschen Id (400). */
export class ProbeZustand extends Error {}

/**
 * @param {string} wurzel  Repo mit main
 * @param {string} id      Katalog-Id, z. B. „M08“
 * @param {{ umgebung?: Record<string, string> }} [o]
 * @returns {{ id: string, commit: string }}
 */
export function schliesseProbeAb(wurzel, id, { umgebung = {} } = {}) {
  const git = (...a) => execFileSync("git", a, { cwd: wurzel, encoding: "utf8", env: { ...process.env, ...umgebung } }).trim();
  const e = katalogEintrag(id, wurzel);
  if (!e) throw new Error(`Katalog-Id ${id} nicht gefunden`);
  const ordner = ordnername(id, e.name);
  const datei = `${FAECHER[id[0]]}/${ordner}/index.html`;
  const spiel = (JSON.parse(readFileSync(join(wurzel, "spiele/spiele.json"), "utf8")).spiele ?? []).find((s) => s.datei === datei);
  if (!spiel) throw new Error(`${id} steht nicht in spiele/spiele.json`);
  if (!spiel.probe) throw new ProbeZustand(`${id} ist keine Probe (mehr)`);
  if (git("rev-parse", "--abbrev-ref", "HEAD") !== "main") throw new ProbeZustand("Das Repo steht nicht auf main – bitte erst zurück auf main");
  if (git("status", "--porcelain", "--", "spiele/spiele.json"))
    throw new ProbeZustand("spiele/spiele.json hat ungespeicherte Änderungen (andere Sitzung?) – bitte später noch einmal");
  setzeProbe(wurzel, id, false);
  git("commit", "-q", "-m", `chore(${ordner}): Probe beendet, gilt als fertig\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, "--", "spiele/spiele.json");
  return { id, commit: git("rev-parse", "--short=7", "HEAD") };
}
