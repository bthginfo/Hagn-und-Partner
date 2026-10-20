import 'server-only';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { getPublicSnapshot } from './db';
const publicSnapshot=unstable_cache(getPublicSnapshot,['hp-public-snapshot-v1'],{tags:['hp-published'],revalidate:false});
export const publishedContent=cache(async()=>(await publicSnapshot()).content);
export const canonicalUrl=cache(async()=>(await publicSnapshot()).siteUrl.replace(/\/$/,''));
export const pageUrl=(base:string,slug:string)=>base+(slug?'/'+slug:'/');
