// Ball – bunte Segmente (ohne Stern), genau in der Mitte (32|32), damit man das Rollen sieht.
(function(){
  const c=32, r=28, farben=["#FF8E8E","#FFD95A","#9EDB8A","#8FD3FF","#B49CFF","#FF9ECF"];
  const p=a=>[(c+r*Math.cos(a)).toFixed(2),(c+r*Math.sin(a)).toFixed(2)];
  let seg="";
  for(let i=0;i<6;i++){
    const [x1,y1]=p(i*Math.PI/3-Math.PI/2), [x2,y2]=p((i+1)*Math.PI/3-Math.PI/2);
    seg+=`<path d="M${c} ${c} L${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2}Z" fill="${farben[i]}"/>`;
  }
  Figuren.ding({
    id:"ball", wort:"Ball", artikel:"der", w:64, h:64, boden:62,
    svg:`${seg}
    <g stroke="#3B2A6B" stroke-width="2.5" opacity=".5">
     ${[0,1,2].map(i=>{const [a,b]=p(i*Math.PI/3-Math.PI/2),[d,e]=p(i*Math.PI/3+Math.PI/2);return `<path d="M${a} ${b} L${d} ${e}"/>`;}).join("")}
    </g>
    <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="#3B2A6B" stroke-width="4"/>
    <path d="M14 22 Q18 12 28 9" fill="none" stroke="#fff" stroke-width="4" opacity=".6"/>`
  });
})();
