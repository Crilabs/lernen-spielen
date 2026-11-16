import { lesezeit } from "./lesezeit.js";

/**
 * Gemeinsamer Ablauf der Einführung im Spielbild (docs/spielbau.md §8): Sätze abwarten, ohne Ton die Lesezeit stehen
 * lassen, die Hilfe wiederholt den Schritt, der Prüfstand bekommt den richtigen Zug, danach beginnt die Rundenzeit.
 * Rührt beim Import das DOM nicht an.
 * @param {{ ton: () => boolean, text: () => string, stand: { phase: string },
 *   warte?: (ms: number) => Promise<void> }} o
 */
export function einfuehrungsLauf(o) {
  const warte = o.warte ?? ((ms) => new Promise((ok) => setTimeout(ok, ms)));
  let laeuft = false;
  /** @type {import("./pruefen.js").Zug | null} */
  let zug = null;
  /** Was die Hilfe tut: Vorgabe ist der Satz des Schritts noch einmal. @type {(() => any) | null} */
  let hilfeFn = null;

  const lauf = {
    get laeuft() {
      return laeuft;
    },
    get zug() {
      return zug;
    },

    /**
     * Ein Satz: wartet, bis er gesprochen ist; ohne Ton steht er als Blase da und bleibt eine Lesezeit lang. Die
     * Lesezeit hat einen eigenen Timer, nie die Animations-Abkürzung (sonst rast die Einführung ohne Ton durch).
     * @param {(o: { zeigen: boolean }) => Promise<any>} sag
     */
    async satz(sag) {
      hilfeFn = () => lauf.satz(sag);
      const zeigen = !o.ton();
      await sag({ zeigen });
      if (zeigen) await warte(lesezeit(o.text()));
    },

    /** Hilfe des Schritts überschreiben. @param {(() => any) | null} fn */
    hilfe(fn) {
      hilfeFn = fn;
    },

    /**
     * Bis `getan` erfüllt ist, ist `zug` der richtige Zug.
     * @param {import("./pruefen.js").Zug} z
     * @param {Promise<any>} getan
     */
    async kind(z, getan) {
      zug = z;
      try {
        return await getan;
      } finally {
        zug = null;
      }
    },

    /** Läuft die Einführung: ruft die Hilfe des Schritts, true; sonst false. */
    hilfeGedrueckt() {
      if (!laeuft) return false;
      hilfeFn?.();
      return true;
    },

    /**
     * Läuft den Ablauf der Einführung. Nur nach einem Ablauf ohne Fehler: Einführung gesehen, Rundenzeit beginnt.
     * @param {() => Promise<void>} ablauf
     * @param {{ einfuehrungGesehen(): void, beginneZeit(): void }} [runde]
     */
    async spiele(ablauf, runde) {
      laeuft = true;
      o.stand.phase = "einfuehrung";
      try {
        await ablauf();
      } finally {
        laeuft = false;
        zug = null;
        hilfeFn = null;
      }
      runde?.einfuehrungGesehen();
      runde?.beginneZeit();
    },
  };
  return lauf;
}
