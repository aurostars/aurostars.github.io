# 董星的个人主页

部署地址：<https://aurostars.github.io/>

这是一个静态导出的沉浸式个人作品集。页面使用原创 Three.js 植物浮雕、滚动镜头、全屏菜单和真实项目截图，内容包含教育经历、实习经历、六个个人项目及可深链的项目详情。

## 本地运行

```bash
npm install
npm run dev
```

打开 <http://localhost:3000/>。开发环境请使用 `localhost`，避免 Next.js 对其他 origin 的开发资源保护影响 HMR。

## 质量检查

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm run test:browser:portfolio
npm run test:browser:reduced
npm run test:browser:no-js
npm run test:browser:assets
```

浏览器测试使用本机稳定版 Chrome。页面覆盖 Reduced Motion、无 JavaScript、图片失败、WebGL 失败、键盘焦点、原生 dialog、URL 深链和 320px 响应式布局。

## 内容

- 个人与项目事实位于 `src/content/portfolio.ts`。
- 真实项目截图位于 `public/projects/`。
- 公司和学校标识位于 `public/companies/` 与 `public/schools/`。
- 三维场景位于 `src/components/immersive/garden-scene.tsx`。
- 视觉系统记录在 `DESIGN.md`。

三维花园为原创程序化几何，不包含参考网站的模型、品牌、文案或项目素材。WebGL 不可用时会显示 CSS 浮雕降级，页面内容和项目详情仍可使用。

## 发布

`main` 分支推送后，`.github/workflows/deploy.yml` 会执行测试、代码检查、类型检查和静态构建，然后将 `out/` 发布到 GitHub Pages。
