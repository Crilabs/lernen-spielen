// Titelbild der Sachbücher (Spec 2026-11-16-inhaltsverzeichnis, Skill sachgeschichte §4a): jedes Buch mit Kapiteln
// trägt ein von der KI gewähltes Titelbild { bild, fokus }; das Bild liegt im Buch-Ordner und ist keine Frage-Seite.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const ORDNER = "spiele/geschichten";
const buecher = readdirSync(ORDNER, { withFileTypes: true }).filter((d) => d.isDirectory())
  .map((d) => ({ id: d.name, g: JSON.parse(readFileSync(join(ORDNER, d.name, "geschichte.json"), "utf8")) }))
  .filter(({ g }) => Array.isArray(g.kapitel) && g.kapitel.length);

test("es gibt Sachbücher mit Kapiteln", () => assert.ok(buecher.length >= 1));

for (const { id, g } of buecher) {
  test(`${id}: Titelbild { bild, fokus } aus dem Buch`, () => {
    const t = g.titelbild;
    assert.ok(t && typeof t === "object", "titelbild fehlt");
    assert.match(t.bild, /^bilder\/[\w-]+\.webp$/);
    assert.ok(existsSync(join(ORDNER, id, t.bild)), `${t.bild} fehlt`);
    assert.match(t.fokus, /^\d{1,3}% \d{1,3}%$/);
    const seite = g.kapitel.flatMap((k) => k.seiten).find((s) => s.bild === t.bild);
    assert.ok(seite, "Titelbild ist kein Foto einer Seite");
    assert.notEqual(seite.frage, true, "Frage-Seite als Titelbild verrät die Antwort");
  });
}
