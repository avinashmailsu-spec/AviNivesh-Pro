import 'dotenv/config';
import {readFileSync} from 'node:fs';import {fileURLToPath} from 'node:url';
import WebSocket from 'ws';import protobuf from 'protobufjs';
import {catalog} from './catalog.js';
import {getQuotes,exchangeStatus} from './market.js';
const proto=readFileSync(fileURLToPath(new URL('./proto/market_v3_minimal.proto',import.meta.url)),'utf8');
const type=protobuf.parse(proto).root.lookupType('com.upstox.marketdatafeederv3udapi.rpc.proto.FeedResponse');
const keys=new Map(catalog.filter(s=>s.key).map(s=>[s.key,s]));
const clients=new Set();const live=new Map();
let socket=null,tries=0,connecting=false,lastTick=null,lastError=null;
export const streamState=()=>({enabled:process.env.UPSTOX_STREAM==='true'&&!!process.env.UPSTOX_ACCESS_TOKEN,connected:socket?.readyState===WebSocket.OPEN,lastTick,lastError,subscribed:keys.size,transport:'Upstox WebSocket V3 / Protobuf · server-side'});
export const liveQuote=(symbol)=>live.get(symbol)||null;
function send(res,event,data){try{res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)}catch{clients.delete(res)}}
function broadcast(event,data){for(const client of clients)send(client,event,data)}
const readLtp=feed=>feed?.ltpc||feed?.fullFeed?.marketFF?.ltpc||feed?.fullFeed?.indexFF?.ltpc;
export function applyDecodedFeed(decoded){const messages=[];for(const [key,feed] of Object.entries(decoded.feeds||{})){
 const item=keys.get(key);const ltpc=readLtp(feed);const p=Number(ltpc?.ltp);if(!item||!(p>0))continue;
 const previous=Number(ltpc.cp||0);const time=Number(String(ltpc.ltt||decoded.currentTs||Date.now()));const stamp=Number.isFinite(time)&&time>1e10?new Date(time).toISOString():null;
 const q={symbol:item.symbol,name:item.name,sector:item.sector,category:item.category,price:p,prevClose:previous||null,change:previous?p-previous:null,changePct:previous?100*(p/previous-1):null,asOf:stamp,source:'upstox_stream',isDemo:false,delayed:false,volume:null,sparkline:[],open:null,high:null,low:null};
 live.set(item.symbol,q);messages.push(q);
 }
 if(messages.length){lastTick=new Date().toISOString();broadcast('ticks',{quotes:messages,asOf:lastTick,source:'upstox_stream'});}return messages;
}
function reconnect(){if(!streamState().enabled)return;const delay=Math.min(60000,Math.pow(2,Math.min(tries++,6))*1000);setTimeout(connectMarketSocket,delay).unref?.()}
export async function connectMarketSocket(){if(!streamState().enabled||connecting||socket?.readyState===WebSocket.OPEN)return;connecting=true;try{
 const response=await fetch('https://api.upstox.com/v3/feed/market-data-feed/authorize',{headers:{Authorization:`Bearer ${process.env.UPSTOX_ACCESS_TOKEN}`,Accept:'application/json'},signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw new Error(`Upstox socket auth failed (${response.status})`);
 const data=await response.json();const redirect=data.data?.authorized_redirect_uri;
 if(!redirect?.startsWith('wss://'))throw new Error('Invalid Upstox redirect endpoint');
 socket=new WebSocket(redirect,{handshakeTimeout:10000,maxPayload:2_000_000});
 socket.on('open',()=>{connecting=false;tries=0;lastError=null;const active=[...keys.keys()].slice(0,100);socket.send(Buffer.from(JSON.stringify({guid:'avinivesh-v2',method:'sub',data:{mode:'ltpc',instrumentKeys:active}})));broadcast('status',streamState());});
 socket.on('message',(bytes)=>{try{applyDecodedFeed(type.toObject(type.decode(bytes),{longs:String,defaults:false}));}catch(err){lastError='Could not decode market feed: '+err.message;}});
 socket.on('error',err=>{lastError=err.message;});
 socket.on('close',()=>{connecting=false;broadcast('status',streamState());reconnect();});
 }catch(e){connecting=false;lastError=e.message;reconnect();}}
export function subscribeInstrument(item){if(!item?.key)return;keys.set(item.key,item);if(socket?.readyState===WebSocket.OPEN)socket.send(Buffer.from(JSON.stringify({guid:'avinivesh-v2-add',method:'sub',data:{mode:'ltpc',instrumentKeys:[item.key]}})));}
let polling=false;async function pushSnapshots(){if(!clients.size||polling)return;polling=true;try{const q=await getQuotes(catalog.map(x=>x.symbol));const merged=q.map(x=>live.get(x.symbol)||x);broadcast('quotes',{quotes:merged,requestedAt:new Date().toISOString()});}
 catch(e){broadcast('error-info',{message:'Snapshot temporarily unavailable'});}finally{polling=false}}
export function sseHandler(req,res){if(clients.size>25)return res.status(429).json({error:'Too many streaming viewers'});
 res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'});clients.add(res);send(res,'status',streamState());send(res,'hello',{serverTime:new Date().toISOString(),snapshotIntervalSeconds:15});pushSnapshots();
 req.on('close',()=>clients.delete(res));}
export function startStreams(){if(streamState().enabled)connectMarketSocket();setInterval(pushSnapshots,15000).unref?.();setInterval(()=>broadcast('heartbeat',{asOf:new Date().toISOString()}),18000).unref?.();}
