import 'server-only';
import { neon } from '@neondatabase/serverless';
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { CmsState, Inquiry, MediaAsset, Revision, SiteSettings, WebsiteContent } from './types';
import { seedContent, seedMedia } from '@/data/seed';
import { useRemoteDatabase } from './database-policy';
import { projectPublicContent } from './public-projection';

export class AppError extends Error { constructor(message:string, public status=400){super(message);} }
type Row=Record<string,unknown>;
type RecordData=Record<string,unknown>;
interface LocalStore {state:CmsState; records:Record<string,unknown>}
let initialized:Promise<void>|undefined;
let migration:Promise<void>|undefined;
const metrics=globalThis as typeof globalThis & {hpQueryCount?:number;hpQueryBytes?:number};
const blockedUntil=new Map<string,number>();
let localQueue:Promise<unknown>=Promise.resolve();
const directory=path.join(process.cwd(),'.data');
const localPath=path.join(directory,'cms.json');
const sql=useRemoteDatabase(process.env)?neon(process.env.DATABASE_URL!):null;
const databaseIdentity=sql?new URL(process.env.DATABASE_URL!):null;
export const databaseCacheNamespace=databaseIdentity?createHash('sha256').update([databaseIdentity.hostname,databaseIdentity.pathname,databaseIdentity.username].join('|')).digest('hex').slice(0,20):'local-files';

export const defaultSettings:SiteSettings={smtp:{enabled:false,host:'',port:465,secure:true,user:'',from:'info@hagn-partner.de',to:'info@hagn-partner.de',password:''},retentionDays:365,onboardingComplete:false,siteUrl:process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000',storageRegion:'fra1',databaseRegion:'fra1'};
export function databaseConfigured(){return Boolean(sql);}
async function query(statement:string,parameters:unknown[]=[],operation='database.query'):Promise<Row[]>{
  if(!sql)throw new AppError('Die Datenbank ist noch nicht eingerichtet.',503);
  const measured=process.env.HP_DB_DIAGNOSTICS==='1'||process.env.HP_DB_METRICS==='1';
  const started=measured?performance.now():0;
  const rows=await sql.query(statement,parameters) as Row[];
  if(measured){const bytes=Buffer.byteLength(JSON.stringify(rows));metrics.hpQueryCount=(metrics.hpQueryCount||0)+1;metrics.hpQueryBytes=(metrics.hpQueryBytes||0)+bytes;if(process.env.HP_DB_METRICS==='1')console.info(JSON.stringify({event:'hp.database',operation,rows:rows.length,logicalBytes:bytes,durationMs:Math.round(performance.now()-started)}));}
  return rows;
}
function newState():CmsState{return{draft:structuredClone(seedContent),published:structuredClone(seedContent),revision:1,updatedAt:new Date().toISOString(),publishedAt:new Date().toISOString(),revisions:[]};}
async function readLocal():Promise<LocalStore>{
  try{return JSON.parse(await readFile(localPath,'utf8'));}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;const store:LocalStore={state:newState(),records:{}};await mkdir(directory,{recursive:true});await writeFile(localPath,JSON.stringify(store),{mode:0o600});return store;}
}
async function withLocal<T>(action:(store:LocalStore)=>T|Promise<T>):Promise<T>{
  const next=localQueue.then(async()=>{const store=await readLocal();const result=await action(store);await mkdir(directory,{recursive:true});const tmp=localPath+'.'+randomUUID()+'.tmp';await writeFile(tmp,JSON.stringify(store),{mode:0o600});await rename(tmp,localPath);return result;});localQueue=next.catch(()=>undefined);return next;
}
export async function initialize():Promise<void>{
  if(initialized)return initialized;
  initialized=(async()=>{
    if(!sql){if(process.env.VERCEL)throw new AppError('Für die veröffentlichte Website ist DATABASE_URL erforderlich.',503);await withLocal(store=>{for(const asset of seedMedia)store.records['media:'+asset.id]??=asset;});return;}
  })().catch(error=>{initialized=undefined;throw error;});
  return initialized;
}
// Schema work is explicit deployment setup. A cold request never runs DDL or reseeds data.
export async function setupDatabase():Promise<void>{
  if(migration)return migration;
  migration=(async()=>{
    await initialize();if(!sql)return;
    await query(`CREATE TABLE IF NOT EXISTS hp_site (id TEXT PRIMARY KEY, draft JSONB NOT NULL, published JSONB NOT NULL, revision INTEGER NOT NULL DEFAULT 1, updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), published_at TIMESTAMPTZ)`);
    await query(`CREATE TABLE IF NOT EXISTS hp_records (collection TEXT NOT NULL, id TEXT NOT NULL, data JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), PRIMARY KEY(collection,id))`);
    await query(`CREATE TABLE IF NOT EXISTS hp_revisions (id TEXT PRIMARY KEY, content JSONB NOT NULL, label TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
    await query(`CREATE INDEX IF NOT EXISTS hp_records_collection_created ON hp_records(collection,created_at DESC)`);
    await query(`CREATE TABLE IF NOT EXISTS hp_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, reset_at TIMESTAMPTZ NOT NULL)`);
    const inserted=await query(`INSERT INTO hp_site(id,draft,published,published_at) VALUES('main',$1::jsonb,$1::jsonb,now()) ON CONFLICT(id) DO NOTHING RETURNING id`,[JSON.stringify(seedContent)]);
    if(inserted.length){
      await query(`INSERT INTO hp_revisions(id,content,label) VALUES($1,$2::jsonb,'Erstveröffentlichung')`,[randomUUID(),JSON.stringify(seedContent)]);
      if(seedMedia.length)await query(`INSERT INTO hp_records(collection,id,data) SELECT 'media', asset->>'id', asset FROM jsonb_array_elements($1::jsonb) asset ON CONFLICT(collection,id) DO NOTHING`,[JSON.stringify(seedMedia)]);
    }
  })().catch(error=>{migration=undefined;throw error;});
  return migration;
}
const iso=(value:unknown)=>new Date(value as string).toISOString();
function stateFromRow(row:Row,revisions:Revision[]):CmsState{return{draft:row.draft as WebsiteContent,published:row.same_snapshot?structuredClone(row.draft as WebsiteContent):row.published as WebsiteContent,revision:Number(row.revision),updatedAt:iso(row.updated_at),publishedAt:row.published_at?iso(row.published_at):null,revisions};}
const revisionsQuery=`(SELECT COALESCE(jsonb_agg(r ORDER BY r.created_at DESC),'[]'::jsonb) FROM (SELECT id,label,created_at FROM hp_revisions ORDER BY created_at DESC LIMIT 30) r)`;
function rowRevisions(row:Row):Revision[]{return ((row.revisions||[]) as Row[]).map(r=>({id:String(r.id),label:String(r.label),createdAt:iso(r.created_at)}));}
export async function getState():Promise<CmsState>{await initialize();if(!sql)return structuredClone((await readLocal()).state);const rows=await query(`SELECT draft,CASE WHEN draft=published THEN NULL ELSE published END AS published,draft=published AS same_snapshot,revision,updated_at,published_at,${revisionsQuery} AS revisions FROM hp_site WHERE id='main'`,[],'admin.state');return stateFromRow(rows[0],rowRevisions(rows[0]));}
export async function getPublished():Promise<WebsiteContent>{await initialize();if(!sql)return structuredClone((await readLocal()).state.published);const rows=await query(`SELECT published FROM hp_site WHERE id='main'`);return rows[0].published as WebsiteContent;}
export async function getPublicSnapshot(slug?:string):Promise<{content:WebsiteContent;siteUrl:string}>{
  await initialize();if(!sql)return{content:projectPublicContent((await readLocal()).state.published,slug),siteUrl:(await getSettings()).siteUrl};
  const rows=await query(`SELECT jsonb_build_object('version',1,'config',s.published->'config',
    'pages',COALESCE((SELECT jsonb_agg(CASE WHEN $1::text IS NULL THEN (p.value-'sections')||'{"sections":[]}'::jsonb ELSE p.value END ORDER BY p.position) FROM jsonb_array_elements(s.published->'pages') WITH ORDINALITY AS p(value,position) WHERE $1::text IS NULL OR p.value->>'slug'=$1),'[]'::jsonb),
    'posts',CASE WHEN s.published#>>'{config,blog,enabled}'='true' THEN COALESCE((SELECT jsonb_agg((p.value-'sections')||jsonb_build_object('sections',CASE WHEN $1::text=COALESCE(s.published#>>'{config,blog,slug}','blog')||'/'||(p.value->>'slug') THEN COALESCE(p.value->'sections','[]'::jsonb) ELSE '[]'::jsonb END) ORDER BY p.position) FROM jsonb_array_elements(COALESCE(s.published->'posts','[]'::jsonb)) WITH ORDINALITY AS p(value,position) WHERE p.value->>'status'='published'),'[]'::jsonb) ELSE '[]'::jsonb END) AS content,
    COALESCE((SELECT data->>'siteUrl' FROM hp_records WHERE collection='settings' AND id='site'),$2) AS site_url FROM hp_site s WHERE id='main'`,[slug??null,defaultSettings.siteUrl],slug===undefined?'public.index':'public.page');
  if(!rows[0])throw new AppError('Es sind noch keine veröffentlichten Inhalte vorhanden.',503);
  return{content:rows[0].content as WebsiteContent,siteUrl:String(rows[0].site_url)};
}
export async function saveDraft(content:WebsiteContent,revision:number):Promise<CmsState>{
  await initialize();
  if(!sql){await withLocal(store=>{if(store.state.revision!==revision)throw new AppError('Der Entwurf wurde inzwischen geändert. Bitte laden Sie die aktuelle Version neu.',409);store.state.draft=structuredClone(content);store.state.updatedAt=new Date().toISOString();store.state.revision++;});}
  else {const rows=await query(`UPDATE hp_site SET draft=$1::jsonb,revision=revision+1,updated_at=now() WHERE id='main' AND revision=$2 RETURNING CASE WHEN draft=published THEN NULL ELSE published END AS published,draft=published AS same_snapshot,revision,updated_at,published_at,${revisionsQuery} AS revisions`,[JSON.stringify(content),revision],'admin.save');if(!rows.length)throw new AppError('Der Entwurf wurde inzwischen geändert. Bitte laden Sie die aktuelle Version neu.',409);return stateFromRow({...rows[0],draft:content},rowRevisions(rows[0]));}
  return getState();
}
export async function publish(revision:number):Promise<CmsState>{
  await initialize();const id=randomUUID();const label='Veröffentlichung';
  if(!sql){await withLocal(store=>{if(store.state.revision!==revision)throw new AppError('Bitte speichern oder laden Sie zunächst den aktuellen Entwurf.',409);store.state.published=structuredClone(store.state.draft);store.state.publishedAt=new Date().toISOString();store.state.updatedAt=new Date().toISOString();store.state.revision++;store.state.revisions.unshift({id,label,createdAt:new Date().toISOString(),content:structuredClone(store.state.published)});store.state.revisions=store.state.revisions.slice(0,30);});}
  else {
    const rows=await query(`WITH saved AS (UPDATE hp_site SET published=draft,published_at=now(),updated_at=now(),revision=revision+1 WHERE id='main' AND revision=$1 RETURNING revision,published), history AS (INSERT INTO hp_revisions(id,content,label) SELECT $2,published,$3 FROM saved RETURNING id) SELECT saved.revision FROM saved CROSS JOIN history`,[revision,id,label],'admin.publish');
    if(!rows.length)throw new AppError('Bitte speichern oder laden Sie zunächst den aktuellen Entwurf.',409);
    await query(`DELETE FROM hp_revisions WHERE id NOT IN (SELECT id FROM hp_revisions ORDER BY created_at DESC LIMIT 30)`);
  }
  return getState();
}
export async function restoreRevision(id:string,revision:number):Promise<CmsState>{
  await initialize();let content:WebsiteContent|undefined;
  if(!sql)content=(await readLocal()).state.revisions.find(r=>r.id===id)?.content;
  else {const rows=await query(`SELECT content FROM hp_revisions WHERE id=$1`,[id]);content=rows[0]?.content as WebsiteContent|undefined;}
  if(!content)throw new AppError('Diese Version ist nicht mehr verfügbar.',404);
  return saveDraft(content,revision);
}
export async function getRecord<T>(collection:string,id:string):Promise<T|null>{await initialize();if(!sql)return ((await readLocal()).records[collection+':'+id] as T)??null;const rows=await query(`SELECT data FROM hp_records WHERE collection=$1 AND id=$2`,[collection,id]);return (rows[0]?.data as T)??null;}
export async function setRecord(collection:string,id:string,data:unknown):Promise<void>{await initialize();if(!sql){await withLocal(store=>{store.records[collection+':'+id]=data as RecordData;});return;}await query(`INSERT INTO hp_records(collection,id,data) VALUES($1,$2,$3::jsonb) ON CONFLICT(collection,id) DO UPDATE SET data=EXCLUDED.data`,[collection,id,JSON.stringify(data)]);}
export async function deleteRecord(collection:string,id:string):Promise<void>{await initialize();if(!sql){await withLocal(store=>{delete store.records[collection+':'+id];});return;}await query(`DELETE FROM hp_records WHERE collection=$1 AND id=$2`,[collection,id]);}
export async function listRecords<T>(collection:string):Promise<T[]>{await initialize();if(!sql){const records=(await readLocal()).records;return Object.entries(records).filter(([k])=>k.startsWith(collection+':')).map(([,v])=>v as T).reverse();}const rows=await query(`SELECT data FROM hp_records WHERE collection=$1 ORDER BY created_at DESC LIMIT 3000`,[collection]);return rows.map(r=>r.data as T);}
export async function deleteCollection(collection:string):Promise<void>{await initialize();if(!sql){await withLocal(store=>{for(const k of Object.keys(store.records))if(k.startsWith(collection+':'))delete store.records[k];});return;}await query(`DELETE FROM hp_records WHERE collection=$1`,[collection]);}
export async function rateLimit(key:string,max:number,windowSeconds:number):Promise<void>{
  const blocked=blockedUntil.get(key);if(blocked&&blocked>Date.now())throw new AppError('Bitte versuchen Sie es in einigen Minuten erneut.',429);
  if(blocked)blockedUntil.delete(key);
  await initialize();
  if(!sql){await withLocal(store=>{const entry=store.records['limit:'+key] as {count:number;reset:number}|undefined;const now=Date.now();if(!entry||entry.reset<now)store.records['limit:'+key]={count:1,reset:now+windowSeconds*1000};else {entry.count++;if(entry.count>max)throw new AppError('Bitte versuchen Sie es in einigen Minuten erneut.',429);}});return;}
  const rows=await query(`INSERT INTO hp_limits(key,count,reset_at) VALUES($1,1,now()+$2*interval '1 second') ON CONFLICT(key) DO UPDATE SET count=CASE WHEN hp_limits.reset_at<now() THEN 1 ELSE hp_limits.count+1 END, reset_at=CASE WHEN hp_limits.reset_at<now() THEN now()+$2*interval '1 second' ELSE hp_limits.reset_at END RETURNING count,reset_at`,[key,windowSeconds]);
  if(Number(rows[0].count)>max){if(blockedUntil.size>=2048)blockedUntil.delete(blockedUntil.keys().next().value!);blockedUntil.set(key,new Date(rows[0].reset_at as string).getTime());throw new AppError('Bitte versuchen Sie es in einigen Minuten erneut.',429);}
}
export async function getSettings():Promise<SiteSettings>{return (await getRecord<SiteSettings>('settings','site'))??structuredClone(defaultSettings);}
export function publicSettings(settings:SiteSettings):SiteSettings{return {...settings,smtp:{...settings.smtp,password:undefined,passwordSet:Boolean(settings.smtp.password)}};}
export async function listInquiries():Promise<Inquiry[]>{
  const settings=await getSettings();const cutoff=Date.now()-settings.retentionDays*86400000;
  if(sql){const rows=await query(`SELECT data FROM hp_records WHERE collection='inquiries' AND created_at >= $1::timestamptz ORDER BY created_at DESC LIMIT 3000`,[new Date(cutoff).toISOString()]);return rows.map(r=>r.data as Inquiry);}
  const entries=await listRecords<Inquiry>('inquiries');return entries.filter(i=>new Date(i.createdAt).getTime()>=cutoff);
}
export async function listMedia():Promise<MediaAsset[]>{return listRecords<MediaAsset>('media');}
export async function cleanupExpiredSecurityRecords():Promise<void>{
  if(!sql)return;
  await query(`DELETE FROM hp_records WHERE collection='sessions' AND (data->>'expiresAt')::timestamptz < now()`);
  await query(`DELETE FROM hp_limits WHERE reset_at < now()-interval '1 day'`);
}
export async function dailyCleanup():Promise<void>{
  await initialize();if(!sql)return;
  await query(`WITH expired_sessions AS (DELETE FROM hp_records WHERE collection='sessions' AND (data->>'expiresAt')::timestamptz<now()), expired_limits AS (DELETE FROM hp_limits WHERE reset_at<now()) DELETE FROM hp_records WHERE collection='inquiries' AND created_at < now()-COALESCE((SELECT (data->>'retentionDays')::integer FROM hp_records WHERE collection='settings' AND id='site'),365)*interval '1 day'`);
}
export async function getAdminSnapshot():Promise<{state:CmsState;settings:SiteSettings;media:MediaAsset[];inquiries:Inquiry[]}>{
  await initialize();
  if(!sql){const [state,settings,media,inquiries]=await Promise.all([getState(),getSettings(),listMedia(),listInquiries()]);return{state,settings,media,inquiries};}
  const rows=await query(`SELECT s.draft,CASE WHEN s.draft=s.published THEN NULL ELSE s.published END AS published,s.draft=s.published AS same_snapshot,s.revision,s.updated_at,s.published_at,${revisionsQuery} AS revisions,
    (SELECT data FROM hp_records WHERE collection='settings' AND id='site') AS settings,
    COALESCE((SELECT jsonb_agg(data ORDER BY created_at DESC) FROM hp_records WHERE collection='media'),'[]'::jsonb) AS media,
    COALESCE((SELECT jsonb_agg(q.data ORDER BY q.created_at DESC) FROM (SELECT data,created_at FROM hp_records WHERE collection='inquiries' AND created_at >= now()-COALESCE((SELECT (data->>'retentionDays')::integer FROM hp_records WHERE collection='settings' AND id='site'),365)*interval '1 day' ORDER BY created_at DESC LIMIT 3000) q),'[]'::jsonb) AS inquiries
    FROM hp_site s WHERE id='main'`,[],'admin.bootstrap');
  const row=rows[0];return{state:stateFromRow(row,rowRevisions(row)),settings:(row.settings as SiteSettings)||structuredClone(defaultSettings),media:row.media as MediaAsset[],inquiries:row.inquiries as Inquiry[]};
}
export function getQueryCount(){return metrics.hpQueryCount||0;}
export async function saveSnapshots(draft:WebsiteContent,published:WebsiteContent,revision:number,label:string):Promise<CmsState>{
  await initialize();const id=randomUUID();
  if(!sql){await withLocal(store=>{if(store.state.revision!==revision)throw new AppError('Der Entwurf wurde inzwischen geändert. Bitte laden Sie die aktuelle Version neu.',409);store.state.draft=structuredClone(draft);store.state.published=structuredClone(published);store.state.revision++;store.state.updatedAt=new Date().toISOString();store.state.publishedAt=store.state.updatedAt;store.state.revisions.unshift({id,label,createdAt:store.state.updatedAt,content:structuredClone(published)});store.state.revisions=store.state.revisions.slice(0,30);});return getState();}
  const rows=await query(`WITH saved AS (UPDATE hp_site SET draft=$1::jsonb,published=$2::jsonb,revision=revision+1,updated_at=now(),published_at=now() WHERE id='main' AND revision=$3 RETURNING revision,published), history AS (INSERT INTO hp_revisions(id,content,label) SELECT $4,published,$5 FROM saved RETURNING id) SELECT saved.revision FROM saved CROSS JOIN history`,[JSON.stringify(draft),JSON.stringify(published),revision,id,label],'admin.publish-post');
  if(!rows.length)throw new AppError('Der Entwurf wurde inzwischen geändert. Bitte laden Sie die aktuelle Version neu.',409);
  await query(`DELETE FROM hp_revisions WHERE id NOT IN (SELECT id FROM hp_revisions ORDER BY created_at DESC LIMIT 30)`);return getState();
}
