// Official AMFI text download; NAV values are end-of-day, never real-time.
const URL='https://portal.amfiindia.com/spages/NAVAll.txt';
let cache={time:0,rows:[],error:null};
export function parseAmfi(text){
 const funds=[];let category='';
 for(const l of text.split(/\r?\n/)){
  const line=l.trim();if(!line)continue;
  if(!line.includes(';')){if(line.length<180)category=line;continue;}
  const f=line.split(';');if(f.length<6||!/^\d+$/.test(f[0].trim()))continue;
  const nav=Number(f[4]);if(!(nav>0)||!Number.isFinite(nav))continue;
  funds.push({code:f[0].trim(),name:f[3].trim(),nav,navDate:f[5].trim(),isin:f[1].trim(),category});
 }
 return funds;
}
export async function getFundNav(search='',limit=40){
 const now=Date.now();if(!cache.rows.length || now-cache.time>60*60*1000){
  const abort=new AbortController();const timer=setTimeout(()=>abort.abort(),10000);
  try{const r=await fetch(URL,{signal:abort.signal,headers:{'User-Agent':'AviNiveshPro/2.0','Accept':'text/plain'}});if(!r.ok)throw new Error(`AMFI returned ${r.status}`);
   const t=await r.text();if(t.length>12_000_000)throw new Error('AMFI response too large');const rows=parseAmfi(t);if(!rows.length)throw new Error('AMFI feed contains no schemes');cache={rows,time:now,error:null};
  }catch(e){cache.error=e.message;if(!cache.rows.length)return {items:[],total:0,asOf:null,source:'unavailable',error:'Official AMFI feed is unavailable. Try again when connected.'};}
  finally{clearTimeout(timer)}
 }
 const q=String(search).trim().toLowerCase().slice(0,120);
 const items=q?cache.rows.filter(x=>x.name.toLowerCase().includes(q)||x.code===q):cache.rows.slice(0,500);
 return {items:items.slice(0,Math.min(100,Math.max(1,Number(limit)||40))),total:items.length,asOf:cache.time?new Date(cache.time).toISOString():null,source:'AMFI official NAV · end-of-day',error:cache.error};
}
