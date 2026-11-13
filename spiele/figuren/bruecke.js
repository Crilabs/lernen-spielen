// Brücke – flache Holzbrücke mit Bogen und Geländer. boden = y der Enden, oben = Laufbahn in der Mitte.
// vorne = Geländer-Vorderseite, verdeckt die Füße einer Figur auf der Brücke etwas.
(function(){
  const K='stroke="#3B2A6B" stroke-width="4"';
  // Oberkante der Laufbahn: quadratische Kurve von (6|114) über (220|26) nach (434|114), Mitte y = 70
  const yDeck=x=>{const t=(x-6)/428;return (1-t)*(1-t)*114+2*t*(1-t)*26+t*t*114;};
  const linie=(x0,x1,dy)=>{let d="";for(let x=x0;x<=x1;x+=10)d+=(d?"L":"M")+x+" "+(yDeck(x)-dy).toFixed(1);return d;};
  // Geländer: Pfosten von der Laufbahn bis über die obere Latte, Latten in Höhe hs (über Laufbahn - dy)
  const gelaender=(dy,hs,holz,dunkel)=>{
    let s="";
    const top=dy+hs[hs.length-1]+6;
    for(let x=30;x<=410;x+=54.3){const y=yDeck(x);s+=`<rect x="${(x-6).toFixed(1)}" y="${(y-top).toFixed(1)}" width="12" height="${(top+8).toFixed(1)}" rx="5" fill="${dunkel}" ${K}/>`;}
    for(const h of hs){const d=linie(30,410,dy+h);s+=`<path d="${d}" fill="none" stroke="#3B2A6B" stroke-width="12"/><path d="${d}" fill="none" stroke="${holz}" stroke-width="5"/>`;}
    return s;
  };
  let bretter="";
  for(let x=34;x<420;x+=24){const y=yDeck(x);bretter+=`<path d="M${x} ${(y+3).toFixed(1)} v12" stroke="#C9935E" stroke-width="3"/>`;}
  Figuren.ding({
    id:"bruecke", wort:"Brücke", artikel:"die", w:440, h:130, boden:128, oben:70,
    svg:`
    <ellipse cx="220" cy="120" rx="160" ry="9" fill="#9CD8FF"/>
    <path d="M110 120 q10 -5 20 0 M200 118 q10 -5 20 0 M290 120 q10 -5 20 0" stroke="#fff" stroke-width="3" fill="none"/>
    ${gelaender(8,[44],"#E3B27C","#D9A273")}
    <path d="M6 114 Q220 26 434 114 L434 128 L404 128 Q220 52 36 128 L6 128Z" fill="#F2CC98" ${K}/>
    ${bretter}
    <path d="M30 110 Q220 34 410 110" fill="none" stroke="#fff" stroke-width="3" opacity=".5"/>`,
    vorne:`${gelaender(-6,[18,32],"#F2CC98","#E3B27C")}`
  });
})();
