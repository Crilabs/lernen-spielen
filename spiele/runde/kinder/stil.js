// Zeichenhelfer für den Stil der Runde: aus einem Guss.
// Die Tintenlinie läuft nur um die Silhouette der ganzen Figur: Jede Form liefert ihre Fläche (ohne Rahmen)
// und ihre Kontur (nur Geometrie). zeichne.js legt alle Konturen als dicke Tintenfläche unter alle Flächen.
// Licht von oben links, eine flache Schattenstufe: Schattenton, darüber die Grundfarbe verkleinert um einen
// Punkt oben links (bei konvexen Formen bleibt sie innen, übrig bleibt eine Sichel unten rechts). Ohne clipPath,
// weil SVG-Teile keine id tragen dürfen.

export const INK = "#3B2A6B";

/** @typedef {{svg: string, kontur: string}} Stueck */

/** @param {number} n */
export const z = (n) => String(Math.round(n * 100) / 100);

/** @param {string} hex @returns {number[]} */
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

/**
 * Schattenton: Grundfarbe zur Tinte hin gemischt, damit alle Schatten in einer Familie liegen.
 * @param {string} hex @param {number} [anteil]
 */
export function dunkler(hex, anteil = 0.22) {
  const a = rgb(hex);
  const b = rgb(INK);
  return "#" + a.map((v, i) => Math.round(v + (b[i] - v) * anteil).toString(16).padStart(2, "0")).join("").toUpperCase();
}

/**
 * Lichtton: Grundfarbe zu warmem Weiß hin gemischt.
 * @param {string} hex @param {number} [anteil]
 */
export function heller(hex, anteil = 0.28) {
  const a = rgb(hex);
  const b = rgb("#FFF6E6");
  return "#" + a.map((v, i) => Math.round(v + (b[i] - v) * anteil).toString(16).padStart(2, "0")).join("").toUpperCase();
}

/** Mehrere Stücke zu einem. @param {...Stueck} teile @returns {Stueck} */
export const zusammen = (...teile) => ({ svg: teile.map((t) => t.svg).join(""), kontur: teile.map((t) => t.kontur).join("") });

/**
 * Fläche mit Schattenstufe. trenn: feine Linie im Schattenton um die Fläche, wo sie vor Gleichfarbigem liegt.
 * @param {string} geo Element ohne Füllung, z. B. `path d="…"` @param {string} farbe
 * @param {[number, number]} licht Punkt oben links in der Fläche
 * @param {{s?: number, trenn?: boolean, kontur?: boolean, glanz?: boolean}} [o] kontur: false = trägt nicht zur Silhouette bei;
 *   glanz: true = zusätzliche Lichtstufe (nur für einzelne, große Flächen)
 * @returns {Stueck}
 */
export function form(geo, farbe, licht, o = {}) {
  const [lx, ly] = licht;
  const s = o.s ?? 0.88;
  const g = s * 0.62;
  const s1 = 1 - (1 - s) * 0.45;
  return {
    svg: `<${geo} fill="${dunkler(farbe, 0.46)}" stroke="none"/>`
      + `<${geo} fill="${dunkler(farbe, 0.24)}" stroke="none" transform="translate(${z(lx)} ${z(ly)}) scale(${z(s1)}) translate(${z(-lx)} ${z(-ly)})"/>`
      + `<${geo} fill="${farbe}" stroke="none" transform="translate(${z(lx)} ${z(ly)}) scale(${s}) translate(${z(-lx)} ${z(-ly)})"/>`
      + (!o.glanz ? "" : `<${geo} fill="${heller(farbe)}" stroke="none" opacity="0.85"`
        + ` transform="translate(${z(lx)} ${z(ly)}) scale(${z(g)}) translate(${z(-lx)} ${z(-ly)})"/>`)
      + (o.trenn ? `<${geo} fill="none" stroke="${dunkler(farbe, 0.5)}" stroke-width="2"/>` : ""),
    kontur: o.kontur === false ? "" : `<${geo}/>`,
  };
}

/** Fläche ohne Schatten. @param {string} geo @param {string} farbe @returns {Stueck} */
export const flach = (geo, farbe) => ({ svg: `<${geo} fill="${farbe}" stroke="none"/>`, kontur: `<${geo}/>` });

/** Feine Innenlinie im Schattenton einer Farbe (Naht, Falte, Schnürung). @param {string} d @param {string} farbe @param {number} [w] */
export const naht = (d, farbe, w = 2.2) => ({ svg: `<path d="${d}" fill="none" stroke="${dunkler(farbe, 0.5)}" stroke-width="${w}"/>`, kontur: "" });

/** Falte oder Schlagschatten als dunkle Form (keine Linie). @param {string} d @param {string} farbe @param {number} [anteil] */
export const falte = (d, farbe, anteil = 0.32) => ({ svg: `<path d="${d}" fill="${dunkler(farbe, anteil)}" stroke="none"/>`, kontur: "" });

/** Glanzstrich (Haar, Stoff). @param {string} d @param {string} farbe @param {number} [w] */
export const glanz = (d, farbe, w = 2.6) => ({ svg: `<path d="${d}" fill="none" stroke="${heller(farbe, 0.42)}" stroke-width="${w}" opacity="0.8"/>`, kontur: "" });

/** Weiche Röte (Wangen). @param {number} cx @param {number} cy @param {number} rx @param {number} ry @param {number} [deckkraft] */
export const roete = (cx, cy, rx, ry, deckkraft = 0.35) => ({ svg: `<ellipse cx="${z(cx)}" cy="${z(cy)}" rx="${z(rx)}" ry="${z(ry)}" fill="#E9806A" opacity="${deckkraft}" stroke="none"/>`, kontur: "" });

/** Tintenlinie innen (Gesichtszüge, Brille). @param {string} d @param {number} [w] */
export const tinte = (d, w = 3) => ({ svg: `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w}"/>`, kontur: "" });

/** @param {string} d */
export const pfad = (d) => `path d="${d}"`;
/** @param {number} cx @param {number} cy @param {number} rx @param {number} ry */
export const oval = (cx, cy, rx, ry) => `ellipse cx="${z(cx)}" cy="${z(cy)}" rx="${z(rx)}" ry="${z(ry)}"`;

/**
 * Sich verjüngende Kapsel von p1 (Radius r1) nach p2 (Radius r2), als Geometrie für form().
 * @param {[number, number]} p1 @param {number} r1 @param {[number, number]} p2 @param {number} r2
 */
export function kapsel(p1, r1, p2, r2) {
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  const l = Math.hypot(dx, dy) || 1;
  const n = [-dy / l, dx / l];
  /** @param {[number, number]} p @param {number} r @param {number} k */
  const P = (p, r, k) => `${z(p[0] + n[0] * r * k)} ${z(p[1] + n[1] * r * k)}`;
  return pfad(`M${P(p1, r1, 1)} L${P(p2, r2, 1)} A${z(r2)} ${z(r2)} 0 0 0 ${P(p2, r2, -1)}`
    + ` L${P(p1, r1, -1)} A${z(r1)} ${z(r1)} 0 0 0 ${P(p1, r1, 1)} Z`);
}

/**
 * Glied mit durchgehendem Licht: Schatten als Streifen entlang der rechten Seite, Glanzstrich links,
 * beides nur auf dem geraden Stück. Die runden Enden bleiben im Grundton – dort stoßen die Nachbarteile an,
 * so entsteht an Ellbogen und Knie keine Naht. Gleiche Radien an der Stoßstelle wählen.
 * @param {[number, number]} p1 @param {number} r1 @param {[number, number]} p2 @param {number} r2 @param {string} farbe
 * @param {{trenn?: boolean, ansatz?: boolean}} [o] ansatz: Trennbogen auch am Anfang (Schulter vor dem Rumpf)
 * @returns {Stueck}
 */
export function glied(p1, r1, p2, r2, farbe, o = {}) {
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  const l = Math.hypot(dx, dy) || 1;
  const u = [dx / l, dy / l];
  const rechts = [dy / l, -dx / l];
  /** @param {[number, number]} p @param {number} k */
  const R = (p, k) => `${z(p[0] + rechts[0] * k)} ${z(p[1] + rechts[1] * k)}`;
  const geo = kapsel(p1, r1, p2, r2);
  // Schatten als nach rechts versetzte, schmalere Kapsel samt runder Enden. Versatz + Radius ≤ Radius des Glieds,
  // also bleibt sie innen. An der Stoßstelle liegen die Schatten beider Glieder übereinander und laufen durch.
  /** @param {number} versatz @param {number} anteil */
  const innen = (versatz, anteil) => {
    const q1 = /** @type {[number, number]} */ ([p1[0] + rechts[0] * r1 * versatz, p1[1] + rechts[1] * r1 * versatz]);
    const q2 = /** @type {[number, number]} */ ([p2[0] + rechts[0] * r2 * versatz, p2[1] + rechts[1] * r2 * versatz]);
    return kapsel(q1, r1 * (1 - versatz), q2, r2 * (1 - versatz)) + "";
  };
  const schatten = `<${innen(0.42, 0)} fill="${dunkler(farbe, 0.26)}" stroke="none"/>`
    + `<${innen(0.72, 0)} fill="${dunkler(farbe, 0.46)}" stroke="none"/>`;
  const a = [p1[0] + u[0] * 2, p1[1] + u[1] * 2];
  const b = [p2[0] - u[0] * 2, p2[1] - u[1] * 2];
  const glanzlinie = `<path d="M${z(a[0] - rechts[0] * r1 * 0.6)} ${z(a[1] - rechts[1] * r1 * 0.6)} L${z(b[0] - rechts[0] * r2 * 0.6)} ${z(b[1] - rechts[1] * r2 * 0.6)}"`
    + ` fill="none" stroke="${heller(farbe, 0.5)}" stroke-width="${z(Math.min(r1, r2) * 0.38)}" opacity="0.85"/>`;
  /** @param {[number, number]} p @param {number} k */
  const L = (p, k) => `${z(p[0] - rechts[0] * k)} ${z(p[1] - rechts[1] * k)}`;
  // Trennlinie nur an den Seitenkanten (und als Bogen am Ansatz), nie am Ende: dort schließt das nächste Teil an.
  const trenn = o.trenn
    ? `<path d="M${L(p1, r1)} L${L(p2, r2)} M${R(p1, r1)} L${R(p2, r2)}${o.ansatz ? ` M${R(p1, r1)} A${z(r1)} ${z(r1)} 0 0 0 ${L(p1, r1)}` : ""}"`
      + ` fill="none" stroke="${dunkler(farbe, 0.5)}" stroke-width="2"/>`
    : "";
  return { svg: `<${geo} fill="${farbe}" stroke="none"/>` + schatten + glanzlinie + trenn, kontur: `<${geo}/>` };
}

/**
 * Haarlocke: geschwungene, spitz zulaufende Strähne von der Wurzel b zur Spitze t.
 * Schattiert wie jede Fläche; licht: kleine helle Form auf der Locke (nur vorn), keine Linie.
 * @param {[number, number]} b Wurzel @param {[number, number]} t Spitze @param {number} breite
 * @param {number} bogen seitliche Wölbung (+ rechts, - links) @param {string} farbe
 * @param {{licht?: boolean}} [o]
 * @returns {Stueck}
 */
export function locke(b, t, breite, bogen, farbe, o = {}) {
  const dx = t[0] - b[0];
  const dy = t[1] - b[1];
  const l = Math.hypot(dx, dy) || 1;
  const n = [-dy / l, dx / l];
  const m = [b[0] + dx * 0.5 + n[0] * bogen, b[1] + dy * 0.5 + n[1] * bogen];
  const h = breite / 2;
  /** @param {number[]} p @param {number} k */
  const N = (p, k) => `${z(p[0] + n[0] * k)} ${z(p[1] + n[1] * k)}`;
  const d = `M${N(b, h)} Q${N(m, h * 0.75)} ${z(t[0])} ${z(t[1])} Q${N(m, -h * 0.75)} ${N(b, -h)} Z`;
  const teil = form(pfad(d), farbe, /** @type {[number, number]} */ ([b[0] + n[0] * h * 0.6, b[1] + n[1] * h * 0.6]), { s: 0.84 });
  if (!o.licht) return teil;
  const a1 = [b[0] + dx * 0.18 + n[0] * h * 0.35, b[1] + dy * 0.18 + n[1] * h * 0.35];
  const a2 = [b[0] + dx * 0.55 + n[0] * (bogen * 0.6 + h * 0.15), b[1] + dy * 0.55 + n[1] * (bogen * 0.6 + h * 0.15)];
  const mm = [(a1[0] + a2[0]) / 2 + n[0] * h * 0.22, (a1[1] + a2[1]) / 2 + n[1] * h * 0.22];
  const licht = `<path d="M${z(a1[0])} ${z(a1[1])} Q${z(mm[0])} ${z(mm[1])} ${z(a2[0])} ${z(a2[1])}`
    + ` Q${z((a1[0] + a2[0]) / 2)} ${z((a1[1] + a2[1]) / 2)} ${z(a1[0])} ${z(a1[1])} Z" fill="${heller(farbe, 0.3)}" stroke="none"/>`;
  return { svg: teil.svg + licht, kontur: teil.kontur };
}

/**
 * Pfad durch abwechselnd Kerben und Spitzen, jedes Stück leicht gewölbt (Haarschopf aus einem Stück).
 * @param {[number, number][]} punkte @param {number} [bogen] Wölbung relativ zur Stücklänge
 */
export function zacken(punkte, bogen = 0.18) {
  let d = `M${z(punkte[0][0])} ${z(punkte[0][1])}`;
  for (let i = 1; i < punkte.length; i++) {
    const [ax, ay] = punkte[i - 1];
    const [bx, by] = punkte[i];
    const dx = bx - ax;
    const dy = by - ay;
    d += ` Q${z((ax + bx) / 2 - dy * bogen)} ${z((ay + by) / 2 + dx * bogen)} ${z(bx)} ${z(by)}`;
  }
  return d + " Z";
}

/**
 * Pfad mit Buckeln zwischen den Punkten (Locken als ein Schopf). Im Uhrzeigersinn um die Form angeben,
 * dann wölben sich die Buckel nach außen.
 * @param {[number, number][]} punkte @param {number} [rund] 1 = Halbkreis, kleiner = flacher
 */
export function buckel(punkte, rund = 1) {
  let d = `M${z(punkte[0][0])} ${z(punkte[0][1])}`;
  for (let i = 1; i <= punkte.length; i++) {
    const [ax, ay] = punkte[i - 1];
    const [bx, by] = punkte[i % punkte.length];
    const r = (Math.hypot(bx - ax, by - ay) / 2) / Math.max(0.3, rund);
    d += ` A${z(r)} ${z(r)} 0 0 1 ${z(bx)} ${z(by)}`;
  }
  return d + " Z";
}

/**
 * Handformen an einem Handgelenk w; die Hand zeigt in Richtung +y (Arm hängt) und dreht mit dem Unterarm.
 * daumen = +1: Daumen rechts, -1: links.
 * @param {[number, number]} w @param {string} haut @param {1|-1} daumen
 * @returns {{offen: Stueck, faust: Stueck, zeigen: Stueck}}
 */
export function haende(w, haut, daumen) {
  const [mx, wy] = w;
  const my = wy + 9;
  const fein = dunkler(haut, 0.55);
  /** Fläche mit feiner Linie im dunklen Hautton, damit Finger einzeln lesbar bleiben. @param {string} geo */
  const hautteil = (geo) => ({ svg: `<${geo} fill="${haut}" stroke="${fein}" stroke-width="1.8"/>`, kontur: `<${geo}/>` });
  /** @param {number} grad @param {number} laenge @param {number} [r] */
  const finger = (grad, laenge, r = 3.3) => {
    const a = (grad * Math.PI) / 180;
    const p1 = /** @type {[number, number]} */ ([mx + Math.sin(a) * 4, my + Math.cos(a) * 4]);
    const p2 = /** @type {[number, number]} */ ([mx + Math.sin(a) * (7 + laenge), my + Math.cos(a) * (7 + laenge)]);
    return hautteil(kapsel(p1, r, p2, r * 0.88));
  };
  const d = hautteil(kapsel([mx + daumen * 5, my - 3], 4, [mx + daumen * 12.5, my + 3.5], 3.3));
  const teller = { svg: `<ellipse cx="${z(mx)}" cy="${z(my)}" rx="9" ry="9" fill="${haut}" stroke="none"/>`, kontur: `<${oval(mx, my, 9, 9)}/>` };
  const schatten = falte(`M${z(mx + 2)} ${z(my - 8)} C${z(mx + 9)} ${z(my - 5)} ${z(mx + 10)} ${z(my + 5)} ${z(mx + 4)} ${z(my + 9)}`
    + ` C${z(mx + 7)} ${z(my + 3)} ${z(mx + 7)} ${z(my - 3)} ${z(mx + 2)} ${z(my - 8)} Z`, haut, 0.25);
  const faust = zusammen(hautteil(oval(mx, my + 1, 9.5, 9)), schatten,
    naht(`M${z(mx - 5)} ${z(my + 4)} Q${z(mx)} ${z(my + 7)} ${z(mx + 5)} ${z(my + 4)}`, haut));
  return {
    offen: zusammen(...[-40, -14, 12, 38].map((g, i) => finger(g, i === 0 || i === 3 ? 5 : 7)), teller, d, schatten),
    faust: zusammen(faust, d),
    zeigen: zusammen(faust, finger(0, 12, 3.6)),
  };
}
