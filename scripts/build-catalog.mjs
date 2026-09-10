import fs from "node:fs/promises";

const ARTISTS = {
  "ฮิตไทย":["Three Man Down","Tilly Birds","NONT TANONT","INK WARUNTORN","Jeff Satur","BOWKYLION","Cocktail","bodyslam","Potato","Klear","Getsunova","Polycat","Musketeers","The TOYS","MEYOU","fellow fellow","Only Monday","Tattoo Colour","PALMY","Atom Chanakan","Pop Pongkool","Billkin","PP Krit","Mirrr","PURPEECH","PUN","YOUNGOHM","F.HERO","Slot Machine","Lipta","Scrubb","Lomosonic","Num Kala"],
  "T-POP":["4EVE","BUS because of you i shine","PiXXiE","LYKN","PROXIE","ATLAS","PERSES","DICE","BNK48","VIIS","TRINITY","bamm","PRETZELLE","QRRA","MXFRUIT","LAZ1"],
  "2000s":["bodyslam","Potato","Clash","Big Ass","Da Endorphine","Klear","Tattoo Colour","PALMY","Silly Fools","Mild","Calories Blah Blah","Lomosonic","Zeal","Retrospect","Sweet Mullet","Paradox","Lipta","Scrubb"],
  "ลูกทุ่ง":["มนต์แคน แก่นคูน","ลำไย ไหทองคำ","ก้อง ห้วยไร่","ต่าย อรทัย","ไผ่ พงศธร","ศิริพร อำไพพงษ์","เบิ้ล ปทุมราช","จินตหรา พูนลาภ","หญิงลี ศรีจุมพล","ตรี ชัยณรงค์","แซ็ค ชุมแพ","เนสกาแฟ ศรีนคร"],
  "อินดี้":["Safeplanet","Whal & Dolph","Yew","Dept","PURPEECH","Mirrr","HYBS","Tilly Birds","Polycat","LANDOKMAI","Anatomy Rabbit","Moving and Cut","WANYAi","Loserpop","H3F","Rocketman"],
  "แร็ปไทย":["YOUNGOHM","YOUNGGU","DIAMOND MQT","Z9","YOUNGTA","DIEHEART","1MILL","SPRITE","AUTTA","F.HERO","DABOYWAY","P6ICK","2Ectasy","OG-ANIC","LAZYLOXY","MAIYARAP","URBOYTJ","SARAN","BLACKSHEEP","MILLI"],
  "Kamikaze":["FFK","K-OTIC","Four-Mod","Neko Jump","Waii","Knomjean","Mila","Siska","3.2.1","SWEE:D","Timethai","XIS","Kamikaze"]
};

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const norm=s=>(s||"").toLowerCase().normalize("NFKC").replace(/[()[\]{}"'’“”.,!?\-–—:;/\\]/g," ").replace(/\s+/g," ").trim();

async function appleSearch(term){
  const url=`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&country=TH&media=music&entity=song&limit=60`;
  for(let attempt=0;attempt<3;attempt++){
    try{
      const r=await fetch(url,{headers:{"user-agent":"plengraiwa-catalog-builder/1.0"}});
      if(!r.ok)throw new Error(`HTTP ${r.status}`);
      const j=await r.json();
      return Array.isArray(j.results)?j.results:[];
    }catch(e){
      console.log("retry",term,attempt+1,String(e));
      await sleep(5000*(attempt+1));
    }
  }
  return [];
}

const membership=new Map();
for(const [mode,artists] of Object.entries(ARTISTS)){
  for(const artist of artists){
    if(!membership.has(artist))membership.set(artist,[]);
    membership.get(artist).push(mode);
  }
}

const byKey=new Map();
let artistNo=0;
for(const [artist,modes] of membership.entries()){
  artistNo++;
  console.log(`[${artistNo}/${membership.size}] ${artist}`);
  const rows=await appleSearch(artist);
  let rank=0;
  for(const x of rows){
    if(!x.previewUrl||!x.trackName||!x.artistName)continue;
    rank++;
    const key=`${x.trackId||""}|${norm(x.artistName)}|${norm(x.trackName)}`;
    const prev=byKey.get(key);
    const rec=prev||{
      id:x.trackId||key,
      title:x.trackName,
      artist:x.artistName,
      preview:x.previewUrl,
      art:(x.artworkUrl100||"").replace("100x100bb","500x500bb"),
      url:x.trackViewUrl||"",
      rank,
      modes:[],
      artistKeys:[]
    };
    rec.rank=Math.min(rec.rank??999,rank);
    rec.modes=[...new Set([...rec.modes,...modes])];
    rec.artistKeys=[...new Set([...rec.artistKeys,artist])];
    byKey.set(key,rec);
  }
  // Apple documents roughly 20 calls/min; keep the builder conservative.
  await sleep(3300);
}

const tracks=[...byKey.values()];
const out={generatedAt:new Date().toISOString(),count:tracks.length,tracks};
await fs.writeFile("catalog.json",JSON.stringify(out,null,2),"utf8");
console.log(`Wrote ${tracks.length} preview tracks to catalog.json`);
if(tracks.length<80){
  console.error("Catalog unexpectedly small; refusing to publish.");
  process.exit(2);
}
