#!/usr/bin/env node
// Prüfstand des Spielbaus (docs/spielbau.md, Ablauf): alles, was eine Maschine prüfen kann, in einem Aufruf, mit
// einer kurzen JSON-Zeile als Ergebnis für die Steuerung.
//
//   NODE_PATH=/private/tmp/claude-501/pw/node_modules node werkzeuge/spielbau/pruefstand.mjs --lauf <ablage>/lauf.json --runde <n>
//
// Schritte (im Worktree des Laufs): Eintrag in spiele.json · npm test · Durchspielen (alle Kinder, Chromium und
// WebKit, beide Größen) und je Lernstufe (Chromium, 1280 × 800) · Textprüfung (texte.mjs) · Filmstreifen je Stufe
// (filmstreifen.mjs) mit Takt-Grenzen aus §1. Ergebnis: <ablage>/r<n>/pruefstand.json und als letzte Zeile auf
// stdout { gruen, rot, hinweise, takt, ordner }. Exit 0 auch bei Rot (das Urteil steht im JSON); ≠ 0 nur, wenn der
// Prüfstand selbst nicht laufen konnte.
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { pruefeTexte, texteDesSpiels } from "./texte.mjs";

const PW = "/private/tmp/claude-501/pw/node_modules";
/** Takt-Grenzen (docs/spielbau.md §1): Wirkung höchstens etwa 2,5 s, Reaktion unter 0,3 s. */
export const GRENZEN = { folgeRot: 4500, folgeHinweis: 3000, reaktionHinweis: 300, einfuehrungHinweis: 25000 };

function lauf(befehl, args, { cwd, frist = 900000, env = {} } = {}) {
  return new Promise((fertig) => {
    const p = spawn(befehl, args, { cwd, env: { ...process.env, NODE_PATH: PW, ...env } });
    let aus = "";
    p.stdout.on("data", (d) => (aus += d));
    p.stderr.on("data", (d) => (aus += d));
    const t = setTimeout(() => { aus += `\n[abgebrochen nach ${frist / 1000} s]`; p.kill("SIGKILL"); }, frist);
    p.on("close", (code) => { clearTimeout(t); fertig({ code: code ?? 1, aus }); });
  });
}

/** Rote Prüfungen aus einem Bericht von durchspielen.mjs, je eine Zeile. */
export function roteLaeufe(bericht, wo) {
  const raus = [];
  if (bericht.fehler) raus.push(`Durchspielen ${wo}: ${String(bericht.fehler).slice(0, 300)}`);
  for (const l of bericht.laeufe ?? [])
    for (const p of l.pruefungen.filter((x) => !x.ok))
      raus.push(`Durchspielen ${wo} · ${l.kind} ${l.browser} ${l.groesse}: ${p.name}${p.grund ? ` – ${String(p.grund).slice(0, 240)}` : ""}`);
  return raus;
}

/** Bewertet den Takt eines Filmstreifens nach §1. */
export function taktBefunde(t, stufe) {
  const rot = [], hinweise = [];
  for (const f of t.fehler ?? []) (/kein Fehlversuch/.test(f) ? hinweise : rot).push(`Filmstreifen ${stufe}: ${f}`);
  if (t.folgeMs != null && t.folgeMs > GRENZEN.folgeRot) rot.push(`§1 Wirkung ${stufe}: ${t.folgeMs} ms vom Zug bis zur nächsten Aufgabe (höchstens etwa 2 500, Grenze ${GRENZEN.folgeRot})`);
  else if (t.folgeMs != null && t.folgeMs > GRENZEN.folgeHinweis) hinweise.push(`§1 Wirkung ${stufe}: ${t.folgeMs} ms (Ziel etwa 2 500)`);
  if (t.reaktionMs != null && t.reaktionMs > GRENZEN.reaktionHinweis) hinweise.push(`§1 erste Reaktion ${stufe}: ${t.reaktionMs} ms nach dem Zug (Ziel unter 300)`);
  return { rot, hinweise };
}

async function main() {
  const argv = process.argv.slice(2);
  const laufDatei = argv.includes("--lauf") ? resolve(argv[argv.indexOf("--lauf") + 1]) : null;
  const runde = argv.includes("--runde") ? Number(argv[argv.indexOf("--runde") + 1]) : 1;
  if (!laufDatei || !existsSync(laufDatei)) throw new Error("Aufruf: pruefstand.mjs --lauf <ablage>/lauf.json --runde <n>");
  const L = JSON.parse(readFileSync(laufDatei, "utf8"));
  const cwd = L.worktree;
  const ordner = join(L.ablage, `r${runde}`);
  mkdirSync(ordner, { recursive: true });
  const rot = [], hinweise = [], takt = {};

  // 1. Eintrag in spiele.json und Lernstufen
  const spiele = JSON.parse(readFileSync(join(cwd, "spiele/spiele.json"), "utf8"));
  const liste = Array.isArray(spiele) ? spiele : spiele.spiele ?? [];
  const eintrag = liste.find((s) => s.datei === `${L.fach}/${L.ordner}/index.html`);
  const stufen = [...new Set((eintrag?.arten ?? []).flatMap((a) => a.stufen ?? []))];
  if (!eintrag) rot.push(`G13 kein Eintrag mit datei „${L.fach}/${L.ordner}/index.html“ in spiele/spiele.json`);
  if (!existsSync(join(cwd, L.seite))) rot.push(`G13 Seite fehlt: ${L.seite}`);

  if (!rot.length) {
    // 2.–3. npm test und Durchspielen parallel
    const seite = L.seite;
    const ds = (extra, name) => lauf("node", ["tests/browser/durchspielen.mjs", seite, "--bericht", join(ordner, `${name}.json`), "--bilder", join(ordner, "bilder", name), ...extra], { cwd });
    const auftraege = [
      lauf("npm", ["test", "--silent"], { cwd, frist: 600000 }).then((r) => ({ name: "npm test", r })),
      ds([], "durchspielen").then((r) => ({ name: "durchspielen", r })),
      ...stufen.map((s) => ds(["--stufe", s, "--browser", "chromium", "--groessen", "1280x800"], `durchspielen-${s}`).then((r) => ({ name: `durchspielen-${s}`, r }))),
    ];
    for (const { name, r } of await Promise.all(auftraege)) {
      writeFileSync(join(ordner, `${name.replace(/ /g, "-")}.txt`), r.aus);
      if (name === "npm test") {
        if (r.code !== 0) rot.push(`G13 npm test rot: ${r.aus.split("\n").filter((z) => /not ok|error|Error|✖|fail/i.test(z)).slice(0, 8).join(" | ").slice(0, 900)}`);
        continue;
      }
      const datei = join(ordner, `${name}.json`);
      if (existsSync(datei)) rot.push(...roteLaeufe(JSON.parse(readFileSync(datei, "utf8")), name.replace("durchspielen", "").replace(/^-/, "") || "alle"));
      else if (r.code !== 0) rot.push(`Durchspielen ${name}: lief nicht – ${r.aus.slice(-600)}`);
    }

    // 4. Texte
    const t = pruefeTexte(texteDesSpiels(join(cwd, L.spielordner)), { klasse: L.klasse ?? 2 });
    rot.push(...t.rot);
    hinweise.push(...t.hinweise);

    // 5. Filmstreifen je Stufe (ohne Stufen: einer)
    for (const s of stufen.length ? stufen : [null]) {
      const ziel = join(ordner, "film", s ?? "spiel");
      const r = await lauf("node", ["werkzeuge/spielbau/filmstreifen.mjs", seite, "--aus", ziel, ...(s ? ["--stufe", s] : [])], { cwd, frist: 240000 });
      const tj = join(ziel, "takt.json");
      if (!existsSync(tj)) { rot.push(`Filmstreifen ${s ?? ""}: lief nicht – ${r.aus.slice(-400)}`); continue; }
      takt[s ?? "spiel"] = JSON.parse(readFileSync(tj, "utf8"));
      const b = taktBefunde(takt[s ?? "spiel"], s ?? "spiel");
      rot.push(...b.rot);
      hinweise.push(...b.hinweise);
    }
  }

  const ergebnis = { gruen: rot.length === 0, runde, rot, hinweise, takt, stufen, ordner };
  writeFileSync(join(ordner, "pruefstand.json"), JSON.stringify(ergebnis, null, 1));
  console.log(JSON.stringify({ ...ergebnis, rot: rot.slice(0, 25), hinweise: hinweise.slice(0, 15), mehr: Math.max(0, rot.length - 25) }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main().catch((e) => { console.error(e.stack ?? e); process.exit(2); });
