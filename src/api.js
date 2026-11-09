import {createClient} from '@supabase/supabase-js';
const url=import.meta.env.VITE_SUPABASE_URL,key=import.meta.env.VITE_SUPABASE_ANON_KEY;
const client=url&&key?createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}}):null;
export async function publicData(table,fallback){if(!client)return {items:fallback,live:false};try{const {data,error}=await client.from(table).select('*').eq('published',true);if(error)throw error;return {items:(!data?.length&&table!=='counsellors')?fallback:(data||[]),live:true};}catch{return {items:fallback,live:false,error:true};}}
export async function intakeStatus(){try{const r=await fetch('/api/status');if(!r.ok)return false;const j=await r.json();return j.intakeEnabled===true;}catch{return false;}}
export async function sendRequest(payload){const r=await fetch('/api/requests',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const j=await r.json();if(!r.ok)throw new Error(j.error||'Your request could not be sent. Please try again later.');return j;}
