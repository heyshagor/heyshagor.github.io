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
document.querySelectorAll('a,.post-card,.filter-btn,.back-btn').forEach(el=>{
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

const PROXY = 'https://blog.itzshagor9.workers.dev';
const DB_ID = '32de0ba30e7280cb9369febbee4d4126';
let allPosts = [];
let activeFilter = 'all';

async function fetchPosts() {
  try {
    const res = await fetch(`${PROXY}/v1/databases/${DB_ID}/query`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        filter:{property:'Published',checkbox:{equals:true}},
        sorts:[{property:'Date',direction:'descending'}]
      })
    });
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if(data.object==='error') throw new Error(data.message);
    allPosts = data.results.map((p,i)=>({
      id:p.id,
      num:String(data.results.length-i).padStart(2,'0'),
      title:p.properties.Title?.title?.[0]?.plain_text||'Untitled',
      date:p.properties.Date?.date?.start||'',
      category:p.properties.Category?.select?.name||'',
    }));
    document.getElementById('totalPosts').textContent=allPosts.length;
    document.getElementById('latestDate').textContent=allPosts[0]?.date?fmt(allPosts[0].date,true):'—';
    document.getElementById('statsBar').style.display='flex';
    renderList(allPosts);
  } catch(e) {
    document.getElementById('loadingState').style.display='none';
    document.getElementById('errorState').style.display='block';
    document.getElementById('errorMsg').textContent=e.message;
  }
}

function renderList(posts) {
  document.getElementById('loadingState').style.display='none';
  const grid=document.getElementById('postsGrid');
  if(!posts.length){grid.style.display='none';document.getElementById('emptyState').style.display='block';return;}
  document.getElementById('emptyState').style.display='none';
  grid.style.display='grid';
  grid.innerHTML=posts.map(p=>`
    <div class="post-card" onclick="openPost('${p.id}','${esc(p.title)}','${esc(p.category)}','${p.date}')">
      <div class="pc-num">${p.num}</div>
      <div class="pc-cat ${cc(p.category)}">${p.category||'general'}</div>
      <div class="pc-title">${esc(p.title)}</div>
      <div class="pc-date">◈ ${fmt(p.date)}</div>
      <span class="pc-arrow">↗</span>
    </div>`).join('');
}

function setFilter(f,btn){
  activeFilter=f;
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  filterPosts();
}
function filterPosts(){
  const q=document.getElementById('searchInput').value.toLowerCase();
  let list=allPosts;
  if(activeFilter!=='all') list=list.filter(p=>(p.category||'').toLowerCase().includes(activeFilter.toLowerCase()));
  if(q) list=list.filter(p=>p.title.toLowerCase().includes(q)||(p.category||'').toLowerCase().includes(q));
  renderList(list);
}

async function openPost(id,title,category,date){
  document.getElementById('listPage').style.display='none';
  document.getElementById('postPage').style.display='block';
  window.scrollTo(0,0);
  document.getElementById('postTitle').textContent=title;
  document.getElementById('postCat').textContent=category||'general';
  document.getElementById('postCat').className='post-cat-badge '+cc(category);
  document.getElementById('postCatMeta').textContent=category;
  document.getElementById('postDate').textContent=fmt(date);
  document.getElementById('postContent').innerHTML='<div class="spinner"></div>';
  document.getElementById('readTime').textContent='';
  try {
    const res=await fetch(`${PROXY}/v1/blocks/${id}/children?page_size=100`,{headers:{'Content-Type':'application/json'}});
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const data=await res.json();
    if(data.object==='error') throw new Error(data.message);
    const html=renderBlocks(data.results);
    document.getElementById('postContent').innerHTML=html||'<p class="n-p" style="color:var(--text3)">No content yet.</p>';
    const words=document.getElementById('postContent').innerText.split(/\s+/).length;
    document.getElementById('readTime').textContent=`~${Math.max(1,Math.ceil(words/200))} min read`;
    window.addEventListener('scroll',updateProgress);
  } catch(e){
    document.getElementById('postContent').innerHTML=`<p class="n-p" style="color:var(--red)">${e.message}</p>`;
  }
}

function showList(){
  document.getElementById('postPage').style.display='none';
  document.getElementById('listPage').style.display='block';
  window.removeEventListener('scroll',updateProgress);
  document.getElementById('progressFill').style.width='0%';
  window.scrollTo(0,0);
}

function updateProgress(){
  const el=document.getElementById('postContent');
  const total=el.offsetHeight-window.innerHeight;
  const scrolled=Math.max(0,window.scrollY-el.offsetTop+56);
  document.getElementById('progressFill').style.width=Math.min(100,(scrolled/total)*100)+'%';
}

function renderBlocks(blocks){
  let html='';
  let i=0;
  while(i<blocks.length){
    const b=blocks[i];
    if(b.type==='bulleted_list_item'){
      html+='<ul class="n-ul">';
      while(i<blocks.length&&blocks[i].type==='bulleted_list_item'){html+=`<li>${rt(blocks[i].bulleted_list_item.rich_text)}</li>`;i++;}
      html+='</ul>';continue;
    }
    if(b.type==='numbered_list_item'){
      html+='<ol class="n-ol">';
      while(i<blocks.length&&blocks[i].type==='numbered_list_item'){html+=`<li>${rt(blocks[i].numbered_list_item.rich_text)}</li>`;i++;}
      html+='</ol>';continue;
    }
    html+=block(b);i++;
  }
  return html;
}

function block(b){
  switch(b.type){
    case 'paragraph': return `<p class="n-p">${rt(b.paragraph.rich_text)||'<br>'}</p>`;
    case 'heading_1': return `<h2 class="n-h1">${rt(b.heading_1.rich_text)}</h2>`;
    case 'heading_2': return `<h2 class="n-h2">${rt(b.heading_2.rich_text)}</h2>`;
    case 'heading_3': return `<h3 class="n-h3">${rt(b.heading_3.rich_text)}</h3>`;
    case 'code':{
      const lang=b.code.language||'code';
      const code=esc(b.code.rich_text.map(r=>r.plain_text).join(''));
      const cap=b.code.caption?.length?`<div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--text3);padding:8px 16px;border-top:1px solid var(--border)">${rt(b.code.caption)}</div>`:'';
      return `<div class="n-code"><div class="n-code-bar"><span>${lang}</span><button class="copy-btn" onclick="copyCode(this)">copy</button></div><pre><code>${code}</code></pre>${cap}</div>`;
    }
    case 'quote': return `<div class="n-quote"><p>${rt(b.quote.rich_text)}</p></div>`;
    case 'callout':{
      const icon=b.callout.icon?.emoji||'💡';
      const c=b.callout.color||'';
      const cls=c.includes('blue')?'cb-blue':c.includes('yellow')?'cb-yellow':c.includes('red')?'cb-red':c.includes('green')?'cb-green':c.includes('purple')?'cb-purple':'';
      return `<div class="n-callout ${cls}"><div class="n-callout-icon">${icon}</div><div class="n-callout-text">${rt(b.callout.rich_text)}</div></div>`;
    }
    case 'divider': return `<hr class="n-divider"/>`;
    case 'image':{
      const url=b.image.type==='external'?b.image.external.url:b.image.file?.url||'';
      const cap=b.image.caption?.length?rt(b.image.caption):'';
      return url?`<figure class="n-image"><img src="${url}" alt="${cap||'image'}" loading="lazy"/>${cap?`<figcaption>${cap}</figcaption>`:''}</figure>`:'';
    }
    case 'video':{
      const url=b.video.type==='external'?b.video.external.url:'';
      if(!url) return '';
      const yt=url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
      if(yt) return `<div class="n-video-wrap"><iframe src="https://www.youtube.com/embed/${yt[1]}" allowfullscreen></iframe></div>`;
      return `<a href="${url}" class="n-bookmark" target="_blank"><div class="n-bookmark-info"><div class="n-bookmark-title">Video link</div><div class="n-bookmark-url">${url}</div></div></a>`;
    }
    case 'toggle': return `<details class="n-toggle"><summary>${rt(b.toggle.rich_text)}</summary><div class="n-toggle-body"><p class="n-p" style="font-size:13px;color:var(--text3)">Toggle content loads in Notion.</p></div></details>`;
    case 'to_do': return `<div class="n-todo"><div class="n-check ${b.to_do.checked?'done':''}">${b.to_do.checked?'✓':''}</div><div class="n-todo-text ${b.to_do.checked?'done':''}">${rt(b.to_do.rich_text)}</div></div>`;
    case 'bookmark':{
      const url=b.bookmark.url||'';
      const cap=b.bookmark.caption?.length?rt(b.bookmark.caption):url;
      return `<a href="${url}" class="n-bookmark" target="_blank"><div class="n-bookmark-info"><div class="n-bookmark-title">${cap}</div><div class="n-bookmark-url">${url}</div></div></a>`;
    }
    case 'equation': return `<div class="n-equation">${esc(b.equation.expression)}</div>`;
    case 'table_of_contents': return `<div class="n-callout cb-blue"><div class="n-callout-icon">📋</div><div class="n-callout-text" style="font-family:'JetBrains Mono',monospace;font-size:11px">table of contents</div></div>`;
    default: return '';
  }
}

function rt(arr){
  if(!arr||!arr.length) return '';
  return arr.map(t=>{
    let s=esc(t.plain_text);
    const a=t.annotations||{};
    if(a.code) s=`<span class="rt-code">${s}</span>`;
    if(a.bold) s=`<span class="rt-bold">${s}</span>`;
    if(a.italic) s=`<em class="rt-italic">${s}</em>`;
    if(a.strikethrough) s=`<span class="rt-strike">${s}</span>`;
    if(a.underline) s=`<span class="rt-under">${s}</span>`;
    if(a.color&&a.color!=='default'){
      const cls=a.color.includes('_background')?'bg-'+a.color.replace('_background',''):'c-'+a.color.replace(/_background/,'');
      s=`<span class="${cls}">${s}</span>`;
    }
    if(t.href) s=`<a href="${t.href}" class="rt-link" target="_blank">${s}</a>`;
    return s;
  }).join('');
}

function copyCode(btn){
  const code=btn.closest('.n-code').querySelector('code').textContent;
  navigator.clipboard.writeText(code).then(()=>{
    btn.textContent='copied!';btn.style.color='var(--accent)';
    setTimeout(()=>{btn.textContent='copy';btn.style.color='';},2000);
  });
}

function cc(c){if(!c)return 'cat-default';return 'cat-'+c.toLowerCase().replace(/\s+/g,'');}
function fmt(d,short){if(!d)return '—';return new Date(d).toLocaleDateString('en-GB',short?{day:'numeric',month:'short'}:{day:'numeric',month:'short',year:'numeric'});}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

fetchPosts();

if(window.innerWidth <= 768){
  document.body.style.paddingBottom = '80px';
}