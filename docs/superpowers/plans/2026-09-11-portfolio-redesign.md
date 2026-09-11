# Personal Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `aurostars.github.io` as a bright, premium, recruiter-focused AI product manager portfolio centered on four verifiable personal project case studies.

**Architecture:** Keep the existing Next.js App Router static-export architecture. Move portfolio content into a typed data module, render it through focused server components, and isolate the small reveal interaction in one client component. Store only real project media in `public/projects`, validate the media registry in tests, and keep the page deployable through the existing GitHub Pages workflow.

**Tech Stack:** Next.js 16.2.10, React 19.2.4, TypeScript, Tailwind CSS 4, Vitest, Testing Library, Next Image, GitHub Pages static export

## Global Constraints

- Preserve `output: "export"` and `images: { unoptimized: true }` in `next.config.ts`.
- Keep GitHub Pages deployment on Node 20 with `npm ci` and `npm run build`.
- Use the Product Storyboard direction with `DESIGN_VARIANCE: 7`, `MOTION_INTENSITY: 6`, and `VISUAL_DENSITY: 4`.
- Use one bright theme across the entire page: cool white background, silver-gray surfaces, graphite text, and cobalt blue as the only accent.
- Do not use personal photography, stock photography, dark sections, AI-purple gradients, glassmorphism, glow effects, equal three-column feature cards, fake screenshots, or invented metrics.
- Feature exactly four cases in this order: Job Application Helper, Interview Review Assistant, Resume Builder and Editor, Meeting Minutes Extractor.
- Exclude `vedio-for-jiji` and `aurostars.github.io` from the case list.
- Every case must include background, goal, user problem, five-step workflow, real product media, and a clickable repository or release link.
- If a repository is a fork, state the upstream source and personal modifications rather than claiming the upstream product as original work.
- Render each internship as one row only.
- The contact section contains only `dongxing.123@bytedance.com` and `https://github.com/aurostars`.
- Use `min-height: 100dvh`, never `height: 100vh`.
- All motion must animate only `transform` and `opacity`, use IntersectionObserver instead of scroll listeners, clean up timers and observers, and respect `prefers-reduced-motion`.
- Keep every new component below 300 lines and give each file one responsibility.
- Use zero em-dash or en-dash characters in visible page copy.
- Do not add a backend, database, CMS, blog, contact form, authentication, or internship detail page.

---

## File Structure

### Files to create

- `vitest.config.ts` - Vitest configuration for the Next.js TypeScript project.
- `src/test/setup.ts` - Testing Library matchers and Next Image test shim.
- `src/content/portfolio.ts` - Typed portfolio, case study, experience, education, and contact content.
- `src/content/portfolio.test.ts` - Content order, exclusions, URL, workflow, and media contract tests.
- `src/components/site-header.tsx` - Single-line desktop navigation and mobile-safe navigation.
- `src/components/hero.tsx` - Asymmetric hero and real-project visual collage.
- `src/components/case-study.tsx` - Reusable case study article with alternating editorial compositions.
- `src/components/featured-cases.tsx` - Ordered case study section orchestration.
- `src/components/experience-index.tsx` - One-row-per-internship index.
- `src/components/education-skills.tsx` - Compact education and core capability section.
- `src/components/contact.tsx` - Email and GitHub only.
- `src/components/reveal.tsx` - Reduced-motion-aware IntersectionObserver reveal wrapper.
- `src/components/home-page.test.tsx` - Homepage content, landmarks, link, and exclusion tests.
- `src/components/reveal.test.tsx` - Reveal behavior and cleanup tests.
- `public/projects/job-application-helper/icon.png` - Real extension icon copied from the project repository.
- `public/projects/job-application-helper/profile-manager.png` - Real captured profile manager screen.
- `public/projects/job-application-helper/visual-fill.png` - Real captured visual fill flow.
- `public/projects/job-application-helper/application-records.png` - Real captured application records screen.
- `public/projects/interview-review/upload.png` - Real captured interview upload screen.
- `public/projects/interview-review/analysis.png` - Real captured per-question analysis screen.
- `public/projects/interview-review/patterns.png` - Real captured cross-interview patterns screen.
- `public/projects/resume-builder/workspace.png` - Real editor screenshot copied from `public/web-shot.png`.
- `public/projects/resume-builder/modern-template.png` - Real template screenshot copied from the repository.
- `public/projects/resume-builder/polish.png` - Real AI polish screenshot copied from the repository.
- `public/projects/meeting-minutes/input.png` - Real captured transcript input screen.
- `public/projects/meeting-minutes/pipeline.png` - Real captured pipeline progress screen.
- `public/projects/meeting-minutes/review.png` - Real captured confidence review screen.
- `public/og-portfolio.png` - Social sharing image captured from the final real homepage.

### Files to modify

- `package.json` - Add test and type-check scripts plus Vitest and Testing Library dependencies.
- `package-lock.json` - Lock new development dependencies.
- `src/app/layout.tsx` - Replace dark shell with metadata, skip link, bright navigation, and minimal footer.
- `src/app/page.tsx` - Replace monolithic 308-line page with section composition.
- `src/app/globals.css` - Replace dark glass tokens and animation classes with the Product Storyboard system.
- `.github/workflows/deploy.yml` - Run tests, lint, and type checks before the existing static build.

### Files to delete

- `src/components/animate.tsx` - Replaced by the tested `Reveal` component.

---

### Task 1: Establish the test harness and typed portfolio content

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/content/portfolio.ts`
- Create: `src/content/portfolio.test.ts`

**Interfaces:**
- Produces: `ProjectCase`, `ProjectMedia`, `ExperienceItem`, `portfolioCases`, `experiences`, `education`, `capabilities`, and `contact`.
- `ProjectCase.slug` is one of `job-application-helper`, `interview-review`, `resume-builder`, `meeting-minutes`.
- `ProjectCase.workflow` contains exactly five strings.
- `ProjectCase.media` contains one or more `ProjectMedia` records with absolute public paths.

- [ ] **Step 1: Install the smallest testing stack and add scripts**

Run:

```bash
npm install --save-dev vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Set the scripts in `package.json` to:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 2: Configure Vitest and the DOM test environment**

Create `vitest.config.ts`:

```ts
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: true,
  },
});
```

Create `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) =>
    React.createElement("img", { alt, ...props }),
}));
```

- [ ] **Step 3: Write the failing portfolio contract tests**

Create `src/content/portfolio.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { contact, experiences, portfolioCases } from "./portfolio";

const expectedSlugs = [
  "job-application-helper",
  "interview-review",
  "resume-builder",
  "meeting-minutes",
];

describe("portfolio content", () => {
  it("keeps the approved case order and exclusions", () => {
    expect(portfolioCases.map((item) => item.slug)).toEqual(expectedSlugs);
    expect(portfolioCases.map((item) => item.slug)).not.toContain("vedio-for-jiji");
    expect(portfolioCases.map((item) => item.slug)).not.toContain("aurostars.github.io");
  });

  it("gives every case a complete five-step workflow and real links", () => {
    for (const item of portfolioCases) {
      expect(item.background.length).toBeGreaterThan(20);
      expect(item.goal.length).toBeGreaterThan(10);
      expect(item.workflow).toHaveLength(5);
      expect(item.repositoryUrl).toMatch(/^https:\/\/github\.com\/aurostars\//);
      expect(item.media.length).toBeGreaterThan(0);
      expect(item.media.every((media) => media.src.startsWith("/projects/"))).toBe(true);
    }
  });

  it("keeps internships concise and contact limited to email and GitHub", () => {
    expect(experiences).toHaveLength(5);
    expect(experiences.every((item) => item.highlight.length <= 48)).toBe(true);
    expect(Object.keys(contact).sort()).toEqual(["email", "github"]);
    expect(contact.email).toBe("dongxing.123@bytedance.com");
    expect(contact.github).toBe("https://github.com/aurostars");
  });
});
```

- [ ] **Step 4: Run the test and verify the red state**

Run:

```bash
npm test -- src/content/portfolio.test.ts
```

Expected: FAIL because `src/content/portfolio.ts` does not exist.

- [ ] **Step 5: Implement the typed content module**

Create `src/content/portfolio.ts` with these exact public interfaces:

```ts
export type ProjectSlug =
  | "job-application-helper"
  | "interview-review"
  | "resume-builder"
  | "meeting-minutes";

export interface ProjectMedia {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface ProjectCase {
  slug: ProjectSlug;
  title: string;
  descriptor: string;
  summary: string;
  background: string;
  goal: string;
  userProblems: string[];
  workflow: [string, string, string, string, string];
  highlights: string[];
  repositoryUrl: string;
  releaseUrl?: string;
  media: ProjectMedia[];
  provenance: string;
}

export interface ExperienceItem {
  period: string;
  organization: string;
  role: string;
  highlight: string;
}

export const portfolioCases: ProjectCase[] = [
  {
    slug: "job-application-helper",
    title: "秋招网申助手",
    descriptor: "浏览器扩展",
    summary: "把重复网申变成可核对、可追踪的智能填充流程。",
    background: "求职者需要在不同招聘网站重复填写相同资料，还要维护多份简历和分散的投递记录。",
    goal: "用浏览器扩展统一资料管理、字段识别、人工核对和投递追踪。",
    userProblems: ["重复填写耗时", "多简历切换困难", "复杂字段难识别", "投递记录分散"],
    workflow: ["导入简历", "识别表单", "匹配字段", "人工核对", "记录并同步"],
    highlights: ["视觉与文本联合匹配", "多简历资料管理", "WebDAV 冲突防护", "投递记录追踪"],
    repositoryUrl: "https://github.com/aurostars/Job-Application-Helper",
    releaseUrl: "https://github.com/aurostars/Job-Application-Helper/releases",
    media: [
      { src: "/projects/job-application-helper/profile-manager.png", alt: "秋招网申助手的多简历资料管理界面", width: 1440, height: 900 },
      { src: "/projects/job-application-helper/visual-fill.png", alt: "秋招网申助手的视觉框选填充流程", width: 1440, height: 900 },
      { src: "/projects/job-application-helper/application-records.png", alt: "秋招网申助手的投递记录界面", width: 1440, height: 900 },
    ],
    provenance: "独立开发项目，页面只展示仓库和真实运行结果可验证的功能。",
  },
  {
    slug: "interview-review",
    title: "面试复盘助手",
    descriptor: "AI Web 应用",
    summary: "把面试录音转化为逐题诊断和跨面试改进线索。",
    background: "求职者在面试后容易遗忘问答细节，缺少客观评价，也难以发现多场面试中的共性问题。",
    goal: "将录音或转写文本整理为可追溯、可比较的结构化复盘。",
    userProblems: ["细节快速遗忘", "评价依赖主观感受", "改进路径不清晰", "缺少纵向对比"],
    workflow: ["配置服务", "上传录音", "提取问答", "逐题诊断", "汇总规律"],
    highlights: ["录音与文本输入", "问答链路提取", "逐题改进建议", "跨面试规律分析"],
    repositoryUrl: "https://github.com/aurostars/Interview-Review-Assistant",
    media: [
      { src: "/projects/interview-review/upload.png", alt: "面试复盘助手的录音上传界面", width: 1440, height: 900 },
      { src: "/projects/interview-review/analysis.png", alt: "面试复盘助手的逐题分析界面", width: 1440, height: 900 },
      { src: "/projects/interview-review/patterns.png", alt: "面试复盘助手的跨面试规律分析界面", width: 1440, height: 900 },
    ],
    provenance: "独立开发项目，效果描述不包含未经真实测试验证的准确率或提升比例。",
  },
  {
    slug: "resume-builder",
    title: "智能简历编辑工具",
    descriptor: "二次开发项目",
    summary: "围绕写作、岗位对齐、模板排版和多格式导出优化简历工作流。",
    background: "简历修改同时涉及内容表达、岗位匹配、版式维护和隐私保护，传统工具很难兼顾。",
    goal: "在本地优先的数据策略下，为求职者提供 AI 写作与高保真排版工具。",
    userProblems: ["经历表达困难", "简历与 JD 脱节", "格式维护繁琐", "个人数据敏感"],
    workflow: ["配置模型", "创建或导入", "AI 增强", "模板预览", "多格式导出"],
    highlights: ["STAR 改写", "JD 对齐", "多套模板", "本地数据存储"],
    repositoryUrl: "https://github.com/aurostars/Resume-Builder-and-Editor",
    media: [
      { src: "/projects/resume-builder/workspace.png", alt: "智能简历编辑工具的编辑工作台", width: 1440, height: 900 },
      { src: "/projects/resume-builder/modern-template.png", alt: "智能简历编辑工具的现代模板", width: 900, height: 1273 },
      { src: "/projects/resume-builder/polish.png", alt: "智能简历编辑工具的 AI 润色功能", width: 1440, height: 900 },
    ],
    provenance: "基于 JOYCEQL/magic-resume 开源项目进行二次开发，页面必须标注上游仓库，并只归因于当前仓库能够验证的个人修改。",
  },
  {
    slug: "meeting-minutes",
    title: "智能会议纪要工具",
    descriptor: "LLM 工作流",
    summary: "用六阶段流程把会议转写整理为可复核的结构化纪要。",
    background: "原始会议转写冗长且缺少结构，人工整理参会人、决策和待办容易遗漏。",
    goal: "通过分阶段提取和置信度复核，形成可编辑、可导出的会议纪要。",
    userProblems: ["转写缺少结构", "决策容易遗漏", "待办归属不清", "生成结果难复核"],
    workflow: ["输入转写", "识别说话人", "执行六阶段流程", "置信度复核", "导出纪要"],
    highlights: ["六阶段 Pipeline", "置信度标注", "说话人管理", "多格式导出"],
    repositoryUrl: "https://github.com/aurostars/meeting-minutes-extractor",
    media: [
      { src: "/projects/meeting-minutes/input.png", alt: "智能会议纪要工具的转写输入界面", width: 1440, height: 900 },
      { src: "/projects/meeting-minutes/pipeline.png", alt: "智能会议纪要工具的处理流程界面", width: 1440, height: 900 },
      { src: "/projects/meeting-minutes/review.png", alt: "智能会议纪要工具的置信度复核界面", width: 1440, height: 900 },
    ],
    provenance: "独立开发项目，页面只描述仓库中可验证的流程与功能。",
  },
];

export const experiences: ExperienceItem[] = [
  { period: "2026.03-2026.07", organization: "科大讯飞", role: "AI 产品经理", highlight: "多模态心脏超声智能报告系统" },
  { period: "2025.09-2026.02", organization: "美团快驴", role: "产品运营", highlight: "AI 工具驱动业务流程提效" },
  { period: "2025.04-2025.09", organization: "国务院发展研究中心", role: "产品经理", highlight: "研究与数据产品实践" },
  { period: "2024.07-2024.10", organization: "BOSS 直聘", role: "行业研究", highlight: "招聘市场与行业研究" },
  { period: "2024.01-2024.04", organization: "太平洋证券", role: "行业研究", highlight: "行业数据分析与研究支持" },
];

export const education = [
  "北京师范大学 理论经济学硕士",
  "中国人民大学 应用经济学学士",
];

export const capabilities = ["AI 产品设计", "数据分析", "用户研究", "模型评测", "项目管理"];

export const contact = {
  email: "dongxing.123@bytedance.com",
  github: "https://github.com/aurostars",
} as const;
```

Before accepting the experience dates and one-line highlights, compare them with the current `src/app/page.tsx`. If a date or statement differs, keep the repository value and update the test fixture in the same red-green cycle.

- [ ] **Step 6: Run the content test and verify green**

Run:

```bash
npm test -- src/content/portfolio.test.ts
```

Expected: PASS with 3 tests.

- [ ] **Step 7: Commit the test foundation and content contract**

```bash
git add package.json package-lock.json vitest.config.ts src/test/setup.ts src/content/portfolio.ts src/content/portfolio.test.ts
git commit -m "test: define portfolio content contract"
```

---

### Task 2: Collect and validate only real project media

**Files:**
- Create: `public/projects/job-application-helper/icon.png`
- Create: `public/projects/job-application-helper/profile-manager.png`
- Create: `public/projects/job-application-helper/visual-fill.png`
- Create: `public/projects/job-application-helper/application-records.png`
- Create: `public/projects/interview-review/upload.png`
- Create: `public/projects/interview-review/analysis.png`
- Create: `public/projects/interview-review/patterns.png`
- Create: `public/projects/resume-builder/workspace.png`
- Create: `public/projects/resume-builder/modern-template.png`
- Create: `public/projects/resume-builder/polish.png`
- Create: `public/projects/meeting-minutes/input.png`
- Create: `public/projects/meeting-minutes/pipeline.png`
- Create: `public/projects/meeting-minutes/review.png`
- Modify: `src/content/portfolio.test.ts`

**Interfaces:**
- Consumes: `portfolioCases: ProjectCase[]`.
- Produces: every `ProjectMedia.src` resolves to a real file under `public/projects`.

- [ ] **Step 1: Write the failing media existence test**

Append to `src/content/portfolio.test.ts`:

```ts
import fs from "node:fs";
import path from "node:path";

it("points every media record at a committed real file", () => {
  for (const item of portfolioCases) {
    for (const media of item.media) {
      const publicPath = path.join(process.cwd(), "public", media.src.replace(/^\//, ""));
      expect(fs.existsSync(publicPath), `${item.slug}: ${media.src}`).toBe(true);
      expect(fs.statSync(publicPath).size).toBeGreaterThan(1024);
    }
  }
});
```

- [ ] **Step 2: Run the test and verify it fails on missing media**

Run:

```bash
npm test -- src/content/portfolio.test.ts
```

Expected: FAIL on `/projects/job-application-helper/profile-manager.png`.

- [ ] **Step 3: Copy repository-owned assets into stable portfolio paths**

Copy these source files without modifying the source repositories:

```text
case-job-application-helper/public/icons/icon128.png
  -> public/projects/job-application-helper/icon.png

case-resume-builder/public/web-shot.png
  -> public/projects/resume-builder/workspace.png

case-resume-builder/public/template-snapshots/zh/modern.png
  -> public/projects/resume-builder/modern-template.png

case-resume-builder/public/features/polish.png
  -> public/projects/resume-builder/polish.png
```

- [ ] **Step 4: Capture the three Job Application Helper screens from the real extension UI**

Run the source project:

```bash
cd ../../../../case-job-application-helper
npm install
npm run dev
```

Use the AIME browser capability to open the options, visual fill, and application records pages rendered by the real code. Save screenshots at 1440x900 to the exact target paths listed in this task. Do not reconstruct these screens in the portfolio.

- [ ] **Step 5: Capture the three Interview Review Assistant screens from the real application**

Run:

```bash
cd ../../../../case-interview-review
python3 server.py
```

Use the AIME browser capability to capture the upload, per-question analysis, and cross-interview patterns screens. Use sample or empty-state data already supported by the application. Do not enter private interview data or invent performance metrics.

- [ ] **Step 6: Capture the three Meeting Minutes screens from the real application**

Run:

```bash
cd ../../../../case-meeting-minutes
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn backend.main:app --host 0.0.0.0 --port 8010
```

Use `demo_data/simple_meeting.txt` as the visible demo input. Capture input, pipeline, and confidence review screens without adding invented business results.

- [ ] **Step 7: Verify the media contract is green**

Run:

```bash
npm test -- src/content/portfolio.test.ts
```

Expected: PASS with all media files present and larger than 1KB.

- [ ] **Step 8: Commit verified media separately**

```bash
git add public/projects src/content/portfolio.test.ts
git commit -m "assets: add verified project media"
```

---

### Task 3: Build the bright global shell, navigation, and metadata

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Create: `src/components/site-header.tsx`
- Create: `src/components/home-page.test.tsx`

**Interfaces:**
- Produces: `SiteHeader(): JSX.Element`.
- Produces: page landmarks `header`, `main#main-content`, and `footer`.
- Produces: navigation anchors `#cases`, `#experience`, and `#contact`.

- [ ] **Step 1: Write failing shell and navigation tests**

Create `src/components/home-page.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RootLayout, { metadata } from "@/app/layout";

function renderLayout() {
  return render(
    <RootLayout>
      <div id="content-probe">content</div>
    </RootLayout>,
  );
}

describe("site shell", () => {
  it("describes the portfolio for AI product manager recruiting", () => {
    expect(metadata.title).toBe("董星 | AI 产品经理与独立开发者");
    expect(metadata.description).toContain("个人项目案例");
  });

  it("provides a skip link and approved navigation", () => {
    renderLayout();
    expect(screen.getByRole("link", { name: "跳到主要内容" })).toHaveAttribute("href", "#main-content");
    expect(screen.getByRole("link", { name: "案例" })).toHaveAttribute("href", "#cases");
    expect(screen.getByRole("link", { name: "经历" })).toHaveAttribute("href", "#experience");
    expect(screen.getByRole("link", { name: "联系" })).toHaveAttribute("href", "#contact");
  });
});
```

- [ ] **Step 2: Run the shell test and verify red**

Run:

```bash
npm test -- src/components/home-page.test.tsx
```

Expected: FAIL because the metadata and anchor IDs still use the old site structure.

- [ ] **Step 3: Implement `SiteHeader`**

Create `src/components/site-header.tsx`:

```tsx
const links = [
  { href: "#cases", label: "案例" },
  { href: "#experience", label: "经历" },
  { href: "#contact", label: "联系" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <nav className="site-container site-nav" aria-label="主要导航">
        <a className="site-wordmark" href="#main-content">董星</a>
        <ul className="site-nav-links">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
```

- [ ] **Step 4: Replace the root shell and metadata**

Update `src/app/layout.tsx` to keep `Geist`, import `SiteHeader`, and use this structure:

```tsx
<html lang="zh-CN" className={`${geistSans.variable} antialiased`}>
  <body>
    <a className="skip-link" href="#main-content">跳到主要内容</a>
    <SiteHeader />
    <main id="main-content">{children}</main>
    <footer className="site-footer">
      <div className="site-container footer-inner">
        <p>© 2026 董星</p>
      </div>
    </footer>
  </body>
</html>
```

Set metadata to:

```ts
export const metadata: Metadata = {
  metadataBase: new URL("https://aurostars.github.io"),
  title: "董星 | AI 产品经理与独立开发者",
  description: "董星的 AI 产品经理个人主页，展示网申助手、面试复盘、智能简历和会议纪要等个人项目案例。",
  openGraph: {
    title: "董星 | AI 产品经理与独立开发者",
    description: "从问题定义到结果验证，查看董星的 AI 产品案例。",
    url: "https://aurostars.github.io",
    siteName: "董星的个人主页",
    locale: "zh_CN",
    type: "website",
    images: [{ url: "/og-portfolio.png", width: 1200, height: 630, alt: "董星的 AI 产品案例作品集" }],
  },
};
```

- [ ] **Step 5: Replace global visual tokens and base interaction styles**

In `src/app/globals.css`, remove `.mesh-bg`, `.glass`, `.hero-gradient-text`, `.orb`, and old reveal rules. Define these tokens and base classes:

```css
@import "tailwindcss";

@theme inline {
  --color-background: #f5f7fb;
  --color-surface: #ffffff;
  --color-surface-muted: #eaf0f8;
  --color-foreground: #101b2c;
  --color-muted: #5c6778;
  --color-border: #d8e0eb;
  --color-accent: #315fdb;
  --font-sans: var(--font-geist-sans);
}

:root {
  color-scheme: light;
  scroll-behavior: smooth;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--color-background);
  color: var(--color-foreground);
  font-family: var(--font-sans), system-ui, sans-serif;
  text-rendering: optimizeLegibility;
}

.site-container {
  width: min(100% - 2rem, 80rem);
  margin-inline: auto;
}

.skip-link {
  position: fixed;
  left: 1rem;
  top: 1rem;
  z-index: 50;
  transform: translateY(-180%);
  background: #315fdb;
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 0.625rem;
}

.skip-link:focus { transform: translateY(0); }

a:focus-visible,
button:focus-visible {
  outline: 3px solid #315fdb;
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  :root { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Add focused shell styles for `.site-header`, `.site-nav`, `.site-nav-links`, `.site-wordmark`, `.site-footer`, and `.footer-inner`. Keep desktop navigation on one line and height at 72px or less.

- [ ] **Step 6: Run shell tests, lint, and type check**

Run:

```bash
npm test -- src/components/home-page.test.tsx
npm run lint
npm run typecheck
```

Expected: all commands exit 0.

- [ ] **Step 7: Commit the shell**

```bash
git add src/app/layout.tsx src/app/globals.css src/components/site-header.tsx src/components/home-page.test.tsx
git commit -m "feat: add bright portfolio shell"
```

---

### Task 4: Implement the asymmetric hero with real project imagery

**Files:**
- Create: `src/components/hero.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/home-page.test.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `portfolioCases: ProjectCase[]`.
- Produces: `Hero({ cases }: { cases: ProjectCase[] }): JSX.Element`.
- Produces: one primary CTA with label `查看案例` and target `#cases`.

- [ ] **Step 1: Add a failing hero behavior test**

Append to `src/components/home-page.test.tsx`:

```tsx
import Home from "@/app/page";

it("renders a concise recruiter-focused hero with one case CTA", () => {
  render(<Home />);
  expect(screen.getByRole("heading", { level: 1, name: "从问题定义，到结果验证。" })).toBeInTheDocument();
  expect(screen.getByText("AI 产品经理")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "查看案例" })).toHaveAttribute("href", "#cases");
  expect(screen.getAllByRole("link", { name: "查看案例" })).toHaveLength(1);
});
```

- [ ] **Step 2: Run the hero test and verify red**

Run:

```bash
npm test -- src/components/home-page.test.tsx
```

Expected: FAIL because the old hero uses different copy and hierarchy.

- [ ] **Step 3: Implement the hero component**

Create `src/components/hero.tsx`:

```tsx
import Image from "next/image";
import type { ProjectCase } from "@/content/portfolio";

export function Hero({ cases }: { cases: ProjectCase[] }) {
  const collage = [cases[0].media[0], cases[1].media[0], cases[2].media[0]];

  return (
    <section className="hero site-container" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="hero-kicker">AI 产品经理</p>
        <h1 id="hero-title">从问题定义，到结果验证。</h1>
        <p className="hero-summary">把 AI 能力接入真实工作流，用产品与数据持续验证价值。</p>
        <a className="primary-action" href="#cases">查看案例</a>
      </div>
      <div className="hero-collage" aria-label="个人项目界面预览">
        {collage.map((media, index) => (
          <figure className={`hero-shot hero-shot-${index + 1}`} key={media.src}>
            <Image src={media.src} alt={media.alt} width={media.width} height={media.height} priority={index === 0} />
          </figure>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Compose the hero from the page**

Replace the monolithic contents of `src/app/page.tsx` with the smallest initial composition:

```tsx
import { Hero } from "@/components/hero";
import { portfolioCases } from "@/content/portfolio";

export default function Home() {
  return <Hero cases={portfolioCases} />;
}
```

- [ ] **Step 5: Add hero layout styles**

Implement a two-column asymmetric grid at `min-width: 768px` and a strict single column below it. Required values:

```css
.hero {
  min-height: calc(100dvh - 4.5rem);
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(28rem, 1.1fr);
  align-items: center;
  gap: clamp(3rem, 7vw, 7rem);
  padding-block: clamp(4rem, 8vw, 7rem);
}

.hero h1 {
  max-width: 10ch;
  margin: 0;
  font-size: clamp(3.25rem, 7vw, 6.75rem);
  line-height: 0.94;
  letter-spacing: -0.065em;
  text-wrap: balance;
}

.hero-summary {
  max-width: 20rem;
  color: #5c6778;
  font-size: 1.05rem;
  line-height: 1.7;
}

.primary-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3rem;
  padding-inline: 1.25rem;
  border-radius: 0.625rem;
  background: #315fdb;
  color: white;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  transition: transform 180ms ease, background-color 180ms ease;
}

.primary-action:hover { background: #274eb7; transform: translateY(-2px); }
.primary-action:active { transform: translateY(1px); }

@media (max-width: 767px) {
  .hero { grid-template-columns: 1fr; min-height: auto; padding-block: 3.5rem 5rem; }
  .hero h1 { font-size: clamp(3rem, 15vw, 4.75rem); }
}
```

Use CSS Grid for the collage. Keep all three images visible, use 16px radii, reserve image aspect ratios, and avoid decorative labels over the images.

- [ ] **Step 6: Verify hero content and build**

Run:

```bash
npm test -- src/components/home-page.test.tsx
npm run build
```

Expected: tests pass and Next.js writes the static site to `out/`.

- [ ] **Step 7: Commit the hero**

```bash
git add src/components/hero.tsx src/app/page.tsx src/components/home-page.test.tsx src/app/globals.css
git commit -m "feat: add project-led portfolio hero"
```

---

### Task 5: Implement the four real case studies and project galleries

**Files:**
- Create: `src/components/case-study.tsx`
- Create: `src/components/featured-cases.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/home-page.test.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `ProjectCase` from `src/content/portfolio.ts`.
- Produces: `CaseStudy({ project, index }: { project: ProjectCase; index: number }): JSX.Element`.
- Produces: `FeaturedCases({ projects }: { projects: ProjectCase[] }): JSX.Element`.

- [ ] **Step 1: Add failing tests for complete cases, ordering, and links**

Append to `src/components/home-page.test.tsx`:

```tsx
it("renders the four approved cases in order with repository links", () => {
  render(<Home />);
  const headings = screen.getAllByRole("heading", { level: 3 }).map((node) => node.textContent);
  expect(headings).toEqual([
    "秋招网申助手",
    "面试复盘助手",
    "智能简历编辑工具",
    "智能会议纪要工具",
  ]);

  expect(screen.getByRole("link", { name: "查看秋招网申助手源码" })).toHaveAttribute(
    "href",
    "https://github.com/aurostars/Job-Application-Helper",
  );
  expect(screen.queryByText(/vedio-for-jiji/i)).not.toBeInTheDocument();
});

it("renders five workflow steps and real media for every case", () => {
  render(<Home />);
  for (const title of ["秋招网申助手", "面试复盘助手", "智能简历编辑工具", "智能会议纪要工具"]) {
    const article = screen.getByRole("article", { name: title });
    expect(article.querySelectorAll("[data-workflow-step]")).toHaveLength(5);
    expect(article.querySelectorAll("img").length).toBeGreaterThan(0);
  }
});
```

- [ ] **Step 2: Run the case tests and verify red**

Run:

```bash
npm test -- src/components/home-page.test.tsx
```

Expected: FAIL because `#cases` and case articles are not implemented.

- [ ] **Step 3: Implement `CaseStudy`**

Create `src/components/case-study.tsx`:

```tsx
import Image from "next/image";
import type { ProjectCase } from "@/content/portfolio";

export function CaseStudy({ project, index }: { project: ProjectCase; index: number }) {
  return (
    <article className={`case-study case-layout-${(index % 3) + 1}`} aria-label={project.title}>
      <header className="case-intro">
        <p className="case-descriptor">{project.descriptor}</p>
        <h3>{project.title}</h3>
        <p className="case-summary">{project.summary}</p>
        <div className="case-links">
          <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">
            查看{project.title}源码
          </a>
          {project.releaseUrl ? (
            <a href={project.releaseUrl} target="_blank" rel="noopener noreferrer">下载版本</a>
          ) : null}
        </div>
      </header>
      <div className="case-gallery">
        {project.media.map((media) => (
          <figure key={media.src}>
            <Image src={media.src} alt={media.alt} width={media.width} height={media.height} />
          </figure>
        ))}
      </div>
      <div className="case-detail-grid">
        <section>
          <h4>背景与目标</h4>
          <p>{project.background}</p>
          <p>{project.goal}</p>
        </section>
        <section>
          <h4>核心问题</h4>
          <ul>{project.userProblems.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      </div>
      <ol className="workflow" aria-label={`${project.title}工作流程`}>
        {project.workflow.map((step) => <li data-workflow-step key={step}>{step}</li>)}
      </ol>
      <ul className="case-highlights" aria-label={`${project.title}核心功能`}>
        {project.highlights.map((item) => <li key={item}>{item}</li>)}
      </ul>
      <p className="case-provenance">{project.provenance}</p>
    </article>
  );
}
```

- [ ] **Step 4: Implement `FeaturedCases` and compose it from the page**

Create `src/components/featured-cases.tsx`:

```tsx
import type { ProjectCase } from "@/content/portfolio";
import { CaseStudy } from "./case-study";

export function FeaturedCases({ projects }: { projects: ProjectCase[] }) {
  return (
    <section className="cases-section site-container" id="cases" aria-labelledby="cases-title">
      <header className="section-heading">
        <h2 id="cases-title">代表案例</h2>
        <p>从真实问题出发，记录产品判断、工作流程和可以验证的交付。</p>
      </header>
      <div className="case-list">
        {projects.map((project, index) => (
          <CaseStudy project={project} index={index} key={project.slug} />
        ))}
      </div>
    </section>
  );
}
```

Update `src/app/page.tsx`:

```tsx
import { FeaturedCases } from "@/components/featured-cases";
import { Hero } from "@/components/hero";
import { portfolioCases } from "@/content/portfolio";

export default function Home() {
  return (
    <>
      <Hero cases={portfolioCases} />
      <FeaturedCases projects={portfolioCases} />
    </>
  );
}
```

- [ ] **Step 5: Style three distinct case layouts and explicit mobile collapse**

Use one full-bleed lead layout, one two-column editorial layout, and one stacked gallery layout. Required constraints:

```css
.case-list { display: grid; gap: clamp(6rem, 11vw, 10rem); }
.case-study { display: grid; gap: 2rem; }
.case-study figure { margin: 0; overflow: hidden; border-radius: 1rem; background: #eaf0f8; }
.case-study img { display: block; width: 100%; height: auto; }
.case-detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2rem; }
.workflow { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 0.75rem; padding: 0; list-style: none; counter-reset: workflow; }
.workflow li { counter-increment: workflow; padding-top: 1rem; border-top: 1px solid #d8e0eb; }
.workflow li::before { content: counter(workflow, decimal-leading-zero); display: block; color: #315fdb; margin-bottom: 0.5rem; }

@media (max-width: 767px) {
  .case-detail-grid,
  .workflow { grid-template-columns: 1fr; }
  .case-study { width: 100%; }
}
```

Do not use a small uppercase eyebrow above every section. The only small category text inside each case is `project.descriptor`.

- [ ] **Step 6: Run case tests, lint, and build**

Run:

```bash
npm test -- src/components/home-page.test.tsx
npm run lint
npm run build
```

Expected: all commands exit 0 and the four cases appear in the approved order.

- [ ] **Step 7: Commit case studies**

```bash
git add src/components/case-study.tsx src/components/featured-cases.tsx src/app/page.tsx src/components/home-page.test.tsx src/app/globals.css
git commit -m "feat: add verified project case studies"
```

---

### Task 6: Add concise experience, education, capabilities, and contact

**Files:**
- Create: `src/components/experience-index.tsx`
- Create: `src/components/education-skills.tsx`
- Create: `src/components/contact.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/home-page.test.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `ExperienceItem[]`, `education: string[]`, `capabilities: string[]`, and `contact`.
- Produces: `ExperienceIndex`, `EducationSkills`, and `Contact` server components.

- [ ] **Step 1: Add failing tests for one-row experiences and contact restrictions**

Append to `src/components/home-page.test.tsx`:

```tsx
it("renders five concise experience rows", () => {
  render(<Home />);
  const section = screen.getByRole("region", { name: "经历" });
  expect(section.querySelectorAll("[data-experience-row]")).toHaveLength(5);
  expect(section.textContent).not.toContain("产品设计：");
});

it("limits contact to email and GitHub", () => {
  render(<Home />);
  const section = screen.getByRole("region", { name: "联系" });
  expect(section.querySelectorAll("a")).toHaveLength(2);
  expect(screen.getByRole("link", { name: "发送邮件" })).toHaveAttribute("href", "mailto:dongxing.123@bytedance.com");
  expect(screen.getByRole("link", { name: "访问 GitHub" })).toHaveAttribute("href", "https://github.com/aurostars");
  expect(section.querySelector("form")).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run the tests and verify red**

Run:

```bash
npm test -- src/components/home-page.test.tsx
```

Expected: FAIL because the three lower-page sections do not exist.

- [ ] **Step 3: Implement the three focused components**

Create `src/components/experience-index.tsx`:

```tsx
import type { ExperienceItem } from "@/content/portfolio";

export function ExperienceIndex({ items }: { items: ExperienceItem[] }) {
  return (
    <section className="experience-section site-container" id="experience" aria-label="经历">
      <h2>经历</h2>
      <div className="experience-list">
        {items.map((item) => (
          <article data-experience-row className="experience-row" key={`${item.organization}-${item.period}`}>
            <time>{item.period}</time>
            <strong>{item.organization}</strong>
            <span>{item.role}</span>
            <p>{item.highlight}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
```

Create `src/components/education-skills.tsx`:

```tsx
export function EducationSkills({ education, capabilities }: { education: string[]; capabilities: string[] }) {
  return (
    <section className="education-section site-container" aria-labelledby="education-title">
      <h2 id="education-title">教育与能力</h2>
      <div className="education-grid">
        <div>{education.map((item) => <p key={item}>{item}</p>)}</div>
        <ul>{capabilities.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
    </section>
  );
}
```

Create `src/components/contact.tsx`:

```tsx
export function Contact({ email, github }: { email: string; github: string }) {
  return (
    <section className="contact-section site-container" id="contact" aria-label="联系">
      <h2>讨论 AI 产品机会</h2>
      <div className="contact-links">
        <a href={`mailto:${email}`}>发送邮件</a>
        <a href={github} target="_blank" rel="noopener noreferrer">访问 GitHub</a>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Compose the lower-page sections**

Update `src/app/page.tsx` to render, in order, `Hero`, `FeaturedCases`, `ExperienceIndex`, `EducationSkills`, and `Contact`. Pass data directly from `src/content/portfolio.ts`.

- [ ] **Step 5: Add responsive one-row experience styling**

Use a four-column desktop row and a stacked mobile row:

```css
.experience-row {
  display: grid;
  grid-template-columns: 10rem 1.1fr 1fr 2fr;
  gap: 1.5rem;
  align-items: baseline;
  padding-block: 1.25rem;
  border-bottom: 1px solid #d8e0eb;
}

.experience-row p { margin: 0; color: #5c6778; }
.contact-links { display: flex; flex-wrap: wrap; gap: 0.75rem; }

@media (max-width: 767px) {
  .experience-row { grid-template-columns: 1fr; gap: 0.35rem; }
  .education-grid { grid-template-columns: 1fr; }
}
```

- [ ] **Step 6: Run all component tests and build**

Run:

```bash
npm test
npm run build
```

Expected: all tests pass and the static export succeeds.

- [ ] **Step 7: Commit the complete content structure**

```bash
git add src/components/experience-index.tsx src/components/education-skills.tsx src/components/contact.tsx src/app/page.tsx src/components/home-page.test.tsx src/app/globals.css
git commit -m "feat: add concise resume and contact sections"
```

---

### Task 7: Replace the old animation utility with an accessible reveal system

**Files:**
- Create: `src/components/reveal.tsx`
- Create: `src/components/reveal.test.tsx`
- Modify: `src/components/hero.tsx`
- Modify: `src/components/case-study.tsx`
- Modify: `src/app/globals.css`
- Delete: `src/components/animate.tsx`

**Interfaces:**
- Produces: `Reveal({ children, delay?, className? }): JSX.Element`.
- `delay` is milliseconds and is clamped to `0-360`.
- The component adds `data-visible="true"` once and disconnects its observer.

- [ ] **Step 1: Write failing reveal tests**

Create `src/components/reveal.test.tsx`:

```tsx
import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Reveal } from "./reveal";

afterEach(() => vi.useRealTimers());

describe("Reveal", () => {
  it("becomes visible when intersecting and disconnects", () => {
    vi.useFakeTimers();
    const disconnect = vi.fn();
    let callback: IntersectionObserverCallback = () => undefined;
    vi.stubGlobal("IntersectionObserver", class {
      constructor(next: IntersectionObserverCallback) { callback = next; }
      observe = vi.fn();
      disconnect = disconnect;
      unobserve = vi.fn();
      root = null;
      rootMargin = "0px";
      thresholds = [0.1];
      takeRecords = () => [];
    });

    render(<Reveal delay={80}><span>案例内容</span></Reveal>);
    callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    act(() => vi.advanceTimersByTime(80));

    expect(screen.getByText("案例内容").parentElement).toHaveAttribute("data-visible", "true");
    expect(disconnect).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the reveal test and verify red**

Run:

```bash
npm test -- src/components/reveal.test.tsx
```

Expected: FAIL because `src/components/reveal.tsx` does not exist.

- [ ] **Step 3: Implement `Reveal` with cleanup**

Create `src/components/reveal.tsx`:

```tsx
"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const safeDelay = Math.min(360, Math.max(0, delay));
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      timer = setTimeout(() => setVisible(true), safeDelay);
      observer.disconnect();
    }, { threshold: 0.1 });

    observer.observe(element);
    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [delay]);

  return <div ref={ref} className={`reveal ${className}`} data-visible={visible}>{children}</div>;
}
```

- [ ] **Step 4: Apply reveal only where it communicates hierarchy**

Wrap the hero copy once, the hero collage once, each case heading once, and each case gallery once. Do not wrap every list row or button. Delete `src/components/animate.tsx` after all imports are removed.

- [ ] **Step 5: Add transform and opacity-only reveal styles**

```css
.reveal {
  opacity: 0;
  transform: translateY(1.5rem);
  transition: opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), transform 600ms cubic-bezier(0.16, 1, 0.3, 1);
}

.reveal[data-visible="true"] {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1; transform: none; transition: none; }
}
```

- [ ] **Step 6: Run focused and full verification**

Run:

```bash
npm test -- src/components/reveal.test.tsx
npm test
npm run lint
npm run typecheck
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 7: Commit accessible motion**

```bash
git add src/components/reveal.tsx src/components/reveal.test.tsx src/components/hero.tsx src/components/case-study.tsx src/components/animate.tsx src/app/globals.css
git commit -m "feat: add accessible content reveals"
```

---

### Task 8: Add deployment gates, social preview, and final pre-flight validation

**Files:**
- Modify: `.github/workflows/deploy.yml`
- Create: `public/og-portfolio.png`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/home-page.test.tsx`

**Interfaces:**
- Consumes: the final static homepage and `public/og-portfolio.png`.
- Produces: CI gates for test, lint, type check, and build before deployment.

- [ ] **Step 1: Add a failing metadata asset test**

Append to `src/components/home-page.test.tsx`:

```tsx
import fs from "node:fs";
import path from "node:path";

it("ships the social preview image referenced by metadata", () => {
  const ogImage = path.join(process.cwd(), "public", "og-portfolio.png");
  expect(fs.existsSync(ogImage)).toBe(true);
  expect(fs.statSync(ogImage).size).toBeGreaterThan(10_000);
});
```

- [ ] **Step 2: Run the test and verify red**

Run:

```bash
npm test -- src/components/home-page.test.tsx
```

Expected: FAIL because `public/og-portfolio.png` does not exist.

- [ ] **Step 3: Capture the social preview from the real final page**

Run:

```bash
npm run build
npx serve out -l 4173
```

Use the AIME browser capability to capture a 1200x630 crop of the real hero and first project composition. Save it as `public/og-portfolio.png`. Do not generate an unrelated illustration.

- [ ] **Step 4: Add CI quality gates before the existing build step**

Update `.github/workflows/deploy.yml` so the build job runs in this order:

```yaml
      - run: npm ci
      - run: npm test
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run build
```

Do not change branch triggers, permissions, artifact path, or deployment action versions.

- [ ] **Step 5: Run the complete automated verification matrix**

Run:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

Expected: every command exits 0, `out/index.html` exists, and no warnings indicate missing images or invalid links.

- [ ] **Step 6: Run the visual and accessibility pre-flight**

Serve `out/` and inspect at widths 1440, 1024, 768, 390, and 320. Verify all of the following:

```text
Hero headline is at most two lines on desktop.
Hero CTA is visible in the first viewport.
Desktop navigation stays on one line and under 80px high.
All four cases contain real images and five workflow steps.
No three case sections reuse the same composition consecutively.
Every multi-column section becomes one column below 768px.
No horizontal overflow exists at 320px.
Every link is keyboard reachable with a visible focus state.
Reduced-motion mode removes reveal transitions without hiding content.
Button text never wraps on desktop.
There is no em-dash, en-dash, purple glow, dark section, fake metric, or broken image.
Contact contains exactly email and GitHub.
```

- [ ] **Step 7: Run Lighthouse against the production export**

Run Lighthouse for performance, accessibility, best practices, and SEO against the locally served `out/` site. Record the result in the implementation session notes. Fix any accessibility failure and any Core Web Vitals regression before committing.

Target thresholds:

```text
Performance >= 90
Accessibility >= 95
Best Practices >= 95
SEO >= 95
CLS < 0.1
LCP < 2.5s on desktop simulation
```

- [ ] **Step 8: Commit release readiness changes**

```bash
git add .github/workflows/deploy.yml public/og-portfolio.png src/app/layout.tsx src/components/home-page.test.tsx
git commit -m "ci: gate portfolio deployment on quality checks"
```

- [ ] **Step 9: Verify the branch is clean and review the full diff**

Run:

```bash
git status --short
git diff main...HEAD --stat
git log --oneline --decorate main..HEAD
```

Expected: empty status output, only planned portfolio files in the diff, and one focused commit per task.
