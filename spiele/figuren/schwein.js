// Schwein – rosa, Rüsselnase, Schlappohren, Ringelschwänzchen.
Figuren.add({
  id:"schwein", wort:"Schwein", artikel:"das", groesse:0.85, fliegt:false, fell:"#FFC2D6",
  mund:[304,134], kopf:[236,62],
  svg:`
  <g class="tail" style="transform-origin:100% 50%">
   <path d="M72 158 C56 162 42 154 44 142 C46 130 62 130 63 140 C64 148 52 150 50 142" fill="none" stroke="#3B2A6B" stroke-width="12"/>
   <path d="M72 158 C56 162 42 154 44 142 C46 130 62 130 63 140 C64 148 52 150 50 142" fill="none" style="stroke:var(--fell,#FFC2D6)" stroke-width="5"/>
  </g>
  <g class="leg b"><rect x="86" y="194" width="26" height="56" rx="12" style="fill:var(--fell,#FFC2D6)" stroke="#3B2A6B" stroke-width="4"/><rect x="86" y="194" width="26" height="56" rx="12" fill="#3B2A6B" opacity=".13"/><rect x="86" y="236" width="26" height="14" rx="6" fill="#C9708F" stroke="#3B2A6B" stroke-width="4"/><path d="M99 238 v10" stroke="#3B2A6B" stroke-width="3"/></g>
  <g class="leg a"><rect x="170" y="194" width="26" height="56" rx="12" style="fill:var(--fell,#FFC2D6)" stroke="#3B2A6B" stroke-width="4"/><rect x="170" y="194" width="26" height="56" rx="12" fill="#3B2A6B" opacity=".13"/><rect x="170" y="236" width="26" height="14" rx="6" fill="#C9708F" stroke="#3B2A6B" stroke-width="4"/><path d="M183 238 v10" stroke="#3B2A6B" stroke-width="3"/></g>
  <ellipse cx="150" cy="170" rx="90" ry="58" style="fill:var(--fell,#FFC2D6)" stroke="#3B2A6B" stroke-width="4"/>
  <ellipse cx="128" cy="146" rx="44" ry="18" fill="#fff" opacity=".35"/>
  <g class="leg a"><rect x="106" y="198" width="26" height="54" rx="12" style="fill:var(--fell,#FFC2D6)" stroke="#3B2A6B" stroke-width="4"/><rect x="106" y="240" width="26" height="14" rx="6" fill="#E08AA8" stroke="#3B2A6B" stroke-width="4"/><path d="M119 242 v10" stroke="#3B2A6B" stroke-width="3"/></g>
  <g class="leg b"><rect x="190" y="198" width="26" height="54" rx="12" style="fill:var(--fell,#FFC2D6)" stroke="#3B2A6B" stroke-width="4"/><rect x="190" y="240" width="26" height="14" rx="6" fill="#E08AA8" stroke="#3B2A6B" stroke-width="4"/><path d="M203 242 v10" stroke="#3B2A6B" stroke-width="3"/></g>
  <g class="head" style="transform-origin:15% 90%">
   <path d="M206 96 C196 72 206 56 222 58 C228 66 228 80 222 94Z" fill="#F2A3BF" stroke="#3B2A6B" stroke-width="4"/>
   <circle cx="238" cy="120" r="48" style="fill:var(--fell,#FFC2D6)" stroke="#3B2A6B" stroke-width="4"/>
   <ellipse cx="284" cy="132" rx="20" ry="17" fill="#FF9EBE" stroke="#3B2A6B" stroke-width="4"/>
   <ellipse cx="278" cy="132" rx="3.5" ry="5.5" fill="#3B2A6B"/><ellipse cx="291" cy="132" rx="3.5" ry="5.5" fill="#3B2A6B"/>
   <path d="M256 154 Q266 162 278 154" fill="none" stroke="#3B2A6B" stroke-width="3.5"/>
   <path d="M226 78 C230 58 252 52 264 62 C270 70 264 88 252 96 C248 86 240 80 226 78Z" style="fill:var(--fell,#FFC2D6)" stroke="#3B2A6B" stroke-width="4"/>
   <path d="M236 74 C242 64 254 62 258 68 C260 74 256 82 252 86 C248 80 244 76 236 74Z" fill="#FF9EBE"/>
   <ellipse cx="246" cy="110" rx="8" ry="10" fill="#3B2A6B"/>
   <circle cx="249" cy="106" r="3" fill="#fff"/>
   <g class="lid"><ellipse cx="246" cy="110" rx="11" ry="13" style="fill:var(--fell,#FFC2D6)"/><path d="M236 110 Q246 120 256 110" fill="none" stroke="#3B2A6B" stroke-width="4"/><path d="M239 116 l-3 4 M246 119 v5 M253 116 l3 4" stroke="#3B2A6B" stroke-width="2.5"/></g>
   <circle cx="254" cy="138" r="8" fill="#FF7FA8" opacity=".55"/>
  </g>`
});
