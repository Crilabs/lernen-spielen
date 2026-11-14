import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { meldeKind, meldeHaltung, meldeGesicht, meldeZubehoer, leereBestand } from "../spiele/runde/bestand.js";
import { zeichne, transformFuer } from "../spiele/runde/zeichne.js";
import { gelenkeFuer } from "../spiele/runde/gelenke.js";
import { TESTKIND_GEHT, TESTKIND_STUHL, kopie } from "./daten/runde-testkinder.js";

const svgZ = (name) => ({ dreiviertel: `<path data-test="${name}-d" d="M0 0"/>`, profil: `<path data-test="${name}-p" d="M0 0"/>` });

beforeEach(() => {
  leereBestand();
  meldeKind(kopie(TESTKIND_GEHT));
  meldeKind(kopie(TESTKIND_STUHL));
  meldeGesicht({ id: "ruhig", ansichten: { dreiviertel: `<path data-test="ruhig-d"/>`, profil: `<path data-test="ruhig-p"/>` } });
  meldeGesicht({ id: "staunen", ansichten: { dreiviertel: `<path data-test="staunen-d"/>`, profil: `<path data-test="staunen-p"/>` } });
  meldeHaltung({ id: "stehen", ansicht: "beide" });
  meldeHaltung({ id: "nicken", ansicht: "dreiviertel", wort: "nickt", winkel: { kopf: 10 } });
  meldeHaltung({ id: "gehen-pose", ansicht: "profil", winkel: { "bein-vorn": 20 }, rollstuhl: {} });
  meldeHaltung({ id: "zaubern", ansicht: "dreiviertel", braucht: ["test-stab"] });
  meldeHaltung({ id: "hoch", ansicht: "beide", versatz: [0, -60], groesse: 0.5 });
  meldeHaltung({ id: "deuten", ansicht: "dreiviertel", haende: { vorn: "zeigen" } });
  meldeZubehoer({ id: "test-hut", wort: "der Hut", verdeckt: ["haare-oben"], teile: [{ platz: "kopf", ebene: "vorne", svg: svgZ("hut") }] });
  meldeZubehoer({
    id: "test-stab", wort: "der Stab",
    teile: [{ platz: "hand-vorn", ebene: "vorne", svg: svgZ("stab"), zustaende: { leuchtet: svgZ("stab-hell") } }],
  });
  meldeZubehoer({ id: "test-decke", wort: "die Decke", teile: [{ platz: "schoss", ebene: "vorne", svg: svgZ("decke") }] });
  meldeZubehoer({ id: "test-umhang", wort: "der Umhang", teile: [{ platz: "ruecken", ebene: "hinten", svg: svgZ("umhang") }] });
});

/** Text der Gruppe eines Gelenks (vom öffnenden Tag bis zu seinem schließenden). */
function gruppe(svg, gelenk) {
  const start = svg.indexOf(`data-gelenk="${gelenk}"`);
  assert.ok(start >= 0, `Gelenk ${gelenk} fehlt`);
  let tiefe = 0;
  const re = /<g\b|<\/g>/g;
  re.lastIndex = svg.lastIndexOf("<g", start);
  for (let m; (m = re.exec(svg)); ) {
    tiefe += m[0] === "</g>" ? -1 : 1;
    if (tiefe === 0) return svg.slice(svg.lastIndexOf("<g", start), m.index + 4);
  }
  throw new Error("Gruppe nicht geschlossen");
}

test("alle Gelenkgruppen da, je einmal", () => {
  for (const [id, bewegt] of [["test-geht", "geht"], ["test-stuhl", "rollstuhl"]]) {
    const svg = zeichne(id);
    const gefunden = [...svg.matchAll(/data-gelenk="([^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual(gefunden.sort(), gelenkeFuer(bewegt).sort());
  }
});

test("Zeichenreihenfolge: hinterer Arm, Rumpf, Kopf", () => {
  const svg = zeichne("test-geht");
  assert.ok(svg.indexOf('data-gelenk="arm-hinten-oben"') < svg.indexOf('data-test="rumpf"'));
  assert.ok(svg.indexOf('data-test="rumpf"') < svg.indexOf('data-gelenk="kopf"'));
  assert.ok(svg.indexOf('data-gelenk="kopf"') < svg.indexOf('data-gelenk="arm-vorn-oben"'));
});

test("Beine liegen hinter dem Rumpf, damit der Saum das Hüftgelenk verdeckt", () => {
  const svg = zeichne("test-geht");
  assert.ok(svg.indexOf('data-gelenk="bein-vorn"') < svg.indexOf('data-gelenk="rumpf"'));
  assert.ok(svg.indexOf('data-gelenk="bein-hinten"') < svg.indexOf('data-gelenk="bein-vorn"'));
});

test("Winkel dreht um den Drehpunkt des Kindes", () => {
  const svg = zeichne("test-geht", { haltung: "nicken" });
  assert.match(svg, /data-gelenk="kopf" transform="rotate\(10 160 120\)"/);
  assert.equal(transformFuer([160, 120], 10), "rotate(10 160 120)");
});

test("Versatz und Größe an der Wurzel, Größe um den Fußpunkt", () => {
  const svg = zeichne("test-geht", { haltung: "hoch" });
  assert.match(svg, /data-gelenk="koerper" transform="translate\(0 -60\) translate\(160 254\) scale\(0.5\) translate\(-160 -254\) rotate\(0 160 254\)"/);
});

test("Gesicht sitzt im Platzhalter, zwischen Kopf und Haaren", () => {
  const svg = zeichne("test-geht", { gesicht: "staunen" });
  const i = svg.indexOf('data-test="staunen-d"');
  assert.ok(svg.indexOf('data-test="kopf"') < i && i < svg.indexOf('data-test="haare-oben"'));
  assert.match(svg, /data-gesicht="staunen" transform="translate\(160 92\)"/);
});

test("verdeckt blendet Teile des Kindes aus", () => {
  assert.ok(zeichne("test-geht").includes('data-test="haare-oben"'));
  const svg = zeichne("test-geht", { zubehoer: ["test-hut"] });
  assert.ok(!svg.includes('data-test="haare-oben"'));
  assert.ok(gruppe(svg, "kopf").includes('data-test="hut-d"'));
});

test("Zubehör sitzt im Gelenk seines Platzes, auch am Stuhlkind", () => {
  const svg = zeichne("test-stuhl", { zubehoer: ["test-decke"] });
  assert.ok(gruppe(svg, "rumpf").includes('data-test="decke-d"'));
  assert.match(svg, /data-zubehoer="test-decke"[^>]*transform="translate\(165 200\) rotate\(0\) scale\(1\)"/);
});

test("Zubehör hinten liegt vor den eigenen Teilen des Gelenks", () => {
  const svg = zeichne("test-geht", { zubehoer: ["test-umhang"] });
  assert.ok(svg.indexOf('data-test="umhang-d"') < svg.indexOf('data-test="rumpf"'));
  assert.ok(svg.indexOf('data-test="umhang-d"') < svg.indexOf('data-gelenk="arm-hinten-oben"'));
});

test("braucht legt Zubehör ohne Angabe an", () => {
  assert.ok(zeichne("test-geht", { haltung: "zaubern" }).includes('data-test="stab-d"'));
});

test("Zustand wählt die Zustandsfassung", () => {
  const svg = zeichne("test-geht", { haltung: "zaubern", zustaende: { "test-stab": "leuchtet" } });
  assert.ok(svg.includes('data-test="stab-hell-d"') && !svg.includes('data-test="stab-d"'));
  assert.match(svg, /data-zubehoer="test-stab" data-teil="0" data-zustand="leuchtet"/);
});

test("Ansicht folgt der Haltung, falsche Ansicht wirft", () => {
  assert.match(zeichne("test-geht", { haltung: "gehen-pose" }), /data-ansicht="profil"/);
  assert.throws(() => zeichne("test-geht", { haltung: "gehen-pose", ansicht: "dreiviertel" }), /profil/);
  assert.match(zeichne("test-geht"), /data-ansicht="dreiviertel"/);
  assert.ok(zeichne("test-geht", { ansicht: "profil" }).includes('data-test="ruhig-p"'));
});

test("Spiegeln für Blick nach links", () => {
  assert.match(zeichne("test-geht", { blick: "links" }), /data-blick="links" transform="translate\(320 0\) scale\(-1 1\)"/);
});

test("aria-label nennt Name und Haltung", () => {
  assert.match(zeichne("test-geht", { haltung: "nicken" }), /role="img" aria-label="Testa nickt"/);
  assert.match(zeichne("test-geht"), /aria-label="Testa"/);
});

test("kein id=, kein undefined, kein NaN; rein", () => {
  const opts = { haltung: "zaubern", zubehoer: ["test-hut", "test-umhang"] };
  const svg = zeichne("test-stuhl", opts);
  assert.doesNotMatch(svg, /\sid=|undefined|NaN/);
  assert.equal(svg, zeichne("test-stuhl", opts));
  assert.match(svg, /^<svg class="runde" viewBox="0 0 320 280"/);
});

test("Handform: Standard offen, Haltung wählt zeigen", () => {
  assert.ok(zeichne("test-geht").includes('data-test="hand-offen"'));
  const svg = zeichne("test-geht", { haltung: "deuten" });
  assert.ok(svg.includes('data-test="hand-zeigen"') && !svg.includes('data-test="hand-offen"'));
});
