// Custom cursor
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = 0,
   my = 0,
   rx = 0,
   ry = 0;
document.addEventListener('mousemove', e => {
   mx = e.clientX;
   my = e.clientY;
   cursor.style.left = mx + 'px';
   cursor.style.top = my + 'px';
});

function animRing() {
   rx += (mx - rx) * 0.12;
   ry += (my - ry) * 0.12;
   ring.style.left = rx + 'px';
   ring.style.top = ry + 'px';
   requestAnimationFrame(animRing);
}
animRing();
document.querySelectorAll('a,.btn,.pcard,.contact-card').forEach(el => {
   el.addEventListener('mouseenter', () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(2.5)';
      ring.style.transform = 'translate(-50%,-50%) scale(1.4)';
      ring.style.borderColor = 'rgba(0,255,136,0.6)';
   });
   el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(1)';
      ring.style.transform = 'translate(-50%,-50%) scale(1)';
      ring.style.borderColor = 'rgba(0,255,136,0.3)';
   });
});

// Counter animation
function animateCounter(el) {
   const target = parseInt(el.dataset.target) || parseInt(el.textContent) || 0;
   const suffix = el.dataset.suffix || '';
   if (!target) {
      return
   }
   let start = null;
   const dur = 1200;

   function step(ts) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(ease * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
   }
   requestAnimationFrame(step);
}
const counters = document.querySelectorAll('.metric-num[data-target]');
const cObs = new IntersectionObserver(entries => {
   entries.forEach(e => {
      if (e.isIntersecting) {
         animateCounter(e.target);
         cObs.unobserve(e.target)
      }
   });
}, {
   threshold: 0.5
});
counters.forEach(c => cObs.observe(c));

// Reveal on scroll
const reveals = document.querySelectorAll('.reveal');
const revObs = new IntersectionObserver(entries => {
   entries.forEach((e, i) => {
      if (e.isIntersecting) {
         setTimeout(() => e.target.classList.add('visible'), i * 60);
      }
   });
}, {
   threshold: 0.1
});
reveals.forEach(r => revObs.observe(r));

// Skill bars
const bars = document.querySelectorAll('.skill-fill');
const barObs = new IntersectionObserver(entries => {
   entries.forEach(e => {
      if (e.isIntersecting) {
         e.target.classList.add('animate');
         barObs.unobserve(e.target)
      }
   });
}, {
   threshold: 0.3
});
bars.forEach(b => barObs.observe(b));

// Timeline items
const tItems = document.querySelectorAll('.t-item');
const tObs = new IntersectionObserver(entries => {
   entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
   });
}, {
   threshold: 0.2
});
tItems.forEach(t => tObs.observe(t));

if (window.innerWidth <= 768) {
   document.body.style.paddingBottom = '80px';
}

// Blog preview on homepage
const BP_PROXY = 'https://blog.itzshagor9.workers.dev';
const BP_DB = '32de0ba30e7280cb9369febbee4d4126';

async function loadBlogPreview() {
   const grid = document.getElementById('blogPreviewGrid');
   if (!grid) return;
   try {
      const res = await fetch(`${BP_PROXY}/v1/databases/${BP_DB}/query`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            filter: {
               property: 'Published',
               checkbox: {
                  equals: true
               }
            },
            sorts: [{
               property: 'Date',
               direction: 'descending'
            }],
            page_size: 6
         })
      });
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      if (data.object === 'error') throw new Error(data.message);

      const posts = data.results.map((p, i) => ({
         id: p.id,
         num: String(data.results.length - i).padStart(2, '0'),
         title: p.properties.Title?.title?.[0]?.plain_text || 'Untitled',
         date: p.properties.Date?.date?.start || '',
         category: p.properties.Category?.select?.name || '',
      }));

      grid.innerHTML = posts.map(p => `
      <a href="blog.html" class="bp-card">
        <div class="bp-num">${p.num}</div>
        <div class="bp-cat ${bpCat(p.category)}">${p.category||'general'}</div>
        <div class="bp-title">${bpEsc(p.title)}</div>
        <div class="bp-date">◈ ${bpFmt(p.date)}</div>
        <span class="bp-arrow">↗</span>
      </a>`).join('');
   } catch (e) {
      grid.innerHTML = `<div class="bp-loading"><p style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--text3)">// posts unavailable</p></div>`;
   }
}

function bpCat(c) {
   if (!c) return 'cat-default';
   const m = {
      'networking': 'cat-networking',
      'python': 'cat-python',
      'dsa': 'cat-dsa',
      'study': 'cat-study',
      'studynotes': 'cat-study',
      'project': 'cat-project',
      'tutorial': 'cat-tutorial',
      'article': 'cat-article',
      'guide': 'cat-guide'
   };
   return m[c.toLowerCase().replace(/\s+/g, '')] || 'cat-default';
}

function bpFmt(d) {
   if (!d) return '—';
   return new Date(d).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
   });
}

function bpEsc(s) {
   return String(s || '').replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');
}

loadBlogPreview();