import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const base=(process.argv[2]||'http://localhost:3000').replace(/\/$/,'');
const auth=process.argv[3]||'.data/qa-auth.json',session='hagn-admin-accessibility';
function browser(args,input){const result=spawnSync('agent-browser',['--session',session,...args],{shell:true,input,stdio:[input===undefined?'ignore':'pipe','pipe','pipe'],encoding:'utf8',maxBuffer:8*1024*1024,timeout:60000});if(result.status!==0)throw new Error(result.stderr||result.stdout||String(result.error));return result.stdout;}
function evaluate(code){const raw=browser(['eval','--stdin'],code);const start=raw.indexOf('{'),end=raw.lastIndexOf('}');if(start<0)throw new Error(raw.slice(0,200));return JSON.parse(raw.slice(start,end+1));}
const axe=await readFile('node_modules/axe-core/axe.min.js','utf8');const results=[];await mkdir('.data',{recursive:true});
browser(['state','load',auth]);
for(const width of [1440,390]){
 browser(['set','viewport',String(width),width===1440?'1000':'844']);browser(['open',base+'/admin']);
 evaluate(`(async()=>{for(let i=0;i<100&&!document.querySelector('.cms-app');i++)await new Promise(resolve=>setTimeout(resolve,100));if(!document.querySelector('.cms-app'))throw new Error('Authenticated CMS did not load');await new Promise(resolve=>setTimeout(resolve,300));document.querySelector('.cms-tour-skip')?.click();await new Promise(resolve=>setTimeout(resolve,100));return{ready:true};})()`);
 async function inspect(view,tab){
  const code=`(async()=>{
   const toggle=document.querySelector('.cms-nav-toggle');if(toggle&&toggle.getBoundingClientRect().width&&!document.querySelector('.cms-sidebar--open'))toggle.click();await new Promise(resolve=>setTimeout(resolve,80));
   const nav=[...document.querySelectorAll('.cms-sidebar nav button')].find(button=>button.querySelector('span')?.textContent===${JSON.stringify(view)});if(!nav)throw new Error('Missing view');nav.click();await new Promise(resolve=>setTimeout(resolve,350));
   ${tab?`const tab=[...document.querySelectorAll('.cms-settings-nav button')].find(button=>button.textContent===${JSON.stringify(tab)});if(!tab)throw new Error('Missing settings area');tab.click();await new Promise(resolve=>setTimeout(resolve,200));`:''}
   ${axe};const report=await axe.run({exclude:[['nextjs-portal']]},{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']}});return{view:${JSON.stringify(view)},tab:${JSON.stringify(tab)},width:innerWidth,violations:report.violations.map(issue=>({id:issue.id,impact:issue.impact,description:issue.help,nodes:issue.nodes.map(node=>({target:node.target,summary:node.failureSummary,html:node.html}))})),incomplete:report.incomplete.map(issue=>({id:issue.id,nodes:issue.nodes.length}))};})()`;
  const result=evaluate(code);results.push(result);console.log(`${width}px ${view}${tab?' / '+tab:''}: ${result.violations.length} rule violations`);await writeFile('.data/admin-accessibility-result.json',JSON.stringify({base,at:new Date().toISOString(),results},null,2));
 }
 for(const view of ['Übersicht','Seiten bearbeiten','Beiträge','Medien','Anfragen','Hilfe'])await inspect(view);
 for(const tab of ['Allgemein','Kontakt & Öffnungszeiten','Navigation & Fußbereich','Gestaltung','Cookies & Statistik','E-Mail-Versand','Zugang'])await inspect('Einstellungen',tab);
}
const count=results.reduce((sum,result)=>sum+result.violations.length,0);console.log(`${results.length} admin view/viewport checks; ${count} rule violations.`);if(count)process.exitCode=1;
