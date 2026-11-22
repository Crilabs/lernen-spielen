// Verwaltung (docs/superpowers/specs/2026-11-16-verwaltung-design.md): führt Lernplan, Spielkatalog, Verzeichnisse
// und Kosten zu einer Übersicht zusammen. liesQuellen liest (IO), baueUebersicht ist reine Logik.
// Zahlen kommen nur aus werkzeuge/kosten/kosten.mjs, damit Seite und `npm run kosten` gleich zählen.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { hauptthemen } from "../spielbau/bauheft.mjs";
import { stueckVon } from "./rueckmeldung.mjs";
import {
  findeBuecher, findeSpielordner, katalogAnzahl, liesGeparkte, liesKosten, prognose, prognoseAnalog, prognoseBuecher, summen,
} from "../kosten/kosten.mjs";

/** @typedef {"fertig"|"probe"|"geparkt"|"entwurf"|"beauftragt"|"geplant"|"fehlt"} Status */

/** Ein Spiel ohne fertiges Vorbild wird so geschätzt (Zielspanne 5–10 € im Skill „Spiel entwickeln“). */
export const SPIEL_SCHAETZUNG_OHNE_DATEN = 7.5;

/** Die Abschnitte „### <Id> <Name>“ einer Katalogdatei mit ihren Hauptthemen. */
export function katalogAbschnitte(text, datei) {
  const treffer = [...text.matchAll(/^### ([A-Z]+\d+) (.+)$/gm)];
  return treffer.map((m, i) => {
    const ende = i + 1 < treffer.length ? treffer[i + 1].index : text.length;
    const block = text.slice(m.index, ende).split(/\n#{1,3} /)[0];
    return { id: m[1], name: m[2].trim(), datei, hauptthemen: hauptthemen(block) };
  });
}

const json = (wurzel, p) => JSON.parse(readFileSync(join(wurzel, p), "utf8"));

/** Liest alles, was die Übersicht braucht, aus dem Repo. */
export function liesQuellen(wurzel) {
  const katalogOrdner = join(wurzel, "docs/spielkatalog");
  const katalog = readdirSync(katalogOrdner).filter((d) => d.endsWith(".md")).sort()
    .flatMap((d) => katalogAbschnitte(readFileSync(join(katalogOrdner, d), "utf8"), `docs/spielkatalog/${d}`));
  const spiele = findeSpielordner(wurzel)
    .filter((o) => existsSync(join(o, "kosten.json")))
    .map((o) => ({ name: o.slice(join(wurzel, "spiele").length + 1), eintraege: liesKosten(o) }));
  return {
    plan: json(wurzel, "spiele/lernplan.json"),
    spieleJson: json(wurzel, "spiele/spiele.json"),
    katalog,
    katalogUebersicht: readFileSync(join(wurzel, "docs/spielkatalog.md"), "utf8"),
    echteDinge: json(wurzel, "spiele/mit-echten-dingen/verzeichnis.json"),
    bibliothek: json(wurzel, "spiele/bibliothek.json"),
    geschichten: json(wurzel, "spiele/geschichten/index.json"),
    kosten: {
      spiele,
      geparkt: liesGeparkte(wurzel),
      analog: liesKosten(join(wurzel, "spiele/mit-echten-dingen")),
      buecher: findeBuecher(wurzel),
      bibliothek: liesKosten(join(wurzel, "spiele/bibliothek")),
    },
    preise: json(wurzel, "werkzeuge/kosten/preise.json"),
  };
}

/** Katalog-Id aus einem Ordnernamen wie „m37-kettenhuepfer“ (auch „mathe/m37-…“, „geparkt/m37-…“). */
export function idAusOrdner(name) {
  const m = name.split("/").pop()?.match(/^([a-z]+\d+)-/);
  return m ? m[1].toUpperCase() : null;
}

const offen = (a) => a.status === "wartet" || a.status === "laeuft";
const ziele = (a) => (Array.isArray(a.ziel) ? a.ziel : [a.ziel]);

/**
 * Die Übersicht für die Seite.
 * @param {any} q Quellen aus liesQuellen
 * @param {{ art: string, ziel: string|string[], status: string }[]} auftraege
 */
export function baueUebersicht(q, auftraege) {
  const beauftragt = (art, id) => auftraege.some((a) => offen(a) && a.art === art && ziele(a).includes(id));
  // Ideen sind auch offen, solange sie auf Christians Wahl warten – sonst gäbe es zwei Ideen-Aufträge für ein Spiel.
  // Eine offene Antwort oder Änderung gehört zum Stück ihres Ursprungs (z. B. G02 nach dem Parken: sonst „geplant“ mit „+“).
  const stueckOffen = (bereich, id) => auftraege.some((a) => offen(a) && (a.art === "antwort" || a.art === "aenderung")
    && (() => { const s = stueckVon(auftraege, a); return !!s && s.bereich === bereich && s.ids.includes(id); })());
  const ideenOffen = (id) => auftraege.some((a) => (offen(a) || a.status === "wartet-auf-christian") && a.art === "ideen" && ziele(a).includes(id));

  // Spiele: Katalog-Abschnitte, dazu fertige (spiele.json), geparkte und Kosten
  const imSpieleJson = new Map(q.spieleJson.spiele.map((s) => [idAusOrdner(s.datei.split("/").slice(0, -1).join("/")), s]));
  const imOrdner = new Set(q.kosten.spiele.map((s) => idAusOrdner(s.name)));
  const geparkte = q.kosten.geparkt.filter((g) => !imOrdner.has(idAusOrdner(g.name)));
  const geparktIds = new Set(geparkte.map((g) => idAusOrdner(g.name)));
  const alleSpielKosten = [...q.kosten.spiele, ...geparkte];
  const eurJeSpiel = new Map(alleSpielKosten.map((s) => [idAusOrdner(s.name), summen(s.eintraege, q.preise).eur]));

  /** @type {Record<string, any>} */
  const spiele = {};
  for (const k of q.katalog) {
    const fertig = imSpieleJson.get(k.id);
    /** @type {Status} */
    // Mit offenem Auftrag (Bau, Antwort, Änderung – auch wenn er auf Christian wartet) ist ein Spiel in Arbeit, keine
    // Probe: Zur Probe steht es erst, wenn der Auftrag umgesetzt ist (Christian, 2026-11-17).
    const inArbeit = auftraege.some((a) => (offen(a) || a.status === "wartet-auf-christian") && a.art !== "ideen"
      && (() => { const s = stueckVon(auftraege, a); return !!s && s.bereich === "spiel" && s.ids.includes(k.id); })());
    const status = fertig && inArbeit ? "beauftragt"
      : fertig ? (fertig.probe ? "probe" : "fertig")
      : beauftragt("spiel", k.id) || ideenOffen(k.id) || stueckOffen("spiel", k.id) ? "beauftragt"
      : geparktIds.has(k.id) ? "geparkt" : "geplant";
    spiele[k.id] = { ...k, status, ordner: fertig?.datei ?? null, eur: eurJeSpiel.get(k.id) ?? null };
  }

  const spieleJeThema = new Map();
  for (const k of q.katalog) for (const t of k.hauptthemen) spieleJeThema.set(t, [...(spieleJeThema.get(t) ?? []), k.id]);

  // Mit echten Dingen: Kosten je Thema (Einträge mit mehreren Themen werden gleich geteilt)
  const echtEur = new Map();
  for (const e of q.kosten.analog) {
    const ids = e.thema ?? [];
    if (!ids.length) continue;
    const eur = summen([e], q.preise).eur / ids.length;
    for (const id of ids) echtEur.set(id, (echtEur.get(id) ?? 0) + eur);
  }
  const verzeichnis = q.echteDinge.themen;

  const lernthemen = q.plan.themen.map((t) => {
    const v = verzeichnis[t.id];
    /** @type {Status} */
    const echteDinge = v ? (v.entwurf ? "entwurf" : "fertig") : beauftragt("echte-dinge", t.id) ? "beauftragt" : "fehlt";
    return {
      id: t.id, name: t.name, strang: t.strang, klasse: t.klasse, bereich: t.bereich,
      voraussetzungen: t.voraussetzungen ?? [],
      ziel: t.ziel ?? null, beispiele: t.beispiele ?? [], zweck: t.zweck ?? null,
      spiele: spieleJeThema.get(t.id) ?? [],
      echteDinge, echteDingeEur: echtEur.get(t.id) ?? null,
      einfuehrung: t.einfuehrung?.vorlage ?? null,
      einfuehrungBeauftragt: beauftragt("einfuehrung", t.id),
    };
  });

  // Bücher: geplant in bibliothek.json (über die welten der Regale), fertig in geschichten/index.json
  const fertigeBuecher = new Map(q.geschichten.geschichten.map((g) => [g.id, g]));
  const buchEur = new Map(q.kosten.buecher.map((b) => [b.id, summen(b.eintraege, q.preise).eur]));
  const buecherJeWelt = new Map();
  let buecherGeplant = 0;
  const bibliothek = q.bibliothek.raeume.map((raum) => ({
    id: raum.id, name: raum.name ?? raum.id,
    regale: raum.regale.map((regal) => ({ id: regal.id, name: regal.name ?? regal.id, buecher: [] })),
  }));
  for (const [ri, raum] of q.bibliothek.raeume.entries()) for (const [gi, regal] of raum.regale.entries()) for (const b of regal.buecher) {
    buecherGeplant++;
    /** @type {Status} */
    const status = fertigeBuecher.has(b.id) ? "fertig" : beauftragt("buch", b.id) ? "beauftragt" : "geplant";
    const eintrag = { id: b.id, titel: b.titel, status, eur: buchEur.get(b.id) ?? null, raum: raum.id, regal: regal.id };
    for (const w of regal.welten ?? []) buecherJeWelt.set(w, [...(buecherJeWelt.get(w) ?? []), eintrag]);
    bibliothek[ri].regale[gi].buecher.push({ ...eintrag, sachthemen: regal.welten ?? [] });
  }
  const sachthemen = q.plan.welten.map((w) => ({
    id: w.id, name: w.name, ueberschrift: w.ueberschrift, klasse: w.klasse, beschreibung: w.beschreibung ?? "",
    buecher: buecherJeWelt.get(w.id) ?? [],
  }));

  // Kosten wie `npm run kosten`
  const katalog = katalogAnzahl(q.katalogUebersicht);
  const pSpiele = prognose(alleSpielKosten, katalog, q.preise);
  const pAnalog = prognoseAnalog(q.kosten.analog, q.plan.themen.length, q.preise);
  const pBuecher = prognoseBuecher(q.kosten.buecher, buecherGeplant, q.preise);
  const bibliothekEur = summen(q.kosten.bibliothek, q.preise).eur;

  const uebersichtIds = new Set([...q.katalogUebersicht.matchAll(/^\|\s*\[([A-Z]+\d+)\]/gm)].map((m) => m[1]));
  const abschnittIds = new Set(q.katalog.map((k) => k.id));

  return {
    faecher: q.spieleJson.kategorien.map((k) => ({ id: k.id, name: k.name, farbe: k.farbe })),
    ueberschriften: q.plan.ueberschriften,
    lernthemen,
    sachthemen,
    bibliothek,
    spiele,
    kosten: {
      katalog,
      spiele: pSpiele,
      analog: pAnalog,
      buecher: pBuecher,
      bibliothekEur,
      gesamtEur: pSpiele.ausgegeben + pAnalog.summe.eur + pBuecher.ausgegeben + bibliothekEur,
    },
    katalogHinweis: {
      nurUebersicht: [...uebersichtIds].filter((id) => !abschnittIds.has(id)),
      nurAbschnitte: [...abschnittIds].filter((id) => !uebersichtIds.has(id)),
    },
    schaetzung: {
      spiel: pSpiele.durchschnitt?.eur ?? SPIEL_SCHAETZUNG_OHNE_DATEN,
      echteDingeJeThema: pAnalog.jeThema,
      buch: pBuecher.durchschnitt,
    },
  };
}
