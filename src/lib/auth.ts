import 'server-only';
import { cookies } from 'next/headers';
import { randomBytes } from 'node:crypto';
import { AppError, deleteCollection, deleteRecord, getRecord, setRecord } from './db';
import { digest, verifyPassword } from './security';

export const SESSION_COOKIE='hp_admin_session';
interface AuthConfig {hash:string;changedAt:string}
export interface AdminSession {id:string;createdAt:string;expiresAt:string}
export async function authConfig():Promise<AuthConfig>{
  const existing=await getRecord<AuthConfig>('auth','admin');if(existing)return existing;
  const hash=process.env.ADMIN_INITIAL_PASSWORD_HASH;
  if(!hash||!hash.startsWith('scrypt:v1:'))throw new AppError('Der Administrationszugang muss zuerst eingerichtet werden.',503);
  const config={hash,changedAt:new Date().toISOString()};await setRecord('auth','admin',config);return config;
}
export async function checkPassword(password:string):Promise<boolean>{const config=await authConfig();return verifyPassword(password,config.hash);}
export async function createSession():Promise<void>{
  const token=randomBytes(32).toString('base64url');const id=digest(token);const expiresAt=new Date(Date.now()+12*3600000).toISOString();
  await setRecord('sessions',id,{id,createdAt:new Date().toISOString(),expiresAt});
  (await cookies()).set(SESSION_COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:12*3600});
}
export async function getSession():Promise<AdminSession|null>{
  const token=(await cookies()).get(SESSION_COOKIE)?.value;if(!token||!/^[a-zA-Z0-9_-]{43}$/.test(token))return null;
  const session=await getRecord<AdminSession>('sessions',digest(token));
  if(!session||new Date(session.expiresAt).getTime()<=Date.now())return null;return session;
}
export async function requireAdmin():Promise<AdminSession>{const session=await getSession();if(!session)throw new AppError('Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.',401);return session;}
export async function logout():Promise<void>{const token=(await cookies()).get(SESSION_COOKIE)?.value;if(token)await deleteRecord('sessions',digest(token));(await cookies()).delete(SESSION_COOKIE);}
export async function changePassword(hash:string):Promise<void>{await setRecord('auth','admin',{hash,changedAt:new Date().toISOString()});await deleteCollection('sessions');await createSession();}
