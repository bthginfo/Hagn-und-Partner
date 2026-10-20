import assert from 'node:assert/strict';
import {createInterface} from 'node:readline';
import {writeFile,mkdir} from 'node:fs/promises';

const base=(process.argv[2]||'http://localhost:3001').replace(/\/$/,'');
if(process.stdin.isTTY)process.stdin.setRawMode(true);
console.log('Administrator password expected on hidden stdin. Requires a local production server with HP_DB_DIAGNOSTICS=1.');
const password=await new Promise(resolve=>{const lines=createInterface({input:process.stdin,terminal:false});lines.once('line',value=>{lines.close();resolve(value);});});
const login=await fetch(base+'/api/admin/login',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({password})});
assert.equal(login.status,200,'Admin login');
const cookie=(login.headers.get('set-cookie')||'').split(';')[0];
const diagnostics=async()=>{const response=await fetch(base+'/api/admin/diagnostics',{headers:{Cookie:cookie}});assert.equal(response.status,200,'Diagnostics must be enabled on the local test server only');return(await response.json()).queries;};
try{
 const paths=['/','/kanzlei','/anwaelte','/anwaelte/veronika-hagn','/rechtsgebiete','/rechtsgebiete/verkehrsrecht','/service','/kontakt','/impressum','/datenschutz','/sitemap.xml','/robots.txt','/llms.txt'];
 for(const path of paths)assert.equal((await fetch(base+path)).status,200);
 const before=await diagnostics();const responses=[];
 for(let cycle=0;cycle<3;cycle++)for(const path of paths){const response=await fetch(`${base}${path}${path.includes('.')?'':`?design=${cycle+1}`}`);assert.equal(response.status,200);responses.push({path,cache:response.headers.get('x-nextjs-cache')});await response.arrayBuffer();}
 const after=await diagnostics();
 // Reading diagnostics authenticates once against the DB. The public requests add zero queries.
 assert.equal(after-before,1,'Warm public page requests must not query Postgres');
 const result={base,at:new Date().toISOString(),publicRequests:responses.length,publicDatabaseQueries:after-before-1,cacheHeaders:[...new Set(responses.map(entry=>entry.cache))]};
 await mkdir('.data',{recursive:true});await writeFile('.data/cache-result.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}finally{await fetch(base+'/api/admin/logout',{method:'POST',headers:{Origin:base,Cookie:cookie,'Content-Type':'application/json'},body:'{}'});}
process.exit(0);
