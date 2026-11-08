import { catalog, symbols } from './catalog.js';
const memory = new Map();
const finite = n => Number.isFinite(Number(n)) ? Number(n) : null;
const round = (n,d=2) => Math.round(n * (10 ** d)) / (10 ** d);
const request = async (url, headers={}) => {
  const ctrl = new AbortController(); const timer=setTimeout(()=>ctrl.abort(),8000);
  try { const resp=await fetch(url,{ headers, signal:ctrl.signal }); if(!resp.ok) throw new Error(`Remote returned ${resp.status}`); return await resp.json(); }
  finally { clearTimeout(timer); }
};
const ttl = async (key,ms,producer) => {
  const old=memory.get(key); if(old && Date.now()-old.at<ms) return old.data;
  const data=await producer(); memory.set(key,{at:Date.now(),data}); return data;
};
function seeded(n) { let x=(n|0) || 1; return ()=>{x=(x*1664525+1013904223)|0;return (x>>>0)/4294967296;}; }
export function demoSeries(s,range='3M') {
  const ranges={'1W':7,'1M':30,'3M':90,'6M':180,'1Y':365}; const n=ranges[range]||90;
  const rand=seeded([...s.symbol].reduce((a,c)=>a+c.charCodeAt(0),47));let price=s.demo*.87;
  const p=[];
  for(let i=n;i>=0;i--) { price*=1+(rand()-.475)*.018;const date=new Date(Date.now()-i*86400000).toISOString().slice(0,10);p.push({date,price:round(price),volume:Math.round(rand()*1000000)}); }
  const correction=s.demo/p.at(-1).price;return p.map(x=>({...x,price:round(x.price*correction)}));
}
function unavailableQuote(s){return {symbol:s.symbol,name:s.name,category:s.category,sector:s.sector,price:null,prevClose:null,change:null,changePct:null,open:null,high:null,low:null,volume:null,source:'none',asOf:null,isDemo:false,delayed:true,sparkline:[]};}
function demoQuote(s){if(!s.demo)return unavailableQuote(s);const series=demoSeries(s,'1M');const seed=[...s.symbol].reduce((v,c)=>v+c.charCodeAt(0),0);const pc=round(s.demo*(1+((seed%13)-6)/900));
  return {symbol:s.symbol,name:s.name,category:s.category,sector:s.sector,price:s.demo,prevClose:pc,change:round(s.demo-pc),changePct:round((s.demo-pc)/pc*100),open:round(s.demo*.993),high:round(s.demo*1.01),low:round(s.demo*.986),volume:null,source:'demo',asOf:null,isDemo:true,delayed:true,sparkline:series.filter((_,i)=>i%3===0).map(x=>x.price)};
}
function withMeta(s,raw){const prev=finite(raw.prevClose)||finite(raw.price);const change=finite(raw.change)??round(raw.price-prev);return {
 symbol:s.symbol,name:s.name,category:s.category,sector:s.sector,price:round(raw.price),prevClose:prev,
 change:round(change),changePct:prev?round(change/prev*100):0,
 open:finite(raw.open),high:finite(raw.high),low:finite(raw.low),volume:finite(raw.volume),
 source:raw.source,asOf:raw.asOf||null,isDemo:false,delayed:raw.source!=='upstox',sparkline:raw.sparkline||[]
};}
const getToken=()=>process.env.UPSTOX_ACCESS_TOKEN?.trim();
const isDemo=()=>String(process.env.DATA_MODE||'public').toLowerCase()==='demo';
async function upstoxQuotes(selected) {
  const token=getToken(); if(!token) throw new Error('Missing Upstox token');
  const keys=selected.map(s=>s.key).join(',');
  const res=await request(`https://api.upstox.com/v3/market-quote/quotes?instrument_key=${encodeURIComponent(keys)}`,{Authorization:`Bearer ${token}`,Accept:'application/json'});
  if(res.status!=='success'||!res.data) throw new Error('Invalid Upstox response');
  return selected.map(s=>{
    const key=s.category==='Index'?s.key.replace('|',':'):`NSE_EQ:${s.symbol}`;
    const item=res.data[key] || Object.values(res.data).find(x=>x.instrument_token===s.key || x.symbol===s.symbol);
    if(!item||!Number.isFinite(Number(item.last_price))) return null;
    const last=Number(item.last_price);const prev=Number(item.prev_close_price ?? item.ohlc?.close ?? (last-(item.net_change||0)));
    return withMeta(s,{price:last,prevClose:prev,change:finite(item.net_change),open:item.ohlc?.open,high:item.ohlc?.high,low:item.ohlc?.low,volume:item.volume,
      source:'upstox',asOf:item.last_trade_time ? new Date(Number(item.last_trade_time)).toISOString() : item.timestamp || new Date().toISOString()});
  });
}
async function yahooSeries(s,range='3M') {
  const ranges={'1W':'5d','1M':'1mo','3M':'3mo','6M':'6mo','1Y':'1y'};
  const data=await request(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(s.yahoo)}?interval=1d&range=${ranges[range]||'3mo'}`,{'User-Agent':'Mozilla/5.0 AviNiveshPro/1.0'});
  const obj=data.chart?.result?.[0]; if(!obj) throw new Error('Public data unavailable');
  const q=obj.indicators?.quote?.[0];
  const series=(obj.timestamp||[]).map((v,i)=>({date:new Date(v*1000).toISOString().slice(0,10),price:finite(q?.close?.[i]),open:finite(q?.open?.[i]),high:finite(q?.high?.[i]),low:finite(q?.low?.[i]),volume:finite(q?.volume?.[i])})).filter(p=>p.price>0);
  if(!series.length) throw new Error('Public price history empty');
  return {series,meta:obj.meta};
}
async function yahooQuote(s) {
  const {series,meta}=await yahooSeries(s,'1M');const price=finite(meta.regularMarketPrice)||series.at(-1).price;
  const prev=finite(meta.previousClose)||finite(meta.chartPreviousClose)||series.at(-2)?.price||price;
  return withMeta(s,{price,prevClose:prev,change:price-prev,open:null,high:null,low:null,volume:series.at(-1).volume,source:'yahoo',
    asOf:meta.regularMarketTime?new Date(meta.regularMarketTime*1000).toISOString():null,sparkline:series.slice(-15).map(a=>a.price)});
}
export async function getQuotes(ids){
 const selected=ids.map(x=>symbols.get(x)).filter(Boolean);if(isDemo())return selected.map(demoQuote);
 const values=new Map();
 if(getToken()&&selected.some(s=>s.key)) {try {const up=await ttl('up:'+ids.join(','),12000,()=>upstoxQuotes(selected.filter(x=>x.key)));up.forEach((x,i)=>{if(x)values.set(selected.filter(x=>x.key)[i].symbol,x)});}catch(e){console.warn('Upstox quote unavailable:',e.message);} }
 await Promise.all(selected.filter(s=>!values.has(s.symbol)).map(async s=>{
   try{values.set(s.symbol,await ttl('yahoo:'+s.symbol,60000,()=>yahooQuote(s)));}
   catch(e){values.set(s.symbol,demoQuote(s));}
 }));
 return selected.map(s=>values.get(s.symbol));
}
export async function getHistory(id,range='3M') {
 const s=symbols.get(id); if(!s) return null;const valid=['1W','1M','3M','6M','1Y'].includes(range)?range:'3M';
 if(isDemo()) return s.demo?{symbol:id,source:'demo',isDemo:true,delayed:true,series:demoSeries(s,valid)}:{symbol:id,source:'none',isDemo:false,delayed:true,series:[]};
 if(getToken()&&s.key) {try {
   const result=await ttl(`hist:up:${id}:${valid}`,300000,async()=>{
     const days={'1W':8,'1M':32,'3M':94,'6M':185,'1Y':370}[valid];
     const to=new Date(); const from=new Date(Date.now()-days*86400000);
     const path=`https://api.upstox.com/v3/historical-candle/${encodeURIComponent(s.key)}/days/1/${to.toISOString().slice(0,10)}/${from.toISOString().slice(0,10)}`;
     const data=await request(path,{Authorization:`Bearer ${getToken()}`,Accept:'application/json'});
     if(!Array.isArray(data.data?.candles)||!data.data.candles.length)throw new Error('No historic candles');
     return data.data.candles.map(x=>({date:String(x[0]).slice(0,10),price:finite(x[4]),open:finite(x[1]),high:finite(x[2]),low:finite(x[3]),volume:finite(x[5])})).filter(x=>x.price>0).sort((a,b)=>a.date.localeCompare(b.date));
   });return {symbol:id,source:'upstox',isDemo:false,delayed:false,series:result};
 }catch(e){console.warn('Upstox history unavailable:',e.message);} }
 try{const {series}=await ttl(`hist:yahoo:${id}:${valid}`,300000,()=>yahooSeries(s,valid));return {symbol:id,source:'yahoo',isDemo:false,delayed:true,series};}
 catch(e){return s.demo?{symbol:id,source:'demo',isDemo:true,delayed:true,series:demoSeries(s,valid)}:{symbol:id,source:'none',isDemo:false,delayed:true,series:[]};}
}
export async function exchangeStatus(){
  if(getToken()&&!isDemo()){try{const data=await ttl('market:status',60000,()=>request('https://api.upstox.com/v2/market/status/NSE',{Authorization:`Bearer ${getToken()}`}));
    if(data?.data?.status)return {status:data.data.status,official:true,asOf:data.data.last_updated?new Date(data.data.last_updated).toISOString():null};
  }catch(e){console.warn('Market status unavailable:',e.message);} }
  const fmt=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());
  const v=Object.fromEntries(fmt.map(x=>[x.type,x.value]));const mins=Number(v.hour)*60+Number(v.minute);
  // Approximation only; does NOT account for exchange holidays, special sessions, or special auctions.
  const weekday=!['Sat','Sun'].includes(v.weekday);return {status:weekday&&mins>=555&&mins<930?'LIKELY_OPEN':'LIKELY_CLOSED',official:false,asOf:new Date().toISOString()};
}
export const providerInfo=()=>({hasUpstoxToken:!!getToken(),mode:isDemo()?'demo':'public',pollSeconds:15,officialFeedAvailable:!!getToken()&&!isDemo()});
// Add NSE cash equities on demand. Exact symbols are resolved against Upstox when
// authorised, otherwise verified against Yahoo's public chart endpoint.
export async function registerEquitySymbol(raw) {
  const id=String(raw||'').trim().toUpperCase();
  if(!/^[A-Z0-9&-]{2,16}$/.test(id))throw new Error('Enter an NSE trading symbol (2–16 letters/numbers).');
  if(symbols.has(id))return symbols.get(id);
  if(isDemo())throw new Error('Adding instruments requires a working market-data provider; sample mode is enabled.');
  let item=null;
  if(getToken()){
    try{
      const url=`https://api.upstox.com/v2/instruments/search?query=${encodeURIComponent(id)}&exchanges=NSE&segments=EQ&page_number=1&records=30`;
      const r=await request(url,{Authorization:`Bearer ${getToken()}`,Accept:'application/json'});
      const matched=r.data?.find(x=>String(x.trading_symbol).toUpperCase()===id&&x.segment==='NSE_EQ'&&x.instrument_key);
      if(matched)item={symbol:id,name:matched.name||matched.short_name||id,category:'Equity',sector:'NSE Equity',key:matched.instrument_key,yahoo:`${id}.NS`,color:'#7786ee',demo:0};
    }catch(e){console.warn('Instrument search unavailable:',e.message);}
  }
  if(!item){
    const probe={symbol:id,name:id,yahoo:`${id}.NS`};
    try{const quote=await yahooQuote(probe);if(!(quote.price>0))throw new Error('No price');
      item={symbol:id,name:id,category:'Equity',sector:'NSE Equity',key:null,yahoo:`${id}.NS`,color:'#7786ee',demo:0};
    }catch {throw new Error(`Couldn't verify ${id} as an NSE equity with available data providers.`);}
  }
  catalog.push(item);symbols.set(id,item);
  return item;
}
