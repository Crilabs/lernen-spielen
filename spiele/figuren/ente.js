// Ente – gelbe Watschelente mit Flügel (fliegt).
Figuren.add({
  id:"ente", wort:"Ente", artikel:"die", groesse:0.6, fliegt:true, fell:"#FFE27A",
  mund:[304,104], kopf:[226,40],
  svg:`
  <g class="tail" style="transform-origin:100% 60%">
   <path d="M78 150 C66 138 52 128 40 126 C46 140 48 154 56 166 C62 176 74 180 84 176Z" style="fill:var(--fell,#FFE27A)" stroke="#3B2A6B" stroke-width="4"/>
   <path d="M52 136 C58 146 62 156 70 164" fill="none" stroke="#3B2A6B" stroke-width="3" opacity=".5"/>
  </g>
  <g class="leg b" style="transform-origin:30% 0"><rect x="166" y="196" width="13" height="50" rx="6.5" fill="#F2A23C" stroke="#3B2A6B" stroke-width="4"/><path d="M160 244 C170 238 188 238 202 242 C208 246 206 254 198 254 L164 254 C156 254 154 248 160 244Z" fill="#F2A23C" stroke="#3B2A6B" stroke-width="4"/></g>
  <g class="leg a" style="transform-origin:30% 0"><rect x="124" y="196" width="13" height="50" rx="6.5" fill="#FFB347" stroke="#3B2A6B" stroke-width="4"/><path d="M118 244 C128 238 146 238 160 242 C166 246 164 254 156 254 L122 254 C114 254 112 248 118 244Z" fill="#FFB347" stroke="#3B2A6B" stroke-width="4"/><path d="M134 246 l2 7 M146 245 l1 8" stroke="#3B2A6B" stroke-width="2.5" opacity=".6"/></g>
  <path d="M192 156 C196 132 200 116 206 104 L250 112 C246 128 242 144 240 168Z" style="fill:var(--fell,#FFE27A)" stroke="#3B2A6B" stroke-width="4"/>
  <ellipse cx="150" cy="172" rx="88" ry="52" style="fill:var(--fell,#FFE27A)" stroke="#3B2A6B" stroke-width="4"/>
  <ellipse cx="176" cy="196" rx="46" ry="18" fill="#fff" opacity=".35"/>
  <g class="wing" style="transform-origin:92% 12%">
   <path d="M186 148 C160 132 112 134 86 156 C80 162 84 168 92 168 C88 176 94 182 104 180 C104 188 114 192 124 188 C150 196 178 184 190 166 C194 158 192 152 186 148Z" style="fill:var(--fell,#FFE27A)" stroke="#3B2A6B" stroke-width="4"/>
   <path d="M120 160 C138 166 158 166 176 158 M110 172 C128 178 150 178 168 172" fill="none" stroke="#3B2A6B" stroke-width="3" opacity=".45"/>
  </g>
  <g class="head" style="transform-origin:30% 92%">
   <circle cx="228" cy="88" r="44" style="fill:var(--fell,#FFE27A)" stroke="#3B2A6B" stroke-width="4"/>
   <path d="M222 46 C216 34 222 26 232 28 C226 32 228 38 234 44" style="fill:var(--fell,#FFE27A)" stroke="#3B2A6B" stroke-width="4"/>
   <path d="M262 94 C278 86 298 88 306 98 C308 104 302 110 290 112 C278 114 266 112 260 108Z" fill="#FFA53C" stroke="#3B2A6B" stroke-width="4"/>
   <path d="M264 102 C278 104 292 104 304 100" fill="none" stroke="#3B2A6B" stroke-width="3"/>
   <circle cx="282" cy="94" r="2.5" fill="#3B2A6B"/>
   <ellipse cx="240" cy="80" rx="8" ry="10" fill="#3B2A6B"/>
   <circle cx="243" cy="76" r="3" fill="#fff"/>
   <g class="lid"><ellipse cx="240" cy="80" rx="11" ry="13" style="fill:var(--fell,#FFE27A)"/><path d="M230 80 Q240 90 250 80" fill="none" stroke="#3B2A6B" stroke-width="4"/><path d="M233 86 l-3 4 M240 89 v5 M247 86 l3 4" stroke="#3B2A6B" stroke-width="2.5"/></g>
   <circle cx="246" cy="104" r="7" fill="#FF9ECF" opacity=".6"/>
  </g>`
});
