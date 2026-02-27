import{useState,useEffect,useRef,useCallback,createContext,useContext,useMemo}from"react";
import{useAuth}from"./AuthContext.jsx";

// ============================================================
// dreshnik.ai v8 — Full rebuild with Bulgarian UI, optimizations, all features
// ============================================================

// === Constants ===
const CATEGORIES=[
  {id:"tops",label:"Горнища",sub:"Тениски, ризи, блузи"},
  {id:"bottoms",label:"Долнища",sub:"Дънки, панталони, шорти"},
  {id:"outerwear",label:"Връхни",sub:"Якета, палта, жилетки"},
  {id:"shoes",label:"Обувки",sub:"Кецове, боти, обувки"},
  {id:"accessories",label:"Аксесоари",sub:"Часовници, шапки, чанти"},
  {id:"fullbody",label:"Цяло тяло",sub:"Костюми, рокли, гащеризони"},
];
const CAT_MAP=Object.fromEntries(CATEGORIES.map(c=>[c.id,c]));
const STYLES=["Casual","Smart Casual","Formal","Sport","Streetwear","Classic","Elegant","Minimal","Bohemian","Techwear"];
const STYLE_IDS=STYLES.map(s=>s.toLowerCase().replace(" ","_"));
const SEASONS=[{id:"spring",label:"Пролет"},{id:"summer",label:"Лято"},{id:"autumn",label:"Есен"},{id:"winter",label:"Зима"},{id:"all",label:"Всички сезони"}];
const OCCASIONS=[
  {id:"everyday",label:"Ежедневно",styles:[0,1,4,7]},{id:"work",label:"Работа",styles:[1,2,5,7]},
  {id:"date",label:"Среща",styles:[1,6,5,7]},{id:"sport",label:"Спорт",styles:[3,9]},
  {id:"formal",label:"Официално",styles:[2,6,5]},{id:"party",label:"Купон",styles:[4,6,1,8]},
  {id:"travel",label:"Пътуване",styles:[0,1,9,7]},{id:"creative",label:"Креативно",styles:[4,8,9]},
];
const COLORS=[
  ["#000000","Черно"],["#FFFFFF","Бяло"],["#6B6B6B","Сиво"],["#A8A8A8","Сребро"],
  ["#1C1C2E","Тъмно синьо"],["#2563EB","Синьо"],["#7DD3FC","Небесно"],["#1E3A2F","Горски"],
  ["#4ADE80","Изумруд"],["#B8D4A3","Градински"],["#DC2626","Червено"],["#F97316","Оранжево"],
  ["#EAB308","Злато"],["#7C3AED","Виолетово"],["#EC4899","Розово"],["#92400E","Кафяво"],
  ["#D2B48C","Бежово"],["#F5F0E8","Кремаво"],["#C0A27A","Каки"],["#800020","Бордо"],
  ["#C9B8A8","Топло сиво"],["#2F4F4F","Шисти"],["#FFD700","Горчица"],["#8B4513","Коняк"],
];
const MATERIALS=["Памук","Лен","Коприна","Вълна","Кашмир","Деним","Кожа","Велур","Полиестер","Найлон","Кадифе","Кордюрой","Трико","Флийс","Gore-Tex"];
const BRANDS=["Nike","Adidas","Zara","H&M","Uniqlo","COS","Massimo Dutti","Ralph Lauren","Tommy Hilfiger","Calvin Klein","Hugo Boss","Levi's","New Balance","Converse","Друг"];
const F={serif:"'Cormorant Garamond',Georgia,serif",sans:"'Syne','Helvetica Neue',sans-serif",mono:"'JetBrains Mono','SF Mono',monospace"};

// === Themes ===
const THEMES={
  dark:{bg:"#080808",surface:"#0F0F0F",card:"#131313",border:"#1C1C1C",borderLight:"#262626",text:"#EAEAEA",textSoft:"#BBBBBB",textMuted:"#777777",textDim:"#444444",glow:"rgba(255,255,255,0.03)",overlay:"rgba(0,0,0,0.8)",danger:"#331111",dangerText:"#CC4444",imgOpacity:0.85,shadow:"none",accent:"#EAEAEA"},
  light:{bg:"#F7F6F3",surface:"#FFFFFF",card:"#FFFFFF",border:"#E5E3DE",borderLight:"#D5D3CE",text:"#1A1A1A",textSoft:"#444444",textMuted:"#888888",textDim:"#BBBBBB",glow:"rgba(0,0,0,0.02)",overlay:"rgba(255,255,255,0.85)",danger:"#FFDDDD",dangerText:"#CC3333",imgOpacity:1,shadow:"0 1px 3px rgba(0,0,0,0.06)",accent:"#1A1A1A"},
};
const ThemeCtx=createContext(THEMES.dark);
const useTheme=()=>useContext(ThemeCtx);

// === Toast System ===
const ToastCtx=createContext(null);
const useToast=()=>useContext(ToastCtx);
function ToastProvider({children}){
  const[toasts,setToasts]=useState([]);
  const show=useCallback((msg,type="info")=>{const id=Date.now();setToasts(p=>[...p,{id,msg,type}]);setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),2500);},[]);
  return(<ToastCtx.Provider value={show}>{children}<ToastOverlay toasts={toasts}/></ToastCtx.Provider>);
}
function ToastOverlay({toasts}){
  const T=useTheme();
  return(<div style={{position:"fixed",top:"env(safe-area-inset-top, 12px)",left:0,right:0,zIndex:999,display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:"12px 20px",pointerEvents:"none"}}>
    {toasts.map(t=><div key={t.id} style={{background:T.surface,border:"1px solid "+T.border,borderRadius:8,padding:"12px 24px",fontFamily:F.sans,fontSize:13,color:t.type==="error"?T.dangerText:T.text,boxShadow:"0 4px 12px rgba(0,0,0,0.15)",animation:"fadeInUp 0.25s ease",pointerEvents:"auto",maxWidth:340,textAlign:"center"}}>{t.msg}</div>)}
  </div>);
}

// === Confirm Dialog ===
const ConfirmCtx=createContext(null);
const useConfirm=()=>useContext(ConfirmCtx);
function ConfirmProvider({children}){
  const[state,setState]=useState(null);
  const confirm=useCallback((msg,onYes)=>{setState({msg,onYes});},[]);
  const close=()=>setState(null);
  return(<ConfirmCtx.Provider value={confirm}>{children}{state&&<ConfirmDialog msg={state.msg} onYes={()=>{state.onYes();close();}} onNo={close}/>}</ConfirmCtx.Provider>);
}
function ConfirmDialog({msg,onYes,onNo}){
  const T=useTheme();
  return(<div style={{position:"fixed",inset:0,background:T.overlay,backdropFilter:"blur(12px)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:24,animation:"fadeIn .15s"}} onClick={onNo}>
    <div onClick={e=>e.stopPropagation()} style={{background:T.surface,border:"1px solid "+T.border,borderRadius:4,padding:24,maxWidth:320,width:"100%",animation:"fadeInUp .2s ease"}}>
      <p style={{fontFamily:F.sans,fontSize:13,color:T.text,margin:"0 0 20px",lineHeight:1.6}}>{msg}</p>
      <div style={{display:"flex",gap:8}}>
        <button onClick={onNo} style={{flex:1,padding:12,borderRadius:2,border:"1px solid "+T.border,background:"transparent",fontFamily:F.mono,fontSize:11,color:T.textMuted,cursor:"pointer",letterSpacing:"0.08em"}}>ОТКАЗ</button>
        <button onClick={onYes} style={{flex:1,padding:12,borderRadius:2,border:"none",background:T.dangerText,color:"#fff",fontFamily:F.mono,fontSize:11,cursor:"pointer",letterSpacing:"0.08em"}}>ПОТВЪРДИ</button>
      </div>
    </div>
  </div>);
}

// === Color Engine ===
function hexToHSL(hex){let r=parseInt(hex.slice(1,3),16)/255,g=parseInt(hex.slice(3,5),16)/255,b=parseInt(hex.slice(5,7),16)/255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,s=0,l=(mx+mn)/2;if(mx!==mn){const d=mx-mn;s=l>0.5?d/(2-mx-mn):d/(mx+mn);if(mx===r)h=((g-b)/d+(g<b?6:0))/6;else if(mx===g)h=((b-r)/d+2)/6;else h=((r-g)/d+4)/6;}return{h:h*360,s:s*100,l:l*100};}
function isNeutral(hex){const h=hexToHSL(hex);return h.s<15||h.l>90||h.l<10;}
function colorCompat(a,b){if(isNeutral(a)||isNeutral(b))return 0.9;const h1=hexToHSL(a),h2=hexToHSL(b),d=Math.min(Math.abs(h1.h-h2.h),360-Math.abs(h1.h-h2.h));if(d>=150)return 0.85;if(d<=30)return 0.8;if(d>=110&&d<=130)return 0.75;if(d>=40&&d<=80)return 0.3;return 0.5;}
function getCurrentSeason(){const m=new Date().getMonth();if(m<=1||m===11)return"winter";if(m<=4)return"spring";if(m<=7)return"summer";return"autumn";}
function getSeasonalItems(items,hide){if(!hide)return items;const cs=getCurrentSeason(),comp={winter:["winter","autumn","all"],summer:["summer","spring","all"],spring:["spring","summer","all"],autumn:["autumn","winter","all"]};return items.filter(i=>!i.season||comp[cs]?.includes(i.season));}
function getColorName(hex){const c=COLORS.find(x=>x[0]===hex);return c?c[1]:hex;}

// === Scoring ===
function scoreOutfit(combo,occIdx,weather,blSet){
  if(blSet){const key=combo.map(i=>i.id).sort().join(",");if(blSet.has(key))return-1000;}
  let s=0;const occ=OCCASIONS[occIdx];
  combo.forEach(i=>{const sIdx=STYLE_IDS.indexOf(i.style);if(occ&&occ.styles.includes(sIdx))s+=25;else s+=5;});
  for(let i=0;i<combo.length;i++)for(let j=i+1;j<combo.length;j++){const c1=combo[i].colors?.[0],c2=combo[j].colors?.[0];if(c1&&c2)s+=colorCompat(c1,c2)*30;}
  const cs=getCurrentSeason();combo.forEach(i=>{if(i.season==="all"||i.season===cs)s+=12;});
  const n=combo.filter(i=>i.colors?.[0]&&isNeutral(i.colors[0])).length;if(n>=1&&n<combo.length)s+=15;
  combo.forEach(i=>{if((i.wearCount||0)<3)s+=5;});
  if(weather){if(weather.temp<10)combo.forEach(i=>{if(i.category==="outerwear")s+=10;if(i.season==="winter")s+=5;});if(weather.temp>25)combo.forEach(i=>{if(i.season==="summer")s+=8;});if(weather.rain)combo.forEach(i=>{if(["Gore-Tex","Найлон","Nylon"].includes(i.material))s+=8;if(["Велур","Suede","Коприна","Silk"].includes(i.material))s-=5;});}
  return s;
}
function generateCombos(items,occId,count,weather,blacklist){
  const occIdx=OCCASIONS.findIndex(o=>o.id===occId),available=items.filter(i=>!i.inLaundry),byC={};
  CATEGORIES.forEach(c=>{byC[c.id]=available.filter(i=>i.category===c.id);});
  const combos=[],tops=byC.tops||[],bottoms=byC.bottoms||[],shoes=byC.shoes||[],outer=byC.outerwear||[],acc=byC.accessories||[],full=byC.fullbody||[];
  // Limit combos for performance
  const maxPer=12;const tSlice=tops.slice(0,maxPer),bSlice=bottoms.slice(0,maxPer),sSlice=shoes.slice(0,8),oSlice=outer.slice(0,8);
  tSlice.forEach(t=>bSlice.forEach(b=>{combos.push({items:[t,b]});sSlice.forEach(s=>combos.push({items:[t,b,s]}));oSlice.forEach(o=>combos.push({items:[t,b,o]}));if(sSlice.length&&oSlice.length)sSlice.slice(0,4).forEach(s=>oSlice.slice(0,4).forEach(o=>combos.push({items:[t,b,s,o]})));acc.slice(0,4).forEach(a=>combos.push({items:[t,b,a]}));}));
  full.forEach(f=>{combos.push({items:[f]});sSlice.forEach(s=>combos.push({items:[f,s]}));oSlice.forEach(o=>combos.push({items:[f,o]}));});
  const blSet=blacklist?.length?new Set(blacklist):null;combos.forEach(c=>{c.score=scoreOutfit(c.items,occIdx,weather,blSet);});
  combos.sort((a,b)=>b.score-a.score);const seen=new Set(),res=[];
  for(const c of combos){const k=c.items.map(i=>i.id).sort().join(",");if(!seen.has(k)&&c.score>-500){seen.add(k);res.push(c);if(res.length>=count)break;}}return res;
}
function getExplanation(combo,occ){
  const neutrals=combo.items.filter(i=>i.colors?.[0]&&isNeutral(i.colors[0])),accents=combo.items.filter(i=>i.colors?.[0]&&!isNeutral(i.colors[0]));
  let t="";if(neutrals.length>0&&accents.length>0)t+="Неутрална база: "+neutrals.map(n=>n.name).join(" + ")+" с акцент: "+accents.map(a=>a.name).join(", ")+". ";
  else if(neutrals.length===combo.items.length)t+="Монохромна визия — чиста и уверена. ";
  else t+="Смел цветови микс — "+combo.items.map(i=>i.name).join(" + ")+". ";
  const o=OCCASIONS.find(x=>x.id===occ);if(o){const matching=combo.items.filter(i=>o.styles.includes(STYLE_IDS.indexOf(i.style)));if(matching.length===combo.items.length)t+="Перфектен мач за "+o.label+".";else if(matching.length>0)t+=matching.map(x=>x.name).join(" & ")+" задава тона.";}return t;
}
const TIPS={everyday:["Навий ръкави за ефортлес стил.","Бели кецове заковават всяка визия.","Тъкни ризата от едната страна.","Добави верижка за акцент."],work:["Колан и обувки — същият цвят.","Инвестирай в тейлъринг.","Макс 3 цвята за авторитет.","Часовникът елевира всичко."],date:["Едно statement парче е достатъчно.","Обувките правят първо впечатление.","Тъмни цветове = увереност.","Парфюмът завършва визията."],sport:["Само дишащи материи.","Монохром изглежда скъпо.","Сетовете изглеждат умишлено.","Чисти кецове — винаги."],formal:["Ризата трябва да е гладена.","Тъмни тонове излъчват авторитет.","Детайли — маншети, яка, копчета.","Кройката е всичко."],party:["Едно смело парче носи цялата визия.","Миксът от текстури добавя дълбочина.","Черното е винаги безопасно.","Аксесоарите правят разликата."],travel:["Слоестото обличане — твоят приятел.","Неутрална база, един поп цвят.","Устойчиви на гънки материи.","Комфорт на първо място."],creative:["Наруши правилата.","Миксирай неочаквани принтове.","Смелите цветове показват увереност.","Аксесоарите разказват историята ти."]};
function getTip(occ){const l=TIPS[occ]||TIPS.everyday;return l[Math.floor(Math.random()*l.length)];}

// === Weather (cached) ===
const WC={0:"Ясно",1:"Предимно ясно",2:"Частично облачно",3:"Облачно",45:"Мъгла",48:"Мъгла",51:"Лек ръмеж",53:"Ръмеж",55:"Силен ръмеж",61:"Лек дъжд",63:"Дъжд",65:"Силен дъжд",71:"Лек сняг",73:"Сняг",75:"Силен сняг",80:"Превалявания",95:"Гръмотевична буря"};
function getWIcon(code){if(code<=1)return"☀";if(code<=3)return"☁";if(code>=45&&code<=48)return"🌫";if(code>=51&&code<=67)return"🌧";if(code>=71&&code<=77)return"❄";if(code>=80&&code<=82)return"🌦";if(code>=95)return"⛈";return"☀";}
let weatherCache=null;let weatherTs=0;
function useWeather(){const[w,setW]=useState(weatherCache);useEffect(()=>{if(Date.now()-weatherTs<600000&&weatherCache){setW(weatherCache);return;}if(!navigator.geolocation)return;navigator.geolocation.getCurrentPosition(async pos=>{try{const lat=pos.coords.latitude,lon=pos.coords.longitude;const[wr,gr]=await Promise.all([fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&timezone=auto&forecast_days=1`),fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=bg`)]);const d=await wr.json();let city="";try{const geo=await gr.json();city=geo.address?.city||geo.address?.town||geo.address?.village||geo.address?.municipality||"";}catch(e){console.warn(e);}const code=d.current?.weather_code||0;const result={temp:Math.round(d.current?.temperature_2m||0),rain:code>=51&&code<=67,code,wind:Math.round(d.current?.wind_speed_10m||0),humidity:d.current?.relative_humidity_2m||0,high:Math.round(d.daily?.temperature_2m_max?.[0]||0),low:Math.round(d.daily?.temperature_2m_min?.[0]||0),rainChance:d.daily?.precipitation_probability_max?.[0]||0,desc:WC[code]||"Ясно",icon:getWIcon(code),city};weatherCache=result;weatherTs=Date.now();setW(result);}catch(e){console.warn(e);}},()=>{},{timeout:5000});},[]);return w;}

// === Storage (sync, no fake async) ===
function sGet(k){try{return JSON.parse(localStorage.getItem(k));}catch{return null;}}
function sSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){console.warn("Storage:",e);}}
function compress(d,m=500){return new Promise(r=>{const i=new Image();i.onload=()=>{const c=document.createElement("canvas"),s=Math.min(m/i.width,m/i.height,1);c.width=i.width*s;c.height=i.height*s;c.getContext("2d").drawImage(i,0,0,c.width,c.height);r(c.toDataURL("image/jpeg",0.65));};i.src=d;});}
function dateKey(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function todayKey(){return dateKey(new Date());}
function useCurrency(){const{settings}=useAuth()||{};return settings?.currency||"лв";}

// === Shared UI ===
function Pill({children,active,onClick,small}){const T=useTheme();return(<button onClick={onClick} style={{padding:small?"6px 14px":"8px 18px",borderRadius:100,border:active?"1px solid "+T.text:"1px solid "+T.border,background:active?T.text:"transparent",color:active?T.bg:T.textMuted,fontFamily:F.sans,fontSize:small?11:12,fontWeight:500,cursor:"pointer",transition:"all 0.25s",whiteSpace:"nowrap"}}>{children}</button>);}
function Logo({size=28,animate}){const T=useTheme();return(<span style={{fontFamily:F.serif,fontSize:size,color:T.text,animation:animate?"pulse 2s ease-in-out infinite":"none"}}><span style={{fontWeight:600}}>DRESHNIK</span><span style={{fontWeight:300,color:T.textMuted}}>.bg</span></span>);}
function ColorBar({items}){const all=items.flatMap(i=>i.colors||[]);if(!all.length)return null;return(<div style={{display:"flex",height:3,borderRadius:2,overflow:"hidden",gap:1}}>{all.map((c,i)=><div key={i} style={{flex:1,background:c}}/>)}</div>);}
function WeatherBar({weather}){const T=useTheme();if(!weather)return null;return(<div style={{margin:"14px 14px 0",padding:"16px 18px",background:T.card,border:"1px solid "+T.border,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:T.shadow}}><div style={{display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:28}}>{weather.icon}</span><div><p style={{fontFamily:F.sans,fontSize:20,color:T.text,margin:0,fontWeight:500}}>{weather.temp}°</p><p style={{fontFamily:F.sans,fontSize:11,color:T.textMuted,margin:"2px 0 0"}}>{weather.desc}{weather.city?" / "+weather.city:""}</p></div></div><div style={{textAlign:"right"}}><p style={{fontFamily:F.sans,fontSize:11,color:T.textDim,margin:"0 0 2px"}}>{weather.high}° / {weather.low}°</p>{weather.rainChance>0&&<p style={{fontFamily:F.sans,fontSize:11,color:T.textDim,margin:0}}>Дъжд {weather.rainChance}%</p>}</div></div>);}
function EmptyState({icon,title,sub}){const T=useTheme();return(<div style={{textAlign:"center",padding:"48px 24px"}}><div style={{fontSize:36,marginBottom:16,opacity:0.4}}>{icon}</div><p style={{fontFamily:F.serif,fontSize:20,color:T.text,fontWeight:300,marginBottom:6}}>{title}</p><p style={{fontFamily:F.mono,fontSize:11,color:T.textDim,letterSpacing:"0.08em"}}>{sub}</p></div>);}

function Nav({tab,setTab,count,theme,toggleTheme}){
  const T=useTheme();
  const tabs=[{id:"wardrobe",icon:"◩",label:"Гардероб"},{id:"add",icon:"+",label:"Добави"},{id:"outfits",icon:"✦",label:"Стил"},{id:"saved",icon:"♡",label:"Запазени"},{id:"insights",icon:"◎",label:"Анализ"},{id:"profile",icon:"○",label:"Профил"}];
  return(<div style={{background:T.bg,borderBottom:"1px solid "+T.border,position:"sticky",top:0,zIndex:100,paddingTop:"env(safe-area-inset-top, 0px)"}}>
    <div style={{padding:"18px 22px 0"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
      <Logo size={26}/>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <button onClick={toggleTheme} style={{background:"none",border:"1px solid "+T.border,borderRadius:"50%",width:28,height:28,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,padding:0,color:T.textMuted}}>{theme==="dark"?"☀":"☾"}</button>
        <span style={{fontFamily:F.mono,fontSize:10,color:T.textDim,letterSpacing:"0.08em"}}>{count}</span>
      </div>
    </div></div>
    <div style={{display:"flex",padding:"0 4px"}}>{tabs.map(t=>(<button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"10px 0 12px",border:"none",background:"none",borderBottom:tab===t.id?"1.5px solid "+T.text:"1.5px solid transparent",color:tab===t.id?T.text:T.textDim,fontFamily:F.sans,fontSize:11,fontWeight:tab===t.id?600:400,cursor:"pointer",transition:"all 0.3s"}}>{t.label}</button>))}</div>
  </div>);
}

// === ItemCard ===
function ItemCard({item,onClick,onDoubleTap,idx=0}){
  const T=useTheme(),cat=CAT_MAP[item.category],lastTap=useRef(0);
  const handleTap=()=>{const now=Date.now();if(now-lastTap.current<300){onDoubleTap?.(item.id);lastTap.current=0;}else{lastTap.current=now;setTimeout(()=>{if(lastTap.current!==0){onClick?.();lastTap.current=0;}},300);}};
  return(<div onClick={handleTap} style={{background:T.card,borderRadius:3,overflow:"hidden",cursor:"pointer",border:"1px solid "+T.border,boxShadow:T.shadow,opacity:item.inLaundry?0.45:1,transition:"all 0.35s cubic-bezier(.23,1,.32,1)",animation:"fadeInUp "+(0.15+idx*0.04)+"s ease both"}}>
    <div style={{position:"relative",paddingTop:"125%",background:T.surface}}>
      {item.image?<img src={item.image} alt="" loading="lazy" style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",objectFit:"cover",opacity:T.imgOpacity}}/>:
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:F.serif,fontSize:52,color:T.border,fontWeight:300}}>{cat?.label?.[0]}</span></div>}
      <div style={{position:"absolute",top:0,left:0,right:0,height:50,background:"linear-gradient(180deg,rgba(0,0,0,0.45) 0%,transparent 100%)"}}/>
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:70,background:"linear-gradient(0deg,rgba(0,0,0,0.55) 0%,transparent 100%)"}}/>
      <span style={{position:"absolute",top:8,left:8,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(16px)",padding:"3px 8px",borderRadius:2,fontFamily:F.mono,fontSize:11,color:"rgba(255,255,255,0.5)",letterSpacing:"0.12em",textTransform:"uppercase"}}>{cat?.label}{item.inLaundry?" · 🧺":""}</span>
      {item.favorite&&<span style={{position:"absolute",top:8,right:8,fontSize:12,color:"rgba(255,255,255,0.6)"}}>♥</span>}
      {item.capsule&&<div style={{position:"absolute",top:8,right:item.favorite?28:8,width:10,height:10,borderRadius:"50%",background:"#FFD700",border:"1.5px solid rgba(0,0,0,0.3)"}}/>}
      {item.colors?.length>0&&<div style={{position:"absolute",bottom:8,right:8,display:"flex",gap:2}}>{item.colors.slice(0,3).map((c,i)=><div key={i} style={{width:9,height:9,borderRadius:1,background:c,border:"1px solid rgba(255,255,255,0.08)"}}/>)}</div>}
      {(item.wearCount||0)>0&&<span style={{position:"absolute",bottom:8,left:8,fontFamily:F.mono,fontSize:10,color:"rgba(255,255,255,0.35)"}}>{item.wearCount}×</span>}
    </div>
    <div style={{padding:"10px 10px 11px"}}>
      <p style={{fontFamily:F.sans,fontSize:11,fontWeight:600,color:T.text,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</p>
      <p style={{fontFamily:F.mono,fontSize:10,color:T.textDim,margin:"3px 0 0",letterSpacing:"0.04em"}}>{item.brand||STYLES[STYLE_IDS.indexOf(item.style)]||""}</p>
    </div>
  </div>);
}

// === Modal (Item Detail + Edit) ===
function Modal({item,onClose,onDelete,onUpdate}){
  const T=useTheme(),toast=useToast(),confirm=useConfirm(),cur=useCurrency();
  const[editing,setEditing]=useState(false);const[editData,setEditData]=useState({});
  const cat=CAT_MAP[item.category];
  const cpw=item.price&&item.wearCount?(item.price/item.wearCount).toFixed(0):null;
  const daysSince=item.lastWorn?Math.floor((Date.now()-new Date(item.lastWorn))/86400000)+"д":"—";
  const tags=[cat?.label,STYLES[STYLE_IDS.indexOf(item.style)],SEASONS.find(s=>s.id===item.season)?.label,item.brand].filter(Boolean);
  const startEdit=()=>{setEditData({name:item.name,price:item.price||"",brand:item.brand||"",material:item.material||"",style:item.style,season:item.season});setEditing(true);};
  const saveEdit=()=>{onUpdate(item.id,{...editData,price:parseFloat(editData.price)||0});setEditing(false);toast("Запазено ✓","success");};
  const inputSt={width:"100%",padding:"10px 14px",borderRadius:2,border:"1px solid "+T.border,fontSize:12,fontFamily:F.sans,color:T.text,background:T.surface,boxSizing:"border-box",marginBottom:8};
  const labelSt={fontFamily:F.mono,fontSize:11,color:T.textDim,letterSpacing:"0.12em",display:"block",marginBottom:4,textTransform:"uppercase"};
  return(<div style={{position:"fixed",inset:0,background:T.overlay,backdropFilter:"blur(16px)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center",animation:"fadeIn .2s"}} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{background:T.surface,borderRadius:"18px 18px 0 0",width:"100%",maxWidth:500,maxHeight:"92vh",overflow:"auto",animation:"slideUp .35s cubic-bezier(.23,1,.32,1)",borderTop:"1px solid "+T.borderLight}}>
      <div style={{width:36,height:4,borderRadius:2,background:T.borderLight,margin:"10px auto 0"}}/>
      {item.image&&<img src={item.image} alt="" style={{width:"100%",height:320,objectFit:"cover",opacity:T.imgOpacity,marginTop:8}}/>}
      <div style={{padding:"20px 22px 34px"}}>
        {!editing?<>
          <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
            {tags.map((l,i)=><span key={i} style={{border:"1px solid "+T.border,padding:"3px 10px",borderRadius:2,fontFamily:F.mono,fontSize:10,color:T.textMuted,letterSpacing:"0.08em",textTransform:"uppercase"}}>{l}</span>)}
            {item.capsule&&<span style={{border:"1px solid #665500",padding:"3px 10px",borderRadius:2,fontFamily:F.mono,fontSize:10,color:"#CCAA00",letterSpacing:"0.08em"}}>КАПСУЛА</span>}
            {item.inLaundry&&<span style={{border:"1px solid #445566",padding:"3px 10px",borderRadius:2,fontFamily:F.mono,fontSize:10,color:"#88AACC",letterSpacing:"0.08em"}}>В ПЕРАЛНЯ</span>}
          </div>
          <h2 style={{fontFamily:F.serif,fontSize:26,fontWeight:300,margin:"6px 0",color:T.text}}>{item.name}</h2>
          {item.colors?.length>0&&<div style={{display:"flex",gap:6,margin:"12px 0 16px"}}>{item.colors.map((c,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:6,border:"1px solid "+T.border,padding:"4px 10px 4px 4px",borderRadius:2}}><div style={{width:14,height:14,borderRadius:2,background:c,border:c==="#FFFFFF"?"1px solid "+T.border:"none"}}/><span style={{fontFamily:F.mono,fontSize:10,color:T.textMuted,letterSpacing:"0.04em",textTransform:"uppercase"}}>{getColorName(c)}</span></div>)}</div>}
          <div style={{display:"flex",gap:0,marginBottom:18,border:"1px solid "+T.border,borderRadius:2,overflow:"hidden"}}>
            {[{v:item.wearCount||0,l:"НОСЕНО"},{v:daysSince,l:"ОТ ПОСЛЕДНО"},{v:item.price?item.price+cur:"—",l:"ЦЕНА"},{v:cpw?cpw+cur:"—",l:"ЦЕНА/НОСЕНЕ"}].map((d,i)=><div key={i} style={{flex:1,padding:"14px 6px",textAlign:"center",borderRight:i<3?"1px solid "+T.border:"none"}}><p style={{fontFamily:F.serif,fontSize:18,color:T.text,margin:"0 0 2px"}}>{d.v}</p><p style={{fontFamily:F.mono,fontSize:8,color:T.textDim,letterSpacing:"0.1em",margin:0}}>{d.l}</p></div>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10}}>
            {[{label:"Носих днес",action:()=>{onUpdate(item.id,{wearCount:(item.wearCount||0)+1,lastWorn:new Date().toISOString()});toast("Отбелязано ✓","success");}},{label:item.favorite?"Премахни ♥":"Любимо ♥",action:()=>{onUpdate(item.id,{favorite:!item.favorite});toast(item.favorite?"Премахнато":"Добавено в любими ♥","success");}},{label:item.capsule?"Не е капсула":"Капсула ✦",action:()=>{onUpdate(item.id,{capsule:!item.capsule});toast(item.capsule?"Премахнато от капсула":"Добавено в капсула","success");}},{label:item.inLaundry?"Чисто 🧺":"В пералня 🧺",action:()=>{onUpdate(item.id,{inLaundry:!item.inLaundry});toast(item.inLaundry?"Обратно в гардероба":"Маркирано за пране","success");}}].map((a,i)=><button key={i} onClick={a.action} style={{padding:12,borderRadius:2,border:"1px solid "+T.border,background:"transparent",fontFamily:F.mono,fontSize:11,color:T.textMuted,cursor:"pointer",letterSpacing:"0.04em",transition:"all 0.2s"}}>{a.label}</button>)}
          </div>
          <div style={{display:"flex",gap:6}}>
            <button onClick={startEdit} style={{flex:1,padding:12,borderRadius:2,border:"1px solid "+T.border,background:"transparent",fontFamily:F.mono,fontSize:11,color:T.textMuted,cursor:"pointer",letterSpacing:"0.06em"}}>РЕДАКТИРАЙ</button>
            <button onClick={()=>{const dup={...item,id:Date.now().toString(),name:item.name+" (копие)",addedAt:new Date().toISOString(),wearCount:0,lastWorn:null};onUpdate("__duplicate__",dup);onClose();toast("Дублирано ✓","success");}} style={{flex:1,padding:12,borderRadius:2,border:"1px solid "+T.border,background:"transparent",fontFamily:F.mono,fontSize:11,color:T.textMuted,cursor:"pointer",letterSpacing:"0.06em"}}>ДУБЛИРАЙ</button>
          </div>
          <button onClick={()=>confirm("Сигурен ли си, че искаш да премахнеш "+item.name+"?",()=>{onDelete(item.id);onClose();toast("Премахнато","info");})} style={{width:"100%",padding:12,background:"transparent",border:"1px solid "+T.danger,borderRadius:2,color:T.dangerText,fontFamily:F.mono,fontSize:11,cursor:"pointer",letterSpacing:"0.08em",textTransform:"uppercase",marginTop:8}}>Премахни от гардероба</button>
        </>:
        /* Edit mode */
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <h3 style={{fontFamily:F.serif,fontSize:20,fontWeight:300,color:T.text,margin:0}}>Редактирай</h3>
            <button onClick={()=>setEditing(false)} style={{background:"none",border:"none",color:T.textDim,fontSize:18,cursor:"pointer"}}>×</button>
          </div>
          <label style={labelSt}>ИМЕ</label><input value={editData.name||""} onChange={e=>setEditData(p=>({...p,name:e.target.value}))} style={inputSt}/>
          <label style={labelSt}>ЦЕНА</label><input type="number" value={editData.price||""} onChange={e=>setEditData(p=>({...p,price:e.target.value}))} style={inputSt}/>
          <label style={labelSt}>МАРКА</label><input value={editData.brand||""} onChange={e=>setEditData(p=>({...p,brand:e.target.value}))} style={inputSt}/>
          <label style={labelSt}>СТИЛ</label><div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:12}}>{STYLES.map((s,i)=><Pill key={i} active={editData.style===STYLE_IDS[i]} onClick={()=>setEditData(p=>({...p,style:STYLE_IDS[i]}))} small>{s}</Pill>)}</div>
          <label style={labelSt}>СЕЗОН</label><div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:16}}>{SEASONS.map(s=><Pill key={s.id} active={editData.season===s.id} onClick={()=>setEditData(p=>({...p,season:s.id}))} small>{s.label}</Pill>)}</div>
          <button onClick={saveEdit} style={{width:"100%",padding:14,borderRadius:2,border:"none",background:T.text,color:T.bg,fontFamily:F.sans,fontSize:11,fontWeight:600,cursor:"pointer",letterSpacing:"0.1em"}}>ЗАПАЗИ ПРОМЕНИТЕ</button>
        </div>}
      </div>
    </div>
  </div>);
}

// === OOTD Card ===
function OOTDCard({items,weather,onDismiss,calendar}){
  const T=useTheme(),[combo,setCombo]=useState(null),[show,setShow]=useState(true);
  useEffect(()=>{if(items.length<2)return;const avail=items.filter(i=>!i.inLaundry);const combos=generateCombos(avail,"everyday",1,weather);if(combos.length>0)setCombo(combos[0]);},[items.length]);
  if(!combo||!show||items.length<2)return null;
  const wornToday=calendar?.[todayKey()];
  return(<div style={{margin:"14px 14px 0",background:T.card,border:"1px solid "+T.borderLight,borderRadius:4,overflow:"hidden",boxShadow:T.shadow}}>
    <div style={{padding:"16px 18px 14px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
      <div><p style={{fontFamily:F.mono,fontSize:10,color:T.textDim,letterSpacing:"0.16em",margin:"0 0 4px"}}>ВИЗИЯ НА ДЕНЯ</p><p style={{fontFamily:F.serif,fontSize:18,color:T.text,fontWeight:400,margin:0}}>{wornToday?"Вече отбеляза днешната визия":"Предложение за днес"}</p></div>
      <button onClick={()=>{setShow(false);onDismiss?.();}} style={{background:"none",border:"none",cursor:"pointer",padding:4,color:T.textDim,fontSize:16}}>×</button>
    </div>
    {!wornToday&&<div style={{display:"flex",gap:2,height:90,padding:"0 18px 14px"}}>{combo.items.slice(0,4).map(item=><div key={item.id} style={{flex:1,borderRadius:3,overflow:"hidden",border:"1px solid "+T.border}}>{item.image?<img src={item.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:T.imgOpacity}}/>:<div style={{width:"100%",height:"100%",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:F.serif,fontSize:20,color:T.border}}>{CAT_MAP[item.category]?.label?.[0]}</span></div>}</div>)}</div>}
    <ColorBar items={combo.items}/>
  </div>);
}

// === Calendar Modal ===
function CalendarModal({calendar,items,onClose}){
  const T=useTheme(),[month,setMonth]=useState(()=>{const d=new Date();return{y:d.getFullYear(),m:d.getMonth()};});
  const firstDay=new Date(month.y,month.m,1).getDay(),daysInMonth=new Date(month.y,month.m+1,0).getDate(),today=todayKey();
  const monthNames=["Януари","Февруари","Март","Април","Май","Юни","Юли","Август","Септември","Октомври","Ноември","Декември"];
  const prevM=()=>setMonth(p=>p.m===0?{y:p.y-1,m:11}:{...p,m:p.m-1});
  const nextM=()=>setMonth(p=>p.m===11?{y:p.y+1,m:0}:{...p,m:p.m+1});
  // Monday-start: convert Sunday=0 to index 6, Mon=1->0, etc
  const startIdx=firstDay===0?6:firstDay-1;
  const days=[];for(let i=0;i<startIdx;i++)days.push(null);for(let i=1;i<=daysInMonth;i++)days.push(i);
  return(<div style={{position:"fixed",inset:0,background:T.overlay,backdropFilter:"blur(16px)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center",animation:"fadeIn .2s"}} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{background:T.surface,borderRadius:"18px 18px 0 0",width:"100%",maxWidth:500,maxHeight:"80vh",overflow:"auto",animation:"slideUp .35s cubic-bezier(.23,1,.32,1)",padding:"20px 22px 34px"}}>
      <div style={{width:36,height:4,borderRadius:2,background:T.borderLight,margin:"0 auto 16px"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <button onClick={prevM} style={{background:"none",border:"none",color:T.textMuted,fontSize:18,cursor:"pointer",padding:8}}>←</button>
        <h3 style={{fontFamily:F.serif,fontSize:20,color:T.text,fontWeight:400,margin:0}}>{monthNames[month.m]} {month.y}</h3>
        <button onClick={nextM} style={{background:"none",border:"none",color:T.textMuted,fontSize:18,cursor:"pointer",padding:8}}>→</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:8}}>
        {["Пн","Вт","Ср","Чт","Пт","Сб","Нд"].map(d=><div key={d} style={{textAlign:"center",padding:"4px 0",fontFamily:F.mono,fontSize:11,color:T.textDim,letterSpacing:"0.08em"}}>{d}</div>)}
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

// === WardrobeTab (with batch laundry) ===
function WardrobeTab({items,onDelete,onUpdate,weather,calendar,hideSeasonal,setHideSeasonal}){
  const T=useTheme(),toast=useToast();
  const[filter,setFilter]=useState("all");const[sort,setSort]=useState("newest");const[sel,setSel]=useState(null);const[search,setSearch]=useState("");const[ootdOff,setOotdOff]=useState(false);const[showCal,setShowCal]=useState(false);const[batchMode,setBatchMode]=useState(false);const[selected,setSelected]=useState(new Set());
  let displayItems=hideSeasonal?getSeasonalItems(items,true):items;
  let filtered=filter==="all"?displayItems:filter==="favorites"?displayItems.filter(i=>i.favorite):filter==="capsule"?displayItems.filter(i=>i.capsule):filter==="laundry"?displayItems.filter(i=>i.inLaundry):displayItems.filter(i=>i.category===filter);
  if(search){const q=search.toLowerCase();filtered=filtered.filter(i=>i.name.toLowerCase().includes(q)||i.brand?.toLowerCase().includes(q)||(i.tags||[]).some(t=>t.toLowerCase().includes(q)));}
  const sortFns={newest:(a,b)=>new Date(b.addedAt)-new Date(a.addedAt),most_worn:(a,b)=>(b.wearCount||0)-(a.wearCount||0),least_worn:(a,b)=>(a.wearCount||0)-(b.wearCount||0),name:(a,b)=>a.name.localeCompare(b.name),price:(a,b)=>(b.price||0)-(a.price||0)};
  filtered=[...filtered].sort(sortFns[sort]||sortFns.newest);
  const toggleFav=id=>{const itm=items.find(i=>i.id===id);if(itm){onUpdate(id,{favorite:!itm.favorite});toast(itm.favorite?"Премахнато от любими":"Добавено в любими ♥","success");}};
  const toggleSelect=id=>setSelected(p=>{const n=new Set(p);if(n.has(id))n.delete(id);else n.add(id);return n;});
  const batchLaundry=(toLaundry)=>{selected.forEach(id=>onUpdate(id,{inLaundry:toLaundry}));toast(toLaundry?selected.size+" в пералнята 🧺":selected.size+" обратно в гардероба","success");setSelected(new Set());setBatchMode(false);};
  const laundryCount=items.filter(i=>i.inLaundry).length;
  const handleItemClick=(item)=>{if(batchMode){toggleSelect(item.id);}else{setSel(item);}};
  return(<div style={{paddingBottom:90}}>
    <WeatherBar weather={weather}/>
    {!ootdOff&&<OOTDCard items={items} weather={weather} onDismiss={()=>setOotdOff(true)} calendar={calendar}/>}
    <div style={{padding:"14px 14px 0"}}>
      <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
        <button onClick={()=>setShowCal(true)} style={{padding:"8px 14px",borderRadius:20,border:"1px solid "+T.border,background:"transparent",fontFamily:F.sans,fontSize:11,color:T.textMuted,cursor:"pointer"}}>Календар</button>
        <button onClick={()=>setHideSeasonal(!hideSeasonal)} style={{padding:"8px 14px",borderRadius:20,border:hideSeasonal?"1px solid "+T.text:"1px solid "+T.border,background:hideSeasonal?T.glow:"transparent",fontFamily:F.sans,fontSize:11,color:hideSeasonal?T.text:T.textMuted,cursor:"pointer"}}>Сезонен</button>
        <button onClick={()=>{setBatchMode(!batchMode);setSelected(new Set());}} style={{padding:"8px 14px",borderRadius:20,border:batchMode?"1px solid "+T.text:"1px solid "+T.border,background:batchMode?T.glow:"transparent",fontFamily:F.sans,fontSize:11,color:batchMode?T.text:T.textMuted,cursor:"pointer"}}>Пералня</button>
      </div>
      {batchMode&&<div style={{display:"flex",gap:6,marginBottom:12,padding:"10px 14px",background:T.card,border:"1px solid "+T.borderLight,borderRadius:3}}>
        <span style={{fontFamily:F.sans,fontSize:11,color:T.textMuted,flex:1,alignSelf:"center"}}>{selected.size} избрани</span>
        <button onClick={()=>batchLaundry(true)} disabled={!selected.size} style={{padding:"8px 12px",borderRadius:20,border:"1px solid "+T.border,background:"transparent",fontFamily:F.sans,fontSize:10,color:T.textMuted,cursor:"pointer",opacity:selected.size?1:0.3}}>В пералня</button>
        <button onClick={()=>batchLaundry(false)} disabled={!selected.size} style={{padding:"8px 12px",borderRadius:20,border:"1px solid "+T.border,background:"transparent",fontFamily:F.sans,fontSize:10,color:T.textMuted,cursor:"pointer",opacity:selected.size?1:0.3}}>Чисти</button>
      </div>}
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Търси по име, марка, таг..." style={{width:"100%",padding:"12px 16px",borderRadius:2,border:"1px solid "+T.border,fontSize:12,fontFamily:F.sans,color:T.text,background:T.surface,boxSizing:"border-box",marginBottom:12}}/>
      <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:10}}>
        <Pill active={filter==="all"} onClick={()=>setFilter("all")}>Всички {displayItems.length}</Pill>
        <Pill active={filter==="favorites"} onClick={()=>setFilter("favorites")}>Любими</Pill>
        <Pill active={filter==="capsule"} onClick={()=>setFilter("capsule")}>Капсула</Pill>
        {laundryCount>0&&<Pill active={filter==="laundry"} onClick={()=>setFilter("laundry")}>Пералня {laundryCount}</Pill>}
        {CATEGORIES.map(cat=>{const cnt=displayItems.filter(i=>i.category===cat.id).length;if(!cnt)return null;return<Pill key={cat.id} active={filter===cat.id} onClick={()=>setFilter(cat.id)}>{cat.label} {cnt}</Pill>;})}
      </div>
      <div style={{display:"flex",gap:0,marginBottom:12,borderBottom:"1px solid "+T.border,paddingBottom:8}}>
        {[{id:"newest",l:"Скорошни"},{id:"most_worn",l:"Най-носени"},{id:"least_worn",l:"Най-малко"},{id:"price",l:"Цена"},{id:"name",l:"А-Я"}].map(s=><button key={s.id} onClick={()=>setSort(s.id)} style={{padding:"4px 8px",border:"none",background:"none",fontFamily:F.sans,fontSize:10,color:sort===s.id?T.textSoft:T.textDim,cursor:"pointer",borderBottom:sort===s.id?"1px solid "+T.textSoft:"1px solid transparent"}}>{s.l}</button>)}
      </div>
      {filtered.length===0?<EmptyState icon={items.length===0?"👕":"🔍"} title={items.length===0?"Гардеробът те чака":"Няма резултати"} sub={items.length===0?"НАТИСНИ ДОБАВИ ЗА НАЧАЛО":"ОПИТАЙ С ДРУГИ ФИЛТРИ"}/>:
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(152px,1fr))",gap:9}}>{filtered.map((item,i)=><div key={item.id} style={{position:"relative"}}>{batchMode&&<div style={{position:"absolute",top:6,right:6,zIndex:10,width:22,height:22,borderRadius:"50%",border:"2px solid "+(selected.has(item.id)?T.text:T.border),background:selected.has(item.id)?T.text:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>{selected.has(item.id)&&<span style={{color:T.bg,fontSize:12}}>✓</span>}</div>}<ItemCard item={item} idx={i} onClick={()=>handleItemClick(item)} onDoubleTap={batchMode?toggleSelect:toggleFav}/></div>)}</div>}
    </div>
    {sel&&<Modal item={sel} onClose={()=>setSel(null)} onDelete={onDelete} onUpdate={(id,upd)=>{if(id==="__duplicate__"){/* handled via add */}else{onUpdate(id,upd);setSel(p=>p?({...p,...upd}):p);}}}/>}
    {showCal&&<CalendarModal calendar={calendar} items={items} onClose={()=>setShowCal(false)}/>}
  </div>);
}

// === AddTab ===
function AddTab({onAdd,lastCat}){
  const T=useTheme(),toast=useToast();
  const[step,setStep]=useState("photo");const[img,setImg]=useState(null);const[name,setName]=useState("");const[cat,setCat]=useState(lastCat||"");const[colors,setColors]=useState([]);const[style,setStyle]=useState("");const[season,setSeason]=useState("");const[mat,setMat]=useState("");const[brand,setBrand]=useState("");const[price,setPrice]=useState("");const[tags,setTags]=useState([]);const[tagIn,setTagIn]=useState("");const vidRef=useRef(null);const strRef=useRef(null);const fileRef=useRef(null);const[cam,setCam]=useState(false);const[err,setErr]=useState(null);
  const startCam=async()=>{try{setErr(null);const s=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:"environment"},width:{ideal:1280},height:{ideal:960}}});strRef.current=s;setCam(true);requestAnimationFrame(()=>{requestAnimationFrame(()=>{if(vidRef.current&&strRef.current){vidRef.current.srcObject=strRef.current;vidRef.current.setAttribute("playsinline","true");vidRef.current.setAttribute("webkit-playsinline","true");vidRef.current.muted=true;vidRef.current.play().catch(()=>{});}});});}catch(e){setErr("Камерата не е налична. Провери Settings > Safari > Camera.");}};
  const stopCam=()=>{if(strRef.current){strRef.current.getTracks().forEach(t=>t.stop());strRef.current=null;}setCam(false);};
  const capture=async()=>{const vid=vidRef.current;if(!vid||!vid.videoWidth)return;const c=document.createElement("canvas");c.width=vid.videoWidth;c.height=vid.videoHeight;c.getContext("2d").drawImage(vid,0,0);const d=await compress(c.toDataURL("image/jpeg",0.85));setImg(d);stopCam();setStep("details");};
  const handleFile=async(e)=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=async(ev)=>{const d=await compress(ev.target.result);setImg(d);stopCam();setStep("details");};r.readAsDataURL(f);};
  const toggleColor=(h)=>setColors(p=>p.includes(h)?p.filter(c=>c!==h):p.length>=3?p:[...p,h]);
  const addTag=()=>{const t=tagIn.trim().toLowerCase();if(t&&!tags.includes(t)&&tags.length<5){setTags(p=>[...p,t]);setTagIn("");}};
  const canSave=name.trim()&&cat&&colors.length>0&&style&&season;
  const save=()=>{onAdd({id:Date.now().toString(),image:img,name:name.trim(),category:cat,colors,style,season,material:mat||null,brand:brand||null,price:parseFloat(price)||0,tags,wearCount:0,favorite:false,capsule:false,inLaundry:false,lastWorn:null,addedAt:new Date().toISOString()});toast("Добавено в гардероба ✓","success");setStep("photo");setImg(null);setName("");setCat("");setColors([]);setStyle("");setSeason("");setMat("");setBrand("");setPrice("");setTags([]);};
  useEffect(()=>()=>stopCam(),[]);
  const inputSt={width:"100%",padding:"12px 16px",borderRadius:2,border:"1px solid "+T.border,fontSize:13,fontFamily:F.sans,color:T.text,background:T.surface,boxSizing:"border-box"};
  const labelSt={fontFamily:F.mono,fontSize:10,color:T.textDim,letterSpacing:"0.14em",display:"block",marginBottom:7,textTransform:"uppercase"};
  if(step==="photo"){return(<div style={{padding:"24px 20px"}}><p style={{...labelSt,marginBottom:3}}>НОВА ДРЕХА</p><h2 style={{fontFamily:F.serif,fontSize:26,fontWeight:300,color:T.text,margin:"0 0 28px"}}>Добави в гардероба</h2>
    {err&&<div style={{border:"1px solid "+T.borderLight,borderRadius:2,padding:"10px 14px",marginBottom:14,fontFamily:F.sans,fontSize:12,color:T.textMuted}}>{err}</div>}
    {cam?(<div style={{borderRadius:3,overflow:"hidden"}}><video ref={vidRef} autoPlay playsInline muted onLoadedMetadata={e=>e.target.play().catch(()=>{})} style={{width:"100%",display:"block",background:"#000",minHeight:300,WebkitTransform:"translateZ(0)"}}/>
      <div style={{display:"flex",gap:16,justifyContent:"center",padding:"22px 0",background:T.bg}}>
        <button onClick={capture} style={{width:64,height:64,borderRadius:"50%",border:"2px solid "+T.text,background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:50,height:50,borderRadius:"50%",background:T.text}}/></button>
        <button onClick={stopCam} style={{width:40,height:40,borderRadius:"50%",border:"1px solid "+T.border,background:T.surface,cursor:"pointer",alignSelf:"center",fontSize:16,color:T.textMuted}}>×</button>
      </div></div>):(<div style={{display:"flex",flexDirection:"column",gap:10}}>
      <button onClick={startCam} style={{padding:"40px 20px",borderRadius:3,border:"1px dashed "+T.borderLight,background:"transparent",cursor:"pointer",textAlign:"center"}}><p style={{fontFamily:F.sans,fontSize:13,color:T.text,margin:"0 0 3px",fontWeight:500}}>Снимай с камера</p><p style={{fontFamily:F.mono,fontSize:10,color:T.textDim,margin:0,letterSpacing:"0.08em"}}>НАПРАВИ СНИМКА</p></button>
      <button onClick={()=>fileRef.current?.click()} style={{padding:"22px 20px",borderRadius:3,border:"1px dashed "+T.borderLight,background:"transparent",cursor:"pointer",textAlign:"center"}}><p style={{fontFamily:F.sans,fontSize:13,color:T.text,margin:"0 0 2px",fontWeight:500}}>Качи от галерия</p><p style={{fontFamily:F.mono,fontSize:10,color:T.textDim,margin:0,letterSpacing:"0.06em"}}>ИЗБЕРИ ФАЙЛ</p></button>
      <div style={{display:"flex",alignItems:"center",gap:14,margin:"4px 0"}}><div style={{flex:1,height:1,background:T.border}}/><span style={{fontFamily:F.mono,fontSize:10,color:T.textDim}}>ИЛИ</span><div style={{flex:1,height:1,background:T.border}}/></div>
      <button onClick={()=>{setImg(null);setStep("details");}} style={{padding:"12px",borderRadius:2,border:"1px solid "+T.border,background:"transparent",fontFamily:F.mono,fontSize:11,color:T.textDim,letterSpacing:"0.1em",cursor:"pointer",textAlign:"center"}}>БЕЗ СНИМКА</button>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{display:"none"}}/>
    </div>)}</div>);}
  return(<div style={{padding:"24px 20px 100px"}}>
    <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:22}}><button onClick={()=>{setStep("photo");setImg(null);}} style={{background:"none",border:"none",cursor:"pointer",padding:0,color:T.textMuted,fontSize:20}}>←</button><div><p style={{...labelSt,margin:"0 0 1px"}}>ДЕТАЙЛИ</p><h2 style={{fontFamily:F.serif,fontSize:22,fontWeight:300,color:T.text,margin:0}}>Опиши дрехата</h2></div></div>
    {img&&<img src={img} alt="" style={{width:"100%",height:200,objectFit:"cover",borderRadius:3,marginBottom:22,opacity:T.imgOpacity}}/>}
    <div style={{marginBottom:20}}><label style={labelSt}>ИМЕ *</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="напр. Черна Nike Dri-FIT тениска" style={inputSt}/></div>
    <div style={{marginBottom:20}}><label style={labelSt}>КАТЕГОРИЯ *</label><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:5}}>{CATEGORIES.map(c=><button key={c.id} onClick={()=>setCat(c.id)} style={{padding:"13px 5px",borderRadius:2,textAlign:"center",cursor:"pointer",border:cat===c.id?"1px solid "+T.text:"1px solid "+T.border,background:cat===c.id?T.glow:"transparent"}}><div style={{fontFamily:F.sans,fontSize:10,fontWeight:600,color:cat===c.id?T.text:T.textMuted,marginBottom:1}}>{c.label}</div><div style={{fontFamily:F.mono,fontSize:11,color:T.textDim}}>{c.sub}</div></button>)}</div></div>
    <div style={{marginBottom:20}}><label style={labelSt}>ЦВЕТОВЕ * — ДО 3</label><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{COLORS.map(([hex])=><button key={hex} onClick={()=>toggleColor(hex)} style={{width:28,height:28,borderRadius:2,background:hex,cursor:"pointer",padding:0,border:colors.includes(hex)?"2px solid "+T.text:hex==="#FFFFFF"?"1px solid "+T.border:"1px solid transparent",transform:colors.includes(hex)?"scale(1.15)":"scale(1)",transition:"all 0.15s"}}/>)}</div>{colors.length>0&&<div style={{display:"flex",gap:4,marginTop:7}}>{colors.map(c=><span key={c} style={{fontFamily:F.mono,fontSize:11,border:"1px solid "+T.border,padding:"2px 8px",borderRadius:2,color:T.textMuted,letterSpacing:"0.06em",textTransform:"uppercase"}}>{getColorName(c)}</span>)}</div>}</div>
    <div style={{marginBottom:20}}><label style={labelSt}>СТИЛ *</label><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{STYLES.map((s,i)=><Pill key={i} active={style===STYLE_IDS[i]} onClick={()=>setStyle(STYLE_IDS[i])} small>{s}</Pill>)}</div></div>
    <div style={{marginBottom:20}}><label style={labelSt}>СЕЗОН *</label><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{SEASONS.map(s=><Pill key={s.id} active={season===s.id} onClick={()=>setSeason(s.id)} small>{s.label}</Pill>)}</div></div>
    <div style={{marginBottom:20}}><label style={labelSt}>МАРКА</label><div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:6}}>{BRANDS.map(b=><button key={b} onClick={()=>setBrand(brand===b?"":b)} style={{padding:"5px 10px",borderRadius:2,border:brand===b?"1px solid "+T.text:"1px solid "+T.border,background:brand===b?T.glow:"transparent",fontFamily:F.mono,fontSize:10,color:brand===b?T.text:T.textDim,cursor:"pointer"}}>{b}</button>)}</div><input value={brand} onChange={e=>setBrand(e.target.value)} placeholder="Или напиши марка" style={{...inputSt,fontSize:12}}/></div>
    <div style={{marginBottom:20}}><label style={labelSt}>МАТЕРИАЛ</label><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{MATERIALS.map(m=><button key={m} onClick={()=>setMat(mat===m?"":m)} style={{padding:"5px 10px",borderRadius:2,border:mat===m?"1px solid "+T.text:"1px solid "+T.border,background:mat===m?T.glow:"transparent",fontFamily:F.mono,fontSize:10,color:mat===m?T.text:T.textDim,cursor:"pointer"}}>{m}</button>)}</div></div>
    <div style={{display:"flex",gap:10,marginBottom:20}}><div style={{flex:1}}><label style={labelSt}>ЦЕНА</label><input type="number" value={price} onChange={e=>setPrice(e.target.value)} placeholder="0" style={{...inputSt,fontSize:12}}/></div><div style={{flex:2}}><label style={labelSt}>ТАГОВЕ — ДО 5</label><div style={{display:"flex",gap:6}}><input value={tagIn} onChange={e=>setTagIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTag()} placeholder="#лято" style={{...inputSt,fontSize:12,flex:1}}/><button onClick={addTag} style={{padding:"0 14px",borderRadius:2,border:"1px solid "+T.border,background:"transparent",color:T.textMuted,cursor:"pointer",fontFamily:F.mono,fontSize:10}}>+</button></div>{tags.length>0&&<div style={{display:"flex",gap:4,marginTop:6,flexWrap:"wrap"}}>{tags.map(t=><span key={t} onClick={()=>setTags(p=>p.filter(x=>x!==t))} style={{fontFamily:F.mono,fontSize:10,color:T.textMuted,background:T.card,padding:"3px 8px",borderRadius:2,cursor:"pointer"}}>#{t} ×</span>)}</div>}</div></div>
    <button onClick={save} disabled={!canSave} style={{width:"100%",padding:15,borderRadius:2,border:"none",background:canSave?T.text:T.border,color:canSave?T.bg:T.textDim,fontFamily:F.sans,fontSize:11,fontWeight:600,cursor:canSave?"pointer":"not-allowed",letterSpacing:"0.12em",textTransform:"uppercase"}}>Добави в гардероба</button>
  </div>);
}

// === OutfitsTab ===
function OutfitsTab({items,onSave,weather,blacklist,addBlacklist}){
  const T=useTheme(),toast=useToast();
  const[occ,setOcc]=useState(null);const[results,setResults]=useState([]);const[idx,setIdx]=useState(0);const[anim,setAnim]=useState(false);const[swipeX,setSwipeX]=useState(0);const touchStart=useRef(null);
  const gen=(id)=>{setOcc(id);setAnim(true);setTimeout(()=>{const avail=items.filter(i=>!i.inLaundry);setResults(generateCombos(avail,id,8,weather,blacklist));setIdx(0);setAnim(false);},500);};
  const next=()=>setIdx(p=>(p+1)%results.length);const prev=()=>setIdx(p=>p===0?results.length-1:p-1);
  const surprise=()=>{const ids=OCCASIONS.map(o=>o.id);gen(ids[Math.floor(Math.random()*ids.length)]);};
  const onTS=e=>{touchStart.current=e.touches[0].clientX;};const onTM=e=>{if(touchStart.current!==null)setSwipeX(e.touches[0].clientX-touchStart.current);};const onTE=()=>{if(Math.abs(swipeX)>60){swipeX>0?prev():next();}setSwipeX(0);touchStart.current=null;};
  const shareOutfit=async(cur)=>{const text="DRESHNIK.bg Визия\n\n"+cur.items.map(i=>i.name).join(" + ")+"\n\n"+getExplanation(cur,occ);if(navigator.share){try{await navigator.share({title:"DRESHNIK.bg",text});toast("Споделено ✓","success");}catch(e){console.warn(e);}}else{await navigator.clipboard?.writeText(text);toast("Копирано ✓","success");}};
  const cur=results[idx];
  return(<div style={{padding:"24px 20px 100px"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}><div><p style={{fontFamily:F.mono,fontSize:10,color:T.textDim,letterSpacing:"0.16em",marginBottom:3}}>AI СТИЛИСТ</p><h2 style={{fontFamily:F.serif,fontSize:26,fontWeight:300,color:T.text,margin:0}}>Генерирай визия</h2></div>
    {items.length>=2&&<button onClick={surprise} style={{padding:"8px 14px",borderRadius:2,border:"1px solid "+T.borderLight,background:"transparent",cursor:"pointer",fontFamily:F.mono,fontSize:11,color:T.textMuted,letterSpacing:"0.06em"}}>🎲 ИЗНЕНАДА</button>}</div>
    {weather&&<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18,padding:"10px 14px",border:"1px solid "+T.border,borderRadius:2}}><span style={{fontSize:16}}>{weather.icon}</span><span style={{fontFamily:F.sans,fontSize:11,color:T.textMuted}}>{weather.temp}° {weather.desc}{weather.rain?" — режим за дъжд":""}</span></div>}
    {items.length<2&&<EmptyState icon="✦" title="Добави поне 2 дрехи" sub="ЗА ДА ГЕНЕРИРАШ ВИЗИИ"/>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5,marginBottom:24}}>{OCCASIONS.map(o=><button key={o.id} onClick={()=>gen(o.id)} disabled={items.length<2} style={{padding:"14px 3px",borderRadius:2,textAlign:"center",border:occ===o.id?"1px solid "+T.text:"1px solid "+T.border,background:occ===o.id?T.glow:"transparent",cursor:items.length<2?"not-allowed":"pointer",opacity:items.length<2?0.3:1}}><div style={{fontFamily:F.sans,fontSize:10,fontWeight:600,color:occ===o.id?T.text:T.textMuted}}>{o.label}</div></button>)}</div>
    {anim&&<div style={{textAlign:"center",padding:44}}><p style={{fontFamily:F.mono,fontSize:11,color:T.textDim,letterSpacing:"0.12em",animation:"pulse 1s ease-in-out infinite"}}>АНАЛИЗИРАМ КОМБИНАЦИИ</p></div>}
    {!anim&&cur&&<div style={{animation:"fadeIn .35s ease"}} onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={onTE}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><h3 style={{fontFamily:F.serif,fontSize:20,fontWeight:300,color:T.text,margin:0}}>Визия {idx+1}/{results.length}</h3><div style={{display:"flex",alignItems:"center",gap:4}}>{results.map((_,i)=><div key={i} style={{width:i===idx?16:6,height:3,borderRadius:2,background:i===idx?T.text:T.border,transition:"all 0.3s"}}/>)}</div></div>
      <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:12,marginBottom:14,transform:"translateX("+(swipeX*0.3)+"px)",transition:swipeX?"none":"transform 0.3s"}}>{cur.items.map((item,i)=><div key={item.id} style={{minWidth:135,background:T.card,borderRadius:3,overflow:"hidden",border:"1px solid "+T.border,flexShrink:0,boxShadow:T.shadow,animation:"fadeInUp "+(0.15+i*0.08)+"s ease both"}}>{item.image?<img src={item.image} alt="" style={{width:135,height:165,objectFit:"cover",opacity:T.imgOpacity}}/>:<div style={{width:135,height:165,background:T.surface,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:F.serif,fontSize:38,color:T.border}}>{CAT_MAP[item.category]?.label?.[0]}</span></div>}<div style={{padding:"9px 11px"}}><p style={{fontSize:10,fontWeight:600,color:T.text,margin:0,fontFamily:F.sans,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</p><div style={{display:"flex",gap:2,marginTop:4}}>{item.colors?.slice(0,3).map((c,j)=><div key={j} style={{width:8,height:8,borderRadius:1,background:c}}/>)}</div></div></div>)}</div>
      <ColorBar items={cur.items}/>
      <div style={{border:"1px solid "+T.border,borderRadius:2,padding:16,margin:"14px 0"}}><p style={{fontSize:12,color:T.textSoft,margin:"0 0 10px",lineHeight:1.7,fontFamily:F.sans}}>{getExplanation(cur,occ)}</p><div style={{height:1,background:T.border,margin:"0 0 10px"}}/><p style={{fontFamily:F.sans,fontSize:11,color:T.textDim,margin:0,lineHeight:1.6,fontStyle:"italic"}}>{getTip(occ)}</p></div>
      <p style={{fontFamily:F.mono,fontSize:10,color:T.textDim,textAlign:"center",letterSpacing:"0.1em",marginBottom:12}}>ПЛЪЗНИ ЗА СЛЕДВАЩА</p>
      <div style={{display:"flex",gap:6}}><button onClick={next} style={{flex:1,padding:14,borderRadius:2,border:"1px solid "+T.border,background:"transparent",fontFamily:F.sans,fontSize:10,fontWeight:500,color:T.textMuted,cursor:"pointer",letterSpacing:"0.08em",textTransform:"uppercase"}}>Следваща</button>
      <button onClick={()=>{onSave({id:Date.now().toString(),occasion:OCCASIONS.find(x=>x.id===occ)?.label||occ,itemIds:cur.items.map(i=>i.id),reasoning:getExplanation(cur,occ),tips:getTip(occ),score:cur.score,savedAt:new Date().toISOString()});toast("Визия запазена ✓","success");}} style={{flex:1,padding:14,borderRadius:2,border:"none",background:T.text,color:T.bg,fontFamily:F.sans,fontSize:10,fontWeight:600,cursor:"pointer",letterSpacing:"0.1em",textTransform:"uppercase"}}>Запази</button></div>
      <div style={{display:"flex",gap:6,marginTop:8}}><button onClick={()=>shareOutfit(cur)} style={{flex:1,padding:12,borderRadius:2,border:"1px solid "+T.border,background:"transparent",fontFamily:F.mono,fontSize:11,color:T.textMuted,cursor:"pointer",letterSpacing:"0.06em"}}>СПОДЕЛИ</button>
      <button onClick={()=>{const key=cur.items.map(i=>i.id).sort().join(",");addBlacklist(key);next();toast("Комбинацията няма да се предлага","info");}} style={{flex:1,padding:12,borderRadius:2,border:"1px solid "+T.danger,background:"transparent",fontFamily:F.mono,fontSize:11,color:T.dangerText,cursor:"pointer",letterSpacing:"0.06em"}}>НЕ ПРЕДЛАГАЙ</button></div>
    </div>}
  </div>);
}

// === SavedTab ===
function SavedTab({saved,items,onDelete}){
  const T=useTheme(),confirm=useConfirm();
  const[sortBy,setSortBy]=useState("date");
  const sorted=useMemo(()=>{const s=[...saved];if(sortBy==="score")s.sort((a,b)=>(b.score||0)-(a.score||0));else if(sortBy==="occasion")s.sort((a,b)=>(a.occasion||"").localeCompare(b.occasion||""));return s;},[saved,sortBy]);
  if(!saved.length)return(<EmptyState icon="♡" title="Няма запазени визии" sub="ЗАПАЗИ ОТ ТАБА СТИЛ"/>);
  return(<div style={{padding:"24px 20px 100px"}}><p style={{fontFamily:F.mono,fontSize:10,color:T.textDim,letterSpacing:"0.16em",marginBottom:3}}>КОЛЕКЦИЯ</p><h2 style={{fontFamily:F.serif,fontSize:26,fontWeight:300,color:T.text,margin:"0 0 14px"}}>Запазени визии</h2>
    <div style={{display:"flex",gap:6,marginBottom:16}}>{[{id:"date",l:"По дата"},{id:"score",l:"По оценка"},{id:"occasion",l:"По повод"}].map(s=><Pill key={s.id} active={sortBy===s.id} onClick={()=>setSortBy(s.id)} small>{s.l}</Pill>)}</div>
    <div style={{display:"flex",flexDirection:"column",gap:11}}>{sorted.map(outfit=>{const oi=outfit.itemIds.map(id=>items.find(i=>i.id===id)).filter(Boolean);return(<div key={outfit.id} style={{background:T.card,borderRadius:3,border:"1px solid "+T.border,overflow:"hidden",boxShadow:T.shadow}}>
      <div style={{display:"flex",gap:1,height:100}}>{oi.slice(0,4).map(item=><div key={item.id} style={{flex:1}}>{item.image?<img src={item.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:T.imgOpacity}}/>:<div style={{width:"100%",height:"100%",background:T.surface,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:F.serif,fontSize:22,color:T.border}}>{CAT_MAP[item.category]?.label?.[0]}</span></div>}</div>)}</div>
      <ColorBar items={oi}/><div style={{padding:"12px 14px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontFamily:F.mono,fontSize:10,color:T.textMuted,letterSpacing:"0.1em",textTransform:"uppercase",border:"1px solid "+T.border,padding:"3px 9px",borderRadius:2}}>{outfit.occasion}</span><button onClick={()=>confirm("Изтрий тази визия?",()=>onDelete(outfit.id))} style={{background:"none",border:"none",cursor:"pointer",color:T.dangerText,fontSize:14,padding:4}}>×</button></div><p style={{fontSize:12,color:T.textMuted,margin:0,lineHeight:1.6,fontFamily:F.sans}}>{outfit.reasoning}</p></div>
    </div>);})}</div></div>);
}

// === InsightsTab (enhanced) ===
function InsightsTab({items,saved}){
  const T=useTheme(),cur=useCurrency();
  const totalWears=items.reduce((a,i)=>a+(i.wearCount||0),0);const totalValue=items.reduce((a,i)=>a+(i.price||0),0);const avgCPW=totalWears>0?(totalValue/totalWears).toFixed(0):0;
  const mostWorn=[...items].sort((a,b)=>(b.wearCount||0)-(a.wearCount||0)).slice(0,3);const neverWorn=items.filter(i=>!i.wearCount);const capsuleItems=items.filter(i=>i.capsule);const laundryItems=items.filter(i=>i.inLaundry);
  const catBreakdown=CATEGORIES.map(c=>({...c,count:items.filter(i=>i.category===c.id).length,value:items.filter(i=>i.category===c.id).reduce((a,i)=>a+(i.price||0),0)})).filter(c=>c.count>0);
  const styleBreakdown=STYLES.map((s,i)=>({label:s,id:STYLE_IDS[i],count:items.filter(it=>it.style===STYLE_IDS[i]).length})).filter(s=>s.count>0).sort((a,b)=>b.count-a.count);
  const colorFreq={};items.forEach(i=>(i.colors||[]).forEach(c=>{colorFreq[c]=(colorFreq[c]||0)+1;}));const topColors=Object.entries(colorFreq).sort((a,b)=>b[1]-a[1]).slice(0,10);const maxCat=Math.max(...catBreakdown.map(c=>c.count),1);
  const withCPW=items.filter(i=>i.price>0&&i.wearCount>0).map(i=>({...i,cpw:(i.price/i.wearCount).toFixed(0)})).sort((a,b)=>a.cpw-b.cpw);const bestCPW=withCPW.slice(0,3);
  // Achievements
  const achievements=[
    {icon:"👕",name:"Първи стъпки",desc:"Добави 10 дрехи",done:items.length>=10,progress:Math.min(items.length,10)+"/10"},
    {icon:"✦",name:"Стилист",desc:"Запази 10 визии",done:saved.length>=10,progress:Math.min(saved.length,10)+"/10"},
    {icon:"🔥",name:"Гардеробмания",desc:"50 общо носения",done:totalWears>=50,progress:Math.min(totalWears,50)+"/50"},
    {icon:"💎",name:"Капсула",desc:"Маркирай 5 капсулни парчета",done:capsuleItems.length>=5,progress:Math.min(capsuleItems.length,5)+"/5"},
    {icon:"🎨",name:"Колорист",desc:"10+ различни цвята",done:Object.keys(colorFreq).length>=10,progress:Object.keys(colorFreq).length+"/10"},
    {icon:"📸",name:"Фотограф",desc:"Добави снимки на 20 дрехи",done:items.filter(i=>i.image).length>=20,progress:items.filter(i=>i.image).length+"/20"},
  ];
  if(items.length===0)return(<EmptyState icon="◎" title="Добави дрехи за анализ" sub="СТАТИСТИКАТА ЩЕ СЕ ПОЯВИ ТУК"/>);
  const Section=({title,children})=>(<div style={{background:T.card,border:"1px solid "+T.border,borderRadius:2,padding:16,marginBottom:14,boxShadow:T.shadow}}><p style={{fontFamily:F.mono,fontSize:10,color:T.textDim,letterSpacing:"0.12em",margin:"0 0 12px"}}>{title}</p>{children}</div>);
  return(<div style={{padding:"24px 20px 100px"}}><p style={{fontFamily:F.mono,fontSize:10,color:T.textDim,letterSpacing:"0.16em",marginBottom:3}}>АНАЛИЗ НА ГАРДЕРОБА</p><h2 style={{fontFamily:F.serif,fontSize:26,fontWeight:300,color:T.text,margin:"0 0 22px"}}>Статистика</h2>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:18}}>{[{n:items.length,l:"ДРЕХИ"},{n:totalWears,l:"НОСЕНИЯ"},{n:saved.length,l:"ВИЗИИ"},{n:totalValue>0?totalValue+cur:"—",l:"СТОЙНОСТ"}].map((d,i)=><div key={i} style={{background:T.card,border:"1px solid "+T.border,borderRadius:2,padding:"16px 8px",textAlign:"center",boxShadow:T.shadow}}><p style={{fontFamily:F.serif,fontSize:24,color:T.text,margin:"0 0 2px",fontWeight:300}}>{d.n}</p><p style={{fontFamily:F.mono,fontSize:11,color:T.textDim,letterSpacing:"0.1em",margin:0}}>{d.l}</p></div>)}</div>
    {/* Achievements */}
    <Section title="🏆 ПОСТИЖЕНИЯ">{achievements.map((a,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<achievements.length-1?"1px solid "+T.border:"none",opacity:a.done?1:0.4}}><span style={{fontSize:18}}>{a.icon}</span><div style={{flex:1}}><p style={{fontFamily:F.sans,fontSize:11,color:T.text,margin:0}}>{a.name}</p><p style={{fontFamily:F.mono,fontSize:10,color:T.textDim,margin:"2px 0 0"}}>{a.desc}</p></div><span style={{fontFamily:F.mono,fontSize:11,color:a.done?"#88CC88":T.textDim}}>{a.done?"✓":a.progress}</span></div>)}</Section>
    {totalValue>0&&<Section title="РАЗХОДИ ПО КАТЕГОРИЯ">{catBreakdown.filter(c=>c.value>0).map(c=><div key={c.id} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontFamily:F.sans,fontSize:11,color:T.textSoft}}>{c.label}</span><span style={{fontFamily:F.mono,fontSize:11,color:T.textDim}}>{c.value}{cur} ({c.count})</span></div><div style={{height:3,background:T.border,borderRadius:2,overflow:"hidden"}}><div style={{width:(c.value/totalValue*100)+"%",height:"100%",background:T.text,borderRadius:2}}/></div></div>)}<div style={{marginTop:10,paddingTop:10,borderTop:"1px solid "+T.border}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontFamily:F.mono,fontSize:11,color:T.textMuted}}>СР. ЦЕНА/НОСЕНЕ</span><span style={{fontFamily:F.serif,fontSize:18,color:T.text}}>{avgCPW} {cur}</span></div></div></Section>}
    {bestCPW.length>0&&<Section title="НАЙ-ДОБРА ЦЕНА/НОСЕНЕ">{bestCPW.map((item,i)=><div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderBottom:i<bestCPW.length-1?"1px solid "+T.border:"none"}}>{item.image?<img src={item.image} alt="" style={{width:28,height:28,borderRadius:2,objectFit:"cover"}}/>:<div style={{width:28,height:28,borderRadius:2,background:T.surface}}/>}<span style={{fontFamily:F.sans,fontSize:11,color:T.text,flex:1}}>{item.name}</span><span style={{fontFamily:F.mono,fontSize:11,color:T.textDim}}>{item.cpw}{cur}/носене</span></div>)}</Section>}
    <Section title="КАТЕГОРИИ">{catBreakdown.map(c=><div key={c.id} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontFamily:F.sans,fontSize:11,color:T.textSoft}}>{c.label}</span><span style={{fontFamily:F.mono,fontSize:11,color:T.textDim}}>{c.count}</span></div><div style={{height:3,background:T.border,borderRadius:2,overflow:"hidden"}}><div style={{width:(c.count/maxCat*100)+"%",height:"100%",background:T.text,borderRadius:2}}/></div></div>)}</Section>
    {topColors.length>0&&<Section title="ЦВЕТОВА ПАЛИТРА"><div style={{display:"flex",gap:3,marginBottom:10,height:28}}>{topColors.map(([hex],i)=><div key={i} style={{flex:1,background:hex,borderRadius:2,border:hex==="#FFFFFF"?"1px solid "+T.border:"none"}}/>)}</div><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{topColors.map(([hex,count])=><span key={hex} style={{fontFamily:F.mono,fontSize:11,color:T.textDim}}>{getColorName(hex)} ×{count}</span>)}</div></Section>}
    {styleBreakdown.length>0&&<Section title="СТИЛ ДНК"><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{styleBreakdown.map(s=><div key={s.id} style={{border:"1px solid "+T.border,padding:"5px 10px",borderRadius:2,display:"flex",alignItems:"center",gap:6}}><span style={{fontFamily:F.sans,fontSize:11,color:T.textSoft}}>{s.label}</span><span style={{fontFamily:F.mono,fontSize:11,color:T.textDim}}>{s.count}</span></div>)}</div></Section>}
    {mostWorn.length>0&&mostWorn[0].wearCount>0&&<Section title="НАЙ-НОСЕНИ">{mostWorn.filter(i=>i.wearCount>0).map((item,i)=><div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:i<2?"1px solid "+T.border:"none"}}><span style={{fontFamily:F.mono,fontSize:16,color:T.textDim,width:20,textAlign:"right"}}>{i+1}</span>{item.image?<img src={item.image} alt="" style={{width:32,height:32,borderRadius:2,objectFit:"cover",opacity:T.imgOpacity}}/>:<div style={{width:32,height:32,borderRadius:2,background:T.surface}}/>}<div style={{flex:1}}><p style={{fontFamily:F.sans,fontSize:11,color:T.text,margin:0}}>{item.name}</p></div><span style={{fontFamily:F.mono,fontSize:10,color:T.textDim}}>{item.wearCount}×</span></div>)}</Section>}
    {laundryItems.length>0&&<Section title={"В ПЕРАЛНЯ — "+laundryItems.length}><div style={{display:"flex",gap:4,overflowX:"auto"}}>{laundryItems.map(item=><div key={item.id} style={{width:44,height:44,borderRadius:2,overflow:"hidden",flexShrink:0,border:"1px solid "+T.border,opacity:0.5}}>{item.image?<img src={item.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{width:"100%",height:"100%",background:T.surface}}/>}</div>)}</div></Section>}
    {capsuleItems.length>0&&<div style={{background:T.card,border:"1px solid #332200",borderRadius:2,padding:16,marginBottom:14,boxShadow:T.shadow}}><p style={{fontFamily:F.mono,fontSize:10,color:"#998800",letterSpacing:"0.12em",margin:"0 0 10px"}}>КАПСУЛА — {capsuleItems.length} ПАРЧЕТА</p><div style={{display:"flex",gap:4,overflowX:"auto"}}>{capsuleItems.map(item=><div key={item.id} style={{width:44,height:44,borderRadius:2,overflow:"hidden",flexShrink:0,border:"1px solid "+T.border}}>{item.image?<img src={item.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:T.imgOpacity}}/>:<div style={{width:"100%",height:"100%",background:T.surface}}/>}</div>)}</div></div>}
    {neverWorn.length>0&&<Section title={"НЕНОСЕНИ — "+neverWorn.length}><p style={{fontFamily:F.sans,fontSize:11,color:T.textMuted,margin:"0 0 8px"}}>Чакат да бъдат стилизирани</p><div style={{display:"flex",gap:3,overflowX:"auto"}}>{neverWorn.slice(0,8).map(item=><div key={item.id} style={{width:40,height:40,borderRadius:2,overflow:"hidden",flexShrink:0,border:"1px solid "+T.border}}>{item.image?<img src={item.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:0.65}}/>:<div style={{width:"100%",height:"100%",background:T.surface}}/>}</div>)}{neverWorn.length>8&&<div style={{width:40,height:40,borderRadius:2,border:"1px solid "+T.border,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontFamily:F.mono,fontSize:11,color:T.textDim}}>+{neverWorn.length-8}</span></div>}</div></Section>}
  </div>);
}

// === Auth Screen ===
function AuthScreen(){
  const T=useTheme();const{loginEmail,registerEmail,loginGoogle,resetPassword,error,setError}=useAuth();
  const[mode,setMode]=useState("login");const[email,setEmail]=useState("");const[pass,setPass]=useState("");const[name,setName]=useState("");const[busy,setBusy]=useState(false);const[resetSent,setResetSent]=useState(false);
  const inputSt={width:"100%",padding:"14px 16px",borderRadius:3,border:"1px solid "+T.border,fontSize:14,fontFamily:F.sans,color:T.text,background:T.surface,boxSizing:"border-box",marginBottom:12};
  const submit=async()=>{setBusy(true);setError(null);try{if(mode==="register")await registerEmail(email,pass,name);else if(mode==="reset"){await resetPassword(email);setResetSent(true);}else await loginEmail(email,pass);}catch(e){console.warn(e);}finally{setBusy(false);}};
  return(<div style={{minHeight:"100dvh",background:T.bg,display:"flex",flexDirection:"column",justifyContent:"center",padding:"0 28px"}}>
    <div style={{marginBottom:44}}><Logo size={32}/><p style={{fontFamily:F.sans,fontSize:14,color:T.textMuted,margin:"8px 0 0"}}>{mode==="login"?"Добре дошъл обратно":mode==="register"?"Създай своя гардероб":"Възстанови парола"}</p></div>
    {error&&<div style={{padding:"12px 16px",borderRadius:3,border:"1px solid "+T.danger,marginBottom:16,fontFamily:F.sans,fontSize:12,color:T.dangerText}}>{error}</div>}
    {resetSent&&<div style={{padding:"12px 16px",borderRadius:3,border:"1px solid "+T.border,marginBottom:16,fontFamily:F.sans,fontSize:12,color:T.textSoft}}>Изпратен е имейл за възстановяване.</div>}
    {mode==="register"&&<input value={name} onChange={e=>setName(e.target.value)} placeholder="Твоето име" style={inputSt}/>}
    {mode!=="reset"||!resetSent?<>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Имейл" type="email" autoComplete="email" style={inputSt}/>
      {mode!=="reset"&&<input value={pass} onChange={e=>setPass(e.target.value)} placeholder="Парола" type="password" autoComplete={mode==="register"?"new-password":"current-password"} style={inputSt}/>}
      <button onClick={submit} disabled={busy||!email||(mode!=="reset"&&!pass)} style={{width:"100%",padding:15,borderRadius:3,border:"none",background:T.text,color:T.bg,fontFamily:F.sans,fontSize:12,fontWeight:600,cursor:"pointer",letterSpacing:"0.1em",textTransform:"uppercase",opacity:busy?0.5:1,marginBottom:12}}>{busy?"...":(mode==="login"?"Влез":mode==="register"?"Създай акаунт":"Изпрати линк")}</button>
    </>:null}
    {mode!=="reset"&&<><div style={{display:"flex",alignItems:"center",gap:14,margin:"8px 0 20px"}}><div style={{flex:1,height:1,background:T.border}}/><span style={{fontFamily:F.mono,fontSize:10,color:T.textDim}}>ИЛИ</span><div style={{flex:1,height:1,background:T.border}}/></div>
    <button onClick={async()=>{setBusy(true);try{await loginGoogle();}catch(e){console.warn(e);}finally{setBusy(false);}}} style={{width:"100%",padding:14,borderRadius:3,border:"1px solid "+T.border,background:"transparent",fontFamily:F.sans,fontSize:12,fontWeight:500,color:T.text,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:16}}>
      <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
      Продължи с Google
    </button></>}
    <div style={{display:"flex",justifyContent:"center",gap:16,marginTop:8}}>
      {mode==="login"&&<><button onClick={()=>{setMode("register");setError(null);}} style={{background:"none",border:"none",color:T.textMuted,fontFamily:F.mono,fontSize:11,cursor:"pointer",letterSpacing:"0.06em"}}>СЪЗДАЙ АКАУНТ</button><button onClick={()=>{setMode("reset");setError(null);}} style={{background:"none",border:"none",color:T.textDim,fontFamily:F.mono,fontSize:11,cursor:"pointer",letterSpacing:"0.06em"}}>ЗАБРАВЕНА ПАРОЛА</button></>}
      {mode!=="login"&&<button onClick={()=>{setMode("login");setError(null);setResetSent(false);}} style={{background:"none",border:"none",color:T.textMuted,fontFamily:F.mono,fontSize:11,cursor:"pointer",letterSpacing:"0.06em"}}>ОБРАТНО КЪМ ВХОД</button>}
    </div>
  </div>);
}

// === Profile Tab ===
function ProfileTab(){
  const T=useTheme(),toast=useToast(),confirm=useConfirm();
  const{user,profile,settings,saveProfile,saveSettings,uploadPhoto,logout,deleteAccount,exportData}=useAuth();
  const[editName,setEditName]=useState(false);const[nameVal,setNameVal]=useState(profile.displayName);
  const[editBio,setEditBio]=useState(false);const[bioVal,setBioVal]=useState(profile.bio||"");
  const[editField,setEditField]=useState(null);const[fieldVal,setFieldVal]=useState("");
  const[showDelete,setShowDelete]=useState(false);const[delPass,setDelPass]=useState("");const[busy,setBusy]=useState(false);
  const fileRef=useRef(null);
  const inputSt={width:"100%",padding:"12px 16px",borderRadius:2,border:"1px solid "+T.border,fontSize:13,fontFamily:F.sans,color:T.text,background:T.surface,boxSizing:"border-box"};
  const Section=({title,children})=>(<div style={{background:T.card,border:"1px solid "+T.border,borderRadius:3,padding:18,marginBottom:14,boxShadow:T.shadow}}><p style={{fontFamily:F.mono,fontSize:10,color:T.textDim,letterSpacing:"0.12em",margin:"0 0 14px"}}>{title}</p>{children}</div>);
  const Row=({label,value,field})=>(<div onClick={()=>{setEditField(field);setFieldVal(profile[field]||"");}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:"1px solid "+T.border,cursor:"pointer"}}><span style={{fontFamily:F.sans,fontSize:12,color:T.text}}>{label}</span>{editField===field?<div style={{display:"flex",gap:4}} onClick={e=>e.stopPropagation()}><input value={fieldVal} onChange={e=>setFieldVal(e.target.value)} style={{...inputSt,width:100,padding:"6px 10px",fontSize:11,marginBottom:0}} autoFocus onKeyDown={e=>{if(e.key==="Enter"){saveProfile({[field]:fieldVal});setEditField(null);toast("Запазено","success");}}} /><button onClick={()=>{saveProfile({[field]:fieldVal});setEditField(null);toast("Запазено","success");}} style={{padding:"0 10px",borderRadius:2,border:"1px solid "+T.text,background:"transparent",color:T.text,fontFamily:F.mono,fontSize:10,cursor:"pointer"}}>OK</button></div>:<span style={{fontFamily:F.mono,fontSize:11,color:T.textMuted}}>{value||"—"} ›</span>}</div>);
  const Toggle=({label,value,onChange})=>(<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:"1px solid "+T.border}}><span style={{fontFamily:F.sans,fontSize:12,color:T.text}}>{label}</span><button onClick={()=>onChange(!value)} style={{width:44,height:24,borderRadius:12,border:"none",background:value?T.text:T.border,cursor:"pointer",position:"relative",transition:"all 0.2s"}}><div style={{width:18,height:18,borderRadius:9,background:value?T.bg:T.textDim,position:"absolute",top:3,left:value?23:3,transition:"all 0.2s"}}/></button></div>);
  const handlePhoto=async(e)=>{const f=e.target.files?.[0];if(!f)return;setBusy(true);try{await uploadPhoto(f);toast("Снимката е качена","success");}catch(e){console.warn(e);}finally{setBusy(false);}};
  const handleExport=async()=>{const data=await exportData();if(!data)return;const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="dreshnik-export-"+new Date().toISOString().slice(0,10)+".json";a.click();URL.revokeObjectURL(url);toast("Данните са експортирани","success");};
  const handleDelete=async()=>{setBusy(true);try{await deleteAccount(delPass);}catch(e){console.warn(e);}finally{setBusy(false);}};
  const isGoogle=user?.providerData?.[0]?.providerId==="google.com";
  return(<div style={{padding:"24px 20px 100px"}}>
    <div style={{display:"flex",alignItems:"center",gap:18,marginBottom:28}}>
      <div onClick={()=>fileRef.current?.click()} style={{width:72,height:72,borderRadius:"50%",overflow:"hidden",border:"2px solid "+T.border,cursor:"pointer",flexShrink:0,background:T.surface,display:"flex",alignItems:"center",justifyContent:"center"}}>
        {profile.photoURL||user?.photoURL?<img src={profile.photoURL||user?.photoURL} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontFamily:F.serif,fontSize:28,color:T.textDim}}>{(profile.displayName||user?.displayName||"?")[0]?.toUpperCase()}</span>}
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{display:"none"}}/>
      <div style={{flex:1}}>
        {editName?<div style={{display:"flex",gap:6}}><input value={nameVal} onChange={e=>setNameVal(e.target.value)} style={{...inputSt,flex:1,marginBottom:0}} autoFocus/><button onClick={()=>{saveProfile({displayName:nameVal});setEditName(false);toast("Запазено","success");}} style={{padding:"0 14px",borderRadius:2,border:"1px solid "+T.text,background:"transparent",color:T.text,fontFamily:F.mono,fontSize:11,cursor:"pointer"}}>OK</button></div>:
        <p onClick={()=>setEditName(true)} style={{fontFamily:F.serif,fontSize:22,color:T.text,fontWeight:400,margin:0,cursor:"pointer"}}>{profile.displayName||user?.displayName||"Задай име"}</p>}
        <p style={{fontFamily:F.mono,fontSize:10,color:T.textDim,margin:"4px 0 0"}}>{user?.email}</p>
        {isGoogle&&<span style={{fontFamily:F.mono,fontSize:10,color:T.textDim,border:"1px solid "+T.border,padding:"2px 8px",borderRadius:2,marginTop:4,display:"inline-block"}}>GOOGLE</span>}
      </div>
    </div>
    <Section title="БИО">
      {editBio?<div><textarea value={bioVal} onChange={e=>setBioVal(e.target.value)} rows={3} style={{...inputSt,resize:"none",marginBottom:8}} placeholder="Разкажи за стила си..."/><button onClick={()=>{saveProfile({bio:bioVal});setEditBio(false);toast("Запазено","success");}} style={{padding:"8px 16px",borderRadius:2,border:"1px solid "+T.text,background:"transparent",color:T.text,fontFamily:F.mono,fontSize:11,cursor:"pointer"}}>ЗАПАЗИ</button></div>:
      <p onClick={()=>setEditBio(true)} style={{fontFamily:F.sans,fontSize:12,color:profile.bio?T.textSoft:T.textDim,margin:0,cursor:"pointer",lineHeight:1.6}}>{profile.bio||"Натисни за да добавиш био..."}</p>}
    </Section>
    <Section title="СТИЛ">
      <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:14}}>{STYLES.map((s,i)=>{const id=STYLE_IDS[i];const active=profile.preferredStyles?.includes(id);return<Pill key={i} active={active} onClick={()=>{const cur=profile.preferredStyles||[];saveProfile({preferredStyles:active?cur.filter(x=>x!==id):[...cur,id]});}} small>{s}</Pill>})}</div>
      <Row label="Горнище" value={profile.topSize} field="topSize"/>
      <Row label="Долнище" value={profile.bottomSize} field="bottomSize"/>
      <Row label="Обувки" value={profile.shoeSize} field="shoeSize"/>
    </Section>
    <Section title="НАСТРОЙКИ">
      <Toggle label="Сезонна ротация" value={settings.seasonalRotation} onChange={v=>saveSettings({seasonalRotation:v})}/>
      <Toggle label="Сутрешно предложение" value={settings.notifyMorningOutfit} onChange={v=>saveSettings({notifyMorningOutfit:v})}/>
      <Toggle label="Седмичен отчет" value={settings.notifyWeeklyReport} onChange={v=>saveSettings({notifyWeeklyReport:v})}/>
      <Toggle label="Публичен гардероб" value={profile.isPublic} onChange={v=>saveProfile({isPublic:v})}/>
      <div style={{padding:"12px 0",borderBottom:"1px solid "+T.border}}>
        <p style={{fontFamily:F.mono,fontSize:11,color:T.textDim,letterSpacing:"0.12em",marginBottom:8}}>ВАЛУТА</p>
        <div style={{display:"flex",gap:6}}>{["лв","€","$","£"].map(c=><Pill key={c} active={settings.currency===c} onClick={()=>{console.log("[Currency] clicking:",c,"current:",settings.currency);saveSettings({currency:c});toast("Валута: "+c);}} small>{c}</Pill>)}</div>
      </div>
      <div style={{padding:"12px 0",borderBottom:"1px solid "+T.border}}>
        <p style={{fontFamily:F.mono,fontSize:11,color:T.textDim,letterSpacing:"0.12em",marginBottom:8}}>ЕЗИК</p>
        <div style={{display:"flex",gap:6}}>{[{id:"bg",label:"Български"},{id:"en",label:"English"}].map(l=><Pill key={l.id} active={(settings.language||"bg")===l.id} onClick={()=>{console.log("[Language] clicking:",l.id,"current:",settings.language);saveSettings({language:l.id});toast("Език: "+l.label);}} small>{l.label}</Pill>)}</div>
      </div>
    </Section>
    <Section title="АКАУНТ">
      <button onClick={handleExport} style={{width:"100%",padding:13,borderRadius:2,border:"1px solid "+T.border,background:"transparent",fontFamily:F.mono,fontSize:11,color:T.textMuted,cursor:"pointer",letterSpacing:"0.06em",marginBottom:8}}>ЕКСПОРТИРАЙ ДАННИ (JSON)</button>
      <button onClick={()=>confirm("Искаш ли да излезеш от акаунта?",()=>logout())} style={{width:"100%",padding:13,borderRadius:2,border:"1px solid "+T.border,background:"transparent",fontFamily:F.mono,fontSize:11,color:T.textMuted,cursor:"pointer",letterSpacing:"0.06em",marginBottom:8}}>ИЗЛЕЗ</button>
      {!showDelete?<button onClick={()=>setShowDelete(true)} style={{width:"100%",padding:13,borderRadius:2,border:"1px solid "+T.danger,background:"transparent",fontFamily:F.mono,fontSize:11,color:T.dangerText,cursor:"pointer",letterSpacing:"0.06em"}}>ИЗТРИЙ АКАУНТ</button>:
      <div style={{border:"1px solid "+T.danger,borderRadius:3,padding:16}}>
        <p style={{fontFamily:F.sans,fontSize:12,color:T.dangerText,margin:"0 0 12px"}}>Това ще изтрие акаунта ти и всички данни завинаги.</p>
        {!isGoogle&&<input value={delPass} onChange={e=>setDelPass(e.target.value)} type="password" placeholder="Въведи парола за потвърждение" style={{...inputSt,marginBottom:10}}/>}
        <div style={{display:"flex",gap:8}}><button onClick={()=>{setShowDelete(false);setDelPass("");}} style={{flex:1,padding:12,borderRadius:2,border:"1px solid "+T.border,background:"transparent",fontFamily:F.mono,fontSize:11,color:T.textMuted,cursor:"pointer"}}>ОТКАЗ</button>
        <button onClick={handleDelete} disabled={!isGoogle&&!delPass} style={{flex:1,padding:12,borderRadius:2,border:"none",background:T.dangerText,color:"#fff",fontFamily:F.mono,fontSize:11,cursor:"pointer",opacity:busy?0.5:1}}>ИЗТРИЙ</button></div>
      </div>}
    </Section>
    <p style={{fontFamily:F.mono,fontSize:10,color:T.textDim,textAlign:"center",letterSpacing:"0.08em",marginTop:20}}>DRESHNIK.BG v8 · MADE IN BULGARIA 🇧🇬</p>
  </div>);
}

// ============================================================
// App (v8)
// ============================================================
export default function App(){
  const{user,loading:authLoading,profile,settings,saveSettings,syncItems,loadItems,syncOutfits,loadOutfits,syncMeta,loadMeta}=useAuth();
  const[tab,setTab]=useState("wardrobe");const[items,setItems]=useState([]);const[saved,setSaved]=useState([]);const[loaded,setLoaded]=useState(false);const[theme,setTheme]=useState("dark");const[calendar,setCalendar]=useState({});const[blacklist,setBlacklist]=useState([]);const[hideSeasonal,setHideSeasonal]=useState(false);const weather=useWeather();
  const syncTimers=useRef({items:null,outfits:null,meta:null});

  useEffect(()=>{if(authLoading)return;(async()=>{
    if(user){
      const ci=await loadItems();const co=await loadOutfits();const cm=await loadMeta();
      if(ci)setItems(ci);if(co)setSaved(co);
      if(cm){if(cm.calendar)setCalendar(cm.calendar);if(cm.blacklist)setBlacklist(cm.blacklist);}
      if(settings.theme)setTheme(settings.theme);
      if(settings.seasonalRotation!==undefined)setHideSeasonal(settings.seasonalRotation);
      // Migrate localStorage
      const localItems=sGet("d6-items");
      if(localItems&&localItems.length>0&&(!ci||ci.length===0)){
        setItems(localItems);syncItems(localItems);
        const lo=sGet("d6-outfits");if(lo){setSaved(lo);syncOutfits(lo);}
        const lc=sGet("d6-calendar"),lb=sGet("d6-blacklist");
        if(lc||lb)syncMeta({calendar:lc||{},blacklist:lb||[]});
        if(lc)setCalendar(lc);if(lb)setBlacklist(lb);
        ["d6-items","d6-outfits","d6-calendar","d6-blacklist","d6-onboarded","d6-theme","d6-seasonal"].forEach(k=>localStorage.removeItem(k));
      }
    }else{
      const i=sGet("d6-items"),o=sGet("d6-outfits"),th=sGet("d6-theme"),cal=sGet("d6-calendar"),bl=sGet("d6-blacklist"),hs=sGet("d6-seasonal");
      if(i)setItems(i);if(o)setSaved(o);if(th)setTheme(th);if(cal)setCalendar(cal);if(bl)setBlacklist(bl);if(hs)setHideSeasonal(hs);
    }
    setLoaded(true);
  })();},[authLoading,user]);

  // Separate debounced sync timers
  const dsync=(key,fn)=>{if(syncTimers.current[key])clearTimeout(syncTimers.current[key]);syncTimers.current[key]=setTimeout(fn,2000);};
  useEffect(()=>{if(!loaded)return;if(user)dsync("items",()=>syncItems(items));else sSet("d6-items",items);},[items,loaded]);
  useEffect(()=>{if(!loaded)return;if(user)dsync("outfits",()=>syncOutfits(saved));else sSet("d6-outfits",saved);},[saved,loaded]);
  useEffect(()=>{if(!loaded)return;if(user)dsync("meta",()=>syncMeta({calendar,blacklist}));else{sSet("d6-calendar",calendar);sSet("d6-blacklist",blacklist);};},[calendar,blacklist,loaded]);
  useEffect(()=>{if(!loaded)return;if(!user)sSet("d6-seasonal",hideSeasonal);},[hideSeasonal,loaded]);

  const toggleTheme=()=>{const next=theme==="dark"?"light":"dark";setTheme(next);if(user)saveSettings({theme:next});else sSet("d6-theme",next);};
  const add=(item)=>{setItems(p=>[item,...p]);setTab("wardrobe");};
  const del=(id)=>setItems(p=>p.filter(i=>i.id!==id));
  const update=(id,upd)=>{if(id==="__duplicate__"){setItems(p=>[upd,...p]);return;}setItems(p=>p.map(i=>i.id===id?{...i,...upd}:i));if(upd.lastWorn){const dk=todayKey();setCalendar(prev=>{const existing=prev[dk]||[];if(!existing.includes(id))return{...prev,[dk]:[...existing,id]};return prev;});}};
  const saveO=(o)=>setSaved(p=>[o,...p]);const delO=(id)=>setSaved(p=>p.filter(o=>o.id!==id));
  const addBlacklist=(key)=>setBlacklist(p=>[...p,key]);
  const T=THEMES[theme]||THEMES.dark;
  const globalStyles=`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Syne:wght@400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap');@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes fadeInUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}::-webkit-scrollbar{display:none}html{height:-webkit-fill-available}body{background:${T.bg};margin:0;min-height:100dvh;padding:env(safe-area-inset-top,0) env(safe-area-inset-right,0) env(safe-area-inset-bottom,0) env(safe-area-inset-left,0);transition:background 0.3s}@supports not (min-height:100dvh){body{min-height:100vh;min-height:-webkit-fill-available}}input,select,button,textarea{outline:none}input:focus,textarea:focus{border-color:${theme==="dark"?"#333":"#AAA"} !important}::placeholder{color:${T.textDim}}video{-webkit-transform:translateZ(0)}`;

  if(authLoading||!loaded)return(<ThemeCtx.Provider value={T}><div style={{height:"100dvh",display:"flex",alignItems:"center",justifyContent:"center",background:T.bg}}><style>{globalStyles}</style><Logo size={28} animate/></div></ThemeCtx.Provider>);
  if(!user)return(<ThemeCtx.Provider value={T}><style>{globalStyles}</style><ToastProvider><ConfirmProvider><AuthScreen/></ConfirmProvider></ToastProvider></ThemeCtx.Provider>);

  return(<ThemeCtx.Provider value={T}><ToastProvider><ConfirmProvider><div style={{maxWidth:500,margin:"0 auto",minHeight:"100dvh",background:T.bg,paddingBottom:"env(safe-area-inset-bottom, 0px)",transition:"background 0.3s"}}><style>{globalStyles}</style>
    <Nav tab={tab} setTab={setTab} count={items.length} theme={theme} toggleTheme={toggleTheme}/>
    {tab==="wardrobe"&&<WardrobeTab items={items} onDelete={del} onUpdate={update} weather={weather} calendar={calendar} hideSeasonal={hideSeasonal} setHideSeasonal={setHideSeasonal}/>}
    {tab==="add"&&<AddTab onAdd={add} lastCat={items[0]?.category||""}/>}
    {tab==="outfits"&&<OutfitsTab items={items} onSave={saveO} weather={weather} blacklist={blacklist} addBlacklist={addBlacklist}/>}
    {tab==="saved"&&<SavedTab saved={saved} items={items} onDelete={delO}/>}
    {tab==="insights"&&<InsightsTab items={items} saved={saved}/>}
    {tab==="profile"&&<ProfileTab/>}
  </div></ConfirmProvider></ToastProvider></ThemeCtx.Provider>);
}
