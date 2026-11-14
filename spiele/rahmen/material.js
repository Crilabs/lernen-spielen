// Lernmaterial eines gekonnten Themas fürs Regal (Spec 2026-11-14-ansichten, Abschnitt „Regal“).
// Rein und DOM-frei: sagt nur, welcher Baustein das Ding zeigt; die Ansicht baut ihn.
//
// Regeln in dieser Reihenfolge:
//   1. Aufgabenart zerlegung / rechnen / zwillinge / menge mit ganzer Zahl 1 bis 10 → Perlenstab dieser Zahl
//      (ls-perlenstab zeichnet nur 1 bis 10).
//   2. Thema einer Wortart → Wortart-Zeichen. Erkannt an
//      a) dem ersten Wort der Id (nomen-proben, namenwoerter, verb…, tunwoerter, adjektiv…, wiewoerter, artikel…)
//         oder
//      b) dem Bereich des Themas (Feld `bereich` aus dem Lernplan) im Fach Grammatik: Nomen, Verben,
//         Adjektive, Artikel.
//      Wörter mitten in der Id zählen nicht („verlaengern-nomen-d-t“ ist Rechtschreibung).
//   3. alles andere → Karte mit der Ziffer (letzte Zahl im Namen) oder dem ersten Buchstaben des Namens.

/** @typedef {{ id: string, name?: string, strang?: string, bereich?: string, art?: string|null, zahl?: number|null }} Material */
/** @typedef {{ baustein: "perlenstab", wert: number } | { baustein: "wortart", wert: "nomen"|"verb"|"adjektiv"|"artikel" } | { baustein: "karte", wert: string }} Baustein */

const MIT_ZAHL = new Set(["zerlegung", "rechnen", "zwillinge", "menge"]);

/** @type {Record<string, "nomen"|"verb"|"adjektiv"|"artikel">} */
const NACH_ID = {
  nomen: "nomen", namenwoerter: "nomen",
  verb: "verb", verben: "verb", tunwoerter: "verb",
  adjektiv: "adjektiv", adjektive: "adjektiv", wiewoerter: "adjektiv",
  artikel: "artikel",
};
/** @type {Record<string, "nomen"|"verb"|"adjektiv"|"artikel">} */
const NACH_BEREICH = { Nomen: "nomen", Verben: "verb", Adjektive: "adjektiv", Artikel: "artikel" };

/**
 * Wortart eines Themas oder null.
 * @param {Material} thema
 */
export function wortartVon(thema) {
  const erstes = String(thema.id ?? "").split("-")[0];
  if (Object.hasOwn(NACH_ID, erstes)) return NACH_ID[erstes];
  if (thema.strang === "grammatik" && typeof thema.bereich === "string" && Object.hasOwn(NACH_BEREICH, thema.bereich)) return NACH_BEREICH[thema.bereich];
  return null;
}

/**
 * Baustein, der ein gekonntes Thema im Regal zeigt.
 * @param {Material} thema
 * @returns {Baustein}
 */
export function materialFuer(thema) {
  const zahl = thema.zahl;
  if (thema.art && MIT_ZAHL.has(thema.art) && Number.isInteger(zahl) && /** @type {number} */ (zahl) >= 1 && /** @type {number} */ (zahl) <= 10) {
    return { baustein: "perlenstab", wert: /** @type {number} */ (zahl) };
  }
  const wortart = wortartVon(thema);
  if (wortart) return { baustein: "wortart", wert: wortart };
  const name = typeof thema.name === "string" ? thema.name : "";
  const ziffer = name.match(/\d+/g)?.at(-1);
  if (ziffer) return { baustein: "karte", wert: ziffer };
  const buchstabe = name.match(/[\p{L}\p{N}]/u)?.[0];
  return { baustein: "karte", wert: buchstabe ? buchstabe.toLocaleUpperCase("de") : "?" };
}
