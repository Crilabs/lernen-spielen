import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { meldeKind, meldeHaltung, meldeGesicht, meldeBewegung, meldeZubehoer, leereBestand } from "../spiele/runde/bestand.js";
import { zeichne } from "../spiele/runde/zeichne.js";
import { steuere } from "../spiele/runde/steuere.js";
import { TESTKIND_GEHT, TESTKIND_STUHL, kopie } from "./daten/runde-testkinder.js";
import { fakeSvg, uhr, winkelAus } from "./daten/runde-fake-svg.js";

const zwei = { dreiviertel: "<path/>", profil: "<path/>" };

beforeEach(() => {
  leereBestand();
  meldeKind(kopie(TESTKIND_GEHT));
  meldeKind(kopie(TESTKIND_STUHL));
  meldeGesicht({ id: "ruhig", ansichten: zwei });
  meldeGesicht({ id: "staunen", ansichten: { dreiviertel: `<path data-test="staunen"/>`, profil: "<path/>" } });
  meldeHaltung({ id: "stehen", ansicht: "beide" });
  meldeHaltung({ id: "nicken", ansicht: "dreiviertel", wort: "nickt", winkel: { kopf: 10 } });
  meldeHaltung({ id: "staunen", ansicht: "dreiviertel", gesicht: "staunen", winkel: { kopf: -6 } });
  meldeHaltung({ id: "deuten", ansicht: "dreiviertel", haende: { vorn: "zeigen" } });
  meldeZubehoer({ id: "test-stab", wort: "der Stab", teile: [{ platz: "hand-vorn", ebene: "vorne", svg: zwei }] });
  meldeBewegung({
    id: "gehen-test", ansicht: "profil", mal: 4, ende: "stehen",
    schritte: [{ ms: 250, winkel: { "bein-vorn": 20 } }, { ms: 250, winkel: { "bein-vorn": -20 } }],
    rollstuhl: { schritte: [{ ms: 250, winkel: { "rad-vorn": 90 } }] },
  });
  meldeBewegung({ id: "zaubern-test", ansicht: "dreiviertel", ende: "stehen", braucht: ["test-stab"], schritte: [{ ms: 300 }] });
});

function figur(kind = "test-geht", extra = {}) {
  const u = uhr();
  const svg = fakeSvg(zeichne(kind));
  const f = steuere(svg, { jetzt: u.jetzt, naechsterFrame: u.naechsterFrame, wenigBewegung: false, ...extra });
  const kopf = () => winkelAus(svg.querySelector('[data-gelenk="kopf"]').getAttribute("transform"));
  return { u, svg, f, kopf };
}

test("Übergang erreicht das Ziel nach der Dauer", async () => {
  const { u, f, kopf } = figur();
  const fertig = f.haltung("nicken");
  await u.spule(500);
  assert.ok(kopf() > 0 && kopf() < 10);
  await u.spule(520);
  assert.deepEqual(await fertig, { abgebrochen: false });
  assert.equal(kopf(), 10);
  assert.equal(f.pose.winkel.kopf, 10);
});

test("Standarddauer ist 1000 ms", async () => {
  const { u, f, kopf } = figur();
  f.haltung("nicken");
  await u.spule(900);
  assert.ok(kopf() < 10);
  await u.spule(112);
  assert.equal(kopf(), 10);
});

test("wenig Bewegung springt sofort", async () => {
  const { f, kopf } = figur("test-geht", { wenigBewegung: true });
  assert.deepEqual(await f.haltung("nicken"), { abgebrochen: false });
  assert.equal(kopf(), 10);
});

test("halt springt ans Ende und meldet abgebrochen", async () => {
  const { u, f, kopf } = figur();
  const fertig = f.haltung("nicken");
  await u.spule(100);
  f.halt();
  assert.deepEqual(await fertig, { abgebrochen: true });
  assert.equal(kopf(), 10);
});

test("neuer Übergang beginnt am Zwischenwinkel, ohne Sprung", async () => {
  const { u, f, kopf } = figur();
  const erst = f.haltung("nicken");
  await u.spule(500);
  const mitte = kopf();
  const dann = f.haltung("stehen");
  assert.deepEqual(await erst, { abgebrochen: true });
  await u.spule(16);
  assert.ok(Math.abs(kopf() - mitte) < 1, `${kopf()} weit weg von ${mitte}`);
  await u.spule(1000);
  assert.deepEqual(await dann, { abgebrochen: false });
  assert.equal(kopf(), 0);
});

test("Gesicht wechselt zur Hälfte des Übergangs", async () => {
  const { u, svg, f } = figur();
  f.haltung("staunen");
  await u.spule(400);
  assert.equal(svg.querySelector("[data-gesicht]").getAttribute("data-gesicht"), "ruhig");
  await u.spule(200);
  const g = svg.querySelector("[data-gesicht]");
  assert.equal(g.getAttribute("data-gesicht"), "staunen");
  assert.match(g.innerHTML, /data-test="staunen"/);
});

test("Ansichtswechsel ohne Drehung zeichnet sofort neu", async () => {
  const { u, svg, f } = figur();
  const geht = f.bewegung("gehen-test", { drehen: false });
  await u.spule(32);
  assert.equal(svg.getAttribute("data-ansicht"), "profil");
  assert.ok(svg.querySelector('[data-gelenk="bein-vorn"]'));
  const staunt = f.haltung("staunen", { drehen: false });
  assert.deepEqual(await geht, { abgebrochen: true });
  assert.equal(svg.getAttribute("data-ansicht"), "dreiviertel");
  await u.spule(1100);
  assert.deepEqual(await staunt, { abgebrochen: false });
  assert.equal(svg.getAttribute("aria-label"), "Testa");
});

test("Bewegung läuft bis zur Ende-Haltung", async () => {
  const { u, svg, f } = figur("test-stuhl");
  const fertig = f.bewegung("gehen-test");
  await u.spule(3000);
  assert.deepEqual(await fertig, { abgebrochen: false });
  assert.equal(winkelAus(svg.querySelector('[data-gelenk="rad-vorn"]').getAttribute("transform")), 0);
  assert.equal(svg.getAttribute("data-haltung"), "stehen");
});

test("zwei Figuren beeinflussen sich nicht", async () => {
  const a = figur();
  const b = figur();
  a.f.haltung("nicken");
  await a.u.spule(1100);
  assert.equal(a.kopf(), 10);
  assert.equal(b.kopf(), 0);
});

test("Bewegung legt gebrauchtes Zubehör an, zubehoer.an/aus schalten", async () => {
  const { u, svg, f } = figur();
  f.bewegung("zaubern-test");
  await u.spule(32);
  assert.ok(svg.querySelector('[data-zubehoer="test-stab"]'));
  f.halt();
  assert.ok(!svg.querySelector('[data-zubehoer="test-stab"]'), "Ende-Haltung braucht keinen Stab");
  f.zubehoer.an("test-stab");
  assert.ok(svg.querySelector('[data-zubehoer="test-stab"]'));
  f.zubehoer.aus("test-stab");
  assert.ok(!svg.querySelector('[data-zubehoer="test-stab"]'));
});

test("Handform wechselt beim Übergang", async () => {
  const { u, svg, f } = figur();
  f.haltung("deuten");
  await u.spule(1100);
  assert.match(svg.innerHTML, /data-test="hand-zeigen"/);
});

test("beide Schichten drehen mit", async () => {
  const { u, svg, f } = figur();
  f.haltung("nicken");
  await u.spule(1100);
  const gruppen = svg.querySelectorAll('[data-gelenk="kopf"]');
  assert.equal(gruppen.length, 2);
  for (const g of gruppen) assert.equal(winkelAus(g.getAttribute("transform")), 10);
});
