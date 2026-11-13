// Einhorn – Musterfigur (aus der Probe). Neue Figuren an diesem Aufbau orientieren.
Figuren.add({
  id:"einhorn", wort:"Einhorn", artikel:"das", groesse:1, fliegt:false, fell:"#ffffff",
  mund:[284,112], kopf:[250,20],
  svg:`
  <g class="tail" style="transform-origin:100% 20%">
   <path d="M88 150 C60 140 46 160 52 185 C56 200 48 214 38 220 C62 222 76 204 72 186 C70 172 78 162 92 160Z" fill="#FF9ECF" stroke="#3B2A6B" stroke-width="4"/>
   <path d="M90 156 C72 160 66 176 70 192 C74 206 70 216 62 224 C84 220 90 202 86 188 C84 176 90 168 98 166Z" fill="#B49CFF" stroke="#3B2A6B" stroke-width="4"/>
  </g>
  <g class="leg b"><rect x="104" y="186" width="22" height="62" rx="11" fill="#E4DCFA" stroke="#3B2A6B" stroke-width="4"/><rect x="104" y="236" width="22" height="14" rx="6" fill="#9C86E8" stroke="#3B2A6B" stroke-width="4"/></g>
  <g class="leg a"><rect x="182" y="186" width="22" height="62" rx="11" fill="#E4DCFA" stroke="#3B2A6B" stroke-width="4"/><rect x="182" y="236" width="22" height="14" rx="6" fill="#9C86E8" stroke="#3B2A6B" stroke-width="4"/></g>
  <path d="M180 160 C192 124 204 104 214 92 L246 112 C236 128 230 150 226 176Z" style="fill:var(--fell,#fff)" stroke="#3B2A6B" stroke-width="4"/>
  <ellipse cx="155" cy="168" rx="78" ry="48" style="fill:var(--fell,#fff)" stroke="#3B2A6B" stroke-width="4"/>
  <ellipse cx="135" cy="150" rx="40" ry="18" fill="#fff" opacity=".35"/>
  <g class="leg a"><rect x="122" y="190" width="22" height="62" rx="11" style="fill:var(--fell,#fff)" stroke="#3B2A6B" stroke-width="4"/><rect x="122" y="240" width="22" height="14" rx="6" fill="#B49CFF" stroke="#3B2A6B" stroke-width="4"/></g>
  <g class="leg b"><rect x="200" y="190" width="22" height="62" rx="11" style="fill:var(--fell,#fff)" stroke="#3B2A6B" stroke-width="4"/><rect x="200" y="240" width="22" height="14" rx="6" fill="#B49CFF" stroke="#3B2A6B" stroke-width="4"/></g>
  <g class="head" style="transform-origin:20% 90%">
   <circle cx="236" cy="86" r="38" style="fill:var(--fell,#fff)" stroke="#3B2A6B" stroke-width="4"/>
   <ellipse cx="266" cy="104" rx="30" ry="23" fill="#FFE3F1" stroke="#3B2A6B" stroke-width="4"/>
   <circle cx="272" cy="100" r="3" fill="#3B2A6B"/><circle cx="284" cy="104" r="3" fill="#3B2A6B"/>
   <path d="M258 116 Q268 124 280 116" fill="none" stroke="#3B2A6B" stroke-width="3.5"/>
   <path d="M216 56 L210 30 L232 50Z" style="fill:var(--fell,#fff)" stroke="#3B2A6B" stroke-width="4"/>
   <path d="M216 50 L213 38 L224 48Z" fill="#FF9ECF"/>
   <path d="M238 52 L262 14 L252 58Z" fill="#FFD95A" stroke="#3B2A6B" stroke-width="4"/>
   <path d="M243 48 L254 44 M247 38 L257 34 M252 29 L259 26" stroke="#E0A42A" stroke-width="3"/>
   <g stroke="#3B2A6B" stroke-width="4">
    <circle cx="212" cy="62" r="15" fill="#FF9ECF"/>
    <circle cx="202" cy="84" r="15" fill="#B49CFF"/>
    <circle cx="200" cy="106" r="14" fill="#8FD3FF"/>
    <circle cx="202" cy="128" r="13" fill="#FF9ECF"/>
    <circle cx="226" cy="52" r="12" fill="#8FD3FF"/>
   </g>
   <ellipse cx="240" cy="82" rx="8" ry="10" fill="#3B2A6B"/>
   <circle cx="243" cy="78" r="3" fill="#fff"/>
   <g class="lid"><ellipse cx="240" cy="82" rx="11" ry="13" style="fill:var(--fell,#fff)"/><path d="M230 82 Q240 92 250 82" fill="none" stroke="#3B2A6B" stroke-width="4"/><path d="M233 88 l-3 4 M240 91 v5 M247 88 l3 4" stroke="#3B2A6B" stroke-width="2.5"/></g>
   <circle cx="250" cy="100" r="7" fill="#FF9ECF" opacity=".6"/>
  </g>`
});
