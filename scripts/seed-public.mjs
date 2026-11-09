import {articles,helplines} from '../src/data.js';
const quote=value=>value===null?'null':"'"+String(value).replaceAll("'","''")+"'";
console.log('-- Public content only. Review articles locally before production.');
for(const [table,items,key] of [['helplines',helplines,'id'],['articles',articles,'slug']])for(const item of items){const row={...item,published:true};const columns=Object.keys(row);console.log(`insert into public.${table} (${columns.map(c=>'"'+c+'"').join(',')}) values (${columns.map(c=>typeof row[c]==='boolean'?String(row[c]):Array.isArray(row[c])?quote(JSON.stringify(row[c]))+'::jsonb':quote(row[c])).join(',')}) on conflict (${key}) do nothing;`);}
