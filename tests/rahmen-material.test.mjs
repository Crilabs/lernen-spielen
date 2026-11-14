import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const { materialFuer, WORTART } = await import("../spiele/rahmen/material.js");
const t = (id, extra = {}) => ({ id, name: id, strang: "mathe", art: null, zahl: null, ...extra });

test("Zerlegung mit Zahl 1 bis 10 → Perlenstab dieser Zahl", () => {
  assert.deepEqual(materialFuer(t("zerlegen-7", { name: "Die 7 zerlegen", art: "zerlegung", zahl: 7 })), { baustein: "perlenstab", wert: 7 });
  assert.deepEqual(materialFuer(t("zerlegen-10", { art: "zerlegung", zahl: 10 })), { baustein: "perlenstab", wert: 10 });
});

test("rechnen, zwillinge, menge: Perlenstab, wenn eine Zahl 1 bis 10 im Thema steht", () => {
  assert.deepEqual(materialFuer(t("rechnen-8", { art: "rechnen", zahl: 8 })), { baustein: "perlenstab", wert: 8 });
  assert.deepEqual(materialFuer(t("mengen-5", { art: "menge", zahl: 5 })), { baustein: "perlenstab", wert: 5 });
});

test("rechnen ohne Zahl oder mit Zahl über 10 → Karte (Fachsymbol bleibt der Ansicht überlassen)", () => {
  assert.deepEqual(materialFuer(t("zwillinge", { name: "Zwillingsaufgaben", art: "zwillinge" })), { baustein: "karte", wert: "Z" });
  assert.deepEqual(materialFuer(t("plus-zur-20", { name: "Plus bis zur 20", art: "rechnen", zahl: 20 })), { baustein: "karte", wert: "20" });
  assert.deepEqual(materialFuer(t("z", { art: "zerlegung", zahl: 0, name: "Null" })), { baustein: "karte", wert: "N" });
});

test("Wortarten: nur Themen der Liste, mit den echten Ids", () => {
  const g = (id) => t(id, { strang: "grammatik" });
  const w = (id) => materialFuer(g(id));
  assert.deepEqual(w("namenwoerter"), { baustein: "wortart", wert: "nomen" });
  assert.deepEqual(w("nomen-proben"), { baustein: "wortart", wert: "nomen" });
  assert.deepEqual(w("tunwoerter"), { baustein: "wortart", wert: "verb" });
  assert.deepEqual(w("wiewoerter"), { baustein: "wortart", wert: "adjektiv" });
  assert.deepEqual(w("der-die-das"), { baustein: "wortart", wert: "artikel" });
  assert.deepEqual(w("bestimmter-unbestimmter-begleiter"), { baustein: "wortart", wert: "artikel" });
});

test("echte Ids ohne Wortart-Ziel → Karte", () => {
  for (const id of ["personalpronomen", "nomen-gross-artikelprobe", "nomen-genauer-machen", "verlaengern-nomen-d-t", "verlaengern-verben",
    "grundform-verb", "adjektive-steigern", "artikel-im-fall", "verben-als-nomen", "pronomen-statt-nomen"]) {
    assert.equal(materialFuer(t(id, { strang: "grammatik", bereich: "Nomen", name: "Xyz" })).baustein, "karte", id);
  }
});

test("jede Id der Liste gibt es im echten Lernplan (Fach grammatik)", () => {
  const plan = JSON.parse(readFileSync(new URL("../spiele/lernplan.json", import.meta.url), "utf8"));
  for (const id of Object.keys(WORTART)) {
    assert.equal(plan.themen.find((x) => x.id === id)?.strang, "grammatik", id);
  }
});

test("alles andere → Karte mit Ziffer oder erstem Buchstaben", () => {
  assert.deepEqual(materialFuer(t("subjekt", { strang: "grammatik", name: "Das Subjekt", bereich: "Satzglieder" })), { baustein: "karte", wert: "D" });
  assert.deepEqual(materialFuer(t("x", { name: "Plus bis 30" })), { baustein: "karte", wert: "30" });
  assert.deepEqual(materialFuer(t("anlaut", { name: "„Sch“ hören" })), { baustein: "karte", wert: "S" });
  assert.deepEqual(materialFuer(t("leer", { name: "" })), { baustein: "karte", wert: "?" });
});
