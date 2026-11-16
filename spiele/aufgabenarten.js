// Aufgabenarten des Lernplans – reine Logik ohne DOM (in Node testbar, siehe tests/aufgabenarten.test.mjs).
//
// Eine Aufgabe ist { key, art, daten }. Der Schlüssel bleibt stabil (Lernstand hängt daran):
//   zerlegung  "zerl:7:3+4"   daten { n, a, b }
//   rechnen    "plus:3+4" / "minus:7-4"   daten { op, a, b, c, raum }   (a + b = c)
//   menge      "menge:5"      daten { n }
//   zwillinge  "plus:6+6"     daten { op, a, b, c, raum: 20 }
//   mal        "mal:6*7"      daten { a, b, c }   (a · b = c; a = Anzahl der Gruppen, b = Größe einer Gruppe)
//              Spezifikation { art: "mal", reihe: n } (die Reihe von n) oder { art: "mal", kern: true } (Kernaufgaben
//              mal 1, 2, 5, 10 der übrigen Reihen); `faktoren` bzw. `reihen` legen die Faktoren ausdrücklich fest.
//              Nichts darin gehört einem Spiel: Kette (M37), Punktefeld (M36) und Tüten (M35) lesen dieselben daten.

export const ZIEL_MS = {
  zerlegung: 8000,
  rechnen: (raum) => ({ 10: 12000, 20: 16000, 30: 20000, 100: 30000 })[raum],
  menge: 4000,
  mal: 8000, // Annahme (Entwurf M37): Abruf einer Einmaleinsaufgabe; darüber gilt sie als mühsam gelöst
};

// Einmaleins: die Kernaufgaben (mal 1, 2, 5, 10) und die Reihen, deren Aufgaben alle zur eigenen Reihe gehören.
export const KERN_FAKTOREN = [1, 2, 5, 10];
const KERN_REIHEN = [2, 5, 10];
const UEBRIGE_REIHEN = [3, 4, 6, 7, 8, 9];
const ALLE_FAKTOREN = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/** Faktoren a einer Reihe n: Kernreihen alle, sonst ohne die Kernaufgaben (die hat das Thema Kernaufgaben). */
export const faktorenDerReihe = (n) => (KERN_REIHEN.includes(n) ? ALLE_FAKTOREN : ALLE_FAKTOREN.filter((a) => !KERN_FAKTOREN.includes(a)));

const malAufgabe = (a, b) => ({ key: `mal:${a}*${b}`, art: "mal", daten: { a, b, c: a * b } });

/** "mal:6*7" → { a: 6, b: 7, c: 42 }, sonst null. */
export function malAus(key) {
  const m = /^mal:(\d+)\*(\d+)$/.exec(String(key ?? ""));
  return m ? { a: Number(m[1]), b: Number(m[2]), c: Number(m[1]) * Number(m[2]) } : null;
}

const UEBERGANG_AB = 20; // darüber kein Übertrag der Einer
const MAX = 100;

const raumVon = (c) => (c <= 10 ? 10 : c <= 20 ? 20 : c <= 30 ? 30 : 100);

// Alle Plus- und Minusaufgaben bis 100 (für die Prüfung, dass jede Aufgabe ein Thema hat)
export function poolRechnen() {
  const plus = [];
  for (let a = 1; a < MAX; a++) {
    for (let b = a + 1; a + b <= MAX; b++) {
      if (a + b > UEBERGANG_AB && (a % 10) + (b % 10) >= 10) continue;
      plus.push([a, b]);
    }
  }
  return [
    ...plus.map(([a, b]) => `plus:${a}+${b}`),
    ...plus.flatMap(([a, b]) => [`minus:${a + b}-${b}`, `minus:${a + b}-${a}`]),
  ];
}

// Schlüssel -> { op, a, b, c }; bei Minus ist c die Ausgangszahl, c - b = a
function zerlegeKey(key) {
  const [op, rest] = key.split(":");
  if (op === "plus") {
    const [a, b] = rest.split("+").map(Number);
    return { op, a, b, c: a + b };
  }
  const [c, b] = rest.split("-").map(Number);
  return { op, a: c - b, b, c };
}

const rechenAufgabe = (key) => {
  const t = zerlegeKey(key);
  return { key, art: "rechnen", daten: { ...t, raum: raumVon(t.c) } };
};

// Thema-ID für einen Rechen-Schlüssel (plus:/minus:)
export function klasseRechnen(key) {
  const { op, a, b, c } = zerlegeKey(key);
  const plus = op === "plus";
  if (c <= 10) return `rechnen-${c}`;
  if (c > 20) return c <= 30 ? `${op}-bis-30` : `${op}-bis-100`;
  if (plus) {
    if (a === 10 || b === 10) return "zehn-plus";
    if (a <= 9 && b <= 9) return `ueber-10-mit-${Math.max(a, b) <= 7 ? 7 : Math.max(a, b)}`;
    return c === 20 ? "plus-zur-20" : "plus-ohne-20";
  }
  if (b === 10 || c - b === 10) return "minus-zehner";
  if (c === 20) return "minus-von-20";
  if (c % 10 >= b % 10) return "minus-ohne-20";
  return b <= 5 ? "minus-ueber-10-bis-5" : "minus-ueber-10-ab-6";
}

// aufgabenSpec = Feld `aufgaben` eines Themas
export function aufgabenVon(spec) {
  if (!spec) return []; // geplantes Thema ohne Aufgaben
  switch (spec.art) {
    case "zerlegung": {
      const n = spec.zahl;
      return Array.from({ length: n - 1 }, (_, i) => ({
        key: `zerl:${n}:${i + 1}+${n - i - 1}`, art: "zerlegung", daten: { n, a: i + 1, b: n - i - 1 },
      }));
    }
    case "rechnen":
      return poolRechnen().filter((k) => klasseRechnen(k) === spec.thema).map(rechenAufgabe);
    case "menge":
      return Array.from({ length: spec.bis }, (_, i) => ({ key: `menge:${i + 1}`, art: "menge", daten: { n: i + 1 } }));
    case "zwillinge":
      return [6, 7, 8, 9].map((a) => ({
        key: `plus:${a}+${a}`, art: "zwillinge", daten: { op: "plus", a, b: a, c: 2 * a, raum: 20 },
      }));
    case "mal": {
      if (spec.kern) {
        const faktoren = spec.faktoren ?? KERN_FAKTOREN;
        return (spec.reihen ?? UEBRIGE_REIHEN).flatMap((b) => faktoren.map((a) => malAufgabe(a, b)));
      }
      const n = spec.reihe;
      if (!Number.isInteger(n) || n < 1) return [];
      return (spec.faktoren ?? faktorenDerReihe(n)).map((a) => malAufgabe(a, n));
    }
    default:
      return [];
  }
}

// größer = schwerer
export function schwierigkeit(aufgabe) {
  const d = aufgabe.daten;
  if (aufgabe.art === "zerlegung") return Math.min(d.a, d.b);
  if (aufgabe.art === "menge") return d.n;
  // mal: Kernaufgabe 0, eine Gruppe neben einer Kernaufgabe (3, 4, 6, 9) 1, zwei Gruppen daneben (7, 8) 2
  if (aufgabe.art === "mal") return KERN_FAKTOREN.includes(d.a) ? 0 : [7, 8].includes(d.a) ? 2 : 1;
  if (d.op === "plus") return Math.min(d.a, d.b) + ((d.a % 10) + (d.b % 10) >= 10 ? 5 : 0);
  return (d.b % 10) + (d.c % 10 < d.b % 10 ? 5 : 0);
}

// Kann das Spiel (artSpec aus spiele.json "arten") diese Aufgabe darstellen?
export function darstellbar(aufgabe, artSpec) {
  const zwilling = aufgabe.art === "zwillinge" && artSpec.art === "rechnen" && artSpec.gleiche === true;
  if (aufgabe.art !== artSpec.art && !zwilling) return false;
  const d = aufgabe.daten;
  if (artSpec.zahlen && !(d.n >= artSpec.zahlen[0] && d.n <= artSpec.zahlen[1])) return false;
  if (artSpec.max !== undefined && d.raum > artSpec.max) return false;
  if (artSpec.reihen && !(d.b >= artSpec.reihen[0] && d.b <= artSpec.reihen[1])) return false;
  // zehner: nur Aufgaben mit einem ganzen Zehner (10 + x, c − 10, c − x mit c − x = 10); Stellentafel (M08)
  if (artSpec.zehner === true && !(d.op === "plus" ? d.a === 10 || d.b === 10 : d.b === 10 || d.a === 10)) return false;
  return true;
}
