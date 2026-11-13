// Zaun – Holzlatten mit runden Spitzen und zwei Querlatten. Niedriger als das Einhorn (Rücken ~120), zum Drüberspringen.
(function(){
  const K='stroke="#3B2A6B" stroke-width="4"';
  let latten="";
  for(let i=0;i<7;i++){
    const x=12+i*36, h=i%2?16:10;               // abwechselnd etwas höher/niedriger
    latten+=`<path d="M${x} 118 V${h+13} A13 13 0 0 1 ${x+26} ${h+13} V118Z" fill="#F2CC98" ${K}/>`
      +`<path d="M${x+6} ${h+16} Q${x+8} ${h+8} ${x+14} ${h+6}" fill="none" stroke="#fff" stroke-width="3" opacity=".55"/>`
      +`<circle cx="${x+13}" cy="${h+60}" r="2.5" fill="#C9935E"/>`;
  }
  Figuren.ding({
    id:"zaun", wort:"Zaun", artikel:"der", w:260, h:120, boden:118,
    svg:`
    <rect x="4" y="46" width="252" height="16" rx="7" fill="#E3B27C" ${K}/>
    <rect x="4" y="86" width="252" height="16" rx="7" fill="#E3B27C" ${K}/>
    ${latten}`
  });
})();
