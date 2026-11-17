// Versanddienst des Tagesbriefs (Spec „Versanddienst“): Anmeldung mit Bestätigungslink, Ereignisse in den Topf der
// Familie, Empfänger (bis 4 je Familie), Einstellungen, Probebrief, Abmelden. Der Versand zur Uhrzeit folgt in `pruefeFaellige`.
// Kernregel: Ein Gerät kann nur in den Topf seiner Familie pushen; Empfänger stehen nie in einem Ereignis-Körper, nur die
// zu bestätigende Adresse in /anmelden bzw. /empfaenger, und Briefe gehen nur an bestätigte Adressen.
import { createServer } from "node:http";
import { setzeBrief } from "../../spiele/tagesbrief/brief.js";
import { GRENZEN, TAG, erlaubt, raeumeAuf } from "./grenzen.js";
import { WEITERES_GERAET, abgemeldetSeite, esc, zusaetzlichText, abmeldenFrage, bestaetigenFrage, bestaetigtSeite, datenschutzSeite, ungueltigSeite } from "./seiten.js";
import { gueltigesEreignis } from "./pruefung.js";
import { berlinZeit, versendeFaellige } from "./versand.js";
import { MAX_EMPFAENGER, bestaetigteEmpfaenger, briefTopf, hash, juengsteVerschickte, lade, legeAb, leererTopf, sichere, zufall } from "./speicher.js";

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
    for (const [id, a] of Object.entries(daten.anfragen)) {
      if (new Date(a.ablauf).getTime() >= t) continue;
      // Ein nie bestätigter zusätzlicher Empfänger verschwindet mit seinem Link und gibt den Platz frei.
      const e = a.art === "empfaenger" ? daten.familien[a.familie]?.empfaenger[a.adresse] : null;
      if (e && !e.bestaetigt) delete daten.familien[a.familie].empfaenger[a.adresse];
      delete daten.anfragen[id];
    }
  };
  /** Löscht eine Familie samt Anfragen; mit `sperren` bekommen ihre Geräte danach 410. */
  const loescheFamilie = (/** @type {string} */ id, /** @type {boolean} */ sperren) => {
    const f = daten.familien[id];
    if (!f) return;
    if (sperren) for (const h of Object.keys(f.geraete)) daten.abgemeldet[h] = true;
    delete daten.familien[id];
    for (const [aid, a] of Object.entries(daten.anfragen)) if (a.familie === id) delete daten.anfragen[aid];
  };
  /** Entfernt einen Empfänger (bestätigt oder wartend) samt offenem Link; ohne bestätigte Adresse fällt die Familie. @returns {boolean} Familie gelöscht */
  const entferneEmpfaenger = (/** @type {string} */ id, /** @type {string} */ adresse) => {
    const f = daten.familien[id];
    delete f.empfaenger[adresse];
    for (const [aid, a] of Object.entries(daten.anfragen)) if (a.art === "empfaenger" && a.familie === id && a.adresse === adresse) delete daten.anfragen[aid];
    if (bestaetigteEmpfaenger(f).length) return false;
    loescheFamilie(id, true);
    return true;
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
    for (const [familieId, familie] of Object.entries(daten.familien)) if (familie.geraete[h]) return { status: 200, h, familieId, familie };
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
    // Ist die Adresse bestätigter Empfänger genau einer Familie, tritt das Gerät ihr bei; sonst entsteht eine neue.
    const treffer = Object.keys(daten.familien).filter((id) => daten.familien[id].empfaenger[adresse]?.bestaetigt);
    const weiteres = treffer.length === 1;
    daten.anfragen[anfrageId] = { adresse, token, ablauf: new Date(t + LINK_STUNDEN * 3600_000).toISOString(), uhrzeit, name, art: "geraet", ...(weiteres ? { familie: treffer[0], weiteres } : {}) };
    speichern();
    const link = `${basis}/bestaetigen?t=${token}`;
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
    if (eintrag.art === "empfaenger") {
      // Zusätzliche Adresse: wird bestätigter Empfänger der Familie, bekommt aber keinen Schlüssel.
      const e = daten.familien[eintrag.familie]?.empfaenger[eintrag.adresse];
      if (!e || e.bestaetigt) { html(res, 400, ungueltigSeite()); return 400; }
      e.bestaetigt = true;
      for (const [id, a] of Object.entries(daten.anfragen)) if (a === eintrag) delete daten.anfragen[id];
      speichern();
      html(res, 200, bestaetigtSeite());
      return 200;
    }
    const schluessel = zufall();
    const h = hash(schluessel);
    // Beitritt nur, solange die Adresse dort noch bestätigter Empfänger ist; sonst entsteht eine neue Familie.
    let familie = daten.familien[eintrag.familie];
    if (!familie?.empfaenger[eintrag.adresse]?.bestaetigt) familie = undefined;
    if (!familie) {
      familie = { uhrzeit: eintrag.uhrzeit, name: eintrag.name ?? "", geraete: {}, empfaenger: { [eintrag.adresse]: { bestaetigt: true, abmeldeToken: zufall() } }, topf: leererTopf(), verschickt: [] };
      daten.familien[zufall()] = familie;
    } else {
      familie.uhrzeit = eintrag.uhrzeit;
      if (!familie.name) familie.name = eintrag.name ?? "";
    }
    familie.geraete[h] = { name: eintrag.geraet ?? "Gerät", angelegt: jetzt().toISOString() };
    delete eintrag.weiteres;
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
    // Nach der Abholung bleibt nur „bestätigt“ bis zum Ablauf; Schlüssel, Adresse und Familie gehen sofort.
    delete eintrag.schluessel;
    delete eintrag.adresse;
    delete eintrag.familie;
    delete eintrag.art;
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
    // Nur die eigene Familie: Felder wie `an` oder `adresse` im Körper werden nie gelesen.
    legeAb(g.familie.topf, liste, jetzt(), berlinZeit(jetzt()).uhr >= g.familie.uhrzeit);
    speichern();
    json(res, 200, { verschickt: juengsteVerschickte(g.familie, jetzt()) });
    return 200;
  }

  async function einstellungen(/** @type {any} */ req, /** @type {any} */ res, /** @type {any} */ g) {
    const k = parse(await lies(req, KLEIN));
    if (!k || typeof k !== "object") { json(res, 400, { fehler: "ungueltig" }); return 400; }
    if (k.uhrzeit !== undefined && !UHRZEIT.test(k.uhrzeit)) { json(res, 400, { fehler: "ungueltig" }); return 400; }
    if (k.uhrzeit !== undefined) g.familie.uhrzeit = k.uhrzeit;
    if (typeof k.name === "string") g.familie.name = k.name.trim().slice(0, 40);
    speichern();
    json(res, 200, { uhrzeit: g.familie.uhrzeit });
    return 200;
  }

  async function probebrief(/** @type {any} */ res, /** @type {any} */ g) {
    if (aus) return 503;
    if (!erlaubt(daten.zaehler, `probe:${g.h}`, GRENZEN.probebriefeJeGeraet, jetzt().getTime())) { speichern(); json(res, 429, { fehler: "zu-oft" }); return 429; }
    speichern();
    const adressen = bestaetigteEmpfaenger(g.familie);
    const brief = (/** @type {string} */ token) => setzeBrief(briefTopf(g.familie), { datum: jetzt(), abmeldeLink: `${basis}/abmelden?t=${token}`, datenschutzLink: `${basis}/datenschutz` });
    if (!brief("")) { json(res, 409, { fehler: "leer" }); return 409; }
    // Eine eigene Mail je bestätigtem Empfänger mit dessen Abbestell-Link; zählt einmal gegen die Tagesgrenze.
    for (const adresse of adressen) {
      await sende({ an: adresse, ...brief(g.familie.empfaenger[adresse].abmeldeToken), foto: g.familie.topf.naechstes?.foto || undefined });
    }
    json(res, 200, { gesendet: true });
    return 200;
  }

  async function empfaengerHinzufuegen(/** @type {any} */ req, /** @type {any} */ res, /** @type {any} */ g) {
    if (aus) return 503;
    const k = parse(await lies(req, KLEIN));
    const adresse = typeof k?.adresse === "string" ? k.adresse.trim().toLowerCase() : "";
    if (!ADRESSE.test(adresse) || adresse.length > 254) { json(res, 400, { fehler: "ungueltig" }); return 400; }
    if (g.familie.empfaenger[adresse]) { json(res, 409, { fehler: "vorhanden" }); return 409; }
    if (Object.keys(g.familie.empfaenger).length >= MAX_EMPFAENGER) { json(res, 409, { fehler: "voll" }); return 409; }
    const t = jetzt().getTime();
    const ok = erlaubt(daten.zaehler, `anmeldenIp:${ipHash(req)}`, GRENZEN.anmeldenJeIp, t)
      && erlaubt(daten.zaehler, `anmeldenAdresse:${hash(adresse)}`, GRENZEN.anmeldenJeAdresse, t);
    if (!ok) { speichern(); json(res, 429, { fehler: "zu-oft" }); return 429; }
    const anfrageId = zufall();
    const token = zufall();
    g.familie.empfaenger[adresse] = { bestaetigt: false, abmeldeToken: zufall() };
    daten.anfragen[anfrageId] = { adresse, token, ablauf: new Date(t + LINK_STUNDEN * 3600_000).toISOString(), art: "empfaenger", familie: g.familieId };
    speichern();
    const link = `${basis}/bestaetigen?t=${token}`;
    const hinweis = zusaetzlichText(g.familie.name);
    try {
      await sende({
        an: adresse,
        betreff: "Bitte bestätigen Sie den Tagesbrief",
        text: `Guten Tag,\n\n${hinweis}\n\nWenn doch, bestätigen Sie mit diesem Link:\n${link}\n\nDer Link gilt 24 Stunden.`,
        html: `<p>Guten Tag,</p><p>${esc(hinweis)}</p><p>Wenn doch: <a href="${link}">Tagesbrief bestätigen</a></p><p>Der Link gilt 24 Stunden.</p>`,
      });
    } catch (e) {
      // Ohne zugestellte Mail bleibt kein wartender Empfänger zurück, der einen der vier Plätze belegt.
      delete g.familie.empfaenger[adresse];
      delete daten.anfragen[anfrageId];
      speichern();
      throw e;
    }
    json(res, 200, { ok: true });
    return 200;
  }

  function empfaengerListe(/** @type {any} */ res, /** @type {any} */ g) {
    raeumeAnfragen();
    json(res, 200, { uhrzeit: g.familie.uhrzeit, name: g.familie.name, empfaenger: Object.entries(g.familie.empfaenger).map(([adresse, e]) => ({ adresse, bestaetigt: /** @type {any} */ (e).bestaetigt })) });
    return 200;
  }

  async function empfaengerEntfernen(/** @type {any} */ req, /** @type {any} */ res, /** @type {any} */ g) {
    const k = parse(await lies(req, KLEIN));
    const adresse = typeof k?.adresse === "string" ? k.adresse.trim().toLowerCase() : "";
    if (!g.familie.empfaenger[adresse]) { json(res, 404, { fehler: "unbekannt" }); return 404; }
    const geloescht = entferneEmpfaenger(g.familieId, adresse);
    speichern();
    json(res, 200, geloescht ? { familieGeloescht: true } : { ok: true });
    return 200;
  }

  function geraetLoesen(/** @type {any} */ res, /** @type {any} */ g) {
    delete g.familie.geraete[g.h];
    if (!Object.keys(g.familie.geraete).length) loescheFamilie(g.familieId, false);
    speichern();
    json(res, 200);
    return 200;
  }

  /** Entfernt nur die Adresse zum Token; ohne bestätigte Adresse fällt die Familie (ihre Geräte bekommen dann 410). */
  function abmelden(/** @type {string} */ t, /** @type {any} */ res) {
    const id = Object.keys(daten.familien).find((i) => t && Object.values(daten.familien[i].empfaenger).some((e) => e.abmeldeToken === t));
    if (id) {
      const adresse = /** @type {string} */ (Object.keys(daten.familien[id].empfaenger).find((a) => daten.familien[id].empfaenger[a].abmeldeToken === t));
      entferneEmpfaenger(id, adresse);
      speichern();
    }
    html(res, 200, abgemeldetSeite());
    return 200;
  }

  /** Warnhinweis der Knopfseite zur Anfrage mit diesem Token (weiteres Gerät bzw. zusätzlicher Empfänger), sonst leer. */
  const hinweisZu = (/** @type {string} */ t) => {
    const a = t ? Object.values(daten.anfragen).find((x) => x.token === t) : null;
    if (a?.art === "empfaenger") return zusaetzlichText(daten.familien[a.familie]?.name ?? "");
    return a?.weiteres ? WEITERES_GERAET : "";
  };

  const server = createServer(async (req, res) => {
    let ergebnis = 500;
    /** @type {string | undefined} */ let h;
    try {
      const url = new URL(req.url ?? "/", "http://dienst");
      // HEAD wie GET (Link-Prüfer, curl -I); Node lässt den Körper bei HEAD selbst weg.
      const weg = `${req.method === "HEAD" ? "GET" : req.method} ${url.pathname}`;
      const seitenAufruf = ["GET /bestaetigen", "POST /bestaetigen", "GET /abmelden", "POST /abmelden", "GET /datenschutz"].includes(weg);
      if (weg === "GET /datenschutz") { html(res, 200, datenschutzSeite()); ergebnis = 200; }
      // Link-Scanner rufen GET auf: GET zeigt nur einen Knopf, erst POST bestätigt bzw. meldet ab.
      else if (weg === "GET /bestaetigen") { html(res, 200, bestaetigenFrage(url.searchParams.get("t") ?? "", hinweisZu(url.searchParams.get("t") ?? ""))); ergebnis = 200; }
      else if (weg === "GET /abmelden") { html(res, 200, abmeldenFrage(url.searchParams.get("t") ?? "")); ergebnis = 200; }
      else if (weg === "POST /bestaetigen") ergebnis = bestaetigen(await formularToken(req), res);
      else if (weg === "POST /abmelden") ergebnis = abmelden(await formularToken(req), res);
      else if (!seitenAufruf && req.headers["x-app"] !== APP_SCHLUESSEL) { json(res, 403, { fehler: "app" }); ergebnis = 403; }
      else if (weg === "POST /anmelden") ergebnis = await anmelden(req, res);
      else if (weg === "GET /status") ergebnis = status(url, res);
      else if (["POST /ereignisse", "POST /einstellungen", "POST /probebrief", "DELETE /geraet", "POST /empfaenger", "GET /empfaenger", "DELETE /empfaenger"].includes(weg)) {
        const g = gerät(req);
        h = g.h;
        if (g.status !== 200) { json(res, g.status, { fehler: g.status === 410 ? "abgemeldet" : "schluessel" }); ergebnis = g.status; }
        else if (gesperrt(g.h ?? "") && weg !== "DELETE /geraet") { json(res, 403, { fehler: "gesperrt" }); ergebnis = 403; }
        else if (weg === "POST /ereignisse") ergebnis = await ereignisse(req, res, g);
        else if (weg === "POST /einstellungen") ergebnis = await einstellungen(req, res, g);
        else if (weg === "POST /probebrief") ergebnis = await probebrief(res, g);
        else if (weg === "POST /empfaenger") ergebnis = await empfaengerHinzufuegen(req, res, g);
        else if (weg === "GET /empfaenger") ergebnis = empfaengerListe(res, g);
        else if (weg === "DELETE /empfaenger") ergebnis = await empfaengerEntfernen(req, res, g);
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
