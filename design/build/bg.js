// Renders full-slide background PNGs (gradient, outlined hexagons/circles, helix) with Playwright
const {chromium}=require('playwright');
const hex=(cx,cy,r,st,op,w=1.5)=>{const p=[0,1,2,3,4,5].map(k=>{const t=Math.PI/3*k+Math.PI/6;return (cx+r*Math.cos(t)).toFixed(1)+','+(cy+r*Math.sin(t)).toFixed(1)}).join(' ');return `<polygon points="${p}" fill="none" stroke="${st}" stroke-opacity="${op}" stroke-width="${w}"/>`};
const circ=(cx,cy,r,st,op,w=2)=>`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${st}" stroke-opacity="${op}" stroke-width="${w}"/>`;
const helix=(o)=>{const n=Math.floor(o.L/o.step),items=[],made={};let defs='';
 const bead=h=>{const id=h.replace('#','');if(!made[id]){made[id]=1;defs+=`<radialGradient id="b${id}" cx=".35" cy=".32" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".3" stop-color="${h}"/><stop offset="1" stop-color="${h}" stop-opacity=".78"/></radialGradient>`}return `url(#b${id})`};
 for(let i=0;i<=n;i++){const x=o.r+i*o.step,a=2*Math.PI*o.turns*i/n,s=Math.sin(a),c=Math.cos(a),y1=o.H/2+o.A*s,y2=o.H/2-o.A*s;
  items.push({z:c,s:`<circle cx="${x}" cy="${y1}" r="${o.r*(.75+.25*c)}" fill="${bead(o.c1[i%o.c1.length])}"/>`});
  items.push({z:-c,s:`<circle cx="${x}" cy="${y2}" r="${o.r*(.75-.25*c)}" fill="${bead(o.c2[i%o.c2.length])}"/>`});
  if(i%3===0)items.push({z:0,s:`<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="${o.rung}" stroke-width="3.5" stroke-linecap="round"/>`})}
 items.sort((p,q)=>p.z-q.z);
 return `<g transform="translate(${o.cx-o.L/2},${o.cy-o.H/2}) rotate(${o.rot} ${o.L/2} ${o.H/2})"><defs>${defs}</defs>${items.map(t=>t.s).join('')}</g>`};
const HC={L:1000,H:250,A:88,turns:3,step:9,r:8.5,cx:760,cy:275,rot:-38,c1:['#1E4FFF','#1E4FFF','#7FC4FF','#FFFFFF','#00B8E6'],c2:['#1ED48A','#1ED48A','#A8E63D','#FFFFFF','#00C2A8'],rung:'#9DB8E8'};
const HD={L:1000,H:220,A:80,turns:2.8,step:9,r:8,cx:810,cy:340,rot:-38,c1:['#1E4FFF','#7FC4FF','#FFFFFF','#00B8E6'],c2:['#1ED48A','#A8E63D','#FFFFFF','#00C2A8'],rung:'#EAF3FF'};
const W='#FFFFFF';
const darkHex=hex(830,60,70,W,.35)+hex(700,110,40,W,.35)+hex(930,150,32,W,.3);
const grad=(a,b)=>`linear-gradient(135deg,${a},${b})`;
const L={
 cover:{bg:'#FFFFFF',svg:circ(760,270,330,'#BFDCFF',1,2)+circ(537,457,17,'#12B873',1,2.5)+circ(430,120,9,'#1E4FFF',1,2.5)+hex(878,462,34,'#A8E63D',1,2.5)+helix(HC)},
 white:{bg:'#FFFFFF',svg:circ(880,30,130,'#BFDCFF',1,2)+hex(800,62,26,'#BFDCFF',1,2)},
 div1:{bg:grad('#2B6BFF','#0A2A8A'),svg:darkHex+helix(HD)},
 div2:{bg:grad('#00B8E6','#1E4FFF'),svg:darkHex+helix(HD)},
 div3:{bg:grad('#1ED48A','#0A8FA8'),svg:darkHex+helix(HD)},
 div4:{bg:grad('#0A2A8A','#1E4FFF'),svg:darkHex+helix(HD)},
 blueA:{bg:grad('#2B6BFF','#0A2A8A'),svg:darkHex},
 blueB:{bg:grad('#0A2A8A','#1E4FFF'),svg:darkHex},
};
(async()=>{const b=await chromium.launch();
for(const [k,v] of Object.entries(L)){const pg=await b.newPage({viewport:{width:960,height:540},deviceScaleFactor:2});
await pg.setContent(`<body style="margin:0"><div style="width:960px;height:540px;background:${v.bg};position:relative;overflow:hidden"><svg width="960" height="540" style="position:absolute;left:0;top:0">${v.svg}</svg></div></body>`);
await pg.screenshot({path:`bg_${k}.png`});await pg.close()}
await b.close()})();
