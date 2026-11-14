// Zustand beim Ziehen und Tippen (ohne DOM), docs/bedienung.md §5.
// Es gibt höchstens ein Teil in der Hand: angehoben (angetippt) oder gezogen.
// schritt() ist rein: aus Zustand und Ereignis folgen der neue Zustand und die Folgen, die ziehen.js
// am Bildschirm ausführt (hebe, senke, greife, ablegen, zurueck).

/**
 * @template T, Z
 * @typedef {{ phase: "ruhe", teil: null } | { phase: "angehoben" | "ziehen", teil: T }} Zustand
 */

/**
 * @template T, Z
 * @typedef {{ art: "tippe-teil", teil: T }
 *   | { art: "tippe-ziel", ziel: Z }
 *   | { art: "ziehe", teil: T }
 *   | { art: "loslassen", ziel: Z | null }
 *   | { art: "abbrechen" }} Ereignis
 */

/**
 * hebe/senke: Teil angehoben mit Sonnenring bzw. wieder abgesetzt; greife: Ziehen beginnt;
 * ablegen: das Spiel entscheidet (beimAblegen); zurueck: Teil kehrt an seinen Platz zurück.
 * @template T, Z
 * @typedef {{ art: "hebe" | "senke" | "greife" | "zurueck", teil: T } | { art: "ablegen", teil: T, ziel: Z }} Folge
 */

/** Nichts in der Hand. */
export const RUHE = Object.freeze({ phase: /** @type {const} */ ("ruhe"), teil: null });

/**
 * @template T, Z
 * @param {Zustand<T, Z>} zustand
 * @param {Ereignis<T, Z>} e
 * @returns {{ zustand: Zustand<T, Z>, folgen: Folge<T, Z>[] }}
 */
export function schritt(zustand, e) {
  /** @type {{ zustand: Zustand<T, Z>, folgen: Folge<T, Z>[] }} */
  const nichts = { zustand, folgen: [] };
  // Während des Ziehens zählt nur das Ende.
  if (zustand.phase === "ziehen") {
    if (e.art === "loslassen") {
      const teil = zustand.teil;
      return { zustand: RUHE, folgen: e.ziel == null ? [{ art: "zurueck", teil }] : [{ art: "ablegen", teil, ziel: e.ziel }] };
    }
    if (e.art === "abbrechen") return { zustand: RUHE, folgen: [{ art: "zurueck", teil: zustand.teil }] };
    return nichts;
  }

  /** @type {Folge<T, Z>[]} */
  const senken = zustand.phase === "angehoben" ? [{ art: "senke", teil: zustand.teil }] : [];
  switch (e.art) {
    case "tippe-teil":
      if (zustand.phase === "angehoben" && zustand.teil === e.teil) return { zustand: RUHE, folgen: senken };
      return { zustand: { phase: "angehoben", teil: e.teil }, folgen: [...senken, { art: "hebe", teil: e.teil }] };
    case "tippe-ziel":
      if (zustand.phase !== "angehoben") return nichts;
      return { zustand: RUHE, folgen: [...senken, { art: "ablegen", teil: zustand.teil, ziel: e.ziel }] };
    case "ziehe":
      return { zustand: { phase: "ziehen", teil: e.teil }, folgen: [...senken, { art: "greife", teil: e.teil }] };
    case "abbrechen":
      return { zustand: RUHE, folgen: senken };
    default:
      return nichts;
  }
}
