/* Dependency-free animated spider-web / neural mesh. Decorative only, no network calls or tracking. */
(() => {
'use strict';
const canvas = document.getElementById('spider-web');
if (!canvas || !canvas.getContext) return;
const ctx = canvas.getContext('2d', {alpha: true});
if (!ctx) return;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let width=0,height=0,dpr=1,points=[],raf=0,time=0,shown=!document.hidden;
let target={x:-2000,y:-2000,active:false},cursor={x:-2000,y:-2000};
let ripples=[],last=0;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const coords=(i,cols,spacing)=>({x:(i%cols)*spacing,y:Math.floor(i/cols)*spacing});
function size(){
 width=innerWidth;height=innerHeight;dpr=Math.min(devicePixelRatio||1,1.5);
 canvas.width=Math.ceil(width*dpr);canvas.height=Math.ceil(height*dpr);
 ctx.setTransform(dpr,0,0,dpr,0,0);
 const spacing=width<650?107:width<1150?125:145;
 const cols=Math.ceil(width/spacing)+1,rows=Math.ceil(height/spacing)+1;
 points=[];
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
  const k=j*cols+i, seed=(k*13.13)%1;
  const bx=i*spacing+Math.sin(k*3.7)*spacing*.26,by=j*spacing+Math.cos(k*2.3)*spacing*.26;
  points.push({bx,by,x:bx,y:by,phase:seed*6.28,weight:.55+seed*.55});
 }
 if(points.length>168)points=points.filter((_,i)=>i%2===0);
 draw(0,true);
}
function line(ax,ay,bx,by,color,alpha,lw){
 ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.strokeStyle=color.replace('ALPHA',alpha.toFixed(3));ctx.lineWidth=lw;ctx.stroke();
}
function cursorWeb(t){
 if(!target.active || cursor.x<0)return;
 const px=cursor.x,py=cursor.y;
 const rings=[32,60,96],sides=11;
 ctx.save();ctx.lineCap='round';
 for(let j=0;j<rings.length;j++){
  const r=rings[j],alpha=.09+j*.038;
  ctx.beginPath();
  for(let k=0;k<=sides;k++){
   const a=(k%sides)*Math.PI*2/sides+t*.00007;
   const x=px+Math.cos(a)*r,y=py+Math.sin(a)*r;
   if(k===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
  }
  ctx.strokeStyle=j===1?'rgba(190,145,255,'+(alpha+.06)+')':'rgba(83,239,230,'+alpha+')';
  ctx.lineWidth=1.25;ctx.stroke();
 }
 for(let k=0;k<sides;k++){
  const a=k*Math.PI*2/sides+t*.00007;
  line(px,py,px+Math.cos(a)*96,py+Math.sin(a)*96,'rgba(112,235,240,ALPHA)',.1,1);
 }
 const grad=ctx.createRadialGradient(px,py,0,px,py,132);
 grad.addColorStop(0,'rgba(69,237,222,.11)');grad.addColorStop(.35,'rgba(141,97,255,.055)');grad.addColorStop(1,'rgba(65,220,232,0)');
 ctx.fillStyle=grad;ctx.beginPath();ctx.arc(px,py,132,0,Math.PI*2);ctx.fill();
 ctx.beginPath();ctx.arc(px,py,3.6,0,Math.PI*2);ctx.fillStyle='rgba(159,255,242,.9)';ctx.fill();
 ctx.restore();
}
function draw(t,staticOnly=false){
 ctx.clearRect(0,0,width,height);
 const active=target.active&&!staticOnly;
 if(active){cursor.x+=(target.x-cursor.x)*.14;cursor.y+=(target.y-cursor.y)*.14;}
 ctx.lineCap='round';
 for(const p of points){
  const sx=staticOnly?0:Math.sin(t*.00038+p.phase)*5;
  const sy=staticOnly?0:Math.cos(t*.00033+p.phase)*6;
  let dx=0,dy=0;
  if(active){
   const x=p.bx-cursor.x,y=p.by-cursor.y,d2=x*x+y*y;
   if(d2<235*235){const d=Math.sqrt(d2)||1,strength=(1-d/235)*27;dx=(x/d)*strength;dy=(y/d)*strength;}
  }
  p.x=p.bx+sx+dx;p.y=p.by+sy+dy;
 }
 for(let i=0;i<points.length;i++){
  const a=points[i];
  for(let j=i+1;j<points.length;j++){
   const b=points[j],dx=a.x-b.x,dy=a.y-b.y,dist2=dx*dx+dy*dy;
   if(dist2>205*205||dist2<25*25)continue;
   let alpha=.1*(1-dist2/(205*205))+.015;
   if(active){
    const x=(a.x+b.x)*.5-cursor.x,y=(a.y+b.y)*.5-cursor.y;
    alpha+=Math.max(0,1-(x*x+y*y)/(275*275))*.2;
   }
   line(a.x,a.y,b.x,b.y,i%3===0?'rgba(181,142,255,ALPHA)':'rgba(68,207,221,ALPHA)',alpha,active?1.0:.85);
  }
 }
 for(let i=0;i<points.length;i++){
  const p=points[i],near=active&&Math.hypot(p.x-cursor.x,p.y-cursor.y)<180;
  ctx.beginPath();ctx.arc(p.x,p.y,near?2.3:1.45,0,Math.PI*2);
  ctx.fillStyle=i%5===0?'rgba(245,132,207,.62)':'rgba(105,230,230,'+(near?.95:.46)+')';ctx.fill();
 }
 if(active){
  for(const p of points){
   const d=Math.hypot(p.x-cursor.x,p.y-cursor.y);
   if(d<205&&d>8)line(cursor.x,cursor.y,p.x,p.y,'rgba(111,246,240,ALPHA)',(1-d/205)*.25,1);
  }
  cursorWeb(t);
 }
 ripples=ripples.filter(r=>t-r.at<800);
 for(const r of ripples){
  const f=clamp((t-r.at)/800,0,1);
  ctx.beginPath();ctx.arc(r.x,r.y,14+105*f,0,Math.PI*2);ctx.lineWidth=2*(1-f)+.3;ctx.strokeStyle='rgba(144,199,255,'+(.4*(1-f)).toFixed(3)+')';ctx.stroke();
 }
}
function allowMotion(){return shown&&!reduced.matches&&!document.body.classList.contains('motion-off');}
function animate(t){
 raf=0;if(!allowMotion())return;
 time=t;draw(t);
 raf=requestAnimationFrame(animate);
}
function sync(){
 if(allowMotion()){if(!raf)raf=requestAnimationFrame(animate);}
 else{if(raf)cancelAnimationFrame(raf);raf=0;draw(time,true);}
}
addEventListener('resize',()=>{size();sync();},{passive:true});
addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;target={x:e.clientX,y:e.clientY,active:true};if(cursor.x<0){cursor.x=e.clientX;cursor.y=e.clientY;}},{passive:true});
addEventListener('pointerout',e=>{if(!e.relatedTarget)target.active=false;},{passive:true});
addEventListener('pointerdown',e=>{if(!allowMotion())return;ripples.push({x:e.clientX,y:e.clientY,at:performance.now()});if(ripples.length>5)ripples.shift();},{passive:true});
document.addEventListener('visibilitychange',()=>{shown=!document.hidden;sync();});
reduced.addEventListener?.('change',sync);
new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});
size();sync();
})();