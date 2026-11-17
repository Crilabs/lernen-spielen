// Versand zur Uhrzeit (Spec „Versanddienst“): prüft jede Minute, welche Adressen fällig sind, setzt den Brief aus dem
// Topf, sendet ihn und leert den Topf. Uhrzeiten gelten in Europe/Berlin; höchstens ein Brief je Adresse und Tag.
import { setzeBrief } from "../../spiele/tagesbrief/brief.js";
import { VERSCHICKT_TAGE, briefTopf, leererTopf } from "./speicher.js";

const TOPF_STUNDEN = 48;

/** Datum (`JJJJ-MM-TT`) und Uhrzeit (`HH:MM`) in Berlin. @param {Date} d */
export function berlinZeit(d) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin", hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  }).formatToParts(d).map((x) => [x.type, x.value]));
  return { tag: `${p.year}-${p.month}-${p.day}`, uhr: `${p.hour}:${p.minute}` };
}

/**
 * Legt einen nicht versandten Topf wieder zurück, ohne zwischenzeitlich eingegangene Ereignisse zu verlieren.
 * @param {import("./speicher.js").GespeicherterTopf} neu @param {import("./speicher.js").GespeicherterTopf} alt
 */
function legeZurueck(neu, alt) {
  neu.ids = [...new Set([...alt.ids, ...neu.ids])];
  for (const art of /** @type {const} */ (["gekonnt", "dabei", "gelesen"])) {
    neu[art] = [...alt[art], ...neu[art].filter((x) => !alt[art].some((y) => y.id === x.id))];
  }
  neu.naechstes ??= alt.naechstes;
  neu.seit = alt.seit ?? neu.seit;
}

/**
 * Sendet die Briefe aller fälligen Adressen. Schlägt der Versand an eine Adresse fehl, bleibt deren Topf erhalten
 * und die übrigen kommen trotzdem dran; protokolliert wird nur Name und Code des Fehlers.
 * @param {{ daten: import("./speicher.js").Daten, jetzt: Date, sende: (mail: any) => Promise<void>, basis: string, speichern: () => void }} p
 * @returns {Promise<number>} Anzahl der gesendeten Briefe
 */
export async function versendeFaellige({ daten, jetzt, sende, basis, speichern }) {
  const { tag, uhr } = berlinZeit(jetzt);
  let gesendet = 0;
  for (const [adresse, eintrag] of Object.entries(daten.adressen)) {
    const fuellt = eintrag.topf.seit !== null;
    const faellig = uhr >= eintrag.uhrzeit && eintrag.letzterTag !== tag;
    const brief = faellig && fuellt
      ? setzeBrief(briefTopf(eintrag), { datum: jetzt, abmeldeLink: `${basis}/abmelden?t=${eintrag.abmeldeToken}`, datenschutzLink: `${basis}/datenschutz` })
      : null;
    if (!brief) {
      if (fuellt && jetzt.getTime() - new Date(/** @type {string} */ (eintrag.topf.seit)).getTime() > TOPF_STUNDEN * 3600_000) {
        eintrag.topf = leererTopf();
        speichern();
      }
      continue;
    }
    // Der Topf wird vor dem Senden getauscht: was währenddessen eingeht, gehört in den nächsten Brief.
    const topf = eintrag.topf;
    eintrag.topf = leererTopf();
    try {
      await sende({ an: adresse, ...brief, foto: topf.naechstes?.foto || undefined });
    } catch (e) {
      console.log(`${jetzt.toISOString()} Versand fehlgeschlagen: ${/** @type {any} */ (e)?.name ?? "Fehler"} ${/** @type {any} */ (e)?.code ?? ""}`.trim());
      if (daten.adressen[adresse] === eintrag) legeZurueck(eintrag.topf, topf);
      speichern();
      continue;
    }
    gesendet++;
    if (daten.adressen[adresse] !== eintrag) continue;
    eintrag.letzterTag = tag;
    const grenze = jetzt.getTime() - VERSCHICKT_TAGE * 86400_000;
    eintrag.verschickt = eintrag.verschickt.filter((v) => new Date(v.am).getTime() >= grenze);
    if (topf.naechstes?.id) eintrag.verschickt.push({ anleitung: topf.naechstes.id, am: jetzt.toISOString() });
    speichern();
  }
  return gesendet;
}
