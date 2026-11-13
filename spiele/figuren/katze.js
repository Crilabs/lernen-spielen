// Katze – spitze Ohren, Streifen, Schnurrhaare, langer Schwanz.
(function(){
const K='stroke="#3B2A6B" stroke-width="4"', F=`style="fill:var(--fell,#FFC48A)"`;
const ST='fill="none" stroke="#B4501A" stroke-opacity=".38" stroke-width="6"';
const bein=(kl,x,y,hinten)=>`<g class="leg ${kl}"><rect x="${x}" y="${y}" width="20" height="${252-y}" rx="10" ${F} ${K}/>${hinten?`<rect x="${x}" y="${y}" width="20" height="${252-y}" rx="10" fill="#7A3A10" opacity=".15"/>`:""}<rect x="${x}" y="240" width="20" height="12" rx="6" fill="${hinten?"#F1E2D2":"#FFF6EA"}" ${K}/></g>`;
const schwanz="M92 180 C60 178 44 152 54 126 C62 104 58 86 40 84";
Figuren.add({
  id:"katze", wort:"Katze", artikel:"die", groesse:.75, fliegt:false, fell:"#FFC48A",
  mund:[266,126], kopf:[228,44],
  svg:`
  <g class="tail" style="transform-origin:100% 95%">
   <path d="${schwanz}" fill="none" stroke="#3B2A6B" stroke-width="22"/>
   <path d="${schwanz}" fill="none" stroke-width="14" style="stroke:var(--fell,#FFC48A)"/>
   <path d="M52 132 l14 4 M58 110 l13 -2 M46 90 l9 -8" ${ST} stroke-width="5"/>
  </g>
  ${bein("b",102,196,1)}${bein("a",176,196,1)}
  <path d="M184 168 C192 144 200 128 212 116 L242 132 C236 148 230 168 226 190Z" ${F} ${K}/>
  <ellipse cx="150" cy="182" rx="72" ry="40" ${F} ${K}/>
  <path d="M112 146 Q120 158 112 170 M134 143 Q142 157 134 171 M156 143 Q164 156 156 169 M178 147 Q185 157 179 167" ${ST}/>
  <ellipse cx="150" cy="200" rx="44" ry="13" fill="#fff" opacity=".35"/>
  ${bein("a",120,198)}${bein("b",194,198)}
  <g class="head" style="transform-origin:18% 92%">
   <path d="M194 90 L190 46 L228 68Z" ${F} ${K}/>
   <path d="M238 66 L272 50 L268 96Z" ${F} ${K}/>
   <circle cx="228" cy="106" r="42" ${F} ${K}/>
   <path d="M197 78 L195 56 L214 68Z" fill="#FFB3CF"/>
   <path d="M246 68 L266 60 L264 82Z" fill="#FFB3CF"/>
   <path d="M220 66 v10 M231 65 v12 M242 67 v10" ${ST} stroke-width="5"/>
   <ellipse cx="256" cy="122" rx="10" ry="8" fill="#FFF6EA"/>
   <ellipse cx="270" cy="122" rx="10" ry="8" fill="#FFF6EA"/>
   <path d="M257 111 L271 111 L264 119Z" fill="#FF8FB1" stroke="#3B2A6B" stroke-width="3"/>
   <path d="M264 119 v4 M256 123 Q260 128 264 123 Q268 128 272 123" fill="none" stroke="#3B2A6B" stroke-width="3"/>
   <path d="M278 116 L302 108 M280 122 L306 122 M278 128 L300 136" stroke="#3B2A6B" stroke-width="2.5"/>
   <ellipse cx="238" cy="98" rx="9" ry="11" fill="#7BD389"/>
   <ellipse cx="239" cy="99" rx="5.5" ry="9" fill="#3B2A6B"/>
   <circle cx="241" cy="94" r="3" fill="#fff"/>
   <g class="lid"><ellipse cx="238" cy="98" rx="12" ry="14" ${F}/><path d="M228 98 Q238 108 248 98" fill="none" stroke="#3B2A6B" stroke-width="4"/><path d="M231 104 l-3 4 M238 107 v5 M245 104 l3 4" stroke="#3B2A6B" stroke-width="2.5"/></g>
   <circle cx="243" cy="122" r="6" fill="#FF9ECF" opacity=".6"/>
  </g>`
});
})();
