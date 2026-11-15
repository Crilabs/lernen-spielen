// Welt-Paletten (grundsaetze-bilder.md 6.2) und flache Vignetten für die Spielkarten (Spec Karten §3.1).
// Eine Vignette ist die Heimatwelt eines Spiels in wenigen Flächen, nur in den fünf Tönen ihrer Palette (Himmel, Ferne,
// Boden, Akzent, Schatten) und Papier, ohne Kontur: die Welt leuchtet weich, die Karte bleibt ruhig.

/** @type {Readonly<Record<string, readonly string[]>>} [Himmel, Ferne, Boden, Akzent, Schatten] */
export const PALETTEN = Object.freeze({
  wiese: ["#CFEFFF", "#BFE3C9", "#9ED8A8", "#FFC9DE", "#5E9C77"],
  wasser: ["#C9ECFA", "#8FD3EE", "#F6E1B5", "#FF9F8A", "#4F8FB3"],
  savanne: ["#FDE7C4", "#F4C98E", "#E2B47A", "#8FB06A", "#A86E44"],
  dorf: ["#DDEBFF", "#F7D6C5", "#CBB7A0", "#E9A0B5", "#7B6A8E"],
  werkstatt: ["#EFE7DD", "#D9C7B3", "#BFA58A", "#7FB3C9", "#6E5A4A"],
  nacht: ["#2A2560", "#3D3A82", "#5B5AA6", "#FFE9A8", "#1F1B45"],
});

/** Palette je Überschrift des Lernplans (Vorschlag, von Christian zu prüfen). */
const NACH_UEBERSCHRIFT = {
  "tiere-pflanzen": "wiese", "erde-himmel": "wasser", zeit: "dorf", "raeume-wege": "dorf", miteinander: "dorf",
  "sicher-stark": "dorf", "werkzeug-bauen": "werkstatt", "mein-koerper": "dorf",
};
/** Ausnahmen je Welt, wo die Überschrift nicht passt. */
const NACH_WELT = {
  "tiere-der-erdteile": "savanne", "tag-und-nacht": "nacht", "mond": "nacht", "sterne": "nacht", "planeten": "nacht",
  "wald-und-teich": "wiese", "wetter-messen": "wasser",
};

/**
 * Palette eines Themenkreises (Überschrift im Lernplan), z. B. für den Kopf im Elternbereich „Sachwelten“.
 * @param {string} ueberschriftId
 * @returns {string}
 */
export function paletteDerUeberschrift(ueberschriftId) {
  return NACH_UEBERSCHRIFT[/** @type {keyof typeof NACH_UEBERSCHRIFT} */ (ueberschriftId)] ?? "wiese";
}

/**
 * @param {{plan: {welten?: {id: string, ueberschrift?: string}[]}}} ctx
 * @param {string|undefined} weltId
 * @returns {string|null}
 */
export function paletteFuer(ctx, weltId) {
  if (!weltId) return null;
  const welt = ctx.plan?.welten?.find((w) => w.id === weltId);
  if (!welt) return null;
  return NACH_WELT[/** @type {keyof typeof NACH_WELT} */ (weltId)] ?? NACH_UEBERSCHRIFT[/** @type {keyof typeof NACH_UEBERSCHRIFT} */ (welt.ueberschrift)] ?? "wiese";
}

const PAPIER = "#FFFCF7";

/** Je Palette ein ruhiges Motiv aus wenigen Flächen (viewBox 0 0 300 160). */
const MOTIV = {
  wiese: (/** @type {readonly string[]} */ [h, f, b, a, s]) => `<rect width="300" height="160" fill="${h}"/>
<path d="M0 92 C70 64 150 70 300 84 L300 160 L0 160Z" fill="${f}"/><path d="M0 118 C90 102 200 104 300 114 L300 160 L0 160Z" fill="${b}"/>
<circle cx="76" cy="74" r="24" fill="${s}"/><circle cx="58" cy="84" r="16" fill="${s}"/><rect x="72" y="84" width="8" height="26" fill="${s}"/>
<circle cx="190" cy="132" r="5" fill="${a}"/><circle cx="208" cy="140" r="4" fill="${a}"/><circle cx="150" cy="144" r="4" fill="${a}"/>`,
  wasser: (/** @type {readonly string[]} */ [h, f, b, a, s]) => `<rect width="300" height="160" fill="${h}"/>
<rect y="86" width="300" height="74" fill="${f}"/><path d="M0 96 C60 92 120 100 180 94 C230 90 270 96 300 94 L300 100 L0 102Z" fill="${s}" opacity="0.35"/>
<path d="M0 128 C100 112 210 114 300 124 L300 160 L0 160Z" fill="${b}"/>
<path d="M196 82 L232 82 L222 94 L204 94Z" fill="${a}"/><path d="M212 44 L212 82 L236 78Z" fill="${PAPIER}"/>`,
  savanne: (/** @type {readonly string[]} */ [h, f, b, a, s]) => `<rect width="300" height="160" fill="${h}"/>
<path d="M0 98 C80 84 200 88 300 94 L300 160 L0 160Z" fill="${f}"/><path d="M0 124 C100 114 200 116 300 120 L300 160 L0 160Z" fill="${b}"/>
<path d="M196 112 L200 74 L206 74 L210 112Z" fill="${s}"/><ellipse cx="203" cy="70" rx="42" ry="11" fill="${a}"/>`,
  dorf: (/** @type {readonly string[]} */ [h, f, b, a, s]) => `<rect width="300" height="160" fill="${h}"/>
<path d="M40 110 L40 70 L70 48 L100 70 L100 110Z" fill="${f}"/><path d="M110 110 L110 60 L145 36 L180 60 L180 110Z" fill="${a}"/>
<path d="M190 110 L190 76 L216 58 L242 76 L242 110Z" fill="${f}"/><rect x="134" y="80" width="22" height="30" fill="${s}"/>
<path d="M0 108 L300 108 L300 160 L0 160Z" fill="${b}"/>`,
  werkstatt: (/** @type {readonly string[]} */ [h, f, b, a, s]) => `<rect width="300" height="160" fill="${h}"/>
<rect x="30" y="34" width="240" height="10" fill="${f}"/><rect x="60" y="14" width="18" height="20" fill="${a}"/><rect x="92" y="20" width="26" height="14" fill="${s}"/>
<rect x="200" y="10" width="14" height="24" fill="${a}"/><path d="M0 104 L300 104 L300 160 L0 160Z" fill="${f}"/>
<rect x="40" y="96" width="220" height="12" fill="${b}"/><rect x="56" y="108" width="10" height="40" fill="${s}"/><rect x="234" y="108" width="10" height="40" fill="${s}"/>`,
  nacht: (/** @type {readonly string[]} */ [h, f, b, a, s]) => `<rect width="300" height="160" fill="${h}"/>
<circle cx="220" cy="46" r="20" fill="${a}"/><circle cx="230" cy="40" r="17" fill="${h}"/>
<circle cx="70" cy="34" r="2.5" fill="${a}"/><circle cx="120" cy="56" r="2" fill="${a}"/><circle cx="160" cy="26" r="2.5" fill="${a}"/>
<path d="M0 104 C80 86 180 90 300 100 L300 160 L0 160Z" fill="${f}"/><path d="M0 130 C100 118 200 120 300 126 L300 160 L0 160Z" fill="${b}"/>
<path d="M0 150 L300 150 L300 160 L0 160Z" fill="${s}"/>`,
};

/**
 * Flache Vignette einer Welt-Palette.
 * @param {string} palette Schlüssel aus PALETTEN
 * @returns {string}
 */
export function vignetteSvg(palette) {
  const p = PALETTEN[palette] ?? PALETTEN.wiese;
  const motiv = MOTIV[/** @type {keyof typeof MOTIV} */ (palette)] ?? MOTIV.wiese;
  return `<svg viewBox="0 0 300 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${motiv(p)}</svg>`;
}
