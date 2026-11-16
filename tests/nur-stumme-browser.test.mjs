import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { gesperrt } from "../.claude/hooks/nur-stumme-browser.mjs";
import { leseAufruf } from "../werkzeuge/spielbau/bildschirm.mjs";

const HOOK = new URL("../.claude/hooks/nur-stumme-browser.mjs", import.meta.url).pathname;

test("gesperrt: eigene Browserstarts in Bash, Write, Edit, MultiEdit", () => {
  // So schrieben es die Bau-Agenten (Transkripte G01, G09, M08).
  const skript = 'const { chromium } = require("playwright");\nconst b = await chromium.launch(); const p = await b.newPage();';
  assert.ok(gesperrt({ tool_name: "Bash", tool_input: { command: `node -e '${skript}'` } }));
  assert.ok(gesperrt({ tool_name: "Bash", tool_input: { command: "cat > /tmp/s.mjs <<'E'\nconst b = await webkit.launch({});\nE" } }));
  assert.ok(gesperrt({ tool_name: "Write", tool_input: { file_path: "/tmp/g01/shot.mjs", content: skript } }));
  assert.ok(gesperrt({ tool_name: "Edit", tool_input: { file_path: "/x/a.mjs", new_string: "await firefox.launchPersistentContext(d)" } }));
  assert.ok(gesperrt({ tool_name: "MultiEdit", tool_input: { file_path: "/x/a.mjs", edits: [{ new_string: "x" }, { new_string: "chromium . launch (" }] } }));
});

test("erlaubt: starteStumm, stumm.mjs selbst, Lesen, Suchen und andere Werkzeuge", () => {
  assert.ok(!gesperrt({ tool_name: "Write", tool_input: { file_path: "/w/s.mjs", content: "const b = await starteStumm(chromium, {});" } }));
  assert.ok(!gesperrt({ tool_name: "Edit", tool_input: { file_path: "/repo/tests/browser/stumm.mjs", new_string: "await typ.launch(o)" } }));
  assert.ok(!gesperrt({ tool_name: "Write", tool_input: { file_path: "/repo/.worktrees/x/tests/browser/stumm.mjs", content: "chromium.launch(" } }));
  assert.ok(!gesperrt({ tool_name: "Bash", tool_input: { command: "grep -rn 'chromium\\.launch' tests" } }));
  assert.ok(!gesperrt({ tool_name: "Bash", tool_input: { command: "node werkzeuge/spielbau/bildschirm.mjs spiele/x/index.html /tmp/a.png" } }));
  assert.ok(!gesperrt({ tool_name: "Read", tool_input: { file_path: "/x/a.mjs" } }));
  assert.ok(!gesperrt({}));
});

test("Hook als Prozess: Exit 2 mit Hinweis auf bildschirm.mjs, sonst Exit 0", () => {
  const lauf = (eingabe) => spawnSync(process.execPath, [HOOK], { input: JSON.stringify(eingabe), encoding: "utf8" });
  const nein = lauf({ tool_name: "Bash", tool_input: { command: "node -e 'chromium.launch()'" } });
  assert.equal(nein.status, 2);
  assert.match(nein.stderr, /bildschirm\.mjs/);
  assert.match(nein.stderr, /starteStumm/);
  assert.equal(lauf({ tool_name: "Bash", tool_input: { command: "ls" } }).status, 0);
  assert.equal(spawnSync(process.execPath, [HOOK], { input: "kein json", encoding: "utf8" }).status, 0);
});

test("Repo: kein Browserstart außerhalb von stumm.mjs", () => {
  const LAUT = /\b(chromium|webkit|firefox)\s*\.\s*(launch|launchPersistentContext|launchServer)\s*\(/;
  const funde = [];
  const geh = (ordner) => {
    for (const e of readdirSync(ordner, { withFileTypes: true })) {
      const p = join(ordner, e.name);
      if (e.isDirectory()) { if (!["node_modules", ".git", ".worktrees", ".superpowers"].includes(e.name)) geh(p); continue; }
      if (!/\.(m?js|cjs)$/.test(e.name) || p.endsWith(join("tests", "browser", "stumm.mjs"))) continue;
      if (p.endsWith(join(".claude", "hooks", "nur-stumme-browser.mjs")) || p.endsWith("nur-stumme-browser.test.mjs")) continue;
      if (LAUT.test(readFileSync(p, "utf8"))) funde.push(p);
    }
  };
  for (const o of ["tests", "werkzeuge", "spiele", ".claude"]) geh(new URL(`../${o}`, import.meta.url).pathname);
  assert.deepEqual(funde, []);
});

test("bildschirm.mjs: Aufruf lesen", () => {
  assert.deepEqual(leseAufruf(["s.html", "b.png", "--groesse", "1024x768", "--browser", "webkit", "--bis-aufgabe"]),
    { seite: "s.html", bild: "b.png", breite: 1024, hoehe: 768, warteMs: 1500, browser: "webkit", stufe: null, bisAufgabe: true, ganz: false });
  assert.throws(() => leseAufruf(["s.html"]), /Aufruf/);
  assert.throws(() => leseAufruf(["s.html", "b.png", "--browser", "firefox"]), /chromium oder webkit/);
  assert.throws(() => leseAufruf(["s.html", "b.png", "--groesse", "gross"]), /BxH/);
});
