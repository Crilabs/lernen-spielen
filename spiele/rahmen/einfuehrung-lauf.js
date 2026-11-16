import { lesezeit } from "./lesezeit.js";

/** Tasten, die wie ein Tipp die Lesezeit abkürzen. */
const KUERZT = new Set(["Enter", " ", "Escape"]);

/**
 * Gemeinsamer Ablauf der Einführung im Spielbild (docs/spielbau.md §8): Sätze abwarten, ohne Ton die Lesezeit stehen
 * lassen (nur ein Tipp des Kindes kürzt sie ab, nie die Einstellung), die Hilfe wiederholt den Schritt, der Prüfstand
 * bekommt den richtigen Zug, danach beginnt die Rundenzeit. Rührt beim Import das DOM nicht an.
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
  /** Solange gesetzt, ändert `satz` die Hilfe nicht (Hilfe mit `bis`). @type {object | null} */
  let hilfeHalten = null;
  /** Der zuletzt begonnene Satz (für die Vorgabe der Hilfe, wenn eine gehaltene Hilfe endet). @type {((o: { zeigen: boolean }) => Promise<any>) | null} */
  let letzterSatz = null;
  /**
   * Beendet je eine laufende Lesezeit sofort. Mehrere können zugleich laufen (etwa ein Satz der Hilfe während der
   * Lesezeit des Hauptsatzes); `abkuerzen` beendet alle. @type {Set<() => void>}
   */
  const lesenAbbrechen = new Set();

  /** Lesezeit: endet nach ms oder bei `abkuerzen`. @param {number} ms */
  const lesen = (ms) =>
    new Promise((ok) => {
      const fertig = () => {
        lesenAbbrechen.delete(fertig);
        ok(undefined);
      };
      lesenAbbrechen.add(fertig);
      warte(ms).then(fertig, fertig);
    });

  const lauf = {
    get laeuft() {
      return laeuft;
    },
    get zug() {
      return zug;
    },

    /**
     * Ein Satz: wartet, bis er gesprochen ist; ohne Ton steht er als Blase da und bleibt eine Lesezeit lang. Die
     * Lesezeit hat einen eigenen Timer, nie die Animations-Abkürzung (sonst rast die Einführung ohne Ton durch); nur
     * `abkuerzen` (ein Tipp des Kindes) beendet sie früher.
     * @param {(o: { zeigen: boolean }) => Promise<any>} sag
     */
    async satz(sag) {
      letzterSatz = sag;
      if (!hilfeHalten) hilfeFn = () => lauf.satz(sag);
      const zeigen = !o.ton();
      await sag({ zeigen });
      if (zeigen) await lesen(lesezeit(o.text()));
    },

    /** Ein Tipp des Kindes: beendet alle laufenden Lesezeiten sofort; sonst nichts. */
    abkuerzen() {
      for (const fertig of [...lesenAbbrechen]) fertig();
    },

    /**
     * Verbindet den Tipp des Kindes mit `abkuerzen` (spielbau.md §8): ein Zeigen irgendwo in `wurzel` oder Enter,
     * Leertaste, Escape kürzt, solange die Einführung läuft, die Lesezeit ab; der Tipp tut sonst, was er immer tut.
     * Ereignisse an einem Element aus `ausser` (Hilfe, Pause, Leiste) kürzen nicht ab – die Hilfe sagt den Schritt noch
     * einmal. Lauscht in der Capture-Phase.
     * @param {Pick<EventTarget, "addEventListener" | "removeEventListener">} wurzel etwa `document`
     * @param {{ ausser?: (EventTarget | null | undefined)[] }} [opt]
     * @returns {() => void} trennt die Verbindung wieder
     */
    verbindeTippen(wurzel, { ausser = [] } = {}) {
      const ausgenommen = ausser.filter(Boolean);
      const hoer = (/** @type {Event} */ ev) => {
        if (!laeuft) return;
        if (ev.type === "keydown" && !KUERZT.has(/** @type {KeyboardEvent} */ (ev).key)) return;
        const pfad = ev.composedPath();
        if (ausgenommen.some((el) => pfad.includes(/** @type {EventTarget} */ (el)))) return;
        lauf.abkuerzen();
      };
      wurzel.addEventListener("pointerdown", hoer, true);
      wurzel.addEventListener("keydown", hoer, true);
      return () => {
        wurzel.removeEventListener("pointerdown", hoer, true);
        wurzel.removeEventListener("keydown", hoer, true);
      };
    },

    /**
     * Hilfe des Schritts überschreiben. Ohne `bis` gilt sie bis zum nächsten `satz`; mit `bis` auch über spätere
     * `satz`-Aufrufe hinweg (etwa die Sätze der Hilfe selbst), bis `bis` erfüllt oder abgelehnt ist – danach wiederholt
     * die Hilfe wieder den laufenden Satz.
     * @param {(() => any) | null} fn @param {{ bis?: Promise<any> }} [opt]
     */
    hilfe(fn, { bis } = {}) {
      hilfeFn = fn;
      hilfeHalten = null;
      if (!bis) return;
      const marke = {};
      hilfeHalten = marke;
      const ende = () => {
        if (hilfeHalten !== marke) return;
        hilfeHalten = null;
        const sag = letzterSatz;
        hilfeFn = sag ? () => lauf.satz(sag) : null;
      };
      bis.then(ende, ende);
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
      const aufraeumen = () => {
        zug = null;
        hilfeFn = null;
        hilfeHalten = null;
        letzterSatz = null;
      };
      aufraeumen();
      laeuft = true;
      o.stand.phase = "einfuehrung";
      try {
        await ablauf();
      } finally {
        laeuft = false;
        aufraeumen();
      }
      runde?.einfuehrungGesehen();
      runde?.beginneZeit();
    },
  };
  return lauf;
}
