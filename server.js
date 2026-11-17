const http = require('http');
const SRC = 'https://jshsus.kr/contents/ssam/check/index.php';
const SITE = 'https://jshsus.kr/';
const PORT = process.env.PORT || 12345;
const today = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);

// 과구리 CSS를 못 불러올 때 쓰는 근사 스타일
const FALLBACK = `<style>
body{margin:0;font-family:'Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',sans-serif}
#bar_1{background:#6cc9bf;height:61px}
#bar_1 .content,#bar_2 .content{max-width:1076px;margin:0 auto}
#bar_1 .content{height:100%;display:flex;align-items:center;gap:10px}
.jshsus-title{display:flex;align-items:center;gap:8px}
#headerImg{width:30px;height:30px}
.headerTitle{font-size:24px;color:#fff}
.bar1-con.late{display:flex;gap:4px;margin-top:8px}
.bar1-btn{color:#fff;font-size:12px;text-decoration:none}
.bar1-btn+.bar1-btn::before{content:'| ';opacity:.7}
.login-btn-div{margin-left:auto}
.login-btn{background:transparent;border:1px solid #2b6e66;padding:2px 5px;font-size:13px;cursor:pointer}
#bar_2{background:#fff;border-bottom:1px solid #e0e0e0}
.bar2-ul{list-style:none;margin:0;padding:10px 0 8px;display:flex;flex-wrap:wrap}
.bar2-btn{display:block;padding:5px 32px;font-size:18px;color:#111;text-decoration:none}
.bar2-btn:hover{color:#6cc9bf}
.table-ago{font-size:12px;color:#888;margin:0 0 4px}
.table{width:100%;border-collapse:collapse;font-size:13px}
.table th{width:80px;background:#f5f5f5;border:1px solid #ddd;padding:6px;font-weight:500;text-align:center}
.table td{border:1px solid #ddd;padding:6px}
</style>`;

let siteCss = null, cssAt = 0;
async function getSiteCss() {
  if (siteCss !== null && Date.now() - cssAt < 3600e3) return siteCss;
  try {
    const html = await (await fetch(SITE, { headers: { 'User-Agent': 'Mozilla/5.0' } })).text();
    const links = (html.match(/<link[^>]+rel=["']?stylesheet["']?[^>]*>/gi) || [])
      .map(t => t.replace(/href=["']([^"']+)["']/i, (m, h) => 'href="' + new URL(h, SITE).href + '"'));
    const head = html.split(/<\/head>/i)[0];
    const styles = head.match(/<style[\s\S]*?<\/style>/gi) || [];
    siteCss = links.length || styles.length ? links.join('\n') + styles.join('\n') : FALLBACK;
  } catch {
    siteCss = FALLBACK;
  }
  cssAt = Date.now();
  return siteCss;
}

const PAGE = String.raw`<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#35948a">
<title>과구리 - 탐활서 장소별 보기</title>
<!--SITE_CSS-->
<style>
body{background:#f5f5f5}
#tw{color:#222}
#tw *{box-sizing:border-box}
#tw a{color:inherit;text-decoration:none}
#tw button,#tw input,#tw select{font-family:inherit}
#tw .tw-wrap{max-width:1076px;margin:30px auto 50px}
#tw .tw-card{background:#fff;border:1px solid #ddd;padding:16px 20px 24px}
#tw .ttl{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding-bottom:12px;margin-bottom:12px;border-bottom:1px solid #e3e3e3}
#tw h1{font-size:24px;font-weight:500;margin:0;flex:1}
#tw .info{font-size:12px;color:#888;margin:0 0 12px}
#tw #timer{font-size:13px;padding:6px 10px;border-radius:4px;background:#eef8f7;color:#2a7a71;font-variant-numeric:tabular-nums}
#tw #timer.warn{background:#fdf3e1;color:#8a5a12}
#tw #timer.end{background:#fdeaea;color:#b03030}
#tw .vw{font-size:13px;padding:6px 14px;border-radius:4px;background:#666;color:#fff}
#tw #q{width:100%;padding:8px 10px;margin-bottom:10px;border:1px solid #ccc;border-radius:4px;font-size:13px}
#tw .filters{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;margin-bottom:6px}
#tw .filters label{display:flex;align-items:center;gap:6px;font-size:12px;color:#888}
#tw .filters input,#tw .filters select{font-size:13px;height:32px;padding:0 8px;border:1px solid #ccc;border-radius:4px;background:#fff;color:#222}
#tw .filters select{min-width:180px}
#tw .chip{font-size:12px;height:32px;padding:0 10px;border:1px solid #ddd;border-radius:4px;background:#fff;color:#222;cursor:pointer}
#tw .chip.on{background:#35948a;border-color:#35948a;color:#fff}
#tw .tw-bar{display:flex;align-items:center;gap:8px;margin:12px 0 8px}
#tw .tw-bar .chip{height:auto;padding:4px 10px}
#tw .sum{flex:1;font-size:12px;color:#666}
#tw .cnt{font-size:13px;font-weight:700;min-width:40px;text-align:center;padding:2px 8px;border-radius:4px;background:#35948a;color:#fff}

#tw .grp{background:#f2f2f2;border-radius:6px;margin-bottom:7px;overflow:hidden}
#tw .gh{display:flex;align-items:center;gap:8px;padding:13px 18px;font-size:17px;cursor:pointer;list-style:none;user-select:none}
#tw .gh::-webkit-details-marker{display:none}
#tw .gh::after{content:'›';font-size:20px;color:#999;transition:transform .15s}
#tw details[open]>.gh::after{transform:rotate(90deg)}
#tw .nm{flex:1}
#tw .grp.etc .cnt{background:#888}
#tw .grp.empty .gh{font-size:13px;color:#888}
#tw .grp.empty .cnt{background:#ccc;color:#555}
#tw .none{padding:10px 18px;background:#fff;border-top:1px solid #e5e5e5;font-size:12px;color:#888;line-height:1.8}

#tw .tabs{display:flex;gap:6px;flex-wrap:wrap;margin:12px 0}
#tw .tab{padding:7px 14px;border:1px solid #ddd;border-radius:4px;background:#fff;color:#222;font-size:14px;display:flex;gap:6px;align-items:center;cursor:pointer}
#tw .tab.on{border-color:#35948a;background:#35948a;color:#fff}
#tw .tab span{font-size:11px;padding:1px 6px;border-radius:4px;background:#eef8f7;color:#2a7a71}
#tw .floor{display:flex;gap:6px;margin-bottom:5px;overflow-x:auto}
#tw .fl{flex:0 0 42px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:#555;background:#eee;border-radius:4px}
#tw .rows{flex:1;min-width:640px;display:flex;flex-direction:column;gap:4px}
#tw .rowx{display:flex;gap:4px}
#tw .rowx.wrap{flex-wrap:wrap}
#tw .cell{flex:1 1 0;min-width:0;min-height:50px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:4px;font-size:11px;text-align:center;word-break:keep-all;border:1px solid #ccc;border-radius:4px;background:#fff;color:#222;cursor:pointer}
#tw .cell.off{background:#f5f5f5;color:#aaa;border-style:dashed;cursor:default}
#tw .cell.has{background:#eef8f7;border-color:#35948a;color:#2a7a71;font-weight:600}
#tw .cell.sel{outline:2px solid #35948a;outline-offset:1px}
#tw .cell .cnt{font-size:11px;min-width:0;padding:1px 6px}
#tw .rowx.wrap .cell{flex:0 0 auto;padding:6px 12px}
#tw .det{border:1px solid #ddd;border-radius:6px;margin:6px 0 12px;overflow:hidden}
#tw .dh{padding:9px 16px;background:#f2f2f2;font-size:14px;font-weight:500}

/* 탐활서 항목: 기존 탐활서 확인 UI 사용 */
#tw .tw-items{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding:12px 16px 14px;background:#fff;border-top:1px solid #e5e5e5}
#tw .tw-item{min-width:0}
#tw .tw-item .table{width:100%}
@media(max-width:700px){#tw .tw-items{grid-template-columns:1fr}}
#tw .tw-item .table{margin-bottom:0}
#tw .pb{font-size:10px;padding:1px 5px;margin-left:4px;border-radius:3px;background:#35948a;color:#fff;vertical-align:middle}
#tw .pb.we{background:#3b6fb6}
#tw .tw-empty{padding:12px 16px;background:#fff;font-size:12px;color:#888}
#tw .err{padding:14px;border-radius:6px;background:#fdeaea;color:#b03030}
</style>
</head>
<body>
<nav id="navbar">
  <div id="bar_1">
    <div class="content">
      <div class="bar1-con">
        <a href="https://jshsus.kr" style="text-decoration: none;">
          <div class="jshsus-title">
            <img id="headerImg" src="https://jshsus.kr/resources/icon/lIcon.png">
            <span style="vertical-align: baseline;" class="headerTitle">과구리</span>
          </div>
        </a>
      </div>
      <div class="bar1-con late">
        <a href="https://jshsus.kr/contents/introduce/index.php" class="bar1-btn">소개</a>
        <a href="https://points.jshsus.kr" class="bar1-btn">학생부 전산시스템</a>
      </div>
      <div class="login-btn-div">
        <input type="button" value="로그인" class="login-btn" onclick="location.href='https://jshsus.kr'">
      </div>
    </div>
  </div>
  <div id="bar_2">
    <div class="content">
      <div class="bar2-con">
        <ul class="bar2-ul">
          <li class="bar2-li"><a href="https://jshsus.kr/contents/council/index.php" class="bar2-btn">공지사항</a></li>
          <li class="bar2-li"><a href="https://jshsus.kr/contents/ssam/index.php" class="bar2-btn">탐활서</a></li>
          <li class="bar2-li"><a href="https://jshsus.kr/contents/school/index.php" class="bar2-btn">자유게시판</a></li>
          <li class="bar2-li"><a href="https://jshsus.kr/contents/petition/index.php" class="bar2-btn">청원·제안</a></li>
          <li class="bar2-li"><a href="https://jshsus.kr/contents/house/sync.php" class="bar2-btn">상벌점/휴대폰</a></li>
          <li class="bar2-li"><a href="https://jshsus.kr/contents/jbs/index.php" class="bar2-btn">JBS</a></li>
          <li class="bar2-li"><a href="https://jshsus.kr/contents/lost/index.php" class="bar2-btn">분실물</a></li>
          <li class="bar2-li"><a href="https://jshsus.kr/contents/cannon/index.php" class="bar2-btn">대포</a></li>
          <li class="bar2-li"><a href="https://plma.jshsus.kr/remote/songs/request" class="bar2-btn">기상곡 신청</a></li>
          <li class="bar2-li"><a href="https://jshsus.kr/contents/seteug/index.php" class="bar2-btn">세특 바이트 계산기</a></li>
          <li class="bar2-li"><a href="https://jshsus.kr/contents/thanks/index.php" class="bar2-btn">감사챌린지</a></li>
          <li class="bar2-li"><a href="https://jshsus.kr/contents/zero-waste/index.php" class="bar2-btn">잔반제로</a></li>
        </ul>
      </div>
    </div>
  </div>
</nav>
<main id="tw"><div class="tw-wrap"><div class="tw-card">
<div class="ttl"><h1>📍 탐활서 장소별 보기</h1><span id="timer"></span><a id="vw" class="vw" href="/map">지도 보기</a></div>
<p class="info">선택한 날짜부터 최대 100개까지 조회됩니다. 제출 마감은 매일 18:00입니다.</p>
<input id="q" placeholder="학번, 이름, 지도교사, 활동내용 검색">
<div class="filters">
  <label>날짜 <input type="date" id="day"></label>
  <button id="all" class="chip">전체 기간</button>
  <label>시간 <select id="per"></select></label>
</div>
<div class="tw-bar"><div id="sum" class="sum">불러오는 중…</div><button id="tg" class="chip">모두 펼치기</button></div>
<div id="out"></div>
</div></div></main>
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
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const today=()=>new Date(Date.now()+9*3600e3).toISOString().slice(0,10);
const qs=new URLSearchParams(location.search).get('start');
let data=[],day=/^\d{4}-\d{2}-\d{2}$/.test(qs||'')?qs:today(),per=0,sel='',bld=LAYOUT[0].b,loaded='';

$('vw').textContent=view==='map'?'목록 보기':'지도 보기';
$('vw').href=view==='map'?'/':'/map';
if(view==='map')$('tg').style.display='none';
$('per').innerHTML='<option value="0">전체</option>'+
  '<optgroup label="면학">'+[1,2,3].map(i=>'<option value="'+i+'">'+esc((PERIODS[i][0]+' '+PERIODS[i][2]).trim())+'</option>').join('')+'</optgroup>'+
  '<optgroup label="주말">'+[4,5,6,7].map(i=>'<option value="'+i+'">'+esc(PERIODS[i][0]+' '+PERIODS[i][2])+'</option>').join('')+'</optgroup>';

function tick(){
  const s=18*3600-Math.floor(Date.now()/1000+9*3600)%86400,t=$('timer');
  if(s<=0){t.className='end';t.textContent='오늘 제출 마감';return}
  const p=n=>String(n).padStart(2,'0');
  t.className=s<1800?'warn':'';
  t.textContent='제출 마감까지 '+p(Math.floor(s/3600))+':'+p(Math.floor(s%3600/60))+':'+p(s%60);
}

async function load(start){
  $('sum').textContent='불러오는 중…';
  try{
    const res=await fetch('/api?start='+start,{cache:'no-store'});
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
      let ago='',el=tb.previousElementSibling;
      while(el&&!el.classList.contains('table-ago')&&el.tagName!=='TABLE')el=el.previousElementSibling;
      if(el&&el.classList.contains('table-ago'))ago=el.textContent.trim();
      const x={p:o['활동장소'],h:o['활동시간']||'',c:o['활동내용']||'',r:o['대표학생']||'',m:o['참가학생']||'',t:o['지도교사']||'',s:o['지원']||''};
      const id=[x.p,x.h,x.c,x.r,x.m,x.t].join('|');
      if(!map.has(id))map.set(id,Object.assign(x,{ago,rooms:classify(x.p),per:periods(x),d:[]}));
      const d=o['활동날짜']||'';
      if(d&&!map.get(id).d.includes(d))map.get(id).d.push(d);
    });
    data=[...map.values()];
    loaded=start;
    render();
  }catch(e){$('out').innerHTML='<div class="err">탐활서를 불러오지 못했습니다: '+esc(e.message)+'</div>';$('sum').textContent=''}
}

// 기존 탐활서 확인 페이지와 같은 마크업
const tr=(k,v,st)=>'<tr><th>'+k+'</th><td><p style="margin: 0;'+(st||'')+'">'+esc(v)+'</p></td></tr>';
const item=x=>'<div class="tw-item"><p class="table-ago">'+esc(x.ago)+
  x.per.map(i=>'<span class="pb'+(i>3?' we':'')+'">'+esc(PERIODS[i][0])+'</span>').join('')+'</p>'+
  '<table class="table"><tbody>'+
  tr('활동날짜',day||x.d.join(', '))+
  tr('활동시간',x.h,' height: 24px; overflow: auto;')+
  tr('활동장소',x.p)+
  tr('활동내용',x.c)+
  tr('대표학생',x.r)+
  tr('참가학생',x.m,' height: 80px; overflow: auto;')+
  tr('지도교사',x.t)+
  tr('지원',x.s)+
  '</tbody></table></div>';

function listView(g,q){
  const order=Object.keys(g).filter(r=>r!=='기타').sort((a,b)=>g[b].length-g[a].length);
  if(g['기타'])order.push('기타');
  let h=order.map(r=>'<details class="grp'+(r==='기타'?' etc':'')+'"'+(q?' open':'')+'>'+
    '<summary class="gh"><span class="nm">'+esc(r)+'</span><span class="cnt">'+g[r].length+'건</span></summary>'+
    '<div class="tw-items">'+g[r].map(item).join('')+'</div></details>').join('');
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
    return'<div class="det"><div class="dh">'+esc(nm)+' · '+it.length+'건</div>'+(it.length?'<div class="tw-items">'+it.map(item).join('')+'</div>':'<div class="tw-empty">탐활서 없음</div>')+'</div>';
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
  $('all').classList.toggle('on',!day);
  $('sum').textContent=(day?day:loaded+' 이후 전체')+' · 사용 중 '+Object.keys(g).length+'곳 · 탐활서 '+n+'건';
  $('out').innerHTML=view==='map'?mapView(g):listView(g,q);
  $('tg').textContent='모두 펼치기';
}

$('day').value=day;
$('day').onchange=()=>{
  day=$('day').value;sel='';
  if(day)load(day);else render();
};
$('all').onclick=()=>{day='';$('day').value='';sel='';render()};
$('per').onchange=()=>{per=+$('per').value;sel='';render()};
$('out').onclick=e=>{
  const t=e.target.closest('[data-b]');
  if(t){bld=t.dataset.b;sel='';render();return}
  const c=e.target.closest('[data-room]');
  if(c){sel=sel===c.dataset.room?'':c.dataset.room;render()}
};
$('tg').onclick=()=>{
  const ds=[...document.querySelectorAll('#tw details.grp:not(.empty)')],o=ds.some(d=>d.open);
  ds.forEach(d=>d.open=!o);
  $('tg').textContent=o?'모두 펼치기':'모두 접기';
};
$('q').oninput=render;
tick();setInterval(tick,1000);load(day);
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
  res.end(PAGE.replace('<!--SITE_CSS-->', await getSiteCss()));
}).listen(PORT, '127.0.0.1', () => console.log('http://localhost:' + PORT));
