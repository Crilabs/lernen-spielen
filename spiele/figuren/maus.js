// Maus – riesige runde Ohren, spitze Schnauze, dünner Schwanz.
(function(){
const K='stroke="#3B2A6B" stroke-width="4"', F=`style="fill:var(--fell,#C9C3DD)"`;
const bein=(kl,x,y,hinten)=>`<g class="leg ${kl}"><rect x="${x}" y="${y}" width="18" height="${252-y}" rx="9" ${F} ${K}/>${hinten?`<rect x="${x}" y="${y}" width="18" height="${252-y}" rx="9" fill="#3B2A6B" opacity=".14"/>`:""}<rect x="${x-2}" y="241" width="22" height="11" rx="5.5" fill="${hinten?"#EFA3BE":"#FFB3CF"}" ${K}/></g>`;
const schwanz="M84 200 C50 192 28 208 36 226 C42 238 26 244 12 232";
Figuren.add({
  id:"maus", wort:"Maus", artikel:"die", groesse:.5, fliegt:false, fell:"#C9C3DD",
  mund:[296,146], kopf:[204,68],
  svg:`
  <g class="tail" style="transform-origin:100% 10%">
   <path d="${schwanz}" fill="none" stroke="#3B2A6B" stroke-width="10"/>
   <path d="${schwanz}" fill="none" stroke="#FFB3CF" stroke-width="4"/>
  </g>
  ${bein("b",104,212,1)}${bein("a",172,212,1)}
  <ellipse cx="150" cy="192" rx="76" ry="48" ${F} ${K}/>
  <ellipse cx="128" cy="168" rx="36" ry="14" fill="#fff" opacity=".35"/>
  <ellipse cx="170" cy="214" rx="40" ry="16" fill="#fff" opacity=".25"/>
  ${bein("a",122,216)}${bein("b",188,216)}
  <g class="head" style="transform-origin:20% 94%">
   <circle cx="248" cy="92" r="25" ${F} ${K}/>
   <circle cx="249" cy="93" r="15" fill="#FFB3CF"/>
   <path d="M236 118 C262 124 284 132 294 142 C284 154 262 160 236 166Z" ${F} ${K}/>
   <circle cx="224" cy="140" r="38" ${F} ${K}/>
   <ellipse cx="214" cy="120" rx="14" ry="7" fill="#fff" opacity=".3"/>
   <path d="M282 134 L304 124 M284 142 L308 142 M282 150 L302 160" stroke="#3B2A6B" stroke-width="2.5"/>
   <circle cx="294" cy="142" r="7.5" fill="#FF8FB1" ${K} stroke-width="3"/>
   <path d="M268 154 Q276 160 284 152" fill="none" stroke="#3B2A6B" stroke-width="3"/>
   <ellipse cx="240" cy="132" rx="7.5" ry="9.5" fill="#3B2A6B"/>
   <circle cx="243" cy="128" r="2.8" fill="#fff"/>
   <g class="lid"><ellipse cx="240" cy="132" rx="10.5" ry="12.5" ${F}/><path d="M231 132 Q240 141 249 132" fill="none" stroke="#3B2A6B" stroke-width="4"/><path d="M234 137 l-3 4 M240 140 v5 M246 137 l3 4" stroke="#3B2A6B" stroke-width="2.5"/></g>
   <circle cx="252" cy="152" r="6" fill="#FF9ECF" opacity=".6"/>
   <circle cx="200" cy="100" r="31" ${F} ${K}/>
   <circle cx="202" cy="102" r="20" fill="#FFB3CF"/>
  </g>`
});
})();
