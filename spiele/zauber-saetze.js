// Satz-Baukasten für den Großbuchstaben-Zauberer.
// Jeder Satz besteht aus Wörtern {t: Text in richtiger Schreibung, nomen: bool, key: Lernstand-Schlüssel}
// und einer Szene {typ, s: [Figuren], d: Ding, g: zweite Figur, adj}. Das erste Wort ist fest (Satzanfang).
(function(root){
  // Nomen: Artikel im Nominativ, optional abweichende Formen (n-Deklination)
  const FIG = {
    einhorn:{w:"Einhorn",a:"das"}, hund:{w:"Hund",a:"der"}, katze:{w:"Katze",a:"die"}, maus:{w:"Maus",a:"die"},
    ente:{w:"Ente",a:"die",fliegt:1}, schwein:{w:"Schwein",a:"das"}, frosch:{w:"Frosch",a:"der",klein:1},
    hase:{w:"Hase",a:"der",akk:"Hasen",dat:"Hasen"}, igel:{w:"Igel",a:"der",klein:1}, eule:{w:"Eule",a:"die",fliegt:1},
    pferd:{w:"Pferd",a:"das"}, drache:{w:"Drache",a:"der",akk:"Drachen",dat:"Drachen",fliegt:1}
  };
  const DING = {
    zaun:{w:"Zaun",a:"der"}, apfel:{w:"Apfel",a:"der"}, bett:{w:"Bett",a:"das"}, ball:{w:"Ball",a:"der"},
    baum:{w:"Baum",a:"der"}, haus:{w:"Haus",a:"das"}, mond:{w:"Mond",a:"der"}, kuchen:{w:"Kuchen",a:"der"},
    blume:{w:"Blume",a:"die"}, bruecke:{w:"Brücke",a:"die"}
  };
  const NOMEN = Object.assign({}, FIG, DING);
  const ART = { nom:{der:"der",die:"die",das:"das"}, akk:{der:"den",die:"die",das:"das"}, dat:{der:"dem",die:"der",das:"dem"} };
  const KURZ = { "zu dem":"zum", "zu der":"zur", "in dem":"im", "an dem":"am" };
  // Adjektive nach bestimmtem Artikel im Nominativ (immer -e); wofür sie passen
  const ADJ = {
    kleine:{fx:"klein"}, große:{fx:"gross"}, rote:{fx:"rot"}, blaue:{fx:"blau"},
    müde:{fx:"muede", nur:["schlaf","zu"]}, schnelle:{fx:"schnell", nur:["zu","jagt","ueber","rollt","fliegt"]}
  };

  const wort = t => ({t, nomen:false, key:"~"+t.toLowerCase()});
  const nomen = (id, form) => ({t: form, nomen:true, key: NOMEN[id].a+" "+NOMEN[id].w, id});
  // Nominalgruppe: optional mit Präposition (wird ggf. zusammengezogen) und Adjektiv
  function ng(id, kasus, prep, adj){
    const n=NOMEN[id], art=ART[kasus][n.a], form=n[kasus]||n.w, out=[];
    const k = prep ? KURZ[prep+" "+art] : null;
    if(k) out.push(wort(k)); else { if(prep) out.push(wort(prep)); out.push(wort(art)); }
    if(adj) out.push(wort(adj));
    out.push(nomen(id, form));
    return out;
  }
  const W = s => s.split(" ").map(wort);
  const pick = a => a[Math.floor(Math.random()*a.length)];
  const figs = f => Object.keys(FIG).filter(f||(()=>true));

  // Vorlagen: liefern {teile: [...Wörter], szene}
  const ORT_SCHLAF = {bett:["in","dat"], baum:["unter","dat"], haus:["neben","dat"], mond:["unter","dat"], bruecke:["auf","dat"]};
  const ORT_TANZ   = {bruecke:["auf","dat"], mond:["unter","dat"], haus:["vor","dat"], blume:["neben","dat"], baum:["unter","dat"]};
  const VORLAGEN = [
    { typ:"ueber", gewicht:3, bau(s,adj){ const d=pick(["zaun","ball","blume","kuchen","apfel"]);
        return {teile:[...ng(s,"nom",null,adj), ...W("springt über"), ...ng(d,"akk")], szene:{typ:"ueber",s:[s],d}}; } },
    { typ:"zu", gewicht:3, bau(s,adj){ const d=pick(["haus","baum","bruecke","bett","blume","zaun"]);
        return {teile:[...ng(s,"nom",null,adj), wort("läuft"), ...ng(d,"dat","zu")], szene:{typ:"zu",s:[s],d}}; } },
    { typ:"schlaf", gewicht:3, bau(s,adj){ const d=pick(Object.keys(ORT_SCHLAF)), [p,k]=ORT_SCHLAF[d];
        return {teile:[...ng(s,"nom",null,adj), wort("schläft"), ...ng(d,k,p)], szene:{typ:"schlaf",s:[s],d}}; } },
    { typ:"frisst", gewicht:3, bau(s,adj){ const d=pick(["hase","schwein","pferd","einhorn"].includes(s)?["apfel","kuchen","blume"]:["apfel","kuchen"]);
        return {teile:[...ng(s,"nom",null,adj), wort("frisst"), ...ng(d,"akk")], szene:{typ:"frisst",s:[s],d}}; } },
    { typ:"tanz", gewicht:2, bau(s,adj){ const d=pick(Object.keys(ORT_TANZ)), [p,k]=ORT_TANZ[d];
        return {teile:[...ng(s,"nom",null,adj), wort("tanzt"), ...ng(d,k,p)], szene:{typ:"tanz",s:[s],d}}; } },
    { typ:"rollt", gewicht:3, bau(s,adj){
        if(Math.random()<.6){ const g=pick(figs(f=>f!==s));
          return {teile:[...ng(s,"nom",null,adj), wort("rollt"), ...ng("ball","akk"), ...ng(g,"dat","zu")], szene:{typ:"rollt",s:[s],d:"ball",g}}; }
        return {teile:[...ng(s,"nom",null,adj), wort("rollt"), ...ng("ball","akk")], szene:{typ:"rollt",s:[s],d:"ball"}}; } },
    { typ:"versteckt", gewicht:2, bau(s,adj){ const d=pick(FIG[s].klein||["maus","ente","eule"].includes(s)?["haus","zaun","bett"]:["haus","bett"]);
        return {teile:[...ng(s,"nom",null,adj), ...W("versteckt sich"), ...ng(d,"dat","hinter")], szene:{typ:"versteckt",s:[s],d}}; } },
    { typ:"fliegt", gewicht:2, nurFlieger:true, bau(s,adj){
        if(Math.random()<.25) return {teile:[...ng(s,"nom",null,adj), wort("fliegt"), ...ng("mond","dat","zu")], szene:{typ:"fliegt",s:[s],d:"mond"}};
        const d=pick(["haus","baum","zaun","bruecke"]);
        return {teile:[...ng(s,"nom",null,adj), ...W("fliegt über"), ...ng(d,"akk")], szene:{typ:"fliegt",s:[s],d}}; } },
    { typ:"jagt", gewicht:2, bau(s,adj){ const g=pick(figs(f=>f!==s));
        return {teile:[...ng(s,"nom",null,adj), wort("jagt"), ...ng(g,"akk")], szene:{typ:"jagt",s:[s],g}}; } },
    { typ:"paar", gewicht:3, zwei:true, bau(s){ const s2=pick(figs(f=>f!==s)); const r=Math.random();
        const kopf=[...ng(s,"nom"), wort("und"), ...ng(s2,"nom")];
        if(r<.4){ const d=pick(Object.keys(ORT_TANZ)), [p,k]=ORT_TANZ[d]; return {teile:[...kopf, wort("tanzen"), ...ng(d,k,p)], szene:{typ:"tanz",s:[s,s2],d}}; }
        if(r<.7) return {teile:[...kopf, wort("schlafen"), ...ng("baum","dat","unter")], szene:{typ:"schlaf",s:[s,s2],d:"baum"}};
        const d=pick(["haus","baum","bruecke"]); return {teile:[...kopf, wort("laufen"), ...ng(d,"dat","zu")], szene:{typ:"zu",s:[s,s2],d}}; } }
  ];

  // Einen zufälligen Satz bauen. Optional: muss Schlüssel `mit` enthalten.
  // adjModus: "nie" = kein Adjektiv, "immer" = jeder Satz mit Adjektiv (nur Vorlagen, die eins tragen), "misch" = gelegentlich (35 %)
  function zufall(adjModus="misch"){
    const pool=[]; for(const v of VORLAGEN) if(!(adjModus==="immer" && v.zwei)) for(let i=0;i<v.gewicht;i++) pool.push(v);
    const v=pick(pool);
    const s=pick(v.nurFlieger ? figs(f=>FIG[f].fliegt) : figs());
    let adj=null;
    if(!v.zwei && (adjModus==="immer" || (adjModus==="misch" && Math.random()<.35))){ const ok=Object.keys(ADJ).filter(a=>!ADJ[a].nur||ADJ[a].nur.includes(v.typ)); adj=pick(ok); }
    const {teile, szene} = v.bau(s, adj);
    if(adj) szene.adj = ADJ[adj].fx;
    // Satzanfang: erstes Wort groß und fest
    const erstes = teile[0];
    erstes.t = erstes.t[0].toUpperCase()+erstes.t.slice(1); erstes.fest = true;
    const text = teile.map(w=>w.t).join(" ")+".";
    return {text, woerter:teile, szene};
  }
  // Prüft: alle Nomen außer am Satzanfang groß, alles andere klein (Selbsttest)
  function pruefe(satz){
    return satz.woerter.every(w=> w.fest || (w.nomen ? /^[A-ZÄÖÜ]/.test(w.t) : /^[a-zäöüß]/.test(w.t)));
  }
  root.ZauberSaetze = { zufall, pruefe, FIG, DING, NOMEN, ein: id => NOMEN[id].a==="die" ? "eine" : "ein" };
})(typeof window!=="undefined" ? window : globalThis);
