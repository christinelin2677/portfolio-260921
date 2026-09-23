import type { Plugin } from 'vite';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const exec = promisify(execFile);

export default function localAdmin(): Plugin {
  return {
    name: 'local-portfolio-admin',
    configureServer(server) {
      const root = server.config.root;
      const docs = path.join(root,'content/projects');
      const eventsFile = path.join(root,'.local-admin/events.json');
      let writing = Promise.resolve();
      const serialized = (job: () => Promise<void>) => {
        const result = writing.then(job);
        writing = result.catch(() => {});
        return result;
      };
      server.middlewares.use(async (req,res,next) => {
        const url = new URL(req.url || '/', 'http://localhost');
        if (url.pathname !== '/admin' && !url.pathname.startsWith('/__admin/') && url.pathname !== '/__events') return next();
        const remote = req.socket.remoteAddress || '';
        const host = req.headers.host || '';
        const localHost = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host);
        const localAddress = ['127.0.0.1','::1','::ffff:127.0.0.1'].includes(remote);
        const send = (status:number, data:unknown) => {
          res.statusCode = status;
          res.setHeader('Cache-Control','no-store');
          res.setHeader('Content-Type','application/json');
          res.end(JSON.stringify(data));
        };
        if (!localHost || !localAddress) return send(403,{error:'后台仅允许本机访问'});
        if (req.headers.origin && req.headers.origin !== `http://${host}`) return send(403,{error:'来源不允许'});
        try {
          const names = () => fs.readdir(docs).then(files=>files.filter(n=>n.endsWith('.md')));
          const docPath = async (name:string) => {
            if (!(await names()).includes(name)) throw new Error('项目文档不存在');
            return path.join(docs,name);
          };
          const body = async () => {
            if (!req.headers['content-type']?.startsWith('application/json')) throw new Error('需要 JSON 请求');
            const chunks:Buffer[] = []; let size=0;
            for await (const chunk of req) { size+=chunk.length; if(size>28*1024*1024) throw new Error('文件不能超过 20 MB'); chunks.push(chunk); }
            return JSON.parse(Buffer.concat(chunks).toString());
          };
          if (req.method==='GET' && url.pathname==='/admin') {
            res.setHeader('Content-Type','text/html; charset=utf-8');
            res.setHeader('Cache-Control','no-store');
            return res.end(await fs.readFile(path.join(root,'admin/index.html')));
          }
          if (req.method==='GET' && url.pathname==='/__admin/projects') {
            return send(200,await Promise.all((await names()).map(async name=>({name,title:(await fs.readFile(path.join(docs,name),'utf8')).split('\n')[0].replace(/^# /,'')}))));
          }
          if (req.method==='GET' && url.pathname==='/__admin/document') return send(200,{content:await fs.readFile(await docPath(url.searchParams.get('name')||''),'utf8')});
          if (req.method==='POST' && url.pathname==='/__admin/save') {
            const data=await body(); const file=await docPath(data.name);
            if(typeof data.content!=='string' || data.content.length>1000000) throw new Error('文档内容无效');
            await serialized(async()=>{
              const backup=path.join(root,'.local-admin/backups'); await fs.mkdir(backup,{recursive:true});
              await fs.copyFile(file,path.join(backup,`${Date.now()}-${randomUUID()}-${data.name}`));
              await fs.writeFile(file,data.content);
            });
            return send(200,{message:'已保存文档草稿，应用后才会更新网站。'});
          }
          if (req.method==='POST' && url.pathname==='/__admin/apply') {
            await body();
            let result = '';
            await serialized(async()=> { const output=await exec(process.execPath,['scripts/project-docs.mjs','import'],{cwd:root}); result=output.stdout+output.stderr; });
            return send(200,{message:result});
          }
          if (req.method==='POST' && url.pathname==='/__admin/upload') {
            const data=await body(); await docPath(data.project);
            const extension=path.extname(String(data.name)).toLowerCase();
            if(!['.png','.jpg','.jpeg','.webp','.gif','.avif','.mp4','.webm','.pdf'].includes(extension)) throw new Error('支持图片、MP4/WebM 和 PDF');
            if(typeof data.base64!=='string') throw new Error('上传数据无效');
            const bytes=Buffer.from(data.base64,'base64'); if(bytes.length>20*1024*1024||!bytes.length) throw new Error('素材大小无效');
            const folder=data.project.replace(/\.md$/,'');
            const relative=`/assets/uploads/${folder}/${randomUUID()}${extension}`;
            const file=path.join(root,'public',relative); await fs.mkdir(path.dirname(file),{recursive:true}); await fs.writeFile(file,bytes);
            return send(200,{path:relative,message:'已上传。将路径放入对应 JSON 素材数组后保存并应用。视频/PDF 不能直接用于现有图片章节。'});
          }
          if (req.method==='POST' && url.pathname==='/__events') {
            const data=await body();
            if(!['page_view','project_open','contact_resume','contact_email','contact_linkedin'].includes(data.event)) throw new Error('事件无效');
            if(data.project && !/^[a-z0-9-]{1,40}$/.test(data.project)) throw new Error('项目无效');
            await serialized(async()=>{
              let events:any[]=[]; try {events=JSON.parse(await fs.readFile(eventsFile,'utf8'));} catch(e:any) { if(e.code!=='ENOENT') throw e; }
              events.push({event:data.event,project:data.project||null,time:new Date().toISOString()});
              events=events.filter(e=>Date.parse(e.time)>Date.now()-30*86400000).slice(-10000);
              await fs.mkdir(path.dirname(eventsFile),{recursive:true}); await fs.writeFile(eventsFile,JSON.stringify(events));
            });
            return send(200,{ok:true});
          }
          if(req.method==='GET' && url.pathname==='/__admin/stats') {
            let events:any[]=[]; try{events=JSON.parse(await fs.readFile(eventsFile,'utf8'));}catch(e:any){if(e.code!=='ENOENT')throw e;}
            events=events.filter(e=>Date.parse(e.time)>Date.now()-30*86400000);
            const counts:Record<string,number>={}; const projects:Record<string,number>={};
            for(const e of events){counts[e.event]=(counts[e.event]||0)+1;if(e.event==='project_open')projects[e.project]=(projects[e.project]||0)+1;}
            return send(200,{counts,projects,total:events.length,days:30});
          }
          return send(404,{error:'接口不存在'});
        }catch(e:any){return send(400,{error:e.stderr||e.message||'操作失败'});}
      });
    }
  };
}
