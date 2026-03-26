document.getElementById('cvDate').textContent = new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});

const start = new Date('2026-03-22');
const end = new Date('2026-07-10');
const now = new Date();
const total = end - start;
const elapsed = now - start;
const pct = Math.min(100, Math.max(0, (elapsed/total)*100));
const week = Math.min(16, Math.max(1, Math.ceil(elapsed/(7*24*60*60*1000))));
document.getElementById('progressBar').style.width = pct.toFixed(1)+'%';
document.getElementById('weekLabel').textContent = `week ${week} of 16 · ${pct.toFixed(0)}%`;

const reveals = document.querySelectorAll('.cv-section,.cv-header');
const obs = new IntersectionObserver(entries=>{
  entries.forEach((e,i)=>{
    if(e.isIntersecting){
      setTimeout(()=>{
        e.target.style.opacity='1';
        e.target.style.transform='translateY(0)';
      },i*60);
    }
  });
},{threshold:0.1});
reveals.forEach(r=>{
  r.style.opacity='0';
  r.style.transform='translateY(16px)';
  r.style.transition='opacity 0.5s ease, transform 0.5s ease';
  obs.observe(r);
});
