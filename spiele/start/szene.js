// Szene der Startseite: Wiese mit Baumhaus (Spec docs/superpowers/specs/2026-11-14-startseite-treffpunkt-design.md §5).
// Ein SVG in vier Ebenen (himmel, ferne, mitte, vorne), Stimmungsebene: kein Text, keine Lernzeichen.
// Gezeichnet wie die Runde (figuren.md §4, Helfer in zeichnen.js): Kontur nur um die Silhouette und so fein wie bei
// den Figuren (sichtbar 3,6 Einheiten, überall gleich), Licht von oben links in Stufen (Kernschatten,
// weicher Schatten, Grundton, Licht), Fugen und Maserung fein im dunklen Ton der Fläche, Schlagschatten an
// Stoßstellen. Verlauf nur im Himmel.
//
// Koordinaten: viewBox 0 0 2880 1080, 1 Einheit = 0,1 rem. Die Seite legt das SVG in eine Box von 288 × 108 rem,
// waagrecht mittig. Sichtbar ist bei 16:9 x 480–2400, bei 4:3 x 720–2160. Was bedienbar ist, liegt in 4:3 (ORTE).

import { TINTE as T, KONTUR, zeichner, form, flach, ton, naht, zusammen, dunkler, heller, z } from "./zeichnen.js";

export const SZENE = Object.freeze({ breite: 2880, hoehe: 1080, horizont: 600 });

/**
 * Orte der bedienbaren Teile und der Runde in rem (Box-Koordinaten), damit HTML und SVG dieselben Zahlen nutzen.
 * x/y oben links, b Breite, h Höhe.
 */
export const ORTE = Object.freeze({
  /** Öffnung des Baumhauses, darin das Regal. */
  regal: { x: 182, y: 27, b: 28, h: 18 },
  /** Fach-Knöpfe: Spalte am linken Rand (ab vier Fächern zwei Spalten). */
  faecher: { x: 75, y: 62, b: 26 },
  /** Bis zu drei Tore auf der Anhöhe (Fuß der Pfosten bei y + h); Luft zum Baumhaus (Dachüberstand bei 175,5). */
  tore: [
    { x: 78, y: 10, b: 28, h: 44 },
    { x: 110, y: 8, b: 28, h: 44 },
    { x: 142, y: 10, b: 28, h: 44 },
  ],
  /** Die Runde: x/b umfassen den Körper, fuss ist die Höhe der Füße, skala die Größe. */
  runde: [
    { kind: "ela", x: 107, b: 16, fuss: 103, skala: 1, haltung: "stehen", blick: "rechts" },
    { kind: "kofi", x: 133, b: 16, fuss: 100, skala: 0.96, haltung: "nachdenken", blick: "rechts" },
    { kind: "lena", x: 160, b: 16, fuss: 104, skala: 1, haltung: "freuen-klein", blick: "links" },
    { kind: "timo", x: 186, b: 22, fuss: 101, skala: 0.98, haltung: "stehen", blick: "links" },
  ],
  /** Tiere (spiele/runde/tiere): x/b die ganze Zeichnung, fuss die Standhöhe; boden: wirft einen Bodenschatten.
   *  Die Tiere liegen vor der Runde (die Maus sitzt vorn zwischen Ela und Kofi). */
  tiere: [
    { tier: "hase", x: 165, b: 13.1, fuss: 72, skala: 0.9, blick: "links", boden: true },
    { tier: "maus", x: 121.7, b: 12.6, fuss: 106.6, skala: 1.3, blick: "rechts", boden: true },
    { tier: "rotkehlchen", x: 174.6, b: 6.1, fuss: 45.6, skala: 1, blick: "links", boden: false },
  ],
});

const K = KONTUR;

/** @typedef {{tageszeit: "morgen"|"tag"|"abend"|"nacht", jahreszeit: "fruehling"|"sommer"|"herbst"|"winter"}} Zeitbild */
/** @typedef {import("./zeichnen.js").Stueck} Stueck */

/** Grundtöne je Stimmung (Schatten und Licht leiten sich mit dunkler/heller ab). Stufe 1: Sommer am Tag. */
const PALETTEN = {
  "sommer-tag": {
    himmelOben: "#8FCBF2", himmelUnten: "#E4F5FB", sonne: "#FFD95A", wolke: "#FBFDFF",
    fern: "#BEE0AC", fernBaum: "#8FC883", huegel: "#A3D68B", wiese: "#93CD7B", vorne: "#9BD283",
    weg: "#EED9B8", stamm: "#A8744A", krone: "#6CBB69", holz: "#E3B57D", dach: "#E27D62", innen: "#F6E7CC", innenSchatten: "#EBD3AE", innenKern: "#DCBC8E",
    gras: "#74B962", bluete1: "#FFFFFF", bluete2: "#F7D038", bluete3: "#F4A3C0",
  },
};

/** Ein Zufall, der immer gleich ausgeht (feste Saat), für Grasbüschel und Blätter. @param {number} saat */
function folge(saat) {
  let x = saat;
  return () => { x = (x * 16807) % 2147483647; return (x - 1) / 2147483646; };
}

// ---------------------------------------------------------------------------------------------------
// Bausteine

/**
 * Gelände: eine Fläche mit Kammlinie; Stufen laufen parallel zur Kammlinie (Licht oben, weicher Schatten,
 * Kernschatten unten), alles auf die Fläche zugeschnitten.
 * @param {ReturnType<typeof zeichner>} zz @param {string} kamm Pfad der Kammlinie von links nach rechts (ab „M0 …“)
 * @param {string} farbe @param {[number, number, number]} [abstaende] Lichtkante, weicher Schatten, Kernschatten
 * @param {string} [extra] weitere Formen in der Fläche (Grasstriche)
 */
function gelaende(zz, kamm, farbe, abstaende = [12, 90, 190], extra = "") {
  const d = `${kamm} L2880 1100 L0 1100Z`;
  const geo = `path d="${d}"`;
  const [l, s, k] = abstaende;
  const schicht = (/** @type {number} */ dy, /** @type {string} */ f) => `<path d="${d}" fill="${f}" transform="translate(0 ${dy})"/>`;
  return zz.guss(
    flach(geo, heller(farbe, 0.3)),
    zz.innen([geo], schicht(l, farbe) + schicht(s, dunkler(farbe, 0.1)) + schicht(k, dunkler(farbe, 0.2)) + extra),
  );
}

/**
 * Kleine Halmgruppen als Flächen im Schattenton (keine Linien, damit es nur eine Strichstärke gibt).
 * @param {number} saat @param {number} anzahl @param {[number, number]} xb @param {(x: number) => number} yVon
 * @param {number} streu @param {string} farbe
 */
function grasstriche(saat, anzahl, xb, yVon, streu, farbe) {
  const r = folge(saat);
  let d = "";
  for (let i = 0; i < anzahl; i++) {
    const x = xb[0] + r() * (xb[1] - xb[0]);
    const y = yVon(x) + 20 + r() * streu;
    const h = 10 + r() * 10;
    d += `M${z(x - 9)} ${z(y)} Q${z(x - 7)} ${z(y - h * 0.5)} ${z(x - 11)} ${z(y - h)} Q${z(x - 3)} ${z(y - h * 0.5)} ${z(x - 1)} ${z(y)}Z`
      + `M${z(x - 2)} ${z(y)} Q${z(x + 1)} ${z(y - h * 0.7)} ${z(x + 2)} ${z(y - h * 1.3)} Q${z(x + 5)} ${z(y - h * 0.6)} ${z(x + 5)} ${z(y)}Z`
      + `M${z(x + 4)} ${z(y)} Q${z(x + 8)} ${z(y - h * 0.4)} ${z(x + 12)} ${z(y - h * 0.9)} Q${z(x + 10)} ${z(y - h * 0.3)} ${z(x + 11)} ${z(y)}Z`;
  }
  return `<path d="${d}" fill="${dunkler(farbe, 0.16)}"/>`;
}

/**
 * Brett oder Balken: Grundton, Lichtkante oben, Kernschatten unten und rechts, Maserung.
 * @param {number} x @param {number} y @param {number} b @param {number} h @param {string} farbe
 * @param {{rx?: number, maserung?: number, kontur?: boolean}} [o]
 * @returns {Stueck}
 */
function brett(x, y, b, h, farbe, o = {}) {
  const rx = o.rx ?? Math.min(6, b / 3, h / 3);
  const geo = `rect x="${z(x)}" y="${z(y)}" width="${z(b)}" height="${z(h)}" rx="${z(rx)}"`;
  const kern = Math.max(2, Math.min(7, Math.min(b, h) * 0.22));
  const licht = Math.min(4, h * 0.18);
  let mas = "";
  const r = folge(Math.round(x * 7 + y * 13 + 1));
  for (let i = 0; i < (o.maserung ?? 0); i++) {
    const t = 0.25 + r() * 0.5;
    if (b >= h) {
      const yy = y + h * t, x0 = x + b * r() * 0.3, x1 = x + b * (0.6 + r() * 0.35);
      mas += `M${z(x0)} ${z(yy)} Q${z((x0 + x1) / 2)} ${z(yy + (r() - 0.5) * 4)} ${z(x1)} ${z(yy)}`;
    } else {
      const xx = x + b * t, y0 = y + h * r() * 0.3, y1 = y + h * (0.6 + r() * 0.35);
      mas += `M${z(xx)} ${z(y0)} Q${z(xx + (r() - 0.5) * 4)} ${z((y0 + y1) / 2)} ${z(xx)} ${z(y1)}`;
    }
  }
  return zusammen(
    flach(geo, farbe, o.kontur !== false),
    ton(`M${z(x + b - kern)} ${z(y + rx)} L${z(x + b)} ${z(y + rx)} L${z(x + b)} ${z(y + h - rx)} Q${z(x + b)} ${z(y + h)} ${z(x + b - rx)} ${z(y + h)} L${z(x + rx)} ${z(y + h)} L${z(x + rx)} ${z(y + h - kern)} L${z(x + b - kern)} ${z(y + h - kern)}Z`, dunkler(farbe, 0.3)),
    ton(`M${z(x + rx)} ${z(y + 1.5)} L${z(x + b - rx)} ${z(y + 1.5)} L${z(x + b - rx)} ${z(y + 1.5 + licht)} L${z(x + rx)} ${z(y + 1.5 + licht)}Z`, heller(farbe, 0.3)),
    mas ? naht(mas, farbe, 1.6) : { svg: "", kontur: "" },
  );
}

/**
 * Laub- oder Wolkenbüschel: Kreise mit Sichelschatten, hinten zuerst; die Kontur läuft nur außen herum.
 * @param {[number, number, number][]} kreise [cx, cy, r], von hinten nach vorn
 * @param {string} farbe @param {{tiefe?: number, glanzAb?: number}} [o] glanzAb: Kreise oberhalb dieser Höhe bekommen Licht
 * @returns {Stueck[]}
 */
function bueschel(kreise, farbe, o = {}) {
  return kreise.map(([cx, cy, r]) => form(`circle cx="${z(cx)}" cy="${z(cy)}" r="${z(r)}"`, farbe, [cx - r * 0.45, cy - r * 0.55],
    { s: 0.86, tiefe: o.tiefe, glanz: o.glanzAb !== undefined && cy < o.glanzAb }));
}

// ---------------------------------------------------------------------------------------------------
// Ebenen

/** @param {Record<string, string>} p */
function himmel(p) {
  const zz = zeichner("himmel", K);
  const wolke = (/** @type {number} */ x, /** @type {number} */ y, /** @type {number} */ s) => {
    const k = (/** @type {number} */ dx, /** @type {number} */ dy, /** @type {number} */ r) => /** @type {[number, number, number]} */ ([x + dx * s, y + dy * s, r * s]);
    const unten = `rect x="${z(x - 34 * s)}" y="${z(y + 2 * s)}" width="${z(232 * s)}" height="${z(44 * s)}" rx="${z(22 * s)}"`;
    return `<g class="wolke">${zz.guss(
      ...bueschel([k(52, -26, 60), k(112, -10, 50), k(0, -2, 44), k(160, 10, 36)], p.wolke, { tiefe: 0.38 }),
      form(unten, p.wolke, [x, y], { s: 0.9, tiefe: 0.38 }),
    )}</g>`;
  };
  // Die Sonne ist die Lichtquelle: kein Schatten, ein leuchtender Kern statt einer Wölbung.
  const sonne = zz.guss(flach(`circle cx="640" cy="150" r="76"`, p.sonne), ton("M640 92 A58 58 0 1 1 639.9 92Z", heller(p.sonne, 0.45)));
  return `<g id="himmel">
<defs><linearGradient id="himmelVerlauf" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="${p.himmelOben}"/><stop offset="1" stop-color="${p.himmelUnten}"/></linearGradient></defs>
<rect width="2880" height="760" fill="url(#himmelVerlauf)"/>
<circle cx="640" cy="150" r="118" fill="#FFFBE8" opacity="0.5"/>
${sonne}${wolke(470, 300, 0.8)}${wolke(1460, 120, 0.8)}${wolke(2420, 260, 0.9)}
</g>`;
}

/** @param {Record<string, string>} p */
function ferne(p) {
  const zz = zeichner("ferne", K);
  const kamm = "M0 560 C260 470 520 500 760 520 C1000 540 1240 450 1560 450 C1860 450 2060 520 2320 500 C2560 480 2720 450 2880 470";
  const baum = (/** @type {number} */ x, /** @type {number} */ y, /** @type {number} */ r) => zz.guss(
    brett(x - r * 0.12, y + r * 0.3, r * 0.24, r * 0.9, dunkler(p.stamm, 0.05)),
    ...bueschel([[x - r * 0.5, y + r * 0.2, r * 0.66], [x + r * 0.55, y + r * 0.18, r * 0.7], [x, y - r * 0.2, r * 0.8], [x - r * 0.1, y + r * 0.35, r * 0.6]], p.fernBaum, { tiefe: 0.8 }),
  );
  return `<g id="ferne">${gelaende(zz, kamm, p.fern, [8, 50, 120])}
${baum(330, 500, 46)}${baum(420, 522, 34)}${baum(1640, 432, 40)}${baum(1730, 452, 30)}${baum(2560, 456, 44)}${baum(2660, 472, 32)}
</g>`;
}

/** @param {Record<string, string>} p */
function baumUndHaus(p) {
  const zz = zeichner("baum", K);
  const r = folge(7);

  // Krone: viele Büschel, hinten (oben) zuerst, vorn (unten) zuletzt.
  /** @type {[number, number, number][]} */
  const kreise = [];
  for (const [cx, cy, rr] of [[1960, 150, 210], [1760, 230, 150], [2170, 210, 160], [1610, 390, 105], [2330, 400, 120]]) {
    const n = Math.round(rr / 22);
    for (let i = 0; i < n; i++) {
      const w = (i / n) * Math.PI * 2 + r() * 0.4;
      const d = rr * (0.45 + r() * 0.45);
      kreise.push([cx + Math.cos(w) * d, cy + Math.sin(w) * d * 0.85, 52 + r() * 46]);
    }
    kreise.push([cx, cy, rr * 0.55]);
  }
  // Hinter dem Haus geschlossen: Büschel an beiden Seiten bis zur Plattform (sonst schaut der Himmel durch).
  kreise.push([1730, 330, 90], [1700, 420, 72], [1760, 440, 60], [2190, 320, 90], [2220, 410, 78], [2170, 450, 60], [2270, 470, 62]);
  kreise.sort((a, b) => a[1] - b[1]);
  const krone = zz.guss(...bueschel(kreise, p.krone, { glanzAb: 210 }));

  // Stamm mit Wurzelfuß, Rinde als feine Linien, Schlagschatten der Plattform oben.
  const stammD = "M1905 470 L1900 700 C1890 740 1860 760 1830 770 L2070 770 C2040 760 2010 740 2002 700 L1998 470Z";
  const stamm = zz.guss(
    flach(`path d="${stammD}"`, p.stamm),
    zz.innen([`path d="${stammD}"`],
      `<path d="M1972 470 L2002 470 L2002 700 C2010 740 2040 760 2070 770 L1990 770 C1980 740 1972 720 1970 700Z" fill="${dunkler(p.stamm, 0.22)}"/>`
      + `<path d="M1990 470 L2002 470 L2002 700 C2010 740 2040 760 2070 770 L2030 770 C2008 750 1996 730 1994 700Z" fill="${dunkler(p.stamm, 0.36)}"/>`
      + `<path d="M1908 470 L1922 470 L1918 700 C1914 730 1898 750 1872 766 L1856 766 C1886 748 1904 726 1906 700Z" fill="${heller(p.stamm, 0.24)}"/>`
      + `<rect x="1890" y="470" width="130" height="34" fill="${dunkler(p.stamm, 0.4)}"/>`
      + naht("M1935 520 C1930 580 1940 620 1932 690M1958 540 C1962 600 1952 640 1960 720M1984 515 C1980 560 1988 600 1982 650M1925 600 Q1930 612 1924 626", p.stamm, 1.8).svg
      + `<ellipse cx="1950" cy="640" rx="9" ry="14" fill="${dunkler(p.stamm, 0.45)}"/>`),
  );

  // Rampe nach rechts unten (Timo kommt hinauf; wird nie erwähnt): Belag mit Brettfugen, Seitenkante, Geländer.
  const yR = (/** @type {number} */ x) => 470 + (x - 2140) * 0.625;
  let fugen = "";
  for (let x = 2170; x < 2610; x += 30) fugen += `M${x} ${z(yR(x))} L${x} ${z(yR(x) + 18)}`;
  const rampe = zz.guss(
    ...[2230, 2340, 2450, 2560].map((x) => brett(x - 7, yR(x) - 74, 14, 82, p.holz, { rx: 5 })),
    flach(`path d="M2140 470 L2620 770 L2620 800 L2140 500Z"`, p.holz),
    ton(`M2140 488 L2620 788 L2620 800 L2140 500Z`, dunkler(p.holz, 0.32)),
    ton(`M2140 470 L2620 770 L2620 775 L2140 475Z`, heller(p.holz, 0.3)),
    naht(fugen, p.holz, 1.6),
    flach(`path d="M2150 398 L2600 680 L2600 694 L2150 412Z"`, p.holz),
    ton(`M2150 406 L2600 688 L2600 694 L2150 412Z`, dunkler(p.holz, 0.3)),
  );

  // Leiter links vom Stamm.
  const leiter = zz.guss(
    brett(1806, 480, 16, 292, p.holz, { rx: 6, maserung: 2 }), brett(1886, 480, 16, 292, p.holz, { rx: 6, maserung: 2 }),
    ...[540, 600, 660, 720].map((y) => brett(1806, y, 96, 14, p.holz, { rx: 6 })),
  );

  // Haus: Plattform, Wände aus Brettern mit Fugen und Maserung, Eckpfosten, Ziegeldach, große Öffnung vorn.
  const o = ORTE.regal;
  const ox = o.x * 10, oy = o.y * 10, ob = o.b * 10, oh = o.h * 10;
  /** @type {Stueck[]} */
  const wand = [];
  for (let y = 244, i = 0; y < 460; y += 36, i++) wand.push(brett(1790, y, 340, Math.min(36, 460 - y), i % 2 ? dunkler(p.holz, 0.05) : p.holz, { rx: 2, maserung: 3, kontur: false }));
  let ziegel = "";
  for (let reihe = 0; reihe < 4; reihe++) {
    const y = 160 + reihe * 24;
    const breite = (y - 128) / 117 * 205;
    for (let x = 1960 - breite; x < 1960 + breite - 10; x += 26) ziegel += `M${z(x)} ${y} q13 14 26 0`;
  }
  const dachD = "M1755 245 L1960 128 L2165 245 Z";
  const rueck = `rect x="${ox}" y="${oy}" width="${ob}" height="${oh}" rx="22"`;
  const haus = zz.guss(
    brett(1740, 455, 440, 40, p.holz, { rx: 10, maserung: 4 }),
    flach(`rect x="1790" y="244" width="340" height="221" rx="6"`, p.holz),
    ...wand,
    brett(1784, 240, 22, 222, dunkler(p.holz, 0.08), { rx: 6, maserung: 2 }), brett(2114, 240, 22, 222, dunkler(p.holz, 0.08), { rx: 6, maserung: 2 }),
    ton("M1790 245 L2130 245 L2130 272 L1790 272Z", dunkler(p.holz, 0.36)),
    ton("M1790 272 L2130 272 L2130 284 L1790 284Z", dunkler(p.holz, 0.18)),
    ton("M1744 480 L2176 480 L2176 495 L1744 495Z", dunkler(p.holz, 0.3)),
    flach(`path d="${dachD}"`, p.dach),
    zz.innen([`path d="${dachD}"`],
      `<path d="M1960 128 L2165 245 L1960 245Z" fill="${dunkler(p.dach, 0.2)}"/>`
      + `<path d="M1755 245 L1960 128 L1960 140 L1776 245Z" fill="${heller(p.dach, 0.3)}"/>`
      + `<path d="M1755 233 L2165 233 L2165 245 L1755 245Z" fill="${dunkler(p.dach, 0.36)}"/>`
      + naht(ziegel, p.dach, 1.8).svg),
    // Öffnung: Rückwand, Schatten innen oben und links (die Kante wirft ihn), feine Bretter der Rückwand.
    flach(rueck, p.innen, false),
    zz.innen([rueck],
      `<rect x="${ox}" y="${oy}" width="${ob}" height="44" fill="${p.innenKern}"/>`
      + `<rect x="${ox}" y="${oy + 44}" width="${ob}" height="16" fill="${p.innenSchatten}"/>`
      + `<rect x="${ox}" y="${oy}" width="22" height="${oh}" fill="${p.innenSchatten}"/>`
      + naht(`M${ox + 70} ${oy + 60} L${ox + 70} ${oy + oh}M${ox + 140} ${oy + 60} L${ox + 140} ${oy + oh}M${ox + 210} ${oy + 60} L${ox + 210} ${oy + oh}`, p.innen, 1.6, 0.18).svg),
  );
  // Kante der Öffnung zur Wand: eine Konturlinie (wie die Silhouette, denn hier endet die Wand).
  const kante = `<g fill="none" stroke="${T}" stroke-width="${K}"><${rueck}/></g>`;
  return `${krone}${rampe}${stamm}${leiter}${haus}${kante}`;
}

/** @param {Record<string, string>} p */
function mitte(p) {
  const zz = zeichner("mitte", K);
  const kamm = "M0 640 C300 590 640 520 980 505 C1240 494 1500 500 1700 540 C1950 590 2300 610 2880 620";
  const kammY = (/** @type {number} */ x) => x < 980 ? 640 - (x / 980) * 135 : x < 1700 ? 505 + Math.max(0, (x - 1240) / 460) ** 2 * 35 : 540 + (x - 1700) * 0.07;
  const anhoehe = gelaende(zz, kamm, p.huegel, [12, 100, 200], grasstriche(3, 34, [0, 2880], kammY, 160, p.huegel));
  return `<g id="mitte">${anhoehe}${baumUndHaus(p)}</g>`;
}

/** @param {Record<string, string>} p */
function vorne(p) {
  const zz = zeichner("vorne", K);
  const kamm = "M0 800 C500 740 1100 730 1600 750 C2100 770 2500 760 2880 740";
  const flaecheGeo = `path d="${kamm} L2880 1100 L0 1100Z"`;
  const weg = zz.innen([flaecheGeo],
    `<path d="M1560 1100 C1640 960 1820 840 1990 772 L2060 772 C1960 850 1880 960 1880 1100Z" fill="${p.weg}"/>`
    + `<path d="M1790 1100 C1820 960 1900 860 2030 776 L2060 772 C1960 850 1880 960 1880 1100Z" fill="${dunkler(p.weg, 0.14)}"/>`
    + `<path d="M1840 1100 C1850 980 1910 880 2046 774 L2060 772 C1960 850 1880 960 1880 1100Z" fill="${dunkler(p.weg, 0.26)}"/>`
    + `<path d="M1560 1100 C1640 960 1820 840 1990 772 L2000 772 C1840 850 1680 960 1590 1100Z" fill="${heller(p.weg, 0.3)}"/>`
    + [[1700, 1000, 10], [1760, 930, 7], [1840, 880, 8], [1930, 820, 6], [1660, 1060, 9]].map(([x, y, rr]) =>
      `<ellipse cx="${x}" cy="${y}" rx="${rr}" ry="${z(rr * 0.6)}" fill="${dunkler(p.weg, 0.3)}"/><ellipse cx="${x - 2}" cy="${y - 2}" rx="${z(rr * 0.6)}" ry="${z(rr * 0.35)}" fill="${heller(p.weg, 0.4)}"/>`).join(""));
  const wiese = gelaende(zz, kamm, p.vorne, [12, 130, 250], grasstriche(11, 40, [0, 2880], (x) => 760 + Math.abs(x - 1500) * 0.02, 300, p.vorne));

  // Bodenschatten der Runde (flach, im Ton der Wiese; die Kinder stehen, statt zu schweben).
  const flecken = [
    ...ORTE.runde.map((k) => ({ cx: (k.x + k.b / 2) * 10, cy: k.fuss * 10 - 3, rx: (k.kind === "timo" ? 110 : 80) * k.skala })),
    ...ORTE.tiere.filter((t) => t.boden).map((t) => ({ cx: (t.x + t.b / 2) * 10, cy: t.fuss * 10 - 2, rx: t.b * 3.6 })),
  ];
  const schatten = flecken.map(({ cx, cy, rx }) =>
    `<ellipse class="bodenschatten" cx="${z(cx)}" cy="${z(cy)}" rx="${z(rx)}" ry="${z(rx * 0.17)}" fill="${dunkler(p.vorne, 0.26)}"/>`).join("");

  /** Grasbüschel: Halme hinten dunkler, vorn im Grundton, ein Halm im Licht. */
  const gras = (/** @type {number} */ x, /** @type {number} */ y, /** @type {number} */ s) => {
    const halm = (/** @type {number} */ dx, /** @type {number} */ h, /** @type {number} */ neig, /** @type {string} */ f) =>
      flach(`path d="M${z(x + (dx - 7) * s)} ${y} Q${z(x + (dx + neig * 0.3) * s)} ${z(y - h * 0.6 * s)} ${z(x + (dx + neig) * s)} ${z(y - h * s)} Q${z(x + (dx + neig * 0.2 + 4) * s)} ${z(y - h * 0.5 * s)} ${z(x + (dx + 7) * s)} ${y}Z"`, f);
    return `<g class="gras">${zz.guss(
      halm(-26, 70, -26, dunkler(p.gras, 0.22)), halm(22, 80, 30, dunkler(p.gras, 0.22)),
      halm(-10, 104, -12, p.gras), halm(10, 92, 18, p.gras), halm(0, 120, 4, heller(p.gras, 0.2)),
    )}</g>`;
  };
  /** Blume: Stiel mit Blatt, Blütenblätter mit Stufen, Mitte. */
  const blume = (/** @type {number} */ x, /** @type {number} */ y, /** @type {string} */ f) => zz.guss(
    flach(`path d="M${x - 3} ${y + 50} Q${x - 6} ${y + 26} ${x - 2} ${y + 6} L${x + 2} ${y + 6} Q${x - 1} ${y + 26} ${x + 3} ${y + 50}Z"`, p.gras),
    form(`path d="M${x - 2} ${y + 34} Q${x - 22} ${y + 22} ${x - 26} ${y + 30} Q${x - 18} ${y + 40} ${x - 2} ${y + 38}Z"`, p.gras, [x - 18, y + 28]),
    ...[0, 72, 144, 216, 288].map((a) => {
      const cx = x + 13 * Math.cos((a - 90) * Math.PI / 180), cy = y + 13 * Math.sin((a - 90) * Math.PI / 180);
      return form(`ellipse cx="${z(cx)}" cy="${z(cy)}" rx="11" ry="11"`, f, [cx - 5, cy - 6], { s: 0.82, tiefe: 0.7 });
    }),
    form(`circle cx="${x}" cy="${y}" r="7"`, p.bluete2, [x - 3, y - 3]),
  );
  return `<g id="vorne">${wiese}${weg}${schatten}
${gras(560, 1000, 1)}${gras(640, 1030, 0.8)}${gras(2380, 1010, 1)}${gras(2470, 1040, 0.75)}${gras(700, 870, 0.6)}${gras(2280, 860, 0.6)}
${blume(500, 930, p.bluete1)}${blume(752, 985, p.bluete3)}${blume(2420, 920, p.bluete1)}${blume(2540, 960, p.bluete3)}${blume(2330, 990, p.bluete1)}
</g>`;
}

/**
 * Das Szenen-SVG. Stufe 1 zeichnet nur Sommer am Tag; jede andere Angabe fällt darauf zurück.
 * @param {Partial<Zeitbild>} [zeit]
 * @returns {string}
 */
export function szeneSvg(zeit = {}) {
  const schluessel = `${zeit.jahreszeit}-${zeit.tageszeit}`;
  const p = /** @type {Record<string, string>} */ (PALETTEN[/** @type {keyof typeof PALETTEN} */ (schluessel)] ?? PALETTEN["sommer-tag"]);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2880 1080" preserveAspectRatio="none" aria-hidden="true" focusable="false" stroke-linecap="round">`
    + `${himmel(p)}${ferne(p)}${mitte(p)}${vorne(p)}</svg>`;
}
