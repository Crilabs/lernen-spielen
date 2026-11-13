import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { audioSchluessel, normalisiere } from "../spiele/kern/audio.js";
import { ssml } from "../werkzeuge/audio/ssml.mjs";
import { azure } from "../werkzeuge/audio/azure.mjs";
import { literaleAusCode, sammle } from "../werkzeuge/audio/texte.mjs";
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
    sprich();`;
  const { texte, offen } = literaleAusCode(code);
  assert.deepEqual(texte, ["Für heute ist Schluss. Bis morgen!", "Das kannst du jetzt."]);
  assert.equal(offen, 3);
});

test("sammle findet Startseite, Lernplan, Einführungen, Diktat und feste Sätze", () => {
  const { eintraege } = sammle(WURZEL);
  const k = new Set(eintraege.map((e) => e.schluessel));
  assert.ok(eintraege.length > 100);
  assert.equal(k.size, eintraege.length);
  assert.ok(k.has("Der Hund bellt."));
  assert.ok(k.has("Hör noch mal hin. Der Hund bellt."));
  assert.ok(k.has("Das Pony frisst Gras. Die Katze schläft auf dem Sofa."));
  assert.ok(eintraege.some((e) => e.quellen.some((q) => q.startsWith("einfuehrungen/"))));
  assert.ok(eintraege.some((e) => e.quellen.includes("lernplan.json")));
  assert.ok(eintraege.some((e) => e.quellen.includes("spiele.json")));
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
