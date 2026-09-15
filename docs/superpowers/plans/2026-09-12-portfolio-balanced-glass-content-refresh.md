# Portfolio Balanced Glass Content Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有紧凑个人主页升级为 B1 平衡通透风格，加入双栏履历与公司 Logo，收敛项目详情内容，并修复弹窗视口居中。

**Architecture:** 保留现有 Next.js 单页、`ProjectCase` 数据驱动、单一共享原生 dialog 和 URL 深链架构。内容事实与静态资源先在 `portfolio.ts` 和 `public/` 中完成，再由小型组件消费；视觉层统一通过 `globals.css` 语义变量实现，交互只在现有 Client Components 中增强。

**Tech Stack:** Next.js 16.2.10、React 19.2.4、TypeScript 5、Tailwind CSS 4 基础设施、原生 CSS、Motion 13.2.0、Vitest 3.2.4、Testing Library、Playwright 1.62.1、Next Image。

## Global Constraints

- 保留单页信息架构：身份栏、双栏履历、个人项目网格、共享项目详情 dialog。
- 不新增 Hero、头像、职业标签、个人口号、目录、底部联系区或新路由。
- 身份栏只显示“董星”、完整新邮箱地址和 GitHub；邮箱本地部分为 `dst3056`，域名为 `qq.com`。
- 桌面端教育在左、实习在右；小于 768px 后上下排列。
- 默认明亮主题中，实习日期、公司、岗位和工作内容全部使用黑色文字；深色模式使用主题主文本色保证对比度。
- 公司 Logo 使用官方品牌色本地静态资源，不拉伸、不裁切、不使用虚构标志或首字母头像。
- 字节跳动经历固定为：`2026.07 - 至今`、`AI 产品经理`、`企业 Agent 和团队数字员工的搭建与迭代`。
- 项目卡片内部删除“查看详情”；项目标题区显示“点击卡片任意位置，可查看详情”。
- 秋招网申助手详情只显示扩展弹窗截图和个人信息设置页截图。
- 项目功能清单只来自 README 已实现能力，不显示路线图或规划项。
- 详情中的唯一外部链接文本为“查看源码”。
- 原生 dialog 在桌面视口严格水平、垂直居中，最大高度 `86dvh`，动画只作用于内部 panel。
- 项目网格断点保持：`>=1080px` 三列、`680-1079px` 两列、`<680px` 一列。
- 只动画 `transform` 与 `opacity`；遵守 `prefers-reduced-motion`。
- 默认明亮 B1 主题，使用 `prefers-color-scheme: dark` 自动适配，不增加主题按钮。
- 320、390、768、1024、1440px 均不得产生横向溢出。
- 不增加新的运行时依赖。

---

## File Structure

**Create**

- `src/components/company-logo.tsx`：封装公司 Logo、加载失败降级和替代文字。
- `src/components/company-logo.test.tsx`：验证 Logo 可访问名称和失败降级。
- `public/companies/bytedance.svg`
- `public/companies/iflytek.svg`
- `public/companies/meituan.svg`
- `public/companies/drc-big-data.svg`
- `public/companies/bosszhipin.svg`
- `public/companies/pacific-securities.svg`
- `public/projects/job-application-helper/extension-popup.png`：从 Job-Application-Helper 仓库 README 使用的真实扩展弹窗截图复制。

**Modify**

- `src/content/portfolio.ts`：扩展数据类型、更新邮箱、实习、媒体和 README 功能清单。
- `src/content/portfolio.test.ts`：验证内容事实、Logo、媒体和功能清单约束。
- `src/app/page.tsx`：移除 IdentityBar 的 `role` 传参。
- `src/components/identity-bar.tsx`：移除职业标签接口和渲染。
- `src/components/profile-history.tsx`：双栏履历与 Logo 渲染。
- `src/components/home-page.test.tsx`：覆盖身份栏、履历、提示、详情和链接行为。
- `src/components/featured-cases.tsx`：加入统一浅提示。
- `src/components/case-summary-card.tsx`：删除卡片内“查看详情”。
- `src/components/case-detail.tsx`：渲染直接功能列表，仅保留“查看源码”。
- `src/components/case-dialog.tsx`：保持 dialog 定位静态，只动画 panel。
- `src/components/case-dialog.test.tsx`：覆盖唯一链接与定位契约。
- `src/app/globals.css`：B1 变量、双栏履历、Logo、卡片、详情、dialog 居中和深色模式。
- `tests/browser/compact-portfolio.spec.ts`：覆盖居中、双栏、截图数量、唯一链接和响应式。
- `tests/browser/reduced-motion-css.spec.ts`：继续验证 Reduced Motion 最终状态。

---

### Task 1: 内容契约、履历事实与静态资源

**Files:**
- Create: `public/companies/bytedance.svg`
- Create: `public/companies/iflytek.svg`
- Create: `public/companies/meituan.svg`
- Create: `public/companies/drc-big-data.svg`
- Create: `public/companies/bosszhipin.svg`
- Create: `public/companies/pacific-securities.svg`
- Create: `public/projects/job-application-helper/extension-popup.png`
- Modify: `src/content/portfolio.ts:7-137`
- Modify: `src/content/portfolio.test.ts`

**Interfaces:**
- Produces: `ProjectCase.features: string[]`、`ExperienceItem.logo: CompanyLogo`。
- Produces: `CompanyLogo = { src: string; alt: string; width: number; height: number }`。
- Consumed by: Tasks 2 and 4.

- [ ] **Step 1: Write failing content-contract tests**

Add literal expectations to `src/content/portfolio.test.ts`:

```ts
expect(contact.email).toBe(["dst3056", "qq.com"].join("@"));
expect(experiences[0]).toMatchObject({
  period: "2026.07 - 至今",
  organization: "字节跳动",
  role: "AI 产品经理",
  highlight: "企业 Agent 和团队数字员工的搭建与迭代",
  logo: expect.objectContaining({ src: "/companies/bytedance.svg", alt: "字节跳动 Logo" }),
});
expect(portfolioCases.every((project) => project.features.length >= 8)).toBe(true);
expect(portfolioCases.find((project) => project.slug === "job-application-helper")?.media.map(({ src }) => src)).toEqual([
  "/projects/job-application-helper/extension-popup.png",
  "/projects/job-application-helper/profile-manager.png",
]);
expect(portfolioCases.every((project) => project.releaseUrl === undefined)).toBe(true);
```

Also assert the first and last literal feature for each project so accidental list replacement fails.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- src/content/portfolio.test.ts`

Expected: FAIL because `features` and `logo` do not exist, the new experience is absent, the email is old, and Job Application Helper still has four media items.

- [ ] **Step 3: Add exact data interfaces**

Update `src/content/portfolio.ts`:

```ts
export interface CompanyLogo extends ProjectMedia {}

export interface ProjectCase {
  // keep current fields
  features: string[];
}

export interface ExperienceItem {
  period: string;
  organization: string;
  role: string;
  highlight: string;
  logo: CompanyLogo;
}
```

Keep `highlights` only until Task 4 migrates the renderer; do not add any new optional content fields.

- [ ] **Step 4: Populate verified project features**

Use the exact lists from the approved spec, Section 9:

- 秋招网申助手：10 items, from “求职资料集中管理” through “版本化 JSON 备份与 WebDAV 双向同步”。
- 智能简历编辑工具：11 items, from “可视化简历创建、区块编辑与拖拽排序” through “本地简历数据与 API Key 管理”。
- 面试复盘助手：10 items, from “M4A、MP3、WAV、AAC 录音或已有文本导入” through “按公司、岗位和时间线管理多场面试档案”。
- 智能会议纪要工具：12 items, from “六阶段智能纪要生成” through “SQLite 配置与会议数据持久化”。

Delete every `releaseUrl` value. Do not add upstream or demo links to the data model.

- [ ] **Step 5: Update contact, experiences, and Job Application Helper media**

Build the email from explicit parts instead of storing a masked token:

```ts
const emailLocalPart = "dst3056";
const emailDomain = "qq.com";

export const contact = {
  email: `${emailLocalPart}@${emailDomain}`,
  github: "https://github.com/aurostars",
} as const;
```

Prepend the approved ByteDance experience. Add exact local Logo metadata to all six experiences. Replace Job Application Helper media with only:

```ts
media: [
  { src: "/projects/job-application-helper/extension-popup.png", alt: "秋招网申助手点击扩展后打开的界面", width: 1600, height: 900 },
  { src: "/projects/job-application-helper/profile-manager.png", alt: "秋招网申助手的个人信息设置页面", width: 1920, height: 1563 },
],
```

Clone `https://github.com/aurostars/Job-Application-Helper.git` at depth 1 into a temporary directory, follow the README image reference for the extension popup, and copy that real screenshot. Place it on a 1600×900 canvas without cropping or stretching, then save it as `extension-popup.png`; the content metadata above must stay `1600 × 900`.

- [ ] **Step 6: Add official local assets**

Download each Logo only from the organization’s official site or official media asset. Preserve source colors and aspect ratio. Convert SVGs only by optimizing existing official vector data; do not redraw paths. Record source URLs in the commit body or Task report. Copy the real extension popup screenshot from the Job-Application-Helper repository asset referenced by its README.

- [ ] **Step 7: Run the content test and verify GREEN**

Run: `npm test -- src/content/portfolio.test.ts`

Expected: all content tests pass with no warnings.

- [ ] **Step 8: Commit**

```bash
git add src/content/portfolio.ts src/content/portfolio.test.ts public/companies public/projects/job-application-helper/extension-popup.png
git commit -m "feat: update portfolio facts and verified capabilities"
```

---

### Task 2: 精简身份栏与双栏 Logo 履历

**Files:**
- Create: `src/components/company-logo.tsx`
- Create: `src/components/company-logo.test.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/identity-bar.tsx`
- Modify: `src/components/profile-history.tsx`
- Modify: `src/components/home-page.test.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `ExperienceItem.logo` from Task 1.
- Produces: `CompanyLogo({ logo }: { logo: CompanyLogo })`.
- Produces: `IdentityBarProps = { name: string; email: string; github: string }`.

- [ ] **Step 1: Write failing identity and history tests**

In `src/components/home-page.test.tsx`, add assertions:

```ts
expect(screen.queryByText("AI 产品经理与独立开发者")).not.toBeInTheDocument();
expect(screen.queryByText("保持好奇，终身学习")).not.toBeInTheDocument();
expect(screen.queryByRole("img", { name: /头像/ })).not.toBeInTheDocument();
expect(screen.getByText("字节跳动")).toBeInTheDocument();
expect(screen.getByText("企业 Agent 和团队数字员工的搭建与迭代")).toBeInTheDocument();
expect(screen.getByRole("img", { name: "字节跳动 Logo" })).toBeInTheDocument();
expect(screen.getByLabelText("教育与实习经历")).toHaveClass("profile-history-motion");
```

In `company-logo.test.tsx`, render a real `CompanyLogo`, trigger `error`, and assert the image becomes hidden while nearby organization text remains in the document.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- src/components/home-page.test.tsx src/components/company-logo.test.tsx`

Expected: FAIL because the role remains and `CompanyLogo` does not exist.

- [ ] **Step 3: Implement `CompanyLogo`**

Use `next/image` with local dimensions and a local failed state:

```tsx
"use client";

export function CompanyLogo({ logo }: { logo: CompanyLogo }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return <Image src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} onError={() => setFailed(true)} />;
}
```

Do not render a letter avatar or broken image frame.

- [ ] **Step 4: Simplify `IdentityBar`**

Remove `role` from `IdentityBarProps`, its destructuring, and the paragraph. Remove the `role` prop from `src/app/page.tsx`. Keep the complete visible email link and GitHub accessibility label.

- [ ] **Step 5: Render Logo-backed two-column history**

Wrap each experience row with a fixed-size `.company-logo-slot`, render `<CompanyLogo logo={item.logo} />`, and keep company, role, period, and highlight as semantic text. Use one shared `.profile-history-motion` grid container, not one card per row.

- [ ] **Step 6: Add scoped layout CSS**

Set `.profile-history-motion` to two columns on desktop and one column below 768px. In the light theme, set experience text to the primary black token. Add safe wrapping for organization and highlight text. Preserve `<time>` elements.

- [ ] **Step 7: Run focused tests and verify GREEN**

Run: `npm test -- src/components/home-page.test.tsx src/components/company-logo.test.tsx`

Expected: all focused tests pass, output pristine.

- [ ] **Step 8: Commit**

```bash
git add src/app/page.tsx src/components/identity-bar.tsx src/components/profile-history.tsx src/components/company-logo.tsx src/components/company-logo.test.tsx src/components/home-page.test.tsx src/app/globals.css
git commit -m "feat: add compact logo-backed profile history"
```

---

### Task 3: B1 平衡通透视觉系统与项目提示

**Files:**
- Modify: `src/components/featured-cases.tsx`
- Modify: `src/components/case-summary-card.tsx`
- Modify: `src/components/home-page.test.tsx`
- Modify: `src/app/globals.css`
- Test: `tests/browser/compact-portfolio.spec.ts`

**Interfaces:**
- Keeps: `CaseSummaryCard` remains one native `motion.button`.
- Produces: `#cases-hint` visible instruction and `aria-describedby="cases-hint"` on `.case-grid`.

- [ ] **Step 1: Write failing interaction-copy tests**

Add unit assertions:

```ts
expect(screen.getByText("点击卡片任意位置，可查看详情")).toBeInTheDocument();
expect(screen.queryAllByText("查看详情")).toHaveLength(0);
for (const card of screen.getAllByRole("button", { name: /打开.+详情/ })) {
  expect(card).not.toHaveTextContent("查看详情");
}
```

Add a Playwright assertion that the hint is adjacent to the “个人项目” heading and wraps without horizontal overflow at 320px.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- src/components/home-page.test.tsx`

Expected: FAIL because the current heading has no hint and cards still render the label.

- [ ] **Step 3: Add the single project instruction**

In `FeaturedCases`, render:

```tsx
<div className="section-heading compact-heading">
  <h2 ref={headingRef} id="cases-title" tabIndex={-1}>个人项目</h2>
  <p id="cases-hint" className="cases-hint">点击卡片任意位置，可查看详情</p>
</div>
<div className="case-grid" aria-describedby="cases-hint" data-project-count={projects.length}>
```

Remove only the card’s visible “查看详情” span; keep the button accessible name that identifies the project.

- [ ] **Step 4: Introduce B1 semantic tokens**

In `globals.css`, define light tokens for ice-white background, mist-blue translucent surface, solid project surface, primary black text, secondary text, electric-blue accent, hairline, and tinted shadow. Rewire existing selectors to tokens instead of scattering new literal colors.

Add one fixed `pointer-events: none` background texture layer or pseudo-element. It must not be attached to a scrolling container.

- [ ] **Step 5: Add automatic dark tokens**

Under `@media (prefers-color-scheme: dark)`, swap the same semantic tokens to deep blue-gray surfaces and readable text. Keep the accent family and company Logo colors. Do not add a theme toggle or section-level theme inversion.

- [ ] **Step 6: Refine cards without changing behavior**

Use solid white-like project surfaces, 16px outer radius, 12px image radius, tinted shadow, visible focus ring, and existing tilt limits. Keep image frames stable and preserve the 3/2/1 grid.

- [ ] **Step 7: Run unit and focused browser checks**

Run:

```bash
npm test -- src/components/home-page.test.tsx src/components/motion/tilt-card.test.tsx
npm run test:browser:portfolio -- --grep "responsive|overflow|project"
```

Expected: focused tests pass and no viewport has horizontal overflow.

- [ ] **Step 8: Commit**

```bash
git add src/components/featured-cases.tsx src/components/case-summary-card.tsx src/components/home-page.test.tsx src/app/globals.css tests/browser/compact-portfolio.spec.ts
git commit -m "feat: apply balanced glass project overview"
```

---

### Task 4: README 功能列表与唯一源码链接

**Files:**
- Modify: `src/components/case-detail.tsx`
- Modify: `src/components/home-page.test.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `ProjectCase.features` from Task 1.
- Removes renderer dependency on: `releaseUrl` and `resumeBuilderUpstream`.
- Keeps: background, goal, userProblems, workflow, media, provenance.

- [ ] **Step 1: Write failing detail tests**

Open a project in `home-page.test.tsx`, then assert:

```ts
const dialog = screen.getByRole("dialog");
expect(within(dialog).getByRole("link", { name: /查看源码/ })).toHaveAttribute("href", project.repositoryUrl);
expect(within(dialog).getAllByRole("link")).toHaveLength(1);
expect(within(dialog).queryByText("下载版本")).not.toBeInTheDocument();
expect(within(dialog).queryByText("查看上游项目")).not.toBeInTheDocument();
expect(within(dialog).getByRole("heading", { name: "已实现功能" })).toBeInTheDocument();
for (const feature of project.features) expect(within(dialog).getByText(feature)).toBeInTheDocument();
```

Also assert the Job Application Helper gallery has exactly two figures with the two approved alt texts.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- src/components/home-page.test.tsx`

Expected: FAIL because extra links remain, the heading is “已实现能力”, and the renderer uses `highlights`.

- [ ] **Step 3: Simplify links and features renderer**

Remove `resumeBuilderUpstream`, `releaseUrl` rendering, and project-name interpolation from the visible link. Render exactly:

```tsx
<a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">
  查看源码<span className="sr-only">（新窗口）</span>
</a>
```

Change the feature section to:

```tsx
<section className="case-features" aria-labelledby={`${project.slug}-features`}>
  <h4 id={`${project.slug}-features`}>已实现功能</h4>
  <ul>{project.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
</section>
```

- [ ] **Step 4: Style the direct list**

Use two text columns at desktop and one column below 768px. Use compact bullets, not cards, pills, badges, progress bars, or borders around every item.

- [ ] **Step 5: Run the focused test and verify GREEN**

Run: `npm test -- src/components/home-page.test.tsx`

Expected: all home page tests pass with one external link in each open project dialog.

- [ ] **Step 6: Commit**

```bash
git add src/components/case-detail.tsx src/components/home-page.test.tsx src/app/globals.css
git commit -m "feat: show verified project capabilities"
```

---

### Task 5: 视口居中的 B1 项目弹窗

**Files:**
- Modify: `src/components/case-dialog.tsx`
- Modify: `src/components/case-dialog.test.tsx`
- Modify: `src/app/globals.css`
- Modify: `tests/browser/compact-portfolio.spec.ts`

**Interfaces:**
- Keeps: `CaseDialogProps` unchanged.
- Keeps: native `<dialog>`, `showModal()`, cancel, backdrop, scroll lock, focus return and URL state.
- Produces: viewport-centered `.case-dialog`; animation stays on `.case-dialog-panel`.

- [ ] **Step 1: Write a failing browser centering test**

For 1440, 1024, and 768 widths, open the first card and measure:

```ts
const viewport = page.viewportSize()!;
const box = await page.locator("dialog.case-dialog").boundingBox();
expect(box).not.toBeNull();
expect(Math.abs((box!.x + box!.width / 2) - viewport.width / 2)).toBeLessThanOrEqual(2);
expect(Math.abs((box!.y + box!.height / 2) - viewport.height / 2)).toBeLessThanOrEqual(2);
```

Keep existing assertions for native tag name, `open` property, focus, history and mobile bounds.

- [ ] **Step 2: Run the centering test and verify RED**

Run: `npm run test:browser:portfolio -- --grep "centers the native dialog"`

Expected: FAIL on the current left-offset geometry.

- [ ] **Step 3: Fix dialog positioning without transform coupling**

Set `.case-dialog` to a viewport-based width and height cap with explicit auto margins:

```css
.case-dialog {
  width: min(calc(100vw - 2rem), 60rem);
  max-height: 86dvh;
  margin: auto;
  padding: 0;
}
```

Ensure no ancestor transform is relied on for centering. Keep `motion.div.case-dialog-panel` as the only animated surface. Do not animate `dialog` itself.

- [ ] **Step 4: Apply B1 modal material**

Use the strongest page glass layer on `.case-dialog-panel`: translucent surface token, inner highlight, tinted shadow and `backdrop-filter`. Add a solid-token fallback under `@supports not (backdrop-filter: blur(1px))`. Keep content contrast AA-compliant.

- [ ] **Step 5: Verify mobile and Reduced Motion behavior**

At 390 and 320 widths, assert the dialog stays inside viewport bounds and `.case-dialog-scroll` can scroll. In Reduced Motion, assert `.case-dialog-panel` computed transform is `none`.

- [ ] **Step 6: Run focused unit and browser tests**

Run:

```bash
npm test -- src/components/case-dialog.test.tsx
npm run test:browser:portfolio -- --grep "dialog|deep link|history|focus"
npm run test:browser:reduced
```

Expected: all focused tests pass; dialog centers within 2px at desktop widths.

- [ ] **Step 7: Commit**

```bash
git add src/components/case-dialog.tsx src/components/case-dialog.test.tsx src/app/globals.css tests/browser/compact-portfolio.spec.ts tests/browser/reduced-motion-css.spec.ts
git commit -m "fix: center and refine project dialog"
```

---

### Task 6: 响应式、深色模式与资源降级浏览器覆盖

**Files:**
- Modify: `tests/browser/compact-portfolio.spec.ts`
- Modify: `tests/browser/reduced-motion-css.spec.ts`
- Modify: `src/app/globals.css`

**Interfaces:**
- Tests the public page contract only; no production-only test switches.
- Reuses existing Playwright web server and `injectProjectFixtures` helper for 5/6-card layout.

- [ ] **Step 1: Add failing responsive history assertions**

At 1440, 1024, and 768px, assert education and internship section boxes share the same top coordinate and do not overlap. At 767, 390, and 320px, assert internship starts below education and document width does not exceed viewport width.

- [ ] **Step 2: Add failing theme and asset-degradation assertions**

Use Playwright `page.emulateMedia({ colorScheme: "dark" })` and assert body, history panel, project cards, text and focus ring have non-transparent readable computed colors. Abort one company Logo request and assert its organization name remains visible and the experience row keeps non-zero height.

- [ ] **Step 3: Run the new tests and verify RED**

Run: `npm run test:browser:portfolio -- --grep "profile history|dark theme|company logo"`

Expected: at least one new contract fails before final responsive and dark adjustments.

- [ ] **Step 4: Make minimal CSS corrections**

Adjust only semantic tokens, grid breakpoints, wrapping, spacing and fallback selectors required by the failures. Do not change approved content or introduce new layout families.

- [ ] **Step 5: Run the full browser suites**

Run:

```bash
npm run test:browser:portfolio
npm run test:browser:reduced
```

Expected: all portfolio and Reduced Motion browser tests pass with no page errors.

- [ ] **Step 6: Commit**

```bash
git add tests/browser/compact-portfolio.spec.ts tests/browser/reduced-motion-css.spec.ts src/app/globals.css
git commit -m "test: cover balanced glass responsive states"
```

---

### Task 7: 最终审查、生产构建与静态预览

**Files:**
- Modify only if verification exposes a scoped defect.

**Interfaces:**
- No new product behavior.
- Produces a clean static export in `out/` and a deployable reviewed branch.

- [ ] **Step 1: Run the complete unit suite**

Run: `npm test`

Expected: all test files and tests pass, with no React, CSS parse or unhandled promise warnings.

- [ ] **Step 2: Run lint and type checking**

Run:

```bash
npm run lint
npm run typecheck
```

Expected: both commands exit 0.

- [ ] **Step 3: Run complete browser verification**

Run:

```bash
npm run test:browser:portfolio
npm run test:browser:reduced
```

Expected: all Chromium tests pass. Verify 320, 390, 768, 1024 and 1440 viewport coverage appears in the output.

- [ ] **Step 4: Run production build and repository checks**

Run:

```bash
npm run build
git diff --check
npm ls motion @playwright/test
npm audit --omit=dev --audit-level=high
```

Expected: Next.js static export succeeds, `out/index.html` exists, diff check is clean, expected dependency versions resolve, and audit reports no high-severity production vulnerability.

- [ ] **Step 5: Perform visual pre-flight**

Check the built page in light and dark system schemes. Confirm:

- no avatar, role or personal slogan;
- official-color Logos are visible and aligned;
- B1 glass appears only on identity/history/dialog layers;
- project cards remain solid enough for screenshot contrast;
- dialog is visually centered;
- no purple glow, gradient text, em dash, decorative status dots or horizontal overflow;
- all visible copy is natural Chinese and link text is exactly “查看源码”.

- [ ] **Step 6: Request whole-branch code review**

Review the complete range from `576748c` to the implementation HEAD against the approved spec. Fix Critical and Important findings, then run one scoped re-review.

- [ ] **Step 7: Commit any verification-only fixes**

If Step 1-6 required code changes, add only the affected files and commit:

```bash
git add src/app/globals.css src/components tests/browser public/companies public/projects/job-application-helper/extension-popup.png
git commit -m "fix: finish balanced glass portfolio refresh"
```

If no files changed, do not create an empty commit.

- [ ] **Step 8: Deploy the static export**

Deploy the absolute `out/` directory with the existing deployment workflow, then run a static visual verification against the deployed URL. Confirm all project images and company Logos return successfully and the browser console is empty.
