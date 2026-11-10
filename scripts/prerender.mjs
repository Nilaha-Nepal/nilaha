import {createServer} from 'vite';
import {createElement} from 'react';
import {renderToString} from 'react-dom/server';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import path from 'node:path';
import {articles,counsellors} from '../src/data.js';
const staticPages=[['/','Support hub'],['/understand','Situation Navigator'],['/plan','My Safety Plan'],['/help','Get help'],['/helplines','Helplines in Nepal'],['/request-support','Request support'],['/children','Children & families'],['/counsellors','Find a counsellor'],['/articles','Information & resources'],['/support-someone','Support someone'],['/about','About us'],['/privacy','Privacy & digital safety']];
const pages=[...staticPages,...articles.map(a=>['/articles/'+a.slug,a.title]),...counsellors.map(c=>['/counsellors/'+c.id,c.name])];
const template=readFileSync('dist/index.html','utf8');
const escape=value=>value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
try{
 const {App}=await server.ssrLoadModule('/src/main.jsx');
 for(const [route,title] of pages){
  const markup=renderToString(createElement(App,{initialRoute:route}));
  const output=template.replace('<div id="root"></div>',`<div id="root" data-route="${escape(route)}">${markup}</div>`).replace(/<title>.*?<\/title>/,`<title>${escape(title)} — Nilaha</title>`).replace('</head>',`<link rel="canonical" href="https://nilaha.com${route==='/'?'/':route+'/'}"></head>`);
  const directory=route==='/'?'dist':path.join('dist',route.slice(1));mkdirSync(directory,{recursive:true});writeFileSync(path.join(directory,'index.html'),output);
 }
 console.log(`Pre-rendered ${pages.length} independent pages plus the calculator.`);
}finally{await server.close()}
