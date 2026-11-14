// M37 Kettenhüpfer (Entwurf: docs/spiele/mathe/m37-kettenhuepfer.md). Welt Vorrat und Packungen: Dinge kommen in
// festen Gruppen (ein Schuhpaar hat zwei Schuhe …). Das Kind tippt das Ergebnis einer Malaufgabe a · n und bestätigt
// mit Fertig; dann hüpft das Zählpfeilchen auf der Perlenkette von n Stäbchen für Stäbchen, bei jedem Stäbchen fliegt
// eine Packung in den Korb, und am a-ten Stäbchen rastet das Pfeilchen mit der Zahl ein. Passt die Zahl nicht, hält
// das Pfeilchen am a-ten Stäbchen (ohne Zahl, mit Ring) und die getippte Zahl liegt als hohles Pfeilchen an ihrem Ort.
// Prototyp: eine Stufe (material), eine Runde, Systemstimme, Timo als Platzhalter aus der Runde.
//
// Aufbau wie die Spielvorlage (spiele/vorlage/spiel.js, dort die Schritte zum eigenen Spiel):
//   SPIELWELT  Kennung, Aufgabenarten, Rundenlänge, Vorschau-Aufgaben, Sätze des Erzählers
//   AUFGABE    Vorzeigen (Timo), eine Aufgabe darstellen, prüfen (die Kette urteilt), Hilfe-Stufen
//   RAHMEN     aus der Vorlage; eine Zeile ergänzt: vor der ersten Aufgabe der Runde `await vorzeigen(aufgabe)`
//              (L5, Timo legt vor; Annahme, Kandidat für die Vorlage), damit die Zeit der Aufgabe erst danach läuft.
//
// Vorschau-Parameter wie in der Vorlage (?pause, ?hinweis, ?eltern, ?einfuehrung, ?thema=, ?pruefen, ?stufe=).

import "../../rahmen/leiste.js";
import "../../rahmen/blase.js";
import "../../rahmen/hilfe.js";
import "../../rahmen/pause.js";
import "../../rahmen/knopf.js";
import "../../rahmen/tastatur.js";
import "../../rahmen/perlenstab.js";
import "../../rahmen/perlenkette.js";
import "../../objekte/objekt.js";
import "../../objekte/einkaufskorb.js";
import { wirf } from "../../objekte/objekt.js";
import { fuellstand } from "../../objekte/einkaufskorb.js";
import { malAus } from "../../aufgabenarten.js";
import { meldePruefSchnittstelle, selektor, testbetrieb } from "../../rahmen/pruefen.js";
import { sperreTouch, protokoll, esc } from "../../lernspiel.js";
import { sprich } from "../../kern/stimme.js";
import { runde, einmal } from "../../lernsteuerung.js";
import { spieleEinfuehrung } from "../../einfuehrung.js";
import { starteSpielzeit, amRundenende, sage } from "../../rahmen/spielzeit.js";
import { PACKUNG, vergleiche, hilfeVon, kandidaten, naechsteTaste, tastenZu, tippe, pfeileWaehrend } from "./logik.js";

sperreTouch();

const $ = (/** @type {string} */ id) => /** @type {any} */ (document.getElementById(id));
const leiste = $("leiste");
const blase = $("blase");
const hilfe = $("hilfe");
const pause = $("pause");
const kette = $("kette");
const kettePlatz = $("kette-platz");
const gleichung = $("gleichung");
const rechnung = $("rechnung");
const liste = $("liste");
const tastatur = $("tastatur");
const fertigKnopf = $("fertig");
const korb = $("korb");
const flug = $("flug");
const timoPlatz = $("timo");
const ding = $("ding");
const dingPlatz = $("ding-platz");

// Die Kette nimmt den Platz der Matte unter der Aufgabe ein (Breite und Höhe in rem an <ls-perlenkette>).
const remPx = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 10;
new ResizeObserver(() => {
  const r = kettePlatz.getBoundingClientRect();
  for (const [attr, px] of [["breite", r.width], ["hoehe", r.height]]) {
    const neu = px / remPx();
    if (Math.abs(neu - Number(kette.getAttribute(attr) ?? 0)) > 0.5) kette.setAttribute(attr, neu.toFixed(1));
  }
}).observe(kettePlatz);

// =====================================================================================================
// SPIELWELT
// =====================================================================================================

/** Kennung des Spiels: steht einmal in der HTML-Datei an <ls-leiste spiel>. */
const SPIEL_ID = leiste.getAttribute("spiel");

/** Aufgabenarten (gilt nur, solange das Spiel nicht in spiele.json steht; dort steht dasselbe). Prototyp: eine Stufe. */
const ARTEN = [{ art: "mal", reihen: [2, 10], stufen: ["material"] }];

/** Eigene Einführung in der Welt: kommt mit dem Ausbau (die Einmaleins-Themen haben noch keine Einführung). */
const EINFUEHRUNG = /** @type {{ vorlage: string, hintergrund?: string } | null} */ (null);

/** So lange steht die Folge einer Lösung (Pfeilchen hüpft, Packungen fliegen, Zeile kommt); Tippen überspringt. */
const FOLGE_MS = 1800;

/** Aufgaben je Runde: die Vorratsliste hat Platz für Timos Zeile und acht weitere. */
const AUFGABEN_JE_RUNDE = 8;

/** Nur Vorschau: Aufgaben, falls die Lernsteuerung nichts liefert. */
const VORSCHAU = { thema: "Zweierreihe", aufgaben: ["mal:3*2", "mal:7*2", "mal:5*2", "mal:9*2"] };

/** Ausgeschriebene Sätze aus Daten (je Reihe n und Faktor a, texte.json). */
const TEXTE = await fetch(new URL("texte.json", import.meta.url)).then((r) => r.json()).catch(() => null);

/** Der Erzähler (docs/stimme.md): beschreibt die Sache, nie ein Urteil (grundsaetze.md 3.2). */
const erzaehler = {
  /** Der RAHMEN ruft das vor jeder Aufgabe; den Auftrag sagt stelleAufgabe (er hängt an a und n). @param {boolean} sprechen */
  auftrag: (sprechen) => { auftragLaut = sprechen; },
  // Passt: im Wechsel (B4), die Sache benennen.
  passt: [
    () => blase.sage("Alles liegt jetzt im Korb."),
    () => blase.sage("Das Pfeilchen zeigt, wie viele es zusammen sind."),
    () => blase.sage("Die Zeile steht jetzt auf der Vorratsliste."),
  ],
  // Passt nicht: der Ort der getippten Zahl auf der Kette (3.1 Nr. 2).
  weiterHinten: () => blase.sage("Das Pfeilchen sitzt hier. Deine Zahl liegt weiter hinten."),
  weiterVorn: () => blase.sage("Das Pfeilchen sitzt hier. Deine Zahl liegt weiter vorn."),
  hinterDemEnde: () => blase.sage("Deine Zahl liegt hinter dem Ende der Kette."),
  // Hilfe Stufe 1: die Probe über eine Kernaufgabe, nie Hochzählen.
  probe: {
    nachbar: () => blase.sage("Das Pfeilchen zeigt eine Kernaufgabe. Deine Aufgabe ist ihre Nachbaraufgabe. Wie viele Stäbchen liegen dazwischen?"),
    zwei: () => blase.sage("Das Pfeilchen zeigt eine Kernaufgabe. Von dort sind es zwei Stäbchen. Wie viele Perlen liegen auf zwei Stäbchen?"),
    haelfte: () => blase.sage("Das Pfeilchen zeigt die Kernaufgabe mit zehn Stäbchen. Fünf Stäbchen sind die Hälfte von zehn. Wie viel ist die Hälfte?"),
    doppelt: () => blase.sage("Das Pfeilchen zeigt das erste Stäbchen. Das zweite Stäbchen ist genauso. Wie viel ist das Doppelte?"),
    tausch: () => blase.sage("Die Tauschaufgabe steht im Bild. Wie viele Zehnerstäbe sind es?"),
    eins: () => blase.sage("Ein Stäbchen. Wie viele Perlen liegen darauf?"),
  },
  // Hilfe Stufe 2: die Lösung mit Begründung; das Kind rechnet und tippt selbst.
  loesung: {
    vor: () => blase.sage("Von der Kernaufgabe geht es ein Stäbchen weiter. Zum Ergebnis kommen die Perlen von einem Stäbchen dazu. Rechne es aus und tipp die Zahl."),
    zurueck: () => blase.sage("Von der Kernaufgabe geht es ein Stäbchen zurück. Vom Ergebnis gehen die Perlen von einem Stäbchen weg. Rechne es aus und tipp die Zahl."),
    zweiVor: () => blase.sage("Von der Kernaufgabe geht es zwei Stäbchen weiter. Zum Ergebnis kommen die Perlen von zwei Stäbchen dazu. Rechne es aus und tipp die Zahl."),
    zweiZurueck: () => blase.sage("Von der Kernaufgabe geht es zwei Stäbchen zurück. Vom Ergebnis gehen die Perlen von zwei Stäbchen weg. Rechne es aus und tipp die Zahl."),
    haelfte: () => blase.sage("Das Ergebnis der Kernaufgabe ist am zehnten Stäbchen. Die Hälfte davon gehört zum fünften Stäbchen. Rechne es aus und tipp die Zahl."),
    doppelt: () => blase.sage("Das zweite Stäbchen hat genauso viele Perlen wie das erste. Das Ergebnis ist das Doppelte. Rechne es aus und tipp die Zahl."),
    tausch: () => blase.sage("Zehn Stäbchen sind so viele Perlen wie die Zehnerstäbe in der Tauschaufgabe zusammen. Rechne es aus und tipp die Zahl."),
    eins: () => blase.sage("Ein Stäbchen. Die Perlen darauf sind das Ergebnis. Rechne es aus und tipp die Zahl."),
  },
  // Rundenende: hell und aufgelöst; „voll“ nur, wenn die Runde ihre Aufgaben hatte (sonst nur der Korb).
  rundenende: (/** @type {boolean} */ voll, /** @type {boolean} */ kern) => (kern
    ? (voll ? blase.sage("Die Vorratsliste ist voll. Der Vorrat ist eingeräumt.") : blase.sage("Der Vorrat ist eingeräumt."))
    : (voll ? blase.sage("Die Vorratsliste ist voll. Im Korb liegen die Packungen.") : blase.sage("Im Korb liegen die Packungen."))),
  gehtNicht: () => blase.sage("Das Spiel geht gerade nicht."),
};

/** Elternansicht (?eltern): beschreibend, von Stärken aus, kein Vergleich (3.3). @param {HTMLElement} feld */
function fuelleEltern(feld) {
  feld.innerHTML = `<p>Ihr Kind füllt einen Vorratskorb: Es tippt das Ergebnis einer Malaufgabe, dann hüpft ein Pfeilchen
    auf einer Perlenkette Stäbchen für Stäbchen bis zur Stelle des Ergebnisses. Ein Stäbchen ist eine Packung, zum Beispiel
    ein Schuhpaar mit zwei Schuhen.</p>
    <p>Welche Reihen dran sind und was Ihr Kind schon kann, steht bei den Themen im Elternbereich.</p>`;
}

/**
 * Sachmoment der Pause (K1, K8): ruhig, keine Belohnung. Im Prototyp das Material selbst (ein neuer Fakt kommt nur am
 * Rundenanfang, K6). @param {HTMLElement} karte @param {boolean} ton
 */
function fuelleSachmoment(karte, ton) {
  karte.replaceChildren();
  const k = document.createElement("ls-perlenkette");
  k.setAttribute("reihe", String(n ?? 2));
  k.setAttribute("pfeile", "1 2 3 4 5 6 7 8 9 10");
  k.setAttribute("breite", "100");
  k.setAttribute("perle", "3");
  const satz = document.createElement("p");
  satz.style.margin = "0";
  satz.textContent = "Am Ende von jedem Stäbchen hängt ein Pfeilchen. Es zeigt, wie viele Perlen es bis dahin sind.";
  karte.append(k, satz);
  if (ton) sprich("Am Ende von jedem Stäbchen hängt ein Pfeilchen. Es zeigt, wie viele Perlen es bis dahin sind.");
}

// =====================================================================================================
// AUFGABE
// =====================================================================================================
// stelleAufgabe(aufgabe, melde) wie in der Vorlage. aufgabe.ziel.key = "mal:a*n" (Art mal, spiele/aufgabenarten.js).
// Die Kette der Aufgabe ist die Kette von n (daten.b): Wechselt n, leert sich die Matte, die Liste behält ihre Zeilen.

const wenigBewegung = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const warte = (/** @type {number} */ ms) => new Promise((ok) => setTimeout(ok, ms));

/** Reihe der Kette auf der Matte (null vor der ersten Aufgabe). @type {number | null} */
let n = null;
/** Stäbchen mit gelöster Aufgabe auf der Kette von n (ihre Pfeilchen tragen die Zahl). */
let geloest = new Set();
/** Der Auftrag der nächsten Aufgabe wird laut gesagt (erste Aufgabe der Runde), sonst still. */
let auftragLaut = true;
let passtSatz = 0;
/** Laufende Folge (Hüpfen, Flüge); stelleAufgabe und Tippen springen ans Ende. @type {(() => void)[]} */
let laufend = [];
/** Während ueberspringeAlles läuft, startet kein neuer Flug (sonst flöge eine Packung in die Denkzeit, B3). */
let springt = false;
/** Gelöste Aufgaben der Runde (Timos mitgezählt): so viele Packungen liegen im Korb. */
let imKorb = 0;
/** Die Aufgabe, die Timo in dieser Runde vorgezeigt hat; die Runde stellt sie dem Kind nicht (Entwurf §5). @type {string | null} */
let vorgezeigt = null;
/** Abbruch eines laufenden Fehler-Bilds (Ring, hohles Pfeilchen) beim nächsten Tippen. @type {(() => void) | null} */
let fehlerBild = null;

function ueberspringeAlles() {
  springt = true;
  try {
    while (laufend.length) {
      const l = laufend;
      laufend = [];
      for (const f of l) f();
    }
  } finally {
    springt = false;
  }
}

/** Eine Packung mehr im Korb: der neue Füllstand bleibt stehen (auch bei wenig Bewegung, W-Freude). */
function packungInDenKorb() {
  imKorb++;
  korb.setAttribute("zustand", fuellstand(imKorb));
}

/** Packung des Stäbchens k fliegt in den Korb (Wirkung, B1). @param {number} k */
function packungFliegt(k) {
  if (n === null || springt || wenigBewegung()) return;
  const p = kette.stabPunkt(k);
  if (!p) return;
  const art = PACKUNG[/** @type {keyof typeof PACKUNG} */ (n)];
  /** @type {HTMLElement} */
  let teil;
  if (art) {
    teil = document.createElement("ls-objekt");
    teil.setAttribute("art", art);
  } else {
    teil = document.createElement("div");
    teil.className = "paeckchen"; // Platzhalter, bis das Objekt der Reihe gezeichnet ist (Entwurf §11)
  }
  flug.append(teil);
  const r = teil.getBoundingClientRect();
  teil.style.left = `${p.x - r.width / 2}px`;
  teil.style.top = `${p.y - r.height / 2}px`;
  const w = wirf(teil, korb, { dauer: 600 });
  laufend.push(() => { w.ueberspringe(); teil.remove(); });
  w.fertig.then(() => teil.remove());
}

/** Zeile „a · n = c“ mit Kurzkette auf der Vorratsliste; eine vorhandene Zeile derselben Aufgabe zeigt wieder ihr Ergebnis. */
function zeileDazu(/** @type {number} */ a, /** @type {number} */ b) {
  const key = `${a}*${b}`;
  let z = /** @type {HTMLElement | null} */ (liste.querySelector(`[data-aufgabe="${key}"]`));
  if (!z) {
    z = document.createElement("div");
    z.className = "zeile";
    z.dataset.aufgabe = key;
    z.innerHTML = `<span class="text"></span><ls-perlenkette reihe="${b}" kurz="${a}" breite="12" perle="1.6"></ls-perlenkette>`;
    liste.append(z);
  }
  /** @type {HTMLElement} */ (z.querySelector(".text")).textContent = `${a} · ${b} = ${a * b}`;
}

/** Zeile derselben Aufgabe verdecken, solange sie noch einmal dran ist (nichts zum Ablesen, Entwurf §2 Satz 6). */
function verdeckeZeile(/** @type {number} */ a, /** @type {number} */ b) {
  const z = liste.querySelector(`[data-aufgabe="${a}*${b}"] .text`);
  if (z) z.textContent = `${a} · ${b} = ▢`;
}

/** Das Ding der Reihe steht in Ruhe auf dem Regalbrett (Sachbild, kein Zählmaterial; W-Sachwelt). @param {number} reihe */
function zeigeDing(reihe) {
  const art = PACKUNG[/** @type {keyof typeof PACKUNG} */ (reihe)];
  if (art) ding.setAttribute("art", art);
  ding.hidden = !art;
  dingPlatz.classList.toggle("platzhalter", !art);
}

/** Stellt die Kette auf n um (leert die Matte bei einem Wechsel). @param {number} neu @returns {boolean} gewechselt */
function kettenWechsel(neu) {
  if (n === neu) return false;
  const vorher = n;
  n = neu;
  zeigeDing(neu);
  geloest = new Set();
  kette.zeigerWeg();
  for (const a of ["pfeile", "leer", "markiert", "hell", "ring", "hohl"]) kette.removeAttribute(a);
  kette.setAttribute("reihe", String(neu));
  return vorher !== null;
}

/** Timo, Platzhalter aus der Runde (spiele/runde/). @type {{ haltung: (h: string, o?: { ms?: number }) => Promise<any>, halt: () => void } | null} */
let timo = null;
async function zeigeTimo() {
  if (timo || !timoPlatz) return timo;
  try {
    const R = await import("../../runde/runde.js");
    timoPlatz.innerHTML = R.zeichne("timo", { haltung: "stehen" });
    timo = R.steuere(timoPlatz.querySelector("svg"));
  } catch (e) {
    protokoll(`${SPIEL_ID}: Timo nicht ladbar: ${/** @type {any} */ (e)?.message ?? e}`);
  }
  return timo;
}

/** Ist das Thema der Runde die Reihe von n (zweierreihe für n = 2 …)? Kern-Runden und fremde Reihen: nein. */
function eigeneReihe(/** @type {string | undefined} */ themaId, /** @type {number} */ b) {
  const t = themaId ? ctx?.plan?.themen?.find((/** @type {any} */ x) => x.id === themaId) : null;
  const aufgaben = [t?.aufgaben ?? []].flat(); // ein Eintrag oder eine Liste
  return aufgaben.some((/** @type {any} */ x) => x?.art === "mal" && x.reihe === b);
}

/**
 * Rundenanfang und Vorzeigen (L5): Der Erzähler nennt die Packung der Reihe, Timo legt die Aufgabe 1 · n vor (prüft,
 * zögert, tippt n), das Pfeilchen hüpft auf das erste Stäbchen. Zählt nicht für die Lernsteuerung. Tippen überspringt.
 * @param {any} aufgabe die erste Aufgabe der Runde @param {string | undefined} rundenThema Id des Themas der Runde
 */
async function vorzeigen(aufgabe, rundenThema) {
  const ziel = malAus(aufgabe?.ziel?.key);
  if (!ziel) return;
  stand.phase = "folge";
  const feld = /** @type {HTMLElement} */ (document.querySelector(".spielflaeche"));
  let kurz = false;
  /** @type {() => void} */
  let wecke = () => {};
  const abkuerzen = () => {
    kurz = true;
    wecke();
    ueberspringeAlles();
    timo?.halt();
  };
  feld.addEventListener("pointerdown", abkuerzen);
  // Standzeiten zwischen den Haltungen, auch bei wenig Bewegung (dann springen die Haltungen ohne Überblendung, aber
  // Nachdenken, Zeigen und Tippen bleiben zu sehen). Tippen weckt sofort.
  const ruhe = (/** @type {number} */ ms) => (kurz ? Promise.resolve() : new Promise((ok) => {
    const uhr = setTimeout(ok, ms);
    wecke = () => { clearTimeout(uhr); ok(undefined); };
  }));
  const haltung = (/** @type {string} */ h) => timo?.haltung(h, kurz ? { ms: 0 } : {});
  try {
    // Neue Runde: leerer Korb, leere Liste, frische Kette.
    liste.replaceChildren();
    imKorb = 0;
    korb.setAttribute("zustand", "leer");
    n = null;
    kettenWechsel(ziel.b);
    const b = /** @type {number} */ (n);
    vorgezeigt = `mal:1*${b}`;
    const t = await zeigeTimo();
    const anfang = TEXTE?.anfang?.[b];
    // Der Fakt („In echt …“) nur in einer Runde der eigenen Reihe (K6); in Kern-Runden und bei einer Aufgabe aus einer
    // anderen Reihe die Setzung.
    if (anfang) blase.sage(eigeneReihe(rundenThema, b) ? anfang.reihe : anfang.setzung);
    gleichung.innerHTML = `<span>1 · ${b} =</span><span class="feld"></span>`;
    const box = /** @type {HTMLElement} */ (gleichung.querySelector(".feld"));
    await ruhe(2600);
    haltung("nachdenken");
    await ruhe(900);
    haltung("zeigen");
    for (const ziffer of String(b)) {
      await ruhe(350);
      box.textContent += ziffer;
    }
    box.textContent = String(b);
    if (TEXTE?.timo?.[b]) blase.sage(TEXTE.timo[b], { sprechen: !kurz });
    const h = kette.huepfe(1, { wert: b, schritt: packungFliegt, ms: 300 });
    laufend.push(h.ueberspringe);
    await h.fertig;
    geloest.add(1);
    kette.zeigerWeg();
    kette.setAttribute("pfeile", "1");
    packungInDenKorb();
    zeileDazu(1, b);
    await ruhe(1200);
    // Timo dreht sich zurück, bevor die Aufgabe des Kindes kommt: Sie erscheint erst auf ein stilles Bild (B3).
    await haltung("stehen");
    await ruhe(300);
  } finally {
    feld.removeEventListener("pointerdown", abkuerzen);
    ueberspringeAlles();
    if (kurz) await timo?.haltung("stehen", { ms: 0 }); // abgekürzt: sofort still
  }
}

/**
 * @param {{ ziel: { key: string, thema?: string }, stufe?: string }} aufgabe
 * @param {{ passtNicht: () => void, geloest: (key: string) => void }} melde
 */
function stelleAufgabe(aufgabe, melde) {
  const ziel = malAus(aufgabe.ziel.key);
  if (!ziel) throw new Error(`Kettenhüpfer: unbekannte Aufgabe ${aufgabe.ziel.key}`);
  ueberspringeAlles();
  const { a, b, c } = ziel;
  const stufe = aufgabe.stufe ?? "material";
  const gewechselt = kettenWechsel(b);

  // Kette: die gelösten Pfeilchen mit Zahl, das eigene ohne (falls die Aufgabe noch einmal dran ist).
  const zeigePfeile = (/** @type {number[]} */ dazu = []) => {
    const p = pfeileWaehrend(geloest, a);
    kette.setAttribute("pfeile", [...p.pfeile, ...dazu].join(" "));
    kette.setAttribute("leer", p.leer.join(" "));
  };
  zeigePfeile();
  verdeckeZeile(a, b);
  kette.toggleAttribute("verdeckt", stufe === "vorstellung");
  kettePlatz.classList.toggle("zu", stufe === "kopf");

  gleichung.innerHTML = `<span>${a} · ${b} =</span><span class="feld" id="eingabe"></span>`;
  const box = /** @type {HTMLElement} */ (gleichung.querySelector(".feld"));
  rechnung.replaceChildren();

  const satz = TEXTE?.auftrag?.[b]?.[a];
  const wechsel = gewechselt ? TEXTE?.wechsel?.[b] : null;
  if (wechsel) blase.sage(wechsel).then(() => { if (!fertig && satz) blase.sage(satz, { sprechen: false }); });
  else if (satz) blase.sage(satz, { sprechen: auftragLaut });

  let eingabe = "";
  let fertig = false;
  let loesungGezeigt = false;

  /** Hilfe Stufe 2: Sonnenring an der Taste, die als Nächstes kommt (bzw. an Fertig). */
  const markiereNaechste = () => {
    const t = naechsteTaste(eingabe, c);
    tastatur.markiere(t === "fertig" ? null : t);
    fertigKnopf.classList.toggle("markiert", t === "fertig");
  };
  const ohneMarkierung = () => {
    tastatur.markiere(null);
    fertigKnopf.classList.remove("markiert");
  };

  const raeumeFehlerBild = () => {
    fehlerBild?.();
    fehlerBild = null;
  };

  /** @param {string} taste */
  const beiTaste = (taste) => {
    if (fertig) return;
    raeumeFehlerBild();
    eingabe = tippe(eingabe, taste);
    box.textContent = eingabe;
    if (loesungGezeigt) markiereNaechste();
  };

  const pruefe = () => {
    if (fertig || !eingabe) return;
    raeumeFehlerBild();
    const zahl = Number(eingabe);
    const ort = vergleiche(zahl, ziel);
    if (ort === "passt") {
      fertig = true;
      abmelden();
      ohneMarkierung();
      kettePlatz.classList.remove("zu");
      kette.removeAttribute("verdeckt");
      kette.removeAttribute("hell");
      kette.removeAttribute("markiert");
      rechnung.replaceChildren();
      // Gemeldet wird sofort (die Zeit der Aufgabe endet mit Fertig); die Folge läuft in der Zeit der Folge (FOLGE_MS).
      melde.geloest(aufgabe.ziel.key);
      // Was die Lösung dauerhaft ändert, steht sofort fest: das Stäbchen ist gelöst, die Zeile steht auf der Liste,
      // eine Packung mehr liegt im Korb. Nur das Bild der Kette folgt dem Hüpfen. Wird die Folge übersprungen (Tippen,
      // nächste Aufgabe), setzt endbild es synchron; ein später Rückruf ändert nichts mehr (sonst überschriebe er die
      // Kette der nächsten Aufgabe und machte ihr Ergebnis ablesbar, Entwurf §2 Satz 6).
      const meine = geloest;
      meine.add(a);
      zeileDazu(a, b);
      packungInDenKorb();
      const h = kette.huepfe(a, { wert: c, schritt: packungFliegt, ms: Math.min(240, 1300 / a) });
      let gezeigt = false;
      const endbild = () => {
        if (gezeigt) return;
        gezeigt = true;
        h.ueberspringe();
        if (meine !== geloest) return; // die Kette ist schon gewechselt
        kette.zeigerWeg();
        kette.setAttribute("leer", "");
        kette.setAttribute("pfeile", [...meine].sort((x, y) => x - y).join(" "));
      };
      laufend.push(endbild);
      h.fertig.then(endbild);
      erzaehler.passt[passtSatz++ % erzaehler.passt.length]();
      return;
    }
    // Passt nicht: das Pfeilchen hält am a-ten Stäbchen (ohne Zahl), Ring dort, die getippte Zahl hohl an ihrem Ort.
    // Nichts fliegt (N7). Das nächste Tippen räumt das Bild weg.
    melde.passtNicht();
    eingabe = "";
    box.textContent = "";
    kettePlatz.classList.remove("zu");
    const h = kette.huepfe(a, { wert: null, ms: Math.min(200, 1000 / a) });
    kette.setAttribute("ring", String(a));
    kette.setAttribute("hohl", String(zahl));
    if (ort === "ueber") erzaehler.hinterDemEnde();
    else if (ort === "hinten") erzaehler.weiterHinten();
    else erzaehler.weiterVorn();
    fehlerBild = () => {
      h.ueberspringe();
      kette.zeigerWeg();
      kette.removeAttribute("ring");
      kette.removeAttribute("hohl");
      if (stufe === "kopf") kettePlatz.classList.add("zu");
    };
    if (loesungGezeigt) markiereNaechste();
  };

  const tasteEreignis = (/** @type {any} */ e) => beiTaste(e.detail.zeichen);
  const fertigEreignis = () => pruefe();
  tastatur.addEventListener("taste", tasteEreignis);
  fertigKnopf.addEventListener("click", fertigEreignis);
  const abmelden = () => {
    tastatur.removeEventListener("taste", tasteEreignis);
    fertigKnopf.removeEventListener("click", fertigEreignis);
  };
  aufraeumen = () => {
    abmelden();
    raeumeFehlerBild();
    ohneMarkierung();
  };

  /** Selektor einer Taste („fertig“ ist der Knopf daneben). @param {string} t */
  const ort = (t) => {
    if (t === "fertig") return "#fertig";
    const knopf = [...tastatur.shadowRoot.querySelectorAll("button[data-z]")].find((k) => k.dataset.z === t);
    return knopf ? selektor(knopf) : null;
  };
  const zug = (/** @type {string} */ t) => {
    const von = ort(t);
    return von ? { art: "tippen", von } : null;
  };

  return {
    // Prüfstand: Tasten zu den Zahlen, die ein ratendes Kind hier am ehesten tippt (Ergebnis und Nachbarn um ein
    // Stäbchen, logik.js kandidaten); das Kind selbst kann jede Zahl tippen.
    zuege() {
      if (fertig) return [];
      return tastenZu(eingabe, kandidaten(a, b)).map(zug).filter(Boolean);
    },
    richtigerZug() {
      return fertig ? null : zug(naechsteTaste(eingabe, c));
    },
    /** @param {1 | 2} hilfeStufe */
    hilfe(hilfeStufe) {
      if (fertig) return;
      raeumeFehlerBild();
      const h = hilfeVon(a, b);
      kettePlatz.classList.remove("zu");
      kette.removeAttribute("verdeckt");
      if (hilfeStufe === 1) {
        // Probe: das Pfeilchen der Kernaufgabe mit Zahl und Sonnenring (bzw. das erste Stäbchen, die Tauschaufgabe).
        if (h.kern !== null) {
          zeigePfeile(geloest.has(h.kern) ? [] : [h.kern]);
          kette.setAttribute("markiert", String(h.kern));
        }
        if (h.art === "eins") kette.setAttribute("hell", "1");
        if (h.art === "tausch") {
          rechnung.innerHTML = `<span class="tausch"><span>${b} · 10</span>${`<ls-perlenstab wert="10"></ls-perlenstab>`.repeat(b)}</span>`;
        }
        return erzaehler.probe[h.art]();
      }
      // Lösung mit Begründung: die Stäbchen zwischen Kernaufgabe und Ziel im Sonnenring, die Rechnung im Bild,
      // die nächste Taste im Sonnenring. Das Ergebnis steht nicht am Pfeilchen (L12).
      loesungGezeigt = true;
      if (h.kern !== null) {
        zeigePfeile(geloest.has(h.kern) ? [] : [h.kern]);
        kette.setAttribute("markiert", String(h.kern));
      }
      kette.setAttribute("hell", h.hell.join(" "));
      rechnung.textContent = h.rechnung;
      markiereNaechste();
      if (h.art === "nachbar") return h.schritt > 0 ? erzaehler.loesung.vor() : erzaehler.loesung.zurueck();
      if (h.art === "zwei") return h.schritt > 0 ? erzaehler.loesung.zweiVor() : erzaehler.loesung.zweiZurueck();
      return erzaehler.loesung[h.art]();
    },
  };
}

/** Räumt die Bedienung der letzten Aufgabe ab (die Kette mit ihren Pfeilchen bleibt stehen, A6b). @type {() => void} */
let aufraeumen = () => {};
function raeumeAuf() {
  ueberspringeAlles();
  aufraeumen();
  aufraeumen = () => {};
}

// =====================================================================================================
// RAHMEN (behalten)
// =====================================================================================================

const params = new URLSearchParams(location.search);
const wunsch = einmal(params.get("thema")); // ?thema= gilt nur für die erste Runde der Seite
// ?stufe=<id> nur im Testbetrieb: jede Aufgabe auf dieser Lernstufe; die Runde ist dann eine Vorschau (schreibt nicht).
const PRUEF_STUFE = testbetrieb() ? params.get("stufe") || null : null;
/** @param {any} a */
const aufStufe = (a) => (a && PRUEF_STUFE ? { ...a, stufe: PRUEF_STUFE } : a);

/** @type {{ plan: any, spiele: any } | null} */
let ctx = null;
async function ladeCtx() {
  if (ctx) return ctx;
  const [plan, spiele] = await Promise.all(["lernplan.json", "spiele.json"].map((f) => fetch(new URL(`../../${f}`, import.meta.url)).then((r) => r.json())));
  ctx = { plan, spiele };
  return ctx;
}
/** Steht das Spiel in spiele.json? Sonst (die Vorlage, ein Spiel vor dem Eintrag) läuft es als Vorschau. */
const eingetragen = (/** @type {{ spiele: any }} */ c) => c.spiele.spiele.some((/** @type {any} */ s) => s.id === SPIEL_ID);

// --- Prüfstand (rahmen/pruefen.js, nur im Testbetrieb ?pruefen) ------------------------------------
// Der RAHMEN merkt sich, was gerade dran ist; das ändert für das Kind nichts. Die Züge einer Aufgabe kommen aus
// der AUFGABE (zuege, richtigerZug), in der Pause ist Weiter der einzige Zug des Spiels.
const stand = { phase: "laden", aufgabe: /** @type {string | null} */ (null), nr: 0, versuche: 0, hilfeStufe: 0, vorschau: true, lernstufe: /** @type {string | null} */ (null) };
/** @type {{ zuege: () => any[], richtigerZug: () => any } | null} */
let offeneAufgabe = null;
const ORTE = { hilfe: "#hilfe >>> ls-knopf", haus: "#leiste >>> a.haus", weiter: "#pause >>> ls-knopf.weiter" };
const WEITER = { art: "tippen", von: ORTE.weiter };
meldePruefSchnittstelle({
  zustand: () => ({ ...stand }),
  zuege: () => (stand.phase === "aufgabe" ? offeneAufgabe?.zuege() ?? [] : stand.phase === "pause" ? [WEITER] : []),
  richtigerZug: () => (stand.phase === "aufgabe" ? offeneAufgabe?.richtigerZug() ?? null : stand.phase === "pause" ? WEITER : null),
  orte: ORTE,
});

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
  return new Promise((fertig, fehler) => {
    const start = Date.now();
    let versuche = 0;
    let stufe = 0;
    Object.assign(stand, { phase: "aufgabe", aufgabe: aufgabe?.ziel?.key ?? null, nr: stand.nr + 1, versuche, hilfeStufe: stufe, lernstufe: aufgabe?.stufe ?? null });
    /** @type {ReturnType<typeof stelleAufgabe>} */
    let a;
    try {
      a = stelleAufgabe(aufgabe, {
        passtNicht() {
          versuche++;
          stand.versuche = versuche;
          if (versuche === 2 && stufe === 0) hilfe.leuchte();
        },
        geloest(key) {
          hilfeTippen = null;
          offeneAufgabe = null;
          stand.phase = "folge";
          fertig({ key, versuche, hilfe: stufe, ms: Date.now() - start });
        },
      });
    } catch (e) {
      // Z. B. eine unbekannte Aufgabe: nicht im Versprechen verschlucken, start() fängt es (gehtNicht).
      hilfeTippen = null;
      fehler(e);
      return;
    }
    offeneAufgabe = a;
    hilfeTippen = () => {
      stufe = Math.min(2, stufe + 1);
      stand.hilfeStufe = stufe;
      a.hilfe(/** @type {1 | 2} */ (stufe));
    };
  });
}

// --- Folge nach einer Lösung (bedienung.md 7.1, B6) ----------------------------------------------
// Zwischen zwei Aufgaben kein Weiter-Knopf: die Folge steht FOLGE_MS (Erzählersatz, Gleichung), ein Tippen
// auf das Spielfeld überspringt sie, dann kommt die nächste Aufgabe. Weiter gibt es nur am Rundenende (Pause).
function warteFolge() {
  const feld = /** @type {HTMLElement} */ (document.querySelector(".spielflaeche"));
  return new Promise((ok) => {
    const fertig = () => {
      clearTimeout(uhr);
      feld.removeEventListener("pointerdown", fertig);
      ok(undefined);
    };
    const uhr = setTimeout(fertig, FOLGE_MS);
    feld.addEventListener("pointerdown", fertig);
  });
}

// --- Pause am Rundenende (bedienung.md 7.1): Sachmoment, Alle Spiele und Weiter gleichwertig -------
// Spielzeit der Eltern: Ist die Zeit um, endet das Spiel nach dieser Pause (kein Weiter); sind weniger als fünf
// Minuten übrig, sagt der Erzähler einmal je Tag die Vorwarnung. Dann spricht der Satz statt des Sachmoments.
// Dazu ruhig das Angebot „Mit echten Dingen“ zum Thema der Runde (docs/mit-echten-dingen.md, kein Muss, K8).
/** @param {{ hinweis?: string | null, zeit?: { schluss: boolean, satz: string | null }, echteDinge?: { thema?: string, fach?: string, titel?: string, text?: string } | null }} [optionen]
 *   hinweis = Spiel, in dem gerade etwas Neues dran ist; zeit = amRundenende() (ohne: nichts zur Spielzeit);
 *   echteDinge = Thema der Runde */
async function zeigePause({ hinweis = null, zeit = { schluss: false, satz: null }, echteDinge = null } = {}) {
  const karte = $("sachmoment");
  fuelleSachmoment(karte, leiste.ton && !zeit.satz);
  if (zeit.satz && leiste.ton) sage(zeit.satz);
  const spiel = hinweis ? (ctx?.spiele?.spiele ?? []).find((/** @type {any} */ s) => s.id === hinweis) : null;
  if (spiel) {
    const a = document.createElement("a");
    a.className = "hinweis";
    a.href = spiel.datei;
    a.tabIndex = 0; // WebKit (Safari, macOS-Vorgabe) erreicht Links mit Tab nur mit tabindex
    a.innerHTML = `<img src="${esc(new URL(spiel.symbol, new URL("../../", import.meta.url)).href)}" alt=""><span>${esc(spiel.titel)}</span>`;
    karte.append(a);
  }
  stand.phase = "pause";
  await pause.zeige({ ...zeit, echteDinge }); // „Alle Spiele“ navigiert selbst (speichert vorher), „Weiter“ löst auf
  stand.phase = "laden";
}

// --- Elternansicht (?eltern): beschreibend, kein Vergleich -----------------------------------------
function elternansicht() {
  const e = document.createElement("section");
  e.className = "eltern auswahl";
  e.innerHTML = `<h1>${esc(leiste.getAttribute("titel"))}</h1><div class="eigenes"></div>
    <p><a href="../../eltern.html">Themen im Elternbereich</a> · <a href="${esc(location.pathname.split("/").pop())}">Zum Spiel</a></p>`;
  fuelleEltern(/** @type {HTMLElement} */ (e.querySelector(".eigenes"))); // Inhalt aus der SPIELWELT
  document.body.append(e);
}

// --- Runde: Lernsteuerung oder (nur Vorschau) die festen Aufgaben ----------------------------------

/** @param {boolean} vorschau */
async function starteRunde(vorschau) {
  const c = await ladeCtx();
  // Nur solange das Spiel nicht in spiele.json steht: im Speicher mit ARTEN eintragen, damit die Lernsteuerung
  // Aufgaben liefert; geschrieben wird dann nichts (vorschau ist gesetzt). Mit dem Eintrag gilt spiele.json.
  const mitSpiel = eingetragen(c) ? c : { plan: c.plan, spiele: { ...c.spiele, spiele: [...c.spiele.spiele, { id: SPIEL_ID, arten: ARTEN }] } };
  const r = await runde(SPIEL_ID, { wunsch: wunsch(), max: AUFGABEN_JE_RUNDE, ctx: mitSpiel, nurAnsehen: vorschau });
  const plan = r.thema ? c.plan.themen.find((/** @type {any} */ t) => t.id === r.thema?.id) : null;
  return {
    thema: r.thema?.name ?? "",
    echteDinge: plan ? { thema: plan.id, fach: plan.strang, titel: plan.name, text: plan.eltern ?? "" } : null,
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
    echteDinge: { titel: VORSCHAU.thema }, // die Karte findet die Anleitung über den Namen des Themas
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

/**
 * Kettenhüpfer: Die Aufgabe, die Timo eben vorgezeigt hat (1 · n), stellt die Runde dem Kind nicht; sonst tippte es
 * nach, was Timo getippt hat, und die Lernsteuerung buchte es als gekonnt (L1). Sie wird übersprungen, ohne Meldung
 * (zählt also weder als gekonnt noch als falsch). Liefert die Lernsteuerung sie sofort noch einmal (Probe: dieselbe
 * Aufgabe, bis sie gemeldet ist), wird sie gestellt. @param {any} aufgabe @param {{ naechste: () => any }} r
 */
function ohneVorgezeigt(aufgabe, r) {
  if (!aufgabe || aufgabe.ziel?.key !== vorgezeigt) return aufgabe;
  return aufStufe(r.naechste());
}

/** @param {boolean} vorschau */
async function spieleRunde(vorschau) {
  /** @type {any} */
  let r;
  try {
    r = await starteRunde(vorschau);
  } catch (e) {
    protokoll(`${SPIEL_ID}: Runde starten: ${/** @type {any} */ (e)?.message ?? e}`);
    if (!vorschau) {
      stand.phase = "fehler";
      return erzaehler.gehtNicht(); // Haus bleibt erreichbar, kein Dialog
    }
    r = vorschauRunde();
  }

  // Einführung beim ersten Mal und bei neuem Thema (L5); in der Vorschau nur mit ?einfuehrung.
  if (r.einfuehrung && (!vorschau || params.has("einfuehrung"))) {
    stand.phase = "einfuehrung";
    // Pfade der eigenen Einführung relativ zu spiele/ (dort liegt einfuehrung.js, „../../“ wie die Imports oben).
    const spiele = new URL("../../einfuehrung.js", import.meta.url);
    const vorlage = EINFUEHRUNG?.vorlage ?? r.einfuehrung.vorlage;
    const hintergrund = EINFUEHRUNG?.hintergrund ? `url("${new URL(EINFUEHRUNG.hintergrund, spiele).href}")` : "";
    const ergebnis = await spieleEinfuehrung(vorlage, r.einfuehrung.werte, { ton: leiste.ton, hintergrund });
    if (ergebnis !== "gesehen") {
      location.href = "../../index.html";
      return;
    }
    r.einfuehrungGesehen();
  }

  let aufgabe = aufStufe(r.naechste());
  if (!aufgabe && vorschau) {
    r = vorschauRunde();
    aufgabe = aufStufe(r.naechste());
  }
  leiste.setAttribute("thema", r.thema);
  const rundenThema = r.echteDinge?.thema; // Id des Themas der Runde (nicht der einzelnen Aufgabe)
  const kernRunde = rundenThema === "kernaufgaben-einmaleins";

  let erste = true;
  let gespielt = 0;
  vorgezeigt = null;
  while (aufgabe) {
    raeumeAuf();
    if (erste) {
      await vorzeigen(aufgabe, rundenThema); // Kettenhüpfer: Timo legt vor (L5), bevor die Zeit der ersten Aufgabe läuft
      aufgabe = ohneVorgezeigt(aufgabe, r);
      if (!aufgabe) break;
    }
    erzaehler.auftrag(erste);
    erste = false;
    const e = await spieleAufgabe(aufgabe);
    const ergebnis = { key: e.key, ok: e.versuche === 0, hilfe: e.hilfe, ms: e.ms };
    // Ereignis „gekonnt“: die Lernsteuerung beendet die Runde (naechste() liefert null). Ereignis „stufe“: das
    // nächste Angebot kommt mit der neuen aufgabe.stufe, stelleAufgabe richtet sich danach.
    r.melde(e.key, ergebnis);
    document.dispatchEvent(new CustomEvent("ls-ergebnis", { detail: ergebnis })); // für die Browser-Prüfung
    gespielt++;
    await warteFolge();
    aufgabe = ohneVorgezeigt(aufStufe(r.naechste()), r);
  }

  ueberspringeAlles();
  await Promise.all([erzaehler.rundenende(gespielt >= AUFGABEN_JE_RUNDE, kernRunde), warte(1500)]);
  const { hinweisSpiel } = await r.ende();
  await zeigePause({ hinweis: hinweisSpiel, zeit: vorschau ? undefined : await amRundenende(), echteDinge: r.echteDinge });
  return spieleRunde(vorschau);
}

// --- Start ---------------------------------------------------------------------------------------
async function start() {
  await leiste.bereit(); // Ton-Einstellung geladen
  if (params.has("eltern")) return elternansicht();
  // Vorschau: jeder Vorschau-Parameter, ein nicht eingetragenes Spiel, oder Lernplan/Spiele nicht ladbar.
  const c = await ladeCtx().catch(() => null);
  const nichtEingetragen = c !== null && !eingetragen(c);
  if (nichtEingetragen) protokoll(`${SPIEL_ID}: nicht in spiele.json – Vorschau, schreibt nicht`);
  const vorschau = ["pause", "hinweis", "eltern", "einfuehrung"].some((p) => params.has(p)) || PRUEF_STUFE !== null || !c || nichtEingetragen;
  stand.vorschau = vorschau;
  // Spielzeit der Eltern (Spec 2026-11-14-spielzeit): gesperrt → zurück zur Startseite; sonst zählt ab jetzt die
  // Zeit (die Vorschau zählt nicht, sie schreibt nie).
  if (!(await starteSpielzeit({ zaehlen: !vorschau }))) return;
  if (params.has("pause") || params.has("hinweis")) {
    const andere = (ctx?.spiele?.spiele ?? []).find((/** @type {any} */ s) => s.id !== SPIEL_ID)?.id ?? null;
    await zeigePause({ hinweis: params.has("hinweis") ? params.get("hinweis") || andere : null, echteDinge: { titel: VORSCHAU.thema } });
  }
  await spieleRunde(vorschau);
}

// Jeder Fehler (auch aus stelleAufgabe) landet hier: ins Protokoll, der Erzähler sagt es ruhig, Haus bleibt erreichbar.
start().catch((e) => {
  protokoll(`${SPIEL_ID}: ${/** @type {any} */ (e)?.message ?? e}`);
  stand.phase = "fehler";
  erzaehler.gehtNicht();
});
