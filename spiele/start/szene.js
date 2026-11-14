// Szene der Startseite: Wiese mit Baumhaus (Spec docs/superpowers/specs/2026-11-14-startseite-treffpunkt-design.md §5).
// Ein SVG in vier Ebenen (himmel, ferne, mitte, vorne), Stimmungsebene: kein Text, keine Lernzeichen.
// Stil wie die Runde (figuren.md §4): Tinte nur um die Silhouette (Kontur-Schicht unter den Flächen), Schatten in
// Stufen als eigene Flächen, Verlauf nur im Himmel.
//
// Koordinaten: viewBox 0 0 2880 1080, 1 Einheit = 0,1 rem. Die Seite legt das SVG in eine Box von 288 × 108 rem,
// waagrecht mittig. Sichtbar ist bei 16:9 x 480–2400, bei 4:3 x 720–2160. Was bedienbar ist, liegt in 4:3 (ORTE).

import { TINTE as T, zeichner, flaeche } from "./zeichnen.js";

export const SZENE = Object.freeze({ breite: 2880, hoehe: 1080, horizont: 600 });

/**
 * Orte der bedienbaren Teile und der Runde in rem (Box-Koordinaten), damit HTML und SVG dieselben Zahlen nutzen.
 * x/y oben links, b Breite, h Höhe.
 */
export const ORTE = Object.freeze({
  /** Öffnung des Baumhauses, darin das Regal. */
  regal: { x: 182, y: 27, b: 28, h: 18 },
  /** Pfahl des Wegweisers; die Bretter hängen rechts und links daran. */
  wegweiser: { x: 73, y: 54, b: 31 },
  /** Bis zu drei Tore auf der Anhöhe (Mitte des Bogens bei x + b/2, Fuß bei y + h). */
  tore: [
    { x: 79, y: 17, b: 30, h: 34 },
    { x: 114, y: 15, b: 30, h: 34 },
    { x: 149, y: 17, b: 30, h: 34 },
  ],
  /** Die Runde: x/b umfassen den Körper, fuss ist die Höhe der Füße, skala die Größe. */
  runde: [
    { kind: "ela", x: 107, b: 16, fuss: 103, skala: 1, haltung: "stehen", blick: "rechts" },
    { kind: "kofi", x: 133, b: 16, fuss: 100, skala: 0.96, haltung: "nachdenken", blick: "rechts" },
    { kind: "lena", x: 160, b: 16, fuss: 104, skala: 1, haltung: "zeigen", blick: "links" },
    { kind: "timo", x: 186, b: 22, fuss: 101, skala: 0.98, haltung: "stehen", blick: "links" },
  ],
});


const K = 6; // Konturbreite der Szene (Strich 4 der Figuren, auf die Szenengröße gerechnet)

/** @typedef {{tageszeit: "morgen"|"tag"|"abend"|"nacht", jahreszeit: "fruehling"|"sommer"|"herbst"|"winter"}} Zeitbild */

/** Farben je Stimmung. Stufe 1: nur Sommer am Tag; Stufe 3 ergänzt die anderen. */
const PALETTEN = {
  "sommer-tag": {
    himmelOben: "#8FCBF2", himmelUnten: "#E4F5FB", sonne: "#FFD95A", sonneHof: "#FFF1B8",
    wolke: "#FFFFFF", wolkeSchatten: "#DCE9F6",
    huegelFern: "#C3E3B0", huegelFernSchatten: "#ABD49A", huegel: "#A5D78E", huegelSchatten: "#8DC779",
    wiese: "#8FCB78", wieseSchatten: "#76B864", wieseLicht: "#A8DA8E", vorne: "#9CD283", vorneSchatten: "#82C06D",
    weg: "#EED9B8", wegSchatten: "#DCC197",
    stamm: "#A8744A", stammSchatten: "#835631", stammLicht: "#C28F60",
    krone: "#6CBB69", kroneSchatten: "#4F9F57", kroneLicht: "#8ED17F", kroneFern: "#93CD86",
    holz: "#E6BC84", holzSchatten: "#C99A5E", holzLicht: "#F2D2A4", dach: "#E27D62", dachSchatten: "#BC5E46",
    innen: "#F6E7CC", innenSchatten: "#E8D2AC",
    bluete1: "#FFFFFF", bluete2: "#F7D038", bluete3: "#F4A3C0", gras: "#6FB45F",
  },
};

let { guss } = zeichner("szene", K);

/** @param {Record<string, string>} p */
function himmel(p) {
  const wolke = (/** @type {number} */ x, /** @type {number} */ y, /** @type {number} */ s) => {
    const c = (/** @type {number} */ dx, /** @type {number} */ dy, /** @type {number} */ r) =>
      `<circle cx="${x + dx * s}" cy="${y + dy * s}" r="${r * s}"/>`;
    const formen = [c(0, 0, 46), c(52, -22, 58), c(112, -4, 50), c(156, 14, 36), `<rect x="${x - 30 * s}" y="${y}" width="${210 * s}" height="${44 * s}" rx="${22 * s}"/>`];
    const schatten = `<rect x="${x - 26 * s}" y="${y + 22 * s}" width="${202 * s}" height="${20 * s}" rx="${10 * s}" fill="${p.wolkeSchatten}"/>`;
    return `<g class="wolke">${guss(formen, p.wolke, schatten)}</g>`;
  };
  return `<g id="himmel">
<defs><linearGradient id="himmelVerlauf" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="${p.himmelOben}"/><stop offset="1" stop-color="${p.himmelUnten}"/></linearGradient></defs>
<rect width="2880" height="760" fill="url(#himmelVerlauf)"/>
<circle cx="1180" cy="190" r="118" fill="${p.sonneHof}"/>
<circle cx="1180" cy="190" r="78" fill="${p.sonne}" stroke="${T}" stroke-width="${K}"/>
${wolke(560, 210, 1)}${wolke(1460, 120, 0.8)}${wolke(2420, 260, 0.9)}${wolke(260, 380, 0.6)}
</g>`;
}

/** @param {Record<string, string>} p */
function ferne(p) {
  const baum = (/** @type {number} */ x, /** @type {number} */ y, /** @type {number} */ r) =>
    guss([`<circle cx="${x}" cy="${y}" r="${r}"/>`, `<circle cx="${x - r * 0.6}" cy="${y + r * 0.35}" r="${r * 0.7}"/>`,
      `<circle cx="${x + r * 0.62}" cy="${y + r * 0.3}" r="${r * 0.72}"/>`], p.kroneFern,
    `<path d="M${x - r * 1.2} ${y + r * 0.55} Q${x} ${y + r * 1.15} ${x + r * 1.25} ${y + r * 0.5} L${x + r * 1.25} ${y + r * 1.1} L${x - r * 1.2} ${y + r * 1.1}Z" fill="${p.huegelFernSchatten}" opacity="0.55"/>`);
  return `<g id="ferne">
${guss([`<path d="M0 560 C260 470 520 500 760 520 C1000 540 1240 450 1560 450 C1860 450 2060 520 2320 500 C2560 480 2720 450 2880 470 L2880 900 L0 900Z"/>`], p.huegelFern,
    flaeche("M0 610 C300 560 560 590 820 600 C1100 610 1300 560 1600 560 C1900 560 2100 610 2400 590 C2620 575 2760 560 2880 565 L2880 900 L0 900Z", p.huegelFernSchatten))}
${baum(330, 500, 46)}${baum(420, 520, 34)}${baum(1640, 430, 40)}${baum(1730, 450, 30)}${baum(2560, 455, 44)}${baum(2660, 470, 32)}
</g>`;
}

/** @param {Record<string, string>} p */
function baumUndHaus(p) {
  // Stamm mit Wurzelfuß, Krone als vereinigte Kreise hinter dem Haus.
  const krone = guss([
    `<circle cx="1960" cy="210" r="250"/>`, `<circle cx="1730" cy="300" r="170"/>`, `<circle cx="2200" cy="290" r="185"/>`,
    `<circle cx="1820" cy="110" r="150"/>`, `<circle cx="2110" cy="100" r="160"/>`, `<circle cx="2330" cy="420" r="120"/>`,
    `<circle cx="1610" cy="420" r="110"/>`,
  ], p.krone,
  `<path d="M1520 470 C1640 520 1800 470 1880 500 C2000 540 2150 470 2290 520 C2380 550 2440 500 2450 470 L2450 560 L1500 560Z" fill="${p.kroneSchatten}"/>`
  + `<circle cx="1800" cy="70" r="62" fill="${p.kroneLicht}"/><circle cx="2090" cy="40" r="56" fill="${p.kroneLicht}"/><circle cx="1690" cy="230" r="48" fill="${p.kroneLicht}"/>`);
  const stamm = guss([
    `<path d="M1905 470 L1900 700 C1890 740 1860 760 1830 768 L2070 768 C2040 760 2010 740 2002 700 L1998 470Z"/>`,
  ], p.stamm,
  flaeche("M1960 470 L1998 470 L2002 700 C2010 740 2040 760 2070 768 L1985 768 C1975 740 1965 720 1962 700Z", p.stammSchatten)
  + flaeche("M1918 500 L1930 500 L1926 690 L1914 700Z", p.stammLicht));
  // Rampe nach rechts unten (Timo kommt hinauf; wird nie erwähnt), mit Geländer.
  const rampe = guss([
    `<path d="M2140 470 L2620 770 L2620 800 L2140 500Z"/>`,
    ...[2230, 2340, 2450, 2560].map((x) => { const y = 470 + (x - 2140) * 0.625; return `<rect x="${x - 7}" y="${y - 70}" width="14" height="${78}" rx="7"/>`; }),
    `<path d="M2150 400 L2600 682 L2600 694 L2150 412Z"/>`,
  ], p.holz, flaeche("M2140 488 L2620 788 L2620 800 L2140 500Z", p.holzSchatten));
  // Leiter links vom Stamm.
  const leiter = guss([
    `<rect x="1806" y="480" width="16" height="290" rx="8"/>`, `<rect x="1886" y="480" width="16" height="290" rx="8"/>`,
    ...[540, 600, 660, 720].map((y) => `<rect x="1806" y="${y}" width="96" height="14" rx="7"/>`),
  ], p.holz);
  // Haus: Plattform, Wände aus Brettern, Dach, große Öffnung vorn (darin steht das Regal, HTML).
  const o = ORTE.regal;
  const ox = o.x * 10, oy = o.y * 10, ob = o.b * 10, oh = o.h * 10;
  const haus = guss([
    `<rect x="1740" y="455" width="440" height="40" rx="12"/>`,
    `<rect x="1790" y="225" width="340" height="240" rx="10"/>`,
    `<path d="M1755 245 L1960 128 L2165 245 Z"/>`,
  ], p.holz,
  flaeche("M1755 245 L1960 128 L2165 245 Z", p.dach)
  + flaeche("M1960 128 L2165 245 L1960 245 Z", p.dachSchatten)
  + flaeche("M1790 245 L2130 245 L2130 268 L1790 268Z", p.holzSchatten)
  + [300, 370, 440].map((y) => `<rect x="1790" y="${y}" width="340" height="6" fill="${p.holzSchatten}"/>`).join("")
  + flaeche("M1740 480 L2180 480 L2180 495 L1740 495Z", p.holzSchatten)
  + `<rect x="${ox}" y="${oy}" width="${ob}" height="${oh}" rx="22" fill="${p.innen}" stroke="${T}" stroke-width="${K}"/>`
  + `<path d="M${ox + 3} ${oy + 40} L${ox + ob - 3} ${oy + 40} L${ox + ob - 3} ${oy + 22} Q${ox + ob - 3} ${oy + 3} ${ox + ob - 22} ${oy + 3} L${ox + 22} ${oy + 3} Q${ox + 3} ${oy + 3} ${ox + 3} ${oy + 22}Z" fill="${p.innenSchatten}"/>`);
  // Ast nach links mit Schaukel (Stimmung: ein Ort zum Spielen).
  const ast = guss([`<path d="M1910 560 C1820 548 1700 520 1560 512 L1556 540 C1700 550 1810 578 1906 590Z"/>`], p.stamm,
    flaeche("M1556 528 C1700 538 1810 566 1906 578 L1906 590 C1810 578 1700 550 1556 540Z", p.stammSchatten));
  const schaukel = guss([
    `<rect x="1606" y="530" width="10" height="196" rx="5"/>`, `<rect x="1716" y="540" width="10" height="186" rx="5"/>`,
    `<rect x="1586" y="716" width="160" height="22" rx="11"/>`,
  ], p.holz, flaeche("M1586 729 L1746 729 L1746 738 L1586 738Z", p.holzSchatten));
  return `${krone}${rampe}${stamm}${ast}${schaukel}${leiter}${haus}`;
}

/** @param {Record<string, string>} p */
function mitte(p) {
  // Anhöhe für die Tore (Kuppe um x 1280, y 500), Wiese bis zum Horizont.
  const anhoehe = guss([`<path d="M0 640 C300 590 640 520 980 505 C1240 494 1500 500 1700 540 C1950 590 2300 610 2880 620 L2880 1080 L0 1080Z"/>`], p.huegel,
    flaeche("M0 700 C340 650 700 610 1040 600 C1340 592 1600 610 1820 650 C2100 690 2450 690 2880 690 L2880 1080 L0 1080Z", p.huegelSchatten));
  // Pfahl des Wegweisers; die Bretter setzt die Seite als Links daran.
  const w = ORTE.wegweiser;
  const px = (w.x + w.b / 2) * 10;
  const pfahl = guss([`<rect x="${px - 22}" y="${w.y * 10 - 30}" width="44" height="${1000 - w.y * 10}" rx="14"/>`, `<circle cx="${px}" cy="${w.y * 10 - 30}" r="30"/>`], p.stamm,
    flaeche(`M${px + 4} ${w.y * 10 - 30} L${px + 22} ${w.y * 10 - 30} L${px + 22} 990 L${px + 4} 990Z`, p.stammSchatten));
  return `<g id="mitte">${anhoehe}${baumUndHaus(p)}${pfahl}</g>`;
}

/** @param {Record<string, string>} p */
function vorne(p) {
  const wiese = guss([`<path d="M0 800 C500 740 1100 730 1600 750 C2100 770 2500 760 2880 740 L2880 1080 L0 1080Z"/>`], p.vorne,
    flaeche("M0 1000 C700 960 1500 970 2880 990 L2880 1080 L0 1080Z", p.vorneSchatten)
    + flaeche("M1560 1080 C1640 960 1820 840 1990 772 L2060 772 C1960 850 1880 960 1880 1080Z", p.weg)
    + flaeche("M1790 1080 C1820 960 1900 860 2030 776 L2060 772 C1960 850 1880 960 1880 1080Z", p.wegSchatten));
  /** Grasbüschel (wiegen sich in Stufe 2), nur an den Rändern. */
  const gras = (/** @type {number} */ x, /** @type {number} */ y, /** @type {number} */ s) =>
    `<g class="gras" transform="translate(${x} ${y}) scale(${s})">${guss([`<path d="M-30 0 C-28 -40 -40 -70 -52 -90 C-20 -70 -8 -40 -6 -14 C-2 -50 6 -86 18 -110 C24 -76 18 -40 12 -10 C22 -36 40 -56 60 -66 C46 -40 34 -18 30 0Z"/>`], p.gras)}</g>`;
  const blume = (/** @type {number} */ x, /** @type {number} */ y, /** @type {string} */ f) =>
    guss([`<rect x="${x - 4}" y="${y}" width="8" height="46" rx="4"/>`], p.gras)
    + guss([...[0, 72, 144, 216, 288].map((a) => `<circle cx="${x + 15 * Math.cos(a * Math.PI / 180)}" cy="${y + 15 * Math.sin(a * Math.PI / 180)}" r="12"/>`)], f, `<circle cx="${x}" cy="${y}" r="8" fill="${p.bluete2}"/>`);
  return `<g id="vorne">${wiese}
${gras(560, 1000, 1)}${gras(640, 1030, 0.8)}${gras(2380, 1010, 1)}${gras(2470, 1040, 0.75)}${gras(700, 870, 0.6)}${gras(2280, 860, 0.6)}
${blume(500, 930, p.bluete1)}${blume(610, 965, p.bluete3)}${blume(2420, 920, p.bluete1)}${blume(2540, 960, p.bluete3)}${blume(2330, 990, p.bluete1)}
</g>`;
}

/**
 * Das Szenen-SVG. Stufe 1 zeichnet nur Sommer am Tag; jede andere Angabe fällt darauf zurück.
 * @param {Partial<Zeitbild>} [zeit]
 * @returns {string}
 */
export function szeneSvg(zeit = {}) {
  ({ guss } = zeichner("szene", K));
  const schluessel = `${zeit.jahreszeit}-${zeit.tageszeit}`;
  const p = /** @type {Record<string, string>} */ (PALETTEN[/** @type {keyof typeof PALETTEN} */ (schluessel)] ?? PALETTEN["sommer-tag"]);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2880 1080" preserveAspectRatio="none" aria-hidden="true" focusable="false" stroke-linecap="round">`
    + `${himmel(p)}${ferne(p)}${mitte(p)}${vorne(p)}</svg>`;
}
