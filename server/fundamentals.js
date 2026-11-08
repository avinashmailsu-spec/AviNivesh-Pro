// Upstox Fundamentals V2 key ratios, available only with authorized developer access.
import {symbols} from './catalog.js';
const cache=new Map();
export async function getFundamentals(symbol){const entry=symbols.get(String(symbol||'').toUpperCase());const isin=entry?.key?.split('|')?.[1];
 if(!isin||!/^[A-Z]{2}[A-Z0-9]{10}$/.test(isin))throw new Error('No verified NSE equity ISIN for this symbol');
 if(!process.env.UPSTOX_ACCESS_TOKEN)throw new Error('Configure UPSTOX_ACCESS_TOKEN to retrieve verified key ratios');
 const cached=cache.get(isin);if(cached&&Date.now()-cached.at<900000)return cached.data;
 const resp=await fetch(`https://api.upstox.com/v2/fundamentals/${isin}/key-ratios`,{headers:{Authorization:`Bearer ${process.env.UPSTOX_ACCESS_TOKEN}`,Accept:'application/json'},signal:AbortSignal.timeout(10000)});
 if(!resp.ok)throw new Error('Upstox fundamentals API returned '+resp.status);const body=await resp.json();if(!Array.isArray(body.data))throw new Error('Key ratios unavailable');
 const ratios=Object.fromEntries(body.data.map(x=>[x.name,{company:x.company_value,sector:x.sector_value}]));
 const result={symbol:entry.symbol,isin,asOf:new Date().toISOString(),source:'Upstox Fundamentals API V2 (provider timestamp is retrieval time)',ratios};cache.set(isin,{at:Date.now(),data:result});return result;
}
