# 作品集内容管理入口

所有 10 个项目已按现有源码完整导出。原有内容、素材顺序、拼写均保留，没有代写或补造项目事实。

## 项目目录

| 顺序 | 文档 | 当前状态 |
|---|---|---|
| 1 | [DreamLake](projects/01-dreamlake.md) | 展示；详情占位 |
| 2 | [AI HUB](projects/02-ai-hub.md) | 展示 |
| 3 | [DrayEasy](projects/03-drayeasy.md) | 展示 |
| 4 | [OpusClip](projects/04-opusclip.md) | 展示 |
| 5 | [DoggyCleaner](projects/05-doggycleaner.md) | 展示 |
| 6 | [ScamEd](projects/06-scamed.md) | 隐藏 |
| 7 | [WhichCard](projects/07-whichcard.md) | 隐藏 |
| 8 | [TarotMaster](projects/08-tarotmaster.md) | 隐藏 |
| 9 | [Dormie](projects/09-dormie.md) | 隐藏 |
| 10 | [Roadrage](projects/10-roadrage.md) | 隐藏 |

每份文档包含卡片信息、详情首屏、全部文案字段、章节素材路径及顺序。未配置字段使用 `null`，不影响现有页面。

## 最简单的更新方式：本地后台

1. 在仓库目录运行 `npm run dev`。
2. 打开 http://127.0.0.1:3000/admin 。
3. 选择项目，直接输入文案；章节图片每行一个路径。基本信息（名称、年份、标签等）暂用 JSON 编辑，需保留引号和括号。
4. 上传图片前选择「替换封面」或目标章节，上传后自动填入编辑器；也可选择仅存入素材库。视频和 PDF 目前只保存文件，不嵌入图片章节。
5. 点击 **保存草稿**。此时仅更新 Markdown，不改变网站。
6. 点击 **应用全部项目到预览**。校验成功后更新 `constants.tsx`，预览自动刷新。
7. 核对页面后运行 `npm run build`。线上发布仍沿用原部署流程，本地后台不会自动发布。

后台只在开发服务器启用，只接受本机请求；不会打包到生产页面。此版本没有在线账号或远程登录。

## 用 Markdown 更新

修改项目文档 `<!-- field:... -->` 标记内的 JSON，再执行：

```sh
npm run content:check
npm run content:import
npm run build
```

- `content:check` 检查类型、项目 ID 和素材路径。
- `content:import` 将文档同步到源码；会先备份 `constants.backup.local.tsx`。
- `content:roundtrip` 检查文档与源码字段内容是否完全一致。文档编辑后、导入前不一致属于预期。
- `content:export` 从源码重新导出；已有文档时拒绝覆盖，确认要覆盖才使用 `npm run content:export -- --force`。
- 原有缺失素材仅告警；新引用的缺失素材会阻止导入。
- 不要改项目 `id` 或删除字段标记。`null` 表示不配置字段；空字符串和空数组有各自含义。
- Markdown 中预览链接和章节说明不参与导入，JSON 是依据。输入的 Markdown 标记不会变成网站富文本。
- 网站展示顺序和隐藏项目名单目前仍在 `App.tsx` 控制，后台本版不提供拖拽排序或新建/删除项目。
- 素材中的文字属于图片内容：要修改图里的文字，需要修改原设计文件并重新导出图片。

## 页面结构与对应文件

| 页面元素 | 编辑位置 |
|---|---|
| 项目卡片标题、分类、年份、封面 | 项目文档 metadata |
| 首屏客户、角色、服务标签 | metadata 的 client / role / tags |
| 详情文字和素材章节 | 各项目文档对应 field |
| 项目卡片布局、hover 和视差 | `components/ProjectCard.tsx` |
| 项目详情共享布局 | `components/ProjectPage.tsx` |
| DreamLake 占位文案和占位板块 | `ProjectPage.tsx` placeholder 分支；metadata.placeholder=false 后使用正式内容 |
| 密码入口文案和交互 | `components/ProjectAccess.tsx` |
| 预览密码 | `projectPasswords.ts`；密码清单不放入项目文档 |
| Hero / About / Contact / 导航 | [全站结构说明](SITE-STRUCTURE.md) |

## 统计范围

本地后台显示近 30 天的页面访问、项目入口打开、Resume / Email / LinkedIn 点击次数；可导出 JSON。没有把测试数据当成线上访客。它不统计独立访客，不收集 IP、邮件地址、密码、输入文本，不发送到第三方。

数据保存在 `.local-admin/events.json`，最多 10,000 条。草稿备份在 `.local-admin/backups/`，均不提交 Git。正式线上统计和后台方案见 [后台后续方案](BACKEND-PLAN.md)。

## 已发现的缺失素材

ScamEd：`/assets/ScamAI/lowfi.png`、`keyui1.png` 到 `keyui8.png`、`finaldesign3.png`、`final design4.png`、`impact.png`。

Dormie：`/assets/Dormie/impact.png`。

以上共 13 处，来自原始项目数据；没有擅自替换或删除。运行 `npm run content:check` 可查看完整路径。
