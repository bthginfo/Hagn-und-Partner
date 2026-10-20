import type {Metadata} from 'next';
import type {PageContent,WebsiteContent} from './types';
import {pageUrl} from './content';

export function pageMetadata(page:PageContent,content:WebsiteContent,base:string):Metadata{
  const url=pageUrl(base,page.slug);
  const post=page.id.startsWith('post-')?content.posts?.find(post=>page.id===`post-${post.id}`):undefined;
  const title=page.seo.title||`${page.title} | ${content.config.name}`;
  const description=page.seo.description;
  const image=page.seo.image||page.sections.find(section=>section.content.image)?.content.image?.src||'/images/recht-anwalt-ingolstadt.jpg';
  const review=process.env.NEXT_PUBLIC_DESIGN_REVIEW==='true';
  return{title,description,metadataBase:new URL(base),alternates:{canonical:url},
    openGraph:{title,description,url,siteName:content.config.name,locale:'de_DE',images:[{url:image,alt:page.title}],...(post?{type:'article' as const,publishedTime:post.date,modifiedTime:post.updatedAt,authors:[post.author]}:{type:'website' as const})},
    twitter:{card:'summary_large_image',title,description,images:[image]},
    robots:page.seo.noindex||review?{index:false,follow:!review}:undefined};
}
