# 全站结构与编辑位置

## Header

`components/Navbar.tsx`：Christine Logo；Work / Gallery / About；Contact 主按钮；主题切换。锚点分别对应 `work-artifacts` / `gallery` / `about` / `contact-finale`。

## Hero

`components/Hero.tsx`：Christine · Design Engineer · AI Product Designer；SHAPE CLARITY；Designing trustworthy, strategy-driven AI experiences.；Dive Into the Archive。

分段 hover、字体和间距在组件与 `index.css`；粒子在 `ParticlesBackground.tsx`。

## Selected Work

`constants.tsx` 提供项目数据，项目 Markdown 可通过脚本同步。`App.tsx` 的 PROJECTS 顺序和 hiddenProjectIds 决定展示。`ProjectCard.tsx` 提供共享卡片。

每个项目点开先进入 `ProjectAccess.tsx`，再进入共享 `ProjectPage.tsx`。密码目前是前端预览机制，不保护公开素材或 JS 中的内容。

## Gallery

`galleryProjects.ts` 提供 id / title / description / image / url / tags；目前为空。`components/Gallery.tsx` 显示三个 Coming soon 占位卡片。本版管理后台针对 Selected Work，尚未包含 Gallery 编辑。

## About

`constants.tsx` 的 CHRISTINE_BIO 提供简介（项目导入会保留该变量）；`App.tsx` 包含 Christine Lin、The Soul of Work、引言、EST / NewYork 2026 和 `public/assets/portrait.jpg`。左右两栏及头像 hover 在 `App.tsx` 与 `index.css`。

## Contact

`App.tsx`：LET’S TALK 邮件链接；Resume 图标链接到 Google Drive CV；Email me 链接到 christinelin2677@gmail.com；LinkedIn 链接到 linkedin.com/in/qinyulin/。

预约提示只是一段鼠标提示，LET’S TALK 当前仍打开邮件，并没有接入预约服务。

## 共用视觉和交互

- `index.css`：深浅色变量、主题水波、header 渐变、hover、图标提示。
- `components/ThemeToggle.tsx`：主题切换、偏好保存和动画降级。
- `components/CustomCursor.tsx`：鼠标圆点、View / 预约提示位置和尺寸。
- `components/SectionReveal.tsx`：章节入场动画。
- `index.html`：字体、Tailwind 配置和首次主题恢复。

## 上传与发布

本地素材路径 `/assets/...` 映射到 `public/assets/...`。上传素材只是保存文件，不会自动放入章节，需更新对应路径字段。`npm run build` 生成 dist；部署需要原托管服务的发布操作。
