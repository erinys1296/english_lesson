// Escapes plain text for safe HTML insertion
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}

// Read ?course= and ?lesson= from URL
function param(name){return new URLSearchParams(location.search).get(name);}

// Resolve a relative data path regardless of where the page lives
async function loadJSON(path){
  const res=await fetch(path);
  if(!res.ok)throw new Error('Cannot load '+path);
  return res.json();
}

// ---------- HOME: list courses ----------
async function renderHome(){
  const data=await loadJSON('data/courses.json');
  document.getElementById('site-title').textContent=data.siteTitle;
  document.getElementById('site-sub').textContent=data.siteSubtitle||'';
  document.title=data.siteTitle;
  const grid=document.getElementById('grid');
  grid.innerHTML=data.courses.map(c=>`
    <a class="card" href="course.html?course=${encodeURIComponent(c.id)}">
      <span class="ic">${c.icon||'📚'}</span>
      <div class="ct">${esc(c.title)}</div>
      <div class="cs">${esc(c.subtitle||'')}</div>
      <span class="badge">${c.lessons.length} 課</span>
    </a>`).join('');
}

// ---------- COURSE: list lessons ----------
async function renderCourse(){
  const data=await loadJSON('data/courses.json');
  const cid=param('course');
  const course=data.courses.find(c=>c.id===cid);
  const root=document.getElementById('root');
  if(!course){root.innerHTML='<p class="loading">找不到這個課程。<a href="index.html">回首頁</a></p>';return;}
  document.title=course.title;
  document.getElementById('crumb').innerHTML=
    `<a href="index.html">首頁</a><span>/</span>${esc(course.title)}`;
  root.innerHTML=`
    <div class="site-head">
      <h1>${course.icon||''} ${esc(course.title)}</h1>
      <div class="sub">${esc(course.subtitle||'')}</div>
    </div>
    ${course.lessons.map(l=>`
      <a class="lrow" href="lesson.html?course=${encodeURIComponent(course.id)}&lesson=${encodeURIComponent(l.id)}">
        <div>
          <div class="lt">${esc(l.title)}</div>
          <div class="ls">${esc(l.subtitle||'')}</div>
        </div>
        <div style="display:flex;align-items:center;gap:12px">
          ${l.duration?`<span class="dur">${esc(l.duration)}</span>`:''}
          <span class="go">開始 →</span>
        </div>
      </a>`).join('')}
  `;
}

// ---------- LESSON: render full worksheet ----------
async function renderLesson(){
  const idx=await loadJSON('data/courses.json');
  const cid=param('course'), lid=param('lesson');
  const course=idx.courses.find(c=>c.id===cid);
  const meta=course&&course.lessons.find(l=>l.id===lid);
  const root=document.getElementById('root');
  if(!meta){root.innerHTML='<p class="loading">找不到這篇課文。<a href="index.html">回首頁</a></p>';return;}
  const L=await loadJSON(meta.file);
  document.title=L.title;
  document.getElementById('crumb').innerHTML=
    `<a href="index.html">首頁</a><span>/</span>`+
    `<a href="course.html?course=${encodeURIComponent(course.id)}">${esc(course.title)}</a>`+
    `<span>/</span>${esc(L.title)}`;

  const vocab=(L.vocabulary||[]).map(v=>`
    <tr><td class="word">${esc(v.word)}</td><td>${esc(v.meaning)}</td><td class="ex">${esc(v.example)}</td></tr>`).join('');

  const idioms=(L.idioms||[]).map((it,i)=>`
    <div class="idiom">
      <div class="term">${i+1}. &ldquo;${esc(it.term)}&rdquo;</div>
      <p><span class="lbl">Meaning:</span> ${esc(it.meaning)}</p>
      ${it.examples.map(e=>`<p class="ex">${esc(e)}</p>`).join('')}
    </div>`).join('');

  const reading=(L.reading||[]).map(b=>{
    if(b.type==='h3')return `<h3>${esc(b.text)}</h3>`;
    if(b.type==='quote')return `<div class="quotebox">${esc(b.text)}<span class="who">— ${esc(b.who)}</span></div>`;
    if(b.type==='callout')return `<div class="callout"><h4>${esc(b.title)}</h4>${b.text.split('\n\n').map(t=>`<p>${esc(t)}</p>`).join('')}</div>`;
    return `<p>${esc(b.text)}</p>`;
  }).join('');

  const L_=["A","B","C","D"];
  const mcq=(L.mcq||[]).map((m,qi)=>`
    <div class="q">
      <div class="stem">${qi+1}. ${esc(m.stem)}</div>
      ${m.options.map((o,oi)=>`<label class="opt"><input type="radio" name="q${qi}">(${L_[oi]}) ${esc(o)}</label>`).join('')}
      <details class="reveal"><summary>Show answer</summary>
        <div class="ansbox"><span class="tag">Answer: ${L_[m.answer]}.</span> ${esc(m.explain)}</div>
      </details>
    </div>`).join('');

  const disc=(L.discussion||[]).map((d,di)=>`
    <div class="disc">
      <div class="stem">${di+1}. ${esc(d.stem)}</div>
      <div class="lines"></div><div class="lines"></div><div class="lines"></div>
      <details class="reveal"><summary>Show hint &amp; sample answer</summary>
        <div class="hintbox"><span class="tag">Hint:</span> ${esc(d.hint)}</div>
        <div class="sample"><span class="tag">Sample answer:</span> ${esc(d.sample)}</div>
      </details>
    </div>`).join('');

  root.innerHTML=`
    <div class="toolbar">
      <button class="btn ghost" id="toggleAll">老師版：展開全部答案</button>
      <button class="btn" onclick="window.print()">列印</button>
    </div>
    <header class="lesson">
      <h1>${esc(L.title)}</h1>
      <div class="sub">${esc(L.subtitle||'')}${L.source?' — '+esc(L.source):''}</div>
      <div class="namebar"><span>Name:</span><span>Date:</span></div>
    </header>

    <h2 class="part">Part 1 · Vocabulary<small>Study each word, its English meaning, and the example sentence.</small></h2>
    <table class="vocab"><thead><tr><th>Word</th><th>Meaning (English)</th><th>Example sentence</th></tr></thead><tbody>${vocab}</tbody></table>

    <h2 class="part">Part 2 · Idioms &amp; Useful Expressions<small>Learn the meaning and notice how each one is used in the reading.</small></h2>
    ${idioms}

    <h2 class="part">Part 3 · Reading Passage<small>Read carefully before answering the questions.</small></h2>
    <div class="reading">${reading}</div>

    <h2 class="part">Part 4 · Reading Comprehension (Multiple Choice)<small>Choose the best answer for each question.</small></h2>
    ${mcq}

    <h2 class="part">Part 5 · Discussion<small>Answer in complete sentences. Support your ideas with reasons or examples.</small></h2>
    ${disc}

    <footer>${esc(L.source||'')}</footer>
  `;

  // teacher toggle: open/close every reveal at once
  const btn=document.getElementById('toggleAll');
  btn.addEventListener('click',()=>{
    const all=root.querySelectorAll('details.reveal');
    const anyClosed=[...all].some(d=>!d.open);
    all.forEach(d=>d.open=anyClosed);
    btn.textContent=anyClosed?'學生版：收合全部答案':'老師版：展開全部答案';
  });
}
