import {timingSafeEqual} from 'node:crypto';
import {dailyCleanup} from '@/lib/db';
import {digest} from '@/lib/security';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request:Request){const expected=process.env.CRON_SECRET;const actual=request.headers.get('authorization')?.replace(/^Bearer /,'')||'';if(!expected||!timingSafeEqual(Buffer.from(digest(expected)),Buffer.from(digest(actual))))return Response.json({error:'Nicht autorisiert.'},{status:401});await dailyCleanup();return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}});}
