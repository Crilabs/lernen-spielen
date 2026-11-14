#!/usr/bin/env node
// npm run kosten: lesbarer Bericht (Deutsch) über Kosten je Spiel, Durchschnitt, Prognose für den Katalog.
import { existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { WURZEL, findeSpielordner, katalogAnzahl, liesKosten, prognose, prognoseAnalog, summen } from "./kosten.mjs";

const zahl = (n, d = 0) => n.toLocaleString("de-DE", { minimumFractionDigits: d, maximumFractionDigits: d });
const eur = (n) => `${zahl(n, 2)} €`;
const mio = (n) => `${zahl(n / 1e6, 2)} Mio`;
const unsicherer = (p) => (p?.unsicher ? " (unsicher)" : "");

/** Baut den Berichtstext. */
export function formatiere({ spiele, katalog, preise, analog, themenGesamt }) {
  const z = [];
  const p = prognose(spiele, katalog, preise);
  z.push("Kosten je Spiel", "================", "");
  if (!spiele.length) z.push("Noch kein Spiel mit kosten.json.");
  for (const x of p.je) {
    const s = x.s;
    z.push(
      `${x.name}${x.geparkt ? "  [geparkt]" : ""}: ${eur(s.eur)}`,
      `    Claude  ${zahl(s.claude.tokens)} Token (ein ${zahl(s.claude.eingabe)} / aus ${zahl(s.claude.ausgabe)})  ${eur(s.claude.eur)}`,
      `    Bilder  ${zahl(s.bilder.anzahl)} Stück  ${eur(s.bilder.eur)}`,
      `    Stimme  ${zahl(s.stimme.zeichen)} Zeichen  ${eur(s.stimme.eur)}`,
    );
    if (s.claude.ohnePreis.length) z.push(`    ohne Preis in preise.json: ${s.claude.ohnePreis.join(", ")}`);
  }
  z.push("", `Fertige Spiele: ${p.fertig} · geparkt: ${p.geparkt.anzahl} · Katalog: ${p.katalog} · noch nicht begonnen: ${p.offen}`);
  z.push(`Bisher ausgegeben (alle Spiele): ${eur(p.ausgegeben)}`);
  if (p.geparkt.anzahl) z.push(`  davon geparkt (gesondert): ${eur(p.geparkt.eur)}, ${zahl(p.geparkt.tokens)} Token`);
  z.push("");
  if (!p.durchschnitt) {
    z.push("Durchschnitt und Prognose: noch kein fertiges Spiel.");
  } else {
    const d = p.durchschnitt;
    z.push(
      "Durchschnitt je fertigem Spiel",
      `  gesamt  ${eur(d.eur)}   (günstigstes ${eur(p.spanne.min)}, teuerstes ${eur(p.spanne.max)})`,
      `  Claude  ${eur(d.claude)}  (${zahl(d.tokens)} Token)`,
      `  Bilder  ${eur(d.bilder)}  (${zahl(d.bildAnzahl, 1)} Bilder)`,
      `  Stimme  ${eur(d.stimme)}  (${zahl(d.zeichen)} Zeichen)`,
      "",
      `Prognose für alle ${p.katalog} Spiele des Katalogs`,
      `  gesamt  ${eur(p.gesamt.mittel)}   Spannweite ${eur(p.gesamt.min)} bis ${eur(p.gesamt.max)}`,
      `  Claude  ${eur(p.gesamt.claude)}`,
      `  Bilder  ${eur(p.gesamt.bilder)}${unsicherer(preise.bilder)}`,
      `  Stimme  ${eur(p.gesamt.stimme)}`,
      `  davon noch offen (${p.offen} Spiele): ${eur(p.rest.mittel)}, Spannweite ${eur(p.rest.min)} bis ${eur(p.rest.max)}`,
    );
  }
  z.push("", "Mit echten Dingen (analoge Spiele)");
  const a = prognoseAnalog(analog, themenGesamt, preise);
  if (!analog.length) z.push("  noch keine Einträge in spiele/mit-echten-dingen/kosten.json");
  else {
    z.push(`  bisher ${eur(a.summe.eur)}, ${zahl(a.summe.claude.tokens)} Token, ${a.themen} Themen erfasst`);
    z.push(
      a.jeThema === null
        ? "  Prognose: nicht möglich, die Einträge nennen keine Themenzahl (Feld themen)"
        : `  je Thema ${eur(a.jeThema)}; Prognose für alle ${themenGesamt} Themen des Lernplans: ${eur(a.prognose)}`,
    );
  }
  const unsichere = [
    preise.usdInEur.unsicher && "Wechselkurs USD→EUR",
    preise.bilder.unsicher && `Bildpreis (${preise.bilder.modell})`,
    preise.stimme.unsicher && "Stimmenpreis",
  ].filter(Boolean);
  z.push("", `Preise: Stand ${preise.stand}, Datei werkzeuge/kosten/preise.json` + (unsichere.length ? ` · unsicher: ${unsichere.join(", ")}` : ""));
  return z.join("\n");
}

function main() {
  const preise = JSON.parse(readFileSync(join(WURZEL, "werkzeuge/kosten/preise.json"), "utf8"));
  const katalog = katalogAnzahl(readFileSync(join(WURZEL, "docs/spielkatalog.md"), "utf8"));
  const spiele = findeSpielordner()
    .filter((o) => existsSync(join(o, "kosten.json")))
    .map((o) => ({ name: `${basename(join(o, ".."))}/${basename(o)}`, eintraege: liesKosten(o) }));
  const analogOrdner = join(WURZEL, "spiele", "mit-echten-dingen");
  const themenGesamt = JSON.parse(readFileSync(join(WURZEL, "spiele/lernplan.json"), "utf8")).themen.length;
  console.log(formatiere({ spiele, katalog, preise, analog: liesKosten(analogOrdner), themenGesamt }));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
