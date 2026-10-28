import {NextResponse,type NextRequest} from 'next/server';
import {neon} from '@neondatabase/serverless';

/** Enabled only during a storage move. Normal deployments perform no gate query. */
export async function proxy(request:NextRequest){
  if(process.env.SITE_MIGRATION_CHECK!=='1')return NextResponse.next();
  // Legacy image IDs remain available while editors wait for the final copy.
  if(request.method==='GET'&&request.nextUrl.pathname.startsWith('/api/media/'))return NextResponse.next();
  try{
    const url=process.env.DATABASE_URL;
    if(!url)throw new Error('Migration database unavailable');
    const [state]=await neon(url)`SELECT blocked FROM public.website_migration_control WHERE app_id=${'hagn'}`;
    if(state&&!state.blocked)return NextResponse.next();
  }catch{/* Fail closed before uploads, SMTP or any other mutation. */}
  return NextResponse.json({error:'Wir übertragen gerade die Website. Bitte warten Sie einen Moment und versuchen Sie es erneut.'},{status:503,headers:{'Cache-Control':'no-store','Retry-After':'60'}});
}
export const config={matcher:'/api/:path*'};
