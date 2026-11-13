// Blume – Stängel mit Blatt, große Blüte.
(function(){
  const cx=30, cy=32;
  let blaetter="";
  for(let i=0;i<6;i++){
    const a=i*Math.PI/3-Math.PI/2;
    blaetter+=`<circle cx="${(cx+14*Math.cos(a)).toFixed(1)}" cy="${(cy+14*Math.sin(a)).toFixed(1)}" r="12"/>`;
  }
  Figuren.ding({
    id:"blume", wort:"Blume", artikel:"die", w:60, h:120, boden:118,
    svg:`
    <path d="M30 118 C27 96 33 74 30 50" fill="none" stroke="#3B2A6B" stroke-width="10"/>
    <path d="M30 118 C27 96 33 74 30 50" fill="none" stroke="#7CC66E" stroke-width="4"/>
    <path d="M30 92 C38 78 50 76 56 78 C52 92 42 96 30 92Z" fill="#9EDB8A" stroke="#3B2A6B" stroke-width="4"/>
    <path d="M30 104 C22 92 10 90 5 92 C9 104 20 108 30 104Z" fill="#9EDB8A" stroke="#3B2A6B" stroke-width="4"/>
    <g stroke="#3B2A6B" stroke-width="8">${blaetter}</g>
    <g fill="#FF9ECF">${blaetter}</g>
    <circle cx="${cx}" cy="${cy}" r="10" fill="#FFD95A" stroke="#3B2A6B" stroke-width="4"/>
    <circle cx="27" cy="29" r="3" fill="#fff" opacity=".7"/>`
  });
})();
