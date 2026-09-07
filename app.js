const COLORS = ["#7dd3fc","#fbbf24","#c084fc","#34d399"];
const CITIES = ["Centennial","Littleton","Greenwood Village"];
const CITY_CENTER = {
  "Centennial": [39.5807, -104.8772],
  "Littleton": [39.6133, -105.0166],
  "Greenwood Village": [39.6172, -104.9508]
};
const BY_NUM = {
  "5901": [39.6095, -104.9596],
  "2410": [39.5953, -104.9588],
  "12022": [39.5954, -104.8470],
  "6556": [39.5980, -104.9879],
  "5898": [39.6102, -104.9879],
  "8250": [39.5714, -104.9223],
  "6515": [39.5990, -104.9879],
  "11005": [39.5938, -104.8580],
  "7425": [39.5950, -104.8970],
  "8263": [39.5718, -104.9040],
  "6200": [39.6050, -105.0220],
  "5890": [39.6080, -105.0220],
  "11901": [39.5954, -104.8500],
  "8755": [39.5951, -104.8818],
  "250": [39.5835, -104.9870],
  "181": [39.6138, -104.9965],
  "2338": [39.6244, -105.0148],
  "8020": [39.5748, -104.9879],
  "5595": [39.6165, -104.9879],
  "5171": [39.5952, -104.9260],
  "10553": [39.5940, -104.8620],
  "10210": [39.5953, -104.8680],
  "7799": [39.5952, -104.8930],
  "8787": [39.5848, -104.8870],
  "7450": [39.5820, -104.9408],
  "100": [39.6135, -104.9960]
};
const FALLBACK = { observations: [] };
const KEYS = { hist: "wazegas-hist", coach: "wazegas-coach", places: "wazegas-places", lastTap: "wazegas-last" };
let grade = "regular", hist = FALLBACK, here = null, lastTap = localStorage.getItem(KEYS.lastTap);

function toast(t){ const el=document.getElementById("toast"); el.textContent=t; el.style.display="block"; setTimeout(()=>el.style.display="none",2200); }
function isKroger(s){ const n=(s.name||"").toLowerCase(); return n.indexOf("king soopers")!==-1 || n.indexOf("kroger")!==-1; }
function rawPrice(s){ const v=s[grade]; return (v==null||v==="")?null:+v; }
function priceOf(s){ const v=rawPrice(s); if(v==null) return null; return isKroger(s)?+(v-0.03).toFixed(2):v; }
function haversine(a,b){
  const R=3958.8, toR=d=>d*Math.PI/180;
  const dLat=toR(b[0]-a[0]), dLon=toR(b[1]-a[1]);
  const x=Math.sin(dLat/2)**2+Math.cos(toR(a[0]))*Math.cos(toR(b[0]))*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(x));
}
function pin(s){
  const m=(s.addr||"").match(/(\d+)/);
  if(m && BY_NUM[m[1]]) return BY_NUM[m[1]];
  return CITY_CENTER[s.city] || null;
}
function miles(s){
  if(!here) return null;
  const p=pin(s); if(!p) return null;
  return haversine(here, p);
}
function latest(){ return (hist.observations||[])[(hist.observations||[]).length-1]; }
function areaStations(){
  const o=latest(); if(!o) return [];
  return (o.stations||[]).filter(s=>CITIES.indexOf(s.city)!==-1);
}
function pricedList(){
  return areaStations().filter(s=>priceOf(s)!=null).slice().sort((a,b)=>priceOf(a)-priceOf(b)).slice(0,4);
}
function ageLabel(iso){
  if(!iso) return "Updated time unknown";
  const ms=Date.now()-new Date(iso).getTime();
  const h=Math.max(0, Math.round(ms/3600000));
  if(h<1) return "Updated just now";
  if(h<24) return "Updated "+h+"h ago";
  return "Updated "+Math.round(h/24)+"d ago";
}
function openWaze(s){
  lastTap=s.id; localStorage.setItem(KEYS.lastTap,s.id);
  const q=encodeURIComponent((s.addr||"")+" "+(s.city||"")+" CO");
  const native="waze://?q="+q+"&navigate=yes";
  const web="https://waze.com/ul?q="+q+"&utm_source=mattsgas";
  setTimeout(()=>{ location.href=web; }, 700);
  location.href=native;
  render();
}
function last10(){
  const out=[], end=new Date();
  for(let i=9;i>=0;i--){ const d=new Date(end.getFullYear(),end.getMonth(),end.getDate()-i); out.push(d.toISOString().slice(0,10)); }
  return out;
}
function drawChart(list){
  const ids=list.slice(0,4).map(s=>s.id);
  const obs=(hist.observations||[]).slice().sort((a,b)=>(a.crawled_at||a.date).localeCompare(b.crawled_at||b.date));
  const by={}; obs.forEach(o=>by[o.date]=o);
  const days=last10();
  const canvas=document.getElementById("chart"); if(!canvas) return;
  const ctx=canvas.getContext("2d");
  const w=canvas.width,h=canvas.height; ctx.clearRect(0,0,w,h);
  const vals=[];
  days.forEach(d=>{ const o=by[d]; if(!o) return; (o.stations||[]).forEach(s=>{ if(ids.indexOf(s.id)===-1) return; const v=priceOf(s); if(v!=null) vals.push(v); }); });
  const min=(vals.length?Math.min.apply(null,vals):3.5)-0.08;
  const max=(vals.length?Math.max.apply(null,vals):5.2)+0.08;
  const padL=64,padR=16,padT=14,padB=34;
  const x=i=>padL+i*(w-padL-padR)/Math.max(days.length-1,1);
  const y=v=>padT+(1-(v-min)/(max-min))*(h-padT-padB);
  ctx.strokeStyle="#2a3650"; ctx.fillStyle="#9aa8bd"; ctx.font="20px -apple-system,sans-serif";
  for(let i=0;i<4;i++){ const v=min+(max-min)*i/3; ctx.beginPath(); ctx.moveTo(padL,y(v)); ctx.lineTo(w-padR,y(v)); ctx.stroke(); ctx.fillText("$"+v.toFixed(2),8,y(v)+6); }
  days.forEach((d,i)=>{ if(i%2===0||i===days.length-1) ctx.fillText(d.slice(5),x(i)-20,h-8); });
  list.forEach((s,idx)=>{
    const color=COLORS[idx%COLORS.length]; ctx.strokeStyle=color; ctx.fillStyle=color; ctx.lineWidth=2;
    let started=false; ctx.beginPath();
    days.forEach((d,i)=>{ const o=by[d]; const hit=o&&(o.stations||[]).find(r=>r.id===s.id); const v=hit?priceOf(hit):null; if(v==null){ started=false; return; } if(!started){ ctx.moveTo(x(i),y(v)); started=true; } else ctx.lineTo(x(i),y(v)); }); ctx.stroke();
  });
  document.getElementById("legend").innerHTML=list.map((s,i)=>'<span><i class="sw" style="background:'+COLORS[i]+'"></i>'+s.name+"</span>").join("");
}
function renderPlaces(){
  const raw=JSON.parse(localStorage.getItem(KEYS.places)||"[]");
  const root=document.getElementById("placeList"); if(!root) return; root.innerHTML="";
  raw.forEach((p)=>{
    const row=document.createElement("div"); row.className="station";
    row.innerHTML="<div><strong></strong><div class='addr'></div></div>";
    row.querySelector("strong").textContent=p.label; row.querySelector(".addr").textContent=p.query;
    row.onclick=()=>{ const q=encodeURIComponent(grade+" gas "+p.query); location.href="waze://?q="+q; setTimeout(()=>{location.href="https://waze.com/ul?q="+q;},700); };
    root.appendChild(row);
  });
}
function render(){
  const list=pricedList();
  const o=latest();
  document.getElementById("stamp").textContent=ageLabel(o&&o.crawled_at);
  document.getElementById("emptyNote").textContent=list.length?"":"No "+grade+" prices in the latest crawl.";
  const root=document.getElementById("stations"); root.innerHTML="";
  list.forEach((s,i)=>{
    const el=document.createElement("div");
    el.className="station"+(i===0?" best":"");
    const copy=document.createElement("div");
    const name=document.createElement("strong"); name.textContent=s.name;
    const addr=document.createElement("div"); addr.className="addr";
    const mi=miles(s);
    addr.textContent=s.addr+" · "+s.city+(mi!=null?" · "+mi.toFixed(1)+" mi":"");
    copy.appendChild(name); copy.appendChild(addr);
    const right=document.createElement("div");
    const pr=document.createElement("div"); pr.className="price"; pr.textContent=s.conflict ? s.conflict : "$"+priceOf(s).toFixed(2);
    right.appendChild(pr);
    if(isKroger(s) && rawPrice(s)!=null){
      const b=document.createElement("span"); b.className="board"; b.textContent="$"+rawPrice(s).toFixed(2)+" − 3¢";
      right.appendChild(b);
    }
    el.appendChild(copy); el.appendChild(right);
    el.onclick=()=>openWaze(s);
    root.appendChild(el);
  });
  drawChart(list);
  renderPlaces();
}
function askLocation(quiet){
  if(!navigator.geolocation){ if(!quiet) toast("Location not available"); return; }
  navigator.geolocation.getCurrentPosition(
    p=>{ here=[p.coords.latitude,p.coords.longitude]; render(); },
    err=>{ if(!quiet) toast(err&&err.code===1?"Allow location in Safari Settings":"Location failed"); },
    {enableHighAccuracy:true, timeout:12000, maximumAge:60000}
  );
}
document.getElementById("btnReg").onclick=()=>{ grade="regular"; document.getElementById("btnReg").classList.add("on"); document.getElementById("btnPrem").classList.remove("on"); render(); };
document.getElementById("btnPrem").onclick=()=>{ grade="premium"; document.getElementById("btnPrem").classList.add("on"); document.getElementById("btnReg").classList.remove("on"); render(); };
document.getElementById("editBtn").onclick=()=>document.getElementById("editBox").classList.toggle("on");
document.getElementById("addPlace").onclick=()=>{
  const label=document.getElementById("label").value.trim();
  const query=document.getElementById("query").value.trim();
  if(!label||!query) return;
  const raw=JSON.parse(localStorage.getItem(KEYS.places)||"[]");
  raw.push({label,query}); localStorage.setItem(KEYS.places, JSON.stringify(raw));
  document.getElementById("label").value=""; document.getElementById("query").value=""; renderPlaces();
};
document.getElementById("locBtn").onclick=()=>askLocation(false);
document.getElementById("coachOk").onclick=()=>{ localStorage.setItem(KEYS.coach,"1"); document.getElementById("coach").classList.remove("on"); };
if(!localStorage.getItem(KEYS.coach) && !window.navigator.standalone) document.getElementById("coach").classList.add("on");

let startY=null;
document.getElementById("scroller").addEventListener("touchstart",e=>{ if(window.scrollY<=0) startY=e.touches[0].clientY; }, {passive:true});
document.getElementById("scroller").addEventListener("touchmove",e=>{
  if(startY==null) return;
  if(e.touches[0].clientY-startY>56) document.getElementById("pullMsg").classList.add("on");
}, {passive:true});
document.getElementById("scroller").addEventListener("touchend",()=>{
  if(document.getElementById("pullMsg").classList.contains("on")) load(true);
  startY=null; document.getElementById("pullMsg").classList.remove("on");
});

function apply(j){
  if(j && j.observations){ hist=j; localStorage.setItem(KEYS.hist, JSON.stringify(j)); }
  render();
}
function load(toastOn){
  fetch("gas-history.json?t="+Date.now()).then(r=>r.ok?r.json():null).then(j=>{
    if(j) apply(j); else {
      const cached=localStorage.getItem(KEYS.hist);
      apply(cached?JSON.parse(cached):FALLBACK);
    }
    if(toastOn) toast("Updated");
    askLocation(true);
  }).catch(()=>{
    const cached=localStorage.getItem(KEYS.hist);
    apply(cached?JSON.parse(cached):FALLBACK);
    if(toastOn) toast("Showing last saved list");
  });
}
load(false);
