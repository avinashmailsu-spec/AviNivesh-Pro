import test from 'node:test';
import assert from 'node:assert/strict';
import {sipProjection,goalSip,lumpSumProjection,realValue,calculatePortfolio,riskProfile} from '../src/finance.js';
test('SIP without returns equals sum of contributions',()=>{const p=sipProjection({monthly:1000,years:2,rate:0});assert.equal(p.invested,24000);assert.equal(p.value,24000);assert.equal(p.series.length,3);});
test('step-up deposits increase each year',()=>{const p=sipProjection({monthly:1000,years:2,rate:0,stepUp:10});assert.ok(Math.abs(p.invested-25200)<1e-6);});
test('goal solver attains target',()=>{const m=goalSip(1000000,10,10);const p=sipProjection({monthly:m,years:10,rate:10});assert.ok(Math.abs(p.value-1000000)<0.1);});
test('lump sum and inflation math',()=>{assert.equal(lumpSumProjection(100,2,10),121.00000000000001);assert.ok(Math.abs(realValue(121,2,10)-100)<0.00001);});
test('portfolio analytics and demo flag',()=>{const p=calculatePortfolio([{symbol:'TCS',qty:3,avg:100,sector:'IT'}],[{symbol:'TCS',price:120,isDemo:true,source:'demo'}]);assert.equal(p.value,360);assert.equal(p.pl,60);assert.equal(p.alloc[0].name,'IT');assert.equal(p.containsSamplePrices,true);});
test('risk questionnaire categories',()=>{assert.equal(riskProfile([1,1,1,1,1]).name,'Conservative');assert.equal(riskProfile([3,3,3,3,3]).name,'Growth-oriented');});
