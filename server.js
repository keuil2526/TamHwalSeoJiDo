const http = require('http');
const SRC = 'https://jshsus.kr/contents/ssam/check/index.php';
const PORT = process.env.PORT || 12345;
const today = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);

const PAGE = String.raw`<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#35948a">
<title>과구리 - 탐활서 장소별 보기</title>
<style>
*{box-sizing:border-box}
body{margin:0;font-family:'Noto Sans KR',system-ui,-apple-system,'Malgun Gothic',sans-serif;color:#222;background:#f4f4f4}
a{color:inherit;text-decoration:none}
button{font:inherit;color:inherit}
.top{background:#6cc9bf}
.top .in{max-width:1340px;margin:0 auto;padding:14px 20px;display:flex;align-items:center;gap:14px;color:#fff}
.logo{display:flex;align-items:center;gap:10px;font-size:32px;font-weight:700;color:#fff;letter-spacing:-1px}
.sub{display:flex;gap:6px;font-size:17px;color:#fff;margin-top:8px}
.sub span{opacity:.7}
.gnb{background:#fff;border-bottom:1px solid #e3e3e3}
.gnb ul{max-width:1100px;margin:0 auto;padding:16px 20px;list-style:none;display:flex;flex-wrap:wrap;justify-content:center;gap:14px 64px}
.gnb a{font-size:22px;font-weight:500;color:#111}
.gnb a.on{color:#35948a;font-weight:700}
main{max-width:1060px;margin:36px auto;padding:24px 28px 40px;background:#fff;border:1px solid #ddd}
.ttl{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px}
h1{font-size:24px;margin:0;flex:1}
.info{font-size:13px;color:#777;margin:0 0 14px}
#timer{font-size:15px;padding:6px 12px;border-radius:8px;background:#e1f5ee;color:#085041;font-variant-numeric:tabular-nums}
#timer.warn{background:#faeeda;color:#633806}
#timer.end{background:#fcebeb;color:#791f1f}
.vw{font-size:15px;font-weight:600;padding:6px 14px;border-radius:8px;background:#35948a;color:#fff}
#q{width:100%;padding:9px 12px;margin-bottom:12px;border:1px solid #ccc;border-radius:8px;font-size:14px}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;align-items:center}
.chips .lb{font-size:13px;color:#888;width:36px}
.chip{font-size:13px;padding:5px 12px;border:1px solid #ccc;border-radius:999px;background:#fff;cursor:pointer}
.chip.on{background:#35948a;border-color:#35948a;color:#fff}
.chip.we.on{background:#3b6fb6;border-color:#3b6fb6}
.bar{display:flex;align-items:center;gap:8px;margin:14px 0 10px}
.sum{flex:1;font-size:13px;color:#666}
.cnt{font-size:15px;font-weight:700;min-width:44px;text-align:center;padding:3px 12px;border-radius:999px;background:#35948a;color:#fff}

.grp{border:1px solid #ddd;border-radius:12px;background:#fff;margin-bottom:8px;overflow:hidden}
.gh{display:flex;align-items:center;gap:10px;padding:12px 16px;font-size:16px;font-weight:600;cursor:pointer;list-style:none;user-select:none}
.gh::-webkit-details-marker{display:none}
.gh::before{content:'▸';color:#888;width:14px}
details[open]>.gh::before{content:'▾'}
details[open]>.gh{background:#f1f7f6}
.nm{flex:1}
.grp.etc .cnt{background:#888}
.grp.empty .gh{font-size:14px;font-weight:400;color:#888}
.grp.empty .cnt{background:#ddd;color:#555}
.none{padding:10px 16px;border-top:1px solid #eee;font-size:13px;color:#888;line-height:1.8}

.tabs{display:flex;gap:6px;flex-wrap:wrap;margin:14px 0}
.tab{padding:8px 16px;border:1px solid #ccc;border-radius:10px;background:#fff;font-size:15px;font-weight:600;display:flex;gap:8px;align-items:center;cursor:pointer}
.tab.on{border-color:#35948a;background:#35948a;color:#fff}
.tab span{font-size:12px;padding:1px 8px;border-radius:999px;background:#e1f5ee;color:#085041}
.floor{display:flex;gap:8px;margin-bottom:6px;overflow-x:auto}
.fl{flex:0 0 48px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;color:#445;background:#e3e8f5;border-radius:8px}
.rows{flex:1;min-width:680px;display:flex;flex-direction:column;gap:4px}
.rowx{display:flex;gap:4px}
.rowx.wrap{flex-wrap:wrap}
.cell{flex:1 1 0;min-width:0;min-height:56px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:4px;font-size:12px;text-align:center;word-break:keep-all;border:1px solid #ccc;border-radius:6px;background:#fff;cursor:pointer}
.cell.off{background:#f3f3f1;color:#aaa;border-style:dashed;cursor:default}
.cell.has{background:#e1f5ee;border-color:#35948a;color:#085041;font-weight:600}
.cell.sel{outline:2px solid #35948a;outline-offset:1px}
.cell .cnt{font-size:13px;min-width:0;padding:1px 9px}
.rowx.wrap .cell{flex:0 0 auto;padding:6px 14px}
.det{border:1px solid #35948a;border-radius:12px;margin:6px 0 14px;overflow:hidden}
.dh{padding:8px 16px;background:#e1f5ee;font-weight:600;color:#085041}

.row{padding:10px 16px;border-top:1px solid #eee;font-size:13px;line-height:1.6}
.row b{font-size:14px}
.meta{color:#666}
.pb{font-size:11px;padding:1px 7px;border-radius:999px;background:#35948a;color:#fff;vertical-align:middle}
.pb.we{background:#3b6fb6}
.dt{display:inline-block;font-size:12px;padding:0 8px;margin:2px 4px 0 0;border-radius:6px;background:#e6f1fb;color:#0c447c}
.err{padding:16px;border-radius:10px;background:#fcebeb;color:#791f1f}
</style>
</head>
<body>
<header class="top"><div class="in">
  <a class="logo" href="https://jshsus.kr">
    <svg width="38" height="38" viewBox="0 0 38 38" aria-hidden="true"><rect x="0" y="15" width="23" height="23" fill="#4a4f55"/><rect x="15" y="0" width="23" height="23" fill="#b9c3c6"/><rect x="15" y="15" width="8" height="8" fill="#fff"/></svg>
    과구리
  </a>
  <div class="sub"><a href="https://jshsus.kr/contents/introduce/index.php">소개</a><span>|</span><a href="https://points.jshsus.kr">학생부 전산시스템</a></div>
</div></header>
<nav class="gnb"><ul>
  <li><a href="https://jshsus.kr/contents/council/index.php">공지사항</a></li>
  <li><a class="on" href="https://jshsus.kr/contents/ssam/index.php">탐활서</a></li>
  <li><a href="https://jshsus.kr/contents/school/index.php">자유게시판</a></li>
  <li><a href="https://jshsus.kr/contents/petition/index.php">청원·제안</a></li>
  <li><a href="https://jshsus.kr/contents/house/sync.php">상벌점/휴대폰</a></li>
  <li><a href="https://jshsus.kr/contents/jbs/index.php">JBS</a></li>
  <li><a href="https://jshsus.kr/contents/lost/index.php">분실물</a></li>
  <li><a href="https://jshsus.kr/contents/cannon/index.php">대포</a></li>
  <li><a href="https://plma.jshsus.kr/remote/songs/request">기상곡 신청</a></li>
  <li><a href="https://jshsus.kr/contents/seteug/index.php">세특 바이트 계산기</a></li>
  <li><a href="https://jshsus.kr/contents/thanks/index.php">감사챌린지</a></li>
  <li><a href="https://jshsus.kr/contents/zero-waste/index.php">잔반제로</a></li>
</ul></nav>
<main>
<div class="ttl"><h1>탐활서 장소별 보기</h1><span id="timer"></span><a id="vw" class="vw" href="/map">지도 보기</a></div>
<p class="info">탐활서 확인 페이지 기준 최대 100개까지 조회됩니다. 제출 마감은 매일 18:00입니다.</p>
<input id="q" placeholder="학번, 이름, 지도교사, 활동내용 검색">
<div class="chips" id="dates"></div>
<div class="chips" id="pers"></div>
<div class="chips" id="wkd"></div>
<div class="bar"><div id="sum" class="sum">불러오는 중…</div><button id="tg" class="chip">모두 펼치기</button></div>
<div id="out"></div>
</main>
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
    {f:'4층',rows:[['실험기자재실'],['화학 R&E실','*화학연구실','분석기기실2','*준비실','화학 실험실']]},
    {f:'3층',rows:[['배양실'],['생명 R&E실','*생명과학 연구실','전자현미경실','*준비실','생명 실험실']]},
    {f:'2층',rows:[['*학부모상담실','수학 1실','수학 2실','풍동실험실'],['물리 R&E실','*물리연구실','*심화기자재','*준비실','물리 실험실']]},
    {f:'1층',rows:[['시청각실','박편제작실'],['지구 R&E실','*지구과학 연구실','글로브실','*준비실','지구 실험실']]}
  ]},
  {b:'성취관',floors:[
    {f:'2·3층',rows:[['다목적 체육관 강당','*체육연구실']]},
    {f:'1층',rows:[['탁구실','체력단련실','골프연습실'],['요가실','*학생부 연구실','미술실','음악실','피아노실','기악실']]}
  ]}
];
const ALL={};
LAYOUT.forEach(B=>B.floors.forEach(F=>F.rows.forEach(r=>r.forEach(n=>{if(n[0]!=='*')ALL[n]=B.b}))));
const KEYS=[['천문대','천문대'],['풍동','풍동실험실'],['박편','박편제작실'],['글로브','글로브실'],['시청각','시청각실'],
  ['전자현미경','전자현미경실'],['분석기기','분석기기실2'],['배양','배양실'],['실험기자재','실험기자재실'],
  ['코딩','코딩실'],['정보','코딩실'],['멀티','멀티실'],['어학','어학실'],['면학','면학실'],
  ['학생회','학생회실'],['무한상상','무한상상실'],['독서토론','독서토론실'],['도서','도서실'],
  ['체력단련','체력단련실'],['탁구','탁구실'],['골프','골프연습실'],['요가','요가실'],
  ['미술','미술실'],['피아노','피아노실'],['기악','기악실'],['음악','음악실'],['강당','다목적 체육관 강당'],['체육관','다목적 체육관 강당']];
// [이름, 시작 시각(활동시간에서 찾는 값), 표시 시간]
const PERIODS={
  1:['1면학','19:10','19:10~20:20'],
  2:['2면학','20:30','20:30~21:30'],
  3:['3면학','21:40',''],
  4:['주말1','09:00','09:00~10:40'],
  5:['주말2','11:00','11:00~12:00'],
  6:['주말3','14:00','14:00~15:40'],
  7:['주말4','16:00','16:00~18:00']
};

function one(p){
  const k=p.replace(/\s/g,'').toUpperCase();
  const m=k.match(/([1-3])(?:-|학년)([1-4])/);
  if(m)return m[1]+'-'+m[2]+' 교실';
  const kw=KEYS.find(x=>k.includes(x[0]));
  if(kw)return kw[1];
  if(k.includes('수학'))return k.includes('1')?'수학 1실':k.includes('2')?'수학 2실':'수학 3실';
  const s=['물리','화학','생명','지구'].find(x=>k.includes(x))||(k.includes('생물')?'생명':'');
  if(s)return s+(/R&E|RNE|알앤이/.test(k)?' R&E실':' 실험실');
  if(/(^|[^A-Z])AI([^A-Z]|$)|인공지능/.test(k))return'AI실';
  return'기타';
}
function classify(p){
  const r=[...new Set(p.replace(/\([^)]*\)/g,'').split(/[,\/]/).map(s=>s.trim()).filter(Boolean).map(one))];
  return r.length?r:['기타'];
}
function periods(x){
  const p=Object.keys(PERIODS).map(Number).filter(i=>x.h.includes(PERIODS[i][1]));
  if(!p.includes(3)&&(x.c+x.m+x.p).includes('3면학'))p.push(3);
  return p.sort((a,b)=>a-b);
}

const view=location.pathname==='/map'?'map':'list';
let data=[],day='',per=0,sel='',bld=LAYOUT[0].b;
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const today=()=>new Date(Date.now()+9*3600e3).toISOString().slice(0,10);

$('vw').textContent=view==='map'?'목록 보기':'지도 보기';
$('vw').href=(view==='map'?'/':'/map')+location.search;
if(view==='map')$('tg').style.display='none';

function tick(){
  const s=18*3600-Math.floor(Date.now()/1000+9*3600)%86400,t=$('timer');
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
      const x={p:o['활동장소'],h:o['활동시간']||'',c:o['활동내용']||'',r:o['대표학생']||'',m:o['참가학생']||'',t:o['지도교사']||''};
      const id=[x.p,x.h,x.c,x.r,x.m,x.t].join('|');
      if(!map.has(id))map.set(id,Object.assign(x,{rooms:classify(x.p),per:periods(x),d:[]}));
      const d=o['활동날짜']||'';
      if(d&&!map.get(id).d.includes(d))map.get(id).d.push(d);
    });
    data=[...map.values()];
    if(!data.length){$('sum').textContent='조회된 탐활서가 없습니다.';return}
    if(data.some(x=>x.d.includes(today())))day=today();
    chips();render();
  }catch(e){$('out').innerHTML='<div class="err">탐활서를 불러오지 못했습니다: '+esc(e.message)+'</div>';$('sum').textContent=''}
}

function chips(){
  const ds=[...new Set(data.flatMap(x=>x.d))].sort();
  const mk=(el,lb,items)=>{$(el).innerHTML='<span class="lb">'+lb+'</span>'+items.map(([k,t,on,cls])=>'<button class="chip'+(cls||'')+(on?' on':'')+'" data-k="'+esc(k)+'">'+esc(t)+'</button>').join('')};
  mk('dates','날짜',[['','전체',day===''],...ds.map(d=>[d,d.slice(5),day===d])]);
  mk('pers','면학',[[0,'전체',!per],...[1,2,3].map(i=>[i,(PERIODS[i][0]+' '+PERIODS[i][2]).trim(),per===i])]);
  mk('wkd','주말',[4,5,6,7].map(i=>[i,PERIODS[i][0]+' '+PERIODS[i][2],per===i,' we']));
}

const item=x=>'<div class="row"><b>'+esc(x.c)+'</b>'+
  x.per.map(i=>' <span class="pb'+(i>3?' we':'')+'">'+esc(PERIODS[i][0])+'</span>').join('')+
  '<br><span class="meta">'+esc(x.h)+' · 대표 '+esc(x.r)+' · 지도 '+esc(x.t)+'<br>장소 표기: '+esc(x.p)+'</span><br>'+esc(x.m)+
  (day?'':'<br>'+x.d.map(d=>'<span class="dt">'+esc(d.slice(5))+'</span>').join(''))+'</div>';

function listView(g,q){
  const order=Object.keys(g).filter(r=>r!=='기타').sort((a,b)=>g[b].length-g[a].length);
  if(g['기타'])order.push('기타');
  let h=order.map(r=>'<details class="grp'+(r==='기타'?' etc':'')+'"'+(q?' open':'')+'>'+
    '<summary class="gh"><span class="nm">'+esc(r)+'</span><span class="cnt">'+g[r].length+'건</span></summary>'+
    g[r].map(item).join('')+'</details>').join('');
  const empty=Object.keys(ALL).filter(r=>!g[r]);
  if(!q&&empty.length)h+='<details class="grp empty"><summary class="gh"><span class="nm">비어 있는 장소</span><span class="cnt">'+empty.length+'곳</span></summary><div class="none">'+empty.map(esc).join(' · ')+'</div></details>';
  return h;
}

function mapView(g){
  const extra=Object.keys(g).filter(r=>!ALL[r]);
  const bcnt={};
  Object.keys(g).forEach(r=>{const b=ALL[r]||'기타';bcnt[b]=(bcnt[b]||0)+g[r].length});
  if(bld==='기타'&&!extra.length)bld=LAYOUT[0].b;
  const tab=(k,lb)=>'<button class="tab'+(bld===k?' on':'')+'" data-b="'+esc(k)+'">'+esc(lb)+'<span>'+(bcnt[k]||0)+'건</span></button>';
  const cell=nm=>{
    if(nm[0]==='*')return'<div class="cell off">'+esc(nm.slice(1))+'</div>';
    const c=g[nm]?g[nm].length:0;
    return'<button class="cell'+(c?' has':'')+(sel===nm?' sel':'')+'" data-room="'+esc(nm)+'">'+esc(nm)+(c?'<span class="cnt">'+c+'건</span>':'')+'</button>';
  };
  const detail=nm=>{
    const it=g[nm]||[];
    return'<div class="det"><div class="dh">'+esc(nm)+' · '+it.length+'건</div>'+(it.length?it.map(item).join(''):'<div class="row meta">탐활서 없음</div>')+'</div>';
  };
  let h='<div class="tabs">'+LAYOUT.map(B=>tab(B.b,B.b)).join('')+(extra.length?tab('기타','배치도 밖'):'')+'</div>';
  if(bld==='기타'){
    h+='<div class="rowx wrap">'+extra.map(cell).join('')+'</div>';
    if(extra.includes(sel))h+=detail(sel);
  }else{
    LAYOUT.find(B=>B.b===bld).floors.forEach(F=>{
      h+='<div class="floor"><div class="fl">'+esc(F.f)+'</div><div class="rows">'+F.rows.map(r=>'<div class="rowx">'+r.map(cell).join('')+'</div>').join('')+'</div></div>';
      if(sel&&F.rows.some(r=>r.includes(sel)))h+=detail(sel);
    });
  }
  return h;
}

function render(){
  const q=$('q').value.trim().toLowerCase(),g={};let n=0;
  data.forEach(x=>{
    if(day&&!x.d.includes(day))return;
    if(per&&!x.per.includes(per))return;
    if(q&&!(x.p+x.rooms.join(' ')+x.c+x.r+x.m+x.t).toLowerCase().includes(q))return;
    x.rooms.forEach(r=>(g[r]=g[r]||[]).push(x));n++;
  });
  $('sum').textContent='사용 중 '+Object.keys(g).length+'곳 · 탐활서 '+n+'건';
  $('out').innerHTML=view==='map'?mapView(g):listView(g,q);
  $('tg').textContent='모두 펼치기';
}

$('dates').onclick=e=>{const b=e.target.closest('button');if(!b)return;day=b.dataset.k;sel='';chips();render()};
const perClick=e=>{const b=e.target.closest('button');if(!b)return;per=+b.dataset.k;sel='';chips();render()};
$('pers').onclick=perClick;
$('wkd').onclick=perClick;
$('out').onclick=e=>{
  const t=e.target.closest('[data-b]');
  if(t){bld=t.dataset.b;sel='';render();return}
  const c=e.target.closest('[data-room]');
  if(c){sel=sel===c.dataset.room?'':c.dataset.room;render()}
};
$('tg').onclick=()=>{
  const ds=[...document.querySelectorAll('details.grp:not(.empty)')],o=ds.some(d=>d.open);
  ds.forEach(d=>d.open=!o);
  $('tg').textContent=o?'모두 펼치기':'모두 접기';
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
