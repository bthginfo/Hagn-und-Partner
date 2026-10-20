import 'server-only';
import nodemailer from 'nodemailer';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { AppError } from './db';
import {cachedSettings} from './settings-cache';
import { decrypt } from './security';
import type { Inquiry, SmtpSettings } from './types';

function blockedAddress(address:string):boolean{
  if(address.includes(':'))return /^(::|::1$|f[cd]|fe[89ab])/i.test(address)||address.startsWith('::ffff:');
  const p=address.split('.').map(Number);return p[0]===0||p[0]===10||p[0]===127||p[0]>=224||(p[0]===169&&p[1]===254)||(p[0]===172&&p[1]>=16&&p[1]<=31)||(p[0]===192&&p[1]===168)||(p[0]===100&&p[1]>=64&&p[1]<=127);
}
export async function validateSmtpHost(settings:SmtpSettings):Promise<string>{
  if(!settings.host||!settings.enabled)throw new AppError('Bitte richten Sie den E-Mail-Versand zuerst ein.');
  if(isIP(settings.host))throw new AppError('Bitte verwenden Sie den öffentlichen Hostnamen Ihres Mailanbieters.');
  if(!/^[a-z\d.-]+\.[a-z]{2,}$/i.test(settings.host))throw new AppError('Bitte geben Sie einen vollständigen SMTP-Hostnamen an.');
  const addresses=await lookup(settings.host,{all:true});
  if(!addresses.length||addresses.some(a=>blockedAddress(a.address)))throw new AppError('Dieser Mailserver kann nicht verwendet werden.');
  return (addresses.find(address=>address.family===4)||addresses[0]).address;
}
async function transport(settings:SmtpSettings){const address=await validateSmtpHost(settings);return nodemailer.createTransport({host:address,port:settings.port,secure:settings.secure,requireTLS:!settings.secure,disableFileAccess:true,disableUrlAccess:true,auth:settings.user?{user:settings.user,pass:decrypt(settings.password||'')}:undefined,connectionTimeout:8000,greetingTimeout:8000,socketTimeout:12000,tls:{servername:settings.host,minVersion:'TLSv1.2',rejectUnauthorized:true}});}
export async function notifyInquiry(inquiry:Inquiry,supplied?:{smtp:SmtpSettings;siteUrl:string}):Promise<'sent'|'not-configured'>{
  const {smtp,siteUrl}=supplied||await cachedSettings();if(!smtp.enabled)return'not-configured';const mail=await transport(smtp);
  // The email intentionally contains no confidential legal narrative. Staff read it after signing in.
  await mail.sendMail({from:smtp.from,to:smtp.to,subject:'Neue Kontaktanfrage über die Kanzlei-Website',text:`Eine neue Kontaktanfrage ist in der geschützten Website-Verwaltung eingegangen.\n\nEingang: ${new Date(inquiry.createdAt).toLocaleString('de-DE',{timeZone:'Europe/Berlin'})}\nAnfrage: ${inquiry.id}\n\nBitte melden Sie sich in der Website-Verwaltung an, um die Nachricht zu lesen.\n${siteUrl.replace(/\/$/,'')}/admin`});return'sent';
}
export async function sendTestMail(to?:string):Promise<void>{const {smtp}=await cachedSettings();const mail=await transport(smtp);if(to&&to!==smtp.to)throw new AppError('Testnachrichten werden nur an die gespeicherte Empfängeradresse versendet.');await mail.sendMail({from:smtp.from,to:smtp.to,subject:'Testnachricht der Kanzlei-Website',text:'Der E-Mail-Versand Ihrer Kanzlei-Website ist eingerichtet. Neue Kontaktanfragen werden in der geschützten Website-Verwaltung gespeichert; zusätzliche Benachrichtigungen gehen an diese Adresse.'});}
