import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";

// ============================================================
// dreshnik.ai v6 — Full Feature Digital Wardrobe
// ============================================================

const CATEGORIES = [
  { id: "tops", label: "Tops", sub: "Tees, shirts, blouses" },
  { id: "bottoms", label: "Bottoms", sub: "Jeans, trousers, shorts" },
  { id: "outerwear", label: "Outerwear", sub: "Jackets, coats, vests" },
  { id: "shoes", label: "Shoes", sub: "Sneakers, boots, heels" },
  { id: "accessories", label: "Accessories", sub: "Watches, hats, bags" },
  { id: "fullbody", label: "Full Look", sub: "Suits, dresses, jumpsuits" },
];
const CAT_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));
const STYLES = ["Casual","Smart Casual","Formal","Sport","Streetwear","Classic","Elegant","Minimal","Bohemian","Techwear"];
const STYLE_IDS = STYLES.map(s => s.toLowerCase().replace(" ","_"));
const SEASONS = [
  { id: "spring", label: "Spring" },{ id: "summer", label: "Summer" },
  { id: "autumn", label: "Autumn" },{ id: "winter", label: "Winter" },
  { id: "all", label: "All Season" },
];
const OCCASIONS = [
  { id: "everyday", label: "Everyday", styles: [0,1,4,7] },
  { id: "work", label: "Work", styles: [1,2,5,7] },
  { id: "date", label: "Date Night", styles: [1,6,5,7] },
  { id: "sport", label: "Sport", styles: [3,9] },
  { id: "formal", label: "Formal", styles: [2,6,5] },
  { id: "party", label: "Party", styles: [4,6,1,8] },
  { id: "travel", label: "Travel", styles: [0,1,9,7] },
  { id: "creative", label: "Creative", styles: [4,8,9] },
];
const COLORS = [
  ["#000000","Black"],["#FFFFFF","White"],["#6B6B6B","Grey"],["#A8A8A8","Silver"],
  ["#1C1C2E","Navy"],["#2563EB","Royal Blue"],["#7DD3FC","Sky"],["#1E3A2F","Forest"],
  ["#4ADE80","Emerald"],["#B8D4A3","Sage"],["#DC2626","Red"],["#F97316","Orange"],
  ["#EAB308","Gold"],["#7C3AED","Violet"],["#EC4899","Rose"],["#92400E","Espresso"],
  ["#D2B48C","Tan"],["#F5F0E8","Cream"],["#C0A27A","Khaki"],["#800020","Burgundy"],
  ["#C9B8A8","Taupe"],["#2F4F4F","Slate"],["#FFD700","Mustard"],["#8B4513","Cognac"],
];
const MATERIALS = ["Cotton","Linen","Silk","Wool","Cashmere","Denim","Leather","Suede","Polyester","Nylon","Velvet","Corduroy","Jersey","Fleece","Gore-Tex"];
const BRANDS = ["Nike","Adidas","Zara","H&M","Uniqlo","COS","Massimo Dutti","Ralph Lauren","Tommy Hilfiger","Calvin Klein","Hugo Boss","Levi's","New Balance","Converse","Other"];
const F = { serif: "'Cormorant Garamond',Georgia,serif", sans: "'Syne','Helvetica Neue',sans-serif", mono: "'JetBrains Mono','SF Mono',monospace" };

// Theme System
const THEMES = {
  dark: { bg:"#080808",surface:"#0F0F0F",card:"#131313",border:"#1C1C1C",borderLight:"#262626",text:"#EAEAEA",textSoft:"#BBBBBB",textMuted:"#777777",textDim:"#444444",glow:"rgba(255,255,255,0.03)",overlay:"rgba(0,0,0,0.8)",dangerBorder:"#221111",dangerText:"#773333",imgOpacity:0.85,cardShadow:"none" },
  light: { bg:"#F7F6F3",surface:"#FFFFFF",card:"#FFFFFF",border:"#E5E3DE",borderLight:"#D5D3CE",text:"#1A1A1A",textSoft:"#444444",textMuted:"#888888",textDim:"#BBBBBB",glow:"rgba(0,0,0,0.02)",overlay:"rgba(255,255,255,0.85)",dangerBorder:"#FFDDDD",dangerText:"#CC3333",imgOpacity:1,cardShadow:"0 1px 3px rgba(0,0,0,0.06)" },
};
const ThemeCtx = createContext(THEMES.dark);
const useTheme = () => useContext(ThemeCtx);

// Color Engine
function hexToHSL(hex) { let r=parseInt(hex.slice(1,3),16)/255,g=parseInt(hex.slice(3,5),16)/255,b=parseInt(hex.slice(5,7),16)/255; const mx=Math.max(r,g,b),mn=Math.min(r,g,b); let h=0,s=0,l=(mx+mn)/2; if(mx!==mn){const d=mx-mn;s=l>0.5?d/(2-mx-mn):d/(mx+mn);if(mx===r)h=((g-b)/d+(g<b?6:0))/6;else if(mx===g)h=((b-r)/d+2)/6;else h=((r-g)/d+4)/6;} return{h:h*360,s:s*100,l:l*100}; }
function isNeutral(hex) { const h=hexToHSL(hex); return h.s<15||h.l>90||h.l<10; }
function colorCompat(a,b) { if(isNeutral(a)||isNeutral(b))return 0.9; const h1=hexToHSL(a),h2=hexToHSL(b),d=Math.min(Math.abs(h1.h-h2.h),360-Math.abs(h1.h-h2.h)); if(d>=150)return 0.85;if(d<=30)return 0.8;if(d>=110&&d<=130)return 0.75;if(d>=40&&d<=80)return 0.3;return 0.5; }
function getCurrentSeason() { const m=new Date().getMonth(); if(m<=1||m===11)return"winter";if(m<=4)return"spring";if(m<=7)return"summer";return"autumn"; }
function getSeasonalItems(items,hide) { if(!hide)return items; const cs=getCurrentSeason(),comp={winter:["winter","autumn","all"],summer:["summer","spring","all"],spring:["spring","summer","all"],autumn:["autumn","winter","all"]}; return items.filter(i=>!i.season||comp[cs]?.includes(i.season)); }

function scoreOutfit(combo,occIdx,weather,blSet) {
  if(blSet){const key=combo.map(i=>i.id).sort().join(",");if(blSet.has(key))return-1000;}
  let s=0;const occ=OCCASIONS[occIdx];
  combo.forEach(i=>{const sIdx=STYLE_IDS.indexOf(i.style);if(occ&&occ.styles.includes(sIdx))s+=25;else s+=5;});
  for(let i=0;i<combo.length;i++)for(let j=i+1;j<combo.length;j++){const c1=combo[i].colors?.[0],c2=combo[j].colors?.[0];if(c1&&c2)s+=colorCompat(c1,c2)*30;}
  const cs=getCurrentSeason();combo.forEach(i=>{if(i.season==="all"||i.season===cs)s+=12;});
  const n=combo.filter(i=>i.colors?.[0]&&isNeutral(i.colors[0])).length;if(n>=1&&n<combo.length)s+=15;
  combo.forEach(i=>{if((i.wearCount||0)<3)s+=5;});
  if(weather){if(weather.temp<10)combo.forEach(i=>{if(i.category==="outerwear")s+=10;if(i.season==="winter")s+=5;});if(weather.temp>25)combo.forEach(i=>{if(i.season==="summer")s+=8;});if(weather.rain)combo.forEach(i=>{if(i.material==="Gore-Tex"||i.material==="Nylon")s+=8;if(i.material==="Suede"||i.material==="Silk")s-=5;});}
  return s;
}
function generateCombos(items,occId,count,weather,blacklist) {
  const occIdx=OCCASIONS.findIndex(o=>o.id===occId),available=items.filter(i=>!i.inLaundry),byC={};
  CATEGORIES.forEach(c=>{byC[c.id]=available.filter(i=>i.category===c.id);});
  const combos=[],tops=byC.tops||[],bottoms=byC.bottoms||[],shoes=byC.shoes||[],outer=byC.outerwear||[],acc=byC.accessories||[],full=byC.fullbody||[];
  tops.forEach(t=>bottoms.forEach(b=>{combos.push({items:[t,b]});shoes.forEach(s=>combos.push({items:[t,b,s]}));outer.forEach(o=>combos.push({items:[t,b,o]}));shoes.forEach(s=>outer.forEach(o=>combos.push({items:[t,b,s,o]})));acc.forEach(a=>combos.push({items:[t,b,a]}));}));
  full.forEach(f=>{combos.push({items:[f]});shoes.forEach(s=>combos.push({items:[f,s]}));outer.forEach(o=>combos.push({items:[f,o]}));});
  const blSet=blacklist?new Set(blacklist):null;combos.forEach(c=>{c.score=scoreOutfit(c.items,occIdx,weather,blSet);});
  combos.sort((a,b)=>b.score-a.score);const seen=new Set(),res=[];
  for(const c of combos){const k=c.items.map(i=>i.id).sort().join(",");if(!seen.has(k)&&c.score>-500){seen.add(k);res.push(c);if(res.length>=count)break;}}return res;
}
function getExplanation(combo,occ) {
  const neutrals=combo.items.filter(i=>i.colors?.[0]&&isNeutral(i.colors[0])),accents=combo.items.filter(i=>i.colors?.[0]&&!isNeutral(i.colors[0]));
  let t="";if(neutrals.length>0&&accents.length>0)t+="Neutral base: "+neutrals.map(n=>n.name).join(" + ")+" with accent: "+accents.map(a=>a.name).join(", ")+". ";
  else if(neutrals.length===combo.items.length)t+="Tonal monochrome — clean and confident. ";
  else t+="Bold color mix — "+combo.items.map(i=>i.name).join(" + ")+". ";
  const o=OCCASIONS.find(x=>x.id===occ);if(o){const matching=combo.items.filter(i=>o.styles.includes(STYLE_IDS.indexOf(i.style)));if(matching.length===combo.items.length)t+="Perfect match for "+o.label+".";else if(matching.length>0)t+=matching.map(x=>x.name).join(" & ")+" sets the tone.";}return t;
}
const TIPS={everyday:["Roll sleeves for effortless edge.","White sneakers anchor any look.","Half-tuck for balance.","Layer a chain for elevation."],work:["Match belt to shoes.","Invest in tailoring.","Max 3 colors for authority.","A watch elevates everything."],date:["One statement piece is enough.","Shoes make the first impression.","Dark colors signal confidence.","Fragrance completes the look."],sport:["Breathable fabrics only.","Monochrome reads premium.","Matching sets look intentional.","Clean sneakers matter."],formal:["Shirt must be pressed.","Dark tones project authority.","Details — cuffs, collar, buttons.","Fit is everything."],party:["One bold piece carries it.","Texture mixing adds depth.","Black is always safe.","Accessories make the difference."],travel:["Layering is your friend.","Neutral base, one pop color.","Wrinkle-resistant fabrics.","Comfort first."],creative:["Break the rules.","Mix unexpected patterns.","Bold colors show confidence.","Accessories tell your story."]};
function getTip(occ){const l=TIPS[occ]||TIPS.everyday;return l[Math.floor(Math.random()*l.length)];}
function getColorName(hex){const c=COLORS.find(x=>x[0]===hex);return c?c[1]:hex;}

// Weather
const WC={0:"Clear",1:"Mostly clear",2:"Partly cloudy",3:"Overcast",45:"Foggy",48:"Fog",51:"Light drizzle",53:"Drizzle",55:"Heavy drizzle",61:"Light rain",63:"Rain",65:"Heavy rain",71:"Light snow",73:"Snow",75:"Heavy snow",80:"Rain showers",95:"Thunderstorm"};
function getWIcon(code){if(code<=1)return"\u2600";if(code<=3)return"\u2601";if(code>=45&&code<=48)return"\uD83C\uDF2B";if(code>=51&&code<=67)return"\uD83C\uDF27";if(code>=71&&code<=77)return"\u2744";if(code>=80&&code<=82)return"\uD83C\uDF26";if(code>=95)return"\u26C8";return"\u2600";}
function useWeather(){const[w,setW]=useState(null);useEffect(()=>{if(!navigator.geolocation)return;navigator.geolocation.getCurrentPosition(async pos=>{try{const lat=pos.coords.latitude,lon=pos.coords.longitude;const url="https://api.open-meteo.com/v1/forecast?latitude="+lat+"&longitude="+lon+"&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&timezone=auto&forecast_days=1";const r=await fetch(url);const d=await r.json();const code=d.current?.weather_code||0;setW({temp:Math.round(d.current?.temperature_2m||0),rain:code>=51&&code<=67,code,wind:Math.round(d.current?.wind_speed_10m||0),humidity:d.current?.relative_humidity_2m||0,high:Math.round(d.daily?.temperature_2m_max?.[0]||0),low:Math.round(d.daily?.temperature_2m_min?.[0]||0),rainChance:d.daily?.precipitation_probability_max?.[0]||0,desc:WC[code]||"Clear",icon:getWIcon(code)});}catch{}},()=>{},{timeout:5000});},[]);return w;}

// Storage
const sGet=async(k)=>{try{return JSON.parse(localStorage.getItem(k));}catch{return null;}};
const sSet=async(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){console.warn("Storage:",e);}};
const compress=(d,m=500)=>new Promise(r=>{const i=new Image();i.onload=()=>{const c=document.createElement("canvas"),s=Math.min(m/i.width,m/i.height,1);c.width=i.width*s;c.height=i.height*s;c.getContext("2d").drawImage(i,0,0,c.width,c.height);r(c.toDataURL("image/jpeg",0.65));};i.src=d;});
function dateKey(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function todayKey(){return dateKey(new Date());}

// Shared UI
function Pill({children,active,onClick,small}){const T=useTheme();return(<button onClick={onClick} style={{padding:small?"5px 12px":"7px 16px",borderRadius:100,border:active?"1px solid "+T.text:"1px solid "+T.border,background:active?T.text:"transparent",color:active?T.bg:T.textMuted,fontFamily:F.sans,fontSize:small?9:10,fontWeight:500,cursor:"pointer",letterSpacing:"0.08em",textTransform:"uppercase",transition:"all 0.25s",whiteSpace:"nowrap"}}>{children}</button>);}
function Logo({size=28,animate}){const T=useTheme();return(<span style={{fontFamily:F.serif,fontSize:size,color:T.text,animation:animate?"pulse 2s ease-in-out infinite":"none"}}><span style={{fontWeight:600}}>DRESHNIK</span><span style={{fontWeight:300,color:T.textMuted}}>.ai</span></span>);}
function ColorBar({items}){const all=items.flatMap(i=>i.colors||[]);if(!all.length)return null;return(<div style={{display:"flex",height:3,borderRadius:2,overflow:"hidden",gap:1}}>{all.map((c,i)=><div key={i} style={{flex:1,background:c}}/>)}</div>);}

function WeatherBar({weather}){const T=useTheme();if(!weather)return null;return(<div style={{margin:"14px 14px 0",padding:"16px 18px",background:T.card,border:"1px solid "+T.border,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:T.cardShadow}}><div style={{display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:28}}>{weather.icon}</span><div><p style={{fontFamily:F.serif,fontSize:22,color:T.text,margin:0,fontWeight:400}}>{weather.temp}°C</p><p style={{fontFamily:F.mono,fontSize:8,color:T.textMuted,margin:0,letterSpacing:"0.08em",textTransform:"uppercase"}}>{weather.desc}</p></div></div><div style={{textAlign:"right"}}><p style={{fontFamily:F.mono,fontSize:9,color:T.textDim,margin:"0 0 2px"}}>H:{weather.high}° L:{weather.low}°</p>{weather.rainChance>0&&<p style={{fontFamily:F.mono,fontSize:9,color:T.textDim,margin:0}}>Rain {weather.rainChance}%</p>}</div></div>);}

function Nav({tab,setTab,count,theme,toggleTheme}){
  const T=useTheme();
  const tabs=[{id:"wardrobe",label:"Wardrobe"},{id:"add",label:"Add"},{id:"outfits",label:"Style"},{id:"saved",label:"Saved"},{id:"insights",label:"Insights"}];
  return(<div style={{background:T.bg,borderBottom:"1px solid "+T.border,position:"sticky",top:0,zIndex:100,paddingTop:"env(safe-area-inset-top, 0px)"}}>
    <div style={{padding:"18px 22px 0"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
      <Logo size={28}/>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <button onClick={toggleTheme} style={{background:"none",border:"1px solid "+T.border,borderRadius:"50%",width:28,height:28,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,padding:0,color:T.textMuted}}>{theme==="dark"?"\u2600":"\u263E"}</button>
        <span style={{fontFamily:F.mono,fontSize:10,color:T.textDim,letterSpacing:"0.08em"}}>{count} items</span>
      </div>
    </div></div>
    <div style={{display:"flex",padding:"0 8px"}}>{tabs.map(t=>(<button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"11px 0 13px",border:"none",background:"none",borderBottom:tab===t.id?"1.5px solid "+T.text:"1.5px solid transparent",color:tab===t.id?T.text:T.textDim,fontFamily:F.sans,fontSize:9,fontWeight:500,letterSpacing:"0.14em",textTransform:"uppercase",cursor:"pointer",transition:"all 0.3s"}}>{t.label}</button>))}</div>
  </div>);
}

function ItemCard({item,onClick,onDoubleTap,idx=0}){
  const T=useTheme(),cat=CAT_MAP[item.category],lastTap=useRef(0);
  const handleTap=()=>{const now=Date.now();if(now-lastTap.current<300){onDoubleTap?.(item.id);lastTap.current=0;}else{lastTap.current=now;setTimeout(()=>{if(lastTap.current!==0){onClick?.();lastTap.current=0;}},300);}};
  return(<div onClick={handleTap} style={{background:T.card,borderRadius:3,overflow:"hidden",cursor:"pointer",border:"1px solid "+T.border,boxShadow:T.cardShadow,opacity:item.inLaundry?0.45:1,transition:"all 0.35s cubic-bezier(.23,1,.32,1)",animation:"fadeInUp "+(0.15+idx*0.04)+"s ease both"}}>
    <div style={{position:"relative",paddingTop:"125%",background:T.surface}}>
      {item.image?<img src={item.image} alt="" style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",objectFit:"cover",opacity:T.imgOpacity}}/>:
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:F.serif,fontSize:52,color:T.border,fontWeight:300}}>{cat?.label?.[0]}</span></div>}
      <div style={{position:"absolute",top:0,left:0,right:0,height:50,background:"linear-gradient(180deg,rgba(0,0,0,0.45) 0%,transparent 100%)"}}/>
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:70,background:"linear-gradient(0deg,rgba(0,0,0,0.55) 0%,transparent 100%)"}}/>
      <span style={{position:"absolute",top:8,left:8,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(16px)",padding:"3px 8px",borderRadius:2,fontFamily:F.mono,fontSize:8,color:"rgba(255,255,255,0.5)",letterSpacing:"0.12em",textTransform:"uppercase"}}>{cat?.label}{item.inLaundry?" \u00B7 \uD83E\uDDFA":""}</span>
      {item.favorite&&<span style={{position:"absolute",top:8,right:8,fontSize:12,color:"rgba(255,255,255,0.6)"}}>♥</span>}
      {item.capsule&&<div style={{position:"absolute",top:8,right:item.favorite?28:8,width:10,height:10,borderRadius:"50%",background:"#FFD700",border:"1.5px solid rgba(0,0,0,0.3)"}}/>}
      {item.colors?.length>0&&<div style={{position:"absolute",bottom:8,right:8,display:"flex",gap:2}}>{item.colors.slice(0,3).map((c,i)=><div key={i} style={{width:9,height:9,borderRadius:1,background:c,border:"1px solid rgba(255,255,255,0.08)"}}/>)}</div>}
      {(item.wearCount||0)>0&&<span style={{position:"absolute",bottom:8,left:8,fontFamily:F.mono,fontSize:8,color:"rgba(255,255,255,0.35)"}}>{item.wearCount}x</span>}
    </div>
    <div style={{padding:"10px 11px 11px"}}>
      <p style={{margin:0,fontSize:11,fontWeight:500,color:T.text,fontFamily:F.sans,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</p>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:4}}>
        <span style={{fontFamily:F.mono,fontSize:8,color:T.textDim}}>{STYLES[STYLE_IDS.indexOf(item.style)]||"\u2014"}</span>
        {item.price>0&&<span style={{fontFamily:F.mono,fontSize:8,color:T.textDim}}>{item.price}\u043B\u0432{item.wearCount>0?" \u00B7 "+Math.round(item.price/item.wearCount)+"/w":""}</span>}
      </div>
    </div>
  </div>);
}

function Modal({item,onClose,onDelete,onUpdate}){
  const T=useTheme(),cat=CAT_MAP[item.category];
  const cpw=item.price&&item.wearCount?(item.price/item.wearCount).toFixed(0):null;
  const daysSince=item.lastWorn?Math.floor((Date.now()-new Date(item.lastWorn))/86400000)+"d":"\u2014";
  const tags=[cat?.label,STYLES[STYLE_IDS.indexOf(item.style)],SEASONS.find(s=>s.id===item.season)?.label,item.brand].filter(Boolean);
  return(<div style={{position:"fixed",inset:0,background:T.overlay,backdropFilter:"blur(16px)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center",animation:"fadeIn .2s"}} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{background:T.surface,borderRadius:"18px 18px 0 0",width:"100%",maxWidth:500,maxHeight:"92vh",overflow:"auto",animation:"slideUp .35s cubic-bezier(.23,1,.32,1)",borderTop:"1px solid "+T.borderLight}}>
      <div style={{width:36,height:4,borderRadius:2,background:T.borderLight,margin:"10px auto 0"}}/>
      {item.image&&<img src={item.image} alt="" style={{width:"100%",height:320,objectFit:"cover",opacity:T.imgOpacity,marginTop:8}}/>}
      <div style={{padding:"20px 22px 34px"}}>
        <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
          {tags.map((l,i)=><span key={i} style={{border:"1px solid "+T.border,padding:"3px 10px",borderRadius:2,fontFamily:F.mono,fontSize:8,color:T.textMuted,letterSpacing:"0.08em",textTransform:"uppercase"}}>{l}</span>)}
          {item.capsule&&<span style={{border:"1px solid #665500",padding:"3px 10px",borderRadius:2,fontFamily:F.mono,fontSize:8,color:"#CCAA00",letterSpacing:"0.08em"}}>CAPSULE</span>}
          {item.inLaundry&&<span style={{border:"1px solid #445566",padding:"3px 10px",borderRadius:2,fontFamily:F.mono,fontSize:8,color:"#88AACC",letterSpacing:"0.08em"}}>IN LAUNDRY</span>}
        </div>
        <h2 style={{fontFamily:F.serif,fontSize:26,fontWeight:300,margin:"6px 0",color:T.text}}>{item.name}</h2>
        {item.colors?.length>0&&<div style={{display:"flex",gap:6,margin:"12px 0 16px"}}>{item.colors.map((c,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:6,border:"1px solid "+T.border,padding:"4px 10px 4px 4px",borderRadius:2}}><div style={{width:14,height:14,borderRadius:2,background:c,border:c==="#FFFFFF"?"1px solid "+T.border:"none"}}/><span style={{fontFamily:F.mono,fontSize:8,color:T.textMuted,letterSpacing:"0.04em",textTransform:"uppercase"}}>{getColorName(c)}</span></div>)}</div>}
        <div style={{display:"flex",gap:0,marginBottom:18,border:"1px solid "+T.border,borderRadius:2,overflow:"hidden"}}>
          {[{v:item.wearCount||0,l:"WORN"},{v:daysSince,l:"SINCE LAST"},{v:item.price?item.price+"\u043B\u0432":"\u2014",l:"PRICE"},{v:cpw?cpw+"\u043B\u0432":"\u2014",l:"COST/WEAR"}].map((d,i)=><div key={i} style={{flex:1,padding:"14px 6px",textAlign:"center",borderRight:i<3?"1px solid "+T.border:"none"}}><p style={{fontFamily:F.serif,fontSize:18,color:T.text,margin:"0 0 2px"}}>{d.v}</p><p style={{fontFamily:F.mono,fontSize:7,color:T.textDim,letterSpacing:"0.1em",margin:0}}>{d.l}</p></div>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10}}>
          {[{label:"Wore today",action:()=>onUpdate(item.id,{wearCount:(item.wearCount||0)+1,lastWorn:new Date().toISOString()})},{label:item.favorite?"Unfavorite":"Favorite",action:()=>onUpdate(item.id,{favorite:!item.favorite})},{label:item.capsule?"Remove Capsule":"Capsule",action:()=>onUpdate(item.id,{capsule:!item.capsule})},{label:item.inLaundry?"Back from laundry":"In laundry",action:()=>onUpdate(item.id,{inLaundry:!item.inLaundry})}].map((a,i)=><button key={i} onClick={a.action} style={{padding:12,borderRadius:2,border:"1px solid "+T.border,background:"transparent",fontFamily:F.mono,fontSize:9,color:T.textMuted,cursor:"pointer",letterSpacing:"0.06em",textTransform:"uppercase",transition:"all 0.2s"}}>{a.label}</button>)}
        </div>
        <button onClick={()=>{onDelete(item.id);onClose();}} style={{width:"100%",padding:12,background:"transparent",border:"1px solid "+T.dangerBorder,borderRadius:2,color:T.dangerText,fontFamily:F.mono,fontSize:9,cursor:"pointer",letterSpacing:"0.1em",textTransform:"uppercase"}}>Remove from wardrobe</button>
      </div>
    </div>
  </div>);
}

function OOTDCard({items,weather,onDismiss,calendar}){
  const T=useTheme(),[combo,setCombo]=useState(null),[show,setShow]=useState(true);
  useEffect(()=>{if(items.length<2)return;const avail=items.filter(i=>!i.inLaundry);const combos=generateCombos(avail,"everyday",1,weather);if(combos.length>0)setCombo(combos[0]);},[items.length]);
  if(!combo||!show||items.length<2)return null;
  const wornToday=calendar?.[todayKey()];
  return(<div style={{margin:"14px 14px 0",background:T.card,border:"1px solid "+T.borderLight,borderRadius:4,overflow:"hidden",boxShadow:T.cardShadow}}>
    <div style={{padding:"16px 18px 14px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
      <div><p style={{fontFamily:F.mono,fontSize:8,color:T.textDim,letterSpacing:"0.16em",margin:"0 0 4px"}}>OUTFIT OF THE DAY</p><p style={{fontFamily:F.serif,fontSize:18,color:T.text,fontWeight:400,margin:0}}>{wornToday?"You already logged today":"Today's suggestion"}</p></div>
      <button onClick={()=>{setShow(false);onDismiss?.();}} style={{background:"none",border:"none",cursor:"pointer",padding:4,color:T.textDim,fontSize:16}}>\u00D7</button>
    </div>
    {!wornToday&&<div style={{display:"flex",gap:2,height:90,padding:"0 18px 14px"}}>{combo.items.slice(0,4).map(item=><div key={item.id} style={{flex:1,borderRadius:3,overflow:"hidden",border:"1px solid "+T.border}}>{item.image?<img src={item.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:T.imgOpacity}}/>:<div style={{width:"100%",height:"100%",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:F.serif,fontSize:20,color:T.border}}>{CAT_MAP[item.category]?.label?.[0]}</span></div>}</div>)}</div>}
    <ColorBar items={combo.items}/>
  </div>);
}

function CalendarModal({calendar,items,onClose}){
  const T=useTheme(),[month,setMonth]=useState(()=>{const d=new Date();return{y:d.getFullYear(),m:d.getMonth()};});
  const firstDay=new Date(month.y,month.m,1).getDay(),daysInMonth=new Date(month.y,month.m+1,0).getDate(),today=todayKey();
  const monthNames=["January","February","March","April","May","June","July","August","September","October","November","December"];
  const prevM=()=>setMonth(p=>p.m===0?{y:p.y-1,m:11}:{...p,m:p.m-1});
  const nextM=()=>setMonth(p=>p.m===11?{y:p.y+1,m:0}:{...p,m:p.m+1});
  const days=[];for(let i=0;i<(firstDay===0?6:firstDay-1);i++)days.push(null);for(let i=1;i<=daysInMonth;i++)days.push(i);
  return(<div style={{position:"fixed",inset:0,background:T.overlay,backdropFilter:"blur(16px)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center",animation:"fadeIn .2s"}} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{background:T.surface,borderRadius:"18px 18px 0 0",width:"100%",maxWidth:500,maxHeight:"80vh",overflow:"auto",animation:"slideUp .35s cubic-bezier(.23,1,.32,1)",padding:"20px 22px 34px"}}>
      <div style={{width:36,height:4,borderRadius:2,background:T.borderLight,margin:"0 auto 16px"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <button onClick={prevM} style={{background:"none",border:"none",color:T.textMuted,fontSize:18,cursor:"pointer",padding:8}}>\u2190</button>
        <h3 style={{fontFamily:F.serif,fontSize:20,color:T.text,fontWeight:400,margin:0}}>{monthNames[month.m]} {month.y}</h3>
        <button onClick={nextM} style={{background:"none",border:"none",color:T.textMuted,fontSize:18,cursor:"pointer",padding:8}}>\u2192</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:8}}>
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=><div key={d} style={{textAlign:"center",padding:"4px 0",fontFamily:F.mono,fontSize:7,color:T.textDim,letterSpacing:"0.08em"}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {days.map((d,i)=>{if(!d)return<div key={"e"+i}/>;const dk=month.y+"-"+String(month.m+1).padStart(2,"0")+"-"+String(d).padStart(2,"0");const entry=calendar?.[dk];const isToday=dk===today;
          return(<div key={i} style={{aspectRatio:"1",borderRadius:3,border:isToday?"1.5px solid "+T.text:"1px solid "+T.border,background:entry?T.glow:"transparent",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
            <span style={{fontFamily:F.mono,fontSize:10,color:entry?T.text:T.textDim}}>{d}</span>
            {entry&&<div style={{position:"absolute",bottom:2,display:"flex",gap:1}}>{entry.slice(0,3).map((id,j)=>{const it=items.find(x=>x.id===id);return<div key={j} style={{width:5,height:5,borderRadius:1,background:it?.colors?.[0]||T.textDim}}/>;})}</div>}
          </div>);})}
      </div>
    </div>
  </div>);
}

function WardrobeTab({items,onDelete,onUpdate,weather,calendar,hideSeasonal,setHideSeasonal}){
  const T=useTheme(),[filter,setFilter]=useState("all"),[sort,setSort]=useState("newest"),[sel,setSel]=useState(null),[search,setSearch]=useState(""),[ootdOff,setOotdOff]=useState(false),[showCal,setShowCal]=useState(false);
  let displayItems=hideSeasonal?getSeasonalItems(items,true):items;
  let filtered=filter==="all"?displayItems:filter==="favorites"?displayItems.filter(i=>i.favorite):filter==="capsule"?displayItems.filter(i=>i.capsule):filter==="laundry"?displayItems.filter(i=>i.inLaundry):displayItems.filter(i=>i.category===filter);
  if(search){const q=search.toLowerCase();filtered=filtered.filter(i=>i.name.toLowerCase().includes(q)||i.brand?.toLowerCase().includes(q)||(i.tags||[]).some(t=>t.toLowerCase().includes(q)));}
  const sortFns={newest:(a,b)=>new Date(b.addedAt)-new Date(a.addedAt),most_worn:(a,b)=>(b.wearCount||0)-(a.wearCount||0),least_worn:(a,b)=>(a.wearCount||0)-(b.wearCount||0),name:(a,b)=>a.name.localeCompare(b.name),price:(a,b)=>(b.price||0)-(a.price||0)};
  filtered=[...filtered].sort(sortFns[sort]||sortFns.newest);
  const toggleFav=id=>{const itm=items.find(i=>i.id===id);if(itm)onUpdate(id,{favorite:!itm.favorite});};
  const laundryCount=items.filter(i=>i.inLaundry).length;
  return(<div style={{paddingBottom:90}}>
    <WeatherBar weather={weather}/>
    {!ootdOff&&<OOTDCard items={items} weather={weather} onDismiss={()=>setOotdOff(true)} calendar={calendar}/>}
    <div style={{padding:"14px 14px 0"}}>
      <div style={{display:"flex",gap:6,marginBottom:12}}>
        <button onClick={()=>setShowCal(true)} style={{padding:"8px 14px",borderRadius:2,border:"1px solid "+T.border,background:"transparent",fontFamily:F.mono,fontSize:8,color:T.textMuted,cursor:"pointer",letterSpacing:"0.06em"}}>CALENDAR</button>
        <button onClick={()=>setHideSeasonal(!hideSeasonal)} style={{padding:"8px 14px",borderRadius:2,border:hideSeasonal?"1px solid "+T.text:"1px solid "+T.border,background:hideSeasonal?T.glow:"transparent",fontFamily:F.mono,fontSize:8,color:hideSeasonal?T.text:T.textMuted,cursor:"pointer",letterSpacing:"0.06em"}}>SEASONAL</button>
      </div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, brand, tag..." style={{width:"100%",padding:"12px 16px",borderRadius:2,border:"1px solid "+T.border,fontSize:12,fontFamily:F.sans,color:T.text,background:T.surface,boxSizing:"border-box",marginBottom:12}}/>
      <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:10}}>
        <Pill active={filter==="all"} onClick={()=>setFilter("all")}>All {displayItems.length}</Pill>
        <Pill active={filter==="favorites"} onClick={()=>setFilter("favorites")}>Favorites</Pill>
        <Pill active={filter==="capsule"} onClick={()=>setFilter("capsule")}>Capsule</Pill>
        {laundryCount>0&&<Pill active={filter==="laundry"} onClick={()=>setFilter("laundry")}>Laundry {laundryCount}</Pill>}
        {CATEGORIES.map(cat=>{const cnt=displayItems.filter(i=>i.category===cat.id).length;if(!cnt)return null;return<Pill key={cat.id} active={filter===cat.id} onClick={()=>setFilter(cat.id)}>{cat.label} {cnt}</Pill>;})}
      </div>
      <div style={{display:"flex",gap:0,marginBottom:12,borderBottom:"1px solid "+T.border,paddingBottom:8}}>
        {[{id:"newest",l:"Recent"},{id:"most_worn",l:"Most Worn"},{id:"least_worn",l:"Least Worn"},{id:"price",l:"Price"},{id:"name",l:"A-Z"}].map(s=><button key={s.id} onClick={()=>setSort(s.id)} style={{padding:"4px 10px",border:"none",background:"none",fontFamily:F.mono,fontSize:8,color:sort===s.id?T.textSoft:T.textDim,cursor:"pointer",letterSpacing:"0.06em",textTransform:"uppercase",borderBottom:sort===s.id?"1px solid "+T.textSoft:"1px solid transparent"}}>{s.l}</button>)}
      </div>
      {filtered.length===0?<div style={{textAlign:"center",padding:"48px 20px"}}><div style={{width:50,height:1,background:T.border,margin:"0 auto 20px"}}/><p style={{fontFamily:F.serif,fontSize:20,color:T.text,fontWeight:300,marginBottom:6}}>{items.length===0?"Your wardrobe awaits":"No matches"}</p><p style={{fontFamily:F.mono,fontSize:9,color:T.textDim,letterSpacing:"0.08em"}}>{items.length===0?"TAP ADD TO START":"TRY DIFFERENT FILTERS"}</p><div style={{width:50,height:1,background:T.border,margin:"20px auto 0"}}/></div>:
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(152px,1fr))",gap:9}}>{filtered.map((item,i)=><ItemCard key={item.id} item={item} idx={i} onClick={()=>setSel(item)} onDoubleTap={toggleFav}/>)}</div>}
    </div>
    {sel&&<Modal item={sel} onClose={()=>setSel(null)} onDelete={onDelete} onUpdate={(id,upd)=>{onUpdate(id,upd);setSel(p=>({...p,...upd}));}}/>}
    {showCal&&<CalendarModal calendar={calendar} items={items} onClose={()=>setShowCal(false)}/>}
  </div>);
}

function AddTab({onAdd,lastCat}){
  const T=useTheme();const[step,setStep]=useState("photo");const[img,setImg]=useState(null);const[name,setName]=useState("");const[cat,setCat]=useState(lastCat||"");const[colors,setColors]=useState([]);const[style,setStyle]=useState("");const[season,setSeason]=useState("");const[mat,setMat]=useState("");const[brand,setBrand]=useState("");const[price,setPrice]=useState("");const[tags,setTags]=useState([]);const[tagIn,setTagIn]=useState("");const vidRef=useRef(null);const strRef=useRef(null);const fileRef=useRef(null);const[cam,setCam]=useState(false);const[err,setErr]=useState(null);
  const startCam=async()=>{try{setErr(null);const s=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:"environment"},width:{ideal:1280},height:{ideal:960}}});strRef.current=s;setCam(true);requestAnimationFrame(()=>{requestAnimationFrame(()=>{if(vidRef.current&&strRef.current){vidRef.current.srcObject=strRef.current;vidRef.current.setAttribute("playsinline","true");vidRef.current.setAttribute("webkit-playsinline","true");vidRef.current.muted=true;vidRef.current.play().catch(()=>{});}});});}catch(e){setErr("Camera unavailable. Check Settings > Safari > Camera.");}};
  const stopCam=()=>{if(strRef.current){strRef.current.getTracks().forEach(t=>t.stop());strRef.current=null;}setCam(false);};
  const capture=async()=>{const vid=vidRef.current;if(!vid||!vid.videoWidth)return;const c=document.createElement("canvas");c.width=vid.videoWidth;c.height=vid.videoHeight;c.getContext("2d").drawImage(vid,0,0);const d=await compress(c.toDataURL("image/jpeg",0.85));setImg(d);stopCam();setStep("details");};
  const handleFile=async(e)=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=async(ev)=>{const d=await compress(ev.target.result);setImg(d);stopCam();setStep("details");};r.readAsDataURL(f);};
  const toggleColor=(h)=>setColors(p=>p.includes(h)?p.filter(c=>c!==h):p.length>=3?p:[...p,h]);
  const addTag=()=>{const t=tagIn.trim().toLowerCase();if(t&&!tags.includes(t)&&tags.length<5){setTags(p=>[...p,t]);setTagIn("");}};
  const canSave=name.trim()&&cat&&colors.length>0&&style&&season;
  const save=()=>{onAdd({id:Date.now().toString(),image:img,name:name.trim(),category:cat,colors,style,season,material:mat||null,brand:brand||null,price:parseFloat(price)||0,tags,wearCount:0,favorite:false,capsule:false,inLaundry:false,lastWorn:null,addedAt:new Date().toISOString()});setStep("photo");setImg(null);setName("");setCat("");setColors([]);setStyle("");setSeason("");setMat("");setBrand("");setPrice("");setTags([]);};
  useEffect(()=>()=>stopCam(),[]);
  const inputSt={width:"100%",padding:"12px 16px",borderRadius:2,border:"1px solid "+T.border,fontSize:13,fontFamily:F.sans,color:T.text,background:T.surface,boxSizing:"border-box"};
  const labelSt={fontFamily:F.mono,fontSize:8,color:T.textDim,letterSpacing:"0.14em",display:"block",marginBottom:7,textTransform:"uppercase"};
  if(step==="photo"){return(<div style={{padding:"24px 20px"}}><p style={{...labelSt,marginBottom:3}}>NEW ITEM</p><h2 style={{fontFamily:F.serif,fontSize:26,fontWeight:300,color:T.text,margin:"0 0 28px"}}>Add to wardrobe</h2>
    {err&&<div style={{border:"1px solid "+T.borderLight,borderRadius:2,padding:"10px 14px",marginBottom:14,fontFamily:F.sans,fontSize:12,color:T.textMuted}}>{err}</div>}
    {cam?(<div style={{borderRadius:3,overflow:"hidden"}}><video ref={vidRef} autoPlay playsInline muted onLoadedMetadata={e=>e.target.play().catch(()=>{})} style={{width:"100%",display:"block",background:"#000",minHeight:300,WebkitTransform:"translateZ(0)"}}/>
      <div style={{display:"flex",gap:16,justifyContent:"center",padding:"22px 0",background:T.bg}}>
        <button onClick={capture} style={{width:64,height:64,borderRadius:"50%",border:"2px solid "+T.text,background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:50,height:50,borderRadius:"50%",background:T.text}}/></button>
        <button onClick={stopCam} style={{width:40,height:40,borderRadius:"50%",border:"1px solid "+T.border,background:T.surface,cursor:"pointer",alignSelf:"center",fontSize:16,color:T.textMuted}}>\u00D7</button>
      </div></div>):(<div style={{display:"flex",flexDirection:"column",gap:10}}>
      <button onClick={startCam} style={{padding:"40px 20px",borderRadius:3,border:"1px dashed "+T.borderLight,background:"transparent",cursor:"pointer",textAlign:"center"}}><p style={{fontFamily:F.sans,fontSize:13,color:T.text,margin:"0 0 3px",fontWeight:500}}>Capture with camera</p><p style={{fontFamily:F.mono,fontSize:8,color:T.textDim,margin:0,letterSpacing:"0.08em"}}>TAKE A PHOTO</p></button>
      <button onClick={()=>fileRef.current?.click()} style={{padding:"22px 20px",borderRadius:3,border:"1px dashed "+T.borderLight,background:"transparent",cursor:"pointer",textAlign:"center"}}><p style={{fontFamily:F.sans,fontSize:13,color:T.text,margin:"0 0 2px",fontWeight:500}}>Upload from gallery</p><p style={{fontFamily:F.mono,fontSize:8,color:T.textDim,margin:0,letterSpacing:"0.06em"}}>SELECT FILE</p></button>
      <div style={{display:"flex",alignItems:"center",gap:14,margin:"4px 0"}}><div style={{flex:1,height:1,background:T.border}}/><span style={{fontFamily:F.mono,fontSize:8,color:T.textDim}}>OR</span><div style={{flex:1,height:1,background:T.border}}/></div>
      <button onClick={()=>{setImg(null);setStep("details");}} style={{padding:"12px",borderRadius:2,border:"1px solid "+T.border,background:"transparent",fontFamily:F.mono,fontSize:9,color:T.textDim,letterSpacing:"0.1em",cursor:"pointer",textAlign:"center"}}>WITHOUT PHOTO</button>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{display:"none"}}/>
    </div>)}</div>);}
  return(<div style={{padding:"24px 20px 100px"}}>
    <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:22}}><button onClick={()=>{setStep("photo");setImg(null);}} style={{background:"none",border:"none",cursor:"pointer",padding:0,color:T.textMuted,fontSize:20}}>\u2190</button><div><p style={{...labelSt,margin:"0 0 1px"}}>DETAILS</p><h2 style={{fontFamily:F.serif,fontSize:22,fontWeight:300,color:T.text,margin:0}}>Describe your piece</h2></div></div>
    {img&&<img src={img} alt="" style={{width:"100%",height:200,objectFit:"cover",borderRadius:3,marginBottom:22,opacity:T.imgOpacity}}/>}
    <div style={{marginBottom:20}}><label style={labelSt}>NAME *</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Black Nike Dri-FIT Tee" style={inputSt}/></div>
    <div style={{marginBottom:20}}><label style={labelSt}>CATEGORY *</label><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:5}}>{CATEGORIES.map(c=><button key={c.id} onClick={()=>setCat(c.id)} style={{padding:"13px 5px",borderRadius:2,textAlign:"center",cursor:"pointer",border:cat===c.id?"1px solid "+T.text:"1px solid "+T.border,background:cat===c.id?T.glow:"transparent"}}><div style={{fontFamily:F.sans,fontSize:10,fontWeight:600,color:cat===c.id?T.text:T.textMuted,marginBottom:1}}>{c.label}</div><div style={{fontFamily:F.mono,fontSize:7,color:T.textDim}}>{c.sub}</div></button>)}</div></div>
    <div style={{marginBottom:20}}><label style={labelSt}>COLORS * \u2014 UP TO 3</label><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{COLORS.map(([hex])=><button key={hex} onClick={()=>toggleColor(hex)} style={{width:28,height:28,borderRadius:2,background:hex,cursor:"pointer",padding:0,border:colors.includes(hex)?"2px solid "+T.text:hex==="#FFFFFF"?"1px solid "+T.border:"1px solid transparent",transform:colors.includes(hex)?"scale(1.15)":"scale(1)",transition:"all 0.15s"}}/>)}</div>{colors.length>0&&<div style={{display:"flex",gap:4,marginTop:7}}>{colors.map(c=><span key={c} style={{fontFamily:F.mono,fontSize:7,border:"1px solid "+T.border,padding:"2px 8px",borderRadius:2,color:T.textMuted,letterSpacing:"0.06em",textTransform:"uppercase"}}>{getColorName(c)}</span>)}</div>}</div>
    <div style={{marginBottom:20}}><label style={labelSt}>STYLE *</label><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{STYLES.map((s,i)=><Pill key={i} active={style===STYLE_IDS[i]} onClick={()=>setStyle(STYLE_IDS[i])} small>{s}</Pill>)}</div></div>
    <div style={{marginBottom:20}}><label style={labelSt}>SEASON *</label><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{SEASONS.map(s=><Pill key={s.id} active={season===s.id} onClick={()=>setSeason(s.id)} small>{s.label}</Pill>)}</div></div>
    <div style={{marginBottom:20}}><label style={labelSt}>BRAND</label><div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:6}}>{BRANDS.map(b=><button key={b} onClick={()=>setBrand(brand===b?"":b)} style={{padding:"5px 10px",borderRadius:2,border:brand===b?"1px solid "+T.text:"1px solid "+T.border,background:brand===b?T.glow:"transparent",fontFamily:F.mono,fontSize:8,color:brand===b?T.text:T.textDim,cursor:"pointer"}}>{b}</button>)}</div><input value={brand} onChange={e=>setBrand(e.target.value)} placeholder="Or type custom" style={{...inputSt,fontSize:12}}/></div>
    <div style={{marginBottom:20}}><label style={labelSt}>MATERIAL</label><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{MATERIALS.map(m=><button key={m} onClick={()=>setMat(mat===m?"":m)} style={{padding:"5px 10px",borderRadius:2,border:mat===m?"1px solid "+T.text:"1px solid "+T.border,background:mat===m?T.glow:"transparent",fontFamily:F.mono,fontSize:8,color:mat===m?T.text:T.textDim,cursor:"pointer"}}>{m}</button>)}</div></div>
    <div style={{display:"flex",gap:10,marginBottom:20}}><div style={{flex:1}}><label style={labelSt}>PRICE (\u043B\u0432)</label><input type="number" value={price} onChange={e=>setPrice(e.target.value)} placeholder="0" style={{...inputSt,fontSize:12}}/></div><div style={{flex:2}}><label style={labelSt}>TAGS \u2014 UP TO 5</label><div style={{display:"flex",gap:6}}><input value={tagIn} onChange={e=>setTagIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTag()} placeholder="#summer" style={{...inputSt,fontSize:12,flex:1}}/><button onClick={addTag} style={{padding:"0 14px",borderRadius:2,border:"1px solid "+T.border,background:"transparent",color:T.textMuted,cursor:"pointer",fontFamily:F.mono,fontSize:10}}>+</button></div>{tags.length>0&&<div style={{display:"flex",gap:4,marginTop:6,flexWrap:"wrap"}}>{tags.map(t=><span key={t} onClick={()=>setTags(p=>p.filter(x=>x!==t))} style={{fontFamily:F.mono,fontSize:8,color:T.textMuted,background:T.card,padding:"3px 8px",borderRadius:2,cursor:"pointer"}}>#{t} \u00D7</span>)}</div>}</div></div>
    <button onClick={save} disabled={!canSave} style={{width:"100%",padding:15,borderRadius:2,border:"none",background:canSave?T.text:T.border,color:canSave?T.bg:T.textDim,fontFamily:F.sans,fontSize:11,fontWeight:600,cursor:canSave?"pointer":"not-allowed",letterSpacing:"0.12em",textTransform:"uppercase"}}>Add to wardrobe</button>
  </div>);
}

function OutfitsTab({items,onSave,weather,blacklist,addBlacklist}){
  const T=useTheme();const[occ,setOcc]=useState(null);const[results,setResults]=useState([]);const[idx,setIdx]=useState(0);const[anim,setAnim]=useState(false);const[swipeX,setSwipeX]=useState(0);const[shared,setShared]=useState(false);const touchStart=useRef(null);
  const gen=(id)=>{setOcc(id);setAnim(true);setTimeout(()=>{const avail=items.filter(i=>!i.inLaundry);setResults(generateCombos(avail,id,8,weather,blacklist));setIdx(0);setAnim(false);},500);};
  const next=()=>setIdx(p=>(p+1)%results.length);const prev=()=>setIdx(p=>p===0?results.length-1:p-1);
  const surprise=()=>{const ids=OCCASIONS.map(o=>o.id);gen(ids[Math.floor(Math.random()*ids.length)]);};
  const onTS=e=>{touchStart.current=e.touches[0].clientX;};const onTM=e=>{if(touchStart.current!==null)setSwipeX(e.touches[0].clientX-touchStart.current);};const onTE=()=>{if(Math.abs(swipeX)>60){swipeX>0?prev():next();}setSwipeX(0);touchStart.current=null;};
  const shareOutfit=async(cur)=>{const text="DRESHNIK.ai Outfit\n\n"+cur.items.map(i=>i.name).join(" + ")+"\n\n"+getExplanation(cur,occ);if(navigator.share){try{await navigator.share({title:"DRESHNIK.ai Outfit",text});setShared(true);setTimeout(()=>setShared(false),2000);}catch{}}else{await navigator.clipboard?.writeText(text);setShared(true);setTimeout(()=>setShared(false),2000);}};
  const cur=results[idx];
  return(<div style={{padding:"24px 20px 100px"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}><div><p style={{fontFamily:F.mono,fontSize:8,color:T.textDim,letterSpacing:"0.16em",marginBottom:3}}>AI STYLING ENGINE</p><h2 style={{fontFamily:F.serif,fontSize:26,fontWeight:300,color:T.text,margin:0}}>Generate outfit</h2></div>
    {items.length>=2&&<button onClick={surprise} style={{padding:"8px 14px",borderRadius:2,border:"1px solid "+T.borderLight,background:"transparent",cursor:"pointer",fontFamily:F.mono,fontSize:9,color:T.textMuted,letterSpacing:"0.06em"}}>SURPRISE</button>}</div>
    {weather&&<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18,padding:"10px 14px",border:"1px solid "+T.border,borderRadius:2}}><span style={{fontSize:16}}>{weather.icon}</span><span style={{fontFamily:F.mono,fontSize:10,color:T.textMuted}}>{weather.temp}°C · {weather.desc}{weather.rain?" — rain-friendly mode":""}</span></div>}
    {items.length<2&&<div style={{border:"1px solid "+T.border,borderRadius:2,padding:24,textAlign:"center"}}><p style={{fontFamily:F.sans,fontSize:12,color:T.textMuted,margin:0}}>Add at least 2 items to start.</p></div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5,marginBottom:24}}>{OCCASIONS.map(o=><button key={o.id} onClick={()=>gen(o.id)} disabled={items.length<2} style={{padding:"14px 3px",borderRadius:2,textAlign:"center",border:occ===o.id?"1px solid "+T.text:"1px solid "+T.border,background:occ===o.id?T.glow:"transparent",cursor:items.length<2?"not-allowed":"pointer",opacity:items.length<2?0.3:1}}><div style={{fontFamily:F.sans,fontSize:10,fontWeight:600,color:occ===o.id?T.text:T.textMuted}}>{o.label}</div></button>)}</div>
    {anim&&<div style={{textAlign:"center",padding:44}}><p style={{fontFamily:F.mono,fontSize:9,color:T.textDim,letterSpacing:"0.12em",animation:"pulse 1s ease-in-out infinite"}}>ANALYZING COMBINATIONS</p></div>}
    {!anim&&cur&&<div style={{animation:"fadeIn .35s ease"}} onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={onTE}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><h3 style={{fontFamily:F.serif,fontSize:20,fontWeight:300,color:T.text,margin:0}}>Look {idx+1}/{results.length}</h3><div style={{display:"flex",alignItems:"center",gap:4}}>{results.map((_,i)=><div key={i} style={{width:i===idx?16:6,height:3,borderRadius:2,background:i===idx?T.text:T.border,transition:"all 0.3s"}}/>)}</div></div>
      <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:12,marginBottom:14,transform:"translateX("+(swipeX*0.3)+"px)",transition:swipeX?"none":"transform 0.3s"}}>{cur.items.map((item,i)=><div key={item.id} style={{minWidth:135,background:T.card,borderRadius:3,overflow:"hidden",border:"1px solid "+T.border,flexShrink:0,boxShadow:T.cardShadow,animation:"fadeInUp "+(0.15+i*0.08)+"s ease both"}}>{item.image?<img src={item.image} alt="" style={{width:135,height:165,objectFit:"cover",opacity:T.imgOpacity}}/>:<div style={{width:135,height:165,background:T.surface,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:F.serif,fontSize:38,color:T.border}}>{CAT_MAP[item.category]?.label?.[0]}</span></div>}<div style={{padding:"9px 11px"}}><p style={{fontSize:10,fontWeight:600,color:T.text,margin:0,fontFamily:F.sans,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</p><div style={{display:"flex",gap:2,marginTop:4}}>{item.colors?.slice(0,3).map((c,j)=><div key={j} style={{width:8,height:8,borderRadius:1,background:c}}/>)}</div></div></div>)}</div>
      <ColorBar items={cur.items}/>
      <div style={{border:"1px solid "+T.border,borderRadius:2,padding:16,margin:"14px 0"}}><p style={{fontSize:12,color:T.textSoft,margin:"0 0 10px",lineHeight:1.7,fontFamily:F.sans}}>{getExplanation(cur,occ)}</p><div style={{height:1,background:T.border,margin:"0 0 10px"}}/><p style={{fontFamily:F.sans,fontSize:11,color:T.textDim,margin:0,lineHeight:1.6,fontStyle:"italic"}}>{getTip(occ)}</p></div>
      <p style={{fontFamily:F.mono,fontSize:8,color:T.textDim,textAlign:"center",letterSpacing:"0.1em",marginBottom:12}}>SWIPE TO BROWSE</p>
      <div style={{display:"flex",gap:6}}><button onClick={next} style={{flex:1,padding:14,borderRadius:2,border:"1px solid "+T.border,background:"transparent",fontFamily:F.sans,fontSize:10,fontWeight:500,color:T.textMuted,cursor:"pointer",letterSpacing:"0.08em",textTransform:"uppercase"}}>Next look</button>
      <button onClick={()=>{onSave({id:Date.now().toString(),occasion:OCCASIONS.find(x=>x.id===occ)?.label||occ,itemIds:cur.items.map(i=>i.id),reasoning:getExplanation(cur,occ),tips:getTip(occ),score:cur.score,savedAt:new Date().toISOString()});}} style={{flex:1,padding:14,borderRadius:2,border:"none",background:T.text,color:T.bg,fontFamily:F.sans,fontSize:10,fontWeight:600,cursor:"pointer",letterSpacing:"0.1em",textTransform:"uppercase"}}>Save look</button></div>
      <div style={{display:"flex",gap:6,marginTop:8}}><button onClick={()=>shareOutfit(cur)} style={{flex:1,padding:12,borderRadius:2,border:"1px solid "+T.border,background:"transparent",fontFamily:F.mono,fontSize:9,color:T.textMuted,cursor:"pointer",letterSpacing:"0.06em"}}>{shared?"COPIED!":"SHARE"}</button>
      <button onClick={()=>{const key=cur.items.map(i=>i.id).sort().join(",");addBlacklist(key);next();}} style={{flex:1,padding:12,borderRadius:2,border:"1px solid "+T.dangerBorder,background:"transparent",fontFamily:F.mono,fontSize:9,color:T.dangerText,cursor:"pointer",letterSpacing:"0.06em"}}>DON'T SUGGEST</button></div>
    </div>}
  </div>);
}

function SavedTab({saved,items,onDelete}){
  const T=useTheme();
  if(!saved.length)return(<div style={{padding:24,textAlign:"center",paddingTop:56}}><div style={{width:50,height:1,background:T.border,margin:"0 auto 20px"}}/><p style={{fontFamily:F.serif,fontSize:20,color:T.text,fontWeight:300,marginBottom:6}}>No saved looks</p><p style={{fontFamily:F.mono,fontSize:9,color:T.textDim,letterSpacing:"0.1em"}}>SAVE FROM STYLE TAB</p><div style={{width:50,height:1,background:T.border,margin:"20px auto 0"}}/></div>);
  return(<div style={{padding:"24px 20px 100px"}}><p style={{fontFamily:F.mono,fontSize:8,color:T.textDim,letterSpacing:"0.16em",marginBottom:3}}>COLLECTION</p><h2 style={{fontFamily:F.serif,fontSize:26,fontWeight:300,color:T.text,margin:"0 0 18px"}}>Saved looks</h2>
    <div style={{display:"flex",flexDirection:"column",gap:11}}>{saved.map(outfit=>{const oi=outfit.itemIds.map(id=>items.find(i=>i.id===id)).filter(Boolean);return(<div key={outfit.id} style={{background:T.card,borderRadius:3,border:"1px solid "+T.border,overflow:"hidden",boxShadow:T.cardShadow}}>
      <div style={{display:"flex",gap:1,height:100}}>{oi.slice(0,4).map(item=><div key={item.id} style={{flex:1}}>{item.image?<img src={item.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:T.imgOpacity}}/>:<div style={{width:"100%",height:"100%",background:T.surface,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:F.serif,fontSize:22,color:T.border}}>{CAT_MAP[item.category]?.label?.[0]}</span></div>}</div>)}</div>
      <ColorBar items={oi}/><div style={{padding:"12px 14px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontFamily:F.mono,fontSize:8,color:T.textMuted,letterSpacing:"0.1em",textTransform:"uppercase",border:"1px solid "+T.border,padding:"3px 9px",borderRadius:2}}>{outfit.occasion}</span><button onClick={()=>onDelete(outfit.id)} style={{background:"none",border:"none",cursor:"pointer",color:T.dangerText,fontSize:14,padding:4}}>\u00D7</button></div><p style={{fontSize:12,color:T.textMuted,margin:0,lineHeight:1.6,fontFamily:F.sans}}>{outfit.reasoning}</p></div>
    </div>);})}</div></div>);
}

function InsightsTab({items,saved}){
  const T=useTheme();const totalWears=items.reduce((a,i)=>a+(i.wearCount||0),0);const totalValue=items.reduce((a,i)=>a+(i.price||0),0);const avgCPW=totalWears>0?(totalValue/totalWears).toFixed(0):0;
  const mostWorn=[...items].sort((a,b)=>(b.wearCount||0)-(a.wearCount||0)).slice(0,3);const neverWorn=items.filter(i=>!i.wearCount);const capsuleItems=items.filter(i=>i.capsule);const laundryItems=items.filter(i=>i.inLaundry);
  const catBreakdown=CATEGORIES.map(c=>({...c,count:items.filter(i=>i.category===c.id).length,value:items.filter(i=>i.category===c.id).reduce((a,i)=>a+(i.price||0),0)})).filter(c=>c.count>0);
  const styleBreakdown=STYLES.map((s,i)=>({label:s,id:STYLE_IDS[i],count:items.filter(it=>it.style===STYLE_IDS[i]).length})).filter(s=>s.count>0).sort((a,b)=>b.count-a.count);
  const colorFreq={};items.forEach(i=>(i.colors||[]).forEach(c=>{colorFreq[c]=(colorFreq[c]||0)+1;}));const topColors=Object.entries(colorFreq).sort((a,b)=>b[1]-a[1]).slice(0,10);const maxCat=Math.max(...catBreakdown.map(c=>c.count),1);
  const withCPW=items.filter(i=>i.price>0&&i.wearCount>0).map(i=>({...i,cpw:(i.price/i.wearCount).toFixed(0)})).sort((a,b)=>a.cpw-b.cpw);const bestCPW=withCPW.slice(0,3);
  if(items.length===0)return(<div style={{padding:"24px 20px",textAlign:"center",paddingTop:60}}><p style={{fontFamily:F.sans,fontSize:12,color:T.textMuted}}>Add items to unlock analytics.</p></div>);
  const Section=({title,children})=>(<div style={{background:T.card,border:"1px solid "+T.border,borderRadius:2,padding:16,marginBottom:14,boxShadow:T.cardShadow}}><p style={{fontFamily:F.mono,fontSize:8,color:T.textDim,letterSpacing:"0.12em",margin:"0 0 12px"}}>{title}</p>{children}</div>);
  return(<div style={{padding:"24px 20px 100px"}}><p style={{fontFamily:F.mono,fontSize:8,color:T.textDim,letterSpacing:"0.16em",marginBottom:3}}>WARDROBE ANALYTICS</p><h2 style={{fontFamily:F.serif,fontSize:26,fontWeight:300,color:T.text,margin:"0 0 22px"}}>Insights</h2>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:18}}>{[{n:items.length,l:"ITEMS"},{n:totalWears,l:"WEARS"},{n:saved.length,l:"LOOKS"},{n:totalValue>0?totalValue+"\u043B\u0432":"\u2014",l:"VALUE"}].map((d,i)=><div key={i} style={{background:T.card,border:"1px solid "+T.border,borderRadius:2,padding:"16px 8px",textAlign:"center",boxShadow:T.cardShadow}}><p style={{fontFamily:F.serif,fontSize:24,color:T.text,margin:"0 0 2px",fontWeight:300}}>{d.n}</p><p style={{fontFamily:F.mono,fontSize:7,color:T.textDim,letterSpacing:"0.1em",margin:0}}>{d.l}</p></div>)}</div>
    {totalValue>0&&<Section title="SPENDING BY CATEGORY">{catBreakdown.filter(c=>c.value>0).map(c=><div key={c.id} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontFamily:F.sans,fontSize:11,color:T.textSoft}}>{c.label}</span><span style={{fontFamily:F.mono,fontSize:9,color:T.textDim}}>{c.value}\u043B\u0432 ({c.count})</span></div><div style={{height:3,background:T.border,borderRadius:2,overflow:"hidden"}}><div style={{width:(c.value/totalValue*100)+"%",height:"100%",background:T.text,borderRadius:2}}/></div></div>)}<div style={{marginTop:10,paddingTop:10,borderTop:"1px solid "+T.border}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontFamily:F.mono,fontSize:9,color:T.textMuted}}>AVG COST/WEAR</span><span style={{fontFamily:F.serif,fontSize:18,color:T.text}}>{avgCPW} \u043B\u0432</span></div></div></Section>}
    {bestCPW.length>0&&<Section title="BEST COST-PER-WEAR">{bestCPW.map((item,i)=><div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderBottom:i<bestCPW.length-1?"1px solid "+T.border:"none"}}>{item.image?<img src={item.image} alt="" style={{width:28,height:28,borderRadius:2,objectFit:"cover"}}/>:<div style={{width:28,height:28,borderRadius:2,background:T.surface}}/>}<span style={{fontFamily:F.sans,fontSize:11,color:T.text,flex:1}}>{item.name}</span><span style={{fontFamily:F.mono,fontSize:9,color:T.textDim}}>{item.cpw}\u043B\u0432/wear</span></div>)}</Section>}
    <Section title="CATEGORIES">{catBreakdown.map(c=><div key={c.id} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontFamily:F.sans,fontSize:11,color:T.textSoft}}>{c.label}</span><span style={{fontFamily:F.mono,fontSize:9,color:T.textDim}}>{c.count}</span></div><div style={{height:3,background:T.border,borderRadius:2,overflow:"hidden"}}><div style={{width:(c.count/maxCat*100)+"%",height:"100%",background:T.text,borderRadius:2}}/></div></div>)}</Section>
    {topColors.length>0&&<Section title="COLOR PALETTE"><div style={{display:"flex",gap:3,marginBottom:10,height:28}}>{topColors.map(([hex],i)=><div key={i} style={{flex:1,background:hex,borderRadius:2,border:hex==="#FFFFFF"?"1px solid "+T.border:"none"}}/>)}</div><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{topColors.map(([hex,count])=><span key={hex} style={{fontFamily:F.mono,fontSize:7,color:T.textDim}}>{getColorName(hex)} x{count}</span>)}</div></Section>}
    {styleBreakdown.length>0&&<Section title="STYLE DNA"><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{styleBreakdown.map(s=><div key={s.id} style={{border:"1px solid "+T.border,padding:"5px 10px",borderRadius:2,display:"flex",alignItems:"center",gap:6}}><span style={{fontFamily:F.sans,fontSize:11,color:T.textSoft}}>{s.label}</span><span style={{fontFamily:F.mono,fontSize:9,color:T.textDim}}>{s.count}</span></div>)}</div></Section>}
    {mostWorn.length>0&&mostWorn[0].wearCount>0&&<Section title="MOST WORN">{mostWorn.filter(i=>i.wearCount>0).map((item,i)=><div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:i<2?"1px solid "+T.border:"none"}}><span style={{fontFamily:F.mono,fontSize:16,color:T.textDim,width:20,textAlign:"right"}}>{i+1}</span>{item.image?<img src={item.image} alt="" style={{width:32,height:32,borderRadius:2,objectFit:"cover",opacity:T.imgOpacity}}/>:<div style={{width:32,height:32,borderRadius:2,background:T.surface}}/>}<div style={{flex:1}}><p style={{fontFamily:F.sans,fontSize:11,color:T.text,margin:0}}>{item.name}</p></div><span style={{fontFamily:F.mono,fontSize:10,color:T.textDim}}>{item.wearCount}x</span></div>)}</Section>}
    {laundryItems.length>0&&<Section title={"IN LAUNDRY \u2014 "+laundryItems.length+" ITEMS"}><div style={{display:"flex",gap:4,overflowX:"auto"}}>{laundryItems.map(item=><div key={item.id} style={{width:44,height:44,borderRadius:2,overflow:"hidden",flexShrink:0,border:"1px solid "+T.border,opacity:0.5}}>{item.image?<img src={item.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{width:"100%",height:"100%",background:T.surface}}/>}</div>)}</div></Section>}
    {capsuleItems.length>0&&<div style={{background:T.card,border:"1px solid #332200",borderRadius:2,padding:16,marginBottom:14,boxShadow:T.cardShadow}}><p style={{fontFamily:F.mono,fontSize:8,color:"#998800",letterSpacing:"0.12em",margin:"0 0 10px"}}>CAPSULE \u2014 {capsuleItems.length} PIECES</p><div style={{display:"flex",gap:4,overflowX:"auto"}}>{capsuleItems.map(item=><div key={item.id} style={{width:44,height:44,borderRadius:2,overflow:"hidden",flexShrink:0,border:"1px solid "+T.border}}>{item.image?<img src={item.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:T.imgOpacity}}/>:<div style={{width:"100%",height:"100%",background:T.surface}}/>}</div>)}</div></div>}
    {neverWorn.length>0&&<Section title={"NEVER WORN \u2014 "+neverWorn.length+" ITEMS"}><p style={{fontFamily:F.sans,fontSize:11,color:T.textMuted,margin:"0 0 8px"}}>Waiting to be styled</p><div style={{display:"flex",gap:3,overflowX:"auto"}}>{neverWorn.slice(0,8).map(item=><div key={item.id} style={{width:40,height:40,borderRadius:2,overflow:"hidden",flexShrink:0,border:"1px solid "+T.border}}>{item.image?<img src={item.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:0.65}}/>:<div style={{width:"100%",height:"100%",background:T.surface}}/>}</div>)}{neverWorn.length>8&&<div style={{width:40,height:40,borderRadius:2,border:"1px solid "+T.border,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontFamily:F.mono,fontSize:9,color:T.textDim}}>+{neverWorn.length-8}</span></div>}</div></Section>}
  </div>);
}

function Onboarding({onComplete}){
  const T=useTheme();const[step,setStep]=useState(0);
  const steps=[{title:"Welcome to",showLogo:true,sub:"Your AI-powered digital wardrobe",detail:"Photograph, catalogue, and combine your clothes with intelligent color theory matching."},{title:"Build your wardrobe",sub:"Snap or upload photos of your clothes",detail:"Add details like color, style, brand, and material. The more you add, the smarter the suggestions."},{title:"Get styled",sub:"AI generates outfit combinations",detail:"Based on color harmony, occasion, season, and your wear history. Double-tap to favorite."}];
  const s=steps[step];
  return(<div style={{height:"100vh",height:"100dvh",background:T.bg,display:"flex",flexDirection:"column",justifyContent:"center",padding:"0 32px"}}>
    <div style={{marginBottom:60}}><p style={{fontFamily:F.serif,fontSize:34,color:T.text,fontWeight:300,margin:"0 0 4px"}}>{s.title}</p>{s.showLogo&&<p style={{fontFamily:F.serif,fontSize:34,color:T.text,margin:"0 0 20px"}}><span style={{fontWeight:600}}>DRESHNIK</span><span style={{fontWeight:300,color:T.textMuted}}>.ai</span></p>}<p style={{fontFamily:F.sans,fontSize:15,color:T.textSoft,margin:"0 0 8px",lineHeight:1.5}}>{s.sub}</p><p style={{fontFamily:F.sans,fontSize:13,color:T.textDim,margin:0,lineHeight:1.6}}>{s.detail}</p></div>
    <div style={{display:"flex",gap:4,marginBottom:28}}>{steps.map((_,i)=><div key={i} style={{width:i===step?24:8,height:3,borderRadius:2,background:i===step?T.text:T.border,transition:"all 0.3s"}}/>)}</div>
    <div style={{display:"flex",gap:10}}>{step>0&&<button onClick={()=>setStep(step-1)} style={{padding:"14px 24px",borderRadius:2,border:"1px solid "+T.border,background:"transparent",fontFamily:F.mono,fontSize:10,color:T.textMuted,cursor:"pointer",letterSpacing:"0.1em"}}>BACK</button>}<button onClick={()=>step<2?setStep(step+1):onComplete()} style={{flex:1,padding:14,borderRadius:2,border:"none",background:T.text,color:T.bg,fontFamily:F.sans,fontSize:12,fontWeight:600,cursor:"pointer",letterSpacing:"0.1em",textTransform:"uppercase"}}>{step<2?"Next":"Start building"}</button></div>
  </div>);
}

export default function App(){
  const[tab,setTab]=useState("wardrobe");const[items,setItems]=useState([]);const[saved,setSaved]=useState([]);const[loaded,setLoaded]=useState(false);const[onboarded,setOnboarded]=useState(false);const[lastCat,setLastCat]=useState("");const[theme,setTheme]=useState("dark");const[calendar,setCalendar]=useState({});const[blacklist,setBlacklist]=useState([]);const[hideSeasonal,setHideSeasonal]=useState(false);const weather=useWeather();
  useEffect(()=>{(async()=>{const i=await sGet("d6-items");const o=await sGet("d6-outfits");const ob=await sGet("d6-onboarded");const th=await sGet("d6-theme");const cal=await sGet("d6-calendar");const bl=await sGet("d6-blacklist");const hs=await sGet("d6-seasonal");if(i)setItems(i);if(o)setSaved(o);if(ob)setOnboarded(true);if(th)setTheme(th);if(cal)setCalendar(cal);if(bl)setBlacklist(bl);if(hs)setHideSeasonal(hs);setLoaded(true);})();},[]);
  useEffect(()=>{if(loaded)sSet("d6-items",items);},[items,loaded]);
  useEffect(()=>{if(loaded)sSet("d6-outfits",saved);},[saved,loaded]);
  useEffect(()=>{if(loaded)sSet("d6-calendar",calendar);},[calendar,loaded]);
  useEffect(()=>{if(loaded)sSet("d6-blacklist",blacklist);},[blacklist,loaded]);
  useEffect(()=>{if(loaded)sSet("d6-seasonal",hideSeasonal);},[hideSeasonal,loaded]);
  const toggleTheme=()=>{const next=theme==="dark"?"light":"dark";setTheme(next);sSet("d6-theme",next);};
  const add=(item)=>{setItems(p=>[item,...p]);setLastCat(item.category);setTab("wardrobe");};
  const del=(id)=>setItems(p=>p.filter(i=>i.id!==id));
  const update=(id,upd)=>{setItems(p=>p.map(i=>i.id===id?{...i,...upd}:i));if(upd.lastWorn){const dk=todayKey();setCalendar(prev=>{const existing=prev[dk]||[];if(!existing.includes(id))return{...prev,[dk]:[...existing,id]};return prev;});}};
  const saveO=(o)=>setSaved(p=>[o,...p]);const delO=(id)=>setSaved(p=>p.filter(o=>o.id!==id));
  const completeOnb=()=>{setOnboarded(true);sSet("d6-onboarded",true);};
  const addBlacklist=(key)=>setBlacklist(p=>[...p,key]);
  const T=THEMES[theme]||THEMES.dark;
  const globalStyles=`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Syne:wght@400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap');@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes fadeInUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}::-webkit-scrollbar{display:none}html{height:-webkit-fill-available}body{background:${T.bg};margin:0;min-height:100vh;min-height:100dvh;min-height:-webkit-fill-available;padding:env(safe-area-inset-top,0) env(safe-area-inset-right,0) env(safe-area-inset-bottom,0) env(safe-area-inset-left,0);transition:background 0.3s}input,select,button{outline:none}input:focus{border-color:${theme==="dark"?"#333":"#AAA"} !important}::placeholder{color:${T.textDim}}video{-webkit-transform:translateZ(0)}`;
  if(!loaded)return(<ThemeCtx.Provider value={T}><div style={{height:"100vh",height:"100dvh",display:"flex",alignItems:"center",justifyContent:"center",background:T.bg}}><style>{globalStyles}</style><Logo size={28} animate/></div></ThemeCtx.Provider>);
  if(!onboarded)return(<ThemeCtx.Provider value={T}><style>{globalStyles}</style><Onboarding onComplete={completeOnb}/></ThemeCtx.Provider>);
  return(<ThemeCtx.Provider value={T}><div style={{maxWidth:500,margin:"0 auto",minHeight:"100vh",minHeight:"100dvh",background:T.bg,paddingBottom:"env(safe-area-inset-bottom, 0px)",transition:"background 0.3s"}}><style>{globalStyles}</style>
    <Nav tab={tab} setTab={setTab} count={items.length} theme={theme} toggleTheme={toggleTheme}/>
    {tab==="wardrobe"&&<WardrobeTab items={items} onDelete={del} onUpdate={update} weather={weather} calendar={calendar} hideSeasonal={hideSeasonal} setHideSeasonal={setHideSeasonal}/>}
    {tab==="add"&&<AddTab onAdd={add} lastCat={lastCat}/>}
    {tab==="outfits"&&<OutfitsTab items={items} onSave={saveO} weather={weather} blacklist={blacklist} addBlacklist={addBlacklist}/>}
    {tab==="saved"&&<SavedTab saved={saved} items={items} onDelete={delO}/>}
    {tab==="insights"&&<InsightsTab items={items} saved={saved}/>}
  </div></ThemeCtx.Provider>);
}
