// Mond – schlafender Sichelmond mit drei kleinen Sternen. Schwebt am Himmel.
(function(){
  const stern=(x,y,r)=>{let d="";for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,rr=i%2?r*.45:r;d+=(i?"L":"M")+(x+rr*Math.cos(a)).toFixed(1)+" "+(y+rr*Math.sin(a)).toFixed(1);}
    return `<path d="${d}Z" fill="#FFE27A" stroke="#3B2A6B" stroke-width="3"/>`;};
  Figuren.ding({
    id:"mond", wort:"Mond", artikel:"der", w:110, h:110, boden:108, himmel:true,
    svg:`
    <path d="M62 8 A47 47 0 1 0 62 102 A62 62 0 0 1 62 8Z" fill="#FFD95A" stroke="#3B2A6B" stroke-width="4"/>
    <path d="M32 22 Q20 32 18 44" fill="none" stroke="#fff" stroke-width="4" opacity=".55"/>
    <path d="M20 47 Q26 53 32 47" fill="none" stroke="#3B2A6B" stroke-width="3.5"/>
    <path d="M22 66 Q28 72 34 66" fill="none" stroke="#3B2A6B" stroke-width="3.5"/>
    <circle cx="31" cy="58" r="4.5" fill="#FF9ECF" opacity=".6"/>
    ${stern(88,20,10)}${stern(98,58,7)}${stern(82,92,9)}`
  });
})();
