import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { catalog, selectSymbols, symbols } from './catalog.js';
import { getQuotes, getHistory, exchangeStatus, providerInfo, registerEquitySymbol } from './market.js';
import {getFundNav} from './funds.js';
import {getBrokerHoldings,brokerEnabled,loopback} from './broker.js';
import {getFundamentals} from './fundamentals.js';
import {sseHandler,startStreams,streamState,liveQuote,subscribeInstrument} from './stream.js';
const app=express();
app.disable('x-powered-by');app.use(express.json({limit:'32kb'}));
const port=Number(process.env.API_PORT)||8787;
const safe=handler=>(req,res)=>Promise.resolve(handler(req,res)).catch(err=>{console.error(err);res.status(500).json({error:'Data temporarily unavailable.'});});
app.get('/api/health',safe(async(_req,res)=>res.json({ok:true,provider:{...providerInfo(),hasAI:!!process.env.OPENAI_API_KEY,brokerImportAvailable:brokerEnabled()},stream:streamState(),market:await exchangeStatus(),serverTime:new Date().toISOString()})));
app.get('/api/catalog',(_req,res)=>res.json(catalog.map(({demo,...rest})=>rest)));
app.post('/api/instruments/add',safe(async(req,res)=>{try{const item=await registerEquitySymbol(req.body?.symbol);subscribeInstrument(item);const {demo,...publicItem}=item;res.json(publicItem);}catch(err){res.status(422).json({error:err.message});}}));
app.get('/api/quotes',safe(async(req,res)=>{const selected=selectSymbols(req.query.symbols||catalog.map(x=>x.symbol).join(','));res.json({quotes:(await getQuotes(selected)).map(q=>liveQuote(q.symbol)||q),requestedAt:new Date().toISOString()});}));
app.get('/api/broker/:kind',safe(async(req,res)=>{if(!['stocks','funds'].includes(req.params.kind))return res.status(400).json({error:'Invalid import type'});if(!brokerEnabled())return res.status(403).json({error:'Enable ENABLE_BROKER_IMPORT=true and a valid token in .env, then restart.'});if(!loopback(req))return res.status(403).json({error:'Broker import is restricted to loopback access in this local app.'});try{res.json({items:await getBrokerHoldings(req.params.kind),asOf:new Date().toISOString(),source:'Authenticated Upstox · manual read-only import'});}catch(e){res.status(502).json({error:e.message});}}));
app.get('/api/fundamentals/:symbol',safe(async(req,res)=>{try{res.json(await getFundamentals(req.params.symbol));}catch(e){res.status(422).json({error:e.message});}}));
app.get('/api/funds',safe(async(req,res)=>res.json(await getFundNav(req.query.q||'',req.query.limit||40))));
app.get('/api/stream',sseHandler);
app.get('/api/history/:symbol',safe(async(req,res)=>{const symbol=req.params.symbol.toUpperCase();if(!symbols.has(symbol))return res.status(404).json({error:'Unknown symbol'});res.json(await getHistory(symbol,String(req.query.range||'3M')));}));
const quoteSourceHint=(symbol)=>`Current server feed for ${symbol}; inspect Sources & timestamp in Markets`;
const topics=[
 {keys:['sip','systematic'],title:'SIP and rupee-cost averaging',answer:'A Systematic Investment Plan invests a fixed amount at regular intervals. It can help build discipline, but it does not guarantee returns or eliminate market risk. Use the SIP Planner to compare contribution, horizon, and assumed return scenarios.'},
 {keys:['diversif','allocation','rebalance'],title:'Diversification and allocation',answer:'Diversification spreads investments across assets and sectors to reduce concentration risk. A useful starting point is to review goals, time horizon, liquidity needs, and your tolerance for losses before choosing any allocation. Rebalancing can restore a planned mix, but can trigger taxes and costs.'},
 {keys:['pe ratio','p/e','valuation'],title:'Understanding the P/E ratio',answer:'Price-to-earnings (P/E) divides a company’s market price per share by earnings per share. Compare it with peers, history, growth, and accounting quality. A low P/E is not automatically cheap, and a high P/E is not automatically expensive.'},
 {keys:['inflation'],title:'Inflation and real returns',answer:'Inflation reduces purchasing power. For an assumed nominal annual return r and inflation i, approximate real return as (1+r)/(1+i)−1. Compare future goals in both nominal rupees and today’s purchasing power.'},
 {keys:['tax','stcg','ltcg'],title:'Indian investment taxes',answer:'Tax rules vary by asset, holding period, transaction, and tax year. Check the applicable FY rules, capital gains classification, STT, cess and surcharges using official Income Tax Department guidance before relying on any estimate. This app intentionally does not fabricate tax liabilities.'},
 {keys:['risk','volatility','drawdown'],title:'Risk is more than price changes',answer:'Risk includes permanent loss, volatility, liquidity, leverage, and concentration. Equities can fall sharply, and expected returns are uncertain. Compare your goal horizon and emergency reserve before committing funds.'},
 {keys:['nse','bse','market hours'],title:'Indian exchanges and market timing',answer:'NSE and BSE are Indian stock exchanges. Normal NSE cash-market trading typically occurs on business days, but trading holidays and special sessions can alter the schedule. Use an official exchange calendar or authenticated provider market-status endpoint for accurate status.'},
 {keys:['data','live','real time','realtime','delayed'],title:'Quote freshness and integrity',answer:'With a valid Upstox access token, the server requests current exchange snapshot quotes. Without it, public-source prices may be delayed; if those fail, the interface explicitly displays sample figures. Check the badge and quote timestamp before making decisions.'},
];
app.post('/api/assistant',safe(async(req,res)=>{const question=String(req.body?.question||'').slice(0,450).trim();if(!question)return res.status(400).json({error:'Enter a question.'});
  const lower=question.toLowerCase();const found=topics.find(t=>t.keys.some(k=>lower.includes(k)));
  const symbol=catalog.find(s=>new RegExp(`\\b${s.symbol.toLowerCase()}\\b`).test(lower)||lower.includes(s.name.toLowerCase()));
  let title=found?.title||'Investment research framework';let answer=found?.answer||'For any investment, examine your goal and time horizon, cash-flow needs, product costs, concentration risk, and evidence from trusted disclosures. The Markets tab provides quotes and historical charts, while the Portfolio and Planner sections help model scenarios. No guaranteed returns or specific buy/sell instructions are offered.';
  if(symbol){const quote=(await getQuotes([symbol.symbol]))[0];title=`${symbol.name} — market context`;answer=`${symbol.name} (${symbol.symbol}) is listed in the ${symbol.sector} segment. Displayed price: ${quote.price>0?'₹'+Number(quote.price).toLocaleString('en-IN',{maximumFractionDigits:2}):'unavailable'}; change: ${quote.changePct}%. Source: ${quote.source==='demo'?'SAMPLE DATA, not market data':quote.source==='upstox'?'authenticated Upstox market snapshot':'public data, may be delayed'}. A price move alone cannot establish fair value. Review earnings, leverage, growth, disclosures, competitive position, and liquidity before considering any investment.`;}
  // Optional external AI model. Input is limited to the user's question and source-labelled market snapshots;
  // no holdings, watchlists, risk answers, tokens or personal financial data are sent.
  let mode='rule-based educational engine';const sources=symbol?['Market quote feed: '+(quoteSourceHint(symbol.symbol))]:[];
  if(process.env.OPENAI_API_KEY){try{
    const context=symbol?await getQuotes([symbol.symbol]):[];
    const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',signal:AbortSignal.timeout(14000),headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.OPENAI_API_KEY}`},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-4.1-mini',max_output_tokens:500,store:false,instructions:'You are Avi Research, an India-focused educational financial research assistant. Explain financial concepts and securities research objectively with clear uncertainty. You are NOT a SEBI-registered investment adviser; never give personalized buy/sell/hold instructions, asset-specific targets, guaranteed returns, or claim live data when sample/delayed. Distinguish facts provided in context from unknowns. Avoid inventing earnings, valuation multiples, filings, returns or external citations. Only cite provided provider/source details; otherwise prompt user to verify current filings. Keep answer under 220 words.',input:`Question: ${question}\nSource-labelled market context (may be SAMPLE/DELAYED): ${JSON.stringify(context.map(q=>({symbol:q.symbol,price:q.price,changePct:q.changePct,source:q.source,asOf:q.asOf,isDemo:q.isDemo})))}`})});
    if(response.ok){const result=await response.json();const output=Array.isArray(result.output)?result.output.flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('\n'):'';if(output){answer=output;title='Avi AI educational research';mode='optional AI model · no personalised advice';}}else{console.warn('AI provider returned status',response.status)}
  }catch(e){console.warn('Optional AI provider unavailable',e.message);}}
  res.json({title,answer,mode,sources,disclaimer:'Educational information, not individualized investment advice.'});
}));
const dist=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist');
app.use(express.static(dist));app.get('*',(req,res,next)=>{if(req.path.startsWith('/api/'))return res.status(404).json({error:'Not found'});res.sendFile(path.join(dist,'index.html'),err=>err&&next(err));});
app.listen(port,'127.0.0.1',()=>{startStreams();console.log(`AviNivesh Pro 2.0 API ready at http://localhost:${port}`)});
