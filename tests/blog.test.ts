import test from 'node:test';
import assert from 'node:assert/strict';
import source from '../src/data/content.json';
import {blogPostItems,hydrateBlogSections,publicPages,resolvePage} from '../src/lib/blog';
import {createSection} from '../src/lib/section-library';
import {defaultBlog} from '../src/lib/site-config';
import type {BlogPost,WebsiteContent} from '../src/lib/types';
function fixture(){const site=structuredClone(source) as WebsiteContent;site.config.blog={...defaultBlog,enabled:true};const post:BlogPost={id:'published',slug:'beitrag',title:'Kanzleinachricht',excerpt:'Testbeschreibung',author:site.config.name,date:'2026-10-20',updatedAt:'2026-10-20T12:00:00Z',status:'published',sections:[{...createSection('richtext'),content:{heading:'Informationen',text:'Text des Beitrags.'}}],seo:{title:'',description:''}};site.posts=[post,{...structuredClone(post),id:'draft',slug:'entwurf',status:'draft'}];return site;}
test('drafts are excluded from every public blog route and feed',()=>{
  const site=fixture();assert.equal(resolvePage(site,'blog/entwurf'),undefined);assert.equal(blogPostItems(site).length,1);assert.equal(blogPostItems(site,true).length,2);
  assert.equal(publicPages(site).length,site.pages.length+2);assert.equal(resolvePage(site,'blog/beitrag')?.seo.description,'Testbeschreibung');
});
test('a disabled blog produces no public routes or public feed items',()=>{
  const site=fixture();site.config.blog!.enabled=false;assert.equal(resolvePage(site,'blog'),undefined);assert.equal(resolvePage(site,'blog/beitrag'),undefined);assert.equal(publicPages(site).length,site.pages.length);
  const page={...site.pages[0],sections:[createSection('blog-cards')]};assert.equal(hydrateBlogSections(page,site).sections[0].visible,false);assert.equal(hydrateBlogSections(page,site,true).sections[0].content.items?.length,2);
});
test('post pages hydrate nested blog sections and retain body content',()=>{
  const site=fixture();site.posts![0].sections.push(createSection('blog-list'));const page=resolvePage(site,'blog/beitrag')!;
  assert.equal(page.sections[0].content.heading,'Kanzleinachricht');assert.equal(page.sections[2].content.items?.length,1);
});
