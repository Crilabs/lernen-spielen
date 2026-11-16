import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { schliesseProbeAb } from "../werkzeuge/verwaltung/proben.mjs";

const git = (cwd, ...a) => execFileSync("git", a, { cwd, encoding: "utf8" }).trim();

function repo() {
  const w = mkdtempSync(join(tmpdir(), "proben-"));
  mkdirSync(join(w, "docs/spielkatalog"), { recursive: true });
  mkdirSync(join(w, "spiele"), { recursive: true });
  writeFileSync(join(w, "docs/spielkatalog/mathe.md"), "# Mathe\n\n### M99 Testspiel\n\nText\n");
  writeFileSync(join(w, "spiele/spiele.json"), '{\n  "spiele": [\n    { "id": "test", "probe": true, "titel": "Test", "datei": "mathe/m99-testspiel/index.html" }\n  ]\n}\n');
  git(w, "init", "-q", "-b", "main");
  git(w, "-c", "user.name=t", "-c", "user.email=t@t", "add", "-A");
  git(w, "-c", "user.name=t", "-c", "user.email=t@t", "commit", "-qm", "start");
  return w;
}

test("schliesseProbeAb: nimmt probe heraus und committet nur spiele.json", () => {
  const w = repo();
  try {
    writeFileSync(join(w, "fremd.txt"), "nicht mitnehmen");
    const r = schliesseProbeAb(w, "M99", { umgebung: { GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@t", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t" } });
    assert.match(r.commit, /^[0-9a-f]{7}$/);
    assert.ok(!readFileSync(join(w, "spiele/spiele.json"), "utf8").includes('"probe"'));
    assert.match(git(w, "log", "-1", "--format=%s"), /^chore\(m99-testspiel\): Probe beendet, gilt als fertig$/);
    assert.equal(git(w, "status", "--porcelain"), "?? fremd.txt");
  } finally { rmSync(w, { recursive: true }); }
});

test("schliesseProbeAb: lehnt ab, wenn spiele.json schon geändert ist oder kein Probe-Spiel", () => {
  const w = repo();
  try {
    assert.throws(() => schliesseProbeAb(w, "M98"), /nicht gefunden/);
    writeFileSync(join(w, "spiele/spiele.json"), readFileSync(join(w, "spiele/spiele.json"), "utf8") + " ");
    assert.throws(() => schliesseProbeAb(w, "M99"), /ungespeicherte Änderungen/);
    git(w, "checkout", "spiele/spiele.json");
    git(w, "checkout", "-qb", "andere");
    assert.throws(() => schliesseProbeAb(w, "M99"), /nicht auf main/);
  } finally { rmSync(w, { recursive: true }); }
});

test("schliesseProbeAb: Spiel ohne Probe → Fehler", () => {
  const w = repo();
  try {
    const u = { GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@t", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t" };
    schliesseProbeAb(w, "M99", { umgebung: u });
    assert.throws(() => schliesseProbeAb(w, "M99", { umgebung: u }), /ist keine Probe/);
  } finally { rmSync(w, { recursive: true }); }
});
