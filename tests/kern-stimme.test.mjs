import { test, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";

globalThis.window = new EventTarget();

const stimme = (name, voiceURI = name, lang = "de-DE") => ({ name, voiceURI, lang });

let gesprochen, abgebrochen, voices;

class FakeUtterance {
  constructor(text) {
    this.text = text;
    this.onend = null;
    this.onerror = null;
  }
}

function fakeSprache() {
  gesprochen = [];
  abgebrochen = 0;
  voices = [stimme("Anna"), stimme("Anna (Premium)"), stimme("Grandma")];
  globalThis.SpeechSynthesisUtterance = FakeUtterance;
  globalThis.speechSynthesis = {
    speak: (u) => gesprochen.push(u),
    cancel: () => {
      abgebrochen += 1;
    },
    getVoices: () => voices,
    addEventListener() {},
  };
}

let n = 0;
const frisch = () => import(`../spiele/kern/stimme.js?n=${++n}`);

/** Wartet, bis ausstehende Promises (Laden der Einstellungen) durch sind. */
const warte = () => new Promise((r) => setImmediate(r));

beforeEach(fakeSprache);
afterEach(() => mock.timers.reset());

test("waehleStimme bevorzugt Premium, meidet Spaßstimmen", async () => {
  const S = await frisch();
  assert.equal(S.waehleStimme(voices, "")?.name, "Anna (Premium)");
  assert.equal(S.waehleStimme([stimme("Grandma"), stimme("Zarvox")], ""), null);
});

test("waehleStimme mit fest = system und festem Schlüssel", async () => {
  const S = await frisch();
  assert.equal(S.waehleStimme(voices, "system"), null);
  assert.equal(S.waehleStimme(voices, S.stimmSchluessel(voices[0], 0)), voices[0]);
  assert.equal(S.stimmSchluessel(voices[0], 0), "0|Anna|Anna");
});

test("stimmWert: Gewichte wie bisher", async () => {
  const S = await frisch();
  assert.equal(S.stimmWert(stimme("Grandma")), -1);
  assert.equal(S.stimmWert(stimme("Anna (Premium)")), 40 + 5 + 3);
  assert.equal(S.stimmWert(stimme("Google Deutsch", "g", "de_DE")), 15 + 5);
  assert.equal(S.stimmWert(stimme("Hedda (Enhanced)", "h", "de-AT")), 25);
});

test("sprich spricht keine Zahl", async () => {
  const S = await frisch();
  assert.equal(await S.sprich("Die 7"), "still");
  assert.equal(gesprochen.length, 0);
});

test("sprich ohne Web-Sprache", async () => {
  globalThis.speechSynthesis = undefined;
  globalThis.SpeechSynthesisUtterance = undefined;
  const S = await frisch();
  assert.equal(await S.sprich("Hallo"), "still");
  assert.deepEqual(S.stimmen(), []);
  S.stille();
});

test("sprich löst bei onend auf, mit Stimme, Sprache und Tempo", async () => {
  const S = await frisch();
  const p = S.sprich("Hallo Ela", { tempo: 0.9 });
  await warte();
  assert.equal(gesprochen.length, 1);
  const u = gesprochen[0];
  assert.equal(u.lang, "de-DE");
  assert.equal(u.rate, 0.9);
  assert.equal(u.pitch, 1);
  assert.equal(u.voice?.name, "Anna (Premium)");
  u.onend();
  assert.equal(await p, "gesprochen");
});

test("sprich löst nach Notbremse auf", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  const S = await frisch();
  const text = "Hallo Ela";
  let fertig = null;
  S.sprich(text).then((e) => (fertig = e));
  await warte();
  assert.equal(gesprochen.length, 1);
  mock.timers.tick(8000 + 150 * text.length - 1);
  await warte();
  assert.equal(fertig, null);
  mock.timers.tick(1);
  await warte();
  assert.equal(fertig, "gesprochen");
});

test("zweites sprich bricht erstes ab", async () => {
  const S = await frisch();
  const erstes = S.sprich("Erstes");
  await warte();
  const zweites = S.sprich("Zweites");
  assert.equal(await erstes, "abgebrochen");
  await warte();
  assert.equal(gesprochen.at(-1).text, "Zweites");
  gesprochen.at(-1).onend();
  assert.equal(await zweites, "gesprochen");
});

test("sprich mit Zahl oder leerem Text bricht laufende Sprache ab", async () => {
  const S = await frisch();
  const erstes = S.sprich("A wie Apfel");
  await warte();
  const vorher = abgebrochen;
  assert.equal(await S.sprich("Die 7"), "still");
  assert.equal(await erstes, "abgebrochen");
  assert.ok(abgebrochen > vorher);
  assert.equal(gesprochen.length, 1);
  const drittes = S.sprich("B wie Ball");
  await warte();
  const vorLeer = abgebrochen;
  assert.equal(await S.sprich(""), "still");
  assert.equal(await drittes, "abgebrochen");
  assert.ok(abgebrochen > vorLeer);
});

test("stille bricht ab, auch während die Einstellungen noch laden", async () => {
  const S = await frisch();
  const p = S.sprich("Hallo");
  S.stille();
  assert.equal(await p, "abgebrochen");
  await warte();
  assert.equal(gesprochen.length, 0);
});

test("stimmen ohne Spaßstimmen, setzeStimme wirkt auf sprich", async () => {
  const S = await frisch();
  const liste = () => S.stimmen().map((s) => [s.name, s.gewaehlt]);
  assert.deepEqual(liste(), [["Anna", false], ["Anna (Premium)", true]]);
  const anna = S.stimmen()[0].schluessel;
  let ereignis = 0;
  window.addEventListener("stimmen", () => (ereignis += 1));
  S.setzeStimme(anna);
  assert.ok(ereignis >= 1);
  assert.deepEqual(liste(), [["Anna", true], ["Anna (Premium)", false]]);
  const p = S.sprich("Hallo");
  await warte();
  assert.equal(gesprochen.at(-1).voice, voices[0]);
  gesprochen.at(-1).onend();
  await p;
  S.setzeStimme("system");
  assert.deepEqual(liste(), [["Anna", false], ["Anna (Premium)", false]]);
  const q = S.sprich("Hallo");
  await warte();
  assert.equal(gesprochen.at(-1).voice, undefined);
  gesprochen.at(-1).onend();
  await q;
});

// ---------------------------------------------------------------- Audiodateien

/** Fake für HTMLAudioElement: merkt sich jede erzeugte Datei. */
let dateien;
class FakeAudio {
  constructor(src) {
    this.src = src;
    this.pausiert = false;
    this.onended = this.onerror = this.onloadedmetadata = null;
    this.ablehnen = FakeAudio.ablehnen;
    dateien.push(this);
  }
  play() {
    return this.ablehnen ? Promise.reject(new Error("NotAllowedError")) : Promise.resolve();
  }
  pause() {
    this.pausiert = true;
  }
}

function fakeAudio(texte, { ok = true } = {}) {
  dateien = [];
  FakeAudio.ablehnen = false;
  globalThis.Audio = FakeAudio;
  globalThis.fetch = async (url) => {
    assert.match(String(url), /\/spiele\/audio\/index\.json$/);
    return { ok, status: ok ? 200 : 404, json: async () => ({ stimme: "test", texte }) };
  };
}

function ohneAudio() {
  delete globalThis.Audio;
  delete globalThis.fetch;
}

test("sprich spielt die erzeugte Datei statt der Systemstimme", async (t) => {
  t.after(ohneAudio);
  fakeAudio({ "Hallo Ela": { datei: "test/ab.mp3" } });
  const S = await frisch();
  const p = S.sprich("  Hallo   Ela ");
  await warte();
  assert.equal(dateien.length, 1);
  assert.match(dateien[0].src, /\/spiele\/audio\/test\/ab\.mp3$/);
  assert.equal(gesprochen.length, 0);
  dateien[0].onended();
  assert.equal(await p, "gesprochen");
});

test("Datei darf eine Zahl enthalten, die Systemstimme nicht", async (t) => {
  t.after(ohneAudio);
  fakeAudio({ "Drei mal 7": { datei: "test/z.mp3" } });
  const S = await frisch();
  const p = S.sprich("Drei mal 7");
  await warte();
  dateien[0].onended();
  assert.equal(await p, "gesprochen");
  assert.equal(await S.sprich("Vier mal 7"), "still");
  assert.equal(gesprochen.length, 0);
});

test("Variante wählt eine eigene Datei", async (t) => {
  t.after(ohneAudio);
  fakeAudio({ "Der Hund bellt.": { datei: "test/n.mp3" }, "diktat|Der Hund bellt.": { datei: "test/d.mp3" } });
  const S = await frisch();
  S.sprich("Der Hund bellt.", { variante: "diktat" });
  await warte();
  assert.match(dateien[0].src, /d\.mp3$/);
});

test("ohne Datei spricht die Systemstimme", async (t) => {
  t.after(ohneAudio);
  fakeAudio({ "Anderes": { datei: "test/x.mp3" } });
  const S = await frisch();
  const p = S.sprich("Hallo");
  await warte();
  assert.equal(dateien.length, 0);
  assert.equal(gesprochen.length, 1);
  gesprochen[0].onend();
  assert.equal(await p, "gesprochen");
});

test("fehlendes Verzeichnis: Systemstimme", async (t) => {
  t.after(ohneAudio);
  fakeAudio({}, { ok: false });
  const S = await frisch();
  const p = S.sprich("Hallo");
  await warte();
  assert.equal(gesprochen.length, 1);
  gesprochen[0].onend();
  assert.equal(await p, "gesprochen");
});

test("blockierte Datei: Systemstimme springt ein", async (t) => {
  t.after(ohneAudio);
  fakeAudio({ Hallo: { datei: "test/h.mp3" } });
  FakeAudio.ablehnen = true;
  const S = await frisch();
  const p = S.sprich("Hallo");
  await warte();
  await warte();
  assert.equal(dateien.length, 1);
  assert.equal(gesprochen.length, 1);
  gesprochen[0].onend();
  assert.equal(await p, "gesprochen");
});

test("zweites sprich hält die laufende Datei an", async (t) => {
  t.after(ohneAudio);
  fakeAudio({ Eins: { datei: "test/1.mp3" }, Zwei: { datei: "test/2.mp3" } });
  const S = await frisch();
  const erstes = S.sprich("Eins");
  await warte();
  const zweites = S.sprich("Zwei");
  assert.equal(await erstes, "abgebrochen");
  assert.equal(dateien[0].pausiert, true);
  await warte();
  dateien[1].onended();
  assert.equal(await zweites, "gesprochen");
  S.stille();
});

test("Notbremse der Datei richtet sich nach ihrer Dauer", async (t) => {
  t.after(ohneAudio);
  mock.timers.enable({ apis: ["setTimeout"] });
  fakeAudio({ Hallo: { datei: "test/h.mp3" } });
  const S = await frisch();
  let fertig = null;
  S.sprich("Hallo").then((e) => (fertig = e));
  await warte();
  dateien[0].duration = 1.5;
  dateien[0].onloadedmetadata();
  mock.timers.tick(3499);
  await warte();
  assert.equal(fertig, null);
  mock.timers.tick(1);
  await warte();
  assert.equal(fertig, "gesprochen");
});

test("datei: false nimmt die Systemstimme, auch wenn es eine Datei gibt", async (t) => {
  t.after(ohneAudio);
  fakeAudio({ Hallo: { datei: "test/h.mp3" } });
  const S = await frisch();
  const p = S.sprich("Hallo", { datei: false });
  await warte();
  assert.equal(dateien.length, 0);
  assert.equal(gesprochen.length, 1);
  gesprochen[0].onend();
  assert.equal(await p, "gesprochen");
});
