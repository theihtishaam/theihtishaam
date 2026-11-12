/* Accessible mobile navigation + active section highlight. Uses native browser APIs only. */
(()=>{'use strict';
const toggle=document.querySelector('#mobile-menu-button');
const menu=document.querySelector('#mobile-menu');
const back=document.querySelector('#back-to-top');
if(!toggle||!menu)return;
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
function setOpen(open){
 menu.hidden=!open;
 toggle.setAttribute('aria-expanded',String(open));
 toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');
 const mark=toggle.querySelector('span');if(mark)mark.textContent=open?'✕':'☰';
}
toggle.addEventListener('click',()=>setOpen(menu.hidden));
menu.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',()=>setOpen(false)));
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&!menu.hidden){setOpen(false);toggle.focus();}
});
const wide=matchMedia('(min-width: 901px)');
wide.addEventListener?.('change',e=>{if(e.matches)setOpen(false);});
document.addEventListener('pointerdown',e=>{
 if(!menu.hidden&&!menu.contains(e.target)&&!toggle.contains(e.target))setOpen(false);
});
let raf=0;
function onScroll(){
 if(raf)return;
 raf=requestAnimationFrame(()=>{
  if(back)back.hidden=scrollY<540;
  raf=0;
 });
}
addEventListener('scroll',onScroll,{passive:true});onScroll();
back?.addEventListener('click',()=>scrollTo({top:0,behavior:reduce.matches||document.body.classList.contains('motion-off')?'auto':'smooth'}));
if('IntersectionObserver' in window){
 const seen=new Map();
 const navItems=[...document.querySelectorAll('.desktop-nav a[href^="#"]')];
 const sections=navItems.map(a=>document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
 const observer=new IntersectionObserver(entries=>{
  for(const e of entries){if(e.isIntersecting)seen.set(e.target.id,e.intersectionRatio);else seen.delete(e.target.id);}
  const current=[...seen].sort((a,b)=>b[1]-a[1])[0]?.[0];
  if(current)navItems.forEach(a=>a.classList.toggle('is-current',a.getAttribute('href')==='#'+current));
 },{rootMargin:'-15% 0px -55% 0px',threshold:[0,.1,.3,.6]});
 sections.forEach(e=>observer.observe(e));
}
})();