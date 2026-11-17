// Rückmeldungen von Christian zu gebauten Stücken (docs/superpowers/specs/2026-11-17-rueckmeldungen-design.md):
// fest gerechnet, wohin eine Rückmeldung geht – an einen wartenden Auftrag, als Antwort oder als neuer Auftrag.
// Reine Listenfunktionen wie in auftraege.mjs.

import { beantworte, neuerAuftrag } from "./auftraege.mjs";

export const BEREICHE = ["spiel", "buch", "echte-dinge"];

/** Schätzung in Euro für einen Änderungs-Auftrag je Bereich (Spec 2026-11-17). */
export const SCHAETZUNG_AENDERUNG = { spiel: 3, buch: 2, "echte-dinge": 1 };

const ID = /^[A-Za-z0-9-]+$/;
const BEREICH_JE_ART = { spiel: "spiel", buch: "buch", "echte-dinge": "echte-dinge" };

/**
 * Das Stück, zu dem ein Auftrag gehört: { bereich, ids } oder null (Ideen, Freies, Einführung).
 * Eine Antwort gehört zum Stück ihres Ursprungs.
 */
export function stueckVon(liste, a, gesehen = new Set()) {
  if (!a || gesehen.has(a.id)) return null;
  if (a.art === "antwort") {
    gesehen.add(a.id);
    return stueckVon(liste, liste.find((x) => x.id === a.ziel), gesehen);
  }
  const bereich = a.art === "aenderung" ? a.bereich : BEREICH_JE_ART[a.art];
  if (!bereich) return null;
  return { bereich, ids: Array.isArray(a.ziel) ? a.ziel : [a.ziel] };
}

const gehoertZu = (liste, a, bereich, id) => {
  const s = stueckVon(liste, a);
  return !!s && s.bereich === bereich && s.ids.includes(id);
};

const eintrag = (text, jetzt) => ({ text, zeit: jetzt.toISOString() });

/**
 * Ordnet eine Rückmeldung ein (Reihenfolge fest, Spec „Wohin eine Rückmeldung geht“):
 * 1. wartet ein Auftrag zum Stück → anhängen; 2. wartet einer auf Christian (nicht Ideen) → Antwort;
 * 3. sonst neuer Auftrag am Ende: geparktes Spiel → Art spiel (Wiederaufnahme), sonst Art aenderung.
 * @param {any[]} liste
 * @param {{ bereich: string, id: string, text: string, geparkt?: boolean, schaetzungSpiel?: number|null }} r
 * @returns {{ liste: any[], wie: "angehaengt"|"antwort"|"neu", auftrag: any }}
 */
export function ordneRueckmeldung(liste, { bereich, id, text, geparkt = false, schaetzungSpiel = null }, jetzt = new Date()) {
  if (!BEREICHE.includes(bereich)) throw new Error(`Bereich muss ${BEREICHE.join(", ")} sein (war: ${bereich})`);
  if (typeof id !== "string" || !ID.test(id)) throw new Error(`Id ungültig (war: ${id})`);
  const t = String(text ?? "").trim();
  if (!t) throw new Error("Rückmeldung fehlt");
  if (t.length > 4000) throw new Error("Rückmeldung zu lang (höchstens 4000 Zeichen)");

  const i = liste.findIndex((a) => a.status === "wartet" && a.art !== "ideen" && gehoertZu(liste, a, bereich, id));
  if (i >= 0) {
    const neu = liste.map((a, j) => (j === i ? { ...a, rueckmeldungen: [...(a.rueckmeldungen ?? []), eintrag(t, jetzt)] } : a));
    return { liste: neu, wie: "angehaengt", auftrag: neu[i] };
  }

  const w = liste.find((a) => a.status === "wartet-auf-christian" && a.art !== "ideen" && gehoertZu(liste, a, bereich, id));
  if (w) {
    // Der Text kommt über `rueckmeldungen` in den Befehl (befehlMitRueckmeldungen), nicht doppelt in die Antwort.
    const r = beantworte(liste, w.id, "Siehe „Rückmeldung von Christian“ unten.", jetzt);
    const auftrag = { ...r.neu, rueckmeldungen: [eintrag(t, jetzt)] };
    return { liste: r.liste.map((a) => (a.id === auftrag.id ? auftrag : a)), wie: "antwort", auftrag };
  }

  const auftrag = bereich === "spiel" && geparkt
    ? neuerAuftrag({ art: "spiel", ziel: id, schaetzung_eur: schaetzungSpiel }, jetzt)
    : neuerAuftrag({ art: "aenderung", ziel: id, bereich, schaetzung_eur: SCHAETZUNG_AENDERUNG[bereich] }, jetzt);
  auftrag.rueckmeldungen = [eintrag(t, jetzt)];
  return { liste: [...liste, auftrag], wie: "neu", auftrag };
}

/** Der Befehl, den der Lauf startet: der gespeicherte Befehl, darunter alle Rückmeldungen. */
export function befehlMitRueckmeldungen(a) {
  const r = a.rueckmeldungen ?? [];
  if (!r.length) return a.befehl;
  const punkte = r.map((x) => `- ${x.text.split("\n").join("\n  ")}`).join("\n");
  return `${a.befehl}\n\n## Rückmeldung von Christian\n\nChristian hat das Stück angesehen oder gespielt. Setze jeden Punkt um ` +
    `und lass die Prüfung jeden Punkt ausdrücklich nachprüfen (umgesetzt ja/nein mit Beleg):\n\n${punkte}`;
}

/** Alle Rückmeldungen zu einem Stück mit Stand ihres Auftrags, neueste zuerst (für das Fenster der Seite). */
export function rueckmeldungenZu(liste, bereich, id) {
  return liste.filter((a) => a.rueckmeldungen?.length && gehoertZu(liste, a, bereich, id))
    .flatMap((a) => a.rueckmeldungen.map((x) => ({ ...x, status: a.status, auftrag: a.id })))
    .sort((x, y) => y.zeit.localeCompare(x.zeit));
}
