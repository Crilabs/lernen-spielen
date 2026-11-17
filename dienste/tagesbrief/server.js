// Versanddienst des Tagesbriefs (Spec „Versanddienst“): Anmeldung mit Bestätigungslink, Ereignisse in den Topf der
// bestätigten Adresse, Einstellungen, Probebrief, Abmelden. Der Versand zur Uhrzeit folgt in `pruefeFaellige`.
// Kernregel: Ein Gerät kann nur in den Topf der Adresse pushen, die es bestätigt hat; Empfänger stehen nie in einer Anfrage.
import { createServer } from "node:http";
import { setzeBrief } from "../../spiele/tagesbrief/brief.js";
import { GRENZEN, TAG, erlaubt, raeumeAuf } from "./grenzen.js";
import { WEITERES_GERAET, abgemeldetSeite, abmeldenFrage, bestaetigenFrage, bestaetigtSeite, datenschutzSeite, ungueltigSeite } from "./seiten.js";
import { gueltigesEreignis } from "./pruefung.js";
import { berlinZeit, versendeFaellige } from "./versand.js";
import { briefTopf, hash, juengsteVerschickte, lade, legeAb, leererTopf, sichere, zufall } from "./speicher.js";

export const APP_SCHLUESSEL = "lernen-spielen-1";
const LINK_STUNDEN = 24;
const ADRESSE = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]+$/;
const UHRZEIT = /^([01]\d|2[0-3]):[0-5]\d$/;
const KLEIN = 16 * 1024;

/**
 * @param {{ port: number, datei: string, jetzt?: () => Date, sende: (mail: { an: string, betreff: string, html: string, text: string, foto?: string }) => Promise<void>, basis?: string, aus?: boolean }} optionen
 * @returns {Promise<{ server: import("node:http").Server, stop: () => Promise<void>, pruefeFaellige: () => Promise<number> }>}
 */
export async function starteDienst({ port, datei, jetzt = () => new Date(), sende, basis = "https://lernen-spielen.crilabs.de", aus = false }) {
  const daten = lade(datei);
  daten.gesperrt ??= [];
  let laeuft = false;

  /** Entfernt abgelaufene Anfragen (24 h nach der Anmeldung) samt Adresse, Token und noch nicht abgeholtem Schlüssel. */
  const raeumeAnfragen = () => {
    const t = jetzt().getTime();
    for (const [id, a] of Object.entries(daten.anfragen)) if (new Date(a.ablauf).getTime() < t) delete daten.anfragen[id];
  };
  const speichern = () => { raeumeAnfragen(); sichere(datei, daten); };

  /** Von Hand gesperrte Geräte: `gesperrt` in der Speicherdatei, Präfixe des Geräte-Hashes (mindestens 12 Zeichen). */
  const gesperrt = (/** @type {string} */ h) => daten.gesperrt.some((p) => p.length >= 12 && h.startsWith(p));

  /** Liest ein form-urlencoded-Feld `t` aus dem Körper. */
  const formularToken = async (/** @type {import("node:http").IncomingMessage} */ req) => new URLSearchParams((await lies(req, KLEIN)) ?? "").get("t") ?? "";

  /** Antwort mit JSON-Körper. */
  const json = (/** @type {import("node:http").ServerResponse} */ res, /** @type {number} */ status, /** @type {any} */ koerper = {}) => {
    res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(koerper));
  };
  const html = (/** @type {import("node:http").ServerResponse} */ res, /** @type {number} */ status, /** @type {string} */ seite) => {
    res.writeHead(status, { "content-type": "text/html; charset=utf-8" });
    res.end(seite);
  };

  /** Liest den Körper bis `max` Bytes; darüber wird weitergelesen, aber verworfen. */
  const lies = (/** @type {import("node:http").IncomingMessage} */ req, /** @type {number} */ max) =>
    new Promise((ok) => {
      /** @type {Buffer[]} */ const teile = [];
      let summe = 0;
      req.on("data", (/** @type {Buffer} */ c) => { summe += c.length; if (summe <= max) teile.push(c); });
      req.on("end", () => ok(summe > max ? null : Buffer.concat(teile).toString("utf8")));
      req.on("error", () => ok(null));
    });

  /** @param {string | null} text */
  const parse = (text) => { try { return text ? JSON.parse(text) : null; } catch { return undefined; } };

  /** Gerät zum Bearer-Schlüssel: Adresse, Hash oder Fehlerstatus. */
  const gerät = (/** @type {import("node:http").IncomingMessage} */ req) => {
    const m = /^Bearer (\S+)$/.exec(req.headers.authorization ?? "");
    if (!m) return { status: 401 };
    const h = hash(m[1]);
    if (daten.abgemeldet[h]) return { status: 410, h };
    for (const [adresse, eintrag] of Object.entries(daten.adressen)) if (eintrag.geraete[h]) return { status: 200, h, adresse, eintrag };
    return { status: 401, h };
  };

  /** Protokoll: Zeit, gekürzter Schlüssel-Hash, Endpunkt, Ergebnis; nie Adresse, Query oder Inhalt. */
  const protokoll = (/** @type {import("node:http").IncomingMessage} */ req, /** @type {number} */ status, /** @type {string | undefined} */ h) =>
    console.log(`${jetzt().toISOString()} ${h ? h.slice(0, 8) : "-"} ${req.method} ${(req.url ?? "").split("?")[0]} ${status}`);

  const ipHash = (/** @type {import("node:http").IncomingMessage} */ req) => {
    const weiter = String(req.headers["x-forwarded-for"] ?? "").split(",").pop()?.trim();
    return hash(`ip:${weiter || req.socket.remoteAddress}`);
  };

  async function anmelden(/** @type {any} */ req, /** @type {any} */ res) {
    if (aus) return 503;
    const k = parse(await lies(req, KLEIN));
    const adresse = typeof k?.adresse === "string" ? k.adresse.trim().toLowerCase() : "";
    const uhrzeit = k?.uhrzeit === undefined ? "18:00" : k.uhrzeit;
    if (!ADRESSE.test(adresse) || adresse.length > 254 || !UHRZEIT.test(uhrzeit)) { json(res, 400, { fehler: "ungueltig" }); return 400; }
    const name = typeof k.name === "string" ? k.name.trim().slice(0, 40) : "";
    const t = jetzt().getTime();
    const ok = erlaubt(daten.zaehler, `anmeldenIp:${ipHash(req)}`, GRENZEN.anmeldenJeIp, t)
      && erlaubt(daten.zaehler, `anmeldenAdresse:${hash(adresse)}`, GRENZEN.anmeldenJeAdresse, t);
    if (!ok) { speichern(); json(res, 429, { fehler: "zu-oft" }); return 429; }
    const anfrageId = zufall();
    const token = zufall();
    daten.anfragen[anfrageId] = { adresse, token, ablauf: new Date(t + LINK_STUNDEN * 3600_000).toISOString(), uhrzeit, name, weiteres: Boolean(daten.adressen[adresse]) };
    speichern();
    const link = `${basis}/bestaetigen?t=${token}`;
    const weiteres = daten.anfragen[anfrageId].weiteres;
    await sende({
      an: adresse,
      betreff: "Bitte bestätigen Sie den Tagesbrief",
      text: `Guten Tag,\n\n${weiteres ? `${WEITERES_GERAET}\n\n` : ""}bitte bestätigen Sie mit diesem Link, dass Sie den Tagesbrief der Lern-App erhalten möchten:\n${link}\n\nDer Link gilt 24 Stunden. Wenn Sie das nicht angefordert haben, ignorieren Sie diese E-Mail einfach.`,
      html: `<p>Guten Tag,</p>${weiteres ? `<p>${WEITERES_GERAET}</p>` : ""}<p>bitte bestätigen Sie, dass Sie den Tagesbrief der Lern-App erhalten möchten:</p><p><a href="${link}">Tagesbrief bestätigen</a></p><p>Der Link gilt 24 Stunden. Wenn Sie das nicht angefordert haben, ignorieren Sie diese E-Mail einfach.</p>`,
    });
    json(res, 200, { anfrageId });
    return 200;
  }

  function bestaetigen(/** @type {string} */ t, /** @type {any} */ res) {
    raeumeAnfragen();
    const eintrag = Object.values(daten.anfragen).find((a) => a.token === t && t);
    if (!eintrag || eintrag.bestaetigt || new Date(eintrag.ablauf).getTime() < jetzt().getTime()) { html(res, 400, ungueltigSeite()); return 400; }
    const schluessel = zufall();
    const h = hash(schluessel);
    const adresse = (daten.adressen[eintrag.adresse] ??= { uhrzeit: eintrag.uhrzeit, namen: {}, geraete: {}, topf: leererTopf(), verschickt: [], abmeldeToken: zufall() });
    adresse.uhrzeit = eintrag.uhrzeit;
    delete eintrag.weiteres;
    adresse.geraete[h] = { name: eintrag.geraet ?? "Gerät", angelegt: jetzt().toISOString() };
    adresse.namen[h] = eintrag.name ?? "";
    eintrag.bestaetigt = true;
    eintrag.token = "";
    eintrag.schluessel = schluessel;
    speichern();
    html(res, 200, bestaetigtSeite());
    return 200;
  }

  function status(/** @type {URL} */ url, /** @type {any} */ res) {
    raeumeAnfragen();
    const eintrag = daten.anfragen[url.searchParams.get("anfrage") ?? ""];
    if (!eintrag) { json(res, 404, { fehler: "unbekannt" }); return 404; }
    if (!eintrag.bestaetigt) { json(res, 200, { bestaetigt: false }); return 200; }
    const antwort = eintrag.schluessel ? { bestaetigt: true, schluessel: eintrag.schluessel } : { bestaetigt: true };
    // Nach der Abholung bleibt nur „bestätigt“ bis zum Ablauf; Schlüssel und Adresse gehen sofort.
    delete eintrag.schluessel;
    delete eintrag.adresse;
    speichern();
    json(res, 200, antwort);
    return 200;
  }

  async function ereignisse(/** @type {any} */ req, /** @type {any} */ res, /** @type {any} */ g) {
    if (aus) return 503;
    const text = await lies(req, GRENZEN.bytesJePush);
    if (text === null) { json(res, 413, { fehler: "zu-gross" }); return 413; }
    const liste = parse(text);
    if (!Array.isArray(liste)) { json(res, 400, { fehler: "ungueltig" }); return 400; }
    if (liste.length > GRENZEN.ereignisseJePush) { json(res, 413, { fehler: "zu-viele" }); return 413; }
    if (!liste.every(gueltigesEreignis)) { json(res, 400, { fehler: "ungueltig" }); return 400; }
    if (!erlaubt(daten.zaehler, `push:${g.h}`, GRENZEN.pushesJeGeraet, jetzt().getTime())) { speichern(); json(res, 429, { fehler: "zu-oft" }); return 429; }
    // Nur die eigene Adresse: Felder wie `an` oder `adresse` im Körper werden nie gelesen.
    legeAb(g.eintrag.topf, liste, jetzt(), berlinZeit(jetzt()).uhr >= g.eintrag.uhrzeit);
    speichern();
    json(res, 200, { verschickt: juengsteVerschickte(g.eintrag, jetzt()) });
    return 200;
  }

  async function einstellungen(/** @type {any} */ req, /** @type {any} */ res, /** @type {any} */ g) {
    const k = parse(await lies(req, KLEIN));
    if (!k || typeof k !== "object") { json(res, 400, { fehler: "ungueltig" }); return 400; }
    if (k.uhrzeit !== undefined && !UHRZEIT.test(k.uhrzeit)) { json(res, 400, { fehler: "ungueltig" }); return 400; }
    if (k.uhrzeit !== undefined) g.eintrag.uhrzeit = k.uhrzeit;
    if (typeof k.name === "string") g.eintrag.namen[g.h] = k.name.trim().slice(0, 40);
    speichern();
    json(res, 200, { uhrzeit: g.eintrag.uhrzeit });
    return 200;
  }

  async function probebrief(/** @type {any} */ res, /** @type {any} */ g) {
    if (aus) return 503;
    if (!erlaubt(daten.zaehler, `probe:${g.h}`, GRENZEN.probebriefeJeGeraet, jetzt().getTime())) { speichern(); json(res, 429, { fehler: "zu-oft" }); return 429; }
    speichern();
    const brief = setzeBrief(briefTopf(g.eintrag), {
      datum: jetzt(),
      abmeldeLink: `${basis}/abmelden?t=${g.eintrag.abmeldeToken}`,
      datenschutzLink: `${basis}/datenschutz`,
    });
    if (!brief) { json(res, 409, { fehler: "leer" }); return 409; }
    await sende({ an: g.adresse, ...brief, foto: g.eintrag.topf.naechstes?.foto || undefined });
    json(res, 200, { gesendet: true });
    return 200;
  }

  function geraetLoesen(/** @type {any} */ res, /** @type {any} */ g) {
    delete g.eintrag.geraete[g.h];
    delete g.eintrag.namen[g.h];
    if (!Object.keys(g.eintrag.geraete).length) delete daten.adressen[g.adresse];
    speichern();
    json(res, 200);
    return 200;
  }

  function abmelden(/** @type {string} */ t, /** @type {any} */ res) {
    const adresse = Object.keys(daten.adressen).find((a) => t && daten.adressen[a].abmeldeToken === t);
    if (!adresse) { html(res, 200, abgemeldetSeite()); return 200; }
    for (const h of Object.keys(daten.adressen[adresse].geraete)) daten.abgemeldet[h] = true;
    delete daten.adressen[adresse];
    for (const [id, a] of Object.entries(daten.anfragen)) if (a.adresse === adresse) delete daten.anfragen[id];
    speichern();
    html(res, 200, abgemeldetSeite());
    return 200;
  }

  const server = createServer(async (req, res) => {
    let ergebnis = 500;
    /** @type {string | undefined} */ let h;
    try {
      const url = new URL(req.url ?? "/", "http://dienst");
      const weg = `${req.method} ${url.pathname}`;
      const seitenAufruf = ["GET /bestaetigen", "POST /bestaetigen", "GET /abmelden", "POST /abmelden", "GET /datenschutz"].includes(weg);
      if (weg === "GET /datenschutz") { html(res, 200, datenschutzSeite()); ergebnis = 200; }
      // Link-Scanner rufen GET auf: GET zeigt nur einen Knopf, erst POST bestätigt bzw. meldet ab.
      else if (weg === "GET /bestaetigen") { html(res, 200, bestaetigenFrage(url.searchParams.get("t") ?? "", Object.values(daten.anfragen).some((a) => a.token === url.searchParams.get("t") && a.weiteres))); ergebnis = 200; }
      else if (weg === "GET /abmelden") { html(res, 200, abmeldenFrage(url.searchParams.get("t") ?? "")); ergebnis = 200; }
      else if (weg === "POST /bestaetigen") ergebnis = bestaetigen(await formularToken(req), res);
      else if (weg === "POST /abmelden") ergebnis = abmelden(await formularToken(req), res);
      else if (!seitenAufruf && req.headers["x-app"] !== APP_SCHLUESSEL) { json(res, 403, { fehler: "app" }); ergebnis = 403; }
      else if (weg === "POST /anmelden") ergebnis = await anmelden(req, res);
      else if (weg === "GET /status") ergebnis = status(url, res);
      else if (["POST /ereignisse", "POST /einstellungen", "POST /probebrief", "DELETE /geraet"].includes(weg)) {
        const g = gerät(req);
        h = g.h;
        if (g.status !== 200) { json(res, g.status, { fehler: g.status === 410 ? "abgemeldet" : "schluessel" }); ergebnis = g.status; }
        else if (gesperrt(g.h ?? "") && weg !== "DELETE /geraet") { json(res, 403, { fehler: "gesperrt" }); ergebnis = 403; }
        else if (weg === "POST /ereignisse") ergebnis = await ereignisse(req, res, g);
        else if (weg === "POST /einstellungen") ergebnis = await einstellungen(req, res, g);
        else if (weg === "POST /probebrief") ergebnis = await probebrief(res, g);
        else ergebnis = geraetLoesen(res, g);
      } else { json(res, 404, { fehler: "unbekannt" }); ergebnis = 404; }
      if (ergebnis === 503) json(res, 503, { fehler: "aus" });
    } catch {
      if (!res.headersSent) json(res, 500, { fehler: "intern" });
      ergebnis = 500;
    }
    protokoll(req, ergebnis, h);
  });

  await new Promise((ok) => server.listen(port, "127.0.0.1", () => ok(undefined)));
  const aufraeumen = setInterval(() => { raeumeAuf(daten.zaehler, jetzt().getTime()); speichern(); }, TAG / 24);
  aufraeumen.unref();

  return {
    server,
    stop: () => new Promise((ok) => { clearInterval(aufraeumen); server.closeAllConnections(); server.close(() => ok(undefined)); }),
    // Versand zur Uhrzeit, Topf leeren, Topf nach 48 h löschen; beim Not-Aus passiert nichts.
    // Läuft schon eine Prüfung (langsamer Versand), kehrt ein zweiter Aufruf sofort zurück.
    pruefeFaellige: async () => {
      if (aus || laeuft) return 0;
      laeuft = true;
      try { return await versendeFaellige({ daten, jetzt: jetzt(), sende, basis, speichern }); } finally { laeuft = false; }
    },
  };
}
