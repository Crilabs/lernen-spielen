// PDF je Thema „Mit echten Dingen“ (docs/superpowers/specs/2026-11-14-echte-dinge-pdf-je-thema-design.md): setzt das
// Blatt (echte-dinge-blatt.js) versteckt in die Seite, misst es und öffnet den Druckdialog (dort auch „Als PDF
// sichern“). Der Druck zeigt nur das Blatt: A4, Tinte und Fachfarbe, ohne Flächen. Ist es höher als eine Seite, eine
// Schriftstufe kleiner; passt es dann noch nicht, folgt eine zweite Seite (keine Form wird geteilt). Während des Drucks
// heißt das Dokument „Mit echten Dingen – <Thema>“ (Dateiname des PDFs), danach wieder wie vorher.
// Nur aufrufen, wenn faehigkeiten().drucken (kern/geraet.js). Genutzt von <ls-anregung> im Elternbereich.

import { drucke } from "../kern/geraet.js";
import { protokoll } from "../kern/protokoll.js";
import { blattHtml, blattTitel } from "./echte-dinge-blatt.js";
import { FACH_SYMBOLE } from "./stil.js";

const SYMBOLE = new URL("../symbole/", import.meta.url).href;
const MM = 96 / 25.4;                          // CSS-Pixel je Millimeter
const SEITE_HOEHE = (297 - 14 - 12 - 3) * MM;  // bedruckbare Höhe (@page) mit 3 mm Luft

// Nur mm und pt (nichts hängt an rem), damit die Höhe am Bildschirm der auf Papier entspricht. Auch am Bildschirm
// gesetzt (unsichtbar, außerhalb), in der Breite der bedruckbaren Fläche (210 − 2 × 14 mm).
const STIL = `
@page { size: A4 portrait; margin: 14mm 14mm 12mm; }
#ls-blatt { position: absolute; left: -10000px; top: 0; width: 182mm; visibility: hidden; pointer-events: none;
  color: #3B2A6B; background: none; font-family: "Andika", sans-serif; font-size: 9.5pt; line-height: 1.42;
  -webkit-print-color-adjust: economy; print-color-adjust: economy; }
#ls-blatt * { margin: 0; }
#ls-blatt.eng { font-size: 8.5pt; }
#ls-blatt header { display: flex; align-items: center; gap: 4.5mm; padding-bottom: 4mm; margin-bottom: 1mm; border-bottom: 0.5mm solid var(--fach); }
#ls-blatt .fachkachel { flex: none; width: 13mm; height: 13mm; box-sizing: border-box; border: 0.5mm solid #3B2A6B; border-radius: 2.8mm;
  background: none; padding: 0; display: grid; place-items: center; }
#ls-blatt .fachkachel svg { width: 8.4mm; height: 8.4mm; }
#ls-blatt h1 { font-size: 20pt; line-height: 1.1; }
#ls-blatt header p { font-size: 11pt; color: #6B5C96; margin-top: 1mm; }
#ls-blatt article.form { break-inside: avoid; padding: 5mm 0 4.5mm; }
#ls-blatt article.form + article.form { border-top: 0.3mm solid #CFC4E3; }
#ls-blatt h2 { display: flex; align-items: center; gap: 2.6mm; font-size: 12.5pt; line-height: 1.2; margin-bottom: 3mm; }
#ls-blatt h2 img { flex: none; width: 8mm; height: 8mm; }
#ls-blatt .spalten { display: grid; grid-template-columns: 1.3fr 1fr; gap: 7mm; padding-left: 10.6mm; }
#ls-blatt p { margin: 0 0 2mm; max-width: none; text-wrap: pretty; }
#ls-blatt ol { list-style: none; padding: 0; margin: 0 0 1mm; counter-reset: schritt; }
#ls-blatt ol li { position: relative; counter-increment: schritt; padding-left: 7mm; margin-bottom: 1.6mm; }
#ls-blatt ol li::before { content: counter(schritt); position: absolute; left: 0; top: 0.2mm; width: 4.6mm; height: 4.6mm;
  box-sizing: border-box; border: 0.3mm solid var(--fach); border-radius: 50%; display: grid; place-items: center;
  font-size: 7.5pt; font-weight: 700; line-height: 1; color: var(--fach); }
#ls-blatt .kern { border-left: 0.8mm solid var(--fach); padding: 0.4mm 0 0.4mm 3mm; margin-bottom: 3.5mm; }
#ls-blatt .kern b { display: block; }
#ls-blatt .stufen { display: block; gap: 0; color: #6B5C96; } /* die Seite kann eigene .stufen haben (Elternbereich) */
#ls-blatt .stufen b { color: #3B2A6B; }
@media print {
  html, body { height: auto !important; min-height: 0 !important; overflow: visible !important; background: none !important; }
  body > :not(#ls-blatt) { display: none !important; }
  #ls-blatt { position: static; left: auto; width: auto; visibility: visible; }
}`;

/** @type {Map<string, Promise<string>>} */
const fachSvgs = new Map();
/** @param {string} fach @returns {Promise<string>} Inhalt von symbole/<fach>.svg ("" ohne) */
function fachSvg(fach) {
  if (!FACH_SYMBOLE.has(fach)) return Promise.resolve("");
  if (!fachSvgs.has(fach)) fachSvgs.set(fach, fetch(SYMBOLE + fach + ".svg").then((r) => (r.ok ? r.text() : "")).catch(() => ""));
  return /** @type {Promise<string>} */ (fachSvgs.get(fach));
}

/** Blatt und Stil einmal je Seite anlegen. @returns {HTMLElement} */
function blattElement() {
  if (!document.getElementById("ls-blatt-stil")) {
    const stil = document.createElement("style");
    stil.id = "ls-blatt-stil";
    stil.textContent = STIL;
    document.head.appendChild(stil);
  }
  let blatt = document.getElementById("ls-blatt");
  if (!blatt) {
    blatt = document.createElement("section");
    blatt.id = "ls-blatt";
    blatt.setAttribute("aria-hidden", "true");
    document.body.appendChild(blatt);
  }
  return blatt;
}

let titelVorher = "";
let druckt = false;
globalThis.addEventListener?.("afterprint", () => {
  if (titelVorher) document.title = titelVorher;
  titelVorher = "";
});

/**
 * Druckt das Blatt eines Themas.
 * @param {{ name: string, titel: string, fach: string, formen: import("./markdown.js").Form[] }} thema
 * @returns {Promise<boolean>} true, wenn der Druckdialog aufging
 */
export async function druckeAnleitung({ name, titel, fach, formen }) {
  if (!formen?.length || druckt) return false;
  druckt = true;
  try {
    const blatt = blattElement();
    blatt.classList.remove("eng");
    blatt.innerHTML = blattHtml({ name, titel, fach, formen, fachSvg: await fachSvg(fach) });
    await document.fonts.ready;
    await Promise.all([...blatt.querySelectorAll("img")].map((i) => (i.complete ? null : new Promise((ok) => { i.onload = i.onerror = ok; }))));
    if (blatt.getBoundingClientRect().height > SEITE_HOEHE) blatt.classList.add("eng");
    titelVorher = titelVorher || document.title;
    document.title = blattTitel(name);
    const ok = drucke();
    if (!ok) { document.title = titelVorher; titelVorher = ""; protokoll("Mit echten Dingen: Drucken ging nicht"); }
    return ok;
  } finally {
    druckt = false;
  }
}
