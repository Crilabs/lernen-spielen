// Tagesbrief (docs/superpowers/specs/2026-11-17-tagesbrief-design.md, „Der Brief“): setzeBrief setzt aus dem Topf
// einer Adresse Betreff, HTML und Text. Geprüft werden Inhalt, Obergrenzen, Knappheit und Sprache.
import { test } from "node:test";
import assert from "node:assert/strict";
import { setzeBrief, istBriefWert, FACH_FARBEN, DUNKEL } from "../spiele/tagesbrief/brief.js";
import { FACH } from "../spiele/rahmen/stil.js";

const DATUM = new Date("2026-11-16T12:00:00+01:00");
const OPT = { datum: DATUM };

const gekonnt = (id, name, zweck = "Zweck von " + name, fach = "mathe") => ({ id, name, zweck, fach });
const dabei = (id, name, fach = "mathe") => ({ id, name, fach });
const gelesen = (id, titel, frage = "Frage?", antwort = "Antwort.") => ({ id, titel, frage, antwort });
const form = (situation, wort, name) => ({
  situation, wort, name, braucht: "etwas zum Rechnen", schritte: ["Erster Schritt.", "Zweiter Schritt."],
  kern: "Neun ist eins weniger als zehn.", verinnerlichen: "",
});
const NAECHSTES = {
  id: "neunerreihe", thema: "Neunerreihe", fach: "mathe", titel: "Neun ist eins weniger als zehn",
  passendZuGerade: false, foto: "QUJD",
  formen: [form("unterwegs", "Unterwegs", "Eintritt für alle"), form("bewegung", "In Bewegung", "Zehn vor, einen zurück")],
  weitere: ["Einmaleins gemischt", "Geteilt durch 2, 5, 10"],
};
const BEISPIEL = () => ({
  namen: ["Mila"],
  gekonnt: [
    gekonnt("achter", "Achterreihe", "Ausrechnen, wie viele Beine mehrere Spinnen haben."),
    gekonnt("zehner", "Zehner und Einer bis 20", "Viele Stifte schneller zählen."),
  ],
  dabei: [dabei("kern", "Kernaufgaben: mal 1, 2, 5, 10"), dabei("nomen", "Nomen mit Artikel", "grammatik")],
  gelesen: [gelesen("wal", "Mira, die Riesin im Meer", "Womit atmet ein Wal?", "Mit einer Lunge, wie du.")],
  naechstes: NAECHSTES,
});

/** Sichtbarer Text des HTML: ohne Tags und Stilblöcke. */
const sichtbar = (html) => html.replace(/<style[\s\S]*?<\/style>|<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");
/** Ohne die Anleitungskarte: alles von „Als Nächstes“ bis vor „Danach im Lernplan:“ entfällt. */
const ohneAnleitung = (s) => s.replace(/(Als Nächstes|Passend zu gerade)[\s\S]*?(?=Danach im Lernplan:|Gesendet von)/, " ");
const woerter = (s) => s.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

const VERBOTEN = [/muss noch/i, /schwach/i, /Rückstand/i, /hinterher/i, /%/, /sollte/i];

test("Fachfarben sind eine Kopie von FACH in rahmen/stil.js (brief.js läuft allein auf dem Server)", () => {
  assert.deepEqual(Object.keys(FACH_FARBEN).sort(), Object.keys(FACH).sort());
  for (const [fach, f] of Object.entries(FACH)) assert.deepEqual(FACH_FARBEN[fach], { tief: f.tief, toenung: f.toenung }, fach);
});

test("Betreff: erstes gekonnt, sonst Lernstand mit Datum, Namen", () => {
  assert.equal(setzeBrief(BEISPIEL(), OPT).betreff, "Mila: neu gekonnt – Achterreihe");
  const ohne = { ...BEISPIEL(), gekonnt: [] };
  assert.equal(setzeBrief(ohne, OPT).betreff, "Mila: Lernstand vom Montag, 16. November");
  assert.ok(setzeBrief({ ...BEISPIEL(), namen: [] }, OPT).betreff.startsWith("Ihr Kind"));
  assert.ok(setzeBrief({ ...BEISPIEL(), namen: ["Mila", "Noah"] }, OPT).betreff.startsWith("Mila und Noah: "));
  assert.ok(setzeBrief({ ...BEISPIEL(), namen: ["Mila", "Noah", "Lea"] }, OPT).betreff.startsWith("Mila, Noah und Lea: "));
});

test("HTML des Beispiel-Topfs enthält alle Abschnitte", () => {
  const { html } = setzeBrief(BEISPIEL(), OPT);
  for (const s of ["Neu gekonnt: Achterreihe", "Ausrechnen, wie viele Beine mehrere Spinnen haben.",
    "Außerdem neu: Zehner und Einer bis 20", "Im Moment dabei", "Fragen Sie mal: Womit atmet ein Wal?",
    "Mit einer Lunge, wie du.", "cid:anleitung", "Eintritt für alle", "Zehn vor, einen zurück",
    "Als Nächstes mit echten Dingen: Neunerreihe", "Danach im Lernplan:", "Einmaleins gemischt", "{{ABMELDEN}}",
    "{{DATENSCHUTZ}}", "Mila · Montag, 16. November", "Gesendet von der Lern-App."]) {
    assert.ok(html.includes(s), s);
  }
  assert.ok(html.startsWith("<!doctype html>"));
});

test("Links und Anleitung: eigene Links, Passend zu gerade, Fachfarbe, Foto optional", () => {
  const { html } = setzeBrief(BEISPIEL(), { datum: DATUM, abmeldeLink: "https://x.de/a?t=1&u=2", datenschutzLink: "https://x.de/d" });
  assert.ok(html.includes('href="https://x.de/a?t=1&amp;u=2"') && html.includes('href="https://x.de/d"'));
  const pz = setzeBrief({ ...BEISPIEL(), naechstes: { ...NAECHSTES, passendZuGerade: true, foto: "" } }, OPT);
  assert.ok(pz.html.includes("Passend zu gerade mit echten Dingen: Neunerreihe"));
  assert.ok(!pz.html.includes("cid:anleitung"));
  assert.ok(html.includes(FACH.mathe.toenung) && html.includes(FACH.mathe.tief));
  const g = setzeBrief({ ...BEISPIEL(), naechstes: { ...NAECHSTES, fach: "grammatik" } }, OPT).html;
  assert.ok(g.includes(FACH.grammatik.toenung));
});

test("Buch ohne erinnern-Frage: nur der Titel, keine leere „Fragen Sie mal“-Zeile", () => {
  const topf = { ...BEISPIEL(), gelesen: [gelesen("buch", "Ein Buch ohne Frage", "", "")] };
  const { html, text } = setzeBrief(topf, OPT);
  for (const s of [html, text]) {
    assert.ok(s.includes("Ein Buch ohne Frage"));
    assert.ok(!s.includes("Fragen Sie mal"));
    assert.ok(!s.includes("–"), "keine leere Antwortzeile");
  }
});

test("Zum Verinnerlichen: der Satz steht über „Ihr braucht“", () => {
  const f = { ...form("tisch", "Zum Verinnerlichen", "Im Kopf"), verinnerlichen: "Sagt die Reihe laut auf." };
  const { html, text } = setzeBrief({ ...BEISPIEL(), naechstes: { ...NAECHSTES, formen: [f] } }, OPT);
  for (const s of [html, text]) assert.ok(s.indexOf("Sagt die Reihe laut auf.") < s.indexOf("Ihr braucht"));
});

test("leere Abschnitte fallen weg", () => {
  const nurDabei = { namen: ["Mila"], gekonnt: [], dabei: [dabei("a", "Nomen mit Artikel")], gelesen: [], naechstes: null };
  const { html, text } = setzeBrief(nurDabei, OPT);
  for (const s of [html, text]) {
    assert.ok(s.includes("Im Moment dabei"));
    for (const nicht of ["Gelesen", "Neu gekonnt", "Als Nächstes", "Danach im Lernplan", "cid:anleitung"]) assert.ok(!s.includes(nicht), nicht);
  }
});

test("Obergrenzen: 5 gekonnt, 3 dabei, 3 gelesen, 2 weitere", () => {
  const viele = (n, f) => Array.from({ length: n }, (_, i) => f(i));
  const topf = {
    namen: ["Mila"],
    gekonnt: viele(7, (i) => gekonnt("g" + i, "Gekonnt" + i, "Zweck" + i)),
    dabei: viele(5, (i) => dabei("d" + i, "Dabei" + i)),
    gelesen: viele(4, (i) => gelesen("b" + i, "Buch" + i)),
    naechstes: { ...NAECHSTES, weitere: ["W0", "W1", "W2", "W3"] },
  };
  const { html, text } = setzeBrief(topf, OPT);
  const zaehle = (s, muster) => (s.match(muster) || []).length;
  for (const s of [html, text]) {
    assert.equal(zaehle(s, /Gekonnt\d/g), 5);
    assert.equal(zaehle(s, /Dabei\d/g), 3);
    assert.equal(zaehle(s, /Buch\d/g), 3);
    assert.equal(zaehle(s, /W\d(?!\d)/g), 2);
  }
});

test("dabei mit der Id eines gekonnt erscheint nicht unter „Im Moment dabei“", () => {
  const topf = { ...BEISPIEL(), dabei: [dabei("achter", "Achterreihe-Runde"), dabei("kern", "Kernaufgaben")] };
  const { html, text } = setzeBrief(topf, OPT);
  for (const s of [html, text]) {
    assert.ok(!s.includes("Achterreihe-Runde"));
    assert.ok(s.includes("Kernaufgaben"));
  }
  const nur = { ...BEISPIEL(), dabei: [dabei("achter", "Achterreihe-Runde")] };
  assert.ok(!setzeBrief(nur, OPT).html.includes("Im Moment dabei"));
});

// Der Fuß („Gesendet von … Abbestellen · Datenschutz“) ist Rahmen, kein Inhalt und zählt nicht mit.
test("Knappheit: ohne Anleitung, Zwecksätze und Fuß höchstens 60 Wörter", () => {
  const topf = BEISPIEL();
  const { html, text } = setzeBrief(topf, OPT);
  for (const quelle of [sichtbar(html), text]) {
    let s = ohneAnleitung(quelle).replace(/Gesendet von[\s\S]*$/, " ");
    for (const g of topf.gekonnt) s = s.replace(g.zweck, " ");
    assert.ok(woerter(s) <= 60, `${woerter(s)} Wörter: ${s}`);
  }
});

test("Sprache: Eltern mit Sie, Kind nur mit Namen, keine Wertungen", () => {
  const { html, text } = setzeBrief(BEISPIEL(), OPT);
  for (const quelle of [sichtbar(html), text]) {
    const s = ohneAnleitung(quelle);
    assert.ok(!/\b(sie|er|ihm|ihn)\b/.test(s), s);
  }
  for (const quelle of [sichtbar(html), text]) for (const v of VERBOTEN) assert.ok(!v.test(quelle), String(v));
});

test("Texte werden maskiert", () => {
  const topf = { ...BEISPIEL(), gelesen: [gelesen("x", 'Tom & "Jerry" <b>')] };
  const { html, text } = setzeBrief(topf, OPT);
  assert.ok(html.includes("Tom &amp; &quot;Jerry&quot; &lt;b&gt;"));
  assert.ok(!html.includes("<b>Jerry"));
  assert.ok(text.includes('Tom & "Jerry" <b>'));
});

test("text hat dieselben Abschnitte wie html", () => {
  const { text } = setzeBrief(BEISPIEL(), OPT);
  for (const s of ["Mila · Montag, 16. November", "Neu gekonnt: Achterreihe", "Ausrechnen, wie viele Beine mehrere Spinnen haben.",
    "Außerdem neu: Zehner und Einer bis 20", "Im Moment dabei", "Kernaufgaben: mal 1, 2, 5, 10", "Nomen mit Artikel",
    "Gelesen", "Mira, die Riesin im Meer", "Fragen Sie mal: Womit atmet ein Wal?", "Als Nächstes mit echten Dingen: Neunerreihe",
    "Eintritt für alle", "Zehn vor, einen zurück", "Ihr braucht:", "Darauf kommt es an:", "Danach im Lernplan: Einmaleins gemischt, Geteilt durch 2, 5, 10",
    "Gesendet von der Lern-App."]) {
    assert.ok(text.includes(s), s);
  }
  assert.ok(!text.includes("<"));
});

test("ohne gekonnt/dabei/gelesen kein Brief", () => {
  const leer = { namen: [], gekonnt: [], dabei: [], gelesen: [], naechstes: NAECHSTES };
  assert.equal(setzeBrief(leer, OPT), null);
  assert.equal(istBriefWert(leer), false);
  assert.equal(istBriefWert({ ...leer, gelesen: [gelesen("a", "A")] }), true);
  assert.equal(istBriefWert({ ...leer, dabei: [dabei("a", "A")] }), true);
  assert.equal(istBriefWert({ ...leer, gekonnt: [gekonnt("a", "A")] }), true);
});

/** WCAG-Kontrast zweier Hex-Farben. */
const kontrast = (a, b) => {
  const lum = (h) => {
    const [r, g, bl] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
const mische = (a, b, t) => "#" + [1, 3, 5].map((i) => Math.round(parseInt(a.slice(i, i + 2), 16) * t + parseInt(b.slice(i, i + 2), 16) * (1 - t)).toString(16).padStart(2, "0")).join("").toUpperCase();

test("Dunkelfassung: Meta für beide Farbschemata, Style-Block mit Media-Query und [data-ogsc]", () => {
  const { html } = setzeBrief(BEISPIEL(), OPT);
  assert.ok(html.includes('<meta name="color-scheme" content="light dark">'));
  assert.ok(html.includes('<meta name="supported-color-schemes" content="light dark">'));
  assert.ok(!html.includes("light only"));
  const style = html.match(/<style>([\s\S]*?)<\/style>/)[1];
  assert.ok(style.includes("@media (prefers-color-scheme: dark)"));
  const schnitt = style.indexOf("\n[data-ogsc]");
  const [medien, ogsc] = [style.slice(0, schnitt), style.slice(schnitt)];
  const regeln = (medien.match(/\.tb-[^{]+\{/g) ?? []).length;
  assert.ok(regeln > 10);
  assert.equal((ogsc).match(/\[data-ogsc\] \.tb-[^{]+\{/g).length, regeln);
  assert.ok(style.includes(`background-color:${DUNKEL.seite} !important`) && style.includes(`background-color:${DUNKEL.karte} !important`));
  assert.ok(!/@import|<link|url\(/.test(html));
});

test("Dunkelfassung: Klassen an Seite, Karte, Anleitung, Akzenten, Linien und Kernfeld", () => {
  const { html } = setzeBrief(BEISPIEL(), OPT);
  assert.ok(html.includes('<body class="tb-seite"'));
  assert.ok(html.includes('class="tb-karte"'));
  assert.ok(html.includes('class="tb-anleitung-mathe"'));
  assert.ok(html.includes('class="tb-akzent-mathe"') && html.includes('class="tb-akzent-grammatik"'));
  assert.ok(html.includes('class="tb-kern"') && html.includes("tb-linie") && html.includes("tb-weich"));
  assert.ok(!html.includes('class="tb-anleitung-neutral"'));
  assert.ok(setzeBrief({ ...BEISPIEL(), naechstes: { ...NAECHSTES, fach: "unbekannt" } }, OPT).html.includes('class="tb-anleitung-neutral"'));
  // helle Fassung bleibt: Inline-Farben unverändert
  assert.ok(html.includes(`background:${FACH.mathe.toenung}`) && html.includes("background:#FFFCF7"));
});

test("Dunkelfassung: Anleitungskarte ist Fach-tief zu 40 % über die Karte gemischt", () => {
  for (const [fach, f] of Object.entries(FACH_FARBEN)) assert.equal(DUNKEL.faecher[fach].anleitung, mische(f.tief, DUNKEL.karte, 0.4), fach);
  assert.deepEqual(Object.keys(DUNKEL.faecher).sort(), [...Object.keys(FACH_FARBEN), "neutral"].sort());
});

test("Dunkelfassung: jede Text/Hintergrund-Kombination erreicht mindestens 4.5:1", () => {
  const paare = [
    ["Text auf Karte", DUNKEL.text, DUNKEL.karte],
    ["Text weich auf Karte", DUNKEL.weich, DUNKEL.karte],
    ["Text auf Kernfeld", DUNKEL.text, DUNKEL.kern],
  ];
  for (const [fach, f] of Object.entries(DUNKEL.faecher)) {
    paare.push([`Text auf Anleitung ${fach}`, DUNKEL.text, f.anleitung], [`Akzent ${fach} auf Anleitung`, f.akzent, f.anleitung],
      [`Akzent ${fach} auf Karte`, f.akzent, DUNKEL.karte]);
  }
  for (const [name, vorn, hinten] of paare) assert.ok(kontrast(vorn, hinten) >= 4.5, `${name}: ${kontrast(vorn, hinten).toFixed(2)}`);
  // Fließtext deutlich darüber (WCAG AAA): Mailprogramme hellen dunkle Flächen oft noch selbst auf (Christian 2026-11-17).
  for (const [name, vorn, hinten] of paare.filter(([n]) => n.startsWith("Text"))) {
    assert.ok(kontrast(vorn, hinten) >= 7, `${name}: ${kontrast(vorn, hinten).toFixed(2)} < 7`);
  }
});
