// Hund – Schlappohren, Wedelschwanz, Zunge.
(function(){
const K='stroke="#3B2A6B" stroke-width="4"', F=`style="fill:var(--fell,#F3D2A2)"`;
const dunkel=(form)=>form.replace(/ style="[^"]*"/,' fill="#7A4A1E" opacity=".22"').replace(K,'');
const bein=(kl,x,y,hinten)=>`<g class="leg ${kl}"><rect x="${x}" y="${y}" width="24" height="${252-y}" rx="12" ${F} ${K}/>${hinten?`<rect x="${x}" y="${y}" width="24" height="${252-y}" rx="12" fill="#7A4A1E" opacity=".14"/>`:""}<rect x="${x}" y="238" width="24" height="14" rx="7" fill="${hinten?"#EADBC6":"#FFF6EA"}" ${K}/></g>`;
const ohrVorn=`<path d="M206 70 C184 70 174 100 182 126 C186 140 204 140 208 124 C212 106 214 88 224 72Z" ${F} ${K}/>`;
const ohrHinten=`<path d="M244 66 C260 54 280 62 276 82 C272 96 258 96 252 86Z" ${F} ${K}/>`;
Figuren.add({
  id:"hund", wort:"Hund", artikel:"der", groesse:.85, fliegt:false, fell:"#F3D2A2",
  mund:[280,140], kopf:[232,58],
  svg:`
  <g class="tail" style="transform-origin:90% 90%">
   <path d="M92 166 C70 158 54 138 56 114 C57 102 70 100 72 112 C74 132 84 144 100 152Z" ${F} ${K}/>
  </g>
  ${bein("b",100,192,1)}${bein("a",178,192,1)}
  <path d="M184 162 C190 138 200 122 212 110 L246 126 C238 146 232 166 228 190Z" ${F} ${K}/>
  <ellipse cx="152" cy="176" rx="76" ry="44" ${F} ${K}/>
  <path d="M104 146 C116 136 140 138 146 152 C152 168 130 178 112 172 C100 168 96 154 104 146Z" fill="#7A4A1E" opacity=".18"/>
  <ellipse cx="160" cy="154" rx="40" ry="14" fill="#fff" opacity=".35"/>
  ${bein("a",120,196)}${bein("b",196,196)}
  <g class="head" style="transform-origin:22% 92%">
   ${ohrHinten}${dunkel(ohrHinten)}
   <circle cx="232" cy="104" r="44" ${F} ${K}/>
   <ellipse cx="222" cy="84" rx="18" ry="10" fill="#fff" opacity=".3"/>
   <path d="M268 134 C268 156 286 156 286 134Z" fill="#FF8FB1" stroke="#3B2A6B" stroke-width="3"/><path d="M277 140 v8" stroke="#E0607F" stroke-width="2"/>
   <ellipse cx="268" cy="120" rx="28" ry="20" fill="#FFF4E4" ${K}/>
   <ellipse cx="290" cy="110" rx="9" ry="7" fill="#3B2A6B"/><circle cx="287" cy="107" r="2.2" fill="#fff"/>
   <path d="M266 126 Q278 136 292 126" fill="none" stroke="#3B2A6B" stroke-width="3.5"/>
   <ellipse cx="240" cy="96" rx="8" ry="10" fill="#3B2A6B"/>
   <circle cx="243" cy="92" r="3" fill="#fff"/>
   <g class="lid"><ellipse cx="240" cy="96" rx="11" ry="13" ${F}/><path d="M230 96 Q240 106 250 96" fill="none" stroke="#3B2A6B" stroke-width="4"/><path d="M233 102 l-3 4 M240 105 v5 M247 102 l3 4" stroke="#3B2A6B" stroke-width="2.5"/></g>
   <circle cx="250" cy="116" r="7" fill="#FF9ECF" opacity=".6"/>
   ${ohrVorn}${dunkel(ohrVorn)}
  </g>`
});
})();
