// Themen-Übersicht für das Kind: uebersicht() (rein) und Vorgaben an themen.html
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const { uebersicht, neuerStand, themaFuer, startThema } = await import("../spiele/lernsteuerung.js");

const HEUTE = "2026-11-13";
const json = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
const ECHT = { plan: json("../spiele/lernplan.json"), spiele: json("./daten/spiele-beispiel.json") };
const ids = (u) => u.flatMap((s) => s.stationen.map((x) => x.id));
const station = (u, id) => u.flatMap((s) => s.stationen).find((x) => x.id === id);

test("uebersicht: frischer Stand zeigt nur zerlegen-2 (zerlegen-3 kommt erst danach in Sicht)", () => {
  const u = uebersicht(ECHT, neuerStand());
  assert.deepEqual(u.map((s) => s.strang), ["mathe"]);
  assert.deepEqual(ids(u), ["zerlegen-2"]);
  assert.deepEqual(u[0].stationen[0], {
    id: "zerlegen-2", name: "Die 2 zerlegen", sprich: "Zerlegen", ziffer: "2",
    zustand: "in-sicht", spiele: ["perlenbruecke"], geschichte: false,
  });
});

test("uebersicht: nach dem Vorgriff im Zahlenzauber zusätzlich rechnen-3 als dran", () => {
  const stand = neuerStand();
  const wahl = themaFuer(ECHT, stand, "zahlenzauber", { heute: HEUTE });
  assert.deepEqual(wahl, { thema: "rechnen-3", modus: "vorgriff" });
  startThema(stand, wahl.thema, HEUTE); // so wie runde().naechste() beim Vorgriff
  const u = uebersicht(ECHT, stand);
  assert.deepEqual(ids(u), ["zerlegen-2", "rechnen-3"]);
  assert.equal(station(u, "rechnen-3").zustand, "dran");
  assert.deepEqual(station(u, "rechnen-3").spiele, ["zahlenzauber"]);
  assert.equal(station(u, "rechnen-3").ziffer, "3");
});

test("uebersicht: kann-ich hat spiele, geschichte nur mit gesehener Einführung", () => {
  const stand = neuerStand();
  stand.themen["zerlegen-2"] = { z: "kann-ich", e: HEUTE, k: HEUTE };
  stand.themen["zerlegen-3"] = { z: "dran", e: "" };
  const u = uebersicht(ECHT, stand);
  const z2 = station(u, "zerlegen-2"), z3 = station(u, "zerlegen-3");
  assert.equal(z2.zustand, "kann-ich");
  assert.deepEqual(z2.spiele, ["perlenbruecke"]);
  assert.equal(z2.geschichte, true);
  assert.equal(z3.zustand, "dran");
  assert.equal(z3.geschichte, false);
});

test("uebersicht: verborgene und Themen ohne Spiel fehlen, Stränge ohne Station auch", () => {
  const u = uebersicht(ECHT, neuerStand());
  assert.ok(!ids(u).includes("mengen-5"), "ohne Spiel");
  assert.ok(!ids(u).includes("zerlegen-3"), "verborgen");
  const t = (id, strang, voraussetzungen, aufgaben) => ({ id, name: id, sprich: id, strang, voraussetzungen, aufgaben });
  const ctx = {
    plan: { themen: [
      t("a", "mathe", [], { art: "zerlegung", zahl: 4 }),
      t("b", "mathe", ["a"], { art: "zerlegung", zahl: 5 }),
      t("geplant", "lesen", [], null),            // geplant: kein Spiel
      t("c", "lesen", ["geplant"], { art: "menge", bis: 5 }), // kein Spiel stellt Mengen dar
    ] },
    spiele: { spiele: [{ id: "pb", arten: [{ art: "zerlegung", zahlen: [2, 10], stufen: ["kopf"] }] }] },
  };
  const v = uebersicht(ctx, neuerStand());
  assert.deepEqual(v.map((s) => s.strang), ["mathe"]);
  assert.deepEqual(ids(v), ["a"]); // b ist verborgen (a noch nicht gekonnt)
  assert.equal(v[0].stationen[0].zustand, "in-sicht");
});

test("uebersicht: Ziffer an der Station ist die letzte Zahl im Namen, sonst leer", () => {
  const ctx = {
    plan: { themen: [
      { id: "x", name: "Über die 10 mit der 9", sprich: "Plus", strang: "mathe", voraussetzungen: [], aufgaben: { art: "zerlegung", zahl: 3 } },
      { id: "y", name: "Zwillingsaufgaben", sprich: "Zwillinge", strang: "mathe", voraussetzungen: [], aufgaben: { art: "zerlegung", zahl: 4 } },
    ] },
    spiele: { spiele: [{ id: "pb", arten: [{ art: "zerlegung", zahlen: [2, 10], stufen: ["kopf"] }] }] },
  };
  const u = uebersicht(ctx, neuerStand());
  assert.equal(station(u, "x").ziffer, "9");
  assert.equal(station(u, "y").ziffer, "");
});

test("uebersicht: sprich jeder Station ohne Ziffern", () => {
  const stand = neuerStand();
  for (const t of ECHT.plan.themen) stand.themen[t.id] = { z: "kann-ich" };
  for (const s of uebersicht(ECHT, stand).flatMap((x) => x.stationen)) assert.doesNotMatch(s.sprich, /\d/, s.id);
});

// ---------- Seiten ----------

const themen = readFileSync(new URL("../spiele/themen.html", import.meta.url), "utf8");

test("themen.html schreibt nie in den Lernstand", () => {
  assert.doesNotMatch(themen, /speichere|sofortSpeichern|einfuehrungGesehen|startThema|runde\(/);
  assert.match(themen, /await ladeLernstand\(ctx, /); // lädt, übernimmt alte Stände nur im Speicher
});

test("themen.html: Fach aus der Adresse, sonst zurück zur Startseite", () => {
  assert.match(themen, /new URLSearchParams\(location\.search\)\.get\("fach"\)/);
  assert.match(themen, /if \(!Object\.hasOwn\(FACH, fach\)\) location\.replace\("index\.html"\)/);
  assert.match(themen, /<ls-leiste id="leiste" spiel="ansichten"><\/ls-leiste>/); // Haus und Ton aus dem Rahmen
  assert.doesNotMatch(themen, /symbole\/haus\.svg/, "kein eigener Haus-Knopf");
});

test("themen.html: Weg aus gekonnt (auch ohne Spiel), dran, in Sicht aus der Lernsteuerung", () => {
  assert.match(themen, /gekonnteThemen\(ctx, stand\)\.filter\(\(t\) => t\.strang === fach\)/);
  assert.match(themen, /uebersicht\(ctx, stand\)/); // in Sicht begrenzt K.IN_SICHT in sichtbar()
  assert.match(themen, /materialFuer\(/);
  assert.match(themen, /<button class="station \$\{s\.zustand\}"[^>]*\n?\s*aria-label="\$\{esc\(s\.name \+ ", " \+ ZUSTAND\[s\.zustand\]\)\}"/);
});

test("themen.html: Fläche mit Spielen (?thema, linkKlick), Geschichte, Mit echten Dingen", () => {
  assert.match(themen, /<script src="figuren\/figuren\.js"><\/script>/);
  assert.match(themen, /<script src="figuren\/einhorn\.js"><\/script>/);
  assert.match(themen, /spieleEinfuehrung\(/);
  assert.match(themen, /\?thema=\$\{encodeURIComponent\(s\.id\)\}/);
  assert.match(themen, /linkKlick\(e\)/);
  assert.match(themen, /<ls-anregung id="anregung"><\/ls-anregung>/);
  assert.match(themen, /anregung\.oeffne\(\{ titel: jetzt\.name, text: jetzt\.eltern \}\)/);
});

test("themen.html: keine Zählung, keine Prozente, kein Klassenbezug", () => {
  assert.doesNotMatch(themen, / von \$\{|%\$\{|\$\{[^}]*\}\s*%|Stern|Pokal|klasse/);
  assert.doesNotMatch(themen, /noch kein Spiel/i);
});

test("ls-anregung: Schnittstelle oeffne/schliesse, keine Attribute im Konstruktor, Escape und Schleier", () => {
  const a = readFileSync(new URL("../spiele/rahmen/anregung.js", import.meta.url), "utf8");
  assert.match(a, /oeffne\(\{ titel = "", text = "", thema = "", fach = "", form = "" \}\)/);
  assert.doesNotMatch(a, /vorlesen\.svg|liesVor|from "\.\.\/kern\/stimme\.js";[\s\S]*\bsprich\(/, "Elternsprache: kein Vorlesen");
  assert.match(a, /inert/);
  assert.match(a, /schliesse\(\) \{/);
  assert.match(a, /e\.key === "Escape"/);
  assert.match(a, /querySelector\("\.schleier"\)\)\.addEventListener\("click"/);
  const konstruktor = a.slice(a.indexOf("constructor()"), a.indexOf("get offen()"));
  assert.doesNotMatch(konstruktor, /setAttribute|toggleAttribute|getAttribute/);
});

test("Symbol themen.svg im Hausstil", () => {
  const svg = readFileSync(new URL("../spiele/symbole/themen.svg", import.meta.url), "utf8");
  assert.match(svg, /viewBox="0 0 100 100"/);
  assert.match(svg, /stroke="#3B2A6B"/);
  assert.match(svg, /stroke-width="4"/);
  assert.match(svg, /stroke-linecap="round"/);
});
