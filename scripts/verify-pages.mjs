import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {build} from 'esbuild';
import {JSDOM} from 'jsdom';
const js=await build({entryPoints:['src/main.jsx'],bundle:true,write:false,format:'iife',platform:'browser',loader:{'.css':'empty'},define:{'import.meta.env':'{}','process.env.NODE_ENV':'"production"'}});
const paths=[];function walk(folder){for(const entry of readdirSync(folder,{withFileTypes:true})){const file=folder+'/'+entry.name;if(entry.isDirectory()){if(!file.includes('/calculator')&&!file.includes('/assets'))walk(file);}else if(entry.name==='index.html')paths.push(file);}}
walk('dist');let errors=[];
for(const file of paths){
 const html=readFileSync(file,'utf8'),route=file==='dist/index.html'?'/':file.slice(4,-10);
 assert.ok(!html.includes('/src/main.jsx'),'Unbuilt source in '+file);
 const dom=new JSDOM(html,{url:'https://nilaha.com'+route,runScripts:'outside-only',pretendToBeVisual:true}),d=dom.window.document;
 assert.ok(d.querySelector('h1'),'Missing pre-rendered heading in '+file);
 assert.ok(d.querySelector('link[rel=canonical]'),'Missing canonical in '+file);
 for(const a of d.querySelectorAll('a[href^="/"]')){const target=a.getAttribute('href').split('#')[0];assert.ok(existsSync('dist'+target+'index.html')||existsSync('dist'+target),'Missing linked page '+target+' in '+file)}
 for(const el of d.querySelectorAll('[src^="/assets/"],[href^="/assets/"]'))assert.ok(existsSync('dist'+(el.getAttribute('src')||el.getAttribute('href'))),'Missing built asset');
 dom.window.scrollTo=()=>{};dom.window.fetch=async()=>({ok:true,json:async()=>({intakeEnabled:false})});dom.window.console.error=(...args)=>errors.push(file+': '+args.join(' '));
 dom.window.eval(js.outputFiles[0].text);d.querySelector('button[aria-label="Search website"]').click();
 const deadline=Date.now()+3000;while(!d.querySelector('.search-panel')&&Date.now()<deadline)await new Promise(resolve=>setTimeout(resolve,10));
 assert.ok(d.querySelector('.search-panel'),'Hydrated search control did not respond in '+file);
 assert.ok(d.querySelector('h1'),'Page lost content during hydration: '+file);
 dom.window.close();
}
assert.deepEqual(errors,[],'Hydration must not report errors');
assert.ok(existsSync('dist/calculator/index.html'));
console.log(`Verified ${paths.length} pre-rendered pages, internal links, built assets and React hydration.`);
