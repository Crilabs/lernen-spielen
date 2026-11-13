// Igel – klein, Stachelkleid über dem Rücken, spitze Schnauze mit Knubbelnase.
Figuren.add({
  id:"igel", wort:"Igel", artikel:"der", groesse:0.55, fliegt:false, fell:"#F6E3C6",
  mund:[298,200], kopf:[244,140],
  svg:`
  <g class="leg b"><rect x="84" y="210" width="22" height="40" rx="10" style="fill:var(--fell,#F6E3C6)" stroke="#3B2A6B" stroke-width="4"/><rect x="84" y="210" width="22" height="40" rx="10" fill="#3B2A6B" opacity=".13"/><rect x="84" y="238" width="22" height="12" rx="6" fill="#9A7253" stroke="#3B2A6B" stroke-width="4"/></g>
  <g class="leg a"><rect x="170" y="210" width="22" height="40" rx="10" style="fill:var(--fell,#F6E3C6)" stroke="#3B2A6B" stroke-width="4"/><rect x="170" y="210" width="22" height="40" rx="10" fill="#3B2A6B" opacity=".13"/><rect x="170" y="238" width="22" height="12" rx="6" fill="#9A7253" stroke="#3B2A6B" stroke-width="4"/></g>
  <ellipse cx="150" cy="198" rx="92" ry="40" style="fill:var(--fell,#F6E3C6)" stroke="#3B2A6B" stroke-width="4"/>
  <g class="head" style="transform-origin:10% 70%">
   <path d="M190 152 C226 138 264 160 290 180 C302 188 302 202 288 204 C262 212 226 228 192 224Z" style="fill:var(--fell,#F6E3C6)"/>
   <path d="M196 150 C228 140 264 160 290 180 C302 188 302 202 288 204 C262 212 234 224 212 228" fill="none" stroke="#3B2A6B" stroke-width="4"/>
   <circle cx="298" cy="192" r="9" fill="#3B2A6B"/><circle cx="300" cy="188" r="3" fill="#fff"/>
   <path d="M268 208 Q278 214 288 206" fill="none" stroke="#3B2A6B" stroke-width="3.5"/>
   <ellipse cx="248" cy="174" rx="7" ry="9" fill="#3B2A6B"/>
   <circle cx="251" cy="170" r="2.6" fill="#fff"/>
   <g class="lid"><ellipse cx="248" cy="174" rx="10" ry="12" style="fill:var(--fell,#F6E3C6)"/><path d="M239 174 Q248 183 257 174" fill="none" stroke="#3B2A6B" stroke-width="4"/><path d="M242 180 l-3 4 M248 183 v5 M254 180 l3 4" stroke="#3B2A6B" stroke-width="2.5"/></g>
   <circle cx="262" cy="194" r="7" fill="#FF9ECF" opacity=".6"/>
  </g>
  <path d="M59 218 L37 214 L57 206 L36 200 L58 195 L39 185 L61 183 L44 171 L67 172 L53 158 L74 163 L64 147 L84 154 L77 137 L96 147 L93 129 L109 142 L110 124 L123 138 L127 121 L137 137 L145 120 L152 137 L163 122 L166 140 L181 127 L179 145 L197 134 L191 151 L211 143 L202 159 L223 153 L211 168 L233 166 L217 179 C196 206 120 222 59 218Z" fill="#C9A27E" stroke="#3B2A6B" stroke-width="4"/>
  <path d="M82 190 l-8 -10 M110 170 l-6 -12 M140 160 l0 -13 M170 166 l6 -12 M196 176 l9 -9 M100 200 l-6 -10 M128 190 l-2 -12 M158 188 l3 -12 M186 194 l7 -10" stroke="#A47E5E" stroke-width="3"/>
  <ellipse cx="120" cy="150" rx="36" ry="10" fill="#fff" opacity=".25"/>
  <g class="leg a"><rect x="104" y="214" width="22" height="38" rx="10" style="fill:var(--fell,#F6E3C6)" stroke="#3B2A6B" stroke-width="4"/><rect x="104" y="242" width="22" height="12" rx="6" fill="#B58A68" stroke="#3B2A6B" stroke-width="4"/></g>
  <g class="leg b"><rect x="192" y="214" width="22" height="38" rx="10" style="fill:var(--fell,#F6E3C6)" stroke="#3B2A6B" stroke-width="4"/><rect x="192" y="242" width="22" height="12" rx="6" fill="#B58A68" stroke="#3B2A6B" stroke-width="4"/></g>`
});
