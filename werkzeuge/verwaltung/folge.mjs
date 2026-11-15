// Nach einem Spiel-Auftrag: „Mit echten Dingen“ für dessen Hauptthemen als eigener Auftrag (Christian, 2026-11-16).
// Regel aus dem Skill „Spiel entwickeln“: Themen ohne Anleitung, höchstens fünf, Einstiegsklasse zuerst; nicht bei Probelauf.

import { ladeAuftraege, neuerAuftrag } from "./auftraege.mjs";
import { baueUebersicht, liesQuellen } from "./daten.mjs";
import { ORDNER, WURZEL, pfade } from "./lauf.mjs";

export const HOECHSTENS = 5;

/** Die Thema-Ids für den Folge-Auftrag (leer, wenn nichts fehlt). */
export function echteDingeNachSpiel(uebersicht, spielId) {
  const haupt = uebersicht.spiele[spielId]?.hauptthemen ?? [];
  const themen = new Map(uebersicht.lernthemen.map((t) => [t.id, t]));
  return haupt
    .map((id) => themen.get(id))
    .filter((t) => t && t.echteDinge === "fehlt")
    .sort((a, b) => a.klasse - b.klasse) // stabil: bei gleicher Klasse die Reihenfolge des Katalogs
    .slice(0, HOECHSTENS)
    .map((t) => t.id);
}

/** Für lauf.mjs: der Folge-Auftrag zu einem Spiel-Auftrag oder null. */
export function folgeAuftrag(spielAuftrag, ergebnis, { wurzel = WURZEL, ordner = ORDNER } = {}) {
  if (ergebnis?.probelauf) return null;
  const u = baueUebersicht(liesQuellen(wurzel), ladeAuftraege(pfade(ordner).auftraege));
  const themen = echteDingeNachSpiel(u, spielAuftrag.ziel);
  if (!themen.length) return null;
  const je = u.schaetzung.echteDingeJeThema;
  return neuerAuftrag({ art: "echte-dinge", ziel: themen, schaetzung_eur: je === null ? null : je * themen.length });
}
