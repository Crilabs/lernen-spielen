# Final-Fix-Report

1. Windows-Pfade: plattform-regel.test.mjs und lernsteuerung-runde.test.mjs nutzen fileURLToPath(new URL(...)); kein weiteres `.pathname` mit import.meta.url in tests/.
2. einstellungen.js: ladeEinstellungen memoisiert (Modul-Promise). Test "ladeEinstellungen ist idempotent" in kern-einstellungen.test.mjs.
3. geraet.js: Fallback bei plattform()-Fehler (update=!!tauri()?.updater, beenden=!!tauri()?.process, kiosk=beenden), Protokoll bleibt. Test (Kindprozess) in kern-geraet.test.mjs.
4. CHANGELOG/README: Handgriff mit Elternbereich-Knopf, Zeitpunkt nach dem Update, Ausnahmen eltern/geraet(.bak).
5. README: keine Versionsangabe zur PHP-Entfernung; CHANGELOG-Zeile unter Unveröffentlicht.
6. Stimmliste: Zeile "Automatisch (beste Stimme)" (setzeStimme("")) in eltern.html, wimmelbild.html, einhorn-steine.html; neue Funktion stimmWahl() in kern/stimme.js; Häkchen bei Stimmen nur, wenn nicht automatisch.

Befehle: `npm test` -> 257 pass / 0 fail; `cd src-tauri && cargo test` -> 13 pass.
Nicht getestet: UI der Stimmlisten (kein Browserlauf).
