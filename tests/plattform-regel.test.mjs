import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const SPIELE = new URL("../spiele/", import.meta.url).pathname;

const MUSTER = {
  speechSynthesis: /\bspeechSynthesis\b/,
  SpeechSynthesisUtterance: /\bSpeechSynthesisUtterance\b/,
  localStorage: /\blocalStorage\b/,
  sessionStorage: /\bsessionStorage\b/,
  __TAURI__: /__TAURI__/,
  "navigator.mediaDevices": /navigator\.mediaDevices/,
  "new Audio(": /new Audio\(/,
};

// Heute erlaubte Zugriffe je Datei (Pfad relativ zu spiele/). Darf nur schrumpfen.
const AUSNAHMEN = {
  "einhorn-steine.html": ["speechSynthesis", "SpeechSynthesisUtterance", "localStorage"],
  "eltern.html": ["__TAURI__"],
  "eltern.js": ["__TAURI__"],
  "grossbuchstaben.html": ["speechSynthesis", "SpeechSynthesisUtterance"],
  "perlenbruecke.html": ["speechSynthesis", "SpeechSynthesisUtterance", "localStorage"],
  "wimmelbild.html": ["speechSynthesis", "SpeechSynthesisUtterance", "localStorage"],
  "zahlenzauber.html": ["speechSynthesis", "SpeechSynthesisUtterance", "localStorage"],
};

function dateien(ordner) {
  return readdirSync(ordner, { withFileTypes: true }).flatMap((e) => {
    const pfad = join(ordner, e.name);
    if (e.isDirectory()) return pfad === join(SPIELE, "kern") ? [] : dateien(pfad);
    return /\.(js|html)$/.test(e.name) ? [pfad] : [];
  });
}

function treffer() {
  const ergebnis = {};
  for (const pfad of dateien(SPIELE)) {
    const text = readFileSync(pfad, "utf8");
    const gefunden = Object.keys(MUSTER).filter((n) => MUSTER[n].test(text));
    if (gefunden.length) ergebnis[relative(SPIELE, pfad)] = gefunden;
  }
  return ergebnis;
}

test("kein Plattform-Zugriff außerhalb von kern/", () => {
  const fehler = [];
  for (const [datei, namen] of Object.entries(treffer())) {
    for (const name of namen) {
      if (!(AUSNAHMEN[datei] ?? []).includes(name)) {
        fehler.push(`${datei}: ${name} gehört nach spiele/kern/`);
      }
    }
  }
  assert.deepEqual(fehler, []);
});

test("Ausnahmeliste enthält nichts Überflüssiges", () => {
  const ist = treffer();
  const fehler = [];
  for (const [datei, namen] of Object.entries(AUSNAHMEN)) {
    for (const name of namen) {
      if (!(ist[datei] ?? []).includes(name)) {
        fehler.push(`${datei}: ${name} wird nicht mehr benutzt, Eintrag aus AUSNAHMEN löschen`);
      }
    }
  }
  assert.deepEqual(fehler, []);
});
