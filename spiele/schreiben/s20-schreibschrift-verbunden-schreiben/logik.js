// S20 Leuchtschrift: reine Spiellogik ohne DOM (in Node testbar, tests/spiele/schreiben/s20-schreibschrift-verbunden-schreiben.test.mjs).
//
// Alles rechnet in Vorlagen-Einheiten (spiele/schrift/vorlagen/raster.json: Oberlänge 0, Mittellinie 100, Grundlinie 200,
// Unterlänge 300, x gleiche Einheit). Das Spiel rechnet Bildpunkte vorher in diese Einheiten um.
//
// Die Prüfung ist tolerant und sieht nur, was messbar ist (Idee §4): Absetzen mitten im Wort, ob das Wort überhaupt
// geschrieben wurde (Länge, Breite, Punkte, Form), Startpunkt, Drehrichtung, Band. Nie Schönheit, Druck, Größe oder Lage
// der Hand. Es kommt höchstens ein Befund heraus, der erste in dieser Reihe.

/** @typedef {{ x: number, y: number }} Punkt */
/** @typedef {{ x: number, y: number, t?: number }} Probe */
/** @typedef {{ punkte: Probe[] }} Strich */
/** @typedef {{ breite: number, striche: Punkt[][], luft: boolean[] }} Wort */
/** @typedef {{ zeichen: string, striche: Punkt[][], luft: boolean[] }} FormTeil */
/**
 * @typedef {{ ok: true } | { ok: false, befund: "leer" | "luecke" | "wort" | "start" | "richtung" | "band",
 *   stelle: Punkt | null, buchstabe: number }} Urteil
 */

/** Wie lange der Stift oben bleiben muss, bis die Kamera auslöst (Idee §1, Annahme; i-Punkt und Umlautpunkte passen hinein). */
export const ABHEBEN_MS = 800;

/** Ein Strich unter dieser Wegstrecke (Einheiten) ist ein Tupfer und zählt nicht. */
const WINZIG = 8;
/** Bis zu dieser Wegstrecke ist ein Strich nach dem ersten ein Punkt (i, j, ä, ö, ü), nicht der Rest des Wortes. */
const PUNKT = 42;
/** So weit (Einheiten) darf der Start vom Startpunkt der Vorlage abweichen, waagerecht und senkrecht. */
const START_DX = 40;
const START_DY = 55;
/** So weit darf die Spur über und unter dem Band der Vorlage liegen. */
const BAND_RAND = 50;
/** Drehrichtung: so stark muss ein Buchstabe der Vorlage drehen, und so stark das Gegenteil beim Kind (Bogenmaß). */
const DREHT_VORLAGE = 2.6;
const DREHT_KIND = 1.5;
/** Weglänge und Breite der Kinderspur im Verhältnis zur Vorlage (dazu je ein fester Zuschlag für sehr kurze Buchstaben wie i). */
const VERHAELTNIS_MIN = 0.6;
const VERHAELTNIS_MAX = 1.6;
const ZUSCHLAG_WEG = 30;
const ZUSCHLAG_BREITE = 20;
/** Form: so weit liegen gleich weit gelaufene Stellen von Kind und Vorlage im Mittel und höchstens (90 %) auseinander (Einheiten). */
const FORM_MITTEL = 28;
const FORM_P90 = 52;
/** Eine Richtungsänderung ab diesem Winkel (Bogenmaß) ist eine Spitze, keine Kurve. */
const SPITZE = 2.5;

/** @param {Punkt[]} p */
export function weg(p) {
  let l = 0;
  for (let i = 1; i < p.length; i++) l += Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y);
  return l;
}

/**
 * Punkte im gleichen Abstand entlang des Wegs (erster und letzter Punkt bleiben).
 * @param {Punkt[]} p @param {number} abstand @returns {Punkt[]}
 */
export function abtasten(p, abstand) {
  if (p.length < 2) return p.map((q) => ({ x: q.x, y: q.y }));
  const gesamt = weg(p);
  const n = Math.max(1, Math.round(gesamt / abstand));
  /** @type {Punkt[]} */
  const aus = [{ x: p[0].x, y: p[0].y }];
  let k = 1;
  let bis = Math.hypot(p[1].x - p[0].x, p[1].y - p[0].y);
  let vor = 0;
  for (let i = 1; i < n; i++) {
    const ziel = (gesamt * i) / n;
    while (bis < ziel && k < p.length - 1) {
      vor = bis;
      k++;
      bis += Math.hypot(p[k].x - p[k - 1].x, p[k].y - p[k - 1].y);
    }
    const t = bis > vor ? (ziel - vor) / (bis - vor) : 0;
    aus.push({ x: p[k - 1].x + t * (p[k].x - p[k - 1].x), y: p[k - 1].y + t * (p[k].y - p[k - 1].y) });
  }
  aus.push({ x: p[p.length - 1].x, y: p[p.length - 1].y });
  return aus;
}

/**
 * Glättet einen Weg (gleitender Mittelwert über 2 × r + 1 Punkte), damit das Zittern der Hand die Drehung nicht verfälscht.
 * @param {Punkt[]} p @param {number} r @returns {Punkt[]}
 */
export function glaette(p, r) {
  return p.map((_, i) => {
    let sx = 0;
    let sy = 0;
    let n = 0;
    for (let k = Math.max(0, i - r); k <= Math.min(p.length - 1, i + r); k++) {
      sx += p[k].x;
      sy += p[k].y;
      n++;
    }
    return { x: sx / n, y: sy / n };
  });
}

/**
 * Gesamtdrehung eines Wegs (Bogenmaß, y nach unten: positiv = im Uhrzeigersinn). Der Weg wird vorher geglättet.
 * @param {Punkt[]} p
 */
export function drehung(p) {
  const q = abtasten(glaette(abtasten(glaette(p, 3), 6), 3), 12);
  let summe = 0;
  let vorher = 0;
  for (let i = 1; i < q.length; i++) {
    const w = Math.atan2(q[i].y - q[i - 1].y, q[i].x - q[i - 1].x);
    if (i > 1) {
      let d = w - vorher;
      while (d > Math.PI) d -= 2 * Math.PI;
      while (d < -Math.PI) d += 2 * Math.PI;
      // Eine Spitze (fast kehrt um) hat keine Drehrichtung: ihr Vorzeichen wäre Zufall und zählt nicht.
      if (Math.abs(d) < SPITZE) summe += d;
    }
    vorher = w;
  }
  return summe;
}

/**
 * Die Stellen eines gleichmäßig abgetasteten Wegs, an denen die Hand kurz anhält und es heller sprüht: scharfe Ecken
 * (Spitzen, Knoten, Winkel). Liefert die Nummern der Punkte.
 * @param {Punkt[]} q
 * @returns {number[]}
 */
export function spitzenIndizes(q) {
  /** @type {number[]} */
  const aus = [];
  let letzte = -99;
  for (let i = 3; i < q.length - 3; i++) {
    const a = Math.atan2(q[i].y - q[i - 3].y, q[i].x - q[i - 3].x);
    const b = Math.atan2(q[i + 3].y - q[i].y, q[i + 3].x - q[i].x);
    let d = Math.abs(b - a);
    if (d > Math.PI) d = 2 * Math.PI - d;
    if (d > 1.15 && i - letzte > 6) {
      aus.push(i);
      letzte = i;
    }
  }
  return aus;
}

/**
 * Die Spitzen eines Wegs als Punkte (der Weg wird im Abstand 6 abgetastet).
 * @param {Punkt[]} p
 * @returns {Punkt[]}
 */
export function spitzen(p) {
  const q = abtasten(p, 6);
  return spitzenIndizes(q).map((i) => q[i]);
}

/** Wie viel Weg die Buchstaben je für sich haben (Anteil am Ganzen): Grundlage, um Stellen einem Buchstaben zuzuordnen. @param {FormTeil[]} formen */
function anteile(formen) {
  const l = formen.map((f) => Math.max(1, weg(f.striche.filter((_, i) => !f.luft[i]).flat())));
  const summe = l.reduce((s, x) => s + x, 0);
  let lauf = 0;
  return l.map((x) => {
    const von = lauf / summe;
    lauf += x;
    return { von, bis: lauf / summe };
  });
}

/**
 * Der Teil des Wegs `p` zwischen zwei Anteilen (0 … 1) der Weglänge.
 * @param {Punkt[]} p @param {number} von @param {number} bis @returns {Punkt[]}
 */
export function teilStueck(p, von, bis) {
  const q = abtasten(p, 3);
  const a = Math.max(0, Math.floor(von * (q.length - 1)));
  const b = Math.min(q.length - 1, Math.ceil(bis * (q.length - 1)));
  return q.slice(a, Math.max(a + 2, b + 1));
}

/**
 * Das Stück des Wegs der Vorlage, das zu Buchstabe k gehört (für „Ela schreibt nur diese Stelle“).
 * @param {Wort} ref @param {FormTeil[]} formen @param {number} k @returns {Punkt[]}
 */
export function buchstabenStueck(ref, formen, k) {
  const zug = ref.striche.filter((_, i) => !ref.luft[i]).flat();
  const a = anteile(formen)[Math.max(0, Math.min(formen.length - 1, k))];
  // ein Hauch Überlappung, damit auch die Verbindung zum Buchstaben mitläuft
  return teilStueck(zug, Math.max(0, a.von - 0.04), Math.min(1, a.bis + 0.02));
}

/**
 * Welcher Buchstabe liegt an dieser Stelle? Nach der Lage im Wort (waagerecht), nicht nach der Zeit.
 * @param {Punkt[]} kind alle Punkte der Hauptstriche @param {Punkt} stelle @param {number} buchstaben
 */
export function buchstabeAn(kind, stelle, buchstaben) {
  const xs = kind.map((p) => p.x);
  const lo = Math.min(...xs);
  const hi = Math.max(...xs);
  if (hi - lo < 1 || buchstaben < 2) return 0;
  const u = Math.max(0, Math.min(0.999, (stelle.x - lo) / (hi - lo)));
  return Math.floor(u * buchstaben);
}


/**
 * Wie weit liegt die Spur des Kindes von der Vorlage? Beide Wege werden an 48 gleich weit gelaufenen Stellen verglichen; die
 * Spur des Kindes wird waagerecht an den linken Rand und die Breite der Vorlage angelegt (Größe und Lage ändern nichts), senkrecht
 * zählen die festen Linien. Liefert Mittel und 90-%-Wert der Abstände in Einheiten.
 * @param {Punkt[]} kind @param {Punkt[]} soll @returns {{ mittel: number, p90: number }}
 */
export function formAbstand(kind, soll) {
  const N = 48;
  const xs = kind.map((p) => p.x);
  const ys = soll.map((p) => p.x);
  const klo = Math.min(...xs);
  const slo = Math.min(...ys);
  const f = (Math.max(...ys) - slo) / Math.max(1, Math.max(...xs) - klo);
  const aufN = (/** @type {Punkt[]} */ p) => abtasten(p, weg(p) / (N - 1)).slice(0, N);
  const k = aufN(glaette(abtasten(kind.map((p) => ({ x: (p.x - klo) * f + slo, y: p.y })), 4), 2));
  const s = aufN(glaette(abtasten(soll, 4), 2));
  const n = Math.min(k.length, s.length);
  const d = [];
  for (let i = 0; i < n; i++) d.push(Math.hypot(k[i].x - s[i].x, k[i].y - s[i].y));
  d.sort((a, b) => a - b);
  return { mittel: d.reduce((a, b) => a + b, 0) / Math.max(1, n), p90: d[Math.floor(n * 0.9)] ?? 0 };
}

/**
 * Prüft, was das Kind aufgezeichnet hat, gegen die Vorlage (SAS) des Wortes. Tolerant.
 * @param {Wort} ref das Wort aus kern/vorlagen.js `wort()`
 * @param {FormTeil[]} formen die Formen der Buchstaben in Reihenfolge (kern/vorlagen.js `form()`)
 * @param {Strich[]} aufzeichnung die Striche in der Reihenfolge des Schreibens, in Einheiten
 * @returns {Urteil}
 */
export function pruefe(ref, formen, aufzeichnung) {
  const striche = aufzeichnung.filter((s) => weg(s.punkte) >= WINZIG);
  if (!striche.length) return { ok: false, befund: "leer", stelle: null, buchstabe: 0 };
  const sollZug = ref.striche.filter((_, i) => !ref.luft[i]);
  const hat = sollZug.length;
  const buchstaben = formen.length;

  // Hauptstriche und Punkte: Nach dem ersten ist ein kurzer Strich ein Punkt (nur dort, wo die Vorlage Punkte hat).
  const punkteErlaubt = ref.luft.some(Boolean);
  /** @type {Strich[]} */
  const haupt = [];
  for (const [i, s] of striche.entries()) {
    if (i > 0 && punkteErlaubt && weg(s.punkte) <= PUNKT) continue;
    haupt.push(s);
  }
  const kind = haupt.flatMap((s) => s.punkte);

  // 1. Absetzen mitten im Wort: mehr lange Striche als die Vorlage hat.
  if (haupt.length > hat) {
    const vor = haupt[hat - 1].punkte;
    const nach = haupt[hat].punkte;
    const a = vor[vor.length - 1];
    const b = nach[0];
    const stelle = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    return { ok: false, befund: "luecke", stelle, buchstabe: buchstabeAn(kind, stelle, buchstaben) };
  }

  // 2. Ist es überhaupt das Wort? Länge und Breite im Verhältnis zur Vorlage, und die Punkte (i, ü …), die die Vorlage hat.
  // Ein Tupfer zählt hier als Punkt, nur nicht als Versuch (oben).
  const soll = sollZug.flat();
  const sollWeg = sollZug.reduce((l, s) => l + weg(s), 0);
  const kindWeg0 = haupt.reduce((l, s) => l + weg(glaette(abtasten(s.punkte, 8), 2)), 0);
  const breiteKind = Math.max(...kind.map((p) => p.x)) - Math.min(...kind.map((p) => p.x));
  const breiteSoll = Math.max(...soll.map((p) => p.x)) - Math.min(...soll.map((p) => p.x));
  const keinWort = { ok: /** @type {const} */ (false), befund: /** @type {const} */ ("wort"), stelle: null, buchstabe: 0 };
  if (kindWeg0 < VERHAELTNIS_MIN * sollWeg - ZUSCHLAG_WEG || kindWeg0 > VERHAELTNIS_MAX * sollWeg + ZUSCHLAG_WEG) return keinWort;
  if (breiteKind < VERHAELTNIS_MIN * breiteSoll - ZUSCHLAG_BREITE || breiteKind > VERHAELTNIS_MAX * breiteSoll + ZUSCHLAG_BREITE) return keinWort;
  const punkteKind = aufzeichnung.length - haupt.length;
  if (punkteErlaubt && punkteKind < 1) return keinWort;

  const start = kind[0];

  // 2. Startpunkt: waagerecht vom linken Rand der eigenen Schrift aus, senkrecht auf den festen Linien.
  const loKind = Math.min(...kind.map((p) => p.x));
  const loSoll = Math.min(...soll.map((p) => p.x));
  const dx = start.x - loKind - (soll[0].x - loSoll);
  const dy = start.y - soll[0].y;
  if (Math.abs(dx) > START_DX || Math.abs(dy) > START_DY) {
    return { ok: false, befund: "start", stelle: start, buchstabe: 0 };
  }

  // 3. Drehrichtung: je Buchstabe, der deutlich dreht (Oval, Girlande, Arkade, Schleife). Das Stück des Kindes liegt
  // an derselben Stelle des Weges (Anteil an der Weglänge); die Ränder des Stücks bleiben außen vor.
  const teile = anteile(formen);
  const kindWeg = abtasten(kind, 4);
  for (const [k, f] of formen.entries()) {
    const sollK = drehung(f.striche.filter((_, i) => !f.luft[i]).flat());
    if (Math.abs(sollK) < DREHT_VORLAGE) continue;
    const { von, bis } = teile[k];
    const rand = (bis - von) * 0.12;
    const stueck = teilStueck(kindWeg, von + rand, bis - rand);
    if (stueck.length < 4) continue;
    const dK = drehung(stueck);
    if (Math.sign(dK) === -Math.sign(sollK) && Math.abs(dK) >= DREHT_KIND) {
      // Ein Kritzel, der zufällig andersherum dreht, ist kein Wort mit falscher Richtung.
      if (formAbstand(kind, soll).mittel > FORM_MITTEL * 1.25) return keinWort;
      const mitte = stueck[Math.floor(stueck.length / 2)];
      return { ok: false, befund: "richtung", stelle: mitte, buchstabe: k };
    }
  }

  // 4. Band: nichts liegt weit über oder unter dem Band der Vorlage.
  const oben = Math.min(...soll.map((p) => p.y)) - BAND_RAND;
  const unten = Math.max(...soll.map((p) => p.y)) + BAND_RAND;
  let schlimm = null;
  let mass = 0;
  for (const p of kind) {
    const zu = Math.max(oben - p.y, p.y - unten);
    if (zu > mass) {
      mass = zu;
      schlimm = p;
    }
  }
  if (schlimm) return { ok: false, befund: "band", stelle: schlimm, buchstabe: buchstabeAn(kind, schlimm, buchstaben) };

  // 5. Form: die Spur folgt dem Verlauf der Vorlage (an gleich weit gelaufenen Stellen), sonst ist es ein anderes Wort oder ein Kritzel.
  const f = formAbstand(kind, soll);
  if (f.mittel > FORM_MITTEL || f.p90 > FORM_P90) return keinWort;

  return { ok: true };
}

/**
 * Die Hauptspur der Vorlage in Einheiten, verschoben (x, y) und um den Faktor s gestreckt; für die Spur des Prüfstands und der Hilfe.
 * @param {Punkt[]} p @param {number} dx @param {number} dy @param {number} [s] @returns {Punkt[]}
 */
export function verschiebe(p, dx, dy, s = 1) {
  return p.map((q) => ({ x: q.x * s + dx, y: q.y * s + dy }));
}

/** Die Feinheit der Hilfe (nach dem 2. Versuch) und der Befunde: Dauer in ms, mit der Ela einen Weg von `laenge` Einheiten schreibt (400 Einheiten je Sekunde, höchstens 4,2 s). @param {number} laenge @param {number} [tempo] 1 = Vorzeigen, 0.5 = sehr langsam */
export function schreibDauer(laenge, tempo = 1) {
  return Math.max(500, Math.min(4200, (laenge / 400) * 1000 / tempo));
}

/** Wörter, die Ela zum Einüben nennt (Daten der Sätze, Idee §6): Aufgabe → fester Satz in texte.json. @param {string} w */
export const satzSchluessel = (w) => w.normalize("NFC");
