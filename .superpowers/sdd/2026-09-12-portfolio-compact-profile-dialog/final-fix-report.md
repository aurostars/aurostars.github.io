# Final fix report

日期：2026-09-12
基线：`1c21364e30e18a04f41b40b2ae79b853bcf18ba9`
范围：final whole-branch review 中列出的五项 Important；未处理 Minor。

## 变更摘要

1. **展示真实邮箱地址**
   - `IdentityBar` 的邮件链接直接展示 `email`，保留 `mailto:` 行为。
   - 链接增加 `min-width: 0` 与 `overflow-wrap: anywhere`，确保长邮箱在 320px 视口安全换行。

2. **详情图库不裁切产品界面**
   - 所有详情图显式使用 `object-fit: contain`。
   - 四图 featured 布局从 `cover` 改为 `contain`，没有引入按图片区分的 speculative metadata。

3. **教育日期与简化专业**
   - 新增结构化 `EducationItem`：`school`、`degree`、`major`、`period`。
   - 精确呈现：
     - 北京师范大学｜经济学硕士｜2024-2027
     - 中国人民大学｜经济学学士｜2020-2024
   - 日期使用真实 `<time>` 元素，移除“理论经济学”“应用经济学”。

4. **5/6 项真实浏览器布局覆盖**
   - Playwright 在测试运行时克隆真实卡片 DOM 注入第 5/6 项，不向生产内容添加假项目。
   - 覆盖 1440、1024、768、390、320px。
   - 验证无水平溢出、普通卡片等宽、5 项最后一行从第一列开始、1440px 下 6 项为 3×2、且没有 placeholder。

5. **稳定的 16:9 图片失败回退**
   - `ProjectImage` 增加共享 `.project-image-frame` 容器与状态契约。
   - 加载失败状态固定为 16:9，回退文案保持可见、可访问。
   - Playwright 真实拦截图片请求并测量失败帧比例与非零高度。

## 修改文件

- `src/app/globals.css`
- `src/components/home-page.test.tsx`
- `src/components/identity-bar.tsx`
- `src/components/profile-history.tsx`
- `src/components/project-image.tsx`
- `src/content/portfolio.ts`
- `tests/browser/compact-portfolio.spec.ts`
- `.superpowers/sdd/2026-09-12-portfolio-compact-profile-dialog/final-fix-report.md`

`review_comments/issue_comments.jsonl` 保持未修改、未跟踪，未纳入提交。

## TDD RED / GREEN 证据

### 1. 可见邮箱

**RED**

```bash
npm test -- src/components/home-page.test.tsx -t "renders a compact identity bar"
```

结果：失败（1 failed），无法找到 accessible name 为 `dongxing.123@bytedance.com` 的链接；页面当时仍显示“发送邮件”。

**GREEN**

同一命令结果：通过（1 passed，15 skipped）。

### 2. 详情图片 contain

**RED（featured-four）**

```bash
npx playwright test tests/browser/compact-portfolio.spec.ts --grep "detail gallery preserves"
```

结果：失败（1 failed），`object-fit` 期望 `contain`，实际为 `cover`。

**GREEN（featured-four）**

同一命令结果：通过（1 passed）。

**RED（standard gallery 默认值）**

在同一行为测试加入标准三图项目后再次执行同一命令。

结果：失败（1 failed），标准图库 `object-fit` 期望 `contain`，实际为 `fill`。

**GREEN（全部详情图库）**

同一命令结果：通过（1 passed）。

### 3. 教育结构、专业与日期语义

**RED**

```bash
npm test -- src/components/home-page.test.tsx -t "renders schools"
```

结果：失败（1 failed），首行实际为“北京师范大学 理论经济学硕士”，缺少日期和 `<time>`。

**GREEN**

同一命令结果：通过（1 passed，15 skipped）。

### 4. 5/6 项浏览器布局覆盖

**RED**

```bash
npx playwright test tests/browser/compact-portfolio.spec.ts --grep "1440px supports a 5-project"
```

结果：失败（1 failed），期望 5 张卡片，实际仅有生产内容的 4 张卡片。

**GREEN**

```bash
npx playwright test tests/browser/compact-portfolio.spec.ts --grep "lays out"
```

结果：通过（10 passed），覆盖 5 个视口 × 5/6 两种数量。

### 5. 16:9 失败回退

**RED**

```bash
npx playwright test tests/browser/compact-portfolio.spec.ts --grep "failure keeps"
```

结果：失败（1 failed），图片失败回退已出现，但不存在共享 `.project-image-frame`，无法获得稳定帧。

**GREEN**

同一命令结果：通过（1 passed），失败帧可见、高度大于 0、宽高比接近 16:9。

## 聚焦验证

```bash
npm test -- src/components/home-page.test.tsx src/components/project-image.test.tsx src/content/portfolio.test.ts
```

结果：3 files passed，24 tests passed。

```bash
npm run typecheck
```

结果：通过，`tsc --noEmit` 无错误。

```bash
npm run lint
```

结果：通过，ESLint 无错误。

## 最终完整验证

```bash
npm test
```

结果：9 files passed，49 tests passed，0 failed。

```bash
npm run test:browser:portfolio
```

结果：15 passed，0 failed；该命令包含静态导出构建和完整 portfolio Chromium suite。

## 自审

- 五项 Important 均有行为级回归测试；没有依赖源码文本断言。
- 邮箱仍是可访问链接，并由 320px Playwright 用例验证页面无水平溢出。
- 测试夹具只在 Playwright 页面中注入，不污染 `portfolioCases` 或静态导出内容。
- 图片失败测试通过真实请求拦截触发 `onError`，并测量浏览器布局，不是 mock-only 断言。
- 未新增按图片区分的 cover 配置，未加入生产假项目，未处理 brief 之外的 Minor。
- `review_comments/` 保持原样且不纳入提交。
- 已执行 `git diff --check`，无空白错误。

## 关注点

无阻塞。Playwright 日志仅出现环境已有的 `NO_COLOR`/`FORCE_COLOR` warning，不影响构建或测试结果。
