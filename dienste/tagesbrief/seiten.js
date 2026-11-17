// Kleine HTML-Seiten des Versanddienstes (Bestätigt, Abgemeldet, Datenschutz). Eltern sehen sie im Browser.

const seite = (/** @type {string} */ titel, /** @type {string} */ inhalt) => `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${titel}</title>
<style>body{margin:0;background:#F4F0FA;color:#3B2A6B;font:17px/1.5 system-ui,sans-serif}
main{max-width:560px;margin:12vh auto;background:#FFFCF7;padding:28px;border-radius:12px}
h1{font-size:24px;margin:0 0 12px}</style></head><body><main>${inhalt}</main></body></html>`;

export const bestaetigtSeite = () => seite("Bestätigt", "<h1>Bestätigt. Sie können das Fenster schließen.</h1>");
export const abgemeldetSeite = () => seite("Abgemeldet", "<h1>Abgemeldet.</h1><p>Es wird nichts mehr verschickt, alle gespeicherten Daten zu dieser Adresse sind gelöscht.</p>");
export const ungueltigSeite = () => seite("Link ungültig", "<h1>Link ungültig.</h1><p>Der Link ist abgelaufen oder wurde schon benutzt. Bitte richten Sie den Tagesbrief in der App noch einmal ein.</p>");
export const datenschutzSeite = () => seite("Datenschutz", `<h1>Datenschutz</h1>
<p>Der Tagesbrief der Lern-App schickt Ihnen einmal am Tag, was Ihr Kind gelernt hat.</p>
<p><b>Was gespeichert wird:</b> Ihre E-Mail-Adresse, der Vorname des Kindes (wenn Sie ihn angeben), die gewünschte Uhrzeit und, bis zum Versand, die Lernereignisse des Tages.</p>
<p><b>Wie lange:</b> Die Lernereignisse werden nach dem Versand gelöscht, spätestens nach 48 Stunden. Die zuletzt verschickten Anleitungen merkt sich der Dienst 14 Tage.</p>
<p><b>Wer betreibt den Dienst:</b> Crilabs, lernen-spielen.crilabs.de.</p>
<p><b>Abbestellen:</b> Jeder Brief enthält unten einen Link „Abbestellen“. Er löscht alle Daten zu Ihrer Adresse.</p>`);
