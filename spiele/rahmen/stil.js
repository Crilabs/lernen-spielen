// Gemeinsame Stil-Grundlage der Rahmen-Bausteine (Shadow DOM, nur rem).
// 1rem = 1/108 der Bildhöhe. Farben nach der Farbwelt (docs/grundsaetze-bilder.md 6.2, docs/farbwelt.html).

/**
 * Maße in rem.
 * bedien/gross/klein: Knopfdurchmesser rund; pille/pilleGross/pilleKlein: Höhe der Knöpfe mit Wort;
 * breite: Mindestbreite mit Wort; fach: Kachel des Fachsymbols; leiste: Höhe der Kopfleiste.
 */
export const MASSE = {
  bedien: 11,
  gross: 16,
  klein: 8,
  pille: 11,
  pilleGross: 14,
  pilleKlein: 8,
  breite: 24,
  fach: 9,
  rand: 2.4,
  abstand: 2,
  kontur: 0.3,
  tiefe: 0.6,
  einsinken: 0.3,
  leiste: 15.8,
};

/** Grundton und Funktionsfarben der Hülle. */
export const FARBE = {
  tinte: "#3B2A6B",
  tinteWeich: "#6B5C96",
  papier: "#FFFCF7",
  nebel: "#F4F0FA",
  linie: "#E4DEF0",
  naht: "#CFC4E3",
  hauptSchatten: "#24184A",
  sonne: "#FFD95A",
  nacht: "#1F1B45",
  ahorn: "#EAD5B5",
  kante: "#B98E5E",
  /** Nur im Elternbereich (Löschen, Achtung), beim Kind nie (grundsaetze-bilder 6.2). */
  beere: "#B3315A",
  /** Schatten der Beere-Knöpfe: Nebenknopf heller (wie Tinte weich zur Tinte), Hauptknopf dunkler. */
  beereWeich: "#C9738D",
  beereTief: "#7A1E3C",
};

/**
 * Radien in rem: groß (Blase, Karten), normal (Kacheln), klein; plakat und teil nach der Designsprache
 * (Vorlage 28/20 px bei 720 px Höhe; 1 px = 0,15 rem).
 */
export const RADIUS = { gross: 4, normal: 2.6, klein: 1.6, plakat: 4.2, teil: 3 };

/**
 * Maße der Übersichtsseiten (Können, Regal, Wissen, Geschichte) nach der Designsprache
 * (docs/superpowers/specs/2026-11-15-designsprache-design.md). Spiele behalten MASSE.
 * rand: Außenrand; knopf: sichtbarer Nebenknopf, tipp: Tippfläche (K4); titel/titelKlein/name/lese: Schriftgrößen.
 */
export const SEITE = Object.freeze({ rand: 9.6, knopf: 8.4, tipp: 11, titel: 8.4, titelKlein: 6.6, name: 3.6, lese: 4.5 });

/**
 * Schriftrollen: Inter nur für die Oberfläche (Titel, Namen, Wörter auf Knöpfen, Navigation), mit festen
 * Zeichenvarianten (einfaches a, l mit Bogen, I mit Querstrichen). Lernstoff und Lesetext bleiben Andika.
 */
export const SCHRIFT = Object.freeze({
  oberflaeche: '"Inter", "Andika", sans-serif',
  lesen: '"Andika", sans-serif',
  merkmale: '"cv11", "cv05", "cv08"',
});

/**
 * Fachfarben (Rahmen): Füllung (Kachel), Tief (Schrift), Tönung (Kopfleiste). Sachthemen haben keine.
 * @type {Record<string, { name: string, fuellung: string, tief: string, toenung: string }>}
 */
export const FACH = {
  mathe: { name: "Himbeere", fuellung: "#F06BB0", tief: "#B8327A", toenung: "#FFE6F2" },
  grammatik: { name: "Minze", fuellung: "#3DB98F", tief: "#1B7656", toenung: "#DBF5EA" },
  schreiben: { name: "Himmelblau", fuellung: "#4C9BD1", tief: "#25689C", toenung: "#DFF0FC" },
  lesen: { name: "Honig", fuellung: "#F2B630", tief: "#8A5D05", toenung: "#FFF3D1" },
  geometrie: { name: "Flieder", fuellung: "#8C6FE0", tief: "#5B3FB8", toenung: "#EEE8FF" },
  sprechen: { name: "Aprikose", fuellung: "#F08A4B", tief: "#A44C16", toenung: "#FFEADD" },
};

/** Fächer mit eigenem Symbol in spiele/symbole/<fach>.svg (Sprechen: zwei Sprechblasen, 2026-11-14). */
export const FACH_SYMBOLE = new Set(["mathe", "lesen", "schreiben", "grammatik", "geometrie", "sprechen"]);

/**
 * Bedeutungsfarben des Lernfelds (Farbwelt 6.2), nur für die Lernzeichen. Nie allein (C1): die Perle trägt
 * Länge, Lücke und Marke, die Wortart ihre Form und Größe.
 */
export const LERNFARBE = Object.freeze({
  /** Perlenstäbchen nach Montessori (M3), 9 in Kobalt, damit die Tinte-Kontur sichtbar bleibt. */
  perle: Object.freeze({
    1: "#E5484D",
    2: "#3FA34D",
    3: "#F4A3C0",
    4: "#F7D038",
    5: "#6CB8F0",
    6: "#9B5DE5",
    7: "#FFFFFF",
    8: "#9A6B4F",
    9: "#2F5BC4",
    10: "#D9A520",
  }),
  /** Stellenwerte (M5): Einer türkis, Zehner orange, Hunderter schiefergrau; nur zusätzlich zu Spalte, Buchstabe und Ziffer. */
  stelle: Object.freeze({ e: "#0FA3A3", z: "#F07C1E", h: "#5B6478" }),
  /** Draht der Perlenstäbchen. */
  draht: FARBE.tinteWeich,
  /** Stellenwertfarben (M5, nur zusätzlich zu Spalte, Beschriftung und Ziffer): Einer türkis, Zehner orange, Hunderter schiefergrau. */
  stellenwert: Object.freeze({ einer: "#2BB5B0", zehner: "#F59A2B", hunderter: "#69768A" }),
  /** Wortartensymbole (D1). */
  wortart: Object.freeze({ nomen: "#1E1A2E", artikel: "#7CC4F0", adjektiv: "#2F5BC4", verb: "#E5484D" }),
});

/** Höhe der Kopfleiste samt Aussparung; `<ls-leiste>` setzt sie als --ls-leiste-hoehe am Dokument. */
export const LEISTE_HOEHE = `calc(${MASSE.leiste}rem + env(safe-area-inset-top, 0rem))`;

/**
 * Die gemeinsamen CSS-Variablen, eine Quelle für die Bausteine (`:host` in GRUND_CSS) und die Seite
 * (`:root` in seite.css; tests/rahmen-stil.test.mjs prüft, dass beide gleich sind).
 * @type {Readonly<Record<string, string>>}
 */
export const TOKENS = Object.freeze({
  "--ls-tinte": FARBE.tinte,
  "--ls-tinte-weich": FARBE.tinteWeich,
  "--ls-papier": FARBE.papier,
  "--ls-nebel": FARBE.nebel,
  "--ls-linie": FARBE.linie,
  "--ls-naht": FARBE.naht,
  "--ls-haupt-schatten": FARBE.hauptSchatten,
  "--ls-sonne": FARBE.sonne,
  "--ls-nacht": FARBE.nacht,
  "--ls-ahorn": FARBE.ahorn,
  "--ls-kante": FARBE.kante,
  "--ls-beere": FARBE.beere,
  "--ls-beere-weich": FARBE.beereWeich,
  "--ls-beere-tief": FARBE.beereTief,
  "--ls-kontur": `${MASSE.kontur}rem`,
  "--ls-radius-gross": `${RADIUS.gross}rem`,
  "--ls-radius": `${RADIUS.normal}rem`,
  "--ls-radius-klein": `${RADIUS.klein}rem`,
  "--ls-radius-plakat": `${RADIUS.plakat}rem`,
  "--ls-radius-teil": `${RADIUS.teil}rem`,
  "--ls-schrift-oberflaeche": SCHRIFT.oberflaeche,
  "--ls-schrift-merkmale": SCHRIFT.merkmale,
  "--ls-seite-rand": `${SEITE.rand}rem`,
  "--ls-seite-knopf": `${SEITE.knopf}rem`,
  "--ls-knopf": `${MASSE.bedien}rem`,
  "--ls-neben-schatten": "var(--ls-tinte-weich)",
  "--ls-schatten": `0 ${MASSE.tiefe}rem 0 var(--ls-neben-schatten)`,
  "--ls-schatten-unten": `0 ${MASSE.tiefe - MASSE.einsinken}rem 0 var(--ls-neben-schatten)`,
});

const TOKEN_CSS = Object.entries(TOKENS)
  .map(([name, wert]) => `  ${name}: ${wert};`)
  .join("\n");

/**
 * CSS für das Innere jedes Bausteins: Farbwerte, Knopfformen, Einsinken, Sonnenring, reduced motion.
 *
 * Aufbau eines Knopfs: `.knopf` (button oder a) ist die Tippfläche, mindestens 11 rem; darin `.form`
 * als sichtbare Gestalt (`.neben` oder `.haupt`, `.rund` oder `.pille`); darin `.zeichen` (Symbol über
 * `img`, beim Hauptknopf zusätzlich die Variable `--bild`) und `.wort`. Nur was drückbar ist, hat einen Schatten: Nebenknopf in Tinte weich,
 * Hauptknopf im dunklen Tinte-Ton (grundsaetze-bilder 6.4 „fester Schatten im Tief-Ton“).
 */
export const GRUND_CSS = `
:host {
${TOKEN_CSS}
  display: inline-block;
  color: var(--ls-tinte);
  font-family: "Andika", sans-serif;
  font-size: 3.2rem;
  line-height: 1;
}
:host([hidden]) { display: none; }

.knopf {
  box-sizing: border-box;
  min-width: ${MASSE.bedien}rem;
  min-height: ${MASSE.bedien}rem;
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: top;
  text-decoration: none;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  -webkit-user-select: none;
  user-select: none;
}
.knopf:focus-visible { outline: none; }

.form {
  --schatten-farbe: var(--ls-neben-schatten);
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  border: var(--ls-kontur) solid var(--ls-tinte);
  box-shadow: 0 ${MASSE.tiefe}rem 0 var(--schatten-farbe);
  font-weight: 700;
  white-space: nowrap;
}
.form.neben { background: var(--ls-papier); color: var(--ls-tinte); }
.form.haupt { --schatten-farbe: var(--ls-haupt-schatten); background: var(--ls-tinte); color: var(--ls-papier); }
.form.rund { width: var(--ls-knopf); height: var(--ls-knopf); padding: calc(var(--ls-knopf) * 0.17); border-radius: 50%; }
.form.pille {
  height: var(--ls-knopf);
  min-width: max(${MASSE.breite}rem, var(--ls-breite, 0rem));
  padding: 0 calc(var(--ls-knopf) * 0.36) 0 calc(var(--ls-knopf) * 0.26);
  border-radius: 999rem;
  font-size: calc(var(--ls-knopf) * 0.36);
}
.knopf:active .form {
  transform: translateY(${MASSE.einsinken}rem);
  box-shadow: 0 ${MASSE.tiefe - MASSE.einsinken}rem 0 var(--schatten-farbe);
}

/* Symbol: der Nebenknopf zeigt das Bild (img), wie es ist; der Hauptknopf zeigt es als Papier-Fläche
   (Maske über --bild). Ein img statt eines Hintergrundbilds: WebKit malt ein Hintergrundbild, das in einer
   verborgenen Ebene geladen wurde, sonst nicht nach. */
.zeichen {
  flex: none;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.zeichen img { display: block; width: 100%; height: 100%; -webkit-user-drag: none; }
.pille .zeichen { width: calc(var(--ls-knopf) * 0.56); height: calc(var(--ls-knopf) * 0.56); }
.haupt .zeichen {
  background: var(--ls-papier);
  -webkit-mask: var(--bild) center / contain no-repeat;
  mask: var(--bild) center / contain no-repeat;
}
.haupt .zeichen img { visibility: hidden; }
.zeichen[hidden], .wort[hidden] { display: none; }
.gespiegelt .zeichen { transform: scaleX(-1); }
/* Wörter auf Knöpfen sind Oberfläche: Inter mit festen Zeichenvarianten (Designsprache); Lernstoff bleibt Andika. */
.wort { display: block; line-height: 1; padding-bottom: 0.04em; font-family: var(--ls-schrift-oberflaeche);
  font-feature-settings: var(--ls-schrift-merkmale); letter-spacing: -0.01em; }

/* Sonnenring: Fokus (in ls-hilfe auch das Aufleuchten). Immer ein Ring, nie eine Fläche; er liegt direkt
   an der Tinte-Kontur an, damit kein Hintergrund durchscheint. */
.form::after {
  content: "";
  position: absolute;
  inset: calc(-1 * (var(--ls-kontur) + 0.8rem));
  border: 0.8rem solid var(--ls-sonne);
  border-radius: 999rem;
  box-shadow: 0 0 0 0.3rem var(--ls-tinte);
  opacity: 0;
  pointer-events: none;
}
.knopf:focus-visible .form::after { opacity: 1; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
`;

/**
 * Wert für die Variable `--bild` aus einer Bild-Adresse (einfache Anführungszeichen: passt in style="…").
 * @param {string} href
 * @returns {string}
 */
export function bild(href) {
  return `url('${href}')`;
}

/**
 * Registriert einen Baustein, falls der Name noch frei ist.
 * @param {string} name
 * @param {CustomElementConstructor} klasse
 * @returns {void}
 */
export function definiere(name, klasse) {
  if (!customElements.get(name)) customElements.define(name, klasse);
}
