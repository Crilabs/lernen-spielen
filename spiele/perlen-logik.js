// Perlenbrücke – reine Spiellogik ohne DOM (in Node testbar, siehe tests/perlen-logik.test.mjs).
// Spec: docs/superpowers/specs/2026-11-13-perlenbruecke-neu-design.md
//
// Eine Brücke für die Zahl n wird aus zwei Stäbchen gebaut: a von der linken Spalte, b von der rechten.
// Geordnete Paare: 2+5 und 5+2 sind verschiedene Paare (Schlüssel "7:2+5").

export const K = {
  ABSTAND: [0, 1, 3, 7, 21],     // Wiedervorlage in Tagen je Fach (wie Zauberer/Wimmelbild)
  GELERNT: 4,                    // ab diesem Fach gilt ein Paar als gelernt
  ABNUTZUNG: 0.25,               // so viel weniger Chance je Bau mehr als das seltenste Paar der Zahl
  MIN_CHANCE: 0.15,              // Restchance eines oft gebauten Paares
  MAX_PAARE: 3,                  // höchstens so viele gültige Paare je Brücke
  SPALTE_MAX: 5,                 // Stäbchen je Spalte höchstens
  START: [3, 4],                 // Erfolg zuerst: klein anfangen
  REIHENFOLGE: [3, 4, 5, 6, 7, 10, 8, 9],
  FREI_ANTEIL: 0.8,              // Anteil der Paare (freigeschaltete Zahlen) mit Fach >= 2 für die nächste Zahl
  FREI_FENSTER: 10,              // … und die letzten so vielen Brücken
  FREI_QUOTE: 0.8,               // … zu mindestens diesem Anteil fehlerfrei
  GEWICHT: { 5: 1.5, 10: 2 },    // Kraft der Fünf, Zehnerzerlegungen
  ANTEIL_FAELLIG: 0.7,           // so oft kommt eine fällige/wackelige Zahl dran (wenn es eine gibt)
  NEU_ANTEIL: 0.5,               // neue Zahl in der Einführungszeit bei etwa jeder zweiten Brücke
  NEU_RUNDEN: 2,                 // Einführungszeit in Runden
  RUNDE: 8,                      // Brücken je Runde
};

export const paareVon = (n) =>
  Array.from({ length: n - 1 }, (_, i) => ({ n, a: i + 1, b: n - i - 1, key: `${n}:${i + 1}+${n - i - 1}` }));

export function neuerStand() {
  return { version: 2, reise: 0, paare: {}, zahlen: {}, frei: [...K.START], neu: null, verlauf: [], pause: "" };
}

// Alter Stand (ungeordnete Paare "pairs") wird verworfen, nur die Brückenzahl bleibt.
export function migriere(roh) {
  if (!roh || typeof roh !== "object" || Array.isArray(roh)) return neuerStand();
  if (roh.version === 2 && roh.paare && typeof roh.paare === "object") {
    const s = Object.assign(neuerStand(), roh);
    // Freigeschaltet: nur Zahlen aus REIHENFOLGE, START immer dabei, Reihenfolge wie REIHENFOLGE
    const frei = new Set([...K.START, ...(Array.isArray(roh.frei) ? roh.frei : [])]);
    s.frei = K.REIHENFOLGE.filter(z => frei.has(z));
    // Einträge normalisieren, Kaputtes verwerfen
    const zahl = (x, d = 0) => (Number.isFinite(x) ? x : d);
    s.paare = {};
    for (const [k, e] of Object.entries(roh.paare)) {
      if (!/^\d+:\d+\+\d+$/.test(k) || !e || typeof e !== "object") continue;
      s.paare[k] = { ...e, f: Math.max(0, Math.min(K.GELERNT, zahl(e.f))), t: typeof e.t === "string" ? e.t : "",
        h: Array.isArray(e.h) ? e.h : [], c: Math.max(0, zahl(e.c)) };
    }
    if (!Array.isArray(s.verlauf)) s.verlauf = [];
    if (!s.zahlen || typeof s.zahlen !== "object" || Array.isArray(s.zahlen)) s.zahlen = {};
    for (const [z, e] of Object.entries(s.zahlen)) if (!e || typeof e !== "object" || !Array.isArray(e.z)) s.zahlen[z] = { w: e?.w ? 1 : 0, t: "", z: [] };
    if (!Number.isFinite(s.reise)) s.reise = 0;
    if (s.neu && !(Number.isFinite(s.neu.zahl) && Number.isFinite(s.neu.bis))) s.neu = null;
    return s;
  }
  const s = neuerStand();
  if (Number.isFinite(roh.reise)) s.reise = roh.reise;
  return s;
}

export const eintrag = (stand, key) => stand.paare[key] || { f: 0, t: "", h: [], c: 0 };

export function tage(a, b) {
  if (!a || !b) return Infinity;
  return Math.round((Date.parse(b + "T12:00:00Z") - Date.parse(a + "T12:00:00Z")) / 86400000);
}
export const faellig = (e, heute) => e.f === 0 || tage(e.t, heute) >= K.ABSTAND[Math.min(e.f, K.ABSTAND.length - 1)];

function mische(liste, rnd) {
  const l = [...liste];
  for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; }
  return l;
}
const zufallsEins = (liste, rnd) => liste[Math.floor(rnd() * liste.length)];

// Welche Paare diesmal gebaut werden können und welche Stäbchen in den Spalten liegen.
export function angebot(n, stand, heute, rnd = Math.random) {
  const ps = paareVon(n).map(p => ({ ...p, e: eintrag(stand, p.key) }));
  const cmin = Math.min(...ps.map(p => p.e.c));
  const fest = new Set();
  fest.add(zufallsEins(ps.filter(p => p.e.c === cmin), rnd).key);                       // seltenstes Paar
  const dran = ps.filter(p => p.e.f < K.GELERNT && faellig(p.e, heute));
  if (dran.length) {                                                                     // fälliges/wackeliges Paar
    const fmin = Math.min(...dran.map(p => p.e.f));
    fest.add(zufallsEins(dran.filter(p => p.e.f === fmin), rnd).key);
  }
  let rest = ps.filter(p => !fest.has(p.key) && rnd() < Math.max(K.MIN_CHANCE, 1 - K.ABNUTZUNG * (p.e.c - cmin)));
  // Zu viele: zuerst die meistgebauten streichen (bei Gleichstand zufällig)
  rest = mische(rest, rnd).sort((x, y) => x.e.c - y.e.c).slice(0, Math.max(0, K.MAX_PAARE - fest.size));
  const S = ps.filter(p => fest.has(p.key) || rest.includes(p));

  const links = new Set(S.map(p => p.a)), rechts = new Set(S.map(p => p.b));
  const min = n <= 5 ? 2 : 3;
  const ziel = () => Math.min(K.SPALTE_MAX, Math.max(min, 3 + Math.floor(rnd() * 3)));
  const zielL = ziel(), zielR = ziel();
  const darf = (d, hier, dort) => !hier.has(d) && !dort.has(n - d);
  for (const d of mische(Array.from({ length: n - 1 }, (_, i) => i + 1), rnd)) {
    const reihenfolge = links.size <= rechts.size ? [[links, rechts, zielL], [rechts, links, zielR]] : [[rechts, links, zielR], [links, rechts, zielL]];
    for (const [hier, dort, z] of reihenfolge) if (hier.size < z && darf(d, hier, dort)) { hier.add(d); break; }
  }
  // Kleine Zahlen: reicht der Vorrat nicht, höchstens ein zu langes Stäbchen je Spalte
  for (const sp of [links, rechts]) if (sp.size < min) sp.add(n + Math.floor(rnd() * Math.min(3, 10 - n)));
  const sortiert = s => [...s].sort((x, y) => x - y);
  return { paare: S.map(p => p.key), links: sortiert(links), rechts: sortiert(rechts) };
}

// Nächste Zahl ermitteln, wenn sie freigeschaltet werden darf (sonst null).
export function freischaltbar(stand) {
  const naechste = K.REIHENFOLGE.find(z => !stand.frei.includes(z));
  if (naechste === undefined) return null;
  const ps = stand.frei.flatMap(paareVon);
  const sitzen = ps.filter(p => eintrag(stand, p.key).f >= 2).length;
  if (sitzen < K.FREI_ANTEIL * ps.length) return null;
  const v = stand.verlauf.slice(-K.FREI_FENSTER);
  if (v.length < K.FREI_FENSTER || v.filter(Boolean).length < K.FREI_QUOTE * K.FREI_FENSTER) return null;
  return naechste;
}

// Eine gelöste Brücke eintragen. fehler = Zahl der Fehlversuche, hilfe = Denkhilfe/Lösung gezeigt.
export function verbuche(stand, n, a, b, { fehler = 0, hilfe = false, ms = 0, heute }) {
  const key = `${n}:${a}+${b}`;
  const e = stand.paare[key] || (stand.paare[key] = { f: 0, t: "", h: [], c: 0 });
  const sauber = fehler === 0 && !hilfe;
  if (sauber) {
    e.c++;
    if (faellig(e, heute)) { e.f = Math.min(e.f + 1, K.GELERNT); e.t = heute; }
    if (e.f >= K.GELERNT) e.g = 1;
  } else { e.f = 0; e.t = heute; }
  e.h = [...e.h, sauber ? 1 : 0].slice(-6);
  const z = stand.zahlen[n] || (stand.zahlen[n] = { w: 0, t: "", z: [] });
  z.w = sauber ? 0 : 1; z.t = heute; z.z = [...(z.z || []), Math.round(ms)].slice(-5);
  stand.verlauf = [...stand.verlauf, sauber ? 1 : 0].slice(-K.FREI_FENSTER);
  stand.reise++;
  const neu = freischaltbar(stand);
  if (neu !== null) {
    stand.frei = [...stand.frei, neu];
    stand.neu = { zahl: neu, bis: stand.reise + K.NEU_RUNDEN * K.RUNDE };
    stand.verlauf = [];                       // neue Zahl muss sich erst bewähren
  }
  return { frei: neu };
}

const zahlFaellig = (stand, n, heute) =>
  stand.zahlen[n]?.w === 1 || paareVon(n).some(p => { const e = eintrag(stand, p.key); return e.f < K.GELERNT && faellig(e, heute); });

function gewichtet(liste, rnd) {
  const w = liste.map(n => K.GEWICHT[n] || 1);
  let r = rnd() * w.reduce((s, x) => s + x, 0);
  for (let i = 0; i < liste.length; i++) { r -= w[i]; if (r <= 0) return liste[i]; }
  return liste[liste.length - 1];
}

export function naechsteZahl(stand, { vorher = 0, heute, rnd = Math.random } = {}) {
  const kand = stand.frei.filter(n => n !== vorher);
  if (!kand.length) return stand.frei[0];
  const neu = stand.neu;
  if (neu && stand.reise < neu.bis && neu.zahl !== vorher && kand.includes(neu.zahl) && rnd() < K.NEU_ANTEIL) return neu.zahl;
  const dran = kand.filter(n => zahlFaellig(stand, n, heute)), sicher = kand.filter(n => !dran.includes(n));
  const gruppe = !sicher.length || (dran.length && rnd() < K.ANTEIL_FAELLIG) ? dran : sicher;
  return gewichtet(gruppe, rnd);
}
