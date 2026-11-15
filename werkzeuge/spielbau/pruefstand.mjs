#!/usr/bin/env node
// Prüfstand des Spielbaus (docs/spielbau.md, Ablauf): alles, was eine Maschine prüfen kann, in einem Aufruf, mit
// einer kurzen JSON-Zeile als Ergebnis für die Steuerung.
//
//   NODE_PATH=/private/tmp/claude-501/pw/node_modules node werkzeuge/spielbau/pruefstand.mjs --lauf <ablage>/lauf.json --runde <n>
//     [--start | --abwarten <sekunden>]
//
// Ein ganzer Lauf dauert länger als die 10 Minuten eines Bash-Aufrufs. Darum: --start startet ihn losgelöst im
// Hintergrund und kehrt sofort zurück; --abwarten wartet höchstens so lange auf pruefstand.json und gibt dann das
// Ergebnis aus oder {"laeuft":true} – einfach wiederholen. Ohne beides läuft er direkt (für Menschen).
//
// Schritte (im Worktree des Laufs): Eintrag in spiele.json · npm test · Durchspielen (alle Kinder, Chromium und
// WebKit, beide Größen) und je Lernstufe (Chromium, 1280 × 800) · Textprüfung (texte.mjs) · Filmstreifen je Stufe
// (filmstreifen.mjs) mit Takt-Grenzen aus §1. Ergebnis: <ablage>/r<n>/pruefstand.json und als letzte Zeile auf
// stdout { gruen, rot, hinweise, takt, ordner }. Exit 0 auch bei Rot (das Urteil steht im JSON); ≠ 0 nur, wenn der
// Prüfstand selbst nicht laufen konnte.
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, openSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { pruefeTexte, texteDesSpiels } from "./texte.mjs";

const PW = "/private/tmp/claude-501/pw/node_modules";
/** Takt-Grenzen (docs/spielbau.md §1): Wirkung etwa 2,5 s, höchstens 3 s (gemessen bis zur nächsten Aufgabe, daher
 * 0,5 s Spielraum), Reaktion unter 0,3 s. */
export const GRENZEN = { folgeRot: 3500, folgeHinweis: 3000, reaktionHinweis: 300 };

// Frist je Prozess: 30 min. Eine Runde läuft bis zur Zeitgrenze der Lernsteuerung (K.RUNDE_MS, 4 min), sieben Kinder
// nacheinander brauchen so bis etwa 15 min.
function lauf(befehl, args, { cwd, frist = 1800000, env = {} } = {}) {
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
  if (t.folgeMs != null && t.folgeMs > GRENZEN.folgeRot) rot.push(`§1 Wirkung ${stufe}: ${t.folgeMs} ms vom Zug bis zur nächsten Aufgabe (etwa 2 500, höchstens 3 000; Grenze mit Spielraum ${GRENZEN.folgeRot})`);
  else if (t.folgeMs != null && t.folgeMs > GRENZEN.folgeHinweis) hinweise.push(`§1 Wirkung ${stufe}: ${t.folgeMs} ms (Ziel etwa 2 500)`);
  if (t.reaktionMs != null && t.reaktionMs > GRENZEN.reaktionHinweis) hinweise.push(`§1 erste Reaktion ${stufe}: ${t.reaktionMs} ms nach dem Zug (Ziel unter 300)`);
  return { rot, hinweise };
}

const kurz = (e) => JSON.stringify({ ...e, rot: e.rot.slice(0, 25), hinweise: e.hinweise.slice(0, 15), mehr: Math.max(0, e.rot.length - 25) });

async function main() {
  const argv = process.argv.slice(2);
  const laufDatei = argv.includes("--lauf") ? resolve(argv[argv.indexOf("--lauf") + 1]) : null;
  const runde = argv.includes("--runde") ? argv[argv.indexOf("--runde") + 1] : "1";
  if (!laufDatei || !existsSync(laufDatei)) throw new Error("Aufruf: pruefstand.mjs --lauf <ablage>/lauf.json --runde <n> [--start | --abwarten s]");
  const L = JSON.parse(readFileSync(laufDatei, "utf8"));
  const cwd = L.worktree;
  const ordner = join(L.ablage, `r${runde}`);
  const ergebnisDatei = join(ordner, "pruefstand.json");
  if (argv.includes("--start")) {
    mkdirSync(ordner, { recursive: true });
    rmSync(ergebnisDatei, { force: true });
    const log = openSync(join(ordner, "pruefstand.log"), "w");
    const p = spawn(process.execPath, [fileURLToPath(import.meta.url), "--lauf", laufDatei, "--runde", runde], { cwd, detached: true, stdio: ["ignore", log, log], env: { ...process.env, NODE_PATH: PW } });
    p.unref();
    console.log(JSON.stringify({ gestartet: true, ordner }));
    return;
  }
  if (argv.includes("--abwarten")) {
    const frist = Date.now() + 1000 * Number(argv[argv.indexOf("--abwarten") + 1] || 540);
    while (Date.now() < frist) {
      if (existsSync(ergebnisDatei)) return console.log(kurz(JSON.parse(readFileSync(ergebnisDatei, "utf8"))));
      await new Promise((r) => setTimeout(r, 5000));
    }
    return console.log(JSON.stringify({ laeuft: true, ordner }));
  }
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
      // alle Kinder in beiden Browsern und Größen – je Browser × Größe ein eigener Prozess, damit es unter 10 min bleibt
      ...[["chromium", "1920x1080"], ["chromium", "1280x800"], ["webkit", "1920x1080"], ["webkit", "1280x800"]].map(([b, g]) =>
        ds(["--browser", b, "--groessen", g], `durchspielen-${b}-${g}`).then((r) => ({ name: `durchspielen-${b}-${g}`, r }))),
      ...stufen.map((s) => ds(["--stufe", s, "--browser", "chromium", "--groessen", "1280x800"], `durchspielen-${s}`).then((r) => ({ name: `durchspielen-${s}`, r }))),
    ];
    for (const { name, r } of await Promise.all(auftraege)) {
      writeFileSync(join(ordner, `${name.replace(/ /g, "-")}.txt`), r.aus);
      if (name === "npm test") {
        if (r.code !== 0) rot.push(`G13 npm test rot: ${r.aus.split("\n").filter((z) => /not ok|error|Error|✖|fail/i.test(z)).slice(0, 8).join(" | ").slice(0, 900)}`);
        continue;
      }
      const datei = join(ordner, `${name}.json`);
      if (existsSync(datei)) rot.push(...roteLaeufe(JSON.parse(readFileSync(datei, "utf8")), name.replace(/^durchspielen-?/, "") || "alle"));
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
  writeFileSync(ergebnisDatei, JSON.stringify(ergebnis, null, 1));
  console.log(kurz(ergebnis));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main().catch((e) => { console.error(e.stack ?? e); process.exit(2); });
