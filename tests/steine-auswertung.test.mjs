// Prüft die Auswertung von einhorn-steine.html (Block zwischen ==AUSWERTUNG-START== und ==AUSWERTUNG-ENDE==).
// Aufruf: npm test
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const html = readFileSync(fileURLToPath(new URL("../spiele/einhorn-steine.html", import.meta.url)), "utf8");
const block = html.split("// ==AUSWERTUNG-START==")[1].split("// ==AUSWERTUNG-ENDE==")[0].replace(/^[^\n]*\n/, "");
const { auswerten, teilungPasst } = new Function(block + "; return AUSWERTUNG;")();

// erwartet: "ok" | "unbewertet" | { kleb: ["di|kaze"...], bruch: ["po|ni"...] }  (Stücke so, wie das Kind sie getippt hat)
const faelle = [
  ["Das Pony frisst Gras.", "das poni friest graas", "ok"],
  ["Die Katze schläft.", "di kaze schleft", "ok"],
  ["Die Katze schläft.", "dikaze schleft", { kleb: ["di|kaze"] }],
  ["Der Hund bellt im Garten.", "der hunt belt imgahrten", { kleb: ["im|gahrten"] }],
  ["Das Pony frisst Gras.", "das po ni frist gras", { bruch: ["po|ni"] }],
  ["Ich esse einen Apfel.", "ich esse einenapfl", { kleb: ["einen|apfl"] }],
  // weitere
  ["Das Pony frisst Gras.", "Das Pony frist Gras", "ok"],
  ["Das Pony frisst Gras.", "DasPony frist Gras", { kleb: ["Das|Pony"] }],
  ["Das Pony frisst Gras.", "daspony frisstgras", { kleb: ["das|pony", "frisst|gras"] }],
  ["Das Pony frisst Gras.", "daspponyfrisstgras.", { kleb: ["das|ppony", "ppony|frisst", "frisst|gras"] }],
  ["Die Ente ist im Teich.", "di ente istim teich", { kleb: ["ist|im"] }],       // kurze Wörter: Zuordnung darf nicht verrutschen
  ["Die Ente ist im Teich.", "di ente ist imteich", { kleb: ["im|teich"] }],
  ["Wir spielen heute im Garten.", "wir schpiln heute im gatn", "ok"],
  ["Der Vogel singt.", "der fogl singt", "ok"],
  ["Das Pony frisst Gras.", "Das Pony Gras", "ok"],                              // Wort vergessen ≠ Leerzeichenfehler
  ["Das Pony frisst Gras.", "das.  pony   frisst gras", "ok"],                    // „. “ nach Doppel-Leertaste, mehrere Leerzeichen
  ["Das Pony frisst Gras.", "xyz", "unbewertet"],
  ["Das Pony frisst Gras.", "", "unbewertet"],
  ["Der Hund bellt.", "der hunt beld", "ok"],
  ["Mama lacht laut.", "mamalacht laut", { kleb: ["mama|lacht"] }],
  ["Ich habe Durst.", "ich habe dorst", "ok"],
  ["Die Kuh steht im Stall.", "di ku schtet im schtal", "ok"],
  ["Die Kuh steht im Stall.", "di ku schtet imschtal", { kleb: ["im|schtal"] }],
  ["Am Abend lese ich.", "amabent lese ich", { kleb: ["am|abent"] }],
  ["Er hat ein Bild gemalt.", "erhat einbilt gemalt", { kleb: ["er|hat", "ein|bilt"] }],
  ["Der Hund bellt im Garten.", "der hunt belt imgatn", { kleb: ["im|gatn"] }],
];

const teil = (text, o) => text.slice(0, o) + "|" + text.slice(o);
let fehler = 0;
for (const [ziel, ein, erw] of faelle) {
  const r = auswerten(ziel, ein);
  let ist;
  if (r.status !== "fehler") ist = r.status;
  else {
    ist = {};
    const kleb = r.stuecke.flatMap(st => st.kleb.map(k => teil(st.text, k.o).replace(/[^\p{L}|]/gu, "").split("|")).map(([a, b]) => a.slice(-12) + "|" + b));
    // nur die direkt angrenzenden Wörter zeigen
    const klebKurz = r.stuecke.flatMap(st => {
      const cuts = st.kleb.map(k => k.o);
      const teile = []; let last = 0; for (const c of cuts) { teile.push(st.text.slice(last, c)); last = c; } teile.push(st.text.slice(last));
      const clean = teile.map(t => t.replace(/[^\p{L}]/gu, ""));
      return cuts.map((_, i) => clean[i] + "|" + clean[i + 1]);
    });
    if (klebKurz.length) ist.kleb = klebKurz;
    if (r.brueche.length) ist.bruch = r.brueche.map(k => r.stuecke[k - 1].text.replace(/[^\p{L}]/gu, "") + "|" + r.stuecke[k].text.replace(/[^\p{L}]/gu, ""));
    void kleb;
  }
  const ok = JSON.stringify(ist) === JSON.stringify(erw);
  if (!ok) fehler++;
  console.log(`${ok ? "✓" : "✗"} „${ziel}“ ← „${ein}“  →  ${JSON.stringify(ist)}${ok ? "" : "   erwartet " + JSON.stringify(erw)}  (Abstand ${r.abstand.toFixed(2)}${r.unsicher ? ", unsicher" : ""})`);
}

// Antippen beim Korrigieren: ±1 Buchstabe gilt als richtig
{
  const r = auswerten("Ich esse einen Apfel.", "ich esse einenapfl");
  const st = r.stuecke[2];
  const checks = [[5, true], [4, true], [6, true], [2, false], [8, false]];
  for (const [g, erw] of checks) {
    const ok = !!teilungPasst(st, g) === erw;
    if (!ok) fehler++;
    console.log(`${ok ? "✓" : "✗"} Teilung „${teil(st.text, g)}“ → ${!!teilungPasst(st, g)}`);
  }
}

console.log(fehler ? `\n${fehler} Fehler` : "\nAlle Prüfungen bestanden.");
process.exit(fehler ? 1 : 0);
