// Betrieb: Env-Datei lesen (Dienst und Probebrief), Probebrief nur an die eine Adresse von der Befehlszeile,
// Beispiel-Topf ergibt den Brief der Spec. Kein Netzaufruf.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setzeBrief } from "../spiele/tagesbrief/brief.js";
import { graphSenderAusDatei, liesEnv } from "../dienste/tagesbrief/zugang.js";
import { probeAdresse, probeTopf } from "../dienste/tagesbrief/probe.js";

test("liesEnv: Zeilen, Anführungszeichen, Kommentare und Leerzeilen", () => {
  const env = liesEnv('# Kommentar\nGRAPH_TENANT_ID=abc\n\nGRAPH_ABSENDER = "a@b.de"\n#GRAPH_CLIENT_ID=x\nGRAPH_ZERTIFIKAT=\'/etc/x.crt\'\n');
  assert.deepEqual(env, { GRAPH_TENANT_ID: "abc", GRAPH_ABSENDER: "a@b.de", GRAPH_ZERTIFIKAT: "/etc/x.crt" });
});

test("graphSenderAusDatei nennt den fehlenden Schlüssel", () => {
  const datei = join(mkdtempSync(join(tmpdir(), "zugang-")), "graph.env");
  writeFileSync(datei, "GRAPH_TENANT_ID=t\nGRAPH_CLIENT_ID=c\n");
  assert.throws(() => graphSenderAusDatei(datei), /GRAPH_ABSENDER fehlt/);
});

test("probeAdresse: genau eine Adresse, sonst nichts", () => {
  assert.equal(probeAdresse(["cri@crilabs.de"]), "cri@crilabs.de");
  for (const a of [[], ["cri@crilabs.de", "x@y.de"], ["kein-at"], ["a@b"], [" a@b.de"]]) assert.equal(probeAdresse(a), null, JSON.stringify(a));
});

test("Beispiel-Topf ergibt den Brief der Spec mit Foto", () => {
  const brief = setzeBrief(probeTopf("QUJD"), { datum: new Date("2026-11-16T12:00:00+01:00"), abmeldeLink: "https://x/a", datenschutzLink: "https://x/d" });
  assert.ok(brief);
  assert.equal(brief.betreff, "Mila: neu gekonnt – Achterreihe");
  for (const s of ["Kernaufgaben: mal 1, 2, 5, 10", "Womit atmet ein Wal?", "Eintritt für alle", "Zehn vor, einen zurück", "cid:anleitung", "Einmaleins gemischt"]) {
    assert.ok(brief.html.includes(s), s);
  }
});
