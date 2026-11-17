// Skill „Spiel entwickeln“ und Spielbau (docs/spielbau.md): Bauheft, Textprüfung, Prüfstand-Regeln, Buchung der
// Transkripte, und dass Skill, Vorlagen und Workflow zusammenpassen (Platzhalter, Pfade, Marken, Grenzen).
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { bauheft, hauptthemen, katalogEintrag, ordnername, regeln } from "../werkzeuge/spielbau/bauheft.mjs";
import { pruefeTexte, saetzeAusCode, saetzeAusJson, texteDesSpiels, ZAHL_NACH_ARTIKEL } from "../werkzeuge/spielbau/texte.mjs";
import { GRENZEN, roteLaeufe, taktBefunde } from "../werkzeuge/spielbau/pruefstand.mjs";
import { phaseAusTranskript } from "../werkzeuge/spielbau/abschliessen.mjs";
import { CLAUDE_PHASEN } from "../werkzeuge/kosten/kosten.mjs";

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), "..");
const SKILL = join(WURZEL, ".claude/skills/spiel-entwickeln");
const WORKFLOW = readFileSync(join(WURZEL, ".claude/workflows/spiel-bauen.js"), "utf8");
const lies = (p) => readFileSync(join(WURZEL, p), "utf8");

// --- Bauheft ----------------------------------------------------------------------------------------------------

test("Bauheft: Ordnername wie in der Ablage (Umlaute, Bindestriche)", () => {
  assert.equal(ordnername("M37", "Kettenhüpfer"), "m37-kettenhuepfer");
  assert.equal(ordnername("G09", "der, die, das (Artikel)"), "g09-der-die-das-artikel");
  assert.equal(ordnername("M15", "Mach voll"), "m15-mach-voll");
});

test("Bauheft: Katalog-Eintrag und Hauptthemen aus dem Katalog", () => {
  const e = katalogEintrag("M37");
  assert.equal(e.name, "Kettenhüpfer");
  assert.equal(e.datei, "docs/spielkatalog/mathe.md");
  assert.ok(hauptthemen(e.text).includes("zweierreihe"));
  assert.equal(katalogEintrag("X99"), null);
});

test("Bauheft: enthält die Regeln, den Eintrag, die Themen und was es gibt – und bleibt klein", async () => {
  const h = await bauheft("M37");
  assert.ok(h.includes(regeln()), "Regeln fehlen");
  for (const t of ["### M37 Kettenhüpfer", "**zweierreihe**", "`<ls-perlenkette>`", "Aufgabenarten", "Es gibt dieses Spiel schon"])
    assert.ok(h.includes(t), `fehlt: ${t}`);
  assert.ok(h.length < 45000, `Bauheft ${h.length} Zeichen`);
});

test("Bauheft: jede Katalog-Id ergibt ein Heft", async () => {
  const ids = readdirSync(join(WURZEL, "docs/spielkatalog")).filter((d) => d.endsWith(".md"))
    .flatMap((d) => [...lies(`docs/spielkatalog/${d}`).matchAll(/^### ([A-Z]\d\d) /gm)].map((m) => m[1]));
  assert.ok(ids.length > 100);
  for (const id of ids) {
    const h = await bauheft(id);
    assert.ok(h.startsWith(`# Bauheft ${id} `), id);
    // docs/spielbau.md „Die Regeln bleiben klein“: höchstens 25 000 Token (etwa 3,6 Zeichen je Token)
    assert.ok(h.length / 3.6 < 25000, `${id}: etwa ${Math.round(h.length / 3.6)} Token`);
  }
});

// --- Regeln -----------------------------------------------------------------------------------------------------

test("Regeln: der Block bleibt klein – eine neue Regel nur, wenn eine alte geht (unter etwa 4 500 Token)", () => {
  assert.ok(regeln().length / 3.6 < 4500, `Regeln etwa ${Math.round(regeln().length / 3.6)} Token`);
  assert.match(regeln(), /^\*\*Vorrang:\*\* §1 Spielkern und §8/);
});

test("Probe: setzeProbe ändert nur den Eintrag selbst und lässt sich zurücknehmen", async () => {
  const { mkdtempSync, mkdirSync, writeFileSync, cpSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { setzeProbe } = await import("../werkzeuge/spielbau/freigeben.mjs");
  const tmp = mkdtempSync(join(tmpdir(), "probe-"));
  mkdirSync(join(tmp, "spiele"));
  cpSync(join(WURZEL, "docs"), join(tmp, "docs"), { recursive: true });
  const roh = lies("spiele/spiele.json");
  writeFileSync(join(tmp, "spiele/spiele.json"), roh);
  setzeProbe(tmp, "M37", true);
  const mit = readFileSync(join(tmp, "spiele/spiele.json"), "utf8");
  assert.equal(JSON.parse(mit).spiele.find((x) => x.id === "kettenhuepfer").probe, true);
  assert.equal(mit.split("\n").length, roh.split("\n").length, "Format bleibt");
  setzeProbe(tmp, "M37", false);
  assert.equal(readFileSync(join(tmp, "spiele/spiele.json"), "utf8"), roh);
});

test("Regeln: Spielkern, Textbudget, Grenzen G1–G14, Werkzeuge und Streichen stehen im Block", () => {
  const r = regeln();
  for (const t of ["§1 Der Spielkern", "§2 Herausforderung", "§3 Textbudget", "§4 Schön und flüssig", "§5 Grenzen", "§6 Werkzeuge", "§7 Streichen", "§8 Zeigen statt erklären"])
    assert.ok(r.includes(t), t);
  const nummern = [...r.matchAll(/^\| (G\d+) \|/gm)].map((m) => m[1]);
  assert.deepEqual(nummern, Array.from({ length: 14 }, (_, i) => `G${i + 1}`));
});

test("Spielprüfung: Vorlage nennt die fünf Fragen und G1–G14, der Workflow rechnet genau diese Fragen", () => {
  const p = readFileSync(join(SKILL, "pruefen.md"), "utf8");
  assert.match(p, /G1–G14/);
  for (const f of ["Zehnmal", "Kern", "Schwierigkeit", "Schön", "Ohne Transfer"]) assert.ok(p.includes(`**${f}:**`), f);
  assert.match(WORKFLOW, /\['zehnmal', 'kern', 'schwierigkeit', 'schoen', 'ohneTransfer'\]/);
});

// --- Textprüfung ------------------------------------------------------------------------------------------------

test("Texte: urteilende Wörter und Ersatznamen sind rot, Sätze ohne sie nicht", () => {
  const r = pruefeTexte(["Super, das war toll!", "Das Namenwort steht vorn.", "6 · 7 = 42.", "Kofi staunt."]);
  assert.equal(r.rot.filter((x) => x.startsWith("G1")).length, 2);
  assert.equal(r.rot.filter((x) => x.startsWith("G7")).length, 1);
  assert.equal(pruefeTexte(["6 Stäbchen sind nicht 48.", "Kofi staunt."]).rot.length, 0);
  // Teilwörter zählen nicht: „Klasse“ ist nicht in der Liste, „tolle“ ist nicht „toll“, „Fehlerbild“ steht nicht im Kindertext
  assert.equal(pruefeTexte(["Die tollkühne Katze."]).rot.length, 0);
});

test("Texte: Zahl nach Artikel wird als Ordnungszahl gesprochen und ist rot", () => {
  const rot = (t) => pruefeTexte([t]).rot.filter((x) => x.startsWith("Stimme:"));
  assert.equal(rot("Timo bringt den Brief zur Dreizehn.").length, 1);
  assert.equal(rot("Timo geht zum 45.").length, 1);
  assert.equal(rot("Das ist ZUM 7 gehörig.").length, 1);
  assert.equal(rot("Timo steht bei Nummer Dreizehn.").length, 0);
  assert.equal(rot("Die Zwei passt.").length, 0);
  assert.equal(rot("Tippe auf den Knopf neben der Null.").length, 0); // „der Null“ hat keine Ordnungszahl-Lesung
  assert.equal(rot("Das ist der Zehner.").length, 0);
  assert.equal(rot("Der Einer links, dem Zwanziger folgt.").length, 0);
  assert.ok(ZAHL_NACH_ARTIKEL.test("der Zwanzig"));
});

test("Texte: Abkürzung als Beschriftung ist nur ein Hinweis", () => {
  const h = (b) => pruefeTexte(["Kofi staunt."], { beschriftungen: b }).hinweise.filter((x) => x.startsWith("§8"));
  const r = pruefeTexte(["Kofi staunt."], { beschriftungen: ["Z"] });
  assert.equal(r.rot.length, 0);
  assert.equal(h(["Z"]).length, 1);
  assert.equal(h(["Zehner"]).length, 0);
  assert.equal(pruefeTexte(["Kofi staunt."]).hinweise.length, 0);
});

test("Texte: texteDesSpiels liest Beschriftungen aus index.html", () => {
  const dir = mkdtempSync(join(tmpdir(), "texte-"));
  writeFileSync(join(dir, "index.html"), '<div class="kopf">Z</div><div>Zehner</div><span> HE </span><p>Text</p>');
  assert.deepEqual(texteDesSpiels(dir).beschriftungen, ["Z", "HE"]);
});

test("Texte: Satzlänge nach Klasse, Budget aller festen Texte", () => {
  const lang = "Hier kommen die Dinge in Packungen und in jeder Packung sind gleich viele.";
  assert.ok(pruefeTexte([lang], { klasse: 2 }).rot.some((x) => x.startsWith("§3 Satz")));
  assert.ok(!pruefeTexte([lang], { klasse: 4 }).rot.some((x) => x.startsWith("§3 Satz")));
  const viel = Array.from({ length: 300 }, (_, i) => `Satz Nummer ${i} ist kurz.`);
  assert.ok(pruefeTexte(viel).rot.some((x) => x.includes("Zeichen")));
});

test("Texte: Sätze aus JSON (ohne Hinweise und Schlüsselwerte) und aus sage(…) im Code", () => {
  assert.deepEqual(saetzeAusJson({ hinweis: "für Entwickler", a: { b: ["Ein Satz.", "x"] }, packung: "schuhpaar" }), ["Ein Satz."]);
  assert.deepEqual(saetzeAusCode('blase.sage("Kofi staunt."); sprich(`${a} · ${b} = ${c}.`); sage(x);'), ["Kofi staunt."]);
});

// --- Prüfstand ----------------------------------------------------------------------------------------------------

test("Prüfstand: Takt nach §1 – zu lange Wirkung rot, etwas lange ein Hinweis", () => {
  assert.equal(taktBefunde({ folgeMs: 2400, reaktionMs: 40 }, "kopf").rot.length, 0);
  assert.equal(taktBefunde({ folgeMs: GRENZEN.folgeHinweis + 100 }, "kopf").hinweise.length, 1);
  assert.equal(taktBefunde({ folgeMs: GRENZEN.folgeRot + 100 }, "kopf").rot.length, 1);
  assert.equal(taktBefunde({ folgeMs: 1000, fehler: ["kein Fehlversuch gefunden"] }, "x").rot.length, 0);
});

test("Prüfstand: rote Läufe aus dem Bericht des Durchspielens", () => {
  const b = { laeufe: [{ kind: "wild", browser: "webkit", groesse: "1280x800", pruefungen: [{ name: "kein Hänger", ok: false, grund: "hängt" }, { name: "ok", ok: true }] }] };
  assert.deepEqual(roteLaeufe(b, "kopf"), ["Durchspielen kopf · wild webkit 1280x800: kein Hänger – hängt"]);
});

// --- Abschluss ----------------------------------------------------------------------------------------------------

test("Abschluss: gebucht werden nur Transkripte mit der Marke dieses Laufs", () => {
  const zeile = (text) => JSON.stringify({ type: "user", message: { role: "user", content: text } });
  assert.equal(phaseAusTranskript(zeile("[spielbau:bau M37 spiel-m37]\n\nLies …"), "M37", "spiel-m37"), "bau");
  assert.equal(phaseAusTranskript(zeile("[spielbau:bau M37 spiel-m37-neu]"), "M37", "spiel-m37"), null);
  assert.equal(phaseAusTranskript(zeile("[spielbau:idee M15 spiel-m15]"), "M37", "spiel-m37"), null);
  assert.equal(phaseAusTranskript(zeile("irgendein Auftrag"), "M37", "spiel-m37"), null);
  for (const p of ["idee", "bau", "pruefstand", "pruefung", "steuerung"]) assert.ok(CLAUDE_PHASEN.includes(p), p);
});

// --- Skill, Vorlagen, Workflow ---------------------------------------------------------------------------------

test("Skill: Kopf mit Name und Beschreibung; die drei Vorlagen liegen daneben, die alten sind weg", () => {
  const s = readFileSync(join(SKILL, "SKILL.md"), "utf8");
  const kopf = s.match(/^---\nname: (.+)\ndescription: (.+)\n---\n/);
  assert.ok(kopf, "Frontmatter fehlt");
  assert.equal(kopf[1], "spiel-entwickeln");
  assert.ok(kopf[2].length <= 1024, "Beschreibung zu lang");
  assert.deepEqual(readdirSync(SKILL).sort(), ["SKILL.md", "bauen.md", "idee.md", "pruefen.md"]);
  for (const v of ["idee.md", "bauen.md", "pruefen.md"]) assert.ok(s.includes(`\`${v}\``), `SKILL.md nennt ${v} nicht`);
});

test("Skill: jeder genannte Pfad im Repo existiert", () => {
  const fehlt = [];
  for (const d of [...readdirSync(SKILL).map((x) => join(SKILL, x)), join(WURZEL, "docs/spielbau.md")]) {
    const text = readFileSync(d, "utf8");
    for (const [, roh] of text.matchAll(/`([^`\s]+)`/g)) {
      if (!/^(docs|spiele|tests|werkzeuge|\.claude)\//.test(roh) || /[<{…*]/.test(roh)) continue;
      const pfad = roh.replace(/[?#].*$/, "").replace(/[:,.)]+$/, "");
      if (!existsSync(join(WURZEL, pfad))) fehlt.push(`${d}: ${pfad}`);
    }
  }
  assert.deepEqual(fehlt, []);
});

test("Workflow: jeder Platzhalter der Vorlagen wird gefüllt, jede Vorlage und Marke kommt vor", () => {
  const gefuellt = new Set([...WORKFLOW.matchAll(/\b([A-Z]{2,}):/g)].map((m) => m[1]));
  for (const v of ["idee.md", "bauen.md", "pruefen.md"]) {
    assert.ok(WORKFLOW.includes(`'${v}'`), `Workflow nutzt ${v} nicht`);
    for (const [, p] of readFileSync(join(SKILL, v), "utf8").matchAll(/\{\{([A-Z_]+)\}\}/g)) assert.ok(gefuellt.has(p), `${v}: {{${p}}} wird nicht gefüllt`);
  }
  for (const phase of ["idee", "bau", "pruefstand", "pruefung"]) assert.ok(WORKFLOW.includes(`'${phase}'`), phase);
  assert.match(WORKFLOW, /'\[spielbau:' \+ phase \+ ' ' \+ L\.id \+ ' ' \+ L\.branch \+ '\]'/);
  assert.match(WORKFLOW, /^export const meta = \{\n  name: 'spiel-bauen',/);
});

// --- Vorgabe von Christian (docs/superpowers/specs/2026-11-17-spielideen-design.md) -----------------------------

test("Vorgabe: steht im Bauheft vor den Regeln, ohne Vorgabe fehlt der Abschnitt", async () => {
  const mit = await bauheft("G01", WURZEL, { vorgabe: "# Vorgabe von Christian\n\nHund hüpft" });
  assert.ok(mit.indexOf("## Vorgabe von Christian") > 0 && mit.indexOf("## Vorgabe von Christian") < mit.indexOf("## Regeln"));
  assert.ok(mit.includes("Hund hüpft"));
  assert.ok(!(await bauheft("G01", WURZEL)).includes("Vorgabe von Christian"));
});

const urteil = new Function(`${WORKFLOW.match(/const FRAGEN[^\n]*\n[\s\S]*?\nfunction urteil[\s\S]*?\n}\n/)[0]}; return urteil`)();
const bericht = (nein = []) => ({
  ...Object.fromEntries(["zehnmal", "kern", "schwierigkeit", "schoen", "ohneTransfer"].map((k) => [k, { ja: !nein.includes(k), beleg: `${k}-beleg` }])),
  grenzen: [], streichen: [], befunde: [],
});

test("Vorgabe: Spielprüfung zählt nur Schwierigkeit und Ohne Transfer hart", () => {
  const u = urteil(bericht(["kern"]), true);
  assert.equal(u.gruen, true);
  assert.deepEqual(u.zurIdee, ["Zur Idee: Kern – kern-beleg"]);
  assert.equal(urteil(bericht(["kern"]), false).gruen, false);
  assert.equal(urteil(bericht(["schwierigkeit"]), true).gruen, false);
  assert.equal(urteil(bericht(["ohneTransfer"]), true).gruen, false);
  assert.deepEqual(urteil(bericht([]), false).zurIdee, []);
});

test("Vorgabe: Vorlagen und Skill kennen sie", () => {
  const idee = readFileSync(join(SKILL, "idee.md"), "utf8");
  assert.ok(idee.includes("Vorgabe von Christian") && idee.includes("Abweichungen von der Vorgabe"));
  assert.ok(readFileSync(join(SKILL, "pruefen.md"), "utf8").includes("Zur Idee:"));
  assert.ok(readFileSync(join(SKILL, "SKILL.md"), "utf8").includes("--vorgabe"));
  assert.match(WORKFLOW, /urteil\(p, !!L\.vorgabe\)/);
});

test("Vorgabe: fehlende Datei bricht vorbereiten ab, ohne Worktree", async () => {
  const { spawnSync } = await import("node:child_process");
  const r = spawnSync(process.execPath, ["werkzeuge/spielbau/vorbereiten.mjs", "G01", "--zweig", "spiel-g01-vorgabe-test", "--vorgabe", "/gibt/es/nicht.md"], { cwd: WURZEL, encoding: "utf8" });
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /Vorgabe \/gibt\/es\/nicht\.md nicht gefunden/);
  assert.ok(!existsSync(join(WURZEL, ".worktrees/spiel-g01-vorgabe-test")));
});

test("Vorgabe: Wiederaufnahme ohne --vorgabe behält die alte", async () => {
  const { laufVorgabe } = await import("../werkzeuge/spielbau/vorbereiten.mjs");
  assert.equal(laufVorgabe(null, { vorgabe: "x" }), "x");
  assert.equal(laufVorgabe("neu", { vorgabe: "x" }), "neu");
  assert.equal(laufVorgabe(null, {}), null);
});

// Review 2026-11-17: Hinweise „Zur Idee“ gehen bei Rot und über Runden nicht verloren; Vorlagen sagen „enthält“.
test("Vorgabe: Zur-Idee-Hinweise in jedem Ergebnis, Vorlagen und Bau kennen die Vorgabe", () => {
  assert.match(WORKFLOW, /zurIdeeAlle/);
  for (const m of WORKFLOW.matchAll(/return \{ status: '(geparkt|gruen|freigabe)[^\n]*/g)) assert.match(m[0], /zurIdee/, m[0]);
  for (const v of ["idee.md", "pruefen.md"]) assert.doesNotMatch(readFileSync(join(SKILL, v), "utf8"), /[Bb]eginnt das Bauheft mit/, v);
  assert.match(readFileSync(join(SKILL, "bauen.md"), "utf8"), /Vorgabe von Christian/);
  assert.match(WORKFLOW, /\/\^\\W\*zur idee\/i/);
});
