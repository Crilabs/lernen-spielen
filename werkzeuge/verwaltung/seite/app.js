// Seite der Verwaltung: liest /api/uebersicht und /api/auftraege, legt Aufträge an, steuert den Lauf.

const $ = (s) => /** @type {HTMLElement} */ (document.querySelector(s));
const eur = (n) => (n === null || n === undefined ? "–" : n.toLocaleString("de-DE", { style: "currency", currency: "EUR" }));
const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const STATUS_TEXT = {
  fertig: "fertig", probe: "Probe – bitte spielen", geparkt: "geparkt", entwurf: "Entwurf", beauftragt: "beauftragt",
  geplant: "geplant", fehlt: "fehlt", wartet: "wartet", laeuft: "läuft", erledigt: "erledigt",
  "wartet-auf-christian": "wartet auf dich", beantwortet: "beantwortet", fehlgeschlagen: "fehlgeschlagen", gestrichen: "gestrichen",
};
const ART_TEXT = { spiel: "Spiel", "echte-dinge": "Mit echten Dingen", buch: "Buch", einfuehrung: "Einführung", frei: "Frei", antwort: "Antwort", ideen: "Ideen" };
const plakette = (status, text = STATUS_TEXT[status] ?? status, titel = "") =>
  `<span class="plakette s-${esc(status)}" title="${esc(titel)}">${esc(text)}</span>`;

let U = /** @type {any} */ (null);
let A = /** @type {any} */ ({ auftraege: [], laeuft: false });
let gewaehlt = /** @type {string|null} */ (null);
let protokollAb = 0;
const zustand = { reiter: "spiele", fach: "", klasse: "", luecken: false, suche: "" };
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
    + (t.echteDinge === "fehlt" ? ` <button class="plus" data-auftrag="echte-dinge" data-ziel="${esc(t.id)}" title="Mit echten Dingen beauftragen">+</button>` : "");
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
          <span class="leise-text">Kl. ${kl}</span>${plakette(s.status)}${spielPlus(s.id, s)}${FERTIG.includes(s.status) ? `<span class="leise-text">Einführung im Spiel</span>` : ""}
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
    <td>${plakette(b.status)}${b.status === "geplant" ? ` <button class="plus" data-auftrag="buch" data-ziel="${esc(b.id)}" title="Buch „${esc(b.titel)}“ beauftragen">+</button>` : ""}</td>
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

/** Die Skizzen eines Ideen-Auftrags, der auf Christian wartet, als Karten mit „Diese bauen“. */
function ideenKarten(a) {
  if (a.art !== "ideen" || a.status !== "wartet-auf-christian") return "";
  const ideen = Array.isArray(a.ergebnis?.ideen) ? a.ergebnis.ideen : [];
  if (!ideen.length) return "";
  const karten = ideen.map((x, i) => `<div class="idee">
      <h3>${i + 1}. ${esc(x.titel)}</h3><p>${esc(x.text)}</p>
      <button class="zweit" data-wahl-karte="${i + 1}" data-id="${esc(a.id)}">Diese bauen</button></div>`).join("");
  return `<tr class="ideen-zeile"><td colspan="6"><div class="ideen-karten">${karten}</div></td></tr>`;
}

function eigeneIdee(id) {
  const d = /** @type {HTMLDialogElement} */ ($("#eigene-idee"));
  const feld = /** @type {HTMLTextAreaElement} */ ($("#e-text"));
  feld.value = "";
  d.returnValue = "";
  d.showModal();
  d.addEventListener("close", async () => {
    const text = feld.value.trim();
    if (d.returnValue !== "ja" || !text) return;
    try { await api(`/api/auftraege/${id}/wahl`, { text }); await ladeAlles(); } catch (err) { $("#hinweis").textContent = /** @type {Error} */ (err).message; }
  }, { once: true });
}

function zeigeAuftraege() {
  const l = A.auftraege;
  const wartend = l.filter((a) => a.status === "wartet" && a.art !== "ideen");
  const summe = wartend.reduce((s, a) => s + (a.schaetzung_eur ?? 0), 0);
  const unbekannt = wartend.some((a) => a.schaetzung_eur === null);
  $("#zahl-offen").textContent = wartend.length ? String(wartend.length) : "";
  const laeuft = l.find((a) => a.status === "laeuft");
  if (!gewaehlt && laeuft) gewaehlt = laeuft.id;
  // wartende in Warteschlangen-Reihenfolge oben, danach der Rest, neueste zuerst
  const wartendeReihe = l.filter((a) => a.status === "wartet" && a.art !== "ideen");
  const rest = [...l].reverse().filter((a) => !wartendeReihe.includes(a) && a.status !== "gestrichen");
  const tabelle = [...wartendeReihe, ...rest].map((a) => {
    const steuer = a.status === "wartet"
      ? `<button class="klein" data-schritt="hoch" data-id="${esc(a.id)}" title="nach oben">↑</button>
         <button class="klein" data-schritt="runter" data-id="${esc(a.id)}" title="nach unten">↓</button>
         <button class="klein" data-schritt="streichen" data-id="${esc(a.id)}">streichen</button>`
      : a.status === "wartet-auf-christian" && a.art === "ideen"
      ? `<button class="klein" data-eigene-idee="${esc(a.id)}" title="Eigene Idee als Vorgabe für den Bau">Eigene Idee …</button>
         <button class="klein" data-schritt="ablehnen" data-id="${esc(a.id)}" title="Keine davon, nichts bauen">Nein</button>`
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
    return `<tr data-zeile="${esc(a.id)}" class="${a.id === gewaehlt ? "gewaehlt" : ""}">
      <td>${esc(ART_TEXT[a.art] ?? a.art)}</td><td class="befehl">${esc(befehl)}${zus}${frage}${notiz}</td>
      <td class="zahl-z">${eur(a.schaetzung_eur)}</td><td>${plakette(a.status)}</td><td class="leise-text">${esc(zeit)}</td>
      <td>${steuer} <button class="klein" data-protokoll="${esc(a.id)}">Protokoll</button></td></tr>${ideenKarten(a)}`;
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
    ${l.length ? `<div class="karte"><table><thead><tr><th>Art</th><th>Auftrag</th><th class="zahl-z">Schätzung</th><th>Status</th><th>Zeit</th><th></th></tr></thead>
      <tbody>${tabelle}</tbody></table></div>` : `<p class="leer">Noch keine Aufträge. In Spiele oder Bibliothek mit + anlegen.</p>`}
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

// ---------- Proben ----------

function zeigeProben() {
  const proben = Object.values(U.spiele).filter((s) => s.status === "probe");
  $("#proben").innerHTML = proben.length
    ? `<p class="leise-text">Fertig ist ein Spiel erst, wenn du oder Noelia es zwei Minuten gespielt habt. „Probe abschließen“ nimmt die
        Markierung aus spiele/spiele.json und committet nur diese Datei auf main (kein Push).</p>
      <div class="karte"><table><thead><tr><th>Id</th><th>Spiel</th><th>Hauptthemen</th><th class="zahl-z">Kosten</th><th></th></tr></thead><tbody>
      ${proben.map((s) => `<tr><td>${esc(s.id)}</td><td>${esc(s.name)}</td>
        <td class="leise-text">${esc(s.hauptthemen.join(", "))}</td><td class="zahl-z">${eur(s.eur)}</td>
        <td style="white-space:nowrap"><a class="knopf-link" href="/spiele/${esc(s.ordner)}" target="_blank" rel="noopener">Spielen</a>
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

// ---------- Kopf, Hinweise, Steuerung ----------

function zeigeKopf() {
  const proben = Object.values(U.spiele).filter((s) => s.status === "probe").length;
  $("#zahl-proben").textContent = proben ? String(proben) : "";
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
  $("#filter").hidden = !["spiele", "bibliothek"].includes(zustand.reiter);
  /** @type {HTMLElement} */ ($("#f-fach").parentElement).hidden = zustand.reiter !== "spiele";
  if (!U) return;
  zeigeKopf();
  if (zustand.reiter === "spiele") zeigeSpiele();
  if (zustand.reiter === "bibliothek") zeigeBibliothek();
  if (zustand.reiter === "auftraege") zeigeAuftraege();
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
    else if (z.dataset.auftrag) bestaetige(z.dataset.auftrag, z.dataset.ziel);
    else if (z.dataset.schritt) { A = { ...A, ...(await api(`/api/auftraege/${z.dataset.id}/${z.dataset.schritt}`, {})) }; await ladeAlles(); }
    else if (z.dataset.antwort) { await api(`/api/auftraege/${z.dataset.id}/antwort`, { text: z.dataset.antwort }); await ladeAlles(); }
    else if (z.dataset.antworten) antworten(z.dataset.antworten);
    else if (z.dataset.wahlKarte) { await api(`/api/auftraege/${z.dataset.id}/wahl`, { karte: Number(z.dataset.wahlKarte) }); await ladeAlles(); }
    else if (z.dataset.eigeneIdee) eigeneIdee(z.dataset.eigeneIdee);
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

$("#f-fach").addEventListener("change", (e) => { zustand.fach = /** @type {HTMLSelectElement} */ (e.target).value; merke(); zeige(); });
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
    if (geaendert) { if (zustand.reiter === "auftraege") zeigeAuftraege(); else $("#zahl-offen").textContent = String(A.auftraege.filter((a) => a.status === "wartet").length || ""); }
    else if (zustand.reiter === "auftraege") ladeProtokoll();
  } catch { /* Server kurz weg */ }
}, 2500);

ladeAlles().then(() => {
  /** @type {HTMLSelectElement} */ ($("#f-fach")).value = zustand.fach;
  zeige();
}).catch((e) => { $("#hinweis").textContent = `Laden fehlgeschlagen: ${e.message}`; });
