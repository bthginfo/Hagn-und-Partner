import type { NextConfig } from 'next';

const redirects:Record<string,string>={
  '/anwaltskanzlei-ingolstadt':'/kanzlei','/anwaltskanzlei-in-ingolstadt':'/kanzlei','/anwaltskanzlei-ingolstadt-konzept':'/kanzlei','/anwaelte-ingolstadt':'/anwaelte','/rechtsgebiete-anwalt-ingolstadt':'/rechtsgebiete','/ingolstadt-anwaltskanzlei':'/kanzlei#sekretariat','/service-anwaelte-ingolstadt':'/service','/anwalt-ingolstadt':'/service',
  '/verkehrsrecht-rechtsanwalt-ingolstadt':'/rechtsgebiete/verkehrsrecht','/mietrecht-rechtsanwalt-ingolstadt':'/rechtsgebiete/mietrecht','/arbeitsrecht-rechtsanwalt-ingolstadt':'/rechtsgebiete/arbeitsrecht','/strafrecht-rechtsanwalt-ingolstadt':'/rechtsgebiete/strafrecht','/familienrecht-rechtsanwalt-ingolstadt':'/rechtsgebiete/familienrecht',
};
for(const person of ['veronika-hagn','niels-deckert','markus-stemmer','gabriele-radlinger','maria-haneder','eva-huxmann','ulrike-wagner'])redirects[`/${person}-anwalt-ingolstadt`]=`/anwaelte/${person}`;
const config:NextConfig={
  poweredByHeader:false,
  images:{remotePatterns:[{protocol:'https',hostname:'**.public.blob.vercel-storage.com'}],formats:['image/avif','image/webp']},
  async redirects(){return Object.entries(redirects).map(([source,destination])=>({source,destination,permanent:true}));},
  async headers(){return [{source:'/:path*',headers:[{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},{key:'X-Frame-Options',value:'DENY'},{key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'},{key:'Content-Security-Policy',value:"base-uri 'self'; object-src 'none'; frame-ancestors 'none'"}]},{source:'/admin/:path*',headers:[{key:'X-Robots-Tag',value:'noindex, nofollow, noarchive'},{key:'Cache-Control',value:'no-store'}]},{source:'/api/:path*',headers:[{key:'X-Robots-Tag',value:'noindex, nofollow'},{key:'Cache-Control',value:'no-store'}]}];}
};
export default config;
