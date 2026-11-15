// Bibliothek der Geschichten: Räume › Regale › Bücher (Spec docs/superpowers/specs/2026-11-15-bibliothek-design.md).
// Reine Logik ohne DOM und ohne fetch (in Node testbar, tests/bibliothek.test.mjs).
//   plan     = spiele/bibliothek.json ({ raeume: [{ id, name, bild, regale: [{ id, name, welten?, fach?, buecher: [{ id, titel }] }] }] })
//   liste    = geschichten/index.json → geschichten (fertige Geschichten: id, titel, art, welt, familie)
//   gelesen  = Lernstand sachthemen.geschichten ({ [id]: { am } })
import { themenkreisSvg, paletteDesThemenkreises, PALETTEN } from "./welten.js";

/** @typedef {{ id: string, titel: string, da: boolean, am: string }} Buch */
/** @typedef {{ id: string, name: string, fach: string, welten: string[], buecher: Buch[] }} Regal */
/** @typedef {{ id: string, name: string, bild: string, foto: string, regale: Regal[] }} Raum */

/** @param {unknown} x @returns {string} */
const text = (x) => (typeof x === "string" ? x : "");
/** @param {unknown} x @returns {any[]} */
const liste = (x) => (Array.isArray(x) ? x : []);

/**
 * Der ganze Baum mit jedem Buch, ob da oder geplant (Elternbereich: „kommt noch“).
 * Titel fertiger Bücher kommen aus der Geschichte selbst, geplante tragen den Arbeitstitel.
 * @param {any} plan @param {any[]} [geschichten] @param {Record<string, { am?: string }>} [gelesen]
 * @returns {Raum[]}
 */
export function bibliothekGanz(plan, geschichten = [], gelesen = {}) {
  const fertig = new Map(liste(geschichten).filter((g) => g && text(g.id)).map((g) => [g.id, g]));
  return liste(plan?.raeume).map((r) => ({
    id: text(r.id), name: text(r.name), bild: text(r.bild), foto: text(r.foto),
    regale: liste(r.regale).map((rg) => ({
      id: text(rg.id), name: text(rg.name), fach: text(rg.fach), welten: liste(rg.welten).filter((w) => typeof w === "string"),
      buecher: liste(rg.buecher).filter((b) => text(b?.id)).map((b) => {
        const g = fertig.get(b.id);
        return { id: b.id, titel: text(g?.titel) || text(b.titel) || b.id, da: Boolean(g), am: text(gelesen?.[b.id]?.am) };
      }),
    })),
  }));
}

/**
 * Was das Kind sieht: nur fertige Bücher; Regale und Räume ohne fertiges Buch fehlen (das Kind sieht nie, was fehlt).
 * @param {any} plan @param {any[]} [geschichten] @param {Record<string, { am?: string }>} [gelesen]
 * @returns {Raum[]}
 */
export function bibliothekFuerKind(plan, geschichten = [], gelesen = {}) {
  return bibliothekGanz(plan, geschichten, gelesen)
    .map((r) => ({ ...r, regale: r.regale.map((rg) => ({ ...rg, buecher: rg.buecher.filter((b) => b.da) })).filter((rg) => rg.buecher.length) }))
    .filter((r) => r.regale.length);
}

/**
 * Zustand eines Regals für die Eltern: "gelesen" (alle fertigen gelesen), "teils" (manche), "da" (fertige, keins gelesen),
 * "kommt" (noch kein fertiges Buch).
 * @param {Regal} regal
 */
export function regalZustand(regal) {
  const da = regal.buecher.filter((b) => b.da);
  if (!da.length) return "kommt";
  const gel = da.filter((b) => b.am).length;
  return gel === da.length ? "gelesen" : gel ? "teils" : "da";
}

/** Raum aus der Adresse (?raum=); ohne oder unbekannt: null (dann die Halle). @param {Raum[]} raeume @param {string|null} wunsch */
export const waehleRaum = (raeume, wunsch) => raeume.find((r) => r.id === wunsch) ?? null;

/** Adresse eines Buchs aus der Bibliothek; „Fertig“ führt zurück in denselben Raum. @param {string} buchId @param {string} raumId */
export const buchHref = (buchId, raumId) =>
  `geschichte.html?id=${encodeURIComponent(buchId)}&weiter=${encodeURIComponent(`bibliothek.html?raum=${raumId}`)}`;

// Bild eines Raums im Türbogen: die Themenkreise des Lernplans haben schon eins (start/welten.js); eigene Räume hier,
// gleich flach, nur in den Tönen einer Welt-Palette und Papier, ohne Kontur und ohne Bedeutungsfarben (6.2 C3).
const PAPIER = "#FFFCF7";
/** @type {Record<string, () => string>} */
const EIGENE = {
  // Zahlen und Buchstaben: ein aufgeschlagenes Buch vor einem Hügel, darüber drei Formen wie Bausteine
  "zahlen-buchstaben": () => {
    const [h, f, b, a, s] = PALETTEN.werkstatt;
    return `<rect width="300" height="160" fill="${h}"/><path d="M0 118 C100 110 200 110 300 116 L300 160 L0 160Z" fill="${b}"/>
<rect x="96" y="30" width="30" height="30" rx="4" fill="${a}"/><circle cx="150" cy="45" r="15" fill="${f}"/><path d="M174 60 L189 30 L204 60Z" fill="${s}"/>
<path d="M150 84 C128 74 102 74 80 82 L80 126 C102 118 128 118 150 128 C172 118 198 118 220 126 L220 82 C198 74 172 74 150 84Z" fill="${PAPIER}"/>
<path d="M150 84 L150 128" stroke="${s}" stroke-width="3"/>`;
  },
};

/**
 * Bild im hohen Türbogen: das ganze flache Bild (300 × 160) unten, seitlich nur wenig beschnitten, darüber der Himmel
 * der Palette weitergeführt – ein Blick durch die Tür in den Raum.
 * @param {string} bild Id eines Themenkreises oder eines eigenen Raumbilds
 */
export function raumSvg(bild) {
  const eigen = Object.hasOwn(EIGENE, bild) ? EIGENE[bild] : null;
  const innen = eigen ? eigen() : themenkreisSvg(bild).replace(/^<svg[^>]*>|<\/svg>$/g, "");
  const himmel = PALETTEN[eigen ? RAUM_PALETTE[bild] : paletteDesThemenkreises(bild)]?.[0] ?? PALETTEN.wiese[0];
  return `<svg viewBox="30 -128 240 288" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">`
    + `<rect x="0" y="-128" width="300" height="130" fill="${himmel}"/>${innen}</svg>`;
}

/** Palette je Raumbild (für Himmel im Bogen und Wandton). @type {Record<string, string>} */
const RAUM_PALETTE = { "tiere-pflanzen": "wiese", "erde-himmel": "wasser", "werkzeug-bauen": "werkstatt", "zahlen-buchstaben": "werkstatt" };
/** Wandton eines Raums: Himmel seiner Palette (die Seite mischt ihn mit Nebel). @param {string} bild */
export const raumWand = (bild) => (PALETTEN[RAUM_PALETTE[bild] ?? "dorf"] ?? PALETTEN.dorf)[0];
/** Schattenton eines Raums (Buchrücken). @param {string} bild */
export const raumSchatten = (bild) => (PALETTEN[RAUM_PALETTE[bild] ?? "dorf"] ?? PALETTEN.dorf)[4];

/** Flaches Querbild eines Raums (300 × 160) für Kopfzeilen, z. B. im Elternbereich. @param {string} bild */
export function raumBildFlach(bild) {
  const eigen = Object.hasOwn(EIGENE, bild) ? EIGENE[bild] : null;
  if (!eigen) return themenkreisSvg(bild);
  return `<svg viewBox="0 0 300 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${eigen()}</svg>`;
}
