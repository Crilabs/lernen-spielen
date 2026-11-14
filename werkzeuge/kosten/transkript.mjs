#!/usr/bin/env node
// Bucht den Verbrauch eines Agenten aus seinem Transkript in kosten.json (docs/spielentwicklung.md §6).
//
//   node werkzeuge/kosten/transkript.mjs <transkript.jsonl> --ordner <spielordner> --phase <phase>
//     [--notiz "<text>"] [--thema <id>[,<id>…]] [--themen <n>] [--stand <stand.json>] [--datum JJJJ-MM-TT] [--zeigen]
//
// Transkripte (Claude Code): Unteragent ~/.claude/projects/<projekt>/<sitzung>/subagents/agent-<agentId>.jsonl,
// die Sitzung selbst ~/.claude/projects/<projekt>/<sitzung>.jsonl.
// --stand merkt sich je Transkript die schon gebuchten Nachrichten: Wird derselbe Agent fortgesetzt (SendMessage),
// bucht der nächste Aufruf nur den Zuwachs, nichts doppelt. Ohne --stand wird das ganze Transkript gebucht.
// --thema (Mit echten Dingen): die Thema-Ids des Eintrags; der Bericht zählt jedes Thema einmal, auch wenn Schreiben
// und mehrere Prüfrunden es buchen (--themen allein würde je Eintrag zählen).
// --zeigen gibt nur aus, bucht nicht und ändert den Stand nicht.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { trageEin, usageAusTranskript } from "./kosten.mjs";

/** @param {string[]} argv */
export function leseArgumente(argv) {
  const a = { transkript: "", ordner: "", phase: "", notiz: "", themen: undefined, thema: undefined, stand: "", datum: new Date().toISOString().slice(0, 10), zeigen: false };
  for (let i = 0; i < argv.length; i++) {
    const x = argv[i];
    const wert = () => {
      const w = argv[++i];
      if (w === undefined) throw new Error(`${x} braucht einen Wert`);
      return w;
    };
    if (x === "--ordner") a.ordner = wert();
    else if (x === "--phase") a.phase = wert();
    else if (x === "--notiz") a.notiz = wert();
    else if (x === "--themen") a.themen = Number(wert());
    else if (x === "--thema") a.thema = [...(a.thema ?? []), ...wert().split(",").filter(Boolean)];
    else if (x === "--stand") a.stand = wert();
    else if (x === "--datum") a.datum = wert();
    else if (x === "--zeigen") a.zeigen = true;
    else if (!x.startsWith("--") && !a.transkript) a.transkript = x;
    else throw new Error(`unbekannter Schalter ${x}`);
  }
  if (!a.transkript || (!a.zeigen && (!a.ordner || !a.phase)))
    throw new Error("Aufruf: node werkzeuge/kosten/transkript.mjs <transkript.jsonl> --ordner <spielordner> --phase <phase> [--notiz …] [--thema id] [--themen n] [--stand <datei>] [--zeigen]");
  return a;
}

function main() {
  const a = leseArgumente(process.argv.slice(2));
  const pfad = resolve(a.transkript);
  const stand = a.stand && existsSync(a.stand) ? JSON.parse(readFileSync(a.stand, "utf8")) : {};
  const u = usageAusTranskript(readFileSync(pfad, "utf8"), { ohne: stand[pfad] ?? [] });
  const { ids, nachrichten, ...rest } = u;
  console.log(`${nachrichten} neue Antworten · ${u.modell || "?"} · ein ${u.eingabe} · aus ${u.ausgabe} · Cache lesen ${u.cache_lesen} · Cache schreiben ${u.cache_schreiben}`);
  if (a.zeigen) return;
  if (!nachrichten) {
    console.log("nichts zu buchen");
    return;
  }
  trageEin(a.ordner, { ...rest, datum: a.datum, phase: a.phase, notiz: a.notiz, ...(a.themen !== undefined ? { themen: a.themen } : {}), ...(a.thema ? { thema: a.thema } : {}) });
  if (a.stand) {
    stand[pfad] = ids;
    mkdirSync(dirname(resolve(a.stand)), { recursive: true });
    writeFileSync(a.stand, JSON.stringify(stand) + "\n");
  }
  console.log(`gebucht in ${a.ordner}/kosten.json (${a.phase})`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main();
