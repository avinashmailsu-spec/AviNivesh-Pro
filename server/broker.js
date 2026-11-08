// Explicit opt-in, local-only read-only brokerage import. No orders or account writes.
export const brokerEnabled=()=>process.env.ENABLE_BROKER_IMPORT==='true'&&!!process.env.UPSTOX_ACCESS_TOKEN;
export const loopback=req=>['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress);
export function mapBrokerEquities(data=[]){return data.filter(x=>x.exchange==='NSE'&&x.quantity>0&&x.average_price>=0&&/^[A-Z0-9&-]{2,16}$/.test(String(x.trading_symbol||''))).map(x=>({symbol:x.trading_symbol,qty:Number(x.quantity),avg:Number(x.average_price),name:x.company_name||x.trading_symbol,isin:x.isin||null,source:'Authenticated Upstox holdings'}));}
export function mapBrokerFunds(data=[]){return data.filter(x=>x.quantity>0&&x.average_price>=0&&x.last_price>0).map(x=>({name:x.fund,code:x.instrument_key,units:Number(x.quantity),buyNav:Number(x.average_price),nav:Number(x.last_price),navDate:String(x.last_price_date||''),source:'Authenticated Upstox mutual fund holdings'}));}
export async function getBrokerHoldings(kind){if(!brokerEnabled())throw new Error('Broker import is not enabled in the server environment');
 const endpoint=kind==='funds'?'https://api.upstox.com/v2/mf/holdings':'https://api.upstox.com/v2/portfolio/long-term-holdings';
 const resp=await fetch(endpoint,{headers:{Authorization:`Bearer ${process.env.UPSTOX_ACCESS_TOKEN}`,Accept:'application/json'},signal:AbortSignal.timeout(12000)});
 if(!resp.ok)throw new Error('Upstox broker import failed ('+resp.status+'). Verify token and permissions.');const data=await resp.json();if(data.status!=='success'||!Array.isArray(data.data))throw new Error('Unexpected brokerage response');
 return kind==='funds'?mapBrokerFunds(data.data):mapBrokerEquities(data.data);
}
