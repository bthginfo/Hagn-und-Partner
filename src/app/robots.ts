import type {MetadataRoute} from 'next';
import {canonicalUrl} from '@/lib/content';
export const revalidate=false;
export default async function robots():Promise<MetadataRoute.Robots>{const base=await canonicalUrl();return{rules:[process.env.NEXT_PUBLIC_DESIGN_REVIEW==='true'?{userAgent:'*',disallow:'/'}:{userAgent:'*',allow:'/',disallow:['/admin','/api/']}],sitemap:base+'/sitemap.xml',host:base};}
