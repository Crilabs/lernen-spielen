// Spielzeit auf der Seite (Spec 2026-11-14-spielzeit): verbindet kern/spielzeit.js mit Speicher, Einstellungen,
// Stimme und Uhr. Nur digitale Spiele rufen starteSpielzeit() und amRundenende() auf; Startseite und Fach-Seite
// fragen nur spielzeitLage(), damit sie Spiel-Links weglassen. Gezählt wird nur, solange die Seite sichtbar ist
// und die letzte Eingabe höchstens zwei Minuten her ist.

import { lade, speichere, sofortSpeichern } from "../kern/speicher.js";
import { ladeEinstellungen, einstellung } from "../kern/einstellungen.js";
import { sprich } from "../kern/stimme.js";
import { sageEinmal } from "../kern/sitzung.js";
import { regeln, aktuell, zaehle, lage, morgenFrei, warnen, merkeGewarnt } from "../kern/spielzeit.js";

/** Speicher-Schlüssel des Stands (am Profil). */
export const STAND = "spielzeit-stand";
const TAKT_MS = 15_000;
const RUHIG_MS = 2 * 60_000;

/** Die Sätze des Erzählers; jeder steht noch einmal als feste Zeichenkette in sage() (für `npm run audio`). */
export const SAETZE = {
  bald: "Gleich ist für heute Schluss.",
  schlussMorgen: "Für heute ist das Spielen fertig. Morgen geht es weiter.",
  schluss: "Für heute ist das Spielen fertig.",
};

/** @type {import("../kern/spielzeit.js").Stand | null} Stand, solange der Takt läuft */
let stand = null;

/**
 * Regeln, Stand und Lage für jetzt. Läuft der Takt, gilt sein Stand (er ist neuer als der gespeicherte).
 * @param {Date} [jetzt]
 */
export async function spielzeitLage(jetzt = new Date()) {
  await ladeEinstellungen();
  const r = regeln(einstellung("spielzeit", null));
  const s = stand ?? aktuell(await lade(STAND, {}), jetzt);
  return { regeln: r, stand: s, lage: lage(r, s, jetzt), morgen: morgenFrei(r, s, jetzt) };
}

/**
 * Satz für den gesperrten Zustand; null, wenn die Spiele bloß ausgeblendet sind (dann ohne Satz).
 * @param {{ lage: { frei: boolean, grund: string | null }, morgen: boolean }} z
 * @returns {string | null}
 */
export function schlussSatz(z) {
  if (z.lage.frei || z.lage.grund === "aus") return null;
  return z.morgen ? SAETZE.schlussMorgen : SAETZE.schluss;
}

/**
 * Spricht einen der Sätze, gesperrt einmal je Sitzung (Startseite und Pause teilen sich den Merker).
 * @param {string} satz
 */
export function sage(satz) {
  if (satz === SAETZE.bald) return sprich("Gleich ist für heute Schluss.");
  if (satz === SAETZE.schlussMorgen) {
    return sageEinmal(satz, () => sprich("Für heute ist das Spielen fertig. Morgen geht es weiter."));
  }
  if (satz === SAETZE.schluss) return sageEinmal(satz, () => sprich("Für heute ist das Spielen fertig."));
  return Promise.resolve(null);
}

/**
 * Beim Start eines digitalen Spiels: ist es gesperrt, zurück zur Startseite (dort steht der Satz);
 * sonst läuft ab jetzt der Takt (nicht mit zaehlen: false, z. B. in der Vorschau, die nie schreibt).
 * @param {{ zaehlen?: boolean }} [optionen]
 * @returns {Promise<boolean>} true, wenn gespielt werden darf
 */
export async function starteSpielzeit({ zaehlen = true } = {}) {
  let z;
  try {
    z = await spielzeitLage();
  } catch {
    return true; // Spielzeit nicht lesbar: lieber spielen lassen als ein Spiel ohne Grund sperren
  }
  if (!z.lage.frei) {
    location.replace(new URL("../index.html", import.meta.url).href);
    return false;
  }
  if (!zaehlen || stand) return true;
  stand = z.stand;
  let letzteEingabe = Date.now(), letzterTakt = Date.now();
  let sichtbar = document.visibilityState === "visible";
  const takt = () => {
    const jetzt = Date.now();
    const spanne = Math.min(jetzt - letzterTakt, 2 * TAKT_MS);
    letzterTakt = jetzt;
    if (!sichtbar || jetzt - letzteEingabe > RUHIG_MS || !stand) return;
    stand = zaehle(stand, spanne / 1000, new Date(jetzt));
    speichere(STAND, stand);
  };
  for (const typ of ["pointerdown", "keydown"]) {
    document.addEventListener(typ, () => { letzteEingabe = Date.now(); }, true);
  }
  // Erst die Spanne bis jetzt zählen (mit dem alten Zustand), dann den neuen übernehmen.
  document.addEventListener("visibilitychange", () => {
    takt();
    sichtbar = document.visibilityState === "visible";
    if (!sichtbar) sofortSpeichern();
  });
  addEventListener("pagehide", () => { takt(); sofortSpeichern(); });
  setInterval(takt, TAKT_MS);
  return true;
}

/**
 * Am Rundenende: ist die Zeit um, endet das Spiel nach dieser Pause (schluss); sind weniger als fünf Minuten
 * übrig, kommt einmal je Tag die Vorwarnung. satz ist, was die Pause zeigt und spricht (sonst null).
 * @returns {Promise<{ schluss: boolean, satz: string | null }>}
 */
export async function amRundenende() {
  let z;
  try {
    z = await spielzeitLage();
  } catch {
    return { schluss: false, satz: null };
  }
  if (!z.lage.frei) return { schluss: true, satz: schlussSatz(z) };
  const jetzt = new Date();
  if (warnen(z.lage, z.stand, jetzt)) {
    stand = merkeGewarnt(z.stand, jetzt);
    speichere(STAND, stand);
    return { schluss: false, satz: SAETZE.bald };
  }
  return { schluss: false, satz: null };
}
