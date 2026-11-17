// Versand zur Uhrzeit (Spec „Versanddienst“): prüft jede Minute, welche Adressen fällig sind, setzt den Brief aus dem
// Topf, sendet ihn und leert den Topf. Uhrzeiten gelten in Europe/Berlin; höchstens ein Brief je Adresse und Tag.
import { setzeBrief } from "../../spiele/tagesbrief/brief.js";
import { VERSCHICKT_TAGE, briefTopf, leererTopf } from "./speicher.js";

const TOPF_STUNDEN = 48;
const MAX_VERSUCHE = 5;
const WIEDERHOLUNG_MIN = 15;

/** Datum (`JJJJ-MM-TT`) und Uhrzeit (`HH:MM`) in Berlin. @param {Date} d */
export function berlinZeit(d) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin", hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  }).formatToParts(d).map((x) => [x.type, x.value]));
  return { tag: `${p.year}-${p.month}-${p.day}`, uhr: `${p.hour}:${p.minute}` };
}

/** Ob der Eingang vor der heutigen Uhrzeit lag (frühere Tage und Daten ohne Eingang zählen mit). */
const vorUhrzeit = (/** @type {any} */ x, /** @type {string} */ tag, /** @type {string} */ uhrzeit) => {
  if (!x.eingang) return true;
  const e = berlinZeit(new Date(x.eingang));
  return e.tag < tag || (e.tag === tag && e.uhr < uhrzeit);
};

/**
 * Sendet die Briefe aller fälligen Adressen. Ein Brief enthält nur Ereignisse, die vor der heutigen Uhrzeit eingingen;
 * spätere bleiben im Topf für morgen. Nach einem Fehlschlag wird frühestens nach 15 Minuten (bei Graph-429 nach
 * `Retry-After`) und höchstens fünfmal am Tag neu versucht; der Topf bleibt. Protokolliert wird nur Name und Code.
 * @param {{ daten: import("./speicher.js").Daten, jetzt: Date, sende: (mail: any) => Promise<void>, basis: string, speichern: () => void }} p
 * @returns {Promise<number>} Anzahl der gesendeten Briefe
 */
export async function versendeFaellige({ daten, jetzt, sende, basis, speichern }) {
  const { tag, uhr } = berlinZeit(jetzt);
  let gesendet = 0;
  for (const [adresse, eintrag] of Object.entries(daten.adressen)) {
    if (eintrag.topf.seit && jetzt.getTime() - new Date(eintrag.topf.seit).getTime() > TOPF_STUNDEN * 3600_000) {
      eintrag.topf = leererTopf();
      speichern();
      continue;
    }
    const fehler = eintrag.fehler?.tag === tag ? eintrag.fehler : null;
    if (uhr < eintrag.uhrzeit || eintrag.letzterTag === tag || (fehler && (fehler.n >= MAX_VERSUCHE || jetzt.getTime() < fehler.bis))) continue;
    const vor = (/** @type {any} */ x) => vorUhrzeit(x, tag, eintrag.uhrzeit);
    const topf = eintrag.topf;
    const teil = {
      gekonnt: topf.gekonnt.filter(vor), dabei: topf.dabei.filter(vor), gelesen: topf.gelesen.filter(vor),
      naechstes: topf.naechstes && vor(topf.naechstes) ? topf.naechstes : null,
    };
    const brief = setzeBrief({ ...briefTopf(eintrag), ...teil }, { datum: jetzt, abmeldeLink: `${basis}/abmelden?t=${eintrag.abmeldeToken}`, datenschutzLink: `${basis}/datenschutz` });
    if (!brief) continue;
    try {
      await sende({ an: adresse, ...brief, foto: teil.naechstes?.foto || undefined });
    } catch (e) {
      const f = /** @type {any} */ (e);
      console.log(`${jetzt.toISOString()} Versand fehlgeschlagen: ${f?.name ?? "Fehler"} ${f?.code ?? ""}`.trim());
      if (daten.adressen[adresse] === eintrag) {
        const wartenMs = Math.max(WIEDERHOLUNG_MIN * 60_000, (Number(f?.retryAfter) || 0) * 1000);
        eintrag.fehler = { tag, n: (fehler?.n ?? 0) + 1, bis: jetzt.getTime() + wartenMs };
      }
      speichern();
      continue;
    }
    gesendet++;
    if (daten.adressen[adresse] !== eintrag) continue;
    // Entfernt nur, was im Brief stand; während des Sendens Eingegangenes und spätere Ereignisse bleiben.
    const nochDa = eintrag.topf;
    for (const art of /** @type {const} */ (["gekonnt", "dabei", "gelesen"])) nochDa[art] = nochDa[art].filter((x) => !teil[art].includes(x));
    if (nochDa.naechstes === teil.naechstes) nochDa.naechstes = null;
    const rest = [...nochDa.gekonnt, ...nochDa.dabei, ...nochDa.gelesen, ...(nochDa.naechstes ? [nochDa.naechstes] : [])];
    if (!rest.length) eintrag.topf = leererTopf();
    else nochDa.seit = rest.map((x) => x.eingang).filter(Boolean).sort()[0] ?? nochDa.seit;
    eintrag.letzterTag = tag;
    delete eintrag.fehler;
    const grenze = jetzt.getTime() - VERSCHICKT_TAGE * 86400_000;
    eintrag.verschickt = eintrag.verschickt.filter((v) => new Date(v.am).getTime() >= grenze);
    if (teil.naechstes?.id) eintrag.verschickt.push({ anleitung: teil.naechstes.id, am: jetzt.toISOString() });
    speichern();
  }
  return gesendet;
}
