// Kleine HTML-Seiten des Versanddienstes (Bestätigt, Abgemeldet, Datenschutz). Eltern sehen sie im Browser.

const seite = (/** @type {string} */ titel, /** @type {string} */ inhalt) => `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${titel}</title>
<style>body{margin:0;background:#F4F0FA;color:#3B2A6B;font:17px/1.5 system-ui,sans-serif}
main{max-width:560px;margin:12vh auto;background:#FFFCF7;padding:28px;border-radius:12px}
h1{font-size:24px;margin:0 0 12px}</style></head><body><main>${inhalt}</main></body></html>`;

export const bestaetigtSeite = () => seite("Bestätigt", "<h1>Bestätigt. Sie können das Fenster schließen.</h1>");
export const abgemeldetSeite = () => seite("Abgemeldet", "<h1>Abgemeldet.</h1><p>An diese Adresse wird nichts mehr verschickt. Ist keine Adresse mehr übrig, sind auch alle gespeicherten Daten gelöscht.</p>");
export const ungueltigSeite = () => seite("Link ungültig", "<h1>Link ungültig.</h1><p>Der Link ist abgelaufen oder wurde schon benutzt. Bitte richten Sie den Tagesbrief in der App noch einmal ein.</p>");
export const datenschutzSeite = () => seite("Datenschutz", `<h1>Datenschutz</h1>
<p>Der Tagesbrief der Lern-App schickt Ihnen einmal am Tag, was Ihr Kind gelernt hat.</p>
<p><b>Was gespeichert wird:</b> Ihre E-Mail-Adresse und die weiterer Empfänger (höchstens vier je Familie, jede bestätigt), der Vorname des Kindes (wenn Sie ihn angeben), die gewünschte Uhrzeit und, bis zum Versand, die Lernereignisse des Tages.</p>
<p><b>Wie lange:</b> Die Lernereignisse werden nach dem Versand gelöscht, spätestens nach 48 Stunden. Die zuletzt verschickten Anleitungen merkt sich der Dienst 14 Tage.</p>
<p><b>Wer betreibt den Dienst:</b> Crilabs, lernen-spielen.crilabs.de.</p>
<p><b>Abbestellen:</b> Jeder Brief enthält unten einen Link „Abbestellen“. Er entfernt nur Ihre Adresse; ist keine Adresse mehr übrig, werden alle Daten gelöscht.</p>`);

/** Eine Seite mit einem Knopf; der Aufruf per GET ändert nichts, erst das Formular (POST) tut es. */
const knopfSeite = (/** @type {string} */ titel, /** @type {string} */ text, /** @type {string} */ aktion, /** @type {string} */ knopf, /** @type {string} */ token) =>
  seite(titel, `<h1>${titel}</h1><p>${text}</p><form method="post" action="${aktion}"><input type="hidden" name="t" value="${esc(token)}"><button type="submit" style="font:inherit;padding:10px 20px;border-radius:8px;border:0;background:#3B2A6B;color:#FFFCF7">${knopf}</button></form>`);

export const esc = (/** @type {string} */ s) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export const WEITERES_GERAET = "Ein weiteres Gerät möchte den Tagesbrief für diese Adresse erhalten. Wenn Sie das nicht veranlasst haben, bestätigen Sie nicht.";
/** Hinweis in Mail und Knopfseite, wenn eine Adresse den Tagesbrief zusätzlich bekommen soll. @param {string} name Name des Kindes oder leer */
export const zusaetzlichText = (name) => `Sie sollen den Tagesbrief für ${name.trim() || "ein Kind"} zusätzlich erhalten. Wenn Sie das nicht erwartet haben, bestätigen Sie nicht.`;
export const bestaetigenFrage = (/** @type {string} */ token, /** @type {string} */ hinweis = "") => knopfSeite("Tagesbrief bestätigen", `${hinweis ? `${esc(hinweis)} ` : ""}Bitte bestätigen Sie, dass Sie den Tagesbrief der Lern-App erhalten möchten.`, "/bestaetigen", "Bestätigen", token);
export const abmeldenFrage = (/** @type {string} */ token) => knopfSeite("Tagesbrief abbestellen", "Damit wird an diese Adresse nichts mehr verschickt. Ist keine Adresse mehr übrig, werden alle gespeicherten Daten gelöscht.", "/abmelden", "Abbestellen", token);
