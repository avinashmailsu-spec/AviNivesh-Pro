// AviNivesh Pro 2.0 — deterministic educational analytics. No trade recommendations.
export const mean = a => a.length ? a.reduce((s,n)=>s+n,0)/a.length : 0;
export const deviation = a => a.length>1 ? Math.sqrt(a.reduce((s,n)=>s+(n-mean(a))**2,0)/(a.length-1)) : 0;
export const dailyReturns = prices => prices.slice(1).map((v,i)=>prices[i]>0?v/prices[i]-1:0).filter(Number.isFinite);
export function riskMetrics(prices=[],benchmark=[],annualRiskFree=0.06){
 const p=prices.filter(n=>Number.isFinite(n)&&n>0);if(p.length<2)return {volatility:null,maxDrawdown:null,sharpe:null,totalReturn:null,correlation:null,days:p.length};
 const r=dailyReturns(p);const dailyMean=mean(r);let peak=p[0],drawdown=0;
 for(const v of p){peak=Math.max(peak,v);drawdown=Math.min(drawdown,v/peak-1);}
 const br=dailyReturns(benchmark.filter(n=>Number.isFinite(n)&&n>0));const n=Math.min(r.length,br.length);
 const ar=r.slice(-n),b=br.slice(-n);const cov=n>1?mean(ar.map((v,i)=>(v-mean(ar))*(b[i]-mean(b)))):0;
 const denom=deviation(ar)*deviation(b);
 return {volatility:deviation(r)*Math.sqrt(252)*100,maxDrawdown:drawdown*100,sharpe:deviation(r)?(dailyMean*252-annualRiskFree)/(deviation(r)*Math.sqrt(252)):null,totalReturn:(p.at(-1)/p[0]-1)*100,correlation:n>2&&denom?cov/denom:null,days:p.length};
}
export function xirr(flows=[],guess=.1){
 const a=flows.filter(f=>Number.isFinite(Number(f.amount))&&!Number.isNaN(Date.parse(f.date))).map(f=>({...f,amount:Number(f.amount),date:new Date(f.date)}));
 if(a.length<2||!a.some(f=>f.amount<0)||!a.some(f=>f.amount>0))return null;
 const t0=Math.min(...a.map(f=>f.date.getTime()));const npv=rate=>a.reduce((sum,f)=>sum+f.amount/Math.pow(1+rate,(f.date.getTime()-t0)/86400000/365),0);
 let lo=-.99999,hi=1;for(let i=0;i<30&&npv(lo)*npv(hi)>0;i++)hi=hi*2+1;
 if(npv(lo)*npv(hi)>0)return null;
 for(let i=0;i<110;i++){const m=(lo+hi)/2;if(npv(lo)*npv(m)>0)lo=m;else hi=m;}
 const rate=(lo+hi)/2;return Number.isFinite(rate)?rate*100:null;
}
export function weightedAllocation(assets=[]){const groups={};for(const x of assets){const value=Math.max(0,Number(x.value)||0);const k=x.type||'Other';groups[k]=(groups[k]||0)+value;}const total=Object.values(groups).reduce((a,b)=>a+b,0);return Object.entries(groups).map(([name,value])=>({name,value,percent:total?100*value/total:0})).sort((a,b)=>b.value-a.value)}
export function rebalancePlan(assets=[],target={Equity:50,'Fixed Income':30,Gold:10,Cash:10}){const allocation=weightedAllocation(assets),total=allocation.reduce((s,a)=>s+a.value,0);return Object.entries(target).map(([type,percent])=>{const current=allocation.find(a=>a.name===type)?.value||0;const desired=total*percent/100;return {type,current,desired,difference:desired-current,percent:Number(percent)}})}
export function concentrationRisk(assets=[]){const total=assets.reduce((s,a)=>s+Math.max(0,Number(a.value)||0),0);if(total<=0)return {largest:0,top3:0,herfindahl:0};const p=assets.map(a=>Math.max(0,Number(a.value)||0)/total).sort((a,b)=>b-a);return {largest:(p[0]||0)*100,top3:p.slice(0,3).reduce((a,b)=>a+b,0)*100,herfindahl:p.reduce((a,b)=>a+b*b,0)*10000};}
export function stressTest(assets=[],shocks={Equity:-25,'Fixed Income':-4,Gold:10,Cash:0,Other:-10}){const rows=assets.map(x=>({name:x.name||x.symbol||x.type,type:x.type||'Other',before:Number(x.value)||0,after:(Number(x.value)||0)*(1+(Number(shocks[x.type]??shocks.Other)||0)/100)}));const before=rows.reduce((a,b)=>a+b.before,0),after=rows.reduce((a,b)=>a+b.after,0);return {rows,before,after,change:after-before,changePct:before?(after/before-1)*100:0};}
export function goalModel({target=5000000,years=15,inflation=6,monthly=15000,initial=0,rate=10}={}){
 const nominalTarget=Number(target)*Math.pow(1+Number(inflation)/100,Number(years));
 const mr=Math.pow(1+Number(rate)/100,1/12)-1;const months=Math.max(0,Math.round(Number(years)*12));
 const factor=Math.abs(mr)>1e-12?(Math.pow(1+mr,months)-1)/mr:months;
 const projected=Number(initial)*Math.pow(1+mr,months)+Number(monthly)*factor;
 const required=Math.max(0,(nominalTarget-Number(initial)*Math.pow(1+mr,months))/Math.max(1,factor));
 return {nominalTarget,projected,required,progress:nominalTarget?projected/nominalTarget*100:0,gap:Math.max(0,nominalTarget-projected)};
}
export function monteCarlo({initial=0,monthly=10000,years=15,expected=10,volatility=18,paths=320,seed=7421}={}){
 // Seeded PRNG and Box–Muller, annualised geometric Brownian shock. Purely illustrative.
 let state=seed>>>0;const rand=()=>{state=(1664525*state+1013904223)>>>0;return (state+.5)/4294967296};
 const simulations=[];const months=Math.min(600,Math.max(1,Math.round(years*12)));const drift=Number(expected)/100,vol=Number(volatility)/100;
 for(let k=0;k<Math.min(paths,1000);k++){let value=Math.max(0,Number(initial));for(let m=0;m<months;m++){const u=Math.max(1e-9,rand()),v=rand();const z=Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);value=value*Math.exp((drift-vol*vol/2)/12+vol/Math.sqrt(12)*z)+Number(monthly);}simulations.push(value);}
 simulations.sort((a,b)=>a-b);const at=p=>simulations[Math.floor((simulations.length-1)*p)];return {p10:at(.1),median:at(.5),p90:at(.9),paths:simulations.length};
}
export function estimateTaxScenario({gain=0,exemption=0,rate=12.5,cess=4,surcharge=0,lossSetoff=0}={}){
 const taxable=Math.max(0,Number(gain)-Number(exemption)-Number(lossSetoff));const base=taxable*Math.max(0,Number(rate))/100;const sur=base*Math.max(0,Number(surcharge))/100;const tax=(base+sur)*(1+Math.max(0,Number(cess))/100);return {taxable,base,cessAmount:tax-base-sur,surchargeAmount:sur,tax,netGain:Number(gain)-tax};
}
export function retirementCorpus({expense=60000,years=25,inflation=6,withdrawalRate=3.5}={}){const futureMonthly=Number(expense)*Math.pow(1+Number(inflation)/100,Number(years));return {futureMonthly,corpus:futureMonthly*12/(Number(withdrawalRate)/100)};}
export function parseCsv(content=''){
 const rows=[];let row=[],field='',quoted=false;const s=String(content).replace(/^\uFEFF/,'');
 for(let i=0;i<s.length;i++){const c=s[i];if(c==='"'){if(quoted&&s[i+1]==='"'){field+='"';i++}else quoted=!quoted;}else if(c===','&&!quoted){row.push(field);field='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&s[i+1]==='\n')i++;row.push(field);if(row.some(x=>x!==''))rows.push(row);row=[];field='';}else field+=c;}
 if(quoted)throw new Error('Unclosed CSV quote.');row.push(field);if(row.some(x=>x!==''))rows.push(row);
 if(rows.length<2)return [];const keys=rows[0].map(x=>x.trim().toLowerCase());return rows.slice(1).map(line=>Object.fromEntries(keys.map((k,i)=>[k,(line[i]||'').trim()])));
}
export function makeCsv(rows=[],fields=[]){const keys=fields.length?fields:Object.keys(rows[0]||{});const safe=s=>{const value=String(s??'');const guarded=(typeof s==='number'&&Number.isFinite(s))?value:(/^[=+@\-\t\r]/.test(value)?"'"+value:value);return '"'+guarded.replace(/"/g,'""')+'"';};return [keys.map(safe).join(','),...rows.map(r=>keys.map(k=>safe(r[k])).join(','))].join('\r\n');}
export const formatLakhs=n=>{const x=Number(n)||0;return Math.abs(x)>=1e7?`₹${(x/1e7).toFixed(2)} Cr`:Math.abs(x)>=1e5?`₹${(x/1e5).toFixed(2)} L`:`₹${x.toLocaleString('en-IN',{maximumFractionDigits:0})}`;};
