// Lesbares Protokoll eines Laufs: macht aus der Ausgabe von `claude -p --output-format stream-json` und aus den
// Journalen der Workflows kurze Zeilen. Ohne das stünde im Protokoll bis zum Ende nichts: Im Textmodus druckt
// `claude -p` nur das Endergebnis, und die eigentliche Arbeit tun die Agenten der Workflows (Lauf G09, 2026-11-16).

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const kuerze = (text, n) => {
  const t = String(text ?? "").replace(/\s+/g, " ").trim();
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
};

const uhr = (d) => d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

/** Kurzform eines Werkzeugaufrufs: das Wichtigste aus seinen Eingaben. */
function werkzeug(name, e = {}) {
  const wert = e.command ?? e.skill ?? e.description ?? e.file_path ?? e.scriptPath ?? e.pattern ?? e.url ?? e.query ?? e.prompt;
  if (name === "Workflow" && !wert) {
    const meta = String(e.script ?? "").match(/name:\s*['"]([^'"]+)['"]/);
    return `Workflow ${meta ? meta[1] : ""}`.trim();
  }
  return wert === undefined ? name : `${name}: ${kuerze(String(wert).split("\n")[0], 160)}`;
}

/**
 * Zeilen zu einem Ereignis aus `--output-format stream-json` (ohne Uhrzeit). Mit Hintergrund-Agenten besteht eine
 * Sitzung aus mehreren Zügen: Jede Meldung eines Agenten weckt sie, jeder Zug bringt eigenes init und result
 * (Lauf „Mit echten Dingen“, 2026-11-17). `zustand` merkt sich den Start, damit er nur einmal im Protokoll steht;
 * das result eines Zugs wiederholt seinen Text nicht (steht schon als ✎ da), das Ende des Laufs ist „# Ende“.
 * @param {any} ev
 * @param {{ gestartet?: boolean }} [zustand]
 * @returns {string[]}
 */
export function zeilenAusEreignis(ev, zustand = {}) {
  if (!ev || typeof ev !== "object") return [];
  if (ev.type === "system" && ev.subtype === "init") {
    if (zustand.gestartet) return [];
    zustand.gestartet = true;
    return [`· Sitzung gestartet (${ev.model ?? "?"})`];
  }
  if (ev.type === "assistant") {
    return (ev.message?.content ?? []).flatMap((b) => {
      if (b.type === "text" && b.text?.trim()) return [`✎ ${kuerze(b.text, 400)}`];
      if (b.type === "tool_use") return [`→ ${werkzeug(b.name, b.input)}`];
      return [];
    });
  }
  if (ev.type === "user") {
    const inhalt = ev.message?.content;
    if (!Array.isArray(inhalt)) return [];
    return inhalt.filter((b) => b.type === "tool_result" && b.is_error).map((b) => {
      const t = Array.isArray(b.content) ? b.content.map((x) => x.text ?? "").join(" ") : b.content;
      return `✗ ${kuerze(t, 300)}`;
    });
  }
  if (ev.type === "result") {
    const kosten = typeof ev.total_cost_usd === "number" ? `bisher ${ev.total_cost_usd.toFixed(2)} $` : "";
    if (ev.subtype === "success") return [`· Zug fertig${kosten ? ` (${kosten})` : ""}`];
    const grund = [ev.subtype ?? "?", kosten].filter(Boolean).join(", ");
    return [`✗ Zug abgebrochen (${grund})${ev.result ? `: ${kuerze(ev.result, 600)}` : ""}`];
  }
  return [];
}

/** Zeile für die Ausgabe von claude: JSON wird übersetzt, alles andere bleibt wörtlich. */
export function zeilenAusAusgabe(zeile, zustand = {}) {
  if (!zeile.trim()) return [];
  let ev;
  try { ev = JSON.parse(zeile); } catch { return [zeile]; }
  return zeilenAusEreignis(ev, zustand);
}

/** Was ein Agent des Workflows zurückgegeben hat, in einer Zeile. */
function ergebnisKurz(r) {
  if (r === null || r === undefined) return "fertig";
  if (typeof r !== "object") return kuerze(r, 300);
  if (typeof r.gruen === "boolean") {
    return r.gruen ? "grün" : `rot: ${kuerze((r.rot ?? []).join(" | "), 300)}`;
  }
  const teile = [];
  if (r.commit) teile.push(`Commit ${r.commit}`);
  if (r.zusammenfassung) teile.push(kuerze(r.zusammenfassung, 300));
  if (!teile.length) {
    const urteile = Object.entries(r).filter(([, v]) => v && typeof v === "object" && typeof v.ja === "boolean");
    if (urteile.length) return urteile.map(([k, v]) => `${k} ${v.ja ? "ja" : "NEIN"}`).join(", ");
  }
  return teile.length ? teile.join(" – ") : "fertig";
}

/**
 * Zeile zu einem Eintrag aus dem journal.jsonl eines Workflows (ohne Uhrzeit), oder null.
 * @param {any} e
 */
export function zeileAusJournal(e) {
  if (!e || typeof e !== "object") return null;
  if (e.type === "launched") return "▶ Workflow gestartet";
  if (e.type === "started") return `▶ ${e.phase ? `${e.phase}: ` : ""}${e.label ?? "Agent"}`;
  if (e.type === "result") return `✓ ${e.label ?? "Agent"}: ${ergebnisKurz(e.result)}`;
  if (e.type === "error" || e.type === "failed") return `✗ ${e.label ?? "Workflow"}: ${kuerze(e.error ?? e.message ?? "", 300)}`;
  return null;
}

/**
 * Beobachtet die Journale der Workflows einer Sitzung (<transkript ohne .jsonl>/subagents/workflows/*\/journal.jsonl)
 * und gibt neue Einträge als Zeilen weiter. Ein „result“ trägt kein Label; es wird über `key` dem „started“ zugeordnet.
 * @param {string} sitzungsOrdner
 * @param {(zeile: string) => void} schreibe
 * @returns {() => void} einmal nachsehen
 */
export function journalBeobachter(sitzungsOrdner, schreibe) {
  const gelesen = new Map(); // Datei → Anzahl verarbeiteter Zeilen
  const labels = new Map(); // key → label
  return () => {
    const wurzel = join(sitzungsOrdner, "subagents", "workflows");
    if (!existsSync(wurzel)) return;
    for (const wf of readdirSync(wurzel).sort()) {
      const datei = join(wurzel, wf, "journal.jsonl");
      if (!existsSync(datei)) continue;
      const zeilen = readFileSync(datei, "utf8").split("\n");
      const fertig = zeilen.length - 1; // die letzte Zeile kann noch unvollständig sein
      for (let i = gelesen.get(datei) ?? 0; i < fertig; i++) {
        let e;
        try { e = JSON.parse(zeilen[i]); } catch { continue; }
        if (e.type === "started" && e.key) labels.set(e.key, e.label);
        if (e.type === "result" && !e.label && e.key) e = { ...e, label: labels.get(e.key) };
        const z = zeileAusJournal(e);
        if (z) schreibe(z);
      }
      gelesen.set(datei, Math.max(gelesen.get(datei) ?? 0, fertig));
    }
  };
}

/** Setzt die Uhrzeit vor eine Zeile. */
export const mitUhr = (zeile, jetzt = new Date()) => `${uhr(jetzt)} ${zeile}\n`;
