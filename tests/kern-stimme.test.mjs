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
  const p = S.sprich("Hallo Einhorn", { tempo: 0.9 });
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
  const text = "Hallo Einhorn";
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
