// Tagesbrief (docs/superpowers/specs/2026-11-17-tagesbrief-design.md): wählt die eine Anleitung „Mit echten Dingen“
// für den Brief und bereitet ihre Formen auf. Läuft in der App (braucht den Lernplan), nicht im Versanddienst.

import { alsNaechstes, dranThemen, echteDingeFuer } from "../lernsteuerung.js";

/** Eine verschickte Anleitung ist so viele Tage gesperrt. */
const SPERRE_TAGE = 14;
const MAX_WEITERE = 2;

/** Tage von a bis b (YYYY-MM-DD). */
const tageZwischen = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);

/** Entfernt die Auszeichnung (**fett**) aus einem Text. @param {string} s */
const ohneAuszeichnung = (s) => String(s).replace(/\*\*/g, "").trim();

/**
 * Wählt die Anleitung für den Brief.
 * @param {{ plan: any, spiele: any, echteDinge: any }} ctx
 * @param {any} stand Lernstand
 * @param {{ heute: string, gesperrt?: Record<string, string>, zuletztGeuebt?: string, letztesFach?: string }} optionen
 *   gesperrt: { [Anleitungsdatei]: "YYYY-MM-DD" } (verschickt am)
 * @returns {{ thema: string, datei: string, passendZuGerade: boolean, weitere: string[] } | null}
 */
export function waehleAnleitung(ctx, stand, { heute, gesperrt = {}, zuletztGeuebt = "", letztesFach = "" }) {
  const themen = Array.isArray(ctx.plan?.themen) ? ctx.plan.themen : [];
  const nachId = new Map(themen.map((t, i) => [t.id, { t, i }]));

  // Anleitung eines Themas oder null (Entwurf, ohne Anleitung, gesperrt). Die Datei steht im Verzeichnis (eine
  // Familien-Anleitung gehört zu mehreren Themen), sonst gilt der Pfad aus echteDingeFuer.
  const kandidat = (id, passendZuGerade) => {
    const e = echteDingeFuer(ctx, id);
    if (!e || !e.datei || e.entwurf || e.formen.length === 0) return null;
    const datei = ctx.echteDinge?.themen?.[id]?.datei || e.datei;
    const am = gesperrt[datei];
    if (am && tageZwischen(am, heute) < SPERRE_TAGE) return null;
    return { thema: id, name: e.name, fach: e.fach, datei, passendZuGerade, index: nachId.get(id)?.i ?? 0 };
  };

  let liste = [...alsNaechstes(ctx, stand)].map((id) => kandidat(id, false)).filter(Boolean);
  if (liste.length === 0) {
    liste = dranThemen(ctx, stand, { max: themen.length }).map((d) => kandidat(d.id, true)).filter(Boolean);
    liste.forEach((k, i) => { k.index = i; }); // dranThemen sortiert schon (zuletzt geübt zuerst)
  }

  // Eine Anleitung je Datei: die erste je Rangfolge zählt.
  const folgtAuf = (k) => {
    if (!zuletztGeuebt) return false;
    const t = nachId.get(k.thema)?.t;
    if ((t?.voraussetzungen ?? []).includes(zuletztGeuebt)) return true;
    const z = nachId.get(zuletztGeuebt);
    if (!z || !t || z.t.strang !== t.strang) return false;
    return !themen.slice(z.i + 1, nachId.get(k.thema).i).some((x) => x.strang === z.t.strang) && nachId.get(k.thema).i > z.i;
  };
  const rang = (k) => [folgtAuf(k) ? 0 : 1, letztesFach && k.fach === letztesFach ? 1 : 0, k.index];
  const sortiert = liste.map((k) => ({ k, r: rang(k) })).sort((a, b) => a.r[0] - b.r[0] || a.r[1] - b.r[1] || a.r[2] - b.r[2]).map((x) => x.k);

  const datein = new Set();
  const einmalig = sortiert.filter((k) => !datein.has(k.datei) && datein.add(k.datei));
  const [erste, ...rest] = einmalig;
  if (!erste) return null;
  return { thema: erste.thema, datei: erste.datei, passendZuGerade: erste.passendZuGerade,
    weitere: rest.slice(0, MAX_WEITERE).map((k) => k.name) };
}

/**
 * Formen einer gelesenen Anleitung für den Brief: nur Material, Schritte, Kern und Verinnerlichen (ohne Leichter/Schwerer).
 * @param {import("../rahmen/markdown.js").Anleitung} anleitung Rückgabe von liesAnleitung
 * @returns {import("./brief.js").BriefForm[]}
 */
export function briefFormen(anleitung) {
  const absatz = (bloecke, praefix) => {
    const b = bloecke.find((x) => x.typ === "p" && x.text.startsWith(praefix));
    return b ? ohneAuszeichnung(b.text.slice(praefix.length)) : "";
  };
  return anleitung.formen.map((f) => ({
    situation: f.situation,
    wort: f.wort,
    name: ohneAuszeichnung(f.name),
    braucht: absatz(f.bloecke, "Ihr braucht:"),
    schritte: (f.bloecke.find((x) => x.typ === "ol")?.punkte ?? []).map(ohneAuszeichnung),
    kern: absatz(f.bloecke, "**Darauf kommt es an:**"),
    verinnerlichen: absatz(f.bloecke, "**Zum Verinnerlichen:**"),
  }));
}
