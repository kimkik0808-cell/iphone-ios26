#!/usr/bin/env node
// Generates a static, cacheable Reels index; no runtime GitHub API needed.
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../instagram/reels');
const ext=/\.(mp4|m4v|mov)$/i;
const encode=p=>p.split('/').map(encodeURIComponent).join('/');
const groups={public:[],private:[]};
for(const account of Object.keys(groups)){
 const dir=path.join(root,account);
 if(!fs.existsSync(dir))continue;
 const files=fs.readdirSync(dir,{withFileTypes:true}).filter(x=>x.isFile()&&ext.test(x.name))
   .map(x=>x.name).sort((a,b)=>a.localeCompare(b,'ko',{numeric:true}));
 for(const name of files){
  const full=path.join(dir,name);
  const size=fs.statSync(full).size;
  if(!size)continue;
  const digest=crypto.createHash('sha1').update(fs.readFileSync(full)).digest('hex').slice(0,12);
  const filename=path.parse(name).name;
  groups[account].push({
   id:account+'-'+digest,
   url:encode('instagram/reels/'+account+'/'+name)+'?v='+digest,
   caption:filename.replace(/[-_]+/g,' ').trim(),
   size
  });
 }
}
const data={version:1,generatedAt:new Date().toISOString(),...groups};
fs.mkdirSync(root,{recursive:true});
fs.writeFileSync(path.join(root,'manifest.json'),JSON.stringify(data,null,2)+'\n');
console.log('IG Reels:',groups.public.length,'public,',groups.private.length,'private');
