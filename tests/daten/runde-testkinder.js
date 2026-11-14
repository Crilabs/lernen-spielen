// Zwei Strichfiguren für die Kern-Tests der Runde: eine gehend, eine im Rollstuhl.
// Jedes Gelenk ist eine Linie oder ein Kreis, damit die Tests am SVG-Text ablesen können, was wo liegt.

const linie = (name, x1, y1, x2, y2) =>
  `<path data-test="${name}" d="M${x1} ${y1}L${x2} ${y2}" stroke="#3B2A6B" stroke-width="4"/>`;

function ansicht(bewegt) {
  const drehpunkte = {
    koerper: [160, 254],
    rumpf: [160, 200],
    kopf: [160, 120],
    "arm-hinten-oben": [150, 130],
    "arm-hinten-unten": [150, 165],
    "arm-vorn-oben": [170, 130],
    "arm-vorn-unten": [170, 165],
  };
  const teile = {
    koerper: [{ teil: "schatten", svg: linie("schatten", 130, 254, 190, 254) }],
    rumpf: [{ teil: "rumpf", svg: linie("rumpf", 160, 130, 160, 200), kontur: `<path data-test="rumpf-kontur"/>` }],
    kopf: [
      { teil: "kopf", svg: `<circle data-test="kopf" cx="160" cy="90" r="34"/>` },
      { teil: "gesicht" },
      { teil: "haare-oben", svg: linie("haare-oben", 130, 60, 190, 60) },
    ],
    "arm-hinten-oben": [{ teil: "oberarm", svg: linie("arm-hinten-oben", 150, 130, 150, 165) }],
    "arm-hinten-unten": [{ teil: "unterarm", svg: linie("arm-hinten-unten", 150, 165, 150, 195) }],
    "arm-vorn-oben": [{ teil: "oberarm", svg: linie("arm-vorn-oben", 170, 130, 170, 165) }],
    "arm-vorn-unten": [
      { teil: "unterarm", svg: linie("arm-vorn-unten", 170, 165, 170, 195) },
      { teil: "hand", formen: {
        offen: { svg: `<path data-test="hand-offen"/>`, kontur: `<path data-test="hand-offen-kontur"/>` },
        zeigen: `<path data-test="hand-zeigen"/>`,
      } },
    ],
  };
  const plaetze = {
    kopf: { gelenk: "kopf", punkt: [160, 56] },
    "hand-vorn": { gelenk: "arm-vorn-unten", punkt: [170, 195] },
    "hand-hinten": { gelenk: "arm-hinten-unten", punkt: [150, 195] },
    ruecken: { gelenk: "rumpf", punkt: [150, 140] },
    fuesse: { gelenk: "koerper", punkt: [160, 254] },
    schoss: { gelenk: "rumpf", punkt: [165, 200] },
  };
  if (bewegt === "geht") {
    Object.assign(drehpunkte, { "bein-hinten": [155, 200], "bein-vorn": [165, 200], "bein-hinten-unten": [155, 227], "bein-vorn-unten": [165, 227] });
    Object.assign(teile, {
      "bein-hinten": [{ teil: "bein", svg: linie("bein-hinten", 155, 200, 155, 227) }],
      "bein-vorn": [{ teil: "bein", svg: linie("bein-vorn", 165, 200, 165, 227) }],
      "bein-hinten-unten": [{ teil: "unterschenkel", svg: linie("bein-hinten-unten", 155, 227, 155, 254) }],
      "bein-vorn-unten": [{ teil: "unterschenkel", svg: linie("bein-vorn-unten", 165, 227, 165, 254) }],
    });
  } else {
    Object.assign(drehpunkte, {
      rollstuhl: [160, 220],
      "rad-hinten": [140, 226],
      "rad-vorn": [190, 240],
      beine: [165, 200],
    });
    Object.assign(teile, {
      rollstuhl: [{ teil: "sitz", svg: linie("rollstuhl", 130, 205, 190, 205) }],
      "rad-hinten": [{ teil: "rad", svg: `<circle data-test="rad-hinten" cx="140" cy="226" r="28"/>` }],
      "rad-vorn": [{ teil: "rad", svg: `<circle data-test="rad-vorn" cx="190" cy="240" r="14"/>` }],
      beine: [{ teil: "beine", svg: linie("beine", 165, 200, 195, 240) }],
    });
    plaetze.fuesse = { gelenk: "beine", punkt: [195, 240] };
  }
  return { drehpunkte, teile, gesicht: [160, 92], plaetze };
}

export const TESTKIND_GEHT = {
  id: "test-geht",
  name: "Testa",
  pronomen: "sie",
  bewegt: "geht",
  ansichten: { dreiviertel: ansicht("geht"), profil: ansicht("geht") },
};

export const TESTKIND_STUHL = {
  id: "test-stuhl",
  name: "Testo",
  pronomen: "er",
  bewegt: "rollstuhl",
  ansichten: { dreiviertel: ansicht("rollstuhl"), profil: ansicht("rollstuhl") },
};

/** Tiefe Kopie, damit Tests ein Testkind verändern können. */
export const kopie = (kind) => structuredClone(kind);
