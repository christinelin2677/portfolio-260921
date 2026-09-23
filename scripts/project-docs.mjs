import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.join(root, 'constants.tsx');
const docsPath = path.join(root, 'content/projects');
const source = await fs.readFile(sourcePath, 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { PROJECTS } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const labels = {
  description: '项目摘要（目前卡片不显示）', longDescription: 'Overview｜项目概述',
  projectPlanGallery: 'Project Plan｜项目计划', problemSolutionGallery: 'Problem & Solution｜问题与解决方案',
  hmwDescription: 'How Might We｜设计问题', howMightWeGallery: 'HMW 素材（当前模板未使用）',
  personaGallery: 'Persona｜用户画像', marketResearchGallery: 'Market Research｜市场研究',
  userJourneyMapGallery: 'User Journey Map｜用户旅程', storyboardGallery: 'Storyboard｜故事板',
  userFlowGallery: 'User Flow｜用户流程', inforArchitectureGallery: 'Information Architecture｜信息架构',
  lowFiGallery: 'Low Fidelity｜低保真', hiFiGallery: 'High Fidelity｜高保真',
  finalDesignGallery: 'Final Design｜最终设计', impactGallery: 'Impact｜成果',
  challenge: 'The Challenge｜挑战与反思', approach: 'The Vision｜愿景与方法', gallery: '通用图片（当前模板未使用）',
};
const hidden = new Set(['5','6','7','8','9']);
const fieldBlock = (key, value) => `<!-- field:${key} -->\n\n\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\`\n\n<!-- /field:${key} -->`;
const fileName = p => `${String(PROJECTS.indexOf(p)+1).padStart(2,'0')}-${p.title.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-')}.md`;
const assetLink = value => `[${path.basename(value)}](<../../public${value}>)`;
function render(p) {
  const metadata = Object.fromEntries(Object.entries(p).filter(([k]) => !(k in labels)));
  let result = `# ${p.title.trim()}\n\n状态：${hidden.has(p.id) ? '隐藏（内容保留）' : '展示'} ｜ 密码入口：独立密码 ｜ 详情：${p.placeholder ? '占位' : '现有内容'}\n\n`;
  result += '> 修改下方 JSON 内容后运行 `npm run content:check`，再运行 `npm run content:import` 同步网站。标题、说明和素材预览链接仅作说明；标记区中的 JSON 是导入依据。不要改变 id。\n\n';
  result += `## 基本信息 / 卡片 / 详情首屏\n\n${fieldBlock('metadata',metadata)}\n\n封面：${assetLink(p.image)}\n\n`;
  for (const [key,label] of Object.entries(labels)) {
    result += `## ${label}\n\n字段：\`${key}\`\n\n`;
    if (!(key in p)) {
      result += `当前未配置。如需新增，在下方添加字段块：\n\n${fieldBlock(key,null)}\n\n`;
    } else {
      result += `${fieldBlock(key,p[key])}\n\n`;
      if (Array.isArray(p[key])) result += p[key].map((asset,i) => `${i+1}. ${assetLink(asset)}`).join('\n')+'\n\n';
    }
  }
  return result;
}
function parse(md) {
  const result = {};
  const seen = new Set();
  for (const match of md.matchAll(/<!-- field:(\w+) -->\s*```json\s*([\s\S]*?)\s*```\s*<!-- \/field:\1 -->/g)) {
    const [,key,json] = match;
    if (seen.has(key)) throw new Error(`重复字段 ${key}`);
    seen.add(key);
    const value = JSON.parse(json);
    if (key === 'metadata') Object.assign(result,value);
    else if (value !== null) result[key] = value;
  }
  for (const key of ['metadata', ...Object.keys(labels)]) if (!seen.has(key)) throw new Error(`字段块缺失或格式错误：${key}`);
  for (const key of ['id','title','category','description','image']) if (typeof result[key] !== 'string') throw new Error(`${key} 必须为字符串`);
  if (!Array.isArray(result.tags) || result.tags.some(v=>typeof v !== 'string')) throw new Error('tags 必须为字符串数组');
  for (const [key,value] of Object.entries(result)) {
    if (key.endsWith('Gallery') || key === 'gallery') {
      if (!Array.isArray(value) || value.some(v=>typeof v !== 'string')) throw new Error(`${key} 必须为素材路径数组`);
    } else if (key === 'placeholder') { if (typeof value !== 'boolean') throw new Error('placeholder 必须为布尔值'); }
    else if (key !== 'tags' && typeof value !== 'string') throw new Error(`${key} 必须为字符串`);
  }
  return result;
}
const command = process.argv[2] || 'check';
if (command === 'export') {
  await fs.mkdir(docsPath,{recursive:true});
  const force = process.argv.includes('--force');
  for (const p of PROJECTS) {
    const dest = path.join(docsPath,fileName(p));
    if (!force) { try { await fs.access(dest); throw new Error(`文档已存在：${dest}。使用 --force 才能覆盖。`); } catch(e) { if (e.code !== 'ENOENT') throw e; } }
  }
  for (const p of PROJECTS) await fs.writeFile(path.join(docsPath,fileName(p)),render(p));
  console.log(`已导出 ${PROJECTS.length} 个项目文档。`);
} else {
  const next = [];
  let missing = 0;
  let newMissing = 0;
  const documents = new Map();
  for (const name of (await fs.readdir(docsPath)).filter(n => n.endsWith('.md'))) {
    const parsed = parse(await fs.readFile(path.join(docsPath,name),'utf8'));
    if (documents.has(parsed.id)) throw new Error(`重复项目 id：${parsed.id}`);
    documents.set(parsed.id, parsed);
  }
  if (documents.size !== PROJECTS.length) throw new Error('项目文档数量与网站不一致');
  for (const p of PROJECTS) {
    const parsed = documents.get(p.id);
    if (!parsed) throw new Error(`缺少项目 ${p.id}`);
    const previousAssets = new Set([p.image,...Object.entries(p).filter(([k])=>k.endsWith('Gallery')||k==='gallery').flatMap(([,v])=>v)]);
    if (parsed.id !== p.id) throw new Error(`${p.title}: 不允许更改项目 id`);
    for (const asset of [parsed.image,...Object.entries(parsed).filter(([k])=>k.endsWith('Gallery')||k==='gallery').flatMap(([,v])=>v)]) {
      if (!asset.startsWith('/assets/') || asset.includes('..')) throw new Error(`素材必须使用 /assets/ 内的路径：${asset}`);
      try { await fs.access(path.join(root,'public',asset)); } catch { missing++; if (!previousAssets.has(asset)) newMissing++; console.warn(`缺失素材 [${p.title}]: ${asset}`); }
    }
    if (command === 'roundtrip') {
      const canonical = obj => JSON.stringify(Object.fromEntries(Object.entries(obj).sort(([a],[b])=>a.localeCompare(b))));
      if (canonical(parsed)!==canonical(p)) throw new Error(`往返不一致：${p.title}`);
    }
    next.push(parsed);
  }
  console.log(`已校验 ${next.length} 个项目，缺失素材 ${missing} 项。`);
  if (command === 'import') {
    if (newMissing) throw new Error('新增素材路径不存在，请先补齐素材再导入。原有缺失素材仅告警。');
    const start = source.indexOf('export const PROJECTS: Project[] =');
    const end = source.indexOf('export const CHRISTINE_BIO');
    if (start < 0 || end < start) throw new Error('无法定位数据区');
    await fs.writeFile(path.join(root,'constants.backup.local.tsx'),source);
    await fs.writeFile(sourcePath,source.slice(0,start)+`export const PROJECTS: Project[] = ${JSON.stringify(next,null,2)};\n\n`+source.slice(end));
    console.log('已同步 constants.tsx；原文件备份为 constants.backup.local.tsx。');
  } else if (!['check','roundtrip'].includes(command)) throw new Error('支持 export / check / roundtrip / import');
}
