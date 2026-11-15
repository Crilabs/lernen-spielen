#!/usr/bin/env node
// Lauf der Verwaltung: arbeitet die Warteschlange nacheinander ab, nie zwei Läufe gleichzeitig
// (docs/superpowers/specs/2026-11-16-verwaltung-design.md, „Abarbeiten“).
//
//   node werkzeuge/verwaltung/lauf.mjs abarbeiten        alle wartenden Aufträge mit `claude -p` (startet die Seite)
//   node werkzeuge/verwaltung/lauf.mjs naechster         Chat: nimmt die Sperre, setzt den obersten Auftrag auf „laeuft“,
//                                                        druckt { id, art, ziel, befehl } (oder meldet „läuft schon“)
//   node werkzeuge/verwaltung/lauf.mjs fertig <id> <status>   Chat: setzt den Status und gibt die Sperre frei

import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createWriteStream, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { STATUS, ladeAuftraege, naechsterWartender, speichereAuftraege, statusAusErgebnis } from "./auftraege.mjs";

export const ORDNER = dirname(fileURLToPath(import.meta.url));
export const WURZEL = join(ORDNER, "..", "..");
/** Eine Chat-Sperre hat keinen Prozess, der sie hält; sie verfällt nach dieser Zeit. */
const CHAT_HOECHSTENS_MS = 12 * 60 * 60 * 1000;

export const VERBOTEN = ["Bash(git push:*)", "Bash(ssh:*)", "Bash(scp:*)", "Bash(./release.sh:*)"];

export function pfade(ordner) {
  return {
    auftraege: join(ordner, "auftraege.json"),
    sperre: join(ordner, ".lauf.lock"),
    anhalten: join(ordner, ".anhalten"),
    ergebnis: (id) => join(ordner, "ergebnisse", `${id}.json`),
    protokoll: (id) => join(ordner, "protokolle", `${id}.log`),
  };
}

function lebt(pid) {
  try { process.kill(pid, 0); return true; } catch (e) { return /** @type {any} */ (e).code === "EPERM"; }
}

/** Die gültige Sperre oder null (tote Prozesse und alte Chat-Sperren zählen nicht). */
export function sperre(ordner) {
  const p = pfade(ordner).sperre;
  if (!existsSync(p)) return null;
  let s;
  try { s = JSON.parse(readFileSync(p, "utf8")); } catch { return null; }
  if (s.pid) return lebt(s.pid) ? s : null;
  return Date.now() - Date.parse(s.seit) < CHAT_HOECHSTENS_MS ? s : null;
}

/** Nimmt die Sperre; false, wenn eine gültige besteht. wer: "seite" (mit pid) oder "chat" (pid null). */
export function nimmSperre(ordner, { pid, wer }) {
  const p = pfade(ordner).sperre;
  const inhalt = JSON.stringify({ pid, wer, seit: new Date().toISOString() });
  for (let versuch = 0; versuch < 2; versuch++) {
    try { writeFileSync(p, inhalt, { flag: "wx" }); return true; } catch (e) {
      if (/** @type {any} */ (e).code !== "EEXIST") throw e;
      if (sperre(ordner)) return false;
      rmSync(p, { force: true }); // verfallene Sperre ersetzen
    }
  }
  return false;
}

export function gibSperreFrei(ordner) {
  rmSync(pfade(ordner).sperre, { force: true });
}

export function anhalten(ordner) {
  writeFileSync(pfade(ordner).anhalten, new Date().toISOString());
}

/** Wo Claude Code das Transkript einer Sitzung ablegt. */
export function transkriptPfad(wurzel, sessionId, heim = homedir()) {
  return join(heim, ".claude", "projects", wurzel.replace(/[^a-zA-Z0-9]/g, "-"), `${sessionId}.jsonl`);
}

/**
 * Umgebung des Laufs. Die Sperrliste VERBOTEN lässt sich umgehen (z. B. `git -C . push`), darum lenkt Git hier jede
 * Push-Adresse auf ein Schema ohne Helfer um: Ein Push scheitert, Fetch und lokale Arbeit gehen weiter.
 * Nur Schutz vor Versehen, keine Absperrung: Ein Agent könnte die Variablen selbst ändern, und eine ausdrückliche
 * remote.<name>.pushurl wird von pushInsteadOf nicht umgelenkt (im Repo gibt es keine, Stand 2026-11-16). Echte
 * Absperrung wäre ein Benutzer ohne Push-Zugang.
 */
export function laufUmgebung(basis, auftragId, transkript) {
  return {
    ...basis,
    VERWALTUNG_AUFTRAG: auftragId,
    VERWALTUNG_TRANSKRIPT: transkript,
    GIT_CONFIG_COUNT: "1",
    GIT_CONFIG_KEY_0: "url.kein-push:///.pushInsteadOf",
    GIT_CONFIG_VALUE_0: "",
    GIT_TERMINAL_PROMPT: "0",
    GIT_SSH_COMMAND: "false",
  };
}

/** Startet einen Auftrag als `claude -p` im Repo; Ausgabe ins Protokoll. Ergebnis: Exit-Code. */
export function startClaude({ befehl, auftragId, wurzel, protokoll }) {
  const sessionId = randomUUID();
  mkdirSync(dirname(protokoll), { recursive: true });
  const log = createWriteStream(protokoll, { flags: "a" });
  log.write(`# ${new Date().toISOString()} ${befehl}\n# Sitzung ${sessionId}\n`);
  const kind = spawn("claude", [
    "-p", befehl, "--session-id", sessionId, "--permission-mode", "bypassPermissions", "--disallowedTools", ...VERBOTEN,
  ], {
    cwd: wurzel,
    env: laufUmgebung(process.env, auftragId, transkriptPfad(wurzel, sessionId)),
    stdio: ["ignore", "pipe", "pipe"],
  });
  kind.stdout.pipe(log, { end: false });
  kind.stderr.pipe(log, { end: false });
  return new Promise((ok) => {
    kind.on("error", (e) => { log.end(`\n# Start fehlgeschlagen: ${e.message}\n`); ok(-1); });
    kind.on("close", (code) => { log.end(`\n# Ende, Exit-Code ${code}\n`); ok(code ?? -1); });
  });
}

/** Ändert einen Auftrag in der Datei (frisch gelesen, damit Änderungen der Seite während des Laufs bleiben). */
function aendere(ordner, id, f) {
  const datei = pfade(ordner).auftraege;
  const l = ladeAuftraege(datei);
  const neu = f(l, l.findIndex((a) => a.id === id));
  speichereAuftraege(datei, neu);
  return neu;
}

function liesErgebnis(datei) {
  try { return JSON.parse(readFileSync(datei, "utf8")); } catch { return null; }
}

/**
 * Arbeitet die Warteschlange ab, ein Auftrag nach dem anderen.
 * @param {{ ordner?: string, wurzel?: string, starte?: typeof startClaude, folge?: (a: any, ergebnis: any) => any }} o
 *   folge: liefert nach einem Spiel-Auftrag ggf. einen Auftrag, der direkt dahinter eingereiht wird.
 */
export async function arbeiteAb({ ordner = ORDNER, wurzel = WURZEL, starte = startClaude, folge = () => null } = {}) {
  if (!nimmSperre(ordner, { pid: process.pid, wer: "seite" })) throw new Error("Es läuft schon ein Lauf (Sperre .lauf.lock).");
  const p = pfade(ordner);
  rmSync(p.anhalten, { force: true });
  try {
    for (;;) {
      const a = naechsterWartender(ladeAuftraege(p.auftraege));
      if (!a) break;
      aendere(ordner, a.id, (l, i) => { l[i] = { ...l[i], status: "laeuft", gestartet: new Date().toISOString() }; return l; });
      rmSync(p.ergebnis(a.id), { force: true });
      try {
        await starte({ befehl: a.befehl, auftragId: a.id, wurzel, protokoll: p.protokoll(a.id) });
      } catch (e) {
        mkdirSync(dirname(p.protokoll(a.id)), { recursive: true });
        writeFileSync(p.protokoll(a.id), `\n# Fehler: ${/** @type {any} */ (e).message}\n`, { flag: "a" });
      }
      const ergebnis = existsSync(p.ergebnis(a.id)) ? liesErgebnis(p.ergebnis(a.id)) : null;
      const status = statusAusErgebnis(ergebnis);
      const nach = a.art === "spiel" && status !== "fehlgeschlagen" ? folge(a, ergebnis) : null;
      aendere(ordner, a.id, (l, i) => {
        l[i] = { ...l[i], status, beendet: new Date().toISOString(), ergebnis };
        if (nach) l.splice(i + 1, 0, nach);
        return l;
      });
      if (existsSync(p.anhalten)) break;
    }
  } finally {
    rmSync(p.anhalten, { force: true });
    gibSperreFrei(ordner);
  }
}

async function main(argv) {
  const [befehl, ...rest] = argv;
  const p = pfade(ORDNER);
  if (befehl === "abarbeiten") {
    const { folgeAuftrag } = await import("./folge.mjs");
    await arbeiteAb({ folge: folgeAuftrag });
  } else if (befehl === "naechster") {
    if (!nimmSperre(ORDNER, { pid: null, wer: "chat" })) {
      console.log(JSON.stringify({ laeuftSchon: sperre(ORDNER) }));
      process.exitCode = 2;
      return;
    }
    const a = naechsterWartender(ladeAuftraege(p.auftraege));
    if (!a) { gibSperreFrei(ORDNER); console.log(JSON.stringify({ leer: true })); return; }
    aendere(ORDNER, a.id, (l, i) => { l[i] = { ...l[i], status: "laeuft", gestartet: new Date().toISOString() }; return l; });
    console.log(JSON.stringify({ id: a.id, art: a.art, ziel: a.ziel, befehl: a.befehl }));
  } else if (befehl === "fertig") {
    const [id, status] = rest;
    if (!STATUS.includes(status)) throw new Error(`status muss ${STATUS.join(", ")} sein`);
    aendere(ORDNER, id, (l, i) => {
      if (i < 0) throw new Error(`Auftrag ${id} nicht gefunden`);
      l[i] = { ...l[i], status, beendet: new Date().toISOString() };
      return l;
    });
    gibSperreFrei(ORDNER);
    console.log(`${id}: ${status}`);
  } else {
    console.error("Aufruf: lauf.mjs abarbeiten | naechster | fertig <id> <status>");
    process.exitCode = 1;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main(process.argv.slice(2));
