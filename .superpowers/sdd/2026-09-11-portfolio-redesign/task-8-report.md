# Task 8 实施与验证报告

- 日期：2026-09-11
- 基线提交：`8d1e91dc0827a4bf093a8402617a0f667d60a1df`
- 验证对象：Next.js production static export，通过 `npx serve out -l 4173` 启动，实际可用监听端口为 `42289`
- 浏览器：AIME 云端浏览器，访问 `http://127.0.0.1:42289/`

## 实施内容

1. 在 `.github/workflows/deploy.yml` 的既有 build job 中，将门禁固定为 `npm ci`、`npm test`、`npm run lint`、`npm run typecheck`、`npm run build`，未修改触发器、权限、artifact 路径或 action 版本。
2. 新增真实页面截图资产 `public/og-portfolio.png`，尺寸 `1200x630`，文件大小 `126917` bytes。素材来自 production export 的最终首页 hero 与真实项目媒体，没有添加指标或无关插画。
3. 新增 OG 文件存在性和最小体积测试。
4. 在 `next.config.ts` 设置 `turbopack.root: process.cwd()`，消除多 lockfile 导致的 workspace root 推断警告，同时保留 `output: "export"` 和 `images: { unoptimized: true }`。
5. 根据桌面视觉检查调整 hero 标题字号与宽度，使 1440 和 1024 视口保持两行。

## TDD 与自动化命令

### 红态

```text
npm test -- src/components/home-page.test.tsx
```

结果：按预期失败，新增测试报告 `public/og-portfolio.png` 不存在，其余 11 项通过。

### 最终验证矩阵

```text
npm test
npm run lint
npm run typecheck
npm run build
git diff --check
```

结果：

- `npm test`：3 个测试文件、22 项测试全部通过。
- `npm run lint`：退出码 0。
- `npm run typecheck`：退出码 0。
- `npm run build`：退出码 0，静态路由 `/` 与 `/_not-found` 生成成功，无 Turbopack root 或缺图警告。
- `git diff --check`：退出码 0，无空白错误。
- `out/index.html` 与 `out/og-portfolio.png` 均存在。
- OG 校验：`1200x630`、`126917` bytes。
- 源码可见文案扫描：没有 em dash 或 en dash。

## production export 浏览器预检

使用 AIME 云端浏览器检查 production export。视口通过同源隔离 iframe 精确设置，检查结果如下：

| 视口 | 横向溢出 | 导航高度与换行 | Hero 标题 | CTA 首屏 | 主要响应式网格 |
| --- | --- | --- | --- | --- | --- |
| 1440x900 | 无 | 68px，单行 | 2 行 | 可见 | 多列 |
| 1024x900 | 无 | 68px，单行 | 2 行 | 可见 | 多列 |
| 768x900 | 无 | 68px，单行 | 3 行 | 可见 | 按断点保持多列 |
| 390x844 | 无 | 68px，单行 | 2 行 | 可见 | 单列 |
| 320x844 | 无 | 68px，单行 | 2 行 | 可见 | 单列 |

额外结果：

- 全页截图确认四个案例均显示真实项目图片、五步工作流和不同编排，图片均 `complete=true` 且 `naturalWidth>0`。
- 390px 移动端截图确认导航、hero、CTA 与首张项目图没有裁切或横向溢出。
- 键盘 Tab 首个焦点为 skip link，焦点样式为 3px cobalt outline，元素被移入可视区域。
- production CSSOM 确认默认 reveal 仅过渡 `opacity, transform`；`prefers-reduced-motion: reduce` 下 `.reveal` 为 `opacity: 1; transform: none; transition: none`，不会隐藏内容。
- 所有内部锚点 `#main-content`、`#cases`、`#experience`、`#contact` 均存在目标元素。
- 联系区域保持且仅包含邮件和 GitHub 两个链接。
- 全页视觉检查未发现暗色区块、紫色 glow、虚构指标或破图。

## 外部链接检查

以下链接经 `curl -L` 验证均返回 HTTP 200：

- `https://github.com/aurostars/Job-Application-Helper`
- `https://github.com/aurostars/Job-Application-Helper/releases`
- `https://github.com/aurostars/Interview-Review-Assistant`
- `https://github.com/aurostars/Resume-Builder-and-Editor`
- `https://github.com/JOYCEQL/magic-resume`
- `https://github.com/aurostars/meeting-minutes-extractor`
- `https://github.com/aurostars`

## 发现并修复的问题

1. 首次 production build 报告多 lockfile 导致 Turbopack root 推断警告。通过显式设置 `turbopack.root` 修复，最终 build 不再出现该警告。
2. 首次 1920px 浏览器截图显示 hero 标题超过计划要求的两行。调整桌面字号与文本宽度后，1440px 和 1024px 均为两行，并重新执行 build 与浏览器验证。
3. 初版 OG 来自修复前页面。重新构建、重新截图并重新生成 OG，确保资产与最终页面一致。

## Lighthouse 与等效审核

尝试命令：

```text
npx --yes lighthouse http://127.0.0.1:42289 --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=/tmp/portfolio-lighthouse.json --chrome-flags="--headless --no-sandbox --disable-dev-shm-usage" --quiet
```

Lighthouse 未执行：运行环境没有 Chrome/Chromium，工具要求设置有效 `CHROME_PATH`。未安装或启动替代浏览器，以遵守 AIME 浏览器约束。已使用 AIME 云端浏览器完成布局、溢出、图片、锚点、键盘焦点、reduced motion CSSOM、响应式网格和全页视觉等效审核。该限制为非阻断警告，不代表 Lighthouse 分数达标。

## 非阻断警告

Vitest 全部通过，但 jsdom 在加载 Tailwind 4 生成 CSS 时输出 CSS parser 诊断，并输出两个既有测试环境提示：`<html>` 被 Testing Library 挂载到容器，以及 `next/image` mock 将 `priority` 传给 DOM。它们未造成测试失败，production build 和真实浏览器未复现对应运行问题。
