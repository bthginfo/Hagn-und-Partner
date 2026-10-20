import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import path from 'node:path';
import content from '../src/data/content.json';
import {websiteSchema,inquirySchema} from '../src/lib/validation';
import {publishIssues} from '../src/lib/publish-check';
import {createSection,sectionLibrary} from '../src/lib/section-library';
import {SECTION_TYPES,type WebsiteContent} from '../src/lib/types';

test('all imported pages satisfy the schema and publication checks',()=>{
  const site=websiteSchema.parse(content);assert.equal(site.pages.length,29);assert.deepEqual(publishIssues(site),[]);
});
test('every rendered section type is available exactly once in the section library',()=>{
  assert.deepEqual([...sectionLibrary.map(section=>section.type)].sort(),[...SECTION_TYPES].sort());
  for(const type of SECTION_TYPES){const section=createSection(type);assert.equal(section.type,type);assert(section.id);assert(section.name);assert(section.content);}
});
test('initial local pictures, PDF links and internal page links have real targets',()=>{
  const site=content as WebsiteContent;const slugs=new Set(site.pages.map(page=>'/'+page.slug));
  const inspect=(value:unknown)=>{
    if(Array.isArray(value))return value.forEach(inspect);
    if(value&&typeof value==='object')for(const [key,entry] of Object.entries(value)){
      if(typeof entry==='string'&&['src','href','primaryHref','secondaryHref'].includes(key)&&entry.startsWith('/')){
        const url=new URL(entry,'https://test.invalid');
        if(url.pathname.startsWith('/images/')||url.pathname.startsWith('/downloads/'))assert(existsSync(path.join(process.cwd(),'public',decodeURIComponent(url.pathname))),entry);
        else assert(slugs.has(url.pathname),`Missing page: ${entry}`);
      }else inspect(entry);
    }
  };inspect(site);
});
test('unpublished pages cannot contain unfinished cards or empty footer links',()=>{
  const site=structuredClone(content) as WebsiteContent;
  site.pages[0].sections.push({...createSection('cards'),content:{heading:'Unsere Themen',items:[{id:'pending-card',title:'',text:''}]}});
  site.config.footer!.legalLinks.push({label:'',href:''});
  assert(publishIssues(site).some(issue=>issue.includes('Eintrag')));
  assert(publishIssues(site).some(issue=>issue.includes('Fußbereich')));
});
test('duplicate/reserved pages and tracking without consent are rejected',()=>{
  const site=structuredClone(content);site.pages.push({...site.pages[0],id:'duplicate'});assert.equal(websiteSchema.safeParse(site).success,false);
  const reserved=structuredClone(content);reserved.pages[1].slug='admin/test';assert.equal(websiteSchema.safeParse(reserved).success,false);
  const tracking=structuredClone(content);tracking.config.consent.enabled=false;tracking.config.analytics.googleId='G-TEST123';assert.equal(websiteSchema.safeParse(tracking).success,false);
});
test('contact form validates acknowledgement, address and useful message before storage',()=>{
  const valid={name:'Test Person',email:'test@example.org',message:'Dies ist eine technische Testanfrage.',consent:true};
  assert.equal(inquirySchema.safeParse(valid).success,true);
  assert.equal(inquirySchema.safeParse({...valid,consent:false}).success,false);
  assert.equal(inquirySchema.safeParse({...valid,email:'invalid'}).success,false);
  assert.equal(inquirySchema.safeParse({...valid,message:'Hallo'}).success,false);
});
