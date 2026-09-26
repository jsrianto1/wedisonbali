import {cpSync, mkdirSync, readdirSync, existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
for (const file of ['server.js', ...readdirSync('public').filter(p=>p.endsWith('.js')).map(p=>'public/'+p)]) {
 const result=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});
 if(result.status!==0)process.exit(result.status||1);
}
for(const route of ['index.html','en/index.html','baas/index.html','en/baas/index.html','harga/index.html','supercharge/index.html','motor/edpower/index.html','404.html']) {
 if(!existsSync('public/'+route))throw Error('Missing page: '+route);
}
mkdirSync('dist',{recursive:true});
cpSync('public','dist/public',{recursive:true});
cpSync('server.js','dist/server.js');
cpSync('package.json','dist/package.json');
console.log('Website checked and built into dist. Entry file: server.js');
