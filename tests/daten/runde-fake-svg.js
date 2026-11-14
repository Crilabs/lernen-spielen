// Sehr kleines Ersatz-DOM für steuere(): kennt nur, was steuere braucht.
// Wurzel: Attribute, innerHTML (setzen = neu einlesen), querySelector/All mit [attr] und [attr="wert"].
// Innere Elemente: alle <g …>-Tags mit ihren Attributen; innerHTML lässt sich setzen und lesen.

const ATTR = /([\w-]+)="([^"]*)"/g;

function element(attrs) {
  return {
    attrs,
    innerHTML: "",
    getAttribute: (n) => (n in attrs ? attrs[n] : null),
    setAttribute: (n, v) => { attrs[n] = String(v); },
  };
}

function passt(el, sel) {
  const m = /^\[([\w-]+)(?:="([^"]*)")?\]$/.exec(sel);
  if (!m) throw new Error(`Fake-SVG kennt den Selektor ${sel} nicht`);
  return m[2] === undefined ? m[1] in el.attrs : el.attrs[m[1]] === m[2];
}

/** @param {string} text vollständiger SVG-Text aus zeichne() */
export function fakeSvg(text) {
  const kopf = /^<svg\b([^>]*)>/.exec(text);
  const wurzel = element(Object.fromEntries([...kopf[1].matchAll(ATTR)].map((m) => [m[1], m[2]])));
  let inhalt = "";
  let kinder = [];
  const lies = (html) => {
    inhalt = html;
    kinder = [...html.matchAll(/<g\b([^>]*)>/g)].map((m) => element(Object.fromEntries([...m[1].matchAll(ATTR)].map((a) => [a[1], a[2]]))));
  };
  lies(text.slice(kopf[0].length, text.lastIndexOf("</svg>")));
  Object.defineProperty(wurzel, "innerHTML", { get: () => inhalt, set: lies });
  wurzel.querySelector = (sel) => kinder.find((k) => passt(k, sel)) ?? null;
  wurzel.querySelectorAll = (sel) => kinder.filter((k) => passt(k, sel));
  return wurzel;
}

/** Gefälschte Uhr mit Frame-Warteschlange. */
export function uhr() {
  let jetzt = 0;
  let warte = [];
  return {
    jetzt: () => jetzt,
    naechsterFrame: (cb) => { warte.push(cb); },
    /** Zeit in 16-ms-Frames vorspulen. */
    async spule(ms) {
      const ziel = jetzt + ms;
      while (jetzt < ziel) {
        await new Promise((r) => setImmediate(r));
        jetzt = Math.min(ziel, jetzt + 16);
        const jetztDran = warte;
        warte = [];
        jetztDran.forEach((cb) => cb(jetzt));
      }
      await new Promise((r) => setImmediate(r));
    },
  };
}

/** Drehwinkel aus einem transform-Attribut „… rotate(w x y)“. */
export const winkelAus = (tr) => Number(/rotate\((-?[\d.]+) /.exec(tr)?.[1]);
