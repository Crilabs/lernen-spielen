// Figuren-Baukasten für den Großbuchstaben-Zauberer.
// Jede Figur liegt in figuren/<id>.js und meldet sich mit Figuren.add({...}) an, jedes Ding mit Figuren.ding({...}).
//
// VERTRAG FIGUR (viewBox 0 0 320 280, Blick nach rechts, Füße/Hufe enden bei y = 254, Mitte etwa x = 160):
//   id, wort, artikel ("der"|"die"|"das"), groesse (1 = Einhorn), fliegt (true nur mit Flügeln),
//   fell (Grundfarbe der Hauptflächen), mund [x,y] (Maul/Schnabel), kopf [x,y] (Oberkante Kopf, für „z z Z“),
//   svg: Inhalt mit diesen Gruppen (fehlende Teile werden einfach nicht bewegt):
//     <g class="tail">   Schweif (optional), Drehpunkt per style="transform-origin:…" (fill-box-%), Standard 100% 20%
//     <g class="leg a">, <g class="leg b">  Beine, drehen an der Oberkante (Hüfte). Je Bein eine Gruppe.
//                        Gegenüberliegende Beine bekommen a/b abwechselnd (vorne links = a, vorne rechts = b …)
//     <g class="wing">   Flügel (optional), Drehpunkt per style="transform-origin:…" (Schulter)
//     <g class="head" style="transform-origin:X% Y%">  Kopf inkl. Augen, Drehpunkt = Hals/Ansatz
//        darin <g class="lid">…</g>: geschlossenes Auge (Fellfarbe + Lidstrich), liegt über dem offenen Auge
//   Hauptflächen in Fellfarbe tragen style="fill:var(--fell,#xxxxxx)" (für „die rote Katze“).
//   Kontur stroke="#3B2A6B" stroke-width="4", Pastellfarben, große Köpfe, freundlich.
//
// VERTRAG DING (eigene viewBox 0 0 w h, gleiche Einheiten wie Figuren: Einhorn-Box ist 320 breit):
//   id, wort, artikel, w, h, boden (y der Standfläche in der viewBox), himmel (true = schwebt, z. B. Mond),
//   svg (hinten), vorne (optional, liegt vor der Figur, z. B. Bettdecke).
(function(){
  const F = window.Figuren = { figuren:{}, dinge:{}, INK:"#3B2A6B" };
  F.add  = def => { F.figuren[def.id] = Object.assign({groesse:1, fliegt:false, mund:[280,110], kopf:[240,40]}, def); };
  F.ding = def => { F.dinge[def.id] = Object.assign({boden:def.h, himmel:false}, def); };

  const css = `
.figur,.ding{display:block;width:100%;height:auto;overflow:visible}
.figur *,.ding *{stroke-linejoin:round;stroke-linecap:round}
.figur .fig,.figur .bob,.figur .kruemel circle,.figur .breath,.figur .leg,.figur .tail,.figur .head,.figur .lid,.figur .wing,.figur .zzz text{transform-box:fill-box}
.figur .fig,.figur .breath{transform-origin:50% 100%}
.figur .leg{transform-origin:50% 0}
.figur .tail{transform-origin:100% 20%;animation:fg-wedel 2.4s ease-in-out infinite}
.figur .head{transform-origin:50% 100%;transition:transform 1s ease-in-out}
.figur .lid{transform-origin:50% 50%;transform:scaleY(0);animation:fg-blink 4.5s infinite}
.figur .wing{transform-origin:15% 20%}
.figur .zzz{opacity:0;transition:opacity .6s}
.figur .zzz text{opacity:0}
@keyframes fg-wedel{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(10deg)}}
@keyframes fg-blink{0%,92%,100%{transform:scaleY(0)}95%{transform:scaleY(1)}}
@keyframes fg-schritt{from{transform:rotate(-18deg)}to{transform:rotate(18deg)}}
@keyframes fg-bob{to{transform:translateY(-5px)}}
@keyframes fg-nick{from{transform:rotate(-3deg)}to{transform:rotate(4deg)}}
@keyframes fg-atmen{50%{transform:scale(1.02,1.04)}}
@keyframes fg-zz{0%{opacity:0;transform:translate(0,0) scale(.6)}20%{opacity:1}100%{opacity:0;transform:translate(40px,-80px) scale(1.4)}}
@keyframes fg-kauen{0%{transform:rotate(0)}14%{transform:rotate(32deg)}22%{transform:rotate(25deg) scale(1,.9)}30%{transform:rotate(32deg)}38%{transform:rotate(25deg) scale(1,.9)}46%{transform:rotate(32deg)}54%{transform:rotate(25deg) scale(1,.9)}62%{transform:rotate(32deg)}74%{transform:rotate(4deg)}82%{transform:rotate(0) scale(1,1.04)}100%{transform:rotate(0)}}
@keyframes fg-kruemel{0%{opacity:0;transform:translate(0,0)}15%{opacity:1}100%{opacity:0;transform:translate(var(--kx,6px),34px)}}
@keyframes fg-gleiten{from{transform:translateY(8px)}to{transform:translateY(-12px)}}
@keyframes fg-tanz{0%{transform:rotate(-7deg) translateY(0)}25%{transform:rotate(0) translateY(-16px)}50%{transform:rotate(7deg) translateY(0)}75%{transform:rotate(0) translateY(-16px)}100%{transform:rotate(-7deg) translateY(0)}}
@keyframes fg-flatter{from{transform:rotate(-40deg)}to{transform:rotate(28deg)}}
@keyframes fg-schweben{from{transform:translateY(0)}to{transform:translateY(-10px)}}
/* läuft */
.figur.laeuft .leg.a{animation:fg-schritt var(--tempo,.5s) ease-in-out infinite alternate}
.figur.laeuft .leg.b{animation:fg-schritt var(--tempo,.5s) ease-in-out infinite alternate-reverse}
.figur.laeuft .bob{animation:fg-bob calc(var(--tempo,.5s) / 2) ease-in-out infinite alternate}
.figur.laeuft .head{animation:fg-nick var(--tempo,.5s) ease-in-out infinite alternate}
/* schläft */
.figur.schlaeft .lid{animation:none;transform:scaleY(1)}
.figur.schlaeft .head{transform:rotate(12deg) translateY(8px)}
.figur.schlaeft .tail{animation-duration:6s}
.figur.schlaeft .breath{animation:fg-atmen 2.6s ease-in-out infinite}
.figur.schlaeft .zzz{opacity:1}
.figur.schlaeft .zzz text{animation:fg-zz 3s ease-in infinite}
.figur.schlaeft .zzz text:nth-child(2){animation-delay:1s}
.figur.schlaeft .zzz text:nth-child(3){animation-delay:2s}
/* müde: Augen halb zu */
.figur.muede .lid{animation:none;transform:scaleY(.55)}
.figur.muede{--tempo:.8s}
/* frisst */
.figur.frisst .head{animation:fg-kauen 1.7s ease-in-out infinite}
.figur .kruemel{opacity:0}
.figur.frisst .kruemel{opacity:1}
.figur.frisst .kruemel circle{animation:fg-kruemel .85s ease-in infinite;opacity:0}
.figur.frisst .kruemel circle:nth-child(2){animation-delay:.2s;--kx:-8px}
.figur.frisst .kruemel circle:nth-child(3){animation-delay:.45s;--kx:12px}
.figur.frisst .kruemel circle:nth-child(4){animation-delay:.65s;--kx:-3px}
/* tanzt */
.figur.tanzt .fig{animation:fg-tanz .9s ease-in-out infinite}
.figur.tanzt .leg.a{animation:fg-schritt .45s ease-in-out infinite alternate}
.figur.tanzt .leg.b{animation:fg-schritt .45s ease-in-out infinite alternate-reverse}
/* fliegt */
.figur .fig{transition:transform .5s ease-out}
.figur.fliegt .fig{transform:translateY(-60px) rotate(-7deg)}
.figur.fliegt .wing{animation:fg-flatter .17s ease-in-out infinite alternate}
.figur.fliegt .leg{transform:rotate(-35deg)}
.figur.fliegt .bob{animation:fg-gleiten 1.3s ease-in-out infinite alternate}
@media (prefers-reduced-motion:reduce){
  .figur .tail,.figur.laeuft *,.figur.tanzt *,.figur.tanzt .fig,.figur.fliegt *,.figur.frisst .head,.figur.schlaeft .breath{animation:none!important}
}`;
  if(!document.getElementById("figuren-css")){
    const st=document.createElement("style"); st.id="figuren-css"; st.textContent=css; document.head.appendChild(st);
  }

  // SVG einer Figur als Text. opts: {fell:"#ff8a8a"}
  F.svgFigur = (id, opts={}) => {
    const d=F.figuren[id]; if(!d) return "";
    const [kx,ky]=d.kopf;
    const style = opts.fell ? ` style="--fell:${opts.fell}"` : "";
    return `<svg class="figur" viewBox="0 0 320 280" data-id="${id}"${style} aria-label="${d.wort}">`
      + `<g class="fig"><g class="bob"><g class="breath">${d.svg}</g></g></g>`
      + `<g class="kruemel">${[[0,"#E9B872"],[6,"#FF9ECF"],[-5,"#E9B872"],[3,"#B5E08C"]].map(([dx,c])=>`<circle cx="${d.mund[0]-8+dx}" cy="${d.mund[1]+22}" r="4" fill="${c}" stroke="${F.INK}" stroke-width="1.5"/>`).join("")}</g>`
      + `<g class="zzz" fill="${F.INK}" font-weight="800" font-family="system-ui,sans-serif">`
      + `<text x="${kx+20}" y="${ky}" font-size="24">z</text><text x="${kx+20}" y="${ky}" font-size="24">z</text><text x="${kx+20}" y="${ky}" font-size="24">Z</text></g>`
      + `</svg>`;
  };
  F.svgDing = (id, teil="svg") => {
    const d=F.dinge[id]; if(!d || !d[teil]) return "";
    return `<svg class="ding" viewBox="0 0 ${d.w} ${d.h}" data-id="${id}" aria-label="${d.wort}">${d[teil]}</svg>`;
  };

  // Einmal hüpfen (an der .fig-Gruppe). Gibt die Animation zurück.
  F.hop = (svgEl, {hoehe=70, dauer=700, mal=1}={}) => {
    const fig=svgEl.querySelector(".fig"); if(!fig) return null;
    return fig.animate([
      {transform:"translateY(0) scale(1,1)"},
      {transform:"translateY(0) scale(1.08,.9)", offset:.12},
      {transform:`translateY(-${hoehe}px) scale(.94,1.08)`, offset:.45},
      {transform:"translateY(0) scale(1.1,.88)", offset:.78},
      {transform:"translateY(0) scale(1,1)"}
    ], {duration:dauer, iterations:mal, easing:"cubic-bezier(.3,0,.4,1)"});
  };
  // Zustand setzen: "" | "laeuft" | "schlaeft" | "frisst" | "tanzt" | "fliegt" (müde bleibt erhalten)
  F.zustand = (svgEl, z) => {
    svgEl.classList.remove("laeuft","schlaeft","frisst","tanzt","fliegt");
    if(z) svgEl.classList.add(z);
  };
})();
