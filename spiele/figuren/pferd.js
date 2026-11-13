// Pferd – karamellfarben, glatte dunkle Mähne, langer Schweif, längerer Kopf, kein Horn.
Figuren.add({
  id:"pferd", wort:"Pferd", artikel:"das", groesse:1.25, fliegt:false, fell:"#E8C49A",
  mund:[294,118], kopf:[232,22],
  svg:`
  <g class="tail" style="transform-origin:100% 10%">
   <path d="M80 140 C54 136 38 158 42 190 C44 212 36 230 28 242 C58 240 72 216 70 194 C68 174 74 160 88 154Z" fill="#9C6B4A" stroke="#3B2A6B" stroke-width="4"/>
   <path d="M84 150 C66 156 60 176 62 196 C64 214 58 228 50 238 C72 232 80 214 78 196 C76 180 82 168 92 162Z" fill="#B88460" stroke="#3B2A6B" stroke-width="4"/>
  </g>
  <g class="leg b"><rect x="94" y="180" width="22" height="70" rx="11" style="fill:var(--fell,#E8C49A)" stroke="#3B2A6B" stroke-width="4"/><rect x="94" y="180" width="22" height="70" rx="11" fill="#3B2A6B" opacity=".13"/><rect x="94" y="236" width="22" height="14" rx="6" fill="#5E4030" stroke="#3B2A6B" stroke-width="4"/></g>
  <g class="leg a"><rect x="176" y="180" width="22" height="70" rx="11" style="fill:var(--fell,#E8C49A)" stroke="#3B2A6B" stroke-width="4"/><rect x="176" y="180" width="22" height="70" rx="11" fill="#3B2A6B" opacity=".13"/><rect x="176" y="236" width="22" height="14" rx="6" fill="#5E4030" stroke="#3B2A6B" stroke-width="4"/></g>
  <path d="M176 150 C186 118 196 94 206 74 L246 90 C238 114 232 140 228 168Z" style="fill:var(--fell,#E8C49A)" stroke="#3B2A6B" stroke-width="4"/>
  <ellipse cx="150" cy="162" rx="84" ry="44" style="fill:var(--fell,#E8C49A)" stroke="#3B2A6B" stroke-width="4"/>
  <ellipse cx="130" cy="142" rx="40" ry="14" fill="#fff" opacity=".3"/>
  <path d="M210 60 C192 74 184 100 178 124 C174 138 170 148 162 158 C182 154 192 136 198 116 C204 98 210 84 220 74Z" fill="#9C6B4A" stroke="#3B2A6B" stroke-width="4"/>
  <g class="leg a"><rect x="114" y="184" width="22" height="68" rx="11" style="fill:var(--fell,#E8C49A)" stroke="#3B2A6B" stroke-width="4"/><rect x="114" y="240" width="22" height="14" rx="6" fill="#6E4B38" stroke="#3B2A6B" stroke-width="4"/></g>
  <g class="leg b"><rect x="196" y="184" width="22" height="68" rx="11" style="fill:var(--fell,#E8C49A)" stroke="#3B2A6B" stroke-width="4"/><rect x="196" y="240" width="22" height="14" rx="6" fill="#6E4B38" stroke="#3B2A6B" stroke-width="4"/></g>
  <g class="head" style="transform-origin:18% 82%">
   <path d="M214 46 L208 18 L230 38Z" style="fill:var(--fell,#E8C49A)" stroke="#3B2A6B" stroke-width="4"/>
   <path d="M214 40 L212 28 L222 37Z" fill="#C99A72"/>
   <path d="M206 62 C210 40 240 34 254 52 C264 68 284 84 294 96 C304 110 294 126 278 124 C262 122 248 114 236 108 C216 100 202 84 206 62Z" style="fill:var(--fell,#E8C49A)" stroke="#3B2A6B" stroke-width="4"/>
   <path d="M266 92 C278 86 296 92 298 106 C300 120 288 126 276 122 C264 118 256 100 266 92Z" fill="#F8E6CF" stroke="#3B2A6B" stroke-width="4"/>
   <ellipse cx="287" cy="102" rx="3.5" ry="5" fill="#3B2A6B" transform="rotate(30 287 102)"/>
   <path d="M274 116 Q282 121 290 116" fill="none" stroke="#3B2A6B" stroke-width="3.5"/>
   <path d="M232 46 L240 20 L250 54Z" style="fill:var(--fell,#E8C49A)" stroke="#3B2A6B" stroke-width="4"/>
   <path d="M238 44 L241 30 L246 48Z" fill="#C99A72"/>
   <path d="M220 44 C232 34 250 40 254 54 C255 62 250 66 246 64 C242 56 234 52 224 54 C220 52 218 48 220 44Z" fill="#9C6B4A" stroke="#3B2A6B" stroke-width="4"/>
   <ellipse cx="242" cy="74" rx="7" ry="9" fill="#3B2A6B"/>
   <circle cx="245" cy="70" r="2.8" fill="#fff"/>
   <g class="lid"><ellipse cx="242" cy="74" rx="10" ry="12" style="fill:var(--fell,#E8C49A)"/><path d="M233 74 Q242 83 251 74" fill="none" stroke="#3B2A6B" stroke-width="4"/><path d="M236 80 l-3 4 M242 83 v5 M248 80 l3 4" stroke="#3B2A6B" stroke-width="2.5"/></g>
   <circle cx="254" cy="94" r="7" fill="#FF9ECF" opacity=".55"/>
  </g>`
});
