const http = require('http');
const SRC = 'https://jshsus.kr/contents/ssam/check/index.php';
const PORT = process.env.PORT || 12345;
const today = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);

const PAGE = String.raw`<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>탐활서 장소별 보기</title>
<style>
body{font-family:system-ui,sans-serif;max-width:860px;margin:0 auto;padding:16px;color:#222;background:#fafafa}
header{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
h1{font-size:20px;margin:0;flex:1}
h2{font-size:16px;margin:20px 0 8px}
#timer{font-size:15px;padding:6px 12px;border-radius:8px;background:#e1f5ee;color:#085041;font-variant-numeric:tabular-nums}
#timer.warn{background:#faeeda;color:#633806}
#timer.end{background:#fcebeb;color:#791f1f}
#vw{font-size:15px;font-weight:600;padding:6px 14px;border-radius:8px;background:#35948a;color:#fff;text-decoration:none}
#q{width:100%;box-sizing:border-box;padding:8px 10px;margin:14px 0 10px;border:1px solid #ccc;border-radius:8px;font-size:14px}
#dates{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}
.chip{font-size:13px;padding:4px 12px;border:1px solid #ccc;border-radius:8px;background:#fff;color:#222;cursor:pointer}
.chip.on{background:#35948a;border-color:#35948a;color:#fff}
.bar{display:flex;align-items:center;gap:8px;margin-bottom:10px}
#sum{flex:1;font-size:13px;color:#666}
.cnt{font-size:15px;font-weight:700;min-width:44px;text-align:center;padding:3px 12px;border-radius:999px;background:#35948a;color:#fff}

.grp{border:1px solid #ddd;border-radius:12px;background:#fff;margin-bottom:8px;overflow:hidden}
.gh{display:flex;align-items:center;gap:10px;padding:12px 16px;font-size:16px;font-weight:600;cursor:pointer;list-style:none;user-select:none}
.gh::-webkit-details-marker{display:none}
.gh::before{content:'▸';color:#888;width:14px}
details[open]>.gh::before{content:'▾'}
details[open]>.gh{background:#f1f1ee}
.nm{flex:1}
.grp.etc .cnt{background:#888}
.grp.empty .gh{font-size:14px;font-weight:400;color:#888}
.grp.empty .cnt{background:#ddd;color:#555}
.none{padding:10px 16px;border-top:1px solid #eee;font-size:13px;color:#888;line-height:1.8}

.floor{display:flex;gap:8px;margin-bottom:6px;overflow-x:auto}
.fl{flex:0 0 44px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;color:#445;background:#e3e8f5;border-radius:8px}
.rows{flex:1;min-width:680px;display:flex;flex-direction:column;gap:4px}
.rowx{display:flex;gap:4px}
.rowx.wrap{flex-wrap:wrap}
.cell{flex:1 1 0;min-width:0;min-height:54px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:4px;font:inherit;font-size:12px;text-align:center;word-break:keep-all;border:1px solid #ccc;border-radius:6px;background:#fff;color:#222;cursor:pointer}
.cell.off{background:#f3f3f1;color:#aaa;border-style:dashed;cursor:default}
.cell.has{background:#e1f5ee;border-color:#35948a;color:#085041;font-weight:600}
.cell.sel{outline:2px solid #35948a;outline-offset:1px}
.cell .cnt{font-size:13px;min-width:0;padding:1px 9px}
.rowx.wrap .cell{flex:0 0 auto;padding:6px 14px}
.det{border:1px solid #35948a;border-radius:12px;background:#fff;margin:6px 0 14px;overflow:hidden}
.dh{padding:8px 16px;background:#e1f5ee;font-weight:600;color:#085041}

.row{padding:10px 16px;border-top:1px solid #eee;font-size:13px;line-height:1.6}
.row b{font-size:14px}
.meta{color:#666}
.dt{display:inline-block;font-size:12px;padding:0 8px;margin:2px 4px 0 0;border-radius:6px;background:#e6f1fb;color:#0c447c}
</style>
</head>
<body>
<header><h1>탐활서 장소별 보기</h1><div id="timer"></div><a id="vw" href="/map">지도 보기</a></header>
<input id="q" placeholder="학번, 이름, 지도교사, 활동내용 검색">
<div id="dates"></div>
<div class="bar"><div id="sum">불러오는 중…</div><button id="tg" class="chip">모두 펼치기</button></div>
<div id="out"></div>
<script>
// 이름 앞 * = 탐활 장소가 아닌 방(회색 표시)
const LAYOUT=[
  {b:'성실관(본관)',floors:[
    {f:'4층',rows:[
      ['3-1 교실','3-2 교실','3-3 교실','3-4 교실','*역사관(광장)','수학 3실','어학실','*면학실'],
      ['학생회실','무한상상실','*3학년 연구실','*수학 연구실']]},
    {f:'3층',rows:[['2-1 교실','2-2 교실','2-3 교실','2-4 교실','*역사관(광장)','*2학년 연구실','독서토론실','도서실','*면학실']]},
    {f:'2층',rows:[['1-1 교실','1-2 교실','1-3 교실','1-4 교실','*역사관(광장)','*1학년 연구실','*교감실','*교무실','*입학담당관실','*방송실','*사감실','*면학실']]},
    {f:'1층',rows:[['*보건실','*교직원 협의실','*교장실','*행정실','*중앙현관','*행정실장실','AI실','코딩실','멀티실','*급식실']]}
  ]},
  {b:'창의관(별관)',floors:[
    {f:'옥상',rows:[['*옥상 공간','천문대']]},
    {f:'4층',rows:[
      ['실험기자재실'],
      ['화학 R&E실','*화학연구실','분석기기실2','*준비실','화학 실험실']]},
    {f:'3층',rows:[
      ['배양실'],
      ['생명 R&E실','*생명과학 연구실','전자현미경실','*준비실','생명 실험실']]},
    {f:'2층',rows:[
      ['*학부모상담실','수학 1실','수학 2실','풍동실험실'],
      ['물리 R&E실','*물리연구실','*심화기자재','*준비실','물리 실험실']]},
    {f:'1층',rows:[
      ['시청각실','박편제작실'],
      ['지구 R&E실','*지구과학 연구실','글로브실','*준비실','지구 실험실']]}
  ]},
  {b:'성취관',floors:[
    {f:'2·3층',rows:[['다목적 체육관 강당','*체육연구실']]},
    {f:'1층',rows:[
      ['탁구실','체력단련실','골프연습실'],
      ['요가실','*학생부 연구실','미술실','음악실','피아노실','기악실']]}
  ]}
];
const ALL=LAYOUT.flatMap(B=>B.floors.flatMap(F=>F.rows.flat())).filter(n=>n[0]!=='*');
const SUBJ=['물리','화학','생명','지구'];
const KEYS=[['천문대','천문대'],['풍동','풍동실험실'],['박편','박편제작실'],['글로브','글로브실'],['시청각','시청각실'],
  ['전자현미경','전자현미경실'],['분석기기','분석기기실2'],['배양','배양실'],['기자재','실험기자재실'],
  ['코딩','코딩실'],['정보','코딩실'],['멀티','멀티실'],['어학','어학실'],['면학','면학실'],
  ['학생회','학생회실'],['무한상상','무한상상실'],['독서토론','독서토론실'],['도서','도서실'],
  ['체력단련','체력단련실'],['탁구','탁구실'],['골프','골프연습실'],['요가','요가실'],
  ['미술','미술실'],['피아노','피아노실'],['기악','기악실'],['음악','음악실'],['강당','다목적 체육관 강당'],['체육관','다목적 체육관 강당']];

function one(p){
  const k=p.replace(/\s/g,'').toUpperCase();
  const m=k.match(/([1-3])(?:-|학년)([1-4])/);
  if(m)return m[1]+'-'+m[2]+' 교실';
  const kw=KEYS.find(x=>k.includes(x[0]));
  if(kw)return kw[1];
  if(k.includes('수학')){
    if(k.includes('1'))return'수학 1실';
    if(k.includes('2'))return'수학 2실';
    return'수학 3실';
  }
  const s=SUBJ.find(x=>k.includes(x))||(k.includes('생물')?'생명':'');
  if(s)return s+(/R&E|RNE|알앤이/.test(k)?' R&E실':' 실험실');
  if(/(^|[^A-Z])AI([^A-Z]|$)|인공지능/.test(k))return'AI실';
  return'기타';
}
function classify(p){
  const parts=p.replace(/\([^)]*\)/g,'').split(/[,\/]/).map(s=>s.trim()).filter(Boolean);
  const r=[...new Set(parts.map(one))];
  return r.length?r:['기타'];
}

const view=location.pathname==='/map'?'map':'list';
let data=[],day='',sel='',shown=[];
const openSet=new Set();
const $=id=>document.getElementById(id);
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const label=()=>{$('tg').textContent=openSet.size?'모두 접기':'모두 펼치기'};

$('vw').textContent=view==='map'?'목록 보기':'지도 보기';
$('vw').href=(view==='map'?'/':'/map')+location.search;
if(view==='map')$('tg').style.display='none';

function tick(){
  const sec=Math.floor(Date.now()/1000+9*3600)%86400,s=18*3600-sec,t=$('timer');
  if(s<=0){t.className='end';t.textContent='오늘 제출 마감';return}
  const p=n=>String(n).padStart(2,'0');
  t.className=s<1800?'warn':'';
  t.textContent='제출 마감까지 '+p(Math.floor(s/3600))+':'+p(Math.floor(s%3600/60))+':'+p(s%60);
}

async function load(){
  try{
    const res=await fetch('/api'+location.search,{cache:'no-store'});
    if(!res.ok)throw new Error(res.status);
    const doc=new DOMParser().parseFromString(await res.text(),'text/html');
    const map=new Map();
    doc.querySelectorAll('table').forEach(tb=>{
      const o={};
      tb.querySelectorAll('tr').forEach(tr=>{
        const c=tr.children;
        if(c.length>=2)o[c[0].textContent.trim()]=c[1].textContent.trim();
      });
      if(!o['활동장소'])return;
      const id=[o['활동장소'],o['활동시간'],o['활동내용'],o['대표학생'],o['참가학생'],o['지도교사']].join('|');
      if(!map.has(id))map.set(id,{p:o['활동장소'],rooms:classify(o['활동장소']),h:o['활동시간']||'',c:o['활동내용']||'',r:o['대표학생']||'',m:o['참가학생']||'',t:o['지도교사']||'',d:[]});
      const d=o['활동날짜']||'';
      if(d&&!map.get(id).d.includes(d))map.get(id).d.push(d);
    });
    data=[...map.values()];
    if(!data.length){$('sum').textContent='조회된 탐활서가 없습니다.';return}
    const today=new Date(Date.now()+9*3600e3).toISOString().slice(0,10);
    if(data.some(x=>x.d.includes(today)))day=today;
    chips();render();
  }catch(e){$('sum').textContent='조회 실패: '+e.message}
}

function chips(){
  const ds=[...new Set(data.flatMap(x=>x.d))].sort();
  $('dates').innerHTML='';
  ['',...ds].forEach(d=>{
    const b=document.createElement('button');
    b.className='chip'+(d===day?' on':'');
    b.textContent=d?d.slice(5):'전체';
    b.onclick=()=>{day=d;chips();render()};
    $('dates').appendChild(b);
  });
}

const item=x=>'<div class="row"><b>'+esc(x.c)+'</b><br><span class="meta">'+esc(x.h)+' · 대표 '+esc(x.r)+' · 지도 '+esc(x.t)+'<br>장소 표기: '+esc(x.p)+'</span><br>'+esc(x.m)+
  (day?'':'<br>'+x.d.map(d=>'<span class="dt">'+esc(d.slice(5))+'</span>').join(''))+'</div>';

function listView(g,q){
  const names=[...ALL,...Object.keys(g).filter(r=>!ALL.includes(r)&&r!=='기타')];
  const order=names.filter(r=>g[r]).sort((a,b)=>g[b].length-g[a].length);
  if(g['기타'])order.push('기타');
  shown=order;
  let h=order.map(room=>'<details class="grp'+(room==='기타'?' etc':'')+'" data-room="'+esc(room)+'"'+(q||openSet.has(room)?' open':'')+'>'+
    '<summary class="gh"><span class="nm">'+esc(room)+'</span><span class="cnt">'+g[room].length+'건</span></summary>'+
    g[room].map(item).join('')+'</details>').join('');
  const empty=ALL.filter(r=>!g[r]);
  if(!q&&empty.length)h+='<details class="grp empty"><summary class="gh"><span class="nm">비어 있는 장소</span><span class="cnt">'+empty.length+'곳</span></summary><div class="none">'+empty.map(esc).join(' · ')+'</div></details>';
  return h;
}

function mapView(g){
  const cell=name=>{
    if(name[0]==='*')return'<div class="cell off">'+esc(name.slice(1))+'</div>';
    const c=g[name]?g[name].length:0;
    return'<button class="cell'+(c?' has':'')+(sel===name?' sel':'')+'" data-room="'+esc(name)+'">'+esc(name)+(c?'<span class="cnt">'+c+'건</span>':'')+'</button>';
  };
  const detail=name=>{
    const it=g[name]||[];
    return'<div class="det"><div class="dh">'+esc(name)+' · '+it.length+'건</div>'+(it.length?it.map(item).join(''):'<div class="row meta">탐활서 없음</div>')+'</div>';
  };
  let h='';
  LAYOUT.forEach(B=>{
    h+='<h2>'+esc(B.b)+'</h2>';
    B.floors.forEach(F=>{
      h+='<div class="floor"><div class="fl">'+esc(F.f)+'</div><div class="rows">'+F.rows.map(r=>'<div class="rowx">'+r.map(cell).join('')+'</div>').join('')+'</div></div>';
      if(sel&&F.rows.some(r=>r.includes(sel)))h+=detail(sel);
    });
  });
  const extra=Object.keys(g).filter(r=>!ALL.includes(r));
  if(extra.length){
    h+='<h2>배치도 밖 장소</h2><div class="rowx wrap">'+extra.map(cell).join('')+'</div>';
    if(extra.includes(sel))h+=detail(sel);
  }
  return h;
}

function render(){
  const q=$('q').value.trim().toLowerCase(),g={};let n=0;
  data.forEach(x=>{
    if(day&&!x.d.includes(day))return;
    if(q&&!(x.p+x.rooms.join(' ')+x.c+x.r+x.m+x.t).toLowerCase().includes(q))return;
    x.rooms.forEach(r=>(g[r]=g[r]||[]).push(x));n++;
  });
  $('sum').textContent='사용 중 '+Object.keys(g).length+'곳 · 탐활서 '+n+'건';
  $('out').innerHTML=view==='map'?mapView(g):listView(g,q);
  label();
}

$('out').onclick=e=>{
  const b=e.target.closest('button[data-room]');
  if(b){sel=sel===b.dataset.room?'':b.dataset.room;render();return}
  const s=e.target.closest('summary');
  if(!s)return;
  const d=s.parentElement,r=d.dataset.room;
  if(!r)return;
  d.open?openSet.delete(r):openSet.add(r);
  label();
};
$('tg').onclick=()=>{
  if(openSet.size)openSet.clear();else shown.forEach(r=>openSet.add(r));
  render();
};
$('q').oninput=render;
tick();setInterval(tick,1000);load();
</script>
</body>
</html>`;

http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://localhost');
  if (u.pathname === '/api') {
    const s = u.searchParams.get('start') || '';
    const start = /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : today();
    try {
      const r = await fetch(SRC + '?start=' + start + '&end=', { headers: { 'User-Agent': 'Mozilla/5.0' } });
      res.writeHead(r.status, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
      res.end(await r.text());
    } catch (e) {
      res.writeHead(502, { 'content-type': 'text/plain; charset=utf-8' });
      res.end(String(e));
    }
    return;
  }
  if (u.pathname !== '/' && u.pathname !== '/map') { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(PAGE);
}).listen(PORT, '127.0.0.1', () => console.log('http://localhost:' + PORT));
