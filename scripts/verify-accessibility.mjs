import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const base=(process.argv[2]||'http://localhost:3000').replace(/\/$/,'');
const quick=process.argv.includes('--quick');const session='hagn-accessibility';
const focusedRoute=process.argv.find(value=>value.startsWith('--route='))?.slice(8);
if(focusedRoute&&!/^\/[a-z0-9/-]*$/.test(focusedRoute))throw new Error('Expected a local route without parameters.');
const resultPath=focusedRoute?'.data/accessibility-focused-result.json':'.data/accessibility-result.json';
function browser(args,input){const result=spawnSync('agent-browser',['--session',session,...args],{shell:true,input,stdio:[input===undefined?'ignore':'pipe','pipe','pipe'],encoding:'utf8',maxBuffer:8*1024*1024,timeout:60000});if(result.status!==0)throw new Error(result.stderr||result.stdout||String(result.error));return result.stdout;}
const axe=await readFile('node_modules/axe-core/axe.min.js','utf8');
const routes=focusedRoute?[focusedRoute]:quick?['/']:['/','/kanzlei','/anwaelte','/anwaelte/veronika-hagn','/rechtsgebiete','/rechtsgebiete/verkehrsrecht','/service','/kontakt','/impressum','/datenschutz'];
const report=[];await mkdir('.data',{recursive:true});
for(const width of [1440,390])for(const variant of [1,2,3,4,5])for(const path of routes){
  browser(['set','viewport',String(width),width===1440?'1000':'844']);browser(['open',`${base}${path}?design=${variant}`]);
  const code=`(async()=>{await document.fonts.ready;await new Promise(resolve=>setTimeout(resolve,250));${axe};const result=await axe.run({exclude:[['nextjs-portal']]},{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']}});return{url:location.pathname,variant:document.querySelector('[data-design-version]')?.dataset.designVersion,width:innerWidth,h1:document.querySelectorAll('main h1').length,violations:result.violations.map(issue=>({id:issue.id,impact:issue.impact,description:issue.help,nodes:issue.nodes.map(node=>({target:node.target,summary:node.failureSummary,html:node.html}))})),incomplete:result.incomplete.map(issue=>({id:issue.id,nodes:issue.nodes.length}))};})()`;
  const output=browser(['eval','--stdin'],code);const start=output.indexOf('{');const end=output.lastIndexOf('}');if(start<0||end<0)throw new Error(output.slice(0,500));const result=JSON.parse(output.slice(start,end+1));report.push(result);
  console.log(`${width}px V${variant} ${path}: ${result.violations.length} rule violations; h1=${result.h1}`);await writeFile(resultPath,JSON.stringify({base,at:new Date().toISOString(),results:report},null,2));
}
const counts=report.reduce((sum,page)=>sum+page.violations.length,0);console.log(`${report.length} page/viewport checks; ${counts} rule violations. Full results: ${resultPath}`);if(counts)process.exitCode=1;
