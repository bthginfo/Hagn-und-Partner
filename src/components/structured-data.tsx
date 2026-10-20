import type { BlogPost, PageContent, SiteConfig } from '@/lib/types';

export function StructuredData({page,site,base,post}:{page:PageContent;site:SiteConfig;base:string;post?:BlogPost}){
  const url=base+(page.slug?'/'+page.slug:'/');
  const graph:unknown[]=[{'@type':'LegalService','@id':base+'/#kanzlei',name:site.legalName,alternateName:site.name,url:base,telephone:site.phone,email:site.email,address:{'@type':'PostalAddress',streetAddress:site.address,postalCode:site.postalCode,addressLocality:site.city,addressCountry:'DE'},areaServed:{'@type':'City',name:site.city},image:base+'/images/recht-anwalt-ingolstadt.jpg'}, {'@type':'WebSite','@id':base+'/#website',url:base,name:site.name,inLanguage:'de-DE',publisher:{'@id':base+'/#kanzlei'}},{'@type':'WebPage','@id':url+'#webpage',url,name:page.seo.title,description:page.seo.description,inLanguage:page.locale,isPartOf:{'@id':base+'/#website'},about:{'@id':base+'/#kanzlei'}}];
  if(page.slug)graph.push({'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Startseite',item:base+'/'},{'@type':'ListItem',position:2,name:page.title,item:url}]});
  const faq=page.sections.filter(s=>s.visible&&s.type==='faq').flatMap(s=>s.content.items||[]);
  if(faq.length)graph.push({'@type':'FAQPage',mainEntity:faq.map(i=>({'@type':'Question',name:i.title,acceptedAnswer:{'@type':'Answer',text:i.text}}))});
  if(page.slug.startsWith('anwaelte/')){const portrait=page.sections.find(s=>s.content.image);graph.push({'@type':'Person',name:page.title,url,image:portrait?.content.image?new URL(portrait.content.image.src,base).href:undefined,worksFor:{'@id':base+'/#kanzlei'},jobTitle:portrait?.content.subheading?.split('\n')[0]||'Rechtsanwältin / Rechtsanwalt'});}
  if(post)graph.push({'@type':'BlogPosting','@id':url+'#article',mainEntityOfPage:{'@id':url+'#webpage'},headline:post.title,description:post.excerpt,datePublished:post.date,dateModified:post.updatedAt,author:{'@type':post.author===site.name?'Organization':'Person',name:post.author},publisher:{'@id':base+'/#kanzlei'},image:post.cover?new URL(post.cover.src,base).href:undefined,inLanguage:'de-DE'});
  const data={'@context':'https://schema.org','@graph':graph};return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(data).replaceAll('<','\\u003c')}}/>;
}
