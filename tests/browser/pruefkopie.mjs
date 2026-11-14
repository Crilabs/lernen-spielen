// Prüft die Spielvorlage in der Tiefe eines echten Spiels (docs/spielentwicklung.md „Ablage“): kopiert
// spiele/vorlage/ nach spiele/mathe/m99-pruefkopie/, macht jedes „../“ zu „../../“ (wie der Kopf von spiele/vorlage/spiel.js
// es verlangt), lässt den Prüfstand (durchspielen.mjs) darüber laufen und löscht die Kopie danach wieder – auch bei Rot
// oder Abbruch. So fällt auf, wenn ein Baustein oder Dienst seine Dateien relativ zur Seite statt zu sich selbst sucht.
// Kein Teil von `npm test`: braucht Playwright und installierte Browser.
//
//   NODE_PATH=/private/tmp/claude-501/pw/node_modules node tests/browser/pruefkopie.mjs [Argumente für durchspielen.mjs]
//
// Ohne Argumente: alle Kinder in Chromium und WebKit bei 1920 × 1080 (die zweite Größe prüft durchspielen der Vorlage selbst).

import { cp, readFile, readdir, rm, rmdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const WURZEL = resolve(fileURLToPath(import.meta.url), "../../..");
const VORLAGE = join(WURZEL, "spiele/vorlage");
const KOPIE = join(WURZEL, "spiele/mathe/m99-pruefkopie");
const SEITE = "spiele/mathe/m99-pruefkopie/index.html";
const FACH = join(WURZEL, "spiele/mathe");

/** Jedes „../“, das nicht schon Teil von „../../“ ist, eine Ebene tiefer. @param {string} text */
export const tiefer = (text) => text.replace(/(?<![./])\.\.\//g, "../../");

async function aufraeumen() {
  await rm(KOPIE, { recursive: true, force: true });
  // Den Fachordner nur löschen, wenn die Kopie ihn angelegt hat und er leer ist.
  if (!fachGab && existsSync(FACH) && (await readdir(FACH)).length === 0) await rmdir(FACH);
}

const fachGab = existsSync(FACH);
if (existsSync(KOPIE)) {
  console.error(`${KOPIE} gibt es schon (Rest eines abgebrochenen Laufs?) – bitte prüfen und löschen.`);
  process.exit(2);
}

let code = 1;
const abbruch = () => { aufraeumen().finally(() => process.exit(130)); };
process.on("SIGINT", abbruch);
process.on("SIGTERM", abbruch);
try {
  await cp(VORLAGE, KOPIE, { recursive: true });
  for (const datei of ["index.html", "spiel.js"]) {
    const pfad = join(KOPIE, datei);
    await writeFile(pfad, tiefer(await readFile(pfad, "utf8")));
  }
  const args = process.argv.slice(2);
  const rest = args.length ? args : ["--groessen", "1920x1080"];
  code = await new Promise((ok) => {
    const kind = spawn(process.execPath, [join(WURZEL, "tests/browser/durchspielen.mjs"), SEITE, ...rest], { stdio: "inherit", env: process.env });
    kind.on("exit", (c) => ok(c ?? 1));
  });
} finally {
  await aufraeumen();
}
console.log(existsSync(KOPIE) ? "Kopie NICHT gelöscht" : `Kopie gelöscht; Prüfstand ${code === 0 ? "grün" : "rot"} (${code}).`);
process.exit(code);
