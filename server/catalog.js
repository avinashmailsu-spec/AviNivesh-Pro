// Validated common NSE instrument keys; update with the official Upstox instrument master as needed.
export const catalog = [
  { symbol:'NIFTY50', name:'NIFTY 50', category:'Index', sector:'Benchmark', key:'NSE_INDEX|Nifty 50', yahoo:'^NSEI', color:'#50dac4', demo:24820.40 },
  { symbol:'BANKNIFTY', name:'NIFTY Bank', category:'Index', sector:'Benchmark', key:'NSE_INDEX|Nifty Bank', yahoo:'^NSEBANK', color:'#a88cff', demo:52310.80 },
  { symbol:'RELIANCE', name:'Reliance Industries', category:'Equity', sector:'Energy & Retail', key:'NSE_EQ|INE002A01018', yahoo:'RELIANCE.NS', color:'#7686ff', demo:1450.20 },
  { symbol:'TCS', name:'Tata Consultancy Services', category:'Equity', sector:'Technology', key:'NSE_EQ|INE467B01029', yahoo:'TCS.NS', color:'#9b8dff', demo:3545.80 },
  { symbol:'INFY', name:'Infosys', category:'Equity', sector:'Technology', key:'NSE_EQ|INE009A01021', yahoo:'INFY.NS', color:'#55addb', demo:1680.75 },
  { symbol:'HDFCBANK', name:'HDFC Bank', category:'Equity', sector:'Banking', key:'NSE_EQ|INE040A01034', yahoo:'HDFCBANK.NS', color:'#86bdff', demo:965.35 },
  { symbol:'ICICIBANK', name:'ICICI Bank', category:'Equity', sector:'Banking', key:'NSE_EQ|INE090A01021', yahoo:'ICICIBANK.NS', color:'#e5b86a', demo:1314.25 },
  { symbol:'SBIN', name:'State Bank of India', category:'Equity', sector:'Banking', key:'NSE_EQ|INE062A01020', yahoo:'SBIN.NS', color:'#50cba3', demo:865.45 },
  { symbol:'ITC', name:'ITC Limited', category:'Equity', sector:'FMCG', key:'NSE_EQ|INE154A01025', yahoo:'ITC.NS', color:'#e4b071', demo:415.30 },
  { symbol:'HINDUNILVR', name:'Hindustan Unilever', category:'Equity', sector:'FMCG', key:'NSE_EQ|INE030A01027', yahoo:'HINDUNILVR.NS', color:'#da99d5', demo:2431.40 },
  { symbol:'LT', name:'Larsen & Toubro', category:'Equity', sector:'Infrastructure', key:'NSE_EQ|INE018A01030', yahoo:'LT.NS', color:'#86a0ff', demo:3560.60 },
  { symbol:'AXISBANK', name:'Axis Bank', category:'Equity', sector:'Banking', key:'NSE_EQ|INE238A01034', yahoo:'AXISBANK.NS', color:'#e49eb3', demo:1136.75 },
  { symbol:'BHARTIARTL', name:'Bharti Airtel', category:'Equity', sector:'Telecom', key:'NSE_EQ|INE397D01024', yahoo:'BHARTIARTL.NS', color:'#f3948d', demo:1870.20 },
  { symbol:'MARUTI', name:'Maruti Suzuki India', category:'Equity', sector:'Auto', key:'NSE_EQ|INE585B01010', yahoo:'MARUTI.NS', color:'#b7aaff', demo:13455.40 }
];
export const symbols = new Map(catalog.map(s => [s.symbol, s]));
export function selectSymbols(raw='') {
  return [...new Set(String(raw).split(',').map(x=>x.trim().toUpperCase()).filter(x=>symbols.has(x)))].slice(0,25);
}
