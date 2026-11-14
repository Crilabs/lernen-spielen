// Prüfserver der Browser-Prüfungen (tests/browser/server.mjs): liefert Byte-Bereiche, sonst kennt WebKit die Dauer
// einer Aufnahme nicht und meldet nie „ended“ (Probelauf M14: Lernplan-Einführung hing im Prüfstand).
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { bereich, starteServer } from "./browser/server.mjs";

test("bereich: Anfang–Ende, offenes Ende, letzte n Bytes, Unpassendes", () => {
  assert.deepEqual(bereich("bytes=0-1", 10), { start: 0, ende: 1 });
  assert.deepEqual(bereich("bytes=4-", 10), { start: 4, ende: 9 });
  assert.deepEqual(bereich("bytes=-3", 10), { start: 7, ende: 9 });
  assert.deepEqual(bereich("bytes=5-99", 10), { start: 5, ende: 9 });
  assert.equal(bereich("bytes=10-", 10), null);
  assert.equal(bereich("bytes=-", 10), null);
  assert.equal(bereich("zeilen=1-2", 10), null);
});

test("Server: 206 mit Content-Range auf Range, 200 mit Accept-Ranges ohne", async (t) => {
  const d = mkdtempSync(join(tmpdir(), "ls-server-"));
  t.after(() => rmSync(d, { recursive: true }));
  writeFileSync(join(d, "a.mp3"), Buffer.from("0123456789"));
  const s = await starteServer(d, { "/extra.html": "<p>x</p>" });
  t.after(() => s.close());
  const url = `http://127.0.0.1:${s.address().port}`;
  const teil = await fetch(url + "/a.mp3", { headers: { range: "bytes=2-4" } });
  assert.equal(teil.status, 206);
  assert.equal(teil.headers.get("content-range"), "bytes 2-4/10");
  assert.equal(await teil.text(), "234");
  const ganz = await fetch(url + "/a.mp3");
  assert.equal(ganz.status, 200);
  assert.equal(ganz.headers.get("accept-ranges"), "bytes");
  assert.equal(ganz.headers.get("content-type"), "audio/mpeg");
  assert.equal((await fetch(url + "/a.mp3", { headers: { range: "bytes=20-" } })).status, 416);
  assert.equal(await (await fetch(url + "/extra.html")).text(), "<p>x</p>");
  assert.equal((await fetch(url + "/fehlt.js")).status, 404);
});
