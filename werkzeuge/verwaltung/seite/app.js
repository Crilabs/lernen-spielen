// Seite der Verwaltung: liest /api/uebersicht und /api/auftraege, legt Aufträge an, steuert den Lauf.

import { abdeckung, baueLernweg, kette } from "./lernweg.js";

const $ = (s) => /** @type {HTMLElement} */ (document.querySelector(s));
const eur = (n) => (n === null || n === undefined ? "–" : n.toLocaleString("de-DE", { style: "currency", currency: "EUR" }));
const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const STATUS_TEXT = {
  fertig: "fertig", probe: "Probe – bitte spielen", geparkt: "geparkt", entwurf: "Entwurf", beauftragt: "beauftragt",
  geplant: "geplant", fehlt: "fehlt", wartet: "wartet", laeuft: "läuft", erledigt: "erledigt",
  "wartet-auf-christian": "wartet auf dich", beantwortet: "beantwortet", fehlgeschlagen: "fehlgeschlagen", gestrichen: "gestrichen",
};
const ART_TEXT = { spiel: "Spiel", "echte-dinge": "Mit echten Dingen", buch: "Buch", einfuehrung: "Einführung", frei: "Frei", antwort: "Antwort", ideen: "Ideen", aenderung: "Änderung" };
const plakette = (status, text = STATUS_TEXT[status] ?? status, titel = "") =>
  `<span class="plakette s-${esc(status)}" title="${esc(titel)}">${esc(text)}</span>`;

// ---------- Rückmeldungen (Spec 2026-11-17) ----------
// Gebaute Stücke bekommen den Knopf; Ungebaute nur, wenn schon ein Auftrag dafür offen ist (der Server prüft dasselbe).
const GEBAUT = ["probe", "fertig", "geparkt", "entwurf"]; // „beauftragt“ nur mit offenem Auftrag (nicht nur Ideen)
const OFFEN = ["wartet", "laeuft", "wartet-auf-christian"];
const BEREICH_TEXT = { spiel: "Spiel", buch: "Buch", "echte-dinge": "Mit echten Dingen" };
const gehoertZu = (a, bereich, id) => a.stueck?.bereich === bereich && a.stueck.ids.includes(id);
const offenerAuftrag = (bereich, id) => (A?.auftraege ?? []).some((a) => OFFEN.includes(a.status) && a.art !== "ideen" && gehoertZu(a, bereich, id));
/** Rückmeldungen zu einem Stück, neueste zuerst, mit dem Stand ihres Auftrags. */
const rueckmeldungenZu = (bereich, id) => (A?.auftraege ?? []).filter((a) => a.rueckmeldungen?.length && gehoertZu(a, bereich, id))
  .flatMap((a) => a.rueckmeldungen.map((x) => ({ ...x, status: a.status }))).sort((x, y) => y.zeit.localeCompare(x.zeit));
function rueckKnopf(bereich, id, titel, stand) {
  if (!GEBAUT.includes(stand) && !offenerAuftrag(bereich, id)) return "";
  const offen = rueckmeldungenZu(bereich, id).filter((x) => x.status === "wartet" || x.status === "laeuft").length;
  return ` <button class="klein rueck" data-rueck="${esc(bereich)}" data-ziel="${esc(id)}" data-titel="${esc(titel)}" title="Was soll anders werden?">Rückmeldung${offen ? ` (${offen} offen)` : ""}</button>`;
}

let U = /** @type {any} */ (null);
let A = /** @type {any} */ ({ auftraege: [], laeuft: false });
let gewaehlt = /** @type {string|null} */ (null);
let protokollAb = 0;
const zustand = { reiter: "spiele", fach: "", klasse: "", luecken: false, suche: "", lernwegFach: "mathe", lernwegThema: "", auftragFach: "", auftragStatus: "", erledigteZeigen: false };
try { Object.assign(zustand, JSON.parse(localStorage.getItem("verwaltung") ?? "{}")); } catch { /* ohne Speicher */ }
// alte Reiter (bis 16.11.) auf die neuen abbilden
zustand.reiter = ({ lernthemen: "spiele", sachthemen: "bibliothek" })[zustand.reiter] ?? zustand.reiter;
// Die Suche gilt nur, solange sie im Suchfeld steht; eine gemerkte Suche filterte unsichtbar (Christian, 2026-11-16).
zustand.suche = "";
const merke = () => { try { localStorage.setItem("verwaltung", JSON.stringify({ ...zustand, suche: "" })); } catch { /* egal */ } };

async function api(pfad, daten) {
  const r = await fetch(pfad, daten === undefined ? {} : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(daten) });
  const j = await r.json();
  if (!r.ok) throw new Error(j.fehler ?? `Fehler ${r.status}`);
  return j;
}

// ---------- Lernthemen ----------

const FERTIG = ["fertig", "probe"];
// Fach eines Spiels aus dem Buchstaben der Katalog-Id (wie werkzeuge/spielbau/bauheft.mjs, FAECHER)
const FACH_JE_BUCHSTABE = { M: "mathe", R: "geometrie", L: "lesen", Z: "sprechen", S: "schreiben", G: "grammatik" };
// Geplante Spiele beginnen mit Ideen (sofort, du wählst danach); nur ein geparktes Spiel wird direkt neu beauftragt
// (Christian, 2026-11-17: „die Warteschlange zeigt die Aufträge, die schon eine Idee haben“).
const spielPlus = (id, s) => s.status === "geplant"
  ? ` <button class="plus" data-auftrag="ideen" data-ziel="${esc(id)}" title="Ideen für ${esc(s.name)} (startet sofort)">+</button>`
  : s.status === "geparkt"
  ? ` <button class="plus" data-auftrag="spiel" data-ziel="${esc(id)}" title="${esc(s.name)} beauftragen">+</button>` : "";

/** @param {any} t @param {boolean} mitEinfuehrung nur bei Lernthemen ohne Spiel: ein Spiel bringt seine Einführung selbst mit */
function zeileLernthema(t, mitEinfuehrung) {
  const echt = plakette(t.echteDinge, STATUS_TEXT[t.echteDinge] + (t.echteDingeEur !== null ? ` · ${eur(t.echteDingeEur)}` : ""))
    + (t.echteDinge === "fehlt" ? ` <button class="plus" data-auftrag="echte-dinge" data-ziel="${esc(t.id)}" title="Mit echten Dingen beauftragen">+</button>` : "")
    + rueckKnopf("echte-dinge", t.id, `Mit echten Dingen: ${t.name}`, t.echteDinge);
  const einf = t.einfuehrung
    ? plakette("fertig", t.einfuehrung.replace(/^einfuehrungen\/|\.json$/g, ""))
    : t.einfuehrungBeauftragt ? plakette("beauftragt")
    : `<span class="leise-text">–</span> <button class="plus" data-auftrag="einfuehrung" data-ziel="${esc(t.id)}" title="Einführung beauftragen">+</button>`;
  return `<tr><td>${esc(t.name)}<span class="id">${esc(t.id)}</span><div class="leise-text">${esc(t.bereich)}</div></td>
    <td class="zahl-z">${t.klasse}</td><td>${echt}</td>${mitEinfuehrung ? `<td>${einf}</td>` : ""}</tr>`;
}

const themenTabelle = (liste, mitEinfuehrung = false) => `<table><thead><tr><th>Lernthema</th><th class="zahl-z">Kl.</th><th>Mit echten Dingen</th>${mitEinfuehrung ? "<th>Einführung (Vorlage)</th>" : ""}</tr></thead>
  <tbody>${liste.map((t) => zeileLernthema(t, mitEinfuehrung)).join("")}</tbody></table>`;

/** Spiele je Fach mit ihren Lernthemen; Lernthemen ohne Spiel am Ende des Fachs. */
function zeigeSpiele() {
  const offen = new Set([...document.querySelectorAll("#spiele details[open]")].map((d) => /** @type {HTMLElement} */ (d).dataset.schluessel));
  const erstesMal = !document.querySelector("#spiele details");
  const such = zustand.suche.toLowerCase();
  const themaPasst = (t) => !such || t.name.toLowerCase().includes(such) || t.id.includes(such);
  const lt = new Map(U.lernthemen.map((t) => [t.id, t]));
  const html = [];
  for (const f of U.faecher) {
    if (zustand.fach && zustand.fach !== f.id) continue;
    const spiele = Object.values(U.spiele)
      .map((s) => ({ s, themen: s.hauptthemen.map((id) => lt.get(id)).filter(Boolean) }))
      .filter(({ s }) => FACH_JE_BUCHSTABE[s.id[0]] === f.id)
      .sort((x, y) => Number(x.s.id.slice(1)) - Number(y.s.id.slice(1)));
    const zeilen = spiele.flatMap(({ s, themen }) => {
      if (zustand.klasse && !themen.some((t) => String(t.klasse) === zustand.klasse)) return [];
      if (zustand.luecken && FERTIG.includes(s.status) && themen.every((t) => t.echteDinge !== "fehlt")) return [];
      const spielTreffer = !such || s.name.toLowerCase().includes(such) || s.id.toLowerCase() === such;
      if (!spielTreffer && !themen.some(themaPasst)) return [];
      const klassen = themen.map((t) => t.klasse);
      const kl = klassen.length ? (Math.min(...klassen) === Math.max(...klassen) ? `${klassen[0]}` : `${Math.min(...klassen)}–${Math.max(...klassen)}`) : "";
      const echt = themen.filter((t) => t.echteDinge === "fertig").length;
      const schl = `spiel/${s.id}`;
      return [`<details class="spiel" data-schluessel="${esc(schl)}" ${offen.has(schl) || (such && !spielTreffer) ? "open" : ""}>
        <summary><span class="spiel-id">${esc(s.id)}</span><span class="titel">${esc(s.name)}</span>
          <span class="leise-text">Kl. ${kl}</span>${plakette(s.status)}${spielPlus(s.id, s)}${rueckKnopf("spiel", s.id, `${s.id} ${s.name}`, s.status)}${FERTIG.includes(s.status) ? `<span class="leise-text">Einführung im Spiel</span>` : ""}
          <span class="zahl-z">${s.eur !== null ? eur(s.eur) : ""}</span>
          <span class="stand">${themen.length} Lernthemen · Echte Dinge ${echt}/${themen.length}</span></summary>
        ${themen.length ? themenTabelle(themen) : `<p class="leer">Im Katalog stehen für dieses Spiel keine Hauptthemen, die der Lernplan kennt.</p>`}</details>`];
    });
    let ohne = U.lernthemen.filter((t) => t.strang === f.id && !t.spiele.length);
    if (zustand.klasse) ohne = ohne.filter((t) => String(t.klasse) === zustand.klasse);
    if (zustand.luecken) ohne = ohne.filter((t) => t.echteDinge === "fehlt");
    ohne = ohne.filter(themaPasst);
    if (ohne.length) {
      const schl = `ohne/${f.id}`;
      zeilen.push(`<details class="spiel ohne" data-schluessel="${esc(schl)}" ${offen.has(schl) || such ? "open" : ""}>
        <summary><span class="spiel-id">–</span><span class="titel">Ohne Spiel</span>
          <span class="stand">${ohne.length} Lernthemen ohne Katalog-Spiel</span></summary>${themenTabelle(ohne, true)}</details>`);
    }
    if (!zeilen.length) continue;
    const fertig = spiele.filter(({ s }) => FERTIG.includes(s.status)).length;
    const fs = `fach/${f.id}`;
    html.push(`<details class="gruppe fachgruppe" data-schluessel="${esc(fs)}" ${offen.has(fs) || erstesMal || zustand.fach || such ? "open" : ""}>
      <summary><span class="fach" style="background:${esc(f.farbe)}"></span><span class="titel">${esc(f.name)}</span>
      <span class="stand">${spiele.length} Spiele · fertig oder Probe ${fertig}</span></summary>${zeilen.join("")}</details>`);
  }
  $("#spiele").innerHTML = html.join("") || `<p class="leer">Keine Spiele für diesen Filter.</p>`;
}

// ---------- Bibliothek ----------

/** Bücher je Raum und Regal; Sachthemen ohne Buch am Ende. */
function zeigeBibliothek() {
  const offen = new Set([...document.querySelectorAll("#bibliothek details[open]")].map((d) => /** @type {HTMLElement} */ (d).dataset.schluessel));
  const erstesMal = !document.querySelector("#bibliothek details");
  const such = zustand.suche.toLowerCase();
  const sach = new Map(U.sachthemen.map((w) => [w.id, w]));
  const buchPasst = (b) => {
    const themen = b.sachthemen.map((id) => sach.get(id)).filter(Boolean);
    if (zustand.klasse && !themen.some((w) => String(w.klasse) === zustand.klasse)) return false;
    if (zustand.luecken && b.status === "fertig") return false;
    return !such || b.titel.toLowerCase().includes(such) || b.id.includes(such) || themen.some((w) => w.name.toLowerCase().includes(such));
  };
  const zeileBuch = (b) => `<tr><td>${esc(b.titel)}<span class="id">${esc(b.id)}</span></td>
    <td>${plakette(b.status)}${b.status === "geplant" ? ` <button class="plus" data-auftrag="buch" data-ziel="${esc(b.id)}" title="Buch „${esc(b.titel)}“ beauftragen">+</button>` : ""}${rueckKnopf("buch", b.id, b.titel, b.status)}</td>
    <td class="zahl-z">${b.eur !== null ? eur(b.eur) : ""}</td>
    <td class="leise-text">${esc(b.sachthemen.map((id) => sach.get(id)?.name ?? id).join(", "))}</td></tr>`;
  const html = U.bibliothek.map((raum) => {
    const regale = raum.regale.map((regal) => {
      const buecher = regal.buecher.filter(buchPasst);
      if (!buecher.length) return "";
      const schl = `regal/${raum.id}/${regal.id}`;
      const fertig = regal.buecher.filter((b) => b.status === "fertig").length;
      return `<details class="spiel" data-schluessel="${esc(schl)}" ${offen.has(schl) || such ? "open" : ""}>
        <summary><span class="titel">${esc(regal.name)}</span><span class="stand">${regal.buecher.length} ${regal.buecher.length === 1 ? "Buch" : "Bücher"} · fertig ${fertig}</span></summary>
        <table><thead><tr><th>Buch</th><th>Status</th><th class="zahl-z">Kosten</th><th>Sachthema</th></tr></thead>
        <tbody>${buecher.map(zeileBuch).join("")}</tbody></table></details>`;
    }).join("");
    if (!regale) return "";
    const schl = `raum/${raum.id}`;
    return `<details class="gruppe fachgruppe" data-schluessel="${esc(schl)}" ${offen.has(schl) || erstesMal || such ? "open" : ""}>
      <summary><span class="titel">${esc(raum.name)}</span><span class="stand">${raum.regale.length} ${raum.regale.length === 1 ? "Regal" : "Regale"}</span></summary>${regale}</details>`;
  });
  let ohne = U.sachthemen.filter((w) => !w.buecher.length);
  if (zustand.klasse) ohne = ohne.filter((w) => String(w.klasse) === zustand.klasse);
  if (such) ohne = ohne.filter((w) => w.name.toLowerCase().includes(such) || w.id.includes(such));
  if (ohne.length) {
    const schl = "ohne-buch";
    html.push(`<details class="gruppe fachgruppe" data-schluessel="${schl}" ${offen.has(schl) || such ? "open" : ""}>
      <summary><span class="titel">Sachthemen ohne Buch</span><span class="stand">${ohne.length} Sachthemen</span></summary>
      <table><thead><tr><th>Sachthema</th><th class="zahl-z">Kl.</th><th>Worum es geht</th></tr></thead><tbody>
      ${ohne.map((w) => `<tr><td>${esc(w.name)}<span class="id">${esc(w.id)}</span></td><td class="zahl-z">${w.klasse ?? ""}</td>
        <td class="leise-text">${esc(w.beschreibung)}</td></tr>`).join("")}</tbody></table></details>`);
  }
  $("#bibliothek").innerHTML = html.join("") || `<p class="leer">Keine Bücher für diesen Filter.</p>`;
}

// ---------- Aufträge ----------

// Filter der Aufträge (Christian, 2026-11-22): nach Fach und Status; Abgeschlossenes erst auf Wunsch
const ABGESCHLOSSEN = ["erledigt", "beantwortet", "gestrichen"];
const STATUS_REIHE = ["wartet", "laeuft", "wartet-auf-christian", "fehlgeschlagen", "erledigt", "beantwortet", "gestrichen"];
const SONDER_FACH = { buecher: "Bücher", ohne: "ohne Fach" };

/** Fächer eines Auftrags: Spiele über den Buchstaben der Id, Lernthemen über ihren Strang, Bücher eigen, freie ohne. */
function faecherVon(a) {
  const st = a.stueck ?? (a.art === "ideen" ? { bereich: "spiel", ids: [a.ziel] }
    : a.art === "einfuehrung" ? { bereich: "echte-dinge", ids: [a.ziel] } : null);
  if (!st) return ["ohne"];
  if (st.bereich === "buch") return ["buecher"];
  const ids = st.ids ?? [];
  const f = st.bereich === "spiel" ? ids.map((id) => FACH_JE_BUCHSTABE[String(id)[0]]) : ids.map((id) => lernthema(id)?.strang);
  const da = [...new Set(f.filter(Boolean))];
  return da.length ? da : ["ohne"];
}

/** Filterleiste und die Aufträge, die durch den Filter kommen. */
function auftragFilter(l) {
  const statusPasst = (a) => zustand.auftragStatus ? a.status === zustand.auftragStatus : zustand.erledigteZeigen || !ABGESCHLOSSEN.includes(a.status);
  const fachPasst = (a) => !zustand.auftragFach || faecherVon(a).includes(zustand.auftragFach);
  const zahlFach = (f) => l.filter((a) => statusPasst(a) && (!f || faecherVon(a).includes(f))).length;
  const zahlStatus = (st) => l.filter((a) => fachPasst(a) && (!st ? zustand.erledigteZeigen || !ABGESCHLOSSEN.includes(a.status) : a.status === st)).length;
  const faecher = [...(U?.faecher ?? []).map((f) => [f.id, f.name]), ...Object.entries(SONDER_FACH)];
  const opt = (wert, text, gewaehlt, n) => `<option value="${esc(wert)}" ${gewaehlt ? "selected" : ""}>${esc(text)} (${n})</option>`;
  const leiste = `<div class="leiste auftrag-filter">
    <label>Fach <select data-af="auftragFach">${opt("", "alle", !zustand.auftragFach, zahlFach(""))}
      ${faecher.map(([id, name]) => opt(id, name, zustand.auftragFach === id, zahlFach(id))).join("")}</select></label>
    <label>Status <select data-af="auftragStatus">${opt("", zustand.erledigteZeigen ? "alle" : "alle offenen", !zustand.auftragStatus, zahlStatus(""))}
      ${STATUS_REIHE.map((st) => opt(st, STATUS_TEXT[st] ?? st, zustand.auftragStatus === st, zahlStatus(st))).join("")}</select></label>
    <button class="zweit" data-erledigte aria-pressed="${zustand.erledigteZeigen}" title="erledigt, beantwortet und gestrichen">${zustand.erledigteZeigen ? "Erledigte ausblenden" : "Erledigte zeigen"}</button>
  </div>`;
  return { leiste, passt: (a) => statusPasst(a) && fachPasst(a) };
}

function zeigeAuftraege() {
  const l = A.auftraege;
  const filter = auftragFilter(l);
  const wartend = l.filter((a) => a.status === "wartet" && a.art !== "ideen");
  const summe = wartend.reduce((s, a) => s + (a.schaetzung_eur ?? 0), 0);
  const unbekannt = wartend.some((a) => a.schaetzung_eur === null);
  $("#zahl-offen").textContent = wartend.length ? String(wartend.length) : "";
  const laeuft = l.find((a) => a.status === "laeuft");
  if (!gewaehlt && laeuft) gewaehlt = laeuft.id;
  // wartende in Warteschlangen-Reihenfolge oben, danach der Rest, neueste zuerst
  const wartendeReihe = l.filter((a) => a.status === "wartet" && a.art !== "ideen");
  const rest = [...l].reverse().filter((a) => !wartendeReihe.includes(a));
  const sichtbar = [...wartendeReihe, ...rest].filter(filter.passt);
  const tabelle = sichtbar.map((a) => {
    const steuer = a.status === "wartet"
      ? `<button class="klein" data-schritt="hoch" data-id="${esc(a.id)}" title="nach oben">↑</button>
         <button class="klein" data-schritt="runter" data-id="${esc(a.id)}" title="nach unten">↓</button>
         <button class="klein" data-schritt="streichen" data-id="${esc(a.id)}">streichen</button>`
      : a.status === "wartet-auf-christian" && a.art === "ideen"
      ? `<button class="klein" data-reiter="ideen" title="Zu den Ideen">Ideen ansehen</button>`
      : a.status === "wartet-auf-christian"
      ? `<button class="klein" data-antwort="Ja" data-id="${esc(a.id)}" title="Ja: Folgeauftrag in die Warteschlange">Ja</button>
         <button class="klein" data-antworten="${esc(a.id)}" title="Eigene Antwort schreiben">Antworten …</button>
         <button class="klein" data-schritt="ablehnen" data-id="${esc(a.id)}" title="Nein: kein Lauf, Auftrag erledigt">Nein</button>` : "";
    const zeit = a.beendet ? new Date(a.beendet).toLocaleString("de-DE") : a.gestartet ? `seit ${new Date(a.gestartet).toLocaleTimeString("de-DE")}` : "";
    const frage = a.ergebnis?.frage ? `<div class="leise-text">Frage: ${esc(a.ergebnis.frage)}</div>` : "";
    const zus = a.ergebnis?.zusammenfassung ? `<div class="leise-text">${esc(a.ergebnis.zusammenfassung)}</div>` : "";
    const bezug = a.art === "antwort" ? l.find((x) => x.id === a.ziel) : null;
    const befehl = a.art === "antwort"
      ? `${bezug?.notiz ? `${bezug.notiz} – ` : ""}auf: ${bezug?.befehl ?? a.ziel}`
      : a.befehl;
    const notiz = a.notiz && a.status !== "beantwortet" ? `<div class="leise-text">${esc(a.notiz)}</div>` : "";
    const rueck = a.rueckmeldungen?.length ? `<ul class="rueckmeldungen leise-text">${a.rueckmeldungen.map((x) => `<li>Rückmeldung: ${esc(x.text)}</li>`).join("")}</ul>` : "";
    return `<tr data-zeile="${esc(a.id)}" class="${a.id === gewaehlt ? "gewaehlt" : ""}">
      <td>${esc(ART_TEXT[a.art] ?? a.art)}</td><td class="befehl">${esc(befehl)}${zus}${frage}${notiz}${rueck}</td>
      <td class="zahl-z">${eur(a.schaetzung_eur)}</td><td>${plakette(a.status)}</td><td class="leise-text">${esc(zeit)}</td>
      <td>${steuer} <button class="klein" data-protokoll="${esc(a.id)}">Protokoll</button></td></tr>`;
  }).join("");
  const knopf = A.laeuft
    ? `<button class="haupt" disabled>Lauf aktiv${A.sperre?.wer === "chat" ? " (im Chat)" : ""}</button>
       <button class="zweit" id="anhalten" ${A.anhalten ? "disabled" : ""}>${A.anhalten ? "hält nach dem aktuellen an" : "nach dem aktuellen anhalten"}</button>`
    : `<button class="haupt" id="abarbeiten" ${wartend.length ? "" : "disabled"}>Warteschlange abarbeiten (${wartend.length}, ca. ${eur(summe)}${unbekannt ? " + unbekannt" : ""})</button>`;
  const fehler = A.laufFehler ? `<p class="plakette s-fehlgeschlagen" style="white-space:normal">Letzter Lauf: ${esc(A.laufFehler)}</p>` : "";
  $("#auftraege").innerHTML = `${fehler}
    <div class="leiste">${knopf}
      <form id="frei" class="leiste" style="margin:0"><input name="text" placeholder="Freier Auftrag …" size="40" style="padding:6px 8px;border:1px solid var(--linie);border-radius:6px;background:var(--flaeche)">
      <button class="zweit">anlegen</button></form></div>
    ${l.length ? filter.leiste : ""}
    ${sichtbar.length ? `<div class="karte"><table><thead><tr><th>Art</th><th>Auftrag</th><th class="zahl-z">Schätzung</th><th>Status</th><th>Zeit</th><th></th></tr></thead>
      <tbody>${tabelle}</tbody></table></div>`
      : l.length ? `<p class="leer">Keine Aufträge für diesen Filter${zustand.erledigteZeigen ? "" : " – Erledigte sind ausgeblendet"}.</p>`
      : `<p class="leer">Noch keine Aufträge. In Spiele oder Bibliothek mit + anlegen.</p>`}
    ${gewaehlt ? `<h3>Protokoll</h3><pre class="protokoll" id="protokoll"></pre>` : ""}`;
  protokollAb = 0;
  if (gewaehlt) ladeProtokoll();
}

async function ladeProtokoll() {
  const pre = document.getElementById("protokoll");
  if (!pre || !gewaehlt) return;
  try {
    const r = await fetch(`/api/protokoll/${gewaehlt}?ab=${protokollAb}`);
    if (!r.ok) { if (!protokollAb) pre.textContent = "(noch kein Protokoll)"; return; }
    const j = await r.json();
    const unten = pre.scrollTop + pre.clientHeight >= pre.scrollHeight - 8;
    pre.textContent = (protokollAb ? pre.textContent : "") + j.text;
    protokollAb = j.groesse;
    if (unten) pre.scrollTop = pre.scrollHeight;
  } catch { /* nächster Versuch beim nächsten Abruf */ }
}

// ---------- Ideen ----------

/** Kreis am Reiter: Ideen, die auf deine Wahl warten. */
function zaehleIdeen() {
  const n = (A?.auftraege ?? []).filter((a) => a.art === "ideen" && a.status === "wartet-auf-christian").length;
  $("#zahl-ideen").textContent = n ? String(n) : "";
}

const offeneIdeen = () => (A?.auftraege ?? []).filter((a) => a.art === "ideen" && ["wartet", "laeuft", "wartet-auf-christian"].includes(a.status));
/** Entwürfe der eigenen Idee je Auftrag: Das Nachladen alle 2,5 s zeichnet die Ansicht neu, der Text bleibt. */
const entwuerfe = {};

/** Lernthema eines Spiels: je Hauptthema Name, Klasse, Bereich, Ziel, Beispiele und wozu. */
function lernthemaBlock(spiel) {
  const themen = (spiel?.hauptthemen ?? []).map((id) => U.lernthemen.find((t) => t.id === id)).filter(Boolean);
  if (!themen.length) return `<p class="leise-text">Keine Hauptthemen im Katalog.</p>`;
  return `<ul class="lernthema">${themen.map((t) => `<li>
      <b>${esc(t.name)}</b> <span class="leise-text">Kl. ${t.klasse}, ${esc(t.bereich ?? "")}</span>
      ${t.ziel ? `<div class="ziel">${esc(t.ziel)}</div>` : ""}
      ${t.beispiele?.length ? `<div class="leise-text">Beispiele: ${esc(t.beispiele.slice(0, 4).join(", "))}</div>` : ""}
      ${t.zweck ? `<div class="leise-text">Wozu: ${esc(t.zweck)}</div>` : ""}
    </li>`).join("")}</ul>`;
}

/** Skizzentext: je Zeile ein Absatz, „- “ am Anfang fällt weg, **fett** wird fett (alles andere bleibt escaped). */
const skizze = (text) => String(text ?? "").split("\n").map((z) => z.replace(/^\s*[-*]\s+/, "").trim()).filter(Boolean)
  .map((z) => `<p>${esc(z).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")}</p>`).join("");

function zeigeIdeen() {
  const liste = offeneIdeen();
  if (!liste.length) {
    $("#ideen").innerHTML = `<p class="leer">Gerade warten keine Ideen. Ein „+“ bei einem geplanten Spiel im Reiter Spiele erzeugt drei.</p>`;
    return;
  }
  $("#ideen").innerHTML = liste.map((a) => {
    const spiel = U.spiele[a.ziel];
    const ideen = Array.isArray(a.ergebnis?.ideen) ? a.ergebnis.ideen : [];
    const karten = a.status !== "wartet-auf-christian"
      ? `<p class="leise-text">Die drei Ideen entstehen gerade (meist ein paar Minuten).</p>`
      : `<div class="ideen-karten">${ideen.map((x, i) => `<div class="idee">
          <h3>${esc(x.titel)}</h3><div class="skizze">${skizze(x.text)}</div>
          <button class="zweit" data-wahl-karte="${i + 1}" data-id="${esc(a.id)}">Diese bauen</button></div>`).join("")}
        <div class="idee eigene">
          <h3>Eigene Idee</h3>
          <textarea data-entwurf="${esc(a.id)}" maxlength="4000" placeholder="Held, was das Kind tut, was dann passiert … Du kannst dich auf die anderen Karten beziehen.">${esc(entwuerfe[a.id] ?? "")}</textarea>
          <button class="zweit" data-eigene-bauen="${esc(a.id)}">Diese bauen</button></div></div>`;
    return `<article class="karte ideen-block">
      <header><h2>${esc(a.ziel)} ${esc(spiel?.name ?? "")}</h2>
        ${a.status === "wartet-auf-christian" ? `<button class="klein" data-schritt="ablehnen" data-id="${esc(a.id)}" title="Keine davon, nichts bauen">Keine davon</button>` : plakette(a.status)}</header>
      ${lernthemaBlock(spiel)}
      ${karten}
    </article>`;
  }).join("");
}

// ---------- Proben ----------

function zeigeProben() {
  const proben = Object.values(U.spiele).filter((s) => s.status === "probe");
  $("#proben").innerHTML = proben.length
    ? `<p class="leise-text">Fertig ist ein Spiel erst, wenn du oder Noelia es zwei Minuten gespielt habt. „Probe abschließen“ nimmt die
        Markierung aus spiele/spiele.json und committet nur diese Datei auf main (kein Push). Soll etwas anders werden, schreib es
        unter „Rückmeldung“ und schließ die Probe erst nach der Änderung ab.</p>
      <div class="karte"><table><thead><tr><th>Id</th><th>Spiel</th><th>Hauptthemen</th><th class="zahl-z">Kosten</th><th></th></tr></thead><tbody>
      ${proben.map((s) => `<tr><td>${esc(s.id)}</td><td>${esc(s.name)}</td>
        <td class="leise-text">${esc(s.hauptthemen.join(", "))}</td><td class="zahl-z">${eur(s.eur)}</td>
        <td style="white-space:nowrap"><a class="knopf-link" href="/spiele/${esc(s.ordner)}" target="_blank" rel="noopener">Spielen</a>
          ${rueckKnopf("spiel", s.id, `${s.id} ${s.name}`, s.status)}
          <button class="klein" data-probe="${esc(s.id)}">Probe abschließen</button></td></tr>`).join("")}
      </tbody></table></div>`
    : `<p class="leer">Gerade ist kein Spiel zur Probe.</p>`;
}

// ---------- Kosten ----------

function zeigeKosten() {
  const k = U.kosten;
  const ps = k.spiele, pa = k.analog, pb = k.buecher;
  const offenAnalog = pa.prognose === null ? null : Math.max(0, pa.prognose - pa.summe.eur);
  const kennzahl = (wert, text) => `<div class="kennzahl"><b>${wert}</b><span>${esc(text)}</span></div>`;
  const zeileSumme = (name, s, extra = "") => `<tr><td>${esc(name)}${extra}</td><td class="zahl-z">${eur(s.claude.eur)}</td>
    <td class="zahl-z">${s.bilder.anzahl} · ${eur(s.bilder.eur)}</td><td class="zahl-z">${s.stimme.zeichen.toLocaleString("de-DE")} · ${eur(s.stimme.eur)}</td>
    <td class="zahl-z"><b>${eur(s.eur)}</b></td></tr>`;
  const kopf = `<thead><tr><th>Stück</th><th class="zahl-z">Claude</th><th class="zahl-z">Bilder</th><th class="zahl-z">Stimme</th><th class="zahl-z">gesamt</th></tr></thead>`;
  $("#kosten").innerHTML = `
    <div class="kennzahlen">
      ${kennzahl(eur(k.gesamtEur), "bisher ausgegeben (erfasst)")}
      ${kennzahl(eur(ps.ausgegeben), `Spiele (${ps.je.length})`)}
      ${kennzahl(eur(pa.summe.eur), `Mit echten Dingen (${pa.themen} Themen)`)}
      ${kennzahl(eur(pb.ausgegeben + k.bibliothekEur), `Bücher (${pb.fertig}) und Raumbilder`)}
    </div>
    <div class="karte"><h3>Prognose für das Offene</h3><table>
      <tr><td>Spiele: ${ps.offen} von ${k.katalog} noch nicht begonnen, je ${eur(ps.durchschnitt?.eur ?? null)} (neuer Spielbau, ${ps.basisSpiele} Spiel${ps.basisSpiele === 1 ? "" : "e"})</td><td class="zahl-z">${eur(ps.rest?.mittel ?? null)}</td></tr>
      <tr><td>Mit echten Dingen: ${pa.themenGesamt - pa.themen} Themen offen, je ${eur(pa.jeThema)}</td><td class="zahl-z">${eur(offenAnalog)}</td></tr>
      <tr><td>Bücher: ${pb.offen} geplant, je ${eur(pb.durchschnitt)}</td><td class="zahl-z">${eur(pb.rest)}</td></tr>
    </table></div>
    <div class="karte"><h3>Spiele</h3><table>${kopf}<tbody>${ps.je.map((x) => zeileSumme(x.name, x.s, x.geparkt ? " " + plakette("geparkt") : "")).join("") || `<tr><td colspan="5" class="leer">noch keins</td></tr>`}</tbody></table></div>
    <div class="karte"><h3>Bücher</h3><table>${kopf}<tbody>${pb.je.map((x) => zeileSumme(x.name, x.s)).join("")}</tbody></table>
      <p class="leise-text" style="margin:8px 12px">Raumbilder der Bibliothek: ${eur(k.bibliothekEur)}</p></div>
    <div class="karte"><h3>Mit echten Dingen</h3><table>${kopf}<tbody>${zeileSumme(`${pa.themen} Themen`, pa.summe)}</tbody></table></div>
    <p class="leise-text">Erfasst sind nur Kosten, die die Skills in kosten.json buchen; freie Sitzungen fehlen. Rechnung wie <code>npm run kosten</code>.</p>`;
}

// ---------- Lernweg (Spec 2026-11-22) ----------
// Je Fach alle Lernthemen mit Pfeilen von der Voraussetzung zum Folgethema; Farbe = Abdeckung; Klick zeigt die Kette.

const ABDECKUNG_TEXT = { spiel: "Spiel da", echte: "nur Mit echten Dingen", fehlt: "nichts" };
/** @type {ReturnType<typeof baueLernweg>|null} */
let lw = null;
let lwSchluessel = "";
let lwSuche = "";
/** gemerkter Ausschnitt je Fach und Klasse */
const lwAusschnitte = /** @type {Record<string, { s: number, x: number, y: number }>} */ ({});
let blick = { s: 1, x: 0, y: 0 };
const fachName = (id) => U.faecher.find((f) => f.id === id)?.name ?? id;
const lernthema = (id) => (U?.lernthemen ?? []).find((t) => t.id === id);

function zeigeLernweg() {
  const fach = zustand.lernwegFach;
  const schl = `${fach}/${zustand.klasse}`;
  lw = baueLernweg(U.lernthemen, fach, zustand.klasse);
  const lt = new Map(U.lernthemen.map((t) => [t.id, t]));
  const zahl = { spiel: 0, echte: 0, fehlt: 0 };
  let inArbeit = 0;
  const baender = lw.baender.map((b, i) => `<rect class="lw-band k${i % 2}" x="${b.x}" y="0" width="${b.breite}" height="${lw?.hoehe}"/>
    <text class="lw-band-text" x="${b.x + 12}" y="22">Klasse ${b.klasse}</text>`).join("");
  const kanten = lw.kanten.map((k) => `<path class="lw-kante" data-k="${esc(k.von)}>${esc(k.nach)}" d="${k.d}" marker-end="url(#lw-pfeil)"/>`).join("");
  const knoten = lw.knoten.map((n) => {
    const t = lt.get(n.id);
    let klasse = "lw-knoten", text = n.name;
    if (n.stummel) { klasse += " stummel"; text = n.stummel === "fach" ? `aus ${fachName(n.strang)}: ${n.name}` : `aus Kl. ${n.klasse}: ${n.name}`; }
    else {
      const a = abdeckung(t, U.spiele);
      zahl[a.art]++;
      if (a.inArbeit) inArbeit++;
      klasse += ` a-${a.art}${a.inArbeit ? " in-arbeit" : ""}`;
    }
    return `<g class="${klasse}" data-lw-id="${esc(n.id)}" transform="translate(${n.x},${n.y})">
      <rect width="${n.b}" height="${n.h}" rx="7"/>
      <foreignObject width="${n.b}" height="${n.h}"><div class="lw-zelle" xmlns="http://www.w3.org/1999/xhtml"><span class="lw-name">${esc(text)}</span></div></foreignObject>
      <title>${esc(text)} · Kl. ${n.klasse} · ${esc(n.bereich)}</title></g>`;
  }).join("");
  $("#lw-blick").innerHTML = baender + kanten + knoten;
  const echt = lw.knoten.filter((n) => !n.stummel).length;
  $("#lw-leiste").innerHTML = `<b>${esc(fachName(fach))}</b><span class="leise-text">${echt} Lernthemen${zustand.klasse ? ` in Klasse ${esc(zustand.klasse)}` : ""}</span>
    <span class="lw-legende a-spiel">${ABDECKUNG_TEXT.spiel} ${zahl.spiel}</span>
    <span class="lw-legende a-echte">${ABDECKUNG_TEXT.echte} ${zahl.echte}</span>
    <span class="lw-legende a-fehlt">${ABDECKUNG_TEXT.fehlt} ${zahl.fehlt}</span>
    <span class="lw-legende in-arbeit">gestrichelt: beauftragt ${inArbeit}</span>
    <span class="lw-knoepfe"><button class="zweit" data-lw="minus" title="kleiner">−</button><button class="zweit" data-lw="plus" title="größer">+</button>
    <button class="zweit" data-lw="einpassen">einpassen</button></span>
    <span class="leise-text">Ziehen verschiebt · ⌘ + Scrollen oder Zusammenziehen zoomt · Klick zeigt die Kette</span>`;

  const neu = lwSchluessel !== schl;
  lwSchluessel = schl;
  const such = zustand.suche.toLowerCase();
  const treffer = such ? lw.knoten.filter((n) => !n.stummel && (n.name.toLowerCase().includes(such) || n.id.includes(such))) : [];
  document.querySelectorAll("#lw-blick .lw-knoten").forEach((g) => g.classList.toggle("treffer", treffer.some((n) => n.id === /** @type {HTMLElement} */ (g).dataset.lwId)));
  if (such !== lwSuche) {
    lwSuche = such;
    if (treffer.length && !treffer.some((n) => n.id === zustand.lernwegThema)) zustand.lernwegThema = treffer[0].id;
    markiereLernweg();
    if (treffer.length) zentriere(zustand.lernwegThema);
    return;
  }
  markiereLernweg();
  if (!neu) setzeBlick();
  else if (lwAusschnitte[schl]) { blick = { ...lwAusschnitte[schl] }; setzeBlick(); }
  else if (lw.knoten.some((n) => n.id === zustand.lernwegThema)) zentriere(zustand.lernwegThema);
  else anfang();
}

/** Start: lesbar am Anfang des Wegs (Klasse 1 links); passt das ganze Fach lesbar hinein, eingepasst. */
function anfang() {
  if (!lw) return;
  const r = $("#lw-flaeche").getBoundingClientRect();
  const s = 0.8;
  if (lw.breite * s <= r.width - 40 && lw.hoehe * s <= r.height - 20) return einpassen();
  blick = { s, x: 20, y: Math.min(10, r.height / 2 - (lw.hoehe * s) / 2) };
  setzeBlick();
}

/** Hebt die Kette des gewählten Themas hervor und füllt das Feld rechts. */
function markiereLernweg() {
  const id = zustand.lernwegThema;
  const da = !!lw && lw.knoten.some((n) => n.id === id && !n.stummel);
  const k = da && lw ? kette(lw, id) : null;
  $("#lw-svg").classList.toggle("fokus", !!k);
  document.querySelectorAll("#lw-blick .lw-knoten").forEach((g) => {
    const gid = /** @type {HTMLElement} */ (g).dataset.lwId ?? "";
    g.classList.toggle("an", !!k?.knoten.has(gid));
    g.classList.toggle("gewaehlt", gid === id);
  });
  document.querySelectorAll("#lw-blick .lw-kante").forEach((p) => p.classList.toggle("an", !!k?.kanten.has(/** @type {HTMLElement} */ (p).dataset.k ?? "")));
  const feld = $("#lw-feld");
  feld.hidden = !da;
  if (!da) return;
  const t = lernthema(id);
  const a = abdeckung(t, U.spiele);
  const verweis = (x) => `<li><button data-lw-thema="${esc(x.id)}">${x.strang !== t.strang ? `<span class="leise-text">${esc(fachName(x.strang))}:</span> ` : ""}${esc(x.name)}</button>
    <span class="leise-text">Kl. ${x.klasse}</span> <span class="lw-punkt a-${abdeckung(x, U.spiele).art}"></span></li>`;
  const vorher = t.voraussetzungen.map(lernthema).filter(Boolean);
  const nachher = U.lernthemen.filter((x) => x.voraussetzungen.includes(id));
  const spiele = t.spiele.map((s) => U.spiele[s]).filter(Boolean);
  feld.innerHTML = `<button class="lw-zu leise" data-lw="zu" title="schließen (Esc)">schließen</button>
    <h3>${esc(t.name)}</h3>
    <div class="leise-text">${esc(t.id)} · Kl. ${t.klasse} · ${esc(t.bereich)}</div>
    ${t.ziel ? `<p>${esc(t.ziel)}</p>` : ""}
    <h4>Abdeckung</h4>
    <p><span class="lw-legende a-${a.art}${a.inArbeit ? " in-arbeit" : ""}">${ABDECKUNG_TEXT[a.art]}</span></p>
    <h4>Digitale Spiele (${spiele.length})</h4>
    <ul class="lw-liste lw-angebot">${spiele.map((s) => `<li><span class="leise-text">${esc(s.id)}</span> ${esc(s.name)}<div>${plakette(s.status)}${lwSpielAktion(s)}</div></li>`).join("")
      || `<li class="leise-text">Kein Spiel im Katalog nennt dieses Thema – ein digitales Spiel braucht erst einen Katalog-Eintrag.</li>`}</ul>
    <h4>Mit echten Dingen</h4>
    <ul class="lw-liste lw-angebot"><li>${plakette(t.echteDinge)}${lwEchtAktion(t)}</li></ul>
    <h4>Voraussetzungen (${vorher.length})</h4>
    <ul class="lw-liste">${vorher.map(verweis).join("") || `<li class="leise-text">keine – ein Anfang</li>`}</ul>
    <h4>Baut darauf auf (${nachher.length})</h4>
    <ul class="lw-liste">${nachher.map(verweis).join("") || `<li class="leise-text">nichts – ein Ende des Wegs</li>`}</ul>`;
}

/** Knöpfe zu einem Spiel im Feld: spielen, beauftragen (geplant: erst Ideen, geparkt: weiterbauen), Rückmeldung. */
function lwSpielAktion(s) {
  const teile = [];
  if (FERTIG.includes(s.status) && s.ordner) teile.push(`<a class="knopf-link" href="/spiele/${esc(s.ordner)}" target="_blank" rel="noopener">Spielen ↗</a>`);
  if (s.status === "geplant") teile.push(`<button class="klein" data-auftrag="ideen" data-ziel="${esc(s.id)}" title="Drei Ideen, du wählst danach – dann wird gebaut">beauftragen (erst 3 Ideen, ca. ${eur(1)})</button>`);
  if (s.status === "geparkt") teile.push(`<button class="klein" data-auftrag="spiel" data-ziel="${esc(s.id)}">weiterbauen beauftragen${U.schaetzung.spiel !== null ? ` (ca. ${eur(U.schaetzung.spiel)})` : ""}</button>`);
  return teile.join(" ") + rueckKnopf("spiel", s.id, `${s.id} ${s.name}`, s.status);
}

/** Knöpfe zu „Mit echten Dingen“ im Feld: ansehen oder beauftragen, Rückmeldung. */
function lwEchtAktion(t) {
  if (t.echteDinge === "fehlt") return ` <button class="klein" data-auftrag="echte-dinge" data-ziel="${esc(t.id)}">beauftragen${U.schaetzung.echteDingeJeThema !== null ? ` (ca. ${eur(U.schaetzung.echteDingeJeThema)})` : ""}</button>`;
  const ansehen = ["fertig", "entwurf"].includes(t.echteDinge) ? ` <a class="knopf-link" href="/spiele/echt.html?thema=${encodeURIComponent(t.id)}" target="_blank" rel="noopener">Anleitung ↗</a>` : "";
  return ansehen + rueckKnopf("echte-dinge", t.id, `Mit echten Dingen: ${t.name}`, t.echteDinge);
}

function setzeFokus(id) {
  zustand.lernwegThema = id;
  merke();
  markiereLernweg();
}

/** Springt zu einem Thema, auch in ein anderes Fach oder eine andere Klasse. */
function springe(id) {
  const t = lernthema(id);
  if (!t) return;
  zustand.lernwegFach = t.strang;
  if (zustand.klasse && String(t.klasse) !== zustand.klasse) {
    zustand.klasse = String(t.klasse);
    /** @type {HTMLSelectElement} */ ($("#f-klasse")).value = zustand.klasse;
  }
  zustand.lernwegThema = id;
  merke();
  zeige();
  zentriere(id);
}

function setzeBlick() {
  $("#lw-blick").setAttribute("transform", `translate(${blick.x},${blick.y}) scale(${blick.s})`);
  lwAusschnitte[lwSchluessel] = { ...blick };
}

function einpassen() {
  if (!lw) return;
  const r = $("#lw-flaeche").getBoundingClientRect();
  const s = Math.max(0.08, Math.min(1, (r.width - 40) / lw.breite, (r.height - 40) / lw.hoehe));
  blick = { s, x: Math.max(20, (r.width - lw.breite * s) / 2), y: Math.max(10, (r.height - lw.hoehe * s) / 2) };
  setzeBlick();
}

function zentriere(id) {
  const n = lw?.knoten.find((x) => x.id === id);
  if (!n) return;
  const r = $("#lw-flaeche").getBoundingClientRect();
  const feld = $("#lw-feld").hidden ? 0 : 340;
  const s = Math.max(blick.s, 0.75);
  blick = { s, x: (r.width - feld) / 2 - (n.x + n.b / 2) * s, y: r.height / 2 - (n.y + n.h / 2) * s };
  setzeBlick();
}

function zoome(faktor, px, py) {
  const s = Math.min(2, Math.max(0.08, blick.s * faktor));
  blick = { s, x: px - (px - blick.x) * (s / blick.s), y: py - (py - blick.y) * (s / blick.s) };
  setzeBlick();
}

function lwKnopf(was) {
  const r = $("#lw-flaeche").getBoundingClientRect();
  if (was === "einpassen") einpassen();
  if (was === "plus") zoome(1.25, r.width / 2, r.height / 2);
  if (was === "minus") zoome(0.8, r.width / 2, r.height / 2);
  if (was === "zu") setzeFokus("");
}

{
  const flaeche = $("#lw-flaeche");
  let zug = /** @type {{ x: number, y: number, bx: number, by: number, bewegt: boolean }|null} */ (null);
  flaeche.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || /** @type {HTMLElement} */ (e.target).closest("#lw-feld")) return;
    zug = { x: e.clientX, y: e.clientY, bx: blick.x, by: blick.y, bewegt: false };
    flaeche.setPointerCapture(e.pointerId);
  });
  flaeche.addEventListener("pointermove", (e) => {
    if (!zug) return;
    const dx = e.clientX - zug.x, dy = e.clientY - zug.y;
    if (!zug.bewegt && Math.hypot(dx, dy) < 4) return;
    zug.bewegt = true;
    flaeche.classList.add("zieht");
    blick = { ...blick, x: zug.bx + dx, y: zug.by + dy };
    setzeBlick();
  });
  flaeche.addEventListener("pointerup", (e) => {
    if (!zug) return;
    const war = zug;
    zug = null;
    flaeche.classList.remove("zieht");
    if (war.bewegt) return;
    const g = /** @type {HTMLElement|null} */ (document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-lw-id]") ?? null);
    const id = g?.dataset.lwId ?? "";
    if (g?.classList.contains("stummel")) springe(id);
    else setzeFokus(id);
  });
  flaeche.addEventListener("pointercancel", () => { zug = null; flaeche.classList.remove("zieht"); });
  flaeche.addEventListener("wheel", (e) => {
    if (/** @type {HTMLElement} */ (e.target).closest("#lw-feld")) return;
    e.preventDefault();
    const r = flaeche.getBoundingClientRect();
    if (e.ctrlKey || e.metaKey) zoome(Math.exp(-e.deltaY * 0.01), e.clientX - r.left, e.clientY - r.top);
    else { blick = { ...blick, x: blick.x - e.deltaX, y: blick.y - e.deltaY }; setzeBlick(); }
  }, { passive: false });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && zustand.reiter === "lernweg" && !document.querySelector("dialog[open]")) setzeFokus("");
  });
}

// ---------- Kopf, Hinweise, Steuerung ----------

function zeigeKopf() {
  const proben = Object.values(U.spiele).filter((s) => s.status === "probe").length;
  $("#zahl-proben").textContent = proben ? String(proben) : "";
  zaehleIdeen();
  const k = U.kosten;
  const offenAnalog = k.analog.prognose === null ? 0 : Math.max(0, k.analog.prognose - k.analog.summe.eur);
  const offen = (k.spiele.rest?.mittel ?? 0) + offenAnalog + (k.buecher.rest ?? 0);
  $("#summe").innerHTML = `bisher <b>${eur(k.gesamtEur)}</b> · offen geschätzt ${eur(offen)}`;
  const h = U.katalogHinweis;
  const teile = [];
  if (h.nurUebersicht.length) teile.push(`Nur in der Übersicht docs/spielkatalog.md, ohne Abschnitt: ${h.nurUebersicht.join(", ")}`);
  if (h.nurAbschnitte.length) teile.push(`Nur als Abschnitt, nicht in der Übersicht: ${h.nurAbschnitte.join(", ")}`);
  $("#hinweis").textContent = teile.join(" · ");
}

function zeige() {
  document.querySelectorAll("[data-reiter]").forEach((b) => b.setAttribute("aria-selected", String(/** @type {HTMLElement} */ (b).dataset.reiter === zustand.reiter)));
  document.querySelectorAll(".ansicht").forEach((s) => { /** @type {HTMLElement} */ (s).hidden = s.id !== zustand.reiter; });
  $("#filter").hidden = !["spiele", "bibliothek", "lernweg"].includes(zustand.reiter);
  const imLernweg = zustand.reiter === "lernweg";
  /** @type {HTMLElement} */ ($("#f-fach").parentElement).hidden = !["spiele", "lernweg"].includes(zustand.reiter);
  // Der Lernweg zeigt immer genau ein Fach; „nur Lücken“ und Auf-/Zuklappen gibt es dort nicht
  const fachWahl = /** @type {HTMLSelectElement} */ ($("#f-fach"));
  fachWahl.options[0].hidden = imLernweg;
  if (fachWahl.options.length > 1) fachWahl.value = imLernweg ? zustand.lernwegFach : zustand.fach;
  document.querySelectorAll(".filter .umschalter, #alle-auf, #alle-zu").forEach((el) => { /** @type {HTMLElement} */ (el).hidden = imLernweg; });
  if (!U) return;
  zeigeKopf();
  if (zustand.reiter === "spiele") zeigeSpiele();
  if (zustand.reiter === "bibliothek") zeigeBibliothek();
  if (zustand.reiter === "lernweg") zeigeLernweg();
  if (zustand.reiter === "auftraege") zeigeAuftraege();
  if (zustand.reiter === "ideen") zeigeIdeen();
  if (zustand.reiter === "proben") zeigeProben();
  if (zustand.reiter === "kosten") zeigeKosten();
}

async function ladeAlles() {
  [U, A] = await Promise.all([api("/api/uebersicht"), api("/api/auftraege")]);
  const fach = /** @type {HTMLSelectElement} */ ($("#f-fach"));
  if (fach.options.length === 1) for (const f of U.faecher) fach.add(new Option(f.name, f.id));
  zeige();
}

function bestaetige(art, ziel) {
  const d = /** @type {HTMLDialogElement} */ ($("#bestaetigen"));
  let text = "", schaetzung = null;
  if (art === "spiel") { const s = U.spiele[ziel]; text = `Spiel ${ziel} „${s.name}“ entwickeln (${s.hauptthemen.length} Hauptthemen).`; schaetzung = U.schaetzung.spiel; }
  if (art === "echte-dinge") { text = `„Mit echten Dingen“ für ${U.lernthemen.find((t) => t.id === ziel)?.name ?? ziel} schreiben.`; schaetzung = U.schaetzung.echteDingeJeThema; }
  if (art === "buch") { text = `Buch „${U.bibliothek.flatMap((r) => r.regale.flatMap((g) => g.buecher)).find((b) => b.id === ziel)?.titel ?? ziel}“ schreiben.`; schaetzung = U.schaetzung.buch; }
  if (art === "ideen") { text = `Drei Ideen für Spiel ${ziel} „${U.spiele[ziel].name}“ – startet sofort, du wählst danach eine oder schreibst deine eigene; erst dann kommt das Spiel in die Warteschlange.`; schaetzung = 1; }
  if (art === "einfuehrung") { text = `Einführung für „${U.lernthemen.find((t) => t.id === ziel)?.name ?? ziel}“ (freier Auftrag, kein Skill).`; }
  $("#b-text").textContent = text;
  $("#b-schaetzung").textContent = schaetzung === null ? "Schätzung: unbekannt" : `Schätzung: ca. ${eur(schaetzung)} ${art === "ideen" ? "(startet sofort, neben der Warteschlange)" : "(startet erst mit „Warteschlange abarbeiten“)"}`;
  d.returnValue = "";
  d.showModal();
  d.addEventListener("close", async () => {
    if (d.returnValue !== "ja") return;
    await api("/api/auftraege", { art, ziel: art === "echte-dinge" ? [ziel] : ziel });
    await ladeAlles();
  }, { once: true });
}

function antworten(id) {
  const a = A.auftraege.find((x) => x.id === id);
  const d = /** @type {HTMLDialogElement} */ ($("#antworten"));
  const feld = /** @type {HTMLTextAreaElement} */ ($("#a-text"));
  $("#a-frage").textContent = a?.ergebnis?.frage ?? "";
  feld.value = "";
  d.returnValue = "";
  d.showModal();
  d.addEventListener("close", async () => {
    const text = feld.value.trim();
    if (d.returnValue !== "ja" || !text) return;
    try { await api(`/api/auftraege/${id}/antwort`, { text }); await ladeAlles(); } catch (err) { $("#hinweis").textContent = /** @type {Error} */ (err).message; }
  }, { once: true });
}

const WOHIN = { angehaengt: "an den wartenden Auftrag angehängt", antwort: "als Antwort auf die wartende Frage übergeben", neu: "als neuer Auftrag in die Warteschlange gestellt" };

/** Fenster „Rückmeldung“: Text, was damit passieren wird, und die bisherigen Rückmeldungen zu diesem Stück. */
function rueckmelden(bereich, id, titel) {
  const geparkt = bereich === "spiel" && U.spiele[id]?.status === "geparkt";
  const d = /** @type {HTMLDialogElement} */ ($("#rueckmelden"));
  const feld = /** @type {HTMLTextAreaElement} */ ($("#r-text"));
  $("#r-titel").textContent = `Rückmeldung – ${BEREICH_TEXT[bereich]} ${titel}`;
  const l = A.auftraege.filter((a) => a.art !== "ideen" && gehoertZu(a, bereich, id));
  const wartet = l.find((a) => a.status === "wartet");
  const frage = l.find((a) => a.status === "wartet-auf-christian");
  $("#r-wohin").textContent = wartet ? "Wird an den Auftrag gehängt, der dafür schon in der Warteschlange wartet."
    : frage ? `Wird deine Antwort auf die offene Frage: ${frage.ergebnis?.frage ?? "–"}`
    : geparkt ? "Wird ein Spiel-Auftrag: Das geparkte Spiel wird mit deinen Punkten im Bauheft weitergebaut (startet mit „Warteschlange abarbeiten“)."
    : "Wird ein neuer Auftrag „Änderung“ in der Warteschlange (startet mit „Warteschlange abarbeiten“). Er setzt nur deine Punkte um, lässt jeden Punkt nachprüfen und mergt bei Grün.";
  const bisher = rueckmeldungenZu(bereich, id);
  $("#r-verlauf").innerHTML = bisher.length ? `<h3>Bisher</h3><ul class="verlauf">${bisher.map((x) => `<li>${plakette(x.status)}
    <span class="leise-text">${esc(new Date(x.zeit).toLocaleString("de-DE"))}</span><div>${esc(x.text)}</div></li>`).join("")}</ul>` : "";
  feld.value = "";
  d.returnValue = "";
  d.showModal();
  d.addEventListener("close", async () => {
    const text = feld.value.trim();
    if (d.returnValue !== "ja" || !text) return;
    try {
      const r = await api("/api/rueckmeldung", { bereich, id, text });
      await ladeAlles(); // zeichnet die Kopfzeile neu, deshalb erst danach den Hinweis
      $("#hinweis").textContent = `Rückmeldung zu ${titel} ${WOHIN[r.wie] ?? r.wie}${r.wie === "neu" && r.auftrag?.schaetzung_eur ? ` (ca. ${eur(r.auftrag.schaetzung_eur)})` : ""}.`;
    } catch (err) { $("#hinweis").textContent = /** @type {Error} */ (err).message; }
  }, { once: true });
}

document.addEventListener("click", async (e) => {
  const z = /** @type {HTMLElement} */ (e.target).closest("button");
  if (!z) return;
  if (z.closest("summary")) e.preventDefault(); // „+“ im Kopf eines Spiels klappt es nicht auf oder zu
  try {
    if (z.dataset.reiter) { zustand.reiter = z.dataset.reiter; merke(); zeige(); }
    else if (z.dataset.luecken !== undefined) {
      zustand.luecken = z.dataset.luecken === "1"; merke();
      document.querySelectorAll("[data-luecken]").forEach((b) => b.setAttribute("aria-pressed", String(b === z)));
      zeige();
    }
    else if (z.dataset.erledigte !== undefined) { zustand.erledigteZeigen = !zustand.erledigteZeigen; merke(); zeigeAuftraege(); }
    else if (z.dataset.lwThema) springe(z.dataset.lwThema);
    else if (z.dataset.lw) lwKnopf(z.dataset.lw);
    else if (z.dataset.auftrag) bestaetige(z.dataset.auftrag, z.dataset.ziel);
    else if (z.dataset.schritt) { A = { ...A, ...(await api(`/api/auftraege/${z.dataset.id}/${z.dataset.schritt}`, {})) }; await ladeAlles(); }
    else if (z.dataset.antwort) { await api(`/api/auftraege/${z.dataset.id}/antwort`, { text: z.dataset.antwort }); await ladeAlles(); }
    else if (z.dataset.antworten) antworten(z.dataset.antworten);
    else if (z.dataset.rueck) rueckmelden(z.dataset.rueck, z.dataset.ziel ?? "", z.dataset.titel ?? "");
    else if (z.dataset.wahlKarte) { await api(`/api/auftraege/${z.dataset.id}/wahl`, { karte: Number(z.dataset.wahlKarte) }); await ladeAlles(); }
    else if (z.dataset.eigeneBauen) {
      const id = z.dataset.eigeneBauen, text = (entwuerfe[id] ?? "").trim();
      if (!text) { $("#hinweis").textContent = "Schreib zuerst deine Idee in die vierte Spalte."; return; }
      await api(`/api/auftraege/${id}/wahl`, { text });
      delete entwuerfe[id];
      await ladeAlles();
    }
    else if (z.dataset.probe && z.dataset.sicher !== "1") { z.dataset.sicher = "1"; z.textContent = `${z.dataset.probe} wirklich abschließen?`; }
    else if (z.dataset.probe) {
      const r = await api(`/api/proben/${z.dataset.probe}/abschliessen`, {});
      $("#hinweis").textContent = `${r.id}: Probe abgeschlossen, gilt als fertig (Commit ${r.commit}, nicht gepusht).`;
      await ladeAlles();
    }
    else if (z.dataset.protokoll) { gewaehlt = z.dataset.protokoll; zeigeAuftraege(); }
    else if (z.id === "abarbeiten") { await api("/api/abarbeiten", {}); setTimeout(ladeAlles, 800); }
    else if (z.id === "anhalten") { await api("/api/anhalten", {}); await ladeAlles(); }
    else if (z.id === "alle-auf" || z.id === "alle-zu") document.querySelectorAll(".ansicht:not([hidden]) details").forEach((d) => { /** @type {HTMLDetailsElement} */ (d).open = z.id === "alle-auf"; });
  } catch (err) {
    $("#hinweis").textContent = /** @type {Error} */ (err).message;
  }
});

document.addEventListener("submit", async (e) => {
  const f = /** @type {HTMLFormElement} */ (e.target);
  if (f.id !== "frei") return;
  e.preventDefault();
  const text = String(new FormData(f).get("text") ?? "").trim();
  if (!text) return;
  try { await api("/api/auftraege", { art: "frei", ziel: text }); await ladeAlles(); } catch (err) { $("#hinweis").textContent = /** @type {Error} */ (err).message; }
});

$("#f-fach").addEventListener("change", (e) => {
  const wert = /** @type {HTMLSelectElement} */ (e.target).value;
  if (zustand.reiter === "lernweg") zustand.lernwegFach = wert; else zustand.fach = wert;
  merke(); zeige();
});
document.addEventListener("change", (e) => {
  const f = /** @type {HTMLSelectElement} */ (e.target);
  if (!f.dataset?.af) return;
  zustand[/** @type {"auftragFach"|"auftragStatus"} */ (f.dataset.af)] = f.value;
  merke();
  zeigeAuftraege();
});
$("#f-klasse").addEventListener("change", (e) => { zustand.klasse = /** @type {HTMLSelectElement} */ (e.target).value; merke(); zeige(); });
let suchTakt = 0;
$("#f-suche").addEventListener("input", (e) => {
  clearTimeout(suchTakt);
  suchTakt = setTimeout(() => { zustand.suche = /** @type {HTMLInputElement} */ (e.target).value.trim(); zeige(); }, 200);
});

// Auswahl aus dem Speicher in die Bedienelemente übernehmen
/** @type {HTMLSelectElement} */ ($("#f-klasse")).value = zustand.klasse;
document.querySelectorAll("[data-luecken]").forEach((b) => b.setAttribute("aria-pressed", String((/** @type {HTMLElement} */ (b).dataset.luecken === "1") === zustand.luecken)));

// Aufträge regelmäßig nachladen (Status und Protokoll des Laufs)
setInterval(async () => {
  if (document.hidden) return;
  try {
    const neu = await api("/api/auftraege");
    const geaendert = JSON.stringify(neu) !== JSON.stringify(A);
    A = neu;
    if (geaendert) {
      if (zustand.reiter === "auftraege") zeigeAuftraege();
      else $("#zahl-offen").textContent = String(A.auftraege.filter((a) => a.status === "wartet" && a.art !== "ideen").length || "");
      // Beim Tippen in der eigenen Idee nicht neu zeichnen (sonst springt der Cursor); der Text bliebe aber erhalten.
      if (zustand.reiter === "ideen" && !document.activeElement?.matches?.("[data-entwurf]")) zeigeIdeen();
      zaehleIdeen();
    }
    else if (zustand.reiter === "auftraege") ladeProtokoll();
  } catch { /* Server kurz weg */ }
}, 2500);

ladeAlles().catch((e) => { $("#hinweis").textContent = `Laden fehlgeschlagen: ${e.message}`; });

// Eigene Idee: Entwurf merken, damit das Nachladen ihn nicht löscht
document.addEventListener("input", (e) => {
  const f = /** @type {HTMLElement} */ (e.target);
  if (f.dataset?.entwurf) entwuerfe[f.dataset.entwurf] = /** @type {HTMLTextAreaElement} */ (f).value;
});
