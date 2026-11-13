// Baum – sichtbarer Stamm mit Wurzeln, runde Laubkrone aus Kreisen mit Äpfeln und Blüten.
(function(){
  const krone=[[130,120,92],[62,188,58],[198,188,58],[78,108,56],[182,108,56],[130,68,60],[92,230,52],[168,230,52]];
  const kreise=(l,extra="")=>l.map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}"${extra}/>`).join("");
  const apfel=(x,y)=>`<circle cx="${x}" cy="${y}" r="10" fill="#FF8E8E" stroke="#3B2A6B" stroke-width="4"/><circle cx="${x-3}" cy="${y-3}" r="3" fill="#fff" opacity=".6"/><path d="M${x} ${y-10} q1 -5 4 -7" stroke="#3B2A6B" stroke-width="3" fill="none"/>`;
  const bluete=(x,y)=>`<g stroke="#3B2A6B" stroke-width="2.5"><circle cx="${x-5}" cy="${y}" r="5" fill="#FFE3F1"/><circle cx="${x+5}" cy="${y}" r="5" fill="#FFE3F1"/><circle cx="${x}" cy="${y-5}" r="5" fill="#FFE3F1"/><circle cx="${x}" cy="${y+5}" r="5" fill="#FFE3F1"/><circle cx="${x}" cy="${y}" r="3.5" fill="#FFD95A"/></g>`;
  Figuren.ding({
    id:"baum", wort:"Baum", artikel:"der", w:260, h:380, boden:378,
    svg:`
    <path d="M96 378 C108 372 116 350 116 300 C116 260 114 230 112 196 L150 196 C148 230 146 260 146 300 C146 350 154 372 166 378Z" fill="#D9A273" stroke="#3B2A6B" stroke-width="4"/>
    <path d="M86 378 C98 374 106 366 112 352 M176 378 C164 374 156 366 150 352" fill="none" stroke="#3B2A6B" stroke-width="4"/>
    <path d="M124 250 Q128 290 124 330 M138 300 Q141 320 138 340" stroke="#B57E50" stroke-width="3" fill="none"/>
    <g transform="translate(26 14) scale(.8)">
     <g stroke="#3B2A6B" stroke-width="12">${kreise(krone)}</g>
     <g fill="#9EDB8A">${kreise(krone)}</g>
     <g fill="#fff" opacity=".3"><circle cx="100" cy="70" r="22"/><circle cx="60" cy="150" r="14"/></g>
     ${apfel(84,140)}${apfel(176,96)}${apfel(196,196)}${apfel(120,186)}${apfel(58,206)}
     ${bluete(140,56)}${bluete(206,140)}${bluete(40,118)}${bluete(150,140)}
    </g>
    <g fill="#86CF7A" stroke="#3B2A6B" stroke-width="3"><path d="M70 378 l6 -16 l5 16 l6 -12 l4 12Z"/><path d="M168 378 l5 -14 l5 14 l6 -18 l5 18Z"/></g>`
  });
})();
