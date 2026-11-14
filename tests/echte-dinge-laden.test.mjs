// ladeAnleitung holt die Datei über das Verzeichnis: bei einer Familie (themen:) die gemeinsame Datei, ohne Eintrag
// <fach>/<thema>.md (spiele/rahmen/echte-dinge.js, docs/mit-echten-dingen.md).
import { test } from "node:test";
import assert from "node:assert/strict";

const geholt = [];
const ANLEITUNG = "---\nthemen:\n  - zerlegen-4\n  - zerlegen-5\nfach: mathe\n---\n# Zerlegen\n\n## Am Tisch: Teller\n\nIhr braucht: Teller\n";
globalThis.fetch = async (url) => {
  const pfad = String(url).split("/mit-echten-dingen/")[1];
  geholt.push(pfad);
  if (pfad === "verzeichnis.json") {
    return { ok: true, json: async () => ({ themen: {
      "zerlegen-4": { fach: "mathe", datei: "mathe/zerlegen.md" },
      "zerlegen-5": { fach: "mathe", datei: "mathe/zerlegen.md" },
    } }) };
  }
  return { ok: true, text: async () => ANLEITUNG };
};
const { ladeAnleitung } = await import("../spiele/rahmen/echte-dinge.js");

test("Familie: jedes Thema lädt die gemeinsame Datei, einmal gemerkt", async () => {
  const a = await ladeAnleitung("mathe", "zerlegen-4");
  const b = await ladeAnleitung("mathe", "zerlegen-5");
  assert.equal(a?.titel, "Zerlegen");
  assert.equal(a, b, "dieselbe Anleitung (gemerkt je Pfad)");
  assert.deepEqual(geholt.filter((p) => p.endsWith(".md")), ["mathe/zerlegen.md"]);
});

test("ohne Eintrag im Verzeichnis: <fach>/<thema>.md", async () => {
  await ladeAnleitung("lesen", "silben-klatschen");
  assert.ok(geholt.includes("lesen/silben-klatschen.md"));
});

test("anderes Fach als im Verzeichnis: nicht die Datei der Familie", async () => {
  await ladeAnleitung("lesen", "zerlegen-4");
  assert.ok(geholt.includes("lesen/zerlegen-4.md"));
});
