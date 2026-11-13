// Druckt, was dem Lernplan noch fehlt: je Strang in Planreihenfolge eine Zeile je Lücke.
import { readFileSync } from "node:fs";
import { luecken } from "../spiele/lernsteuerung.js";

const lies = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
const ctx = { plan: lies("../spiele/lernplan.json"), spiele: lies("../spiele/spiele.json") };
const l = luecken(ctx);
const name = (id) => ctx.plan.themen.find((t) => t.id === id)?.name ?? id;

const zeilen = new Map(); // themaId -> Zeilen
const dazu = (id, text) => zeilen.set(id, [...(zeilen.get(id) ?? []), text]);
for (const id of l.ohneSpiel) dazu(id, `ohne Spiel: ${name(id)}`);
for (const { thema, fehlen } of l.teilweise) dazu(thema, `teilweise (${fehlen} Aufgaben nicht darstellbar): ${name(thema)}`);
for (const { thema, stufe } of l.ohneStufe) dazu(thema, `ohne Stufe ${stufe}: ${name(thema)}`);
for (const id of l.ohneEinfuehrung) dazu(id, `ohne Einführung: ${name(id)}`);

const straenge = [...new Set(ctx.plan.themen.map((t) => t.strang))];
for (const strang of straenge) {
  const themen = ctx.plan.themen.filter((t) => t.strang === strang && zeilen.has(t.id));
  console.log(`== ${strang} (${themen.length} Themen mit Lücken) ==`);
  for (const t of themen) for (const z of zeilen.get(t.id)) console.log(z);
}
