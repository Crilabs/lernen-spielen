import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const { materialFuer, WORTART, BUCHSTABEN_BEREICHE, graphemVon } = await import("../spiele/rahmen/material.js");
const t = (id, extra = {}) => ({ id, name: id, strang: "mathe", art: null, zahl: null, ...extra });

test("Zerlegung mit Zahl 1 bis 10 → Perlenstab dieser Zahl", () => {
  assert.deepEqual(materialFuer(t("zerlegen-7", { name: "Die 7 zerlegen", art: "zerlegung", zahl: 7 })), { baustein: "perlenstab", wert: 7 });
  assert.deepEqual(materialFuer(t("zerlegen-10", { art: "zerlegung", zahl: 10 })), { baustein: "perlenstab", wert: 10 });
});

test("rechnen, zwillinge, menge: Perlenstab, wenn eine Zahl 1 bis 10 im Thema steht", () => {
  assert.deepEqual(materialFuer(t("rechnen-8", { art: "rechnen", zahl: 8 })), { baustein: "perlenstab", wert: 8 });
  assert.deepEqual(materialFuer(t("mengen-5", { art: "menge", zahl: 5 })), { baustein: "perlenstab", wert: 5 });
});

test("rechnen ohne Zahl oder mit Zahl über 10 → Karte mit Fachsymbol", () => {
  const fach = { baustein: "karte", wert: "", fach: "mathe" };
  assert.deepEqual(materialFuer(t("zwillinge", { name: "Zwillingsaufgaben", art: "zwillinge" })), fach);
  assert.deepEqual(materialFuer(t("plus-zur-20", { name: "Plus bis zur 20", art: "rechnen", zahl: 20 })), fach);
  assert.deepEqual(materialFuer(t("z", { art: "zerlegung", zahl: 0, name: "Null" })), fach);
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

test("alles andere → Karte mit Fachsymbol, kein zufälliger Buchstabe und keine Ziffer", () => {
  assert.deepEqual(materialFuer(t("subjekt", { strang: "grammatik", name: "Das Subjekt", bereich: "Satzglieder" })), { baustein: "karte", wert: "", fach: "grammatik" });
  assert.deepEqual(materialFuer(t("x", { name: "Plus bis 30" })), { baustein: "karte", wert: "", fach: "mathe" });
  assert.deepEqual(materialFuer(t("anlaut", { strang: "lesen", name: "„Sch“ hören", bereich: "Laute hören" })), { baustein: "karte", wert: "", fach: "lesen" });
  assert.deepEqual(materialFuer(t("leer", { name: "", strang: "sprechen" })), { baustein: "karte", wert: "", fach: "sprechen" });
});

const PLAN = JSON.parse(readFileSync(new URL("../spiele/lernplan.json", import.meta.url), "utf8"));
const echt = (id) => {
  const x = PLAN.themen.find((y) => y.id === id);
  assert.ok(x, id);
  return materialFuer({ id: x.id, name: x.name, strang: x.strang, bereich: x.bereich, art: x.aufgaben?.art ?? null, zahl: null });
};

test("Graphem-Karten: echte Themen aus Buchstaben und Laute, Buchstabengruppen, Besondere Laute schreiben", () => {
  const erwartet = {
    "laut-m": "Mm", "laut-a": "Aa", "laut-ae": "Ää", "laut-eszett": "ß", "laut-h-anfang": "Hh", "b-d-p-unterscheiden": "b d p",
    "laut-ei": "ei", "laut-sch": "sch", "laut-ch-ich": "ch", "laut-ch-ach": "ch", "laut-st-anfang": "St st", "laut-pf": "Pf pf",
    "laut-qu": "Qu qu", "laut-aeu": "äu", "ei-schreiben": "ei", "sch-schreiben": "sch", "st-am-wortanfang": "st",
    "ng-nk-schreiben": "ng nk", "r-nach-selbstlaut": "r",
  };
  for (const [id, wert] of Object.entries(erwartet)) assert.deepEqual(echt(id), { baustein: "karte", wert }, id);
});

test("Graphem-Karten: jedes Thema der drei Bereiche hat ein kurzes Graphem, außer Groß und klein zusammen (Fachsymbol)", () => {
  for (const x of PLAN.themen.filter((y) => BUCHSTABEN_BEREICHE.has(y.bereich))) {
    const m = echt(x.id);
    if (x.id === "buchstabenpaare-gross-klein") { assert.deepEqual(m, { baustein: "karte", wert: "", fach: "lesen" }); continue; }
    assert.ok(m.baustein === "karte" && m.wert && m.wert.length <= 6, `${x.id}: ${JSON.stringify(m)}`);
  }
});

test("Graphem nur in den drei Bereichen: ein Name wie „ei“ anderswo bleibt Fachsymbol", () => {
  assert.deepEqual(materialFuer(t("x", { strang: "lesen", name: "ei", bereich: "Silben" })), { baustein: "karte", wert: "", fach: "lesen" });
  assert.equal(graphemVon("Groß und klein zusammen"), "");
  assert.equal(graphemVon("Wörter mit sch"), "");
});

const { neuSeit, bausteinHtml } = await import("../spiele/rahmen/material.js");

test("neuSeit: gibt die neu gekonnten zurück, in ihrer Reihenfolge", () => {
  assert.deepEqual(neuSeit(["a", "b", "c"], ["a"]), ["b", "c"]);
  assert.deepEqual(neuSeit(["c", "a", "b"], ["a"]), ["c", "b"]);
});

test("neuSeit: nichts Neues → leer; noch nie gesehen oder kaputter Merker → nichts neu", () => {
  assert.deepEqual(neuSeit(["a", "b"], ["b", "a"]), []);
  assert.deepEqual(neuSeit([], ["a"]), []);
  assert.deepEqual(neuSeit(["a"], undefined), []);
  assert.deepEqual(neuSeit(["a"], null), []);
  assert.deepEqual(neuSeit(["a"], { a: 1 }), []);
  assert.deepEqual(neuSeit(["a", "b"], [1, null, "a"]), ["b"]);
});

test("neuSeit: ein zurückgesetztes Thema fällt aus dem Merker und ist danach wieder einmal neu", () => {
  // Besuch 1: a und b gekonnt; die Seite merkt sich genau die gekonnten.
  let gesehen = ["a", "b"];
  // b wird zurückgesetzt: nichts Neues, und b verschwindet aus dem Merker.
  let gekonnt = ["a"];
  assert.deepEqual(neuSeit(gekonnt, gesehen), []);
  gesehen = gekonnt;
  assert.deepEqual(gesehen, ["a"]);
  // b wird wieder gekonnt: einmal neu, beim nächsten Besuch nicht mehr.
  gekonnt = ["a", "b"];
  assert.deepEqual(neuSeit(gekonnt, gesehen), ["b"]);
  gesehen = gekonnt;
  assert.deepEqual(neuSeit(gekonnt, gesehen), []);
});

test("bausteinHtml: Perlenstab, Wortart, Karte (escaped)", () => {
  assert.equal(bausteinHtml({ baustein: "perlenstab", wert: 7 }), '<ls-perlenstab wert="7" aria-hidden="true"></ls-perlenstab>');
  assert.equal(bausteinHtml({ baustein: "wortart", wert: "verb" }), '<ls-wortart art="verb" aria-hidden="true"></ls-wortart>');
  assert.equal(bausteinHtml({ baustein: "karte", wert: "<Ä>" }), '<span class="karte" aria-hidden="true">&lt;Ä&gt;</span>');
  assert.match(bausteinHtml({ baustein: "karte", wert: "", fach: "mathe" }), /^<span class="karte symbol" aria-hidden="true"><i style="--bild:url\('[^']*\/symbole\/mathe\.svg'\)"><\/i><\/span>$/);
  assert.match(bausteinHtml({ baustein: "karte", wert: "", fach: "sprechen" }), /symbole\/sprechen\.svg/); // Sprechen hat jetzt ein Symbol
  assert.equal(bausteinHtml({ baustein: "karte", wert: "", fach: "weiteres" }), '<span class="karte symbol" aria-hidden="true"></span>');
});
