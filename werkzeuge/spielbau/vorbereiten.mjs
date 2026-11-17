#!/usr/bin/env node
// Vorbereiten eines Spielbaus (docs/spielbau.md, Ablauf): Worktree, Bauheft, Arbeitsablage, lauf.json – ohne
// Sprachmodell. Gibt lauf.json als letzte Zeile aus; die Steuerung reicht sie an die Agenten weiter.
//
//   node werkzeuge/spielbau/vorbereiten.mjs <Katalog-Id> [--basis <branch>] [--zweig <branch>] [--vorgabe <datei>]
//
// --basis: Ausgangsstand (Vorgabe main). Alles außer main ist ein Probelauf: es wird nie gemergt.
// --zweig: Name des Branches (Vorgabe spiel-<id>), z. B. für einen Neubau eines schon gemergten Spiels.
// --vorgabe: Christians Spielidee (Verwaltung „Ideen“); steht im Bauheft vor den Regeln und in lauf.json.
// Gibt es Worktree oder Branch schon, wird er weiterverwendet (Wiederaufnahme); nur das Bauheft wird neu erzeugt.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { FAECHER, bauheft, hauptthemen, katalogEintrag, ordnername } from "./bauheft.mjs";

const git = (args, cwd) => execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

function argument(argv, name, vorgabe) {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : vorgabe;
}

/** Vorgabe des Laufs: die neue aus --vorgabe, sonst die aus lauf.json (Wiederaufnahme), sonst keine. */
export const laufVorgabe = (neu, alt = {}) => neu ?? alt.vorgabe ?? null;

async function main() {
  const argv = process.argv.slice(2);
  const id = argv.find((a) => !a.startsWith("--") && !["--basis", "--zweig", "--vorgabe"].includes(argv[argv.indexOf(a) - 1]))?.toUpperCase();
  if (!id) throw new Error("Aufruf: node werkzeuge/spielbau/vorbereiten.mjs <Katalog-Id> [--basis <branch>] [--zweig <branch>]");
  const basis = argument(argv, "--basis", "main");
  const zweig = argument(argv, "--zweig", `spiel-${id.toLowerCase()}`);
  const vorgabePfad = argument(argv, "--vorgabe", null);
  if (vorgabePfad && !existsSync(resolve(vorgabePfad))) throw new Error(`Vorgabe ${vorgabePfad} nicht gefunden`);
  const neueVorgabe = vorgabePfad ? readFileSync(resolve(vorgabePfad), "utf8") : null;
  const haupt = dirname(resolve(git(["rev-parse", "--path-format=absolute", "--git-common-dir"], process.cwd())));
  const eintrag = katalogEintrag(id, haupt) ?? katalogEintrag(id);
  if (!eintrag) throw new Error(`Katalog-Id ${id} nicht gefunden`);
  const fach = FAECHER[id[0]];
  const ordner = ordnername(id, eintrag.name);
  const worktree = join(haupt, ".worktrees", zweig);
  const ablage = join(haupt, ".superpowers/spiele", zweig);

  let neu = false;
  if (!existsSync(worktree)) {
    const gibtEs = git(["branch", "--list", zweig], haupt) !== "";
    git(gibtEs ? ["worktree", "add", worktree, zweig] : ["worktree", "add", worktree, "-b", zweig, basis], haupt);
    neu = !gibtEs;
  }
  if (!existsSync(join(worktree, "werkzeuge/spielbau/bauheft.mjs")))
    throw new Error(`${worktree}: der Stand hat den Spielbau nicht (werkzeuge/spielbau/). Basis prüfen.`);
  if (!existsSync(join(worktree, "node_modules"))) execFileSync("npm", ["ci", "--silent"], { cwd: worktree, stdio: "ignore" });
  if (existsSync(join(haupt, ".env")) && !existsSync(join(worktree, ".env"))) symlinkSync(join(haupt, ".env"), join(worktree, ".env"));
  mkdirSync(ablage, { recursive: true });

  const laufDatei = join(ablage, "lauf.json");
  const alt = existsSync(laufDatei) ? JSON.parse(readFileSync(laufDatei, "utf8")) : {};
  const vorgabe = laufVorgabe(neueVorgabe, alt);

  // Bauheft aus dem Stand des Worktrees (dort gelten die Regeln dieses Laufs)
  const heft = await bauheft(id, worktree, { vorgabe });
  writeFileSync(join(ablage, "bauheft.md"), heft);
  const plan = JSON.parse(readFileSync(join(worktree, "spiele/lernplan.json"), "utf8"));
  const klassen = hauptthemen(eintrag.text).map((t) => plan.themen.find((x) => x.id === t)?.klasse).filter(Boolean);

  const lauf = {
    id, name: eintrag.name, fach, ordner, katalog: eintrag.datei,
    spielordner: `spiele/${fach}/${ordner}`, seite: `spiele/${fach}/${ordner}/index.html`, idee: `docs/spiele/${fach}/${ordner}.md`,
    worktree, ablage, bauheft: join(ablage, "bauheft.md"), branch: zweig, basis, probelauf: basis !== "main",
    klasse: klassen.length ? Math.min(...klassen) : 2, hauptrepo: haupt,
    kostenVorher: alt.kostenVorher ?? (existsSync(join(worktree, "spiele", fach, ordner, "kosten.json"))
      ? JSON.parse(readFileSync(join(worktree, "spiele", fach, ordner, "kosten.json"), "utf8")).length : 0),
    start: alt.start ?? new Date().toISOString(), wiederaufnahme: !neu && !!alt.start, vorgabe,
  };
  writeFileSync(laufDatei, JSON.stringify(lauf, null, 1));
  console.log(`Bauheft ${heft.length} Zeichen · Worktree ${worktree} · Ablage ${ablage}${lauf.wiederaufnahme ? " · Wiederaufnahme" : ""}`);
  console.log(JSON.stringify(lauf));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((e) => { console.error(e.message); process.exit(1); });
}
