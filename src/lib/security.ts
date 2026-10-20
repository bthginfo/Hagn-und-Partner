import { createCipheriv, createDecipheriv, createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const derive = promisify(scrypt);
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(24).toString('base64url');
  const hash = await derive(password, salt, 64) as Buffer;
  return `scrypt:v1:${salt}:${hash.toString('base64url')}`;
}
export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const [algorithm, version, salt, value] = encoded.split(':');
  if (algorithm !== 'scrypt' || version !== 'v1' || !salt || !value) return false;
  const expected = Buffer.from(value, 'base64url');
  const actual = await derive(password, salt, 64) as Buffer;
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
export function digest(value: string): string { return createHash('sha256').update(value).digest('hex'); }
function secretKey(): Buffer {
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) throw new Error('AUTH_SECRET fehlt oder ist zu kurz.');
  return createHash('sha256').update(process.env.AUTH_SECRET).digest();
}
export function encrypt(value: string): string {
  if (!value) return '';
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', secretKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return ['v1', iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), encrypted.toString('base64url')].join('.');
}
export function decrypt(value: string): string {
  if (!value) return '';
  const [v, iv, tag, payload] = value.split('.');
  if (v !== 'v1' || !iv || !tag || !payload) throw new Error('Ungültiges Geheimnisformat.');
  const cipher = createDecipheriv('aes-256-gcm', secretKey(), Buffer.from(iv, 'base64url'));
  cipher.setAuthTag(Buffer.from(tag, 'base64url'));
  return Buffer.concat([cipher.update(Buffer.from(payload, 'base64url')), cipher.final()]).toString('utf8');
}
export function safeLink(value: string): boolean {
  if (!value || value.startsWith('#')) return true;
  if (value.startsWith('/') && !value.startsWith('//') && !value.includes('\\')) return true;
  if (/^tel:\+?[\d\s().\/-]+$/.test(value)) return true;
  if (/^mailto:[^\s<>\r\n]+@[^\s<>\r\n]+$/.test(value)) return true;
  try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:'; } catch { return false; }
}
