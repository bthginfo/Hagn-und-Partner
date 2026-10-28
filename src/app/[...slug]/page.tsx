import { notFound } from 'next/navigation';
import { publishedContent,publicPageSnapshot } from '@/lib/content';
import {publicPages,resolvePage} from '@/lib/blog';
import {pageMetadata} from '@/lib/metadata';
import { SiteView } from '@/components/site/site-view';
import { StructuredData } from '@/components/structured-data';
export const revalidate=false;
export const dynamicParams=true;
export async function generateStaticParams(){return publicPages(await publishedContent()).filter(page=>page.slug).map(page=>({slug:page.slug.split('/')}));}
type Props={params:Promise<{slug:string[]}>};
export async function generateMetadata({params}:Props){const {slug}=await params;const {content,siteUrl:base}=await publicPageSnapshot(slug.join('/'));const page=resolvePage(content,slug.join('/'));return page?pageMetadata(page,content,base):{};}
export default async function ContentPage({params}:Props){const {slug}=await params;const {content,siteUrl:base}=await publicPageSnapshot(slug.join('/'));const page=resolvePage(content,slug.join('/'));if(!page)notFound();const post=content.posts?.find(post=>page.id===`post-${post.id}`);return <><StructuredData page={page} site={content.config} base={base} post={post}/><SiteView page={page} site={content.config}/></>;}
