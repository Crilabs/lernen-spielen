// Drache – freundlicher Minzdrache mit Fledermausflügeln (fliegt).
Figuren.add({
  id:"drache", wort:"Drache", artikel:"der", akk:"Drachen", dat:"Drachen", groesse:1.15, fliegt:true, fell:"#9FE3B8",
  mund:[300,104], kopf:[238,26],
  svg:`
  <g class="tail" style="transform-origin:100% 15%">
   <path d="M86 150 C54 148 36 164 30 186 C26 200 20 208 12 210 L16 224 C34 222 46 208 50 194 C56 176 70 170 90 176Z" style="fill:var(--fell,#9FE3B8)" stroke="#3B2A6B" stroke-width="4"/>
   <path d="M18 204 L2 226 L28 232 C22 222 20 212 18 204Z" fill="#FF9ECF" stroke="#3B2A6B" stroke-width="4"/>
   <path d="M46 166 L40 150 L56 158Z M34 182 L22 172 L38 172Z" fill="#FF9ECF" stroke="#3B2A6B" stroke-width="3.5"/>
  </g>
  <g class="wing" style="transform-origin:92% 96%">
   <path d="M192 128 C186 96 170 66 150 44 C142 66 126 74 106 76 C116 88 116 102 110 112 C126 108 140 112 148 124 C160 118 176 120 186 132Z" style="fill:var(--fell,#9FE3B8)" stroke="#3B2A6B" stroke-width="4"/>
   <path d="M192 128 C186 96 170 66 150 44 C142 66 126 74 106 76 C116 88 116 102 110 112 C126 108 140 112 148 124 C160 118 176 120 186 132Z" fill="#3B2A6B" opacity=".18"/>
  </g>
  <g class="leg b"><rect x="98" y="190" width="28" height="56" rx="13" style="fill:var(--fell,#9FE3B8)" stroke="#3B2A6B" stroke-width="4"/><rect x="98" y="190" width="28" height="56" rx="13" fill="#3B2A6B" opacity=".2"/><path d="M94 254 C92 242 100 236 112 236 C126 236 134 242 132 254Z" style="fill:var(--fell,#9FE3B8)" stroke="#3B2A6B" stroke-width="4"/><path d="M94 254 C92 242 100 236 112 236 C126 236 134 242 132 254Z" fill="#3B2A6B" opacity=".2"/></g>
  <g class="leg a"><rect x="180" y="190" width="28" height="56" rx="13" style="fill:var(--fell,#9FE3B8)" stroke="#3B2A6B" stroke-width="4"/><rect x="180" y="190" width="28" height="56" rx="13" fill="#3B2A6B" opacity=".2"/><path d="M176 254 C174 242 182 236 194 236 C208 236 216 242 214 254Z" style="fill:var(--fell,#9FE3B8)" stroke="#3B2A6B" stroke-width="4"/><path d="M176 254 C174 242 182 236 194 236 C208 236 216 242 214 254Z" fill="#3B2A6B" opacity=".2"/></g>
  <g fill="#FF9ECF" stroke="#3B2A6B" stroke-width="3.5">
   <path d="M84 138 L80 112 L102 126Z"/><path d="M106 126 L108 98 L128 120Z"/><path d="M132 120 L140 92 L156 118Z"/><path d="M160 120 L172 94 L182 122Z"/>
   <path d="M190 118 L200 92 L210 108Z"/><path d="M200 100 L214 76 L222 96Z"/>
  </g>
  <path d="M180 160 C190 126 200 106 210 94 L248 112 C238 128 232 150 228 178Z" style="fill:var(--fell,#9FE3B8)" stroke="#3B2A6B" stroke-width="4"/>
  <ellipse cx="152" cy="166" rx="82" ry="48" style="fill:var(--fell,#9FE3B8)" stroke="#3B2A6B" stroke-width="4"/>
  <path d="M110 200 C140 214 196 214 224 192 C228 178 226 168 222 160 C204 186 150 196 112 188Z" fill="#FFF1C2" stroke="#3B2A6B" stroke-width="3.5"/>
  <path d="M140 196 v10 M164 198 v12 M188 194 v12 M210 184 v10" stroke="#E8C98A" stroke-width="3"/>
  <ellipse cx="130" cy="146" rx="40" ry="16" fill="#fff" opacity=".35"/>
  <g class="wing" style="transform-origin:92% 96%">
   <path d="M174 140 C168 104 150 70 126 44 C118 70 98 80 74 82 C86 96 86 112 78 124 C96 118 114 124 122 138 C136 130 156 132 168 146Z" style="fill:var(--fell,#9FE3B8)" stroke="#3B2A6B" stroke-width="4"/>
   <path d="M168 140 C156 110 142 82 126 50 M168 140 C140 116 108 100 80 86 M168 140 C150 130 132 124 82 120" fill="none" stroke="#3B2A6B" stroke-width="3" opacity=".45"/>
   <path d="M128 74 C120 88 108 94 96 96" fill="none" stroke="#fff" stroke-width="5" opacity=".4"/>
  </g>
  <g class="leg a"><rect x="118" y="194" width="28" height="56" rx="13" style="fill:var(--fell,#9FE3B8)" stroke="#3B2A6B" stroke-width="4"/><path d="M112 254 C110 242 118 238 132 238 C146 238 154 242 152 254Z" style="fill:var(--fell,#9FE3B8)" stroke="#3B2A6B" stroke-width="4"/><path d="M122 254 v-5 M132 254 v-6 M142 254 v-5" stroke="#fff" stroke-width="4"/></g>
  <g class="leg b"><rect x="198" y="194" width="28" height="56" rx="13" style="fill:var(--fell,#9FE3B8)" stroke="#3B2A6B" stroke-width="4"/><path d="M192 254 C190 242 198 238 212 238 C226 238 234 242 232 254Z" style="fill:var(--fell,#9FE3B8)" stroke="#3B2A6B" stroke-width="4"/><path d="M202 254 v-5 M212 254 v-6 M222 254 v-5" stroke="#fff" stroke-width="4"/></g>
  <g class="head" style="transform-origin:20% 90%">
   <path d="M220 56 L214 28 L236 48Z" fill="#FFF1C2" stroke="#3B2A6B" stroke-width="4"/>
   <path d="M244 50 L254 22 L262 56Z" fill="#FFF1C2" stroke="#3B2A6B" stroke-width="4"/>
   <path d="M206 64 L190 52 L204 82Z" fill="#FF9ECF" stroke="#3B2A6B" stroke-width="3.5"/>
   <circle cx="236" cy="86" r="38" style="fill:var(--fell,#9FE3B8)" stroke="#3B2A6B" stroke-width="4"/>
   <ellipse cx="268" cy="102" rx="32" ry="23" style="fill:var(--fell,#9FE3B8)" stroke="#3B2A6B" stroke-width="4"/>
   <ellipse cx="268" cy="102" rx="30" ry="21" fill="#fff" opacity=".3"/>
   <ellipse cx="222" cy="62" rx="14" ry="6" fill="#fff" opacity=".35"/>
   <ellipse cx="280" cy="94" rx="3" ry="4" fill="#3B2A6B"/><ellipse cx="292" cy="98" rx="3" ry="4" fill="#3B2A6B"/>
   <path d="M256 114 Q272 126 290 114" fill="none" stroke="#3B2A6B" stroke-width="3.5"/>
   <ellipse cx="238" cy="80" rx="8" ry="10" fill="#3B2A6B"/>
   <circle cx="241" cy="76" r="3" fill="#fff"/>
   <g class="lid"><ellipse cx="238" cy="80" rx="11" ry="13" style="fill:var(--fell,#9FE3B8)"/><path d="M228 80 Q238 90 248 80" fill="none" stroke="#3B2A6B" stroke-width="4"/><path d="M231 86 l-3 4 M238 89 v5 M245 86 l3 4" stroke="#3B2A6B" stroke-width="2.5"/></g>
   <circle cx="250" cy="100" r="7" fill="#FF9ECF" opacity=".6"/>
  </g>`
});
