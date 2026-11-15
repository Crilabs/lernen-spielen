// Seite der Verwaltung: liest /api/uebersicht und /api/auftraege, legt Aufträge an, steuert den Lauf.

const $ = (s) => /** @type {HTMLElement} */ (document.querySelector(s));
const eur = (n) => (n === null || n === undefined ? "–" : n.toLocaleString("de-DE", { style: "currency", currency: "EUR" }));
const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const STATUS_TEXT = {
  fertig: "fertig", probe: "Probe – bitte spielen", geparkt: "geparkt", entwurf: "Entwurf", beauftragt: "beauftragt",
  geplant: "geplant", fehlt: "fehlt", wartet: "wartet", laeuft: "läuft", erledigt: "erledigt",
  "wartet-auf-christian": "wartet auf dich", fehlgeschlagen: "fehlgeschlagen", gestrichen: "gestrichen",
};
const ART_TEXT = { spiel: "Spiel", "echte-dinge": "Mit echten Dingen", buch: "Buch", einfuehrung: "Einführung", frei: "Frei" };
const plakette = (status, text = STATUS_TEXT[status] ?? status, titel = "") =>
  `<span class="plakette s-${esc(status)}" title="${esc(titel)}">${esc(text)}</span>`;

let U = /** @type {any} */ (null);
let A = /** @type {any} */ ({ auftraege: [], laeuft: false });
let gewaehlt = /** @type {string|null} */ (null);
let protokollAb = 0;
const zustand = { reiter: "lernthemen", fach: "", klasse: "", luecken: false, suche: "" };
try { Object.assign(zustand, JSON.parse(localStorage.getItem("verwaltung") ?? "{}")); } catch { /* ohne Speicher */ }
const merke = () => { try { localStorage.setItem("verwaltung", JSON.stringify(zustand)); } catch { /* egal */ } };

async function api(pfad, daten) {
  const r = await fetch(pfad, daten === undefined ? {} : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(daten) });
  const j = await r.json();
  if (!r.ok) throw new Error(j.fehler ?? `Fehler ${r.status}`);
  return j;
}

// ---------- Lernthemen ----------

function filterTreffer(t) {
  if (zustand.fach && t.strang !== zustand.fach) return false;
  if (zustand.klasse && String(t.klasse) !== zustand.klasse) return false;
  if (zustand.suche) {
    const s = zustand.suche.toLowerCase();
    if (!t.name.toLowerCase().includes(s) && !t.id.includes(s) && !t.spiele.some((id) => id.toLowerCase() === s)) return false;
  }
  if (zustand.luecken) {
    const spielFehlt = !t.spiele.length || t.spiele.every((id) => !["fertig", "probe"].includes(U.spiele[id].status));
    if (!spielFehlt && t.echteDinge !== "fehlt") return false;
  }
  return true;
}

function spielZelle(t) {
  if (!t.spiele.length) return plakette("fehlt", "kein Katalog-Spiel");
  return t.spiele.map((id) => {
    const s = U.spiele[id];
    const kosten = s.eur !== null ? `, bisher ${eur(s.eur)} (Kosten stehen beim Spiel, Reiter Kosten)` : "";
    const plus = ["geplant", "geparkt"].includes(s.status)
      ? ` <button class="plus" data-auftrag="spiel" data-ziel="${esc(id)}" title="${esc(s.name)} beauftragen">+</button>` : "";
    return `${plakette(s.status, `${id} ${STATUS_TEXT[s.status]}`, `${s.name} (${s.hauptthemen.length} Hauptthemen)${kosten}`)}${plus}`;
  }).join(" ");
}

function zeileLernthema(t) {
  const echt = plakette(t.echteDinge, STATUS_TEXT[t.echteDinge] + (t.echteDingeEur !== null ? ` · ${eur(t.echteDingeEur)}` : ""))
    + (t.echteDinge === "fehlt" ? ` <button class="plus" data-auftrag="echte-dinge" data-ziel="${esc(t.id)}" title="Mit echten Dingen beauftragen">+</button>` : "");
  const einf = t.einfuehrung
    ? plakette("fertig", t.einfuehrung.replace(/^einfuehrungen\/|\.json$/g, ""))
    : t.einfuehrungBeauftragt ? plakette("beauftragt")
    : `<span class="leise-text">–</span> <button class="plus" data-auftrag="einfuehrung" data-ziel="${esc(t.id)}" title="Einführung beauftragen">+</button>`;
  return `<tr><td>${esc(t.name)}<span class="id">${esc(t.id)}</span></td><td class="zahl-z">${t.klasse}</td>
    <td>${spielZelle(t)}</td><td>${echt}</td><td>${einf}</td></tr>`;
}

function zeigeLernthemen() {
  const offen = new Set([...document.querySelectorAll("#lernthemen details[open]")].map((d) => /** @type {HTMLElement} */ (d).dataset.schluessel));
  const erstesMal = !document.querySelector("#lernthemen details");
  const themen = U.lernthemen.filter(filterTreffer);
  const html = [];
  for (const f of U.faecher) {
    const imFach = themen.filter((t) => t.strang === f.id);
    if (!imFach.length) continue;
    const bereiche = new Map();
    for (const t of imFach) bereiche.set(t.bereich, [...(bereiche.get(t.bereich) ?? []), t]);
    const innen = [...bereiche].map(([bereich, liste]) => {
      const schluessel = `${f.id}/${bereich}`;
      const mitSpiel = liste.filter((t) => t.spiele.some((id) => ["fertig", "probe"].includes(U.spiele[id].status))).length;
      const mitEcht = liste.filter((t) => t.echteDinge === "fertig").length;
      const klassen = [...new Set(liste.map((t) => t.klasse))].join("/");
      return `<details class="gruppe" data-schluessel="${esc(schluessel)}" ${offen.has(schluessel) || zustand.suche ? "open" : ""}>
        <summary><span class="titel">${esc(bereich)}</span><span class="leise-text">Kl. ${klassen}</span>
        <span class="stand">${liste.length} Themen · Spiel ${mitSpiel} · Echte Dinge ${mitEcht}</span></summary>
        <table><thead><tr><th>Thema</th><th class="zahl-z">Kl.</th><th>Spiel</th><th>Mit echten Dingen</th><th>Einführung</th></tr></thead>
        <tbody>${liste.map(zeileLernthema).join("")}</tbody></table></details>`;
    }).join("");
    const fs = `fach/${f.id}`;
    html.push(`<details class="gruppe fachgruppe" data-schluessel="${esc(fs)}" ${offen.has(fs) || erstesMal || zustand.fach ? "open" : ""}>
      <summary><span class="fach" style="background:${esc(f.farbe)}"></span><span class="titel">${esc(f.name)}</span>
      <span class="stand">${imFach.length} Themen</span></summary>${innen}</details>`);
  }
  $("#lernthemen").innerHTML = html.join("") || `<p class="leer">Keine Themen für diesen Filter.</p>`;
}

// ---------- Sachthemen ----------

function zeigeSachthemen() {
  const offen = new Set([...document.querySelectorAll("#sachthemen details[open]")].map((d) => /** @type {HTMLElement} */ (d).dataset.schluessel));
  const s = zustand.suche.toLowerCase();
  const html = U.ueberschriften.map((u) => {
    let welten = U.sachthemen.filter((w) => w.ueberschrift === u.id);
    if (zustand.klasse) welten = welten.filter((w) => String(w.klasse) === zustand.klasse);
    if (s) welten = welten.filter((w) => w.name.toLowerCase().includes(s) || w.id.includes(s) || w.buecher.some((b) => b.titel.toLowerCase().includes(s)));
    if (zustand.luecken) welten = welten.filter((w) => !w.buecher.some((b) => b.status === "fertig"));
    if (!welten.length) return "";
    const fertig = welten.filter((w) => w.buecher.some((b) => b.status === "fertig")).length;
    const zeilen = welten.map((w) => {
      const buecher = w.buecher.length
        ? w.buecher.map((b) => plakette(b.status, `${b.titel}${b.eur !== null ? ` · ${eur(b.eur)}` : ""}`, `${b.id} (${STATUS_TEXT[b.status]})`)
          + (b.status === "geplant" ? ` <button class="plus" data-auftrag="buch" data-ziel="${esc(b.id)}" title="Buch „${esc(b.titel)}“ beauftragen">+</button>` : "")).join(" ")
        : `<span class="leise-text">kein Buch in der Bibliothek geplant</span>`;
      return `<tr><td>${esc(w.name)}<span class="id">${esc(w.id)}</span><div class="leise-text">${esc(w.beschreibung)}</div></td>
        <td class="zahl-z">${w.klasse ?? ""}</td><td>${buecher}</td></tr>`;
    }).join("");
    return `<details class="gruppe" data-schluessel="${esc(u.id)}" ${offen.has(u.id) || s ? "open" : ""}>
      <summary><span class="titel">${esc(u.name)}</span><span class="stand">${welten.length} Sachthemen · mit Buch ${fertig}</span></summary>
      <table><thead><tr><th>Sachthema</th><th class="zahl-z">Kl.</th><th>Bücher</th></tr></thead><tbody>${zeilen}</tbody></table></details>`;
  }).join("");
  $("#sachthemen").innerHTML = html || `<p class="leer">Keine Sachthemen für diesen Filter.</p>`;
}

// ---------- Aufträge ----------

function zeigeAuftraege() {
  const l = A.auftraege;
  const wartend = l.filter((a) => a.status === "wartet");
  const summe = wartend.reduce((s, a) => s + (a.schaetzung_eur ?? 0), 0);
  const unbekannt = wartend.some((a) => a.schaetzung_eur === null);
  $("#zahl-offen").textContent = wartend.length ? String(wartend.length) : "";
  const laeuft = l.find((a) => a.status === "laeuft");
  if (!gewaehlt && laeuft) gewaehlt = laeuft.id;
  // wartende in Warteschlangen-Reihenfolge oben, danach der Rest, neueste zuerst
  const wartendeReihe = l.filter((a) => a.status === "wartet");
  const rest = [...l].reverse().filter((a) => a.status !== "wartet" && a.status !== "gestrichen");
  const tabelle = [...wartendeReihe, ...rest].map((a) => {
    const steuer = a.status === "wartet"
      ? `<button class="klein" data-schritt="hoch" data-id="${esc(a.id)}" title="nach oben">↑</button>
         <button class="klein" data-schritt="runter" data-id="${esc(a.id)}" title="nach unten">↓</button>
         <button class="klein" data-schritt="streichen" data-id="${esc(a.id)}">streichen</button>` : "";
    const zeit = a.beendet ? new Date(a.beendet).toLocaleString("de-DE") : a.gestartet ? `seit ${new Date(a.gestartet).toLocaleTimeString("de-DE")}` : "";
    const frage = a.ergebnis?.frage ? `<div class="leise-text">Frage: ${esc(a.ergebnis.frage)}</div>` : "";
    const zus = a.ergebnis?.zusammenfassung ? `<div class="leise-text">${esc(a.ergebnis.zusammenfassung)}</div>` : "";
    return `<tr data-zeile="${esc(a.id)}" class="${a.id === gewaehlt ? "gewaehlt" : ""}">
      <td>${esc(ART_TEXT[a.art] ?? a.art)}</td><td class="befehl">${esc(a.befehl)}${zus}${frage}</td>
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
    ${l.length ? `<div class="karte"><table><thead><tr><th>Art</th><th>Auftrag</th><th class="zahl-z">Schätzung</th><th>Status</th><th>Zeit</th><th></th></tr></thead>
      <tbody>${tabelle}</tbody></table></div>` : `<p class="leer">Noch keine Aufträge. In Lernthemen oder Sachthemen mit + anlegen.</p>`}
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
      <tr><td>Spiele: ${ps.offen} von ${k.katalog} noch nicht begonnen, je ${eur(ps.durchschnitt?.eur ?? null)}</td><td class="zahl-z">${eur(ps.rest?.mittel ?? null)}</td></tr>
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
  $("#filter").hidden = !["lernthemen", "sachthemen"].includes(zustand.reiter);
  /** @type {HTMLElement} */ ($("#f-fach").parentElement).hidden = zustand.reiter !== "lernthemen";
  if (!U) return;
  zeigeKopf();
  if (zustand.reiter === "lernthemen") zeigeLernthemen();
  if (zustand.reiter === "sachthemen") zeigeSachthemen();
  if (zustand.reiter === "auftraege") zeigeAuftraege();
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
  if (art === "buch") { text = `Buch „${U.sachthemen.flatMap((w) => w.buecher).find((b) => b.id === ziel)?.titel ?? ziel}“ schreiben.`; schaetzung = U.schaetzung.buch; }
  if (art === "einfuehrung") { text = `Einführung für „${U.lernthemen.find((t) => t.id === ziel)?.name ?? ziel}“ (freier Auftrag, kein Skill).`; }
  $("#b-text").textContent = text;
  $("#b-schaetzung").textContent = schaetzung === null ? "Schätzung: unbekannt" : `Schätzung: ca. ${eur(schaetzung)} (startet erst mit „Warteschlange abarbeiten“)`;
  d.returnValue = "";
  d.showModal();
  d.addEventListener("close", async () => {
    if (d.returnValue !== "ja") return;
    await api("/api/auftraege", { art, ziel: art === "echte-dinge" ? [ziel] : ziel });
    await ladeAlles();
  }, { once: true });
}

document.addEventListener("click", async (e) => {
  const z = /** @type {HTMLElement} */ (e.target).closest("button");
  if (!z) return;
  try {
    if (z.dataset.reiter) { zustand.reiter = z.dataset.reiter; merke(); zeige(); }
    else if (z.dataset.luecken !== undefined) {
      zustand.luecken = z.dataset.luecken === "1"; merke();
      document.querySelectorAll("[data-luecken]").forEach((b) => b.setAttribute("aria-pressed", String(b === z)));
      zeige();
    }
    else if (z.dataset.auftrag) bestaetige(z.dataset.auftrag, z.dataset.ziel);
    else if (z.dataset.schritt) { A = { ...A, ...(await api(`/api/auftraege/${z.dataset.id}/${z.dataset.schritt}`, {})) }; await ladeAlles(); }
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
