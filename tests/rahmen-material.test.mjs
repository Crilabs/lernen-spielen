import { test } from "node:test";
import assert from "node:assert/strict";

const { materialFuer } = await import("../spiele/rahmen/material.js");
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

test("Wortarten: Nomen, Verb, Adjektiv, Artikel (Id oder Bereich im Fach Grammatik)", () => {
  const g = (id, extra) => t(id, { strang: "grammatik", ...extra });
  assert.deepEqual(materialFuer(g("nomen-proben", { name: "Nomen-Proben" })), { baustein: "wortart", wert: "nomen" });
  assert.deepEqual(materialFuer(g("namenwoerter", { name: "Nomen", bereich: "Nomen" })), { baustein: "wortart", wert: "nomen" });
  assert.deepEqual(materialFuer(g("tunwoerter", { name: "Verben", bereich: "Verben" })), { baustein: "wortart", wert: "verb" });
  assert.deepEqual(materialFuer(g("grundform-verb", { bereich: "Verben" })), { baustein: "wortart", wert: "verb" });
  assert.deepEqual(materialFuer(g("wiewoerter", { name: "Adjektive", bereich: "Adjektive" })), { baustein: "wortart", wert: "adjektiv" });
  assert.deepEqual(materialFuer(g("adjektive-steigern", { name: "Steigern" })), { baustein: "wortart", wert: "adjektiv" });
  assert.deepEqual(materialFuer(g("artikel-im-fall", { name: "Artikel im Fall" })), { baustein: "wortart", wert: "artikel" });
});

test("Wortart nur am Anfang der Id oder über den Bereich: Rechtschreibung über Nomen ist keine Wortart", () => {
  assert.equal(materialFuer(t("verlaengern-nomen-d-t", { strang: "schreiben", name: "Verlängern: d oder t?" })).baustein, "karte");
  assert.equal(materialFuer(t("verlaengern-verben", { strang: "grammatik", name: "Verlängern bei Verben", bereich: "Wortbildung" })).baustein, "karte");
  assert.equal(materialFuer(t("verben-als-nomen", { strang: "grammatik", name: "Verben als Nomen", bereich: "Wortbildung" })).baustein, "wortart");
});

test("alles andere → Karte mit Ziffer oder erstem Buchstaben", () => {
  assert.deepEqual(materialFuer(t("subjekt", { strang: "grammatik", name: "Das Subjekt", bereich: "Satzglieder" })), { baustein: "karte", wert: "D" });
  assert.deepEqual(materialFuer(t("x", { name: "Plus bis 30" })), { baustein: "karte", wert: "30" });
  assert.deepEqual(materialFuer(t("anlaut", { name: "„Sch“ hören" })), { baustein: "karte", wert: "S" });
  assert.deepEqual(materialFuer(t("leer", { name: "" })), { baustein: "karte", wert: "?" });
});
