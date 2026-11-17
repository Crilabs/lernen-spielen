// Versand zur Uhrzeit (Spec „Versanddienst“): prüft jede Minute, welche Familien fällig sind, setzt den Brief aus dem
// Topf, sendet ihn und leert den Topf. Uhrzeiten gelten in Europe/Berlin; höchstens ein Brief je Familie und Empfänger und Tag.
import { setzeBrief } from "../../spiele/tagesbrief/brief.js";
import { VERSCHICKT_TAGE, bestaetigteEmpfaenger, briefTopf, leererTopf } from "./speicher.js";

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
 * Sendet die Briefe aller fälligen Familien, je bestätigtem Empfänger eine eigene Mail mit eigenem Abbestell-Link.
 * Ein Brief enthält nur Ereignisse, die vor der heutigen Uhrzeit eingingen; spätere bleiben im Topf für morgen.
 * Nach einem Fehlschlag wird nur dieser Empfänger frühestens nach 15 Minuten (bei Graph-429 nach `Retry-After`) und
 * höchstens fünfmal am Tag neu versucht; wer den Brief schon hat, bekommt keinen zweiten. Der Topf wird geleert, sobald
 * alle bestätigten Empfänger den Brief haben oder ihre Versuche aufgebraucht sind, sofern ihn mindestens einer bekam
 * (sonst bleibt er für morgen). Protokolliert wird nur Name und Code.
 * @param {{ daten: import("./speicher.js").Daten, jetzt: Date, sende: (mail: any) => Promise<void>, basis: string, speichern: () => void }} p
 * @returns {Promise<number>} Anzahl der gesendeten Briefe (Mails)
 */
export async function versendeFaellige({ daten, jetzt, sende, basis, speichern }) {
  const { tag, uhr } = berlinZeit(jetzt);
  let gesendet = 0;
  for (const [id, familie] of Object.entries(daten.familien)) {
    if (familie.topf.seit && jetzt.getTime() - new Date(familie.topf.seit).getTime() > TOPF_STUNDEN * 3600_000) {
      familie.topf = leererTopf();
      speichern();
      continue;
    }
    if (uhr < familie.uhrzeit || familie.letzterTag === tag) continue;
    const vor = (/** @type {any} */ x) => vorUhrzeit(x, tag, familie.uhrzeit);
    const topf = familie.topf;
    // Ein spätes `naechstes` von einem früheren Tag gehört schon zum heutigen Brief.
    if (topf.naechstesSpaeter && vor(topf.naechstesSpaeter)) { topf.naechstes = topf.naechstesSpaeter; delete topf.naechstesSpaeter; }
    const teil = {
      gekonnt: topf.gekonnt.filter(vor), dabei: topf.dabei.filter(vor), gelesen: topf.gelesen.filter(vor),
      naechstes: topf.naechstes && vor(topf.naechstes) ? topf.naechstes : null,
    };
    const brief = (/** @type {string} */ token) => setzeBrief({ ...briefTopf(familie), ...teil }, { datum: jetzt, abmeldeLink: `${basis}/abmelden?t=${token}`, datenschutzLink: `${basis}/datenschutz` });
    if (!brief("")) continue;
    for (const adresse of bestaetigteEmpfaenger(familie)) {
      const empfaenger = familie.empfaenger[adresse];
      const fehler = empfaenger.fehler?.tag === tag ? empfaenger.fehler : null;
      if (empfaenger.gesendetTag === tag || (fehler && (fehler.n >= MAX_VERSUCHE || jetzt.getTime() < fehler.bis))) continue;
      try {
        const mail = /** @type {NonNullable<ReturnType<typeof brief>>} */ (brief(empfaenger.abmeldeToken));
        await sende({ an: adresse, ...mail, foto: teil.naechstes?.foto || undefined });
      } catch (e) {
        const f = /** @type {any} */ (e);
        console.log(`${jetzt.toISOString()} Versand fehlgeschlagen: ${f?.name ?? "Fehler"} ${f?.code ?? ""}`.trim());
        if (daten.familien[id] === familie && familie.empfaenger[adresse] === empfaenger) {
          const wartenMs = Math.max(WIEDERHOLUNG_MIN * 60_000, (Number(f?.retryAfter) || 0) * 1000);
          empfaenger.fehler = { tag, n: (fehler?.n ?? 0) + 1, bis: jetzt.getTime() + wartenMs };
        }
        speichern();
        continue;
      }
      gesendet++;
      if (daten.familien[id] === familie && familie.empfaenger[adresse] === empfaenger) { empfaenger.gesendetTag = tag; delete empfaenger.fehler; }
      speichern();
    }
    if (daten.familien[id] !== familie) continue;
    // Erledigt, wenn jeder bestätigte Empfänger den Brief hat oder seine Versuche aufgebraucht sind.
    const empfaengerHeute = bestaetigteEmpfaenger(familie).map((a) => familie.empfaenger[a]);
    const erledigt = empfaengerHeute.every((e) => e.gesendetTag === tag || (e.fehler?.tag === tag && e.fehler.n >= MAX_VERSUCHE));
    if (!erledigt || !empfaengerHeute.some((e) => e.gesendetTag === tag)) continue;
    // Entfernt nur, was im Brief stand; während des Sendens Eingegangenes und spätere Ereignisse bleiben.
    const nochDa = familie.topf;
    for (const art of /** @type {const} */ (["gekonnt", "dabei", "gelesen"])) nochDa[art] = nochDa[art].filter((x) => !teil[art].includes(x));
    if (nochDa.naechstes === teil.naechstes) {
      nochDa.naechstes = nochDa.naechstesSpaeter ?? null;
      delete nochDa.naechstesSpaeter;
    }
    const rest = [...nochDa.gekonnt, ...nochDa.dabei, ...nochDa.gelesen, ...(nochDa.naechstes ? [nochDa.naechstes] : [])];
    if (!rest.length) familie.topf = leererTopf();
    else nochDa.seit = rest.map((x) => x.eingang).filter(Boolean).sort()[0] ?? nochDa.seit;
    familie.letzterTag = tag;
    for (const e of Object.values(familie.empfaenger)) { delete e.gesendetTag; delete e.fehler; }
    const grenze = jetzt.getTime() - VERSCHICKT_TAGE * 86400_000;
    familie.verschickt = familie.verschickt.filter((v) => new Date(v.am).getTime() >= grenze);
    if (teil.naechstes?.id) familie.verschickt.push({ anleitung: teil.naechstes.id, am: jetzt.toISOString() });
    speichern();
  }
  return gesendet;
}
