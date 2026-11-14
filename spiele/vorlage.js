// Spielvorlage: ein kleines, echtes Spiel, an dem alle Bausteine angeschlossen sind.
// Platzhalter-Aufgabe „Leg die 7“: Das Kind legt aus zwei Perlenstäben vom Tablett einen Stab, der so lang ist
// wie der lange Stab auf der Matte (Ziehen oder Tippen, dann Ziel tippen). Was nicht passt, gleitet zurück.
//
// Aufbau dieser Datei:
//   SPIELWELT (ersetzen)  Kennung, Aufgabenarten, Rundenlänge, Vorschau-Aufgaben, alle gesprochenen Sätze
//   AUFGABE   (ersetzen)  eine Aufgabe darstellen, prüfen (die Mechanik urteilt), Hilfe-Stufen zeigen
//   RAHMEN    (behalten)  Hilfe-Leiter, Lernsteuerung, Einführung, Weiter, Pause, Vorschau-Parameter
//
// SO WIRD DARAUS EIN SPIEL
//  1. vorlage.html und vorlage.js nach spiele/<id>.html und spiele/<id>.js kopieren; in der HTML-Datei das
//     Modul umbenennen und an <ls-leiste> spiel="<id>", fach und titel setzen.
//  2. Eintrag in spiele/spiele.json (id, titel, thema, kategorie, symbol, datei, text) mit `arten` wie ARTEN
//     unten (Aufgabenarten, Zahlenraum, Stufen; Schema in spiele/aufgabenarten.js › darstellbar). Erst mit dem
//     Eintrag erscheint das Spiel auf der Startseite und schreibt den Lernstand. Die Vorlage selbst steht
//     nicht in spiele.json und läuft deshalb immer als Vorschau (schreibt nie).
//  3. SPIELWELT und AUFGABE ersetzen. Jeder gesprochene Satz steht als feste Zeichenkette direkt im Aufruf
//     blase.sage oder sprich (wie im `erzaehler` unten) oder als Daten (lernplan.json, einfuehrungen/*.json),
//     nie in einer Variablen. Keine zur Laufzeit zusammengesetzten Sätze mit Zahlen: die findet
//     `npm run audio` nicht, und die Systemstimme spricht keine Zahlen. Zahlen zeigt das Spiel als Ziffer (Matte, Gleichung, Kopfleiste).
//  4. `npm run audio`, dann `npm run audio:anhoeren` (docs/stimme.md 4).
//  5. Checklisten durchgehen: docs/bedienung.md 10 und docs/grundsaetze.md 12; im Browser in Chromium und
//     WebKit bei 1920 × 1080 und 1280 × 800 ansehen (Muster: tests/browser/vorlage.spec.mjs).
//  6. Lernplan: Das Spiel bekommt Themen über `arten`. Hat ein Thema eine Einführung (`einfuehrung` in
//     lernplan.json), spielt der RAHMEN sie beim ersten Mal ab. Neue Aufgabenart: aufgabenarten.js erweitern.
//
// Vorschau-Parameter (schreiben nie in den Lernstand, runde(…, { nurAnsehen })):
//   ?pause            Pause sofort zeigen (Sichtprüfung), Weiter startet die Runde
//   ?hinweis[=<id>]   Pause mit dem Hinweis auf ein anderes Spiel
//   ?eltern           Elternansicht des Spiels
//   ?einfuehrung      Einführung des Themas auch in der Vorschau abspielen
//   ?thema=<id>       Wunsch-Thema aus der Themen-Übersicht (gilt nur für die erste Runde, schreibt normal)

import "./rahmen/leiste.js";
import "./rahmen/blase.js";
import "./rahmen/hilfe.js";
import "./rahmen/pause.js";
import "./rahmen/knopf.js";
import "./rahmen/perlenstab.js";
import { ziehbar, setze, zurueck } from "./rahmen/ziehen.js";
import { laenge, LUECKE } from "./rahmen/perlen-geometrie.js";
import { sperreTouch, protokoll, esc } from "./lernspiel.js";
import { sprich } from "./kern/stimme.js";
import { runde, einmal } from "./lernsteuerung.js";
import { spieleEinfuehrung } from "./einfuehrung.js";

sperreTouch();

const $ = (/** @type {string} */ id) => /** @type {any} */ (document.getElementById(id));
const leiste = $("leiste");
const blase = $("blase");
const hilfe = $("hilfe");
const pause = $("pause");
const weiter = $("weiter");
const matte = $("matte");
const tablett = $("tablett");

// =====================================================================================================
// SPIELWELT (ersetzen)
// =====================================================================================================

/** Kennung des Spiels: steht einmal in der HTML-Datei an <ls-leiste spiel>. */
const SPIEL_ID = leiste.getAttribute("spiel");

/** Aufgabenarten, die das Spiel darstellt. Für ein echtes Spiel genau so in spiele.json eintragen. */
const ARTEN = [{ art: "zerlegung", zahlen: [7, 7], stufen: ["material"] }];

/** Aufgaben je Runde (Platzhalter; echte Spiele eher 8 bis 10, die Lernsteuerung begrenzt zusätzlich auf 4 Minuten). */
const AUFGABEN_JE_RUNDE = 3;

/** Nur Vorschau: Aufgaben, falls die Lernsteuerung nichts liefert (Lernplan fehlt oder kennt das Thema nicht). */
const VORSCHAU = { thema: "Die 7 zerlegen", aufgaben: ["zerl:7:3+4", "zerl:7:2+5", "zerl:7:1+6"] };

// Der Erzähler (docs/stimme.md): beschreibt die Sache und das Warum, nie ein Urteil (grundsaetze.md 3.2).
// Jeder Satz ist eine feste Zeichenkette, damit `npm run audio` ihn findet.
const erzaehler = {
  /** @param {boolean} sprechen nur bei der ersten Aufgabe der Runde laut; danach steht er still in der Blase */
  auftrag: (sprechen) => blase.sage("Leg zwei Stäbe in die Rinne. Zusammen sollen sie so lang sein wie der lange Stab.", { sprechen }),
  zuLang: () => blase.sage("Dieser Stab ist zu lang. Er passt nicht in die freie Stelle."),
  zuKurz: () => blase.sage("Dieser Stab ist zu kurz. Dann bliebe noch etwas frei."),
  gelegt: () => blase.sage("Zwei Stäbe, zusammen so lang wie der lange Stab."),
  // Hilfe-Leiter Stufe 1: eine Denkhilfe, die Probe – nicht die Lösung.
  probeAnfang: () => blase.sage("Nimm einen Stab und leg ihn in die Rinne. Dann schau, wie viel noch frei ist."),
  probe: () => blase.sage("Zähl die Perlen über der freien Stelle. So viele Perlen fehlen noch."),
  // Stufe 2: die Lösung mit Begründung; das Kind legt selbst.
  loesungAnfang: () => blase.sage("Fang mit diesem Stab an. Leg ihn in die Rinne."),
  loesung: () => blase.sage("Dieser Stab ist so lang wie die freie Stelle. Leg ihn hinein."),
  gehtNicht: () => blase.sage("Das Spiel geht gerade nicht."),
};

/**
 * Sachmoment der Pause (K1, K8): ruhig, keine Belohnung, kommt nach jeder Runde.
 * Platzhalter: eine Tatsache über das Material selbst. Ein echtes Spiel nimmt einen geprüften Fakt seiner Welt (K4).
 * @param {HTMLElement} karte
 * @param {boolean} ton
 */
function fuelleSachmoment(karte, ton) {
  karte.replaceChildren();
  const stab = document.createElement("ls-perlenstab");
  stab.setAttribute("wert", "7");
  stab.setAttribute("ziffer", "");
  stab.style.height = "8rem";
  // Derselbe Satz steht zweimal: zum Lesen und als feste Zeichenkette im Aufruf sprich, damit `npm run audio` ihn findet.
  const satz = document.createElement("p");
  satz.style.margin = "0";
  satz.textContent = "Nach der fünften Perle hat ein Stab eine Marke. So sieht man die Fünf, ohne zu zählen.";
  karte.append(stab, satz);
  if (ton) sprich("Nach der fünften Perle hat ein Stab eine Marke. So sieht man die Fünf, ohne zu zählen.");
}

// =====================================================================================================
// AUFGABE (ersetzen)
// =====================================================================================================
// stelleAufgabe(aufgabe, melde) zeigt eine Aufgabe und meldet dem RAHMEN nur zwei Dinge:
//   melde.passtNicht()   ein Versuch, der nicht passt (die Mechanik hat es schon gezeigt, der Erzähler beschrieben)
//   melde.geloest(key)   gelöst; key = Schlüssel der Aufgabe, die das Kind tatsächlich gelegt hat
// Zurück kommt { hilfe(stufe) }: der RAHMEN ruft sie beim Tippen auf Hilfe mit Stufe 1 (Probe), dann 2 (Lösung).
// aufgabe = Angebot der Lernsteuerung { ziel: { key }, auch: [{ key }], stufe }. Die Vorlage kann nur die
// Stufe „material“; ein echtes Spiel verdeckt auf „vorstellung“ die Perlen und zeigt auf „kopf“ nur Ziffern.

/** "zerl:7:3+4" → { n: 7, a: 3, b: 4 }, sonst null. @param {string} key */
function zerlegungAus(key) {
  const m = /^zerl:(\d+):(\d+)\+(\d+)$/.exec(key ?? "");
  return m ? { n: Number(m[1]), a: Number(m[2]), b: Number(m[3]) } : null;
}

/** @template T @param {T[]} liste @returns {T[]} */
function gemischt(liste) {
  const l = [...liste];
  for (let i = l.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [l[i], l[j]] = [l[j], l[i]];
  }
  return l;
}

/**
 * @param {{ ziel: { key: string }, auch?: { key: string }[] }} aufgabe
 * @param {{ passtNicht: () => void, geloest: (key: string) => void }} melde
 */
function stelleAufgabe(aufgabe, melde) {
  const ziel = zerlegungAus(aufgabe.ziel.key);
  if (!ziel) throw new Error(`Vorlage: unbekannte Aufgabe ${aufgabe.ziel.key}`);
  const { n } = ziel;

  // Stäbe auf dem Tablett: nur ganze Paare (jeder erste Stab hat einen Partner), mindestens drei Paare, gemischt.
  const paare = new Map();
  const nimm = (/** @type {number} */ a) => paare.set(Math.min(a, n - a), Math.max(a, n - a));
  for (const k of [aufgabe.ziel, ...(aufgabe.auch ?? [])]) {
    const z = zerlegungAus(k.key);
    if (z && z.n === n) nimm(z.a);
  }
  for (let a = 1; a < n && paare.size < 3; a++) nimm(a);
  const werte = gemischt([...paare].flat());

  // Matte: Ziffer und langer Stab, darunter die Rinne, so lang wie der Stab; darunter die Gleichung.
  matte.innerHTML = `
    <span class="ziffer" aria-hidden="true">${n}</span><ls-perlenstab class="stab" wert="${n}"></ls-perlenstab>
    <span></span><div class="rinne" name="Rinne" style="--laenge: ${laenge(n)}"><span class="frei"></span></div>
    <div class="gleichung" aria-live="polite"></div>`;
  const rinne = /** @type {HTMLElement} */ (matte.querySelector(".rinne"));
  const frei = /** @type {HTMLElement} */ (matte.querySelector(".frei"));
  const gleichung = /** @type {HTMLElement} */ (matte.querySelector(".gleichung"));

  /** @type {number[]} */
  const gelegt = [];
  let loesungGezeigt = false;
  const rest = () => n - gelegt.reduce((s, x) => s + x, 0);
  /** @type {Map<HTMLElement, () => void>} */
  const loeser = new Map();

  const stabMit = (/** @type {number} */ wert) =>
    /** @type {HTMLElement | undefined} */ ([...tablett.querySelectorAll(".stab")].find((s) => Number(s.getAttribute("wert")) === wert));
  const ohneMarkierung = () => matte.parentElement?.querySelectorAll(".markiert").forEach((e) => e.classList.remove("markiert"));
  /** Lösung zeigen: der passende Stab bekommt den Sonnenring; legen muss das Kind selbst. */
  const zeigeLoesung = () => {
    ohneMarkierung();
    const passend = stabMit(gelegt.length ? rest() : ziel.a);
    passend?.classList.add("markiert");
    if (gelegt.length) erzaehler.loesung();
    else erzaehler.loesungAnfang();
  };

  /** @param {HTMLElement} teil */
  const lege = (teil) => {
    const wert = Number(teil.getAttribute("wert"));
    // Zwei kurze Stäbe bekommen die Lücke nach der fünften Perle als Fuge, damit die Länge stimmt (M2).
    if (gelegt.length === 1 && n > 5 && gelegt[0] <= 5 && wert <= 5) rinne.style.setProperty("--fuge", `calc(${LUECKE} * var(--d))`);
    setze(teil, rinne, { vor: frei });
    loeser.get(teil)?.();
    loeser.delete(teil);
    teil.classList.remove("markiert");
    teil.classList.add("gesetzt");
    teil.removeAttribute("tabindex");
    teil.removeAttribute("role");
    gelegt.push(wert);
  };

  for (const wert of werte) {
    const stab = document.createElement("ls-perlenstab");
    stab.className = "stab teil";
    stab.setAttribute("wert", String(wert));
    stab.setAttribute("aria-label", `Perlenstab ${wert}`);
    tablett.append(stab);
    const loesen = ziehbar(stab, {
      ziele: () => (rest() > 0 ? [rinne] : []),
      beimAblegen(teil) {
        const w = Number(teil.getAttribute("wert"));
        const platz = rest();
        // Die Mechanik urteilt: der erste Stab passt immer (jeder hat seinen Partner auf dem Tablett),
        // der zweite nur, wenn er die freie Stelle genau füllt. Sonst gleitet er ruhig zurück (B5, N7).
        if (gelegt.length === 0 || w === platz) {
          ohneMarkierung();
          lege(teil);
          if (rest() === 0) return fertig();
          if (loesungGezeigt) zeigeLoesung();
          return;
        }
        zurueck(teil);
        if (w > platz) erzaehler.zuLang();
        else erzaehler.zuKurz();
        melde.passtNicht();
      },
    });
    loeser.set(stab, loesen);
  }

  function fertig() {
    // Die übrigen Stäbe sind nicht mehr ziehbar: flach (6.4, Schatten heißt drückbar) und aus der Tab-Folge.
    for (const [stab, loesen] of loeser) {
      loesen();
      stab.classList.add("gesetzt");
      stab.removeAttribute("tabindex");
      stab.removeAttribute("role");
    }
    loeser.clear();
    frei.hidden = true;
    // Nach dem Legen auch das Zeichen (M7): die Gleichung als Ziffern, nicht gesprochen.
    gleichung.textContent = `${n} = ${gelegt[0]} + ${gelegt[1]}`;
    erzaehler.gelegt();
    melde.geloest(`zerl:${n}:${gelegt[0]}+${gelegt[1]}`);
  }

  return {
    /** @param {1 | 2} stufe */
    hilfe(stufe) {
      if (rest() === 0) return;
      if (stufe === 1) {
        ohneMarkierung();
        if (gelegt.length === 0) return erzaehler.probeAnfang();
        frei.classList.add("markiert");
        return erzaehler.probe();
      }
      loesungGezeigt = true;
      zeigeLoesung();
    },
  };
}

/** Räumt Matte und Tablett für die nächste Aufgabe. */
function raeumeAuf() {
  matte.replaceChildren();
  tablett.replaceChildren();
}

// =====================================================================================================
// RAHMEN (behalten)
// =====================================================================================================

const params = new URLSearchParams(location.search);
const wunsch = einmal(params.get("thema")); // ?thema= gilt nur für die erste Runde der Seite

/** @type {{ plan: any, spiele: any } | null} */
let ctx = null;
async function ladeCtx() {
  if (ctx) return ctx;
  const [plan, spiele] = await Promise.all(["lernplan.json", "spiele.json"].map((f) => fetch(f).then((r) => r.json())));
  ctx = { plan, spiele };
  return ctx;
}
/** Steht das Spiel in spiele.json? Sonst (die Vorlage, ein Spiel vor dem Eintrag) läuft es als Vorschau. */
const eingetragen = (/** @type {{ spiele: any }} */ c) => c.spiele.spiele.some((/** @type {any} */ s) => s.id === SPIEL_ID);

// --- Hilfe-Leiter (grundsaetze.md L12, bedienung.md 6) ---------------------------------------------
// Versuch 1, der nicht passt: nur die Mechanik. Versuch 2: Hilfe leuchtet einmal auf. Tippen auf Hilfe:
// Stufe 1 Probe, Stufe 2 Lösung. Gemeldet wird hilfe = höchste gezeigte Stufe (0, 1, 2); mit Hilfe Gelöstes
// zählt in der Lernsteuerung nicht als gekonnt.

/** @type {(() => void) | null} */
let hilfeTippen = null;
hilfe.addEventListener("hilfe", () => hilfeTippen?.());

/**
 * Spielt eine Aufgabe bis zur Lösung.
 * @param {any} aufgabe
 * @returns {Promise<{ key: string, versuche: number, hilfe: number, ms: number }>}
 */
function spieleAufgabe(aufgabe) {
  return new Promise((fertig) => {
    const start = Date.now();
    let versuche = 0;
    let stufe = 0;
    const a = stelleAufgabe(aufgabe, {
      passtNicht() {
        versuche++;
        if (versuche === 2 && stufe === 0) hilfe.leuchte();
      },
      geloest(key) {
        hilfeTippen = null;
        fertig({ key, versuche, hilfe: stufe, ms: Date.now() - start });
      },
    });
    hilfeTippen = () => {
      stufe = Math.min(2, stufe + 1);
      a.hilfe(/** @type {1 | 2} */ (stufe));
    };
  });
}

// --- Weiter nach einer Aufgabe: nichts geht von selbst weiter --------------------------------------
function warteAufWeiter() {
  weiter.hidden = false;
  return new Promise((ok) =>
    weiter.addEventListener("click", () => {
      weiter.hidden = true;
      ok(undefined);
    }, { once: true }));
}

// --- Pause am Rundenende (bedienung.md 7.1): Sachmoment, Alle Spiele und Weiter gleichwertig -------
/** @param {{ hinweis?: string | null }} [optionen] hinweis = Spiel, in dem gerade etwas Neues dran ist */
async function zeigePause({ hinweis = null } = {}) {
  const karte = $("sachmoment");
  fuelleSachmoment(karte, leiste.ton);
  const spiel = hinweis ? (ctx?.spiele?.spiele ?? []).find((/** @type {any} */ s) => s.id === hinweis) : null;
  if (spiel) {
    const a = document.createElement("a");
    a.className = "hinweis";
    a.href = spiel.datei;
    a.innerHTML = `<img src="${esc(spiel.symbol)}" alt=""><span>${esc(spiel.titel)}</span>`;
    karte.append(a);
  }
  await pause.zeige(); // „Alle Spiele“ navigiert selbst (speichert vorher), „Weiter“ löst auf
}

// --- Elternansicht (?eltern): beschreibend, kein Vergleich -----------------------------------------
function elternansicht() {
  const e = document.createElement("section");
  e.className = "eltern auswahl";
  e.innerHTML = `<h1>${esc(leiste.getAttribute("titel"))}</h1>
    <p>Was dran ist und was Ihr Kind schon kann, steht bei den Themen im Elternbereich.</p>
    <p>Hier stünde, was das Spiel selbst mitzählt. Die Vorlage zählt nichts.</p>
    <p><a href="eltern.html">Themen im Elternbereich</a> · <a href="${esc(location.pathname.split("/").pop())}">Zum Spiel</a></p>`;
  document.body.append(e);
}

// --- Runde: Lernsteuerung oder (nur Vorschau) die festen Aufgaben ----------------------------------

/** @param {boolean} vorschau */
async function starteRunde(vorschau) {
  const c = await ladeCtx();
  // Nicht in spiele.json: nur im Speicher eintragen, damit die Lernsteuerung Aufgaben liefert.
  // Geschrieben wird dann nichts (vorschau ist gesetzt).
  const mitSpiel = eingetragen(c) ? c : { plan: c.plan, spiele: { ...c.spiele, spiele: [...c.spiele.spiele, { id: SPIEL_ID, arten: ARTEN }] } };
  const r = await runde(SPIEL_ID, { wunsch: wunsch(), max: AUFGABEN_JE_RUNDE, ctx: mitSpiel, nurAnsehen: vorschau });
  const plan = r.thema ? c.plan.themen.find((/** @type {any} */ t) => t.id === r.thema?.id) : null;
  return {
    thema: r.thema?.name ?? "",
    einfuehrung: r.einfuehrungFaellig ? plan?.einfuehrung ?? null : null,
    einfuehrungGesehen: () => r.einfuehrungGesehen(),
    naechste: () => r.naechste(),
    melde: (/** @type {string} */ key, /** @type {any} */ e) => r.melde(key, e),
    ende: () => r.ende(),
  };
}

/** Feste Aufgaben ohne Lernsteuerung, nur in der Vorschau. */
function vorschauRunde() {
  const keys = [...VORSCHAU.aufgaben];
  return {
    thema: VORSCHAU.thema,
    einfuehrung: null,
    einfuehrungGesehen() {},
    naechste() {
      const key = keys.shift();
      return key ? { ziel: { key }, auch: [], stufe: "material" } : null;
    },
    melde() { return null; },
    async ende() { return { hinweisSpiel: null }; },
  };
}

/** @param {boolean} vorschau */
async function spieleRunde(vorschau) {
  /** @type {any} */
  let r;
  try {
    r = await starteRunde(vorschau);
  } catch (e) {
    protokoll(`${SPIEL_ID}: Runde starten: ${/** @type {any} */ (e)?.message ?? e}`);
    if (!vorschau) return erzaehler.gehtNicht(); // Haus bleibt erreichbar, kein Dialog
    r = vorschauRunde();
  }

  // Einführung beim ersten Mal und bei neuem Thema (L5); in der Vorschau nur mit ?einfuehrung.
  if (r.einfuehrung && (!vorschau || params.has("einfuehrung"))) {
    const ergebnis = await spieleEinfuehrung(r.einfuehrung.vorlage, r.einfuehrung.werte, { ton: leiste.ton });
    if (ergebnis !== "gesehen") {
      location.href = "index.html";
      return;
    }
    r.einfuehrungGesehen();
  }

  let aufgabe = r.naechste();
  if (!aufgabe && vorschau) {
    r = vorschauRunde();
    aufgabe = r.naechste();
  }
  leiste.setAttribute("thema", r.thema);

  let erste = true;
  while (aufgabe) {
    raeumeAuf();
    erzaehler.auftrag(erste);
    erste = false;
    const e = await spieleAufgabe(aufgabe);
    const ergebnis = { key: e.key, ok: e.versuche === 0, hilfe: e.hilfe, ms: e.ms };
    r.melde(e.key, ergebnis); // Ereignisse „stufe“ und „gekonnt“: die Lernsteuerung beendet die Runde selbst
    document.dispatchEvent(new CustomEvent("ls-ergebnis", { detail: ergebnis })); // für die Browser-Prüfung
    await warteAufWeiter();
    aufgabe = r.naechste();
  }

  const { hinweisSpiel } = await r.ende();
  await zeigePause({ hinweis: hinweisSpiel });
  return spieleRunde(vorschau);
}

// --- Start ---------------------------------------------------------------------------------------
async function start() {
  await leiste.bereitet; // Ton-Einstellung geladen
  if (params.has("eltern")) return elternansicht();
  // Vorschau: jeder Vorschau-Parameter, ein nicht eingetragenes Spiel, oder Lernplan/Spiele nicht ladbar.
  const vorschau = ["pause", "hinweis", "eltern", "einfuehrung"].some((p) => params.has(p))
    || !(await ladeCtx().then(eingetragen, () => false));
  if (params.has("pause") || params.has("hinweis")) {
    await ladeCtx().catch(() => null);
    const andere = (ctx?.spiele?.spiele ?? []).find((/** @type {any} */ s) => s.id !== SPIEL_ID)?.id ?? null;
    await zeigePause({ hinweis: params.has("hinweis") ? params.get("hinweis") || andere : null });
  }
  await spieleRunde(vorschau);
}

start();
