# Compact Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有展览式长页改造成可在 30 秒内扫描的紧凑作品集，以 2×2 案例摘要网格和单案例原位展开替代四个完整纵向案例。

**Architecture:** 保留 `portfolioCases` 作为唯一数据源，将现有 `CaseStudy` 拆为服务端友好的 `CaseSummaryCard` 和 `CaseDetail`，由一个小型客户端 `FeaturedCases` 管理当前展开的合法 `slug | null`。Hero 与个人信息区继续使用现有内容组件，但移除大范围 Reveal 和过量垂直间距；CSS Grid 自动支持未来 5-6 个案例。

**Tech Stack:** Next.js 16.2.10、React 19.2.4、TypeScript、Tailwind CSS 4 全局 CSS、Vitest 3.2.4、Testing Library、Next Image、GitHub Pages static export。

## Global Constraints

- 主要受众是 AI 产品经理岗位招聘者，首要任务是 30 秒扫描。
- 采用 B 方案：桌面 2×2 案例摘要网格，未来六个案例自然形成 2×3，不渲染空占位卡。
- 默认不展开任何案例，同时最多展开一个案例；桌面详情横跨两列，移动端紧跟所选卡片。
- 桌面 Hero 高度目标 460-520px，H1 不超过 52px；移动端 H1 34-36px。
- 一级区块间距 64-80px，卡片内边距 20-24px，案例间不再使用 100px 以上常规空白。
- 保留四个案例的背景、目标、核心问题、恰好五步流程、真实图片、GitHub 链接和出处。
- Resume Builder 必须保留 `JOYCEQL/magic-resume` 上游与可验证的个人修改范围。
- 联系区域只能包含 `dongxing.123@bytedance.com` 和 `https://github.com/aurostars`。
- 不新增虚构指标，不修改导航标签、锚点、URL、案例事实或仓库范围。
- 继续使用明亮冷白、银灰、深石墨和单一钴蓝，保持 Geist；无渐变、玻璃拟态、外发光或暗色插入区块。
- 动效强度降至 3，只保留展开、hover、focus 和 active 反馈；支持 `prefers-reduced-motion`。
- 320px 不得出现横向滚动；静态导出和 GitHub Pages 部署必须保持可用。

---

### Task 1: Build accessible progressive-disclosure case components

**Files:**
- Create: `src/components/case-summary-card.tsx`
- Create: `src/components/case-detail.tsx`
- Modify: `src/components/featured-cases.tsx`
- Delete: `src/components/case-study.tsx`
- Modify: `src/components/home-page.test.tsx`

**Interfaces:**
- Consumes: `ProjectCase` from `src/content/portfolio.ts`.
- Produces: `CaseSummaryCard({ project, expanded, onToggle }: CaseSummaryCardProps): JSX.Element`.
- Produces: `CaseDetail({ project }: { project: ProjectCase }): JSX.Element`.
- Produces: `FeaturedCases({ projects }: { projects: ProjectCase[] }): JSX.Element`, a Client Component with `expandedSlug: ProjectCase["slug"] | null`.

- [ ] **Step 1: Replace full-case assumptions with failing disclosure tests**

In `src/components/home-page.test.tsx`, import `userEvent` and replace tests that expect all details on initial render with these behavior contracts:

```tsx
import userEvent from "@testing-library/user-event";

it("renders four compact case summaries in approved order without expanded details", () => {
  render(<Home />);
  const cards = screen.getAllByRole("article", { name: /秋招网申助手|面试复盘助手|智能简历编辑工具|智能会议纪要工具/ });
  expect(cards).toHaveLength(4);
  expect(cards.map((card) => within(card).getByRole("heading", { level: 3 }).textContent)).toEqual([
    "秋招网申助手",
    "面试复盘助手",
    "智能简历编辑工具",
    "智能会议纪要工具",
  ]);
  expect(screen.queryByRole("region", { name: /案例详情/ })).not.toBeInTheDocument();
});

it("opens one accessible case detail at a time and closes it on a second click", async () => {
  const user = userEvent.setup();
  render(<Home />);
  const first = screen.getByRole("button", { name: "展开秋招网申助手详情" });
  const second = screen.getByRole("button", { name: "展开面试复盘助手详情" });

  expect(first).toHaveAttribute("aria-expanded", "false");
  await user.click(first);
  expect(first).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByRole("region", { name: "秋招网申助手案例详情" })).toBeInTheDocument();
  expect(screen.getAllByRole("region", { name: /案例详情/ })).toHaveLength(1);

  await user.click(second);
  expect(first).toHaveAttribute("aria-expanded", "false");
  expect(second).toHaveAttribute("aria-expanded", "true");
  expect(screen.queryByRole("region", { name: "秋招网申助手案例详情" })).not.toBeInTheDocument();
  expect(screen.getByRole("region", { name: "面试复盘助手案例详情" })).toBeInTheDocument();

  await user.click(second);
  expect(screen.queryByRole("region", { name: /案例详情/ })).not.toBeInTheDocument();
});

it("keeps the complete verified case contract inside the expanded detail", async () => {
  const user = userEvent.setup();
  render(<Home />);
  await user.click(screen.getByRole("button", { name: "展开智能简历编辑工具详情" }));
  const detail = within(screen.getByRole("region", { name: "智能简历编辑工具案例详情" }));
  expect(detail.getByRole("heading", { name: "背景与目标" })).toBeInTheDocument();
  expect(detail.getByRole("heading", { name: "核心问题" })).toBeInTheDocument();
  expect(detail.getAllByTestId("workflow-step")).toHaveLength(5);
  expect(detail.getAllByRole("img").length).toBeGreaterThan(0);
  expect(detail.getByRole("link", { name: "查看智能简历编辑工具源码" })).toHaveAttribute("target", "_blank");
  expect(detail.getByText(/JOYCEQL\/magic-resume/)).toBeInTheDocument();
  expect(detail.getByText(/个人修改范围/)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npm test -- src/components/home-page.test.tsx
```

Expected: FAIL because disclosure buttons and named case-detail regions do not exist and all details are rendered by default.

- [ ] **Step 3: Create the summary card**

Create `src/components/case-summary-card.tsx`:

```tsx
import Image from "next/image";
import type { ProjectCase } from "@/content/portfolio";

export interface CaseSummaryCardProps {
  project: ProjectCase;
  expanded: boolean;
  onToggle: () => void;
}

export function CaseSummaryCard({ project, expanded, onToggle }: CaseSummaryCardProps) {
  const cover = project.media.find((media) => !media.src.endsWith("icon.png")) ?? project.media[0];
  return (
    <article className={`case-card${expanded ? " is-expanded" : ""}`} aria-labelledby={`${project.slug}-title`}>
      <figure className="case-card-media">
        <Image src={cover.src} alt={cover.alt} width={cover.width} height={cover.height} sizes="(max-width: 767px) calc(100vw - 2rem), 40rem" />
      </figure>
      <div className="case-card-body">
        <p className="case-descriptor">{project.descriptor}</p>
        <h3 id={`${project.slug}-title`}>{project.title}</h3>
        <p className="case-card-summary">{project.summary}</p>
        <ul className="case-card-keywords" aria-label={`${project.title}能力关键词`}>
          {project.highlights.slice(0, 3).map((item) => <li key={item}>{item}</li>)}
        </ul>
        <div className="case-card-actions">
          <button type="button" aria-expanded={expanded} aria-controls={`${project.slug}-detail`} onClick={onToggle}>
            {expanded ? "收起详情" : "展开详情"}
            <span className="sr-only">：{project.title}</span>
          </button>
          <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">查看源码</a>
        </div>
      </div>
    </article>
  );
}
```

Ensure the visible or accessible button name exactly resolves to `展开{title}详情` / `收起{title}详情`; use an `aria-label` if the punctuation from the sample prevents exact naming.

- [ ] **Step 4: Move verified full content into CaseDetail**

Create `src/components/case-detail.tsx` by moving gallery, background/goal, user problems, workflow, highlights and provenance from `CaseStudy`. The root must be:

```tsx
<section
  className="case-detail"
  id={`${project.slug}-detail`}
  role="region"
  aria-label={`${project.title}案例详情`}
>
```

Use `data-testid="workflow-step"` on each of the exactly five workflow items. Keep all images as `next/image` with real `width`, `height`, `alt`, and responsive `sizes`. Keep repository, optional release, and Resume Builder upstream links in a `.case-detail-links` block at the top.

- [ ] **Step 5: Implement one-open-at-a-time state and row-aware detail placement**

Make `src/components/featured-cases.tsx` a Client Component:

```tsx
"use client";

import { useState } from "react";
import type { ProjectCase } from "@/content/portfolio";
import { CaseDetail } from "./case-detail";
import { CaseSummaryCard } from "./case-summary-card";

export function FeaturedCases({ projects }: { projects: ProjectCase[] }) {
  const [expandedSlug, setExpandedSlug] = useState<ProjectCase["slug"] | null>(null);
  const expanded = projects.find((project) => project.slug === expandedSlug) ?? null;

  return (
    <section className="cases-section site-container" id="cases" aria-labelledby="cases-title">
      <header className="section-heading compact-heading">
        <h2 id="cases-title">代表案例</h2>
        <p>先快速浏览项目，再展开查看完整判断与工作流程。</p>
      </header>
      <div className="case-grid">
        {projects.map((project) => (
          <CaseSummaryCard
            key={project.slug}
            project={project}
            expanded={expandedSlug === project.slug}
            onToggle={() => setExpandedSlug((current) => current === project.slug ? null : project.slug)}
          />
        ))}
        {expanded ? <CaseDetail project={expanded} /> : null}
      </div>
    </section>
  );
}
```

Use CSS ordering/placement or render grouping by rows so the detail appears after the selected desktop row and directly after the selected card on mobile; do not reorder the four summary cards semantically.

- [ ] **Step 6: Run tests and commit**

Run:

```bash
npm test -- src/components/home-page.test.tsx
npm run typecheck
npx eslint src/components/featured-cases.tsx src/components/case-summary-card.tsx src/components/case-detail.tsx src/components/home-page.test.tsx
```

Expected: PASS.

Commit:

```bash
git add src/components/featured-cases.tsx src/components/case-summary-card.tsx src/components/case-detail.tsx src/components/case-study.tsx src/components/home-page.test.tsx
git commit -m "feat: add compact expandable case grid"
```

---

### Task 2: Compact the Hero and remove page-wide reveal dependency

**Files:**
- Modify: `src/components/hero.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/home-page.test.tsx`
- Delete: `src/components/reveal.tsx`
- Delete: `src/components/reveal.test.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `Hero({ cases }: { cases: ProjectCase[] })` unchanged.
- Produces: static server-rendered Hero without `Reveal` wrappers.
- Produces: page sections visible immediately without scroll-triggered state.

- [ ] **Step 1: Add a failing no-scroll-reveal contract**

Append:

```tsx
it("renders the primary page content immediately without scroll reveal wrappers", () => {
  const { container } = render(<Home />);
  expect(container.querySelector(".reveal")).not.toBeInTheDocument();
  expect(screen.getByRole("heading", { level: 1 })).toBeVisible();
  expect(screen.getByRole("region", { name: /代表案例/ })).toBeVisible();
});
```

- [ ] **Step 2: Verify RED**

Run `npm test -- src/components/home-page.test.tsx`.

Expected: FAIL because Hero still renders `.reveal` wrappers.

- [ ] **Step 3: Remove Reveal from static sections**

In `hero.tsx`, replace both `Reveal` wrappers with semantic `<div className="hero-copy">` and `<div className="hero-collage" role="group" ...>`. Ensure no other primary page component imports `Reveal`; then delete `reveal.tsx` and its tests.

- [ ] **Step 4: Apply the compact Hero CSS**

Replace full-viewport rules with:

```css
.hero {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(24rem, 1.05fr);
  align-items: center;
  gap: clamp(2rem, 5vw, 4.5rem);
  min-height: 0;
  padding-block: clamp(3.5rem, 6vw, 5rem);
}

.hero h1 {
  max-width: 13ch;
  font-size: clamp(2.75rem, 4vw, 3.25rem);
  line-height: 1;
}

.hero-summary { margin-top: 1rem; font-size: 1rem; line-height: 1.6; }
.primary-action { margin-top: 1.5rem; }
.hero-collage { max-height: 25rem; }
```

At `max-width: 767px`, set H1 to `clamp(2.125rem, 10vw, 2.25rem)`, Hero padding to `2.5rem 0 3.5rem`, gap to `2rem`, and keep a strict single column.

- [ ] **Step 5: Verify and commit**

Run:

```bash
npm test
npm run lint
npm run typecheck
```

Expected: 0 failures and no remaining `Reveal` import or `.reveal` selector.

Commit:

```bash
git add src/components/hero.tsx src/app/page.tsx src/components/home-page.test.tsx src/components/reveal.tsx src/components/reveal.test.tsx src/app/globals.css
git commit -m "refactor: compact the portfolio entry experience"
```

---

### Task 3: Implement dense case, profile, and responsive layout styles

**Files:**
- Modify: `src/app/globals.css`
- Create: `src/components/profile-index.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/home-page.test.tsx`
- Reuse: `src/components/experience-index.tsx`
- Reuse: `src/components/education-skills.tsx`
- Reuse: `src/components/contact.tsx`

**Interfaces:**
- Produces: `ProfileIndex(props: { experiences; education; capabilities; contact }): JSX.Element`.
- Consumes existing `ExperienceItem`, education/capability arrays, and contact object inferred from `src/content/portfolio.ts` exports.

- [ ] **Step 1: Add failing composition and extensibility tests**

Add tests that assert the profile information is grouped and the grid has no placeholder cells:

```tsx
it("groups experience, education, capabilities, and approved contact in one profile region", () => {
  render(<Home />);
  const profile = screen.getByRole("region", { name: "经历与能力" });
  expect(within(profile).getAllByTestId("experience-row")).toHaveLength(5);
  expect(within(profile).getByText("北京师范大学 理论经济学硕士")).toBeInTheDocument();
  expect(within(profile).getByText("AI 产品设计")).toBeInTheDocument();
  expect(within(profile).getAllByRole("link")).toHaveLength(2);
  expect(profile.textContent).not.toMatch(/电话|微信|微博|LinkedIn/);
});

it("renders exactly one case card per project and no future placeholders", () => {
  const { container } = render(<Home />);
  expect(container.querySelectorAll(".case-card")).toHaveLength(4);
  expect(screen.queryByText(/未来案例|待添加/)).not.toBeInTheDocument();
});
```

Add `data-testid="experience-row"` to the existing row element if the current component only exposes `data-experience-row`.

- [ ] **Step 2: Verify RED**

Run `npm test -- src/components/home-page.test.tsx`.

Expected: FAIL because no combined `经历与能力` region exists.

- [ ] **Step 3: Create ProfileIndex and update page composition**

Create `profile-index.tsx` as one outer section:

```tsx
<section className="profile-section site-container" aria-labelledby="profile-title">
  <header className="profile-heading"><h2 id="profile-title">经历与能力</h2></header>
  <div className="profile-grid">
    <ExperienceIndex items={experiences} />
    <div className="profile-side">
      <EducationSkills education={education} capabilities={capabilities} />
      <Contact email={contact.email} github={contact.github} />
    </div>
  </div>
</section>
```

Avoid nested duplicate section headings by adding a compact/embedded prop to the reused components or refactoring their outer wrappers while keeping their accessible labels and `#experience` / `#contact` targets.

Update `page.tsx` to render `Hero`, `FeaturedCases`, then `ProfileIndex` only.

- [ ] **Step 4: Replace long-form case CSS with compact grid/detail CSS**

Delete obsolete `.case-list`, `.case-study`, `.case-layout-*`, `.case-intro`, and old gallery placement rules. Add:

```css
.cases-section { padding-block: clamp(4rem, 6vw, 5rem); }
.compact-heading { margin-bottom: 2rem; }
.section-heading h2, .profile-heading h2 { font-size: clamp(2rem, 3vw, 2.125rem); }
.case-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.25rem; align-items: start; }
.case-card { overflow: hidden; border: 1px solid var(--color-border); border-radius: 1rem; background: var(--color-surface); }
.case-card-media { aspect-ratio: 16 / 9; margin: 0; overflow: hidden; background: var(--color-surface-muted); }
.case-card-media img { width: 100%; height: 100%; object-fit: cover; }
.case-card-body { padding: 1.375rem; }
.case-card h3 { margin: 0; font-size: clamp(1.25rem, 2vw, 1.375rem); }
.case-card-keywords { display: flex; flex-wrap: wrap; gap: .5rem 1rem; margin: 1rem 0 0; padding: 0; list-style: none; }
.case-detail { grid-column: 1 / -1; display: grid; gap: 2rem; padding: clamp(1.5rem, 3vw, 2.5rem); border: 1px solid var(--color-border); border-radius: 1rem; background: var(--color-surface); }
.case-detail-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.5rem; }
.case-detail .workflow { grid-template-columns: repeat(5, minmax(0, 1fr)); }
.profile-section { padding-block: clamp(4rem, 6vw, 5rem); border-top: 1px solid var(--color-border); }
.profile-grid { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(20rem, .65fr); gap: clamp(2rem, 5vw, 5rem); margin-top: 2rem; }
.profile-side { display: grid; align-content: start; gap: 2rem; }
```

At `max-width: 767px`, switch `.case-grid`, `.case-detail-grid`, `.workflow`, `.profile-grid` to one column; ensure each detail follows its selected card and set section padding to `3.5rem 1rem`.

Implement row-aware detail placement without visually or semantically moving summary cards incorrectly. With two columns, group projects into row fragments and render the detail after the selected row; with one column, CSS/order must place it directly after the selected card.

- [ ] **Step 5: Verify responsive contracts and commit**

Run:

```bash
npm test
npm run lint
npm run typecheck
npm run build
git diff --check
```

Expected: all commands exit 0.

Commit:

```bash
git add src/app/page.tsx src/app/globals.css src/components/profile-index.tsx src/components/experience-index.tsx src/components/education-skills.tsx src/components/contact.tsx src/components/home-page.test.tsx
git commit -m "style: increase portfolio information density"
```

---

### Task 4: Measure page reduction and complete production verification

**Files:**
- Modify: `.github/workflows/deploy.yml` only if verification reveals a missing existing quality gate.
- Create: `.superpowers/sdd/2026-09-11-portfolio-density-redesign/final-report.md` (local ignored report; do not commit if `.superpowers` is ignored).

**Interfaces:**
- Produces: verified static export in `out/`.
- Produces: a deployable preview URL after implementation approval.

- [ ] **Step 1: Capture baseline and new default page heights**

Use the existing deployed baseline `https://47ad8bf791ca.aime-site.bytedance.net` and the local production export at the same 1440×900 viewport. Record `document.documentElement.scrollHeight` for both. The new collapsed page must satisfy:

```text
newHeight <= baselineHeight * 0.5
```

If it does not, reduce section padding, card media height, or profile spacing without deleting required content.

- [ ] **Step 2: Run the complete quality gate**

Run:

```bash
npm ci
npm test
npm run lint
npm run typecheck
npm run build
git diff --check
```

Expected: 0 failures; `out/index.html` and all referenced project images exist.

- [ ] **Step 3: Verify browsers and accessibility**

Serve `out/` and inspect 1440, 1024, 768, 390, and 320px widths. Verify:

- H1 computed font size ≤ 52px desktop and ≤ 36px mobile.
- CTA is visible in the initial viewport.
- No horizontal overflow at 320px.
- Four summary cards appear in approved order.
- Only one detail can be open.
- Keyboard Enter/Space opens and closes details.
- Focus outline remains visible.
- `prefers-reduced-motion` removes the expand transition.
- All images load and console has no runtime errors.
- Contact contains only the approved email and GitHub.

- [ ] **Step 4: Commit final verification fixes**

If browser verification required code changes, add a regression test first, then commit:

```bash
git add src .github/workflows/deploy.yml
git commit -m "fix: finish compact portfolio verification"
```

If no code changes were needed, do not create an empty commit.

- [ ] **Step 5: Deploy preview after the implementation branch is complete**

Deploy the committed `out/` directory using the deployment tool, then run static visual verification against the returned URL. Report the preview URL, measured height reduction, test count, and any non-blocking limitations. Do not push or create a PR unless the user explicitly requests it.
