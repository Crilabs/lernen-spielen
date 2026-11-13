// Frosch – sitzender Frosch mit Glupschaugen (fliegt nicht).
Figuren.add({
  id:"frosch", wort:"Frosch", artikel:"der", groesse:0.55, fliegt:false, fell:"#9BE07F",
  mund:[278,138], kopf:[214,60],
  svg:`
  <g class="leg b" style="transform-origin:60% 10%"><path d="M76 222 C70 196 92 178 118 184 C140 190 146 214 136 230 C150 236 160 242 160 250 C160 254 156 254 152 254 L92 254 C80 254 72 240 76 222Z" style="fill:var(--fell,#9BE07F)" stroke="#3B2A6B" stroke-width="4"/><path d="M76 222 C70 196 92 178 118 184 C140 190 146 214 136 230 C150 236 160 242 160 250 C160 254 156 254 152 254 L92 254 C80 254 72 240 76 222Z" fill="#3B2A6B" opacity=".2"/></g>
  <g class="leg a" style="transform-origin:50% 5%"><path d="M232 190 C244 188 250 196 250 206 L250 242 C250 246 236 246 236 242 L236 214 C232 206 228 198 232 190Z" style="fill:var(--fell,#9BE07F)" stroke="#3B2A6B" stroke-width="4"/><path d="M232 190 C244 188 250 196 250 206 L250 242 C250 246 236 246 236 242 L236 214 C232 206 228 198 232 190Z" fill="#3B2A6B" opacity=".2"/><g style="fill:var(--fell,#9BE07F)" stroke="#3B2A6B" stroke-width="3.5"><ellipse cx="240" cy="249" rx="7" ry="5"/><ellipse cx="252" cy="249" rx="7" ry="5"/><ellipse cx="263" cy="249" rx="6" ry="5"/></g><g fill="#3B2A6B" opacity=".2"><ellipse cx="240" cy="249" rx="7" ry="5"/><ellipse cx="252" cy="249" rx="7" ry="5"/><ellipse cx="263" cy="249" rx="6" ry="5"/></g></g>
  <path d="M84 214 C80 172 116 142 160 142 C206 142 236 176 236 210 C236 236 214 252 182 252 L120 252 C98 252 86 236 84 214Z" style="fill:var(--fell,#9BE07F)" stroke="#3B2A6B" stroke-width="4"/>
  <path d="M168 206 C176 186 206 182 222 196 C232 214 222 244 194 246 C172 246 162 226 168 206Z" fill="#EEFCD8" stroke="#3B2A6B" stroke-width="3.5"/>
  <g class="leg a" style="transform-origin:50% 8%"><path d="M96 196 C108 172 146 172 158 196 C166 214 158 232 146 238 C164 240 182 244 184 250 C184 254 180 254 176 254 L112 254 C96 254 86 240 88 224 C88 212 90 204 96 196Z" style="fill:var(--fell,#9BE07F)" stroke="#3B2A6B" stroke-width="4"/><path d="M158 254 C160 248 166 246 172 248 M146 254 C148 248 152 246 158 247" fill="none" stroke="#3B2A6B" stroke-width="3" opacity=".5"/><ellipse cx="118" cy="200" rx="14" ry="7" fill="#fff" opacity=".35"/></g>
  <g class="leg b" style="transform-origin:50% 5%"><path d="M212 190 C226 186 234 196 234 208 L234 244 C234 248 216 248 216 244 L216 216 C210 208 206 196 212 190Z" style="fill:var(--fell,#9BE07F)" stroke="#3B2A6B" stroke-width="4"/><g style="fill:var(--fell,#9BE07F)" stroke="#3B2A6B" stroke-width="3.5"><ellipse cx="220" cy="249" rx="7" ry="5"/><ellipse cx="232" cy="249" rx="7" ry="5"/><ellipse cx="243" cy="249" rx="6" ry="5"/></g></g>
  <g class="head" style="transform-origin:28% 92%">
   <circle cx="186" cy="94" r="28" style="fill:var(--fell,#9BE07F)" stroke="#3B2A6B" stroke-width="4"/>
   <ellipse cx="208" cy="138" rx="72" ry="46" style="fill:var(--fell,#9BE07F)" stroke="#3B2A6B" stroke-width="4"/>
   <circle cx="240" cy="94" r="28" style="fill:var(--fell,#9BE07F)" stroke="#3B2A6B" stroke-width="4"/>
   <path d="M160 108 C176 116 198 116 212 108" style="fill:var(--fell,#9BE07F)"/>
   <circle cx="188" cy="92" r="18" fill="#fff" stroke="#3B2A6B" stroke-width="3.5"/>
   <circle cx="242" cy="92" r="18" fill="#fff" stroke="#3B2A6B" stroke-width="3.5"/>
   <ellipse cx="193" cy="93" rx="9" ry="11" fill="#3B2A6B"/><circle cx="196" cy="88" r="3.5" fill="#fff"/>
   <ellipse cx="247" cy="93" rx="9" ry="11" fill="#3B2A6B"/><circle cx="250" cy="88" r="3.5" fill="#fff"/>
   <g class="lid">
    <circle cx="188" cy="92" r="21" style="fill:var(--fell,#9BE07F)"/><circle cx="242" cy="92" r="21" style="fill:var(--fell,#9BE07F)"/>
    <path d="M172 92 Q188 106 204 92 M226 92 Q242 106 258 92" fill="none" stroke="#3B2A6B" stroke-width="4"/>
    <path d="M177 99 l-3 4 M188 103 v5 M199 99 l3 4 M231 99 l-3 4 M242 103 v5 M253 99 l3 4" stroke="#3B2A6B" stroke-width="2.5"/>
   </g>
   <circle cx="262" cy="118" r="2.5" fill="#3B2A6B"/><circle cx="272" cy="120" r="2.5" fill="#3B2A6B"/>
   <path d="M196 140 Q236 168 276 136" fill="none" stroke="#3B2A6B" stroke-width="4"/>
   <path d="M196 140 q-4 -2 -6 -6 M276 136 q4 -1 5 -5" fill="none" stroke="#3B2A6B" stroke-width="3"/>
   <circle cx="178" cy="136" r="9" fill="#FF9ECF" opacity=".55"/><circle cx="262" cy="148" r="7" fill="#FF9ECF" opacity=".5"/>
  </g>`
});
