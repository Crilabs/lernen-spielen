// Eine gezeichnete Figur bewegen: zwischen Posen überblenden, Bewegungen abspielen, Zubehör an- und ablegen.
// Bewusst requestAnimationFrame mit transform-Attributen statt Web Animations an SVG-Gruppen:
// verhält sich in allen WebViews gleich und lässt sich mit gefälschter Zeit testen.
// Im Ruhezustand passiert nichts (grundsaetze-bilder.md B3).

import { bestand } from "./bestand.js";
import { pose as posen, ablauf, mische } from "./pose.js";
import { zeichnePose, gelenkTransform, gesichtInnen, zubehoerInnen, labelFuer } from "./zeichne.js";

/**
 * @typedef {import("./pose.js").Pose} Pose
 * @typedef {{abgebrochen: boolean}} Ergebnis
 * @typedef {{getAttribute(n: string): string|null, setAttribute(n: string, v: string): void, innerHTML: string}} El
 * @typedef {El & {querySelector(s: string): El|null, querySelectorAll(s: string): ArrayLike<El>}} SvgEl
 * @typedef {{wenigBewegung?: boolean, jetzt?: () => number, naechsterFrame?: (cb: () => void) => void}} Optionen
 */

export const STANDARD_MS = 1000;

const systemWenigBewegung = () =>
  typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * @param {SvgEl} svg ein von zeichne() erzeugtes und eingefügtes SVG
 * @param {Optionen} [opts]
 */
export function steuere(svg, opts = {}) {
  const wenig = opts.wenigBewegung ?? systemWenigBewegung();
  const jetzt = opts.jetzt ?? (() => performance.now());
  const frame = opts.naechsterFrame ?? ((cb) => requestAnimationFrame(() => cb()));

  const kindId = /** @type {string} */ (svg.getAttribute("data-kind"));
  const kind = bestand.kinder.get(kindId);
  if (!kind) throw new Error(`Runde: steuere() findet das Kind „${kindId}“ nicht`);
  const blick = svg.querySelector("[data-blick]")?.getAttribute("data-blick") === "links" ? "links" : "rechts";
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

  /** @type {Map<string, El>} */
  let gelenke = new Map();
  let gezeichnet = { ansicht: "", gesicht: "", zubehoer: "" };
  /** @param {Pose} p */
  const zubehoerSchluessel = (p) => [...new Set([...p.braucht, ...extra])].sort().join(",");

  /** @param {Pose} p */
  function neuzeichnen(p) {
    const text = zeichnePose(kindId, p, { zubehoer: [...extra], blick, haltung });
    svg.innerHTML = text.slice(text.indexOf(">") + 1, text.lastIndexOf("</svg>"));
    svg.setAttribute("data-ansicht", p.ansicht);
    svg.setAttribute("data-haltung", haltung);
    svg.setAttribute("aria-label", labelFuer(kindId, haltung));
    gelenke = new Map(Object.keys(p.winkel).map((g) => [g, svg.querySelector(`[data-gelenk="${g}"]`)])
      .filter((e) => e[1]).map((e) => [/** @type {string} */ (e[0]), /** @type {El} */ (e[1])]));
    gezeichnet = { ansicht: p.ansicht, gesicht: p.gesicht, zubehoer: zubehoerSchluessel(p) };
  }

  /** @param {Pose} p */
  function anwenden(p) {
    if (p.ansicht !== gezeichnet.ansicht || zubehoerSchluessel(p) !== gezeichnet.zubehoer) {
      neuzeichnen(p);
    } else {
      const ans = /** @type {import("./bestand.js").KindAnsicht} */ (kind?.ansichten[p.ansicht]);
      for (const [g, el] of gelenke) el.setAttribute("transform", gelenkTransform(ans, g, p));
      if (p.gesicht !== gezeichnet.gesicht) {
        const el = svg.querySelector("[data-gesicht]");
        if (el) {
          el.innerHTML = gesichtInnen(p.ansicht, p.gesicht);
          el.setAttribute("data-gesicht", p.gesicht);
        }
        gezeichnet.gesicht = p.gesicht;
      }
      for (const el of Array.from(svg.querySelectorAll("[data-zubehoer]"))) {
        const id = /** @type {string} */ (el.getAttribute("data-zubehoer"));
        const soll = p.zustaende[id] ?? "";
        if ((el.getAttribute("data-zustand") ?? "") !== soll) {
          el.innerHTML = zubehoerInnen(id, Number(el.getAttribute("data-teil")), p.ansicht, soll);
          el.setAttribute("data-zustand", soll);
        }
      }
    }
    aktuell = p;
  }

  /** Laufender Auftrag: Zähler, Ziel für halt(), Abschluss. */
  let lauf = 0;
  /** @type {Pose|null} */
  let endziel = null;
  /** @type {((e: Ergebnis) => void)|null} */
  let abschluss = null;

  /** @param {Ergebnis} e */
  const beende = (e) => {
    const f = abschluss;
    abschluss = null;
    f?.(e);
  };

  /**
   * Ein Übergang zu einer Pose. Ein Ansichtswechsel springt (neu zeichnen, kein Überblenden).
   * @param {Pose} ziel @param {number} ms @param {number} nr
   * @returns {Promise<Ergebnis>}
   */
  function uebergang(ziel, ms, nr) {
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
        anwenden(t >= 1 ? ziel : mische(start, ziel, t));
        if (t >= 1) fertig({ abgebrochen: false });
        else frame(schritt);
      };
      frame(schritt);
    });
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

  return {
    /** @param {string} id @param {{ms?: number}} [o] */
    haltung(id, o = {}) {
      const ziel = zielVon(id, aktuell.ansicht);
      const nr = neuerAuftrag();
      haltung = id;
      endziel = ziel;
      if (ziel.ansicht === aktuell.ansicht) {
        svg.setAttribute("data-haltung", id);
        svg.setAttribute("aria-label", labelFuer(kindId, id));
      }
      return verfolge(nr, uebergang(ziel, o.ms ?? STANDARD_MS, nr));
    },
    /** @param {string} id */
    bewegung(id) {
      const folge = ablauf(kindId, id);
      const nr = neuerAuftrag();
      haltung = /** @type {import("./bestand.js").Bewegung} */ (bestand.bewegungen.get(id)).ende;
      endziel = folge[folge.length - 1].pose;
      const arbeit = (async () => {
        for (const s of folge) {
          const e = await uebergang(s.pose, s.ms, nr);
          if (e.abgebrochen) return e;
        }
        svg.setAttribute("data-haltung", haltung);
        svg.setAttribute("aria-label", labelFuer(kindId, haltung));
        return { abgebrochen: false };
      })();
      return verfolge(nr, arbeit);
    },
    /** Bricht ab und springt ans Ende (Antippen überspringt, B6). */
    halt() {
      const ziel = endziel;
      neuerAuftrag();
      if (ziel) {
        anwenden(ziel);
        svg.setAttribute("data-haltung", haltung);
        svg.setAttribute("aria-label", labelFuer(kindId, haltung));
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
  };
}
