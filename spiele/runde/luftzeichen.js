// Luftzeichen: kleine Zeichen, die eine Bewegung für einen Schritt begleiten (Staubwölkchen, Sternchen, Striche …).
// Sie hängen nicht am Körper, sondern an einem Anker (zeichne.js ankerpunkt) und folgen nur Versatz und Größe.
// Stil wie die Figuren: Tinte als Umriss, Flächen aus der Farbwelt, Licht als Fläche. Kein Glitzern (B3, B7).

import { meldeLuftzeichen } from "./bestand.js";
import { INK, z, dunkler, heller } from "./kinder/stil.js";

const SONNE = "#FFD95A";
const PAPIER = "#FFFCF7";
const STAUB = "#EFE7DD";
const WASSER = "#8FD3EE";

/** Fünfzackiger Stern um (x, y). @param {number} x @param {number} y @param {number} r */
const stern = (x, y, r) => {
  const p = [];
  for (let i = 0; i < 10; i++) {
    const w = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.46 : r;
    p.push(`${z(x + Math.cos(w) * rr)} ${z(y + Math.sin(w) * rr)}`);
  }
  return `<path d="M${p.join(" L")} Z" fill="${SONNE}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>`
    + `<circle cx="${z(x - r * 0.18)}" cy="${z(y - r * 0.2)}" r="${z(r * 0.2)}" fill="${heller(SONNE, 0.55)}" stroke="none"/>`;
};

/** Wölkchen aus drei Buckeln, Boden flach. @param {number} x @param {number} y @param {number} s @param {string} farbe */
const woelkchen = (x, y, s, farbe) => {
  const d = `M${z(x - 14 * s)} ${z(y)} Q${z(x - 18 * s)} ${z(y - 10 * s)} ${z(x - 8 * s)} ${z(y - 11 * s)}`
    + ` Q${z(x - 4 * s)} ${z(y - 20 * s)} ${z(x + 5 * s)} ${z(y - 14 * s)} Q${z(x + 16 * s)} ${z(y - 14 * s)} ${z(x + 14 * s)} ${z(y)} Z`;
  return `<path d="${d}" fill="${farbe}" stroke="${INK}" stroke-width="2.6"/>`
    + `<path d="M${z(x - 12 * s)} ${z(y - 1)} Q${z(x)} ${z(y - 5 * s)} ${z(x + 12 * s)} ${z(y - 1)} Z" fill="${dunkler(farbe, 0.12)}" stroke="none"/>`;
};

/** Achtelnote. @param {number} x @param {number} y */
const note = (x, y) => `<ellipse cx="${z(x)}" cy="${z(y)}" rx="6" ry="4.6" transform="rotate(-20 ${z(x)} ${z(y)})" fill="${INK}" stroke="none"/>`
  + `<path d="M${z(x + 5)} ${z(y - 1)} L${z(x + 5)} ${z(y - 24)} Q${z(x + 14)} ${z(y - 20)} ${z(x + 13)} ${z(y - 11)}" fill="none" stroke="${INK}" stroke-width="2.8"/>`;

meldeLuftzeichen({
  id: "staub", wort: "Staubwölkchen",
  svg: woelkchen(-44, 2, 1, STAUB) + woelkchen(42, 2, 0.8, STAUB) + woelkchen(-70, 0, 0.55, STAUB),
});

meldeLuftzeichen({ id: "sterne", wort: "Sternchen", svg: stern(-34, 6, 9) + stern(0, -8, 12) + stern(34, 6, 9) });

meldeLuftzeichen({
  id: "striche", wort: "Bewegungsstriche",
  svg: [[-18, 0, 30], [-6, 22, 34], [-14, 44, 24]]
    .map(([y, x, l]) => `<path d="M${z(x - l)} ${z(y)} L${z(x)} ${z(y)}" fill="none" stroke="#6B5C96" stroke-width="4" stroke-linecap="round"/>`).join(""),
});

meldeLuftzeichen({ id: "noten", wort: "Noten", svg: note(-8, 0) + note(18, -16) });

meldeLuftzeichen({
  id: "pusten", wort: "Pustewölkchen",
  svg: [[0, 0, 8], [16, -6, 6], [29, -1, 4.2]]
    .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${PAPIER}" stroke="${WASSER}" stroke-width="2.6"/>`).join(""),
});

meldeLuftzeichen({
  id: "abklatsch", wort: "Abklatschen",
  svg: [0, 60, 120, 180, 240, 300].map((w) => {
    const r = (w * Math.PI) / 180;
    return `<path d="M${z(Math.cos(r) * 16)} ${z(Math.sin(r) * 16)} L${z(Math.cos(r) * 27)} ${z(Math.sin(r) * 27)}" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>`;
  }).join("") + stern(0, 0, 10),
});
