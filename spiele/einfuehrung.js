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
const PERLE = { 1: "#E53935", 2: "#43A047", 3: "#F48FB1", 4: "#FDD835", 5: "#64B5F6", 6: "#9C27B0", 7: "#FFFFFF", 8: "#8D6E63", 9: "#1E3A8A", 10: "#F9A825" };
const INK = "#3B2A6B";

const CSS = `
.einf{position:fixed;inset:0;z-index:1000;font-size:calc(100vh / 108);font-family:"Andika",sans-serif;color:${INK};
  background:rgba(232,247,255,.97);touch-action:none;user-select:none;-webkit-user-select:none;overflow:hidden}
.einf *{box-sizing:border-box}
.einf .buehne{position:absolute;left:0;right:0;top:0;bottom:0}
.einf .blase{position:absolute;left:50%;top:7rem;transform:translateX(-50%);width:min(110rem,72%);min-height:10rem;background:#fff;border:.5rem solid ${INK};
  border-radius:3.6rem;padding:1.8rem 2.8rem;font:400 3.8rem/1.3 "Andika",sans-serif;text-align:center;display:flex;align-items:center;justify-content:center}
.einf .blase::before,.einf .blase::after{content:"";position:absolute;left:50%;border:solid transparent}
.einf .blase::before{bottom:-3.4rem;margin-left:-1.8rem;border-width:3.4rem 1.8rem 0 1.8rem;border-top-color:${INK}}
.einf .blase::after{bottom:-2.4rem;margin-left:-1.3rem;border-width:2.6rem 1.3rem 0 1.3rem;border-top-color:#fff}
.einf .haus{position:absolute;top:2rem;left:2.4rem;width:8rem;height:8rem;border-radius:50%;background:rgba(255,255,255,.9);display:flex;align-items:center;justify-content:center;
  padding:1.7rem;box-shadow:0 .5rem 0 rgba(59,42,107,.15);text-decoration:none;z-index:2}
.einf .haus img{width:100%;height:100%;display:block}
.einf .haus:active{transform:translateY(.3rem);box-shadow:0 .2rem 0 rgba(59,42,107,.15)}
.einf .el{position:absolute;bottom:12rem;transform:translateX(-50%)}
.einf .el.figur-h{width:32rem}
.einf .stab{display:flex;margin-bottom:0}
.einf .perlen{display:flex;gap:4rem;align-items:flex-end}
.einf .stab{padding:.5rem;border:.4rem solid ${INK};border-radius:99rem;background:var(--c);box-shadow:0 .6rem 0 rgba(59,42,107,.15)}
.einf .stab b{display:block;width:var(--d);height:var(--d);border-radius:50%;background:var(--c);border:.3rem solid ${INK};
  background-image:radial-gradient(circle at 32% 30%,rgba(255,255,255,.75) 0 14%,transparent 16%)}
.einf .zahl{font:700 18rem/1 "Andika",sans-serif}
@media (prefers-reduced-motion:reduce){.einf *{animation:none!important;transition:none!important}}
`;

function stimme(text) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "de-DE"; u.rate = .85;
  let fest = ""; try { fest = localStorage.getItem("einhorn-stimme") || ""; } catch (e) {}
  const vs = speechSynthesis.getVoices().filter(v => /^de/i.test(v.lang));
  const v = vs.find((v, k) => k + "|" + v.name + "|" + v.voiceURI === fest);
  if (v) u.voice = v;
  return u;
}

function stab(n, el) {
  const d = document.createElement("div"); d.className = "stab";
  d.style.setProperty("--c", PERLE[n] || PERLE[10]);
  d.style.setProperty("--d", Math.min(6, 60 / n) + "em");
  for (let i = 0; i < n; i++) d.appendChild(document.createElement("b"));
  el.appendChild(d);
}

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
      for (const n of b.perlen) if (Number.isInteger(n) && n > 0) stab(n, el);
    } else if (b.zahl !== undefined) {
      el.classList.add("zahl"); el.textContent = String(b.zahl);
    } else continue;
    buehne.appendChild(el);
    } catch (e) { /* kaputtes Bildelement: weglassen */ }
  }
}

export async function spieleEinfuehrung(pfad, werte, { ton = true } = {}) {
  let szenen = [];
  try {
    const r = await fetch(new URL(pfad, document.baseURI));
    if (!r.ok) return "abgebrochen";
    szenen = fuelleVorlage(await r.json(), werte);
  } catch (e) { return "abgebrochen"; }   // fehlende oder kaputte Vorlage: nichts als gesehen melden
  if (!szenen.length) return "abgebrochen";

  const reduziert = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const mitTon = !!ton && typeof speechSynthesis !== "undefined" && typeof SpeechSynthesisUtterance !== "undefined";

  if (!document.getElementById("einf-css")) {
    const st = document.createElement("style"); st.id = "einf-css"; st.textContent = CSS; document.head.appendChild(st);
  }
  const wurzel = document.createElement("div"); wurzel.className = "einf";
  wurzel.setAttribute("role", "dialog");
  const buehne = document.createElement("div"); buehne.className = "buehne";
  const blase = document.createElement("div"); blase.className = "blase"; blase.setAttribute("aria-live", "polite");
  wurzel.append(buehne, blase);
  wurzel.addEventListener("pointerdown", e => e.preventDefault());
  wurzel.addEventListener("click", e => { if (!e.target.closest(".haus")) e.preventDefault(); });
  document.body.appendChild(wurzel);

  // Eigener Haus-Knopf im Overlay (ein Knopf des Spiels läge in dessen Stapelkontext unter dem Overlay).
  const hausEl = document.createElement("a");
  hausEl.className = "haus"; hausEl.href = new URL("index.html", document.baseURI).href; hausEl.setAttribute("aria-label", "Alle Spiele");
  const hausBild = document.createElement("img"); hausBild.alt = ""; hausBild.src = new URL("symbole/haus.svg", document.baseURI).href;
  hausEl.appendChild(hausBild); wurzel.appendChild(hausEl);

  return new Promise(resolve => {
    let timer = [], fertig = false, aktuell = -1;
    const ende = ergebnis => {
      if (fertig) return; fertig = true;
      timer.forEach(clearTimeout);
      if (mitTon) { try { speechSynthesis.cancel(); } catch (e) {} }
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
      let sprache = !(mitTon && s.sprich), mindest = false;
      const weiter = () => { if (aktuell === i && sprache && mindest) szene(i + 1); };   // alte Szenen melden sich nicht mehr
      if (mitTon && s.sprich) {
        try {
          speechSynthesis.cancel();
          const u = stimme(s.sprich);
          u.onend = u.onerror = () => { sprache = true; weiter(); };
          speechSynthesis.speak(u);
          // Notbremse, falls die Stimme nie „fertig“ meldet
          timer.push(setTimeout(() => { sprache = true; mindest = true; weiter(); }, 8000 + 150 * s.sprich.length));
        } catch (e) { sprache = true; }
      }
      const mindestMs = mitTon && s.sprich ? MIN_MS : MIN_MS + MS_JE_ZEICHEN * text.length;
      timer.push(setTimeout(() => { mindest = true; weiter(); }, mindestMs));
    };
    szene(0);
  });
}
