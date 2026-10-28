import test from 'node:test';
import assert from 'node:assert/strict';
import seed from '../src/data/content.json';
import {useRemoteDatabase} from '../src/lib/database-policy';
import {projectPublicContent,packPublicSnapshot,unpackPublicSnapshot} from '../src/lib/public-projection';
import {publicPages,resolvePage} from '../src/lib/blog';
import type {WebsiteContent,BlogPost} from '../src/lib/types';

test('development and tests do not spend the production database allowance without an explicit opt-in',()=>{
  assert.equal(process.env.NODE_ENV,'test','The test command must select local data before importing server modules');
  const env={DATABASE_URL:'postgresql://example.invalid/db'};
  assert.equal(useRemoteDatabase({...env,NODE_ENV:'development'}),false);
  assert.equal(useRemoteDatabase({...env,NODE_ENV:'test',VERCEL:'1'}),false);
  assert.equal(useRemoteDatabase({...env,NODE_ENV:'development',HP_USE_REMOTE_DATABASE:'1'}),true);
  assert.equal(useRemoteDatabase({...env,NODE_ENV:'production'}),true);
  assert.equal(useRemoteDatabase({NODE_ENV:'production'}),false);
});

test('the public index preserves every route and SEO field without loading page bodies',()=>{
  const content=seed as WebsiteContent;
  const index=projectPublicContent(content);
  assert.deepEqual(publicPages(index).map(p=>[p.slug,p.seo]),publicPages(content).map(p=>[p.slug,p.seo]));
  assert(index.pages.every(page=>page.sections.length===0));
  assert(Buffer.byteLength(JSON.stringify(index))<Buffer.byteLength(JSON.stringify(content))/4);
});

test('each public page keeps its exact sections and excludes unrelated page bodies',()=>{
  const content=seed as WebsiteContent;
  for(const page of content.pages){const projection=projectPublicContent(content,page.slug);assert.equal(projection.pages.length,1);assert.deepEqual(resolvePage(projection,page.slug),resolvePage(content,page.slug));}
  assert.equal(resolvePage(projectPublicContent(content,'missing'),'missing'),undefined);
});

test('blog feeds omit article bodies and drafts while a selected article retains its complete content',()=>{
  const content=structuredClone(seed) as WebsiteContent;
  content.config.blog={enabled:true,title:'Aktuelles',description:'Beiträge',slug:'blog',layout:'cards',showInNavigation:false,navLabel:'Aktuelles'};
  const post:BlogPost={id:'one',slug:'one',title:'Beitrag',excerpt:'Auszug',author:'Kanzlei',date:'2026-10-28',updatedAt:'2026-10-28',status:'published',seo:{title:'Beitrag',description:'Auszug'},sections:structuredClone(content.pages[0].sections)};
  content.posts=[post,{...structuredClone(post),id:'two',slug:'two'},{...structuredClone(post),id:'private',slug:'private',status:'draft'}];
  const feed=projectPublicContent(content,'blog');assert.equal(feed.posts?.length,2);assert(feed.posts?.every(p=>!p.sections.length));
  const article=projectPublicContent(content,'blog/one');assert.deepEqual(resolvePage(article,'blog/one'),resolvePage(content,'blog/one'));assert.equal(article.posts?.find(p=>p.id==='two')?.sections.length,0);
  assert.equal(resolvePage(projectPublicContent(content,'blog/private'),'blog/private'),undefined);
});

test('large text snapshots stay below the persistent cache entry limit and round-trip exactly',()=>{
  const payload={article:'Rechtliche Informationen. '.repeat(120000)};
  assert(Buffer.byteLength(JSON.stringify(payload))>2*1024*1024);
  const packed=packPublicSnapshot(payload);assert(Buffer.byteLength(JSON.stringify(packed))<2*1024*1024);
  assert.deepEqual(unpackPublicSnapshot(packed),payload);
});
