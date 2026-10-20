import type {MetadataRoute} from 'next';
import {canonicalUrl,publishedContent,pageUrl} from '@/lib/content';
import {publicPages} from '@/lib/blog';
export const revalidate=false;
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const [content,base]=await Promise.all([publishedContent(),canonicalUrl()]);return publicPages(content).filter(p=>!p.seo.noindex).map(p=>({url:pageUrl(base,p.slug),changeFrequency:'monthly',priority:p.slug?0.7:1}));}
