import express from 'express';
import {createClient} from '@supabase/supabase-js';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {validateRequest} from './validation.js';
const app=express(), root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const configured=Boolean(process.env.SUPABASE_URL&&process.env.SUPABASE_SERVICE_ROLE_KEY&&process.env.ENABLE_INTAKE==='true');
const db=configured?createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}}):null;
app.disable('x-powered-by');app.use((req,res,next)=>{res.set({'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'SAMEORIGIN'});if(req.path.startsWith('/api'))res.set('Cache-Control','no-store');next()});app.use(express.json({limit:'12kb'}));
app.get('/api/status',(req,res)=>res.json({intakeEnabled:configured}));
// Single-process basic throttle. Production needs shared rate limits and abuse protection.
const windows=new Map();
app.post('/api/requests',async(req,res)=>{
 if(!configured)return res.status(503).json({error:'Requests are not enabled. Please use the helpline directory.'});
 const origin=req.get('origin');if(!process.env.APP_ORIGIN||origin!==process.env.APP_ORIGIN)return res.status(403).json({error:'Request origin is not permitted.'});
 const key=req.ip,now=Date.now();for(const [k,v] of windows)if(now-v.start>3600000)windows.delete(k);
 const slot=windows.get(key)||{start:now,count:0};if(slot.count>=5)return res.status(429).json({error:'Too many requests. Please try again later.'});slot.count++;windows.set(key,slot);
 const invalid=validateRequest(req.body);if(invalid)return res.status(400).json({error:invalid});
 const b=req.body;try{const {error}=await db.from('support_requests').insert({message:b.message.trim(),channel:b.channel,contact:b.contact.trim(),safe_time:b.safeTime.trim(),voicemail:b.channel==='phone'&&b.voicemail===true,consent:true,provider_id:b.provider||null});if(error)throw error;return res.status(201).json({received:true});}catch{return res.status(503).json({error:'Your request could not be saved. Please try again later or use a listed helpline.'})}
});
app.use('/calculator',express.static(path.join(root,'dist/calculator'),{setHeaders(res,file){if(file.endsWith('sw.js'))res.set('Cache-Control','no-cache')}}));
app.use(express.static(path.join(root,'dist')));app.use((req,res)=>{if(req.path.startsWith('/api/'))return res.status(404).json({error:'Not found'});res.sendFile(path.join(root,'dist/index.html'))});
app.use((err,req,res,next)=>res.status(400).json({error:'The request could not be processed.'}));
app.listen(Number(process.env.PORT)||3000,()=>console.log('Nilaha server ready; intake '+(configured?'enabled':'disabled')));
