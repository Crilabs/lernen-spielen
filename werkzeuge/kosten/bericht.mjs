#!/usr/bin/env node
// npm run kosten: lesbarer Bericht (Deutsch) über Kosten je Spiel, Durchschnitt, Prognose für den Katalog.
import { existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { WURZEL, findeBuecher, findeSpielordner, katalogAnzahl, liesGeparkte, liesKosten, prognose, prognoseAnalog, prognoseBuecher, summen } from "./kosten.mjs";

const zahl = (n, d = 0) => n.toLocaleString("de-DE", { minimumFractionDigits: d, maximumFractionDigits: d });
const eur = (n) => `${zahl(n, 2)} €`;
const mio = (n) => `${zahl(n / 1e6, 2)} Mio`;
const unsicherer = (p) => (p?.unsicher ? " (unsicher)" : "");

/** Baut den Berichtstext. */
export function formatiere({ spiele, katalog, preise, analog, themenGesamt, buecher = [], buecherGeplant = 0, bibliothek = [] }) {
  const z = [];
  const p = prognose(spiele, katalog, preise);
  z.push("Kosten je Spiel", "================", "");
  if (!spiele.length) z.push("Noch kein Spiel mit kosten.json.");
  for (const x of p.je) {
    const s = x.s;
    z.push(
      `${x.name}${x.geparkt ? "  [geparkt]" : ""}: ${eur(s.eur)}`,
      `    Claude  ${zahl(s.claude.tokens)} Token (ein ${zahl(s.claude.eingabe)} / aus ${zahl(s.claude.ausgabe)}` +
        (s.claude.cache_lesen || s.claude.cache_schreiben ? ` / Cache lesen ${zahl(s.claude.cache_lesen)} / Cache schreiben ${zahl(s.claude.cache_schreiben)}` : "") +
        `)  ${eur(s.claude.eur)}`,
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
    z.push("Durchschnitt und Prognose: noch kein Spiel nach dem neuen Spielbau (docs/spielbau.md).");
  } else {
    const d = p.durchschnitt;
    z.push(
      `Durchschnitt je Spiel, nur neuer Spielbau (${p.basisSpiele} ${p.basisSpiele === 1 ? "Spiel" : "Spiele"}; alte Phasen zählen nur bei „ausgegeben“)`,
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
  z.push("", "Bücher (Bibliothek)");
  const b = prognoseBuecher(buecher, buecherGeplant, preise);
  for (const x of b.je) z.push(`  ${x.name}: ${eur(x.s.eur)}  (Claude ${eur(x.s.claude.eur)}, Bilder ${zahl(x.s.bilder.anzahl)} Stück ${eur(x.s.bilder.eur)})`);
  const raum = summen(bibliothek, preise);
  z.push(`  Raumbilder der Bibliothek: ${eur(raum.eur)} (${zahl(raum.bilder.anzahl)} Bilder)`);
  z.push(`  bisher ${eur(b.ausgegeben + raum.eur)} · fertige Bücher ${b.fertig} · geplant gesamt ${buecherGeplant}`);
  if (b.durchschnitt !== null) z.push(`  je Buch ${eur(b.durchschnitt)}; noch offen ${b.offen} Bücher: ${eur(b.rest ?? 0)}`);
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
  // Geparkte Spiele: ihr Spielordner liegt nur im Branch, die Kosten stehen auf main unter werkzeuge/kosten/geparkt/.
  const imOrdner = new Set(spiele.map((sp) => sp.name.split("/")[1]));
  spiele.push(...liesGeparkte().filter((g) => !imOrdner.has(g.name.split("/")[1])));
  const analogOrdner = join(WURZEL, "spiele", "mit-echten-dingen");
  const themenGesamt = JSON.parse(readFileSync(join(WURZEL, "spiele/lernplan.json"), "utf8")).themen.length;
  const bib = JSON.parse(readFileSync(join(WURZEL, "spiele/bibliothek.json"), "utf8"));
  const buecherGeplant = bib.raeume.flatMap((r) => r.regale.flatMap((g) => g.buecher)).length;
  console.log(formatiere({
    spiele, katalog, preise, analog: liesKosten(analogOrdner), themenGesamt,
    buecher: findeBuecher(), buecherGeplant, bibliothek: liesKosten(join(WURZEL, "spiele", "bibliothek")),
  }));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
