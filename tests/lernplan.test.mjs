import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";

const { aufgabenVon, klasseRechnen, poolRechnen, darstellbar } = await import("../spiele/aufgabenarten.js");

const lade = (pfad) => JSON.parse(readFileSync(new URL(pfad, import.meta.url), "utf8"));
const plan = lade("../spiele/lernplan.json");
const katalog = lade("./daten/spiele-beispiel.json");
const themen = plan.themen;

const hatSpiel = (katalog, thema) => {
  const aufgaben = aufgabenVon(thema.aufgaben);
  return katalog.spiele.some((s) => (s.arten ?? []).some((art) => aufgaben.some((a) => darstellbar(a, art))));
};

const zahlwoerter = "null eins ein eine einer zwei drei vier fünf sechs sieben acht neun zehn elf zwölf dreizehn vierzehn fünfzehn sechzehn siebzehn achtzehn neunzehn zwanzig hundert".split(" ");
// ganze Wörter: „Zehner“ ist kein Zahlwort
const zahlRegel = new RegExp(`(?<![\\p{L}])(${zahlwoerter.join("|")})(?![\\p{L}])`, "iu");
const vorlageDa = (v) => existsSync(new URL(`../spiele/${v}`, import.meta.url));
const geplant = (t) => t.aufgaben === null; // geplant: keine Aufgaben, kein Spiel, keine Einführung

// Die Regeln des Plans, je eine Funktion; sie werfen bei der ersten Verletzung.
const regeln = {
  reihenfolge({ themen }) {
    const gesehen = new Set();
    for (const t of themen) {
      assert.ok(!gesehen.has(t.id), `doppelte ID ${t.id}`);
      for (const v of t.voraussetzungen) assert.ok(gesehen.has(v), `${t.id}: Voraussetzung ${v} fehlt oder steht später`);
      gesehen.add(t.id);
    }
  },
  aufgaben({ themen }) {
    const besitzer = new Map();
    for (const t of themen.filter((t) => !geplant(t))) {
      const aufgaben = aufgabenVon(t.aufgaben);
      assert.ok(aufgaben.length > 0, `${t.id}: keine Aufgaben (unbekannte Art?)`);
      for (const a of aufgaben) {
        assert.ok(!besitzer.has(a.key), `${a.key} in ${besitzer.get(a.key)} und ${t.id}`);
        besitzer.set(a.key, t.id);
      }
    }
  },
  einfuehrung({ themen }, katalog, vorlageExistiert = vorlageDa) {
    for (const t of themen) {
      if (geplant(t)) {
        assert.ok(!t.einfuehrung, `${t.id}: geplantes Thema darf keine Einführung haben`);
      } else if (hatSpiel(katalog, t)) {
        assert.ok(t.einfuehrung?.vorlage, `${t.id} ohne Einführung`);
        assert.ok(vorlageExistiert(t.einfuehrung.vorlage), `${t.id}: Vorlage fehlt`);
      }
    }
  },
  stufenUndStrang({ themen }, katalog) {
    const kategorien = katalog.kategorien.map((k) => k.id);
    for (const t of themen) {
      assert.ok(kategorien.includes(t.strang), `${t.id}: Strang ${t.strang}`);
      if (!geplant(t)) assert.ok(t.stufen?.length > 0, `${t.id} ohne Stufen`);
      for (const s of t.stufen ?? []) assert.ok(["material", "vorstellung", "kopf"].includes(s), `${t.id}: Stufe ${s}`);
    }
  },
  texte({ themen }) {
    for (const t of themen) {
      assert.ok(t.name, `${t.id} ohne name`);
      assert.ok(t.sprich, `${t.id} ohne sprich`);
      assert.doesNotMatch(t.sprich, /\d/, `${t.id}: Ziffer in sprich`);
      assert.doesNotMatch(t.sprich, zahlRegel, `${t.id}: Zahlwort in sprich`);
      assert.equal(typeof t.eltern, "string", `${t.id}: eltern fehlt`);
      if (!geplant(t)) assert.ok(t.eltern.length > 0, `${t.id} ohne eltern`);
    }
  },
};
// Felder aus der Recherche (docs/reports/Grundschul Lernplan Deutsch Mathe.md); Klasse 1–2 voll, 3–4 grob
const WERTE = {
  typ: ["regel", "merkwort", "fertigkeit"],
  schrift: ["alle", "va", "sas", "verbunden"],
  pruefbar: ["ganz", "teilweise"],
  land: ["BY"],
  quelle: ["Q", "E", "Q+E"],
};
regeln.felder = ({ themen }) => {
  const ids = new Set(themen.map((t) => t.id));
  for (const t of themen) {
    assert.ok([1, 2, 3, 4].includes(t.klasse), `${t.id}: klasse ${t.klasse}`);
    for (const [feld, erlaubt] of Object.entries(WERTE)) {
      if (t[feld] !== undefined) assert.ok(erlaubt.includes(t[feld]), `${t.id}: ${feld} ${t[feld]}`);
    }
    for (const g of t.gesichert ?? []) assert.ok(t.voraussetzungen.includes(g), `${t.id}: gesichert ${g} ist keine Voraussetzung`);
    for (const v of t.verwechslung ?? []) assert.ok(ids.has(v) && v !== t.id, `${t.id}: Verwechslung ${v}`);
    if (t.klasse <= 2) {
      for (const feld of ["bereich", "ziel", "zweck", "eltern"]) assert.ok(t[feld]?.trim(), `${t.id} ohne ${feld}`);
      assert.ok(t.beispiele?.length > 0, `${t.id} ohne beispiele`);
      assert.ok(t.stufen?.length > 0, `${t.id} ohne stufen`);
      assert.equal(typeof t.tempo, "boolean", `${t.id}: tempo fehlt`);
    }
  }
};
// Fehlerbilder (docs/reports/Häufige Fehler Grundschule.md): verweisen nur auf Themen, steuern nichts allein
const FB = {
  strang: ["mathe", "geometrie", "lesen", "schreiben", "grammatik", "sprechen"],
  eingabe: ["ziffern", "zahlwort-lesen", "auswahl", "tastatur", "kacheln-plus", "stift", "ziehen", "zeit"],
  art: ["antwort", "zeit", "strich", "alignment"],
  evidenz: ["Q", "F", "A"],
};
regeln.fehlerbilder = ({ themen, fehlerbilder = [] }) => {
  const tids = new Set(themen.map((t) => t.id));
  const fids = new Set();
  for (const f of fehlerbilder) {
    assert.match(f.id, /^[a-z0-9]+(-[a-z0-9]+)*$/, `Fehlerbild-id ${f.id}`);
    assert.ok(!fids.has(f.id), `doppeltes Fehlerbild ${f.id}`);
    fids.add(f.id);
  }
  for (const f of fehlerbilder) {
    const wo = `Fehlerbild ${f.id}`;
    assert.ok(f.name && f.kind_hinweis && f.eltern?.beschreibung, `${wo}: name, kind_hinweis oder eltern fehlt`);
    assert.ok(FB.strang.includes(f.strang), `${wo}: strang ${f.strang}`);
    assert.ok(FB.evidenz.includes(f.evidenz), `${wo}: evidenz ${f.evidenz}`);
    assert.ok(FB.art.includes(f.signatur?.art), `${wo}: signatur.art`);
    assert.ok(f.eingabe?.length > 0, `${wo}: eingabe fehlt`);
    for (const e of f.eingabe) assert.ok(FB.eingabe.includes(e), `${wo}: eingabe ${e} (die Stimme spricht nie Zahlen)`);
    assert.ok(f.themen?.length > 0, `${wo}: keine Themen`);
    for (const feld of ["themen", "kontrast", "uebung"]) {
      for (const id of f[feld] ?? []) assert.ok(tids.has(id), `${wo}: ${feld} ${id} fehlt im Plan`);
    }
    for (const b of f.probe?.beispiele ?? []) assert.doesNotMatch(String(b), /^hoeren:.*\d/, `${wo}: Probe ${b} würde eine Zahl sprechen`);
    // kind_hinweis wird vorgelesen: keine Ziffern, keine Zahlwörter (Artikel wie „ein Hund“ und die Stelle „Einer“ sind erlaubt)
    assert.doesNotMatch(f.kind_hinweis, /\d/, `${wo}: Ziffer im kind_hinweis`);
    assert.doesNotMatch(f.kind_hinweis.replace(/(?<![\p{L}])(ein|eine|einer)(?![\p{L}])/giu, ""), zahlRegel, `${wo}: Zahlwort im kind_hinweis`);
    if (f.gegenstueck) assert.ok(fids.has(f.gegenstueck), `${wo}: gegenstueck ${f.gegenstueck}`);
    const s2 = f.eltern.stufe2;
    if (s2 && s2 !== "nie") {
      assert.ok(tids.has(s2.nach_thema), `${wo}: stufe2.nach_thema ${s2.nach_thema}`);
      for (const m of s2.mit ?? []) assert.ok(fids.has(m), `${wo}: stufe2.mit ${m}`);
    }
  }
};
// Kosmik-Schicht (docs/grundsaetze.md Abschnitt 10): Sachthemen quer zu den Spielen, kein Lernstand
const WELT = {
  art: ["sache", "miteinander", "schutz"],
  stufe: ["ruhig", "sanft", "abenteuer"],
  // Wortliste 3.2 und Prävention: nie im Kindertext
  gesperrt: /(?<![\p{L}])(super|toll|klasse|prima|spitze|perfekt|klug|schlau|brav|fleißig|falsch|leider|schade|fehler|missbrauch\p{L}*)(?![\p{L}])/iu,
  // K15: Ich-Form nur für Rechte und Handlungen, nie für Selbstwert
  selbstwert: /Ich bin (gut|liebenswert|stolz|stark|toll|wichtig|richtig)/i,
};
regeln.welten = ({ themen, ueberschriften = [], welten = [] }) => {
  const tids = new Set(themen.map((t) => t.id));
  const arten = new Map(ueberschriften.map((u) => [u.id, u.art]));
  for (const u of ueberschriften) assert.ok(WELT.art.includes(u.art) && u.name, `Überschrift ${u.id}: art oder name`);
  const wids = new Set();
  for (const w of welten) {
    const wo = `Welt ${w.id}`;
    assert.match(w.id, /^[a-z0-9]+(-[a-z0-9]+)*$/, `${wo}: id`);
    assert.ok(!wids.has(w.id), `doppelte Welt ${w.id}`);
    wids.add(w.id);
    assert.ok(arten.has(w.ueberschrift), `${wo}: Überschrift ${w.ueberschrift} fehlt`);
    assert.ok([1, 2, 3, 4].includes(w.klasse), `${wo}: klasse ${w.klasse}`);
    assert.ok(WELT.stufe.includes(w.stufe_ab), `${wo}: stufe_ab ${w.stufe_ab}`);
    assert.ok(w.name && w.anbindung && w.quellen?.length > 0, `${wo}: name, anbindung oder quellen fehlt`);
    assert.doesNotMatch(w.name, WELT.gesperrt, `${wo}: gesperrtes Wort im name`);
    assert.doesNotMatch(w.name, WELT.selbstwert, `${wo}: Selbstwert-Satz im name (K15)`);
    for (const id of w.themen ?? []) assert.ok(tids.has(id), `${wo}: Thema ${id} fehlt im Plan`);
    if (arten.get(w.ueberschrift) === "schutz") assert.ok(w.eltern, `${wo}: Schutz-Thema ohne eltern`);
    assert.ok(Array.isArray(w.fakten), `${wo}: fakten fehlt`);
    for (const f of w.fakten) assert.ok(f.satz && f.quelle, `${wo}: Fakt ohne Quelle (K4)`);
  }
};

const pruefePlan = (plan, katalog, vorlageExistiert) => {
  regeln.reihenfolge(plan);
  regeln.aufgaben(plan);
  regeln.einfuehrung(plan, katalog, vorlageExistiert);
  regeln.stufenUndStrang(plan, katalog);
  regeln.texte(plan);
};

test("Plan: IDs eindeutig, Voraussetzungen existieren und stehen davor, keine Zyklen", () => regeln.reihenfolge(plan));
test("Plan: jede Aufgabe gehört zu genau einem Thema", () => regeln.aufgaben(plan));
test("Plan: jedes Thema mit Spiel hat eine Einführung, deren Vorlage existiert", () => {
  regeln.einfuehrung(plan, katalog);
  assert.ok(themen.some((t) => hatSpiel(katalog, t)));
});
test("Plan: Strang aus den Kategorien von spiele.json, Stufen nur material/vorstellung/kopf", () => regeln.stufenUndStrang(plan, katalog));
test("Plan: `sprich` ohne Ziffern und Zahlwörter (null … zwanzig, hundert), Eltern-Hinweis vorhanden", () => regeln.texte(plan));

test("Plan: deckt alle Zahlenzauber-Schlüssel bis 100 ab", () => {
  const ids = new Set(themen.map((t) => t.id));
  for (const id of new Set(poolRechnen().map(klasseRechnen))) assert.ok(ids.has(id), `Thema ${id} fehlt`);
});

test("Plan: der echte Plan besteht alle Prüfungen", () => pruefePlan(plan, katalog));

test("Plan: Klasse, Felder der Recherche; Klasse 1–2 mit Ziel, Beispielen, Zweck und Eltern-Hinweis", () => regeln.felder(plan));

test("Plan: Fehlerbilder verweisen auf vorhandene Themen und sprechen keine Zahlen", () => {
  assert.ok((plan.fehlerbilder ?? []).length > 0, "keine Fehlerbilder");
  regeln.fehlerbilder(plan);
});

test("Plan: Fehlerbild-Regel erkennt falsche Verweise und gesprochene Zahlen", () => {
  const themen = [{ id: "t" }];
  const f = { id: "f", name: "F", strang: "mathe", evidenz: "Q", signatur: { art: "antwort" }, eingabe: ["ziffern"], themen: ["t"], kind_hinweis: "Erst die Zehner.", eltern: { beschreibung: "B", stufe2: "nie" } };
  regeln.fehlerbilder({ themen, fehlerbilder: [f] });
  assert.throws(() => regeln.fehlerbilder({ themen, fehlerbilder: [{ ...f, themen: ["gibt-es-nicht"] }] }), /fehlt im Plan/);
  assert.throws(() => regeln.fehlerbilder({ themen, fehlerbilder: [{ ...f, eingabe: ["hoeren-ziffern"] }] }), /spricht nie Zahlen/);
  assert.throws(() => regeln.fehlerbilder({ themen, fehlerbilder: [{ ...f, kind_hinweis: "Wie viele sind zwei?" }] }), /Zahlwort/);
  assert.throws(() => regeln.fehlerbilder({ themen, fehlerbilder: [{ ...f, kind_hinweis: "Nimm die 6." }] }), /Ziffer/);
  regeln.fehlerbilder({ themen, fehlerbilder: [{ ...f, kind_hinweis: "Ein Hund, viele …? Reichen die Einer?" }] });
});

test("Plan: jeder Strang hat Themen in Klasse 1–2 und 3–4", () => {
  for (const s of ["mathe", "geometrie", "lesen", "schreiben", "grammatik", "sprechen"]) {
    assert.ok(themen.some((t) => t.strang === s && t.klasse <= 2), `${s}: keine Themen in Klasse 1–2`);
    assert.ok(themen.some((t) => t.strang === s && t.klasse >= 3), `${s}: keine Themen in Klasse 3–4`);
  }
});

test("Plan: Felder-Regel erkennt fehlende Pflichtfelder und falsche Werte", () => {
  const t = { id: "a", klasse: 1, voraussetzungen: [], bereich: "B", ziel: "Z", zweck: "W", eltern: "E", beispiele: ["x"], stufen: ["kopf"], tempo: false };
  regeln.felder({ themen: [t] });
  regeln.felder({ themen: [{ id: "b", klasse: 3, voraussetzungen: [] }] });
  assert.throws(() => regeln.felder({ themen: [{ ...t, zweck: "" }] }), /ohne zweck/);
  assert.throws(() => regeln.felder({ themen: [{ ...t, typ: "regeln" }] }), /typ/);
  assert.throws(() => regeln.felder({ themen: [{ ...t, gesichert: ["x"] }] }), /gesichert/);
  assert.throws(() => regeln.felder({ themen: [{ ...t, klasse: 5 }] }), /klasse/);
});

test("Plan: geplantes Thema (aufgaben null) besteht alle Prüfungen, unbekannte Art und Einführung bei geplant nicht", () => {
  const kat = { kategorien: [{ id: "mathe" }], spiele: [] };
  const basis = { id: "a", name: "A", sprich: "Anfang", strang: "mathe", voraussetzungen: [], eltern: "Hinweis" };
  const erstes = { ...basis, aufgaben: { art: "menge", bis: 3 }, stufen: ["kopf"] };
  const noch = { id: "b", name: "Die 5 kommt", sprich: "Bald", strang: "mathe", voraussetzungen: ["a"], aufgaben: null, eltern: "" };
  pruefePlan({ themen: [erstes, noch] }, kat);
  assert.throws(() => pruefePlan({ themen: [{ ...erstes, aufgaben: { art: "gibt-es-nicht" } }] }, kat), /keine Aufgaben/);
  assert.throws(() => pruefePlan({ themen: [erstes, { ...noch, einfuehrung: { vorlage: "x.json" } }] }, kat), /keine Einführung/);
});

// ---------------------------------------------------------------- Einführungen (Vorlagen mit den Werten jedes Themas)

const { fuelleVorlage } = await import("../spiele/einfuehrung.js");
const mitEinfuehrung = themen.filter((t) => t.einfuehrung?.vorlage);
const R = await import("../spiele/runde/runde.js");
const AUFGABEN = ["vorzeigen", "fragen", "wundern", "freuen", "zeigen"]; // figuren.md §3, §8
const ZEICHEN_JE_SEKUNDE = 14;

test("Einführungen: jede Vorlage eines Themas existiert", () => {
  assert.ok(mitEinfuehrung.length > 0);
  for (const t of mitEinfuehrung) assert.ok(vorlageDa(t.einfuehrung.vorlage), `${t.id}: ${t.einfuehrung.vorlage} fehlt`);
});

for (const t of mitEinfuehrung) {
  test(`Einführung ${t.id} (${t.einfuehrung.vorlage}): 3–6 Szenen, ≤ 60 s, gefüllt, Figuren und Perlen gültig`, () => {
    const vorlage = lade(`../spiele/${t.einfuehrung.vorlage}`);
    const szenen = fuelleVorlage(vorlage, t.einfuehrung.werte);   // wirft bei Zahl in sprich oder fehlendem Wert
    assert.ok(szenen.length >= 3 && szenen.length <= 6, `${t.id}: ${szenen.length} Szenen`);
    const sekunden = szenen.reduce((n, s) => n + s.sprich.length, 0) / ZEICHEN_JE_SEKUNDE;
    assert.ok(sekunden <= 60, `${t.id}: ${sekunden.toFixed(1)} s gesprochen`);
    for (const [i, s] of szenen.entries()) {
      const wo = `${t.id} Szene ${i + 1}`;
      assert.ok(s.sprich.trim(), `${wo}: sprich leer`);
      assert.doesNotMatch(s.zeig, /[{}]/, `${wo}: Platzhalter in zeig`);
      for (const b of s.bild) {
        if (b.figur !== undefined) {
          assert.ok(R.bestand.kinder.has(b.figur), `${wo}: ${b.figur} ist kein Kind der Runde`);
          if (b.haltung !== undefined) assert.ok(R.bestand.haltungen.has(b.haltung), `${wo}: Haltung ${b.haltung} fehlt in spiele/runde/`);
          if (b.aktion !== undefined) assert.ok(R.bestand.bewegungen.has(b.aktion), `${wo}: Bewegung ${b.aktion} fehlt in spiele/runde/`);
          if (b.haltung !== undefined) assert.doesNotThrow(() => R.zeichne(b.figur, { haltung: b.haltung }), `${wo}: ${b.figur} ${b.haltung}`);
          assert.ok(AUFGABEN.includes(b.aufgabe), `${wo}: ${b.figur} braucht genau eine Aufgabe (${AUFGABEN.join(", ")})`);
        }
        else if (b.perlen !== undefined) for (const p of b.perlen) assert.ok(Number.isInteger(p) && p >= 1 && p <= 10, `${wo}: Perlenstab ${p}`);
        else if (b.zahl !== undefined) assert.ok(typeof b.zahl === "number" || !/[{}]/.test(b.zahl), `${wo}: Zahl ${b.zahl}`);
        else assert.fail(`${wo}: unbekanntes Bildelement ${JSON.stringify(b)}`);
        if (b.x !== undefined) assert.ok(typeof b.x === "number" && b.x >= 0 && b.x <= 100, `${wo}: x ${b.x}`);
      }
    }
  });
}

// Auszählen (figuren.md §8): über alle Einführungen kommt jedes Kind der Runde etwa gleich oft vor und zeigt
// etwa gleich oft vor; Mädchen (Ela, Lena) und Jungen (Kofi, Timo) gleich oft, Timo wie alle.
test("Einführungen: die Runde ist gleich verteilt, keine anderen Figuren", () => {
  const vorlagen = readdirSync(new URL("../spiele/einfuehrungen/", import.meta.url)).filter((d) => d.endsWith(".json"));
  const kommt = new Map(), zeigtVor = new Map();
  for (const d of vorlagen) {
    const v = lade(`../spiele/einfuehrungen/${d}`);
    const bild = v.szenen.flatMap((s) => s.bild ?? []).filter((b) => b.figur !== undefined);
    assert.ok(bild.length > 0, `${d}: kein Kind der Runde`);
    for (const b of bild) assert.ok(R.bestand.kinder.has(b.figur), `${d}: ${b.figur} ist kein Kind der Runde`);
    for (const k of new Set(bild.map((b) => b.figur))) kommt.set(k, (kommt.get(k) ?? 0) + 1);
    const vor = new Set(bild.filter((b) => b.aufgabe === "vorzeigen").map((b) => b.figur));
    assert.equal(vor.size, 1, `${d}: genau ein Kind zeigt vor`);
    for (const k of vor) zeigtVor.set(k, (zeigtVor.get(k) ?? 0) + 1);
  }
  const kinder = [...R.bestand.kinder.keys()];
  const spanne = (m) => Math.max(...kinder.map((k) => m.get(k) ?? 0)) - Math.min(...kinder.map((k) => m.get(k) ?? 0));
  assert.ok(spanne(kommt) <= 1, `vorkommen: ${JSON.stringify(Object.fromEntries(kommt))}`);
  assert.ok(spanne(zeigtVor) <= 1, `vorzeigen: ${JSON.stringify(Object.fromEntries(zeigtVor))}`);
  const summe = (ids) => ids.reduce((n, k) => n + (zeigtVor.get(k) ?? 0), 0);
  assert.ok(Math.abs(summe(["ela", "lena"]) - summe(["kofi", "timo"])) <= 1, "Mädchen und Jungen zeigen gleich oft vor");
});

test("Einführung über die 10: Werte m und fehlt ergeben zusammen den Zehner", () => {
  const ueber = mitEinfuehrung.filter((t) => t.einfuehrung.vorlage === "einfuehrungen/ueber-10.json");
  assert.ok(ueber.length > 0);
  for (const t of ueber) assert.equal(t.einfuehrung.werte.m + t.einfuehrung.werte.fehlt, 10, t.id);
});

test("Einführung zerlegen: Werte h und r teilen n nahe der Mitte", () => {
  const zerl = mitEinfuehrung.filter((t) => t.einfuehrung.vorlage === "einfuehrungen/zerlegen.json");
  assert.ok(zerl.length > 0);
  for (const t of zerl) {
    const { n, h, r } = t.einfuehrung.werte;
    assert.equal(h + r, n, t.id);
    assert.ok(h >= 1 && r >= h && r - h <= 1, `${t.id}: ${h} + ${r}`);
  }
});

// Ketten wie „17 + 6 = 17 + 3 + 3 = 23“ oder „13 − 5 = 8“: jede Seite von links nach rechts gerechnet, alle gleich, nie negativ.
const rechne = (ausdruck, wo) => {
  const teile = ausdruck.replace(/−/g, "-").match(/\d+|[+-]/g);
  let wert = Number(teile[0]);
  for (let i = 1; i < teile.length; i += 2) {
    wert = teile[i] === "+" ? wert + Number(teile[i + 1]) : wert - Number(teile[i + 1]);
    assert.ok(wert >= 0, `${wo}: negativ in „${ausdruck}“`);
  }
  return wert;
};
test("Einführungen: Gleichungen in zeig stimmen (mit den Werten jedes Themas)", () => {
  let geprueft = 0;
  for (const t of mitEinfuehrung) {
    const szenen = fuelleVorlage(lade(`../spiele/${t.einfuehrung.vorlage}`), t.einfuehrung.werte);
    for (const [i, s] of szenen.entries()) {
      for (const kette of s.zeig.match(/\d+(?:\s*[+\-−=]\s*\d+)+/g) ?? []) {
        if (!kette.includes("=")) continue;
        const wo = `${t.id} Szene ${i + 1}`;
        const seiten = kette.split("=").map((x) => rechne(x, wo));
        for (const w of seiten) assert.equal(w, seiten[0], `${wo}: „${kette}“`);
        geprueft++;
      }
    }
  }
  assert.ok(geprueft > 50, `nur ${geprueft} Gleichungen gefunden`);
});

test("Plan: Welten der Kosmik-Schicht sind vollständig und gültig", () => {
  assert.ok((plan.welten ?? []).length >= 90, "zu wenige Welten");
  regeln.welten(plan);
  for (const u of plan.ueberschriften) assert.ok(plan.welten.some((w) => w.ueberschrift === u.id), `Überschrift ${u.id} ohne Welten`);
  assert.equal(plan.ueberschriften.length, 8);
});

test("Plan: Welten-Regel erkennt falsche Verweise, gesperrte Wörter und fehlende Elterntexte", () => {
  const themen = [{ id: "t" }];
  const ueberschriften = [{ id: "u", name: "U", art: "sache" }, { id: "s", name: "S", art: "schutz" }];
  const w = { id: "w", name: "Maus", ueberschrift: "u", klasse: 1, quellen: ["HSU12"], anbindung: "M: zählen", themen: ["t"], stufe_ab: "ruhig", fakten: [] };
  const pruefe = (x) => regeln.welten({ themen, ueberschriften, welten: [x] });
  pruefe(w);
  assert.throws(() => pruefe({ ...w, ueberschrift: "x" }), /Überschrift x fehlt/);
  assert.throws(() => pruefe({ ...w, themen: ["gibt-es-nicht"] }), /fehlt im Plan/);
  assert.throws(() => pruefe({ ...w, ueberschrift: "s" }), /ohne eltern/);
  pruefe({ ...w, ueberschrift: "s", eltern: "E" });
  assert.throws(() => pruefe({ ...w, fakten: [{ satz: "Mäuse haben Schnurrhaare." }] }), /ohne Quelle/);
  assert.throws(() => pruefe({ ...w, name: "Fehler sind okay" }), /gesperrtes Wort/);
  assert.throws(() => pruefe({ ...w, name: "Super gemacht" }), /gesperrtes Wort/);
  assert.throws(() => pruefe({ ...w, name: "Ich bin liebenswert" }), /Selbstwert/);
  pruefe({ ...w, name: "Ich darf Nein sagen" });
  assert.throws(() => pruefe({ ...w, stufe_ab: "wild" }), /stufe_ab/);
  assert.throws(() => regeln.welten({ themen, ueberschriften, welten: [w, w] }), /doppelte Welt/);
});
