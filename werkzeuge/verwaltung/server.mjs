#!/usr/bin/env node
// npm run verwaltung: lokale Seite für Christian (docs/superpowers/specs/2026-11-16-verwaltung-design.md).
// Nur an 127.0.0.1. Liest das Repo bei jedem Aufruf neu; schreibt nur die Warteschlange.

import { spawn } from "node:child_process";
import { closeSync, existsSync, mkdirSync, openSync, readFileSync, readSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { beantworte, ladeAuftraege, lehneAb, neuerAuftrag, speichereAuftraege, streiche, verschiebe } from "./auftraege.mjs";
import { baueUebersicht, liesQuellen } from "./daten.mjs";
import { ORDNER, WURZEL, anhalten, laufLog, letzterLaufFehler, pfade, sperre } from "./lauf.mjs";

const SEITE = join(ORDNER, "seite");
const TYPEN = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml" };
const AUFTRAG_ID = /^a-\d+-[a-z0-9]+$/;

/** Startet den Lauf als eigenen Prozess, damit er ein Beenden des Servers (Strg+C) übersteht. */
export function starteLaufGetrennt() {
  mkdirSync(dirname(laufLog(ORDNER)), { recursive: true });
  const log = openSync(laufLog(ORDNER), "w"); // je Start neu: die Seite zeigt den Fehler des letzten Laufs
  const kind = spawn(process.execPath, [join(ORDNER, "lauf.mjs"), "abarbeiten"], { cwd: WURZEL, detached: true, stdio: ["ignore", log, log] });
  closeSync(log);
  kind.unref();
}

/** Schätzung in Euro für einen neuen Auftrag (null = unbekannt). */
export function schaetze(uebersicht, art, ziel) {
  const s = uebersicht.schaetzung;
  if (art === "spiel") return s.spiel;
  if (art === "buch") return s.buch;
  if (art === "echte-dinge") return s.echteDingeJeThema === null ? null : s.echteDingeJeThema * (Array.isArray(ziel) ? ziel.length : 1);
  return null;
}

const ERLAUBTE_HOSTS = new Set(["127.0.0.1", "localhost"]);

/**
 * Schutz gegen fremde Webseiten im selben Browser (CSRF, DNS-Rebinding): nur Host 127.0.0.1/localhost, kein fremder
 * Origin, Änderungen nur als JSON (das erzwingt bei fremden Seiten eine Vorabfrage, die der Server nie erlaubt).
 * @returns {number} 0 = in Ordnung, sonst HTTP-Status
 */
export function pruefeHerkunft(req) {
  const host = (req.headers.host ?? "").replace(/:\d+$/, "");
  if (!ERLAUBTE_HOSTS.has(host)) return 403;
  const origin = req.headers.origin;
  if (origin !== undefined) {
    let o;
    try { o = new URL(origin); } catch { return 403; }
    if (!ERLAUBTE_HOSTS.has(o.hostname) || o.host !== req.headers.host) return 403;
  }
  if (req.method !== "GET" && !/^application\/json\b/.test(req.headers["content-type"] ?? "")) return 415;
  return 0;
}

export function erstelleServer({ wurzel = WURZEL, ordner = ORDNER, starteLauf = starteLaufGetrennt } = {}) {
  const p = pfade(ordner);
  const auftraege = () => ladeAuftraege(p.auftraege);
  const uebersicht = () => baueUebersicht(liesQuellen(wurzel), auftraege());

  return createServer(async (req, res) => {
    const antwort = (code, daten) => {
      res.writeHead(code, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
      res.end(JSON.stringify(daten));
    };
    const koerper = async () => {
      let t = "";
      for await (const s of req) t += s;
      return t ? JSON.parse(t) : {};
    };
    const abgewiesen = pruefeHerkunft(req);
    if (abgewiesen) return antwort(abgewiesen, { fehler: "Anfrage nur von der Seite der Verwaltung" });
    try {
      const url = new URL(req.url ?? "/", "http://127.0.0.1");
      const pfad = url.pathname;
      const post = req.method === "POST";

      if (!post && (pfad === "/" || pfad.startsWith("/seite/"))) {
        const rel = pfad === "/" ? "index.html" : decodeURIComponent(pfad.slice("/seite/".length));
        const datei = normalize(join(SEITE, rel));
        if (!datei.startsWith(SEITE + sep) || !existsSync(datei) || !statSync(datei).isFile()) return antwort(404, { fehler: "nicht gefunden" });
        res.writeHead(200, { "content-type": TYPEN[extname(datei)] ?? "application/octet-stream", "cache-control": "no-store" });
        return res.end(readFileSync(datei));
      }
      if (!post && pfad === "/api/uebersicht") return antwort(200, uebersicht());
      if (!post && pfad === "/api/auftraege") {
        return antwort(200, { auftraege: auftraege(), laeuft: !!sperre(ordner), sperre: sperre(ordner), anhalten: existsSync(p.anhalten), laufFehler: sperre(ordner) ? null : letzterLaufFehler(ordner) });
      }
      if (post && pfad === "/api/auftraege") {
        const { art, ziel } = await koerper();
        let a;
        try { a = neuerAuftrag({ art, ziel, schaetzung_eur: null }); } catch (e) { return antwort(400, { fehler: /** @type {any} */ (e).message }); }
        a.schaetzung_eur = schaetze(uebersicht(), a.art, a.ziel);
        speichereAuftraege(p.auftraege, [...auftraege(), a]);
        return antwort(201, a);
      }
      const m = pfad.match(/^\/api\/auftraege\/([^/]+)\/(hoch|runter|streichen)$/);
      if (post && m) {
        const l = auftraege();
        if (!l.some((a) => a.id === m[1])) return antwort(404, { fehler: "Auftrag nicht gefunden" });
        const neu = m[2] === "streichen" ? streiche(l, m[1]) : verschiebe(l, m[1], m[2] === "hoch" ? -1 : 1);
        speichereAuftraege(p.auftraege, neu);
        return antwort(200, { auftraege: neu });
      }
      const ant = pfad.match(/^\/api\/auftraege\/([^/]+)\/(antwort|ablehnen)$/);
      if (post && ant) {
        const l = auftraege();
        const alt = l.find((a) => a.id === ant[1]);
        if (!alt) return antwort(404, { fehler: "Auftrag nicht gefunden" });
        if (alt.status !== "wartet-auf-christian") return antwort(409, { fehler: "Auftrag wartet nicht auf eine Antwort" });
        if (ant[2] === "ablehnen") {
          const neu = lehneAb(l, alt.id);
          speichereAuftraege(p.auftraege, neu);
          return antwort(200, { auftraege: neu });
        }
        let r;
        try { r = beantworte(l, alt.id, (await koerper()).text); } catch (e) { return antwort(400, { fehler: /** @type {any} */ (e).message }); }
        speichereAuftraege(p.auftraege, r.liste);
        return antwort(201, r.neu);
      }
      if (post && pfad === "/api/abarbeiten") {
        if (sperre(ordner)) return antwort(409, { fehler: "Es läuft schon ein Lauf.", sperre: sperre(ordner) });
        await starteLauf();
        return antwort(202, { gestartet: true });
      }
      if (post && pfad === "/api/anhalten") {
        anhalten(ordner);
        return antwort(200, { anhalten: true });
      }
      const pr = pfad.match(/^\/api\/protokoll\/([^/]+)$/);
      if (!post && pr) {
        const id = decodeURIComponent(pr[1]);
        if (!AUFTRAG_ID.test(id) || !existsSync(p.protokoll(id))) return antwort(404, { fehler: "kein Protokoll" });
        const groesse = statSync(p.protokoll(id)).size;
        const ab = Math.min(Math.max(0, Number(url.searchParams.get("ab")) || 0), groesse);
        const puffer = Buffer.alloc(groesse - ab);
        const fd = openSync(p.protokoll(id), "r");
        try { readSync(fd, puffer, 0, puffer.length, ab); } finally { closeSync(fd); }
        return antwort(200, { text: puffer.toString("utf8"), groesse });
      }
      return antwort(404, { fehler: "nicht gefunden" });
    } catch (e) {
      return antwort(500, { fehler: /** @type {any} */ (e).message });
    }
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const port = Number(process.env.PORT) || 4711;
  erstelleServer().listen(port, "127.0.0.1", () => {
    const url = `http://127.0.0.1:${port}`;
    console.log(`Verwaltung: ${url}  (Strg+C beendet die Seite; ein laufender Auftrag läuft weiter)`);
    if (!process.env.KEIN_BROWSER) spawn("open", [url], { stdio: "ignore" }).on("error", () => {});
  });
}
