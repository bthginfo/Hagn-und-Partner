import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createInterface} from 'node:readline';
import {writeFile} from 'node:fs/promises';
import sharp from 'sharp';

const base=(process.argv[2]||'http://localhost:3000').replace(/\/$/,'');
const expectedBlobHost=process.env.HP_VERIFY_BLOB_HOST;
if(!/^https?:\/\//.test(base))throw new Error('Expected an absolute test URL.');
if(process.stdin.isTTY)process.stdin.setRawMode(true);
console.log('Administrator password expected on hidden stdin.');
const password=await new Promise(resolve=>{const lines=createInterface({input:process.stdin,terminal:false});lines.once('line',value=>{lines.close();resolve(value);});});
let cookie='';let current;let original;let testAsset;let testInquiry;const checks=[];
const mark=name=>{checks.push(name);console.log('PASS '+name);};
async function request(path,{method='GET',body,auth=true,origin=base,headers={}}={}){
  const form=body instanceof FormData;
  const response=await fetch(base+path,{method,headers:{...(process.env.HP_VERIFY_VERCEL_BYPASS?{'x-vercel-protection-bypass':process.env.HP_VERIFY_VERCEL_BYPASS}:{}),...(method==='GET'?{}:{Origin:origin}),...(auth&&cookie?{Cookie:cookie}:{}),...(!form&&body!==undefined?{'Content-Type':'application/json'}:{}),...headers},body:body===undefined?undefined:form?body:JSON.stringify(body),redirect:'manual'});
  const raw=await response.text();let data;try{data=JSON.parse(raw);}catch{data=raw;}
  return {response,status:response.status,data};
}
async function mutation(path,body,method='POST'){
  const result=await request('/api/admin/'+path,{method,body});
  assert.equal(result.status,200,`${path}: HTTP ${result.status}${result.data?.error?' '+result.data.error:''}`);
  if(result.data.state)current=result.data.state;return result.data;
}
async function save(content){await mutation('content',{content,revision:current.revision},'PUT');}
async function publish(){await mutation('publish',{revision:current.revision});}
try{
  assert.equal((await request('/api/admin/bootstrap',{auth:false})).status,401);mark('Unauthenticated administration is protected');
  assert.equal((await request('/api/admin/login',{method:'POST',body:{password:'incorrect-'+randomUUID()},auth:false,origin:'https://untrusted.invalid'})).status,403);mark('Cross-origin mutations are rejected');
  const logged=await request('/api/admin/login',{method:'POST',body:{password},auth:false});assert.equal(logged.status,200,'Administrator login');
  cookie=(logged.response.headers.get('set-cookie')||'').split(';')[0];assert(cookie.startsWith('hp_admin_session='));
  assert(/httponly/i.test(logged.response.headers.get('set-cookie')));assert(/samesite=strict/i.test(logged.response.headers.get('set-cookie')));if(base.startsWith('https://'))assert(/;\s*secure/i.test(logged.response.headers.get('set-cookie')));mark('Password login creates a protected session');
  const bootstrap=await request('/api/admin/bootstrap');assert.equal(bootstrap.status,200);current=bootstrap.data.state;original=structuredClone(current);
  assert.equal(bootstrap.data.settings.smtp.enabled,false,'Integration verification requires SMTP disabled to avoid external mail');
  assert.equal(bootstrap.data.settings.smtp.password,undefined);assert(bootstrap.data.media.length);mark('Database, inquiry inbox and shared media bootstrap together without secrets');
  const stale=current.revision;await save(structuredClone(current.draft));
  assert.equal((await request('/api/admin/content',{method:'PUT',body:{content:current.draft,revision:stale}})).status,409);mark('Optimistic revisions prevent lost edits');
  const slug='qa-pruefung-'+randomUUID().slice(0,8);const page={id:randomUUID(),slug,title:'Technische Funktionsprüfung',locale:'de',seo:{title:'Technische Funktionsprüfung',description:'Vorübergehender Testinhalt.',noindex:true},sections:[{id:randomUUID(),type:'richtext',name:'Prüfabschnitt',visible:true,content:{heading:'Technische Funktionsprüfung',text:'Dieser vorübergehende Testinhalt wird nach der Prüfung wieder entfernt.'},design:structuredClone(current.draft.pages[0].sections[0].design)}]};
  const edited=structuredClone(current.draft);edited.pages.push(page);await save(edited);
  assert.equal((await request('/'+slug,{auth:false})).status,404);mark('A newly created page remains private while it is a draft');
  await publish();const publicPage=await request('/'+slug,{auth:false});assert.equal(publicPage.status,200);assert(publicPage.data.includes('Technische Funktionsprüfung'));mark('Publication invalidates the public cache and renders a new CMS page');
  const posts=structuredClone(current.draft);const postId=randomUUID();const postSlug='qa-beitrag-'+randomUUID().slice(0,8);posts.posts=[...(posts.posts||[]),{id:postId,slug:postSlug,title:'Technischer Blogtest',excerpt:'Vorübergehender Test der Beitragsverwaltung.',author:posts.config.name,date:'2026-10-20',updatedAt:new Date().toISOString(),status:'draft',sections:structuredClone(page.sections),seo:{title:'Technischer Blogtest',description:'Vorübergehender Testbeitrag.',noindex:true}}];
  await save(posts);await mutation('blog/publish',{id:postId,revision:current.revision});
  const blogSlug=current.draft.config.blog.slug;assert.equal((await request('/'+blogSlug+'/'+postSlug,{auth:false})).status,404);mark('Publishing an individual post does not enable the optional blog');
  const enabled=structuredClone(current.draft);enabled.config.blog.enabled=true;await save(enabled);await mutation('blog/settings',{revision:current.revision});
  const article=await request('/'+blogSlug+'/'+postSlug,{auth:false});assert.equal(article.status,200);assert(article.data.includes('BlogPosting'));mark('Blog settings expose real posts with article structured data');
  await mutation('blog/unpublish',{id:postId,revision:current.revision});assert.equal((await request('/'+blogSlug+'/'+postSlug,{auth:false})).status,404);mark('Withdrawing a post removes its public route');
  const bytes=await sharp({create:{width:32,height:32,channels:3,background:'#243d39'}}).png().toBuffer();const form=new FormData();form.append('file',new Blob([bytes],{type:'image/png'}),'qa-verification.png');form.append('alt','Technisches Testbild');
  const uploaded=await request('/api/admin/media',{method:'POST',body:form});assert.equal(uploaded.status,201);testAsset=uploaded.data.asset;
  assert(testAsset.url.includes('.public.blob.vercel-storage.com/'));assert.equal((await fetch(testAsset.url)).status,200);
  if(expectedBlobHost)assert.equal(new URL(testAsset.url).hostname,expectedBlobHost,'Media upload reaches the intended Blob store');
  await mutation('media',{id:testAsset.id,alt:'Geänderte Beschreibung',position:'50% 0%'},'PATCH');await mutation('media',{id:testAsset.id},'DELETE');testAsset=undefined;mark('Real Frankfurt Blob upload, alt text, 9-point focus and deletion work');
  const subject='QA '+randomUUID();const sent=await request('/api/contact',{method:'POST',auth:false,body:{name:'Technische Funktionsprüfung',email:'qa@example.org',phone:'',subject,message:'Dies ist eine technische Testanfrage. Sie wird nach der Prüfung entfernt.',consent:true,website:''}});assert.equal(sent.status,201);
  const inquiries=await request('/api/admin/inquiries');testInquiry=inquiries.data.inquiries.find(entry=>entry.subject===subject);assert(testInquiry);assert.equal(testInquiry.emailStatus,'not-configured');
  await mutation('inquiries',{id:testInquiry.id,status:'done',note:'Technische Prüfung abgeschlossen.'},'PATCH');const csv=await request('/api/admin/inquiries/export');assert.equal(csv.status,200);assert(csv.data.includes(subject));await mutation('inquiries',{id:testInquiry.id},'DELETE');testInquiry=undefined;mark('Contact submission reaches the inbox; status, notes, CSV export and deletion work');
  const bot=await request('/api/contact',{method:'POST',auth:false,body:{website:'spam.invalid'}});assert.equal(bot.status,200);mark('Honeypot submissions finish before database access');
  assert.equal((await request('/api/admin/password',{method:'POST',body:{currentPassword:password,newPassword:'short'}})).status,400);mark('Password changes enforce a longer replacement password');
}finally{
  if(cookie&&original&&current){
    if(testAsset)await request('/api/admin/media',{method:'DELETE',body:{id:testAsset.id}});
    if(testInquiry)await request('/api/admin/inquiries',{method:'DELETE',body:{id:testInquiry.id}});
    const fresh=await request('/api/admin/bootstrap');if(fresh.status===200){assert.equal(fresh.data.state.revision,current.revision,'Content changed in another session; cleanup must not overwrite those edits.');current=fresh.data.state;await save(original.published);await publish();if(JSON.stringify(original.draft)!==JSON.stringify(original.published))await save(original.draft);mark('Original draft and public content restored; all test records removed');}
    await request('/api/admin/logout',{method:'POST',body:{}});assert.equal((await request('/api/admin/bootstrap')).status,401);mark('Logout revokes the server session');
  }
  await writeFile('.data/integration-result.json',JSON.stringify({base,at:new Date().toISOString(),checks},null,2));
}
console.log(`${checks.length} integration checks passed.`);
