// Browser-Prüfung der Lernplan-Einführung (spiele/einfuehrung.js) ohne Nutzergeste, wie gleich nach dem Laden eines
// Spiels. Kein Teil von `npm test`: braucht Playwright und installierte Browser (Chromium, WebKit).
//
//   NODE_PATH=/private/tmp/claude-501/pw/node_modules node tests/browser/einfuehrung.spec.mjs
//
// Regression (Probelauf M14): In WebKit meldete eine Audiodatei nie „ended“; jede Szene wartete auf die
// 30-s-Notbremse, die Einführung „zerlegen“ (6 Szenen) dauerte über 2 Minuten und der Prüfstand
// meldete einen Hänger. Ursache war der Prüfserver: ohne Byte-Bereiche (Range) kennt WebKit die Dauer nicht (Infinity) und meldet nie
// „ended“. tests/browser/server.mjs kann Range; diese Prüfung hält das fest.
// Geprüft: die Einführung endet mit „gesehen“ in beiden Browsern in weniger als FRIST_MS, keine Szene dauert
// SZENE_MS oder länger, keine Seitenfehler; dazu spielt eine eigene Einführung im Spielordner (Pfad relativ zu spiele/,
// EINFUEHRUNG in spiele/vorlage/spiel.js) bis „gesehen“.

import { createRequire } from "node:module";
import { resolve } from "node:path";
import { starteServer } from "./server.mjs";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium, webkit } = require("playwright");

const WURZEL = resolve(fileURLToPath(import.meta.url), "../../..");
const SEITE = "/spiele/__einfuehrung-pruefen.html";   // gibt es nur in diesem Server
const HTML = `<!doctype html><meta charset="utf-8"><body><script type="module">
  import { spieleEinfuehrung } from "./einfuehrung.js";
  const t0 = performance.now();
  window.__szenen = [];   // Zeitpunkt jedes Szenenwechsels (Text der Blase ändert sich)
  new MutationObserver(() => {
    const b = document.querySelector(".einf .blase");
    if (b && b.textContent !== window.__letzte) { window.__letzte = b.textContent; window.__szenen.push(performance.now() - t0); }
  }).observe(document.body, { subtree: true, childList: true, characterData: true });
  window.__ergebnis = spieleEinfuehrung("einfuehrungen/zerlegen.json", { n: 7, h: 3, r: 4 })
    .then((e) => ({ e, ms: Math.round(performance.now() - t0) }));
</script>`;
// Eigene Einführung eines Spiels im Spielordner (EINFUEHRUNG in spiele/vorlage/spiel.js): Pfad relativ zu spiele/.
const EIGEN_JSON = "/spiele/mathe/m0-probe/einfuehrung.json";   // gibt es nur in diesem Server
const EIGEN_SEITE = "/spiele/mathe/m0-probe/index.html";
const EIGEN_HTML = `<!doctype html><meta charset="utf-8"><body><script type="module">
  import { spieleEinfuehrung } from "../../einfuehrung.js";
  window.__ergebnis = spieleEinfuehrung("mathe/m0-probe/einfuehrung.json", { n: 7 }, { ton: false });
</script>`;
const EIGEN = JSON.stringify({ szenen: [{ sprich: "Am Hafen liegen Kisten.", zeig: "{n} Kisten", bild: [{ zahl: "{n}", x: 60 }] }] });
const FRIST_MS = 75000;   // ganze Einführung
const SZENE_MS = 20000;   // eine Szene: Lesezeit bzw. Stimme; 30 s hieße, sie hat auf die Notbremse gewartet


let fehler = 0;
const server = await starteServer(WURZEL, { [SEITE]: HTML, [EIGEN_SEITE]: EIGEN_HTML, [EIGEN_JSON]: EIGEN });
const basis = `http://127.0.0.1:${server.address().port}`;
try {
  for (const typ of [chromium, webkit]) {
    const browser = await typ.launch();   // ohne Autoplay-Freigabe: wie eine frisch geladene Seite
    try {
      const seite = await browser.newPage();
      const seitenfehler = [];
      seite.on("pageerror", (e) => seitenfehler.push(String(e)));
      await seite.goto(basis + SEITE);
      const r = await seite.evaluate(() => Promise.race([
        window.__ergebnis,
        new Promise((ok) => setTimeout(() => ok({ e: "zu lang", ms: null }), 75000)),
      ]).then((x) => ({ ...x, szenen: window.__szenen.slice() })));
      const zeiten = [...r.szenen, r.ms ?? Infinity];
      const laengste = Math.round(Math.max(...zeiten.slice(1).map((t, i) => t - zeiten[i])));
      const gruen = r.e === "gesehen" && r.ms !== null && r.ms < FRIST_MS && laengste < SZENE_MS && seitenfehler.length === 0;
      if (!gruen) fehler++;
      console.log(`${gruen ? "grün" : "ROT "}  ${typ.name().padEnd(8)} Einführung „zerlegen“: ${r.e}, ${r.ms ?? "–"} ms, längste Szene ${laengste} ms${seitenfehler.length ? ", Fehler: " + seitenfehler.join(" | ") : ""}`);
      const eigen = await browser.newPage();
      await eigen.goto(basis + EIGEN_SEITE);
      const e = await eigen.evaluate(() => Promise.race([window.__ergebnis, new Promise((ok) => setTimeout(() => ok("zu lang"), 20000))]));
      if (e !== "gesehen") fehler++;
      console.log(`${e === "gesehen" ? "grün" : "ROT "}  ${typ.name().padEnd(8)} eigene Einführung im Spielordner (mathe/m0-probe/einfuehrung.json): ${e}`);
    } finally {
      await browser.close();
    }
  }
} finally {
  server.close();
}
process.exit(fehler ? 1 : 0);
