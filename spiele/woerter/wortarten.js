// Sätze der Aufgabenart „wortart“ (G01 Dreieck und Kreis): Wörter eines Satzes mit ihrer Wortart und den Daten der Probe –
// reine Daten ohne DOM. Das grammatische Geschlecht und die Beugung stehen hier ausgeschrieben, damit nichts zur Laufzeit
// zusammengesetzt wird (die Sätze der Stimme stehen in spiele/grammatik/g01-…/texte.json, getestet gegen diese Datei).
//
// Wort: { wort, art: "nomen" | "verb" | "adjektiv" | "artikel" | null, ... }
//   nomen     artikel (der/die/das, Nominativ Einzahl), grundform (= wort), bild?
//   verb      grundform, ich, du (die Probe „ich gähne, du gähnst“), bild?; nur Verben ohne Lautwechsel (gleicher Stamm)
//   adjektiv  artikel und nomen des Nomens, zu dem es gehört (die Probe „der große Hund“; Kl. 2, wiewoerter)
//   artikel, null (Funktionswort wie „auf“, „zum“): bleiben unbelegt
// Keine Personen-Nomen (Geschlecht ist willkürlich und kein Thema, grundsaetze §6.1) und keine Sachbehauptungen (G11):
// jeder Satz stimmt in der Welt, die er beschreibt.
// schwierigkeit: 0 = kurzer Satz, dessen Wörter ein Kreidebild haben; 1 = längerer Satz oder Wörter ohne Bild;
// 2 = Nomen, die man nicht anfassen kann (Durst, Wind), und längere Sätze.

/**
 * @typedef {{ wort: string, art: "nomen" | "verb" | "adjektiv" | "artikel" | null, artikel?: "der" | "die" | "das",
 *   grundform?: string, ich?: string, du?: string, nomen?: string, bild?: string }} Wort
 * @typedef {{ id: string, schwierigkeit: 0 | 1 | 2, text: string, woerter: Wort[] }} Satz
 */

/** @param {string} wort @returns {Wort} */
const art = (wort) => ({ wort, art: "artikel" });
/** @param {string} wort @returns {Wort} */
const fw = (wort) => ({ wort, art: null });
/** @param {string} wort @param {"der" | "die" | "das"} artikel @param {string} [bild] @returns {Wort} */
const nomen = (wort, artikel, bild) => ({ wort, art: "nomen", artikel, grundform: wort, ...(bild ? { bild } : {}) });
/** @param {string} wort @param {string} grundform @param {string} ich @param {string} du @param {string} [bild] @returns {Wort} */
const verb = (wort, grundform, ich, du, bild) => ({ wort, art: "verb", grundform, ich, du, ...(bild ? { bild } : {}) });
/** @param {string} wort @param {"der" | "die" | "das"} artikel @param {string} n @returns {Wort} */
const adj = (wort, artikel, n) => ({ wort, art: "adjektiv", artikel, nomen: n });

/** @param {string} id @param {0 | 1 | 2} schwierigkeit @param {Wort[]} woerter @returns {Satz} */
const satz = (id, schwierigkeit, woerter) => ({ id, schwierigkeit, text: `${woerter.map((w) => w.wort).join(" ")}.`, woerter });

/** @type {Satz[]} */
export const SAETZE = [
  // 0: kurz, mit Bild
  satz("katze-gaehnt", 0, [art("Die"), nomen("Katze", "die", "katze"), verb("gähnt", "gähnen", "gähne", "gähnst", "gaehnen")]),
  satz("hund-bellt", 0, [art("Der"), nomen("Hund", "der", "hund"), verb("bellt", "bellen", "belle", "bellst", "bellen")]),
  satz("ball-rollt", 0, [art("Der"), nomen("Ball", "der", "ball"), verb("rollt", "rollen", "rolle", "rollst", "rollen")]),
  satz("hund-gaehnt", 0, [art("Der"), nomen("Hund", "der", "hund"), verb("gähnt", "gähnen", "gähne", "gähnst", "gaehnen")]),
  satz("katze-miaut", 0, [art("Die"), nomen("Katze", "die", "katze"), verb("miaut", "miauen", "miaue", "miaust", "miauen")]),
  satz("ball-huepft", 0, [art("Der"), nomen("Ball", "der", "ball"), verb("hüpft", "hüpfen", "hüpfe", "hüpfst", "huepfen")]),
  satz("apfel-rollt", 0, [art("Der"), nomen("Apfel", "der", "apfel"), verb("rollt", "rollen", "rolle", "rollst", "rollen")]),
  // 1: länger oder ohne Bild
  satz("baum-rauscht", 1, [art("Der"), nomen("Baum", "der", "baum"), verb("rauscht", "rauschen", "rausche", "rauschst")]),
  satz("haus-steht", 1, [art("Das"), nomen("Haus", "das", "haus"), verb("steht", "stehen", "stehe", "stehst")]),
  satz("tasse-steht", 1, [art("Die"), nomen("Tasse", "die", "tasse"), verb("steht", "stehen", "stehe", "stehst")]),
  satz("schuh-liegt", 1, [art("Der"), nomen("Schuh", "der", "schuh"), verb("liegt", "liegen", "liege", "liegst")]),
  satz("katze-jagt-ball", 1, [art("Die"), nomen("Katze", "die", "katze"), verb("jagt", "jagen", "jage", "jagst"), art("den"), nomen("Ball", "der", "ball")]),
  satz("hund-holt-ball", 1, [art("Der"), nomen("Hund", "der", "hund"), verb("holt", "holen", "hole", "holst"), art("den"), nomen("Ball", "der", "ball")]),
  satz("hund-trinkt-wasser", 1, [art("Der"), nomen("Hund", "der", "hund"), verb("trinkt", "trinken", "trinke", "trinkst"), nomen("Wasser", "das")]),
  satz("katze-trinkt-milch", 1, [art("Die"), nomen("Katze", "die", "katze"), verb("trinkt", "trinken", "trinke", "trinkst"), nomen("Milch", "die")]),
  satz("hund-rennt-haus", 1, [art("Der"), nomen("Hund", "der", "hund"), verb("rennt", "rennen", "renne", "rennst"), fw("zum"), nomen("Haus", "das", "haus")]),
  satz("ball-rollt-baum", 1, [art("Der"), nomen("Ball", "der", "ball"), verb("rollt", "rollen", "rolle", "rollst", "rollen"), fw("zum"), nomen("Baum", "der", "baum")]),
  satz("katze-springt-baum", 1, [art("Die"), nomen("Katze", "die", "katze"), verb("springt", "springen", "springe", "springst"), fw("auf"), art("den"), nomen("Baum", "der", "baum")]),
  satz("hund-liegt-baum", 1, [art("Der"), nomen("Hund", "der", "hund"), verb("liegt", "liegen", "liege", "liegst"), fw("unter"), art("dem"), nomen("Baum", "der", "baum")]),
  satz("apfel-liegt-teller", 1, [art("Der"), nomen("Apfel", "der", "apfel"), verb("liegt", "liegen", "liege", "liegst"), fw("auf"), art("dem"), nomen("Teller", "der")]),
  satz("tasse-steht-tisch", 1, [art("Die"), nomen("Tasse", "die", "tasse"), verb("steht", "stehen", "stehe", "stehst"), fw("auf"), art("dem"), nomen("Tisch", "der")]),
  satz("hund-springt-zaun", 1, [art("Der"), nomen("Hund", "der", "hund"), verb("springt", "springen", "springe", "springst"), fw("über"), art("den"), nomen("Zaun", "der")]),
  // 2: Nomen, die man nicht anfassen kann
  satz("hund-hat-durst", 2, [art("Der"), nomen("Hund", "der", "hund"), verb("hat", "haben", "habe", "hast"), nomen("Durst", "der")]),
  satz("katze-hat-hunger", 2, [art("Die"), nomen("Katze", "die", "katze"), verb("hat", "haben", "habe", "hast"), nomen("Hunger", "der")]),
  satz("wind-weht", 2, [art("Der"), nomen("Wind", "der"), verb("weht", "wehen", "wehe", "wehst")]),
  satz("sonne-scheint", 2, [art("Die"), nomen("Sonne", "die"), verb("scheint", "scheinen", "scheine", "scheinst")]),
  satz("regen-tropft", 2, [art("Der"), nomen("Regen", "der"), verb("tropft", "tropfen", "tropfe", "tropfst")]),
  // Adjektive (Kl. 2, wiewoerter; das Thema hat noch keine Aufgaben, die Daten tragen es)
  satz("grosser-hund-bellt", 1, [art("Der"), adj("große", "der", "Hund"), nomen("Hund", "der", "hund"), verb("bellt", "bellen", "belle", "bellst", "bellen")]),
  satz("kleine-katze-gaehnt", 1, [art("Die"), adj("kleine", "die", "Katze"), nomen("Katze", "die", "katze"), verb("gähnt", "gähnen", "gähne", "gähnst", "gaehnen")]),
  satz("roter-ball-rollt", 1, [art("Der"), adj("rote", "der", "Ball"), nomen("Ball", "der", "ball"), verb("rollt", "rollen", "rolle", "rollst", "rollen")]),
  satz("altes-haus-steht", 1, [art("Das"), adj("alte", "das", "Haus"), nomen("Haus", "das", "haus"), verb("steht", "stehen", "stehe", "stehst")]),
  satz("heisse-tasse-steht", 1, [art("Die"), adj("heiße", "die", "Tasse"), nomen("Tasse", "die", "tasse"), verb("steht", "stehen", "stehe", "stehst")]),
  satz("runder-apfel-rollt", 1, [art("Der"), adj("runde", "der", "Apfel"), nomen("Apfel", "der", "apfel"), verb("rollt", "rollen", "rolle", "rollst", "rollen")]),
];

/** Die Wortarten, die ein Symbol tragen (D1; der Artikel hat seine Handlung in G09). */
export const ZIEL_ARTEN = Object.freeze(["nomen", "verb", "adjektiv"]);

/** Satz zu einer Kennung (katze-gaehnt) oder null. @param {string} id */
export const satzMit = (id) => SAETZE.find((s) => s.id === id) ?? null;

/**
 * Die Sätze, in denen das Symbol der Wortart etwas zu tun hat: Adjektiv nur in Adjektiv-Sätzen; Nomen und Verb nur in
 * Sätzen ohne Adjektiv (ihre Proben gehören zu den Themen der Klasse 1).
 * @param {string} ziel
 */
export function saetzeFuer(ziel) {
  if (!ZIEL_ARTEN.includes(ziel)) return [];
  return SAETZE.filter((s) => {
    const mitAdjektiv = s.woerter.some((w) => w.art === "adjektiv");
    return s.woerter.some((w) => w.art === ziel) && (ziel === "adjektiv" ? mitAdjektiv : !mitAdjektiv);
  });
}

/** Trennt ein Verbwort in Stamm und Endung (gähn|t); die Formen ich und du teilen den Stamm. @param {Wort} w */
export function verbTeile(w) {
  const formen = [w.wort, w.ich ?? "", w.du ?? ""];
  let n = 0;
  while (formen.every((f) => f[n] && f[n] === formen[0][n])) n++;
  return { stamm: w.wort.slice(0, n), t: w.wort.slice(n), ich: (w.ich ?? "").slice(n), du: (w.du ?? "").slice(n) };
}

/**
 * Die Probe einer Wortart an einem Wort, als Sprechtext: Nomen „Die Katze.“, Verb „Ich gähne, du gähnst.“, Adjektiv
 * „Der große Hund.“; sonst null.
 * @param {Wort} w
 */
export function probeText(w) {
  const gross = (/** @type {string} */ s) => `${s[0].toUpperCase()}${s.slice(1)}`;
  if (w.art === "nomen") return `${gross(w.artikel ?? "")} ${w.grundform}.`;
  if (w.art === "verb") return `Ich ${w.ich}, du ${w.du}.`;
  if (w.art === "adjektiv") return `${gross(w.artikel ?? "")} ${w.wort} ${w.nomen}.`;
  return null;
}

/**
 * Was die Probe sagt, wenn das Symbol auf einem Wort liegt, zu dem es nicht passt (die Frage ohne Antwort): Dreieck
 * „Der gähnt?“, Kreis „Ich Katze?“, Adjektiv-Dreieck „Das gähnt Haus?“.
 * @param {"nomen" | "verb" | "adjektiv"} symbol @param {Wort} w
 */
export function danebenText(symbol, w) {
  const klein = w.art === "nomen" ? w.wort : w.wort.toLowerCase();
  if (symbol === "nomen") return `Der ${klein}?`;
  if (symbol === "verb") return `Ich ${klein}?`;
  return `Das ${klein} Haus?`;
}
