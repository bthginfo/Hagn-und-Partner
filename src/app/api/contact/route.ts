import { randomUUID } from 'node:crypto';
import { handler, ipKey, json, readJson, sameOrigin } from '@/lib/http';
import { rateLimit, setRecord } from '@/lib/db';
import { inquirySchema } from '@/lib/validation';
import { notifyInquiry } from '@/lib/mail';
import {cachedSettings} from '@/lib/settings-cache';
import type { Inquiry } from '@/lib/types';

export const runtime='nodejs';
export const maxDuration=30;
export const POST=handler(async(request:Request)=>{
  sameOrigin(request);
  const body=await readJson(request,20000);
  if(body&&typeof body==='object'&&'website' in body&&body.website)return json({ok:true});
  const data=inquirySchema.parse(body);await rateLimit(ipKey(request,'contact'),5,15*60);const now=new Date().toISOString();const settings=await cachedSettings();
  const inquiry:Inquiry={id:randomUUID(),name:data.name,email:data.email,phone:data.phone,subject:data.subject,message:data.message,createdAt:now,status:'new',note:'',consentAt:now,emailStatus:settings.smtp.enabled?'pending':'not-configured'};
  await setRecord('inquiries',inquiry.id,inquiry);
  if(settings.smtp.enabled){try{inquiry.emailStatus=await notifyInquiry(inquiry,settings);}catch{inquiry.emailStatus='failed';}await setRecord('inquiries',inquiry.id,inquiry);}
  return json({ok:true,message:'Vielen Dank. Ihre Anfrage ist bei uns eingegangen. Wir melden uns bei Ihnen.'},201);
});
