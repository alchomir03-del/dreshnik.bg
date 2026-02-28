import{useState,useEffect,useRef,useCallback,createContext,useContext,useMemo}from"react";
import{useAuth}from"./AuthContext.jsx";
import translations from"./i18n.js";
import{getPrivacyPolicy,getTermsOfService}from"./legalTexts.js";

// ============================================================
// dreshnik.bg v8 — Full rebuild with Bulgarian UI, optimizations, all features
// ============================================================

// === i18n ===
function useT(){
  const{settings}=useAuth()||{};
  const lang=(settings?.language)||"bg";
  return useCallback((key)=>{
    if(lang==="bg")return key;
    return translations[key]?.en||key;
  },[lang]);
}

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
  ["#1C1C2E","Тъмно синьо"],["#2563EB","Синьо"],["#7DD3FC","Небесно"],["#1E3A2F","Тъмнозелено"],
  ["#4ADE80","Изумруд"],["#B8D4A3","Мента"],["#DC2626","Червено"],["#F97316","Оранжево"],
  ["#EAB308","Злато"],["#7C3AED","Виолетово"],["#EC4899","Розово"],["#92400E","Кафяво"],
  ["#D2B48C","Бежово"],["#F5F0E8","Кремаво"],["#C0A27A","Каки"],["#800020","Бордо"],
  ["#C9B8A8","Топло сиво"],["#2F4F4F","Графит"],["#FFD700","Горчица"],["#8B4513","Коняк"],
];
const MATERIALS=["Памук","Лен","Коприна","Вълна","Кашмир","Деним","Кожа","Велур","Полиестер","Найлон","Кадифе","Кордюрой","Трико","Флийс","Gore-Tex"];
const BRANDS=["Nike","Adidas","Zara","H&M","Uniqlo","COS","Massimo Dutti","Ralph Lauren","Tommy Hilfiger","Calvin Klein","Hugo Boss","Levi's","New Balance","Converse","Друг"];
const F={serif:"'Cormorant Garamond',Georgia,serif",sans:"'Syne','Helvetica Neue',sans-serif",mono:"'JetBrains Mono','SF Mono',monospace"};

// === Themes ===
const THEMES={
  dark:{bg:"#060606",surface:"#0C0C0C",card:"#0D0D0D",border:"#2A2A2A",borderLight:"#333333",text:"#F0ECE4",textSoft:"#BBBBAA",textMuted:"#999988",textDim:"#666660",glow:"rgba(240,236,228,0.03)",overlay:"rgba(0,0,0,0.85)",danger:"#221111",dangerText:"#CC4444",imgOpacity:0.92,shadow:"none",accent:"#F0ECE4",pillBg:"rgba(255,255,255,0.06)",pillBorder:"rgba(255,255,255,0.10)",subtleBg:"rgba(255,255,255,0.04)",cardOverlay:"rgba(0,0,0,0.6)",capsuleBorder:"#332200",capsuleText:"#CCAA00",laundryBorder:"#445566",laundryText:"#88AACC",successText:"#88CC88",eventAccent:"#D4A574",eventText:"#D4A574",eventBg:"rgba(212,165,116,0.06)",washWarn:"#CC8844"},
  light:{bg:"#F7F6F3",surface:"#FFFFFF",card:"#FFFFFF",border:"#E5E3DE",borderLight:"#D5D3CE",text:"#1A1A1A",textSoft:"#444444",textMuted:"#666666",textDim:"#888880",glow:"rgba(0,0,0,0.02)",overlay:"rgba(255,255,255,0.85)",danger:"#FFDDDD",dangerText:"#CC3333",imgOpacity:1,shadow:"0 1px 3px rgba(0,0,0,0.06)",accent:"#1A1A1A",pillBg:"rgba(0,0,0,0.04)",pillBorder:"rgba(0,0,0,0.10)",subtleBg:"rgba(0,0,0,0.02)",cardOverlay:"rgba(0,0,0,0.45)",capsuleBorder:"#DDCC77",capsuleText:"#887700",laundryBorder:"#AABBCC",laundryText:"#445566",successText:"#338833",eventAccent:"#8B6914",eventText:"#8B6914",eventBg:"rgba(139,105,20,0.06)",washWarn:"#AA7733"},
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
    {toasts.map(t=><div key={t.id} style={{background:T.surface,border:"1px solid "+T.pillBorder,borderRadius:100,padding:"10px 24px",fontFamily:F.serif,fontSize:13,fontWeight:400,color:t.type==="error"?T.dangerText:T.text,boxShadow:"0 4px 20px rgba(0,0,0,0.3)",animation:"fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",pointerEvents:"auto",maxWidth:340,textAlign:"center",letterSpacing:"0.01em"}}>{t.msg}</div>)}
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
  const T=useTheme(),t=useT();
  return(<div style={{position:"fixed",inset:0,background:T.overlay,backdropFilter:"blur(12px)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:24,animation:"fadeIn .15s"}} onClick={onNo}>
    <div onClick={e=>e.stopPropagation()} style={{background:T.surface,border:"1px solid "+T.border,borderRadius:4,padding:24,maxWidth:320,width:"100%",animation:"fadeInUp .2s ease"}}>
      <p style={{fontFamily:F.sans,fontSize:13,color:T.text,margin:"0 0 20px",lineHeight:1.6}}>{msg}</p>
      <div style={{display:"flex",gap:8}}>
        <button onClick={onNo} style={{flex:1,padding:12,borderRadius:2,border:"1px solid "+T.border,background:"transparent",fontFamily:F.mono,fontSize:11,color:T.textMuted,cursor:"pointer",letterSpacing:"0.08em"}}>{t("ОТКАЗ")}</button>
        <button onClick={onYes} style={{flex:1,padding:12,borderRadius:2,border:"none",background:T.dangerText,color:"#fff",fontFamily:F.mono,fontSize:11,cursor:"pointer",letterSpacing:"0.08em"}}>{t("ПОТВЪРДИ")}</button>
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
  // Fallback: if no standard combos, pair any 2-3 items from different categories
  if(combos.length===0&&available.length>=2){const cats=Object.keys(byC).filter(k=>byC[k].length>0);if(cats.length>=2){for(let i=0;i<cats.length;i++)for(let j=i+1;j<cats.length;j++){byC[cats[i]].slice(0,6).forEach(a=>byC[cats[j]].slice(0,6).forEach(b=>combos.push({items:[a,b]})));}}if(combos.length===0){for(let i=0;i<available.length;i++)for(let j=i+1;j<available.length;j++)combos.push({items:[available[i],available[j]]});}}
  const blSet=blacklist?.length?new Set(blacklist):null;combos.forEach(c=>{c.score=scoreOutfit(c.items,occIdx,weather,blSet);});
  combos.sort((a,b)=>b.score-a.score);const seen=new Set(),res=[];
  for(const c of combos){const k=c.items.map(i=>i.id).sort().join(",");if(!seen.has(k)&&c.score>-500){seen.add(k);res.push(c);if(res.length>=count)break;}}
  // If score filter is too strict, return top combos anyway
  if(res.length===0&&combos.length>0){const seen2=new Set();for(const c of combos){const k=c.items.map(i=>i.id).sort().join(",");if(!seen2.has(k)){seen2.add(k);res.push(c);if(res.length>=count)break;}}}return res;
}
function getExplanation(combo,occ){
  const neutrals=combo.items.filter(i=>i.colors?.[0]&&isNeutral(i.colors[0])),accents=combo.items.filter(i=>i.colors?.[0]&&!isNeutral(i.colors[0]));
  let t="";if(neutrals.length>0&&accents.length>0)t+="Неутрална база: "+neutrals.map(n=>n.name).join(" + ")+" с акцент: "+accents.map(a=>a.name).join(", ")+". ";
  else if(neutrals.length===combo.items.length)t+="Монохромна визия — чиста и уверена. ";
  else t+="Смел цветови микс — "+combo.items.map(i=>i.name).join(" + ")+". ";
  const o=OCCASIONS.find(x=>x.id===occ);if(o){const matching=combo.items.filter(i=>o.styles.includes(STYLE_IDS.indexOf(i.style)));if(matching.length===combo.items.length)t+="Перфектен мач за "+o.label+".";else if(matching.length>0)t+=matching.map(x=>x.name).join(" & ")+" задава тона.";}return t;
}
const TIPS={everyday:["Навий ръкави за ефортлес стил.","Бели кецове заковават всяка визия.","Тъкни ризата от едната страна.","Добави верижка за акцент."],work:["Колан и обувки — същият цвят.","Инвестирай в тейлъринг.","Макс 3 цвята за авторитет.","Часовникът издига всичко."],date:["Едно statement парче е достатъчно.","Обувките правят първо впечатление.","Тъмни цветове = увереност.","Парфюмът завършва визията."],sport:["Само дишащи материи.","Монохром изглежда скъпо.","Сетовете изглеждат умишлено.","Чисти кецове — винаги."],formal:["Ризата трябва да е гладена.","Тъмни тонове излъчват авторитет.","Детайли — маншети, яка, копчета.","Кройката е всичко."],party:["Едно смело парче носи цялата визия.","Миксът от текстури добавя дълбочина.","Черното е винаги безопасно.","Аксесоарите правят разликата."],travel:["Слоестото обличане — твоят приятел.","Неутрална база, един поп цвят.","Устойчиви на гънки материи.","Комфорт на първо място."],creative:["Наруши правилата.","Миксирай неочаквани принтове.","Смелите цветове показват увереност.","Аксесоарите разказват историята ти."]};
function getTip(occ){const l=TIPS[occ]||TIPS.everyday;return l[Math.floor(Math.random()*l.length)];}

// === Venue Recommendations ===
const VENUES={
  everyday:[{name:"Кафене на ъгъла",type:"кафене"},{name:"Парк / разходка",type:"на открито"},{name:"Мол / шопинг",type:"търговски център"},{name:"Бранч място",type:"ресторант"}],
  work:[{name:"Бизнес ресторант",type:"ресторант"},{name:"Коуъркинг кафе",type:"кафене"},{name:"Хотелско лоби",type:"лоби бар"},{name:"Бизнес среща",type:"офис"}],
  date:[{name:"Коктейл бар",type:"бар"},{name:"Уютен ресторант",type:"ресторант"},{name:"Руфтоп бар",type:"бар"},{name:"Вино & тапас",type:"винен бар"}],
  sport:[{name:"Фитнес / зала",type:"спорт"},{name:"Спортен бар",type:"бар"},{name:"Паркова тренировка",type:"на открито"},{name:"Спа & уелнес",type:"спа"}],
  formal:[{name:"Файн дайнинг",type:"ресторант"},{name:"Оперна зала",type:"култура"},{name:"Галерия / изложба",type:"изкуство"},{name:"Гала вечеря",type:"събитие"}],
  party:[{name:"Нощен клуб",type:"клуб"},{name:"Концерт / лайв",type:"музика"},{name:"Коктейл парти",type:"бар"},{name:"Караоке бар",type:"забавление"}],
  travel:[{name:"Летищен лаунж",type:"лаунж"},{name:"Локален ресторант",type:"ресторант"},{name:"Улична храна",type:"стрийт фууд"},{name:"Хотелски ресторант",type:"ресторант"}],
  creative:[{name:"Арт кафене",type:"кафене"},{name:"Книжарница / кафе",type:"кафене"},{name:"Независим бар",type:"бар"},{name:"Поп-ъп събитие",type:"събитие"}],
};
const VENUES_EN={
  everyday:[{name:"Corner Caf\u00E9",type:"caf\u00E9"},{name:"Park / Walk",type:"outdoor"},{name:"Mall / Shopping",type:"mall"},{name:"Brunch Spot",type:"restaurant"}],
  work:[{name:"Business Restaurant",type:"restaurant"},{name:"Coworking Caf\u00E9",type:"caf\u00E9"},{name:"Hotel Lobby",type:"lobby bar"},{name:"Business Meeting",type:"office"}],
  date:[{name:"Cocktail Bar",type:"bar"},{name:"Cozy Restaurant",type:"restaurant"},{name:"Rooftop Bar",type:"bar"},{name:"Wine & Tapas",type:"wine bar"}],
  sport:[{name:"Gym",type:"sport"},{name:"Sports Bar",type:"bar"},{name:"Park Workout",type:"outdoor"},{name:"Spa & Wellness",type:"spa"}],
  formal:[{name:"Fine Dining",type:"restaurant"},{name:"Opera Hall",type:"culture"},{name:"Gallery / Exhibition",type:"art"},{name:"Gala Dinner",type:"event"}],
  party:[{name:"Nightclub",type:"club"},{name:"Concert / Live",type:"music"},{name:"Cocktail Party",type:"bar"},{name:"Karaoke Bar",type:"fun"}],
  travel:[{name:"Airport Lounge",type:"lounge"},{name:"Local Restaurant",type:"restaurant"},{name:"Street Food",type:"street food"},{name:"Hotel Restaurant",type:"restaurant"}],
  creative:[{name:"Art Caf\u00E9",type:"caf\u00E9"},{name:"Bookshop Caf\u00E9",type:"caf\u00E9"},{name:"Indie Bar",type:"bar"},{name:"Pop-up Event",type:"event"}],
};
function getVenue(occ,lang){const list=(lang==="en"?VENUES_EN:VENUES)[occ]||(lang==="en"?VENUES_EN:VENUES).everyday;return list[Math.floor(Math.random()*list.length)];}
function getAutoOccasion(){const h=new Date().getHours(),d=new Date().getDay();if(d===0)return"everyday";if(d===6)return h>=18?"party":"creative";if(d===5)return h>=18?"party":"everyday";if(h<12)return"work";if(h<17)return"everyday";return"date";}
function getTimeLabel(lang){const h=new Date().getHours();if(lang==="en")return h<12?"THIS MORNING":h<17?"TODAY":"TONIGHT";return h<12?"ТАЗИ СУТРИН":h<17?"ДНЕС":"ТАЗИ ВЕЧЕР";}

// === Calendar helpers ===
const LAUNDRY_THRESHOLD=3;
function normCal(entry){if(Array.isArray(entry))return{worn:entry,events:[],laundryDay:false};return{worn:entry?.worn||[],events:entry?.events||[],laundryDay:!!entry?.laundryDay};}

// === Weather (cached) ===
const WC_BG={0:"Ясно",1:"Предимно ясно",2:"Частично облачно",3:"Облачно",45:"Мъгла",48:"Мъгла",51:"Лек ръмеж",53:"Ръмеж",55:"Силен ръмеж",61:"Лек дъжд",63:"Дъжд",65:"Силен дъжд",71:"Лек сняг",73:"Сняг",75:"Силен сняг",80:"Превалявания",95:"Гръмотевична буря"};
const WC_EN={0:"Clear",1:"Mostly clear",2:"Partly cloudy",3:"Overcast",45:"Fog",48:"Fog",51:"Light drizzle",53:"Drizzle",55:"Heavy drizzle",61:"Light rain",63:"Rain",65:"Heavy rain",71:"Light snow",73:"Snow",75:"Heavy snow",80:"Showers",95:"Thunderstorm"};
function getWIcon(code){if(code<=1)return"\u2600";if(code<=3)return"\u2601";if(code>=45&&code<=48)return"\u2592";if(code>=51&&code<=67)return"\u2602";if(code>=71&&code<=77)return"*";if(code>=80&&code<=82)return"\u2602";if(code>=95)return"\u2607";return"\u2600";}
let weatherCache=null;let weatherTs=0;
function useWeather(){const[w,setW]=useState(weatherCache);useEffect(()=>{if(Date.now()-weatherTs<600000&&weatherCache){setW(weatherCache);return;}if(!navigator.geolocation)return;navigator.geolocation.getCurrentPosition(async pos=>{try{const lat=pos.coords.latitude,lon=pos.coords.longitude;const[wr,gr]=await Promise.all([fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&timezone=auto&forecast_days=1`),fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=bg`)]);const d=await wr.json();let city="";try{const geo=await gr.json();city=geo.address?.city||geo.address?.town||geo.address?.village||geo.address?.municipality||"";}catch(e){console.warn(e);}const code=d.current?.weather_code||0;const result={temp:Math.round(d.current?.temperature_2m||0),rain:code>=51&&code<=67,code,wind:Math.round(d.current?.wind_speed_10m||0),humidity:d.current?.relative_humidity_2m||0,high:Math.round(d.daily?.temperature_2m_max?.[0]||0),low:Math.round(d.daily?.temperature_2m_min?.[0]||0),rainChance:d.daily?.precipitation_probability_max?.[0]||0,desc:WC_BG[code]||"Ясно",icon:getWIcon(code),city};weatherCache=result;weatherTs=Date.now();setW(result);}catch(e){console.warn(e);}},()=>{},{timeout:5000});},[]);return w;}

// === Storage (sync, no fake async) ===
function sGet(k){try{return JSON.parse(localStorage.getItem(k));}catch{return null;}}
function sSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){console.warn("Storage:",e);}}
function compress(d,m=500){return new Promise(r=>{const i=new Image();i.onload=()=>{const c=document.createElement("canvas"),s=Math.min(m/i.width,m/i.height,1);c.width=i.width*s;c.height=i.height*s;c.getContext("2d").drawImage(i,0,0,c.width,c.height);r(c.toDataURL("image/jpeg",0.65));};i.src=d;});}
function dateKey(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function todayKey(){return dateKey(new Date());}
function useCurrency(){return"€";}

// === Shared UI ===
function Pill({children,active,onClick,small}){const T=useTheme();return(<button onClick={onClick} style={{padding:small?"6px 14px":"8px 18px",borderRadius:100,border:active?"1px solid "+T.text:"1px solid "+T.pillBorder,background:active?T.text:T.pillBg,color:active?T.bg:T.textMuted,fontFamily:F.serif,fontSize:small?12:13,fontWeight:active?500:300,cursor:"pointer",transition:"all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",whiteSpace:"nowrap",letterSpacing:"0.02em"}}>{children}</button>);}
function Logo({size=28,animate,onClick}){const T=useTheme();const Tag=onClick?"button":"span";return(<Tag onClick={onClick} style={{fontFamily:F.serif,fontSize:size,color:T.text,animation:animate?"pulse 2s ease-in-out infinite":"none",letterSpacing:"-0.02em",background:"none",border:"none",padding:0,cursor:onClick?"pointer":"default",WebkitTapHighlightColor:"transparent",display:"inline-block"}}><span style={{fontWeight:500}}>DRESHNIK</span><span style={{fontWeight:300,color:T.textDim}}>.bg</span></Tag>);}
function ColorBar({items}){const all=items.flatMap(i=>i.colors||[]);if(!all.length)return null;return(<div style={{display:"flex",height:2,borderRadius:1,overflow:"hidden",gap:2,opacity:0.85}}>{all.map((c,i)=><div key={i} style={{flex:1,background:c}}/>)}</div>);}
function CompactDailyCard({weather,calendar,onGenerate}){
  const T=useTheme(),t=useT();const{settings}=useAuth()||{};const lang=settings?.language||"bg";
  const[expanded,setExpanded]=useState(false);
  const[venue,setVenue]=useState(()=>getVenue(getAutoOccasion(),lang));
  const tmrEvents=useMemo(()=>{const d=new Date();d.setDate(d.getDate()+1);const dk=dateKey(d);const raw=calendar?.[dk];if(!raw)return[];return normCal(raw).events;},[calendar]);
  const dayAbbrs=lang==="en"?["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]:["Нд","Пн","Вт","Ср","Чт","Пт","Сб"];
  const dayAbbr=dayAbbrs[new Date().getDay()].toUpperCase();
  const fullDayNames=lang==="en"?["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]:["Неделя","Понеделник","Вторник","Сряда","Четвъртък","Петък","Събота"];
  const dayName=fullDayNames[new Date().getDay()].toUpperCase();
  const cityName=weather?.city?.toUpperCase()||"";
  const refresh=(e)=>{e.stopPropagation();setVenue(getVenue(getAutoOccasion(),lang));};
  return(<div style={{margin:"14px 14px 0",background:T.card||T.subtleBg,border:"1px solid "+(T.borderLight||T.border),borderRadius:4,overflow:"hidden"}}>
    <div onClick={()=>setExpanded(p=>!p)} style={{padding:"10px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",WebkitTapHighlightColor:"transparent",minHeight:40,boxSizing:"border-box"}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        {weather&&<span style={{fontFamily:F.mono,fontSize:14,color:T.text,fontWeight:400}}>{weather.temp}{"\u00B0"}</span>}
        <span style={{fontFamily:F.mono,fontSize:10,color:T.textMuted,letterSpacing:"0.06em",textTransform:"uppercase"}}>{venue.type}</span>
        {tmrEvents.length>0&&<span style={{fontFamily:F.mono,fontSize:8,color:T.eventText,letterSpacing:"0.1em",border:"1px solid "+T.eventAccent,borderRadius:2,padding:"2px 6px",lineHeight:1}}>{t("УТРЕ")}</span>}
      </div>
      <span style={{fontFamily:F.sans,fontSize:10,color:T.textDim,transition:"transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",transform:expanded?"rotate(180deg)":"rotate(0deg)",display:"inline-block"}}>{"▾"}</span>
    </div>
    <div style={{maxHeight:expanded?500:0,opacity:expanded?1:0,overflow:"hidden",transition:"max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease"}}>
      <div style={{height:1,background:T.border,margin:"0 20px"}}/>
      <div style={{padding:"14px 20px 16px"}}>
        <p style={{fontFamily:F.mono,fontSize:10,color:T.textDim,letterSpacing:"0.16em",margin:"0 0 14px"}}>{dayName}{cityName?(" \u00B7 "+cityName):""}</p>
        {weather&&<><div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
          <span style={{fontFamily:F.mono,fontSize:28,color:T.text,fontWeight:400}}>{weather.temp}{"\u00B0"}</span>
          <span style={{fontFamily:F.sans,fontSize:13,color:T.textSoft}}>{t(weather.desc)}</span>
        </div>
        {weather.rainChance>0&&<p style={{fontFamily:F.mono,fontSize:10,color:T.textDim,margin:"6px 0 0",letterSpacing:"0.06em"}}>{t("ВЕРОЯТНОСТ ЗА ДЪЖД")} {weather.rainChance}%</p>}</>}
      </div>
      <div style={{height:1,background:T.border,margin:"0 20px"}}/>
      <div style={{padding:"14px 20px 16px",display:"flex",alignItems:"center",gap:12}}>
        <div style={{flex:1}}>
          <p style={{fontFamily:F.mono,fontSize:9,color:T.textDim,letterSpacing:"0.14em",margin:"0 0 5px"}}>{getTimeLabel(lang)}</p>
          <p style={{fontFamily:F.serif,fontSize:17,color:T.text,fontWeight:400,margin:"0 0 2px"}}>{venue.name}</p>
          <p style={{fontFamily:F.mono,fontSize:10,color:T.textMuted,margin:0,letterSpacing:"0.06em",textTransform:"uppercase"}}>{venue.type}</p>
        </div>
        <button onClick={refresh} style={{background:"none",border:"1px solid "+T.border,borderRadius:"50%",width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:T.textDim,flexShrink:0,transition:"all 0.3s"}}>{"↻"}</button>
      </div>
      {tmrEvents.length>0&&<><div style={{height:1,background:T.border,margin:"0 20px"}}/>
        <div style={{padding:"14px 18px",borderLeft:"3px solid "+T.eventAccent}}>
          <p style={{fontFamily:F.mono,fontSize:9,color:T.eventText,letterSpacing:"0.16em",margin:"0 0 8px"}}>{t("УТРЕ")}</p>
          {tmrEvents.map(evt=>{const occ=OCCASIONS.find(o=>o.id===evt.occasion);return<div key={evt.id} style={{marginBottom:tmrEvents.length>1?10:0}}>
            <p style={{fontFamily:F.serif,fontSize:16,color:T.text,fontWeight:400,margin:"0 0 2px"}}>{occ?t(occ.label):evt.occasion}{evt.venue?" — "+evt.venue:""}</p>
            {evt.note&&<p style={{fontFamily:F.sans,fontSize:12,color:T.textMuted,margin:"0 0 8px"}}>{evt.note}</p>}
            <button onClick={(e)=>{e.stopPropagation();onGenerate(evt.occasion);}} style={{padding:"7px 14px",borderRadius:2,border:"1px solid "+T.eventAccent,background:"transparent",fontFamily:F.mono,fontSize:9,color:T.eventText,cursor:"pointer",letterSpacing:"0.08em"}}>{t("ПОДГОТВИ ВИЗИЯ")}</button>
          </div>;})}
        </div></>}
    </div>
  </div>);
}
function EmptyState({icon,title,sub}){const T=useTheme();return(<div style={{textAlign:"center",padding:"60px 24px"}}>{icon&&<p style={{fontFamily:F.mono,fontSize:28,color:T.textDim,marginBottom:12,opacity:0.4}}>{icon}</p>}<p style={{fontFamily:F.serif,fontSize:22,color:T.text,fontWeight:300,marginBottom:8,letterSpacing:"-0.01em"}}>{title}</p><p style={{fontFamily:F.mono,fontSize:10,color:T.textDim,letterSpacing:"0.16em",textTransform:"uppercase"}}>{sub}</p></div>);}

function LegalPage({type,onClose}){
  const T=useTheme(),t=useT();const{settings}=useAuth()||{};const lang=settings?.language||"bg";
  const content=type==="privacy"?getPrivacyPolicy(lang):getTermsOfService(lang);
  return(<div style={{position:"fixed",inset:0,background:T.bg,zIndex:250,overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
    <div style={{maxWidth:600,margin:"0 auto",padding:"24px 20px 60px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24,position:"sticky",top:0,background:T.bg,paddingTop:12,paddingBottom:12,zIndex:10,borderBottom:"1px solid "+T.border}}>
        <span style={{fontFamily:F.serif,fontSize:18,color:T.text,fontWeight:400}}>{content.title}</span>
        <button onClick={onClose} style={{background:"none",border:"1px solid "+T.border,borderRadius:"50%",width:36,height:36,cursor:"pointer",color:T.textMuted,fontFamily:F.sans,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
      </div>
      <p style={{fontFamily:F.mono,fontSize:9,color:T.textDim,letterSpacing:"0.14em",marginBottom:24}}>{content.lastUpdated}</p>
      {content.sections.map((s,i)=>(<div key={i} style={{marginBottom:24}}>
        <h3 style={{fontFamily:F.sans,fontSize:14,fontWeight:600,color:T.text,margin:"0 0 10px",letterSpacing:"0.02em"}}>{s.heading}</h3>
        {s.paragraphs.map((p,j)=>(<p key={j} style={{fontFamily:F.serif,fontSize:13,color:T.textMuted,lineHeight:1.7,margin:"0 0 8px",fontWeight:300}}>{p}</p>))}
      </div>))}
    </div>
  </div>);
}

function Header({theme,toggleTheme,onLogoClick}){
  const T=useTheme();
  return(<div style={{background:T.bg,borderBottom:"1px solid "+T.border,position:"sticky",top:0,zIndex:100,paddingTop:"env(safe-area-inset-top, 0px)"}}>
    <div style={{padding:"14px 22px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <Logo size={22} onClick={onLogoClick}/>
      <button onClick={toggleTheme} style={{background:"none",border:"1px solid "+T.border,borderRadius:"50%",width:36,height:36,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,padding:0,color:T.textDim,transition:"all 0.3s"}}>{theme==="dark"?"☀":"☾"}</button>
    </div>
  </div>);
}

function BottomNav({tab,setTab}){
  const T=useTheme(),t=useT();
  const{user,profile}=useAuth()||{};
  const photoURL=profile?.photoURL||user?.photoURL;
  const tabs=[
    {id:"wardrobe",label:t("Гардероб"),icon:"▣"},
    {id:"add",label:t("Добави"),icon:"＋"},
    {id:"outfits",label:t("Стил"),icon:"✦"},
    {id:"insights",label:t("Анализ"),icon:"◎"},
    {id:"profile",label:t("Профил"),icon:"●"},
  ];
  return(<div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:100,background:T.bg+"ee",borderTop:"1px solid "+T.border,paddingBottom:"env(safe-area-inset-bottom, 0px)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)"}}>
    <div style={{display:"flex",maxWidth:600,margin:"0 auto"}}>
      {tabs.map(tb=>(<button key={tb.id} onClick={()=>setTab(tb.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,padding:"10px 0 8px",border:"none",background:"none",cursor:"pointer",color:tab===tb.id?T.text:T.textDim,transition:"all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",WebkitTapHighlightColor:"transparent",minHeight:56}}>
        <span style={{width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1,transition:"transform 0.2s",transform:tab===tb.id?"scale(1.1)":"scale(1)"}}>
          {tb.id==="profile"?(photoURL?<img src={photoURL} alt="" style={{width:22,height:22,borderRadius:"50%",objectFit:"cover",border:tab==="profile"?"2px solid "+T.text:"2px solid transparent",boxSizing:"border-box"}}/>
          :<div style={{width:20,height:20,borderRadius:"50%",background:tab==="profile"?T.text:T.textDim,transition:"background 0.3s"}}/>)
          :<span style={{fontSize:22}}>{tb.icon}</span>}
        </span>
        <span style={{fontFamily:F.mono,fontSize:10,letterSpacing:"0.04em",fontWeight:tab===tb.id?500:300,textTransform:"uppercase"}}>{tb.label}</span>
      </button>))}
    </div>
  </div>);
}

// === ItemCard ===
function ItemCard({item,onClick,onDoubleTap,idx=0}){
  const T=useTheme(),cat=CAT_MAP[item.category],lastTap=useRef(0);
  const handleTap=()=>{const now=Date.now();if(now-lastTap.current<300){onDoubleTap?.(item.id);lastTap.current=0;}else{lastTap.current=now;setTimeout(()=>{if(lastTap.current!==0){onClick?.();lastTap.current=0;}},300);}};
  return(<div onClick={handleTap} style={{background:T.card,borderRadius:4,overflow:"hidden",cursor:"pointer",border:"1px solid "+T.border,opacity:item.inLaundry?0.4:1,transition:"all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",animation:"fadeInUp "+(0.12+idx*0.04)+"s ease both"}}>
    <div style={{position:"relative",paddingTop:"130%",background:T.surface}}>
      {item.image?<img src={item.image} alt="" loading="lazy" style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",objectFit:"cover",opacity:T.imgOpacity}}/>:
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(145deg, "+(item.colors?.[0]||"#222")+"15 0%, "+T.bg+" 100%)"}}><div style={{width:36,height:36,borderRadius:"50%",background:item.colors?.[0]||"#222",opacity:0.4,border:item.colors?.[0]==="#000000"?"1px solid #222":"none"}}/></div>}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:60,background:"linear-gradient(0deg,"+T.cardOverlay+" 0%,transparent 100%)"}}/>
      <span style={{position:"absolute",top:8,left:8,fontFamily:F.mono,fontSize:10,color:T.textDim,letterSpacing:"0.12em",textTransform:"uppercase"}}>{cat?.label}{item.inLaundry?" · ~":""}</span>
      {item.favorite&&<span style={{position:"absolute",top:8,right:8,fontSize:11,color:T.textMuted}}>♥</span>}
      {item.capsule&&<div style={{position:"absolute",top:8,right:item.favorite?26:8,width:8,height:8,borderRadius:"50%",background:T.text,opacity:0.5}}/>}
      {item.colors?.length>0&&<div style={{position:"absolute",bottom:8,right:8,display:"flex",gap:2}}>{item.colors.slice(0,3).map((c,i)=><div key={i} style={{width:8,height:8,borderRadius:1,background:c,border:"1px solid "+T.pillBorder}}/>)}</div>}
      {(item.wearCount||0)>0&&<span style={{position:"absolute",bottom:8,left:8,fontFamily:F.mono,fontSize:10,color:T.textDim}}>{item.wearCount}×</span>}
      {(item.wearsSinceWash||0)>=LAUNDRY_THRESHOLD&&!item.inLaundry&&<span style={{position:"absolute",bottom:8,left:(item.wearCount||0)>0?38:8,fontFamily:F.mono,fontSize:10,color:T.washWarn}}>{"~"}</span>}
    </div>
    <div style={{padding:"12px 12px 13px"}}>
      <p style={{fontFamily:F.sans,fontSize:11,fontWeight:500,color:T.textSoft,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</p>
      <p style={{fontFamily:F.mono,fontSize:10,color:T.textDim,margin:"4px 0 0",letterSpacing:"0.08em",textTransform:"uppercase"}}>{item.brand||STYLES[STYLE_IDS.indexOf(item.style)]||""}</p>
    </div>
  </div>);
}

// === Modal (Item Detail + Edit) ===
function Modal({item,onClose,onDelete,onUpdate}){
  const T=useTheme(),toast=useToast(),confirm=useConfirm(),cur=useCurrency(),t=useT();
  const[editing,setEditing]=useState(false);const[editData,setEditData]=useState({});
  const cat=CAT_MAP[item.category];
  const cpw=item.price&&item.wearCount?(item.price/item.wearCount).toFixed(0):null;
  const daysSince=item.lastWorn?Math.floor((Date.now()-new Date(item.lastWorn))/86400000)+"д":"—";
  const tags=[cat?.label,STYLES[STYLE_IDS.indexOf(item.style)],SEASONS.find(s=>s.id===item.season)?.label,item.brand].filter(Boolean);
  const startEdit=()=>{setEditData({name:item.name,price:item.price||"",brand:item.brand||"",material:item.material||"",style:item.style,season:item.season});setEditing(true);};
  const saveEdit=()=>{onUpdate(item.id,{...editData,price:parseFloat(editData.price)||0});setEditing(false);toast(t("Запазено ✓"),"success");};
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
            {item.capsule&&<span style={{border:"1px solid "+T.capsuleBorder,padding:"3px 10px",borderRadius:2,fontFamily:F.mono,fontSize:10,color:T.capsuleText,letterSpacing:"0.08em"}}>{t("КАПСУЛА")}</span>}
            {item.inLaundry&&<span style={{border:"1px solid "+T.laundryBorder,padding:"3px 10px",borderRadius:2,fontFamily:F.mono,fontSize:10,color:T.laundryText,letterSpacing:"0.08em"}}>{t("В ПЕРАЛНЯ")}</span>}
            {(item.wearsSinceWash||0)>=LAUNDRY_THRESHOLD&&!item.inLaundry&&<span style={{border:"1px solid "+T.washWarn,padding:"3px 10px",borderRadius:2,fontFamily:F.mono,fontSize:10,color:T.washWarn,letterSpacing:"0.08em"}}>{"~ "+t("НУЖДАЕ СЕ ОТ ПРАНЕ")}</span>}
          </div>
          <h2 style={{fontFamily:F.serif,fontSize:26,fontWeight:300,margin:"6px 0",color:T.text}}>{item.name}</h2>
          {item.colors?.length>0&&<div style={{display:"flex",gap:6,margin:"12px 0 16px"}}>{item.colors.map((c,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:6,border:"1px solid "+T.border,padding:"4px 10px 4px 4px",borderRadius:2}}><div style={{width:14,height:14,borderRadius:2,background:c,border:c==="#FFFFFF"?"1px solid "+T.border:"none"}}/><span style={{fontFamily:F.mono,fontSize:10,color:T.textMuted,letterSpacing:"0.04em",textTransform:"uppercase"}}>{getColorName(c)}</span></div>)}</div>}
          <div style={{display:"flex",gap:0,marginBottom:18,border:"1px solid "+T.border,borderRadius:2,overflow:"hidden"}}>
            {[{v:item.wearCount||0,l:t("НОСЕНО")},{v:daysSince,l:t("ОТ ПОСЛЕДНО")},{v:item.price?cur+item.price:"—",l:t("ЦЕНА")},{v:cpw?cur+cpw:"—",l:t("ЦЕНА/НОСЕНЕ")}].map((d,i)=><div key={i} style={{flex:1,padding:"14px 6px",textAlign:"center",borderRight:i<3?"1px solid "+T.border:"none"}}><p style={{fontFamily:F.serif,fontSize:18,color:T.text,margin:"0 0 2px"}}>{d.v}</p><p style={{fontFamily:F.mono,fontSize:10,color:T.textDim,letterSpacing:"0.1em",margin:0}}>{d.l}</p></div>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10}}>
            {[{label:t("Носих днес"),action:()=>{onUpdate(item.id,{wearCount:(item.wearCount||0)+1,lastWorn:new Date().toISOString()});toast(t("Отбелязано ✓"),"success");}},{label:item.favorite?t("Премахни ♥"):t("Любимо ♥"),action:()=>{onUpdate(item.id,{favorite:!item.favorite});toast(item.favorite?"Премахнато":"Добавено в любими ♥","success");}},{label:item.capsule?t("Не е капсула"):t("Капсула ✦"),action:()=>{onUpdate(item.id,{capsule:!item.capsule});toast(item.capsule?"Премахнато от капсула":"Добавено в капсула","success");}},{label:item.inLaundry?t("Чисто ~"):t("В пералня ~"),action:()=>{onUpdate(item.id,{inLaundry:!item.inLaundry});toast(item.inLaundry?"Обратно в гардероба":"Маркирано за пране","success");}}].map((a,i)=><button key={i} onClick={a.action} style={{padding:12,borderRadius:2,border:"1px solid "+T.border,background:"transparent",fontFamily:F.mono,fontSize:11,color:T.textMuted,cursor:"pointer",letterSpacing:"0.04em",transition:"all 0.2s"}}>{a.label}</button>)}
          </div>
          <div style={{display:"flex",gap:6}}>
            <button onClick={startEdit} style={{flex:1,padding:12,borderRadius:2,border:"1px solid "+T.border,background:"transparent",fontFamily:F.mono,fontSize:11,color:T.textMuted,cursor:"pointer",letterSpacing:"0.06em"}}>{t("РЕДАКТИРАЙ")}</button>
            <button onClick={()=>{const dup={...item,id:Date.now().toString(),name:item.name+" (копие)",addedAt:new Date().toISOString(),wearCount:0,lastWorn:null};onUpdate("__duplicate__",dup);onClose();toast(t("Дублирано ✓"),"success");}} style={{flex:1,padding:12,borderRadius:2,border:"1px solid "+T.border,background:"transparent",fontFamily:F.mono,fontSize:11,color:T.textMuted,cursor:"pointer",letterSpacing:"0.06em"}}>{t("ДУБЛИРАЙ")}</button>
          </div>
          <button onClick={()=>confirm(t("Сигурен ли си, че искаш да премахнеш ")+item.name+"?",()=>{onDelete(item.id);onClose();toast(t("Премахнато"),"info");})} style={{width:"100%",padding:12,background:"transparent",border:"1px solid "+T.danger,borderRadius:2,color:T.dangerText,fontFamily:F.mono,fontSize:11,cursor:"pointer",letterSpacing:"0.08em",textTransform:"uppercase",marginTop:8}}>{t("Премахни от гардероба")}</button>
        </>:
        /* Edit mode */
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <h3 style={{fontFamily:F.serif,fontSize:20,fontWeight:300,color:T.text,margin:0}}>{t("Редактирай")}</h3>
            <button onClick={()=>setEditing(false)} style={{background:"none",border:"none",color:T.textDim,fontSize:18,cursor:"pointer"}}>×</button>
          </div>
          <label style={labelSt}>{t("ИМЕ")}</label><input value={editData.name||""} onChange={e=>setEditData(p=>({...p,name:e.target.value.slice(0,100)}))} maxLength={100} style={inputSt}/>
          <label style={labelSt}>{t("ЦЕНА")}</label><input type="number" value={editData.price||""} onChange={e=>setEditData(p=>({...p,price:e.target.value}))} style={inputSt}/>
          <label style={labelSt}>{t("МАРКА")}</label><input value={editData.brand||""} onChange={e=>setEditData(p=>({...p,brand:e.target.value}))} style={inputSt}/>
          <label style={labelSt}>{t("СТИЛ")}</label><div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:12}}>{STYLES.map((s,i)=><Pill key={i} active={editData.style===STYLE_IDS[i]} onClick={()=>setEditData(p=>({...p,style:STYLE_IDS[i]}))} small>{s}</Pill>)}</div>
          <label style={labelSt}>{t("СЕЗОН")}</label><div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:16}}>{SEASONS.map(s=><Pill key={s.id} active={editData.season===s.id} onClick={()=>setEditData(p=>({...p,season:s.id}))} small>{s.label}</Pill>)}</div>
          <button onClick={saveEdit} style={{width:"100%",padding:14,borderRadius:2,border:"none",background:T.text,color:T.bg,fontFamily:F.sans,fontSize:11,fontWeight:600,cursor:"pointer",letterSpacing:"0.1em"}}>{t("ЗАПАЗИ ПРОМЕНИТЕ")}</button>
        </div>}
      </div>
    </div>
  </div>);
}

function CompactOOTDCard({items,weather,onDismiss,calendar}){
  const T=useTheme(),t=useT(),[combo,setCombo]=useState(null),[show,setShow]=useState(true),[expanded,setExpanded]=useState(false);
  useEffect(()=>{if(items.length<2)return;const avail=items.filter(i=>!i.inLaundry);const combos=generateCombos(avail,"everyday",1,weather);if(combos.length>0)setCombo(combos[0]);},[items,weather]);
  if(!combo||!show||items.length<2)return null;
  const wornToday=calendar?.[todayKey()];
  return(<div style={{margin:"10px 14px 0",background:T.card,border:"1px solid "+T.borderLight,borderRadius:4,overflow:"hidden",boxShadow:T.shadow}}>
    <div onClick={()=>setExpanded(p=>!p)} style={{padding:"10px 14px 10px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",WebkitTapHighlightColor:"transparent",minHeight:44,boxSizing:"border-box"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontFamily:F.mono,fontSize:10,color:T.textDim,letterSpacing:"0.16em",flexShrink:0}}>ВИЗИЯ НА ДЕНЯ</span>
        {!expanded&&!wornToday&&<div style={{display:"flex",gap:3}}>{combo.items.slice(0,4).map(item=><div key={item.id} style={{width:26,height:26,borderRadius:2,overflow:"hidden",border:"1px solid "+T.border,flexShrink:0}}>{item.image?<img src={item.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:T.imgOpacity}}/>:<div style={{width:"100%",height:"100%",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:F.serif,fontSize:10,color:T.border}}>{CAT_MAP[item.category]?.label?.[0]}</span></div>}</div>)}</div>}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontFamily:F.sans,fontSize:10,color:T.textDim,transition:"transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",transform:expanded?"rotate(180deg)":"rotate(0deg)",display:"inline-block"}}>{"▾"}</span>
        <button onClick={(e)=>{e.stopPropagation();setShow(false);onDismiss?.();}} style={{background:"none",border:"none",cursor:"pointer",padding:4,color:T.textDim,fontSize:14,lineHeight:1}}>{"×"}</button>
      </div>
    </div>
    <div style={{maxHeight:expanded?250:0,opacity:expanded?1:0,overflow:"hidden",transition:"max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease"}}>
      <div style={{padding:"0 18px 14px"}}>
        <p style={{fontFamily:F.serif,fontSize:18,color:T.text,fontWeight:400,margin:"0 0 10px"}}>{wornToday?t("Вече отбеляза днешната визия"):t("Предложение за днес")}</p>
        {!wornToday&&<div style={{display:"flex",gap:2,height:90}}>{combo.items.slice(0,4).map(item=><div key={item.id} style={{flex:1,borderRadius:3,overflow:"hidden",border:"1px solid "+T.border}}>{item.image?<img src={item.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:T.imgOpacity}}/>:<div style={{width:"100%",height:"100%",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:F.serif,fontSize:20,color:T.border}}>{CAT_MAP[item.category]?.label?.[0]}</span></div>}</div>)}</div>}
      </div>
      <ColorBar items={combo.items}/>
    </div>
  </div>);
}

// === Calendar Modal ===
function CalendarModal({calendar,items,onClose,onUpdateCalendar}){
  const T=useTheme(),t=useT(),toast=useToast();const{settings}=useAuth()||{};const lang=settings?.language||"bg";
  const[month,setMonth]=useState(()=>{const d=new Date();return{y:d.getFullYear(),m:d.getMonth()};});
  const[selDay,setSelDay]=useState(null);
  const[showForm,setShowForm]=useState(false);
  const[evtOcc,setEvtOcc]=useState(null);
  const[evtNote,setEvtNote]=useState("");
  const[evtVenue,setEvtVenue]=useState("");
  const firstDay=new Date(month.y,month.m,1).getDay(),daysInMonth=new Date(month.y,month.m+1,0).getDate(),today=todayKey();
  const monthNames=[t("Януари"),t("Февруари"),t("Март"),t("Април"),t("Май"),t("Юни"),t("Юли"),t("Август"),t("Септември"),t("Октомври"),t("Ноември"),t("Декември")];
  const prevM=()=>{setMonth(p=>p.m===0?{y:p.y-1,m:11}:{...p,m:p.m-1});setSelDay(null);};
  const nextM=()=>{setMonth(p=>p.m===11?{y:p.y+1,m:0}:{...p,m:p.m+1});setSelDay(null);};
  const startIdx=firstDay===0?6:firstDay-1;
  const days=[];for(let i=0;i<startIdx;i++)days.push(null);for(let i=1;i<=daysInMonth;i++)days.push(i);
  const saveEvent=()=>{if(!evtOcc||!selDay)return;const evt={id:"evt_"+Date.now(),occasion:evtOcc,note:evtNote.trim()||null,venue:evtVenue.trim()||null};onUpdateCalendar(prev=>{const e=normCal(prev[selDay]);return{...prev,[selDay]:{...e,events:[...e.events,evt]}};});setShowForm(false);setEvtOcc(null);setEvtNote("");setEvtVenue("");toast(t("Събитие планирано"),"success");};
  const removeEvent=(dk,evtId)=>{onUpdateCalendar(prev=>{const e=normCal(prev[dk]);return{...prev,[dk]:{...e,events:e.events.filter(x=>x.id!==evtId)}};});};
  const toggleLaundryDay=(dk)=>{onUpdateCalendar(prev=>{const e=normCal(prev[dk]);return{...prev,[dk]:{...e,laundryDay:!e.laundryDay}};});};
  const inputSt={width:"100%",padding:"10px 14px",borderRadius:2,border:"1px solid "+T.border,fontSize:12,fontFamily:F.sans,color:T.text,background:"transparent",boxSizing:"border-box"};
  const selEntry=selDay?normCal(calendar?.[selDay]):null;
  const selWorn=selEntry?selEntry.worn.map(id=>items.find(x=>x.id===id)).filter(Boolean):[];
  const selNeedsWash=selWorn.filter(it=>(it.wearsSinceWash||0)>=LAUNDRY_THRESHOLD&&!it.inLaundry);
  const isFuture=selDay>today;
  return(<div style={{position:"fixed",inset:0,background:T.overlay,backdropFilter:"blur(16px)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center",animation:"fadeIn .2s"}} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{background:T.surface,borderRadius:"18px 18px 0 0",width:"100%",maxWidth:500,maxHeight:"85vh",overflow:"auto",animation:"slideUp .35s cubic-bezier(.23,1,.32,1)",padding:"20px 22px 34px"}}>
      <div style={{width:36,height:4,borderRadius:2,background:T.borderLight,margin:"0 auto 16px"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <button onClick={prevM} style={{background:"none",border:"none",color:T.textMuted,fontSize:18,cursor:"pointer",padding:8}}>{"←"}</button>
        <h3 style={{fontFamily:F.serif,fontSize:20,color:T.text,fontWeight:400,margin:0}}>{monthNames[month.m]} <span style={{fontFamily:F.mono,fontSize:16,fontWeight:400,letterSpacing:"0.04em"}}>{month.y}</span></h3>
        <button onClick={nextM} style={{background:"none",border:"none",color:T.textMuted,fontSize:18,cursor:"pointer",padding:8}}>{"→"}</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:8}}>
        {[t("Пн"),t("Вт"),t("Ср"),t("Чт"),t("Пт"),t("Сб"),t("Нд")].map(d=><div key={d} style={{textAlign:"center",padding:"4px 0",fontFamily:F.mono,fontSize:11,color:T.textDim,letterSpacing:"0.08em"}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {days.map((d,i)=>{if(!d)return<div key={"e"+i}/>;const dk=month.y+"-"+String(month.m+1).padStart(2,"0")+"-"+String(d).padStart(2,"0");const ce=normCal(calendar?.[dk]);const hasWorn=ce.worn.length>0;const hasEvt=ce.events.length>0;const hasLaundry=ce.laundryDay;const isToday=dk===today;const isSel=dk===selDay;
          return(<div key={i} onClick={()=>setSelDay(dk===selDay?null:dk)} style={{aspectRatio:"1",borderRadius:3,cursor:"pointer",border:isSel?"1.5px solid "+T.eventAccent:isToday?"1.5px solid "+T.text:hasEvt?"1px solid "+T.eventAccent:"1px solid "+T.border,background:hasWorn?T.glow:hasEvt?T.eventBg:"transparent",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",transition:"all 0.2s"}}>
            <span style={{fontFamily:F.mono,fontSize:10,color:hasWorn?T.text:hasEvt?T.eventText:T.textDim}}>{d}</span>
            {hasWorn&&<div style={{position:"absolute",bottom:2,display:"flex",gap:1}}>{ce.worn.slice(0,3).map((id,j)=>{const it=items.find(x=>x.id===id);return<div key={j} style={{width:5,height:5,borderRadius:1,background:it?.colors?.[0]||T.textDim}}/>;})}</div>}
            {hasEvt&&<div style={{position:"absolute",bottom:hasWorn?9:2,width:10,height:1.5,borderRadius:1,background:T.eventAccent}}/>}
            {hasLaundry&&<span style={{position:"absolute",top:1,right:2,fontFamily:F.mono,fontSize:7,color:T.washWarn}}>{"~"}</span>}
          </div>);})}
      </div>

      {/* Day detail panel */}
      {selDay&&<div style={{borderTop:"1px solid "+T.border,marginTop:16,paddingTop:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <span style={{fontFamily:F.mono,fontSize:11,color:T.textDim,letterSpacing:"0.1em"}}>{selDay}</span>
          <button onClick={()=>setSelDay(null)} style={{background:"none",border:"none",cursor:"pointer",color:T.textDim,fontFamily:F.mono,fontSize:14,padding:4}}>{"x"}</button>
        </div>

        {/* Worn items */}
        {selWorn.length>0&&<div style={{marginBottom:14}}>
          <p style={{fontFamily:F.mono,fontSize:9,color:T.textDim,letterSpacing:"0.14em",margin:"0 0 8px"}}>{t("ОБЛЕЧЕНО")}</p>
          <div style={{display:"flex",gap:4,overflowX:"auto"}}>{selWorn.map(item=><div key={item.id} style={{width:40,height:40,borderRadius:3,overflow:"hidden",border:"1px solid "+T.border,flexShrink:0}}>{item.image?<img src={item.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{width:"100%",height:"100%",background:T.subtleBg,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:F.mono,fontSize:8,color:T.textDim}}>{item.name?.[0]}</span></div>}</div>)}</div>
        </div>}

        {/* Planned events */}
        {selEntry.events.length>0&&<div style={{marginBottom:14}}>
          <p style={{fontFamily:F.mono,fontSize:9,color:T.eventText,letterSpacing:"0.14em",margin:"0 0 8px"}}>{t("ПЛАНИРАНО")}</p>
          {selEntry.events.map(evt=>{const occ=OCCASIONS.find(o=>o.id===evt.occasion);return<div key={evt.id} style={{padding:"10px 14px",background:T.eventBg,borderLeft:"2px solid "+T.eventAccent,marginBottom:6,borderRadius:"0 3px 3px 0"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontFamily:F.sans,fontSize:12,color:T.text}}>{occ?t(occ.label):evt.occasion}</span>
              <button onClick={()=>removeEvent(selDay,evt.id)} style={{background:"none",border:"none",cursor:"pointer",fontFamily:F.mono,fontSize:9,color:T.textDim,letterSpacing:"0.08em"}}>{t("ПРЕМАХНИ")}</button>
            </div>
            {evt.note&&<p style={{fontFamily:F.serif,fontSize:13,color:T.textSoft,margin:"4px 0 0"}}>{evt.note}</p>}
            {evt.venue&&<p style={{fontFamily:F.mono,fontSize:10,color:T.textDim,margin:"3px 0 0",textTransform:"uppercase",letterSpacing:"0.06em"}}>{evt.venue}</p>}
          </div>;})}
        </div>}

        {/* Needs wash */}
        {selNeedsWash.length>0&&<div style={{marginBottom:14}}>
          <p style={{fontFamily:F.mono,fontSize:9,color:T.washWarn,letterSpacing:"0.14em",margin:"0 0 8px"}}>{t("НУЖДАЕ СЕ ОТ ПРАНЕ")}</p>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{selNeedsWash.map(item=><span key={item.id} style={{fontFamily:F.sans,fontSize:11,color:T.textMuted,border:"1px solid "+T.border,padding:"4px 10px",borderRadius:2}}>{item.name}</span>)}</div>
        </div>}

        {/* Add event button (future only) */}
        {isFuture&&!showForm&&<button onClick={()=>setShowForm(true)} style={{width:"100%",padding:11,borderRadius:2,border:"1px solid "+T.eventAccent,background:"transparent",fontFamily:F.mono,fontSize:10,color:T.eventText,cursor:"pointer",letterSpacing:"0.08em",marginBottom:8}}>{"+ "+t("ПЛАНИРАЙ СЪБИТИЕ")}</button>}

        {/* Event form */}
        {showForm&&<div style={{background:T.subtleBg,padding:16,borderRadius:4,marginBottom:8}}>
          <p style={{fontFamily:F.mono,fontSize:9,color:T.textDim,letterSpacing:"0.16em",margin:"0 0 12px"}}>{t("НОВО СЪБИТИЕ")}</p>
          <div style={{display:"flex",gap:4,overflowX:"auto",marginBottom:12,paddingBottom:2}}>{OCCASIONS.map(o=><Pill key={o.id} active={evtOcc===o.id} onClick={()=>setEvtOcc(o.id)} small>{t(o.label)}</Pill>)}</div>
          <input value={evtNote} onChange={e=>setEvtNote(e.target.value.slice(0,200))} maxLength={200} placeholder={t("Бележка (по избор)")} style={{...inputSt,marginBottom:8}}/>
          {evtOcc&&<div style={{display:"flex",gap:6,marginBottom:8}}>
            <input value={evtVenue} onChange={e=>setEvtVenue(e.target.value.slice(0,100))} maxLength={100} placeholder={t("Място (по избор)")} style={{...inputSt,flex:1}}/>
            <button onClick={()=>setEvtVenue(getVenue(evtOcc,lang).name)} style={{background:"none",border:"1px solid "+T.border,borderRadius:2,width:36,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:T.textDim,flexShrink:0}}>{"↻"}</button>
          </div>}
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{setShowForm(false);setEvtOcc(null);setEvtNote("");setEvtVenue("");}} style={{flex:1,padding:10,borderRadius:2,border:"1px solid "+T.border,background:"transparent",fontFamily:F.mono,fontSize:10,color:T.textMuted,cursor:"pointer"}}>{t("ОТКАЗ")}</button>
            <button onClick={saveEvent} disabled={!evtOcc} style={{flex:1,padding:10,borderRadius:2,border:"none",background:evtOcc?T.text:T.border,fontFamily:F.mono,fontSize:10,color:evtOcc?T.bg:T.textDim,cursor:evtOcc?"pointer":"default",letterSpacing:"0.06em"}}>{t("ЗАПАЗИ")}</button>
          </div>
        </div>}

        {/* Laundry day toggle */}
        <button onClick={()=>toggleLaundryDay(selDay)} style={{width:"100%",padding:10,borderRadius:2,border:"1px solid "+(selEntry.laundryDay?T.washWarn:T.border),background:selEntry.laundryDay?T.washWarn+"10":"transparent",fontFamily:F.mono,fontSize:10,color:selEntry.laundryDay?T.washWarn:T.textDim,cursor:"pointer",letterSpacing:"0.08em"}}>{selEntry.laundryDay?"~ "+t("ДЕН ЗА ПРАНЕ")+" ("+t("ПРЕМАХНИ")+")":"~ "+t("ДЕН ЗА ПРАНЕ")}</button>
      </div>}
    </div>
  </div>);
}

// === WardrobeTab (with batch laundry) ===
function WardrobeTab({items,onDelete,onUpdate,weather,calendar,setCalendar,hideSeasonal,setHideSeasonal,onNavigateOutfit}){
  const T=useTheme(),toast=useToast(),t=useT();
  const[filter,setFilter]=useState("all");const[sort,setSort]=useState("newest");const[sel,setSel]=useState(null);const[search,setSearch]=useState("");const[ootdOff,setOotdOff]=useState(false);const[showCal,setShowCal]=useState(false);const[batchMode,setBatchMode]=useState(false);const[selected,setSelected]=useState(new Set());
  let displayItems=hideSeasonal?getSeasonalItems(items,true):items;
  let filtered=filter==="all"?displayItems:filter==="favorites"?displayItems.filter(i=>i.favorite):filter==="capsule"?displayItems.filter(i=>i.capsule):filter==="laundry"?displayItems.filter(i=>i.inLaundry):displayItems.filter(i=>i.category===filter);
  if(search){const q=search.toLowerCase();filtered=filtered.filter(i=>i.name.toLowerCase().includes(q)||i.brand?.toLowerCase().includes(q)||(i.tags||[]).some(t=>t.toLowerCase().includes(q)));}
  const sortFns={newest:(a,b)=>new Date(b.addedAt)-new Date(a.addedAt),most_worn:(a,b)=>(b.wearCount||0)-(a.wearCount||0),least_worn:(a,b)=>(a.wearCount||0)-(b.wearCount||0),name:(a,b)=>a.name.localeCompare(b.name),price:(a,b)=>(b.price||0)-(a.price||0)};
  filtered=[...filtered].sort(sortFns[sort]||sortFns.newest);
  const toggleFav=id=>{const itm=items.find(i=>i.id===id);if(itm){onUpdate(id,{favorite:!itm.favorite});toast(itm.favorite?"Премахнато от любими":"Добавено в любими ♥","success");}};
  const toggleSelect=id=>setSelected(p=>{const n=new Set(p);if(n.has(id))n.delete(id);else n.add(id);return n;});
  const batchLaundry=(toLaundry)=>{selected.forEach(id=>onUpdate(id,{inLaundry:toLaundry}));toast(toLaundry?selected.size+" в пералнята":selected.size+" обратно в гардероба","success");setSelected(new Set());setBatchMode(false);};
  const laundryCount=items.filter(i=>i.inLaundry).length;
  const handleItemClick=(item)=>{if(batchMode){toggleSelect(item.id);}else{setSel(item);}};
  return(<div style={{paddingBottom:90}}>
    <CompactDailyCard weather={weather} calendar={calendar} onGenerate={onNavigateOutfit}/>
    {!ootdOff&&<CompactOOTDCard items={items} weather={weather} onDismiss={()=>setOotdOff(true)} calendar={calendar}/>}
    <div style={{position:"sticky",top:"calc(env(safe-area-inset-top, 0px) + 56px)",zIndex:50,background:T.bg+"ee",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",padding:"12px 16px 0",marginTop:4}}>
      <div style={{display:"flex",gap:8,marginBottom:10,alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t("Търси...")} style={{flex:1,padding:"11px 16px",borderRadius:100,border:"1px solid "+T.pillBorder,fontSize:13,fontFamily:F.sans,color:T.text,background:T.pillBg,boxSizing:"border-box",minWidth:0}}/>
        <button onClick={()=>setShowCal(true)} style={{width:38,height:38,borderRadius:4,border:"1px solid "+T.pillBorder,background:"transparent",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.3s",overflow:"hidden",padding:0}}>
          <div style={{width:"100%",height:10,background:T.textDim,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:F.mono,fontSize:6,color:T.bg,letterSpacing:"0.1em",fontWeight:600,textTransform:"uppercase"}}>{[t("ЯНУ"),t("ФЕВ"),t("МАР"),t("АПР"),t("МАЙ"),t("ЮНИ"),t("ЮЛИ"),t("АВГ"),t("СЕП"),t("ОКТ"),t("НОЕ"),t("ДЕК")][new Date().getMonth()]}</span></div>
          <span style={{fontFamily:F.mono,fontSize:15,fontWeight:500,color:T.textMuted,lineHeight:1,marginTop:2}}>{new Date().getDate()}</span>
        </button>
      </div>
      <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:10,WebkitOverflowScrolling:"touch"}}>
        <Pill active={filter==="all"} onClick={()=>setFilter("all")} small>{t("Всички")}</Pill>
        <Pill active={filter==="favorites"} onClick={()=>setFilter("favorites")} small>♥</Pill>
        <Pill active={filter==="capsule"} onClick={()=>setFilter("capsule")} small>✦</Pill>
        {laundryCount>0&&<Pill active={filter==="laundry"} onClick={()=>setFilter("laundry")} small>~ {laundryCount}</Pill>}
        {CATEGORIES.map(cat=>{const cnt=displayItems.filter(i=>i.category===cat.id).length;if(!cnt)return null;return<Pill key={cat.id} active={filter===cat.id} onClick={()=>setFilter(cat.id)} small>{cat.label} {cnt}</Pill>;})}
        <span style={{width:1,flexShrink:0,background:T.border,margin:"4px 2px"}}/>
        {[{id:"newest",l:t("Скорошни")},{id:"most_worn",l:"↑"},{id:"least_worn",l:"↓"},{id:"price",l:t("Цена")},{id:"name",l:t("А-Я")}].map(s=><Pill key={s.id} active={sort===s.id} onClick={()=>setSort(s.id)} small>{s.l}</Pill>)}
      </div>
    </div>
    <div style={{padding:"0 16px"}}>
      {filtered.length===0?<EmptyState icon={items.length===0?"\u25A1":"\u25CB"} title={items.length===0?t("Гардеробът те чака"):t("Няма резултати")} sub={items.length===0?t("НАТИСНИ ДОБАВИ ЗА НАЧАЛО"):t("ОПИТАЙ С ДРУГИ ФИЛТРИ")}/>:
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10}}>{filtered.map((item,i)=><div key={item.id} style={{position:"relative"}}>{batchMode&&<div style={{position:"absolute",top:6,right:6,zIndex:10,width:22,height:22,borderRadius:"50%",border:"2px solid "+(selected.has(item.id)?T.text:T.border),background:selected.has(item.id)?T.text:T.subtleBg,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>{selected.has(item.id)&&<span style={{color:T.bg,fontSize:12}}>✓</span>}</div>}<ItemCard item={item} idx={i} onClick={()=>handleItemClick(item)} onDoubleTap={batchMode?toggleSelect:toggleFav}/></div>)}</div>}
    </div>
    {sel&&<Modal item={sel} onClose={()=>setSel(null)} onDelete={onDelete} onUpdate={(id,upd)=>{if(id==="__duplicate__"){/* handled via add */}else{onUpdate(id,upd);setSel(p=>p?({...p,...upd}):p);}}}/>}
    {showCal&&<CalendarModal calendar={calendar} items={items} onClose={()=>setShowCal(false)} onUpdateCalendar={setCalendar||((fn)=>{})}/>}
  </div>);
}

// === AddTab ===
function AddTab({onAdd,lastCat}){
  const T=useTheme(),toast=useToast(),t=useT();const{user,uploadItemImage}=useAuth()||{};
  const[step,setStep]=useState("photo");const[img,setImg]=useState(null);const[name,setName]=useState("");const[cat,setCat]=useState(lastCat||"");const[colors,setColors]=useState([]);const[style,setStyle]=useState("");const[season,setSeason]=useState("");const[mat,setMat]=useState("");const[brand,setBrand]=useState("");const[price,setPrice]=useState("");const[tags,setTags]=useState([]);const[tagIn,setTagIn]=useState("");const vidRef=useRef(null);const strRef=useRef(null);const fileRef=useRef(null);const[cam,setCam]=useState(false);const[err,setErr]=useState(null);
  const startCam=async()=>{try{setErr(null);if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){setErr(t("Камерата не е налична на това устройство"));return;}const s=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:"environment"},width:{ideal:1280},height:{ideal:960}}});strRef.current=s;setCam(true);requestAnimationFrame(()=>{requestAnimationFrame(()=>{if(vidRef.current&&strRef.current){vidRef.current.srcObject=strRef.current;vidRef.current.setAttribute("playsinline","true");vidRef.current.setAttribute("webkit-playsinline","true");vidRef.current.muted=true;vidRef.current.play().catch(()=>{});}});});}catch(e){setErr(t("Няма достъп до камерата. Разреши достъпа от настройките на браузъра."));}};
  const stopCam=()=>{if(strRef.current){strRef.current.getTracks().forEach(t=>t.stop());strRef.current=null;}setCam(false);};
  const capture=async()=>{const vid=vidRef.current;if(!vid||!vid.videoWidth)return;const c=document.createElement("canvas");c.width=vid.videoWidth;c.height=vid.videoHeight;c.getContext("2d").drawImage(vid,0,0);const d=await compress(c.toDataURL("image/jpeg",0.85));setImg(d);stopCam();setStep("details");};
  const handleFile=async(e)=>{const f=e.target.files?.[0];if(!f)return;if(!f.type.startsWith("image/")){toast(t("Грешка при запазване"),"error");return;}if(f.size>15*1024*1024){toast(t("Грешка при запазване"),"error");return;}const r=new FileReader();r.onload=async(ev)=>{const d=await compress(ev.target.result);setImg(d);stopCam();setStep("details");};r.readAsDataURL(f);};
  const toggleColor=(h)=>setColors(p=>p.includes(h)?p.filter(c=>c!==h):p.length>=3?p:[...p,h]);
  const addTag=()=>{const t=tagIn.trim().toLowerCase();if(t&&!tags.includes(t)&&tags.length<5){setTags(p=>[...p,t]);setTagIn("");}};
  const canSave=name.trim()&&cat&&colors.length>0&&style&&season;const[saving,setSaving]=useState(false);
  const save=async()=>{setSaving(true);try{const itemId=Date.now().toString();let imageUrl=img;if(img&&user&&uploadItemImage){const url=await uploadItemImage(itemId,img);if(url)imageUrl=url;}onAdd({id:itemId,image:imageUrl,name:name.trim(),category:cat,colors,style,season,material:mat||null,brand:brand||null,price:parseFloat(price)||0,tags,wearCount:0,favorite:false,capsule:false,inLaundry:false,lastWorn:null,addedAt:new Date().toISOString()});toast(t("Добавено в гардероба ✓"),"success");setStep("photo");setImg(null);setName("");setCat("");setColors([]);setStyle("");setSeason("");setMat("");setBrand("");setPrice("");setTags([]);}catch(e){console.warn("Save error:",e);toast(t("Грешка при запазване"),"error");}finally{setSaving(false);}};
  useEffect(()=>()=>stopCam(),[]);
  const inputSt={width:"100%",padding:"12px 18px",borderRadius:100,border:"1px solid "+T.pillBorder,fontSize:13,fontFamily:F.sans,color:T.text,background:T.pillBg,boxSizing:"border-box"};
  const labelSt={fontFamily:F.mono,fontSize:10,color:T.textDim,letterSpacing:"0.2em",display:"block",marginBottom:8,textTransform:"uppercase"};
  if(step==="photo"){return(<div style={{padding:"28px 20px"}}><p style={{...labelSt,marginBottom:4}}>{t("НОВА ДРЕХА")}</p><h2 style={{fontFamily:F.serif,fontSize:34,fontWeight:300,color:T.text,margin:"0 0 8px",letterSpacing:"-0.02em"}}>{t("Добави в гардероба")}</h2><div style={{width:40,height:1,background:"linear-gradient(90deg, "+T.text+" 0%, transparent 100%)",marginBottom:32}}/>
    {err&&<div style={{display:"flex",alignItems:"flex-start",gap:10,padding:"14px 16px",marginBottom:16,background:T.subtleBg,borderRadius:8,border:"1px solid "+T.border}}><span style={{fontSize:14,flexShrink:0}}>⚠</span><div><p style={{fontFamily:F.sans,fontSize:12,color:T.textMuted,margin:"0 0 6px",lineHeight:1.5}}>{err}</p><button onClick={()=>{setErr(null);fileRef.current?.click();}} style={{fontFamily:F.mono,fontSize:10,color:T.text,background:"none",border:"none",cursor:"pointer",padding:0,letterSpacing:"0.1em",textDecoration:"underline",textUnderlineOffset:3}}>{t("Качи от галерията")}</button></div></div>}
    {cam?(<div style={{borderRadius:12,overflow:"hidden",position:"relative"}}><video ref={vidRef} autoPlay playsInline muted onLoadedMetadata={e=>e.target.play().catch(()=>{})} style={{width:"100%",display:"block",background:"#000",minHeight:360,WebkitTransform:"translateZ(0)"}}/>
      <div style={{position:"absolute",top:14,left:0,right:0,textAlign:"center"}}><span style={{fontFamily:F.mono,fontSize:9,color:"rgba(255,255,255,0.6)",letterSpacing:"0.2em",textTransform:"uppercase",background:"rgba(0,0,0,0.4)",padding:"6px 14px",borderRadius:100}}>{t("Центрирай дрехата")}</span></div>
      <div style={{position:"absolute",bottom:0,left:0,right:0,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px 0 24px",background:"linear-gradient(transparent, rgba(0,0,0,0.6))"}}>
        <button onClick={stopCam} style={{position:"absolute",left:24,width:36,height:36,borderRadius:"50%",border:"1px solid rgba(255,255,255,0.3)",background:"rgba(0,0,0,0.4)",cursor:"pointer",fontSize:14,color:"rgba(255,255,255,0.7)",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        <button onClick={capture} style={{width:68,height:68,borderRadius:"50%",border:"3px solid rgba(255,255,255,0.9)",background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"transform 0.15s"}}><div style={{width:54,height:54,borderRadius:"50%",background:"rgba(255,255,255,0.9)"}}/></button>
      </div></div>):(<div style={{display:"flex",flexDirection:"column",gap:10}}>
      <p style={{fontFamily:F.sans,fontSize:12,color:T.textMuted,margin:"0 0 6px",lineHeight:1.5}}>{t("Снимката помага за по-точни комбинации")}</p>
      <button onClick={startCam} style={{padding:"32px 20px",borderRadius:8,border:"1.5px solid "+T.text,background:T.subtleBg,cursor:"pointer",textAlign:"center",transition:"all 0.3s",display:"flex",alignItems:"center",justifyContent:"center",gap:14}}><span style={{fontSize:22,opacity:0.35,filter:"grayscale(1)"}}>◉</span><div style={{textAlign:"left"}}><p style={{fontFamily:F.serif,fontSize:16,color:T.text,margin:0,fontWeight:400}}>{t("Снимай с камерата")}</p></div></button>
      <button onClick={()=>fileRef.current?.click()} style={{padding:"24px 20px",borderRadius:8,border:"1px solid "+T.border,background:T.subtleBg,cursor:"pointer",textAlign:"center",transition:"all 0.3s",display:"flex",alignItems:"center",justifyContent:"center",gap:14}}><span style={{fontSize:20,opacity:0.3}}>▢</span><div style={{textAlign:"left"}}><p style={{fontFamily:F.serif,fontSize:15,color:T.text,margin:0,fontWeight:300}}>{t("Качи от галерията")}</p></div></button>
      <div style={{display:"flex",alignItems:"center",gap:14,margin:"4px 0"}}><div style={{flex:1,height:1,background:T.border}}/><span style={{fontFamily:F.mono,fontSize:9,color:T.textDim,letterSpacing:"0.16em"}}>{t("ИЛИ")}</span><div style={{flex:1,height:1,background:T.border}}/></div>
      <button onClick={()=>{setImg(null);setStep("details");}} style={{padding:"12px",borderRadius:8,border:"none",background:"transparent",fontFamily:F.mono,fontSize:10,color:T.textMuted,letterSpacing:"0.12em",cursor:"pointer",textAlign:"center",textDecoration:"underline",textUnderlineOffset:3}}>{t("ПРОДЪЛЖИ БЕЗ СНИМКА")}</button>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{display:"none"}}/>
    </div>)}</div>);}
  return(<div style={{padding:"28px 20px 100px"}}>
    <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:8}}><button onClick={()=>{setStep("photo");setImg(null);}} style={{background:"none",border:"none",cursor:"pointer",padding:0,color:T.textMuted,fontSize:18,fontFamily:F.serif}}>←</button><div><p style={{...labelSt,margin:"0 0 2px"}}>{t("ДЕТАЙЛИ")}</p><h2 style={{fontFamily:F.serif,fontSize:24,fontWeight:300,color:T.text,margin:0,letterSpacing:"-0.01em"}}>{t("Опиши дрехата")}</h2></div></div>
    <div style={{width:40,height:1,background:"linear-gradient(90deg, "+T.text+" 0%, transparent 100%)",marginBottom:26}}/>
    {img&&<div style={{position:"relative",marginBottom:24}}><img src={img} alt="" style={{width:"100%",height:220,objectFit:"cover",borderRadius:8,opacity:T.imgOpacity}}/><button onClick={()=>setImg(null)} style={{position:"absolute",top:8,right:8,width:28,height:28,borderRadius:"50%",border:"none",background:"rgba(0,0,0,0.6)",color:"#fff",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button></div>}
    <p style={{fontFamily:F.mono,fontSize:9,color:T.textDim,letterSpacing:"0.2em",marginBottom:16,textTransform:"uppercase"}}>{t("ЗАДЪЛЖИТЕЛНИ ПОЛЕТА")}</p>
    <div style={{marginBottom:22}}><label style={labelSt}>{t("ИМЕ *")}</label><input value={name} onChange={e=>setName(e.target.value.slice(0,100))} placeholder={t("напр. Черна Nike Dri-FIT тениска")} maxLength={100} style={inputSt}/></div>
    <div style={{marginBottom:22}}><label style={labelSt}>{t("КАТЕГОРИЯ *")}</label><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>{CATEGORIES.map(c=><button key={c.id} onClick={()=>setCat(c.id)} style={{padding:"14px 5px",borderRadius:4,textAlign:"center",cursor:"pointer",border:cat===c.id?"1px solid "+T.text:"1px solid "+T.border,background:cat===c.id?T.pillBg:"transparent",transition:"all 0.3s"}}><div style={{fontFamily:F.serif,fontSize:12,fontWeight:cat===c.id?500:300,color:cat===c.id?T.text:T.textMuted,marginBottom:2}}>{c.label}</div><div style={{fontFamily:F.mono,fontSize:10,color:T.textDim,letterSpacing:"0.04em"}}>{c.sub}</div></button>)}</div></div>
    <div style={{marginBottom:22}}><label style={labelSt}>{t("ЦВЕТОВЕ * — ДО 3")}</label><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{COLORS.map(([hex])=><button key={hex} onClick={()=>toggleColor(hex)} style={{width:36,height:36,borderRadius:3,background:hex,cursor:"pointer",padding:0,border:colors.includes(hex)?"2px solid "+T.text:hex==="#FFFFFF"?"1px solid "+T.border:"1px solid transparent",transform:colors.includes(hex)?"scale(1.15)":"scale(1)",transition:"all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"}}/>)}</div>{colors.length>0&&<div style={{display:"flex",gap:4,marginTop:8}}>{colors.map(c=><span key={c} style={{fontFamily:F.mono,fontSize:10,border:"1px solid "+T.pillBorder,padding:"3px 10px",borderRadius:100,color:T.textMuted,letterSpacing:"0.06em",textTransform:"uppercase"}}>{getColorName(c)}</span>)}</div>}</div>
    <div style={{marginBottom:22}}><label style={labelSt}>{t("СТИЛ *")}</label><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{STYLES.map((s,i)=><Pill key={i} active={style===STYLE_IDS[i]} onClick={()=>setStyle(STYLE_IDS[i])} small>{s}</Pill>)}</div></div>
    <div style={{marginBottom:22}}><label style={labelSt}>{t("СЕЗОН *")}</label><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{SEASONS.map(s=><Pill key={s.id} active={season===s.id} onClick={()=>setSeason(s.id)} small>{s.label}</Pill>)}</div></div>
    <div style={{display:"flex",alignItems:"center",gap:14,margin:"28px 0 20px"}}><div style={{flex:1,height:1,background:T.border}}/><span style={{fontFamily:F.mono,fontSize:9,color:T.textDim,letterSpacing:"0.2em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{t("ДОПЪЛНИТЕЛНИ")}</span><div style={{flex:1,height:1,background:T.border}}/></div>
    <div style={{marginBottom:22}}><label style={labelSt}>{t("МАРКА")}</label><div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>{BRANDS.map(b=><button key={b} onClick={()=>setBrand(brand===b?"":b)} style={{padding:"5px 12px",borderRadius:100,border:brand===b?"1px solid "+T.text:"1px solid "+T.pillBorder,background:brand===b?T.pillBg:"transparent",fontFamily:F.mono,fontSize:10,color:brand===b?T.text:T.textDim,cursor:"pointer",letterSpacing:"0.04em",transition:"all 0.3s"}}>{b}</button>)}</div><input value={brand} onChange={e=>setBrand(e.target.value.slice(0,50))} maxLength={50} placeholder={t("Или напиши марка")} style={{...inputSt,fontSize:12}}/></div>
    <div style={{marginBottom:22}}><label style={labelSt}>{t("МАТЕРИАЛ")}</label><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{MATERIALS.map(m=><button key={m} onClick={()=>setMat(mat===m?"":m)} style={{padding:"5px 12px",borderRadius:100,border:mat===m?"1px solid "+T.text:"1px solid "+T.pillBorder,background:mat===m?T.pillBg:"transparent",fontFamily:F.mono,fontSize:10,color:mat===m?T.text:T.textDim,cursor:"pointer",letterSpacing:"0.04em",transition:"all 0.3s"}}>{m}</button>)}</div></div>
    <div style={{display:"flex",gap:10,marginBottom:24}}><div style={{flex:1}}><label style={labelSt}>{t("ЦЕНА")}</label><input type="number" value={price} onChange={e=>setPrice(e.target.value)} placeholder="0" style={{...inputSt,fontSize:12}}/></div><div style={{flex:2}}><label style={labelSt}>{t("ТАГОВЕ — ДО 5")}</label><div style={{display:"flex",gap:6}}><input value={tagIn} onChange={e=>setTagIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTag()} placeholder={t("#лято")} style={{...inputSt,fontSize:12,flex:1}}/><button onClick={addTag} style={{padding:"0 16px",borderRadius:100,border:"1px solid "+T.pillBorder,background:T.pillBg,color:T.textMuted,cursor:"pointer",fontFamily:F.mono,fontSize:10}}>+</button></div>{tags.length>0&&<div style={{display:"flex",gap:4,marginTop:7,flexWrap:"wrap"}}>{tags.map(t=><span key={t} onClick={()=>setTags(p=>p.filter(x=>x!==t))} style={{fontFamily:F.mono,fontSize:10,color:T.textMuted,background:T.pillBg,padding:"4px 10px",borderRadius:100,cursor:"pointer",border:"1px solid "+T.pillBorder}}>#{t} ×</span>)}</div>}</div></div>
    <button onClick={save} disabled={!canSave||saving} style={{width:"100%",padding:18,borderRadius:8,border:"none",background:canSave&&!saving?T.text:T.border,color:canSave&&!saving?T.bg:T.textDim,fontFamily:F.sans,fontSize:12,fontWeight:600,cursor:canSave&&!saving?"pointer":"not-allowed",letterSpacing:"0.14em",textTransform:"uppercase",transition:"all 0.3s",marginTop:8,opacity:saving?0.6:1}}>{saving?t("Запазване..."):("✓ "+t("Добави в гардероба"))}</button>
  </div>);
}

// === OutfitsTab ===
function OutfitsTab({items,onSave,weather,blacklist,addBlacklist,saved,onDeleteSaved,preGenOcc,onConsumePreGen}){
  const T=useTheme(),toast=useToast(),confirm=useConfirm(),t=useT();
  const{settings}=useAuth()||{};const lang=(settings?.language)||"bg";
  const[subTab,setSubTab]=useState("generate");
  const[occ,setOcc]=useState(null);const[results,setResults]=useState([]);const[idx,setIdx]=useState(0);const[anim,setAnim]=useState(false);const[swipeX,setSwipeX]=useState(0);const[venue,setVenue]=useState(null);const touchStart=useRef(null);
  const[sortBy,setSortBy]=useState("date");
  const sortedSaved=useMemo(()=>{const s=[...(saved||[])];if(sortBy==="score")s.sort((a,b)=>(b.score||0)-(a.score||0));else if(sortBy==="occasion")s.sort((a,b)=>(a.occasion||"").localeCompare(b.occasion||""));return s;},[saved,sortBy]);
  const gen=(id)=>{setOcc(id);setAnim(true);setVenue(getVenue(id,lang));setTimeout(()=>{const avail=items.filter(i=>!i.inLaundry);setResults(generateCombos(avail,id,8,weather,blacklist));setIdx(0);setAnim(false);},500);};
  useEffect(()=>{if(preGenOcc){setSubTab("generate");gen(preGenOcc);onConsumePreGen?.();}},[preGenOcc]);
  const next=()=>setIdx(p=>(p+1)%results.length);const prev=()=>setIdx(p=>p===0?results.length-1:p-1);
  const surprise=()=>{const ids=OCCASIONS.map(o=>o.id);gen(ids[Math.floor(Math.random()*ids.length)]);};
  const onTS=e=>{touchStart.current=e.touches[0].clientX;};const onTM=e=>{if(touchStart.current!==null)setSwipeX(e.touches[0].clientX-touchStart.current);};const onTE=()=>{if(Math.abs(swipeX)>60){swipeX>0?prev():next();}setSwipeX(0);touchStart.current=null;};
  const shareOutfit=async(cur)=>{const text="DRESHNIK.bg Визия\n\n"+cur.items.map(i=>i.name).join(" + ")+"\n\n"+getExplanation(cur,occ);if(navigator.share){try{await navigator.share({title:"DRESHNIK.bg",text});toast(t("Споделено ✓"),"success");}catch(e){console.warn(e);}}else{await navigator.clipboard?.writeText(text);toast(t("Копирано ✓"),"success");}};
  const cur=results[idx];
  const seasonLabel=new Date().getMonth()<2||new Date().getMonth()>10?"Зима":new Date().getMonth()<5?"Пролет":new Date().getMonth()<8?"Лято":"Есен";
  return(<div style={{padding:"28px 20px 100px"}}>
    {/* Editorial header */}
    <div style={{marginBottom:36}}>
      <p style={{fontFamily:F.mono,fontSize:10,letterSpacing:"0.3em",color:T.textDim,marginBottom:8,textTransform:"uppercase"}}>{t("Сезон")} {t(seasonLabel)} · {new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"2-digit",year:"numeric"})}</p>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
        <h2 style={{fontFamily:F.serif,fontSize:38,fontWeight:300,color:T.text,margin:0,letterSpacing:"-0.02em",lineHeight:1.1}}>{t("Стилист")}</h2>
        {items.length>=2&&<button onClick={surprise} style={{padding:"8px 16px",borderRadius:100,border:"1px solid "+T.pillBorder,background:T.pillBg,cursor:"pointer",fontFamily:F.mono,fontSize:10,color:T.textMuted,letterSpacing:"0.06em"}}>{t("ИЗНЕНАДА")}</button>}
      </div>
      <div style={{width:40,height:1,background:"linear-gradient(90deg, "+T.text+" 0%, transparent 100%)",marginTop:14}}/>
    </div>

    {/* Sub-tab navigation */}
    <div style={{display:"flex",gap:0,marginBottom:28,borderBottom:"1px solid "+T.border}}>
      {[{id:"generate",l:t("Генерирай")},{id:"saved",l:t("Запазени")+" ("+(saved?.length||0)+")"}].map(s=><button key={s.id} onClick={()=>setSubTab(s.id)} style={{padding:"12px 20px 14px",border:"none",background:"none",borderBottom:subTab===s.id?"1px solid "+T.text:"1px solid transparent",fontFamily:F.serif,fontSize:subTab===s.id?14:13,color:subTab===s.id?T.text:T.textDim,cursor:"pointer",fontWeight:subTab===s.id?500:300,letterSpacing:"0.02em",transition:"all 0.3s"}}>{s.l}</button>)}
    </div>

    {subTab==="generate"&&<>
    {/* Weather pill */}
    {weather&&<div style={{display:"inline-flex",alignItems:"center",gap:10,padding:"10px 18px",background:T.pillBg,border:"1px solid "+T.pillBorder,borderRadius:100,marginBottom:32}}>
      <span style={{fontSize:16}}>{weather.icon}</span>
      <span style={{fontFamily:F.sans,fontSize:12,color:T.textMuted,fontWeight:400}}>{weather.temp}° {t(weather.desc)}{weather.city?" / "+weather.city:""}{weather.rain?" "+t("— режим за дъжд"):""}</span>
    </div>}

    {items.length<2&&<EmptyState icon="✦" title={t("Добави поне 2 дрехи")} sub={t("ЗА ДА ГЕНЕРИРАШ ВИЗИИ")}/>}

    {/* Occasions — editorial horizontal scroll */}
    <div style={{display:"flex",gap:0,marginBottom:36,overflowX:"auto",paddingBottom:4}}>{OCCASIONS.map(o=><button key={o.id} onClick={()=>gen(o.id)} disabled={items.length<2} style={{padding:"16px 20px",background:"transparent",border:"none",borderBottom:occ===o.id?"1px solid "+T.text:"1px solid transparent",cursor:items.length<2?"not-allowed":"pointer",whiteSpace:"nowrap",transition:"all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",opacity:items.length<2?0.3:1}}>
      <span style={{fontFamily:F.serif,fontSize:occ===o.id?15:13,color:occ===o.id?T.text:T.textDim,fontWeight:occ===o.id?500:300,letterSpacing:"0.02em",transition:"all 0.3s"}}>{t(o.label)}</span>
    </button>)}</div>

    {/* Loading animation */}
    {anim&&<div style={{textAlign:"center",padding:48}}><div style={{width:40,height:1,background:"linear-gradient(90deg, transparent, "+T.text+", transparent)",margin:"0 auto 16px",animation:"pulse 1.2s ease-in-out infinite"}}/><p style={{fontFamily:F.mono,fontSize:10,color:T.textDim,letterSpacing:"0.2em"}}>{t("АНАЛИЗИРАМ КОМБИНАЦИИ")}</p></div>}

    {/* No results message */}
    {!anim&&occ&&results.length===0&&<EmptyState icon="\u25CB" title={t("Няма комбинации")} sub={t("ДОБАВИ ДРЕХИ ОТ РАЗЛИЧНИ КАТЕГОРИИ")}/>}

    {/* Results */}
    {!anim&&cur&&<div style={{animation:"fadeIn .5s ease"}} onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={onTE}>
      {/* Outfit counter — editorial number */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:20}}>
        <p style={{fontFamily:F.serif,fontSize:24,color:T.text,fontWeight:300,margin:0}}>
          {t("Визия")} <span style={{fontFamily:F.mono,fontSize:14,color:T.textMuted}}>{String(idx+1).padStart(2,"0")}</span>
          <span style={{fontFamily:F.mono,fontSize:11,color:T.textDim}}> / {String(results.length).padStart(2,"0")}</span>
        </p>
        <div style={{display:"flex",gap:3}}>{results.map((_,i)=><div key={i} style={{width:i===idx?20:4,height:2,background:i===idx?T.text:T.border,borderRadius:1,transition:"width 0.5s cubic-bezier(0.16, 1, 0.3, 1)"}}/>)}</div>
      </div>

      {/* Items — asymmetric editorial grid */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:24}}>
        {cur.items.map((item,i)=><div key={item.id} style={{background:T.card,borderRadius:4,overflow:"hidden",border:"1px solid "+T.border,gridRow:i===0&&cur.items.length>2?"span 2":"auto",animation:"fadeInUp "+(0.15+i*0.1)+"s ease both"}}>
          {item.image?<img src={item.image} alt="" style={{width:"100%",height:i===0&&cur.items.length>2?280:165,objectFit:"cover",opacity:T.imgOpacity,display:"block"}}/>
          :<div style={{width:"100%",height:i===0&&cur.items.length>2?280:165,background:"linear-gradient(145deg, "+(item.colors?.[0]||"#222")+"22 0%, "+T.bg+" 100%)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{width:40,height:40,borderRadius:"50%",background:item.colors?.[0]||"#333",opacity:0.5,border:item.colors?.[0]==="#000000"?"1px solid #222":"none"}}/>
          </div>}
          <div style={{padding:"12px 14px"}}>
            <p style={{fontSize:11,fontWeight:500,color:T.textSoft,margin:"0 0 3px",fontFamily:F.sans,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</p>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <p style={{fontFamily:F.mono,fontSize:10,color:T.textDim,margin:0,letterSpacing:"0.08em"}}>{(item.brand||"").toUpperCase()}</p>
              <div style={{display:"flex",gap:2}}>{item.colors?.slice(0,3).map((c,j)=><div key={j} style={{width:8,height:8,borderRadius:1,background:c}}/>)}</div>
            </div>
          </div>
        </div>)}
      </div>

      <ColorBar items={cur.items}/>

      {/* Explanation — editorial left-border quote */}
      <div style={{padding:"22px 24px",background:T.subtleBg,borderLeft:"2px solid "+T.text,margin:"20px 0 28px"}}>
        <p style={{fontFamily:F.serif,fontSize:15,color:T.textSoft,lineHeight:1.8,margin:"0 0 14px"}}>{getExplanation(cur,occ)}</p>
        <p style={{fontFamily:F.serif,fontSize:13,color:T.textDim,fontStyle:"italic",margin:0,lineHeight:1.6}}>„{getTip(occ)}"</p>
      </div>

      {/* Venue recommendation */}
      {venue&&<div style={{padding:"16px 20px",background:T.pillBg,border:"1px solid "+T.pillBorder,borderRadius:4,marginBottom:20}}>
        <div style={{flex:1}}>
          <p style={{fontFamily:F.mono,fontSize:9,color:T.textDim,letterSpacing:"0.14em",margin:"0 0 3px",textTransform:"uppercase"}}>{lang==="en"?"WHERE TO GO":"КЪДЕ ДА ОТИДЕШ"}</p>
          <p style={{fontFamily:F.serif,fontSize:16,color:T.text,fontWeight:400,margin:"0 0 2px"}}>{venue.name}</p>
          <p style={{fontFamily:F.mono,fontSize:10,color:T.textMuted,margin:0,letterSpacing:"0.06em",textTransform:"uppercase"}}>{venue.type}</p>
        </div>
        <button onClick={()=>setVenue(getVenue(occ,lang))} style={{background:"none",border:"1px solid "+T.border,borderRadius:"50%",width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:T.textDim,flexShrink:0}}>↻</button>
      </div>}

      {/* Swipe hint */}
      <p style={{fontFamily:F.mono,fontSize:10,color:T.textDim,textAlign:"center",letterSpacing:"0.16em",marginBottom:14}}>{t("ПЛЪЗНИ ЗА СЛЕДВАЩА")}</p>

      {/* Actions — editorial buttons */}
      <div style={{display:"flex",gap:8}}>
        <button onClick={next} style={{flex:1,padding:"16px 0",borderRadius:3,border:"1px solid "+T.border,background:"transparent",fontFamily:F.sans,fontSize:11,color:T.textMuted,cursor:"pointer",letterSpacing:"0.1em",fontWeight:500,transition:"all 0.3s"}}>{t("Следваща")}</button>
        <button onClick={()=>{onSave({id:Date.now().toString(),occasion:OCCASIONS.find(x=>x.id===occ)?.label||occ,itemIds:cur.items.map(i=>i.id),reasoning:getExplanation(cur,occ),tips:getTip(occ),score:cur.score,savedAt:new Date().toISOString()});toast(t("Визия запазена ✓"),"success");}} style={{flex:1,padding:"16px 0",borderRadius:3,border:"none",background:T.text,color:T.bg,fontFamily:F.sans,fontSize:11,fontWeight:600,cursor:"pointer",letterSpacing:"0.12em",transition:"all 0.3s"}}>{t("Запази")}</button>
      </div>
      <div style={{display:"flex",gap:8,marginTop:8}}>
        <button onClick={()=>shareOutfit(cur)} style={{flex:1,padding:"14px 0",borderRadius:3,border:"1px solid "+T.border,background:"transparent",fontFamily:F.mono,fontSize:10,color:T.textDim,cursor:"pointer",letterSpacing:"0.08em"}}>{t("СПОДЕЛИ")}</button>
        <button onClick={()=>{const key=cur.items.map(i=>i.id).sort().join(",");addBlacklist(key);next();toast(t("Комбинацията няма да се предлага"),"info");}} style={{flex:1,padding:"14px 0",borderRadius:3,border:"1px solid "+T.danger,background:"transparent",fontFamily:F.mono,fontSize:10,color:T.dangerText,cursor:"pointer",letterSpacing:"0.08em"}}>{t("НЕ ПРЕДЛАГАЙ")}</button>
      </div>
    </div>}
    </>}

    {subTab==="saved"&&<>
      {(!saved||!saved.length)?<EmptyState icon="♡" title={t("Няма запазени визии")} sub={t("ГЕНЕРИРАЙ И ЗАПАЗИ ВИЗИИ")}/>:
      <>
        <div style={{display:"flex",gap:0,marginBottom:20,borderBottom:"1px solid "+T.border}}>{[{id:"date",l:t("По дата")},{id:"score",l:t("По оценка")},{id:"occasion",l:t("По повод")}].map(s=><button key={s.id} onClick={()=>setSortBy(s.id)} style={{padding:"12px 18px 14px",border:"none",background:"none",borderBottom:sortBy===s.id?"1px solid "+T.text:"1px solid transparent",fontFamily:F.serif,fontSize:sortBy===s.id?13:12,color:sortBy===s.id?T.text:T.textDim,cursor:"pointer",fontWeight:sortBy===s.id?500:300,letterSpacing:"0.02em",transition:"all 0.3s"}}>{s.l}</button>)}</div>
        <div style={{display:"flex",flexDirection:"column",gap:11}}>{sortedSaved.map(outfit=>{const oi=outfit.itemIds.map(id=>items.find(i=>i.id===id)).filter(Boolean);return(<div key={outfit.id} style={{background:T.card,borderRadius:4,border:"1px solid "+T.border,overflow:"hidden"}}>
          <div style={{display:"flex",gap:1,height:100}}>{oi.slice(0,4).map(item=><div key={item.id} style={{flex:1}}>{item.image?<img src={item.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:T.imgOpacity}}/>:<div style={{width:"100%",height:"100%",background:T.surface,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:F.serif,fontSize:22,color:T.border}}>{CAT_MAP[item.category]?.label?.[0]}</span></div>}</div>)}</div>
          <ColorBar items={oi}/><div style={{padding:"12px 14px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontFamily:F.mono,fontSize:10,color:T.textMuted,letterSpacing:"0.1em",textTransform:"uppercase",border:"1px solid "+T.border,padding:"3px 9px",borderRadius:2}}>{outfit.occasion}</span><button onClick={()=>confirm(t("Изтрий тази визия?"),()=>onDeleteSaved(outfit.id))} style={{background:"none",border:"none",cursor:"pointer",color:T.dangerText,fontSize:14,padding:4}}>×</button></div><p style={{fontSize:12,color:T.textMuted,margin:0,lineHeight:1.6,fontFamily:F.sans}}>{outfit.reasoning}</p></div>
        </div>);})}</div>
      </>}
    </>}
  </div>);
}

// === SavedTab ===
function SavedTab({saved,items,onDelete}){
  const T=useTheme(),confirm=useConfirm(),t=useT();
  const[sortBy,setSortBy]=useState("date");
  const sorted=useMemo(()=>{const s=[...saved];if(sortBy==="score")s.sort((a,b)=>(b.score||0)-(a.score||0));else if(sortBy==="occasion")s.sort((a,b)=>(a.occasion||"").localeCompare(b.occasion||""));return s;},[saved,sortBy]);
  if(!saved.length)return(<EmptyState icon="♡" title={t("Няма запазени визии")} sub={t("ЗАПАЗИ ОТ ТАБА СТИЛ")}/>);
  return(<div style={{padding:"28px 20px 100px"}}><p style={{fontFamily:F.mono,fontSize:10,letterSpacing:"0.3em",color:T.textDim,marginBottom:8}}>{t("КОЛЕКЦИЯ")}</p><h2 style={{fontFamily:F.serif,fontSize:34,fontWeight:300,color:T.text,margin:"0 0 6px",letterSpacing:"-0.02em"}}>{t("Запазени визии")}</h2><div style={{width:40,height:1,background:"linear-gradient(90deg, "+T.text+" 0%, transparent 100%)",marginBottom:22}}/>
    <div style={{display:"flex",gap:0,marginBottom:20,borderBottom:"1px solid "+T.border}}>{[{id:"date",l:t("По дата")},{id:"score",l:t("По оценка")},{id:"occasion",l:t("По повод")}].map(s=><button key={s.id} onClick={()=>setSortBy(s.id)} style={{padding:"12px 18px 14px",border:"none",background:"none",borderBottom:sortBy===s.id?"1px solid "+T.text:"1px solid transparent",fontFamily:F.serif,fontSize:sortBy===s.id?13:12,color:sortBy===s.id?T.text:T.textDim,cursor:"pointer",fontWeight:sortBy===s.id?500:300,letterSpacing:"0.02em",transition:"all 0.3s"}}>{s.l}</button>)}</div>
    <div style={{display:"flex",flexDirection:"column",gap:11}}>{sorted.map(outfit=>{const oi=outfit.itemIds.map(id=>items.find(i=>i.id===id)).filter(Boolean);return(<div key={outfit.id} style={{background:T.card,borderRadius:4,border:"1px solid "+T.border,overflow:"hidden"}}>
      <div style={{display:"flex",gap:1,height:100}}>{oi.slice(0,4).map(item=><div key={item.id} style={{flex:1}}>{item.image?<img src={item.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:T.imgOpacity}}/>:<div style={{width:"100%",height:"100%",background:T.surface,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:F.serif,fontSize:22,color:T.border}}>{CAT_MAP[item.category]?.label?.[0]}</span></div>}</div>)}</div>
      <ColorBar items={oi}/><div style={{padding:"12px 14px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontFamily:F.mono,fontSize:10,color:T.textMuted,letterSpacing:"0.1em",textTransform:"uppercase",border:"1px solid "+T.border,padding:"3px 9px",borderRadius:2}}>{outfit.occasion}</span><button onClick={()=>confirm(t("Изтрий тази визия?"),()=>onDelete(outfit.id))} style={{background:"none",border:"none",cursor:"pointer",color:T.dangerText,fontSize:14,padding:4}}>×</button></div><p style={{fontSize:12,color:T.textMuted,margin:0,lineHeight:1.6,fontFamily:F.sans}}>{outfit.reasoning}</p></div>
    </div>);})}</div></div>);
}

// === InsightsTab (editorial) ===
function getWeeklyChallenges(items,calendar,t){
  const now=new Date();const soy=new Date(now.getFullYear(),0,1);const weekNum=Math.floor(((now-soy)/86400000+soy.getDay())/7);
  const leastWorn=[...items].filter(i=>!i.inLaundry).sort((a,b)=>(a.wearCount||0)-(b.wearCount||0));
  const lwName=leastWorn[0]?.name||t("най-малко носената дреха");
  const weekStart=new Date(now);weekStart.setDate(now.getDate()-((now.getDay()+6)%7));weekStart.setHours(0,0,0,0);
  let weekItems=new Set(),weekDaysActive=0;
  for(let i=0;i<7;i++){const d=new Date(weekStart);d.setDate(d.getDate()+i);if(d>now)break;const dk=dateKey(d);const entry=normCal(calendar?.[dk]);if(entry.worn.length>0){weekDaysActive++;entry.worn.forEach(id=>weekItems.add(id));}}
  const pool=[
    {title:t("Минималист"),desc:t("Носи само от 5 артикула тази седмица"),progress:weekItems.size<=5&&weekDaysActive>0?weekDaysActive:0,max:5,done:weekItems.size<=5&&weekDaysActive>=5,icon:"\u25C7"},
    {title:t("Нова комбинация"),desc:t("Създай и запази нова визия"),progress:0,max:1,done:false,icon:"\u2726"},
    {title:t("Забравеният артикул"),desc:t("Носи ")+lwName,progress:(()=>{if(!leastWorn[0])return 0;const id=leastWorn[0].id;for(let i=0;i<7;i++){const d=new Date(weekStart);d.setDate(d.getDate()+i);if(d>now)break;const dk=dateKey(d);if(normCal(calendar?.[dk]).worn.includes(id))return 1;}return 0;})(),max:1,done:false,icon:"\u21BA"},
    {title:t("Капсулна седмица"),desc:t("Носи само капсулни артикули 3 дни"),progress:(()=>{let cd=0;for(let i=0;i<7;i++){const d=new Date(weekStart);d.setDate(d.getDate()+i);if(d>now)break;const dk=dateKey(d);const e=normCal(calendar?.[dk]);if(e.worn.length>0&&e.worn.every(id=>items.find(it=>it.id===id)?.capsule))cd++;}return cd;})(),max:3,done:false,icon:"\u2727"},
    {title:t("Цветен ден"),desc:t("Носи 3 артикула с различни цветове"),progress:0,max:1,done:false,icon:"\u25D0"},
    {title:t("Серия 5"),desc:t("5 поредни дни с отбелязване"),progress:Math.min(weekDaysActive,5),max:5,done:weekDaysActive>=5,icon:"\u25AA"},
  ];
  pool[2].done=pool[2].progress>=pool[2].max;pool[3].done=pool[3].progress>=pool[3].max;
  const selected=[];const indices=[];
  for(let i=0;i<3;i++){let idx=(weekNum*3+i+weekNum%(pool.length-i))%pool.length;while(indices.includes(idx))idx=(idx+1)%pool.length;indices.push(idx);selected.push(pool[idx]);}
  return selected;
}

function InsightsTab({items,saved,calendar}){
  const T=useTheme(),cur=useCurrency(),t=useT();
  const now=Date.now();
  const totalWears=items.reduce((a,i)=>a+(i.wearCount||0),0);const totalValue=items.reduce((a,i)=>a+(i.price||0),0);const avgCPW=totalWears>0?(totalValue/totalWears).toFixed(0):0;
  const mostWorn=[...items].sort((a,b)=>(b.wearCount||0)-(a.wearCount||0)).slice(0,3);const neverWorn=items.filter(i=>!i.wearCount);const capsuleItems=items.filter(i=>i.capsule);const laundryItems=items.filter(i=>i.inLaundry);
  const catBreakdown=CATEGORIES.map(c=>({...c,count:items.filter(i=>i.category===c.id).length,value:items.filter(i=>i.category===c.id).reduce((a,i)=>a+(i.price||0),0)})).filter(c=>c.count>0);
  const styleBreakdown=STYLES.map((s,i)=>({label:s,id:STYLE_IDS[i],count:items.filter(it=>it.style===STYLE_IDS[i]).length})).filter(s=>s.count>0).sort((a,b)=>b.count-a.count);
  const colorFreq={};items.forEach(i=>(i.colors||[]).forEach(c=>{colorFreq[c]=(colorFreq[c]||0)+1;}));const topColors=Object.entries(colorFreq).sort((a,b)=>b[1]-a[1]).slice(0,10);const maxCat=Math.max(...catBreakdown.map(c=>c.count),1);
  const withCPW=items.filter(i=>i.price>0&&i.wearCount>0).map(i=>({...i,cpw:(i.price/i.wearCount).toFixed(0)})).sort((a,b)=>a.cpw-b.cpw);const bestCPW=withCPW.slice(0,3);
  // A1: Sustainability + Forgotten
  const forgotten=items.filter(i=>i.lastWorn&&(now-new Date(i.lastWorn).getTime())>60*86400000).sort((a,b)=>new Date(a.lastWorn)-new Date(b.lastWorn)).slice(0,8);
  const activeItems30=items.filter(i=>i.lastWorn&&new Date(i.lastWorn).getTime()>now-30*86400000).length;
  const activeItems60=items.filter(i=>i.lastWorn&&new Date(i.lastWorn).getTime()>now-60*86400000).length;
  const susScore=items.length>0?Math.round((activeItems30/items.length)*100):0;
  // A2: Value + Heatmap
  const catByValue=[...catBreakdown].sort((a,b)=>b.value-a.value);const mostExpCat=catByValue[0]||null;const leastExpCat=catByValue.length>1?catByValue[catByValue.length-1]:null;
  const worstCPW=items.filter(i=>i.price>0&&i.wearCount>0).map(i=>({...i,cpw:Math.round(i.price/i.wearCount)})).sort((a,b)=>b.cpw-a.cpw).slice(0,3);
  const avgItemValue=items.length>0?Math.round(totalValue/items.length):0;
  const heatmapData=useMemo(()=>{const days=[];const td=new Date();for(let i=89;i>=0;i--){const d=new Date(td);d.setDate(d.getDate()-i);const dk=dateKey(d);const entry=normCal(calendar?.[dk]);days.push({date:dk,count:entry.worn.length});}return days;},[calendar]);
  const maxDayWears=Math.max(...heatmapData.map(d=>d.count),1);const totalActiveDays=heatmapData.filter(d=>d.count>0).length;
  // A3: Streak
  const streakData=useMemo(()=>{const td=new Date();let cur=0;for(let i=0;i<=365;i++){const d=new Date(td);d.setDate(d.getDate()-i);const dk=dateKey(d);const entry=normCal(calendar?.[dk]);if(entry.worn.length>0)cur++;else if(i===0)continue;else break;}let best=0,run=0;const allDates=Object.keys(calendar||{}).sort();if(allDates.length>0){const start=new Date(allDates[0]);const end=td;for(let d=new Date(start);d<=end;d.setDate(d.getDate()+1)){const dk=dateKey(d);const entry=normCal(calendar?.[dk]);if(entry.worn.length>0){run++;best=Math.max(best,run);}else run=0;}}return{current:cur,longest:Math.max(best,cur)};},[calendar]);
  // A4: Challenges
  const challenges=useMemo(()=>getWeeklyChallenges(items,calendar,t),[items,calendar]);
  // Achievements (expanded to 12)
  const uniqueCats=new Set(items.map(i=>i.category)).size;const everyItemWorn=items.length>0&&items.every(i=>(i.wearCount||0)>0);const avgCPWNum=totalWears>0?totalValue/totalWears:Infinity;const itemsWith3Plus=items.filter(i=>(i.wearCount||0)>=3).length;
  const achievements=[
    {name:t("Първи стъпки"),desc:t("Добави 10 дрехи"),done:items.length>=10,cur:Math.min(items.length,10),max:10},
    {name:t("Стилист"),desc:t("Запази 10 визии"),done:saved.length>=10,cur:Math.min(saved.length,10),max:10},
    {name:t("Гардеробмания"),desc:t("50 общо носения"),done:totalWears>=50,cur:Math.min(totalWears,50),max:50},
    {name:t("Капсула"),desc:t("5 капсулни парчета"),done:capsuleItems.length>=5,cur:Math.min(capsuleItems.length,5),max:5},
    {name:t("Колорист"),desc:t("10+ различни цвята"),done:Object.keys(colorFreq).length>=10,cur:Math.min(Object.keys(colorFreq).length,10),max:10},
    {name:t("Фотограф"),desc:t("Снимки на 20 дрехи"),done:items.filter(i=>i.image).length>=20,cur:Math.min(items.filter(i=>i.image).length,20),max:20},
    {name:t("Пълен гардероб"),desc:t("Дрехи от всички категории"),done:uniqueCats>=CATEGORIES.length,cur:uniqueCats,max:CATEGORIES.length},
    {name:t("Нищо забравено"),desc:t("Носи всяка дреха поне веднъж"),done:everyItemWorn,cur:items.filter(i=>(i.wearCount||0)>0).length,max:items.length||1},
    {name:t("Инвеститор"),desc:t("Средна цена/носене под 5\u20AC"),done:avgCPWNum<=5&&totalWears>0,cur:avgCPWNum<=5&&totalWears>0?1:0,max:1},
    {name:t("Серия 7"),desc:t("7 дни поредни носения"),done:streakData.longest>=7,cur:Math.min(streakData.longest,7),max:7},
    {name:t("Маратонец"),desc:t("30 дни поредни носения"),done:streakData.longest>=30,cur:Math.min(streakData.longest,30),max:30},
    {name:t("Перфекционист"),desc:t("Носи 10 дрехи 3+ пъти"),done:itemsWith3Plus>=10,cur:Math.min(itemsWith3Plus,10),max:10},
  ];
  if(items.length===0)return(<EmptyState icon="\u25CB" title={t("Добави дрехи за анализ")} sub={t("ПОРТРЕТЪТ ЩЕ СЕ ПОЯВИ ТУК")}/>);
  const Section=({title,children})=>(<div style={{background:T.subtleBg,borderLeft:"2px solid "+T.text,padding:"18px 22px",marginBottom:16}}><p style={{fontFamily:F.mono,fontSize:10,color:T.textDim,letterSpacing:"0.16em",margin:"0 0 14px"}}>{title}</p>{children}</div>);
  return(<div style={{padding:"28px 20px 100px"}}><p style={{fontFamily:F.mono,fontSize:10,letterSpacing:"0.3em",color:T.textDim,marginBottom:8}}>{t("АНАЛИЗ НА ГАРДЕРОБА")}</p><h2 style={{fontFamily:F.serif,fontSize:34,fontWeight:300,color:T.text,margin:"0 0 6px",letterSpacing:"-0.02em"}}>{t("Портрет")}</h2><div style={{width:40,height:1,background:"linear-gradient(90deg, "+T.text+" 0%, transparent 100%)",marginBottom:24}}/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(80px,1fr))",gap:6,marginBottom:18}}>{[{n:items.length,l:t("ДРЕХИ")},{n:totalWears,l:t("НОСЕНИЯ")},{n:saved.length,l:t("ВИЗИИ")},{n:totalValue>0?cur+totalValue:"\u2014",l:t("СТОЙНОСТ")}].map((d,i)=><div key={i} style={{background:T.subtleBg,border:"1px solid "+T.border,borderRadius:4,padding:"18px 8px",textAlign:"center"}}><p style={{fontFamily:F.mono,fontSize:24,color:T.text,margin:"0 0 3px",fontWeight:400}}>{d.n}</p><p style={{fontFamily:F.mono,fontSize:10,color:T.textDim,letterSpacing:"0.14em",margin:0}}>{d.l}</p></div>)}</div>

    {items.length>=5&&<Section title={t("УСТОЙЧИВОСТ")}><div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:10}}><span style={{fontFamily:F.serif,fontSize:36,color:T.text,fontWeight:300}}>{susScore}%</span><span style={{fontFamily:F.mono,fontSize:10,color:T.textDim,letterSpacing:"0.08em"}}>{t("АКТИВЕН ГАРДЕРОБ")}</span></div><div style={{height:4,background:T.border,borderRadius:2,overflow:"hidden",marginBottom:8}}><div style={{width:susScore+"%",height:"100%",background:susScore>=70?T.successText:susScore>=40?T.washWarn:T.dangerText,borderRadius:2,transition:"width 0.5s"}}/></div><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontFamily:F.mono,fontSize:9,color:T.textDim,letterSpacing:"0.06em"}}>{activeItems30} / {items.length} {t("последни 30 дни")}</span><span style={{fontFamily:F.mono,fontSize:9,color:T.textDim,letterSpacing:"0.06em"}}>{activeItems60} / {items.length} {t("последни 60 дни")}</span></div></Section>}

    <Section title={t("СЪСТАВ")}>{catBreakdown.map(c=><div key={c.id} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontFamily:F.sans,fontSize:11,color:T.textSoft}}>{c.label}</span><span style={{fontFamily:F.mono,fontSize:11,color:T.textDim}}>{c.count}{c.value>0?" \u00B7 "+cur+c.value:""}</span></div><div style={{height:2,background:T.border,borderRadius:1,overflow:"hidden"}}><div style={{width:(c.count/maxCat*100)+"%",height:"100%",background:T.text,borderRadius:1}}/></div></div>)}</Section>

    {totalValue>0&&<Section title={t("СТОЙНОСТ НА ГАРДЕРОБА")}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}><div style={{textAlign:"center",padding:"12px 0"}}><p style={{fontFamily:F.serif,fontSize:24,color:T.text,margin:"0 0 2px",fontWeight:300}}>{cur}{totalValue}</p><p style={{fontFamily:F.mono,fontSize:9,color:T.textDim,letterSpacing:"0.1em",margin:0}}>{t("ОБЩА СТОЙНОСТ")}</p></div><div style={{textAlign:"center",padding:"12px 0"}}><p style={{fontFamily:F.serif,fontSize:24,color:T.text,margin:"0 0 2px",fontWeight:300}}>{cur}{avgCPW}</p><p style={{fontFamily:F.mono,fontSize:9,color:T.textDim,letterSpacing:"0.1em",margin:0}}>{t("СР. ЦЕНА / НОСЕНЕ")}</p></div></div>{mostExpCat&&<div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderTop:"1px solid "+T.border}}><span style={{fontFamily:F.sans,fontSize:11,color:T.textSoft}}>{t("Най-скъпа категория")}</span><span style={{fontFamily:F.mono,fontSize:10,color:T.textDim}}>{mostExpCat.label} {cur}{mostExpCat.value}</span></div>}{leastExpCat&&leastExpCat.value>0&&<div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderTop:"1px solid "+T.border}}><span style={{fontFamily:F.sans,fontSize:11,color:T.textSoft}}>{t("Най-евтина категория")}</span><span style={{fontFamily:F.mono,fontSize:10,color:T.textDim}}>{leastExpCat.label} {cur}{leastExpCat.value}</span></div>}<div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderTop:"1px solid "+T.border}}><span style={{fontFamily:F.sans,fontSize:11,color:T.textSoft}}>{t("Средна цена на артикул")}</span><span style={{fontFamily:F.mono,fontSize:10,color:T.textDim}}>{cur}{avgItemValue}</span></div>{worstCPW.length>0&&<><div style={{margin:"12px 0 8px"}}><span style={{fontFamily:F.mono,fontSize:9,color:T.textDim,letterSpacing:"0.14em"}}>{t("НАЙ-СКЪПО НОСЕНЕ")}</span></div>{worstCPW.map((item,i)=><div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"5px 0",borderBottom:i<worstCPW.length-1?"1px solid "+T.border:"none"}}>{item.image?<img src={item.image} alt="" style={{width:28,height:28,borderRadius:2,objectFit:"cover"}}/>:<div style={{width:28,height:28,borderRadius:2,background:T.surface}}/>}<span style={{fontFamily:F.sans,fontSize:11,color:T.text,flex:1}}>{item.name}</span><span style={{fontFamily:F.mono,fontSize:10,color:T.washWarn}}>{cur}{item.cpw}{t("/носене")}</span></div>)}</>}</Section>}

    {topColors.length>0&&<Section title={t("ЦВЕТОВА ПАЛИТРА")}><div style={{display:"flex",gap:3,marginBottom:10,height:24}}>{topColors.map(([hex],i)=><div key={i} style={{flex:1,background:hex,borderRadius:2,border:hex==="#FFFFFF"?"1px solid "+T.border:"none"}}/>)}</div><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{topColors.map(([hex,count])=><span key={hex} style={{fontFamily:F.mono,fontSize:10,color:T.textDim}}>{getColorName(hex)} {"\u00D7"}{count}</span>)}</div></Section>}

    {styleBreakdown.length>0&&<Section title={t("СТИЛ ДНК")}><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{styleBreakdown.map(s=><div key={s.id} style={{border:"1px solid "+T.border,padding:"5px 10px",borderRadius:2,display:"flex",alignItems:"center",gap:6}}><span style={{fontFamily:F.sans,fontSize:11,color:T.textSoft}}>{s.label}</span><span style={{fontFamily:F.mono,fontSize:11,color:T.textDim}}>{s.count}</span></div>)}</div></Section>}

    {forgotten.length>0&&<Section title={t("ЗАБРАВЕНИ ДРЕХИ")+(" \u2014 "+forgotten.length)}><p style={{fontFamily:F.sans,fontSize:11,color:T.textMuted,margin:"0 0 10px"}}>{t("Не сте ги носили повече от 60 дни")}</p><div style={{display:"flex",gap:4,overflowX:"auto",paddingBottom:4}}>{forgotten.map(item=><div key={item.id} style={{width:52,height:52,borderRadius:2,overflow:"hidden",flexShrink:0,border:"1px solid "+T.border,position:"relative"}}>{item.image?<img src={item.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:0.5,filter:"grayscale(0.3)"}}/>:<div style={{width:"100%",height:"100%",background:T.surface,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:F.serif,fontSize:16,color:T.border}}>{CAT_MAP[item.category]?.label?.[0]}</span></div>}<span style={{position:"absolute",bottom:2,right:3,fontFamily:F.mono,fontSize:8,color:T.textDim,background:T.bg+"cc",padding:"1px 3px",borderRadius:1}}>{Math.floor((now-new Date(item.lastWorn).getTime())/86400000)}{t("д")}</span></div>)}</div></Section>}

    {(mostWorn[0]?.wearCount>0||bestCPW.length>0)&&<Section title={t("ФАВОРИТИ")}>
      {mostWorn.filter(i=>i.wearCount>0).map((item,i)=><div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:"1px solid "+T.border}}><span style={{fontFamily:F.mono,fontSize:12,color:T.textDim,width:18,textAlign:"right",fontWeight:300}}>{String(i+1).padStart(2,"0")}</span>{item.image?<img src={item.image} alt="" style={{width:34,height:34,borderRadius:2,objectFit:"cover",opacity:T.imgOpacity}}/>:<div style={{width:34,height:34,borderRadius:2,background:T.surface}}/>}<div style={{flex:1}}><p style={{fontFamily:F.sans,fontSize:11,color:T.text,margin:0}}>{item.name}</p></div><span style={{fontFamily:F.mono,fontSize:10,color:T.textDim}}>{item.wearCount}\u00D7</span></div>)}
      {bestCPW.length>0&&<><div style={{margin:"10px 0 8px"}}><span style={{fontFamily:F.mono,fontSize:9,color:T.textDim,letterSpacing:"0.14em"}}>{t("НАЙ-ДОБРА ИНВЕСТИЦИЯ")}</span></div>{bestCPW.map((item,i)=><div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"5px 0",borderBottom:i<bestCPW.length-1?"1px solid "+T.border:"none"}}>{item.image?<img src={item.image} alt="" style={{width:28,height:28,borderRadius:2,objectFit:"cover"}}/>:<div style={{width:28,height:28,borderRadius:2,background:T.surface}}/>}<span style={{fontFamily:F.sans,fontSize:11,color:T.text,flex:1}}>{item.name}</span><span style={{fontFamily:F.mono,fontSize:10,color:T.textDim}}>{cur}{item.cpw}{t("/носене")}</span></div>)}</>}
    </Section>}

    {(laundryItems.length>0||capsuleItems.length>0)&&<Section title={t("СТАТУС")}>
      {laundryItems.length>0&&<div style={{marginBottom:capsuleItems.length>0?14:0}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><span style={{fontFamily:F.sans,fontSize:11,color:T.textSoft}}>{t("В пералня")}</span><span style={{fontFamily:F.mono,fontSize:10,color:T.laundryText}}>{laundryItems.length}</span></div><div style={{display:"flex",gap:4,overflowX:"auto"}}>{laundryItems.map(item=><div key={item.id} style={{width:40,height:40,borderRadius:2,overflow:"hidden",flexShrink:0,border:"1px solid "+T.border,opacity:0.5}}>{item.image?<img src={item.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{width:"100%",height:"100%",background:T.surface}}/>}</div>)}</div></div>}
      {capsuleItems.length>0&&<div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><span style={{fontFamily:F.sans,fontSize:11,color:T.textSoft}}>{t("Капсула")}</span><span style={{fontFamily:F.mono,fontSize:10,color:T.capsuleText}}>{capsuleItems.length}</span></div><div style={{display:"flex",gap:4,overflowX:"auto"}}>{capsuleItems.map(item=><div key={item.id} style={{width:40,height:40,borderRadius:2,overflow:"hidden",flexShrink:0,border:"1px solid "+T.border}}>{item.image?<img src={item.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:T.imgOpacity}}/>:<div style={{width:"100%",height:"100%",background:T.surface}}/>}</div>)}</div></div>}
    </Section>}

    {neverWorn.length>0&&<Section title={t("ЧАКАЩИ СТИЛИЗИРАНЕ \u2014 ")+neverWorn.length}><div style={{display:"flex",gap:3,overflowX:"auto"}}>{neverWorn.slice(0,8).map(item=><div key={item.id} style={{width:40,height:40,borderRadius:2,overflow:"hidden",flexShrink:0,border:"1px solid "+T.border}}>{item.image?<img src={item.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:0.6}}/>:<div style={{width:"100%",height:"100%",background:T.surface}}/>}</div>)}{neverWorn.length>8&&<div style={{width:40,height:40,borderRadius:2,border:"1px solid "+T.border,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontFamily:F.mono,fontSize:11,color:T.textDim}}>+{neverWorn.length-8}</span></div>}</div></Section>}

    {Object.keys(calendar||{}).length>0&&<Section title={t("АКТИВНОСТ")+(" \u2014 90 "+t("ДНИ"))}><div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><span style={{fontFamily:F.mono,fontSize:10,color:T.textDim}}>{totalActiveDays} {t("активни дни")}</span><span style={{fontFamily:F.mono,fontSize:10,color:T.textDim}}>{heatmapData.reduce((a,d)=>a+d.count,0)} {t("общо")}</span></div><div style={{display:"grid",gridTemplateColumns:"repeat(13,1fr)",gap:2,marginBottom:6}}>{heatmapData.map((d,i)=>{const intensity=d.count===0?0:Math.max(0.2,d.count/maxDayWears);return<div key={i} style={{aspectRatio:"1",borderRadius:1,background:d.count===0?T.subtleBg:T.text,opacity:d.count===0?1:intensity,border:d.count===0?"1px solid "+T.border:"none"}} title={d.date+": "+d.count}/>;})}</div><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontFamily:F.mono,fontSize:8,color:T.textDim}}>{heatmapData[0]?.date.slice(5)}</span><div style={{display:"flex",alignItems:"center",gap:3}}><span style={{fontFamily:F.mono,fontSize:8,color:T.textDim}}>{t("малко")}</span>{[0,0.25,0.5,0.75,1].map((o,i)=><div key={i} style={{width:8,height:8,borderRadius:1,background:o===0?T.subtleBg:T.text,opacity:o===0?1:o,border:o===0?"1px solid "+T.border:"none"}}/>)}<span style={{fontFamily:F.mono,fontSize:8,color:T.textDim}}>{t("много")}</span></div><span style={{fontFamily:F.mono,fontSize:8,color:T.textDim}}>{t("днес")}</span></div></Section>}

    {Object.keys(calendar||{}).length>0&&<Section title={t("СЕРИЯ")}><div style={{display:"flex",gap:16,marginBottom:4}}><div style={{flex:1,textAlign:"center"}}><p style={{fontFamily:F.serif,fontSize:36,color:T.text,margin:"0 0 2px",fontWeight:300}}>{streakData.current}</p><p style={{fontFamily:F.mono,fontSize:9,color:T.textDim,letterSpacing:"0.1em",margin:0}}>{t("ТЕКУЩА СЕРИЯ")}</p></div><div style={{width:1,background:T.border}}/><div style={{flex:1,textAlign:"center"}}><p style={{fontFamily:F.serif,fontSize:36,color:streakData.current>=streakData.longest&&streakData.longest>0?T.successText:T.text,margin:"0 0 2px",fontWeight:300}}>{streakData.longest}</p><p style={{fontFamily:F.mono,fontSize:9,color:T.textDim,letterSpacing:"0.1em",margin:0}}>{t("НАЙ-ДЪЛГА СЕРИЯ")}</p></div></div></Section>}

    <Section title={t("СЕДМИЧНО ПРЕДИЗВИКАТЕЛСТВО")}>{challenges.map((ch,i)=><div key={i} style={{padding:"10px 0",borderBottom:i<challenges.length-1?"1px solid "+T.border:"none",opacity:ch.done?0.6:1}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}><span style={{fontFamily:F.mono,fontSize:14,color:ch.done?T.successText:T.textDim,width:22,textAlign:"center"}}>{ch.done?"\u2713":ch.icon}</span><div style={{flex:1}}><p style={{fontFamily:F.sans,fontSize:11,color:T.text,margin:0,textDecoration:ch.done?"line-through":"none"}}>{ch.title}</p><p style={{fontFamily:F.mono,fontSize:9,color:T.textDim,margin:"2px 0 0",letterSpacing:"0.06em"}}>{ch.desc}</p></div><span style={{fontFamily:F.mono,fontSize:10,color:ch.done?T.successText:T.textDim}}>{ch.done?"\u2713":ch.progress+"/"+ch.max}</span></div><div style={{marginLeft:32,height:2,background:T.border,borderRadius:1,overflow:"hidden"}}><div style={{width:(Math.min(ch.progress,ch.max)/ch.max*100)+"%",height:"100%",background:ch.done?T.successText:T.text,borderRadius:1,transition:"width 0.5s"}}/></div></div>)}<p style={{fontFamily:F.mono,fontSize:9,color:T.textDim,letterSpacing:"0.08em",marginTop:10,textAlign:"center"}}>{t("Обновява се всеки понеделник")}</p></Section>

    <Section title={t("ПОСТИЖЕНИЯ")}>{achievements.map((a,i)=><div key={i} style={{padding:"10px 0",borderBottom:i<achievements.length-1?"1px solid "+T.border:"none",opacity:a.done?1:0.5}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}><span style={{fontFamily:F.mono,fontSize:12,color:T.textDim,width:18,fontWeight:300}}>{String(i+1).padStart(2,"0")}</span><div style={{flex:1}}><p style={{fontFamily:F.sans,fontSize:11,color:T.text,margin:0}}>{a.name}</p><p style={{fontFamily:F.mono,fontSize:9,color:T.textDim,margin:"2px 0 0",letterSpacing:"0.06em"}}>{a.desc}</p></div><span style={{fontFamily:F.mono,fontSize:10,color:a.done?T.successText:T.textDim}}>{a.done?"\u2713":a.cur+"/"+a.max}</span></div>
      <div style={{marginLeft:28,height:2,background:T.border,borderRadius:1,overflow:"hidden"}}><div style={{width:(a.cur/a.max*100)+"%",height:"100%",background:a.done?T.successText:T.text,borderRadius:1,transition:"width 0.5s"}}/></div>
    </div>)}</Section>
  </div>);
}

// === Auth Screen ===
function AuthScreen(){
  const T=useTheme(),t=useT();const{loginEmail,registerEmail,loginGoogle,resetPassword,error,setError}=useAuth();
  const[mode,setMode]=useState("login");const[email,setEmail]=useState("");const[pass,setPass]=useState("");const[name,setName]=useState("");const[busy,setBusy]=useState(false);const[resetSent,setResetSent]=useState(false);const[consent,setConsent]=useState(false);const[showLegal,setShowLegal]=useState(null);
  const inputSt={width:"100%",padding:"14px 18px",borderRadius:100,border:"1px solid "+T.pillBorder,fontSize:14,fontFamily:F.sans,color:T.text,background:T.pillBg,boxSizing:"border-box",marginBottom:12};
  const submit=async()=>{setBusy(true);setError(null);try{if(mode==="register")await registerEmail(email,pass,name);else if(mode==="reset"){await resetPassword(email);setResetSent(true);}else await loginEmail(email,pass);}catch(e){console.warn(e);}finally{setBusy(false);}};
  return(<div style={{minHeight:"100dvh",background:T.bg,display:"flex",flexDirection:"column",justifyContent:"center",padding:"0 28px"}}>
    <div style={{marginBottom:48}}><Logo size={28}/><p style={{fontFamily:F.serif,fontSize:18,color:T.textMuted,margin:"12px 0 0",fontWeight:300,letterSpacing:"-0.01em"}}>{mode==="login"?t("Добре дошъл обратно"):mode==="register"?t("Създай своя гардероб"):t("Възстанови парола")}</p><div style={{width:40,height:1,background:"linear-gradient(90deg, "+T.text+" 0%, transparent 100%)",marginTop:16}}/></div>
    {error&&<div style={{padding:"12px 16px",borderRadius:3,border:"1px solid "+T.danger,marginBottom:16,fontFamily:F.sans,fontSize:12,color:T.dangerText}}>{error}</div>}
    {resetSent&&<div style={{padding:"12px 16px",borderRadius:3,border:"1px solid "+T.border,marginBottom:16,fontFamily:F.sans,fontSize:12,color:T.textSoft}}>Изпратен е имейл за възстановяване.</div>}
    {mode==="register"&&<input value={name} onChange={e=>setName(e.target.value)} placeholder={t("Твоето име")} style={inputSt}/>}
    {mode!=="reset"||!resetSent?<>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder={t("Имейл")} type="email" autoComplete="email" style={inputSt}/>
      {mode!=="reset"&&<input value={pass} onChange={e=>setPass(e.target.value)} placeholder={t("Парола")} type="password" autoComplete={mode==="register"?"new-password":"current-password"} style={inputSt}/>}
      {mode==="register"&&<label style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:14,cursor:"pointer"}}><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} style={{marginTop:3,accentColor:T.text,flexShrink:0}}/><span style={{fontFamily:F.sans,fontSize:11,color:T.textMuted,lineHeight:1.5}}>{t("Съгласен/а съм с ")}<span onClick={e=>{e.preventDefault();setShowLegal("terms");}} style={{color:T.text,textDecoration:"underline",cursor:"pointer"}}>{t("Общите условия")}</span>{t(" и ")}<span onClick={e=>{e.preventDefault();setShowLegal("privacy");}} style={{color:T.text,textDecoration:"underline",cursor:"pointer"}}>{t("Политиката за поверителност")}</span></span></label>}
      <button onClick={submit} disabled={busy||!email||(mode!=="reset"&&!pass)||(mode==="register"&&!consent)} style={{width:"100%",padding:16,borderRadius:3,border:"none",background:T.text,color:T.bg,fontFamily:F.sans,fontSize:11,fontWeight:600,cursor:"pointer",letterSpacing:"0.14em",textTransform:"uppercase",opacity:busy||(!consent&&mode==="register")?0.5:1,marginBottom:12,transition:"all 0.3s"}}>{busy?"...":(mode==="login"?t("Влез"):mode==="register"?t("Създай акаунт"):t("Изпрати линк"))}</button>
    </>:null}
    {mode!=="reset"&&<><div style={{display:"flex",alignItems:"center",gap:14,margin:"8px 0 20px"}}><div style={{flex:1,height:1,background:T.border}}/><span style={{fontFamily:F.mono,fontSize:10,color:T.textDim}}>{t("ИЛИ")}</span><div style={{flex:1,height:1,background:T.border}}/></div>
    <button onClick={async()=>{if(mode==="register"&&!consent){setError(t("Моля, приеми Общите условия"));return;}setBusy(true);try{await loginGoogle();}catch(e){console.warn(e);}finally{setBusy(false);}}} style={{width:"100%",padding:14,borderRadius:3,border:"1px solid "+T.border,background:"transparent",fontFamily:F.sans,fontSize:12,fontWeight:500,color:T.text,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:16}}>
      <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
      Продължи с Google
    </button></>}
    <div style={{display:"flex",justifyContent:"center",gap:16,marginTop:8}}>
      {mode==="login"&&<><button onClick={()=>{setMode("register");setError(null);}} style={{background:"none",border:"none",color:T.textMuted,fontFamily:F.mono,fontSize:11,cursor:"pointer",letterSpacing:"0.06em"}}>СЪЗДАЙ АКАУНТ</button><button onClick={()=>{setMode("reset");setError(null);}} style={{background:"none",border:"none",color:T.textDim,fontFamily:F.mono,fontSize:11,cursor:"pointer",letterSpacing:"0.06em"}}>ЗАБРАВЕНА ПАРОЛА</button></>}
      {mode!=="login"&&<button onClick={()=>{setMode("login");setError(null);setResetSent(false);}} style={{background:"none",border:"none",color:T.textMuted,fontFamily:F.mono,fontSize:11,cursor:"pointer",letterSpacing:"0.06em"}}>ОБРАТНО КЪМ ВХОД</button>}
    </div>
    {showLegal&&<LegalPage type={showLegal} onClose={()=>setShowLegal(null)}/>}
  </div>);
}

// === Profile Tab ===
function ProfileTab(){
  const T=useTheme(),toast=useToast(),confirm=useConfirm(),t=useT();const[showLegal,setShowLegal]=useState(null);
  const{user,profile,settings,saveProfile,saveSettings,uploadPhoto,logout,deleteAccount,exportData}=useAuth();
  const[editName,setEditName]=useState(false);const[nameVal,setNameVal]=useState(profile?.displayName||"");
  const[editBio,setEditBio]=useState(false);const[bioVal,setBioVal]=useState(profile.bio||"");
  const[editField,setEditField]=useState(null);const[fieldVal,setFieldVal]=useState("");
  const[showDelete,setShowDelete]=useState(false);const[delPass,setDelPass]=useState("");const[busy,setBusy]=useState(false);
  const fileRef=useRef(null);
  const inputSt={width:"100%",padding:"12px 16px",borderRadius:2,border:"1px solid "+T.border,fontSize:13,fontFamily:F.sans,color:T.text,background:T.surface,boxSizing:"border-box"};
  const Section=({title,children})=>(<div style={{background:T.subtleBg,borderLeft:"2px solid "+T.text,padding:"18px 22px",marginBottom:16}}><p style={{fontFamily:F.mono,fontSize:10,color:T.textDim,letterSpacing:"0.16em",margin:"0 0 14px"}}>{title}</p>{children}</div>);
  const Row=({label,value,field})=>(<div onClick={()=>{setEditField(field);setFieldVal(profile[field]||"");}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:"1px solid "+T.border,cursor:"pointer"}}><span style={{fontFamily:F.serif,fontSize:13,color:T.text,fontWeight:300}}>{label}</span>{editField===field?<div style={{display:"flex",gap:4}} onClick={e=>e.stopPropagation()}><input value={fieldVal} onChange={e=>setFieldVal(e.target.value)} style={{...inputSt,width:100,padding:"6px 12px",fontSize:11,marginBottom:0}} autoFocus onKeyDown={e=>{if(e.key==="Enter"){saveProfile({[field]:fieldVal});setEditField(null);toast(t("Запазено"),"success");}}} /><button onClick={()=>{saveProfile({[field]:fieldVal});setEditField(null);toast(t("Запазено"),"success");}} style={{padding:"0 12px",borderRadius:100,border:"1px solid "+T.text,background:"transparent",color:T.text,fontFamily:F.mono,fontSize:10,cursor:"pointer"}}>OK</button></div>:<span style={{fontFamily:F.mono,fontSize:10,color:T.textDim}}>{value||"—"} ›</span>}</div>);
  const Toggle=({label,value,onChange})=>(<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:"1px solid "+T.border}}><span style={{fontFamily:F.serif,fontSize:13,color:T.text,fontWeight:300}}>{label}</span><button onClick={()=>onChange(!value)} style={{width:44,height:24,borderRadius:12,border:"none",background:value?T.text:T.border,cursor:"pointer",position:"relative",transition:"all 0.3s"}}><div style={{width:18,height:18,borderRadius:9,background:value?T.bg:T.textDim,position:"absolute",top:3,left:value?23:3,transition:"all 0.3s"}}/></button></div>);
  const handlePhoto=async(e)=>{const f=e.target.files?.[0];if(!f)return;setBusy(true);try{await uploadPhoto(f);toast(t("Снимката е качена"),"success");}catch(e){console.warn(e);}finally{setBusy(false);}};
  const handleExport=async()=>{const data=await exportData();if(!data)return;const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="dreshnik-export-"+new Date().toISOString().slice(0,10)+".json";a.click();URL.revokeObjectURL(url);toast(t("Данните са експортирани"),"success");};
  const handleDelete=async()=>{setBusy(true);try{await deleteAccount(delPass);}catch(e){console.warn(e);}finally{setBusy(false);}};
  const isGoogle=user?.providerData?.[0]?.providerId==="google.com";
  return(<div style={{padding:"28px 20px 100px"}}>
    <div style={{display:"flex",alignItems:"center",gap:18,marginBottom:32}}>
      <div onClick={()=>fileRef.current?.click()} style={{width:72,height:72,borderRadius:"50%",overflow:"hidden",border:"1px solid "+T.border,cursor:"pointer",flexShrink:0,background:T.pillBg,display:"flex",alignItems:"center",justifyContent:"center"}}>
        {profile?.photoURL||user?.photoURL?<img src={profile?.photoURL||user?.photoURL} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontFamily:F.serif,fontSize:28,color:T.textDim,fontWeight:300}}>{(profile?.displayName||user?.displayName||"?")[0]?.toUpperCase()}</span>}
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{display:"none"}}/>
      <div style={{flex:1}}>
        {editName?<div style={{display:"flex",gap:6}}><input value={nameVal} onChange={e=>setNameVal(e.target.value)} style={{...inputSt,flex:1,marginBottom:0}} autoFocus/><button onClick={()=>{saveProfile({displayName:nameVal});setEditName(false);toast(t("Запазено"),"success");}} style={{padding:"0 14px",borderRadius:2,border:"1px solid "+T.text,background:"transparent",color:T.text,fontFamily:F.mono,fontSize:11,cursor:"pointer"}}>OK</button></div>:
        <p onClick={()=>setEditName(true)} style={{fontFamily:F.serif,fontSize:22,color:T.text,fontWeight:400,margin:0,cursor:"pointer"}}>{profile?.displayName||user?.displayName||t("Задай име")}</p>}
        <p style={{fontFamily:F.mono,fontSize:10,color:T.textDim,margin:"4px 0 0"}}>{user?.email}</p>
        {isGoogle&&<span style={{fontFamily:F.mono,fontSize:10,color:T.textDim,border:"1px solid "+T.border,padding:"2px 8px",borderRadius:2,marginTop:4,display:"inline-block"}}>GOOGLE</span>}
      </div>
    </div>
    <Section title={t("БИО")}>
      {editBio?<div><textarea value={bioVal} onChange={e=>setBioVal(e.target.value)} rows={3} style={{...inputSt,resize:"none",marginBottom:8}} placeholder={t("Разкажи за стила си...")}/><button onClick={()=>{saveProfile({bio:bioVal});setEditBio(false);toast(t("Запазено"),"success");}} style={{padding:"8px 16px",borderRadius:2,border:"1px solid "+T.text,background:"transparent",color:T.text,fontFamily:F.mono,fontSize:11,cursor:"pointer"}}>{t("ЗАПАЗИ")}</button></div>:
      <p onClick={()=>setEditBio(true)} style={{fontFamily:F.sans,fontSize:12,color:profile.bio?T.textSoft:T.textDim,margin:0,cursor:"pointer",lineHeight:1.6}}>{profile.bio||t("Натисни за да добавиш био...")}</p>}
    </Section>
    <Section title={t("СТИЛ")}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:5,marginBottom:14}}>{STYLES.map((s,i)=>{const id=STYLE_IDS[i];const active=profile.preferredStyles?.includes(id);return<button key={i} onClick={()=>{const cur=profile.preferredStyles||[];saveProfile({preferredStyles:active?cur.filter(x=>x!==id):[...cur,id]});}} style={{padding:"8px 4px",borderRadius:100,border:active?"1px solid "+T.text:"1px solid "+T.pillBorder,background:active?T.text:T.pillBg,color:active?T.bg:T.textMuted,fontFamily:F.serif,fontSize:11,fontWeight:active?500:300,cursor:"pointer",transition:"all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",letterSpacing:"0.02em",textAlign:"center",width:"100%"}}>{s}</button>})}</div>
      <Row label={t("Горнище")} value={profile.topSize} field="topSize"/>
      <Row label={t("Долнище")} value={profile.bottomSize} field="bottomSize"/>
      <Row label={t("Обувки")} value={profile.shoeSize} field="shoeSize"/>
    </Section>
    <Section title={t("НАСТРОЙКИ")}>
      <Toggle label={t("Сезонна ротация")} value={settings.seasonalRotation} onChange={v=>saveSettings({seasonalRotation:v})}/>
      <Toggle label={t("Сутрешно предложение")} value={settings.notifyMorningOutfit} onChange={v=>saveSettings({notifyMorningOutfit:v})}/>
      <Toggle label={t("Седмичен отчет")} value={settings.notifyWeeklyReport} onChange={v=>saveSettings({notifyWeeklyReport:v})}/>
      <Toggle label={t("Публичен гардероб")} value={profile.isPublic} onChange={v=>saveProfile({isPublic:v})}/>
      <div style={{padding:"12px 0",borderBottom:"1px solid "+T.border}}>
        <p style={{fontFamily:F.mono,fontSize:11,color:T.textDim,letterSpacing:"0.12em",marginBottom:8}}>{t("ЕЗИК")}</p>
        <div style={{display:"flex",gap:6}}>{[{id:"bg",label:"BG"},{id:"en",label:"EN"}].map(l=><Pill key={l.id} active={(settings.language||"bg")===l.id} onClick={()=>{saveSettings({language:l.id});toast("Language: "+l.label);}} small>{l.label}</Pill>)}</div>
      </div>
    </Section>
    <Section title={t("АКАУНТ")}>
      <button onClick={()=>confirm(t("Искаш ли да излезеш от акаунта?"),()=>logout())} style={{width:"100%",padding:13,borderRadius:2,border:"1px solid "+T.border,background:"transparent",fontFamily:F.mono,fontSize:11,color:T.textMuted,cursor:"pointer",letterSpacing:"0.06em",marginBottom:8}}>{t("ИЗЛЕЗ")}</button>
      {!showDelete?<button onClick={()=>setShowDelete(true)} style={{width:"100%",padding:13,borderRadius:2,border:"1px solid "+T.danger,background:"transparent",fontFamily:F.mono,fontSize:11,color:T.dangerText,cursor:"pointer",letterSpacing:"0.06em"}}>{t("ИЗТРИЙ АКАУНТ")}</button>:
      <div style={{border:"1px solid "+T.danger,borderRadius:3,padding:16}}>
        <p style={{fontFamily:F.sans,fontSize:12,color:T.dangerText,margin:"0 0 12px"}}>Това ще изтрие акаунта ти и всички данни завинаги.</p>
        {!isGoogle&&<input value={delPass} onChange={e=>setDelPass(e.target.value)} type="password" placeholder={t("Въведи парола за потвърждение")} style={{...inputSt,marginBottom:10}}/>}
        <div style={{display:"flex",gap:8}}><button onClick={()=>{setShowDelete(false);setDelPass("");}} style={{flex:1,padding:12,borderRadius:2,border:"1px solid "+T.border,background:"transparent",fontFamily:F.mono,fontSize:11,color:T.textMuted,cursor:"pointer"}}>{t("ОТКАЗ")}</button>
        <button onClick={handleDelete} disabled={!isGoogle&&!delPass} style={{flex:1,padding:12,borderRadius:2,border:"none",background:T.dangerText,color:"#fff",fontFamily:F.mono,fontSize:11,cursor:"pointer",opacity:busy?0.5:1}}>{t("ИЗТРИЙ")}</button></div>
      </div>}
    </Section>
    <div style={{textAlign:"center",marginTop:28}}>
      <p style={{fontFamily:F.mono,fontSize:9,color:T.textDim,letterSpacing:"0.16em",marginBottom:10}}>{t("ПРАВНА ИНФОРМАЦИЯ")}</p>
      <div style={{display:"flex",justifyContent:"center",gap:16}}>
        <button onClick={()=>setShowLegal("privacy")} style={{background:"none",border:"none",fontFamily:F.mono,fontSize:10,color:T.textMuted,cursor:"pointer",textDecoration:"underline",textUnderlineOffset:3,letterSpacing:"0.04em"}}>{t("Политика за поверителност")}</button>
        <button onClick={()=>setShowLegal("terms")} style={{background:"none",border:"none",fontFamily:F.mono,fontSize:10,color:T.textMuted,cursor:"pointer",textDecoration:"underline",textUnderlineOffset:3,letterSpacing:"0.04em"}}>{t("Общи условия")}</button>
      </div>
    </div>
    {showLegal&&<LegalPage type={showLegal} onClose={()=>setShowLegal(null)}/>}
    <p style={{fontFamily:F.mono,fontSize:10,color:T.textDim,textAlign:"center",letterSpacing:"0.08em",marginTop:20}}>{t("Създадено от Алекс Тодоров за ВАС!")}</p>
  </div>);
}

// ============================================================
// App (v8)
// ============================================================
export default function App(){
  const{user,loading:authLoading,profile,settings,saveSettings,syncItems,loadItems,syncOutfits,loadOutfits,syncMeta,loadMeta,deleteItemImage,uploadItemImage}=useAuth();
  const[tab,setTab]=useState("wardrobe");const[items,setItems]=useState([]);const[saved,setSaved]=useState([]);const[loaded,setLoaded]=useState(false);const[theme,setTheme]=useState("dark");const[calendar,setCalendar]=useState({});const[blacklist,setBlacklist]=useState([]);const[hideSeasonal,setHideSeasonal]=useState(false);const[preGenOcc,setPreGenOcc]=useState(null);const weather=useWeather();
  const syncTimers=useRef({items:null,outfits:null,meta:null});

  useEffect(()=>{if(authLoading)return;(async()=>{
    if(user){
      const ci=await loadItems();const co=await loadOutfits();const cm=await loadMeta();
      // Migrate base64 images to Firebase Storage
      if(ci&&uploadItemImage){const needsMigration=ci.filter(i=>i.image&&i.image.startsWith("data:"));if(needsMigration.length>0){const migrated=[...ci];for(const item of needsMigration){try{const url=await uploadItemImage(item.id,item.image);if(url){const idx=migrated.findIndex(i=>i.id===item.id);if(idx!==-1)migrated[idx]={...migrated[idx],image:url};}}catch(e){console.warn("Migration error:",e);}}setItems(migrated);syncItems(migrated);}else{setItems(ci);}}else if(ci){setItems(ci);}
      if(co)setSaved(co);
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

  useEffect(()=>{window.scrollTo({top:0,behavior:"smooth"});},[tab]);
  const toggleTheme=()=>{const next=theme==="dark"?"light":"dark";setTheme(next);if(user)saveSettings({theme:next});else sSet("d6-theme",next);};
  const add=(item)=>{setItems(p=>[item,...p]);setTab("wardrobe");};
  const del=(id)=>{if(user&&deleteItemImage)deleteItemImage(id).catch(()=>{});setItems(p=>p.filter(i=>i.id!==id));};
  const update=(id,upd)=>{if(id==="__duplicate__"){setItems(p=>[upd,...p]);return;}setItems(p=>p.map(i=>{if(i.id!==id)return i;const u={...i,...upd};if(upd.lastWorn)u.wearsSinceWash=(i.wearsSinceWash||0)+1;if(upd.inLaundry===false&&i.inLaundry)u.wearsSinceWash=0;return u;}));if(upd.lastWorn){const dk=todayKey();setCalendar(prev=>{const e=normCal(prev[dk]);if(!e.worn.includes(id))return{...prev,[dk]:{...e,worn:[...e.worn,id]}};return prev;});}};
  const saveO=(o)=>setSaved(p=>[o,...p]);const delO=(id)=>setSaved(p=>p.filter(o=>o.id!==id));
  const addBlacklist=(key)=>setBlacklist(p=>[...p,key]);
  const T=THEMES[theme]||THEMES.dark;
  const globalStyles=`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Syne:wght@400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap');@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes fadeInUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}::-webkit-scrollbar{display:none}html{height:-webkit-fill-available}body{background:${T.bg};margin:0;min-height:100dvh;padding:env(safe-area-inset-top,0) env(safe-area-inset-right,0) env(safe-area-inset-bottom,0) env(safe-area-inset-left,0);transition:background 0.3s;overscroll-behavior-y:none}@supports not (min-height:100dvh){body{min-height:100vh;min-height:-webkit-fill-available}}input,select,button,textarea{outline:none}input:focus,textarea:focus{border-color:${T.textDim} !important}::placeholder{color:${T.textDim}}button:active{opacity:0.7}video{-webkit-transform:translateZ(0)}`;

  if(authLoading||!loaded)return(<ThemeCtx.Provider value={T}><div style={{height:"100dvh",display:"flex",alignItems:"center",justifyContent:"center",background:T.bg}}><style>{globalStyles}</style><Logo size={28} animate/></div></ThemeCtx.Provider>);
  if(!user)return(<ThemeCtx.Provider value={T}><style>{globalStyles}</style><ToastProvider><ConfirmProvider><AuthScreen/></ConfirmProvider></ToastProvider></ThemeCtx.Provider>);

  return(<ThemeCtx.Provider value={T}><ToastProvider><ConfirmProvider><div style={{maxWidth:600,margin:"0 auto",minHeight:"100dvh",background:T.bg,transition:"background 0.3s"}}><style>{globalStyles}</style>
    <Header theme={theme} toggleTheme={toggleTheme} onLogoClick={()=>setTab("wardrobe")}/>
    {tab==="wardrobe"&&<WardrobeTab items={items} onDelete={del} onUpdate={update} weather={weather} calendar={calendar} setCalendar={setCalendar} hideSeasonal={hideSeasonal} setHideSeasonal={setHideSeasonal} onNavigateOutfit={(occ)=>{setPreGenOcc(occ);setTab("outfits");}}/>}
    {tab==="add"&&<AddTab onAdd={add} lastCat={items[0]?.category||""}/>}
    {tab==="outfits"&&<OutfitsTab items={items} onSave={saveO} weather={weather} blacklist={blacklist} addBlacklist={addBlacklist} saved={saved} onDeleteSaved={delO} preGenOcc={preGenOcc} onConsumePreGen={()=>setPreGenOcc(null)}/>}
    {tab==="insights"&&<InsightsTab items={items} saved={saved} calendar={calendar}/>}
    {tab==="profile"&&<ProfileTab/>}
    <BottomNav tab={tab} setTab={setTab}/>
  </div></ConfirmProvider></ToastProvider></ThemeCtx.Provider>);
}
