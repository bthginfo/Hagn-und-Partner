import {existsSync,readFileSync,writeFileSync} from 'node:fs';
import {randomBytes,scryptSync} from 'node:crypto';
import {createInterface} from 'node:readline';

const file='.env.local';
let source=existsSync(file)?readFileSync(file,'utf8'):'';
const existing=key=>source.match(new RegExp('^'+key+'=(.*)$','m'))?.[1]?.replace(/^"|"$/g,'');
if(existing('ADMIN_INITIAL_PASSWORD_HASH')){console.log('Initialer Passwort-Hash ist bereits eingerichtet. Ein bestehendes Zugangspasswort ändern Sie im CMS.');process.exit(0);}
if(process.stdin.isTTY)process.stdin.setRawMode(true);
console.log('Erstes Administrator-Passwort eingeben (Eingabe bleibt verborgen):');
const password=await new Promise(resolve=>{const input=createInterface({input:process.stdin,terminal:false});input.once('line',value=>{input.close();resolve(value);});});
if(!password)throw new Error('Ein Passwort ist erforderlich.');
const salt=randomBytes(24).toString('base64url');
const values={AUTH_SECRET:existing('AUTH_SECRET')||randomBytes(48).toString('base64url'),CRON_SECRET:existing('CRON_SECRET')||randomBytes(40).toString('base64url'),ADMIN_INITIAL_PASSWORD_HASH:`scrypt:v1:${salt}:${scryptSync(password,salt,64).toString('base64url')}`};
for(const [key,value] of Object.entries(values)){source=source.replace(new RegExp('^'+key+'=.*(?:\\r?\\n|$)','gm'),'');source+=`\n${key}="${value}"\n`;}
writeFileSync(file,source,{mode:0o600});
console.log('Zugang und Zufallsschlüssel in .env.local gespeichert. Diese Datei gehört nicht in Git.');
process.exit(0);
