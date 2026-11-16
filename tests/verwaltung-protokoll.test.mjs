import { test } from "node:test";
import assert from "node:assert/strict";
import { appendFileSync, chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { claudeArgumente, startClaude } from "../werkzeuge/verwaltung/lauf.mjs";
import { journalBeobachter, mitUhr, zeileAusJournal, zeilenAusAusgabe, zeilenAusEreignis } from "../werkzeuge/verwaltung/protokoll.mjs";

test("zeilenAusEreignis: Start, Text, Werkzeuge, Fehler, Ende", () => {
  assert.deepEqual(zeilenAusEreignis({ type: "system", subtype: "init", model: "claude-opus-5-5" }), ["· Sitzung gestartet (claude-opus-5-5)"]);
  assert.deepEqual(zeilenAusEreignis({ type: "assistant", message: { content: [
    { type: "text", text: "Ich bereite\nG09 vor." },
    { type: "tool_use", name: "Bash", input: { command: "node werkzeuge/spielbau/vorbereiten.mjs G09\necho fertig" } },
    { type: "tool_use", name: "Skill", input: { skill: "spiel-bauen" } },
    { type: "tool_use", name: "Workflow", input: { script: "export const meta = { name: 'spiel-bauen', description: 'x' }" } },
    { type: "thinking", thinking: "geheim" },
  ] } }), ["✎ Ich bereite G09 vor.", "→ Bash: node werkzeuge/spielbau/vorbereiten.mjs G09", "→ Skill: spiel-bauen", "→ Workflow spiel-bauen"]);
  assert.deepEqual(zeilenAusEreignis({ type: "user", message: { content: [
    { type: "tool_result", content: "ok" },
    { type: "tool_result", is_error: true, content: [{ type: "text", text: "Exit code 1" }] },
  ] } }), ["✗ Exit code 1"]);
  assert.deepEqual(zeilenAusEreignis({ type: "result", subtype: "success", duration_ms: 5_400_000, total_cost_usd: 7.456, result: "G09 gemergt." }),
    ["■ Ende der Sitzung (success, 90 min, 7.46 $)", "G09 gemergt."]);
  assert.deepEqual(zeilenAusEreignis({ type: "stream_event" }), []);
});

test("zeilenAusAusgabe: kein JSON bleibt wörtlich, Leerzeilen fallen weg", () => {
  assert.deepEqual(zeilenAusAusgabe("Warnung: irgendwas"), ["Warnung: irgendwas"]);
  assert.deepEqual(zeilenAusAusgabe("  "), []);
});

test("zeileAusJournal: Einträge wie im Lauf G09", () => {
  assert.equal(zeileAusJournal({ type: "launched" }), "▶ Workflow gestartet");
  assert.equal(zeileAusJournal({ type: "started", key: "k", label: "Bau R1", phase: "Bau" }), "▶ Bau: Bau R1");
  assert.equal(zeileAusJournal({ type: "result", label: "Bau R1", result: { commit: "603388d", zusammenfassung: "Werkzeugwand gebaut." } }),
    "✓ Bau R1: Commit 603388d – Werkzeugwand gebaut.");
  assert.equal(zeileAusJournal({ type: "result", label: "Prüfstand R1", result: { gruen: false, rot: ["zurueck chromium"], hinweise: [] } }),
    "✓ Prüfstand R1: rot: zurueck chromium");
  assert.equal(zeileAusJournal({ type: "result", label: "Prüfstand R1.2", result: { gruen: true, rot: [] } }), "✓ Prüfstand R1.2: grün");
  assert.equal(zeileAusJournal({ type: "result", label: "Spielprüfung R1", result: { kern: { ja: true, beleg: "…" }, schoen: { ja: false, beleg: "…" }, grenzen: [] } }),
    "✓ Spielprüfung R1: kern ja, schoen NEIN");
  assert.equal(zeileAusJournal({ type: "unbekannt" }), null);
});

test("journalBeobachter: nur neue, vollständige Zeilen; result bekommt das Label über key", () => {
  const sitzung = mkdtempSync(join(tmpdir(), "sitzung-"));
  const wf = join(sitzung, "subagents", "workflows", "wf_1");
  const zeilen = [];
  const sieh = journalBeobachter(sitzung, (z) => zeilen.push(z));
  sieh(); // noch kein Ordner
  mkdirSync(wf, { recursive: true });
  const j = join(wf, "journal.jsonl");
  writeFileSync(j, `${JSON.stringify({ type: "launched" })}\n${JSON.stringify({ type: "started", key: "k1", label: "Idee G09", phase: "Idee" })}\n{"type":"res`);
  sieh();
  assert.deepEqual(zeilen, ["▶ Workflow gestartet", "▶ Idee: Idee G09"]);
  writeFileSync(j, `${JSON.stringify({ type: "launched" })}\n${JSON.stringify({ type: "started", key: "k1", label: "Idee G09", phase: "Idee" })}\n`);
  appendFileSync(j, `${JSON.stringify({ type: "result", key: "k1", result: { zusammenfassung: "Werkzeugwand" } })}\n`);
  sieh();
  sieh();
  assert.deepEqual(zeilen, ["▶ Workflow gestartet", "▶ Idee: Idee G09", "✓ Idee G09: Werkzeugwand"]);
  rmSync(sitzung, { recursive: true });
});

test("mitUhr: Uhrzeit davor, Zeilenende danach", () => {
  assert.match(mitUhr("x", new Date(2026, 10, 16, 18, 5, 9)), /^18:05:09 x\n$/);
});

test("claudeArgumente: stream-json mit --verbose, Sperrliste zuletzt", () => {
  const a = claudeArgumente("Spiel entwickeln G09", "s1");
  assert.deepEqual(a.slice(0, 7), ["-p", "Spiel entwickeln G09", "--session-id", "s1", "--output-format", "stream-json", "--verbose"]);
  assert.equal(a[a.indexOf("--disallowedTools") + 1], "Bash(git push:*)");
  assert.equal(a.at(-1), "Bash(./release.sh:*)");
});

// Das vorgetäuschte claude ist ein sh-Skript; die Verwaltung läuft nur auf dem Mac (npm run verwaltung).
test("startClaude: Protokoll wächst während des Laufs lesbar, Exit-Code zurück", { skip: process.platform === "win32" && "braucht sh" }, async () => {
  const o = mkdtempSync(join(tmpdir(), "start-"));
  const bin = join(o, "bin");
  mkdirSync(bin);
  const ereignisse = [
    { type: "system", subtype: "init", model: "m" },
    { type: "assistant", message: { content: [{ type: "tool_use", name: "Skill", input: { skill: "spiel-entwickeln" } }] } },
    { type: "result", subtype: "success", result: "fertig" },
  ];
  writeFileSync(join(bin, "claude"), `#!/bin/sh\ncat <<'E'\n${ereignisse.map((e) => JSON.stringify(e)).join("\n")}\nE\necho kaputt >&2\nexit 3\n`);
  chmodSync(join(bin, "claude"), 0o755);
  const pfadVorher = process.env.PATH;
  process.env.PATH = `${bin}:${pfadVorher}`;
  try {
    const protokoll = join(o, "protokolle", "a.log");
    const code = await startClaude({ befehl: "Spiel entwickeln G09", auftragId: "a", wurzel: o, protokoll, alleMs: 20 });
    assert.equal(code, 3);
    const text = readFileSync(protokoll, "utf8");
    assert.match(text, /^# .* Spiel entwickeln G09\n# Sitzung [0-9a-f-]+\n/);
    for (const z of ["· Sitzung gestartet (m)", "→ Skill: spiel-entwickeln", "■ Ende der Sitzung (success)", "fertig", "! kaputt", "# Ende, Exit-Code 3"]) {
      assert.ok(text.includes(z), `fehlt: ${z}\n${text}`);
    }
    assert.ok(!text.includes('{"type"'), "kein rohes JSON im Protokoll");
  } finally {
    process.env.PATH = pfadVorher;
    rmSync(o, { recursive: true });
  }
});
