// Perlenbrücke – reine Spiellogik ohne DOM (in Node testbar, siehe tests/perlen-logik.test.mjs).
// Spec: docs/superpowers/specs/2026-11-13-perlenbruecke-neu-design.md, Lernplan: docs/superpowers/specs/2026-11-13-lernplan-design.md
//
// Eine Brücke für die Zahl n wird aus zwei Stäbchen gebaut: a von der linken Spalte, b von der rechten.
// Geordnete Paare: 2+5 und 5+2 sind verschiedene Aufgaben (Schlüssel der Lernsteuerung "zerl:7:2+5").
// Was dran ist, entscheidet die Lernsteuerung (runde/naechste); hier bleibt nur Spieleigenes:
// welche Stäbchen in den Spalten liegen und wie oft ein Paar schon gebaut wurde (Abnutzung).
//
// Spieleigener Stand (Schlüssel "perlenbruecke"): { version: 3, reise, c: { [key]: anzahl } }

export const K = {
  ABNUTZUNG: 0.25,               // so viel weniger Chance je Bau mehr als das seltenste Paar der Zahl
  MIN_CHANCE: 0.15,              // Restchance eines oft gebauten Paares
  MAX_PAARE: 3,                  // höchstens so viele gültige Paare je Brücke
  MAX_PAARE_KLEIN: 2,            // … bei n <= 4 (Ratechance klein halten)
  SPALTE_MAX: 5,                 // Stäbchen je Spalte höchstens
  RUNDE: 20,                     // Brücken je Runde höchstens (ca. 3-5 Minuten)
};

export const paareVon = (n) =>
  Array.from({ length: n - 1 }, (_, i) => ({ n, a: i + 1, b: n - i - 1, key: `${n}:${i + 1}+${n - i - 1}` }));

// "zerl:7:2+5" -> { n: 7, a: 2, b: 5 } (sonst null)
export function zerlegung(key) {
  const m = /^zerl:(\d+):(\d+)\+(\d+)$/.exec(typeof key === "string" ? key : "");
  return m ? { n: +m[1], a: +m[2], b: +m[3] } : null;
}

export const neuerStand = () => ({ version: 3, reise: 0, c: {} });

const anzahl = (x) => (Number.isFinite(x) && x >= 0 ? Math.trunc(x) : null);
const istObjekt = (x) => !!x && typeof x === "object" && !Array.isArray(x);

// v2 (Fächer, Freischalten) → v3: nur die Bauzahl c je Paar und die Reise bleiben.
// Die Fächer hat die Lernsteuerung beim ersten Start übernommen (migriereSpiele).
export function migriere(roh) {
  const s = neuerStand();
  if (!istObjekt(roh)) return s;
  if (anzahl(roh.reise) !== null) s.reise = anzahl(roh.reise);
  if (roh.version === 2 && istObjekt(roh.paare)) {
    for (const [k, e] of Object.entries(roh.paare)) {
      const c = istObjekt(e) ? anzahl(e.c) : null;
      if (/^\d+:\d+\+\d+$/.test(k) && c) s.c["zerl:" + k] = c;
    }
  } else if (roh.version === 3 && istObjekt(roh.c)) {
    for (const [k, x] of Object.entries(roh.c)) if (zerlegung(k) && anzahl(x) !== null) s.c[k] = anzahl(x);
  }
  return s;
}

// Eine gebaute Brücke zählen (nur Spieleigenes; den Lernstand meldet das Spiel an die Lernsteuerung).
export function verbucheBau(eigen, key) {
  eigen.c[key] = (eigen.c[key] || 0) + 1;
  eigen.reise++;
  return eigen;
}

function mische(liste, rnd) {
  const l = [...liste];
  for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; }
  return l;
}

// Angebot für eine Brücke: zielKey ist immer baubar, auchKeys (gleiche Zahl) nach Abnutzung.
export function angebotAus(n, zielKey, auchKeys = [], eigen = neuerStand(), rnd = Math.random) {
  const c = (key) => eigen?.c?.[key] || 0;
  const cmin = Math.min(...paareVon(n).map(p => c("zerl:" + p.key)));
  const ziel = zerlegung(zielKey);
  const auch = [...new Set(auchKeys)].filter(k => k !== zielKey && zerlegung(k)?.n === n);
  let rest = auch.filter(k => rnd() < Math.max(K.MIN_CHANCE, 1 - K.ABNUTZUNG * (c(k) - cmin)));
  // Zu viele: zuerst die meistgebauten streichen (bei Gleichstand zufällig)
  rest = mische(rest, rnd).sort((x, y) => c(x) - c(y)).slice(0, (n <= 4 ? K.MAX_PAARE_KLEIN : K.MAX_PAARE) - 1);
  const S = [ziel, ...rest.map(zerlegung)];
  return { paare: [zielKey, ...rest], ...spalten(n, S, rnd) };
}

// Stäbchen der Spalten: die Paare aus S plus kurze Ablenker, von denen keiner mit der Gegenseite n ergibt.
function spalten(n, S, rnd) {
  const fuerL = S.map(p => p.a), fuerR = S.map(p => p.b);
  const min = 3;                                        // immer mindestens drei Stäbchen je Spalte
  const darf = (d, hier, dort) => !hier.has(d) && !dort.has(n - d);
  let links, rechts;
  // Kurze Ablenker verteilen; blockiert eine Spalte die andere (zu wenig Stäbchen), neu würfeln
  for (let versuch = 0; versuch < 20; versuch++) {
    links = new Set(fuerL); rechts = new Set(fuerR);
    const ziel = () => Math.min(K.SPALTE_MAX, 3 + Math.floor(rnd() * 3));
    const zielL = ziel(), zielR = ziel();
    for (const d of mische(Array.from({ length: n - 1 }, (_, i) => i + 1), rnd)) {
      const reihenfolge = links.size <= rechts.size ? [[links, rechts, zielL], [rechts, links, zielR]] : [[rechts, links, zielR], [links, rechts, zielL]];
      for (const [hier, dort, z] of reihenfolge) if (hier.size < z && darf(d, hier, dort)) { hier.add(d); break; }
    }
    if (links.size >= min && rechts.size >= min) break;
  }
  // Notlösung: Spalte zu kurz -> unnötige Ablenker der anderen Spalte (nicht aus den Paaren) entfernen und stattdessen auffüllen
  for (const [hier, dort, fest] of [[links, rechts, fuerR], [rechts, links, fuerL]])
    for (const d of mische(Array.from({ length: n - 1 }, (_, i) => i + 1), rnd))
      if (hier.size < min && !hier.has(d) && (!dort.has(n - d) || (!fest.includes(n - d) && dort.size > min))) { dort.delete(n - d); hier.add(d); }
  // Reicht der Vorrat nicht (kleine Zahlen): mit zu langen Stäbchen auffüllen, bei n <= 4 bis zu zwei je Spalte
  for (const sp of [links, rechts]) {
    const pool = mische(Array.from({ length: Math.min(9, n + 4) - n + 1 }, (_, i) => n + i), rnd).filter(x => !sp.has(x));
    const erlaubt = n <= 4 ? 2 : 1;
    while (sp.size < min && pool.length && [...sp].filter(x => x >= n).length < erlaubt) sp.add(pool.pop());
  }
  const sortiert = s => [...s].sort((x, y) => x - y);
  return { links: sortiert(links), rechts: sortiert(rechts) };
}

