import {readFileSync,writeFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import {spawnSync} from 'node:child_process';
let current=readFileSync('.env.local','utf8');const existing=current.match(/^CRON_SECRET="?([^"\r\n]+)"?$/m)?.[1];
const values={CRON_SECRET:existing||randomBytes(40).toString('base64url'),NEXT_PUBLIC_DESIGN_REVIEW:'true',NEXT_PUBLIC_SITE_VARIANT:'1'};
const env={...process.env};delete env.VERCEL_TOKEN;
for(const [key,value] of Object.entries(values)){
  current=current.replace(new RegExp('^'+key+'=.*(?:\r?\n|$)','gm'),'');current+=`\n${key}="${value}"\n`;
  const result=spawnSync(process.execPath,[process.argv[2],'env','add',key,'--environment','production,preview,development','--force','--yes','--scope','juliusingelheims-projects',key==='CRON_SECRET'?'--sensitive':'--no-sensitive'],{input:value,env,encoding:'utf8'});
  if(result.status!==0){console.error(`Environment upload failed for ${key}.`);process.exit(1);}console.log(`${key}: configured.`);
}
writeFileSync('.env.local',current,{mode:0o600});
