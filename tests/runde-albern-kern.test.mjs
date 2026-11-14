// Kernzusätze für die albernen Bewegungen: Streckung, Kurven, Luftzeichen, nur im Rollstuhl, Drehung, Wende, zusammen().
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { meldeKind, meldeHaltung, meldeGesicht, meldeBewegung, meldeLuftzeichen, leereBestand, pruefeBestand } from "../spiele/runde/bestand.js";
import { pose, ablauf, mische, kurvenwert } from "../spiele/runde/pose.js";
import { zeichne, zeichnePose, gelenkTransform } from "../spiele/runde/zeichne.js";
import { steuere, zusammen, DREH } from "../spiele/runde/steuere.js";
import { bestand } from "../spiele/runde/bestand.js";
import { TESTKIND_GEHT, TESTKIND_STUHL, kopie } from "./daten/runde-testkinder.js";
import { fakeSvg, uhr } from "./daten/runde-fake-svg.js";

const zwei = { dreiviertel: "<path/>", profil: "<path/>" };
/** sx, sy aus dem Wurzel-Transform. */
const skala = (svg) => {
  const m = /scale\(([-\d.]+)(?: ([-\d.]+))?\)/.exec(svg.querySelector('[data-gelenk="koerper"]').getAttribute("transform"));
  return [Number(m[1]), Number(m[2] ?? m[1])];
};

beforeEach(() => {
  leereBestand();
  meldeKind(kopie(TESTKIND_GEHT));
  meldeKind(kopie(TESTKIND_STUHL));
  meldeGesicht({ id: "ruhig", ansichten: zwei });
  meldeGesicht({ id: "staunen", ansichten: zwei });
  meldeHaltung({ id: "stehen", ansicht: "beide" });
  meldeHaltung({ id: "nicken", ansicht: "dreiviertel", winkel: { kopf: 10 } });
  meldeHaltung({ id: "breit", ansicht: "dreiviertel", streckung: [1.3, 0.7], gesicht: "staunen" });
  meldeLuftzeichen({ id: "staub", wort: "Staub", svg: `<circle r="4"/>` });
  meldeLuftzeichen({ id: "striche", wort: "Striche", svg: `<path d="M0 0 L9 0"/>` });
  meldeBewegung({
    id: "seite", ansicht: "profil", ende: "stehen",
    schritte: [{ ms: 200, winkel: { kopf: 8 } }],
  });
  meldeBewegung({
    id: "plumps", ansicht: "dreiviertel", ende: "stehen",
    schritte: [{ ms: 200, streckung: [1.3, 0.7], luft: { staub: "boden" }, kurve: "federn" }, { ms: 200, kurve: "ruck", gesicht: "staunen" }],
  });
  meldeBewegung({
    id: "umdrehen", ansicht: "dreiviertel", ende: "stehen",
    schritte: [{ ms: 100, streckung: [0.05, 1] }, { ms: 100, wende: true, streckung: [1, 1] }],
  });
  meldeBewegung({ id: "wheelie", ansicht: "profil", ende: "stehen", nur: "rollstuhl", schritte: [{ ms: 200, winkel: { koerper: -15 } }] });
  pruefeBestand();
});

function figur(kind = "test-geht", extra = {}) {
  const u = uhr();
  const svg = fakeSvg(zeichne(kind, extra.zeichne ?? {}));
  const f = steuere(svg, { jetzt: u.jetzt, naechsterFrame: u.naechsterFrame, wenigBewegung: false, ...extra });
  return { u, svg, f };
}

test("Kurven: gleich linear, ruck sofort, weich symmetrisch, federn überschwingt um etwa 10 %", () => {
  assert.equal(kurvenwert("gleich", 0.5), 0.5);
  assert.equal(kurvenwert("ruck", 0.01), 1);
  assert.equal(kurvenwert("ruck", 0), 0);
  assert.equal(kurvenwert("weich", 0.5), 0.5);
  let max = 0;
  for (let t = 0; t <= 1; t += 0.01) max = Math.max(max, kurvenwert("federn", t));
  assert.ok(max > 1.08 && max < 1.12, `federn max ${max}`);
  assert.ok(Math.abs(kurvenwert("federn", 1) - 1) < 1e-9);
});

test("mische blendet Streckung, ruck wechselt das Gesicht sofort", () => {
  const a = pose("test-geht", "stehen");
  const b = pose("test-geht", "breit");
  assert.deepEqual(a.streckung, [1, 1]);
  assert.deepEqual(mische(a, b, 0.5, "gleich").streckung.map((v) => Math.round(v * 100) / 100), [1.15, 0.85]);
  assert.equal(mische(a, b, 0.1, "weich").gesicht, "ruhig");
  assert.equal(mische(a, b, 0.1, "ruck").gesicht, "staunen");
});

test("Streckung im Wurzel-Transform, mit Größe multipliziert", () => {
  const p = { ...pose("test-geht", "stehen"), streckung: /** @type {[number, number]} */ ([0.5, 1.2]), groesse: 2 };
  const ans = bestand.kinder.get("test-geht").ansichten.dreiviertel;
  assert.match(gelenkTransform(ans, "koerper", p), /scale\(1 2\.4\)/);
  assert.match(gelenkTransform(ans, "koerper", pose("test-geht", "stehen")), /scale\(1\)/);
});

test("Streckung außerhalb der Grenzen, falsche Kurve, falscher Anker, ms 0: Fehler mit Namen", () => {
  assert.throws(() => meldeHaltung({ id: "platt", ansicht: "beide", streckung: [1, 0.4] }), /platt.*streckung/);
  assert.throws(() => meldeBewegung({ id: "k", ansicht: "profil", ende: "stehen", schritte: [{ ms: 100, kurve: "zick" }] }), /kurve „zick“/);
  assert.throws(() => meldeBewegung({ id: "l", ansicht: "profil", ende: "stehen", schritte: [{ ms: 100, luft: { staub: "mond" } }] }), /Anker „mond“/);
  assert.throws(() => meldeBewegung({ id: "m", ansicht: "profil", ende: "stehen", schritte: [{ ms: 0 }] }), /ms/);
  meldeBewegung({ id: "n", ansicht: "profil", ende: "stehen", schritte: [{ ms: 100, luft: { nebel: "boden" } }] });
  assert.throws(() => pruefeBestand(), /Luftzeichen „nebel“/);
});

test("Luftzeichen: nur im Schritt, der sie nennt, am Anker, ohne bei wenig Bewegung", () => {
  const folge = ablauf("test-geht", "plumps");
  assert.deepEqual(folge[0].pose.luft, { staub: "boden" });
  assert.deepEqual(folge[1].pose.luft, {});
  assert.equal(folge[0].kurve, "federn");
  const svg = zeichnePose("test-geht", folge[0].pose);
  assert.match(svg, /<g data-luft="vorn"[^>]*><g data-zeichen="staub" transform="translate\(160 254\)">/);
  assert.doesNotMatch(zeichnePose("test-geht", folge[0].pose, { ohneLuft: true }), /data-zeichen/);
});

test("steuere zeigt Luftzeichen während des Schritts und nimmt sie danach weg", async () => {
  const { u, svg, f } = figur();
  const fertig = f.bewegung("plumps");
  const vorn = () => svg.querySelector('[data-luft="vorn"]').innerHTML;
  await u.spule(100);
  // Der erste Schritt zeichnet neu (Inhalt steht dann in der Wurzel), spätere setzen die Gruppe.
  assert.ok(/data-zeichen="staub"/.test(vorn()) || /data-luft="vorn"[^>]*><g data-zeichen="staub"/.test(svg.innerHTML));
  await u.spule(1000);
  await fertig;
  assert.equal(vorn(), "");
  const w = figur("test-geht", { wenigBewegung: true });
  w.f.bewegung("plumps");
  assert.doesNotMatch(w.svg.innerHTML, /data-zeichen/);
});

test("nur im Rollstuhl: Beine verboten, andere Kinder bekommen einen klaren Fehler", () => {
  assert.throws(() => meldeBewegung({ id: "x", ansicht: "profil", ende: "stehen", nur: "rollstuhl", schritte: [{ ms: 100, winkel: { "bein-vorn": 9 } }] }), /keine Beine/);
  assert.throws(() => ablauf("test-geht", "wheelie"), /nur für Kinder im Rollstuhl/);
  assert.equal(ablauf("test-stuhl", "wheelie")[0].pose.winkel.koerper, -15);
});

test("Profil-Bewegung an einer Dreiviertel-Figur: erst drehen (schmal), dann Bewegung", async () => {
  const { u, svg, f } = figur();
  const fertig = f.bewegung("seite");
  await u.spule(DREH.zu - 30);
  assert.equal(svg.getAttribute("data-ansicht"), "dreiviertel");
  assert.ok(skala(svg)[0] < 0.6, "staucht sich");
  await u.spule(60);
  assert.equal(svg.getAttribute("data-ansicht"), "profil");
  assert.ok(skala(svg)[0] < 1, "öffnet sich noch");
  await u.spule(2000);
  assert.deepEqual(await fertig, { abgebrochen: false });
  assert.deepEqual(skala(svg), [1, 1]);
  assert.equal(svg.getAttribute("data-haltung"), "stehen");
});

test("Drehung: halt springt in Zielansicht und Ende, neuer Auftrag bricht ab", async () => {
  const a = figur();
  a.f.bewegung("seite");
  await a.u.spule(60);
  a.f.halt();
  assert.equal(a.svg.getAttribute("data-ansicht"), "profil");
  assert.deepEqual(skala(a.svg), [1, 1]);
  const b = figur();
  const erste = b.f.bewegung("seite");
  await b.u.spule(60);
  const zweite = b.f.haltung("nicken");
  assert.deepEqual(await erste, { abgebrochen: true });
  await b.u.spule(1200);
  assert.deepEqual(await zweite, { abgebrochen: false });
  assert.equal(b.svg.getAttribute("data-ansicht"), "dreiviertel");
  assert.deepEqual(skala(b.svg), [1, 1]);
});

test("drehen() wechselt die Ansicht und behält eine Haltung, die es in beiden gibt", async () => {
  const { u, svg, f } = figur();
  const fertig = f.drehen("profil");
  await u.spule(500);
  assert.deepEqual(await fertig, { abgebrochen: false });
  assert.equal(svg.getAttribute("data-ansicht"), "profil");
  assert.equal(svg.getAttribute("data-haltung"), "stehen");
  const w = figur("test-geht", { wenigBewegung: true });
  await w.f.drehen("profil");
  assert.equal(w.svg.getAttribute("data-ansicht"), "profil");
});

test("Wende tauscht den Blick, auch bei halt()", async () => {
  const { u, svg, f } = figur();
  assert.equal(f.blick, "rechts");
  const fertig = f.bewegung("umdrehen");
  await u.spule(800);
  await fertig;
  assert.equal(f.blick, "links");
  assert.equal(svg.querySelector("[data-blick]").getAttribute("data-blick"), "links");
  const b = figur();
  b.f.bewegung("umdrehen");
  await b.u.spule(30);
  b.f.halt();
  assert.equal(b.f.blick, "links");
  assert.equal(b.svg.querySelector("[data-blick]").getAttribute("data-blick"), "links");
});

test("zusammen startet versetzt, halt hält alle", async () => {
  const u = uhr();
  const opt = { jetzt: u.jetzt, naechsterFrame: u.naechsterFrame, wenigBewegung: false };
  const svgs = [fakeSvg(zeichne("test-geht")), fakeSvg(zeichne("test-geht"))];
  const fs = svgs.map((s) => steuere(s, opt));
  const kopf = (s) => s.querySelector('[data-gelenk="kopf"]').getAttribute("transform");
  meldeBewegung({ id: "nick", ansicht: "dreiviertel", ende: "stehen", schritte: [{ ms: 300, winkel: { kopf: 10 } }] });
  const z = zusammen(fs, "nick", { abstand: 100, ...opt });
  await u.spule(60);
  assert.notEqual(kopf(svgs[0]), kopf(svgs[1]), "die zweite wartet noch");
  await u.spule(2000);
  await z;
  assert.throws(() => zusammen(fs, ["nick"]), /2 Bewegungen/);
  const z2 = zusammen(fs, ["nick", "nick"], { abstand: 100, ...opt });
  await u.spule(150);
  z2.halt();
  await z2;
  assert.equal(fs[0].pose.winkel.kopf, 0);
});

test("Wende kehrt den Versatz um, die Figur bleibt an ihrem Platz", async () => {
  meldeBewegung({
    id: "runde-test", ansicht: "dreiviertel", ende: "stehen",
    schritte: [{ ms: 100, versatz: [90, 0], streckung: [0.05, 1] }, { ms: 100, wende: true, versatz: [-90, 0], streckung: [1, 1] }],
  });
  const { u, svg, f } = figur();
  f.bewegung("runde-test");
  await u.spule(116);
  assert.match(svg.querySelector('[data-gelenk="koerper"]').getAttribute("transform"), /^translate\(-9\d/);
  assert.equal(f.blick, "links");
});

test("zopf folgt dem Kopf: gleicher Winkel, Drehpunkt des Kopfes", () => {
  const p = { ...pose("test-geht", "nicken") };
  const ans = bestand.kinder.get("test-geht").ansichten.dreiviertel;
  const kopf = gelenkTransform(ans, "kopf", p);
  assert.equal(gelenkTransform(ans, "zopf", p), kopf);
  assert.match(kopf, /rotate\(10 /);
  assert.match(zeichne("test-geht", { haltung: "nicken" }), /data-gelenk="zopf" transform="rotate\(10 /);
});
