// Haus – Spitzdach, Schornstein mit Rauch, Tür, Fenster, Blumen.
(function(){
  const K='stroke="#3B2A6B" stroke-width="4"';
  const fenster=(x,y)=>`<rect x="${x}" y="${y}" width="54" height="50" rx="8" fill="#CDEBFF" ${K}/>
    <path d="M${x+27} ${y+2} V${y+48} M${x+2} ${y+25} H${x+52}" stroke="#3B2A6B" stroke-width="4"/>
    <path d="M${x+7} ${y+18} L${x+16} ${y+8}" stroke="#fff" stroke-width="4" opacity=".8"/>
    <rect x="${x-4}" y="${y+48}" width="62" height="10" rx="4" fill="#FF9ECF" ${K}/>`;
  const bl=(x,y,f)=>`<circle cx="${x}" cy="${y}" r="7" fill="${f}" stroke="#3B2A6B" stroke-width="3"/><circle cx="${x}" cy="${y}" r="2.5" fill="#FFD95A"/>`;
  Figuren.ding({
    id:"haus", wort:"Haus", artikel:"das", w:320, h:330, boden:328,
    svg:`
    <g fill="#fff" stroke="#3B2A6B" stroke-width="3" opacity=".9"><circle cx="232" cy="38" r="9"/><circle cx="246" cy="22" r="11"/><circle cx="264" cy="12" r="7"/></g>
    <rect x="210" y="52" width="34" height="80" rx="4" fill="#FF8E8E" ${K}/>
    <rect x="204" y="46" width="46" height="14" rx="5" fill="#E07A7A" ${K}/>
    <rect x="42" y="150" width="236" height="178" rx="6" fill="#FFE6A8" ${K}/>
    <path d="M50 160 V320" stroke="#fff" stroke-width="4" opacity=".5"/>
    <path d="M16 164 L160 34 L304 164Z" fill="#FF9A9A" ${K}/>
    <path d="M60 142 L160 54" stroke="#fff" stroke-width="5" opacity=".45"/>
    <circle cx="160" cy="114" r="22" fill="#CDEBFF" ${K}/>
    <path d="M160 94 V134 M140 114 H180" stroke="#3B2A6B" stroke-width="3.5"/>
    ${fenster(64,184)}${fenster(202,184)}
    <path d="M128 328 V258 A32 32 0 0 1 192 258 V328Z" fill="#9CC8FF" ${K}/>
    <path d="M136 262 A24 24 0 0 1 152 236" stroke="#fff" stroke-width="4" fill="none" opacity=".6"/>
    <circle cx="180" cy="290" r="5" fill="#FFD95A" stroke="#3B2A6B" stroke-width="3"/>
    <path d="M60 328 V310 M76 328 V306 M244 328 V308 M262 328 V312" stroke="#7CC66E" stroke-width="4"/>
    ${bl(60,306,"#FF9ECF")}${bl(76,300,"#B49CFF")}${bl(244,302,"#8FD3FF")}${bl(262,306,"#FF9ECF")}`
  });
})();
