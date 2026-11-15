// Kosten eines Spielbaus in Euro (werkzeuge/kosten/kosten.mjs, Preise aus preise.json). `ab` lässt die Einträge weg,
// die vor dem Lauf schon in kosten.json standen (Neubau eines vorhandenen Spiels).
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { WURZEL, summen } from "../kosten/kosten.mjs";

/** @param {string} datei kosten.json @param {number} [ab] Index des ersten Eintrags dieses Laufs */
export function summiere(datei, ab = 0) {
  const liste = existsSync(datei) ? JSON.parse(readFileSync(datei, "utf8")).slice(ab) : [];
  const preise = JSON.parse(readFileSync(join(WURZEL, "werkzeuge/kosten/preise.json"), "utf8"));
  const s = summen(liste, preise);
  const jePhase = {};
  for (const e of liste.filter((x) => x.posten === "claude")) {
    const t = summen([e], preise).claude.eur;
    jePhase[e.phase] = Math.round(((jePhase[e.phase] ?? 0) + t) * 100) / 100;
  }
  return { eur: Math.round(s.eur * 100) / 100, claudeEur: Math.round(s.claude.eur * 100) / 100, tokens: s.claude.tokens, stimmeEur: Math.round(s.stimme.eur * 100) / 100, jePhase };
}
