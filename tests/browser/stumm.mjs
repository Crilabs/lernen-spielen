// Stumme Prüf-Browser: Headless-Browser spielen Ton über die echten Lautsprecher ab. Laufen im Prüfstand mehrere
// parallel, sprechen Aufnahmen und Systemstimme durcheinander. Alle Browser der Prüfungen starten darum hier.
//
// Chromium bekommt --mute-audio. WebKit kennt keinen solchen Schalter; dort (und zur Sicherheit auch in Chromium)
// macht ein Init-Skript die Seite selbst leise, ohne den Ablauf zu ändern: Medien laufen mit Lautstärke 0
// weiter (ended, Zeiten, Fehler und Autoplay-Sperre wie sonst), Web Audio geht über einen Gain-Knoten mit 0, die Systemstimme spricht mit
// Lautstärke 0 und meldet start/end wie sonst. Prüfungen, die speechSynthesis.speak selbst ersetzen, bleiben gültig.

/** Läuft in jeder Seite vor deren Skripten. */
function leise() {
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function (...a) {
    this.volume = 0; // nicht muted: stumme Medien dürften ohne Geste starten, das verfälschte die Autoplay-Prüfungen
    return play.apply(this, a);
  };
  const connect = AudioNode.prototype.connect;
  const nullen = new WeakMap(); // AudioContext → Gain-Knoten mit 0 vor seinem Ausgang
  AudioNode.prototype.connect = function (ziel, ...a) {
    if (ziel instanceof AudioDestinationNode) {
      let null0 = nullen.get(ziel.context);
      if (!null0) {
        null0 = ziel.context.createGain();
        null0.gain.value = 0;
        connect.call(null0, ziel);
        nullen.set(ziel.context, null0);
      }
      connect.call(this, null0, ...a);
      return ziel;
    }
    return connect.call(this, ziel, ...a);
  };
  if (window.speechSynthesis) {
    const speak = window.speechSynthesis.speak.bind(window.speechSynthesis);
    window.speechSynthesis.speak = (u) => {
      u.volume = 0;
      speak(u);
    };
  }
}

/**
 * Startet einen Browser wie typ.launch(optionen), aber stumm. Jeder Kontext und jede Seite daraus ist leise.
 * @param {import("playwright").BrowserType} typ
 * @param {import("playwright").LaunchOptions} [optionen]
 */
export async function starteStumm(typ, optionen = {}) {
  const chromium = typ.name() === "chromium";
  const browser = await typ.launch(chromium ? { ...optionen, args: [...(optionen.args ?? []), "--mute-audio"] } : optionen);
  const newContext = browser.newContext.bind(browser);
  browser.newContext = async (...a) => {
    const kontext = await newContext(...a);
    await kontext.addInitScript(leise);
    return kontext;
  };
  // browser.newPage legt seinen Kontext intern an, nicht über newContext.
  const newPage = browser.newPage.bind(browser);
  browser.newPage = async (...a) => {
    const seite = await newPage(...a);
    await seite.context().addInitScript(leise);
    return seite;
  };
  return browser;
}
