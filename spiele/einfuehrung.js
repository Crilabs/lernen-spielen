// Einführungs-Abspieler: kurze Geschichten als Overlay über dem Spiel.
//
// VORLAGE  spiele/einfuehrungen/<name>.json (Pfad relativ zu spiele/):
//   { "szenen": [ { "sprich": "…", "zeig": "…", "bild": [ … ] } ] }
//   sprich  wird vorgelesen: nie Ziffern, Zahlwörter oder Platzhalter (die Stimme spricht keine Zahlen).
//   zeig    steht in der Sprechblase, darf Ziffern und Platzhalter enthalten; leer → sprich steht in der Blase.
//   bild    Elemente, x = Mitte in Prozent der Breite:
//     { "figur": "einhorn", "x": 20, "aktion": "steh" | "hop" | "schau" }
//     { "perlen": ["{n}", "{n-1}"], "x": 60 }   Stäbe in Montessori-Farben, nebeneinander
//     { "zahl": "{n}", "x": 80 }                große Ziffer
//
// PLATZHALTER  {schluessel} aus den Werten des Lernplans (n, m, grenze, op …) und
//   {schluessel+k} / {schluessel-k} (k ganze Zahl). JSON kennt keine Zahl mit Platzhalter, daher
//   stehen Zahlen im Bild als Zeichenkette ("{n}", "60"); fuelleVorlage macht daraus echte Zahlen,
//   sobald die ganze Zeichenkette eine Zahl ergibt. In zeig bleibt alles Text.
//
// Die Seite des Spiels lädt figuren/figuren.js und die benötigten figuren/<id>.js; fehlt Figuren
// oder eine Figur, wird sie still weggelassen.
// Der reine Teil (fuelleVorlage) läuft auch in Node; nichts greift beim Import auf das DOM zu.

import { sprich, stille } from "./kern/stimme.js";

const PLATZHALTER = /\{\s*([A-Za-z_]\w*)\s*(?:([+-])\s*(\d+)\s*)?\}/g;
const GANZ_PLATZHALTER = /^\s*\{[^{}]*\}\s*$/;
const ZIFFER_ODER_PLATZ = /[0-9{}]/;
const ZAHLWORT = /(?<![\p{L}])(null|eins|zwei|zwo|drei|vier|fünf|sechs|sieben|acht|neun|zehn|elf|zwölf|(?:drei|vier|fünf|sech|sieb|acht|neun)zehn|zwanzig|dreißig|dreissig|(?:vier|fünf|sech|sieb|acht|neun)zig|(?:ein)?hundert|(?:ein)?tausend)(?![\p{L}])/iu;

function ersetze(text, werte, wo) {
  return text.replace(PLATZHALTER, (_, key, op, k) => {
    if (!(key in werte)) throw new Error(`Einführung: Platzhalter {${key}} ohne Wert (${wo})`);
    if (!op) return String(werte[key]);
    const n = Number(werte[key]);
    if (!Number.isFinite(n)) throw new Error(`Einführung: {${key}} ist keine Zahl (${wo})`);
    return String(op === "+" ? n + Number(k) : n - Number(k));
  });
}

// Wert aus der Vorlage: Platzhalter füllen; eine ganze Zeichenkette, die eine Zahl ergibt, wird zur Zahl.
function fuelleWert(v, werte, wo) {
  if (typeof v === "string") {
    const s = ersetze(v, werte, wo);
    return (GANZ_PLATZHALTER.test(v) || /^\s*-?\d+(\.\d+)?\s*$/.test(v)) && s.trim() !== "" && Number.isFinite(Number(s)) ? Number(s) : s;
  }
  if (Array.isArray(v)) return v.map(x => fuelleWert(x, werte, wo));
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fuelleWert(x, werte, wo)]));
  return v;
}

export function fuelleVorlage(vorlage, werte) {
  const w = werte || {};
  const szenen = vorlage && Array.isArray(vorlage.szenen) ? vorlage.szenen : [];
  return szenen.map((s, i) => {
    const sprich = typeof s.sprich === "string" ? s.sprich : "";
    if (ZIFFER_ODER_PLATZ.test(sprich) || ZAHLWORT.test(sprich))
      throw new Error(`Einführung: sprich in Szene ${i + 1} enthält Ziffer, Zahlwort oder Platzhalter: "${sprich}"`);
    const wo = `Szene ${i + 1}`;
    return {
      sprich,
      zeig: ersetze(typeof s.zeig === "string" ? s.zeig : "", w, wo),
      bild: (Array.isArray(s.bild) ? s.bild : []).map(b => fuelleWert(b, w, wo)),
    };
  });
}

// ---------------------------------------------------------------- DOM-Teil

const MIN_MS = 2500, MS_JE_ZEICHEN = 60;

// Aussehen nach den Rahmen-Bausteinen (docs/bedienung.md §9, Farbwelt): Hintergrund der Spielwelt (Option
// `hintergrund`, sonst Nebel), Erzählblase ohne Zipfel (docs/stimme.md: es spricht der Erzähler), Perlen als
// <ls-perlenstab> (grundsaetze-bilder.md M1–M3) auf einer flachen Matte aus Papier. Werte aus rahmen/stil.js.
const CSS = `
.einf{position:fixed;inset:0;z-index:1000;font-size:calc(100vh / 108);font-family:"Andika",sans-serif;color:var(--ls-tinte,#3B2A6B);
  background:var(--einf-hintergrund,var(--ls-nebel,#F1EEF8)) center / cover no-repeat;touch-action:none;user-select:none;-webkit-user-select:none;overflow:hidden}
.einf *{box-sizing:border-box}
.einf .blase{position:absolute;left:50%;top:4rem;transform:translateX(-50%);width:min(130rem,80%);min-height:12rem;
  background:var(--ls-papier,#FFFDF7);border:var(--ls-kontur,.3rem) solid var(--ls-tinte,#3B2A6B);border-radius:var(--ls-radius,3rem);
  padding:2.2rem 4rem;font:400 4rem/1.3 "Andika",sans-serif;text-align:center;display:flex;align-items:center;justify-content:center}
.einf .einf-buehne{position:absolute;left:30rem;right:30rem;top:30rem;bottom:16rem;background:var(--ls-papier,#FFFDF7);
  border:var(--ls-kontur,.3rem) solid var(--ls-tinte,#3B2A6B);border-radius:var(--ls-radius-gross,4rem)}
.einf .haus{position:absolute;top:4rem;left:3rem;width:11rem;height:11rem;border-radius:50%;background:var(--ls-papier,#FFFDF7);
  border:var(--ls-kontur,.3rem) solid var(--ls-tinte,#3B2A6B);display:flex;align-items:center;justify-content:center;
  padding:2.4rem;box-shadow:0 .6rem 0 var(--ls-tinte-weich,#8C7FB0);text-decoration:none;z-index:2}
.einf .haus img{width:100%;height:100%;display:block}
.einf .haus:active{transform:translateY(.3rem);box-shadow:0 .3rem 0 var(--ls-tinte-weich,#8C7FB0)}
.einf .el{position:absolute;top:50%;transform:translate(-50%,-50%)}
.einf .el.figur-h{width:32rem;top:auto;bottom:4rem;transform:translateX(-50%)}
.einf .perlen{display:flex;gap:3rem;align-items:center}
.einf .perlen ls-perlenstab{height:var(--einf-stab,9rem)}
.einf .zahl{font:700 18rem/1 "Andika",sans-serif}
@media (prefers-reduced-motion:reduce){.einf *{animation:none!important;transition:none!important}}
`;

function baueBild(buehne, bild, reduziert) {
  const F = window.Figuren;
  for (const b of bild) {
    if (!b || typeof b !== "object") continue;
    try {
    const el = document.createElement("div"); el.className = "el";
    el.style.left = (typeof b.x === "number" ? b.x : 50) + "%";
    if (b.figur) {
      if (!F || !F.figuren || !F.figuren[b.figur]) continue;
      el.classList.add("figur-h");
      el.innerHTML = F.svgFigur(b.figur);
      const svg = el.querySelector("svg");
      if (svg && b.aktion === "hop" && !reduziert) F.hop(svg, { hoehe: 60 });
      if (svg && b.aktion === "schau") { const h = svg.querySelector(".head"); if (h) h.style.transform = "rotate(-6deg)"; }
    } else if (Array.isArray(b.perlen)) {
      el.classList.add("perlen");
      const werte = b.perlen.filter(n => Number.isInteger(n) && n > 0 && n <= 10);
      // Perlengröße so, dass alle Stäbe der Szene auf die Matte passen (gleiche Größe für alle, Länge proportional)
      const lang = werte.reduce((s, n) => s + n * 1.12 + (n > 5 ? 0.6 : 0), 0) + (werte.length - 1) * 2.4;
      el.style.setProperty("--einf-stab", Math.min(9, (110 / Math.max(lang, 1)) * 1.4).toFixed(2) + "rem");
      for (const n of werte) {
        const st = document.createElement("ls-perlenstab");
        st.setAttribute("wert", String(n));
        el.appendChild(st);
      }
    } else if (b.zahl !== undefined) {
      el.classList.add("zahl"); el.textContent = String(b.zahl);
    } else continue;
    buehne.appendChild(el);
    } catch (e) { /* kaputtes Bildelement: weglassen */ }
  }
}

// hintergrund: CSS-Bild der Spielwelt, z. B. 'url("bilder/zerlegungshaus/wiese.jpg")' (sonst Nebel).
export async function spieleEinfuehrung(pfad, werte, { ton = true, hintergrund = "" } = {}) {
  let szenen = [];
  try {
    const r = await fetch(new URL(pfad, import.meta.url));
    if (!r.ok) return "abgebrochen";
    szenen = fuelleVorlage(await r.json(), werte);
  } catch (e) { return "abgebrochen"; }   // fehlende oder kaputte Vorlage: nichts als gesehen melden
  if (!szenen.length) return "abgebrochen";

  const reduziert = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const mitTon = !!ton;   // ohne Web-Sprache bleibt sprich still, dann gilt die Lesezeit

  if (!document.getElementById("einf-css")) {
    const st = document.createElement("style"); st.id = "einf-css"; st.textContent = CSS; document.head.appendChild(st);
  }
  try { await import("./rahmen/perlenstab.js"); } catch (e) { /* ohne Baustein bleiben die Perlen weg */ }
  const wurzel = document.createElement("div"); wurzel.className = "einf";
  if (hintergrund) wurzel.style.setProperty("--einf-hintergrund", hintergrund);
  wurzel.setAttribute("role", "dialog");
  const buehne = document.createElement("div"); buehne.className = "einf-buehne";
  const blase = document.createElement("div"); blase.className = "blase"; blase.setAttribute("aria-live", "polite");
  wurzel.append(buehne, blase);
  wurzel.addEventListener("pointerdown", e => e.preventDefault());
  wurzel.addEventListener("click", e => { if (!e.target.closest(".haus")) e.preventDefault(); });
  document.body.appendChild(wurzel);

  // Eigener Haus-Knopf im Overlay (ein Knopf des Spiels läge in dessen Stapelkontext unter dem Overlay).
  const hausEl = document.createElement("a");
  hausEl.className = "haus"; hausEl.href = new URL("index.html", import.meta.url).href; hausEl.setAttribute("aria-label", "Alle Spiele");
  const hausBild = document.createElement("img"); hausBild.alt = ""; hausBild.src = new URL("symbole/haus.svg", import.meta.url).href;
  hausEl.appendChild(hausBild); wurzel.appendChild(hausEl);

  return new Promise(resolve => {
    let timer = [], fertig = false, aktuell = -1;
    const ende = ergebnis => {
      if (fertig) return; fertig = true;
      timer.forEach(clearTimeout);
      if (mitTon) stille();
      wurzel.remove();
      resolve(ergebnis);
    };
    const abbruch = () => setTimeout(() => ende("abgebrochen"), 0);   // erst nach dem Klick entfernen, sonst bricht der Browser die Navigation ab
    hausEl.addEventListener("click", abbruch);   // Navigation läuft normal weiter

    const szene = i => { try { szeneSpielen(i); } catch (e) { ende("abgebrochen"); } };   // egal was passiert: das Versprechen wird eingelöst
    const szeneSpielen = i => {
      if (fertig) return;
      aktuell = i;
      if (i >= szenen.length) return ende("gesehen");
      const s = szenen[i], text = s.zeig || s.sprich;
      try { buehne.replaceChildren(); baueBild(buehne, s.bild, reduziert); blase.textContent = text; }
      catch (e) { return ende("abgebrochen"); }
      timer.forEach(clearTimeout); timer = [];
      const weiter = () => { if (aktuell === i) szene(i + 1); };   // alte Szenen melden sich nicht mehr
      const lesezeit = MIN_MS + MS_JE_ZEICHEN * text.length;
      if (!(mitTon && s.sprich)) { timer.push(setTimeout(weiter, lesezeit)); return; }
      // Mit Ton: mindestens MIN_MS und bis die Stimme fertig ist (sprich hat eine eigene Notbremse).
      // Bleibt die Stimme still (keine Web-Sprache), gilt die Lesezeit.
      const start = Date.now();
      sprich(s.sprich).then(ergebnis => {
        if (fertig || aktuell !== i) return;
        const mindestMs = ergebnis === "still" ? lesezeit : MIN_MS;
        timer.push(setTimeout(weiter, Math.max(0, start + mindestMs - Date.now())));
      }, () => { if (aktuell === i) timer.push(setTimeout(weiter, lesezeit)); });
    };
    szene(0);
  });
}
