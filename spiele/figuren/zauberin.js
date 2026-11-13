// Die Zauberin – Spielleiterin im Großbuchstaben-Zauberer. Kommt nie in Sätzen vor.
// Frontal (schaut das Kind an), viewBox 0 0 300 460, Füße enden bei y = 452.
// Zustände als Klasse am <svg class="zauberin">: zaubert | liest | gruebelt | erwartungsvoll | geht | zeigt
// Drehpunkte in viewBox-Koordinaten (transform-box: view-box).
(function(){
  const INK="#3B2A6B", AERMEL="#A994F5", HAUT="#FFE1CC", HAAR="#C8794A", HAAR_D="#A35F36", UMHANG="#8F73E6", UMHANG_H="#B59CFF", HUT="#6A50C4", GOLD="#FFD95A", ROSA="#FF8ACB";
  const stern=(x,y,r,f=GOLD,sw=2.5)=>{ let d=""; for(let i=0;i<10;i++){ const a=i*Math.PI/5-Math.PI/2, rr=i%2?r*.45:r; d+=(i?"L":"M")+(x+rr*Math.cos(a)).toFixed(1)+" "+(y+rr*Math.sin(a)).toFixed(1); }
    return `<path d="${d}Z" fill="${f}" stroke="${INK}" stroke-width="${sw}"/>`; };
  const zopf=(x)=>`<g stroke="${INK}" stroke-width="4">${[0,1,2,3].map(i=>`<ellipse cx="${x}" cy="${206+i*24}" rx="${15-i}" ry="15" fill="${i%2?HAAR_D:HAAR}"/>`).join("")}
    <path d="M${x-12} ${300} l12 -8 l12 8 l-12 8Z" fill="${ROSA}"/></g>`;

  const svg = `
  <g class="zb-ganz">
   <ellipse cx="150" cy="452" rx="92" ry="9" fill="#000" opacity=".12"/>
   <!-- Zöpfe hinten -->
   ${zopf(92)}${zopf(208)}
   <!-- Schuhe -->
   <g stroke="${INK}" stroke-width="4"><ellipse cx="122" cy="444" rx="22" ry="11" fill="${ROSA}"/><ellipse cx="178" cy="444" rx="22" ry="11" fill="${ROSA}"/></g>
   <!-- Umhang -->
   <path d="M150 212 C126 214 104 226 96 246 C82 300 66 380 56 430 Q150 450 244 430 C234 380 218 300 204 246 C196 226 174 214 150 212Z" fill="${UMHANG}" stroke="${INK}" stroke-width="4"/>
   <path d="M150 222 C140 300 134 380 132 440 M150 222 C160 300 166 380 168 440" fill="none" stroke="${INK}" stroke-width="3" opacity=".25"/>
   ${stern(104,330,9)}${stern(196,350,8)}${stern(150,400,10)}${stern(90,410,7)}${stern(212,412,7)}
   <path d="M116 220 Q150 250 184 220 Q172 236 150 240 Q128 236 116 220Z" fill="${UMHANG_H}" stroke="${INK}" stroke-width="4"/>
   <!-- Kopf -->
   <g class="zb-kopf">
    <path d="M96 150 C92 110 120 92 150 92 C180 92 208 110 204 150 L206 196 L94 196Z" fill="${HAAR}" stroke="${INK}" stroke-width="4"/>
    <circle cx="150" cy="160" r="52" fill="${HAUT}" stroke="${INK}" stroke-width="4"/>
    <path d="M100 146 C104 118 128 106 150 106 C172 106 196 118 200 146 C186 130 170 126 158 134 C150 124 128 124 116 138 C110 140 104 142 100 146Z" fill="${HAAR}" stroke="${INK}" stroke-width="4"/>
    <!-- Augen -->
    <g stroke="${INK}" stroke-width="3.5"><ellipse cx="128" cy="164" rx="13" ry="15" fill="#fff"/><ellipse cx="172" cy="164" rx="13" ry="15" fill="#fff"/></g>
    <g class="zb-pupillen"><circle cx="128" cy="166" r="8" fill="${INK}"/><circle cx="172" cy="166" r="8" fill="${INK}"/><circle cx="131" cy="162" r="3" fill="#fff"/><circle cx="175" cy="162" r="3" fill="#fff"/></g>
    <g class="zb-lid"><ellipse cx="128" cy="164" rx="15" ry="17" fill="${HAUT}"/><ellipse cx="172" cy="164" rx="15" ry="17" fill="${HAUT}"/>
      <path d="M115 166 Q128 176 141 166 M159 166 Q172 176 185 166" fill="none" stroke="${INK}" stroke-width="3.5"/></g>
    <g class="zb-brauen" fill="none" stroke="${HAAR_D}" stroke-width="5"><path class="zb-braue-l" d="M116 142 Q128 136 140 141"/><path class="zb-braue-r" d="M160 141 Q172 136 184 142"/></g>
    <circle cx="114" cy="186" r="8" fill="${ROSA}" opacity=".5"/><circle cx="186" cy="186" r="8" fill="${ROSA}" opacity=".5"/>
    <path class="zb-mund" d="M136 190 Q150 202 164 190" fill="none" stroke="${INK}" stroke-width="4"/>
    <ellipse class="zb-mund-o" cx="150" cy="194" rx="6" ry="7" fill="#C24A6A" stroke="${INK}" stroke-width="3"/>
    <!-- Hut -->
    <path d="M96 110 C110 70 140 34 176 16 C184 34 196 44 214 44 C196 58 196 86 204 110Z" fill="${HUT}" stroke="${INK}" stroke-width="4"/>
    <path d="M100 100 C130 92 170 92 202 100 L204 110 C170 102 130 102 98 110Z" fill="${GOLD}" stroke="${INK}" stroke-width="3"/>
    <ellipse cx="150" cy="112" rx="82" ry="15" fill="${HUT}" stroke="${INK}" stroke-width="4"/>
    ${stern(150,62,11)}${stern(184,84,6)}${stern(122,84,5)}${stern(214,44,8)}
   </g>
   <!-- freier Arm (Bildseite links): beim Grübeln die Hand am Kinn -->
   <g class="zb-arm-frei">
    <path d="M104 236 C92 262 86 292 84 318 L106 322 C108 296 114 270 122 248Z" fill="${AERMEL}" stroke="${INK}" stroke-width="4"/>
    <circle cx="94" cy="330" r="13" fill="${HAUT}" stroke="${INK}" stroke-width="4"/>
   </g>
   <!-- Arm mit Zauberstab (Bildseite rechts) -->
   <g class="zb-arm-stab">
    <path d="M196 236 C208 262 214 288 216 314 L194 318 C192 294 186 270 178 248Z" fill="${AERMEL}" stroke="${INK}" stroke-width="4"/>
    <g class="zb-stab"><path d="M206 322 L252 238" stroke="${INK}" stroke-width="11"/><path d="M206 322 L252 238" stroke="#E9C2FF" stroke-width="5"/>
    ${stern(255,232,17,GOLD,3.5)}
    <g class="zb-funken">${stern(282,212,7,"#fff",2)}${stern(236,206,6,"#fff",2)}${stern(276,252,5,"#fff",2)}</g></g>
    <circle cx="206" cy="326" r="13" fill="${HAUT}" stroke="${INK}" stroke-width="4"/>
   </g>
  </g>`;

  const css = `
.zauberin{display:block;width:100%;height:auto;overflow:visible}
.zauberin *{stroke-linejoin:round;stroke-linecap:round}
.zauberin .zb-ganz,.zauberin .zb-stab,.zauberin .zb-kopf,.zauberin .zb-arm-frei,.zauberin .zb-arm-stab,.zauberin .zb-pupillen,.zauberin .zb-brauen,.zauberin .zb-lid,.zauberin .zb-funken path,.zauberin .zb-braue-l,.zauberin .zb-braue-r{transform-box:view-box}
.zauberin .zb-ganz{transform-origin:150px 452px}
.zauberin .zb-kopf{transform-origin:150px 214px;transition:transform .5s ease-in-out}
.zauberin .zb-arm-frei{transform-origin:110px 240px;transition:transform .45s ease-in-out}
.zauberin .zb-arm-stab{transform-origin:190px 240px;transition:transform .45s ease-in-out}
.zauberin .zb-pupillen{transition:transform .35s ease-in-out}
.zauberin .zb-stab{transform-origin:206px 322px;transition:transform .45s ease-in-out}
.zauberin .zb-brauen{transition:transform .35s}
.zauberin .zb-braue-l{transform-origin:128px 140px;transition:transform .35s}
.zauberin .zb-lid{transform-origin:150px 164px;transform:scaleY(0);animation:zb-blink 4.2s infinite}
.zauberin .zb-mund-o{opacity:0}
.zauberin .zb-funken{opacity:0}
@keyframes zb-blink{0%,93%,100%{transform:scaleY(0)}96%{transform:scaleY(1)}}
@keyframes zb-schwing{from{transform:rotate(-34deg)}to{transform:rotate(12deg)}}
@keyframes zb-funkeln{0%,100%{opacity:.2;transform:scale(.6)}50%{opacity:1;transform:scale(1.15)}}
@keyframes zb-wippen{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes zb-neigen{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}
@keyframes zb-scan{from{transform:rotate(-9deg) translateY(5px)}to{transform:rotate(9deg) translateY(5px)}}
@keyframes zb-scan-aug{from{transform:translate(-6px,6px)}to{transform:translate(6px,6px)}}
@keyframes zb-kratzen{0%,100%{transform:rotate(-127deg)}50%{transform:rotate(-121deg)}}
@keyframes zb-watscheln{0%,100%{transform:rotate(-3deg) translateY(0)}50%{transform:rotate(3deg) translateY(-6px)}}
/* zaubert: schaut auf den Satz, schwingt den Stab */
.zauberin.zaubert .zb-pupillen{transform:translate(0,6px)}
.zauberin.zaubert .zb-kopf{transform:rotate(-3deg) translateY(4px)}
.zauberin.zaubert .zb-arm-stab{animation:zb-schwing .42s ease-in-out infinite alternate}
.zauberin.zaubert .zb-funken{opacity:1}
.zauberin.zaubert .zb-funken path{transform-origin:258px 230px;animation:zb-funkeln .5s ease-in-out infinite}
.zauberin.zaubert .zb-funken path:nth-child(2){animation-delay:.17s}.zauberin.zaubert .zb-funken path:nth-child(3){animation-delay:.33s}
.zauberin.zaubert .zb-mund{opacity:0}.zauberin.zaubert .zb-mund-o{opacity:1}
/* erwartungsvoll: schaut das Kind an, Brauen hoch, wiegt den Kopf */
.zauberin.erwartungsvoll .zb-brauen{transform:translateY(-6px)}
.zauberin.erwartungsvoll .zb-kopf{animation:zb-neigen 3.2s ease-in-out infinite}
.zauberin.erwartungsvoll .zb-ganz{animation:zb-wippen 1.6s ease-in-out infinite}
/* liest: Kopf und Blick wandern über den Satz, Mund rund */
.zauberin.liest .zb-kopf{animation:zb-scan var(--lesezeit,4s) linear forwards}
.zauberin.liest .zb-pupillen{animation:zb-scan-aug var(--lesezeit,4s) linear forwards}
.zauberin.liest .zb-mund{opacity:0}.zauberin.liest .zb-mund-o{opacity:1}
.zauberin.liest .zb-arm-frei{transform:rotate(-24deg)}
/* grübelt: Hand am Kinn, eine Braue hoch */
.zauberin.gruebelt .zb-arm-frei{animation:zb-kratzen .3s ease-in-out infinite}
.zauberin.gruebelt .zb-kopf{transform:rotate(7deg)}
.zauberin.gruebelt .zb-braue-l{transform:translateY(-7px) rotate(-10deg)}
.zauberin.gruebelt .zb-pupillen{transform:translate(4px,-3px)}
.zauberin.gruebelt .zb-mund{opacity:0}.zauberin.gruebelt .zb-mund-o{opacity:1}
/* zeigt: Stab nach unten auf den Satz */
.zauberin.zeigt .zb-arm-stab{transform:rotate(-38deg)}
.zauberin.zeigt .zb-stab{transform:rotate(158deg)}
.zauberin.zeigt .zb-pupillen{transform:translate(0,6px)}
.zauberin.zeigt .zb-funken{opacity:1}
/* geht: watschelt zur Seite */
.zauberin.geht .zb-ganz{animation:zb-watscheln .36s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){.zauberin *{animation:none!important}}`;
  if(!document.getElementById("zauberin-css")){
    const st=document.createElement("style"); st.id="zauberin-css"; st.textContent=css; document.head.appendChild(st);
  }
  window.Zauberin = {
    svg: () => `<svg class="zauberin" viewBox="0 0 300 460" aria-label="Zauberin">${svg}</svg>`,
    // Zustand setzen (nur einer gleichzeitig)
    zustand(el, z){ el.classList.remove("zaubert","liest","gruebelt","erwartungsvoll","geht","zeigt"); if(z) el.classList.add(z); }
  };
})();
