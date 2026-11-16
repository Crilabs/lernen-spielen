#!/usr/bin/env node
// PreToolUse-Hook (.claude/settings.json): sperrt Browser, die nicht über starteStumm starten. Agenten schrieben sich
// für Screenshots eigene Skripte mit chromium.launch(); jedes spielte alle Aufnahmen und Klänge des Spiels über die
// Lautsprecher, während Christian parallel arbeitet und telefoniert (47 Fälle am 15./16.11.2026).
// Nur Schutz vor Versehen: wer den Aufruf verschleiert, kommt durch.

import { readFileSync } from "node:fs";

export const LAUT = /\b(chromium|webkit|firefox)\s*\.\s*(launch|launchPersistentContext|launchServer)\s*\(/;
const ERLAUBT = /(^|\/)tests\/browser\/stumm\.mjs$/;

export const GRUND = [
  "Gesperrt: Browser mit Ton. Ein eigener chromium/webkit/firefox.launch() spielt alle Aufnahmen und Klänge über",
  "Christians Lautsprecher. Stattdessen:",
  "- Screenshot: NODE_PATH=/private/tmp/claude-501/pw/node_modules node werkzeuge/spielbau/bildschirm.mjs <seite> <bild.png>",
  "  [--groesse 1280x800] [--warte ms] [--browser chromium|webkit] [--bis-aufgabe] [--ganz]",
  "- Eigenes Skript: import { starteStumm } from \"<repo>/tests/browser/stumm.mjs\"; const browser = await starteStumm(chromium, {});",
].join("\n");

/** Der Text eines Werkzeugaufrufs, in dem ein Browserstart stehen kann, oder null, wenn er erlaubt ist. */
export function zuPruefen(werkzeug, e = {}) {
  if (werkzeug === "Bash") return e.command ?? "";
  if (ERLAUBT.test(e.file_path ?? "")) return null;
  if (werkzeug === "Write") return e.content ?? "";
  if (werkzeug === "Edit") return e.new_string ?? "";
  if (werkzeug === "MultiEdit") return (e.edits ?? []).map((x) => x.new_string ?? "").join("\n");
  return null;
}

/** true, wenn der Aufruf gesperrt wird. */
export function gesperrt(eingabe) {
  const text = zuPruefen(eingabe?.tool_name, eingabe?.tool_input);
  return text !== null && LAUT.test(text);
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop() ?? "")) {
  let eingabe = null;
  try { eingabe = JSON.parse(readFileSync(0, "utf8")); } catch { process.exit(0); }
  if (gesperrt(eingabe)) {
    process.stderr.write(`${GRUND}\n`);
    process.exit(2); // Exit 2: Claude Code bricht den Aufruf ab und gibt stderr an den Agenten
  }
}
