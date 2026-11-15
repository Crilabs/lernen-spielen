#!/usr/bin/env node
// Bauheft eines Spiels (docs/spielbau.md §7): alles, was Idee, Bau und Prüfung brauchen, in einer Datei von etwa
// 10 000–15 000 Token statt der ganzen Dokumente (rund 850 KB). Aus dem Repo zusammengeschnitten, nichts erfunden:
//
//   node werkzeuge/spielbau/bauheft.mjs <Katalog-Id> [--aus <datei.md>]
//
// Inhalt: die Regeln (docs/spielbau.md, Block „regeln“), der Katalog-Eintrag, die Themen des Spiels (Ziel, Beispiele,
// Stufen, Aufgabenart), was es schon gibt (Bausteine, Objekte, Aufgabenarten, Runde) und ein vorhandenes Spiel derselben Id.
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const lies = (p, wurzel = WURZEL) => readFileSync(join(wurzel, p), "utf8");

/** Fach aus dem Buchstaben der Katalog-Id (docs/spielkatalog.md §5). */
export const FAECHER = { M: "mathe", R: "geometrie", L: "lesen", Z: "sprechen", S: "schreiben", G: "grammatik" };

/** Ordnername wie „m37-kettenhuepfer“ aus Id und Name. */
export function ordnername(id, name) {
  const klein = name
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${id.toLowerCase()}-${klein}`;
}

/** Text von „### <Id> …“ bis zur nächsten Überschrift gleicher oder höherer Ebene. */
export function katalogEintrag(id, wurzel = WURZEL) {
  const ordner = join(wurzel, "docs/spielkatalog");
  for (const datei of readdirSync(ordner).filter((d) => d.endsWith(".md")).sort()) {
    const text = readFileSync(join(ordner, datei), "utf8");
    const m = text.match(new RegExp(`^### ${id} (.+)$`, "m"));
    if (!m) continue;
    const ab = text.slice(m.index);
    const ende = ab.slice(4).search(/^#{1,3} /m);
    return { datei: `docs/spielkatalog/${datei}`, name: m[1].trim(), text: (ende < 0 ? ab : ab.slice(0, ende + 4)).trim() };
  }
  return null;
}

/** Die Ids aus der Zeile „Hauptthemen: a, b, c (Kl. …)“. */
export function hauptthemen(eintrag) {
  const z = eintrag.match(/^- Hauptthemen: (.+)$/m);
  if (!z) return [];
  return z[1].replace(/\([^)]*\)/g, "").split(",").map((s) => s.trim()).filter((s) => /^[a-z0-9-]+$/.test(s));
}

/** Der Block zwischen <!-- regeln --> und <!-- ende regeln --> aus docs/spielbau.md. */
export function regeln(wurzel = WURZEL) {
  const m = lies("docs/spielbau.md", wurzel).match(/<!-- regeln -->\n([\s\S]*?)\n<!-- ende regeln -->/);
  if (!m) throw new Error("docs/spielbau.md: Block <!-- regeln --> … <!-- ende regeln --> fehlt");
  return m[1].trim();
}

/** Zeilen der Bausteintabelle in docs/bedienung.md §9, gekürzt auf Name und Aufgabe. */
export function bausteine(wurzel = WURZEL) {
  const t = lies("docs/bedienung.md", wurzel);
  const a = t.indexOf("## 9. Bausteine");
  const b = t.indexOf("\n- **Aussehen", a);
  return t.slice(a, b).split("\n").filter((z) => z.startsWith("| `"))
    .map((z) => z.split("|").map((s) => s.trim()))
    .map(([, name, aufgabe]) => `- ${name}: ${aufgabe.length > 160 ? aufgabe.slice(0, 157) + "…" : aufgabe}`);
}

/** Gemeinsame Spielobjekte (spiele/objekte/*.js außer objekt.js). */
export function objekte(wurzel = WURZEL) {
  return readdirSync(join(wurzel, "spiele/objekte")).filter((d) => d.endsWith(".js") && d !== "objekt.js").map((d) => d.slice(0, -3)).sort();
}

/** Aufgabenarten mit Zielzeit (spiele/aufgabenarten.js, ZIEL_MS). */
export async function aufgabenarten(wurzel = WURZEL) {
  const m = await import(pathToFileURL(join(wurzel, "spiele/aufgabenarten.js")).href);
  return Object.keys(m.ZIEL_MS ?? {});
}

/** Baut das Bauheft als Markdown. */
export async function bauheft(id, wurzel = WURZEL) {
  const eintrag = katalogEintrag(id, wurzel);
  if (!eintrag) throw new Error(`Katalog-Id ${id} nicht gefunden (docs/spielkatalog/*.md, „### ${id} …“)`);
  const fach = FAECHER[id[0]];
  const ordner = ordnername(id, eintrag.name);
  const plan = JSON.parse(lies("spiele/lernplan.json", wurzel));
  const ids = hauptthemen(eintrag.text);
  const themen = ids.map((t) => plan.themen.find((x) => x.id === t)).filter(Boolean);
  const fehlend = ids.filter((t) => !plan.themen.some((x) => x.id === t));
  const einstieg = themen.length ? Math.min(...themen.map((t) => t.klasse)) : null;
  const spiele = JSON.parse(lies("spiele/spiele.json", wurzel));
  const liste = Array.isArray(spiele) ? spiele : spiele.spiele ?? [];
  const vorhanden = liste.find((s) => s.datei?.startsWith(`${fach}/${ordner}/`));
  const arten = await aufgabenarten(wurzel);

  const thema = (t) => {
    const teile = [`**${t.id}** „${t.name}“ · Kl. ${t.klasse}`];
    if (t.stufen?.length) teile.push(`Stufen ${t.stufen.join(", ")}`);
    teile.push(t.aufgaben ? `Aufgaben ${JSON.stringify(t.aufgaben)}` : "Aufgaben: noch keine Art");
    const z = [`- ${teile.join(" · ")}`];
    if (t.ziel) z.push(`  - Ziel: ${t.ziel}`);
    if (t.beispiele?.length) z.push(`  - Beispiele: ${t.beispiele.join(" · ")}`);
    if (t.zweck) z.push(`  - Wozu im Leben: ${t.zweck}`);
    return z.join("\n");
  };

  return [
    `# Bauheft ${id} „${eintrag.name}“`,
    "",
    `Fach \`${fach}\` · Spielordner \`spiele/${fach}/${ordner}/\` · Idee \`docs/spiele/${fach}/${ordner}.md\` · ` +
      `Katalog \`${eintrag.datei}\`. Erzeugt von \`werkzeuge/spielbau/bauheft.mjs\`; nur dieses Heft ist Pflicht, ` +
      "die Dokumente dahinter liest du nur, wenn du eine Einzelheit brauchst.",
    "",
    "## Regeln",
    "",
    regeln(wurzel),
    "",
    "## Katalog-Eintrag (Stoff und Idee, kein Bauplan)",
    "",
    "Der Eintrag sagt, **was** gelernt wird (Themen, Fehlerkontrolle, Lernzeichen). Wie das Spiel sich anfühlt, " +
      "entscheidet der Spielkern (Regeln §1). Was mit „Christian“ und Datum markiert ist, ist gesetzt; Sachwelten gehören " +
      "nicht ins Spiel (Regeln §6). Packungen, Listen und " +
      "Zusätze aus dem Eintrag sind Vorschläge, die du weglassen darfst.",
    "",
    eintrag.text,
    "",
    "## Themen",
    "",
    `Zuerst gebaut: die Themen der Einstiegsklasse (Kl. ${einstieg ?? "?"}), die schon eine Aufgabenart haben ` +
      `(${themen.filter((t) => t.klasse === einstieg && t.aufgaben).map((t) => t.id).join(", ") || "keine"}), auf allen ihren Stufen. ` +
      "Die übrigen kommen später; die Daten des Spiels sollen sie tragen können.",
    "",
    ...themen.map(thema),
    ...(fehlend.length ? ["", `Nicht im Lernplan: ${fehlend.join(", ")}`] : []),
    "",
    "## Was es schon gibt",
    "",
    "Bausteine (`spiele/rahmen/`, Einzelheiten in `docs/bedienung.md` §9):",
    ...bausteine(wurzel),
    "",
    `Gemeinsame Objekte (\`spiele/objekte/\`, Schnittstelle \`<ls-objekt art zustand>\`): ${objekte(wurzel).join(", ")}.`,
    "",
    `Aufgabenarten (\`spiele/aufgabenarten.js\`): ${arten.join(", ")}.`,
    "",
    "Runde (`spiele/runde/`, `docs/figuren.md`): Ela (Brille, klettert), Kofi (rennt, springt), Lena (Hörgeräte, " +
      "hüpft), Timo (Rollstuhl, schnell, trägt Dinge auf dem Schoß). Galerie: `spiele/runde/galerie.html`.",
    "",
    "Vorlage: `spiele/vorlage/` (Kopf von `spiel.js`: Schritte 1–7, RAHMEN und SPIELWELT). Ein fertiges Spiel zum " +
      "Nachsehen: `spiele/mathe/m37-kettenhuepfer/`.",
    ...(vorhanden
      ? ["", `**Es gibt dieses Spiel schon** (\`spiele/${vorhanden.datei}\`, Eintrag \`${vorhanden.id}\` in ` +
        "`spiele/spiele.json`). Es wird neu gebaut: Übernimm, was dem Spielkern dient (Lernsteuerung, Test-Schnittstelle, " +
        "Daten), und lass weg, was ihn verdeckt. Id, Ordner und Themen bleiben."]
      : []),
    "",
  ].join("\n");
}

async function main() {
  const argv = process.argv.slice(2);
  const id = argv.find((a) => !a.startsWith("--"));
  const aus = argv.includes("--aus") ? argv[argv.indexOf("--aus") + 1] : null;
  if (!id) throw new Error("Aufruf: node werkzeuge/spielbau/bauheft.mjs <Katalog-Id> [--aus <datei.md>]");
  const text = await bauheft(id.toUpperCase());
  if (aus) {
    mkdirSync(dirname(resolve(aus)), { recursive: true });
    writeFileSync(resolve(aus), text);
    console.log(`${aus}: ${text.length} Zeichen (etwa ${Math.round(text.length / 3.6)} Token)`);
  } else process.stdout.write(text);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main().catch((e) => { console.error(e.message); process.exit(1); });
