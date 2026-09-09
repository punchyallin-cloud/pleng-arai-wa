const C={
  rounds:4,
  steps:[1.5,3,10,15],
  artists:{
    "ฮิตไทย":["Three Man Down","Tilly Birds","NONT TANONT","INK WARUNTORN","Jeff Satur","BOWKYLION","Cocktail","bodyslam","Potato","Klear","Getsunova","Polycat","Musketeers","The TOYS","MEYOU","fellow fellow","Only Monday","Tattoo Colour","PALMY","Atom Chanakan","Pop Pongkool","Billkin","PP Krit","Mirrr","PURPEECH","PUN","YOUNGOHM","F.HERO","Slot Machine","Lipta","Scrubb","Lomosonic","Num Kala"],
    "T-POP":["4EVE","BUS because of you i shine","PiXXiE","LYKN","PROXIE","ATLAS","PERSES","DICE","BNK48","VIIS","TRINITY","bamm","PRETZELLE","QRRA","MXFRUIT","LAZ1"],
    "2000s":["bodyslam","Potato","Clash","Big Ass","Da Endorphine","Klear","Tattoo Colour","PALMY","Silly Fools","Mild","Calories Blah Blah","Lomosonic","Zeal","Retrospect","Sweet Mullet","Paradox","Lipta","Scrubb"],
    "ลูกทุ่ง":["มนต์แคน แก่นคูน","ลำไย ไหทองคำ","ก้อง ห้วยไร่","ต่าย อรทัย","ไผ่ พงศธร","ศิริพร อำไพพงษ์","เบิ้ล ปทุมราช","จินตหรา พูนลาภ","หญิงลี ศรีจุมพล","ตรี ชัยณรงค์","แซ็ค ชุมแพ","เนสกาแฟ ศรีนคร"],
    "อินดี้":["Safeplanet","Whal & Dolph","Yew","Dept","PURPEECH","Mirrr","HYBS","Tilly Birds","Polycat","LANDOKMAI","Anatomy Rabbit","Moving and Cut","WANYAi","Loserpop","H3F","Rocketman"],
    "สุ่มทั้งหมด":["Three Man Down","Tilly Birds","NONT TANONT","INK WARUNTORN","BOWKYLION","Cocktail","bodyslam","4EVE","BUS because of you i shine","LYKN","PROXIE","PiXXiE","ATLAS","PERSES","Potato","PALMY","Tattoo Colour","Only Monday","fellow fellow","PUN","YOUNGOHM","Safeplanet","Whal & Dolph","Lipta","Scrubb","Slot Machine"]
  }
};

const LEVELS=[
  {name:"Easy",cls:"easy"},
  {name:"Medium",cls:"medium"},
  {name:"Hard",cls:"hard"},
  {name:"Impossible",cls:"impossible"}
];

const TPOP=C.artists["T-POP"];
const $=x=>document.getElementById(x);
const E={
 setup:$("setup"),loading:$("loading"),game:$("game"),start:$("start"),modes:$("modes"),
 lt:$("loadingText"),ml:$("modeLabel"),sec:$("seconds"),play:$("play"),as:$("audioState"),
 ans:$("answer"),sugs:$("suggestions"),submit:$("submit"),skip:$("skip"),score:$("score"),
 round:$("round"),remain:$("remain"),msg:$("msg"),result:$("result"),okIcon:$("okIcon"),
 okText:$("okText"),art:$("art"),title:$("title"),artist:$("artist"),gain:$("gain"),
 apple:$("apple"),next:$("next"),finish:$("finish"),final:$("final"),share:$("share"),
 again:$("again"),copy:$("copy"),home:$("home"),mute:$("mute"),artistFilters:$("artistFilters"),
 artistGrid:$("artistGrid"),listenText:$("listenText"),difficultyNow:$("difficultyNow")
};

let mode="ฮิตไทย", artistFilter="ALL", pool=[], buckets=[[],[],[],[]], list=[];
let r=0, step=0, score=0, audio=null, timer=null, muted=false, selected=null, searchTimer=null;

function jsonp(term,limit=60){
 return new Promise((res,rej)=>{
  const cb="__prw"+Date.now()+Math.random().toString(36).slice(2);
  const s=document.createElement("script");
  const t=setTimeout(()=>done(new Error("timeout")),10000);
  function done(e,d){clearTimeout(t);delete window[cb];s.remove();e?rej(e):res(d)}
  window[cb]=d=>done(null,d);
  const p=new URLSearchParams({term,country:"TH",media:"music",entity:"song",limit:String(limit),callback:cb});
  s.src="https://itunes.apple.com/search?"+p;
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
  d.slice(2,5),
  d.slice(5,9),
  d.slice(9,18)
 ];
}

async function fetchArtist(wanted){
 try{
  const d=await jsonp(wanted,50);
  const rows=clean(d.results).filter(x=>artistMatches(x.artist,wanted));
  return splitDepth(rows);
 }catch(e){
  return [[],[],[],[]];
 }
}

async function build(){
 E.lt.textContent="กำลังคัดเพลงจากง่ายไปยาก…";
 pool=[];buckets=[[],[],[],[]];

 const artists=(mode==="T-POP"&&artistFilter!=="ALL")
   ? [artistFilter]
   : (C.artists[mode]||C.artists["ฮิตไทย"]);

 // Batch to make larger catalogs load much faster without showing counts.
 for(let i=0;i<artists.length;i+=6){
  const batch=artists.slice(i,i+6);
  const results=await Promise.all(batch.map(fetchArtist));
  results.forEach(parts=>{
   parts.forEach((rows,idx)=>buckets[idx].push(...rows));
   parts.forEach(rows=>pool.push(...rows));
  });
 }

 buckets=buckets.map(dedupe);
 pool=dedupe(pool);

 // Fallback: if a deep bucket is too small, borrow from the next nearest pool,
 // but keep Easy biased to early results and Impossible biased to deeper results.
 for(let i=0;i<4;i++){
  if(buckets[i].length<3){
   const fallback=i===0?pool.slice(0,Math.max(8,pool.length/4)):
                  i===1?pool.slice(Math.floor(pool.length*.15),Math.floor(pool.length*.55)):
                  i===2?pool.slice(Math.floor(pool.length*.35),Math.floor(pool.length*.80)):
                        pool.slice(Math.floor(pool.length*.55));
   buckets[i]=dedupe([...buckets[i],...fallback]);
  }
 }

 if(pool.length<4)throw new Error("not enough songs");
}

function chooseDifficultyList(){
 const chosen=[],usedTitles=new Set(),usedArtists=new Set();

 for(let level=0;level<4;level++){
  let candidates=shuffle(buckets[level]).filter(x=>!usedTitles.has(answerKey(x.title)));
  // In mixed modes, prefer different artists across the four songs.
  if(!(mode==="T-POP"&&artistFilter!=="ALL")){
   const fresh=candidates.filter(x=>!usedArtists.has(answerKey(x.artist)));
   if(fresh.length) candidates=fresh;
  }
  const pick=candidates[0]||shuffle(pool).find(x=>!usedTitles.has(answerKey(x.title)));
  if(!pick)throw new Error("cannot choose");
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
  E.ml.textContent=mode==="T-POP"&&artistFilter!=="ALL" ? `T-POP · ${shortArtist(artistFilter)}` : mode;
  E.loading.classList.add("hidden");
  E.game.classList.remove("hidden");
  load();
 }catch(e){
  console.error(e);
  E.loading.classList.add("hidden");
  E.setup.classList.remove("hidden");
  alert("โหลดเพลงไม่ได้ ลองเช็กอินเทอร์เน็ตแล้วกดใหม่");
 }
}

function cur(){return list[r]}

function stop(){
 clearTimeout(timer);
 if(audio){audio.pause();audio.currentTime=0}
 E.play.textContent="▶";
}

function updateDifficultyUI(){
 const idx=Math.min(r,3);
 document.querySelectorAll(".difficulty-pill").forEach((el,i)=>el.classList.toggle("active",i===idx));
 document.querySelectorAll(".difficulty-segment").forEach((el,i)=>el.classList.toggle("active",i===idx));
 E.difficultyNow.textContent=LEVELS[idx].name;
 E.round.textContent=idx+1;
}

function updateListenUI(){
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
 const pts=ok?Math.max(200,1000-step*180):0;
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
 const label=mode==="T-POP"&&artistFilter!=="ALL"?`T-POP · ${shortArtist(artistFilter)}`:mode;
 E.share.textContent=`เพลงไรวะ 🎧\n${label}\n${score} คะแนน / 4 เพลง`;
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
  const allowed=(mode==="T-POP"&&artistFilter!=="ALL")?[artistFilter]:(C.artists[mode]||Object.values(C.artists).flat());
  extra=extra.filter(x=>allowed.some(a=>artistMatches(x.artist,a)));
  candidates.push(...extra);
 }catch(e){}

 candidates=dedupe(candidates);

 // Never let autocomplete behave like a spoiler:
 // always mix in same-mode decoys and randomize order.
 const used=new Set(candidates.map(x=>x.id));
 let decoys=shuffle(pool).filter(x=>!used.has(x.id));
 if(mode==="T-POP"&&artistFilter!=="ALL"){
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
 const all=["ALL",...TPOP];
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
 E.artistFilters.classList.toggle("hidden",mode!=="T-POP");
 if(mode==="T-POP")renderArtistCards();
}

E.modes.onclick=e=>{
 const b=e.target.closest(".mode");if(!b)return;
 document.querySelectorAll(".mode").forEach(x=>x.classList.remove("active"));
 b.classList.add("active");
 mode=b.dataset.mode;
 if(mode!=="T-POP")artistFilter="ALL";
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
