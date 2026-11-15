export const meta = {
  name: 'spiel-bauen',
  description: 'Baut ein Lernspiel nach docs/spielbau.md: Idee, Bau, Prüfstand, Spielprüfung (höchstens 2 Runden)',
  whenToUse: 'Vom Skill „Spiel entwickeln“ nach werkzeuge/spielbau/vorbereiten.mjs; args = { lauf: <lauf.json als Objekt> }',
  phases: [
    { title: 'Idee', detail: 'ein frischer Agent, nur das Bauheft' },
    { title: 'Bau', detail: 'ein frischer Agent je Runde' },
    { title: 'Prüfstand', detail: 'Skript: Durchspielen, Texte, Filmstreifen, Takt' },
    { title: 'Spielprüfung', detail: 'ein frischer Prüfer: vier Fragen, Grenzen, Streichliste' },
  ],
}

// Die Steuerung des Spielbaus (docs/spielbau.md, Ablauf). Sie liest nur kurze JSON-Ergebnisse und entscheidet fest:
// Prüfstand rot → Reparatur durch einen neuen Bau-Agenten (höchstens einmal je Runde); Spielprüfung rot → nächste
// Runde mit den Befunden; nach zwei Runden rot → parken. Kosten, Audio und Merge macht danach abschliessen.mjs.

const L = args && args.lauf
if (!L || !L.id || !L.worktree || !L.bauheft) throw new Error('args.lauf fehlt (Ausgabe von werkzeuge/spielbau/vorbereiten.mjs)')
const M = Object.assign({ idee: 'opus', bau: 'sonnet', pruefung: 'opus', laeufer: 'sonnet' }, args.modelle || {})
const SKILL = L.worktree + '/.claude/skills/spiel-entwickeln'
const PW = 'NODE_PATH=/private/tmp/claude-501/pw/node_modules'
const marke = (phase) => '[spielbau:' + phase + ' ' + L.id + ' ' + L.branch + ']'
const MAX_RUNDEN = 2

/** Platzhalter für die Vorlagen; der Agent setzt sie beim Lesen selbst ein. */
const platz = (extra) => JSON.stringify(Object.assign({
  ID: L.id, NAME: L.name, WORKTREE: L.worktree, BRANCH: L.branch, BAUHEFT: L.bauheft, IDEE: L.idee,
  SPIELORDNER: L.spielordner, SEITE: L.seite, ORDNER: L.ordner, KLASSE: L.klasse, ABLAGE: L.ablage,
}, extra || {}), null, 1)

const auftrag = (phase, vorlage, extra) =>
  marke(phase) + '\n\nLies `' + SKILL + '/' + vorlage + '` und führe den Auftrag aus. Arbeite in `' + L.worktree +
  '` (cd dorthin). Setze für die Platzhalter {{…}} diese Werte ein:\n\n```json\n' + platz(extra) + '\n```'

const IDEE = {
  type: 'object',
  properties: {
    zusammenfassung: { type: 'string' },
    freigabe: { type: ['string', 'null'], description: 'Frage an Christian, wenn ein neues Lernzeichen oder ein Widerspruch zu einer Entscheidung von Christian vorliegt; sonst null' },
    commit: { type: 'string' },
  },
  required: ['zusammenfassung', 'freigabe', 'commit'],
}
const BAU = {
  type: 'object',
  properties: { commit: { type: 'string' }, zusammenfassung: { type: 'string' }, offen: { type: 'array', items: { type: 'string' } } },
  required: ['commit', 'zusammenfassung', 'offen'],
}
const STAND = {
  type: 'object',
  properties: {
    gruen: { type: 'boolean' }, rot: { type: 'array', items: { type: 'string' } },
    hinweise: { type: 'array', items: { type: 'string' } }, ordner: { type: 'string' }, lief: { type: 'boolean', description: 'false, wenn der Befehl selbst scheiterte (kein JSON)' },
  },
  required: ['gruen', 'rot', 'hinweise', 'ordner', 'lief'],
}
const JANEIN = { type: 'object', properties: { ja: { type: 'boolean' }, beleg: { type: 'string' } }, required: ['ja', 'beleg'] }
const PRUEFUNG = {
  type: 'object',
  properties: {
    zehnmal: JANEIN, kern: JANEIN, schwierigkeit: JANEIN, schoen: JANEIN,
    grenzen: { type: 'array', items: { type: 'object', properties: { nr: { type: 'string' }, ok: { type: 'boolean' }, beleg: { type: 'string' } }, required: ['nr', 'ok', 'beleg'] } },
    streichen: { type: 'array', items: { type: 'object', properties: { was: { type: 'string' }, warum: { type: 'string' }, verdecktKern: { type: 'boolean' } }, required: ['was', 'warum', 'verdecktKern'] } },
    befunde: { type: 'array', items: { type: 'string' } },
  },
  required: ['zehnmal', 'kern', 'schwierigkeit', 'schoen', 'grenzen', 'streichen', 'befunde'],
}

/** Urteil aus dem Bericht des Prüfers, fest ausgerechnet (docs/spielbau.md „Die Spielprüfung“). */
function urteil(p) {
  const nein = ['zehnmal', 'kern', 'schwierigkeit', 'schoen'].filter((k) => !p[k].ja)
  const grenzen = p.grenzen.filter((g) => !g.ok)
  const verdeckt = p.streichen.filter((s) => s.verdecktKern)
  return { gruen: !nein.length && !grenzen.length && !verdeckt.length, nein, grenzen, verdeckt }
}

function befundText(liste, titel) {
  if (!liste.length) return ''
  return '## Befunde umsetzen (' + titel + ')\n\nDer Stand liegt im Branch; setze diese Befunde um, bevorzugt durch Weglassen (§7):\n\n' +
    liste.map((b) => '- ' + b).join('\n')
}

async function pruefstand(runde, versuch) {
  const r = await agent(marke('pruefstand') + '\n\nFühre genau diesen einen Befehl aus (Bash, timeout 600000) und lies sonst nichts, ändere nichts:\n\n```bash\ncd ' +
    L.worktree + ' && ' + PW + ' node werkzeuge/spielbau/pruefstand.mjs --lauf ' + L.ablage + '/lauf.json --runde ' + runde + (versuch > 1 ? '.' + versuch : '') +
    '\n```\n\nDie letzte Zeile der Ausgabe ist JSON. Übernimm daraus gruen, rot, hinweise und ordner unverändert, lief = true. ' +
    'Gibt es kein JSON, dann gruen = false, rot = [die letzten Zeilen der Ausgabe], hinweise = [], ordner = "", lief = false.',
    { label: 'Prüfstand R' + runde + (versuch > 1 ? '.' + versuch : ''), phase: 'Prüfstand', schema: STAND, model: M.laeufer, effort: 'low' })
  return r || { gruen: false, rot: ['Prüfstand-Agent ohne Ergebnis'], hinweise: [], ordner: '', lief: false }
}

// --- Idee -----------------------------------------------------------------------------------------------------
phase('Idee')
const idee = await agent(auftrag('idee', 'idee.md'), { label: 'Idee ' + L.id, phase: 'Idee', schema: IDEE, model: M.idee })
if (!idee) return { status: 'abgebrochen', schritt: 'idee' }
log('Idee: ' + idee.zusammenfassung)

// --- Runden ---------------------------------------------------------------------------------------------------
let befunde = []
let letzte = { pruefstand: null, pruefung: null, urteil: null, bau: null }
for (let runde = 1; runde <= MAX_RUNDEN; runde++) {
  let stand = null
  for (let versuch = 1; versuch <= 2; versuch++) {
    const titel = versuch === 1 ? (runde === 1 ? '' : 'Spielprüfung Runde ' + (runde - 1)) : 'Prüfstand Runde ' + runde
    const bau = await agent(auftrag('bau', 'bauen.md', { BEFUNDE: befundText(befunde, titel) }),
      { label: 'Bau R' + runde + (versuch > 1 ? ' Reparatur' : ''), phase: 'Bau', schema: BAU, model: M.bau })
    if (!bau) return { status: 'abgebrochen', schritt: 'bau', runde, idee }
    letzte.bau = bau
    stand = await pruefstand(runde, versuch)
    letzte.pruefstand = stand
    log('Prüfstand R' + runde + '.' + versuch + ': ' + (stand.gruen ? 'grün' : 'rot (' + stand.rot.length + ')'))
    if (stand.gruen) break
    befunde = stand.rot.slice(0, 15)
  }
  if (!stand.gruen) {
    if (runde === MAX_RUNDEN) return { status: 'geparkt', grund: 'Prüfstand nach ' + runde + ' Runden rot', runde, idee, befunde, letzte }
    continue
  }

  phase('Spielprüfung')
  const ordner = stand.ordner || (L.ablage + '/r' + runde)
  const p = await agent(auftrag('pruefung', 'pruefen.md', {
    RUNDE: runde, PRUEFSTAND: ordner + '/pruefstand.json', FILM: ordner + '/film', BERICHT: L.ablage + '/spielpruefung-r' + runde + '.md',
  }), { label: 'Spielprüfung R' + runde, phase: 'Spielprüfung', schema: PRUEFUNG, model: M.pruefung })
  if (!p) return { status: 'abgebrochen', schritt: 'pruefung', runde, idee }
  const u = urteil(p)
  letzte.pruefung = p
  letzte.urteil = u
  log('Spielprüfung R' + runde + ': ' + (u.gruen ? 'grün' : 'rot – Nein: ' + u.nein.join(', ') + '; Grenzen: ' + u.grenzen.map((g) => g.nr).join(', ') + '; verdeckt: ' + u.verdeckt.length))
  if (u.gruen) {
    return { status: idee.freigabe ? 'freigabe' : 'gruen', freigabe: idee.freigabe, runde, idee, hinweise: p.befunde, streichen: p.streichen, letzte }
  }
  befunde = [
    ...u.nein.map((k) => 'Frage „' + k + '“ ist Nein: ' + p[k].beleg),
    ...u.grenzen.map((g) => g.nr + ': ' + g.beleg),
    ...u.verdeckt.map((s) => 'Streichen: ' + s.was + ' – ' + s.warum),
    ...p.befunde,
  ].slice(0, 15)
  if (runde === MAX_RUNDEN) return { status: 'geparkt', grund: 'Spielprüfung nach ' + runde + ' Runden rot', runde, idee, befunde, letzte }
}
return { status: 'geparkt', grund: 'ohne Ergebnis', idee, befunde, letzte }
