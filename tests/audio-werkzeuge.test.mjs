import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { audioSchluessel, normalisiere } from "../spiele/kern/audio.js";
import { ssml } from "../werkzeuge/audio/ssml.mjs";
import { azure } from "../werkzeuge/audio/azure.mjs";
import { knopfNamen, literaleAusCode, saetzeAusTexten, sammle } from "../werkzeuge/audio/texte.mjs";
import { erzeuge } from "../werkzeuge/audio/erzeugen.mjs";

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), "..");
const EIN = { stimme: "de-DE-Test", ordner: "test", zahlen: false, varianten: { diktat: { tempo: "-15%" } } };
const eintrag = (text, variante = "") => ({ schluessel: audioSchluessel(text, variante), text, variante, quellen: ["t"] });

test("Schlüssel: NFC, Leerraum, Variante", () => {
  assert.equal(normalisiere("  Hör \n mal  "), "Hör mal");
  assert.equal(normalisiere("Hör"), "Hör");
  assert.equal(audioSchluessel("Der  Hund", "diktat"), "diktat|Der Hund");
});

test("SSML: Stimme, Maskierung, Tempo der Variante, Korrektur", () => {
  const s = ssml({ text: "Max & <Moritz>" }, EIN);
  assert.match(s, /<voice name="de-DE-Test">Max &amp; &lt;Moritz&gt;<\/voice>/);
  assert.match(ssml({ text: "Hund", variante: "diktat" }, EIN), /<prosody rate="-15%">Hund<\/prosody>/);
  assert.match(ssml({ text: "Schmet … terling?" }, EIN, { sprich: "Schmett … terling?" }), />Schmett … terling\?</);
  assert.match(ssml({ text: "Ei" }, EIN, { ssml: '<phoneme ph="aɪ">Ei</phoneme>' }), /<phoneme ph="aɪ">Ei<\/phoneme>/);
  assert.throws(() => ssml({ text: "x", variante: "flüstern" }, EIN), /Unbekannte Variante/);
  const langsam = { ...EIN, tempo: "-10%" };
  assert.match(ssml({ text: "Hund" }, langsam), /<prosody rate="-10%">Hund<\/prosody>/);
  assert.match(ssml({ text: "Hund", variante: "diktat" }, langsam), /<prosody rate="-15%">Hund<\/prosody>/);
});

test("Literale im Spielcode: nur feste Zeichenketten, Rest zählt als offen", () => {
  const code = `function say(text){}
    say("Für heute ist Schluss. Bis morgen!");
    sprich('Das kannst du jetzt.', { tempo: 1 });
    say(\`\${w} ist kein Ding.\`);
    say(satz.text);
    kernSprich(text, { tempo: rate });
    obj.say("nicht unsere Funktion");
    sprich();
    blase.sage("Leg zwei Stäbe in die Rinne.", { sprechen });
    this.blase.sage(text);
    async sage(text, { sprechen = true } = {}) {}`;
  const { texte, offen } = literaleAusCode(code);
  assert.deepEqual(texte, ["Für heute ist Schluss. Bis morgen!", "Das kannst du jetzt.", "Leg zwei Stäbe in die Rinne."]);
  assert.equal(offen, 4);
});

test("Knopfnamen: name vor wort, stumm und Vorlagen zählen nicht", () => {
  const code = `<ls-knopf symbol="zurueck.svg" name="Zurück"></ls-knopf>
    <ls-knopf id="echt" symbol="hand.svg" wort="Mit echten Dingen" hidden></ls-knopf>
    <ls-knopf symbol="vorlesen.svg" name="Noch mal hören" stumm></ls-knopf>
    <ls-knopf class="ton tonknopf" stumm></ls-knopf>
    <ls-knopf wort="\${titel}"></ls-knopf>`;
  assert.deepEqual(knopfNamen(code), ["Zurück", "Mit echten Dingen"]);
});

test("sammle: Knopfnamen der Fach-Seite ja, Anregungen (eltern) und Entwicklerseite nein", () => {
  const { eintraege } = sammle(WURZEL);
  const texte = new Set(eintraege.map((e) => e.text));
  const plan = JSON.parse(readFileSync(join(WURZEL, "spiele/lernplan.json"), "utf8"));
  const eltern = plan.themen.filter((t) => t.eltern).map((t) => normalisiere(t.eltern));
  assert.ok(eltern.length > 0);
  assert.ok(eltern.every((t) => !texte.has(t)), "eltern ist Elternsprache und wird nicht vorgelesen");
  for (const name of ["Mit echten Dingen", "Geschichte ansehen", "Zurück"]) assert.ok(texte.has(name), name);
  assert.ok(!eintraege.some((e) => e.quellen.includes("rahmen/vorschau.html") && ["Pause", "Leuchte"].includes(e.text)));
});

test("sammle findet Lernplan, Einführungen und feste Sätze", () => {
  const { eintraege } = sammle(WURZEL);
  const k = new Set(eintraege.map((e) => e.schluessel));
  assert.ok(eintraege.length > 100);
  assert.equal(k.size, eintraege.length);
  assert.ok(eintraege.some((e) => e.quellen.some((q) => q.startsWith("einfuehrungen/"))));
  assert.ok(eintraege.some((e) => e.quellen.includes("lernplan.json")));
  assert.ok(eintraege.some((e) => /\.(html|js)$/.test(e.quellen[0])));
});

test("sammle findet jeden Diktatsatz aus saetze.json", () => {
  const texte = new Set(sammle(WURZEL).eintraege.filter((e) => e.quellen.includes("saetze/saetze.json")).map((e) => e.text));
  const saetze = JSON.parse(readFileSync(join(WURZEL, "spiele/saetze/saetze.json"), "utf8")).saetze;
  assert.ok(saetze.length > 0);
  for (const s of saetze) assert.ok(texte.has(normalisiere(s.text)), s.text);
});

test("erzeuge: neue Datei, unverändert, Zahl, von Hand, verwaist", async () => {
  const geschrieben = [];
  const synth = async (s) => Buffer.from(s);
  const schreibe = (d, b) => geschrieben.push([d, String(b)]);
  const basis = { einstellungen: EIN, synth, schreibe };
  const eintraege = [eintrag("Hallo"), eintrag("Hallo", "diktat"), eintrag("Die 7"), eintrag("Ei")];
  const aussprache = { Ei: { datei: "hand/ei.mp3" } };

  const a = await erzeuge({ ...basis, eintraege, aussprache, index: { stimme: "x", texte: { Alt: { datei: "test/alt.mp3", h: "1" } } } });
  assert.equal(a.bericht.neu, 2);
  assert.deepEqual(a.bericht.zahl, ["Die 7"]);
  assert.deepEqual(a.bericht.verwaist, ["Alt"]);
  assert.equal(a.index.texte.Ei.hand, true);
  assert.equal(a.index.texte.Hallo.gehoert, false);
  assert.match(a.index.texte.Hallo.datei, /^test\/[0-9a-f]{12}\.mp3$/);
  assert.notEqual(a.index.texte.Hallo.datei, a.index.texte["diktat|Hallo"].datei);
  assert.ok(a.index.texte.Alt, "verwaiste Einträge bleiben ohne --aufraeumen");
  assert.equal(geschrieben.length, 2);

  // Zweiter Lauf: nichts Neues. Abgehört bleibt abgehört.
  a.index.texte.Hallo.gehoert = true;
  const b = await erzeuge({ ...basis, eintraege, aussprache, index: a.index });
  assert.equal(b.bericht.neu, 0);
  assert.equal(b.bericht.gleich, 2);
  assert.equal(b.index.texte.Hallo.gehoert, true);

  // Neue Stimme → neu erzeugen, wieder nicht abgehört.
  const c = await erzeuge({ ...basis, einstellungen: { ...EIN, stimme: "de-DE-Andere" }, eintraege, aussprache, index: b.index });
  assert.equal(c.bericht.neu, 2);
  assert.equal(c.index.texte.Hallo.gehoert, false);

  // Aufräumen löscht verwaiste Dateien.
  const geloescht = [];
  const d = await erzeuge({ ...basis, eintraege, aussprache, index: c.index, aufraeumen: true, loesche: (x) => geloescht.push(x) });
  assert.deepEqual(geloescht, ["test/alt.mp3"]);
  assert.equal(d.index.texte.Alt, undefined);
});

test("erzeuge: Zahlen erlaubt, Prüflauf, Abbruch behält Erzeugtes", async () => {
  const z = await erzeuge({ eintraege: [eintrag("Die 7")], index: { stimme: "", texte: {} }, einstellungen: { ...EIN, zahlen: true }, aussprache: {}, synth: async () => Buffer.from("x"), schreibe: () => {} });
  assert.equal(z.bericht.neu, 1);

  const p = await erzeuge({ eintraege: [eintrag("Hallo")], index: { stimme: "", texte: {} }, einstellungen: EIN, aussprache: {} });
  assert.deepEqual(p.bericht.fehlt, ["Hallo"]);

  let n = 0;
  const synth = async () => {
    if (++n === 2) throw new Error("Azure 401");
    return Buffer.from("x");
  };
  const f = await erzeuge({ eintraege: [eintrag("A"), eintrag("B"), eintrag("C")], index: { stimme: "", texte: {} }, einstellungen: EIN, aussprache: {}, synth, schreibe: () => {} });
  assert.equal(f.bericht.fehler, "Azure 401");
  assert.ok(f.index.texte.A);
  assert.deepEqual(f.bericht.fehlt, ["B", "C"]);
  assert.equal(n, 2, "nach dem Fehler keine weiteren Anfragen");
});

test("azure: Kopfzeilen, Wiederholung bei 429, Fehlertext", async () => {
  const anfragen = [];
  const antworten = [
    { ok: false, status: 429, text: async () => "zu viel" },
    { ok: true, status: 200, arrayBuffer: async () => new TextEncoder().encode("mp3").buffer },
  ];
  const synth = azure({ schluessel: "k", region: "westeurope", format: "f", fetch: async (u, o) => (anfragen.push([u, o]), antworten.shift()), schlafe: async () => {} });
  assert.equal(String(await synth("<speak/>")), "mp3");
  assert.equal(anfragen.length, 2);
  assert.equal(anfragen[0][0], "https://westeurope.tts.speech.microsoft.com/cognitiveservices/v1");
  assert.equal(anfragen[0][1].headers["Ocp-Apim-Subscription-Key"], "k");
  assert.equal(anfragen[0][1].headers["X-Microsoft-OutputFormat"], "f");

  const kaputt = azure({ schluessel: "k", region: "r", format: "f", fetch: async () => ({ ok: false, status: 401, text: async () => "falscher Schlüssel" }) });
  await assert.rejects(kaputt("<speak/>"), /Azure 401: falscher Schlüssel/);
  assert.throws(() => azure({ format: "f" }), /AZURE_SPEECH_KEY/);
});

test("sammle findet ein sprich(\"…\") in einem verschachtelten Spielordner (spiele/<fach>/<nr>-<name>/)", () => {
  const wurzel = mkdtempSync(join(tmpdir(), "ablage-"));
  try {
    const spiele = join(wurzel, "spiele");
    const spiel = join(spiele, "mathe", "m99-test-spiel");
    mkdirSync(spiel, { recursive: true });
    mkdirSync(join(spiele, "einfuehrungen"));
    writeFileSync(join(spiele, "spiele.json"), JSON.stringify({ kategorien: [], spiele: [] }));
    writeFileSync(join(spiele, "lernplan.json"), JSON.stringify({ themen: [] }));
    mkdirSync(join(spiele, "saetze"));
    writeFileSync(join(spiele, "saetze", "saetze.json"), JSON.stringify({ saetze: [] }));
    writeFileSync(join(spiel, "spiel.js"), 'import { sprich } from "../../kern/stimme.js";\nsprich("Ein Satz tief im Ordner.");\n');
    writeFileSync(join(spiel, "texte.json"), JSON.stringify({
      hinweis: "Nur für Entwickler.",
      anfang: { 2: { reihe: "Ein Satz aus Daten.", setzung: "Noch ein Satz." } },
      auftrag: { 2: { 3: "Drei Schuhpaare. Wie viele Schuhe sind es zusammen?" } },
      liste: ["Ein Satz in einer Liste.", "12", 7],
    }));
    writeFileSync(join(spiel, "einfuehrung.json"), JSON.stringify({ szenen: [{ sprich: "Am Hafen liegen Kisten.", zeig: "", bild: [] }] }));
    const { eintraege } = sammle(wurzel);
    const einf = eintraege.find((x) => x.text === "Am Hafen liegen Kisten.");
    assert.ok(einf, "Satz der eigenen Einführung im Spielordner gesammelt");
    assert.deepEqual(einf.quellen, ["mathe/m99-test-spiel/einfuehrung.json"]);
    const aus = eintraege.filter((x) => x.quellen.includes("mathe/m99-test-spiel/texte.json")).map((x) => x.text).sort();
    assert.deepEqual(aus, ["Drei Schuhpaare. Wie viele Schuhe sind es zusammen?", "Ein Satz aus Daten.", "Ein Satz in einer Liste.", "Noch ein Satz."],
      "texte.json: alle Sätze rekursiv, keine Schlüssel, keine Zahlen, kein hinweis");
    const e = eintraege.find((x) => x.text === "Ein Satz tief im Ordner.");
    assert.ok(e, "Satz aus mathe/m99-test-spiel/spiel.js gesammelt");
    assert.deepEqual(e.quellen, ["mathe/m99-test-spiel/spiel.js"]);
  } finally { rmSync(wurzel, { recursive: true, force: true }); }
});

test("saetzeAusTexten: Zeichenketten rekursiv, ohne Schlüssel, Zahlen und hinweis", () => {
  const daten = { hinweis: "x", a: { 2: "Satz eins.", b: ["Satz zwei.", 3, "10", { c: "Satz drei." }] }, d: null, e: true };
  assert.deepEqual(saetzeAusTexten(daten), ["Satz eins.", "Satz zwei.", "Satz drei."]);
});

test("sammle findet die Sätze aus texte.json von M37 (Rundenanfang und Auftrag)", () => {
  const { eintraege } = sammle(WURZEL);
  const q = "mathe/m37-kettenhuepfer/texte.json";
  const aus = eintraege.filter((x) => x.quellen.includes(q));
  assert.ok(aus.length >= 90, `mindestens die 90 Aufträge, gefunden ${aus.length}`);
  assert.ok(aus.some((x) => x.text === "Sechs Wochenschachteln. Wie viele Fächer sind es zusammen?"));
});

test("sammle: Seiten der Geschichten (sprich, sonst text)", () => {
  const { eintraege } = sammle(WURZEL);
  const aus = eintraege.filter((e) => e.quellen.includes("geschichten/zehnerpaare/geschichte.json"));
  assert.ok(aus.some((e) => e.text.startsWith("Es ist Winter. Ela und Kofi schauen aus dem Fenster.")), "erste Seite der Zehnerpaare");
  const ruhig = eintraege.filter((e) => e.quellen.includes("geschichten/haustiere-ruhig/geschichte.json"));
  assert.ok(ruhig.some((e) => e.text.startsWith("Mia schnuppert am Karton.")), "auch Fassungen werden aufgenommen");
});
