// Hase – lange Ohren, Puschelschwanz, kräftige Hinterbeine, Zähnchen.
(function(){
const K='stroke="#3B2A6B" stroke-width="4"', F=`style="fill:var(--fell,#F5F3FA)"`;
const D='fill="#3B2A6B" opacity=".1"';
Figuren.add({
  id:"hase", wort:"Hase", artikel:"der", akk:"Hasen", dat:"Hasen", groesse:.7, fliegt:false, fell:"#F5F3FA",
  mund:[268,142], kopf:[244,12],
  svg:`
  <g class="tail" style="transform-origin:100% 50%">
   <path d="M90 152 C80 146 68 152 70 160 C62 162 60 174 68 178 C66 188 78 192 86 186 C94 192 104 186 102 178Z" fill="#fff" ${K}/>
  </g>
  <g class="leg b">
   <rect x="118" y="238" width="54" height="14" rx="7" ${F} ${K}/><rect x="118" y="238" width="54" height="14" rx="7" ${D}/>
   <ellipse cx="136" cy="206" rx="26" ry="32" ${F} ${K}/><ellipse cx="136" cy="206" rx="26" ry="32" ${D}/>
  </g>
  <g class="leg a"><rect x="198" y="196" width="18" height="56" rx="9" ${F} ${K}/><rect x="198" y="196" width="18" height="56" rx="9" ${D}/><rect x="198" y="240" width="18" height="12" rx="6" fill="#F2BCD2" ${K}/></g>
  <path d="M190 162 C196 142 204 132 214 124 L240 140 C234 154 230 170 226 188Z" ${F} ${K}/>
  <ellipse cx="156" cy="186" rx="68" ry="44" ${F} ${K}/>
  <ellipse cx="170" cy="206" rx="40" ry="16" fill="#fff" opacity=".6"/>
  <g class="leg a">
   <rect x="98" y="238" width="62" height="14" rx="7" ${F} ${K}/>
   <path d="M144 241 v8 M152 241 v8" stroke="#3B2A6B" stroke-width="2.5"/>
   <ellipse cx="120" cy="204" rx="34" ry="36" ${F} ${K}/>
   <path d="M104 186 Q114 178 126 182" fill="none" stroke="#3B2A6B" stroke-width="3" opacity=".35"/>
  </g>
  <g class="leg b"><rect x="184" y="198" width="18" height="54" rx="9" ${F} ${K}/><rect x="184" y="240" width="18" height="12" rx="6" fill="#FFD1E3" ${K}/></g>
  <g class="head" style="transform-origin:20% 94%">
   <ellipse cx="212" cy="62" rx="13" ry="38" transform="rotate(-14 212 62)" ${F} ${K}/>
   <ellipse cx="212" cy="62" rx="13" ry="38" transform="rotate(-14 212 62)" ${D}/>
   <ellipse cx="242" cy="56" rx="15" ry="43" transform="rotate(12 242 56)" ${F} ${K}/>
   <ellipse cx="243" cy="56" rx="7" ry="31" transform="rotate(12 243 56)" fill="#FFC2DA"/>
   <circle cx="228" cy="122" r="40" ${F} ${K}/>
   <ellipse cx="216" cy="102" rx="14" ry="7" fill="#fff"/>
   <path d="M261 141 h10 v8 a2 2 0 0 1 -2 2 h-6 a2 2 0 0 1 -2 -2Z M266 141 v10" fill="#fff" stroke="#3B2A6B" stroke-width="2.5"/>
   <path d="M266 131 v7 M256 139 Q261 144 266 138 Q271 144 276 139" fill="none" stroke="#3B2A6B" stroke-width="3"/>
   <ellipse cx="266" cy="128" rx="6" ry="4.5" fill="#FF8FB1" stroke="#3B2A6B" stroke-width="2.5"/>
   <path d="M274 128 L296 122 M275 134 L298 136" stroke="#3B2A6B" stroke-width="2.5"/>
   <ellipse cx="240" cy="114" rx="8" ry="10" fill="#3B2A6B"/>
   <circle cx="243" cy="110" r="3" fill="#fff"/>
   <g class="lid"><ellipse cx="240" cy="114" rx="11" ry="13" ${F}/><path d="M230 114 Q240 124 250 114" fill="none" stroke="#3B2A6B" stroke-width="4"/><path d="M233 120 l-3 4 M240 123 v5 M247 120 l3 4" stroke="#3B2A6B" stroke-width="2.5"/></g>
   <circle cx="248" cy="134" r="7" fill="#FF9ECF" opacity=".6"/>
  </g>`
});
})();
