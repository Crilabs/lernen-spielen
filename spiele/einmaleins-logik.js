// Kettenhüpfer – reine Spiellogik ohne DOM (in Node testbar, siehe tests/einmaleins-logik.test.mjs).
// Spec: docs/superpowers/specs/2026-11-13-kettenhuepfer-einmaleins-design.md
//
// Aufgabe a · n = a Stäbchen zu je n Perlen, liegt auf der Kette von n. Schlüssel "6x7" (a=6, n=7).
// Stufen nach dem Faktor a: K (Kern), A (Nachbar einer Kernaufgabe), B (zwei Schritte entfernt).
// Ein Paket ist eine Stufe einer Kette, z. B. "A7" = 3·7, 4·7, 6·7, 9·7.

export const K = {
  ABSTAND: [0, 1, 3, 7, 21],     // Wiedervorlage in Tagen je Fach (wie die anderen Spiele)
  GELERNT: 4,
  STUFEN: { K: [1, 2, 5, 10], A: [3, 4, 6, 9], B: [7, 8] },
  KETTEN: [2, 3, 4, 5, 6, 7, 8, 9, 10],
  REIHENFOLGE: ["K2", "K10", "K5", "A2", "A10", "A5", "K4", "K3", "A4", "A3", "B2", "B10", "B5",
    "K6", "K9", "A6", "A9", "B4", "B3", "K8", "K7", "A8", "A7", "B6", "B9", "B8", "B7"],
  START: 2,                      // so viele Pakete aus REIHENFOLGE sind von Anfang an frei
  FREI_ANTEIL: 0.8,
  FREI_FENSTER: 10,
  FREI_QUOTE: 0.8,
  NEU_ANTEIL: 0.5,
  ANTEIL_FAELLIG: 0.7,
  RUNDE: 15,
  AUFGABEN_JE_KETTE: [3, 4],     // so viele Aufgaben bleibt eine Kette liegen
};

export const stufeVon = (a) => Object.keys(K.STUFEN).find(s => K.STUFEN[s].includes(a));
export const paketVon = (a, n) => stufeVon(a) + n;
const aufgabe = (a, n) => ({ a, n, key: `${a}x${n}` });
export function aufgabenVon(paket) {
  const s = paket[0], n = +paket.slice(1);
  return (K.STUFEN[s] || []).map(a => aufgabe(a, n));
}
export const alleAufgaben = () => K.KETTEN.flatMap(n => Array.from({ length: 10 }, (_, i) => aufgabe(i + 1, n)));
const GUELTIG = new Set(alleAufgaben().map(x => x.key));
const DATUM = /^\d{4}-\d{2}-\d{2}$/;

export function neuerStand() {
  return { version: 1, aufgaben: {}, frei: K.REIHENFOLGE.slice(0, K.START), neu: null, verlauf: [], zaehler: 0 };
}

export function migriere(roh) {
  if (!roh || typeof roh !== "object" || Array.isArray(roh) || roh.version !== 1) return neuerStand();
  const s = Object.assign(neuerStand(), roh);
  const frei = new Set([...K.REIHENFOLGE.slice(0, K.START), ...(Array.isArray(roh.frei) ? roh.frei : [])]);
  s.frei = K.REIHENFOLGE.filter(p => frei.has(p));
  const zahl = (x) => (Number.isFinite(x) ? x : 0);
  s.aufgaben = {};
  for (const [k, e] of Object.entries(roh.aufgaben && typeof roh.aufgaben === "object" ? roh.aufgaben : {})) {
    if (!GUELTIG.has(k) || !e || typeof e !== "object") continue;
    const r = { ...e, f: Math.max(0, Math.min(K.GELERNT, zahl(e.f))), t: DATUM.test(e.t) ? e.t : "",
      h: Array.isArray(e.h) ? e.h : [] };
    if (Array.isArray(e.z)) r.z = e.z.filter(Number.isFinite); else delete r.z;
    s.aufgaben[k] = r;
  }
  if (!Array.isArray(s.verlauf)) s.verlauf = [];
  if (!Number.isFinite(s.zaehler)) s.zaehler = 0;
  if (s.neu && !(K.REIHENFOLGE.includes(s.neu.paket) && Number.isFinite(s.neu.bis))) s.neu = null;
  return s;
}

export const eintrag = (stand, key) => stand.aufgaben[key] || { f: 0, t: "", h: [] };
export function tage(a, b) {
  if (!a || !b) return Infinity;
  return Math.round((Date.parse(b + "T12:00:00Z") - Date.parse(a + "T12:00:00Z")) / 86400000);
}
export const faellig = (e, heute) => e.f === 0 || tage(e.t, heute) >= K.ABSTAND[Math.min(e.f, K.ABSTAND.length - 1)];

export function freischaltbar(stand) {
  const naechstes = K.REIHENFOLGE.find(p => !stand.frei.includes(p));
  if (!naechstes) return null;
  const xs = stand.frei.flatMap(aufgabenVon);
  if (xs.filter(x => eintrag(stand, x.key).f >= 2).length < K.FREI_ANTEIL * xs.length) return null;
  const v = stand.verlauf.slice(-K.FREI_FENSTER);
  if (v.length < K.FREI_FENSTER || v.filter(Boolean).length < K.FREI_QUOTE * K.FREI_FENSTER) return null;
  return naechstes;
}

// Eine gelöste Aufgabe eintragen. fehler = Fehlversuche, hilfe = Denkhilfe/Lösung gezeigt.
export function verbuche(stand, a, n, { fehler = 0, hilfe = false, ms = 0, heute }) {
  const key = `${a}x${n}`;
  const e = stand.aufgaben[key] || (stand.aufgaben[key] = { f: 0, t: "", h: [] });
  const sauber = fehler === 0 && !hilfe;
  if (sauber) {
    if (faellig(e, heute)) { e.f = Math.min(e.f + 1, K.GELERNT); e.t = heute; }
    if (e.f >= K.GELERNT) e.g = 1;
  } else { e.f = 0; e.t = heute; }
  e.h = [...e.h, sauber ? 1 : 0].slice(-6);
  if (ms) e.z = [...(e.z || []), Math.round(ms)].slice(-5);
  stand.verlauf = [...stand.verlauf, sauber ? 1 : 0].slice(-K.FREI_FENSTER);
  stand.zaehler++;
  const neu = freischaltbar(stand);
  if (neu) {
    stand.frei = [...stand.frei, neu];
    stand.neu = { paket: neu, bis: stand.zaehler + K.RUNDE };
    stand.verlauf = [];
  }
  return { frei: neu };
}

const zufallsEins = (liste, rnd) => liste[Math.floor(rnd() * liste.length)];

// Nächste Aufgabe. kette/rest: aktuelle Kette und wie viele Aufgaben sie noch liegen bleibt.
// Rückgabe enthält die (ggf. neue) Kette und den neuen Rest nach dieser Aufgabe.
export function naechsteAufgabe(stand, { kette = 0, rest = 0, vorher = "", heute, rnd = Math.random } = {}) {
  const frei = stand.frei.flatMap(aufgabenVon);
  const istNeu = (x) => stand.neu && stand.zaehler < stand.neu.bis && paketVon(x.a, x.n) === stand.neu.paket;
  const dran = (x) => faellig(eintrag(stand, x.key), heute);
  const [vA, vN] = vorher.split("x").map(Number);
  const aufKette = (n) => frei.filter(x => x.n === n && x.key !== vorher);
  // gegen Reihen-Drill: in derselben Kette nicht den nächstgrößeren Faktor, wenn es anderes gibt
  const ohneReihe = (xs) => { const r = xs.filter(x => !(x.n === vN && x.a === vA + 1)); return r.length ? r : xs; };

  let n = kette, r = rest - 1;
  if (!(rest > 0 && aufKette(kette).length)) {
    const ketten = [...new Set(frei.map(x => x.n))];
    let kand = ketten.filter(k => k !== kette && aufKette(k).length);
    if (!kand.length) kand = ketten.filter(k => aufKette(k).length);
    const neuKette = kand.filter(k => frei.some(x => x.n === k && istNeu(x)));
    const mitDran = kand.filter(k => aufKette(k).some(dran));
    n = neuKette.length && rnd() < K.NEU_ANTEIL ? zufallsEins(neuKette, rnd)
      : mitDran.length ? zufallsEins(mitDran, rnd) : zufallsEins(kand, rnd);
    r = zufallsEins(K.AUFGABEN_JE_KETTE, rnd) - 1;
  }
  const xs = ohneReihe(aufKette(n));
  const neue = xs.filter(istNeu);
  let gruppe;
  if (neue.length && rnd() < K.NEU_ANTEIL) gruppe = neue;
  else {
    const d = xs.filter(dran), s = xs.filter(x => !dran(x));
    gruppe = !s.length || (d.length && rnd() < K.ANTEIL_FAELLIG) ? d : s;
  }
  const x = zufallsEins(gruppe, rnd);
  return { ...x, kette: n, rest: r };
}

// Denkhilfe: von welcher Kernaufgabe aus und wie viele Stäbchen weiter (+) oder zurück (−).
// kernA = null: keine Kernaufgabe als Stütze (1·, 2·, 10· werden direkt erklärt).
export function hilfeVon(a) {
  const t = { 3: [2, 1], 4: [5, -1], 6: [5, 1], 9: [10, -1], 7: [5, 2], 8: [10, -2], 5: [10, 0] };
  const [kernA, schritt] = t[a] || [null, 0];
  return { kernA, schritt };
}

// Wo liegt eine Zahl auf der Kette von n (10 Stäbchen)? staebchen ganze Stäbchen und rest Perlen.
export function ortVon(zahl, n) {
  return { staebchen: Math.floor(zahl / n), rest: zahl % n, ueber: zahl > 10 * n };
}

const EINER = ["null", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn", "elf", "zwölf",
  "dreizehn", "vierzehn", "fünfzehn", "sechzehn", "siebzehn", "achtzehn", "neunzehn"];
const ZEHNER = ["", "", "zwanzig", "dreißig", "vierzig", "fünfzig", "sechzig", "siebzig", "achtzig", "neunzig"];
// Zahl als Wort (0 … 999), damit die Stimme „42“ nicht als Ordnungszahl oder Ziffern liest.
export function zahlwort(z) {
  if (!Number.isInteger(z) || z < 0 || z > 999) return String(z);
  if (z < 20) return EINER[z];
  if (z < 100) { const e = z % 10, t = ZEHNER[Math.floor(z / 10)]; return e ? (e === 1 ? "ein" : EINER[e]) + "und" + t : t; }
  const h = Math.floor(z / 100), r = z % 100;
  return (h === 1 ? "" : EINER[h]) + "hundert" + (r ? zahlwort(r) : "");
}
