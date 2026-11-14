// Lernsteuerung – reine Logik ohne DOM und ohne fetch (in Node testbar, siehe tests/lernsteuerung.test.mjs).
// Spec: docs/superpowers/specs/2026-11-13-lernplan-design.md (Ablauf eines Themas, Themen-Zustände,
// Lernsteuerung, Speicherung).
//
// ctx = { plan, spiele }: plan = lernplan.json, spiele = spiele.json (beide schon geladen).
// Zufall (rnd), Datum (heute, "JJJJ-MM-TT") und Uhrzeit (jetzt, ms) kommen immer als Parameter.
//
// Lernstand (Schlüssel "lernplan"):
//   { version: 1, themen: { [id]: Thema }, aufgaben: { [key]: Aufgabe }, verlauf: [], … }
//   Thema   { z: "dran"|"kann-ich", stufe, e, seit, k, u, frei: 0|1, v: [], pb?: 1 }
//           e = Einführung gesehen am, seit = dran seit, k = gekonnt am, u = zuletzt geübt am,
//           frei = von den Eltern freigegeben (Thema selbst in Sicht, gilt nicht als erfüllte Voraussetzung), v = letzte Ergebnisse (1/0) auf der aktuellen Stufe,
//           pb = Probe begonnen (mindestens eine Antwort verbucht).
//           Ohne Eintrag (oder ohne z) wird der Zustand berechnet.
//   Aufgabe { f, t, h: [], ms: [], g?: 1, kk?: 1 }
//           f = Fach, t = Tag der letzten Einstufung, h = letzte Ergebnisse, ms = letzte Antwortzeiten,
//           g = einmal gelernt, kk = einmal auf Stufe kopf ohne Hilfe und nicht mühsam gelöst.
//
// Sitzung (eine Runde in einem Spiel):
//   { spiel, thema, modus, stufe, probe: key[]|null, gezeigt, wieder: [{key, ab}], start, max, ereignis, letzte }

import { aufgabenVon, darstellbar, schwierigkeit, ZIEL_MS } from "./aufgabenarten.js";
import { lade, speichere, sofortSpeichern, protokoll } from "./lernspiel.js";

export const K = {
  ABSTAND: [0, 1, 3, 7, 21], // Wiedervorlage in Tagen je Fach
  GELERNT: 4,                // ab diesem Fach gilt eine Aufgabe als gelernt (g = 1)
  IN_SICHT: 2,               // so viele Themen „in Sicht“ je Strang
  PROBE: 5,                  // Aufgaben in der Probe
  PROBE_SCHWER: 2,           // … davon die schwierigsten
  AUF_FENSTER: 5,            // Aufstieg: von den letzten so vielen Aufgaben auf der Stufe …
  AUF_OK: 4,                 // … mindestens so viele richtig ohne Hilfe
  AB_FEHLER: 2,              // Abstieg nach so vielen Fehlern in Folge
  ANTEIL_THEMA: 0.7,         // Anteil des aktuellen Themas in einer Runde
  WIEDER_NACH: [2, 4],       // Fehler kommt nach so vielen anderen Aufgaben wieder (von, bis)
  RUNDE_MS: 240000,          // Rundenlänge
  GROSS: 40,                 // ab mehr als so vielen darstellbaren Aufgaben ist ein Thema „groß“ …
  STICHPROBE: 20,            // … und gilt nach dem Üben mit so vielen verschiedenen kk als gekonnt (je Klasse zwei, höchstens vier Klassen)
};

const STUFEN = ["material", "vorstellung", "kopf"];
const WIEDERHOLUNG_MAX = 8;  // Aufgaben einer Wiederholungsrunde höchstens
const H_LAENGE = 6, MS_LAENGE = 5;

// ---------- Fächer (aus perlen-logik.js hierher verschoben) ----------

export function tage(a, b) {
  if (!a || !b) return Infinity;
  return Math.round((Date.parse(b + "T12:00:00Z") - Date.parse(a + "T12:00:00Z")) / 86400000);
}
export const faellig = (e, heute) => e.f === 0 || tage(e.t, heute) >= K.ABSTAND[Math.min(e.f, K.ABSTAND.length - 1)];

// ---------- Kleine Helfer ----------

const istObjekt = (x) => !!x && typeof x === "object" && !Array.isArray(x);
const text = (x) => (typeof x === "string" ? x : "");
const fach = (x) => Math.max(0, Math.min(K.GELERNT, Number.isFinite(x) ? Math.trunc(x) : 0));

function mische(liste, rnd) {
  const l = [...liste];
  for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; }
  return l;
}
const zufallsEins = (liste, rnd) => liste[Math.floor(rnd() * liste.length)];
const eintrag = (stand, key) => stand.aufgaben[key] || { f: 0, t: "", h: [], ms: [] };

// Zielzeit einer Aufgabe (ms) oder undefined, wenn die Art keine hat
function zielMs(aufgabe) {
  const z = ZIEL_MS[aufgabe.art === "zwillinge" ? "rechnen" : aufgabe.art];
  return typeof z === "function" ? z(aufgabe.daten.raum) : z;
}

// ---------- Plan und Spiele ----------

const themenVon = (ctx) => (Array.isArray(ctx.plan?.themen) ? ctx.plan.themen : []);
const spieleVon = (ctx) => (Array.isArray(ctx.spiele?.spiele) ? ctx.spiele.spiele : []);
const themaVon = (ctx, id) => themenVon(ctx).find((t) => t.id === id);
const artenVon = (ctx, spielId) => spieleVon(ctx).find((s) => s.id === spielId)?.arten ?? [];

// Aufgaben eines Themas (mit thema-Feld), je Thema-Objekt einmal erzeugt
const cacheAufgaben = new WeakMap();
function aufgabenDes(t) {
  if (!t) return [];
  if (!cacheAufgaben.has(t)) cacheAufgaben.set(t, aufgabenVon(t.aufgaben).map((a) => ({ ...a, thema: t.id })));
  return cacheAufgaben.get(t);
}

// Schlüssel -> Aufgabe, je Plan einmal aufgebaut
const cacheIndex = new WeakMap();
function aufgabeZu(ctx, key) {
  const plan = ctx.plan;
  if (!istObjekt(plan)) return null;
  if (!cacheIndex.has(plan)) {
    const m = new Map();
    for (const t of themenVon(ctx)) for (const a of aufgabenDes(t)) if (!m.has(a.key)) m.set(a.key, a);
    cacheIndex.set(plan, m);
  }
  return cacheIndex.get(plan).get(key) ?? null;
}

// Aufgaben eines Themas, die ein Spiel darstellen kann (gemerkt je Thema-Objekt und spiele.json)
const cacheImSpiel = new WeakMap();
function imSpiel(ctx, spielId, themaId) {
  const t = themaVon(ctx, themaId);
  if (!t || !istObjekt(ctx.spiele)) return [];
  if (!cacheImSpiel.has(t)) cacheImSpiel.set(t, new WeakMap());
  const proSpiele = cacheImSpiel.get(t);
  if (!proSpiele.has(ctx.spiele)) proSpiele.set(ctx.spiele, new Map());
  const m = proSpiele.get(ctx.spiele);
  if (!m.has(spielId)) {
    const arten = artenVon(ctx, spielId);
    m.set(spielId, aufgabenDes(t).filter((a) => arten.some((art) => darstellbar(a, art))));
  }
  return m.get(spielId);
}

// Aufgaben eines Themas, die irgendein Spiel darstellen kann (nur sie zählen für „kann ich“);
// gemerkt je Thema-Objekt und spiele.json
const cacheDarstellbar = new WeakMap();
function darstellbareAufgaben(ctx, themaId) {
  const t = themaVon(ctx, themaId);
  if (!t || !istObjekt(ctx.spiele)) return [];
  if (!cacheDarstellbar.has(t)) cacheDarstellbar.set(t, new WeakMap());
  const proSpiele = cacheDarstellbar.get(t);
  if (!proSpiele.has(ctx.spiele)) {
    const keys = new Set(spieleVon(ctx).flatMap((s) => imSpiel(ctx, s.id, themaId).map((a) => a.key)));
    proSpiele.set(ctx.spiele, aufgabenDes(t).filter((a) => keys.has(a.key)));
  }
  return proSpiele.get(ctx.spiele);
}

// ---------- Große Themen (mehr als K.GROSS darstellbare Aufgaben, z. B. plus-bis-100) ----------
// Dort ist „jede Aufgabe einmal kk“ praktisch nicht zu schaffen, und Fach-1-Einträge für jede Aufgabe
// würden den Stand aufblähen. Darum: „kann ich“ nach einer Stichprobe über alle Schwierigkeitsklassen,
// Einträge nur für beantwortete Aufgaben, Wiederholung nur aus Aufgaben mit Eintrag.

const istGross = (ctx, themaId) => darstellbareAufgaben(ctx, themaId).length > K.GROSS;

// Schwierigkeitsklassen eines großen Themas: höchstens vier, nach den Quartilen von schwierigkeit.
// Grenzen = Schwierigkeit an den Stellen ¼, ½, ¾ der sortierten Aufgaben; gleiche Schwierigkeit bleibt in
// einer Klasse (fallen Grenzen zusammen, gibt es weniger Klassen). [[Aufgabe]] von leicht nach schwer,
// innerhalb einer Klasse in Planreihenfolge; kleines Thema: [].
const cacheKlassen = new WeakMap();
export function schwierigkeitsKlassen(ctx, themaId) {
  const d = darstellbareAufgaben(ctx, themaId);
  if (d.length <= K.GROSS) return [];
  if (!cacheKlassen.has(d)) {
    const werte = d.map(schwierigkeit).sort((a, b) => a - b);
    const grenzen = [1, 2, 3].map((i) => werte[Math.floor((i * werte.length) / 4)]);
    const klasse = (a) => grenzen.filter((g) => schwierigkeit(a) >= g).length;
    const nach = new Map();
    for (const a of d) { const k = klasse(a); if (!nach.has(k)) nach.set(k, []); nach.get(k).push(a); }
    cacheKlassen.set(d, [...nach.keys()].sort((a, b) => a - b).map((k) => nach.get(k)));
  }
  return cacheKlassen.get(d);
}

// Klassen (Index in schwierigkeitsKlassen) eines großen Themas, in denen noch kk fehlen:
// je Klasse mindestens zwei kk (Klassen mit weniger Aufgaben: alle)
function offeneKlassen(ctx, stand, themaId) {
  const offen = new Set();
  schwierigkeitsKlassen(ctx, themaId).forEach((l, i) => {
    if (l.filter((a) => stand.aufgaben[a.key]?.kk).length < Math.min(2, l.length)) offen.add(i);
  });
  return offen;
}

// Kann ich nach dem Üben: kleines Thema – jede darstellbare Aufgabe hat kk;
// großes Thema – mindestens STICHPROBE verschiedene kk und keine der (höchstens vier) Klassen mehr offen
function gekonntNachUeben(ctx, stand, themaId) {
  const d = darstellbareAufgaben(ctx, themaId);
  if (!d.length) return false;
  if (d.length <= K.GROSS) return d.every((a) => stand.aufgaben[a.key]?.kk);
  return d.filter((a) => stand.aufgaben[a.key]?.kk).length >= K.STICHPROBE && offeneKlassen(ctx, stand, themaId).size === 0;
}

// Thema gilt als gekonnt (Probe, Eltern, Übernahme): Aufgaben ohne Eintrag oder in Fach 0 kommen in Fach 1,
// damit die Wiederholung nicht überläuft. In großen Themen nur Aufgaben, die schon einen Eintrag haben.
function inFachEins(ctx, stand, themaId, heute) {
  const gross = istGross(ctx, themaId);
  for (const a of aufgabenDes(themaVon(ctx, themaId))) {
    if (gross && !stand.aufgaben[a.key]) continue;
    const x = stand.aufgaben[a.key] || (stand.aufgaben[a.key] = { f: 0, t: "", h: [], ms: [] });
    if (x.f < 1) { x.f = 1; x.t = heute; }
  }
}

// Aufgaben eines gekonnten Themas für die Wiederholung (große Themen: nur mit Eintrag)
function zumWiederholen(ctx, stand, spielId, themaId) {
  const alle = imSpiel(ctx, spielId, themaId);
  return istGross(ctx, themaId) ? alle.filter((a) => stand.aufgaben[a.key]) : alle;
}

export const bedient = (ctx, spielId, themaId) => imSpiel(ctx, spielId, themaId).length > 0;
export const spieleFuer = (ctx, themaId) => spieleVon(ctx).filter((s) => bedient(ctx, s.id, themaId)).map((s) => s.id);

// Stufen, die ein Spiel für die Aufgaben eines Themas anbietet (ohne Rücksicht auf die Stufen des Themas)
function stufenDesSpiels(ctx, spielId, themaId) {
  const aufgaben = imSpiel(ctx, spielId, themaId);
  const arten = artenVon(ctx, spielId).filter((art) => aufgaben.some((a) => darstellbar(a, art)));
  const s = new Set(arten.flatMap((art) => art.stufen ?? []));
  return STUFEN.filter((x) => s.has(x));
}

// Stufen, auf denen ein Spiel ein Thema übt: Stufen des Spiels, die das Thema vorsieht
export function stufenFuer(ctx, spielId, themaId) {
  const spiel = stufenDesSpiels(ctx, spielId, themaId);
  const thema = themaVon(ctx, themaId)?.stufen;
  const beide = Array.isArray(thema) ? spiel.filter((x) => thema.includes(x)) : spiel;
  return beide.length ? beide : spiel;
}

// Gespeicherte Stufe auf das Spiel abbilden: fehlende Stufen werden nach oben übersprungen
function passendeStufe(stufen, gewuenscht) {
  if (!stufen.length) return gewuenscht;
  if (stufen.includes(gewuenscht)) return gewuenscht;
  const i = STUFEN.indexOf(gewuenscht);
  return stufen.find((x) => STUFEN.indexOf(x) > i) ?? stufen[stufen.length - 1];
}

// ---------- Lernstand ----------

export function neuerStand() {
  return { version: 1, themen: {}, aufgaben: {}, verlauf: [] };
}

// Repariert einen geladenen Stand; unbekannte Themen, Aufgaben und Felder bleiben erhalten.
export function migriereStand(roh) {
  if (!istObjekt(roh)) return neuerStand();
  const s = { ...roh, version: 1, themen: {}, aufgaben: {}, verlauf: Array.isArray(roh.verlauf) ? roh.verlauf : [] };
  for (const [id, e] of Object.entries(istObjekt(roh.themen) ? roh.themen : {})) {
    if (!istObjekt(e)) continue;
    const t = { ...e, stufe: STUFEN.includes(e.stufe) ? e.stufe : "", e: text(e.e), seit: text(e.seit), k: text(e.k),
      u: text(e.u), frei: e.frei === 1 ? 1 : 0, v: (Array.isArray(e.v) ? e.v : []).filter((x) => x === 0 || x === 1).slice(-K.AUF_FENSTER) };
    if (t.z !== "dran" && t.z !== "kann-ich") delete t.z;
    if (t.pb !== 1) delete t.pb;
    s.themen[id] = t;
  }
  for (const [key, e] of Object.entries(istObjekt(roh.aufgaben) ? roh.aufgaben : {})) {
    if (!istObjekt(e)) continue;
    const a = { ...e, f: fach(e.f), t: text(e.t), h: (Array.isArray(e.h) ? e.h : []).filter((x) => x === 0 || x === 1).slice(-H_LAENGE),
      ms: (Array.isArray(e.ms) ? e.ms : []).filter(Number.isFinite).slice(-MS_LAENGE) };
    if ("g" in e) a.g = e.g ? 1 : 0;
    if ("kk" in e) a.kk = e.kk ? 1 : 0;
    s.aufgaben[key] = a;
  }
  return s;
}

// ---------- Themen-Zustände und Sichtbarkeit ----------

// { [themaId]: "verborgen" | "in-sicht" | "dran" | "kann-ich" } in Planreihenfolge
export function zustaende(ctx, stand) {
  const themen = themenVon(ctx);
  const nachId = new Map(themen.map((t) => [t.id, t]));
  const gespeichert = (id) => stand?.themen?.[id];
  const memo = new Map();
  const erfuellt = (id) =>
    !nachId.has(id) || zustand(id) === "kann-ich" || spieleFuer(ctx, id).length === 0; // frei zählt hier nicht
  function zustand(id) {
    if (memo.has(id)) return memo.get(id);
    memo.set(id, "verborgen"); // Schutz gegen Zyklen
    const e = gespeichert(id), t = nachId.get(id);
    let z;
    if (e?.z === "dran" || e?.z === "kann-ich") z = e.z;
    else if (spieleFuer(ctx, id).length === 0) z = "verborgen";               // ohne Spiel: nie für das Kind
    else if (e?.frei === 1 || (t.voraussetzungen ?? []).every(erfuellt)) z = "in-sicht"; // frei: von den Eltern freigegeben
    else z = "verborgen";
    memo.set(id, z);
    return z;
  }
  return Object.fromEntries(themen.map((t) => [t.id, zustand(t.id)]));
}

// { [strang]: themaId[] }: alle gekonnten, alle dran und die ersten IN_SICHT in Sicht (Planreihenfolge)
export function sichtbar(ctx, stand) {
  const z = zustaende(ctx, stand), out = {}, inSicht = {};
  for (const t of themenVon(ctx)) {
    const liste = out[t.strang] || (out[t.strang] = []);
    if (spieleFuer(ctx, t.id).length === 0) continue;
    if (z[t.id] === "kann-ich" || z[t.id] === "dran") liste.push(t.id);
    else if (z[t.id] === "in-sicht" && (inSicht[t.strang] ?? 0) < K.IN_SICHT) {
      liste.push(t.id);
      inSicht[t.strang] = (inSicht[t.strang] ?? 0) + 1;
    }
  }
  return out;
}

// Themen-Übersicht für das Kind (themen.html): je Strang mit sichtbaren Stationen, in Planreihenfolge.
// [{ strang, stationen: [{ id, name, sprich, ziffer, zustand, spiele: spielId[], geschichte }] }]
//   ziffer     = letzte Zahl im Namen („Die 7 zerlegen“ → "7", „Über die 10 mit der 9“ → "9"), sonst "";
//                steht groß an der Station, vorgelesen wird nur sprich (die Stimme spricht keine Zahlen).
//   geschichte = Einführung schon gesehen (e gesetzt), dann darf sie noch einmal angesehen werden.
export function uebersicht(ctx, stand) {
  const z = zustaende(ctx, stand), sicht = sichtbar(ctx, stand);
  const out = [];
  for (const [strang, liste] of Object.entries(sicht)) {
    if (!liste.length) continue;
    out.push({
      strang,
      stationen: liste.map((id) => {
        const t = themaVon(ctx, id);
        const name = text(t.name);
        return { id, name, sprich: text(t.sprich), ziffer: name.match(/\d+/g)?.at(-1) ?? "", zustand: z[id],
          spiele: spieleFuer(ctx, id), geschichte: !!stand?.themen?.[id]?.e };
      }),
    });
  }
  return out;
}

// ---------- Daten für Startseite und Regal ----------

// Zahl eines Themas: aufgaben.zahl (zerlegung), aufgaben.bis (menge), sonst bei einer Aufgabenart die letzte Zahl im Namen
// („Rechnen mit der 7“ → 7); null, wenn keine da ist.
function zahlDes(t) {
  const a = t.aufgaben;
  if (Number.isFinite(a?.zahl)) return a.zahl;
  if (Number.isFinite(a?.bis)) return a.bis;
  if (!a?.art) return null;
  const n = text(t.name).match(/\d+/g)?.at(-1);
  return n === undefined ? null : Number(n);
}

// Alle gekonnten Themen (Zustand kann-ich, auch ohne Spiel), nach dem Datum des Gekonnt-Werdens (stand.themen[id].k,
// von markiereGekonnt und verbucheErgebnis gesetzt), älteste zuerst; ohne Datum zuerst (ältester Bestand),
// bei Gleichstand Planreihenfolge. bereich: Bereich des Themas im Lernplan ("" wenn keiner), für materialFuer.
// [{ id, name, sprich, strang, art, zahl, seit, bereich }]
export function gekonnteThemen(ctx, stand) {
  const z = zustaende(ctx, stand);
  return themenVon(ctx)
    .filter((t) => z[t.id] === "kann-ich")
    .map((t) => ({ id: t.id, name: text(t.name), sprich: text(t.sprich), strang: t.strang, art: t.aufgaben?.art ?? null,
      zahl: zahlDes(t), seit: text(stand?.themen?.[t.id]?.k), bereich: text(t.bereich) }))
    .sort((a, b) => (a.seit < b.seit ? -1 : a.seit > b.seit ? 1 : 0)); // Array.sort ist stabil
}

// Themen dran, die ein Spiel bedienen (ohne Spiel nie), zuletzt geübt zuerst (u, sonst seit), höchstens max.
// spiel = zuletzt gespieltes Spiel, das das Thema bedient (zuletzt: { [themaId]: spielId }, vom Aufrufer; der Lernstand
// merkt sich das Spiel nicht), sonst das erste.
// [{ id, name, sprich, strang, spiel }]
export function dranThemen(ctx, stand, { max = 3, zuletzt = {} } = {}) {
  const z = zustaende(ctx, stand);
  return themenVon(ctx)
    .filter((t) => z[t.id] === "dran" && spieleFuer(ctx, t.id).length > 0)
    .map((t) => {
      const spiele = spieleFuer(ctx, t.id);
      return { id: t.id, name: text(t.name), sprich: text(t.sprich), strang: t.strang,
        spiel: spiele.includes(zuletzt?.[t.id]) ? zuletzt[t.id] : spiele[0], u: zuletztGeuebt(stand, t.id) };
    })
    .sort((a, b) => (a.u < b.u ? 1 : a.u > b.u ? -1 : 0))
    .slice(0, Math.max(0, max))
    .map(({ u, ...rest }) => rest);
}

// ---------- Welches Thema bekommt ein Spiel? ----------

const zuletztGeuebt = (stand, id) => stand.themen[id]?.u || stand.themen[id]?.seit || "";

export function themaFuer(ctx, stand, spielId, { wunsch = null } = {}) {
  const z = zustaende(ctx, stand);
  const sicht = new Set(Object.values(sichtbar(ctx, stand)).flat());
  const dient = (id) => bedient(ctx, spielId, id);
  const themen = themenVon(ctx);
  // 1. Wunsch aus der Übersicht
  if (wunsch && sicht.has(wunsch) && dient(wunsch)) return { thema: wunsch, modus: z[wunsch] === "kann-ich" ? "wiederholung" : "thema" };
  // 2. ein Thema dran, das am längsten nicht geübte zuerst
  const dran = themen.filter((t) => z[t.id] === "dran" && dient(t.id));
  if (dran.length) {
    const erstes = dran.reduce((a, b) => (zuletztGeuebt(stand, b.id) < zuletztGeuebt(stand, a.id) ? b : a));
    return { thema: erstes.id, modus: "thema" };
  }
  // 3. das erste sichtbare Thema in Sicht. Ein Thema dran, das dieses Spiel übt, hat schon Schritt 2 genommen;
  //    ein dran-Thema eines anderen Spiels blockiert hier nicht (je Strang und Spiel ein Thema dran).
  const neu = themen.find((t) => z[t.id] === "in-sicht" && sicht.has(t.id) && dient(t.id));
  if (neu) return { thema: neu.id, modus: "thema" };
  // 4. Wiederholung gekonnter Themen
  if (themen.some((t) => z[t.id] === "kann-ich" && dient(t.id))) return { thema: null, modus: "wiederholung" };
  // 5. Vorgriff: damit kein Spiel leer bleibt
  const vor = themen.find((t) => z[t.id] !== "kann-ich" && dient(t.id));
  return { thema: vor ? vor.id : null, modus: "vorgriff" };
}

// Thema wird dran (ein gekonntes Thema bleibt gekonnt)
export function startThema(stand, themaId, heute) {
  const t = stand.themen[themaId] || (stand.themen[themaId] = {});
  if (t.z === "kann-ich") return t;
  Object.assign(t, { z: "dran", stufe: t.stufe || "", e: t.e || "", seit: t.seit || heute, k: "", frei: t.frei === 1 ? 1 : 0,
    v: Array.isArray(t.v) ? t.v : [] });
  return t;
}

// ---------- Probe und Sitzung ----------

// Schlüssel der Probe: die PROBE_SCHWER schwierigsten, dazu zufällige bis PROBE; leer ohne Stufe kopf
export function probeAufgaben(ctx, themaId, spielId, rnd = Math.random) {
  if (!stufenFuer(ctx, spielId, themaId).includes("kopf")) return [];
  const alle = mische(imSpiel(ctx, spielId, themaId), rnd); // bei gleicher Schwierigkeit zufällig
  const schwer = [...alle].sort((a, b) => schwierigkeit(b) - schwierigkeit(a)).slice(0, K.PROBE_SCHWER);
  const rest = alle.filter((a) => !schwer.includes(a)).slice(0, K.PROBE - schwer.length);
  return mische([...schwer, ...rest], rnd).map((a) => a.key);
}

// Neue Sitzung für die Wahl aus themaFuer. Erster Start eines Themas (noch keine Stufe) → Probe,
// wenn das Spiel kopf kann; sonst üben auf der niedrigsten Stufe des Spiels.
export function neueSitzung(ctx, stand, spielId, { thema = null, modus = "thema" } = {}, { jetzt = 0, max = null, rnd = Math.random } = {}) {
  const s = { spiel: spielId, thema, modus, stufe: "kopf", probe: null, gezeigt: 0, wieder: [], start: jetzt, max, ereignis: null, letzte: null };
  if (modus === "wiederholung") {
    const stufen = thema ? stufenDesSpiels(ctx, spielId, thema)
      : STUFEN.filter((x) => artenVon(ctx, spielId).some((art) => (art.stufen ?? []).includes(x)));
    s.stufe = passendeStufe(stufen, "kopf");
    // winzige Auswahl: höchstens doppelt so viele Aufgaben wie verschiedene, sonst kommt dieselbe zu oft
    const verschieden = new Set(wiederholungsAufgaben(ctx, stand, s).map((a) => a.key)).size;
    s.max = Math.min(max ?? WIEDERHOLUNG_MAX, WIEDERHOLUNG_MAX, 2 * verschieden);
    return s;
  }
  const stufen = stufenFuer(ctx, spielId, thema);
  const t = stand.themen[thema];
  if (!t?.stufe && t?.z !== "kann-ich") {
    const probe = probeAufgaben(ctx, thema, spielId, rnd);
    if (probe.length) { s.probe = probe; return s; }
    s.stufe = stufen[0] ?? "kopf";
    if (t) t.stufe = s.stufe;
    return s;
  }
  s.stufe = passendeStufe(stufen, t?.stufe || "kopf");
  return s;
}

// ---------- Angebot ----------

// niedrigstes Fach zuerst, bei Gleichstand zufällig
function niedrigesFach(stand, liste, rnd) {
  const min = Math.min(...liste.map((a) => eintrag(stand, a.key).f));
  return zufallsEins(liste.filter((a) => eintrag(stand, a.key).f === min), rnd);
}

// Aufgabe des aktuellen Themas: bevorzugt noch ohne kk, dann niedriges Fach.
// Großes Thema beim Üben: Aufgaben aus Klassen, in denen noch kk fehlen, zuerst.
function aufgabeDesThemas(ctx, stand, sitzung, rnd) {
  const alle = imSpiel(ctx, sitzung.spiel, sitzung.thema);
  const wieder = new Set(sitzung.wieder.map((w) => w.key));
  let l = alle.filter((a) => !wieder.has(a.key) && a.key !== sitzung.letzte);
  if (!l.length) l = alle.filter((a) => !wieder.has(a.key));
  if (!l.length) l = alle;
  if (!l.length) return null;
  const offen = istGross(ctx, sitzung.thema) && stand.themen[sitzung.thema]?.z !== "kann-ich" ? offeneKlassen(ctx, stand, sitzung.thema) : null;
  const zu = offen?.size ? new Set([...offen].flatMap((i) => schwierigkeitsKlassen(ctx, sitzung.thema)[i].map((a) => a.key))) : null;
  const rang = (a) => (stand.aufgaben[a.key]?.kk ? 100 : 0) + (zu && !zu.has(a.key) ? 50 : 0) + eintrag(stand, a.key).f;
  const min = Math.min(...l.map(rang));
  return zufallsEins(l.filter((a) => rang(a) === min), rnd);
}

// Aufgaben, aus denen die Wiederholung wählt: das gewünschte gekonnte Thema oder alle gekonnten Themen
// (ohne das aktuelle). Große Themen nur mit Eintrag; gäbe das gar nichts, alle Aufgaben, damit die
// Wiederholungsrunde nicht leer bleibt.
function wiederholungsAufgaben(ctx, stand, sitzung, nurFaellig = false) {
  const z = zustaende(ctx, stand);
  const ids = sitzung.modus === "wiederholung" && sitzung.thema ? [sitzung.thema]
    : themenVon(ctx).filter((t) => z[t.id] === "kann-ich" && t.id !== sitzung.thema).map((t) => t.id);
  const l = ids.flatMap((id) => zumWiederholen(ctx, stand, sitzung.spiel, id));
  return l.length || nurFaellig ? l : ids.flatMap((id) => imSpiel(ctx, sitzung.spiel, id));
}

// Aufgabe zur Wiederholung: fällige zuerst (Familie des aktuellen Themas vorn), sonst gemischt
function aufgabeZurWiederholung(ctx, stand, sitzung, rnd, heute, nurFaellig) {
  const wieder = new Set(sitzung.wieder.map((w) => w.key));
  const alle = wiederholungsAufgaben(ctx, stand, sitzung, nurFaellig).filter((a) => !wieder.has(a.key));
  const kand = alle.filter((a) => a.key !== sitzung.letzte);
  const faell = kand.filter((a) => faellig(eintrag(stand, a.key), heute));
  const bezug = sitzung.thema ?? aufgabeZu(ctx, sitzung.letzte)?.thema;
  const familie = themaVon(ctx, bezug)?.familie;
  const ausFamilie = familie ? faell.filter((a) => themaVon(ctx, a.thema)?.familie === familie) : [];
  if (ausFamilie.length) return niedrigesFach(stand, ausFamilie, rnd);
  if (faell.length) return niedrigesFach(stand, faell, rnd);
  if (nurFaellig) return null;
  const l = kand.length ? kand : alle;
  return l.length ? zufallsEins(l, rnd) : null;
}

// weitere Aufgaben desselben Themas für das Angebot (höchstens 2, offene zuerst)
function auchZu(ctx, stand, sitzung, ziel, rnd) {
  if (stand.themen[ziel.thema]?.z !== "kann-ich") {
    const offen = darstellbareAufgaben(ctx, ziel.thema).filter((a) => !stand.aufgaben[a.key]?.kk);
    if (offen.length <= 1) return []; // die letzte offene Aufgabe lässt sich nicht umgehen
  }
  const kk = (a) => (stand.aufgaben[a.key]?.kk ? 1 : 0);
  return mische(imSpiel(ctx, sitzung.spiel, ziel.thema).filter((a) => a.key !== ziel.key), rnd)
    .sort((a, b) => kk(a) - kk(b)).slice(0, 2);
}

// Nächstes Angebot { ziel, auch, stufe } oder null am Rundenende
export function naechstesAngebot(ctx, stand, sitzung, rnd = Math.random, { jetzt, heute } = {}) {
  if (sitzung.ereignis?.typ === "gekonnt") return null;
  const max = sitzung.modus === "wiederholung" ? Math.min(sitzung.max ?? WIEDERHOLUNG_MAX, WIEDERHOLUNG_MAX) : sitzung.max;
  if (max != null && sitzung.gezeigt >= max) return null;
  if (jetzt != null && Number.isFinite(sitzung.start) && jetzt - sitzung.start >= K.RUNDE_MS) return null;

  let ziel = null;
  const probe = !!sitzung.probe?.length;
  if (probe) ziel = aufgabeZu(ctx, sitzung.probe[0]);
  if (!ziel) {
    const i = sitzung.wieder.findIndex((w) => w.ab <= sitzung.gezeigt);
    if (i >= 0) ziel = aufgabeZu(ctx, sitzung.wieder.splice(i, 1)[0].key);
  }
  if (!ziel) {
    if (sitzung.modus === "wiederholung") ziel = aufgabeZurWiederholung(ctx, stand, sitzung, rnd, heute, false);
    else ziel = (rnd() < K.ANTEIL_THEMA ? null : aufgabeZurWiederholung(ctx, stand, sitzung, rnd, heute, true))
      ?? aufgabeDesThemas(ctx, stand, sitzung, rnd);
  }
  if (!ziel) return null;
  sitzung.gezeigt++;
  sitzung.letzte = ziel.key;
  return { ziel, auch: probe ? [] : auchZu(ctx, stand, sitzung, ziel, rnd), stufe: probe ? "kopf" : sitzung.stufe };
}

// ---------- Ergebnis verbuchen ----------

function wirdGekonnt(stand, themaId, heute) {
  const t = stand.themen[themaId] || (stand.themen[themaId] = {});
  Object.assign(t, { z: "kann-ich", k: heute, stufe: "kopf" });
  return { typ: "gekonnt", thema: themaId };
}

// hilfe: 0 = ohne, 1 = Denkhilfe, 2 = Lösung gezeigt. Liefert ein Ereignis oder null.
export function verbucheErgebnis(ctx, stand, sitzung, key, { ok, hilfe = 0, ms, heute, rnd = Math.random } = {}) {
  const aufgabe = aufgabeZu(ctx, key);
  const thema = aufgabe ? themaVon(ctx, aufgabe.thema) : null;
  const e = stand.aufgaben[key] || (stand.aufgaben[key] = { f: 0, t: "", h: [], ms: [] });
  const richtig = !!ok && !hilfe;
  const ziel = aufgabe ? zielMs(aufgabe) : undefined;
  const muehsam = richtig && ziel !== undefined && Number.isFinite(ms) && ms > ziel;
  const sitzt = richtig && !(muehsam && thema?.tempo === true); // zählt für Probe und kk

  // Fächer
  if (richtig && !muehsam) {
    if (faellig(e, heute)) { e.f = Math.min(e.f + 1, K.GELERNT); e.t = heute; }
    if (e.f >= K.GELERNT) e.g = 1;
  } else if (!richtig) {
    e.f = 0; e.t = heute;
    const [von, bis] = K.WIEDER_NACH;
    sitzung.wieder = sitzung.wieder.filter((w) => w.key !== key);
    sitzung.wieder.push({ key, ab: sitzung.gezeigt + von + Math.floor(rnd() * (bis - von + 1)) });
  }
  e.h = [...(Array.isArray(e.h) ? e.h : []), richtig ? 1 : 0].slice(-H_LAENGE);
  if (Number.isFinite(ms)) e.ms = [...(Array.isArray(e.ms) ? e.ms : []), Math.round(ms)].slice(-MS_LAENGE);
  const probe = !!sitzung.probe?.length && aufgabe?.thema === sitzung.thema;
  if (sitzt && (probe || sitzung.stufe === "kopf")) e.kk = 1;
  const tStand = thema ? stand.themen[thema.id] : null;
  if (tStand) tStand.u = heute;

  let ereignis = null;
  if (probe) {
    const t = stand.themen[sitzung.thema] || (stand.themen[sitzung.thema] = {});
    t.pb = 1; // Probe begonnen: bricht das Kind jetzt ab, übt es beim nächsten Start auf der untersten Stufe
    if (sitzt) {
      sitzung.probe = sitzung.probe.filter((k) => k !== key);
      if (!sitzung.probe.length) {
        // Probe bestanden: Aufgaben des Themas in Fach 1 (große Themen: nur die beantworteten),
        // Bestätigung über die Wiederholung
        sitzung.probe = null;
        inFachEins(ctx, stand, thema.id, heute);
        delete t.pb;
        ereignis = wirdGekonnt(stand, thema.id, heute);
      }
    } else {
      // Probe endet beim ersten Fehler, der ersten Hilfe oder einer mühsamen Antwort
      sitzung.probe = null;
      delete t.pb;
      const unten = stufenFuer(ctx, sitzung.spiel, sitzung.thema)[0] ?? "kopf";
      t.stufe = unten; t.v = [];
      if (unten !== sitzung.stufe) ereignis = { typ: "stufe", stufe: unten };
      sitzung.stufe = unten;
    }
  } else if (sitzung.modus !== "wiederholung" && aufgabe?.thema === sitzung.thema && tStand?.z === "dran") {
    // Stufen: Aufstieg bei AUF_OK von AUF_FENSTER, Abstieg nach AB_FEHLER Fehlern in Folge
    tStand.v = [...(Array.isArray(tStand.v) ? tStand.v : []), richtig ? 1 : 0].slice(-K.AUF_FENSTER);
    const stufen = stufenFuer(ctx, sitzung.spiel, sitzung.thema), i = stufen.indexOf(sitzung.stufe);
    let neu = null;
    if (i >= 0 && i < stufen.length - 1 && tStand.v.length >= K.AUF_FENSTER && tStand.v.filter((x) => x === 1).length >= K.AUF_OK) neu = stufen[i + 1];
    else if (i > 0 && tStand.v.length >= K.AB_FEHLER && tStand.v.slice(-K.AB_FEHLER).every((x) => x === 0)) neu = stufen[i - 1];
    if (neu) {
      sitzung.stufe = tStand.stufe = neu;
      tStand.v = [];
      ereignis = { typ: "stufe", stufe: neu };
    }
  }

  // Kann ich nach dem Üben (siehe gekonntNachUeben: kleine Themen jede Aufgabe, große eine Stichprobe)
  if (!probe && thema && tStand?.z === "dran" && gekonntNachUeben(ctx, stand, thema.id)) ereignis = wirdGekonnt(stand, thema.id, heute);
  sitzung.ereignis = ereignis;
  return ereignis;
}

// ---------- Lücken-Übersicht ----------

export function luecken(ctx) {
  const out = { ohneSpiel: [], teilweise: [], ohneStufe: [], ohneEinfuehrung: [] };
  for (const t of themenVon(ctx)) {
    const spiele = spieleFuer(ctx, t.id);
    if (!spiele.length) { out.ohneSpiel.push(t.id); continue; }
    const fehlen = aufgabenDes(t).length - darstellbareAufgaben(ctx, t.id).length;
    if (fehlen > 0) out.teilweise.push({ thema: t.id, fehlen });
    const angeboten = new Set(spiele.flatMap((s) => stufenDesSpiels(ctx, s, t.id)));
    for (const stufe of ["material", "kopf"]) if (!angeboten.has(stufe)) out.ohneStufe.push({ thema: t.id, stufe });
    if (!t.einfuehrung) out.ohneEinfuehrung.push(t.id);
  }
  return out;
}

// ---------- Elternbereich ----------

const GERADE_DRAN_TAGE = 7;

// Aufgabe lesbar für Eltern: zerl:7:3+4 → "7 = 3 + 4", plus:3+4 → "3 + 4", minus:7-4 → "7 − 4", menge:5 → "5"
export function aufgabeLesbar(key) {
  let m;
  if ((m = /^zerl:(\d+):(\d+)\+(\d+)$/.exec(key))) return `${m[1]} = ${m[2]} + ${m[3]}`;
  if ((m = /^plus:(\d+)\+(\d+)$/.exec(key))) return `${m[1]} + ${m[2]}`;
  if ((m = /^minus:(\d+)-(\d+)$/.exec(key))) return `${m[1]} − ${m[2]}`;
  if ((m = /^menge:(\d+)$/.exec(key))) return m[1];
  return key;
}

// Themenliste für den Elternbereich, je Strang in Planreihenfolge, alle Themen (auch verborgene).
// [{ strang, themen: [{ id, name, zustand, stufe, wackelig: key[], hinweis, luecke, geradeDran, frei }] }]
//   wackelig   = gesehene Aufgaben (h nicht leer) eines gekonnten oder dran-Themas, deren letzte Antwort nicht sauber war
//                (h endet mit 0) oder die in Fach 0 stehen; Fach 1 nach Probe oder „gekonnt“ zählt nicht
//   luecke     = "ohne-spiel" | "teilweise" (nicht alle Aufgaben darstellbar) | null
//   geradeDran = dran und seit höchstens GERADE_DRAN_TAGE Tagen
//   frei       = von den Eltern freigegeben
export function elternThemen(ctx, stand, heute) {
  const z = zustaende(ctx, stand), out = [], nachStrang = new Map();
  for (const t of themenVon(ctx)) {
    if (!nachStrang.has(t.strang)) { const s = { strang: t.strang, themen: [] }; nachStrang.set(t.strang, s); out.push(s); }
    const e = stand?.themen?.[t.id];
    const zustand = z[t.id];
    const luecke = !spieleFuer(ctx, t.id).length ? "ohne-spiel"
      : darstellbareAufgaben(ctx, t.id).length < aufgabenDes(t).length ? "teilweise" : null;
    const wackelig = zustand === "dran" || zustand === "kann-ich"
      ? aufgabenDes(t).map((a) => a.key).filter((k) => {
        const x = stand?.aufgaben?.[k];
        return !!x && Array.isArray(x.h) && x.h.length > 0 && (x.h.at(-1) === 0 || x.f === 0);
      })
      : [];
    nachStrang.get(t.strang).themen.push({
      id: t.id, name: text(t.name), zustand, stufe: text(e?.stufe), wackelig, hinweis: text(t.eltern), luecke,
      geradeDran: zustand === "dran" && tage(e?.seit, heute) <= GERADE_DRAN_TAGE, frei: e?.frei === 1,
    });
  }
  return out;
}

// Eingriffe der Eltern. Sie ändern nur den Lernstand, nie Plan oder Spiele (Caches hängen an diesen Objekten).

// Thema als gekonnt markieren. Mit ctx kommen die Aufgaben des Themas ohne Eintrag oder in Fach 0 in
// Fach 1 (wie nach der Probe und bei der Übernahme), damit die Wiederholung nicht überläuft;
// in großen Themen nur Aufgaben mit Eintrag.
export function markiereGekonnt(stand, themaId, heute, ctx = null) {
  const t = stand.themen[themaId] || (stand.themen[themaId] = {});
  Object.assign(t, { z: "kann-ich", k: heute, stufe: "kopf", v: [] });
  delete t.pb;
  if (ctx) inFachEins(ctx, stand, themaId, heute);
  return stand;
}

// Thema zurücksetzen: Themen-Eintrag weg (auch Einführung und Freigabe), Aufgaben des Themas in Fach 0.
// kk und g fallen weg, „kann ich“ muss neu erworben werden; h und ms bleiben als Verlauf.
export function setzeZurueck(ctx, stand, themaId) {
  delete stand.themen[themaId];
  for (const a of aufgabenDes(themaVon(ctx, themaId))) {
    const x = stand.aufgaben[a.key];
    if (!x) continue;
    x.f = 0;
    delete x.kk;
    delete x.g;
  }
  return stand;
}

// Verborgenes Thema freigeben (kommt in Sicht; erfüllt die Voraussetzungen anderer Themen nicht)
export function gibFrei(stand, themaId) {
  const t = stand.themen[themaId] || (stand.themen[themaId] = {});
  t.frei = 1;
  return stand;
}

// ---------- Runde (Async-Schicht für die Spiele) ----------

const STAND_KEY = "lernplan";
let ctxCache = null;

async function ladeCtx() {
  if (!ctxCache) {
    const [plan, spiele] = await Promise.all(["lernplan.json", "spiele.json"].map((f) => fetch(f).then((r) => r.json())));
    ctxCache = { plan, spiele };
  }
  return ctxCache;
}

const echteUhr = () => ({ heute: new Date().toLocaleDateString("sv"), jetzt: Date.now() });

// Lernstand laden und reparieren
async function ladeStand() {
  return migriereStand(await lade(STAND_KEY, neuerStand()));
}

// Lernstand für Seiten, die nur lesen (Themen-Übersicht, Elternbereich): wird hier nie geschrieben
export async function ladeLernstand(ctx, heute) {
  return ladeStand();
}

// Wert, den nur der erste Aufruf bekommt (danach null): ?thema= gilt nur für die erste Runde einer Seite
export function einmal(wert) {
  return () => { const w = wert ?? null; wert = null; return w; };
}

// Eine Runde in einem Spiel. nurAnsehen (Vorschau): nichts wird gespeichert.
export async function runde(spielId, { wunsch = null, max = null, ctx = null, uhr = echteUhr, rnd = Math.random, nurAnsehen = false } = {}) {
  ctx = ctx ?? (await ladeCtx());
  const stand = await ladeStand();
  const sichere = () => { if (!nurAnsehen) speichere(STAND_KEY, stand); };

  const { thema: themaId, modus } = themaFuer(ctx, stand, spielId, { wunsch });
  const plan = themaId ? themaVon(ctx, themaId) : null;
  const eintragVorher = themaId ? stand.themen[themaId] : null;
  // Probe begonnen (pb: mindestens eine Antwort verbucht), aber vor dem Ende abgebrochen: auf der untersten
  // Stufe üben. Ohne pb (Abbruch vor der ersten Antwort) kommt die Probe noch einmal.
  if (eintragVorher?.z === "dran" && !eintragVorher.stufe && eintragVorher.pb) {
    eintragVorher.stufe = stufenFuer(ctx, spielId, themaId)[0] ?? "kopf";
    delete eintragVorher.pb;
  }

  const neu = !!plan && !["dran", "kann-ich"].includes(eintragVorher?.z);
  // Vorgriff (Spiel hätte sonst nichts): das Thema wird dran wie ein neues Thema, mit Einführung
  const startet = modus === "thema" || modus === "vorgriff";
  const sitzung = neueSitzung(ctx, stand, spielId, { thema: themaId, modus }, { jetzt: uhr().jetzt, max, rnd });
  const r = {
    thema: plan ? { id: plan.id, name: plan.name, stufe: sitzung.probe ? "kopf" : sitzung.stufe, neu } : null,
    modus,
    einfuehrungFaellig: startet && !!plan?.einfuehrung && !eintragVorher?.e,
    einfuehrungGesehen() {
      if (!themaId) return;
      const t = stand.themen[themaId] || (stand.themen[themaId] = {});
      t.e = uhr().heute;
      r.einfuehrungFaellig = false;
      sichere();
    },
    naechste() {
      const { heute, jetzt } = uhr();
      if (startet && themaId && stand.themen[themaId]?.z !== "dran") { startThema(stand, themaId, heute); sichere(); }
      return naechstesAngebot(ctx, stand, sitzung, rnd, { jetzt, heute });
    },
    melde(key, { ok, hilfe = 0, ms } = {}) {
      const ereignis = verbucheErgebnis(ctx, stand, sitzung, key, { ok, hilfe, ms, heute: uhr().heute, rnd });
      sichere();
      return ereignis;
    },
    async ende() {
      if (!nurAnsehen) await sofortSpeichern();
      let hinweisSpiel = null;
      if (modus === "wiederholung") {
        const andere = (ctx.spiele?.spiele ?? []).map((s) => s.id).filter((id) => id !== spielId);
        hinweisSpiel = andere.find((id) => themaFuer(ctx, stand, id).modus === "thema") ?? null;
      }
      return { hinweisSpiel };
    },
  };
  return r;
}
