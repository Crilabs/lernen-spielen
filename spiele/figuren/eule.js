// Eule – aufrechte Eule mit großen Augen und Federohren (fliegt).
Figuren.add({
  id:"eule", wort:"Eule", artikel:"die", groesse:0.6, fliegt:true, fell:"#C7A6E8",
  mund:[186,134], kopf:[172,30],
  svg:`
  <g class="leg b"><rect x="174" y="222" width="14" height="22" rx="7" fill="#F2A23C" stroke="#3B2A6B" stroke-width="4"/><g fill="#F2A23C" stroke="#3B2A6B" stroke-width="3.5"><ellipse cx="172" cy="249" rx="6" ry="5"/><ellipse cx="182" cy="249" rx="6" ry="5"/><ellipse cx="192" cy="249" rx="6" ry="5"/></g></g>
  <g class="leg a"><rect x="136" y="222" width="14" height="22" rx="7" fill="#FFB347" stroke="#3B2A6B" stroke-width="4"/><g fill="#FFB347" stroke="#3B2A6B" stroke-width="3.5"><ellipse cx="134" cy="249" rx="6" ry="5"/><ellipse cx="144" cy="249" rx="6" ry="5"/><ellipse cx="154" cy="249" rx="6" ry="5"/></g></g>
  <g class="tail" style="transform-origin:100% 20%"><path d="M100 198 C82 214 72 230 78 242 C92 238 106 228 116 214Z" style="fill:var(--fell,#C7A6E8)" stroke="#3B2A6B" stroke-width="4"/></g>
  <ellipse cx="160" cy="170" rx="72" ry="70" style="fill:var(--fell,#C7A6E8)" stroke="#3B2A6B" stroke-width="4"/>
  <path d="M146 150 C176 144 214 158 218 194 C220 220 196 236 168 236 C140 236 126 214 128 190 C130 170 136 154 146 150Z" fill="#F3E8FF" stroke="#3B2A6B" stroke-width="3.5"/>
  <path d="M156 172 q6 6 12 0 M178 170 q6 6 12 0 M196 180 q5 5 10 0 M146 192 q6 6 12 0 M168 192 q6 6 12 0 M190 196 q6 6 12 0 M156 212 q6 6 12 0 M180 214 q6 6 12 0" fill="none" stroke="#B48FD8" stroke-width="3"/>
  <g class="head" style="transform-origin:50% 96%">
   <path d="M118 62 L102 18 L146 46Z" style="fill:var(--fell,#C7A6E8)" stroke="#3B2A6B" stroke-width="4"/>
   <path d="M118 52 L110 32 L132 46Z" fill="#9E7CC8"/>
   <path d="M206 44 L236 12 L234 64Z" style="fill:var(--fell,#C7A6E8)" stroke="#3B2A6B" stroke-width="4"/>
   <path d="M214 46 L230 28 L230 54Z" fill="#9E7CC8"/>
   <ellipse cx="172" cy="94" rx="72" ry="60" style="fill:var(--fell,#C7A6E8)" stroke="#3B2A6B" stroke-width="4"/>
   <ellipse cx="146" cy="62" rx="26" ry="10" fill="#fff" opacity=".3"/>
   <circle cx="148" cy="98" r="27" fill="#FFF6E2" stroke="#3B2A6B" stroke-width="4"/>
   <circle cx="204" cy="98" r="27" fill="#FFF6E2" stroke="#3B2A6B" stroke-width="4"/>
   <ellipse cx="154" cy="98" rx="12" ry="14" fill="#3B2A6B"/><circle cx="158" cy="92" r="4.5" fill="#fff"/><circle cx="150" cy="104" r="2" fill="#fff"/>
   <ellipse cx="210" cy="98" rx="12" ry="14" fill="#3B2A6B"/><circle cx="214" cy="92" r="4.5" fill="#fff"/><circle cx="206" cy="104" r="2" fill="#fff"/>
   <path d="M174 116 C178 114 190 114 194 116 C194 124 188 132 184 136 C180 132 174 124 174 116Z" fill="#FFA53C" stroke="#3B2A6B" stroke-width="3.5"/>
   <g class="lid">
    <circle cx="148" cy="98" r="30" style="fill:var(--fell,#C7A6E8)"/><circle cx="204" cy="98" r="30" style="fill:var(--fell,#C7A6E8)"/>
    <path d="M128 98 Q148 114 168 98 M184 98 Q204 114 224 98" fill="none" stroke="#3B2A6B" stroke-width="4"/>
    <path d="M134 106 l-4 5 M148 111 v6 M162 106 l4 5 M190 106 l-4 5 M204 111 v6 M218 106 l4 5" stroke="#3B2A6B" stroke-width="2.5"/>
   </g>
   <circle cx="126" cy="128" r="8" fill="#FF9ECF" opacity=".55"/><circle cx="228" cy="128" r="8" fill="#FF9ECF" opacity=".55"/>
  </g>
  <g class="wing" style="transform-origin:60% 6%">
   <path d="M118 140 C96 150 86 180 92 206 C96 222 108 230 118 226 C114 218 120 212 126 214 C124 206 130 200 136 202 C140 184 138 160 130 146 C126 140 122 138 118 140Z" style="fill:var(--fell,#C7A6E8)" stroke="#3B2A6B" stroke-width="4"/>
   <path d="M114 160 C108 176 108 194 112 208 M126 162 C122 176 122 190 124 200" fill="none" stroke="#3B2A6B" stroke-width="3" opacity=".4"/>
  </g>`
});
