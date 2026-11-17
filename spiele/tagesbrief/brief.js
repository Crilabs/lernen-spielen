// Tagesbrief (docs/superpowers/specs/2026-11-17-tagesbrief-design.md, „Der Brief“): setzt aus dem Topf einer Adresse
// den Brief für die Eltern. Reines Modul ohne DOM und ohne Speicher; es importiert nichts aus spiele/rahmen/, weil der
// Versanddienst es allein auf den Server legt. Der Dienst versendet, der Elternbereich zeigt dieselbe Vorschau.

/** @typedef {{ id: string, name: string, zweck: string, fach: string }} Gekonnt */
/** @typedef {{ id: string, name: string, fach: string }} Dabei */
/** @typedef {{ id: string, titel: string, frage: string, antwort: string }} Gelesen */
/** @typedef {{ situation: "tisch"|"bewegung"|"unterwegs", wort: string, name: string, braucht: string, schritte: string[], kern: string, verinnerlichen: string }} BriefForm */
/** @typedef {{ id: string, thema: string, fach: string, titel: string, passendZuGerade: boolean, formen: BriefForm[], foto: string, weitere: string[] }} Naechstes foto: base64 JPEG oder "" */
/** @typedef {{ namen: string[], gekonnt: Gekonnt[], dabei: Dabei[], gelesen: Gelesen[], naechstes: Naechstes | null }} Topf */

/**
 * Fachfarben, Kopie von FACH in spiele/rahmen/stil.js (tief für Punkte und Akzente, toenung für die Anleitung).
 * Ein Test hält beide gleich.
 * @type {Record<string, { tief: string, toenung: string }>}
 */
export const FACH_FARBEN = {
  mathe: { tief: "#B8327A", toenung: "#FFE6F2" },
  grammatik: { tief: "#1B7656", toenung: "#DBF5EA" },
  schreiben: { tief: "#25689C", toenung: "#DFF0FC" },
  lesen: { tief: "#8A5D05", toenung: "#FFF3D1" },
  geometrie: { tief: "#5B3FB8", toenung: "#EEE8FF" },
  sprechen: { tief: "#A44C16", toenung: "#FFEADD" },
};

const PAPIER = "#FFFCF7";
const NEBEL = "#F4F0FA";
const TINTE = "#3B2A6B";
const TINTE_WEICH = "#6B5C96";
const LINIE = "#E4DEF0";
const SCHRIFT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

const MAX = { gekonnt: 5, dabei: 3, gelesen: 3, weitere: 2 };

/** @param {string} fach */
const farbe = (fach) => FACH_FARBEN[fach] ?? { tief: TINTE_WEICH, toenung: NEBEL };

/** @param {string} s */
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/** @param {string[]} namen */
function nameVon(namen) {
  if (namen.length === 0) return "Ihr Kind";
  if (namen.length === 1) return namen[0];
  return `${namen.slice(0, -1).join(", ")} und ${namen[namen.length - 1]}`;
}

/** @param {Date} datum – „Montag, 16. November“ */
const datumText = (datum) =>
  new Intl.DateTimeFormat("de-DE", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Berlin" }).format(datum);

/** @param {Topf} topf */
export function istBriefWert(topf) {
  return topf.gekonnt.length > 0 || topf.dabei.length > 0 || topf.gelesen.length > 0;
}

/**
 * Setzt aus dem Topf den Brief. `null`, wenn nichts darin steht, das einen Brief wert ist.
 * Das Foto der Anleitung wird als `cid:anleitung` referenziert; der Dienst hängt es an.
 * @param {Topf} topf
 * @param {{ datum: Date, abmeldeLink?: string, datenschutzLink?: string }} optionen
 * @returns {{ betreff: string, html: string, text: string } | null}
 */
export function setzeBrief(topf, { datum, abmeldeLink = "{{ABMELDEN}}", datenschutzLink = "{{DATENSCHUTZ}}" }) {
  if (!istBriefWert(topf)) return null;
  const name = nameVon(topf.namen);
  const tag = datumText(datum);
  const gekonnt = topf.gekonnt.slice(0, MAX.gekonnt);
  const [erstes, ...weiteresGekonnt] = gekonnt;
  const gekonntIds = new Set(topf.gekonnt.map((g) => g.id));
  const dabei = topf.dabei.filter((d) => !gekonntIds.has(d.id)).slice(0, MAX.dabei);
  const gelesen = topf.gelesen.slice(0, MAX.gelesen);
  const naechstes = topf.naechstes;
  const weitere = naechstes ? naechstes.weitere.slice(0, MAX.weitere) : [];
  const kopf = erstes ? `Neu gekonnt: ${erstes.name}` : "Lernstand von heute.";
  const betreff = erstes ? `${name}: neu gekonnt – ${erstes.name}` : `${name}: Lernstand vom ${tag}`;
  const anleitungKopf = naechstes ? `${naechstes.passendZuGerade ? "Passend zu gerade" : "Als Nächstes"} mit echten Dingen: ${naechstes.thema}` : "";
  const danach = weitere.join(", ");
  const fuss = "Gesendet von der Lern-App.";

  return {
    betreff,
    html: htmlBrief({ name, tag, kopf, erstes, weiteresGekonnt, dabei, gelesen, naechstes, anleitungKopf, danach, fuss, abmeldeLink, datenschutzLink }),
    text: textBrief({ name, tag, kopf, erstes, weiteresGekonnt, dabei, gelesen, naechstes, anleitungKopf, danach, fuss, abmeldeLink, datenschutzLink }),
  };
}

/**
 * @typedef {{ name: string, tag: string, kopf: string, erstes: Gekonnt | undefined, weiteresGekonnt: Gekonnt[], dabei: Dabei[],
 *   gelesen: Gelesen[], naechstes: Naechstes | null, anleitungKopf: string, danach: string, fuss: string,
 *   abmeldeLink: string, datenschutzLink: string }} Teile
 */

/** @param {Teile} t */
function htmlBrief(t) {
  const zeile = (/** @type {string} */ s) => `\n  ${s}`;
  const teile = [];
  teile.push(`<tr><td style="padding:28px 28px 4px;">
    <div style="font-size:14px;line-height:20px;color:${TINTE_WEICH};">${esc(t.name)} · ${esc(t.tag)}</div>
    <h1 style="margin:6px 0 0;font-size:28px;line-height:34px;font-weight:800;letter-spacing:-0.4px;">${esc(t.kopf)}</h1>${
      t.erstes ? `\n    <div style="margin-top:6px;font-size:15px;line-height:22px;color:${TINTE_WEICH};">${esc(t.erstes.zweck)}</div>` : ""}${
      t.weiteresGekonnt.map((g) => `\n    <div style="margin-top:12px;font-size:16px;line-height:24px;"><b>Außerdem neu: ${esc(g.name)}</b><br><span style="font-size:15px;line-height:22px;color:${TINTE_WEICH};">${esc(g.zweck)}</span></div>`).join("")}
  </td></tr>`);

  const zeilen = [];
  if (t.dabei.length) {
    zeilen.push(abschnitt("Im Moment dabei", t.dabei.map((d) => `<span style="color:${farbe(d.fach).tief};">●</span>&nbsp;${esc(d.name)}`).join("<br>\n          "), zeilen.length === 0));
  }
  if (t.gelesen.length) {
    zeilen.push(abschnitt("Gelesen", t.gelesen.map((g) =>
      g.frage
        ? `<b>${esc(g.titel)}</b><br>\n          <span style="color:${TINTE_WEICH};">Fragen Sie mal: ${esc(g.frage)}<br>– ${esc(g.antwort)}</span>`
        : `<b>${esc(g.titel)}</b>`).join("<br>\n          "), zeilen.length === 0));
  }
  if (zeilen.length) {
    teile.push(`<tr><td style="padding:20px 28px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${LINIE};">${zeilen.join("")}
    </table>
  </td></tr>`);
  }

  if (t.naechstes) teile.push(karte(t.naechstes, t.anleitungKopf));
  if (t.danach) teile.push(`<tr><td style="padding:14px 28px 0;font-size:15px;line-height:22px;">
    <span style="color:${TINTE_WEICH};">Danach im Lernplan:</span> ${esc(t.danach)}
  </td></tr>`);
  teile.push(`<tr><td style="padding:24px 28px 24px;font-size:12px;line-height:18px;color:${TINTE_WEICH};">
    ${esc(t.fuss)} <a href="${esc(t.abmeldeLink)}" style="color:${TINTE_WEICH};">Abbestellen</a> · <a href="${esc(t.datenschutzLink)}" style="color:${TINTE_WEICH};">Datenschutz</a>
  </td></tr>`);

  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
</head>
<body style="margin:0;padding:0;background:${NEBEL};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${NEBEL};">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:${PAPIER};border-radius:20px;font-family:${SCHRIFT};color:${TINTE};">
${teile.map((s) => zeile(s)).join("\n")}
</table>
</td></tr>
</table>
</body>
</html>
`;
}

/**
 * @param {string} titel
 * @param {string} inhalt
 * @param {boolean} erste
 */
function abschnitt(titel, inhalt, erste) {
  const rand = erste ? "" : `border-top:1px solid ${LINIE};`;
  return `
      <tr>
        <td valign="top" width="128" style="padding:14px 12px 14px 0;font-size:14px;line-height:22px;font-weight:700;color:${TINTE_WEICH};${rand}">${titel}</td>
        <td valign="top" style="padding:14px 0;font-size:16px;line-height:22px;${rand}">
          ${inhalt}
        </td>
      </tr>`;
}

/**
 * @param {Naechstes} n
 * @param {string} kopf
 */
function karte(n, kopf) {
  const { tief, toenung } = farbe(n.fach);
  const linie = `border-top:1px solid ${tief}33;`;
  const bild = n.foto
    ? `<tr><td style="padding:0;">
        <img src="cid:anleitung" width="528" alt="" style="display:block;width:100%;max-width:528px;height:auto;border-radius:16px 16px 0 0;">
      </td></tr>
      `
    : "";
  const formen = n.formen.map((f, i) => {
    const schritte = f.schritte.map((s, j) =>
      `<tr><td valign="top" style="padding:3px 10px 3px 0;font-weight:800;color:${tief};">${j + 1}</td><td style="padding:3px 0;">${esc(s)}</td></tr>`).join("\n          ");
    return `<tr><td style="padding:16px 20px 18px;${i > 0 ? linie : ""}">
        <div style="font-size:13px;line-height:18px;font-weight:700;color:${tief};">${esc(f.wort)}</div>
        <h3 style="margin:2px 0 0;font-size:18px;line-height:24px;font-weight:800;">${esc(f.name)}</h3>${
          f.verinnerlichen ? `\n        <p style="margin:8px 0 0;font-size:15px;line-height:22px;">${esc(f.verinnerlichen)}</p>` : ""}
        <p style="margin:8px 0 0;font-size:15px;line-height:22px;"><b>Ihr braucht:</b> ${esc(f.braucht)}</p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:6px;font-size:15px;line-height:22px;">
          ${schritte}
        </table>
        <p style="margin:10px 0 0;padding:10px 12px;background:${PAPIER};border-radius:10px;font-size:15px;line-height:22px;"><b>Darauf kommt es an:</b> ${esc(f.kern)}</p>
      </td></tr>`;
  }).join("\n      ");
  return `<tr><td style="padding:12px 16px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${toenung};border-radius:16px;">
      ${bild}<tr><td style="padding:18px 20px 2px;">
        <div style="font-size:14px;line-height:20px;font-weight:700;color:${tief};">${esc(kopf)}</div>
        <h2 style="margin:4px 0 0;font-size:22px;line-height:28px;font-weight:800;letter-spacing:-0.2px;">${esc(n.titel)}</h2>
      </td></tr>
      ${formen}
    </table>
  </td></tr>`;
}

/** @param {Teile} t */
function textBrief(t) {
  const z = [`${t.name} · ${t.tag}`, "", t.kopf];
  if (t.erstes) z.push(t.erstes.zweck);
  for (const g of t.weiteresGekonnt) z.push("", `Außerdem neu: ${g.name}`, g.zweck);
  if (t.dabei.length) z.push("", "Im Moment dabei", ...t.dabei.map((d) => `- ${d.name}`));
  if (t.gelesen.length) {
    z.push("", "Gelesen");
    for (const g of t.gelesen) z.push(g.titel, ...(g.frage ? [`Fragen Sie mal: ${g.frage}`, `– ${g.antwort}`] : []));
  }
  if (t.naechstes) {
    z.push("", t.anleitungKopf, t.naechstes.titel);
    for (const f of t.naechstes.formen) {
      z.push("", `${f.wort}: ${f.name}`);
      if (f.verinnerlichen) z.push(f.verinnerlichen);
      z.push(`Ihr braucht: ${f.braucht}`, ...f.schritte.map((s, j) => `${j + 1}. ${s}`), `Darauf kommt es an: ${f.kern}`);
    }
  }
  if (t.danach) z.push("", `Danach im Lernplan: ${t.danach}`);
  z.push("", `${t.fuss} Abbestellen: ${t.abmeldeLink} · Datenschutz: ${t.datenschutzLink}`);
  return z.join("\n") + "\n";
}
