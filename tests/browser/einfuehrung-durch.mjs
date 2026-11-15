// Jedes Spiel beginnt mit der Einführung (docs/spielbau.md §8), auch wenn das Kind sie schon gesehen hat. Prüfungen, die
// erst das Spielfeld brauchen, tippen hier wie das Kind „Weiter“, sobald der Knopf da ist (wie durchspielen.mjs).
//
// uhr: true, wenn die Seite mit seite.clock.install() läuft; dann rückt die Test-Uhr vor statt echt zu warten.

/**
 * @param {import("playwright").Page} seite
 * @param {string} ziel Selektor, der sichtbar sein soll, wenn das Spiel läuft (z. B. "#tablett .stab")
 * @param {{ uhr?: boolean, grenzeMs?: number }} [opt]
 */
export async function durchEinfuehrung(seite, ziel, { uhr = false, grenzeMs = 60_000 } = {}) {
  const t0 = Date.now();
  while (Date.now() - t0 < grenzeMs) {
    if (await seite.locator(ziel).first().isVisible()) return;
    await seite.evaluate(() => document.querySelector(".einf-weiter.da")?.click());
    if (uhr) await seite.clock.runFor(500);
    else await seite.waitForTimeout(200);
  }
  throw new Error(`Einführung: „${ziel}“ nach ${Math.round(grenzeMs / 1000)} s nicht sichtbar`);
}
