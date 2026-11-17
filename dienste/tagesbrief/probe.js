// Probebrief ohne Geräteanmeldung: `node probe.js <adresse>` setzt den Beispiel-Topf der Spec
// (docs/superpowers/specs/2026-11-17-tagesbrief-beispiel.html) und sendet ihn über Graph an genau diese eine Adresse.
// Die Adresse kommt nur von der Befehlszeile; ohne sie oder mit mehr als einer sendet das Skript nichts.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { setzeBrief } from "../../spiele/tagesbrief/brief.js";
import { graphSenderAusDatei } from "./zugang.js";

const BASIS = "https://lernen-spielen.crilabs.de";
const FOTO = new URL("../../spiele/mit-echten-dingen/mathe/bilder/neunerreihe.brief.jpg", import.meta.url);

/** Prüft die Befehlszeile: genau eine Adresse mit @ und Punkt in der Domain, sonst null. @param {string[]} argumente */
export function probeAdresse(argumente) {
  if (argumente.length !== 1) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(argumente[0]) ? argumente[0] : null;
}

/** Topf des Referenzbeispiels: Mila, zwei gekonnt, ein dabei, ein gelesen, Neunerreihe mit beiden Formen. @param {string} foto base64 JPEG */
export function probeTopf(foto) {
  return {
    namen: ["Mila"],
    gekonnt: [
      { id: "achterreihe", name: "Achterreihe", fach: "mathe",
        zweck: "Ausrechnen, wie viele Beine mehrere Spinnen haben oder wie viele Stifte in mehreren Achterpackungen stecken." },
      { id: "zehner-einer-20", name: "Zehner und Einer bis 20", fach: "mathe",
        zweck: "Viele Stifte schneller zählen, indem man sie zu Zehnerbündeln zusammenlegt." },
    ],
    dabei: [{ id: "kernaufgaben", name: "Kernaufgaben: mal 1, 2, 5, 10", fach: "mathe" }],
    gelesen: [{ id: "wal", titel: "Mira, die Riesin im Meer", frage: "Womit atmet ein Wal?", antwort: "Mit einer Lunge, wie du." }],
    naechstes: {
      id: "neunerreihe", thema: "Neunerreihe", fach: "mathe", titel: "Neun ist eins weniger als zehn", passendZuGerade: false, foto,
      formen: [
        { situation: /** @type {const} */ ("unterwegs"), wort: "Unterwegs", name: "Eintritt für alle", verinnerlichen: "",
          braucht: "eine Preistafel an einer Kasse, etwa im Schwimmbad oder im Zoo.",
          schritte: [
            "Sucht einen Eintritt von 9 Euro. Ihr seid zum Beispiel 3.",
            "Rechnet erst die Kernaufgabe mit 10 Euro: „3 mal 10 ist gleich 30.“",
            "Jede Person kostet 1 Euro weniger. Nehmt 3 Euro weg: „30 minus 3 ist gleich 27. 3 mal 9 ist gleich 27.“",
            "Legt das Geld bereit. An der Kasse seht ihr den Betrag.",
          ],
          kern: "Neun ist eins weniger als zehn. Darum nehmt ihr für jede Person einen Euro weg, nicht einen für alle." },
        { situation: /** @type {const} */ ("bewegung"), wort: "In Bewegung", name: "Zehn vor, einen zurück", verinnerlichen: "",
          braucht: "einen Hof oder langen Flur, vier Socken.",
          schritte: [
            "Einer geht zehn kleine Schritte vor und zählt jeden. Dann einen zurück: „9.“ Dort liegt die erste Socke.",
            "Von der Socke aus zehn Schritte vor, bis 19, und einen zurück: „18.“ Dort liegt die zweite Socke.",
            "Noch einmal: bis 28, einen zurück: „27.“ Dort liegt die dritte Socke.",
            "Sagt, wie viele Neuner ihr gegangen seid: drei. Dann wechselt ihr.",
          ],
          kern: "Jeder Neuner ist ein Zehner und ein Schritt zurück: 9, 18, 27. 3 mal 9 ist gleich 30 minus 3." },
      ],
      weitere: ["Einmaleins gemischt", "Geteilt durch 2, 5, 10"],
    },
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const an = probeAdresse(process.argv.slice(2));
  if (!an) {
    console.error("Aufruf: node probe.js <adresse>");
    process.exit(2);
  }
  const foto = readFileSync(FOTO).toString("base64");
  const brief = setzeBrief(probeTopf(foto), { datum: new Date(), abmeldeLink: `${BASIS}/abmelden`, datenschutzLink: `${BASIS}/datenschutz` });
  if (!brief) throw new Error("Beispiel-Topf ergibt keinen Brief");
  await graphSenderAusDatei()({ an, ...brief, foto });
  console.log("Probebrief gesendet.");
}
