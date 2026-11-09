// Publish the built public files as a separate branch, without changing the source checkout.
import {spawnSync} from 'node:child_process';
import {mkdtempSync,rmSync,existsSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
const branch='webapp';
function git(args,options={}){const r=spawnSync('git',args,{encoding:'utf8',...options});if(r.status!==0)throw new Error(r.stderr||'Git command failed');return r.stdout.trim();}
const root=git(['rev-parse','--show-toplevel']),dist=path.join(root,'dist');
for(const name of ['index.html','assets','calculator/index.html'])if(!existsSync(path.join(dist,name)))throw new Error('Missing build output: '+name+'. Run npm run build first.');
if(readFileSync(path.join(dist,'index.html'),'utf8').includes('/src/main.jsx'))throw new Error('Refusing to publish unbuilt source.');
const dir=mkdtempSync(path.join(tmpdir(),'nilaha-publish-'));
try{
 const gitDir=git(['rev-parse','--absolute-git-dir']);
 const env={...process.env,GIT_INDEX_FILE:path.join(dir,'index')};
 const opts={env,cwd:dist};
 const common=['--git-dir='+gitDir,'--work-tree='+dist];
 git([...common,'read-tree','--empty'],opts);
 git([...common,'add','--force','--all','.'],opts);
 const tree=git([...common,'write-tree'],opts);
 const fetch=spawnSync('git',['fetch','origin',branch],{encoding:'utf8',cwd:root});
 const parent=fetch.status===0?git(['rev-parse','FETCH_HEAD']):null;
 const source=git(['rev-parse','HEAD']);
 const commit=git(['commit-tree',tree,...(parent?['-p',parent]:[])],{input:'Build website for Hostinger from '+source+'\n'});
 git(['update-ref','refs/heads/'+branch,commit]);
 if(process.argv.includes('--push'))git(['push','origin','refs/heads/'+branch+':refs/heads/'+branch]);
 console.log('Prepared '+branch+' at '+commit+' from source '+source);
}finally{rmSync(dir,{recursive:true,force:true});}
