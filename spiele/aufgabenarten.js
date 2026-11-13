// Aufgabenarten des Lernplans – reine Logik ohne DOM (in Node testbar, siehe tests/aufgabenarten.test.mjs).
//
// Eine Aufgabe ist { key, art, daten }. Der Schlüssel bleibt stabil (Lernstand hängt daran):
//   zerlegung  "zerl:7:3+4"   daten { n, a, b }
//   rechnen    "plus:3+4" / "minus:7-4"   daten { op, a, b, c, raum }   (a + b = c)
//   menge      "menge:5"      daten { n }
//   zwillinge  "plus:6+6"     daten { op, a, b, c, raum: 20 }

export const ZIEL_MS = {
  zerlegung: 8000,
  rechnen: (raum) => ({ 10: 12000, 20: 16000, 30: 20000, 100: 30000 })[raum],
  menge: 4000,
};

const UEBERGANG_AB = 20; // darüber kein Übertrag der Einer (wie im Zahlenzauber)
const MAX = 100;

const raumVon = (c) => (c <= 10 ? 10 : c <= 20 ? 20 : c <= 30 ? 30 : 100);

// Pool wie plusPool()/minusPool() im Zahlenzauber bei max = 100
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

// Thema-ID für einen Zahlenzauber-Schlüssel
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
    default:
      return [];
  }
}

// größer = schwerer
export function schwierigkeit(aufgabe) {
  const d = aufgabe.daten;
  if (aufgabe.art === "zerlegung") return Math.min(d.a, d.b);
  if (aufgabe.art === "menge") return d.n;
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
  return true;
}
