import { publicPageSnapshot } from '@/lib/content';
import {resolvePage} from '@/lib/blog';
import {pageMetadata} from '@/lib/metadata';
import { SiteView } from '@/components/site/site-view';
import { StructuredData } from '@/components/structured-data';
export const revalidate=false;
export async function generateMetadata(){const {content,siteUrl:base}=await publicPageSnapshot('');return pageMetadata(resolvePage(content,'')!,content,base);}
export default async function Home(){const {content,siteUrl:base}=await publicPageSnapshot('');const page=resolvePage(content,'')!;return <><StructuredData page={page} site={content.config} base={base}/><SiteView page={page} site={content.config}/></>;}
