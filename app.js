const C={rounds:4,steps:[1.5,3,10,15],artists:{
"ฮิตไทย":["Three Man Down","Tilly Birds","NONT TANONT","INK WARUNTORN","Jeff Satur","BOWKYLION","Cocktail","bodyslam","Potato","Klear","Getsunova","Polycat","Musketeers","The TOYS","MEYOU","fellow fellow","Only Monday","Tattoo Colour","PALMY","Atom Chanakan","Pop Pongkool","Billkin","Mirrr","PURPEECH","PUN","YOUNGOHM"],
"T-POP":["BUS because of you i shine","4EVE","LYKN","PROXIE","PiXXiE","ATLAS","PERSES","DICE","BNK48","VIIS","TRINITY","bamm"],
"2000s":["bodyslam","Potato","Clash","Big Ass","Da Endorphine","Klear","Tattoo Colour","PALMY","Silly Fools","Mild"],
"ลูกทุ่ง":["มนต์แคน แก่นคูน","ลำไย ไหทองคำ","ก้อง ห้วยไร่","ต่าย อรทัย","ไผ่ พงศธร","ศิริพร อำไพพงษ์"],
"อินดี้":["Safeplanet","Whal & Dolph","Yew","Dept","PURPEECH","Mirrr","HYBS","Tilly Birds","Polycat"],
"สุ่มทั้งหมด":["Three Man Down","Tilly Birds","NONT TANONT","INK WARUNTORN","BOWKYLION","Cocktail","bodyslam","BUS because of you i shine","4EVE","LYKN","PROXIE","PiXXiE","ATLAS","PERSES","Potato","PALMY","Tattoo Colour","Only Monday","fellow fellow"]}};
const LEVELS=[
{name:"Easy",cls:"easy"},
{name:"Medium",cls:"medium"},
{name:"Hard",cls:"hard"},
{name:"Impossible",cls:"impossible"}
];
const $=x=>document.getElementById(x),E={setup:$("setup"),loading:$("loading"),game:$("game"),start:$("start"),modes:$("modes"),lt:$("loadingText"),ml:$("modeLabel"),sec:$("seconds"),sec2:$("sec2"),bar:$("bar"),play:$("play"),as:$("audioState"),ans:$("answer"),sugs:$("suggestions"),submit:$("submit"),skip:$("skip"),score:$("score"),round:$("round"),remain:$("remain"),msg:$("msg"),result:$("result"),okIcon:$("okIcon"),okText:$("okText"),art:$("art"),title:$("title"),artist:$("artist"),gain:$("gain"),apple:$("apple"),next:$("next"),finish:$("finish"),final:$("final"),share:$("share"),again:$("again"),copy:$("copy"),home:$("home"),mute:$("mute")};
let mode="ฮิตไทย",pool=[],list=[],r=0,step=0,score=0,audio=null,timer=null,muted=false,selected=null,searchTimer=null;
let artistFilter="ALL";

function jsonp(term,limit=60){return new Promise((res,rej)=>{let cb="__prw"+Date.now()+Math.random().toString(36).slice(2),s=document.createElement("script"),t=setTimeout(()=>done(new Error("timeout")),10000);function done(e,d){clearTimeout(t);delete window[cb];s.remove();e?rej(e):res(d)}window[cb]=d=>done(null,d);let p=new URLSearchParams({term,country:"TH",media:"music",entity:"song",limit:String(limit),callback:cb});s.src="https://itunes.apple.com/search?"+p;s.onerror=()=>done(new Error("network"));document.body.appendChild(s)})}
function clean(a){let m=new Map;(a||[]).forEach(x=>{if(x.previewUrl&&x.trackName&&x.artistName&&!m.has(x.trackId))m.set(x.trackId,{id:x.trackId,title:x.trackName,artist:x.artistName,preview:x.previewUrl,art:(x.artworkUrl100||"").replace("100x100bb","500x500bb"),url:x.trackViewUrl||""})});return[...m.values()]}
function shuffle(a){a=[...a];for(let i=a.length-1;i;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
async function build(){let all=[],artists=(mode==="T-POP"&&artistFilter!=="ALL")?[artistFilter]:(C.artists[mode]||C.artists["ฮิตไทย"]);for(let i=0;i<artists.length;i++){let wanted=artists[i];E.lt.textContent=`กำลังเตรียมเพลง ${i+1}/${artists.length}`;try{let d=await jsonp(wanted,35);let rows=clean(d.results).filter(x=>{let aa=norm(x.artist),w=norm(wanted);return aa===w||aa.includes(w)||w.includes(aa)});all.push(...rows.slice(0,8))}catch{}}pool=[...new Map(all.map(x=>[(answerKey(x.artist)+"|"+answerKey(x.title)),x])).values()];if(pool.length<5)throw Error()}
async function start(){E.setup.classList.add("hidden");E.loading.classList.remove("hidden");E.game.classList.add("hidden");try{await build();list=shuffle(pool).slice(0,C.rounds);r=0;step=0;score=0;E.score.textContent=0;E.ml.textContent=mode;E.loading.classList.add("hidden");E.game.classList.remove("hidden");load()}catch{E.loading.classList.add("hidden");E.setup.classList.remove("hidden");alert("โหลดเพลงไม่ได้ ลองเช็กอินเทอร์เน็ตแล้วกดใหม่")}}
function cur(){return list[r]}function stop(){clearTimeout(timer);if(audio){audio.pause();audio.currentTime=0}E.play.textContent="▶"}
function load(){stop();step=0;setTimeout(()=>{try{updateDifficultyUI();updateListenBar()}catch(e){}},0);selected=null;E.ans.value="";E.msg.textContent="";E.sugs.style.display="none";E.round.textContent=r+1;audio=new Audio(cur().preview);audio.muted=muted;draw()}
function draw(){try{updateDifficultyUI();updateListenBar()}catch(e){}E.sec.textContent=C.steps[step];document.querySelectorAll(".levels span").forEach((x,i)=>x.classList.toggle("active",i===step));E.remain.textContent=step===C.steps.length-1?"รอบสุดท้าย":`เหลืออีก ${C.steps.length-1-step} ระดับ`}
async function play(){stop();try{audio.currentTime=0;E.play.textContent="❚❚";E.as.textContent=`🎵 กำลังเล่น ${C.steps[step]} วินาที…`;await audio.play();timer=setTimeout(()=>{audio.pause();E.play.textContent="▶";E.as.textContent="หยุดแล้ว — ทายเลย!"},C.steps[step]*1000)}catch{E.as.textContent="ลองกด Play อีกครั้ง"}}
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
 return x===y||xc===yc||(x.length>=4&&y.length>=4&&(x.includes(y)||y.includes(x)));
}
const norm=s=>(s||"").toLowerCase().normalize("NFKC").replace(/[()[\]{}"'’“”.,!?\-–—:;/\\]/g," ").replace(/\s+/g," ").trim();
function correct(){let q=E.ans.value,s=cur();return !!((selected&&sameSongTitle(selected.title,s.title))||sameSongTitle(q,s.title))}
function submit(){if(!E.ans.value.trim()){E.msg.textContent="พิมพ์ชื่อเพลงก่อนนะ";return}show(correct())}
function skip(){if(step<C.steps.length-1){step++;draw();E.msg.textContent=`ปลดล็อก ${C.steps[step]} วินาทีแล้ว`}else show(false)}
function show(ok){stop();let pts=ok?Math.max(200,1000-step*180):0;if(ok)score+=pts;E.score.textContent=score;E.okIcon.textContent=ok?"✓":"✕";E.okText.textContent=ok?"ถูกต้อง!":"เฉลย";E.okText.style.color=ok?"#72f0a2":"#ff8181";E.gain.textContent=ok?`+${pts} คะแนน`:"";let s=cur();E.art.src=s.art;E.title.textContent=s.title;E.artist.textContent=s.artist;E.apple.href=s.url||"#";E.result.classList.remove("hidden")}
function next(){E.result.classList.add("hidden");r++;r>=C.rounds?finish():load()}
function finish(){stop();E.game.classList.add("hidden");E.final.textContent=score;let txt=`เพลงไรวะ 🎧\n${mode}\n${score} คะแนน / ${C.rounds} เพลง\n1.5 วิ รู้มั้ยเพลงอะไร?`;E.share.textContent=txt;E.finish.classList.remove("hidden")}
function home(){stop();E.result.classList.add("hidden");E.finish.classList.add("hidden");E.game.classList.add("hidden");E.loading.classList.add("hidden");E.setup.classList.remove("hidden")}
async function search(q){
 if(q.trim().length<2){E.sugs.style.display="none";return}
 let nq=norm(q),candidates=pool.filter(x=>norm(x.title).includes(nq)||norm(x.artist).includes(nq));
 try{
   let d=await jsonp(q,25);
   let extra=clean(d.results).filter(x=>{
     let allowed=[...new Set(Object.values(C.artists).flat())];
     return allowed.some(a=>{let aa=norm(x.artist),w=norm(a);return aa===w||aa.includes(w)||w.includes(aa)});
   });
   candidates.push(...extra);
 }catch(e){}
 candidates=[...new Map(candidates.map(x=>[x.id,x])).values()];
 candidates=shuffle(candidates);
 // Never collapse to a single obvious answer: if fewer than 5 matches, pad with random pool decoys.
 if(candidates.length<5){
   let used=new Set(candidates.map(x=>x.id));
   shuffle(pool).forEach(x=>{if(candidates.length<6&&!used.has(x.id)){candidates.push(x);used.add(x.id)}});
 }
 render(candidates.slice(0,8))
}
function render(a){E.sugs.innerHTML="";a.slice(0,8).forEach(s=>{let b=document.createElement("button");b.type="button";b.className="sug";let im=document.createElement("img");im.src=s.art;let sp=document.createElement("span"),x=document.createElement("b"),y=document.createElement("small");x.textContent=s.title;y.textContent=s.artist;sp.append(x,y);b.append(im,sp);b.onclick=()=>{selected=s;E.ans.value=s.title;E.sugs.style.display="none"};E.sugs.appendChild(b)});E.sugs.style.display=a.length?"block":"none"}
E.modes.onclick=e=>{let b=e.target.closest(".mode");if(!b)return;document.querySelectorAll(".mode").forEach(x=>x.classList.remove("active"));b.classList.add("active");mode=b.dataset.mode};
E.start.onclick=start;E.play.onclick=play;E.submit.onclick=submit;E.skip.onclick=skip;E.next.onclick=next;E.again.onclick=()=>{E.finish.classList.add("hidden");start()};E.home.onclick=home;E.mute.onclick=()=>{muted=!muted;if(audio)audio.muted=muted;E.mute.textContent=muted?"🔇":"🔊"};
E.ans.oninput=()=>{selected=null;clearTimeout(searchTimer);searchTimer=setTimeout(()=>search(E.ans.value),350)};E.ans.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();submit()}};
E.copy.onclick=async()=>{try{await navigator.clipboard.writeText(E.share.textContent);E.copy.textContent="คัดลอกแล้ว ✓"}catch{E.copy.textContent="กดค้างที่ผลเพื่อคัดลอก"}};

document.addEventListener("click",()=>{setTimeout(()=>{try{updateDifficultyUI();updateListenBar()}catch(e){}},0)});
window.addEventListener("load",()=>{setTimeout(()=>{try{updateDifficultyUI();updateListenBar()}catch(e){}},300)});

const artistFilters=document.getElementById("artistFilters");
function syncArtistFilters(){
  if(!artistFilters)return;
  artistFilters.classList.toggle("hidden",mode!=="T-POP");
}
if(artistFilters){
 artistFilters.onclick=e=>{
   const b=e.target.closest(".artist-chip"); if(!b)return;
   artistFilters.querySelectorAll(".artist-chip").forEach(x=>x.classList.remove("active"));
   b.classList.add("active"); artistFilter=b.dataset.artist||"ALL";
 };
}
if(E.modes){
 E.modes.addEventListener("click",()=>setTimeout(syncArtistFilters,0));
}
syncArtistFilters();
