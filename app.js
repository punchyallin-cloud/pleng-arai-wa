const C={
  rounds:6,
  steps:[1,3,5,10],
  artists:{
    "ฮิตไทย":["Three Man Down","Tilly Birds","NONT TANONT","INK WARUNTORN","Jeff Satur","BOWKYLION","Cocktail","bodyslam","Potato","Klear","Getsunova","Polycat","Musketeers","The TOYS","MEYOU","fellow fellow","Only Monday","Tattoo Colour","PALMY","Atom Chanakan","Pop Pongkool","Billkin","PP Krit","Mirrr","PURPEECH","PUN","YOUNGOHM","F.HERO","Slot Machine","Lipta","Scrubb","Lomosonic","Num Kala"],
    "T-POP":["4EVE","BUS because of you i shine","PiXXiE","LYKN","PROXIE","ATLAS","PERSES","DICE","BNK48","VIIS","TRINITY","bamm","PRETZELLE","QRRA","MXFRUIT","LAZ1"],
    "2000s":["bodyslam","Potato","Clash","Big Ass","Da Endorphine","Klear","Tattoo Colour","PALMY","Silly Fools","Mild","Calories Blah Blah","Lomosonic","Zeal","Retrospect","Sweet Mullet","Paradox","Lipta","Scrubb"],
    "ลูกทุ่ง":["มนต์แคน แก่นคูน","ลำไย ไหทองคำ","ก้อง ห้วยไร่","ต่าย อรทัย","ไผ่ พงศธร","ศิริพร อำไพพงษ์","เบิ้ล ปทุมราช","จินตหรา พูนลาภ","หญิงลี ศรีจุมพล","ตรี ชัยณรงค์","แซ็ค ชุมแพ","เนสกาแฟ ศรีนคร"],
    "อินดี้":["Safeplanet","Whal & Dolph","Yew","Dept","PURPEECH","Mirrr","HYBS","Tilly Birds","Polycat","LANDOKMAI","Anatomy Rabbit","Moving and Cut","WANYAi","Loserpop","H3F","Rocketman"],
    "แร็ปไทย":["YOUNGOHM","YOUNGGU","DIAMOND MQT","Z9","YOUNGTA","DIEHEART","1MILL","SPRITE","AUTTA","F.HERO","DABOYWAY","P6ICK","2Ectasy","OG-ANIC","LAZYLOXY","MAIYARAP","URBOYTJ","SARAN","BLACKSHEEP","MILLI"],
"Kamikaze":["FFK","K-OTIC","Four-Mod","Neko Jump","Waii","Knomjean","Mila","Siska","3.2.1","SWEE:D","Timethai","XIS","Kamikaze"],
    "สุ่มทั้งหมด":["Three Man Down","Tilly Birds","NONT TANONT","INK WARUNTORN","BOWKYLION","Cocktail","bodyslam","4EVE","BUS because of you i shine","LYKN","PROXIE","PiXXiE","ATLAS","PERSES","Potato","PALMY","Tattoo Colour","Only Monday","fellow fellow","PUN","YOUNGOHM","YOUNGGU","DIAMOND MQT","Z9","1MILL","SPRITE","AUTTA","Safeplanet","Whal & Dolph","Lipta","Scrubb","Slot Machine"]
  }
};

const LEVELS=[
  {name:"Easy",cls:"easy"},
  {name:"Normal",cls:"normal"},
  {name:"Medium",cls:"medium"},
  {name:"Hard",cls:"hard"},
  {name:"Expert",cls:"expert"},
  {name:"Impossible",cls:"impossible"}
];

const TPOP=C.artists["T-POP"];
const RAP=C.artists["แร็ปไทย"];
const KAMIKAZE=C.artists["Kamikaze"];
const $=x=>document.getElementById(x);
const E={
 setup:$("setup"),loading:$("loading"),game:$("game"),start:$("start"),modes:$("modes"),
 lt:$("loadingText"),ml:$("modeLabel"),sec:$("seconds"),play:$("play"),as:$("audioState"),
 ans:$("answer"),sugs:$("suggestions"),submit:$("submit"),skip:$("skip"),score:$("score"),
 round:$("round"),remain:$("remain"),msg:$("msg"),result:$("result"),okIcon:$("okIcon"),
 okText:$("okText"),art:$("art"),title:$("title"),artist:$("artist"),gain:$("gain"),
 apple:$("apple"),next:$("next"),finish:$("finish"),final:$("final"),share:$("share"),
 again:$("again"),copy:$("copy"),home:$("home"),mute:$("mute"),openLeaderboard:$("openLeaderboard"),viewLeaderboard:$("viewLeaderboard"),leaderboard:$("leaderboard"),leaderboardList:$("leaderboardList"),closeLeaderboard:$("closeLeaderboard"),playerName:$("playerName"),playerIG:$("playerIG"),saveScore:$("saveScore"),playerIdText:$("playerIdText"),artistFilters:$("artistFilters"),
 artistGrid:$("artistGrid"),artistPanelTitle:$("artistPanelTitle"),listenText:$("listenText"),difficultyNow:$("difficultyNow")
};

let mode="ฮิตไทย", artistFilter="ALL", pool=[], buckets=[[],[],[],[],[],[]], list=[];
let r=0, step=0, score=0, audio=null, timer=null, muted=false, selected=null, searchTimer=null;

function jsonp(term,limit=60){
 return new Promise((res,rej)=>{
  const cb="__prw"+Date.now()+Math.random().toString(36).slice(2);
  const s=document.createElement("script");
  let finished=false;
  const t=setTimeout(()=>done(new Error("timeout")),15000);
  function done(e,d){
   if(finished)return;
   finished=true;
   clearTimeout(t);
   try{delete window[cb]}catch{}
   try{s.remove()}catch{}
   e?rej(e):res(d);
  }
  window[cb]=d=>done(null,d);
  const p=new URLSearchParams({term,country:"TH",media:"music",entity:"song",limit:String(limit),callback:cb});
  s.src="https://itunes.apple.com/search?"+p.toString();
  s.async=true;
  s.onerror=()=>done(new Error("network"));
  document.body.appendChild(s);
 });
}

function clean(a){
 const m=new Map();
 (a||[]).forEach(x=>{
  if(x.previewUrl&&x.trackName&&x.artistName&&!m.has(x.trackId)){
   m.set(x.trackId,{
    id:x.trackId,title:x.trackName,artist:x.artistName,preview:x.previewUrl,
    art:(x.artworkUrl100||"").replace("100x100bb","500x500bb"),
    url:x.trackViewUrl||""
   });
  }
 });
 return [...m.values()];
}

function shuffle(a){
 a=[...a];
 for(let i=a.length-1;i;i--){
  const j=Math.floor(Math.random()*(i+1));
  [a[i],a[j]]=[a[j],a[i]];
 }
 return a;
}

function norm(s){
 return (s||"").toLowerCase().normalize("NFKC")
  .replace(/[()[\]{}"'’“”.,!?\-–—:;/\\]/g," ")
  .replace(/\s+/g," ").trim();
}

function artistMatches(trackArtist,wanted){
 const aa=norm(trackArtist),w=norm(wanted);
 return aa===w||aa.includes(w)||w.includes(aa);
}

function coreTitle(v){
 let s=(v||"").toLowerCase().normalize("NFKC");
 s=s.replace(/[“”‘’"'`]/g,"");
 s=s.replace(/\b(feat|ft|featuring)\.?\s+.+$/i," ");
 s=s.replace(/\s*[-–—:]\s*(live|acoustic|remaster(?:ed)?|remix|mix|version|edit|session|demo|instrumental|karaoke|ost|original soundtrack|from .+).*$/i," ");
 s=s.replace(/\(([^)]*(?:live|acoustic|remaster(?:ed)?|remix|mix|version|edit|session|demo|instrumental|karaoke|ost|soundtrack|feat|ft\.?)[^)]*)\)/gi," ");
 s=s.replace(/\[([^\]]*(?:live|acoustic|remaster(?:ed)?|remix|mix|version|edit|session|demo|instrumental|karaoke|ost|soundtrack|feat|ft\.?)[^\]]*)\]/gi," ");
 return s.replace(/\s+/g," ").trim();
}

function answerKey(v){
 return coreTitle(v).replace(/[()[\]{}.,!?/\\|_+=*&^%$#@~:;<>-]/g," ").replace(/\s+/g," ").trim();
}

function sameSongTitle(a,b){
 const x=answerKey(a),y=answerKey(b),xc=x.replace(/\s/g,""),yc=y.replace(/\s/g,"");
 if(!x||!y)return false;
 return x===y||xc===yc||(x.length>=5&&y.length>=5&&(x.includes(y)||y.includes(x)));
}

function dedupe(rows){
 return [...new Map(rows.map(x=>[answerKey(x.artist)+"|"+answerKey(x.title),x])).values()];
}

/* iTunes search order is used as a practical depth signal:
   early results = more recognizable; deeper results = harder cuts. */
function splitDepth(rows){
 const d=dedupe(rows);
 return [
  d.slice(0,2),
  d.slice(2,4),
  d.slice(4,7),
  d.slice(7,10),
  d.slice(10,14),
  d.slice(14,24)
 ];
}

async function fetchArtist(wanted){
 for(let attempt=0;attempt<2;attempt++){
  try{
   const d=await jsonp(wanted,attempt===0?35:20);
   const rows=clean(d.results).filter(x=>artistMatches(x.artist,wanted));
   if(rows.length)return splitDepth(rows);
  }catch(e){}
  await new Promise(r=>setTimeout(r,350));
 }
 return [[],[],[],[],[],[]];
}

async function build(){
 E.lt.textContent="กำลังเตรียมเพลงให้พร้อมบนมือถือ…";
 pool=[];buckets=[[],[],[],[],[],[]];

 let artists=((mode==="T-POP"||mode==="แร็ปไทย"||mode==="Kamikaze")&&artistFilter!=="ALL")
   ? [artistFilter]
   : (C.artists[mode]||C.artists["ฮิตไทย"]);

 // มือถือไม่ยิง request เยอะเกินไปพร้อมกัน
 if(artists.length>15)artists=shuffle(artists).slice(0,15);

 for(let i=0;i<artists.length;i+=3){
  const batch=artists.slice(i,i+3);
  const results=await Promise.all(batch.map(fetchArtist));
  results.forEach(parts=>{
   parts.forEach((rows,idx)=>buckets[idx].push(...rows));
   parts.forEach(rows=>pool.push(...rows));
  });
  // ถ้ามีเพลงเยอะพอแล้ว ไม่ต้องยิง API ต่อทั้งลิสต์
  if(pool.length>=70 && i>=5)break;
 }

 buckets=buckets.map(dedupe);
 pool=dedupe(pool);

 // ถ้าเลือก "รวม" แล้วผลน้อย ให้ลองศิลปินหลักอีกชุดหนึ่ง
 if(pool.length<6 && artistFilter==="ALL"){
  const fallback=(C.artists[mode]||C.artists["ฮิตไทย"]).slice(0,8);
  const results=await Promise.all(fallback.map(fetchArtist));
  results.forEach(parts=>{
   parts.forEach((rows,idx)=>buckets[idx].push(...rows));
   parts.forEach(rows=>pool.push(...rows));
  });
  buckets=buckets.map(dedupe);
  pool=dedupe(pool);
 }

 // เติมแต่ละระดับจาก pool กลางเมื่อ bucket ลึกมีเพลงน้อย
 for(let i=0;i<6;i++){
  if(buckets[i].length<2){
   const from=Math.min(pool.length,Math.floor(pool.length*(i/8)));
   buckets[i]=dedupe([...buckets[i],...pool.slice(from),...pool]);
  }
 }

 if(pool.length<6)throw new Error("not enough preview songs");
}
function chooseDifficultyList(){
 const chosen=[],usedTitles=new Set(),usedArtists=new Set();

 for(let level=0;level<6;level++){
  let candidates=shuffle(buckets[level]||[]).filter(x=>!usedTitles.has(answerKey(x.title)));
  if(!((mode==="T-POP"||mode==="แร็ปไทย"||mode==="Kamikaze")&&artistFilter!=="ALL")){
   const fresh=candidates.filter(x=>!usedArtists.has(answerKey(x.artist)));
   if(fresh.length)candidates=fresh;
  }

  let pick=candidates[0];
  if(!pick)pick=shuffle(pool).find(x=>!usedTitles.has(answerKey(x.title)));
  if(!pick)throw new Error("cannot choose six unique songs");

  chosen.push(pick);
  usedTitles.add(answerKey(pick.title));
  usedArtists.add(answerKey(pick.artist));
 }
 return chosen;
}
async function start(){
 E.setup.classList.add("hidden");
 E.loading.classList.remove("hidden");
 E.game.classList.add("hidden");
 try{
  await build();
  list=chooseDifficultyList();
  r=0;step=0;score=0;
  E.score.textContent=0;
  E.ml.textContent=((mode==="T-POP"||mode==="แร็ปไทย"||mode==="Kamikaze")&&artistFilter!=="ALL") ? `${mode} · ${shortArtist(artistFilter)}` : mode;
  E.loading.classList.add("hidden");
  E.game.classList.remove("hidden");
  load();
 }catch(e){
  console.error(e);
  E.loading.classList.add("hidden");
  E.setup.classList.remove("hidden");
  alert("ยังเตรียมเพลงไม่สำเร็จ ลองกดเริ่มใหม่อีกครั้ง หรือเปลี่ยนหมวดเพลง");
 }
}

function cur(){return list[r]}

function stop(){
 clearTimeout(timer);
 if(audio){audio.pause();audio.currentTime=0}
 E.play.textContent="▶";
}

function updateDifficultyUI(){
 const idx=Math.min(r,5);
 document.querySelectorAll(".difficulty-pill").forEach((el,i)=>el.classList.toggle("active",i===idx));
 E.difficultyNow.textContent=LEVELS[idx].name;
 E.round.textContent=idx+1;
}

function updateTimeBar(){
 document.querySelectorAll(".difficulty-segment").forEach((el,i)=>{
  el.classList.toggle("active",i<=step);
 });
}

function updateListenUI(){
 updateTimeBar();
 E.sec.textContent=C.steps[step];
 E.listenText.textContent=`ฟัง ${C.steps[step]} วินาที`;
 E.remain.textContent=step===C.steps.length-1 ? "ฟังเต็มสุดแล้ว" : `ฟังเพิ่มได้อีก ${C.steps.length-1-step} ครั้ง`;
 E.skip.textContent=step===C.steps.length-1 ? "⏭ ไม่รู้ / เฉลย" : `⏭ ไม่รู้ / ฟัง ${C.steps[step+1]} วิ`;
}

function load(){
 stop();
 step=0;selected=null;
 E.ans.value="";
 E.msg.textContent="";
 E.sugs.style.display="none";
 updateDifficultyUI();
 updateListenUI();
 audio=new Audio(cur().preview);
 audio.muted=muted;
}

async function play(){
 stop();
 try{
  audio.currentTime=0;
  E.play.textContent="❚❚";
  E.as.textContent=`🎵 กำลังเล่น ${C.steps[step]} วินาที…`;
  await audio.play();
  timer=setTimeout(()=>{
   audio.pause();
   E.play.textContent="▶";
   E.as.textContent="หยุดแล้ว — ทายเลย!";
  },C.steps[step]*1000);
 }catch(e){
  E.as.textContent="ลองกด Play อีกครั้ง";
 }
}

function correct(){
 const q=E.ans.value,s=cur();
 return !!((selected&&sameSongTitle(selected.title,s.title))||sameSongTitle(q,s.title));
}

function submit(){
 if(!E.ans.value.trim()){
  E.msg.textContent="พิมพ์ชื่อเพลงก่อนนะ";
  return;
 }
 show(correct());
}

function skip(){
 if(step<C.steps.length-1){
  step++;
  updateListenUI();
  E.msg.textContent=`ปลดล็อก ${C.steps[step]} วินาทีแล้ว`;
 }else show(false);
}

function show(ok){
 stop();
 const pointTable=[1200,900,650,400];
 const pts=ok?pointTable[step]:0;
 if(ok)score+=pts;
 E.score.textContent=score;
 E.okIcon.textContent=ok?"✓":"✕";
 E.okText.textContent=ok?"ถูกต้อง!":"เฉลย";
 E.okText.style.color=ok?"#72f0a2":"#ff8181";
 E.gain.textContent=ok?`+${pts} คะแนน`:"";
 const s=cur();
 E.art.src=s.art;
 E.title.textContent=coreTitle(s.title);
 E.artist.textContent=s.artist;
 E.apple.href=s.url||"#";
 E.result.classList.remove("hidden");
}

function next(){
 E.result.classList.add("hidden");
 r++;
 if(r>=C.rounds)finish();
 else load();
}

function finish(){
 stop();
 E.game.classList.add("hidden");
 E.final.textContent=score;
 const label=((mode==="T-POP"||mode==="แร็ปไทย"||mode==="Kamikaze")&&artistFilter!=="ALL")?`${mode} · ${shortArtist(artistFilter)}`:mode;
 E.share.textContent=`เพลงไรวะ 🎧\n${label}\n${score} คะแนน / 6 เพลง`;
 E.finish.classList.remove("hidden");
}

function home(){
 stop();
 E.result.classList.add("hidden");
 E.finish.classList.add("hidden");
 E.game.classList.add("hidden");
 E.loading.classList.add("hidden");
 E.setup.classList.remove("hidden");
}

async function search(q){
 if(q.trim().length<2){E.sugs.style.display="none";return}
 const nq=norm(q);
 let candidates=pool.filter(x=>norm(x.title).includes(nq)||norm(x.artist).includes(nq));

 try{
  const d=await jsonp(q,40);
  let extra=clean(d.results);
  const allowed=((mode==="T-POP"||mode==="แร็ปไทย"||mode==="Kamikaze")&&artistFilter!=="ALL")?[artistFilter]:(C.artists[mode]||Object.values(C.artists).flat());
  extra=extra.filter(x=>allowed.some(a=>artistMatches(x.artist,a)));
  candidates.push(...extra);
 }catch(e){}

 candidates=dedupe(candidates);

 // Never let autocomplete behave like a spoiler:
 // always mix in same-mode decoys and randomize order.
 const used=new Set(candidates.map(x=>x.id));
 let decoys=shuffle(pool).filter(x=>!used.has(x.id));
 if((mode==="T-POP"||mode==="แร็ปไทย"||mode==="Kamikaze")&&artistFilter!=="ALL"){
  const sameArtist=decoys.filter(x=>artistMatches(x.artist,artistFilter));
  if(sameArtist.length)decoys=sameArtist;
 }
 candidates=shuffle([...candidates,...decoys.slice(0,12)]);
 render(candidates.slice(0,12));
}

function render(a){
 E.sugs.innerHTML="";
 a.forEach(s=>{
  const b=document.createElement("button");
  b.type="button";b.className="sug";
  const im=document.createElement("img");
  im.src=s.art;im.alt=s.artist;im.loading="lazy";
  const sp=document.createElement("span");
  const x=document.createElement("b"),y=document.createElement("small");
  x.textContent=coreTitle(s.title);y.textContent=s.artist;
  sp.append(x,y);b.append(im,sp);
  b.onclick=()=>{
   selected=s;
   E.ans.value=coreTitle(s.title);
   E.sugs.style.display="none";
  };
  E.sugs.appendChild(b);
 });
 E.sugs.style.display=a.length?"block":"none";
}

function shortArtist(a){
 return a==="BUS because of you i shine"?"BUS":a;
}

function renderArtistCards(){
 E.artistGrid.innerHTML="";
 const source=mode==="แร็ปไทย"?RAP:(mode==="Kamikaze"?KAMIKAZE:TPOP);
 const all=["ALL",...source];
 all.forEach(a=>{
  const b=document.createElement("button");
  b.type="button";
  b.className="artist-card"+(a===artistFilter?" active":"");
  b.dataset.artist=a;
  if(a==="ALL"){
   const ph=document.createElement("div");ph.className="artist-placeholder";ph.textContent="🎧";b.appendChild(ph);
  }else{
   const ph=document.createElement("div");ph.className="artist-placeholder";ph.textContent="♪";b.appendChild(ph);
   loadArtistArtwork(a,b,ph);
  }
  const name=document.createElement("span");name.textContent=a==="ALL"?"รวม":shortArtist(a);b.appendChild(name);
  E.artistGrid.appendChild(b);
 });
}

async function loadArtistArtwork(artist,button,placeholder){
 try{
  const d=await jsonp(artist,8);
  const row=clean(d.results).find(x=>artistMatches(x.artist,artist));
  if(!row||!row.art)return;
  const img=document.createElement("img");
  img.src=row.art;img.alt=shortArtist(artist);img.loading="lazy";
  placeholder.replaceWith(img);
 }catch(e){}
}

function syncArtistFilters(){
 const show=mode==="T-POP"||mode==="แร็ปไทย"||mode==="Kamikaze";
 E.artistFilters.classList.toggle("hidden",!show);
 if(show){
  E.artistPanelTitle.textContent=mode==="แร็ปไทย"?"เลือกศิลปินแร็ปไทย":(mode==="Kamikaze"?"เลือกศิลปิน Kamikaze":"เลือกวง T-POP");
  renderArtistCards();
 }
}


const LB_KEY="plengraiwa_leaderboard_v1";
const PLAYER_KEY="plengraiwa_player_id";

function getPlayerId(){
 let id=localStorage.getItem(PLAYER_KEY);
 if(!id){
  id="P"+Math.random().toString(36).slice(2,8).toUpperCase();
  localStorage.setItem(PLAYER_KEY,id);
 }
 return id;
}
function getLeaderboard(){
 try{return JSON.parse(localStorage.getItem(LB_KEY)||"[]")}catch{return[]}
}
function setLeaderboard(rows){
 localStorage.setItem(LB_KEY,JSON.stringify(rows.slice(0,100)));
}
function sanitizeIG(v){
 return (v||"").trim().replace(/^@+/,"").replace(/[^a-zA-Z0-9._]/g,"").slice(0,30);
}
function saveCurrentScore(){
 const name=(E.playerName.value||"").trim().slice(0,24);
 if(!name){E.playerName.focus();return}
 const ig=sanitizeIG(E.playerIG.value),playerId=getPlayerId();
 const row={playerId,name,ig,score,mode,artist:(artistFilter!=="ALL"?shortArtist(artistFilter):""),createdAt:Date.now()};
 let rows=getLeaderboard().filter(x=>x.playerId!==playerId || x.score>score);
 rows.push(row); rows.sort((a,b)=>b.score-a.score || a.createdAt-b.createdAt);
 setLeaderboard(rows);
 E.playerIdText.textContent=`Player ID: ${playerId} · บันทึกแล้ว ✓`;
 renderLeaderboard("all");
}
function openLeaderboard(filter="all"){
 E.leaderboard.classList.remove("hidden");renderLeaderboard(filter);
}
function closeLeaderboard(){E.leaderboard.classList.add("hidden")}
function renderLeaderboard(filter="all"){
 const now=new Date(),startToday=new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime();
 let rows=getLeaderboard();
 if(filter==="today")rows=rows.filter(x=>x.createdAt>=startToday);
 rows.sort((a,b)=>b.score-a.score || a.createdAt-b.createdAt);
 E.leaderboardList.innerHTML="";
 if(!rows.length){
  E.leaderboardList.innerHTML='<div class="lb-empty">ยังไม่มีคะแนน — มาเป็นอันดับ 1 คนแรก 😎</div>';return;
 }
 rows.slice(0,50).forEach((x,i)=>{
  const item=document.createElement("div");item.className="lb-row";
  const rank=document.createElement("div");rank.className="lb-rank";rank.textContent=i<3?["🥇","🥈","🥉"][i]:String(i+1);
  const info=document.createElement("div");info.className="lb-info";
  const n=document.createElement("b");n.textContent=x.name;
  const sub=document.createElement("small");sub.textContent=[x.ig?`@${x.ig}`:"",x.mode,x.artist].filter(Boolean).join(" · ");
  info.append(n,sub);
  const sc=document.createElement("strong");sc.className="lb-score";sc.textContent=x.score.toLocaleString();
  item.append(rank,info,sc);
  if(x.ig){item.classList.add("clickable");item.onclick=()=>window.open(`https://instagram.com/${x.ig}`,"_blank","noopener")}
  E.leaderboardList.appendChild(item);
 });
}
document.querySelectorAll(".lb-tab").forEach(btn=>{
 btn.onclick=()=>{
  document.querySelectorAll(".lb-tab").forEach(x=>x.classList.remove("active"));
  btn.classList.add("active");renderLeaderboard(btn.dataset.filter||"all");
 };
});

E.modes.onclick=e=>{
 const b=e.target.closest(".mode");if(!b)return;
 document.querySelectorAll(".mode").forEach(x=>x.classList.remove("active"));
 b.classList.add("active");
 const oldMode=mode;
 mode=b.dataset.mode;
 if(mode!=="T-POP"&&mode!=="แร็ปไทย"&&mode!=="Kamikaze")artistFilter="ALL";
 if((oldMode==="T-POP"&&mode==="แร็ปไทย")||(oldMode==="แร็ปไทย"&&mode==="T-POP"))artistFilter="ALL";
 syncArtistFilters();
};

E.artistGrid.onclick=e=>{
 const b=e.target.closest(".artist-card");if(!b)return;
 artistFilter=b.dataset.artist||"ALL";
 E.artistGrid.querySelectorAll(".artist-card").forEach(x=>x.classList.toggle("active",x===b));
};

E.start.onclick=start;
E.play.onclick=play;
E.submit.onclick=submit;
E.skip.onclick=skip;
E.next.onclick=next;
E.again.onclick=()=>{E.finish.classList.add("hidden");start()};
E.home.onclick=home;
E.mute.onclick=()=>{muted=!muted;if(audio)audio.muted=muted;E.mute.textContent=muted?"🔇":"🔊"};
E.ans.oninput=()=>{selected=null;clearTimeout(searchTimer);searchTimer=setTimeout(()=>search(E.ans.value),300)};
E.ans.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();submit()}};
E.copy.onclick=async()=>{
 try{await navigator.clipboard.writeText(E.share.textContent);E.copy.textContent="คัดลอกแล้ว ✓"}
 catch{E.copy.textContent="กดค้างที่ผลเพื่อคัดลอก"}
};

syncArtistFilters();

if(E.openLeaderboard)E.openLeaderboard.onclick=()=>openLeaderboard("all");
if(E.viewLeaderboard)E.viewLeaderboard.onclick=()=>openLeaderboard("all");
if(E.closeLeaderboard)E.closeLeaderboard.onclick=closeLeaderboard;
if(E.saveScore)E.saveScore.onclick=saveCurrentScore;
if(E.playerIdText)E.playerIdText.textContent=`Player ID: ${getPlayerId()}`;
