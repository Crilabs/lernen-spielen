// Warteschlange der Verwaltung (docs/superpowers/specs/2026-11-16-verwaltung-design.md, „Aufträge“).
// Reine Listenfunktionen (geben neue Listen zurück) und Lesen/Schreiben von werkzeuge/verwaltung/auftraege.json.

import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";

export const ARTEN = ["spiel", "echte-dinge", "buch", "einfuehrung", "frei", "ideen"];
export const STATUS = ["wartet", "laeuft", "erledigt", "wartet-auf-christian", "beantwortet", "fehlgeschlagen", "gestrichen"];

/** Schätzung für einen Antwort-Auftrag (Fortsetzen mit Christians Antwort: Merge, Nachprüfung o. ä.). */
export const SCHAETZUNG_ANTWORT = 2;

const SKILL_JE_ART = {
  spiel: ".claude/skills/spiel-entwickeln/SKILL.md",
  "echte-dinge": ".claude/skills/mit-echten-dingen/SKILL.md",
  ideen: ".claude/skills/spielideen/SKILL.md",
  buch: ".claude/skills/sachgeschichte/SKILL.md",
};

const ID = /^[A-Za-z0-9-]+$/;

/** Der Text, mit dem der Lauf Claude beauftragt. */
export function befehlFuer(art, ziel) {
  const liste = Array.isArray(ziel) ? ziel : [ziel];
  switch (art) {
    case "spiel": return `Spiel entwickeln ${liste[0]}`;
    case "echte-dinge": return `Mit echten Dingen ${liste.join(" ")}`;
    case "buch": return `Sachgeschichte ${liste[0]}`;
    case "einfuehrung":
      return `Einführung für Thema ${liste[0]} nach den Vorlagen in spiele/einfuehrungen/ und dem Feld einfuehrung im Lernplan`;
    case "frei": return String(ziel);
    case "ideen": return `Spielideen ${liste[0]}`;
    default: throw new Error(`Art muss ${ARTEN.join(", ")} sein (war: ${art})`);
  }
}

/** Legt einen wartenden Auftrag an; prüft Art und Ziel. */
export function neuerAuftrag({ art, ziel, schaetzung_eur = null }, jetzt = new Date()) {
  if (!ARTEN.includes(art)) throw new Error(`Art muss ${ARTEN.join(", ")} sein (war: ${art})`);
  const liste = Array.isArray(ziel) ? ziel : [ziel];
  const leer = !liste.length || liste.some((z) => typeof z !== "string" || !z.trim());
  if (leer) throw new Error("Ziel fehlt");
  if (art !== "frei" && !liste.every((z) => ID.test(z))) throw new Error(`Ziel muss eine Id sein (war: ${liste.join(" ")})`);
  if (art !== "echte-dinge" && liste.length > 1) throw new Error("Ziel: nur eine Id für diese Art");
  return {
    id: `a-${jetzt.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
    art,
    ziel: art === "echte-dinge" ? liste : liste[0],
    befehl: befehlFuer(art, ziel),
    schaetzung_eur,
    angelegt: jetzt.toISOString(),
    status: "wartet",
    gestartet: null,
    beendet: null,
    ergebnis: null,
    notiz: "",
  };
}

/** Verschiebt einen Auftrag um eine Stelle (-1 hoch, 1 runter). */
export function verschiebe(liste, id, richtung) {
  const i = liste.findIndex((a) => a.id === id);
  const j = i + richtung;
  if (i < 0 || j < 0 || j >= liste.length) return [...liste];
  const neu = [...liste];
  [neu[i], neu[j]] = [neu[j], neu[i]];
  return neu;
}

/** Streicht einen wartenden Auftrag; andere bleiben unverändert. */
export function streiche(liste, id) {
  return liste.map((a) => (a.id === id && a.status === "wartet" ? { ...a, status: "gestrichen" } : a));
}

function wartetAufAntwort(liste, id) {
  const i = liste.findIndex((x) => x.id === id);
  if (i < 0) throw new Error("Auftrag nicht gefunden");
  if (liste[i].status !== "wartet-auf-christian") throw new Error("Auftrag wartet nicht auf eine Antwort");
  return i;
}

/** Befehl für den Lauf, der einen geparkten Auftrag mit Christians Antwort fortsetzt. */
export function befehlAntwort(alt, text) {
  const art = alt.ursprung_art ?? alt.art;
  const skill = SKILL_JE_ART[art];
  return [
    "Antwort von Christian auf einen Auftrag der Verwaltung, der auf ihn gewartet hat.",
    `Ursprünglicher Auftrag: ${alt.befehl}`,
    `Ergebnis damals: ${alt.ergebnis?.zusammenfassung ?? "–"}`,
    `Frage: ${alt.ergebnis?.frage ?? "–"}`,
    `Antwort von Christian: ${text}`,
    "",
    `Setze den ursprünglichen Auftrag mit dieser Antwort fort${skill ? ` und halte dich an ${skill} (auch an dessen Abschnitt „Lauf aus der Verwaltung“)` : ""}. ` +
      "Tu nur, was die Antwort freigibt oder verlangt; frag nicht zurück. Ist danach noch etwas offen, das nur Christian entscheiden kann, parke es mit einer Frage.",
    'Schreib als Letztes werkzeuge/verwaltung/ergebnisse/<auftrag>.json (<auftrag> = Wert von $VERWALTUNG_AUFTRAG): ' +
      '{ "status": "erledigt"|"geparkt"|"abgebrochen", "zusammenfassung": "<ein Satz: was, Ergebnis, Kosten>", "frage": "<nur bei geparkt>" }.',
  ].join("\n");
}

/** Christian beantwortet einen wartenden Auftrag: Folgeauftrag ans Ende, der alte wird „beantwortet“. */
export function beantworte(liste, id, text, jetzt = new Date()) {
  const antwort = String(text ?? "").trim();
  if (!antwort) throw new Error("Antwort fehlt");
  if (antwort.length > 4000) throw new Error("Antwort zu lang (höchstens 4000 Zeichen)");
  const i = wartetAufAntwort(liste, id);
  const alt = liste[i];
  const neu = {
    id: `a-${jetzt.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
    art: "antwort", ziel: alt.id, ursprung_art: alt.ursprung_art ?? alt.art, befehl: befehlAntwort(alt, antwort),
    schaetzung_eur: SCHAETZUNG_ANTWORT, angelegt: jetzt.toISOString(), status: "wartet",
    gestartet: null, beendet: null, ergebnis: null, notiz: "",
  };
  const kopie = liste.map((x, j) => (j === i ? { ...x, status: "beantwortet", notiz: `Antwort: ${antwort}` } : x));
  return { liste: [...kopie, neu], neu };
}

/** Text der Vorgabe: alle Skizzen und darunter Christians Wahl (Karte oder eigener Text). */
function vorgabeText(ideen, wahl) {
  const skizzen = ideen.map((x, i) => `### ${i + 1}. ${x.titel}\n\n${x.text}`).join("\n\n");
  return ["# Vorgabe von Christian", "", "## Die drei Skizzen", "", skizzen || "(keine)", "", "## Wahl", "", wahl, ""].join("\n");
}

/**
 * Christian wählt eine Spielidee (Karte 1..n) oder schreibt seine eigene: Der Ideen-Auftrag wird „beantwortet“, direkt
 * dahinter steht ein Spiel-Auftrag mit Vorgabe (docs/superpowers/specs/2026-11-17-spielideen-design.md). Den Text der
 * Vorgabe schreibt der Server nach werkzeuge/verwaltung/vorgaben/<neu.id>.md.
 * @param {{ karte?: number, text?: string }} wahl
 */
export function waehleIdee(liste, id, wahl, jetzt = new Date()) {
  const i = wartetAufAntwort(liste, id);
  const alt = liste[i];
  if (alt.art !== "ideen") throw new Error("Auftrag ist kein Ideen-Auftrag");
  const ideen = Array.isArray(alt.ergebnis?.ideen) ? alt.ergebnis.ideen : [];
  let text, notiz;
  if (wahl?.karte !== undefined) {
    const n = Number(wahl.karte);
    if (!Number.isInteger(n) || n < 1 || n > ideen.length) throw new Error(`Karte muss zwischen 1 und ${ideen.length} liegen`);
    text = `Karte ${n} „${ideen[n - 1].titel}“`;
    notiz = `Wahl: ${text}`;
  } else {
    text = String(wahl?.text ?? "").trim();
    if (!text) throw new Error("Eigene Idee fehlt");
    if (text.length > 4000) throw new Error("Eigene Idee zu lang (höchstens 4000 Zeichen)");
    notiz = "Wahl: eigene Idee";
  }
  const neu = neuerAuftrag({ art: "spiel", ziel: alt.ziel, schaetzung_eur: null }, jetzt);
  neu.befehl = `${neu.befehl} --vorgabe werkzeuge/verwaltung/vorgaben/${neu.id}.md`;
  neu.vorgabe = vorgabeText(ideen, text);
  const kopie = liste.map((x, j) => (j === i ? { ...x, status: "beantwortet", notiz } : x));
  kopie.splice(i + 1, 0, neu);
  return { liste: kopie, neu };
}

/** Christian lehnt ab: kein Lauf, der Auftrag ist erledigt. */
export function lehneAb(liste, id) {
  const i = wartetAufAntwort(liste, id);
  return liste.map((x, j) => (j === i ? { ...x, status: "erledigt", notiz: "abgelehnt" } : x));
}

export const naechsterWartender = (liste) => liste.find((a) => a.status === "wartet") ?? null;

/** Status eines Auftrags aus der Ergebnisdatei des Skills (null = keine Datei). */
export function statusAusErgebnis(ergebnis) {
  switch (ergebnis?.status) {
    case "gruen": case "erledigt": return "erledigt";
    case "freigabe": case "geparkt": return "wartet-auf-christian";
    default: return "fehlgeschlagen";
  }
}

export function ladeAuftraege(datei) {
  if (!existsSync(datei)) return [];
  try {
    const l = JSON.parse(readFileSync(datei, "utf8"));
    if (!Array.isArray(l)) throw new Error("keine Liste");
    return l;
  } catch {
    throw new Error(`auftraege.json ist kein gültiges JSON (${datei}); bitte von Hand prüfen`);
  }
}

/** Schreibt über eine Zwischendatei, damit ein Abbruch nie eine halbe Datei hinterlässt. */
export function speichereAuftraege(datei, liste) {
  const tmp = `${datei}.tmp-${process.pid}`;
  writeFileSync(tmp, JSON.stringify(liste, null, 1) + "\n");
  renameSync(tmp, datei);
}
