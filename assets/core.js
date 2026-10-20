/* IELTS BASIC · Ms Trâm English Hub — thư viện dùng chung cho các mục */
const CORE_BASE=new URL('..',document.currentScript.src).href;
const SITE={
  fb:'https://www.facebook.com/msTram.EClass',
  phones:['079 29 51 529','0898 123 696'],
  address:'12 Lê Đình Chinh, Quy Nhơn Nam',
  modules:[
    {id:'home',label:'Trang chủ',path:''},
    {id:'phat-am',label:'Phát âm',path:'phat-am/'},
    {id:'tu-vung',label:'Từ vựng',path:'tu-vung/'},
    {id:'ngu-phap',label:'Ngữ pháp',path:'ngu-phap/'}
  ]
};

/* ---------- speech + storage ---------- */
const TTS={
  ok:'speechSynthesis' in window, voice:null, rate:0.9,
  pick(){ if(!this.ok) return; const v=speechSynthesis.getVoices(); this.voice=v.find(x=>/en-GB/i.test(x.lang))||v.find(x=>/^en/i.test(x.lang))||null; },
  say(t,r){ if(!this.ok||!t) return; speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(t); u.lang=this.voice?this.voice.lang:'en-GB'; if(this.voice) u.voice=this.voice; u.rate=r||this.rate; speechSynthesis.speak(u); }
};
if(TTS.ok){ TTS.pick(); speechSynthesis.onvoiceschanged=()=>TTS.pick(); }
const store={
  get(k,d){ try{ const v=localStorage.getItem('ipa-ca:'+k); return v==null?d:JSON.parse(v);}catch(e){return d;} },
  set(k,v){ try{ localStorage.setItem('ipa-ca:'+k,JSON.stringify(v)); }catch(e){} }
};
TTS.rate=store.get('rate',0.9);

/* ---------- DOM helpers ---------- */
const h=(tag,attrs={},...kids)=>{const el=document.createElement(tag);for(const[k,v]of Object.entries(attrs)){if(v==null)continue;if(k==='class')el.className=v;else if(k==='html')el.innerHTML=v;else if(k.startsWith('on'))el.addEventListener(k.slice(2),v);else el.setAttribute(k,v);}for(const c of kids.flat()){if(c==null||c===false)continue;el.append(c.nodeType?c:document.createTextNode(c));}return el;};
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const pickN=(a,n)=>shuffle(a).slice(0,n);
const noVoice=()=>TTS.ok?null:h('div',{class:'warn'},'Trình duyệt này không đọc được giọng mẫu. Hãy mở bằng Chrome, Safari hoặc Edge.');
const letters=s=>String(s).toLowerCase().replace(/[^a-z]/g,'');
function speed(){
  const id='sp'+Math.random().toString(36).slice(2,7);
  const out=h('span',{},TTS.rate.toFixed(1)+'×');
  const inp=h('input',{type:'range',min:'0.5',max:'1.2',step:'0.1',value:String(TTS.rate),id,'aria-label':'Tốc độ đọc'});
  inp.addEventListener('input',()=>{TTS.rate=+inp.value;out.textContent=TTS.rate.toFixed(1)+'×';store.set('rate',TTS.rate);});
  return h('label',{class:'speed',for:id},'Tốc độ',inp,out);
}
function chipRow(options,current,onPick){
  const row=h('div',{class:'chips',role:'group'});
  options.forEach(o=>{const b=h('button',{type:'button',class:'chip','aria-pressed':String(o.id===current)},o.label);b.addEventListener('click',()=>{[...row.children].forEach(c=>c.setAttribute('aria-pressed','false'));b.setAttribute('aria-pressed','true');onPick(o.id);});row.append(b);});
  return row;
}
const head=(title,lead)=>h('div',{class:'head'},h('h2',{},title),lead?h('p',{},lead):null);
const sayBtn=(t,label='▶',r)=>h('button',{type:'button',class:'btn sm line','aria-label':'Nghe: '+t,onclick:()=>TTS.say(t,r)},label);

/* ---------- page chrome: header, top nav, footer ---------- */
function chrome({active,lead}){
  const logo=CORE_BASE+'assets/logo.png';
  const shell=document.querySelector('.shell');
  const topnav=h('nav',{class:'topnav','aria-label':'Các kỹ năng'},...SITE.modules.map(m=>h('a',{href:CORE_BASE+m.path,class:'topnav-link'+(m.id===active?' on':''),'aria-current':m.id===active?'page':null},m.label)));
  const header=h('header',{class:'brand'},
    h('div',{class:'brand-top'},
      h('a',{class:'logo',href:CORE_BASE},h('img',{src:logo,alt:'Logo Ms Trâm English Hub',width:'72',height:'48'}),h('span',{class:'nm'},h('b',{},'Ms Trâm'),h('span',{},'english hub'))),
      h('div',{class:'contact'},h('span',{},'Hotline / Zalo: ',h('strong',{},SITE.phones[0]),' · ',h('strong',{},SITE.phones[1])),h('span',{},SITE.address),h('a',{href:SITE.fb,target:'_blank',rel:'noopener'},'Facebook Ms Trâm ↗'))),
    h('div',{class:'brand-row'},h('div',{},h('h1',{},'IELTS ',h('span',{class:'b2'},'BASIC')),lead?h('p',{},lead):null),h('div',{class:'score-pill',id:'score-pill'})),
    topnav);
  const footer=h('footer',{class:'foot'},
    h('a',{class:'logo',href:CORE_BASE},h('img',{src:logo,alt:'',width:'52',height:'35'}),h('span',{class:'nm'},h('b',{},'Ms Trâm'),h('span',{},'english hub'))),
    h('div',{class:'foot-info'},h('span',{},'Tiếng Anh cho mọi lứa tuổi'),h('span',{},'Zalo / Hotline: ',h('strong',{},SITE.phones[0]),' · ',h('strong',{},SITE.phones[1])),h('span',{},'Địa chỉ: '+SITE.address),h('span',{},'Facebook: ',h('a',{href:SITE.fb,target:'_blank',rel:'noopener'},'facebook.com/msTram.EClass'))));
  shell.prepend(header); shell.append(footer);
}

/* ---------- section router (sidebar on desktop, chip strip on phone) ---------- */
function mountSections(SECTIONS,key,defId){
  const ALL=SECTIONS.flatMap(g=>g.items);
  const nav=document.getElementById('nav');
  SECTIONS.forEach(g=>nav.append(h('div',{class:'navgroup'},h('div',{class:'navlabel'},g.group),...g.items.map(s=>h('button',{type:'button','data-id':s.id,onclick:()=>{go(s.id);window.scrollTo({top:0});}},h('span',{},s.label),h('span',{class:'sym'},s.sym||''))))));
  function go(id){
    const sec=ALL.find(s=>s.id===id)||ALL.find(s=>s.id===defId)||ALL[0];
    nav.querySelectorAll('button').forEach(b=>b.setAttribute('aria-current',String(b.dataset.id===sec.id)));
    if(TTS.ok) speechSynthesis.cancel();
    const m=document.getElementById('main'); m.innerHTML=''; m.append(...[].concat(sec.render()).filter(Boolean));
    store.set(key+'-tab',sec.id); try{history.replaceState(null,'','#'+sec.id);}catch(e){}
    const b=nav.querySelector(`button[data-id="${sec.id}"]`); if(b) b.scrollIntoView({block:'nearest',inline:'center'});
  }
  const hs=(location.hash||'').slice(1);
  go(ALL.some(s=>s.id===hs)?hs:store.get(key+'-tab',defId));
  window.addEventListener('hashchange',()=>{const id=(location.hash||'').slice(1);if(ALL.some(s=>s.id===id))go(id);});
  return go;
}

/* ---------- multiple-choice quiz engine ---------- */
function quiz({key,make,intro,n=10}){
  const area=h('div',{class:'dict'});
  let qs=[],i=0,right=0,wrongs=[];
  function start(){qs=make(n);i=0;right=0;wrongs=[];show();}
  function show(){
    area.innerHTML='';
    if(i>=qs.length) return finish();
    const q=qs[i];
    area.append(h('div',{class:'meter'},h('span',{},`Câu ${i+1}/${qs.length}`),h('span',{class:'track'},h('i',{style:`width:${i/qs.length*100}%`})),h('span',{},`Đúng ${right}`)));
    if(q.speak){
      const big=h('button',{type:'button',class:'play','aria-label':'Nghe'},'▶'); big.addEventListener('click',()=>TTS.say(q.speak));
      area.append(h('div',{class:'player'},big,h('button',{type:'button',class:'btn sm line',onclick:()=>TTS.say(q.speak,.6)},'▶ Nghe chậm')));
      setTimeout(()=>TTS.say(q.speak),200);
    }
    area.append(q.prompt);
    const opts=h('div',{class:'opts'+(q.wide?' wide':'')}); const res=h('div',{role:'status'});
    q.options.forEach((o,k)=>{
      const b=h('button',{type:'button',class:'opt'}); b.innerHTML=o;
      b.addEventListener('click',()=>{
        if(opts.dataset.done) return; opts.dataset.done='1';
        const ok=k===q.answer; if(ok) right++; else wrongs.push(q);
        [...opts.children].forEach((c,ci)=>{c.disabled=true; if(ci===q.answer) c.classList.add('right');});
        if(!ok) b.classList.add('wrong');
        res.className='res '+(ok?'ok':'no'); res.innerHTML='';
        const ex=h('div',{}); ex.innerHTML=q.explain;
        res.append(...[h('strong',{},ok?'Đúng rồi!':'Chưa đúng.'),ex,q.after?h('div',{class:'chips'},h('button',{type:'button',class:'btn sm line',onclick:()=>TTS.say(q.after,.85)},'▶ Nghe đáp án')):null].filter(Boolean));
        if(q.after) TTS.say(q.after,.85);
        const nx=h('button',{type:'button',class:'btn'},i+1<qs.length?'Câu tiếp →':'Xem kết quả'); nx.addEventListener('click',()=>{i++;show();});
        area.append(h('div',{class:'chips'},nx)); nx.focus();
      });
      opts.append(b);
    });
    area.append(opts,res);
  }
  function finish(){
    const best=store.get('quiz',{}); best[key]=Math.max(best[key]||0,right); store.set('quiz',best);
    area.append(h('div',{class:'summary'},
      h('div',{class:'bar'},h('div',{},h('div',{class:'bigscore'},`${right}/${qs.length}`),h('div',{class:'note'},'câu đúng · cao nhất '+best[key]+'/'+qs.length)),
        h('div',{class:'chips'},h('button',{type:'button',class:'btn',onclick:start},'Làm lượt mới'))),
      wrongs.length?h('h3',{},'Câu cần xem lại'):h('p',{class:'note'},'Không sai câu nào. Làm lượt mới để gặp câu khác.'),
      h('div',{class:'review'},...wrongs.map(q=>{const d=h('div',{});d.innerHTML=(q.review||'')+q.explain;return h('div',{class:'r'},h('span',{class:'x'},'✗'),d);}))));
  }
  area.append(h('p',{class:'note'},intro),h('div',{class:'chips'},h('button',{type:'button',class:'btn',onclick:start},'Bắt đầu ('+n+' câu)')));
  return area;
}
