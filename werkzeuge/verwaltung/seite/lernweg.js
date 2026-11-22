// Lernweg je Fach (docs/superpowers/specs/2026-11-22-lernweg-design.md): Aufbau des Bildes ohne DOM, in Node testbar.
// Spalten von links nach rechts nach Kettentiefe, je Klasse ein Band; Voraussetzungen außerhalb der Auswahl als Stummel.

export const MASS = { breite: 176, hoehe: 46, abstandX: 70, abstandY: 12, stummelHoehe: 30, oben: 34 };

const SPIEL_DA = ["fertig", "probe"];

/**
 * Abdeckung eines Lernthemas: „spiel“ (gebautes Spiel), „echte“ (nur Mit echten Dingen) oder „fehlt“;
 * inArbeit, wenn für die noch fehlende Abdeckung etwas beauftragt oder im Entwurf ist.
 * @param {{ spiele?: string[], echteDinge?: string }} t @param {Record<string, { status: string }>} spiele
 */
export function abdeckung(t, spiele) {
  const status = (t.spiele ?? []).map((id) => spiele[id]?.status);
  const art = status.some((s) => SPIEL_DA.includes(s)) ? "spiel" : t.echteDinge === "fertig" ? "echte" : "fehlt";
  const inArbeit = art !== "spiel" && (status.includes("beauftragt") || t.echteDinge === "beauftragt" || t.echteDinge === "entwurf");
  return { art, inArbeit };
}

/**
 * @typedef {{ id: string, name: string, strang: string, klasse: number, bereich: string, voraussetzungen?: string[] }} Thema
 * @typedef {{ id: string, name: string, strang: string, klasse: number, bereich: string, stummel: "" | "fach" | "klasse",
 *   ebene: number, x: number, y: number, b: number, h: number }} Knoten
 * @typedef {{ von: string, nach: string, d: string }} Kante
 */

/**
 * Baut das Bild eines Fachs. Überzählige Pfeile (die über einen gezeigten Umweg ohnehin gelten) fallen weg.
 * @param {Thema[]} themen alle Lernthemen des Plans, in Planreihenfolge
 * @param {string} fach @param {string|number} [klasse] leer = alle Klassen
 */
export function baueLernweg(themen, fach, klasse = "") {
  const nachId = new Map(themen.map((t) => [t.id, t]));
  const rang = new Map(themen.map((t, i) => [t.id, i]));
  const vor = (/** @type {Thema} */ t) => (t.voraussetzungen ?? []).filter((v) => nachId.has(v) && v !== t.id);
  const gezeigt = themen.filter((t) => t.strang === fach && (!klasse || String(t.klasse) === String(klasse)));
  const drin = new Set(gezeigt.map((t) => t.id));

  // Vorfahren im ganzen Plan (für Stummel) und innerhalb der Auswahl (für überzählige Pfeile)
  /** @type {Map<string, Set<string>>} */ const alleVorfahren = new Map();
  /** @type {Map<string, Set<string>>} */ const innenVorfahren = new Map();
  const vorfahren = (/** @type {string} */ id, /** @type {Map<string, Set<string>>} */ merk, /** @type {boolean} */ nurInnen, /** @type {Set<string>} */ unterwegs = new Set()) => {
    const da = merk.get(id);
    if (da) return da;
    const s = new Set();
    if (unterwegs.has(id)) return s; // Kreis im Plan: nicht weiter folgen
    unterwegs.add(id);
    for (const v of vor(/** @type {Thema} */ (nachId.get(id)))) {
      if (nurInnen && !drin.has(v)) continue;
      s.add(v);
      for (const w of vorfahren(v, merk, nurInnen, unterwegs)) s.add(w);
    }
    unterwegs.delete(id);
    merk.set(id, s);
    return s;
  };

  /** @type {Map<string, string[]>} */ const innen = new Map(); // gezeichnete Pfeile innerhalb der Auswahl
  /** @type {Map<string, string[]>} */ const aussen = new Map(); // Ziel-Ids je Stummel
  for (const t of gezeigt) {
    const alle = vor(t);
    const i = alle.filter((v) => drin.has(v));
    innen.set(t.id, i.filter((v) => !i.some((w) => w !== v && vorfahren(w, innenVorfahren, true).has(v))));
    for (const v of alle.filter((v) => !drin.has(v))) {
      if (alle.some((w) => w !== v && vorfahren(w, alleVorfahren, false).has(v))) continue;
      aussen.set(v, [...(aussen.get(v) ?? []), t.id]);
    }
  }

  // Spalten: längste Kette, die Klassen liegen als Bänder hintereinander
  /** @type {Map<string, number>} */ const ebene = new Map();
  const klassen = [...new Set(gezeigt.map((t) => t.klasse))].sort((a, b) => a - b);
  /** @type {{ klasse: number, von: number, bis: number }[]} */ const baender = [];
  let start = 0;
  const unterwegs = new Set();
  const tiefe = (/** @type {string} */ id) => {
    const da = ebene.get(id);
    if (da !== undefined) return da;
    if (unterwegs.has(id)) return start;
    unterwegs.add(id);
    let l = start;
    for (const v of /** @type {string[]} */ (innen.get(id))) l = Math.max(l, tiefe(v) + 1);
    unterwegs.delete(id);
    ebene.set(id, l);
    return l;
  };
  for (const k of klassen) {
    const ids = gezeigt.filter((t) => t.klasse === k).map((t) => t.id);
    for (const id of ids) tiefe(id);
    const bis = Math.max(...ids.map((id) => /** @type {number} */ (ebene.get(id))));
    baender.push({ klasse: k, von: start, bis });
    start = bis + 1;
  }
  // Stummel stehen eine Spalte vor ihrem frühesten Ziel
  for (const [id, ziele] of aussen) ebene.set(id, Math.min(...ziele.map((z) => /** @type {number} */ (ebene.get(z)))) - 1);
  if ([...ebene.values()].some((e) => e < 0)) {
    for (const [id, e] of ebene) ebene.set(id, e + 1);
    for (const b of baender) { b.von += 1; b.bis += 1; }
  }

  // Pfeile (von → nach) und Nachbarn
  /** @type {[string, string][]} */ const paare = [];
  for (const [nach, vs] of innen) for (const v of vs) paare.push([v, nach]);
  for (const [v, ziele] of aussen) for (const z of ziele) paare.push([v, z]);
  /** @type {Map<string, string[]>} */ const vorher = new Map();
  /** @type {Map<string, string[]>} */ const nachher = new Map();
  for (const [v, n] of paare) {
    vorher.set(n, [...(vorher.get(n) ?? []), v]);
    nachher.set(v, [...(nachher.get(v) ?? []), n]);
  }

  // Reihenfolge je Spalte: Start nach Bereich (erste Stelle im Plan) und Planreihenfolge, dann Mittelwert der Nachbarn
  /** @type {Map<string, number>} */ const bereichRang = new Map();
  for (const t of themen) if (t.strang === fach && !bereichRang.has(t.bereich)) bereichRang.set(t.bereich, bereichRang.size);
  const ids = [...ebene.keys()];
  const sortRang = (/** @type {string} */ id) => aussen.has(id)
    ? [-1, Math.min(...(/** @type {string[]} */ (aussen.get(id))).map((z) => /** @type {number} */ (rang.get(z))))]
    : [bereichRang.get(/** @type {Thema} */ (nachId.get(id)).bereich) ?? 0, /** @type {number} */ (rang.get(id))];
  /** @type {string[][]} */ const spalten = [];
  for (const id of ids) (spalten[/** @type {number} */ (ebene.get(id))] ??= []).push(id);
  for (const s of spalten) s?.sort((a, b) => { const [x1, x2] = sortRang(a), [y1, y2] = sortRang(b); return x1 - y1 || x2 - y2; });
  /** @type {Map<string, number>} */ const lage = new Map();
  const setzeLage = (/** @type {string[]} */ s) => s.forEach((id, i) => lage.set(id, i - (s.length - 1) / 2));
  spalten.forEach((s) => s && setzeLage(s));
  for (let runde = 0; runde < 12; runde++) {
    const vorwaerts = runde % 2 === 0;
    const reihe = vorwaerts ? spalten : [...spalten].reverse();
    for (const s of reihe) {
      if (!s) continue;
      const schluessel = new Map(s.map((id) => {
        const n = (vorwaerts ? vorher : nachher).get(id) ?? [];
        return [id, n.length ? n.reduce((a, v) => a + /** @type {number} */ (lage.get(v)), 0) / n.length : /** @type {number} */ (lage.get(id))];
      }));
      s.sort((a, b) => /** @type {number} */ (schluessel.get(a)) - /** @type {number} */ (schluessel.get(b)));
      setzeLage(s);
    }
  }

  // Koordinaten
  const { breite: B, hoehe: H, abstandX: AX, abstandY: AY, stummelHoehe: SH, oben } = MASS;
  const minLage = Math.min(0, ...lage.values());
  /** @type {Knoten[]} */ const knoten = ids.map((id) => {
    const t = /** @type {Thema} */ (nachId.get(id));
    const stummel = !aussen.has(id) ? "" : t.strang === fach ? "klasse" : "fach";
    const h = stummel ? SH : H;
    return {
      id, name: t.name, strang: t.strang, klasse: t.klasse, bereich: t.bereich, stummel, ebene: /** @type {number} */ (ebene.get(id)),
      x: /** @type {number} */ (ebene.get(id)) * (B + AX), y: oben + (/** @type {number} */ (lage.get(id)) - minLage) * (H + AY) + (H - h) / 2, b: B, h,
    };
  });
  const k = new Map(knoten.map((n) => [n.id, n]));
  /** @type {Kante[]} */ const kanten = paare.map(([von, nach]) => {
    const a = /** @type {Knoten} */ (k.get(von)), z = /** @type {Knoten} */ (k.get(nach));
    const x1 = a.x + a.b, y1 = a.y + a.h / 2, x2 = z.x, y2 = z.y + z.h / 2;
    const dx = Math.max(24, (x2 - x1) / 2);
    return { von, nach, d: `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}` };
  });
  const spaltenZahl = Math.max(0, ...knoten.map((n) => n.ebene + 1));
  return {
    knoten, kanten,
    baender: baender.map((b) => ({ klasse: b.klasse, x: b.von * (B + AX) - AX / 2, breite: (b.bis - b.von + 1) * (B + AX) })),
    breite: spaltenZahl * (B + AX) - AX,
    hoehe: Math.max(oben, ...knoten.map((n) => n.y + n.h)) + AY,
  };
}

/**
 * Die Kette eines Themas im Bild: alle Vorgänger und Nachfolger (über die gezeichneten Pfeile) und es selbst.
 * @param {{ kanten: { von: string, nach: string }[] }} lw @param {string} id
 */
export function kette(lw, id) {
  /** @type {Map<string, string[]>} */ const vorher = new Map();
  /** @type {Map<string, string[]>} */ const nachher = new Map();
  for (const { von, nach } of lw.kanten) {
    vorher.set(nach, [...(vorher.get(nach) ?? []), von]);
    nachher.set(von, [...(nachher.get(von) ?? []), nach]);
  }
  const sammle = (/** @type {Map<string, string[]>} */ m) => {
    const s = new Set([id]);
    const offen = [id];
    while (offen.length) for (const n of m.get(/** @type {string} */ (offen.pop())) ?? []) if (!s.has(n)) { s.add(n); offen.push(n); }
    return s;
  };
  const davor = sammle(vorher), danach = sammle(nachher);
  return {
    knoten: new Set([...davor, ...danach]),
    kanten: new Set(lw.kanten.filter((e) => (davor.has(e.von) && davor.has(e.nach)) || (danach.has(e.von) && danach.has(e.nach))).map((e) => `${e.von}>${e.nach}`)),
  };
}
