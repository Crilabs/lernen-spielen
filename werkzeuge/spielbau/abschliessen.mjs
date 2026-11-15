#!/usr/bin/env node
// Abschluss eines Spielbaus (docs/spielbau.md, Ablauf): Kosten aller Agenten buchen, Audio erzeugen, zusammenfassen
// und – nur wenn gewünscht, grün und kein Probelauf – per Fast-Forward nach main mergen. Ohne Sprachmodell.
//
//   node werkzeuge/spielbau/abschliessen.mjs --lauf <ablage>/lauf.json [--transkripte <ordner>]… [--steuerung <sitzung.jsonl>]
//     [--audio] [--spielbild] [--merge] [--parken "<Grund>"]
//
// --spielbild: erzeugt das Spielbild der Karte aus Screenshots des Spiels (werkzeuge/bilder/spielbild.mjs, Christian
//   2026-11-15) und trägt es als „bild“ in spiele/spiele.json ein.
//
// --transkripte: Ordner mit agent-*.jsonl (Workflow- oder Unteragenten, auch ganze Projektordner); gebucht wird jedes
//   Transkript, dessen erster Auftrag die Marke „[spielbau:<phase> <Id> <Branch>]“ dieses Laufs trägt (Phasen idee,
//   bau, pruefstand, pruefung). Der Stand in der Ablage verhindert, dass ein Transkript doppelt gebucht wird.
// --steuerung: das Transkript der steuernden Sitzung (Phase steuerung, mit Stand: nur der Zuwachs).
// Ergebnis: <ablage>/ergebnis.json und eine Zusammenfassung auf stdout.
import { execFileSync } from "node:child_process";
import { closeSync, existsSync, openSync, readFileSync, readSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { summiere } from "./summe.mjs";
import { setzeProbe } from "./freigeben.mjs";

const git = (args, cwd) => execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
const node = (args, cwd) => execFileSync("node", args, { cwd, encoding: "utf8" });

/** Alle agent-*.jsonl unter einem Ordner. */
function transkripte(ordner) {
  if (!existsSync(ordner)) return [];
  return readdirSync(ordner).flatMap((d) => {
    const p = join(ordner, d);
    if (statSync(p).isDirectory()) return transkripte(p);
    return /^agent-.*\.jsonl$/.test(d) ? [p] : [];
  });
}

/** Die ersten 64 KB einer Datei (der erste Auftrag steht am Anfang). */
function kopf(datei) {
  const fd = openSync(datei, "r");
  const puffer = Buffer.alloc(65536);
  const n = readSync(fd, puffer, 0, puffer.length, 0);
  closeSync(fd);
  return puffer.subarray(0, n).toString("utf8");
}

/** Phase eines Transkripts aus der Marke im ersten Auftrag, nur wenn er zu diesem Lauf gehört. */
export function phaseAusTranskript(text, id, branch) {
  for (const zeile of text.split("\n").slice(0, 8)) {
    let d;
    try { d = JSON.parse(zeile); } catch { continue; }
    if (d?.type !== "user") continue;
    const inhalt = typeof d.message?.content === "string" ? d.message.content : (d.message?.content ?? []).map((c) => c.text ?? "").join("\n");
    const m = inhalt.match(/\[spielbau:(idee|bau|pruefstand|pruefung) ([A-Z]\d\d) ([^\]\s]+)\]/);
    return m && m[2] === id && m[3] === branch ? m[1] : null;
  }
  return null;
}

function main() {
  const argv = process.argv.slice(2);
  const alle = (name) => argv.flatMap((a, i) => (a === name ? [argv[i + 1]] : []));
  const L = JSON.parse(readFileSync(alle("--lauf")[0], "utf8"));
  const cwd = L.worktree;
  const stand = join(L.ablage, "kosten-stand.json");
  const gebucht = [];

  for (const ordner of alle("--transkripte"))
    for (const t of transkripte(ordner)) {
      const phase = phaseAusTranskript(kopf(t), L.id, L.branch);
      if (!phase) continue;
      node(["werkzeuge/kosten/transkript.mjs", t, "--ordner", L.spielordner, "--phase", phase, "--notiz", `Spielbau ${phase}`, "--stand", stand], cwd);
      gebucht.push(phase);
    }
  for (const t of alle("--steuerung")) {
    node(["werkzeuge/kosten/transkript.mjs", t, "--ordner", L.spielordner, "--phase", "steuerung", "--notiz", "Spielbau Steuerung", "--stand", stand], cwd);
    gebucht.push("steuerung");
  }

  let audio = "nicht verlangt";
  if (argv.includes("--audio")) {
    try {
      const aus = execFileSync("npm", ["run", "audio", "--silent", "--", "--spiel", L.spielordner], { cwd, encoding: "utf8" });
      audio = aus.trim().split("\n").slice(-2).join(" ");
    } catch (e) {
      audio = `nicht erzeugt: ${String(e.stdout ?? e.message).trim().split("\n").slice(-2).join(" ")}`;
    }
  }

  let spielbild = "nicht verlangt";
  if (argv.includes("--spielbild")) {
    try {
      execFileSync("node", ["werkzeuge/bilder/spielbild.mjs", "--spiel", L.spielordner], { cwd, encoding: "utf8", env: { ...process.env, NODE_PATH: "/private/tmp/claude-501/pw/node_modules" } });
      const pfad = join(cwd, "spiele/spiele.json");
      const roh = readFileSync(pfad, "utf8");
      const bild = `"bild": "${L.fach}/${L.ordner}/spielbild.webp"`;
      if (!roh.includes(bild)) {
        const datei = `"datei": "${L.fach}/${L.ordner}/index.html"`;
        if (!roh.includes(datei)) throw new Error(`kein Eintrag ${datei} in spiele.json`);
        writeFileSync(pfad, roh.replace(datei, `${bild}, ${datei}`));
        JSON.parse(readFileSync(pfad, "utf8"));
      }
      spielbild = "erzeugt";
    } catch (e) {
      spielbild = `nicht erzeugt: ${String(e.stderr ?? e.message).trim().split("\n").slice(-1)[0]}`;
    }
  }

  const parken = alle("--parken")[0];
  if (parken) {
    const k = join(cwd, L.spielordner, "kosten.json");
    const liste = existsSync(k) ? JSON.parse(readFileSync(k, "utf8")) : [];
    liste.push({ datum: new Date().toISOString().slice(0, 10), phase: "geparkt", posten: "status", modell: "", eingabe: 0, ausgabe: 0, einheit: "keine", menge: 0, notiz: parken });
    writeFileSync(k, JSON.stringify(liste, null, 1) + "\n");
  }

  // committen, was der Abschluss erzeugt hat
  git(["add", "-A", L.spielordner, "spiele/audio", "spiele/spiele.json"], cwd);
  if (git(["status", "--porcelain", "--", L.spielordner, "spiele/audio", "spiele/spiele.json"], cwd))
    git(["commit", "-m", `chore(${L.ordner}): Spielbau-Abschluss (Kosten${argv.includes("--audio") ? ", Audio" : ""}${argv.includes("--spielbild") ? ", Spielbild" : ""}${parken ? ", geparkt" : ""})\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`], cwd);

  const kosten = summiere(join(cwd, L.spielordner, "kosten.json"), L.kostenVorher ?? 0);
  let merge = "nicht verlangt";
  if (argv.includes("--merge") && !parken) {
    if (L.probelauf) merge = `Probelauf (Basis ${L.basis}): nicht gemergt`;
    else {
      const liste = git(["worktree", "list", "--porcelain"], L.hauptrepo).split("\n\n");
      const mainWt = liste.find((b) => b.includes("branch refs/heads/main"))?.match(/^worktree (.+)$/m)?.[1];
      let ff = true;
      try { git(["merge-base", "--is-ancestor", "main", "HEAD"], cwd); } catch { ff = false; }
      if (!ff) merge = "kein Fast-Forward: main hat sich bewegt – erst `git merge main` im Spiel-Branch, Prüfstand wiederholen";
      else if (mainWt && git(["status", "--porcelain"], mainWt)) merge = `main-Worktree ${mainWt} ist nicht sauber – nicht gemergt`;
      else {
        // Erst Probe, dann fertig (docs/spielbau.md): als Probe markiert nach main; fertig erst nach freigeben.mjs.
        setzeProbe(cwd, L.id, true);
        if (git(["status", "--porcelain", "spiele/spiele.json"], cwd)) {
          git(["commit", "-am", `chore(${L.ordner}): als Probe markiert (erst fertig, wenn Christian oder Noelia es gespielt hat)\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`], cwd);
        }
        if (mainWt) git(["merge", "--ff-only", L.branch], mainWt);
        else git(["fetch", ".", `${L.branch}:main`], L.hauptrepo);
        const kopf = git(["rev-parse", "HEAD"], cwd);
        merge = git(["rev-parse", "main"], L.hauptrepo) === kopf ? `gemergt als Probe: main = ${kopf.slice(0, 7)}` : "Merge fehlgeschlagen";
      }
    }
  }

  const minuten = Math.round((Date.now() - Date.parse(L.start)) / 60000);
  const ergebnis = { id: L.id, branch: L.branch, gebucht, audio, spielbild, kosten, merge, minuten, geparkt: parken ?? null };
  writeFileSync(join(L.ablage, "ergebnis.json"), JSON.stringify(ergebnis, null, 1));
  console.log(JSON.stringify(ergebnis));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main();
