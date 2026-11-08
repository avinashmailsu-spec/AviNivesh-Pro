export const inr=(v,maximumFractionDigits=2)=>v==null||!Number.isFinite(Number(v))?'—':'₹'+Number(v).toLocaleString('en-IN',{maximumFractionDigits,minimumFractionDigits:maximumFractionDigits===0?0:2});
export const compact=(v)=>{const a=Math.abs(Number(v)||0);return (v<0?'-':'')+(a>=1e7?'₹'+(a/1e7).toFixed(2)+' Cr':a>=1e5?'₹'+(a/1e5).toFixed(2)+' L':'₹'+a.toLocaleString('en-IN',{maximumFractionDigits:0}));};
export const pct=(n,decimals=2)=>`${Number(n||0)>=0?'+':''}${Number(n||0).toFixed(decimals)}%`;
export const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
export const formatDate=(value)=>value?new Intl.DateTimeFormat('en-IN',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Kolkata'}).format(new Date(value)):'Not available';
export function sipProjection({monthly=10000,years=10,rate=12,stepUp=0,initial=0}) {
  const months=Math.max(0,Math.floor(Number(years)*12));const mr=Math.pow(1+Number(rate)/100,1/12)-1;
  let value=Number(initial),invested=Number(initial);const series=[{year:0,value,invested}];
  for(let m=1;m<=months;m++){
    const contribution=Number(monthly)*Math.pow(1+Number(stepUp)/100,Math.floor((m-1)/12));
    value=value*(1+mr)+contribution;invested+=contribution;
    if(m%12===0)series.push({year:m/12,value:Math.round(value),invested:Math.round(invested)});
  }
  return {value,invested,gain:value-invested,series};
}
export function goalSip(goal,years,rate,stepUp=0,initial=0) {
  const target=Math.max(0,Number(goal));if(target===0)return 0;
  if(years<=0)return Infinity;
  let low=0,high=target;
  for(let i=0;i<70;i++){const mid=(low+high)/2;if(sipProjection({monthly:mid,years,rate,stepUp,initial}).value>=target)high=mid;else low=mid;}
  return high;
}
export function lumpSumProjection(principal,years,rate){return Number(principal)*Math.pow(1+Number(rate)/100,Number(years));}
export function realValue(nominal,years,inflation){return nominal/Math.pow(1+Number(inflation)/100,Number(years));}
export function calculatePortfolio(holdings=[],quotes=[]){const bySymbol=new Map(quotes.map(q=>[q.symbol,q]));
  const rows=holdings.map(h=>{const quote=bySymbol.get(h.symbol);const invested=Number(h.qty)*Number(h.avg);const livePrice=quote&&!quote.isDemo?quote.price:null;
    const referencePrice=quote?.price??Number(h.avg);const value=Number(h.qty)*referencePrice;
    return {...h,invested,value,pl:value-invested,plPct:invested?(value-invested)/invested*100:0,price:referencePrice,source:quote?.source||'unknown',isSampleQuote:!livePrice};
  });const invested=rows.reduce((s,r)=>s+r.invested,0),value=rows.reduce((s,r)=>s+r.value,0);
  const alloc=Object.values(rows.reduce((a,h)=>{const group=h.sector||'Other';if(!a[group])a[group]={name:group,value:0};a[group].value+=h.value;return a;},{})).sort((a,b)=>b.value-a.value);
  return {rows,invested,value,pl:value-invested,plPct:invested?(value-invested)/invested*100:0,alloc,containsSamplePrices:rows.some(r=>r.isSampleQuote)};
}
export function riskProfile(answers){const total=answers.reduce((a,n)=>a+Number(n||0),0);
  if(total<=8)return {name:'Conservative',score:total,description:'Your responses indicate greater emphasis on capital stability and near-term access.',allocation:[{name:'Equity',value:25},{name:'Fixed income',value:55},{name:'Gold',value:10},{name:'Cash',value:10}]};
  if(total<=14)return {name:'Balanced',score:total,description:'Your responses suggest a balance of growth objectives and risk control.',allocation:[{name:'Equity',value:50},{name:'Fixed income',value:35},{name:'Gold',value:10},{name:'Cash',value:5}]};
  return {name:'Growth-oriented',score:total,description:'Your responses suggest a longer-term growth preference and greater ability to tolerate fluctuations.',allocation:[{name:'Equity',value:70},{name:'Fixed income',value:20},{name:'Gold',value:5},{name:'Cash',value:5}]};
}
export const seedHoldings=[
 {id:'sample-1',symbol:'RELIANCE',qty:12,avg:1320,sector:'Energy & Retail'},
 {id:'sample-2',symbol:'TCS',qty:6,avg:3280,sector:'Technology'},
 {id:'sample-3',symbol:'HDFCBANK',qty:24,avg:850,sector:'Banking'},
 {id:'sample-4',symbol:'INFY',qty:14,avg:1550,sector:'Technology'},
 {id:'sample-5',symbol:'ITC',qty:40,avg:390,sector:'FMCG'},
];
