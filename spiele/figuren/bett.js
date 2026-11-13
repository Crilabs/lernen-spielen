// Bett – Kopfteil links, Matratze (oben = Matratzenoberkante), Fußteil rechts.
// vorne = Bettdecke (reicht ~55 über die Matratze) + Fußteil, damit eine Figur „im Bett“ liegt.
(function(){
  const K='stroke="#3B2A6B" stroke-width="4"';
  const stern=(x,y,r)=>{let d="";for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,rr=i%2?r*.45:r;d+=(i?"L":"M")+(x+rr*Math.cos(a)).toFixed(1)+" "+(y+rr*Math.sin(a)).toFixed(1);}return `<path d="${d}Z" fill="#FFD95A" stroke="#3B2A6B" stroke-width="2.5"/>`;};
  const fuss=`
    <path d="M262 148 V60 A16 16 0 0 1 294 60 V148Z" fill="#C9A6F0" ${K}/>
    <circle cx="278" cy="56" r="7" fill="#FF9ECF" ${K}/>
    <path d="M268 72 V136" stroke="#fff" stroke-width="3" opacity=".5"/>`;
  Figuren.ding({
    id:"bett", wort:"Bett", artikel:"das", w:300, h:150, boden:148, oben:80,
    svg:`
    <rect x="22" y="116" width="14" height="32" rx="5" fill="#9C86E8" ${K}/>
    <rect x="252" y="116" width="14" height="32" rx="5" fill="#9C86E8" ${K}/>
    <path d="M6 148 V44 C6 18 44 18 44 44 V148Z" fill="#C9A6F0" ${K}/>
    <path d="M14 50 C14 34 36 34 36 50" fill="none" stroke="#fff" stroke-width="3" opacity=".55"/>
    <circle cx="25" cy="72" r="8" fill="#FF9ECF" ${K}/>
    <rect x="30" y="100" width="246" height="20" rx="6" fill="#B49CFF" ${K}/>
    <rect x="36" y="80" width="236" height="24" rx="10" fill="#FFFFFF" ${K}/>
    <path d="M44 86 H262" stroke="#E4DCFA" stroke-width="3"/>
    <path d="M48 80 C40 62 54 54 80 56 C106 58 112 66 106 80Z" fill="#FFE3F1" ${K}/>
    <path d="M62 64 Q76 60 90 64" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/>`,
    vorne:`
    <path d="M104 118 C96 96 98 40 112 30 C150 22 220 22 270 28 L270 118Z" fill="#8FD3FF" ${K}/>
    <path d="M110 34 C150 26 220 26 270 32 L270 48 C220 42 150 42 106 50 C106 42 108 38 110 34Z" fill="#fff" ${K}/>
    <g fill="#fff" opacity=".9">
     <circle cx="130" cy="96" r="4"/><circle cx="196" cy="70" r="4"/><circle cx="246" cy="98" r="4"/><circle cx="160" cy="62" r="3"/><circle cx="226" cy="64" r="3"/>
    </g>
    ${stern(146,78,9)}${stern(212,94,9)}${stern(250,68,8)}${stern(178,100,7)}
    ${fuss}`
  });
})();
