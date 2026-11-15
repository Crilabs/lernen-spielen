// Einführungs-Abspieler: kurze Geschichten als Overlay über dem Spiel.
//
// VORLAGE  spiele/einfuehrungen/<name>.json (Pfad relativ zu spiele/):
//   { "hintergrund": "<fach>/<spiel>/bilder/szene.webp", "szenen": [ { "sprich": "…", "zeig": "…", "bild": [ … ] } ] }
//   hintergrund (optional, relativ zu spiele/): das Bild der Spielwelt, damit die Einführung überall (im Spiel, auf
//           der Themen-Seite) vor dem Hintergrund des Spiels spielt; die Option `hintergrund` geht vor.
//   sprich  wird vorgelesen: nie Ziffern, Zahlwörter oder Platzhalter (die Systemstimme spricht keine Zahlen).
//           Es spricht der Erzähler in der dritten Person (docs/stimme.md), die Kinder sprechen nie.
//   zeig    steht in der Erzählblase, darf Ziffern und Platzhalter enthalten; leer → sprich steht in der Blase.
//   bild    Elemente, x = Mitte in Prozent der Breite:
//     { "figur": "ela", "x": 16, "haltung": "zeigen", "aufgabe": "vorzeigen" }
//         ein Kind der Runde (ela, kofi, lena, timo; spiele/runde/). haltung aus dem Bestand der Runde
//         (stehen, zeigen, fragen, staunen, nachdenken, freuen-klein …), sonst stehen. Die Kinder blicken nach
//         rechts zum Material; Bewegungen (Hüpfen usw.) gibt es in Einführungen bewusst nicht (ruhig, §9).
//         aufgabe (figuren.md §3, §8: vorzeigen, fragen, wundern, freuen, zeigen) dient dem Auszählen.
//         Ein Kind behält in einer Einführung seinen Platz x: Dann bleibt es von Szene zu Szene stehen und
//         wechselt nur sanft die Haltung.
//     { "perlen": ["{n}", "{n-1}"], "x": 60 }   Stäbe in Montessori-Farben, nebeneinander
//     { "zahl": "{n}", "x": 80 }                große Ziffer
//     { "objekt": "einkaufskorb", "zustand": "leer", "x": 80, "hoehe": 16 }
//         ein Ding der Sachwelt aus spiele/objekte/ (<ls-objekt still>, lädt seine Art selbst nach), damit eine
//         Einführung in der Welt des Spiels erzählen kann (A4b); hoehe in rem (Vorgabe 14), zustand leer = der erste.
//
// PLATZHALTER  {schluessel} aus den Werten des Lernplans (n, m, grenze, op …) und
//   {schluessel+k} / {schluessel-k} (k ganze Zahl). JSON kennt keine Zahl mit Platzhalter, daher
//   stehen Zahlen im Bild als Zeichenkette ("{n}", "60"); fuelleVorlage macht daraus echte Zahlen,
//   sobald die ganze Zeichenkette eine Zahl ergibt. In zeig bleibt alles Text.
//
// Die Kinder lädt spieleEinfuehrung selbst (runde/runde.js); fehlt die Runde oder ein Kind, bleibt es still weg.
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
// Im Tempo des Kindes (docs/spielbau.md §8, Christian 2026-11-15): Nach dem Satz bleibt Ruhe, dann erscheint der
// Weiter-Knopf; die nächste Szene kommt erst, wenn das Kind tippt – nie nach einer Zeit.
const RUHE_MS = 2000;

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
.einf .el{position:absolute;top:56%;transform:translate(-50%,-50%)}
.einf .el.figur-h{width:40rem;top:auto;bottom:3rem;transform:translateX(-50%)}
.einf .el.figur-h svg{display:block;width:100%;height:auto;overflow:visible}
.einf .perlen{display:flex;gap:3rem;align-items:center}
.einf .perlen ls-perlenstab{height:var(--einf-stab,9rem)}
.einf .zahl{font:700 18rem/1 "Andika",sans-serif}
.einf .el.objekt{top:auto;bottom:4rem;transform:translateX(-50%)}
.einf .el.objekt ls-objekt{display:block;height:var(--einf-objekt,14rem)}
.einf .einf-weiter{position:absolute;right:6rem;bottom:5rem;width:16rem;height:16rem;border-radius:50%;cursor:pointer;
  background:var(--ls-sonne,#F6C445);border:var(--ls-kontur,.3rem) solid var(--ls-tinte,#3B2A6B);box-shadow:0 .6rem 0 var(--ls-tinte,#3B2A6B);
  display:flex;align-items:center;justify-content:center;padding:0;opacity:0;transform:scale(.6);pointer-events:none;
  transition:opacity .35s ease,transform .45s cubic-bezier(.3,1.5,.5,1);z-index:2}
.einf .einf-weiter.da{opacity:1;transform:scale(1);pointer-events:auto;animation:einf-atmen 2.4s ease-in-out .6s infinite}
.einf .einf-weiter:active{transform:translateY(.3rem);box-shadow:0 .3rem 0 var(--ls-tinte,#3B2A6B)}
.einf .einf-weiter svg{width:8rem;height:8rem;display:block}
.einf .einf-ueber{position:absolute;top:4.5rem;right:4rem;padding:1.6rem 3.2rem;border-radius:5rem;cursor:pointer;z-index:2;
  font:700 3.2rem/1 "Andika",sans-serif;color:var(--ls-tinte,#3B2A6B);background:var(--ls-papier,#FFFDF7);
  border:var(--ls-kontur,.3rem) solid var(--ls-tinte,#3B2A6B);box-shadow:0 .5rem 0 var(--ls-tinte-weich,#8C7FB0)}
.einf .einf-ueber:active{transform:translateY(.3rem);box-shadow:0 .2rem 0 var(--ls-tinte-weich,#8C7FB0)}
@keyframes einf-atmen{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
@media (prefers-reduced-motion:reduce){.einf *{animation:none!important;transition:none!important}}
`;

// vorher: Kinder der letzten Szene (figur → { el, steuer, x }). Steht ein Kind wieder an derselben Stelle,
// bleibt seine Zeichnung und wechselt nur sanft die Haltung, statt neu aufzutauchen (ruhig, grundsaetze §9).
function baueBild(buehne, bild, R, vorher) {
  const jetzt = new Map();
  for (const b of bild) {
    if (!b || typeof b !== "object") continue;
    try {
    const x = typeof b.x === "number" ? b.x : 50;
    if (b.figur) {
      if (!R || !R.bestand.kinder.has(b.figur) || jetzt.has(b.figur)) continue;
      const haltung = R.bestand.haltungen.has(b.haltung) ? b.haltung : "stehen";
      const alt = vorher.get(b.figur);
      let f;
      if (alt && alt.x === x) {
        f = alt;
        if (f.haltung !== haltung) f.steuer.haltung(haltung);
      } else {
        const el = document.createElement("div"); el.className = "el figur-h";
        el.style.left = x + "%";
        el.innerHTML = R.zeichne(b.figur, { haltung });
        f = { el, steuer: R.steuere(el.querySelector("svg")), x };
      }
      f.haltung = haltung;
      jetzt.set(b.figur, f);
      buehne.appendChild(f.el);
      continue;
    }
    const el = document.createElement("div"); el.className = "el";
    el.style.left = x + "%";
    if (Array.isArray(b.perlen)) {
      el.classList.add("perlen");
      const werte = b.perlen.filter(n => Number.isInteger(n) && n > 0 && n <= 10);
      // Perlengröße so, dass alle Stäbe der Szene neben einem Kind auf die Matte passen, mit Rand (gleiche Größe für alle, Länge proportional)
      const lang = werte.reduce((s, n) => s + n * 1.12 + (n > 5 ? 0.6 : 0), 0) + (werte.length - 1) * 2.4;
      el.style.setProperty("--einf-stab", Math.min(8, (96 / Math.max(lang, 1)) * 1.4).toFixed(2) + "rem");
      for (const n of werte) {
        const st = document.createElement("ls-perlenstab");
        st.setAttribute("wert", String(n));
        el.appendChild(st);
      }
    } else if (b.zahl !== undefined) {
      el.classList.add("zahl"); el.textContent = String(b.zahl);
    } else if (typeof b.objekt === "string" && /^[a-z][a-z0-9-]*$/.test(b.objekt)) {
      el.classList.add("objekt");
      if (typeof b.hoehe === "number" && b.hoehe > 0 && b.hoehe <= 30) el.style.setProperty("--einf-objekt", b.hoehe + "rem");
      const o = document.createElement("ls-objekt");
      o.setAttribute("art", b.objekt);
      if (typeof b.zustand === "string" && b.zustand) o.setAttribute("zustand", b.zustand);
      o.setAttribute("still", "");
      el.appendChild(o);
    } else continue;
    buehne.appendChild(el);
    } catch (e) { /* kaputtes Bildelement: weglassen */ }
  }
  for (const [id, f] of vorher) if (!jetzt.has(id)) f.steuer.halt();
  return jetzt;
}

// hintergrund: CSS-Bild der Spielwelt (sonst Nebel). Eine relative Adresse in url() gilt relativ zur Seite des Spiels,
// nicht zu dieser Datei; darum aus dem Spiel heraus absolut bauen, z. B. in spiele/<fach>/<spiel>/spiel.js:
// `url("${new URL("bilder/wiese.jpg", import.meta.url).href}")` oder bild(…) aus rahmen/stil.js.
export async function spieleEinfuehrung(pfad, werte, { ton = true, hintergrund: hintergrundOption = "" } = {}) {
  let hintergrund = hintergrundOption;
  let szenen = [];
  try {
    const r = await fetch(new URL(pfad, import.meta.url));
    if (!r.ok) return "abgebrochen";
    const daten = await r.json();
    szenen = fuelleVorlage(daten, werte);
    if (!hintergrund && typeof daten.hintergrund === "string" && daten.hintergrund)
      hintergrund = `url("${new URL(daten.hintergrund, import.meta.url).href}")`;
  } catch (e) { return "abgebrochen"; }   // fehlende oder kaputte Vorlage: nichts als gesehen melden
  if (!szenen.length) return "abgebrochen";

  const mitTon = !!ton;   // ohne Web-Sprache bleibt sprich still, dann gilt die Lesezeit

  if (!document.getElementById("einf-css")) {
    const st = document.createElement("style"); st.id = "einf-css"; st.textContent = CSS; document.head.appendChild(st);
  }
  try { await import("./rahmen/perlenstab.js"); } catch (e) { /* ohne Baustein bleiben die Perlen weg */ }
  if (szenen.some(s => s.bild.some(b => b && typeof b.objekt === "string")))
    try { await import("./objekte/objekt.js"); } catch (e) { /* ohne Baustein bleiben die Dinge weg */ }
  let R = null;
  try { R = await import("./runde/runde.js"); } catch (e) { /* ohne Runde bleiben die Kinder weg */ }
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
  const weiterEl = document.createElement("button");
  weiterEl.type = "button"; weiterEl.className = "einf-weiter"; weiterEl.setAttribute("aria-label", "Weiter");
  weiterEl.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h12M12 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  wurzel.appendChild(weiterEl);
  // Überspringen ist immer erreichbar und kostet nichts (grundsaetze.md 9.2 Nr. 7): klein, oben rechts.
  const ueberEl = document.createElement("button");
  ueberEl.type = "button"; ueberEl.className = "einf-ueber"; ueberEl.textContent = "Zum Spiel";
  wurzel.appendChild(ueberEl);

  return new Promise(resolve => {
    let timer = [], fertig = false, aktuell = -1, kinder = new Map();
    const ende = ergebnis => {
      if (fertig) return; fertig = true;
      timer.forEach(clearTimeout);
      kinder.forEach(f => f.steuer.halt());
      if (mitTon) stille();
      wurzel.remove();
      resolve(ergebnis);
    };
    const abbruch = () => setTimeout(() => ende("abgebrochen"), 0);   // erst nach dem Klick entfernen, sonst bricht der Browser die Navigation ab
    hausEl.addEventListener("click", abbruch);   // Navigation läuft normal weiter
    ueberEl.addEventListener("click", () => ende("gesehen"));

    const szene = i => { try { szeneSpielen(i); } catch (e) { ende("abgebrochen"); } };   // egal was passiert: das Versprechen wird eingelöst
    const szeneSpielen = i => {
      if (fertig) return;
      aktuell = i;
      if (i >= szenen.length) return ende("gesehen");
      const s = szenen[i], text = s.zeig || s.sprich;
      try { buehne.replaceChildren(); kinder = baueBild(buehne, s.bild, R, kinder); blase.textContent = text; }
      catch (e) { return ende("abgebrochen"); }
      timer.forEach(clearTimeout); timer = [];
      weiterEl.classList.remove("da");
      // Nach Satz und Ruhe erscheint der Knopf; erst sein Tipp bringt die nächste Szene (§8).
      const zeigeWeiter = () => {
        if (fertig || aktuell !== i) return;
        timer.push(setTimeout(() => {
          if (fertig || aktuell !== i) return;
          weiterEl.classList.add("da");
          try { weiterEl.focus({ preventScroll: true }); } catch (e) { /* ohne Fokus geht es auch */ }
        }, RUHE_MS));
      };
      weiterEl.onclick = () => { if (aktuell === i && weiterEl.classList.contains("da")) { weiterEl.classList.remove("da"); szene(i + 1); } };
      const lesezeit = MIN_MS + MS_JE_ZEICHEN * text.length;
      if (!(mitTon && s.sprich)) { timer.push(setTimeout(zeigeWeiter, lesezeit)); return; }
      // Mit Ton: bis die Stimme fertig ist (sprich hat eine eigene Notbremse), dann Ruhe.
      // Bleibt die Stimme still (keine Web-Sprache), gilt die Lesezeit.
      const start = Date.now();
      sprich(s.sprich).then(ergebnis => {
        if (fertig || aktuell !== i) return;
        const mindestMs = ergebnis === "still" ? lesezeit : 0;
        timer.push(setTimeout(zeigeWeiter, Math.max(0, start + mindestMs - Date.now())));
      }, () => { if (aktuell === i) timer.push(setTimeout(zeigeWeiter, lesezeit)); });
    };
    szene(0);
  });
}
