import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog,selectSymbols} from '../server/catalog.js';
import {demoSeries,getQuotes,getHistory} from '../server/market.js';
process.env.DATA_MODE='demo';
test('symbols reject input outside known universe',()=>{assert.deepEqual(selectSymbols('RELIANCE,INVALID,NIFTY50,reliance'),['RELIANCE','NIFTY50']);});
test('demo series deterministic across calls on same day',()=>{const a=demoSeries(catalog[2],'1M'),b=demoSeries(catalog[2],'1M');assert.deepEqual(a,b);assert.ok(a.length>20);assert.equal(a.at(-1).price,catalog[2].demo);});
test('demo prices explicitly labelled and not live',async()=>{const [q]=await getQuotes(['RELIANCE']);assert.equal(q.source,'demo');assert.equal(q.isDemo,true);assert.equal(q.asOf,null);assert.equal(q.delayed,true);});
test('historical data sample clearly labelled',async()=>{const h=await getHistory('NIFTY50','3M');assert.equal(h.source,'demo');assert.ok(h.series.length>30);});
