// Eine gezeichnete Figur bewegen: zwischen Posen überblenden, Bewegungen abspielen, Zubehör an- und ablegen,
// zwischen Dreiviertel und Profil drehen, die Blickrichtung wenden.
// Bewusst requestAnimationFrame mit transform-Attributen statt Web Animations an SVG-Gruppen:
// verhält sich in allen WebViews gleich und lässt sich mit gefälschter Zeit testen.
// Im Ruhezustand passiert nichts (grundsaetze-bilder.md B3).

import { bestand } from "./bestand.js";
import { pose as posen, ablauf, mische } from "./pose.js";
import { zeichnePose, gelenkTransform, gesichtInnen, zubehoerInnen, labelFuer, luftTransform, luftInnen, luftSchluessel } from "./zeichne.js";

/**
 * @typedef {import("./pose.js").Pose} Pose
 * @typedef {import("./pose.js").Kurve} Kurve
 * @typedef {import("./gelenke.js").Ansicht} Ansicht
 * @typedef {{abgebrochen: boolean}} Ergebnis
 * @typedef {{getAttribute(n: string): string|null, setAttribute(n: string, v: string): void, innerHTML: string}} El
 * @typedef {El & {querySelector(s: string): El|null, querySelectorAll(s: string): ArrayLike<El>}} SvgEl
 * @typedef {{wenigBewegung?: boolean, jetzt?: () => number, naechsterFrame?: (cb: () => void) => void}} Optionen
 * @typedef {ReturnType<typeof steuere>} Steuerung
 */

export const STANDARD_MS = 1000;
/** Drehung zwischen den Ansichten: Stauchen in der alten, Öffnen in der neuen Ansicht (Legetrick). */
export const DREH = { zu: 150, auf: 230, schmal: 0.35 };

const systemWenigBewegung = () =>
  typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** @param {Optionen} opts */
const uhrVon = (opts) => ({
  jetzt: opts.jetzt ?? (() => performance.now()),
  frame: opts.naechsterFrame ?? ((/** @type {() => void} */ cb) => requestAnimationFrame(() => cb())),
});

/**
 * @param {SvgEl} svg ein von zeichne() erzeugtes und eingefügtes SVG
 * @param {Optionen} [opts]
 */
export function steuere(svg, opts = {}) {
  const wenig = opts.wenigBewegung ?? systemWenigBewegung();
  const { jetzt, frame } = uhrVon(opts);

  const kindId = /** @type {string} */ (svg.getAttribute("data-kind"));
  const kind = bestand.kinder.get(kindId);
  if (!kind) throw new Error(`Runde: steuere() findet das Kind „${kindId}“ nicht`);
  /** @type {"rechts"|"links"} */
  let blick = svg.querySelector("[data-blick]")?.getAttribute("data-blick") === "links" ? "links" : "rechts";
  let haltung = svg.getAttribute("data-haltung") ?? "stehen";

  /** @param {string} id @param {string|null} ansicht */
  const zielVon = (id, ansicht) => {
    const h = bestand.haltungen.get(id);
    return posen(kindId, id, h?.ansicht === "beide" ? /** @type {any} */ (ansicht ?? undefined) : undefined);
  };

  /** @type {Pose} */
  let aktuell = zielVon(haltung, svg.getAttribute("data-ansicht"));
  /** Zubehör, das das Spiel angelegt hat (nicht das, das eine Haltung braucht). */
  const extra = new Set([...Array.from(svg.querySelectorAll("[data-zubehoer]"))]
    .map((el) => /** @type {string} */ (el.getAttribute("data-zubehoer")))
    .filter((id) => !aktuell.braucht.includes(id)));

  /** @type {Map<string, El[]>} Gelenk → Gruppen in Kontur- und Flächen-Schicht */
  let gelenke = new Map();
  let gezeichnet = { ansicht: "", gesicht: "", zubehoer: "", haende: "", luft: "", blick: "" };
  /** @param {Pose} p */
  const zubehoerSchluessel = (p) => [...new Set([...p.braucht, ...extra])].sort().join(",");
  /** @param {Pose} p */
  const handSchluessel = (p) => `${p.haende.vorn}/${p.haende.hinten}`;

  const beschrifte = () => {
    svg.setAttribute("data-haltung", haltung);
    svg.setAttribute("aria-label", labelFuer(kindId, haltung));
  };

  /** @param {Pose} p */
  function neuzeichnen(p) {
    const text = zeichnePose(kindId, p, { zubehoer: [...extra], blick, haltung, ohneLuft: wenig });
    svg.innerHTML = text.slice(text.indexOf(">") + 1, text.lastIndexOf("</svg>"));
    svg.setAttribute("data-ansicht", p.ansicht);
    beschrifte();
    gelenke = new Map(Object.keys(p.winkel).map((g) => [g, Array.from(svg.querySelectorAll(`[data-gelenk="${g}"]`))]));
    gezeichnet = {
      ansicht: p.ansicht, gesicht: p.gesicht, zubehoer: zubehoerSchluessel(p), haende: handSchluessel(p),
      luft: wenig ? "" : luftSchluessel(p), blick,
    };
  }

  /** @param {Pose} p */
  function anwenden(p) {
    if (p.ansicht !== gezeichnet.ansicht || zubehoerSchluessel(p) !== gezeichnet.zubehoer
      || handSchluessel(p) !== gezeichnet.haende || blick !== gezeichnet.blick) {
      neuzeichnen(p);
      aktuell = p;
      return;
    }
    const ans = /** @type {import("./bestand.js").KindAnsicht} */ (kind?.ansichten[p.ansicht]);
    for (const [g, els] of gelenke) {
      const tr = gelenkTransform(ans, g, p);
      for (const el of els) el.setAttribute("transform", tr);
    }
    if (p.gesicht !== gezeichnet.gesicht) {
      const el = svg.querySelector("[data-gesicht]");
      if (el) {
        el.innerHTML = gesichtInnen(p.ansicht, p.gesicht);
        el.setAttribute("data-gesicht", p.gesicht);
      }
      gezeichnet.gesicht = p.gesicht;
    }
    for (const modus of /** @type {const} */ (["flaeche", "kontur"])) {
      const attr = modus === "kontur" ? "data-zubehoer-kontur" : "data-zubehoer";
      for (const el of Array.from(svg.querySelectorAll(`[${attr}]`))) {
        const id = /** @type {string} */ (el.getAttribute(attr));
        const soll = p.zustaende[id] ?? "";
        if ((el.getAttribute("data-zustand") ?? "") !== soll) {
          el.innerHTML = zubehoerInnen(id, Number(el.getAttribute("data-teil")), p.ansicht, soll, modus);
          el.setAttribute("data-zustand", soll);
        }
      }
    }
    const luftNeu = wenig ? "" : luftSchluessel(p);
    const luftTr = luftTransform(p);
    for (const el of Array.from(svg.querySelectorAll("[data-luft]"))) {
      el.setAttribute("transform", luftTr);
      if (luftNeu !== gezeichnet.luft) {
        el.innerHTML = wenig ? "" : luftInnen(kindId, p, el.getAttribute("data-luft") === "hinten" ? "hinten" : "vorn");
      }
    }
    gezeichnet.luft = luftNeu;
    aktuell = p;
  }

  /** Laufender Auftrag: Zähler, Ziel und Blick für halt(), Abschluss. */
  let lauf = 0;
  /** @type {Pose|null} */
  let endziel = null;
  /** @type {"rechts"|"links"} */
  let endblick = blick;
  /** @type {((e: Ergebnis) => void)|null} */
  let abschluss = null;

  /** @param {Ergebnis} e */
  const beende = (e) => {
    const f = abschluss;
    abschluss = null;
    f?.(e);
  };

  /**
   * Ein Übergang zu einer Pose. Ein Ansichtswechsel ohne Drehung springt (neu zeichnen).
   * @param {Pose} ziel @param {number} ms @param {number} nr @param {Kurve} [kurve]
   * @returns {Promise<Ergebnis>}
   */
  function uebergang(ziel, ms, nr, kurve = "weich") {
    return new Promise((fertig) => {
      if (nr !== lauf) return fertig({ abgebrochen: true });
      if (wenig || ms <= 0 || ziel.ansicht !== aktuell.ansicht) {
        anwenden(ziel);
        return fertig({ abgebrochen: false });
      }
      const start = aktuell;
      const t0 = jetzt();
      const schritt = () => {
        if (nr !== lauf) return fertig({ abgebrochen: true });
        const t = Math.min(1, (jetzt() - t0) / ms);
        anwenden(t >= 1 ? ziel : mische(start, ziel, t, kurve));
        if (t >= 1) fertig({ abgebrochen: false });
        else frame(schritt);
      };
      frame(schritt);
    });
  }

  /**
   * Grundpose in einer anderen Ansicht: die aktuelle Haltung, wenn es sie dort gibt, sonst stehen.
   * Gesicht und Hände kommen mit.
   * @param {Ansicht} ansicht @param {string} [von] Haltung, von der aus gedreht wird
   */
  const basisIn = (ansicht, von = haltung) => {
    const h = bestand.haltungen.get(von);
    const id = h && (h.ansicht === "beide" || h.ansicht === ansicht) ? von : "stehen";
    return { ...zielVon(id, ansicht), gesicht: aktuell.gesicht };
  };

  /**
   * Drehung in eine andere Ansicht: in der alten schmal werden (Kopf geht voraus), neu zeichnen, federnd öffnen.
   * @param {Pose} ziel Pose in der neuen Ansicht @param {number} nr
   * @returns {Promise<Ergebnis>}
   */
  async function dreh(ziel, nr) {
    if (wenig) return uebergang(ziel, 0, nr);
    const k = aktuell.winkel.kopf ?? 0;
    const zu = { ...aktuell, streckung: /** @type {[number, number]} */ ([DREH.schmal, 0.97]), winkel: { ...aktuell.winkel, kopf: k + 6 }, luft: {} };
    const e = await uebergang(zu, DREH.zu, nr);
    if (e.abgebrochen) return e;
    anwenden({ ...ziel, streckung: [DREH.schmal, 0.97], luft: {} });
    return uebergang(ziel, DREH.auf, nr, "federn");
  }

  /** Beginnt einen neuen Auftrag und bricht den alten ab. */
  const neuerAuftrag = () => {
    lauf += 1;
    beende({ abgebrochen: true });
    return lauf;
  };

  /** @param {number} nr @param {Promise<Ergebnis>} arbeit */
  const verfolge = (nr, arbeit) => new Promise((fertig) => {
    abschluss = fertig;
    arbeit.then((e) => { if (nr === lauf) beende(e); });
  });

  /** @param {"rechts"|"links"} b */
  const andererBlick = (b) => (b === "rechts" ? "links" : "rechts");

  return {
    /**
     * Haltung einnehmen. Gibt es sie nur in der anderen Ansicht, dreht sich die Figur vorher (drehen: false springt).
     * @param {string} id @param {{ms?: number, drehen?: boolean}} [o]
     */
    haltung(id, o = {}) {
      const ziel = zielVon(id, aktuell.ansicht);
      const nr = neuerAuftrag();
      const basis = ziel.ansicht !== aktuell.ansicht && o.drehen !== false ? basisIn(ziel.ansicht) : null;
      haltung = id;
      endziel = ziel;
      endblick = blick;
      if (ziel.ansicht === aktuell.ansicht) beschrifte();
      const arbeit = (async () => {
        if (basis) {
          const e = await dreh(basis, nr);
          if (e.abgebrochen) return e;
        }
        const e = await uebergang(ziel, o.ms ?? STANDARD_MS, nr);
        if (!e.abgebrochen) beschrifte();
        return e;
      })();
      return verfolge(nr, arbeit);
    },
    /**
     * Bewegung abspielen. Steht die Figur in der anderen Ansicht, dreht sie sich vorher (drehen: false springt).
     * @param {string} id @param {{drehen?: boolean}} [o]
     */
    bewegung(id, o = {}) {
      const folge = ablauf(kindId, id);
      const b = /** @type {import("./bestand.js").Bewegung} */ (bestand.bewegungen.get(id));
      const nr = neuerAuftrag();
      const dreht = b.ansicht !== aktuell.ansicht && o.drehen !== false;
      const basis = dreht ? basisIn(b.ansicht) : null;
      haltung = b.ende;
      endziel = folge[folge.length - 1].pose;
      endblick = folge.filter((s) => s.wende).length % 2 ? andererBlick(blick) : blick;
      const arbeit = (async () => {
        if (basis) {
          const e = await dreh(basis, nr);
          if (e.abgebrochen) return e;
        }
        for (const s of folge) {
          if (nr !== lauf) return { abgebrochen: true };
          if (s.wende) {
            blick = andererBlick(blick);
            anwenden(aktuell);
          }
          const e = await uebergang(s.pose, s.ms, nr, s.kurve);
          if (e.abgebrochen) return e;
        }
        beschrifte();
        return { abgebrochen: false };
      })();
      return verfolge(nr, arbeit);
    },
    /**
     * In die andere Ansicht drehen, ohne Bewegung. Die Haltung bleibt, wenn es sie dort gibt, sonst stehen.
     * @param {Ansicht} ansicht
     */
    drehen(ansicht) {
      const nr = neuerAuftrag();
      if (ansicht === aktuell.ansicht) return verfolge(nr, Promise.resolve({ abgebrochen: false }));
      const ziel = basisIn(ansicht);
      const h = bestand.haltungen.get(haltung);
      if (!(h && (h.ansicht === "beide" || h.ansicht === ansicht))) haltung = "stehen";
      endziel = ziel;
      endblick = blick;
      return verfolge(nr, dreh(ziel, nr).then((e) => { if (!e.abgebrochen) beschrifte(); return e; }));
    },
    /** Bricht ab und springt ans Ende (Antippen überspringt, B6). */
    halt() {
      const ziel = endziel;
      neuerAuftrag();
      blick = endblick;
      if (ziel) {
        anwenden(ziel);
        beschrifte();
      }
      endziel = null;
    },
    zubehoer: {
      /** @param {string} id */
      an(id) {
        if (!bestand.zubehoer.has(id)) throw new Error(`Runde: unbekanntes Zubehör „${id}“`);
        extra.add(id);
        neuzeichnen(aktuell);
      },
      /** @param {string} id */
      aus(id) {
        extra.delete(id);
        neuzeichnen(aktuell);
      },
    },
    get pose() {
      return aktuell;
    },
    /** Blickrichtung, nach einer Wende (umdrehen) getauscht. */
    get blick() {
      return blick;
    },
    /** Kind dieser Figur. */
    get kind() {
      return /** @type {import("./bestand.js").Kind} */ (kind);
    },
  };
}

/**
 * Mehrere Figuren bewegen sich nacheinander, jeweils um `abstand` ms versetzt (Welle, Abklatschen).
 * `bewegungen` ist eine Bewegung für alle oder eine Liste je Figur.
 * @param {Steuerung[]} figuren
 * @param {string|string[]} bewegungen
 * @param {{abstand?: number} & Optionen} [o]
 * @returns {Promise<void> & {halt(): void}}
 */
export function zusammen(figuren, bewegungen, o = {}) {
  const abstand = o.abstand ?? 180;
  const { jetzt, frame } = uhrVon(o);
  const liste = typeof bewegungen === "string" ? figuren.map(() => bewegungen) : bewegungen;
  if (liste.length !== figuren.length) throw new Error(`Runde: zusammen() braucht ${figuren.length} Bewegungen, nicht ${liste.length}`);
  let aus = false;
  const t0 = jetzt();
  /** @param {number} ms */
  const warte = (ms) => new Promise((fertig) => {
    if (ms <= 0) return fertig(undefined);
    const schau = () => (aus || jetzt() - t0 >= ms ? fertig(undefined) : frame(schau));
    frame(schau);
  });
  const alle = Promise.all(figuren.map(async (f, i) => {
    await warte(i * abstand);
    if (!aus) await f.bewegung(liste[i]);
  })).then(() => undefined);
  return Object.assign(alle, {
    halt() {
      aus = true;
      for (const f of figuren) f.halt();
    },
  });
}
