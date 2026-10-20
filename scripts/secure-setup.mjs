import {readFileSync,writeFileSync} from 'node:fs';
import {randomBytes,scryptSync} from 'node:crypto';
import {createInterface} from 'node:readline';
import {spawnSync} from 'node:child_process';

if(process.stdin.isTTY)process.stdin.setRawMode(true);
console.log('Initial administrator password expected on stdin; it will not be logged.');
const rl=createInterface({input:process.stdin,terminal:false});
rl.once('line',password=>{
  rl.close();
  const file='.env.local';let current=readFileSync(file,'utf8');
  const get=key=>current.match(new RegExp('^'+key+'=(.*)$','m'))?.[1]?.replace(/^"|"$/g,'');
  const salt=randomBytes(24).toString('base64url');
  const values={AUTH_SECRET:get('AUTH_SECRET')||randomBytes(48).toString('base64url'),ADMIN_INITIAL_PASSWORD_HASH:get('ADMIN_INITIAL_PASSWORD_HASH')||`scrypt:v1:${salt}:${scryptSync(password,salt,64).toString('base64url')}`,NEXT_PUBLIC_SITE_URL:'https://hagn-und-partner.vercel.app'};
  for(const [key,value] of Object.entries(values)){current=current.replace(new RegExp('^'+key+'=.*(?:\r?\n|$)','gm'),'');current+=`\n${key}="${value}"\n`;}
  writeFileSync(file,current,{mode:0o600});
  const cli=process.argv[2];if(!cli)throw new Error('CLI path required');
  const env={...process.env};delete env.VERCEL_TOKEN;
  for(const [key,value] of Object.entries(values)){
    const args=[cli,'env','add',key,'--environment','production,preview,development','--force','--yes','--scope','juliusingelheims-projects',key.startsWith('NEXT_PUBLIC')?'--no-sensitive':'--sensitive'];
    const result=spawnSync(process.execPath,args,{input:value,env,encoding:'utf8'});
    if(result.status!==0){console.error(`Environment upload failed for ${key}.`,result.stderr?.replaceAll(value,'[redacted]'));process.exit(1);}
    console.log(`${key}: stored in Vercel and local environment.`);
  }
  console.log('Secret setup complete.');process.exit(0);
});
