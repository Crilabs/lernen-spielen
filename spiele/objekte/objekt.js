// <ls-objekt art="papiertonne" zustand="zu|offen|voll" wert="7" still>
// Sachobjekte der Spielwelt als SVG im Stil der Runde (docs/spielentwicklung.md „Spielobjekte“, docs/figuren.md §4):
// Kontur in Tinte nur um die Silhouette (Kontur-Schicht unter allen Flächen, wie spiele/runde/zeichne.js), Licht von
// oben links in Stufen (Helfer aus spiele/runde/kinder/stil.js), Schlagschatten an Stoßstellen, keine Verläufe.
//
// Jede Art meldet sich mit meldeObjekt(art, { … }) an (eine Datei je Art, spiele/objekte/<art>.js oder im
// Spielordner unter objekte/, angemeldet beim Import). Ein Bild trägt alle Zustände: Teile mit `data-in="zu voll"`
// sind nur in diesen Zuständen sichtbar; so kann eine Bewegung zwischen zwei Zuständen Teile ein- und ausblenden.
//
// Bewegung (grundsaetze-bilder §7): Ein Wechsel von `zustand` spielt einmal die Bewegung der Art (B1, etwa 0,6 bis
// 1 s), danach steht das Bild still (B3). `ueberspringe()` springt ans Ende (B6). Bei prefers-reduced-motion
// oder mit dem Attribut `still` (Regal) steht der neue Zustand sofort da (B7).
//
// Standard aria-hidden="true": Sachobjekte sind Schmuck der Welt; was das Kind wissen muss, sagt der Erzähler.
// Größe setzt die Seite per CSS am Host über `height` (Vorgabe 20 rem); die Breite folgt dem Bild.
// Unbekannte Art: das Element lädt einmal ./<art>.js neben dieser Datei nach (gemeinsamer Bestand); fehlt sie, bleibt
// es leer und schreibt einmal ins Protokoll.

import { protokoll } from "../kern/protokoll.js";
import { INK } from "../runde/kinder/stil.js";

/** @typedef {import("../runde/kinder/stil.js").Stueck} Stueck */

/**
 * Ein Schritt einer Bewegung: Keyframes (Web Animations) für alle Elemente mit `data-teil="teil"`.
 * transform-origin des Teils legt die Art beim Zeichnen fest (teile → ursprung).
 * @typedef {{ teil: string, keyframes: Keyframe[], dauer: number, beginn?: number, easing?: string }} Schritt
 */

/**
 * @typedef {object} ObjektArt
 * @property {string[]} zustaende erster = Vorgabe
 * @property {(zustand: string, o: { wert: string }) => string} zeichne SVG-Text (mit bild() bauen)
 * @property {(von: string, nach: string) => Schritt[]} [bewegung] leer = sofort
 * @property {(ding: string) => Schritt[]} [anstoss] kurze Antwort auf einen Anstoß (z. B. ein Ding fällt hinein)
 * @property {[number, number, number]} [einwurf] Einwurfpunkt x, y und Breite eines hineinfallenden Dings (Bildmaße)
 */

/** @type {Map<string, ObjektArt>} */
export const objekte = new Map();
/** @type {Set<() => void>} */
const warten = new Set();

const NAME = /^[a-z][a-z0-9-]*$/;

/**
 * Meldet eine Art an. Namen nur aus Kleinbuchstaben, Ziffern und Bindestrich; doppelt gemeldet ist ein Fehler.
 * @param {string} art @param {ObjektArt} def
 */
export function meldeObjekt(art, def) {
  if (!NAME.test(art)) throw new Error(`ls-objekt: ungültiger Name ${art}`);
  if (objekte.has(art)) throw new Error(`ls-objekt: ${art} ist schon gemeldet`);
  if (!Array.isArray(def.zustaende) || !def.zustaende.length) throw new Error(`ls-objekt: ${art} ohne Zustände`);
  objekte.set(art, def);
  for (const f of [...warten]) f();
}

/** @param {number} n */
const z = (n) => String(Math.round(n * 100) / 100);

/**
 * Ein Teil des Bildes. Ohne `eigen` gehört seine Kontur zur gemeinsamen Silhouette (Kontur-Schicht unter allen
 * Flächen). Mit `eigen` trägt es seine Kontur selbst – für Dinge, die sich vor oder hinter andere Teile schieben
 * (ein Ding, das in die Tonne fällt). `in`: nur in diesen Zuständen sichtbar ("" = nur während einer Bewegung).
 * `ursprung`: Drehpunkt für Bewegungen in Bildmaßen.
 * @typedef {{ stueck: Stueck, teil?: string, in?: string, ursprung?: [number, number], eigen?: boolean }} Teil
 */

/** @param {Teil} t */
function attr(t) {
  return (t.teil ? ` data-teil="${t.teil}"` : "") + (t.in !== undefined ? ` data-in="${t.in}"` : "")
    + (t.ursprung ? ` style="transform-origin:${z(t.ursprung[0])}px ${z(t.ursprung[1])}px"` : "");
}

/** Strichbreite der Kontur: die Hälfte liegt außen und bildet die Silhouette (3 Einheiten, figuren.md §4). */
export const KONTUR = 6;

/**
 * Baut das SVG eines Objekts aus Teilen (Reihenfolge = hinten nach vorn). Alles liegt in einer Gruppe
 * `data-teil="ganz"` (Drehpunkt ursprung), damit das ganze Objekt wackeln kann. Das Feld (viewBox) beginnt bei
 * y = oben und ist so hoch wie das Objekt in Ruhe; was eine Bewegung oder ein Zustand darüber hinaus braucht
 * (ein offener Deckel), ragt sichtbar heraus (overflow visible) und verschiebt nichts auf der Seite.
 * @param {{ breite: number, hoehe: number, oben?: number, teile: Teil[], ursprung?: [number, number] }} o
 * @returns {string}
 */
export function bild({ breite, hoehe, oben = 0, teile, ursprung }) {
  const kontur = teile.filter((t) => !t.eigen && t.stueck.kontur)
    .map((t) => (t.teil || t.in !== undefined ? `<g${attr(t)}>${t.stueck.kontur}</g>` : t.stueck.kontur)).join("");
  const flaeche = teile.map((t) => {
    const innen = t.eigen
      ? `<g fill="${INK}" stroke="${INK}" stroke-width="${KONTUR}">${t.stueck.kontur}</g>${t.stueck.svg}`
      : t.stueck.svg;
    return t.teil || t.in !== undefined || t.eigen ? `<g${attr(t)}>${innen}</g>` : innen;
  }).join("");
  const ganz = ursprung ? ` style="transform-origin:${z(ursprung[0])}px ${z(ursprung[1])}px"` : "";
  return `<svg viewBox="0 ${z(oben)} ${z(breite)} ${z(hoehe)}" xmlns="http://www.w3.org/2000/svg" overflow="visible"`
    + ` stroke-linecap="round" stroke-linejoin="round"><g data-teil="ganz"${ganz}>`
    + `<g data-schicht="kontur" fill="${INK}" stroke="${INK}" stroke-width="${KONTUR}">${kontur}</g>`
    + `<g data-schicht="flaeche">${flaeche}</g></g></svg>`;
}

/**
 * Stück unter ein festes transform-Attribut stellen (Fläche und Kontur gleich), z. B. ein Ding verkleinert in der Tonne.
 * @param {Stueck} s @param {string} transform
 * @returns {Stueck}
 */
export const verschiebe = (s, transform) => ({
  svg: `<g transform="${transform}">${s.svg}</g>`,
  kontur: s.kontur ? `<g transform="${transform}">${s.kontur}</g>` : "",
});

/** Dauer einer Bewegung in ms (letztes Ende eines Schritts). @param {Schritt[]} schritte */
export function dauerVon(schritte) {
  return schritte.reduce((m, s) => Math.max(m, (s.beginn ?? 0) + s.dauer), 0);
}

const ESC = /** @type {Record<string, string>} */ ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" });
/** @param {string} s */
export const esc = (s) => s.replace(/[&<>"']/g, (c) => ESC[c]);

const CSS = `
:host { display: inline-block; vertical-align: bottom; height: 20rem; line-height: 0; }
:host([hidden]) { display: none; }
svg { display: block; height: 100%; width: auto; overflow: visible; }
[data-teil] { transform-box: view-box; }
[data-in] { opacity: 0; }
text { font-family: "Andika", sans-serif; font-weight: 700; }
`;

/** Wenig Bewegung gewünscht? (kein Plattform-Zugriff: nur eine Medienabfrage) */
const wenigBewegung = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Bereits angestoßene Nachlade-Versuche je Art. */
const geladen = new Set();

const Basis = /** @type {typeof HTMLElement} */ (globalThis.HTMLElement ?? class {});

export class LsObjekt extends Basis {
  static observedAttributes = ["art", "zustand", "wert"];

  constructor() {
    super();
    const wurzel = this.attachShadow({ mode: "open" });
    wurzel.innerHTML = `<style>${CSS}</style><style class="zustand"></style><span class="bild"></span>`;
    this.regel = /** @type {HTMLStyleElement} */ (wurzel.querySelector("style.zustand"));
    this.huelle = /** @type {HTMLElement} */ (wurzel.querySelector(".bild"));
    /** @type {Animation[]} */
    this.laufend = [];
    /** Gezeichneter Zustand (für die nächste Bewegung). @type {string | null} */
    this.gezeigt = null;
    /** Gezeichnet für art und wert. */
    this.schluessel = "";
    this.gemeldet = false;
    this.nachladen = () => this.zeichne();
  }

  connectedCallback() {
    if (!this.hasAttribute("aria-hidden") && !this.hasAttribute("role")) this.setAttribute("aria-hidden", "true");
    this.zeichne();
  }

  disconnectedCallback() {
    warten.delete(this.nachladen);
  }

  /** @param {string} name @param {string|null} alt @param {string|null} neu */
  attributeChangedCallback(name, alt, neu) {
    if (alt === neu) return;
    if (name === "zustand" && this.gezeigt !== null && this.schluessel === this.schluesselJetzt()) this.bewege();
    else this.zeichne();
  }

  get art() { return this.getAttribute("art") ?? ""; }

  /** Gültiger Zustand: Attribut, sonst der erste der Art. */
  get zustand() {
    const def = objekte.get(this.art);
    const z = this.getAttribute("zustand") ?? "";
    return def && def.zustaende.includes(z) ? z : def?.zustaende[0] ?? "";
  }

  set zustand(wert) { this.setAttribute("zustand", wert); }

  schluesselJetzt() { return `${this.art}|${this.getAttribute("wert") ?? ""}`; }

  /** @param {string} grund */
  melde(grund) {
    if (this.gemeldet) return;
    this.gemeldet = true;
    protokoll(`ls-objekt: ${grund}`);
  }

  /** Zeichnet den aktuellen Zustand ohne Bewegung. */
  zeichne() {
    this.ueberspringe();
    const art = this.art;
    const def = objekte.get(art);
    if (!def) {
      this.huelle.innerHTML = "";
      this.gezeigt = null;
      if (!art) return;
      if (!NAME.test(art)) { this.melde(`ungültige Art ${art}`); return; }
      warten.add(this.nachladen);
      if (!geladen.has(art)) {
        geladen.add(art);
        import(new URL(`./${art}.js`, import.meta.url).href).catch(() => this.melde(`unbekannte Art ${art}`));
      }
      return;
    }
    warten.delete(this.nachladen);
    const zustand = this.zustand;
    this.huelle.innerHTML = def.zeichne(zustand, { wert: this.getAttribute("wert") ?? "" });
    this.regel.textContent = `[data-in~="${zustand}"] { opacity: 1; }`;
    this.gezeigt = zustand;
    this.schluessel = this.schluesselJetzt();
  }

  /** Spielt die Bewegung vom gezeigten zum neuen Zustand (oder zeigt ihn sofort). */
  bewege() {
    const def = objekte.get(this.art);
    const von = this.gezeigt ?? "";
    this.ueberspringe();
    const nach = this.zustand;
    if (!def || von === nach) return;
    this.regel.textContent = `[data-in~="${nach}"] { opacity: 1; }`;
    this.gezeigt = nach;
    if (this.hasAttribute("still") || wenigBewegung()) return;
    this.spiele(def.bewegung?.(von, nach) ?? []);
  }

  /**
   * Kurze Antwort auf einen Anstoß, z. B. wenn ein Ding hineinfällt (wirf()). Der Zustand bleibt.
   * @param {string} [ding] Art des Dings, das hineinfällt
   * @returns {Promise<void>}
   */
  anstossen(ding = "") {
    const def = objekte.get(this.art);
    if (!def?.anstoss || this.hasAttribute("still") || wenigBewegung()) return Promise.resolve();
    this.ueberspringe();
    return this.spiele(def.anstoss(ding));
  }

  /**
   * Setzt den Zustand und wartet, bis die Bewegung zu Ende ist.
   * @param {string} zustand @returns {Promise<void>}
   */
  wechsle(zustand) {
    this.setAttribute("zustand", zustand);
    return this.fertig();
  }

  /** @returns {Promise<void>} wenn die laufende Bewegung endet (sofort, wenn keine läuft) */
  fertig() {
    return Promise.all(this.laufend.map((a) => a.finished.catch(() => undefined))).then(() => undefined);
  }

  /** Springt ans Ende der laufenden Bewegung (B6). */
  ueberspringe() {
    const alle = this.laufend;
    this.laufend = [];
    for (const a of alle) {
      try { a.finish(); } catch { a.cancel(); }
    }
  }

  /**
   * Einwurfpunkt im Fenster (px) und Breite, auf die ein hineinfallendes Ding schrumpft; null, wenn die Art keinen hat.
   * @returns {{ x: number, y: number, breite: number } | null}
   */
  einwurfPunkt() {
    const def = objekte.get(this.art);
    const svg = this.huelle.querySelector("svg");
    if (!def?.einwurf || !svg) return null;
    const box = svg.viewBox.baseVal;
    const r = svg.getBoundingClientRect();
    const k = r.width / box.width;
    return { x: r.left + (def.einwurf[0] - box.x) * k, y: r.top + (def.einwurf[1] - box.y) * k, breite: def.einwurf[2] * k };
  }

  /** @param {Schritt[]} schritte @returns {Promise<void>} */
  spiele(schritte) {
    const wurzel = /** @type {ShadowRoot} */ (this.shadowRoot);
    for (const s of schritte) {
      for (const el of wurzel.querySelectorAll(`[data-teil="${s.teil}"]`)) {
        if (typeof el.animate !== "function") continue;
        this.laufend.push(el.animate(s.keyframes, {
          duration: s.dauer, delay: s.beginn ?? 0, easing: s.easing ?? "ease-in-out", fill: "backwards",
        }));
      }
    }
    return this.fertig();
  }
}

if (globalThis.customElements && !customElements.get("ls-objekt")) customElements.define("ls-objekt", LsObjekt);

/**
 * Lässt ein Ding (ein ls-objekt, z. B. papier oder dose) im Bogen in ein Ziel fliegen (ein ls-objekt mit
 * Einwurfpunkt, z. B. eine Tonne). Ist das Ziel zu, geht sein Deckel dabei auf (oeffne: false verhindert das).
 * Am Ziel verschwindet das fliegende Ding (hidden) und das Ziel lässt es hineinfallen (anstossen). Etwa 1 s.
 * ueberspringe(): sofort am Ende (Ding drin, Tonne offen, kein Hineinfallen); abbrechen() vor der Ankunft: Ding
 * bleibt am Start, ein dabei geöffneter Deckel ist sofort wieder im alten Zustand; fertig → "abgebrochen".
 * Bei wenig Bewegung sofort am Ende. Bewegt wird über die Eigenschaften translate, rotate und scale; ein
 * transform aus dem CSS der Seite bleibt also unberührt.
 * @param {HTMLElement} ding @param {LsObjekt} ziel @param {{ dauer?: number, oeffne?: boolean }} [o]
 * @returns {{ fertig: Promise<"angekommen"|"abgebrochen">, ueberspringe: () => void, abbrechen: () => void }}
 */
export function wirf(ding, ziel, o = {}) {
  const dauer = o.dauer ?? 650;
  /** @type {(v: "angekommen"|"abgebrochen") => void} */
  let fertigMit = () => {};
  const fertig = /** @type {Promise<"angekommen"|"abgebrochen">} */ (new Promise((ok) => { fertigMit = ok; }));
  let vorbei = false;
  /** @type {Animation | null} */
  let flug = null;
  /** @param {boolean} [sofort] übersprungen: kein Hineinfallen, die Tonne steht sofort im Endzustand */
  const ankommen = (sofort = false) => {
    if (vorbei) return;
    vorbei = true;
    ding.hidden = true;
    if (sofort || wenigBewegung()) {
      ziel.ueberspringe?.();
      fertigMit("angekommen");
      return;
    }
    const antwort = ziel.anstossen?.(ding.getAttribute("art") ?? "") ?? Promise.resolve();
    antwort.then(() => fertigMit("angekommen"));
  };
  const vorher = ziel.getAttribute("zustand");
  let geoeffnet = false;
  if (o.oeffne !== false && ziel.zustand === "zu" && objekte.get(ziel.art)?.zustaende.includes("offen")) {
    ziel.zustand = "offen";
    geoeffnet = true;
  }
  const punkt = ziel.einwurfPunkt?.();
  if (!punkt || wenigBewegung() || typeof ding.animate !== "function") {
    ankommen();
    return { fertig, ueberspringe: () => {}, abbrechen: () => {} };
  }
  const r = ding.getBoundingClientRect();
  const dx = punkt.x - (r.left + r.width / 2);
  const dy = punkt.y - (r.top + r.height / 2);
  const hoch = Math.max(r.height * 1.2, Math.abs(dx) * 0.35);
  const ende = Math.max(0.2, Math.min(1.2, punkt.breite / Math.max(1, r.width * 0.8)));
  /** @type {Keyframe[]} */
  const bahn = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    bahn.push({
      offset: t,
      translate: `${z(dx * t)}px ${z(dy * t - hoch * 4 * t * (1 - t))}px`,
      rotate: `${z(220 * t)}deg`,
      scale: `${z(1 + (ende - 1) * t)}`,
    });
  }
  flug = ding.animate(bahn, { duration: dauer, easing: "cubic-bezier(.35,.1,.55,1)" });
  flug.finished.then(() => ankommen(), () => {});
  return {
    fertig,
    /** Springt ans Ende: Ding ist drin, die Tonne steht offen (auch das Hineinfallen entfällt). */
    ueberspringe() {
      if (!vorbei) { flug?.cancel(); ankommen(true); } else ziel.ueberspringe?.();
    },
    /** Bricht vor der Ankunft ab: das Ding bleibt, wo es war, ein geöffneter Deckel ist sofort wieder zu. */
    abbrechen() {
      if (vorbei) return;
      vorbei = true;
      flug?.cancel();
      if (geoeffnet) {
        if (vorher === null) ziel.removeAttribute("zustand"); else ziel.setAttribute("zustand", vorher);
        ziel.ueberspringe?.();
      }
      fertigMit("abgebrochen");
    },
  };
}
