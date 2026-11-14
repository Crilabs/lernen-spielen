// Statischer Server für die Browser-Prüfungen (Prüfstand, Specs): liefert das Repo aus, mit Byte-Bereichen (Range).
//
// Warum Range: WebKit fragt Audio mit „Range: bytes=…“ an. Antwortet der Server nur mit 200 und der ganzen Datei,
// kennt WebKit die Dauer nicht (duration = Infinity) und meldet nie „ended“; jede Aufnahme wartete dann auf die
// 30-s-Notbremse in spiele/kern/stimme.js, die Lernplan-Einführung „zerlegen“ hing im Prüfstand über 2 Minuten
// (Probelauf M14). Die App (Tauri) und jeder richtige Webserver können Range.
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

export const TYPEN = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json", ".css": "text/css", ".svg": "image/svg+xml", ".mp3": "audio/mpeg",
  ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp",
};

/**
 * Antwort auf einen Range-Kopf: { start, ende } (einschließlich) oder null, wenn er fehlt oder nicht passt.
 * @param {string | undefined} kopf
 * @param {number} groesse
 */
export function bereich(kopf, groesse) {
  const m = /^bytes=(\d*)-(\d*)$/.exec(kopf ?? "");
  if (!m || (m[1] === "" && m[2] === "")) return null;
  let start, ende;
  if (m[1] === "") { start = Math.max(0, groesse - Number(m[2])); ende = groesse - 1; }   // die letzten n Bytes
  else { start = Number(m[1]); ende = m[2] === "" ? groesse - 1 : Math.min(Number(m[2]), groesse - 1); }
  return start <= ende && start < groesse ? { start, ende } : null;
}

/**
 * Startet den Server auf einem freien Port.
 * @param {string} wurzel Verzeichnis, das ausgeliefert wird
 * @param {Record<string, string>} [extra] Pfad → HTML, das es nur in diesem Server gibt
 * @returns {Promise<import("node:http").Server>}
 */
export function starteServer(wurzel, extra = {}) {
  const server = http.createServer(async (req, res) => {
    const pfad = decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname);
    if (pfad === "/favicon.ico") return void res.writeHead(204).end();
    if (extra[pfad] !== undefined) return void res.writeHead(200, { "content-type": TYPEN[".html"] }).end(extra[pfad]);
    const datei = join(wurzel, normalize(pfad));
    if (!datei.startsWith(wurzel)) return void res.writeHead(403).end();
    let inhalt;
    try {
      inhalt = await readFile(datei);
    } catch {
      return void res.writeHead(404).end("nicht gefunden");
    }
    const typ = TYPEN[extname(datei)] ?? "application/octet-stream";
    const b = req.headers.range ? bereich(req.headers.range, inhalt.length) : null;
    if (req.headers.range && !b)
      return void res.writeHead(416, { "content-range": `bytes */${inhalt.length}` }).end();
    if (b)
      return void res.writeHead(206, {
        "content-type": typ, "accept-ranges": "bytes", "content-length": b.ende - b.start + 1,
        "content-range": `bytes ${b.start}-${b.ende}/${inhalt.length}`,
      }).end(inhalt.subarray(b.start, b.ende + 1));
    res.writeHead(200, { "content-type": typ, "accept-ranges": "bytes", "content-length": inhalt.length }).end(inhalt);
  });
  return new Promise((ok) => server.listen(0, "127.0.0.1", () => ok(server)));
}
