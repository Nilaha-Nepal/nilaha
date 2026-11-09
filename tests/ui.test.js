import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {JSDOM} from 'jsdom';
const delay=()=>new Promise(resolve=>setTimeout(resolve,35));
async function setup(){const compiled=await build({entryPoints:['src/main.jsx'],bundle:true,write:false,format:'iife',platform:'browser',loader:{'.css':'empty'},define:{'import.meta.env':'{}','process.env.NODE_ENV':'"production"'}});const dom=new JSDOM('<div id="root"></div>',{url:'https://nilaha.example/',runScripts:'outside-only',pretendToBeVisual:true});dom.window.scrollTo=()=>{};dom.window.fetch=async()=>({ok:true,json:async()=>({intakeEnabled:false})});dom.window.eval(compiled.outputFiles[0].text);await delay();return dom;}
async function route(dom,to){dom.window.history.pushState({},'',to);dom.window.dispatchEvent(new dom.window.PopStateEvent('popstate'));await delay();}
test('public routes, directory filters, article filters and honest demo submission',async()=>{const dom=await setup(),d=dom.window.document;try{
assert.match(d.querySelector('h1').textContent,/help with/);assert.ok(d.querySelector('a[href="/calculator/"]'));
await route(dom,'/counsellors');assert.equal(d.querySelectorAll('.profile-card').length,3);
const language=d.querySelector('[aria-label="Filter by language"]');language.value='Newari';language.dispatchEvent(new dom.window.Event('change',{bubbles:true}));await delay();assert.equal(d.querySelectorAll('.profile-card').length,1);
d.querySelector('.text-button').click();await delay();assert.equal(d.querySelectorAll('.profile-card').length,3);
await route(dom,'/counsellors/sample-1');assert.match(d.body.textContent,/not a real practitioner/i);assert.match(d.body.textContent,/Appointments aren’t open/);
await route(dom,'/articles');assert.equal(d.querySelectorAll('.article-card').length,4);[...d.querySelectorAll('.category-tabs button')].find(b=>b.textContent==='Counselling').click();await delay();assert.equal(d.querySelectorAll('.article-card').length,1);
await route(dom,'/articles/digital-privacy');assert.match(d.querySelector('h1').textContent,/quick exit/);
await route(dom,'/help');assert.equal(d.querySelector('a[href="tel:1145"]').textContent.includes('1145'),true);assert.equal(d.querySelector('a[href="tel:100"]')!==null,true);
const form=d.querySelector('.request-panel form');form.dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));await delay();assert.match(d.querySelector('.confirmation').textContent,/No message was sent/);assert.equal(d.querySelector('textarea'),null);
for(const path of ['/support-someone','/about','/privacy']){await route(dom,path);assert.ok(d.querySelector('h1'));}
await route(dom,'/helplines');assert.ok(d.querySelector('a[href="tel:1145"]'));await route(dom,'/children');assert.match(d.querySelector('h1').textContent,/Children/);
}finally{dom.window.close();}});
