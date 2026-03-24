// Custom cursor
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{
  mx=e.clientX;my=e.clientY;
  cursor.style.left=mx+'px';cursor.style.top=my+'px';
});
function animRing(){
  rx+=(mx-rx)*0.12;ry+=(my-ry)*0.12;
  ring.style.left=rx+'px';ring.style.top=ry+'px';
  requestAnimationFrame(animRing);
}
animRing();
document.querySelectorAll('a,.btn,.pcard,.contact-card').forEach(el=>{
  el.addEventListener('mouseenter',()=>{
    cursor.style.transform='translate(-50%,-50%) scale(2.5)';
    ring.style.transform='translate(-50%,-50%) scale(1.4)';
    ring.style.borderColor='rgba(0,255,136,0.6)';
  });
  el.addEventListener('mouseleave',()=>{
    cursor.style.transform='translate(-50%,-50%) scale(1)';
    ring.style.transform='translate(-50%,-50%) scale(1)';
    ring.style.borderColor='rgba(0,255,136,0.3)';
  });
});

// Counter animation
function animateCounter(el){
  const target=parseInt(el.dataset.target)||parseInt(el.textContent)||0;
  const suffix=el.dataset.suffix||'';
  if(!target){return}
  let start=null;
  const dur=1200;
  function step(ts){
    if(!start)start=ts;
    const p=Math.min((ts-start)/dur,1);
    const ease=1-Math.pow(1-p,3);
    el.textContent=Math.round(ease*target)+suffix;
    if(p<1)requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
const counters=document.querySelectorAll('.metric-num[data-target]');
const cObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){animateCounter(e.target);cObs.unobserve(e.target)}});
},{threshold:0.5});
counters.forEach(c=>cObs.observe(c));

// Reveal on scroll
const reveals=document.querySelectorAll('.reveal');
const revObs=new IntersectionObserver(entries=>{
  entries.forEach((e,i)=>{
    if(e.isIntersecting){
      setTimeout(()=>e.target.classList.add('visible'),i*60);
    }
  });
},{threshold:0.1});
reveals.forEach(r=>revObs.observe(r));

// Skill bars
const bars=document.querySelectorAll('.skill-fill');
const barObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){e.target.classList.add('animate');barObs.unobserve(e.target)}
  });
},{threshold:0.3});
bars.forEach(b=>barObs.observe(b));

// Timeline items
const tItems=document.querySelectorAll('.t-item');
const tObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting)e.target.classList.add('visible');
  });
},{threshold:0.2});
tItems.forEach(t=>tObs.observe(t));

// Mobile Menu
const menuBtn=document.getElementById('menuBtn');
const mobileMenu=document.getElementById('mobileMenu');
const menuLinks=document.querySelectorAll('.mobile-menu-links a');

menuBtn.addEventListener('click',()=>{
  menuBtn.classList.toggle('active');
  mobileMenu.classList.toggle('active');
  document.body.style.overflow=mobileMenu.classList.contains('active')?'hidden':'';
});

menuLinks.forEach(link=>{
  link.addEventListener('click',()=>{
    menuBtn.classList.remove('active');
    mobileMenu.classList.remove('active');
    document.body.style.overflow='';
  });
});