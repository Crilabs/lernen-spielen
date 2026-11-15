import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ladeAuftraege, neuerAuftrag, speichereAuftraege } from "../werkzeuge/verwaltung/auftraege.mjs";
import { anhalten, arbeiteAb, gibSperreFrei, nimmSperre, pfade, sperre, transkriptPfad } from "../werkzeuge/verwaltung/lauf.mjs";

const ordner = () => mkdtempSync(join(tmpdir(), "lauf-"));
const auftrag = (art, ziel) => neuerAuftrag({ art, ziel }, new Date());
const mitAuftraegen = (o, l) => { speichereAuftraege(pfade(o).auftraege, l); return l; };
/** Fake-Lauf: schreibt das Ergebnis, das je Befehl vorgegeben ist (undefined = keine Datei). */
const fake = (o, ergebnisJeBefehl, protokoll = []) => async ({ befehl, auftragId }) => {
  protokoll.push(befehl);
  const e = ergebnisJeBefehl[befehl];
  if (e === "wirft") throw new Error("kaputt");
  if (e) { mkdirSync(join(o, "ergebnisse"), { recursive: true }); writeFileSync(pfade(o).ergebnis(auftragId), JSON.stringify(e)); }
  return 0;
};

test("arbeiteAb: zwei Aufträge nacheinander, Status aus den Ergebnissen, Sperre danach frei", async () => {
  const o = ordner();
  const [x, y] = mitAuftraegen(o, [auftrag("frei", "eins"), auftrag("frei", "zwei")]);
  const reihe = [];
  await arbeiteAb({ ordner: o, wurzel: o, starte: fake(o, { eins: { status: "erledigt" }, zwei: { status: "geparkt" } }, reihe) });
  assert.deepEqual(reihe, ["eins", "zwei"]);
  const l = ladeAuftraege(pfade(o).auftraege);
  assert.deepEqual(l.map((a) => a.status), ["erledigt", "wartet-auf-christian"]);
  assert.ok(l[0].gestartet && l[0].beendet);
  assert.deepEqual(l[1].ergebnis, { status: "geparkt" });
  assert.equal(sperre(o), null);
  rmSync(o, { recursive: true });
});

test("arbeiteAb: ohne Ergebnisdatei oder bei Fehler fehlgeschlagen, Sperre frei", async () => {
  const o = ordner();
  mitAuftraegen(o, [auftrag("frei", "leer"), auftrag("frei", "wirft")]);
  await arbeiteAb({ ordner: o, wurzel: o, starte: fake(o, { wirft: "wirft" }) });
  assert.deepEqual(ladeAuftraege(pfade(o).auftraege).map((a) => a.status), ["fehlgeschlagen", "fehlgeschlagen"]);
  assert.equal(sperre(o), null);
  rmSync(o, { recursive: true });
});

test("arbeiteAb: läuft schon → wirft, nichts gestartet", async () => {
  const o = ordner();
  mitAuftraegen(o, [auftrag("frei", "eins")]);
  assert.ok(nimmSperre(o, { pid: process.pid, wer: "seite" }));
  const reihe = [];
  await assert.rejects(arbeiteAb({ ordner: o, wurzel: o, starte: fake(o, {}, reihe) }), /läuft schon/);
  assert.deepEqual(reihe, []);
  rmSync(o, { recursive: true });
});

test("Sperre: toter Prozess gilt als frei, Chat-Sperre hält, alte Chat-Sperre nicht", () => {
  const o = ordner();
  writeFileSync(pfade(o).sperre, JSON.stringify({ pid: 999999, wer: "seite", seit: new Date().toISOString() }));
  assert.equal(sperre(o), null);
  assert.ok(nimmSperre(o, { pid: null, wer: "chat" }));
  assert.equal(sperre(o)?.wer, "chat");
  assert.equal(nimmSperre(o, { pid: process.pid, wer: "seite" }), false);
  writeFileSync(pfade(o).sperre, JSON.stringify({ pid: null, wer: "chat", seit: "2026-01-01T00:00:00Z" }));
  assert.equal(sperre(o), null);
  gibSperreFrei(o);
  assert.equal(existsSync(pfade(o).sperre), false);
  rmSync(o, { recursive: true });
});

test("anhalten: nach dem aktuellen Auftrag ist Schluss, Marke danach weg", async () => {
  const o = ordner();
  mitAuftraegen(o, [auftrag("frei", "eins"), auftrag("frei", "zwei")]);
  const starte = async (p) => { anhalten(o); return fake(o, { eins: { status: "erledigt" } })(p); };
  await arbeiteAb({ ordner: o, wurzel: o, starte });
  assert.deepEqual(ladeAuftraege(pfade(o).auftraege).map((a) => a.status), ["erledigt", "wartet"]);
  assert.equal(existsSync(pfade(o).anhalten), false);
  rmSync(o, { recursive: true });
});

test("arbeiteAb: Folge-Auftrag steht direkt hinter dem Spiel; Änderungen während des Laufs bleiben", async () => {
  const o = ordner();
  mitAuftraegen(o, [auftrag("spiel", "M15"), auftrag("frei", "danach")]);
  const starte = async (p) => {
    if (p.befehl === "Spiel entwickeln M15") {
      const l = ladeAuftraege(pfade(o).auftraege);
      speichereAuftraege(pfade(o).auftraege, [...l, auftrag("frei", "neu-waehrend")]);
    }
    return fake(o, { "Spiel entwickeln M15": { status: "gruen" } })(p);
  };
  const folge = (a) => (a.ziel === "M15" ? auftrag("echte-dinge", ["t1", "t2"]) : null);
  const reihe = [];
  await arbeiteAb({ ordner: o, wurzel: o, starte: async (p) => { reihe.push(p.befehl); return starte(p); }, folge });
  assert.deepEqual(reihe, ["Spiel entwickeln M15", "Mit echten Dingen t1 t2", "danach", "neu-waehrend"]);
  rmSync(o, { recursive: true });
});

test("transkriptPfad: Projektordner wie Claude Code ihn benennt", () => {
  assert.equal(
    transkriptPfad("/Users/christian/Code/einhorn-lernspiele", "abc", "/home"),
    join("/home", ".claude", "projects", "-Users-christian-Code-einhorn-lernspiele", "abc.jsonl"), // Trenner des Systems (Release baut auf Windows)
  );
});

test("laufUmgebung: Auftrag, Transkript und eine Git-Umgebung, in der kein Push ankommt", async () => {
  const { laufUmgebung } = await import("../werkzeuge/verwaltung/lauf.mjs");
  const env = laufUmgebung({ PATH: "/bin" }, "a-1-x", "/t.jsonl");
  assert.equal(env.VERWALTUNG_AUFTRAG, "a-1-x");
  assert.equal(env.VERWALTUNG_TRANSKRIPT, "/t.jsonl");
  assert.equal(env.PATH, "/bin");
  assert.equal(env.GIT_CONFIG_COUNT, "1");
  assert.equal(env.GIT_CONFIG_KEY_0, "url.kein-push:///.pushInsteadOf");
  assert.equal(env.GIT_CONFIG_VALUE_0, "");
  assert.equal(env.GIT_TERMINAL_PROMPT, "0");
  assert.equal(env.GIT_SSH_COMMAND, "false");
  // spiel-entwickeln wartet auf einen Workflow im Hintergrund; ohne das bricht claude -p ihn nach 10 Minuten ab
  assert.equal(env.CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS, "0");
});

test("arbeiteAb: liegengebliebene laufende Aufträge eines toten Laufs werden fehlgeschlagen", async () => {
  const o = ordner();
  const alt = { ...auftrag("frei", "alt"), status: "laeuft" };
  mitAuftraegen(o, [alt, auftrag("frei", "neu")]);
  await arbeiteAb({ ordner: o, wurzel: o, starte: fake(o, { neu: { status: "erledigt" } }) });
  const l = ladeAuftraege(pfade(o).auftraege);
  assert.deepEqual(l.map((a) => a.status), ["fehlgeschlagen", "erledigt"]);
  assert.match(l[0].notiz, /abgebrochen/);
  rmSync(o, { recursive: true });
});

test("meldeFertig: setzt den Status, gibt nur eine Chat-Sperre frei", async () => {
  const { meldeFertig } = await import("../werkzeuge/verwaltung/lauf.mjs");
  const o = ordner();
  const [x] = mitAuftraegen(o, [{ ...auftrag("frei", "x"), status: "laeuft" }]);
  assert.ok(nimmSperre(o, { pid: process.pid, wer: "seite" }));
  meldeFertig(o, x.id, "erledigt");
  assert.equal(ladeAuftraege(pfade(o).auftraege)[0].status, "erledigt");
  assert.equal(sperre(o)?.wer, "seite");
  gibSperreFrei(o);
  assert.ok(nimmSperre(o, { pid: null, wer: "chat" }));
  meldeFertig(o, x.id, "erledigt");
  assert.equal(sperre(o), null);
  assert.throws(() => meldeFertig(o, "a-0-nix", "erledigt"), /nicht gefunden/);
  rmSync(o, { recursive: true });
});

test("letzterLaufFehler: Fehlerzeile aus lauf.log, sonst null", async () => {
  const { letzterLaufFehler } = await import("../werkzeuge/verwaltung/lauf.mjs");
  const o = ordner();
  assert.equal(letzterLaufFehler(o), null);
  mkdirSync(join(o, "protokolle"));
  writeFileSync(join(o, "protokolle", "lauf.log"), "Start\nFehler: Es läuft schon ein Lauf (Sperre .lauf.lock).\n");
  assert.equal(letzterLaufFehler(o), "Es läuft schon ein Lauf (Sperre .lauf.lock).");
  writeFileSync(join(o, "protokolle", "lauf.log"), "Start\n");
  assert.equal(letzterLaufFehler(o), null);
  rmSync(o, { recursive: true });
});
