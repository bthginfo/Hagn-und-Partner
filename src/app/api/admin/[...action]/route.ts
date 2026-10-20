import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { put, del } from '@vercel/blob';
import sharp from 'sharp';
import {revalidatePath,revalidateTag} from 'next/cache';
import { checkPassword, createSession, logout, requireAdmin, changePassword } from '@/lib/auth';
import { AppError, databaseConfigured, deleteRecord, getAdminSnapshot, getQueryCount, getRecord, getSettings, getState, listInquiries, listMedia, publicSettings, publish, rateLimit, restoreRevision, saveDraft, saveSnapshots, setRecord } from '@/lib/db';
import { handler, ipKey, json, readJson, sameOrigin } from '@/lib/http';
import { encrypt, hashPassword } from '@/lib/security';
import { settingsSchema, websiteSchema } from '@/lib/validation';
import { sendTestMail } from '@/lib/mail';
import {publishIssues} from '@/lib/publish-check';
import type { Inquiry, MediaAsset, SiteSettings } from '@/lib/types';
import {defaultBlog} from '@/lib/site-config';

export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=30;
const revisionSchema=z.number().int().positive();
const idSchema=z.string().min(1).max(150);
const route=handler(async(request:Request)=>{
  const action=new URL(request.url).pathname.replace(/^\/api\/admin\//,'').replace(/\/$/,'');
  const method=request.method;
  if(method!=='GET')sameOrigin(request);
  if(action==='login'&&method==='POST'){
    const {password}=z.object({password:z.string().min(1).max(1000)}).parse(await readJson(request,3000));
    await rateLimit(ipKey(request,'login'),8,15*60);
    if(!await checkPassword(password))throw new AppError('Das Passwort ist nicht korrekt.',401);
    await createSession();return json({ok:true});
  }
  await requireAdmin();
  if(action==='logout'&&method==='POST'){await logout();return json({ok:true});}
  if(action==='diagnostics'&&method==='GET'&&process.env.HP_DB_DIAGNOSTICS==='1')return json({queries:getQueryCount()});
  if(action==='bootstrap'&&method==='GET'){
    const {state,settings,media,inquiries}=await getAdminSnapshot();
    return json({state,settings:publicSettings(settings),media,inquiries,system:{database:databaseConfigured(),blob:Boolean(process.env.BLOB_READ_WRITE_TOKEN),smtp:settings.smtp.enabled,region:'fra1',mode:process.env.VERCEL?'production':'development',initialized:true}});
  }
  if(action==='content'&&method==='PUT'){
    const {content,revision}=z.object({content:websiteSchema,revision:revisionSchema}).parse(await readJson(request));
    return json({state:await saveDraft(content,revision)});
  }
  if(action==='publish'&&method==='POST'){
    const {revision}=z.object({revision:revisionSchema}).parse(await readJson(request));
    const draft=await getState();if(draft.revision!==revision)throw new AppError('Der Entwurf wurde inzwischen geändert. Bitte laden Sie die aktuelle Version neu.',409);const issues=publishIssues(draft.draft);if(issues.length)throw new AppError(issues.slice(0,3).join('\n'));
    const state=await publish(revision);revalidateTag('hp-published',{expire:0});revalidatePath('/','layout');return json({state});
  }
  if(action==='restore'&&method==='POST'){
    const {id,revision}=z.object({id:idSchema,revision:revisionSchema}).parse(await readJson(request));
    return json({state:await restoreRevision(id,revision)});
  }
  if(action.startsWith('blog/')&&method==='POST'){
    const operation=z.enum(['publish','unpublish','delete','settings']).parse(action.split('/')[1]);
    const {id,revision}=z.object({id:idSchema.optional(),revision:revisionSchema}).parse(await readJson(request,5000));
    const current=await getState();if(current.revision!==revision)throw new AppError('Der Entwurf wurde inzwischen geändert. Bitte laden Sie den aktuellen Stand neu.',409);
    const draft=structuredClone(current.draft);const published=structuredClone(current.published);
    let label='Blog-Einstellungen';
    if(operation==='settings'){
      const config=draft.config.blog??structuredClone(defaultBlog);const previous=published.config.blog??defaultBlog;
      if(config.enabled&&(!config.title.trim()||!config.navLabel.trim()))throw new AppError('Bitte ergänzen Sie Titel und Navigationsname für den Blog.');
      published.config.blog=structuredClone(config);published.config.navigation=published.config.navigation.filter(link=>link.href!==`/${previous.slug}`);draft.config.navigation=draft.config.navigation.filter(link=>link.href!==`/${previous.slug}`);
      if(config.enabled&&config.showInNavigation){const link={label:config.navLabel,href:`/${config.slug}`};published.config.navigation.push(link);draft.config.navigation.push({...link});}
    }else{
      const post=draft.posts?.find(post=>post.id===id);if(!post)throw new AppError('Dieser Beitrag wurde nicht gefunden.',404);
      if(operation==='publish'){
        if(!post.title.trim()||!post.slug||!post.author.trim())throw new AppError('Bitte ergänzen Sie Titel, Seitenadresse und Verfasser des Beitrags.');
        const issues=publishIssues({version:1,config:draft.config,pages:[{id:'post',slug:'',title:post.title,locale:'de',seo:post.seo,sections:post.sections}]});if(issues.length)throw new AppError(issues[0]);
        if(!post.sections.length)throw new AppError('Bitte ergänzen Sie den Inhalt des Beitrags.');
        post.status='published';post.updatedAt=new Date().toISOString();published.posts=[...(published.posts??[]).filter(p=>p.id!==id),structuredClone(post)];label=`Beitrag: ${post.title}`;
      }else if(operation==='unpublish'){post.status='draft';published.posts=(published.posts??[]).filter(p=>p.id!==id);label=`Beitrag zurückgezogen: ${post.title}`;}
      else{draft.posts=(draft.posts??[]).filter(p=>p.id!==id);published.posts=(published.posts??[]).filter(p=>p.id!==id);label=`Beitrag gelöscht: ${post.title}`;}
    }
    const state=await saveSnapshots(draft,published,revision,label);revalidateTag('hp-published',{expire:0});revalidatePath('/','layout');return json({state});
  }
  if(action==='settings'&&method==='GET')return json({settings:publicSettings(await getSettings())});
  if(action==='settings'&&method==='PUT'){
    const {settings}=z.object({settings:settingsSchema}).parse(await readJson(request,25000));const previous=await getSettings();
    const next:SiteSettings={...settings,storageRegion:'fra1',databaseRegion:'fra1',smtp:{...settings.smtp,password:settings.smtp.password?encrypt(settings.smtp.password):previous.smtp.password,passwordSet:undefined}};
    await setRecord('settings','site',next);revalidateTag('hp-settings',{expire:0});if(next.siteUrl!==previous.siteUrl){revalidateTag('hp-published',{expire:0});revalidatePath('/','layout');}return json({settings:publicSettings(next)});
  }
  if(action==='settings/test'&&method==='POST'){
    await rateLimit(ipKey(request,'smtp-test'),3,15*60);
    const {to}=z.object({to:z.email().optional()}).parse(await readJson(request,3000));
    await sendTestMail(to);return json({ok:true,message:'Die Testnachricht wurde an die gespeicherte Empfängeradresse versendet.'});
  }
  if(action==='password'&&method==='POST'){
    await rateLimit(ipKey(request,'password'),6,15*60);
    const values=z.object({currentPassword:z.string().max(1000),newPassword:z.string().min(12,'Bitte verwenden Sie mindestens 12 Zeichen.').max(200)}).parse(await readJson(request,5000));
    if(!await checkPassword(values.currentPassword))throw new AppError('Das bisherige Passwort ist nicht korrekt.',400);
    await changePassword(await hashPassword(values.newPassword));return json({ok:true});
  }
  if(action==='media'&&method==='GET')return json({media:await listMedia()});
  if(action==='media'&&method==='POST'){
    if(!process.env.BLOB_READ_WRITE_TOKEN)throw new AppError('Der Bildspeicher ist noch nicht verbunden.',503);
    if(Number(request.headers.get('content-length')||0)>4.4*1024*1024)throw new AppError('Bitte verwenden Sie ein Bild mit höchstens 4 MB.',413);
    const form=await request.formData();const file=form.get('file');
    if(!(file instanceof File)||!['image/jpeg','image/png','image/webp'].includes(file.type))throw new AppError('Bitte wählen Sie ein JPG-, PNG- oder WebP-Bild.');
    if(file.size>4*1024*1024||file.size===0)throw new AppError('Bitte verwenden Sie ein Bild mit höchstens 4 MB.');
    const bytes=Buffer.from(await file.arrayBuffer());let data:Buffer;
    try{data=await sharp(bytes,{limitInputPixels:40000000}).rotate().resize(2560,2560,{fit:'inside',withoutEnlargement:true}).webp({quality:88}).toBuffer();}catch{throw new AppError('Dieses Bild konnte nicht gelesen werden. Bitte versuchen Sie eine andere Datei.');}
    const name=file.name.replace(/\.[^.]+$/,'').normalize('NFKD').replace(/[^a-zA-Z\d-]/g,'-').slice(0,80)||'kanzlei-bild';
    const blob=await put(`media/${name}.webp`,data,{access:'public',addRandomSuffix:true,contentType:'image/webp'});
    const asset:MediaAsset={id:randomUUID(),url:blob.url,name:file.name.slice(0,200),alt:String(form.get('alt')||'').slice(0,500),type:'image/webp',size:data.length,position:'50% 50%',createdAt:new Date().toISOString()};
    await setRecord('media',asset.id,asset);return json({asset},201);
  }
  if(action==='media'&&method==='PATCH'){
    const values=z.object({id:idSchema,alt:z.string().max(500).optional(),position:z.enum(['0% 0%','50% 0%','100% 0%','0% 50%','50% 50%','100% 50%','0% 100%','50% 100%','100% 100%']).optional()}).parse(await readJson(request,5000));
    const asset=await getRecord<MediaAsset>('media',values.id);if(!asset)throw new AppError('Das Bild wurde nicht gefunden.',404);
    const next={...asset,...values};await setRecord('media',asset.id,next);return json({asset:next});
  }
  if(action==='media'&&method==='DELETE'){
    const {id}=z.object({id:idSchema}).parse(await readJson(request,3000));const asset=await getRecord<MediaAsset>('media',id);if(!asset)throw new AppError('Das Bild wurde nicht gefunden.',404);
    const state=await getState();if(JSON.stringify([state.draft,state.published]).includes(asset.url))throw new AppError('Dieses Bild wird noch auf einer Seite verwendet. Entfernen oder ersetzen Sie es dort zuerst.',409);
    if(asset.url.startsWith('https://')&&new URL(asset.url).hostname.endsWith('.public.blob.vercel-storage.com'))await del(asset.url);
    await deleteRecord('media',id);return json({ok:true});
  }
  if(action==='inquiries'&&method==='GET')return json({inquiries:await listInquiries()});
  if(action==='inquiries'&&method==='PATCH'){
    const values=z.object({id:idSchema,status:z.enum(['new','in-progress','done','spam']).optional(),note:z.string().max(10000).optional()}).parse(await readJson(request,15000));
    const entry=await getRecord<Inquiry>('inquiries',values.id);if(!entry)throw new AppError('Diese Anfrage ist nicht mehr verfügbar.',404);
    const next={...entry,...values};await setRecord('inquiries',entry.id,next);return json({inquiry:next});
  }
  if(action==='inquiries'&&method==='DELETE'){const {id}=z.object({id:idSchema}).parse(await readJson(request,3000));await deleteRecord('inquiries',id);return json({ok:true});}
  if(action==='inquiries/export'&&method==='GET'){
    const inquiries=await listInquiries();
    const cell=(value:string)=>'"'+(/^[=+\-@\t\r]/.test(value)?"'":'')+value.replaceAll('"','""')+'"';
    const rows=[['Eingang','Name','E-Mail','Telefon','Betreff','Nachricht','Status','Notiz'],...inquiries.map(i=>[i.createdAt,i.name,i.email,i.phone,i.subject,i.message,i.status,i.note])];
    return new Response('\uFEFF'+rows.map(r=>r.map(cell).join(';')).join('\r\n'),{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="kanzlei-anfragen.csv"','Cache-Control':'no-store'}});
  }
  if(action==='export'&&method==='GET'){
    const state=await getState();return new Response(JSON.stringify({format:'hp-content-backup-v1',exportedAt:new Date().toISOString(),draft:state.draft,published:state.published},null,2),{headers:{'Content-Type':'application/json; charset=utf-8','Content-Disposition':'attachment; filename="hagn-partner-inhalte.json"','Cache-Control':'no-store'}});
  }
  throw new AppError('Diese Funktion wurde nicht gefunden.',404);
});
export {route as GET,route as POST,route as PUT,route as PATCH,route as DELETE};
