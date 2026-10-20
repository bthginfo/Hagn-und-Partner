import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {decrypt,encrypt,hashPassword,safeLink,verifyPassword} from '../src/lib/security';

test('password hashes are salted and verify only the matching password',async()=>{
  const password=randomBytes(24).toString('base64url');
  const [first,second]=await Promise.all([hashPassword(password),hashPassword(password)]);
  assert.notEqual(first,second);assert(!first.includes(password));
  assert.equal(await verifyPassword(password,first),true);
  assert.equal(await verifyPassword(password+'x',first),false);
  assert.equal(await verifyPassword(password,'invalid'),false);
});
test('SMTP secrets use authenticated encryption and reject tampering',()=>{
  process.env.AUTH_SECRET=randomBytes(48).toString('base64url');
  const value='test credential '+randomBytes(12).toString('hex');
  const encoded=encrypt(value);assert(!encoded.includes(value));assert.equal(decrypt(encoded),value);assert.notEqual(encrypt(value),encoded);
  const pieces=encoded.split('.');const bytes=Buffer.from(pieces[3],'base64url');bytes[0]^=1;pieces[3]=bytes.toString('base64url');
  assert.throws(()=>decrypt(pieces.join('.')));
});
test('links cannot inject executable protocols or protocol-relative redirects',()=>{
  for(const link of ['/kontakt','#sekretariat','https://example.org/','tel:+49841935570','mailto:info@example.org'])assert.equal(safeLink(link),true,link);
  for(const link of ['javascript:alert(1)','data:text/html,test','//example.org','/\\example.org','vbscript:test'])assert.equal(safeLink(link),false,link);
});
